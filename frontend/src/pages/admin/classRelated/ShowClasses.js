// Import necessary modules and components
import { useEffect, useState } from 'react';
import axios from 'axios';
import {
  IconButton,
  Box,
  Chip,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Alert,
  Button,
  Typography,
} from '@mui/material';
import styled from 'styled-components';

import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { Add } from '@mui/icons-material';

import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import { deleteUser } from '../../../redux/userRelated/userHandle';
import { getAllSclasses } from '../../../redux/sclassRelated/sclassHandle';

import { GreenButton } from '../../../components/buttonStyles';
import Popup from '../../../components/Popup';

const REACT_APP_BASE_URL = "http://localhost:5000";

// ================= COMPONENT =================
const ShowClasses = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { sclassesList, loading, error, getresponse } = useSelector(
    (state) => state.sclass
  );
  const { currentUser } = useSelector((state) => state.user);

  const adminID = currentUser?._id;

  const [showPopup, setShowPopup] = useState(false);
  const [message, setMessage] = useState("");
  const [classStudentCounts, setClassStudentCounts] = useState({});
  const [editingClass, setEditingClass] = useState(null);
  const [editClassName, setEditClassName] = useState("");
  const [loadingCounts, setLoadingCounts] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  // ===== FETCH DATA =====
  useEffect(() => {
    if (adminID) {
      dispatch(getAllSclasses(adminID, "Sclass"));
    }
  }, [adminID, dispatch]);

  // ===== FETCH STUDENT COUNTS =====
  useEffect(() => {
    if (Array.isArray(sclassesList) && sclassesList.length > 0) {
      const fetchCounts = async () => {
        setLoadingCounts(true);
        const counts = {};
        try {
          for (const sclass of sclassesList) {
            try {
              const response = await axios.get(
                `${REACT_APP_BASE_URL}/Sclass/Students/${sclass._id}`
              );
              counts[sclass._id] = Array.isArray(response.data) ? response.data.length : 0;
            } catch (err) {
              console.error(`Error fetching students for class ${sclass._id}:`, err);
              counts[sclass._id] = 0;
            }
          }
          setClassStudentCounts(counts);
        } catch (err) {
          console.error("Error fetching student counts:", err);
        } finally {
          setLoadingCounts(false);
        }
      };
      fetchCounts();
    } else {
      setLoadingCounts(false);
    }
  }, [sclassesList]);

  if (error) {
    console.error("ShowClasses Error:", error);
  }

  if (!adminID) {
    console.warn("AdminID not available - currentUser might not be loaded yet");
  }

  // ===== DELETE HANDLER =====
  const deleteHandler = (deleteID, address) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa lớp học này?')) {
      dispatch(deleteUser(deleteID, address)).then(() => {
        setMessage('Xóa lớp học thành công');
        setShowPopup(true);
        dispatch(getAllSclasses(adminID, "Sclass"));
      });
    }
  };

  // ===== UPDATE CLASS NAME =====
  const handleUpdateClassName = async () => {
    if (!editClassName.trim() || !editingClass) {
      setMessage("Vui lòng nhập tên lớp");
      setShowPopup(true);
      return;
    }

    try {
      await axios.put(
        `${REACT_APP_BASE_URL}/Sclass/${editingClass._id}`,
        { sclassName: editClassName }
      );
      setMessage("Cập nhật lớp thành công");
      setShowPopup(true);
      setEditingClass(null);
      dispatch(getAllSclasses(adminID, "Sclass"));
    } catch (err) {
      setMessage("Lỗi cập nhật lớp");
      setShowPopup(true);
    }
  };

  // ===== PAGINATION HANDLERS =====
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // ===== TABLE ROWS =====
  const sclassRows =
    Array.isArray(sclassesList) && sclassesList.length > 0
      ? sclassesList.map((sclass) => ({
          name: sclass.sclassName,
          students: classStudentCounts[sclass._id] || 0,
          id: sclass._id,
          fullData: sclass,
        }))
      : [];

  // ===== PAGINATED ROWS =====
  const displayRows = sclassRows.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  // ===== RENDER =====
  return (
    <PageContainer>
      {!currentUser ? (
        <LoadingBox>
          <CircularProgress />
          <Typography sx={{ mt: 2 }}>Đang tải thông tin...</Typography>
        </LoadingBox>
      ) : error ? (
        <ErrorBox>
          <Typography color="error" variant="h6">Lỗi: {error.message || 'Không thể tải dữ liệu'}</Typography>
          <GreenButton 
            onClick={() => dispatch(getAllSclasses(adminID, "Sclass"))}
            sx={{ mt: 2 }}
          >
            Thử lại
          </GreenButton>
        </ErrorBox>
      ) : loading || loadingCounts ? (
        <LoadingBox>
          <CircularProgress />
          <Typography sx={{ mt: 2 }}>Đang tải dữ liệu lớp học...</Typography>
        </LoadingBox>
      ) : (
        <>
          {/* Header */}
          <HeaderBox>
            <Typography variant="h4" fontWeight={700} gutterBottom>
              Quản lý Lớp Học
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
              Tạo, chỉnh sửa và quản lý thông tin lớp học
            </Typography>
            {!adminID && (
              <Alert severity="warning">
                Không thể tải dữ liệu - Admin ID không xác định.
              </Alert>
            )}
          </HeaderBox>

          {/* Stats Cards */}
          

          {/* Create Button */}
          <Box sx={{ mb: 3 }}>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => navigate("/Admin/addclass")}
            >
              Tạo Lớp Mới
            </Button>
          </Box>

          {/* Content */}
          {getresponse ? (
            <Paper sx={{ p: 4, textAlign: "center", borderRadius: 2 }}>
              <Typography color="text.secondary" sx={{ mb: 2 }}>
                {adminID ? "Chưa có lớp học nào" : "Vui lòng tải lại trang"}
              </Typography>
            </Paper>
          ) : (
            <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: "#f1f5f9" }}>
                    <TableCell fontWeight="bold">Tên Lớp</TableCell>
                    <TableCell align="center" fontWeight="bold">Sinh Viên</TableCell>
                    <TableCell align="center" fontWeight="bold">Hành Động</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {displayRows.map((row) => (
                    <TableRow key={row.id} hover>
                      <TableCell>
                        <Typography fontWeight={500}>{row.name}</Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={row.students}
                          size="small"
                          variant="outlined"
                          color="primary"
                        />
                      </TableCell>
                      <TableCell align="center" sx={{ whiteSpace: "nowrap" }}>
                        <IconButton
                          size="small"
                          onClick={() => navigate(`/Admin/classes/class/${row.id}`)}
                          title="Xem chi tiết"
                          color="primary"
                        >
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => {
                            setEditingClass(row.fullData);
                            setEditClassName(row.fullData.sclassName);
                          }}
                          title="Chỉnh sửa"
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => deleteHandler(row.id, "Sclass")}
                          title="Xóa"
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={sclassRows.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
              />
            </TableContainer>
          )}
        </>
      )}

      {/* Edit Class Dialog */}
      <Dialog open={!!editingClass} onClose={() => setEditingClass(null)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 'bold' }}>
          Chỉnh Sửa Lớp Học
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <TextField
            fullWidth
            label="Tên lớp"
            value={editClassName}
            onChange={(e) => setEditClassName(e.target.value)}
            variant="outlined"
            placeholder="Ví dụ: 10A1"
            margin="normal"
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setEditingClass(null)}>Hủy</Button>
          <Button onClick={handleUpdateClassName} variant="contained">Cập Nhật</Button>
        </DialogActions>
      </Dialog>

      <Popup
        message={message}
        setShowPopup={setShowPopup}
        showPopup={showPopup}
      />
    </PageContainer>
  );
};

export default ShowClasses;

// ===== STYLED COMPONENTS =====
const PageContainer = styled.div`
  padding: 24px;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  min-height: 100vh;
`;

const HeaderBox = styled(Box)`
  margin-bottom: 24px;
`;

const LoadingBox = styled(Box)`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: 500px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
`;

const ErrorBox = styled(Box)`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: 400px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  border-left: 5px solid #ef5350;
  padding: 24px;
`;
