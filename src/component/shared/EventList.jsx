import PropTypes from "prop-types";

EventList.propTypes = {
    genre: PropTypes.string.isRequired,
    scope: PropTypes.string.isRequired,
    location: PropTypes.string
}

function EventList({genre, scope, location}){
    return (
        <div>

        </div>
    )
}

export default EventList