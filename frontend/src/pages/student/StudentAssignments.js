import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import {
    Box,
    Paper,
    Tabs,
    Tab,
    Table,
    TableBody,
    TableContainer,
    TableHead,
    TableRow,
    TableCell,
    Typography,
    Alert,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    CircularProgress,
    Chip,
    Card,
    CardContent,
    Grid,
} from '@mui/material';
import { StyledTableCell, StyledTableRow } from '../../components/styles';
import { CloudUpload, Download, Visibility } from '@mui/icons-material';
import { submitAssignment } from '../../services/assignmentService';

const API_BASE_URL = process.env.NODE_ENV === 'development'
    ? 'http://localhost:5000'
    : '/api';

function TabPanel(props) {
    const { children, value, index, ...other } = props;
    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`assignment-tabpanel-${index}`}
            aria-labelledby={`assignment-tab-${index}`}
            {...other}
        >
            {value === index && (
                <Box sx={{ pt: 3 }}>
                    {children}
                </Box>
            )}
        </div>
    );
}

const StudentAssignments = () => {
    const { currentUser } = useSelector((state) => state.user);
    const [tabValue, setTabValue] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [subjects, setSubjects] = useState([]);
    const [assignments, setAssignments] = useState([]);
    const [grades, setGrades] = useState([]);
    const [gradesBySubject, setGradesBySubject] = useState([]);
    const [selectedSubject, setSelectedSubject] = useState('');
    const [detailDialog, setDetailDialog] = useState(false);
    const [selectedAssignment, setSelectedAssignment] = useState(null);
    const [uploadFile, setUploadFile] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (currentUser?._id) {
            loadStudentData();
        }
    }, [currentUser?._id]);

    const loadStudentData = async () => {
        try {
            setLoading(true);
            setError(null);

            // Load subjects
            const subjectRes = await fetch(`${API_BASE_URL}/Student/${currentUser._id}/Subjects`);
            const subjectData = await subjectRes.json();
            if (subjectData.subjects) {
                setSubjects(subjectData.subjects);
                if (subjectData.subjects.length > 0) {
                    setSelectedSubject(subjectData.subjects[0]._id);
                }
            }

            // Load assignments
            const assignmentRes = await fetch(`${API_BASE_URL}/Assignment/Student/${currentUser._id}`);
            const assignmentData = await assignmentRes.json();
            if (assignmentData.assignments) {
                setAssignments(assignmentData.assignments);
            }

            // Load grades
            const gradeRes = await fetch(`${API_BASE_URL}/Student/${currentUser._id}/Grades`);
            const gradeData = await gradeRes.json();
            if (gradeData.submissions) {
                setGrades(gradeData.submissions);
                setGradesBySubject(gradeData.statsBySubject || []);
            }
        } catch (err) {
            console.error('Error loading student data:', err);
            setError('Lỗi khi tải dữ liệu. Vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    };

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
    };

    const handleSubjectChange = (e) => {
        setSelectedSubject(e.target.value);
    };

    const handleAdditionalInfo = (assignment) => {
        setSelectedAssignment(assignment);
        setDetailDialog(true);
    };

    const handleCloseDialog = () => {
        setDetailDialog(false);
        setSelectedAssignment(null);
        setUploadFile(null);
    };

    const handleFileChange = (e) => {
        setUploadFile(e.target.files[0]);
    };

    const handleSubmitAssignment = async () => {
        if (!uploadFile) {
            setError('Vui lòng chọn file để nộp');
            return;
        }

        if (!selectedAssignment) {
            setError('Vui lòng chọn bài tập');
            return;
        }

        try {
            setSubmitting(true);
            setError(null);

            // Extract IDs from nested objects
            const subjectId = selectedAssignment.subject?._id || selectedAssignment.subject;
            const classId = currentUser.sclassName?._id || currentUser.sclassName;
            const schoolId = currentUser.school?._id || currentUser.school;

            // Validate required fields
            if (!subjectId || !classId || !schoolId) {
                setError('Không tìm thấy thông tin sinh viên hoặc môn học. Vui lòng đăng nhập lại.');
                setSubmitting(false);
                return;
            }

            const formData = new FormData();
            formData.append('submissionFile', uploadFile);
            formData.append('assignmentId', selectedAssignment._id);
            formData.append('studentId', currentUser._id);
            formData.append('subjectId', subjectId);
            formData.append('classId', classId);
            formData.append('schoolId', schoolId);

            const data = await submitAssignment(formData);

            if (data.submission || data.message?.includes('successfully')) {
                setError(null);
                alert('Nộp bài thành công!');
                setUploadFile(null);
                handleCloseDialog();
                // Reload assignments
                loadStudentData();
            } else {
                setError(data.message || 'Lỗi khi nộp bài');
            }
        } catch (err) {
            console.error('Error submitting assignment:', err);
            setError('Lỗi khi nộp bài. Vui lòng thử lại.');
        } finally {
            setSubmitting(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'submitted':
                return '#22c55e';
            case 'late':
                return '#f59e0b';
            case 'pending':
                return '#9ca3af';
            case 'graded':
                return '#3b82f6';
            default:
                return '#6b7280';
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'submitted':
                return '✓ Đã nộp';
            case 'late':
                return '⏱ Trễ hạn';
            case 'pending':
                return '⏳ Chưa nộp';
            case 'graded':
                return '📋 Đã chấm';
            default:
                return status;
        }
    };

    const filteredAssignments = selectedSubject
        ? assignments.filter(a => a.subject._id === selectedSubject)
        : assignments;

    const filteredGrades = selectedSubject
        ? grades.filter(g => g.subject._id === selectedSubject)
        : grades;

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
            {/* Header */}
            <Box sx={{ marginBottom: '32px' }}>
                <Typography variant="h4" fontWeight={700} gutterBottom>
                    📝 Bài Tập
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    Quản lý bài tập, nộp bài, và xem điểm
                </Typography>
            </Box>

            {error && (
                <Alert severity="error" onClose={() => setError(null)} sx={{ mb: '24px' }}>
                    {error}
                </Alert>
            )}

            {/* Subject Filter */}
            <Box sx={{ mb: '24px' }}>
                <FormControl sx={{ minWidth: '250px' }}>
                    <InputLabel>Chọn Môn Học</InputLabel>
                    <Select
                        value={selectedSubject}
                        onChange={handleSubjectChange}
                        label="Chọn Môn Học"
                    >
                        {subjects.map((subject) => (
                            <MenuItem key={subject._id} value={subject._id}>
                                {subject.subName} ({subject.subCode})
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Box>

            {/* Tabs */}
            <Paper sx={{ borderRadius: '12px', overflow: 'hidden' }}>
                <Tabs
                    value={tabValue}
                    onChange={handleTabChange}
                    aria-label="assignment tabs"
                    sx={{
                        backgroundColor: '#f8fafc',
                        borderBottom: '2px solid #e2e8f0',
                        '& .MuiTab-root': {
                            textTransform: 'capitalize',
                            fontSize: '1rem',
                            fontWeight: 500,
                            color: '#64748b',
                            '&.Mui-selected': {
                                color: '#667eea',
                                fontWeight: 700,
                            }
                        }
                    }}
                >
                    <Tab label="📋 Xem Bài Tập" id="assignment-tab-0" />
                    <Tab label="📤 Nộp Bài" id="assignment-tab-1" />
                    <Tab label="⭐ Xem Điểm" id="assignment-tab-2" />
                </Tabs>

                {/* Tab 1: View Assignments */}
                <TabPanel value={tabValue} index={0}>
                    {filteredAssignments.length === 0 ? (
                        <Alert severity="info">
                            Không có bài tập nào cho môn học này.
                        </Alert>
                    ) : (
                        <TableContainer>
                            <Table>
                                <TableHead>
                                    <StyledTableRow>
                                        <StyledTableCell align="left" style={{ minWidth: 200 }}>
                                            Tiêu Đề
                                        </StyledTableCell>
                                        <StyledTableCell align="left" style={{ minWidth: 120 }}>
                                            Hạn Nộp
                                        </StyledTableCell>
                                        <StyledTableCell align="center" style={{ minWidth: 100 }}>
                                            Trạng Thái
                                        </StyledTableCell>
                                        <StyledTableCell align="left" style={{ minWidth: 100 }}>
                                            Giáo Viên
                                        </StyledTableCell>
                                        <StyledTableCell align="center" style={{ minWidth: 80 }}>
                                            Hành Động
                                        </StyledTableCell>
                                    </StyledTableRow>
                                </TableHead>
                                <TableBody>
                                    {filteredAssignments.map((assignment) => (
                                        <StyledTableRow hover key={assignment._id}>
                                            <TableCell align="left">
                                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                                                    <Typography variant="body2" fontWeight={500}>
                                                        {assignment.title}
                                                    </Typography>
                                                    {assignment.assignmentType && (
                                                        <Chip
                                                            label={(() => {
                                                                const typeLabels = {
                                                                    'essay': '📝 Tự luận',
                                                                    'multiple-choice': '❓ Trắc nghiệm',
                                                                    'file-upload': '📎 Upload file',
                                                                    'project': '🎯 Dự án',
                                                                    'coding': '💻 Lập trình'
                                                                };
                                                                return typeLabels[assignment.assignmentType] || assignment.assignmentType;
                                                            })()}
                                                            size="small"
                                                            variant="outlined"
                                                            sx={{ width: 'fit-content', height: '20px' }}
                                                        />
                                                    )}
                                                </Box>
                                            </TableCell>
                                            <TableCell align="left">
                                                <Typography variant="body2">
                                                    {new Date(assignment.dueDate).toLocaleDateString('vi-VN')}
                                                </Typography>
                                            </TableCell>
                                            <TableCell align="center">
                                                <Chip
                                                    label={getStatusText(assignment.submission?.status || 'pending')}
                                                    size="small"
                                                    sx={{
                                                        backgroundColor: getStatusColor(assignment.submission?.status || 'pending'),
                                                        color: 'white',
                                                        fontWeight: 600,
                                                    }}
                                                />
                                            </TableCell>
                                            <TableCell align="left">
                                                <Typography variant="body2">
                                                    {assignment.teacher?.name || 'N/A'}
                                                </Typography>
                                            </TableCell>
                                            <TableCell align="center">
                                                <Button
                                                    size="small"
                                                    startIcon={<Visibility />}
                                                    onClick={() => handleAdditionalInfo(assignment)}
                                                    sx={{ color: '#667eea' }}
                                                >
                                                    Chi Tiết
                                                </Button>
                                            </TableCell>
                                        </StyledTableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    )}
                </TabPanel>

                {/* Tab 2: Submit Assignment */}
                <TabPanel value={tabValue} index={1}>
                    {filteredAssignments.length === 0 ? (
                        <Alert severity="info">
                            Không có bài tập nào để nộp.
                        </Alert>
                    ) : (
                        <Grid container spacing={2}>
                            {filteredAssignments.map((assignment) => (
                                <Grid item xs={12} md={6} key={assignment._id}>
                                    <Card sx={{
                                        borderRadius: '12px',
                                        border: '1px solid #e2e8f0',
                                        '&:hover': {
                                            boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
                                        }
                                    }}>
                                        <CardContent>
                                            <Box sx={{ mb: '16px' }}>
                                                <Typography variant="h6" fontWeight={700} gutterBottom>
                                                    {assignment.title}
                                                </Typography>
                                                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1 }}>
                                                    <Chip
                                                        label={getStatusText(assignment.submission?.status || 'pending')}
                                                        size="small"
                                                        sx={{
                                                            backgroundColor: getStatusColor(assignment.submission?.status || 'pending'),
                                                            color: 'white',
                                                        }}
                                                    />
                                                    {assignment.assignmentType && (
                                                        <Chip
                                                            label={(() => {
                                                                const typeLabels = {
                                                                    'essay': '📝 Tự luận',
                                                                    'multiple-choice': '❓ Trắc nghiệm',
                                                                    'file-upload': '📎 Upload file',
                                                                    'project': '🎯 Dự án',
                                                                    'coding': '💻 Lập trình'
                                                                };
                                                                return typeLabels[assignment.assignmentType] || assignment.assignmentType;
                                                            })()}
                                                            size="small"
                                                            variant="outlined"
                                                        />
                                                    )}
                                                </Box>
                                            </Box>

                                            <Box sx={{ mb: '12px' }}>
                                                <Typography variant="caption" color="text.secondary" display="block">
                                                    Hạn nộp: {new Date(assignment.dueDate).toLocaleDateString('vi-VN')}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary" display="block">
                                                    Điểm tối đa: {assignment.totalMarks || 100 } điểm
                                                </Typography>
                                            </Box>

                                            {assignment.submission?.submittedAt && (
                                                <Box sx={{ mb: '12px', p: '8px', backgroundColor: '#eff6ff', borderRadius: '6px' }}>
                                                    <Typography variant="caption" display="block">
                                                        Đã nộp: {new Date(assignment.submission.submittedAt).toLocaleDateString('vi-VN')}
                                                    </Typography>
                                                    {assignment.submission.submissionFile?.fileName && (
                                                        <Button
                                                            size="small"
                                                            startIcon={<Download />}
                                                            sx={{ color: '#2563eb', mt: '4px' }}
                                                        >
                                                            {assignment.submission.submissionFile.fileName}
                                                        </Button>
                                                    )}
                                                </Box>
                                            )}

                                            {assignment.submission?.status !== 'graded' && (
                                                <Button
                                                    fullWidth
                                                    variant="contained"
                                                    startIcon={<CloudUpload />}
                                                    onClick={() => handleAdditionalInfo(assignment)}
                                                    sx={{
                                                        backgroundColor: '#667eea',
                                                        '&:hover': { backgroundColor: '#5568d3' }
                                                    }}
                                                >
                                                    Nộp / Nộp Lại
                                                </Button>
                                            )}
                                        </CardContent>
                                    </Card>
                                </Grid>
                            ))}
                        </Grid>
                    )}
                </TabPanel>

                {/* Tab 3: View Grades */}
                <TabPanel value={tabValue} index={2}>
                    {filteredGrades.length === 0 ? (
                        <Alert severity="info">
                            Chưa có điểm nào được công bố.
                        </Alert>
                    ) : (
                        <>
                            {/* Grades Summary by Subject */}
                            {gradesBySubject.length > 0 && (
                                <Box sx={{ mb: '32px' }}>
                                    <Typography variant="h6" fontWeight={700} sx={{ mb: '16px' }}>
                                        📊 Thống Kê Điểm Theo Môn
                                    </Typography>
                                    <TableContainer component={Paper} sx={{ borderRadius: '8px' }}>
                                        <Table>
                                            <TableHead>
                                                <TableRow sx={{ backgroundColor: '#f8fafc' }}>
                                                    <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Môn Học</TableCell>
                                                    <TableCell align="right" sx={{ fontWeight: 700, color: '#475569' }}>Tổng Điểm</TableCell>
                                                    <TableCell align="right" sx={{ fontWeight: 700, color: '#475569' }}>Điểm Đạt</TableCell>
                                                    <TableCell align="right" sx={{ fontWeight: 700, color: '#475569' }}>Tỷ Lệ (%)</TableCell>
                                                    <TableCell align="center" sx={{ fontWeight: 700, color: '#475569' }}>Số Bài</TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {gradesBySubject.map((stat) => (
                                                    <TableRow key={stat.subjectId} hover>
                                                        <TableCell>
                                                            <Typography variant="body2" fontWeight={600}>
                                                                {stat.subName}
                                                            </Typography>
                                                        </TableCell>
                                                        <TableCell align="right">{stat.totalMarks}</TableCell>
                                                        <TableCell align="right" sx={{ fontWeight: 600, color: '#2563eb' }}>
                                                            {stat.obtainedMarks.toFixed(1)}
                                                        </TableCell>
                                                        <TableCell align="right" sx={{ fontWeight: 600, color: stat.gradePercentage >= 70 ? '#22c55e' : '#ef4444' }}>
                                                            {stat.gradePercentage}%
                                                        </TableCell>
                                                        <TableCell align="center">{stat.assignmentCount}</TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                </Box>
                            )}

                            {/* Detailed Grades */}
                            <Typography variant="h6" fontWeight={700} sx={{ mb: '16px' }}>
                                📝 Chi Tiết Điểm
                            </Typography>
                            <TableContainer component={Paper} sx={{ borderRadius: '8px' }}>
                                <Table>
                                    <TableHead>
                                        <TableRow sx={{ backgroundColor: '#f8fafc' }}>
                                            <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Bài Tập</TableCell>
                                            <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Điểm Tối Đa</TableCell>
                                            <TableCell align="right" sx={{ fontWeight: 700, color: '#475569' }}>Điểm Đạt</TableCell>
                                            <TableCell align="right" sx={{ fontWeight: 700, color: '#475569' }}>Tỷ Lệ</TableCell>
                                            <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Nhận Xét</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {filteredGrades.map((submission) => (
                                            <TableRow key={submission._id} hover>
                                                <TableCell>
                                                    <Typography variant="body2" fontWeight={500}>
                                                        {submission.assignment?.title}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell>
                                                    <Typography variant="body2">
                                                        {submission.assignment?.totalMarks || 100}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell align="right">
                                                    <Typography variant="body2" fontWeight={600} sx={{ color: '#2563eb' }}>
                                                        {submission.marksObtained}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell align="right">
                                                    <Typography 
                                                        variant="body2" 
                                                        fontWeight={600}
                                                        sx={{
                                                            color: (submission.marksObtained / submission.assignment?.totalMarks) * 100 >= 70 ? '#22c55e' : '#ef4444'
                                                        }}
                                                    >
                                                        {(((submission.marksObtained / submission.assignment?.totalMarks) || 0) * 100).toFixed(1)}%
                                                    </Typography>
                                                </TableCell>
                                                <TableCell>
                                                    <Typography variant="body2" sx={{ color: '#64748b' }}>
                                                        {submission.feedback || 'Chưa có nhận xét'}
                                                    </Typography>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </>
                    )}
                </TabPanel>
            </Paper>

            {/* Assignment Detail & Submit Dialog */}
            <Dialog open={detailDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
                <DialogTitle>
                    {tabValue === 0 ? 'Chi Tiết Bài Tập' : 'Nộp Bài'}
                </DialogTitle>
                <DialogContent>
                    {selectedAssignment && (
                        <Box sx={{ pt: 2 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                                <Typography variant="h6" fontWeight={700}>
                                    {selectedAssignment.title}
                                </Typography>
                                {selectedAssignment.assignmentType && (
                                    <Chip
                                        label={(() => {
                                            const typeLabels = {
                                                'essay': '📝 Tự luận',
                                                'multiple-choice': '❓ Trắc nghiệm',
                                                'file-upload': '📎 Upload file',
                                                'project': '🎯 Dự án',
                                                'coding': '💻 Lập trình'
                                            };
                                            return typeLabels[selectedAssignment.assignmentType] || selectedAssignment.assignmentType;
                                        })()}
                                        size="small"
                                        variant="outlined"
                                    />
                                )}
                            </Box>

                            <Box sx={{ mb: '16px' }}>
                                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                    Mô Tả:
                                </Typography>
                                <Typography variant="body2">
                                    {selectedAssignment.description || 'Không có mô tả'}
                                </Typography>
                            </Box>

                            <Box sx={{ mb: '16px' }}>
                                <Typography variant="subtitle2" color="text.secondary">
                                    Hạn nộp: <strong>{new Date(selectedAssignment.dueDate).toLocaleDateString('vi-VN')}</strong>
                                </Typography>
                                <Typography variant="subtitle2" color="text.secondary">
                                    Điểm tối đa: <strong>{selectedAssignment.totalMarks || 100} điểm</strong>
                                </Typography>
                            </Box>

                            {selectedAssignment.assignmentFile?.fileUrl && (
                                <Box sx={{ mb: '16px', p: '12px', backgroundColor: '#eff6ff', borderRadius: '8px' }}>
                                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                        📎 File Đề Bài:
                                    </Typography>
                                    <Button
                                        size="small"
                                        startIcon={<Download />}
                                        sx={{ color: '#2563eb' }}
                                    >
                                        {selectedAssignment.assignmentFile.fileName || 'Tải Xuống'}
                                    </Button>
                                </Box>
                            )}

                            {tabValue === 1 && (
                                <Box sx={{ mb: '16px' }}>
                                    <TextField
                                        type="file"
                                        fullWidth
                                        onChange={handleFileChange}
                                        inputProps={{ accept: '.doc,.docx,.pdf,.txt,.jpg,.png,.zip' }}
                                        sx={{ display: 'none' }}
                                        id="file-input"
                                    />
                                    <label htmlFor="file-input">
                                        <Button
                                            variant="outlined"
                                            component="span"
                                            startIcon={<CloudUpload />}
                                            fullWidth
                                            sx={{ mb: '12px', textTransform: 'capitalize' }}
                                        >
                                            {uploadFile ? `✓ ${uploadFile.name}` : 'Chọn File'}
                                        </Button>
                                    </label>
                                    <Typography variant="caption" color="text.secondary" display="block">
                                        Hỗ trợ: .doc, .docx, .pdf, .txt, .jpg, .png, .zip
                                    </Typography>
                                </Box>
                            )}

                            {selectedAssignment.submission?.submittedAt && (
                                <Alert severity="success" sx={{ mb: '16px' }}>
                                    Bạn đã nộp bài vào: {new Date(selectedAssignment.submission.submittedAt).toLocaleString('vi-VN')}
                                </Alert>
                            )}
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog}>Đóng</Button>
                    {tabValue === 1 && (
                        <Button
                            onClick={handleSubmitAssignment}
                            variant="contained"
                            disabled={submitting || !uploadFile}
                            sx={{ backgroundColor: '#667eea' }}
                        >
                            {submitting ? <CircularProgress size={24} /> : 'Nộp Bài'}
                        </Button>
                    )}
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default StudentAssignments;
