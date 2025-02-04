import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
} from '@mui/material';
import '../index.css'; // Adjust the import path if necessary

function ArchivedModal({ open, onClose, onViewInfo }) {
  const [archivedStudents, setArchivedStudents] = useState([
    {
      profilePicture: '../anyrgb.com.png',
      name: 'Juan Dela Cruz',
      studentId: '21-345-6780',
      course: 'BSCpE - 4th Year',
    },
    {
      profilePicture: '../anyrgb.com.png',
      name: 'Maria Clara',
      studentId: '21-345-6781',
      course: 'BSCpE - 4th Year',
    },
    {
      profilePicture: '../anyrgb.com.png',
      name: 'Jose Rizal',
      studentId: '21-345-6782',
      course: 'BSCpE - 4th Year',
    },
    {
      profilePicture: '../anyrgb.com.png',
      name: 'Andres Bonifacio',
      studentId: '21-345-6783',
      course: 'BSCpE - 4th Year',
    },
  ]);

  const handleViewInfo = (student) => {
    onViewInfo(student);
  };

  const handleApprove = (student) => {
    console.log('Approve clicked for', student);
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
          fontFamily: 'Poppins, sans-serif',
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
        Archived Students
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
        <List>
          {archivedStudents.map((student, index) => (
            <ListItem key={index}>
              <ListItemAvatar>
                <Avatar src={student.profilePicture} alt="Profile" />
              </ListItemAvatar>
              <ListItemText
                primary={student.name}
                secondary={`${student.course} - ${student.studentId}`}
                sx={{ 
                    '& .MuiListItemText-primary': {
                    fontFamily: 'Poppins, sans-serif',
                    },
                    '& .MuiListItemText-secondary': {
                    fontFamily: 'Poppins, sans-serif',
                    }
                }}
                />
              <ListItemSecondaryAction>
                <Button
                  style={{
                    backgroundColor: '#ffffff',
                    color: 'black',
                    border: '2px solid #808080',
                    borderRadius: '8px',
                    marginRight: '8px',
                    fontFamily: 'Poppins, sans-serif',
                  }}
                  onClick={() => handleViewInfo(student)}
                >
                  View Info
                </Button>
                <Button
                  style={{
                    backgroundColor: '#1F41BB',
                    color: 'white',
                    border: '2px solid #1F41BB',
                    borderRadius: '8px',
                    fontFamily: 'Poppins, sans-serif',
                  }}
                  onClick={() => handleApprove(student)}
                >
                  Approve
                </Button>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>
      </DialogContent>
      <DialogActions style={{ padding: '16px' }}>
        <Button
          style={{
            backgroundColor: '#ffffff',
            color: 'black',
            border: '2px solid #808080',
            borderRadius: '8px',
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

export default ArchivedModal;