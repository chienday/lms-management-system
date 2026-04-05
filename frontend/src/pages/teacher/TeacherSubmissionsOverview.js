import React, { useEffect, useState, useCallback } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Alert,
  Tooltip,
  IconButton,
  TablePagination,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from "@mui/material";
import {
  CheckCircle,
  Schedule,
  Visibility,
  Info,
  Edit,
} from "@mui/icons-material";
import styled from "styled-components";
import axios from "axios";
import moment from "moment";
import "moment/locale/vi";

moment.locale("vi");

const PageContainer = styled(Box)`
  padding: 24px;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  min-height: 100vh;
`;

const HeaderBox = styled(Box)`
  margin-bottom: 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 16px;
  }
`;

const FilterBox = styled(Box)`
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
  flex-wrap: wrap;

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const StatCard = styled(Paper)`
  padding: 20px;
  text-align: center;
  background: linear-gradient(135deg, ${(props) => props.bgColor || "#f0f0f0"} 0%, ${(props) => props.bgColor2 || "#f8f8f8"} 100%);
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);

  .stat-value {
    font-size: 32px;
    font-weight: bold;
    color: ${(props) => props.textColor || "#333"};
    margin: 10px 0;
  }

  .stat-label {
    font-size: 12px;
    color: #666;
    font-weight: 500;
  }

  .stat-icon {
    font-size: 36px;
    color: ${(props) => props.textColor || "#333"};
  }
`;

const StyledTableContainer = styled(TableContainer)`
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  overflow: hidden;
`;

const StyledTableCell = styled(TableCell)`
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 250px;
  
  &.title-cell {
    max-width: 180px;
  }
  
  &.class-cell {
    max-width: 120px;
  }
`;

const TextEllipsis = styled(Box)`
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: block;
  width: 100%;
`;

const StyledTableRow = styled(TableRow)`
  &:hover {
    background-color: #f8fafc;
  }
