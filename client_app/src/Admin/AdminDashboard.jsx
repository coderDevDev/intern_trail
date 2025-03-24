import React, { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import {
  Users,
  Building2,
  GraduationCap,
  AlertTriangle,
  FileCheck,
  Clock,
  Activity,
  TrendingUp
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

function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const response = await axios.get('/admin/dashboard-stats');
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
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-gray-800">Admin Dashboard</h1>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Users"
          value={stats?.userStats.total}
          icon={<Users className="h-6 w-6" />}
          change={stats?.userStats.change}
        />
        <StatCard
          title="Partner Companies"
          value={stats?.companyStats.total}
          icon={<Building2 className="h-6 w-6" />}
          change={stats?.companyStats.change}
        />
        <StatCard
          title="Active Interns"
          value={stats?.internStats.active}
          icon={<GraduationCap className="h-6 w-6" />}
          change={stats?.internStats.change}
        />
        <StatCard
          title="Emergency Reports"
          value={stats?.emergencyStats.total}
          icon={<AlertTriangle className="h-6 w-6" />}
          change={stats?.emergencyStats.change}
          alert={stats?.emergencyStats.urgent}
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        {/* User Activity Chart */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">System Activity</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={stats?.activityData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="value" stroke="#2563eb" />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* User Distribution */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">User Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={stats?.userDistribution}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label
              >
                {stats?.userDistribution.map((entry, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="mt-6">
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4">Recent System Logs</h3>
          <div className="space-y-4">
            {stats?.recentLogs.map((log, index) => (
              <div key={index} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                <Activity className="h-5 w-5 text-blue-500 mt-1" />
                <div>
                  <p className="text-sm font-medium">{log.action}</p>
                  <p className="text-xs text-gray-500">{log.details}</p>
                  <p className="text-xs text-gray-400">{log.timestamp}</p>
                </div>
              </div>
            ))}
          </div>
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
          <h3 className="text-2xl font-semibold mt-2">{value}</h3>
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
          {alert} urgent items require attention
        </p>
      )}
    </Card>
  );
}

export default AdminDashboard; 