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
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  CardActions,
  Grid,
} from "@mui/material";
import styled, { keyframes, createGlobalStyle } from "styled-components";
import { Send, SmartToy, Person, Lightbulb, MenuBook, BookmarkBorder, Quiz, TrendingUp } from "@mui/icons-material";
import { mockAPI } from "./mockAPI.js";
import { MOCK_SUBJECTS, MOCK_QUICK_ACTIONS } from "./mockData.js";

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
    background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 50%, #f0f9ff 100%);
    color: #0f172a;
    line-height: 1.6;
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
  animation: ${fadeIn} 0.7s cubic-bezier(0.34, 1.56, 0.64, 1);
  border-radius: 24px;
  overflow: hidden;
`;

const ChatHeader = styled(Paper)`
  background: linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%);
  color: white;
  padding: 1.25rem 1.5rem;
  border-radius: 24px 24px 0 0;
  margin-bottom: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  box-shadow: 0 8px 16px rgba(30, 58, 138, 0.2);
  border-bottom: 2px solid rgba(255, 255, 255, 0.1);
`;

const HeaderLeft = styled(Box)`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const SubjectSelector = styled(FormControl)`
  min-width: 200px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(8px);
  
  & .MuiOutlinedInput-root {
    color: #1e3a8a;
    font-weight: 500;
    
    & fieldset {
      border-color: rgba(37, 99, 235, 0.3);
      border-width: 2px;
    }
    
    &:hover fieldset {
      border-color: rgba(37, 99, 235, 0.6);
    }
    
    &.Mui-focused fieldset {
      border-color: #2563eb;
      border-width: 2px;
    }
  }
  
  & .MuiInputLabel-root {
    color: #1e3a8a;
    font-weight: 500;
  }
`;

const ChatBody = styled(Paper)`
  border-radius: 0 0 24px 24px;
  box-shadow: 0 12px 32px rgba(30, 58, 138, 0.15);
  overflow: hidden;
  background: white;
  border: 1px solid rgba(37, 99, 235, 0.1);
`;

const MessagesArea = styled(Box)`
  height: 50vh;
  overflow-y: auto;
  padding: 1.5rem;
  background: linear-gradient(180deg, #f0f9ff 0%, #e0f2fe 100%);
  display: flex;
  flex-direction: column;
  gap: 1rem;
  
  /* Scrollbar styling */
  &::-webkit-scrollbar {
    width: 8px;
  }
  
  &::-webkit-scrollbar-track {
    background: rgba(30, 58, 138, 0.05);
    border-radius: 10px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: linear-gradient(180deg, #2563eb 0%, #1e3a8a 100%);
    border-radius: 10px;
    
    &:hover {
      background: linear-gradient(180deg, #1e40af 0%, #172554 100%);
    }
  }
`;

const MessageBubble = styled(Box)`
  display: flex;
  gap: 0.75rem;
  align-items: flex-start;
  max-width: 85%;
  align-self: ${({ isUser }) => (isUser ? "flex-end" : "flex-start")};
`;

const MessageAvatar = styled(Avatar)`
  background: ${({ isUser }) => (isUser ? "#2563eb" : "#94a3b8")};
  width: 36px;
  height: 36px;
  flex-shrink: 0;
`;

const MessageContent = styled(Paper)`
  padding: 0.75rem 1rem;
  border-radius: 20px;
  background: ${({ isUser }) => (isUser ? "linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)" : "linear-gradient(135deg, #dbeafe 0%, #e0e7ff 100%)")};
  color: ${({ isUser }) => (isUser ? "white" : "#0f172a")};
  box-shadow: ${({ isUser }) => (isUser ? "0 4px 12px rgba(37, 99, 235, 0.3)" : "0 2px 4px rgba(30, 58, 138, 0.1)")};
  border: ${({ isUser }) => (isUser ? "none" : "1px solid #93c5fd")};
`;

// Enhanced sources display
const SourcesContainer = styled(Card)`
  animation: ${slideIn} 0.5s ease;
  background: linear-gradient(135deg, #dbeafe 0%, #e0e7ff 100%);
  border: 2px solid #3b82f6;
  border-radius: 12px;
  align-self: flex-start;
  max-width: 85%;
  margin-top: 0.5rem;
`;

const InsightsContainer = styled(Card)`
  animation: ${slideIn} 0.5s ease;
  background: linear-gradient(135deg, #fef3c7 0%, #fef08a 100%);
  border: 2px solid #fbbf24;
  border-radius: 16px;
  align-self: flex-start;
  max-width: 85%;
`;

const QuizzesContainer = styled(Card)`
  animation: ${slideIn} 0.5s ease;
  background: linear-gradient(135deg, #ddd6fe 0%, #ede9fe 100%);
  border: 2px solid #a78bfa;
  border-radius: 16px;
  align-self: flex-start;
  max-width: 85%;
`;

