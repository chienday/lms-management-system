import { useEffect, useMemo, useRef, useState } from "react";
import { useSelector } from "react-redux";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Divider,
  Avatar,
  Card,
  CardContent,
} from "@mui/material";
import styled, { keyframes, createGlobalStyle } from "styled-components";
import { Send, SmartToy, Person, Lightbulb } from "@mui/icons-material";

// ─── Global Style (ensure consistency with other pages) ──────────────
const GlobalStyle = createGlobalStyle`
  *, *::before, *::after {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  body {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    background: linear-gradient(145deg, #f8fafc 0%, #f1f5f9 100%);
    color: #0f172a;
    line-height: 1.5;
  }
`;

// ─── Animations ────────────────────────────────────────────────────────
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0); }
`;

const pulse = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
`;

const slideIn = keyframes`
  from { opacity: 0; transform: translateX(-20px); }
  to   { opacity: 1; transform: translateX(0); }
`;

// ─── Styled Components ────────────────────────────────────────────────
const ChatContainer = styled(Box)`
  width: 100%;
  animation: ${fadeIn} 0.6s cubic-bezier(0.2, 0.9, 0.4, 1.1);
`;

const ChatHeader = styled(Paper)`
  background: linear-gradient(135deg, #7c3aed 0%, #a855f7 100%);
  color: white;
  padding: 1rem 1.5rem;
  border-radius: 24px 24px 0 0;
  margin-bottom: 0;
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const ChatBody = styled(Paper)`
  border-radius: 0 0 24px 24px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.05);
  overflow: hidden;
  background: white;
`;

const MessagesArea = styled(Box)`
  height: 55vh;
  overflow-y: auto;
  padding: 1.5rem;
  background: #fafcff;
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const MessageBubble = styled(Box)`
  display: flex;
  gap: 0.75rem;
  align-items: flex-start;
  max-width: 85%;
  align-self: ${({ isUser }) => (isUser ? "flex-end" : "flex-start")};
`;

const MessageAvatar = styled(Avatar)`
  background: ${({ isUser }) => (isUser ? "#7c3aed" : "#94a3b8")};
  width: 36px;
  height: 36px;
`;

const MessageContent = styled(Paper)`
  padding: 0.75rem 1rem;
  border-radius: 20px;
  background: ${({ isUser }) => (isUser ? "#7c3aed" : "white")};
  color: ${({ isUser }) => (isUser ? "white" : "#0f172a")};
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  border: ${({ isUser }) => (isUser ? "none" : "1px solid #e2e8f0")};
`;

const InsightsContainer = styled(Card)`
  animation: ${slideIn} 0.5s ease;
  background: linear-gradient(135deg, #dcfce7 0%, #dcfce7 100%);
  border: 2px solid #22c55e;
  border-radius: 16px;
  align-self: flex-start;
  max-width: 85%;
`;

const InsightItem = styled(Box)`
  display: flex;
  gap: 0.75rem;
  margin-bottom: 0.75rem;

  &:last-child {
    margin-bottom: 0;
  }
`;

const InputArea = styled(Paper)`
  padding: 1rem;
  border-radius: 24px;
  margin-top: 1rem;
  background: white;
`;

const StyledTextField = styled(TextField)`
  & .MuiOutlinedInput-root {
    border-radius: 20px;
    background-color: #f8fafc;
    transition: all 0.2s ease;

    &:hover fieldset {
      border-color: #94a3b8;
    }

    &.Mui-focused fieldset {
      border-color: #7c3aed;
      border-width: 2px;
    }
  }

  & .MuiInputLabel-root {
    color: #64748b;
    &.Mui-focused {
      color: #7c3aed;
    }
  }
`;

const SendButton = styled(Button)`
  background: linear-gradient(135deg, #7c3aed 0%, #a855f7 100%);
  border-radius: 40px;
  padding: 8px 24px;
  font-weight: 600;
  text-transform: none;
  box-shadow: 0 4px 12px rgba(124, 58, 237, 0.2);
  transition: all 0.25s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(124, 58, 237, 0.3);
    background: linear-gradient(135deg, #7c3aed 0%, #a855f7 100%);
  }

  &:disabled {
    background: #cbd5e1;
    transform: none;
    box-shadow: none;
  }
`;

const LoadingDots = styled(Box)`
  display: flex;
  gap: 0.5rem;
  align-items: center;
  animation: ${pulse} 1.5s ease-in-out infinite;
`;

// Helper to get API base URL (unchanged)
const getApiBaseUrl = () => {
  const isDev =
    process.env.NODE_ENV === "development" ||
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1";
  return isDev ? "http://localhost:5000" : "/api";
};
const API_BASE_URL = getApiBaseUrl();

