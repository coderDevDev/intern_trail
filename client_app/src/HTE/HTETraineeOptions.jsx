import React, { useState } from 'react';
import { IconButton, Menu, MenuItem } from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import RequirementsSubmittedModal from './RequirementsSubmittedModal';
import ContactModal from './ContactModal';
import UploadCertificateModal from './UploadCertificateModal';

function HTETraineeOptions() {
  const [anchorEl, setAnchorEl] = useState(null);
  const [isRequirementsModalOpen, setIsRequirementsModalOpen] = useState(false);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [isUploadCertificateModalOpen, setIsUploadCertificateModalOpen] = useState(false);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleRequirementsOpen = () => {
    setIsRequirementsModalOpen(true);
    handleMenuClose();
  };

  const handleRequirementsClose = () => {
    setIsRequirementsModalOpen(false);
  };

  const handleContactOpen = () => {
    setIsContactModalOpen(true);
    handleMenuClose();
  };

  const handleContactClose = () => {
    setIsContactModalOpen(false);
  };

  const handleUploadCertificateOpen = () => {
    setIsUploadCertificateModalOpen(true);
    handleMenuClose();
  };

  const handleUploadCertificateClose = () => {
    setIsUploadCertificateModalOpen(false);
  };

  return (
    <div>
      <IconButton component="div" onClick={handleMenuOpen}>
        <MoreVertIcon />
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleRequirementsOpen} component="div">
          Requirements Submitted
        </MenuItem>
        <MenuItem onClick={handleContactOpen} component="div">
          Contact
        </MenuItem>
        <MenuItem onClick={handleMenuClose} component="div">
          Evaluation Form
        </MenuItem>
        <MenuItem onClick={handleUploadCertificateOpen} component="div">
          Upload Certificate
        </MenuItem>
      </Menu>
      <RequirementsSubmittedModal open={isRequirementsModalOpen} onClose={handleRequirementsClose} />
      <ContactModal open={isContactModalOpen} onClose={handleContactClose} />
      <UploadCertificateModal open={isUploadCertificateModalOpen} onClose={handleUploadCertificateClose} />
    </div>
  );
}

export default HTETraineeOptions;
