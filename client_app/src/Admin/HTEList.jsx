import React, { useState, useEffect } from 'react';
import '../index.css'; // Adjust the import path if necessary
import MoreVertIcon from '@mui/icons-material/MoreVertOutlined';
import SearchIcon from '@mui/icons-material/Search';
import SortIcon from '@mui/icons-material/Sort';
import AddIcon from '@mui/icons-material/AddCircleOutlineOutlined';
import ArchivedIcon from '@mui/icons-material/ArchiveOutlined';
// import ActionsModal from './ActionsModal'; // Import the ActionsModal
// import ContactModal from '../HTE/ContactModal'; // Import the ContactModal
import RequirementsSubmittedModal from '../HTE/RequirementsSubmittedModal'; // Import the RequirementsSubmittedModal
// import ArchivedModal from './ArchivedModal'; // Import the ArchivedModal
import { IconButton, Menu, MenuItem, Dialog, DialogTitle, DialogContent, DialogActions, Button, RadioGroup, FormControlLabel, Radio } from '@mui/material';

import axios from 'axios';

import StudentView from "./HTEView/student-view"

// import Table, {
//   AvatarCell,
//   SelectColumnFilter,
//   StatusPill,
//   // DateCell
// } from '../components/Table/Table';

function CoordinatorTrainees() {
  const [anchorEl, setAnchorEl] = useState(null);
  const [isActionsModalOpen, setIsActionsModalOpen] = useState(false);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [isRequirementsModalOpen, setIsRequirementsModalOpen] = useState(false);
  const [isArchivedModalOpen, setIsArchivedModalOpen] = useState(false);
  const [isSortModalOpen, setIsSortModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [sortOrder, setSortOrder] = useState('asc'); // State to keep track of sorting order
  const [sortCriteria, setSortCriteria] = useState('name'); // State to keep track of sorting criteria




  const [trainees, setTrainees] = useState([]);
  const [searchQuery, setSearchQuery] = useState(""); // New state for search query

  // Fetch trainees from the API
  const fetchTrainees = async () => {
    try {
      const response = await axios.get('user/HTE/list');
      setTrainees(response.data.data.map((data) => {
        return {
          ...data,
          name: `${data.first_name} ${data.last_name}`
        }
      }));
    } catch (error) {
      console.error("Error fetching trainees:", error);
    }
  };

  useEffect(() => {
    fetchTrainees();
  }, []);
  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleActionsOpen = () => {
    setIsActionsModalOpen(true);
    handleMenuClose();
  };

  const handleActionsClose = () => {
    setIsActionsModalOpen(false);
  };

  const handleContactOpen = () => {
    setIsContactModalOpen(true);
    handleMenuClose();
  };

  const handleContactClose = () => {
    setIsContactModalOpen(false);
  };

  const handleRequirementsOpen = () => {
    setIsRequirementsModalOpen(true);
    handleMenuClose();
  };

  const handleRequirementsClose = () => {
    setIsRequirementsModalOpen(false);
  };

  const handleArchivedOpen = () => {
    setIsArchivedModalOpen(true);
    handleMenuClose();
  };

  const handleArchivedClose = () => {
    setIsArchivedModalOpen(false);
  };

  const handleViewInfo = (student) => {
    setSelectedStudent(student);
    setIsContactModalOpen(true);
  };

  const handleSort = () => {
    setIsSortModalOpen(true);
  };

  const closeSortModal = () => {
    setIsSortModalOpen(false);
  };

  const handleSortChange = (event) => {
    setSortCriteria(event.target.value);
  };

  const applySort = () => {
    setIsSortModalOpen(false);
  };

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  const filteredTrainees = trainees.filter(trainee =>
    (trainee?.name || '').toLowerCase().includes(searchQuery?.toLowerCase()) ||
    (trainee?.course || '').toLowerCase().includes(searchQuery?.toLowerCase())
  );

  const sortedTrainees = [...filteredTrainees].sort((a, b) => {
    if (sortOrder === 'asc') {
      return a[sortCriteria].localeCompare(b[sortCriteria]);
    } else {
      return b[sortCriteria].localeCompare(a[sortCriteria]);
    }
  });

  return (
    <div>
      <StudentView
        data={trainees || []}
        fetchFunction={fetchTrainees}

      />
      {/* <Table
        style={{ overflow: 'wrap' }}
        className="table-sm"
        columns={[]}
        data={([] || []).map(data => {
          return {
            ...data

          };
        })}
        searchField="lastName"
      /> */}

      {/* <div className="trainees-button-container">
        <div className="trainees-search-bar">
          <SearchIcon />
          <input type="text" placeholder="Search Trainees by name or course..." value={searchQuery} onChange={handleSearchChange} />
        </div>
        <button className="trainees-icon-button" onClick={handleArchivedOpen}><ArchivedIcon /></button>
        <button className="trainees-icon-button" onClick={handleSort}><SortIcon /></button>
      </div>
      <div className="trainees-container">
        {sortedTrainees.map((trainee, index) => (
          <div key={index} className="trainees-box">
            <div className="trainees-header">
              <img
                src={trainee.proof_identity}
                alt={`${trainee.name}'s profile`}
                className="trainees-profile-picture"
              />
              <div>
                <h5 className="trainees-user-name">{trainee.name}</h5>
                <p className="trainees-user-message">{trainee.course}</p>
              </div>
            </div>
            <IconButton onClick={handleMenuOpen}>
              <MoreVertIcon style={{ marginRight: '5px' }} />
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
            >
              <MenuItem onClick={handleActionsOpen} sx={{ fontFamily: 'Poppins, sans-serif' }}>
                Actions
              </MenuItem>
              <MenuItem onClick={handleContactOpen} sx={{ fontFamily: 'Poppins, sans-serif' }}>
                Contact
              </MenuItem>
              <MenuItem onClick={handleRequirementsOpen} sx={{ fontFamily: 'Poppins, sans-serif' }}>
                Requirements Submitted
              </MenuItem>
            </Menu>
          </div>
        ))}
      </div> */}









      <RequirementsSubmittedModal open={isRequirementsModalOpen} onClose={handleRequirementsClose} />
      {/* <ArchivedModal open={isArchivedModalOpen} onClose={handleArchivedClose} onViewInfo={handleViewInfo} /> */}
      <Dialog
        open={isSortModalOpen}
        onClose={closeSortModal}
        fullWidth
        maxWidth="xs"
        PaperProps={{
          style: {
            border: '2px solid #808080',
            borderRadius: '8px',
            overflow: 'auto',
          },
        }}
      >
        <DialogTitle
          style={{
            fontFamily: 'Poppins, sans-serif',
            fontWeight: 600,
            color: '#000',
          }}
        >
          Sort Trainees
        </DialogTitle>
        <DialogContent
          dividers={false}
          style={{
            fontFamily: 'Poppins, sans-serif',
            color: '#000',
            overflowY: 'scroll',
            scrollbarWidth: 'none', /* Firefox */
            msOverflowStyle: 'none', /* Internet Explorer 10+ */
          }}
        >
          <RadioGroup value={sortCriteria} onChange={handleSortChange}>
            <FormControlLabel value="name" control={<Radio />} label="Alphabetical Order" />
            <FormControlLabel value="course" control={<Radio />} label="Course" />
          </RadioGroup>
        </DialogContent>
        <DialogActions style={{ padding: '16px' }}>
          <Button
            style={{
              backgroundColor: '#ffffff',
              color: 'black',
              border: '2px solid #808080',
              borderRadius: '8px',
              marginRight: '8px',
              fontFamily: 'Poppins, sans-serif',
            }}
            onClick={closeSortModal}
          >
            Cancel
          </Button>
          <Button
            style={{
              backgroundColor: '#1F41BB',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontFamily: 'Poppins, sans-serif',
            }}
            onClick={applySort}
          >
            Apply
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default CoordinatorTrainees;