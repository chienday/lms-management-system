import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardActions,
  Button,
  Grid,
  Typography,
  Box,
  Dialog,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Fab,
  IconButton,
  Tooltip,
  Chip,
  LinearProgress,
  CircularProgress,
  Alert,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SearchIcon from "@mui/icons-material/Search";
import styled from "styled-components";
import { Link } from "react-router-dom";
import curriculumService from "../../../services/curriculumService";

const StyledCard = styled(Card)`
  height: 100%;
  display: flex;
  flex-direction: column;
  transition: all 0.3s ease;
  border: 1px solid #e0e7ff;
  border-radius: 12px;

  &:hover {
    box-shadow: 0 12px 24px rgba(37, 99, 235, 0.1);
    transform: translateY(-4px);
  }
`;

const StyledCardContent = styled(CardContent)`
  flex-grow: 1;
`;

const HeaderBox = styled(Box)`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 16px;
`;

const SearchBox = styled(Box)`
  display: flex;
  gap: 12px;
  align-items: center;
  flex: 1;
  min-width: 300px;
  flex-wrap: wrap;
`;

const CurriculumList = () => {
  const [curriculums, setCurriculums] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [subjects, setSubjects] = useState([]);

  const [openDialog, setOpenDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedCurriculum, setSelectedCurriculum] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterSubject, setFilterSubject] = useState("all");

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    subject: "",
    tags: "",
    topics: "",
  });

  // Load curriculums on component mount
  useEffect(() => {
    loadCurriculums();
    loadSubjects();
  }, []);

  // Load curriculums when filters change
  useEffect(() => {
    if (searchTerm || filterStatus !== "all" || filterSubject !== "all") {
      loadCurriculums();
    }
  }, [searchTerm, filterStatus, filterSubject]);

  const loadCurriculums = async () => {
    try {
      setLoading(true);
      setError(null);

      const filters = {};
      if (filterStatus !== "all") filters.status = filterStatus;
      if (filterSubject !== "all") filters.subject = filterSubject;

      let response;
      if (searchTerm) {
        response = await curriculumService.searchCurriculums(searchTerm, filters);
      } else {
        response = await curriculumService.getTeacherCurriculums(filters);
      }

      setCurriculums(response.curriculums || []);
    } catch (err) {
      console.error("Error loading curriculums:", err);
      setError("Failed to load curriculums. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const loadSubjects = async () => {
    try {
      // For now, we'll set default subjects
      // In a real app, you would fetch from API
      setSubjects([
        { id: "1", name: "Lịch sử Chính trị" },
        { id: "2", name: "Lịch sử Đảng Cộng sản Việt Nam" },
        { id: "3", name: "Lịch sử Thế giới" },
        { id: "4", name: "Lịch sử Việt Nam" },
      ]);
    } catch (err) {
      console.error("Error loading subjects:", err);
    }
  };

  const handleDialogOpen = (curriculum = null) => {
    if (curriculum) {
      setFormData({
        name: curriculum.name,
        description: curriculum.description,
        subject: curriculum.subject._id || curriculum.subject,
        tags: curriculum.tags?.join(", ") || "",
        topics: curriculum.topics?.join(", ") || "",
      });
      setSelectedCurriculum(curriculum);
    } else {
      setFormData({ name: "", description: "", subject: "", tags: "", topics: "" });
      setSelectedCurriculum(null);
    }
    setOpenDialog(true);
  };

  const handleDialogClose = () => {
    setOpenDialog(false);
    setSelectedCurriculum(null);
  };

  const handleSave = async () => {
    try {
      if (!formData.name || !formData.subject) {
        setError("Name and Subject are required");
        return;
      }

      setLoading(true);

      const data = {
        name: formData.name,
        description: formData.description,
        subjectId: formData.subject,
        tags: formData.tags.split(",").map((t) => t.trim()).filter(Boolean),
        topics: formData.topics.split(",").map((t) => t.trim()).filter(Boolean),
      };

      if (selectedCurriculum) {
        await curriculumService.updateCurriculum(selectedCurriculum._id, {
          name: data.name,
          description: data.description,
          tags: data.tags,
          topics: data.topics,
        });
      } else {
        await curriculumService.createCurriculum(data);
      }

      handleDialogClose();
      loadCurriculums();
      setError(null);
    } catch (err) {
      console.error("Error saving curriculum:", err);
      setError(err.message || "Failed to save curriculum");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (curriculum) => {
    setSelectedCurriculum(curriculum);
    setOpenDeleteDialog(true);
  };

  const handleConfirmDelete = async () => {
    try {
      setLoading(true);
      await curriculumService.deleteCurriculum(selectedCurriculum._id);
      setOpenDeleteDialog(false);
      setSelectedCurriculum(null);
      loadCurriculums();
      setError(null);
    } catch (err) {
      console.error("Error deleting curriculum:", err);
      setError(err.message || "Failed to delete curriculum");
    } finally {
      setLoading(false);
    }
  };

  const handleResetFilters = () => {
    setSearchTerm("");
    setFilterStatus("all");
    setFilterSubject("all");
  };

  const emptyState =
    !loading && curriculums.length === 0 && !error;

  return (
    <Box sx={{ p: 3 }}>
      <HeaderBox>
        <div>
          <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
            📖 Quản lý Giáo trình
          </Typography>
          <Typography variant="body2" sx={{ color: "#64748b" }}>
            Tổng số giáo trình: {curriculums.length}
          </Typography>
        </div>
        <Fab
          color="primary"
          aria-label="add"
          onClick={() => handleDialogOpen()}
          sx={{ backgroundColor: "#2563eb" }}
          disabled={loading}
        >
          <AddIcon />
        </Fab>
      </HeaderBox>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Search and Filter Section */}
      <SearchBox sx={{ mb: 3 }}>
        <TextField
          placeholder="Tìm kiếm theo tên, chủ đề..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          size="small"
          variant="outlined"
          sx={{ flex: 1, minWidth: 250 }}
          InputProps={{
            startAdornment: <SearchIcon sx={{ mr: 1, color: "#64748b" }} />,
          }}
        />

        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Trạng thái</InputLabel>
          <Select
            value={filterStatus}
            label="Trạng thái"
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <MenuItem value="all">Tất cả</MenuItem>
            <MenuItem value="draft">Nháp</MenuItem>
            <MenuItem value="published">Đã xuất bản</MenuItem>
            <MenuItem value="archived">Lưu trữ</MenuItem>
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Môn học</InputLabel>
          <Select
            value={filterSubject}
            label="Môn học"
            onChange={(e) => setFilterSubject(e.target.value)}
          >
            <MenuItem value="all">Tất cả</MenuItem>
            {subjects.map((subject) => (
              <MenuItem key={subject.id} value={subject.id}>
                {subject.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {(searchTerm || filterStatus !== "all" || filterSubject !== "all") && (
          <Button
            variant="outlined"
            size="small"
            onClick={handleResetFilters}
            sx={{ color: "#64748b" }}
          >
            Xóa bộ lọc
          </Button>
        )}
      </SearchBox>

      {/* Loading State */}
      {loading && (
        <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {/* Empty State */}
      {emptyState && (
        <Box
          sx={{
            textAlign: "center",
            py: 8,
            px: 3,
            bgcolor: "#f8fafc",
            borderRadius: 2,
            border: "1px dashed #cbd5e1",
          }}
        >
          <Typography variant="h6" sx={{ mb: 1, color: "#64748b" }}>
            Không có giáo trình nào
          </Typography>
          <Typography variant="body2" sx={{ color: "#94a3b8", mb: 2 }}>
            Tạo giáo trình đầu tiên của bạn bằng cách nhấp vào nút "+" ở phía trên
          </Typography>
          <Button
            variant="contained"
            onClick={() => handleDialogOpen()}
            sx={{ backgroundColor: "#2563eb", mt: 2 }}
          >
            Tạo Giáo trình
          </Button>
        </Box>
      )}

      {/* Curriculum Cards */}
      {!loading && curriculums.length > 0 && (
        <Grid container spacing={3}>
          {curriculums.map((curriculum) => (
            <Grid item xs={12} sm={6} md={4} key={curriculum._id}>
              <StyledCard>
                <StyledCardContent>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      mb: 1,
                    }}
                  >
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 600,
                        color: "#1e3a8a",
                        flex: 1,
                        mr: 1,
                      }}
                    >
                      {curriculum.name}
                    </Typography>
                    <Chip
                      label={
                        curriculum.status === "published"
                          ? "Đã xuất bản"
                          : curriculum.status === "draft"
                          ? "Nháp"
                          : "Lưu trữ"
                      }
                      size="small"
                      color={
                        curriculum.status === "published" ? "success" : "default"
                      }
                    />
                  </Box>

                  <Typography
                    variant="body2"
                    sx={{ color: "#475569", mb: 2, minHeight: "40px" }}
                  >
                    {curriculum.description}
                  </Typography>

                  <Box sx={{ mb: 2 }}>
                    <Chip
                      label={curriculum.subject?.name || "Unknown"}
                      size="small"
                      variant="outlined"
                      sx={{ mr: 1 }}
                    />
                    <Typography variant="caption" sx={{ color: "#94a3b8" }}>
                      {new Date(curriculum.createdAt).toLocaleDateString("vi-VN")}
                    </Typography>
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        mb: 1,
                      }}
                    >
                      <Typography variant="caption" sx={{ fontWeight: 500 }}>
                        Tiến độ
                      </Typography>
                      <Typography variant="caption" sx={{ fontWeight: 600 }}>
                        {curriculum.progress}%
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={curriculum.progress}
                      sx={{ borderRadius: "4px" }}
                    />
                  </Box>

                  <Grid container spacing={1}>
                    <Grid item xs={4}>
                      <Box
                        sx={{
                          textAlign: "center",
                          p: 1,
                          bgcolor: "#eef2ff",
                          borderRadius: 1,
                        }}
                      >
                        <Typography
                          variant="body2"
                          sx={{ fontWeight: 600, color: "#2563eb" }}
                        >
                          {curriculum.totalChapters}
                        </Typography>
                        <Typography variant="caption" sx={{ color: "#64748b" }}>
                          Chương
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={4}>
                      <Box
                        sx={{
                          textAlign: "center",
                          p: 1,
                          bgcolor: "#eef2ff",
                          borderRadius: 1,
                        }}
                      >
                        <Typography
                          variant="body2"
                          sx={{ fontWeight: 600, color: "#2563eb" }}
                        >
                          {curriculum.totalLessons}
                        </Typography>
                        <Typography variant="caption" sx={{ color: "#64748b" }}>
                          Bài học
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={4}>
                      <Box
                        sx={{
                          textAlign: "center",
                          p: 1,
                          bgcolor: "#eef2ff",
                          borderRadius: 1,
                        }}
                      >
                        <Typography
                          variant="body2"
                          sx={{ fontWeight: 600, color: "#2563eb" }}
                        >
                          {curriculum.totalDocuments}
                        </Typography>
                        <Typography variant="caption" sx={{ color: "#64748b" }}>
                          Tài liệu
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </StyledCardContent>

                <CardActions sx={{ pt: 0, gap: 1 }}>
                  <Tooltip title="Xem chi tiết">
                    <Button
                      size="small"
                      component={Link}
                      to={`/teacher/curriculum/${curriculum._id}`}
                      sx={{ color: "#2563eb" }}
                      disabled={loading}
                    >
                      Chi tiết
                    </Button>
                  </Tooltip>
                  <Tooltip title="Chỉnh sửa">
                    <IconButton
                      size="small"
                      onClick={() => handleDialogOpen(curriculum)}
                      disabled={loading}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Xóa">
                    <IconButton
                      size="small"
                      onClick={() => handleDeleteClick(curriculum)}
                      disabled={loading}
                    >
                      <DeleteIcon
                        fontSize="small"
                        sx={{ color: "#ef4444" }}
                      />
                    </IconButton>
                  </Tooltip>
                </CardActions>
              </StyledCard>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Dialog tạo/chỉnh sửa giáo trình */}
      <Dialog open={openDialog} onClose={handleDialogClose} maxWidth="sm" fullWidth>
        <Box sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
            {selectedCurriculum ? "Chỉnh sửa Giáo trình" : "Tạo Giáo trình mới"}
          </Typography>

          <TextField
            fullWidth
            label="Tên giáo trình"
            value={formData.name}
            onChange={(e) =>
              setFormData({ ...formData, name: e.target.value })
            }
            sx={{ mb: 2 }}
            disabled={loading}
          />

          <TextField
            fullWidth
            label="Mô tả"
            multiline
            rows={3}
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            sx={{ mb: 2 }}
            disabled={loading}
          />

          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Môn học</InputLabel>
            <Select
              value={formData.subject}
              label="Môn học"
              onChange={(e) =>
                setFormData({ ...formData, subject: e.target.value })
              }
              disabled={loading}
            >
              {subjects.map((subject) => (
                <MenuItem key={subject.id} value={subject.id}>
                  {subject.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            fullWidth
            label="Tags (cách nhau bởi dấu phẩy)"
            value={formData.tags}
            onChange={(e) =>
              setFormData({ ...formData, tags: e.target.value })
            }
            sx={{ mb: 2 }}
            size="small"
            disabled={loading}
          />

          <TextField
            fullWidth
            label="Topics (cách nhau bởi dấu phẩy)"
            value={formData.topics}
            onChange={(e) =>
              setFormData({ ...formData, topics: e.target.value })
            }
            sx={{ mb: 2 }}
            size="small"
            disabled={loading}
          />

          <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end" }}>
            <Button
              onClick={handleDialogClose}
              sx={{ color: "#64748b" }}
              disabled={loading}
            >
              Hủy
            </Button>
            <Button
              onClick={handleSave}
              variant="contained"
              sx={{ backgroundColor: "#2563eb" }}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : "Lưu"}
            </Button>
          </Box>
        </Box>
      </Dialog>

      {/* Dialog xác nhận xóa */}
      <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
        <Box sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Xác nhận xóa
          </Typography>
          <Typography sx={{ mb: 2, color: "#64748b" }}>
            Bạn có chắc chắn muốn xóa giáo trình "{selectedCurriculum?.name}"
            không? Hành động này không thể hoàn tác.
          </Typography>
          <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end" }}>
            <Button
              onClick={() => setOpenDeleteDialog(false)}
              sx={{ color: "#64748b" }}
              disabled={loading}
            >
              Hủy
            </Button>
            <Button
              onClick={handleConfirmDelete}
              variant="contained"
              sx={{ backgroundColor: "#ef4444" }}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : "Xóa"}
            </Button>
          </Box>
        </Box>
      </Dialog>
    </Box>
  );
};

export default CurriculumList;
