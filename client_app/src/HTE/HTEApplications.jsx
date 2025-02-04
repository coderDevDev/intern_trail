import React, { useState, useEffect } from 'react';
import '../index.css'; // Adjust the import path if necessary
import MoreVertIcon from '@mui/icons-material/MoreVertOutlined';
import SearchIcon from '@mui/icons-material/Search';
import SortIcon from '@mui/icons-material/Sort';
import TraineeOptions from './HTETraineeOptions'; // Adjust the import path if necessary



import StudentView from "./HTEView/student-view"
import axios from 'axios';

function HTETrainees() {
  const [searchTerm, setSearchTerm] = useState('');
  const [trainees, setTrainees] = useState([]);


  const fetchTrainees = async () => {
    try {
      const response = await axios.post('company/trainees/application/list', {

      });
      let result = response.data.data
      let mappedData = result.map((company) => {

        let name = `${company.first_name} ${company.last_name}`
        return {
          ...company
          // name: name,
          // profilePicture: company.proof_identity,
          // program: 'BSCpE',
          // course: '4th Year',
          // school: 'University A',
          // resumeLink: company.resume_link,
          // status: company.status
        }
      });

      setTrainees(mappedData);


    } catch (error) {
      console.error("Error fetching trainees:", error);
    }
  };


  useEffect(() => {
    fetchTrainees();
  }, []);


  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };


  const handleApprove = (traineeName) => {
    // Placeholder for approve functionality
  };

  const handleReject = (traineeName) => {
    // Placeholder for reject functionality
  };

  return (
    <div>
      <h1 className='font-bold mb-4'>Applications from Trainees</h1>
      <StudentView
        data={trainees || []}
        fetchFunction={fetchTrainees}

      />
    </div >
  );
}

export default HTETrainees;