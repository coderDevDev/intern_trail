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
import ApplicationsIcon from '@mui/icons-material/HowToReg';

function HTESidebar({ expanded, setExpanded }) {
  return (
    <div>
      <div className="sidebar-toggle z-1" onClick={() => setExpanded(!expanded)}>
        <MenuIcon />
      </div>
      <div className={`custom-sidebar ${expanded ? 'expanded' : ''} z-2`}>
        <Nav defaultActiveKey="/HTE/home" className="flex-column">
          <Nav.Item>
            <Link to="/HTE/home" className="nav-link custom-nav-link" onClick={() => setExpanded(false)}>
              <div className="d-flex align-items-center">
                <DashboardIcon className="custom-icon" />
                <span>Dashboard</span>
              </div>
            </Link>
          </Nav.Item>
          <Nav.Item>
            <Link to="/HTE/announcements" className="nav-link custom-nav-link" onClick={() => setExpanded(false)}>
              <div className="d-flex align-items-center">
                <AnnouncementIcon className="custom-icon" />
                <span>Announcements</span>
              </div>
            </Link>
          </Nav.Item>
          <Nav.Item>
            <Link to="/HTE/files" className="nav-link custom-nav-link" onClick={() => setExpanded(false)}>
              <div className="d-flex align-items-center">
                <FilesIcon className="custom-icon" />
                <span>Files</span>
              </div>
            </Link>
          </Nav.Item>
          <Nav.Item>
            <Link to="/HTE/applications" className="nav-link custom-nav-link" onClick={() => setExpanded(false)}>
              <div className="d-flex align-items-center">
                <ApplicationsIcon className="custom-icon" />
                <span>Trainees</span>
              </div>
            </Link>
          </Nav.Item>
          {/* <Nav.Item>
            <Link to="/HTE/trainees" className="nav-link custom-nav-link" onClick={() => setExpanded(false)}>
              <div className="d-flex align-items-center">
                <TraineesIcon className="custom-icon" />
                <span>Trainees</span>
              </div>
            </Link>
          </Nav.Item>
          <Nav.Item>
            <Link to="/HTE/progress-reports" className="nav-link custom-nav-link" onClick={() => setExpanded(false)}>
              <div className="d-flex align-items-center">
                <ProgressIcon className="custom-icon" />
                <span>Progress Reports</span>
              </div>
            </Link>
          </Nav.Item> */}
          <Nav.Item>
            <Link to="/HTE/emergency-reports" className="nav-link custom-nav-link" onClick={() => setExpanded(false)}>
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

export default HTESidebar;