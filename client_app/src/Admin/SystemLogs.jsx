// src/Admin/SystemLogs.js

import React, { useState, useEffect } from 'react';
import {
  AlertCircle,
  AlertTriangle,
  Info,
  CheckCircle,
  Search,
  Filter,
  Download,
  RefreshCw,
  Clock,
  User,
  Activity,
  Shield,
  Globe,
  Calendar
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from 'react-toastify';
import axios from 'axios';

function SystemLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedTimeRange, setSelectedTimeRange] = useState('24h');
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedLog, setSelectedLog] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [typeCounts, setTypeCounts] = useState({});
  const [pagination, setPagination] = useState({});
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchLogs();
    let interval;
    if (autoRefresh) {
      interval = setInterval(fetchLogs, 30000); // Refresh every 30 seconds
    }
    return () => clearInterval(interval);
  }, [selectedType, selectedTimeRange, autoRefresh]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/system-logs', {
        params: {
          type: selectedType,
          timeRange: selectedTimeRange,
          page: currentPage,
          limit: 50
        }
      });

      setLogs(response.data.data.logs);
      setTypeCounts(response.data.data.summary.typeCounts);
      setPagination(response.data.data.pagination);
    } catch (error) {
      console.error('Error fetching logs:', error);
      toast.error('Failed to fetch system logs');
    } finally {
      setLoading(false);
    }
  };

  const getLogTypeIcon = (type) => {
    switch (type.toLowerCase()) {
      case 'error': return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'info': return <Info className="h-4 w-4 text-blue-500" />;
      case 'success': return <CheckCircle className="h-4 w-4 text-green-500" />;
      default: return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const getLogTypeBadge = (type) => {
    switch (type.toLowerCase()) {
      case 'error': return 'bg-red-100 text-red-800 border-red-200';
      case 'warning': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'info': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'success': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const handleLogClick = (log) => {
    setSelectedLog(log);
    setIsDetailModalOpen(true);
  };

  const exportLogs = () => {
    const csv = logs.map(log =>
      `${log.timestamp},${log.type},${log.user},${log.action},${log.details}`
    ).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `system-logs-${new Date().toISOString()}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const filteredLogs = logs.filter(log =>
    Object.values(log).some(value =>
      value.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  // Add these imports for additional cards
  const statCards = [
    {
      title: 'Error Logs',
      icon: <AlertCircle className="h-5 w-5" />,
      color: 'red',
      key: 'error'
    },
    {
      title: 'Warning Logs',
      icon: <AlertTriangle className="h-5 w-5" />,
      color: 'yellow',
      key: 'warning'
    },
    {
      title: 'Info Logs',
      icon: <Info className="h-5 w-5" />,
      color: 'blue',
      key: 'info'
    },
    {
      title: 'Success Logs',
      icon: <CheckCircle className="h-5 w-5" />,
      color: 'green',
      key: 'success'
    }
  ];

  return (
    <div className="mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">System Logs</h1>
          <p className="text-gray-500">Monitor and analyze system activities</p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          <Button
            variant="outline"
            className={`${autoRefresh ? 'bg-blue-50 text-blue-600 border-blue-200' : ''} w-full sm:w-auto`}
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${autoRefresh ? 'animate-spin' : ''}`} />
            {autoRefresh ? 'Auto-refresh On' : 'Auto-refresh Off'}
          </Button>
          <Button 
            variant="outline" 
            className="w-full sm:w-auto" 
            onClick={exportLogs}
          >
            <Download className="h-4 w-4 mr-2" />
            Export Logs
          </Button>
        </div>
                
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {statCards.map(({ title, icon, color, key }) => (
          <div key={key} className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div className={`text-${color}-500 bg-${color}-50 p-2 rounded`}>
                {icon}
              </div>
              <Badge className={`bg-${color}-100 text-${color}-800 border border-${color}-200`}>
                Last 24h
              </Badge>
            </div>
            <h3 className="text-2xl font-semibold mt-2">{typeCounts[key] || 0}</h3>
            <p className="text-gray-500 text-sm">{title}</p>
            <div className="mt-2 pt-2 border-t border-gray-100">
              <span className="text-xs text-gray-500 flex items-center">
                <Clock className="h-3 w-3 mr-1" />
                Updated {new Date().toLocaleTimeString()}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="p-4 border-b border-gray-200">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <div className="flex-1 w-full md:w-auto">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search logs by user, action, or details..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full"
                />
              </div>
            </div>
            <div className="flex gap-2 w-full md:w-auto">
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger className="w-[180px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="error">
                    <span className="flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-red-500" />
                      Errors
                    </span>
                  </SelectItem>
                  <SelectItem value="warning">
                    <span className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-yellow-500" />
                      Warnings
                    </span>
                  </SelectItem>
                  <SelectItem value="info">
                    <span className="flex items-center gap-2">
                      <Info className="h-4 w-4 text-blue-500" />
                      Info
                    </span>
                  </SelectItem>
                  <SelectItem value="success">
                    <span className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Success
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
              <Select value={selectedTimeRange} onValueChange={setSelectedTimeRange}>
                <SelectTrigger className="w-[180px]">
                  <Calendar className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Time range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1h">Last Hour</SelectItem>
                  <SelectItem value="24h">Last 24 Hours</SelectItem>
                  <SelectItem value="7d">Last 7 Days</SelectItem>
                  <SelectItem value="30d">Last 30 Days</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Type</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Timestamp</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">User</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Action</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">IP Address</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-4 py-8">
                    <div className="flex justify-center items-center text-gray-500">
                      <RefreshCw className="h-5 w-5 animate-spin mr-2" />
                      Loading logs...
                    </div>
                  </td>
                </tr>
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-4 py-8">
                    <div className="flex flex-col items-center justify-center text-gray-500">
                      <Activity className="h-8 w-8 mb-2" />
                      <p>No logs found</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log, index) => (
                  <tr
                    key={index}
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => handleLogClick(log)}
                  >
                    <td className="px-4 py-3">
                      <Badge className={getLogTypeBadge(log.type)}>
                        <span className="flex items-center gap-1">
                          {getLogTypeIcon(log.type)}
                          {log.type}
                        </span>
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {new Date(log.created_at).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-sm">{log.user_name}</td>
                    <td className="px-4 py-3 text-sm">{log.action}</td>
                    <td className="px-4 py-3 text-sm">{log.ip_address}</td>
                    <td className="px-4 py-3 text-sm truncate max-w-xs">{log.details}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {pagination.total > pagination.limit && (
          <div className="px-4 py-3 border-t border-gray-200">
            {/* Add pagination controls here */}
          </div>
        )}
      </div>

      {/* Log Detail Modal */}
      <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Log Details</DialogTitle>
          </DialogHeader>
          {selectedLog && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-500">Type</label>
                  <Badge className={`${getLogTypeBadge(selectedLog.type)} mt-1`}>
                    <span className="flex items-center gap-1">
                      {getLogTypeIcon(selectedLog.type)}
                      {selectedLog.type}
                    </span>
                  </Badge>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Timestamp</label>
                  <p className="font-medium">
                    {new Date(selectedLog.created_at).toLocaleString()}
                  </p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">User</label>
                  <p className="font-medium">{selectedLog.user_name}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">IP Address</label>
                  <p className="font-medium">{selectedLog.ip_address}</p>
                </div>
              </div>
              <div>
                <label className="text-sm text-gray-500">Action</label>
                <p className="font-medium">{selectedLog.action}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Details</label>
                <pre className="mt-1 whitespace-pre-wrap bg-gray-50 p-3 rounded-lg text-sm">
                  {selectedLog.details}
                </pre>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default SystemLogs;
