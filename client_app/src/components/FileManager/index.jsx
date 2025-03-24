import React, { useState, useEffect } from "react"
import { Folder, File, Upload, FolderPlus, Search, Grid, List, Download, Trash2, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import axios from 'axios';
import { toast } from 'react-toastify';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

const initialFiles = [
  // { id: "1", name: "Documents", type: "folder", modified: "2023-04-01" },
  // { id: "2", name: "Images", type: "folder", modified: "2023-04-02" },
  { id: "3", name: "report.pdf", type: "file", size: "2.5 MB", modified: "2023-04-03" },
  { id: "4", name: "presentation.pptx", type: "file", size: "5.1 MB", modified: "2023-04-04" },
]

export default function FileManager({
  readOnly = false,
  studentId = null,
  companyId = null,
  filterTag = null
}) {
  const [files, setFiles] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentFolder, setCurrentFolder] = useState(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [viewMode, setViewMode] = useState("table")
  const [approveModalOpen, setApproveModalOpen] = useState(false)
  const [fileToApprove, setFileToApprove] = useState(null)
  const [uploadModalOpen, setUploadModalOpen] = useState(false)
  const [selectedFile, setSelectedFile] = useState(null)
  const [selectedTag, setSelectedTag] = useState("")
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [createFolderDialogOpen, setCreateFolderDialogOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [folderPath, setFolderPath] = useState([]);

  // Fetch files and folders
  const fetchItems = async () => {
    try {
      const response = await axios.get('/files/list', {
        params: {
          folder_id: currentFolder,
          student_id: studentId,
          company_id: companyId,
          tag: filterTag,
          view_mode: readOnly ? 'student-files' : 'normal'
        }
      });
      setFiles(response.data.data.map(item => ({
        id: item.id,
        name: item.name,
        type: item.item_type,
        size: item.size ? `${(item.size / 1024 / 1024).toFixed(2)} MB` : null,
        modified: new Date(item.created_at).toISOString().split('T')[0],
        tag: item.tag,
        url: item.file_url,
        folder_id: item.folder_id,
        uploaded_by: item.uploaded_by,
        uploaded_by_role: item.uploaded_by_role,
        first_name: item.first_name,
        last_name: item.last_name
      })));
    } catch (error) {
      console.error(error);
      toast.error('Failed to fetch items');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [currentFolder]);

  const handleFileSelect = (event) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      setUploadModalOpen(true)
    }
  }

  // Handle file upload
  const handleFileUpload = async () => {
    if (selectedFile && selectedTag) {
      try {
        const formData = new FormData();
        formData.append('file', selectedFile);
        formData.append('tag', selectedTag);
        if (currentFolder) {
          formData.append('folder_id', currentFolder);
        }

        await axios.post('/files/upload', formData);
        toast.success('File uploaded successfully');
        setUploadModalOpen(false);
        setSelectedFile(null);
        setSelectedTag('');
        fetchItems();
      } catch (error) {
        console.error(error);
        toast.error('Failed to upload file');
      }
    }
  };

  const createNewFolder = async () => {
    try {
      const response = await axios.post('/files/folder', {
        name: newFolderName,
        parent_id: currentFolder
      });
      toast.success('Folder created successfully');
      setCreateFolderDialogOpen(false);
      setNewFolderName('');
      fetchItems();
    } catch (error) {
      toast.error('Failed to create folder');
    }
  };

  const navigateToFolder = (folderId) => {
    setCurrentFolder(folderId);
    setSearchQuery('');
  };

  const navigateUp = () => {
    setCurrentFolder(null)
  }

  const handleDelete = async () => {
    if (!itemToDelete) return;

    try {
      const endpoint = itemToDelete.type === 'folder' ? 'folder' : 'files';
      await axios.delete(`/${endpoint}/${itemToDelete.id}`);
      toast.success(`${itemToDelete.type === 'folder' ? 'Folder' : 'File'} deleted successfully`);
      fetchItems();
    } catch (error) {
      toast.error('Failed to delete item');
    } finally {
      setDeleteDialogOpen(false);
      setItemToDelete(null);
    }
  };

  const openApproveModal = (file) => {
    setFileToApprove(file)
    setApproveModalOpen(true)
  }

  const approveFile = () => {
    if (fileToApprove) {
      setFiles(files.map((file) => (file.id === fileToApprove.id ? { ...file, approved: true } : file)))
      setApproveModalOpen(false)
      setFileToApprove(null)
    }
  }

  const currentFiles = files.filter((file) => {
    if (currentFolder === null) {
      return file.folder_id === null;
    }
    return file.folder_id === currentFolder;
  });

  const filteredFiles = currentFiles.filter((file) => file.name.toLowerCase().includes(searchQuery.toLowerCase()))

  // Handle file download
  const downloadFile = (file) => {
    window.open(file.url, '_blank');
  };

  // Update renderFileActions
  const renderFileActions = (file) => (
    <div className="flex space-x-2">
      {file.type === 'file' && (
        <Button variant="ghost" size="icon" onClick={() => downloadFile(file)}>
          <Download className="h-4 w-4" />
        </Button>
      )}
      {!readOnly && (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => {
            setItemToDelete(file);
            setDeleteDialogOpen(true);
          }}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      )}
    </div>
  );

  const updateFolderPath = async (folderId) => {
    if (!folderId) {
      setFolderPath([]);
      return;
    }

    try {
      const response = await axios.get(`/files/folder/${folderId}`);
      const folder = response.data.data;

      if (folder.parent_id) {
        await updateFolderPath(folder.parent_id);
      }
      setFolderPath(prev => [...prev, folder]);
    } catch (error) {
      console.error('Failed to update folder path:', error);
    }
  };

  useEffect(() => {
    updateFolderPath(currentFolder);
  }, [currentFolder]);

  return (
    <div className="w-full h-full flex flex-col">
      <h1 className="text-2xl font-semibold mb-4">Files</h1>
      <div className="flex items-center space-x-2 mb-4 flex-shrink-0 border rounded-lg">
        <Button
          variant="ghost"
          onClick={() => {
            setCurrentFolder(null);
            setFolderPath([]);
          }}
        >
          <Folder className="mr-2 h-5 w-5 text-blue-500" /> Root
        </Button>
        {folderPath.map((folder, index) => (
          <React.Fragment key={folder.id}>
            <span>/</span>
            <Button
              variant="ghost"
              onClick={() => navigateToFolder(folder.id)}
            >
              {folder.name}
            </Button>
          </React.Fragment>
        ))}
      </div>

      {!readOnly && (
        <div className="flex flex-col space-y-4 mb-4 flex-shrink-0 w-full">
          {/* Search and View Toggle Row */}
          <div className="flex flex-wrap items-center w-full gap-3">
            <div className="relative flex-1 min-w-0 max-w-full sm:max-w-[600px]">
              <Input
                type="search"
                placeholder="Search files..."
                className="pl-9 w-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <ToggleGroup 
              type="single" 
              value={viewMode} 
              onValueChange={(value) => setViewMode(value)} 
              className="flex-shrink-0"
            >
              <ToggleGroupItem value="table" aria-label="Table view">
                <List className="h-4 w-4" />
              </ToggleGroupItem>
              <ToggleGroupItem value="grid" aria-label="Grid view">
                <Grid className="h-4 w-4" />
              </ToggleGroupItem>
            </ToggleGroup>
          </div>

          {/* Upload & New Folder Buttons */}
          <div className="flex flex-wrap gap-3 w-full">
            <Button 
              className="w-full sm:w-auto sm:max-w-[200px] flex-1 whitespace-nowrap" 
              onClick={() => document.getElementById('fileInput').click()}
            >
              <Upload className="mr-2 h-4 w-4" /> Upload File
            </Button>
            <Input id="fileInput" type="file" className="hidden" onChange={handleFileSelect} />
            <Button 
              className="w-full sm:w-auto sm:max-w-[200px] flex-1 whitespace-nowrap"
              onClick={() => setCreateFolderDialogOpen(true)}
            >
              <FolderPlus className="mr-2 h-4 w-4" /> New Folder
            </Button>
          </div>
        </div>
      )}


      <div className="flex-1 overflow-auto min-h-0">
        {viewMode === "table" ? (
          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Size</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Modified</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tag</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Uploaded By</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredFiles.map((file) => (
                    <tr key={file.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {file.type === "folder" ? (
                            <Folder className="mr-2 h-5 w-5 text-blue-500" />
                          ) : (
                            <File className="mr-2 h-5 w-5 text-gray-500" />
                          )}
                          {file.type === "folder" ? (
                            <button
                              onClick={() => navigateToFolder(file.id)}
                              className="text-sm font-medium text-gray-900 hover:text-blue-500"
                            >
                              {file.name}
                            </button>
                          ) : (
                            <span className="text-sm font-medium text-gray-900">{file.name}</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-500">{file.type}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-500">{file.size || "-"}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{file.modified}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{file.tag || "-"}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {`${file.first_name} ${file.last_name}`}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">{renderFileActions(file)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 p-4">
            {filteredFiles.map((file) => (
              <div key={file.id} className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow">
                <div className="flex flex-col items-center">
                  {file.type === "folder" ? (
                    <Folder className="h-12 w-12 text-blue-500 mb-2" />
                  ) : (
                    <File className="h-12 w-12 text-gray-500 mb-2" />
                  )}
                  {file.type === "folder" ? (
                    <button
                      onClick={() => navigateToFolder(file.id)}
                      className="text-sm font-medium text-center text-gray-900 hover:text-blue-500"
                    >
                      {file.name}
                    </button>
                  ) : (
                    <span className="text-sm font-medium text-center text-gray-900">{file.name}</span>
                  )}
                  <span className="text-xs text-gray-500 mt-1">{file.size || "-"}</span>
                  <span className="text-xs text-gray-500">{file.modified}</span>
                  {file.tag && (
                    <span className="text-xs bg-blue-100 text-blue-800 rounded-full px-2 py-1 mt-1">{file.tag}</span>
                  )}
                  <div className="mt-2">{renderFileActions(file)}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <Dialog open={approveModalOpen} onOpenChange={setApproveModalOpen}>
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto p-4 sm:p-6 w-[92%] sm:w-full mx-auto rounded-lg">
          <DialogHeader>
            <DialogTitle>Approve File</DialogTitle>
            <DialogDescription>Are you sure you want to approve "{fileToApprove?.name}"?</DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setApproveModalOpen(false)} className="w-full sm:w-auto mt-2">
              Cancel
            </Button>
            <Button onClick={approveFile} className="w-full sm:w-auto mt-2">Approve</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={uploadModalOpen} onOpenChange={setUploadModalOpen}>
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto p-4 sm:p-6 w-[92%] sm:w-full mx-auto rounded-lg">
          <DialogHeader>
            <DialogTitle>Upload File</DialogTitle>
            <DialogDescription>Select a tag for the file before uploading.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="filename" className="text-right">
                File
              </Label>
              <Input id="filename" value={selectedFile?.name || ""} className="col-span-3" readOnly />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="tag" className="text-right">
                Tag
              </Label>
              <Select onValueChange={setSelectedTag} value={selectedTag}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select a tag" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MOA">MOA</SelectItem>
                  <SelectItem value="Parental_Consent">Parental Consent</SelectItem>
                  <SelectItem value="requirement">Requirement</SelectItem>
                  <SelectItem value="accomplishment">Accomplishment</SelectItem>
                  <SelectItem value="personal">Personal</SelectItem>
                  <SelectItem value="important">Important</SelectItem>
                  <SelectItem value="archive">Archive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setUploadModalOpen(false)} className="w-full sm:w-auto mt-2">
              Cancel
            </Button>
            <Button onClick={handleFileUpload} className="w-full sm:w-auto mt-2">
              <Upload className="mr-2 h-4 w-4" /> Upload
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto p-4 sm:p-6 w-[92%] sm:w-full mx-auto rounded-lg">
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the {itemToDelete?.type} "{itemToDelete?.name}".
              {itemToDelete?.type === 'folder' && " All files inside this folder will also be deleted."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-4">
            <AlertDialogCancel className="w-full sm:w-auto">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700 w-full sm:w-auto mt-2">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={createFolderDialogOpen} onOpenChange={setCreateFolderDialogOpen}>
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto p-4 sm:p-6 w-[92%] sm:w-full mx-auto rounded-lg">
          <DialogHeader>
            <DialogTitle>Create New Folder</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="folderName" className="text-right">
                Name
              </Label>
              <Input
                id="folderName"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setCreateFolderDialogOpen(false)} className="w-full sm:w-auto mt-2">
              Cancel
            </Button>
            <Button onClick={createNewFolder} className="w-full sm:w-auto mt-2">Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

