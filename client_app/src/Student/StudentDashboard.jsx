import React, { useState, useRef, useEffect } from 'react';
import { Container, Navbar } from 'react-bootstrap';
import { Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import Calendar from 'react-calendar';
import '../index.css';
import 'react-calendar/dist/Calendar.css';
import '../calendar.css';
import StudentAnnouncements from './StudentAnnouncements';
import StudentCompanies from './StudentCompanies';
import StudentFiles from './StudentFiles';
import StudentProgress from './StudentProgress';
import StudentReports from './StudentReports';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/ExitToApp';
import ProfileModal from './StudentProfile'; // Adjust if necessary
import AccountInfoPopup from '../components/AccountInfoPopup';
import { ClipboardList, CheckCircle2, Circle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import axios from 'axios';
import { toast } from 'react-toastify';

import StudentHome from './StudentDashboard/StudentHome';



function AdditionalContent() {
  return (
    <div className="additional-content">
      <h5>Remaining Hours</h5>
      <div className="remaining-hours-box">
        <div className="remaining-hours-content">
          <span style={{ fontWeight: 600, color: '#1F41BB', marginRight: '5px' }}>
            176 Hours
          </span>
          <span style={{ fontWeight: 400, marginRight: '5px' }}>and</span>
          <span style={{ fontWeight: 600, color: '#1F41BB', marginRight: '5px' }}>
            46 Minutes
          </span>
          <span style={{ fontWeight: 400 }}>left</span>
        </div>
      </div>

      <div className="calendar-container">
        <h5>Calendar</h5>
        <Calendar className="my-custom-calendar" />
      </div>
      {/* <div className="info-container">
        <h5 style={{ marginTop: '20px' }}>Requirements Checklist</h5>
        <div className="requirements-checklist">
          <ul>
            <li>
              <input type="checkbox" id="requirement1" name="requirement1" />
              <label htmlFor="requirement1" style={{ marginLeft: '10px' }}>
                Requirement 1
              </label>
            </li>
            <li>
              <input type="checkbox" id="requirement2" name="requirement2" />
              <label htmlFor="requirement2" style={{ marginLeft: '10px' }}>
                Requirement 2
              </label>
            </li>
            <li>
              <input type="checkbox" id="requirement3" name="requirement3" />
              <label htmlFor="requirement3" style={{ marginLeft: '10px' }}>
                Requirement 3
              </label>
            </li>
          </ul>
        </div>
      </div> */}
    </div>
  );
}

function StudentDashboard() {
  const location = useLocation();
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(false); // Define expanded state
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [requirements, setRequirements] = useState([]);
  const [completedRequirements, setCompletedRequirements] = useState([]);

  const handleProfileClick = () => {
    setIsPopupOpen(true);
  };

  const handleProfileOpen = () => {
    setIsPopupOpen(false);
    setIsProfileModalOpen(true);
  };

  const handleClosePopup = () => {
    setIsPopupOpen(false);
  };

  const handleProfileModalClose = () => {
    setIsProfileModalOpen(false);
  };

  const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser') || '{}');

  // Fetch requirements from company
  const fetchRequirements = async () => {
    try {
      const response = await axios.get('/company/student-requirements', {
        params: {
          student_id: loggedInUser.id
        }
      });

      if (response.data.success) {
        const companyReqs = response.data.data;
        setRequirements(companyReqs);
      }
    } catch (error) {
      console.error('Error fetching requirements:', error);
      toast.error('Failed to fetch requirements');
    }
  };

  useEffect(() => {
    fetchRequirements();
  }, []);

  // Calculate progress
  const calculateProgress = (requirements) => {
    if (!requirements || requirements.length === 0) return 1; // Default to 1% if there are no requirements

    const completed = requirements.filter((req) => req.status === "completed").length;
    const progress = (completed / requirements.length) * 100;

    return progress > 0 ? progress : 100; // Ensure minimum progress is 1%
  };

  console.log({ loggedInUser })
  return (
    <div>
      {/* Navbar */}
      <Navbar bg="white" variant="light" className='mx-2'>
        <Container fluid className="d-flex justify-content-between align-items-center">
          <Navbar.Toggle aria-controls="sidebar-nav" className="d-md-none" />
          <Navbar.Brand className="d-flex align-items-left mx-auto my-8">
            <img
              src="/logo.png"
              width="150px"
              height="150px"
              className="d-inline-block align-top me-2"
              alt="Logo"
            />
          </Navbar.Brand>
          <div className="account-info">
            <img
              src={loggedInUser.proof_identity || "../anyrgb.com.png"}
              alt="Profile"
              className="w-[50px] h-[50px] rounded-full mr-[15px]"
              onClick={handleProfileClick}
            />
            {isPopupOpen && (
              <AccountInfoPopup
                onClose={handleClosePopup}
                onProfileOpen={handleProfileOpen}
                userEmail={loggedInUser.email}
                loggedInUser={loggedInUser}
              />
            )}
          </div>
        </Container>
      </Navbar>

      <ProfileModal open={isProfileModalOpen} onClose={handleProfileModalClose} />

      {/* Dashboard Layout */}
      <div className="dashboard-container">
        <Sidebar expanded={expanded} setExpanded={setExpanded} />
        <div className="main-content">
          <Routes>
            <Route
              path="/home"
              element={
                <StudentHome />
                // <>
                //   <h1>Dashboard</h1>
                //   <div className="grid gap-4 md:grid-cols-1 mt-2">
                //     {requirements.map((company) => (
                //       <Card key={company.id} className="shadow-lg">
                //         <CardHeader className="space-y-1">
                //           <CardTitle className="text-2xl">
                //             {company.name}
                //           </CardTitle>
                //           <div className="text-sm text-gray-500">
                //             Requirements Progress
                //           </div>
                //         </CardHeader>
                //         <CardContent>
                //           <div className="mb-4">
                //             <Progress
                //               value={calculateProgress(company.requirements)}
                //               className="h-2"
                //             />
                //             <div className="mt-1 text-sm text-gray-500">
                //               {calculateProgress(company.requirements)}% Complete
                //             </div>
                //           </div>
                //           <div className="space-y-4">
                //             {company.requirements.map((req, index) => (
                //               <div
                //                 key={index}
                //                 className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50"
                //               >
                //                 <CheckCircle2 className="h-5 w-5 text-green-500" />
                //                 <div className="flex-1">
                //                   <div className="font-medium">{req.label}</div>
                //                   {req.status === 'completed' && (
                //                     <div className="text-sm text-gray-500">
                //                       Submitted on {new Date(req.submitted_date).toLocaleDateString()}
                //                     </div>
                //                   )}
                //                 </div>
                //                 {req.status !== 'completed' && (
                //                   <Button
                //                     size="sm"
                //                     variant="outline"
                //                   // onClick={() => {
                //                   //   navigate('/student/files', { state: { companyId: company.id } });
                //                   // }}
                //                   >
                //                     View
                //                   </Button>
                //                 )}
                //               </div>
                //             ))}
                //           </div>
                //         </CardContent>
                //       </Card>
                //     ))}
                //   </div>
                // </>
              }
            />
            <Route path="/announcements" element={<StudentAnnouncements />} />
            <Route path="/companies" element={<StudentCompanies />} />
            <Route path="/files" element={<StudentFiles />} />
            <Route path="/progress-reports" element={<StudentProgress />} />
            <Route path="/emergency-reports" element={<StudentReports />} />
          </Routes>
        </div>
        {/* {location.pathname === '/student/home' && <AdditionalContent />} */}
      </div>
    </div>
  );
}


// function StudentDashboardV2() {
//   return (
//     <div>
//       <StudentHome />
//     </div>
//   );
// }
export default StudentDashboard;