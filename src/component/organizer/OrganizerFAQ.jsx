import {useFormik} from "formik";
import {useState} from "react";
import * as Yup from "yup";
import "../../styles/organizer-fag-styles.css"
import TextAreaWithLimit from "../TextAreaWithLimit.jsx";

function OrganizerFAQ(){
    const [faqList, setFaqList] = useState([]);
    const [editIndex, setEditIndex] = useState(null);

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

    return (
        <div className="faq-section">
            <h2 className="faq-section__title">Good to know</h2>
            <p className="faq-section__description">
                Use this section to feature specific information about your event. Add highlights and frequently asked questions for attendees.
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

            <div className="faq-section__list">
                {faqList.map((faq, index) => (
                    <div key={index} className="faq-section__item">
                        <div className="faq-section__qa">
                            <p className="faq-section__question">{faq.question}</p>
                            <p className="faq-section__answer">{faq.answer}</p>
                        </div>
                        <div className="faq-section__actions">
                            <button
                                type="button"
                                className="faq-section__action faq-section__action--edit"
                                onClick={() => handleEdit(index)}
                            >
                                Edit
                            </button>
                            <button
                                type="button"
                                className="faq-section__action faq-section__action--delete"
                                onClick={() => handleDelete(index)}
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default OrganizerFAQ