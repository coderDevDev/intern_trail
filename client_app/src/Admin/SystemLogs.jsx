// src/Admin/SystemLogs.js

import React, { useState } from 'react';
import AdminSidebar from './AdminSidebar';
import "../index.css";
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/Menu';

function SystemLogs() {
  const [expanded, setExpanded] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);

  const handleSortHeaderClick = (e) => {
    if (anchorEl && anchorEl === e.currentTarget) {
      setAnchorEl(null);
    } else {
      setAnchorEl(e.currentTarget);
    }
  };

  const handleSortClose = () => {
    setAnchorEl(null);
  };

  const handleSortOption = (option) => {
    console.log(`Sorting by ${option}`);
    handleSortClose();
  };

  return (
    <div className="dashboard-container">
      <AdminSidebar expanded={expanded} setExpanded={setExpanded} />
      <div className="main-content-systemlogs">
        <div className="page-header">
          <h1 style={{ marginTop: "0" }}>System Logs</h1>
        </div>
        <div className="user-table">
          <table>
            <thead>
              <tr>
                <th>User ID</th>
                <th>IP Address</th>
                <th>Browser</th>
                <th>Created at</th>
                <th>Updated at</th>
                <th onClick={handleSortHeaderClick} style={{ cursor: "pointer" }}>
                  Sort By
                  <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={handleSortClose}
                  >
                    {["User ID", "IP Address", "Browser", "Created at", "Updated at"].map((option) => (
                      <MenuItem
                        key={option}
                        onClick={() => handleSortOption(option)}
                      >
                        {option}
                      </MenuItem>
                    ))}
                  </Menu>
                </th>
              </tr>
            </thead>
            <tbody>
              {/* Placeholder for rows */}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default SystemLogs;
