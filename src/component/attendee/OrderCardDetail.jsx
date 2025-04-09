import PropTypes from "prop-types";
import {Box, Button as MuiButton, Chip, Stack, Typography} from "@mui/material";
import Dialog from '@mui/material/Dialog';
import dayjs from "dayjs";
import {formatCurrency, getUserData, hexToRgba} from "../../common/Utilities.js";
import ShareDialog from "../shared/ShareDialog.jsx";
import Button from '@mui/joy/Button';
import Divider from '@mui/joy/Divider';
import DialogTitle from '@mui/joy/DialogTitle';
import DialogContent from '@mui/joy/DialogContent';
import DialogActions from '@mui/joy/DialogActions';
import Modal from '@mui/joy/Modal';
import ModalDialog from '@mui/joy/ModalDialog';
import WarningRoundedIcon from '@mui/icons-material/WarningRounded';
import {useEffect, useState} from "react";
import {QRCodeSVG} from 'qrcode.react';
import {eventAxiosWithToken} from "../../config/axiosConfig.js";
import "../../styles/order-card-detail-styles.css"
import {useTranslation} from "react-i18next";
import ReportEvent from "./ReportEvent.jsx";
import {initializeApp} from "firebase/app";
import {firebaseConfig} from "../../config/firebaseConfig.js";
import {getBytes, getStorage, ref} from "firebase/storage";
import {useAlert} from "../../custom-hooks/useAlert.js";

OrderCardDetail.propTypes = {
    open: PropTypes.bool.isRequired,
    handleClose: PropTypes.func.isRequired,
    eventImg: PropTypes.string.isRequired,
    order: PropTypes.object.isRequired,
    ticketInfo: PropTypes.any
}

initializeApp(firebaseConfig);
const storage = getStorage()

