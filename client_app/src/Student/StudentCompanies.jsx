"use client"

import React, { useState, useEffect } from 'react';
import CoordinatorCompanies from '../Coordinator/CoordinatorCompanies';
import axios from 'axios';
import { toast } from 'react-toastify';
import {
  Dialog as ShadcnDialog,
  DialogContent as ShadcnDialogContent,
  DialogHeader as ShadcnDialogHeader,
  DialogTitle as ShadcnDialogTitle,
  DialogFooter as ShadcnDialogFooter
} from "@/components/ui/dialog";
import { Button as ButtonUI } from "@/components/ui/button";

function StudentCompanies() {
  const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
  const [userApplications, setUserApplications] = useState([]);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [companyToApply, setCompanyToApply] = useState(null);

  // Fetch user's applications
  const fetchUserApplications = async () => {
    try {
      const response = await axios.get('company/applications/user');
      if (response.data.success) {
        setUserApplications(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching user applications:', error);
      //toast.error('Failed to fetch your applications');
    }
  };

  useEffect(() => {
    fetchUserApplications();
  }, []);

  // Handle application submission
  const handleSubmitApplication = async () => {
    try {
      await axios.post('company/applyNow', {
        companyID: companyToApply.id
      });
      toast.success('Application submitted successfully');
      fetchUserApplications();
      setIsConfirmDialogOpen(false);
      setCompanyToApply(null);
    } catch (error) {
      console.error('Error submitting application:', error);
      toast.error(error.response?.data?.message || 'Failed to submit application');
    }
  };

  // Custom company card for students
  const StudentCompanyCard = ({ company, ...props }) => {
    const application = userApplications.find(app => app.company_id === company.companyID);

    return (
      <div className="col-span-1">
        <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden border border-gray-100">
          {/* Company Header */}
          <div className="relative h-48">
            <img
              src={company.logo || '/placeholder.png'}
              alt={company.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 to-transparent text-white">
              <h3 className="text-lg font-semibold">{company.name}</h3>
              <p className="text-sm text-gray-200">{company.expertise}</p>
            </div>
          </div>

          {/* Company Content */}
          <div className="p-4 space-y-4">
            {/* ... other company details ... */}

            {/* Application Status */}
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-1">MOA Status</h4>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${company.MOAApprovalStatus === 'approved'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-yellow-100 text-yellow-800'
                  }`}>
                  {company.MOAApprovalStatus === 'approved' ? 'Approved' : 'Pending'}
                </span>
              </div>

              {/* Application Status or Apply Button */}
              {application ? (
                <div className={`px-3 py-1.5 rounded-full text-xs font-medium ${application.is_confirmed
                  ? 'bg-green-100 text-green-800'
                  : application.status === 'approved'
                    ? 'bg-blue-100 text-blue-800'
                    : application.status === 'rejected'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                  {application.is_confirmed
                    ? 'Joined'
                    : application.status === 'approved'
                      ? 'Approved'
                      : application.status === 'rejected'
                        ? 'Rejected'
                        : 'Pending'}
                </div>
              ) : (
                company.MOAApprovalStatus === 'approved' && (
                  <ButtonUI
                    onClick={() => {
                      setCompanyToApply(company);
                      setIsConfirmDialogOpen(true);
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                    size="sm"
                  >
                    Apply Now
                  </ButtonUI>
                )
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <CoordinatorCompanies
        role="trainee"
        CustomCompanyCard={StudentCompanyCard}
      />

      {/* Application Confirmation Dialog */}
      <ShadcnDialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
        <ShadcnDialogContent className="sm:max-w-[425px]">
          <ShadcnDialogHeader>
            <ShadcnDialogTitle>Confirm Application</ShadcnDialogTitle>
          </ShadcnDialogHeader>
          <div className="py-4">
            <p className="text-gray-600">
              Are you sure you want to apply to {companyToApply?.name}?
              Make sure you meet all the requirements before proceeding.
            </p>
          </div>
          <ShadcnDialogFooter>
            <ButtonUI
              variant="outline"
              onClick={() => {
                setIsConfirmDialogOpen(false);
                setCompanyToApply(null);
              }}
            >
              Cancel
            </ButtonUI>
            <ButtonUI
              onClick={handleSubmitApplication}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Yes, Apply
            </ButtonUI>
          </ShadcnDialogFooter>
        </ShadcnDialogContent>
      </ShadcnDialog>
    </>
  );
}

export default StudentCompanies;
