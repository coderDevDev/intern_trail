import React from 'react';
import { Nav } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';
import DashboardIcon from '@mui/icons-material/DashboardOutlined';
import AnnouncementIcon from '@mui/icons-material/NotificationsNone';
import CompanyIcon from '@mui/icons-material/CorporateFareOutlined';
import FilesIcon from '@mui/icons-material/InsertDriveFileOutlined';
import ProgressIcon from '@mui/icons-material/EmojiEventsOutlined';
import WarningIcon from '@mui/icons-material/ReportOutlined';
import TraineesIcon from '@mui/icons-material/HailOutlined';
import MenuIcon from '@mui/icons-material/Menu';
import ApplicationsIcon from '@mui/icons-material/HowToReg';

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
      <div className="sidebar-toggle z-1" onClick={() => setExpanded(!expanded)}>
        <MenuIcon />
      </div>
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
                <span className={isLinkActive("/HTE/applications") ? "text-blue-500 font-medium" : ""}>Trainees</span>
              </div>
            </Link>
          </Nav.Item>
          {/* <Nav.Item>
            <Link to="/HTE/trainees" className={getLinkClass("/HTE/trainees")} onClick={() => setExpanded(false)}>
              <div className="d-flex align-items-center">
                <TraineesIcon className={`custom-icon ${isLinkActive("/HTE/trainees") ? "text-blue-500" : ""}`} />
                <span className={isLinkActive("/HTE/trainees") ? "text-blue-500 font-medium" : ""}>Trainees</span>
              </div>
            </Link>
          </Nav.Item>
          <Nav.Item>
            <Link to="/HTE/progress-reports" className={getLinkClass("/HTE/progress-reports")} onClick={() => setExpanded(false)}>
              <div className="d-flex align-items-center">
                <ProgressIcon className={`custom-icon ${isLinkActive("/HTE/progress-reports") ? "text-blue-500" : ""}`} />
                <span className={isLinkActive("/HTE/progress-reports") ? "text-blue-500 font-medium" : ""}>Progress Reports</span>
              </div>
            </Link>
          </Nav.Item> */}
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