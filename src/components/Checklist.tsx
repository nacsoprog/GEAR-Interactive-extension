import React from 'react';

import type { ChecklistState, CreditSource } from '../types';
import { getUnitsForCourse, getCourseDetails } from '../utils/courseUtils';
import { GOLD_SUBJECTS } from '../data/goldSubjects';
import { COURSE_GROUPS } from '../data/courseGroups';
import { MAJOR_REQUIREMENTS } from '../data/majorRequirements';
import { UPPER_DIV_ELECTIVES, SCIENCE_ELECTIVES } from '../data/electives';
import { GE_AREAS, ALL_SECTIONS } from '../data/geAreas';
import { CREDIT_TO_UCSB_MAP } from '../data/HighSchoolCredit';
import { ALL_UNITS } from '../data/creditSystems';
import type { ImportedCourse } from '../types';

interface ChecklistProps {
    selectedMajor: string;
    checkedItems: ChecklistState;
    handleCheckToggle: (id: string) => void;
    inputCourse: string;
    setInputCourse: (val: string) => void;
    setActionStatus: (val: string) => void;
    handleUpdateChecklist: (add: boolean) => void;
    handleRemoveCourse: () => void;
    handleShowCourseInfo: () => void;
    handleReload: () => void;
    isReloading: boolean;
    manualUnits: Record<string, number>;
    courseData: Record<string, any>;
    setSliderConfig: (config: { min: number, max: number, current: number } | null) => void;
    sliderConfig: { min: number, max: number, current: number } | null;
    handleSubjectSearch: (subject: string) => void;
    collapsedSections: ChecklistState;
    toggleCollapse: (id: string) => void;
    creditSources: CreditSource;
    handleMoveGE: (sourceLabel: string, reqId: string, targetArea: string) => void;
    coursesGOLD: string[];
    gpa: string;
    totalUnits: number;
    showFloatingInstructions: boolean;
    setShowFloatingInstructions: (show: boolean) => void;
    setSelectedCourse: (course: string | null) => void;
    expandedPrereqs: Record<string, boolean>;
    setExpandedPrereqs: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
    expandedA2: boolean;
    setExpandedA2: (val: boolean) => void;
    collapsedNotes: Record<string, boolean>;
    setCollapsedNotes: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
    actionStatus: string;
    courseSearchInfo: React.ReactNode;
    inputHistory: string[];
    setCurrentPage: (page: 'home' | 'checklist' | 'search') => void;
    setSelectedSearchFilter: (filter: string | null) => void;
    setHighlightedFilters: (filters: string[]) => void;
    removedCourses: string[];
    handleToggleRemoved: (course: string) => void;
    highlightedCourse: string | null;
    setHighlightedCourse: (course: string | null) => void;
    // For Generic View (Major not listed)
    importedCourseHistory: ImportedCourse[];
    addedCourses: string[];
}

