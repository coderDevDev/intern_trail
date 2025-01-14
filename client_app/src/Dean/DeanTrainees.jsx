import React from 'react';
import '../index.css'; // Adjust the import path if necessary
import TraineeInfo from '@mui/icons-material/MoreVertOutlined';
import SearchIcon from '@mui/icons-material/Search';
import SortIcon from '@mui/icons-material/Sort';
import AddIcon from '@mui/icons-material/AddCircleOutlineOutlined';

function DeanTrainees() {
  const trainees = [
    {
      name: 'Juan Dela Cruz',
      profilePicture: '../anyrgb.com.png',
      course: 'BSCpE - 4th Year',
    },
    {
      name: 'Maria Clara',
      profilePicture: '../anyrgb.com.png',
      course: 'BSCpE - 4th Year',
    },
    {
      name: 'Jose Rizal',
      profilePicture: '../anyrgb.com.png',
      course: 'BSCpE - 4th Year',
    },
    {
      name: 'Andres Bonifacio',
      profilePicture: '../anyrgb.com.png',
      course: 'BSCpE - 4th Year',
    },
  ];

  return (
    <div>
      <h1>Trainees</h1>
      <div className="trainees-button-container">
        <div className="trainees-search-bar">
          <SearchIcon />
          <input type="text" placeholder="Search Trainees..." />
        </div>
        <button className="trainees-icon-button"><AddIcon /></button>
        <button className="trainees-icon-button"><SortIcon /></button>
      </div>
      <div className="trainees-container">
        {trainees.map((trainee, index) => (
          <div key={index} className="trainees-box">
            <div className="trainees-header">
              <img
                src={trainee.profilePicture}
                alt={`${trainee.name}'s profile`}
                className="trainees-profile-picture"
              />
              <div>
                <h5 className="trainees-user-name">{trainee.name}</h5>
                <p className="trainees-user-message">{trainee.course}</p>
              </div>
            </div>
            <button className="trainees-view-info-button">
              <TraineeInfo style={{ marginRight: '5px' }} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default DeanTrainees;