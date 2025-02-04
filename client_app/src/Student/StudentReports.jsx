import React from 'react';
import '../index.css'; // Adjust the import path if necessary

function StudentReports() {
  return (
    <div>
      <h1>Report an Emergency</h1>
      <form className="emergency-form">
        <div className="form-left">
          <div className="form-group">
            <h5>Info</h5>
            <label htmlFor="name">Name</label>
            <input type="text" id="name" name="name" className="report-input" required />
          </div>
          <div className="form-group">
            <label htmlFor="department">Department</label>
            <input type="text" id="department" name="department" className="report-input" required />
          </div>
          <div className="form-group">
            <label htmlFor="date-time">Date and Time</label>
            <input type="datetime-local" id="date-time" name="date-time" className="report-input" required />
          </div>
          <div className="form-group">
            <label htmlFor="location">Location of Incident</label>
            <input type="text" id="location" name="location" className="report-input" required />
          </div>
        </div>
        <div className="form-right">
          <div className="form-group">
            <h5>Incident Info</h5>
            <label className="form-header-label">Type of Emergency</label>
            <div className="radio-group">
              <label>
                <input type="radio" name="emergency-type" value="Hazard/Equipment Failure" required />
                Hazard/Equipment Failure
              </label>
              <label>
                <input type="radio" name="emergency-type" value="Medical" required />
                Medical
              </label>
              <label>
                <input type="radio" name="emergency-type" value="Disaster" required />
                Disaster
              </label>
              <label>
                <input type="radio" name="emergency-type" value="Harassment" required />
                Harassment
              </label>
            </div>
          </div>
          <div className="form-group">
            <label className="form-header-label" >Severity</label>
            <div className="radio-group">
              <label>
                <input type="radio" name="severity" value="Low" required />
                Low
              </label>
              <label>
                <input type="radio" name="severity" value="Moderate" required />
                Moderate
              </label>
              <label>
                <input type="radio" name="severity" value="High" required />
                High
              </label>
              <label>
                <input type="radio" name="severity" value="Critical" required />
                Critical
              </label>
            </div>
          </div>
        </div>
        <div className="form-group full-width">
          <label htmlFor="details" className="form-header-label">Details of the Emergency</label>
          <textarea id="details" name="details" rows="4" required></textarea>
        </div>
        <div className="form-submit">
          <button type="submit" className="submit-button">Submit Report</button>
        </div>
      </form>
    </div>
  );
}

export default StudentReports;