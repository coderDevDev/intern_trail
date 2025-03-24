import React, { useState, useRef, useEffect } from "react";
import { Container, Navbar } from 'react-bootstrap';
import { Routes, Route } from 'react-router-dom';
import AddIcon from '@mui/icons-material/Add';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/Menu';
import AdminSidebar from './AdminSidebar';
import SystemLogs from './SystemLogs';
import AdminProfileModal from './AdminProfileModal'; // Import the AdminProfileModal component
import AdminDashboard from './AdminDashboard';
import "../index.css";
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/ExitToApp';
import { Link } from 'react-router-dom';



import CoordinatorTrainees from './CoordinatorList';
import HTEList from './HTEList';
import DeansList from './DeansList';
import AccountInfoPopup from '../components/AccountInfoPopup';



function AdminHome() {
  const [expanded, setExpanded] = useState(false);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false); // Add state for profile modal
  const [students, setStudents] = useState([
    { name: "Onin Aldrine Vincent Lance ", dateRegistered: "June 3, 2024", role: "Dean", email: "onin@example.com", imageUrl: "../anyrgb.com.png" },
  ]);
  const [anchorEl, setAnchorEl] = useState(null);

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

  const handleAddStudent = () => {
    // Placeholder for add student functionality
  };

  const handleApprove = (studentName) => {
    // Placeholder for approve functionality
  };

  const handleDelete = (studentName) => {
    // Placeholder for delete functionality
  };

  const handleSortHeaderClick = (e) => {
    if (anchorEl && anchorEl === e.currentTarget) {
      handleSortClose();
    } else {
      setAnchorEl(e.currentTarget);
    }
  };

  const handleSortClose = () => {
    setAnchorEl(null);
  };

  const handleSortOption = (option) => {
    // Placeholder for sort functionality
    handleSortClose();
  };

  return (
    <div>
      <Navbar bg="white" variant="light" className='mx-2'>
              <Container fluid className="d-flex justify-content-between align-items-center">
                <Navbar.Toggle aria-controls="sidebar-nav" className="d-md-none" />
                <Navbar.Brand className="d-flex align-items-left mx-auto my-8">
            <img
              src="../logo.png"
              width="150px"
              height="150px"
              className="d-inline-block align-top me-1"
              alt="Logo"
            />
          </Navbar.Brand>
          <div className="account-info">
            <img
              src="../anyrgb.com.png"
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

      <AdminProfileModal open={isProfileModalOpen} onClose={handleProfileModalClose} />

      <AdminSidebar expanded={expanded} setExpanded={setExpanded} />
      <div className="main-content">
        <Routes>
          <Route
            path="/users"
            element={
              <>
                <div className="page-header">
                  <div style={{ display: "flex", alignItems: "center", flexDirection: "column" }}>
                    <h1 style={{ marginTop: "0", marginLeft: "20px" }}>Manage Students</h1>
                  </div>
                  <div className="header-info">
                    <span className="total-students">Users: {students.length}</span>
                    <button className="btn-add-student" onClick={handleAddStudent}>
                      <AddIcon fontSize="large" />
                    </button>
                  </div>
                </div>
                <div className="user-table">
                  <table>
                    <thead>
                      <tr>
                        <th>Actions</th>
                        <th>Users</th>
                        <th>Date Registered</th>
                        <th>Role</th>
                        <th>Email</th>
                        <th onClick={handleSortHeaderClick} style={{ cursor: "pointer" }}>
                          Sort By
                          <Menu
                            anchorEl={anchorEl}
                            open={Boolean(anchorEl)}
                            onClose={handleSortClose}
                          >
                            {["Name", "Date Registered", "Role", "Email"].map((option) => (
                              <MenuItem
                                key={option}
                                onClick={() => handleSortOption(option)}
                              >
                                {option}
                              </MenuItem>
                            ))}
                          </Menu>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {students.map((student, index) => (
                        <tr key={index}>
                          <td>
                            <input type="checkbox" />
                          </td>
                          <td style={{ display: "flex", alignItems: "center" }}>
                            <img
                              src={student.imageUrl}
                              alt={student.name}
                              className="student-photo"
                            />
                            <span style={{ marginLeft: "10px" }}>{student.name}</span>
                          </td>
                          <td>{student.dateRegistered}</td>
                          <td>{student.role}</td>
                          <td>{student.email}</td>
                          <td>
                            <button>Approve</button>
                            <button>Delete</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            }
          />

          <Route path="/dashboard" element={<AdminDashboard />} />
          <Route path="/system-logs" element={<SystemLogs />} />


          <Route path="/coordinators" element={<CoordinatorTrainees />} />

          <Route path="/HTE" element={<HTEList />} />

          <Route path="/deans" element={<DeansList />} />

        </Routes>
      </div>
    </div>
  );
}

export default AdminHome;
