import React from 'react';
import { Nav } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';
import DashboardIcon from '@mui/icons-material/DashboardOutlined';
import AnnouncementIcon from '@mui/icons-material/NotificationsNone';
import FilesIcon from '@mui/icons-material/InsertDriveFileOutlined';
import ApplicationsIcon from '@mui/icons-material/HowToReg';
import WarningIcon from '@mui/icons-material/ReportOutlined';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';

function HTESidebar({ expanded, setExpanded }) {
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
        <Nav defaultActiveKey="/HTE/home" className="flex-column">
          <Nav.Item>
            <Link to="/HTE/home" className={getLinkClass("/HTE/home")} onClick={() => setExpanded(false)}>
              <div className="d-flex align-items-center">
                <DashboardIcon className={`custom-icon ${isLinkActive("/HTE/home") ? "text-blue-500" : ""}`} />
                <span className={isLinkActive("/HTE/home") ? "text-blue-500 font-medium" : ""}>Dashboard</span>
              </div>
            </Link>
          </Nav.Item>
          <Nav.Item>
            <Link to="/HTE/announcements" className={getLinkClass("/HTE/announcements")} onClick={() => setExpanded(false)}>
              <div className="d-flex align-items-center">
                <AnnouncementIcon className={`custom-icon ${isLinkActive("/HTE/announcements") ? "text-blue-500" : ""}`} />
                <span className={isLinkActive("/HTE/announcements") ? "text-blue-500 font-medium" : ""}>Announcements</span>
              </div>
            </Link>
          </Nav.Item>
          <Nav.Item>
            <Link to="/HTE/files" className={getLinkClass("/HTE/files")} onClick={() => setExpanded(false)}>
              <div className="d-flex align-items-center">
                <FilesIcon className={`custom-icon ${isLinkActive("/HTE/files") ? "text-blue-500" : ""}`} />
                <span className={isLinkActive("/HTE/files") ? "text-blue-500 font-medium" : ""}>Files</span>
              </div>
            </Link>
          </Nav.Item>
          <Nav.Item>
            <Link to="/HTE/applications" className={getLinkClass("/HTE/applications")} onClick={() => setExpanded(false)}>
              <div className="d-flex align-items-center">
                <ApplicationsIcon className={`custom-icon ${isLinkActive("/HTE/applications") ? "text-blue-500" : ""}`} />
                <span className={isLinkActive("/HTE/applications") ? "text-blue-500 font-medium" : ""}>Applications</span>
              </div>
            </Link>
          </Nav.Item>
          <Nav.Item>
            <Link to="/HTE/emergency-reports" className={getLinkClass("/HTE/emergency-reports")} onClick={() => setExpanded(false)}>
              <div className="d-flex align-items-center">
                <WarningIcon className={`custom-icon ${isLinkActive("/HTE/emergency-reports") ? "text-blue-500" : ""}`} />
                <span className={isLinkActive("/HTE/emergency-reports") ? "text-blue-500 font-medium" : ""}>Emergency Reports</span>
              </div>
            </Link>
          </Nav.Item>
        </Nav>
      </div>
    </div>
  );
}

export default HTESidebar;