import { useState } from "react"
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




const initialFiles = [
  // { id: "1", name: "Documents", type: "folder", modified: "2023-04-01" },
  // { id: "2", name: "Images", type: "folder", modified: "2023-04-02" },
  { id: "3", name: "report.pdf", type: "file", size: "2.5 MB", modified: "2023-04-03" },
  { id: "4", name: "presentation.pptx", type: "file", size: "5.1 MB", modified: "2023-04-04" },
]

export default function Home() {
  const [files, setFiles] = useState(initialFiles)
  const [currentFolder, setCurrentFolder] = useState(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [viewMode, setViewMode] = useState("table")
  const [approveModalOpen, setApproveModalOpen] = useState(false)
  const [fileToApprove, setFileToApprove] = useState(null)
  const [uploadModalOpen, setUploadModalOpen] = useState(false)
  const [selectedFile, setSelectedFile] = useState(null)
  const [selectedTag, setSelectedTag] = useState("")

  const handleFileSelect = (event) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      setUploadModalOpen(true)
    }
  }

  const handleFileUpload = async () => {
    if (selectedFile) {
      // const newFile = {
      //   id: Date.now().toString(),
      //   name: selectedFile.name,
      //   type: "file",
      //   size: `${(selectedFile.size / 1024 / 1024).toFixed(2)} MB`,
      //   modified: new Date().toISOString().split("T")[0],
      //   tag: selectedTag,
      // }


      const formData = new FormData();

      formData.append('file', selectedFile);
      formData.append('tag', selectedTag);



      let res = await axios({
        method: 'POST',
        url: 'files/create',
        data: formData
      });


      console.log({ selectedFile })
      // setFiles([...files, newFile])
      // setUploadModalOpen(false)
      // setSelectedFile(null)
      // setSelectedTag("")
    }
  }

  const createNewFolder = () => {
    const folderName = prompt("Enter folder name:")
    if (folderName) {
      const newFolder = {
        id: Date.now().toString(),
        name: folderName,
        type: "folder",
        modified: new Date().toISOString().split("T")[0],
      }
      setFiles([...files, newFolder])
    }
  }

  const navigateToFolder = (folderId) => {
    setCurrentFolder(folderId)
  }

  const navigateUp = () => {
    setCurrentFolder(null)
  }

  const deleteFile = (fileId) => {
    setFiles(files.filter((file) => file.id !== fileId))
  }

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

  const currentFiles = currentFolder ? files.filter((file) => file.id === currentFolder) : files
  const filteredFiles = currentFiles.filter((file) => file.name.toLowerCase().includes(searchQuery.toLowerCase()))

  const renderFileActions = (file) => (
    <div className="flex space-x-2">
      {file.type === "file" && (
        <>
          <Button variant="ghost" size="icon" onClick={() => console.log(`Downloading ${file.name}`)}>
            <Download className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => deleteFile(file.id)}>
            <Trash2 className="h-4 w-4" />
          </Button>
          {/* {!file.approved && (
            <Button variant="ghost" size="icon" onClick={() => openApproveModal(file)}>
              <Check className="h-4 w-4" />
            </Button>
          )} */}
        </>
      )}
    </div>
  )

  return (
    <div className="">
      <h1 className="text-2xl font-bold mb-4">Files</h1>
      <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4 mb-4">
        <div className="flex space-x-2">
          <Button onClick={() => document.getElementById("fileInput")?.click()}>
            <Upload className="mr-2 h-4 w-4" /> Select File
          </Button>
          <Input id="fileInput" type="file" className="hidden" onChange={handleFileSelect} />
          {/* <Button onClick={createNewFolder}>
            <FolderPlus className="mr-2 h-4 w-4" /> New Folder
          </Button> */}
          {currentFolder && <Button onClick={navigateUp}>Up</Button>}
        </div>
        <div className="flex-1 flex space-x-2">
          <div className="relative flex-1">
            <Search className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="search"
              placeholder="Search files..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <ToggleGroup type="single" value={viewMode} onValueChange={(value) => setViewMode(value)}>
            <ToggleGroupItem value="table" aria-label="Table view">
              <List className="h-4 w-4" />
            </ToggleGroupItem>
            <ToggleGroupItem value="grid" aria-label="Grid view">
              <Grid className="h-4 w-4" />
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
      </div>
      {viewMode === "table" ? (
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Size</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Modified
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tag</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
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
                  <td className="px-6 py-4 whitespace-nowrap">{renderFileActions(file)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
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
      <Dialog open={approveModalOpen} onOpenChange={setApproveModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve File</DialogTitle>
            <DialogDescription>Are you sure you want to approve "{fileToApprove?.name}"?</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setApproveModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={approveFile}>Approve</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={uploadModalOpen} onOpenChange={setUploadModalOpen}>
        <DialogContent>
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
                  {/* <SelectItem value="personal">Personal</SelectItem>
                  <SelectItem value="important">Important</SelectItem>
                  <SelectItem value="archive">Archive</SelectItem> */}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setUploadModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleFileUpload}>
              <Upload className="mr-2 h-4 w-4" /> Upload
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

