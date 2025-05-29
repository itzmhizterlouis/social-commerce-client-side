// src/components/CartPage.tsx
import React from 'react';
import type { Product } from '../App';

interface CartPageProps {
  cartItems: Product[];
  cartTotalAmount: number; // NEW: Prop for the total amount from the backend
  loading: boolean;
  error: string | null;
  updateCartItemQuantity: (productId: number, newQuantity: number) => void;
  removeCartItem: (productId: number) => void;
  onCheckout: () => void;
}

const CartPage: React.FC<CartPageProps> = ({
  cartItems,
  cartTotalAmount, // Destructure the new prop
  loading,
  error,
  updateCartItemQuantity,
  removeCartItem,
  onCheckout,
}) => {
  // We no longer need to calculate the total on the frontend if the backend provides it
  // const calculateTotal = () => {
  //   return cartItems.reduce((sum, item) => sum + (item.amount * (item.quantity || 1)), 0);
  // };

  return (
    <div className="p-4 sm:p-6">
      <h2 className="text-2xl font-bold text-white mb-6 text-center">Your Cart</h2>

      {loading && (
        <div className="text-center text-gray-400 py-10">
          <svg className="animate-spin h-10 w-10 text-indigo-500 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="mt-3">Loading cart...</p>
        </div>
      )}

      {error && (
        <div className="text-center text-red-400 py-10">
          <p className="mb-2">Oops! Something went wrong loading your cart.</p>
          <p>{error}</p>
        </div>
      )}

      {!loading && !error && cartItems.length === 0 && (
        <div className="text-center text-gray-400 py-10">
          <p className="text-xl">Your cart is empty!</p>
          <p className="mt-2">Start shopping to add items.</p>
        </div>
      )}

      {!loading && !error && cartItems.length > 0 && (
        <>
          <div className="space-y-4 mb-8">
            {cartItems.map((item) => (
              <div key={item.productId} className="flex items-center bg-gray-800 p-4 rounded-lg shadow">
                <img src={item.imageUrl} alt={item.name} className="w-20 h-20 object-cover rounded-md mr-4" />
                <div className="flex-grow">
                  <h3 className="text-lg font-semibold text-white">{item.name}</h3>
                  <p className="text-indigo-400">${item.amount.toFixed(2)}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => updateCartItemQuantity(item.productId!, (item.quantity || 1) - 1)}
                    className="bg-gray-700 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-gray-600"
                    aria-label="Decrease quantity"
                  >
                    -
                  </button>
                  <span className="text-white font-medium w-6 text-center">{item.quantity || 1}</span>
                  <button
                    onClick={() => updateCartItemQuantity(item.productId!, (item.quantity || 1) + 1)}
                    className="bg-gray-700 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-gray-600"
                    aria-label="Increase quantity"
                  >
                    +
                  </button>
                  <button
                    onClick={() => removeCartItem(item.productId!)}
                    className="ml-4 text-red-400 hover:text-red-500"
                    aria-label="Remove item"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.262 9m10.118-3H5.882c-.52 0-.953.4-.953.951L4.5 19.5c0 .552.433 1.05.953 1.05h13.136c.52 0 .953-.5.953-1.05L19.5 6.951c0-.552-.433-.951-.953-.951h-.114ZM12 4.5l1.5-3h-3L12 4.5Z" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-gray-800 p-4 rounded-lg shadow sticky bottom-0 border-t border-gray-700">
            <div className="flex justify-between items-center mb-4">
              <span className="text-xl font-semibold text-white">Total:</span>
              {/* Use cartTotalAmount from backend */}
              <span className="text-2xl font-bold text-indigo-400">${cartTotalAmount.toFixed(2)}</span>
            </div>
            <button
              onClick={onCheckout}
              className="w-full bg-green-600 text-white py-3 rounded-md font-semibold hover:bg-green-700 transition duration-200"
            >
              Proceed to Checkout
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default CartPage;