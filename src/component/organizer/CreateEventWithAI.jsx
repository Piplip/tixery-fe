import {useFormik} from 'formik';
import * as Yup from 'yup';
import {
    Backdrop,
    Box,
    Button,
    FormControlLabel,
    Stack,
    Switch,
    Tab,
    Tabs,
    Dialog,
    TextField,
    CircularProgress,
    Typography, DialogTitle, DialogContent, DialogContentText, DialogActions
} from "@mui/material";
import {useTranslation} from "react-i18next";
import debounce from "lodash.debounce";
import {eventAxiosWithToken, nominatimAxios, rootAxios} from "../../config/axiosConfig.js";
import Map from "../shared/Map.jsx";
import "../../styles/create-event-with-ai-styles.css";
import {useCallback, useEffect, useState} from "react";
import {DatePicker, TimePicker} from "@mui/x-date-pickers";
import dayjs from "dayjs";
import {Link, useNavigate} from "react-router-dom";
import {getStorage, ref, uploadBytes} from "firebase/storage";
import {initializeApp} from "firebase/app";
import {firebaseConfig} from "../../config/firebaseConfig.js";
import {generateFileName, generateGeminiContent, getUserData} from "../../common/Utilities.js";
import { v4 as uuidv4 } from 'uuid';
import {Categories, EventType} from "../../common/Data.js";

initializeApp(firebaseConfig);
const storage = getStorage()

const formatCategories = (categories) => {
    return Object.entries(categories).map(([category, subCategories]) => {
        return `${category}: ${subCategories.join(', ')}`;
    }).join('\n');
};

const formattedCategories = formatCategories(Categories);

