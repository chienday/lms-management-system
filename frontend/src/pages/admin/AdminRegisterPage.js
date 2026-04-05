// Import necessary modules and components
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  TextField,
  Checkbox,
  FormControlLabel,
  IconButton,
  InputAdornment,
  CircularProgress,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import styled, { keyframes, createGlobalStyle } from "styled-components";
import bg from "../../assets/bg.png";
import { registerUser } from "../../redux/userRelated/userHandle";
import Popup from "../../components/Popup";

// ─── Global Style ─────────────────────────────────────────────────────
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

// ─── Animations ──────────────────────────────────────────────────────
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0); }
`;

// Subtle Ken Burns effect: slow zoom in/out
const kenBurns = keyframes`
  0% {
    transform: scale(1);
  }
  100% {
    transform: scale(1.1);
  }
`;

// ─── Layout Components ───────────────────────────────────────────────
const Page = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  background: linear-gradient(145deg, #f8fafc 0%, #f1f5f9 100%);
`;

const Container = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  max-width: 1280px;
  width: 100%;
  background: white;
  border-radius: 32px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.15);
  overflow: hidden;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
    max-width: 600px;
  }
`;

const FormPanel = styled.div`
  padding: 3rem 2.5rem;
  animation: ${fadeIn} 0.6s cubic-bezier(0.2, 0.9, 0.4, 1.1);

  @media (max-width: 768px) {
    padding: 2rem 1.5rem;
  }
`;

const Title = styled.h1`
  font-size: 2.2rem;
  font-weight: 700;
  color: #0f172a;
  margin-bottom: 0.5rem;

  @media (max-width: 480px) {
    font-size: 1.8rem;
  }
`;

const Subtitle = styled.p`
  color: #475569;
  font-size: 0.95rem;
  margin-bottom: 2rem;
`;

const StyledForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
`;

// Custom styled MUI TextField
const StyledTextField = styled(TextField)`
  & .MuiOutlinedInput-root {
    border-radius: 12px;
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

const Row = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 0.5rem;
  margin-bottom: 0.5rem;
`;

const StyledCheckbox = styled(Checkbox)`
  &.MuiCheckbox-root {
    color: #94a3b8;
    &.Mui-checked {
      color: #2563eb;
    }
  }
`;

const GradientButton = styled.button`
  background: linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%);
  color: white;
  border: none;
  border-radius: 40px;
  padding: 0.85rem;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.25s ease;
  box-shadow: 0 4px 12px rgba(30, 64, 175, 0.2);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(30, 64, 175, 0.3);
  }

  &:active {
    transform: translateY(1px);
  }
`;

const LoginLinkRow = styled.div`
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  margin-top: 1rem;
  font-size: 0.9rem;
  color: #475569;
`;

const LoginLink = styled(Link)`
  color: #2563eb;
  font-weight: 600;
  text-decoration: none;
  &:hover {
    text-decoration: underline;
  }
`;

// Enhanced ImagePanel with Ken Burns effect
const ImagePanel = styled.div`
  position: relative;
  overflow: hidden;
  background-color: #0f172a; /* fallback */
  min-height: 100%;

  &::before {
    content: '';
    position: absolute;
    top: -5%;
    left: -5%;
    right: -5%;
    bottom: -5%;
    background-image: url(${bg});
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    animation: ${kenBurns} 20s ease-in-out infinite alternate;
    will-change: transform;
  }

  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, rgba(30, 58, 138, 0.2) 0%, rgba(37, 99, 235, 0.1) 100%);
    pointer-events: none;
  }

  @media (max-width: 1024px) {
    display: none;
  }
`;