const TeacherChatbot = () => {
  const { currentUser } = useSelector((state) => state.user);
  const teacherId = currentUser?._id;

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const [lastInsights, setLastInsights] = useState(null);

  const bottomRef = useRef(null);

  const canSend = useMemo(
    () => !!teacherId && input.trim().length > 0 && !sending,
    [teacherId, input, sending]
  );

  useEffect(() => {
    const loadHistory = async () => {
      try {
        if (!teacherId) {
          setError("Không tìm thấy thông tin giảng viên");
          setLoading(false);
          return;
        }
        const res = await fetch(`${API_BASE_URL}/Chat/History/${teacherId}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data?.message || "Không thể tải lịch sử chat");
        setMessages(data.messages || []);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    loadHistory();
  }, [teacherId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, sending, lastInsights]);

  const handleSend = async () => {
    if (!canSend) return;
    setError(null);
    setSending(true);
    const text = input.trim();
    setInput("");

    try {
      const res = await fetch(`${API_BASE_URL}/Chat/Send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ teacherId, message: text }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Gửi tin nhắn thất bại");

      setMessages((prev) => [...prev, data.user, data.assistant]);

      // Store insights from AI response
      if (data.insights && data.insights.length > 0) {
        setLastInsights(data.insights);
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setSending(false);
    }
  };

  const onKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      <GlobalStyle />
      <ChatContainer>
        <ChatHeader elevation={0}>
          <SmartToy />
          <Typography variant="h6" fontWeight={600}>
            Trợ lý quản lý lớp học AI
          </Typography>
        </ChatHeader>

        <ChatBody elevation={0}>
          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              {error && (
                <Paper sx={{ p: 2, m: 2, backgroundColor: "#ffebee" }}>
                  <Typography color="error">{error}</Typography>
                </Paper>
              )}

              <MessagesArea>
                {messages.length === 0 ? (
                  <Typography sx={{ color: "#64748b", textAlign: "center", mt: 2 }}>
                    Chưa có lịch sử chat. Hãy bắt đầu hỏi về quản lý lớp học!
                  </Typography>
                ) : (
                  messages.map((m) => (
                    <MessageBubble key={m._id} isUser={m.role === "user"}>
                      {m.role !== "user" && (
                        <MessageAvatar isUser={false}>
                          <SmartToy fontSize="small" />
                        </MessageAvatar>
                      )}
                      <MessageContent isUser={m.role === "user"}>
                        <Typography variant="body2">{m.content}</Typography>
                      </MessageContent>
                      {m.role === "user" && (
                        <MessageAvatar isUser={true}>
                          <Person fontSize="small" />
                        </MessageAvatar>
                      )}
                    </MessageBubble>
                  ))
                )}

                {/* Display Teaching Recommendations */}
                {lastInsights && lastInsights.length > 0 && (
                  <MessageBubble isUser={false}>
                    <MessageAvatar isUser={false}>
                      <Lightbulb fontSize="small" />
                    </MessageAvatar>
                    <InsightsContainer>
                      <CardContent>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
                          <Lightbulb sx={{ color: "#16a34a" }} />
                          <Typography variant="subtitle2" sx={{ fontWeight: "bold", color: "#166534" }}>
                            💡 Gợi ý cho giảng viên
                          </Typography>
                        </Box>
                        {lastInsights.map((insight, idx) => (
                          <InsightItem key={idx}>
                            <Typography variant="caption" sx={{ color: "#166534", fontWeight: 600, minWidth: "100px" }}>
                              {insight.topic}:
                            </Typography>
                            <Typography variant="caption" sx={{ color: "#166534" }}>
                              {insight.suggestion}
                            </Typography>
                          </InsightItem>
                        ))}
                      </CardContent>
                    </InsightsContainer>
                  </MessageBubble>
                )}

                {sending && (
                  <LoadingDots>
                    <CircularProgress size={20} />
                    <Typography variant="body2" color="text.secondary">
                      Đang trả lời...
                    </Typography>
                  </LoadingDots>
                )}
                <div ref={bottomRef} />
              </MessagesArea>

              <Divider />

              <InputArea elevation={0}>
                <StyledTextField
                  fullWidth
                  multiline
                  minRows={2}
                  placeholder="Nhập câu hỏi của bạn... (Enter để gửi, Shift+Enter xuống dòng)"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={onKeyDown}
                  disabled={!teacherId || sending}
                  variant="outlined"
                />
                <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 1.5 }}>
                  <SendButton
                    variant="contained"
                    onClick={handleSend}
                    disabled={!canSend}
                    endIcon={<Send />}
                  >
                    Gửi
                  </SendButton>
                </Box>
              </InputArea>
            </>
          )}
        </ChatBody>
      </ChatContainer>
    </>
  );
};

export default TeacherChatbot;
