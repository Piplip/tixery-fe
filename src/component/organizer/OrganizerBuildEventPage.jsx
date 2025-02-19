import MediaUploader from "../shared/MediaUploader.jsx";
import {Button, IconButton, Stack, TextField} from "@mui/material";
import ErrorOutlinedIcon from "@mui/icons-material/ErrorOutlined";
import TextAreaWithLimit from "../shared/TextAreaWithLimit.jsx";
import DateAndLocationForm from "./DateAndLocationForm.jsx";
import OrganizerFAQ from "./OrganizerFAQ.jsx";
import * as Yup from "yup";
import {useFormik} from "formik";
import {useContext, useEffect, useMemo, useRef, useState} from "react";
import {EventContext} from "../../context.js";
import {debounce} from "lodash";
import EventAdditionalInfo from "./EventAdditionalInfo.jsx";
import {generateGeminiContent} from "../../common/Utilities.js";
import {useTranslation} from "react-i18next";

const validationSchema = Yup.object().shape({
    eventTitle: Yup.string()
        .required("Event title is required.")
        .max(100, "Event title cannot exceed 100 characters."),
    summary: Yup.string()
        .required("Summary is required.")
        .max(500, "Summary cannot exceed 140 characters."),
});

function OrganizerBuildEventPage(){
    const {t} = useTranslation()
    const {data, setData, setHasUnsavedChanges} = useContext(EventContext);
    const [collapsed, setCollapsed] = useState({});
    const sectionRefs = useRef({});
    const [loading, setLoading] = useState(false);

    const formik = useFormik({
        enableReinitialize: true,
        initialValues: {
            eventTitle: data.eventTitle || '',
            summary: data.summary || '',
        },
        validationSchema,
    });

    const memoizedValues = useMemo(() => formik.values, [formik.values]);

    useEffect(() => {
        const debouncedSetData = debounce((values) => {
            setData(prevData => ({
                ...prevData,
                eventTitle: values.eventTitle || prevData.eventTitle,
                summary: values.summary || prevData.summary,
            }));
        }, 300);

        debouncedSetData(memoizedValues);

        return () => {
            debouncedSetData.cancel();
        };
    }, [memoizedValues, setData]);

    const handleExpandClick = (name) => {
        setCollapsed(prevState => {
            const newState = { ...prevState, [name]: !prevState[name] };
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

    function handleGenerateDescriptionSuggestion(){
        if(data.eventTitle === '')
            alert('Please enter an event title first.')
        setLoading(true)
        const instruction = `Write a short description with the given event name. It should be no longer than 500 characters. The description should be engaging and informative. If the given name is just a random string, return an alert to notify that the name is not descriptive enough. Grab people's attention with a short description about your event. Attendees will see this at the top of your event page.  **The response language should match the dominant language of the entire prompt.**  If the prompt contains multiple languages, prioritize the language with the highest percentage of text.`;
        const prompt = data.eventTitle;

        generateGeminiContent(prompt, instruction).then((response) => {
            setLoading(false)
            setData(prev => ({...prev, summary: response.response.candidates[0].content.parts[0].text}));
        })
    }

    return (
        <>
            <MediaUploader />
            <Stack className={`create-events-main__event-title ${data.eventTitle && data.summary ? 'complete-section' : ''}`}
                   ref={el => sectionRefs.current['eventTitle'] = el}>
                <div className={'expand-btn'} onClick={() => {
                    handleExpandClick('eventTitle')
                }}>
                    {!collapsed.eventTitle ? '+' : '-'}
                </div>
                {!collapsed.eventTitle ?
                    <div onClick={
                        () => handleExpandClick('eventTitle')
                    }>
                        <p className={'create-events-title__title'}>
                            {data.eventTitle || t('eventTitle.eventTitle')}
                        </p>
                        <p>
                            {data.summary || t('eventTitle.eventSummary')}
                        </p>
                    </div>
                    :
                    <form onSubmit={formik.handleSubmit}>
                        <Stack spacing={4} className="event-overview-form">
                            <div>
                                <h2>{t('eventTitle.eventOverview')}</h2>
                            </div>
                            <div>
                                <label htmlFor="eventTitle" className="form-label">
                                    {t('eventTitle.eventTitleLabel')}
                                </label>
                                <p className="form-description">
                                    {t('eventTitle.eventTitleDescription')}
                                </p>
                                <div className="input-wrapper">
                                    <TextField name="eventTitle" variant="outlined" fullWidth
                                               error={formik.touched.eventTitle && Boolean(formik.errors.eventTitle)}
                                               helperText={formik.touched.eventTitle && formik.errors.eventTitle}
                                               value={formik.values.eventTitle}
                                               onChange={(e) => {
                                                   formik.handleChange(e)
                                                   setHasUnsavedChanges(true)
                                               }}
                                               onBlur={formik.handleBlur}
                                               slotProps={{
                                                   input: {
                                                       endAdornment: formik.errors.eventTitle && (
                                                           <IconButton disabled>
                                                               <ErrorOutlinedIcon color="error" />
                                                           </IconButton>
                                                       )
                                                   }
                                               }}
                                    />
                                </div>
                            </div>
                            <div>
                                <label htmlFor="summary" className="form-label">
                                    {t('eventTitle.summaryLabel')}
                                </label>
                                <p className="form-description">
                                    {t('eventTitle.summaryDescription')}{" "}
                                    <a href="#" className="see-examples">
                                        {t('eventTitle.seeExamples')}
                                    </a>
                                </p>
                                <TextAreaWithLimit name={'summary'}
                                                   handleChange={(e) => {
                                                       formik.handleChange(e)
                                                       setHasUnsavedChanges(true)
                                                   }}
                                                   value={formik.values.summary}
                                                   maxChars={500} error={formik.touched.summary && Boolean(formik.errors.summary)}
                                                   helperText={formik.touched.summary && formik.errors.summary}
                                                   onBlur={formik.handleBlur}
                                />
                            </div>
                            <div>
                                <Button
                                    variant="outlined"
                                    className={`suggest-summary-btn ${loading ? 'loading' : ''}`}
                                    type="button"
                                    onClick={handleGenerateDescriptionSuggestion}
                                >
                                    ⚡ {t('eventTitle.suggestSummary')}
                                </Button>
                            </div>
                        </Stack>
                    </form>
                }
            </Stack>
            <DateAndLocationForm />
            <OrganizerFAQ />
            <EventAdditionalInfo />
        </>
    )
}

export default OrganizerBuildEventPage