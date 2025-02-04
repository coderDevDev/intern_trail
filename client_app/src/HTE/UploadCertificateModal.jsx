import React, { useRef } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
} from '@mui/material';
import '../index.css'; // Adjust the import path if necessary

function UploadCertificateModal({ open, onClose }) {
  const fileInputRef = useRef(null);

  const handleBrowseClick = () => {
    fileInputRef.current.click();
  };

  const handleFileDrop = (event) => {
    event.preventDefault();
    const files = event.dataTransfer.files;
    // Handle the dropped files
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
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
        Upload Certificate
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
        <Box
          style={{
            textAlign: 'center',
            marginBottom: '20px',
            position: 'relative',
          }}
        >
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
          Drag and drop certificate file here
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
          onClick={onClose}
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default UploadCertificateModal;