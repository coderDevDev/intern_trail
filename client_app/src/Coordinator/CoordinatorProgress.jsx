import React from 'react';
import '../index.css'; // Adjust the import path if necessary
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import AssignmentIcon from '@mui/icons-material/TaskAltOutlined';
import ReportIcon from '@mui/icons-material/EventAvailableOutlined';

function CoordinatorProgress() {
  const reports = [
    {
      title: 'Daily Time Record',
      description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
      buttonText: 'Update',
      icon: <AccessTimeIcon style={{ fontSize: 36 }} />,
    },
    {
      title: 'Daily Accomplishment',
      description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
      buttonText: 'Update',
      icon: <AssignmentIcon style={{ fontSize: 36 }} />,
    },
    {
      title: 'Weekly Report',
      description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
      buttonText: 'Update',
      icon: <ReportIcon style={{ fontSize: 36 }} />,
    },
  ];

  return (
    <div>
      <h1>Progress Reports</h1>
      <h5>Update your Accomplishments</h5>
      <div className="progress-container">
        {reports.map((report, index) => (
          <div key={index} className="progress-box">
            <div className="progress-header">
              {report.icon}
              <h5 className="progress-title">{report.title}</h5>
            </div>
            <p className="progress-description">{report.description}</p>
            <button className="update-button">{report.buttonText}</button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default CoordinatorProgress;
