import React, { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import {
  Users,
  Building2,
  ClipboardCheck,
  AlertTriangle,
  FileCheck,
  Clock,
  Activity,
  TrendingUp,
  GraduationCap,
  School
} from 'lucide-react';
import axios from 'axios';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

function CoordinatorHome() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const response = await axios.get('/coordinator/dashboard-stats');
      setStats(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      {/* College Info Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {stats?.collegeDetails && (
          <Card className="p-6">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <School className="h-12 w-12 text-blue-500" />
              </div>
              <div className="flex-grow">
                <h2 className="text-2xl font-bold text-gray-800">
                  {stats.collegeDetails.collegeName}
                </h2>
                <p className="text-sm text-gray-500">College Code: {stats.collegeDetails.collegeCode}</p>
                <div className="mt-4 grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Programs</p>
                    <p className="text-2xl font-bold">{stats.collegeDetails.totalPrograms}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Companies</p>
                    <p className="text-2xl font-bold">{stats.collegeDetails.totalCompanies}</p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Program Distribution */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Program Distribution</h3>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats?.programDistribution || []}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                >
                  {stats?.programDistribution?.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Active Trainees"
          value={stats?.traineeStats.active}
          icon={<Users className="h-6 w-6" />}
          change={stats?.traineeStats.change}
        />
        <StatCard
          title="Partner Companies"
          value={stats?.companyStats.total}
          icon={<Building2 className="h-6 w-6" />}
          change={stats?.companyStats.change}
        />
        <StatCard
          title="Pending DTRs"
          value={stats?.dtrStats.pending}
          icon={<Clock className="h-6 w-6" />}
          alert={stats?.dtrStats.urgent}
        />
        <StatCard
          title="Emergency Reports"
          value={stats?.emergencyStats.total}
          icon={<AlertTriangle className="h-6 w-6" />}
          alert={stats?.emergencyStats.urgent}
        />
      </div>

      {/* Activity Chart */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Weekly Activity</h3>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={stats?.activityData || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="value" stroke="#8884d8" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

function StatCard({ title, value, icon, change, alert }) {
  return (
    <Card className="p-6">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <h3 className="text-2xl font-bold mt-2">{value}</h3>
          {change && (
            <p className={`text-sm mt-2 ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              <TrendingUp className="h-4 w-4 inline mr-1" />
              {change}% from last month
            </p>
          )}
        </div>
        <div className="p-3 bg-blue-100 rounded-full">
          {icon}
        </div>
      </div>
      {alert && (
        <p className="text-red-500 text-sm mt-2">
          {alert} items need attention
        </p>
      )}
    </Card>
  );
}

export default CoordinatorHome; 