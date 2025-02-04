import React, { useState, useRef } from 'react';
import { IconButton, Menu, MenuItem, Dialog, DialogActions, DialogContent, DialogTitle, Button, Box } from '@mui/material';
import UploadIcon from '@mui/icons-material/Upload';

function HTEFilesUpload() {
  const [anchorEl, setAnchorEl] = useState(null);
  const [isMOAModalOpen, setIsMOAModalOpen] = useState(false);
  const fileInputRef = useRef(null);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleUploadMOA = () => {
    handleMenuClose();
    setIsMOAModalOpen(true);
  };

  const handleMOAModalClose = () => {
    setIsMOAModalOpen(false);
  };

  const handleBrowseClick = () => {
    fileInputRef.current.click();
  };

  const handleFileDrop = (event) => {
    event.preventDefault();
    const files = event.dataTransfer.files;
    // Handle the dropped files here
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const handleFileUpload = () => {
    // Add file upload logic here
    console.log("File uploaded");
    setIsMOAModalOpen(false);
  };

  return (
    <div>
      <IconButton component="div" onClick={handleMenuOpen}>
        <UploadIcon />
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleMenuClose} component="div">
          Document Template
        </MenuItem>
        <MenuItem onClick={handleUploadMOA} component="div">
          Memorandum of Agreement
        </MenuItem>
      </Menu>

      <Dialog
        open={isMOAModalOpen}
        onClose={handleMOAModalClose}
        fullWidth
        maxWidth="sm"
        PaperProps={{
          style: {
            border: '2px solid #808080',
            borderRadius: '8px',
            overflow: 'auto',
          },
        }}
      >
        <DialogTitle
          style={{
            fontFamily: 'Poppins, sans-serif',
            fontWeight: 600,
            color: '#000',
            textAlign: 'left',
          }}
        >
          Upload Memorandum of Agreement
        </DialogTitle>
        <DialogContent
          dividers={false}
          style={{
            fontFamily: 'Poppins, sans-serif',
            color: '#000',
            overflowY: 'scroll',
            scrollbarWidth: 'none', /* Firefox */
            msOverflowStyle: 'none', /* Internet Explorer 10+ */
          }}
        >
          <Box style={{ textAlign: 'center', marginBottom: '20px', position: 'relative' }}>
            <Button
              variant="contained"
              onClick={handleBrowseClick}
              style={{
                backgroundColor: '#ffffff',
                color: 'black',
                border: '2px solid #808080',
                borderRadius: '8px',
                fontFamily: 'Poppins, sans-serif',
              }}
            >
              Browse
            </Button>
            <input
              type="file"
              ref={fileInputRef}
              style={{ display: 'none' }}
              onChange={(e) => console.log(e.target.files)}
            />
          </Box>
          <h6 style={{ textAlign: 'center'}}>or</h6>
          <Box
            onDrop={handleFileDrop}
            onDragOver={handleDragOver}
            style={{
              border: '2px dashed #808080',
              borderRadius: '8px',
              padding: '20px',
              textAlign: 'center',
              fontFamily: 'Poppins, sans-serif',
              color: '#808080',
            }}
          >
            Drag and drop the Memorandum of Agreement here
          </Box>
        </DialogContent>
        <DialogActions style={{ padding: '16px' }}>
          <Button
            style={{
              backgroundColor: '#ffffff',
              color: 'black',
              border: '2px solid #808080',
              borderRadius: '8px',
              marginRight: '8px',
              fontFamily: 'Poppins, sans-serif',
            }}
            onClick={handleMOAModalClose}
          >
            Close
          </Button>
          <Button
            style={{
              backgroundColor: '#ffffff',
              color: 'black',
              border: '2px solid #808080',
              borderRadius: '8px',
              fontFamily: 'Poppins, sans-serif',
            }}
            onClick={handleFileUpload}
          >
            Upload
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default HTEFilesUpload;
