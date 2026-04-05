import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Card,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Alert,
  CircularProgress,
  Chip,
  Tooltip,
  IconButton,
  Divider,
} from "@mui/material";
import { CloudUpload, Delete, GetApp, VisibilityOutlined, InfoOutlined } from "@mui/icons-material";
import styled from "styled-components";
import axios from "axios";

const PageContainer = styled(Box)`
  padding: 24px;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  min-height: 100vh;
`;

const HeaderBox = styled(Box)`
  margin-bottom: 24px;
`;

const TeacherAssignments = () => {
  const { currentUser } = useSelector((state) => state.user);
  const navigate = useNavigate();
  const teacherId = currentUser?._id;
  const schoolId = currentUser?.school;
  const API_BASE_URL = process.env.NODE_ENV === 'development'
    ? 'http://localhost:5000'
    : '/api';

  // State for data
  const [teacherSubjects, setTeacherSubjects] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [assignmentsWithStats, setAssignmentsWithStats] = useState([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);

  // State for filtering
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedClass, setSelectedClass] = useState("");
  const [subjectClasses, setSubjectClasses] = useState([]);
  const [allClassesForSubject, setAllClassesForSubject] = useState([]);

  // State for dialog
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedClasses, setSelectedClasses] = useState([]);
  const [startDate, setStartDate] = useState("");
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    dueDate: "",
    totalMarks: 100,
    assignmentType: "file-upload",
    file: null,
  });

  // State for submisison details dialog
  const [openSubmissionsDialog, setOpenSubmissionsDialog] = useState(false);
  const [submissionDetails, setSubmissionDetails] = useState(null);
  const [submissionLoading, setSubmissionLoading] = useState(false);
  const [selectedAssignmentForSubmissions, setSelectedAssignmentForSubmissions] = useState(null);

  // Load teacher subjects on mount
  useEffect(() => {
    if (teacherId) {
      loadTeacherSubjects();
    }
  }, [teacherId]);

  // Load assignments when subject changes
  useEffect(() => {
    if (selectedSubject) {
      loadAssignments();
    } else {
      setAssignments([]);
      setAssignmentsWithStats([]);
      setSelectedClass("");
    }
  }, [selectedSubject]);

  const loadTeacherSubjects = async () => {
    try {
      setLoading(true);
      // Fetch teaching assignments which contain subject and classes
      const response = await axios.get(`${API_BASE_URL}/TeachingAssignment/Teacher/${teacherId}`);
      
      if (response.data.assignments && response.data.assignments.length > 0) {
        // Transform teaching assignments to subjects with classes
        const subjectsMap = {};
        
        response.data.assignments.forEach((teaching) => {
          if (teaching.subject && teaching.classes && teaching.classes.length > 0) {
            const subjectId = teaching.subject._id || teaching.subject;
            
            if (!subjectsMap[subjectId]) {
              subjectsMap[subjectId] = {
                _id: subjectId,
                subName: teaching.subject.subName || teaching.subject,
                classes: []
              };
            }
            
            // Add classes to subject
            if (Array.isArray(teaching.classes)) {
              teaching.classes.forEach(cls => {
                const classId = cls._id || cls;
                const className = cls.sclassName || cls;
                
                // Avoid duplicates
                if (!subjectsMap[subjectId].classes.find(c => (c._id || c) === classId)) {
                  subjectsMap[subjectId].classes.push({
                    _id: classId,
                    sclassName: className
                  });
                }
              });
            }
          }
        });
        
        const subjects = Object.values(subjectsMap);
        setTeacherSubjects(subjects);
        
        if (subjects.length === 0) {
          setError("Bạn chưa được phân công giảng dạy môn nào. Vui lòng liên hệ admin!");
        }
      } else {
        setError("Bạn chưa được phân công giảng dạy. Vui lòng liên hệ admin!");
        setTeacherSubjects([]);
      }
    } catch (err) {
      console.error("Error loading teaching assignments:", err);
      setError(err.response?.data?.message || "Lỗi tải môn học. Vui lòng thử lại!");
      setTeacherSubjects([]);
    } finally {
      setLoading(false);
    }
  };

  const loadAssignments = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${API_BASE_URL}/Assignment/Teacher/${teacherId}?subjectId=${selectedSubject}`
      );
      if (response.data.assignments) {
        setAssignments(response.data.assignments);
        // Get stats for each assignment
        const assignmentsWithStats = response.data.assignments;
        setAssignmentsWithStats(assignmentsWithStats);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Lỗi tải bài tập");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getAssignmentStatus = (assignment) => {
    const now = new Date();
    const dueDate = new Date(assignment.dueDate);
    const startDate = assignment.startDate ? new Date(assignment.startDate) : new Date(assignment.createdAt);

    if (now < startDate) {
      return { status: "Chưa mở", color: "default", icon: "⏳" };
    } else if (now > dueDate) {
      return { status: "Đã hết hạn", color: "error", icon: "❌" };
    } else {
      return { status: "Đang mở", color: "success", icon: "✅" };
    }
  };

  const handleSubjectChange = (e) => {
    const subjectId = e.target.value;
    console.log("🔄 handleSubjectChange - subjectId:", subjectId);
    
    setSelectedSubject(subjectId);
    setSelectedClass("");
    setSelectedClasses([]);

    // Get classes for this subject
    const subject = teacherSubjects.find((s) => s._id === subjectId);
    console.log("🔄 Found subject:", subject);
    
    if (subject && subject.classes && subject.classes.length > 0) {
      const classes = subject.classes;
      console.log("✅ Classes found for subject:", classes);
      console.log("   Class IDs:", classes.map(c => ({ 
        classId: c.classId || c._id, 
        className: c.sclassName,
        type: typeof (c.classId || c._id)
      })));
      
      setAllClassesForSubject(classes);
      setSubjectClasses(classes);
      console.log(`✅ Subject selected: ${subject.subName}, Classes:`, classes);
    } else {
      console.warn("❌ No classes found for subject:", subjectId, subject);
      setSubjectClasses([]);
      setAllClassesForSubject([]);
      setError("Môn học này không có lớp được phân công. Vui lòng chọn môn khác!");
    }
  };

  const handleClassFilterChange = (e) => {
    setSelectedClass(e.target.value);
  };

  const handleCreateClick = () => {
    if (!selectedSubject) {
      setError("❌ Vui lòng chọn một môn học");
      return;
    }
    if (subjectClasses.length === 0) {
      setError("❌ Môn học này không có lớp được phân công");
      return;
    }
    setOpenDialog(true);
  };

  const handleClassChange = (classId) => {
    console.log("📌 Class selected/deselected:", classId);
    setSelectedClasses((prev) => {
      const updated = prev.includes(classId)
        ? prev.filter((id) => id !== classId)
        : [...prev, classId];
      console.log("📌 Updated selectedClasses:", updated);
      return updated;
    });
  };

  const handleFormChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "file") {
      setFormData({ ...formData, file: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async () => {
    try {
      if (!formData.title || !formData.title.trim()) {
        setError("❌ Vui lòng nhập tiêu đề bài tập");
        return;
      }
      if (!formData.dueDate) {
        setError("❌ Vui lòng chọn hạn nộp");
        return;
      }
      if (!selectedClasses || selectedClasses.length === 0) {
        setError("❌ Vui lòng chọn ít nhất một lớp");
        return;
      }

      // ========== DEBUG LOGGING ==========
      console.log("=== ASSIGNMENT SUBMISSION DEBUG ===");
      console.log("✓ teacherId:", teacherId, typeof teacherId);
      console.log("✓ selectedSubject:", selectedSubject, typeof selectedSubject);
      console.log("✓ selectedClasses:", selectedClasses);
      console.log("✓ selectedClasses length:", selectedClasses.length);
      console.log("✓ selectedClasses types:", selectedClasses.map(c => ({ id: c, type: typeof c })));
      console.log("✓ schoolId:", schoolId, typeof schoolId);
      console.log("✓ schoolId._id:", schoolId?._id);
      console.log("✓ formData.title:", formData.title);
      console.log("✓ formData.dueDate:", formData.dueDate);
      console.log("✓ hasFile:", !!formData.file, formData.file?.name);
      console.log("====================================");

      const submitFormData = new FormData();
      submitFormData.append("teacherId", teacherId);
      submitFormData.append("subjectId", selectedSubject);
      
      // Send classIds as JSON string since FormData multi-value doesn't parse well
      const classIdsJson = JSON.stringify(selectedClasses);
      submitFormData.append("classIds", classIdsJson);
      console.log("📤 Sending classIds JSON:", classIdsJson);
      
      submitFormData.append("title", formData.title.trim());
      submitFormData.append("description", formData.description);
      submitFormData.append("startDate", startDate || new Date().toISOString());
      submitFormData.append("dueDate", formData.dueDate);
      submitFormData.append("totalMarks", formData.totalMarks);
      submitFormData.append("assignmentType", formData.assignmentType || 'file-upload');
      // FIX: Send schoolId as string, not object
      submitFormData.append("schoolId", typeof schoolId === 'object' ? schoolId._id : schoolId);
      console.log("📤 Sending schoolId:", typeof schoolId === 'object' ? schoolId._id : schoolId);
      
      if (formData.file) {
        submitFormData.append("assignmentFile", formData.file);
      }

      console.log("📤 Posting to:", `${API_BASE_URL}/Assignment/Create`);

      const response = await axios.post(`${API_BASE_URL}/Assignment/Create`, submitFormData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      console.log("✅ Response:", response.data);

      if (response.data.assignment) {
        setAssignments([response.data.assignment, ...assignments]);
        setAssignmentsWithStats([response.data.assignment, ...assignmentsWithStats]);
        setFormData({
          title: "",
          description: "",
          dueDate: "",
          totalMarks: 100,
          assignmentType: "file-upload",
          file: null,
        });
        setStartDate("");
        setSelectedClasses([]);
        setOpenDialog(false);
        setError(null);
        setSuccess("✅ Tạo bài tập thành công!");
        setTimeout(() => setSuccess(null), 3000);
      }
    } catch (err) {
      console.error("❌ Error creating assignment:", err);
      console.error("📋 Status:", err.response?.status);
      console.error("📋 Message:", err.response?.data?.message);
      console.error("📋 Full Response:", err.response?.data);
      setError("❌ " + (err.response?.data?.message || "Lỗi tạo bài tập. Vui lòng thử lại!"));
    }
  };

  const handleDelete = async (assignmentId) => {
    if (window.confirm("Bạn có chắc muốn xóa bài tập này?")) {
      try {
        await axios.delete(`${API_BASE_URL}/Assignment/${assignmentId}`);
        setAssignments(assignments.filter((a) => a._id !== assignmentId));
        setAssignmentsWithStats(assignmentsWithStats.filter((a) => a._id !== assignmentId));
        setSuccess("Xóa bài tập thành công!");
        setTimeout(() => setSuccess(null), 3000);
      } catch (err) {
        setError(err.response?.data?.message || "Lỗi xóa bài tập");
      }
    }
  };

  const handleViewSubmissions = async (assignment) => {
    try {
      setSubmissionLoading(true);
      setSelectedAssignmentForSubmissions(assignment);
      
      const response = await axios.get(
        `${API_BASE_URL}/Assignment/${assignment._id}/Submissions`
      );
      
      if (response.data) {
        setSubmissionDetails(response.data);
        setOpenSubmissionsDialog(true);
      }
    } catch (err) {
      setError("Lỗi tải thông tin nộp bài");
      console.error(err);
    } finally {
      setSubmissionLoading(false);
    }
  };

  const handleViewFullSubmissions = (assignment) => {
    navigate(`submissions/${assignment._id}`);
  };

  const handleDownloadFile = (fileUrl, fileName) => {
    if (fileUrl) {
      const link = document.createElement("a");
      link.href = `${API_BASE_URL}${fileUrl}`;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  // Filter assignments by selected class
  const filteredAssignments = selectedClass
    ? assignmentsWithStats.filter((a) =>
        a.classes?.some((cls) => cls._id === selectedClass)
      )
    : assignmentsWithStats;

  return (
    <PageContainer>
      <HeaderBox>
        <Typography variant="h4" fontWeight={700} gutterBottom>
          📚 Quản lý Bài tập
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Tạo, quản lý bài tập và theo dõi tiến độ nộp bài của học sinh
        </Typography>
      </HeaderBox>

      {error && (
        <Alert 
          severity="error" 
          onClose={() => setError(null)} 
          sx={{ mb: 2 }}
          action={
            <Button color="inherit" size="small" onClick={loadTeacherSubjects}>
              Thử lại
            </Button>
          }
        >
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" onClose={() => setSuccess(null)} sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      {/* Filter Section */}
      <Paper sx={{ p: 2, mb: 3, borderRadius: 2, boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
        {loading && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <CircularProgress size={20} />
            <Typography>Đang tải dữ liệu...</Typography>
          </Box>
        )}
        
        {teacherSubjects.length === 0 && !loading && (
          <Alert severity="info" sx={{ mb: 2 }}>
            📢 Bạn chưa được phân công giảng dạy môn nào hoặc chưa có dữ liệu. 
            Vui lòng liên hệ quản trị viên để được phân công.
          </Alert>
        )}

        <Grid container spacing={2} alignItems="flex-end">
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth disabled={teacherSubjects.length === 0}>
              <InputLabel>Chọn môn học</InputLabel>
              <Select
                value={selectedSubject}
                label="Chọn môn học"
                onChange={handleSubjectChange}
              >
                <MenuItem value="">-- Chọn môn học --</MenuItem>
                {teacherSubjects.map((subject) => (
                  <MenuItem key={subject._id} value={subject._id}>
                    {subject.subName} ({subject.classes?.length || 0} lớp)
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth disabled={!selectedSubject || subjectClasses.length === 0}>
              <InputLabel>Chọn lớp học (tùy chọn)</InputLabel>
              <Select
                value={selectedClass}
                label="Chọn lớp học (tùy chọn)"
                onChange={handleClassFilterChange}
              >
                <MenuItem value="">-- Tất cả lớp --</MenuItem>
                {allClassesForSubject.map((cls) => (
                  <MenuItem key={cls._id} value={cls._id}>
                    {cls.sclassName}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Button
              variant="contained"
              startIcon={<CloudUpload />}
              fullWidth
              onClick={handleCreateClick}
              disabled={!selectedSubject}
              sx={{ height: "56px", fontWeight: 600 }}
            >
               Tạo bài tập
            </Button>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Button
              variant="outlined"
              fullWidth
              onClick={loadAssignments}
              disabled={!selectedSubject}
              sx={{ height: "56px", fontWeight: 600 }}
            >
              🔄 Làm mới
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Create Assignment Dialog */}
      <Dialog 
        open={openDialog} 
        onClose={() => {
          setOpenDialog(false);
          setError(null);
        }} 
        maxWidth="sm" 
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 600, fontSize: '1.2rem' }}>Tạo bài tập mới</DialogTitle>
        <Divider />
        <DialogContent sx={{ pt: 2 }}>
          {/* Select Classes */}
          <Box sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="subtitle2" fontWeight={600} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <InfoOutlined fontSize="small" color="primary" />
                Chọn lớp học (ít nhất 1 lớp) *
              </Typography>
              {subjectClasses.length > 0 && (
                <Button
                  size="small"
                  variant="text"
                  onClick={() => {
                    const allClassIds = subjectClasses.map(c => c._id);
                    console.log("🔘 'Select All' clicked - allClassIds:", allClassIds);
                    console.log("   Classes structure:", subjectClasses);
                    setSelectedClasses(allClassIds);
                  }}
                  sx={{ fontSize: '0.75rem' }}
                >
                  Chọn tất cả
                </Button>
              )}
            </Box>
            <FormGroup>
              {subjectClasses && subjectClasses.length > 0 ? (
                subjectClasses.map((sclass) => {
                  console.log("🗂️  Rendering class:", { 
                    _id: sclass._id, 
                    sclassName: sclass.sclassName,
                    classId: sclass.classId,
                    structure: sclass 
                  });
                  return (
                    <FormControlLabel
                      key={sclass._id}
                      control={
                        <Checkbox
                          checked={selectedClasses.includes(sclass._id)}
                          onChange={() => {
                            console.log("✓ Checkbox toggled for:", sclass._id, sclass.sclassName);
                            handleClassChange(sclass._id);
                          }}
                        />
                      }
                      label={sclass.sclassName}
                    />
                  );
                })
              ) : (
                <Typography variant="caption" color="error" sx={{ p: 1 }}>
                  ⚠️ Không có lớp học nào. Vui lòng chọn lại môn học.
                </Typography>
              )}
            </FormGroup>
            {selectedClasses.length === 0 && subjectClasses.length > 0 && (
              <Typography variant="caption" color="error" sx={{ mt: 1, display: 'block' }}>
                ⚠️ Vui lòng chọn ít nhất một lớp
              </Typography>
            )}
          </Box>

          <Divider sx={{ my: 2 }} />

          <TextField
            fullWidth
            label="Tiêu đề bài tập *"
            name="title"
            value={formData.title}
            onChange={handleFormChange}
            margin="normal"
            required
            placeholder="VD: Bài tập về hàm số"
          />

          <TextField
            fullWidth
            label="Mô tả chi tiết"
            name="description"
            value={formData.description}
            onChange={handleFormChange}
            margin="normal"
            multiline
            rows={3}
            placeholder="Nhập hướng dẫn, yêu cầu chi tiết..."
          />

          <Grid container spacing={2} sx={{ mt: 0 }}>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Ngày bắt đầu"
                name="startDate"
                type="datetime-local"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Hạn chót *"
                name="dueDate"
                type="datetime-local"
                value={formData.dueDate}
                onChange={handleFormChange}
                required
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
          </Grid>

          <TextField
            fullWidth
            label="Tổng điểm"
            name="totalMarks"
            type="number"
            value={formData.totalMarks}
            onChange={handleFormChange}
            margin="normal"
            inputProps={{ min: 1, max: 1000 }}
          />

          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Loại bài tập *</InputLabel>
            <Select
              name="assignmentType"
              label="Loại bài tập *"
              value={formData.assignmentType || 'file-upload'}
              onChange={handleFormChange}
            >
              <MenuItem value="essay">📝 Bài tự luận</MenuItem>
              <MenuItem value="multiple-choice">❓ Bài trắc nghiệm</MenuItem>
              <MenuItem value="file-upload">📎 Upload file</MenuItem>
              <MenuItem value="project">🎯 Dự án</MenuItem>
              <MenuItem value="coding">💻 Bài lập trình</MenuItem>
            </Select>
          </FormControl>

          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
              📎 Tải lên file bài tập (tùy chọn)
            </Typography>
            <Button
              variant="outlined"
              component="label"
              fullWidth
              startIcon={<CloudUpload />}
              sx={{ py: 2 }}
            >
              Chọn tệp
              <input
                hidden
                type="file"
                name="file"
                onChange={handleFormChange}
                accept=".pdf,.doc,.docx,.txt,.xlsx,.pptx,.jpg,.png,.zip,.rar"
              />
            </Button>
            {formData.file && (
              <Box sx={{ mt: 1, p: 1.5, backgroundColor: '#f0f7ff', borderRadius: 1 }}>
                <Typography variant="caption" sx={{ color: '#2563eb', fontWeight: 500 }}>
                  ✓ Tệp: {formData.file.name}
                </Typography>
              </Box>
            )}
          </Box>
        </DialogContent>
        <Divider />
        <DialogActions sx={{ p: 2 }}>
          <Button 
            onClick={() => {
              setOpenDialog(false);
              setFormData({
                title: "",
                description: "",
                dueDate: "",
                totalMarks: 100,
                assignmentType: "file-upload",
                file: null,
              });
              setStartDate("");
              setSelectedClasses([]);
              setError(null);
            }}
          >
            Hủy
          </Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained"
            disabled={!selectedSubject || selectedClasses.length === 0 || !formData.dueDate}
          >
            Tạo bài tập
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Submissions Dialog */}
      <Dialog 
        open={openSubmissionsDialog}
        onClose={() => {
          setOpenSubmissionsDialog(false);
          setSubmissionDetails(null);
        }}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 600 }}>
          Chi tiết nộp bài - {selectedAssignmentForSubmissions?.title}
        </DialogTitle>
        <Divider />
        <DialogContent sx={{ pt: 2 }}>
          {submissionLoading ? (
            <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
              <CircularProgress />
            </Box>
          ) : submissionDetails ? (
            <Box>
              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={6} sm={4}>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>Tổng học sinh:</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 700, color: '#2563eb' }}>
                    {submissionDetails.totalStudents || 0}
                  </Typography>
                </Grid>
                <Grid item xs={6} sm={4}>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>Đã nộp:</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 700, color: '#059669' }}>
                    {submissionDetails.submittedCount || 0}
                  </Typography>
                </Grid>
                <Grid item xs={6} sm={4}>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>Chưa nộp:</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 700, color: '#dc2626' }}>
                    {(submissionDetails.totalStudents || 0) - (submissionDetails.submittedCount || 0)}
                  </Typography>
                </Grid>
              </Grid>
              
              {submissionDetails.submissions && submissionDetails.submissions.length > 0 ? (
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ backgroundColor: '#f1f5f9' }}>
                        <TableCell fontWeight="bold">Học sinh</TableCell>
                        <TableCell align="center">Trạng thái</TableCell>
                        <TableCell align="center">Thời gian nộp</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {submissionDetails.submissions.map((submission) => (
                        <TableRow key={submission._id} hover>
                          <TableCell>
                            <Typography variant="body2">
                              {submission.student?.name} ({submission.student?.rollNum})
                            </Typography>
                          </TableCell>
                          <TableCell align="center">
                            <Chip
                              label={submission.status === 'graded' ? 'Đã chấm' : submission.status === 'late' ? 'Trễ hạn' : submission.status === 'submitted' ? 'Đã nộp' : 'Chưa nộp'}
                              color={
                                submission.status === 'graded' ? 'info' :
                                submission.status === 'late' ? 'warning' :
                                submission.status === 'submitted' ? 'success' : 'default'
                              }
                              size="small"
                            />
                          </TableCell>
                          <TableCell align="center">
                            <Typography variant="caption">
                              {submission.submittedAt
                                ? new Date(submission.submittedAt).toLocaleDateString('vi-VN')
                                : 'N/A'}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Typography color="text.secondary" align="center">
                  Chưa có thông tin nộp bài
                </Typography>
              )}
            </Box>
          ) : (
            <Typography color="text.secondary">Không có thông tin</Typography>
          )}
        </DialogContent>
        <Divider />
        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={() => {
              setOpenSubmissionsDialog(false);
              setSubmissionDetails(null);
            }}
          >
            Đóng
          </Button>
        </DialogActions>
      </Dialog>

      {/* Assignments List */}
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
          <CircularProgress />
        </Box>
      ) : filteredAssignments.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: "center", borderRadius: 2 }}>
          <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
            {selectedSubject ? "Chưa có bài tập nào" : "👈 Hãy chọn một môn học"}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {selectedSubject && "Nhấn nút 'Tạo bài tập' để bắt đầu"}
          </Typography>
        </Paper>
      ) : (
        <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: "#f1f5f9" }}>
                <TableCell fontWeight="bold">📝 Tiêu đề</TableCell>
                <TableCell align="center" fontWeight="bold">📅 Hạn chót</TableCell>
                <TableCell align="center" fontWeight="bold">🏛️ Lớp</TableCell>
                <TableCell align="center" fontWeight="bold">🔔 Trạng thái</TableCell>
                <TableCell align="center" fontWeight="bold">✅ Nộp bài</TableCell>
                <TableCell align="center" fontWeight="bold">⚙️ Hành động</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredAssignments.map((assignment) => {
                const statusInfo = getAssignmentStatus(assignment);
                return (
                  <TableRow key={assignment._id} hover sx={{ '&:hover': { backgroundColor: 'rgba(37, 99, 235, 0.04)' } }}>
                    <TableCell>
                      <Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                          <Typography fontWeight="600">
                            {assignment.title}
                          </Typography>
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
                            sx={{ height: '20px' }}
                          />
                        </Box>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                          {assignment.description?.substring(0, 60)}
                          {assignment.description?.length > 60 ? '...' : ''}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                          Điểm: {assignment.totalMarks}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell align="center">
                      <Typography variant="small" sx={{ fontWeight: 500 }}>
                        {new Date(assignment.dueDate).toLocaleDateString("vi-VN")}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {new Date(assignment.dueDate).toLocaleTimeString("vi-VN", { hour: '2-digit', minute: '2-digit' })}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap", justifyContent: 'center' }}>
                        {assignment.classes?.length > 2 ? (
                          <>
                            {assignment.classes.slice(0, 2).map((cls) => (
                              <Chip key={cls._id} label={cls.sclassName} size="small" variant="outlined" />
                            ))}
                            <Chip label={`+${assignment.classes.length - 2}`} size="small" variant="filled" />
                          </>
                        ) : (
                          assignment.classes?.map((cls) => (
                            <Chip key={cls._id} label={cls.sclassName} size="small" variant="outlined" />
                          ))
                        )}
                      </Box>
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={statusInfo.status}
                        color={statusInfo.color}
                        variant="outlined"
                        size="small"
                        icon={<span>{statusInfo.icon}</span>}
                        sx={{ fontWeight: 600 }}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title={`${assignment.submissionCount || 0} học sinh đã nộp`}>
                        <Chip
                          label={
                            assignment.submissionCount || submissionDetails?.submittedCount
                              ? `${assignment.submissionCount || submissionDetails?.submittedCount}/`
                              : "0/"
                          }
                          color={
                            assignment.submissionCount > 0 ? "success" : "warning"
                          }
                          variant="outlined"
                          size="small"
                          sx={{ fontWeight: 600 }}
                        />
                      </Tooltip>
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title="Chi tiết nộp bài">
                        <IconButton
                          size="small"
                          onClick={() => handleViewSubmissions(assignment)}
                          color="primary"
                        >
                          <VisibilityOutlined fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Quản lý nộp bài chi tiết">
                        <IconButton
                          size="small"
                          onClick={() => handleViewFullSubmissions(assignment)}
                          color="success"
                        >
                          📊
                        </IconButton>
                      </Tooltip>
                      {assignment.assignmentFile?.fileUrl && (
                        <Tooltip title="Tải về file">
                          <IconButton
                            size="small"
                            onClick={() => handleDownloadFile(assignment.assignmentFile.fileUrl, assignment.assignmentFile.fileName)}
                            color="info"
                          >
                            <GetApp fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                      <Tooltip title="Xóa bài tập">
                        <IconButton
                          size="small"
                          onClick={() => handleDelete(assignment._id)}
                          color="error"
                        >
                          <Delete fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </PageContainer>
  );
};

export default TeacherAssignments;
