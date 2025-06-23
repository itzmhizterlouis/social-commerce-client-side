import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getLoggedInUser, updateUserApi } from './api';
import ActivateUserPage from './ActivateUserPage';

const AuthCallbackPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [showActivate, setShowActivate] = useState(false);
  const [userDetails, setUserDetails] = useState<any>(null);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get('continue');
    if (!token) {
      navigate('/signin');
      return;
    }
    // Store token in localStorage
    localStorage.setItem('authToken', token);
    localStorage.setItem('isAuthenticated', 'true');

    // Fetch user info
    (async () => {
      try {
        const user = await getLoggedInUser();
        localStorage.setItem('currentUserId', user.userId);
        if (user.activated === false) {
          localStorage.setItem('activated', 'false');
          console.log('User not activated:', user);
          setUserDetails(user);
          setShowActivate(true);
        } else {
          localStorage.setItem('activated', 'true');
          navigate('/');
        }
      } catch (err) {
        localStorage.clear();
        navigate('/signin');
      } finally {
        setLoading(false);
      }
    })();
  }, [location, navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen text-white">
        <span>Authenticating...</span>
      </div>
    );
  }

  if (showActivate && userDetails) {
    return (
        console.log('User details:', userDetails),
        <ActivateUserPage
            userDetails={userDetails}
            loading={false}
            error={null}
            updateUser={updateUserApi}
            onActivateSuccess={() => navigate('/')}
        />
    );
  }

  return null;
};

export default AuthCallbackPage;
