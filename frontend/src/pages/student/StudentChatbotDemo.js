import { useEffect, useMemo, useRef, useState } from "react";
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
import { 
  Send, SmartToy, Person, Lightbulb, MenuBook, BookmarkBorder, 
  Quiz, TrendingUp, Refresh, BookOpen, Bulb 
} from "@mui/icons-material";
import { mockAPI } from "./mockAPI.js";
import { MOCK_SUBJECTS, MOCK_QUICK_ACTIONS } from "./mockData.js";

// ─── Global Style ──────────────────────────────────────────────────────
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

// ─── Styled Components ──────────────────────────────────────────────────
const ChatContainer = styled(Box)`
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  animation: ${fadeIn} 0.7s cubic-bezier(0.34, 1.56, 0.64, 1);
  border-radius: 24px;
  overflow: hidden;
`;

const ChatHeader = styled(Paper)`
  background: linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%);
  color: white;
  padding: 1.5rem;
  border-radius: 24px 24px 0 0;
  margin-bottom: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.5rem;
  box-shadow: 0 8px 16px rgba(30, 58, 138, 0.2);
  border-bottom: 2px solid rgba(255, 255, 255, 0.1);
  flex-wrap: wrap;
`;

const HeaderLeft = styled(Box)`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const SubjectSelector = styled(FormControl)`
  min-width: 280px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  
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
  display: flex;
  flex-direction: column;
  height: 70vh;
