import React from 'react';
import '../index.css'; // Adjust the import path if necessary
import AddCompany from '@mui/icons-material/AddCircleOutlineOutlined';
import SortIcon from '@mui/icons-material/Sort';
import SearchIcon from '@mui/icons-material/Search';

function DeanCompanies() {
  const companies = [
    {
      name: 'Company A',
      logo: 'https://via.placeholder.com/50',
      description: 'A brief description of Company A.',
      location: 'Location A',
    },
    {
      name: 'Company B',
      logo: 'https://via.placeholder.com/50',
      description: 'A brief description of Company B.',
      location: 'Location B',
    },
    {
      name: 'Company C',
      logo: 'https://via.placeholder.com/50',
      description: 'A brief description of Company C.',
      location: 'Location C',
    },
    {
        name: 'Company D',
        logo: 'https://via.placeholder.com/50',
        description: 'A brief description of Company C.',
        location: 'Location D',
      },
  ];

return (
    <div>
        <h1>Companies</h1>
        <h5>Available affiliated companies</h5>
        <div className="company-button-container">
        <div className="search-bar">
            <SearchIcon />
            <input type="text" placeholder="Search Companies..." />
        </div>
        <button className="company-icon-button"><AddCompany /></button>
        <button className="company-icon-button"><SortIcon /></button>
        </div>
        <div className="companies-container">
            {companies.map((company, index) => (
                <div key={index} className="company-box">
                    <div className="company-header">
                        <img src={company.logo} alt={`${company.name} Logo`} className="company-logo" />
                        <h5 className="company-name">{company.name}</h5>
                    </div>
                    <p className="company-description">{company.description}</p>
                    <p className="company-location" style={{color: '#1F41BB'}}>{company.location}</p>
                    <button className="view-more-button">View More</button>
                </div>
            ))}
        </div>
    </div>
);
}

export default DeanCompanies;