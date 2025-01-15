import "../../styles/loading-fallback-styles.css"
import Logo from "../../assets/logo.svg"

function LoadingFallback() {
    return (
        <div className="loading-fallback">
            <img className="loading-fallback__logo" src={Logo} alt="logo"/>
            <svg
                className="loading-fallback__svg"
                viewBox="0 0 100 100"
                xmlns="http://www.w3.org/2000/svg"
            >
                <path
                    className="loading-fallback__wave"
                    d="M10 50 Q30 20 50 50 T90 50 Q70 80 50 50 T10 50 Z"
                />
            </svg>
            <p className="loading-fallback__text">Loading...</p>
        </div>
    )
}

export default LoadingFallback