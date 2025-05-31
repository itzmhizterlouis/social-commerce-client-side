// src/components/ProductCardSmall.tsx
import React from 'react';
import type { Product } from '../App';
import { ShoppingCartIcon } from '@heroicons/react/24/outline';

interface ProductCardSmallProps {
  product: Product;
  addToCart: (product: Product) => void;
}

const ProductCardSmall: React.FC<ProductCardSmallProps> = ({ product, addToCart }) => {
  return (
    <div className="flex items-center bg-gray-700 rounded-lg px-3 py-1 shadow-sm">
      <img
        src={product.imageUrl}
        alt={product.name}
        className="w-16 h-16 object-cover rounded-md mr-3"
      />
      <div className="flex-grow flex-shrink min-w-0 max-w-[calc(100%-10rem)] md:max-w-none">
        <h5 className="text-sm font-semibold text-white truncate whitespace-nowrap">{product.name}</h5>
        <p className="text-green-500 font-bold text-md whitespace-nowrap overflow-hidden text-ellipsis">${product.amount.toFixed(2)}</p> {/* Use amount */}
      </div>
      <button
        onClick={() => addToCart(product)}
        className="ml-4 bg-indigo-500 text-white text-xs font-semibold py-1.5 px-3 rounded-md hover:bg-indigo-600 transition duration-200 flex-shrink-0"
      >
        <ShoppingCartIcon className="h-4 w-4" /> 
      </button>
    </div>
  );
};

export default ProductCardSmall;