function OrderCardDetail({ open, handleClose, eventImg, order, ticketInfo }) {
    const [openDialog, setOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedTicket, setSelectedTicket] = useState(0);
    const [mapData, setMapData] = useState(null);
    const {t} = useTranslation()
    const {showError, showInfo} = useAlert()

    const getSeatInfo = (seatIdentifier) => {
        if (!mapData || !seatIdentifier) return null;

        const parts = seatIdentifier.split('_');
        const objectId = parts[0];

        const targetObject = mapData.canvasObjects.find(obj => obj.id === objectId);
        if (!targetObject) return null;

        if (parts.length === 1) {
            return {
                type: 'table',
                name: targetObject.properties.tableName,
                display: targetObject.properties.tableName
            };
        }

        if (parts.length === 3) {
            const row = parseInt(parts[1]);
            const seat = parseInt(parts[2]);

            const rowLetter = String.fromCharCode(65 + row);

            return {
                type: 'seat',
                section: targetObject.properties.sectionName,
                position: `${rowLetter}${seat + 1}`,
                display: `${targetObject.properties.sectionName} - ${t('eventRegistration.seat')} ${rowLetter}${seat + 1}`
            };
        }

        return null;
    };

    useEffect(() => {
        async function getMapData() {
            if (ticketInfo[0]?.map_url) {
                const mapRef = ref(storage, ticketInfo[0]?.map_url);
                try {
                    const bytes = await getBytes(mapRef);
                    const decoder = new TextDecoder('utf-8');
                    const jsonStr = decoder.decode(bytes);
                    const jsonData = JSON.parse(jsonStr);
                    setMapData(jsonData);
                } catch (err) {
                    console.error("Error parsing seat map file:", err);
                }
            }
        }

        getMapData()
    }, [ticketInfo]);

    function handleCancelOrder(){
        setIsLoading(true)
        eventAxiosWithToken.post(`/order/cancel?` + new URLSearchParams({"pid": getUserData('profileID'),"order-id": order.order_id, "uname": getUserData('fullName'),
            "u": getUserData('sub')}))
            .then(r => {
                if(r.data.status === 'OK'){
                    window.location.reload()
                    showInfo(t('attendeeOrderCardDetail.cancelCompleted'));
                }
            })
            .catch(() => {
                showError(t('error.somethingWentWrong'))
            })
            .finally(() => setIsLoading(false))
    }

    function downloadBlobAsFile(response) {
        const contentType = response.headers['content-type'] || 'application/pdf';
        const blob = new Blob([response.data], { type: contentType });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;

        const contentDisposition = response.headers['content-disposition'];
        let filename = 'ticket.pdf';
        if (contentDisposition) {
            const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
            const matches = filenameRegex.exec(contentDisposition);
            if (matches != null && matches[1]) {
                filename = matches[1].replace(/['"]/g, '');
            }
        }

        link.setAttribute('download', filename);
        document.body.appendChild(link);
        link.click();

        setTimeout(() => {
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        }, 100);
    }

    function handleDownloadTicket(event, index) {
        event.preventDefault();
        setIsLoading(true);
        eventAxiosWithToken.post('/ticket/download', {
            eventImg: eventImg,
            eventName: order.name,
            eventDate: dayjs(order.start_time).format("ddd, MMM DD HH:mm"),
            orderDate: dayjs(order.created_at).format('HH:mm DD, MMM YYYY'),
            location: order.location.location,
            ticketName: ticketInfo[index]?.name,
            quantity: ticketInfo[index]?.quantity,
            currency: ticketInfo[index]?.currency,
            price: ticketInfo[index]?.price,
            orderID: order.order_id,
            ticketID: ticketInfo[index]?.ticket_id,
            eventID: order.event_id,
        }, {
            responseType: 'blob',
            timeout: 30000,
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/pdf',
            }
        })
            .then(response => {
                setIsLoading(false);

                if (response?.data instanceof Blob && response.data.size > 0) {
                    if (response.data.type === 'application/json') {
                        const reader = new FileReader();
                        reader.onload = function() {
                            try {
                                const errorData = JSON.parse(reader.result);
                                showError(errorData.message || t('error.downloadCompleted'));
                            } catch (e) {
                                downloadBlobAsFile(response);
                                showInfo(t('attendeeOrderCardDetail.downloadCompleted') || 'Download completed successfully');
                            }
                        };
                        reader.readAsText(response.data);
                    } else {
                        downloadBlobAsFile(response);
                        showInfo(t('attendeeOrderCardDetail.downloadCompleted') || 'Download completed successfully');
                    }
                } else {
                    showInfo(t('attendeeOrderCardDetail.downloadCompleted'));
                }
            })
            .catch(err => {
                setIsLoading(false);
                showInfo(t('attendeeOrderCardDetail.downloadCompleted'));
            });
    }

    return (
        <Dialog fullScreen open={open} onClose={handleClose} sx={{zIndex: 10000000}}>
            <Stack sx={{ padding: '2rem 5rem' }} rowGap={2}>
                <Typography className={'link'} onClick={handleClose}>{t('attendeeOrderCardDetail.backToOrders')}</Typography>
                <Stack direction={'row'} className={'order-detail-content-wrapper'}>
                    <div className={'order-ticket-wrapper'}>
                        {ticketInfo?.length > 0 && ticketInfo?.map((item, index) => {
                            return (
                                <Stack className={`${selectedTicket === index ? 'selected-ticket' : ''} order-ticket`}
                                       style={{ transform: `translateX(${-80 * (index)}%)` }}
                                       key={index} sx={{ boxShadow: '0 0 1rem #e8e8e8', borderRadius: 5, overflow: 'hidden', width: '27.5rem' }}
                                       onClick={() => {
                                           if (selectedTicket === index) return;
                                           setSelectedTicket(index);
                                       }}
                                >
                                    <Stack maxHeight={'12.5rem'}>
                                        <img
                                            src={eventImg}
                                            alt={t('attendeeOrderCardDetail.eventImage')}
                                            style={{
                                                maxHeight: '100%',
                                                width: 'auto',
                                                objectFit: 'cover',
                                                display: 'block'
                                            }}
                                        />
                                    </Stack>
                                    <Stack rowGap={3} padding={'1rem 1.5rem'}>
                                        <Stack rowGap={.75}>
                                            <Stack direction={'row'} alignItems={'center'} justifyContent={'space-between'}>
                                                <Typography fontWeight={'bold'} fontSize={30}>{order.name}</Typography>
                                                <ShareDialog eventID={order.event_id} />
                                            </Stack>
                                            <p style={{ color: '#2a2a2a', fontSize: 14 }}>{dayjs(order.start_date).format("ddd, MMM DD HH:mm")}</p>
                                            <p style={{ color: '#564f4f', fontSize: 14 }}>{order.location.location}</p>
                                        </Stack>
                                        <Stack rowGap={2}>
                                            {order?.event_id &&
                                                <QRCodeSVG
                                                    value={{
                                                        "event_id": order.event_id,
                                                        "order_id": order.order_id,
                                                        "ticket_id": item?.ticket_id,
                                                    }}
                                                    size={150}
                                                    level="H"
                                                    style={{ margin: 'auto' }}
                                                    imageSettings={{
                                                        src: 'https://firebasestorage.googleapis.com/v0/b/medicare-10c3b.appspot.com/o/assets%2Fts.png?alt=media&token=b62ce116-11f4-4e48-94df-6838a53b6a9c',
                                                        height: 40,
                                                        width: 40,
                                                        excavate: true,
                                                    }}
                                                    fgColor="#21214d"
                                                />
                                            }
                                            <p style={{ color: '#2a2a38', fontFamily: 'Raleway', fontSize: 16, wordWrap: 'break-word', textAlign: 'center' }}>
                                                {item?.name} x{item?.quantity}</p>
                                            <div style={{
                                                alignSelf: 'center', fontSize: '2.5rem', fontWeight: 'bold', background: 'linear-gradient(90deg, #4CAF50, #81C784)',
                                                WebkitBackgroundClip: 'text', color: 'transparent', textShadow: '2px 2px 4px rgba(0, 0, 0, 0.3)',
                                                paddingInline: '20px', borderRadius: '10px', display: 'inline-block'
                                            }}>
                                                {item?.price === 0 ? t('attendeeOrderCardDetail.free') : formatCurrency(item?.price, item?.currency)}
                                            </div>
                                        </Stack>
                                        {item?.perks && (
                                            <Stack rowGap={1} sx={{ mt: 1, mb: 2 }}>
                                                <Typography variant="subtitle2" fontWeight="bold" sx={{ color: '#4d4d4d' }}>
                                                    {t('attendeeOrderCardDetail.ticketPerks')}
                                                </Typography>
                                                <Stack
                                                    direction="row"
                                                    spacing={1}
                                                    flexWrap="wrap"
                                                    useFlexGap
                                                    sx={{
                                                        backgroundColor: '#f5f5f5',
                                                        borderRadius: '8px',
                                                        p: 1.5
                                                    }}
                                                >
                                                    {item.perks.split(',').map((perk, i) => (
                                                        <Chip
                                                            key={i}
                                                            label={t(`predefinedPerks.${perk.trim()}`)}
                                                            size="small"
                                                            sx={{
                                                                margin: '4px',
                                                                backgroundColor: hexToRgba(item.tier_color, 0.2),
                                                                borderLeft: `4px solid ${item.tier_color || '#2196f3'}`,
                                                                borderRadius: '4px',
                                                                '& .MuiChip-label': {
                                                                    px: 1,
                                                                    py: 0.5,
                                                                    fontWeight: 500
                                                                }
                                                            }}
                                                        />
                                                    ))}
                                                </Stack>
                                            </Stack>
                                        )}
                                        {item?.seat_identifier && mapData && (
                                            <Stack rowGap={1} sx={{ mt: 1, mb: 2 }}>
                                                <Typography variant="subtitle2" fontWeight="bold" sx={{ color: '#4d4d4d' }}>
                                                    {t('attendeeOrderCardDetail.seatInformation')}
                                                </Typography>
                                                <Box
                                                    sx={{
                                                        backgroundColor: '#f5f5f5',
                                                        borderRadius: '8px',
                                                        p: 1.5,
                                                        position: 'relative',
                                                        overflow: 'hidden',
                                                        '&::before': {
                                                            content: '""',
                                                            position: 'absolute',
                                                            left: 0,
                                                            top: 0,
                                                            bottom: 0,
                                                            width: '4px',
                                                            backgroundColor: item.tier_color || '#2196f3'
                                                        }
                                                    }}
                                                >
                                                    {(() => {
                                                        const seatInfo = getSeatInfo(item.seat_identifier);
                                                        if (!seatInfo) return <Typography>{t('attendeeOrderCardDetail.noSeatInfo')}</Typography>;

                                                        return (
                                                            <Stack spacing={1}>
                                                                <Typography variant="body1" fontWeight="medium">
                                                                    <strong>
                                                                        {seatInfo.type === 'table'
                                                                            ? (t('attendeeOrderCardDetail.tableInfo'))
                                                                            : (t('attendeeOrderCardDetail.seatInfo'))}
                                                                    </strong>
                                                                </Typography>
                                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                                    <Box sx={{
                                                                        width: 12,
                                                                        height: 12,
                                                                        borderRadius: '50%',
                                                                        backgroundColor: item.tier_color || '#2196f3'
                                                                    }} />
                                                                    <Typography fontWeight="500">
                                                                        {seatInfo.display}
                                                                    </Typography>
                                                                </Box>
                                                                <Typography variant="body2" sx={{ color: 'text.secondary', mt: 1 }}>
                                                                    <strong>{t('attendeeOrderCardDetail.tierName')}:</strong> {item.tier_name}
                                                                </Typography>
                                                            </Stack>
                                                        );
                                                    })()}
                                                </Box>
                                            </Stack>
                                        )}
                                        <Stack rowGap={1.5}>
                                            {order?.end_time && dayjs(order.end_time).isAfter(dayjs()) &&
                                                <>
                                                    <MuiButton
                                                        color={'error'}
                                                        variant={'contained'}
                                                        sx={{ width: '100%' }}
                                                        onClick={(event) => handleDownloadTicket(event, index)}
                                                    >
                                                        {isLoading ? t('attendeeOrderCardDetail.generating') : t('attendeeOrderCardDetail.downloadTicket')}
                                                    </MuiButton>
                                                    <MuiButton variant={'outlined'} onClick={() => setOpen(true)}>{t('attendeeOrderCardDetail.cancelOrder')}</MuiButton>
                                                    {item?.refund_policy?.allowRefund &&
                                                        <Stack sx={{ backgroundColor: '#e8e8e8', padding: '.5rem .75rem' }}>
                                                            <b>{t('attendeeOrderCardDetail.refundPolicy')}</b>
                                                            <p>{t('attendeeOrderCardDetail.refundsUpTo')} <b>{item?.refund_policy?.daysForRefund} {t('attendeeOrderCardDetail.daysBeforeEvent')}</b></p>
                                                        </Stack>
                                                    }
                                                </>
                                            }
                                        </Stack>
                                        <p className={'link'} style={{ alignSelf: 'center', marginBlock: 10 }}>{t('attendeeOrderCardDetail.contactOrganizer')}</p>
                                        <Stack fontSize={14} borderTop={'1px solid'} paddingTop={2.5}>
                                            <p>{t('attendeeOrderCardDetail.order')} <b>#{order.order_id}</b> {t('attendeeOrderCardDetail.on')} {dayjs(order.created_at).format('HH:mm DD, MMM YYYY')}</p>
                                            {order?.end_time && dayjs(order.end_time).isAfter(dayjs()) &&
                                                <ReportEvent eventID={order.event_id}/>
                                            }
                                        </Stack>
                                    </Stack>
                                </Stack>
                            )
                        })}
                    </div>
                    <Stack flexGrow={1} rowGap={2} fontFamily={'Roboto Slab'}
                           sx={{ transform: `translateX(-${80 * (ticketInfo?.length >= 3 ? (ticketInfo.length + 1.75) : (ticketInfo.length - 1))}%)`}}>
                        <Typography fontWeight={'bold'} fontSize={30}>{order.name}</Typography>
                        <hr />
                        <Typography variant={'h5'}>{t('attendeeOrderCardDetail.contactInformation')}</Typography>
                        <p className={'order-detail-title'}>{t('attendeeOrderCardDetail.attendeeName')}</p>
                        <p className={'order-detail-content'}>{getUserData('fullName')}</p>
                        <p className={'order-detail-title'}>{t('attendeeOrderCardDetail.email')}</p>
                        <p className={'order-detail-content'}>{getUserData('sub')}</p>
                        <p className={'order-detail-title'}>{t('attendeeOrderCardDetail.deliveryMethod')}</p>
                        <p className={'order-detail-content'}>{t('attendeeOrderCardDetail.eTicket')}</p>
                        <p className={'order-detail-title'}>{t('attendeeOrderCardDetail.ticketName')}</p>
                        <p className={'order-detail-content'}>{ticketInfo[selectedTicket]?.name}</p>
                        <p className={'order-detail-title'}>{t('attendeeOrderCardDetail.quantity')}</p>
                        <p className={'order-detail-content'}>{ticketInfo[selectedTicket]?.quantity}</p>

                        {ticketInfo[selectedTicket]?.seat_identifier && mapData && (() => {
                            const seatInfo = getSeatInfo(ticketInfo[selectedTicket].seat_identifier);
                            if (!seatInfo) return null;

                            return (
                                <>
                                    <p className={'order-detail-title'}>
                                        {seatInfo.type === 'table'
                                            ? (t('attendeeOrderCardDetail.tableInfo'))
                                            : (t('attendeeOrderCardDetail.seatPosition'))}
                                    </p>
                                    <p className={'order-detail-content'}>{seatInfo.display}</p>
                                    <p className={'order-detail-title'}>{t('attendeeOrderCardDetail.tierName')}</p>
                                    <p className={'order-detail-content'}>{ticketInfo[selectedTicket].tier_name}</p>
                                </>
                            );
                        })()}

                        <p className={'order-detail-title'}>{t('attendeeOrderCardDetail.totalCost')}</p>
                        <p className={'order-detail-content'}>
                            {ticketInfo[selectedTicket]?.price === 0 ?
                                t('attendeeOrderCardDetail.free') :
                                ticketInfo[selectedTicket]?.currency && formatCurrency(ticketInfo[selectedTicket]?.price, ticketInfo[selectedTicket]?.currency)}
                        </p>
                    </Stack>
                </Stack>
            </Stack>
            <Modal open={openDialog} onClose={() => setOpen(false)} sx={{zIndex: 10000001}}>
                <ModalDialog variant="outlined" role="alertdialog">
                    <DialogTitle>
                        <WarningRoundedIcon />
                        {t('attendeeOrderCardDetail.cancelOrder')}
                    </DialogTitle>
                    <Divider />
                    <DialogContent>
                        {t('attendeeOrderCardDetail.cancelConfirmation')}
                    </DialogContent>
                    <DialogActions>
                        <Button variant="plain" color="neutral" onClick={() => setOpen(false)}>
                            {t('attendeeOrderCardDetail.noNevermind')}
                        </Button>
                        <Button variant="solid" color="danger" onClick={handleCancelOrder}>
                            {isLoading ? t('attendeeOrderCardDetail.cancelling') : t('attendeeOrderCardDetail.yesCancelOrder')}
                        </Button>
                    </DialogActions>
                </ModalDialog>
            </Modal>
        </Dialog>
    )
}

export default OrderCardDetail;