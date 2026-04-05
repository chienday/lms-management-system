import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
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
  TablePagination,
} from "@mui/material";
import { Add, Edit, Delete, Visibility } from "@mui/icons-material";
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

const AdminSubjectManagement = () => {
  const { currentUser } = useSelector((state) => state.user);
  const navigate = useNavigate();

  // Admin's _id is the schoolId (referenced in other models as 'school' field)
  const schoolId = currentUser?._id;

  const API_BASE_URL =
    process.env.NODE_ENV === "production"
      ? "http://your-backend-api"
      : "http://localhost:5000";

  // State for data
  const [subjects, setSubjects] = useState([]);
  const [classes, setClasses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // State for pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  // State for dialogs
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [openAddClassDialog, setOpenAddClassDialog] = useState(false);
  const [openViewDialog, setOpenViewDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [subjectToDelete, setSubjectToDelete] = useState(null);

  // State for form data
  const [formData, setFormData] = useState({
    subName: "",
    subCode: "",
    sessions: "",
  });

  const [addClassFormData, setAddClassFormData] = useState({
    classId: "",
    teacherId: "",
  });

  // Load data on mount
  useEffect(() => {
    if (schoolId) {
      console.log("Loading data for schoolId:", schoolId);
      loadSubjects();
      loadClasses();
      loadTeachers();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [schoolId]);

  // ========== API Functions ==========
  const loadSubjects = async () => {
    try {
      setLoading(true);
      const url = `${API_BASE_URL}/Subject/List/${schoolId}`;
      const response = await axios.get(url);
      if (response.data.subjects) {
        setSubjects(response.data.subjects);
      } else {
        setSubjects([]);
      }
    } catch (err) {
      console.error("Error loading subjects:", err);
      setError(err.response?.data?.message || "Error loading subjects");
    } finally {
      setLoading(false);
    }
  };

  const loadClasses = async () => {
    try {
      const url = `${API_BASE_URL}/SclassList/${schoolId}`;
      const response = await axios.get(url);
      if (Array.isArray(response.data)) {
        setClasses(response.data);
      } else if (response.data.sclasses) {
        setClasses(response.data.sclasses);
      }
    } catch (err) {
      console.error("Error loading classes:", err);
    }
  };

  const loadTeachers = async () => {
    try {
      const url = `${API_BASE_URL}/Teachers/${schoolId}`;
      const response = await axios.get(url);
      if (Array.isArray(response.data)) {
        setTeachers(response.data);
      } else if (response.data.teachers) {
        setTeachers(response.data.teachers);
      }
    } catch (err) {
      console.error("Error loading teachers:", err);
    }
  };

  // ========== Dialog Handlers ==========
  const handleCreateClick = () => {
    setFormData({
      subName: "",
      subCode: "",
      sessions: "",
    });
    setOpenCreateDialog(true);
  };

  const handleEditClick = (subject) => {
    navigate(`/Admin/subjects/edit/${subject._id}`);
  };

  const handleViewClick = (subject) => {
    setSelectedSubject(subject);
    setOpenViewDialog(true);
  };

  const handleAddClassClick = (subject) => {
    setSelectedSubject(subject);
    setAddClassFormData({ classId: "", teacherId: "" });
    setOpenAddClassDialog(true);
  };

  // ========== Form Handlers ==========
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleCreateSubject = async () => {
    try {
      if (!formData.subName || !formData.subCode) {
        setError("Please fill in subject name and code");
        return;
      }

      const response = await axios.post(`${API_BASE_URL}/Subject/Create`, {
        subName: formData.subName,
        subCode: formData.subCode,
        sessions: formData.sessions,
        classes: [],
        schoolId,
      });

      if (response.data.subject) {
        setSubjects([...subjects, response.data.subject]);
        setOpenCreateDialog(false);
        setError(null);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Error creating subject");
      console.error(err);
    }
  };

  const handleAddClassToSubject = async () => {
    try {
      if (!addClassFormData.classId || !addClassFormData.teacherId) {
        setError("Please select a class and teacher");
        return;
      }

      const response = await axios.put(
        `${API_BASE_URL}/Subject/${selectedSubject._id}/AddClass`,
        {
          classId: addClassFormData.classId,
          teacherId: addClassFormData.teacherId,
        }
      );

      if (response.data.subject) {
        setSubjects(
          subjects.map((s) =>
            s._id === selectedSubject._id ? response.data.subject : s
          )
        );
        setSelectedSubject(response.data.subject);
        setOpenAddClassDialog(false);
        setAddClassFormData({ classId: "", teacherId: "" });
        setError(null);
        
        // Reload teachers and classes data to sync with latest changes
        await Promise.all([loadTeachers(), loadClasses()]);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Error adding class");
      console.error(err);
    }
  };

  const handleDeleteSubject = async (subjectId) => {
    const subject = subjects.find(s => s._id === subjectId);
    setSubjectToDelete(subject);
    setOpenDeleteDialog(true);
  };

  const handleConfirmDelete = async () => {
    if (!subjectToDelete) return;
    try {
      await axios.delete(`${API_BASE_URL}/SubjectManagement/${subjectToDelete._id}`);
      setSubjects(subjects.filter((s) => s._id !== subjectToDelete._id));
      if (selectedSubject?._id === subjectToDelete._id) {
        setSelectedSubject(null);
        setOpenViewDialog(false);
      }
      setOpenDeleteDialog(false);
      setSubjectToDelete(null);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || "Error deleting subject");
      setOpenDeleteDialog(false);
      setSubjectToDelete(null);
    }
  };

  // ========== Helper Functions ==========
  const getTeacherName = (teacherId) => {
    // Handle case where API returns full teacher object
    if (typeof teacherId === 'object' && teacherId?.name) {
      return teacherId.name;
    }
    // Handle case where teacherId is a string/ID
    const teacher = teachers.find((t) => t._id === teacherId);
    return teacher?.name || "Unknown";
  };

  const getClassName = (classId) => {
    // Handle case where API returns full class object
    if (typeof classId === 'object' && classId?.sclassName) {
      return classId.sclassName;
    }
    // Handle case where classId is a string/ID
    const cls = classes.find((c) => c._id === classId);
    return cls?.sclassName || "Unknown";
  };

  const countClassesForSubject = (subject) => {
    return subject.classes?.length || 0;
  };

  const countTeachersForSubject = (subject) => {
    return subject.teachers?.length || 0;
  };

  const getClassesNotAssigned = () => {
    if (!selectedSubject) return classes;
    return classes.filter(
      (c) => !selectedSubject.classes?.find((sc) => sc.classId === c._id)
    );
  };

  // Pagination handlers
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Get paginated subjects list
  const displaySubjects = subjects.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  // ========== Render ==========
  return (
    <PageContainer>
      <HeaderBox>
        <Typography variant="h4" fontWeight={700} gutterBottom>
          Quản lý Môn học
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Tạo, chỉnh sửa và quản lý môn học
        </Typography>
        {!schoolId && (
          <Alert severity="warning" sx={{ mt: 2 }}>
             Không thể tải dữ liệu - Admin ID không xác định.
          </Alert>
        )}
      </HeaderBox>

      {error && (
        <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ mb: 3 }}>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={handleCreateClick}
        >
          Tạo môn học mới
        </Button>
      </Box>

      {/* ========== DIALOGS ========== */}

      {/* Delete Confirmation Dialog */}
      <Dialog 
        open={openDeleteDialog} 
        onClose={() => {
          setOpenDeleteDialog(false);
          setSubjectToDelete(null);
        }} 
        maxWidth="sm" 
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: "bold", color: "#d32f2f" }}>
          Xác nhận xóa môn học
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ mt: 2 }}>
            Bạn có chắc chắn muốn xóa môn học <strong>{subjectToDelete?.subName}</strong> (Mã: <strong>{subjectToDelete?.subCode}</strong>)?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={() => {
              setOpenDeleteDialog(false);
              setSubjectToDelete(null);
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

      {/* ========== DIALOGS ========== */}

      {/* Create Subject Dialog */}
      <Dialog
        open={openCreateDialog}
        onClose={() => setOpenCreateDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Tạo môn học mới</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <TextField
            fullWidth
            label="Tên môn học"
            name="subName"
            value={formData.subName}
            onChange={handleFormChange}
            margin="normal"
            placeholder="e.g., Toán"
          />
          <TextField
            fullWidth
            label="Mã môn học"
            name="subCode"
            value={formData.subCode}
            onChange={handleFormChange}
            margin="normal"
            placeholder="e.g., MATH101"
          />
          <TextField
            fullWidth
            label="Số tiết (tùy chọn)"
            name="sessions"
            value={formData.sessions}
            onChange={handleFormChange}
            margin="normal"
            placeholder="e.g., 45"
          />
          <Alert severity="info" sx={{ mt: 2 }}>
            💡 Bạn sẽ gán lớp và giáo viên sau khi tạo môn học
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCreateDialog(false)}>Hủy</Button>
          <Button onClick={handleCreateSubject} variant="contained">
            Tạo
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Class Dialog */}
      <Dialog
        open={openAddClassDialog}
        onClose={() => setOpenAddClassDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Thêm lớp cho môn học</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          {selectedSubject && (
            <>
              <Alert severity="success" sx={{ mb: 2 }}>
                Môn học: <strong>{selectedSubject?.subName}</strong>
              </Alert>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Chọn lớp</InputLabel>
                <Select
                  value={addClassFormData.classId}
                  label="Chọn lớp"
                  onChange={(e) =>
                    setAddClassFormData({
                      ...addClassFormData,
                      classId: e.target.value,
                    })
                  }
                >
                  <MenuItem value="">-- Chọn lớp --</MenuItem>
                  {getClassesNotAssigned().map((cls) => (
                    <MenuItem key={cls._id} value={cls._id}>
                      {cls.sclassName}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel>Chọn giáo viên</InputLabel>
                <Select
                  value={addClassFormData.teacherId}
                  label="Chọn giáo viên"
                  onChange={(e) =>
                    setAddClassFormData({
                      ...addClassFormData,
                      teacherId: e.target.value,
                    })
                  }
                >
                  <MenuItem value="">-- Chọn giáo viên --</MenuItem>
                  {teachers.map((teacher) => (
                    <MenuItem key={teacher._id} value={teacher._id}>
                      {teacher.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAddClassDialog(false)}>Hủy</Button>
          <Button onClick={handleAddClassToSubject} variant="contained">
            Thêm
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Subject Details Dialog */}
      <Dialog
        open={openViewDialog}
        onClose={() => setOpenViewDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span>Chi tiết môn học</span>
          <Box sx={{ display: "flex", gap: 1 }}>
            <IconButton
              size="small"
              onClick={() => {
                setOpenViewDialog(false);
                handleAddClassClick(selectedSubject);
              }}
              title="Thêm lớp"
            >
              <Add />
            </IconButton>
            <IconButton
              size="small"
              color="error"
              onClick={() => {
                setOpenViewDialog(false);
                handleDeleteSubject(selectedSubject?._id);
              }}
              title="Xóa"
            >
              <Delete />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          {selectedSubject && (
            <>
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
                  📌 Thông tin cơ bản
                </Typography>
                <Typography variant="body2" sx={{ mb: 0.5 }}>
                  <strong>Tên môn:</strong> {selectedSubject.subName}
                </Typography>
                <Typography variant="body2" sx={{ mb: 0.5 }}>
                  <strong>Mã môn:</strong> {selectedSubject.subCode}
                </Typography>
                <Typography variant="body2">
                  <strong>Số tiết:</strong> {selectedSubject.sessions || "N/A"}
                </Typography>
              </Box>

              <Box>
                <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
                   Các lớp dạy môn này ({countClassesForSubject(selectedSubject)})
                </Typography>
                {selectedSubject.classes && selectedSubject.classes.length > 0 ? (
                  <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                    {selectedSubject.classes.map((cls) => (
                      <Box
                        key={cls.classId}
                        sx={{
                          p: 1.5,
                          backgroundColor: "#f5f5f5",
                          borderRadius: 1,
                          borderLeft: "4px solid #2196f3",
                        }}
                      >
                        <Typography variant="body2">
                          <strong>Lớp:</strong> {getClassName(cls.classId)}
                        </Typography>
                        <Typography variant="body2">
                          <strong>Giảng viên:</strong> {getTeacherName(cls.teacherId)}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                ) : (
                  <Alert severity="info">Chưa có lớp nào được gán</Alert>
                )}
              </Box>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenViewDialog(false)}>Đóng</Button>
        </DialogActions>
      </Dialog>

      {/* ========== MAIN TABLE ========== */}
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
          <CircularProgress />
        </Box>
      ) : subjects.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: "center", borderRadius: 2 }}>
          <Typography color="text.secondary" sx={{ mb: 2 }}>
            {schoolId ? "Chưa có môn học nào" : " Vui lòng tải lại trang"}
          </Typography>
          {schoolId && (
            <Button size="small" onClick={() => loadSubjects()} sx={{ mt: 2 }}>
              Tải lại dữ liệu
            </Button>
          )}
        </Paper>
      ) : (
        <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: "#f1f5f9" }}>
                <TableCell fontWeight="bold">Tên môn</TableCell>
                <TableCell fontWeight="bold">Mã môn</TableCell>
                <TableCell align="center" fontWeight="bold">
                  Số lớp
                </TableCell>
                <TableCell align="center" fontWeight="bold">
                  Số giáo viên
                </TableCell>
                <TableCell align="center" fontWeight="bold">
                  Hành động
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {displaySubjects.map((subject) => (
                <TableRow key={subject._id} hover>
                  <TableCell>
                    <Typography fontWeight={500}>{subject.subName}</Typography>
                  </TableCell>
                  <TableCell>{subject.subCode}</TableCell>
                  <TableCell align="center">
                    <Chip
                      label={countClassesForSubject(subject)}
                      size="small"
                      variant="outlined"
                      color="primary"
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Chip
                      label={countTeachersForSubject(subject)}
                      size="small"
                      variant="outlined"
                      color="secondary"
                    />
                  </TableCell>
                  <TableCell align="center" sx={{ whiteSpace: "nowrap" }}>
                    <IconButton
                      size="small"
                      onClick={() => handleViewClick(subject)}
                      title="Xem chi tiết"
                      color="primary"
                    >
                      <Visibility fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleEditClick(subject)}
                      title="Chỉnh sửa"
                    >
                      <Edit fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleAddClassClick(subject)}
                      title="Thêm lớp"
                      color="success"
                    >
                      <Add fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDeleteSubject(subject._id)}
                      title="Xóa"
                    >
                      <Delete fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={subjects.length}
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

export default AdminSubjectManagement;
