import { useState, useEffect } from 'react';

export function useUserId() {
  const [userId, setUserId] = useState<string>('');

  useEffect(() => {
    // Get userId from localStorage
    const savedUserId = localStorage.getItem('userId');
    if (savedUserId) {
      setUserId(savedUserId);
    } else {
      const newUserId = `user_${Math.random().toString(36).substring(2, 9)}`;
      localStorage.setItem('userId', newUserId);
      setUserId(newUserId);
    }
  }, []);

  // Return just the userId string instead of an object with a function
  return userId;
}