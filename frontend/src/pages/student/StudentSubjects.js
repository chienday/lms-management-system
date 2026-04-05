import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import {
    Box,
    Paper,
    Table,
    TableBody,
    TableContainer,
    TableHead,
    TableRow,
    TableCell,
    Typography,
    Alert,
} from '@mui/material';
import { StyledTableCell, StyledTableRow } from '../../components/styles';

const API_BASE_URL = process.env.NODE_ENV === 'development' 
    ? 'http://localhost:5000' 
    : '/api';

const StudentSubjects = () => {
    const { currentUser } = useSelector((state) => state.user);
    const [subjects, setSubjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (currentUser?._id) {
            loadStudentSubjects();
        }
    }, [currentUser?._id]);

    const loadStudentSubjects = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await fetch(`${API_BASE_URL}/Student/${currentUser._id}/Subjects`);
            const data = await response.json();

            if (data.subjects) {
                setSubjects(data.subjects);
            } else {
                setError(data.message || 'Không thể tải danh sách môn học');
            }
        } catch (err) {
            console.error('Error loading subjects:', err);
            setError(err.message || 'Lỗi khi tải môn học');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{
            padding: '24px',
        }}>
            {/* Header Section */}
            <Box sx={{
                marginBottom: '24px',
            }}>
                <Typography variant="h4" fontWeight={700} gutterBottom>
                    📘 Môn Học Của Tôi
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    Danh sách các môn học đã đăng ký trong hệ thống
                </Typography>
            </Box>

            {error && (
                <Alert severity="error" onClose={() => setError(null)} sx={{ mb: '16px' }}>
                    {error}
                </Alert>
            )}

            {subjects.length === 0 ? (
                <Alert severity="info">
                    Bạn chưa được đăng ký môn học nào. Vui lòng liên hệ quản trị viên.
                </Alert>
            ) : (
                <Paper sx={{ width: '100%', overflow: 'hidden' }}>
                    <TableContainer>
                        <Table stickyHeader aria-label="sticky table">
                            {/* Table Header */}
                            <TableHead>
                                <StyledTableRow>
                                    <StyledTableCell align="left" style={{ minWidth: 180 }}>
                                        Môn Học
                                    </StyledTableCell>
                                    <StyledTableCell align="left" style={{ minWidth: 100 }}>
                                        Mã Môn
                                    </StyledTableCell>
                                    <StyledTableCell align="left" style={{ minWidth: 150 }}>
                                        Giáo Viên
                                    </StyledTableCell>
                                    <StyledTableCell align="center" style={{ minWidth: 80 }}>
                                        Số Buổi
                                    </StyledTableCell>
                                    <StyledTableCell align="center" style={{ minWidth: 100 }}>
                                        Trạng Thái
                                    </StyledTableCell>
                                </StyledTableRow>
                            </TableHead>

                            {/* Table Body */}
                            <TableBody>
                                {subjects.map((subject) => (
                                    <StyledTableRow hover role="checkbox" tabIndex={-1} key={subject._id}>
                                        <TableCell align="left">
                                            <Typography variant="body2" fontWeight={500}>
                                                {subject.subName}
                                            </Typography>
                                        </TableCell>
                                        <TableCell align="left">
                                            <Typography variant="body2" fontWeight={600} sx={{ color: '#667eea' }}>
                                                {subject.subCode}
                                            </Typography>
                                        </TableCell>
                                        <TableCell align="left">
                                            <Typography variant="body2">
                                                {subject.teacher.name}
                                            </Typography>
                                        </TableCell>
                                        <TableCell align="center">
                                            <Typography variant="body2" fontWeight={600}>
                                                {subject.sessions || 0}
                                            </Typography>
                                        </TableCell>
                                        <TableCell align="center">
                                            <Typography 
                                                variant="body2" 
                                                fontWeight={600}
                                                sx={{
                                                    color: subject.status === 'active' ? '#22c55e' : '#ef4444',
                                                }}
                                            >
                                                {subject.status === 'active' ? '✓ Hoạt động' : '✗ Dừng'}
                                            </Typography>
                                        </TableCell>
                                    </StyledTableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Paper>
            )}
        </Box>
    );
};

export default StudentSubjects;
