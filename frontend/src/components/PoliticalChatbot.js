import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Avatar,
  CircularProgress,
  Fade,
  Grid,
  Card,
  CardContent
} from '@mui/material';
import {
  Send as SendIcon,
  Clear as ClearIcon,
  History as HistoryIcon,
  SmartToy as BotIcon,
  Person as PersonIcon,
  School as SchoolIcon,
  AutoStories as AutoStoriesIcon,
  Group as GroupIcon,
  Lightbulb as LightbulbIcon
} from '@mui/icons-material';
import { findResponse, analyzeStudentProgress } from './chatbotData';

const PoliticalChatbot = ({ open, onClose, studentData = null }) => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  const [suggestedQuestions, setSuggestedQuestions] = useState([
    'Chủ nghĩa xã hội là gì?',
    'Phân tích điểm số của tôi',
    'Cách học chính trị hiệu quả',
    'Dân chủ có mấy loại?',
    'Tôi cần cải thiện điểm chương nào?'
  ]);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (open) {
      loadChatHistory();
      inputRef.current?.focus();
      
      if (studentData && messages.length === 0) {
        // Thêm lời chào tự động và phân tích chi tiết cho sinh viên
        setTimeout(() => {
          const welcomeMessage = {
            id: Date.now(),
            text: `Xin chào ${studentData.name}! Tôi là AI Assistant - Trợ lý học tập môn Lý luận Chính trị. Tôi có thể giúp bạn phân tích kết quả học tập, ôn tập kiến thức và tư vấn phương pháp học hiệu quả.`,
            sender: 'bot',
            timestamp: new Date().toISOString()
          };
          
          const analysisMessage = {
            id: Date.now() + 1,
            text: analyzeStudentProgress(studentData),
            sender: 'bot',
            timestamp: new Date().toISOString()
          };
          
          setMessages([welcomeMessage, analysisMessage]);
          saveChatHistory([welcomeMessage, analysisMessage]);
        }, 500);
      } else if (messages.length === 0) {
        // Lời chào chung cho người dùng không có dữ liệu
        setTimeout(() => {
          const welcomeMessage = {
            id: Date.now(),
            text: "Xin chào! Tôi là trợ lý AI về Lý luận Chính trị và Phân tích Học tập. Tôi có thể giúp bạn tìm hiểu về triết học chính trị, phân tích kết quả học tập, và tư vấn phương pháp học hiệu quả.",
            sender: 'bot',
            timestamp: new Date().toISOString()
          };
          
          setMessages([welcomeMessage]);
          saveChatHistory([welcomeMessage]);
        }, 500);
      }
    }
  }, [open, studentData]);

  const loadChatHistory = () => {
    const savedHistory = localStorage.getItem('political_chatbot_history');
    if (savedHistory) {
      try {
        const history = JSON.parse(savedHistory);
        setChatHistory(history);
      } catch (error) {
        console.error('Error parsing chat history:', error);
      }
    }
  };

  const saveChatHistory = (messages) => {
    try {
      localStorage.setItem('political_chatbot_history', JSON.stringify(messages));
      setChatHistory(messages);
    } catch (error) {
      console.error('Error saving chat history:', error);
    }
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      text: inputMessage,
      sender: 'user',
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      // Thêm độ trễ để tạo cảm giác thực tế
      setTimeout(() => {
        // Sử dụng hàm findResponse với studentData nếu có
        const botResponseText = findResponse(userMessage.text, studentData);

        const botMessage = {
          id: Date.now() + 1,
          text: botResponseText,
          sender: 'bot',
          timestamp: new Date().toISOString()
        };

        setMessages(prev => {
          const newMessages = [...prev, botMessage];
          saveChatHistory(newMessages);
          return newMessages;
        });
        setIsLoading(false);
      }, 1000 + Math.random() * 1000); // Độ trễ 1-2 giây

    } catch (error) {
      console.error('Error processing message:', error);
      
      setTimeout(() => {
        const errorMessage = {
          id: Date.now() + 1,
          text: 'Xin lỗi, có lỗi xảy ra khi xử lý tin nhắn. Vui lòng thử lại.',
          sender: 'bot',
          timestamp: new Date().toISOString(),
          error: true
        };
        setMessages(prev => [...prev, errorMessage]);
        setIsLoading(false);
      }, 1000);
    }
  };

  const clearChat = () => {
    setMessages([]);
    setChatHistory([]);
    localStorage.removeItem('political_chatbot_history');
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  };

  const loadHistoryChat = (historyMessages) => {
    setMessages(historyMessages);
    setShowHistory(false);
  };

  const handleSuggestedQuestion = (question) => {
    setInputMessage(question);
  };

  const TypingIndicator = () => (
    <Fade in={isLoading}>
      <Box sx={{
        display: 'flex',
        alignItems: 'center',
        p: 2,
        bgcolor: 'rgba(255,255,255,0.1)',
        borderRadius: 2,
        mb: 1,
        maxWidth: '70%',
        ml: 1
      }}>
        <Avatar sx={{ bgcolor: 'primary.main', mr: 1, width: 32, height: 32 }}>
          <BotIcon fontSize="small" />
        </Avatar>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography
            variant="body2"
            sx={{
              color: 'white',
              fontStyle: 'italic',
              mr: 1
            }}
          >
            Đang phân tích và trả lời...
          </Typography>
          <Box sx={{ display: 'flex' }}>
            <Box
              sx={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                bgcolor: 'white',
                mx: 0.5,
                animation: 'bounce 1.4s infinite',
                animationDelay: '0s'
              }}
            />
            <Box
              sx={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                bgcolor: 'white',
                mx: 0.5,
                animation: 'bounce 1.4s infinite',
                animationDelay: '0.2s'
              }}
            />
            <Box
              sx={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                bgcolor: 'white',
                mx: 0.5,
                animation: 'bounce 1.4s infinite',
                animationDelay: '0.4s'
              }}
            />
          </Box>
        </Box>
        <style>{`
          @keyframes bounce {
            0%, 60%, 100% { transform: translateY(0); }
            30% { transform: translateY(-4px); }
          }
        `}</style>
      </Box>
    </Fade>
  );

  const StudentSummaryCard = () => {
    if (!studentData) return null;

    return (
      <Card sx={{ 
        mb: 2, 
        bgcolor: 'rgba(255,255,255,0.1)',
        color: 'white',
        border: '1px solid rgba(255,255,255,0.2)'
      }}>
        <CardContent>
          <Box display="flex" alignItems="center" mb={1}>
            <SchoolIcon sx={{ mr: 1 }} />
            <Typography variant="h6">Thông tin học tập</Typography>
          </Box>
          <Grid container spacing={1}>
            <Grid item xs={4}>
              <Typography variant="body2">Học sinh:</Typography>
              <Typography variant="body1" fontWeight="bold">{studentData.name}</Typography>
            </Grid>
            <Grid item xs={4}>
              <Typography variant="body2">Điểm danh:</Typography>
              <Typography variant="body1" fontWeight="bold" color={
                parseInt(studentData.attendance.split('/')[0]) / parseInt(studentData.attendance.split('/')[1]) >= 0.8 
                  ? 'success.main' 
                  : 'warning.main'
              }>
                {studentData.attendance}
              </Typography>
            </Grid>
            <Grid item xs={4}>
              <Typography variant="body2">Truy cập:</Typography>
              <Typography variant="body1" fontWeight="bold">{studentData.accessFrequency}</Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="body2">Điểm trung bình:</Typography>
              <Typography variant="body1" fontWeight="bold">
                {((studentData.examMarks.chapter1 + studentData.examMarks.chapter2 + studentData.examMarks.chapter3) / 3).toFixed(1)}/10
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    );
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            height: '85vh',
            background: 'linear-gradient(135deg, #1a2980 0%, #26d0ce 100%)',
            borderRadius: '16px',
            overflow: 'hidden'
          }
        }}
      >
        <DialogTitle sx={{
          bgcolor: 'rgba(255,255,255,0.15)',
          color: 'white',
          textAlign: 'center',
          borderBottom: '1px solid rgba(255,255,255,0.2)',
          py: 2,
          backdropFilter: 'blur(10px)'
        }}>
          <Box display="flex" alignItems="center" justifyContent="center" gap={2}>
            <Avatar sx={{ 
              bgcolor: 'primary.main',
              width: 48,
              height: 48,
              boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
            }}>
              <BotIcon />
            </Avatar>
            <Box>
              <Typography variant="h5" component="div" fontWeight="bold">
                AI Trợ lý Học tập Chính trị
              </Typography>
              <Typography variant="body2" sx={{ mt: 0.5, opacity: 0.9 }}>
                {studentData 
                  ? `Phân tích và hỗ trợ học tập cho ${studentData.name}`
                  : 'Hỏi đáp về Lý luận Chính trị với AI'
                }
              </Typography>
            </Box>
          </Box>
        </DialogTitle>

        <DialogContent sx={{ 
          p: 0, 
          display: 'flex', 
          flexDirection: 'column', 
          height: '100%',
          position: 'relative'
        }}>
          {/* Student Summary Card */}
          {studentData && <StudentSummaryCard />}

          {/* Messages Area */}
          <Box sx={{
            flex: 1,
            p: 2,
            overflowY: 'auto',
            bgcolor: 'rgba(255,255,255,0.05)',
            '&::-webkit-scrollbar': {
              width: '10px',
            },
            '&::-webkit-scrollbar-track': {
              background: 'rgba(255,255,255,0.1)',
              borderRadius: '8px',
            },
            '&::-webkit-scrollbar-thumb': {
              background: 'rgba(255,255,255,0.3)',
              borderRadius: '8px',
              border: '2px solid transparent',
              backgroundClip: 'padding-box',
              '&:hover': {
                background: 'rgba(255,255,255,0.4)',
                border: '2px solid transparent',
                backgroundClip: 'padding-box'
              }
            }
          }}>
            {messages.length === 0 && !isLoading && (
              <Box textAlign="center" py={4}>
                <Avatar sx={{ 
                  width: 80, 
                  height: 80, 
                  mb: 2,
                  mx: 'auto',
                  bgcolor: 'rgba(255,255,255,0.1)',
                  border: '3px solid rgba(255,255,255,0.3)',
                  boxShadow: '0 8px 25px rgba(0,0,0,0.2)'
                }}>
                  <BotIcon sx={{ fontSize: 44 }} />
                </Avatar>
                <Typography variant="h5" sx={{ 
                  color: 'white', 
                  mb: 1, 
                  fontWeight: 'bold',
                  textShadow: '0 2px 4px rgba(0,0,0,0.2)'
                }}>
                  AI Trợ lý Học tập Thông minh
                </Typography>
                <Typography variant="body1" sx={{ 
                  color: 'rgba(255,255,255,0.85)', 
                  maxWidth: '600px', 
                  mx: 'auto', 
                  mb: 3,
                  lineHeight: 1.6
                }}>
                  Tôi có thể giúp bạn phân tích kết quả học tập, ôn tập lý thuyết chính trị, 
                  tư vấn phương pháp học hiệu quả và giải đáp thắc mắc về môn học.
                </Typography>
                
                {/* Suggested Questions */}
                <Box sx={{ maxWidth: '600px', mx: 'auto', mb: 3 }}>
                  <Typography variant="subtitle2" sx={{ 
                    color: 'rgba(255,255,255,0.9)', 
                    mb: 1,
                    fontWeight: 'bold'
                  }}>
                    Câu hỏi gợi ý:
                  </Typography>
                  <Grid container spacing={1}>
                    {suggestedQuestions.map((question, index) => (
                      <Grid item xs={12} sm={6} key={index}>
                        <Chip
                          label={question}
                          onClick={() => handleSuggestedQuestion(question)}
                          sx={{ 
                            color: 'white',
                            bgcolor: 'rgba(255,255,255,0.15)',
                            border: '1px solid rgba(255,255,255,0.2)',
                            height: 'auto',
                            py: 1,
                            '&:hover': {
                              bgcolor: 'rgba(255,255,255,0.25)',
                              transform: 'translateY(-2px)',
                              boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                            },
                            transition: 'all 0.3s',
                            borderRadius: '8px',
                            cursor: 'pointer'
                          }}
                        />
                      </Grid>
                    ))}
                  </Grid>
                </Box>

                {/* Features */}
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, justifyContent: 'center', maxWidth: '600px', mx: 'auto' }}>
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    bgcolor: 'rgba(255,255,255,0.1)',
                    borderRadius: '12px',
                    p: 1.5,
                    minWidth: '140px'
                  }}>
                    <AutoStoriesIcon sx={{ mr: 1, color: '#4FC3F7' }} />
                    <Typography variant="body2" sx={{ color: 'white' }}>Phân tích điểm số</Typography>
                  </Box>
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    bgcolor: 'rgba(255,255,255,0.1)',
                    borderRadius: '12px',
                    p: 1.5,
                    minWidth: '140px'
                  }}>
                    <SchoolIcon sx={{ mr: 1, color: '#81C784' }} />
                    <Typography variant="body2" sx={{ color: 'white' }}>Đánh giá học tập</Typography>
                  </Box>
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    bgcolor: 'rgba(255,255,255,0.1)',
                    borderRadius: '12px',
                    p: 1.5,
                    minWidth: '140px'
                  }}>
                    <LightbulbIcon sx={{ mr: 1, color: '#FFD54F' }} />
                    <Typography variant="body2" sx={{ color: 'white' }}>Khuyến nghị học tập</Typography>
                  </Box>
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    bgcolor: 'rgba(255,255,255,0.1)',
                    borderRadius: '12px',
                    p: 1.5,
                    minWidth: '140px'
                  }}>
                    <GroupIcon sx={{ mr: 1, color: '#BA68C8' }} />
                    <Typography variant="body2" sx={{ color: 'white' }}>Kiến thức chính trị</Typography>
                  </Box>
                </Box>
              </Box>
            )}

            
          
          {messages.map((message) => (
              <Box
                key={message.id}
                sx={{
                  display: 'flex',
                  justifyContent: message.sender === 'user' ? 'flex-end' : 'flex-start',
                  mb: 2.5,
                  animation: 'fadeIn 0.4s ease-out'
                }}
              >
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'flex-end',
                  maxWidth: '85%',
                  flexDirection: message.sender === 'user' ? 'row-reverse' : 'row'
                }}>
                  <Avatar sx={{
                    width: 36,
                    height: 36,
                    mx: 1.5,
                    mb: 0.5,
                    bgcolor: message.sender === 'user' ? '#667eea' : 'primary.main',
                    boxShadow: '0 3px 8px rgba(0,0,0,0.2)',
                    transition: 'transform 0.2s',
                    '&:hover': {
                      transform: 'scale(1.1)'
                    }
                  }}>
                    {message.sender === 'user' ? 
                      <PersonIcon sx={{ fontSize: 20 }} /> : 
                      <BotIcon sx={{ fontSize: 20 }} />
                    }
                  </Avatar>
                  <Paper
                    elevation={3}
                    sx={{
                      p: 2.5,
                      maxWidth: '100%',
                      bgcolor: message.sender === 'user'
                        ? '#667eea' // Sử dụng màu cố định thay vì gradient
                        : message.error
                          ? 'error.main'
                          : 'rgba(255,255,255,0.97)',
                      color: message.sender === 'user' ? '#FFFFFF !important' : 'text.primary', // Thêm !important
                      borderRadius: message.sender === 'user' ? '20px 20px 6px 20px' : '20px 20px 20px 6px',
                      boxShadow: '0 6px 20px rgba(0,0,0,0.15)',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      '&:hover': {
                        transform: 'translateY(-3px)',
                        boxShadow: '0 12px 25px rgba(0,0,0,0.2)',
                      },
                      position: 'relative',
                      overflow: 'hidden',
                      '&::before': message.sender === 'user' ? {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
                      } : {}
                    }}
                  >
                    <Box display="flex" alignItems="center" mb={1}>
                      <Typography variant="caption" sx={{ 
                        opacity: 0.9,
                        fontWeight: 'bold',
                        fontSize: '0.75rem',
                        letterSpacing: '0.5px',
                        color: message.sender === 'user' ? 'rgba(255,255,255,0.9) !important' : 'text.secondary' // Thêm cho timestamp
                      }}>
                        {message.sender === 'user' ? 'Bạn' : 'AI Assistant'}
                      </Typography>
                      <Typography variant="caption" sx={{ 
                        ml: 2,
                        opacity: 0.7,
                        fontSize: '0.7rem',
                        color: message.sender === 'user' ? 'rgba(255,255,255,0.7) !important' : 'text.secondary'
                      }}>
                        {new Date(message.timestamp).toLocaleTimeString('vi-VN', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </Typography>
                    </Box>
                    <Typography variant="body1" sx={{ 
                      whiteSpace: 'pre-wrap',
                      lineHeight: 1.7,
                      fontSize: '0.95rem',
                      color: message.sender === 'user' ? '#FFFFFF !important' : 'text.primary', // Thêm !important
                      '& strong': {
                        color: message.sender === 'user' ? '#FFD700 !important' : 'primary.main',
                        fontWeight: 'bold'
                      },
                      '& em': {
                        fontStyle: 'italic',
                        opacity: 0.9
                      }
                    }}>
                      {message.text}
                    </Typography>
                  </Paper>
                </Box>
              </Box>
            ))}

            {isLoading && <TypingIndicator />}
            <div ref={messagesEndRef} />
          </Box>

          {/* Input Area */}
          <Box sx={{
            p: 3,
            bgcolor: 'rgba(255,255,255,0.1)',
            borderTop: '1px solid rgba(255,255,255,0.2)',
            backdropFilter: 'blur(15px)'
          }}>
            <Box display="flex" gap={2} alignItems="center">
              <TextField
                fullWidth
                multiline
                maxRows={4}
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={
                  studentData 
                    ? `Hỏi về học tập của ${studentData.name}, kiến thức chính trị, hoặc phương pháp học...`
                    : 'Nhập câu hỏi về lý thuyết chính trị, triết học, hoặc phân tích học tập...'
                }
                disabled={isLoading}
                inputRef={inputRef}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    bgcolor: 'rgba(255,255,255,0.95)',
                    borderRadius: 4,
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': {
                      bgcolor: 'white',
                      boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
                    },
                    '&.Mui-focused': {
                      bgcolor: 'white',
                      boxShadow: '0 12px 30px rgba(0,0,0,0.2)',
                      transform: 'translateY(-2px)'
                    },
                    '& fieldset': {
                      border: '2px solid rgba(255,255,255,0.3)'
                    },
                    '&:hover fieldset': {
                      border: '2px solid rgba(255,255,255,0.5)'
                    },
                    '&.Mui-focused fieldset': {
                      border: '2px solid #4FC3F7'
                    }
                  },
                  '& .MuiOutlinedInput-input': {
                    padding: '14px 20px',
                    fontSize: '0.95rem'
                  }
                }}
              />
              <Button
                variant="contained"
                onClick={sendMessage}
                disabled={!inputMessage.trim() || isLoading}
                sx={{
                  minWidth: 60,
                  height: 60,
                  borderRadius: '50%',
                  bgcolor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  '&:hover': { 
                    bgcolor: 'primary.dark',
                    background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
                    transform: 'scale(1.08) rotate(5deg)',
                    boxShadow: '0 10px 30px rgba(102, 126, 234, 0.5)'
                  },
                  '&:disabled': {
                    bgcolor: 'rgba(255,255,255,0.3)',
                    background: 'rgba(255,255,255,0.3)'
                  },
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  boxShadow: '0 6px 20px rgba(102, 126, 234, 0.4)',
                  position: 'relative',
                  overflow: 'hidden',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: '-100%',
                    width: '100%',
                    height: '100%',
                    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
                    transition: 'left 0.5s'
                  },
                  '&:hover::before': {
                    left: '100%'
                  }
                }}
              >
                {isLoading ? 
                  <CircularProgress size={28} color="inherit" sx={{ color: 'white' }} /> : 
                  <SendIcon sx={{ fontSize: 28 }} />
                }
              </Button>
            </Box>

            {/* Action Buttons */}
            <Box display="flex" justifyContent="space-between" alignItems="center" mt={2.5}>
              <Box display="flex" gap={1.5}>
                <Button
                  startIcon={<HistoryIcon />}
                  onClick={() => setShowHistory(true)}
                  size="small"
                  sx={{ 
                    color: 'white',
                    bgcolor: 'rgba(255,255,255,0.15)',
                    borderRadius: 3,
                    px: 2.5,
                    py: 1,
                    '&:hover': {
                      bgcolor: 'rgba(255,255,255,0.25)',
                      transform: 'translateY(-2px)'
                    },
                    transition: 'all 0.3s',
                    textTransform: 'none',
                    fontWeight: '500'
                  }}
                >
                  Lịch sử ({chatHistory.length})
                </Button>
                <Button
                  startIcon={<ClearIcon />}
                  onClick={clearChat}
                  size="small"
                  sx={{ 
                    color: 'white',
                    bgcolor: 'rgba(255, 69, 58, 0.25)',
                    borderRadius: 3,
                    px: 2.5,
                    py: 1,
                    '&:hover': {
                      bgcolor: 'rgba(255, 69, 58, 0.35)',
                      transform: 'translateY(-2px)'
                    },
                    transition: 'all 0.3s',
                    textTransform: 'none',
                    fontWeight: '500'
                  }}
                >
                  Xóa chat
                </Button>
              </Box>
              
              <Typography variant="caption" sx={{ 
                color: 'rgba(255,255,255,0.7)',
                fontSize: '0.75rem'
              }}>
                Nhấn Enter để gửi, Shift+Enter để xuống dòng
              </Typography>
            </Box>
          </Box>
        </DialogContent>

        <DialogActions sx={{ 
          bgcolor: 'rgba(255,255,255,0.08)', 
          borderTop: '1px solid rgba(255,255,255,0.15)',
          px: 3,
          py: 2,
          backdropFilter: 'blur(10px)'
        }}>
          <Button 
            onClick={onClose} 
            sx={{ 
              color: 'white',
              bgcolor: 'rgba(255,255,255,0.15)',
              borderRadius: 3,
              px: 4,
              py: 1,
              '&:hover': {
                bgcolor: 'rgba(255,255,255,0.25)',
                transform: 'translateY(-2px)'
              },
              transition: 'all 0.3s',
              textTransform: 'none',
              fontWeight: '500',
              letterSpacing: '0.5px'
            }}
          >
            Đóng Chatbot
          </Button>
        </DialogActions>
      </Dialog>

      {/* History Dialog */}
      <Dialog 
        open={showHistory} 
        onClose={() => setShowHistory(false)} 
        maxWidth="md" 
        fullWidth
        PaperProps={{
          sx: {
            maxHeight: '70vh',
            borderRadius: 4,
            overflow: 'hidden'
          }
        }}
      >
        <DialogTitle sx={{ 
          bgcolor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          borderTopLeftRadius: 4,
          borderTopRightRadius: 4,
          py: 2.5
        }}>
          <Box display="flex" alignItems="center" gap={1.5}>
            <HistoryIcon sx={{ fontSize: 28 }} />
            <Box>
              <Typography variant="h6" fontWeight="bold">Lịch sử trò chuyện</Typography>
              <Typography variant="body2" sx={{ opacity: 0.9, mt: 0.5 }}>
                Tổng số: {chatHistory.length} tin nhắn • {chatHistory.filter(msg => msg.sender === 'user').length} câu hỏi
              </Typography>
            </Box>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ p: 0 }}>
          {chatHistory.length === 0 ? (
            <Box textAlign="center" py={6}>
              <HistoryIcon sx={{ 
                fontSize: 80, 
                color: 'text.disabled', 
                mb: 2,
                opacity: 0.5
              }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Chưa có lịch sử trò chuyện
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Bắt đầu trò chuyện để xem lịch sử ở đây
              </Typography>
            </Box>
          ) : (
            <List sx={{ p: 0 }}>
              {chatHistory
                .filter(msg => msg.sender === 'user')
                .map((message, index) => {
                  const botResponse = chatHistory.find(m => 
                    m.id === message.id + 1 || 
                    (index * 2 + 1 < chatHistory.length && chatHistory[index * 2 + 1].sender === 'bot')
                  );
                  
                  return (
                    <ListItem 
                      key={message.id} 
                      divider
                      button
                      onClick={() => loadHistoryChat(
                        chatHistory.slice(0, (index * 2) + (botResponse ? 2 : 1))
                      )}
                      sx={{
                        '&:hover': {
                          bgcolor: 'action.hover',
                          '& .message-time': {
                            opacity: 1
                          }
                        },
                        transition: 'all 0.2s',
                        py: 2,
                        px: 3
                      }}
                    >
                      <Box sx={{ width: '100%' }}>
                        <Box display="flex" alignItems="center" mb={1}>
                          <Avatar sx={{ 
                            width: 36, 
                            height: 36, 
                            mr: 2,
                            bgcolor: 'primary.main'
                          }}>
                            <PersonIcon sx={{ fontSize: 20 }} />
                          </Avatar>
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="body1" sx={{ fontWeight: 500 }}>
                              {message.text}
                            </Typography>
                            <Typography 
                              variant="caption" 
                              color="text.secondary"
                              className="message-time"
                              sx={{ 
                                opacity: 0.7,
                                display: 'block',
                                mt: 0.5
                              }}
                            >
                              {new Date(message.timestamp).toLocaleString('vi-VN', {
                                hour: '2-digit',
                                minute: '2-digit',
                                day: '2-digit',
                                month: '2-digit'
                              })}
                            </Typography>
                          </Box>
                        </Box>
                        {botResponse && (
                          <Box sx={{ 
                            pl: 6,
                            mt: 1,
                            p: 1.5,
                            bgcolor: 'grey.50',
                            borderRadius: 2,
                            borderLeft: '3px solid',
                            borderColor: 'primary.main'
                          }}>
                            <Typography variant="body2" color="text.secondary">
                              <Box component="span" sx={{ fontWeight: 500, color: 'text.primary' }}>
                                AI trả lời:
                              </Box>{' '}
                              {botResponse.text.length > 100 
                                ? botResponse.text.substring(0, 100) + '...' 
                                : botResponse.text
                              }
                            </Typography>
                          </Box>
                        )}
                      </Box>
                    </ListItem>
                  );
                })}
            </List>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2.5, borderTop: '1px solid #eee' }}>
          <Button 
            onClick={() => setShowHistory(false)}
            sx={{ 
              borderRadius: 3,
              px: 3,
              textTransform: 'none'
            }}
          >
            Đóng
          </Button>
          {chatHistory.length > 0 && (
            <Button 
              onClick={clearChat}
              color="error"
              variant="outlined"
              sx={{ 
                borderRadius: 3,
                px: 3,
                textTransform: 'none'
              }}
            >
              Xóa tất cả lịch sử
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </>
  );
};

export default PoliticalChatbot;