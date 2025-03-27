import React, { useState, useRef, useEffect } from 'react';
import { Container, Navbar } from 'react-bootstrap';
import { Route, Routes, useLocation } from 'react-router-dom';
import HTESidebar from './HTESidebar';
import Calendar from 'react-calendar';
import '../index.css'; // Adjust the import path if necessary
import 'react-calendar/dist/Calendar.css';
import '../calendar.css'; // Adjust the import path if necessary
import HTEAnnouncements from './HTEAnnouncements';
import HTEFiles from './HTEFiles';
import HTEProgress from './HTEProgress';
import HTEReports from './HTEReports';
import HTETrainees from './HTETrainees';
import HTEProfile from './HTEProfile';
import HTEApplications from './HTEApplications';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/ExitToApp';
import AccountInfoPopup from '../components/AccountInfoPopup';

import StudentProgress from '../Student/StudentProgress';
import StudentDTR from '../Student/StudentDTR';

import HTEDashboardHome from './HTEDashboard/HTEHome';




function AdditionalContent() {
  return (
    <div className="additional-content">
      <h5>Number of Trainees</h5>
      <div className="student-num-box">
        <div className="student-num-content">
          <span style={{ fontWeight: 600, color: '#1F41BB', marginRight: '5px' }}>
            4 Students
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

function HTEDashboard() {
  const location = useLocation(); // Hook to get the current route
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
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
              src="/logo.png"
              width="150px"
              height="150px"
              className="d-inline-block align-top me-2"
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

      <HTEProfile open={isProfileModalOpen} onClose={handleProfileModalClose} />

      {/* Dashboard Layout */}
      <div className="dashboard-container">
        <HTESidebar expanded={expanded} setExpanded={setExpanded} />
        <div className="main-content">
          <Routes>
            <Route
              path="/home"
              element={
                <HTEDashboardHome />
              }
            />
            {/* Additional Routes */}
            <Route path="/announcements" element={<HTEAnnouncements />} />
            <Route path="/files" element={<HTEFiles />} />
            <Route path="/progress-reports" element={<HTEProgress />} />


            <Route path="/student-progress/:studentId" element={<StudentProgress />} />


            <Route path="/trainees" element={<HTETrainees />} />
            <Route path="/applications" element={<HTEApplications />} />
            <Route path="/emergency-reports" element={<HTEReports />} />
            <Route path="/profile" element={<HTEProfile open={true} onClose={handleProfileModalClose} />} />
          </Routes>
        </div>

        {/* Render Additional Content only on /HTE/home route */}
        {/* {location.pathname === '/HTE/home' && <AdditionalContent />} */}
      </div>
    </div>
  );
}

export default HTEDashboard;