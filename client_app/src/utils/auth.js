import { useNavigate } from 'react-router-dom';

export const logoutUser = () => {
  // Clear all localStorage items
  localStorage.removeItem('token');
  localStorage.removeItem('loggedInUser');

  // Redirect to login page
  window.location.href = '/login';
};
