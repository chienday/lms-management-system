// Import necessary modules and components
import React, { useEffect, useState } from "react";
import { Container, Grid, Paper, Typography, Box, Avatar } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { calculateOverallAttendancePercentage } from "../../components/attendanceCalculator";
import CustomPieChart from "../../components/CustomPieChart";
import { getUserDetails } from "../../redux/userRelated/userHandle";
import styled, { keyframes } from "styled-components";
import SeeNotice from "../../components/SeeNotice";
import CountUp from "react-countup";
import { MenuBook, AssignmentTurnedIn, BarChart } from "@mui/icons-material";
import { getSubjectList } from "../../redux/sclassRelated/sclassHandle";

// ─── Animations ──────────────────────────────────────────────────────
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0); }
`;

// ─── Styled Components ───────────────────────────────────────────────
const PageContainer = styled(Container)`
  animation: ${fadeIn} 0.6s cubic-bezier(0.2, 0.9, 0.4, 1.1);
  margin-top: 2rem;
  margin-bottom: 2rem;
`;

const StatCard = styled(Paper)`
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  border-radius: 24px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.05);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  background: white;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 28px rgba(0, 0, 0, 0.1);
  }
`;

const IconWrapper = styled(Avatar)`
  background: linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%);
  width: 56px;
  height: 56px;
  margin-bottom: 1rem;
  
  & .MuiSvgIcon-root {
    font-size: 2rem;
  }
`;

const StatTitle = styled(Typography)`
  font-weight: 600;
  font-size: 1rem;
  color: #64748b;
  margin-bottom: 0.5rem;
`;

const StatValue = styled(CountUp)`
  font-size: 2rem;
  font-weight: 700;
  color: #1e3a8a;
  line-height: 1.2;
`;

const ChartContainer = styled(Paper)`
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  border-radius: 24px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.05);
  height: 100%;
  min-height: 260px;
  background: white;
`;

const NoticePaper = styled(Paper)`
  padding: 1.5rem;
  border-radius: 24px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.05);
  background: white;
`;

const WelcomeBox = styled(Box)`
  margin-bottom: 2rem;
  text-align: left;
`;

const StudentHomePage = () => {
    const dispatch = useDispatch();
    const { userDetails, currentUser, loading, response } = useSelector((state) => state.user);
    const { subjectsList } = useSelector((state) => state.sclass);
    const [subjectAttendance, setSubjectAttendance] = useState([]);

    // Safely get class ID (prevent null error)
    const classID = currentUser?.sclassName?._id || null;
    const studentName = currentUser?.name || "Học viên";

    useEffect(() => {
        if (currentUser?._id) {
            dispatch(getUserDetails(currentUser._id, "Student"));
        }
        if (classID) {
            dispatch(getSubjectList(classID, "ClassSubjects"));
        }
    }, [dispatch, currentUser?._id, classID]);

    useEffect(() => {
        if (userDetails) {
            setSubjectAttendance(userDetails.attendance || []);
        }
    }, [userDetails]);

    const numberOfSubjects = subjectsList?.length || 0;
    const overallAttendancePercentage = calculateOverallAttendancePercentage(subjectAttendance);
    const overallAbsentPercentage = 100 - overallAttendancePercentage;

    const chartData = [
        { name: "Có mặt", value: overallAttendancePercentage },
        { name: "Vắng mặt", value: overallAbsentPercentage },
    ];

    const hasAttendanceData = subjectAttendance && Array.isArray(subjectAttendance) && subjectAttendance.length > 0;

    return (
        <PageContainer maxWidth="lg">
            <WelcomeBox>
                <Typography variant="h4" fontWeight={700} gutterBottom>
                    Chào mừng, {studentName}!
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    Đây là tổng quan về tình hình học tập của bạn.
                </Typography>
            </WelcomeBox>

            <Grid container spacing={3}>
                {/* Stat: Total Subjects */}
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard>
                        <IconWrapper>
                            <MenuBook />
                        </IconWrapper>
                        <StatTitle variant="body2">Tổng số môn học</StatTitle>
                        <StatValue start={0} end={numberOfSubjects} duration={2.5} />
                    </StatCard>
                </Grid>

                {/* Stat: Total Assignments (example) */}
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard>
                        <IconWrapper>
                            <AssignmentTurnedIn />
                        </IconWrapper>
                        <StatTitle variant="body2">Bài tập đã nộp</StatTitle>
                        <StatValue start={0} end={12} duration={2.5} />
                    </StatCard>
                </Grid>

                {/* Attendance Chart */}
                <Grid item xs={12} md={6}>
                    <ChartContainer>
                        {response ? (
                            <Typography variant="h6" color="text.secondary">
                                Chưa có dữ liệu điểm danh
                            </Typography>
                        ) : loading ? (
                            <Typography variant="h6" color="text.secondary">
                                Đang tải...
                            </Typography>
                        ) : hasAttendanceData ? (
                            <>
                                <CustomPieChart data={chartData} />
                                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                    Tỉ lệ chuyên cần: {overallAttendancePercentage.toFixed(1)}%
                                </Typography>
                            </>
                        ) : (
                            <Typography variant="h6" color="text.secondary">
                                Chưa có dữ liệu điểm danh
                            </Typography>
                        )}
                    </ChartContainer>
                </Grid>

                {/* Notice Board */}
                <Grid item xs={12}>
                    <NoticePaper>
                        <SeeNotice />
                    </NoticePaper>
                </Grid>
            </Grid>
        </PageContainer>
    );
};

export default StudentHomePage;