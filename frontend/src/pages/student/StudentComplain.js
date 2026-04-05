import { useEffect, useState } from "react";
import {
    Box,
    CircularProgress,
    Stack,
    TextField,
    Typography,
    Paper,
    Divider,
} from "@mui/material";
import styled, { keyframes, createGlobalStyle } from "styled-components";
import Popup from "../../components/Popup";
import { addStuff } from "../../redux/userRelated/userHandle";
import { useDispatch, useSelector } from "react-redux";
import { Send, FeedbackOutlined } from "@mui/icons-material";

// ─── Global style ────────────────────────────────────────────────────
const GlobalStyle = createGlobalStyle`
  body {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  }
`;

// ─── Animations ──────────────────────────────────────────────────────
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0); }
`;

// ─── Styled Components ───────────────────────────────────────────────
const FormContainer = styled(Box)`
  flex: 1 1 auto;
  align-items: center;
  display: flex;
  justify-content: center;
  min-height: 80vh;
  padding: 1.5rem;
  animation: ${fadeIn} 0.6s ease;
`;

const FormCard = styled(Paper)`
  max-width: 680px;
  width: 100%;
  padding: 2rem;
  border-radius: 32px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.15);
  background: white;
  transition: transform 0.2s ease;
  
  &:hover {
    transform: translateY(-2px);
  }
`;

const HeaderIcon = styled(Box)`
  display: flex;
  justify-content: center;
  margin-bottom: 1rem;
  color: #2563eb;
`;

const Title = styled(Typography)`
  font-weight: 700;
  color: #0f172a;
  margin-bottom: 0.5rem;
  text-align: center;
`;

const Subtitle = styled(Typography)`
  color: #475569;
  margin-bottom: 2rem;
  text-align: center;
  max-width: 80%;
  margin-left: auto;
  margin-right: auto;
`;

const StyledTextField = styled(TextField)`
  & .MuiOutlinedInput-root {
    border-radius: 16px;
    background-color: #f8fafc;
    transition: all 0.2s ease;

    &:hover fieldset {
      border-color: #94a3b8;
    }

    &.Mui-focused fieldset {
      border-color: #2563eb;
      border-width: 2px;
    }
  }

  & .MuiInputLabel-root {
    color: #64748b;
    &.Mui-focused {
      color: #2563eb;
    }
  }
`;

const SubmitButton = styled.button`
  background: linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%);
  color: white;
  border: none;
  border-radius: 40px;
  padding: 12px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.25s ease;
  box-shadow: 0 4px 12px rgba(30, 64, 175, 0.2);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  margin-top: 1.5rem;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(30, 64, 175, 0.3);
  }

  &:disabled {
    background: #cbd5e1;
    transform: none;
    box-shadow: none;
    cursor: not-allowed;
  }
`;

const StudentComplain = () => {
    const [complaint, setComplaint] = useState("");
    const [date, setDate] = useState("");
    const dispatch = useDispatch();
    const { status, currentUser, error } = useSelector((state) => state.user);

    const user = currentUser?._id;
    const school = currentUser?.school?._id;
    const address = "Complain";

    const [loader, setLoader] = useState(false);
    const [message, setMessage] = useState("");
    const [showPopup, setShowPopup] = useState(false);

    const fields = { user, date, complaint, school };

    const submitHandler = (event) => {
        event.preventDefault();
        if (!user || !school) {
            setMessage("Không tìm thấy thông tin sinh viên");
            setShowPopup(true);
            return;
        }
        setLoader(true);
        dispatch(addStuff(fields, address));
    };

    useEffect(() => {
        if (status === "added") {
            setLoader(false);
            setShowPopup(true);
            setMessage("Gửi phản ánh thành công");
            setComplaint("");
            setDate("");
        } else if (error) {
            setLoader(false);
            setShowPopup(true);
            setMessage("Lỗi kết nối mạng");
        }
    }, [status, error]);

    return (
        <>
            <GlobalStyle />
            <FormContainer>
                <FormCard elevation={0}>
                    <HeaderIcon>
                        <FeedbackOutlined sx={{ fontSize: 48, color: "#2563eb" }} />
                    </HeaderIcon>
                    <Title variant="h4">Gửi phản ánh</Title>

                    <Divider sx={{ mb: 3 }} />
                    <form onSubmit={submitHandler}>
                        <Stack spacing={3}>
                            <StyledTextField
                                fullWidth
                                label="Ngày phản ánh"
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                required
                                InputLabelProps={{ shrink: true }}
                            />
                            <StyledTextField
                                fullWidth
                                label="Nội dung phản ánh"
                                placeholder="Mô tả chi tiết vấn đề..."
                                variant="outlined"
                                value={complaint}
                                onChange={(e) => setComplaint(e.target.value)}
                                required
                                multiline
                                rows={6}
                            />
                            <SubmitButton type="submit" disabled={loader}>
                                {loader ? <CircularProgress size={24} color="inherit" /> : "Gửi phản ánh"}
                                {!loader && <Send fontSize="small" />}
                            </SubmitButton>
                        </Stack>
                    </form>
                </FormCard>
            </FormContainer>
            <Popup message={message} setShowPopup={setShowPopup} showPopup={showPopup} />
        </>
    );
};

export default StudentComplain;