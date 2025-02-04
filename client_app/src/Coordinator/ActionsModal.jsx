import React, { useState, useEffect, useRef } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Avatar,
} from '@mui/material';
import '../index.css'; // Adjust the import path if necessary

function ActionsModal({ open, onClose }) {
  const modalRef = useRef(null);

  const [contactData, setContactData] = useState({
    profilePicture: '../anyrgb.com.png',
    name: 'Juan Dela Cruz',
    studentId: '21-345-6780', // Added student ID field
    course: 'BSCpE - 4th Year',
    department: 'CECT',
    email: 'email@email.com',
    contactNumber: '0912-345-6789',
  });

  // Close the Contact Modal if clicked outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

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
      {/* Wrap actual content in a ref to detect outside clicks */}
      <div ref={modalRef}>
        <DialogTitle
          style={{
            fontFamily: 'Poppins, sans-serif',
            fontWeight: 600,
            color: '#000',
            textAlign: 'left',
          }}
        >
          Student Info
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
          <div
            style={{
              textAlign: 'center',
              marginBottom: '20px',
              position: 'relative',
            }}
          >
            <Avatar
              src={contactData.profilePicture}
              alt="Profile"
              style={{
                width: '150px',
                height: '150px',
                margin: '0 auto',
                transition: 'filter 0.2s ease',
              }}
            />
          </div>

          <div
            style={{
              textAlign: 'center',
              fontSize: '16px',
              fontFamily: 'Poppins, sans-serif',
              marginBottom: '20px',
            }}
          >
            <div style={{ marginBottom: '10px' }}>
                {contactData.name}
            </div>
            <div style={{ marginBottom: '10px' }}>
                {contactData.studentId} 
            </div>
            <div style={{ marginBottom: '10px' }}>
                {contactData.course}
            </div>
            <div style={{ marginBottom: '10px' }}>
                {contactData.department}
            </div>
            <div style={{ marginBottom: '10px' }}>
                {contactData.email}
            </div>
            <div style={{ marginBottom: '10px' }}>
                {contactData.contactNumber}
            </div>
          </div>
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
          <Button
            style={{
              backgroundColor: '#fff',
              color: '#F44336',
              border: '2px solid #F44336',
              borderRadius: '8px',
              fontFamily: 'Poppins, sans-serif',
            }}
            onClick={() => console.log('Archive clicked')}
          >
            Archive
          </Button>

          <Button
            style={{
              backgroundColor: '#1F41BB',
              color: 'white',
              border: '2px solid #1F41BB',
              borderRadius: '8px',
              marginRight: '8px',
              fontFamily: 'Poppins, sans-serif',
            }}
            onClick={() => console.log('Approve clicked')}
          >
            Approve
          </Button>
        </DialogActions>
      </div>
    </Dialog>
  );
}

export default ActionsModal;