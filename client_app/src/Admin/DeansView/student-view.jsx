"use client"

import { useState } from "react"
// import Image from "next/image"
import { Grid, List, Eye, Filter, ArrowUpDown } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { StudentModal } from "./student-modal"
import { Badge } from "@/components/ui/badge"
import { Search } from "lucide-react"

import axios from 'axios';

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

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

// Add StatusBadge component
const StatusBadge = ({ status, text }) => (
  <Badge className={`${status ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
    {text}
  </Badge>
);

export default function StudentView({
  data,
  fetchFunction
}) {

  let students = data;


  const [view, setView] = useState("table")
  const [searchTerm, setSearchTerm] = useState("")
  const [sortColumn, setSortColumn] = useState(null)
  const [sortDirection, setSortDirection] = useState("asc")
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [collegeFilter, setCollegeFilter] = useState(null)
  const [programFilter, setProgramFilter] = useState(null)
  const [verifiedFilter, setVerifiedFilter] = useState(null)

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



  }

  const handleApprove = async (deanId) => {
    console.log(`Approving student ${deanId}`)
    // setIsModalOpen(false)

    try {
      let res = await axios({
        method: 'put',
        url: `user/deans/${deanId}`,
        data: {
          deanId: deanId,
          is_approved_by_admin: true
        }
      });

      toast.success('Updated Successfully', {
        position: 'top-right',
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: 'light'
      });
      fetchFunction()
      setIsModalOpen(false)
    } catch (error) {
      toast.error('An error occured', {
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

  }

  const handleReject = async (deanId) => {
    console.log(`Rejecting student ${deanId}`)
    try {
      let res = await axios({
        method: 'put',
        url: `user/deans/${deanId}`,
        data: {
          deanId: deanId,
          is_approved_by_admin: false
        }
      });

      toast.success('Updated Successfully', {
        position: 'top-right',
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: 'light'
      });
      fetchFunction()
      setIsModalOpen(false)
    } catch (error) {
      toast.error('An error occured', {
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
  }

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
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">Dean Applications</h1>
          <p className="text-gray-500">Manage and review dean applications</p>
        </div>
      </div>

      <div className="flex flex-col space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search deans..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
              icon={<Search className="h-4 w-4" />}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <Select value={verifiedFilter} onValueChange={setVerifiedFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Verification Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="verified">Verified</SelectItem>
                <SelectItem value="unverified">Unverified</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
        
        <div className="flex flex-row sm:flex-row items-center gap-3 w-full sm:w-auto">
          <Button
            variant={view === "table" ? "default" : "outline"}
            size="sm"
            className="w-full sm:w-auto"
            onClick={() => setView("table")}
          >
            <List className="h-4 w-4 mr-1" />
            Table
          </Button>
          <Button
            variant={view === "grid" ? "default" : "outline"}
            size="sm"
            className="w-full sm:w-auto"
            onClick={() => setView("grid")}
          >
            <Grid className="h-4 w-4 mr-1" />
            Grid
          </Button>
        </div>

      {view === "table" ? (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead
                  className="cursor-pointer"
                  onClick={() => handleSort("first_name")}
                >
                  <div className="flex items-center gap-2">
                    Name
                    <ArrowUpDown className="h-4 w-4" />
                  </div>
                </TableHead>
                <TableHead
                  className="cursor-pointer"
                  onClick={() => handleSort("email")}
                >
                  <div className="flex items-center gap-2">
                    Email
                    <ArrowUpDown className="h-4 w-4" />
                  </div>
                </TableHead>
                <TableHead
                  className="cursor-pointer"
                  onClick={() => handleSort("collegeName")}
                >
                  <div className="flex items-center gap-2">
                    College
                    <ArrowUpDown className="h-4 w-4" />
                  </div>
                </TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedStudents.map((student) => (
                <TableRow key={student.deanID}>
                  <TableCell className="font-medium">
                    {`${student.first_name} ${student.middle_initial || ""} ${student.last_name}`}
                  </TableCell>
                  <TableCell>{student.email}</TableCell>
                  <TableCell>{student.collegeName}</TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <StatusBadge
                        status={student.is_verified}
                        text={student.is_verified ? "Verified" : "Unverified"}
                      />
                      <StatusBadge
                        status={student.is_approved_by_admin}
                        text={student.is_approved_by_admin ? "Approved" : "Pending"}
                      />
                    </div>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedStudent(student);
                        setIsModalOpen(true);
                      }}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedStudents.map((student) => (
            <Card key={student.deanID} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-4">
                <CardTitle className="flex justify-between items-start">
                  <div>
                    {`${student.first_name} ${student.middle_initial || ""} ${student.last_name}`}
                  </div>
                  <div className="space-y-1">
                    <StatusBadge
                      status={student.is_verified}
                      text={student.is_verified ? "Verified" : "Unverified"}
                    />
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium">{student.email}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-500">College</p>
                    <p className="font-medium">{student.collegeName}</p>
                  </div>
                  <Button
                    className="w-full"
                    onClick={() => {
                      setSelectedStudent(student);
                      setIsModalOpen(true);
                    }}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <StudentModal
        student={selectedStudent}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onApprove={handleApprove}
        onReject={handleReject}
      />
      <ToastContainer />
    </div>
  )
}

