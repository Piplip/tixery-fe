import {useCallback, useEffect, useState} from "react";
import {
    Button,
    FormControl,
    InputLabel,
    MenuItem,
    Paper,
    Select,
    Stack,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Typography
} from "@mui/material";
import {Link, useSearchParams} from "react-router-dom";
import SearchIcon from "@mui/icons-material/Search";
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import HelpOutlineOutlinedIcon from '@mui/icons-material/HelpOutlineOutlined';
import LaunchOutlinedIcon from '@mui/icons-material/LaunchOutlined';
import {accountAxiosWithToken, eventAxiosWithToken} from "../../config/axiosConfig.js";
import {formatCurrency, getUserData} from "../../common/Utilities.js";
import {debounce} from "lodash";
import {Table} from "@mui/joy";
import dayjs from "dayjs";
import OrderCardDetail from "./OrderCardDetail.jsx";
import {useTranslation} from "react-i18next";
import CouponGeneratorDialog from "../shared/CouponGeneratorDialog.jsx";

function OrderManagement(){
    const [searchParams, setSearchParams] = useSearchParams();
    const [search, setSearch] = useState(searchParams.get("search") || "");
    const [by, setBy] = useState(searchParams.get("buyer") || "Buyer");
    const [dateRange, setDateRange] = useState(searchParams.get("date") || "3");
    const [orders, setOrders] = useState([]);
    const [openOrderDetail, setOpenOrderDetail] = useState(false);
    const [orderDetail, setOrderDetail] = useState({
        info: {},
        order: {}
    });
    const [openGenerate, setOpenGenerate] = useState(false)
    const {t} = useTranslation()

    const handleFilterChange = useCallback((query, by, range) => {
        const params = new URLSearchParams({
            pid: getUserData("userID"),
        });

        if (query) params.set('q', query);
        if (range) params.set('range', range);

        eventAxiosWithToken.get(`/search/orders?${params.toString()}`)
            .then(res => {
                console.log(res.data);
                setOrders(res.data);
            })
            .catch(err => {
                console.log(err);
            });

        setSearchParams(params);
    }, [searchParams, setSearchParams]);

    const debouncedHandleFilterChange = useCallback(debounce(handleFilterChange, 300), [handleFilterChange]);

    useEffect(() => {
        debouncedHandleFilterChange(search, by, dateRange);
    }, [search, by, dateRange]);

    function getOrderAttendeeInfo(id, index){
        accountAxiosWithToken.get(`/order/attendee/info?pid=${id}`)
            .then(res => {
                console.log(res.data);
                setOrderDetail({
                    info: res.data,
                    order: orders[index]
                })
                setOpenOrderDetail(true)
            })
            .catch(err => {
                console.log(err);
            });
    }

    console.log(orders)

    return (
        <Stack sx={{ padding: '5rem 2rem' }} rowGap={2}>
            {openOrderDetail && <OrderCardDetail open={openOrderDetail} handleClose={() => setOpenOrderDetail(false)} data={orderDetail} />}
            <Typography fontSize={'3.5rem'} fontFamily={'Raleway'} fontWeight={700} gutterBottom>
                {t('orderManagement.title')}
            </Typography>
            <Typography mb={2} fontFamily={'Raleway'}>
                {t('orderManagement.description')}
                <Link to="#" className={'link'}>{t('orderManagement.ordersReport')}</Link>.
            </Typography>
            <Stack rowGap={2}>
                <Stack direction={'row'} columnGap={1}>
                    <TextField sx={{ width: '30%' }}
                               variant="outlined"
                               placeholder={t('orderManagement.searchPlaceholder')}
                               value={search}
                               onChange={(e) => setSearch(e.target.value)}
                               slotProps={{
                                   input: {
                                       startAdornment: <SearchIcon sx={{ mr: 1 }} />
                                   }
                               }}
                    />
                    <FormControl sx={{ width: 150 }}>
                        <InputLabel>{t('orderManagement.searchBy')}</InputLabel>
                        <Select value={by} onChange={(e) => setBy(e.target.value)} label={t('orderManagement.searchBy')}>
                            <MenuItem value="Buyer">{t('orderManagement.buyer')}</MenuItem>
                            <MenuItem value="Attendee">{t('orderManagement.attendee')}</MenuItem>
                        </Select>
                    </FormControl>
                    <FormControl sx={{ width: 200 }}>
                        <InputLabel>{t('orderManagement.dateRange')}</InputLabel>
                        <Select value={dateRange} onChange={(e) => setDateRange(e.target.value)} label={t('orderManagement.dateRange')}>
                            <MenuItem value="3">{t('orderManagement.past3Months')}</MenuItem>
                            <MenuItem value="6">{t('orderManagement.past6Months')}</MenuItem>
                            <MenuItem value="12">{t('orderManagement.pastYear')}</MenuItem>
                        </Select>
                    </FormControl>
                </Stack>
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell sx={{ width: '7%' }}>{t('orderManagement.orderID')}</TableCell>
                                <TableCell sx={{ width: '9%' }}>{t('orderManagement.status')}</TableCell>
                                <TableCell sx={{ width: '7%' }}>{t('orderManagement.amount')}</TableCell>
                                <TableCell sx={{ width: '22.5%' }}>{t('orderManagement.eventName')}</TableCell>
                                <TableCell sx={{ width: '22.5%' }}>{t('orderManagement.ticket')}</TableCell>
                                <TableCell>{t('orderManagement.orderAt')}</TableCell>
                                <TableCell>{t('orderManagement.eventStartTime')}</TableCell>
                                <TableCell sx={{ width: '10%' }}>{t('orderManagement.action')}</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {orders.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={8} align="center">
                                        <Stack sx={{ height: 300 }} alignItems={'center'} justifyContent={'center'} rowGap={2}>
                                            <ReceiptLongIcon sx={{ fontSize: 120, color: "#383838", backgroundColor: '#eaeaea', padding: 2, borderRadius: '50%' }} />
                                            <Typography color={'gray'}>{t('orderManagement.noOrders')}</Typography>
                                        </Stack>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                orders.map((order, index) => (
                                    <TableRow key={index}>
                                        <TableCell>{order.order_id}</TableCell>
                                        <TableCell>{t(`orderManagement.order-status.${order.status.toLowerCase()}`)}</TableCell>
                                        <TableCell>
                                            {order.amount === null ? t('free')
                                                : order?.currency && formatCurrency(order.amount / 100, order.currency)}
                                        </TableCell>
                                        <TableCell>{order.name}</TableCell>
                                        <TableCell sx={{ wordWrap: 'break-word' }}>
                                            {order.tickets.map(ticket => (
                                                <Typography key={ticket.ticket_id} variant="body2">
                                                    {ticket.name} <b style={{fontSize: 17}}>x{ticket.quantity}</b>
                                                </Typography>
                                            ))}
                                        </TableCell>
                                        <TableCell>{dayjs(order.created_at).format("HH:mm DD/MM/YYYY")}</TableCell>
                                        <TableCell>{dayjs(order.start_time).format("HH:mm DD/MM/YYYY")}</TableCell>
                                        <TableCell>
                                            <Button variant={'contained'} size={'small'}
                                                    onClick={() => getOrderAttendeeInfo(order.profile_id, index)}
                                            >
                                                {t('orderManagement.viewOrder')}
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Stack>
            <Stack direction={'row'} justifyContent={'space-between'}>
                <Stack direction={'row'} alignItems={'center'} columnGap={.5}>
                    <HelpOutlineOutlinedIcon sx={{ fontSize: 16 }} /> {t('orderManagement.learnMore')}
                    <Link to="help" style={{ display: 'flex', alignItems: 'center', columnGap: 3 }}>
                        {t('orderManagement.managingOrders')} <LaunchOutlinedIcon sx={{ fontSize: 16 }} />
                    </Link>
                </Stack>
                <div onClick={() => setOpenGenerate(true)} className={'link'}>
                    Generate promo codes
                </div>
            </Stack>
            <CouponGeneratorDialog open={openGenerate} onClose={() => setOpenGenerate(false)} />
        </Stack>
    );
}

export default OrderManagement;