import React from 'react';
import { Nav } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';
import DashboardIcon from '@mui/icons-material/DashboardOutlined';
import AnnouncementIcon from '@mui/icons-material/NotificationsNone';
import CompanyIcon from '@mui/icons-material/CorporateFareOutlined';
import FilesIcon from '@mui/icons-material/InsertDriveFileOutlined';
import ProgressIcon from '@mui/icons-material/EmojiEventsOutlined';
import WarningIcon from '@mui/icons-material/ReportOutlined';
import MenuIcon from '@mui/icons-material/Menu';

function Sidebar({ expanded, setExpanded }) {
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
        <Nav defaultActiveKey="/student/home" className="flex-column">
          <Nav.Item>
            <Link to="/student/home" className={getLinkClass("/student/home")} onClick={() => setExpanded(false)}>
              <div className="d-flex align-items-center">
                <DashboardIcon className={`custom-icon ${isLinkActive("/student/home") ? "text-blue-500" : ""}`} />
                <span className={isLinkActive("/student/home") ? "text-blue-500 font-medium" : ""}>Dashboard</span>
              </div>
            </Link>
          </Nav.Item>
          <Nav.Item>
            <Link to="/student/announcements" className={getLinkClass("/student/announcements")} onClick={() => setExpanded(false)}>
              <div className="d-flex align-items-center">
                <AnnouncementIcon className={`custom-icon ${isLinkActive("/student/announcements") ? "text-blue-500" : ""}`} />
                <span className={isLinkActive("/student/announcements") ? "text-blue-500 font-medium" : ""}>Announcements</span>
              </div>
            </Link>
          </Nav.Item>
          <Nav.Item>
            <Link to="/student/companies" className={getLinkClass("/student/companies")} onClick={() => setExpanded(false)}>
              <div className="d-flex align-items-center">
                <CompanyIcon className={`custom-icon ${isLinkActive("/student/companies") ? "text-blue-500" : ""}`} />
                <span className={isLinkActive("/student/companies") ? "text-blue-500 font-medium" : ""}>Companies</span>
              </div>
            </Link>
          </Nav.Item>
          <Nav.Item>
            <Link to="/student/files" className={getLinkClass("/student/files")} onClick={() => setExpanded(false)}>
              <div className="d-flex align-items-center">
                <FilesIcon className={`custom-icon ${isLinkActive("/student/files") ? "text-blue-500" : ""}`} />
                <span className={isLinkActive("/student/files") ? "text-blue-500 font-medium" : ""}>Files</span>
              </div>
            </Link>
          </Nav.Item>
          <Nav.Item>
            <Link to="/student/progress-reports" className={getLinkClass("/student/progress-reports")} onClick={() => setExpanded(false)}>
              <div className="d-flex align-items-center">
                <ProgressIcon className={`custom-icon ${isLinkActive("/student/progress-reports") ? "text-blue-500" : ""}`} />
                <span className={isLinkActive("/student/progress-reports") ? "text-blue-500 font-medium" : ""}>Progress Reports</span>
              </div>
            </Link>
          </Nav.Item>
          <Nav.Item>
            <Link to="/student/emergency-reports" className={getLinkClass("/student/emergency-reports")} onClick={() => setExpanded(false)}>
              <div className="d-flex align-items-center">
                <WarningIcon className={`custom-icon ${isLinkActive("/student/emergency-reports") ? "text-blue-500" : ""}`} />
                <span className={isLinkActive("/student/emergency-reports") ? "text-blue-500 font-medium" : ""}>Emergency Reports</span>
              </div>
            </Link>
          </Nav.Item>
        </Nav>
      </div>
    </div>
  );
}

export default Sidebar;