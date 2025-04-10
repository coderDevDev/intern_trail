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
import { Skeleton } from "@/components/ui/skeleton";

function StudentDTR({ supervisorName }) {
  const { studentId } = useParams();
  //console.log({ supervisorName })
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
  const [isProgressLoading, setIsProgressLoading] = useState(true);
  const [currentWeekNumber, setCurrentWeekNumber] = useState(null);
  const [totalRenderedHours, setTotalRenderedHours] = useState(0);

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

  const [totalOJTHours, setTotalOJTHours] = useState(0);

  const fetchDashboardStats = async () => {
    try {
      const response = await axios.get('/student/dashboard-stats');
      setTotalOJTHours(response.data.data.traineeDetails.remaining_hours)
    } catch (error) {
      setTotalOJTHours(360)
    }
  };

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  useEffect(() => {
    const fetchWeeklyData = async () => {
      try {
        setIsProgressLoading(true);
        const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));

        // Calculate ISO week number (consistent across month boundaries)
        const isoWeekNumber = getWeek(selectedDate, { weekStartsOn: 1 });

        //console.log({ isoWeekNumber })
        // Only fetch if ISO week number has changed

        setCurrentWeekNumber(isoWeekNumber);

        //console.log({ isoWeekNumber })

        // Use ISO week for API request
        const response = await axios.get(`/company/weekly-report/${studentId || loggedInUser.userID}/${isoWeekNumber}`);

        if (response.data.success) {
          const { weeklyReport, weeklyFeedback } = response.data.data;

          let weeklyNarrativeReport = weeklyReport.filter(report => !!report.narrative);
          setNarrativeReport(weeklyNarrativeReport.length > 0 ? weeklyNarrativeReport[0].narrative : '');

          // Generate the complete week template
          const start = startOfWeek(selectedDate, { weekStartsOn: 1 }); // Start from Monday
          const end = endOfWeek(selectedDate, { weekStartsOn: 1 }); // End on Sunday
          const completeWeekReport = [];

          // Fill in all weekdays, regardless of month
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
                narrative: existingReport.narrative || '',
                isoWeekNumber // Store ISO week number
              });
            } else {
              // Create empty entry for this date
              completeWeekReport.push({
                date: formattedDate,
                day: format(date, 'EEEE'),
                report: '',
                timeIn: 'N/A',
                timeOut: 'N/A',
                weekNumber: isoWeekNumber, // Use ISO week number
                isoWeekNumber,
                narrative: ''
              });
            }
          }

          setWeeklyReport(completeWeekReport);
          setWeeklyFeedback(weeklyFeedback);

          // Calculate monthly hours more accurately
          const currentMonth = selectedDate.getMonth();
          const currentYear = selectedDate.getFullYear();

          // Get first and last day of current month
          const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
          const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);

          // Fetch all weekly reports for weeks that overlap with this month
          const startWeek = getWeek(firstDayOfMonth, { weekStartsOn: 1 });
          const endWeek = getWeek(lastDayOfMonth, { weekStartsOn: 1 });

          const weekPromises = [];
          for (let week = startWeek; week <= endWeek; week++) {
            weekPromises.push(
              axios.get(`/company/weekly-report/${studentId || loggedInUser.userID}/${week}`)
            );
          }

          const monthlyReports = await Promise.all(weekPromises);

          // Calculate total monthly hours from all reports in the current month
          let monthlyHoursSum = 0;
          monthlyReports.forEach(response => {
            if (response.data.success) {
              const weekData = response.data.data.weeklyReport;
              weekData.forEach(day => {
                // Only count days in the current month
                const dayDate = new Date(day.date);
                if (dayDate.getMonth() === currentMonth && dayDate.getFullYear() === currentYear) {
                  monthlyHoursSum += calculateHours(day.timeIn, day.timeOut);
                }
              });
            }
          });

          // Set monthly hours for the current month
          setMonthlyHours(monthlyHoursSum.toFixed(2));

          // Now fetch all reports for calculating total hours
          try {
            setIsProgressLoading(true)
            const totalHoursResponse = await axios.get(`/student/total-hours-rendered/${studentId || loggedInUser.userID}`);
            console.log({ totalHoursResponse: totalHoursResponse })
            if (totalHoursResponse.data.success) {

              //console.log({ dexdee: totalHoursResponse.data.data.totalHours.toFixed(2) })
              setTotalRenderedHours(parseFloat(totalHoursResponse.data.data?.totalHours));
              setIsProgressLoading(false)

              console.log({ totalRenderedHours })

            } else {
              // // Fallback: Calculate from available data
              // let accumulatedHours = 0;

              // // Get all approved DTR entries
              // const approvedDTRsResponse = await axios.get('/student/approved-dtrs');
              // if (approvedDTRsResponse.data.success) {
              //   approvedDTRsResponse.data.data.forEach(dtr => {
              //     accumulatedHours += calculateHours(dtr.time_in, dtr.time_out);
              //   });
              //   setTotalRenderedHours(accumulatedHours.toFixed(2));
              // }
            }
          } catch (error) {

            console.log(error)
            //console.error('Error fetching total hours:', error);
            // Just use the current monthly calculation as fallback
            setTotalRenderedHours(monthlyHoursSum.toFixed(2));
          }
        }

        // Always update today's data from weeklyReport, regardless of week change
        let todayReport = weeklyReport.find(
          report => format(new Date(report.date), 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd')
        );

        if (todayReport) {
          setTimeIn(todayReport.timeIn);
          setTimeOut(todayReport.timeOut);
          setDailyReport(todayReport.report || '');
          setDailyHours(calculateHours(todayReport.timeIn, todayReport.timeOut).toFixed(2));
        }

        setIsProgressLoading(false);
      } catch (error) {
        //console.error('Error fetching weekly data:', error);
        toast.error('Failed to fetch weekly report data');
        setIsProgressLoading(false);
      }
    };

    fetchWeeklyData();
  }, [selectedDate, currentWeekNumber, studentId]);

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
        //console.error("Error fetching data:", error);
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
  //       //console.error("Error fetching student data:", error);
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

    //console.log({ totalHours })
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

    //console.log({ weekNumber })

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

  const handleSave = async (date, report, isNarrativeReport = false) => {
    try {
      // Use ISO week number for consistency across month boundaries
      const isoWeekNumber = getWeek(new Date(date), { weekStartsOn: 1 });

      // Get first day of the current week for display purposes
      const weekStart = startOfWeek(new Date(date), { weekStartsOn: 1 });

      // For backward compatibility, also calculate month-relative week number
      const monthWeekNumber = differenceInCalendarWeeks(
        new Date(date),
        startOfMonth(new Date(date)),
        { weekStartsOn: 1 }
      ) + 1;

      await axios.post('/company/daily-report', {
        date,
        report,
        timeIn,
        timeOut,
        weekNumber: isoWeekNumber, // Use ISO week number
        isoWeekNumber, // Add this for explicit clarity
        narrative: narrativeReport,
        isNarrativeReport,
        startDate: format(weekStart, 'yyyy-MM-dd') // Add the week start date
      });

      // Reset edit states
      setIsReportEdited(prev => ({
        ...prev,
        [date]: false
      }));
      setIsNarrativeEdited(false);

      // Generate AI feedback with consistent week numbering
      const allReports = weeklyReport.map(r => r.report).join('\n');
      const aiResponse = await axios.post('/company/generate-feedback', {
        dailyReports: allReports,
        narrativeReport,
        weekNumber: isoWeekNumber, // Use ISO week number
        isoWeekNumber, // Add this for explicit clarity
        startDate: format(weekStart, 'yyyy-MM-dd') // Add the week start date
      });

      if (aiResponse.data.success) {
        await axios.post('/company/weekly-feedback', {
          studentId: studentId || JSON.parse(localStorage.getItem('loggedInUser')).userID,
          weekNumber: isoWeekNumber, // Use ISO week number
          isoWeekNumber, // Add this for explicit clarity
          feedback: aiResponse.data.feedback,
          fromAI: true,
          startDate: format(weekStart, 'yyyy-MM-dd') // Add the week start date
        });
      }

      // Refresh data using the ISO week number
      await refreshWeeklyData(isoWeekNumber);

      toast.success('Report saved successfully!');
    } catch (error) {
      //console.error('Error saving report:', error);
      toast.error('Failed to save report');
    }
  };

  const handleAddFeedback = () => {
    toast.info('Feedback added!');
  };

  const handleFeedbackSubmit = async () => {
    try {
      if (!currentFeedback.trim()) {
        toast.error('Please enter feedback before submitting');
        return;
      }

      const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));

      // Get ISO week number for consistency
      const isoWeekNumber = getWeek(selectedDate, { weekStartsOn: 1 });

      // Get first day of the current week for display purposes
      const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });

      // Get reports for the current week
      const weekReports = weeklyReport.filter(report =>
        getWeek(new Date(report.date), { weekStartsOn: 1 }) === isoWeekNumber
      );

      // Filter out only entries with reports
      const reportsWithContent = weekReports
        .filter(entry => entry.report && entry.report.trim())
        .map(entry => `${format(new Date(entry.date), 'EEEE, MMM d')}: ${entry.report}`)
        .join('\n\n');

      // Get the week number relative to the month (for backwards compatibility)
      const monthWeekNumber = differenceInCalendarWeeks(
        selectedDate,
        startOfMonth(selectedDate),
        { weekStartsOn: 1 }
      ) + 1;

      if (loggedInUser.role === 'hte-supervisor') {
        // Regular supervisor feedback
        await axios.post('/company/weekly-feedback', {
          weekNumber: isoWeekNumber, // Use ISO week for consistency
          isoWeekNumber,
          user_id: loggedInUser.userID,
          feedback: currentFeedback,
          studentId: studentId || loggedInUser.userID,
          startDate: format(weekStart, 'yyyy-MM-dd')
        });
      } else if (currentFeedback.toLowerCase().includes('generate ai feedback') ||
        currentFeedback.toLowerCase().includes('ai feedback')) {
        // Generate AI feedback based on reports
        const response = await axios.post('/company/generate-feedback', {
          dailyReports: reportsWithContent,
          narrativeReport,
          weekNumber: isoWeekNumber, // Use ISO week for consistency
          isoWeekNumber,
          startDate: format(weekStart, 'yyyy-MM-dd')
        });

        // Submit the AI-generated feedback
        await axios.post('/company/weekly-feedback', {
          weekNumber: isoWeekNumber, // Use ISO week for consistency
          isoWeekNumber,
          feedback: response.data.feedback,
          studentId: studentId || loggedInUser.userID,
          role: 'AI',
          startDate: format(weekStart, 'yyyy-MM-dd'),
          fromAI: true
        });
      } else {
        // Regular student feedback
        await axios.post('/company/weekly-feedback', {
          weekNumber: isoWeekNumber, // Use ISO week for consistency
          isoWeekNumber,
          feedback: currentFeedback,
          user_id: loggedInUser.userID,
          studentId: studentId || loggedInUser.userID,
          startDate: format(weekStart, 'yyyy-MM-dd')
        });
      }

      toast.success('Feedback submitted successfully');
      setCurrentFeedback('');

      // Refresh the feedback list using ISO week
      const response = await axios.get(`/company/weekly-report/${studentId || loggedInUser.userID}/${isoWeekNumber}`);
      if (response.data.success) {
        //console.log({ dydy: response.data.data })
        setWeeklyFeedback(response.data.data.weeklyFeedback);
      }
    } catch (error) {
      //console.error('Error submitting feedback:', error);
      toast.error('Failed to submit feedback');
    }
  };

  // refreshWeeklyData
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
      //console.error('Error refreshing data:', error);
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

      // Use ISO week number for consistency across month boundaries
      const isoWeekNumber = getWeek(new Date(date), { weekStartsOn: 1 });

      // Make sure we have valid time values
      if (!timeIn || !timeOut) {
        toast.error('Please enter valid time values');
        return;
      }

      // Check if time out is after time in
      const [inHours, inMinutes] = timeIn.split(':').map(Number);
      const [outHours, outMinutes] = timeOut.split(':').map(Number);

      if ((outHours < inHours) || (outHours === inHours && outMinutes <= inMinutes)) {
        toast.error('Time out must be after time in');
        return;
      }

      // Find the existing report in the weeklyReport state
      const formattedDate = format(date, 'yyyy-MM-dd');
      const existingReport = weeklyReport.find(r => r.date === formattedDate);
      const reportText = existingReport?.report || '';

      try {
        // First try to update using the update-time endpoint
        if (existingReport && existingReport.id) {
          await axios.put('/company/daily-report/update-time', {
            date: formattedDate,
            timeIn,
            timeOut,
            studentId: studentId || loggedInUser.userID
          });
        } else {
          // If no existing report or it doesn't have an ID, create a new one
          await axios.post('/company/daily-report', {
            date: formattedDate,
            report: reportText,
            timeIn,
            timeOut,
            weekNumber: isoWeekNumber,
            narrative: narrativeReport,
            studentId: studentId || loggedInUser.userID
          });
        }

        // Update the local state to reflect changes immediately
        setWeeklyReport(prevReports =>
          prevReports.map(report =>
            report.date === formattedDate
              ? { ...report, timeIn, timeOut }
              : report
          )
        );

        // Recalculate daily hours
        const newDailyHours = calculateHours(timeIn, timeOut);
        setDailyHours(newDailyHours.toFixed(2));

        toast.success('Time updated successfully!');

        // Force refresh the current week data to ensure consistent state
        setCurrentWeekNumber(null); // This will trigger a re-fetch on next render
      } catch (updateError) {
        //console.error('Error in initial update attempt:', updateError);

        // Fallback to creating a new report if update fails
        await axios.post('/company/daily-report', {
          date: formattedDate,
          report: reportText,
          timeIn,
          timeOut,
          weekNumber: isoWeekNumber,
          narrative: narrativeReport,
          studentId: studentId || loggedInUser.userID
        });

        toast.success('Time saved successfully!');
        setCurrentWeekNumber(null);
      }
    } catch (error) {
      //console.error('Error updating time:', error);
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
      await refreshWeeklyData(currentWeekNumber);
    } catch (error) {
      //console.error('Error updating entry status:', error);
      toast.error('Failed to update entry status');
    }
  };

  const renderReportsTab = (currentWeekNumber) => (
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
              onClick={() => handleSave(format(selectedDate, 'yyyy-MM-dd'), null, true)}
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
            onClick={handleFeedbackSubmit}
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
                <div className="grid grid-cols-1 gap-4 mb-6">
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

  //console.log({ weeklyReport, weeklyFeedback });

  console.log({ totalRenderedHours })
  return (
    <div className="container mx-auto px-0">
      <div className="grid grid-cols-1 min-[1300px]:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-1 space-y-auto">
          {/* Progress Overview */}
          <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow mb-4">
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
                {/* Monthly Progress Bar */}
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Total Progress</span>
                    {isProgressLoading ? (
                      <Skeleton className="h-4 w-24" />
                    ) : (
                      <span className="font-medium">{totalRenderedHours}/{totalOJTHours} hours</span>
                    )}
                  </div>
                  {isProgressLoading ? (
                    <Skeleton className="h-2 w-full" />
                  ) : (
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${Math.min((parseFloat(totalRenderedHours) / totalOJTHours) * 100, 100)}%` }}
                      />
                    </div>
                  )}
                </div>

                {/* Progress Stats Grid */}
                <div className="grid grid-cols-3 gap-3">
                  {/* Daily Progress */}
                  <div className="bg-blue-50 p-3 rounded-lg text-center">
                    <p className="text-sm text-blue-600">Daily</p>
                    {isProgressLoading ? (
                      <Skeleton className="h-7 w-16 mx-auto mt-1" />
                    ) : (
                      <p className="text-lg font-bold text-blue-700">
                        {(() => {
                          const entry = weeklyReport.find(
                            r => r.date === format(selectedDate, 'yyyy-MM-dd')
                          );
                          return entry ? calculateHours(entry.timeIn, entry.timeOut).toFixed(2) : '0.00';
                        })()}h
                      </p>
                    )}
                  </div>

                  {/* Weekly Progress - only count days in the current week */}
                  <div className="bg-green-50 p-3 rounded-lg text-center">
                    <p className="text-sm text-green-600">Weekly</p>
                    {isProgressLoading ? (
                      <Skeleton className="h-7 w-16 mx-auto mt-1" />
                    ) : (
                      <p className="text-lg font-bold text-green-700">
                        {(() => {
                          // Get current ISO week number
                          const currentIsoWeek = getWeek(selectedDate, { weekStartsOn: 1 });

                          // Only count entries from the current week
                          return weeklyReport
                            .filter(entry => getWeek(new Date(entry.date), { weekStartsOn: 1 }) === currentIsoWeek)
                            .reduce((total, entry) => total + calculateHours(entry.timeIn, entry.timeOut), 0)
                            .toFixed(2);
                        })()}h
                      </p>
                    )}
                  </div>

                  {/* Monthly Progress */}
                  <div className="bg-purple-50 p-3 rounded-lg text-center">
                    <p className="text-sm text-purple-600">Monthly</p>
                    {isProgressLoading ? (
                      <Skeleton className="h-7 w-16 mx-auto mt-1" />
                    ) : (
                      <p className="text-lg font-semibold text-purple-700">{totalRenderedHours}h</p>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Calendar */}
          <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow mb-4">
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
                      <div className="text-xs mt-1 font-medium text-gray-fff">
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
          <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow mb-4">
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
              <div className="flex flex-col mb-6">
                <h2 className="text-lg font-semibold mb-3">Reports & Feedback</h2>
                <div className="inline-flex rounded-lg border border-gray-200 overflow-hidden w-full sm:w-auto">
                  <button
                    className={`px-1 py-2 text-xs font-medium transition-colors flex-1 sm:flex-auto
                    ${activeTab === 'reports'
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-gray-700 hover:bg-gray-50'
                      }`}
                    onClick={() => setActiveTab('reports')}
                  >
                    Reports
                  </button>
                  <button
                    className={`px-1 py-2 text-xs font-medium transition-colors flex-1 sm:flex-auto
                    ${activeTab === 'feedbacks'
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-gray-700 hover:bg-gray-50'
                      }`}
                    onClick={() => setActiveTab('feedbacks')}
                  >
                    Feedbacks
                  </button>
                  <button
                    className={`px-1 py-2 text-xs font-medium transition-colors flex-1 sm:flex-auto
                    ${activeTab === 'evaluation'
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-gray-700 hover:bg-gray-50'
                      }`}
                    onClick={() => setActiveTab('evaluation')}
                  >
                    Evaluation
                  </button>
                  <button
                    className={`px-1 py-2 text-xs font-medium transition-colors flex-1 sm:flex-auto
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

              {activeTab === 'reports' ? renderReportsTab(currentWeekNumber) : activeTab === 'feedbacks' ? renderFeedbacksTab() : activeTab === 'evaluation' ? renderEvaluationTab() : renderCertificateTab()}
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
            <WeeklyReport weeklyReport={weeklyReport} supervisorName={supervisorName} />
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
