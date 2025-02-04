import React, { useState, useEffect, useRef } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  IconButton,
  Avatar,
  FormControl,
  FormLabel,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import '../index.css'; // Adjust the import path if necessary

function HTEProfileModal({ open, onClose }) {
  const [isHovered, setIsHovered] = useState(false);
  const [isEditable, setIsEditable] = useState(false); // State to control editability
  const modalRef = useRef(null);

  const [profileData, setProfileData] = useState({
    profilePicture: '../anyrgb.com.png',
    email: '',
    firstName: '',
    middleInitial: '',
    lastName: '',
    phone: '',
    userRole: '',
    college: '',
    program: '',
    company: '',
    HTEId: '',
  });

  // Close the Profile Modal if clicked outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfileData({ ...profileData, [name]: value });
  };

  const handleSave = () => {
    setIsEditable(false); // Disable editing after saving
    onClose();
  };

  const handleEditClick = () => {
    setIsEditable(true); // Enable editing
  };

  const handlePictureUpload = () => {
    // Upload logic here...
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
      {/* Wrap actual content in a ref to detect outside clicks */}
      <div ref={modalRef}>
        <DialogTitle
          style={{
            fontFamily: 'Poppins, sans-serif',
            fontWeight: 600,
            color: '#000',
          }}
        >
          HTE Profile
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
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <Avatar
              src={profileData.profilePicture}
              alt="Profile"
              style={{
                width: '150px',
                height: '150px',
                margin: '0 auto',
                filter: isHovered ? 'brightness(70%)' : 'none',
                transition: 'filter 0.2s ease',
              }}
            />
            {isHovered && (
              <IconButton
                onClick={handlePictureUpload}
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  backgroundColor: '#fff',
                  boxShadow: '0 0 5px rgba(0, 0, 0, 0.2)',
                }}
              >
                <EditIcon />
              </IconButton>
            )}
          </div>

          <Button
            variant="contained"
            color="primary"
            onClick={handleEditClick}
            style={{
              display: 'block',
              margin: '0 auto 20px auto',
              fontFamily: 'Poppins, sans-serif',
            }}
          >
            Edit Profile
          </Button>

          <h5 style={{marginBottom:'0', marginTop:'20px'}}>User Information</h5>

          {/* Text Field Styles */}
          <FormControl margin="normal" fullWidth>
            <FormLabel
              sx={{
                fontFamily: 'Poppins, sans-serif',
                fontSize: '16px', // Adjust as needed
                color: '#000',
                marginBottom: '4px',
              }}
            >
              Email
            </FormLabel>
            <TextField
              variant="outlined"
              name="email"
              value={profileData.email}
              onChange={handleChange}
              disabled={!isEditable} // Controlled by state
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

          {/* Repeat for other fields */}
          <FormControl margin="normal" fullWidth>
            <FormLabel
              sx={{
                fontFamily: 'Poppins, sans-serif',
                fontSize: '16px', // Adjust as needed
                color: '#000',
                marginBottom: '4px',
              }}
            >
              First Name
            </FormLabel>
            <TextField
              variant="outlined"
              name="firstName"
              value={profileData.firstName}
              onChange={handleChange}
              disabled={!isEditable} // Controlled by state
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
              Middle Initial
            </FormLabel>
            <TextField
              variant="outlined"
              name="middleInitial"
              value={profileData.middleInitial}
              onChange={handleChange}
              disabled={!isEditable} // Controlled by state
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
              Last Name
            </FormLabel>
            <TextField
              variant="outlined"
              name="lastName"
              value={profileData.lastName}
              onChange={handleChange}
              disabled={!isEditable} // Controlled by state
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
              Phone
            </FormLabel>
            <TextField
              variant="outlined"
              name="phone"
              value={profileData.phone}
              onChange={handleChange}
              disabled={!isEditable} // Controlled by state
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
              User Role
            </FormLabel>
            <TextField
              variant="outlined"
              name="userRole"
              value={profileData.userRole}
              onChange={handleChange}
              disabled={!isEditable} // Controlled by state
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
              Company
            </FormLabel>
            <TextField
              variant="outlined"
              name="HTEId"
              value={profileData.company}
              onChange={handleChange}
              disabled={!isEditable} // Controlled by state
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
          

          <h5 style={{marginBottom:'0', marginTop:'20px'}}>Change Password</h5>

          <FormControl margin="normal" fullWidth>
            <FormLabel
              sx={{
                fontFamily: 'Poppins, sans-serif',
                fontSize: '16px', // Adjust as needed
                color: '#000',
                marginBottom: '4px',
              }}
            >
              Current Password
            </FormLabel>
            <TextField
              variant="outlined"
              name="HTEd"
              value={profileData.HTEId}
              onChange={handleChange}
              disabled={!isEditable} // Controlled by state
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
              New Password
            </FormLabel>
            <TextField
              variant="outlined"
              name="HTEId"
              value={profileData.HTEId}
              onChange={handleChange}
              disabled={!isEditable} // Controlled by state
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
              Confirm New Password
            </FormLabel>
            <TextField
              variant="outlined"
              name="HTEId"
              value={profileData.HTEId}
              onChange={handleChange}
              disabled={!isEditable} // Controlled by state
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
            Discard
          </Button>
          <Button
            style={{
              backgroundColor: '#1F41BB',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontFamily: 'Poppins, sans-serif',
            }}
            onClick={handleSave}
          >
            Save
          </Button>
        </DialogActions>
      </div>
    </Dialog>
  );
}

export default HTEProfileModal;