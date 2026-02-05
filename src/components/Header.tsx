import React from 'react';
import gearLogoInline from '../assets/gear_logo_inline.png';

interface HeaderProps {
    currentPage: 'home' | 'checklist' | 'search';
    setCurrentPage: (page: 'home' | 'checklist' | 'search') => void;
    selectedMajor: string;
    setSelectedMajor: (major: string) => void;
    showMajorDropdown: boolean;
    setShowMajorDropdown: (show: boolean) => void;
    showBannerTools: boolean;
    setShowBannerTools: (show: boolean) => void;
    handleImportFromGOLD: () => void;
    setShowResetModal: (show: boolean) => void;
    handleSearchPlat: () => void;
    setShowTimeline: (show: boolean) => void;
}

const Header: React.FC<HeaderProps> = ({
    currentPage,
    setCurrentPage,
    selectedMajor,
    setSelectedMajor,
    showMajorDropdown,
    setShowMajorDropdown,
    showBannerTools,
    setShowBannerTools,
    handleImportFromGOLD,
    setShowResetModal,
    handleSearchPlat,
    setShowTimeline
}) => {
    return (
        <div style={{ position: 'sticky', top: '0', width: '100%', zIndex: 1000 }}>
            {/* Main Navbar */}
            <div style={{ zIndex: 20 }} className="app-navbar">
                <div
                    onClick={() => setCurrentPage('home')}
                    className={`nav-item ${currentPage === 'home' ? 'active' : ''}`}
                >
                    Home
                </div>
                <div
                    onClick={(e) => {
                        if (currentPage === 'checklist') {
                            e.stopPropagation();
                            setShowMajorDropdown(!showMajorDropdown);
                        } else {
                            setCurrentPage('checklist');
                        }
                    }}
                    className={`nav-item ${currentPage === 'checklist' ? 'active' : ''}`}
                    style={{ display: 'flex', alignItems: 'center', gap: '8px', position: 'relative' }}
                >
                    {selectedMajor ? `${{
                        "CS": "CS",
                        "CompE": "CE",
                        "EE": "EE",
                        "MechE": "ME",
                        "ChemE": "ChE",
                        "Other": "N/A"
                    }[selectedMajor] || selectedMajor} Checklist` : "Checklist"}
                    {selectedMajor && currentPage === 'checklist' && <span style={{ fontSize: '0.7em' }}>▼</span>}
                    {currentPage === 'checklist' && <img src={gearLogoInline} alt="GEAR Logo" style={{ height: '1.2em', width: 'auto' }} />}

                    {showMajorDropdown && (
                        <div className="major-dropdown">
                            {[
                                { val: "CS", label: "Computer Science" },
                                { val: "CompE", label: "Computer Engineering" },
                                { val: "EE", label: "Electrical Engineering" },
                                { val: "MechE", label: "Mechanical Engineering" },
                                { val: "ChemE", label: "Chemical Engineering" },
                                { val: "Other", label: "Major not listed" }
                            ].map((major) => (
                                <div
                                    key={major.val}
                                    onClick={() => {
                                        setSelectedMajor(major.val);
                                        setShowMajorDropdown(false);
                                    }}
                                    className={`major-option ${selectedMajor === major.val ? 'selected' : ''}`}
                                >
                                    {major.label}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                <div
                    onClick={() => setCurrentPage('search')}
                    className={`nav-item ${currentPage === 'search' ? 'active' : ''}`}
                >
                    GE Search
                </div>
            </div >
            <div className={`banner-tools-dropdown ${showBannerTools ? 'expanded' : ''}`}>
                <div className="banner-tool-item" onClick={handleImportFromGOLD}>Import GOLD</div>
                <div className="banner-tool-item" onClick={() => setShowResetModal(true)}>Reset</div>
                {['CS', 'CompE', 'EE', 'MechE', 'ChemE'].includes(selectedMajor) && currentPage !== 'search' && selectedMajor !== 'Other' ? (
                    <div className="banner-tool-item" onClick={() => setShowTimeline(true)}>
                        Timeline
                    </div>
                ) : (
                    <div className="banner-tool-item" onClick={handleSearchPlat}>
                        <img src="https://ucsbplat.com/static/gaucho.png" alt="Gaucho" style={{ height: '14px' }} />
                        PLAT GEs
                    </div>
                )}
                <div className="banner-tool-item" onClick={() => window.open("https://engineering.ucsb.edu/undergraduate/academic-advising/gear-publications", "_blank")}>
                    Official GEAR
                </div>
            </div>
            <div
                className="banner-arrow-toggle"
                onClick={() => setShowBannerTools(!showBannerTools)}
            >
                <div className="hamburger-line"></div>
                <div className="hamburger-line"></div>
            </div>
        </div >
    );
};

export default Header;
