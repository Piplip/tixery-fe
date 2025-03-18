import {useCallback, useContext, useEffect, useState} from "react";
import {
    Button,
    Checkbox,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControl,
    FormControlLabel,
    FormHelperText,
    InputLabel,
    MenuItem,
    Select,
    Stack,
    Tab,
    Tabs,
    TextField, Typography
} from "@mui/material";
import {DatePicker, LocalizationProvider, TimePicker} from "@mui/x-date-pickers";
import "../../styles/date-and-location-form-styles.css"
import {AdapterDayjs} from '@mui/x-date-pickers/AdapterDayjs';
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
import {nominatimAxios} from "../../config/axiosConfig.js";
import debounce from 'lodash.debounce';
import Map from "../shared/Map.jsx";
import {useTranslation} from "react-i18next";

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
    const {t} = useTranslation()
    const location = useLocation()
    const {data, setData, setHasUnsavedChanges} = useContext(EventContext)

    const [open, setOpen] = useState(false);
    const [showSuggestion, setShowSuggestion] = useState(false);
    const [suggestedLocation, setSuggestedLocation] = useState([]);
    const [showMap, setShowMap] = useState(!(data.lat && data.lon));

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
            setOpen(false)
            setData(prev => ({...prev, timezone: values.timezone, language: values.language}));
        },
    });

    function isValidData(){
        return ((data.eventType === 'single' && formik.values.eventDate !== null && formik.values.eventStartTime !== null && formik.values.eventEndTime !== null
                    && formik.errors.eventDate === undefined
                    && formik.errors.eventStartTime === undefined && formik.errors.eventEndTime === undefined
                )
                || data.eventType === 'recurring')
            && formik.values.timezone !== undefined && ((data.locationType === 'venue' && formik.values.location) || data.locationType === 'online')
    }

    const debouncedApiCall = useCallback(
        debounce((query) => {
            if(query !== ''){
                nominatimAxios
                    .get(`/search?q=${query}&format=json&limit=3&layer=poi,address`)
                    .then((r) => {
                        setSuggestedLocation(r.data);
                        setShowSuggestion(true);
                    })
                    .catch((err) => console.log(err));
            }
        }, 500),
        []
    );

    useEffect(() => {
        return () => debouncedApiCall.cancel();
    }, [debouncedApiCall]);

    function handleLocationChange(e) {
        setHasUnsavedChanges(true)
        const value = e.target.value;
        setData((prev) => ({ ...prev, location: value }));
        formik.handleChange(e);
        debouncedApiCall(value);
    }

    function handleSelectLocation(location){
        setShowSuggestion(false)
        setData(prev =>
            ({...prev, location: location.display_name, lat: location.lat, lon: location.lon, locationName: location.name})
        )
        formik.setFieldValue('location', location.name)
        setShowMap(true)
    }

    return (
        <div className={`date-and-location ${isValidData() ? 'complete-section' : ''}`}>
            <h2>{t('dateAndTime.title')}</h2>
            <Stack rowGap={1}>
                <h3>{t('dateAndTime.eventType')}</h3>
                <Stack direction={'row'} marginBottom={'1rem'} columnGap={1}>
                    <Button onClick={() => {
                        setData(prev => ({ ...prev, eventType: 'single' }))
                        setHasUnsavedChanges(true)
                    }} sx={{ border: '1px solid #bebebe' }}
                            className={`event-type__button ${
                                data.eventType === "single" || data.eventType === undefined ? "active" : ""
                            }`}
                    >
                        <EventIcon sx={{ color: data.eventType === 'single' || data.eventType === undefined ? '#175486' : 'gray' }} />
                        <Stack alignItems={'flex-start'}>
                            <p>{t('dateAndTime.singleEvent')}</p>
                            <p>{t('dateAndTime.singleEventDescription')}</p>
                        </Stack>
                        <CustomCheckbox checked={data.eventType === 'single' || data.eventType === undefined} />
                    </Button>
                    <Button onClick={() => {
                        if(data.reserveSeating) {
                            alert(t('dateAndTime.reserveSeatingAlert'))
                        }
                        setData(prev => ({ ...prev, eventType: 'recurring' }))
                        setHasUnsavedChanges(true)
                    }} sx={{ border: '1px solid #bebebe' }}
                            className={`event-type__button ${
                                data.eventType === "recurring" ? "active" : ""
                            }`}
                    >
                        <CalendarMonthIcon sx={{ color: data.eventType === 'recurring' ? '#175486' : 'gray' }} />
                        <Stack alignItems={'flex-start'}>
                            <p>{t('dateAndTime.recurringEvent')}</p>
                            <p>{t('dateAndTime.recurringEventDescription')}</p>
                        </Stack>
                        <CustomCheckbox checked={data.eventType === 'recurring'} />
                    </Button>
                </Stack>
            </Stack>
            {data.eventType === 'single' ?
                <>
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <div className="date-time-section">
                            <DatePicker format={'DD/MM/YYYY'} disablePast label={t('dateAndTime.eventDateLabel')}
                                        value={dayjs(formik.values.eventDate, 'DD/MM/YYYY')} name={'eventDate'}
                                        onChange={(newValue) => {
                                            setHasUnsavedChanges(true)
                                            setData(prev => ({ ...prev, eventDate: newValue.format('DD/MM/YYYY') }))
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
                            <TimePicker label={t('dateAndTime.startTimeLabel')} ampm={false} name={'eventStartTime'}
                                        value={formik.values.eventStartTime}
                                        onChange={(newValue) => {
                                            setHasUnsavedChanges(true)
                                            setData(prev => ({ ...prev, eventStartTime: newValue }))
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
                                label={t('dateAndTime.endTimeLabel')} ampm={false} name={'eventEndTime'}
                                value={formik.values.eventEndTime}
                                onChange={(newValue) => {
                                    setHasUnsavedChanges(true)
                                    setData(prev => ({ ...prev, eventEndTime: newValue }))
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
                    >{t('dateAndTime.moreOptions')}</p>
                    <p className="date-time-info">
                        {formik.values.timezone && `GMT${formik.values.timezone >= 0 ? `+${formik.values.timezone}` : formik.values.timezone}, `}
                        {formik.values.displayEndTime ? t('dateAndTime.displayStartEndTime') : t('dateAndTime.displayStartTimeOnly')},
                        {languages.find(lang => lang.value === formik.values.language)?.label || t('dateAndTime.languageNotSelected')}
                    </p>
                </>
                :
                <Typography fontSize={16} sx={{ color: 'gray' }}>
                    {t('dateAndTime.recurringEventInfo')}
                </Typography>
            }

            <div className="location-section">
                <h3>{t('dateAndTime.location')}</h3>
                <Tabs
                    value={data.locationType || "venue"}
                    onChange={(e, newValue) => {
                        setHasUnsavedChanges(true)
                        setData(prev => ({ ...prev, locationType: newValue }))
                    }}
                >
                    <Tab label={t('dateAndTime.venue')} value="venue" />
                    <Tab label={t('dateAndTime.onlineEvent')} value="online" />
                    <Tab label={t('dateAndTime.tba')} value="tba" />
                </Tabs>
                {data.locationType === "venue" && (
                    <Stack>
                        <Stack style={{ position: 'relative' }}>
                            <TextField label={t('dateAndTime.locationLabel')} fullWidth placeholder={t('dateAndTime.locationPlaceholder')} margin="normal"
                                       name='location' onBlur={formik.handleBlur} autoComplete={"one-time-code"}
                                       value={formik.values.location}
                                       onChange={handleLocationChange}
                                       error={formik.touched.location && !!formik.errors.location}
                                       helperText={formik.touched.location && formik.errors.location}
                            />
                            {suggestedLocation.length > 0 && showSuggestion &&
                                <Stack className={'location-venue__suggested-location'} rowGap={1}>
                                    {suggestedLocation.map((location, index) => (
                                        <p key={index}
                                           onClick={() => handleSelectLocation(location)}
                                        >{location.display_name}</p>
                                    ))}
                                </Stack>
                            }
                        </Stack>
                        {showMap && data.lat && data.lon && <Map latitude={data.lat} longitude={data.lon} locationName={data.location} />}
                        <div className={'location-venue__reserve-seating'}>
                            <Stack direction={'row'} justifyContent={'space-between'} alignItems={'center'}>
                                <p style={{ fontWeight: 'bold' }}>{t('dateAndTime.reservedSeating')}</p>
                                <Switch checked={data.reserveSeating || false}
                                        onChange={() => {
                                            setHasUnsavedChanges(true)
                                            setData(prev => ({ ...prev, reserveSeating: !prev.reserveSeating }))
                                        }} />
                            </Stack>
                            <p>{t('dateAndTime.reservedSeatingDescription')}</p>
                        </div>
                        {isValidData() &&
                            <Stack className={'location-venue__verify-phone'} direction={'row'} alignItems={'center'} columnGap={2}>
                                <PriorityHighIcon sx={{ backgroundColor: '#ffed41' }} />
                                <Stack rowGap={1}>
                                    <p>{t('dateAndTime.verifyPhone')}</p>
                                    <p>{t('dateAndTime.verifyPhoneDescription')}</p>
                                </Stack>
                                <Button variant={'text'} sx={{ fontSize: '.8rem', width: '20rem' }}>{t('dateAndTime.verifyNow')}</Button>
                            </Stack>
                        }
                    </Stack>
                )}
                {data.locationType === "online" && (
                    <p className="online-event-info">
                        {t('dateAndTime.onlineEventInfo')}
                    </p>
                )}
            </div>

            <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm">
                <DialogTitle textAlign={'center'}>
                    {t('dateAndTime.moreOptions')}
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
                                            onChange={e => {
                                                setHasUnsavedChanges(true)
                                                formik.handleChange(e)
                                            }}
                                        />
                                    }
                                    label={
                                        <div>
                                            <strong>{t('dateAndTime.displayEndTime')}</strong>
                                            <p style={{ fontSize: '0.9rem', margin: '0' }}>
                                                {t('dateAndTime.displayEndTimeDescription')}
                                            </p>
                                        </div>
                                    }
                                />
                            </FormControl>
                        </div>

                        <div style={{ marginTop: '16px' }}>
                            <FormControl fullWidth>
                                <InputLabel id="demo-simple-select-label">{t('dateAndTime.timezone')}</InputLabel>
                                <Select
                                    label={t('dateAndTime.timezone')}
                                    name="timezone"
                                    value={formik.values.timezone}
                                    onChange={e => {
                                        setHasUnsavedChanges(true)
                                        formik.handleChange(e)
                                    }}
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

                        <div style={{ marginTop: '16px' }}>
                            <FormControl fullWidth>
                                <InputLabel>{t('dateAndTime.language')}</InputLabel>
                                <Select
                                    name="language"
                                    label={t('dateAndTime.language')}
                                    value={formik.values.language}
                                    onChange={e => {
                                        setHasUnsavedChanges(true)
                                        formik.handleChange(e)
                                    }}
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
                            {t('dateAndTime.cancel')}
                        </Button>
                        <Button type="submit" variant="contained" color="error">
                            {t('dateAndTime.save')}
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>
        </div>
    );
}

export default DateAndLocationForm