`;

const StatusChip = {
  pending: { label: "Chưa nộp", color: "#f0ad4e", bgcolor: "#fff8e1" },
  submitted: { label: "Đã nộp", color: "#5cb85c", bgcolor: "#e8f5e9" },
  late: { label: "Nộp trễ", color: "#d9534f", bgcolor: "#fee" },
  graded: { label: "Đã chấm", color: "#0275d8", bgcolor: "#e3f2fd" },
  "not-submitted": { label: "Chưa nộp", color: "#f0ad4e", bgcolor: "#fff8e1" },
};

const TeacherSubmissionsOverview = () => {
  const { currentUser } = useSelector((state) => state.user);
  const navigate = useNavigate();
  const teacherId = currentUser?._id;

  // Environment-aware API URL
  const API_BASE_URL = process.env.NODE_ENV === 'development'
    ? 'http://localhost:5000'
    : '/api';

  // State
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [subjects, setSubjects] = useState([]);
  const [statsData, setStatsData] = useState({
    totalAssignments: 0,
    pendingGrading: 0,
    submitted: 0,
    avgSubmissionRate: 0,
  });

  // Calculate statistics - memoized to prevent unnecessary recalculations
  const calculateStats = useCallback((assignmentList) => {
    const totalAssignments = assignmentList.length;
    let totalSubmitted = 0;
    let totalPendingGrading = 0;
    let totalSubmissionRate = 0;
    let assignmentsWithStats = 0;

    assignmentList.forEach((assignment) => {
      const stats = assignment.stats;
      if (stats && stats.totalCount > 0) {
        assignmentsWithStats++;
        totalSubmitted += stats.submittedCount || 0;
        totalPendingGrading += Math.max(0, (stats.submittedCount || 0) - (stats.gradedCount || 0));
        totalSubmissionRate += ((stats.submittedCount || 0) / stats.totalCount);
      }
    });

    const avgSubmissionRate =
      assignmentsWithStats > 0 ? Math.round((totalSubmissionRate / assignmentsWithStats) * 100) : 0;

    setStatsData({
      totalAssignments,
      pendingGrading: totalPendingGrading,
      submitted: totalSubmitted,
      avgSubmissionRate,
    });
  }, []);

  // Load data on mount
  // Single API call - NO N+1 queries. Backend should return stats with assignments
  const loadAssignments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      if (!teacherId) {
        setError("Không tìm thấy thông tin giáo viên. Vui lòng đăng nhập lại.");
        setLoading(false);
        return;
      }

      // Single API call to get assignments with stats included
      const response = await axios.get(
        `${API_BASE_URL}/Assignment/Teacher/${teacherId}`,
        { timeout: 15000 }
      );

      if (response.data.assignments && Array.isArray(response.data.assignments)) {
        setAssignments(response.data.assignments);
        calculateStats(response.data.assignments);
      } else if (response.data.message) {
        setAssignments([]);
        console.log("No assignments found:", response.data.message);
      } else {
        setAssignments([]);
      }
    } catch (err) {
      const errorMsg = 
        err.response?.data?.message ||
        err.message ||
        "Không thể tải danh sách bài tập. Vui lòng thử lại.";
      console.error("Error loading assignments:", err);
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  }, [teacherId, API_BASE_URL, calculateStats]);

  // Load teacher subjects
  const loadTeacherSubjects = useCallback(async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/TeachingAssignment/Teacher/${teacherId}`
      );

      // Transform teaching assignments to subjects
      if (response.data.assignments && Array.isArray(response.data.assignments)) {
        const subjectsMap = {};
        response.data.assignments.forEach((assignment) => {
          if (assignment.subject && !subjectsMap[assignment.subject._id]) {
            subjectsMap[assignment.subject._id] = {
              _id: assignment.subject._id,
              subjectName: assignment.subject.subName || assignment.subject.subjectName,
              subName: assignment.subject.subName || assignment.subject.subjectName,
            };
          }
        });
        setSubjects(Object.values(subjectsMap));
      }
    } catch (err) {
      console.error("Error loading subjects:", err.message);
    }
  }, [teacherId, API_BASE_URL]);

  // Load data on mount or when teacher ID changes
  useEffect(() => {
    if (teacherId) {
      loadAssignments();
      loadTeacherSubjects();
    }
  }, [teacherId, loadAssignments, loadTeacherSubjects]);

  // Memoize filtered assignments to prevent unnecessary recalculations
  const filteredAssignments = React.useMemo(() => {
    return assignments.filter((assignment) => {
      const matchesSearch =
        assignment.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        assignment.description?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesSubject = !selectedSubject || assignment.subject?._id === selectedSubject;

      const matchesStatus = !selectedStatus || getAssignmentStatus(assignment) === selectedStatus;

      return matchesSearch && matchesSubject && matchesStatus;
    });
  }, [assignments, searchTerm, selectedSubject, selectedStatus]);

  // Get assignment status - Fixed logic
  const getAssignmentStatus = (assignment) => {
    if (!assignment.stats) return "unknown";

    const stats = assignment.stats;
    const { submittedCount = 0, gradedCount = 0, lateCount = 0 } = stats;

    // not-submitted: no submissions
    if (submittedCount === 0) {
      return "not-submitted";
    }
    
    // graded: all submitted have been graded
    if (gradedCount === submittedCount) {
      return "graded";
    }
    
    // late: any submissions are late
    if (lateCount > 0) {
      return "late";
    }
    
    // submitted: default catch-all
    return "submitted";
  };

  // Handle view submissions
  const handleViewSubmissions = (assignmentId) => {
    navigate(`/Teacher/Submissions/${assignmentId}`);
  };

  // Handle grade now - quick access to grading page
  const handleGradeNow = (assignmentId) => {
    navigate(`/Teacher/Submissions/${assignmentId}?activeTab=grading`);
  };

  // Handle pagination
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const paginatedAssignments = filteredAssignments.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  if (loading) {
    return (
      <PageContainer>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
          <Box textAlign="center">
            <CircularProgress sx={{ mb: 2 }} />
            <Typography>Đang tải dữ liệu...</Typography>
          </Box>
        </Box>
      </PageContainer>
    );
  }

  if (!teacherId) {
    return (
      <PageContainer>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
          <Alert severity="error">
            Không tìm thấy thông tin giáo viên. Vui lòng đăng nhập lại.
          </Alert>
        </Box>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      {/* Header */}
      <HeaderBox>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
            Quản lý nộp và chấm bài
          </Typography>
          <Typography variant="body2" sx={{ color: "#666" }}>
            Theo dõi và chấm điểm bài nộp của học sinh
          </Typography>
        </Box>
        <Button
          variant="contained"
          onClick={loadAssignments}
          disabled={loading}
          sx={{ height: "fit-content" }}
        >
          {loading ? "Đang tải..." : "Làm mới"}
        </Button>
      </HeaderBox>

      {/* Error Alert with Better UX */}
      {error && (
        <Alert 
          severity="error" 
          sx={{ mb: 3 }}
          onClose={() => setError(null)}
          action={
            <Button 
              color="inherit" 
              size="small" 
              onClick={loadAssignments}
              disabled={loading}
            >
              {loading ? "Đang...":"Thử lại"}
            </Button>
          }
        >
          <Typography variant="subtitle2" sx={{ mb: 0.5, fontWeight: 600 }}>
            Lỗi tải dữ liệu
          </Typography>
          <Typography variant="body2">
            {error}
          </Typography>
        </Alert>
      )}

      {/* Statistics Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            bgColor="#e3f2fd"
            bgColor2="#bbdefb"
            textColor="#1976d2"
          >
            <CheckCircle className="stat-icon" />
            <div className="stat-value">{statsData.totalAssignments}</div>
            <div className="stat-label">Tổng bài tập</div>
          </StatCard>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            bgColor="#e8f5e9"
            bgColor2="#c8e6c9"
            textColor="#388e3c"
          >
            <CheckCircle className="stat-icon" />
            <div className="stat-value">{statsData.submitted}</div>
            <div className="stat-label">Bài nộp</div>
          </StatCard>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            bgColor="#fff3e0"
            bgColor2="#ffe0b2"
            textColor="#f57c00"
          >
            <Schedule className="stat-icon" />
            <div className="stat-value">{statsData.pendingGrading}</div>
            <div className="stat-label">Chưa chấm</div>
          </StatCard>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            bgColor="#f3e5f5"
            bgColor2="#e1bee7"
            textColor="#6a1b9a"
          >
            <Info className="stat-icon" />
            <div className="stat-value">{statsData.avgSubmissionRate}%</div>
            <div className="stat-label">Tỷ lệ nộp</div>
          </StatCard>
        </Grid>
      </Grid>

      {/* Filters */}
      <FilterBox>
        <TextField
          placeholder="Tìm kiếm bài tập..."
          variant="outlined"
          size="small"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setPage(0);
          }}
          sx={{ flex: 1, minWidth: 200 }}
        />

        <FormControl variant="outlined" size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Môn học</InputLabel>
          <Select
            value={selectedSubject}
            onChange={(e) => {
              setSelectedSubject(e.target.value);
              setPage(0);
            }}
            label="Môn học"
          >
            <MenuItem value="">Tất cả</MenuItem>
            {subjects.map((subject) => (
              <MenuItem key={subject._id} value={subject._id}>
                {subject.subjectName}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl variant="outlined" size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Trạng thái</InputLabel>
          <Select
            value={selectedStatus}
            onChange={(e) => {
              setSelectedStatus(e.target.value);
              setPage(0);
            }}
            label="Trạng thái"
          >
            <MenuItem value="">Tất cả</MenuItem>
            <MenuItem value="not-submitted">Chưa nộp</MenuItem>
            <MenuItem value="submitted">Đã nộp</MenuItem>
            <MenuItem value="late">Nộp trễ</MenuItem>
            <MenuItem value="graded">Đã chấm</MenuItem>
          </Select>
        </FormControl>

        <Button
          variant="contained"
          onClick={() => {
            setSearchTerm("");
            setSelectedSubject("");
            setSelectedStatus("");
            setPage(0);
          }}
        >
          Xóa bộ lọc
        </Button>
      </FilterBox>

      {/* Assignments Table */}
      <StyledTableContainer>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
              <TableCell sx={{ fontWeight: 600 }}>Tên bài tập</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Môn học</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Lớp học</TableCell>
              <TableCell sx={{ fontWeight: 600 }} align="center">
                Tổng / Nộp / Chấm
              </TableCell>
              <TableCell sx={{ fontWeight: 600 }} align="center">
                Tỉ lệ
              </TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Hạn nộp</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Trạng thái</TableCell>
              <TableCell sx={{ fontWeight: 600 }} align="center">
                Hành động
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {paginatedAssignments.length > 0 ? (
              paginatedAssignments.map((assignment) => {
                const stats = assignment.stats || {};
                const status = getAssignmentStatus(assignment);
                const statusInfo = StatusChip[status] || StatusChip.pending;
                const totalCount = stats?.totalCount || 0;
                const submittedCount = stats?.submittedCount || 0;
                const gradedCount = stats?.gradedCount || 0;
                const submissionRate =
                  totalCount > 0
                    ? Math.round((submittedCount / totalCount) * 100)
                    : 0;
                const className = assignment.classes?.[0]?.className || assignment.class?.className || "-";

                return (
                  <StyledTableRow key={assignment._id}>
                    <StyledTableCell className="title-cell">
                      <Tooltip title={assignment.description || assignment.title}>
                        <TextEllipsis sx={{ fontWeight: 500 }}>
                          {assignment.title}
                        </TextEllipsis>
                      </Tooltip>
                    </StyledTableCell>
                    <TableCell>
                      <TextEllipsis>
                        {assignment.subject?.subName || assignment.subject?.subjectName || "-"}
                      </TextEllipsis>
                    </TableCell>
                    <StyledTableCell className="class-cell">
                      <TextEllipsis>
                        {className}
                      </TextEllipsis>
                    </StyledTableCell>
                    <TableCell align="center">
                      <Chip
                        label={`${totalCount} / ${submittedCount} / ${gradedCount}`}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Box sx={{ fontWeight: 600, color: "#2563eb" }}>
                        {submissionRate}%
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Tooltip title={moment(assignment.dueDate).format("DD/MM/YYYY HH:mm")}>
                        <TextEllipsis>
                          {moment(assignment.dueDate).format("DD/MM HH:mm")}
                        </TextEllipsis>
                      </Tooltip>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={statusInfo.label}
                        size="small"
                        sx={{
                          color: statusInfo.color,
                          backgroundColor: statusInfo.bgcolor,
                        }}
                      />
                    </TableCell>
                    <TableCell align="center" sx={{ whiteSpace: "nowrap" }}>
                      <Tooltip title="Xem chi tiết">
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => handleViewSubmissions(assignment._id)}
                        >
                          <Visibility />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title={submittedCount === 0 ? "Chưa có bài nộp" : "Chấm điểm ngay"}>
                        <span>
                          <IconButton
                            size="small"
                            color="success"
                            onClick={() => handleGradeNow(assignment._id)}
                            disabled={submittedCount === 0}
                          >
                            <Edit />
                          </IconButton>
                        </span>
                      </Tooltip>
                    </TableCell>
                  </StyledTableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                  <Typography color="textSecondary">
                    {assignments.length === 0 ? "Không có bài tập nào" : "Không tìm thấy bài tập nào"}
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </StyledTableContainer>

      {/* Pagination */}
      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={filteredAssignments.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        labelRowsPerPage="Hàng trên mỗi trang:"
        labelDisplayedRows={({ from, to, count }) =>
          `${from}–${to} của ${count !== -1 ? count : `hơn ${to}`}`
        }
        sx={{ mt: 2 }}
      />
    </PageContainer>
  );
};

export default TeacherSubmissionsOverview;