const Checklist: React.FC<ChecklistProps> = ({
    selectedMajor,
    checkedItems,
    handleCheckToggle,
    inputCourse,
    setInputCourse,
    setActionStatus,
    handleUpdateChecklist,
    handleRemoveCourse,
    handleShowCourseInfo,
    handleReload,
    isReloading,
    manualUnits,
    courseData,
    setSliderConfig,
    sliderConfig,
    handleSubjectSearch,
    collapsedSections,
    toggleCollapse,
    creditSources,
    handleMoveGE,
    coursesGOLD,
    gpa,
    totalUnits,
    showFloatingInstructions,
    setShowFloatingInstructions,
    setSelectedCourse,
    expandedPrereqs,
    setExpandedPrereqs,
    expandedA2,
    setExpandedA2,
    collapsedNotes,
    setCollapsedNotes,
    actionStatus,
    courseSearchInfo,
    inputHistory,
    setCurrentPage,
    setSelectedSearchFilter,
    setHighlightedFilters,
    removedCourses,
    handleToggleRemoved,
    highlightedCourse,
    setHighlightedCourse,
    importedCourseHistory,
    addedCourses
}) => {
    const [historyIndex, setHistoryIndex] = React.useState(-1);
    // State for email tooltip
    const [emailTooltip, setEmailTooltip] = React.useState("Copy");
    const incompleteSections: any[] = [];

    const completeSections: any[] = [];

    // Effect to handle scrolling and highlighting
    React.useEffect(() => {
        if (highlightedCourse) {
            const cleanCourseName = highlightedCourse.replace(/\s+/g, '');
            const element = document.getElementById(`course-${cleanCourseName}`);

            if (element) {
                // Scroll to element
                element.scrollIntoView({ behavior: 'smooth', block: 'center' });

                // Add highlight class
                const isDarkMode = document.body.classList.contains('dark-mode');
                const highlightClass = isDarkMode ? 'flash-highlight-dark' : 'flash-highlight';
                element.classList.add(highlightClass);

                // Remove highlight after animation
                const timer = setTimeout(() => {
                    element.classList.remove(highlightClass);
                    setHighlightedCourse(null);
                }, 2200);

                return () => clearTimeout(timer);
            } else {

            }
        }
    }, [highlightedCourse]);

    // Display unit requirements and progress for relevant groups
    const getSectionStatus = (sec: any) => {
        if (sec.type !== 'electives' && sec.type !== 'sciA' && sec.type !== 'sciB' && sec.type !== 'prep' && sec.type !== 'upper') return "";
        let reqUnits = 0;
        let currentUnits = 0;
        const sumUnits = (list: string[]) => {
            list.forEach(item => {
                if (item.startsWith("GROUP:")) {
                    const groupKey = item.split(":")[1];
                    const group = COURSE_GROUPS[groupKey];
                    if (group) {
                        const activeOption = group.options.find(opt => opt.courses.every(c => checkedItems[c]));
                        if (activeOption) currentUnits += activeOption.units;
                    }
                } else {
                    if (checkedItems[item]) {
                        currentUnits += getUnitsForCourse(item, manualUnits, courseData);
                    }
                }
            });
        };

        if (sec.type === 'prep') {
            reqUnits = MAJOR_REQUIREMENTS[selectedMajor]?.prepUnits || 0;
            sumUnits(MAJOR_REQUIREMENTS[selectedMajor]?.prep || []);
        } else if (sec.type === 'electives') {
            // logic for special electives
            const electiveList = UPPER_DIV_ELECTIVES[selectedMajor] || [];
            sumUnits(electiveList);

            if (selectedMajor === "ChemE") reqUnits = 15;
            else if (selectedMajor === "MechE") reqUnits = 15;
            else if (selectedMajor === "EE") {
                const has153A = checkedItems["ECE 153A"];
                const has153B = checkedItems["ECE 153B"];
                reqUnits = (has153A && has153B) ? 32 : 36;
            }
            else if (selectedMajor === "CompE") {
                const has189A = checkedItems["ECE189A"];
                const has189B = checkedItems["ECE189B"];
                const has189C = checkedItems["ECE189C"];
                reqUnits = (has189A && has189B && has189C) ? 36 : 40;
            } else reqUnits = 56;
        } else if (sec.type === 'sciA') {
            reqUnits = 8;
            sumUnits(SCIENCE_ELECTIVES["List A"]);
        } else if (sec.type === 'sciB') {
            reqUnits = 12;
            sumUnits(SCIENCE_ELECTIVES["List B"]);
        } else if (sec.type === 'upper') {
            if (selectedMajor === 'EE') {
                const has153A = checkedItems["ECE153A"];
                const has153B = checkedItems["ECE153B"];
                reqUnits = (has153A && has153B) ? 32 : 28;
            } else {
                reqUnits = MAJOR_REQUIREMENTS[selectedMajor]?.upperUnits || 999;
            }
            sumUnits(MAJOR_REQUIREMENTS[selectedMajor]?.upper || []);
        }

        return `(Current: ${currentUnits} / Required: ${reqUnits} Units)`;
    };

    // only CS has science electives
    const validSections = ALL_SECTIONS.filter(sec => {
        if (sec.type === 'sciA' || sec.type === 'sciB') {
            return selectedMajor === 'CS';
        }
        return true;
    });

    validSections.forEach(section => {
        const parentId = section.type === 'ge' ? section.id : `${section.id}-complete`;
        if (checkedItems[parentId]) {
            completeSections.push(section);
        } else {
            incompleteSections.push(section);
        }
    });

    const sortedSections = [...incompleteSections, ...completeSections];

    const filterToSectionId: Record<string, string> = {
        "Entry Level Writ": "section-container-univ-req",
        "American H&I": "section-container-univ-req",
        "A1": "section-container-Area A: English Reading & Comprehension",
        "A2": "section-container-Area A: English Reading & Comprehension",
        "D": "section-container-Area D: Social Science",
        "E": "section-container-Area E: Culture and Thought",
        "F": "section-container-Area F: The Arts",
        "G": "section-container-Area G: Literature",
        "Writ": "section-container-Writing Requirement",
        "Ethn": "section-container-Special Subject Areas",
        "Euro Trad/Wrld Cult": "section-container-Special Subject Areas",
        "Major Prep": "section-container-major-prep",
        "Upper Div": "section-container-major-upper",
        "Major Elecs": "section-container-major-electives",
        "Sci A": "section-container-science-electives-a",
        "Sci B": "section-container-science-electives-b"
    };

    const handleUnfulfilledClick = (filter: string) => {
        const containerId = filterToSectionId[filter];
        if (containerId) {
            // Extract original sectionId from the container ID for state updates
            const sectionId = containerId.replace('section-container-', '');
            if (collapsedSections[sectionId]) toggleCollapse(sectionId);

            if (sectionId === "univ-req") {
                setCollapsedNotes(prev => ({ ...prev, [sectionId]: false }));
            }
            setTimeout(() => {
                const element = document.getElementById(containerId);
                if (element) {
                    const y = element.getBoundingClientRect().top + window.scrollY - 180;
                    window.scrollTo({ top: y, behavior: 'smooth' });
                    element.classList.add('flash-highlight');
                    setTimeout(() => {
                        element.classList.remove('flash-highlight');
                    }, 2200);
                }
            }, 100);
        }
    };

    const handleGEClick = (e: React.MouseEvent, sectionId: string, subReqLabel?: string) => {
        e.preventDefault();
        e.stopPropagation();

        const mapping: Record<string, string> = {
            "A-1": "A1",
            "A-2": "A2",
            "D-1": "D",
            "D-2": "D",
            "E-1": "E",
            "E-2": "E",
            "F-1": "F",
            "G-1": "G",
            "Ethnicity": "Ethnicity",
            "European Traditions or World Cultures": "European Traditions",
            "Writing Requirement": "Writing",
            "Entry Level Writing": "Entry Level Writing",
            "American History and Institutions": "American H & I"
        };

        let filter = "";

        // Direct mapping from subReqLabel (e.g. "A-1", "Ethnicity", "European Traditions or World Cultures")
        if (subReqLabel && mapping[subReqLabel]) {
            filter = mapping[subReqLabel];
        }
        // Mapping from section type if needed (e.g. "Writing Requirement")
        else if (sectionId.includes("Writing") && mapping["Writing Requirement"]) {
            filter = mapping["Writing Requirement"];
        }
        else if (subReqLabel === "Writing-1" || subReqLabel === "Writing-2" || subReqLabel === "Writing-3" || subReqLabel === "Writing-4") {
            filter = "Writing";
        }

        if (subReqLabel === "European Traditions or World Cultures") {
            setHighlightedFilters(["European Traditions", "World Cultures"]);
            setCurrentPage('search');
            return;
        }

        if (filter) {
            setSelectedSearchFilter(filter);
            setCurrentPage('search');
        }
    };

    const renderCourseLink = (courseCode: string) => {
        return (
            <span
                onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setSelectedCourse(courseCode);
                }}
                style={{ color: 'inherit', cursor: 'pointer' }}
                className="course-link"
            >
                {courseCode}
            </span>
        );
    };

    // render units and prerequisites for courses
    const renderCourseItem = (course: string, options?: { allowRemoval?: boolean, allowRestore?: boolean }) => {
        const details = getCourseDetails(course, courseData);
        const isChecked = !!checkedItems[course];

        const units = (details && !isChecked) ? <span className="course-units">  {details.units}u</span> : "";

        // Prerequisite logic
        const hasPrereq = details && details.prerequisites !== "N/A";
        const isPrereqExpanded = expandedPrereqs[course];

        const prereqToggle = (hasPrereq && !isChecked) ? (
            <span
                onClick={(e) => {
                    e.preventDefault();
                    setExpandedPrereqs(prev => ({ ...prev, [course]: !prev[course] }));
                }}
                className="prereq-toggle"
            >
                {isPrereqExpanded ? "Prereq:" : "Prereq"}
            </span>
        ) : null;

        const prereqText = (hasPrereq && !isChecked && isPrereqExpanded) ? ` ${details.prerequisites}` : "";

        // If allowRemoval is true and course IS removed, don't render it here
        if (options?.allowRemoval && removedCourses.includes(course)) {
            return null;
        }

        const showRemove = options?.allowRemoval && !removedCourses.includes(course);
        const showRestore = options?.allowRestore;

        const sourceLabel = creditSources[course];
        // Major validation: C or higher required. Fail if C-, D, F, NP, P
        const majorFails = ["(C-)", "(D+)", "(D)", "(D-)", "(F)", "(NP)", "(P)"];
        const isFailing = sourceLabel && majorFails.some(fail => sourceLabel.includes(fail));
        const sourceBaseClass = coursesGOLD.includes(course) ? "credit-source-GOLD" : (CREDIT_TO_UCSB_MAP[sourceLabel] ? "courses-HS" : "credit-source");
        const sourceClass = isFailing ? `${sourceBaseClass} failing-grade` : sourceBaseClass;

        return (
            <li key={course} id={`course-${course.replace(/\s+/g, '')}`} style={{ position: 'relative' }}>
                <input type="checkbox" id={course} checked={isChecked} onChange={() => handleCheckToggle(course)} />
                <label htmlFor={course}>
                    {renderCourseLink(course)} <span style={{ fontSize: '0.8em', color: '#555' }}>
                        {units}
                        {prereqToggle}
                        {prereqText}
                    </span>
                    {sourceLabel && <span className={sourceClass}> {sourceLabel}</span>}
                </label>
                {showRemove && (
                    <div
                        className="remove-course-btn"
                        onClick={(e) => { e.preventDefault(); handleToggleRemoved(course); }}
                        title="Remove course"
                    >
                        −
                    </div>
                )}
                {showRestore && (
                    <div
                        className="restore-course-btn"
                        onClick={(e) => { e.preventDefault(); handleToggleRemoved(course); }}
                        title="Restore course"
                    >
                        +
                    </div>
                )}
            </li>
        );
    };

    // render groups
    const renderGroupItem = (groupKey: string, options?: { allowRemoval?: boolean, allowRestore?: boolean }) => {
        const group = COURSE_GROUPS[groupKey];
        if (!group) return null;

        const removeId = `GROUP:${groupKey}`;

        // If allowRemoval is true and group IS removed, don't render it here
        if (options?.allowRemoval && removedCourses.includes(removeId)) {
            return null;
        }

        const showRemove = options?.allowRemoval && !removedCourses.includes(removeId);
        const showRestore = options?.allowRestore;

        let isAnyOptionComplete = false;
        group.options.forEach((opt) => {
            if (opt.courses.every(c => checkedItems[c])) {
                isAnyOptionComplete = true;
            }
        });
        return (
            <li key={group.id} className="group-container" style={{ flexDirection: 'column', alignItems: 'flex-start', position: 'relative' }}>
                <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>{group.name} (Select one set):</div>
                {group.options.map((opt, idx) => {
                    const isThisOptionComplete = opt.courses.every(c => checkedItems[c]);
                    const isOtherOptionComplete = isAnyOptionComplete && !isThisOptionComplete;
                    return (
                        <div key={idx} style={{
                            textDecoration: isOtherOptionComplete ? 'line-through' : 'none',
                            color: isOtherOptionComplete ? '#aaa' : 'inherit',
                            marginBottom: '4px'
                        }}>
                            <span style={{ fontSize: '0.9em' }}>Option {idx + 1}: {opt.units} units</span>
                            <div style={{ marginLeft: '5px' }}>
                                {opt.courses.map(c => (
                                    <div key={c} id={`course-${c.replace(/\s+/g, '')}`} style={{ display: 'flex', alignItems: 'center' }}>
                                        <input
                                            type="checkbox"
                                            id={c}
                                            checked={!!checkedItems[c]}
                                            onChange={() => handleCheckToggle(c)}
                                            disabled={isOtherOptionComplete}
                                        />
                                        <label htmlFor={c}>{renderCourseLink(c)}</label>
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}
                {showRemove && (
                    <div
                        className="remove-course-btn"
                        onClick={(e) => { e.preventDefault(); handleToggleRemoved(removeId); }}
                        title="Remove group"
                        style={{ top: '15px' }}
                    >
                        −
                    </div>
                )}
                {showRestore && (
                    <div
                        className="restore-course-btn"
                        onClick={(e) => { e.preventDefault(); handleToggleRemoved(removeId); }}
                        title="Restore group"
                        style={{ top: '15px' }}
                    >
                        +
                    </div>
                )}
            </li>
        );
    };

    return (
        <div className="page-container active-page">
            <div className="form-group" style={{ marginTop: '5px', marginBottom: '7px' }}>
                <label className="manual-label"> Type in one Course or Subject Area (no grade defaults to "IP")</label>
                <div style={{ display: 'flex', gap: '5px' }}>
                    <input style={{ height: '30px' }}
                        type="text"
                        placeholder="exs: Math 2A(A-), engl22, Writ"
                        value={inputCourse}
                        onChange={(e) => {
                            setInputCourse(e.target.value)
                            setActionStatus('');
                            setHistoryIndex(-1);
                        }}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                const courseName = inputCourse.toUpperCase().trim();
                                const searchName = courseName.replace(/\s+/g, '');

                                if (!courseName) return;

                                // Search for course in sections
                                let foundSectionId: string | null = null;
                                let found = false;

                                // Check in sortedSections (which includes both incomplete and complete)
                                for (const section of sortedSections) {
                                    let sectionHasCourse = false;

                                    if (section.type === 'univ') {
                                        // univ type hardcoded checks or notes?
                                        if (["Entry Level Writing", "American History and Institutions"].some(s => s.replace(/\s+/g, '').toUpperCase() === searchName)) {
                                            sectionHasCourse = true;
                                        }
                                    } else if (section.type === 'ge') {
                                        if (section.subReqs && section.subReqs.some((sub: string) => `${section.id}-${sub}`.replace(/\s+/g, '').toUpperCase().includes(searchName))) {
                                            // This might be too loose for partial matches, but let's stick to exact or close exact
                                            // The subReqs are like "A-1", "A-2". 
                                            // If user types "A1", we should match "A-1".
                                            if (section.subReqs.some((sub: string) => {
                                                const fullId = `${section.id}-${sub}`;
                                                return fullId.replace(/\s+/g, '').toUpperCase().includes(searchName) || sub.replace(/\s+/g, '').toUpperCase() === searchName;
                                            })) {
                                                sectionHasCourse = true;
                                            }
                                        }
                                    } else if (section.type === 'prep') {
                                        const rawList = MAJOR_REQUIREMENTS[selectedMajor]?.prep || [];
                                        if (rawList.some((c: string) => c.replace(/\s+/g, '') === searchName)) sectionHasCourse = true;
                                        // Check groups
                                        rawList.forEach((item: string) => {
                                            if (item.startsWith("GROUP:")) {
                                                const groupKey = item.split(":")[1];
                                                const group = COURSE_GROUPS[groupKey];
                                                if (group && group.options.some(opt => opt.courses.some(c => c.replace(/\s+/g, '') === searchName))) {
                                                    sectionHasCourse = true;
                                                }
                                            }
                                        });
                                    } else if (section.type === 'upper') {
                                        const rawList = MAJOR_REQUIREMENTS[selectedMajor]?.upper || [];
                                        if (rawList.some((c: string) => c.replace(/\s+/g, '') === searchName)) sectionHasCourse = true;
                                        rawList.forEach((item: string) => {
                                            if (item.startsWith("GROUP:")) {
                                                const groupKey = item.split(":")[1];
                                                const group = COURSE_GROUPS[groupKey];
                                                if (group && group.options.some(opt => opt.courses.some(c => c.replace(/\s+/g, '') === searchName))) {
                                                    sectionHasCourse = true;
                                                }
                                            }
                                        });
                                    } else if (section.type === 'electives') {
                                        const list = UPPER_DIV_ELECTIVES[selectedMajor] || [];
                                        if (list.some((c: string) => c.replace(/\s+/g, '') === searchName)) sectionHasCourse = true;
                                    } else if (section.type === 'sciA') {
                                        if (SCIENCE_ELECTIVES["List A"].some((c: string) => c.replace(/\s+/g, '') === searchName)) sectionHasCourse = true;
                                    } else if (section.type === 'sciB') {
                                        if (SCIENCE_ELECTIVES["List B"].some((c: string) => c.replace(/\s+/g, '') === searchName)) sectionHasCourse = true;
                                    }

                                    if (sectionHasCourse) {
                                        foundSectionId = section.id;
                                        found = true;
                                        break;
                                    }
                                }

                                // Also allow finding by just typing the course name even if it's inside a group
                                // The above logic covers most static lists.

                                if (found && foundSectionId) {
                                    // Expand section if needed
                                    if (collapsedSections[foundSectionId]) {
                                        toggleCollapse(foundSectionId);
                                    }
                                    setHighlightedCourse(searchName);
                                    setActionStatus('');

                                } else {
                                    setActionStatus(`"${courseName}" not found in checklist requirements.`);
                                }

                                setHistoryIndex(-1);
                            } else if (e.key === 'ArrowUp') {
                                e.preventDefault();
                                if (inputHistory.length > 0) {
                                    const newIndex = Math.min(historyIndex + 1, inputHistory.length - 1);
                                    setHistoryIndex(newIndex);
                                    setInputCourse(inputHistory[newIndex]);
                                }
                            } else if (e.key === 'ArrowDown') {
                                e.preventDefault();
                                if (historyIndex > 0) {
                                    const newIndex = historyIndex - 1;
                                    setHistoryIndex(newIndex);
                                    setInputCourse(inputHistory[newIndex]);
                                } else if (historyIndex === 0) {
                                    setHistoryIndex(-1);
                                    setInputCourse(""); // Or potentially the drafts before navigation? For now empty is fine.
                                }
                            }
                        }}
                    />
                    <button className="nav-button secondary add-course-btn" style={{ height: '30px' }} onClick={() => handleUpdateChecklist(true)}>Add</button>
                    <button className="nav-button danger" style={{ width: 'auto', padding: '6px 12px', height: '30px' }} onClick={() => handleRemoveCourse()}>Remove</button>
                    <button className="nav-button secondary info-btn" style={{ height: '30px' }} onClick={handleShowCourseInfo}>Info</button>
                    <button
                        onClick={handleReload}
                        className="nav-button secondary reload-btn"
                        style={{
                            height: '30px',
                            minWidth: '35px',
                            padding: '6px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            backgroundColor: 'transparent',
                            color: '#3b8347ff'
                        }}
                        title="Refresh Checklist"
                    >
                        <div style={{
                            display: 'inline-block',
                            transition: 'transform 0.2s ease',
                            fontSize: '1.9em',
                            color: isReloading ? '#42d189ff' : '#3b8347ff'
                        }}>
                            ⟳
                        </div>
                    </button>
                </div>
                {(() => {
                    const inputUpper = inputCourse.toUpperCase().trim();
                    if (!inputUpper) return null;
                    // find longest matching prefix
                    const matchedKey = Object.keys(GOLD_SUBJECTS)
                        .filter(key => inputUpper.startsWith(key))
                        .sort((a, b) => b.length - a.length)[0];

                    if (matchedKey) {
                        return (
                            <div style={{ marginTop: '5px', marginLeft: '5px', fontSize: '0.9em' }}>
                                <a href="#"
                                    onClick={(e) => { e.preventDefault(); handleSubjectSearch(GOLD_SUBJECTS[matchedKey]); }}
                                    style={{ color: '#cc9900ff', textDecoration: 'underline', fontStyle: 'italic', fontWeight: 'bold' }}>
                                    Search for {matchedKey} on GOLD
                                </a>
                            </div>
                        );
                    }
                    return null;
                })()}
                {sliderConfig && (
                    <div style={{ marginTop: '5px', marginLeft: '8px', display: 'flex', alignItems: 'center' }}>
                        <label style={{ marginRight: '10px', fontSize: '0.9em' }}>Units: {sliderConfig.current}</label>
                        <input
                            type="range"
                            min={sliderConfig.min}
                            max={sliderConfig.max}
                            step="1"
                            value={sliderConfig.current}
                            onChange={(e) => setSliderConfig({ ...sliderConfig, current: parseInt(e.target.value) })}
                            style={{ width: '150px' }}
                        />
                        <button
                            style={{
                                marginLeft: '10px',
                                fontSize: '0.8em',
                                padding: '0px 8px',
                                height: '24px',
                                lineHeight: '22px',
                                flex: 'none',
                                width: 'auto',
                                backgroundColor: '#f0f7ff', /* Lighter blue */
                                color: '#004275ff',
                                border: '0.3px solid #004275ff'
                            }}
                            className="nav-button secondary"
                            onClick={() => setSliderConfig(null)}
                        >
                            Set {inputCourse ? inputCourse.toUpperCase().trim() : "COURSE"} to {sliderConfig.current} unit(s)
                        </button>
                    </div>
                )}
                {actionStatus && (
                    <div style={{ color: actionStatus.includes("added") ? '#28a745' : '#d9534f', fontSize: '1em', marginTop: '5px', marginLeft: '8px', fontStyle: 'italic' }}>
                        {actionStatus}
                    </div>
                )}
                {courseSearchInfo && (
                    <div style={{ marginTop: '10px', whiteSpace: 'pre-wrap' }}>
                        {courseSearchInfo}
                    </div>
                )}
            </div>


            {selectedMajor === 'Other' ? (
                // --- Generic View: List all courses ---
                <div className="generic-checklist-container">
                    <h3 style={{
                        marginTop: '20px',
                        marginBottom: '10px',
                        color: '#003660',
                        borderBottom: '1px solid #ddd',
                        paddingBottom: '5px'
                    }}>
                        Your Course History
                    </h3>
                    <div className="instructions" style={{ marginBottom: '15px', fontStyle: 'italic' }}>
                        Sorry that we don't have your major yet... You can still use other features within this extension though! If you want to help us add your major, please reach out via <span
                            className="email-copy-link"
                            data-tooltip={emailTooltip}
                            onClick={() => {
                                navigator.clipboard.writeText("gear.interactive.help@gmail.com");
                                setEmailTooltip("Copied!");
                                setTimeout(() => setEmailTooltip("Copy"), 2000);
                            }}
                            onMouseLeave={() => setTimeout(() => setEmailTooltip("Copy"), 2000)}
                            style={{ cursor: 'pointer', textDecoration: 'underline' }}
                        >
                            gear.interactive.help@gmail.com
                        </span> or fill out the <a href="https://forms.gle/SQXUHP6uz2TAXcs19" target="_blank" rel="noopener noreferrer">google form</a> :D
                    </div>

                    <ul className="checklist" style={{ paddingBottom: '60px' }}>
                        {/* 1. Imported Courses from GOLD */}
                        {importedCourseHistory.map((course, idx) => {
                            const details = getCourseDetails(course.code, courseData);
                            const geAreas = details && details.general_area ? details.general_area.join(", ") : "";

                            return (
                                <li key={`gold-${idx}`} className="nested-section" style={{ display: 'block', padding: '10px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                        <div>
                                            {renderCourseLink(course.code)}
                                            <span style={{ fontWeight: 'bold', marginLeft: '8px' }}>{course.title}</span>
                                        </div>
                                        <div style={{ textAlign: 'right', fontSize: '0.9em' }}>
                                            <span className="credit-source-GOLD" style={{ display: 'inline-block', marginBottom: '2px' }}>GOLD</span>
                                        </div>
                                    </div>
                                    <div className="generic-course-details">
                                        <span><strong>Grade |</strong> {course.grade}</span>
                                        <span><strong>Units |</strong> {course.units}</span>
                                        <span><strong>Term |</strong> {course.term}</span>
                                        {geAreas && <span><strong>GE Areas |</strong> {geAreas}</span>}
                                    </div>
                                </li>
                            );
                        })}

                        {/* 2. Manual Added Courses */}
                        {addedCourses.map((entry, idx) => {
                            // entry format "CODE (GRADE)" or just "CODE"
                            const part = entry.split('(')[0].trim();
                            const match = entry.match(/\(([^)]+)\)/);
                            const grade = match ? match[1] : "IP";
                            const cleanCode = part.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
                            const details = getCourseDetails(cleanCode, courseData);
                            const geAreas = details && details.general_area ? details.general_area.join(", ") : "";
                            const title = details && details.full_course_name ? details.full_course_name.split(' - ')[1] || "" : "";
                            const units = getUnitsForCourse(cleanCode, manualUnits, courseData);

                            return (
                                <li key={`manual-${idx}`} className="nested-section" style={{ display: 'block', padding: '10px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                        <div>
                                            {renderCourseLink(cleanCode)}
                                            {title && <span style={{ fontWeight: 'bold', marginLeft: '8px' }}>{title}</span>}
                                        </div>
                                        <div style={{ textAlign: 'right', fontSize: '0.9em', display: 'flex', gap: '5px', alignItems: 'center' }}>
                                            <span className="credit-source">Manual</span>
                                            <div
                                                className="remove-course-btn"
                                                onClick={(e) => { e.preventDefault(); handleCheckToggle(cleanCode); /* Re-using check toggle might not work for removal directly from this view if logic differs, but addedCourses usually removed via remove button logic? Actually checklist Logic uses handleRemoveCourse on selected item. */ }}
                                                style={{ position: 'static', marginLeft: '5px', opacity: 1 }}
                                                title="Remove logic depends on selection..." // The standard remove button at top works on input box. Here generic view might need specific remove? 
                                            // Actually, let's look at standard checklist. It has remove buttons.
                                            // handleToggleRemoved is for "Removed Courses" bin.
                                            // To delete a manual course from addedCourses, we usually verify check logic.
                                            // For now, let's just list them. The top "Remove" button works if you type the name in the box.
                                            >
                                            </div>
                                        </div>
                                    </div>
                                    <div className="generic-course-details">
                                        <span><strong>Grade:</strong> {grade}</span>
                                        <span><strong>Units:</strong> {units}</span>
                                        {geAreas && <span><strong>GE Areas:</strong> {geAreas}</span>}
                                    </div>
                                </li>
                            );
                        })}

                        {/* 3. HS Credits (from checkedItems not in addedCourses/GOLD?) */}
                        {/* 3. HS Credits */}
                        {(() => {
                            const uniqueHSCredits = new Set<string>();
                            Object.values(creditSources).forEach(source => {
                                if (CREDIT_TO_UCSB_MAP[source]) {
                                    uniqueHSCredits.add(source);
                                }
                            });

                            return Array.from(uniqueHSCredits).map((credit, idx) => (
                                <li key={`hs-${idx}`} className="nested-section" style={{ display: 'block', padding: '10px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                        <div>
                                            <span style={{ fontWeight: 'bold' }}>{credit}</span>
                                        </div>
                                        <div style={{ textAlign: 'right', fontSize: '0.9em' }}>
                                            <span className="courses-HS" style={{ display: 'inline-block', marginBottom: '2px' }}>High School</span>
                                        </div>
                                    </div>
                                </li>
                            ));
                        })()}
                    </ul>
                </div>
            ) : (
                <>
                    {(() => {
                        const unfulfilledFilters = [
                            // Entry Level Writing
                            !checkedItems["Entry Level Writing"] && "Entry Level Writ",
                            // American H & I
                            !checkedItems["American History and Institutions"] && "American H&I",
                            // Area A
                            !checkedItems["Area A: English Reading & Comprehension-A-1"] && "A1",
                            !checkedItems["Area A: English Reading & Comprehension-A-2"] && "A2",
                            // Area D (2 courses)
                            (!checkedItems["Area D: Social Science-D-1"] || !checkedItems["Area D: Social Science-D-2"]) && "D",
                            // Area E (2 courses)
                            (!checkedItems["Area E: Culture and Thought-E-1"] || !checkedItems["Area E: Culture and Thought-E-2"]) && "E",
                            // Area F
                            !checkedItems["Area F: The Arts-F-1"] && "F",
                            // Area G
                            !checkedItems["Area G: Literature-G-1"] && "G",
                            // Writing (4 courses)
                            GE_AREAS["Writing Requirement"].some(req => !checkedItems[`Writing Requirement-${req}`]) && "Writ",
                            // Ethnicity
                            !checkedItems["Special Subject Areas-Ethnicity"] && "Ethn",
                            // European Traditions / World Cultures
                            !checkedItems["Special Subject Areas-European Traditions or World Cultures"] && "Euro Trad/Wrld Cult",
                            // Major Prep
                            !checkedItems["major-prep-complete"] && "Major Prep",
                            // Upper Div
                            !checkedItems["major-upper-complete"] && "Upper Div",
                            // Major Electives
                            !checkedItems["major-electives-complete"] && "Major Elecs",
                            // Science Electives (CS only)
                            selectedMajor === 'CS' && !checkedItems["science-electives-a-complete"] && "Sci A",
                            selectedMajor === 'CS' && !checkedItems["science-electives-b-complete"] && "Sci B"
                        ].filter(Boolean) as string[];

                        if (unfulfilledFilters.length === 0) return null;

                        return (
                            <div className="unfulfilled-container">
                                <div className="unfulfilled-header">Unfulfilled Requirements:</div>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                                    {unfulfilledFilters.map(filter => (
                                        <span key={filter} onClick={() => handleUnfulfilledClick(filter)} className="unfulfilled-item">
                                            {filter}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        );
                    })()}

                    <ul className="checklist main-checklist">
                        {sortedSections.map(section => {
                            const parentId = section.type === 'ge' ? section.id : `${section.id}-complete`;
                            const collapseId = section.id;

                            let children: React.ReactNode[] = [];
                            const statusText = getSectionStatus(section);

                            // section notes
                            let notes: React.ReactNode = null;
                            if (section.type === 'upper') {
                                if (selectedMajor === 'EE') notes = <li key="n" className="note"><span className="note-content-detailed-simple">If <strong>both</strong> <strong><u>ECE 153A & 153B</u></strong> are taken, credit will be awarded for 1 as a required course and the other as a departmental elective.</span></li>;
                                if (selectedMajor === 'CompE') notes = <li key="n" className="note"><span className="note-content-detailed-simple">You may either take <strong><u>CMPSC 189 A-B</u></strong> <strong>OR</strong> <strong><u>ECE 189 A-B-C</u></strong>. The CMPSC route grants 8 total credits, so 40 elective units are needed. However, the ECE route grants 12 total credits, so only 36 elective units are needed.</span></li>;
                            }
                            if (section.type === 'electives') {
                                if (selectedMajor === 'ChemE') notes = <li key="n" className="note"><span className="note-content-detailed-simple">At least <u>9 of 15 units</u> must be from within College of Engineering: <strong>CH E, ECE, MATRL, ME</strong>. <br />⛯ Prior approval from faculty advisor. <br />⛯⛯ Three units maximum from <strong>CH E 196</strong> and <strong>CH E 198</strong> combined; only for students with GPA of 3.0 or higher.</span></li>;
                                if (selectedMajor === 'CS') notes = <li key="n" className="note"><span className="note-content-detailed-simple">At Least <u>7 of the 14</u> elective courses must be <strong>CMPSC courses</strong>. <br />⛯ Four units maximum from <strong>CMPSC 192</strong> and <strong>196</strong> combined; only for students with GPA of 3.0 or higher. ⛯⛯ <strong>CMPSC 196B</strong> only for students who have met the requirements. Please see department advisor for more information.</span></li>;
                                if (selectedMajor === 'CompE') notes = <li key="n" className="note"><span className="note-content-detailed-simple">Must include <u>at least 2</u>, ECE Department Student Office, approved <strong>sequences</strong>. <br />⛯ Prior approval of departmental electives must be obtained by faculty advisor.</span></li>;
                                if (selectedMajor === 'EE') notes = <li key="n" className="note"><span className="note-content-detailed-simple">Note: Departmental electives must include an approved <strong>depth sequence</strong> corresponding to student's chosen track, OR another <strong>depth sequence</strong> of at <u>least 4 courses</u> (advisor approval needed for latter). <strong>*1 TMP course max.</strong></span></li>;
                                if (selectedMajor === 'MechE') notes = <li key="n" className="note"><span className="note-content-detailed-simple">1 Engineering Elective Specialization Group required (*6 units*): <br />(a 2-course group) or (1 course from L1 and L2). <br />---------------------------------------------------<br />
                                    {[
                                        ["Group X:", "L1", "L2"],
                                        ["Group 1:", "BIOE 120A", "BIOE 120B"],
                                        ["Group 2:", "ME 163", "ME 155A"],
                                        ["Group 3:", "ME 127", "ME 129"],
                                        ["Group 4:", "ME 141A", "ME 141B"],
                                        ["Group 5:", "ME 166", "ME 154"],
                                        ["Group 6:", "ME 152B", "ME 151C"]
                                    ].map((g, i) => (
                                        <div key={i}>
                                            <span style={{ display: 'inline-block', width: '50px' }}>{g[0]}</span>
                                            <span style={{ display: 'inline-block', width: '90px' }}><strong>{g[1] !== "L1" ? renderCourseLink(g[1]) : g[1]},</strong></span>
                                            <span><strong>{g[2] !== "L2" ? renderCourseLink(g[2]) : g[2]}</strong></span>
                                        </div>
                                    ))}
                                    ---------------------------------------------------<br />Note: Approval by faculty advisor. Approved electives may change year to year. *<strong>{renderCourseLink("ME W167")}</strong> online version of <strong>{renderCourseLink("ME 167")}</strong>. **Four units maximum from <strong>{renderCourseLink("ME 197")}</strong> and <strong>{renderCourseLink("ME 199")}</strong> combined. ***Max of 1 <strong>TMP</strong> course may be applied</span></li>;
                            }
                            if (section.type === 'sciB') {
                                notes = <li key="n" className="note"><span className="note-content-detailed-simple">At least 1 lab is required</span></li>;
                            }
                            if (section.type === 'univ') {
                                const isCollapsed = collapsedNotes[section.id];
                                notes = (
                                    <li key="n" className="note" style={{ display: 'block' }}>
                                        <div
                                            onClick={() => setCollapsedNotes(prev => ({ ...prev, [section.id]: !prev[section.id] }))}
                                            className="note-header"
                                        >
                                            <span style={{ display: 'inline-block', transform: isCollapsed ? 'rotate(0deg)' : 'rotate(90deg)', transition: 'transform 0.2s', fontStyle: 'normal' }}>⛯</span> Requirements Info
                                        </div>
                                        {!isCollapsed && (
                                            <span className="note-content-detailed">
                                                <strong>Entry Level Writing</strong> You can check off manually if <strong>ONE</strong> of the following are met:<br />
                                                ⛯ 680+ on SAT Writing exam
                                                <br />⛯ 30+ on ACT Combined English Language Arts exam
                                                <br />⛯ passed the UC systemwide Analytical Writing Placement Exam (results only accepted from UC transfers)
                                                <br />⛯ placed in <strong>"Writing 2"</strong> via UCSB's Collaborative Writing Placement Exam (writing.ucsb.edu/academics)
                                                <br />⛯ a "C" or higher in an <strong>Area A1</strong> course/course equivalent<br />
                                                <br /><u>Note:</u> The writing placement exam is ONLY required if none of the other options are met. If the exam is not passed for <strong>"Writing 2"</strong> you must enroll in <strong>Writing 1</strong>, <strong>1E</strong>, or <strong>Linguistics 12</strong> within your first year at UCSB. <br /><br />
                                                <strong>American History and Institutions</strong> You can check off manually if the following are met:
                                                <br />⛯ Passed a non-credit exam in American history or American institutions offered in the Department of History during the first week of each quarter
                                                <br />⛯ 650+ on SAT II: Subject test in American History
                                                <br />⛯ Completed a 4-unit course/course equivalent that satisfies this requirement<br />
                                                <br /><u>Note:</u> UC transfer students who have already satisfied this requirement get credit. International students on a nonimmigrant visa may petition for a waiver of this requirement.
                                            </span>
                                        )}
                                    </li>
                                );
                            }



                            if (section.type === 'univ') {
                                const reqItems = ["Entry Level Writing", "American History and Institutions"].map(req => {
                                    const sourceLabel = creditSources[req];
                                    const isFailing = sourceLabel && (sourceLabel.includes("(F)") || sourceLabel.includes("(NP)"));
                                    const sourceBaseClass = coursesGOLD.includes(req) ? "credit-source-GOLD" : (CREDIT_TO_UCSB_MAP[sourceLabel] ? "courses-HS" : "credit-source");
                                    const sourceClass = isFailing ? `${sourceBaseClass} failing-grade` : sourceBaseClass;

                                    return (
                                        <li key={req}>
                                            <input type="checkbox" id={req} checked={!!checkedItems[req]} onChange={() => handleCheckToggle(req)} />
                                            <label htmlFor={req}>
                                                <span onClick={(e) => handleGEClick(e, section.id, req)} className="ge-clickable">{req}</span>
                                                {sourceLabel && <span className={sourceClass}> {sourceLabel} </span>}
                                            </label>
                                        </li>
                                    );
                                });
                                children = [notes, ...reqItems];
                            } else if (section.type === 'ge') {
                                if (section.id === "Area A: English Reading & Comprehension") {
                                    const isCollapsed = collapsedNotes[section.id];
                                    notes = (
                                        <li key="n" className="note" style={{ display: 'block' }}>
                                            <div
                                                onClick={() => {
                                                    setCollapsedNotes(prev => ({ ...prev, [section.id]: !prev[section.id] }))
                                                }}
                                                className="note-header"
                                            >
                                                <span style={{ display: 'inline-block', transform: isCollapsed ? 'rotate(0deg)' : 'rotate(90deg)', transition: 'transform 0.2s', fontStyle: 'normal' }}>⛯</span> Note:
                                            </div>
                                            {!isCollapsed && (
                                                <span className="note-content-detailed">
                                                    You must <strong>complete</strong> the UC Entry Level Writing Requirement before enrolling in Area A courses.<br />Engineering students are strongly encouraged to take <strong>Writing 2E and 50E</strong> *often in their first year at UCSB. Computer Science majors may take <strong>Writing 2E and 50E</strong> only if space permits (which doesn't happen often :/).
                                                </span>
                                            )}
                                        </li>
                                    );
                                }
                                if (section.id === "Writing Requirement") {
                                    notes = <li key="n" className="note"><span className="sub-req-detail"><strong>ENGR 101</strong> grants Writing credit! (yay)</span></li>;
                                }

                                const subReqItems = section.subReqs.map((sub: string) => {
                                    const reqId = `${section.id}-${sub}`;
                                    let labelText: React.ReactNode = sub;
                                    if (section.id === "Area A: English Reading & Comprehension") {
                                        if (sub === "A-1") labelText = <span onClick={(e) => handleGEClick(e, section.id, "A-1")} className="ge-clickable">A-1: <span className="sub-req-detail">Writing 2 or 2E</span></span>;
                                        if (sub === "A-2") {
                                            labelText = (
                                                <span>
                                                    <span onClick={(e) => handleGEClick(e, section.id, "A-2")} className="ge-clickable">A-2</span>: <span className="sub-req-detail">
                                                        Writing 50, 50E
                                                        {!expandedA2 && <span>...</span>}
                                                        {expandedA2 && <span>, 105CD, 105CW, 105M, 105PD, 105PS, 105S, 105SW, 107B, 107EP, 107G, 107J, 107L, 107M, 107T, 107WC, 109ED, 109ES, 109HP, or 109ST </span>}
                                                        <span
                                                            onClick={(e) => { e.preventDefault(); setExpandedA2(!expandedA2); }}
                                                            className="more-link"
                                                        >
                                                            ({expandedA2 ? "less" : "more"})
                                                        </span>
                                                    </span>
                                                </span>
                                            );
                                        }
                                    } else {
                                        // Make default labels clickable
                                        labelText = <span onClick={(e) => handleGEClick(e, section.id, sub)} className="ge-clickable">{sub}</span>;
                                    }

                                    // Dropdown Logic for Multi-GE Courses
                                    let dropdown = null;
                                    if (checkedItems[reqId] && creditSources[reqId]) {
                                        const sourceLabel = creditSources[reqId];
                                        const cleanCode = sourceLabel.split('(')[0].trim().replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
                                        const details = getCourseDetails(cleanCode, courseData);

                                        // Check if we are currently in a Core GE section (Area D, E, F, G)
                                        // The ID format is "Area X: ..." so we can check start
                                        const isCoreSection = ["Area D", "Area E", "Area F", "Area G"].some(prefix => section.id.startsWith(prefix));

                                        if (isCoreSection && details && details.general_area && Array.isArray(details.general_area) && details.general_area.length > 1) {
                                            // Filter out the current area to show valid switch targets
                                            const otherAreas = details.general_area.filter((area: string) => !section.id.startsWith("Area " + area));

                                            if (otherAreas.length > 0) {
                                                dropdown = (
                                                    <select
                                                        className="switch-area-select"
                                                        onChange={(e) => {
                                                            if (e.target.value) {
                                                                handleMoveGE(sourceLabel, reqId, e.target.value);
                                                                e.target.value = "";
                                                            }
                                                        }}
                                                        value=""
                                                    >
                                                        <option value="" disabled>Switch Area ⇄</option>
                                                        {otherAreas.map((area: string) => (
                                                            <option key={area} value={area}>to {area}</option>
                                                        ))}
                                                    </select>
                                                );
                                            }
                                        }
                                    }

                                    const sourceLabel = creditSources[reqId];
                                    const isFailing = sourceLabel && (sourceLabel.includes("(F)") || sourceLabel.includes("(NP)"));
                                    const sourceBaseClass = coursesGOLD.includes(reqId) ? "credit-source-GOLD" : (CREDIT_TO_UCSB_MAP[sourceLabel] ? "courses-HS" : "credit-source");
                                    const sourceClass = isFailing ? `${sourceBaseClass} failing-grade` : sourceBaseClass;

                                    return (
                                        <li key={reqId} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingRight: '10px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                                <input type="checkbox" id={reqId} checked={!!checkedItems[reqId]} onChange={() => handleCheckToggle(reqId)} />
                                                <label htmlFor={reqId}>{labelText}
                                                    {sourceLabel && <span className={sourceClass}> {sourceLabel}</span>}
                                                </label>
                                            </div>
                                            {dropdown}
                                        </li>
                                    );
                                });
                                children = notes ? [notes, ...subReqItems] : subReqItems;
                            } else if (section.type === 'prep') {
                                const rawList = MAJOR_REQUIREMENTS[selectedMajor]?.prep || [];
                                children = rawList.map(item => {
                                    if (item.startsWith("GROUP:")) return renderGroupItem(item.split(":")[1], { allowRemoval: true });
                                    return renderCourseItem(item, { allowRemoval: true });
                                });
                            } else if (section.type === 'upper') {
                                const rawList = MAJOR_REQUIREMENTS[selectedMajor]?.upper || [];
                                const courseItems = rawList.map(item => {
                                    if (item.startsWith("GROUP:")) return renderGroupItem(item.split(":")[1], { allowRemoval: true });
                                    return renderCourseItem(item, { allowRemoval: true });
                                });
                                children = [notes, ...courseItems];
                            } else if (section.type === 'electives') {
                                children = [notes, ...(UPPER_DIV_ELECTIVES[selectedMajor] || []).map(c => renderCourseItem(c, { allowRemoval: true }))];
                            } else if (section.type === 'sciA') {
                                children = SCIENCE_ELECTIVES["List A"].map(c => renderCourseItem(c, { allowRemoval: true }));
                            } else if (section.type === 'sciB') {
                                children = [notes, ...SCIENCE_ELECTIVES["List B"].map(c => renderCourseItem(c, { allowRemoval: true }))];
                            }
                            return (
                                <li className="nested-section" key={section.id} id={`section-container-${section.id}`}>
                                    <div className="parent-check">
                                        <span className="toggle-icon" onClick={() => toggleCollapse(collapseId)}>
                                            {collapsedSections[collapseId] ? "▶" : "⛯"}
                                        </span>
                                        <input type="checkbox" id={parentId} checked={!!checkedItems[parentId]} onChange={() => handleCheckToggle(parentId)} />
                                        <label htmlFor={parentId}><strong>{section.label}</strong> <span style={{ fontSize: '0.8em', fontWeight: 'normal' }}>{statusText}</span></label>
                                    </div>
                                    {!collapsedSections[collapseId] && (
                                        <ul className="nested-list">
                                            {children}
                                        </ul>
                                    )}
                                </li>
                            );
                        })}


                        <li className="nested-section" key="removed-courses" id="section-container-removed-courses">
                            <div className="parent-check" style={{ cursor: 'pointer' }} onClick={() => toggleCollapse('removed-courses')}>
                                <span className="toggle-icon">
                                    {(collapsedSections['removed-courses'] !== false) ? "▶" : "⛯"}
                                </span>
                                <strong>Removed Courses</strong>
                            </div>
                            {!(collapsedSections['removed-courses'] !== false) && (
                                <ul className="nested-list">
                                    {removedCourses.map(c => {
                                        if (c.startsWith("GROUP:")) {
                                            return renderGroupItem(c.split(":")[1], { allowRestore: true });
                                        }
                                        return renderCourseItem(c, { allowRestore: true });
                                    })}
                                </ul>
                            )}
                        </li>
                    </ul>
                    <div className="checklist-legend">
                        <strong>Legend:</strong><br />
                        <span className="courses-HS">High School credit: AP, IB, ALE (green)</span>
                        <span className="credit-source-GOLD">Imported from GOLD (gold)</span>
                        <span className="credit-source">Input Courses (blue)</span>
                    </div>
                </>
            )}
            <div className="stats-overlay">
                <div className="gpa-text"><strong>GPA:</strong> {gpa}</div>
                <div className="gpa-text" style={{ marginTop: '5px' }}><strong>Units:</strong> {totalUnits} / {ALL_UNITS[selectedMajor]}</div>
            </div>


            <div
                className={`instructions-bubble ${showFloatingInstructions ? 'expanded' : 'collapsed'}`}
                onClick={() => !showFloatingInstructions && setShowFloatingInstructions(true)}
            >
                {showFloatingInstructions ? (
                    <>
                        <div className="close-btn" onClick={(e) => {
                            e.stopPropagation();
                            setShowFloatingInstructions(false);
                        }}>✕</div>
                        <strong>General Info:</strong>
                        <div style={{ marginTop: '8px', lineHeight: '1.4' }}>
                            - While any given course can ONLY apply to <strong>ONE</strong> GE Area (A-G), it can apply to <strong>MULTIPLE</strong> Special Subject Areas. You can modify which General Area you want any given course to apply to.
                            <br />- GE classes may be taken for P/NP if offered. All major related classes must be taken for a letter grade and most require a grade of "C" or above.
                            <br />- Manual checking has no label and may be necessary for the <strong>"University Requirements"</strong> section. Doing so will not add to total units, so use it if the import missed something.
                            <br />- "GPA" and "Units" may include <span className="credit-source">Input Courses</span> (which are not on your GOLD). "Reset Inputs" to remove them.
                            <br />- Failed Courses in red do not give course credit. Non-GE courses less than a C but greater than an F will get units counted but not course credit
                            <br />- Disclaimer: this is and should not be considered a substitute to official GOLD audits and transcripts. Make sure to consult the official GOLD website as there may be unnaccounted courses or errors within the extension. If you find any issues, please contact <a href="mailto:gear.interactive.help@gmail.com">gear.interactive.help@gmail.com</a>.
                        </div>
                    </>
                ) : (
                    "i"
                )}
            </div>
        </div>
    );
};

export default Checklist;
