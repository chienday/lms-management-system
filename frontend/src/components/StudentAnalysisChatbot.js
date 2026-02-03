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
  Fade
} from '@mui/material';
import {
  Send as SendIcon,
  Clear as ClearIcon,
  History as HistoryIcon,
  SmartToy as BotIcon,
  Person as PersonIcon
} from '@mui/icons-material';
import { findResponse, analyzeStudentProgress } from './chatbotData';

const StudentAnalysisChatbot = ({ open, onClose, studentData }) => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
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
        // Thêm lời chào tự động và phân tích
        setTimeout(() => {
          const welcomeMessage = {
            id: Date.now(),
            text: `Xin chào ${studentData.name}! Tôi là AI Assistant - Trợ lý phân tích học tập. Tôi sẽ giúp bạn phân tích và cải thiện kết quả học tập.`,
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
      }
    }
  }, [open, studentData]);

  const loadChatHistory = () => {
    const savedHistory = localStorage.getItem('student_analysis_chatbot_history');
    if (savedHistory) {
      const history = JSON.parse(savedHistory);
      setChatHistory(history);
    }
  };

  const saveChatHistory = (messages) => {
    localStorage.setItem('student_analysis_chatbot_history', JSON.stringify(messages));
    setChatHistory(messages);
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
        // Sử dụng hàm findResponse từ chatbotData với studentData
        // Hàm findResponse đã được sửa để chỉ trả về chuỗi
        const botResponseText = findResponse(userMessage.text, studentData);

        const botMessage = {
          id: Date.now() + 1,
          text: botResponseText, // Đây là chuỗi, không phải object
          sender: 'bot',
          timestamp: new Date().toISOString()
        };

        setMessages(prev => {
          const newMessages = [...prev, botMessage];
          saveChatHistory(newMessages);
          return newMessages;
        });
        setIsLoading(false);
      }, 1000 + Math.random() * 1500); // Độ trễ 1-2.5 giây

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
    localStorage.removeItem('student_analysis_chatbot_history');
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

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            height: '80vh',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          }
        }}
      >
        <DialogTitle sx={{
          bgcolor: 'rgba(255,255,255,0.1)',
          color: 'white',
          textAlign: 'center',
          borderBottom: '1px solid rgba(255,255,255,0.2)',
          py: 2
        }}>
          <Box display="flex" alignItems="center" justifyContent="center" gap={1}>
            <Avatar sx={{ bgcolor: 'primary.main' }}>
              <BotIcon />
            </Avatar>
            <Box>
              <Typography variant="h6" component="div" fontWeight="bold">
                AI Phân tích Tiến độ Học tập
              </Typography>
              <Typography variant="body2" sx={{ mt: 0.5, opacity: 0.9 }}>
                Phân tích chi tiết và tư vấn học tập cho {studentData?.name}
              </Typography>
            </Box>
          </Box>
        </DialogTitle>

        <DialogContent sx={{ p: 0, display: 'flex', flexDirection: 'column', height: '100%' }}>
          <Box sx={{
            flex: 1,
            p: 2,
            overflowY: 'auto',
            bgcolor: 'rgba(255,255,255,0.05)',
            '&::-webkit-scrollbar': {
              width: '8px',
            },
            '&::-webkit-scrollbar-track': {
              background: 'rgba(255,255,255,0.1)',
              borderRadius: '4px',
            },
            '&::-webkit-scrollbar-thumb': {
              background: 'rgba(255,255,255,0.3)',
              borderRadius: '4px',
              '&:hover': {
                background: 'rgba(255,255,255,0.4)',
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
                  border: '2px solid rgba(255,255,255,0.3)'
                }}>
                  <BotIcon sx={{ fontSize: 40 }} />
                </Avatar>
                <Typography variant="h5" sx={{ color: 'white', mb: 1, fontWeight: 'bold' }}>
                  AI Phân tích Học tập
                </Typography>
                <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.8)', maxWidth: '600px', mx: 'auto', mb: 3 }}>
                  Đang phân tích dữ liệu học tập của {studentData?.name}...
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, justifyContent: 'center', maxWidth: '600px', mx: 'auto' }}>
                  <Chip label="Phân tích điểm số" sx={{ color: 'white', bgcolor: 'rgba(255,255,255,0.2)' }} />
                  <Chip label="Đánh giá điểm danh" sx={{ color: 'white', bgcolor: 'rgba(255,255,255,0.2)' }} />
                  <Chip label="Khuyến nghị học tập" sx={{ color: 'white', bgcolor: 'rgba(255,255,255,0.2)' }} />
                  <Chip label="Kiến thức chính trị" sx={{ color: 'white', bgcolor: 'rgba(255,255,255,0.2)' }} />
                  <Chip label="Kế hoạch cải thiện" sx={{ color: 'white', bgcolor: 'rgba(255,255,255,0.2)' }} />
                </Box>
              </Box>
            )}

            {messages.map((message) => (
              <Box
                key={message.id}
                sx={{
                  display: 'flex',
                  justifyContent: message.sender === 'user' ? 'flex-end' : 'flex-start',
                  mb: 2,
                  animation: 'fadeIn 0.3s ease-out'
                }}
              >
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'flex-end',
                  maxWidth: '85%',
                  flexDirection: message.sender === 'user' ? 'row-reverse' : 'row'
                }}>
                  <Avatar sx={{
                    width: 32,
                    height: 32,
                    mx: 1,
                    mb: 0.5,
                    bgcolor: message.sender === 'user' ? 'secondary.main' : 'primary.main',
                    boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
                  }}>
                    {message.sender === 'user' ? <PersonIcon sx={{ fontSize: 18 }} /> : <BotIcon sx={{ fontSize: 18 }} />}
                  </Avatar>
                  <Paper
                    elevation={2}
                    sx={{
                      p: 2,
                      maxWidth: '100%',
                      bgcolor: message.sender === 'user'
                        ? 'primary.main'
                        : message.error
                          ? 'error.main'
                          : 'rgba(255,255,255,0.95)',
                      color: message.sender === 'user' ? 'white' : 'text.primary',
                      borderRadius: message.sender === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                      transition: 'transform 0.2s, box-shadow 0.2s',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 6px 16px rgba(0,0,0,0.15)',
                      }
                    }}
                  >
                    <Box display="flex" alignItems="center" mb={0.5}>
                      <Typography variant="caption" sx={{ 
                        opacity: 0.8,
                        fontWeight: 'bold',
                        fontSize: '0.75rem'
                      }}>
                        {message.sender === 'user' ? 'Bạn' : 'AI Assistant'}
                      </Typography>
                      <Typography variant="caption" sx={{ 
                        ml: 1.5,
                        opacity: 0.6,
                        fontSize: '0.7rem'
                      }}>
                        {new Date(message.timestamp).toLocaleTimeString('vi-VN', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </Typography>
                    </Box>
                    <Typography variant="body1" sx={{ 
                      whiteSpace: 'pre-wrap',
                      lineHeight: 1.6,
                      fontSize: '0.95rem'
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

          <Box sx={{
            p: 2.5,
            bgcolor: 'rgba(255,255,255,0.08)',
            borderTop: '1px solid rgba(255,255,255,0.15)',
            backdropFilter: 'blur(10px)'
          }}>
            <Box display="flex" gap={1.5} alignItems="center">
              <TextField
                fullWidth
                multiline
                maxRows={4}
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={`Hỏi về học tập, điểm số, phương pháp học, hoặc kiến thức chính trị...`}
                disabled={isLoading}
                inputRef={inputRef}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    bgcolor: 'rgba(255,255,255,0.95)',
                    borderRadius: 3,
                    transition: 'all 0.3s',
                    '&:hover': {
                      bgcolor: 'white',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    },
                    '&.Mui-focused': {
                      bgcolor: 'white',
                      boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                    }
                  },
                  '& .MuiOutlinedInput-input': {
                    padding: '12px 16px',
                  }
                }}
              />
              <Button
                variant="contained"
                onClick={sendMessage}
                disabled={!inputMessage.trim() || isLoading}
                sx={{
                  minWidth: 56,
                  height: 56,
                  borderRadius: '50%',
                  bgcolor: 'primary.main',
                  '&:hover': { 
                    bgcolor: 'primary.dark',
                    transform: 'scale(1.05)'
                  },
                  '&:disabled': {
                    bgcolor: 'rgba(255,255,255,0.3)'
                  },
                  transition: 'all 0.3s',
                  boxShadow: '0 4px 15px rgba(41, 128, 185, 0.4)'
                }}
              >
                {isLoading ? 
                  <CircularProgress size={24} color="inherit" sx={{ color: 'white' }} /> : 
                  <SendIcon sx={{ fontSize: 24 }} />
                }
              </Button>
            </Box>

            <Box display="flex" justifyContent="space-between" mt={2}>
              <Button
                startIcon={<HistoryIcon />}
                onClick={() => setShowHistory(true)}
                size="small"
                sx={{ 
                  color: 'white',
                  bgcolor: 'rgba(255,255,255,0.1)',
                  borderRadius: 2,
                  px: 2,
                  py: 1,
                  '&:hover': {
                    bgcolor: 'rgba(255,255,255,0.2)'
                  }
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
                  bgcolor: 'rgba(255, 69, 58, 0.2)',
                  borderRadius: 2,
                  px: 2,
                  py: 1,
                  '&:hover': {
                    bgcolor: 'rgba(255, 69, 58, 0.3)'
                  }
                }}
              >
                Xóa chat
              </Button>
            </Box>
          </Box>
        </DialogContent>

        <DialogActions sx={{ 
          bgcolor: 'rgba(255,255,255,0.05)', 
          borderTop: '1px solid rgba(255,255,255,0.1)',
          px: 3,
          py: 2
        }}>
          <Button 
            onClick={onClose} 
            sx={{ 
              color: 'white',
              bgcolor: 'rgba(255,255,255,0.1)',
              borderRadius: 2,
              px: 3,
              '&:hover': {
                bgcolor: 'rgba(255,255,255,0.2)'
              }
            }}
          >
            Đóng
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog 
        open={showHistory} 
        onClose={() => setShowHistory(false)} 
        maxWidth="md" 
        fullWidth
        PaperProps={{
          sx: {
            maxHeight: '70vh',
            borderRadius: 3
          }
        }}
      >
        <DialogTitle sx={{ 
          bgcolor: 'primary.main', 
          color: 'white',
          borderTopLeftRadius: 3,
          borderTopRightRadius: 3
        }}>
          <Box display="flex" alignItems="center" gap={1}>
            <HistoryIcon />
            <Typography variant="h6">Lịch sử phân tích học tập</Typography>
          </Box>
          <Typography variant="body2" sx={{ opacity: 0.9, mt: 0.5 }}>
            Tổng số: {chatHistory.length} tin nhắn
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ p: 0 }}>
          {chatHistory.length === 0 ? (
            <Box textAlign="center" py={4}>
              <HistoryIcon sx={{ fontSize: 60, color: 'text.disabled', mb: 2 }} />
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
                .map((message, index) => (
                  <ListItem 
                    key={message.id} 
                    divider
                    button
                    onClick={() => loadHistoryChat(
                      chatHistory.slice(0, (index * 2) + 2)
                    )}
                    sx={{
                      '&:hover': {
                        bgcolor: 'action.hover'
                      }
                    }}
                  >
                    <ListItemText
                      primary={
                        <Box display="flex" alignItems="center">
                          <Avatar sx={{ 
                            width: 32, 
                            height: 32, 
                            mr: 2,
                            bgcolor: 'primary.main'
                          }}>
                            <PersonIcon sx={{ fontSize: 18 }} />
                          </Avatar>
                          <Typography variant="body1" noWrap>
                            {message.text}
                          </Typography>
                        </Box>
                      }
                      secondary={
                        <Box sx={{ pl: 6 }}>
                          <Typography variant="caption" color="text.secondary">
                            {new Date(message.timestamp).toLocaleString('vi-VN')}
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                ))}
            </List>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: '1px solid #eee' }}>
          <Button 
            onClick={() => setShowHistory(false)}
            sx={{ borderRadius: 2 }}
          >
            Đóng
          </Button>
          {chatHistory.length > 0 && (
            <Button 
              onClick={clearChat}
              color="error"
              sx={{ borderRadius: 2 }}
            >
              Xóa tất cả
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </>
  );
};

export default StudentAnalysisChatbot;