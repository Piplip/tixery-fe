import {MenuItem, Select} from "@mui/material";
import PropTypes from "prop-types";
import {useTranslation} from "react-i18next";

const currencyData = [
    { label: 'USD', sign: '$', fullKey: 'currency.usd' },
    { label: 'EUR', sign: '€', fullKey: 'currency.eur' },
    { label: 'JPY', sign: '¥', fullKey: 'currency.jpy' },
    { label: 'GBP', sign: '£', fullKey: 'currency.gbp' },
    { label: 'AUD', sign: 'A$', fullKey: 'currency.aud' },
    { label: 'CAD', sign: 'C$', fullKey: 'currency.cad' },
    { label: 'CHF', sign: 'Fr', fullKey: 'currency.chf' },
    { label: 'CNY', sign: '¥', fullKey: 'currency.cny' },
    { label: 'SEK', sign: 'kr', fullKey: 'currency.sek' },
    { label: 'NZD', sign: 'NZ$', fullKey: 'currency.nzd' },
    { label: 'KRW', sign: '₩', fullKey: 'currency.krw' },
    { label: 'SGD', sign: 'S$', fullKey: 'currency.sgd' },
    { label: 'NOK', sign: 'kr', fullKey: 'currency.nok' },
    { label: 'MXN', sign: 'Mex$', fullKey: 'currency.mxn' },
    { label: 'INR', sign: '₹', fullKey: 'currency.inr' },
    { label: 'RUB', sign: '₽', fullKey: 'currency.rub' },
    { label: 'ZAR', sign: 'R', fullKey: 'currency.zar' },
    { label: 'TRY', sign: '₺', fullKey: 'currency.try' },
    { label: 'BRL', sign: 'R$', fullKey: 'currency.brl' },
    { label: 'TWD', sign: 'NT$', fullKey: 'currency.twd' },
    { label: 'DKK', sign: 'kr', fullKey: 'currency.dkk' },
    { label: 'PLN', sign: 'zł', fullKey: 'currency.pln' },
    { label: 'THB', sign: '฿', fullKey: 'currency.thb' },
    { label: 'IDR', sign: 'Rp', fullKey: 'currency.idr' },
    { label: 'HUF', sign: 'Ft', fullKey: 'currency.huf' },
    { label: 'CZK', sign: 'Kč', fullKey: 'currency.czk' },
    { label: 'ILS', sign: '₪', fullKey: 'currency.ils' },
    { label: 'CLP', sign: 'CLP$', fullKey: 'currency.clp' },
    { label: 'PHP', sign: '₱', fullKey: 'currency.php' },
    { label: 'AED', sign: 'AED', fullKey: 'currency.aed' },
    { label: 'COP', sign: 'COL$', fullKey: 'currency.cop' },
    { label: 'SAR', sign: 'SR', fullKey: 'currency.sar' },
    { label: 'MYR', sign: 'RM', fullKey: 'currency.myr' },
    { label: 'RON', sign: 'lei', fullKey: 'currency.ron' },
    { label: 'VND', sign: '₫', fullKey: 'currency.vnd' },
    { label: 'IQD', sign: 'IQD', fullKey: 'currency.iqd' },
    { label: 'KWD', sign: 'KD', fullKey: 'currency.kwd' },
    { label: 'EGP', sign: 'EGP', fullKey: 'currency.egp' },
    { label: 'PKR', sign: 'PKR', fullKey: 'currency.pkr' },
    { label: 'QAR', sign: 'QR', fullKey: 'currency.qar' },
    { label: 'KES', sign: 'KSh', fullKey: 'currency.kes' },
    { label: 'BDT', sign: 'BDT', fullKey: 'currency.bdt' },
    { label: 'MAD', sign: 'MAD', fullKey: 'currency.mad' },
];

CurrencySelect.propTypes = {
    customHandleChange: PropTypes.func,
    value: PropTypes.string
}

function CurrencySelect({ value, customHandleChange }) {
    const { t } = useTranslation();

    function handleChange(index) {
        if (customHandleChange) {
            customHandleChange(currencyData[index].label, currencyData[index].sign, t(currencyData[index].fullKey));
        }
    }

    return (
        <Select value={value || 'USD'} variant={'outlined'} style={{ width: 'fit-content' }}>
            {currencyData.map((item, index) => {
                return <MenuItem key={index} value={item.label}
                                 onClick={() => handleChange(index)}
                >{item.label} - {item.sign}</MenuItem>
            })}
        </Select>
    )
}

export default CurrencySelect;