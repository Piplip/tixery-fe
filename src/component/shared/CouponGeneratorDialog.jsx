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
import {useTranslation} from "react-i18next";

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
    const {t} = useTranslation()

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
        setSnackbarOpen({ open: true, msg: t('generateCouponsDialog.copied') });
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
                setSnackbarOpen({ open: true, msg: t(`response-code.${r.data.message}`)});
            })
            .catch(err => {
                setIsLoading(false)
                console.log(err)
            })
    }

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth sx={{ zIndex: 1000 }}>
            <DialogTitle>
                {t('generateCouponsDialog.generateCoupons')}
                <IconButton onClick={onClose} sx={{ position: 'absolute', right: 8, top: 8 }}>
                    <CloseIcon />
                </IconButton>
                {isLoading && <LinearProgress sx={{ height: 5 }} />}
            </DialogTitle>

            <DialogContent dividers>
                <Stack rowGap={2}>
                    <Stack direction={'row'} columnGap={1.5}>
                        <FormControl fullWidth>
                            <TextField
                                label={t('generateCouponsDialog.codeLength')}
                                value={codeLength}
                                slotProps={{
                                    input: {
                                        readOnly: true,
                                        endAdornment: (
                                            <Tooltip title={t('generateCouponsDialog.codeLengthTooltip')}>
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
                            label={t('generateCouponsDialog.totalQuantity')}
                            type="number"
                            fullWidth
                            value={quantity}
                            onChange={(e) => setQuantity(e.target.value)}
                            slotProps={{
                                input: {
                                    inputProps: { min: 1 },
                                    endAdornment: (
                                        <Tooltip title={t('generateCouponsDialog.totalQuantityTooltip')}>
                                            <HelpOutline fontSize="small" />
                                        </Tooltip>
                                    )
                                }
                            }}
                        />
                        <TextField
                            label={t('generateCouponsDialog.quantityPerCoupon')}
                            type="number"
                            fullWidth
                            value={couponQuantity}
                            onChange={(e) => setCouponQuantity(e.target.value)}
                        />
                    </Stack>

                    <Stack direction={'row'} columnGap={1.5}>
                        <DatePicker sx={{ width: '50%' }} format={"DD/MM/YYYY"} disablePast
                                    label={t('generateCouponsDialog.validFrom')}
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
                                                        <Tooltip title={t('generateCouponsDialog.validFromTooltip')}>
                                                            <HelpOutline fontSize="small" />
                                                        </Tooltip>
                                                    ),
                                                }
                                            }}
                                        />
                                    )}
                        />

                        <DatePicker sx={{ width: '50%' }} format={"DD/MM/YYYY"} disablePast
                                    label={t('generateCouponsDialog.validTo')}
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
                                                        <Tooltip title={t('generateCouponsDialog.validToTooltip')}>
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
                            <InputLabel>{t('generateCouponsDialog.couponType')}</InputLabel>
                            <Select
                                value={couponType}
                                label={t('generateCouponsDialog.couponType')}
                                onChange={(e) => setCouponType(e.target.value)}
                            >
                                <MenuItem value="percentage">{t('generateCouponsDialog.percentage')}</MenuItem>
                                <MenuItem value="fixed">{t('generateCouponsDialog.fixedAmount')}</MenuItem>
                            </Select>
                        </FormControl>

                        <TextField
                            label={t('generateCouponsDialog.discountAmount')}
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
                                                couponType === 'percentage'
                                                    ? t('generateCouponsDialog.randomDiscounts')
                                                    : t('generateCouponsDialog.enterDiscountValue', { couponType })
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
                <Card variant="outlined" sx={{ marginBlock: 2 }}>
                    <CardContent>
                        <Typography variant="h6" gutterBottom>
                            {t('generateCouponsDialog.generationTips')}
                        </Typography>
                        <Divider sx={{ mb: 2 }} />
                        <ul style={{ paddingLeft: 16, margin: 0 }}>
                            <li><Typography>{t('generateCouponsDialog.tipLongerCodes')}</Typography></li>
                            <li><Typography>{t('generateCouponsDialog.tipLimitQuantity')}</Typography></li>
                            <li><Typography>{t('generateCouponsDialog.tipSetExpiration')}</Typography></li>
                            <li><Typography>{t('generateCouponsDialog.tipTestCoupons')}</Typography></li>
                        </ul>
                    </CardContent>
                </Card>

                {generatedCoupons.length > 0 &&
                    <Stack rowGap={1}>
                        <Typography variant="h6">
                            {t('generateCouponsDialog.generatedCoupons')} ({generatedCoupons.length})
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
                <Button onClick={onClose} color={'error'}>{t('generateCouponsDialog.cancel')}</Button>
                <Button
                    variant="contained"
                    onClick={generateCoupons}
                    disabled={!validFrom || !validTo}
                >
                    {t('generateCouponsDialog.generate')}
                </Button>
                <Button color={'secondary'}
                        variant="contained"
                        onClick={activateCoupon}
                        disabled={generatedCoupons.length === 0}
                >
                    {t('generateCouponsDialog.activateAll')}
                </Button>
                <Button color={'secondary'}
                        variant="contained"
                        onClick={exportToCSV}
                        disabled={generatedCoupons.length === 0}
                >
                    {t('generateCouponsDialog.exportToCSV')}
                </Button>
                <Button color={'secondary'}
                        variant="contained"
                        onClick={exportToJSON}
                        disabled={generatedCoupons.length === 0}
                >
                    {t('generateCouponsDialog.exportToJSON')}
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