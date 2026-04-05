import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Tooltip,
  Chip,
  LinearProgress,
  Alert,
  Dialog,
  TextField,
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import DeleteIcon from "@mui/icons-material/Delete";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CircularProgress from "@mui/material/CircularProgress";
import styled from "styled-components";
import curriculumService from "../../../services/curriculumService";

const UploadBox = styled(Box)`
  border: 2px dashed #cbd5e1;
  border-radius: 8px;
  padding: 40px 20px;
  text-align: center;
  background-color: #f8fafc;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    border-color: #2563eb;
    background-color: #eef2ff;
  }

  &.drag-over {
    border-color: #2563eb;
    background-color: #e0e7ff;
  }
`;

const DocumentUpload = ({
  curriculumId,
  documents: initialDocuments,
  onDocumentUploaded,
  onDocumentDeleted,
}) => {
  const [documents, setDocuments] = useState(initialDocuments || []);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [documentName, setDocumentName] = useState("");
  const [uploadingFile, setUploadingFile] = useState(null);
  const [openNameDialog, setOpenNameDialog] = useState(false);

  useEffect(() => {
    setDocuments(initialDocuments || []);
  }, [initialDocuments]);

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      validateAndPrepareUpload(files[0]);
    }
  };

  const validateAndPrepareUpload = (file) => {
    const allowedExtensions = ["pdf", "docx", "pptx", "xlsx", "txt"];
    const fileExt = file.name.split(".").pop().toLowerCase();

    if (!allowedExtensions.includes(fileExt)) {
      setError(
        `File type .${fileExt} is not allowed. Supported: PDF, DOCX, PPTX, XLSX, TXT`
      );
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      setError("File size must be less than 50 MB");
      return;
    }

    setError(null);
    setUploadingFile(file);
    setDocumentName(file.name);
    setOpenNameDialog(true);
  };

  const handleFileSelect = (files) => {
    if (files.length > 0) {
      validateAndPrepareUpload(files[0]);
      // Reset file input
      document.getElementById("file-input").value = "";
    }
  };

  const handleConfirmUpload = async () => {
    try {
      setIsUploading(true);
      setError(null);
      setOpenNameDialog(false);

      const response = await curriculumService.uploadDocument(
        curriculumId,
        uploadingFile,
        documentName
      );

      setDocuments(response.curriculum.documents || []);
      setUploadProgress(0);
      setUploadingFile(null);

      if (onDocumentUploaded) {
        onDocumentUploaded();
      }
    } catch (err) {
      console.error("Error uploading document:", err);
      setError(err.message || "Failed to upload document");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteDocument = async (docId) => {
    try {
      if (!window.confirm("Are you sure you want to delete this document?")) {
        return;
      }

      setDeleting(docId);
      setError(null);

      const response = await curriculumService.deleteDocument(
        curriculumId,
        docId
      );

      setDocuments(response.curriculum.documents || []);

      if (onDocumentDeleted) {
        onDocumentDeleted();
      }
    } catch (err) {
      console.error("Error deleting document:", err);
      setError(err.message || "Failed to delete document");
    } finally {
      setDeleting(null);
    }
  };

  const getFileIcon = (fileType) => {
    return <InsertDriveFileIcon sx={{ color: "#2563eb" }} />;
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  return (
    <Box>
      <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
        📤 Quản lý Tài liệu Giáo trình
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Upload Area */}
      <Card sx={{ mb: 3, border: "1px solid #e0e7ff" }}>
        <CardContent>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
            Tải lên Tài liệu
          </Typography>
          <UploadBox
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() =>
              !isUploading &&
              document.getElementById("file-input").click()
            }
            className={dragOver ? "drag-over" : ""}
            sx={{ opacity: isUploading ? 0.6 : 1, pointerEvents: isUploading ? "none" : "auto" }}
          >
            <CloudUploadIcon sx={{ fontSize: 48, color: "#94a3b8", mb: 1 }} />
            <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
              Kéo và thả tệp vào đây hoặc nhấp để chọn
            </Typography>
            <Typography variant="caption" sx={{ color: "#94a3b8" }}>
              Hỗ trợ: PDF, Word (.docx), PowerPoint (.pptx), Excel (.xlsx), Text (.txt) • Max 50 MB
            </Typography>
            <input
              id="file-input"
              type="file"
              style={{ display: "none" }}
              onChange={(e) => handleFileSelect(Array.from(e.target.files))}
              accept=".pdf,.docx,.pptx,.xlsx,.txt"
              disabled={isUploading}
            />
          </UploadBox>

          {isUploading && (
            <Box sx={{ mt: 2 }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1, alignItems: "center" }}>
                <Typography variant="caption">Đang tải lên...</Typography>
                <Typography variant="caption" sx={{ fontWeight: 600 }}>
                  {uploadProgress}%
                </Typography>
              </Box>
              <LinearProgress variant="determinate" value={uploadProgress} />
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Documents List */}
      <Card sx={{ border: "1px solid #e0e7ff" }}>
        <CardContent>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
            Danh sách Tài liệu ({documents.length})
          </Typography>

          {documents.length === 0 ? (
            <Typography
              variant="body2"
              sx={{ color: "#94a3b8", textAlign: "center", py: 3 }}
            >
              Chưa có tài liệu nào. Vui lòng tải lên tài liệu.
            </Typography>
          ) : (
            <List sx={{ width: "100%" }}>
              {documents.map((doc) => (
                <ListItem
                  key={doc._id || doc.id}
                  secondaryAction={
                    <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                      <Tooltip title="Xóa">
                        <IconButton
                          edge="end"
                          size="small"
                          onClick={() =>
                            handleDeleteDocument(doc._id || doc.id)
                          }
                          sx={{ color: "#ef4444" }}
                          disabled={deleting === (doc._id || doc.id)}
                        >
                          {deleting === (doc._id || doc.id) ? (
                            <CircularProgress size={20} />
                          ) : (
                            <DeleteIcon fontSize="small" />
                          )}
                        </IconButton>
                      </Tooltip>
                    </Box>
                  }
                  sx={{ mb: 1, bgcolor: "#f8fafc", borderRadius: 1 }}
                >
                  <ListItemIcon>{getFileIcon(doc.fileType)}</ListItemIcon>
                  <ListItemText
                    primary={doc.name || doc.originalFilename}
                    secondary={
                      <Box
                        sx={{
                          display: "flex",
                          gap: 1,
                          mt: 0.5,
                          alignItems: "center",
                          flexWrap: "wrap",
                        }}
                      >
                        <Typography variant="caption" sx={{ color: "#94a3b8" }}>
                          {new Date(
                            doc.uploadDate
                          ).toLocaleDateString("vi-VN")}
                        </Typography>
                        <Typography variant="caption" sx={{ color: "#94a3b8" }}>
                          •
                        </Typography>
                        <Typography variant="caption" sx={{ color: "#94a3b8" }}>
                          {formatFileSize(doc.fileSize)}
                        </Typography>
                        <Typography variant="caption" sx={{ color: "#94a3b8" }}>
                          •
                        </Typography>
                        <Chip
                          size="small"
                          label={doc.fileType.toUpperCase()}
                          variant="outlined"
                          sx={{ height: 20 }}
                        />
                        <Chip
                          icon={<CheckCircleIcon />}
                          label="Đã tải lên"
                          size="small"
                          color="success"
                          variant="outlined"
                          sx={{ height: 20 }}
                        />
                      </Box>
                    }
                  />
                </ListItem>
              ))}
            </List>
          )}
        </CardContent>
      </Card>

      {/* Document Name Dialog */}
      <Dialog
        open={openNameDialog}
        onClose={() => setOpenNameDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <Box sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
            Document Name
          </Typography>
          <TextField
            fullWidth
            label="Document Name"
            value={documentName}
            onChange={(e) => setDocumentName(e.target.value)}
            sx={{ mb: 2 }}
          />
          <Typography variant="caption" sx={{ color: "#94a3b8" }}>
            File: {uploadingFile?.name}
          </Typography>
          <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end", mt: 3 }}>
            <Button
              onClick={() => setOpenNameDialog(false)}
              disabled={isUploading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmUpload}
              variant="contained"
              sx={{ backgroundColor: "#2563eb" }}
              disabled={isUploading || !documentName.trim()}
            >
              {isUploading ? <CircularProgress size={24} /> : "Upload"}
            </Button>
          </Box>
        </Box>
      </Dialog>
    </Box>
  );
};

export default DocumentUpload;
