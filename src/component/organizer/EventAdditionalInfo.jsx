import {useRef, useContext} from 'react';
import { Editor } from '@tinymce/tinymce-react';
import "../../styles/event-additional-info-styles.css"
import {Stack} from "@mui/material";
import {EventContext} from "../../context.js";

function EventAdditionalInfo(){
    const {data, setData} = useContext(EventContext);
    const editorRef = useRef(null);

    const handleEditorChange = (content, editor) => {
        setData({...data, additionalInfo: content});
    }

    return (
        <Stack className={`additional-info ${data.additionalInfo !== "" && data?.additionalInfo ? 'complete-section' : ''}`}>
            <h2 className={'more-info_section__title'}>More info for your event</h2>
            <Editor onChange={handleEditorChange} onEditorChange={handleEditorChange}
                apiKey='nw6easal0th8fh6aq4uv1z7la6rxvr47jpzs9y8dgu8xn9jq'
                onInit={(_evt, editor) => editorRef.current = editor}
                initialValue={data.additionalInfo || ""}
                init={{
                    selector: 'textarea#open-source-plugins',
                    plugins: 'preview importcss searchreplace autolink autosave directionality visualblocks visualchars fullscreen image link media charmap pagebreak nonbreaking anchor insertdatetime advlist lists wordcount charmap quickbars emoticons accordion',
                    editimage_cors_hosts: ['picsum.photos'],
                    toolbar: "undo redo | fontfamily fontsize | bold italic underline strikethrough | align numlist bullist | link image media | lineheight outdent indent| forecolor backcolor removeformat | emoticons | preview print",
                    autosave_ask_before_unload: true,
                    autosave_interval: '30s',
                    autosave_restore_when_empty: false,
                    autosave_retention: '2m',
                    content: data.additionalInfo,
                    image_advtab: true,
                    link_list: [
                        { title: 'My page 1', value: 'https://www.tiny.cloud' },
                        { title: 'My page 2', value: 'http://www.moxiecode.com' }
                    ],
                    image_list: [
                        { title: 'My page 1', value: 'https://www.tiny.cloud' },
                        { title: 'My page 2', value: 'http://www.moxiecode.com' }
                    ],
                    image_class_list: [
                        { title: 'None', value: '' },
                        { title: 'Some class', value: 'class-name' }
                    ],
                    importcss_append: true,
                    file_picker_callback: (callback, value, meta) => {
                        if (meta.filetype === 'file') {
                            callback('https://www.google.com/logos/google.jpg', { text: 'My text' });
                        }

                        if (meta.filetype === 'image') {
                            callback('https://www.google.com/logos/google.jpg', { alt: 'My alt text' });
                        }

                        if (meta.filetype === 'media') {
                            callback('movie.mp4', { source2: 'alt.ogg', poster: 'https://www.google.com/logos/google.jpg' });
                        }
                    },
                    menubar: false,
                    height: 600,
                    image_caption: true,
                    quickbars_selection_toolbar: 'bold italic | quicklink h2 h3 blockquote quickimage quicktable',
                    noneditable_class: 'mceNonEditable',
                    toolbar_mode: 'sliding',
                    contextmenu: 'link image table',
                    content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:16px }'
                }}
            />
        </Stack>
    )
}

export default EventAdditionalInfo