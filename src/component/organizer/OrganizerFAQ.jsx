import {useFormik} from "formik";
import {useContext, useEffect, useRef, useState} from "react";
import * as Yup from "yup";
import "../../styles/organizer-fag-styles.css"
import TextAreaWithLimit from "../shared/TextAreaWithLimit.jsx";
import {Stack} from "@mui/material";
import {EventContext} from "../../context.js";
import {useTranslation} from "react-i18next";

function OrganizerFAQ(){
    const {data, setData, setHasUnsavedChanges} = useContext(EventContext)
    const [faqList, setFaqList] = useState(data.faqs || []);
    const [editIndex, setEditIndex] = useState(null);
    const [expandedIndex, setExpandedIndex] = useState([]);
    const [selectedFaqs, setSelectedFaqs] = useState([]);
    const [collapsed, setCollapsed] = useState();
    const sectionRef = useRef({});
    const {t} = useTranslation()

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
            setHasUnsavedChanges(true)
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

    useEffect(() => {
        if (data.faqs) {
            setFaqList(data.faqs)
        }
    }, [data.faqs]);

    useEffect(() => {
        setData(prev => ({...prev, faqs: faqList}))
    }, [faqList]);

    const handleExpandClick = () => {
        setCollapsed(prevState => {
            setTimeout(() => {
                if (!prevState) {
                    setTimeout(() => {
                        sectionRef.current.scrollIntoView({ behavior: 'smooth' });
                    }, 0);
                }
            }, 0);
            return !prevState;
        });
    };

    const handleEdit = (index) => {
        setEditIndex(index);
        formik.setValues(faqList[index]);
    };

    const handleDelete = (index) => {
        setFaqList(faqList.filter((_, i) => i !== index));
        setHasUnsavedChanges(true)
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
        setHasUnsavedChanges(true)
        setFaqList(faqList.filter((_, index) => !selectedFaqs.includes(index)));
        setSelectedFaqs([]);
    };

    return (
        <div className={`faq-section ${faqList.length !== 0 ? 'complete-section' : ''}`} ref={sectionRef}>
            <div className={'expand-btn'} onClick={() => {
                handleExpandClick()
            }}>
                {!collapsed ? '+' : '-'}
            </div>
            <h2 className="faq-section__title">{t('faqSection.title')}</h2>
            <p className="faq-section__description">
                {t('faqSection.description')}
            </p>
            {collapsed &&
                <>
                    <h3 className="faq-section__subtitle">{t('faqSection.subtitle')}</h3>
                    <p className="faq-section__instructions">
                        {t('faqSection.instructions')}
                    </p>

                    <form className="faq-section__form" onSubmit={formik.handleSubmit}>
                        <div className="faq-section__form-group">
                            <label htmlFor="question" className="faq-section__label">
                                {t('faqSection.questionLabel')}
                            </label>
                            <input name="question" type="text" placeholder={t('faqSection.questionPlaceholder')}
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
                                {t('faqSection.answerLabel')}
                            </label>
                            <TextAreaWithLimit name={'answer'} value={formik.values.answer}
                                               error={formik.errors.answer && formik.touched.answer}
                                               handleChange={formik.handleChange}
                                               onBlur={formik.handleBlur} rows={4}
                                               maxChars={300} helperText={formik.errors.answer} placeholder={t('faqSection.answerPlaceholder')}

                            />
                        </div>
                        <button type="submit" className="faq-section__submit">
                            {editIndex !== null ? t('faqSection.updateQuestion') : t('faqSection.addQuestion')}
                        </button>
                    </form>
                </>
            }

            {faqList.length !== 0 &&
                <div className="faq-section__bulk-actions">
                    <button onClick={handleBulkExpand} className="faq-section__bulk-action">
                        {expandedIndex.length === faqList.length ? t('faqSection.collapseAll') : t('faqSection.expandAll')}
                    </button>
                    <button
                        onClick={handleBulkDelete}
                        className="faq-section__bulk-action faq-section__bulk-action--delete"
                        disabled={selectedFaqs.length === 0}
                    >
                        {t('faqSection.deleteSelected')}
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