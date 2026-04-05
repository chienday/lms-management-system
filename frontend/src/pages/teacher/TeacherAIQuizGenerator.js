import React, { useState, useEffect } from 'react';
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
    Rating,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Checkbox,
    FormControlLabel,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ClearIcon from '@mui/icons-material/Clear';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import CreateNewFolderIcon from '@mui/icons-material/CreateNewFolder';
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
        color: #1e3a8a;
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

const QuestionContainer = styled(Box)`
    background: #f8fafc;
    padding: 16px;
    border-radius: 8px;
    border-left: 4px solid #2563eb;
    margin-bottom: 16px;
`;

const StatusBadge = styled.span`
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 6px 12px;
    border-radius: 20px;
    font-size: 0.85rem;
    font-weight: 500;
    
    &.draft {
        background: #e5e7eb;
        color: #374151;
    }
    
    &.approved {
        background: #d1fae5;
        color: #065f46;
    }
    
    &.rejected {
        background: #fee2e2;
        color: #7f1d1d;
    }
`;

const TeacherAIQuizGenerator = () => {
    const { currentUser } = useSelector((state) => state.user);
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [openGenerateDialog, setOpenGenerateDialog] = useState(false);
    const [openCreateQuizDialog, setOpenCreateQuizDialog] = useState(false);
    const [selectedQuestions, setSelectedQuestions] = useState([]);
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    const [generateFormData, setGenerateFormData] = useState({
        lectureId: '',
        topic: '',
        quantity: 5,
        difficulty: 'medium',
        subjectId: '',
        sclassId: '',
        questionTypes: ['multiple_choice'],
    });

    const [quizFormData, setQuizFormData] = useState({
        title: '',
        description: '',
        dueDate: '',
        time_limit: 60,
        subjectId: '',
        sclassId: '',
    });

    // Fetch questions on component mount
    useEffect(() => {
        fetchAIQuestions();
    }, []);

    const fetchAIQuestions = async () => {
        try {
            setLoading(true);
            const response = await axios.get('/api/AIQuestions', {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
            });
            setQuestions(response.data.questions || []);
        } catch (error) {
            console.error('Error fetching questions:', error);
            setErrorMessage('Không thể tải câu hỏi');
        } finally {
            setLoading(false);
        }
    };

    const handleGenerateQuestions = async () => {
        try {
            if (!generateFormData.lectureId && !generateFormData.topic) {
                setErrorMessage('Vui lòng chọn tài liệu hoặc nhập chủ đề');
                return;
            }

            setLoading(true);
            const response = await axios.post('/api/AIQuiz/GenerateQuestions', generateFormData, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
            });

            setSuccessMessage(`${response.data.questions.length} câu hỏi được sinh thành công!`);
            setOpenGenerateDialog(false);
            resetGenerateForm();
            fetchAIQuestions();
        } catch (error) {
            console.error('Error generating questions:', error);
            setErrorMessage('Không thể sinh câu hỏi');
        } finally {
            setLoading(false);
        }
    };

    const handleReviewQuestion = async (questionId, approved, rating, comment) => {
        try {
            await axios.post(
                `/api/AIQuestion/${questionId}/Review`,
                { approved, rating, comment },
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                    },
                }
            );

            setSuccessMessage(approved ? 'Câu hỏi được duyệt!' : 'Câu hỏi bị từ chối!');
            fetchAIQuestions();
        } catch (error) {
            console.error('Error reviewing question:', error);
            setErrorMessage('Không thể duyệt câu hỏi');
        }
    };

    const handleCreateQuizFromAI = async () => {
        try {
            if (!quizFormData.title || selectedQuestions.length === 0) {
                setErrorMessage('Vui lòng nhập tiêu đề và chọn câu hỏi');
                return;
            }

            setLoading(true);
            const response = await axios.post(
                '/api/Quiz/CreateFromAI',
                {
                    ...quizFormData,
                    questionIds: selectedQuestions,
                },
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                    },
                }
            );

            setSuccessMessage('Quiz được tạo thành công!');
            setOpenCreateQuizDialog(false);
            setSelectedQuestions([]);
            resetQuizForm();
        } catch (error) {
            console.error('Error creating quiz:', error);
            setErrorMessage('Không thể tạo quiz');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteQuestion = async (questionId) => {
        if (!window.confirm('Bạn chắc chắn muốn xóa câu hỏi này?')) return;

        try {
            setLoading(true);
            await axios.delete(`/api/AIQuestion/${questionId}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
            });

            setSuccessMessage('Câu hỏi đã bị xóa thành công!');
            fetchAIQuestions();
        } catch (error) {
            console.error('Error deleting question:', error);
            setErrorMessage('Không thể xóa câu hỏi');
        } finally {
            setLoading(false);
        }
    };

    const resetGenerateForm = () => {
        setGenerateFormData({
            lectureId: '',
            topic: '',
            quantity: 5,
            difficulty: 'medium',
            subjectId: '',
            sclassId: '',
            questionTypes: ['multiple_choice'],
        });
    };

    const resetQuizForm = () => {
        setQuizFormData({
            title: '',
            description: '',
            dueDate: '',
            time_limit: 60,
            subjectId: '',
            sclassId: '',
        });
    };

    const approvedQuestions = questions.filter((q) => q.status === 'approved').length;

    return (
        <PageContainer>
            <HeaderBox>
                <h1>🤖 Tạo Quiz từ AI</h1>
                <p>Sinh và quản lý các câu hỏi quiz do AI tạo</p>
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

            {/* Action Buttons */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={6} md={3}>
                    <Button
                        fullWidth
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => setOpenGenerateDialog(true)}
                        sx={{
                            background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                            textTransform: 'none',
                            padding: '10px',
                            borderRadius: '8px',
                        }}
                    >
                        Sinh Câu Hỏi
                    </Button>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Button
                        fullWidth
                        variant="outlined"
                        startIcon={<CreateNewFolderIcon />}
                        onClick={() => setOpenCreateQuizDialog(true)}
                        disabled={approvedQuestions === 0}
                        sx={{
                            textTransform: 'none',
                            borderRadius: '8px',
                        }}
                    >
                        Tạo Quiz ({approvedQuestions})
                    </Button>
                </Grid>
            </Grid>

            {/* Generate Questions Dialog */}
            <Dialog open={openGenerateDialog} onClose={() => setOpenGenerateDialog(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Sinh Câu Hỏi từ AI</DialogTitle>
                <DialogContent sx={{ pt: 2 }}>
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Chủ đề"
                                placeholder="Nhập chủ đề hoặc để trống để sử dụng giáo trình"
                                value={generateFormData.topic}
                                onChange={(e) =>
                                    setGenerateFormData({ ...generateFormData, topic: e.target.value })
                                }
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <FormControl fullWidth>
                                <InputLabel>Độ khó</InputLabel>
                                <Select
                                    value={generateFormData.difficulty}
                                    onChange={(e) =>
                                        setGenerateFormData({
                                            ...generateFormData,
                                            difficulty: e.target.value,
                                        })
                                    }
                                    label="Độ khó"
                                >
                                    <MenuItem value="easy">Dễ</MenuItem>
                                    <MenuItem value="medium">Trung bình</MenuItem>
                                    <MenuItem value="hard">Khó</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Số lượng"
                                type="number"
                                value={generateFormData.quantity}
                                onChange={(e) =>
                                    setGenerateFormData({
                                        ...generateFormData,
                                        quantity: parseInt(e.target.value),
                                    })
                                }
                                inputProps={{ min: 1, max: 50 }}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={generateFormData.questionTypes.includes('multiple_choice')}
                                        onChange={(e) => {
                                            const types = e.target.checked
                                                ? ['multiple_choice']
                                                : [];
                                            setGenerateFormData({
                                                ...generateFormData,
                                                questionTypes: types,
                                            });
                                        }}
                                    />
                                }
                                label="Trắc Nghiệm"
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenGenerateDialog(false)}>Hủy</Button>
                    <Button
                        onClick={handleGenerateQuestions}
                        variant="contained"
                        disabled={loading}
                    >
                        {loading ? <CircularProgress size={24} /> : 'Sinh'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Create Quiz Dialog */}
            <Dialog open={openCreateQuizDialog} onClose={() => setOpenCreateQuizDialog(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Tạo Quiz từ Câu Hỏi AI</DialogTitle>
                <DialogContent sx={{ pt: 2 }}>
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Tên Quiz"
                                value={quizFormData.title}
                                onChange={(e) =>
                                    setQuizFormData({ ...quizFormData, title: e.target.value })
                                }
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Mô tả"
                                multiline
                                rows={3}
                                value={quizFormData.description}
                                onChange={(e) =>
                                    setQuizFormData({ ...quizFormData, description: e.target.value })
                                }
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Hạn chót"
                                type="datetime-local"
                                InputLabelProps={{ shrink: true }}
                                value={quizFormData.dueDate}
                                onChange={(e) =>
                                    setQuizFormData({ ...quizFormData, dueDate: e.target.value })
                                }
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Giới hạn thời gian (phút)"
                                type="number"
                                value={quizFormData.time_limit}
                                onChange={(e) =>
                                    setQuizFormData({
                                        ...quizFormData,
                                        time_limit: parseInt(e.target.value),
                                    })
                                }
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <Alert severity="info">
                                {selectedQuestions.length} câu hỏi được chọn
                            </Alert>
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenCreateQuizDialog(false)}>Hủy</Button>
                    <Button
                        onClick={handleCreateQuizFromAI}
                        variant="contained"
                        disabled={loading || selectedQuestions.length === 0}
                    >
                        {loading ? <CircularProgress size={24} /> : 'Tạo Quiz'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Questions List */}
            <FormCard>
                <CardContent>
                    <h2 style={{ marginTop: 0, marginBottom: 16, color: '#1e3a8a' }}>
                        Câu Hỏi Được Sinh từ AI
                    </h2>
                    {loading && questions.length === 0 ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
                            <CircularProgress />
                        </Box>
                    ) : questions.length === 0 ? (
                        <Alert severity="info">Chưa có câu hỏi AI nào được sinh</Alert>
                    ) : (
                        <Box>
                            {questions.map((question) => (
                                <Accordion key={question._id} defaultExpanded={false}>
                                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                                            <Checkbox
                                                checked={selectedQuestions.includes(question._id)}
                                                onChange={(e) => {
                                                    if (e.target.checked) {
                                                        setSelectedQuestions([
                                                            ...selectedQuestions,
                                                            question._id,
                                                        ]);
                                                    } else {
                                                        setSelectedQuestions(
                                                            selectedQuestions.filter(
                                                                (id) => id !== question._id
                                                            )
                                                        );
                                                    }
                                                }}
                                                onClick={(e) => e.stopPropagation()}
                                            />
                                            <Box sx={{ flex: 1 }}>
                                                <Box>{question.question}</Box>
                                                <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                                                    <Chip
                                                        label={question.difficulty}
                                                        size="small"
                                                        variant="outlined"
                                                    />
                                                    <StatusBadge className={question.status}>
                                                        {question.status}
                                                    </StatusBadge>
                                                </Box>
                                            </Box>
                                        </Box>
                                    </AccordionSummary>
                                    <AccordionDetails>
                                        <Grid container spacing={2}>
                                            <Grid item xs={12}>
                                                <strong>Tùy chọn:</strong>
                                                {question.options?.map((opt, idx) => (
                                                    <Box key={idx} sx={{ ml: 2, mt: 1 }}>
                                                        {opt.isCorrect && <CheckCircleIcon sx={{ mr: 1 }} />}
                                                        {opt.text}
                                                    </Box>
                                                ))}
                                            </Grid>
                                            <Grid item xs={12}>
                                                <strong>Giải thích:</strong>
                                                <Box sx={{ mt: 1 }}>{question.explanation}</Box>
                                            </Grid>
                                            {question.status === 'draft' && (
                                                <Grid item xs={12}>
                                                    <Box sx={{ display: 'flex', gap: 1 }}>
                                                        <Button
                                                            size="small"
                                                            variant="contained"
                                                            startIcon={<ThumbUpIcon />}
                                                            onClick={() =>
                                                                handleReviewQuestion(
                                                                    question._id,
                                                                    true,
                                                                    5,
                                                                    'Câu hỏi tốt'
                                                                )
                                                            }
                                                        >
                                                            Duyệt
                                                        </Button>
                                                        <Button
                                                            size="small"
                                                            variant="outlined"
                                                            color="error"
                                                            startIcon={<ClearIcon />}
                                                            onClick={() =>
                                                                handleReviewQuestion(
                                                                    question._id,
                                                                    false,
                                                                    1,
                                                                    'Cần chỉnh sửa'
                                                                )
                                                            }
                                                        >
                                                            Từ chối
                                                        </Button>
                                                        <Button
                                                            size="small"
                                                            startIcon={<DeleteIcon />}
                                                            onClick={() =>
                                                                handleDeleteQuestion(question._id)
                                                            }
                                                        >
                                                            Xóa
                                                        </Button>
                                                    </Box>
                                                </Grid>
                                            )}
                                        </Grid>
                                    </AccordionDetails>
                                </Accordion>
                            ))}
                        </Box>
                    )}
                </CardContent>
            </FormCard>
        </PageContainer>
    );
};

export default TeacherAIQuizGenerator;
