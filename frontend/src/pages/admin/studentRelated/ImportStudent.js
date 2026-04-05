// Import necessary modules and components
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getAllSclasses } from '../../../redux/sclassRelated/sclassHandle';
import { getAllStudents } from '../../../redux/studentRelated/studentHandle';
import Popup from '../../../components/Popup';
import { CircularProgress, Box, Table, TableBody, TableHead, TableRow, Typography, Card, CardContent, Alert, TableCell } from '@mui/material';
import axios from 'axios';
import * as XLSX from 'xlsx';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import { GreenButton, BlueButton } from '../../../components/buttonStyles';
import styled from 'styled-components';

const PageContainer = styled(Box)`
  padding: 24px;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  min-height: 100vh;
`;

const HeaderBox = styled(Box)`
  margin-bottom: 24px;
`;

const ImportStudent = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { currentUser } = useSelector(state => state.user);
    const { sclassesList } = useSelector((state) => state.sclass);

    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState([]);
    const [results, setResults] = useState(null);
    const [loading, setLoading] = useState(false);
    const [showPopup, setShowPopup] = useState(false);
    const [message, setMessage] = useState("");
    const [step, setStep] = useState('upload'); // 'upload', 'preview', 'results'
    const [error, setError] = useState(null);

    const API_BASE_URL = process.env.NODE_ENV === 'production'
        ? "http://your-backend-api"
        : "http://localhost:5000";

    // Fetch all classes and students
    useEffect(() => {
        if (currentUser._id) {
            dispatch(getAllSclasses(currentUser._id, "Sclass"));
            dispatch(getAllStudents(currentUser._id));
        }
    }, [currentUser._id, dispatch]);

    // Handle file selection
    const handleFileChange = (event) => {
        const selectedFile = event.target.files[0];
        if (!selectedFile) return;

        const fileName = selectedFile.name;
        const fileExt = fileName.split('.').pop().toLowerCase();

        // Validate file type
        if (!['csv', 'xlsx', 'xls'].includes(fileExt)) {
            setError('Vui lòng chọn file CSV hoặc Excel (.xlsx, .xls)');
            return;
        }

        setFile(selectedFile);
        setError(null);

        // Read and parse file
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                let data = [];
                
                if (fileExt === 'csv') {
                    // Parse CSV
                    const text = e.target.result;
                    const lines = text.split('\n');
                    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
                    
                    for (let i = 1; i < lines.length; i++) {
                        if (lines[i].trim() === '') continue;
                        const values = lines[i].split(',').map(v => v.trim());
                        const row = {};
                        headers.forEach((header, index) => {
                            row[header] = values[index];
                        });
                        data.push(row);
                    }
                } else {
                    // Parse Excel
                    const workbook = XLSX.read(e.target.result, { type: 'binary' });
                    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
                    data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
                    
                    // Convert to object format
                    if (data.length > 0) {
                        const headers = data[0].map(h => String(h).trim().toLowerCase());
                        const rows = [];
                        for (let i = 1; i < data.length; i++) {
                            if (!data[i] || data[i].every(cell => !cell)) continue;
                            const row = {};
                            // eslint-disable-next-line no-loop-func
                            headers.forEach((header, index) => {
                                row[header] = data[i][index] || '';
                            });
                            rows.push(row);
                        }
                        data = rows;
                    }
                }

                // Validate and format data
                const formattedData = data.map((row, index) => {
                    const tên = row['tên'] || row['ten'] || row['name'] || '';
                    const mssv = row['mssv'] || row['rollnum'] || row['roll'] || '';
                    const email = row['email'] || '';
                    const mật_khẩu = row['mật khẩu'] || row['mat khau'] || row['password'] || '123456';
                    const lớp = row['lớp'] || row['lop'] || row['class'] || '';

                    // Find class ID by name
                    const selectedClass = sclassesList.find(c => 
                        c.sclassName?.toLowerCase() === lớp?.toLowerCase()
                    );
                    const sclassId = selectedClass?._id || '';

                    return {
                        name: tên,
                        rollNum: mssv,
                        email: email,
                        password: mật_khẩu || '123456',
                        sclassName: sclassId,
                        className: lớp,
                        rowIndex: index + 2
                    };
                });

                // Validate data
                const errors = [];
                formattedData.forEach((row, index) => {
                    if (!row.name) errors.push(`Hàng ${row.rowIndex}: Tên sinh viên trống`);
                    if (!row.rollNum) errors.push(`Hàng ${row.rowIndex}: MSSV trống`);
                    if (!row.sclassName) errors.push(`Hàng ${row.rowIndex}: Lớp không tồn tại`);
                });

                if (errors.length > 0) {
                    setError('Lỗi: ' + errors.slice(0, 3).join(', ') + (errors.length > 3 ? ` (+${errors.length - 3} lỗi khác)` : ''));
                    return;
                }

                setPreview(formattedData);
                setStep('preview');
                setError(null);
            } catch (error) {
                console.error('Parse error:', error);
                setError('Lỗi khi đọc file: ' + error.message);
            }
        };

        if (fileExt === 'csv') {
            reader.readAsText(selectedFile);
        } else {
            reader.readAsBinaryString(selectedFile);
        }
    };

    // Handle import
    const handleImport = async () => {
        if (preview.length === 0) {
            setMessage('Không có dữ liệu để nhập');
            setShowPopup(true);
            return;
        }

        setLoading(true);
        try {
            const response = await axios.post(
                `${API_BASE_URL}/Students/BulkImport/${currentUser._id}`,
                { students: preview }
            );

            if (response.data) {
                setResults(response.data.results || response.data);
                setStep('results');
            }
        } catch (error) {
            setMessage('Lỗi khi nhập dữ liệu: ' + error.message);
            setShowPopup(true);
        } finally {
            setLoading(false);
        }
    };

    // Reset form
    const handleReset = () => {
        setFile(null);
        setPreview([]);
        setResults(null);
        setStep('upload');
        setError(null);
    };

    // Download template
    const downloadTemplate = () => {
        const template = [
            ['Tên', 'MSSV', 'Email', 'Mật khẩu', 'Lớp'],
            ['Nguyễn Văn A', '123456', 'a@example.com', '123456', 'Lớp 10A'],
            ['Trần Thị B', '123457', 'b@example.com', '123456', 'Lớp 10A'],
        ];

        const ws = XLSX.utils.aoa_to_sheet(template);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Sinh viên");
        XLSX.writeFile(wb, "template_sinh_vien.xlsx");
    };

    // Render upload step
    const renderUpload = () => (
        <Box sx={{ p: 4, maxWidth: 600, mx: 'auto' }}>
            <Card elevation={2}>
                <CardContent>
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>
                        📥 Nhập danh sách sinh viên
                    </Typography>
                    <Typography variant="body2" color="textSecondary" paragraph>
                        Hỗ trợ các định dạng: CSV (.csv) hoặc Excel (.xlsx, .xls)
                    </Typography>

                    {error && <Alert severity="error" sx={{ mb: 2 }}>{typeof error === 'string' ? error : (error?.message ? error.message : 'Đã xảy ra lỗi')}</Alert>}

                    <Box sx={{ 
                        border: '2px dashed #ccc', 
                        borderRadius: 2, 
                        p: 4, 
                        textAlign: 'center',
                        backgroundColor: '#f9f9f9',
                        cursor: 'pointer',
                        transition: 'all 0.3s',
                        '&:hover': { borderColor: '#1976d2', backgroundColor: '#f0f7ff' }
                    }}>
                        <input
                            type="file"
                            accept=".csv,.xlsx,.xls"
                            onChange={handleFileChange}
                            style={{ display: 'none' }}
                            id="file-input"
                        />
                        <label htmlFor="file-input" style={{ cursor: 'pointer', width: '100%' }}>
                            <CloudUploadIcon sx={{ fontSize: 48, color: '#1976d2' }} />
                            <Typography variant="body1" sx={{ mt: 2 }}>
                                Kéo thả file vào đây hoặc click để chọn
                            </Typography>
                            {file && (
                                <Typography variant="body2" color="success.main">
                                    ✓ {file.name}
                                </Typography>
                            )}
                        </label>
                    </Box>

                    <Box sx={{ mt: 3 }}>
                        <GreenButton 
                            fullWidth 
                            onClick={downloadTemplate}
                            variant="outlined"
                        >
                            📥 Tải template
                        </GreenButton>
                    </Box>

                    <Typography variant="body2" sx={{ mt: 3, p: 2, backgroundColor: '#fffbea', borderRadius: 1 }}>
                        <strong>💡 Cột bắt buộc:</strong> Tên, MSSV, Lớp<br/>
                        <strong>💡 Cột tùy chọn:</strong> Email, Mật khẩu (mặc định: 123456)<br/>
                        <strong>💡 Lưu ý:</strong> Tên lớp phải khớp đúng với danh sách lớp hiện có
                    </Typography>
                </CardContent>
            </Card>
        </Box>
    );

    // Render preview step
    const renderPreview = () => (
        <Box sx={{ p: 4, maxWidth: 1000, mx: 'auto' }}>
            <Card elevation={2}>
                <CardContent>
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>
                        🔍 Xem trước dữ liệu ({preview.length} sinh viên)
                    </Typography>

                    <Box sx={{ overflowX: 'auto', mt: 2, maxHeight: 400, overflow: 'auto' }}>
                        <Table size="small">
                            <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                                <TableRow>
                                    <TableCell sx={{ fontWeight: 'bold' }}>Tên</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>MSSV</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>Email</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>Mật khẩu</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>Lớp</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {preview.slice(0, 50).map((row, idx) => (
                                    <TableRow key={idx} hover>
                                        <TableCell>{row.name}</TableCell>
                                        <TableCell>{row.rollNum}</TableCell>
                                        <TableCell>{row.email || 'N/A'}</TableCell>
                                        <TableCell>{'*'.repeat(Math.min(row.password?.length || 6, 6))}</TableCell>
                                        <TableCell>{row.className}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </Box>

                    {preview.length > 50 && (
                        <Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}>
                            ... và {preview.length - 50} sinh viên khác
                        </Typography>
                    )}

                    <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
                        <GreenButton 
                            onClick={handleImport}
                            disabled={loading}
                            fullWidth
                        >
                            {loading ? <CircularProgress size={24} /> : '✓ Nhập dữ liệu'}
                        </GreenButton>
                        <BlueButton 
                            onClick={handleReset}
                            fullWidth
                        >
                            ← Quay lại
                        </BlueButton>
                    </Box>
                </CardContent>
            </Card>
        </Box>
    );

    // Render results step
    const renderResults = () => (
        <Box sx={{ p: 4, maxWidth: 1000, mx: 'auto' }}>
            <Card elevation={2}>
                <CardContent>
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>
                        📊 Kết quả nhập
                    </Typography>

                    {results?.success?.length > 0 && (
                        <Box sx={{ mb: 3, p: 2, backgroundColor: '#e8f5e9', borderRadius: 1, border: '1px solid #4caf50' }}>
                            <Typography variant="body1" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <CheckCircleIcon color="success" />
                                <strong>✓ Thành công:</strong> {results.success.length} sinh viên
                            </Typography>
                        </Box>
                    )}

                    {results?.failed?.length > 0 && (
                        <Box sx={{ mb: 3, p: 2, backgroundColor: '#ffebee', borderRadius: 1, border: '1px solid #f44336' }}>
                            <Typography variant="body1" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <ErrorIcon color="error" />
                                <strong>⊗ Lỗi:</strong> {results.failed.length} sinh viên
                            </Typography>

                            <Box sx={{ mt: 2, overflowX: 'auto', maxHeight: 300, overflow: 'auto' }}>
                                <Table size="small">
                                    <TableHead sx={{ backgroundColor: '#ffe0b2' }}>
                                        <TableRow>
                                            <TableCell sx={{ fontWeight: 'bold' }}>MSSV</TableCell>
                                            <TableCell sx={{ fontWeight: 'bold' }}>Lỗi</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {results.failed.map((err, idx) => (
                                            <TableRow key={idx}>
                                                <TableCell>{err.rollNum}</TableCell>
                                                <TableCell>{err.error}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </Box>
                        </Box>
                    )}

                    <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
                        <GreenButton 
                            onClick={() => navigate("/Admin/students")}
                            fullWidth
                        >
                            ✓ Xem danh sách sinh viên
                        </GreenButton>
                        <BlueButton 
                            onClick={handleReset}
                            fullWidth
                        >
                            ← Nhập lại
                        </BlueButton>
                    </Box>
                </CardContent>
            </Card>
        </Box>
    );

    return (
        <PageContainer>
            <HeaderBox>
                <Typography variant="h4" fontWeight={700} gutterBottom>
                    Nhập sinh viên từ file
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    Nhập danh sách sinh viên từ file CSV hoặc Excel
                </Typography>
            </HeaderBox>

            {step === 'upload' && renderUpload()}
            {step === 'preview' && renderPreview()}
            {step === 'results' && renderResults()}
            
            <Popup message={message} setShowPopup={setShowPopup} showPopup={showPopup} />
        </PageContainer>
    );
};

export default ImportStudent;
