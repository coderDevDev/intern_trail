import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography
} from '@mui/material';

const StudentAnnouncements = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);

  const handleNotificationClick = (notification) => {
    setSelectedNotification(notification);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedNotification(null);
  };

  const notifications = [
    {
      id: 1,
      user: 'Juan Dela Cruz',
      time: '11-12-2024',
      message: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
      title: 'Notification Title 1',
      body: 'Detailed message for notification 1.'
    },
    {
      id: 2,
      user: 'Juan Dela Cruz',
      time: '11-12-2024',
      message: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
      title: 'Notification Title 2',
      body: 'Detailed message for notification 2.'
    }
  ];

  return (
    <div>
      <h1>Notifications</h1>
      <h5>Admin Announcements</h5>
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
              onClick={closeModal}
            >
              Close
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </div>
  );
};

export default StudentAnnouncements;