import React, { useEffect, useState } from "react";
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
  TablePagination,
  TableRow,
  TextField,
  Typography,
  Alert,
  CircularProgress,
  Chip,
  IconButton,
  Card,
  CardContent,
  Tooltip,
  Divider,
} from "@mui/material";
import {
  Add,
  Edit,
  Delete,
  Visibility,
  Lock,
} from "@mui/icons-material";
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

const AdminTeacherManagement = () => {
  const { currentUser } = useSelector((state) => state.user);
  const schoolId = currentUser?._id;

  const API_BASE_URL =
    process.env.NODE_ENV === "production"
      ? "http://your-backend-api"
      : "http://localhost:5000";

  // State for data
  const [teachers, setTeachers] = useState([]);
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");

  // State for pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  // State for dialogs
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openResetPasswordDialog, setOpenResetPasswordDialog] = useState(false);
  const [openDetailsDialog, setOpenDetailsDialog] = useState(false);

  // State for form data
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    teachSclass: "",
  });

  const [newPassword, setNewPassword] = useState("");
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [teacherDetails, setTeacherDetails] = useState(null);

  // Load data on mount
  useEffect(() => {
    if (schoolId) {
      loadTeachers();
      loadClasses();
      loadSubjects();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [schoolId]);

  const loadTeachers = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${API_BASE_URL}/Teachers/${schoolId}`);
      if (response.data && !response.data.message) {
        setTeachers(response.data);
      } else {
        setTeachers([]);
      }
    } catch (err) {
      console.error("Error loading teachers:", err);
      setError("Failed to load teachers");
      setTeachers([]);
    }
    setLoading(false);
  };

  const loadClasses = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/SclassList/${schoolId}`);
      if (Array.isArray(response.data)) {
        setClasses(response.data);
      } else if (response.data.sclasses) {
        setClasses(response.data.sclasses);
      } else {
        setClasses([]);
      }
    } catch (err) {
      console.error("Error loading classes:", err);
      setClasses([]);
    }
  };

  const loadSubjects = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/Subject/List/${schoolId}`);
      if (response.data.subjects) {
        setSubjects(response.data.subjects);
      } else if (Array.isArray(response.data)) {
        setSubjects(response.data);
      } else {
        setSubjects([]);
      }
    } catch (err) {
      console.error("Error loading subjects:", err);
      setSubjects([]);
    }
  };

  const loadTeacherDetails = async (teacherId) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/Teacher/${teacherId}/Stats`
      );
      setTeacherDetails(response.data);
    } catch (err) {
      console.error("Error loading teacher details:", err);
    }
  };

  // Handle create teacher
  const handleCreateTeacher = async () => {
    if (
      !formData.name ||
      !formData.email ||
      !formData.password ||
      !formData.teachSclass
    ) {
      setError("Please fill all required fields");
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post(`${API_BASE_URL}/TeacherReg`, {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        school: schoolId,
        teachSclass: formData.teachSclass,
        role: "Teacher",
      });

      if (response.data._id) {
        setSuccessMessage("Teacher created successfully!");
        setOpenCreateDialog(false);
        setFormData({ name: "", email: "", password: "", teachSclass: "" });
        loadTeachers();
        setTimeout(() => setSuccessMessage(""), 3000);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create teacher");
    }
    setLoading(false);
  };

  // Handle edit teacher
  const handleEditTeacher = async () => {
    if (!formData.name || !formData.email || !formData.teachSclass) {
      setError("Please fill all required fields");
      return;
    }

    try {
      setLoading(true);
      const response = await axios.put(
        `${API_BASE_URL}/Teacher/${selectedTeacher._id}`,
        {
          name: formData.name,
          email: formData.email,
          teachSclass: formData.teachSclass,
        }
      );

      if (response.data.teacher) {
        setSuccessMessage("Teacher updated successfully!");
        setOpenEditDialog(false);
        setFormData({ name: "", email: "", password: "", teachSclass: "" });
        loadTeachers();
        setTimeout(() => setSuccessMessage(""), 3000);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update teacher");
    }
    setLoading(false);
  };

  // Handle delete teacher
  const handleDeleteTeacher = async () => {
    try {
      setLoading(true);
      const response = await axios.delete(
        `${API_BASE_URL}/Teacher/${selectedTeacher._id}`
      );

      if (response.data._id || response.data.deletedCount) {
        setSuccessMessage("Teacher deleted successfully!");
        setOpenDeleteDialog(false);
        loadTeachers();
        setTimeout(() => setSuccessMessage(""), 3000);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete teacher");
    }
    setLoading(false);
  };

  // Handle reset password
  const handleResetPassword = async () => {
    if (!newPassword) {
      setError("Please enter a new password");
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post(
        `${API_BASE_URL}/Teacher/${selectedTeacher._id}/ResetPassword`,
        {
          teacherId: selectedTeacher._id,
          newPassword: newPassword,
        }
      );

      if (response.data.teacher) {
        setSuccessMessage("Password reset successfully!");
        setOpenResetPasswordDialog(false);
        setNewPassword("");
        setTimeout(() => setSuccessMessage(""), 3000);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to reset password");
    }
    setLoading(false);
  };

  // Handle open edit dialog
  const handleOpenEditDialog = (teacher) => {
    setSelectedTeacher(teacher);
    setFormData({
      name: teacher.name,
      email: teacher.email,
      password: "",
      teachSclass: teacher.teachSclass._id || teacher.teachSclass,
    });
    setOpenEditDialog(true);
  };

  // Handle open delete dialog
  const handleOpenDeleteDialog = (teacher) => {
    setSelectedTeacher(teacher);
    setOpenDeleteDialog(true);
  };

  // Handle open reset password dialog
  const handleOpenResetPasswordDialog = (teacher) => {
    setSelectedTeacher(teacher);
    setNewPassword("");
    setOpenResetPasswordDialog(true);
  };

  // Handle open details dialog
  const handleOpenDetailsDialog = (teacher) => {
    setSelectedTeacher(teacher);
    loadTeacherDetails(teacher._id);
    setOpenDetailsDialog(true);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Function to count subjects for a teacher
  const countSubjects = (teacher) => {
    // This would be populated from teaching assignments
    // For now, showing 0 until we load assignments
    return 0;
  };

  // Function to count classes for a teacher
  const countClasses = (teacher) => {
    // This would be populated from teaching assignments
    // For now, showing if has class assigned
    return teacher.teachSclass ? 1 : 0;
  };

  if (loading && teachers.length === 0) {
    return (
      <PageContainer>
        <CircularProgress />
      </PageContainer>
    );
  }

  const displayTeachers = teachers.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <PageContainer>
      <HeaderBox>
        <Typography variant="h4" sx={{ fontWeight: "bold" }}>
          Quản Lý Giảng Viên
        </Typography>
        <Typography variant="body1" color="text.secondary">
                  Tạo, chỉnh sửa và quản lý giảng viên
                </Typography>
      </HeaderBox>

      <Box sx={{ mb: 3 }}>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setOpenCreateDialog(true)}
        >
          Thêm Giảng Viên
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ marginBottom: "16px" }}>
          {error}
        </Alert>
      )}

      {successMessage && (
        <Alert severity="success" sx={{ marginBottom: "16px" }}>
          {successMessage}
        </Alert>
      )}

      <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: "#f1f5f9" }}>
              <TableCell fontWeight="bold">Tên Giảng Viên</TableCell>
              <TableCell fontWeight="bold">Email</TableCell>
              <TableCell align="center" fontWeight="bold">Số Môn</TableCell>
              <TableCell align="center" fontWeight="bold">Số Lớp</TableCell>
              <TableCell align="center" fontWeight="bold">Hành Động</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {displayTeachers.length > 0 ? (
              displayTeachers.map((teacher) => (
                <TableRow key={teacher._id} hover>
                  <TableCell>
                    <Typography fontWeight={500}>{teacher.name}</Typography>
                  </TableCell>
                  <TableCell>{teacher.email}</TableCell>
                  <TableCell align="center">
                    <Chip
                      label={countSubjects(teacher)}
                      size="small"
                      variant="outlined"
                      color="primary"
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Chip
                      label={countClasses(teacher)}
                      size="small"
                      variant="outlined"
                      color="secondary"
                    />
                  </TableCell>
                  <TableCell align="center" sx={{ whiteSpace: "nowrap" }}>
                    <IconButton
                      size="small"
                      onClick={() => handleOpenDetailsDialog(teacher)}
                      title="Xem chi tiết"
                      color="primary"
                    >
                      <Visibility fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleOpenEditDialog(teacher)}
                      title="Chỉnh sửa"
                    >
                      <Edit fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleOpenResetPasswordDialog(teacher)}
                      title="Reset mật khẩu"
                      color="warning"
                    >
                      <Lock fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleOpenDeleteDialog(teacher)}
                      title="Xóa"
                    >
                      <Delete fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ padding: "24px" }}>
                  <Typography color="textSecondary">
                    Không có giảng viên nào
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={teachers.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </TableContainer>

      {/* Create Teacher Dialog */}
      <Dialog
        open={openCreateDialog}
        onClose={() => setOpenCreateDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: "bold", fontSize: "18px" }}>
          Tạo Tài Khoản Giảng Viên
        </DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: "flex", flexDirection: "column", gap: "16px", marginTop: "16px" }}>
            <TextField
              label="Tên Giảng Viên"
              fullWidth
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
            />
            <TextField
              label="Email"
              type="email"
              fullWidth
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
            />
            <TextField
              label="Mật Khẩu"
              type="password"
              fullWidth
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
            />
            <FormControl fullWidth>
              <InputLabel>Lớp Phụ Trách</InputLabel>
              <Select
                value={formData.teachSclass}
                onChange={(e) =>
                  setFormData({ ...formData, teachSclass: e.target.value })
                }
                label="Lớp Phụ Trách"
              >
                {classes.map((cls) => (
                  <MenuItem key={cls._id} value={cls._id}>
                    {cls.sclassName}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions sx={{ padding: "16px" }}>
          <Button onClick={() => setOpenCreateDialog(false)} variant="outlined">
            Hủy
          </Button>
          <Button
            onClick={handleCreateTeacher}
            variant="contained"
            color="success"
          >
            Tạo
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Teacher Dialog */}
      <Dialog
        open={openEditDialog}
        onClose={() => setOpenEditDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: "bold", fontSize: "18px" }}>
          Sửa Thông Tin Giảng Viên
        </DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: "flex", flexDirection: "column", gap: "16px", marginTop: "16px" }}>
            <TextField
              label="Tên Giảng Viên"
              fullWidth
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
            />
            <TextField
              label="Email"
              type="email"
              fullWidth
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
            />
            <FormControl fullWidth>
              <InputLabel>Lớp Phụ Trách</InputLabel>
              <Select
                value={formData.teachSclass}
                onChange={(e) =>
                  setFormData({ ...formData, teachSclass: e.target.value })
                }
                label="Lớp Phụ Trách"
              >
                {classes.map((cls) => (
                  <MenuItem key={cls._id} value={cls._id}>
                    {cls.sclassName}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions sx={{ padding: "16px" }}>
          <Button onClick={() => setOpenEditDialog(false)} variant="outlined">
            Hủy
          </Button>
          <Button
            onClick={handleEditTeacher}
            variant="contained"
            color="primary"
          >
            Cập Nhật
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Teacher Dialog */}
      <Dialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: "bold", fontSize: "18px" }}>
          Xác Nhận Xóa
        </DialogTitle>
        <DialogContent dividers>
          <Typography>
            Bạn có chắc chắn muốn xóa giảng viên{" "}
            <strong>{selectedTeacher?.name}</strong>?
          </Typography>
          <Typography color="error" sx={{ marginTop: "8px" }}>
            Hành động này không thể hoàn tác!
          </Typography>
        </DialogContent>
        <DialogActions sx={{ padding: "16px" }}>
          <Button onClick={() => setOpenDeleteDialog(false)} variant="outlined">
            Hủy
          </Button>
          <Button
            onClick={handleDeleteTeacher}
            variant="contained"
            color="error"
          >
            Xóa
          </Button>
        </DialogActions>
      </Dialog>

      {/* Reset Password Dialog */}
      <Dialog
        open={openResetPasswordDialog}
        onClose={() => setOpenResetPasswordDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: "bold", fontSize: "18px" }}>
          Reset Mật Khẩu
        </DialogTitle>
        <DialogContent dividers>
          <Typography sx={{ marginBottom: "16px" }}>
            Reset mật khẩu cho giảng viên: <strong>{selectedTeacher?.name}</strong>
          </Typography>
          <TextField
            label="Mật Khẩu Mới"
            type="password"
            fullWidth
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Nhập mật khẩu mới"
          />
        </DialogContent>
        <DialogActions sx={{ padding: "16px" }}>
          <Button
            onClick={() => setOpenResetPasswordDialog(false)}
            variant="outlined"
          >
            Hủy
          </Button>
          <Button
            onClick={handleResetPassword}
            variant="contained"
            color="warning"
          >
            Reset
          </Button>
        </DialogActions>
      </Dialog>

      {/* Teacher Details Dialog */}
      <Dialog
        open={openDetailsDialog}
        onClose={() => setOpenDetailsDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: "bold", fontSize: "18px" }}>
          Chi Tiết Giảng Viên
        </DialogTitle>
        <DialogContent dividers>
          {teacherDetails ? (
            <Box sx={{ display: "flex", flexDirection: "column", gap: "16px", marginTop: "16px" }}>
              <Card>
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                    {teacherDetails.name}
                  </Typography>
                  <Typography color="textSecondary">
                    Email: {teacherDetails.email}
                  </Typography>
                </CardContent>
              </Card>

              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
                  Thống Kê:
                </Typography>
                <Grid container spacing={2} sx={{ marginTop: "8px" }}>
                  <Grid item xs={6}>
                    <Card variant="outlined">
                      <CardContent sx={{ textAlign: "center" }}>
                        <Typography variant="h5">
                          {teacherDetails.totalSubjects}
                        </Typography>
                        <Typography color="textSecondary">Môn Học</Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={6}>
                    <Card variant="outlined">
                      <CardContent sx={{ textAlign: "center" }}>
                        <Typography variant="h5">
                          {teacherDetails.totalClasses}
                        </Typography>
                        <Typography color="textSecondary">Lớp Phụ Trách</Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={6}>
                    <Card variant="outlined">
                      <CardContent sx={{ textAlign: "center" }}>
                        <Typography variant="h5">
                          {teacherDetails.assignmentsCreated}
                        </Typography>
                        <Typography color="textSecondary">Bài Tập Tạo</Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              </Box>

              {teacherDetails.subjects && teacherDetails.subjects.length > 0 && (
                <Box>
                  <Divider sx={{ marginBottom: "8px" }} />
                  <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
                    Phân Công Giảng Dạy:
                  </Typography>
                  {teacherDetails.subjects.map((subject, index) => (
                    <Card key={index} variant="outlined" sx={{ marginTop: "8px" }}>
                      <CardContent>
                        <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                          {subject.subjectName}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          Lớp:{" "}
                          {subject.classes.join(", ") || "Chưa phân công"}
                        </Typography>
                      </CardContent>
                    </Card>
                  ))}
                </Box>
              )}
            </Box>
          ) : (
            <CircularProgress />
          )}
        </DialogContent>
        <DialogActions sx={{ padding: "16px" }}>
          <Button
            onClick={() => setOpenDetailsDialog(false)}
            variant="contained"
          >
            Đóng
          </Button>
        </DialogActions>
      </Dialog>
    </PageContainer>
  );
};

export default AdminTeacherManagement;
