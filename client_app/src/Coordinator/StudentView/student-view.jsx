"use client"

import React, { useState } from "react"
import { Grid, List, Eye, Search, ArrowUpDown, Image as ImageIcon } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { StudentModal } from "./student-modal"
import { Badge } from "@/components/ui/badge"
import { ToastContainer } from 'react-toastify';
import { toast } from "react-toastify";
import axios from "axios";

// Utility function for status badge
const StatusBadge = ({ status, text }) => (
  <Badge className={`${status ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
    {text}
  </Badge>
);

export default function StudentView({
  data,
  fetchFunction,
  viewProgress = true,
  viewCompanies,
  userApplications,
  isTrainee,
  onApplyCompany,
  ...props
}) {

  const students = data;
  const [view, setView] = useState("table")
  const [searchTerm, setSearchTerm] = useState("")
  const [sortColumn, setSortColumn] = useState(null)
  const [sortDirection, setSortDirection] = useState("asc")
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [verifiedFilter, setVerifiedFilter] = useState("all")

  const handleSort = (column) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortColumn(column)
      setSortDirection("asc")
    }
  }

  const filteredStudents = students;

  const sortedStudents = [...filteredStudents];


  console.log({ sortedStudents })
  const handleApprove = async (studentId, hours = 360) => {
    console.log(`Approving student ${studentId} with hours ${hours}`)
    // setIsModalOpen(false)

    try {
      let res = await axios({
        method: 'put',
        url: `user/trainee/${studentId}`,
        data: {
          studentId: studentId,
          is_verified_by_coordinator: true,
          remaining_hours: hours,
          fromApproveButton: true
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

  const handleUpdateHours = async (studentId, hours) => {
    try {
      await axios({
        method: 'put',
        url: `user/trainee/${studentId}`,
        data: {
          studentId: studentId,
          remaining_hours: hours
        }
      });

      // toast.success('Hours updated successfully', {
      //   position: 'top-right',
      //   autoClose: 3000,
      //   hideProgressBar: false,
      //   closeOnClick: true,
      //   pauseOnHover: true,
      //   draggable: true,
      //   progress: undefined,
      //   theme: 'light'
      // });
      fetchFunction();
    } catch (error) {
      toast.error('Failed to update hours', {
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
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">Trainee Applications</h1>
          <p className="text-gray-500">Manage and review trainee applications</p>
        </div>
      </div>

      <div className="flex flex-col space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search trainees..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
              icon={<Search className="h-4 w-4" />}
            />
          </div>
          <div className="w-full sm:w-auto sm:flex-shrink-0">
            <Select value={verifiedFilter} onValueChange={setVerifiedFilter}>
              <SelectTrigger className="w-full">
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

      {viewProgress ? (
        // Show progress view (existing table/grid view)
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
          {sortedStudents.map((student) => (
            <Card key={student.traineeID}>
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
      ) : viewCompanies ? (
        // Show companies view
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.map((company) => (
            <CompanyCard
              key={company.companyID}
              company={company}
              application={userApplications?.find(app => app.company_id === company.companyID)}
              isTrainee={isTrainee}
              onApply={() => onApplyCompany(company)}
            />
          ))}
        </div>
      ) : null}

      <StudentModal
        student={selectedStudent}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onApprove={handleApprove}
        onReject={handleReject}
        onUpdateHours={handleUpdateHours}
      />
      <ToastContainer />
    </div>
  );
}

// Add CompanyCard component
function CompanyCard({ company, application, isTrainee, onApply }) {
  return (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden border border-gray-100">
      {/* Company Header */}
      <div className="relative h-48">
        <img
          src={company.avatar_photo || '/placeholder.png'}
          alt={company.companyName}
          className="w-full h-full object-cover"
        />
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 to-transparent text-white">
          <h3 className="text-lg font-semibold">{company.companyName}</h3>
          <p className="text-sm text-gray-200">{company.expertise}</p>
        </div>
      </div>

      {/* Company Content */}
      <div className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-1">MOA Status</h4>
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${company.moa_status === 'approved'
              ? 'bg-green-100 text-green-800'
              : 'bg-yellow-100 text-yellow-800'
              }`}>
              {company.moa_status === 'approved' ? 'Approved' : 'Pending'}
            </span>
          </div>

          {/* Application Status or Apply Button */}
          {application ? (
            <div className={`px-3 py-1.5 rounded-full text-xs font-medium ${application.is_confirmed
              ? 'bg-green-100 text-green-800'
              : application.status === 'approved'
                ? 'bg-blue-100 text-blue-800'
                : application.status === 'rejected'
                  ? 'bg-red-100 text-red-800'
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
              {application.is_confirmed
                ? 'Joined'
                : application.status === 'approved'
                  ? 'Approved'
                  : application.status === 'rejected'
                    ? 'Rejected'
                    : 'Pending'}
            </div>
          ) : (
            company.moa_status === 'approved' && isTrainee && (
              <ButtonUI
                onClick={onApply}
                className="bg-blue-600 hover:bg-blue-700 text-white"
                size="sm"
              >
                Apply Now
              </ButtonUI>
            )
          )}
        </div>
      </div>
    </div>
  );
}

