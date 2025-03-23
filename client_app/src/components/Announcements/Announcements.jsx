import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PlusCircle, Grid, List, Filter } from "lucide-react";
import AnnouncementCard from './AnnouncementCard';
import CreateAnnouncementDialog from './CreateAnnouncementDialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import axios from 'axios';
import { toast } from 'react-toastify';
import ViewAnnouncementDialog from './ViewAnnouncementDialog';
import EditAnnouncementDialog from './EditAnnouncementDialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

function Announcements() {
  const [view, setView] = useState("grid");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [creatorRoleFilter, setCreatorRoleFilter] = useState('all');
  const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
  const isStudent = loggedInUser?.role === 'trainee';

  const fetchAnnouncements = async () => {
    try {
      const response = await axios.get('/announcements/list');
      setAnnouncements(response.data.data);
    } catch (error) {
      toast.error('Failed to fetch announcements');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const handleView = (announcement) => {
    setSelectedAnnouncement(announcement);
    setIsViewModalOpen(true);
  };

  const handleEdit = (announcement) => {
    setSelectedAnnouncement(announcement);
    setIsEditModalOpen(true);
  };

  const handleDelete = (announcement) => {
    setSelectedAnnouncement(announcement);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    try {
      await axios.delete(`/announcements/${selectedAnnouncement.id}`);
      toast.success('Announcement deleted successfully');
      fetchAnnouncements();
      setIsDeleteDialogOpen(false);
    } catch (error) {
      toast.error('Failed to delete announcement');
    }
  };

  const handleUpdate = async (id, data) => {
    try {
      const formData = new FormData();
      Object.keys(data).forEach(key => {
        if (data[key] !== null) {
          formData.append(key, data[key]);
        }
      });

      await axios.put(`/announcements/${id}`, formData);
      toast.success('Announcement updated successfully');
      setIsEditModalOpen(false);
      fetchAnnouncements();
    } catch (error) {
      toast.error('Failed to update announcement');
    }
  };

  const handleCreate = async (data) => {
    try {
      const formData = new FormData();
      Object.keys(data).forEach(key => {
        formData.append(key, data[key]);
      });

      await axios.post('/announcements/create', formData);
      toast.success('Announcement created successfully');
      setIsCreateModalOpen(false);
      fetchAnnouncements();
    } catch (error) {
      toast.error('Failed to create announcement');
    }
  };

  // Filter announcements based on search query and creator role
  const filteredAnnouncements = announcements.filter(announcement =>
    (announcement.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      announcement.description.toLowerCase().includes(searchQuery.toLowerCase())) &&
    (creatorRoleFilter === 'all' || announcement.created_by_role === creatorRoleFilter)
  );

  // Sort announcements
  const sortedAnnouncements = [...filteredAnnouncements].sort((a, b) => {
    if (sortBy === 'newest') return new Date(b.created_at) - new Date(a.created_at);
    if (sortBy === 'oldest') return new Date(a.created_at) - new Date(b.created_at);
    if (sortBy === 'title') return a.title.localeCompare(b.title);
    return 0;
  });

  return (
    <div className="">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold mb-2">Announcements</h1>
        </div>

      </div>

      {/* Search and Filter Section */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-6">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full sm:w-auto">
          <Input
            placeholder="Search announcements..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full sm:w-[300px]"
          />

          <Select
            value={creatorRoleFilter}
            onValueChange={setCreatorRoleFilter}
            className="w-full sm:w-auto"
          >
            <SelectTrigger>
              <SelectValue placeholder="Filter by role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="ojt-coordinator">Coordinator</SelectItem>
              <SelectItem value="hte-supervisor">HTE Supervisor</SelectItem>
              <SelectItem value="dean">Dean</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={sortBy}
            onValueChange={setSortBy}
            className="w-full sm:w-auto"
          >
            <SelectTrigger>
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="oldest">Oldest First</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex border rounded-md ml-auto w-auto">
          <Button
            variant={view === "grid" ? "default" : "ghost"}
            onClick={() => setView("grid")}
            className="px-3"
          >
            <Grid className="h-4 w-4" />
          </Button>
          <Button
            variant={view === "list" ? "default" : "ghost"}
            onClick={() => setView("list")}
            className="px-3"
          >
            <List className="h-4 w-4" />
          </Button>
        </div>

      </div>
      {!isStudent && (
          <Button
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-blue-600 w-full sm:w-auto mb-4"
          >
            <PlusCircle className="h-4 w-4 mr-2" />
            Create Announcement
          </Button>
        )}

      {/* Announcements Grid/List */}
      <div className={`
        grid gap-4 sm:gap-6
        ${view === "grid" ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-2" : "grid-cols-1"}
      `}>
        {loading ? (
          <div className="text-center py-8">Loading...</div>
        ) : sortedAnnouncements.map(announcement => (
          <AnnouncementCard
            key={announcement.id}
            view={view}
            title={announcement.title}
            date={announcement.created_at}
            description={announcement.description}
            status={announcement.status}
            image={announcement.image_url}
            creatorRole={announcement.created_by_role}
            onView={() => handleView(announcement)}
            onEdit={!isStudent ? () => handleEdit(announcement) : undefined}
            onDelete={!isStudent ? () => handleDelete(announcement) : undefined}
            readonly={announcement.readonly}
          />
        ))}
      </div>

      {/* Create Announcement Modal */}
      <CreateAnnouncementDialog
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        onSubmit={handleCreate}
      />

      <ViewAnnouncementDialog
        open={isViewModalOpen}
        onOpenChange={setIsViewModalOpen}
        announcement={selectedAnnouncement}
      />

      <EditAnnouncementDialog
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        announcement={selectedAnnouncement}
        onSubmit={handleUpdate}
      />

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto p-4 sm:p-6 w-[92%] sm:w-full mx-auto rounded-lg">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-center">Are you sure?</AlertDialogTitle>
            <AlertDialogDescription className="text-center">
              This action cannot be undone. This will permanently delete the announcement.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="">
            <AlertDialogCancel className="w-full sm:w-auto">Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete} 
              className="bg-red-600 hover:bg-red-700 w-full sm:w-auto mt-2"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  );
}

export default Announcements; 