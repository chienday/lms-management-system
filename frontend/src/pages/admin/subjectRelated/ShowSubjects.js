
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { getSubjectList } from "../../../redux/sclassRelated/sclassHandle";
import { deleteUser } from "../../../redux/userRelated/userHandle";
import PostAddIcon from "@mui/icons-material/PostAdd";
import { Paper, Box, IconButton, Table, TableHead, TableBody, TableRow, TableCell, Typography, Chip, Dialog, DialogTitle, DialogContent, DialogActions, Button, TableContainer, TablePagination } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import VisibilityIcon from "@mui/icons-material/Visibility";
import EditIcon from "@mui/icons-material/Edit";
import TableTemplate from "../../../components/TableTemplate";
import {
  BlueButton,
  GreenButton,
  ButtonContainer,
} from "../../../components/buttonStyles";
import SpeedDialTemplate from "../../../components/SpeedDialTemplate";
import Popup from "../../../components/Popup";

const ShowSubjects = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { subjectsList, loading, error, response } = useSelector(
    (state) => state.sclass
  );
  const { currentUser } = useSelector((state) => state.user);

  useEffect(() => {
    // Fetch all subjects when the component mounts
    dispatch(getSubjectList(currentUser._id, "AllSubjects"));
  }, [currentUser._id, dispatch]);

  // Log any errors to the console
  if (error) {
    console.log(error);
  }

  // State for managing popup messages
  const [showPopup, setShowPopup] = useState(false);
  const [message, setMessage] = useState("");

  // State for delete dialog
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [subjectToDelete, setSubjectToDelete] = useState(null);

  // State for pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  // Function to handle subject deletion
  const deleteHandler = (deleteID, address) => {
    console.log(deleteID);
    console.log(address);

    // Dispatch action to delete a subject
    dispatch(deleteUser(deleteID, address))
      .then(() => {
        // After deletion, fetch the updated list of subjects
        dispatch(getSubjectList(currentUser._id, "AllSubjects"));
        setMessage("Xóa môn học thành công!");
        setShowPopup(true);
      })
  };

  const handleDeleteClick = (subject) => {
    setSubjectToDelete(subject);
    setOpenDeleteDialog(true);
  };

  const handleConfirmDelete = () => {
    if (subjectToDelete) {
      deleteHandler(subjectToDelete._id, "Subject");
      setOpenDeleteDialog(false);
      setSubjectToDelete(null);
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

  // Get paginated subjects list
  const displaySubjects = Array.isArray(subjectsList)
    ? subjectsList.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
    : [];

  // Count classes for a subject
  const countClasses = (subject) => {
    return subject.classes?.length || 0;
  };

  // Count unique teachers for a subject
  const countTeachers = (subject) => {
    return subject.teachers?.length || 0;
  };

  // Render the component - use custom table instead of TableTemplate
  return (
    <>
      {loading ? (
        <div style={{ textAlign: "center", padding: "20px" }}>⏳ Đang tải...</div>
      ) : response ? (
        <Box sx={{ display: "flex", justifyContent: "center", marginTop: "16px" }}>
          <ButtonContainer>
            <GreenButton
              variant="contained"
              onClick={() => navigate("/Admin/subjects/chooseclass")}
            >
              ➕ Thêm môn học
            </GreenButton>
          </ButtonContainer>
        </Box>
      ) : Array.isArray(subjectsList) && subjectsList.length > 0 ? (
        <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
          <Table>
              <TableHead sx={{ backgroundColor: "#f1f5f9" }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: "bold", minWidth: 170 }}>
                    📚 Tên môn
                  </TableCell>
                  <TableCell sx={{ fontWeight: "bold", minWidth: 120 }}>
                    Mã môn
                  </TableCell>
                  <TableCell align="center" sx={{ fontWeight: "bold", minWidth: 100 }}>
                    Số lớp
                  </TableCell>
                  <TableCell align="center" sx={{ fontWeight: "bold", minWidth: 120 }}>
                    Số giáo viên
                  </TableCell>
                  <TableCell align="center" sx={{ fontWeight: "bold", minWidth: 150 }}>
                    Hành động
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {displaySubjects.map((subject) => (
                  <TableRow key={subject._id} hover>
                    <TableCell>
                      <Typography fontWeight={500}>{subject.subName}</Typography>
                    </TableCell>
                    <TableCell>{subject.subCode || "N/A"}</TableCell>
                    <TableCell align="center">
                      <Chip
                        label={countClasses(subject)}
                        size="small"
                        variant="outlined"
                        color="primary"
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={countTeachers(subject)}
                        size="small"
                        variant="outlined"
                        color="secondary"
                      />
                    </TableCell>
                    <TableCell align="center" sx={{ whiteSpace: "nowrap" }}>
                      <IconButton
                        size="small"
                        onClick={() =>
                          navigate(`/Admin/subjects/subject/${subject._id}`)
                        }
                        title="Xem chi tiết"
                        color="primary"
                      >
                        <VisibilityIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() =>
                          navigate(`/Admin/subjects/edit/${subject._id}`)
                        }
                        title="Chỉnh sửa"
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="success"
                        onClick={() =>
                          navigate(`/Admin/subjects/addclass/${subject._id}`)
                        }
                        title="Thêm lớp"
                      >
                        <AddIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDeleteClick(subject)}
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
            count={subjectsList.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </TableContainer>
      <Dialog 
        open={openDeleteDialog} 
        onClose={() => {
          setOpenDeleteDialog(false);
          setSubjectToDelete(null);
        }} 
        maxWidth="sm" 
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: "bold", color: "#d32f2f" }}>
          Xác nhận xóa môn học
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ mt: 2 }}>
            Bạn có chắc chắn muốn xóa môn học <strong>{subjectToDelete?.subName}</strong> (Mã: <strong>{subjectToDelete?.subCode}</strong>)?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={() => {
              setOpenDeleteDialog(false);
              setSubjectToDelete(null);
            }}
            variant="outlined"
          >
            Hủy
          </Button>
          <Button
            onClick={handleConfirmDelete}
            variant="contained"
            color="error"
          >
            Xóa
          </Button>
        </DialogActions>
      </Dialog>

      {/* Popup */}
      ) : (
        <Paper sx={{ p: 4, textAlign: "center" }}>
          <Typography color="text.secondary" sx={{ mb: 2 }}>
            📚 Chưa có môn học nào
          </Typography>
          <GreenButton
            variant="contained"
            onClick={() => navigate("/Admin/subjects/chooseclass")}
          >
            ➕ Tạo môn học mới
          </GreenButton>
        </Paper>
      )}
      <Popup
        message={message}
        setShowPopup={setShowPopup}
        showPopup={showPopup}
      />
    </>
  );
};

export default ShowSubjects;
