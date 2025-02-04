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

function ContactModal({ open, onClose }) {
  const modalRef = useRef(null);

  const [contactData, setContactData] = useState({
    profilePicture: '../anyrgb.com.png',
    name: '',
    department: '',
    email: '',
    contactNumber: '',
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
          Contact
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
            }}
          >
            <div style={{ marginBottom: '10px' }}>
              <h6>Juan Dela Cruz</h6> {contactData.name}
            </div>
            <div style={{ marginBottom: '10px' }}>
              <h6>IT Department</h6> {contactData.department}
            </div>
            <div style={{ marginBottom: '10px' }}>
              <h6>email@email.com</h6> {contactData.email}
            </div>
            <div style={{ marginBottom: '10px' }}>
              <h6>0912-345-6789</h6> {contactData.contactNumber}
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
        </DialogActions>
      </div>
    </Dialog>
  );
}

export default ContactModal;