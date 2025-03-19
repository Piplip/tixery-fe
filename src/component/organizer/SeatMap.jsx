import {Button, Stack} from "@mui/material";
import {useEffect, useRef, useState} from "react";
import PropTypes from "prop-types";

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
    tierData: PropTypes.array
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

function SeatMap({data, setData, selectedObject, setSelectedObject, setCenter, zoom, setZoom, offset, setOffset, view, tierData}){
    const canvasRef = useRef(null);
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const [isInitialized, setIsInitialized] = useState(false);
    const [isDraggingObject, setIsDraggingObject] = useState(false);
    const [objectDragStart, setObjectDragStart] = useState({ x: 0, y: 0 });
    const [hoveredObject, setHoveredObject] = useState(null);

    const drawGrid = (ctx, zoom, offset) => {
        const width = ctx.canvas.width / (window.devicePixelRatio || 1);
        const height = ctx.canvas.height / (window.devicePixelRatio || 1);
        const gridSize = 20 * zoom;


        const offsetX = (offset.x % gridSize);
        const offsetY = (offset.y % gridSize);

        ctx.clearRect(0, 0, width, height);
        ctx.beginPath();
        ctx.strokeStyle = '#e0e0e0';
        ctx.lineWidth = 1;

        for (let x = offsetX; x <= width; x += gridSize) {
            ctx.moveTo(Math.floor(x) + 0.5, 0);
            ctx.lineTo(Math.floor(x) + 0.5, height);
        }

        for (let y = offsetY; y <= height; y += gridSize) {
            ctx.moveTo(0, Math.floor(y) + 0.5);
            ctx.lineTo(width, Math.floor(y) + 0.5);
        }

        ctx.stroke();
    };

    const drawSeats = (ctx, properties, hoveredSeat = null, selectedSeats = [], sectionId) => {
        const { sectionName, rows, seats } = properties;
        const rowCount = parseInt(rows);
        const seatCount = parseInt(seats);

        const sectionWidth = seatCount * (SEAT_SIZE + SEAT_GAP) - SEAT_GAP;

        ctx.font = 'bold 16px Arial';
        ctx.fillStyle = '#000';
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
                } else {
                    ctx.fillStyle = baseColor;
                    ctx.strokeStyle = baseStroke;
                    ctx.lineWidth = 1;
                }

                ctx.fill();
                ctx.stroke();

                if (assignedTier) {
                    ctx.fillStyle = '#fff';
                    ctx.font = 'bold 9px Arial';
                } else {
                    ctx.fillStyle = '#2a2a2a';
                    ctx.font = '9px Arial';
                }
                ctx.textAlign = 'center';
                ctx.fillText(seatNumber.toString(), x + SEAT_SIZE / 2, y + SEAT_SIZE / 2 + 3);
            }

            ctx.fillStyle = '#000';
            ctx.font = 'bold 12px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(rowLetter, ROW_LABEL_WIDTH + sectionWidth + ROW_LABEL_WIDTH / 2, r * (SEAT_SIZE + SEAT_GAP) + SEAT_SIZE / 2 + 4);
        }
    }

    const drawTable = (ctx, properties) => {
        const { tableName, style, seats } = properties;
        let tableWidth, tableHeight, tableRadius;

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
        ctx.fillStyle = '#f5f5f5';
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

            if (effectiveEndSeats > 0) {
                for (let i = 0; i < effectiveEndSeats; i++) {
                    const t = (i + 0.5) / effectiveEndSeats;
                    const seatX = -tableWidth / 2 + t * tableWidth;
                    const seatY = -tableHeight / 2 - margin - seatRadius;
                    ctx.beginPath();
                    ctx.arc(seatX, seatY, seatRadius, 0, Math.PI * 2);
                    ctx.fillStyle = '#dadada';
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
                    ctx.fillStyle = '#dadada';
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
                    ctx.fillStyle = '#dadada';
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
                    ctx.fillStyle = '#dadada';
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
                const seatCount = parseInt(seats, 10);
                const seatRadius = 10;
                const seatDistance = tableRadius + seatRadius + 5;
                for (let i = 0; i < seatCount; i++) {
                    const angle = (i / seatCount) * (Math.PI * 2);
                    const seatX = seatDistance * Math.cos(angle);
                    const seatY = seatDistance * Math.sin(angle);
                    ctx.beginPath();
                    ctx.arc(seatX, seatY, seatRadius, 0, Math.PI * 2);
                    ctx.fillStyle = '#dadada';
                    ctx.fill();
                    ctx.stroke();
                }
            }
        }

        ctx.fillStyle = '#000';
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

    const drawCustomObject = (ctx, properties) => {
        const { objectName, shape, label, icon } = properties;
        ctx.save();

        ctx.strokeStyle = '#000';
        ctx.fillStyle = '#f5fbff';
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
        ctx.fillStyle = '#000';

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

    const drawObject = (ctx, obj, zoom, offset) => {
        const { type, position = { x: 0, y: 0 }, properties } = obj;
        const isHovered = hoveredObject && hoveredObject.id === obj.id;
        const isSelected = selectedObject.includes(obj.id);

        ctx.save();
        ctx.translate(offset.x, offset.y);
        ctx.scale(zoom, zoom);
        ctx.translate(position.x, position.y);

        if (view === 'tier') {
            if (type === 'seats') {
                const hoveredSeatInfo = hoveredObject?.id === obj.id ? hoveredObject.seatInfo : null;
                drawSeats(ctx, properties, hoveredSeatInfo, selectedObject, obj.id);
            }
            else {
                if(isHovered){
                    ctx.shadowColor = '#ff9898';
                    ctx.shadowBlur = 10;
                }
                else if (isSelected) {
                    ctx.shadowColor = '#ff0000';
                    ctx.shadowBlur = 10;
                }

                switch(type) {
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
            }
        } else {
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
        if (type === 'seats') {
            const {seats, rows} = properties;
            const width = parseInt(seats) * (SEAT_SIZE + SEAT_GAP) - SEAT_GAP + 2 * ROW_LABEL_WIDTH;
            const height = parseInt(rows) * (SEAT_SIZE + SEAT_GAP) + 20;
            return { x: 0, y: -35, width, height: height + 20 };

        } else if (type === 'table') {
            if (properties.style === 'square') {
                const tableWidth = properties.width
                    ? parseInt(properties.width, 10)
                    : BASE_TABLE_WIDTH; // e.g. 80
                const tableHeight = properties.height
                    ? parseInt(properties.height, 10)
                    : BASE_TABLE_HEIGHT; // e.g. 80
                const seatCount = parseInt(properties.seats, 10) || 0;
                const seatRadius = TABLE_SEAT_RADIUS; // e.g. 10
                const margin = TABLE_MARGIN; // e.g. 5
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

                return {
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
                return {
                    x: -boundingRadius,
                    y: -boundingRadius,
                    width: boundingRadius * 2,
                    height: boundingRadius * 2,
                };
            }
        } else if (type === 'object') {
            if (properties.shape === 'line') {
                return { x: -50, y: -5, width: 100, height: 10 };
            } else if (properties.shape === 'square') {
                return { x: -65, y: -45, width: 130, height: 90 };
            } else if (properties.shape === 'circle') {
                return { x: -40, y: -40, width: 80, height: 80 };
            }
        } else if (type === 'text') {
            const fontSize = properties.size * 4;
            const approxWidth = properties.text.length * (fontSize / 2);
            const approxHeight = fontSize;
            return { x: -approxWidth / 2, y: -approxHeight / 2, width: approxWidth, height: approxHeight };
        }
        return { x: 0, y: 0, width: 0, height: 0 };
    };

    const getUnionBoundingBox = (selectedObjs) => {
        if (!selectedObjs.length) return null;
        let left = Infinity, top = Infinity, right = -Infinity, bottom = -Infinity;
        selectedObjs.forEach((obj) => {
            const bbox = getBoundingBox(obj);
            const worldX = obj.position.x + bbox.x;
            const worldY = obj.position.y + bbox.y;
            left = Math.min(left, worldX);
            top = Math.min(top, worldY);
            right = Math.max(right, worldX + bbox.width);
            bottom = Math.max(bottom, worldY + bbox.height);
        });
        return {
            x: left,
            y: top,
            width: right - left,
            height: bottom - top,
        };
    };

    const isPointInObject = (point, obj, checkSeat = false) => {
        if (obj.type === 'seats' && view === 'tier' && checkSeat) {
            const { rows, seats } = obj.properties;
            const rowCount = parseInt(rows);
            const seatCount = parseInt(seats);

            const localX = point.x - obj.position.x;
            const localY = point.y - obj.position.y;

            if (localY >= 0) {
                for (let r = 0; r < rowCount; r++) {
                    for (let s = 0; s < seatCount; s++) {
                        const centerX = ROW_LABEL_WIDTH + s * (SEAT_SIZE + SEAT_GAP) + SEAT_SIZE / 2;
                        const centerY = r * (SEAT_SIZE + SEAT_GAP) + SEAT_SIZE / 2;

                        const dx = localX - centerX;
                        const dy = localY - centerY;
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
            }

            return { inObject: false };
        }

        const bbox = getBoundingBox(obj);
        const localX = point.x - obj.position.x;
        const localY = point.y - obj.position.y;
        return {
            inObject: localX >= bbox.x &&
                localX <= bbox.x + bbox.width &&
                localY >= bbox.y &&
                localY <= bbox.y + bbox.height
        };
    };

    const handleCanvasMouseDown = (e) => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const rect = canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        const canvasCoords = {
            x: (mouseX - offset.x) / zoom,
            y: (mouseY - offset.y) / zoom,
        };

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
            let hitSelectedObject = false;
            if (selectedObject.length > 1) {
                const selectedObjs = data.filter(obj => selectedObject.includes(obj.id));
                const unionBBox = getUnionBoundingBox(selectedObjs);
                hitSelectedObject = (
                    canvasCoords.x >= unionBBox.x &&
                    canvasCoords.x <= unionBBox.x + unionBBox.width &&
                    canvasCoords.y >= unionBBox.y &&
                    canvasCoords.y <= unionBBox.y + unionBBox.height
                );
            } else {
                const selectedObj = data.find(obj => obj.id === selectedObject[0]);
                if (selectedObj) {
                    const bbox = getBoundingBox(selectedObj);
                    hitSelectedObject = (
                        canvasCoords.x >= selectedObj.position.x + bbox.x &&
                        canvasCoords.x <= selectedObj.position.x + bbox.x + bbox.width &&
                        canvasCoords.y >= selectedObj.position.y + bbox.y &&
                        canvasCoords.y <= selectedObj.position.y + bbox.y + bbox.height
                    );
                }
            }

            if (hitSelectedObject) {
                setIsDraggingObject(true);
                setObjectDragStart({ x: canvasCoords.x, y: canvasCoords.y });
                return;
            }
        }

        let hitObject = null;
        for (let i = data.length - 1; i >= 0; i--) {
            if (isPointInObject(canvasCoords, data[i]).inObject) {
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
            setObjectDragStart({ x: canvasCoords.x, y: canvasCoords.y });
        } else {
            if (!e.ctrlKey) {
                const selectedObjs = data.filter(obj => selectedObject.includes(obj.id));
                const isOutsideAll = selectedObjs.every(obj => {
                    const bbox = getBoundingBox(obj);
                    const worldX = obj.position.x + bbox.x;
                    const worldY = obj.position.y + bbox.y;
                    return !(
                        canvasCoords.x >= worldX &&
                        canvasCoords.x <= worldX + bbox.width &&
                        canvasCoords.y >= worldY &&
                        canvasCoords.y <= worldY + bbox.height
                    );
                });

                if (isOutsideAll) {
                    setSelectedObject([]);
                }
            }
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
        const canvasCoords = {
            x: (mouseX - offset.x) / zoom,
            y: (mouseY - offset.y) / zoom,
        };

        if (view === 'tier') {
            let newHoveredObject = null;

            for (let i = data.length - 1; i >= 0; i--) {
                const obj = data[i];
                const result = isPointInObject(canvasCoords, obj, true);
                if (result.inObject) {
                    newHoveredObject = {
                        id: obj.id,
                        seatInfo: result.seatInfo
                    };
                    break;
                }
            }
            setHoveredObject(newHoveredObject);
        }

        if (isDraggingObject) {
            const dx = canvasCoords.x - objectDragStart.x;
            const dy = canvasCoords.y - objectDragStart.y;

            setData(prev =>
                prev.map(obj => {
                    if (selectedObject.includes(obj.id)) {
                        return {
                            ...obj,
                            position: {
                                x: obj.position.x + dx,
                                y: obj.position.y + dy,
                            },
                        };
                    }
                    return obj;
                })
            );

            setObjectDragStart(canvasCoords);
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
                    height: bbox.height
                };
            }
        }

        if (panBBox) {
            const screenX = offset.x + panBBox.x * zoom;
            const screenY = offset.y + panBBox.y * zoom;
            const screenWidth = panBBox.width * zoom;
            const screenHeight = panBBox.height * zoom;

            let deltaX = 0;
            let deltaY = 0;

            if (screenX < AUTO_PAN_THRESHOLD) {
                deltaX = AUTO_PAN_SPEED;
            } else if (screenX + screenWidth > rect.width - AUTO_PAN_THRESHOLD) {
                deltaX = -AUTO_PAN_SPEED;
            }
            if (screenY < AUTO_PAN_THRESHOLD) {
                deltaY = AUTO_PAN_SPEED;
            } else if (screenY + screenHeight > rect.height - AUTO_PAN_THRESHOLD) {
                deltaY = -AUTO_PAN_SPEED;
            }

            if (deltaX || deltaY) {
                setOffset(prev => ({
                    x: prev.x + deltaX,
                    y: prev.y + deltaY,
                }));
            }
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
        if (isDraggingObject) {
            setIsDraggingObject(false);
        }
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
    }, [offset, zoom, objectDragStart, isDraggingObject, selectedObject, data, setData, setSelectedObject, hoveredObject, view]);

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

export default SeatMap;