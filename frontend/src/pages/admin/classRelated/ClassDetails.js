/* eslint-disable no-unused-vars */ // Disable eslint warnings for unused variables

import { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom'
import { getClassDetails, getClassStudents, getSubjectList } from "../../../redux/sclassRelated/sclassHandle";
import { deleteUser } from '../../../redux/userRelated/userHandle';
import axios from 'axios';
import styled from 'styled-components';
 
import { Button, CircularProgress } from '@mui/material';
import {
    Box, Container, Typography, Tab, Card, CardContent, Chip, Grid, Dialog, DialogTitle, DialogContent, DialogActions, TextField,
} from '@mui/material';
import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';
import TabPanel from '@mui/lab/TabPanel';
import { resetSubjects } from "../../../redux/sclassRelated/sclassSlice";
import { BlueButton, PurpleButton, GreenButton } from "../../../components/buttonStyles";
import TableTemplate from "../../../components/TableTemplate";
import PersonAddAlt1Icon from '@mui/icons-material/PersonAddAlt1';
import PersonRemoveIcon from '@mui/icons-material/PersonRemove';
import SpeedDialTemplate from "../../../components/SpeedDialTemplate";
import Popup from "../../../components/Popup";
import DeleteIcon from "@mui/icons-material/Delete";
import PostAddIcon from '@mui/icons-material/PostAdd';
import EditIcon from '@mui/icons-material/Edit';
import SchoolIcon from '@mui/icons-material/School';

const REACT_APP_BASE_URL = "http://localhost:5000";

const ClassDetails = () => {
    // Initialize necessary hooks and state variables
    const params = useParams()
    const navigate = useNavigate()
    const dispatch = useDispatch();
    const { subjectsList, sclassStudents, sclassDetails, loading, error, response, getresponse } = useSelector((state) => state.sclass);

    const classID = params.id
    const [value, setValue] = useState('1');
    const [showPopup, setShowPopup] = useState(false);
    const [message, setMessage] = useState("");
    const [teachingAssignments, setTeachingAssignments] = useState([]);
    const [loadingAssignments, setLoadingAssignments] = useState(false);
    const [editingStudent, setEditingStudent] = useState(null);
    const [editStudentData, setEditStudentData] = useState({});

    useEffect(() => {
        // Fetch class details, subject list, and class students on component mount
        dispatch(getClassDetails(classID, "Sclass"));
        dispatch(getSubjectList(classID, "ClassSubjects"))
        dispatch(getClassStudents(classID));
        fetchTeachingAssignments();
    }, [dispatch, classID])

    const fetchTeachingAssignments = async () => {
        try {
            setLoadingAssignments(true);
            // Get the admin ID from the current user (from sclassDetails once loaded)
            // For now, we'll fetch all assignments for the school
            // This will be populated after sclassDetails is loaded
        } catch (err) {
            console.error("Error fetching teaching assignments:", err);
        } finally {
            setLoadingAssignments(false);
        }
    }

    const fetchClassTeachingAssignments = useCallback(async () => {
        try {
            setLoadingAssignments(true);
            const response = await axios.get(
                `${REACT_APP_BASE_URL}/TeachingAssignment/All/${sclassDetails.school}`
            );
            
            if (response.data && response.data.assignments) {
                // Filter assignments for current class
                const classAssignments = response.data.assignments.filter(assignment => 
                    assignment.classes && assignment.classes.some(c => c._id === classID)
                );
                setTeachingAssignments(classAssignments);
            }
        } catch (err) {
            console.error("Error fetching teaching assignments:", err);
        } finally {
            setLoadingAssignments(false);
        }
    }, [sclassDetails, classID]);

    useEffect(() => {
        if (sclassDetails && sclassDetails.school) {
            fetchClassTeachingAssignments();
        }
    }, [sclassDetails, classID, fetchClassTeachingAssignments])

    if (error) {
        console.log(error)
    }

    const handleChange = (event, newValue) => {
        setValue(newValue);
    };

    const deleteHandler = (deleteID, address) => {
        console.log(deleteID);
        console.log(address);

        dispatch(deleteUser(deleteID, address))
            .then(() => {
                dispatch(getClassStudents(classID));
                dispatch(resetSubjects())
                dispatch(getSubjectList(classID, "ClassSubjects"))
            })
    }

    const subjectColumns = [
        { id: 'name', label: 'Tên môn', minWidth: 170 },
        { id: 'sessions', label: 'Số buổi', minWidth: 100 },
    ]

    const subjectRows = subjectsList && subjectsList.length > 0 && subjectsList.map((subject) => {
        return {
            name: subject.subName,
            sessions: subject.sessions || 0,
            id: subject._id,
        };
    })

    const SubjectsButtonHaver = ({ row }) => {
        return (
            <>
                <DeleteIcon color="error" onClick={() => deleteHandler(row.id, "Subject")} style={{ cursor: 'pointer' }} />
                <BlueButton
                    variant="contained"
                    onClick={() => {
                        navigate(`/Admin/class/subject/${classID}/${row.id}`)
                    }}
                >
                    Xem
                </BlueButton >
            </>
        );
    };

    const subjectActions = [
        {
            icon: <PostAddIcon color="primary" />, name: 'Thêm môn học',
            action: () => navigate("/Admin/addsubject/" + classID)
        },
        {
            icon: <DeleteIcon color="error" />, name: 'Xóa tất cả môn',
            action: () => deleteHandler(classID, "SubjectsClass")
        }
    ];

    const ClassSubjectsSection = () => {
        return (
            <>
                {response ?
                    <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: '16px', paddingTop: '15px' }}>
                        <GreenButton
                            variant="contained"
                            onClick={() => navigate("/Admin/addsubject/" + classID)}
                        >
                            Thêm môn học
                        </GreenButton>
                    </Box>
                    :
                    <>
                        <Typography variant="h5" gutterBottom sx={{ mb: 2 }}>
                            📚 Danh sách môn học
                        </Typography>
                        <TableTemplate buttonHaver={SubjectsButtonHaver} columns={subjectColumns} rows={subjectRows} />
                        <SpeedDialTemplate actions={subjectActions} />
                    </>
                }
            </>
        )
    }

    const studentColumns = [
        { id: 'name', label: 'Họ tên', minWidth: 170 },
        { id: 'rollNum', label: 'MSSV', minWidth: 100 },
    ]

    const studentRows = sclassStudents && sclassStudents.map((student) => {
        return {
            name: student.name,
            rollNum: student.rollNum,
            id: student._id,
        };
    })

    const StudentsButtonHaver = ({ row }) => {
        return (
            <>
                <Box sx={{ display: 'flex', gap: 1 }}>
                    <DeleteIcon 
                        color="error" 
                        onClick={() => deleteHandler(row.id, "Student")} 
                        style={{ cursor: 'pointer' }}
                    />
                    <BlueButton
                        size="small"
                        variant="contained"
                        onClick={() => navigate("/Admin/students/student/" + row.id)}
                    >
                        Xem
                    </BlueButton>
                    
                </Box>
            </>
        );
    };

    const studentActions = [
        {
            icon: <PersonAddAlt1Icon color="primary" />, name: 'Thêm sinh viên',
            action: () => navigate("/Admin/class/addstudents/" + classID)
        },
        {
            icon: <PersonRemoveIcon color="error" />, name: 'Xóa tất cả sinh viên',
            action: () => deleteHandler(classID, "StudentsClass")
        },
    ];

    const ClassStudentsSection = () => {
        return (
            <>
                {getresponse ? (
                    <>
                        <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center', marginTop: '16px' }}>
                            <GreenButton
                                variant="contained"
                                onClick={() => navigate("/Admin/class/addstudents/" + classID)}
                            >
                                Thêm sinh viên
                            </GreenButton>
                        </Box>
                    </>
                ) : (
                    <>
                        <Typography variant="h5" gutterBottom sx={{ mb: 2 }}>
                            Danh sách sinh viên ({studentRows ? studentRows.length : 0})
                        </Typography>
                        <TableTemplate buttonHaver={StudentsButtonHaver} columns={studentColumns} rows={studentRows} />
                        <SpeedDialTemplate actions={studentActions} />
                    </>
                )}
            </>
        )
    }

    const TeacherSubjectCard = ({ assignment }) => {
        return (
            <Card sx={{ mb: 2, transition: 'all 0.2s', '&:hover': { boxShadow: 3 } }}>
                <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                        <Box>
                            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                                <SchoolIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                                {assignment.subject?.subName || 'N/A'}
                            </Typography>
                            <Box sx={{ mb: 1 }}>
                                <Typography variant="body2" color="textSecondary">
                                    Giáo viên: <strong>{assignment.teacher?.name || 'N/A'}</strong>
                                </Typography>
                                <Typography variant="body2" color="textSecondary">
                                    Email: {assignment.teacher?.email || 'N/A'}
                                </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                                {assignment.status && (
                                    <Chip
                                        label={assignment.status}
                                        color={assignment.status === 'active' ? 'success' : 'default'}
                                        size="small"
                                    />
                                )}
                            </Box>
                        </Box>
                    </Box>
                </CardContent>
            </Card>
        );
    };

    const ClassTeachersSection = () => {
        return (
            <>
                <Typography variant="h5" gutterBottom sx={{ mb: 2 }}>
                     Giáo viên phụ trách
                </Typography>
                {loadingAssignments ? (
                    <CircularProgress />
                ) : teachingAssignments && teachingAssignments.length > 0 ? (
                    <Box>
                        {teachingAssignments.map((assignment, idx) => (
                            <TeacherSubjectCard key={idx} assignment={assignment} />
                        ))}
                    </Box>
                ) : (
                    <Typography color="textSecondary" sx={{ textAlign: 'center', py: 4 }}>
                        Chưa có giáo viên được phân công cho lớp này
                    </Typography>
                )}
            </>
        )
    }

    const ClassDetailsSection = () => {
        const numberOfSubjects = subjectsList ? subjectsList.length : 0;
        const numberOfStudents = sclassStudents ? sclassStudents.length : 0;

        return (
            <>
                <HeaderCard sx={{ boxShadow: 3, p: 3, mb: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                        <Box sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '60px',
                            height: '60px',
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            borderRadius: '12px',
                            color: 'white'
                        }}>
                            <SchoolIcon sx={{ fontSize: '32px' }} />
                        </Box>
                        <Box>
                            <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'white' }}>
                                {sclassDetails && sclassDetails.sclassName}
                            </Typography>
                            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', mt: 0.5 }}>
                                Quản lý lớp học và thông tin liên quan
                            </Typography>
                        </Box>
                    </Box>
                    
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={6} md={3}>
                            <StatCardItem>
                                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', mb: 1 }}>Sinh viên</Typography>
                                <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'white' }}>{numberOfStudents}</Typography>
                            </StatCardItem>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <StatCardItem>
                                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', mb: 1 }}>Môn học</Typography>
                                <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'white' }}>{numberOfSubjects}</Typography>
                            </StatCardItem>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <StatCardItem>
                                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', mb: 1 }}>Giáo viên</Typography>
                                <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'white' }}>{teachingAssignments.length}</Typography>
                            </StatCardItem>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <StatCardItem>
                                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', mb: 1 }}>Tổng hợp</Typography>
                                <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'white' }}>{numberOfStudents + numberOfSubjects}</Typography>
                            </StatCardItem>
                        </Grid>
                    </Grid>
                </HeaderCard>

                <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
                    <ActionButton
                        variant="contained"
                        onClick={() => navigate("/Admin/class/addstudents/" + classID)}
                        startIcon={<PersonAddAlt1Icon />}
                    >
                        Thêm sinh viên
                    </ActionButton>
                    <ActionButton
                        variant="contained"
                        onClick={() => navigate("/Admin/addsubject/" + classID)}
                        startIcon={<PostAddIcon />}
                        sx={{ background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)' }}
                    >
                        Thêm môn học
                    </ActionButton>
                </Box>
            </>
        );
    }
    return (
        <>
            {loading ? (
                <LoadingContainer>
                    <CircularProgress />
                    <Typography sx={{ mt: 2 }}>Đang tải dữ liệu...</Typography>
                </LoadingContainer>
            ) : (
                <>
                    <StyledContainer>
                        <TabContext value={value}>
                            <StyledTabListContainer>
                                <StyledTabList onChange={handleChange} sx={{
                                    '& .MuiTabs-indicator': {
                                        background: 'linear-gradient(135deg, #667eea 0%, 100%)',
                                        height: '3px',
                                    }
                                }}>
                                    <StyledTab label="Tổng quan" value="1" />
                                    <StyledTab label="Môn học" value="2" />
                                    <StyledTab label="Sinh viên" value="3" />
                                    <StyledTab label="Giáo viên" value="4" />
                                </StyledTabList>
                            </StyledTabListContainer>
                            <TabContentContainer>
                                <TabPanel value="1" sx={{ p: 0 }}>
                                    <ClassDetailsSection />
                                </TabPanel>
                                <TabPanel value="2" sx={{ p: 0 }}>
                                    <ClassSubjectsSection />
                                </TabPanel>
                                <TabPanel value="3" sx={{ p: 0 }}>
                                    <ClassStudentsSection />
                                </TabPanel>
                                <TabPanel value="4" sx={{ p: 0 }}>
                                    <ClassTeachersSection />
                                </TabPanel>
                            </TabContentContainer>
                        </TabContext>
                    </StyledContainer>
                </>
            )}
            <Popup message={message} setShowPopup={setShowPopup} showPopup={showPopup} />
        </>
    );
};

