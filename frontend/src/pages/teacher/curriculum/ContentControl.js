import React, { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Switch,
  Button,
  Chip,
  Grid,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import LockIcon from "@mui/icons-material/Lock";
import GroupIcon from "@mui/icons-material/Group";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import InfoIcon from "@mui/icons-material/Info";
import ChatIcon from "@mui/icons-material/Chat";
import styled from "styled-components";

const ControlCard = styled(Card)`
  border: 1px solid #e0e7ff;
  border-radius: 8px;
  margin-bottom: 16px;

  &:hover {
    box-shadow: 0 4px 12px rgba(37, 99, 235, 0.1);
  }
`;

const ContentControl = ({ chapters }) => {
  const [contentSettings, setContentSettings] = useState({
    isPublished: true,
    restrictByDate: false,
    startDate: "",
    endDate: "",
    restrictByClass: false,
    restrictedClasses: [],
    requireStudentCompletion: false,
    allowComments: true,
    allowQuestionBank: true,
    showProgressToStudent: true,
  });

  const [chapterVisibility, setChapterVisibility] = useState(
    (chapters || []).reduce((acc, ch) => {
      acc[ch.id] = {
        isVisible: true,
        order: ch.order || 0,
        requiresCompletion: false,
      };
      return acc;
    }, {})
  );

  const [changes, setChanges] = useState([]);

  const handleToggleSetting = (key) => {
    setContentSettings((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
    addChange(`Cập nhật: ${key}`);
  };

  const handleToggleChapterVisibility = (chapterId) => {
    setChapterVisibility((prev) => ({
      ...prev,
      [chapterId]: {
        ...prev[chapterId],
        isVisible: !prev[chapterId].isVisible,
      },
    }));
    addChange(`Thay đổi hiển thị chương ${chapterId}`);
  };

  const handleToggleChapterCompletion = (chapterId) => {
    setChapterVisibility((prev) => ({
      ...prev,
      [chapterId]: {
        ...prev[chapterId],
        requiresCompletion: !prev[chapterId].requiresCompletion,
      },
    }));
    addChange(`Cập nhật yêu cầu hoàn thành chương ${chapterId}`);
  };

  const addChange = (change) => {
    if (!changes.includes(change)) {
      setChanges([...changes, change]);
    }
  };

  const handleSaveChanges = () => {
    console.log("Saved settings:", contentSettings, chapterVisibility);
    alert("Đã lưu các thay đổi!");
    setChanges([]);
  };

  return (
    <Box>
      <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
        👁 Kiểm soát Hiển thị Nội dung
      </Typography>

      <Alert severity="info" sx={{ mb: 3 }}>
        <InfoIcon sx={{ mr: 1, fontSize: 20, verticalAlign: "sub" }} />
        Quản lý quyền truy cập, hiển thị và ràng buộc cho học sinh
      </Alert>

      {/* Global Settings */}
      <ControlCard>
        <CardContent>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
            ⚙️ Cấu hình Chung
          </Typography>

          <List>
            <ListItem disablePadding sx={{ mb: 1 }}>
              <ListItemIcon>
                <VisibilityIcon sx={{ color: "#2563eb" }} />
              </ListItemIcon>
              <ListItemText
                primary="Xuất bản Giáo trình"
                secondary="Cho phép học sinh xem giáo trình này"
              />
              <Switch
                checked={contentSettings.isPublished}
                onChange={() => handleToggleSetting("isPublished")}
              />
            </ListItem>

            <ListItem disablePadding sx={{ mb: 1 }}>
              <ListItemIcon>
                <CalendarTodayIcon sx={{ color: "#8b5cf6" }} />
              </ListItemIcon>
              <ListItemText
                primary="Giới hạn Thời gian"
                secondary="Chỉ cho phép xem trong khoảng thời gian nhất định"
              />
              <Switch
                checked={contentSettings.restrictByDate}
                onChange={() => handleToggleSetting("restrictByDate")}
              />
            </ListItem>

            {contentSettings.restrictByDate && (
              <Box sx={{ ml: 6, mb: 2 }}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <input
                      type="date"
                      value={contentSettings.startDate}
                      onChange={(e) =>
                        setContentSettings((prev) => ({
                          ...prev,
                          startDate: e.target.value,
                        }))
                      }
                      style={{
                        width: "100%",
                        padding: "8px",
                        border: "1px solid #e0e7ff",
                        borderRadius: "4px",
                        fontSize: "14px",
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <input
                      type="date"
                      value={contentSettings.endDate}
                      onChange={(e) =>
                        setContentSettings((prev) => ({
                          ...prev,
                          endDate: e.target.value,
                        }))
                      }
                      style={{
                        width: "100%",
                        padding: "8px",
                        border: "1px solid #e0e7ff",
                        borderRadius: "4px",
                        fontSize: "14px",
                      }}
                    />
                  </Grid>
                </Grid>
              </Box>
            )}

            <ListItem disablePadding sx={{ mb: 1 }}>
              <ListItemIcon>
                <GroupIcon sx={{ color: "#ec4899" }} />
              </ListItemIcon>
              <ListItemText
                primary="Giới hạn theo Lớp"
                secondary="Chỉ các lớp được chọn mới có thể xem"
              />
              <Switch
                checked={contentSettings.restrictByClass}
                onChange={() => handleToggleSetting("restrictByClass")}
              />
            </ListItem>

            <ListItem disablePadding sx={{ mb: 1 }}>
              <ListItemIcon>
                <LockIcon sx={{ color: "#f59e0b" }} />
              </ListItemIcon>
              <ListItemText
                primary="Yêu cầu Hoàn thành"
                secondary="Học sinh phải hoàn thành các bài tập để tiếp tục"
              />
              <Switch
                checked={contentSettings.requireStudentCompletion}
                onChange={() => handleToggleSetting("requireStudentCompletion")}
              />
            </ListItem>

            <ListItem disablePadding sx={{ mb: 1 }}>
              <ListItemIcon>
                <ChatIcon sx={{ color: "#10b981" }} />
              </ListItemIcon>
              <ListItemText
                primary="Cho phép Bình luận"
                secondary="Học sinh có thể bình luận trên nội dung"
              />
              <Switch
                checked={contentSettings.allowComments}
                onChange={() => handleToggleSetting("allowComments")}
              />
            </ListItem>

            <ListItem disablePadding>
              <ListItemIcon>
                <VisibilityIcon sx={{ color: "#06b6d4" }} />
              </ListItemIcon>
              <ListItemText
                primary="Hiển thị Tiến độ"
                secondary="Học sinh có thể xem tiến độ học tập của mình"
              />
              <Switch
                checked={contentSettings.showProgressToStudent}
                onChange={() => handleToggleSetting("showProgressToStudent")}
              />
            </ListItem>
          </List>
        </CardContent>
      </ControlCard>

      {/* Chapter-level Controls */}
      <ControlCard>
        <CardContent>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
            📚 Kiểm soát từng Chương
          </Typography>

          <TableContainer component={Paper} sx={{ border: "1px solid #e0e7ff" }}>
            <Table>
              <TableHead sx={{ backgroundColor: "#eef2ff" }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>Tên Chương</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 600 }}>
                    Hiển thị
                  </TableCell>
                  <TableCell align="center" sx={{ fontWeight: 600 }}>
                    Yêu cầu Hoàn thành
                  </TableCell>
                  <TableCell align="center" sx={{ fontWeight: 600 }}>
                    Thứ tự
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {chapters && chapters.length > 0 ? (
                  chapters.map((chapter) => (
                    <TableRow key={chapter.id}>
                      <TableCell sx={{ fontWeight: 500 }}>
                        {chapter.name}
                      </TableCell>
                      <TableCell align="center">
                        <Switch
                          checked={chapterVisibility[chapter.id]?.isVisible || false}
                          onChange={() => handleToggleChapterVisibility(chapter.id)}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Switch
                          checked={chapterVisibility[chapter.id]?.requiresCompletion || false}
                          onChange={() => handleToggleChapterCompletion(chapter.id)}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={`${chapterVisibility[chapter.id]?.order || 0}`}
                          size="small"
                        />
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} align="center" sx={{ py: 3 }}>
                      <Typography variant="body2" sx={{ color: "#94a3b8" }}>
                        Chưa có chương nào
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </ControlCard>

      {/* Changes Summary */}
      {changes.length > 0 && (
        <Card sx={{ border: "1px solid #fef3c7", backgroundColor: "#fffbeb", mb: 3 }}>
          <CardContent>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
              📝 Các thay đổi chưa lưu ({changes.length})
            </Typography>
            <List dense>
              {changes.map((change, idx) => (
                <ListItem key={idx} disablePadding>
                  <ListItemText
                    primary={change}
                    primaryTypographyProps={{ variant: "body2" }}
                  />
                </ListItem>
              ))}
            </List>
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end" }}>
        <Button
          variant="outlined"
          sx={{ textTransform: "none" }}
          onClick={() => {
            setContentSettings({
              isPublished: true,
              restrictByDate: false,
              startDate: "",
              endDate: "",
              restrictByClass: false,
              restrictedClasses: [],
              requireStudentCompletion: false,
              allowComments: true,
              allowQuestionBank: true,
              showProgressToStudent: true,
            });
            setChanges([]);
          }}
        >
          Đặt lại
        </Button>
        <Button
          variant="contained"
          sx={{
            backgroundColor: "#2563eb",
            textTransform: "none",
          }}
          onClick={handleSaveChanges}
          disabled={changes.length === 0}
        >
          Lưu Thay đổi
        </Button>
      </Box>
    </Box>
  );
};

export default ContentControl;
