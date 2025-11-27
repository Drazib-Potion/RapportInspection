export type ProductSummary = {
  id: string;
  name: string;
  reference?: string;
};

export type ProductFormValues = {
  length: string;
  width: string;
  depth: string;
  observation: string;
  status: string;
};

export type DraftRecord = {
  affaireName: string;
  forms: Record<string, ProductFormValues>;
};

export type ExportAnswer = {
  productId: string;
  productName: string;
  length: string;
  width: string;
  depth: string;
  observation: string;
  status: string;
};

export interface ElectronApi {
  saveDraft(
    affaireName: string,
    forms: Record<string, ProductFormValues>
  ): Promise<{ success: true } | { success: false; message?: string }>;
  loadDraft(affaireName: string): Promise<DraftRecord | null>;
  exportExcel(
    affaireName: string,
    answers: ExportAnswer[]
  ): Promise<{ success: boolean; message?: string }>;
}

declare global {
  interface Window {
    electron?: ElectronApi;
  }
}

export {};

