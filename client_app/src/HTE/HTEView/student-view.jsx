"use client"

import React, { useState, useEffect } from "react"
// import Image from "next/image"
import { Grid, List, Eye, Filter, TrophyIcon, MoreHorizontal } from "lucide-react"
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
import { FileText, Award } from "lucide-react";

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
  viewProgress
}) {

  let students = data;
  const navigate = useNavigate();

  const [view, setView] = useState("table")
  const [searchTerm, setSearchTerm] = useState("")
  const [sortColumn, setSortColumn] = useState(null)
  const [sortDirection, setSortDirection] = useState("asc")
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [collegeFilter, setCollegeFilter] = useState(null)
  const [programFilter, setProgramFilter] = useState(null)
  const [verifiedFilter, setVerifiedFilter] = useState(null)
  const [activeTab, setActiveTab] = useState('info');
  const [isEvaluationFormOpen, setIsEvaluationFormOpen] = useState(false);
  const [evaluationData, setEvaluationData] = useState(null);
  const [isCertificateModalOpen, setIsCertificateModalOpen] = useState(false);

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
    setIsModalOpen(true)
    setSelectedStudent(student)
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
    // Ensure body is interactive before closing modal
    document.body.style.pointerEvents = '';
    document.body.removeAttribute('aria-hidden');
    setIsModalOpen(false);
    setSelectedStudent(null);
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

  return (
    <div className="relative">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
        <div className="flex items-center space-x-2">
          <Input
            placeholder="Search students..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full md:w-64"
          />
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <div className="grid gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium leading-none">Filters</h4>
                  <p className="text-sm text-muted-foreground">
                    Filter students by college, program, and verification status.
                  </p>
                </div>
                <div className="grid gap-2">
                  <div className="grid grid-cols-3 items-center gap-4">
                    <Label htmlFor="college">College</Label>
                    <Select
                      value={collegeFilter || ""}
                      onValueChange={(value) => setCollegeFilter(value || null)}
                    >
                      <SelectTrigger className="col-span-2">
                        <SelectValue placeholder="All Colleges" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All Colleges</SelectItem>
                        {Array.from(new Set(students.map((s) => s.collegeName))).map((college) => (
                          <SelectItem key={college} value={college}>
                            {college}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-3 items-center gap-4">
                    <Label htmlFor="program">Program</Label>
                    <Select
                      value={programFilter || ""}
                      onValueChange={(value) => setProgramFilter(value || null)}
                    >
                      <SelectTrigger className="col-span-2">
                        <SelectValue placeholder="All Programs" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All Programs</SelectItem>
                        {Array.from(new Set(students.map((s) => s.progName))).map((program) => (
                          <SelectItem key={program} value={program}>
                            {program}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-3 items-center gap-4">
                    <Label htmlFor="verified">Verified</Label>
                    <Select
                      value={verifiedFilter || ""}
                      onValueChange={(value) => setVerifiedFilter(value || null)}
                    >
                      <SelectTrigger className="col-span-2">
                        <SelectValue placeholder="All Students" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All Students</SelectItem>
                        <SelectItem value="true">Verified</SelectItem>
                        <SelectItem value="false">Not Verified</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant={view === "table" ? "default" : "outline"}
            size="icon"
            onClick={() => setView("table")}
          >
            <List className="h-4 w-4" />
          </Button>
          <Button
            variant={view === "grid" ? "default" : "outline"}
            size="icon"
            onClick={() => setView("grid")}
          >
            <Grid className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {view === "table" ? (
        <Table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-lg">
          <TableHeader>
            <TableRow className="text-sm font-medium text-gray-700 bg-gray-100">
              <TableHead
                onClick={() => handleSort("traineeID")}
                className="cursor-pointer px-4 py-2 text-left hover:bg-blue-50"
              >
                Profile Picture
              </TableHead>
              <TableHead
                onClick={() => handleSort("first_name")}
                className="cursor-pointer px-4 py-2 text-left hover:bg-blue-50"
              >
                Name
              </TableHead>
              <TableHead
                onClick={() => handleSort("email")}
                className="cursor-pointer px-4 py-2 text-left hover:bg-blue-50"
              >
                Email
              </TableHead>
              <TableHead
                onClick={() => handleSort("collegeName")}
                className="cursor-pointer px-4 py-2 text-left hover:bg-blue-50"
              >
                College
                <FilterPopover
                  options={uniqueColleges}
                  value={collegeFilter}
                  onChange={setCollegeFilter}
                  placeholder="Filter by College"
                />
              </TableHead>
              <TableHead
                onClick={() => handleSort("progName")}
                className="cursor-pointer px-4 py-2 text-left hover:bg-blue-50"
              >
                Program
                <FilterPopover
                  options={uniquePrograms}
                  value={programFilter}
                  onChange={setProgramFilter}
                  placeholder="Filter by Program"
                />
              </TableHead>
              <TableHead
                onClick={() => handleSort("remaining_hours")}
                className="cursor-pointer px-4 py-2 text-left hover:bg-blue-50"
              >
                Remaining Hours
              </TableHead>
              <TableHead
                onClick={() => handleSort("is_verified")}
                className="cursor-pointer px-4 py-2 text-left hover:bg-blue-50"
              >
                Verified
                <FilterPopover
                  options={["true", "false"]}
                  value={verifiedFilter}
                  onChange={setVerifiedFilter}
                  placeholder="Filter by Verification"
                />
              </TableHead>
              <TableHead
                onClick={() => handleSort("is_verified")}
                className="cursor-pointer px-4 py-2 text-left hover:bg-blue-50"
              >
                Approved
                <FilterPopover
                  options={["true", "false"]}
                  value={verifiedFilter}
                  onChange={setVerifiedFilter}
                  placeholder="Filter by Verification"
                />
              </TableHead>
              <TableHead className="px-4 py-2 text-left">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedStudents.map((student) => (
              <TableRow
                key={student.traineeID}
                className="text-sm text-gray-700 border-b hover:bg-gray-50"
              >
                <TableCell className="px-4 py-2">
                  <img src={student.proof_identity || "../anyrgb.com.png"} alt="Profile" className="profile-picture" />
                </TableCell>
                <TableCell className="px-4 py-2">{`${student.first_name} ${student.middle_initial || ""} ${student.last_name}`}</TableCell>
                <TableCell className="px-4 py-2">{student.email}</TableCell>
                <TableCell className="px-4 py-2">{student.collegeName}</TableCell>
                <TableCell className="px-4 py-2">{student.progName}</TableCell>
                <TableCell className="px-4 py-2">{student.remaining_hours}</TableCell>
                <TableCell className="px-4 py-2">
                  <StatusBadge isActive={student.is_verified} />
                </TableCell>
                <TableCell className="px-4 py-2">
                  <StatusBadge isActive={student.status === 'Approved'} />
                </TableCell>
                <TableCell className="px-4 py-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem onClick={() => handleViewInfo(student)}>
                        <Eye className="h-4 w-4 mr-2" />
                        View Info
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleEvaluationForm(student)}>
                        <FileText className="h-4 w-4 mr-2" />
                        Evaluation Form
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleUploadCertificate(student)}>
                        <Award className="h-4 w-4 mr-2" />
                        Certificate Management
                      </DropdownMenuItem>
                      {viewProgress && (
                        <DropdownMenuItem onClick={() => navigate(`/HTE/student-progress/${student.trainee_user_id}`)}>
                          <TrophyIcon className="h-4 w-4 mr-2" />
                          Progress Report
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedStudents.map((student) => (
            <Card key={student.traineeID}>
              <CardHeader>
                <CardTitle>{`${student.first_name} ${student.middle_initial || ""} ${student.last_name}`}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative mb-4">
                  <img
                    src={student.proof_identity || "/placeholder.svg"}
                    alt={`${student.first_name} ${student.last_name}`}
                    fill
                    className="object-cover rounded-md h-20"
                  />
                </div>
                <p>
                  <strong>Email:</strong> {student.email}
                </p>
                <p>
                  <strong>College:</strong> {student.collegeName}
                </p>
                <p>
                  <strong>Program:</strong> {student.progName}
                </p>
                <div className="flex flex-col space-y-2 mt-4">
                  <Button variant="outline" onClick={() => handleViewInfo(student)}>
                    <Eye className="h-4 w-4 mr-2" /> View Info
                  </Button>
                  <Button variant="outline" onClick={() => handleEvaluationForm(student)}>
                    <FileText className="h-4 w-4 mr-2" /> Evaluation Form
                  </Button>
                  <Button variant="outline" onClick={() => handleUploadCertificate(student)}>
                    <Award className="h-4 w-4 mr-2" /> Certificate Management
                  </Button>
                  {viewProgress && (
                    <Button
                      variant="outline"
                      className="bg-yellow-500 text-white hover:bg-yellow-600"
                      onClick={() => navigate(`/HTE/student-progress/${student.trainee_user_id}`)}
                    >
                      <TrophyIcon className="h-4 w-4 mr-2" /> Progress Report
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <StudentModal
        student={selectedStudent}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onApprove={handleApprove}
        onReject={handleApprove}
      />

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

