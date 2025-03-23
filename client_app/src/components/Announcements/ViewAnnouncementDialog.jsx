import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";

function ViewAnnouncementDialog({ open, onOpenChange, announcement }) {
  if (!announcement) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto p-4 sm:p-6 w-[92%] sm:w-full mx-auto rounded-lg">
        <DialogHeader className="text-left mt-4">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-left">{announcement.title}</DialogTitle>

            <Badge variant={
              announcement.status === "New" ? "default" :
                announcement.status === "Urgent" ? "destructive" :
                  "secondary"
            }>
              {announcement.status}
            </Badge>
          </div>
          
          <p className="text-sm text-gray-500">
            Posted on {format(new Date(announcement.created_at), 'PPP')}
          </p>
        </DialogHeader>

        {announcement.image_url && (
          <div className="w-full h-64 relative overflow-hidden rounded-md">
            <img
              src={announcement.image_url}
              alt={announcement.title}
              className="object-cover w-full h-full"
            />
          </div>
        )}

        <div className="mt-4">
          <p className="text-gray-700 whitespace-pre-wrap">
            {announcement.description}
          </p>
        </div>

        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>Close</Button>
        </DialogFooter>

      </DialogContent>
    </Dialog>
  );
}

export default ViewAnnouncementDialog; 