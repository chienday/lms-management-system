import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from "react-router-dom";
import { getAllStudents } from '../../../redux/studentRelated/studentHandle';
import { deleteUser } from '../../../redux/userRelated/userHandle';
import {
    Paper, Box, IconButton, Typography, Alert, CircularProgress, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, TablePagination
} from '@mui/material';
import PersonRemoveIcon from '@mui/icons-material/PersonRemove';
import { GreenButton, BlueButton } from '../../../components/buttonStyles';
import PersonAddAlt1Icon from '@mui/icons-material/PersonAddAlt1';
import LockIcon from '@mui/icons-material/Lock';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import Visibility from '@mui/icons-material/Visibility';
import PasswordIcon from '@mui/icons-material/Password';
import styled from "styled-components";

import * as React from 'react';
import Popup from '../../../components/Popup';
import axios from 'axios';

const PageContainer = styled(Box)`
  padding: 24px;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  min-height: 100vh;
`;

const HeaderBox = styled(Box)`
  margin-bottom: 24px;
`;
const ShowStudents = () => {

    const navigate = useNavigate()
    const dispatch = useDispatch();
    const { studentsList, loading, error, response } = useSelector((state) => state.student);
    const { currentUser } = useSelector(state => state.user)

    // Fetch all students when the component mounts
    useEffect(() => {
        dispatch(getAllStudents(currentUser._id));
    }, [currentUser._id, dispatch]);

    // Log any errors to the console
    if (error) {
        console.log(error);
    }

    const [showPopup, setShowPopup] = React.useState(false);

    // State for managing popup messages
    const [message, setMessage] = React.useState("");

    // State for pagination
    const [page, setPage] = React.useState(0);
    const [rowsPerPage, setRowsPerPage] = React.useState(5);

    // State for delete dialog
    const [openDeleteDialog, setOpenDeleteDialog] = React.useState(false);
    const [studentToDelete, setStudentToDelete] = React.useState(null);

    // State for reset password dialog
    const [openResetPasswordDialog, setOpenResetPasswordDialog] = React.useState(false);
    const [newPassword, setNewPassword] = React.useState("");
    const [selectedStudentForReset, setSelectedStudentForReset] = React.useState(null);

    const deleteHandler = (deleteID, address) => {
        console.log(deleteID);
        console.log(address);
        if (!currentUser?._id) {
            setMessage("Lỗi: Không thể xác định quản trị viên");
            setShowPopup(true);
            return;
        }
        dispatch(deleteUser(deleteID, address))
            .then(() => {
                dispatch(getAllStudents(currentUser._id));
            })
    }

    // Handle lock/unlock account
    const toggleLockStatus = async (studentId) => {
        try {
            const response = await axios.put(`http://localhost:5000/Student/Lock/${studentId}`);
            if (response.data) {
                setMessage(response.data.accountStatus === 'Active' ? 'Tài khoản đã mở khóa' : 'Tài khoản đã bị khóa');
                if (currentUser?._id) {
                    dispatch(getAllStudents(currentUser._id));
                }
            }
        } catch (err) {
            setMessage(err.response?.data?.message || 'Lỗi khi thay đổi trạng thái tài khoản');
        }
        setShowPopup(true);
    };

    // Handle open reset password dialog
    const handleOpenResetPasswordDialog = (student) => {
        if (!student || !student._id) {
            setMessage('Lỗi: Không thể xác định sinh viên');
            setShowPopup(true);
            return;
        }
        setSelectedStudentForReset(student);
        setNewPassword("");
        setOpenResetPasswordDialog(true);
    };

    // Handle reset password
    const handleResetPassword = async () => {
        if (!newPassword) {
            setMessage('Vui lòng nhập mật khẩu mới');
            setShowPopup(true);
            return;
        }

        if (!selectedStudentForReset?._id) {
            setMessage('Lỗi: Không thể xác định sinh viên');
            setShowPopup(true);
            return;
        }

        try {
            const response = await axios.put(`http://localhost:5000/Student/ResetPassword/${selectedStudentForReset._id}`, {
                studentId: selectedStudentForReset._id,
                newPassword: newPassword
            });
            if (response.data) {
                setMessage('Mật khẩu đã được đặt lại thành công');
                setOpenResetPasswordDialog(false);
                setNewPassword("");
                if (currentUser?._id) {
                    dispatch(getAllStudents(currentUser._id));
                }
            }
        } catch (err) {
            setMessage(err.response?.data?.message || 'Lỗi khi đặt lại mật khẩu');
        }
        setShowPopup(true);
    };

    const handleDeleteClick = (student) => {
        setStudentToDelete(student);
        setOpenDeleteDialog(true);
    };

    const handleConfirmDelete = () => {
        if (studentToDelete) {
            deleteHandler(studentToDelete._id, "Student");
            setOpenDeleteDialog(false);
            setStudentToDelete(null);
        }
    };

    // Pagination handlers
    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    // Get paginated student list
    const displayStudents = Array.isArray(studentsList) 
        ? studentsList.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
        : [];

 

    
    // Handle actions for student management
    return (
        <PageContainer>
            <HeaderBox>
                <Typography variant="h4" fontWeight={700} gutterBottom>
                    Quản lý sinh viên
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    Xem, thêm, chỉnh sửa và quản lý thông tin sinh viên
                </Typography>
            </HeaderBox>

            {error && (
                <Alert severity="error" onClose={() => console.log("dismiss")} sx={{ mb: 2 }}>
                    {typeof error === 'string' ? error : (error?.message ? error.message : 'Đã xảy ra lỗi')}
                </Alert>
            )}

            {loading ? (
                <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
                    <CircularProgress />
                </Box>
            ) : response ? (
                <Paper sx={{ p: 4, textAlign: "center", borderRadius: 2 }}>
                    <Typography color="text.secondary" sx={{ mb: 3 }}>
                        Hiện tại không có sinh viên nào
                    </Typography>
                    <Box sx={{ display: "flex", gap: 2, justifyContent: "center", flexWrap: "wrap" }}>
                        <Button 
                            variant="contained" 
                            startIcon={<PersonAddAlt1Icon />}
                            onClick={() => navigate("/Admin/addstudents")}
                        >
                            Thêm sinh viên
                        </Button>
                        <Button 
                            variant="contained"
                            startIcon={<FileDownloadIcon />}
                            onClick={() => navigate("/Admin/importstudents")}
                        >
                            Nhập từ file
                        </Button>
                    </Box>
                </Paper>
            ) : (
                <>
                    <Box sx={{ mb: 3, display: "flex", gap: 2 }}>
                        <Button 
                            variant="contained" 
                            startIcon={<PersonAddAlt1Icon />}
                            onClick={() => navigate("/Admin/addstudents")}
                        >
                            Thêm sinh viên
                        </Button>
                        <Button 
                            variant="contained"
                            startIcon={<FileDownloadIcon />}
                            onClick={() => navigate("/Admin/importstudents")}
                        >
                            Nhập từ file
                        </Button>
                    </Box>

                    <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
                        <Table>
                            <TableHead>
                                <TableRow sx={{ backgroundColor: "#f1f5f9" }}>
                                    <TableCell fontWeight="bold">Họ tên</TableCell>
                                    <TableCell fontWeight="bold">MSSV</TableCell>
                                    <TableCell fontWeight="bold">Email</TableCell>
                                    <TableCell fontWeight="bold">Lớp</TableCell>
                                    <TableCell align="center" fontWeight="bold">Trạng thái</TableCell>
                                    <TableCell align="center" fontWeight="bold">Hành động</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {displayStudents.length > 0 && displayStudents.map((student) => (
                                    <TableRow key={student._id} hover>
                                        <TableCell>
                                            <Typography fontWeight={500}>{student.name}</Typography>
                                        </TableCell>
                                        <TableCell>{student.rollNum}</TableCell>
                                        <TableCell>{student.email || 'N/A'}</TableCell>
                                        <TableCell>{student.sclassName?.sclassName || 'N/A'}</TableCell>
                                        <TableCell align="center">
                                            <Chip 
                                                label={student.accountStatus === 'Active' ? '✓ Hoạt động' : '⊗ Bị khóa'}
                                                color={student.accountStatus === 'Active' ? 'success' : 'error'}
                                                variant="outlined"
                                                size="small"
                                            />
                                        </TableCell>
                                        <TableCell align="center" sx={{ whiteSpace: "nowrap" }}>
                                            <IconButton
                                                size="small"
                                                onClick={() => navigate("/Admin/students/student/" + student._id)}
                                                title="Xem chi tiết"
                                                color="primary"
                                            >
                                                <Visibility fontSize="small" />
                                            </IconButton>
                                            <IconButton 
                                                size="small"
                                                onClick={() => toggleLockStatus(student._id)}
                                                title={student.accountStatus === 'Active' ? 'Khóa tài khoản' : 'Mở khóa tài khoản'}
                                            >
                                                {student.accountStatus === 'Active' ? <LockOpenIcon color="success" fontSize="small" /> : <LockIcon color="warning" fontSize="small" />}
                                            </IconButton>
                                            <IconButton 
                                                size="small"
                                                onClick={() => handleOpenResetPasswordDialog(student)}
                                                title="Đặt lại mật khẩu"
                                                color="info"
                                            >
                                                <PasswordIcon fontSize="small" />
                                            </IconButton>
                                            <IconButton
                                                size="small"
                                                onClick={() => handleDeleteClick(student)}
                                                title="Xóa sinh viên"
                                                color="error"
                                            >
                                                <PersonRemoveIcon fontSize="small" />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                    <TablePagination
                        rowsPerPageOptions={[5, 10, 25]}
                        component="div"
                        count={Array.isArray(studentsList) ? studentsList.length : 0}
                        rowsPerPage={rowsPerPage}
                        page={page}
                        onPageChange={handleChangePage}
                        onRowsPerPageChange={handleChangeRowsPerPage}
                    />
                </>
            )}

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
                        Reset mật khẩu cho sinh viên: <strong>{selectedStudentForReset?.name}</strong>
                    </Typography>
                    <TextField
                        label="Mật Khẩu Mới"
                        type="password"
                        fullWidth
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Nhập mật khẩu mới"
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

            <Popup message={message} setShowPopup={setShowPopup} showPopup={showPopup} />
        </PageContainer>
    );
};
// Export the component
export default ShowStudents;
