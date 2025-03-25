import {initializeApp} from "firebase/app";
import {firebaseConfig} from "../../config/firebaseConfig.js";
import {getBytes, getStorage, ref} from "firebase/storage";
import PropTypes from "prop-types";
import {useEffect, useRef, useState} from "react";
import {getContrastColor} from "../../common/Utilities.js";
import {useAlert} from "../../custom-hooks/useAlert.js";
import {eventAxiosWithToken} from "../../config/axiosConfig.js";
import {CircularProgress} from "@mui/material";
import { Client } from '@stomp/stompjs';

initializeApp(firebaseConfig);
const storage = getStorage()

const SEAT_SIZE = 18;
const SEAT_GAP = 5;
const ROW_LABEL_WIDTH = 25;

const BASE_TABLE_WIDTH = 80;
const BASE_TABLE_HEIGHT = 80;
const TABLE_SEAT_RADIUS = 10;
const SEAT_DIAMETER = TABLE_SEAT_RADIUS * 2;
const TABLE_MARGIN = 5;

SeatMapView.propTypes = {
    mapURL: PropTypes.string,
    selectedObject: PropTypes.array,
    setSelectedObject: PropTypes.func,
    eventID: PropTypes.string,
    data: PropTypes.array,
    setData: PropTypes.func,
    tierData: PropTypes.array,
    setTier: PropTypes.func,
    mapID: PropTypes.number,
}

