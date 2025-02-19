import React, { useState, useEffect } from 'react';
import { format, addDays, startOfMonth, endOfMonth, startOfWeek, endOfWeek, getWeek, differenceInCalendarWeeks } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Calendar } from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { toast } from 'react-toastify';
import { Check, CheckCircle, Save, MessageCircle, FileText, Printer, Clock, Edit2 } from 'lucide-react';
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
        <Card key={index} className="overflow-hidden transition-shadow hover:shadow-lg">
          <CardHeader className="space-y-1">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-lg">{entry.day} - {format(new Date(entry.date), 'PPP')}</h3>
                <Badge className="bg-blue-500 text-white" variant="default">
                  Week {entry.weekNumber} - {entry.timeIn} - {entry.timeOut}
                </Badge>

              </div>
              <div>

                <Badge
                  className={`uppercase text-white ${entry.status === 'approve'
                    ? 'bg-green-500'
                    : entry.status === 'reject'
                      ? 'bg-red-500'
                      : 'bg-yellow-500'
                    }`}
                  variant="default"
                >
                  {entry.status || 'Pending'}
                </Badge>


                {

                  !showButtons && <Badge
                    onClick={() => handleApproveReject(entry)}
                    className="uppercase bg-gray-500 text-white" variant="default">
                    <Edit2 className="w-2 h-3" />
                  </Badge>

                }
                {/* <Button
                  className="ml-2 bg-green-500 text-white py-1 px-2 h-6"
                  onClick={() => handleApproveReject(entry)}
                >
                  <Edit2 className="w-4 h-4" />

                </Button> */}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Textarea
              value={entry.report}
              onChange={(e) => updateReport(entry.date, e.target.value)}
              placeholder="Add your report here..."
              className="mt-2 h-20"
            />
          </CardContent>
          <CardFooter className="flex justify-end gap-2">

            {
              showButtons && <Button
                className="bg-blue-500 text-white"
                variant="default"
                size="sm"
                onClick={() => handleSave(entry.date, entry.report)}
                disabled={!isReportEdited[entry.date]}
              >
                <Save className="w-4 h-4 mr-2" />
                Save Report
              </Button>
            }

          </CardFooter>
        </Card>
      ))}

      <Card className="overflow-hidden transition-shadow hover:shadow-lg">
        <CardHeader>
          <h3 className="font-semibold text-lg">Weekly Narrative Report</h3>
        </CardHeader>
        <CardContent>
          <Textarea
            value={narrativeReport}
            onChange={(e) => handleNarrativeChange(e.target.value)}
            placeholder="Add your weekly narrative report here..."
            className="mt-2 min-h-[100px]"
          />
        </CardContent>
        <CardFooter className="flex justify-end">

          {
            showButtons && <Button
              className="bg-blue-500 text-white"
              onClick={() => handleSave(format(selectedDate, 'yyyy-MM-dd'), null)}
              disabled={!isNarrativeEdited}
            >
              <Save className="w-4 h-4 mr-2" />
              Save Narrative
            </Button>
          }

        </CardFooter>
      </Card>

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

  const renderFeedbacksTab = () => (
    <div>
      <div className="space-y-4">
        {(weeklyFeedback[weeklyReport[0]?.weekNumber] || []).map((feedback, index) => (
          <Card key={index} className="overflow-hidden transition-shadow hover:shadow-lg">
            <CardHeader className="space-y-1">
              <div className="flex items-center justify-between">
                <div className='flex items-center space-x-3'>

                  {
                    feedback.role === 'AI' ? <h3 className="font-semibold"></h3> : <h3 className="font-semibold">{feedback.fullName}</h3>
                  }
                  <Badge
                    className="bg-yellow-500 text-white"
                    variant="default"> {feedback.role}</Badge>
                </div>
                <Badge
                  className="bg-gray-500 text-white"
                  variant="default"> {feedback.date}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">{feedback.feedback}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      <Card key={'your_feedback'} className="mt-2 overflow-hidden transition-shadow hover:shadow-lg">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-lg">Your Feedback</h3>
          </div>
        </CardHeader>
        <CardContent>
          <Textarea
            value={currentFeedback}
            onChange={(e) => setCurrentFeedback(e.target.value)}
            placeholder="Add your feedback here..."
            className="mt-2"
          />
        </CardContent>
        <CardFooter className="flex justify-end gap-2">
          <Button
            className="bg-green-500 text-white"
            variant="outline"
            size="sm"
            onClick={() => handleFeedbackSubmit(weeklyReport[0]?.weekNumber)}
          >
            <MessageCircle className="mr-2" /> Submit Feedback
          </Button>
        </CardFooter>
      </Card>
    </div>
  );

  const handlePrintClick = () => {
    setIsDialogOpen(true);
  };

  console.log({ weeklyReport, weeklyFeedback });
  return (
    <div className="p-4 max-w-l">
      <h1 className="text-2xl font-bold mb-4 text-center">Daily Time Record</h1>
      <Calendar
        onChange={setSelectedDate}
        value={selectedDate}
        tileContent={({ date, view }) =>
          view === 'month' && weeklyReport.some(report =>
            format(new Date(report.date), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
          ) && (
            <div className="text-xs text-center">
              {calculateHours(
                weeklyReport.find(r => format(new Date(r.date), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd'))?.timeIn || 'N/A',
                weeklyReport.find(r => format(new Date(r.date), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd'))?.timeOut || 'N/A'
              ).toFixed(2)} hrs
            </div>
          )
        }
        tileDisabled={({ date }) => date.getDay() === 0 || date.getDay() === 6}
        className="mx-auto"
      />
      <div className='border border-gray-900 rounded-lg p-4 mt-2'>
        <div className="flex justify-between items-center mt-4">
          <div className="flex gap-2">
            <Badge variant="outline" className="bg-blue-100 text-blue-800">
              Daily: {dailyHours} hrs
            </Badge>
            <Badge variant="outline" className="bg-green-100 text-green-800">
              Weekly: {weeklyReport.reduce((total, report) =>
                total + calculateHours(report.timeIn, report.timeOut), 0
              ).toFixed(2)} hrs
            </Badge>
            <Badge variant="outline" className="bg-purple-100 text-purple-800">
              Monthly: {monthlyHours} hrs
            </Badge>
          </div>
          <Button
            className="bg-gray-500 text-white flex items-center"
            onClick={handlePrintClick}
          >
            <Printer className="mr-2" /> Print
          </Button>
        </div>

        <div className="mt-4">
          <h2 className="text-xl font-semibold text-start">
            {format(selectedDate, 'PPP')}
          </h2>
          <div className="flex flex-col md:flex-row gap-4 mt-2">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700">Time In</label>
              <input
                type="time"
                value={timeIn}
                onChange={handleTimeInChange}
                className="mt-1 py-2 p-4 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700">Time Out</label>
              <input
                type="time"
                value={timeOut}
                onChange={handleTimeOutChange}
                disabled={!timeIn}
                className="mt-1 py-2 p-4 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
            <div className="flex-1 flex items-end">

              {
                showButtons && <Button
                  className="bg-blue-500 text-white w-full"
                  onClick={() => handleUpdateTime(selectedDate)}
                  disabled={!timeIn}
                >
                  <Clock className="w-4 h-4 mr-2" />
                  Update Time
                </Button>
              }

            </div>
          </div>
        </div>

        <div className="mt-6">
          <div className="flex space-x-4 mb-4">
            <Button
              className={`flex-1
                hover:bg-blue-700 hover:text-white
                ${activeTab === 'reports' ? 'bg-blue-700 text-white' : 'bg-gray-200 text-gray-700'}`}
              onClick={() => setActiveTab('reports')}
            >
              Reports
            </Button>
            <Button
              className={`flex-1 
                        hover:bg-blue-700 hover:text-white
                ${activeTab === 'feedbacks' ? 'bg-blue-700 text-white' : 'bg-gray-200 text-gray-700'}`}
              onClick={() => setActiveTab('feedbacks')}
            >
              Feedbacks
            </Button>
          </div>
          {activeTab === 'reports' ? renderReportsTab() : renderFeedbacksTab()}
        </div>
      </div>

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
    </div>
  );
}

export default StudentDTR;