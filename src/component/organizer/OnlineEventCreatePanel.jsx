import {
    Alert,
    Button,
    Checkbox,
    Drawer,
    FormControl,
    FormControlLabel, FormHelperText,
    IconButton, InputAdornment,
    InputLabel,
    MenuItem, OutlinedInput,
    Select,
    Snackbar,
    Stack,
    Switch,
    TextField, Tooltip,
    Typography
} from "@mui/material";
import SettingsIcon from '@mui/icons-material/Settings';
import InsertLinkOutlinedIcon from '@mui/icons-material/InsertLinkOutlined';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import TextFieldsIcon from '@mui/icons-material/TextFields';
import ImageIcon from '@mui/icons-material/Image';
import OndemandVideoIcon from '@mui/icons-material/OndemandVideo';
import AttachmentIcon from '@mui/icons-material/Attachment';
import {useContext, useEffect, useRef, useState} from "react";
import CloseIcon from '@mui/icons-material/Close';
import RadioGroup from "@mui/material/RadioGroup";
import Radio from '@mui/material/Radio';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import LaunchIcon from '@mui/icons-material/Launch';
import CustomEditor from "../shared/CustomEditor.jsx";
import DragAndDropZone from "../shared/DragAndDropZone.jsx";
import "../../styles/online-event-create-panel-styles.css"
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteIcon from '@mui/icons-material/Delete';
import {Link, useNavigate} from "react-router-dom";
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import {generateFileName} from "../../common/Utilities.js";
import {deleteObject, getDownloadURL, getStorage, ref, uploadBytes} from "firebase/storage";
import {initializeApp} from "firebase/app";
import {firebaseConfig} from "../../config/firebaseConfig.js";
import {eventAxiosWithToken} from "../../config/axiosConfig.js";
import {CircularProgress} from "@mui/joy";
import * as Yup from 'yup';
import {useFormik} from "formik";
import {EventContext} from "../../context.js";

initializeApp(firebaseConfig);
const storage = getStorage()

const validationSchema = Yup.object().shape({
    elements: Yup.array().of(
        Yup.object().shape({
            type: Yup.string().required('Type is required'),
            content: Yup.object().shape({
                val: Yup.string().when('type', {
                    is: 'text',
                    then: Yup.string().required('Text content is required')
                }),
                link: Yup.string().when('type', {
                    is: 'image',
                    then: Yup.string().required('Image link is required')
                }),
                url: Yup.string().when('type', {
                    is: (type) => type === 'video' || type === 'link' || type === 'live',
                    then: Yup.string().required('URL is required')
                }),
                title: Yup.string().when('type', {
                    is: 'link',
                    then: Yup.string().required('Link title is required')
                })
            })
        })
    )
});

