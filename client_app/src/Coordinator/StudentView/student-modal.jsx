import { useState } from 'react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Mail, Phone, GraduationCap, BookOpen, Clock, CheckCircle, XCircle, Image as ImageIcon } from "lucide-react";
import { toast } from "react-toastify";
import { SubmittedFiles } from './submitted-files';

export function StudentModal({
  student,
  isOpen,
  onClose,
  onApprove,
  onReject,
  onUpdateHours
}) {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('info');


  const [hours, setHours] = useState(student?.remaining_hours);

  if (!student) return null;

  const InfoItem = ({ icon: Icon, label, value }) => (
    <div className="flex items-start space-x-3">
      <Icon className="h-5 w-5 text-gray-500 mt-2.5" />
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className="font-medium">{value}</p>
      </div>
    </div>
  );

  const StatusBadge = ({ status, text }) => (
    <Badge className={`${status ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
      {text}
    </Badge>
  );

  const handleUpdateHours = async () => {
    setLoading(true);
    try {
      await onUpdateHours(student.traineeID, hours);
      toast.success('Hours updated successfully');
    } catch (error) {
      toast.error('Failed to update hours');
    }
    setLoading(false);
  };


  console.log({ hours })
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto p-4 w-[92%] sm:w-full mx-auto rounded-lg overflow-none">
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

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
          <TabsList className="px-6">
            <TabsTrigger value="info">Info</TabsTrigger>
            <TabsTrigger value="requirements">Proof of Identity</TabsTrigger>
            <TabsTrigger value="submitted-files">Files</TabsTrigger>

          </TabsList>

          <div className="flex-1 overflow-none">
            <TabsContent value="info" className="h-full">
              <Card className="border-0 shadow-none">
                <CardContent className="p-0">
                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="flex-shrink-0">
                      <Avatar className="h-24 w-24">
                        <AvatarImage src={student.proof_identity} alt={student.first_name} />
                        <AvatarFallback>{student.first_name?.charAt(0)}{student.last_name?.charAt(0)}</AvatarFallback>
                      </Avatar>
                    </div>

                    <div className="grid gap-4 w-full text-left">
                      <InfoItem
                        icon={Mail}
                        label="Email"
                        value={student.email}
                      />
                      <InfoItem
                        icon={Phone}
                        label="Phone"
                        value={student.phone}
                      />
                      <InfoItem
                        icon={GraduationCap}
                        label="College"
                        value={student.collegeName}
                      />
                      <InfoItem
                        icon={GraduationCap}
                        label="Program"
                        value={student.progName}
                      />
                      <div className="space-y-2">
                        <label className="text-sm text-gray-500 font-semibold">OJT Hours Required</label>
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            value={hours}
                            onChange={(e) => setHours(e.target.value)}
                            className="w-32"
                            min="0"
                            max="500"
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            className="bg-blue-500 text-white"
                            onClick={handleUpdateHours}
                            disabled={loading}
                          >
                            {loading ? "Updating..." : "Update Hours"}
                          </Button>
                        </div>
                        <p className="text-xs text-blue-500 font-semibold">
                          Current remaining hours: {student.remaining_hours}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="requirements" className="h-full">
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
                      <div className="relative w-full h-[300px] rounded-lg overflow-hidden">
                        <img
                          src={student.proof_identity}
                          alt="Proof of Identity"
                          className="w-full h-full object-contain"
                          onError={(e) => {
                            e.target.src = "/placeholder.png";
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

            <TabsContent value="submitted-files" className="h-full">
              <SubmittedFiles studentId={student.traineeID} />
            </TabsContent>
          </div>
        </Tabs>

        <DialogFooter className="">
          <Button
            variant="destructive"
            onClick={async () => {
              setLoading(true);
              await onReject(student.traineeID);
              setLoading(false);
            }}
            disabled={loading}
            className="mt-2"
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

              console.log({ hours })
              setLoading(true);
              await onApprove(student.traineeID, hours);
              setLoading(false);
            }}
            disabled={loading}
            className="mt-2"
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
