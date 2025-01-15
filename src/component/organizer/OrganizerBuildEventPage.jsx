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

const validationSchema = Yup.object().shape({
    eventTitle: Yup.string()
        .required("Event title is required.")
        .max(100, "Event title cannot exceed 100 characters."),
    summary: Yup.string()
        .required("Summary is required.")
        .max(140, "Summary cannot exceed 140 characters."),
});

function OrganizerBuildEventPage(){
    const {data, setData} = useContext(EventContext);
    const [collapsed, setCollapsed] = useState({});
    const sectionRefs = useRef({});

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
                            {data.eventTitle || 'Event Title'}
                        </p>
                        <p>
                            {data.summary || 'A short and sweet sentence about your event'}
                        </p>
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
                                    <TextField name="eventTitle" variant="outlined" fullWidth
                                        error={formik.touched.eventTitle && Boolean(formik.errors.eventTitle)}
                                        helperText={formik.touched.eventTitle && formik.errors.eventTitle}
                                        value={formik.values.eventTitle}
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                        slotProps={{
                                            input: {
                                                endAdornment: formik.errors.eventTitle && (
                                                    <IconButton disabled>
                                                        <ErrorOutlinedIcon color="error"/>
                                                    </IconButton>
                                                )
                                            }
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
        </>
    )
}

export default OrganizerBuildEventPage