function OnlineEventCreatePanel(){
    const {data, setData} = useContext(EventContext)
    const [openDrawer, setOpenDrawer] = useState({
        type: '', open: false
    })
    const [isChanges, setIsChanges] = useState(true);
    const [editEl, setEditEl] = useState(null)
    const [isLoading, setIsLoading] = useState(false)
    const [openSnackbar, setOpenSnackbar] = useState(false)
    const elementsContainerRef = useRef(null);
    const [lastElementCount, setLastElementCount] = useState(0)
    const [pageSettings, setPageSettings] = useState({
        access: data?.access || 'holder',
        enabled: data?.enabled || true
    })
    const navigate = useNavigate()

    useEffect(() => {
        setPageSettings({
            access: data?.access,
            enabled: data?.enabled
        })
    }, [data.location]);

    const formik = useFormik({
        initialValues: {
            elements: data.locationData ? data.locationData : []
        },
        enableReinitialize: true,
        validationSchema: validationSchema,
        onSubmit: (values) => {
            handleSave(values.elements)
            setData(prev => ({...prev, locationData: values.elements, enabled: pageSettings.enabled, access: pageSettings.access}))
        }
    });

    useEffect(() => {
        if (formik.values.elements.length > lastElementCount) {
            const lastElement = elementsContainerRef.current.lastElementChild;
            if (lastElement) {
                lastElement.scrollIntoView({ behavior: 'smooth' });
                setLastElementCount(formik.values.elements.length);
            }
        }
    }, [formik.values.elements, lastElementCount]);

    useEffect(() => {
        const initialValues = {
            elements: data.locationData ? data.locationData : []
        };

        const hasChanges = JSON.stringify(initialValues) !== JSON.stringify(formik.values);
        setIsChanges(!hasChanges);
    }, [formik.values, data.locationData]);

    useEffect(() => {
        const newData = [...data.locationData || []]
        for(let i = 0; i < newData.length; i++) {
            const item = newData[i]
            if(item.type === 'image' || item.type === 'live'){
                getDownloadURL(ref(storage, item.content.link))
                    .then(r => item.content.link = r)
            }
        }
        formik.setFieldValue('elements', newData)
    }, [data]);

    function addElement(type) {
        formik.setFieldValue('elements', [...formik.values.elements, { type, content: {}, access: 'all', visibility: 'visible' }]);
    }

    function handleChange(index, content) {
        const newElements = [...formik.values.elements];
        newElements[index].content = { ...newElements[index].content, ...content };
        formik.setFieldValue('elements', newElements);
    }

    function handleChangeProperties(index, type, value){
        const newElements = [...formik.values.elements];
        newElements[index] = { ...newElements[index], [type]: value };
        formik.setFieldValue('elements', newElements);
    }

    async function uploadMedia(src) {
        const fileName = generateFileName();
        const prefix = `${location.pathname.includes("edit") ? location.pathname.split('/')[4] : location.pathname.split('/')[3]}`
        const storageRef = ref(storage, `/events/${prefix}/online/${fileName}`);

        try {
            return await uploadBytes(storageRef, src)
        } catch (error) {
            console.log(error)
        }
    }

    async function handleImageUpload(file){
        const link = await uploadMedia(file)
        return link.metadata.fullPath
    }

    function moveElementUp(index) {
        const newElements = [...formik.values.elements];
        const temp = newElements[index - 1];
        newElements[index - 1] = newElements[index];
        newElements[index] = temp;
        formik.setFieldValue('elements', newElements);
    }

    function moveElementDown(index) {
        const newElements = [...formik.values.elements];
        const temp = newElements[index + 1];
        newElements[index + 1] = newElements[index];
        newElements[index] = temp;
        formik.setFieldValue('elements', newElements);
    }

    const ElementAction = ({type, index}) => {
        const iconSize = '1.2rem'
        return (
            <Stack className={'element-action'}>
                <IconButton sx={{color: 'black'}}
                            onClick={() => {
                                setEditEl(index)
                                setOpenDrawer({type: 'properties', open: true})
                            }}
                >
                    <EditOutlinedIcon sx={{fontSize: iconSize}}/>
                </IconButton>
                {index !== 0 &&
                    <IconButton sx={{color: 'black'}}
                                onClick={() => moveElementUp(index)}
                    >
                        <ArrowUpwardIcon sx={{fontSize: iconSize}}/>
                    </IconButton>
                }
                {index !== formik.values.elements.length - 1 &&
                    <IconButton sx={{color: 'black'}}
                                onClick={() => moveElementDown(index)}
                    >
                        <ArrowDownwardIcon sx={{fontSize: iconSize}}/>
                    </IconButton>
                }
                <IconButton sx={{color: 'black'}}
                            onClick={() => {
                                const newElements = formik.values.elements.filter((element, i) => i !== index)
                                if(formik.values.elements[index].content && type === 'image') {
                                    deleteFile(formik.values.elements[index].content.link)
                                }
                                formik.setFieldValue('elements', newElements)
                                setLastElementCount(prev => prev - 1)
                            }}
                >
                    <DeleteIcon sx={{fontSize: iconSize}} />
                </IconButton>
            </Stack>
        )
    }

    function deleteFile(file){
        const deleteRef = ref(storage, file)
        deleteObject(deleteRef)
            .catch((error) => {console.error('Error deleting file:', error)
        })
    }

    function handleSave(value){
        setIsLoading(true)
        eventAxiosWithToken.post(`/create/online?eid=${location.pathname.split('/')[location.pathname.includes('edit') ? 4 : 3]}`, {
            data: value,
            enabled: pageSettings.enabled,
            access: pageSettings.access
        })
            .then(() => {
                setIsLoading(false)
                setOpenSnackbar(true)
            })
            .catch(err => console.log(err))
    }

    function discard(){
        const proceed = confirm("Changes you made will be lost. Are you sure you want to discard?")
        if(proceed) {
            formik.setFieldValue('elements', [])
        }
    }

    function handlePreview(){
        if(isChanges){
            formik.handleSubmit()
        }
        navigate(`/online/${location.pathname.split('/')[location.pathname.includes('edit') ? 4 : 3]}/preview`)
    }

    return (
        <form onSubmit={formik.handleSubmit}>
            <Stack className={'online-event-create-panel'} rowGap={5}>
                <Stack direction={'row'} justifyContent={'space-between'}>
                    <Stack rowGap={3} sx={{width: '65%'}}>
                        <Typography variant="h3" fontWeight={'bold'} fontFamily={'Nunito'} marginBottom={2}>Attendee Event Page</Typography>
                        <Typography variant={"body1"} color={'#595959'}>
                            Attendees will join your online event through your virtual venue. Use this space to add a live video or audio stream, share additional content, and customize the look of your event page.
                        </Typography>
                        <Stack direction={'row'} alignItems={'center'} columnGap={.75} width={'fit-content'}
                               onClick={() => setOpenDrawer({type: 'setting', open: true})} style={{cursor: 'pointer'}}>
                            <SettingsIcon />
                            <div style={{color: 'blue'}}>Page Settings</div>
                        </Stack>
                    </Stack>
                    <img src={'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTvO89aKgOsDOkECc7-arKNzRUpmPq-Xxs2Nw&s'} alt={'image'}/>
                </Stack>
                <hr />
                <Stack direction={'row'} columnGap={3}>
                    <Stack justifyContent={'space-between'} width={'70%'} sx={{border: '1px solid lightgray', padding: 2, borderRadius: 2}}>
                        <Stack rowGap={2}>
                            <Stack direction={'row'} alignItems={'center'} columnGap={1}>
                                <AttachmentIcon />
                                <Typography variant={'h5'}>Add live video or audio</Typography>
                            </Stack>
                            <Typography variant={'body1'} color={'#595959'}>Add a live video or audio stream to your event. You can use any streaming service that provides a link to your stream.</Typography>
                        </Stack>
                        <Stack direction={'row'}>
                            <button type={'button'} style={{backgroundColor: 'transparent', padding: '.5rem 1.5rem', border: '1px solid blue', color: 'blue', cursor: 'pointer'}}
                                    onClick={() => addElement('live')}
                            >Add provider</button>
                        </Stack>
                    </Stack>
                    <Stack rowGap={2} width={'70%'} sx={{border: '1px solid lightgray', padding: 2, borderRadius: 2}}>
                        <Stack direction={'row'} columnGap={1} alignItems={'center'} >
                            <InfoOutlinedIcon />
                            <Typography variant={'h5'}>Share additional content</Typography>
                        </Stack>
                        <Typography variant={'body1'} color={'#595959'}>Add additional content to your event. You can add files, links, and more.</Typography>
                        <Stack>
                            <Stack direction={'row'} columnGap={3}>
                                <Stack alignItems={'center'} rowGap={.25} onClick={() => addElement('text')}>
                                    <IconButton>
                                        <TextFieldsIcon sx={{color: 'black'}}/>
                                    </IconButton>
                                    <p style={{color: '#575757'}}>Text</p>
                                </Stack>
                                <Stack alignItems={'center'} rowGap={.25} onClick={() => addElement('image')}>
                                    <IconButton>
                                        <ImageIcon sx={{color: 'black'}}/>
                                    </IconButton>
                                    <p style={{color: '#575757'}}>Image</p>
                                </Stack>
                                <Stack alignItems={'center'} rowGap={.25} onClick={() => addElement('video')}>
                                    <IconButton>
                                        <OndemandVideoIcon sx={{color: 'black'}}/>
                                    </IconButton>
                                    <p style={{color: '#575757'}}>Video</p>
                                </Stack>
                                <Stack alignItems={'center'} rowGap={.25} onClick={() => addElement('link')}>
                                    <IconButton>
                                        <InsertLinkOutlinedIcon sx={{color: 'black'}}/>
                                    </IconButton>
                                    <p style={{color: '#575757'}}>Link</p>
                                </Stack>
                            </Stack>
                        </Stack>
                    </Stack>
                </Stack>
                {formik.values.elements.length > 0 &&
                    <Stack rowGap={5} ref={elementsContainerRef}>
                        {formik.values.elements.map((element, index) => {
                            const type = element.type;
                            return (
                                <Stack key={index} className={'online-edit-element'}>
                                    {type === 'text' && (
                                        <>
                                            <Stack direction={'row'} columnGap={1}>
                                                <TextFieldsIcon />
                                                <p className={'online-element__title'}>Text</p>
                                            </Stack>
                                            <CustomEditor
                                                content={element?.content?.val}
                                                handleChange={(content) => handleChange(index, { val: content })}
                                            />
                                            {formik.errors.elements?.[index]?.content?.val && (
                                                <div className="error">{formik.errors.elements[index].content.val}</div>
                                            )}
                                        </>
                                    )}
                                    {type === 'image' && (
                                        <>
                                            <Stack direction={'row'} columnGap={1}>
                                                <ImageIcon />
                                                <p className={'online-element__title'}>Image</p>
                                            </Stack>
                                            <DragAndDropZone image={formik.values.elements[index].content.link} onFileSelect={async file => {
                                                const imgLink = await handleImageUpload(file);
                                                handleChange(index, { link: imgLink });
                                            }} />
                                            {formik.errors.elements?.[index]?.content?.link && (
                                                <div className="error">{formik.errors.elements[index].content.link}</div>
                                            )}
                                        </>
                                    )}
                                    {type === 'video' && (
                                        <>
                                            <Stack direction={'row'} columnGap={1}>
                                                <OndemandVideoIcon />
                                                <p className={'online-element__title'}>Video</p>
                                            </Stack>
                                            <FormControl variant="outlined" fullWidth>
                                                <InputLabel>Video URL</InputLabel>
                                                <OutlinedInput value={element?.content?.url || ''}
                                                               onChange={(e) => handleChange(index, { url: e.target.value })}
                                                               error={formik.touched.elements && formik.errors.elements?.[index]?.content?.url}
                                                               endAdornment={
                                                                   <InputAdornment position="end" style={{cursor: 'default'}}>
                                                                       <Tooltip title={'We currently support Youtube videos only'}>
                                                                           <InfoOutlinedIcon />
                                                                       </Tooltip>
                                                                   </InputAdornment>
                                                               }
                                                               label="Video URL"
                                                />
                                                {formik.touched.elements && formik.errors.elements?.[index]?.content?.url &&
                                                    <FormHelperText>
                                                        {formik.errors.elements[index].content.url}
                                                    </FormHelperText>
                                                }
                                            </FormControl>
                                        </>
                                    )}
                                    {type === 'link' && (
                                        <>
                                            <Stack direction={'row'} columnGap={1}>
                                                <InsertLinkOutlinedIcon />
                                                <p className={'online-element__title'}>Link</p>
                                            </Stack>
                                            <TextField
                                                label={'Link title'}
                                                value={element?.content?.title || ''}
                                                onChange={(e) => handleChange(index, { title: e.target.value })}
                                            />
                                            {formik.errors.elements?.[index]?.content?.title && (
                                                <div className="error">{formik.errors.elements[index].content.title}</div>
                                            )}
                                            <TextField
                                                label={'External document or presentation URL'}
                                                value={element?.content?.url || ''}
                                                onChange={(e) => handleChange(index, { url: e.target.value })}
                                            />
                                            {formik.errors.elements?.[index]?.content?.url && (
                                                <div className="error">{formik.errors.elements[index].content.url}</div>
                                            )}
                                        </>
                                    )}
                                    {type === 'live' && (
                                        <>
                                            <p className={'online-element__title'}>Link video or audio</p>
                                            <Stack>
                                                <TextField
                                                    label={'URL'}
                                                    value={element?.content?.url || ''}
                                                    onChange={(e) => handleChange(index, { url: e.target.value })}
                                                />
                                                {formik.errors.elements?.[index]?.content?.url && (
                                                    <div className="error">{formik.errors.elements[index].content.url}</div>
                                                )}
                                            </Stack>
                                            <Stack>
                                                <TextField
                                                    label={'Title'}
                                                    value={element?.content?.title || ''}
                                                    onChange={(e) => handleChange(index, { title: e.target.value })}
                                                />
                                                {formik.errors.elements?.[index]?.content?.title && (
                                                    <div className="error">{formik.errors.elements[index].content.title}</div>
                                                )}
                                            </Stack>
                                            <DragAndDropZone image={formik.values.elements[index].content.link} onFileSelect={async file => {
                                                const imgLink = await handleImageUpload(file)
                                                handleChange(index, {link: imgLink})
                                            }}/>
                                            <CustomEditor
                                                content={element?.content?.description || ''}
                                                handleChange={(content) => handleChange(index, {...element.content, description: content})} />
                                        </>
                                    )}
                                    <ElementAction index={index} />
                                </Stack>
                            );
                        })}
                    </Stack>
                }
                <Drawer anchor={'right'} open={openDrawer.open} onClose={() => setOpenDrawer({type: '', open: false})}>
                    <Stack paddingTop={'4rem'} width={'25rem'} paddingInline={3} rowGap={3}>
                        <Stack>
                            <Stack direction={'row'} justifyContent={'space-between'} alignItems={'center'} paddingBlock={'.5rem'}>
                                <Typography variant={'h5'}>{editEl ? 'Edit Properties' : 'Page Settings'}</Typography>
                                <IconButton onClick={() => setOpenDrawer({type: '', open: false})}>
                                    <CloseIcon />
                                </IconButton>
                            </Stack>
                            <hr />
                        </Stack>
                        {openDrawer.type === 'properties' ?
                            <Stack>
                                <Stack direction={'row'} justifyContent={'space-between'}>
                                    <Typography variant="body1" fontWeight="bold" sx={{ mb: 1 }}>
                                        Ticket access
                                    </Typography>
                                    <Link to="#" sx={{ fontSize: 14 }} className={'link'}>Learn more</Link>
                                </Stack>
                                <FormControl fullWidth>
                                    <InputLabel>Restrict access to</InputLabel>
                                    <Select label="Restrict access to" value={formik.values.elements[editEl]?.access || 'all'}
                                            onChange={(e) => {
                                                handleChangeProperties(editEl, 'access', e.target.value)
                                            }}
                                    >
                                        <MenuItem value="all">All tickets</MenuItem>
                                    </Select>
                                </FormControl>
                                <Typography variant="body1" fontWeight="bold" sx={{ mt: 3, mb: 1 }}>
                                    Visibility
                                </Typography>
                                <FormControl fullWidth>
                                    <InputLabel>Visibility</InputLabel>
                                    <Select label={'Visibility'} value={formik.values.elements[editEl]?.visibility || 'visible'}
                                            onChange={(e) =>
                                                handleChangeProperties(editEl, 'visibility', e.target.value)}
                                    >
                                        <MenuItem value="visible">Visible</MenuItem>
                                        <MenuItem value="hidden">Hidden</MenuItem>
                                        <MenuItem value="start">Hidden until event starts</MenuItem>
                                        <MenuItem value="custom">Custom schedule</MenuItem>
                                    </Select>
                                </FormControl>
                                <Typography variant="body1" fontWeight="bold" sx={{ mt: 3 }}>
                                    Notification settings
                                </Typography>
                                <FormControlLabel
                                    control={<Checkbox disabled={formik.values.elements[editEl]?.content?.visibility === 'visible'} />}
                                    label="Notify attendees when this is shown"
                                    sx={{ color: "gray" }}
                                />
                            </Stack>
                            :
                            <>
                                <Stack rowGap={1}>
                                    <Typography variant={'body1'}>Using your Attendee Event Page</Typography>
                                    <Typography variant={'body2'} color={'#595959'}>
                                        We&#39;ll redirect your attendees to this page with automatic reminder emails and access instructions.
                                    </Typography>
                                    <Stack direction={'row'} alignItems={'center'}>
                                        <Switch checked={pageSettings.enabled} onChange={() => setPageSettings(prev => ({...prev, enable: !prev.enabled}))}/>
                                        <Typography variant={'body2'}>Attendee Event Page {pageSettings.enabled ? 'enabled' : 'disabled'}</Typography>
                                    </Stack>
                                </Stack>
                                <Stack>
                                    <Typography variant={'body1'}>Who can access this page ?</Typography>
                                    <RadioGroup value={pageSettings.access} onChange={(e) => setPageSettings(prev => ({...prev, access: e.target.value}))}>
                                        <FormControlLabel value="holder" control={<Radio />} label="Ticket holders only" />
                                        <FormControlLabel value="any" control={<Radio />} label="Anyone with the link" />
                                    </RadioGroup>
                                </Stack>
                                <Stack direction={'row'} alignItems={'center'} columnGap={1} style={{backgroundColor: '#eeeeee', padding: '.5rem', borderRadius: 5}}>
                                    <HelpOutlineIcon />
                                    <Typography sx={{display: 'flex', alignItems: 'center'}} variant={'body2'} columnGap={.5}>Learn more about
                                        <span style={{display: 'flex', columnGap: '.5rem', alignItems: 'center'}} className={'link'}>online event <LaunchIcon /></span></Typography>
                                </Stack>
                            </>
                        }
                    </Stack>
                </Drawer>
                {formik.values.elements.length > 0 &&
                    <Stack direction={'row'} justifyContent={'space-between'} className={`online-event__bottom-panel`}>
                        <Typography variant={'body2'} style={{display: 'flex', alignItems: 'center', columnGap: 2}} className={'link'}
                            onClick={handlePreview}
                        >
                            Preview attendee event page <LaunchIcon />
                        </Typography>
                        <Stack direction={'row'} columnGap={2}>
                            <Button color={'error'} onClick={discard} type={'button'}>Discard</Button>
                            <Button variant={'contained'} type={'submit'} disabled={isChanges}>
                                {isLoading ? <CircularProgress color={'warning'} size={'sm'} variant={'soft'}/> : 'Save'}
                            </Button>
                        </Stack>
                    </Stack>
                }
                <Snackbar open={openSnackbar} autoHideDuration={5000} onClose={() => setOpenSnackbar(false)}
                          anchorOrigin={{vertical: 'top', horizontal: 'right'}} sx={{marginTop: '3rem'}}>
                    <Alert severity="success" variant={'filled'}>All changes saved</Alert>
                </Snackbar>
            </Stack>
        </form>
    )
}

export default OnlineEventCreatePanel