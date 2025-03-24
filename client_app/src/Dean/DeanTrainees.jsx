import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Search,
  SlidersHorizontal,
  GraduationCap,
  Building2,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ChevronDown
} from 'lucide-react';
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

function DeanTrainees() {
  const [trainees, setTrainees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterProgram, setFilterProgram] = useState('all');
  const [programs, setPrograms] = useState(new Set());

  useEffect(() => {
    fetchTrainees();
  }, []);

  const fetchTrainees = async () => {
    try {
      const response = await axios.get('/dean/trainees');
      setTrainees(response.data.data);
      // Extract unique programs
      const uniquePrograms = new Set(response.data.data.map(t => t.programName));
      setPrograms(uniquePrograms);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching trainees:', error);
      setLoading(false);
    }
  };

  const getStatusColor = (trainee) => {
    if (!trainee.deployment_date) return 'text-gray-500';
    if (trainee.certificate_uploaded) return 'text-green-500';
    if (trainee.remaining_hours <= 0) return 'text-blue-500';
    return 'text-yellow-500';
  };

  const getStatusText = (trainee) => {
    if (!trainee.deployment_date) return 'Not Deployed';
    if (trainee.certificate_uploaded) return 'Completed';
    if (trainee.remaining_hours <= 0) return 'Hours Completed';
    return 'In Progress';
  };

  const filteredTrainees = trainees.filter(trainee => {
    const matchesSearch = (
      trainee.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      trainee.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      trainee.student_id.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const matchesStatus = filterStatus === 'all' || (
      (filterStatus === 'not-deployed' && !trainee.deployment_date) ||
      (filterStatus === 'in-progress' && trainee.deployment_date && trainee.remaining_hours > 0) ||
      (filterStatus === 'completed' && trainee.certificate_uploaded)
    );

    const matchesProgram = filterProgram === 'all' || trainee.programName === filterProgram;

    return matchesSearch && matchesStatus && matchesProgram;
  });

  if (loading) {
    return <div className="flex justify-center items-center h-96">Loading...</div>;
  }

  return (
    <div className="p-0">
      <div className="flex flex-col space-y-4 mb-6">
        <h1 className="text-2xl font-semibold">Trainees</h1>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full">
          <div className="relative flex-1 min-w-0">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search trainees..."
              className="pl-10 pr-4 py-2 border rounded-lg w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="not-deployed">Not Deployed</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterProgram} onValueChange={setFilterProgram}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by program" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Programs</SelectItem>
                {Array.from(programs).map(program => (
                  <SelectItem key={program} value={program}>
                    {program}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
        {filteredTrainees.map((trainee) => (
          <Card key={trainee.traineeID} className="p-4 hover:shadow-lg transition-shadow">
            <div className="flex items-start space-x-4">
              <img
                src={trainee.avatar || '/default-avatar.png'}
                alt={`${trainee.first_name}'s avatar`}
                className="w-12 h-12 rounded-full object-cover"
              />
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold">
                      {trainee.first_name} {trainee.last_name}
                    </h3>
                    <p className="text-sm text-gray-600">{trainee.student_id}</p>
                  </div>
                  <span className={`text-sm font-medium ${getStatusColor(trainee)}`}>
                    {getStatusText(trainee)}
                  </span>
                </div>

                <div className="mt-4 space-y-2">
                  <div className="flex items-center text-sm text-gray-600">
                    <GraduationCap className="w-4 h-4 mr-2" />
                    {trainee.programName}
                  </div>

                  {trainee.companyName && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Building2 className="w-4 h-4 mr-2" />
                      {trainee.companyName}
                    </div>
                  )}

                  <div className="flex items-center text-sm text-gray-600">
                    <Clock className="w-4 h-4 mr-2" />

                    {
                      trainee.remaining_hours
                    } hours

                    {/* {trainee.total_hours_rendered} / {486 - trainee.remaining_hours} hours */}
                  </div>
                </div>

                {trainee.deployment_date && (
                  <div className="mt-4 pt-4 border-t">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Deployed since:</span>
                      <span className="font-medium">
                        {new Date(trainee.deployment_date).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default DeanTrainees;