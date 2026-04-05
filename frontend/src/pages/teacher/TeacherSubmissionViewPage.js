import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  CircularProgress,
  Alert,
  Typography,
  Grid,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Tabs,
  Tab,
  Container,
  Divider,
} from '@mui/material';
import {
  ArrowBack,
  Download,
  CloudDownload,
  Edit,
} from '@mui/icons-material';
import styled from 'styled-components';
import axios from 'axios';
import moment from 'moment';

const PageContainer = styled(Box)`
  padding: 24px;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  min-height: 100vh;
`;

const HeaderBox = styled(Box)`
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
`;

const StatCard = styled(Paper)`
  padding: 20px;
  text-align: center;
  background: linear-gradient(135deg, ${props => props.bgColor || '#f0f0f0'} 0%, ${props => props.bgColor2 || '#f8f8f8'} 100%);
  
  .stat-value {
    font-size: 28px;
    font-weight: bold;
    color: ${props => props.textColor || '#333'};
  }
  
  .stat-label {
    font-size: 12px;
    color: #666;
    margin-top: 8px;
  }
`;

const StatusBadge = {
  pending: { label: 'Chưa nộp', color: '#f0ad4e', bgcolor: '#fff8e1' },
  submitted: { label: 'Đã nộp', color: '#5cb85c', bgcolor: '#e8f5e9' },
  late: { label: 'Nộp trễ', color: '#f0ad4e', bgcolor: '#fff8e1' },
  graded: { label: 'Đã chấm', color: '#0275d8', bgcolor: '#e3f2fd' },
};

/**
 * TeacherSubmissionViewPage
 * Full page for viewing and managing submission for a specific assignment
 * Route: /Teacher/Submissions/:assignmentId
 */
