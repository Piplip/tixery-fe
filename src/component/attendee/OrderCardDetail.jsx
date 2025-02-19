import PropTypes from "prop-types";
import {Button as MuiButton, Stack, Typography} from "@mui/material";
import Dialog from '@mui/material/Dialog';
import dayjs from "dayjs";
import {formatCurrency, getUserData} from "../../common/Utilities.js";
import ShareDialog from "../shared/ShareDialog.jsx";
import Button from '@mui/joy/Button';
import Divider from '@mui/joy/Divider';
import DialogTitle from '@mui/joy/DialogTitle';
import DialogContent from '@mui/joy/DialogContent';
import DialogActions from '@mui/joy/DialogActions';
import Modal from '@mui/joy/Modal';
import ModalDialog from '@mui/joy/ModalDialog';
import WarningRoundedIcon from '@mui/icons-material/WarningRounded';
import {useState} from "react";
import {QRCodeSVG} from 'qrcode.react';
import {eventAxiosWithToken} from "../../config/axiosConfig.js";
import "../../styles/order-card-detail-styles.css"
import {useTranslation} from "react-i18next";

OrderCardDetail.propTypes = {
    open: PropTypes.bool.isRequired,
    handleClose: PropTypes.func.isRequired,
    eventImg: PropTypes.string.isRequired,
    order: PropTypes.object.isRequired,
    ticketInfo: PropTypes.any
}

function OrderCardDetail({ open, handleClose, eventImg, order, ticketInfo }) {
    const [openDialog, setOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedTicket, setSelectedTicket] = useState(0);
    const {t} = useTranslation()

    function handleCancelOrder(){
        setIsLoading(true)
        eventAxiosWithToken.post(`/order/cancel?` + new URLSearchParams({"order-id": order.order_id, "uname": getUserData('fullName'),
                "u": getUserData('sub')}))
            .then(r => {
                console.log(r.data)
                setIsLoading(false)
                if(r.data.status === 'OK'){
                    window.location.reload()
                }
            })
            .catch(err => console.log(err))
    }

    function handleDownloadTicket(index){
        setIsLoading(true)
        eventAxiosWithToken.post('/ticket/download', {
            eventImg: eventImg,
            eventName: order.name,
            eventDate: dayjs(order.start_date).format("ddd, MMM DD HH:mm"),
            orderDate: dayjs(order.created_at).format('HH:mm DD, MMM YYYY'),
            location: order.location.location,
            ticketName: ticketInfo[index]?.name,
            quantity: ticketInfo[index]?.quantity,
            currency: ticketInfo[index]?.currency,
            price: ticketInfo[index]?.price,
            orderID: order.order_id,
            ticketID: ticketInfo[index]?.ticket_id,
            eventID: order.event_id,
        }, {responseType: 'blob'})
            .then(response => {
                setIsLoading(false)
                const blob = new Blob([response.data], { type: response.headers['content-type'] });
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                const disposition = response.headers['content-disposition'];
                let filename = 'ticket.pdf';
                if (disposition && disposition.indexOf('filename=') !== -1) {
                    const filenameMatch = disposition.match(/filename="?(.+)"?/);
                    if (filenameMatch && filenameMatch.length > 1) {
                        filename = filenameMatch[1];
                    }
                }
                link.setAttribute('download', filename);
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                window.URL.revokeObjectURL(url);
            })
            .catch(err => {
                setIsLoading(false)
                console.log(err)
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
                                            {item?.price &&
                                                <div style={{
                                                    alignSelf: 'center', fontSize: '2.5rem', fontWeight: 'bold', background: 'linear-gradient(90deg, #4CAF50, #81C784)',
                                                    WebkitBackgroundClip: 'text', color: 'transparent', textShadow: '2px 2px 4px rgba(0, 0, 0, 0.3)',
                                                    paddingInline: '20px', borderRadius: '10px', display: 'inline-block'
                                                }}>
                                                    {formatCurrency(item?.price, item?.currency)}
                                                </div>
                                            }
                                        </Stack>
                                        <Stack rowGap={1.5}>
                                            <MuiButton color={'error'} variant={'contained'} sx={{ width: '100%' }}
                                                    onClick={() => handleDownloadTicket(index)}
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
                                        </Stack>
                                        <p className={'link'} style={{ alignSelf: 'center', marginBlock: 10 }}>{t('attendeeOrderCardDetail.contactOrganizer')}</p>
                                        <Stack fontSize={14} borderTop={'1px solid'} paddingTop={2.5}>
                                            <p>{t('attendeeOrderCardDetail.order')} <b>#{order.order_id}</b> {t('attendeeOrderCardDetail.on')} {dayjs(order.created_at).format('HH:mm DD, MMM YYYY')}</p>
                                            <p className={'link'}>{t('attendeeOrderCardDetail.reportThisEvent')}</p>
                                        </Stack>
                                    </Stack>
                                </Stack>
                            )
                        })}
                    </div>
                    <Stack flexGrow={1} rowGap={2} fontFamily={'Roboto Slab'} sx={{ transform: `translateX(-${90 * (ticketInfo?.length - 1)}%)` }}>
                        <Typography fontWeight={'bold'} fontSize={30}>{order.name}</Typography>
                        <hr />
                        <Typography variant={'h5'}>{t('attendeeOrderCardDetail.contactInformation')}</Typography>
                        <p className={'order-detail-title'}>{t('attendeeOrderCardDetail.attendeeName')}</p>
                        <p className={'order-detail-content'}>{getUserData('fullName')}</p>
                        <p className={'order-detail-title'}>{t('attendeeOrderCardDetail.email')}</p>
                        <p className={'order-detail-content'}>{getUserData('sub')}</p>
                        <p className={'order-detail-title'}>{t('attendeeOrderCardDetail.deliveryMethod')}</p>
                        <p className={'order-detail-content'}>eTicket</p>
                        <p className={'order-detail-title'}>{t('attendeeOrderCardDetail.ticketName')}</p>
                        <p className={'order-detail-content'}>{ticketInfo[selectedTicket]?.name}</p>
                        <p className={'order-detail-title'}>{t('attendeeOrderCardDetail.quantity')}</p>
                        <p className={'order-detail-content'}>{ticketInfo[selectedTicket]?.quantity}</p>
                        <p className={'order-detail-title'}>{t('attendeeOrderCardDetail.totalCost')}</p>
                        <p className={'order-detail-content'}>
                            {ticketInfo[selectedTicket]?.currency && formatCurrency(ticketInfo[selectedTicket]?.price, ticketInfo[selectedTicket]?.currency)}
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