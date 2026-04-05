import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  Box,
  Container,
  TextField,
  Button,
  Paper,
  CircularProgress,
  Alert,
  Typography,
} from "@mui/material";
import styled from "styled-components";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SaveIcon from "@mui/icons-material/Save";
import axios from "axios";

const PageContainer = styled(Box)`
  padding: 24px;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  min-height: 100vh;
`;

const HeaderBox = styled(Box)`
  margin-bottom: 24px;
  display: flex;
  align-items: center;
  gap: 16px;
`;

const FormPaper = styled(Paper)`
  padding: 32px;
  max-width: 600px;
  margin: 0 auto;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
`;

const EditSubject = () => {
  const navigate = useNavigate();
  const { id: subjectId } = useParams();
  const { currentUser } = useSelector((state) => state.user);
  const schoolId = currentUser?._id;

  const API_BASE_URL =
    process.env.NODE_ENV === "production"
      ? "http://your-backend-api"
      : "http://localhost:5000";

  // States
  const [subject, setSubject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    subName: "",
    subCode: "",
    sessions: "",
  });

  // Load subject data on mount
  useEffect(() => {
    if (schoolId && subjectId) {
      loadSubjectDetails();
    }
  }, [schoolId, subjectId]);

  // ========== API Functions ==========
  const loadSubjectDetails = async () => {
    try {
      setLoading(true);
      const url = `${API_BASE_URL}/Subject/List/${schoolId}`;
      const response = await axios.get(url);
      if (response.data.subjects) {
        const found = response.data.subjects.find((s) => s._id === subjectId);
        if (found) {
          setSubject(found);
          setFormData({
            subName: found.subName,
            subCode: found.subCode,
            sessions: found.sessions || "",
          });
        } else {
          setError("Không tìm thấy môn học");
        }
      }
    } catch (err) {
      console.error("Error loading subject:", err);
      setError(err.response?.data?.message || "Lỗi khi tải môn học");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSubject = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError(null);

      if (!formData.subName || !formData.subCode) {
        setError("Vui lòng điền tên môn học và mã môn");
        setSaving(false);
        return;
      }

      // For now, we'll use a PUT endpoint. If backend doesn't have it,
      // we might need to implement it or work around it.
      const response = await axios.put(
        `${API_BASE_URL}/Subject/${subjectId}`,
        {
          subName: formData.subName,
          subCode: formData.subCode,
          sessions: formData.sessions,
          schoolId,
        }
      );

      if (response.data.subject) {
        setSuccess(true);
        setSubject(response.data.subject);
        setTimeout(() => {
          navigate("/Admin/subjects");
        }, 1500);
      }
    } catch (err) {
      console.error("Error updating subject:", err);
      setError(err.response?.data?.message || "Lỗi khi cập nhật môn học");
    } finally {
      setSaving(false);
    }
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // ========== Render ==========
  if (loading) {
    return (
      <PageContainer>
        <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
          <CircularProgress />
        </Box>
      </PageContainer>
    );
  }

  if (!subject) {
    return (
      <PageContainer>
        <Container>
          <Alert severity="error" sx={{ mb: 2 }}>
            Không tìm thấy môn học để chỉnh sửa
          </Alert>
          <Button onClick={() => navigate("/Admin/subjects")} variant="outlined">
            ← Quay lại
          </Button>
        </Container>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <HeaderBox>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate("/Admin/subjects")}
          variant="outlined"
        >
          Quay lại
        </Button>
        <Typography variant="h4" fontWeight={700}>
          Chỉnh sửa môn học
        </Typography>
      </HeaderBox>

      <FormPaper component="form" onSubmit={handleUpdateSubject}>
        {error && (
          <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
             Cập nhật môn học thành công! Đang chuyển hướng...
          </Alert>
        )}

        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
            Tên môn học <span style={{ color: "red" }}>*</span>
          </Typography>
          <TextField
            fullWidth
            name="subName"
            value={formData.subName}
            onChange={handleFormChange}
            placeholder="e.g., Toán học"
            disabled={saving}
            variant="outlined"
            size="medium"
          />
        </Box>

        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
            Mã môn học <span style={{ color: "red" }}>*</span>
          </Typography>
          <TextField
            fullWidth
            name="subCode"
            value={formData.subCode}
            onChange={handleFormChange}
            placeholder="e.g., MATH101"
            disabled={saving}
            variant="outlined"
            size="medium"
          />
        </Box>

        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
            Số tiết (tùy chọn)
          </Typography>
          <TextField
            fullWidth
            name="sessions"
            type="number"
            value={formData.sessions}
            onChange={handleFormChange}
            placeholder="e.g., 45"
            disabled={saving}
            variant="outlined"
            size="medium"
            inputProps={{ min: 0 }}
          />
        </Box>

        <Alert severity="info" sx={{ mb: 3 }}>
           Để thay đổi lớp học hoặc giáo viên, vui lòng xem chi tiết môn học
        </Alert>

        <Box sx={{ display: "flex", gap: 2 }}>
          <Button
            type="submit"
            variant="contained"
            startIcon={<SaveIcon />}
            disabled={saving}
            sx={{ flex: 1 }}
          >
            {saving ? "Đang lưu..." : "Lưu thay đổi"}
          </Button>
          <Button
            onClick={() => navigate("/Admin/subjects")}
            variant="outlined"
            disabled={saving}
            sx={{ flex: 1 }}
          >
            Hủy
          </Button>
        </Box>
      </FormPaper>
    </PageContainer>
  );
};

export default EditSubject;
