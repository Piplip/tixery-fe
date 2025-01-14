import {useContext, useState} from "react";
import {
    Button,
    Checkbox,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControl,
    FormControlLabel, FormHelperText,
    InputLabel,
    MenuItem,
    Select,
    Stack,
    TextField
} from "@mui/material";
import {DatePicker, LocalizationProvider, TimePicker} from "@mui/x-date-pickers";
import {Tab, Tabs} from "@mui/material";
import "../../styles/date-and-location-form-styles.css"
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from "dayjs";
import CircleOutlinedIcon from "@mui/icons-material/CircleOutlined";
import PropTypes from "prop-types";
import EventIcon from '@mui/icons-material/Event';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import RadioButtonCheckedSharpIcon from '@mui/icons-material/RadioButtonCheckedSharp';
import * as Yup from 'yup';
import {useFormik} from "formik";
import Switch from '@mui/material/Switch';
import PriorityHighIcon from '@mui/icons-material/PriorityHigh';
import {EventContext} from "../../context.js";
import {useLocation} from "react-router-dom";

const checkboxStyle = {
    sx: {
        color: '#dedede',
        '&.Mui-checked': {
            color: '#1d76c4'
        },
    }
}

const CustomCheckbox = ({checked}) => {
    return (
        <Checkbox disabled checked={checked}
                  icon={<CircleOutlinedIcon />}
                  checkedIcon={<RadioButtonCheckedSharpIcon />}
                  {...checkboxStyle}
        />
    )
}

CustomCheckbox.propTypes = {
    checked: PropTypes.bool
}

const timezones = [
    {value: '7', label: 'GMT+7'},
    {value: '8', label: 'GMT+8'},
    {value: '9', label: 'GMT+9'},
    {value: '10', label: 'GMT+10'},
    {value: '-5', label: 'GMT-5'},
    {value: '-6', label: 'GMT-6'},
    {value: '-7', label: 'GMT-7'},
    {value: '-8', label: 'GMT-8'},
    {value: '0', label: 'GMT'},
    {value: '1', label: 'GMT+1'},
    {value: '2', label: 'GMT+2'},
    {value: '3', label: 'GMT+3'},
    {value: '4', label: 'GMT+4'},
    {value: '5', label: 'GMT+5'},
    {value: '6', label: 'GMT+6'},
    {value: '-1', label: 'GMT-1'},
    {value: '-2', label: 'GMT-2'},
    {value: '-3', label: 'GMT-3'},
    {value: '-4', label: 'GMT-4'},
    {value: '-9', label: 'GMT-9'},
    {value: '-10', label: 'GMT-10'},
    {value: '-11', label: 'GMT-11'},
    {value: '-12', label: 'GMT-12'}

];
const languages = [
    {value: 'en-US', label: 'English (US)'},
    {value: 'en-UK', label: 'English (UK)'},
    {value: 'vi', label: 'Vietnamese'},
    {value: 'fr', label: 'French'},
];

