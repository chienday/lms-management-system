/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { deleteUser, getUserDetails, updateUser } from '../../../redux/userRelated/userHandle';
import { useNavigate, useParams } from 'react-router-dom'
import { getSubjectList } from '../../../redux/sclassRelated/sclassHandle';
import { Box, Button, Collapse, IconButton, Table, TableBody, TableHead, Typography, Tab, Paper, BottomNavigation, BottomNavigationAction, Container, Card, CardContent, Chip, Grid, Dialog, DialogTitle, DialogContent, DialogActions, TextField } from '@mui/material';
import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';
import TabPanel from '@mui/lab/TabPanel';
import { KeyboardArrowUp, KeyboardArrowDown, Delete as DeleteIcon, Lock as LockIcon, LockOpen as LockOpenIcon, VpnKey as ResetIcon } from '@mui/icons-material';
import { removeStuff, updateStudentFields } from '../../../redux/studentRelated/studentHandle';
import { calculateOverallAttendancePercentage, calculateSubjectAttendancePercentage, groupAttendanceBySubject } from '../../../components/attendanceCalculator';
import CustomBarChart from '../../../components/CustomBarChart'
import CustomPieChart from '../../../components/CustomPieChart'
import { StyledTableCell, StyledTableRow } from '../../../components/styles';

import InsertChartIcon from '@mui/icons-material/InsertChart';
import InsertChartOutlinedIcon from '@mui/icons-material/InsertChartOutlined';
import TableChartIcon from '@mui/icons-material/TableChart';
import TableChartOutlinedIcon from '@mui/icons-material/TableChartOutlined';
import Popup from '../../../components/Popup';
import axios from 'axios';
import { Alert } from '@mui/material';

