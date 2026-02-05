import React, { useState, useEffect } from 'react';
import type { ImportedCourse } from '../types';
import { calculateGPA } from '../utils/gpaUtils';
import { getUnitsForCourse } from '../utils/courseUtils';


interface HomeProps {
    studentNotes: string;
    setStudentNotes: (val: string) => void;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
    courseData: Record<string, any>;
    manualGrades: Record<string, string>;
    manualUnits: Record<string, number>;
    importedCourseHistory: ImportedCourse[];
    onEditSetup: () => void;
    isDarkMode: boolean;
    setIsDarkMode: (val: boolean) => void;
}

const Home: React.FC<HomeProps> = ({
    studentNotes,
    setStudentNotes,
    courseData,
    manualGrades,
    manualUnits,
    importedCourseHistory,
    onEditSetup,
    isDarkMode,
    setIsDarkMode
}) => {
    // --- State for What-If Sandbox ---
    // IP courses: identified from checkedItems where grade is "IP" or missing in manualGrades
    const [simulatedGrades, setSimulatedGrades] = useState<Record<string, string>>({});
    const [ipCourses, setIpCourses] = useState<string[]>([]);

    const [originalGPA, setOriginalGPA] = useState<string>("N/A");
    const [emailTooltip, setEmailTooltip] = useState<string>("Copy");

    // Resources Links
    const resources = [
        { label: "College of Engineering", url: "https://engineering.ucsb.edu/" },
        { label: "UCSB General Catalog", url: "https://catalog.ucsb.edu/" },
        { label: "CLAS", url: "http://clas.sa.ucsb.edu/" },
        { label: "Study Abroad (EAP)", url: "https://eap.ucsb.edu/" },
        { label: "Registrar", url: "https://registrar.sa.ucsb.edu/" },
        { label: "Summer Sessions", url: "https://summer.ucsb.edu/courses/course-preview" },
        { label: "Double Major & Minors", url: "https://engineering.ucsb.edu/undergraduate/academic-advising/double-majors-minors" },
        { label: "Change Engineering Major", url: "https://engineering.ucsb.edu/undergraduate/academic-advising/change-major-college-engineering" },
        { label: "Academic Advising", url: "https://engineering.ucsb.edu/undergraduate/academic-advising" },
    ];

    // Identify IP courses on mount or when dependencies change
    useEffect(() => {
        const foundIPs: string[] = [];
        const seenCleanIDs = new Set<string>();

        const isIP = (grade: string | undefined) => !grade || grade === "IP" || grade === "";

        // Helper to add if unique
        const addIfUnique = (rawName: string) => {
            const clean = rawName.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
            if (!seenCleanIDs.has(clean)) {
                seenCleanIDs.add(clean);
                foundIPs.push(rawName);
            }
        };

        // 1. Check imported history (Format is usually better, e.g. "CMPSC 32")
        if (importedCourseHistory) {
            importedCourseHistory.forEach(c => {
                if (c.grade === "IP" || !c.grade) {
                    addIfUnique(c.code);
                }
            });
        }

        // 2. Check persistent manual grades (Format might be compacted, e.g. "CMPSC32")
        Object.keys(manualGrades).forEach(course => {
            if (isIP(manualGrades[course])) {
                addIfUnique(course);
            }
        });

        // Set IPs
        setIpCourses(foundIPs);

        // Initialize simulated grades with "IP" to show no change initially.
        const initialSims: Record<string, string> = {};
        foundIPs.forEach(c => initialSims[c] = "IP");

        setSimulatedGrades(prev => {
            // preserve existing simulations if course still exists
            const next = { ...initialSims };
            Object.keys(prev).forEach(k => {
                // Check if k (previous raw name) matches any new clean ID?
                // Actually, if the raw name changed (e.g. from CMPSC32 to CMPSC 32), we might lose the sim.
                // But typically user edits one source.
                // Robust match:
                const kClean = k.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
                if (seenCleanIDs.has(kClean)) {
                    // Find the NEW raw name corresponding to this clean ID to preserve state?
                    // It's tricky. Let's just key by the current raw names in foundIPs.
                    if (foundIPs.includes(k)) {
                        next[k] = prev[k];
                    } else {
                        // Attempt to migrate state to new raw name?
                        // e.g. prev had "CMPSC32": "A", now we have "CMPSC 32".
                        // We should map it.
                        const newRaw = foundIPs.find(curr => curr.replace(/[^a-zA-Z0-9]/g, "").toUpperCase() === kClean);
                        if (newRaw) {
                            next[newRaw] = prev[k];
                        }
                    }
                }
            });
            return next;
        });

    }, [manualGrades, importedCourseHistory]);

    // Calculate GPAs
    useEffect(() => {
        // 1. Calculate Original (Current) GPA
        const { gpa: current } = calculateGPA(
            importedCourseHistory,
            manualGrades,
            manualUnits,
            courseData
        );
        setOriginalGPA(current);
    }, [manualGrades, importedCourseHistory, manualUnits, courseData, simulatedGrades]);


    // Refined Calculation Logic for Render
    const calculateSimulatedResult = () => {
        // Create a temporary manualGrades object for simulation
        const simManualGrades = { ...manualGrades };

        // Create a temporary imported history
        const simImportedHistory = importedCourseHistory.map(c => ({ ...c }));

        Object.entries(simulatedGrades).forEach(([courseRaw, simGrade]) => {
            // 1. Check manual grades (keys are clean codes)
            const clean = courseRaw.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
            if (simManualGrades[clean] !== undefined) {
                simManualGrades[clean] = simGrade;
            }

            // 2. Check imported history
            // We need to match robustly (ignoring spaces) because 'courseRaw' might be "MATH4A" (from manual)
            // but imported might be "MATH 4A".
            const importedIdx = simImportedHistory.findIndex(c => {
                const cClean = c.code.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
                return cClean === clean;
            });

            if (importedIdx !== -1) {
                simImportedHistory[importedIdx].grade = simGrade;

                // Force institution to UCSB if invalid or missing, so calculateGPA includes it
                const validInsts = ["UCSB", "UCSC", "UCSD", "UCI", "UCR", "UCD", "UCM", "UCLA"];
                if (!simImportedHistory[importedIdx].institution || !validInsts.includes(simImportedHistory[importedIdx].institution)) {
                    simImportedHistory[importedIdx].institution = "UCSB";
                }

                // Ensure units are valid (default to 4 if missing/0 for typical GE simulation)
                if (!simImportedHistory[importedIdx].units || simImportedHistory[importedIdx].units === 0) {
                    // Try to find in courseData dynamically
                    // We use the raw code matching logic from getUnitsForCourse
                    const foundUnits = getUnitsForCourse(courseRaw, manualUnits, courseData);
                    simImportedHistory[importedIdx].units = foundUnits > 0 ? foundUnits : 4.0;
                }
            }
        });

        const { gpa: sim } = calculateGPA(
            simImportedHistory,
            simManualGrades,
            manualUnits,
            courseData
        );

        const origVal = parseFloat(originalGPA) || 0;
        const simVal = parseFloat(sim) || 0;
        const diff = simVal - origVal;
        const sign = diff >= 0 ? "+" : "";

        return { sim, diff: `${sign}${diff.toFixed(2)}` };
    };

    const result = calculateSimulatedResult();

    const availableGrades = ["IP", "A+", "A", "A-", "B+", "B", "B-", "C+", "C", "C-", "D+", "D", "D-", "F"];

    return (
        <div className="page-container active-page" style={{ padding: '10px 20px 20px', maxWidth: '800px', margin: '0 auto' }}>
            <h2 style={{ marginTop: '0', color: '#003660' }}>Dashboard</h2>

            <div className="dashboard-grid" style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {/* Section 1: Notes */}
                <div className="card" style={{ padding: '15px', backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>
                    <h3 style={{ marginTop: 0, color: '#003660' }}>
                        Notes
                    </h3>
                    <textarea
                        value={studentNotes}
                        onChange={(e) => setStudentNotes(e.target.value)}
                        placeholder="What do you want to remember?"
                        style={{
                            width: '96%',
                            height: '70px',
                            padding: '10px',
                            borderRadius: '4px',
                            border: '1px solid #ccc',
                            resize: 'vertical',
                            fontFamily: 'inherit'
                        }}
                    />
                </div>

                {/* Section 2: What-If Calculator */}
                <div className="card" style={{ padding: '15px', backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>
                    <h3 className="dashboard-section-title" style={{ marginTop: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span>
                            What-If GPA
                        </span>
                        <span className="fun-label">
                            For Fun
                        </span>
                    </h3>

                    <div style={{ marginBottom: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                        <div>
                            <div className="gpa-label">Current GPA</div>
                            <div className="gpa-value">{originalGPA}</div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <div className="gpa-label">Simulated GPA</div>
                            <div className="gpa-value" style={{ color: result.diff.includes("-") ? '#d9534f' : '#28a745' }}>
                                {result.sim} <span style={{ fontSize: '0.6em' }}>({result.diff})</span>
                            </div>
                        </div>
                    </div>

                    {ipCourses.length === 0 ? (
                        <div style={{ fontStyle: 'italic', color: '#888', textAlign: 'center', padding: '20px' }}>
                            No "In Progress" courses found directly in your checklist to simulate.
                        </div>
                    ) : (
                        <div style={{ maxHeight: '200px', overflowY: 'auto', display: 'grid', gridTemplateColumns: `repeat(${Math.min(ipCourses.length, 4)}, 1fr)`, gap: '10px' }}>
                            {ipCourses.map(course => (
                                <div key={course} className="sim-course-item">
                                    <span className="sim-course-code">{course}</span>
                                    <select
                                        value={simulatedGrades[course] || "IP"}
                                        onChange={(e) => setSimulatedGrades(prev => ({ ...prev, [course]: e.target.value }))}
                                        style={{ padding: '2px', width: 'auto', fontSize: '0.8em' }}
                                    >
                                        {availableGrades.map(g => (
                                            <option key={g} value={g}>{g}</option>
                                        ))}
                                    </select>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Section 3: Resources */}
                <div className="card" style={{ padding: '15px', backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>
                    <h3 style={{ marginTop: 0, color: '#003660' }}>
                        <span style={{ marginRight: '8px' }}>🔗</span>
                        Resources:
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '8px' }}>
                        {resources.map(r => (
                            <a
                                key={r.label}
                                href={r.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="resource-link"
                            >
                                {r.label} ↗
                            </a>
                        ))}
                    </div>
                </div>

                {/* Section 4: Info */}
                <div className="card" style={{ padding: '15px', backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>
                    <h3 style={{ marginTop: 0, color: '#003660' }}>
                        Other:
                    </h3>
                    <div style={{ fontSize: '1.0em', color: '#333' }}>
                        <a
                            href="https://chromewebstore.google.com/detail/gaucho-gear-interactive/opelfmkhlebjjkempbpeejadcoeoknlg"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="web-store-link"
                        >
                            Chrome Web Store - Leave a review :D ↗
                        </a>
                        <p style={{ margin: 0 }}>
                            <span
                                className="email-copy-link"
                                data-tooltip={emailTooltip}
                                onClick={() => {
                                    navigator.clipboard.writeText("gear.interactive.help@gmail.com");
                                    setEmailTooltip("Copied!");
                                    setTimeout(() => setEmailTooltip("Copy"), 2000);
                                }}
                                onMouseLeave={() => setTimeout(() => setEmailTooltip("Copy"), 2000)}
                            >
                                gear.interactive.help@gmail.com 📧
                            </span> | <a href="https://forms.gle/SQXUHP6uz2TAXcs19" target="_blank" rel="noopener noreferrer">Anonymous Google Form</a>
                        </p>
                    </div>
                </div>

                {/* Section 5: Theme Switcher */}
                <div className="card" style={{ padding: '15px', backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>
                    <h3 style={{ marginTop: 0, color: '#003660' }}>
                        Theme
                    </h3>
                    <div style={{ display: 'flex', gap: '30px', justifyContent: 'center' }}>
                        <button
                            onClick={() => setIsDarkMode(false)}
                            style={{
                                background: 'none',
                                border: isDarkMode ? '1px solid #ccc' : '2px solid #003660',
                                borderRadius: '8px',
                                padding: '4px',
                                fontSize: '1.4em',
                                cursor: 'pointer',
                                opacity: isDarkMode ? 0.6 : 1,
                                transition: 'all 0.2s',
                                width: '30%'
                            }}
                            title="Light Mode"
                        >
                            ☀️
                        </button>
                        <button
                            onClick={() => setIsDarkMode(true)}
                            style={{
                                background: 'none',
                                border: !isDarkMode ? '1px solid #ccc' : '2px solid #BB86FC',
                                borderRadius: '8px',
                                padding: '4px',
                                fontSize: '1.4em',
                                cursor: 'pointer',
                                opacity: !isDarkMode ? 0.6 : 1,
                                transition: 'all 0.2s',
                                width: '30%'
                            }}
                            title="Dark Mode"
                        >
                            🌙
                        </button>
                    </div>
                </div>



                {/* Section 6: Back to Setup */}
                <div style={{ textAlign: 'center', marginTop: '0px' }}>
                    <button
                        onClick={onEditSetup}
                        className="nav-button secondary"
                        style={{ width: '100%', padding: '10px' }}
                    >
                        Edit High School Credits
                    </button>
                    <p style={{ fontSize: '0.8em', color: '#777', marginTop: '15px' }}>
                        Need to change your High School credits?
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Home;
