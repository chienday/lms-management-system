import React, { useState, useEffect } from "react";
import { Container, Grid, Paper, Box, Typography, Avatar, Card, CardContent } from "@mui/material";
import { styled } from "@mui/material/styles";
import { People, MenuBook, AssignmentTurnedIn, AccessTime } from "@mui/icons-material";
import CountUp from "react-countup";
import { useDispatch, useSelector } from "react-redux";
import SeeNotice from "../../components/SeeNotice";
import addnotice from "../../assets/addnotice.jpg";
import {
  getClassStudents,
  getSubjectDetails,
} from "../../redux/sclassRelated/sclassHandle";

// Styled Card giống AdminHomePage
const StatCard = styled(Card)(({ theme }) => ({
  borderRadius: 20,
  boxShadow: "0 8px 24px rgba(0,0,0,0.05)",
  transition: "transform 0.2s ease, box-shadow 0.2s ease",
  "&:hover": {
    transform: "translateY(-4px)",
    boxShadow: "0 12px 28px rgba(0,0,0,0.1)",
  },
}));

const TeacherHomePage = () => {
  const dispatch = useDispatch();
  const [hasData, setHasData] = useState(false);
  const { currentUser } = useSelector((state) => state.user);
  const { subjectDetails, sclassStudents } = useSelector((state) => state.sclass);

  const classID = currentUser?.teachSclass?._id;
  const subjectID = currentUser?.teachSubject?._id;
  const teacherName = currentUser?.name || "Giảng viên";

  useEffect(() => {
    if (subjectID) dispatch(getSubjectDetails(subjectID, "Subject"));
    if (classID) dispatch(getClassStudents(classID));
  }, [dispatch, subjectID, classID]);

  const numberOfStudents = sclassStudents?.length || 0;
  const numberOfSessions = subjectDetails?.sessions || 0;

  const stats = [
    { title: "Học sinh trong lớp", value: numberOfStudents, icon: People, color: "#4361ee", suffix: "" },
    { title: "Tổng số buổi học", value: numberOfSessions, icon: MenuBook, color: "#4361ee", suffix: "" },
    { title: "Bài kiểm tra", value: 24, icon: AssignmentTurnedIn, color: "#4361ee", suffix: "" },
    { title: "Tổng giờ dạy", value: 30, icon: AccessTime, color: "#4361ee", suffix: "h" },
  ];

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Welcome Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" fontWeight={700} gutterBottom>
          Chào mừng, {teacherName}!
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Đây là tổng quan về lớp học và hoạt động giảng dạy của bạn.
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {stats.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <StatCard>
              <CardContent sx={{ p: 3, textAlign: "center" }}>
                <Avatar sx={{ bgcolor: stat.color, width: 56, height: 56, mb: 2, mx: "auto" }}>
                  <stat.icon sx={{ fontSize: 32 }} />
                </Avatar>
                <Typography variant="h6" component="div" sx={{ mb: 1, fontWeight: 500 }}>
                  {stat.title}
                </Typography>
                <Typography variant="h4" component="div" sx={{ fontWeight: 700, color: stat.color }}>
                  <CountUp start={0} end={stat.value} duration={2.5} suffix={stat.suffix ? ` ${stat.suffix}` : ""} />
                </Typography>
              </CardContent>
            </StatCard>
          </Grid>
        ))}

        {/* Notice Section */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2, borderRadius: 3, boxShadow: 3 }}>
            {hasData ? (
              <SeeNotice />
            ) : (
              <Box sx={{ textAlign: "center", py: 4 }}>
                <img
                  src={addnotice}
                  alt="Không có thông báo"
                  style={{ maxWidth: "100%", maxHeight: "180px", opacity: 0.7 }}
                />
                <Typography variant="h6" component="div" mt={2} color="text.secondary">
                  Chưa có thông báo nào
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Hãy tạo thông báo đầu tiên để hiển thị tại đây.
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default TeacherHomePage;