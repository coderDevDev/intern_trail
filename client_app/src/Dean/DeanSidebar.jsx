import React from 'react';
import { Nav } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import DashboardIcon from '@mui/icons-material/DashboardOutlined';
import AnnouncementIcon from '@mui/icons-material/NotificationsNone';
import CompanyIcon from '@mui/icons-material/CorporateFareOutlined';
import TraineesIcon from '@mui/icons-material/HailOutlined';
import MenuIcon from '@mui/icons-material/Menu';

function DeanSidebar({ expanded, setExpanded }) {

  return (
    <div>
      <div className="sidebar-toggle z-1" onClick={() => setExpanded(!expanded)}>
        <MenuIcon />
      </div>
      <div className={`custom-sidebar ${expanded ? 'expanded' : ''} z-2`}>
        <Nav defaultActiveKey="/dean/home" className="flex-column">
          <Nav.Item>
            <Link to="/dean/home" className="nav-link custom-nav-link" onClick={() => setExpanded(false)}>
              <div className="d-flex align-items-center">
                <DashboardIcon className="custom-icon" />
                <span>Dashboard</span>
              </div>
            </Link>
          </Nav.Item>
          <Nav.Item>
            <Link to="/dean/announcements" className="nav-link custom-nav-link" onClick={() => setExpanded(false)}>
              <div className="d-flex align-items-center">
                <AnnouncementIcon className="custom-icon" />
                <span>Announcements</span>
              </div>
            </Link>
          </Nav.Item>
          <Nav.Item>
            <Link to="/dean/companies" className="nav-link custom-nav-link" onClick={() => setExpanded(false)}>
              <div className="d-flex align-items-center">
                <CompanyIcon className="custom-icon" />
                <span>Companies</span>
              </div>
            </Link>
          </Nav.Item>
        
          <Nav.Item>
            <Link to="/dean/trainees" className="nav-link custom-nav-link" onClick={() => setExpanded(false)}>
              <div className="d-flex align-items-center">
                <TraineesIcon className="custom-icon" />
                <span>Trainees</span>
              </div>
            </Link>
          </Nav.Item>
        </Nav>
      </div>
    </div>
  );
}

export default DeanSidebar;