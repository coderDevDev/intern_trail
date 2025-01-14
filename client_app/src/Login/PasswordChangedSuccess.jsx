// src/Login/PasswordChangedSuccess.jsx

import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../index.css'; // Adjust the import path if necessary

function PasswordChangedSuccess() {
  const navigate = useNavigate();

  const handleBackToLoginClick = () => {
    navigate('/'); // Redirect to login page
  };

  return (
    <div className="password-changed-container">
      <div className="password-changed-message">
        <h2>Password was changed successfully</h2>
        <button className="submit-button" onClick={handleBackToLoginClick}>Back to Login</button>
      </div>
    </div>
  );
}

export default PasswordChangedSuccess;
