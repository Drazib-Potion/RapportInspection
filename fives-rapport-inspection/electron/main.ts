import { app, BrowserWindow, dialog, ipcMain } from 'electron';
import path from 'path';
import { promises as fs } from 'node:fs';
import { createWriteStream } from 'node:fs';
import PDFDocument from 'pdfkit';

// Définir le nom de l'application
app.setName('Rapport d\'Inspection Fives');

function getStartURL() {
  if (process.env.ELECTRON_START_URL) {
    return process.env.ELECTRON_START_URL;
  }

  const indexPath = path.join(__dirname, '..', '..', 'build', 'index.html');
  return `file://${indexPath}`;
}

function getIconPath() {
  // En développement, le fichier est dans public/
  if (process.env.ELECTRON_START_URL) {
    return path.join(__dirname, '..', '..', 'public', 'favicon.png');
  }
  // En production, le fichier est copié dans build/
  return path.join(__dirname, '..', '..', 'build', 'favicon.png');
}

function createMainWindow() {
  const iconPath = getIconPath();
  
  const mainWindow = new BrowserWindow({
    width: 1024,
    height: 768,
    minWidth: 1000,
    minHeight: 700,
    icon: iconPath,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  mainWindow.loadURL(getStartURL());
}

app.whenReady().then(() => {
  // Définir l'icône du dock sur macOS
  if (process.platform === 'darwin' && app.dock) {
    const iconPath = getIconPath();
    app.dock.setIcon(iconPath);
  }
  
  createMainWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createMainWindow();
  }
});

const slugify = (value: string) =>
  value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/gi, '-')
    .replace(/^-+|-+$/g, '') || 'rapport';

const ensureDirectory = async (directoryPath: string) => {
  await fs.mkdir(directoryPath, { recursive: true });
};

const resolveDraftPath = (directory: string, slug: string) =>
  path.join(directory, `${slug}.json`);

// Fonction helper pour dessiner un tableau dans PDFKit
const drawTable = (
  doc: PDFKit.PDFDocument,
  startX: number,
  startY: number,
  headers: string[],
  rows: string[][],
  columnWidths: number[]
): number => {
  const rowHeight = 20;
  const headerHeight = 30;
  const fontSize = 8;
  const headerFontSize = 7;
  const pageHeight = doc.page.height;
  const bottomMargin = 50;
  const maxY = pageHeight - bottomMargin;
  
  let currentY = startY;
  let headerDrawnOnCurrentPage = false;
  
  // Fonction pour dessiner les en-têtes
  const drawHeaders = (y: number) => {
    let currentX = startX;
    doc.fontSize(headerFontSize).font('Helvetica-Bold');
    doc.rect(startX, y, columnWidths.reduce((a, b) => a + b, 0), headerHeight).stroke();
    
    headers.forEach((header, i) => {
      doc.rect(currentX, y, columnWidths[i], headerHeight).stroke();
      
      // Diviser le texte en plusieurs lignes si nécessaire
      const words = header.split(' ');
      const lines: string[] = [];
      let currentLine = '';
      
      words.forEach((word) => {
        const testLine = currentLine ? `${currentLine} ${word}` : word;
        doc.fontSize(headerFontSize);
        const textWidth = doc.widthOfString(testLine);
        
        if (textWidth <= columnWidths[i] - 4 && currentLine) {
          currentLine = testLine;
        } else {
          if (currentLine) {
            lines.push(currentLine);
          }
          currentLine = word;
        }
      });
      if (currentLine) {
        lines.push(currentLine);
      }
      
      // Afficher les lignes centrées verticalement
      const lineHeight = headerFontSize + 2;
      const totalTextHeight = lines.length * lineHeight;
      const startTextY = y + (headerHeight - totalTextHeight) / 2;
      
      lines.forEach((line, lineIndex) => {
        doc.text(line, currentX + 2, startTextY + lineIndex * lineHeight, {
          width: columnWidths[i] - 4,
          align: 'center',
          ellipsis: false
        });
      });
      
      currentX += columnWidths[i];
    });
  };
  
  // Dessiner les en-têtes sur la première page
  drawHeaders(currentY);
  currentY += headerHeight;
  headerDrawnOnCurrentPage = true;
  
  // Dessiner les lignes de données
  rows.forEach((row) => {
    // Vérifier si on doit ajouter une nouvelle page
    if (currentY + rowHeight > maxY) {
      doc.addPage();
      currentY = 50; // Marge supérieure
      headerDrawnOnCurrentPage = false;
    }
    
    // Dessiner les en-têtes si c'est une nouvelle page
    if (!headerDrawnOnCurrentPage) {
      drawHeaders(currentY);
      currentY += headerHeight;
      headerDrawnOnCurrentPage = true;
    }
    
    // Dessiner la ligne de données
    let currentX = startX;
    doc.fontSize(fontSize).font('Helvetica');
    doc.rect(startX, currentY, columnWidths.reduce((a, b) => a + b, 0), rowHeight).stroke();
    
    row.forEach((cell, i) => {
      doc.rect(currentX, currentY, columnWidths[i], rowHeight).stroke();
      doc.text(cell || '?', currentX + 3, currentY + 5, {
        width: columnWidths[i] - 6,
        align: 'left',
        ellipsis: true
      });
      currentX += columnWidths[i];
    });
    
    currentY += rowHeight;
  });
  
  return currentY;
};

