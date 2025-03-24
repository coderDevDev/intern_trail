import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Clock,
  Calendar,
  GraduationCap,
  Building2,
  FileText,
  CheckCircle2,
  AlertCircle,
  Bell
} from 'lucide-react';

import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { toast } from 'react-toastify';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

function StudentHome() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const [requirements, setRequirements] = useState([]);
  const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser') || '{}');

  // Fetch requirements from company
  const fetchRequirements = async () => {
    try {
      const response = await axios.get('/company/student-requirements', {
        params: {
          student_id: loggedInUser.id
        }
      });

      if (response.data.success) {
        const companyReqs = response.data.data;
        setRequirements(companyReqs);
      }
    } catch (error) {
      console.error('Error fetching requirements:', error);
      toast.error('Failed to fetch requirements');
    }
  };

  useEffect(() => {
    fetchRequirements();
  }, []);


  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const response = await axios.get('/student/dashboard-stats');
      setStats(response.data.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-96">Loading...</div>;
  }

  const { traineeDetails, recentDTRs, recentAnnouncements, weeklyProgress } = stats;




  const calculateProgress = (requirements) => {
    if (!requirements || requirements.length === 0) return 1; // Default to 1% if there are no requirements

    const completed = requirements.filter((req) => req.status === "completed").length;
    const progress = (completed / requirements.length) * 100;

    return progress > 0 ? progress : 100; // Ensure minimum progress is 1%
  };
  return (
    <div className="">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="p-4">
          <div className="flex items-center">
            <Clock className="h-6 w-6 text-blue-500" />
            <div>
              <p className="text-lg font-semibold mb-auto ml-2">Total Hours</p>
              <h3 className="text-2xl font-semibold">
                {traineeDetails?.remaining_hours || 0}
                {/* {traineeDetails.total_hours_rendered} / {360 - traineeDetails.remaining_hours} */}
              </h3>
            </div>
          </div>
          <Progress
            value={(traineeDetails.total_hours_rendered / (360 - traineeDetails.remaining_hours)) * 100}
            className="mt-2"
          />
        </Card>

        {/* Add more stat cards */}
      </div>


      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent DTRs */}
        <Card className="p-4">
          <h2 className="text-lg font-semibold mb-4">Recent Time Records</h2>
          <div className="space-y-4">
            {recentDTRs.map((dtr, index) => (
              <div key={index} className="flex items-start space-x-4 border-b pb-3 last:border-0">
                <div className="flex-1">
                  <div className="flex justify-between">
                    <p className="font-medium">{new Date(dtr.date).toLocaleDateString()}</p>
                    <span className={`text-sm ${dtr.status === 'approved' ? 'text-green-500' : 'text-yellow-500'
                      }`}>
                      {dtr.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    {dtr.time_in} - {dtr.time_out}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Requirements Progress */}
        {requirements.map((company) => (
          <Card key={company.id} className="shadow-lg">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl">
                {company.name}
              </CardTitle>
              <div className="text-sm text-gray-500">
                Requirements Progress
              </div>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <Progress
                  value={calculateProgress(company.requirements)}
                  className="h-2"
                />
                <div className="mt-1 text-sm text-gray-500">
                  {calculateProgress(company.requirements)}% Complete
                </div>
              </div>
              <div className="space-y-4">
                {JSON.parse(company.list_of_requirements).map((req, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50"
                  >
                    {/* Icon */}
                    <CheckCircle2
                      className={`h-5 w-5 ${req.status === "completed" ? "text-green-500" : "text-gray-400"
                        }`}
                    />

                    {/* Requirement Details */}
                    <div className="flex-1">
                      <div className="font-medium">
                        {req.label}{" "}
                        <span
                          className={`text-xs font-semibold ${req.isRequired ? "text-red-500" : "text-gray-500"
                            }`}
                        >
                          ({req.isRequired ? "Required" : "Optional"})
                        </span>
                      </div>

                      {/* Submitted Date */}
                      {req.status === "completed" && req.submitted_date && (
                        <div className="text-sm text-gray-500">
                          Submitted on {new Date(req.submitted_date).toLocaleDateString()}
                        </div>
                      )}
                    </div>

                    {/* View Button (if not completed) */}
                    {req.status !== "completed" && (
                      <Button size="sm" variant="outline">
                        View
                      </Button>
                    )}
                  </div>
                ))}

              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Announcements */}
      <Card className="mt-6 p-4">
        <h2 className="text-lg font-semibold mb-4">Recent Announcements</h2>
        <div className="space-y-4">
          {recentAnnouncements.map((announcement, index) => (
            <div key={index} className="border-b last:border-0 pb-3">
              <div className="flex items-start justify-between">
                <h3 className="font-medium">{announcement.title}</h3>
                <span className={`text-xs px-2 py-1 rounded-full ${announcement.status === 'Urgent'
                  ? 'bg-red-100 text-red-800'
                  : 'bg-blue-100 text-blue-800'
                  }`}>
                  {announcement.status}
                </span>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                {announcement.description}
              </p>
              <p className="text-xs text-gray-500 mt-2">
                Posted by {announcement.first_name} {announcement.last_name}
              </p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

export default StudentHome; 