// ─── Component ────────────────────────────────────────────────────────
const AdminRegisterPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { status, currentUser, response, error, currentRole } = useSelector(
    (state) => state.user
  );

  // State variables
  const [toggle, setToggle] = useState(false);
  const [loader, setLoader] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [message, setMessage] = useState("");

  const [emailError, setEmailError] = useState(false);
  const [emailErrorMsg, setEmailErrorMsg] = useState("");
  const [passwordError, setPasswordError] = useState(false);
  const [passwordErrorMsg, setPasswordErrorMsg] = useState("");
  const [adminNameError, setAdminNameError] = useState(false);
  const [schoolNameError, setSchoolNameError] = useState(false);

  const role = "Admin";

  // Validation helper functions
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (pwd) => {
    return pwd && pwd.length >= 8;
  };

  const getPasswordStrengthMessage = (pwd) => {
    if (!pwd) return "Mật khẩu là bắt buộc";
    if (pwd.length < 8) return "Mật khẩu phải có ít nhất 8 ký tự";
    return "";
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const name = event.target.adminName.value;
    const schoolName = event.target.schoolName.value;
    const email = event.target.email.value;
    const password = event.target.password.value;

    // Clear previous errors
    let hasError = false;

    if (!name) {
      setAdminNameError(true);
      hasError = true;
    }
    if (!schoolName) {
      setSchoolNameError(true);
      hasError = true;
    }
    if (!email) {
      setEmailError(true);
      setEmailErrorMsg("Email là bắt buộc");
      hasError = true;
    } else if (!validateEmail(email)) {
      setEmailError(true);
      setEmailErrorMsg("Email không hợp lệ");
      hasError = true;
    }
    if (!password) {
      setPasswordError(true);
      setPasswordErrorMsg("Mật khẩu là bắt buộc");
      hasError = true;
    } else if (!validatePassword(password)) {
      setPasswordError(true);
      setPasswordErrorMsg("Mật khẩu phải có ít nhất 8 ký tự");
      hasError = true;
    }

    if (hasError) return;

    const fields = { name, email, password, role, schoolName };
    setLoader(true);
    dispatch(registerUser(fields, role));
  };

  const handleInputChange = (event) => {
    const { name } = event.target;
    if (name === "email") {
      setEmailError(false);
      setEmailErrorMsg("");
    }
    if (name === "password") {
      setPasswordError(false);
      setPasswordErrorMsg("");
    }
    if (name === "adminName") setAdminNameError(false);
    if (name === "schoolName") setSchoolNameError(false);
  };

  useEffect(() => {
    if (
      status === "success" ||
      (currentUser !== null && currentRole === "Admin")
    ) {
      navigate("/Admin/dashboard");
    } else if (status === "failed") {
      setMessage(response);
      setShowPopup(true);
      setLoader(false);
    } else if (status === "error") {
      console.log(error);
    }
  }, [status, currentUser, currentRole, navigate, error, response]);

  return (
    <>
      <GlobalStyle />
      <Page>
        <Container>
          <FormPanel>
            <Title>Đăng ký Admin</Title>
            <Subtitle>
              Đăng kí tài khoản ngay để bắt đầu quản lý trường học của bạn.
            </Subtitle>

            <StyledForm onSubmit={handleSubmit}>
              <StyledTextField
                margin="normal"
                required
                fullWidth
                id="adminName"
                label="Họ và tên"
                name="adminName"
                autoComplete="name"
                autoFocus
                error={adminNameError}
                helperText={adminNameError && "Tên là bắt buộc"}
                onChange={handleInputChange}
              />
              <StyledTextField
                margin="normal"
                required
                fullWidth
                id="schoolName"
                label="Tên trường học"
                name="schoolName"
                autoComplete="off"
                error={schoolNameError}
                helperText={schoolNameError && "Tên trường là bắt buộc"}
                onChange={handleInputChange}
              />
              <StyledTextField
                margin="normal"
                required
                fullWidth
                id="email"
                label="Email"
                name="email"
                autoComplete="email"
                error={emailError}
                helperText={emailError && emailErrorMsg}
                onChange={handleInputChange}
              />
              <StyledTextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Mật khẩu"
                type={toggle ? "text" : "password"}
                id="password"
                autoComplete="current-password"
                error={passwordError}
                helperText={passwordError && passwordErrorMsg}
                onChange={handleInputChange}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setToggle(!toggle)}>
                        {toggle ? <Visibility /> : <VisibilityOff />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              <Row>
                <FormControlLabel
                  control={<StyledCheckbox value="remember" color="primary" />}
                  label="Ghi nhớ tôi"
                />
              </Row>

              <GradientButton type="submit" disabled={loader}>
                {loader ? <CircularProgress size={24} color="inherit" /> : "Đăng ký"}
              </GradientButton>

              <LoginLinkRow>
                <span>Đã có tài khoản?</span>
                <LoginLink to="/Adminlogin">Đăng nhập</LoginLink>
              </LoginLinkRow>
            </StyledForm>
          </FormPanel>

          <ImagePanel />
        </Container>
      </Page>

      <Popup
        message={message}
        setShowPopup={setShowPopup}
        showPopup={showPopup}
      />
    </>
  );
};

export default AdminRegisterPage;