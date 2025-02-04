import React, { useState, useEffect } from 'react';
import '../index.css'; // Adjust the import path if necessary
import SearchIcon from '@mui/icons-material/Search';
import SortIcon from '@mui/icons-material/Sort';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  RadioGroup,
  FormControlLabel,
  Radio,
  IconButton,
} from '@mui/material';
import axios from 'axios';
function DeanCompanies() {
  const [searchTerm, setSearchTerm] = useState('');


  const [companies, setCompanies] = useState([]);


  const fetchCompanies = async () => {
    try {
      const response = await axios.get('company/list');
      let result = response.data.data
      let mappedData = result.map((company) => {
        return {
          name: company.companyName,
          logo: company.avatar_photo,
          contact: company.contact_email,
          description: `Expertise: ${company.expertise || 'N/A'}`,
          location: company.address,
          applicationRequirements: company.list_of_requirements
            ? JSON.parse(company.list_of_requirements)
              .map((req) => `- ${req.label}`)
              .join('\n')
            : 'No requirements specified.',
          moaURL: company.moa_url,
          expertise: company.expertise || 'No expertise provided.',
          moaStatus: company.moa_status === 'pending' ? 'Pending Approval' : 'Approved',
          starRating: 0, // Placeholder as the response doesn't include ratings
          feedback: [], // Placeholder as the response doesn't include feedback
        }
      });

      setCompanies(mappedData);


    } catch (error) {
      console.error("Error fetching trainees:", error);
    }
  };


  useEffect(() => {
    fetchCompanies();
  }, []);

  const [sortOrder, setSortOrder] = useState('asc');
  const [sortCriteria, setSortCriteria] = useState('name');
  const [isSortModalOpen, setIsSortModalOpen] = useState(false);

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
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
    const sortedCompanies = [...companies].sort((a, b) => {
      if (sortOrder === 'asc') {
        return a[sortCriteria].localeCompare(b[sortCriteria]);
      } else {
        return b[sortCriteria].localeCompare(a[sortCriteria]);
      }
    });
    setCompanies(sortedCompanies);
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    setIsSortModalOpen(false);
  };

  const filteredCompanies = companies.filter((company) =>
    company.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleApprove = (companyName) => {
    setCompanies((prevCompanies) =>
      prevCompanies.map((company) =>
        company.name === companyName ? { ...company, moaStatus: 'approved' } : company
      )
    );
  };

  const handleReject = (companyName) => {
    setCompanies((prevCompanies) =>
      prevCompanies.map((company) =>
        company.name === companyName ? { ...company, moaStatus: 'pending' } : company
      )
    );
  };

  return (
    <div>
      <h1>Companies</h1>
      <div className="company-button-container" style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
        <div className="search-bar" style={{ display: 'flex', alignItems: 'center', marginRight: '10px' }}>
          <SearchIcon style={{ color: 'gray', marginRight: '5px' }} />
          <input
            type="text"
            placeholder="Search Companies..."
            value={searchTerm}
            onChange={handleSearchChange}
            style={{ padding: '5px', borderRadius: '4px' }}
          />
        </div>
        <IconButton style={{ color: 'gray', marginLeft: '10px' }} onClick={handleSort}>
          <SortIcon />
        </IconButton>
      </div>
      <div className="table-container" style={{ border: '2px solid #808080', borderRadius: '8px', padding: '20px', marginTop: '0' }}>
        <table className="emergency-reports-table" style={{ width: '100%', borderCollapse: 'collapse', marginTop: '0' }}>
          <thead>
            <tr>
              <th style={{ padding: '12px', width: '20%' }}>Name</th>
              <th style={{ padding: '12px', width: '20%' }}>Location</th>
              <th style={{ padding: '12px', width: '20%' }}>MOA Status</th>
              <th style={{ padding: '12px', width: '20%' }}> MOA</th>
              <th style={{ padding: '12px', width: '20%' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredCompanies.map((company, index) => (
              <tr key={index} style={{ borderBottom: '1px solid #ddd' }}>
                <td style={{ padding: '12px', width: '20%' }}>{company.name}</td>
                <td style={{ padding: '12px', width: '20%' }}>{company.location}</td>
                <td style={{ padding: '12px', width: '20%' }}>{company.moaStatus}</td>
                <td style={{ padding: '12px', width: '20%' }}>
                  <a href={company.moaURL} target="_blank" rel="noopener noreferrer">
                    View
                  </a>
                </td>
                <td style={{ padding: '12px', width: '20%' }}>
                  <button className="btn btn-primary me-2" onClick={() => handleApprove(company.name)}>
                    Approve
                  </button>
                  <button className="btn btn-danger" onClick={() => handleReject(company.name)}>
                    Reject
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
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
          <DialogTitle style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, color: '#000' }}>
            Sort Companies
          </DialogTitle>
          <DialogContent dividers={false}>
            <RadioGroup value={sortCriteria} onChange={handleSortChange}>
              <FormControlLabel value="name" control={<Radio />} label="Alphabetical Order" />
              <FormControlLabel value="location" control={<Radio />} label="Location" />
            </RadioGroup>
          </DialogContent>
          <DialogActions style={{ padding: '16px' }}>
            <Button style={{ backgroundColor: '#ffffff', color: 'black', border: '2px solid #808080', borderRadius: '8px', marginRight: '8px' }} onClick={closeSortModal}>
              Cancel
            </Button>
            <Button style={{ backgroundColor: '#1F41BB', color: 'white', border: 'none', borderRadius: '8px' }} onClick={applySort}>
              Apply
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </div>
  );
}

export default DeanCompanies;
