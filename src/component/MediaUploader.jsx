import {useEffect, useState} from 'react';
import {Alert, Snackbar, Stack, Typography} from '@mui/material';
import PropTypes from "prop-types";
import "../styles/media-uploader-styles.css"
import UploadIcon from '@mui/icons-material/Upload';

const Section = ({ title, description, children }) => (
    <div className="media-uploader__section">
        <Stack spacing={2}>
            <Typography variant="h5">{title}</Typography>
            <Typography variant="body1">{description}</Typography>
            {children}
        </Stack>
    </div>
);

Section.propTypes = {
    title: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    children: PropTypes.node,
}

const carouselImages = [
    'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSaF2mDHqqeufnHfVh6xdwBJt7NcUOhopTiOQ&s',
    'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQqofGVlqQONkX26S2FYN9IVjBDBlHqs8TvZg&s',
    'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSnEys5tBHYLbhADjGJzoM5BloFy9AP-uyRzg&s'
];

const IMAGE_MAX_SIZE_MB = 5;
const VIDEO_MAX_SIZE_MB = 10;

function MediaUploader () {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [isUploadActive, setIsUploadActive] = useState(false);
    const [uploadedImages, setUploadedImages] = useState([]);
    const [uploadedVideos, setUploadedVideos] = useState([]);
    const [currentPreview, setCurrentPreview] = useState(null);
    const [isDragOver, setIsDragOver] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [showError, setShowError] = useState(false);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentImageIndex((prevIndex) => (prevIndex + 1) % carouselImages.length);
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    const validateFile = (file, isImage) => {
        const maxSizeMB = isImage ? IMAGE_MAX_SIZE_MB : VIDEO_MAX_SIZE_MB;
        const validExtensions = isImage ? ['jpg', 'jpeg', 'png'] : ['mp4', 'mov'];

        const fileExtension = file.name.split('.').pop().toLowerCase();
        const fileSizeMB = file.size / 1024 / 1024;

        if (!validExtensions.includes(fileExtension)) {
            return `Invalid file type. Accepted: ${validExtensions.join(', ')}.`;
        }

        if (fileSizeMB > maxSizeMB) {
            return `File size exceeds ${maxSizeMB}MB limit.`;
        }

        return null;
    };

    const handleImageUpload = (event) => {
        const files = Array.from(event.target.files);
        const errors = validateFile(files[0], true);
        if(errors){
            setShowError(true);
            setErrorMessage(errors);
        }
        else setUploadedImages((prev) => [...prev, ...files]);
    };

    const handleDragOver = (event) => {
        event.preventDefault();
        setIsDragOver(true);
    };

    const handleDragLeave = () => {
        setIsDragOver(false);
    };

    const handleDrop = (event) => {
        event.preventDefault();
        const files = Array.from(event.dataTransfer.files);
        const errors = validateFile(files[0], true);
        if(errors){
            setShowError(true);
            setErrorMessage(errors);
            return
        }
        setUploadedImages((prev) => [...prev, ...files]);
        setIsDragOver(false);
    };

    const handleCloseSnackbar = () => {
        setShowError(false);
    };

    return (
        <div className="media-uploader">
            <Snackbar open={showError} autoHideDuration={6000} onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }} sx={{marginTop: '3rem'}}
            >
                <Alert onClose={handleCloseSnackbar} severity="error" sx={{ width: '100%' }}>
                    {errorMessage.split('\n').map((msg, index) => (
                        <div key={index}>{msg}</div>
                    ))}
                </Alert>
            </Snackbar>
            {!isUploadActive ? (
                <div className="media-uploader__initial-state" onClick={() => setIsUploadActive(true)}>
                    <div className="media-uploader__carousel">
                        {carouselImages.map((image, index) => (
                            <img
                                key={index}
                                src={image}
                                alt={`Carousel ${index + 1}`}
                                className={`media-uploader__carousel-image ${
                                    index === currentImageIndex ? 'active' : ''
                                }`}
                            />
                        ))}
                    </div>
                    <div className="media-uploader__carousel-indicators">
                        {carouselImages.map((_, index) => (
                            <span
                                key={index}
                                className={`media-uploader__carousel-dot ${
                                    index === currentImageIndex ? 'active' : ''
                                }`}
                            />
                        ))}
                    </div>
                    <div className="media-uploader__upload-button">
                        <UploadIcon className="media-uploader__upload-icon"/>
                        <p>Upload <br/>Photos & Videos</p>
                    </div>
                </div>
            ) : (
                <Stack className="media-uploader__expanded-state">
                    <section className="media-uploader__section">
                        <h2>Upload Images</h2>
                        <p className="media-uploader__description">
                            Drag and drop your images here, or click to browse. Recommended: JPG, PNG (max 5MB each).
                        </p>
                        <div
                            className={`media-uploader__drop-zone ${isDragOver ? 'drag-over' : ''}`}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                        >
                            <p>Drag and drop images here, or click to upload</p>
                            <input
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={handleImageUpload}
                            />
                        </div>
                        <div className="media-uploader__preview-container">
                            {uploadedImages.map((file, index) => (
                                <div
                                    key={index}
                                    className="media-uploader__preview-item"
                                    onClick={() => setCurrentPreview(URL.createObjectURL(file))}
                                    style={{animationDelay: `${index * 100}ms`}}
                                >
                                    <img src={URL.createObjectURL(file)} alt={`Preview ${index}`}/>
                                    <button
                                        className="media-uploader__delete-btn"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setUploadedImages((prev) =>
                                                prev.filter((_, i) => i !== index)
                                            );
                                        }}
                                    >
                                        ✕
                                    </button>
                                </div>
                            ))}
                        </div>
                    </section>

                    <section className="media-uploader__section">
                        <h2>Upload Videos</h2>
                        <p className="media-uploader__description">
                            Upload your event videos here. Recommended formats: MP4, MOV (max 10MB each).
                        </p>
                        <div className="media-uploader__drop-zone">
                            <p>Click to upload videos</p>
                            <input
                                type="file"
                                accept="video/*"
                                onChange={(event) => {
                                    const files = Array.from(event.target.files);
                                    const errors = validateFile(files[0], false);
                                    if(errors){
                                        setShowError(true);
                                        setErrorMessage(errors);
                                        return
                                    }
                                    setUploadedVideos((prev) => [...prev, ...files]);
                                }}
                            />
                        </div>
                        <div className="media-uploader__preview-container">
                            {uploadedVideos.map((file, index) => (
                                <div
                                    key={index}
                                    className="media-uploader__preview-item"
                                    onClick={() => setCurrentPreview(URL.createObjectURL(file))}
                                    style={{animationDelay: `${index * 100}ms`}}
                                >
                                    <video src={URL.createObjectURL(file)}/>
                                    <button className="media-uploader__delete-btn">
                                        ✕
                                    </button>
                                </div>
                            ))}
                        </div>
                    </section>

                    {currentPreview && (
                        <div className="media-uploader__preview-overlay" onClick={() => setCurrentPreview(null)}>
                            <img src={currentPreview} alt="Preview"/>
                            <button
                                className="media-uploader__delete-btn"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setCurrentPreview(null);
                                }}
                            >
                                ✕
                            </button>
                        </div>
                    )}
                </Stack>
            )}
        </div>
    );
}

export default MediaUploader;
