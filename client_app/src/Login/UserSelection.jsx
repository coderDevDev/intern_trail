import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../index.css'; // Adjust the import path if necessary

function UserSelection() {
  const navigate = useNavigate();
  const [userType, setUserType] = useState('student');

  const handleContinueClick = () => {
    navigate('/account-creation', { state: { userType } });
  };

  const handleSignInClick = () => {
    navigate('/');
  };

  return (
    <div className="user-selection-container">
      <div className="user-selection-form">
        <h2>What's your user type?</h2>
        <div className="form-group">
          <label htmlFor="userType">Select User Type</label>
          <select
            id="userType"
            className="form-control"
            value={userType}
            onChange={(e) => setUserType(e.target.value)}
          >
            <option value="student">Student</option>
            <option value="ojt-coordinator">OJT Coordinator</option>
            <option value="hte-supervisor">HTE Supervisor</option>
            <option value="university-dean">University Dean</option>
          </select>
        </div>
        <button className="submit-button" onClick={handleContinueClick}>Continue</button>
        <p className="sign-in-text">
          Already have an account?{' '}
          <span onClick={handleSignInClick} className="link-style">Sign in</span>
        </p>
      </div>
    </div>
  );
};

export default UserSelection;
