import React, { useState, useEffect, useRef, useCallback } from 'react';
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
  DialogTitle as ShadcnDialogTitle,
  DialogFooter as ShadcnDialogFooter
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import InputText from './../components/Input/InputText';

import { Button } from "@/components/ui/button";

import { Formik, useField, useFormik, Form, getIn } from 'formik';
import * as Yup from 'yup';

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';

import Dropdown from './../components/Input/Dropdown';
import { useDropzone } from "react-dropzone";

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCoffee, faEye, faEyeDropper, faMailBulk, faMailReply, faSms } from '@fortawesome/free-solid-svg-icons'
import {
  Building, Search, CloudLightning, FileText, Check, X, CheckCircle2, XCircle, HourglassIcon, Trash2, Loader2, Plus,
  Phone,
  InfoIcon,
  AlertCircle
} from "lucide-react"
import FileManager from "@/components/FileManager"
import TextAreaInput from './../components/Input/TextAreaInput';
import { Mail, MapPin, Info, Star } from "lucide-react"
import { Edit } from "lucide-react"
import { Label } from "@/components/ui/label"
import { Upload } from "lucide-react"
import FeedbackDialog from '../components/FeedbackDialog';
import FeedbackList from '../components/FeedbackList';
import FileUploader from '../components/FileUploader';
import { Progress } from "@/components/ui/progress";
import { AlertTriangle } from "lucide-react"

