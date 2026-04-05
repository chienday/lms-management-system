import { useState, useEffect } from "react";
import { Paper, Chip, CircularProgress, Box, Typography, Button, Dialog, DialogTitle, DialogContent, DialogActions } from "@mui/material";
import { useSelector } from "react-redux";
import TableTemplate from "../../components/TableTemplate";

// Dynamic API base URL - works both locally and in Docker
const getApiBaseUrl = () => {
  // Check if running locally (development)
  const isDev = process.env.NODE_ENV === "development" ||
                window.location.hostname === "localhost" ||
                window.location.hostname === "127.0.0.1";

  if (isDev) {
    return "http://localhost:5000";
  }

  // In Docker container, use relative path (Nginx will proxy)
  // Frontend at port 3000 (localhost:3000) in Docker
  // Nginx can proxy to backend at port 5000
  return "/api";
};

const API_BASE_URL = getApiBaseUrl();

const TeacherLearningAnalytics = () => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [analyzingClassId, setAnalyzingClassId] = useState(null);
  const [classInsights, setClassInsights] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);

  const { currentUser } = useSelector((state) => state.user);
  const classId = currentUser?.teachSclass?._id;

  useEffect(() => {
    const fetchClassInsights = async () => {
      try {
        if (!classId) {
          setError("Không tìm thấy lớp học");
          setLoading(false);
          return;
        }

        // Use new /Chat/ClassInsights endpoint
        const response = await fetch(`${API_BASE_URL}/Chat/ClassInsights`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            teacherId: currentUser._id,
            classId: classId
          }),
        });

        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }

        const data = await response.json();

        // Transform insights data for table display
        if (data.insights && data.insights.length > 0) {
          const transformedRows = data.insights.map((insight, index) => ({
            id: index,
            studentId: insight.studentId,
            topic: insight.topic,
            insightType: insight.insightType,
            recommendation: insight.recommendation,
          }));
          setRows(transformedRows);
          setClassInsights(data);
        } else {
          setRows([]);
          setError("Không có dữ liệu phân tích");
        }
      } catch (err) {
        console.error("Error fetching class insights:", err);
        setError("Lỗi khi tải dữ liệu: " + err.message);
        setRows([]);
      } finally {
        setLoading(false);
      }
    };

    fetchClassInsights();
  }, [classId, currentUser._id]);

  const handleRefreshAnalysis = async () => {
    setAnalyzingClassId(classId);
    setError(null);

    try {
      // Re-fetch insights
      const response = await fetch(`${API_BASE_URL}/Chat/ClassInsights`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          teacherId: currentUser._id,
          classId: classId
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();

      if (data.insights && data.insights.length > 0) {
        const transformedRows = data.insights.map((insight, index) => ({
          id: index,
          studentId: insight.studentId,
          topic: insight.topic,
          insightType: insight.insightType,
          recommendation: insight.recommendation,
        }));
        setRows(transformedRows);
        setClassInsights(data);
      }
    } catch (err) {
      console.error("Analysis error:", err);
      setError("Lỗi phân tích: " + err.message);
    } finally {
      setAnalyzingClassId(null);
    }
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const columns = [
    { id: "studentId", label: "Mã/Tên SV", minWidth: 120 },
    { id: "topic", label: "Chủ đề", minWidth: 150 },
    { id: "insightType", label: "Loại gợi ý", minWidth: 120 },
    { id: "recommendation", label: "Khuyến nghị", minWidth: 280 },
  ];

  const getInsightTypeColor = (type) => {
    switch (type) {
      case "at_risk":
        return "error";
      case "weak_topic":
        return "warning";
      case "excelling":
        return "success";
      case "suggested_intervention":
        return "info";
      default:
        return "default";
    }
  };

  const getInsightTypeLabel = (type) => {
    const labels = {
      at_risk: "⚠️ Rủi ro",
      weak_topic: "📊 Điểm yếu",
      excelling: "⭐ Xuất sắc",
      suggested_intervention: "💡 Gợi ý can thiệp",
    };
    return labels[type] || type;
  };

  const RowRenderer = ({ row }) => (
    <Box>
      <Typography variant="body2" sx={{ fontWeight: 500 }}>
        {row.studentId}
      </Typography>
    </Box>
  );

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "400px" }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error && rows.length === 0) {
    return (
      <Box sx={{ padding: 2 }}>
        <Typography color="error" sx={{ marginBottom: 2 }}>
          {error}
        </Typography>
        <Button
          variant="contained"
          onClick={() => setError(null)}
        >
          Đóng lỗi
        </Button>
      </Box>
    );
  }

  return (
    <>
      <Paper sx={{ width: "100%", overflow: "hidden", p: 2 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            📊 Phân tích hiệu suất lớp học
          </Typography>
          <Button
            variant="contained"
            onClick={handleRefreshAnalysis}
            disabled={analyzingClassId === classId}
          >
            {analyzingClassId === classId ? "⏳ Đang phân tích..." : "🔄 Làm mới phân tích"}
          </Button>
        </Box>

        {error && rows.length > 0 && (
          <Paper sx={{ p: 1.5, mb: 2, backgroundColor: "#fff3cd" }}>
            <Typography variant="body2" sx={{ color: "#856404" }}>
              ⚠️ {error}
            </Typography>
          </Paper>
        )}

        <Box sx={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ backgroundColor: "#f5f5f5", borderBottom: "2px solid #ddd" }}>
                {columns.map((col) => (
                  <th key={col.id} style={{ padding: "12px", textAlign: "left", fontWeight: 600, minWidth: col.minWidth }}>
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, idx) => (
                <tr key={row.id} style={{ borderBottom: "1px solid #eee", backgroundColor: idx % 2 === 0 ? "white" : "#fafafa" }}>
                  <td style={{ padding: "12px" }}>{row.studentId}</td>
                  <td style={{ padding: "12px" }}>{row.topic}</td>
                  <td style={{ padding: "12px" }}>
                    <Chip
                      label={getInsightTypeLabel(row.insightType)}
                      color={getInsightTypeColor(row.insightType)}
                      size="small"
                      variant="outlined"
                    />
                  </td>
                  <td style={{ padding: "12px", fontSize: "0.9rem" }}>{row.recommendation}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Box>
      </Paper>
    </>
  );
};

export default TeacherLearningAnalytics;
