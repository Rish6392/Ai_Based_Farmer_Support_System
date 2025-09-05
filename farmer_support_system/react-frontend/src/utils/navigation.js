import { useNavigate } from 'react-router-dom';

// Custom hook for navigation utilities
export const useAppNavigation = () => {
  const navigate = useNavigate();

  const navigateToChat = (query = null) => {
    navigate('/', { state: { query } });
  };

  const navigateToDiseasePrediction = () => {
    navigate('/disease-prediction');
  };

  const navigateToDashboard = () => {
    navigate('/dashboard');
  };

  return {
    navigate,
    navigateToChat,
    navigateToDiseasePrediction,
    navigateToDashboard,
  };
};

// Route constants for consistency
export const ROUTES = {
  HOME: '/',
  CHAT: '/',
  DISEASE_PREDICTION: '/disease-prediction',
  DASHBOARD: '/dashboard',
};