function SeatMapView({eventID, mapURL, selectedObject, setSelectedObject, data, setData, tierData, setTier, mapID}){
    const canvasRef = useRef()
    const [isInitialized, setIsInitialized] = useState(false);
    const [hoveredObject, setHoveredObject] = useState(null);
    const lastPointerWorldPosRef = useRef(null);
    const [offset, setOffset] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1)
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const { showError } = useAlert();
    const [ticketStatus, setTicketStatus] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const [connectionStatus, setConnectionStatus] = useState('disconnected');
    const clientRef = useRef(null);

    useEffect(() => {
        if (!mapID) {
            console.log("No map ID provided, skipping WebSocket connection");
            return;
        }

        const topicName = `/seat-map/${mapID}`;
        setConnectionStatus('connecting');

        const stompClient = new Client({
            brokerURL: `ws://localhost:9999/events/ws`,
            reconnectDelay: 5000,

            onConnect: () => {
                setConnectionStatus('connected');
                stompClient.subscribe(topicName, (message) => {
                    try {
                        if (message.body) {
                            const receivedSeatIds = JSON.parse(message.body);

                            if (receivedSeatIds && receivedSeatIds.length > 0) {
                                setTicketStatus(prevStatus => {
                                    const updatedStatus = { ...prevStatus };
                                    receivedSeatIds.forEach(seatID => {
                                        updatedStatus[seatID] = "reserved";
                                    });
                                    return updatedStatus;
                                });
                            }
                        }
                    } catch (err) {
                        console.error("Error processing WebSocket message:", err);
                    }
                });
            },

            onStompError: (frame) => {
                console.error('Broker reported error:', frame.headers['message']);
                console.error('Additional details:', frame.body);
                setConnectionStatus('error');
            },

            onWebSocketError: (event) => {
                console.error('WebSocket error:', event);
                setConnectionStatus('error');
            },

            onWebSocketClose: () => {
                console.log(`WebSocket connection closed for map ${mapID}`);
                setConnectionStatus('disconnected');
            }
        });

        clientRef.current = stompClient;
        stompClient.activate();

        return () => {
            console.log(`Cleaning up WebSocket for map ${mapID}`);
            if (stompClient.connected) {
                stompClient.deactivate();
            }
            clientRef.current = null;
        };
    }, [mapID]);

    useEffect(() => {
        if (!mapURL) return;

        async function getMapData(mapURL){
            const mapRef = ref(storage, mapURL);
            return await getBytes(mapRef)
                .then(bytes => {
                    const decoder = new TextDecoder('utf-8');
                    const jsonStr = decoder.decode(bytes);
                    const jsonData = JSON.parse(jsonStr);
                    if (jsonData.canvasObjects && Array.isArray(jsonData.canvasObjects)) {
                        setData(jsonData.canvasObjects);
                    }

                    if (jsonData.tierData && Array.isArray(jsonData.tierData)) {
                        setTier(jsonData.tierData);
                    }
                })
                .catch(err => {
                    console.error("Error parsing seat map file:", err);
                });
        }

        if (mapURL) {
            getMapData(mapURL)
            eventAxiosWithToken.get(`/tier-tickets?eid=${eventID}`)
                .then(r => {
                    if (r.data && r.data.length > 0) {
                        const statusMap = {};
                        r.data.forEach(ticket => {
                            statusMap[ticket.seat_identifier] = ticket.status;
                        });
                        setTicketStatus(statusMap);
                    }
                    setTimeout(() => setIsLoading(false), 200)
                })
                .catch(err => console.log(err))
        }
    }, [mapURL]);

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

                const status = ticketStatus[seatId];
                const isTaken = status === 'sold' || status === 'reserved' || status === 'pending';

                let baseColor, baseStroke;

                if (!assignedTier) {
                    baseColor = '#e0e0e0';
                    baseStroke = '#cccccc';
                } else if (isTaken) {
                    baseColor = '#a0a0a0';
                    baseStroke = '#808080';
                } else {
                    baseColor = assignedTier.color;
                    baseStroke = assignedTier.color;
                }

                const isSelected = selectedSeats.some(seat =>
                    (typeof seat === 'string' && seat === seatId) ||
                    (typeof seat === 'object' && seat.id === seatId)
                );

                if (hoveredSeat && hoveredSeat.row === r && hoveredSeat.seat === s && hoveredSeat.sectionId === sectionId) {
                    if (isTaken) {
                        ctx.fillStyle = '#a0a0a0';
                        ctx.strokeStyle = '#31343a';
                        ctx.lineWidth = 2;

                        ctx.save();
                        ctx.beginPath();
                        ctx.arc(x + SEAT_SIZE / 2, y + SEAT_SIZE / 2, SEAT_SIZE / 2 + 2, 0, Math.PI * 2);
                        ctx.strokeStyle = '#ff5151';
                        ctx.lineWidth = 2;
                        ctx.stroke();
                        ctx.restore();

                        ctx.beginPath();
                        ctx.moveTo(x + 5, y + 5);
                        ctx.lineTo(x + SEAT_SIZE - 5, y + SEAT_SIZE - 5);
                        ctx.moveTo(x + SEAT_SIZE - 5, y + 5);
                        ctx.lineTo(x + 5, y + SEAT_SIZE - 5);
                        ctx.strokeStyle = '#ff5151';
                        ctx.lineWidth = 2;
                        ctx.stroke();
                    }
                    else if (assignedTier) {
                        ctx.fillStyle = assignedTier.color;
                        ctx.strokeStyle = '#31343a';
                        ctx.lineWidth = 2;
                        ctx.save();
                        ctx.beginPath();
                        ctx.arc(x + SEAT_SIZE / 2, y + SEAT_SIZE / 2, SEAT_SIZE / 2 + 2, 0, Math.PI * 2);
                        ctx.strokeStyle = '#fff';
                        ctx.lineWidth = 2;
                        ctx.stroke();
                        ctx.restore();
                    } else {
                        ctx.fillStyle = '#e0e0e0';
                        ctx.strokeStyle = '#cccccc';
                        ctx.lineWidth = 1;
                        ctx.save();
                        ctx.beginPath();
                        ctx.arc(x + SEAT_SIZE / 2, y + SEAT_SIZE / 2, SEAT_SIZE / 2 + 2, 0, Math.PI * 2);
                        ctx.strokeStyle = '#999';
                        ctx.lineWidth = 1;
                        ctx.stroke();
                        ctx.restore();

                        ctx.beginPath();
                        ctx.moveTo(x + 5, y + 5);
                        ctx.lineTo(x + SEAT_SIZE - 5, y + SEAT_SIZE - 5);
                        ctx.strokeStyle = '#999';
                        ctx.lineWidth = 1;
                        ctx.stroke();
                    }
                }
                else if (isSelected) {
                    ctx.fillStyle = baseColor;
                    ctx.strokeStyle = '#000000';
                    ctx.lineWidth = 2.5;
                }
                else {
                    ctx.fillStyle = baseColor;
                    ctx.strokeStyle = baseStroke;
                    ctx.lineWidth = 1;

                    if (!assignedTier) {
                        ctx.fill();
                        ctx.stroke();
                        ctx.beginPath();
                        ctx.moveTo(x + 5, y + 5);
                        ctx.lineTo(x + SEAT_SIZE - 5, y + SEAT_SIZE - 5);
                        ctx.strokeStyle = '#999';
                        ctx.lineWidth = 1;
                        ctx.stroke();
                    }
                }

                ctx.fill();
                ctx.stroke();

                if (isTaken) {
                    ctx.beginPath();
                    ctx.moveTo(x + 5, y + 5);
                    ctx.lineTo(x + SEAT_SIZE - 5, y + SEAT_SIZE - 5);
                    ctx.moveTo(x + SEAT_SIZE - 5, y + 5);
                    ctx.lineTo(x + 5, y + SEAT_SIZE - 5);
                    ctx.strokeStyle = '#999999';
                    ctx.lineWidth = 1;
                    ctx.stroke();
                }
                ctx.fillStyle = getContrastColor(baseColor);
                ctx.font = 'bold 10px Nunito';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(seatNumber.toString(), x + SEAT_SIZE / 2, y + SEAT_SIZE / 2 + 1);
            }

            ctx.fillStyle = '#000';
            ctx.font = 'bold 12px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'alphabetic';
            ctx.fillText(rowLetter, ROW_LABEL_WIDTH + sectionWidth + ROW_LABEL_WIDTH / 2, r * (SEAT_SIZE + SEAT_GAP) + SEAT_SIZE / 2 + 4);
        }
    }

    const drawTable = (ctx, properties, tableId) => {
        const { tableName, style, seats } = properties;
        let tableWidth, tableHeight, tableRadius;

        const assignedTier = tierData?.find(tier =>
            tier && Array.isArray(tier.assignedSeats) && tier.assignedSeats.includes(tableId)
        );

        const isSelected = selectedObject.some(item =>
            (typeof item === 'string' && item === tableId) ||
            (typeof item === 'object' && item.id === tableId)
        );

        const tableStatus = ticketStatus[tableId];
        const isTaken = tableStatus === 'sold' || tableStatus === 'reserved' || tableStatus === 'pending';

        let tableColor, seatColor;
        if (!assignedTier) {
            tableColor = '#e0e0e0';
            seatColor = '#d0d0d0';
        } else if (isTaken) {
            tableColor = '#a0a0a0';
            seatColor = '#909090';
        } else {
            tableColor = assignedTier.color;
            seatColor = assignedTier.color;
        }

        const textColor = getContrastColor(tableColor);
        const isUntiered = !assignedTier;
        const isUnavailable = isTaken || isUntiered;

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
        if (isSelected) {
            ctx.fillStyle = tableColor;
            ctx.strokeStyle = '#2196f3';
            ctx.lineWidth = 3;

            ctx.shadowColor = '#2196f3';
            ctx.shadowBlur = 10;
        } else {
            ctx.fillStyle = tableColor;
            ctx.strokeStyle = isUnavailable ? '#cccccc' : '#000';
            ctx.lineWidth = isUnavailable ? 1 : 2;
        }

        if (style === 'square') {
            ctx.beginPath();
            ctx.rect(-tableWidth / 2, -tableHeight / 2, tableWidth, tableHeight);
            ctx.fill();
            ctx.stroke();

            if (isUnavailable && !isSelected) {
                ctx.beginPath();
                ctx.moveTo(-tableWidth / 2 + 10, -tableHeight / 2 + 10);
                ctx.lineTo(tableWidth / 2 - 10, tableHeight / 2 - 10);
                ctx.strokeStyle = '#999';
                ctx.lineWidth = 1;
                ctx.stroke();

                ctx.beginPath();
                ctx.moveTo(tableWidth / 2 - 10, -tableHeight / 2 + 10);
                ctx.lineTo(-tableWidth / 2 + 10, tableHeight / 2 - 10);
                ctx.stroke();
            }

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

            if (isUnavailable && !isSelected) {
                ctx.beginPath();
                ctx.moveTo(-tableRadius * 0.7, -tableRadius * 0.7);
                ctx.lineTo(tableRadius * 0.7, tableRadius * 0.7);
                ctx.strokeStyle = '#999';
                ctx.lineWidth = 1;
                ctx.stroke();

                ctx.beginPath();
                ctx.moveTo(tableRadius * 0.7, -tableRadius * 0.7);
                ctx.lineTo(-tableRadius * 0.7, tableRadius * 0.7);
                ctx.stroke();
            }

            const seatCount = parseInt(seats, 10);
            ctx.fillStyle = seatColor;

            for (let i = 0; i < seatCount; i++) {
                const angle = (i / seatCount) * Math.PI * 2;
                const x = Math.cos(angle) * (tableRadius + TABLE_SEAT_RADIUS + 5);
                const y = Math.sin(angle) * (tableRadius + TABLE_SEAT_RADIUS + 5);

                ctx.beginPath();
                ctx.arc(x, y, TABLE_SEAT_RADIUS, 0, Math.PI * 2);
                ctx.fill();
                ctx.stroke();
            }
        }

        if (isTaken) {
            ctx.fillStyle = textColor;
            ctx.font = 'bold 10px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'top';
            ctx.fillText("TAKEN", 0, style === 'square' ? tableHeight / 4 : 0);
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

    const drawObject = (ctx, obj, zoom, offset) => {
        const { type, position = { x: 0, y: 0 }, properties, rotation = 0 } = obj;
        const isHovered = hoveredObject && hoveredObject.id === obj.id;

        const isSelected = selectedObject.some(item =>
            (typeof item === 'string' && item === obj.id) ||
            (typeof item === 'object' && item.id === obj.id) ||
            (typeof item === 'object' && item.section === obj.id)
        );

        ctx.save();
        ctx.translate(offset.x, offset.y);
        ctx.scale(zoom, zoom);

        ctx.translate(position.x, position.y);
        ctx.rotate(rotation * Math.PI / 180);

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

        ctx.restore();
    }

    const renderCanvas = (ctx, zoom, offset) => {
        const width = ctx.canvas.width / (window.devicePixelRatio || 1);
        const height = ctx.canvas.height / (window.devicePixelRatio || 1);

        ctx.clearRect(0, 0, width, height);
        if(data === null) return;
        data.forEach(obj => {drawObject(ctx, obj, zoom, offset);});
    };

    const getTierInfo = (id) => {
        if (!tierData) return null;

        const tier = tierData.find(tier =>
            tier && Array.isArray(tier.assignedSeats) &&
            tier.assignedSeats.includes(id)
        );

        return tier ? {
            tierId: tier.id,
            dbTierId: tier.dbTierID,
            name: tier.name,
            color: tier.color
        } : null;
    };

    const calculateCanvasCenter = () => {
        const canvas = canvasRef.current;
        if (!canvas) return { x: 0, y: 0 };

        const width = canvas.clientWidth;
        const height = canvas.clientHeight;

        return { x: width / 2, y: height / 2 };
    };

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
        if (data && data.length > 0 && !isInitialized) {
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

    const isPointInObject = (point, obj, checkSeat = false) => {
        const rotation = obj.rotation || 0;
        const radians = (rotation * Math.PI) / 180;
        const cos = Math.cos(-radians);
        const sin = Math.sin(-radians);

        const dx = point.x - obj.position.x;
        const dy = point.y - obj.position.y;
        const localX = dx * cos - dy * sin;
        const localY = dx * sin + dy * cos;

        if (obj.type === 'seats' && checkSeat) {
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

        if (e.shiftKey) {
            if (e.button === 0 || e.button === 1) {
                setIsDragging(true);
                setDragStart({ x: e.clientX, y: e.clientY });
                canvas.style.cursor = 'grabbing';
            }
            return;
        }

        let objectClicked = false;

        for (let i = data.length - 1; i >= 0; i--) {
            const obj = data[i];
            const result = isPointInObject(canvasCoords, obj, true);

            if (result.inObject) {
                objectClicked = true;

                if (obj.type === 'seats' && result.seatInfo) {
                    const seatId = `${obj.id}_${result.seatInfo.row}_${result.seatInfo.seat}`;
                    const tierInfo = getTierInfo(seatId);

                    const status = ticketStatus[seatId];
                    const isTaken = status === 'sold' || status === 'reserved' || status === 'pending';

                    if (isTaken) {
                        showError('This seat is already taken');
                        return;
                    }

                    if (!tierInfo) {
                        showError('This seat is not available for selection');
                        return;
                    }

                    const selectionObj = {
                        id: seatId,
                        type: 'seat',
                        row: result.seatInfo.row,
                        seat: result.seatInfo.seat,
                        section: obj.id,
                        sectionName: obj.properties.sectionName,
                        rowLetter: String.fromCharCode(65 + result.seatInfo.row),
                        tierName: tierInfo.name,
                        tierId: tierInfo.tierId,
                        dbTierId: tierInfo.dbTierId,
                        color: tierInfo.color
                    };

                    setSelectedObject(prev => {
                        const isAlreadySelected = prev.some(item =>
                            (typeof item === 'object' && item.id === seatId));

                        if (isAlreadySelected) {
                            return prev.filter(item =>
                                !(typeof item === 'object' && item.id === seatId));
                        } else {
                            return [...prev, selectionObj];
                        }
                    });
                }
                else if (obj.type === 'table') {
                    const tableId = obj.id;
                    const tierInfo = getTierInfo(tableId);

                    if (!tierInfo) {
                        showError('This table is not available for selection');
                        return;
                    }

                    const status = ticketStatus[tableId];
                    const isTaken = status === 'sold' || status === 'reserved' || status === 'pending';

                    if (isTaken) {
                        showError('This table is already taken');
                        return;
                    }

                    const selectionObj = {
                        id: tableId,
                        type: 'table',
                        tableName: obj.properties.tableName,
                        seats: obj.properties.seats,
                        tierName: tierInfo.name,
                        tierId: tierInfo.tierId,
                        dbTierId: tierInfo.dbTierId,
                        color: tierInfo.color
                    };

                    setSelectedObject(prev => {
                        const isAlreadySelected = prev.some(item =>
                            (typeof item === 'object' && item.id === tableId));

                        if (isAlreadySelected) {
                            return prev.filter(item =>
                                !(typeof item === 'object' && item.id === tableId));
                        } else {
                            return [...prev, selectionObj];
                        }
                    });
                }
                break;
            }
        }

        if (!objectClicked) {
            setSelectedObject([]);
        }

        const ctx = canvas.getContext('2d');
        renderCanvas(ctx, zoom, offset);
    };

    const handleCanvasMouseMove = (e) => {
        const canvas = canvasRef.current;
        if (!canvas || !data) return;

        const rect = canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        const currentWorldPos = {
            x: (mouseX - offset.x) / zoom,
            y: (mouseY - offset.y) / zoom,
        };

        if (!lastPointerWorldPosRef.current) {
            lastPointerWorldPosRef.current = currentWorldPos;
        }

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

        lastPointerWorldPosRef.current = currentWorldPos;

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

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        canvas.addEventListener('mousedown', handleCanvasMouseDown);
        window.addEventListener('mousemove', handleCanvasMouseMove);
        canvas.addEventListener('mouseleave', handleCanvasMouseLeave);

        return () => {
            canvas.removeEventListener('mousedown', handleCanvasMouseDown);
            window.removeEventListener('mousemove', handleCanvasMouseMove);
            canvas.removeEventListener('mouseleave', handleCanvasMouseLeave);
        };
    }, [offset, zoom, selectedObject, data, setData, setSelectedObject, hoveredObject, tierData, ticketStatus]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas || !data) return;

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
    }, [isDragging, dragStart, zoom, offset, data]);

    return (
        <div className="view-seat-map__container" style={{ position: 'relative', width: '100%', height: '100%' }}>
            <canvas ref={canvasRef} className={'view-seat-map__canvas'}></canvas>
            {isLoading && (
                <div className="view-seat-map__loading-overlay" style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: 'rgb(255,255,255)',
                }}>
                    <CircularProgress />
                    <p style={{ marginTop: '20px', fontWeight: 'bold' }}>Loading seat map...</p>
                </div>
            )}
        </div>
    )
}

export default SeatMapView