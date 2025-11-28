import { app, BrowserWindow, dialog, ipcMain } from 'electron';
import path from 'path';
import { promises as fs } from 'node:fs';

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
  
  // Open DevTools in development mode
  if (process.env.ELECTRON_START_URL || !app.isPackaged) {
    mainWindow.webContents.openDevTools();
  }
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

