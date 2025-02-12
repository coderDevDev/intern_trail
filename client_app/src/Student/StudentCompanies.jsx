import React, { useState, useEffect } from 'react';
import '../index.css'; // Adjust the import path if necessary
import './Student.css';
import SortIcon from '@mui/icons-material/Sort';
import SearchIcon from '@mui/icons-material/Search';
import StarIcon from '@mui/icons-material/Star';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography
} from '@mui/material';

import { Formik, useField, useFormik, Form } from 'formik';
import * as Yup from 'yup';

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCoffee, faEye, faEyeDropper, faMailBulk, faMailReply, faSms, faFileArrowUp } from '@fortawesome/free-solid-svg-icons'

import { useDropzone } from "react-dropzone";
function StudentCompanies() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);

  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackRating, setFeedbackRating] = useState(0);




  const [files, setFiles] = useState({
    MOA: null,

  });

  const onDrop = (acceptedFiles, fieldName) => {
    setFiles((prevFiles) => ({
      ...prevFiles,
      [fieldName]: acceptedFiles[0],
    }));
  };

  const dropzoneProps = (fieldName) => ({
    onDrop: (files) => onDrop(files, fieldName),
    accept: {
      "image/*": [".jpeg", ".png", ".jpg"],
      "application/pdf": [".pdf"],
    },
    multiple: false,
  });


  const DropzoneArea = ({ fieldName, files, dropzoneProps, setFieldValue, errors }) => {
    const { getRootProps, getInputProps, isDragActive } = useDropzone({
      ...dropzoneProps,
      onDrop: (acceptedFiles) => {

        setFieldValue(fieldName, acceptedFiles[0]);
        if (acceptedFiles.length > 0) {
          // Update files state with the new file
          setFiles((prevFiles) => ({
            ...prevFiles,
            [fieldName]: acceptedFiles[0],
          }));
        }
      },
    });


    let hasError = errors[fieldName];
    return (
      <div
        {...getRootProps()}
        className={`flex justify-center items-center w-full h-32 p-4 border-2 
         
            ${isDragActive ? "border-blue-500" : "border-gray-300"
          } border-dashed rounded-md text-sm cursor-pointer`}
      >
        <input {...getInputProps()} />
        <div>
          {files[fieldName] ? (
            <p className="text-gray-700">
              {files[fieldName].name} <span className="text-green-500">(Selected)</span>
            </p>
          ) : (
            <p className="text-gray-500">
              Drag and drop a file here, or click to select a file.
            </p>
          )}
        </div>
      </div>
    );
  };

  const handleCompanyClick = (company) => {
    setSelectedCompany(company);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedCompany(null);
  };

  const handleApplyClick = (company) => {
    setSelectedCompany(company);
    setIsApplyModalOpen(true);
  };

  const closeApplyModal = () => {
    setIsApplyModalOpen(false);
    setSelectedCompany(null);
  };

  const [sortOrder, setSortOrder] = useState('asc');
  const [sortCriteria, setSortCriteria] = useState('name');
  const [isSortModalOpen, setIsSortModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('Available');

  // const companies = [
  //   {
  //     name: 'Philippine Information Agency',
  //     logo: 'https://yt3.googleusercontent.com/ytc/AIdro_keIW9LrzLnDTC0HWc-VT5Lzq28ZH90eCe6KjwnJj1jMEU=s900-c-k-c0x00ffffff-no-rj',
  //     contact: 'piahrdd@pia.gov.ph',
  //     description: 'PIA - Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
  //     location: 'Quezon City, Metro Manila',
  //     applicationRequirements: 'Requirements for Company A.\nRequirement 1\nRequirement 2\nRequirement 3',
  //     expertise: 'A IT Tech Support',
  //     MOAApprovalStatus: 'MOA Approved',
  //     starRating: 4.5,
  //     feedback: [
  //       { student: 'Student 1', comment: 'Great experience!', date: '2023-01-01', profilePicture: 'https://via.placeholder.com/40' },
  //       { student: 'Student 2', comment: 'Learned a lot!', date: '2023-02-01', profilePicture: 'https://via.placeholder.com/40' }
  //     ]
  //   },
  //   {
  //     name: 'DOST-SEI',
  //     logo: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSHelZpTYsSK51UGDEjonNl-QlREI1O28bweA&s',
  //     contact: 'dosthr@example.com',
  //     description: 'DOST - Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
  //     location: 'Taguig City, Metro Manila',
  //     applicationRequirements: 'Requirements for Company B.\nRequirement 1\nRequirement 2\nRequirement 3',
  //     expertise: 'B Javascript Programmer',
  //     MOAApprovalStatus: 'MOA Pending',
  //     starRating: 4.0,
  //     feedback: [
  //       { student: 'Student 3', comment: 'Good company.', date: '2023-03-01', profilePicture: 'https://via.placeholder.com/40' },
  //       { student: 'Student 4', comment: 'Helpful staff.', date: '2023-04-01', profilePicture: 'https://via.placeholder.com/40' }
  //     ]
  //   },
  //   {
  //     name: 'iSynergies Inc.',
  //     logo: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ4j2_XlpIbgR-IidZJrsYGP6BXa1aHRxrrNg&s',
  //     contact: 'isynergies@example.com',
  //     description: 'ISYNERGIES - Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
  //     location: 'Cabanatuan City, Nueva Ecija',
  //     applicationRequirements: 'Requirements for Company C.\nRequirement 1\nRequirement 2\nRequirement 3',
  //     expertise: 'C PHP Programmer',
  //     MOAApprovalStatus: 'MOA Approved',
  //     starRating: 4.8,
  //     feedback: [
  //       { student: 'Student 5', comment: 'Excellent!', date: '2023-05-01', profilePicture: 'https://via.placeholder.com/40' },
  //       { student: 'Student 6', comment: 'Highly recommend.', date: '2023-06-01', profilePicture: 'https://via.placeholder.com/40' }
  //     ]
  //   },
  //   {
  //     name: 'ASKI Lending Corporation',
  //     logo: 'https://i0.wp.com/vincerapisura.com/wp/wp-content/uploads/2019/10/aski-logo.png?fit=500%2C500&ssl=1',
  //     contact: 'aski@example.com',
  //     description: 'ASKI - Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
  //     location: 'Cabanatuan City, Nueva Ecija',
  //     applicationRequirements: 'Requirements for Company D.\nRequirement 1\nRequirement 2\nRequirement 3',
  //     expertise: 'D IT Tech Support',
  //     MOAApprovalStatus: 'MOA Pending',
  //     starRating: 4.2,
  //     feedback: [
  //       { student: 'Student 7', comment: 'Good learning experience.', date: '2023-07-01', profilePicture: 'https://via.placeholder.com/40' },
  //       { student: 'Student 8', comment: 'Supportive environment.', date: '2023-08-01', profilePicture: 'https://via.placeholder.com/40' }
  //     ]
  //   }
  // ];

  const [companies, setCompanies] = useState([]);


  const fetchCompanies = async () => {
    try {
      const response = await axios.get('company/list',
        {
          params: {
            checkIfApplied: true, // New query parameter
          },
        }
      );
      let result = response.data.data
      let mappedData = result.map((company) => {
        return {
          status: company.status,
          companyID: company.companyID,
          name: company.companyName,
          logo: company.avatar_photo,
          contact: company.contact_email,
          description: `Expertise: ${company.expertise || 'N/A'}`,
          location: company.address,
          applicationRequirements: company.list_of_requirements
            ? JSON.parse(company.list_of_requirements)
              .map((req) => `- ${req.label}`)
              .join('\n')
            : 'No requirements specified.',
          expertise: company.expertise || 'No expertise provided.',
          MOAApprovalStatus: company.moa_status === 'pending' ? 'Pending Approval' : 'Approved',
          starRating: 0, // Placeholder as the response doesn't include ratings
          feedback: [], // Placeholder as the response doesn't include feedback
          is_confirmed: company.is_confirmed,
        }
      });

      setCompanies(mappedData);


    } catch (error) {
      console.error("Error fetching trainees:", error);
    }
  };


  useEffect(() => {
    fetchCompanies();
  }, []);



  const handleSort = () => {
    setIsSortModalOpen(true);
  };

  const closeSortModal = () => {
    setIsSortModalOpen(false);
  };

  const handleSortChange = (event) => {
    setSortCriteria(event.target.value);
  };

  const applySort = () => {
    setIsSortModalOpen(false);
  };

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  const filteredCompanies = companies.filter(company =>
    company.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    company.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
    company.expertise.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sortedCompanies = [...filteredCompanies].sort((a, b) => {
    if (sortOrder === 'asc') {
      return a[sortCriteria].localeCompare(b[sortCriteria]);
    } else {
      return b[sortCriteria].localeCompare(a[sortCriteria]);
    }
  });

  const renderStars = (rating, setRating) => {
    const stars = [];
    for (let i = 0; i < 5; i++) {
      stars.push(
        <StarIcon
          key={i}
          style={{ color: i < rating ? '#FFD700' : '#E0E0E0', cursor: 'pointer' }}
          onClick={() => setRating(i + 1)}
        />
      );
    }
    return stars;
  };

  const handleSubmitFeedback = (company) => {
    console.log('Feedback submitted for:', company.name);
    console.log('Feedback:', feedbackText);
    console.log('Rating:', feedbackRating);
    setFeedbackText('');
    setFeedbackRating(0);
    closeModal();
  };


  const handleEmailClick = (email) => {

    console.log({ email })

    const subject = "Subject here"; // Replace with the subject
    const body = "Body of the email here"; // Replace with the email body

    window.open(`https://mail.google.com/mail/?view=cm&fs=1&to=${email}&su=${subject}&body=${body}`, "_blank");
  }

  const formikConfig = {
    initialValues: {

      MOA: null  // file
    },
    validationSchema: Yup.object({


      MOA: Yup.string().required('Required'),
    }),
    onSubmit: async (
      values,
      { setSubmitting, setFieldValue, setErrorMessage, setErrors }
    ) => {
      try {




        // Create a new FormData instance
        const formData = new FormData();
        // Append fields to FormData

        formData.append('MOA', values.MOA);
        formData.append('companyID', selectedCompany.companyID);






        let res = await axios({
          method: 'POST',
          url: 'company/applyNow',
          data: formData
        });

        fetchCompanies()
        closeApplyModal();
        toast.success('Created Successfully', {
          position: 'top-right',
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: 'light'
        });

        // window.location.href = '/app/dashboard';
      } catch (error) {
        const errorMessage =
          error.response && error.response.data && error.response.data.message
            ? error.response.data.message
            : 'An unknown error occurred.';
        // console.log(error.response.data.message)
        toast.error(errorMessage, {
          position: 'top-right',
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: 'light'
        });
      }

      // setErrorMessage('');
      // localStorage.setItem('token', 'DumyTokenHere');
      // setLoading(false);
      // window.location.href = '/app/dashboard';
    }
  };
  const Badge = ({ status, isConfirmed }) => {
    let updatedstatus;
    let badgeClass;

    if (isConfirmed) {
      updatedstatus = 'Joined';
      badgeClass = "bg-blue-500 text-white text-sm";
    } else if (status === null) {
      updatedstatus = 'Available';
      badgeClass = "bg-blue-500 text-white text-sm";
    } else {
      updatedstatus = status === "Approved" ? "Approved ✅" : "Pending ⏳"
      badgeClass = status === "Approved"
        ? "bg-green-500 text-white text-sm"
        : "bg-yellow-500 text-white text-sm";
    }

    return (
      <span className={`px-3 py-1 rounded-full ${badgeClass}`}>
        {updatedstatus}
      </span>
    );
  };

  // Filter companies based on active tab
  const getFilteredCompaniesByStatus = () => {

    console.log({ activeTab })
    switch (activeTab) {
      case 'Pending':
        return sortedCompanies.filter(company =>
          !company.is_confirmed &&
          company.status === 'Pending');
      case 'Approved':
        return sortedCompanies.filter(company => company.status === 'Approved' && !company.is_confirmed);
      case 'Joined':
        return sortedCompanies.filter(company => company.is_confirmed === 1);
      case 'Available':
      default:
        return sortedCompanies.filter(company => !company.status && !company.is_confirmed);
    }
  };

  // Add these new state variables at the top of your component
  const [selectedCompanyId, setSelectedCompanyId] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Add a new state for loading
  const [isJoining, setIsJoining] = useState(false);

  // Update the handleCompanySelection function
  const handleCompanySelection = (companyId) => {
    const company = companies.find(c => c.companyID === companyId);

    // Only allow selection if the company is approved and has approval date
    if (company.status === 'Approved') {
      setSelectedCompanyId(companyId);
    } else {
      // toast.warning('You can only join approved companies with valid approval dates', {
      //   position: 'top-right',
      //   autoClose: 3000,
      //   hideProgressBar: false,
      //   closeOnClick: true,
      //   pauseOnHover: true,
      //   draggable: true,
      //   progress: undefined,
      //   theme: 'light'
      // });
    }
  };

  // Update the handleJoinConfirmation function
  const handleJoinConfirmation = async () => {
    setIsJoining(true);
    try {

      let loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));

      const response = await axios.post('/company/trainee/application/company/join', {
        companyId: selectedCompanyId,
        userId: loggedInUser.userId
      });

      if (response.data.success) {
        toast.success(response.data.message, {
          position: 'top-right',
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: 'light'
        });

        setShowConfirmModal(false);
        setSelectedCompanyId(null);
        setActiveTab('Joined'); // Switch to Joined tab after successful join
        fetchCompanies();
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to join the company. Please try again.';
      toast.error(errorMessage, {
        position: 'top-right',
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: 'light'
      });
    } finally {
      setIsJoining(false);
    }
  };

  // Update the canJoinCompany function
  const canJoinCompany = () => {
    // Check if any company is already joined (is_confirmed === 1)
    const hasJoinedCompany = companies.some(company => company.is_confirmed === 1);

    // Check if we're in the Approved tab
    const isApprovedTab = activeTab === 'Approved';

    // Check if selected company exists and is approved
    const selectedCompany = companies.find(company => company.companyID === selectedCompanyId);
    const isSelectedCompanyApproved = selectedCompany && selectedCompany.status === 'Approved';

    // Can only join if:
    // 1. No company is already joined
    // 2. We're in the Approved tab
    // 3. Selected company is approved
    return !hasJoinedCompany && isApprovedTab && isSelectedCompanyApproved;
  };

  // Add state for tooltip message
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div>
      <Formik {...formikConfig}>
        {({
          handleSubmit,
          handleChange,
          handleBlur, // handler for onBlur event of form elements
          values,
          touched,
          errors,
          setFieldValue
        }) => {
          return <div>
            <h1>Companies</h1>
            <h5>Available affiliated companies</h5>
            <div className="flex justify-between items-center mb-4">
              <div className="company-button-container">
                <div className="search-bar">
                  <SearchIcon />
                  <input type="text" placeholder="Search Companies by name, location, or your expertise..." value={searchQuery} onChange={handleSearchChange} />
                </div>
                <button className="company-icon-button" onClick={handleSort}><SortIcon /></button>
              </div>
              <div className="relative">
                <button
                  onClick={() => setShowConfirmModal(true)}
                  disabled={!selectedCompanyId || !canJoinCompany()}
                  onMouseEnter={() => setShowTooltip(true)}
                  onMouseLeave={() => setShowTooltip(false)}
                  className={`px-4 py-2 rounded-lg transition-colors duration-200 ${selectedCompanyId && canJoinCompany()
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                >
                  Join Selected Company
                </button>
                {showTooltip && !canJoinCompany() && (
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-sm rounded-lg whitespace-nowrap">
                    {companies.some(company => company.is_confirmed === 1)
                      ? "You have already joined a company"
                      : !activeTab === 'Approved'
                        ? "Please go to the Approved tab to join a company"
                        : !selectedCompanyId
                          ? "Please select a company to join"
                          : "Selected company is not approved"}
                  </div>
                )}
              </div>
            </div>

            {/* Add Tabs */}
            <div className="flex space-x-4 mb-4 border-b">
              {['Available', 'Pending', 'Approved', 'Joined'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-2 px-4 font-medium transition-colors duration-200 ${activeTab === tab
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-500 hover:text-blue-600'
                    }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="companies-container">
              {getFilteredCompaniesByStatus().map((company, index) => (
                <div
                  key={index}
                  className={`company-box cursor-pointer transition-all duration-200 `}
                  onClick={() => handleCompanySelection(company.companyID)}
                >
                  <div className='flex justify-between items-center'>
                    <div className="company-header">
                      <img src={company.logo} alt={`${company.name} Logo`} className="company-logo" style={{ boxShadow: '0 8px               16px rgba(0, 0, 0, 0.2)' }} />
                      <h5 className="company-name">{company.name}</h5>
                    </div>
                    {
                      console.log(company.status)
                    }
                    <Badge status={company.status} isConfirmed={company.is_confirmed} />
                  </div>

                  <p className="company-description">{company.description}</p>
                  <p className="company-expertise" style={{ color: '#1F41BB' }}><span style={{ color: '#000' }}>Looking for: </span> {company.expertise}</p>
                  <p className="company-location" style={{ color: '#1F41BB' }}>{company.location}</p>
                  <div className="flex justify-end items-center space-x-4">


                    <button
                      className="view-more-button bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition duration-300"
                      onClick={() => handleCompanyClick(company)}
                    >
                      <FontAwesomeIcon icon={faEye} />
                    </button>

                    {
                      console.log({ company })
                    }
                    <button
                      onClick={() => handleEmailClick(company.contact_email || company.contact)}
                      className="email-button bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-gray-600 transition duration-300">
                      <FontAwesomeIcon icon={faMailBulk} />
                    </button>
                    {/* {
                      company.status ?
                        <Badge status={company.status} />

                        : <button
                          className="apply-now-button bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 transition duration-300"
                          onClick={() => handleApplyClick(company)}
                        >
                          <FontAwesomeIcon icon={faFileArrowUp} />
                        </button>
                    } */}



                  </div>

                </div>
              ))}
            </div>

            {isModalOpen && selectedCompany && (
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
                    flexDirection: 'column',
                    alignItems: 'center',
                    fontFamily: 'Poppins, sans-serif',
                    fontWeight: 600,
                    color: '#000',
                  }}
                >
                  <img
                    src={selectedCompany.logo}
                    alt={`${selectedCompany.name} Logo`}
                    style={{ width: '150px', height: '150px', borderRadius: '50%', marginBottom: '10px', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)' }}
                  />
                  <Typography variant="h6" style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600 }}>
                    {selectedCompany.name}
                  </Typography>
                  <Typography variant="body2" style={{ fontFamily: 'Poppins, sans-serif', color: '#808080' }}>
                    {selectedCompany.location}
                  </Typography>
                  <Typography variant="body2" style={{ fontFamily: 'Poppins, sans-serif', color: '#808080' }}>
                    {selectedCompany.contact}
                  </Typography>
                </DialogTitle>
                <DialogContent dividers={false} style={{ fontFamily: 'Poppins, sans-serif', color: '#000', overflowY: 'scroll' }}>
                  <Typography variant="h6" style={{ marginBottom: '10px', fontFamily: 'Poppins, sans-serif', fontWeight: 600 }}>
                    Description
                  </Typography>
                  <Typography variant="body1" style={{ marginBottom: '20px', whiteSpace: 'pre-line' }}>
                    {selectedCompany.description}
                  </Typography>
                  <Typography variant="h6" style={{ marginBottom: '10px', fontFamily: 'Poppins, sans-serif', fontWeight: 600 }}>
                    Application Requirements
                  </Typography>
                  <Typography variant="body1" style={{ marginBottom: '20px', whiteSpace: 'pre-line' }}>
                    {selectedCompany.applicationRequirements}
                  </Typography>
                  <Typography variant="h6" style={{ marginBottom: '10px', fontFamily: 'Poppins, sans-serif', fontWeight: 600 }}>
                    Expertise and Location
                  </Typography>
                  <Typography variant="body1" style={{ marginBottom: '20px' }}>
                    {selectedCompany.expertise} - {selectedCompany.location}
                  </Typography>
                  <Typography variant="h6" style={{ marginBottom: '10px', fontFamily: 'Poppins, sans-serif', fontWeight: 600 }}>
                    Rate Us!
                  </Typography>
                  <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
                    {renderStars(feedbackRating, setFeedbackRating)}
                  </div>

                  <Typography variant="h6" style={{ marginBottom: '10px', fontFamily: 'Poppins, sans-serif', fontWeight: 600 }}>
                    Feedback
                  </Typography>
                  <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
                    <textarea
                      value={feedbackText}
                      onChange={(e) => setFeedbackText(e.target.value)}
                      placeholder="Write your feedback here..."
                      style={{
                        width: '100%',
                        padding: '10px',
                        borderRadius: '8px',
                        border: '1px solid #808080',
                        fontFamily: 'Poppins, sans-serif',
                      }}
                    />
                  </div>

                  <Typography variant="h6" style={{ marginBottom: '10px', fontFamily: 'Poppins, sans-serif', fontWeight: 600 }}>
                    Student Feedback
                  </Typography>
                  {selectedCompany.feedback.map((feedback, index) => (
                    <div key={index} style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                      <img
                        src={feedback.profilePicture}
                        alt={`${feedback.student} Profile`}
                        style={{ width: '40px', height: '40px', borderRadius: '50%', marginRight: '10px' }}
                      />
                      <Typography variant="body2">
                        {feedback.student}: {feedback.comment} ({feedback.date})
                      </Typography>
                    </div>
                  ))}
                </DialogContent>
                <DialogActions style={{ padding: '16px' }}>
                  <Button className="btn-cancel" onClick={closeModal}>Close</Button>
                  <Button className="btn-submit" onClick={() => handleSubmitFeedback(selectedCompany)}>
                    Submit Feedback
                  </Button>
                </DialogActions>
              </Dialog>
            )}

            {isApplyModalOpen && selectedCompany && (
              <Dialog
                open={isApplyModalOpen}
                onClose={closeApplyModal}
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
                    flexDirection: 'column',
                    alignItems: 'center',
                    fontFamily: 'Poppins, sans-serif',
                    fontWeight: 600,
                    color: '#000',
                  }}
                >
                  <img
                    src={selectedCompany.logo}
                    alt={`${selectedCompany.name} Logo`}
                    style={{ width: '150px', height: '150px', borderRadius: '50%', marginBottom: '10px', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)' }}
                  />
                  <Typography variant="h6" style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600 }}>
                    {selectedCompany.name}
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
                  <h5 style={{ marginTop: '20px' }}> Please upload your resume/CV to apply for Internship.</h5>
                  <div

                    className={`${errors.MOA ? "border-2 rounded border-red-500" : ""
                      }`}>
                    <DropzoneArea
                      fieldName="MOA"
                      files={files}
                      dropzoneProps={dropzoneProps("MOA")}
                      setFieldValue={setFieldValue}
                      errors={errors}
                    />
                  </div>

                </DialogContent>
                <DialogActions style={{ padding: '16px' }}>
                  <Button className="btn-cancel" onClick={closeApplyModal}>Cancel</Button>
                  <Button

                    style={{
                      backgroundColor: '#1F41BB',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      fontFamily: 'Poppins, sans-serif',
                    }}
                    className="btn-submit"

                    onClick={() => {
                      // Handle file upload logic here
                      handleSubmit()
                      //closeApplyModal();
                    }}>
                    Submit
                  </Button>
                </DialogActions>
              </Dialog>
            )}

            {/* Confirmation Modal */}
            <Dialog
              open={showConfirmModal}
              onClose={() => setShowConfirmModal(false)}
              maxWidth="sm"
              fullWidth
            >
              <div className="p-6">
                <div className="text-center">
                  <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 mb-4">
                    <svg
                      className="h-6 w-6 text-blue-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Confirm Company Selection
                  </h3>
                  <p className="text-sm text-gray-500 mb-8">
                    Are you sure you want to join this company? This action cannot be undone.
                  </p>
                  <div className="flex justify-center space-x-4">
                    <button
                      onClick={() => setShowConfirmModal(false)}
                      className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors duration-200"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleJoinConfirmation}
                      disabled={isJoining}
                      className={`px-4 py-2 rounded-lg transition-colors duration-200 ${isJoining
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-700'
                        } text-white`}
                    >
                      {isJoining ? 'Joining...' : 'Confirm Join'}
                    </button>
                  </div>
                </div>
              </div>
            </Dialog>
          </div>
        }}

      </Formik>

      <ToastContainer />
    </div>
  );
}

export default StudentCompanies;
