import React, { useEffect, useState } from "react";
import {
    KeyboardArrowDown,
    KeyboardArrowUp,
    InsertChart,
    InsertChartOutlined,
    TableChart,
    TableChartOutlined,
} from "@mui/icons-material";
import {
    Box,
    Button,
    Collapse,
    Paper,
    Table,
    TableBody,
    TableHead,
    TableRow,
    TableCell,
    Typography,
    CircularProgress,
    Container,
    Chip,
    BottomNavigation,
    BottomNavigationAction,
} from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { getUserDetails } from "../../redux/userRelated/userHandle";
import {
    calculateOverallAttendancePercentage,
    calculateSubjectAttendancePercentage,
    groupAttendanceBySubject,
} from "../../components/attendanceCalculator";
import CustomBarChart from "../../components/CustomBarChart";
import styled, { keyframes, createGlobalStyle } from "styled-components";

// ─── Global Style ──────────────────────────────────────────────────────
const GlobalStyle = createGlobalStyle`
  body {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  }
`;

// ─── Animations ────────────────────────────────────────────────────────
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0); }
`;

// ─── Styled Components ────────────────────────────────────────────────
const PageContainer = styled(Container)`
  margin-top: 2rem;
  margin-bottom: 5rem;
  animation: ${fadeIn} 0.6s ease;
`;

const StyledPaper = styled(Paper)`
  border-radius: 24px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.05);
  overflow: hidden;
  background: white;
`;

const SectionTitle = styled(Typography)`
  font-weight: 700;
  color: #0f172a;
  margin-bottom: 1.5rem;
  border-left: 4px solid #2563eb;
  padding-left: 1rem;
`;

const StyledTable = styled(Table)`
  & .MuiTableHead-root .MuiTableCell-root {
    background-color: #f8fafc;
    font-weight: 600;
    color: #1e293b;
    border-bottom: 2px solid #e2e8f0;
  }
`;

const StyledTableRow = styled(TableRow)`
  &:nth-of-type(odd) {
    background-color: #fafcff;
  }
  &:hover {
    background-color: #f1f5f9;
    transition: background-color 0.2s ease;
  }
`;

const StyledTableCell = styled(TableCell)`
  border-bottom: 1px solid #e2e8f0;
  padding: 14px 16px;
  font-size: 0.9rem;
`;

// Details button with static white text and icon
const DetailsButton = styled(Button)`
  background: linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%);
  color: white !important;
  border-radius: 40px;
  padding: 4px 16px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: none;
  box-shadow: 0 2px 6px rgba(30, 64, 175, 0.2);
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(30, 64, 175, 0.3);
    background: linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%);
    color: white !important;
  }

  & svg {
    color: white !important;
  }
`;

const OverallCard = styled(Paper)`
  background: linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%);
  color: white;
  border-radius: 20px;
  padding: 1rem 1.5rem;
  margin-top: 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
`;

const OverallLabel = styled(Typography)`
  font-weight: 500;
  font-size: 1rem;
  opacity: 0.9;
`;

const OverallValue = styled(Typography)`
  font-weight: 800;
  font-size: 2rem;
  line-height: 1;
`;

const BottomNavPaper = styled(Paper)`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  border-radius: 24px 24px 0 0;
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.05);
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(8px);
  z-index: 100;
`;

const LoadingContainer = styled(Box)`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 60vh;
`;

const EmptyContainer = styled(Box)`
  text-align: center;
  padding: 3rem;
  background: white;
  border-radius: 24px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.05);