const TeacherSubmissionViewPage = () => {
  const { assignmentId } = useParams();
  const navigate = useNavigate();
  useSelector((state) => state.user); // Used for authentication context
  
  // State
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [submissions, setSubmissions] = useState([]);
  const [notSubmitted, setNotSubmitted] = useState([]);
  const [stats, setStats] = useState(null);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [gradeDialogOpen, setGradeDialogOpen] = useState(false);
  const [marks, setMarks] = useState('');
  const [feedback, setFeedback] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Environment-aware API URL
  const API_BASE_URL = process.env.NODE_ENV === 'development'
    ? 'http://localhost:5000'
    : '/api';

  // Load submission data
  const loadSubmissionData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Get detailed submissions
      const submissionsRes = await axios.get(
        `${API_BASE_URL}/Assignment/${assignmentId}/DetailedSubmissions`
      );

      // Get stats
      const statsRes = await axios.get(
        `${API_BASE_URL}/Assignment/${assignmentId}/SubmissionStats`
      );

      // Separate submitted/not submitted
      const allSubmissions = Array.isArray(submissionsRes.data.submissions) 
        ? submissionsRes.data.submissions 
        : submissionsRes.data.detailedSubmissions || [];
        
      const submitted = allSubmissions.filter(s => s.submitted);
      const notSub = allSubmissions.filter(s => !s.submitted);

      setSubmissions(submitted);
      setNotSubmitted(notSub);
      setStats(statsRes.data.stats);
    } catch (err) {
      console.error('Error loading submission data:', err);
      const errorMsg = err.response?.data?.message || err.message || 'Failed to load data';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  }, [assignmentId, API_BASE_URL]);

  // Load data
  useEffect(() => {
    loadSubmissionData();
  }, [loadSubmissionData]);

  const handleDownloadFile = async (submissionId, fileName) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/Submission/${submissionId}/Download`,
        { responseType: 'blob' }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      window.URL.revokeObjectURL(url);
      link.parentElement.removeChild(link);
    } catch (err) {
      console.error('Error downloading file:', err);
      setError('Failed to download file');
    }
  };

  const handleDownloadAllAsZip = async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/Assignment/${assignmentId}/SubmissionsZip`,
        { responseType: 'blob' }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `submissions_${assignmentId}.zip`);
      document.body.appendChild(link);
      link.click();
      window.URL.revokeObjectURL(url);
      link.parentElement.removeChild(link);
    } catch (err) {
      console.error('Error downloading ZIP:', err);
      setError('Failed to download ZIP');
    }
  };

  const handleOpenGradeDialog = (submission) => {
    setSelectedSubmission(submission);
    setMarks(submission.submission?.marksObtained || '');
    setFeedback(submission.submission?.feedback || '');
    setGradeDialogOpen(true);
  };

  const handleSubmitGrades = async () => {
    try {
      if (marks === '') {
        setError('Please enter marks');
        return;
      }

      setSubmitting(true);

      await axios.put(
        `${API_BASE_URL}/Assignment/Grade/${selectedSubmission.submission._id}`,
        {
          marksObtained: parseFloat(marks),
          feedback,
        }
      );

      setGradeDialogOpen(false);
      setSelectedSubmission(null);
      setMarks('');
      setFeedback('');
      loadSubmissionData(); // Refresh
    } catch (err) {
      console.error('Error submitting grades:', err);
      setError(err.response?.data?.message || 'Failed to submit grades');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <PageContainer>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
          <CircularProgress />
        </Box>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <Container maxWidth="lg">
        {/* Header */}
        <HeaderBox>
          <Button
            onClick={() => navigate(-1)}
            startIcon={<ArrowBack />}
            variant="outlined"
          >
            Back
          </Button>
          <Typography variant="h4" component="h1">
            📊 Submission Management
          </Typography>
        </HeaderBox>

        {/* Error Alert */}
        {error && <Alert severity="error" sx={{ mb: 2 }}>{typeof error === 'string' ? error : (error?.message ? error.message : 'Đã xảy ra lỗi')}</Alert>}

        {/* Statistics */}
        {stats && (
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard bgColor="#e3f2fd" bgColor2="#bbdefb" textColor="#0275d8">
                <div className="stat-value">{stats.totalStudents}</div>
                <div className="stat-label">Total Students</div>
              </StatCard>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard bgColor="#e8f5e9" bgColor2="#c8e6c9" textColor="#5cb85c">
                <div className="stat-value">{stats.submitted}</div>
                <div className="stat-label">Submitted</div>
              </StatCard>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard bgColor="#fff8e1" bgColor2="#ffe082" textColor="#f0ad4e">
                <div className="stat-value">{stats.late}</div>
                <div className="stat-label">Late Submissions</div>
              </StatCard>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard bgColor="#f3e5f5" bgColor2="#e1bee7" textColor="#9c27b0">
                <div className="stat-value">{stats.graded}</div>
                <div className="stat-label">Graded</div>
              </StatCard>
            </Grid>
          </Grid>
        )}

        {/* Grade Distribution */}
        {stats && (
          <Card sx={{ mb: 3 }}>
            <CardHeader title="📈 Grade Distribution" />
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}>
                  <Box p={2} bgcolor="#e8f5e9" borderRadius={1}>
                    <Typography variant="h6" color="success">
                      {stats.gradeDistribution.excellent}
                    </Typography>
                    <Typography variant="caption">Excellent (≥90%)</Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Box p={2} bgcolor="#e3f2fd" borderRadius={1}>
                    <Typography variant="h6" color="primary">
                      {stats.gradeDistribution.good}
                    </Typography>
                    <Typography variant="caption">Good (70-89%)</Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Box p={2} bgcolor="#fff8e1" borderRadius={1}>
                    <Typography variant="h6" color="warning">
                      {stats.gradeDistribution.average}
                    </Typography>
                    <Typography variant="caption">Average (50-69%)</Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Box p={2} bgcolor="#ffebee" borderRadius={1}>
                    <Typography variant="h6" color="error">
                      {stats.gradeDistribution.poor}
                    </Typography>
                    <Typography variant="caption">Poor (&lt;50%)</Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        )}

        {/* Tabs */}
        <Card>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs
              value={tabValue}
              onChange={(e, val) => setTabValue(val)}
              aria-label="submission tabs"
            >
              <Tab label={`✅ Submitted (${submissions.length})`} />
              <Tab label={`❌ Not Submitted (${notSubmitted.length})`} />
            </Tabs>
          </Box>

          {/* Submitted Tab */}
          {tabValue === 0 && (
            <CardContent>
              <Box sx={{ mb: 2 }}>
                <Button
                  onClick={handleDownloadAllAsZip}
                  variant="contained"
                  startIcon={<CloudDownload />}
                  disabled={submissions.length === 0}
                >
                  Download All as ZIP
                </Button>
              </Box>

              {submissions.length === 0 ? (
                <Typography>No submissions yet</Typography>
              ) : (
                <TableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                        <TableCell>Student Name</TableCell>
                        <TableCell align="center">Roll No</TableCell>
                        <TableCell align="center">Class</TableCell>
                        <TableCell>Submitted Date</TableCell>
                        <TableCell align="center">Status</TableCell>
                        <TableCell>File Name</TableCell>
                        <TableCell align="center">Marks</TableCell>
                        <TableCell align="center">Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {submissions.map((item) => (
                        <TableRow key={item.submission._id} hover>
                          <TableCell>{item.student.name}</TableCell>
                          <TableCell align="center">{item.student.rollNum}</TableCell>
                          <TableCell align="center">{item.student.sclassName}</TableCell>
                          <TableCell>
                            {moment(item.submission.submittedAt).format('DD/MM/YYYY HH:mm')}
                          </TableCell>
                          <TableCell align="center">
                            <Chip
                              label={StatusBadge[item.submission.status]?.label}
                              style={{
                                backgroundColor: StatusBadge[item.submission.status]?.bgcolor,
                                color: StatusBadge[item.submission.status]?.color,
                              }}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>{item.submission.fileName}</TableCell>
                          <TableCell align="center">
                            {item.isGraded ? (
                              <Chip
                                label={`${item.submission.marksObtained}`}
                                color={item.submission.marksObtained >= 70 ? 'success' : 'default'}
                              />
                            ) : (
                              <Typography variant="caption" color="textSecondary">
                                -
                              </Typography>
                            )}
                          </TableCell>
                          <TableCell align="center">
                            <Button
                              size="small"
                              onClick={() => handleDownloadFile(
                                item.submission._id,
                                item.submission.fileName
                              )}
                              startIcon={<Download />}
                            >
                              Download
                            </Button>
                            <Button
                              size="small"
                              onClick={() => handleOpenGradeDialog(item)}
                              startIcon={<Edit />}
                            >
                              Grade
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </CardContent>
          )}

          {/* Not Submitted Tab */}
          {tabValue === 1 && (
            <CardContent>
              {notSubmitted.length === 0 ? (
                <Alert severity="success">All students have submitted!</Alert>
              ) : (
                <TableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                        <TableCell>Student Name</TableCell>
                        <TableCell align="center">Roll No</TableCell>
                        <TableCell align="center">Class</TableCell>
                        <TableCell>Email</TableCell>
                        <TableCell align="center">Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {notSubmitted.map((item) => (
                        <TableRow key={item.student._id} hover>
                          <TableCell>{item.student.name}</TableCell>
                          <TableCell align="center">{item.student.rollNum}</TableCell>
                          <TableCell align="center">{item.student.sclassName}</TableCell>
                          <TableCell>{item.student.email}</TableCell>
                          <TableCell align="center">
                            <Chip label="Not Submitted" color="error" size="small" />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </CardContent>
          )}
        </Card>
      </Container>

      {/* Grade Dialog */}
      <Dialog open={gradeDialogOpen} onClose={() => setGradeDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Grade Submission</DialogTitle>
        <DialogContent>
          {selectedSubmission && (
            <Box sx={{ mt: 2, space: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                <strong>Student:</strong> {selectedSubmission.student.name} ({selectedSubmission.student.rollNum})
              </Typography>
              <Typography variant="subtitle2" gutterBottom>
                <strong>File:</strong> {selectedSubmission.submission.fileName}
              </Typography>
              <Button
                onClick={() => handleDownloadFile(
                  selectedSubmission.submission._id,
                  selectedSubmission.submission.fileName
                )}
                startIcon={<Download />}
                variant="outlined"
                sx={{ mt: 1, mb: 2 }}
              >
                Download to Review
              </Button>
              <Divider />
              <TextField
                fullWidth
                type="number"
                label="Marks Obtained"
                value={marks}
                onChange={(e) => setMarks(e.target.value)}
                inputProps={{ min: 0, step: 0.5 }}
                sx={{ mt: 2 }}
              />
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Feedback"
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                sx={{ mt: 2 }}
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setGradeDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleSubmitGrades}
            variant="contained"
            disabled={submitting}
          >
            {submitting ? 'Saving...' : 'Save Grades'}
          </Button>
        </DialogActions>
      </Dialog>
    </PageContainer>
  );
};

export default TeacherSubmissionViewPage;
