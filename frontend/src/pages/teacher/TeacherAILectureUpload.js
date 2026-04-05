import React, { useState } from 'react';
import styled from 'styled-components';
import {
    Box,
    Button,
    Card,
    CardContent,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControl,
    Grid,
    InputLabel,
    MenuItem,
    Select,
    TextField,
    CircularProgress,
    Alert,
    Chip,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    IconButton,
    Tooltip,
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import ErrorIcon from '@mui/icons-material/Error';
import { useSelector } from 'react-redux';
import axios from 'axios';

const PageContainer = styled(Box)`
    padding: 24px;
    background: #f1f5f9;
    min-height: 100vh;
`;

const HeaderBox = styled(Box)`
    margin-bottom: 32px;
    
    h1 {
        font-weight: 700;
        font-size: 2rem;
        color: #000000;
        margin: 0 0 8px 0;
    }
    
    p {
        color: #64748b;
        font-size: 0.95rem;
    }
`;

const FormCard = styled(Card)`
    background: white;
    border-radius: 12px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
    margin-bottom: 24px;
`;

const UploadArea = styled(Box)`
    border: 2px dashed #cbd5e1;
    border-radius: 8px;
    padding: 32px;
    text-align: center;
    cursor: pointer;
    transition: all 0.3s ease;
    background: #f8fafc;

    &:hover {
        border-color: #2563eb;
        background: #eff6ff;
    }

    &.active {
        border-color: #2563eb;
        background: #eff6ff;
    }

    svg {
        font-size: 48px;
        color: #2563eb;
        margin-bottom: 16px;
    }
`;

const StatusBadge = styled.span`
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 6px 12px;
    border-radius: 20px;
    font-size: 0.85rem;
    font-weight: 500;
    
    &.completed {
        background: #d1fae5;
        color: #065f46;
    }
    
    &.pending {
        background: #fef08a;
        color: #854d0e;
    }
    
    &.processing {
        background: #dbeafe;
        color: #0c4a6e;
    }
    
    &.failed {
        background: #fee2e2;
        color: #7f1d1d;
    }
`;

const TeacherAILectureUpload = () => {
    const { currentUser } = useSelector((state) => state.user);
    const [lectures, setLectures] = useState([]);
    const [loading, setLoading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [openDialog, setOpenDialog] = useState(false);
    const [editingLecture, setEditingLecture] = useState(null);
    const [fileSelected, setFileSelected] = useState(null);
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        content: '',
        topics: [],
        duration: 0,
        type: 'document',
        subjectId: '',
        sclassId: '',
    });

    // Fetch lectures on component mount
    React.useEffect(() => {
        fetchLectures();
    }, []);

    const fetchLectures = async () => {
        try {
            setLoading(true);
            // Replace with actual API endpoint
            const response = await axios.get('/api/Lectures', {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
            });
            setLectures(response.data.lectures || []);
        } catch (error) {
            console.error('Error fetching lectures:', error);
            setErrorMessage('Không thể tải giáo trình');
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            setFileSelected(file);
            setFormData({ ...formData, title: file.name.replace(/\.[^/.]+$/, '') });
        }
    };

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleTopicsChange = (e) => {
        const topics = e.target.value.split(',').map((t) => t.trim()).filter(Boolean);
        setFormData({ ...formData, topics });
    };

    const handleUpload = async () => {
        try {
            if (!fileSelected || !formData.subjectId) {
                setErrorMessage('Vui lòng chọn tập tin và môn học');
                return;
            }

            setLoading(true);
            const uploadFormData = new FormData();
            uploadFormData.append('lectureFile', fileSelected);
            uploadFormData.append('title', formData.title);
            uploadFormData.append('description', formData.description);
            uploadFormData.append('subjectId', formData.subjectId);
            uploadFormData.append('sclassId', formData.sclassId);
            uploadFormData.append('duration', formData.duration);
            uploadFormData.append('type', formData.type);

            const response = await axios.post(`/api/Lecture/1/Upload`, uploadFormData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
                onUploadProgress: (progressEvent) => {
                    const percentCompleted = Math.round(
                        (progressEvent.loaded * 100) / progressEvent.total
                    );
                    setUploadProgress(percentCompleted);
                },
            });

            setSuccessMessage('Tải giáo trình lên thành công!');
            setOpenDialog(false);
            resetForm();
            fetchLectures();
        } catch (error) {
            console.error('Error uploading lecture:', error);
            setErrorMessage('Không thể tải giáo trình lên');
        } finally {
            setLoading(false);
            setUploadProgress(0);
        }
    };

    const handleCreateLecture = async () => {
        try {
            if (!formData.title || !formData.subjectId) {
                setErrorMessage('Vui lòng nhập các trường bắt buộc');
                return;
            }

            setLoading(true);
            const response = await axios.post('/api/Lecture/Create', formData, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
            });

            setSuccessMessage('Giáo trình được tạo thành công!');
            setOpenDialog(false);
            resetForm();
            fetchLectures();
        } catch (error) {
            console.error('Error creating lecture:', error);
            setErrorMessage('Không thể tạo giáo trình');
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setFormData({
            title: '',
            description: '',
            content: '',
            topics: [],
            duration: 0,
            type: 'document',
            subjectId: '',
            sclassId: '',
        });
        setFileSelected(null);
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'completed':
                return <CheckCircleIcon />;
            case 'processing':
            case 'pending':
                return <HourglassEmptyIcon />;
            case 'failed':
                return <ErrorIcon />;
            default:
                return null;
        }
    };

    return (
        <PageContainer>
            <HeaderBox>
                <h1>📚 Quản lý Giáo trình</h1>
                <p>Upload và quản lý tài liệu giảng dạy để AI phân tích và sinh câu hỏi</p>
            </HeaderBox>

            {successMessage && (
                <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccessMessage('')}>
                    {successMessage}
                </Alert>
            )}
            {errorMessage && (
                <Alert severity="error" sx={{ mb: 2 }} onClose={() => setErrorMessage('')}>
                    {errorMessage}
                </Alert>
            )}

            <FormCard>
                <CardContent>
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <Button
                                variant="contained"
                                startIcon={<CloudUploadIcon />}
                                onClick={() => setOpenDialog(true)}
                                sx={{
                                    background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                                    textTransform: 'none',
                                    fontSize: '1rem',
                                    padding: '10px 20px',
                                    borderRadius: '8px',
                                }}
                            >
                                Thêm Giáo trình Mới
                            </Button>
                        </Grid>
                    </Grid>
                </CardContent>
            </FormCard>

            {/* Upload Dialog */}
            <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Upload Tài liệu Giảng dạy</DialogTitle>
                <DialogContent sx={{ pt: 2 }}>
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Tiêu đề"
                                name="title"
                                value={formData.title}
                                onChange={handleFormChange}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Mô tả"
                                name="description"
                                value={formData.description}
                                onChange={handleFormChange}
                                multiline
                                rows={3}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <FormControl fullWidth>
                                <InputLabel>Loại tài liệu</InputLabel>
                                <Select
                                    name="type"
                                    value={formData.type}
                                    onChange={handleFormChange}
                                    label="Loại tài liệu"
                                >
                                    <MenuItem value="video">Video</MenuItem>
                                    <MenuItem value="document">Tài liệu</MenuItem>
                                    <MenuItem value="presentation">Bài trình chiếu</MenuItem>
                                    <MenuItem value="text">Văn bản</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Thời lượng (phút)"
                                name="duration"
                                type="number"
                                value={formData.duration}
                                onChange={handleFormChange}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Chủ đề (cách nhau bằng dấu phẩy)"
                                value={formData.topics.join(', ')}
                                onChange={handleTopicsChange}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <UploadArea className={fileSelected ? 'active' : ''}>
                                <input
                                    type="file"
                                    onChange={handleFileChange}
                                    style={{ display: 'none' }}
                                    id="file-input"
                                />
                                <label htmlFor="file-input" style={{ cursor: 'pointer' }}>
                                    <CloudUploadIcon />
                                    {fileSelected ? (
                                        <div>{fileSelected.name}</div>
                                    ) : (
                                        <div>Kéo thả tập tin hoặc nhấp để chọn</div>
                                    )}
                                </label>
                            </UploadArea>
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDialog(false)}>Hủy</Button>
                    <Button
                        onClick={handleUpload}
                        variant="contained"
                        disabled={loading}
                        sx={{
                            background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                        }}
                    >
                        {loading ? <CircularProgress size={24} /> : 'Tải Lên'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Lectures List */}
            <FormCard>
                <CardContent>
                    <h2 style={{ marginTop: 0, marginBottom: 16, color: '#1e3a8a' }}>
                        Danh sách Giáo trình
                    </h2>
                    {loading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
                            <CircularProgress />
                        </Box>
                    ) : lectures.length === 0 ? (
                        <Alert severity="info">Chưa có giáo trình nào được upload</Alert>
                    ) : (
                        <TableContainer component={Paper} sx={{ borderRadius: '8px' }}>
                            <Table>
                                <TableHead sx={{ background: '#f1f5f9' }}>
                                    <TableRow>
                                        <TableCell><strong>Tiêu đề</strong></TableCell>
                                        <TableCell><strong>Môn học</strong></TableCell>
                                        <TableCell><strong>Loại</strong></TableCell>
                                        <TableCell><strong>Trạng thái</strong></TableCell>
                                        <TableCell align="center"><strong>Hành động</strong></TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {lectures.map((lecture) => (
                                        <TableRow key={lecture._id} hover>
                                            <TableCell>{lecture.title}</TableCell>
                                            <TableCell>{lecture.subject?.subName || 'N/A'}</TableCell>
                                            <TableCell>
                                                <Chip label={lecture.type} size="small" />
                                            </TableCell>
                                            <TableCell>
                                                <StatusBadge className={lecture.analysisStatus}>
                                                    {getStatusIcon(lecture.analysisStatus)}
                                                    {lecture.analysisStatus}
                                                </StatusBadge>
                                            </TableCell>
                                            <TableCell align="center">
                                                <Tooltip title="Xem">
                                                    <IconButton size="small">
                                                        <VisibilityIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="Chỉnh Sửa">
                                                    <IconButton size="small">
                                                        <EditIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="Xóa">
                                                    <IconButton size="small" color="error">
                                                        <DeleteIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    )}
                </CardContent>
            </FormCard>
        </PageContainer>
    );
};

export default TeacherAILectureUpload;