export default ClassDetails;

// Styled Components
const LoadingContainer = styled(Box)`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: 500px;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  border-radius: 12px;
`;

const StyledContainer = styled(Box)`
  width: 100%;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  min-height: 100vh;
  padding: 24px;
  typography: body1;
`;

const StyledTabListContainer = styled(Box)`
  background: white;
  border-radius: 12px 12px 0 0;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  overflow: hidden;
`;

const StyledTabList = styled(TabList)`
  & .MuiTabs-scroller {
    display: flex;
  }
`;

const StyledTab = styled(Tab)`
  font-weight: 600;
  font-size: 14px;
  text-transform: none;
  color: #666;
  transition: all 0.3s ease;
  
  &.Mui-selected {
    color: #667eea;
    font-weight: 700;
  }

  &:hover {
    color: #667eea;
    background: rgba(102, 126, 234, 0.05);
  }
`;

const TabContentContainer = styled(Container)`
  background: white;
  border-radius: 0 0 12px 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  margin-top: 0;
  padding: 24px !important;
  margin-bottom: 48px;

  @media (max-width: 768px) {
    padding: 16px !important;
  }
`;

const HeaderCard = styled(Card)`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
  color: white;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(102, 126, 234, 0.2);
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 32px rgba(102, 126, 234, 0.3);
  }
`;

const StatCardItem = styled(Box)`
  background: rgba(255, 255, 255, 0.15);
  padding: 16px;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);

  &:hover {
    background: rgba(255, 255, 255, 0.25);
    transform: translateY(-2px);
  }
`;

const ActionButton = styled(Button)`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  font-weight: 600;
  font-size: 15px;
  padding: 10px 24px;
  border-radius: 8px;
  text-transform: none;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.2);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
  }

  &:disabled {
    background: rgba(0, 0, 0, 0.12);
    color: rgba(0, 0, 0, 0.38);
  }
`;
