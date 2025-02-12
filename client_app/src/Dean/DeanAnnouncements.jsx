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
import AnnouncementCard from '../components/Announcements/Announcements';

const CoordinatorAnnouncements = () => {
  return <div>
    <AnnouncementCard />
  </div>
};

export default CoordinatorAnnouncements;