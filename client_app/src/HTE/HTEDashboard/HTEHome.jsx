import React, { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import {
  Users,
  ClipboardCheck,
  AlertTriangle,
  FileCheck,
  Clock,
  Activity,
  TrendingUp,
  CheckCircle2,
  Building2,
  Mail,
  Phone,
  FileText
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

function HTEHome() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const response = await axios.get('/hte/dashboard-stats');
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
      {/* Company Details Section */}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">


        {stats?.companyDetails && (
                    <Card className="p-6">
                      <div className="flex flex-col gap-4">
                        {/* Header with image and company name in one row */}
                        <div className="flex flex-col sm:flex-row items-center gap-4">
                          <div className="flex-shrink-0">
                            <img
                              src={stats.companyDetails.avatar_photo || '/default-company.png'}
                              alt={stats.companyDetails.companyName}
                              className="w-20 h-20 rounded-lg object-cover"
                            />
                          </div>
                          <div className="flex-grow text-left sm:text-left">
                            <h2 className="text-2xl font-semibold text-gray-800">
                              {stats.companyDetails.companyName}
                            </h2>
                          </div>
                        </div>
                        
                        {/* Contact information in a separate section */}
                        <div className="w-full grid grid-cols-1 gap-3">
                          <div className="flex items-center text-gray-600">
                            <Building2 className="h-4 w-4 mr-2 flex-shrink-0" />
                            <span className="truncate">{stats.companyDetails.address}</span>
                          </div>
                          <div className="flex items-center text-gray-600">
                            <Mail className="h-4 w-4 mr-2 flex-shrink-0" />
                            <span className="truncate">{stats.companyDetails.contact_email}</span>
                          </div>
                          <div className="flex items-center text-gray-600">
                            <Phone className="h-4 w-4 mr-2 flex-shrink-0" />
                            <span className="truncate">{stats.companyDetails.contact_phone}</span>
                          </div>
                        </div>
                        
                        {/* Description at the bottom */}
                        <div className="mt-2">
                          <p className="text-gray-600 break-words">{stats.companyDetails.description}</p>
                        </div>
                      </div>
                    </Card>
        )}

        {/* Requirements Checklist Section */}
        {stats?.companyDetails?.list_of_requirements && (
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Requirements Checklist</h3>
              <FileText className="h-5 w-5 text-gray-400" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {JSON.parse(stats.companyDetails.list_of_requirements).map((req, index) => (
                <div
                  key={index}
                  className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg"
                >
                  <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
                  <div>
                    <p className="font-medium">{req.label}</p>
                    {req.description && (
                      <p className="text-sm text-gray-500">{req.description}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <StatCard
          title="Active Interns"
          value={stats?.internStats.active}
          icon={<Users className="h-6 w-6" />}
          change={stats?.internStats.change}
        />
        <StatCard
          title="Pending DTRs"
          value={stats?.dtrStats.pending}
          icon={<Clock className="h-6 w-6" />}
          alert={stats?.dtrStats.urgent}
        />
        <StatCard
          title="Requirements Progress"
          value={`${stats?.requirementStats.completed}%`}
          icon={<ClipboardCheck className="h-6 w-6" />}
        />
        <StatCard
          title="Emergency Reports"
          value={stats?.emergencyStats.total}
          icon={<AlertTriangle className="h-6 w-6" />}
          alert={stats?.emergencyStats.urgent}
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        {/* Intern Progress Chart */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Intern Progress</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={stats?.progressData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="week" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="hoursCompleted" stroke="#2563eb" />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* Requirements Status */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Requirements Status</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={stats?.requirementDistribution}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label
              >
                {stats?.requirementDistribution.map((entry, index) => (
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
          <h3 className="text-lg font-semibold mb-4">Recent Updates</h3>
          <div className="space-y-4">
            {stats?.recentActivities.map((activity, index) => (
              <div key={index} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                <Activity className="h-5 w-5 text-blue-500 mt-1" />
                <div>
                  <p className="text-sm font-medium">{activity.action}</p>
                  <p className="text-xs text-gray-500">{activity.details}</p>
                  <p className="text-xs text-gray-400">{activity.timestamp}</p>
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
              {change}% from last week
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

export default HTEHome; 