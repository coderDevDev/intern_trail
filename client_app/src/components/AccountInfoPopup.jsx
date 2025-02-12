import React, { useRef, useEffect } from 'react';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/ExitToApp';
import { logoutUser } from '../utils/auth';

function AccountInfoPopup({ onClose, onProfileOpen, userEmail, loggedInUser }) {
  const popupRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (popupRef.current && !popupRef.current.contains(event.target)) {
        onClose();
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  return (
    <div className="account-info-popup" ref={popupRef}>
      <div className="popup-content">
        <div className="popup-header">
          <img
            src={loggedInUser && loggedInUser.proof_identity || "../anyrgb.com.png"}
            alt="Profile"
            className="popup-profile-picture"
          />
          <h6>{userEmail}</h6>
        </div>
        <button onClick={onProfileOpen} className="options-button">
          <SettingsIcon style={{ marginRight: '10px' }} />
          Options
        </button>
        <button onClick={logoutUser} className="logout-button">
          <LogoutIcon style={{ marginRight: '10px' }} />
          Logout
        </button>
      </div>
    </div>
  );
}

export default AccountInfoPopup; 