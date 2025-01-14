import React, { useState } from 'react';
import '../index.css'; // Adjust the import path if necessary
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import AssignmentIcon from '@mui/icons-material/TaskAltOutlined';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import UploadFileIcon from '@mui/icons-material/UploadFile';

function StudentProgress() {
  const [open, setOpen] = useState(false);

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const reports = [
    {
      title: 'Daily Time Record',
      description: 'Upload your Daily Time Record here.',
      buttonText: 'Update',
      icon: <AccessTimeIcon style={{ fontSize: 36 }} />,
    },
    {
      title: 'OJT Accomplishment Report',
      description: 'Update your OJT Accomplishment Report here.',
      buttonText: 'Update',
      icon: <AssignmentIcon style={{ fontSize: 36 }} />,
      action: handleOpen,
    },
  ];

  return (
    <div>
      <h1>Progress Reports</h1>
      <h5>Update your Accomplishments</h5>
      <div className="progress-container">
        {reports.map((report, index) => (
          <div key={index} className="progress-box">
            <div className="progress-header">
              {report.icon}
              <h5 className="progress-title">{report.title}</h5>
            </div>
            <p className="progress-description">{report.description}</p>
            {report.title === 'OJT Accomplishment Report' ? (
              <button className="update-button" onClick={report.action}>
                {report.buttonText}
              </button>
            ) : (
              <button className="update-button">
                {report.buttonText}
              </button>
            )}
          </div>
        ))}
      </div>

      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
        <DialogTitle>
          Update OJT Accomplishment Report
          <IconButton
            aria-label="close"
            onClick={handleClose}
            style={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <div style={{ marginBottom: 20 }}>
            <Button
              variant="outlined"
              component="label"
              startIcon={<UploadFileIcon />}
            >
              Upload File
              <input type="file" hidden />
            </Button>
          </div>
          <TextField
            label="AI Generated Narrative Report"
            multiline
            rows={4}
            variant="outlined"
            fullWidth
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default StudentProgress;