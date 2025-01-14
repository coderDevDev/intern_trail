// src/Login/ChangePassword.jsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../index.css'; // Adjust the import path if necessary

function ChangePassword() {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (event) => {
    event.preventDefault();
    // Handle change password logic here
    if (newPassword === confirmPassword) {
      console.log(`Password changed successfully`);
      navigate('/password-changed-success'); // Redirect to PasswordChangedSuccess page after successful password change
    } else {
      console.log("New passwords do not match");
    }
  };

  return (
    <div className="change-password-container">
      <div className="change-password-form">
        <h2>Change Your Password</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="new-password">New Password</label>
            <input
              type="password"
              id="new-password"
              className="form-control"
              placeholder="Enter your new password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="confirm-password">Confirm New Password</label>
            <input
              type="password"
              id="confirm-password"
              className="form-control"
              placeholder="Confirm your new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="submit-button">Change Password</button>
        </form>
      </div>
    </div>
  );
}

export default ChangePassword;