import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from "react-router-dom";
import { getAllStudents } from '../../../redux/studentRelated/studentHandle';
import { deleteUser } from '../../../redux/userRelated/userHandle';
import {
    Paper, Box, IconButton, Typography, Chip
} from '@mui/material';
import PersonRemoveIcon from '@mui/icons-material/PersonRemove';
import { BlackButton, BlueButton, GreenButton, ButtonContainer } from '../../../components/buttonStyles';
import TableTemplate from '../../../components/TableTemplate';
import PersonAddAlt1Icon from '@mui/icons-material/PersonAddAlt1';
import SpeedDialTemplate from '../../../components/SpeedDialTemplate';
import SmartToyIcon from '@mui/icons-material/SmartToy';

import * as React from 'react';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
// import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { KeyboardArrowUp, KeyboardArrowDown } from '@mui/icons-material';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import Grow from '@mui/material/Grow';
import Popper from '@mui/material/Popper';
import MenuItem from '@mui/material/MenuItem';
import MenuList from '@mui/material/MenuList';
import Popup from '../../../components/Popup';
import StudentAnalysisChatbot from '../../../components/StudentAnalysisChatbot';
// Define the ShowStudents component
const ShowStudents = () => {

    const navigate = useNavigate()
    const dispatch = useDispatch();
    const { studentsList, loading, error, response } = useSelector((state) => state.student);
    const { currentUser } = useSelector(state => state.user)

    // Hardcoded student data
    const hardcodedStudents = [
        {
            _id: '1',
            name: 'Nguyễn Văn A',
            rollNum: '001',
            sclassName: { sclassName: 'Lớp 12A1' },
            attendance: '4/10',
            examMarks: { chapter1: 4, chapter2: 3, chapter3: 7 },
            accessFrequency: '15 lần/tháng'
        },
        {
            _id: '2',
            name: 'Nguyễn Linh A',
            rollNum: '002',
            sclassName: { sclassName: 'Lớp 12A1' },
            attendance: '9/10',
            examMarks: { chapter1: 9, chapter2: 9, chapter3: 10 },
            accessFrequency: '25 lần/tháng'
        }
    ];

    // Fetch all students when the component mounts
    useEffect(() => {
        dispatch(getAllStudents(currentUser._id));
    }, [currentUser._id, dispatch]);

    // Log any errors to the console
    if (error) {
        console.log(error);
    }

    const [showPopup, setShowPopup] = React.useState(false);
    const [chatbotOpen, setChatbotOpen] = React.useState(false);
    const [selectedStudent, setSelectedStudent] = React.useState(null);

    // State for managing popup messages
    // eslint-disable-next-line no-unused-vars
    const [message, setMessage] = React.useState("");

    const deleteHandler = (deleteID, address) => {
        console.log(deleteID);
        console.log(address);
        dispatch(deleteUser(deleteID, address))
            .then(() => {
                dispatch(getAllStudents(currentUser._id));
            })
    }

    // Define the columns for the students table
    const studentColumns = [
        { id: 'name', label: 'Tên', minWidth: 170 },
        { id: 'rollNum', label: 'Mã số', minWidth: 100 },
        { id: 'sclassName', label: 'Lớp', minWidth: 170 },
        { id: 'attendance', label: 'Điểm danh', minWidth: 120 },
        { id: 'examMarks', label: 'Bài kiểm tra', minWidth: 200 },
        { id: 'accessFrequency', label: 'Tần suất truy cập', minWidth: 150 },
        { id: 'analysis', label: 'Phân tích', minWidth: 150 },
    ]

    // Map the students data to the table rows format
    const studentRows = hardcodedStudents.map((student) => {
        return {
            name: student.name,
            rollNum: student.rollNum,
            sclassName: student.sclassName.sclassName,
            attendance: student.attendance,
            examMarks: `Ch1: ${student.examMarks.chapter1}, Ch2: ${student.examMarks.chapter2}, Ch3: ${student.examMarks.chapter3}`,
            accessFrequency: student.accessFrequency,
            id: student._id,
        };
    })

    // Define a component for the button in each row of the table
    const StudentButtonHaver = ({ row }) => {
        // Define the options for the dropdown menu
        const options = ['Take Attendance', 'Provide Marks'];

        // State for managing the dropdown menu
        const [open, setOpen] = React.useState(false);
        const anchorRef = React.useRef(null);
        const [selectedIndex, setSelectedIndex] = React.useState(0);

        const handleClick = () => {
            console.info(`You clicked ${options[selectedIndex]}`);
            // Handle the selected option
            if (selectedIndex === 0) {
                handleAttendance();
            } else if (selectedIndex === 1) {
                handleMarks();
            }
        };

        // Navigate to the attendance page
        const handleAttendance = () => {
            navigate("/Admin/students/student/attendance/" + row.id)
        }
        const handleMarks = () => {
            // Navigate to the marks page
            navigate("/Admin/students/student/marks/" + row.id)
        };

        const handleMenuItemClick = (event, index) => {
            setSelectedIndex(index);
            setOpen(false);
        };

        const handleToggle = () => {
            setOpen((prevOpen) => !prevOpen);
        };

        const handleClose = (event) => {
            if (anchorRef.current && anchorRef.current.contains(event.target)) {
                return;
            }

            setOpen(false);
        };
        return (
            // Render the buttons for each row
            <>
                <IconButton onClick={() => deleteHandler(row.id, "Student")}>
                    <PersonRemoveIcon color="error" />
                </IconButton>
                <BlueButton variant="contained"
                    onClick={() => navigate("/Admin/students/student/" + row.id)}>
                    View
                </BlueButton>
                <GreenButton variant="contained"
                    startIcon={<SmartToyIcon />}
                    onClick={() => {
                        setSelectedStudent(hardcodedStudents.find(s => s._id === row.id));
                        setChatbotOpen(true);
                    }}>
                    Phân tích
                </GreenButton>
                <React.Fragment>
                    <ButtonGroup variant="contained" ref={anchorRef} aria-label="split button">
                        <Button onClick={handleClick}>{options[selectedIndex]}</Button>
                        <BlackButton
                            size="small"
                            aria-controls={open ? 'split-button-menu' : undefined}
                            aria-expanded={open ? 'true' : undefined}
                            aria-label="select merge strategy"
                            aria-haspopup="menu"
                            onClick={handleToggle}
                        >
                            {open ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
                        </BlackButton>
                    </ButtonGroup>
                    <Popper
                        sx={{
                            zIndex: 1,
                        }}
                        open={open}
                        anchorEl={anchorRef.current}
                        role={undefined}
                        transition
                        disablePortal
                    >
                        {({ TransitionProps, placement }) => (
                            <Grow
                                {...TransitionProps}
                                style={{
                                    transformOrigin:
                                        placement === 'bottom' ? 'center top' : 'center bottom',
                                }}
                            >
                                <Paper>
                                    <ClickAwayListener onClickAway={handleClose}>
                                        <MenuList id="split-button-menu" autoFocusItem>
                                            {options.map((option, index) => (
                                                <MenuItem
                                                    key={option}
                                                    disabled={index === 2}
                                                    selected={index === selectedIndex}
                                                    onClick={(event) => handleMenuItemClick(event, index)}
                                                >
                                                    {option}
                                                </MenuItem>
                                            ))}
                                        </MenuList>
                                    </ClickAwayListener>
                                </Paper>
                            </Grow>
                        )}
                    </Popper>
                </React.Fragment>
            </>
        );
    };

    // Define the actions for the speed dial
    const actions = [
        {
            icon: <PersonAddAlt1Icon color="primary" />, name: 'Add New Student',
            action: () => navigate("/Admin/addstudents")
        },
        {
            icon: <PersonRemoveIcon color="error" />, name: 'Delete All Students',
            action: () => deleteHandler(currentUser._id, "Students")
        },
    ];

    // Render the component
    return (
        <>
            {loading ?
                <div>Loading...</div>
                :
                <>
                    <Paper sx={{ width: '100%', overflow: 'hidden' }}>
                        {Array.isArray(hardcodedStudents) && hardcodedStudents.length > 0 &&
                            <TableTemplate buttonHaver={StudentButtonHaver} columns={studentColumns} rows={studentRows} />
                        }
                        <SpeedDialTemplate actions={actions} />
                    </Paper>
                </>
            }
            <Popup message={message} setShowPopup={setShowPopup} showPopup={showPopup} />
            <StudentAnalysisChatbot 
                open={chatbotOpen} 
                onClose={() => setChatbotOpen(false)} 
                studentData={selectedStudent}
            />
        </>
    );
};
// Export the component
export default ShowStudents;
