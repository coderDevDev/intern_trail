import React, { useState, useEffect } from 'react';
import '../index.css'; // Adjust the import path if necessary
import MoreVertIcon from '@mui/icons-material/MoreVertOutlined';
import SearchIcon from '@mui/icons-material/Search';
import SortIcon from '@mui/icons-material/Sort';
import TraineeOptions from './HTETraineeOptions'; // Adjust the import path if necessary
import StudentView from "./HTEView/student-view";
import axios from 'axios';
import { AlertCircle } from 'lucide-react'; // Import Lucide React icon
import { toast } from 'react-toastify';

function HTETrainees() {
  const [userScope, setUserScope] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch user's scope based on role
  const fetchUserScope = async () => {
    try {
      const response = await axios.get('college/user-scope');
      if (response.data.success) {
        setUserScope(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching user scope:', error);
      toast.error('Failed to load user scope');
    }
  };

  useEffect(() => {
    fetchUserScope();
  }, []);

  return (
    <div className="p-0">
      {/* {userScope && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-center">
          <AlertCircle className="h-6 w-6 text-blue-600 mr-3" />
          <div>
            <p className="text-sm font-medium text-blue-800">Company ID: {userScope.companyID}</p>
            <p className="text-sm font-medium text-blue-800">Company Name: {userScope.companyName}</p>
          </div>
        </div>
      )} */}

      {/* The StudentView component will now handle all data fetching internally */}
      <StudentView />
    </div>
  );
}

export default HTETrainees;