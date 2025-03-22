import React, {useEffect, useRef, useState} from "react"
import {Button, Stack} from "@mui/material";
import PropTypes from "prop-types";
import {getContrastColor} from "../../common/Utilities.js"
import {initializeApp} from "firebase/app";
import {firebaseConfig} from "../../config/firebaseConfig.js";
import {getBytes, getStorage, ref} from "firebase/storage";
import {useLocation} from "react-router-dom";
import {eventAxiosWithToken} from "../../config/axiosConfig.js";

SeatMap.propTypes = {
    data: PropTypes.array.isRequired,
    setData: PropTypes.func.isRequired,
    selectedObject: PropTypes.array,
    setSelectedObject: PropTypes.func.isRequired,
    setCenter: PropTypes.func.isRequired,
    zoom: PropTypes.number.isRequired,
    setZoom: PropTypes.func.isRequired,
    offset: PropTypes.object.isRequired,
    setOffset: PropTypes.func.isRequired,
    view: PropTypes.string.isRequired,
    tierData: PropTypes.array,
    setTier: PropTypes.func,
    setSelectedTool: PropTypes.func,
    setSeatMapData: PropTypes.func,
    setAssignedSeat: PropTypes.func,
};

const SEAT_SIZE = 18;
const SEAT_GAP = 5;
const ROW_LABEL_WIDTH = 25;

const AUTO_PAN_THRESHOLD = 20;
const AUTO_PAN_SPEED = 10;

const BASE_TABLE_WIDTH = 80;
const BASE_TABLE_HEIGHT = 80;
const TABLE_SEAT_RADIUS = 10;
const SEAT_DIAMETER = TABLE_SEAT_RADIUS * 2;
const TABLE_MARGIN = 5;

initializeApp(firebaseConfig);
const storage = getStorage()

