// src/components/CartSideBar.tsx
import React from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import type { Product } from '../App';

interface CartSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: Product[];
  removeCartItem: (productId: number) => void;
  onViewCart: () => void;
}

const CartSidebar: React.FC<CartSidebarProps> = ({ isOpen, onClose, cartItems, removeCartItem, onViewCart }) => {
  const calculateTotal = () => {
    // If the backend `getCartApi` provides `totalAmount`, we'd pass that down.
    // For the sidebar, it's often fine to calculate a local subtotal.
    return cartItems.reduce((sum, item) => sum + (item.amount * (item.quantity || 1)), 0);
  };

  return (
    <div
      className={`fixed top-0 right-0 h-full w-full sm:w-80 bg-gray-900 border-l border-gray-700 z-50 transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
    >
      <div className="flex justify-between items-center p-4 border-b border-gray-700">
        <h2 className="text-xl font-bold text-white">Shopping Cart ({cartItems.reduce((sum, item) => sum + (item.quantity || 1), 0)})</h2>
        <button onClick={onClose} className="text-gray-400 hover:text-white">
          <XMarkIcon className="h-6 w-6" />
        </button>
      </div>
      <div className="p-4 overflow-y-auto h-[calc(100vh-160px)]"> {/* Adjust height based on header/footer */}
        {cartItems.length === 0 ? (
          <p className="text-gray-400 text-center mt-8">Your cart is empty.</p>
        ) : (
          <div className="space-y-4">
            {cartItems.map((item) => (
              <div key={item.productId} className="flex items-center bg-gray-800 p-3 rounded-lg shadow">
                <img src={item.imageUrl} alt={item.name} className="w-16 h-16 object-cover rounded-md mr-3" />
                <div className="flex-grow">
                  <h3 className="text-md font-semibold text-white line-clamp-2">{item.name}</h3>
                  <p className="text-green-500 text-sm">${item.amount.toFixed(2)} x {item.quantity || 1}</p>
                </div>
                <button
                  onClick={() => removeCartItem(item.productId!)}
                  className="ml-4 text-red-400 hover:text-red-500"
                  aria-label="Remove item from cart"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.262 9m10.118-3H5.882c-.52 0-.953.4-.953.951L4.5 19.5c0 .552.433 1.05.953 1.05h13.136c.52 0 .953-.5.953-1.05L19.5 6.951c0-.552-.433-.951-.953-.951h-.114ZM12 4.5l1.5-3h-3L12 4.5Z" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="absolute bottom-0 left-0 w-full bg-gray-900 p-4 border-t border-gray-700">
        <div className="flex justify-between items-center mb-4">
          <span className="text-lg font-semibold text-white">Subtotal:</span>
          <span className="text-xl font-bold text-green-500">${calculateTotal().toFixed(2)}</span>
        </div>
        <button
          onClick={() => {
            onViewCart();
            onClose();
          }}
          className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md font-semibold hover:bg-indigo-700 transition duration-200"
        >
          View Full Cart
        </button>
      </div>
    </div>
  );
};

export default CartSidebar;