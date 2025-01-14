import {IconButton, Stack, TextField} from "@mui/material";
import PropTypes from "prop-types";
import ErrorOutlinedIcon from "@mui/icons-material/ErrorOutlined";

TextAreaWithLimit.propTypes = {
    maxChars: PropTypes.number,
    placeholder: PropTypes.string,
    value: PropTypes.string,
    handleChange: PropTypes.func,
    name: PropTypes.string,
    error: PropTypes.bool,
    helperText: PropTypes.string,
    onBlur: PropTypes.func,
    rows: PropTypes.number,
    label: PropTypes.string,
}

function TextAreaWithLimit({ label, maxChars = 200, placeholder, value, handleChange, name, error, helperText, onBlur, rows}){
    return (
        <Stack className="text-area-wrapper">
            <TextField
                label={label}
                name={name}
                rows={rows || 5}
                value={value}
                error={error}
                onChange={handleChange} onBlur={onBlur}
                helperText={error ? helperText : `${value ? value.length : 0}/${maxChars}`}
                multiline
                placeholder={placeholder || ""}
                slotProps={{
                    htmlInput: { maxLength: maxChars },
                    input: {
                        endAdornment: error && (
                            <IconButton disabled>
                                <ErrorOutlinedIcon color="error"/>
                            </IconButton>
                        ),
                    }
                }}
                className="text-area"
                fullWidth

            />
        </Stack>
    );
}

export default TextAreaWithLimit