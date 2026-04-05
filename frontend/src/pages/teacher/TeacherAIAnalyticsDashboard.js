import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import {
    Box,
    Card,
    CardContent,
    Grid,
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
    LinearProgress,
    Tooltip,
    Button,
} from '@mui/material';
import {
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip as ChartTooltip,
    Legend,
    ResponsiveContainer,
    LineChart,
    Line,
} from 'recharts';
import WarningIcon from '@mui/icons-material/Warning';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import SchoolIcon from '@mui/icons-material/School';
import AssignmentIcon from '@mui/icons-material/Assignment';
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

const StatsCard = styled(Card)`
    background: white;
    border-radius: 12px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
    border-top: 4px solid ${({ color }) => color || '#2563eb'};
    height: 100%;
`;

const ChartCard = styled(Card)`
    background: white;
    border-radius: 12px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
    margin-bottom: 24px;
`;

const RiskBadge = styled.span`
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 6px 12px;
    border-radius: 20px;
    font-size: 0.85rem;
    font-weight: 500;
    
    &.high {
        background: #fee2e2;
        color: #7f1d1d;
    }
    
    &.medium {
        background: #fef08a;
        color: #854d0e;
    }
    
    &.low {
        background: #d1fae5;
        color: #065f46;
    }
`;

const COLORS = ['#10b981', '#f59e0b', '#ef4444'];

