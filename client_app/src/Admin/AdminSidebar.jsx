import React from "react";
import { Nav } from "react-bootstrap";
import { Link, useLocation } from "react-router-dom";
import UsersIcon from '@mui/icons-material/PeopleOutline';
import MenuIcon from '@mui/icons-material/Menu';
import HistoryIcon from '@mui/icons-material/History';
import DashboardIcon from '@mui/icons-material/DashboardOutlined';

function AdminSidebar({ expanded, setExpanded }) {
  // Get current location
  const location = useLocation();
  const currentPath = location.pathname;

  // Function to check if link is active
  const isLinkActive = (path) => {
    return currentPath === path || currentPath.startsWith(path);
  };

  // Function to get link class based on active state
  const getLinkClass = (path) => {
    return `nav-link custom-nav-link ${isLinkActive(path) ? 'active-link' : ''}`;
  };

  return (
    <div>
      <div className="sidebar-toggle z-1" onClick={() => setExpanded(!expanded)}>
        <MenuIcon />
      </div>
      <div className={`custom-sidebar ${expanded ? 'expanded' : ''} z-2`}>
        <Nav defaultActiveKey="/admin/coordinators" className="flex-column">
          {/* Users Section */}
          {/* <Nav.Item>
            <Link to="/admin/users" className={getLinkClass("/admin/users")} onClick={() => setExpanded(false)}>
              <div className="d-flex align-items-center">
                <UsersIcon className={`custom-icon ${isLinkActive("/admin/users") ? "text-blue-500" : ""}`} />
                <span className={isLinkActive("/admin/users") ? "text-blue-500 font-medium" : ""}>Users</span>
              </div>
            </Link>
          </Nav.Item> */}

          <Nav.Item>
            <Link to="/admin/dashboard" className={getLinkClass("/admin/dashboard")} onClick={() => setExpanded(false)}>
              <div className="d-flex align-items-center">
                <DashboardIcon className={`custom-icon ${isLinkActive("/admin/dashboard") ? "text-blue-500" : ""}`} />
                <span className={isLinkActive("/admin/dashboard") ? "text-blue-500 font-medium" : ""}>Dashboard</span>
              </div>
            </Link>
          </Nav.Item>

          <Nav.Item>
            <Link to="/admin/coordinators" className={getLinkClass("/admin/coordinators")} onClick={() => setExpanded(false)}>
              <div className="d-flex align-items-center">
                <UsersIcon className={`custom-icon ${isLinkActive("/admin/coordinators") ? "text-blue-500" : ""}`} />
                <span className={isLinkActive("/admin/coordinators") ? "text-blue-500 font-medium" : ""}>OJT Coordinators</span>
              </div>
            </Link>
          </Nav.Item>

          <Nav.Item>
            <Link to="/admin/HTE" className={getLinkClass("/admin/HTE")} onClick={() => setExpanded(false)}>
              <div className="d-flex align-items-center">
                <UsersIcon className={`custom-icon ${isLinkActive("/admin/HTE") ? "text-blue-500" : ""}`} />
                <span className={isLinkActive("/admin/HTE") ? "text-blue-500 font-medium" : ""}>HTE Supervisors</span>
              </div>
            </Link>
          </Nav.Item>

          <Nav.Item>
            <Link to="/admin/deans" className={getLinkClass("/admin/deans")} onClick={() => setExpanded(false)}>
              <div className="d-flex align-items-center">
                <UsersIcon className={`custom-icon ${isLinkActive("/admin/deans") ? "text-blue-500" : ""}`} />
                <span className={isLinkActive("/admin/deans") ? "text-blue-500 font-medium" : ""}>Deans</span>
              </div>
            </Link>
          </Nav.Item>

          {/* System Logs Section */}
          <Nav.Item>
            <Link to="/admin/system-logs" className={getLinkClass("/admin/system-logs")} onClick={() => setExpanded(false)}>
              <div className="d-flex align-items-center">
                <HistoryIcon className={`custom-icon ${isLinkActive("/admin/system-logs") ? "text-blue-500" : ""}`} />
                <span className={isLinkActive("/admin/system-logs") ? "text-blue-500 font-medium" : ""}>System Logs</span>
              </div>
            </Link>
          </Nav.Item>
        </Nav>
      </div>
    </div>
  );
}

export default AdminSidebar;