function CreateEventWithAI() {
    const { t } = useTranslation();
    const [showSuggestion, setShowSuggestion] = useState(false)
    const [showMap, setShowMap] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [currentStep, setCurrentStep] = useState('')

    const [showConfirmation, setShowConfirmation] = useState(false);
    const [confirmationCallback, setConfirmationCallback] = useState(null);

    const handleConfirmation = (continueProcess) => {
        setShowConfirmation(false);
        if (continueProcess && confirmationCallback) {
            confirmationCallback();
        }
    };

    const navigate = useNavigate()

    const validationSchema = Yup.object().shape({
        title: Yup.string().required(t('createEventWithAI.titleRequired')),
        eventDate: Yup.string().required(t('createEventWithAI.eventDateRequired')),
        eventStartTime: Yup.string().required(t('createEventWithAI.eventStartTimeRequired')),
        eventEndTime: Yup.string().required(t('createEventWithAI.eventEndTimeRequired'))
            .test('is-greater', t('createEventWithAI.endTimeGreaterThanStartTime'), function (value) {
                return dayjs(value).isAfter(dayjs(this.parent.eventStartTime));
            }),
        locationType: Yup.string().required(),
        location: Yup.string().when('locationType', {
            is: 'venue',
            then: schema => schema.required(t('createEventWithAI.locationRequired')),
            otherwise: schema => schema.notRequired()
        }),
        ticketPrice: Yup.number().when('freeTicket', {
            is: false,
            then: schema => schema.required(t('createEventWithAI.ticketPriceRequired')).min(0, t('createEventWithAI.ticketPriceAtLeastZero')),
            otherwise: schema => schema.notRequired()
        }),
        capacity: Yup.number().required(t('createEventWithAI.capacityRequired')).min(1, t('createEventWithAI.capacityAtLeastOne'))
    });

    const formik = useFormik({
        initialValues: {
            title: '',
            eventDate: dayjs().add(1, 'month'),
            eventStartTime: null,
            eventEndTime: null,
            locationType: 'venue',
            location: '',
            freeTicket: false,
            reserveSeating: false,
            ticketPrice: '',
            capacity: ''
        },
        validationSchema: validationSchema,
        onSubmit: (async (values) => {
            setIsLoading(true);
            let imgData;
            if(!confirmationCallback){
                setCurrentStep(t('createEventWithAI.generatingImage'));
                try {
                    imgData = await handleGenerateImage(values.title);
                } catch (err) {
                    setIsLoading(false);
                    alert(t('createEventWithAI.creationError'));
                    return;
                }

                if (!imgData || imgData.length < 2) {
                    setIsLoading(false);
                    setShowConfirmation(true);
                    setConfirmationCallback(() => () => formik.handleSubmit());
                    return;
                }
            }

            setCurrentStep(t('createEventWithAI.generatingSummary'));
            const summary = await generateGeminiContent(
                values.title,
                `Write a short description with the given event name. It should be no longer than 500 characters. The description should be engaging and informative. If the given name is just a random string, return an alert to notify that the name is not descriptive enough. Grab people's attention with a short description about your event. Attendees will see this at the top of your event page.  **The response language should match the dominant language of the entire prompt.**  If the prompt contains multiple languages, prioritize the language with the highest percentage of text.`
            ).then(r => {
                return r.response.candidates[0].content.parts[0].text
            })
                .catch(() => {
                    setIsLoading(false)
                    alert(t('createEventWithAI.creationError'))
                })

            setCurrentStep(t('createEventWithAI.generatingInfo'));
            const additionalInfo = await generateGeminiContent(
                `event title: ${values.title}, event summary: ${summary}`,
                `Write a detailed description with the given event name and summary.  Return ONLY the HTML content for the description, suitable for inserting directly into a webpage's body. Do not include html, head, body, or any other wrapper tags.  Style the HTML using inline CSS. The description should be engaging and informative, grabbing people's attention. Attendees will see this at the top of your event page.  Keep it concise and no longer than 1000 characters. **The response language should match the dominant language of the entire prompt.** If the prompt contains multiple languages, prioritize the language with the highest percentage of text.  Provide richer styling than the example provided, including more diverse CSS properties.`
            ).then(r => {
                return r.response.candidates[0].content.parts[0].text;
            })
                .catch(() => {
                    setIsLoading(false);
                    alert(t('createEventWithAI.creationError'));
                });

            const eventType = await generateGeminiContent(
                `event title: ${values.title}, event summary: ${summary}, available event type: ${EventType.toString()}`,
                'Return the best fit event type base on the event title, summary and available event type. **Return the exact one event type that suitable most. The event type should be one of the available event types.'
            ).then(r => {
                return r.response.candidates[0].content.parts[0].text
            }).catch(err => console.log(err))
            console.log(eventType)

            const eventSubCategory = await generateGeminiContent(
                `event title: ${values.title}, event summary: ${summary}, available categories and sub categories: ${formattedCategories}`,
                'Return the best fit event sub categories based on the event title, summary, and available event type. **Return only the exact one sub category that is most suitable. The event type should be one of the available event categories.'
            ).then(r => {
                return r.response.candidates[0].content.parts[0].text;
            }).catch(err => console.log(err));

            setCurrentStep(t('createEventWithAI.generatingTags'));
            const tags = await generateGeminiContent(
                `event title: ${values.title}, event summary: ${summary}`,
                'Generate tags for the event. You should generate tags in a string, separated by comma (do not append # before each tag), tags should not contain white space, and 10 tags is maximum allow. Tags are words or phrases that describe the event. They help attendees find your event when they search on Eventbrite. Tags should be separated by commas. **The response language should match the dominant language of the entire prompt.** If the prompt contains multiple languages, prioritize the language with the highest percentage of text.'
            ).then(r => {
                return r.response.candidates[0].content.parts[0].text
            })
                .catch(() => {
                    setIsLoading(false)
                    alert(t('createEventWithAI.creationError'))
                })

            setCurrentStep(t('createEventWithAI.creatingEvent'));
            const params = new URLSearchParams({
                pid: getUserData('profileID'), uid: getUserData("userID")
            });

            if (values.freeTicket) {
                params.append('free', values.freeTicket);
            } else if (values.ticketPrice) {
                params.append('price', values.ticketPrice);
            }

            eventAxiosWithToken.post(`/create/auto?${params}`, ({
                ...values,
                eventDate: values.eventDate.format('DD/MM/YYYY'),
                eventStartTime: values.eventStartTime.format('HH:mm'),
                eventEndTime: values.eventEndTime.format('HH:mm'),
                summary,
                type: eventType,
                subCategory: eventSubCategory,
                eventID: imgData && imgData[1] || uuidv4(),
                additionalInfo,
                images: [imgData && imgData[0]],
                tags: tags.split(','),
                timezone: new Date().getTimezoneOffset() / -60

            }))
                .then(r => {
                    setIsLoading(false)
                    navigate(`/create/auto/${r.data.data}/preview`)
                })
                .catch(err => {
                    setIsLoading(false)
                    alert(t('createEventWithAI.creationError'))
                })
        })
    });

    async function handleGenerateImage(title) {
        const payload = {
            prompt: `Create an event display image for an event titled ${title}. Base on the title, analyze that the event is about what and generate an image that represents the event.`,
            negative_prompt: 'cartoon, clip art, drawings, blurry, distorted, amateur, low quality',
            output_format: "webp",
            style_preset: 'photographic',
            aspect_ratio: '16:9'
        };

        try {
            const response = await rootAxios.post(
                `https://api.stability.ai/v2beta/stable-image/generate/core`,
                payload,
                {
                    validateStatus: undefined,
                    responseType: "arraybuffer",
                    headers: {
                        Authorization: `Bearer sk-KwIp2VPkRa9IcztkNeYuALRqCvj7PUuaA1p6l1gQG11ImetY`,
                        Accept: "image/*",
                        'Content-Type': 'multipart/form-data'
                    },
                },
            )

            if (response.status === 200) {
                const uuid = uuidv4();
                const blob = new Blob([response.data], { type: "image/webp" });
                const storageRef = ref(storage, `/events/${uuid}/${generateFileName(30)}.webp`);
                const uploadData = await uploadBytes(storageRef, blob);

                return [uploadData.metadata.fullPath, uuid];
            }
        } catch (error) {
            setIsLoading(false);
            throw error;
        }
    }

    const debouncedApiCall = useCallback(
        debounce((query) => {
            if (query !== '') {
                nominatimAxios
                    .get(`/search?q=${query}&format=json&limit=3&layer=poi,address`)
                    .then((r) => {
                        formik.setFieldValue('suggestedLocation', r.data);
                        setShowSuggestion(true)
                    })
                    .catch((err) => console.log(err));
            }
        }, 500),
        []
    );

    useEffect(() => {
        return () => debouncedApiCall.cancel();
    }, [debouncedApiCall]);

    const handleLocationChange = (e) => {
        const value = e.target.value;
        formik.setFieldValue('location', value);
        debouncedApiCall(value);
    };

    const handleSelectLocation = (location) => {
        setShowSuggestion(false)
        formik.setFieldValue('location', location.display_name);
        formik.setFieldValue('latitude', location.lat);
        formik.setFieldValue('longitude', location.lon);
        formik.setFieldValue('locationName', location.name);
        setShowMap(true)
    };

    const homeLocation = getUserData('role') === 'HOST' ? '/organizer' : '/'

    return (
        <form style={{ display: 'flex', justifyContent: 'center' }}>
            <Link to={homeLocation}>
                <img
                    src="https://firebasestorage.googleapis.com/v0/b/medicare-10c3b.appspot.com/o/assets%2Flogo.svg?alt=media&token=65847a28-8ce8-4a10-a88a-1a0f16c0b41f"
                    alt="logo"
                    style={{ position: 'fixed', top: '1.5rem', left: '1.5rem' }}
                    width="128px"
                />
            </Link>

            <Backdrop
                sx={(theme) => ({ color: '#fff', zIndex: theme.zIndex.drawer + 1 })}
                open={isLoading}
            >
                <Stack alignItems="center">
                    <CircularProgress color="inherit" />
                    <Typography variant="h6" sx={{ mt: 2 }}>{currentStep}</Typography>
                </Stack>
            </Backdrop>

            <Stack className="create-event">
                <Stack>
                    <p className="create-event__title">{t('createEventWithAI.createEventWithAI')}</p>
                    <p className="create-event__description">
                        {t('createEventWithAI.aiDescription')}
                    </p>
                </Stack>

                {/* Form sections */}
                <div className="create-event__form">

                    {/* Section: Event Title */}
                    <Stack className="create-event__section">
                        <p className="create-event__section-title">{t('createEventWithAI.eventName')}</p>
                        <p className="create-event__section-description">
                            {t('createEventWithAI.eventNameDescription')}
                        </p>
                        <TextField
                            name="title"
                            label={t('createEventWithAI.eventTitle')}
                            variant="outlined"
                            required
                            value={formik.values.title}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            error={formik.touched.title && Boolean(formik.errors.title)}
                            helperText={formik.touched.title && formik.errors.title}
                            className="create-event__field create-event__field--title"
                        />
                    </Stack>

                    <Stack className="create-event__section">
                        <p className="create-event__section-title">
                            {t('createEventWithAI.eventStartEnd')}
                        </p>
                        <Box className="create-event__row">
                            <DatePicker
                                format="DD/MM/YYYY"
                                name="eventDate"
                                value={formik.values.eventDate}
                                onChange={formik.handleChange}
                                slotProps={{
                                    textField: {
                                        onBlur: formik.handleBlur,
                                        error: formik.touched.eventDate && Boolean(formik.errors.eventDate),
                                        helperText: formik.touched.eventDate && formik.errors.eventDate,
                                    },
                                }}
                                className="create-event__field create-event__field--date"
                            />
                            <TimePicker format={"HH:mm"}
                                        name="eventStartTime"
                                        value={formik.values.eventStartTime}
                                        onChange={(val) => formik.setFieldValue('eventStartTime', val)}
                                        slotProps={{
                                            textField: {
                                                onBlur: formik.handleBlur,
                                                error: formik.touched.eventStartTime && Boolean(formik.errors.eventStartTime),
                                                helperText: formik.touched.eventStartTime && formik.errors.eventStartTime,
                                            },
                                        }}
                                        className="create-event__field create-event__field--time"
                            />
                            <TimePicker format={"HH:mm"}
                                        name="eventEndTime"
                                        value={formik.values.eventEndTime}
                                        onChange={(val) => formik.setFieldValue('eventEndTime', val)}
                                        slotProps={{
                                            textField: {
                                                onBlur: formik.handleBlur,
                                                error: formik.touched.eventEndTime && Boolean(formik.errors.eventEndTime),
                                                helperText: formik.touched.eventEndTime && formik.errors.eventEndTime,
                                            },
                                        }}
                                        className="create-event__field create-event__field--time"
                            />
                        </Box>
                    </Stack>

                    {/* Section: Location */}
                    <Stack className="create-event__section create-event__location-section">
                        <p className="create-event__section-title">
                            {t('dateAndTime.location')}
                        </p>
                        <Tabs
                            value={formik.values.locationType}
                            onChange={(e, newValue) => formik.setFieldValue('locationType', newValue)}
                            className="create-event__tabs"
                        >
                            <Tab label={t('dateAndTime.venue')} value="venue" />
                            <Tab label={t('dateAndTime.onlineEvent')} value="online" />
                            <Tab label={t('dateAndTime.tba')} value="tba" />
                        </Tabs>

                        {formik.values.locationType === 'venue' && (
                            <Stack className="create-event__venue-section">
                                <Stack style={{ position: 'relative' }}>
                                    <TextField
                                        label={t('dateAndTime.locationLabel')}
                                        fullWidth
                                        placeholder={t('dateAndTime.locationPlaceholder')}
                                        margin="normal"
                                        name="location"
                                        onClick={() => setShowSuggestion(true)}
                                        autoComplete="one-time-code"
                                        onBlur={formik.handleBlur}
                                        value={formik.values.location}
                                        onChange={handleLocationChange}
                                        error={formik.touched.location && Boolean(formik.errors.location)}
                                        helperText={formik.touched.location && formik.errors.location}
                                    />
                                    {formik.values.suggestedLocation?.length > 0 &&
                                        showSuggestion && (
                                            <Stack className="create-event__suggested-location" rowGap={1}>
                                                {formik.values.suggestedLocation.map((loc, index) => (
                                                    <p
                                                        key={index}
                                                        onClick={() => handleSelectLocation(loc)}
                                                        className="create-event__suggested-location-item"
                                                    >
                                                        {loc.display_name}
                                                    </p>
                                                ))}
                                            </Stack>
                                        )}
                                </Stack>

                                <div onMouseEnter={() => setShowSuggestion(false)}>
                                    {showMap &&
                                        formik.values.latitude &&
                                        formik.values.longitude && (
                                            <Map
                                                latitude={formik.values.latitude}
                                                longitude={formik.values.longitude}
                                                locationName={formik.values.location}
                                            />
                                        )}
                                </div>

                                <div className="create-event__reserve-seating">
                                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                                        <p className="create-event__reserve-seating-title">
                                            {t('dateAndTime.reservedSeating')}
                                        </p>
                                        <Switch
                                            checked={formik.values.reserveSeating}
                                            onChange={() =>
                                                formik.setFieldValue(
                                                    'reserveSeating',
                                                    !formik.values.reserveSeating
                                                )
                                            }
                                        />
                                    </Stack>
                                    <p className="create-event__reserve-seating-description">
                                        {t('dateAndTime.reservedSeatingDescription')}
                                    </p>
                                </div>
                            </Stack>
                        )}

                        {formik.values.locationType === 'online' && (
                            <p className="create-event__online-event-info">
                                {t('dateAndTime.onlineEventInfo')}
                            </p>
                        )}
                    </Stack>

                    {/* Section: Ticket Price */}
                    <Stack className="create-event__section">
                        <p className="create-event__section-title">
                            {t('createEventWithAI.ticketPriceQuestion')}
                        </p>
                        <p className="create-event__section-description">
                            {t('createEventWithAI.ticketPriceDescription')}
                        </p>
                        <TextField disabled={formik.values.freeTicket}
                                   label={t('createEventWithAI.howMuchToCharge')}
                                   variant="outlined"
                                   name="ticketPrice"
                                   value={formik.values.ticketPrice}
                                   onChange={formik.handleChange}
                                   onBlur={formik.handleBlur}
                                   error={formik.touched.ticketPrice && Boolean(formik.errors.ticketPrice)}
                                   helperText={formik.touched.ticketPrice && formik.errors.ticketPrice}
                                   className="create-event__field create-event__field--price"
                        />
                        <FormControlLabel sx={{ marginTop: 2, width: 'fit-content' }}
                                          control={<Switch name={'freeTicket'} checked={formik.values.freeTicket} onChange={formik.handleChange} />}
                                          label={t('createEventWithAI.myTicketsAreFree')}
                        />
                    </Stack>

                    <Stack className="create-event__section">
                        <p className="create-event__section-title">
                            {t('createEventWithAI.capacityQuestion')}
                        </p>
                        <p className="create-event__section-description">
                            {t('createEventWithAI.capacityDescription')}
                        </p>
                        <TextField
                            label={t('createEventWithAI.capacity')}
                            variant="outlined"
                            name="capacity"
                            value={formik.values.capacity}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            error={formik.touched.capacity && Boolean(formik.errors.capacity)}
                            helperText={formik.touched.capacity && formik.errors.capacity}
                            className="create-event__field create-event__field--capacity"
                        />
                    </Stack>
                </div>
            </Stack>

            <Stack sx={{
                position: 'fixed', bottom: 0, borderTop: '1px solid gray', width: '100%', padding: '.75rem 1rem', zIndex: 1000,
                backdropFilter: 'blur(5px)', backgroundColor: 'white'
            }}
                   direction={'row'} columnGap={2}
                   justifyContent={'flex-end'}
            >
                <Link to={'/organizer'}>
                    <Button type={'button'}>{t('createEventWithAI.exit')}</Button>
                </Link>
                <Button variant={'contained'} type={'submit'} onClick={formik.handleSubmit}>
                    {t('createEventWithAI.createEvent')}
                </Button>
            </Stack>
            <Dialog
                open={showConfirmation}
                onClose={() => {
                    handleConfirmation(false)
                    setConfirmationCallback(null)
                }}
            >
                <DialogTitle>{t('createEventWithAI.title')}</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        {t('createEventWithAI.message')}
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => handleConfirmation(false)} color="primary">
                        {t('createEventWithAI.no')}
                    </Button>
                    <Button onClick={() => handleConfirmation(true)} color="primary" autoFocus>
                        {t('createEventWithAI.yes')}
                    </Button>
                </DialogActions>
            </Dialog>
        </form>
    );
}

export default CreateEventWithAI;