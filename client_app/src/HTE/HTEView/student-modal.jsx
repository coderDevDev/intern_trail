import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { UserCheck, Mail, Phone, Calendar, Building, Award } from "lucide-react";

export function StudentModal({ student, isOpen, onClose, onApprove, onReject }) {
  const [loading, setLoading] = useState(false);

  if (!student) return null;

  // Format student name
  const studentName = `${student.first_name || ''} ${student.last_name || ''}`;

  // Handle approve action
  const handleApprove = async () => {
    setLoading(true);
    try {
      await onApprove(student);
      onClose();
    } catch (error) {
      console.error('Error approving student:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle reject action
  const handleReject = async () => {
    setLoading(true);
    try {
      await onReject(student, 'Rejected');
      onClose();
    } catch (error) {
      console.error('Error rejecting student:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Student Details</DialogTitle>
        </DialogHeader>

        <div className="py-4">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-shrink-0">
              <div className="h-24 w-24 rounded-full bg-gray-200 flex items-center justify-center">
                {student.proof_identity ? (
                  <img src={student.proof_identity} alt={studentName} className="h-24 w-24 rounded-full object-cover" />
                ) : (
                  <UserCheck className="h-12 w-12 text-gray-400" />
                )}
              </div>
            </div>

            <div className="flex-1 space-y-4">
              <h3 className="text-xl font-bold">{studentName}</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-gray-500" />
                  <span>{student.email}</span>
                </div>

                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-gray-500" />
                  <span>{student.phone || 'N/A'}</span>
                </div>

                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span>Applied: {new Date(student.created_at).toLocaleDateString()}</span>
                </div>

                <div className="flex items-center gap-2">
                  <Building className="h-4 w-4 text-gray-500" />
                  <span>{student.collegeName || 'N/A'}</span>
                </div>
              </div>

              <div className="pt-4 border-t">
                <h4 className="font-medium mb-2">Program Details</h4>
                <div className="flex items-center gap-2">
                  <Award className="h-4 w-4 text-gray-500" />
                  <span>{student.progName || 'N/A'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          {student.status === 'pending' && (
            <>
              <Button
                variant="destructive"
                onClick={handleReject}
                disabled={loading}
              >
                {loading ? 'Processing...' : 'Reject'}
              </Button>
              <Button
                onClick={handleApprove}
                disabled={loading}
              >
                {loading ? 'Processing...' : 'Approve'}
              </Button>
            </>
          )}
          <Button variant="outline" onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
