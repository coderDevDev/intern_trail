import React, { useState, useEffect } from 'react';
import { format, addDays, startOfMonth, endOfMonth, startOfWeek, endOfWeek, getWeek, differenceInCalendarWeeks } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Calendar } from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { toast } from 'react-toastify';
import { Check, CheckCircle, Save, MessageCircle, FileText, Printer, Clock, Edit2, Eye, Download, Award } from 'lucide-react';
import FeedbackThread from './FeedbackThread';
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Avatar } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import WeeklyReport from './WeeklyReport';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import EvaluationForm from '@/components/EvaluationForm/EvaluationForm';
import CertificateUpload from '@/components/CertificateUpload/CertificateUpload';

function StudentDTR() {
  const { studentId } = useParams();

  const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));

  const showButtons = !studentId || loggedInUser.userID === studentId;

  const [records, setRecords] = useState({});
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [timeIn, setTimeIn] = useState('08:00');
  const [timeOut, setTimeOut] = useState('17:00');
  const [dailyHours, setDailyHours] = useState('0.00');
  const [monthlyHours, setMonthlyHours] = useState('0.00');
  const [dailyReport, setDailyReport] = useState('');
  const [weeklyReport, setWeeklyReport] = useState([]);
  const [editedReports, setEditedReports] = useState({});
  const [narrativeReport, setNarrativeReport] = useState('');
  const [activeTab, setActiveTab] = useState('reports');
  const [weeklyFeedback, setWeeklyFeedback] = useState({});
  const [currentFeedback, setCurrentFeedback] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isReportEdited, setIsReportEdited] = useState({});
  const [isNarrativeEdited, setIsNarrativeEdited] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [evaluation, setEvaluation] = useState(null);
  const [certificate, setCertificate] = useState(null);
  const [studentData, setStudentData] = useState(null);
  const [isEvaluationOpen, setIsEvaluationOpen] = useState(false);

  useEffect(() => {
    const storedRecords = JSON.parse(localStorage.getItem('dtrRecords')) || {};
    setRecords(storedRecords);
  }, []);

  useEffect(() => {
    localStorage.setItem('dtrRecords', JSON.stringify(records));
  }, [records]);

  useEffect(() => {
    const record = records[format(selectedDate, 'yyyy-MM-dd')];
    setTimeIn(record?.timeIn ? format(new Date(record.timeIn), 'HH:mm') : '08:00');
    setTimeOut(record?.timeOut ? format(new Date(record.timeOut), 'HH:mm') : '17:00');
    setDailyReport(record?.report || '');
    setDailyHours(calculateDailyHours(selectedDate));
    setMonthlyHours(calculateMonthlyHours());
    setWeeklyReport(generateWeeklyReport());
  }, [selectedDate, records]);

  useEffect(() => {
    const fetchWeeklyData = async () => {
      try {
        const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));

        // Get the week number relative to the month
        const weekNumber = differenceInCalendarWeeks(
          selectedDate,
          startOfMonth(selectedDate),
          { weekStartsOn: 1 }
        ) + 1;

        const response = await axios.get(`/company/weekly-report/${studentId || loggedInUser.userID}/${weekNumber}`);

        if (response.data.success) {
          const { weeklyReport, weeklyFeedback } = response.data.data;

          // Generate the complete week template
          const start = startOfWeek(selectedDate, { weekStartsOn: 1 }); // Start from Monday
          const end = endOfWeek(selectedDate, { weekStartsOn: 1 }); // End on Sunday
          const completeWeekReport = [];

          // Fill in all weekdays
          for (let date = start; date <= end; date = addDays(date, 1)) {
            const dayOfWeek = date.getDay();
            if (dayOfWeek === 0 || dayOfWeek === 6) continue; // Skip weekends

            const formattedDate = format(date, 'yyyy-MM-dd');

            // Find if we have data for this date
            const existingReport = weeklyReport.find(
              report => format(new Date(report.date), 'yyyy-MM-dd') === formattedDate
            );

            if (existingReport) {
              // Use existing data
              completeWeekReport.push({
                ...existingReport,
                date: formattedDate,
                timeIn: existingReport.timeIn || 'N/A',
                timeOut: existingReport.timeOut || 'N/A',
                report: existingReport.report || '',
                narrative: existingReport.narrative || ''
              });
            } else {
              // Create empty entry for this date
              completeWeekReport.push({
                date: formattedDate,
                day: format(date, 'EEEE'),
                report: '',
                timeIn: 'N/A',
                timeOut: 'N/A',
                weekNumber,
                narrative: ''
              });
            }
          }

          console.log({ completeWeekReport });
          setWeeklyReport(completeWeekReport);
          setWeeklyFeedback(weeklyFeedback);

          // Set narrative report if available from any entry
          const anyReportWithNarrative = completeWeekReport.find(report => report.narrative);
          if (anyReportWithNarrative) {
            setNarrativeReport(anyReportWithNarrative.narrative);
          }

          // Find today's report to set time inputs
          const todayReport = completeWeekReport.find(
            report => format(new Date(report.date), 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd')
          );

          if (todayReport) {
            setTimeIn(todayReport.timeIn);
            setTimeOut(todayReport.timeOut);
            setDailyHours(calculateHours(todayReport.timeIn, todayReport.timeOut).toFixed(2));
          }

          // Calculate total hours
          const totalWeekHours = completeWeekReport.reduce((total, report) => {
            return total + calculateHours(report.timeIn, report.timeOut);
          }, 0);

          setMonthlyHours(totalWeekHours.toFixed(2));
        }
      } catch (error) {
        console.error('Error fetching weekly data:', error);
        toast.error('Failed to fetch weekly report data');
      }
    };

    fetchWeeklyData();
  }, [selectedDate]);

  useEffect(() => {
    const fetchEvaluationAndCertificate = async () => {
      try {
        // Fetch evaluation data
        const evaluationResponse = await axios.get(`/evaluations/${studentId || loggedInUser.userID}`);
        if (evaluationResponse.data.success && evaluationResponse.data.data) {
          setEvaluation(evaluationResponse.data.data);
        } else {
          setEvaluation(null);
        }

        // Fetch certificates
        const certificateResponse = await axios.get(`/certificates/${studentId || loggedInUser.userID}`);
        if (certificateResponse.data.success) {
          setCertificate(certificateResponse.data.data);
        } else {
          setCertificate(null);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        setEvaluation(null);
        setCertificate(null);
      }
    };

    fetchEvaluationAndCertificate();
  }, [studentId, loggedInUser.userID]);

  // useEffect(() => {
  //   const fetchStudentData = async () => {
  //     try {
  //       const response = await axios.get(`/students/${studentId || loggedInUser.userID}`);
  //       if (response.data.success) {
  //         setStudentData({
  //           ...response.data.data,
  //           userID: studentId || loggedInUser.userID,
  //           first_name: response.data.data.firstName,
  //           last_name: response.data.data.lastName,
  //           progName: response.data.data.program,
  //           collegeName: response.data.data.college
  //         });
  //       }
  //     } catch (error) {
  //       console.error("Error fetching student data:", error);
  //     }
  //   };

  //   fetchStudentData();
  // }, [studentId, loggedInUser.userID]);

  const handleTimeInChange = (e) => {
    setTimeIn(e.target.value);
    const newTimeIn = new Date(selectedDate);
    const [hours, minutes] = e.target.value.split(':');
    newTimeIn.setHours(hours, minutes);
    // setRecords((prev) => ({
    //   ...prev,
    //   [format(selectedDate, 'yyyy-MM-dd')]: {
    //     ...prev[format(selectedDate, 'yyyy-MM-dd')],
    //     timeIn: newTimeIn,
    //   },
    // }));
    setDailyHours(calculateDailyHours(selectedDate));
    setMonthlyHours(calculateMonthlyHours());
  };

  const handleTimeOutChange = (e) => {
    setTimeOut(e.target.value);
    const newTimeOut = new Date(selectedDate);
    const [hours, minutes] = e.target.value.split(':');
    newTimeOut.setHours(hours, minutes);
    if (newTimeOut < new Date(records[format(selectedDate, 'yyyy-MM-dd')].timeIn)) {
      toast.error('Time-out cannot be earlier than time-in.');
      return;
    }
    setRecords((prev) => ({
      ...prev,
      [format(selectedDate, 'yyyy-MM-dd')]: {
        ...prev[format(selectedDate, 'yyyy-MM-dd')],
        timeOut: newTimeOut,
      },
    }));
    setDailyHours(calculateDailyHours(selectedDate));
    setMonthlyHours(calculateMonthlyHours());
  };

  const handleDeleteRecord = () => {
    setRecords((prev) => {
      const updatedRecords = { ...prev };
      delete updatedRecords[format(selectedDate, 'yyyy-MM-dd')];
      return updatedRecords;
    });
    setTimeIn('08:00');
    setTimeOut('17:00');
    setDailyReport('');
    setDailyHours('0.00');
    setMonthlyHours(calculateMonthlyHours());
    setWeeklyReport(generateWeeklyReport());
    toast.success('Record deleted successfully.');
  };

  const handleReportSubmit = () => {
    setRecords((prev) => ({
      ...prev,
      [format(selectedDate, 'yyyy-MM-dd')]: {
        ...prev[format(selectedDate, 'yyyy-MM-dd')],
        report: dailyReport,
      },
    }));
    toast.success('Daily report submitted successfully.');
  };

  const calculateDailyHours = (date) => {
    const record = records[format(date, 'yyyy-MM-dd')];
    if (!record || !record.timeIn || !record.timeOut) return '0.00';
    const timeIn = new Date(record.timeIn);
    const timeOut = new Date(record.timeOut);
    const hours = (timeOut - timeIn) / (1000 * 60 * 60);
    return hours.toFixed(2);
  };

  const calculateMonthlyHours = () => {
    const monthStart = startOfMonth(selectedDate);
    const monthEnd = endOfMonth(selectedDate);
    let totalHours = 0;
    for (let date = monthStart; date <= monthEnd; date = addDays(date, 1)) {
      totalHours += parseFloat(calculateDailyHours(date));
    }
    return totalHours.toFixed(2);
  };

  const generateWeeklyReport = () => {
    const start = startOfWeek(selectedDate, { weekStartsOn: 1 });
    const end = endOfWeek(selectedDate, { weekStartsOn: 1 });

    // Calculate week number relative to the month
    const weekNumber = differenceInCalendarWeeks(
      selectedDate,
      startOfMonth(selectedDate),
      { weekStartsOn: 1 }
    ) + 1;

    const report = [];

    for (let date = start; date <= end; date = addDays(date, 1)) {
      const dayOfWeek = date.getDay();
      if (dayOfWeek === 0 || dayOfWeek === 6) continue; // Skip Sunday (0) and Saturday (6)

      report.push({
        date: format(date, 'yyyy-MM-dd'),
        day: format(date, 'EEEE'),
        report: '',
        timeIn: 'N/A',
        timeOut: 'N/A',
        weekNumber,
        narrative: ''
      });
    }
    return report;
  };

  const isWeekend = (date) => {
    const day = date.getDay();
    return day === 0 || day === 6; // 0 = Sunday, 6 = Saturday
  };

  const updateReport = (date, value) => {
    setIsReportEdited(prev => ({
      ...prev,
      [date]: value !== weeklyReport.find(r => r.date === date)?.report
    }));

    // Update the report in weeklyReport
    setWeeklyReport(prev =>
      prev.map(entry =>
        entry.date === date ? { ...entry, report: value } : entry
      )
    );
  };

  const handleNarrativeChange = (value) => {
    setIsNarrativeEdited(value !== narrativeReport);
    setNarrativeReport(value);
  };

  const handleAccomplishmentSubmit = (date, report) => {
    setRecords((prev) => ({
      ...prev,
      [date]: {
        ...prev[date],
        report,
      },
    }));
    toast.success('Accomplishment added successfully!');
    setEditedReports((prev) => ({
      ...prev,
      [date]: false,
    }));
  };

  const handleNarrativeSubmit = (weekNumber) => {
    setRecords((prev) => {
      const updatedRecords = { ...prev };
      weeklyReport.forEach((entry) => {
        if (entry.weekNumber === weekNumber) {
          updatedRecords[entry.date] = {
            ...updatedRecords[entry.date],
            narrative: narrativeReport,
          };
        }
      });
      return updatedRecords;
    });
    setNarrativeReport(narrativeReport)
    toast.success('Weekly narrative report added successfully!');
  };

  const handleSave = async (date, report) => {
    try {
      const weekNumber = differenceInCalendarWeeks(
        new Date(date),
        startOfMonth(new Date(date)),
        { weekStartsOn: 1 }
      ) + 1;

      await axios.post('/company/daily-report', {
        date,
        report,
        timeIn,
        timeOut,
        weekNumber,
        narrative: narrativeReport
      });

      // Reset edit states
      setIsReportEdited(prev => ({
        ...prev,
        [date]: false
      }));
      setIsNarrativeEdited(false);

      // Generate AI feedback
      const allReports = weeklyReport.map(r => r.report).join('\n');
      const aiResponse = await axios.post('/company/generate-feedback', {
        dailyReports: allReports,
        narrativeReport,
        weekNumber
      });

      if (aiResponse.data.success) {
        await axios.post('/company/weekly-feedback', {
          studentId: studentId || JSON.parse(localStorage.getItem('loggedInUser')).userID,
          weekNumber,
          feedback: aiResponse.data.feedback,
          fromAI: true
        });
      }

      // Refresh data
      await refreshWeeklyData(weekNumber);

      toast.success('Report saved successfully!');
    } catch (error) {
      console.error('Error saving report:', error);
      toast.error('Failed to save report');
    }
  };

  const handleAddFeedback = () => {
    toast.info('Feedback added!');
  };

  const handleFeedbackSubmit = async (weekNumber) => {
    try {
      if (!currentFeedback.trim()) {
        toast.warning('Please enter feedback before submitting');
        return;
      }

      const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
      const weekNum = differenceInCalendarWeeks(
        selectedDate,
        startOfMonth(selectedDate),
        { weekStartsOn: 1 }
      ) + 1;

      await axios.post('/company/weekly-feedback', {
        studentId: studentId || loggedInUser.userID,
        weekNumber: weekNum,
        feedback: currentFeedback,
        fromAI: false
      });

      // Clear feedback input
      setCurrentFeedback('');

      // Refresh data
      await refreshWeeklyData(weekNum);

      toast.success('Feedback submitted successfully!');
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast.error('Failed to submit feedback');
    }
  };

  const refreshWeeklyData = async (weekNumber) => {
    try {
      const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
      const response = await axios.get(`/company/weekly-report/${studentId || loggedInUser.userID}/${weekNumber}`);

      if (response.data.success) {
        const { weeklyReport, weeklyFeedback } = response.data.data;

        // Generate complete week template with existing data
        const start = startOfWeek(selectedDate, { weekStartsOn: 1 });
        const end = endOfWeek(selectedDate, { weekStartsOn: 1 });
        const completeWeekReport = [];

        for (let date = start; date <= end; date = addDays(date, 1)) {
          const dayOfWeek = date.getDay();
          if (dayOfWeek === 0 || dayOfWeek === 6) continue;

          const formattedDate = format(date, 'yyyy-MM-dd');
          const existingReport = weeklyReport.find(
            report => format(new Date(report.date), 'yyyy-MM-dd') === formattedDate
          );

          if (existingReport) {
            completeWeekReport.push({
              ...existingReport,
              date: formattedDate,
              timeIn: existingReport.timeIn || 'N/A',
              timeOut: existingReport.timeOut || 'N/A',
              report: existingReport.report || '',
              narrative: existingReport.narrative || ''
            });
          } else {
            completeWeekReport.push({
              date: formattedDate,
              day: format(date, 'EEEE'),
              report: '',
              timeIn: 'N/A',
              timeOut: 'N/A',
              weekNumber,
              narrative: ''
            });
          }
        }

        setWeeklyReport(completeWeekReport);
        setWeeklyFeedback(weeklyFeedback);
      }
    } catch (error) {
      console.error('Error refreshing data:', error);
      toast.error('Failed to refresh data');
    }
  };

  const calculateHours = (timeIn, timeOut) => {
    if (timeIn === 'N/A' || timeOut === 'N/A') return 0;

    const [inHours, inMinutes] = timeIn.split(':').map(Number);
    const [outHours, outMinutes] = timeOut.split(':').map(Number);

    let totalMinutes = (outHours * 60 + outMinutes) - (inHours * 60 + inMinutes);

    // Subtract lunch break (1 hour)
    totalMinutes -= 60;

    return totalMinutes / 60;
  };

  const handleUpdateTime = async (date) => {
    try {
      const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
      const weekNumber = differenceInCalendarWeeks(
        new Date(date),
        startOfMonth(new Date(date)),
        { weekStartsOn: 1 }
      ) + 1;

      // First check if report exists for this date
      const existingReport = weeklyReport.find(
        r => r.date === format(date, 'yyyy-MM-dd') && r.report
      );

      if (existingReport) {
        // If report exists, update time only
        await axios.put('/company/daily-report/update-time', {
          date: format(date, 'yyyy-MM-dd'),
          timeIn,
          timeOut,
          studentId: studentId || loggedInUser.userID
        });
      } else {
        // If no report exists, create new one
        await axios.post('/company/daily-report', {
          date: format(date, 'yyyy-MM-dd'),
          report: '',
          timeIn,
          timeOut,
          weekNumber,
          narrative: narrativeReport
        });
      }

      // Refresh data
      await refreshWeeklyData(weekNumber);
      toast.success('Time updated successfully!');
    } catch (error) {
      console.error('Error updating time:', error);
      toast.error('Failed to update time');
    }
  };

  const handleApproveReject = (entry) => {
    setSelectedEntry(entry);
    setIsConfirmModalOpen(true);
  };

  const confirmAction = async (action) => {
    try {
      await axios.put('/company/daily-report/status', {
        date: selectedEntry.date,
        studentId: studentId || loggedInUser.userID,
        status: action
      });
      toast.success(`Entry ${action}d successfully!`);
      setIsConfirmModalOpen(false);

      // Refresh data after status update
      const weekNumber = differenceInCalendarWeeks(
        new Date(selectedEntry.date),
        startOfMonth(new Date(selectedEntry.date)),
        { weekStartsOn: 1 }
      ) + 1;
      await refreshWeeklyData(weekNumber);
    } catch (error) {
      console.error('Error updating entry status:', error);
      toast.error('Failed to update entry status');
    }
  };

  const renderReportsTab = () => (
    <div className="space-y-4">
      {weeklyReport.map((entry, index) => (
        <Card key={index} className="overflow-hidden border border-gray-100 hover:shadow-sm transition-all duration-200">
          <CardHeader className="bg-gray-50/50 pb-3">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h3 className="font-medium text-gray-900">{entry.day}</h3>
                <p className="text-sm text-gray-500">{format(new Date(entry.date), 'MMMM d, yyyy')}</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="text-sm text-gray-600">
                  {entry.timeIn} - {entry.timeOut}
                </div>
                <Badge
                  className={`px-2 py-1 text-xs font-medium ${entry.status === 'approve'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : entry.status === 'reject'
                      ? 'bg-rose-50 text-rose-700 border-rose-200'
                      : 'bg-amber-50 text-amber-700 border-amber-200'
                    }`}
                  variant="outline"
                >
                  {entry.status || 'Pending'}
                </Badge>
                {!showButtons && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleApproveReject(entry)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <Textarea
              value={entry.report}
              onChange={(e) => updateReport(entry.date, e.target.value)}
              placeholder="Add your daily report here..."
              className="min-h-[100px] resize-none focus:ring-1 focus:ring-blue-200"
            />
            {showButtons && isReportEdited[entry.date] && (
              <Button
                className="mt-3 bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200"
                size="sm"
                onClick={() => handleSave(entry.date, entry.report)}
              >
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </Button>
            )}
          </CardContent>
        </Card>
      ))}

      <Card className="border border-gray-100 mt-6">
        <CardHeader className="bg-gray-50/50">
          <h3 className="font-medium text-gray-900">Weekly Narrative Report</h3>
        </CardHeader>
        <CardContent className="pt-4">
          <Textarea
            value={narrativeReport}
            onChange={(e) => handleNarrativeChange(e.target.value)}
            placeholder="Add your weekly narrative report here..."
            className="min-h-[150px] resize-none focus:ring-1 focus:ring-blue-200"
          />
          {showButtons && isNarrativeEdited && (
            <Button
              className="mt-3 bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200"
              onClick={() => handleSave(format(selectedDate, 'yyyy-MM-dd'), null)}
            >
              <Save className="w-4 h-4 mr-2" />
              Save Narrative
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );

  const renderFeedbacksTab = () => (
    <div className="space-y-4">
      {(weeklyFeedback[weeklyReport[0]?.weekNumber] || []).map((feedback, index) => (
        <Card key={index} className="border border-gray-100 hover:shadow-sm transition-all duration-200">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="w-8 h-8 bg-gray-100 flex items-center justify-center">
                  <span className="text-sm font-medium text-gray-600">
                    {feedback.fullName
                      ? feedback.fullName
                        .split(' ')
                        .map((name) => name.charAt(0).toUpperCase())
                        .join('')
                      : feedback.role?.charAt(0).toUpperCase()}
                  </span>
                </Avatar>


                <div>
                  {feedback.role === 'AI' ? (
                    <p className="text-sm text-gray-600">AI Assistant</p>
                  ) : (
                    <p className="font-medium text-gray-900">{feedback.fullName}</p>
                  )}
                  <Badge
                    className="mt-1 bg-gray-50 text-gray-600 border-gray-200"
                    variant="outline"
                  >
                    {feedback.role}
                  </Badge>
                </div>
              </div>
              <Badge
                variant="outline"
                className="bg-gray-50 text-gray-600 border-gray-200"
              >
                {format(new Date(feedback.date), 'MMM d, yyyy')}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 whitespace-pre-line">{feedback.feedback}</p>
          </CardContent>
        </Card>
      ))}

      <Card className="border border-gray-100 mt-6">
        <CardHeader className="bg-gray-50/50">
          <h3 className="font-medium text-gray-900">Add Feedback</h3>
        </CardHeader>
        <CardContent className="pt-4">
          <Textarea
            value={currentFeedback}
            onChange={(e) => setCurrentFeedback(e.target.value)}
            placeholder="Write your feedback here..."
            className="min-h-[100px] resize-none focus:ring-1 focus:ring-blue-200"
          />
          <Button
            className="mt-3 bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200"
            onClick={() => handleFeedbackSubmit(weeklyReport[0]?.weekNumber)}
          >
            <MessageCircle className="w-4 h-4 mr-2" />
            Submit Feedback
          </Button>
        </CardContent>
      </Card>
    </div>
  );

  const renderEvaluationTab = () => (
    <div className="space-y-4">
      {evaluation ? (
        <Card className="border border-gray-100">
          <CardHeader className="bg-gray-50/50">
            <h3 className="font-medium text-gray-900">Performance Evaluation</h3>
          </CardHeader>
          <CardContent className="pt-4">
            <Button
              onClick={() => setIsEvaluationOpen(true)}
              className="w-full bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200"
            >
              View Evaluation
            </Button>


            <EvaluationForm
              isOpen={isEvaluationOpen}
              onClose={() => setIsEvaluationOpen(false)}
              student={evaluation}
              existingData={evaluation}
              isReadOnly={true}
            />

          </CardContent>
        </Card>
      ) : (
        <div className="text-center py-8 text-gray-500">
          No evaluation available yet
        </div>
      )}
    </div>
  );

  const renderCertificateTab = () => (
    <div className="space-y-4">
      {certificate ? (
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Uploaded Certificates</h3>
          {certificate.map((cert) => (
            <Card key={cert.id} className="border border-gray-100 hover:shadow-md transition-all duration-200">
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium">{cert.name}</h4>
                    <p className="text-sm text-gray-500">
                      Uploaded on {new Date(cert.created_at).toLocaleDateString()} by {cert.first_name} {cert.last_name}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(cert.file_url, '_blank')}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const link = document.createElement('a');
                        link.href = cert.file_url;
                        link.download = cert.name;
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                      }}
                    >
                      <Download className="h-4 w-4 mr-1" />
                      Download
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 border rounded-lg bg-gray-50">
          <Award className="h-12 w-12 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-500">No certificates available yet</p>
        </div>
      )}
    </div>
  );

  const handlePrintClick = () => {
    setIsDialogOpen(true);
  };

  console.log({ weeklyReport, weeklyFeedback });
  return (
    <div className="container mx-auto p-4 max-w-7xl">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-1 space-y-6">
          {/* Progress Overview */}
          <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">Progress Overview</h2>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePrintClick}
                  className="flex items-center gap-2"
                >
                  <Printer className="h-4 w-4" /> Print Report
                </Button>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Monthly Progress</span>
                    <span className="font-medium">{monthlyHours}/360 hours</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min((parseFloat(monthlyHours) / 360) * 100, 100)}%` }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-blue-50 p-3 rounded-lg text-center">
                    <p className="text-sm text-blue-600">Daily</p>
                    <p className="text-lg font-bold text-blue-700">{dailyHours}h</p>
                  </div>
                  <div className="bg-green-50 p-3 rounded-lg text-center">
                    <p className="text-sm text-green-600">Weekly</p>
                    <p className="text-lg font-bold text-green-700">
                      {weeklyReport.reduce((total, entry) =>
                        total + calculateHours(entry.timeIn, entry.timeOut), 0).toFixed(2)}h
                    </p>
                  </div>
                  <div className="bg-purple-50 p-3 rounded-lg text-center">
                    <p className="text-sm text-purple-600">Monthly</p>
                    <p className="text-lg font-bold text-purple-700">{monthlyHours}h</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Calendar */}
          <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <Calendar
                onChange={setSelectedDate}
                value={selectedDate}
                className="w-full border-none"
                tileClassName={({ date }) => {
                  const formattedDate = format(date, 'yyyy-MM-dd');
                  const entry = weeklyReport?.find(r => r?.date === formattedDate);
                  return `
                    ${entry?.status === 'approve' ? 'bg-green-50 hover:bg-green-100' : ''}
                    ${entry?.status === 'reject' ? 'bg-red-50 hover:bg-red-100' : ''}
                    ${entry && !entry.status ? 'bg-yellow-50 hover:bg-yellow-100' : ''}
                    rounded-lg transition-colors
                  `;
                }}
                tileContent={({ date }) => {
                  if (!weeklyReport) return null;

                  const formattedDate = format(date, 'yyyy-MM-dd');
                  const entry = weeklyReport.find(r => r?.date === formattedDate);

                  if (entry && entry.timeIn && entry.timeOut &&
                    entry.timeIn !== 'N/A' && entry.timeOut !== 'N/A') {
                    return (
                      <div className="text-xs mt-1 font-medium text-gray-600">
                        {calculateHours(entry.timeIn, entry.timeOut).toFixed(1)}h
                      </div>
                    );
                  }
                  return null;
                }}
                tileDisabled={({ date }) => date.getDay() === 0 || date.getDay() === 6}
              />
            </CardContent>
          </Card>

          {/* Time Entry */}
          <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">Time Entry</h2>
                <Badge variant="outline" className="text-sm">
                  {format(selectedDate, 'EEEE, MMMM d')}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Time In</label>
                  <input
                    type="time"
                    value={timeIn}
                    onChange={handleTimeInChange}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Time Out</label>
                  <input
                    type="time"
                    value={timeOut}
                    onChange={handleTimeOutChange}
                    disabled={!timeIn}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                  />
                </div>
              </div>

              {showButtons && (
                <Button
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white transition-colors"
                  onClick={() => handleUpdateTime(selectedDate)}
                  disabled={!timeIn}
                >
                  <Clock className="h-4 w-4 mr-2" />
                  Update Time
                </Button>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-2">
          <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">Reports & Feedback</h2>
                <div className="inline-flex rounded-lg border border-gray-200 overflow-hidden">
                  <button
                    className={`px-4 py-2 text-sm font-medium transition-colors
                      ${activeTab === 'reports'
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-gray-700 hover:bg-gray-50'
                      }`}
                    onClick={() => setActiveTab('reports')}
                  >
                    Reports
                  </button>
                  <button
                    className={`px-4 py-2 text-sm font-medium transition-colors
                      ${activeTab === 'feedbacks'
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-gray-700 hover:bg-gray-50'
                      }`}
                    onClick={() => setActiveTab('feedbacks')}
                  >
                    Feedbacks
                  </button>
                  <button
                    className={`px-4 py-2 text-sm font-medium transition-colors
                      ${activeTab === 'evaluation'
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-gray-700 hover:bg-gray-50'
                      }`}
                    onClick={() => setActiveTab('evaluation')}
                  >
                    Evaluation
                  </button>
                  <button
                    className={`px-4 py-2 text-sm font-medium transition-colors
                      ${activeTab === 'certificate'
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-gray-700 hover:bg-gray-50'
                      }`}
                    onClick={() => setActiveTab('certificate')}
                  >
                    Certificate
                  </button>
                </div>
              </div>

              {activeTab === 'reports' ? renderReportsTab() : activeTab === 'feedbacks' ? renderFeedbacksTab() : activeTab === 'evaluation' ? renderEvaluationTab() : renderCertificateTab()}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Keep all existing dialogs unchanged */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[925px] h-screen overflow-y-auto">
          <DialogHeader>
            <DialogDescription>
            </DialogDescription>
          </DialogHeader>
          <div className="">
            <WeeklyReport weeklyReport={weeklyReport} />
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isConfirmModalOpen} onOpenChange={setIsConfirmModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Action</DialogTitle>
          </DialogHeader>
          <p>Are you sure you want to approve or reject this entry?</p>
          <DialogFooter>
            <Button onClick={() => confirmAction('approve')} className="bg-blue-500 text-white">Approve</Button>
            <Button onClick={() => confirmAction('reject')} className="bg-red-500 text-white">Reject</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default StudentDTR;