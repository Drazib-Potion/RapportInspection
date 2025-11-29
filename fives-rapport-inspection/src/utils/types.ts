export type Step = 'productSelection' | 'productForm';

export type ChoiceOption = {
  value: string;
  label: string;
};

export type ProductQuestion = {
  id: string;
  label: string;
  helper?: string;
  type: 'text' | 'textarea' | 'checkbox' | 'choice';
  options?: ChoiceOption[]; // Pour type 'choice', 3 options attendues
  unit?: string; // Unité pour les questions de tableau (ex: 'mm', 'nbre', '*')
};

export type TableRow = {
  identifier: string;
  unit: string; // Unité pour cet identifiant
  valeur: { id: string; helper?: string };
  nombre_mesure: { id: string; helper?: string };
  tolerance_plus: { id: string; helper?: string };
  tolerance_moins: { id: string; helper?: string };
  cote_nominal: { id: string; helper?: string };
  deviation: { id: string; helper?: string };
  type: { id: string; helper?: string };
  ref: { id: string; helper?: string };
  date_etalonnage: { id: string; helper?: string };
};

export type ProductDefinition = {
  id: string;
  name: string;
  reference?: string;
  description: string;
  tableQuestions?: ProductQuestion[];
  normalQuestions?: ProductQuestion[];
  imagePath?: string;
};

export type CompletedEntry = {
  product: ProductDefinition;
  answers: Record<string, string>;
};

export type DraftSummary = {
  id: string;
  fileName: string;
  updatedAt: number;
  affaireName: string;
  productCount: number;
};

export type DraftPayload = {
  affaireName: string;
  draftName: string;
  entries: CompletedEntry[];
};

export type DraftData = DraftPayload & {
  savedAt?: string;
};

export type ElectronBridge = {
  chooseDraftsFolder: () => Promise<string | null>;
  saveDraft: (directory: string, payload: DraftPayload, overwrite?: boolean) => Promise<string>;
  listDrafts: (directory: string) => Promise<DraftSummary[]>;
  loadDraft: (filePath: string) => Promise<DraftData>;
  deleteDraft: (filePath: string) => Promise<boolean>;
  exportExcel?: (affaireName: string, answers: unknown[]) => Promise<unknown>;
};

export type OverwritePrompt = {
  entries: CompletedEntry[];
  draftName: string;
};

export type DraftNamePrompt = {
  entries: CompletedEntry[];
  defaultName: string;
};

export type MainMenuProps = {
  affaireName: string;
  onAffaireNameChange: (value: string) => void;
  canStart: boolean;
  startButtonLabel: string;
  onStartInspection: () => void;
  onRestart: () => void;
  onSaveDraft: () => void;
  completedEntries: CompletedEntry[];
  onEditEntry: (index: number) => void;
  summaryForEntry: (entry: CompletedEntry) => string;
  draftsDirectory: string | null;
  drafts: DraftSummary[];
  draftsLoading: boolean;
  draftsError: string | null;
  electronAvailable: boolean;
  onChooseDraftsFolder: () => void;
  onClearDraftsDirectory: () => void;
  onLoadDraft: (id: string) => void;
  onDeleteDraft: (id: string) => void;
};

export type FormEditProps = {
  selectedProduct: ProductDefinition | null;
  onReturnToDrafts: () => void;
  currentAnswers: Record<string, string>;
  onAnswerChange: (questionId: string, value: string) => void;
  activeEntryIndex: number | null;
  onDeleteEntry: (index: number) => void;
};

