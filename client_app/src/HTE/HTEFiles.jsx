import React, { useState } from 'react';
import '../index.css'; // Adjust the import path if necessary
import SearchIcon from '@mui/icons-material/Search';
import SortIcon from '@mui/icons-material/Sort';
import HTEFilesUpload from './HTEFilesUpload';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  RadioGroup,
  FormControlLabel,
  Radio,
  IconButton,
} from '@mui/material';



import FileManager from './FileManager';
function HTEFiles() {
  const [searchTerm, setSearchTerm] = useState('');
  const [files, setFiles] = useState([
    {
      filename: 'Accomplishment_Template.docx',
      uploadedBy: 'Admin',
      date: '2023-10-01',
      fileURL: 'Template.docx',
    },
    {
      filename: 'MOA.docx',
      uploadedBy: 'Admin',
      date: '2023-10-02',
      fileURL: 'MOA.docx',
    },
    {
      filename: 'Parental_Consent.pdf',
      uploadedBy: 'Admin',
      date: '2023-10-03',
      fileURL: 'Parental_Consent.pdf',
    },
  ]);
  const [isSortModalOpen, setIsSortModalOpen] = useState(false);
  const [sortCriteria, setSortCriteria] = useState('filename');
  const [sortOrder, setSortOrder] = useState('asc');

  const handleSearchChange = (event) => setSearchTerm(event.target.value);

  const filteredFiles = files.filter((file) =>
    file.filename.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSort = () => setIsSortModalOpen(true);

  const closeSortModal = () => setIsSortModalOpen(false);

  const handleSortChange = (event) => setSortCriteria(event.target.value);

  const applySort = () => {
    const sortedFiles = [...filteredFiles].sort((a, b) => {
      return sortOrder === 'asc'
        ? a[sortCriteria].localeCompare(b[sortCriteria])
        : b[sortCriteria].localeCompare(a[sortCriteria]);
    });
    setFiles(sortedFiles);
    setIsSortModalOpen(false);
  };

  const handleDownload = (file) => {
    console.log(`Downloading file: ${file.filename}`);
    // Implement download functionality here
  };

  return (
    <div className="files-page">

      <FileManager />
      {/* <div className="files-container">
        <div className="file-controls" style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
          <div className="search-bar" style={{ display: 'flex', alignItems: 'center', marginRight: '10px' }}>
            <SearchIcon style={{ color: 'gray', marginRight: '5px' }} />
            <input
              type="text"
              placeholder="Search files..."
              value={searchTerm}
              onChange={handleSearchChange}
              style={{ padding: '5px', borderRadius: '4px' }}
            />
          </div>

          <HTEFilesUpload />

          <IconButton style={{ color: 'gray', marginLeft: '10px' }} onClick={handleSort}>
            <SortIcon />
          </IconButton>
        </div>

        <div className="files-content">
          <div className="checklist-box">
            <h5>Recent Files</h5>

            <table className="emergency-reports-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ padding: '8px' }}>Filename</th>
                  <th style={{ padding: '8px' }}>Uploaded by</th>
                  <th style={{ padding: '8px' }}>Date</th>
                  <th style={{ padding: '8px' }}>File URL</th>
                  <th style={{ padding: '8px' }}>Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredFiles.map((file, index) => (
                  <tr key={index} style={{ borderBottom: '1px solid #ddd' }}>
                    <td style={{ padding: '8px' }}>{file.filename}</td>
                    <td style={{ padding: '8px' }}>{file.uploadedBy}</td>
                    <td style={{ padding: '8px' }}>{file.date}</td>
                    <td style={{ padding: '8px' }}>
                      <a href={file.fileURL} target="_blank" rel="noopener noreferrer">
                        {file.fileURL}
                      </a>
                    </td>
                    <td style={{ padding: '8px' }}>
                      <button
                        onClick={() => handleDownload(file)}
                        className="btn btn-primary"
                        style={{ marginRight: '8px', padding: '5px 10px', cursor: 'pointer' }}
                      >
                        Download
                      </button>
                      <button
                        className="btn btn-danger"
                        style={{ padding: '5px 10px', cursor: 'pointer' }}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <Dialog
        open={isSortModalOpen}
        onClose={closeSortModal}
        fullWidth
        maxWidth="xs"
        PaperProps={{ style: { border: '2px solid #808080', borderRadius: '8px' } }}
      >
        <DialogTitle style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, color: '#000' }}>
          Sort Files
        </DialogTitle>

        <DialogContent style={{ fontFamily: 'Poppins, sans-serif', color: '#000' }}>
          <RadioGroup value={sortCriteria} onChange={handleSortChange}>
            <FormControlLabel value="filename" control={<Radio />} label="Filename" />
            <FormControlLabel value="uploadedBy" control={<Radio />} label="Uploaded by" />
            <FormControlLabel value="date" control={<Radio />} label="Date" />
          </RadioGroup>
        </DialogContent>

        <DialogActions style={{ padding: '16px' }}>
          <Button className="btn btn-primary" onClick={applySort}>
            Apply
          </Button>
          <Button
            className="btn btn-secondary"
            onClick={closeSortModal}
            style={{ backgroundColor: '#ffffff', color: 'black', border: '2px solid #808080' }}
          >
            Cancel
          </Button>
        </DialogActions>
      </Dialog> */}
    </div>
  );
}

export default HTEFiles;