function CoordinatorCompanies({ role = 'ojt-coordinator' }) {
  const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
  const isTrainee = role === 'trainee';
  const canApproveMOA = role === 'dean';
  const canEditCompany = role === 'ojt-coordinator';

  // Add states for trainee features
  const [userApplications, setUserApplications] = useState([]);
  const [approvedApplications, setApprovedApplications] = useState([]);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [companyToApply, setCompanyToApply] = useState(null);

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

  const DropzoneArea = ({ fieldName, acceptedTypes, onFileSelect, currentFile }) => {
    const { getRootProps, getInputProps } = useDropzone({
      accept: acceptedTypes,
      onDrop: (acceptedFiles) => {
        if (acceptedFiles.length > 0) {
          onFileSelect(acceptedFiles[0]);
        }
      },
    });

    return (
      <div {...getRootProps()} className="border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors hover:border-blue-500">
        <input {...getInputProps()} />
        {currentFile ? (
          <div className="flex items-center justify-between p-3 border rounded-lg bg-gray-50">
            <FileText className="h-5 w-5 text-blue-500" />
            <span className="text-sm text-gray-600">{currentFile.name}</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onFileSelect(null);
              }}
              className="text-red-500 hover:text-red-600"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <p className="text-sm text-gray-500">Drag & drop a file here, or click to select one</p>
        )}
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
  const [editingCompany, setEditingCompany] = useState(null);

  const [companies, setCompanies] = useState([]);

  // Add this state for MOA status filtering
  const [moaStatusFilter, setMoaStatusFilter] = useState('all');

  // Add new state for application status filter
  const [applicationStatusFilter, setApplicationStatusFilter] = useState('all');

  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [companyFeedback, setCompanyFeedback] = useState([]);
  const [isLoadingFeedback, setIsLoadingFeedback] = useState(false);

  // Add this state at the top of the component
  const [selectedCompanyForFeedback, setSelectedCompanyForFeedback] = useState(null);
  const [isFeedbackViewOpen, setIsFeedbackViewOpen] = useState(false);

  // Add these states at the top
  const [isApplying, setIsApplying] = useState(false);
  const [selectedRequirements, setSelectedRequirements] = useState([]);
  const [applicationFiles, setApplicationFiles] = useState({});

  // Add these states at the top
  const [hasJoinedCompany, setHasJoinedCompany] = useState(false);

  // Add role-based permission checks
  const canApproveApplications = role === 'ojt-coordinator';
  const canCreateCompany = role === 'ojt-coordinator';

  // Add this state at the top with other states
  const [selectedCompanyMOAStatus, setSelectedCompanyMOAStatus] = useState(null);

  // Add these states at the top
  const [confirmAction, setConfirmAction] = useState({ type: '', companyId: null });

  // Separate states for MOA and Application dialogs
  const [isMoaConfirmDialogOpen, setIsMoaConfirmDialogOpen] = useState(false);
  const [isApplicationDialogOpen, setIsApplicationDialogOpen] = useState(false);

  // Add state for user scope
  const [userScope, setUserScope] = useState(null);

  // Add state to track which company is being joined
  const [joiningCompanyId, setJoiningCompanyId] = useState(null);

  // Fetch user's scope based on role
  const fetchUserScope = async () => {
    try {
      const response = await axios.get('college/user-scope');
      if (response.data.success) {
        setUserScope(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching user scope:', error);
      toast.error('Failed to load user scope');
    }
  };

  useEffect(() => {
    fetchUserScope();
  }, [role]);

  const fetchCompanies = async () => {
    try {
      const response = await axios.get('/company/list');
      const mappedData = response.data.data.map(company => ({
        ...company,
        companyID: company.companyID,
        companyName: company.companyName,
        description: company.description,
        contact_email: company.contact_email,
        contact_phone: company.contact_phone,
        address: company.address,
        expertise: company.expertise,
        list_of_requirements: company.list_of_requirements ? JSON.parse(company.list_of_requirements) : [],
        collegeID: company.collegeID,
        programID: company.programID,
        avatar_photo: company.avatar_photo,
        moa_url: company.moa_url,
        moa_status: company.moa_status,
        totalFeedback: company.totalFeedback || 0,
        averageRating: parseFloat(company.averageRating) || 0
      }));

      console.log({ mappedData })
      setCompanies(mappedData);
    } catch (error) {
      console.error('Error fetching companies:', error);
      toast.error('Failed to fetch companies');
    }
  };

  const fetchUserApplications = async () => {
    if (!isTrainee) return;

    try {
      const response = await axios.get('company/applications/user');
      if (response.data.success) {
        setUserApplications(response.data.data);
        const approved = response.data.data.filter(app => app.status === 'approved');
        setApprovedApplications(approved);
        // Check if user has already joined a company
        const joinedApp = response.data.data.find(app => app.is_confirmed);
        setHasJoinedCompany(!!joinedApp);
      }
    } catch (error) {
      console.error('Error fetching applications:', error);
      //toast.error('Failed to fetch your applications');
    }
  };

  useEffect(() => {
    fetchCompanies();
    if (isTrainee) {
      fetchUserApplications();
    }
  }, [isTrainee]);

  const fetchCompanyFeedback = async (companyId) => {
    try {
      setIsLoadingFeedback(true);
      const response = await axios.get(`company/${companyId}/feedback`);
      if (response.data.success) {
        setCompanyFeedback(response.data.data);

        // Update the company's star rating in the companies list
        setCompanies(prevCompanies => {
          return prevCompanies.map(company => {
            if (company.companyID === companyId) {
              const totalRating = response.data.data.reduce((sum, item) => sum + parseFloat(item.rating), 0);
              const averageRating = response.data.data.length > 0 ?
                totalRating / response.data.data.length : 0;

              return {
                ...company,
                starRating: parseFloat(averageRating) || 0,
                totalFeedback: response.data.data.length
              };
            }
            return company;
          });
        });
      }
    } catch (error) {
      console.error('Error fetching company feedback:', error);
      toast.error('Failed to load company feedback');
    } finally {
      setIsLoadingFeedback(false);
    }
  };

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

  // Update the companies filter function
  const filterCompanies = useCallback((companies) => {
    return companies.filter(company => {
      // Basic text search filter
      const matchesSearch = Object.values(company).some(
        value => value && value.toString().toLowerCase().includes(searchQuery.toLowerCase())
      );

      //
      // MOA status filter
      const matchesMoaStatus = moaStatusFilter === 'all' ||
        company.moa_status === moaStatusFilter;

      // Role-based filtering
      let matchesScope = true;
      if (userScope) {
        if (role === 'ojt-coordinator') {
          // Coordinator sees companies in their college and program
          matchesScope = company.collegeID === userScope.collegeID &&
            company.programID === userScope.programID;
        } else if (role === 'trainee') {

          console.log({ company, userScope })
          // Trainee sees companies matching their college and program
          matchesScope = company.collegeID === userScope.collegeID &&
            company.programID === userScope.programID;
        } else if (role === 'hte-supervisor') {
          // Supervisor only sees their own company
          matchesScope = company.companyID === userScope.companyID;
        } else if (role === 'dean') {
          // Dean sees all companies in their college
          matchesScope = company.collegeID === userScope.collegeID;
        }
      }

      return matchesSearch && matchesMoaStatus && matchesScope;
    });
  }, [searchQuery, moaStatusFilter, userScope, role]);

  const handleAddCompany = () => {
    if (!canCreateCompany) {
      toast.error('Only coordinators can create companies');
      return;
    }
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

  const handleEditClick = (company) => {
    // Check if company belongs to user's scope
    if (userScope &&
      company.collegeID === userScope.collegeID &&
      company.programID === userScope.programID) {
      setEditingCompany(company);
      setIsAddCompanyModalOpen(true);
    } else {
      toast.error('You can only edit companies in your program and college');
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

  // Update MOA approval handler
  const handleMoaApproval = async (companyId, status) => {
    if (!canApproveMOA) {
      toast.error('Only deans can approve/reject MOAs');
      return;
    }

    try {
      const response = await axios.post(`company/moa/${companyId}/status`, {
        status
      });

      if (response.data.success) {
        toast.success(`MOA ${status} successfully`);
        fetchCompanies(); // Refresh the companies list
        setMoaModalOpen(false);
      }
    } catch (error) {
      console.error(`Error ${status}ing MOA:`, error);
      toast.error(`Failed to ${status} MOA`);
    }
  };


  const AddCompanyDialog = ({ isOpen, onClose, editData, fetchCompanies, userScope }) => {
    const [filePreview, setFilePreview] = useState({
      avatar_photo: editData?.avatar_photo || null,
      MOA: editData?.moa_url || null
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    //
    const defaultRequirements = [
      { label: 'OJT endorsement', value: 'OJT endorsement' },
      { label: 'Training plan', value: 'Training plan' },
      { label: 'Medical Clearance', value: 'Medical Clearance' },
      { label: 'Birth Certificate', value: 'Birth Certificate' }
    ];

    const handleFileChange = (fieldName, file) => {
      if (file) {
        if (fieldName === 'avatar_photo') {
          const reader = new FileReader();
          reader.onload = () => {
            setFilePreview(prev => ({ ...prev, avatar_photo: reader.result }));
          };
          reader.readAsDataURL(file);
        } else if (fieldName === 'MOA') {
          setFilePreview(prev => ({ ...prev, MOA: file.name }));
        }
      } else {
        setFilePreview(prev => ({ ...prev, [fieldName]: null }));
      }
    };



    const handleSubmit = async (values, { setSubmitting }) => {
      setSubmitting(true);
      try {
        const formData = new FormData();

        formData.append('companyName', values.companyName);
        formData.append('description', values.description);
        formData.append('contact_email', values.contact_email);
        formData.append('contact_phone', values.contact_phone);
        formData.append('address', values.address);
        formData.append('expertise', values.expertise);

        // Transform requirements to include required/optional status
        formData.append('list_of_requirements', JSON.stringify(values.list_of_requirements.map(req => ({
          value: req.value,
          label: req.value,
          isRequired: req.isRequired,
          status: req.isRequired ? 'required' : 'optional'
        }))));
        formData.append('collegeID', userScope?.collegeID);
        formData.append('programID', userScope?.programID);

        if (values.avatar_photo) {
          formData.append('avatar_photo', values.avatar_photo);
        }
        if (values.MOA) {
          formData.append('MOA', values.MOA);
        }

        const url = editData ? `company/edit/${editData.companyID}` : 'company/create';
        const method = editData ? 'put' : 'post';

        const response = await axios({
          method,
          url,
          data: formData,
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });

        if (response.data.success) {
          toast.success(editData ? 'Company updated successfully' : 'Company created successfully');
          onClose();
          fetchCompanies();
        }
      } catch (error) {
        console.error('Error submitting company:', error);
        toast.error(error.response?.data?.message || 'Failed to submit company');
      } finally {
        setSubmitting(false);
      }
    };


    return (
      <ShadcnDialog open={isOpen} onOpenChange={onClose}>
        <ShadcnDialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto rounded-lg">
          <ShadcnDialogHeader className="top-0 bg-white pb-4 border-b mt-4">
            <ShadcnDialogTitle className="text-xl font-semibold flex items-center gap-2">
              <Building className="h-5 w-5 text-blue-500" />
              {editData ? 'Edit Company' : 'Add New Company'}
            </ShadcnDialogTitle>
            <p className="text-sm text-gray-500 text-left">
              Please provide detailed information about the company to help us manage it effectively.
            </p>
          </ShadcnDialogHeader>

          {/* Modern Alert for Scope */}
          {userScope && (
            <div className="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4" role="alert">
              <p className="font-semibold">Scope Confirmation</p>
              <p>This company will be created within your assigned scope:</p>
              <ul className="list-disc pl-5">
                <li>College: {userScope.collegeName}</li>
                <li>Program: {userScope.programName}</li>
              </ul>
            </div>
          )}

          <Formik
            initialValues={{
              companyName: editData?.companyName || '',
              description: editData?.description || '',
              contact_email: editData?.contact_email || '',
              contact_phone: editData?.contact_phone || '',
              address: editData?.address || '',
              expertise: editData?.expertise || '',
              list_of_requirements: editData?.list_of_requirements || [
                { value: '', isRequired: true }
              ],
              avatar_photo: editData?.avatar_photo || null,
              MOA: editData?.moa_url || null
            }}
            validationSchema={Yup.object({
              companyName: Yup.string().required('Company name is required'),
              description: Yup.string().required('Description is required'),
              contact_email: Yup.string().email('Invalid email').required('Email is required'),
              contact_phone: Yup.string().required('Contact phone is required'),
              address: Yup.string().required('Address is required'),
              expertise: Yup.string().required('Expertise is required'),
              list_of_requirements: Yup.array().of(
                Yup.object().shape({
                  value: Yup.string().required('Requirement is required'),
                  isRequired: Yup.boolean().required('Please specify if requirement is required')
                })
              )
            })}
            onSubmit={handleSubmit}
          >
            {({ values, errors, touched, handleChange, handleBlur, handleSubmit, setFieldValue }) => (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <div>
                    <Label htmlFor="companyName" className="text-sm font-medium flex items-center gap-2">
                      <Building className="h-4 w-4 text-gray-500" />
                      Company Name
                    </Label>
                    <Input
                      id="companyName"
                      name="companyName"
                      value={values.companyName}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={`mt-1 ${errors.companyName && touched.companyName ? 'border-red-500' : ''} mb-4`}
                    />
                    {touched.companyName && errors.companyName && (
                      <p className="text-red-500 text-xs mt-1">{errors.companyName}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="contact_email" className="text-sm font-medium flex items-center gap-2">
                      <Mail className="h-4 w-4 text-gray-500" />
                      Contact Email
                    </Label>
                    <Input
                      id="contact_email"
                      name="contact_email"
                      value={values.contact_email}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={`mt-1 ${errors.contact_email && touched.contact_email ? 'border-red-500' : ''} mb-4`}
                    />
                    {touched.contact_email && errors.contact_email && (
                      <p className="text-red-500 text-xs mt-1">{errors.contact_email}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="contact_phone" className="text-sm font-medium flex items-center gap-2">
                      <Phone className="h-4 w-4 text-gray-500" />
                      Contact Phone
                    </Label>
                    <Input
                      id="contact_phone"
                      name="contact_phone"
                      value={values.contact_phone}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={`mt-1 ${errors.contact_phone && touched.contact_phone ? 'border-red-500' : ''} mb-4`}
                    />
                    {touched.contact_phone && errors.contact_phone && (
                      <p className="text-red-500 text-xs mt-1">{errors.contact_phone}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="address" className="text-sm font-medium flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-gray-500" />
                      Address
                    </Label>
                    <Input
                      id="address"
                      name="address"
                      value={values.address}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={`mt-1 ${errors.address && touched.address ? 'border-red-500' : ''}`}
                    />
                    {touched.address && errors.address && (
                      <p className="text-red-500 text-xs mt-1">{errors.address}</p>
                    )}
                  </div>
                </div>

                <div className="col-span-2">
                  <Label htmlFor="expertise" className="text-sm font-medium flex items-center gap-2">
                    <Star className="h-4 w-4 text-gray-500" />
                    Expertise
                  </Label>
                  <Input
                    id="expertise"
                    name="expertise"
                    value={values.expertise}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={`mt-1 w-full ${errors.expertise && touched.expertise ? 'border-red-500' : 'border-gray-300'}`}
                  />
                  {touched.expertise && errors.expertise && (
                    <p className="text-red-500 text-xs mt-1">{errors.expertise}</p>
                  )}
                </div>

                <div className="col-span-2">
                  <Label htmlFor="description" className="text-sm font-medium flex items-center gap-2">
                    <Info className="h-4 w-4 text-gray-500" />
                    Description
                  </Label>
                  <textarea
                    id="description"
                    name="description"
                    value={values.description}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    rows={4}
                    className={`mt-1 w-full border rounded-md p-2 ${errors.description && touched.description ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="Provide a brief description of the company..."
                  />
                  {touched.description && errors.description && (
                    <p className="text-red-500 text-xs mt-1">{errors.description}</p>
                  )}
                </div>

                <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-5">
                  <div className="flex items-center gap-2 mb-4 text-blue-700">
                    <FileText className="w-5 h-5" />
                    <h3 className="font-medium">Specific Requirements</h3>
                  </div>

                  <div className="space-y-4">
                    <div className="border rounded-md p-3 bg-gray-50">
                      {values.list_of_requirements.map((req, index) => (
                        <div key={index} className="flex items-center gap-2 mb-2">
                          <div className="flex-1">
                            <Input
                              name={`list_of_requirements.${index}.value`}
                              placeholder="Enter requirement"
                              value={req.value}
                              onChange={handleChange}
                              onBlur={handleBlur}
                              error={
                                getIn(touched, `list_of_requirements.${index}.value`) &&
                                getIn(errors, `list_of_requirements.${index}.value`)
                              }
                            />
                          </div>
                          <div className="flex items-center gap-2">
                            <label className="text-sm text-gray-600">
                              <input
                                type="checkbox"
                                name={`list_of_requirements.${index}.isRequired`}
                                checked={req.isRequired}
                                onChange={(e) => {
                                  setFieldValue(`list_of_requirements.${index}.isRequired`, e.target.checked);
                                }}
                                className="mr-2"
                              />
                              Required
                            </label>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              const newRequirements = [...values.list_of_requirements];
                              newRequirements.splice(index, 1);
                              setFieldValue('list_of_requirements', newRequirements);
                            }}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setFieldValue('list_of_requirements', [...values.list_of_requirements, { label: '', isRequired: true }]);
                        }}
                        className="mt-2"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Requirement
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Company Logo</Label>
                    <div className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors ${filePreview.avatar_photo ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-blue-400'}`}>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setFieldValue('avatar_photo', file);
                            handleFileChange('avatar_photo', file);
                          }
                        }}
                        className="hidden"
                        id="logo-upload"
                      />
                      <label htmlFor="logo-upload" className="cursor-pointer block">
                        {filePreview.avatar_photo ? (
                          <div className="flex flex-col items-center">
                            <img src={filePreview.avatar_photo} alt="Logo Preview" className="w-16 h-16 object-cover rounded-full" />
                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                setFieldValue('avatar_photo', null);
                                handleFileChange('avatar_photo', null);
                              }}
                              className="text-red-500 text-xs flex items-center mt-2"
                            >
                              <X className="w-3 h-3 mr-1" />
                              Remove
                            </button>
                          </div>
                        ) : (
                          <div>
                            <Upload className="w-8 h-8 mx-auto text-gray-400" />
                            <p className="mt-2 text-xs text-gray-500">
                              Click to upload logo
                            </p>
                          </div>
                        )}
                      </label>
                    </div>
                  </div>

                  {/* <div>
                    <Label className="text-sm font-medium">Memorandum of Agreement</Label>
                    <div className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors ${filePreview.MOA ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-blue-400'}`}>
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setFieldValue('MOA', file);
                            handleFileChange('MOA', file);
                          }
                        }}
                        className="hidden"
                        id="moa-upload"
                      />
                      <label htmlFor="moa-upload" className="cursor-pointer block">
                        {filePreview.MOA ? (
                          <div className="flex flex-col items-center">
                            <div className="flex items-center gap-2">
                              <FileText className="w-6 h-6 text-green-500" />
                              <span className="text-sm text-green-600 truncate max-w-[120px]">
                                {filePreview.MOA}
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                setFieldValue('MOA', null);
                                handleFileChange('MOA', null);
                              }}
                              className="text-red-500 text-xs flex items-center mt-2"
                            >
                              <X className="w-3 h-3 mr-1" />
                              Remove
                            </button>
                          </div>
                        ) : (
                          <div>
                            <FileText className="w-8 h-8 mx-auto text-gray-400" />
                            <p className="mt-2 text-xs text-gray-500">
                              Upload MOA document
                            </p>
                          </div>
                        )}
                      </label>
                    </div>
                  </div> */}
                </div>

                <ShadcnDialogFooter className="sticky bottom-0 pt-4 pb-2 bg-white border-t mt-6">
                  <div className="flex w-full justify-between items-center gap-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={onClose}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      className="bg-blue-600 hover:bg-blue-700 flex-1"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <span className="flex items-center justify-center">
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Saving...
                        </span>
                      ) : (
                        'Save Company'
                      )}
                    </Button>
                  </div>
                </ShadcnDialogFooter>
              </form>
            )}
          </Formik>
        </ShadcnDialogContent>
      </ShadcnDialog>
    );
  };

  const handleEmailClick = (company) => {
    const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));

    const email = company.contact_email || company.contact;

    // Check if the company has an email address
    if (!email) {
      toast.error("This company doesn't have an email address.");
      return;
    }

    // Prepare email content
    const subject = encodeURIComponent("Regarding Your Partnership with Our Institution");
    const body = encodeURIComponent(`Dear ${company.companyName || company.name},\n\nI am writing to you regarding your partnership with our institution...\n\nBest regards,\n${loggedInUser?.first_name || ''} ${loggedInUser?.last_name || ''}`);

    // Open Gmail compose window in a new tab
    window.open(`https://mail.google.com/mail/?view=cm&fs=1&to=${email}&su=${subject}&body=${body}`, "_blank");
  };

  // Update the CompanyCard component

  // Add this function to check if user has already joined a company
  const hasUserJoinedAnyCompany = () => {
    return userApplications.some(app => app.is_confirmed === 1);
  };

  // Get the joined company name for better UX
  const getJoinedCompanyName = () => {
    const joinedApp = userApplications.find(app => app.is_confirmed === 1);
    return joinedApp ? joinedApp.companyName : '';
  };

  const CompanyCard = ({ company }) => {
    const application = isTrainee
      ? userApplications.find(app => app.company_id === company.companyID)
      : null;

    const isJoining = joiningCompanyId === company.companyID;
    const canJoin = application?.status === 'approved' && !application?.is_confirmed;
    const userHasJoinedOtherCompany = hasUserJoinedAnyCompany() && !application?.is_confirmed;
    const joinedCompanyName = getJoinedCompanyName();

    const renderRequirements = () => {
      let requirements = [];
      try {
        requirements = typeof company.list_of_requirements === 'string'
          ? JSON.parse(company.list_of_requirements)
          : company.list_of_requirements;
      } catch (e) {
        console.error('Error parsing requirements:', e);
      }

      return (
        <div className="mt-4">
          <h4 className="text-sm font-semibold text-gray-700 mb-2">Requirements:</h4>
          <ul className="space-y-2">
            {requirements.map((req, index) => (
              <li key={index} className="flex items-center justify-between">
                <span className="text-sm text-gray-600">• {req.value}</span>
                {req.isRequired ? (
                  <span className="px-2 py-0.5 text-xs font-medium bg-red-100 text-red-700 rounded-full">
                    Required
                  </span>
                ) : (
                  <span className="px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-600 rounded-full">
                    Optional
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>
      );
    };

    return (
      <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden border border-gray-100">
        {/* Company Header */}
        <div className="relative h-48">
          <img
            src={company.avatar_photo || '/company-placeholder.png'}
            alt={company.companyName}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <h3 className="text-xl font-semibold text-white mb-1">{company.companyName}</h3>
            <p className="text-gray-200 text-sm">{company.expertise}</p>
          </div>
        </div>

        {/* Company Content */}
        <div className="p-4 space-y-4">
          <div className="space-y-2">
            <div className="flex items-start gap-2 text-gray-600">
              <Mail className="h-4 w-4 mt-1" />
              <p className="text-sm">{company.contact_email}</p>
            </div>
            <div className="flex items-start gap-2 text-gray-600">
              <MapPin className="h-4 w-4 mt-1" />
              <p className="text-sm">{company.address}</p>
            </div>
          </div>

          {/* MOA Status & Application Status */}
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-1">MOA Status</h4>
              <span
                className={`px-2 py-1 text-xs font-medium rounded-full ${company.moa_status === 'approved'
                  ? 'bg-green-100 text-green-800'
                  : company.moa_status === 'rejected'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-yellow-100 text-yellow-800'
                  }`}
              >
                {company.moa_status.charAt(0).toUpperCase() + company.moa_status.slice(1)}
              </span>
            </div>

            {/* Application Status */}
            {isTrainee && application && (
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-1">Application Status</h4>
                <span
                  className={`px-2 py-1 text-xs font-medium rounded-full ${application.status === 'approved'
                    ? 'bg-green-100 text-green-800'
                    : application.status === 'rejected'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-yellow-100 text-yellow-800'
                    }`}
                >
                  {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                </span>
              </div>
            )}
          </div>

          {/* Show application status or apply button for trainees */}
          {isTrainee && !application && company.moa_status === 'approved' && (
            <ButtonUI
              onClick={() => handleApplyClick(company)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center gap-2 shadow-sm transition-all hover:shadow-md"
            >
              Apply Now
            </ButtonUI>
          )}

          {/* Rating Section */}
          <div className="pt-4 border-t">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-4 w-4 ${star <= (parseFloat(company.averageRating) || 0)
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-gray-300'
                      }`}
                  />
                ))}
                <span className="ml-2 text-sm text-gray-600">
                  ({company.totalFeedback || 0})
                </span>
              </div>
              <ButtonUI
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedCompany(company);
                  setIsFeedbackModalOpen(true);
                  fetchCompanyFeedback(company.companyID);
                }}
                className="text-blue-600 hover:text-blue-700"
              >
                <Star className="h-4 w-4 mr-1" />
                Rate
              </ButtonUI>

            </div>

          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="flex gap-2">
              {canEditCompany && (
                <ButtonUI
                  variant="outline"
                  size="sm"
                  onClick={() => handleEditClick(company)}
                  className="text-gray-600"
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </ButtonUI>
              )}

              <ButtonUI
                variant="outline"
                size="sm"
                onClick={() => handleEmailClick(company)}
                className="text-green-600"
              >
                <Mail className="h-4 w-4 mr-1" />
                Email
              </ButtonUI>
            </div>

            <ButtonUI
              variant="outline"
              size="sm"
              onClick={() => handleViewMoa(company.companyID)}
              className="text-blue-600"
            >
              <FileText className="h-4 w-4 mr-1" />
              MOA
            </ButtonUI>
            {/* Join Company Button - Only show for approved applications */}
            {isTrainee && canJoin && (
              userHasJoinedOtherCompany ? (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div>
                        <ButtonUI
                          variant="default"
                          size="sm"
                          disabled={true}
                          className="flex items-center gap-1 bg-gray-400 text-white cursor-not-allowed opacity-60"
                        >
                          <CheckCircle2 className="h-4 w-4" />
                          Join
                        </ButtonUI>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>You have already joined {joinedCompanyName}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ) : (
                <ButtonUI
                  variant="default"
                  size="sm"
                  onClick={() => handleJoinCompany(company.companyID)}
                  disabled={isJoining}
                  className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {isJoining ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Joining...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-4 w-4" />
                      Join
                    </>
                  )}
                </ButtonUI>
              )
            )}

            {/* Joined Indicator */}
            {isTrainee && application?.is_confirmed ? (
              <div className="flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-md text-sm">
                <CheckCircle2 className="h-4 w-4" />
                Joined
              </div>
            ) : null}

          </div>
        </div>
      </div>
    );
  };

  // Add this function to handle opening the feedback modal
  const handleAddFeedback = () => {
    setIsFeedbackModalOpen(true);
  };

  // Add this dialog component to show all feedback
  const FeedbackViewDialog = ({ isOpen, onClose, company, feedback }) => {
    return (
      <ShadcnDialog open={isOpen} onOpenChange={onClose}>
        <ShadcnDialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          <ShadcnDialogHeader>
            <ShadcnDialogTitle className="flex items-center gap-2">
              <span>Feedback for {company?.name}</span>
              <div className="flex items-center ml-2">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span className="ml-1 text-sm">
                  {feedback.length > 0
                    ? (feedback.reduce((acc, curr) => acc + curr.rating, 0) / feedback.length).toFixed(1)
                    : "No ratings"}
                </span>
              </div>
            </ShadcnDialogTitle>
          </ShadcnDialogHeader>

          <FeedbackList feedback={feedback} />

          <ShadcnDialogFooter>
            <ButtonUI variant="outline" onClick={onClose}>
              Close
            </ButtonUI>
          </ShadcnDialogFooter>
        </ShadcnDialogContent>
      </ShadcnDialog>
    );
  };

  const handleRequirementToggle = (reqId) => {
    setSelectedRequirements(prev => {
      if (prev.includes(reqId)) {
        return prev.filter(id => id !== reqId);
      }
      return [...prev, reqId];
    });
  };

  const handleFileUpload = (reqId, file) => {
    setApplicationFiles(prev => ({
      ...prev,
      [reqId]: file
    }));
  };

  const validateRequirements = () => {
    const requirements = typeof company.list_of_requirements === 'string'
      ? JSON.parse(company.list_of_requirements)
      : company.list_of_requirements;

    const newErrors = {};
    requirements.forEach((req) => {
      if (req.isRequired && !applicationFiles[req.id]?.file) {
        newErrors[req.id] = 'This requirement is mandatory';
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmitApplication = async () => {
    if (!validateRequirements()) {
      toast.error('Please complete all required requirements');
      return;
    }

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('companyID', selectedCompany.companyID);

      company.list_of_requirements.forEach(req => {
        if (applicationFiles[req.id]?.file) {
          formData.append(`file_${req.id}`, applicationFiles[req.id].file);
        }
      });

      const response = await axios.post('/company/applyNow', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.success) {
        toast.success('Application submitted successfully');
        onClose();
        setApplicationFiles({});
        fetchUserApplications();
      }
    } catch (error) {
      console.error('Error submitting application:', error);
      toast.error(error.response?.data?.message || 'Failed to submit application');
    } finally {
      setIsLoading(false);
    }
  };

  // Update the handleViewMoa function to also set the MOA status
  const handleViewMoa = async (companyId) => {
    setSelectedCompanyId(companyId);
    // Find the company and store its MOA status
    const company = companies.find(c => c.companyID === companyId);
    setSelectedCompanyMOAStatus(company?.moa_status);
    setMoaModalOpen(true);
  };

  // Add this confirmation handler
  const handleConfirmAction = async () => {
    try {
      if (confirmAction.type) {
        await handleMoaApproval(confirmAction.companyId, confirmAction.type);
        setIsMoaConfirmDialogOpen(false);
      }
    } finally {
      setIsConfirmDialogOpen(false);
      // setConfirmAction({ type: '', companyId: null });
    }
  };

  // Update the Apply Now handler
  const handleApplyClick = (company) => {
    setSelectedCompany(company);
    setIsModalOpen(true);
    setIsApplying(true);
  };

  // Update the MOA approval handler
  const handleMoaAction = (type, companyId) => {
    setConfirmAction({ type, companyId });
    setIsMoaConfirmDialogOpen(true);
  };

  // Add this function to handle file uploads with progress
  const handleFileUploadWithProgress = (reqId, file) => {
    const formData = new FormData();
    formData.append('file', file);

    axios.post('/upload-endpoint', formData, {
      onUploadProgress: (progressEvent) => {
        const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        setApplicationFiles(prev => ({
          ...prev,
          [reqId]: { file, progress }
        }));
      }
    }).then(response => {
      // Handle successful upload
      toast.success('File uploaded successfully');
    }).catch(error => {
      // Handle upload error
      toast.error('Failed to upload file');
    });
  };

  // Update the application dialog to include file upload on submission
  const ApplicationDialog = ({ isOpen, onClose, company }) => {
    const [applicationFiles, setApplicationFiles] = useState({});
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);

    console.log({ company })
    company.list_of_requirements = (company.list_of_requirements || []).map(req => ({
      ...req,
      id: req.value,
      required: true
    }));
    const allRequirementsMet = () => {
      return company.list_of_requirements.every(req => {
        if (req.required) {
          return applicationFiles[req.id]?.file;
        }
        return true;
      });
    };

    const handleFileSelect = (reqId, file) => {
      setApplicationFiles(prev => ({
        ...prev,
        [reqId]: { file }
      }));
      setErrors(prev => ({
        ...prev,
        [reqId]: file ? '' : 'This field is required'
      }));
    };

    const validateRequirements = () => {
      const requirements = typeof company.list_of_requirements === 'string'
        ? JSON.parse(company.list_of_requirements)
        : company.list_of_requirements;

      const newErrors = {};
      requirements.forEach((req) => {
        if (req.isRequired && !applicationFiles[req.id]?.file) {
          newErrors[req.id] = 'This requirement is mandatory';
        }
      });
      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    };

    const handleSubmitApplication = async () => {
      if (!validateRequirements()) {
        toast.error('Please complete all required requirements');
        return;
      }

      setIsLoading(true);
      try {
        const formData = new FormData();
        formData.append('companyID', company.companyID);

        company.list_of_requirements.forEach(req => {
          if (applicationFiles[req.id]?.file) {
            formData.append(`file_${req.id}`, applicationFiles[req.id].file);
          }
        });

        const response = await axios.post('/company/applyNow', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });

        if (response.data.success) {
          toast.success('Application submitted successfully');
          onClose();
          setApplicationFiles({});
          fetchUserApplications();
        }
      } catch (error) {
        console.error('Error submitting application:', error);
        toast.error(error.response?.data?.message || 'Failed to submit application');
      } finally {
        setIsLoading(false);
      }
    };

    return (
      <ShadcnDialog open={isOpen} onOpenChange={onClose}>
        <ShadcnDialogContent className="sm:max-w-[600px] max-w-[95%] mx-auto max-h-[90vh] overflow-y-auto p-4 rounded-lg">
          <ShadcnDialogHeader className="top-0 pb-2 mt-4">
            <ShadcnDialogTitle className="text-xl font-semibold flex items-center gap-2">
              <InfoIcon className="h-5 w-5 text-green-500 font-semibold" />
              Apply to {company.companyName}
            </ShadcnDialogTitle>
            <p className="text-sm text-left text-gray-500 mt-1">Please upload the required documents to complete your application.
            </p>
          </ShadcnDialogHeader>
          <div className="py-4">
            <div className="space-y-4">
              {company.list_of_requirements?.map((req, index) => (
                <div
                  key={index}
                  className={`p-4 border rounded-lg shadow-sm hover:shadow-md transition-shadow 
                    ${errors[req.id] ? 'border-red-500' : ''}
                    ${req.isRequired ? 'bg-red-50' : 'bg-gray-50'}`}
                >
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-sm font-medium text-gray-700">
                      {req.value}
                      {req.isRequired && <span className="text-red-500 ml-1">*</span>}
                    </label>
                    {req.isRequired ? (
                      <span className="px-2 py-0.5 text-xs font-medium bg-red-100 text-red-700 rounded-full">
                        Required
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 text-xs font-medium bg-gray-200 text-gray-600 rounded-full">
                        Optional
                      </span>
                    )}
                  </div>
                  <div className="mt-2">
                    <DropzoneArea
                      fieldName={`file_${req.id}`}
                      acceptedTypes={req.file_types}
                      onFileSelect={(file) => handleFileSelect(req.id, file)}
                      currentFile={applicationFiles[req.id]?.file}
                    />
                    {errors[req.id] && (
                      <p className="text-red-500 text-sm mt-1">{errors[req.id]}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <ShadcnDialogFooter>
            <ButtonUI
              onClick={handleSubmitApplication}
              disabled={isLoading}
              className={isLoading ? 'opacity-50 cursor-not-allowed' : ''}
            >
              {isLoading ? 'Submitting...' : 'Submit Application'}
            </ButtonUI>
          </ShadcnDialogFooter>
        </ShadcnDialogContent>
      </ShadcnDialog>
    );
  };

  // Update the handleJoinCompany function to use the correct API endpoint
  const handleJoinCompany = async (companyId) => {
    try {
      setJoiningCompanyId(companyId); // Track which company is being joined

      const response = await axios.post('company/trainee/application/company/join', { companyId });

      if (response.data.success) {
        toast.success('Successfully joined the company');
        fetchUserApplications(); // Refresh applications to update UI
      }
    } catch (error) {
      console.error('Error joining company:', error);
      toast.error(error.response?.data?.message || 'Failed to join company');
    } finally {
      setJoiningCompanyId(null); // Reset joining state
    }
  };

  console.log({ role })
  return (
    <div className="space-y-6">
      

      {/* Multiple applications alert - Modern Design */}
      {isTrainee && approvedApplications.length > 1 && !hasUserJoinedAnyCompany() && (
        <div className="mb-6 p-5 bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-xl shadow-sm">
          <div className="flex items-start gap-4">
            <div className="bg-amber-100 p-2.5 rounded-full shrink-0">
              <AlertCircle className="h-6 w-6 text-amber-600" />
            </div>
            <div>
              <h3 className="font-medium text-amber-800 text-lg mb-1">Multiple Approved Applications</h3>
              <p className="text-sm text-amber-700 leading-relaxed">
                Congratulations! You have been approved by multiple companies. Please choose one company to join by clicking the <span className="font-semibold bg-blue-100 text-blue-800 px-2 py-0.5 rounded">Join</span> button on your preferred company.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Header Section */}
      <div className="companies-header space-y-4 mb-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">Companies</h1>
        </div>
      </div>

        {/* User Scope Badge - Modern Design */}
      {userScope && (
        <div className="mb-4 hover:shadow-md transition-all duration-300">
          <div className="flex flex-col md:flex-row md:items-start gap-2">
            {/* Left side - User scope information */}
            <div className="flex-1">


              {role === 'ojt-coordinator' || role === 'trainee' ? (
                <>
                  <div className="flex items-center gap-2 mt-2 mb-2">

                    <Building className="h-5 w-5 text-blue-600" />
                    <span className="px-3 py-1.5 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                      {userScope.collegeName}
                    </span>
                    <span className="px-3 py-1.5 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                      {userScope.programName}
                    </span>
                  </div>
                  {isTrainee && hasUserJoinedAnyCompany() && (
                    <div className="mt-3 p-3 bg-green-50 border border-green-100 rounded-lg">
                      <p className="text-sm text-gray-700">
                        You have joined <span className="font-semibold text-green-700">{getJoinedCompanyName()}</span> for your internship.
                      </p>
                    </div>
                  )}
                </>
              ) : role === 'dean' ? (
                <>
                  <div className="flex items-center gap-2 mt-2 mb-2">
                    <span className="px-3 py-1.5 text-xs font-medium bg-purple-100 text-purple-800 rounded-full">
                      {userScope.collegeName}
                    </span>
                  </div>
                </>
              ) : role === 'hte-supervisor' ? (
                <>
                  <div className="flex items-center gap-2 mt-2 mb-2">
                    <span className="px-3 py-1.5 text-xs font-medium bg-orange-100 text-orange-800 rounded-full">
                      {userScope.companyName}
                    </span>
                  </div>
                </>
              ) : null}
            </div>

            {/* Right side - Joined company information (only for trainees who have joined) */}

          </div>
        </div>
      )}
        
        <div className="flex flex-col sm:flex-row gap-3 w-full">
          <div className="relative flex-1 min-w-0">
            <Input
              type="text"
              placeholder="Search companies..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-full bg-white"
            />
          </div>
          
          <div className="w-full sm:flex-shrink-0 sm:w-auto">
            <select
              value={moaStatusFilter}
              onChange={(e) => setMoaStatusFilter(e.target.value)}
              className="w-full h-10 px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All MOA Status</option>
              <option value="approved">Approved</option>
              <option value="pending">Pending</option>
              <option value="rejected">Rejected</option>
              <option value="none">No MOA</option>
            </select>
          </div>
        </div>

        {canEditCompany && (
          <ButtonUI
            onClick={() => {
              setEditingCompany(null);
              setIsAddCompanyModalOpen(true);
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center gap-2 shadow-sm transition-all hover:shadow-md w-full sm:w-auto"
          >
            <Plus className="w-5 h-5" />
            <span>Add New Company</span>
          </ButtonUI>
        )}

      </div>

      {/* Companies Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-2">
        {filterCompanies(companies).map((company) => (
          <CompanyCard
            key={company.companyID}
            company={company}
          />
        ))}
      </div>

      {isModalOpen && selectedCompany && (
        <ApplicationDialog
          isOpen={isModalOpen}
          onClose={closeModal}
          company={selectedCompany}
        />
      )}

      {
        isSortModalOpen && (
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
        )
      }

      {
        isAddCompanyModalOpen && (
          <AddCompanyDialog
            isOpen={isAddCompanyModalOpen}
            onClose={() => {
              setIsAddCompanyModalOpen(false);
              setEditingCompany(null);
            }}
            // onSubmit={handleSubmit}
            editData={editingCompany}
            fetchCompanies={fetchCompanies}
            userScope={userScope}
          />
        )
      }

      {/* Feedback Dialog */}
      {
        isFeedbackModalOpen && selectedCompany && (
          <FeedbackDialog
            isOpen={isFeedbackModalOpen}
            onClose={() => {
              setIsFeedbackModalOpen(false);
              fetchCompanyFeedback(selectedCompany.companyID);
            }}
            company={selectedCompany}
            onFeedbackSubmitted={() => fetchCompanyFeedback(selectedCompany.companyID)}
            feedback={companyFeedback}
            isLoadingFeedback={isLoadingFeedback}
          />
        )
      }

      {/* Feedback View Dialog */}
      {
        isFeedbackViewOpen && selectedCompanyForFeedback && (
          <FeedbackViewDialog
            isOpen={isFeedbackViewOpen}
            onClose={() => setIsFeedbackViewOpen(false)}
            company={selectedCompanyForFeedback}
            feedback={companyFeedback}
          />
        )
      }

      <ToastContainer />
      {/* Update MOA Modal */}
      <ShadcnDialog open={moaModalOpen} onOpenChange={setMoaModalOpen}>
        <ShadcnDialogContent className="sm:max-w-[600px] max-w-[95%] mx-auto max-h-[90vh] overflow-y-auto p-4 rounded-lg">
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
          {/* Only show MOA approval buttons for dean */}
          <ShadcnDialogFooter className="flex justify-between items-center border-t pt-4">
            {canApproveMOA && selectedCompanyMOAStatus === 'pending' && (
              <div className="flex gap-2">
                <ButtonUI
                  onClick={() => {
                    setConfirmAction({
                      type: 'rejected',
                      companyId: selectedCompanyId
                    });
                    setIsMoaConfirmDialogOpen(true);
                  }}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  <X className="w-4 h-4 mr-2" />
                  Reject MOA
                </ButtonUI>
                <ButtonUI
                  onClick={() => {
                    setConfirmAction({
                      type: 'approved',
                      companyId: selectedCompanyId
                    });
                    setIsMoaConfirmDialogOpen(true);
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Check className="w-4 h-4 mr-2" />
                  Approve MOA
                </ButtonUI>
              </div>
            )}
          </ShadcnDialogFooter>
        </ShadcnDialogContent>
      </ShadcnDialog>

      {/* Add Confirmation Dialog */}
      <ShadcnDialog open={isMoaConfirmDialogOpen} onOpenChange={setIsMoaConfirmDialogOpen}>
        <ShadcnDialogContent className="sm:max-w-[425px]">
          <ShadcnDialogHeader>
            <ShadcnDialogTitle>
              Confirm {confirmAction.type === 'approved' ? 'Approval' : 'Rejection'}
            </ShadcnDialogTitle>
          </ShadcnDialogHeader>
          <div className="py-4">
            <p className="text-gray-600">
              {confirmAction.type === 'approved'
                ? 'Are you sure you want to approve this MOA? This will allow the company to accept student applications.'
                : 'Are you sure you want to reject this MOA? The company will need to submit a new one.'}
            </p>
          </div>
          <ShadcnDialogFooter>
            <ButtonUI variant="outline" onClick={() => setIsMoaConfirmDialogOpen(false)}>
              Cancel
            </ButtonUI>
            <ButtonUI
              onClick={handleConfirmAction}
              className={confirmAction.type === 'approved'
                ? 'bg-green-600 hover:bg-green-700 text-white'
                : 'bg-red-600 hover:bg-red-700 text-white'
              }
            >
              {confirmAction.type === 'approved' ? 'Yes, Approve' : 'Yes, Reject'}
            </ButtonUI>
          </ShadcnDialogFooter>
        </ShadcnDialogContent>
      </ShadcnDialog>




    </div >
  );
}

export default CoordinatorCompanies;
