import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card } from "@/components/ui/card";
import {
  Users,
  Building2,
  GraduationCap,
  AlertTriangle,
  Bell,
  School
} from 'lucide-react';

function DeanHome() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const response = await axios.get('/dean/dashboard-stats');
      setStats(response.data.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-0">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold mb-2">
          {stats.collegeDetails.collegeName} ({stats.collegeDetails.collegeCode})
        </h1>
        <p className="text-gray-600">
          Managing {stats.collegeDetails.totalPrograms} Programs
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="p-4">
          <div className="flex items-center space-x-4">
            <Users className="w-8 h-8 text-blue-500" />
            <div>
              <p className="text-sm text-gray-600">Total Trainees</p>
              <h3 className="text-2xl font-semibold">{stats.traineeStats.totalTrainees}</h3>
              <p className="text-sm text-gray-500">
                {stats.traineeStats.deployedTrainees} Deployed
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center space-x-4">
            <Building2 className="w-8 h-8 text-green-500" />
            <div>
              <p className="text-sm text-gray-600">Partner Companies</p>
              <h3 className="text-2xl font-semibold">{stats.companyStats.totalCompanies}</h3>
              <p className="text-sm text-gray-500">
                {stats.companyStats.approvedCompanies} MOA Approved
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center space-x-4">
            <GraduationCap className="w-8 h-8 text-purple-500" />
            <div>
              <p className="text-sm text-gray-600">Completed Training</p>
              <h3 className="text-2xl font-semibold">
                {stats.traineeStats.completedTrainees}
              </h3>
              <p className="text-sm text-gray-500">With Certificates</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center space-x-4">
            <AlertTriangle className="w-8 h-8 text-red-500" />
            <div>
              <p className="text-sm text-gray-600">Emergency Reports</p>
              <h3 className="text-2xl font-semibold">{stats.emergencyStats.total}</h3>
              <p className="text-sm text-gray-500">
                {stats.emergencyStats.pending} Pending
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Program Statistics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-4">
          <h2 className="text-lg font-semibold mb-4">Program Overview</h2>
          <div className="space-y-4">
            {stats.programStats.map((program, index) => (
              <div key={index} className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{program.programName}</p>
                  <p className="text-sm text-gray-500">
                    {program.deployedCount} of {program.traineeCount} Deployed
                  </p>
                </div>
                <div className="w-24 bg-gray-200 rounded-full h-2">
                  <div
                    className={`bg-blue-600 h-2 rounded-full ${program.deployedCount === 0 ? 'opacity-50' : ''}`}
                    style={{
                      width: program.deployedCount === 0 ? '0%' : `${(program.deployedCount / program.traineeCount) * 100}%`
                    }}
                  />
                </div>
              </div>
            ))}

          </div>
        </Card>

        {/* Recent Announcements */}
        <Card className="p-4">
          <h2 className="text-lg font-semibold mb-4">Recent Announcements</h2>
          <div className="space-y-4">
            {stats.recentAnnouncements.map((announcement, index) => (
              <div key={index} className="border-b last:border-0 pb-3">
                <div className="flex items-start justify-between">
                  <h3 className="font-medium">{announcement.title}</h3>
                  <span className={`text-xs px-2 py-1 rounded ${announcement.status === 'Urgent'
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
    </div>
  );
}

export default DeanHome; 