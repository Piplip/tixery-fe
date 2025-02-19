import {useContext, useState} from 'react';
import "../../styles/event-additional-info-styles.css"
import {Stack} from "@mui/material";
import {EventContext} from "../../context.js";
import CustomEditor from "../shared/CustomEditor.jsx";
import {useTranslation} from "react-i18next";

function EventAdditionalInfo(){
    const {data, setData, setHasUnsavedChanges} = useContext(EventContext);
    const [initialRender, setInitialRender] = useState(true)
    const {t} = useTranslation();

    const handleEditorChange = (content, editor) => {
        if(!initialRender){
            setInitialRender(false)
        }
        setHasUnsavedChanges(true)
        setData({...data, additionalInfo: content});
    }

    return (
        <Stack className={`additional-info ${data.additionalInfo !== "" && data?.additionalInfo ? 'complete-section' : ''}`}>
            <h2 className={'more-info_section__title'}>{t('additionalInfo.title')}</h2>
            <CustomEditor content={data.additionalInfo} handleChange={handleEditorChange} />
        </Stack>
    );
}

export default EventAdditionalInfo