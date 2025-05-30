// src/components/ActivateUserPage.tsx

import React, { useState } from 'react';
import type { UpdateUserPayload } from './api';

interface ActivateUserPageProps {
  onActivateSuccess: () => void; // Callback to tell App.tsx to proceed
  updateUser: (payload: UpdateUserPayload) => Promise<any>; // Function to call the API
  loading: boolean;
  error: string | null;
}

const ActivateUserPage: React.FC<ActivateUserPageProps> = ({ onActivateSuccess, updateUser, loading, error }) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [streetAddress, setStreetAddress] = useState('');
  const [state, setState] = useState('');
  const [country, setCountry] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null); // Clear previous local errors

    // Basic client-side validation
    if (!phoneNumber || !streetAddress || !state || !country) {
      setLocalError('All fields are required.');
      return;
    }

    const payload: UpdateUserPayload = {
      phoneNumber,
      streetAddress,
      state,
      country,
    };

    try {
      await updateUser(payload); // Call the prop function, which wraps the API call
      onActivateSuccess(); // Notify parent component (App.tsx)
    } catch (err: any) {
      // Error is already handled by App.tsx's updateUser wrapper if any,
      // but we can set a local error for immediate feedback if needed.
      console.error("ActivateUserPage: Error during update:", err);
      // The parent component's error state will likely be updated via the 'error' prop
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white p-4">
      <div className="bg-gray-800 p-8 rounded-lg shadow-xl w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-6">Account Activation Required</h1>
        <p className="text-gray-400 text-center mb-6">
          Please provide your contact and address details to activate your account.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-300">Phone Number</label>
            <input
              type="text"
              id="phoneNumber"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="mt-1 block w-full p-3 rounded-md bg-gray-700 border border-gray-600 text-white focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="e.g., +2348012345678"
              required
            />
          </div>
          <div>
            <label htmlFor="streetAddress" className="block text-sm font-medium text-gray-300">Street Address</label>
            <input
              type="text"
              id="streetAddress"
              value={streetAddress}
              onChange={(e) => setStreetAddress(e.target.value)}
              className="mt-1 block w-full p-3 rounded-md bg-gray-700 border border-gray-600 text-white focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="e.g., 123 Main St"
              required
            />
          </div>
          <div>
            <label htmlFor="state" className="block text-sm font-medium text-gray-300">State / Region</label>
            <input
              type="text"
              id="state"
              value={state}
              onChange={(e) => setState(e.target.value)}
              className="mt-1 block w-full p-3 rounded-md bg-gray-700 border border-gray-600 text-white focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="e.g., Lagos"
              required
            />
          </div>
          <div>
            <label htmlFor="country" className="block text-sm font-medium text-gray-300">Country</label>
            <input
              type="text"
              id="country"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="mt-1 block w-full p-3 rounded-md bg-gray-700 border border-gray-600 text-white focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="e.g., Nigeria"
              required
            />
          </div>

          {(localError || error) && (
            <p className="text-red-500 text-sm text-center">{localError || error}</p>
          )}

          <button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            disabled={loading}
          >
            {loading ? 'Submitting...' : 'Activate Account'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ActivateUserPage;