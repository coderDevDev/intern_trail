import React from 'react';
import { Navigate } from 'react-router-dom';

function ProtectedRoute({ element, allowedRoles }) {
  const userString = localStorage.getItem('loggedInUser');
  const token = localStorage.getItem('token');

  // If no token or user data, redirect to login
  if (!token || !userString) {
    return <Navigate to="/" replace />;
  }

  try {
    const user = JSON.parse(userString);

    // Check if user's role is allowed
    if (!allowedRoles.includes(user.role)) {
      return <Navigate to="/unauthorized" replace />;
    }

    // If authorized, render component
    return element;
  } catch (error) {
    // If there's any error parsing the user data, redirect to login
    return <Navigate to="/" replace />;
  }
}

export default ProtectedRoute; 