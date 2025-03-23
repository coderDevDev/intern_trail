import React, { useState, useEffect } from 'react';
import '../index.css'; // Adjust the import path if necessary
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import AssignmentIcon from '@mui/icons-material/TaskAltOutlined';
import axios from 'axios';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import UploadFileIcon from '@mui/icons-material/UploadFile';

import StudentDTR from './StudentDTR';
import WeeklyReport from './WeeklyReport';
import { useParams } from 'react-router-dom';

function StudentProgress() {
  const [open, setOpen] = useState(false);
  const [supervisorName, setSupervisorName] = useState('');
  const [weeklyReportData, setWeeklyReportData] = useState([]);
  const [studentData, setStudentData] = useState(null);

  let [isLoaded, setIsLoaded] = useState(false);

  let { studentId } = useParams();


  const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));

  if (studentId == null) {
    studentId = loggedInUser.userID;
  }

  // Fetch student data including company info
  const fetchStudentData = async () => {
    try {

      console.log("deeeeeeee")
      const response = await axios.get(`/trainee/details/${studentId}`);



      if (response.data.success) {
        setStudentData(response.data.data);
        // Once we have company ID, fetch supervisor details
        if (response.data.data.companyId) {
          fetchSupervisorDetails(response.data.data.companyId);
        }
      }
    } catch (error) {
      console.error('Error fetching student details:', error);
    }
  };

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

  const fetchSupervisorDetails = async (companyId) => {
    try {

      console.log("fetchSupervisorDetails")
      const response = await axios.get(`/company/supervisor/${companyId}`);
      console.log({ response })
      if (response.data.success) {
        const { first_name, last_name } = response.data.data;
        setSupervisorName(`${first_name} ${last_name}`);
      }
    } catch (error) {
      console.error('Error fetching supervisor details:', error);
    }
  };

  useEffect(() => {
    if (studentId) {
      fetchStudentData();

    }
  }, [studentId]);

  useEffect(() => {


    if (supervisorName !== null) {

      console.log({ supervisorName })
      setIsLoaded(true);
    }
  }, [supervisorName])


  return isLoaded && (
    <div className='space-y-4 sm:space-y-6'>
      <h1 className='text-xl sm:text-2xl font-semibold'>Progress Reports</h1>

      <div className="progress-container">
        <StudentDTR
          supervisorName={supervisorName}
        />
      </div>



      {/* <WeeklyReport
        weeklyReport={weeklyReportData}
        supervisorName={supervisorName}
      /> */}

    </div>
  );
}

export default StudentProgress;