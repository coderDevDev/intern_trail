import React from 'react';
import { Nav } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';
import DashboardIcon from '@mui/icons-material/DashboardOutlined';
import AnnouncementIcon from '@mui/icons-material/NotificationsNone';
import CompanyIcon from '@mui/icons-material/CorporateFareOutlined';
import TraineesIcon from '@mui/icons-material/HailOutlined';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';

function DeanSidebar({ expanded, setExpanded }) {
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
      {/* Sidebar Toggle Button */}
      <div
        className="sidebar-toggle z-3 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        {expanded ? <CloseIcon /> : <MenuIcon />}
      </div>

      {/* Sidebar Content */}
      <div className={`custom-sidebar ${expanded ? 'expanded' : ''} z-2`}>
        <Nav defaultActiveKey="/dean/home" className="flex-column">
          <Nav.Item>
            <Link to="/dean/home" className={getLinkClass("/dean/home")} onClick={() => setExpanded(false)}>
              <div className="d-flex align-items-center">
                <DashboardIcon className={`custom-icon ${isLinkActive("/dean/home") ? "text-blue-500" : ""}`} />
                <span className={isLinkActive("/dean/home") ? "text-blue-500 font-medium" : ""}>Dashboard</span>
              </div>
            </Link>
          </Nav.Item>
          <Nav.Item>
            <Link to="/dean/announcements" className={getLinkClass("/dean/announcements")} onClick={() => setExpanded(false)}>
              <div className="d-flex align-items-center">
                <AnnouncementIcon className={`custom-icon ${isLinkActive("/dean/announcements") ? "text-blue-500" : ""}`} />
                <span className={isLinkActive("/dean/announcements") ? "text-blue-500 font-medium" : ""}>Announcements</span>
              </div>
            </Link>
          </Nav.Item>
          <Nav.Item>
            <Link to="/dean/companies" className={getLinkClass("/dean/companies")} onClick={() => setExpanded(false)}>
              <div className="d-flex align-items-center">
                <CompanyIcon className={`custom-icon ${isLinkActive("/dean/companies") ? "text-blue-500" : ""}`} />
                <span className={isLinkActive("/dean/companies") ? "text-blue-500 font-medium" : ""}>Companies</span>
              </div>
            </Link>
          </Nav.Item>
          <Nav.Item>
            <Link to="/dean/trainees" className={getLinkClass("/dean/trainees")} onClick={() => setExpanded(false)}>
              <div className="d-flex align-items-center">
                <TraineesIcon className={`custom-icon ${isLinkActive("/dean/trainees") ? "text-blue-500" : ""}`} />
                <span className={isLinkActive("/dean/trainees") ? "text-blue-500 font-medium" : ""}>Trainees</span>
              </div>
            </Link>
          </Nav.Item>
        </Nav>
      </div>
    </div>
  );
}

export default DeanSidebar;