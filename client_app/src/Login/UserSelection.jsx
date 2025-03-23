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
    navigate('/login');
  };

  return (

    <div className="user-selection-container relative overflow-hidden">
      {/* Background gradient - modify positioning or colors as needed */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 transform-gpu overflow-hidden blur-3xl"
      >
        <div
          style={{
            clipPath:
              'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
          }}
          className="relative left-[calc(50%)] aspect-[1155/678] w-[48rem] -translate-x-1/2 bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:w-[96rem]"
        />
      </div>

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
            <option value="dean">University Dean</option>
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
