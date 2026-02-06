import React from 'react';
import gearLogoInline from '../assets/gear_logo_inline.png';
import { SEARCH_FILTERS } from '../data/geAreas';

interface SearchProps {
    unfulfilledFilters: string[];
    selectedSearchFilter: string | null;
    setSelectedSearchFilter: React.Dispatch<React.SetStateAction<string | null>>;
    timeRange: [number, number];
    setTimeRange: React.Dispatch<React.SetStateAction<[number, number]>>;
    courseLevel: string;
    setCourseLevel: (val: string) => void;
    excludeRestrictions: boolean;
    setExcludeRestrictions: (val: boolean) => void;
    excludePrerequisites: boolean;
    setExcludePrerequisites: (val: boolean) => void;
    unitRange: [string, string];

    setUnitRange: (val: [string, string]) => void;
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
    courseLevel,
    setCourseLevel,
    excludeRestrictions,
    setExcludeRestrictions,
    excludePrerequisites,
    setExcludePrerequisites,
    unitRange,

    setUnitRange,
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
        if (!dragging) return;

        const handleMouseMove = (e: MouseEvent) => {
            const newHour = getHourFromPosition(e.clientX);

            setTimeRange((prev) => {
                const [currentStart, currentEnd] = prev;

                if (dragging === 'start') {
                    // Clamp: cannot be greater than current End
                    const validStart = Math.min(newHour, currentEnd);
                    return [validStart, currentEnd];
                } else {
                    // Clamp: cannot be less than current Start
                    const validEnd = Math.max(newHour, currentStart);
                    return [currentStart, validEnd];
                }
            });
        };

        const handleMouseUp = () => {
            setDragging(null);
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
        // Dependency array NO LONGER includes timeRange!
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dragging, setTimeRange]);

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



            {/* New Search Fields: Level, Title, Units */}
            <div className="search-extra-fields" style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '8px',
                marginTop: '5px',
                alignItems: 'flex-end',
                width: '100%'
            }}>
                {/* Col 1: Level (approx 15%) */}
                <div style={{ flex: '0.6 1 70px', display: 'flex', flexDirection: 'column', gap: '5px', minWidth: '60px' }}>
                    <label style={{ fontSize: '0.8em', fontWeight: 'bold', textAlign: 'center' }}>Level</label>
                    <select
                        className="search-dropdown"
                        value={courseLevel}
                        onChange={(e) => setCourseLevel(e.target.value)}
                        style={{ fontSize: '1.1em', height: '40px', width: '100%', padding: '8px', borderRadius: '5px', border: '1px solid #ccc', boxSizing: 'border-box' }}
                    >
                        <option value="">Any</option>
                        <option value="U">Ugrad</option>
                        <option value="UL">Ugrad-LD</option>
                        <option value="UU">Ugrad-UP</option>
                        <option value="G">Grad</option>
                    </select>
                </div>

                {/* Col 2: No Restrictions/Prerequisites (approx 55%) */}
                <div style={{ flex: '3 1 200px', display: 'flex', flexDirection: 'column', gap: '5px', minWidth: '180px' }}>
                    <label style={{ fontSize: '0.8em', fontWeight: 'bold', textAlign: 'center' }}>No:</label>
                    <div style={{
                        display: 'flex',
                        height: '40px',
                        width: '100%',
                        padding: '4px 8px',
                        borderRadius: '5px',
                        border: '1px solid #ccc',
                        boxSizing: 'border-box',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        background: '#ffffff',
                        overflow: 'hidden'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 1 }}>
                            <input
                                type="checkbox"
                                id="no-restrictions"
                                checked={excludeRestrictions}
                                onChange={(e) => setExcludeRestrictions(e.target.checked)}
                                style={{ cursor: 'pointer', flexShrink: 0 }}
                            />
                            <label htmlFor="no-restrictions" style={{ fontSize: '1.1em', cursor: 'pointer', whiteSpace: 'nowrap' }}>Restrictions</label>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '2px', flexShrink: 1 }}>
                            <input
                                type="checkbox"
                                id="no-prereqs"
                                checked={excludePrerequisites}
                                onChange={(e) => setExcludePrerequisites(e.target.checked)}
                                style={{ cursor: 'pointer', flexShrink: 0 }}
                            />
                            <label htmlFor="no-prereqs" style={{ fontSize: '1.1em', cursor: 'pointer', whiteSpace: 'nowrap' }}>Prerequisites</label>
                        </div>
                    </div>
                </div>

                {/* Col 3: Unit range (approx 30%) */}
                <div style={{ flex: '1.2 1 130px', display: 'flex', flexDirection: 'column', gap: '5px', minWidth: '110px' }}>
                    <label style={{ fontSize: '0.9em', fontWeight: 'bold', textAlign: 'center' }}>Unit range</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', height: '40px' }}>
                        <select
                            value={unitRange[0]}
                            onChange={(e) => setUnitRange([e.target.value, unitRange[1]])}
                            style={{ fontSize: '1.1em', height: '40px', width: '100%', padding: '2px', borderRadius: '5px', border: '1px solid #ccc', textAlign: 'center', boxSizing: 'border-box' }}
                        >
                            {[...Array(12).keys()].map(n => (
                                <option key={n} value={n.toString()}>{n}</option>
                            ))}
                        </select>
                        <span style={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', height: '100%' }}>-</span>
                        <select
                            value={unitRange[1]}
                            onChange={(e) => setUnitRange([unitRange[0], e.target.value])}
                            style={{ fontSize: '1.1em', height: '40px', width: '100%', padding: '2px', borderRadius: '5px', border: '1px solid #ccc', textAlign: 'center', boxSizing: 'border-box' }}
                        >
                            {[...Array(12).keys()].map(n => (
                                <option key={n + 1} value={(n + 1).toString()}>{n + 1}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            <div className="time-slider-container" style={{ marginTop: '10px', marginBottom: '10px', padding: '0 10px' }}>
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
                        // Track click handling reserved for future enhancement
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
        </div >
    );
};

export default Search;
