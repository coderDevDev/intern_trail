import React, { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from 'react-toastify';
import { Upload, FileText, Calendar, Award, Check, X, Eye, Download, Trash2 } from "lucide-react";
import axios from 'axios';
import { useDropzone } from 'react-dropzone';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

function CertificateUpload({ isOpen, onClose, student, initialFocus }) {
  const [activeTab, setActiveTab] = useState("upload");
  const [loading, setLoading] = useState(false);
  const [certificateFile, setCertificateFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [existingCertificates, setExistingCertificates] = useState([]);
  const [loadingCertificates, setLoadingCertificates] = useState(false);
  const [viewCertificate, setViewCertificate] = useState(null);
  const initialFocusRef = useRef(null);
  const [certificateData, setFormData] = useState({
    studentName: student ? `${student.first_name} ${student.last_name}` : '',
    companyName: '',
    trainingHours: '',
    startDate: '',
    endDate: '',
    certificateTitle: 'Certificate of Completion',
    description: 'This is to certify that the above-named student has successfully completed the On-the-Job Training program.'
  });
  const certificateRef = useRef(null);

  // Fetch existing certificates when modal opens
  useEffect(() => {
    if (isOpen && student) {
      fetchCertificates();
    }
  }, [isOpen, student]);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setCertificateFile(null);
      setPreviewUrl(null);
      setFormData({
        studentName: student ? `${student.first_name} ${student.last_name}` : '',
        companyName: '',
        trainingHours: '',
        startDate: '',
        endDate: '',
        certificateTitle: 'Certificate of Completion',
        description: 'This is to certify that the above-named student has successfully completed the On-the-Job Training program.'
      });
    }
  }, [isOpen, student]);

  // Proper cleanup when modal closes
  const handleOpenChange = (open) => {
    if (!open) {
      // Ensure we remove focus from any elements before closing
      if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
      }

      // Reset body styles
      document.body.style.pointerEvents = '';
      document.body.removeAttribute('aria-hidden');

      // Small delay to ensure DOM is updated before calling onClose
      setTimeout(() => {
        onClose();
      }, 0);
    }
  };

  const fetchCertificates = async () => {
    if (!student) return;

    setLoadingCertificates(true);
    try {
      const response = await axios.get(`/certificates/${student.userID}`);
      if (response.data.success) {
        setExistingCertificates(response.data.data);

        // If certificates exist, set the view tab as active
        if (response.data.data.length > 0) {
          setActiveTab("view");
        }
      }
    } catch (error) {
      console.error("Error fetching certificates:", error);
      toast.error("Failed to load existing certificates");
    } finally {
      setLoadingCertificates(false);
    }
  };

  // File upload handling
  const onDrop = (acceptedFiles) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      setCertificateFile(file);

      // Create preview URL
      const fileReader = new FileReader();
      fileReader.onload = () => {
        setPreviewUrl(fileReader.result);
      };
      fileReader.readAsDataURL(file);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png'],
      'application/pdf': ['.pdf']
    },
    maxFiles: 1
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const uploadCertificate = async () => {
    if (!certificateFile) {
      toast.error("Please select a certificate file to upload");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('certificate', certificateFile);
      formData.append('studentId', student.userID);
      formData.append('tag', 'certificate');

      const response = await axios.post('/certificates/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.success) {
        toast.success("Certificate uploaded successfully");
        setCertificateFile(null);
        setPreviewUrl(null);
        fetchCertificates();
        setActiveTab("view");
      } else {
        toast.error(response.data.message || "Failed to upload certificate");
      }
    } catch (error) {
      console.error("Error uploading certificate:", error);
      toast.error("Failed to upload certificate");
    } finally {
      setLoading(false);
    }
  };

  const deleteCertificate = async (id) => {
    if (!confirm("Are you sure you want to delete this certificate?")) {
      return;
    }

    try {
      const response = await axios.delete(`/certificates/${id}`);
      if (response.data.success) {
        toast.success("Certificate deleted successfully");
        fetchCertificates();
      } else {
        toast.error(response.data.message || "Failed to delete certificate");
      }
    } catch (error) {
      console.error("Error deleting certificate:", error);
      toast.error("Failed to delete certificate");
    }
  };

  const generateCertificate = async () => {
    if (!certificateRef.current) return;

    try {
      const canvas = await html2canvas(certificateRef.current, {
        scale: 2,
        useCORS: true,
        logging: false
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);

      // Convert PDF to blob
      const pdfBlob = pdf.output('blob');
      const file = new File([pdfBlob], `${certificateData.studentName}_Certificate.pdf`, { type: 'application/pdf' });

      setCertificateFile(file);
      setActiveTab("upload");

      toast.success("Certificate generated! Click 'Upload Certificate' to save it.");
    } catch (error) {
      console.error("Error generating certificate:", error);
      toast.error("Failed to generate certificate");
    }
  };

  return (
    <Dialog open={isOpen}
      onOpenChange={(open) => !open && onClose()}
    >
      <DialogContent
        className="sm:max-w-4xl max-h-[90vh] overflow-y-auto p-4 sm:p-6 w-[92%] sm:w-full mx-auto rounded-lg"
        onInteractOutside={(e) => {
          e.preventDefault();
        }}
        onEscapeKeyDown={(e) => {
          e.preventDefault();
          handleOpenChange(false);
        }}
        onPointerDownOutside={(e) => {
          e.preventDefault();
        }}
        initialFocus={initialFocusRef}
      >
        <DialogHeader>
          <DialogTitle>Certificate Management</DialogTitle>
        </DialogHeader>

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="flex-1 overflow-hidden flex flex-col"
        >
          <TabsList className="grid grid-cols-3">
            <TabsTrigger value="upload" ref={initialFocusRef}>Upload</TabsTrigger>
            <TabsTrigger value="create">Create</TabsTrigger>
            <TabsTrigger value="view">
              View
              {existingCertificates.length > 0 && (
                <span className="ml-2 bg-blue-100 text-blue-800 text-xs font-medium px-2 py-0.5 rounded-full">
                  {existingCertificates.length}
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-auto p-1">
            <TabsContent value="upload" className="h-full">
              <div className="space-y-4 h-full">
                <div
                  {...getRootProps()}
                  className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400'
                    }`}
                >
                  <input {...getInputProps()} />
                  <div className="flex flex-col items-center justify-center">
                    <Upload className="h-10 w-10 text-gray-400 mb-2" />
                    <p className="text-gray-600 mb-1">
                      {isDragActive
                        ? "Drop the certificate here"
                        : "Drag & drop a certificate file here, or click to select"}
                    </p>
                    <p className="text-xs text-gray-500">
                      Supports: JPG, PNG, PDF
                    </p>
                  </div>
                </div>

                {previewUrl && (
                  <div className="mt-4">
                    <h4 className="font-medium mb-2">Preview:</h4>
                    <div className="border rounded-lg overflow-hidden">
                      {certificateFile.type.includes('image') ? (
                        <img
                          src={previewUrl}
                          alt="Certificate preview"
                          className="max-h-[300px] mx-auto"
                        />
                      ) : (
                        <div className="p-4 flex items-center justify-center bg-gray-100">
                          <FileText className="h-8 w-8 text-gray-500 mr-2" />
                          <span>{certificateFile.name}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="create" className="h-full overflow-auto">
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="studentName">Student Name</Label>
                    <Input
                      id="studentName"
                      name="studentName"
                      value={certificateData.studentName}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div>
                    <Label htmlFor="companyName">Company Name</Label>
                    <Input
                      id="companyName"
                      name="companyName"
                      value={certificateData.companyName}
                      onChange={handleInputChange}
                      placeholder="Enter company name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="trainingHours">Training Hours</Label>
                    <Input
                      id="trainingHours"
                      name="trainingHours"
                      type="number"
                      value={certificateData.trainingHours}
                      onChange={handleInputChange}
                      placeholder="e.g. 360"
                    />
                  </div>
                  <div>
                    <Label htmlFor="certificateTitle">Certificate Title</Label>
                    <Input
                      id="certificateTitle"
                      name="certificateTitle"
                      value={certificateData.certificateTitle}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div>
                    <Label htmlFor="startDate">Start Date</Label>
                    <Input
                      id="startDate"
                      name="startDate"
                      type="date"
                      value={certificateData.startDate}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div>
                    <Label htmlFor="endDate">End Date</Label>
                    <Input
                      id="endDate"
                      name="endDate"
                      type="date"
                      value={certificateData.endDate}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={certificateData.description}
                    onChange={handleInputChange}
                    rows={3}
                  />
                </div>

                <div className="border rounded-lg p-4 bg-gray-50">
                  <h4 className="font-medium mb-4">Certificate Preview:</h4>
                  <div className="bg-white border rounded-lg p-6 shadow-sm">
                    <div ref={certificateRef} className="w-full aspect-[1.414/1] bg-white p-8 relative">
                      <div className="border-8 border-double border-gray-200 h-full flex flex-col items-center justify-between p-8 text-center">
                        <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center opacity-5 pointer-events-none">
                          <Award className="w-64 h-64" />
                        </div>

                        <div>
                          <h2 className="text-3xl font-bold text-gray-800 mb-2">{certificateData.certificateTitle}</h2>
                          <p className="text-lg text-gray-600">This certifies that</p>
                          <h3 className="text-2xl font-bold text-blue-600 my-2">{certificateData.studentName}</h3>
                          <p className="text-lg text-gray-600 mb-4">{certificateData.description}</p>

                          {certificateData.companyName && (
                            <p className="text-lg font-medium text-gray-700">
                              at <span className="text-blue-600">{certificateData.companyName}</span>
                            </p>
                          )}

                          {certificateData.trainingHours && (
                            <p className="text-lg font-medium text-gray-700 mt-2">
                              Completed <span className="text-blue-600">{certificateData.trainingHours}</span> hours of training
                            </p>
                          )}

                          {certificateData.startDate && certificateData.endDate && (
                            <p className="text-sm text-gray-600 mt-2">
                              From {new Date(certificateData.startDate).toLocaleDateString()} to {new Date(certificateData.endDate).toLocaleDateString()}
                            </p>
                          )}
                        </div>

                        <div className="mt-12 flex justify-between w-full">
                          <div className="text-center">
                            <div className="w-32 border-t border-gray-400 mx-auto"></div>
                            <p className="text-sm mt-1">Supervisor Signature</p>
                          </div>

                          <div className="text-center">
                            <div className="w-32 border-t border-gray-400 mx-auto"></div>
                            <p className="text-sm mt-1">Coordinator Signature</p>
                          </div>
                        </div>

                        <div className="mt-8 text-sm text-gray-500">
                          {new Date().toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-center">
                  <Button
                    onClick={generateCertificate}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    Generate Certificate
                  </Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="view" className="h-full overflow-auto">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Uploaded Certificates</h3>

                {loadingCertificates ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : existingCertificates.length === 0 ? (
                  <div className="text-center py-8 border rounded-lg bg-gray-50">
                    <Award className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500">No certificates found</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {existingCertificates.map((cert) => (
                      <div key={cert.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex flex-col space-y-4">
                          <div>
                            <h4 className="font-medium">{cert.name}</h4>
                            <p className="text-sm text-gray-500">
                              Uploaded on {new Date(cert.created_at).toLocaleDateString()} by {cert.first_name} {cert.last_name}
                            </p>
                          </div>
                  
                          <div className="grid grid-cols-3 gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => window.open(cert.file_url, '_blank')}
                              className="flex items-center justify-center"
                            >
                              <Eye className="h-4 w-4 mr-1 sm:mr-2" />
                              <span className="hidden sm:inline">View</span>
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
                              className="flex items-center justify-center"
                            >
                              <Download className="h-4 w-4 mr-1 sm:mr-2" />
                              <span className="hidden sm:inline">Download</span>
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-red-600 hover:text-red-700 flex items-center justify-center"
                              onClick={() => deleteCertificate(cert.id)}
                            >
                              <Trash2 className="h-4 w-4 mr-1 sm:mr-2" />
                              <span className="hidden sm:inline">Delete</span>
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>
          </div>
        </Tabs>

        <DialogFooter className="mt-6 space-x-2">
          <Button onClick={() => handleOpenChange(false)} variant="outline">
            Cancel
          </Button>
          {activeTab !== "view" && (
            <Button
              onClick={uploadCertificate}
              disabled={loading || !certificateFile}
              className="bg-green-600 hover:bg-green-700"
            >
              {loading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Uploading...
                </span>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Certificate
                </>
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default CertificateUpload; 