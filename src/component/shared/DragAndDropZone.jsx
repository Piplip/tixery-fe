import {useCallback, useEffect, useRef, useState} from "react";
import PropTypes from "prop-types";
import '../../styles/drag-and-drop-zone-styles.css'
import {Stack, Typography} from "@mui/material";
import {getDownloadURL, getStorage, ref} from "firebase/storage";
import {initializeApp} from "firebase/app";
import {firebaseConfig} from "../../config/firebaseConfig.js";

DragAndDropZone.propTypes = {
    onFileSelect: PropTypes.func.isRequired,
    image: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
}

initializeApp(firebaseConfig);
const storage = getStorage()

function DragAndDropZone({onFileSelect, image}) {
    const fileInputRef = useRef();
    const [isDragging, setIsDragging] = useState(false);
    const [previewImage, setPreviewImage] = useState(null);

    const loadImage = useCallback(async (url) => {
        if (!url) return null;
        if (url.includes('googleusercontent')) return url;
        try {
            const storageRef = ref(storage, url);
            return await getDownloadURL(storageRef);
        } catch (error) {
            console.error('Error loading image:', error);
            return null;
        }
    }, [image, storage]);

    useEffect(() => {
        loadImage(image).then((url) => setPreviewImage(url));
    }, []);

    const handleClick = () => {
        fileInputRef.current.click();
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            handleFileUpload(file);
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        if (file) {
            handleFileUpload(file);
        }
    };

    const handleFileUpload = (file) => {
        if (file.type.startsWith("image/")) {
            const reader = new FileReader();
            reader.onload = (event) => setPreviewImage(event.target.result);
            reader.readAsDataURL(file);
            onFileSelect(file);
        } else {
            alert("Please upload a valid image file.");
        }
    };

    return (
        <div
            className={`drag-and-drop-zone ${isDragging ? "dragging" : ""}`}
            onClick={handleClick}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
        >
            {previewImage ? (
                <img src={previewImage} alt="Preview" className="drag-and-drop-preview" />
            ) : isDragging ? (
                <p className="dragging-indicator">Drag your image here</p>
            ) : (
                <Stack textAlign={'center'} rowGap={1}>
                    <p>Drag & drop your image or click to upload</p>
                    <Typography variant={'caption'}>
                        (To replace the current image, just drag or select a new image)
                    </Typography>
                </Stack>
            )}
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={handleFileChange}
            />
        </div>
    );
}

export default DragAndDropZone