"use client"

import React, { useState, useEffect } from "react"
// import Image from "next/image"
import { Grid, List, Eye, Filter, TrophyIcon, MoreHorizontal, Users, Search, CheckCircle2, XCircle, FileText, Award, Download, UserCheck, Clock, ChevronDown } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { StudentModal } from "./student-modal"
import StatusBadge from '@/components/StatusBadge'
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import EvaluationForm from "@/components/EvaluationForm/EvaluationForm";
import CertificateUpload from "@/components/CertificateUpload/CertificateUpload";
import { Label } from "@/components/ui/label";
import { Link } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ClipboardList, UserCog, ChartLine } from "lucide-react";

import { Dialog, DialogContent } from '@radix-ui/react-dialog';

// const students = [
//   {
//     traineeID: 3,
//     userID: 633,
//     collegeID: 1,
//     programID: 3,
//     companyID: null,
//     student_id: "dextermiranda441@gmail.co",
//     deployment_date: null,
//     remaining_hours: "360.00",
//     is_verified_by_coordinator: 0,
//     email: "dextermiranda441@gmail.com",
//     first_name: "DEXTER",
//     middle_initial: null,
//     last_name: "MIRANDA",
//     phone: "09275478620",
//     is_verified: 1,
//     is_approved: 0,
//     proof_identity:
//       "https://firebasestorage.googleapis.com/v0/b/avdeasis-4b5c7.appspot.com/o/intern_trail%2Fusers%2F633%2Fproof_of_identity%2Fcool_16876150.png?alt=media&token=1018e09f-05ff-466f-9109-de50f0a962dc",
//     role: "trainee",
//     last_login_at: null,
//     created_at: "2025-01-14T10:52:39.000Z",
//     updated_at: "2025-01-14T10:53:50.000Z",
//     collegeName: "CECT",
//     collegeCode: "cect",
//     progName: "IT",
//     progCode: "it",
//     requirements: [
//       {
//         label: "Proof of Identity",
//         url: "https://firebasestorage.googleapis.com/v0/b/avdeasis-4b5c7.appspot.com/o/intern_trail%2Fusers%2F633%2Fproof_of_identity%2Fcool_16876150.png?alt=media&token=1018e09f-05ff-466f-9109-de50f0a962dc",
//       },
//       {
//         label: "Resume",
//         url: "https://example.com/resume.pdf",
//       },
//     ],
//   },
// ]

