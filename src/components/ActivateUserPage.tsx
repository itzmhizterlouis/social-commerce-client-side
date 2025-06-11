import React, { useState, useEffect } from 'react';
import type { UpdateUserPayload } from './api';

interface ActivateUserPageProps {
  onActivateSuccess: () => void;
  updateUser: (payload: UpdateUserPayload) => Promise<any>;
  loading: boolean;
  error: string | null;
  userDetails?: {
    phoneNumber?: string;
    address?: {
      streetAddress?: string;
      state?: string;
      country?: string;
    };
    profileImageUrl?: string;
  };
}

const ActivateUserPage: React.FC<ActivateUserPageProps> = ({
  onActivateSuccess, updateUser, loading, error, userDetails
}) => {
  const [phoneNumber, setPhoneNumber] = useState(userDetails?.phoneNumber || '');
  const [streetAddress, setStreetAddress] = useState(userDetails?.address?.streetAddress || '');
  const [state, setState] = useState(userDetails?.address?.state || '');
  const [country, setCountry] = useState(userDetails?.address?.country || '');
  const [profileImageUrl, setProfileImageUrl] = useState(userDetails?.profileImageUrl || '');
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    setPhoneNumber(userDetails?.phoneNumber || '');
    setStreetAddress(userDetails?.address?.streetAddress || '');
    setState(userDetails?.address?.state || '');
    setCountry(userDetails?.address?.country || '');
    setProfileImageUrl(userDetails?.profileImageUrl || '');
  }, [userDetails]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setProfileImageFile(e.target.files[0]);
      setProfileImageUrl(URL.createObjectURL(e.target.files[0]));
    }
  };

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleEditImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    if (!phoneNumber || !streetAddress || !state || !country) {
      setLocalError('All fields are required.');
      return;
    }

    // Only include profileImageFile if it exists
    const payload: UpdateUserPayload = {
      phoneNumber,
      streetAddress,
      state,
      country,
      ...(profileImageFile ? { profileImageFile } : {}),
    };

    try {
      await updateUser(payload);
      onActivateSuccess();
    } catch (err: any) {
      // error handled by parent
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white p-4">
      <div className="bg-gray-800 p-8 rounded-lg shadow-xl w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-6">Update Account Details</h1>
        <p className="text-gray-400 text-center mb-6">
          Please provide your contact and address details to activate your account.
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex flex-col items-center mb-4 relative">
          <img
            src={profileImageUrl || '/default-avatar.png'}
            alt="Profile"
            className="w-24 h-24 rounded-full object-cover mb-2 border-2 border-indigo-500"
            onClick={handleEditImageClick}
            style={{ cursor: 'pointer' }}
          />
          {/* <button
            type="button"
            onClick={handleEditImageClick}
            className="absolute top-2 right-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full p-1 shadow-lg"
            title="Edit profile image"
            tabIndex={-1}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 112.828 2.828L11.828 15.828a4 4 0 01-2.828 1.172H7v-2a4 4 0 011.172-2.828z" />
            </svg>
          </button> */}
          <p>Click to Edit Profile Image</p>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="hidden"
          />
        </div>
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
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 flex items-center justify-center"
            disabled={loading}
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Submitting...
              </>
            ) : (
              'Activate Account'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ActivateUserPage;
