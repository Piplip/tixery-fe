import {Stack, TextField} from "@mui/material";
import PropTypes from "prop-types";

TextAreaWithLimit.propTypes = {
    maxChars: PropTypes.number,
    placeholder: PropTypes.string,
    value: PropTypes.string,
    handleChange: PropTypes.func,
    name: PropTypes.string
}

function TextAreaWithLimit({ maxChars = 200, placeholder, value, handleChange, name}){
    return (
        <Stack className="text-area-wrapper" spacing={1}>
            <TextField
                name={name}
                rows={5}
                value={value}
                onChange={handleChange}
                helperText={`${value.length}/${maxChars}`}
                multiline
                placeholder={placeholder || "Enter your text here..."}
                slotProps={
                    {htmlInput: { maxLength: maxChars }}
                }
                className="text-area"
                fullWidth
            />
        </Stack>
    );
}

export default TextAreaWithLimit