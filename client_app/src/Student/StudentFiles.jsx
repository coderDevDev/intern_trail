import React from 'react';
import '../index.css'; // Adjust the import path if necessary
import SearchIcon from '@mui/icons-material/Search';
import UploadIcon from '@mui/icons-material/Upload';
import SortIcon from '@mui/icons-material/Sort';
import FolderOutlinedIcon from '@mui/icons-material/FolderOutlined';


import FileManager from '@/components/FileManager';

function StudentFiles() {
  return (
    <div className="files-page">
      <FileManager />
    </div>
  );
}

export default StudentFiles;