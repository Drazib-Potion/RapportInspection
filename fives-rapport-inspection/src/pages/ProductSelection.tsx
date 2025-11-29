import React from 'react';
import { useNavigate } from 'react-router-dom';
import type { ProductDefinition } from '../utils/types';

type ProductSelectionProps = {
  products: ProductDefinition[];
  onSelectProduct: (product: ProductDefinition) => void;
  onReturnToDrafts: () => void;
};

const ProductSelection: React.FC<ProductSelectionProps> = ({
  products,
  onSelectProduct,
  onReturnToDrafts
}) => {
  const navigate = useNavigate();

  const handleSelectProduct = (product: ProductDefinition) => {
    onSelectProduct(product);
    navigate(`/form/${product.id}`);
  };

  return (
    <section>
      <div className="actions-row" style={{ marginBottom: '1.5rem', justifyContent: 'flex-start' }}>
        <button className="secondary-btn" onClick={onReturnToDrafts}>
          Retour au menu
        </button>
      </div>
      <div className="product-grid">
        {products.map((product) => (
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
              <p>
                Questions à répondre : <strong>{
                  (product.tableQuestions?.length ?? 0) + 
                  (product.normalQuestions?.length ?? 0)
                }</strong>
              </p>
            </div>
            <button className="primary-btn" onClick={() => handleSelectProduct(product)}>
              Choisir ce produit
            </button>
          </article>
        ))}
      </div>
    </section>
  );
};

export default ProductSelection;

