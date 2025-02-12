import React, { useState, useEffect } from 'react';
import '../index.css'; // Adjust if necessary
import './Coordinator.css';
import EditIcon from '@mui/icons-material/Edit';
import AddCompany from '@mui/icons-material/AddCircleOutlineOutlined';
import SortIcon from '@mui/icons-material/Sort';
import SearchIcon from '@mui/icons-material/Search';
import StarIcon from '@mui/icons-material/Star';
import { Button as ButtonUI } from "@/components/ui/button";
import {
  Dialog as MuiDialog,
  DialogTitle as MuiDialogTitle,
  DialogContent as MuiDialogContent,
  DialogActions as MuiDialogActions,
  Button,
  Typography,
  TextField,
  IconButton,
  RadioGroup,
  FormControlLabel,
  Radio,
  FormControl,
  FormLabel,
  Avatar
} from '@mui/material';

import {
  Dialog as ShadcnDialog,
  DialogContent as ShadcnDialogContent,
  DialogHeader as ShadcnDialogHeader,
  DialogTitle as ShadcnDialogTitle
} from "@/components/ui/dialog";

import CloudUploadIcon from '@mui/icons-material/CloudUpload';

import InputText from './../components/Input/InputText';
import TextAreaInput from './../components/Input/TextAreaInput';

import { Formik, useField, useFormik, Form } from 'formik';
import * as Yup from 'yup';

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';

import Dropdown from './../components/Input/Dropdown';
import { useDropzone } from "react-dropzone";

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCoffee, faEye, faEyeDropper, faMailBulk, faMailReply, faSms } from '@fortawesome/free-solid-svg-icons'
import { CloudLightning, FileText, Check, X } from "lucide-react"
import FileManager from "@/components/FileManager"
import { DialogFooter } from "@/components/ui/dialog"

