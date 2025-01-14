import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  FormControl,
  FormLabel
} from '@mui/material';
import '../index.css'; // Adjust the import path if necessary

const HTEAnnouncements = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isComposeModalOpen, setIsComposeModalOpen] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [newAnnouncement, setNewAnnouncement] = useState({
    user: 'HTE Supervisor', // Replace with actual supervisor name
    time: new Date().toLocaleString(),
    title: '',
    subject: '',
    body: ''
  });

  const handleNotificationClick = (notification) => {
    setSelectedNotification(notification);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedNotification(null);
  };

  const handleDelete = () => {
    // Implement delete functionality here
    closeModal();
  };

  const handleEdit = () => {
    // Implement edit functionality here
  };

  const handleCompose = () => {
    setIsComposeModalOpen(true);
  };

  const closeComposeModal = () => {
    setIsComposeModalOpen(false);
    setNewAnnouncement({
      user: 'HTE Supervisor', // Replace with actual supervisor name
      time: new Date().toLocaleString(),
      title: '',
      subject: '',
      body: ''
    });
  };

  const handleComposeChange = (e) => {
    const { name, value } = e.target;
    setNewAnnouncement((prev) => ({ ...prev, [name]: value }));
  };

  const handleComposeSubmit = () => {
    // Implement submit functionality here
    closeComposeModal();
  };

  const notifications = [
    {
      id: 1,
      user: 'Juan Dela Cruz',
      time: '5h',
      message: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
      title: 'Notification Title 1',
      subject: 'Subject 1',
      body: 'Detailed message for notification 1.'
    },
    {
      id: 2,
      user: 'Juan Dela Cruz',
      time: '12d',
      message: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.',
      title: 'Notification Title 2',
      subject: 'Subject 2',
      body: 'Detailed message for notification 2.'
    },
    {
      id: 3,
      user: 'Juan Dela Cruz',
      time: 'Jun 3',
      message: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
      title: 'Notification Title 3',
      subject: 'Subject 3',
      body: 'Detailed message for notification 3.'
    }
  ];

  return (
    <div className="announcements-page">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1>Notifications</h1>
          <h5>Admin Announcements</h5>
        </div>
        <Button
          variant="contained"
          color="primary"
          onClick={handleCompose}
        >
          Compose
        </Button>
      </div>
      {notifications.map(notification => (
        <div key={notification.id} className="notification-panel" onClick={() => handleNotificationClick(notification)}>
          <div className="notification-content">
            <div className="notification-user">
              <img
                src="../anyrgb.com.png"
                alt="User Profile"
                className="profile-picture"
              />
              <div>
                <h5 className="user-name">{notification.user}
                  <span className='notification-time'> • {notification.time}</span>
                </h5>
                <p className="user-message">
                  {notification.message}
                </p>
              </div>
            </div>
          </div>
        </div>
      ))}
      {isModalOpen && selectedNotification && (
        <Dialog
          open={isModalOpen}
          onClose={closeModal}
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
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontFamily: 'Poppins, sans-serif',
              fontWeight: 600,
              color: '#000',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <img
                src="../anyrgb.com.png"
                alt="User Profile"
                style={{ width: '40px', height: '40px', borderRadius: '50%', marginRight: '10px' }}
              />
              <Typography variant="h6" style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600 }}>
                {selectedNotification.user}
              </Typography>
            </div>
            <Typography variant="body2" style={{ fontFamily: 'Poppins, sans-serif', color: '#808080' }}>
              {selectedNotification.time}
            </Typography>
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
            <Typography variant="h6" style={{ marginBottom: '10px', fontFamily: 'Poppins, sans-serif', fontWeight: 600 }}>
              {selectedNotification.title}
            </Typography>
            <Typography variant="body1" style={{ marginBottom: '20px' }}>
              {selectedNotification.body}
            </Typography>
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
              onClick={handleEdit}
            >
              Edit
            </Button>
            <Button
              style={{
                backgroundColor: '#ffffff',
                color: 'black',
                border: '2px solid #808080',
                borderRadius: '8px',
                marginRight: '8px',
                fontFamily: 'Poppins, sans-serif',
              }}
              onClick={handleDelete}
            >
              Delete
            </Button>
            <Button
              style={{
                backgroundColor: '#ffffff',
                color: 'black',
                border: '2px solid #808080',
                borderRadius: '8px',
                marginRight: '8px',
                fontFamily: 'Poppins, sans-serif',
              }}
              onClick={closeModal}
            >
              Close
            </Button>
          </DialogActions>
        </Dialog>
      )}
      {isComposeModalOpen && (
        <Dialog
          open={isComposeModalOpen}
          onClose={closeComposeModal}
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
            }}
          >
            Compose Announcement
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
            <FormControl margin="normal" fullWidth>
              <FormLabel
                sx={{
                  fontFamily: 'Poppins, sans-serif',
                  fontSize: '16px', // Adjust as needed
                  color: '#000',
                  marginBottom: '4px',
                }}
              >
                Title
              </FormLabel>
              <TextField
                variant="outlined"
                name="title"
                value={newAnnouncement.title}
                onChange={handleComposeChange}
                InputProps={{
                  sx: {
                    fontSize: '14px', // Adjust input text size
                    fontFamily: 'Poppins, sans-serif',
                    height: '40px',
                  },
                }}
                InputLabelProps={{
                  sx: {
                    fontSize: '14px', // Adjust label size
                    fontFamily: 'Poppins, sans-serif',
                  },
                }}
                sx={{
                  borderRadius: '8px',
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                      borderColor: '#808080',
                      borderWidth: '2px',
                    },
                    '&:hover fieldset': {
                      borderColor: '#1F41BB',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#1F41BB',
                    },
                  },
                }}
              />
            </FormControl>
            <FormControl margin="normal" fullWidth>
              <FormLabel
                sx={{
                  fontFamily: 'Poppins, sans-serif',
                  fontSize: '16px', // Adjust as needed
                  color: '#000',
                  marginBottom: '4px',
                }}
              >
                Subject
              </FormLabel>
              <TextField
                variant="outlined"
                name="subject"
                value={newAnnouncement.subject}
                onChange={handleComposeChange}
                InputProps={{
                  sx: {
                    fontSize: '14px', // Adjust input text size
                    fontFamily: 'Poppins, sans-serif',
                    height: '40px',
                  },
                }}
                InputLabelProps={{
                  sx: {
                    fontSize: '14px', // Adjust label size
                    fontFamily: 'Poppins, sans-serif',
                  },
                }}
                sx={{
                  borderRadius: '8px',
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                      borderColor: '#808080',
                      borderWidth: '2px',
                    },
                    '&:hover fieldset': {
                      borderColor: '#1F41BB',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#1F41BB',
                    },
                  },
                }}
              />
            </FormControl>
            <FormControl margin="normal" fullWidth>
              <FormLabel
                sx={{
                  fontFamily: 'Poppins, sans-serif',
                  fontSize: '16px', // Adjust as needed
                  color: '#000',
                  marginBottom: '4px',
                }}
              >
                Body
              </FormLabel>
              <TextField
                variant="outlined"
                name="body"
                value={newAnnouncement.body}
                onChange={handleComposeChange}
                multiline
                rows={4}
                InputProps={{
                  sx: {
                    fontSize: '14px', // Adjust input text size
                    fontFamily: 'Poppins, sans-serif',
                  },
                }}
                InputLabelProps={{
                  sx: {
                    fontSize: '14px', // Adjust label size
                    fontFamily: 'Poppins, sans-serif',
                  },
                }}
                sx={{
                  borderRadius: '8px',
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                      borderColor: '#808080',
                      borderWidth: '2px',
                    },
                    '&:hover fieldset': {
                      borderColor: '#1F41BB',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#1F41BB',
                    },
                  },
                }}
              />
            </FormControl>
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
              onClick={closeComposeModal}
            >
              Cancel
            </Button>
            <Button
              style={{
                backgroundColor: '#1F41BB',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontFamily: 'Poppins, sans-serif',
              }}
              onClick={handleComposeSubmit}
            >
              Submit
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </div>
  );
};

export default HTEAnnouncements;