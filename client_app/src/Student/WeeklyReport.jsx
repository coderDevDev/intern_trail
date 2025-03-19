"use client"

import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
// import Image from "next/image"
import { Printer } from "lucide-react"
import React, { useState, useEffect } from 'react';
import { format, addDays, startOfMonth, endOfMonth, startOfWeek, endOfWeek, getWeek, differenceInCalendarWeeks } from 'date-fns';
import { Calendar } from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { toast } from 'react-toastify';
import { CheckCircle, Save, MessageCircle, FileText } from 'lucide-react';
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
} from "@/components/ui/dialog";
import { PDFDownloadLink } from '@react-pdf/renderer';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';


export default function WeeklyReport({ weeklyReport, supervisorName }) {
  const handlePrint = () => {
    window.print()
  }



  const calculateWorkingHours = (timeIn, timeOut) => {
    if (timeIn === "N/A" || timeOut === "N/A") return "N/A";

    const [inHours, inMinutes] = timeIn.split(':').map(Number);
    const [outHours, outMinutes] = timeOut.split(':').map(Number);

    let totalMinutes = (outHours * 60 + outMinutes) - (inHours * 60 + inMinutes);

    // Subtract 1 hour for lunch break
    totalMinutes -= 60;

    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    return `${hours} hours and ${minutes} minutes`;
  };

  // Calculate total working hours for the week
  const calculateTotalHours = () => {
    return weeklyReport.reduce((total, entry) => {
      if (entry.timeIn === "N/A" || entry.timeOut === "N/A") return total;

      const [inHours, inMinutes] = entry.timeIn.split(':').map(Number);
      const [outHours, outMinutes] = entry.timeOut.split(':').map(Number);

      let totalMinutes = (outHours * 60 + outMinutes) - (inHours * 60 + inMinutes);
      // Subtract lunch break
      totalMinutes -= 60;

      return total + totalMinutes;
    }, 0);
  };

  const formatTotalHours = (totalMinutes) => {
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${hours} hours and ${minutes} minutes`;
  };

  const generatePDF = async () => {
    try {
      // Get the report element
      const report = document.getElementById('weekly-report');

      // Create canvas from the report
      const canvas = await html2canvas(report, {
        scale: 2,
        useCORS: true,
        logging: false
      });

      // Calculate dimensions to fit A4
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      // Create PDF
      const pdf = new jsPDF('p', 'mm', 'a4');

      // Add image to PDF
      pdf.addImage(
        canvas.toDataURL('image/png'),
        'PNG',
        0,
        0,
        imgWidth,
        imgHeight
      );

      // Save the PDF
      pdf.save(`Weekly_Report_Week_${weeklyReport[0]?.weekNumber}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Failed to generate PDF');
    }
  };

  console.log({ weeklyReport })
  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6 print:p-0">
      {/* Print Button - Hidden when printing */}
      <div className="print:hidden text-right">
        <Button onClick={generatePDF}>
          <Printer className="mr-2 h-4 w-4" />
          Save to PDF
        </Button>
      </div>
      <div id="weekly-report" className="max-w-5xl mx-auto p-6 space-y-6 print:p-0">
        {/* Header */}
        <div className="flex items-center justify-between border-b pb-4 print:pb-2">
          <img
            src="/Picture1.png"
            alt="Left University Logo"
            width={80}
            height={80}
            className="object-contain"
          />
          <div className="text-center">
            <h1 className="text-xl font-bold">WESLEYAN UNIVERSITY - PHILIPPINES</h1>
            <p className="text-sm text-muted-foreground">Mabini Extension, Cabanatuan City, Nueva Ecija</p>
          </div>
          <img
            src="/Picture2.png"
            alt="Right University Logo"
            width={80}
            height={80}
            className="object-contain"
          />
        </div>

        {/* Week Header */}
        <div className="text-center py-4">
          <h2 className="text-lg font-semibold">WEEK {weeklyReport[0]?.weekNumber}:</h2>
        </div>

        {/* Timesheet Table */}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-32">Date</TableHead>
              <TableHead className="w-32">Day</TableHead>
              <TableHead className="w-40">No. of Working Hours</TableHead>
              <TableHead>Accomplishment</TableHead>
              <TableHead className="w-32">Remarks</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {weeklyReport.map((entry, index) => (
              <TableRow key={index}>
                <TableCell>{entry.date}</TableCell>
                <TableCell>{entry.day}</TableCell>
                <TableCell>{calculateWorkingHours(entry.timeIn, entry.timeOut)}</TableCell>
                <TableCell>{entry.report || "No report"}</TableCell>
                <TableCell>{""}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {/* Total Hours */}
        <div className="pt-4 border-t">
          <p className="font-semibold">
            Total Number of Hours: {formatTotalHours(calculateTotalHours())}
          </p>
        </div>

        {/* Certification */}
        <div className="pt-8 text-center">
          <p className="mb-4">Certified by:</p>


          <p className="font-semibold">{supervisorName || 'Not Assigned'}</p>
          <p className="text-sm text-muted-foreground">Name of Trainor</p>
        </div>
      </div>
      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          body {
            print-color-adjust: exact;
          }
          @page {
            margin: 2cm;
          }
        }
      `}</style>
    </div>
  )
}