export default function StudentView({
  data,
  fetchFunction,
  viewProgress,
  isCoordinator = false
}) {


  const navigate = useNavigate();

  const [students, setStudents] = useState([]);
  const [view, setView] = useState("table")
  const [searchTerm, setSearchTerm] = useState("")
  const [sortColumn, setSortColumn] = useState(null)
  const [sortDirection, setSortDirection] = useState("asc")
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [collegeFilter, setCollegeFilter] = useState(null)
  const [programFilter, setProgramFilter] = useState(null)
  const [verifiedFilter, setVerifiedFilter] = useState(null)
  const [activeTab, setActiveTab] = useState(isCoordinator ? 'progress' : 'applications');
  const [isEvaluationFormOpen, setIsEvaluationFormOpen] = useState(false);
  const [evaluationData, setEvaluationData] = useState(null);
  const [isCertificateModalOpen, setIsCertificateModalOpen] = useState(false);

  const [applications, setApplications] = useState([]);
  const [activeTrainees, setActiveTrainees] = useState([]);
  const [progressReports, setProgressReports] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [openMenuId, setOpenMenuId] = useState(null);

  const handleSort = (column) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortColumn(column)
      setSortDirection("asc")
    }
  }

  const filteredStudents = students.filter(
    (student) =>
      Object.values(student).some(
        (value) => value && value.toString().toLowerCase().includes(searchTerm.toLowerCase()),
      ) &&
      (!collegeFilter || student.collegeName === collegeFilter) &&
      (!programFilter || student.progName === programFilter) &&
      (verifiedFilter === null || student.is_verified === (verifiedFilter === "true")),
  )

  const sortedStudents = [...filteredStudents].sort((a, b) => {
    if (sortColumn) {
      if (a[sortColumn] < b[sortColumn]) return sortDirection === "asc" ? -1 : 1
      if (a[sortColumn] > b[sortColumn]) return sortDirection === "asc" ? 1 : -1
    }
    return 0
  })

  const handleViewInfo = (student) => {
    setSelectedStudent(student)
    setIsModalOpen(true)
  }

  const handleApprove = async (studentData, status = 'Approved') => {
    let companyId = studentData.company_id;
    let studentId = studentData.trainee_user_id;

    try {
      let res = await axios({
        method: 'put',
        url: `company/trainee/application/${studentId}`,
        data: {
          companyId,
          studentId,
          status
        }
      });

      if (res.data.success) {
        toast.success(`Student ${status} successfully`);
        setIsModalOpen(false);
        fetchFunction();
      } else {
        toast.error(res.data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error('An error occurred while processing your request');
    }
  }

  const handleEvaluationForm = async (student) => {
    setSelectedStudent(student);

    try {
      // Try to fetch existing evaluation data
      const response = await axios.get(`/evaluations/${student.userID}`);
      if (response.data.success && response.data.data) {
        setEvaluationData(response.data.data);
      } else {
        setEvaluationData(null);
      }
    } catch (error) {
      console.error("Error fetching evaluation data:", error);
      setEvaluationData(null);
    }

    setIsEvaluationFormOpen(true);
  };

  const handleUploadCertificate = (student) => {
    setSelectedStudent(student);
    setIsCertificateModalOpen(true);
  };

  const handleCloseModal = () => {
    // First set the modal to closed
    setIsModalOpen(false);

    // Then use a timeout to clear the selected student after the modal animation completes
    setSelectedStudent(null);
  };

  const handleViewDocuments = (student) => {
    // Implement document viewing functionality
    console.log("View documents for:", student);
  };

  const handleDownloadReport = (student) => {
    // Implement report download functionality
    console.log("Download report for:", student);
  };

  const uniqueColleges = Array.from(new Set(students.map((s) => s.collegeName)))
  const uniquePrograms = Array.from(new Set(students.map((s) => s.progName)))

  const FilterPopover = ({
    options,
    value,
    onChange,
    placeholder,
  }) => (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <Filter className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Select value={value || ""} onValueChange={(value) => onChange(value || null)}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            {options.map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </PopoverContent>
    </Popover>
  )

  const fetchAllData = async () => {
    setIsLoading(true);
    try {
      // Fetch data for the active tab
      if (activeTab === "applications") {
        await fetchApplications();
      } else if (activeTab === "trainees") {
        await fetchActiveTrainees();
      } else if (activeTab === "progress") {
        await fetchProgressReports();
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load data");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchApplications = async () => {
    try {
      const response = await axios.post("/company/trainees/applications/all");
      if (response.data.success) {
        setApplications(response.data.data);
        setStudents(response.data.data); // Update the main students array for compatibility
      }
    } catch (error) {
      console.error("Error fetching applications:", error);
      toast.error("Failed to load applications");
    }
  };

  const fetchActiveTrainees = async () => {
    try {
      const response = await axios.post("/company/trainees/active");
      if (response.data.success) {
        setActiveTrainees(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching active trainees:", error);
      toast.error("Failed to load active trainees");
    }
  };

  const fetchProgressReports = async () => {
    try {
      const response = await axios.post("/company/trainees/progress");
      if (response.data.success) {
        setProgressReports(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching progress reports:", error);
      toast.error("Failed to load progress reports");
    }
  };

  useEffect(() => {
    fetchAllData();
  }, [activeTab]);

  useEffect(() => {
    if (data && data.length > 0) {
      setStudents(data);
      setApplications(data);
    } else {
      fetchAllData();
    }
  }, [data]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header with icon */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-full">
            <Users className="h-6 w-6 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Trainee Management</h1>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search students..."
              className="pl-9 w-64"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button variant="outline" className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filter
          </Button>
        </div>
      </div>

      {/* Tabs for different sections */}
      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full mb-6">
        <TabsList className="grid grid-cols-3 mb-4">


          {

            isCoordinator ? <TabsTrigger value="progress" className="flex items-center gap-2">
              <ChartLine className="h-4 w-4" />
              <span>Progress Reports {progressReports.length > 0 && `(${progressReports.length})`}</span>
            </TabsTrigger> : <>
              <TabsTrigger value="applications" className="flex items-center gap-2">
                <ClipboardList className="h-4 w-4" />
                <span>Applications {applications.filter(app => app.status === 'pending').length > 0 && `(${applications.filter(app => app.status === 'pending').length})`}</span>
              </TabsTrigger>
              <TabsTrigger value="trainees" className="flex items-center gap-2">
                <UserCog className="h-4 w-4" />
                <span>Active Trainees {activeTrainees.length > 0 && `(${activeTrainees.length})`}</span>
              </TabsTrigger>
              <TabsTrigger value="progress" className="flex items-center gap-2">
                <ChartLine className="h-4 w-4" />
                <span>Progress Reports {progressReports.length > 0 && `(${progressReports.length})`}</span>
              </TabsTrigger>
            </>
          }



        </TabsList>

        {/* Applications Tab Content */}
        <TabsContent value="applications" className="space-y-6">
          {/* Status summary cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="p-3 bg-blue-50 rounded-full">
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Applications</p>
                  <p className="text-2xl font-bold">
                    {applications.filter(app => app.status === 'pending').length}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="p-3 bg-green-50 rounded-full">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Approved</p>
                  <p className="text-2xl font-bold">

                    {
                      console.log({ applications })
                    }
                    {applications.filter(app => app.status === 'approved').length}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="p-3 bg-yellow-50 rounded-full">
                  <Clock className="h-5 w-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Pending</p>
                  <p className="text-2xl font-bold">
                    {applications.filter(app => app.status === 'pending').length}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="p-3 bg-red-50 rounded-full">
                  <XCircle className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Rejected</p>
                  <p className="text-2xl font-bold">
                    {applications.filter(app => app.status === 'rejected').length}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Student table */}
          <Card className="overflow-hidden">
            <CardHeader className="bg-gray-50 py-4">
              <CardTitle className="text-lg font-medium">Student List</CardTitle>
            </CardHeader>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[250px]">Student</TableHead>

                    <TableHead>College</TableHead>
                    <TableHead>Program</TableHead>

                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {applications
                    .filter(app => app.status === 'pending')
                    .filter(student =>
                      `${student.first_name} ${student.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      student.email.toLowerCase().includes(searchTerm.toLowerCase())
                    )
                    .map((student) => (
                      <TableRow key={student.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                              {student.avatar ? (
                                <img src={student.avatar} alt={`${student.first_name} ${student.last_name}`} className="h-10 w-10 rounded-full object-cover" />
                              ) : (
                                <UserCheck className="h-5 w-5 text-gray-500" />
                              )}
                            </div>
                            <div>
                              <p className="font-medium">{`${student.first_name} ${student.middle_initial || ""} ${student.last_name}`}</p>
                              <p className="text-xs text-gray-500">{student.email}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{student.collegeName}</TableCell>
                        <TableCell>{student.programName}</TableCell>

                        <TableCell>
                          <StatusBadge isActive={student.status === 'approved'} />
                        </TableCell>
                        <TableCell className="text-right">
                          <Popover open={openMenuId === student.traineeID} onOpenChange={(open) => setOpenMenuId(open ? student.traineeID : null)}>
                            <PopoverTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="flex items-center gap-1"
                                aria-label="Actions menu"
                              >
                                Actions
                                <ChevronDown className="h-4 w-4" />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent
                              className="w-48 p-2"
                              align="end"
                              onInteractOutside={() => setOpenMenuId(null)}
                            >
                              <div className="flex flex-col gap-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="w-full justify-start"
                                  onClick={() => {
                                    handleViewInfo(student);
                                    setOpenMenuId(null);
                                  }}
                                >
                                  <Eye className="h-4 w-4 mr-2" />
                                  View Details
                                </Button>

                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="w-full justify-start"
                                  onClick={() => {
                                    window.open(
                                      `/HTE/student-progress/${student.trainee_user_id}`,
                                      "_blank",
                                      "noopener,noreferrer"
                                    );
                                    setOpenMenuId(null);
                                  }}
                                >
                                  <Eye className="h-4 w-4 mr-2" />
                                  Progress Report
                                </Button>

                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="w-full justify-start"
                                  onClick={() => {
                                    handleEvaluationForm(student);
                                    setOpenMenuId(null);
                                  }}
                                >
                                  <FileText className="h-4 w-4 mr-2" />
                                  View Evaluation
                                </Button>

                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="w-full justify-start"
                                  onClick={() => {
                                    handleUploadCertificate(student);
                                    setOpenMenuId(null);
                                  }}
                                >
                                  <Download className="h-4 w-4 mr-2" />
                                  View Certificate
                                </Button>
                              </div>
                            </PopoverContent>
                          </Popover>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </div>
          </Card>
        </TabsContent>

        {/* Active Trainees Tab Content */}
        <TabsContent value="trainees" className="space-y-6">
          <Card className="overflow-hidden">
            <CardHeader className="bg-gray-50 py-4">
              <CardTitle className="text-lg font-medium">Active Trainees</CardTitle>
            </CardHeader>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[250px]">Trainee</TableHead>
                    <TableHead>College</TableHead>
                    <TableHead>Program</TableHead>
                    <TableHead>Start Date</TableHead>
                    <TableHead>Hours Completed</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {activeTrainees
                    .filter(student =>
                      `${student.first_name} ${student.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      student.email.toLowerCase().includes(searchTerm.toLowerCase())
                    )
                    .map((student) => (
                      <TableRow key={student.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                              {student.avatar ? (
                                <img src={student.avatar} alt={`${student.first_name} ${student.last_name}`} className="h-10 w-10 rounded-full object-cover" />
                              ) : (
                                <UserCheck className="h-5 w-5 text-gray-500" />
                              )}
                            </div>
                            <div>
                              <p className="font-medium">{`${student.first_name} ${student.middle_initial || ""} ${student.last_name}`}</p>
                              <p className="text-xs text-gray-500">{student.email}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{student.collegeName}</TableCell>
                        <TableCell>{student.programName}</TableCell>
                        <TableCell>{student.deployment_date ? new Date(student.deployment_date).toLocaleDateString() : 'Not started'}</TableCell>
                        <TableCell>{student.hours_completed || '0'} / {student.remaining_hours || '360'}</TableCell>
                        <TableCell className="text-right">
                          <Popover open={openMenuId === student.traineeID} onOpenChange={(open) => setOpenMenuId(open ? student.traineeID : null)}>
                            <PopoverTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="flex items-center gap-1"
                                aria-label="Actions menu"
                              >
                                Actions
                                <ChevronDown className="h-4 w-4" />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent
                              className="w-48 p-2"
                              align="end"
                              onInteractOutside={() => setOpenMenuId(null)}
                            >
                              <div className="flex flex-col gap-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="w-full justify-start"
                                  onClick={() => {
                                    handleViewInfo(student);
                                    setOpenMenuId(null);
                                  }}
                                >
                                  <Eye className="h-4 w-4 mr-2" />
                                  View Details
                                </Button>

                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="w-full justify-start"
                                  onClick={() => {
                                    window.open(
                                      `/HTE/student-progress/${student.trainee_user_id}`,
                                      "_blank",
                                      "noopener,noreferrer"
                                    );
                                    setOpenMenuId(null);
                                  }}
                                >
                                  <Eye className="h-4 w-4 mr-2" />
                                  Progress Report
                                </Button>

                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="w-full justify-start"
                                  onClick={() => {
                                    handleEvaluationForm(student);
                                    setOpenMenuId(null);
                                  }}
                                >
                                  <FileText className="h-4 w-4 mr-2" />
                                  View Evaluation
                                </Button>

                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="w-full justify-start"
                                  onClick={() => {
                                    handleUploadCertificate(student);
                                    setOpenMenuId(null);
                                  }}
                                >
                                  <Download className="h-4 w-4 mr-2" />
                                  View Certificate
                                </Button>
                              </div>
                            </PopoverContent>
                          </Popover>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </div>
          </Card>
        </TabsContent>

        {/* Progress Reports Tab Content */}
        <TabsContent value="progress" className="space-y-6">
          <Card className="overflow-hidden">
            <CardHeader className="bg-gray-50 py-4">
              <CardTitle className="text-lg font-medium">Progress Reports</CardTitle>
            </CardHeader>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[250px]">Trainee</TableHead>
                    <TableHead>Progress</TableHead>
                    <TableHead>Last Update</TableHead>
                    <TableHead>Remaining Hours</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {progressReports
                    .filter(student =>
                      `${student.first_name} ${student.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      student.email.toLowerCase().includes(searchTerm.toLowerCase())
                    )
                    .map((student) => (
                      <TableRow key={student.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                              {student.avatar ? (
                                <img src={student.avatar} alt={`${student.first_name} ${student.last_name}`} className="h-10 w-10 rounded-full object-cover" />
                              ) : (
                                <UserCheck className="h-5 w-5 text-gray-500" />
                              )}
                            </div>
                            <div>
                              <p className="font-medium">{`${student.first_name} ${student.middle_initial || ""} ${student.last_name}`}</p>
                              <p className="text-xs text-gray-500">{student.email}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div
                              className="bg-blue-600 h-2.5 rounded-full"
                              style={{ width: `${Math.min(100, (parseInt(student.hours_completed || 0) / parseInt(student.remaining_hours || 360)) * 100)}%` }}
                            ></div>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            {Math.min(100, Math.round((parseInt(student.hours_completed || 0) / parseInt(student.remaining_hours || 360)) * 100))}% Complete
                          </p>
                        </TableCell>
                        <TableCell>{student.last_update ? new Date(student.last_update).toLocaleDateString() : 'No updates'}</TableCell>
                        <TableCell>{student.remaining_hours || '360'} hours</TableCell>
                        <TableCell className="text-right">
                          <Popover open={openMenuId === student.traineeID} onOpenChange={(open) => setOpenMenuId(open ? student.traineeID : null)}>
                            <PopoverTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="flex items-center gap-1"
                                aria-label="Actions menu"
                              >
                                Actions
                                <ChevronDown className="h-4 w-4" />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent
                              className="w-48 p-2"
                              align="end"
                              onInteractOutside={() => setOpenMenuId(null)}
                            >
                              <div className="flex flex-col gap-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="w-full justify-start"
                                  onClick={() => {


                                    if (isCoordinator) {
                                      window.open(
                                        `/coordinator/student-progress/${student.trainee_user_id}`,
                                        "_blank",
                                        "noopener,noreferrer"
                                      );
                                    } else {
                                      window.open(
                                        `/HTE/student-progress/${student.trainee_user_id}`,
                                        "_blank",
                                        "noopener,noreferrer"
                                      );
                                      setOpenMenuId(null);
                                    }
                                    setOpenMenuId(null);
                                  }}
                                >
                                  <ChartLine className="h-4 w-4 mr-2" />
                                  View Progress
                                </Button>
                              </div>
                            </PopoverContent>
                          </Popover>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Student Modal */}
      {selectedStudent && (
        <StudentModal
          student={selectedStudent}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onApprove={handleApprove}
          onReject={handleApprove}
        />
      )}

      {selectedStudent && (
        <EvaluationForm
          isOpen={isEvaluationFormOpen}
          onClose={() => setIsEvaluationFormOpen(false)}
          student={selectedStudent}
          existingData={evaluationData}
        />
      )}

      {selectedStudent && (
        <CertificateUpload
          isOpen={isCertificateModalOpen}
          onClose={() => setIsCertificateModalOpen(false)}
          student={selectedStudent}
        />
      )}

      <ToastContainer />
    </div>
  )
}

