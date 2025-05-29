// src/components/SelectedProductChip.tsx
import React from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import type { Product } from '../App';

interface SelectedProductChipProps {
  product: Product;
  onRemove: (productId: number) => void; // Changed to number
}

const SelectedProductChip: React.FC<SelectedProductChipProps> = ({ product, onRemove }) => {
  return (
    <div className="flex items-center bg-gray-700 rounded-full px-3 py-1 text-sm text-white border border-gray-600">
      <img src={product.imageUrl} alt={product.name} className="w-6 h-6 rounded-full mr-2 object-cover" />
      <span>{product.name}</span>
      <button
        type="button"
        onClick={() => product.productId && onRemove(product.productId)} // Pass productId (number)
        className="ml-2 text-gray-400 hover:text-white transition-colors duration-200"
      >
        <XMarkIcon className="h-4 w-4" />
      </button>
    </div>
  );
};

export default SelectedProductChip;