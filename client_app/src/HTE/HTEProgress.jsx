import React, { useState, useEffect } from 'react';
import '../index.css'; // Adjust the import path if necessary
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import AssignmentIcon from '@mui/icons-material/TaskAltOutlined';
import ReportIcon from '@mui/icons-material/EventAvailableOutlined';



import axios from 'axios';
import StudentView from "./HTEView/student-view"

function HTEProgress() {
  const [searchTerm, setSearchTerm] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedTrainee, setSelectedTrainee] = useState(null);


  const [trainees, setTrainees] = useState([]);


  const fetchTrainees = async () => {
    try {
      const response = await axios.post('company/trainees/application/list', {
        status: 'Approved'
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

  return (
    <div>


      <h1 className='font-bold mb-4'>Trainees</h1>
      <StudentView
        data={trainees || []}
        fetchFunction={fetchTrainees}
        viewProgress={true}

      />
    </div>
  );
}

export default HTEProgress;