function CoordinatorCompanies() {

  // Define file handling logic
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

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [sortOrder, setSortOrder] = useState('asc');
  const [sortCriteria, setSortCriteria] = useState('name');
  const [isSortModalOpen, setIsSortModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddCompanyModalOpen, setIsAddCompanyModalOpen] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [avatarPhoto, setFile] = useState(null);
  const [isHovered, setIsHovered] = useState(false);

  const [companies, setCompanies] = useState([]);

  const fetchCompanies = async () => {
    try {
      const response = await axios.get('company/list');
      let result = response.data.data
      let mappedData = result.map((company) => {
        return {
          id: company.companyID,
          name: company.companyName,
          logo: company.avatar_photo,
          contact: company.contact_email,
          description: `${company.description}`,
          // description: `Expertise: ${company.expertise || 'N/A'}`,
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

  const handleCompanyClick = (company) => {
    setSelectedCompany(company);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedCompany(null);
  };

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 0; i < 5; i++) {
      stars.push(
        <StarIcon key={i} style={{ color: i < rating ? '#FFD700' : '#E0E0E0' }} />
      );
    }
    return stars;
  };

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

  const handleAddCompany = () => {
    setIsAddCompanyModalOpen(true);
  };

  const closeAddCompanyModal = () => {
    setIsAddCompanyModalOpen(false);
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setDragOver(false);
    const uploadedFile = event.dataTransfer.files[0];
    setFile(uploadedFile);
  };

  const handleFileChange = (event) => {
    const uploadedFile = event.target.files[0];
    setFile(uploadedFile);
  };

  const formikConfig = {
    initialValues: {
      description: '',
      avatar_photo: '', // file
      companyName: '',
      expertise: '',
      address: '',
      contact_phone: '',
      contact_email: '',
      list_of_requirements: [],
      MOA: null  // file
    },
    validationSchema: Yup.object({
      description: Yup.string()
        .min(8, 'Minimun of 10 character(s)')
        .required('Required field'),
      companyName: Yup.string()
        .min(8, 'Minimun of 4 character(s)')
        .required('Required field'),
      expertise: Yup.string()
        .min(8, 'Minimun of 4 character(s)')
        .required('Required field'),
      address: Yup.string()
        .min(8, 'Minimun of 4 character(s)')
        .required('Required field'),
      contact_phone: Yup.number()
        .min(11, 'Minimun of 11 character(s)')
        .required('Required field'),
      contact_email: Yup.string().email()
        .required('Required field'),
      list_of_requirements: Yup.array().required('Required'),
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
        formData.append('avatar_photo', values.avatar_photo);
        formData.append('MOA', values.MOA);

        //
        formData.append('description', values.description);
        formData.append('companyName', values.companyName);
        formData.append('expertise', values.expertise);
        formData.append('address', values.address);
        formData.append('contact_phone', values.contact_phone);
        formData.append('contact_email', values.contact_email);
        formData.append('list_of_requirements', JSON.stringify(values.list_of_requirements));

        console.log({ dex: values.list_of_requirements })

        let res = await axios({
          method: 'POST',
          url: 'company/create',
          data: formData
        });

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
        closeAddCompanyModal()
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
  const Badge = ({ status }) => {
    const badgeClass = status === "approved"
      ? "bg-green-500 text-white text-sm"
      : "bg-yellow-500 text-white text-sm";

    return (
      <span className={`px-3 py-1 rounded-full ${badgeClass}`}>
        {status === "approved" ? "Approved" : "Pending"}
      </span>
    );
  };

  // Add new state for MOA modal
  const [moaModalOpen, setMoaModalOpen] = useState(false);
  const [selectedCompanyId, setSelectedCompanyId] = useState(null);

  // Handler for MOA button click
  const handleMoaClick = (companyId) => {
    setSelectedCompanyId(companyId);
    setMoaModalOpen(true);
  };

  // Add new function to handle MOA approval
  const handleMoaApproval = async (companyId, status) => {
    try {
      await axios.put(`/company/${companyId}/moa-status`, {
        status: status
      });

      // Update local state
      setCompanies(companies.map(company => {
        if (company.id === companyId) {
          return {
            ...company,
            MOAApprovalStatus: status === 'approved' ? 'Approved' : 'Rejected'
          };
        }
        return company;
      }));

      // Close modal and show success message
      setMoaModalOpen(false);
      toast.success(`MOA ${status === 'approved' ? 'approved' : 'rejected'} successfully`);

      // Refresh companies list
      fetchCompanies();
    } catch (error) {
      console.error('Error updating MOA status:', error);
      toast.error('Failed to update MOA status');
    }
  };

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

          console.log({ values })
          return <div>

            <h1>Companies</h1>
            <h5>Available affiliated companies</h5>
            <div className="company-button-container">
              <div className="search-bar">
                <SearchIcon />
                <input
                  type="text"
                  placeholder="Search Companies by name, location, or your expertise..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                />
              </div>
              <IconButton style={{ color: 'black' }} className='company-icon-button' onClick={handleAddCompany}>
                <AddCompany />
              </IconButton>
              <IconButton style={{ color: 'black' }} className='company-icon-button' onClick={handleSort}>
                <SortIcon />
              </IconButton>
            </div>


            {
              console.log({ sortedCompanies })
            }
            <div className="companies-container">
              {sortedCompanies.map((company, index) => (
                <div key={index} className="company-box">
                  <div className="company-header">
                    <img src={company.logo} alt={`${company.name} Logo`} className="company-logo" style={{ boxShadow: '0 8px 16px rgba(0, 0, 0, 0.2)' }} />
                    <h5 className="company-name">{company.name}</h5>
                  </div>
                  <p className="company-description">{company.description}</p>
                  <p className="company-expertise" style={{ color: '#1F41BB' }}><span style={{ color: '#000' }}>Looking for: </span> {company.expertise}</p>
                  <p className="company-location" style={{ color: '#1F41BB' }}>{company.location}</p>
                  <div className="flex justify-between items-center">
                    <div>
                      <button
                        className="view-more-button bg-blue-500 text-white py-1 px-4 rounded-lg 
                      hover:bg-blue-600 transition duration-300 mr-2"
                        onClick={() => handleCompanyClick(company)}
                      >
                        <FontAwesomeIcon icon={faEye} />

                      </button>
                      <button
                        className="email-button bg-gray-500 text-white py-1 px-4 rounded-lg hover:bg-gray-600 transition duration-300"
                        onClick={() => {
                          /* Add your handler here */
                        }}
                      >
                        <FontAwesomeIcon icon={faMailBulk} />
                      </button>
                      <button
                        className="ml-4 moa-button bg-blue-500 text-white py-1 px-4 rounded-lg 
                        hover:bg-indigo-600 transition duration-300"
                        onClick={() => handleMoaClick(company.id)}
                      >
                        <FileText className="w-4 h-4 inline-block mr-1" />
                        MOA
                      </button>
                    </div>

                    {/* <Badge status={company.moa_status} /> */}
                  </div>

                </div>
              ))}
            </div>

            {isModalOpen && selectedCompany && (
              <MuiDialog
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
                <MuiDialogTitle
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
                  <Typography variant="body2" style={{ fontFamily: 'Poppins, sans-serif', color: '#1F41BB' }}>
                    {selectedCompany.MOAApprovalStatus}
                  </Typography>
                </MuiDialogTitle>

                <MuiDialogContent
                  dividers={false}
                  style={{
                    fontFamily: 'Poppins, sans-serif',
                    color: '#000',
                    overflowY: 'scroll',
                    scrollbarWidth: 'none',
                    msOverflowStyle: 'none',
                  }}
                >
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
                    Star Rating
                  </Typography>
                  <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
                    {renderStars(Math.round(selectedCompany.starRating))}
                  </div>
                  <Typography variant="h6" style={{ marginBottom: '10px', fontFamily: 'Poppins, sans-serif', fontWeight: 600 }}>
                    Student Feedback
                  </Typography>
                  {selectedCompany.feedback.map((feedback, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
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
                </MuiDialogContent>
                <MuiDialogActions style={{ padding: '16px' }}>
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
                </MuiDialogActions>
              </MuiDialog>
            )}

            {isSortModalOpen && (
              <MuiDialog
                open={isSortModalOpen}
                onClose={closeSortModal}
                fullWidth
                maxWidth="xs"
                PaperProps={{
                  style: {
                    border: '2px solid #808080',
                    borderRadius: '8px',
                    overflow: 'auto',
                  },
                }}
              >
                <MuiDialogTitle
                  style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, color: '#000' }}
                >
                  Sort Companies
                </MuiDialogTitle>

                <MuiDialogContent
                  dividers={false}
                  style={{
                    fontFamily: 'Poppins, sans-serif',
                    color: '#000',
                    overflowY: 'scroll',
                    scrollbarWidth: 'none',
                    msOverflowStyle: 'none',
                  }}
                >
                  <RadioGroup value={sortCriteria} onChange={handleSortChange}>
                    <FormControlLabel value="name" control={<Radio />} label="Alphabetical Order" />
                    <FormControlLabel value="location" control={<Radio />} label="Location" />
                    <FormControlLabel value="expertise" control={<Radio />} label="Expertise" />
                  </RadioGroup>
                </MuiDialogContent>

                <MuiDialogActions style={{ padding: '16px' }}>
                  <Button
                    style={{
                      backgroundColor: '#ffffff',
                      color: 'black',
                      border: '2px solid #808080',
                      borderRadius: '8px',
                      marginRight: '8px',
                      fontFamily: 'Poppins, sans-serif',
                    }}
                    onClick={closeSortModal}
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
                    onClick={applySort}
                  >
                    Apply
                  </Button>
                </MuiDialogActions>
              </MuiDialog>
            )}

            {isAddCompanyModalOpen && (
              <MuiDialog
                open={isAddCompanyModalOpen}
                onClose={closeAddCompanyModal}
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
                <MuiDialogTitle
                  style={{
                    fontFamily: 'Poppins, sans-serif',
                    fontWeight: 600,
                    color: '#000',
                  }}
                >
                  Add Company
                </MuiDialogTitle>

                <MuiDialogContent
                  dividers={false}
                  style={{
                    fontFamily: 'Poppins, sans-serif',
                    color: '#000',
                    overflowY: 'scroll',
                    scrollbarWidth: 'none',
                    msOverflowStyle: 'none',
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
                      src={avatarPhoto ? URL.createObjectURL(avatarPhoto) : 'https://via.placeholder.com/100'}
                      alt="Company Avatar"
                      style={{
                        width: '150px',
                        height: '150px',
                        margin: '0 auto',
                        filter: isHovered ? 'brightness(70%)' : 'none',
                        transition: 'filter 0.2s ease',
                        cursor: 'pointer',
                      }}
                      onClick={() => document.getElementById('avatarUpload').click()}
                    />

                    {isHovered && (
                      <IconButton
                        onClick={() => document.getElementById('avatarUpload').click()}
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

                    <input
                      type="file"
                      id="avatarUpload"
                      style={{ display: 'none' }}
                      onChange={(event) => {
                        const uploadedFile = event.target.files[0];
                        setFieldValue('avatar_photo', uploadedFile)
                        setFile(uploadedFile);
                      }}
                    />
                  </div>

                  <h5 style={{ marginBottom: '0', marginTop: '20px' }}>Company information</h5>
                  {/* Example of MUI FormControl + FormLabel styling, repeated as needed */}
                  <FormControl margin="normal" fullWidth>

                    <InputText
                      // icons={mdiAccount}
                      label="Company Name"
                      labelColor="text-blue-950"
                      name="companyName"
                      type="text"
                      placeholder=""
                      value={values.companyName}
                      onBlur={handleBlur} // This apparently updates `touched`?
                    />

                  </FormControl>

                  <FormControl margin="normal" fullWidth>

                    <TextAreaInput
                      // icons={mdiAccount}
                      label="Description"
                      labelColor="text-blue-950"
                      name="description"
                      type="textarea"
                      placeholder=""
                      value={values.description}
                      hasTextareaHeight={true}
                      onBlur={handleBlur} // This apparently updates `touched`?
                    />

                  </FormControl>


                  <FormControl margin="normal" fullWidth>
                    <InputText
                      // icons={mdiAccount}
                      label="Expertise"
                      labelColor="text-blue-950"
                      name="expertise"
                      type="text"
                      placeholder=""
                      value={values.expertise}
                      onBlur={handleBlur} // This apparently updates `touched`?
                    />
                  </FormControl>

                  <FormControl margin="normal" fullWidth>
                    <InputText
                      // icons={mdiAccount}
                      label="Address"
                      labelColor="text-blue-950"
                      name="address"
                      type="text"
                      placeholder=""
                      value={values.address}
                      onBlur={handleBlur} // This apparently updates `touched`?
                    />
                  </FormControl>

                  <FormControl margin="normal" fullWidth>
                    <Dropdown
                      className="z-50"
                      isMulti={true}
                      label="List of requirements"
                      name="list_of_requirements"
                      value={values.list_of_requirements}

                      onBlur={handleBlur}
                      options={[{
                        label: 'OJT endorsement',
                        value: 'OJT endorsement'
                      },
                      {
                        label: 'Training plan',
                        value: 'Training plan'
                      },
                      {
                        label: 'Medical Clearance',
                        value: 'Medical Clearance'
                      },
                      {
                        label: 'Birth Certificate',
                        value: 'Birth Certificate'
                      },
                      ]}

                      onChange={(newValue) => {

                        // setSelectedOptions(newValue);
                        setFieldValue('list_of_requirements', newValue)
                        // setSelectedOptions(newValue);
                      }}
                    />
                  </FormControl>

                  <FormControl margin="normal" fullWidth>
                    <InputText
                      // icons={mdiAccount}
                      label="Contact Email"
                      labelColor="text-blue-950"
                      name="contact_email"
                      type="text"
                      placeholder=""
                      value={values.contact_email}
                      onBlur={handleBlur} // This apparently updates `touched`?
                    />
                  </FormControl>

                  <FormControl margin="normal" fullWidth>
                    <InputText
                      // icons={mdiAccount}
                      label="Contact Phone"
                      labelColor="text-blue-950"
                      name="contact_phone"
                      type="text"
                      placeholder=""
                      value={values.contact_phone}
                      onBlur={handleBlur} // This apparently updates `touched`?
                    />
                  </FormControl>

                  {/* Drag-and-drop file section */}

                  <h5 style={{ marginTop: '20px' }}>Memorandum Of Agreement</h5>
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

                  {/* <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  style={{
                    border: dragOver ? '2px solid #1F41BB' : '2px dashed #808080',
                    borderRadius: '8px',
                    padding: '20px',
                    textAlign: 'center',
                    marginTop: '20px',
                    cursor: 'pointer',
                  }}
                >
                  <CloudUploadIcon style={{ fontSize: '48px', color: dragOver ? '#1F41BB' : '#808080' }} />
                  <Typography variant="body1" style={{ fontFamily: 'Poppins, sans-serif', color: '#808080' }}>
                    {file ? file.name : 'Drag and drop the Memorandum of Agreement file here or click to upload'}
                  </Typography>
                  <input
                    type="file"
                    style={{ display: 'none' }}
                    onChange={handleFileChange}
                  />
                </div> */}
                </MuiDialogContent>
                <MuiDialogActions style={{ padding: '16px' }}>
                  <Button
                    style={{
                      backgroundColor: '#ffffff',
                      color: 'black',
                      border: '2px solid #808080',
                      borderRadius: '8px',
                      marginRight: '8px',
                      fontFamily: 'Poppins, sans-serif',
                    }}
                    onClick={closeAddCompanyModal}
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
                    onClick={() => {
                      handleSubmit()
                    }}
                  >
                    Save
                  </Button>
                </MuiDialogActions>
              </MuiDialog>
            )}

            {/* Update MOA Modal */}
            <ShadcnDialog open={moaModalOpen} onOpenChange={setMoaModalOpen}>
              <ShadcnDialogContent className="sm:max-w-[800px] h-[80vh] flex flex-col">
                <ShadcnDialogHeader>
                  <ShadcnDialogTitle>Memorandum of Agreement</ShadcnDialogTitle>
                </ShadcnDialogHeader>
                <div className="flex-1 overflow-hidden">
                  {selectedCompanyId && (
                    <FileManager
                      readOnly={true}
                      companyId={selectedCompanyId}
                      filterTag="MOA"
                    />
                  )}
                </div>
                <DialogFooter className="flex justify-between items-center border-t pt-4">
                  <div className="flex gap-2">
                    <ButtonUI

                      onClick={() => handleMoaApproval(selectedCompanyId, 'rejected')}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      <X className="w-4 h-4 mr-2" />
                      Reject MOA
                    </ButtonUI>
                    <ButtonUI

                      onClick={() => handleMoaApproval(selectedCompanyId, 'approved')}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <Check className="w-4 h-4 mr-2" />
                      Approve MOA
                    </ButtonUI>
                  </div>
                </DialogFooter>
              </ShadcnDialogContent>
            </ShadcnDialog>
          </div>

        }}

      </Formik>
      <ToastContainer />
    </div>
  );
}

export default CoordinatorCompanies;