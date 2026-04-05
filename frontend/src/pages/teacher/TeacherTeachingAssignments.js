import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
  CircularProgress,
  Container,
} from "@mui/material";
import { School, Class as ClassIcon, MenuBook } from "@mui/icons-material";
import {
  getTeacherTeachingAssignments,
  setSelectedSubject,
} from "../../redux/teachingAssignmentRelated/teachingAssignmentSlice";

const TeacherTeachingAssignments = () => {
  const dispatch = useDispatch();
  const { currentUser } = useSelector((state) => state.user);
  const {
    teachingAssignments,
    loading,
    error,
    selectedSubjectId,
    selectedClasses,
  } = useSelector((state) => state.teachingAssignment);

  const teacherId = currentUser?._id;

  // Load teaching assignments on mount
  useEffect(() => {
    if (teacherId) {
      dispatch(getTeacherTeachingAssignments(teacherId));
    }
  }, [teacherId, dispatch]);

  // Get unique subjects
  const subjects = teachingAssignments.map((ta) => ({
    _id: ta.subject?._id,
    subName: ta.subject?.subName,
    subCode: ta.subject?.subCode,
  }));

  // Get selected subject details
  const selectedSubjectDetails = teachingAssignments.find(
    (ta) => ta.subject?._id === selectedSubjectId
  );

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">{typeof error === 'string' ? error : (error?.message ? error.message : 'Đã xảy ra lỗi')}</Alert>
      </Container>
    );
  }

  if (teachingAssignments.length === 0) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Header */}
        <Box
          sx={{
            mb: 4,
            background: "linear-gradient(135deg, #2563eb 0%, #1e40af 100%)",
            p: 4,
            borderRadius: 2,
            color: "white",
          }}
        >
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              mb: 1,
              display: "flex",
              alignItems: "center",
              gap: 1.5,
            }}
          >
            <School /> Quản lý phân công giảng dạy
          </Typography>
          <Typography variant="body1" sx={{ opacity: 0.9 }}>
            Xem tất cả các môn học và lớp được phân công
          </Typography>
        </Box>

        {/* Empty State */}
        <Box
          sx={{
            textAlign: "center",
            py: 6,
            color: "#64748b",
          }}
        >
          <School sx={{ fontSize: 64, color: "#cbd5e1", mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            Chưa có phân công giảng dạy
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Hãy liên hệ với quản trị viên để được phân công giảng dạy
          </Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box
        sx={{
          mb: 4,
          background: "linear-gradient(135deg, #2563eb 0%, #1e40af 100%)",
          p: 4,
          borderRadius: 2,
          color: "white",
        }}
      >
        <Typography
          variant="h4"
          sx={{
            fontWeight: 700,
            mb: 1,
            display: "flex",
            alignItems: "center",
            gap: 1.5,
          }}
        >
          <School /> Quản lý phân công giảng dạy
        </Typography>
        <Typography variant="body1" sx={{ opacity: 0.9 }}>
          Xem tất cả các môn học và lớp được phân công cho bạn
        </Typography>
      </Box>

      {/* Filter Section */}
      <Paper
        sx={{
          p: 3,
          mb: 3,
          borderRadius: 1.5,
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
        }}
      >
        <Grid container spacing={2} alignItems="flex-end">
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Chọn môn học</InputLabel>
              <Select
                value={selectedSubjectId || ""}
                label="Chọn môn học"
                onChange={(e) => dispatch(setSelectedSubject(e.target.value))}
              >
                {subjects.map((subject) => (
                  <MenuItem key={subject._id} value={subject._id}>
                    {subject.subName} ({subject.subCode})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" color="text.secondary">
              {subjects.length} môn học, {teachingAssignments.reduce((sum, ta) => sum + (ta.classes?.length || 0), 0)} lớp
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      {/* Subject Details Card */}
      {selectedSubjectDetails && (
        <Grid container spacing={3}>
          {/* Subject Information */}
          <Grid item xs={12}>
            <Card
              sx={{
                borderRadius: 1.5,
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
                borderLeft: "4px solid #2563eb",
                "&:hover": {
                  transform: "translateY(-4px)",
                  boxShadow: "0 8px 20px rgba(0, 0, 0, 0.1)",
                },
                transition: "all 0.3s ease",
              }}
            >
              <CardContent>
                <Box display="flex" alignItems="center" gap={2} mb={2}>
                  <MenuBook sx={{ color: "#2563eb", fontSize: 32 }} />
                  <Box flex={1}>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                      {selectedSubjectDetails.subject?.subName}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Mã môn: {selectedSubjectDetails.subject?.subCode}
                    </Typography>
                  </Box>
                  <Chip
                    label={selectedSubjectDetails.status === "active" ? "Hoạt động" : "Không hoạt động"}
                    color={selectedSubjectDetails.status === "active" ? "success" : "default"}
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Classes Table */}
          <Grid item xs={12}>
            <Card
              sx={{
                borderRadius: 1.5,
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
                borderLeft: "4px solid #2563eb",
                "&:hover": {
                  transform: "translateY(-4px)",
                  boxShadow: "0 8px 20px rgba(0, 0, 0, 0.1)",
                },
                transition: "all 0.3s ease",
              }}
            >
              <CardContent>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 600,
                    mb: 2,
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                  }}
                >
                  <ClassIcon /> Danh sách lớp ({selectedClasses.length})
                </Typography>

                {selectedClasses && selectedClasses.length > 0 ? (
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow sx={{ backgroundColor: "#f1f5f9" }}>
                          <TableCell sx={{ fontWeight: 600 }}>STT</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>Tên lớp</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>Mã lớp</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {selectedClasses.map((cls, index) => (
                          <TableRow key={cls._id || index} hover>
                            <TableCell>{index + 1}</TableCell>
                            <TableCell sx={{ fontWeight: 500 }}>{cls.sclassName}</TableCell>
                            <TableCell>{cls.sclassName?.substring(0, 10)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                ) : (
                  <Box sx={{ textAlign: "center", py: 3, color: "#64748b" }}>
                    <Typography variant="body2" color="text.secondary">
                      Chưa có lớp được phân công cho môn này
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* All Assignments Overview */}
          <Grid item xs={12}>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 600,
                mb: 2,
                display: "flex",
                alignItems: "center",
                gap: 1,
              }}
            >
              <MenuBook /> Tổng quát tất cả phân công
            </Typography>
            <Grid container spacing={2}>
              {teachingAssignments.map((assignment, index) => (
                <Grid item xs={12} sm={6} md={4} key={assignment._id || index}>
                  <Card
                    sx={{
                      borderRadius: 1.5,
                      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
                      borderLeft: "4px solid #2563eb",
                      cursor: "pointer",
                      border:
                        selectedSubjectId === assignment.subject?._id
                          ? "2px solid #2563eb"
                          : "1px solid #e2e8f0",
                      "&:hover": {
                        transform: "translateY(-4px)",
                        boxShadow: "0 8px 20px rgba(0, 0, 0, 0.1)",
                      },
                      transition: "all 0.3s ease",
                    }}
                    onClick={() => dispatch(setSelectedSubject(assignment.subject?._id))}
                  >
                    <CardContent>
                      <Typography
                        variant="subtitle1"
                        sx={{ fontWeight: 600, gutterBottom: true }}
                      >
                        {assignment.subject?.subName}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {assignment.subject?.subCode}
                      </Typography>
                      <Box>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ display: "block", mb: 1 }}
                        >
                          Lớp: {assignment.classes?.length || 0}
                        </Typography>
                        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                          {assignment.classes?.slice(0, 3).map((cls, i) => (
                            <Chip
                              key={i}
                              size="small"
                              label={cls.sclassName?.substring(0, 8)}
                              variant="outlined"
                            />
                          ))}
                          {(assignment.classes?.length || 0) > 3 && (
                            <Chip
                              size="small"
                              label={`+${(assignment.classes?.length || 0) - 3}`}
                              variant="outlined"
                            />
                          )}
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Grid>
        </Grid>
      )}

      {/* Refresh Button */}
      <Box sx={{ mt: 4, display: "flex", justifyContent: "center" }}>
        <Typography
          variant="body2"
          sx={{
            cursor: "pointer",
            color: "#2563eb",
            textDecoration: "underline",
            "&:hover": { color: "#1e40af" },
          }}
          onClick={() => dispatch(getTeacherTeachingAssignments(teacherId))}
        >
          Tải lại dữ liệu
        </Typography>
      </Box>
    </Container>
  );
};

export default TeacherTeachingAssignments;
