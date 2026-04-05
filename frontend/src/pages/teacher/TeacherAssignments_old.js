import React, { useEffect, useState, useCallback } from "react";
import { useSelector } from "react-redux";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
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
  IconButton,
  Tooltip,
} from "@mui/material";
import { CloudUpload, Delete, Edit } from "@mui/icons-material";
import styled from "styled-components";
import {
  getTeacherAssignments,
  getTeacherAssignmentsList,
  createAssignment,
  deleteAssignment,
  getAssignmentSubmissions,
} from "../../services/assignmentService";

const PageContainer = styled(Box)`
  padding: 24px;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  min-height: 100vh;
`;

const HeaderBox = styled(Box)`
  margin-bottom: 24px;
`;

const StatsContainer = styled(Box)`
  margin-bottom: 24px;
  
  .stat-card {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 20px;
    border-radius: 12px;
    text-align: center;
    
    .stat-value {
      font-size: 32px;
      font-weight: bold;
      margin: 10px 0;
    }
    
    .stat-label {
      font-size: 14px;
      opacity: 0.9;
    }
  }
  
  .stat-card.submitted {
    background: linear-gradient(135deg, #56ab2f 0%, #a8e063 100%);
  }
  
  .stat-card.pending {
    background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  }
`;

const TeacherAssignments = () => {
  const { currentUser } = useSelector((state) => state.user);
  const teacherId = currentUser?._id;
  const schoolId = currentUser?.school;

  // State for assignments
  const [teachingAssignments, setTeachingAssignments] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // State for filtering
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedClass, setSelectedClass] = useState("");

  // State for dialog
  const [openDialog, setOpenDialog] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    startDate: "",
    dueDate: "",
    totalMarks: 100,
    file: null,
  });
  
  // Statistics
  const [stats, setStats] = useState({
    totalAssignments: 0,
    avgSubmissionRate: 0,
    totalStudents: 0,
  });

  // Load teaching assignments
  const loadTeachingAssignments = useCallback(async () => {
    try {
      setLoading(true);
      const result = await getTeacherAssignments(teacherId);
      if (result.assignments) {
        setTeachingAssignments(result.assignments);
      }
    } catch (err) {
      setError(err.message || "Error loading teaching assignments");
    } finally {
      setLoading(false);
    }
  }, [teacherId]);

  useEffect(() => {
    if (teacherId) {
      loadTeachingAssignments();
    }
  }, [teacherId, loadTeachingAssignments]);

  const loadAssignments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await getTeacherAssignmentsList(teacherId, selectedSubject, selectedClass);
      if (result.assignments) {
        const assignmentsWithSubmissions = await Promise.all(
          result.assignments.map(async (assignment) => {
            try {
              const subs = await getAssignmentSubmissions(assignment._id);
              return {
                ...assignment,
                submissionCount: subs.submittedCount || 0,
                totalStudents: subs.totalStudents || 0,
              };
            } catch (err) {
              console.warn(`Could not load submissions for ${assignment._id}:`, err);
              return {
                ...assignment,
                submissionCount: 0,
                totalStudents: 0,
              };
            }
          })
        );
        setAssignments(assignmentsWithSubmissions);
        calculateStats(assignmentsWithSubmissions);
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || "Error loading assignments";
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  }, [teacherId, selectedSubject, selectedClass]);

  // Load assignments when filters change
  useEffect(() => {
    if (teacherId && selectedSubject && selectedClass) {
      loadAssignments();
    }
  }, [teacherId, selectedSubject, selectedClass, loadAssignments]);

  const calculateStats = (assignmentsList) => {
    let totalStudents = 0;
    let totalSubmissions = 0;
    let assignmentsCount = assignmentsList.length;
    
    assignmentsList.forEach(assignment => {
      totalStudents = Math.max(totalStudents, assignment.totalStudents || 0);
      totalSubmissions += assignment.submissionCount || 0;
    });
    
    const avgRate = assignmentsCount > 0 ? Math.round((totalSubmissions / (assignmentsCount * totalStudents)) * 100) : 0;
    
    setStats({
      totalAssignments: assignmentsCount,
      avgSubmissionRate: isNaN(avgRate) ? 0 : avgRate,
      totalStudents,
    });
  };

  const handleCreateClick = () => {
    if (!selectedSubject || !selectedClass) {
      setError("Vui lòng chọn môn học và lớp trước khi tạo bài tập");
      return;
    }
    setEditingAssignment(null);
    setFormData({
      title: "",
      description: "",
      startDate: new Date().toISOString().split('T')[0],
      dueDate: "",
      totalMarks: 100,
      file: null,
    });
    setOpenDialog(true);
  };

  const handleEditClick = (assignment) => {
    if (!assignment) return;
    setEditingAssignment(assignment);
    setFormData({
      title: assignment.title || "",
      description: assignment.description || "",
      startDate: assignment.startDate ? assignment.startDate.split('T')[0] : "",
      dueDate: assignment.dueDate ? assignment.dueDate.split('T')[0] : "",
      totalMarks: assignment.totalMarks || 100,
      file: null,
    });
    setOpenDialog(true);
  };

  const getAssignmentStatus = (assignment) => {
    const now = new Date();
    const dueDate = new Date(assignment.dueDate);
    return dueDate < now ? "closed" : "open";
  };

  const getStatusColor = (assignment) => {
    return getAssignmentStatus(assignment) === "open" ? "success" : "error";
  };

  const getStatusLabel = (assignment) => {
    return getAssignmentStatus(assignment) === "open" ? "Đang mở" : "Hết hạn";
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
      if (!formData.title || !formData.dueDate || !formData.startDate) {
        setError("Vui lòng điền tất cả các trường bắt buộc (Tiêu đề, Ngày bắt đầu, Hạn nộp)");
        return;
      }

      // Validate dates
      const start = new Date(formData.startDate);
      const due = new Date(formData.dueDate);
      
      if (due <= start) {
        setError("Hạn nộp phải sau ngày bắt đầu");
        return;
      }

      const submitFormData = new FormData();
      submitFormData.append("teacherId", teacherId);
      submitFormData.append("subjectId", selectedSubject);
      submitFormData.append("classId", selectedClass);
      submitFormData.append("title", formData.title);
      submitFormData.append("description", formData.description);
      submitFormData.append("startDate", formData.startDate);
      submitFormData.append("dueDate", formData.dueDate);
      submitFormData.append("totalMarks", formData.totalMarks);
      submitFormData.append("schoolId", schoolId);
      if (formData.file) {
        submitFormData.append("assignmentFile", formData.file);
      }

      if (editingAssignment) {
        // Edit mode - implement update if API supports it
        setError("Chưa hỗ trợ chỉnh sửa. Vui lòng xóa và tạo mới.");
        return;
      }

      const result = await createAssignment(submitFormData);
      if (result.assignment) {
        setAssignments([...assignments, result.assignment]);
        setFormData({ title: "", description: "", startDate: "", dueDate: "", totalMarks: 100, file: null });
        setOpenDialog(false);
        setError(null);
        alert("Tạo bài tập thành công!");
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || "Error creating assignment";
      setError(errorMsg);
    }
  };

  const handleDelete = async (assignmentId) => {
    const confirmed = window.confirm(
      "Bạn có chắc chắn muốn xóa bài tập này? Hành động này không thể hoàn tác."
    );
    if (!confirmed) return;

    try {
      await deleteAssignment(assignmentId);
      setAssignments(assignments.filter((a) => a._id !== assignmentId));
      setError(null);
      alert("Xóa bài tập thành công!");
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || "Error deleting assignment";
      setError(errorMsg);
    }
  };

  const getSubjectOptions = () => {
    const subjects = new Map();
    teachingAssignments.forEach((ta) => {
      subjects.set(ta.subject._id, ta.subject);
    });
    return Array.from(subjects.values());
  };

  const getClassOptions = () => {
    if (!selectedSubject) return [];
    const assignment = teachingAssignments.find((ta) => ta.subject._id === selectedSubject);
    return assignment ? assignment.classes : [];
  };

  return (
    <PageContainer>
      <HeaderBox>
        <Typography variant="h4" fontWeight={700} gutterBottom>
          📚 Quản lý Bài tập
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Tạo, quản lý bài tập và xem được nộp của học sinh
        </Typography>
      </HeaderBox>

      {error && (
        <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Filter Section */}
      <Paper sx={{ p: 2, mb: 3, borderRadius: 2 }}>
        <Grid container spacing={2} alignItems="flex-end">
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel>Chọn môn học</InputLabel>
              <Select
                value={selectedSubject}
                label="Chọn môn học"
                onChange={(e) => {
                  setSelectedSubject(e.target.value);
                  setSelectedClass("");
                }}
              >
                <MenuItem value="">Tất cả</MenuItem>
                {getSubjectOptions().map((subject) => (
                  <MenuItem key={subject._id} value={subject._id}>
                    {subject.subName}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth disabled={!selectedSubject}>
              <InputLabel>Chọn lớp</InputLabel>
              <Select
                value={selectedClass}
                label="Chọn lớp"
                onChange={(e) => setSelectedClass(e.target.value)}
              >
                <MenuItem value="">Tất cả</MenuItem>
                {getClassOptions().map((sclass) => (
                  <MenuItem key={sclass._id} value={sclass._id}>
                    {sclass.sclassName}
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
              sx={{ height: "56px" }}
            >
              Tạo bài tập
            </Button>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Button
              variant="outlined"
              fullWidth
              onClick={loadAssignments}
              disabled={!selectedSubject || !selectedClass}
              sx={{ height: "56px" }}
            >
              Làm mới
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Create Assignment Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Tạo bài tập mới</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <TextField
            fullWidth
            label="Tiêu đề bài tập *"
            name="title"
            value={formData.title}
            onChange={handleFormChange}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Mô tả"
            name="description"
            value={formData.description}
            onChange={handleFormChange}
            margin="normal"
            multiline
            rows={3}
          />
          <TextField
            fullWidth
            label="Ngày bắt đầu *"
            name="startDate"
            type="date"
            value={formData.startDate}
            onChange={handleFormChange}
            margin="normal"
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            fullWidth
            label="Hạn chót *"
            name="dueDate"
            type="datetime-local"
            value={formData.dueDate}
            onChange={handleFormChange}
            margin="normal"
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            fullWidth
            label="Tổng điểm"
            name="totalMarks"
            type="number"
            value={formData.totalMarks}
            onChange={handleFormChange}
            margin="normal"
          />
          <Box sx={{ mt: 2 }}>
            <Button
              variant="outlined"
              component="label"
              fullWidth
              startIcon={<CloudUpload />}
            >
              Tải lên file bài tập
              <input
                hidden
                type="file"
                name="file"
                onChange={handleFormChange}
                accept=".pdf,.doc,.docx,.txt"
              />
            </Button>
            {formData.file && <Typography variant="small">{formData.file.name}</Typography>}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Hủy</Button>
          <Button onClick={handleSubmit} variant="contained">
            Tạo
          </Button>
        </DialogActions>
      </Dialog>

      {/* Statistics Cards */}
      {assignments.length > 0 && (
        <StatsContainer sx={{ mb: 3, display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(3, 1fr)" }, gap: 2 }}>
          <Box className="stat-card">
            <Typography variant="h6" sx={{ color: "#666" }}>
              Tổng bài tập
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: "bold", color: "#1976d2" }}>
              {stats.totalAssignments}
            </Typography>
          </Box>
          <Box className="stat-card submitted">
            <Typography variant="h6" sx={{ color: "#666" }}>
              Tỷ lệ nộp bài
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: "bold", color: "#4caf50" }}>
              {stats.avgSubmissionRate}%
            </Typography>
          </Box>
          <Box className="stat-card pending">
            <Typography variant="h6" sx={{ color: "#666" }}>
              Tổng sinh viên
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: "bold", color: "#ff9800" }}>
              {stats.totalStudents}
            </Typography>
          </Box>
        </StatsContainer>
      )}

      {/* Assignments List */}
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
          <CircularProgress />
        </Box>
      ) : assignments.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: "center" }}>
          <Typography color="text.secondary">Chưa có bài tập nào</Typography>
        </Paper>
      ) : (
        <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: "#f1f5f9" }}>
                <TableCell fontWeight="bold">Tiêu đề</TableCell>
                <TableCell align="center">Ngày bắt đầu</TableCell>
                <TableCell align="center">Hạn chót</TableCell>
                <TableCell align="center">Trạng thái</TableCell>
                <TableCell align="center">Nộp bài</TableCell>
                <TableCell align="center">Điểm</TableCell>
                <TableCell align="center">Hành động</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {assignments.map((assignment) => (
                <TableRow key={assignment._id} hover>
                  <TableCell>
                    <Box>
                      <Typography fontWeight="500">{assignment.title}</Typography>
                      <Typography variant="small" color="text.secondary">
                        {assignment.description}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell align="center">
                    <Typography variant="small">
                      {new Date(assignment.startDate).toLocaleDateString("vi-VN")}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Typography variant="small">
                      {new Date(assignment.dueDate).toLocaleDateString("vi-VN")}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Chip
                      label={getStatusLabel(getAssignmentStatus(assignment))}
                      color={getStatusColor(getAssignmentStatus(assignment)) === "success" ? "success" : "error"}
                      variant="outlined"
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Chip
                      label={`${assignment.submissionCount}/${assignment.totalStudents}`}
                      color={
                        assignment.submissionCount === assignment.totalStudents ? "success" : "warning"
                      }
                      variant="outlined"
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="center">{assignment.totalMarks}</TableCell>
                  <TableCell align="center">
                    <Tooltip title="Chỉnh sửa">
                      <IconButton
                        size="small"
                        onClick={() => handleEditClick(assignment)}
                        disabled={getAssignmentStatus(assignment) === "closed"}
                      >
                        <Edit fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Xóa">
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
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </PageContainer>
  );
};

export default TeacherAssignments;
