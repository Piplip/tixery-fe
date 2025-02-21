import {
    Alert,
    Button,
    Checkbox,
    Drawer,
    FormControl,
    FormControlLabel,
    FormHelperText,
    IconButton,
    InputAdornment,
    InputLabel,
    MenuItem,
    OutlinedInput,
    Select,
    Snackbar,
    Stack,
    Switch,
    TextField,
    Tooltip,
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
import {Link} from "react-router-dom";
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
import {useTranslation} from "react-i18next";

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
    const {t} = useTranslation()
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

    async function handleSave(value) {
        setIsLoading(true);
        try {
            await eventAxiosWithToken.post(`/create/online?eid=${location.pathname.split('/')[location.pathname.includes('edit') ? 4 : 3]}`, {
                data: value,
                enabled: pageSettings.enabled,
                access: pageSettings.access
            });
            setIsLoading(false);
            setOpenSnackbar(true);
            return true
        } catch (err) {
            console.log(err);
            setIsLoading(false);
            return false
        }
    }

    function discard(){
        const proceed = confirm("Changes you made will be lost. Are you sure you want to discard?")
        if(proceed) {
            formik.setFieldValue('elements', [])
        }
    }

    async function handlePreview() {
        const saveSuccessful = await handleSave(formik.values.elements);
        if (saveSuccessful) {
            window.open(`/online/${location.pathname.split('/')[location.pathname.includes('edit') ? 4 : 3]}/preview`, '_blank'
            );
        } else {
            console.error("Failed to save, preview will not open");
        }
    }

    return (
        <form onSubmit={formik.handleSubmit}>
            <Stack className={'online-event-create-panel'} rowGap={5}>
                <Stack direction={'row'} justifyContent={'space-between'}>
                    <Stack rowGap={3} sx={{ width: '65%' }}>
                        <Typography variant="h3" fontWeight={'bold'} fontFamily={'Nunito'} marginBottom={2}>
                            {t('onlineEvent.attendeeEventPage')}
                        </Typography>
                        <Typography variant={"body1"} color={'#595959'}>
                            {t('onlineEvent.attendeeEventPageDescription')}
                        </Typography>
                        <Stack direction={'row'} alignItems={'center'} columnGap={.75} width={'fit-content'}
                               onClick={() => setOpenDrawer({ type: 'setting', open: true })} style={{ cursor: 'pointer' }}>
                            <SettingsIcon />
                            <div style={{ color: 'blue' }}>{t('onlineEvent.pageSettings')}</div>
                        </Stack>
                    </Stack>
                    <img style={{width: '20rem'}}
                        src={'https://previews.123rf.com/images/alexandraklestova/alexandraklestova2008/alexandraklestova200800058/153601220-virtual-meeting-vector-illustration-with-diverse-people-on-online-group-video-chat-screen-internet.jpg'} alt={'image'} />
                </Stack>
                <hr />
                <Stack direction={'row'} columnGap={3}>
                    <Stack justifyContent={'space-between'} width={'70%'} sx={{ border: '1px solid lightgray', padding: 2, borderRadius: 2 }}>
                        <Stack rowGap={2}>
                            <Stack direction={'row'} alignItems={'center'} columnGap={1}>
                                <AttachmentIcon />
                                <Typography variant={'h5'}>{t('onlineEvent.addLiveVideoAudio')}</Typography>
                            </Stack>
                            <Typography variant={'body1'} color={'#595959'}>
                                {t('onlineEvent.addLiveVideoAudioDescription')}
                            </Typography>
                        </Stack>
                        <Stack direction={'row'}>
                            <button type={'button'} style={{ backgroundColor: 'transparent', padding: '.5rem 1.5rem', border: '1px solid blue', color: 'blue', cursor: 'pointer' }}
                                    onClick={() => addElement('live')}
                            >{t('onlineEvent.addProvider')}</button>
                        </Stack>
                    </Stack>
                    <Stack rowGap={2} width={'70%'} sx={{ border: '1px solid lightgray', padding: 2, borderRadius: 2 }}>
                        <Stack direction={'row'} columnGap={1} alignItems={'center'} >
                            <InfoOutlinedIcon />
                            <Typography variant={'h5'}>{t('onlineEvent.shareAdditionalContent')}</Typography>
                        </Stack>
                        <Typography variant={'body1'} color={'#595959'}>
                            {t('onlineEvent.shareAdditionalContentDescription')}
                        </Typography>
                        <Stack>
                            <Stack direction={'row'} columnGap={3}>
                                <Stack alignItems={'center'} rowGap={.25} onClick={() => addElement('text')}>
                                    <IconButton>
                                        <TextFieldsIcon sx={{ color: 'black' }} />
                                    </IconButton>
                                    <p style={{ color: '#575757' }}>{t('onlineEvent.text')}</p>
                                </Stack>
                                <Stack alignItems={'center'} rowGap={.25} onClick={() => addElement('image')}>
                                    <IconButton>
                                        <ImageIcon sx={{ color: 'black' }} />
                                    </IconButton>
                                    <p style={{ color: '#575757' }}>{t('onlineEvent.image')}</p>
                                </Stack>
                                <Stack alignItems={'center'} rowGap={.25} onClick={() => addElement('video')}>
                                    <IconButton>
                                        <OndemandVideoIcon sx={{ color: 'black' }} />
                                    </IconButton>
                                    <p style={{ color: '#575757' }}>{t('onlineEvent.video')}</p>
                                </Stack>
                                <Stack alignItems={'center'} rowGap={.25} onClick={() => addElement('link')}>
                                    <IconButton>
                                        <InsertLinkOutlinedIcon sx={{ color: 'black' }} />
                                    </IconButton>
                                    <p style={{ color: '#575757' }}>{t('onlineEvent.link')}</p>
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
                                                <p className={'online-element__title'}>{t('onlineEvent.text')}</p>
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
                                                <p className={'online-element__title'}>{t('onlineEvent.image')}</p>
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
                                                <p className={'online-element__title'}>{t('onlineEvent.video')}</p>
                                            </Stack>
                                            <FormControl variant="outlined" fullWidth>
                                                <InputLabel>{t('onlineEvent.videoURL')}</InputLabel>
                                                <OutlinedInput value={element?.content?.url || ''}
                                                               onChange={(e) => handleChange(index, { url: e.target.value })}
                                                               error={formik.touched.elements && formik.errors.elements?.[index]?.content?.url}
                                                               endAdornment={
                                                                   <InputAdornment position="end" style={{ cursor: 'default' }}>
                                                                       <Tooltip title={t('onlineEvent.youtubeOnly')}>
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
                                                <p className={'online-element__title'}>{t('onlineEvent.link')}</p>
                                            </Stack>
                                            <TextField
                                                label={t('onlineEvent.linkTitle')}
                                                value={element?.content?.title || ''}
                                                onChange={(e) => handleChange(index, { title: e.target.value })}
                                            />
                                            {formik.errors.elements?.[index]?.content?.title && (
                                                <div className="error">{formik.errors.elements[index].content.title}</div>
                                            )}
                                            <TextField
                                                label={t('onlineEvent.externalURL')}
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
                                            <p className={'online-element__title'}>{t('onlineEvent.linkVideoAudio')}</p>
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
                                                    label={t('onlineEvent.title')}
                                                    value={element?.content?.title || ''}
                                                    onChange={(e) => handleChange(index, { title: e.target.value })}
                                                />
                                                {formik.errors.elements?.[index]?.content?.title && (
                                                    <div className="error">{formik.errors.elements[index].content.title}</div>
                                                )}
                                            </Stack>
                                            <DragAndDropZone image={formik.values.elements[index].content.link} onFileSelect={async file => {
                                                const imgLink = await handleImageUpload(file)
                                                handleChange(index, { link: imgLink })
                                            }} />
                                            <CustomEditor
                                                content={element?.content?.description || ''}
                                                handleChange={(content) => handleChange(index, { ...element.content, description: content })} />
                                        </>
                                    )}
                                    <ElementAction index={index} />
                                </Stack>
                            );
                        })}
                    </Stack>
                }
                <Drawer anchor={'right'} open={openDrawer.open} onClose={() => setOpenDrawer({ type: '', open: false })}>
                    <Stack paddingTop={'4rem'} width={'25rem'} paddingInline={3} rowGap={3}>
                        <Stack>
                            <Stack direction={'row'} justifyContent={'space-between'} alignItems={'center'} paddingBlock={'.5rem'}>
                                <Typography variant={'h5'}>{editEl ? t('onlineEvent.editProperties') : t('onlineEvent.pageSettings')}</Typography>
                                <IconButton onClick={() => setOpenDrawer({ type: '', open: false })}>
                                    <CloseIcon />
                                </IconButton>
                            </Stack>
                            <hr />
                        </Stack>
                        {openDrawer.type === 'properties' ?
                            <Stack>
                                <Stack direction={'row'} justifyContent={'space-between'}>
                                    <Typography variant="body1" fontWeight="bold" sx={{ mb: 1 }}>
                                        {t('onlineEvent.ticketAccess')}
                                    </Typography>
                                    <Link to="#" sx={{ fontSize: 14 }} className={'link'}>{t('onlineEvent.learnMore')}</Link>
                                </Stack>
                                <FormControl fullWidth>
                                    <InputLabel>{t('onlineEvent.restrictAccess')}</InputLabel>
                                    <Select label="Restrict access to" value={formik.values.elements[editEl]?.access || 'all'}
                                            onChange={(e) => {
                                                handleChangeProperties(editEl, 'access', e.target.value)
                                            }}
                                    >
                                        <MenuItem value="all">{t('onlineEvent.allTickets')}</MenuItem>
                                    </Select>
                                </FormControl>
                                <Typography variant="body1" fontWeight="bold" sx={{ mt: 3, mb: 1 }}>
                                    {t('onlineEvent.visibility')}
                                </Typography>
                                <FormControl fullWidth>
                                    <InputLabel>{t('onlineEvent.visibility')}</InputLabel>
                                    <Select label={'Visibility'} value={formik.values.elements[editEl]?.visibility || 'visible'}
                                            onChange={(e) =>
                                                handleChangeProperties(editEl, 'visibility', e.target.value)}
                                    >
                                        <MenuItem value="visible">{t('onlineEvent.visible')}</MenuItem>
                                        <MenuItem value="hidden">{t('onlineEvent.hidden')}</MenuItem>
                                        <MenuItem value="start">{t('onlineEvent.hiddenUntilStart')}</MenuItem>
                                        <MenuItem value="custom">{t('onlineEvent.customSchedule')}</MenuItem>
                                    </Select>
                                </FormControl>
                                <Typography variant="body1" fontWeight="bold" sx={{ mt: 3 }}>
                                    {t('onlineEvent.notificationSettings')}
                                </Typography>
                                <FormControlLabel
                                    control={<Checkbox disabled={formik.values.elements[editEl]?.content?.visibility === 'visible'} />}
                                    label={t('onlineEvent.notifyAttendees')}
                                    sx={{ color: "gray" }}
                                />
                            </Stack>
                            :
                            <>
                                <Stack rowGap={1}>
                                    <Typography variant={'body1'}>{t('onlineEvent.usingAttendeeEventPage')}</Typography>
                                    <Typography variant={'body2'} color={'#595959'}>
                                        {t('onlineEvent.usingAttendeeEventPageDescription')}
                                    </Typography>
                                    <Stack direction={'row'} alignItems={'center'}>
                                        <Switch checked={pageSettings.enabled} onChange={() => setPageSettings(prev => ({ ...prev, enabled: !prev.enabled }))} />
                                        <Typography variant={'body2'}>{t('onlineEvent.attendeeEventPage')} {pageSettings.enabled ? t('onlineEvent.enabled') : t('onlineEvent.disabled')}</Typography>
                                    </Stack>
                                </Stack>
                                <Stack>
                                    <Typography variant={'body1'}>{t('onlineEvent.whoCanAccess')}</Typography>
                                    <RadioGroup value={pageSettings.access} onChange={(e) => setPageSettings(prev => ({ ...prev, access: e.target.value }))}>
                                        <FormControlLabel value="holder" control={<Radio />} label={t('onlineEvent.ticketHoldersOnly')} />
                                        <FormControlLabel value="any" control={<Radio />} label={t('onlineEvent.anyoneWithLink')} />
                                    </RadioGroup>
                                </Stack>
                                <Stack direction={'row'} alignItems={'center'} columnGap={1} style={{ backgroundColor: '#eeeeee', padding: '.5rem', borderRadius: 5 }}>
                                    <HelpOutlineIcon />
                                    <Typography sx={{ display: 'flex', alignItems: 'center' }} variant={'body2'} columnGap={.5}>
                                        {t('onlineEvent.learnMoreAbout')}
                                        <span style={{ display: 'flex', columnGap: '.5rem', alignItems: 'center' }} className={'link'}>{t('onlineEvent.onlineEvent')} <LaunchIcon /></span>
                                    </Typography>
                                </Stack>
                            </>
                        }
                    </Stack>
                </Drawer>
                {formik.values.elements.length > 0 &&
                    <Stack direction={'row'} justifyContent={'space-between'} className={`online-event__bottom-panel`}>
                        <Typography variant={'body2'} style={{ display: 'flex', alignItems: 'center', columnGap: 2 }} className={'link'}
                                    onClick={handlePreview}
                        >
                            {t('onlineEvent.previewAttendeePage')} <LaunchIcon />
                        </Typography>
                        <Stack direction={'row'} columnGap={2}>
                            <Button color={'error'} onClick={discard} type={'button'}>{t('onlineEvent.discard')}</Button>
                            <Button variant={'contained'} type={'submit'} disabled={isChanges}>
                                {isLoading ? <CircularProgress color={'warning'} size={'sm'} variant={'soft'} /> : t('onlineEvent.save')}
                            </Button>
                        </Stack>
                    </Stack>
                }
                <Snackbar open={openSnackbar} autoHideDuration={5000} onClose={() => setOpenSnackbar(false)}
                          anchorOrigin={{ vertical: 'top', horizontal: 'right' }} sx={{ marginTop: '3rem' }}>
                    <Alert severity="success" variant={'filled'}>{t('onlineEvent.allChangesSaved')}</Alert>
                </Snackbar>
            </Stack>
        </form>
    );
}

export default OnlineEventCreatePanel