ipcMain.handle('choose-drafts-folder', async () => {
  const result = await dialog.showOpenDialog({
    properties: ['openDirectory', 'createDirectory']
  });

  if (result.canceled || result.filePaths.length === 0) {
    return null;
  }

  return result.filePaths[0];
});

ipcMain.handle(
  'save-draft',
  async (
    _event,
    {
      directory,
      payload,
      overwrite
    }: {
      directory: string;
      payload: { affaireName: string; draftName: string; entries: unknown };
      overwrite?: boolean;
    }
  ) => {
    if (!directory) {
      throw new Error('Aucun dossier de brouillons sélectionné.');
    }

    await ensureDirectory(directory);

    const slug = slugify(payload.draftName);
    const filePath = resolveDraftPath(directory, slug);

    if (!overwrite) {
      try {
        await fs.access(filePath);
        const error = new Error('EXISTS');
        (error as Error & { code?: string }).code = 'DRAFT_EXISTS';
        throw error;
      } catch (accessErr) {
        if ((accessErr as NodeJS.ErrnoException).code !== 'ENOENT') {
          throw accessErr;
        }
      }
    }

    const data = {
      ...payload,
      savedAt: new Date().toISOString()
    };

    await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
    return filePath;
  }
);

ipcMain.handle('list-drafts', async (_event, directory: string) => {
  if (!directory) {
    return [];
  }

  try {
    await ensureDirectory(directory);
    const files = await fs.readdir(directory);
    const draftFiles = files.filter((file) => file.endsWith('.json'));

    const drafts = await Promise.all(
      draftFiles.map(async (fileName) => {
        const filePath = path.join(directory, fileName);
        const [stat, content] = await Promise.all([
          fs.stat(filePath),
          fs.readFile(filePath, 'utf-8')
        ]);

        let data: Record<string, unknown> = {};
        try {
          data = JSON.parse(content);
        } catch {
          // ignore malformed drafts but keep metadata
        }

        return {
          id: filePath,
          fileName,
          updatedAt: stat.mtimeMs,
          affaireName: typeof (data as { draftName?: string }).draftName === 'string' 
            ? (data as { draftName: string }).draftName 
            : (typeof data.affaireName === 'string' ? data.affaireName : fileName.replace('.json', '')),
          productCount: Array.isArray((data as { entries?: unknown }).entries)
            ? ((data as { entries: unknown[] }).entries.length || 0)
            : 0
        };
      })
    );

    return drafts.sort((a, b) => b.updatedAt - a.updatedAt);
  } catch (error) {
    console.error('Erreur lors du listing des brouillons', error);
    throw error;
  }
});

ipcMain.handle('load-draft', async (_event, filePath: string) => {
  if (!filePath) {
    throw new Error('Chemin de brouillon manquant.');
  }

  const content = await fs.readFile(filePath, 'utf-8');
  return JSON.parse(content);
});

ipcMain.handle('delete-draft', async (_event, filePath: string) => {
  if (!filePath) {
    throw new Error('Chemin de brouillon manquant.');
  }

  try {
    await fs.unlink(filePath);
    return true;
  } catch (error) {
    console.error('Erreur lors de la suppression du brouillon', error);
    throw new Error('Impossible de supprimer le brouillon.');
  }
});

