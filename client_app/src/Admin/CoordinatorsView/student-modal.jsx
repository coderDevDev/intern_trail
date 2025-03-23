import { useState } from 'react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { FileViewer } from './file-viewer';
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Mail, Phone, GraduationCap, Building, Calendar, CheckCircle, XCircle, Image as ImageIcon } from "lucide-react";

export function StudentModal({
  student,
  isOpen,
  onClose,
  onApprove,
  onReject
}) {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('info');

  if (!student) return null;

  const InfoItem = ({ icon: Icon, label, value }) => (
    <div className="flex items-start space-x-3">
      <Icon className="h-5 w-5 text-gray-500 mt-0.5" />
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className="font-medium">{value}</p>
      </div>
    </div>
  );

  const StatusBadge = ({ status, text }) => (
    <Badge className={`${status ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
      }`}>
      {text}
    </Badge>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto p-4 sm:p-6 w-[92%] sm:w-full mx-4 rounded-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between mt-4">
            <span className="text-xl font-semibold">
              {student.first_name} {student.middle_initial} {student.last_name}
            </span>
            <div className="flex gap-2">
              <StatusBadge
                status={student.is_verified}
                text={student.is_verified ? "Verified" : "Unverified"}
              />
              <StatusBadge
                status={student.is_approved_by_admin}
                text={student.is_approved_by_admin ? "Approved" : "Pending"}
              />
            </div>
          </DialogTitle>
        </DialogHeader>
    
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="info">Information</TabsTrigger>
            <TabsTrigger value="requirements">Proof of Identity</TabsTrigger>
          </TabsList>

          <TabsContent value="info" className="space-y-6 mt-4">
            <Card>
              <CardContent className="space-y-4 pt-4">
                <InfoItem
                  icon={Mail}
                  label="Email Address"
                  value={student.email}
                />
                <InfoItem
                  icon={Phone}
                  label="Phone Number"
                  value={student.phone}
                />
                <InfoItem
                  icon={Building}
                  label="College"
                  value={student.collegeName}
                />
                <InfoItem
                  icon={GraduationCap}
                  label="Program"
                  value={student.progName}
                />
                <InfoItem
                  icon={Calendar}
                  label="Registration Date"
                  value={new Date(student.created_at).toLocaleDateString()}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="requirements" className="mt-4">
            <Card>
              <CardContent className="pt-4">
                {student.proof_identity ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold flex items-center">
                        <ImageIcon className="h-5 w-5 mr-2 text-gray-500" />
                        Proof of Identity
                      </h3>
                    </div>
                    <div className="relative w-full h-[300px] rounded-lg overflow-hidden border">
                      <img
                        src={student.proof_identity}
                        alt="Proof of Identity"
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          e.target.src = "/placeholder.png"; // Fallback image
                          e.target.onerror = null;
                        }}
                      />
                    </div>
                    <div className="flex justify-end">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(student.proof_identity, '_blank')}
                      >
                        View Full Image
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <ImageIcon className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                    <p>No proof of identity uploaded</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <DialogFooter className="gap-2 mt-6">
          <Button
            variant="destructive"
            onClick={async () => {
              setLoading(true);
              await onReject(student.coordinatorID);
              setLoading(false);
            }}
            disabled={loading}
            className="w-full sm:w-auto"
          >
            {loading ? (
              <div className="flex items-center">
                <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                Rejecting...
              </div>
            ) : (
              <>
                <XCircle className="h-4 w-4 mr-2" />
                Reject
              </>
            )}
          </Button>
          <Button
            variant="default"
            onClick={async () => {
              setLoading(true);
              await onApprove(student.coordinatorID);
              setLoading(false);
            }}
            disabled={loading}
            className="w-full sm:w-auto"
          >
            {loading ? (
              <div className="flex items-center">
                <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                Approving...
              </div>
            ) : (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Approve
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
