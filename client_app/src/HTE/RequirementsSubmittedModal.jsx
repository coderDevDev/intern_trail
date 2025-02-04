import React, { useEffect, useState, useMemo } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Grid, Typography } from '@mui/material';
import pdfIcon from '../icons/pdf.png'; // Placeholder icon for PDF files
import docxIcon from '../icons/word.png'; // Placeholder icon for DOCX files
import imageThumbnail from '../file3.jpg'; // Adjust the import path if necessary

const thumbnailCache = {};

function RequirementsSubmittedModal({ open, onClose }) {
  const [thumbnails, setThumbnails] = useState({});

  // Memoize the files array to prevent it from being re-created on every render
  const files = useMemo(() => [
    { name: 'File1.pdf', path: `/file1.pdf` },
    { name: 'File2.docx', path: `/file2.docx` },
    { name: 'File3.jpg', path: imageThumbnail },
  ], []);

  useEffect(() => {
    const generateThumbnails = async () => {
      const newThumbnails = {};

      for (const file of files) {
        if (thumbnailCache[file.name]) {
          newThumbnails[file.name] = thumbnailCache[file.name];
        } else {
          if (file.name.endsWith('.pdf')) {
            newThumbnails[file.name] = pdfIcon;
            thumbnailCache[file.name] = pdfIcon;
          } else if (file.name.endsWith('.docx')) {
            newThumbnails[file.name] = docxIcon;
            thumbnailCache[file.name] = docxIcon;
          } else if (file.name.endsWith('.jpg') || file.name.endsWith('.png')) {
            newThumbnails[file.name] = file.path;
            thumbnailCache[file.name] = file.path;
          }
        }
      }

      setThumbnails(newThumbnails);
    };

    generateThumbnails();
  }, [files]); // `files` is now stable due to useMemo

  const handleFileClick = (fileName) => {
    console.log(`Clicked on ${fileName}`);
    // Add your logic to handle file click here
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="md"
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
        }}
      >
        Requirements Submitted
      </DialogTitle>
      <DialogContent
        dividers={false}
        style={{
          fontFamily: 'Poppins, sans-serif',
          color: '#000',
          overflowY: 'scroll',
          scrollbarWidth: 'none', /* Firefox */
          msOverflowStyle: 'none', /* Internet Explorer 10+ */
          margin: '14px 8px',
        }}
      >
        <Grid container spacing={2}>
          {files.map((file, index) => (
            <Grid item xs={4} key={index} style={{ textAlign: 'center' }}>
              <div onClick={() => handleFileClick(file.name)} style={{ cursor: 'pointer' }}>
                {thumbnails[file.name] ? (
                  <img src={thumbnails[file.name]} alt={file.name} style={{ width: '50px', height: '50px' }} />
                ) : (
                  <Typography variant="body2" style={{ fontFamily: 'Poppins, sans-serif', marginTop: '8px' }}>
                    Loading...
                  </Typography>
                )}
                <Typography variant="body2" style={{ fontFamily: 'Poppins, sans-serif', marginTop: '8px' }}>
                  {file.name}
                </Typography>
              </div>
            </Grid>
          ))}
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button
          style={{
            backgroundColor: '#ffffff',
            color: 'black',
            border: '2px solid #808080',
            borderRadius: '8px',
            marginRight: '16px',
            marginBottom: '8px',
            fontFamily: 'Poppins, sans-serif',
            fontWeight: 600,
          }}
          onClick={onClose}
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default RequirementsSubmittedModal;
