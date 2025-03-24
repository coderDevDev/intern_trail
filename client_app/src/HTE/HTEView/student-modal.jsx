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


import { SubmittedFiles } from './../../Coordinator/StudentView/submitted-files';
export function StudentModal({ student, isOpen, onClose, onApprove, onReject }) {
  const [loading, setLoading] = useState(false);


  console.log({ student })

  if (!student) return null;

  const studentName = `${student.first_name || ""} ${student.last_name || ""}`;

  const handleAction = async (action) => {
    setLoading(true);
    try {
      if (action === "approve") {
        await onApprove(student);
      } else {
        await onReject(student, "Rejected");
      }
      onClose(); // Ensure modal closes after action completes
    } catch (error) {
      console.error(`Error ${action}ing student:`, error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px] max-w-[95%] mx-auto max-h-[90vh] overflow-y-auto p-4 rounded-lg">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Student Details</DialogTitle>
        </DialogHeader>

        <div className="py-2">
          <div className="grid grid-cols-1 gap-4 mb-6">
            <div className="flex-shrink-0 flex justify-center">
              <div className="h-24 w-24 rounded-full bg-gray-200 flex items-center justify-center">
                {student.proof_identity ? (
                  <img
                    src={student.proof_identity}
                    alt={studentName}
                    className="h-24 w-24 rounded-full object-cover"
                  />
                ) : (
                  <UserCheck className="h-12 w-12 text-gray-400" />
                )}
              </div>
            </div>

            <div className="flex-1 space-y-4">
              <h3 className="text-xl font-semibold text-center">{studentName}</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-gray-500" />
                  <span>{student.email}</span>
                </div>

                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-gray-500" />
                  <span>{student.phone || "N/A"}</span>
                </div>

                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span>Applied: {new Date(student.created_at).toLocaleDateString()}</span>
                </div>

                <div className="flex items-center gap-2">
                  <Building className="h-4 w-4 text-gray-500" />
                  <span>{student.collegeName || "N/A"}</span>
                </div>
              </div>
              {/* <div className="pt-4 border-t">
                <h4 className="font-medium mb-2">Program Details</h4>
                <div className="flex items-center gap-2">
                  <Award className="h-4 w-4 text-gray-500" />
                  <span>{student.progName || "N/A"}</span>
                </div>
              </div> */}


            </div>
          </div>

          <div className="pt-4 border-t">

            <SubmittedFiles studentId={student.traineeID}
              userID={student.userID}
            />
          </div>

        </div>

        <DialogFooter>
          {student.status === "pending" && (
            <>
              <Button variant="destructive" onClick={() => handleAction("reject")} disabled={loading}>
                {loading ? "Processing..." : "Reject"}
              </Button>
              <Button onClick={() => handleAction("approve")} disabled={loading}>
                {loading ? "Processing..." : "Approve"}
              </Button>
            </>
          )}
          <Button variant="outline" onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}