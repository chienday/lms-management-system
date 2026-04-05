import React, { useState } from "react";
import { Container, Grid, Paper, Box, Typography, Avatar, Card, CardContent } from "@mui/material";
import { styled } from "@mui/material/styles";
import { People, School, Group, AttachMoney } from "@mui/icons-material";
import SeeNotice from "../../components/SeeNotice";
import addnotice from "../../assets/addnotice.jpg";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { getAllSclasses } from "../../redux/sclassRelated/sclassHandle";
import { getAllStudents } from "../../redux/studentRelated/studentHandle";
import { getAllTeachers } from "../../redux/teacherRelated/teacherHandle";
import CountUp from "react-countup";

const AdminHomePage = () => {
  const dispatch = useDispatch();
  const { studentsList } = useSelector((state) => state.student);
  const { sclassesList } = useSelector((state) => state.sclass);
  const { teachersList } = useSelector((state) => state.teacher);
  const { currentUser } = useSelector((state) => state.user);

  const adminID = currentUser._id;
  const adminName = currentUser.name || "Admin";

  const [hasData, setHasData] = useState(false);
  const addData = () => setHasData(true);

  useEffect(() => {
    dispatch(getAllStudents(adminID));
    dispatch(getAllSclasses(adminID, "Sclass"));
    dispatch(getAllTeachers(adminID));
  }, [adminID, dispatch]);

  const numberOfStudents = studentsList?.length || 0;
  const numberOfClasses = sclassesList?.length || 0;
  const numberOfTeachers = teachersList?.length || 0;

  const stats = [
    { title: "Số học viên", value: numberOfStudents, icon: People, color: "#4361ee", prefix: "" },
    { title: "Số lớp học", value: numberOfClasses, icon: School, color: "#4361ee", prefix: "" },
    { title: "Số giảng viên", value: numberOfTeachers, icon: Group, color: "#4361ee", prefix: "" },
    { title: "Thu phí", value: 23000, icon: AttachMoney, color: "#4361ee", prefix: "$" },
  ];

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Welcome Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" fontWeight={700} gutterBottom>
          Chào mừng, {adminName}!
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Đây là tổng quan về hệ thống LMS quản lý học tập của bạn.
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
                  <CountUp start={0} end={stat.value} duration={2.5} prefix={stat.prefix} />
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

const StatCard = styled(Card)(({ theme }) => ({
  borderRadius: 20,
  boxShadow: "0 8px 24px rgba(0,0,0,0.05)",
  transition: "transform 0.2s ease, box-shadow 0.2s ease",
  "&:hover": {
    transform: "translateY(-4px)",
    boxShadow: "0 12px 28px rgba(0,0,0,0.1)",
  },
}));

export default AdminHomePage;