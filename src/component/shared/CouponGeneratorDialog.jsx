import {
    Alert,
    Button,
    Card,
    CardContent,
    Chip,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    FormControl,
    IconButton,
    InputAdornment,
    InputLabel, LinearProgress,
    MenuItem,
    Select,
    Slider,
    Snackbar,
    Stack,
    TextField,
    Tooltip,
    Typography
} from '@mui/material';
import {DatePicker} from '@mui/x-date-pickers';
import {ContentCopy, HelpOutline} from '@mui/icons-material';
import {useState} from 'react';
import CloseIcon from "@mui/icons-material/Close";
import PropTypes from "prop-types";
import { saveAs } from 'file-saver';
import {eventAxiosWithToken} from "../../config/axiosConfig.js";
import dayjs from "dayjs";

CouponGeneratorDialog.propTypes = {
    open: PropTypes.bool,
    onClose: PropTypes.func
}

function CouponGeneratorDialog ({ open, onClose }) {
    const [codeLength, setCodeLength] = useState(24);
    const [validFrom, setValidFrom] = useState(dayjs());
    const [validTo, setValidTo] = useState(dayjs().add(1, 'month'));
    const [couponType, setCouponType] = useState('percentage');
    const [discountAmount, setDiscountAmount] = useState(10);
    const [quantity, setQuantity] = useState(50);
    const [couponQuantity, setCouponQuantity] = useState(1);
    const [generatedCoupons, setGeneratedCoupons] = useState([]);
    const [isLoading, setIsLoading] = useState(false)
    const [snackbarOpen, setSnackbarOpen] = useState({
        open: false, msg: ''
    });

    const generateCoupons = () => {
        const coupons = [];
        for (let i = 0; i < quantity; i++) {
            coupons.push({
                code: generateRandomCode(codeLength),
                type: couponType,
                discount: discountAmount,
                quantity: couponQuantity,
                validFrom,
                validTo,
            });
        }
        setGeneratedCoupons(coupons);
    };

    const generateRandomCode = (length) => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        return Array.from({ length }, () =>
            chars[Math.floor(Math.random() * chars.length)]
        ).join('');
    };

    const handleCopy = (code) => {
        navigator.clipboard.writeText(code);
        setSnackbarOpen({ open: true, msg: 'Coupon code copied to clipboard' });
    };

    const exportToCSV = () => {
        const csvContent = [
            ['Code', 'Type', 'Discount', 'Quantity', 'Valid From', 'Valid To'],
            ...generatedCoupons.map(coupon => [
                coupon.code,
                coupon.type,
                coupon.discount,
                coupon.quantity,
                coupon.validFrom ? coupon.validFrom.format('DD/MM/YYYY') : '',
                coupon.validTo ? coupon.validTo.format('DD/MM/YYYY') : ''
            ])
        ].map(e => e.join(",")).join("\n");

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        saveAs(blob, 'coupons.csv');
    };

    const exportToJSON = () => {
        const jsonContent = JSON.stringify(generatedCoupons, null, 2);
        const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
        saveAs(blob, 'coupons.json');
    };

    function activateCoupon(){
        setIsLoading(true)
        eventAxiosWithToken.post('/coupon/activate', generatedCoupons)
            .then(r => {
                setIsLoading(false)
                setSnackbarOpen({ open: true, msg: r.data.message});
            })
            .catch(err => {
                setIsLoading(false)
                console.log(err)
            })
    }

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth sx={{zIndex: 1000}}>
            <DialogTitle>
                Generate Coupons
                <IconButton onClick={onClose} sx={{ position: 'absolute', right: 8, top: 8 }}>
                    <CloseIcon />
                </IconButton>
                {isLoading && <LinearProgress sx={{height: 5}}/>}
            </DialogTitle>

            <DialogContent dividers>
                <Stack rowGap={2}>
                    <Stack direction={'row'} columnGap={1.5}>
                        <FormControl fullWidth>
                            <TextField
                                label="Code Length"
                                value={codeLength}
                                slotProps={{
                                    input: {
                                        readOnly: true,
                                        endAdornment: (
                                            <Tooltip title="Recommended length: 8-12 characters">
                                                <HelpOutline fontSize="small" />
                                            </Tooltip>
                                        ),
                                    }
                                }}
                            />
                            <Slider
                                value={codeLength}
                                min={24}
                                max={80}
                                onChange={(e, val) => setCodeLength(val)}
                                aria-labelledby="code-length-slider"
                            />
                        </FormControl>
                        <TextField
                            label="Total Quantity"
                            type="number"
                            fullWidth
                            value={quantity}
                            onChange={(e) => setQuantity(e.target.value)}
                            slotProps={{
                                input: {
                                    inputProps: {min: 1},
                                    endAdornment: (
                                        <Tooltip title="Number of unique coupons to generate">
                                            <HelpOutline fontSize="small"/>
                                        </Tooltip>
                                    )
                                }
                            }}
                        />
                        <TextField
                            label="Quantity available for each coupon"
                            type="number"
                            fullWidth
                            value={couponQuantity}
                            onChange={(e) => setCouponQuantity(e.target.value)}
                        />
                    </Stack>

                    <Stack direction={'row'} columnGap={1.5}>
                        <DatePicker sx={{width: '50%'}} format={"DD/MM/YYYY"} disablePast
                                    label="Valid From"
                                    value={validFrom}
                                    onChange={(newValue) => setValidFrom(newValue)}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            fullWidth
                                            slotProps={{
                                                input: {
                                                    ...params.InputProps,
                                                    endAdornment: (
                                                        <Tooltip title="Start date for coupon validity">
                                                            <HelpOutline fontSize="small" />
                                                        </Tooltip>
                                                    ),
                                                }
                                            }}
                                        />
                                    )}
                        />

                        <DatePicker sx={{width: '50%'}} format={"DD/MM/YYYY"} disablePast
                                    label="Valid To"
                                    value={validTo}
                                    onChange={(newValue) => setValidTo(newValue)}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            fullWidth
                                            slotProps={{
                                                input: {
                                                    ...params.InputProps,
                                                    endAdornment: (
                                                        <Tooltip title="Expiration date for coupon validity">
                                                            <HelpOutline fontSize="small" />
                                                        </Tooltip>
                                                    ),
                                                }
                                            }}
                                        />
                                    )}
                        />
                    </Stack>

                    <Stack direction={'row'} columnGap={1.5}>
                        <FormControl fullWidth>
                            <InputLabel>Coupon Type</InputLabel>
                            <Select
                                value={couponType}
                                label="Coupon Type"
                                onChange={(e) => setCouponType(e.target.value)}
                            >
                                <MenuItem value="percentage">Percentage</MenuItem>
                                <MenuItem value="fixed">Fixed Amount</MenuItem>
                            </Select>
                        </FormControl>

                        <TextField
                            label="Discount Amount"
                            type="number"
                            fullWidth
                            value={discountAmount}
                            onChange={(e) => setDiscountAmount(e.target.value)}
                            slotProps={{
                                input: {
                                    endAdornment: (
                                        <Stack direction={'row'} columnGap={1}>
                                            <InputAdornment position="end">
                                                {couponType === 'percentage' ? '%' : '$'}
                                            </InputAdornment>
                                            <Tooltip title={
                                                couponType === 'randomize'
                                                    ? 'Random discounts between 5% to 50%'
                                                    : `Enter ${couponType} discount value`
                                            }>
                                                <HelpOutline fontSize="small" />
                                            </Tooltip>
                                        </Stack>
                                    ),
                                    inputProps: {
                                        min: couponType === 'percentage' ? 0 : 1,
                                        max: couponType === 'percentage' ? 100 : undefined
                                    }
                                }
                            }}
                        />
                    </Stack>
                </Stack>
                <Card variant="outlined" sx={{marginBlock: 2}}>
                    <CardContent>
                        <Typography variant="h6" gutterBottom>
                            💡 Generation Tips
                        </Typography>
                        <Divider sx={{ mb: 2 }} />
                        <ul style={{ paddingLeft: 16, margin: 0 }}>
                            <li><Typography>Use longer codes for higher security</Typography></li>
                            <li><Typography>Limit quantity based on your distribution plan</Typography></li>
                            <li><Typography>Set expiration dates to encourage urgency</Typography></li>
                            <li><Typography>Test coupons before mass distribution</Typography></li>
                        </ul>
                    </CardContent>
                </Card>

                {generatedCoupons.length > 0 &&
                    <Stack rowGap={1}>
                        <Typography variant="h6">
                            Generated Coupons ({generatedCoupons.length})
                        </Typography>
                        <Stack direction={'row'} gap={1} flexWrap={'wrap'}>
                            {generatedCoupons.map((coupon, index) => (
                                <Chip key={index}
                                      label={coupon.code}
                                      onDelete={() => handleCopy(coupon.code)}
                                      deleteIcon={<ContentCopy fontSize="small" />}
                                      variant="outlined"
                                />
                            ))}
                        </Stack>
                    </Stack>
                }

            </DialogContent>

            <DialogActions>
                <Button onClick={onClose} color={'error'}>Cancel</Button>
                <Button
                    variant="contained"
                    onClick={generateCoupons}
                    disabled={!validFrom || !validTo}
                >
                    Generate
                </Button>
                <Button
                    variant={'contained'}
                    onClick={activateCoupon}
                    disabled={generatedCoupons.length === 0}
                >
                    Activate all coupon
                </Button>
                <Button color={'secondary'}
                    variant="contained"
                    onClick={exportToCSV}
                    disabled={generatedCoupons.length === 0}
                >
                    Export to CSV
                </Button>
                <Button color={'secondary'}
                    variant="contained"
                    onClick={exportToJSON}
                    disabled={generatedCoupons.length === 0}
                >
                    Export to JSON
                </Button>
            </DialogActions>

            <Snackbar
                open={snackbarOpen.open}
                autoHideDuration={3000}
                onClose={() => setSnackbarOpen({ open: false, msg: '' })}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <Alert onClose={() => setSnackbarOpen({ open: false, msg: '' })} severity="success" sx={{ width: '100%' }}>
                    {snackbarOpen.msg}
                </Alert>
            </Snackbar>
        </Dialog>
    );
}

export default CouponGeneratorDialog;