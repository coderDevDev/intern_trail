import { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { FileIcon, Grid2X2, List, Download, Eye, AlertCircle, FolderOpen } from "lucide-react";
import axios from 'axios';
import { format } from 'date-fns';
import { Alert, AlertDescription } from "@/components/ui/alert";

export function SubmittedFiles({ studentId, userID }) {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'

  useEffect(() => {
    fetchFiles();
  }, [studentId]);

  const fetchFiles = async () => {
    try {
      console.log({ fetchFiles: studentId })
      const response = await axios.get(`/trainee/submitted-files/of/${userID}`);
      setFiles(response.data.data);
    } catch (error) {
      console.error('Error fetching files:', error);
    } finally {
      setLoading(false);
    }
  };

  const getFileIcon = (fileName) => {
    const extension = fileName.split('.').pop().toLowerCase();
    switch (extension) {
      case 'pdf':
        return 'pdf';
      case 'doc':
      case 'docx':
        return 'word';
      case 'jpg':
      case 'jpeg':
      case 'png':
        return 'image';
      default:
        return 'file';
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-8 w-20" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-40 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (!loading && files.length === 0) {
    return (
      <Alert className="bg-blue-50 border-blue-200">
        <FolderOpen className="h-5 w-5 text-blue-500" />
        <AlertDescription className="text-blue-700">
          No requirements have been submitted yet.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4 flex flex-col h-[400px] md:h-[600px]">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Submitted Requirements</h3>
        <div className="flex gap-2">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('grid')}
          >
            <Grid2X2 className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('list')}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="overflow-y-auto flex-1">
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {files.map((file) => (
              <Card key={file.id} className="p-4 hover:shadow-lg transition-shadow">
                <div className="flex flex-col items-center text-center">
                  <FileIcon className="h-12 w-12 text-blue-500 mb-2" />
                  <p className="text-sm font-medium truncate w-full">{file.requirement_id}</p>
                  <p className="text-xs text-gray-500">
                    {format(new Date(file.uploaded_at), 'MMM d, yyyy')}
                  </p>
                  <div className="flex gap-2 mt-2">
                    <Button size="sm" variant="outline" asChild>
                      <a href={file.file_url} target="_blank" rel="noopener noreferrer">
                        <Eye className="h-4 w-4" />
                      </a>
                    </Button>
                    <Button size="sm" variant="outline" asChild>
                      <a href={file.file_url} download>
                        <Download className="h-4 w-4" />
                      </a>
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {files.map((file) => (
              <Card key={file.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <FileIcon className="h-8 w-8 text-blue-500" />
                    <div>
                      <p className="font-medium">{file.file_name}</p>
                      <p className="text-sm text-gray-500">
                        {format(new Date(file.uploaded_at), 'MMM d, yyyy')}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" asChild>
                      <a href={file.file_url} target="_blank" rel="noopener noreferrer">
                        <Eye className="h-4 w-4" />
                      </a>
                    </Button>
                    <Button size="sm" variant="outline" asChild>
                      <a href={file.file_url} download>
                        <Download className="h-4 w-4" />
                      </a>
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}