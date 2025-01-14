import React from 'react';
import '../index.css'; // Adjust the import path if necessary
import SearchIcon from '@mui/icons-material/Search';
import UploadIcon from '@mui/icons-material/Upload';
import SortIcon from '@mui/icons-material/Sort';
import FolderOutlinedIcon from '@mui/icons-material/FolderOutlined';

function StudentFiles() {
  return (
    <div className="files-page">
      <h1>Files</h1>
      <div className="files-container">
        <div className="file-controls">
          <div className="search-bar">
            <SearchIcon />
            <input type="text" placeholder="Search files..." />
          </div>
          <div className="file-actions">
            <UploadIcon />
            <SortIcon />
          </div>
        </div>
        <div className="files-content">
          <div className="checklist-box">
            <h5>Document Requirements</h5>
            <ul>
              <li>Requirement 1</li>
              <li>Requirement 2</li>
              <li>Requirement 3</li>
            </ul>
          </div>
          <div className="folders-box">
            <div className="folder">
              <div className="folder-header">
                <FolderOutlinedIcon style={{ fontSize: 40 }} />
                <div>
                  <h5>Requirement Templates</h5>
                  <p>Templates for various requirements</p>
                </div>
              </div>
            </div>
            <div className="folder">
              <div className="folder-header">
                <FolderOutlinedIcon style={{ fontSize: 40 }} />
                <div>
                  <h5>Reports</h5>
                  <p>All submitted reports</p>
                </div>
              </div>
            </div>
            <div className="folder">
              <div className="folder-header">
                <FolderOutlinedIcon style={{ fontSize: 40 }} />
                <div>
                  <h5>Company Files</h5>
                  <p>Files related to companies</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StudentFiles;