import {useFormik} from "formik";
import {useState} from "react";
import * as Yup from "yup";
import "../../styles/organizer-fag-styles.css"
import TextAreaWithLimit from "../TextAreaWithLimit.jsx";
import {Stack} from "@mui/material";

function OrganizerFAQ(){
    const [faqList, setFaqList] = useState([]);
    const [editIndex, setEditIndex] = useState(null);
    const [expandedIndex, setExpandedIndex] = useState([]);
    const [selectedFaqs, setSelectedFaqs] = useState([]);

    const formik = useFormik({
        initialValues: {
            question: "",
            answer: "",
        },
        validationSchema: Yup.object({
            question: Yup.string().required("Question is required"),
            answer: Yup.string().required("Answer is required"),
        }),
        onSubmit: (values, { resetForm }) => {
            if (editIndex !== null) {
                const updatedFaqs = [...faqList];
                updatedFaqs[editIndex] = values;
                setFaqList(updatedFaqs);
                setEditIndex(null);
            } else {
                setFaqList([...faqList, values]);
            }
            resetForm();
        },
    });

    const handleEdit = (index) => {
        setEditIndex(index);
        formik.setValues(faqList[index]);
    };

    const handleDelete = (index) => {
        setFaqList(faqList.filter((_, i) => i !== index));
    };

    const toggleExpand = (index) => {
        if (expandedIndex.includes(index)) {
            setExpandedIndex(expandedIndex.filter((i) => i !== index));
        } else {
            setExpandedIndex([...expandedIndex, index]);
        }
    };

    const handleBulkExpand = () => {
        if (expandedIndex.length === faqList.length) {
            setExpandedIndex([]);
        } else {
            setExpandedIndex(faqList.map((_, index) => index));
        }
    };

    const handleFaqSelection = (index) => {
        if (selectedFaqs.includes(index)) {
            setSelectedFaqs(selectedFaqs.filter((i) => i !== index));
        } else {
            setSelectedFaqs([...selectedFaqs, index]);
        }
    };

    const handleBulkDelete = () => {
        setFaqList(faqList.filter((_, index) => !selectedFaqs.includes(index)));
        setSelectedFaqs([]);
    };

    return (
        <div className="faq-section">
            <h2 className="faq-section__title">Good to know</h2>
            <p className="faq-section__description">
                Use this section to feature specific information about your event. Add highlights and frequently asked
                questions for attendees.
            </p>
            <h3 className="faq-section__subtitle">Frequently asked questions</h3>
            <p className="faq-section__instructions">
                Answer questions your attendees may have about the event, like accessibility and amenities.
            </p>

            <form className="faq-section__form" onSubmit={formik.handleSubmit}>
                <div className="faq-section__form-group">
                    <label htmlFor="question" className="faq-section__label">
                        Question
                    </label>
                    <input
                        id="question"
                        name="question"
                        type="text"
                        className={`faq-section__input ${
                            formik.errors.question && formik.touched.question ? "faq-section__input--error" : ""
                        }`}
                        value={formik.values.question}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                    />
                    {formik.errors.question && formik.touched.question && (
                        <div className="faq-section__error">{formik.errors.question}</div>
                    )}
                </div>
                <div className="faq-section__form-group">
                    <label htmlFor="question" className="faq-section__label">
                        Answer
                    </label>
                    <TextAreaWithLimit name={'answer'} value={formik.values.answer}
                                       error={formik.errors.answer && formik.touched.answer}
                                       handleChange={formik.handleChange}
                                       onBlur={formik.handleBlur} rows={4}
                                       maxChars={300} helperText={formik.errors.answer} placeholder={"Answer"}

                    />
                </div>
                <button type="submit" className="faq-section__submit">
                    {editIndex !== null ? "Update Question" : "Add Question"}
                </button>
            </form>

            {faqList.length !== 0 &&
                <div className="faq-section__bulk-actions">
                    <button onClick={handleBulkExpand} className="faq-section__bulk-action">
                        {expandedIndex.length === faqList.length ? "Collapse All" : "Expand All"}
                    </button>
                    <button
                        onClick={handleBulkDelete}
                        className="faq-section__bulk-action faq-section__bulk-action--delete"
                        disabled={selectedFaqs.length === 0}
                    >
                        Delete Selected
                    </button>
                </div>
            }

            <div className="faq-section__list">
                {faqList.map((faq, index) => (
                    <div key={index}
                         className={`faq-section__item ${expandedIndex.includes(index) ? "faq-section__item--expanded" : ""}`}>
                        <div className="faq-section__header">
                            <Stack direction={'row'} alignItems={'center'}>
                                <input
                                    type="checkbox"
                                    className="faq-section__checkbox"
                                    checked={selectedFaqs.includes(index)}
                                    onChange={() => handleFaqSelection(index)}
                                />
                                <span className="faq-section__question">{faq.question}</span>
                            </Stack>
                            <div onClick={() => toggleExpand(index)} className="faq-section__question-container">
                                <span
                                    className="faq-section__toggle-icon">{expandedIndex.includes(index) ? "-" : "+"}</span>
                            </div>
                        </div>
                        {expandedIndex.includes(index) && (
                            <div className="faq-section__body">
                                <p className="faq-section__answer">{faq.answer}</p>
                                <div className="faq-section__actions">
                                    <button
                                        type="button"
                                        className="faq-section__action faq-section__action--edit"
                                        onClick={() => handleEdit(index)}
                                    >
                                        ✏️
                                    </button>
                                    <button
                                        type="button"
                                        className="faq-section__action faq-section__action--delete"
                                        onClick={() => handleDelete(index)}
                                    >
                                        🗑️
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}

export default OrganizerFAQ