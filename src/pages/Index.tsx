
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const Index = () => {
  const navigate = useNavigate();
  const { user, isGuest } = useAuth();

  useEffect(() => {
    // Redirect based on auth state
    if (user || isGuest) {
      navigate('/app/dashboard');
    } else {
      navigate('/');
    }
  }, [user, isGuest, navigate]);

  return null; // This component just handles redirection
};

export default Index;