const TeacherAIAnalyticsDashboard = () => {
    const { currentUser } = useSelector((state) => state.user);
    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState('');
    const [selectedClass, setSelectedClass] = useState('');
    const [selectedSubject, setSelectedSubject] = useState('');

    const [stats, setStats] = useState({
        classStats: {},
        gradeDistribution: {},
        attendanceInsights: {},
    });

    const [atRiskStudents, setAtRiskStudents] = useState([]);
    const [weakTopics, setWeakTopics] = useState([]);
    const [recommendations, setRecommendations] = useState([]);

    // Fetch analytics data
    useEffect(() => {
        fetchAnalyticsData();
    }, [selectedClass, selectedSubject]);

    const fetchAnalyticsData = async () => {
        try {
            setLoading(true);

            const params = {};
            if (selectedClass) params.sclassId = selectedClass;
            if (selectedSubject) params.subjectId = selectedSubject;

            const [statsRes, atRiskRes, topicsRes, recsRes] = await Promise.all([
                axios.get('/api/AIAnalytics/ClassStats', {
                    params,
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
                }),
                axios.get('/api/AIAnalytics/AtRiskStudents', {
                    params,
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
                }),
                axios.get('/api/AIAnalytics/WeakTopics', {
                    params,
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
                }),
                axios.get('/api/AIAnalytics/Recommendations', {
                    params,
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
                }),
            ]);

            setStats(statsRes.data.stats || {});
            setAtRiskStudents(atRiskRes.data.students || []);
            setWeakTopics({
                weak: topicsRes.data.weakTopics || [],
                strong: topicsRes.data.strongTopics || [],
            });
            setRecommendations(recsRes.data.recommendations || []);
        } catch (error) {
            console.error('Error fetching analytics:', error);
            setErrorMessage('Không thể tải dữ liệu phân tích');
        } finally {
            setLoading(false);
        }
    };

    // Prepare chart data
    const gradeDistributionData = stats.gradeDistribution
        ? [
            { name: 'Xuất Sắc (9-10)', value: stats.gradeDistribution.excellent || 0 },
            { name: 'Tốt (7-9)', value: stats.gradeDistribution.good || 0 },
            { name: 'Bình Thường (5-7)', value: stats.gradeDistribution.average || 0 },
            { name: 'Yếu (<5)', value: stats.gradeDistribution.poor || 0 },
          ]
        : [];

    const classStats = stats.classStats || {};

    return (
        <PageContainer>
            <HeaderBox>
                <h1>📊 Phân tích Học tập AI</h1>
                <p>Thống kê học tập AI và các insights về lớp học</p>
            </HeaderBox>

            {errorMessage && (
                <Alert severity="error" sx={{ mb: 2 }} onClose={() => setErrorMessage('')}>
                    {errorMessage}
                </Alert>
            )}

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
                    <CircularProgress />
                </Box>
            ) : (
                <>
                    {/* Key Statistics */}
                    <Grid container spacing={2} sx={{ mb: 3 }}>
                        <Grid item xs={12} sm={6} md={3}>
                            <StatsCard color="#2563eb">
                                <CardContent>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                        <SchoolIcon sx={{ fontSize: 40, color: '#2563eb' }} />
                                        <Box>
                                            <Box sx={{ color: '#64748b', fontSize: '0.9rem' }}>
                                                Tổng số sinh viên
                                            </Box>
                                            <Box sx={{ fontSize: '1.8rem', fontWeight: 700 }}>
                                                {classStats.totalStudents || 0}
                                            </Box>
                                        </Box>
                                    </Box>
                                </CardContent>
                            </StatsCard>
                        </Grid>

                        <Grid item xs={12} sm={6} md={3}>
                            <StatsCard color="#10b981">
                                <CardContent>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                        <AssignmentIcon sx={{ fontSize: 40, color: '#10b981' }} />
                                        <Box>
                                            <Box sx={{ color: '#64748b', fontSize: '0.9rem' }}>
                                                Điểm Trung Bình
                                            </Box>
                                            <Box sx={{ fontSize: '1.8rem', fontWeight: 700 }}>
                                                {classStats.averageGrade?.toFixed(1) || 0}
                                            </Box>
                                        </Box>
                                    </Box>
                                </CardContent>
                            </StatsCard>
                        </Grid>

                        <Grid item xs={12} sm={6} md={3}>
                            <StatsCard color="#f59e0b">
                                <CardContent>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                        <TrendingDownIcon sx={{ fontSize: 40, color: '#f59e0b' }} />
                                        <Box>
                                            <Box sx={{ color: '#64748b', fontSize: '0.9rem' }}>
                                                Tỷ Lệ Đạt
                                            </Box>
                                            <Box sx={{ fontSize: '1.8rem', fontWeight: 700 }}>
                                                {classStats.passRate?.toFixed(1) || 0}%
                                            </Box>
                                        </Box>
                                    </Box>
                                </CardContent>
                            </StatsCard>
                        </Grid>

                        <Grid item xs={12} sm={6} md={3}>
                            <StatsCard color="#ef4444">
                                <CardContent>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                        <WarningIcon sx={{ fontSize: 40, color: '#ef4444' }} />
                                        <Box>
                                            <Box sx={{ color: '#64748b', fontSize: '0.9rem' }}>
                                                Tỷ Lệ Chuyên Cần
                                            </Box>
                                            <Box sx={{ fontSize: '1.8rem', fontWeight: 700 }}>
                                                {classStats.attendanceRate || 0}%
                                            </Box>
                                        </Box>
                                    </Box>
                                </CardContent>
                            </StatsCard>
                        </Grid>
                    </Grid>

                    {/* Charts */}
                    <Grid container spacing={3} sx={{ mb: 3 }}>
                        <Grid item xs={12} md={6}>
                            <ChartCard>
                                <CardContent>
                                    <h3 style={{ marginTop: 0, marginBottom: 16 }}>Phân bố Điểm</h3>
                                    <ResponsiveContainer width="100%" height={300}>
                                        <PieChart>
                                            <Pie
                                                data={gradeDistributionData}
                                                cx="50%"
                                                cy="50%"
                                                labelLine={false}
                                                label={({ name, value }) => `${name}: ${value}`}
                                                outerRadius={100}
                                                fill="#8884d8"
                                                dataKey="value"
                                            >
                                                {gradeDistributionData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <ChartTooltip />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </CardContent>
                            </ChartCard>
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <ChartCard>
                                <CardContent>
                                    <h3 style={{ marginTop: 0, marginBottom: 16 }}>Kq Học Tập Theo Chủ Đề</h3>
                                    <ResponsiveContainer width="100%" height={300}>
                                        <BarChart data={weakTopics.weak || []}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="topic" angle={-45} textAnchor="end" height={80} />
                                            <YAxis />
                                            <ChartTooltip />
                                            <Bar dataKey="difficulty" fill="#ef4444" name="Độ Khó" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </CardContent>
                            </ChartCard>
                        </Grid>
                    </Grid>

                    {/* At-Risk Students */}
                    <ChartCard>
                        <CardContent>
                            <h3 style={{ marginTop: 0, marginBottom: 16 }}>⚠️ Sinh viên Còn Yếu</h3>
                            {atRiskStudents.length === 0 ? (
                                <Alert severity="success">Không có sinh viên nào liên quan!</Alert>
                            ) : (
                                <TableContainer component={Paper} sx={{ borderRadius: '8px' }}>
                                    <Table>
                                        <TableHead sx={{ background: '#f1f5f9' }}>
                                            <TableRow>
                                                <TableCell><strong>Tên</strong></TableCell>
                                                <TableCell><strong>Mức Rủi Ro</strong></TableCell>
                                                <TableCell><strong>Điểm Hiện Tại</strong></TableCell>
                                                <TableCell><strong>Lý Do</strong></TableCell>
                                                <TableCell><strong>Chuyên Cần</strong></TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {atRiskStudents.map((student) => (
                                                <TableRow key={student.studentId} hover>
                                                    <TableCell>{student.studentName}</TableCell>
                                                    <TableCell>
                                                        <RiskBadge className={student.riskLevel}>
                                                            {student.riskLevel.toUpperCase()}
                                                        </RiskBadge>
                                                    </TableCell>
                                                    <TableCell>{student.currentGrade?.toFixed(1) || 0}</TableCell>
                                                    <TableCell>{student.reason}</TableCell>
                                                    <TableCell>
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                            <LinearProgress
                                                                variant="determinate"
                                                                value={student.attendanceRate || 0}
                                                                sx={{ flex: 1, minWidth: 100 }}
                                                            />
                                                            {student.attendanceRate || 0}%
                                                        </Box>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            )}
                        </CardContent>
                    </ChartCard>

                    {/* Weak Topics */}
                    <ChartCard>
                        <CardContent>
                            <h3 style={{ marginTop: 0, marginBottom: 16 }}>📚 Phân Tích Các Chủ Đề</h3>
                            <Grid container spacing={2}>
                                <Grid item xs={12} md={6}>
                                    <h4 style={{ color: '#ef4444' }}>Chủ Đề Yếu</h4>
                                    {weakTopics.weak?.length === 0 ? (
                                        <Alert severity="info">Không có chủ đề yếu</Alert>
                                    ) : (
                                        <Box>
                                            {weakTopics.weak?.map((topic, idx) => (
                                                <Box key={idx} sx={{ mb: 2 }}>
                                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                                        <strong>{topic.topic}</strong>
                                                        <Chip
                                                            label={`${topic.studentCount} sinh viên`}
                                                            size="small"
                                                            color="error"
                                                        />
                                                    </Box>
                                                    <LinearProgress
                                                        variant="determinate"
                                                        value={topic.difficulty * 10}
                                                        sx={{ height: 8, borderRadius: 4 }}
                                                    />
                                                    <Box sx={{ fontSize: '0.85rem', Color: '#64748b', mt: 1 }}>
                                                        {topic.suggestedRevision}
                                                    </Box>
                                                </Box>
                                            ))}
                                        </Box>
                                    )}
                                </Grid>

                                <Grid item xs={12} md={6}>
                                    <h4 style={{ color: '#10b981' }}>Chủ Đề Mạnh</h4>
                                    {weakTopics.strong?.length === 0 ? (
                                        <Alert severity="info">Không có chủ đề mạnh</Alert>
                                    ) : (
                                        <Box>
                                            {weakTopics.strong?.map((topic, idx) => (
                                                <Box key={idx} sx={{ mb: 2 }}>
                                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                                        <strong>{topic.topic}</strong>
                                                        <Chip
                                                            label={`${topic.studentCount} sinh viên`}
                                                            size="small"
                                                            color="success"
                                                        />
                                                    </Box>
                                                    <LinearProgress
                                                        variant="determinate"
                                                        value={topic.masteryLevel * 10}
                                                        sx={{
                                                            height: 8,
                                                            borderRadius: 4,
                                                            backgroundColor: '#e0e0e0',
                                                            '& .MuiLinearProgress-bar': {
                                                                backgroundColor: '#10b981',
                                                            },
                                                        }}
                                                    />
                                                </Box>
                                            ))}
                                        </Box>
                                    )}
                                </Grid>
                            </Grid>
                        </CardContent>
                    </ChartCard>

                    {/* Recommendations */}
                    <ChartCard>
                        <CardContent>
                            <h3 style={{ marginTop: 0, marginBottom: 16 }}>💡 Gợi Ý từ AI</h3>
                            {recommendations.length === 0 ? (
                                <Alert severity="info">Không có gợi ý</Alert>
                            ) : (
                                <Box>
                                    {recommendations.map((rec, idx) => (
                                        <Box
                                            key={idx}
                                            sx={{
                                                p: 2,
                                                mb: 2,
                                                background: '#f0f9ff',
                                                border: '1px solid #bfdbfe',
                                                borderRadius: '8px',
                                                display: 'flex',
                                                gap: 2,
                                            }}
                                        >
                                            <Box sx={{ fontSize: '1.5rem' }}>💭</Box>
                                            <Box>{rec}</Box>
                                        </Box>
                                    ))}
                                </Box>
                            )}
                        </CardContent>
                    </ChartCard>
                </>
            )}
        </PageContainer>
    );
};

export default TeacherAIAnalyticsDashboard;
