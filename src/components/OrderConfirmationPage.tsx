// src/components/PaymentConfirmationPage.tsx
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CheckCircleIcon, XCircleIcon, ArrowPathIcon } from '@heroicons/react/24/outline'; // Importing icons
// Assuming './api' contains fetchOrderById and OrderResponse type
import { fetchOrderById, type OrderResponse } from './api';

const OrderConfirmationPage: React.FC = () => {
  const location = useLocation();
  const [orderStatus, setOrderStatus] = useState<'loading' | 'success' | 'failed' | 'error'>('loading');
  const [orderDetails, setOrderDetails] = useState<OrderResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const navigate = useNavigate(); 

  // Function to handle navigation
  const handleGoHome = () => {
    navigate('/'); // This will navigate to the home route ("/")
  };

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const orderId = queryParams.get('orderId');

    if (!orderId) {
      setOrderStatus('error');
      setErrorMessage('Order ID not found in URL. Payment status cannot be confirmed.');
      return;
    }

    const fetchOrderDetails = async () => {
      setOrderStatus('loading');
      setErrorMessage('');
      try {
        const data = await fetchOrderById(orderId);

        setOrderDetails(data);
        if (data.paid) {
          setOrderStatus('success');
        } else {
          setOrderStatus('failed');
        }
      } catch (err: any) {
        console.error('Error fetching order details:', err);
        setOrderStatus('error');
        setErrorMessage(err.message || 'An unexpected error occurred while confirming your payment.');
      }
    };

    fetchOrderDetails();
  }, [location.search]); // Re-run if query parameters change

  const renderContent = () => {
    // Add max-w-md (or lg), w-full, and mx-auto to each of these divs
    const baseCardClasses = "p-8 bg-white rounded-lg shadow-xl w-full mx-auto"; // Consolidated base classes
    const maxWidthClass = "max-w-sm sm:max-w-md md:max-w-lg"; // Responsive max-width

    switch (orderStatus) {
      case 'loading':
        return (
          <div className={`${baseCardClasses} ${maxWidthClass} flex flex-col items-center justify-center text-gray-700`}>
            <ArrowPathIcon className="h-16 w-16 text-indigo-500 animate-spin mb-4" />
            <h2 className="text-2xl font-semibold mb-2 text-center">Confirming Payment...</h2>
            <p className="text-center">Please wait while we verify your order.</p>
          </div>
        );
      case 'success':
        return (
          <div className={`${baseCardClasses} ${maxWidthClass} flex flex-col items-center justify-center text-green-700`}>
            <CheckCircleIcon className="h-20 w-20 text-green-500 mb-4" />
            <h2 className="text-3xl font-bold mb-3 text-center">Payment Successful!</h2>
            <p className="text-lg mb-2 text-center">Thank you for your purchase.</p>
            {orderDetails && (
              <div className="text-gray-700 text-left w-full max-w-xs sm:max-w-sm mb-4"> {/* Added w-full, max-w-xs/sm for text alignment */}
                <p className="text-md break-all">Order ID: <span className="font-semibold">{orderDetails.orderId}</span></p> {/* break-all for long IDs */}
                <p className="text-md">Amount Paid: <span className="font-semibold">${orderDetails.totalAmount.toFixed(2)}</span></p>
              </div>
            )}
            <button
              onClick={handleGoHome} // Call the navigation function on click
              className="mt-6 px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-300"
            >
              Go to Home
            </button>
          </div>
        );
      case 'failed':
        return (
          <div className={`${baseCardClasses} ${maxWidthClass} flex flex-col items-center justify-center text-red-700`}>
            <XCircleIcon className="h-20 w-20 text-red-500 mb-4" />
            <h2 className="text-3xl font-bold mb-3 text-center">Payment Failed</h2>
            <p className="text-lg mb-2 text-center">There was an issue processing your payment.</p>
            {orderDetails && (
              <p className="text-md mb-2 text-gray-700 break-all">Order ID: <span className="font-semibold">{orderDetails.orderId}</span></p>
            )}
            <p className="text-sm text-white-500 text-center">Please refresh or contact support if the issue persists.</p>
            <button
              onClick={() => window.location.reload()} // This is the key change!
              className="mt-6 px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-300"
            >
              Try Again
            </button>
          </div>
        );
      case 'error':
        return (
          <div className={`${baseCardClasses} ${maxWidthClass} flex flex-col items-center justify-center text-yellow-700`}>
            <XCircleIcon className="h-20 w-20 text-yellow-500 mb-4" />
            <h2 className="text-3xl font-bold mb-3 text-center">Confirmation Error</h2>
            <p className="text-lg mb-2 text-center">{errorMessage}</p>
            <button
              onClick={handleGoHome} // Call the navigation function on click
              className="mt-6 px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-300"
            >
              Go to Home
            </button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen min-w-screen flex items-center justify-center bg-gray-100 p-4">
      {renderContent()}
    </div>
  );
};

export default OrderConfirmationPage;