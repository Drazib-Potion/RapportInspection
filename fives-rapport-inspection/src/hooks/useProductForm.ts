import { useState, useCallback } from 'react';
import { PRODUCT_CATALOG } from '../utils/productData';
import type { ProductDefinition, CompletedEntry } from '../utils/types';

const createQuestionDefaults = (product: ProductDefinition) => {
  const allQuestions = [
    ...(product.tableQuestions ?? []),
    ...(product.normalQuestions ?? [])
  ];
  return allQuestions.reduce<Record<string, string>>((acc, question) => {
    acc[question.id] = '';
    return acc;
  }, {});
};

export const useProductForm = () => {
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [currentAnswers, setCurrentAnswers] = useState<Record<string, string>>({});
  const [activeEntryIndex, setActiveEntryIndex] = useState<number | null>(null);
  const [completedEntries, setCompletedEntries] = useState<CompletedEntry[]>([]);

  const selectedProduct = PRODUCT_CATALOG.find(
    (product) => product.id === selectedProductId
  ) || null;

  const resetFormState = useCallback(() => {
    setSelectedProductId(null);
    setCurrentAnswers({});
    setActiveEntryIndex(null);
  }, []);

  const selectProduct = useCallback((product: ProductDefinition) => {
    setSelectedProductId(product.id);
    setCurrentAnswers(createQuestionDefaults(product));
    setActiveEntryIndex(null);
  }, []);

  const buildEntriesWithCurrent = useCallback((): CompletedEntry[] => {
    if (!selectedProduct) {
      return completedEntries;
    }

    const entry: CompletedEntry = {
      product: selectedProduct,
      answers: currentAnswers
    };

    if (activeEntryIndex === null) {
      return [...completedEntries, entry];
    }

    return completedEntries.map((existingEntry, index) =>
      index === activeEntryIndex ? entry : existingEntry
    );
  }, [selectedProduct, currentAnswers, completedEntries, activeEntryIndex]);

  const editEntry = useCallback((index: number) => {
    const entry = completedEntries[index];
    setSelectedProductId(entry.product.id);
    setCurrentAnswers({ ...entry.answers });
    setActiveEntryIndex(index);
  }, [completedEntries]);

  const deleteEntry = useCallback((index: number) => {
    setCompletedEntries((prev) => prev.filter((_, idx) => idx !== index));
    setActiveEntryIndex(null);
  }, []);

  const answerChange = useCallback((questionId: string, value: string) => {
    setCurrentAnswers((prev) => ({ ...prev, [questionId]: value }));
  }, []);

  return {
    selectedProductId,
    setSelectedProductId,
    selectedProduct,
    currentAnswers,
    setCurrentAnswers,
    activeEntryIndex,
    setActiveEntryIndex,
    completedEntries,
    setCompletedEntries,
    resetFormState,
    selectProduct,
    buildEntriesWithCurrent,
    editEntry,
    deleteEntry,
    answerChange,
  };
};

