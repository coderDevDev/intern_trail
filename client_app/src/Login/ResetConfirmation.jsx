// src/Login/ResetConfirmation.js

import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../index.css'; // Adjust the import path if necessary

function ResetConfirmation() {
  const navigate = useNavigate();

  const handleBackToLoginClick = () => {
    navigate('/'); // Redirect to login page
  };

  return (
    <div className="confirmation-container">
      <div className="confirmation-message">
        <h2>A reset link has been sent to your email</h2>
        <button className="submit-button" onClick={handleBackToLoginClick}>Back to Login</button>
      </div>
    </div>
  );
}

export default ResetConfirmation;
