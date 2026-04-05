import React, { useState, useEffect } from 'react';
import {
  Card,
  CardHeader,
  CardContent,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  Button,
  Badge,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  AlertCircle,
  CheckCircle,
  Clock,
  Download,
  File,
  MoreVertical,
} from '@mui/material';
import {
  DownloadIcon,
  CheckIcon,
  XIcon,
  AlertIcon,
} from 'lucide-react';
import axios from 'axios';
import { useLocation } from 'react-location';
import moment from 'moment';

/**
 * TeacherSubmissionManagement Component
 * Manages viewing, grading, and downloading student submissions
 * Shows submitted and not submitted students
 * Allows downloading individual files or all as ZIP
 */
const TeacherSubmissionManagement = ({ assignmentId, schoolId }) => {
  const [activeTab, setActiveTab] = useState('submitted');
  const [submissions, setSubmissions] = useState([]);
  const [notSubmitted, setNotSubmitted] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [gradeDialogOpen, setGradeDialogOpen] = useState(false);
  const [marks, setMarks] = useState('');
  const [feedback, setFeedback] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const teacherId = localStorage.getItem('teacherId');

  // Fetch submissions data
  useEffect(() => {
    fetchSubmissionData();
  }, [assignmentId]);

  const fetchSubmissionData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch detailed submissions
      const submissionsRes = await axios.get(
        `/Assignment/${assignmentId}/DetailedSubmissions`
      );

      // Fetch not submitted students
      const notSubmittedRes = await axios.get(
        `/Assignment/${assignmentId}/NotSubmitted`
      );

      // Fetch statistics
      const statsRes = await axios.get(
        `/Assignment/${assignmentId}/SubmissionStats`
      );

      // Separate submitted and not submitted
      const submitted = submissionsRes.data.submissions.filter(
        s => s.submitted && s.submission
      );
      const notSub = submissionsRes.data.submissions.filter(
        s => !s.submitted
      );

      setSubmissions(submitted);
      setNotSubmitted(notSub);
      setStats(statsRes.data.stats);
    } catch (err) {
      console.error('Error fetching submission data:', err);
      setError(err.response?.data?.message || 'Failed to load submission data');
    } finally {
      setLoading(false);
    }
  };

  // Download single submission file
  const handleDownloadFile = async (submissionId, fileName) => {
    try {
      const response = await axios.get(
        `/Submission/${submissionId}/Download`,
        { responseType: 'blob' }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName || 'submission');
      document.body.appendChild(link);
      link.click();
      link.parentElement.removeChild(link);
    } catch (err) {
      console.error('Error downloading file:', err);
      setError('Failed to download file');
    }
  };

  // Download all submissions as ZIP
  const handleDownloadAllAsZip = async () => {
    try {
      const response = await axios.get(
        `/Assignment/${assignmentId}/SubmissionsZip`,
        { responseType: 'blob' }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `submissions_${assignmentId}.zip`);
      document.body.appendChild(link);
      link.click();
      link.parentElement.removeChild(link);
    } catch (err) {
      console.error('Error downloading ZIP:', err);
      setError('Failed to download submissions');
    }
  };

  // Open grading dialog
  const handleOpenGradeDialog = (submission) => {
    setSelectedSubmission(submission);
    setMarks(submission.submission?.marksObtained || '');
    setFeedback(submission.submission?.feedback || '');
    setGradeDialogOpen(true);
  };

  // Submit grades
  const handleSubmitGrades = async () => {
    try {
      if (!marks || marks === '') {
        setError('Please enter marks');
        return;
      }

      setSubmitting(true);

      await axios.put(
        `/Submission/${selectedSubmission.submission._id}/Feedback`,
        {
          marksObtained: parseFloat(marks),
          feedback,
        }
      );

      setGradeDialogOpen(false);
      setSelectedSubmission(null);
      setMarks('');
      setFeedback('');
      fetchSubmissionData(); // Refresh data
    } catch (err) {
      console.error('Error submitting grades:', err);
      setError(err.response?.data?.message || 'Failed to submit grades');
    } finally {
      setSubmitting(false);
    }
  };

  // Get status badge
  const getStatusBadge = (status, isLate) => {
    let color = 'gray';
    let label = status;

    if (isLate && status === 'submitted') {
      color = 'orange';
      label = 'Submitted Late';
    } else if (status === 'submitted') {
      color = 'green';
      label = 'Submitted';
    } else if (status === 'graded') {
      color = 'blue';
      label = 'Graded';
    } else if (status === 'late') {
      color = 'orange';
      label = 'Late';
    }

    return <Badge variant="outline" className={`bg-${color}-100`}>{label}</Badge>;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">Loading submission data...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Statistics Card */}
      {stats && (
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold">📊 Submission Statistics</h3>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="text-center p-4 bg-gray-50 rounded">
                <div className="text-2xl font-bold">{stats.totalStudents}</div>
                <div className="text-sm text-gray-600">Total Students</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded">
                <div className="text-2xl font-bold text-green-600">{stats.submitted}</div>
                <div className="text-sm text-gray-600">Submitted</div>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded">
                <div className="text-2xl font-bold text-orange-600">{stats.late}</div>
                <div className="text-sm text-gray-600">Late</div>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded">
                <div className="text-2xl font-bold text-blue-600">{stats.graded}</div>
                <div className="text-sm text-gray-600">Graded</div>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded">
                <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
                <div className="text-sm text-gray-600">Pending</div>
              </div>
            </div>

            {/* Grade Distribution */}
            <div className="mt-6 grid grid-cols-4 gap-2">
              <div className="text-center p-3 bg-green-100 rounded">
                <div className="font-bold text-green-700">{stats.gradeDistribution.excellent}</div>
                <div className="text-xs">Excellent (≥90%)</div>
              </div>
              <div className="text-center p-3 bg-blue-100 rounded">
                <div className="font-bold text-blue-700">{stats.gradeDistribution.good}</div>
                <div className="text-xs">Good (70-89%)</div>
              </div>
              <div className="text-center p-3 bg-yellow-100 rounded">
                <div className="font-bold text-yellow-700">{stats.gradeDistribution.average}</div>
                <div className="text-xs">Average (50-69%)</div>
              </div>
              <div className="text-center p-3 bg-red-100 rounded">
                <div className="font-bold text-red-700">{stats.gradeDistribution.poor}</div>
                <div className="text-xs">Poor (&lt;50%)</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error Message */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 text-red-700">
              <AlertCircle size={20} />
              <span>{error}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      <Card>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="submitted">
              ✅ Submitted ({submissions.length})
            </TabsTrigger>
            <TabsTrigger value="notSubmitted">
              ❌ Not Submitted ({notSubmitted.length})
            </TabsTrigger>
          </TabsList>

          {/* Submitted Tab */}
          <TabsContent value="submitted">
            <CardHeader>
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">📋 Submitted Submissions</h3>
                <Button
                  onClick={handleDownloadAllAsZip}
                  className="flex items-center gap-2"
                  variant="outline"
                >
                  <Download size={16} />
                  Download All as ZIP
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {submissions.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No submissions yet
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Student Name</TableHead>
                        <TableHead>Roll No</TableHead>
                        <TableHead>Class</TableHead>
                        <TableHead>Submitted Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>File</TableHead>
                        <TableHead>Marks</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {submissions.map((item) => (
                        <TableRow key={item.submission._id}>
                          <TableCell className="font-medium">
                            {item.student.name}
                          </TableCell>
                          <TableCell>{item.student.rollNum}</TableCell>
                          <TableCell>{item.student.sclassName}</TableCell>
                          <TableCell>
                            {moment(item.submission.submittedAt).format('DD/MM/YYYY HH:mm')}
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(item.submission.status, item.isLate)}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <File size={16} className="text-blue-500" />
                              <span className="text-sm">{item.submission.fileName}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            {item.submission.marksObtained > 0 ? (
                              <span className="font-bold text-green-600">
                                {item.submission.marksObtained}
                              </span>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                onClick={() => handleDownloadFile(
                                  item.submission._id,
                                  item.submission.fileName
                                )}
                                size="sm"
                                variant="outline"
                                title="Download file"
                              >
                                <Download size={14} />
                              </Button>
                              <Button
                                onClick={() => handleOpenGradeDialog(item)}
                                size="sm"
                                variant="outline"
                                title="Grade/Feedback"
                              >
                                ✏️
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </TabsContent>

          {/* Not Submitted Tab */}
          <TabsContent value="notSubmitted">
            <CardHeader>
              <h3 className="text-lg font-semibold">📌 Not Submitted Students</h3>
            </CardHeader>
            <CardContent>
              {notSubmitted.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  All students have submitted!
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Student Name</TableHead>
                        <TableHead>Roll No</TableHead>
                        <TableHead>Class</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {notSubmitted.map((item) => (
                        <TableRow key={item.student._id}>
                          <TableCell className="font-medium">
                            {item.student.name}
                          </TableCell>
                          <TableCell>{item.student.rollNum}</TableCell>
                          <TableCell>{item.student.sclassName}</TableCell>
                          <TableCell>{item.student.email}</TableCell>
                          <TableCell>
                            <Badge variant="destructive">Not Submitted</Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </TabsContent>
        </Tabs>
      </Card>

      {/* Grade Dialog */}
      <Dialog open={gradeDialogOpen} onOpenChange={setGradeDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Grade Submission</DialogTitle>
          </DialogHeader>

          {selectedSubmission && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Student:</label>
                <p className="text-lg font-semibold">
                  {selectedSubmission.student.name} ({selectedSubmission.student.rollNum})
                </p>
              </div>

              <div>
                <label className="text-sm font-medium">Submitted File:</label>
                <p className="text-sm text-gray-600">
                  {selectedSubmission.submission.fileName}
                </p>
                <Button
                  onClick={() => handleDownloadFile(
                    selectedSubmission.submission._id,
                    selectedSubmission.submission.fileName
                  )}
                  size="sm"
                  variant="outline"
                  className="mt-2"
                >
                  <Download size={14} className="mr-2" />
                  Download to Review
                </Button>
              </div>

              <div>
                <label className="text-sm font-medium">Marks Obtained:</label>
                <input
                  type="number"
                  min="0"
                  value={marks}
                  onChange={(e) => setMarks(e.target.value)}
                  placeholder="Enter marks"
                  className="w-full px-3 py-2 border rounded"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Feedback:</label>
                <textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Enter feedback for student"
                  rows="4"
                  className="w-full px-3 py-2 border rounded"
                />
              </div>

              <div className="flex gap-2 justify-end">
                <Button
                  onClick={() => setGradeDialogOpen(false)}
                  variant="outline"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmitGrades}
                  disabled={submitting}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {submitting ? 'Saving...' : 'Save Grades'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TeacherSubmissionManagement;
