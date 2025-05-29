// src/components/OrdersSidebar.tsx
import React from 'react';
import type { Order } from '../App'; // Import the Order type
import { XMarkIcon } from '@heroicons/react/24/outline'; // For the close button

interface OrdersSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  orders: Order[];
  loading: boolean;
  error: string | null;
}

const OrdersSidebar: React.FC<OrdersSidebarProps> = ({
  isOpen,
  onClose,
  orders,
  loading,
  error,
}) => {
  return (
    <div
      className={`fixed inset-y-0 right-0 w-full md:w-96 bg-gray-900 text-white shadow-lg p-4 transform transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      } z-50 flex flex-col`}
    >
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Your Orders</h2>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-white transition-colors"
          aria-label="Close orders sidebar"
        >
          <XMarkIcon className="h-7 w-7" />
        </button>
      </div>

      {/* Loading, Error, and Empty States */}
      {loading && (
        <div className="flex-grow flex flex-col items-center justify-center text-gray-400">
          <svg className="animate-spin h-10 w-10 text-indigo-500 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="mt-3">Loading orders...</p>
        </div>
      )}

      {error && (
        <div className="flex-grow flex flex-col items-center justify-center text-red-400 text-center">
          <p className="mb-2">Failed to load your orders.</p>
          <p className="text-sm">{error}</p>
        </div>
      )}

      {!loading && !error && orders.length === 0 && (
        <div className="flex-grow flex flex-col items-center justify-center text-gray-400 text-center">
          <p className="text-xl">No orders found.</p>
          <p className="mt-2">You haven't placed any orders yet!</p>
        </div>
      )}

      {/* Display Orders */}
      {!loading && !error && orders.length > 0 && (
        <div className="flex-grow overflow-y-auto space-y-6 pr-2">
          {orders.map((order) => (
            <div key={order.orderId} className="bg-gray-800 p-4 rounded-lg shadow-md">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-semibold text-lg text-indigo-300">Order ID: {order.orderId.substring(0, 8)}...</h3>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${order.paid ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}>
                  {order.paid ? 'Paid' : 'Unpaid'}
                </span>
              </div>
              <p className="text-sm text-gray-400 mb-3">Total: <span className="font-bold text-indigo-400">${order.totalAmount.toFixed(2)}</span></p>

              <div className="border-t border-gray-700 pt-3 mt-3">
                <p className="text-sm font-semibold text-gray-300 mb-2">Items:</p>
                <ul className="space-y-2">
                  {order.products.length > 0 ? (
                    order.products.map((product, index) => (
                      <li key={index} className="flex items-center text-sm text-gray-300">
                        <span className="mr-2 text-indigo-400">•</span>
                        {product.name} - ${product.amount.toFixed(2)}
                      </li>
                    ))
                  ) : (
                    <li className="text-gray-500 text-sm">No products listed for this order.</li>
                  )}
                </ul>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrdersSidebar;