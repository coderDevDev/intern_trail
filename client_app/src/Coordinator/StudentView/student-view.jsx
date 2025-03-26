"use client";

import React, { useState } from "react";
import { Grid, List, Eye, Search, ArrowUpDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StudentModal } from "./student-modal";
import { Badge } from "@/components/ui/badge";
import { ToastContainer } from "react-toastify";
import { toast } from "react-toastify";
import axios from "axios";

// Utility function for status badge
const StatusBadge = ({ status, text }) => (
  <Badge className={`${status ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}`}>
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
  const [view, setView] = useState("table");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortColumn, setSortColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState("asc");
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [verifiedFilter, setVerifiedFilter] = useState("all");

  // Handle sorting logic
  const handleSort = (column) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  // Filter students based on search term and verification filter
  const filteredStudents = students.filter((student) => {
    const matchesSearch =
      searchTerm === "" ||
      `${student.first_name} ${student.middle_initial || ""} ${student.last_name}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
    const matchesFilter =
      verifiedFilter === "all" ||
      (verifiedFilter === "verified" && student.is_verified) ||
      (verifiedFilter === "unverified" && !student.is_verified);

    return matchesSearch && matchesFilter;
  });

  // Sort students based on selected column and direction
  const sortedStudents = [...filteredStudents].sort((a, b) => {
    if (!sortColumn) return 0;

    const aValue = a[sortColumn];
    const bValue = b[sortColumn];

    if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
    if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
    return 0;
  });

  // Approve student
  const handleApprove = async (studentId, hours = 360) => {
    try {
      await axios.put(`user/trainee/${studentId}`, {
        studentId,
        is_verified_by_coordinator: true,
        remaining_hours: hours,
        fromApproveButton: true,
      });

      toast.success("Student approved successfully!", {
        position: "top-right",
        autoClose: 3000,
      });
      fetchFunction();
      setIsModalOpen(false);
    } catch (error) {
      toast.error("Failed to approve student.", {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };

  // Reject student
  const handleReject = async (studentId) => {
    try {
      await axios.put(`user/trainee/${studentId}`, {
        studentId,
        is_verified_by_coordinator: false,
      });

      toast.success("Student rejected successfully!", {
        position: "top-right",
        autoClose: 3000,
      });
      fetchFunction();
      setIsModalOpen(false);
    } catch (error) {
      toast.error("Failed to reject student.", {
        position: "top-right",
        autoClose: 3000,
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
          {/* Search Bar */}
          <div className="flex-1">
            <Input
              placeholder="Search trainees..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
              icon={<Search className="h-4 w-4" />}
            />
          </div>

          {/* Verification Filter */}
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

      {/* Table/Grid View Toggle */}
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

      {/* Table View */}
      {view === "table" && (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead onClick={() => handleSort("first_name")}>
                Name <ArrowUpDown className="inline h-4 w-4" />
              </TableHead>
              <TableHead>Email</TableHead>
              <TableHead>College</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead> {/* New column for actions */}
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedStudents.map((student) => (
              <TableRow key={student.traineeID}>
                <TableCell>{`${student.first_name} ${student.middle_initial || ""} ${student.last_name}`}</TableCell>
                <TableCell>{student.email}</TableCell>
                <TableCell>{student.collegeName}</TableCell>
                <TableCell>
                  <StatusBadge
                    status={student.is_verified}
                    text={student.is_verified ? "Verified" : "Unverified"}
                  />
                </TableCell>
                <TableCell>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setSelectedStudent(student);
                      setIsModalOpen(true);
                    }}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    View Details
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {/* Grid View */}
      {view === "grid" && (
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
  );
}