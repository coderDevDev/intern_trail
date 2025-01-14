import React from 'react';
import '../index.css'; // Adjust the import path if necessary
import SortIcon from '@mui/icons-material/Sort';
import MoreVertOutlinedIcon from '@mui/icons-material/MoreVertOutlined';

function CoordinatorReports() {
  const reports = [
    {
      name: 'John Doe',
      profilePicture: 'https://via.placeholder.com/50',
      emergencyType: 'Medical',
      severity: 'High',
      date: '2023-10-01',
      details: 'John Doe experienced a severe allergic reaction.',
    },
    {
      name: 'Jane Smith',
      profilePicture: 'https://via.placeholder.com/50',
      emergencyType: 'Hazard/Equipment Failure',
      severity: 'Moderate',
      date: '2023-10-02',
      details: 'Equipment failure in the lab caused a minor fire.',
    },
    {
      name: 'Alice Johnson',
      profilePicture: 'https://via.placeholder.com/50',
      emergencyType: 'Harassment',
      severity: 'Critical',
      date: '2023-10-03',
      details: 'Alice reported a case of severe harassment.',
    },
  ];

  return (
    <div>
      <h1>Emergency Reports</h1>
      <div className="emergency-button-container">
        <button className="emergency-icon-button"><SortIcon /></button>
      </div>
      <table className="emergency-reports-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Type of Emergency</th>
            <th>Severity</th>
            <th>Date of Submission</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {reports.map((report, index) => (
            <tr key={index}>
              <td>
                <img src={report.profilePicture} alt={`${report.name}'s profile`} className="profile-picture" />
                {report.name}
              </td>
              <td>{report.emergencyType}</td>
              <td>{report.severity}</td>
              <td>{report.date}</td>
              <td>
                <button className="emergency-icon-button"><MoreVertOutlinedIcon /></button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default CoordinatorReports;