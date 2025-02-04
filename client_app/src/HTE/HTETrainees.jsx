import React, { useState, useEffect } from 'react';
import '../index.css'; // Adjust the import path if necessary
import MoreVertOutlinedIcon from '@mui/icons-material/MoreVertOutlined';
import SearchIcon from '@mui/icons-material/Search';
import SortIcon from '@mui/icons-material/Sort';
import AddIcon from '@mui/icons-material/AddCircleOutlineOutlined';
import HTETraineeOptions from './HTETraineeOptions'; // Adjust the import path if necessary
import {
  IconButton,
  Menu,
  MenuItem,
} from '@mui/material';


import axios from 'axios';
import StudentView from "./HTEView/student-view"
function HTETrainees() {
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

  // const trainees = [
  //   {
  //     name: 'Juan Dela Cruz',
  //     profilePicture: '../anyrgb.com.png',
  //     school: 'WU-P',
  //     department: 'MISD Division Trainee',
  //   },
  //   {
  //     name: 'Maria Clara',
  //     profilePicture: '../anyrgb.com.png',
  //     school: 'WU-P',
  //     department: 'Accounting Office Trainee',
  //   },
  //   {
  //     name: 'Jose Rizal',
  //     profilePicture: '../anyrgb.com.png',
  //     school: 'WU-P',
  //     department: 'Human Resource Office Trainee',
  //   },
  //   {
  //     name: 'Andres Bonifacio',
  //     profilePicture: '../anyrgb.com.png',
  //     school: 'WU-P',
  //     department: 'Marketing Division Team',
  //   },
  // ];

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const filteredTrainees = trainees.filter((trainee) =>
    (trainee.name || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleMenuOpen = (event, trainee) => {
    setAnchorEl(event.currentTarget);
    setSelectedTrainee(trainee);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedTrainee(null);
  };

  return (
    <div>


      <h1 className='font-bold mb-4'>Trainees</h1>
      <StudentView
        data={trainees || []}
        fetchFunction={fetchTrainees}

      />



      {/* <div className="trainees-button-container" style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
        <div className="trainees-search-bar" style={{ display: 'flex', alignItems: 'center', marginRight: '10px' }}>
          <SearchIcon style={{ color: 'gray', marginRight: '5px' }} />
          <input
            type="text"
            placeholder="Search Trainees..."
            value={searchTerm}
            onChange={handleSearchChange}
            style={{ padding: '5px', borderRadius: '4px' }}
          />
        </div>
        <IconButton style={{ color: 'gray', marginLeft: '10px' }}>
          <AddIcon />
        </IconButton>
        <IconButton style={{ color: 'gray', marginLeft: '10px' }}>
          <SortIcon />
        </IconButton>
      </div>
      <div className="trainees-container">
        <table className="emergency-reports-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ padding: '8px' }}>Name</th>
              <th style={{ padding: '8px' }}>Department</th>
              <th style={{ padding: '8px' }}>School</th>
              <th style={{ padding: '8px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredTrainees.map((trainee, index) => (
              <tr key={index} style={{ borderBottom: '1px solid #ddd' }}>
                <td style={{ padding: '8px' }}>
                  <img
                    src={trainee.profilePicture}
                    alt={`${trainee.name}'s profile`}
                    className="trainees-profile-picture"
                    style={{ marginRight: '10px', verticalAlign: 'middle' }}
                  />
                  {trainee.name}
                </td>
                <td style={{ padding: '8px' }}>{trainee.department}</td>
                <td style={{ padding: '8px' }}>{trainee.school}</td>
                <td style={{ padding: '8px' }}>
                  <HTETraineeOptions />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div> */}
    </div>
  );
}

export default HTETrainees;