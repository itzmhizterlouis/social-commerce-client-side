import React, { useState, useEffect, useRef } from 'react';
import { getLoggedInUser, updateUserApi } from './api';

const SettingsPage: React.FC = () => {
  const [userDetails, setUserDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Editable fields
  const [phoneNumber, setPhoneNumber] = useState('');
  const [streetAddress, setStreetAddress] = useState('');
  const [state, setState] = useState('');
  const [country, setCountry] = useState('');
  const [profileImageUrl, setProfileImageUrl] = useState('');
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);
      setError(null);
      try {
        const user = await getLoggedInUser();
        setUserDetails(user);
        setPhoneNumber(user.phoneNumber || '');
        setStreetAddress(user.address?.streetAddress || '');
        setState(user.address?.state || '');
        setCountry(user.address?.country || '');
        setProfileImageUrl(user.profileImageUrl || '');
        console.log('User details loaded:', userDetails);
      } catch (err: any) {
        setError('Failed to load user details');
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setProfileImageFile(e.target.files[0]);
      setProfileImageUrl(URL.createObjectURL(e.target.files[0]));
    }
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      await updateUserApi({
        phoneNumber,
        streetAddress,
        state,
        country,
        ...(profileImageFile ? { profileImageFile } : {}),
      });
      setSuccess('Profile updated successfully!');
      setUserDetails((prev: any) => ({
        ...prev,
        phoneNumber,
        address: {
          ...prev.address,
          streetAddress,
          state,
          country,
        },
        profileImageUrl: profileImageFile ? profileImageUrl : prev.profileImageUrl,
      }));
    } catch (err: any) {
      setError('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white p-4">
        <div className="bg-gray-800 p-8 rounded-lg shadow-xl w-full max-w-md text-center">
          <svg className="animate-spin h-8 w-8 text-indigo-500 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error && !saving) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white p-4">
        <div className="bg-gray-800 p-8 rounded-lg shadow-xl w-full max-w-md text-center">
          <p className="text-red-400">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white p-4">
      <div className="bg-gray-800 p-8 rounded-lg shadow-xl w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-6">Profile</h1>
        <div className="flex flex-col items-center mb-6 relative">
          <img
            src={profileImageUrl || '/default-avatar.png'}
            alt="Profile"
            className="w-24 h-24 rounded-full object-cover mb-2 border-2 border-indigo-500 cursor-pointer"
            onClick={handleImageClick}
            title="Click to change profile image"
          />
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="hidden"
          />
          <p>Click Image To Edit</p>
        </div>
        <form className="space-y-4" onSubmit={handleSave}>
          <div>
            <label className="block text-sm font-medium text-gray-300">Phone Number</label>
            <input
              type="text"
              className="mt-1 p-3 rounded-md bg-gray-700 border border-gray-600 text-white w-full"
              value={phoneNumber}
              onChange={e => setPhoneNumber(e.target.value)}
              placeholder="e.g., +2348012345678"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300">Street Address</label>
            <input
              type="text"
              className="mt-1 p-3 rounded-md bg-gray-700 border border-gray-600 text-white w-full"
              value={streetAddress}
              onChange={e => setStreetAddress(e.target.value)}
              placeholder="e.g., 123 Main St"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300">State / Region</label>
            <input
              type="text"
              className="mt-1 p-3 rounded-md bg-gray-700 border border-gray-600 text-white w-full"
              value={state}
              onChange={e => setState(e.target.value)}
              placeholder="e.g., Lagos"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300">Country</label>
            <input
              type="text"
              className="mt-1 p-3 rounded-md bg-gray-700 border border-gray-600 text-white w-full"
              value={country}
              onChange={e => setCountry(e.target.value)}
              placeholder="e.g., Nigeria"
              required
            />
          </div>
          {success && (
            <p className="text-green-400 text-sm text-center">{success}</p>
          )}
          {error && (
            <p className="text-red-400 text-sm text-center">{error}</p>
          )}
          <button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 flex items-center justify-center"
            disabled={saving}
          >
            {saving ? (
              <>
                <svg className="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SettingsPage;