// Component to view student details, attendance, and marks
const ViewStudent = () => {
    const [showTab, setShowTab] = useState(false);

    const navigate = useNavigate()
    const params = useParams()
    const dispatch = useDispatch()
    const { userDetails, response, loading, error } = useSelector((state) => state.user);
    const { currentUser } = useSelector(state => state.user);

    // Comprehensive error detection - ensure userDetails is never an error object
    const isUserDetailsError = userDetails && 
                              typeof userDetails === 'object' && 
                              (userDetails.message || userDetails.status || userDetails.code);
    
    // Use safe userDetails or defaults
    const safeUserDetails = isUserDetailsError ? null : userDetails;

    const studentID = params.id
    const address = "Student"

    // Fetch student details on component mount
    useEffect(() => {
        dispatch(getUserDetails(studentID, address));
    }, [dispatch, studentID])

    useEffect(() => {
        // Fetch subject list if student details and class are available
        // Ensure userDetails is valid and not an error object
        const isValidUserDetails = safeUserDetails && 
                                  typeof safeUserDetails === 'object' && 
                                  !safeUserDetails.message && 
                                  !safeUserDetails.status && 
                                  !safeUserDetails.code &&
                                  safeUserDetails.sclassName && 
                                  safeUserDetails.sclassName._id !== undefined;
        
        if (isValidUserDetails) {
            dispatch(getSubjectList(safeUserDetails.sclassName._id, "ClassSubjects"));
        }
    }, [dispatch, safeUserDetails]);

    if (response) { console.log(response) }
    else if (error) { console.log(error) }

    const [name, setName] = useState('');
    const [rollNum, setRollNum] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [sclassName, setSclassName] = useState('');
    const [studentSchool, setStudentSchool] = useState('');
    const [accountStatus, setAccountStatus] = useState('Active');
    const [subjectMarks, setSubjectMarks] = useState('');
    const [subjectAttendance, setSubjectAttendance] = useState([]);

    const [openStates, setOpenStates] = useState({});

    const [showPopup, setShowPopup] = useState(false);
    const [message, setMessage] = useState("");

    // State for reset password dialog
    const [openResetPasswordDialog, setOpenResetPasswordDialog] = useState(false);
    const [newPassword, setNewPassword] = useState("");

    // Toggle the open state of a subject's details
    const handleOpen = (subId) => {
        setOpenStates((prevState) => ({
            ...prevState,
            [subId]: !prevState[subId],
        }));
    };

    // State and handler for tab changes
    const [value, setValue] = useState('1');

    const handleChange = (event, newValue) => {
        setValue(newValue);
    };
    // State and handler for section changes (table/chart)

    const [selectedSection, setSelectedSection] = useState('table');
    const handleSectionChange = (event, newSection) => {
        setSelectedSection(newSection);
    };

    const fields = password === ""
        ? { name, rollNum, email }
        : { name, rollNum, email, password }

    useEffect(() => {
        // Update state variables when userDetails change
        // Ensure userDetails is a valid data object, not an error response
        const isValidUserDetails = safeUserDetails && 
                                  typeof safeUserDetails === 'object' && 
                                  !safeUserDetails.message && 
                                  !safeUserDetails.status && 
                                  !safeUserDetails.code;
        
        if (isValidUserDetails) {
            setName(safeUserDetails.name && typeof safeUserDetails.name === 'string' ? safeUserDetails.name : '');
            setRollNum(safeUserDetails.rollNum ? String(safeUserDetails.rollNum) : '');
            setEmail(safeUserDetails.email && typeof safeUserDetails.email === 'string' ? safeUserDetails.email : '');
            setAccountStatus(safeUserDetails.accountStatus && typeof safeUserDetails.accountStatus === 'string' ? safeUserDetails.accountStatus : 'Active');
            
            // Handle sclassName - extract name if it's an object
            if (typeof safeUserDetails.sclassName === 'object' && safeUserDetails.sclassName !== null && safeUserDetails.sclassName?.sclassName) {
                setSclassName(safeUserDetails.sclassName);
            } else if (typeof safeUserDetails.sclassName === 'string') {
                setSclassName(safeUserDetails.sclassName);
            } else {
                setSclassName('');
            }
            
            // Handle school - extract name if it's an object
            if (typeof safeUserDetails.school === 'object' && safeUserDetails.school !== null && safeUserDetails.school?.schoolName) {
                setStudentSchool(safeUserDetails.school);
            } else if (typeof safeUserDetails.school === 'string') {
                setStudentSchool(safeUserDetails.school);
            } else {
                setStudentSchool('');
            }
            
            // Handle examResult - ensure we only set valid types
            const examResult = safeUserDetails.examResult;
            if (examResult && typeof examResult === 'string') {
                setSubjectMarks(examResult);
            } else if (examResult && typeof examResult === 'object' && !examResult.message && !examResult.status && !examResult.code) {
                // If it's an object but not an error object, store the object
                setSubjectMarks(examResult);
            } else {
                setSubjectMarks('');
            }
            
            // Handle attendance - ensure it's always an array and doesn't contain error objects
            const attendance = safeUserDetails.attendance;
            if (Array.isArray(attendance) && attendance.length > 0 && !attendance.some(item => item?.message || item?.status || item?.code)) {
                setSubjectAttendance(attendance);
            } else {
                setSubjectAttendance([]);
            }
        } else {
            // Reset all state if userDetails is invalid
            setName('');
            setRollNum('');
            setEmail('');
            setAccountStatus('Active');
            setSclassName('');
            setStudentSchool('');
            setSubjectMarks('');
            setSubjectAttendance([]);
        }
    }, [safeUserDetails]);

    // Helper function to safely convert any value to a string message
    const getSafeMessage = (value) => {
        if (typeof value === 'string') {
            return value;
        }
        if (typeof value === 'object' && value !== null && value.message && typeof value.message === 'string') {
            return value.message;
        }
        if (typeof value === 'object' && value !== null) {
            return JSON.stringify(value).substring(0, 100) || 'Đã xảy ra lỗi';
        }
        return 'Đã xảy ra lỗi';
    };

    // Handle lock/unlock account
    const toggleLockStatus = async () => {
        try {
            const response = await axios.put(`http://localhost:5000/Student/Lock/${studentID}`);
            if (response.data) {
                setMessage(response.data.accountStatus === 'Active' ? 'Tài khoản đã mở khóa' : 'Tài khoản đã bị khóa');
                setAccountStatus(typeof response.data.accountStatus === 'string' ? response.data.accountStatus : 'Active');
            }
        } catch (err) {
            setMessage('Lỗi khi thay đổi trạng thái tài khoản');
        }
        setShowPopup(true);
    };

    // Handle reset password
    const handleOpenResetPasswordDialog = () => {
        setNewPassword("");
        setOpenResetPasswordDialog(true);
    };

    const handleResetPassword = async () => {
        if (!newPassword) {
            setMessage('Vui lòng nhập mật khẩu mới');
            setShowPopup(true);
            return;
        }

        try {
            const response = await axios.put(`http://localhost:5000/Student/ResetPassword/${studentID}`, {
                studentId: studentID,
                newPassword: newPassword
            });
            if (response.data) {
                setMessage('Mật khẩu đã được đặt lại thành công');
                setOpenResetPasswordDialog(false);
                setNewPassword("");
            }
        } catch (err) {
            const errorMsg = getSafeMessage(err.response?.data?.message || err.response?.data || 'Lỗi khi đặt lại mật khẩu');
            setMessage(errorMsg);
        }
        setShowPopup(true);
    };

    // Handle form submission to update student details
    const submitHandler = (event) => {
        event.preventDefault()
        dispatch(updateUser(fields, studentID, address))
            .then(() => {
                dispatch(getUserDetails(studentID, address));
            })
            .catch((error) => {
                console.error(error)
            })
    }

    // Handle student deletion
    const deleteHandler = () => {
        dispatch(deleteUser(studentID, address))
            .then(() => {
                navigate(-1)
            })
    }

    // Handle removal of student data (attendance/marks)
    const removeHandler = (id, deladdress) => {
        dispatch(removeStuff(id, deladdress))
            .then(() => {
                dispatch(getUserDetails(studentID, address));
            })
    }

    // Handle removal of a specific subject's attendance
    const removeSubAttendance = (subId) => {
        dispatch(updateStudentFields(studentID, { subId }, "RemoveStudentSubAtten"))
            .then(() => {
                dispatch(getUserDetails(studentID, address));
            })
    }

    // Calculate overall attendance percentages
    const safeSubjectAttendance = Array.isArray(subjectAttendance) ? subjectAttendance : [];
    const overallAttendancePercentage = calculateOverallAttendancePercentage(safeSubjectAttendance);
    const overallAbsentPercentage = 100 - overallAttendancePercentage;

    const chartData = [
        { name: 'Present', value: overallAttendancePercentage },
        // Data for the pie chart
        { name: 'Absent', value: overallAbsentPercentage }
    ];

    const subjectData = safeSubjectAttendance.length > 0 
        ? Object.entries(groupAttendanceBySubject(safeSubjectAttendance)).map(([subName, { subCode, present, sessions }]) => {
            const subjectAttendancePercentage = calculateSubjectAttendancePercentage(present, sessions);
            return {
                subject: subName,
                attendancePercentage: subjectAttendancePercentage,
                totalClasses: sessions,
                attendedClasses: present
            };
        })
        : [];

    
    // Component to display student details
    const StudentDetailsSection = () => {
        return (
            <Box>
                <Card elevation={3} sx={{ mb: 3 }}>
                    <CardContent>
                        <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>
                            📋 Thông tin sinh viên
                        </Typography>
                        
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                                <Typography variant="subtitle2" color="textSecondary">Họ tên</Typography>
                                <Typography variant="body1" sx={{ mb: 2 }}>{typeof name === 'string' ? name : 'Chưa cập nhật'}</Typography>
                            </Grid>
                            
                            <Grid item xs={12} sm={6}>
                                <Typography variant="subtitle2" color="textSecondary">MSSV</Typography>
                                <Typography variant="body1" sx={{ mb: 2 }}>{typeof rollNum === 'string' ? rollNum : 'Chưa cập nhật'}</Typography>
                            </Grid>
                            
                            <Grid item xs={12} sm={6}>
                                <Typography variant="subtitle2" color="textSecondary">Email</Typography>
                                <Typography variant="body1" sx={{ mb: 2 }}>{typeof email === 'string' ? email : 'Chưa cập nhật'}</Typography>
                            </Grid>
                            
                            <Grid item xs={12} sm={6}>
                                <Typography variant="subtitle2" color="textSecondary">Lớp</Typography>
                                <Typography variant="body1" sx={{ mb: 2 }}>
                                    {(typeof sclassName === 'string' && sclassName) 
                                        ? sclassName 
                                        : (typeof sclassName === 'object' && sclassName !== null && sclassName?.sclassName && typeof sclassName.sclassName === 'string'
                                            ? sclassName.sclassName
                                            : 'Chưa cập nhật')}
                                </Typography>
                            </Grid>
                            
                            <Grid item xs={12} sm={6}>
                                <Typography variant="subtitle2" color="textSecondary">Trường</Typography>
                                <Typography variant="body1" sx={{ mb: 2 }}>
                                    {(typeof studentSchool === 'string' && studentSchool)
                                        ? studentSchool
                                        : (typeof studentSchool === 'object' && studentSchool !== null && studentSchool?.schoolName && typeof studentSchool.schoolName === 'string'
                                            ? studentSchool.schoolName
                                            : 'Chưa cập nhật')}
                                </Typography>
                            </Grid>
                            
                            <Grid item xs={12} sm={6}>
                                <Typography variant="subtitle2" color="textSecondary">Trạng thái tài khoản</Typography>
                                <Chip 
                                    label={typeof accountStatus === 'string' && accountStatus === 'Active' ? '✓ Hoạt động' : '⊗ Bị khóa'}
                                    color={typeof accountStatus === 'string' && accountStatus === 'Active' ? 'success' : 'error'}
                                    variant="outlined"
                                    sx={{ mb: 2 }}
                                />
                            </Grid>
                        </Grid>

                        {/* Visualization */}
                        {safeSubjectAttendance && Array.isArray(safeSubjectAttendance) && safeSubjectAttendance.length > 0 && (
                            <Box sx={{ mt: 3 }}>
                                <Typography variant="subtitle2" color="textSecondary" sx={{ mb: 2 }}>Thống kê chuyên cần</Typography>
                                <CustomPieChart data={chartData} />
                            </Box>
                        )}

                        {/* Action Buttons */}
                        <Box sx={{ mt: 3, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                            <Button 
                                variant="contained" 
                                color="info"
                                startIcon={typeof accountStatus === 'string' && accountStatus === 'Active' ? <LockIcon /> : <LockOpenIcon />}
                                onClick={toggleLockStatus}
                                title={typeof accountStatus === 'string' && accountStatus === 'Active' ? 'Khóa tài khoản' : 'Mở khóa tài khoản'}
                            >
                                {typeof accountStatus === 'string' && accountStatus === 'Active' ? 'Khóa tài khoản' : 'Mở khóa tài khoản'}
                            </Button>
                            
                            <Button 
                                variant="contained" 
                                color="warning"
                                startIcon={<ResetIcon />}
                                onClick={handleOpenResetPasswordDialog}
                                title="Đặt lại mật khẩu"
                            >
                                Đặt lại mật khẩu
                            </Button>
                            
                            <Button 
                                variant="contained" 
                                color="error"
                                startIcon={<DeleteIcon />}
                                onClick={deleteHandler}
                                title="Xóa sinh viên"
                            >
                                Xóa sinh viên
                            </Button>
                        </Box>
                    </CardContent>
                </Card>
            </Box>
        )
    }

    // Main return statement for the component
    return (
        <>
            {loading
                ?
                <>
                    <div>Đang tải...</div>
                </>
                :
                error
                ?
                <>
                    <Alert severity="error" sx={{ m: 2 }}>
                        Lỗi khi tải dữ liệu sinh viên: {
                            typeof error === 'string' 
                                ? error 
                                : (typeof error === 'object' && error?.message && typeof error.message === 'string' 
                                    ? error.message 
                                    : 'Lỗi không xác định')
                        }
                    </Alert>
                    <Box sx={{ textAlign: 'center', p: 4 }}>
                        <Button onClick={() => navigate(-1)} variant="contained">Quay lại</Button>
                    </Box>
                </>
                :
                <>
                    <Box sx={{ width: '100%', typography: 'body1', }} >
                        <TabContext value={value}>
                            {/* Tab navigation */}
                            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                                <TabList onChange={handleChange} sx={{ position: 'fixed', width: '100%', bgcolor: 'background.paper', zIndex: 1 }}>
                                    <Tab label="Thông tin chi tiết" value="1" />
                                    
                                </TabList>
                            </Box>
                            <Container sx={{ marginTop: "3rem", marginBottom: "4rem" }}>
                                <TabPanel value="1">
                                    <StudentDetailsSection />
                                </TabPanel>
                               
                            </Container>
                        </TabContext>
                    </Box>
                </>
            }

            {/* Reset Password Dialog */}
            <Dialog
                open={openResetPasswordDialog}
                onClose={() => setOpenResetPasswordDialog(false)}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle sx={{ fontWeight: "bold", fontSize: "18px" }}>
                    Reset Mật Khẩu
                </DialogTitle>
                <DialogContent dividers>
                    <Typography sx={{ marginBottom: "16px" }}>
                        Reset mật khẩu cho sinh viên: <strong>{typeof name === 'string' ? name : 'Sinh viên'}</strong>
                    </Typography>
                    <TextField
                        label="Mật Khẩu Mới"
                        type="password"
                        fullWidth
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Nhập mật khẩu mới"
                        autoFocus
                    />
                </DialogContent>
                <DialogActions sx={{ padding: "16px" }}>
                    <Button
                        onClick={() => setOpenResetPasswordDialog(false)}
                        variant="outlined"
                    >
                        Hủy
                    </Button>
                    <Button
                        onClick={handleResetPassword}
                        variant="contained"
                        color="warning"
                    >
                        Reset
                    </Button>
                </DialogActions>
            </Dialog>

            <Popup message={typeof message === 'string' ? message : ''} setShowPopup={setShowPopup} showPopup={showPopup} />
        </>
    )
}

export default ViewStudent

// Styles for buttons
const styles = {
    attendanceButton: {
        marginLeft: "20px",
        backgroundColor: " #2196f3",
        "&:hover": {
            backgroundColor: " #2196f3",
        }
    },
    styledButton: {
        margin: "20px",
        backgroundColor: " #2196f3",
        "&:hover": {
            backgroundColor: " #2196f3",
        }
    }
}
