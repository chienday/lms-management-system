import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getUserDetails } from '../../redux/userRelated/userHandle';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Button,
  Collapse,
  Table,
  TableBody,
  TableHead,
  Typography,
  Container,
} from '@mui/material';
import { KeyboardArrowDown, KeyboardArrowUp } from '@mui/icons-material';
import {
  calculateOverallAttendancePercentage,
  calculateSubjectAttendancePercentage,
  groupAttendanceBySubject,
} from '../../components/attendanceCalculator';
import CustomPieChart from '../../components/CustomPieChart';
import { PurpleButton } from '../../components/buttonStyles';
import { StyledTableCell, StyledTableRow } from '../../components/styles';

const TeacherViewStudent = () => {
  const navigate = useNavigate();
  const params = useParams();
  const dispatch = useDispatch();

  const { currentUser, userDetails, response, loading, error } = useSelector(
    (state) => state.user
  );

  const address = 'Student';
  const studentID = params.id;
  const teachSubject = currentUser?.teachSubject?.subName;
  const teachSubjectID = currentUser?.teachSubject?._id;

  // Debug logs
  useEffect(() => {
    console.log("TeacherViewStudent mounted with studentID:", studentID);
    console.log("currentUser:", currentUser);
    dispatch(getUserDetails(studentID, address));
  }, [dispatch, studentID]);

  if (response) {
    console.log("Response:", response);
  }
  if (error) {
    console.error("Error:", error);
    // Don't navigate away, show error message instead
  }

  const [sclassName, setSclassName] = useState('');
  const [studentSchool, setStudentSchool] = useState('');
  const [subjectMarks, setSubjectMarks] = useState([]);
  const [subjectAttendance, setSubjectAttendance] = useState([]);
  const [openStates, setOpenStates] = useState({});

  const handleOpen = (subId) => {
    setOpenStates((prev) => ({ ...prev, [subId]: !prev[subId] }));
  };

  useEffect(() => {
    if (userDetails) {
      setSclassName(userDetails.sclassName || '');
      setStudentSchool(userDetails.school || '');
      setSubjectMarks(userDetails.examResult || []);
      setSubjectAttendance(userDetails.attendance || []);
    }
  }, [userDetails]);

  const overallAttendancePercentage =
    calculateOverallAttendancePercentage(subjectAttendance);
  const overallAbsentPercentage = 100 - overallAttendancePercentage;

  const chartData = [
    { name: 'Có mặt', value: overallAttendancePercentage },
    { name: 'Vắng', value: overallAbsentPercentage },
  ];

  if (loading) return <div>Đang tải thông tin sinh viên...</div>;

  if (error) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ mt: 4, p: 2, bgcolor: '#ffebee', borderRadius: 1 }}>
          <Typography color="error" variant="h6">
            Lỗi khi tải thông tin sinh viên: {error}
          </Typography>
          <Button 
            variant="contained" 
            sx={{ mt: 2 }}
            onClick={() => navigate(-1)}
          >
            Quay lại
          </Button>
        </Box>
      </Container>
    );
  }

  if (!userDetails) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ mt: 4, p: 2 }}>
          <Typography>Không tìm thấy thông tin sinh viên</Typography>
          <Button 
            variant="contained"
            sx={{ mt: 2 }}
            onClick={() => navigate(-1)}
          >
            Quay lại
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4 }}>
        {/* STUDENT INFO */}
        <Typography variant="h5" gutterBottom>
          Thông tin sinh viên
        </Typography>

        <Typography>Họ tên: {userDetails?.name}</Typography>
        <Typography>MSSV: {userDetails?.rollNum}</Typography>
        <Typography>Lớp: {sclassName?.sclassName}</Typography>
        <Typography>Trường: {studentSchool?.schoolName}</Typography>

        {/* ATTENDANCE */}
        <Box sx={{ mt: 5 }}>
          <Typography variant="h5" gutterBottom>
            Điểm danh
          </Typography>

          {subjectAttendance?.length > 0 &&
            Object.entries(
              groupAttendanceBySubject(subjectAttendance)
            ).map(([subName, { present, allData, subId, sessions }], index) => {
              if (subName !== teachSubject) return null;

              const percentage =
                calculateSubjectAttendancePercentage(present, sessions);

              return (
                <Table key={index} sx={{ mb: 4 }}>
                  <TableHead>
                    <StyledTableRow>
                      <StyledTableCell>Môn</StyledTableCell>
                      <StyledTableCell>Có mặt</StyledTableCell>
                      <StyledTableCell>Tổng buổi</StyledTableCell>
                      <StyledTableCell>Tỷ lệ điểm danh</StyledTableCell>
                      <StyledTableCell align="center">
                        Thao tác
                      </StyledTableCell>
                    </StyledTableRow>
                  </TableHead>

                  <TableBody>
                    <StyledTableRow>
                      <StyledTableCell>{subName}</StyledTableCell>
                      <StyledTableCell>{present}</StyledTableCell>
                      <StyledTableCell>{sessions}</StyledTableCell>
                      <StyledTableCell>{percentage}%</StyledTableCell>
                      <StyledTableCell align="center">
                        <Button
                          variant="contained"
                          onClick={() => handleOpen(subId)}
                        >
                          {openStates[subId] ? (
                            <KeyboardArrowUp />
                          ) : (
                            <KeyboardArrowDown />
                          )}
                          Chi tiết
                        </Button>
                      </StyledTableCell>
                    </StyledTableRow>

                    <StyledTableRow>
                      <StyledTableCell colSpan={6} sx={{ p: 0 }}>
                        <Collapse
                          in={openStates[subId]}
                          timeout="auto"
                          unmountOnExit
                        >
                          <Box sx={{ m: 2 }}>
                            <Typography variant="h6">
                              Chi tiết điểm danh
                            </Typography>

                            <Table size="small">
                              <TableHead>
                                <StyledTableRow>
                                  <StyledTableCell>Ngày</StyledTableCell>
                                  <StyledTableCell align="right">
                                    Trạng thái
                                  </StyledTableCell>
                                </StyledTableRow>
                              </TableHead>
                              <TableBody>
                                {allData.map((data, i) => {
                                  const date = new Date(data.date);
                                  const dateString =
                                    date.toString() !== 'Invalid Date'
                                      ? date.toISOString().substring(0, 10)
                                      : 'Invalid Date';

                                  return (
                                    <StyledTableRow key={i}>
                                      <StyledTableCell>
                                        {dateString}
                                      </StyledTableCell>
                                      <StyledTableCell align="right">
                                        {data.status}
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
                  </TableBody>
                </Table>
              );
            })}

          <Typography sx={{ mt: 2 }}>
            Chuyên cần tổng: {overallAttendancePercentage.toFixed(2)}%
          </Typography>

          <CustomPieChart data={chartData} />
        </Box>

        <Box sx={{ mt: 3 }}>
          <Button
            variant="contained"
            onClick={() =>
              navigate(
                `/class/student/attendance/${studentID}/${teachSubjectID}`
              )
            }
          >
            Điểm danh
          </Button>
        </Box>

        {/* MARKS */}
        <Box sx={{ mt: 6 }}>
          <Typography variant="h5" gutterBottom>
            Điểm môn
          </Typography>

          {subjectMarks?.length > 0 &&
            subjectMarks.map((result, index) => {
              if (result.subName?.subName !== teachSubject) return null;

              return (
                <Table key={index} sx={{ mb: 2 }}>
                  <TableHead>
                    <StyledTableRow>
                      <StyledTableCell>Môn</StyledTableCell>
                      <StyledTableCell>Điểm</StyledTableCell>
                    </StyledTableRow>
                  </TableHead>
                  <TableBody>
                    <StyledTableRow>
                      <StyledTableCell>
                        {result.subName.subName}
                      </StyledTableCell>
                      <StyledTableCell>
                        {result.marksObtained}
                      </StyledTableCell>
                    </StyledTableRow>
                  </TableBody>
                </Table>
              );
            })}

          <PurpleButton
            variant="contained"
            onClick={() =>
              navigate(
                `/class/student/marks/${studentID}/${teachSubjectID}`
              )
            }
          >
            Nhập điểm
          </PurpleButton>
        </Box>
      </Box>
    </Container>
  );
};

export default TeacherViewStudent;
