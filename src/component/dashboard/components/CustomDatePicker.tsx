import * as React from 'react';
import dayjs, {Dayjs} from 'dayjs';
import Button from '@mui/material/Button';
import CalendarTodayRoundedIcon from '@mui/icons-material/CalendarTodayRounded';
import {UseDateFieldProps} from '@mui/x-date-pickers/DateField';
import {DatePicker} from '@mui/x-date-pickers/DatePicker';
import {BaseSingleInputFieldProps, DateValidationError, FieldSection,} from '@mui/x-date-pickers/models';

interface ButtonFieldProps
    extends UseDateFieldProps<Dayjs, false>,
        BaseSingleInputFieldProps<
            Dayjs | null,
            Dayjs,
            FieldSection,
            false,
            DateValidationError
        > {
    setOpen?: React.Dispatch<React.SetStateAction<boolean>>;
}

function ButtonField(props: ButtonFieldProps) {
    const {
        setOpen,
        label,
        id,
        disabled,
        InputProps: {ref} = {},
        inputProps: {'aria-label': ariaLabel} = {},
    } = props;

    return (
        <Button
            variant="outlined"
            id={id}
            disabled={disabled}
            ref={ref}
            aria-label={ariaLabel}
            size="small"
            onClick={() => setOpen?.((prev) => !prev)}
            startIcon={<CalendarTodayRoundedIcon fontSize="small"/>}
            sx={{minWidth: 'fit-content'}}
        >
            {label ? `${label}` : 'Pick a date'}
        </Button>
    );
}

export default function CustomDatePicker() {
    const [value, setValue] = React.useState<Dayjs | null>(dayjs());
    const [open, setOpen] = React.useState(false);

    return (
        <DatePicker
            value={value}
            label={value == null ? null : value.format('DD MMMM YYYY')}
            onChange={(newValue) => setValue(newValue)}
            slots={{field: ButtonField}}
            slotProps={{
                field: {setOpen} as any,
                nextIconButton: {size: 'small'},
                previousIconButton: {size: 'small'},
            }}
            open={open}
            onClose={() => setOpen(false)}
            onOpen={() => setOpen(true)}
            views={['day', 'month', 'year']}
            localeText={{
                toolbarTitle: "Select date",
                okButtonLabel: "OK",
                cancelButtonLabel: "Cancel",
            }}
        />
    );
}