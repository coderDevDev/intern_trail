"use client"

import { useState } from "react"
// import Image from "next/image"
import { Grid, List, Eye, Filter } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { StudentModal } from "./student-modal"

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
    setIsModalOpen(true)
    setSelectedStudent(student)



  }

  const handleApprove = async (studentId) => {
    console.log(`Approving student ${studentId}`)
    // setIsModalOpen(false)

    try {
      let res = await axios({
        method: 'put',
        url: `user/trainee/${studentId}`,
        data: {
          studentId: studentId,
          is_verified_by_coordinator: true
        }
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

  const handleReject = async (studentId) => {
    console.log(`Rejecting student ${studentId}`)
    try {
      let res = await axios({
        method: 'put',
        url: `user/trainee/${studentId}`,
        data: {
          studentId: studentId,
          is_verified_by_coordinator: false
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
    <div className="">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
        <Input
          type="text"
          placeholder="Search students..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
        <div className="flex flex-wrap gap-2">
          <Button variant={view === "table" ? "default" : "outline"} onClick={() => setView("table")}>
            <List className="mr-2 h-4 w-4" /> Table
          </Button>
          <Button variant={view === "grid" ? "default" : "outline"} onClick={() => setView("grid")}>
            <Grid className="mr-2 h-4 w-4" /> Grid
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
                Trainee ID
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
                <TableCell className="px-4 py-2">{student.traineeID}</TableCell>
                <TableCell className="px-4 py-2">{`${student.first_name} ${student.middle_initial || ""} ${student.last_name}`}</TableCell>
                <TableCell className="px-4 py-2">{student.email}</TableCell>
                <TableCell className="px-4 py-2">{student.collegeName}</TableCell>
                <TableCell className="px-4 py-2">{student.progName}</TableCell>
                <TableCell className="px-4 py-2">{student.remaining_hours}</TableCell>
                <TableCell className="px-4 py-2">{student.is_verified ? "Yes" : "No"}</TableCell>
                <TableCell className="px-4 py-2">{student.is_verified_by_coordinator ? "Yes" : "No"}</TableCell>
                <TableCell className="px-4 py-2">
                  <Button

                    color="blue"
                    size="sm"
                    onClick={() => {


                      console.log({ student })
                      setIsModalOpen(true)
                      handleViewInfo(student)
                    }}
                    className="flex items-center space-x-2"
                  >
                    <Eye className="h-4 w-4" />
                    <span>View Info</span>
                  </Button>
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
                <Button variant="outline" className="mt-4 w-full" onClick={() => handleViewInfo(student)}>
                  <Eye className="h-4 w-4 mr-2" /> View Info
                </Button>
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

