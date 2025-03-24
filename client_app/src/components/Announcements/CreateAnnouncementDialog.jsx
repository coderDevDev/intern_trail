import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon, Loader2 } from "lucide-react"; // Import Loader2 for spinner

function CreateAnnouncementDialog({ open, onOpenChange, onSubmit }) {
  const [date, setDate] = useState(new Date());
  const [isLoading, setIsLoading] = useState(false); // State for loading
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'New',
    image: null
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true); // Show loading state
    
    await onSubmit(formData); // Wait for submission to complete

    setIsLoading(false); // Hide loading state
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: files ? files[0] : value
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px] max-h-[90vh] overflow-y-auto p-4 sm:p-6 w-[92%] sm:w-full mx-auto rounded-lg">
        <DialogHeader className="mt-4">
          <DialogTitle>Create New Announcement</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                placeholder="Enter announcement title"
                name="title"
                onChange={handleChange}
                value={formData.title}
              />
            </div>

            <div className="grid gap-2">
              <Label>Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(date, "PPP")}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Enter announcement details"
                className="min-h-[100px]"
                name="description"
                onChange={handleChange}
                value={formData.description}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="image">Image</Label>
              <Input
                id="image"
                type="file"
                accept="image/*"
                className="cursor-pointer"
                name="image"
                onChange={handleChange}
              />
            </div>
          </div>

          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              className="mt-2" 
              onClick={() => onOpenChange(false)}
              disabled={isLoading} // Disable if loading
            >
              Cancel
            </Button>
            
            <Button 
              type="submit" 
              className="mt-2 flex items-center gap-2"
              disabled={isLoading} // Disable button while loading
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" /> Posting...
                </>
              ) : (
                "Create Announcement"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default CreateAnnouncementDialog;
