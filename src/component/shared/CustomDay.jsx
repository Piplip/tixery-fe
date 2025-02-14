import { PickersDay } from "@mui/x-date-pickers/PickersDay";
import PropTypes from "prop-types";

CustomDay.propTypes = {
    day: PropTypes.object.isRequired,
    selectdate: PropTypes.object,
    events: PropTypes.object,
}

function CustomDay({ day, selectdate, events, ...other }) {
    const dateKey = day.format("YYYY-MM-DD");
    const hasEvent = !!events[dateKey];
    const isSelected = selectdate && selectdate.format("YYYY-MM-DD") === dateKey;

    return (
        <PickersDay
            {...other}
            day={day}
            sx={{
                ...(hasEvent && {
                    backgroundColor: isSelected ? "#0088ff" : "#bde4ff",
                    color: isSelected ? "#fff" : "inherit",
                    borderRadius: "50%",
                }),
                "&:hover": {
                    backgroundColor: "#bde4ff",
                },
            }}
        />
    );
}

export default CustomDay;