function SeatMap({data, setData, selectedObject, setSelectedObject, setCenter, zoom, setZoom, offset, setOffset, view,
                     tierData, setTier, setSelectedTool, setSeatMapData, setAssignedSeat}){
    const canvasRef = useRef(null);
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const [isInitialized, setIsInitialized] = useState(false);
    const [isDraggingObject, setIsDraggingObject] = useState(false);
    const [objectDragStart, setObjectDragStart] = useState({ x: 0, y: 0 });
    const [hoveredObject, setHoveredObject] = useState(null);
    const [isRotating, setIsRotating] = useState(false);
    const lastPointerWorldPosRef = useRef(null);
    const location = useLocation()
    const isFetched = useRef(false)

    useEffect(() => {
        const searchParams = new URLSearchParams(location.search.substring(1));
        const mapID = searchParams.get('mid');

        if (mapID && !isFetched.current) {
            eventAxiosWithToken.get(`/seat-map/data?mid=${mapID}`)
                .then(r => {
                    const data = r.data.data;
                    const seatMapPath = data.map_url;

                    setSeatMapData({
                        eventName: data.eventName,
                        name: data.name,
                        mapURL: seatMapPath,
                        share: data.is_public
                    });

                    if (seatMapPath) {
                        const mapRef = ref(storage, seatMapPath);
                        return getBytes(mapRef)
                            .then(bytes => {
                                const decoder = new TextDecoder('utf-8');
                                const jsonStr = decoder.decode(bytes);
                                const jsonData = JSON.parse(jsonStr);
                                console.log(jsonData)
                                if(jsonData.totalAssignedSeats){
                                    setAssignedSeat(parseInt(jsonData.totalAssignedSeats))
                                }

                                if (jsonData.canvasObjects && Array.isArray(jsonData.canvasObjects)) {
                                    setData(jsonData.canvasObjects);
                                }

                                if (jsonData.tierData && Array.isArray(jsonData.tierData)) {
                                    const updatedTierData = jsonData.tierData.map((tier, index) => {
                                        const dbTierID = data.tierIDs && index < data.tierIDs.length
                                            ? data.tierIDs[index]
                                            : null;

                                        return {
                                            ...tier,
                                            dbTierID: dbTierID
                                        };
                                    });

                                    setTier(updatedTierData);
                                }
                                isFetched.current = true
                            })
                            .catch(err => {
                                console.error("Error parsing seat map file:", err);
                            });
                    }
                })
                .catch(err => {
                    console.error("Error loading seat map data from API:", err);
                });
        }
    }, [location.search, setData, setTier, setSeatMapData]);

    const drawGrid = (ctx, zoom, offset) => {
        const width = ctx.canvas.width / (window.devicePixelRatio || 1);
        const height = ctx.canvas.height / (window.devicePixelRatio || 1);

        const baseGridSize = 20;
        let gridSize = baseGridSize * zoom;

        if (zoom < 1) {
            gridSize = baseGridSize * Math.ceil(1 / zoom);
        }

        const offsetX = offset.x % gridSize;
        const offsetY = offset.y % gridSize;

        ctx.clearRect(0, 0, width, height);

        if (gridSize >= 5) {
            ctx.beginPath();
            ctx.strokeStyle = '#e0e0e0';
            ctx.lineWidth = 1;

            for (let x = offsetX; x <= width; x += gridSize) {
                const roundedX = Math.floor(x) + 0.5;
                if (roundedX >= 0 && roundedX <= width) {
                    ctx.moveTo(roundedX, 0);
                    ctx.lineTo(roundedX, height);
                }
            }

            for (let y = offsetY; y <= height; y += gridSize) {
                const roundedY = Math.floor(y) + 0.5;
                if (roundedY >= 0 && roundedY <= height) {
                    ctx.moveTo(0, roundedY);
                    ctx.lineTo(width, roundedY);
                }
            }

            ctx.stroke();
        }
    };

    const drawSeats = (ctx, properties, hoveredSeat = null, selectedSeats = [], sectionId) => {
        const { sectionName, rows, seats } = properties;
        const rowCount = parseInt(rows);
        const seatCount = parseInt(seats);

        const sectionWidth = seatCount * (SEAT_SIZE + SEAT_GAP) - SEAT_GAP;

        const assignedTier = tierData?.find(tier =>
            tier && Array.isArray(tier.assignedSeats) && tier.assignedSeats.includes(sectionId)
        );

        ctx.font = 'bold 16px Arial';
        ctx.fillStyle = assignedTier ? getContrastColor(assignedTier.color) : '#000';
        ctx.textAlign = 'center';
        ctx.fillText(sectionName, (sectionWidth + 2 * ROW_LABEL_WIDTH) / 2, -15);
        ctx.textAlign = 'left';

        for (let r = 0; r < rowCount; r++) {
            const rowLetter = String.fromCharCode(65 + r);
            ctx.fillStyle = '#000';
            ctx.font = 'bold 12px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(rowLetter, ROW_LABEL_WIDTH / 2, r * (SEAT_SIZE + SEAT_GAP) + SEAT_SIZE / 2 + 4);

            for (let s = 0; s < seatCount; s++) {
                const x = ROW_LABEL_WIDTH + s * (SEAT_SIZE + SEAT_GAP);
                const y = r * (SEAT_SIZE + SEAT_GAP);
                const seatNumber = s + 1;

                ctx.beginPath();
                ctx.arc(x + SEAT_SIZE / 2, y + SEAT_SIZE / 2, SEAT_SIZE / 2, 0, Math.PI * 2);

                const seatId = `${sectionId}_${r}_${s}`;
                const assignedTier = tierData?.find(tier =>
                    tier && Array.isArray(tier.assignedSeats) && tier.assignedSeats.includes(seatId)
                );

                const baseColor = assignedTier ? assignedTier.color : '#fff';
                const baseStroke = assignedTier ? assignedTier.color : '#000';

                if (hoveredSeat && hoveredSeat.row === r && hoveredSeat.seat === s && hoveredSeat.sectionId === sectionId) {
                    ctx.fillStyle = assignedTier ? assignedTier.color : 'rgba(245,245,245,0.55)';
                    ctx.strokeStyle = '#31343a';
                    ctx.lineWidth = 2;
                    ctx.save();
                    ctx.beginPath();
                    ctx.arc(x + SEAT_SIZE / 2, y + SEAT_SIZE / 2, SEAT_SIZE / 2 + 2, 0, Math.PI * 2);
                    ctx.strokeStyle = '#fff';
                    ctx.lineWidth = 2;
                    ctx.stroke();
                    ctx.restore();
                }
                else if (selectedSeats.includes(seatId)) {
                    ctx.fillStyle = baseColor;
                    ctx.strokeStyle = '#000000';
                    ctx.lineWidth = 2.5;
                }
                else {
                    ctx.fillStyle = baseColor;
                    ctx.strokeStyle = baseStroke;
                    ctx.lineWidth = 1;
                }

                ctx.fill();
                ctx.stroke();

                ctx.fillStyle = assignedTier ? getContrastColor(assignedTier.color) : '#2a2a2a';
                ctx.font = assignedTier ? 'bold 9px Arial' : '9px Arial';
                ctx.textAlign = 'center';
                ctx.fillText(seatNumber.toString(), x + SEAT_SIZE / 2, y + SEAT_SIZE / 2 + 3);
            }

            ctx.fillStyle = '#000';
            ctx.font = 'bold 12px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(rowLetter, ROW_LABEL_WIDTH + sectionWidth + ROW_LABEL_WIDTH / 2, r * (SEAT_SIZE + SEAT_GAP) + SEAT_SIZE / 2 + 4);
        }
    }

    const drawTable = (ctx, properties, tableId) => {
        const { tableName, style, seats } = properties;
        let tableWidth, tableHeight, tableRadius;

        const assignedTier = tierData?.find(tier =>
            tier && Array.isArray(tier.assignedSeats) && tier.assignedSeats.includes(tableId)
        );

        const tableColor = assignedTier ? assignedTier.color : '#f5f5f5';
        const seatColor = assignedTier ? assignedTier.color : '#dadada';
        const textColor = getContrastColor(tableColor);

        if (style === 'square') {
            const seatCount = parseInt(seats, 10);
            const maxEndSeats = Math.floor(seatCount / 2);
            const providedEndSeats = properties.endSeats ? parseInt(properties.endSeats, 10) : 2;
            const effectiveEndSeats = Math.min(providedEndSeats, maxEndSeats);
            const remaining = seatCount - 2 * effectiveEndSeats;
            const leftSeats = remaining > 0 ? Math.ceil(remaining / 2) : 0;
            const minWidth = effectiveEndSeats * (SEAT_DIAMETER + TABLE_MARGIN);
            const minHeight = leftSeats > 0
                ? leftSeats * (SEAT_DIAMETER + TABLE_MARGIN)
                : BASE_TABLE_HEIGHT;

            tableWidth = properties.width ? parseInt(properties.width, 10) : Math.max(BASE_TABLE_WIDTH, minWidth);
            tableHeight = properties.height ? parseInt(properties.height, 10) : Math.max(BASE_TABLE_HEIGHT, minHeight);
        } else if (style === 'circle') {
            tableRadius = 40;
        }

        ctx.save();
        ctx.fillStyle = tableColor;
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;

        if (style === 'square') {
            ctx.beginPath();
            ctx.rect(-tableWidth / 2, -tableHeight / 2, tableWidth, tableHeight);
            ctx.fill();
            ctx.stroke();

            const seatCount = parseInt(seats, 10);
            const seatRadius = 10;
            const margin = 5;

            const maxEndSeats = Math.floor(seatCount / 2);
            const providedEndSeats = properties.endSeats ? parseInt(properties.endSeats, 10) : 2;
            const effectiveEndSeats = Math.min(providedEndSeats, maxEndSeats);
            const remaining = seatCount - 2 * effectiveEndSeats;
            const leftSeats = remaining > 0 ? Math.ceil(remaining / 2) : 0;
            const rightSeats = remaining > 0 ? Math.floor(remaining / 2) : 0;

            ctx.fillStyle = seatColor;

            if (effectiveEndSeats > 0) {
                for (let i = 0; i < effectiveEndSeats; i++) {
                    const t = (i + 0.5) / effectiveEndSeats;
                    const seatX = -tableWidth / 2 + t * tableWidth;
                    const seatY = -tableHeight / 2 - margin - seatRadius;
                    ctx.beginPath();
                    ctx.arc(seatX, seatY, seatRadius, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.stroke();
                }
            }

            if (effectiveEndSeats > 0) {
                for (let i = 0; i < effectiveEndSeats; i++) {
                    const t = (i + 0.5) / effectiveEndSeats;
                    const seatX = -tableWidth / 2 + t * tableWidth;
                    const seatY = tableHeight / 2 + margin + seatRadius;
                    ctx.beginPath();
                    ctx.arc(seatX, seatY, seatRadius, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.stroke();
                }
            }

            if (leftSeats > 0) {
                for (let i = 0; i < leftSeats; i++) {
                    const t = (i + 0.5) / leftSeats;
                    const seatX = -tableWidth / 2 - margin - seatRadius;
                    const seatY = -tableHeight / 2 + t * tableHeight;
                    ctx.beginPath();
                    ctx.arc(seatX, seatY, seatRadius, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.stroke();
                }
            }

            if (rightSeats > 0) {
                for (let i = 0; i < rightSeats; i++) {
                    const t = (i + 0.5) / rightSeats;
                    const seatX = tableWidth / 2 + margin + seatRadius;
                    const seatY = -tableHeight / 2 + t * tableHeight;
                    ctx.beginPath();
                    ctx.arc(seatX, seatY, seatRadius, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.stroke();
                }
            }
        } else if (style === 'circle') {

            ctx.beginPath();
            ctx.arc(0, 0, tableRadius, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();

            if (seats) {
                ctx.fillStyle = seatColor;

                const seatCount = parseInt(seats, 10);
                const seatRadius = 10;
                const seatDistance = tableRadius + seatRadius + 5;
                for (let i = 0; i < seatCount; i++) {
                    const angle = (i / seatCount) * (Math.PI * 2);
                    const seatX = seatDistance * Math.cos(angle);
                    const seatY = seatDistance * Math.sin(angle);
                    ctx.beginPath();
                    ctx.arc(seatX, seatY, seatRadius, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.stroke();
                }
            }
        }

        ctx.fillStyle = textColor;
        let fontSize = 14;
        ctx.font = `bold ${fontSize}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        let maxTextWidth = style === 'square' ? tableWidth : tableRadius * 2;
        let measuredWidth = ctx.measureText(tableName).width;
        if (measuredWidth > maxTextWidth) {
            const scaleFactor = maxTextWidth / measuredWidth;
            const newFontSize = Math.floor(fontSize * scaleFactor);
            ctx.font = `bold ${newFontSize - 1}px Arial`;
        }
        ctx.fillText(tableName, 0, 0);

        ctx.restore();
    };

    const drawCustomObject = (ctx, properties, objectId) => {
        const { objectName, shape, label, icon } = properties;
        ctx.save();

        const assignedTier = tierData?.find(tier =>
            tier && Array.isArray(tier.assignedSeats) && tier.assignedSeats.includes(objectId)
        );

        const backgroundColor = assignedTier ? assignedTier.color : '#f6f6f6';
        const textColor = getContrastColor(backgroundColor);
        ctx.fillStyle = backgroundColor;
        ctx.lineWidth = 2;

        if (shape === 'line') {
            const lineLength = 100;
            ctx.beginPath();
            ctx.moveTo(-lineLength / 2, 0);
            ctx.lineTo(lineLength / 2, 0);
            ctx.stroke();
        } else if (shape === 'square') {
            const rectWidth = 120;
            const rectHeight = 80;
            ctx.beginPath();
            ctx.rect(-rectWidth / 2, -rectHeight / 2, rectWidth, rectHeight);
            ctx.fill();
            ctx.stroke();
        } else if (shape === 'circle') {
            const radius = 40;
            ctx.beginPath();
            ctx.arc(0, 0, radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
        }

        const textLines = [];
        if (objectName) {
            textLines.push({ text: objectName, font: 'bold 14px Arial', size: 14 });
        }
        if (label) {
            textLines.push({ text: label, font: '12px Arial', size: 12 });
        }
        if (icon) {
            textLines.push({ text: `[${icon}]`, font: '10px Arial', size: 10 });
        }

        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = textColor;

        const lineSpacing = 4;
        const totalHeight = textLines.reduce((sum, line) => sum + line.size, 0) +
            (textLines.length - 1) * lineSpacing;

        let startY = -totalHeight / 2;

        textLines.forEach(line => {
            ctx.font = line.font;
            const lineY = startY + line.size / 2;
            ctx.fillText(line.text, 0, lineY);
            startY += line.size + lineSpacing;
        });

        ctx.restore();
    };

    const drawText = (ctx, properties) => {
        const { text, size } = properties;
        const fontSize = size * 4;
        ctx.save();

        ctx.font = `bold ${fontSize}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#000';

        ctx.fillText(text, 0, 0);

        ctx.restore();
    };

    const drawRotationHandle = (ctx, obj) => {
        if (selectedObject.length !== 1 || obj.id !== selectedObject[0]) return;

        const bbox = getBoundingBox(obj);
        ctx.save();
        ctx.fillStyle = '#4285F4';
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 1 / zoom;
        
        const centerTopX = 0;
        const centerTopY = bbox.y - 20 / zoom;
        
        ctx.beginPath();
        ctx.arc(centerTopX, centerTopY, 8 / zoom, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(centerTopX, centerTopY);
        ctx.lineTo(0, bbox.y);
        ctx.stroke();

        ctx.restore();
    };

    const isPointInRotationHandle = (point, obj) => {
        if (!obj) return false;

        const rotation = obj.rotation || 0;
        const radians = (rotation * Math.PI) / 180;
        const cos = Math.cos(-radians);
        const sin = Math.sin(-radians);

        const bbox = getBoundingBox(obj);

        const handleX = 0;
        const handleY = bbox.y - 20 / zoom;

        const dx = point.x - obj.position.x;
        const dy = point.y - obj.position.y;

        const localX = dx * cos - dy * sin;
        const localY = dx * sin + dy * cos;

        const deltaX = localX - handleX;
        const deltaY = localY - handleY;
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

        return distance <= 8 / zoom;
    };

    const drawObject = (ctx, obj, zoom, offset) => {
        const { type, position = { x: 0, y: 0 }, properties, rotation = 0 } = obj;
        const isHovered = hoveredObject && hoveredObject.id === obj.id;
        const isSelected = selectedObject.includes(obj.id);

        ctx.save();
        ctx.translate(offset.x, offset.y);
        ctx.scale(zoom, zoom);

        ctx.translate(position.x, position.y);
        ctx.rotate(rotation * Math.PI / 180);

        if (view === 'tier') {
            if (type === 'seats') {
                const hoveredSeatInfo = hoveredObject?.id === obj.id ? hoveredObject.seatInfo : null;
                drawSeats(ctx, properties, hoveredSeatInfo, selectedObject, obj.id);
            }
            else {
                if (isHovered && !isSelected) {
                    ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
                    ctx.shadowBlur = 10;
                }
                else if (isSelected) {
                    ctx.shadowColor = '#2196f3';
                    ctx.shadowBlur = 10;
                }

                switch(type) {
                    case 'table':
                        drawTable(ctx, properties, obj.id);
                        break;
                    case 'object':
                        drawCustomObject(ctx, properties, obj.id);
                        break;
                    case 'text':
                        drawText(ctx, properties);
                        break;
                }
            }
        }

        else {
            switch(type) {
                case 'seats':
                    drawSeats(ctx, properties);
                    break;
                case 'table':
                    drawTable(ctx, properties);
                    break;
                case 'object':
                    drawCustomObject(ctx, properties);
                    break;
                case 'text':
                    drawText(ctx, properties);
                    break;
            }

            if (isSelected && selectedObject.length === 1) {
                const bbox = getBoundingBox(obj);
                ctx.strokeStyle = '#f50057';
                ctx.lineWidth = Math.round(2 / zoom);
                ctx.setLineDash([5, 5]);
                ctx.strokeRect(bbox.x, bbox.y, bbox.width, bbox.height);
            }

            if (isSelected && selectedObject.length === 1) {
                drawRotationHandle(ctx, obj);
            }
        }

        ctx.restore();
    }

    const renderCanvas = (ctx, zoom, offset) => {
        const width = ctx.canvas.width / (window.devicePixelRatio || 1);
        const height = ctx.canvas.height / (window.devicePixelRatio || 1);

        ctx.clearRect(0, 0, width, height);
        drawGrid(ctx, zoom, offset);
        data.forEach(obj => {drawObject(ctx, obj, zoom, offset);});

        if (view === 'map' && selectedObject.length > 1) {
            const selectedObjs = data.filter(obj => selectedObject.includes(obj.id));
            const unionBBox = getUnionBoundingBox(selectedObjs);
            if (unionBBox) {
                ctx.save();
                ctx.translate(offset.x, offset.y);
                ctx.scale(zoom, zoom);
                ctx.strokeStyle = '#f50057';
                ctx.lineWidth = Math.round(2 / zoom);
                ctx.setLineDash([5, 5]);
                ctx.strokeRect(unionBBox.x, unionBBox.y, unionBBox.width, unionBBox.height);
                ctx.restore();
            }
        }
    };

    const calculateCanvasCenter = () => {
        const canvas = canvasRef.current;
        if (!canvas) return { x: 0, y: 0 };

        const width = canvas.clientWidth;
        const height = canvas.clientHeight;

        return { x: width / 2, y: height / 2 };
    };

    useEffect(() => {
        if(view === 'tier'){
            setSelectedObject([])
        }
    }, [view]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const handleResize = () => {
            const parent = canvas.parentElement;
            const dpr = window.devicePixelRatio || 1;

            const displayWidth = parent.clientWidth;
            const displayHeight = parent.clientHeight;

            canvas.width = displayWidth * dpr;
            canvas.height = displayHeight * dpr;

            canvas.style.width = `${displayWidth}px`;
            canvas.style.height = `${displayHeight}px`;

            const ctx = canvas.getContext('2d');
            ctx.scale(dpr, dpr);

            if (!isInitialized) {
                const center = calculateCanvasCenter();
                setOffset({x: center.x, y: center.y});
                setIsInitialized(true);
            }

            renderCanvas(ctx, zoom, offset);
        };

        handleResize();
        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, [data, zoom, offset, isInitialized, selectedObject, hoveredObject]);

    useEffect(() => {
        if (data.length > 0 && !isInitialized) {
            const center = calculateCanvasCenter();
            setOffset({x: center.x, y: center.y});
            setIsInitialized(true);
        }
    }, [data, isInitialized]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const handleWheel = (e) => {
            e.preventDefault();
            const canvas = canvasRef.current;
            if (!canvas) return;

            const rect = canvas.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;
            const worldX = (mouseX - offset.x) / zoom;
            const worldY = (mouseY - offset.y) / zoom;

            const zoomDirection = e.deltaY < 0 ? 1 : -1;
            const zoomFactor = 0.15;
            const newZoom = Math.max(0.5, Math.min(5, zoom + zoomDirection * zoomFactor));

            const newOffset = {
                x: mouseX - worldX * newZoom,
                y: mouseY - worldY * newZoom
            };

            setZoom(newZoom);
            setOffset(newOffset);
        };

        canvas.addEventListener('wheel', handleWheel, { passive: false });

        return () => {
            canvas.removeEventListener('wheel', handleWheel);
        };
    }, [zoom, offset]);

    useEffect(() => {
        const updateCenter = () => {
            const canvas = canvasRef.current;
            if (!canvas) return;

            const width = canvas.clientWidth;
            const height = canvas.clientHeight;

            setCenter({ x: width / 2, y: height / 2 });
        };

        updateCenter();
        window.addEventListener('resize', updateCenter);

        return () => {
            window.removeEventListener('resize', updateCenter);
        };
    }, [offset, setCenter]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const handleMouseDown = (e) => {
            if (e.button === 1 || (e.button === 0 && e.shiftKey)) {
                setIsDragging(true);
                setDragStart({ x: e.clientX, y: e.clientY });
                canvas.style.cursor = 'grabbing';
            }
        };

        const handleMouseMove = (e) => {
            if (isDragging) {
                const dx = e.clientX - dragStart.x;
                const dy = e.clientY - dragStart.y;

                setOffset(prev => ({x: prev.x + dx, y: prev.y + dy}));

                setDragStart({ x: e.clientX, y: e.clientY });

                const ctx = canvas.getContext('2d');
                renderCanvas(ctx, zoom, offset);
            }
        };

        const handleMouseUp = () => {
            setIsDragging(false);
            canvas.style.cursor = 'default';
        };

        canvas.addEventListener('mousedown', handleMouseDown);
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);

        return () => {
            canvas.removeEventListener('mousedown', handleMouseDown);
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging, dragStart, zoom, offset]);

    const handleZoomIn = () => {
        setZoom(prevZoom => Math.min(prevZoom + 0.1, 2));
    };

    const handleZoomOut = () => {
        setZoom(prevZoom => Math.max(prevZoom - 0.1, 0.5));
    }

    const getBoundingBox = (obj) => {
        const { type, properties } = obj;
        let originalBox;

        if (type === 'seats') {
            const { seats, rows } = properties;
            const width = parseInt(seats) * (SEAT_SIZE + SEAT_GAP) - SEAT_GAP + 2 * ROW_LABEL_WIDTH;
            const height = parseInt(rows) * (SEAT_SIZE + SEAT_GAP) + 20;
            originalBox = { x: 0, y: -35, width, height: height + 20 };
        }
        else if (type === 'table') {
            if (properties.style === 'square') {
                const tableWidth = properties.width
                    ? parseInt(properties.width, 10)
                    : BASE_TABLE_WIDTH;
                const tableHeight = properties.height
                    ? parseInt(properties.height, 10)
                    : BASE_TABLE_HEIGHT;
                const seatCount = parseInt(properties.seats, 10) || 0;
                const seatRadius = TABLE_SEAT_RADIUS;
                const margin = TABLE_MARGIN;
                const providedEndSeats = properties.endSeats
                    ? parseInt(properties.endSeats, 10)
                    : 2;
                const maxEndSeats = Math.floor(seatCount / 2);
                const effectiveEndSeats = Math.min(providedEndSeats, maxEndSeats);
                const remaining = seatCount - 2 * effectiveEndSeats;
                const leftSeats = remaining > 0 ? Math.ceil(remaining / 2) : 0;
                const rightSeats = remaining > 0 ? Math.floor(remaining / 2) : 0;

                let minX = Infinity, maxX = -Infinity;
                let minY = Infinity, maxY = -Infinity;

                const corners = [
                    { x: -tableWidth / 2, y: -tableHeight / 2 },
                    { x: tableWidth / 2, y: -tableHeight / 2 },
                    { x: tableWidth / 2, y: tableHeight / 2 },
                    { x: -tableWidth / 2, y: tableHeight / 2 },
                ];
                corners.forEach((pt) => {
                    if (pt.x < minX) minX = pt.x;
                    if (pt.x > maxX) maxX = pt.x;
                    if (pt.y < minY) minY = pt.y;
                    if (pt.y > maxY) maxY = pt.y;
                });

                for (let i = 0; i < effectiveEndSeats; i++) {
                    const t = (i + 0.5) / effectiveEndSeats;
                    const seatX = -tableWidth / 2 + t * tableWidth;
                    const seatY = -tableHeight / 2 - margin - seatRadius;
                    if (seatX < minX) minX = seatX;
                    if (seatX > maxX) maxX = seatX;
                    if (seatY < minY) minY = seatY;
                    if (seatY > maxY) maxY = seatY;
                }
                for (let i = 0; i < effectiveEndSeats; i++) {
                    const t = (i + 0.5) / effectiveEndSeats;
                    const seatX = -tableWidth / 2 + t * tableWidth;
                    const seatY = tableHeight / 2 + margin + seatRadius;
                    if (seatX < minX) minX = seatX;
                    if (seatX > maxX) maxX = seatX;
                    if (seatY < minY) minY = seatY;
                    if (seatY > maxY) maxY = seatY;
                }
                for (let i = 0; i < leftSeats; i++) {
                    const t = (i + 0.5) / leftSeats;
                    const seatX = -tableWidth / 2 - margin - seatRadius;
                    const seatY = -tableHeight / 2 + t * tableHeight;
                    if (seatX < minX) minX = seatX;
                    if (seatX > maxX) maxX = seatX;
                    if (seatY < minY) minY = seatY;
                    if (seatY > maxY) maxY = seatY;
                }
                for (let i = 0; i < rightSeats; i++) {
                    const t = (i + 0.5) / rightSeats;
                    const seatX = tableWidth / 2 + margin + seatRadius;
                    const seatY = -tableHeight / 2 + t * tableHeight;
                    if (seatX < minX) minX = seatX;
                    if (seatX > maxX) maxX = seatX;
                    if (seatY < minY) minY = seatY;
                    if (seatY > maxY) maxY = seatY;
                }

                minX -= seatRadius;
                maxX += seatRadius;
                minY -= seatRadius;
                maxY += seatRadius;

                originalBox = {
                    x: minX - 5,
                    y: minY - 5,
                    width: maxX - minX + 10 ,
                    height: maxY - minY + 10,
                };
            } else if (properties.style === 'circle') {
                const tableRadius = properties.radius
                    ? parseInt(properties.radius, 10)
                    : BASE_TABLE_WIDTH / 2;
                const boundingRadius = tableRadius + TABLE_MARGIN + TABLE_SEAT_RADIUS;
                originalBox = {
                    x: -boundingRadius,
                    y: -boundingRadius,
                    width: boundingRadius * 2,
                    height: boundingRadius * 2,
                };
            }
        }
        else if (type === 'object') {
            if (properties.shape === 'line') {
                originalBox = { x: -50, y: -5, width: 100, height: 10 };
            } else if (properties.shape === 'square') {
                originalBox = { x: -60, y: -40, width: 120, height: 80 };
            } else if (properties.shape === 'circle') {
                originalBox = { x: -40, y: -40, width: 80, height: 80 };
            }
        }
        else if (type === 'text') {
            const fontSize = properties.size * 4;
            const approxWidth = properties.text.length * (fontSize / 2);
            const approxHeight = fontSize;
            originalBox = { x: -approxWidth / 2, y: -approxHeight / 2, width: approxWidth, height: approxHeight };
        }
        else {
            originalBox = { x: 0, y: 0, width: 0, height: 0 };
        }

        return originalBox;
    };

    const getUnionBoundingBox = (selectedObjs) => {
        if (!selectedObjs.length) return null;

        let minX = Infinity, minY = Infinity;
        let maxX = -Infinity, maxY = -Infinity;

        selectedObjs.forEach((obj) => {
            const bbox = getBoundingBox(obj);
            const rotation = obj.rotation || 0;
            const radians = (rotation * Math.PI) / 180;
            const cos = Math.cos(radians);
            const sin = Math.sin(radians);

            const corners = [
                { x: bbox.x, y: bbox.y },
                { x: bbox.x + bbox.width, y: bbox.y },
                { x: bbox.x + bbox.width, y: bbox.y + bbox.height },
                { x: bbox.x, y: bbox.y + bbox.height }
            ];

            corners.forEach(corner => {
                const rotatedX = corner.x * cos - corner.y * sin;
                const rotatedY = corner.x * sin + corner.y * cos;

                const worldX = obj.position.x + rotatedX;
                const worldY = obj.position.y + rotatedY;

                minX = Math.min(minX, worldX);
                minY = Math.min(minY, worldY);
                maxX = Math.max(maxX, worldX);
                maxY = Math.max(maxY, worldY);
            });
        });

        return {
            x: minX,
            y: minY,
            width: maxX - minX,
            height: maxY - minY
        };
    };

    const isPointInObject = (point, obj, checkSeat = false) => {
        const rotation = obj.rotation || 0;
        const radians = (rotation * Math.PI) / 180;
        const cos = Math.cos(-radians);
        const sin = Math.sin(-radians);

        const dx = point.x - obj.position.x;
        const dy = point.y - obj.position.y;
        const localX = dx * cos - dy * sin;
        const localY = dx * sin + dy * cos;

        if (obj.type === 'seats' && view === 'tier' && checkSeat) {
            const { rows, seats } = obj.properties;
            const rowCount = parseInt(rows);
            const seatCount = parseInt(seats);

            for (let r = 0; r < rowCount; r++) {
                for (let s = 0; s < seatCount; s++) {
                    const seatX = ROW_LABEL_WIDTH + s * (SEAT_SIZE + SEAT_GAP) + SEAT_SIZE / 2;
                    const seatY = r * (SEAT_SIZE + SEAT_GAP) + SEAT_SIZE / 2;

                    const dx = localX - seatX;
                    const dy = localY - seatY;
                    const distanceSquared = dx * dx + dy * dy;
                    const radiusSquared = (SEAT_SIZE / 2) * (SEAT_SIZE / 2);

                    if (distanceSquared <= radiusSquared) {
                        return {
                            inObject: true,
                            seatInfo: {
                                row: r,
                                seat: s,
                                sectionId: obj.id
                            }
                        };
                    }
                }
            }

            return { inObject: false };
        }

        const bbox = getBoundingBox(obj);

        if (obj.type === 'seats') {
            const padding = 2;
            return {
                inObject: localX >= (bbox.x - padding) &&
                    localX <= (bbox.x + bbox.width + padding) &&
                    localY >= (bbox.y - padding) &&
                    localY <= (bbox.y + bbox.height + padding)
            };
        }

        return {
            inObject: localX >= bbox.x &&
                localX <= bbox.x + bbox.width &&
                localY >= bbox.y &&
                localY <= bbox.y + bbox.height
        };
    };

    const handleCanvasMouseDown = (e) => {
        if (e.target !== canvasRef.current) return;

        const canvas = canvasRef.current;
        if (!canvas) return;

        const rect = canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        const canvasCoords = {
            x: (mouseX - offset.x) / zoom,
            y: (mouseY - offset.y) / zoom,
        };

        if (selectedObject.length === 1) {
            const selectedObj = data.find(obj => obj.id === selectedObject[0]);
            if (selectedObj && isPointInRotationHandle(canvasCoords, selectedObj)) {
                setIsRotating(true);
                const dx = canvasCoords.x - selectedObj.position.x;
                const dy = canvasCoords.y - selectedObj.position.y;
                const initialAngle = Math.atan2(dy, dx) * 180 / Math.PI;
                setObjectDragStart({ x: canvasCoords.x, y: canvasCoords.y, initialAngle });
                return;
            }
        }

        if (!e.shiftKey) {
            setSelectedTool(null);
        }

        if (e.shiftKey) {
            if (e.button === 0 || e.button === 1) {
                setIsDragging(true);
                setDragStart({ x: e.clientX, y: e.clientY });
                canvas.style.cursor = 'grabbing';
            }
            return;
        }

        if (view === 'tier') {
            for (let i = data.length - 1; i >= 0; i--) {
                const obj = data[i];
                const result = isPointInObject(canvasCoords, obj, true);

                if (result.inObject) {
                    if (obj.type === 'seats' && result.seatInfo) {
                        const seatId = `${obj.id}_${result.seatInfo.row}_${result.seatInfo.seat}`;

                        setSelectedObject(prev =>
                            prev.includes(seatId)
                                ? prev.filter(id => id !== seatId)
                                : [...prev, seatId]
                        );

                    } else {
                        setSelectedObject(prev =>
                            prev.includes(obj.id)
                                ? prev.filter(id => id !== obj.id)
                                : [...prev, obj.id]
                        );
                    }
                    return;
                }
            }

            if (!e.ctrlKey && !e.metaKey) {
                setSelectedObject([]);
            }

            setIsDraggingObject(false);
            return;
        }

        if (selectedObject.length > 0) {
            const selectedObjs = data.filter(obj => selectedObject.includes(obj.id));
            let hitAnySelected = false;

            for (const obj of selectedObjs) {
                if (isPointInObject(canvasCoords, obj).inObject) {
                    hitAnySelected = true;
                    break;
                }
            }

            if (hitAnySelected) {
                setIsDraggingObject(true);
                setObjectDragStart(canvasCoords);
                return;
            }

            if (!e.ctrlKey) {
                setSelectedObject([]);
                setIsDraggingObject(false);
            }
        }

        let hitObject = null;
        for (let i = data.length - 1; i >= 0; i--) {
            const result = isPointInObject(canvasCoords, data[i]);
            if (result.inObject) {
                hitObject = data[i];
                break;
            }
        }

        if (hitObject) {
            if (e.ctrlKey) {
                setSelectedObject(prev =>
                    prev.includes(hitObject.id)
                        ? prev.filter(id => id !== hitObject.id)
                        : [...prev, hitObject.id]
                );
            } else {
                setSelectedObject([hitObject.id]);
            }
            setIsDraggingObject(true);
            setObjectDragStart(canvasCoords);
        } else if (!e.ctrlKey) {
            setSelectedObject([]);
        }

        const ctx = canvas.getContext('2d');
        renderCanvas(ctx, zoom, offset);
    };

    const handleCanvasMouseMove = (e) => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const rect = canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        const currentWorldPos = {
            x: (mouseX - offset.x) / zoom,
            y: (mouseY - offset.y) / zoom,
        };

        if (isRotating && selectedObject.length === 1) {
            const selectedObj = data.find(obj => obj.id === selectedObject[0]);
            if (selectedObj && objectDragStart) {
                const dx = currentWorldPos.x - selectedObj.position.x;
                const dy = currentWorldPos.y - selectedObj.position.y;

                let angle = Math.atan2(dy, dx) * 180 / Math.PI;
                angle = (angle + 90) % 360;
                if (angle < 0) angle += 360;

                setData(prev =>
                    prev.map(obj =>
                        obj.id === selectedObj.id
                            ? { ...obj, rotation: angle }
                            : obj
                    )
                );

                const ctx = canvas.getContext('2d');
                renderCanvas(ctx, zoom, offset);
                return;
            }
        }

        if (!lastPointerWorldPosRef.current) {
            lastPointerWorldPosRef.current = currentWorldPos;
        }

        const delta = {
            x: currentWorldPos.x - lastPointerWorldPosRef.current.x,
            y: currentWorldPos.y - lastPointerWorldPosRef.current.y,
        };

        if (view === 'tier') {
            let newHoveredObject = null;
            for (let i = data.length - 1; i >= 0; i--) {
                const obj = data[i];
                const result = isPointInObject(currentWorldPos, obj, true);
                if (result.inObject) {
                    newHoveredObject = {
                        id: obj.id,
                        seatInfo: result.seatInfo,
                    };
                    break;
                }
            }
            setHoveredObject(newHoveredObject);
        }

        if (isDraggingObject) {
            setData(prev =>
                prev.map(obj => {
                    if (selectedObject.includes(obj.id)) {
                        return {
                            ...obj,
                            position: {
                                x: obj.position.x + delta.x,
                                y: obj.position.y + delta.y,
                            },
                        };
                    }
                    return obj;
                })
            );
        }

        let panBBox = null;
        if (selectedObject.length > 1) {
            const selectedObjs = data.filter(obj => selectedObject.includes(obj.id));
            panBBox = getUnionBoundingBox(selectedObjs);
        } else if (selectedObject.length === 1) {
            const selectedObj = data.find(obj => obj.id === selectedObject[0]);
            if (selectedObj) {
                const bbox = getBoundingBox(selectedObj);
                panBBox = {
                    x: selectedObj.position.x + bbox.x,
                    y: selectedObj.position.y + bbox.y,
                    width: bbox.width,
                    height: bbox.height,
                };
            }
        }

        let autoPanDelta = { x: 0, y: 0 };
        if (panBBox) {
            const screenX = offset.x + panBBox.x * zoom;
            const screenY = offset.y + panBBox.y * zoom;
            const screenWidth = panBBox.width * zoom;
            const screenHeight = panBBox.height * zoom;

            if (screenX < AUTO_PAN_THRESHOLD) {
                autoPanDelta.x = AUTO_PAN_SPEED;
            } else if (screenX + screenWidth > rect.width - AUTO_PAN_THRESHOLD) {
                autoPanDelta.x = -AUTO_PAN_SPEED;
            }
            if (screenY < AUTO_PAN_THRESHOLD) {
                autoPanDelta.y = AUTO_PAN_SPEED;
            } else if (screenY + screenHeight > rect.height - AUTO_PAN_THRESHOLD) {
                autoPanDelta.y = -AUTO_PAN_SPEED;
            }
        }

        if (autoPanDelta.x !== 0 || autoPanDelta.y !== 0) {
            setOffset(prev => ({
                x: prev.x + autoPanDelta.x,
                y: prev.y + autoPanDelta.y,
            }));

            const worldPanDelta = {
                x: autoPanDelta.x / zoom,
                y: autoPanDelta.y / zoom,
            };

            lastPointerWorldPosRef.current = {
                x: currentWorldPos.x + worldPanDelta.x,
                y: currentWorldPos.y + worldPanDelta.y,
            };

            setData(prev =>
                prev.map(obj => {
                    if (selectedObject.includes(obj.id)) {
                        return {
                            ...obj,
                            position: {
                                x: obj.position.x + worldPanDelta.x,
                                y: obj.position.y + worldPanDelta.y,
                            },
                        };
                    }
                    return obj;
                })
            );
        } else {
            lastPointerWorldPosRef.current = currentWorldPos;
        }

        requestAnimationFrame(() => {
            const ctx = canvas.getContext('2d');
            renderCanvas(ctx, zoom, offset);
        });
    };

    const handleCanvasMouseLeave = () => {
        setHoveredObject(null);
        const canvas = canvasRef.current;
        if (canvas) {
            const ctx = canvas.getContext('2d');
            renderCanvas(ctx, zoom, offset);
        }
    };

    const handleCanvasMouseUp = () => {
        setIsDraggingObject(false);
        setIsRotating(false);
        setObjectDragStart(null);
    };

    const handleDeleteSelected = () => {
        setData(prevData => prevData.filter(obj => !selectedObject.includes(obj.id)));
        setSelectedObject([]);
        const canvas = canvasRef.current;
        if (canvas) {
            const ctx = canvas.getContext('2d');
            renderCanvas(ctx, zoom, offset);
        }
    };

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Delete') {
                handleDeleteSelected();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [selectedObject, data]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        canvas.addEventListener('mousedown', handleCanvasMouseDown);
        window.addEventListener('mousemove', handleCanvasMouseMove);
        window.addEventListener('mouseup', handleCanvasMouseUp);
        canvas.addEventListener('mouseleave', handleCanvasMouseLeave);

        return () => {
            canvas.removeEventListener('mousedown', handleCanvasMouseDown);
            window.removeEventListener('mousemove', handleCanvasMouseMove);
            window.removeEventListener('mouseup', handleCanvasMouseUp);
            canvas.removeEventListener('mouseleave', handleCanvasMouseLeave);
        };
    }, [offset, zoom, objectDragStart, isDraggingObject, selectedObject, data, setData, setSelectedObject, hoveredObject, view, tierData]);

    return (
        <>
            <canvas ref={canvasRef} className={'create-seat-map__canvas'} style={{ width: '100%', height: '100%' }}></canvas>
            <Stack direction={'row'} columnGap={1} position="absolute" bottom={16} right={16}>
                <Button variant="contained" onClick={handleZoomIn}>Zoom In</Button>
                <Button variant="contained" onClick={handleZoomOut}>Zoom Out</Button>
            </Stack>
        </>
    )
}

export default React.memo(SeatMap);