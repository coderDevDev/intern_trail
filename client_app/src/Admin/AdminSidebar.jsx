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
        <Nav defaultActiveKey="/admin/users" className="flex-column">
          {/* Users Section */}
          <Nav.Item>
            <Link to="/admin/users" className="nav-link custom-nav-link" onClick={() => setExpanded(false)}>
              <div className="d-flex align-items-center">
                <UsersIcon className="custom-icon" />
                <span>Users</span>
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
