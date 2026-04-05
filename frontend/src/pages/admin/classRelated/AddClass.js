// Import necessary modules and components
import React, { useEffect, useState } from "react";
import { Box, Button, CircularProgress, Stack, TextField, InputAdornment, Typography } from "@mui/material";
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { addStuff } from '../../../redux/userRelated/userHandle';
import { underControl } from '../../../redux/userRelated/userSlice';
// eslint-disable-next-line no-unused-vars
import { BlueButton, ButtonContainer } from "../../../components/buttonStyles";
import Popup from "../../../components/Popup";
import styled from "styled-components";
import SchoolIcon from '@mui/icons-material/School';

// Define the AddClass component
const AddClass = () => {
    const [sclassName, setSclassName] = useState("");

    const dispatch = useDispatch()
    const navigate = useNavigate()

    const userState = useSelector(state => state.user);
    const { status, currentUser, response, error, tempDetails } = userState;

    const adminID = currentUser._id
    const address = "Sclass"

    const [loader, setLoader] = useState(false)
    const [message, setMessage] = useState("");
    const [showPopup, setShowPopup] = useState(false);

    // Prepare the fields to be sent to the server
    const fields = {
        sclassName,
        adminID,
    };

    const submitHandler = (event) => {
        // Prevent the default form submission behavior
        event.preventDefault()
        setLoader(true)
        dispatch(addStuff(fields, address))
    };

    useEffect(() => {
        if (status === 'added' && tempDetails) {
            // Navigate to the class details page if the class was added successfully
            navigate("/Admin/classes/class/" + tempDetails._id)
            dispatch(underControl())
            setLoader(false)
        }
        else if (status === 'failed') {
            setMessage(response)
            setShowPopup(true)
            setLoader(false)
        }
        else if (status === 'error') {
            setMessage("Network Error")
            setShowPopup(true)
            setLoader(false)
        }
    }, [status, navigate, error, response, dispatch, tempDetails]);
    // Render the component
    return (
        <>
            <StyledContainer>
                <StyledBox>
                    <Box sx={{ textAlign: 'center', mb: 3 }}>
                        <Box sx={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '80px',
                            height: '80px',
                            background: 'linear-gradient(135deg, #667eea 100%)',
                            borderRadius: '16px',
                            mb: 2,
                            color: 'white'
                        }}>
                            <SchoolIcon sx={{ fontSize: '40px' }} />
                        </Box>
                        <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#1a1a1a', mb: 1 }}>
                            Tạo Lớp Mới
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                            Điền thông tin để tạo một lớp học mới
                        </Typography>
                    </Box>

                    {/** Add class form */}
                    <form onSubmit={submitHandler}>
                        <Stack spacing={3}>
                            <Box sx={{
                                position: 'relative',
                                background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)',
                                padding: '16px',
                                borderRadius: '12px',
                                border: '1px solid rgba(102, 126, 234, 0.1)'
                            }}>
                                <TextField
                                    label="Tên lớp"
                                    variant="outlined"
                                    fullWidth
                                    value={sclassName}
                                    onChange={(event) => {
                                        setSclassName(event.target.value);
                                    }}
                                    required
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                Nhập tên lớp VD:10A1,..
                                            </InputAdornment>
                                        ),
                                    }}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            background: 'white',
                                            '&:hover fieldset': {
                                                borderColor: '#667eea',
                                            },
                                            '&.Mui-focused fieldset': {
                                                borderColor: '#667eea',
                                            },
                                        },
                                        '& .MuiInputBase-input': {
                                            fontSize: '16px',
                                        },
                                    }}
                                />
                            </Box>

                            <GradientButton
                                fullWidth
                                size="large"
                                variant="contained"
                                type="submit"
                                disabled={loader}
                            >
                                {loader ? <CircularProgress size={24} color="inherit" /> : "Tạo Lớp"}
                            </GradientButton>

                            <OutlinedButton 
                                fullWidth
                                variant="outlined" 
                                onClick={() => navigate(-1)}
                                disabled={loader}
                            >
                                ← Quay lại
                            </OutlinedButton>
                        </Stack>
                    </form>
                </StyledBox>
            </StyledContainer>
            <Popup message={message} setShowPopup={setShowPopup} showPopup={showPopup} />
        </>
    )
}

// Export the AddClass component
export default AddClass

const StyledContainer = styled(Box)`
  flex: 1 1 auto;
  align-items: center;
  display: flex;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 100%);
  min-height: 100vh;
  padding: 20px;
`;

const StyledBox = styled(Box)`
  max-width: 500px;
  width: 100%;
  padding: 50px 40px;
  background-color: white;
  box-shadow: 0 10px 40px rgba(102, 126, 234, 0.2);
  border-radius: 16px;
  border: 1px solid rgba(102, 126, 234, 0.1);
  animation: slideInUp 0.5s ease-out;

  @keyframes slideInUp {
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

const GradientButton = styled(Button)`
  background: linear-gradient(135deg, #667eea 100%);
  color: white;
  font-weight: 600;
  font-size: 16px;
  padding: 12px;
  border-radius: 8px;
  transition: all 0.3s ease;
  text-transform: none;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(102, 126, 234, 0.4);
  }

  &:disabled {
    background: rgba(0, 0, 0, 0.12);
    color: rgba(0, 0, 0, 0.38);
  }
`;

const OutlinedButton = styled(Button)`
  border: 2px solid #667eea;
  color: #667eea;
  font-weight: 600;
  font-size: 16px;
  padding: 10px;
  border-radius: 8px;
  transition: all 0.3s ease;
  text-transform: none;

  &:hover {
    background: rgba(102, 126, 234, 0.05);
    border-color: #764ba2;
    color: #764ba2;
  }

  &:disabled {
    border-color: rgba(0, 0, 0, 0.12);
    color: rgba(0, 0, 0, 0.38);
  }
`;
