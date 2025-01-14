import React, { useEffect, useState } from 'react';
import '../index.css'; // Adjust the import path if necessary
import TraineeInfo from '@mui/icons-material/MoreVertOutlined';
import SearchIcon from '@mui/icons-material/Search';
import SortIcon from '@mui/icons-material/Sort';
import AddIcon from '@mui/icons-material/AddCircleOutlineOutlined';
import axios from 'axios';

function CoordinatorTrainees() {
  const [trainees, setTrainees] = useState([]);
  const [searchQuery, setSearchQuery] = useState(""); // New state for search query

  // Fetch trainees from the API
  const fetchTrainees = async () => {
    try {
      const response = await axios.get('user/trainees/list');
      setTrainees(response.data.data);
    } catch (error) {
      console.error("Error fetching trainees:", error);
    }
  };

  useEffect(() => {
    fetchTrainees();
  }, []);

  // Filter trainees based on the search query
  const filteredTrainees = trainees.filter((trainee) => {
    let fullName = `${trainee.first_name} ${trainee.last_name}`.toLowerCase();
    return fullName.includes(searchQuery.toLowerCase()); // Case-insensitive search
  });

  return (
    <div>
      <h1>Trainees</h1>
      <div className="trainees-button-container">
        <div className="trainees-search-bar">
          <SearchIcon />
          <input
            type="text"
            placeholder="Search Trainees..."
            value={searchQuery} // Bind input to searchQuery state
            onChange={(e) => setSearchQuery(e.target.value)} // Update searchQuery on input change
          />
        </div>
        <button className="trainees-icon-button"><AddIcon /></button>
        <button className="trainees-icon-button"><SortIcon /></button>
      </div>

      {/* Show "No results" if there are no filtered trainees */}
      {filteredTrainees.length === 0 ? (
        <div className="text-center text-gray-500 mt-4">
          No results found
        </div>
      ) : (
        <div className="trainees-container">
          {filteredTrainees.map((trainee, index) => {
            let fullName = `${trainee.first_name} ${trainee.last_name}`;
            let college = trainee.collegeName;
            let course = trainee.progName;
            return (
              <div key={index} className="trainees-box">
                <div className="trainees-header">
                  <img
                    src={trainee.proof_identity}
                    alt={`${trainee.first_name}'s profile`}
                    className="trainees-profile-picture"
                  />
                  <div>
                    <h5 className="trainees-user-name">{fullName}</h5>
                    <p className="trainees-user-message">{college} - {course}</p>
                  </div>
                </div>
                <button className="trainees-view-info-button">
                  <TraineeInfo style={{ marginRight: '5px' }} />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default CoordinatorTrainees;
