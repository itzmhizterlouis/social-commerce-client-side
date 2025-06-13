// src/components/ProductCard.tsx
import React from 'react';
import type { Product } from '../App';

interface ProductCardProps {
  product: Product;
  addToCart: (product: Product) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, addToCart }) => {
  return (
    <div className="bg-gray-800 rounded-lg shadow-md overflow-hidden flex flex-col p-4 w-full h-auto">
      <img
        src={product.imageUrl}
        alt={product.name}
        className="w-full h-48 object-cover rounded-md mb-4"
      />
      <div className="flex-grow flex flex-col justify-between">
        <h3 className="text-lg font-semibold text-white truncate mb-1">{product.name}</h3>
        <p className="text-green-500 font-bold text-xl mb-4">₦{product.amount.toFixed(2)}</p> {/* Use amount */}
      </div>
      <button
        onClick={() => addToCart(product)}
        className="w-full bg-indigo-600 text-white font-bold py-2 px-4 rounded-md hover:bg-indigo-700 transition duration-200"
      >
        Add to Cart
      </button>
    </div>
  );
};

export default ProductCard;