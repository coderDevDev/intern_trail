import React, { useState, useEffect } from 'react';
import {
  AlertTriangle,
  Calendar,
  MapPin,
  User,
  Building,
  Clock,
  FileText,
  Plus,
  Edit2,
  Trash2,
  X,
  Check,
  ChevronDown,
  Search,
  Filter,
  AlertCircle,
  Loader,
  RefreshCw,
  Info,
  Eye,
  Loader2,
  CheckCircle,
} from 'lucide-react';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { toast, ToastContainer } from 'react-toastify';
import axios from 'axios';
import 'react-toastify/dist/ReactToastify.css';

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"


function StudentReports() {
  const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));

  const [reports, setReports] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetchingReports, setFetchingReports] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedReport, setSelectedReport] = useState(null);
  const [userScope, setUserScope] = useState(null);

  console.log({ loggedInUser: loggedInUser.first_name })
  const [formData, setFormData] = useState({
    name: loggedInUser ? `${loggedInUser.first_name} ${loggedInUser.last_name}` : '',
    department: '',
    dateTime: new Date().toISOString().slice(0, 16),
    location: '',
    emergencyType: '',
    severity: '',
    details: '',
    status: 'pending',
    company_id: '',
    companyName: ''
  });

  // Add check for logged in user
  useEffect(() => {
    if (!loggedInUser) {
      toast.error('Please log in to access this page');
      // Optionally redirect to login page
      // window.location.href = '/login';
    }
  }, []);


  // Add these states
  const [userApplications, setUserApplications] = useState([]);
  const [joinedCompany, setJoinedCompany] = useState({});

  // Add this useEffect to fetch user applications
  useEffect(() => {
    const fetchUserApplications = async () => {
      try {
        const response = await axios.get('company/applications/user');
        if (response.data.success) {
          setUserApplications(response.data.data);


          // Check if user has already joined a company
          const joinedApp = response.data.data.find(app => app.is_confirmed);


          setJoinedCompany(joinedApp);



        }
      } catch (error) {
        console.error('Error fetching user applications:', error);
      }
    };

    fetchUserApplications();
  }, []);

  // Add this helper function
  const getJoinedCompanyName = () => {
    const joinedApp = userApplications.find(app => app.is_confirmed === 1);
    return joinedApp ? joinedApp.companyName : '';
  };



  // Fetch reports on component mount
  useEffect(() => {
    fetchReports();
  }, []);

  // Add this useEffect to fetch user scope
  useEffect(() => {

    const fetchUserScope = async () => {
      try {
        const response = await axios.get('college/user-scope');

        console.log({ response })
        if (response.data.success) {
          setUserScope(response.data.data);
        }
      } catch (error) {
        console.error('Error fetching user scope:', error);
      }
    };

    fetchUserScope();
  }, []);

  const fetchReports = async () => {
    setFetchingReports(true);
    try {
      const response = await axios.get('/emergency-reports');
      setReports(response.data.data);
    } catch (error) {
      console.error('Error fetching reports:', error);
      toast.error('Failed to load emergency reports');
    } finally {
      setFetchingReports(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleRadioChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setFormData({
      name: loggedInUser ? `${loggedInUser.first_name} ${loggedInUser.last_name}` : '',
      department: '',
      dateTime: new Date().toISOString().slice(0, 16),
      location: '',
      emergencyType: '',
      severity: '',
      details: '',
      status: 'pending',
      company_id: joinedCompany?.company_id || '',
      companyName: joinedCompany?.companyName || ''
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const reportData = {
        name: formData.name,
        department: formData.department,
        location: formData.location,
        emergency_type: formData.emergencyType,
        severity: formData.severity,
        details: formData.details,
        company_id: joinedCompany?.company_id,
        companyName: joinedCompany?.companyName
      };

      if (selectedReport) {
        await axios.put(`/emergency-reports/${selectedReport.id}`, reportData);
        toast.success('Emergency report updated successfully');
      } else {
        await axios.post('/emergency-reports', reportData);
        toast.success('Emergency report submitted successfully');
      }

      setIsModalOpen(false);
      resetForm();
      fetchReports();
    } catch (error) {
      console.error('Error submitting report:', error);
      toast.error('Failed to submit emergency report');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (report) => {
    setSelectedReport(report);
    setFormData({
      name: report.name,
      department: report.department,
      dateTime: new Date(report.dateTime).toISOString().slice(0, 16),
      location: report.location,
      emergencyType: report.emergencyType,
      severity: report.severity,
      details: report.details,
      status: report.status,
      company_id: report.company_id,
      companyName: report.companyName
    });
    setIsModalOpen(true);
  };

  const handleView = (report) => {
    setSelectedReport(report);
    setIsViewModalOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedReport) return;

    setLoading(true);
    try {
      await axios.delete(`/emergency-reports/${selectedReport.id}`);
      toast.success('Emergency report deleted successfully');
      setIsDeleteModalOpen(false);
      fetchReports();
    } catch (error) {
      console.error('Error deleting report:', error);
      toast.error('Failed to delete emergency report');
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = (report) => {
    setSelectedReport(report);
    setIsDeleteModalOpen(true);
  };

  const handleNewReport = () => {
    setSelectedReport(null);
    resetForm();
    setIsModalOpen(true);
  };

  // Filter reports based on active tab and search term
  const filteredReports = reports.filter(report => {
    const matchesTab = activeTab === 'all' || report.status === activeTab;
    const matchesSearch =
      report.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.emergencyType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.details.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesTab && matchesSearch;
  });

  // Helper function to get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'in-progress': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'resolved': return 'bg-green-100 text-green-800 border-green-200';
      case 'dismissed': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Helper function to get severity color
  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'Low': return 'bg-green-100 text-green-800 border-green-200';
      case 'Moderate': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'High': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'Critical': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Helper function to get severity icon
  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'Low': return <AlertCircle className="h-4 w-4" />;
      case 'Moderate': return <AlertCircle className="h-4 w-4" />;
      case 'High': return <AlertTriangle className="h-4 w-4" />;
      case 'Critical': return <AlertTriangle className="h-4 w-4" />;
      default: return <AlertCircle className="h-4 w-4" />;
    }
  };

  // Helper function to format dates
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid Date';
      return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      }).format(date);
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid Date';
    }
  };

  // Add this component for showing approval status
  const StatusApprovals = ({ report }) => (
    <div className="mt-4 space-y-2">
      <h4 className="text-sm font-medium text-gray-500">Approval Status</h4>
      <div className="flex gap-4">
        <div className="flex items-center gap-2">
          <Badge className={report.hte_approval ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}>
            <Check className={`h-4 w-4 ${report.hte_approval ? 'text-green-600' : 'text-gray-400'}`} />
            HTE Supervisor
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <Badge className={report.coordinator_approval ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}>
            <Check className={`h-4 w-4 ${report.coordinator_approval ? 'text-green-600' : 'text-gray-400'}`} />
            Coordinator
          </Badge>
        </div>
      </div>
    </div>
  );

  // Add this component for showing status history
  const StatusHistory = ({ report }) => (
    <div className="mt-4">
      <h4 className="text-sm font-medium text-gray-500 mb-2">Status Updates</h4>
      <div className="space-y-2">
        {report.status_updated_at && (
          <div className="flex justify-between text-sm">
            <span>Updated to {report.status}</span>
            <span className="text-gray-500">
              by {report.updated_by_role} on {formatDate(report.status_updated_at)}
            </span>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="">
      <div className="bg-white rounded-lg overflow-hidden">
        <div className="">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-semibold">Emergency Reports</h1>
              <p className="text-gray-500 mt-1 mb-3">Manage and track emergency incidents</p>
            </div>
            <Button
              disabled={!joinedCompany}
              onClick={handleNewReport}
              className="bg-red-600 hover:bg-red-700 w-full sm:w-auto mb-4"
            >
              <Plus className="h-4 w-4 mr-2" />
              Report Emergency
            </Button>
          </div>

          {/* Add userScope display */}
          {userScope && (
            <div className="rounded-xl">
              <div className="flex flex-col md:flex-row md:items-start gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mt-2">
                    <Building className="h-5 w-5 text-blue-600" />
                    <span className="px-3 py-1.5 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                      {userScope.collegeName}
                    </span>
                    <span className="px-3 py-1.5 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                      {userScope.programName}
                    </span>
                  </div>

                  {
                    console.log({ joinedCompany })
                  }
                  {joinedCompany && joinedCompany.companyName && (
                    <div className="mt-3 p-3 bg-green-50 border border-green-100 rounded-lg">
                      <p className="text-sm text-gray-700">
                        Currently assigned to <span className="font-semibold text-green-700">{joinedCompany.companyName}</span>
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="mt-6 flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1"> 
              <Input
                placeholder="Search reports..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full mb-2"
              />
            </div>
            <Select value={activeTab} onValueChange={setActiveTab}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Reports</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="dismissed">Dismissed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Responsive Table Container */}
        <div className="block w-full overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left py-3 px-2 sm:px-4 text-xs sm:text-sm font-medium text-gray-600 whitespace-nowrap">Type</th>
                <th className="hidden sm:table-cell text-left py-3 px-2 sm:px-4 text-xs sm:text-sm font-medium text-gray-600 whitespace-nowrap">Reporter</th>
                <th className="hidden md:table-cell text-left py-3 px-2 sm:px-4 text-xs sm:text-sm font-medium text-gray-600 whitespace-nowrap">Location</th>
                <th className="hidden lg:table-cell text-left py-3 px-2 sm:px-4 text-xs sm:text-sm font-medium text-gray-600 whitespace-nowrap">Date & Time</th>
                <th className="text-left py-3 px-2 sm:px-4 text-xs sm:text-sm font-medium text-gray-600 whitespace-nowrap">Status</th>
                <th className="text-left py-3 px-2 sm:px-4 text-xs sm:text-sm font-medium text-gray-600 whitespace-nowrap">Severity</th>
                <th className="text-right py-3 px-2 sm:px-4 text-xs sm:text-sm font-medium text-gray-600 whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody>
              {fetchingReports ? (
                <tr>
                  <td colSpan="7" className="text-center py-8">
                    <div className="flex items-center justify-center text-gray-500">
                      <Loader className="h-5 w-5 animate-spin mr-2" />
                      Loading reports...
                    </div>
                  </td>
                </tr>
              ) : filteredReports.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-8">
                    <div className="text-gray-500">
                      {searchTerm ? 'No reports match your search' : 'No reports found'}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredReports.map((report) => (
                  <tr key={report.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-2 sm:px-4 text-xs sm:text-sm">
                      <div className="flex flex-col">
                        <span className="font-medium">{report.emergency_type}</span>
                        <span className="sm:hidden text-xs text-gray-500">{report.name}</span>
                      </div>
                    </td>
                    <td className="hidden sm:table-cell py-3 px-2 sm:px-4 text-xs sm:text-sm">{report.name}</td>
                    <td className="hidden md:table-cell py-3 px-2 sm:px-4 text-xs sm:text-sm">{report.location}</td>
                    <td className="hidden lg:table-cell py-3 px-2 sm:px-4 text-xs sm:text-sm">{formatDate(report.created_at)}</td>
                    <td className="py-3 px-2 sm:px-4">
                      <Badge className={`${getStatusColor(report.status)}`}>
                        {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                      </Badge>
                    </td>
                    <td className="py-3 px-2 sm:px-4">
                      <Badge className={`${getSeverityColor(report.severity)} flex items-center gap-1 w-fit`}>
                        {getSeverityIcon(report.severity)}
                        {report.severity}
                      </Badge>
                    </td>
                    <td className="py-3 px-2 sm:px-4 text-right">
                      <div className="flex flex-col sm:flex-row items-end sm:items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleView(report)}
                          className="hover:bg-gray-100 w-full sm:w-auto text-xs sm:text-sm"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => confirmDelete(report)}
                          className="hover:bg-red-50 text-red-600 w-full sm:w-auto text-xs sm:text-sm"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Report Form Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto p-4 sm:p-6 w-[92%] sm:w-full mx-auto rounded-lg">
          <DialogHeader className="top-0 mt-4 z-10">
            <DialogTitle className="text-xl font-semibold flex items-center text-left gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              {selectedReport ? 'Edit Emergency Report' : 'Report an Emergency'}
            </DialogTitle>
            <p className="text-sm text-left text-gray-500">
              Please provide detailed information about the incident to help us respond appropriately.
            </p>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6 my-0">
            {/* Company Information */}
            {joinedCompany && (
              <div className="flex items-center gap-4 p-3 bg-blue-50 rounded-lg">
                <div className="flex-shrink-0">
                  {joinedCompany.avatar_photo ? (
                    <img
                      src={joinedCompany.avatar_photo}
                      alt={joinedCompany.companyName}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <Building className="w-10 h-10 text-blue-600" />
                  )}
                </div>
                <div>
                  <h4 className="font-medium text-blue-900">{joinedCompany.companyName}</h4>
                  <p className="text-sm text-blue-700">Reporting for this company</p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name" className="text-sm font-medium">Your Name</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    disabled
                    className="bg-gray-50"
                  />
                </div>

                <div>
                  <Label htmlFor="department" className="text-sm font-medium">Department</Label>
                  <Input
                    id="department"
                    name="department"
                    value={formData.department}
                    onChange={handleInputChange}
                    className="mt-1"
                    required
                    placeholder="Your department or unit"
                  />
                </div>

                <div>
                  <Label htmlFor="dateTime" className="text-sm font-medium">Date and Time of Incident</Label>
                  <Input
                    id="dateTime"
                    name="dateTime"
                    type="datetime-local"
                    value={formData.dateTime}
                    onChange={handleInputChange}
                    className="mt-1"
                    required
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="location" className="text-sm font-medium">Location of Incident</Label>
                  <Input
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    className="mt-1"
                    required
                    placeholder="Building, floor, room number, etc."
                  />
                </div>

                <div>
                  <Label className="text-sm font-medium">Type of Emergency</Label>
                  <RadioGroup
                    value={formData.emergencyType}
                    onValueChange={(value) => handleRadioChange('emergencyType', value)}
                    className="mt-2 grid grid-cols-1 gap-2"
                  >
                    <div className="flex items-center space-x-2 rounded-md border p-2 hover:bg-gray-50">
                      <RadioGroupItem value="Hazard/Equipment Failure" id="emergency-type-1" />
                      <Label htmlFor="emergency-type-1" className="flex-grow cursor-pointer">Hazard/Equipment Failure</Label>
                    </div>
                    <div className="flex items-center space-x-2 rounded-md border p-2 hover:bg-gray-50">
                      <RadioGroupItem value="Medical" id="emergency-type-2" />
                      <Label htmlFor="emergency-type-2" className="flex-grow cursor-pointer">Medical</Label>
                    </div>
                    <div className="flex items-center space-x-2 rounded-md border p-2 hover:bg-gray-50">
                      <RadioGroupItem value="Disaster" id="emergency-type-3" />
                      <Label htmlFor="emergency-type-3" className="flex-grow cursor-pointer">Disaster</Label>
                    </div>
                    <div className="flex items-center space-x-2 rounded-md border p-2 hover:bg-gray-50">
                      <RadioGroupItem value="Harassment" id="emergency-type-4" />
                      <Label htmlFor="emergency-type-4" className="flex-grow cursor-pointer">Harassment</Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium">Severity Level</Label>
              <RadioGroup
                value={formData.severity}
                onValueChange={(value) => handleRadioChange('severity', value)}
                className="mt-2 grid grid-cols-2 sm:grid-cols-4 gap-2"
              >
                <label
                  htmlFor="severity-1"
                  className={`flex flex-col items-center space-y-1 rounded-md border p-3 hover:bg-green-50 transition-colors cursor-pointer ${
                    formData.severity === 'Low' ? 'bg-green-100 border-green-400' : ''
                  }`}
                >
                  <RadioGroupItem value="Low" id="severity-1" className="sr-only" />
                  <div
                    className={`w-4 h-4 rounded-full ${
                      formData.severity === 'Low' ? 'bg-green-500' : 'bg-green-200'
                    }`}
                  ></div>
                  <span
                    className={`text-sm ${
                      formData.severity === 'Low' ? 'font-medium text-green-700' : ''
                    }`}
                  >
                    Low
                  </span>
                </label>
                <label
                  htmlFor="severity-2"
                  className={`flex flex-col items-center space-y-1 rounded-md border p-3 hover:bg-yellow-50 transition-colors cursor-pointer ${
                    formData.severity === 'Moderate' ? 'bg-yellow-100 border-yellow-400' : ''
                  }`}
                >
                  <RadioGroupItem value="Moderate" id="severity-2" className="sr-only" />
                  <div
                    className={`w-4 h-4 rounded-full ${
                      formData.severity === 'Moderate' ? 'bg-yellow-500' : 'bg-yellow-200'
                    }`}
                  ></div>
                  <span
                    className={`text-sm ${
                      formData.severity === 'Moderate' ? 'font-medium text-yellow-700' : ''
                    }`}
                  >
                    Moderate
                  </span>
                </label>
                <label
                  htmlFor="severity-3"
                  className={`flex flex-col items-center space-y-1 rounded-md border p-3 hover:bg-orange-50 transition-colors cursor-pointer ${
                    formData.severity === 'High' ? 'bg-orange-100 border-orange-400' : ''
                  }`}
                >
                  <RadioGroupItem value="High" id="severity-3" className="sr-only" />
                  <div
                    className={`w-4 h-4 rounded-full ${
                      formData.severity === 'High' ? 'bg-orange-500' : 'bg-orange-200'
                    }`}
                  ></div>
                  <span
                    className={`text-sm ${
                      formData.severity === 'High' ? 'font-medium text-orange-700' : ''
                    }`}
                  >
                    High
                  </span>
                </label>
                <label
                  htmlFor="severity-4"
                  className={`flex flex-col items-center space-y-1 rounded-md border p-3 hover:bg-red-50 transition-colors cursor-pointer ${
                    formData.severity === 'Critical' ? 'bg-red-100 border-red-400' : ''
                  }`}
                >
                  <RadioGroupItem value="Critical" id="severity-4" className="sr-only" />
                  <div
                    className={`w-4 h-4 rounded-full ${
                      formData.severity === 'Critical' ? 'bg-red-500' : 'bg-red-200'
                    }`}
                  ></div>
                  <span
                    className={`text-sm ${
                      formData.severity === 'Critical' ? 'font-medium text-red-700' : ''
                    }`}
                  >
                    Critical
                  </span>
                </label>
              </RadioGroup>
            </div>

            <div>
              <Label htmlFor="details" className="text-sm font-medium">Details of the Emergency</Label>
              <div className="mt-1 relative">
                <Textarea
                  id="details"
                  name="details"
                  value={formData.details}
                  onChange={handleInputChange}
                  rows={5}
                  className="resize-none"
                  required
                  placeholder="Please provide as much detail as possible about the incident..."
                />
                <div className="absolute bottom-2 right-2 text-xs text-gray-400">
                  {formData.details.length} characters
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Include any relevant information such as injuries, damage, witnesses, or immediate actions taken.
              </p>
            </div>

            <DialogFooter className="bottom-0 pt-4 pb-2 bg-white border-t mt-6">
              <div className="flex w-full justify-between items-center gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-red-600 hover:bg-red-700 flex-1"
                  disabled={loading}
                >
                  {loading ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      {selectedReport ? 'Updating...' : 'Submitting...'}
                    </span>
                  ) : (
                    <>
                      {selectedReport ? (
                        <>
                          <Check className="h-4 w-4 mr-2" />
                          Update Report
                        </>
                      ) : (
                        <>
                          <AlertTriangle className="h-4 w-4 mr-2" />
                          Submit Report
                        </>
                      )}
                    </>
                  )}
                </Button>
              </div>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* View Report Modal */}
        <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
          <DialogContent className="sm:max-w-[600px] max-w-[95%] mx-auto max-h-[90vh] overflow-y-auto p-4 rounded-lg">
            <DialogHeader>
              <DialogTitle className="mt-4 text-xl font-semibold">Emergency Report Details</DialogTitle>
            </DialogHeader>
            
            {selectedReport && (
              <div className="space-y-6 py-4">
                <div className="flex flex-row gap-2 mb-6">
                <Badge className={`${getStatusColor(selectedReport.status)} px-3 py-1 text-sm font-medium`}>
                  {selectedReport.status.charAt(0).toUpperCase() + selectedReport.status.slice(1)}
                  {selectedReport.status === 'in-progress' && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-4 w-4 ml-1" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Waiting for both HTE Supervisor and Coordinator approval</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </Badge>
                <Badge className={`${getSeverityColor(selectedReport.severity)} px-3 py-1 text-sm font-medium flex items-center gap-1`}>
                  {getSeverityIcon(selectedReport.severity)}
                  {selectedReport.severity} Severity
                </Badge>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
                  {getSeverityIcon(selectedReport.severity)}
                  {selectedReport.emergencyType}
                </h3>
                <p className="text-gray-600 text-sm mb-4">
                  Reported on {new Date(selectedReport.dateTime).toLocaleString()}
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="flex items-start gap-2">
                    <User className="h-4 w-4 text-gray-500 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Reported by</p>
                      <p className="font-medium">{selectedReport.name}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Building className="h-4 w-4 text-gray-500 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Department</p>
                      <p className="font-medium">{selectedReport.department}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-gray-500 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Location</p>
                      <p className="font-medium">{selectedReport.location}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Clock className="h-4 w-4 text-gray-500 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Date & Time</p>
                      <p className="font-medium">{new Date(selectedReport.created_at).toLocaleString()}</p>
                    </div>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Details</p>
                  <div className="bg-white p-3 rounded border border-gray-100">
                    <p className="whitespace-pre-line">{selectedReport.details}</p>
                  </div>
                </div>
              </div>

              {/* Add approval status */}
              <StatusApprovals report={selectedReport} />

              {/* Add status history */}
              <StatusHistory report={selectedReport} />

              {/* Add approval info message */}
              {selectedReport.status === 'in-progress' && (
                <div className="bg-blue-50 text-blue-700 p-4 rounded-lg text-sm">
                  <div className="flex items-start gap-2">
                    <Info className="h-5 w-5 text-blue-500 mt-0.5" />
                    <div>
                      <p className="font-medium">Approval Process</p>
                      <p className="mt-1">
                        This report requires approval from both your HTE Supervisor and OJT Coordinator
                        to be marked as resolved. Current approvals:
                      </p>
                      <ul className="mt-2 space-y-1">
                        <li className="flex items-center gap-2">
                          {selectedReport.hte_approval ?
                            <Check className="h-4 w-4 text-green-500" /> :
                            <X className="h-4 w-4 text-gray-400" />}
                          HTE Supervisor
                        </li>
                        <li className="flex items-center gap-2">
                          {selectedReport.coordinator_approval ?
                            <Check className="h-4 w-4 text-green-500" /> :
                            <X className="h-4 w-4 text-gray-400" />}
                          OJT Coordinator
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setIsViewModalOpen(false)}
                >
                  Close
                </Button>
                {selectedReport.status !== 'resolved' && (
                  <Button
                    variant="outline"
                    className="border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100"
                    onClick={() => {
                      setIsViewModalOpen(false);
                      handleEdit(selectedReport);
                    }}
                  >
                    <Edit2 className="h-4 w-4 mr-2" />
                    Edit Report
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-red-600">Confirm Deletion</DialogTitle>
          </DialogHeader>

          <div className="py-6">
            <div className="flex items-center justify-center mb-4">
              <div className="bg-red-100 p-3 rounded-full">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
            </div>
            <p className="text-center mb-2">Are you sure you want to delete this emergency report?</p>
            <p className="text-center text-sm text-gray-500">This action cannot be undone.</p>
          </div>

          <DialogFooter className="flex space-x-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setIsDeleteModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              className="bg-red-600 hover:bg-red-700 flex-1"
              onClick={handleDelete}
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Deleting...
                </span>
              ) : (
                'Delete Report'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ToastContainer position="bottom-right" />
    </div>
  );
}

export default StudentReports;