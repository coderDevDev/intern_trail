import React from 'react';
import { Nav } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import DashboardIcon from '@mui/icons-material/DashboardOutlined';
import AnnouncementIcon from '@mui/icons-material/NotificationsNone';
import CompanyIcon from '@mui/icons-material/CorporateFareOutlined';
import FilesIcon from '@mui/icons-material/InsertDriveFileOutlined';
import ProgressIcon from '@mui/icons-material/EmojiEventsOutlined';
import WarningIcon from '@mui/icons-material/ReportOutlined';
import TraineesIcon from '@mui/icons-material/HailOutlined';
import MenuIcon from '@mui/icons-material/Menu';

function CoordinatorSidebar({ expanded, setExpanded }) {

  return (
    <div>
      <div className="sidebar-toggle z-1" onClick={() => setExpanded(!expanded)}>
        <MenuIcon />
      </div>
      <div className={`custom-sidebar ${expanded ? 'expanded' : ''} z-2`}>
        <Nav defaultActiveKey="/coordinator/home" className="flex-column">
          <Nav.Item>
            <Link to="/coordinator/home" className="nav-link custom-nav-link" onClick={() => setExpanded(false)}>
              <div className="d-flex align-items-center">
                <DashboardIcon className="custom-icon" />
                <span>Dashboard</span>
              </div>
            </Link>
          </Nav.Item>
          <Nav.Item>
            <Link to="/coordinator/announcements" className="nav-link custom-nav-link" onClick={() => setExpanded(false)}>
              <div className="d-flex align-items-center">
                <AnnouncementIcon className="custom-icon" />
                <span>Announcements</span>
              </div>
            </Link>
          </Nav.Item>
          <Nav.Item>
            <Link to="/coordinator/companies" className="nav-link custom-nav-link" onClick={() => setExpanded(false)}>
              <div className="d-flex align-items-center">
                <CompanyIcon className="custom-icon" />
                <span>Companies</span>
              </div>
            </Link>
          </Nav.Item>
          <Nav.Item>
            <Link to="/coordinator/files" className="nav-link custom-nav-link" onClick={() => setExpanded(false)}>
              <div className="d-flex align-items-center">
                <FilesIcon className="custom-icon" />
                <span>Files</span>
              </div>
            </Link>
          </Nav.Item>
          <Nav.Item>
            <Link to="/coordinator/trainees" className="nav-link custom-nav-link" onClick={() => setExpanded(false)}>
              <div className="d-flex align-items-center">
                <TraineesIcon className="custom-icon" />
                <span>Trainees</span>
              </div>
            </Link>
          </Nav.Item>
          <Nav.Item>
            <Link to="/coordinator/progress-reports" className="nav-link custom-nav-link" onClick={() => setExpanded(false)}>
              <div className="d-flex align-items-center">
                <ProgressIcon className="custom-icon" />
                <span>Progress Reports</span>
              </div>
            </Link>
          </Nav.Item>
          <Nav.Item>
            <Link to="/coordinator/emergency-reports" className="nav-link custom-nav-link" onClick={() => setExpanded(false)}>
              <div className="d-flex align-items-center">
                <WarningIcon className="custom-icon" />
                <span>Emergency Reports</span>
              </div>
            </Link>
          </Nav.Item>
        </Nav>
      </div>
    </div>
  );
}

export default CoordinatorSidebar;