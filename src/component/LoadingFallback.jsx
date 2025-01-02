import {CircularProgress} from "@mui/material";

function LoadingFallback() {
    return (
        <div className="loading-fallback">
            <div className="loading-fallback__spinner">
                <CircularProgress />
            </div>
        </div>
    )
}

export default LoadingFallback