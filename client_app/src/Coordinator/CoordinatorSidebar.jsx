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
import CloseIcon from '@mui/icons-material/Close';

function CoordinatorSidebar({ expanded, setExpanded }) {
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
        <Nav defaultActiveKey="/coordinator/home" className="flex-column">
          <Nav.Item>
            <Link to="/coordinator/home" className={getLinkClass("/coordinator/home")} onClick={() => setExpanded(false)}>
              <div className="d-flex align-items-center">
                <DashboardIcon className={`custom-icon ${isLinkActive("/coordinator/home") ? "text-blue-500" : ""}`} />
                <span className={isLinkActive("/coordinator/home") ? "text-blue-500 font-medium" : ""}>Dashboard</span>
              </div>
            </Link>
          </Nav.Item>
          <Nav.Item>
            <Link to="/coordinator/announcements" className={getLinkClass("/coordinator/announcements")} onClick={() => setExpanded(false)}>
              <div className="d-flex align-items-center">
                <AnnouncementIcon className={`custom-icon ${isLinkActive("/coordinator/announcements") ? "text-blue-500" : ""}`} />
                <span className={isLinkActive("/coordinator/announcements") ? "text-blue-500 font-medium" : ""}>Announcements</span>
              </div>
            </Link>
          </Nav.Item>
          <Nav.Item>
            <Link to="/coordinator/companies" className={getLinkClass("/coordinator/companies")} onClick={() => setExpanded(false)}>
              <div className="d-flex align-items-center">
                <CompanyIcon className={`custom-icon ${isLinkActive("/coordinator/companies") ? "text-blue-500" : ""}`} />
                <span className={isLinkActive("/coordinator/companies") ? "text-blue-500 font-medium" : ""}>Companies</span>
              </div>
            </Link>
          </Nav.Item>
          <Nav.Item>
            <Link to="/coordinator/files" className={getLinkClass("/coordinator/files")} onClick={() => setExpanded(false)}>
              <div className="d-flex align-items-center">
                <FilesIcon className={`custom-icon ${isLinkActive("/coordinator/files") ? "text-blue-500" : ""}`} />
                <span className={isLinkActive("/coordinator/files") ? "text-blue-500 font-medium" : ""}>Files</span>
              </div>
            </Link>
          </Nav.Item>
          <Nav.Item>
            <Link to="/coordinator/trainees" className={getLinkClass("/coordinator/trainees")} onClick={() => setExpanded(false)}>
              <div className="d-flex align-items-center">
                <TraineesIcon className={`custom-icon ${isLinkActive("/coordinator/trainees") ? "text-blue-500" : ""}`} />
                <span className={isLinkActive("/coordinator/trainees") ? "text-blue-500 font-medium" : ""}>Trainees</span>
              </div>
            </Link>
          </Nav.Item>
          <Nav.Item>
            <Link to="/coordinator/progress-reports" className={getLinkClass("/coordinator/progress-reports")} onClick={() => setExpanded(false)}>
              <div className="d-flex align-items-center">
                <ProgressIcon className={`custom-icon ${isLinkActive("/coordinator/progress-reports") ? "text-blue-500" : ""}`} />
                <span className={isLinkActive("/coordinator/progress-reports") ? "text-blue-500 font-medium" : ""}>Progress Reports</span>
              </div>
            </Link>
          </Nav.Item>
          <Nav.Item>
            <Link to="/coordinator/emergency-reports" className={getLinkClass("/coordinator/emergency-reports")} onClick={() => setExpanded(false)}>
              <div className="d-flex align-items-center">
                <WarningIcon className={`custom-icon ${isLinkActive("/coordinator/emergency-reports") ? "text-blue-500" : ""}`} />
                <span className={isLinkActive("/coordinator/emergency-reports") ? "text-blue-500 font-medium" : ""}>Emergency Reports</span>
              </div>
            </Link>
          </Nav.Item>
        </Nav>
      </div>
    </div>
  );
}

export default CoordinatorSidebar;