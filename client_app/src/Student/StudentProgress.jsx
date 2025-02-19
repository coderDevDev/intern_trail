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

import StudentDTR from './StudentDTR';

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
      <h1 className='font-bold mb-4'>Progress Reports</h1>

      <div className="progress-container">
        <StudentDTR />
      </div>


    </div>
  );
}

export default StudentProgress;