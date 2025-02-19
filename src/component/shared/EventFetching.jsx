import Grid from "@mui/material/Grid2";
import { Box, Skeleton } from "@mui/material";
import PropTypes from "prop-types";

EventFetching.propTypes = {
    rows: PropTypes.number,
    cols: PropTypes.number,
};

function EventFetching({ rows, cols }) {
    const safeRows = Math.min(rows, 3);
    const safeCols = Math.min(cols, 4);
    const totalItems = safeRows * safeCols;

    return (
        <Grid container spacing={2} sx={{ width: "100%" }}>
            {Array.from({ length: totalItems }).map((_, index) => (
                <Grid
                    key={index}
                    xs={12 / safeCols}
                    sx={{
                        display: "flex",
                        justifyContent: "center",
                    }}
                >
                    <Box
                        sx={{
                            width: 300,
                            borderRadius: "10px",
                            boxShadow: 2,
                            p: 2,
                            backgroundColor: "#fff",
                        }}
                    >
                        <Skeleton variant="rectangular" width="100%" height={150} />
                        <Skeleton width="80%" height={30} sx={{ mt: 2 }} />
                        <Skeleton width="60%" height={20} sx={{ mt: 1 }} />
                        <Skeleton width="40%" height={20} sx={{ mt: 1 }} />
                        <Skeleton width="90%" height={20} sx={{ mt: 1 }} />
                        <Skeleton width="50%" height={20} sx={{ mt: 1 }} />
                    </Box>
                </Grid>
            ))}
        </Grid>
    );
}

export default EventFetching;
