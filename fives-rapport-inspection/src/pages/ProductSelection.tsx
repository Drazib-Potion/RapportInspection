import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../contexts/AppContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useProductCatalog } from '../hooks/useProductCatalog';

const ProductSelection: React.FC = () => {
  const navigate = useNavigate();
  const { selectProduct, handleReturnToMenu } = useAppContext();
  const { t } = useLanguage();
  const productCatalog = useProductCatalog();

  const handleSelectProduct = (productId: string) => {
    const product = productCatalog.find(p => p.id === productId);
    if (product) {
      selectProduct(product);
      navigate(`/form/${product.id}`);
    }
  };

  return (
    <section>
      <div className="actions-row" style={{ marginBottom: '1.5rem', justifyContent: 'flex-start' }}>
        <button className="secondary-btn" onClick={handleReturnToMenu}>
          {t('productSelection.backToMenu')}
        </button>
      </div>
      <div className="product-grid">
        {productCatalog.map((product) => (
          <article key={product.id} className="product-card">
            <div className="product-header">
              <div>
                <h3>{product.name}</h3>
                <p className="muted">{product.description}</p>
                {product.reference && (
                  <p className="product-reference">{product.reference}</p>
                )}
              </div>
            </div>
            <div className="field-group">
              {/* <p>
                {t('productSelection.questionsToAnswer')} <strong>{
                  (product.tableQuestions?.length ?? 0) + 
                  (product.normalQuestions?.length ?? 0)
                }</strong>
              </p> */}
            </div>
            <button className="primary-btn" onClick={() => handleSelectProduct(product.id)}>
              {t('productSelection.chooseProduct')}
            </button>
          </article>
        ))}
      </div>
    </section>
  );
};

export default ProductSelection;