function DateAndLocationForm(){
    const [activeTab, setActiveTab] = useState("venue");
    const [open, setOpen] = useState(false);
    const {data, setData} = useContext(EventContext)
    const location = useLocation()
    const validationSchema = Yup.object().shape({
        timezone: Yup.string().required('Timezone is required'),
        language: Yup.string().required('Language is required'),
        location: Yup.string().required('Location is required'),
        eventDate: Yup.date().required('Event date is required'),
        eventStartTime: Yup.date().required('Event start time is required'),
        eventEndTime: Yup.date().required('Event end time is required')
            .test('is-greater', 'End time must be greater than start time', function (value) {
                return value > this.parent.eventStartTime;
            }),
    });

    const initialValues = {
        displayEndTime: data.displayEndTime,
        timezone: data.timezone,
        language: data.language,
        location: data.location || '',
        eventDate: data.eventDate !== undefined ? location.pathname.includes("edit") ? data.eventDate : dayjs(data.eventDate, 'DD/MM/YYYY') : null,
        eventStartTime: data.eventStartTime !== undefined ? location.pathname.includes("edit") ? data.eventStartTime : dayjs(data.eventStartTime, 'HH:mm') : null,
        eventEndTime: data.eventEndTime ? location.pathname.includes("edit") ? data.eventEndTime : dayjs(data.eventEndTime, 'HH:mm') : null,
    };

    const formik = useFormik({
        initialValues: initialValues,
        validationSchema: validationSchema,
        enableReinitialize: true,
        onSubmit: (values) => {
            setData(prev => ({...prev, timezone: values.timezone, language: values.language}));
            setOpen(false)
        }
    });

    function isValidData(){
        return formik.values.eventDate !== null && formik.values.eventStartTime !== null && formik.values.eventEndTime !== null
            && formik.values.timezone !== undefined && formik.values.location !== '' && formik.errors.eventDate === undefined
            && formik.errors.eventStartTime === undefined && formik.errors.eventEndTime === undefined
    }

    // TODO: Handle display timezone, language, display end time label

    return (
        <div className={`date-and-location ${isValidData() ? 'complete-section' : ''}`}>
            <h2>Date and Location</h2>
            <Stack rowGap={1}>
                <h3>Type of event</h3>
                <Stack direction={'row'} marginBottom={'1rem'} columnGap={1}>
                    <Button onClick={() => setData(prev => ({...prev, eventType: 'single'}))} sx={{border: '1px solid #bebebe'}}
                            className={`event-type__button ${
                                data.eventType === "single" || data.eventType === undefined ? "active" : ""
                            }`}
                    >
                        <EventIcon sx={{color: data.eventType === 'single' || data.eventType === undefined ? '#175486' : 'gray'}}/>
                        <Stack alignItems={'flex-start'}>
                            <p>Single event</p>
                            <p>For event that happen once</p>
                        </Stack>
                        <CustomCheckbox checked={data.eventType === 'single' || data.eventType === undefined}/>
                    </Button>
                    <Button onClick={() => setData(prev => ({...prev, eventType: 'recurring'}))} sx={{border: '1px solid #bebebe'}}
                            className={`event-type__button ${
                                data.eventType === "recurring" ? "active" : ""
                            }`}
                    >
                        <CalendarMonthIcon sx={{color: data.eventType === 'recurring' ? '#175486' : 'gray'}}/>
                        <Stack alignItems={'flex-start'}>
                            <p>Recurring event</p>
                            <p>For timed entry and multiple days</p>
                        </Stack>
                        <CustomCheckbox checked={data.eventType === 'recurring'}/>
                    </Button>
                </Stack>
            </Stack>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
                <div className="date-time-section">
                    <DatePicker format={'DD/MM/YYYY'} disablePast label="Event Date *"
                        value={formik.values.eventDate} name={'eventDate'}
                        onChange={(newValue) => {
                            setData(prev => ({...prev, eventDate: newValue.format('DD/MM/YYYY')}))
                            formik.setFieldValue('eventDate', newValue)
                        }}
                        slotProps={{
                            textField: {
                                onBlur: formik.handleBlur,
                                error: formik.touched.eventDate && Boolean(formik.errors.eventDate),
                                helperText: formik.touched.eventDate && formik.errors.eventDate,
                            },
                        }}
                    />
                    <TimePicker label="Start time *" ampm={false} name={'eventStartTime'}
                        value={formik.values.eventStartTime}
                        onChange={(newValue) => {
                            setData(prev => ({...prev, eventStartTime: newValue.format('HH:mm')}))
                            formik.setFieldValue('eventStartTime', newValue)
                        }}
                        slotProps={{
                            textField: {
                                onBlur: formik.handleBlur,
                                error: formik.touched.eventStartTime && Boolean(formik.errors.eventStartTime),
                                helperText: formik.touched.eventStartTime && formik.errors.eventStartTime,
                            },
                        }}
                    />
                    <TimePicker
                        label="End time *" ampm={false} name={'eventEndTime'}
                        value={formik.values.eventEndTime}
                        onChange={(newValue) => {
                            setData(prev => ({...prev, eventEndTime: newValue.format('HH:mm')}))
                            formik.setFieldValue('eventEndTime', newValue)
                        }}
                        slotProps={{
                            textField: {
                                onBlur: formik.handleBlur,
                                error: formik.touched.eventEndTime && Boolean(formik.errors.eventEndTime),
                                helperText: formik.touched.eventEndTime && formik.errors.eventEndTime,
                            },
                        }}
                    />
                </div>
            </LocalizationProvider>

            <p className={'date-and-location__more-options'}
                onClick={() => setOpen(true)}
            >More options</p>
            <p className="date-time-info">
                GMT+7, Display start and end time, English (US)
            </p>

            <div className="location-section">
                <h3>Location</h3>
                <Tabs
                    value={activeTab}
                    onChange={(e, newValue) => {
                        setActiveTab(newValue)
                        setData(prev => ({...prev, locationType: newValue}))
                    }}
                    aria-label="Location Tabs"
                >
                    <Tab label="Venue" value="venue"/>
                    <Tab label="Online event" value="online"/>
                    <Tab label="To be announced" value="tba"/>
                </Tabs>
                {activeTab === "venue" && (
                    <Stack>
                        <TextField label="Location *" fullWidth placeholder="Enter a location" margin="normal"
                                   name='location' onBlur={formik.handleBlur}
                            value={formik.values.location}
                                   onChange={(e) => {
                                       setData(prev => ({...prev, location: e.target.value}))
                                       formik.handleChange(e)
                                    }}
                                   error={formik.touched.location && !!formik.errors.location}
                                   helperText={formik.touched.location && formik.errors.location}
                        />
                        <div className={'location-venue__reserve-seating'}>
                            <Stack direction={'row'} justifyContent={'space-between'} alignItems={'center'}>
                                <p style={{fontWeight: 'bold'}}>Reserved seating</p>
                                <Switch checked={data.reserveSeating || false}
                                        onChange={() => setData(prev => ({...prev, reserveSeating: !prev.reserveSeating}))}/>
                            </Stack>
                            <p>Use your venue map to set price tiers for each section and choose whether attendees can
                                pick their seat.</p>
                        </div>
                        {isValidData() &&
                            <Stack className={'location-venue__verify-phone'} direction={'row'} alignItems={'center'} columnGap={2}>
                                <PriorityHighIcon sx={{backgroundColor: '#ffed41'}}/>
                                <Stack rowGap={1}>
                                    <p>Verify your phone number</p>
                                    <p>We&#39;ll send the phone number you enter a one-time verification code. This keeps Tixery a place to host real events.</p>
                                </Stack>
                                <Button variant={'text'} sx={{width: 'fit=content', fontSize: '.8rem'}}>Verify now</Button>
                            </Stack>
                        }
                    </Stack>
                )}
                {activeTab === "online" && (
                    <p className="online-event-info">
                        Online events have unique event pages where you can add links to
                        livestreams and more.
                    </p>
                )}
            </div>

            <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm">
                <DialogTitle textAlign={'center'}>
                    More options
                </DialogTitle>
                <form onSubmit={formik.handleSubmit}>
                    <DialogContent>
                        <div>
                            <FormControl fullWidth>
                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            name="displayEndTime"
                                            checked={formik.values.displayEndTime}
                                            onChange={formik.handleChange}
                                        />
                                    }
                                    label={
                                        <div>
                                            <strong>Display end time</strong>
                                            <p style={{fontSize: '0.9rem', margin: '0'}}>
                                                The time your event ends will appear on your event page
                                            </p>
                                        </div>
                                    }
                                />
                            </FormControl>
                        </div>

                        <div style={{marginTop: '16px'}}>
                            <FormControl fullWidth>
                                <InputLabel id="demo-simple-select-label">Timezone</InputLabel>
                                <Select
                                    label="Timezone"
                                    name="timezone"
                                    value={formik.values.timezone}
                                    onChange={formik.handleChange}
                                    error={formik.touched.timezone && !!formik.errors.timezone}
                                >
                                    {timezones.map((timezone, index) => (
                                        <MenuItem key={index} value={timezone.value}>
                                            {timezone.label}
                                        </MenuItem>
                                    ))}
                                </Select>
                                {formik.touched.timezone && formik.errors.timezone && (
                                    <FormHelperText error>{formik.errors.timezone}</FormHelperText>
                                )}
                            </FormControl>
                        </div>

                        <div style={{marginTop: '16px'}}>
                            <FormControl fullWidth>
                                <InputLabel>Language</InputLabel>
                                <Select
                                    name="language"
                                    label="Language"
                                    value={formik.values.language}
                                    onChange={formik.handleChange}
                                    error={formik.touched.language && !!formik.errors.language}
                                >
                                    {languages.map((lang) => (
                                        <MenuItem key={lang.label} value={lang.value}>
                                            {lang.label}
                                        </MenuItem>
                                    ))}
                                </Select>
                                {formik.touched.language && formik.errors.language && (
                                    <FormHelperText error>{formik.errors.language}</FormHelperText>
                                )}
                            </FormControl>
                        </div>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setOpen(false)} variant="outlined">
                            Cancel
                        </Button>
                        <Button type="submit" variant="contained" color="error">
                            Save
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>
        </div>
    );
}

export default DateAndLocationForm