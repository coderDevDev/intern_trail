import { useState } from 'react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { FileViewer } from './file-viewer';

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

  console.log({ student })

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {student.first_name} {student.last_name}
          </DialogTitle>
        </DialogHeader>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="info">Info</TabsTrigger>
            <TabsTrigger value="requirements">Requirements</TabsTrigger>
          </TabsList>
          <TabsContent value="info">
            <div className="grid gap-4 py-4">
              <div>Email: {student.email}</div>
              <div>Phone: {student.phone}</div>
              <div>College: {student.collegeName}</div>
              <div>Program: {student.progName}</div>

              <div>Verified: {student.is_verified ? 'Yes' : 'No'}</div>
              <div>Verified: {student.is_approved ? 'Yes' : 'No'}</div>
            </div>
          </TabsContent>
          <TabsContent value="requirements">
            <div className="grid gap-4 py-4"></div>
          </TabsContent>
        </Tabs>
        <DialogFooter>
          <button
            className={`bg-red-600 text-white px-4 py-2 rounded disabled:opacity-50`}
            onClick={async () => {
              setLoading(true);
              await onReject(student.deanID);
              setLoading(false);
            }}
            disabled={loading}
          >
            {loading ? (
              <div className="animate-spin border-t-2 border-white w-4 h-4 border-solid rounded-full"></div>
            ) : (
              "Reject"
            )}
          </button>
          <button
            className={`bg-green-600 text-white px-4 py-2 rounded disabled:opacity-50`}

            onClick={async () => {
              setLoading(true);
              await onApprove(student.deanID);
              setLoading(false);
            }}

            disabled={loading}
          >
            {loading ? (
              <div className="animate-spin border-t-2 border-white w-4 h-4 border-solid rounded-full"></div>
            ) : (
              "Approve"
            )}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
