import {MenuItem, Select} from "@mui/material";
import PropTypes from "prop-types";

const currencyData = [
    {label: 'USD', sign: '$', full: 'United States Dollar'},
    {label: 'EUR', sign: '€', full: 'Euro'},
    {label: 'JPY', sign: '¥', full: 'Japanese Yen'},
    {label: 'GBP', sign: '£', full: 'British Pound'},
    {label: 'AUD', sign: 'A$', full: 'Australian Dollar'},
    {label: 'CAD', sign: 'C$', full: 'Canadian Dollar'},
    {label: 'CHF', sign: 'Fr', full: 'Swiss Franc'},
    {label: 'CNY', sign: '¥', full: 'Chinese Yuan'},
    {label: 'SEK', sign: 'kr', full: 'Swedish Krona'},
    {label: 'NZD', sign: 'NZ$', full: 'New Zealand Dollar'},
    {label: 'KRW', sign: '₩', full: 'South Korean Won'},
    {label: 'SGD', sign: 'S$', full: 'Singapore Dollar'},
    {label: 'NOK', sign: 'kr', full: 'Norwegian Krone'},
    {label: 'MXN', sign: 'Mex$', full: 'Mexican Peso'},
    {label: 'INR', sign: '₹', full: 'Indian Rupee'},
    {label: 'RUB', sign: '₽', full: 'Russian Ruble'},
    {label: 'ZAR', sign: 'R', full: 'South African Rand'},
    {label: 'TRY', sign: '₺', full: 'Turkish Lira'},
    {label: 'BRL', sign: 'R$', full: 'Brazilian Real'},
    {label: 'TWD', sign: 'NT$', full: 'New Taiwan Dollar'},
    {label: 'DKK', sign: 'kr', full: 'Danish Krone'},
    {label: 'PLN', sign: 'zł', full: 'Polish Zloty'},
    {label: 'THB', sign: '฿', full: 'Thai Baht'},
    {label: 'IDR', sign: 'Rp', full: 'Indonesian Rupiah'},
    {label: 'HUF', sign: 'Ft', full: 'Hungarian Forint'},
    {label: 'CZK', sign: 'Kč', full: 'Czech Koruna'},
    {label: 'ILS', sign: '₪', full: 'Israeli New Shekel'},
    {label: 'CLP', sign: 'CLP$', full: 'Chilean Peso'},
    {label: 'PHP', sign: '₱', full: 'Philippine Peso'},
    {label: 'AED', sign: 'AED', full: 'United Arab Emirates Dirham'},
    {label: 'COP', sign: 'COL$', full: 'Colombian Peso'},
    {label: 'SAR', sign: 'SR', full: 'Saudi Riyal'},
    {label: 'MYR', sign: 'RM', full: 'Malaysian Ringgit'},
    {label: 'RON', sign: 'lei', full: 'Romanian Leu'},
    {label: 'VND', sign: '₫', full: 'Vietnamese Dong'},
    {label: 'IQD', sign: 'IQD', full: 'Iraqi Dinar'},
    {label: 'KWD', sign: 'KD', full: 'Kuwaiti Dinar'},
    {label: 'EGP', sign: 'EGP', full: 'Egyptian Pound'},
    {label: 'PKR', sign: 'PKR', full: 'Pakistani Rupee'},
    {label: 'QAR', sign: 'QR', full: 'Qatari Riyal'},
    {label: 'KES', sign: 'KSh', full: 'Kenyan Shilling'},
    {label: 'BDT', sign: 'BDT', full: 'Bangladeshi Taka'},
    {label: 'MAD', sign: 'MAD', full: 'Moroccan Dirham'},
];

CurrencySelect.propTypes = {
    customHandleChange: PropTypes.func,
    value: PropTypes.string
}

function CurrencySelect({value, customHandleChange}){
    function handleChange(index){
        if(customHandleChange) {
            customHandleChange(currencyData[index].label, currencyData[index].sign, currencyData[index].full);
        }
    }

    return (
        <Select value={value || 'USD'} variant={'outlined'} style={{width: 'fit-content'}}>
            {currencyData.map((item, index) => {
                return <MenuItem key={index} value={item.label}
                    onClick={() => handleChange(index)}
                >{item.label} - {item.sign}</MenuItem>
            })}
        </Select>
    )
}

export default CurrencySelect;