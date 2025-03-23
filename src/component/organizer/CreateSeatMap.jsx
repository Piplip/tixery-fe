import {
    AppBar,
    Backdrop,
    Box,
    Button,
    Checkbox,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    FormControlLabel,
    IconButton,
    Slider,
    Stack,
    Tab,
    Tabs,
    TextField,
    ToggleButton,
    ToggleButtonGroup,
    Toolbar,
    Tooltip,
    Typography
} from "@mui/material";
import {Fragment, useEffect, useState} from "react";
import CloseIcon from '@mui/icons-material/Close';
import {Divider} from "@mui/joy";
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import TableChartIcon from '@mui/icons-material/TableChart';
import CropFreeIcon from '@mui/icons-material/CropFree';
import TextFieldsIcon from '@mui/icons-material/TextFields';
import ControlPointOutlinedIcon from '@mui/icons-material/ControlPointOutlined';
import "../../styles/create-seat-map-styles.css"
import CropSquareIcon from '@mui/icons-material/CropSquare';
import CircleOutlinedIcon from '@mui/icons-material/CircleOutlined';
import HorizontalRuleRoundedIcon from '@mui/icons-material/HorizontalRuleRounded';
import KeyboardVoiceRoundedIcon from '@mui/icons-material/KeyboardVoiceRounded';
import RestaurantRoundedIcon from '@mui/icons-material/RestaurantRounded';
import LocalBarRoundedIcon from '@mui/icons-material/LocalBarRounded';
import WcRoundedIcon from '@mui/icons-material/WcRounded';
import ExitToAppRoundedIcon from '@mui/icons-material/ExitToAppRounded';
import MusicNoteRoundedIcon from '@mui/icons-material/MusicNoteRounded';
import {useFormik} from 'formik';
import * as Yup from 'yup';
import SeatMap from "./SeatMap.jsx";
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import EditIcon from '@mui/icons-material/Edit';
import CheckIcon from '@mui/icons-material/Check';
import AddIcon from '@mui/icons-material/Add';
import {getContrastColor, getUserData} from "../../common/Utilities.js";
import {initializeApp} from "firebase/app";
import {firebaseConfig} from "../../config/firebaseConfig.js";
import {getStorage, ref, uploadBytes} from "firebase/storage";
import {eventAxiosWithToken} from "../../config/axiosConfig.js";
import {useLocation, useNavigate} from "react-router-dom";

const tools = [
    {icon: <ViewModuleIcon sx={{fontSize: 30}}/>, label: 'Seats', tooltip: 'Add a seat section', type: 'seats'},
    {icon: <TableChartIcon sx={{fontSize: 30}}/>, label: 'Table', tooltip: 'Add a table', type: 'table'},
    {icon: <CropFreeIcon sx={{fontSize: 30}}/>, label: 'Object', tooltip: 'Add an object', type: 'object'},
    {icon: <TextFieldsIcon sx={{fontSize: 30}}/>, label: 'Text', tooltip: 'Add a text', type: 'text'},
];

const getValidationSchema = (selectedTool) => {
    switch (selectedTool) {
        case 'seats':
            return Yup.object().shape({
                seats: Yup.object().shape({
                    sectionName: Yup.string().required('Section Name is required'),
                    rows: Yup.number().typeError("Rows should be a number")
                        .required('Rows are required'),
                    seats: Yup.number().typeError("Seats should be a number").required('Seats are required'),
                })
            });
        case 'table':
            return Yup.object().shape({
                table: Yup.object().shape({
                    tableName: Yup.string().required('Table Name is required'),
                    seats: Yup.number().typeError("Seats should be a number").required('Seats are required'),
                    endSeats: Yup.number().typeError("End seats should be a number").required("End Seats are required")
                })
            });
        case 'object':
            return Yup.object().shape({
                object: Yup.object().shape({
                    label: Yup.string().required('Label is required'),
                })
            });
        case 'text':
            return Yup.object().shape({
                text: Yup.object().shape({
                    text: Yup.string().required('Text is required'),
                })
            });
        default:
            return Yup.object();
    }
};

const TIER_PALETTE = [
    '#FF0000',
    '#00FF00',
    '#0000FF',
    '#a9a939',
    '#FF00FF',
    '#00FFFF',
    '#FFA500',
    '#800080',
    '#008000',
    '#000080',
]

initializeApp(firebaseConfig);
const storage = getStorage()

