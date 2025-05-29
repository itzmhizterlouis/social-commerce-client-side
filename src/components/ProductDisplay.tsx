import React from 'react';
import type { Product } from '../App';
import ProductCardSmall from './ProductCartSmall';

interface ProductDisplayProps {
  products: Product[];
  addToCart: (product: Product) => void;
}

const ProductDisplay: React.FC<ProductDisplayProps> = ({ products, addToCart }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {products.map((product) => (
        <ProductCardSmall key={product.productId} product={product} addToCart={addToCart} />
      ))}
    </div>
  );
};

export default ProductDisplay;