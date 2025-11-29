import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { getProductCatalog } from '../utils/productData';
import type { ProductDefinition } from '../utils/types';

export const useProductCatalog = (): ProductDefinition[] => {
  const { i18n } = useTranslation();
  
  return useMemo(() => {
    return getProductCatalog();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [i18n.language]);
};