function CreateSeatMap(){
    const [view, setView] = useState('map');
    const [hoveredTool, setHoveredTool] = useState(null);
    const [selectedTool, setSelectedTool] = useState(null);
    const [canvasObjects, setCanvasObjects] = useState([]);
    const [selectedObject, setSelectedObject] = useState([]);
    const [capacity, setCapacity] = useState(0);
    const [totalAssignedSeats, setTotalAssignedSeats] = useState(0);
    const [zoom, setZoom] = useState(1.5);
    const [offset, setOffset] = useState({ x: 0, y: 0 });
    const [center, setCenter] = useState({ x: 0, y: 0 });
    const [tier, setTier] = useState([]);
    const [togglePalette, setTogglePalette] = useState([]);
    const [openSaveDialog, setOpenSaveDialog] = useState(false);
    const [seatMapSavePreferences, setSeatMapSavePreferences] = useState({name: '', share: false});
    const [isLoading, setIsLoading] = useState(false)
    const location = useLocation()
    const navigate = useNavigate()

    const addCanvasObject = (objectType, properties) => {
        const centerPosition = {x: 0, y: 0};

        const newObject = {
            id: Date.now().toString(),
            type: objectType,
            position: centerPosition,
            properties: properties,
            rotation: 0,
            created: new Date().toISOString()
        };

        setCanvasObjects(prev => {
            const updatedObject = {
                ...newObject,
                position: {
                    x: (center.x - offset.x) / zoom,
                    y: (center.y - offset.y) / zoom
                }
            };
            return [...prev, updatedObject];
        });

        return newObject.id;
    };

    useEffect(() => {
        if(canvasObjects.length === 0) {
            setCapacity(0);
            return;
        }

        const total = canvasObjects.reduce((acc, obj) => {
            switch (obj.type) {
                case 'seats':
                    return acc + (parseInt(obj.properties.rows) * parseInt(obj.properties.seats));
                case 'table':
                    return acc + parseInt(obj.properties.seats);
                default:
                    return acc;
            }
        }, 0);

        setCapacity(total);
    }, [canvasObjects]);

    const formik = useFormik({
        initialValues: {
            seats: { sectionName: '', rows: '5', seats: '10' },
            table: { tableName: '', style: 'square', endSeats: '2', seats: '8' },
            object: { objectName: '', shape: 'square', label: 'Stage', icon: 'stage' },
            text: { text: '', size: 3 }
        },
        validationSchema: getValidationSchema(selectedTool),
        enableReinitialize: true,
        onSubmit: (values) => {
            addCanvasObject(selectedTool, values[selectedTool]);
            formik.resetForm();
            setSelectedTool(null);
        },
    });

    useEffect(() => {
        if (selectedObject.length === 1) {
            const foundObject = canvasObjects.find(obj => obj.id === selectedObject[0]);
            if (foundObject) {
                formik.setErrors({})
                const currentProps = formik.values[foundObject.type];
                if (JSON.stringify(currentProps) !== JSON.stringify(foundObject.properties)) {
                    const newValues = {
                        ...formik.values,
                        [foundObject.type]: { ...foundObject.properties }
                    };
                    formik.setValues(newValues, false);
                }
            }
        }
    }, [selectedObject, canvasObjects]);

    const RenderToolOption = (selectedTool, type = 'create') => {
        let Option;
        switch (selectedTool) {
            case 'seats':
                Option = (
                    <Stack className={'create-seat-map__tool-options'} spacing={2}>
                        <TextField label="Section Name" variant="outlined" fullWidth
                                   name="seats.sectionName"
                                   value={formik.values.seats.sectionName}
                                   onChange={formik.handleChange}
                                   onBlur={formik.handleBlur}
                                   error={formik.touched.seats?.sectionName && Boolean(formik.errors.seats?.sectionName)}
                                   helperText={formik.touched.seats?.sectionName && formik.errors.seats?.sectionName} />
                        <Stack direction={'row'} spacing={2}>
                            <TextField label="Rows" variant="outlined" fullWidth
                                       name="seats.rows"
                                       value={formik.values.seats.rows}
                                       onChange={formik.handleChange}
                                       onBlur={formik.handleBlur}
                                       error={formik.touched.seats?.rows && Boolean(formik.errors.seats?.rows)}
                                       helperText={formik.touched.seats?.rows && formik.errors.seats?.rows} />
                            <TextField label="Seats" variant="outlined" fullWidth
                                       name="seats.seats"
                                       value={formik.values.seats.seats}
                                       onChange={formik.handleChange}
                                       onBlur={formik.handleBlur}
                                       error={formik.touched.seats?.seats && Boolean(formik.errors.seats?.seats)}
                                       helperText={formik.touched.seats?.seats && formik.errors.seats?.seats} />
                        </Stack>
                    </Stack>
                );
                break;
            case 'table':
                Option = (
                    <Stack className={'create-seat-map__tool-options'} spacing={2}>
                        <TextField label="Table Name" variant="outlined" fullWidth
                                   name="table.tableName"
                                   value={formik.values.table.tableName}
                                   onChange={formik.handleChange}
                                   onBlur={formik.handleBlur}
                                   error={formik.touched.table?.tableName && Boolean(formik.errors.table?.tableName)}
                                   helperText={formik.touched.table?.tableName && formik.errors.table?.tableName} />
                        <Stack direction={'row'} spacing={2} alignItems="center" justifyContent={'space-between'}>
                            <Typography>Style</Typography>
                            <ToggleButtonGroup color="primary" exclusive
                                               value={formik.values.table.style}
                                               onChange={(e, value) => formik.setFieldValue('table.style', value)}>
                                <ToggleButton value="square">
                                    <CropSquareIcon />
                                </ToggleButton>
                                <ToggleButton value="circle">
                                    <CircleOutlinedIcon />
                                </ToggleButton>
                            </ToggleButtonGroup>
                        </Stack>
                        <TextField label="Seats" variant="outlined" fullWidth
                                   name="table.seats"
                                   value={formik.values.table.seats}
                                   onChange={formik.handleChange}
                                   onBlur={formik.handleBlur}
                                   error={formik.touched.table?.seats && Boolean(formik.errors.table?.seats)}
                                   helperText={formik.touched.table?.seats && formik.errors.table?.seats} />
                        {formik.values.table.style === 'square' &&
                            <TextField
                                label="End Seats"
                                variant="outlined"
                                fullWidth
                                name="table.endSeats"
                                value={formik.values.table.endSeats}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                error={formik.touched.table?.endSeats && Boolean(formik.errors.table?.endSeats)}
                                helperText={
                                    formik.touched.table?.endSeats && formik.errors.table?.endSeats
                                        ? formik.errors.table?.endSeats
                                        : `Can add up to ${Math.round(formik.values.table.seats / 2)} seats`
                                }
                            />
                        }
                    </Stack>
                );
                break;
            case 'object':
                Option = (
                    <Stack className={'create-seat-map__tool-options'} spacing={2}>
                        <Stack direction={'row'} spacing={2} alignItems="center" justifyContent={'space-between'}>
                            <Typography>Shape</Typography>
                            <ToggleButtonGroup color="primary" exclusive
                                               value={formik.values.object.shape}
                                               onChange={(e, value) => formik.setFieldValue('object.shape', value)}>
                                <ToggleButton value="square">
                                    <CropSquareIcon />
                                </ToggleButton>
                                <ToggleButton value="circle">
                                    <CircleOutlinedIcon />
                                </ToggleButton>
                                <ToggleButton value="line">
                                    <HorizontalRuleRoundedIcon />
                                </ToggleButton>
                            </ToggleButtonGroup>
                        </Stack>
                        <TextField label="Label" variant="outlined" fullWidth
                                   name="object.label"
                                   value={formik.values.object.label}
                                   onChange={formik.handleChange}
                                   onBlur={formik.handleBlur}
                                   error={formik.touched.object?.label && Boolean(formik.errors.object?.label)}
                                   helperText={formik.touched.object?.label && formik.errors.object?.label} />
                        <Stack spacing={2}>
                            <Typography>Object Icon</Typography>
                            <ToggleButtonGroup color="primary" exclusive
                                               value={formik.values.object.icon}
                                               onChange={(e, value) => formik.setFieldValue('object.icon', value)}>
                                <ToggleButton value="stage">
                                    <KeyboardVoiceRoundedIcon />
                                </ToggleButton>
                                <ToggleButton value="food">
                                    <RestaurantRoundedIcon />
                                </ToggleButton>
                                <ToggleButton value="drink">
                                    <LocalBarRoundedIcon />
                                </ToggleButton>
                                <ToggleButton value="bathroom">
                                    <WcRoundedIcon />
                                </ToggleButton>
                                <ToggleButton value="exit">
                                    <ExitToAppRoundedIcon />
                                </ToggleButton>
                                <ToggleButton value="dance">
                                    <MusicNoteRoundedIcon />
                                </ToggleButton>
                            </ToggleButtonGroup>
                        </Stack>
                    </Stack>
                );
                break;
            case 'text':
                Option = (
                    <Stack className={'create-seat-map__tool-options'} spacing={2}>
                        <TextField label="Text" variant="outlined" fullWidth
                                   name="text.text"
                                   value={formik.values.text.text}
                                   onChange={formik.handleChange}
                                   onBlur={formik.handleBlur}
                                   error={formik.touched.text?.text && Boolean(formik.errors.text?.text)}
                                   helperText={formik.touched.text?.text && formik.errors.text?.text} />
                        <Stack direction={'row'} spacing={2} alignItems="center" justifyContent={'space-between'}>
                            <Typography>Size</Typography>
                            <ToggleButtonGroup color="primary" exclusive
                                               value={formik.values.text.size}
                                               onChange={(e, value) => formik.setFieldValue('text.size', value)}>
                                {Array.from({ length: 5 }, (_, i) => i + 1).map((size) => (
                                    <ToggleButton key={size} value={size}>
                                        <TextFieldsIcon sx={{ fontSize: size / 2 * 10 }} />
                                    </ToggleButton>
                                ))}
                            </ToggleButtonGroup>
                        </Stack>
                    </Stack>
                );
                break;
            default:
                Option = null;
        }

        return (
            <form onSubmit={formik.handleSubmit}>
                <Stack rowGap={3}>
                    {Option}
                    {type === 'create' &&
                        <Stack direction={'row'} columnGap={1} alignSelf={'center'}>
                            <Button type={'button'} variant="outlined" color="secondary" onClick={() => setSelectedTool(null)}>
                                Cancel
                            </Button>
                            <Button type={'submit'} variant="contained" color="primary" disabled={!formik.isValid}>
                                Create
                            </Button>
                        </Stack>
                    }
                </Stack>
            </form>
        );
    };

    function getTierColor(){
        const remainColor = TIER_PALETTE.filter(color => !tier.map(t => t.color).includes(color))
        return remainColor[Math.floor(Math.random() * remainColor.length)]
    }

    function addTier(){
        setTier(prev => ([
            ...prev,
            {
                id: Date.now().toString(),
                name: 'Tier ' + (prev.length + 1),
                color: getTierColor(),
                assignedSeats: 0
            }
        ]))
        setTogglePalette(prev => ([...prev, false]))
    }

    function assignTier(tierIndex) {
        if (selectedObject.length === 0) return;

        setTier(prev => {
            const updatedTiers = [...prev];
            const currentTier = updatedTiers[tierIndex];

            let removedSeatsCount = 0;
            updatedTiers.forEach((tier, idx) => {
                if (idx !== tierIndex && Array.isArray(tier.assignedSeats)) {
                    const beforeCount = tier.assignedSeats.reduce((count, id) => {
                        if (id.includes('_')) {
                            return count + 1;
                        }
                        const tableObj = canvasObjects.find(obj => obj.id === id && obj.type === 'table');
                        return count + (tableObj ? parseInt(tableObj.properties.seats) : 0);
                    }, 0);

                    tier.assignedSeats = tier.assignedSeats.filter(
                        seatId => !selectedObject.includes(seatId)
                    );

                    const afterCount = tier.assignedSeats.reduce((count, id) => {
                        if (id.includes('_')) {
                            return count + 1;
                        }
                        const tableObj = canvasObjects.find(obj => obj.id === id && obj.type === 'table');
                        return count + (tableObj ? parseInt(tableObj.properties.seats) : 0);
                    }, 0);

                    removedSeatsCount += beforeCount - afterCount;
                }
            });

            const currentAssignedSeats = Array.isArray(currentTier.assignedSeats)
                ? currentTier.assignedSeats
                : [];

            const updatedAssignedSeats = selectedObject.reduce((acc, seatId) => {
                if (currentAssignedSeats.includes(seatId)) {
                    return acc.filter(id => id !== seatId);
                }
                return [...acc, seatId];
            }, currentAssignedSeats);

            updatedTiers[tierIndex] = {
                ...currentTier,
                assignedSeats: updatedAssignedSeats
            };

            const netChange = updatedAssignedSeats.reduce((count, id) => {
                if (!currentAssignedSeats.includes(id)) {
                    if (id.includes('_')) {
                        return count + 1;
                    }
                    const tableObj = canvasObjects.find(obj => obj.id === id && obj.type === 'table');
                    return count + (tableObj ? parseInt(tableObj.properties.seats) : 0);
                }
                return count;
            }, 0);

            setTotalAssignedSeats(prev => prev - removedSeatsCount + netChange);

            return updatedTiers;
        });

        setSelectedObject([])
    }

    function deleteTier(tierIndex) {
        setTier(prev => {
            const tierToDelete = prev[tierIndex];

            if (tierToDelete && tierToDelete.dbTierID) {
                const mapID = new URLSearchParams(location.search).get('mid');
                if (mapID) {
                    eventAxiosWithToken.delete(`/seat-map/tier?mid=${mapID}&tid=${tierToDelete.dbTierID}`)
                        .catch(error => {
                            console.error("Error deleting tier from database:", error);
                        });
                }
            }

            if (tierToDelete && Array.isArray(tierToDelete.assignedSeats)) {
                const seatsToRemove = tierToDelete.assignedSeats.reduce((count, id) => {
                    if (id.includes('_')) {
                        return count + 1;
                    }
                    const tableObj = canvasObjects.find(obj => obj.id === id && obj.type === 'table');
                    return count + (tableObj ? parseInt(tableObj.properties.seats) : 0);
                }, 0);
                setTotalAssignedSeats(prev => prev - seatsToRemove);
            }

            return prev.filter((_, index) => index !== tierIndex);
        });

        setTogglePalette(prev => prev.filter((_, index) => index !== tierIndex));
    }

    const RenderSelectedObjectOption = () => {
        if (selectedObject.length === 0) return null;

        return selectedObject.map((objectId, index) => {
            const foundObject = canvasObjects.find(obj => obj.id === objectId);
            if (!foundObject) return null;

            return (
                <Fragment key={index}>
                    {index !== selectedObject.length && <Divider />}
                    <Stack>
                        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
                            <Typography variant="subtitle1">
                                {foundObject.type.charAt(0).toUpperCase() + foundObject.type.slice(1)}
                            </Typography>
                            <IconButton size="small" onClick={() => setSelectedObject([])}>
                                <CloseIcon fontSize="small"/>
                            </IconButton>
                        </Stack>
                        {RenderToolOption(foundObject.type, 'edit')}
                        <Typography variant="body2" mt={2}>Rotation: {Math.round(foundObject.rotation * 100) / 100 || 0}°</Typography>
                        <Stack direction="row" spacing={2} alignItems="center">
                            <Typography>0°</Typography>
                            <Slider
                                value={Math.round(foundObject.rotation * 100) / 100 || 0}
                                onChange={(e, newValue) => {
                                    setCanvasObjects(prev =>
                                        prev.map(obj =>
                                            obj.id === foundObject.id
                                                ? {...obj, rotation: newValue}
                                                : obj
                                        )
                                    );
                                }}
                                min={0}
                                max={360}
                                valueLabelDisplay="auto"
                            />
                            <Typography>360°</Typography>
                        </Stack>
                        <Button variant={'contained'} sx={{mt: 1}}
                                onClick={handleChangeSelectedObjects}
                        >Change</Button>
                    </Stack>
                </Fragment>
            );
        })
    }

    function handleChangeSelectedObjects(e) {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }

        if (selectedObject.length === 0) return;

        const updates = selectedObject.map(objectId => {
            const obj = canvasObjects.find(o => o.id === objectId);
            return {
                ...obj,
                properties: formik.values[obj.type]
            };
        });

        setCanvasObjects(prev => prev.map(obj =>
            updates.find(u => u.id === obj.id) || obj
        ));
    }

    const handleToolClick = (toolType) => {
        setSelectedObject([]);
        setSelectedTool(toolType);

        formik.resetForm({
            values: {
                seats: { sectionName: '', rows: '5', seats: '10' },
                table: { tableName: '', style: 'square', endSeats: '2', seats: '8' },
                object: { objectName: '', shape: 'square', label: 'Stage', icon: 'stage' },
                text: { text: '', size: 3 }
            }
        });
    };

    const gatherCanvasData = (canvasObjects, tierData) => {
        const seatIDs = [];

        canvasObjects.forEach(obj => {
            if (obj.type === 'seats') {
                const rows = parseInt(obj.properties.rows);
                const seats = parseInt(obj.properties.seats);

                for (let r = 0; r < rows; r++) {
                    for (let s = 0; s < seats; s++) {
                        const seatId = `${obj.id}_${r}_${s}`;
                        seatIDs.push(seatId);
                    }
                }
            } else if (obj.type === 'table' || obj.type === 'object') {
                seatIDs.push(obj.id);
            }
        });

        return {
            totalAssignedSeats,
            seatIDs,
            canvasObjects: canvasObjects.map(obj => ({
                id: obj.id,
                type: obj.type,
                position: obj.position,
                properties: obj.properties,
                rotation: obj.rotation,
                created: obj.created
            })),
            tierData: tierData.map(tier => {
                const tierData = {
                    dbTierID: tier.dbTierID,
                    id: tier.id,
                    name: tier.name,
                    color: tier.color,
                    assignedSeats: tier.assignedSeats
                }
                if (tier.perks) {
                    tierData.perks = tier.perks;
                }
                return tierData;
            })
        };
    };

    const saveCanvasDataToFirebaseStorage = async (canvasObjects, tierData, storagePath) => {
        const data = gatherCanvasData(canvasObjects, tierData);
        const json = JSON.stringify(data);
        const blob = new Blob([json], { type: 'application/json' });
        const storageRef = ref(storage, storagePath);

        try {
            await uploadBytes(storageRef, blob);
            return storagePath;
        } catch (error) {
            console.error("Error uploading file: ", error);
            throw error;
        }
    };

    const gatherSeatMapData = (canvasObjects, tierData, mapUrl, ownerId, name, isPublic) => {
        return {
            ownerID: ownerId,
            name: name,
            mapURL: mapUrl,
            isPublic: isPublic,
            capacity: totalAssignedSeats,
            tiers: tierData.map(tier => {
                const tierData = {
                    tierID: tier.dbTierID,
                    name: tier.name,
                    color: tier.color,
                    totalAssignedSeats: Array.isArray(tier.assignedSeats) ? tier.assignedSeats.length : 0
                };
                if (tier.perks) {
                    tierData.perks = tier.perks;
                }
                return tierData;
            })
        };
    };

    async function handleSaveSeatMap() {
        try {
            setOpenSaveDialog(false);
            setIsLoading(true);

            const eventID = new URLSearchParams(location.search).get('eid');
            const mapID = new URLSearchParams(location.search).get('mid');

            let storageRef;
            let fileName;

            if (seatMapSavePreferences.mapURL) {
                storageRef = seatMapSavePreferences.mapURL;
                fileName = storageRef.split('/').pop();
            } else {
                fileName = `canvasData_${Date.now()}.json`;
                storageRef = `seat-map/${fileName}`;
            }

            const seatMapData = gatherSeatMapData(
                canvasObjects,
                tier,
                storageRef,
                getUserData('profileID'),
                seatMapSavePreferences.name,
                seatMapSavePreferences.share
            );

            let response;
            if (mapID) {
                response = await eventAxiosWithToken.put(`/create/seatmap?mid=${mapID}`, seatMapData);
            } else {
                response = await eventAxiosWithToken.post(`/create/seatmap?eid=${eventID}`, seatMapData);
            }

            if (response.data.status === 'OK') {
                const updatedTiers = tier.map((tierItem, index) => ({
                    ...tierItem,
                    dbTierID: response.data.data[index] || null
                }));

                await saveCanvasDataToFirebaseStorage(canvasObjects, updatedTiers, storageRef);

                navigate(`/organizer/events/edit/${eventID}/tickets?ref=seat-map`);
            } else {
                setIsLoading(false);
                console.error("Invalid response format when saving seat map");
            }
        } catch (error) {
            setIsLoading(false);
            console.error("Error saving seat map:", error);
        }
    }

    return (
        <Box display="flex" flexDirection="column" height="100dvh">
            <Backdrop
                sx={(theme) => ({ color: '#fff', zIndex: theme.zIndex.drawer + 1 })}
                open={isLoading}
                onClick={() => setIsLoading(false)}
            >
                <Stack alignItems={'center'} rowGap={2}>
                    <CircularProgress color="inherit" />
                    <Typography variant={'h5'}>
                        Saving seat map...
                    </Typography>
                </Stack>
            </Backdrop>
            <Dialog maxWidth={'sm'} fullWidth open={openSaveDialog} onClose={() => setOpenSaveDialog(false)}>
                <DialogTitle>SAVE SEAT MAP</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Enter a name for your seat map
                    </DialogContentText>
                    <TextField
                        value={seatMapSavePreferences.name}
                        onChange={(e) => setSeatMapSavePreferences(prev => ({...prev, name: e.target.value}))}
                        autoFocus
                        required
                        margin="dense"
                        label="Seat map name"
                        type="text"
                        fullWidth
                        variant="standard"
                    />
                    <FormControlLabel control={<Checkbox checked={seatMapSavePreferences.share}
                                                         onChange={(event) =>
                                                             setSeatMapSavePreferences(prev => ({...prev, share: event.target.checked}))}/>}
                                      label="Share seat map for this venue" />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenSaveDialog(false)}>Cancel</Button>
                    <Button variant={'contained'} onClick={handleSaveSeatMap} disabled={seatMapSavePreferences.name === ''}>Save</Button>
                </DialogActions>
            </Dialog>
            <AppBar position="static" color="default" elevation={1}>
                <Toolbar sx={{ justifyContent: 'space-between' }}>
                    <Stack>
                        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                            {seatMapSavePreferences.eventName || 'Create Seat Map'}
                        </Typography>
                        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                            <Tabs value={view} onChange={(e, newValue) => {
                                setView(newValue)
                                if(newValue === 'tier') {
                                    setSelectedTool(null)
                                }
                            }}>
                                <Tab label="Map" value={'map'}/>
                                {canvasObjects.length === 0 ?
                                    <Tooltip title={'Once you have created your map you will be able to create and assign tiers'}>
                                        <span>
                                            <Tab label="Tiers" value={'tier'} disabled/>
                                        </span>
                                    </Tooltip>
                                    :
                                    <Tab label="Tiers" value={'tier'} />
                                }
                            </Tabs>
                        </Box>
                    </Stack>
                    <Stack direction={'row'} columnGap={1}>
                        <Button variant="contained" color="primary" onClick={() => setOpenSaveDialog(true)}>
                            Save
                        </Button>
                        <IconButton color="inherit" onClick={() => {
                                const eventID = new URLSearchParams(location.search).get('eid')
                                navigate(`/organizer/events/edit/${eventID}/tickets?ref=seat-map`)}
                            }
                        >
                            <CloseIcon />
                        </IconButton>
                    </Stack>
                </Toolbar>
            </AppBar>

            <Stack direction={'row'} sx={{ flexGrow: 1, overflowY: 'auto' }}>
                <Box
                    sx={{
                        minWidth: 330,
                        maxWidth: 330,
                        borderRight: '2px solid #000',
                        display: 'flex',
                        flexDirection: 'column',
                        p: 2,
                        height: '100%',
                        overflowY: 'auto'
                    }}
                >
                    {view === 'map' ?
                        <>
                            <Stack direction={'row'} justifyContent={'space-between'} alignItems={'center'}>
                                <Typography variant="subtitle1" fontWeight="bold">
                                    Capacity
                                </Typography>
                                <p className={'create-seat-map__capacity'}>{capacity}</p>
                            </Stack>

                            <Divider sx={{ mb: 2 }} />

                            <Stack direction={'row'} justifyContent={'space-between'} className={'create-seat-map__tools'}>
                                {tools.map((tool, index) => (
                                    <Tooltip key={index} title={tool.tooltip}>
                                        <Stack
                                            alignItems={'center'}
                                            onMouseEnter={() => setHoveredTool(index)}
                                            onMouseLeave={() => setHoveredTool(null)}
                                            onClick={() => handleToolClick(tool.type)}
                                        >
                                            {hoveredTool === index ? <ControlPointOutlinedIcon sx={{fontSize: 30}}/> : tool.icon}
                                            <Typography variant="body2" color="textSecondary">
                                                {tool.label}
                                            </Typography>
                                        </Stack>
                                    </Tooltip>
                                ))}
                            </Stack>

                            {selectedObject.length > 0 && (
                                <>
                                    <Divider sx={{ mb: 2 }} />
                                    <Stack rowGap={2}>
                                        <RenderSelectedObjectOption />
                                    </Stack>
                                </>
                            )}
                        </>
                        :
                        <Stack rowGap={1}>
                            <Typography fontWeight={'bold'} variant={'h5'}>
                                Tiers
                            </Typography>
                            <Typography variant={'body1'}>
                                People tend to use tiers for specific areas like front row, orchestra or balcony.
                            </Typography>
                            <Divider sx={{ mb: 2 }} />
                            <Stack direction={'row'} justifyContent={'space-between'}>
                                <Typography variant={'body1'}>
                                    Tier created
                                </Typography>
                                <Typography variant={'body1'}>
                                    {tier.length} / 100
                                </Typography>
                            </Stack>
                            <Stack direction={'row'} justifyContent={'space-between'}>
                                <Typography variant={'body1'}>
                                    Seats assigned
                                </Typography>
                                <Typography variant={'body1'}>
                                    {totalAssignedSeats} / {capacity}
                                </Typography>
                            </Stack>
                            <button className={'create-seat-map__add-tier-btn'} onClick={addTier}>Add tier</button>
                            <Stack rowGap={1}>
                                {tier.map((item, index) => {
                                    return (
                                        <Stack className={'create-seat-map__tier'} key={index} rowGap={1}>
                                            <Stack direction={'row'} justifyContent={'space-between'} alignItems={'center'} style={{position: 'relative'}}>
                                                <Stack direction={'row'} columnGap={2} alignItems={'center'}>
                                                    <div className={'tier__color'} style={{backgroundColor: item.color}}>
                                                        {selectedObject.length > 0 ?
                                                            <AddIcon sx={{color: getContrastColor(item.color), fontSize: 24}} onClick={() => assignTier(index)}/>
                                                            :
                                                            <EditIcon sx={{color: getContrastColor(item.color)}}
                                                                      onClick={() => {
                                                                          setTogglePalette(prev => prev.map((_, i) => i === index ? !prev[i] : prev[i]))
                                                                      }}
                                                            />
                                                        }
                                                    </div>
                                                    <Stack sx={{width: 'fit-content'}}>
                                                        <input type={'text'} value={item.name} className={'tier__input'}
                                                            onChange={e => {
                                                                setTier(prev => prev.map((t, j) => j === index ? {...t, name: e.target.value} : t))
                                                            }}
                                                        />
                                                        <Typography variant={'body2'} sx={{color: 'gray'}}>
                                                            {item.assignedSeats?.length > 0 ?
                                                                item.assignedSeats.reduce((count, id) => {
                                                                    if (id.includes('_')) {
                                                                        return count + 1;
                                                                    }
                                                                    const tableObj = canvasObjects.find(obj => obj.id === id && obj.type === 'table');
                                                                    return count + (tableObj ? parseInt(tableObj.properties.seats) : 0);
                                                                    },
                                                                0)
                                                                :
                                                                0
                                                            }
                                                            {` seats`}
                                                        </Typography>
                                                    </Stack>
                                                </Stack>
                                                <Tooltip title={'Delete'} placement={'left'}>
                                                    <IconButton className={'tier__delete-btn'} onClick={() => deleteTier(index)}>
                                                        <DeleteOutlineIcon />
                                                    </IconButton>
                                                </Tooltip>
                                            </Stack>
                                            {togglePalette[index] &&
                                                <>
                                                    <Divider />
                                                    <Stack direction={'row'} justifyContent={'space-between'} gap={1}
                                                           flexWrap={'wrap'}>
                                                        {TIER_PALETTE.map((color, i) => (
                                                            <div key={i} className={'palette__color'}
                                                                 style={{backgroundColor: color}}
                                                                 onClick={() => {
                                                                     setTier(prev => prev.map((t, j) => j === index ? {
                                                                         ...t,
                                                                         color: color
                                                                     } : t))
                                                                 }}
                                                            >
                                                                {item.color === color &&
                                                                    <CheckIcon sx={{color: 'white'}}/>
                                                                }
                                                            </div>
                                                        ))}
                                                        <input type="color" value={'#ffffff'}
                                                            onChange={(e) => {
                                                                setTier(prev => prev.map((t, j) => j === index ? {...t, color: e.target.value} : t))
                                                            }}
                                                        />
                                                    </Stack>
                                                </>
                                            }
                                        </Stack>
                                    )
                                })}
                            </Stack>
                        </Stack>
                    }

                    <Divider sx={{ marginBlock: 2 }} />

                   {selectedTool && RenderToolOption(selectedTool)}

                    <Typography variant="body2" sx={{ mb: 1 }} className={'create-seat-map__zoom'}>
                        Zoom: {Math.round(zoom * 100)}%
                    </Typography>
                </Box>
                <Box
                    sx={{
                        flexGrow: 1,
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                    }}
                >
                    <SeatMap data={canvasObjects} setData={setCanvasObjects} selectedObject={selectedObject} setSelectedObject={setSelectedObject}
                             setCenter={setCenter} view={view} tierData={tier} setTier={setTier} setSelectedTool={setSelectedTool}
                             zoom={zoom} setZoom={setZoom} offset={offset} setOffset={setOffset} setSeatMapData={setSeatMapSavePreferences}
                            setAssignedSeat={setTotalAssignedSeats}
                    />
                </Box>
            </Stack>
        </Box>
    );
}

export default CreateSeatMap;