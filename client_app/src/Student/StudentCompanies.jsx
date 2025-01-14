import React, { useState } from 'react';
import '../index.css'; // Adjust the import path if necessary
import SortIcon from '@mui/icons-material/Sort';
import SearchIcon from '@mui/icons-material/Search';
import StarIcon from '@mui/icons-material/Star';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  RadioGroup,
  FormControlLabel,
  Radio
} from '@mui/material';

function StudentCompanies() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [sortOrder, setSortOrder] = useState('asc'); // State to keep track of sorting order
  const [sortCriteria, setSortCriteria] = useState('name'); // State to keep track of sorting criteria
  const [isSortModalOpen, setIsSortModalOpen] = useState(false); // State to control sort modal
  const [searchQuery, setSearchQuery] = useState(''); // State to keep track of search query

  const companies = [
    {
      name: 'Philippine Information Agency',
      logo: 'https://yt3.googleusercontent.com/ytc/AIdro_keIW9LrzLnDTC0HWc-VT5Lzq28ZH90eCe6KjwnJj1jMEU=s900-c-k-c0x00ffffff-no-rj',
      contact: 'piahrdd@pia.gov.ph',
      description: 'PIA - Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
      location: 'Quezon City, Metro Manila',
      applicationRequirements: 'Requirements for Company A.\nRequirement 1\nRequirement 2\nRequirement 3',
      expertise: 'A IT Tech Support',
      MOAApprovalStatus: 'MOA Approved',
      starRating: 4.5,
      feedback: [
        { student: 'Student 1', comment: 'Great experience!', date: '2023-01-01', profilePicture: 'https://via.placeholder.com/40' },
        { student: 'Student 2', comment: 'Learned a lot!', date: '2023-02-01', profilePicture: 'https://via.placeholder.com/40' }
      ]
    },
    {
      name: 'DOST-SEI',
      logo: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSHelZpTYsSK51UGDEjonNl-QlREI1O28bweA&s',
      contact: 'dosthr@example.com',
      description: 'DOST - Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
      location: 'Taguig City, Metro Manila',
      applicationRequirements: 'Requirements for Company B.\nRequirement 1\nRequirement 2\nRequirement 3',
      expertise: 'B Javascript Programmer',
      MOAApprovalStatus: 'MOA Pending',
      starRating: 4.0,
      feedback: [
        { student: 'Student 3', comment: 'Good company.', date: '2023-03-01', profilePicture: 'https://via.placeholder.com/40' },
        { student: 'Student 4', comment: 'Helpful staff.', date: '2023-04-01', profilePicture: 'https://via.placeholder.com/40' }
      ]
    },
    {
      name: 'iSynergies Inc.',
      logo: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ4j2_XlpIbgR-IidZJrsYGP6BXa1aHRxrrNg&s',
      contact: 'isynergies@example.com',
      description: 'ISYNERGIES - Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
      location: 'Cabanatuan City, Nueva Ecija',
      applicationRequirements: 'Requirements for Company C.\nRequirement 1\nRequirement 2\nRequirement 3',
      expertise: 'C PHP Programmer',
      MOAApprovalStatus: 'MOA Approved',
      starRating: 4.8,
      feedback: [
        { student: 'Student 5', comment: 'Excellent!', date: '2023-05-01', profilePicture: 'https://via.placeholder.com/40' },
        { student: 'Student 6', comment: 'Highly recommend.', date: '2023-06-01', profilePicture: 'https://via.placeholder.com/40' }
      ]
    },
    {
      name: 'ASKI Lending Corporation',
      logo: 'https://i0.wp.com/vincerapisura.com/wp/wp-content/uploads/2019/10/aski-logo.png?fit=500%2C500&ssl=1',
      contact: 'aski@example.com',
      description: 'ASKI - Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
      location: 'Cabanatuan City, Nueva Ecija',
      applicationRequirements: 'Requirements for Company D.\nRequirement 1\nRequirement 2\nRequirement 3',
      expertise: 'D IT Tech Support',
      MOAApprovalStatus: 'MOA Pending',
      starRating: 4.2,
      feedback: [
        { student: 'Student 7', comment: 'Good learning experience.', date: '2023-07-01', profilePicture: 'https://via.placeholder.com/40' },
        { student: 'Student 8', comment: 'Supportive environment.', date: '2023-08-01', profilePicture: 'https://via.placeholder.com/40' }
      ]
    }
    
  ];

  const handleCompanyClick = (company) => {
    setSelectedCompany(company);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedCompany(null);
  };

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 0; i < 5; i++) {
      stars.push(
        <StarIcon key={i} style={{ color: i < rating ? '#FFD700' : '#E0E0E0' }} />
      );
    }
    return stars;
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

  const filteredCompanies = companies.filter(company =>
    company.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    company.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
    company.expertise.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sortedCompanies = [...filteredCompanies].sort((a, b) => {
    if (sortOrder === 'asc') {
      return a[sortCriteria].localeCompare(b[sortCriteria]);
    } else {
      return b[sortCriteria].localeCompare(a[sortCriteria]);
    }
  });

  return (
    <div>
      <h1>Companies</h1>
      <h5>Available affiliated companies</h5>
      <div className="company-button-container">
        <div className="search-bar">
          <SearchIcon />
          <input type="text" placeholder="Search Companies by name, location, or your expertise..." value={searchQuery} onChange={handleSearchChange} />
        </div>
        <button className="company-icon-button" onClick={handleSort}><SortIcon /></button>
      </div>

      <div className="companies-container">
        {sortedCompanies.map((company, index) => (
          <div key={index} className="company-box">
            <div className="company-header">
              <img src={company.logo} alt={`${company.name} Logo`} className="company-logo" style={{ boxShadow: '0 8px 16px rgba(0, 0, 0, 0.2)' }} />
              <h5 className="company-name">{company.name}</h5>
            </div>
            <p className="company-description">{company.description}</p>
            <p className="company-expertise" style={{ color: '#1F41BB' }}><span style={{color:'#000'}}>Looking for: </span> {company.expertise}</p>
            <p className="company-location" style={{ color: '#1F41BB' }}>{company.location}</p>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <button className="view-more-button" onClick={() => handleCompanyClick(company)}>View More</button>
              <span style={{ alignSelf: 'center', fontWeight: 600, color: '#1F41BB' }}>
                {company.MOAApprovalStatus}
              </span>
            </div>
          </div>
          
        ))}
      </div>
      {isModalOpen && selectedCompany && (
        <Dialog
          open={isModalOpen}
          onClose={closeModal}
          fullWidth
          maxWidth="sm"
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
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              fontFamily: 'Poppins, sans-serif',
              fontWeight: 600,
              color: '#000',
            }}
          >
            <img
              src={selectedCompany.logo}
              alt={`${selectedCompany.name} Logo`}
              style={{ width: '150px', height: '150px', borderRadius: '50%', marginBottom: '10px', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)' }}
            />
            <Typography variant="h6" style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600 }}>
              {selectedCompany.name}
            </Typography>
            <Typography variant="body2" style={{ fontFamily: 'Poppins, sans-serif', color: '#808080' }}>
              {selectedCompany.location}
            </Typography>
            <Typography variant="body2" style={{ fontFamily: 'Poppins, sans-serif', color: '#808080' }}>
              {selectedCompany.contact}
            </Typography>
            <Typography variant="body2" style={{ fontFamily: 'Poppins, sans-serif', color: '#1F41BB' }}>
              {selectedCompany.MOAApprovalStatus}
            </Typography>

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
            <Typography variant="h6" style={{ marginBottom: '10px', fontFamily: 'Poppins, sans-serif', fontWeight: 600 }}>
              Description
            </Typography>
            <Typography variant="body1" style={{ marginBottom: '20px', whiteSpace: 'pre-line' }}>
              {selectedCompany.description}
            </Typography>
            <Typography variant="h6" style={{ marginBottom: '10px', fontFamily: 'Poppins, sans-serif', fontWeight: 600 }}>
              Application Requirements
            </Typography>
            <Typography variant="body1" style={{ marginBottom: '20px', whiteSpace: 'pre-line' }}>
              {selectedCompany.applicationRequirements}
            </Typography>
            <Typography variant="h6" style={{ marginBottom: '10px', fontFamily: 'Poppins, sans-serif', fontWeight: 600 }}>
              Expertise and Location
            </Typography>
            <Typography variant="body1" style={{ marginBottom: '20px' }}>
              {selectedCompany.expertise} - {selectedCompany.location}
            </Typography>
            <Typography variant="h6" style={{ marginBottom: '10px', fontFamily: 'Poppins, sans-serif', fontWeight: 600 }}>
              Star Rating
            </Typography>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
              {renderStars(Math.round(selectedCompany.starRating))}
            </div>
            <Typography variant="h6" style={{ marginBottom: '10px', fontFamily: 'Poppins, sans-serif', fontWeight: 600 }}>
              Student Feedback
            </Typography>
            {selectedCompany.feedback.map((feedback, index) => (
              <div key={index} style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                <img
                  src={feedback.profilePicture}
                  alt={`${feedback.student} Profile`}
                  style={{ width: '40px', height: '40px', borderRadius: '50%', marginRight: '10px' }}
                />
                <Typography variant="body2">
                  {feedback.student}: {feedback.comment} ({feedback.date})
                </Typography>
              </div>
            ))}
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
              onClick={closeModal}
            >
              Close
            </Button>
          </DialogActions>
        </Dialog>
      )}
      {isSortModalOpen && (
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
            Sort Companies
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
              <FormControlLabel value="location" control={<Radio />} label="Location" />
              <FormControlLabel value="expertise" control={<Radio />} label="Expertise" />
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
      )}
    </div>
  );
}

export default StudentCompanies;