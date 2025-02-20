import {Editor} from "@tinymce/tinymce-react";
import PropTypes from "prop-types";
import {useRef} from "react";

CustomEditor.propTypes = {
    content: PropTypes.string,
    handleChange: PropTypes.func
}

function CustomEditor({content, handleChange}){
    const editorRef = useRef(null);

    return (
        <Editor onEditorChange={handleChange}
                apiKey='nw6easal0th8fh6aq4uv1z7la6rxvr47jpzs9y8dgu8xn9jq'
                onInit={(_evt, editor) => editorRef.current = editor}
                value={content}
                init={{
                    selector: 'textarea#open-source-plugins',
                    plugins: 'preview importcss searchreplace autolink autosave directionality visualblocks visualchars fullscreen image link media charmap pagebreak nonbreaking anchor insertdatetime advlist lists wordcount charmap quickbars emoticons accordion',
                    editimage_cors_hosts: ['picsum.photos'],
                    toolbar: "undo redo | fontfamily fontsize | bold italic underline strikethrough | align numlist bullist | link image media | lineheight outdent indent| forecolor backcolor removeformat | emoticons | preview print",
                    autosave_ask_before_unload: true,
                    autosave_interval: '30s',
                    autosave_restore_when_empty: false,
                    autosave_retention: '2m',
                    content: content,
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
                    menubar: false,
                    height: 450,
                    image_caption: true,
                    quickbars_selection_toolbar: 'bold italic | quicklink h2 h3 blockquote quickimage quicktable',
                    noneditable_class: 'mceNonEditable',
                    toolbar_mode: 'sliding',
                    contextmenu: 'link image table',
                    content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:16px }'
                }}
        />
    )
}

export default CustomEditor