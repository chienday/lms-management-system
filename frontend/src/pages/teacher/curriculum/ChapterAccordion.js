import React, { useState, useEffect } from "react";
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Box,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Dialog,
  TextField,
  Button,
  Chip,
  Tooltip,
  CircularProgress,
  Alert,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import BookmarkIcon from "@mui/icons-material/Bookmark";
import EditNoteIcon from "@mui/icons-material/EditNote";
import PublishedWithChangesIcon from "@mui/icons-material/PublishedWithChanges";
import curriculumService from "../../../services/curriculumService";

const ChapterAccordion = ({
  chapter,
  curriculumId,
  onEditChapter,
  onDeleteChapter,
  onUpdateChapter,
}) => {
  const [openLessonDialog, setOpenLessonDialog] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [lessonFormData, setLessonFormData] = useState({ name: "", description: "", content: "" });
  const [lessons, setLessons] = useState(chapter.lessons || []);
  const [savingLesson, setSavingLesson] = useState(false);
  const [loadingLesson, setLoadingLesson] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLessons(chapter.lessons || []);
  }, [chapter]);

  const handleAddLesson = () => {
    setLessonFormData({ name: "", description: "", content: "" });
    setSelectedLesson(null);
    setError(null);
    setOpenLessonDialog(true);
  };

  const handleSaveLesson = async () => {
    try {
      if (!lessonFormData.name.trim()) {
        setError("Lesson name is required");
        return;
      }

      setSavingLesson(true);
      setError(null);

      try {
        if (selectedLesson) {
          // Update existing lesson
          await curriculumService.updateLesson(
            curriculumId,
            chapter._id || chapter.id,
            selectedLesson._id || selectedLesson.id,
            lessonFormData
          );
        } else {
          // Add new lesson
          await curriculumService.addLesson(
            curriculumId,
            chapter._id || chapter.id,
            lessonFormData
          );
        }

        // Reload chapter data
        setOpenLessonDialog(false);
        onUpdateChapter({ ...chapter, lessons: [...lessons, lessonFormData] });
      } finally {
        setSavingLesson(false);
      }
    } catch (err) {
      console.error("Error saving lesson:", err);
      setError(err.message || "Failed to save lesson");
      setSavingLesson(false);
    }
  };

  const handleDeleteLesson = async (lessonId) => {
    try {
      if (!window.confirm("Are you sure you want to delete this lesson?")) {
        return;
      }

      setLoadingLesson(true);
      setError(null);

      try {
        await curriculumService.deleteLesson(
          curriculumId,
          chapter._id || chapter.id,
          lessonId
        );

        const updatedLessons = lessons.filter(
          (l) => (l._id || l.id) !== lessonId
        );
        setLessons(updatedLessons);
        onUpdateChapter({ ...chapter, lessons: updatedLessons });
      } finally {
        setLoadingLesson(false);
      }
    } catch (err) {
      console.error("Error deleting lesson:", err);
      setError(err.message || "Failed to delete lesson");
      setLoadingLesson(false);
    }
  };

  const handleEditLesson = (lesson) => {
    setSelectedLesson(lesson);
    setLessonFormData({
      name: lesson.name,
      description: lesson.description || "",
      content: lesson.content || "",
    });
    setError(null);
    setOpenLessonDialog(true);
  };

  return (
    <Box sx={{ mb: 2 }}>
      <Accordion
        defaultExpanded={false}
        sx={{
          border: "1px solid #e0e7ff",
          borderRadius: "8px",
          "&.Mui-expanded": {
            margin: 0,
          },
          "&:before": {
            display: "none",
          },
        }}
      >
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          sx={{
            backgroundColor: "#f8fafc",
            "&.Mui-expanded": {
              backgroundColor: "#eef2ff",
            },
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", width: "100%" }}>
            <BookmarkIcon sx={{ mr: 2, color: "#2563eb" }} />
            <div style={{ flex: 1 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, color: "#1e3a8a" }}>
                {chapter.name}
              </Typography>
              <Typography variant="caption" sx={{ color: "#64748b" }}>
                {lessons.length} bài học
              </Typography>
            </div>
            <Box sx={{ display: "flex", gap: 1 }}>
              <Tooltip title="Chỉnh sửa">
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEditChapter();
                  }}
                  disabled={savingLesson || loadingLesson}
                >
                  <EditIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Xóa">
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteChapter();
                  }}
                  disabled={savingLesson || loadingLesson}
                >
                  <DeleteIcon fontSize="small" sx={{ color: "#ef4444" }} />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
        </AccordionSummary>

        <AccordionDetails sx={{ pt: 0, pb: 2 }}>
          <Box sx={{ width: "100%" }}>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
                {error}
              </Alert>
            )}

            <Typography variant="body2" sx={{ color: "#64748b", mb: 2 }}>
              {chapter.description}
            </Typography>

            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                Danh sách Bài học
              </Typography>
              <Button
                size="small"
                startIcon={<AddIcon />}
                onClick={handleAddLesson}
                sx={{ color: "#2563eb" }}
                disabled={savingLesson || loadingLesson}
              >
                Thêm Bài
              </Button>
            </Box>

            {lessons.length === 0 ? (
              <Typography variant="body2" sx={{ color: "#94a3b8", fontStyle: "italic" }}>
                No lessons yet. Add one to get started!
              </Typography>
            ) : (
              <List>
                {lessons.map((lesson) => (
                  <ListItem
                    key={lesson._id || lesson.id}
                    secondaryAction={
                      <Box sx={{ display: "flex", gap: 1 }}>
                        <Tooltip title="Chỉnh sửa">
                          <IconButton
                            edge="end"
                            size="small"
                            onClick={() => handleEditLesson(lesson)}
                            disabled={savingLesson || loadingLesson}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Xóa">
                          <IconButton
                            edge="end"
                            size="small"
                            onClick={() => handleDeleteLesson(lesson._id || lesson.id)}
                            disabled={savingLesson || loadingLesson}
                          >
                            <DeleteIcon fontSize="small" sx={{ color: "#ef4444" }} />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    }
                    sx={{ mb: 1, bgcolor: "#f8fafc", borderRadius: 1 }}
                  >
                    <ListItemIcon>
                      {lesson.status === "published" ? (
                        <PublishedWithChangesIcon sx={{ color: "#10b981" }} />
                      ) : (
                        <EditNoteIcon sx={{ color: "#f59e0b" }} />
                      )}
                    </ListItemIcon>
                    <ListItemText
                      primary={lesson.name}
                      secondary={
                        <Chip
                          size="small"
                          label={lesson.status === "published" ? "Đã xuất bản" : "Nháp"}
                          variant="outlined"
                          sx={{ mt: 0.5 }}
                        />
                      }
                    />
                  </ListItem>
                ))}
              </List>
            )}
          </Box>
        </AccordionDetails>
      </Accordion>

      {/* Lesson Dialog */}
      <Dialog
        open={openLessonDialog}
        onClose={() => setOpenLessonDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <Box sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
            {selectedLesson ? "Chỉnh sửa Bài học" : "Thêm Bài học mới"}
          </Typography>
          <TextField
            fullWidth
            label="Tên bài học"
            value={lessonFormData.name}
            onChange={(e) =>
              setLessonFormData({ ...lessonFormData, name: e.target.value })
            }
            sx={{ mb: 2 }}
            disabled={savingLesson}
          />
          <TextField
            fullWidth
            label="Mô tả"
            value={lessonFormData.description}
            onChange={(e) =>
              setLessonFormData({ ...lessonFormData, description: e.target.value })
            }
            sx={{ mb: 2 }}
            disabled={savingLesson}
            size="small"
          />
          <TextField
            fullWidth
            label="Nội dung"
            multiline
            rows={4}
            value={lessonFormData.content}
            onChange={(e) =>
              setLessonFormData({ ...lessonFormData, content: e.target.value })
            }
            sx={{ mb: 2 }}
            disabled={savingLesson}
          />
          <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end" }}>
            <Button onClick={() => setOpenLessonDialog(false)} disabled={savingLesson}>
              Hủy
            </Button>
            <Button
              onClick={handleSaveLesson}
              variant="contained"
              sx={{ backgroundColor: "#2563eb" }}
              disabled={savingLesson}
            >
              {savingLesson ? <CircularProgress size={24} /> : "Lưu"}
            </Button>
          </Box>
        </Box>
      </Dialog>
    </Box>
  );
};

export default ChapterAccordion;
