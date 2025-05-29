// src/components/ProductsPage.tsx
import React from 'react';
import type { Product } from '../App';
import ProductCard from './ProductCard'; // Assuming you have a ProductCard component

interface ProductsPageProps {
  products: Product[];
  loading: boolean; // NEW: loading state
  error: string | null; // NEW: error state
  addToCart: (product: Product) => void;
}

const ProductsPage: React.FC<ProductsPageProps> = ({ products, loading, error, addToCart }) => {
  return (
    <div className="p-4 sm:p-6">
      <h2 className="text-2xl font-bold text-white mb-6 text-center">
        {loading ? 'Loading Products...' : (error ? 'Error Loading Products' : 'All Products')}
      </h2>

      {loading && (
        <div className="text-center text-gray-400 py-10">
          <svg className="animate-spin h-10 w-10 text-indigo-500 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="mt-3">Fetching products...</p>
        </div>
      )}

      {error && (
        <div className="text-center text-red-400 py-10">
          <p className="mb-2">Oops! Something went wrong.</p>
          <p>{error}</p>
        </div>
      )}

      {!loading && !error && products.length === 0 && (
        <div className="text-center text-gray-400 py-10">
          <p className="text-xl">No products available yet.</p>
          <p className="mt-2">Check back later or create one!</p>
        </div>
      )}

      {!loading && !error && products.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <ProductCard key={product.productId} product={product} addToCart={addToCart} />
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductsPage;