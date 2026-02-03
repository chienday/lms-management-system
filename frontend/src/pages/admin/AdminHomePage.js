import React, { useState, useEffect } from "react";
import { 
  Container, 
  Grid, 
  Paper, 
  Box, 
  Typography, 
  Card, 
  CardContent,
  Button,
  LinearProgress,
  Chip,
  Avatar,
  Divider,
  IconButton
} from "@mui/material";
import SeeNotice from "../../components/SeeNotice";
import Students from "../../assets/img1.png";
import Classes from "../../assets/img2.png";
import Teachers from "../../assets/img3.png";
import Fees from "../../assets/img4.png";
import styled from "styled-components";
import CountUp from "react-countup";
import { useDispatch, useSelector } from "react-redux";
import { getAllSclasses } from "../../redux/sclassRelated/sclassHandle";
import { getAllStudents } from "../../redux/studentRelated/studentHandle";
import { getAllTeachers } from "../../redux/teacherRelated/teacherHandle";
import addnotice from "../../assets/addnotice.jpg";
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import GroupsIcon from '@mui/icons-material/Groups';
import SchoolIcon from '@mui/icons-material/School';
import PersonIcon from '@mui/icons-material/Person';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import BarChartIcon from '@mui/icons-material/BarChart';
import PsychologyIcon from '@mui/icons-material/Psychology';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { Link } from "react-router-dom";
import AssessmentIcon from '@mui/icons-material/Assessment';


const AdminHomePage = () => {
  const dispatch = useDispatch();
  const { studentsList } = useSelector((state) => state.student);
  const { sclassesList } = useSelector((state) => state.sclass);
  const { teachersList } = useSelector((state) => state.teacher);

  const [hasData, setHasData] = useState(false);
  const [politicalStats, setPoliticalStats] = useState({
    averageScore: 7.5,
    topStudents: 15,
    needImprovement: 8,
    attendanceRate: 85
  });

  const { currentUser } = useSelector((state) => state.user);
  const adminID = currentUser._id;

  useEffect(() => {
    dispatch(getAllStudents(adminID));
    dispatch(getAllSclasses(adminID, "Sclass"));
    dispatch(getAllTeachers(adminID));
    setHasData(true);
    
    // Mock data for political analysis - in real app, fetch from API
    const mockPoliticalStats = {
      averageScore: calculateAverageScore(),
      topStudents: Math.floor(studentsList?.length * 0.2) || 0,
      needImprovement: Math.floor(studentsList?.length * 0.15) || 0,
      attendanceRate: calculateAttendanceRate()
    };
    setPoliticalStats(mockPoliticalStats);
  }, [adminID, dispatch, studentsList]);

  const calculateAverageScore = () => {
    if (!studentsList || studentsList.length === 0) return 0;
    // Mock calculation - in real app, use actual student scores
    return 7.5;
  };

  const calculateAttendanceRate = () => {
    if (!studentsList || studentsList.length === 0) return 0;
    // Mock calculation - in real app, use actual attendance data
    return 85;
  };

  const numberOfStudents = studentsList && studentsList.length;
  const numberOfClasses = sclassesList && sclassesList.length;
  const numberOfTeachers = teachersList && teachersList.length;
  const feesCollection = 23000;

  const politicalTopics = [
    { name: "Chủ nghĩa xã hội", progress: 75, color: "#2196f3" },
    { name: "Dân chủ", progress: 68, color: "#4caf50" },
    { name: "Quyền con người", progress: 82, color: "#ff9800" },
    { name: "Triết học Mác", progress: 58, color: "#f44336" }
  ];

  const quickActions = [
    { title: "Phân tích học tập", icon: <AssessmentIcon />, link: "/Admin/analysis", color: "#4caf50" },
    { title: "Thêm lớp học", icon: <SchoolIcon />, link: "/Admin/classes/add", color: "#2196f3" },
    { title: "Quản lý sinh viên", icon: <PersonIcon />, link: "/Admin/students", color: "#ff9800" },
    { title: "Thông báo mới", icon: <ArrowForwardIcon />, link: "/Admin/notices/add", color: "#9c27b0" }
  ];

  return (
    <>
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        {/* Welcome Section */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
            Chào mừng trở lại, {currentUser.name || "Admin"}!
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Quản lý hệ thống học tập môn Lý luận chính trị
          </Typography>
        </Box>

        <Grid container spacing={3}>
          {/* Main Statistics */}
          <Grid item xs={12} md={3} lg={3}>
            <StyledPaper elevation={3}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: '#2196f3', mr: 2 }}>
                  <GroupsIcon />
                </Avatar>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">Tổng sinh viên</Typography>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    <CountUp start={0} end={numberOfStudents || 0} duration={2} />
                  </Typography>
                </Box>
              </Box>
              <Chip 
                label="+12% so với tháng trước" 
                size="small" 
                color="success" 
                icon={<TrendingUpIcon />}
                sx={{ mt: 1 }}
              />
            </StyledPaper>
          </Grid>

          <Grid item xs={12} md={3} lg={3}>
            <StyledPaper elevation={3}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: '#4caf50', mr: 2 }}>
                  <SchoolIcon />
                </Avatar>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">Lớp học</Typography>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    <CountUp start={0} end={numberOfClasses || 0} duration={2} />
                  </Typography>
                </Box>
              </Box>
              <Chip 
                label="+2 lớp mới" 
                size="small" 
                color="primary" 
                icon={<TrendingUpIcon />}
                sx={{ mt: 1 }}
              />
            </StyledPaper>
          </Grid>

          <Grid item xs={12} md={3} lg={3}>
            <StyledPaper elevation={3}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: '#ff9800', mr: 2 }}>
                  <PersonIcon />
                </Avatar>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">Giảng viên</Typography>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    <CountUp start={0} end={numberOfTeachers || 0} duration={2} />
                  </Typography>
                </Box>
              </Box>
              <Chip 
                label="Đang hoạt động" 
                size="small" 
                color="warning" 
                sx={{ mt: 1 }}
              />
            </StyledPaper>
          </Grid>

          <Grid item xs={12} md={3} lg={3}>
            <StyledPaper elevation={3}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: '#9c27b0', mr: 2 }}>
                  <AttachMoneyIcon />
                </Avatar>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">Thu học phí</Typography>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    <CountUp start={0} end={feesCollection || 0} duration={2} prefix="$" />
                  </Typography>
                </Box>
              </Box>
              <Chip 
                label="95% đã đóng" 
                size="small" 
                color="success" 
                sx={{ mt: 1 }}
              />
            </StyledPaper>
          </Grid>

          {/* Political Learning Analysis */}
          <Grid item xs={12} md={8} lg={8}>
            <Paper elevation={3} sx={{ p: 3, height: '100%' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <PsychologyIcon color="primary" sx={{ mr: 1, fontSize: 28 }} />
                <Typography variant="h5" component="h2" sx={{ fontWeight: 'bold' }}>
                  Phân tích học tập môn Lý luận chính trị
                </Typography>
              </Box>
              
              <Grid container spacing={3}>
                <Grid item xs={6} md={3}>
                  <StatCard
                    title="Điểm trung bình"
                    value={politicalStats.averageScore.toFixed(1)}
                    unit="/10"
                    color="#2196f3"
                    icon={<BarChartIcon />}
                    trend="up"
                  />
                </Grid>
                <Grid item xs={6} md={3}>
                  <StatCard
                    title="SV xuất sắc"
                    value={politicalStats.topStudents}
                    color="#4caf50"
                    icon={<TrendingUpIcon />}
                    trend="up"
                  />
                </Grid>
                <Grid item xs={6} md={3}>
                  <StatCard
                    title="Cần cải thiện"
                    value={politicalStats.needImprovement}
                    color="#ff9800"
                    icon={<TrendingDownIcon />}
                    trend="down"
                  />
                </Grid>
                <Grid item xs={6} md={3}>
                  <StatCard
                    title="Tỷ lệ điểm danh"
                    value={politicalStats.attendanceRate}
                    unit="%"
                    color="#9c27b0"
                    icon={<GroupsIcon />}
                    trend="up"
                  />
                </Grid>
              </Grid>

              <Divider sx={{ my: 3 }} />

              <Typography variant="h6" gutterBottom>
                Tiến độ học tập theo chủ đề
              </Typography>
              {politicalTopics.map((topic, index) => (
                <Box key={index} sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="body2">{topic.name}</Typography>
                    <Typography variant="body2" fontWeight="bold">{topic.progress}%</Typography>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={topic.progress} 
                    sx={{ 
                      height: 8, 
                      borderRadius: 4,
                      backgroundColor: `${topic.color}20`,
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: topic.color,
                        borderRadius: 4
                      }
                    }} 
                  />
                </Box>
              ))}
            </Paper>
          </Grid>

          {/* Quick Actions */}
          <Grid item xs={12} md={4} lg={4}>
            <Paper elevation={3} sx={{ p: 3, height: '100%' }}>
              <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 'bold' }}>
                Thao tác nhanh
              </Typography>
              <Grid container spacing={2}>
                {quickActions.map((action, index) => (
                  <Grid item xs={6} key={index}>
                    <Button
                      component={Link}
                      to={action.link}
                      variant="contained"
                      sx={{
                        p: 2,
                        height: '100%',
                        width: '100%',
                        bgcolor: action.color,
                        color: 'white',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        '&:hover': {
                          bgcolor: `${action.color}dd`,
                          transform: 'translateY(-2px)'
                        },
                        transition: 'all 0.3s'
                      }}
                    >
                      {action.icon}
                      <Typography variant="body2" sx={{ mt: 1, textAlign: 'center' }}>
                        {action.title}
                      </Typography>
                    </Button>
                  </Grid>
                ))}
              </Grid>

              <Divider sx={{ my: 3 }} />

              <Typography variant="h6" gutterBottom>
                Mẹo học tập hiệu quả
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TipCard
                  title="Ôn tập chương 1"
                  description="Tập trung vào khái niệm giá trị thặng dư"
                  icon="📘"
                />
                <TipCard
                  title="Thảo luận nhóm"
                  description="Tổ chức thảo luận về chủ nghĩa xã hội"
                  icon="👥"
                />
                <TipCard
                  title="Làm bài tập online"
                  description="Hoàn thành bài tập trên hệ thống"
                  icon="💻"
                />
              </Box>
            </Paper>
          </Grid>

      

          {/* Notice Section */}
          <Grid item xs={12}>
            <Paper elevation={3} sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h5" component="h2" sx={{ fontWeight: 'bold' }}>
                  Thông báo mới nhất
                </Typography>
                <Button 
                  component={Link} 
                  to="/Admin/notices" 
                  endIcon={<ArrowForwardIcon />}
                  variant="outlined"
                >
                  Xem tất cả
                </Button>
              </Box>
              {hasData ? (
                <SeeNotice />
              ) : (
                <Box sx={{ textAlign: "center", mt: "40px", p: 4 }}>
                  <img
                    src={addnotice}
                    alt="No Data"
                    style={{ maxWidth: "100%", maxHeight: "225px", opacity: 0.7 }}
                  />
                  <Typography variant="h5" component="div" mt={2} color="text.secondary">
                    Chưa có thông báo nào
                  </Typography>
                  <Typography variant="body2" color="text.secondary" mt={1}>
                    Thêm thông báo mới để cập nhật thông tin cho sinh viên
                  </Typography>
                  <Button 
                    component={Link} 
                    to="/Admin/notices/add" 
                    variant="contained" 
                    sx={{ mt: 2 }}
                  >
                    Thêm thông báo
                  </Button>
                </Box>
              )}
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </>
  );
};

// StatCard Component
const StatCard = ({ title, value, unit = "", color, icon, trend }) => (
  <Card sx={{ 
    bgcolor: `${color}10`, 
    border: `1px solid ${color}20`,
    borderRadius: 2,
    height: '100%'
  }}>
    <CardContent>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="body2" color="text.secondary">{title}</Typography>
        <Box sx={{ 
          color: color,
          bgcolor: `${color}20`,
          borderRadius: '50%',
          width: 32,
          height: 32,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          {icon}
        </Box>
      </Box>
      <Typography variant="h4" sx={{ fontWeight: 'bold', mt: 1, color: color }}>
        {value}{unit}
      </Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
        {trend === 'up' ? 
          <TrendingUpIcon sx={{ color: '#4caf50', fontSize: 16, mr: 0.5 }} /> :
          <TrendingDownIcon sx={{ color: '#f44336', fontSize: 16, mr: 0.5 }} />
        }
        <Typography variant="caption" color={trend === 'up' ? 'success.main' : 'error.main'}>
          {trend === 'up' ? '+5.2%' : '-2.1%'}
        </Typography>
      </Box>
    </CardContent>
  </Card>
);

// TipCard Component
const TipCard = ({ title, description, icon }) => (
  <Box sx={{ 
    display: 'flex', 
    alignItems: 'center', 
    p: 2, 
    bgcolor: 'grey.50',
    borderRadius: 2,
    border: '1px solid',
    borderColor: 'divider',
    transition: 'all 0.3s',
    '&:hover': {
      bgcolor: 'primary.light',
      borderColor: 'primary.main',
      transform: 'translateX(4px)'
    }
  }}>
    <Typography variant="h4" sx={{ mr: 2 }}>{icon}</Typography>
    <Box>
      <Typography variant="subtitle2" fontWeight="bold">{title}</Typography>
      <Typography variant="body2" color="text.secondary">{description}</Typography>
    </Box>
  </Box>
);

// Styled Paper
const StyledPaper = styled(Paper)`
  padding: 24px;
  display: flex;
  flex-direction: column;
  height: 120px;
  justify-content: center;
  align-items: flex-start;
  border-radius: 16px;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  }
`;

export default AdminHomePage;