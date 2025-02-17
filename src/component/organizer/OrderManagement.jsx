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

function OrderManagement(){
    const [searchParams, setSearchParams] = useSearchParams();
    const [search, setSearch] = useState(searchParams.get("search") || "");
    const [by, setBy] = useState(searchParams.get("buyer") || "Buyer");
    const [dateRange, setDateRange] = useState(searchParams.get("date") || "3");
    const [orders, setOrders] = useState([]);

    const handleFilterChange = useCallback((query, by, range) => {
        const params = new URLSearchParams({
            pid: getUserData("profileID"),
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
    }, [search, by, dateRange, debouncedHandleFilterChange]);

    function getOrderAttendeeInfo(id){
        accountAxiosWithToken.get(`/order/attendee/info?pid=${id}`)
            .then(res => {
                console.log(res.data);
            })
            .catch(err => {
                console.log(err);
            });
    }

    return (
        <Stack sx={{ padding: '5rem 2rem' }} rowGap={2}>
            <Typography fontSize={50} fontFamily={'Raleway'} fontWeight={700} gutterBottom>
                Order Management
            </Typography>
            <Typography mb={2} fontFamily={'Raleway'}>
                Manage all orders, including editing buyer info, resending tickets and processing refunds.
                To download a list of orders, view the <Link to="#" sx={{ ml: 0.5, textDecoration: "none", color: "#1a73e8" }}>Orders report</Link>.
            </Typography>
            <Stack rowGap={2}>
                <Stack direction={'row'} columnGap={1}>
                    <TextField sx={{ width: '30%' }}
                               variant="outlined"
                               placeholder="Search order number, event name"
                               value={search}
                               onChange={(e) => setSearch(e.target.value)}
                               slotProps={{
                                   input: {
                                       startAdornment: <SearchIcon sx={{ mr: 1 }} />
                                   }
                               }}
                    />
                    <FormControl sx={{ width: 150 }}>
                        <InputLabel>Search by</InputLabel>
                        <Select value={by} onChange={(e) => setBy(e.target.value)} label={'search by'}>
                            <MenuItem value="Buyer">Buyer</MenuItem>
                            <MenuItem value="Attendee">Attendee</MenuItem>
                        </Select>
                    </FormControl>
                    <FormControl sx={{ width: 200 }}>
                        <InputLabel>Date range</InputLabel>
                        <Select value={dateRange} onChange={(e) => setDateRange(e.target.value)} label={'Date range'}>
                            <MenuItem value="3">Past 3 months</MenuItem>
                            <MenuItem value="6">Past 6 months</MenuItem>
                            <MenuItem value="12">Past year</MenuItem>
                        </Select>
                    </FormControl>
                </Stack>
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell sx={{width: '7%'}}>Order ID</TableCell>
                                <TableCell sx={{width: '7%'}}>Status</TableCell>
                                <TableCell sx={{width: '7%'}}>Amount</TableCell>
                                <TableCell sx={{ width: '22.5%' }}>Event Name</TableCell>
                                <TableCell sx={{ width: '22.5%' }}>Ticket</TableCell>
                                <TableCell>Order At</TableCell>
                                <TableCell>Event Start Time</TableCell>
                                <TableCell sx={{width: '10%'}}>Action</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {orders.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={8} align="center">
                                        <Stack sx={{ height: 300 }} alignItems={'center'} justifyContent={'center'} rowGap={2}>
                                            <ReceiptLongIcon sx={{ fontSize: 120, color: "#383838", backgroundColor: '#eaeaea', padding: 2, borderRadius: '50%' }} />
                                            <Typography color={'gray'}>No orders to show. Use the filters above to search for specific orders or refine your results.</Typography>
                                        </Stack>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                orders.map(order => (
                                    <TableRow key={order.order_id}>
                                        <TableCell>{order.order_id}</TableCell>
                                        <TableCell sx={{textTransform: 'uppercase'}}>{order.status}</TableCell>
                                        <TableCell>{formatCurrency(order.amount / 100, order.currency)}</TableCell>
                                        <TableCell>{order.name}</TableCell>
                                        <TableCell sx={{wordWrap: 'break-word'}}>
                                            {order.tickets.map(ticket => (
                                                <Typography key={ticket.ticket_id} variant="body2">
                                                    {ticket.name} x{ticket.quantity}
                                                </Typography>
                                            ))}
                                        </TableCell>
                                        <TableCell>{dayjs(order.created_at).format("HH:mm DD/MM/YYYY")}</TableCell>
                                        <TableCell>{dayjs(order.start_time).format("HH:mm DD/MM/YYYY")}</TableCell>
                                        <TableCell>
                                            <Button variant={'contained'} size={'small'}
                                                onClick={() => getOrderAttendeeInfo(order.profile_id)}
                                            >
                                                View Order
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Stack>
            <Stack direction={'row'} alignItems={'center'} columnGap={.5}>
                <HelpOutlineOutlinedIcon sx={{ fontSize: 16 }} /> Learn more about
                <Link to="help" style={{ display: 'flex', alignItems: 'center', columnGap: 3 }}>
                    managing orders <LaunchOutlinedIcon sx={{ fontSize: 16 }} />
                </Link>
            </Stack>
        </Stack>
    );
}

export default OrderManagement;