const InsightItem = styled(Box)`
  display: flex;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
  padding: 0.5rem;
  border-radius: 8px;
  background: ${({ severity }) => {
    switch(severity) {
      case 'high': return 'rgba(239, 68, 68, 0.1)';
      case 'medium': return 'rgba(245, 158, 11, 0.1)';
      case 'low': return 'rgba(34, 197, 94, 0.1)';
      default: return 'rgba(255, 255, 255, 0.5)';
    }
  }};

  &:last-child {
    margin-bottom: 0;
  }
`;

const SeverityBadge = styled(Chip)`
  height: 20px;
  border-radius: 10px;
  background: ${({ severity }) => {
    switch(severity) {
      case 'high': return '#ef4444';
      case 'medium': return '#f59e0b';
      case 'low': return '#22c55e';
      default: return '#6b7280';
    }
  }} !important;
  color: white !important;
  font-weight: 600;
  font-size: 0.7rem;
`;

const InputArea = styled(Paper)`
  padding: 1.25rem;
  border-radius: 24px;
  margin-top: 1rem;
  background: linear-gradient(135deg, #f8fafc 0%, #f0f9ff 100%);
  border-top: 1px solid rgba(37, 99, 235, 0.1);
  box-shadow: 0 -4px 12px rgba(30, 58, 138, 0.05);
`;

const StyledTextField = styled(TextField)`
  & .MuiOutlinedInput-root {
    border-radius: 16px;
    background-color: white;
    border: 2px solid #e0e7ff;
    transition: all 0.3s ease;

    &:hover {
      border-color: #3b82f6;
      box-shadow: 0 4px 12px rgba(59, 130, 246, 0.1);
    }

    &.Mui-focused {
      border-color: #2563eb;
      box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
    }
  }

  & .MuiInputLabel-root {
    color: #64748b;
    font-weight: 500;
    
    &.Mui-focused {
      color: #2563eb;
    }
  }
`;

const SendButton = styled(Button)`
  background: linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%);
  border-radius: 40px;
  padding: 10px 28px;
  font-weight: 700;
  text-transform: none;
  box-shadow: 0 6px 16px rgba(30, 64, 175, 0.3);
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  color: white;
  border: none;

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 12px 24px rgba(30, 64, 175, 0.4);
    background: linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%);
  }

  &:active {
    transform: translateY(-1px);
  }

  &:disabled {
    background: #cbd5e1;
    box-shadow: none;
    transform: none;
  }
`;

