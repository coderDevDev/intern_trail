// src/Admin/AdminSidebar.js

import React from "react";
import { Nav } from "react-bootstrap";
import { Link } from "react-router-dom";
import UsersIcon from '@mui/icons-material/PeopleOutline';
import MenuIcon from '@mui/icons-material/Menu';
import HistoryIcon from '@mui/icons-material/History';

function AdminSidebar({ expanded, setExpanded }) {
  return (
    <div>
      <div className="sidebar-toggle" onClick={() => setExpanded(!expanded)}>
        <MenuIcon />
      </div>
      <div className={`custom-sidebar ${expanded ? 'expanded' : ''}`}>
        <Nav defaultActiveKey="/admin/coordinators" className="flex-column">
          {/* Users Section */}
          {/* <Nav.Item>
            <Link to="/admin/users" className="nav-link custom-nav-link" onClick={() => setExpanded(false)}>
              <div className="d-flex align-items-center">
                <UsersIcon className="custom-icon" />
                <span>Users</span>
              </div>
            </Link>
          </Nav.Item> */}


          <Nav.Item>
            <Link to="/admin/dashboard" className="nav-link custom-nav-link" onClick={() => setExpanded(false)}>
              <div className="d-flex align-items-center">
                <UsersIcon className="custom-icon" />
                <span>Dashboard</span>
              </div>
            </Link>
          </Nav.Item>


          <Nav.Item>
            <Link to="/admin/coordinators" className="nav-link custom-nav-link" onClick={() => setExpanded(false)}>
              <div className="d-flex align-items-center">
                <UsersIcon className="custom-icon" />
                <span>OJT Coordinators</span>
              </div>
            </Link>
          </Nav.Item>

          <Nav.Item>
            <Link to="/admin/HTE" className="nav-link custom-nav-link" onClick={() => setExpanded(false)}>
              <div className="d-flex align-items-center">
                <UsersIcon className="custom-icon" />
                <span>HTE Supervisors</span>
              </div>
            </Link>
          </Nav.Item>

          <Nav.Item>
            <Link to="/admin/deans" className="nav-link custom-nav-link" onClick={() => setExpanded(false)}>
              <div className="d-flex align-items-center">
                <UsersIcon className="custom-icon" />
                <span>Deans</span>
              </div>
            </Link>
          </Nav.Item>



          {/* System Logs Section */}
          <Nav.Item>
            <Link to="/admin/system-logs" className="nav-link custom-nav-link" onClick={() => setExpanded(false)}>
              <div className="d-flex align-items-center">
                <HistoryIcon className="custom-icon" />
                <span>System Logs</span>
              </div>
            </Link>
          </Nav.Item>
        </Nav>
      </div>
    </div>
  );
}

export default AdminSidebar;
