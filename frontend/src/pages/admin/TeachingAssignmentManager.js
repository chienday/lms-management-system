import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import {
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormGroup,
  FormControlLabel,
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
  Typography,
  Alert,
  CircularProgress,
  Stack,
  TablePagination,
} from "@mui/material";
import { Add, Edit, Delete, Refresh } from "@mui/icons-material";
import styled from "styled-components";
import {
  createTeachingAssignment,
  getAllTeachingAssignments,
  updateTeachingAssignment,
  deleteTeachingAssignment,
} from "../../services/assignmentService";

// API endpoint
const API_BASE_URL = process.env.NODE_ENV === 'development' 
  ? 'http://localhost:5000' 
  : '/api';

const PageContainer = styled(Box)`
  padding: 24px;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  min-height: 100vh;
`;

const HeaderBox = styled(Box)`
  margin-bottom: 24px;
`;

const TeachingAssignmentManager = () => {
  const { currentUser } = useSelector((state) => state.user);
  // Admin's _id is the schoolId (referenced in other models as 'school' field)
  const schoolId = currentUser?._id;

  const [assignments, setAssignments] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State for pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  // Dialog state
  const [openDialog, setOpenDialog] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [assignmentToDelete, setAssignmentToDelete] = useState(null);
  const [formData, setFormData] = useState({
    teacherId: "",
    subjectId: "",
    selectedClasses: [],
  });

  useEffect(() => {
    if (schoolId) {
      loadData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [schoolId]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Parallel fetch of all data
      const [assignResult, teachersResult, subjectsResult, classesResult] = await Promise.all([
        getAllTeachingAssignments(schoolId),
        fetch(`${API_BASE_URL}/Teachers/${schoolId}`).then(r => r.json()),
        fetch(`${API_BASE_URL}/Subject/List/${schoolId}`).then(r => r.json()),
        fetch(`${API_BASE_URL}/SclassList/${schoolId}`).then(r => r.json()),
      ]);

      // Set assignments
      if (assignResult.assignments) {
        setAssignments(assignResult.assignments);
      }

      // Set teachers - handle both array and wrapped responses
      if (Array.isArray(teachersResult)) {
        setTeachers(teachersResult);
      } else if (teachersResult.teacherList) {
        setTeachers(teachersResult.teacherList);
      } else if (teachersResult.teachers) {
        setTeachers(teachersResult.teachers);
      }

      // Set subjects - from new endpoint that returns { subjects: [...] }
      if (subjectsResult.subjects && Array.isArray(subjectsResult.subjects)) {
        setSubjects(subjectsResult.subjects);
      } else if (Array.isArray(subjectsResult)) {
        setSubjects(subjectsResult);
      } else if (subjectsResult.subjectList) {
        setSubjects(subjectsResult.subjectList);
      }

      // Set classes - handle both array and wrapped responses
      if (Array.isArray(classesResult)) {
        setClasses(classesResult);
      } else if (classesResult.sclasses) {
        setClasses(classesResult.sclasses);
      } else if (classesResult.classList) {
        setClasses(classesResult.classList);
      }
    } catch (err) {
      console.error("Error loading data:", err);
      setError(err.message || "Lỗi tải dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateClick = () => {
    setEditingAssignment(null);
    setFormData({ teacherId: "", subjectId: "", selectedClasses: [] });
    setOpenDialog(true);
  };

  const handleEditClick = (assignment) => {
    setEditingAssignment(assignment);
    setFormData({
      teacherId: assignment.teacher._id,
      subjectId: assignment.subject._id,
      selectedClasses: assignment.classes.map((c) => c._id),
    });
    setOpenDialog(true);
  };

  const handleClassToggle = (classId) => {
    setFormData({
      ...formData,
      selectedClasses: formData.selectedClasses.includes(classId)
        ? formData.selectedClasses.filter((c) => c !== classId)
        : [...formData.selectedClasses, classId],
    });
  };

  const handleSubmit = async () => {
    try {
      if (!formData.teacherId || !formData.subjectId || formData.selectedClasses.length === 0) {
        setError("Vui lòng điền tất cả các trường và chọn ít nhất một lớp");
        return;
      }

      // Get teacher and subject for display
      const teacher = teachers.find(t => t._id === formData.teacherId);
      const subject = subjects.find(s => s._id === formData.subjectId);

      if (editingAssignment) {
        // Update existing assignment
        const result = await updateTeachingAssignment(editingAssignment._id, {
          classIds: formData.selectedClasses,
        });
        if (result.assignment) {
          setAssignments(
            assignments.map((a) => (a._id === editingAssignment._id ? result.assignment : a))
          );
          setError(null);
          setOpenDialog(false);
          setFormData({ teacherId: "", subjectId: "", selectedClasses: [] });
          alert(`Cập nhật phân công cho giảng viên ${teacher?.name} thành công!`);
        }
      } else {
        // Create new assignment
        const result = await createTeachingAssignment({
          teacherId: formData.teacherId,
          subjectId: formData.subjectId,
          classIds: formData.selectedClasses,
          schoolId,
        });
        if (result.assignment) {
          setAssignments([...assignments, result.assignment]);
          setError(null);
          setOpenDialog(false);
          setFormData({ teacherId: "", subjectId: "", selectedClasses: [] });
          alert(`Thêm phân công cho giảng viên ${teacher?.name} - môn ${subject?.subName} thành công!`);
        }
      }
    } catch (err) {
      console.error("Error saving assignment:", err);
      setError(err.message || "Lỗi lưu phân công");
    }
  };

  const handleDeleteClick = (assignmentId) => {
    const assignment = assignments.find(a => a._id === assignmentId);
    setAssignmentToDelete(assignment);
    setOpenDeleteDialog(true);
  };

  const handleConfirmDelete = async () => {
    if (!assignmentToDelete) return;
    try {
      await deleteTeachingAssignment(assignmentToDelete._id);
      setAssignments(assignments.filter((a) => a._id !== assignmentToDelete._id));
      setOpenDeleteDialog(false);
      setAssignmentToDelete(null);
      alert("Xóa phân công thành công!");
    } catch (err) {
      console.error("Error deleting assignment:", err);
      setError(err.message || "Lỗi xóa phân công");
      setOpenDeleteDialog(false);
      setAssignmentToDelete(null);
    }
  };

  // Pagination handlers
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Get paginated assignments list
  const displayAssignments = assignments.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <PageContainer>
      <HeaderBox>
        <Typography variant="h4" sx={{ fontWeight: 700, color: "#1a237e" }}>
          Quản lý Phân Công Dạy
        </Typography>
        <Typography variant="body1" sx={{ color: "#546e7a", mt: 1 }}>
          Quản lý phân công dạy của giảng viên cho từng môn học và lớp
        </Typography>
      </HeaderBox>

      {error && (
        <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ mb: 3, display: "flex", gap: 2 }}>
        <Button variant="contained" startIcon={<Add />} onClick={handleCreateClick}>
          Thêm phân công
        </Button>
        <Button 
          variant="outlined" 
          startIcon={<Refresh />} 
          onClick={loadData}
          disabled={loading}
        >
          Làm mới
        </Button>
      </Box>

      {/* Delete Confirmation Dialog */}
      <Dialog 
        open={openDeleteDialog} 
        onClose={() => {
          setOpenDeleteDialog(false);
          setAssignmentToDelete(null);
        }} 
        maxWidth="sm" 
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: "bold", color: "#d32f2f" }}>
          Xác nhận xóa phân công
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ mt: 2 }}>
            Bạn có chắc chắn muốn xóa phân công của giảng viên <strong>{assignmentToDelete?.teacher?.name}</strong> dạy môn <strong>{assignmentToDelete?.subject?.subName}</strong>?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button 
            onClick={() => {
              setOpenDeleteDialog(false);
              setAssignmentToDelete(null);
            }}
            variant="outlined"
          >
            Hủy
          </Button>
          <Button
            onClick={handleConfirmDelete}
            variant="contained"
            color="error"
          >
            Xóa
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add/Edit Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingAssignment ? "Cập nhật phân công" : "Thêm phân công giảng viên"}</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Stack spacing={2.5}>
            {/* Teacher Selection */}
            <FormControl fullWidth>
              <InputLabel>Giảng viên</InputLabel>
              <Select
                value={formData.teacherId}
                label="Giảng viên"
                onChange={(e) => setFormData({ ...formData, teacherId: e.target.value })}
                disabled={editingAssignment}
              >
                <MenuItem value="">Chọn giảng viên</MenuItem>
                {teachers.map((teacher) => (
                  <MenuItem key={teacher._id} value={teacher._id}>
                    {teacher.name} {teacher.email ? `(${teacher.email})` : ""}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Subject Selection */}
            <FormControl fullWidth>
              <InputLabel>Môn học</InputLabel>
              <Select
                value={formData.subjectId}
                label="Môn học"
                onChange={(e) => setFormData({ ...formData, subjectId: e.target.value })}
                disabled={editingAssignment}
              >
                <MenuItem value="">Chọn môn học</MenuItem>
                {subjects.map((subject) => (
                  <MenuItem key={subject._id} value={subject._id}>
                    {subject.subName} ({subject.subCode})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Class Selection */}
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 600 }}>
                Chọn lớp học
              </Typography>
              <FormGroup sx={{ 
                maxHeight: 300, 
                overflowY: "auto",
                border: "1px solid #e0e0e0",
                borderRadius: 1,
                p: 1.5,
                backgroundColor: "#fafafa"
              }}>
                {classes.length > 0 ? (
                  classes.map((sclass) => (
                    <FormControlLabel
                      key={sclass._id}
                      control={
                        <Checkbox
                          checked={formData.selectedClasses.includes(sclass._id)}
                          onChange={() => handleClassToggle(sclass._id)}
                        />
                      }
                      label={sclass.sclassName}
                    />
                  ))
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    Không có lớp nào
                  </Typography>
                )}
              </FormGroup>
              {formData.selectedClasses.length === 0 && (
                <Typography variant="caption" sx={{ color: "#d32f2f", mt: 1, display: "block" }}>
                  Vui lòng chọn ít nhất 1 lớp
                </Typography>
              )}
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Hủy</Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained"
            disabled={!formData.teacherId || !formData.subjectId || formData.selectedClasses.length === 0}
          >
            {editingAssignment ? "Cập nhật" : "Thêm"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Teaching Assignments Table */}
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
          <CircularProgress />
        </Box>
      ) : assignments.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: "center", borderRadius: 2 }}>
          <Typography color="text.secondary">Chưa có phân công nào. Hãy thêm phân công mới!</Typography>
        </Paper>
      ) : (
        <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: "#f1f5f9" }}>
                <TableCell sx={{ fontWeight: "bold" }}>Giảng viên</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Môn học</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Lớp học</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Trạng thái</TableCell>
                <TableCell align="center" sx={{ fontWeight: "bold" }}>
                  Hành động
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {displayAssignments.map((assignment) => (
                <TableRow key={assignment._id} hover>
                  <TableCell>{assignment.teacher.name}</TableCell>
                  <TableCell>{assignment.subject.subName}</TableCell>
                  <TableCell>
                    {assignment.classes.map((c) => c.sclassName).join(", ")}
                  </TableCell>
                  <TableCell>
                    <Typography
                      sx={{
                        display: "inline-block",
                        px: 1.5,
                        py: 0.5,
                        backgroundColor: assignment.status === "active" ? "#e8f5e9" : "#ffebee",
                        color: assignment.status === "active" ? "#2e7d32" : "#c62828",
                        borderRadius: 1,
                        fontSize: "0.75rem",
                        fontWeight: 600,
                      }}
                    >
                      {assignment.status === "active" ? "Hoạt động" : "Không hoạt động"}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Button
                      size="small"
                      onClick={() => handleEditClick(assignment)}
                      startIcon={<Edit />}
                      variant="outlined"
                      sx={{ mr: 1 }}
                    >
                      Sửa
                    </Button>
                    <Button
                      size="small"
                      color="error"
                      onClick={() => handleDeleteClick(assignment._id)}
                      variant="outlined"
                      startIcon={<Delete />}
                    >
                      Xóa
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={assignments.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </TableContainer>
      )}
    </PageContainer>
  );
};

export default TeachingAssignmentManager;
