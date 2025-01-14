import React, { useState, useRef, useEffect } from 'react';
import { Container, Navbar } from 'react-bootstrap';
import { Route, Routes, useLocation } from 'react-router-dom';
import DeanSidebar from './DeanSidebar';
import Calendar from 'react-calendar';
import '../index.css'; // Adjust the import path if necessary
import 'react-calendar/dist/Calendar.css';
import '../calendar.css'; // Adjust the import path if necessary
import DeanAnnouncements from './DeanAnnouncements';
import DeanCompanies from './DeanCompanies';
import DeanTrainees from './DeanTrainees';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/ExitToApp';

function AccountInfoPopup({ onClose }) {
  const popupRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (popupRef.current && !popupRef.current.contains(event.target)) {
        onClose();
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  return (
    <div className="account-info-popup" ref={popupRef}>
      <div className="popup-content">
        <div className="popup-header">
          <img
            src="../anyrgb.com.png"
            alt="Profile"
            className="popup-profile-picture"
          />
          <h6>Onin Aldrine Vincent Lance</h6>
        </div>
        <button onClick={onClose} className="options-button">
          <SettingsIcon style={{ marginRight: '10px' }} />
          Options
        </button>
        <button onClick={onClose} className="logout-button">
          <LogoutIcon style={{ marginRight: '10px' }} />
          Logout
        </button>
      </div>
    </div>
  );
}

function AdditionalContent() {
  return (
    <div className="additional-content">
      <h5>Number of Trainees</h5>
        <div className="student-num-box">
          <div className="student-num-content">
            <span style={{ fontWeight: 600, color: '#1F41BB', marginRight: '5px' }}>
              34 Students
            </span>
          </div>
        </div>
      <div className="calendar-container">

        <h5>Calendar</h5>
        <Calendar className="my-custom-calendar" />
      </div>
      <div className="info-container">

        <h5 style={{ marginTop: '20px' }}>Requirements Checklist</h5>
        <div className="requirements-checklist">
          <ul>
            <li>
              <input type="checkbox" id="requirement1" name="requirement1" />
              <label htmlFor="requirement1" style={{ marginLeft: '10px' }}>
                Requirement 1
              </label>
            </li>
            <li>
              <input type="checkbox" id="requirement2" name="requirement2" />
              <label htmlFor="requirement2" style={{ marginLeft: '10px' }}>
                Requirement 2
              </label>
            </li>
            <li>
              <input type="checkbox" id="requirement3" name="requirement3" />
              <label htmlFor="requirement3" style={{ marginLeft: '10px' }}>
                Requirement 3
              </label>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

function DeanDashboard() {
  const location = useLocation(); // Hook to get the current route
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [expanded, setExpanded] = useState(false); // Add state for sidebar expansion

  const handleProfileClick = () => {
    setIsPopupOpen(true);
  };

  const handleClosePopup = () => {
    setIsPopupOpen(false);
  };

  return (
    <div>
      {/* Navbar */}
      <Navbar bg="white" variant="light" className="m-3">
        <Container fluid className="d-flex justify-content-between align-items-center">
          <Navbar.Toggle aria-controls="sidebar-nav" className="d-md-none" onClick={() => setExpanded(!expanded)} />
          <Navbar.Brand className="d-flex align-items-left p-4 mx-auto">
            <img
              src="../logo.png"
              width="auto"
              height="20"
              className="d-inline-block align-top me-1"
              alt="Logo"
            />
          </Navbar.Brand>
          <div className="account-info">
            <img
              src="../anyrgb.com.png"
              alt="Profile"
              className="profile-picture"
              onClick={handleProfileClick}
            />
            {isPopupOpen && <AccountInfoPopup onClose={handleClosePopup} />}
          </div>
        </Container>
      </Navbar>

      {/* Dashboard Layout */}
      <div className="dashboard-container">
        <DeanSidebar expanded={expanded} setExpanded={setExpanded} />
        <div className="main-content">
          <Routes>
            <Route
              path="/home"
              element={
                <>
                  {/* Main Content */}
                  <h1>University Dean Dashboard</h1>
                  <h5>Recent Notifications</h5>
                  <div className="notification-panel">
                    <div className="notification-content">
                      <div className="notification-user">
                        <img
                          src="../anyrgb.com.png"
                          alt="User Profile"
                          className="profile-picture"
                        />
                        <div>
                          <h5 className="user-name">Juan Dela Cruz 
                            <span className='notification-time'> • 5h</span>
                            </h5>
                          <p className="user-message">
                            Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="notification-panel">
                    <div className="notification-content">
                      <div className="notification-user">
                        <img
                          src="../anyrgb.com.png"
                          alt="User Profile"
                          className="profile-picture"
                        />
                        <div>
                          <h5 className="user-name">Juan Dela Cruz 
                            <span className='notification-time'> • 12d</span>
                            </h5>
                          <p className="user-message">
                            Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="notification-panel">
                    <div className="notification-content">
                      <div className="notification-user">
                        <img
                          src="../anyrgb.com.png"
                          alt="User Profile"
                          className="profile-picture"
                        />
                        <div>
                          <h5 className="user-name">Juan Dela Cruz 
                            <span className='notification-time'> • Jun 3</span>
                            </h5>
                          <p className="user-message">
                            Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                </>
              }
            />
            {/* Additional Routes */}
            <Route path="/announcements" element={<DeanAnnouncements />} />
            <Route path="/companies" element={<DeanCompanies />} /> 
            <Route path="/trainees" element={<DeanTrainees />} />
          </Routes>
        </div>

       {/* Render Additional Content only on /student/home route */}
       {location.pathname === '/coordinator/home' && <AdditionalContent />}
      </div>
    </div>
  );
}

export default DeanDashboard;