`;

const MessagesArea = styled(Box)`
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem;
  background: linear-gradient(180deg, #f0f9ff 0%, #e0f2fe 100%);
  display: flex;
  flex-direction: column;
  gap: 1rem;
  
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
  max-width: 90%;
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
  word-break: break-word;
`;

const SourcesContainer = styled(Card)`
  animation: ${slideIn} 0.5s ease;
  background: linear-gradient(135deg, #dbeafe 0%, #e0e7ff 100%);
  border: 2px solid #3b82f6;
  border-radius: 12px;
  align-self: flex-start;
  max-width: 90%;
  margin-top: 0.5rem;
`;

const InsightsContainer = styled(Card)`
  animation: ${slideIn} 0.5s ease;
  background: linear-gradient(135deg, #fef3c7 0%, #fef08a 100%);
  border: 2px solid #fbbf24;
  border-radius: 16px;
  align-self: flex-start;
  max-width: 90%;
`;

const QuizzesContainer = styled(Card)`
  animation: ${slideIn} 0.5s ease;
  background: linear-gradient(135deg, #ddd6fe 0%, #ede9fe 100%);
  border: 2px solid #a78bfa;
  border-radius: 16px;
  align-self: flex-start;
  max-width: 90%;
`;

const InputArea = styled(Paper)`
  padding: 1.25rem;
  border-radius: 0;
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
`;

const LoadingDots = styled(Box)`
  display: flex;
  gap: 0.5rem;
  align-items: center;
  animation: ${pulse} 1.5s ease-in-out infinite;
`;

// ─── Component ──────────────────────────────────────────────────────
const StudentChatbotDemo = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const [lastInsights, setLastInsights] = useState(null);
  const [lastSources, setLastSources] = useState(null);
  const [lastPerformance, setLastPerformance] = useState(null);
  const [lastQuizzes, setLastQuizzes] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState("subject_1");
  
  const bottomRef = useRef(null);
  const mockStudentId = "demo_student_001"; // Mock student ID

  const canSend = useMemo(
    () => input.trim().length > 0 && !sending,
    [input, sending]
  );

  // Load initial chat history
  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await mockAPI.getChatHistory(mockStudentId);
        setMessages(data.messages);
      } catch (e) {
        setError("Lỗi tải lịch sử: " + e.message);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // Auto-scroll to latest message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, sending, lastInsights, lastSources, lastQuizzes]);

  // Handle sending message
  const handleSend = async () => {
    if (!canSend) return;
    setError(null);
    setSending(true);
    const text = input.trim();
    setInput("");

    try {
      const data = await mockAPI.sendChatMessage(
        mockStudentId,
        text,
        selectedSubject
      );

      setMessages((prev) => [...prev, data.user, data.assistant]);

      if (data.insights && data.insights.length > 0) {
        setLastInsights(data.insights);
      }

      if (data.sources && data.sources.length > 0) {
        setLastSources(data.sources);
      }

      if (data.performance) {
        setLastPerformance(data.performance);
      }

      if (data.quizzes && data.quizzes.suggestions && data.quizzes.suggestions.length > 0) {
        setLastQuizzes(data.quizzes);
      }
    } catch (e) {
      setError("Lỗi: " + e.message);
    } finally {
      setSending(false);
    }
  };

  // Handle quick action button
  const handleQuickAction = (action) => {
    setInput(action.message);
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
      <Box sx={{ p: 2 }}>
        <ChatContainer>
          <ChatHeader elevation={0}>
            <HeaderLeft>
              <SmartToy sx={{ fontSize: 32 }} />
              <Typography variant="h5" fontWeight={700}>
                🤖 Trợ lý học tập AI
              </Typography>
            </HeaderLeft>

            <SubjectSelector size="small" value={selectedSubject} onChange={(e) => setSelectedSubject(e.target.value)}>
              <InputLabel>Chọn môn học</InputLabel>
              <Select label="Chọn môn học">
                {MOCK_SUBJECTS.map((subj) => (
                  <MenuItem key={subj._id} value={subj._id}>
                    {subj.subjectName} - {subj.code}
                  </MenuItem>
                ))}
              </Select>
            </SubjectSelector>
          </ChatHeader>

          <ChatBody>
            {loading ? (
              <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", flex: 1 }}>
                <CircularProgress />
              </Box>
            ) : (
              <>
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
                          <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>
                            {m.content}
                          </Typography>
                        </MessageContent>
                        {m.role === "user" && (
                          <MessageAvatar isUser={true}>
                            <Person fontSize="small" />
                          </MessageAvatar>
                        )}
                      </MessageBubble>
                    ))
                  )}

                  {/* Sources */}
                  {lastSources && lastSources.length > 0 && (
                    <MessageBubble isUser={false}>
                      <MessageAvatar isUser={false}>
                        <BookmarkBorder fontSize="small" />
                      </MessageAvatar>
                      <SourcesContainer>
                        <CardContent sx={{ py: 1.5 }}>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                            <MenuBook sx={{ color: "#1e40af", fontSize: "20px" }} />
                            <Typography variant="subtitle2" sx={{ fontWeight: "bold", color: "#1e40af" }}>
                              📚 Tài liệu tham khảo
                            </Typography>
                          </Box>
                          {lastSources.map((src, idx) => (
                            <Typography key={idx} variant="caption" sx={{ color: "#1e3a8a", display: "block" }}>
                              • {src.title}
                            </Typography>
                          ))}
                        </CardContent>
                      </SourcesContainer>
                    </MessageBubble>
                  )}

                  {/* Insights */}
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
                            <Box key={idx} sx={{ mb: 1, p: 1, backgroundColor: "rgba(255,255,255,0.5)", borderRadius: 1 }}>
                              <Typography variant="caption" sx={{ fontWeight: 600, color: "#92400e" }}>
                                📌 {insight.topic}
                              </Typography>
                              <Typography variant="caption" sx={{ color: "#92400e", display: "block", mt: 0.5 }}>
                                {insight.suggestion}
                              </Typography>
                              <Chip
                                label={insight.severity === 'high' ? '🔴 Ưu tiên' : insight.severity === 'medium' ? '🟡 TB' : '🟢 Tốt'}
                                size="small"
                                sx={{ mt: 0.5, height: 20, fontSize: "0.65rem" }}
                              />
                            </Box>
                          ))}
                        </CardContent>
                      </InsightsContainer>
                    </MessageBubble>
                  )}

                  {/* Quizzes */}
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

                          {lastQuizzes.performance && (
                            <Box sx={{ mb: 2, p: 1.5, backgroundColor: "rgba(124, 58, 237, 0.1)", borderRadius: 1 }}>
                              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
                                <TrendingUp sx={{ fontSize: "16px", color: "#7c3aed" }} />
                                <Typography variant="caption" sx={{ color: "#5b21b6", fontWeight: 600 }}>
                                  Hiệu suất: {lastQuizzes.performance.averageScore}% | Tỉ lệ đạt: {lastQuizzes.performance.passRate}%
                                </Typography>
                              </Box>
                              <Chip
                                label={lastQuizzes.performance.suggestedDifficulty === 'easy' ? '🟢 Dễ' : lastQuizzes.performance.suggestedDifficulty === 'hard' ? '🔴 Khó' : '🟡 Trung bình'}
                                size="small"
                                sx={{ height: 20 }}
                              />
                            </Box>
                          )}

                          <Grid container spacing={1}>
                            {lastQuizzes.suggestions.map((quiz, idx) => (
                              <Grid item xs={12} key={idx}>
                                <Card sx={{ backgroundColor: "rgba(255,255,255,0.7)", border: "1px solid #e9d5ff" }}>
                                  <CardContent sx={{ p: 1.5 }}>
                                    <Typography variant="subtitle2" sx={{ fontWeight: 600, color: "#5b21b6", mb: 0.5 }}>
                                      {quiz.title}
                                    </Typography>
                                    <Box sx={{ display: "flex", gap: 0.5, mb: 1, flexWrap: "wrap" }}>
                                      <Chip label={quiz.difficulty} size="small" sx={{ height: 20, fontSize: "0.7rem" }} />
                                      <Chip label={`Avg: ${quiz.averageScore}%`} size="small" sx={{ height: 20, fontSize: "0.7rem" }} />
                                    </Box>
                                  </CardContent>
                                  <CardActions sx={{ p: 1, justifyContent: "flex-end" }}>
                                    <Button size="small" sx={{ color: "#7c3aed", fontWeight: 600 }}>
                                      Làm quiz →
                                    </Button>
                                  </CardActions>
                                </Card>
                              </Grid>
                            ))}
                          </Grid>
                        </CardContent>
                      </QuizzesContainer>
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

                {/* Quick Actions */}
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
                    disabled={sending}
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

        {/* Demo Badge */}
        <Box sx={{ mt: 2, p: 2, backgroundColor: "#fef3c7", borderRadius: 2, border: "2px solid #fbbf24" }}>
          <Typography variant="caption" sx={{ color: "#92400e", fontWeight: 600 }}>
            ✨ Demo Mode: Tất cả dữ liệu là giả để demo UI. Backend chưa kết nối.
          </Typography>
        </Box>
      </Box>
    </>
  );
};

export default StudentChatbotDemo;
