import React, { useState, useRef, useEffect } from 'react';
import { Container, Navbar } from 'react-bootstrap';
import { Route, Routes, useLocation } from 'react-router-dom';
import CoordinatorSidebar from './CoordinatorSidebar';
import Calendar from 'react-calendar';
import '../index.css'; // Adjust the import path if necessary
import 'react-calendar/dist/Calendar.css';
import '../calendar.css'; // Adjust the import path if necessary
import CoordinatorAnnouncements from './CoordinatorAnnouncements';
import CoordinatorCompanies from './CoordinatorCompanies';
import CoordinatorFiles from './CoordinatorFiles';
import CoordinatorProgress from './CoordinatorProgress';
import CoordinatorReports from './CoordinatorReports';
import CoordinatorTrainees from './CoordinatorTrainees';
import CoordinatorProfile from './CoordinatorProfile'; // Import the CoordinatorProfile component
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/ExitToApp';
import StudentProgress from '../Student/StudentProgress';
import AccountInfoPopup from '../components/AccountInfoPopup';
import CoordinatorHome from './CoordinatorDashboard/CoordinatorHome';

// function AccountInfoPopup({ onClose, onProfileOpen }) {
//   const popupRef = useRef(null);

//   useEffect(() => {
//     function handleClickOutside(event) {
//       if (popupRef.current && !popupRef.current.contains(event.target)) {
//         onClose();
//       }
//     }

//     document.addEventListener('mousedown', handleClickOutside);
//     return () => {
//       document.removeEventListener('mousedown', handleClickOutside);
//     };
//   }, [onClose]);

//   let loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));


//   console.log({ loggedInUser })

//   async function logoutUser() {
//     // let res = await axios({
//     //   method: 'POST',
//     //   url: 'auth/logout',
//     //   data: {}
//     // });

//     localStorage.clear();
//     window.location.href = '/login';
//   }

//   const email = loggedInUser.email;

//   return (
//     <div className="account-info-popup" ref={popupRef}>
//       <div className="popup-content">
//         <div className="popup-header">
//           <img
//             src="../anyrgb.com.png"
//             alt="Profile"
//             className="popup-profile-picture"
//           />
//           <h6>{email}
//           </h6>
//         </div>
//         <button onClick={onProfileOpen} className="options-button">
//           <SettingsIcon style={{ marginRight: '10px' }} />
//           Options
//         </button>
//         <button onClick={() => {
//           logoutUser()
//         }} className="logout-button">
//           <LogoutIcon style={{ marginRight: '10px' }} />
//           Logout
//         </button>
//       </div>
//     </div>
//   );
// }

function AdditionalContent() {
  return (
    <div className="additional-content">
      <div className="calendar-container">
        <h5>Calendar</h5>
        <Calendar className="my-custom-calendar" />
      </div>
      <div className="info-container">
        <h5>Number of Trainees: Numbers</h5>
        <div className="remaining-hours-box">
          <div className="remaining-hours-content">
            <span style={{ fontWeight: 600, color: '#1F41BB', marginRight: '5px' }}>
              176 Hours
            </span>
            <span style={{ fontWeight: 400, marginRight: '5px' }}>and</span>
            <span style={{ fontWeight: 600, color: '#1F41BB', marginRight: '5px' }}>
              46 Minutes
            </span>
            <span style={{ fontWeight: 400 }}>left</span>
          </div>
        </div>

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

function CoordinatorDashboard() {
  const location = useLocation(); // Hook to get the current route
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false); // Add state for profile modal
  const [expanded, setExpanded] = useState(false); // Add state for sidebar expansion

  const handleProfileClick = () => {
    setIsPopupOpen(true);
  };

  const handleProfileOpen = () => {
    setIsPopupOpen(false);
    setIsProfileModalOpen(true);
  };

  const handleClosePopup = () => {
    setIsPopupOpen(false);
  };

  const handleProfileModalClose = () => {
    setIsProfileModalOpen(false);
  };

  return (
    <div>
      {/* Navbar */}
      <Navbar bg="white" variant="light" className='mx-2'>
        <Container fluid className="d-flex justify-content-between align-items-center">
          <Navbar.Toggle aria-controls="sidebar-nav" className="d-md-none" />
          <Navbar.Brand className="d-flex align-items-left mx-auto my-8">
            <img
              src='/logo.png'
              width="150px"
              height="150px"
              className="d-inline-block align-top me-1"
              alt="Logo"
            />
          </Navbar.Brand>
          <div className="account-info">
            <img
              src="/anyrgb.com.png"
              alt="Profile"
              className="w-[50px] h-[50px] rounded-full mr-[15px]"
              onClick={handleProfileClick}
            />
            {isPopupOpen && (
              <AccountInfoPopup
                onClose={handleClosePopup}
                onProfileOpen={handleProfileOpen}
              />
            )}
          </div>
        </Container>
      </Navbar>

      <CoordinatorProfile open={isProfileModalOpen} onClose={handleProfileModalClose} />

      {/* Dashboard Layout */}
      <div className="dashboard-container">
        <CoordinatorSidebar expanded={expanded} setExpanded={setExpanded} />
        <div className="main-content">
          <Routes>
            <Route path="/home" element={<CoordinatorHome />} />
            <Route
              path="/home"
              element={
                <>
                  {/* Main Content */}
                  <h1>Dashboard</h1>
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
                          <h5 className="user-name">Juan Dela Cruz</h5>
                          <p className="user-message">
                            Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                          </p>
                        </div>
                      </div>
                      <div className="notification-time">
                        <p>5h ago</p>
                      </div>
                    </div>
                  </div>
                </>
              }
            />
            {/* Additional Routes */}
            <Route path="/announcements" element={<CoordinatorAnnouncements />} />
            <Route path="/companies" element={<CoordinatorCompanies />} />
            <Route path="/files" element={<CoordinatorFiles />} />
            <Route path="/progress-reports" element={<CoordinatorProgress />} />

            <Route path="/student-progress/:studentId" element={<StudentProgress />} />
            <Route path="/trainees" element={<CoordinatorTrainees />} />
            <Route path="/emergency-reports" element={<CoordinatorReports />} />
            <Route path="/profile" element={<CoordinatorProfile open={true} onClose={handleProfileModalClose} />} />
          </Routes>
        </div>

        {/* Render Additional Content only on /coordinator/home route */}
        {/* {location.pathname === '/coordinator/home' && <AdditionalContent />} */}
      </div>
    </div>
  );
}

export default CoordinatorDashboard;