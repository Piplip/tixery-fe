import {useState} from "react";
import {
    Button,
    Checkbox, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, FormControlLabel, MenuItem,
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
import {Field, Form, Formik} from "formik";

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

const timezones = ['GMT+7', 'GMT+5', 'GMT+1', 'UTC'];
const languages = ['English (US)', 'English (UK)', 'Spanish', 'French'];

const MoreOptionsSchema = Yup.object().shape({
    timezone: Yup.string().required('Timezone is required'),
    language: Yup.string().required('Language is required'),
});

const initialValues = {
    displayEndTime: true,
    timezone: '',
    language: 'English (US)',
};

function DateAndLocationForm(){
    const [eventType, setEventType] = useState("single");
    const [selectedDate, setSelectedDate] = useState(dayjs());
    const [startTime, setStartTime] = useState(dayjs().hour(10).minute(0));
    const [endTime, setEndTime] = useState(dayjs().hour(12).minute(0));
    const [activeTab, setActiveTab] = useState("venue");
    const [open, setOpen] = useState(false);

    return (
        <div className="date-and-location">
            <h2>Date and Location</h2>
            <Stack rowGap={1}>
                <h3>Type of event</h3>
                <Stack direction={'row'} marginBottom={'1rem'} columnGap={1}>
                    <Button onClick={() => setEventType("single")} sx={{border: '1px solid #bebebe'}}
                            className={`event-type__button ${
                                eventType === "single" ? "active" : ""
                            }`}
                    >
                        <EventIcon sx={{color: eventType === 'single' ? '#175486' : 'gray'}}/>
                        <Stack alignItems={'flex-start'}>
                            <p>Single event</p>
                            <p>For event that happen once</p>
                        </Stack>
                        <CustomCheckbox checked={eventType === 'single'}/>
                    </Button>
                    <Button onClick={() => setEventType("recurring")} sx={{border: '1px solid #bebebe'}}
                            className={`event-type__button ${
                                eventType === "recurring" ? "active" : ""
                            }`}
                    >
                        <CalendarMonthIcon sx={{color: eventType === 'recurring' ? '#175486' : 'gray'}}/>
                        <Stack alignItems={'flex-start'}>
                            <p>Recurring event</p>
                            <p>For timed entry and multiple days</p>
                        </Stack>
                        <CustomCheckbox checked={eventType === 'recurring'}/>
                    </Button>
                </Stack>
            </Stack>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
                <div className="date-time-section">
                    <DatePicker
                        label="Date"
                        value={selectedDate}
                        onChange={(newValue) => setSelectedDate(newValue)}
                        renderInput={(params) => <TextField {...params} />}
                    />
                    <TimePicker
                        label="Start time"
                        value={startTime}
                        onChange={(newValue) => setStartTime(newValue)}
                        renderInput={(params) => <TextField {...params} />}
                    />
                    <TimePicker
                        label="End time"
                        value={endTime}
                        onChange={(newValue) => setEndTime(newValue)}
                        renderInput={(params) => <TextField {...params} />}
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
                    onChange={(e, newValue) => setActiveTab(newValue)}
                    aria-label="Location Tabs"
                >
                    <Tab label="Venue" value="venue"/>
                    <Tab label="Online event" value="online"/>
                    <Tab label="To be announced" value="tba"/>
                </Tabs>
                {activeTab === "venue" && (
                    <TextField
                        label="Location *"
                        fullWidth
                        placeholder="Enter a location"
                        margin="normal"
                    />
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
                <Formik
                    initialValues={initialValues}
                    validationSchema={MoreOptionsSchema}
                    onSubmit={(values) => {
                        console.log(values)
                    }}
                >
                    {({ errors, touched, handleChange, values }) => (
                        <Form>
                            <DialogContent>
                                <div>
                                    <FormControl fullWidth>
                                        <FormControlLabel
                                            control={
                                                <Field
                                                    as={Checkbox}
                                                    name="displayEndTime"
                                                    checked={values.displayEndTime}
                                                />
                                            }
                                            label={
                                                <div>
                                                    <strong>Display end time</strong>
                                                    <p style={{ fontSize: '0.9rem', margin: '0' }}>
                                                        The time your event ends will appear on your event page
                                                    </p>
                                                </div>
                                            }
                                        />
                                    </FormControl>
                                </div>

                                <div style={{ marginTop: '16px' }}>
                                    <FormControl fullWidth>
                                        <Field
                                            as={TextField}
                                            select
                                            name="timezone"
                                            label="Timezone"
                                            onChange={handleChange}
                                            error={touched.timezone && !!errors.timezone}
                                            helperText={touched.timezone && errors.timezone}
                                        >
                                            {timezones.map((tz) => (
                                                <MenuItem key={tz} value={tz}>
                                                    {tz}
                                                </MenuItem>
                                            ))}
                                        </Field>
                                    </FormControl>
                                </div>

                                <div style={{ marginTop: '16px' }}>
                                    <FormControl fullWidth>
                                        <Field
                                            as={TextField}
                                            select
                                            name="language"
                                            label="Language"
                                            onChange={handleChange}
                                            error={touched.language && !!errors.language}
                                            helperText={touched.language && errors.language}
                                        >
                                            {languages.map((lang) => (
                                                <MenuItem key={lang} value={lang}>
                                                    {lang}
                                                </MenuItem>
                                            ))}
                                        </Field>
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
                        </Form>
                    )}
                </Formik>
            </Dialog>
        </div>
    );
}

export default DateAndLocationForm