import "../../styles/create-event-styles.css"
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import {Button, Checkbox, IconButton, Stack, TextField} from "@mui/material";
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import {useRef, useState} from "react";
import CircleOutlinedIcon from "@mui/icons-material/CircleOutlined";
import {Link} from "react-router-dom";
import Dropdown from '@mui/joy/Dropdown';
import Menu from '@mui/joy/Menu';
import MenuButton from '@mui/joy/MenuButton';
import MenuItem from '@mui/joy/MenuItem';
import RadioButtonCheckedIcon from '@mui/icons-material/RadioButtonChecked';
import PropTypes from "prop-types";
import MediaUploader from "../MediaUploader.jsx";
import * as Yup from "yup";
import {useFormik} from "formik";
import ErrorOutlinedIcon from '@mui/icons-material/ErrorOutlined';
import TextAreaWithLimit from "../TextAreaWithLimit.jsx";
import DateAndLocationForm from "./DateAndLocationForm.jsx";
import OrganizerFAQ from "./OrganizerFAQ.jsx";

const checkboxStyle = {
    sx: {
        color: 'inherit',
        '&.Mui-checked': {
            color: '#0079c5'
        },
    }
}

const CustomCheckbox = ({checked}) => {
    return (
        <Checkbox disabled checked={checked}
            icon={<CircleOutlinedIcon />}
                  checkedIcon={<RadioButtonCheckedIcon />}
                  {...checkboxStyle}
        />
    )
}

CustomCheckbox.propTypes = {
    checked: PropTypes.bool
}

const steps = [
    {
        title: 'Build Event Page',
        description: 'Add all of your event details and let attendees know what to expect'
    },
    {
        title: 'Add Tickets',
        description: 'Create tickets and start selling'
    },
    {
        title: 'Promote Event',
        description: 'Share your event and track your progress'
    }
]

function CreateEvent() {
    const [currentStep, setCurrentStep] = useState(0);
    const [collapsed, setCollapsed] = useState({})
    const sectionRefs = useRef({});

    const validationSchema = Yup.object().shape({
        eventTitle: Yup.string()
            .required("Event title is required.")
            .max(100, "Event title cannot exceed 100 characters."),
        summary: Yup.string()
            .required("Summary is required.")
            .max(140, "Summary cannot exceed 140 characters."),
    });

    const formik = useFormik({
        initialValues: {
            eventTitle: "",
            summary: "",
        },
        validationSchema,
        onSubmit: (values) => {
            alert("Event Overview Submitted Successfully!");
        },
    });

    const handleExpandClick = (name) => {
        setCollapsed(prevState => {
            const newState = {...prevState, [name]: !prevState[name]};
            if (!prevState[name]) {
                setTimeout(() => {
                    if (!prevState[name]) {
                        setTimeout(() => {
                            sectionRefs.current[name].scrollIntoView({ behavior: 'smooth' });
                        }, 0);
                    }
                }, 0);
            }
            return newState;
        });
    };

    return (
        <div className={'create-events-wrapper'}>
            <div className={'create-events__stepper'}>
                <Link to={'/organizer/events'}>
                    <Stack className={'link'} direction={'row'} alignItems={'center'}>
                        <ChevronLeftIcon /> Back to events
                    </Stack>
                </Link>
                <div className={'create-events-stepper__main'}>
                    <Stack className={'create-events__summary'}>
                        <p>Event Title</p>
                        <Stack direction={'row'} alignItems={'center'} columnGap={1}>
                            <CalendarTodayIcon /> Thu, Feb 13, 2025, 10:00 AM
                        </Stack>
                        <Dropdown>
                            <MenuButton>
                                Draft <ArrowDropDownIcon />
                            </MenuButton>
                            <Menu>
                                <MenuItem className={'disabled'} disabled={currentStep !== 3}>Publish</MenuItem>
                            </Menu>
                        </Dropdown>
                    </Stack>
                    <Stack className={'create-events-stepper__wrapper'}>
                        <p>Steps</p>
                        <Stack className={'create-events-stepper__steps'} rowGap={1}>
                            {steps.map((step, index) => (
                                <div key={index} className={`create-events-stepper__step ${currentStep === index ? 'create-events-stepper__current-step' : ''}`}>
                                    <CustomCheckbox checked={currentStep === index}/>
                                    <div>
                                        <p>{step.title}</p>
                                        {currentStep === index &&
                                            <p>{step.description}</p>
                                        }
                                    </div>
                                </div>
                            ))}
                        </Stack>
                    </Stack>
                </div>
            </div>
            <div className={'create-events__main'}>
                <MediaUploader />
                <Stack className={`create-events-main__event-title`} ref={el => sectionRefs.current['eventTitle'] = el}>
                    <div className={'expand-btn'} onClick={() => {
                        handleExpandClick('eventTitle')
                    }}>
                        {!collapsed.eventTitle ? '+' : '-'}
                    </div>
                    {!collapsed.eventTitle ?
                        <div onClick={
                            () => handleExpandClick('eventTitle')
                        }>
                            <p className={'create-events-title__title'}>Event Title</p>
                            <p>A short and sweet sentence about your event</p>
                        </div>
                        :
                        <form onSubmit={formik.handleSubmit}>
                            <Stack spacing={4} className="event-overview-form">
                                <div>
                                    <h2>Event Overview</h2>
                                </div>
                                <div>
                                    <label htmlFor="eventTitle" className="form-label">
                                        Event title
                                    </label>
                                    <p className="form-description">
                                        Be clear and descriptive with a title that tells people what your event is
                                        about.
                                    </p>
                                    <div className="input-wrapper">
                                        <TextField
                                            id="eventTitle"
                                            name="eventTitle"
                                            variant="outlined"
                                            fullWidth
                                            error={formik.touched.eventTitle && Boolean(formik.errors.eventTitle)}
                                            helperText={formik.touched.eventTitle && formik.errors.eventTitle}
                                            value={formik.values.eventTitle}
                                            onChange={formik.handleChange}
                                            onBlur={formik.handleBlur}
                                            InputProps={{
                                                endAdornment: formik.errors.eventTitle && (
                                                    <IconButton disabled>
                                                        <ErrorOutlinedIcon color="error"/>
                                                    </IconButton>
                                                ),
                                            }}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label htmlFor="summary" className="form-label">
                                        Summary
                                    </label>
                                    <p className="form-description">
                                        Grab people&#39;s attention with a short description about your event. Attendees
                                        will
                                        see this at the
                                        top of your event page. (140 characters max){" "}
                                        <a href="#" className="see-examples">
                                            See examples
                                        </a>
                                    </p>
                                    <TextAreaWithLimit name={'summary'} handleChange={formik.handleChange} value={formik.values.summary}
                                        maxChars={500}  error={formik.touched.summary && Boolean(formik.errors.summary)}
                                                       helperText={formik.touched.summary && formik.errors.summary}
                                                       onBlur={formik.handleBlur}
                                    />
                                </div>
                                <div>
                                    <Button
                                        variant="outlined"
                                        className="suggest-summary-btn"
                                        type="button"
                                        onClick={() => alert("Suggested summary feature coming soon!")}
                                    >
                                        ⚡ Suggest summary
                                    </Button>
                                </div>
                            </Stack>
                        </form>
                    }
                </Stack>
                <DateAndLocationForm />
                <OrganizerFAQ />
                <button className={'create-events-main__continue-btn'}>
                    CONTINUE
                </button>
            </div>
        </div>
    )
}

export default CreateEvent;