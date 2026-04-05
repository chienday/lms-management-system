import React, { useState, useEffect } from "react";
import {
  Box,
  Tab,
  Tabs,
  Typography,
  Button,
  Dialog,
  TextField,
  IconButton,
  Chip,
  LinearProgress,
  Tooltip,
  CircularProgress,
  Alert,
  Snackbar,
} from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AddIcon from "@mui/icons-material/Add";
import ChapterAccordion from "./ChapterAccordion";
import DocumentUpload from "./DocumentUpload";
import AIProcessing from "./AIProcessing";
import ContentControl from "./ContentControl";
import styled from "styled-components";
import curriculumService from "../../../services/curriculumService";

function TabPanel(props) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

const HeaderBox = styled(Box)`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  color: white;
`;

const CurriculumDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);

  const [curriculum, setCurriculum] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");

  const [chapters, setChapters] = useState([]);
  const [documents, setDocuments] = useState([]);

  const [openChapterDialog, setOpenChapterDialog] = useState(false);
  const [selectedChapter, setSelectedChapter] = useState(null);
  const [chapterFormData, setChapterFormData] = useState({
    name: "",
    description: "",
  });
  const [savingChapter, setSavingChapter] = useState(false);

  // Load curriculum on mount
  useEffect(() => {
    loadCurriculum();
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadCurriculum = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await curriculumService.getCurriculumDetail(id);
      setCurriculum(response.curriculum);
      setChapters(response.curriculum.chapters || []);
      setDocuments(response.curriculum.documents || []);
    } catch (err) {
      console.error("Error loading curriculum:", err);
      setError(err.message || "Failed to load curriculum details");
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleAddChapter = () => {
    setChapterFormData({ name: "", description: "" });
    setSelectedChapter(null);
    setOpenChapterDialog(true);
  };

  const handleSaveChapter = async () => {
    try {
      if (!chapterFormData.name.trim()) {
        setError("Chapter name is required");
        return;
      }

      setSavingChapter(true);
      setError(null);

      if (selectedChapter) {
        // Update existing chapter
        const response = await curriculumService.updateChapter(
          id,
          selectedChapter._id || selectedChapter.id,
          chapterFormData
        );
        setChapters(
          chapters.map((c) =>
            (c._id || c.id) === (selectedChapter._id || selectedChapter.id)
              ? response.chapter
              : c
          )
        );
        setCurriculum(response.curriculum);
        setSuccessMessage("Chapter updated successfully");
      } else {
        // Add new chapter
        const response = await curriculumService.addChapter(id, chapterFormData);
        setChapters(response.curriculum.chapters || []);
        setCurriculum(response.curriculum);
        setSuccessMessage("Chapter added successfully");
      }

      setOpenChapterDialog(false);
    } catch (err) {
      console.error("Error saving chapter:", err);
      setError(err.message || "Failed to save chapter");
    } finally {
      setSavingChapter(false);
    }
  };

  const handleDeleteChapter = async (chapterId) => {
    try {
      setError(null);
      const response = await curriculumService.deleteChapter(id, chapterId);
      setChapters(response.curriculum.chapters || []);
      setCurriculum(response.curriculum);
      setSuccessMessage("Chapter deleted successfully");
    } catch (err) {
      console.error("Error deleting chapter:", err);
      setError(err.message || "Failed to delete chapter");
    }
  };

  const handleEditChapter = (chapter) => {
    setSelectedChapter(chapter);
    setChapterFormData({
      name: chapter.name,
      description: chapter.description,
    });
    setOpenChapterDialog(true);
  };

  const handleUpdateChapterContent = async (updatedChapter) => {
    try {
      setError(null);
      const response = await curriculumService.updateChapter(
        id,
        updatedChapter._id || updatedChapter.id,
        updatedChapter
      );
      setChapters(
        chapters.map((c) =>
          (c._id || c.id) === (updatedChapter._id || updatedChapter.id)
            ? response.chapter
            : c
        )
      );
      setCurriculum(response.curriculum);
      setSuccessMessage("Chapter updated successfully");
    } catch (err) {
      console.error("Error updating chapter:", err);
      setError(err.message || "Failed to update chapter");
    }
  };

  const handleDocumentUploaded = () => {
    loadCurriculum();
    setSuccessMessage("Document uploaded successfully");
  };

  const handleDocumentDeleted = () => {
    loadCurriculum();
    setSuccessMessage("Document deleted successfully");
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "80vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!curriculum) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">Curriculum not found</Alert>
        <Button onClick={() => navigate("/teacher/curriculum")} sx={{ mt: 2 }}>
          Back to Curriculums
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <HeaderBox>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Tooltip title="Quay lại">
            <IconButton
              onClick={() => navigate("/teacher/curriculum")}
              sx={{ color: "white" }}
            >
              <ArrowBackIcon />
            </IconButton>
          </Tooltip>
          <div>
            <Typography variant="h5" sx={{ fontWeight: 600, mb: 0.5 }}>
              📖 {curriculum.name}
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              {curriculum.subject?.name || "Unknown Subject"}
            </Typography>
          </div>
        </Box>
        <Box sx={{ textAlign: "right" }}>
          <Chip
            label={`Tiến độ: ${curriculum.progress}%`}
            sx={{ backgroundColor: "rgba(255,255,255,0.3)", color: "white" }}
          />
          <Chip
            label={curriculum.status === "published" ? "Đã xuất bản" : "Nháp"}
            sx={{
              backgroundColor:
                curriculum.status === "published"
                  ? "rgba(16, 185, 129, 0.3)"
                  : "rgba(229, 231, 235, 0.3)",
              color: "white",
              ml: 1,
            }}
          />
        </Box>
      </HeaderBox>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
        <LinearProgress
          variant="determinate"
          value={curriculum.progress}
          sx={{
            flex: 1,
            height: 6,
            borderRadius: 3,
            backgroundColor: "#e0e7ff",
            "& .MuiLinearProgress-bar": {
              backgroundColor: "#667eea",
            },
          }}
        />
        <Typography variant="body2" sx={{ fontWeight: 600, minWidth: 50 }}>
          {curriculum.progress}%
        </Typography>
      </Box>

      <Tabs
        value={tabValue}
        onChange={handleTabChange}
        sx={{
          borderBottom: "1px solid #e0e7ff",
          mb: 2,
          "& .MuiTab-root": {
            textTransform: "none",
            fontSize: "0.95rem",
            fontWeight: 500,
          },
          "& .Mui-selected": {
            color: "#2563eb",
          },
          "& .MuiTabs-indicator": {
            backgroundColor: "#2563eb",
          },
        }}
      >
        <Tab label="📚 Chương & Bài học" />
        <Tab label="📤 Tài liệu" />
        <Tab label="🤖 AI Processing" />
        <Tab label="👁 Kiểm soát hiển thị" />
      </Tabs>

      {/* Tab 1: Chapters and Lessons */}
      <TabPanel value={tabValue} index={0}>
        <Box>
          <Box
            sx={{
              mb: 3,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Quản lý Chương và Bài học
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleAddChapter}
              sx={{ backgroundColor: "#2563eb" }}
            >
              Thêm Chương
            </Button>
          </Box>

          {chapters.length === 0 ? (
            <Alert severity="info">No chapters yet. Create one to get started!</Alert>
          ) : (
            chapters.map((chapter) => (
              <ChapterAccordion
                key={chapter._id || chapter.id}
                chapter={chapter}
                curriculumId={id}
                onEditChapter={() => handleEditChapter(chapter)}
                onDeleteChapter={() =>
                  handleDeleteChapter(chapter._id || chapter.id)
                }
                onUpdateChapter={handleUpdateChapterContent}
              />
            ))
          )}
        </Box>

        {/* Chapter Dialog */}
        <Dialog
          open={openChapterDialog}
          onClose={() => setOpenChapterDialog(false)}
          maxWidth="sm"
          fullWidth
        >
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              {selectedChapter ? "Chỉnh sửa Chương" : "Thêm Chương mới"}
            </Typography>
            <TextField
              fullWidth
              label="Tên chương"
              value={chapterFormData.name}
              onChange={(e) =>
                setChapterFormData({ ...chapterFormData, name: e.target.value })
              }
              sx={{ mb: 2 }}
              disabled={savingChapter}
            />
            <TextField
              fullWidth
              label="Mô tả"
              multiline
              rows={3}
              value={chapterFormData.description}
              onChange={(e) =>
                setChapterFormData({
                  ...chapterFormData,
                  description: e.target.value,
                })
              }
              sx={{ mb: 2 }}
              disabled={savingChapter}
            />
            <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end" }}>
              <Button
                onClick={() => setOpenChapterDialog(false)}
                disabled={savingChapter}
              >
                Hủy
              </Button>
              <Button
                onClick={handleSaveChapter}
                variant="contained"
                sx={{ backgroundColor: "#2563eb" }}
                disabled={savingChapter}
              >
                {savingChapter ? <CircularProgress size={24} /> : "Lưu"}
              </Button>
            </Box>
          </Box>
        </Dialog>
      </TabPanel>

      {/* Tab 2: Documents */}
      <TabPanel value={tabValue} index={1}>
        <DocumentUpload
          curriculumId={id}
          documents={documents}
          onDocumentUploaded={handleDocumentUploaded}
          onDocumentDeleted={handleDocumentDeleted}
        />
      </TabPanel>

      {/* Tab 3: AI Processing */}
      <TabPanel value={tabValue} index={2}>
        <AIProcessing curriculum={curriculum} />
      </TabPanel>

      {/* Tab 4: Content Control */}
      <TabPanel value={tabValue} index={3}>
        <ContentControl curriculum={curriculum} chapters={chapters} />
      </TabPanel>

      {/* Success Snackbar */}
      <Snackbar
        open={!!successMessage}
        autoHideDuration={3000}
        onClose={() => setSuccessMessage("")}
        message={successMessage}
      />
    </Box>
  );
};

export default CurriculumDetail;
