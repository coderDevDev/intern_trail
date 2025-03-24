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
  CheckCircle
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast, ToastContainer } from 'react-toastify';
import axios from 'axios';
import 'react-toastify/dist/ReactToastify.css';

function CoordinatorReports() {
  const [reports, setReports] = useState([]);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetchingReports, setFetchingReports] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedReport, setSelectedReport] = useState(null);
  const [newStatus, setNewStatus] = useState("");

  useEffect(() => {
    fetchReports();
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

  const handleStatusChange = async () => {
    if (!selectedReport || !newStatus) return;

    setLoading(true);
    try {
      await axios.put(`/emergency-reports/${selectedReport.id}/status`, {
        status: newStatus,
        updatedBy: 'coordinator'
      });

      // Show appropriate message based on status
      if (newStatus === 'resolved') {
        if (!selectedReport.hte_approval) {
          toast.info('Status updated. Waiting for HTE Supervisor approval to mark as resolved.');
        } else {
          toast.success('Report marked as resolved successfully.');
        }
      } else {
        toast.success('Report status updated successfully');
      }

      setIsStatusModalOpen(false);
      fetchReports();
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update report status');
    } finally {
      setLoading(false);
    }
  };

  const handleView = (report) => {
    setSelectedReport(report);
    setIsViewModalOpen(true);
  };

  const openStatusModal = (report) => {
    setSelectedReport(report);
    setNewStatus(report.status);
    setIsStatusModalOpen(true);
  };

  // Filter reports based on active tab and search term
  const filteredReports = reports.filter(report => {
    if (!report) return false;

    const matchesTab = activeTab === 'all' || report.status === activeTab;
    const matchesSearch = searchTerm === '' || [
      report.name,
      report.department,
      report.location,
      report.emergency_type,
      report.details
    ].some(field => field && typeof field === 'string' && field.toLowerCase().includes(searchTerm.toLowerCase()));

    return matchesTab && matchesSearch;
  });

  // Helper functions for styling
  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'in-progress': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'resolved': return 'bg-green-100 text-green-800 border-green-200';
      case 'dismissed': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'Low': return 'bg-green-100 text-green-800 border-green-200';
      case 'Moderate': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'High': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'Critical': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

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

  // Add status approval indicators in the view modal
  const StatusApprovals = ({ report }) => (
    <div className="mt-4 space-y-2">
      <h4 className="text-sm font-medium text-gray-500">Approval Status</h4>
      <div className="flex gap-4">
        <div className="flex items-center gap-2">
          <Badge className={report.hte_approval ? 'bg-green-100' : 'bg-gray-100'}>
            <Check className={`h-4 w-4 ${report.hte_approval ? 'text-green-600' : 'text-gray-400'}`} />
            <span className="text-sm font-medium text-gray-500">HTE Supervisor</span>
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <Badge className={report.coordinator_approval ? 'bg-green-100' : 'bg-gray-100'}>
            <Check className={`h-4 w-4 ${report.coordinator_approval ? 'text-green-600' : 'text-gray-400'}`} />

            <span className="text-sm font-medium text-gray-500">Coordinator</span>

          </Badge>
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-white rounded-lg  overflow-hidden">
      <div className="">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-semibold">Emergency Reports Management</h1>
            <p className="text-gray-500 mt-1">Review and manage student emergency reports</p>
          </div>
        </div>

        <div className="mt-6 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Input
              placeholder="Search reports..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={activeTab} onValueChange={setActiveTab}>
            <SelectTrigger className="w-[180px]">
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

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="text-left py-3 px-4 font-medium text-gray-600">Type</th>
              <th className="text-left py-3 px-4 font-medium text-gray-600">Reporter</th>
              <th className="text-left py-3 px-4 font-medium text-gray-600">Location</th>
              <th className="text-left py-3 px-4 font-medium text-gray-600">Date & Time</th>
              <th className="text-left py-3 px-4 font-medium text-gray-600">Status</th>
              <th className="text-left py-3 px-4 font-medium text-gray-600">Severity</th>
              <th className="text-right py-3 px-4 font-medium text-gray-600">Actions</th>
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
                  <td className="py-3 px-4">{report.emergency_type}</td>
                  <td className="py-3 px-4">{report.name}</td>
                  <td className="py-3 px-4">{report.location}</td>
                  <td className="py-3 px-4">{formatDate(report.created_at)}</td>
                  <td className="py-3 px-4">
                    <Badge className={`${getStatusColor(report.status)}`}>
                      {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                    </Badge>
                  </td>
                  <td className="py-3 px-4">
                    <Badge className={`${getSeverityColor(report.severity)} flex items-center gap-1 w-fit`}>
                      <AlertTriangle className="h-4 w-4" />
                      {report.severity}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleView(report)}
                        className="hover:bg-gray-100"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openStatusModal(report)}
                        className="hover:bg-blue-50 text-blue-600"
                      >
                        <CheckCircle className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* View Report Modal */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="sm:max-w-[600px] max-w-[95%] mx-auto max-h-[90vh] overflow-y-auto p-4 rounded-lg">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold mt-4">Emergency Report Details</DialogTitle>
          </DialogHeader>

          {selectedReport && (
            <div className="space-y-6 py-4">
              <div className="flex flex-col sm:flex-row gap-2 mb-6">
                <Badge className={`${getStatusColor(selectedReport.status)} px-3 py-1 text-sm font-medium w-fit`}>
                  {selectedReport.status.charAt(0).toUpperCase() + selectedReport.status.slice(1)}
                </Badge>
                <Badge className={`${getSeverityColor(selectedReport.severity)} px-3 py-1 text-sm font-medium flex items-center gap-1 w-fit`}>
                  <AlertTriangle className="h-4 w-4" />
                  {selectedReport.severity} Severity
                </Badge>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                  {selectedReport.emergency_type}
                </h3>
                <p className="text-gray-600 text-sm mb-4">
                  Reported on {formatDate(selectedReport.created_at)}
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
                      <p className="font-medium">{formatDate(selectedReport.created_at)}</p>
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
              <StatusApprovals report={selectedReport} />

              {/* Show status update history */}
              <div className="mt-4">
                <h4 className="text-sm font-medium text-gray-500 mb-2">Status Updates</h4>
                <div className="space-y-2">
                  {selectedReport.status_updated_at && (
                    <div className="flex justify-between text-sm">
                      <span>Updated to {selectedReport.status}</span>
                      <span className="text-gray-500">
                        by {selectedReport.updated_by_role} on {formatDate(selectedReport.status_updated_at)}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setIsViewModalOpen(false)}
                >
                  Close
                </Button>
                <Button
                  variant="outline"
                  className="border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100"
                  onClick={() => {
                    setIsViewModalOpen(false);
                    openStatusModal(selectedReport);
                  }}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Update Status
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Status Update Modal */}
      <Dialog open={isStatusModalOpen} onOpenChange={setIsStatusModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Update Report Status</DialogTitle>
          </DialogHeader>

          <div className="py-4">
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium">Current Status</Label>
                <Badge className={`${getStatusColor(selectedReport?.status)} mt-2`}>
                  {selectedReport?.status.charAt(0).toUpperCase() + selectedReport?.status.slice(1)}
                </Badge>
              </div>

              <div>
                <Label className="text-sm font-medium">New Status</Label>
                <Select value={newStatus} onValueChange={setNewStatus}>
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Select new status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                    <SelectItem value="dismissed">Dismissed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <DialogFooter className="flex space-x-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setIsStatusModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              className="bg-blue-600 hover:bg-blue-700 flex-1"
              onClick={handleStatusChange}
              disabled={loading || !newStatus || newStatus === selectedReport?.status}
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Updating...
                </span>
              ) : (
                'Update Status'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ToastContainer position="bottom-right" />
    </div>
  );
}

export default CoordinatorReports;