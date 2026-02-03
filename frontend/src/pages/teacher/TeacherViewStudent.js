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
  const teachSubject = currentUser.teachSubject?.subName;
  const teachSubjectID = currentUser.teachSubject?._id;

  useEffect(() => {
    dispatch(getUserDetails(studentID, address));
  }, [dispatch, studentID]);

  if (response) console.log(response);
  if (error) console.log(error);

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
    { name: 'Present', value: overallAttendancePercentage },
    { name: 'Absent', value: overallAbsentPercentage },
  ];

  if (loading) return <div>Loading...</div>;

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4 }}>
        {/* STUDENT INFO */}
        <Typography variant="h5" gutterBottom>
          Student Information
        </Typography>

        <Typography>Name: {userDetails?.name}</Typography>
        <Typography>Roll Number: {userDetails?.rollNum}</Typography>
        <Typography>Class: {sclassName?.sclassName}</Typography>
        <Typography>School: {studentSchool?.schoolName}</Typography>

        {/* ATTENDANCE */}
        <Box sx={{ mt: 5 }}>
          <Typography variant="h5" gutterBottom>
            Attendance
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
                      <StyledTableCell>Subject</StyledTableCell>
                      <StyledTableCell>Present</StyledTableCell>
                      <StyledTableCell>Total Sessions</StyledTableCell>
                      <StyledTableCell>Attendance %</StyledTableCell>
                      <StyledTableCell align="center">
                        Actions
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
                          Details
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
                              Attendance Details
                            </Typography>

                            <Table size="small">
                              <TableHead>
                                <StyledTableRow>
                                  <StyledTableCell>Date</StyledTableCell>
                                  <StyledTableCell align="right">
                                    Status
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
            Overall Attendance: {overallAttendancePercentage.toFixed(2)}%
          </Typography>

          <CustomPieChart data={chartData} />
        </Box>

        <Box sx={{ mt: 3 }}>
          <Button
            variant="contained"
            onClick={() =>
              navigate(
                `/Teacher/class/student/attendance/${studentID}/${teachSubjectID}`
              )
            }
          >
            Add Attendance
          </Button>
        </Box>

        {/* MARKS */}
        <Box sx={{ mt: 6 }}>
          <Typography variant="h5" gutterBottom>
            Subject Marks
          </Typography>

          {subjectMarks?.length > 0 &&
            subjectMarks.map((result, index) => {
              if (result.subName?.subName !== teachSubject) return null;

              return (
                <Table key={index} sx={{ mb: 2 }}>
                  <TableHead>
                    <StyledTableRow>
                      <StyledTableCell>Subject</StyledTableCell>
                      <StyledTableCell>Marks</StyledTableCell>
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
                `/Teacher/class/student/marks/${studentID}/${teachSubjectID}`
              )
            }
          >
            Add Marks
          </PurpleButton>
        </Box>
      </Box>
    </Container>
  );
};

export default TeacherViewStudent;
