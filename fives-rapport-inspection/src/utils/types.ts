export type Step = 'productSelection' | 'productForm';

export type View = 'draftSelection' | 'form';

export type ProductQuestion = {
  id: string;
  label: string;
  helper?: string;
  type: 'text' | 'textarea';
};

export type ProductDefinition = {
  id: string;
  name: string;
  reference?: string;
  description: string;
  questions: ProductQuestion[];
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

export type DraftSelectionProps = {
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
  step: Step;
  products: ProductDefinition[];
  selectedProduct: ProductDefinition | null;
  onSelectProduct: (product: ProductDefinition) => void;
  onReturnToDrafts: () => void;
  currentAnswers: Record<string, string>;
  onAnswerChange: (questionId: string, value: string) => void;
  saveProductAnswers: (returnToSelection: boolean) => Promise<void> | void;
  onSaveDraft: () => Promise<void> | void;
  activeEntryIndex: number | null;
  completedEntries: CompletedEntry[];
  onEditEntry: (index: number) => void;
  onDeleteEntry: (index: number) => void;
  canPersistDrafts: boolean;
  hasPendingEntry: boolean;
  isSavingDraft: boolean;
};