interface ExportPDFData {
  affaireName: string;
  controleIntermediaire?: boolean;
  controleFinal?: boolean;
  entries: Array<{
    product: {
      id: string;
      name: string;
      reference?: string;
      description: string;
      tableQuestions?: Array<{
        id: string;
        label: string;
        unit?: string;
      }>;
      normalQuestions?: Array<{
        id: string;
        label: string;
        type: string;
        options?: Array<{ value: string; label: string }>;
      }>;
    };
    answers: Record<string, string>;
  }>;
}

ipcMain.handle('export-pdf', async (_event, data: ExportPDFData) => {
  const mainWindow = BrowserWindow.getAllWindows()[0];
  if (!mainWindow) {
    throw new Error('Aucune fenêtre disponible.');
  }

  // Demander où sauvegarder le PDF
  const result = await dialog.showSaveDialog(mainWindow, {
    title: 'Enregistrer le rapport PDF',
    defaultPath: `${slugify(data.affaireName || 'rapport')}.pdf`,
    filters: [
      { name: 'PDF', extensions: ['pdf'] }
    ]
  });

  if (result.canceled || !result.filePath) {
    return null;
  }

  const filePath = result.filePath;

  // Créer le PDF
  return new Promise<string>((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const stream = createWriteStream(filePath);
    doc.pipe(stream);

    // En-tête
    doc.fontSize(20).font('Helvetica-Bold').text('RAPPORT D\'INSPECTION', { align: 'center' });
    doc.moveDown(1);

    // Informations de l'affaire
    doc.fontSize(16).font('Helvetica-Bold').text('Informations de l\'affaire', { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(12).font('Helvetica').text(`Nom de l'affaire: ${data.affaireName || 'Non spécifié'}`);
    doc.moveDown(0.3);
    
    const controleType = data.controleFinal 
      ? 'Contrôle final' 
      : data.controleIntermediaire 
        ? 'Contrôle intermédiaire' 
        : 'Non spécifié';
    doc.text(`Type de contrôle: ${controleType}`);
    doc.moveDown(1);

    // Produits inspectés
    if (data.entries && data.entries.length > 0) {
      doc.fontSize(16).font('Helvetica-Bold').text('Produits inspectés', { underline: true });
      doc.moveDown(0.5);

      data.entries.forEach((entry, index) => {
        // Nouvelle page si nécessaire (sauf pour le premier produit)
        if (index > 0) {
          doc.addPage();
        }

        // Nom du produit
        doc.fontSize(14).font('Helvetica-Bold').text(`${index + 1}. ${entry.product.name}`);
        if (entry.product.reference) {
          doc.fontSize(11).font('Helvetica').text(`Référence: ${entry.product.reference}`);
        }
        doc.moveDown(0.5);

        // Description
        if (entry.product.description) {
          doc.fontSize(11).font('Helvetica-Oblique').text(entry.product.description);
          doc.moveDown(0.5);
        }

        // Questions normales
        if (entry.product.normalQuestions && entry.product.normalQuestions.length > 0) {
          doc.fontSize(12).font('Helvetica-Bold').text('Questions générales:', { underline: true });
          doc.moveDown(0.3);
          
          entry.product.normalQuestions.forEach((question) => {
            const answer = entry.answers[question.id];
            const displayAnswer = answer && answer.trim() ? answer : '?';
            doc.fontSize(10).font('Helvetica').text(`• ${question.label}: ${displayAnswer}`, {
              indent: 20,
              continued: false
            });
          });
          doc.moveDown(0.5);
        }

        // Questions de tableau
        if (entry.product.tableQuestions && entry.product.tableQuestions.length > 0) {
          doc.fontSize(12).font('Helvetica-Bold').text('Mesures:', { underline: true });
          doc.moveDown(0.5);

          // Parser les questions de tableau pour créer les lignes
          const TABLE_FIELDS = [
            'valeur',
            'nombre_mesure',
            'tolerance_plus',
            'tolerance_moins',
            'cote_nominal',
            'deviation',
            'type',
            'ref',
            'date_etalonnage'
          ];

          const rowsMap = new Map<string, {
            identifier: string;
            unit: string;
            fields: Record<string, { id: string; value: string; unit?: string }>;
          }>();

          entry.product.tableQuestions.forEach((question) => {
            const parts = question.id.split('_');
            if (parts.length < 2) return;
            
            const field = parts.slice(1).join('_');
            if (!TABLE_FIELDS.includes(field)) return;
            
            const identifier = parts[0];
            if (!rowsMap.has(identifier)) {
              rowsMap.set(identifier, {
                identifier,
                unit: question.unit || 'mm',
                fields: {}
              });
            }
            
            const row = rowsMap.get(identifier)!;
            const answer = entry.answers[question.id];
            const displayAnswer = answer && answer.trim() ? answer : '?';
            
            row.fields[field] = {
              id: question.id,
              value: displayAnswer,
              unit: question.unit
            };
            
            // Si c'est la question "valeur" et qu'elle a une unité définie, l'utiliser
            if (field === 'valeur' && question.unit) {
              row.unit = question.unit;
            }
          });

          // Convertir en tableau et trier
          const rows = Array.from(rowsMap.values());
          rows.sort((a, b) => {
            const aMatch = a.identifier.match(/^([A-Z]+)(\d+)$/);
            const bMatch = b.identifier.match(/^([A-Z]+)(\d+)$/);
            
            if (aMatch && bMatch) {
              const aPrefix = aMatch[1];
              const bPrefix = bMatch[1];
              const aNum = parseInt(aMatch[2], 10);
              const bNum = parseInt(bMatch[2], 10);
              
              if (aPrefix !== bPrefix) {
                return aPrefix.localeCompare(bPrefix);
              }
              return aNum - bNum;
            }
            
            return a.identifier.localeCompare(b.identifier);
          });

          // Préparer les en-têtes et les données pour le tableau
          const headers = [
            'Identifiant',
            'Cotes relevée / Measure',
            'Unité / unit',
            'Nombre de mesure(s)',
            'Tolérance +',
            'Tolérance -',
            'Cote nominale',
            'Deviation',
            'Type',
            'Réf',
            'date de validité de l\'étalonnage'
          ];

          const tableRows: string[][] = rows.map((row) => {
            const valeur = row.fields.valeur?.value || '?';
            const valeurWithUnit = valeur !== '?' && row.fields.valeur?.unit 
              ? `${valeur} ${row.fields.valeur.unit}` 
              : valeur;
            
            return [
              row.identifier,
              valeurWithUnit,
              row.unit,
              row.fields.nombre_mesure?.value || '?',
              row.fields.tolerance_plus?.value || '?',
              row.fields.tolerance_moins?.value || '?',
              row.fields.cote_nominal?.value || '?',
              row.fields.deviation?.value || '?',
              row.fields.type?.value || '?',
              row.fields.ref?.value || '?',
              row.fields.date_etalonnage?.value || '?'
            ];
          });

          // Largeurs des colonnes (ajustées pour tenir sur la page)
          const pageWidth = doc.page.width - 100; // Marges
          const columnWidths = [
            45,   // Identifiant
            65,   // Cotes relevée
            38,   // Unité
            55,   // Nombre de mesure
            45,   // Tolérance +
            45,   // Tolérance -
            55,   // Cote nominale
            45,   // Deviation
            50,   // Type
            40,   // Réf
            75    // date de validité
          ];

          // Ajuster les largeurs si nécessaire pour tenir sur la page
          const totalWidth = columnWidths.reduce((a, b) => a + b, 0);
          if (totalWidth > pageWidth) {
            const ratio = pageWidth / totalWidth;
            columnWidths.forEach((width, i) => {
              columnWidths[i] = Math.floor(width * ratio);
            });
          }

          // Dessiner le tableau
          const tableY = doc.y;
          const finalY = drawTable(doc, 50, tableY, headers, tableRows, columnWidths);
          doc.y = finalY + 10;
        }

        doc.moveDown(1);
      });
    } else {
      doc.fontSize(12).font('Helvetica').text('Aucun produit inspecté.', { align: 'center' });
    }

    doc.end();

    stream.on('finish', () => {
      resolve(filePath);
    });

    stream.on('error', (error) => {
      reject(error);
    });
  });
});

