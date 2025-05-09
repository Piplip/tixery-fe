import {useEffect, useState} from "react";
import PropTypes from "prop-types";
import "../../styles/carousel-styles.css"
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';

Carousel.propTypes = {
    children: PropTypes.arrayOf(PropTypes.element).isRequired,
}

function Carousel( {children} ) {
    const [activeIndex, setActiveIndex] = useState(0);
    const [slideDone, setSlideDone] = useState(true);
    const [timeID, setTimeID] = useState(null);

    useEffect(() => {
        if (slideDone) {
            setSlideDone(false);
            setTimeID(
                setTimeout(() => {
                    slideNext();
                    setSlideDone(true);
                }, 5000)
            );
        }
    }, [slideDone]);

    const slideNext = () => {
        setActiveIndex((val) => {
            if (val >= children.length - 1) {
                return 0;
            } else {
                return val + 1;
            }
        });
    };

    const slidePrev = () => {
        setActiveIndex((val) => {
            if (val <= 0) {
                return children.length - 1;
            } else {
                return val - 1;
            }
        });
    };

    const AutoPlayStop = () => {
        if (timeID > 0) {
            clearTimeout(timeID);
            setSlideDone(false);
        }
    };

    const AutoPlayStart = () => {
        if (!slideDone) {
            setSlideDone(true);
        }
    };

    return (
        <div
            className="container__slider"
            onMouseEnter={AutoPlayStop}
            onMouseLeave={AutoPlayStart}
        >
            {children.map((item, index) => {
                return (
                    <div
                        className="slider__item"
                        key={index}
                        style={{ transform: `translateX(-${activeIndex * 100}%)` }}
                    >
                        {item}
                    </div>
                );
            })}

            <div className="container__slider__links">
                {children.map((item, index) => {
                    return (
                        <button
                            key={index}
                            className={
                                activeIndex === index
                                    ? "container__slider__links-small container__slider__links-small-active"
                                    : "container__slider__links-small"
                            }
                            onClick={(e) => {
                                e.preventDefault();
                                setActiveIndex(index);
                            }}
                        ></button>
                    );
                })}
            </div>

            <button
                className="slider__btn-next"
                onClick={(e) => {
                    e.preventDefault();
                    slideNext();
                }}
            >
                <KeyboardArrowRightIcon />
            </button>
            <button
                className="slider__btn-prev"
                onClick={(e) => {
                    e.preventDefault();
                    slidePrev();
                }}
            >
                <KeyboardArrowLeftIcon />
            </button>
        </div>
    );
}

export default Carousel;