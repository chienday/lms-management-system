import React, { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  Chip,
  Grid,
  Alert,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Checkbox,
  CircularProgress,
} from "@mui/material";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import SummarizeIcon from "@mui/icons-material/Summarize";
import QuizIcon from "@mui/icons-material/Quiz";
import SpellcheckIcon from "@mui/icons-material/Spellcheck";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import PublishedWithChangesIcon from "@mui/icons-material/PublishedWithChanges";
import RefreshIcon from "@mui/icons-material/Refresh";
import styled from "styled-components";

const AICard = styled(Card)`
  border: 1px solid #e0e7ff;
  border-radius: 8px;
  transition: all 0.2s ease;

  &:hover {
    box-shadow: 0 8px 16px rgba(37, 99, 235, 0.1);
  }
`;

const AIProcessing = ({ curriculum }) => {
  const [selectedChapters, setSelectedChapters] = useState([]);
  const [processing, setProcessing] = useState(false);
  const [results, setResults] = useState(null);
  const [openResultDialog, setOpenResultDialog] = useState(false);
  const [selectedAITask, setSelectedAITask] = useState(null);
  const [aiHistory, setAIHistory] = useState([
    {
      id: 1,
      title: "Tóm tắt Chương 1",
      type: "summarize",
      createdDate: "2025-01-20",
      status: "completed",
      result: "Chương này giới thiệu về các khái niệm cơ bản của HTML...",
    },
    {
      id: 2,
      title: "Từng sinh câu hỏi từ Chương 2",
      type: "generate-questions",
      createdDate: "2025-01-19",
      status: "completed",
      result: "10 câu hỏi đã được sinh thành công",
    },
  ]);

  const aiTasks = [
    {
      id: "summarize",
      title: "📋 Tóm tắt Nội dung",
      description: "Tóm tắt tự động nội dung chương để tạo ra các bài học cô đặc",
      icon: <SummarizeIcon sx={{ fontSize: 40, color: "#2563eb" }} />,
      features: [
        "Phân tích nội dung chi tiết",
        "Rút gọn thành các điểm chính",
        "Tạo bài tóm tắt dễ hiểu",
      ],
    },
    {
      id: "generate-questions",
      title: "❓ Sinh Câu Hỏi",
      description: "Tạo tự động các câu hỏi trắc nghiệm từ nội dung giáo trình",
      icon: <SpellcheckIcon sx={{ fontSize: 40, color: "#8b5cf6" }} />,
      features: [
        "Tạo câu hỏi đa mục",
        "Tạo câu hỏi tự luận",
        "Tuỷ chỉnh độ khó câu hỏi",
      ],
    },
    {
      id: "create-quiz",
      title: "🎯 Tạo Bài Kiểm Tra",
      description: "Tạo bài kiểm tra tự động từ câu hỏi được sinh ra",
      icon: <QuizIcon sx={{ fontSize: 40, color: "#ec4899" }} />,
      features: [
        "Tạo quiz ngẫu nhiên",
        "Thiết lập thời gian làm bài",
        "Cấu hình đáp án tự động",
      ],
    },
  ];

  const handleSelectChapter = (chapterId) => {
    setSelectedChapters((prev) =>
      prev.includes(chapterId)
        ? prev.filter((id) => id !== chapterId)
        : [...prev, chapterId]
    );
  };

  const handleProcessAI = async (taskId) => {
    if (selectedChapters.length === 0) {
      alert("Vui lòng chọn ít nhất một chương");
      return;
    }

    setSelectedAITask(taskId);
    setProcessing(true);

    // Simulate AI processing
    await new Promise((resolve) => setTimeout(resolve, 3000));

    const taskConfig = aiTasks.find((t) => t.id === taskId);
    const result = {
      taskId,
      taskTitle: taskConfig.title,
      selectedChapters: selectedChapters.length,
      itemsGenerated: Math.floor(Math.random() * 20) + 5,
      processingTime: "2.5s",
      status: "completed",
      timestamp: new Date().toLocaleString("vi-VN"),
    };

    setResults(result);
    setOpenResultDialog(true);
    setProcessing(false);

    // Add to history
    const historyItem = {
      id: aiHistory.length + 1,
      title: `${taskConfig.title} - ${selectedChapters.length} chương`,
      type: taskId,
      createdDate: new Date().toISOString().split("T")[0],
      status: "completed",
      result: `${result.itemsGenerated} items được tạo thành công`,
    };
    setAIHistory([historyItem, ...aiHistory]);

    setSelectedChapters([]);
  };

  return (
    <Box>
      <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
        🤖 Hỗ trợ AI xử lý Giáo trình
      </Typography>

      {/* Chapter Selection */}
      <Card sx={{ mb: 3, border: "1px solid #e0e7ff" }}>
        <CardContent>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
            Bước 1: Chọn Chương
          </Typography>

          {curriculum.chapters && curriculum.chapters.length > 0 ? (
            <List>
              {curriculum.chapters.map((chapter) => (
                <ListItem
                  key={chapter.id}
                  disablePadding
                  sx={{ mb: 1 }}
                >
                  <Checkbox
                    checked={selectedChapters.includes(chapter.id)}
                    onChange={() => handleSelectChapter(chapter.id)}
                    edge="start"
                  />
                  <ListItemText
                    primary={chapter.name}
                    secondary={chapter.description}
                    sx={{ ml: 1 }}
                  />
                </ListItem>
              ))}
            </List>
          ) : (
            <Typography variant="body2" sx={{ color: "#94a3b8" }}>
              Chưa có chương nào. Vui lòng tạo chương trước.
            </Typography>
          )}

          {selectedChapters.length > 0 && (
            <Alert severity="info" sx={{ mt: 2 }}>
              Đã chọn {selectedChapters.length} chương
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* AI Tasks */}
      <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
        Bước 2: Chọn Nhiệm vụ AI
      </Typography>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        {aiTasks.map((task) => (
          <Grid item xs={12} md={6} lg={4} key={task.id}>
            <AICard>
              <CardContent>
                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                  {task.icon}
                  <Typography variant="h6" sx={{ fontWeight: 600, ml: 2 }}>
                    {task.title}
                  </Typography>
                </Box>

                <Typography variant="body2" sx={{ color: "#475569", mb: 2 }}>
                  {task.description}
                </Typography>

                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                  Tính năng:
                </Typography>
                <List dense>
                  {task.features.map((feature, idx) => (
                    <ListItem key={idx} disablePadding>
                      <ListItemIcon sx={{ minWidth: 32 }}>
                        <CheckCircleIcon sx={{ fontSize: 18, color: "#10b981" }} />
                      </ListItemIcon>
                      <ListItemText
                        primary={feature}
                        primaryTypographyProps={{
                          variant: "caption",
                          sx: { color: "#64748b" },
                        }}
                      />
                    </ListItem>
                  ))}
                </List>

                <Button
                  fullWidth
                  variant="contained"
                  onClick={() => handleProcessAI(task.id)}
                  disabled={selectedChapters.length === 0 || processing}
                  sx={{
                    backgroundColor: "#2563eb",
                    mt: 2,
                    textTransform: "none",
                  }}
                  startIcon={
                    processing && selectedAITask === task.id ? (
                      <CircularProgress size={20} color="inherit" />
                    ) : (
                      <AutoAwesomeIcon />
                    )
                  }
                >
                  {processing && selectedAITask === task.id
                    ? "Đang xử lý..."
                    : "Xử lý"}
                </Button>
              </CardContent>
            </AICard>
          </Grid>
        ))}
      </Grid>

      {/* AI History */}
      <Card sx={{ border: "1px solid #e0e7ff" }}>
        <CardContent>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
            📜 Lịch sử Xử lý AI
          </Typography>

          {aiHistory.length === 0 ? (
            <Typography variant="body2" sx={{ color: "#94a3b8" }}>
              Chưa có lịch sử xử lý
            </Typography>
          ) : (
            <List>
              {aiHistory.map((item) => (
                <ListItem
                  key={item.id}
                  sx={{
                    bgcolor: "#f8fafc",
                    mb: 1,
                    borderRadius: 1,
                    flexDirection: "column",
                    alignItems: "flex-start",
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      width: "100%",
                      alignItems: "center",
                      gap: 2,
                    }}
                  >
                    <PublishedWithChangesIcon
                      sx={{ color: "#10b981", fontSize: 24 }}
                    />
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                        {item.title}
                      </Typography>
                      <Typography variant="caption" sx={{ color: "#94a3b8" }}>
                        {item.createdDate}
                      </Typography>
                    </Box>
                    <Chip
                      label="Hoàn thành"
                      color="success"
                      size="small"
                      variant="outlined"
                    />
                  </Box>
                  <Typography
                    variant="body2"
                    sx={{ mt: 1, ml: 6, color: "#64748b" }}
                  >
                    {item.result}
                  </Typography>
                </ListItem>
              ))}
            </List>
          )}
        </CardContent>
      </Card>

      {/* Result Dialog */}
      <Dialog open={openResultDialog} onClose={() => setOpenResultDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 600, bgcolor: "#eef2ff" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <AutoAwesomeIcon sx={{ color: "#2563eb" }} />
            Kết quả Xử lý AI
          </Box>
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          {results && (
            <Box>
              <Alert severity="success" sx={{ mb: 2 }}>
                ✓ Xử lý thành công!
              </Alert>

              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                  {results.taskTitle}
                </Typography>
                <Box sx={{ bgcolor: "#f8fafc", p: 2, borderRadius: 1 }}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      mb: 1,
                    }}
                  >
                    <Typography variant="body2">Chương được chọn:</Typography>
                    <Chip
                      label={results.selectedChapters}
                      size="small"
                      color="primary"
                    />
                  </Box>
                  <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                    <Typography variant="body2">Số item được tạo:</Typography>
                    <Chip
                      label={results.itemsGenerated}
                      size="small"
                      color="success"
                    />
                  </Box>
                  <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                    <Typography variant="body2">Thời gian xử lý:</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {results.processingTime}
                    </Typography>
                  </Box>
                </Box>
              </Box>

              <Box sx={{ display: "flex", gap: 2 }}>
                <Button
                  fullWidth
                  variant="contained"
                  sx={{ backgroundColor: "#2563eb", textTransform: "none" }}
                  onClick={() => setOpenResultDialog(false)}
                >
                  Đóng
                </Button>
                <Button
                  fullWidth
                  variant="outlined"
                  sx={{ textTransform: "none" }}
                  startIcon={<RefreshIcon />}
                >
                  Xem kết quả
                </Button>
              </Box>
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default AIProcessing;