`;

const ViewStdAttendance = () => {
    const dispatch = useDispatch();
    const [openStates, setOpenStates] = useState({});
    const { userDetails, currentUser, loading, response, error } = useSelector((state) => state.user);
    const [subjectAttendance, setSubjectAttendance] = useState([]);
    const [selectedSection, setSelectedSection] = useState("table");

    useEffect(() => {
        if (currentUser?._id) {
            dispatch(getUserDetails(currentUser._id, "Student"));
        }
    }, [dispatch, currentUser?._id]);

    useEffect(() => {
        if (userDetails) {
            setSubjectAttendance(userDetails.attendance || []);
        }
    }, [userDetails]);

    const handleOpen = (subId) => {
        setOpenStates((prev) => ({ ...prev, [subId]: !prev[subId] }));
    };

    const handleSectionChange = (event, newSection) => {
        setSelectedSection(newSection);
    };

    if (response) console.log(response);
    if (error) console.log(error);

    const attendanceBySubject = groupAttendanceBySubject(subjectAttendance);
    const overallAttendancePercentage = calculateOverallAttendancePercentage(subjectAttendance);

    const subjectData = Object.entries(attendanceBySubject).map(([subName, { present, sessions }]) => ({
        subject: subName,
        attendancePercentage: calculateSubjectAttendancePercentage(present, sessions),
        totalClasses: sessions,
        attendedClasses: present,
    }));

    const renderTableSection = () => (
        <>
            <SectionTitle variant="h5">Chi tiết điểm danh theo môn</SectionTitle>
            <StyledTable>
                <TableHead>
                    <StyledTableRow>
                        <StyledTableCell>Môn học</StyledTableCell>
                        <StyledTableCell align="center">Đã tham dự</StyledTableCell>
                        <StyledTableCell align="center">Tổng số buổi</StyledTableCell>
                        <StyledTableCell align="center">Tỉ lệ</StyledTableCell>
                        <StyledTableCell align="center">Chi tiết</StyledTableCell>
                    </StyledTableRow>
                </TableHead>
                <TableBody>
                    {Object.entries(attendanceBySubject).map(([subName, { present, allData, subId, sessions }]) => {
                        const subjectAttendancePercentage = calculateSubjectAttendancePercentage(present, sessions);
                        const isOpen = openStates[subId];

                        return (
                            <React.Fragment key={subId}>
                                <StyledTableRow>
                                    <StyledTableCell component="th" scope="row">
                                        <Typography fontWeight={500}>{subName}</Typography>
                                    </StyledTableCell>
                                    <StyledTableCell align="center">{present}</StyledTableCell>
                                    <StyledTableCell align="center">{sessions}</StyledTableCell>
                                    <StyledTableCell align="center">
                                        <Chip
                                            label={`${subjectAttendancePercentage}%`}
                                            size="small"
                                            sx={{
                                                backgroundColor: subjectAttendancePercentage >= 75 ? "#22c55e20" : "#ef444420",
                                                color: subjectAttendancePercentage >= 75 ? "#16a34a" : "#dc2626",
                                                fontWeight: 600,
                                                borderRadius: "12px",
                                            }}
                                        />
                                    </StyledTableCell>
                                    <StyledTableCell align="center">
                                        <DetailsButton onClick={() => handleOpen(subId)}>
                                            {isOpen ? <KeyboardArrowUp fontSize="small" /> : <KeyboardArrowDown fontSize="small" />}
                                            {isOpen ? "Thu gọn" : "Xem chi tiết"}
                                        </DetailsButton>
                                    </StyledTableCell>
                                </StyledTableRow>
                                <StyledTableRow>
                                    <StyledTableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={5}>
                                        <Collapse in={isOpen} timeout="auto" unmountOnExit>
                                            <Box sx={{ margin: 2, backgroundColor: "#fafcff", borderRadius: "16px", p: 2 }}>
                                                <Typography variant="subtitle2" gutterBottom fontWeight={600}>
                                                    Lịch sử điểm danh
                                                </Typography>
                                                <Table size="small">
                                                    <TableHead>
                                                        <StyledTableRow>
                                                            <StyledTableCell>Ngày</StyledTableCell>
                                                            <StyledTableCell align="right">Trạng thái</StyledTableCell>
                                                        </StyledTableRow>
                                                    </TableHead>
                                                    <TableBody>
                                                        {allData.map((data, idx) => {
                                                            const date = new Date(data.date);
                                                            const dateString = !isNaN(date.getTime())
                                                                ? date.toLocaleDateString("vi-VN")
                                                                : "Ngày không hợp lệ";
                                                            return (
                                                                <StyledTableRow key={idx}>
                                                                    <StyledTableCell>{dateString}</StyledTableCell>
                                                                    <StyledTableCell align="right">
                                                                        <Chip
                                                                            label={data.status}
                                                                            size="small"
                                                                            sx={{
                                                                                backgroundColor: data.status === "present" ? "#22c55e20" : "#ef444420",
                                                                                color: data.status === "present" ? "#16a34a" : "#dc2626",
                                                                                fontWeight: 500,
                                                                            }}
                                                                        />
                                                                    </StyledTableCell>
                                                                </StyledTableRow>
                                                            );
                                                        })}
                                                    </TableBody>
                                                </Table>
                                            </Box>
                                        </Collapse>
                                    </StyledTableCell>
                                </StyledTableRow>
                            </React.Fragment>
                        );
                    })}
                </TableBody>
            </StyledTable>
            <OverallCard elevation={0}>
                <OverallLabel>Tỉ lệ chuyên cần tổng thể</OverallLabel>
                <OverallValue>{overallAttendancePercentage.toFixed(1)}%</OverallValue>
            </OverallCard>
        </>
    );

    const renderChartSection = () => (
        <>
            <SectionTitle variant="h5">Biểu đồ điểm danh theo môn</SectionTitle>
            <Box sx={{ p: 2, backgroundColor: "white", borderRadius: "24px" }}>
                <CustomBarChart chartData={subjectData} dataKey="attendancePercentage" />
            </Box>
            <OverallCard elevation={0}>
                <OverallLabel>Tỉ lệ chuyên cần tổng thể</OverallLabel>
                <OverallValue>{overallAttendancePercentage.toFixed(1)}%</OverallValue>
            </OverallCard>
        </>
    );

    if (loading) {
        return (
            <LoadingContainer>
                <CircularProgress />
                <Typography sx={{ ml: 2 }}>Đang tải dữ liệu điểm danh...</Typography>
            </LoadingContainer>
        );
    }

    const hasData = subjectAttendance && Array.isArray(subjectAttendance) && subjectAttendance.length > 0;

    return (
        <>
            <GlobalStyle />
            <PageContainer maxWidth="lg">
                <StyledPaper>
                    <Box sx={{ p: { xs: 2, md: 3 } }}>
                        {hasData ? (
                            <>
                                {selectedSection === "table" && renderTableSection()}
                                {selectedSection === "chart" && renderChartSection()}
                            </>
                        ) : (
                            <EmptyContainer>
                                <Typography variant="h6" gutterBottom color="text.secondary">
                                    Chưa có dữ liệu điểm danh
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Hiện tại bạn chưa có bất kỳ lịch sử điểm danh nào.
                                </Typography>
                            </EmptyContainer>
                        )}
                    </Box>
                </StyledPaper>
            </PageContainer>

            {hasData && (
                <BottomNavPaper elevation={3}>
                    <BottomNavigation value={selectedSection} onChange={handleSectionChange} showLabels>
                        <BottomNavigationAction
                            label="Bảng"
                            value="table"
                            icon={selectedSection === "table" ? <TableChart /> : <TableChartOutlined />}
                            sx={{ "&.Mui-selected": { color: "#2563eb" } }}
                        />
                        <BottomNavigationAction
                            label="Biểu đồ"
                            value="chart"
                            icon={selectedSection === "chart" ? <InsertChart /> : <InsertChartOutlined />}
                            sx={{ "&.Mui-selected": { color: "#2563eb" } }}
                        />
                    </BottomNavigation>
                </BottomNavPaper>
            )}
        </>
    );
};

export default ViewStdAttendance;