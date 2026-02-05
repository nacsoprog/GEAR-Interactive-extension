import React from 'react';
import gearLogoInline from '../assets/gear_logo_inline.png';
import { SEARCH_FILTERS } from '../data/geAreas';
// Wait, SEARCH_FILTERS was imported in App. Where?
// in App it was imported from './data/searchFilters'? No, let's check App imports.

interface SearchProps {
    unfulfilledFilters: string[];
    selectedSearchFilter: string | null;
    setSelectedSearchFilter: React.Dispatch<React.SetStateAction<string | null>>;
    timeRange: [number, number];
    setTimeRange: React.Dispatch<React.SetStateAction<[number, number]>>;
    handleSearchGold: () => void;
    highlightedFilters?: string[];
    setHighlightedFilters?: React.Dispatch<React.SetStateAction<string[]>>;
}

const Search: React.FC<SearchProps> = ({
    unfulfilledFilters,
    selectedSearchFilter,
    setSelectedSearchFilter,
    timeRange,
    setTimeRange,
    handleSearchGold,
    highlightedFilters = [],
    setHighlightedFilters
}) => {
    React.useEffect(() => {
        if (highlightedFilters.length > 0 && setHighlightedFilters) {
            const timer = setTimeout(() => {
                setHighlightedFilters([]);
            }, 2500);
            return () => clearTimeout(timer);
        }
    }, [highlightedFilters, setHighlightedFilters]);

    const formatTime = (hour: number) => {
        if (hour === 12) return "12:00 PM";
        if (hour > 12) return `${hour - 12}:00 PM`;
        return `${hour}:00 AM`;
    };

    // --- Custom Slider Logic ---
    const sliderRef = React.useRef<HTMLDivElement>(null);
    const [dragging, setDragging] = React.useState<'start' | 'end' | null>(null);

    // Helper to calculate hour from mouse position
    const getHourFromPosition = (clientX: number) => {
        if (!sliderRef.current) return 8;
        const rect = sliderRef.current.getBoundingClientRect();
        const offsetX = clientX - rect.left;
        const width = rect.width;
        let percentage = offsetX / width;
        percentage = Math.max(0, Math.min(1, percentage)); // Clamp 0-1

        // Map 0-1 to 8-23
        // Range is 15 hours (23 - 8)
        const rawHour = 8 + (percentage * 15);
        return Math.round(rawHour);
    };

    React.useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!dragging) return;

            const newHour = getHourFromPosition(e.clientX);

            if (dragging === 'start') {
                // Ensure start doesn't exceed end
                const validStart = Math.min(newHour, timeRange[1]);
                if (validStart !== timeRange[0]) {
                    setTimeRange([validStart, timeRange[1]]);
                }
            } else {
                // Ensure end doesn't go below start
                const validEnd = Math.max(newHour, timeRange[0]);
                if (validEnd !== timeRange[1]) {
                    setTimeRange([timeRange[0], validEnd]);
                }
            }
        };

        const handleMouseUp = () => {
            setDragging(null);
        };

        if (dragging) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
        }

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [dragging, timeRange, setTimeRange]);

    // Calculate percentages for render
    const startPercent = ((timeRange[0] - 8) / 15) * 100;
    const endPercent = ((timeRange[1] - 8) / 15) * 100;

    return (
        <div className="page-container active-page">
            <div style={{ marginTop: '0px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                <div style={{ marginTop: '0', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <h1 style={{ color: '#02224dff', margin: 0 }}>GE GOLD Search</h1>
                    <img src={gearLogoInline} alt="GEAR Logo" style={{ height: '3em', width: 'auto' }} />
                </div>
            </div>
            <p style={{ marginBottom: '15px', lineHeight: '1.6' }}>1. Log-in to GOLD<br />2. Select ONE GE area and a TIME range below<br />3. Click <strong>Start "Advanced Search" in GOLD</strong> to open the search page in GOLD<br /><u>Once in GOLD:</u><br />4. Select your desired QUARTER and adjust other filters as you wish<br />5. Click <strong>Begin Search</strong> within GOLD</p>
            {unfulfilledFilters.length > 0 && (
                <div className="unfulfilled-container" style={{ marginBottom: '15px' }}>
                    <div className="unfulfilled-header">Unfulfilled Requirements:</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                        {unfulfilledFilters.map(filter => (
                            <span key={filter} className="unfulfilled-item">
                                {filter}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            <div className="filters-grid">
                {SEARCH_FILTERS.map(filter => (
                    <div key={filter} className={`filter-item ${highlightedFilters.includes(filter) ? 'flash-highlight' : ''}`}>
                        <input
                            type="checkbox"
                            id={`filter-${filter}`}
                            checked={selectedSearchFilter === filter}
                            onChange={() => setSelectedSearchFilter(prev => prev === filter ? null : filter)}
                        />
                        <label htmlFor={`filter-${filter}`}>{filter}</label>
                    </div>
                ))}
            </div>

            <div className="time-slider-container" style={{ marginTop: '20px', marginBottom: '20px', padding: '0 10px' }}>
                <div className="time-labels" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '0.9em', fontWeight: 'bold' }}>
                    <span>Start: {formatTime(timeRange[0])}</span>
                    <span>End: {formatTime(timeRange[1])}</span>
                </div>

                {/* Custom Slider Container */}
                <div
                    className="range-slider"
                    ref={sliderRef}
                    style={{ position: 'relative', height: '40px' }}
                    onMouseDown={() => {
                        // Optional: Allow clicking track to jump nearest thumb?
                        // For now, let's keep it simple: drag thumbs only, or maybe implement basic jump logic later.
                        // User requested "hitbox for endpoints be physical squares".
                    }}
                >
                    {/* Track Background */}
                    <div className="slider-track p-absolute-center-y"></div>

                    {/* Active Range (Blue) */}
                    <div className="slider-range p-absolute-center-y" style={{
                        left: `${startPercent}%`,
                        right: `${100 - endPercent}%`
                    }}></div>

                    {/* Left Thumb */}
                    <div
                        className="slider-thumb-left p-absolute-center-y"
                        style={{
                            left: `${startPercent}%`,
                            transform: 'translate(-50%, -50%)',
                            cursor: 'default',
                            position: 'absolute',
                            zIndex: 10
                        }}
                        onMouseDown={(e) => {
                            e.stopPropagation(); // Prevent parent track click
                            setDragging('start');
                        }}
                    ></div>

                    {/* Right Thumb */}
                    <div
                        className="slider-thumb-right p-absolute-center-y"
                        style={{
                            left: `${endPercent}%`,
                            transform: 'translate(-50%, -50%)',
                            cursor: 'default',
                            position: 'absolute',
                            zIndex: 10
                        }}
                        onMouseDown={(e) => {
                            e.stopPropagation();
                            setDragging('end');
                        }}
                    ></div>
                </div>
            </div>

            <button style={{ display: 'block', margin: '20px auto 0 auto' }} className="nav-button primary search-btn" onClick={handleSearchGold}>
                Start "Advanced Search" in GOLD
            </button>

            <div style={{ marginTop: '20px' }} className="foot-note">
                <p>*Note: This will automatically select "Open Sections Only", uncheck this if you want to see all available sections</p>
            </div>
        </div>
    );
};

export default Search;