const QuickActionButton = styled(Button)`
  background: linear-gradient(135deg, #7c3aed 0%, #a855f7 100%);
  color: white;
  border-radius: 20px;
  padding: 8px 16px;
  font-weight: 600;
  text-transform: none;
  font-size: 0.85rem;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 16px rgba(124, 58, 237, 0.3);
  }

  &:disabled {
    background: #cbd5e1;
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

const StudentChatbot = () => {
  const { currentUser } = useSelector((state) => state.user);
  const studentId = currentUser?._id;

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const [lastInsights, setLastInsights] = useState(null);
  const [lastSources, setLastSources] = useState(null); // New: store sources
  const [lastPerformance, setLastPerformance] = useState(null); // New: store student performance
  const [lastQuizzes, setLastQuizzes] = useState(null); // NEW: store quiz suggestions
  const [selectedSubject, setSelectedSubject] = useState(""); // New: subject selection
  const [subjects, setSubjects] = useState([]); // New: available subjects
  
  const bottomRef = useRef(null);

  const canSend = useMemo(
    () => !!studentId && input.trim().length > 0 && !sending,
    [studentId, input, sending]
  );

  // Load subjects and chat history
  useEffect(() => {
    const loadData = async () => {
      try {
        if (!studentId) {
          setError("Không tìm thấy thông tin sinh viên");
          setLoading(false);
          return;
        }

        // Use mock data for demo
        const data = await mockAPI.getChatHistory(studentId);
        setMessages(data.messages || []);
        setSelectedSubject(MOCK_SUBJECTS[0]._id);
        
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [studentId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, sending, lastInsights, lastSources, lastQuizzes]);

  const handleSend = async () => {
    if (!canSend) return;
    setError(null);
    setSending(true);
    const text = input.trim();
    setInput("");

    try {
      // Use mockAPI for demo, can switch to real backend later
      const data = await mockAPI.sendChatMessage(
        studentId,
        text,
        selectedSubject || MOCK_SUBJECTS[0]._id
      );

      setMessages((prev) => [...prev, data.user, data.assistant]);

      // Store insights from AI response (now with severity)
      if (data.insights && data.insights.length > 0) {
        setLastInsights(data.insights);
      }

      // New: Store sources (citations)
      if (data.sources && data.sources.length > 0) {
        setLastSources(data.sources);
      }

      // New: Store student performance
      if (data.performance) {
        setLastPerformance(data.performance);
      }

      // NEW: Store quiz suggestions
      if (data.quizzes && data.quizzes.suggestions && data.quizzes.suggestions.length > 0) {
        setLastQuizzes(data.quizzes);
      }

      // Update selected subject from response
      if (data.subjectId) {
        setSelectedSubject(data.subjectId);
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

  const handleQuickAction = (action) => {
    setInput(action.message);
  };

  return (
    <>
      <GlobalStyle />
      <ChatContainer>
        <ChatHeader elevation={0}>
          <HeaderLeft>
            <SmartToy />
            <Typography variant="h6" fontWeight={600}>
              Trợ lý học tập AI
            </Typography>
          </HeaderLeft>

          {/* Subject Selector */}
          <SubjectSelector size="small" disabled={sending}>
            <InputLabel>Chọn môn học</InputLabel>
            <Select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              label="Chọn môn học"
            >
              {MOCK_SUBJECTS.map((subj) => (
                <MenuItem key={subj._id} value={subj._id}>
                  {subj.subjectName} - {subj.code}
                </MenuItem>
              ))}
            </Select>
          </SubjectSelector>
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
                    Chưa có lịch sử chat. Hãy bắt đầu hỏi bài!
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

                {/* Display Source Citations */}
                {lastSources && lastSources.length > 0 && (
                  <MessageBubble isUser={false}>
                    <MessageAvatar isUser={false}>
                      <BookmarkBorder fontSize="small" />
                    </MessageAvatar>
                    <SourcesContainer>
                      <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                          <MenuBook sx={{ color: "#1e40af", fontSize: "20px" }} />
                          <Typography variant="subtitle2" sx={{ fontWeight: "bold", color: "#1e40af" }}>
                            📚 Tài liệu tham khảo
                          </Typography>
                        </Box>
                        <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
                          {lastSources.map((src, idx) => (
                            <Typography key={idx} variant="caption" sx={{ color: "#1e3a8a" }}>
                              • {src.title || src.sourceId}
                            </Typography>
                          ))}
                        </Box>
                      </CardContent>
                    </SourcesContainer>
                  </MessageBubble>
                )}

                {/* Display Learning Insights */}
                {lastInsights && lastInsights.length > 0 && (
                  <MessageBubble isUser={false}>
                    <MessageAvatar isUser={false}>
                      <Lightbulb fontSize="small" />
                    </MessageAvatar>
                    <InsightsContainer>
                      <CardContent>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
                          <Lightbulb sx={{ color: "#d97706" }} />
                          <Typography variant="subtitle2" sx={{ fontWeight: "bold", color: "#92400e" }}>
                            💡 Gợi ý học tập cá nhân hóa
                          </Typography>
                        </Box>
                        {lastInsights.map((insight, idx) => (
                          <InsightItem key={idx} severity={insight.severity}>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, flex: 1 }}>
                              <Typography variant="caption" sx={{ color: "#92400e", fontWeight: 700, minWidth: "100px" }}>
                                {insight.topic}
                              </Typography>
                              {insight.severity && (
                                <SeverityBadge
                                  label={insight.severity === 'high' ? 'Ưu tiên' : insight.severity === 'medium' ? 'TB' : 'Tốt'}
                                  severity={insight.severity}
                                  size="small"
                                />
                              )}
                            </Box>
                            <Typography variant="caption" sx={{ color: "#92400e", flex: 1 }}>
                              {insight.suggestion}
                            </Typography>
                          </InsightItem>
                        ))}
                      </CardContent>
                    </InsightsContainer>
                  </MessageBubble>
                )}

                {/* Display Quiz Recommendations */}
                {lastQuizzes && lastQuizzes.suggestions && lastQuizzes.suggestions.length > 0 && (
                  <MessageBubble isUser={false}>
                    <MessageAvatar isUser={false}>
                      <Quiz fontSize="small" />
                    </MessageAvatar>
                    <QuizzesContainer>
                      <CardContent>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                          <Quiz sx={{ color: "#7c3aed" }} />
                          <Typography variant="subtitle2" sx={{ fontWeight: "bold", color: "#5b21b6" }}>
                            📝 Quiz gợi ý
                          </Typography>
                        </Box>

                        {/* Performance Summary */}
                        {lastQuizzes.performance && (
                          <Box sx={{ mb: 2, p: 1.5, backgroundColor: "rgba(124, 58, 237, 0.1)", borderRadius: 1 }}>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
                              <TrendingUp sx={{ fontSize: "16px", color: "#7c3aed" }} />
                              <Typography variant="caption" sx={{ color: "#5b21b6", fontWeight: 600 }}>
                                Hiệu suất: {lastQuizzes.performance.averageScore}% | Tỉ lệ đạt: {lastQuizzes.performance.passRate}%
                              </Typography>
                            </Box>
                            <Typography variant="caption" sx={{ color: "#6d28d9" }}>
                              Đề xuất: 
                              <Chip
                                label={lastQuizzes.performance.suggestedDifficulty === 'easy' ? '🟢 Dễ' : lastQuizzes.performance.suggestedDifficulty === 'hard' ? '🔴 Khó' : '🟡 Trung bình'}
                                size="small"
                                sx={{ ml: 0.5, height: 20 }}
                              />
                            </Typography>
                          </Box>
                        )}

                        {/* Quiz Suggestions */}
                        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                          {lastQuizzes.suggestions.map((quiz, idx) => (
                            <Card key={idx} sx={{ backgroundColor: "rgba(255,255,255,0.6)", border: "1px solid #e9d5ff" }}>
                              <CardContent sx={{ p: 1.5, "&:last-child": { pb: 1.5 } }}>
                                <Typography variant="subtitle2" sx={{ fontWeight: 600, color: "#5b21b6", mb: 0.5 }}>
                                  {quiz.title}
                                </Typography>
                                <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap", mb: 1 }}>
                                  <Chip
                                    label={quiz.difficulty === 'easy' ? '🟢 Easy' : quiz.difficulty === 'hard' ? '🔴 Hard' : '🟡 Medium'}
                                    size="small"
                                    sx={{ height: 20, fontSize: "0.7rem" }}
                                  />
                                  <Chip
                                    label={`Avg: ${quiz.averageScore}%`}
                                    size="small"
                                    sx={{ height: 20, fontSize: "0.7rem" }}
                                  />
                                  {quiz.attemptCount > 0 && (
                                    <Chip
                                      label={`${quiz.attemptCount} lần`}
                                      size="small"
                                      sx={{ height: 20, fontSize: "0.7rem" }}
                                    />
                                  )}
                                </Box>
                                {quiz.description && (
                                  <Typography variant="caption" sx={{ color: "#6b7280", display: "block", mb: 1 }}>
                                    {quiz.description}
                                  </Typography>
                                )}
                              </CardContent>
                              <CardActions sx={{ p: 1, justifyContent: "flex-end" }}>
                                <Button 
                                  size="small" 
                                  sx={{ color: "#7c3aed", fontWeight: 600 }}
                                  onClick={() => {
                                    // TODO: Navigate to quiz detail page
                                    console.log("Start quiz:", quiz._id);
                                  }}
                                >
                                  Làm quiz →
                                </Button>
                              </CardActions>
                            </Card>
                          ))}
                        </Box>

                        {/* Recent Attempts */}
                        {lastQuizzes.recentAttempts && lastQuizzes.recentAttempts.length > 0 && (
                          <Box sx={{ mt: 2, pt: 1.5, borderTop: "1px solid #e9d5ff" }}>
                            <Typography variant="caption" sx={{ color: "#6d28d9", fontWeight: 600, display: "block", mb: 0.5 }}>
                              📋 Lần làm gần đây:
                            </Typography>
                            {lastQuizzes.recentAttempts.slice(0, 2).map((attempt, idx) => (
                              <Typography key={idx} variant="caption" sx={{ color: "#7c3aed", display: "block" }}>
                                • {attempt.quizTitle}: {attempt.score}% {attempt.passed ? '✓ Đạt' : '✗ Chưa đạt'}
                              </Typography>
                            ))}
                          </Box>
                        )}
                      </CardContent>
                    </QuizzesContainer>
                  </MessageBubble>
                )}

                {/* Display Student Performance */}
                {lastPerformance && (
                  <Typography variant="caption" sx={{ color: "#64748b", alignSelf: "center", mt: 1 }}>
                    📊 Điểm trung bình: {lastPerformance.avgScore}/100
                  </Typography>
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

              <Box sx={{ p: 1, backgroundColor: "rgba(124, 58, 237, 0.05)", display: "flex", gap: 1, flexWrap: "wrap" }}>
                {MOCK_QUICK_ACTIONS.map((action) => (
                  <QuickActionButton
                    key={action.id}
                    size="small"
                    onClick={() => handleQuickAction(action)}
                    disabled={sending}
                  >
                    {action.icon} {action.label}
                  </QuickActionButton>
                ))}
              </Box>

              <InputArea elevation={0}>
                <StyledTextField
                  fullWidth
                  multiline
                  minRows={2}
                  placeholder="Nhập câu hỏi của bạn... (Enter để gửi, Shift+Enter xuống dòng)"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={onKeyDown}
                  disabled={!studentId || sending}
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

export default StudentChatbot;