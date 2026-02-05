import React, { useState, useEffect } from 'react';
import "./css/main.css";
import "./css/banner.css";
import "./css/buttons.css";
import "./css/checklist.css";

import "./css/main-dark.css";
import "./css/banner-dark.css";
import "./css/buttons-dark.css";
import "./css/checklist-dark.css";

// --- Components ---
import Header from './components/Header';
import CreditTransfer from './components/CreditTransfer';
import Checklist from './components/Checklist';
import Search from './components/Search';
import Home from './components/Home';

// --- Data ---
import { CREDIT_SYSTEMS } from './data/creditSystems';
import { CREDIT_TO_UCSB_MAP } from './data/HighSchoolCredit';
import { COURSE_GROUPS } from './data/courseGroups';
import { MAJOR_REQUIREMENTS } from './data/majorRequirements';
import { UPPER_DIV_ELECTIVES, SCIENCE_ELECTIVES } from './data/electives';
import { GE_AREAS, ALL_SECTIONS } from './data/geAreas';
import { gradeMap } from './data/grades';

// --- Types & Utils ---
import type { ChecklistState, CreditSource, ImportedCourse } from './types';
import { getUnitsForCourse, getCourseDetails } from './utils/courseUtils';
import mecheTimeline from './assets/meche_timeline.png';
import csTimeline from './assets/cs_timeline.png';
import compeTimeline from './assets/compe_timeline.png';
import eeTimeline from './assets/ee_timeline.png';
import chemeTimeline from './assets/cheme_timeline.png';
import { calculateGPA, calculateGradeChange } from './utils/gpaUtils';

function App() {
    // --- State ---
    const [courseData, setCourseData] = useState<Record<string, any>>({});

    const [currentPage, setCurrentPage] = useState<'home' | 'checklist' | 'search'>('home');
    const [selectedCreditSystem, setSelectedCreditSystem] = useState<string>('ap');
    const [inputCourse, setInputCourse] = useState<string>('');
    const [addedCourses, setAddedCourses] = useState<string[]>([]);
    const [selectedMajor, setSelectedMajor] = useState<string>('');

    const [checkedItems, setCheckedItems] = useState<ChecklistState>({});
    const [creditSources, setCreditSources] = useState<CreditSource>({});
    const [collapsedSections, setCollapsedSections] = useState<ChecklistState>({
        "major-electives": true,
        "science-electives-a": true,
        "science-electives-b": true,
        "removed-courses": true
    });

    const [selectedSearchFilter, setSelectedSearchFilter] = useState<string | null>(null);
    const [timeRange, setTimeRange] = useState<[number, number]>([8, 23]);

    const [showResetModal, setShowResetModal] = useState(false);
    const [showFloatingInstructions, setShowFloatingInstructions] = useState(false);
    const [showBannerTools, setShowBannerTools] = useState(true);
    const [showMajorDropdown, setShowMajorDropdown] = useState(false);
    const [showTimeline, setShowTimeline] = useState(false);
    const [showIntroPopup, setShowIntroPopup] = useState(false);

    const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
    const [expandedPrereqs, setExpandedPrereqs] = useState<Record<string, boolean>>({});

    const [isReloading, setIsReloading] = useState(false);

    const [actionStatus, setActionStatus] = useState<string>('');
    const [courseSearchInfo, setCourseSearchInfo] = useState<React.ReactNode>(null);

    const [importedCourseHistory, setImportedCourseHistory] = useState<ImportedCourse[]>([]);
    const [coursesGOLD, setCoursesGOLD] = useState<string[]>([]);
    const [removedCourses, setRemovedCourses] = useState<string[]>([]);
    const [showRemovedNotification, setShowRemovedNotification] = useState(false);

    const [manualGrades, setManualGrades] = useState<Record<string, string>>({});
    const [gpa, setGpa] = useState<string>("N/A");
    const [totalGradePoints, setTotalGradePoints] = useState<number>(0);
    const [totalGpaUnits, setTotalGpaUnits] = useState<number>(0);
    const [totalUnits, setTotalUnits] = useState<number>(0);
    const [totalInputCoursesUnits, setTotalInputCoursesUnits] = useState<number>(0);

    const [manualUnits, setManualUnits] = useState<Record<string, number>>({});
    const [sliderConfig, setSliderConfig] = useState<{ min: number, max: number, current: number } | null>(null);
    const [inputHistory, setInputHistory] = useState<string[]>([]);

    const [collapsedNotes, setCollapsedNotes] = useState<Record<string, boolean>>({ "univ-req": true, "Area A: English Reading & Comprehension": true });

    // Home Page State
    const [hasCompletedSetup, setHasCompletedSetup] = useState(false);
    const [studentNotes, setStudentNotes] = useState("");
    const [isLoaded, setIsLoaded] = useState(false);

    // Flash message ONLY for GOLD login error
    const [flashMessage, setFlashMessage] = useState<string | null>(null);

    useEffect(() => {
        if (flashMessage) {
            const timer = setTimeout(() => setFlashMessage(null), 3000);
            return () => clearTimeout(timer);
        }
    }, [flashMessage]);

    const [expandedA2, setExpandedA2] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState<boolean>(false);



    // --- Effects ---
    useEffect(() => {
        const closeDropdown = () => setShowMajorDropdown(false);
        if (showMajorDropdown) {
            window.addEventListener('click', closeDropdown);
        }
        return () => window.removeEventListener('click', closeDropdown);
    }, [showMajorDropdown]);

    // retrieve class json data
    useEffect(() => {
        const jsonUrl = typeof chrome !== 'undefined' && chrome.runtime?.getURL
            ? chrome.runtime.getURL('courses_master.json')
            : '/courses_master.json';
        fetch(jsonUrl)
            .then(res => res.json())
            .then(data => {
                setCourseData(data);
                setCourseData(data);
            })
            .catch(err => console.error("Failed to load courses:", err));
    }, []);

    // retrieve gearState from chrome storage
    useEffect(() => {
        if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.sync) {
            chrome.storage.sync.get(['gearState'], (result) => {
                if (result.gearState) {
                    const data = result.gearState;
                    if (data.currentPage) setCurrentPage(data.currentPage);
                    if (data.selectedCreditSystem) setSelectedCreditSystem(data.selectedCreditSystem);
                    if (data.selectedCreditSystem) setSelectedCreditSystem(data.selectedCreditSystem);
                    if (data.inputCourse) setInputCourse(data.inputCourse);
                    if (data.selectedMajor) setSelectedMajor(data.selectedMajor);
                    if (data.checkedItems) setCheckedItems(data.checkedItems);
                    if (data.creditSources) setCreditSources(data.creditSources);
                    if (data.collapsedSections) setCollapsedSections(data.collapsedSections);
                    if (data.importedCourseHistory) setImportedCourseHistory(data.importedCourseHistory);
                    if (data.importedCourseHistory) setImportedCourseHistory(data.importedCourseHistory);
                    if (data.coursesGOLD) setCoursesGOLD(data.coursesGOLD);
                    if (data.manualUnits) setManualUnits(data.manualUnits);
                    if (data.showBannerTools !== undefined) setShowBannerTools(data.showBannerTools);
                    if (data.addedCourses) setAddedCourses(data.addedCourses);
                    if (data.removedCourses) setRemovedCourses(data.removedCourses);
                    if (data.hasCompletedSetup !== undefined) setHasCompletedSetup(data.hasCompletedSetup);
                    if (data.studentNotes !== undefined) setStudentNotes(data.studentNotes);
                    if (data.isDarkMode !== undefined) setIsDarkMode(data.isDarkMode);
                    if (data.hasSeenIntroPopup !== true) {
                        setShowIntroPopup(true);
                    }
                } else {
                    // logic for fresh install? gearState is undefined
                    setShowIntroPopup(true);
                }
                setIsLoaded(true);
            });
        } else {
            // Dev environment or no storage
            setIsLoaded(true);
        }
    }, []);

    // Apply dark mode class to body
    useEffect(() => {
        if (isDarkMode) {
            document.body.classList.add('dark-mode');
        } else {
            document.body.classList.remove('dark-mode');
        }
    }, [isDarkMode]);

    // save gearState to chrome storage
    useEffect(() => {
        // Prevent saving if we haven't finished loading yet (race condition fix)
        if (!isLoaded) return;
        if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.sync) {
            const stateToSave = {
                currentPage,
                selectedCreditSystem,
                inputCourse,
                selectedMajor,
                checkedItems,
                creditSources,
                collapsedSections,
                importedCourseHistory,
                coursesGOLD,
                manualUnits,
                showBannerTools,
                removedCourses,
                hasCompletedSetup,
                studentNotes,
                isDarkMode,
                hasSeenIntroPopup: showIntroPopup ? false : true // store true if we aren't showing it anymore
            };
            chrome.storage.sync.set({ gearState: stateToSave });
        }
    }, [currentPage, selectedCreditSystem, inputCourse, selectedMajor, checkedItems, creditSources, collapsedSections, importedCourseHistory, coursesGOLD, manualUnits, showBannerTools, removedCourses, hasCompletedSetup, studentNotes, isDarkMode, isLoaded]);

    // GOLD GPA and total units
    useEffect(() => {
        if (!importedCourseHistory || importedCourseHistory.length === 0) {
            return;
        }
        const { allGradePoints, allGpaUnits, allUnits, gpa: calculatedGpa } = calculateGPA(
            importedCourseHistory,
            manualGrades,
            manualUnits,
            courseData
        );
        setTotalUnits(allUnits + totalInputCoursesUnits);
        if (allGpaUnits > 0) {
            setTotalGradePoints(allGradePoints);
            setTotalGpaUnits(allGpaUnits);
            setGpa(calculatedGpa);
        } else {
            setGpa("IP");
        }
    }, [importedCourseHistory, manualGrades, totalInputCoursesUnits, manualUnits, courseData]);

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [currentPage]);

    // auto-check parents and set current/required untis
    useEffect(() => {
        const getChildrenForSection = (sec: any) => {
            if (sec.type === 'univ') return ["Entry Level Writing", "American History and Institutions"];
            if (sec.type === 'ge') return sec.subReqs.map((sub: string) => `${sec.id}-${sub}`);
            const rawList = (sec.type === 'prep' ? MAJOR_REQUIREMENTS[selectedMajor]?.prep : MAJOR_REQUIREMENTS[selectedMajor]?.upper) || [];
            return rawList.filter((item: string) => !item.startsWith("GROUP:"));
        };
        let didAutoCheck = false;
        const newChecks = { ...checkedItems };
        const newCollapsed = { ...collapsedSections };
        let didCollapse = false;
        ALL_SECTIONS.forEach(section => {
            const parentId = section.type === 'ge' ? section.id : `${section.id}-complete`;
            let conditionMet = false;
            // 1. Unit-based sections
            if (section.type === 'electives' || section.type === 'sciA' || section.type === 'sciB' || section.type === 'prep' || section.type === 'upper') {
                let requiredUnits = 0;
                let currentUnits = 0;
                // Sum units for Groups
                const sumUnits = (list: string[]) => {
                    list.forEach(item => {
                        if (item.startsWith("GROUP:")) {
                            const groupKey = item.split(":")[1];
                            const group = COURSE_GROUPS[groupKey];
                            if (group) {
                                const activeOption = group.options.find(opt =>
                                    opt.courses.every(c => checkedItems[c])
                                );
                                if (activeOption) currentUnits += activeOption.units;
                            }
                        } else {
                            if (checkedItems[item]) {
                                currentUnits += getUnitsForCourse(item, manualUnits, courseData);
                            }
                        }
                    });
                };
                if (section.type === 'sciA') {
                    requiredUnits = 8;
                    sumUnits(SCIENCE_ELECTIVES["List A"]);
                    if (checkedItems["AP Biology"]) currentUnits = 8;
                } else if (section.type === 'sciB') {
                    requiredUnits = 12;
                    sumUnits(SCIENCE_ELECTIVES["List B"]);
                } else if (section.type === 'electives') {
                    sumUnits(UPPER_DIV_ELECTIVES[selectedMajor] || []);
                    if (selectedMajor === "ChemE") requiredUnits = 15;
                    else if (selectedMajor === "MechE") requiredUnits = 9;
                    else if (selectedMajor === "EE") {
                        requiredUnits = 36;
                    }
                    else if (selectedMajor === "CompE") {
                        const has189A = checkedItems["ECE189A"];
                        const has189B = checkedItems["ECE189B"];
                        const has189C = checkedItems["ECE189C"];
                        requiredUnits = (has189A && has189B && has189C) ? 36 : 40;
                    } else requiredUnits = 56;
                } else if (section.type === 'prep') {
                    requiredUnits = MAJOR_REQUIREMENTS[selectedMajor]?.prepUnits || 999;
                    sumUnits(MAJOR_REQUIREMENTS[selectedMajor]?.prep || []);
                } else if (section.type === 'upper') {
                    const upperList = MAJOR_REQUIREMENTS[selectedMajor]?.upper || [];
                    if (selectedMajor === 'CompE') {
                        const has189A = checkedItems["CMPSC189A"];
                        const has189B = checkedItems["CMPSC189B"];
                        requiredUnits = (has189A && has189B) ? 64 : 68;
                    } else if (selectedMajor === 'EE') {
                        const has153A = checkedItems["ECE153A"];
                        const has153B = checkedItems["ECE153B"];
                        requiredUnits = (has153A && has153B) ? 68 : 64;
                    } else {
                        requiredUnits = MAJOR_REQUIREMENTS[selectedMajor]?.upperUnits || 999;
                    }
                    sumUnits(upperList);
                }
                if (currentUnits >= requiredUnits) conditionMet = true;
            }
            // 2. Auto check and uncheck based on if the conditions were met
            else {
                const children = getChildrenForSection(section);
                if (children.length > 0) {
                    conditionMet = children.every((child: string) => checkedItems[child]);
                }
            }

            if (conditionMet && !checkedItems[parentId]) {
                newChecks[parentId] = true;
                newCollapsed[section.id] = true;
                didCollapse = true;
                didAutoCheck = true;
            } else if (!conditionMet && checkedItems[parentId]) {
                newChecks[parentId] = false;
                newCollapsed[section.id] = false;
                didCollapse = true;
                didAutoCheck = true;
            }
        });
        if (didAutoCheck) {
            setCheckedItems(newChecks);
            if (didCollapse) {
                setCollapsedSections(newCollapsed);
            }
        }
    }, [checkedItems, selectedMajor, courseData]);

    // apply changes upon importing
    useEffect(() => {
        if (importedCourseHistory.length > 0) {
            applyCreditTransfer();
        }
    }, [importedCourseHistory]);

    // Detect variable units for slider
    useEffect(() => {
        if (!inputCourse) {
            setSliderConfig(null);
            return;
        }
        const cleanCode = "".concat(...inputCourse.trim().split('(')[0].split(/[^a-zA-Z0-9]/g)).toUpperCase();
        const details = getCourseDetails(cleanCode, courseData);
        if (details && details.units && details.units.includes("-")) {
            const parts = details.units.split("-");
            const min = parseFloat(parts[0]);
            const max = parseFloat(parts[1]);
            setSliderConfig({ min, max, current: min });
        } else {
            setSliderConfig(null);
        }
    }, [inputCourse]);

    /**
     * Main logic for applying credits from various sources (manual input, GOLD import, checkboxes).
     * Calculates GPA, updates checklist items, and manages GE area satisfaction.
     */

    const addToHistory = (text: string) => {
        if (!text || text.trim() === "") return;
        setInputHistory(prev => {
            if (prev.length > 0) {
                const normalize = (s: string) => s.trim().toLowerCase().replace(/\s+/g, ' ');
                if (normalize(prev[0]) === normalize(text)) return prev;
            }
            const newHistory = [text, ...prev];
            if (newHistory.length > 15) return newHistory.slice(0, 15);
            return newHistory;
        });
    };

    const addToGPA = (courseName: string) => {
        const result = calculateGradeChange(
            courseName,
            true,
            totalGradePoints,
            totalGpaUnits,
            manualUnits,
            courseData
        );
        if (result) {
            setTotalGradePoints(result.newTotalGradePoints);
            setTotalGpaUnits(result.newTotalGpaUnits);
            setGpa(result.newGpa);
        }
    };

    const removeFromGPA = (cleanCode: string) => {
        const result = calculateGradeChange(
            cleanCode,
            false,
            totalGradePoints,
            totalGpaUnits,
            manualUnits,
            courseData,
            manualGrades
        );
        if (result) {
            setTotalGradePoints(result.newTotalGradePoints);
            setTotalGpaUnits(result.newTotalGpaUnits);
            setGpa(result.newGpa);
        }
    };

    const applyCreditTransfer = (
        manualInput: string | null = null,
        overrideChecks?: { [key: string]: boolean },
        overrideSources?: { [key: string]: string },
        overrideHistory?: ImportedCourse[],
        overrideGrades?: { [key: string]: string }
    ) => {
        if (!courseData || Object.keys(courseData).length === 0) {
            console.warn("Course data not loaded yet. Cannot process credits.");
            return;
        }

        const newChecks = overrideChecks ? { ...overrideChecks } : { ...checkedItems };
        const newSources = overrideSources ? { ...overrideSources } : { ...creditSources };
        const historyToUse = overrideHistory || importedCourseHistory;
        const newGrades = overrideGrades ? { ...overrideGrades } : { ...manualGrades };
        const newCoursesGOLD: string[] = [];

        // Cleanup: Remove HS credits that are no longer selected
        Object.keys(newSources).forEach(reqId => {
            const source = newSources[reqId];
            if (CREDIT_TO_UCSB_MAP[source] || Object.values(CREDIT_SYSTEMS).some(list => list.includes(source))) {
                if (!newChecks[source]) {
                    delete newSources[reqId];
                    newChecks[reqId] = false;
                }
            }
        });



        // Combine transient manual input with persistent added courses
        const combinedManualInput = [
            manualInput,
            ...addedCourses
        ].filter(Boolean).join(",");

        // find the matching course name in the checklist
        const findMatchingRequirementID = (cleanInputCode: string) => {
            const checkList = (list: string[]) => {
                for (const item of list) {
                    if (item.startsWith("GROUP:")) {
                        const group = COURSE_GROUPS[item.split(":")[1]];
                        for (const opt of group.options) {
                            for (const c of opt.courses) {
                                if (c.replace(/[^a-zA-Z0-9]/g, "").toUpperCase() === cleanInputCode) return c;
                            }
                        }
                    } else {
                        if (item.replace(/[^a-zA-Z0-9]/g, "").toUpperCase() === cleanInputCode) return item;
                    }
                }
                return null;
            };

            const prepMatch = checkList(MAJOR_REQUIREMENTS[selectedMajor]?.prep || []);
            if (prepMatch) return prepMatch;
            const upperMatch = checkList(MAJOR_REQUIREMENTS[selectedMajor]?.upper || []);
            if (upperMatch) return upperMatch;

            if (selectedMajor === 'CS') {
                const sciA = SCIENCE_ELECTIVES["List A"].find(req => req.replace(/[^a-zA-Z0-9]/g, "").toUpperCase() === cleanInputCode);
                if (sciA) return sciA;
                const sciB = SCIENCE_ELECTIVES["List B"].find(req => req.replace(/[^a-zA-Z0-9]/g, "").toUpperCase() === cleanInputCode);
                if (sciB) return sciB;
            }

            const electives = UPPER_DIV_ELECTIVES[selectedMajor] || [];
            const eleMatch = electives.find(req =>
                req.replace(/[^a-zA-Z0-9]/g, "").toUpperCase() === cleanInputCode
            );
            if (eleMatch) return eleMatch;
            return null;
        };

        const checkGEsForCourse = (cleanCode: string, sourceLabel: string, isGOLD: boolean = false, isUCSB: boolean = false, isFailing: boolean = false) => {
            const courseInfo = courseData[cleanCode];
            if (!courseInfo) return;
            const areaMapping: { [key: string]: string } = {
                "A1": "Area A: English Reading & Comprehension-A-1",
                "A2": "Area A: English Reading & Comprehension-A-2",
                "D": "Area D: Social Science",
                "E": "Area E: Culture and Thought",
                "F": "Area F: The Arts",
                "G": "Area G: Literature",
                "Ethnicity": "Special Subject Areas-Ethnicity",
                "European Traditions": "Special Subject Areas-European Traditions or World Cultures",
                "World Cultures": "Special Subject Areas-European Traditions or World Cultures"
            };

            const areas = [...(courseInfo.general_area || []), ...(courseInfo.special_area || [])];

            // Separate overlapping areas (D, E, F, G) from others
            const coreAreas = areas.filter(a => ["D", "E", "F", "G"].includes(a));
            const specialAreas = areas.filter(a => !["D", "E", "F", "G"].includes(a));

            let coreAreaFilled = false;

            // Handle Core Areas: Only one can be satisfied
            for (const area of coreAreas) {
                if (coreAreaFilled) break; // Stop if we already matched a core area

                const mapKey = areaMapping[area];
                if (mapKey) {
                    // New Format: Area D: Social Science-D-1
                    const c1 = `${mapKey}-${area}-1`;
                    const c2 = `${mapKey}-${area}-2`;

                    // Helper to check if slot is taken by THIS course
                    const isMySlot = (sourceVal: string) => {
                        if (!sourceVal) return false;
                        const sClean = "".concat(...sourceVal.split(' (')[0].trim().split(/[^a-zA-Z0-9]/g)).toUpperCase();
                        return sClean === cleanCode;
                    };

                    if (newSources[c1] === sourceLabel) {
                        if (isGOLD && !newCoursesGOLD.includes(c1) && !isFailing) newCoursesGOLD.push(c1);
                        coreAreaFilled = true;
                    } else if (newSources[c2] === sourceLabel) {
                        if (isGOLD && !newCoursesGOLD.includes(c2) && !isFailing) newCoursesGOLD.push(c2);
                        coreAreaFilled = true;
                    } else {
                        // Check if we can overwrite c1
                        if (!newChecks[c1] || (isMySlot(newSources[c1]) && isGOLD && (!newChecks[c1] || !isFailing))) {
                            if (!isFailing) newChecks[c1] = true;
                            newSources[c1] = sourceLabel;
                            if (isGOLD && !newCoursesGOLD.includes(c1) && !isFailing) newCoursesGOLD.push(c1);
                            coreAreaFilled = true;
                        } else if (!newChecks[c2] || (isMySlot(newSources[c2]) && isGOLD && (!newChecks[c2] || !isFailing))) {
                            if (!isFailing) newChecks[c2] = true;
                            newSources[c2] = sourceLabel;
                            if (isGOLD && !newCoursesGOLD.includes(c2) && !isFailing) newCoursesGOLD.push(c2);
                            coreAreaFilled = true;
                        }
                    }
                }
            }

            // Handle Special Areas (Writing, Ethnicity, etc.) - These can overlap with Core Areas
            specialAreas.forEach(area => {
                if (area === "Writing") {
                    for (let i = 1; i <= 4; i++) {
                        // New Format: Writing Requirement-Writing-1
                        const writingId = `Writing Requirement-Writing-${i}`;
                        if (!isGOLD && newSources[writingId]) continue;
                        if (newSources[writingId] === sourceLabel) {
                            if (isGOLD && !newCoursesGOLD.includes(writingId) && isUCSB && !isFailing) newCoursesGOLD.push(writingId);
                            return;
                        }

                        if (!newChecks[writingId] && !sourceLabel.includes("CREDIT")) {
                            if (!isFailing) newChecks[writingId] = true;
                            newSources[writingId] = sourceLabel;
                            if (isGOLD && !newCoursesGOLD.includes(writingId) && isUCSB && !isFailing) newCoursesGOLD.push(writingId);
                            break;
                        }
                    }
                    return;
                }

                const mapKey = areaMapping[area];
                if (mapKey) {
                    if (newSources[mapKey] === sourceLabel) {
                        if (isGOLD && !newCoursesGOLD.includes(mapKey) && !isFailing) newCoursesGOLD.push(mapKey);
                    } else if (!newChecks[mapKey]) {
                        if (!isFailing) newChecks[mapKey] = true;
                        newSources[mapKey] = sourceLabel;
                        if (isGOLD && !newCoursesGOLD.includes(mapKey) && !isFailing) newCoursesGOLD.push(mapKey);
                    }
                }
            });

            if (courseInfo.univ_req) {
                courseInfo.univ_req.forEach((req: string) => {
                    if (newSources[req] === sourceLabel) {
                        if (isGOLD && !newCoursesGOLD.includes(req) && !isFailing) newCoursesGOLD.push(req);
                    } else if (!newChecks[req]) {
                        if (!isFailing) newChecks[req] = true;
                        newSources[req] = sourceLabel;
                        if (isGOLD && !newCoursesGOLD.includes(req) && !isFailing) newCoursesGOLD.push(req);
                    }
                });
            }
        };

        // HS Credit Transfer (AP/IB/ALE)
        Object.keys(newChecks).forEach(key => {
            if (CREDIT_TO_UCSB_MAP[key] && newChecks[key]) {
                const equivalents = CREDIT_TO_UCSB_MAP[key];
                equivalents.forEach(eq => {
                    // Start of new logic for Area D & E
                    if (eq === "Area D: Social Science" || eq === "Area E: Culture and Thought") {
                        const code = eq.includes("Social Science") ? "D" : "E";
                        for (let i = 1; i <= 2; i++) {
                            const slotId = `${eq}-${code}-${i}`;
                            // Fill if empty or if we already own it
                            if (!newChecks[slotId] || newSources[slotId] === key) {
                                newChecks[slotId] = true;
                                newSources[slotId] = key;
                                break;
                            }
                        }
                    } else {
                        newChecks[eq] = true;
                        if (!newSources[eq]) newSources[eq] = key;
                    }
                });
            }
        });
        /**
         * Parses input strings (e.g. "CMPSC 130A (A-)") and updates the checklist state.
         * Handles grade validation, GPA impact, and requirement matching.
         */
        const processInputString = (inputStr: string, defaultLabel: string | null, isGOLD: boolean = false, isUCSB: boolean = false, gradesAcc: any) => {

            if (!inputStr) {

                return;
            }
            const entries = inputStr.split(',');
            entries.forEach(entry => {
                const trimmed = entry.trim();
                if (!trimmed) return;
                const match = trimmed.match(/^(.*?)\s*(?:\(([^)]+)\))?$/);
                let codePart = trimmed;
                let gradePart = "";
                if (match) {
                    codePart = match[1].trim();
                    if (match[2]) {
                        gradePart = match[2].replace(" ", "").toUpperCase();
                    }
                }
                let cleanCode = codePart.replace(/[^a-zA-Z0-9]/g, "").toUpperCase()
                if (!cleanCode) return;
                // if the course is already in the checklist, return
                if (Object.values(creditSources).some(source => {
                    const sourceRaw = source.split(' (')[0];
                    const sourceClean = "".concat(...sourceRaw.trim().split(/[^a-zA-Z0-9]/g)).toUpperCase();
                    return sourceClean === cleanCode;
                }) && !isGOLD) return;

                if (gradesAcc[cleanCode] && !isGOLD) return;
                //if gradePart is not A+, A, A-, B+, B, B-, C+, C, C-, D+, D, D-, F, P, or NP return
                // Allow F and NP to proceed so they can be shown (but not checked)
                if (!Object.keys(gradeMap).includes(gradePart) && gradePart && gradePart !== "P" && gradePart !== "NP") return;

                const details = getCourseDetails(cleanCode, courseData);
                if (!details && !isGOLD && !isUCSB) {

                    return;
                }

                let prettyName = (details && details.full_course_name) ? details.full_course_name.split(' - ')[0] : codePart.toUpperCase();
                if (gradePart) {
                    gradesAcc[cleanCode] = gradePart;
                    prettyName += ` (${gradePart})`;
                }
                // if gradePart is empty, set it to IP
                if (!gradePart) {
                    prettyName += ` (IP)`;
                    gradesAcc[cleanCode] = "IP";
                    gradePart = "IP";
                }
                const matchedID = findMatchingRequirementID(cleanCode);

                // Moved definition up to use in matchedID block
                const isFailing = (gradePart === "F" || gradePart === "NP");

                if (matchedID) {
                    // Check strict passing for Major (C or higher, Letter Grade only)
                    // Allowed: A+, A, A-, B+, B, B-, C+, C
                    const isMajorPassing = ["A+", "A", "A-", "B+", "B", "B-", "C+", "C", "IP"].includes(gradePart);
                    const isMajorFailing = !isMajorPassing; // Covers C-, D+, D, D-, F, P, NP

                    // Always show label if it's a match (even if failing)
                    // Allow overwrite if empty OR if it's GOLD (since findMatchingRequirementID ensures it's our slot)
                    // BUT do not overwrite a confirmed pass with a failing grade
                    if (!newSources[matchedID] || (isGOLD && (!newChecks[matchedID] || !isMajorFailing))) {
                        if (defaultLabel) {
                            newSources[matchedID] = defaultLabel.includes("credit") ? defaultLabel.toUpperCase() : prettyName;
                        } else {
                            // If defaulting to prettyName, ensure source is set
                            newSources[matchedID] = prettyName;
                        }
                    }

                    if (isMajorPassing) {
                        newChecks[matchedID] = true;
                        if (isGOLD && !newCoursesGOLD.includes(matchedID)) newCoursesGOLD.push(matchedID);
                    }
                }
                let labelToUse = prettyName || `"${entry.trim()}"`;
                if (isGOLD && defaultLabel) {
                    labelToUse = defaultLabel.includes("credit") ? defaultLabel.toUpperCase() : prettyName;
                }

                // Check GEs even if failing (to show label), but pass isFailing=true
                checkGEsForCourse(cleanCode, labelToUse.toUpperCase(), isGOLD, isUCSB, isFailing);
            });

        };

        // Process manual input
        if (combinedManualInput) {
            processInputString(combinedManualInput, "Input Course", false, true, newGrades);
        }

        // GOLD Imported Course History
        if (historyToUse.length > 0) {
            historyToUse.forEach(course => {
                course.grade = course.grade || "";
                const code = course.code + " (" + course.grade + ")";
                let sourceLabel = course.institution !== "UCSB" ? course.institution + ' credit' : code;
                if (course.institution !== "UCSB" && (course.grade === "F" || course.grade === "NP")) {
                    sourceLabel += ` (${course.grade})`;
                }
                const isUCSB = course.institution === "UCSB";
                processInputString(code, sourceLabel, true, isUCSB, newGrades);
            });

        }
        setCheckedItems(newChecks);
        setCreditSources(newSources);
        setCoursesGOLD(newCoursesGOLD);
        setManualGrades(newGrades);
    };

    // handle manual check toggle
    const handleCheckToggle = (id: string) => {
        setCheckedItems(prev => {
            const newState = { ...prev, [id]: !prev[id] };
            return newState;
        });
    };

    // handle remove course (manual input w/ button)
    const handleRemoveCourse = (courseToRemove?: string) => {
        const input = courseToRemove || inputCourse;

        if (!input) {
            return;
        }

        if (!courseToRemove) addToHistory(input);

        const rawInput = input.split('(')[0].trim();
        const cleanInput = "".concat(...rawInput.trim().split(/[^a-zA-Z0-9]/g)).toUpperCase();

        const newChecks = { ...checkedItems };
        const newSources = { ...creditSources };
        const newGrades = { ...manualGrades };
        let found = false;
        const grade = newGrades[cleanInput];

        if (grade) {
            removeFromGPA(cleanInput);
            delete newGrades[cleanInput];
            found = true;
        }
        const updatedAddedCourses = addedCourses.filter(added => {
            const addedClean = "".concat(...added.trim().split('(')[0].split(/[^a-zA-Z0-9]/g)).toUpperCase();
            return addedClean !== cleanInput;
        });

        if (updatedAddedCourses.length !== addedCourses.length) {
            setAddedCourses(updatedAddedCourses);
            found = true;
        }
        if (manualUnits[cleanInput]) {
            const newManualUnits = { ...manualUnits };
            delete newManualUnits[cleanInput];
            setManualUnits(newManualUnits);
        }

        //check if course is checked and remove it from newSources
        if (newChecks[cleanInput]) {
            newChecks[cleanInput] = false;
            delete newSources[cleanInput];
            found = true;
        }

        //find any requirement fulfilled by the removed course
        Object.keys(newSources).forEach(reqId => {
            const source = newSources[reqId];
            const rawSourceCode = source.split(' (')[0];
            const cleanSource = "".concat(...rawSourceCode.trim().split(/[^a-zA-Z0-9]/g)).toUpperCase();
            if (cleanSource === cleanInput) {
                newChecks[reqId] = false;
                delete newSources[reqId];
                found = true;
            }
        });

        if (found) {
            const units = getUnitsForCourse(cleanInput, manualUnits, courseData);
            // Only subtract units if it wasn't F, NP, IP, or empty
            if (grade !== "F" && grade !== "NP" && grade !== "IP" && grade !== "") {
                setTotalUnits(totalUnits - units);
                setTotalInputCoursesUnits(totalInputCoursesUnits - units);
            }

            setCheckedItems(newChecks);
            setCreditSources(newSources);
            setManualGrades(newGrades);
            if (!courseToRemove) setActionStatus(`${rawInput} removed`);
        } else {
            if (!courseToRemove) setActionStatus(`${rawInput} was not found in your checklist`);
        }
        if (!courseToRemove) {
            setInputCourse('');
            setCourseSearchInfo(null);
        }
    }


    // handle collapse toggle
    const toggleCollapse = (id: string) => {
        setCollapsedSections(prev => {
            // removed-courses defaults to collapsed (true), so if undefined, toggle to false (expanded)
            if (id === 'removed-courses' && prev[id] === undefined) {
                return { ...prev, [id]: false };
            }
            return { ...prev, [id]: !prev[id] };
        });
    };

    // handle showing course info (with manual input and "info" button)
    const handleShowCourseInfo = () => {
        if (!inputCourse) return;
        addToHistory(inputCourse);
        const cleanCode = "".concat(...inputCourse.trim().split('(')[0].split(/[^a-zA-Z0-9]/g)).toUpperCase();
        const details = getCourseDetails(cleanCode, courseData);

        if (details) {
            const isValid = (val: any) => {
                if (Array.isArray(val)) return val.length > 0;
                return val && val !== "N/A" && val.trim() !== "";
            };
            const content = (
                <div className="course-info-box" style={{ position: 'relative' }}>
                    <span
                        onClick={() => setCourseSearchInfo(null)}
                        style={{
                            position: 'absolute',
                            top: '5px',
                            right: '10px',
                            cursor: 'pointer',
                            fontSize: '1.2em',
                            fontWeight: 'bold',
                            color: '#555'
                        }}
                    >
                        &times;
                    </span>
                    <h3>{details.full_course_name || cleanCode}</h3>
                    {isValid(details.course_description) && (
                        <p><strong>Description:</strong> {details.course_description}</p>
                    )}
                    {isValid(details.units) && (
                        <p><strong>Units:</strong> {details.units}</p>
                    )}
                    {isValid(details.prerequisites) && (
                        <p><strong>Prerequisites:</strong> {details.prerequisites}</p>
                    )}
                    {isValid(details.general_area) && (
                        <p><strong>GE Areas:</strong> {details.general_area.join(', ')}</p>
                    )}
                    {isValid(details.special_area) && (
                        <p><strong>Special Areas:</strong> {details.special_area.join(', ')}</p>
                    )}
                    {isValid(details.univ_req) && (
                        <p><strong>University Requirements:</strong> {details.univ_req.join(', ')}</p>
                    )}
                    {isValid(details.advisor_comments) && (
                        <p><strong>Advisor Comments:</strong> {details.advisor_comments}</p>
                    )}
                </div>
            );
            setCourseSearchInfo(content);
        } else {
            setCourseSearchInfo(<p className="no-results">No information found for course: {inputCourse}</p>);
        }
    };

    /**
     * Communicates with the Chrome Extension content script to scrape course history from GOLD.
     * Handles conflict resolution between manual inputs and official records.
     */
    const handleImportFromGOLD = () => {
        if (typeof chrome === 'undefined' || !chrome.tabs) {
            alert("This feature only works when running as a Chrome Extension.");
            return;
        }

        const handleResponse = (response: any) => {
            if (chrome.runtime.lastError) {
                console.error("Runtime error (make sure you are logged into GOLD)");
                setFlashMessage("Make sure you're logged into GOLD. If you are, refresh.");
                return;
            }
            if (response && response.result && response.result.length > 0) {

                const courses: ImportedCourse[] = response.result;
                const goldCleanCodes = courses.map(c =>
                    c.code.replace(/[^a-zA-Z0-9]/g, "").toUpperCase()
                );


                let updatedAddedCourses = [...addedCourses];
                let conflictCount = 0;

                // If an added course is found in GOLD, remove it from addedCourses so GOLD takes precedence
                updatedAddedCourses = updatedAddedCourses.filter(added => {
                    // Extract code part (before parens) and normalize
                    const codePart = added.trim().split('(')[0];
                    const cleanAdded = codePart.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();

                    if (goldCleanCodes.includes(cleanAdded)) {

                        conflictCount++;
                        return false;
                    }
                    return true;
                });

                if (conflictCount > 0) {
                    setAddedCourses(updatedAddedCourses);

                }

                // 1. Clear Transient Manual Inputs (Keep Persistent) - removed this feature, can be added later if needed
                const newManualGrades = { ...manualGrades };
                const newManualUnits = { ...manualUnits };

                // We need to keep only the entries that correspond to updatedAddedCourses
                const persistentCleanCodes = updatedAddedCourses.map(c =>
                    c.trim().split('(')[0].replace(/[^a-zA-Z0-9]/g, "").toUpperCase()
                );

                Object.keys(newManualGrades).forEach(key => {
                    if (!persistentCleanCodes.includes(key)) {
                        delete newManualGrades[key];
                    }
                });
                Object.keys(newManualUnits).forEach(key => {
                    if (!persistentCleanCodes.includes(key)) {
                        delete newManualUnits[key];
                    }
                });

                setManualGrades(newManualGrades);
                setManualUnits(newManualUnits);
                setInputCourse('');
                // Recalculate total units for persistent custom courses (Use Preserved Logic)
                let preservedUnits = 0;
                persistentCleanCodes.forEach(code => {
                    // Try to find units in manualUnits or details
                    if (newManualUnits[code]) {
                        preservedUnits += newManualUnits[code];
                    } else {
                        const details = courseData[code];
                        if (details && !isNaN(parseFloat(details.units))) {
                            preservedUnits += parseFloat(details.units);
                        }
                    }
                });
                setTotalInputCoursesUnits(preservedUnits);

                // 2. Clear Checklist State (keep only HS credits AND persistent courses)
                const newChecks = { ...checkedItems };
                const newSources = { ...creditSources };

                Object.keys(newSources).forEach(reqId => {
                    const source = newSources[reqId];
                    // Keep HS credits (AP/IB/etc) ONLY if the source exam is still checked
                    if (CREDIT_TO_UCSB_MAP[source] || Object.keys(CREDIT_SYSTEMS).some(sys => CREDIT_SYSTEMS[sys].includes(source))) {
                        // Check if the source exam is still in checkedItems (newChecks is initialized from checkedItems)
                        if (newChecks[source]) {
                            return;
                        }
                        // If we are here, the HS exam was unchecked, so fall through to delete this credit
                    }

                    // Keep persistent manual courses
                    const sourceRaw = source.split(' (')[0];
                    const sourceClean = "".concat(...sourceRaw.trim().split(/[^a-zA-Z0-9]/g)).toUpperCase();
                    if (persistentCleanCodes.includes(sourceClean)) {
                        return;
                    }
                    // Remove everything else (Manual + old GOLD + Unselected HS)
                    delete newSources[reqId];
                    newChecks[reqId] = false;
                });

                setCheckedItems(newChecks);
                setCreditSources(newSources);

                // 3. Set Imported History (Effects will trigger GPA calc and Checklist population)
                setImportedCourseHistory(courses);

                const totalUnitsImported = courses.reduce((total, course) => {
                    // Only count units if not F/NP/W/I
                    const g = course.grade.toUpperCase();
                    if (g !== "F" && g !== "NP" && g !== "W" && g !== "I" && !isNaN(course.units)) {
                        return total + course.units;
                    }
                    return total;
                }, 0);

                alert(`Imported ${courses.length} courses! (${totalUnitsImported} units)`);
                setActionStatus("");

            } else {
                alert('No courses found, make sure to click "Continue".');
                setActionStatus("");

            }
        };

        const targetUrl = "https://my.sa.ucsb.edu/gold/AcademicProgress.aspx";

        chrome.tabs.query({ url: "https://my.sa.ucsb.edu/gold/*" }, (tabs) => {
            const attemptImport = (tabId: number) => {
                chrome.tabs.sendMessage(tabId, { action: "IMPORT_COURSES" }, handleResponse);
            };
            if (tabs && tabs.length > 0) {
                const tab = tabs[0];
                if (tab.id) {
                    chrome.tabs.update(tab.id, { active: true });
                    if (tab.windowId && chrome.windows) {
                        chrome.windows.update(tab.windowId, { focused: true });
                    }
                    if (tab.url === targetUrl) {
                        attemptImport(tab.id);
                    } else {
                        chrome.tabs.update(tab.id, { url: targetUrl });
                        const listener = (tabId: number, changeInfo: any) => {
                            if (tabId === tab.id && changeInfo.status === 'complete') {
                                chrome.tabs.onUpdated.removeListener(listener);
                                attemptImport(tabId);
                            }
                        };
                        chrome.tabs.onUpdated.addListener(listener);
                    }
                }
            } else {
                // No GOLD tab found, create new one to the right
                chrome.tabs.query({ active: true, currentWindow: true }, (currentTabs) => {
                    const newIndex = (currentTabs && currentTabs.length > 0) ? currentTabs[0].index + 1 : undefined;
                    chrome.tabs.create({ url: targetUrl, index: newIndex }, (tab) => {
                        if (tab.id) {
                            const listener = (tabId: number, changeInfo: any) => {
                                if (tabId === tab.id && changeInfo.status === 'complete') {
                                    chrome.tabs.onUpdated.removeListener(listener);
                                    attemptImport(tabId);
                                }
                            };
                            chrome.tabs.onUpdated.addListener(listener);
                        }
                    });
                });
            }
        });
    };


    // handle resetting ONLY inputs (keeps GOLD + HS)
    const handleResetInputs = () => {
        // 1. Identify HS courses to keep
        const hsCourses = new Set<string>();
        Object.values(CREDIT_SYSTEMS).forEach(list => list.forEach(c => hsCourses.add(c)));

        // 2. Filter Helper
        const filterToHS = (obj: { [key: string]: any }) => {
            const newObj: { [key: string]: any } = {};
            Object.keys(obj).forEach(key => {
                if (hsCourses.has(key)) {
                    newObj[key] = obj[key];
                }
            });
            return newObj;
        };

        const newCheckedItems = filterToHS(checkedItems) as { [key: string]: boolean };
        const newCreditSources = filterToHS(creditSources) as { [key: string]: string };
        const newManualGrades = filterToHS(manualGrades) as { [key: string]: string };

        // 3. Clear Manual Inputs
        setInputCourse('');
        setAddedCourses([]);
        setManualUnits({}); // Assuming GOLD courses use default units or are handled in history
        setTotalInputCoursesUnits(0);

        // Reset stats if no GOLD history exists
        if (!importedCourseHistory || importedCourseHistory.length === 0) {
            setTotalUnits(0);
            setTotalGradePoints(0);
            setTotalGpaUnits(0);
            setGpa("N/A");
        }

        // 4. Reset UI States
        setActionStatus('Inputs Reset');
        setCourseSearchInfo(null);
        setSelectedSearchFilter(null);
        setShowResetModal(false);
        setSliderConfig(null);

        // 5. Re-run Transfer Logic with CLEANED State + Existing GOLD History
        // This will re-populate GOLD courses and keep HS courses
        applyCreditTransfer(null, newCheckedItems, newCreditSources, importedCourseHistory, newManualGrades);
    };

    // handle resetting checklist
    const handleReset = () => {
        // Doesn't reset HS credits
        const hsCourses = new Set<string>();
        Object.values(CREDIT_SYSTEMS).forEach(list => list.forEach(c => hsCourses.add(c)));
        const newCheckedItems = { ...checkedItems };
        const newCreditSources = { ...creditSources };
        Object.keys(newCheckedItems).forEach(key => {
            if (!hsCourses.has(key)) {
                delete newCheckedItems[key];
            }
        });
        Object.keys(newCreditSources).forEach(key => {
            if (!hsCourses.has(key)) {
                delete newCreditSources[key];
            }
        });
        const newManualGrades = { ...manualGrades };
        Object.keys(newManualGrades).forEach(key => {
            if (!hsCourses.has(key)) {
                delete newManualGrades[key];
            }
        });
        setInputCourse('');
        setCheckedItems(newCheckedItems);
        setCreditSources(newCreditSources);
        setManualGrades(newManualGrades);
        setCollapsedSections({
            "major-electives": true,
            "science-electives-a": true,
            "science-electives-b": true
        });
        setImportedCourseHistory([]);
        setTotalInputCoursesUnits(0);
        setActionStatus('');
        setCourseSearchInfo(null);
        setSelectedSearchFilter(null);
        setShowResetModal(false);
        setTotalUnits(0);
        setTotalGradePoints(0);
        setTotalGpaUnits(0);
        setGpa("N/A");
        setManualUnits({});
        setAddedCourses([]);
        // save this state
        if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.sync) {
            const stateToSave = {
                currentPage: 'checklist',
                selectedCreditSystem,
                inputCourse: '',
                selectedMajor,
                checkedItems: newCheckedItems,
                creditSources: newCreditSources,
                collapsedSections: {
                    "major-electives": true,
                    "science-electives-a": true,
                    "science-electives-b": true
                },
                importedCourseHistory: [],
                coursesGOLD: [],
                manualUnits: {}
            };
            chrome.storage.sync.set({ gearState: stateToSave });
        }
    };

    // Reload Checklist Button Handler
    const handleReload = () => {
        setIsReloading(true);
        applyCreditTransfer();
        setTimeout(() => setIsReloading(false), 500);
    };



    // Move a course from its current GE slot to a new target GE area
    const handleMoveGE = (courseCode: string, currentReqId: string, targetAreaShort: string) => {

        const areaMapping: { [key: string]: string } = {
            "A1": "Area A: English Reading & Comprehension",
            "A2": "Area A: English Reading & Comprehension",
            "D": "Area D: Social Science",
            "E": "Area E: Culture and Thought",
            "F": "Area F: The Arts",
            "G": "Area G: Literature",
            "Ethnicity": "Special Subject Areas",
            "European Traditions": "Special Subject Areas",
            "World Cultures": "Special Subject Areas"
        };

        const targetSectionId = areaMapping[targetAreaShort] || targetAreaShort;
        const targetSection = ALL_SECTIONS.find(sec => sec.type === 'ge' && sec.id.startsWith(targetSectionId));

        if (!targetSection) {
            console.error("Target section not found for area:", targetAreaShort, "mapped to", targetSectionId);
            return;
        }

        // Check availability in target section
        const subReqs = targetSection.subReqs || [];
        let foundSlot = null;

        for (const sub of subReqs) {
            // If we are moving to A1 or A2, make sure we pick the right slot
            if (targetSection.id.includes("Area A")) {
                if (sub === "A-1" && targetAreaShort !== "A1") continue;
                if (sub === "A-2" && targetAreaShort !== "A2") continue;
            }

            const reqId = `${targetSection.id}-${sub}`;
            // If slot is unchecked, it is free
            if (!checkedItems[reqId]) {
                foundSlot = reqId;
                break;
            }
        }

        if (foundSlot) {

            const newChecks = { ...checkedItems };
            const newSources = { ...creditSources };

            // Perform Move
            // Uncheck old
            newChecks[currentReqId] = false;
            delete newSources[currentReqId];

            // Check new
            newChecks[foundSlot] = true;
            newSources[foundSlot] = creditSources[currentReqId] || courseCode;

            // Handle GOLD status transfer
            if (coursesGOLD.includes(currentReqId)) {
                const newCoursesGOLD = coursesGOLD.filter(id => id !== currentReqId);
                newCoursesGOLD.push(foundSlot);
                setCoursesGOLD(newCoursesGOLD);
            }

            setCheckedItems(newChecks);
            setCreditSources(newSources);

        } else {
            alert(`${targetAreaShort} is full. Please remove a course from that area first.`);
        }
    };

    // updating checklist when "Add" button is clicked
    const handleUpdateChecklist = (persist: boolean = false) => {
        if (!inputCourse) {
            return;
        }
        addToHistory(inputCourse);

        const rawCode = inputCourse.split('(')[0];
        const cleanCode = "".concat(...rawCode.trim().split(/[^a-zA-Z0-9]/g)).toUpperCase();
        const details = getCourseDetails(cleanCode, courseData);
        const courseName = details ? details.full_course_name.split(' - ')[0] || cleanCode : inputCourse;
        const trimmed = inputCourse.trim();
        const match = trimmed.match(/^(.*?)\s*(?:\(([^)]+)\))?$/);
        let gradePart = "";
        if (match) {
            if (match[2]) {
                gradePart = match[2].replace(" ", "").toUpperCase();
            }
        }
        if (Object.values(creditSources).some(source => {
            const sourceRaw = source.split(' (')[0];
            const sourceClean = "".concat(...sourceRaw.trim().split(/[^a-zA-Z0-9]/g)).toUpperCase();
            return sourceClean === cleanCode;
        }) || manualGrades[cleanCode] || manualUnits[cleanCode]) {
            setActionStatus(`${courseName} already in list`);
            setInputCourse('');
            return;
        }
        // Check if course was previously failed
        if (manualGrades[cleanCode] === "F" || manualGrades[cleanCode] === "NP") {

            setActionStatus(`${courseName} was failed, remove it if you want to change the grade`);
            setInputCourse('');

            return;
        }


        if (!Object.keys(gradeMap).includes(gradePart) && gradePart && gradePart !== "P" && gradePart !== "NP") {
            setActionStatus("Please enter a valid grade (A+, A, A-, B+, B, B-, C+, C, C-, D+, D, D-, F, P, NP, or just enter the course if it is In Progress)");
            setInputCourse('');
            return;
        }
        if (!details) {
            setActionStatus(`${courseName} not found`);
            setInputCourse('');
            return;
        }
        // set manual units if slider was active
        if (sliderConfig) {
            setManualUnits(prev => ({ ...prev, [cleanCode]: sliderConfig.current }));
        }

        if (persist) {
            setAddedCourses(prev => {
                if (prev.includes(inputCourse)) return prev;
                return [...prev, inputCourse];
            });
            setActionStatus(`${courseName} added`);
        } else {
            setActionStatus(`${courseName} added (temporary)`);
        }

        // We use inputCourse here to trigger the IMMEDIATE update
        // The persistence is handled by addedCourses in FUTURE updates
        applyCreditTransfer(inputCourse);

        // Only add units if not F, NP, IP, or empty
        if (gradePart !== "F" && gradePart !== "NP" && gradePart !== "IP" && gradePart !== "") {
            const unitsToAdd = sliderConfig ? sliderConfig.current : parseFloat(details.units);
            setTotalInputCoursesUnits(totalInputCoursesUnits + unitsToAdd);
            setTotalUnits(totalUnits + unitsToAdd);
        }
        addToGPA(inputCourse)
        if (gradePart === "F" || gradePart === "NP") {
            setActionStatus(`${courseName} was added with a failing grade`);
        } else {
            setActionStatus(`${courseName} added`);
        }
        setInputCourse('');
        setSliderConfig(null);
        setCourseSearchInfo(null);

    }

    // Helper to get unfulfilled filters
    const getUnfulfilledFilters = () => {
        const unfulfilled: string[] = [];
        if (!checkedItems["Entry Level Writing"]) unfulfilled.push("Entry Level Writ");
        if (!checkedItems["American History and Institutions"]) unfulfilled.push("American H&I");
        if (!checkedItems["Area A: English Reading & Comprehension-A-1"]) unfulfilled.push("A1");
        if (!checkedItems["Area A: English Reading & Comprehension-A-2"]) unfulfilled.push("A2");
        if (!checkedItems["Area D: Social Science-D-1"] || !checkedItems["Area D: Social Science-D-2"]) unfulfilled.push("D");
        if (!checkedItems["Area E: Culture and Thought-E-1"] || !checkedItems["Area E: Culture and Thought-E-2"]) unfulfilled.push("E");
        if (!checkedItems["Area F: The Arts-F-1"]) unfulfilled.push("F");
        if (!checkedItems["Area G: Literature-G-1"]) unfulfilled.push("G");
        const writingReqs = GE_AREAS["Writing Requirement"];
        if (writingReqs.some(req => !checkedItems[`Writing Requirement-${req}`])) {
            unfulfilled.push("Writ");
        }
        if (!checkedItems["Special Subject Areas-Ethnicity"]) unfulfilled.push("Ethn");
        if (!checkedItems["Special Subject Areas-European Traditions or World Cultures"]) {
            unfulfilled.push("Euro Trad/Wrld Cult");
        }
        return unfulfilled;
    };

    const handleSubjectSearch = (subjectValue: string) => {
        const goldUrl = "https://my.sa.ucsb.edu/gold/BasicFindCourses.aspx";
        if (typeof chrome !== 'undefined' && chrome.tabs && chrome.tabs.query) {
            chrome.tabs.query({ url: "https://my.sa.ucsb.edu/gold/*" }, (tabs) => {
                if (tabs && tabs.length > 0) {
                    const tab = tabs[0];
                    if (tab.id) {
                        chrome.tabs.update(tab.id, { url: goldUrl, active: true });
                        const listener = (tabId: number, changeInfo: any) => {
                            if (tabId === tab.id && changeInfo.status === 'complete') {
                                chrome.tabs.sendMessage(tabId, {
                                    action: "AUTOMATE_SUBJECT_SEARCH",
                                    subject: subjectValue
                                });
                                chrome.tabs.onUpdated.removeListener(listener);
                            }
                        };
                        chrome.tabs.onUpdated.addListener(listener);
                    }
                    if (tab.windowId && chrome.windows) {
                        chrome.windows.update(tab.windowId, { focused: true });
                    }
                } else {
                    chrome.tabs.query({ active: true, currentWindow: true }, (currentTabs) => {
                        const createProperties: chrome.tabs.CreateProperties = { url: goldUrl };
                        if (currentTabs && currentTabs.length > 0) {
                            createProperties.index = currentTabs[0].index + 1;
                        }
                        chrome.tabs.create(createProperties, (newTab) => {
                            if (newTab.id) {
                                const listener = (tabId: number, changeInfo: any) => {
                                    if (tabId === newTab.id && changeInfo.status === 'complete') {
                                        chrome.tabs.sendMessage(tabId, {
                                            action: "AUTOMATE_SUBJECT_SEARCH",
                                            subject: subjectValue
                                        });
                                        chrome.tabs.onUpdated.removeListener(listener);
                                    }
                                };
                                chrome.tabs.onUpdated.addListener(listener);
                            }
                        });
                    });
                }
            });
        } else {
            window.open(goldUrl, "_blank");
        }
    };

    const handleSearchGold = () => {
        const goldUrl = "https://my.sa.ucsb.edu/gold/CriteriaFindCourses.aspx";
        if (typeof chrome !== 'undefined' && chrome.tabs && chrome.tabs.query) {
            chrome.tabs.query({ url: "https://my.sa.ucsb.edu/gold/*" }, (tabs) => {
                if (tabs && tabs.length > 0) {
                    const tab = tabs[0];
                    if (tab.id) {
                        chrome.tabs.update(tab.id, { url: goldUrl, active: true });

                        // Wait for tab to load before sending message
                        const listener = (tabId: number, changeInfo: any) => {
                            if (tabId === tab.id && changeInfo.status === 'complete') {
                                chrome.tabs.sendMessage(tabId, {
                                    action: "AUTOMATE_GOLD_SEARCH",
                                    area: selectedSearchFilter,
                                    startTime: timeRange[0],
                                    endTime: timeRange[1]
                                });
                                chrome.tabs.onUpdated.removeListener(listener);
                            }
                        };
                        chrome.tabs.onUpdated.addListener(listener);
                    }
                    if (tab.windowId && chrome.windows) {
                        chrome.windows.update(tab.windowId, { focused: true });
                    }
                } else {
                    chrome.tabs.query({ active: true, currentWindow: true }, (currentTabs) => {
                        const createProperties: chrome.tabs.CreateProperties = { url: goldUrl };
                        if (currentTabs && currentTabs.length > 0) {
                            createProperties.index = currentTabs[0].index + 1;
                        }
                        chrome.tabs.create(createProperties, (newTab) => {
                            if (newTab.id) {
                                // Wait for tab to load before sending message
                                const listener = (tabId: number, changeInfo: any) => {
                                    if (tabId === newTab.id && changeInfo.status === 'complete') {
                                        chrome.tabs.sendMessage(tabId, {
                                            action: "AUTOMATE_GOLD_SEARCH",
                                            area: selectedSearchFilter,
                                            startTime: timeRange[0],
                                            endTime: timeRange[1]
                                        });
                                        chrome.tabs.onUpdated.removeListener(listener);
                                    }
                                };
                                chrome.tabs.onUpdated.addListener(listener);
                            }
                        });
                    });
                }
            });
        } else {
            window.open(goldUrl, "_blank");
        }
    };

    const handleToggleRemoved = (course: string) => {
        // Check current state directly to determine action
        // This avoids side effects in the setter callback
        if (removedCourses.includes(course)) {
            // Restore
            setRemovedCourses(prev => prev.filter(c => c !== course));
        } else {
            // Remove
            setRemovedCourses(prev => [...prev, course]);
            setShowRemovedNotification(true);
            setTimeout(() => setShowRemovedNotification(false), 1500);
        }
    };

    const handleSearchPlat = () => {
        const goldUrl = "https://ucsbplat.com/ge/";
        if (typeof chrome !== 'undefined' && chrome.tabs && chrome.tabs.query) {
            chrome.tabs.query({ url: "https://ucsbplat.com/ge/" }, (tabs) => {
                if (tabs && tabs.length > 0) {
                    const tab = tabs[0];
                    if (tab.id) {
                        chrome.tabs.update(tab.id, { url: goldUrl });
                        chrome.tabs.update(tab.id, { active: true });
                    }
                    if (tab.windowId && chrome.windows) {
                        chrome.windows.update(tab.windowId, { focused: true });
                    }
                } else {
                    chrome.tabs.query({ active: true, currentWindow: true }, (currentTabs) => {
                        if (currentTabs && currentTabs.length > 0) {
                            const currentTab = currentTabs[0];
                            chrome.tabs.create({ url: goldUrl, index: currentTab.index + 1 });
                        } else {
                            chrome.tabs.create({ url: goldUrl });
                        }
                    });
                }
            });
        } else {
            window.open(goldUrl, "_blank");
        }
    };


    const [highlightedFilters, setHighlightedFilters] = React.useState<string[]>([]);

    // find current page and set up "remove" modal message
    // --- Render ---
    const [highlightedCourse, setHighlightedCourse] = React.useState<string | null>(null);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
            <Header
                currentPage={currentPage}
                setCurrentPage={(page) => {
                    if (page === 'home' && !hasCompletedSetup && selectedMajor) {
                        setHasCompletedSetup(true);
                    }
                    setCurrentPage(page);
                }}
                selectedMajor={selectedMajor}
                setSelectedMajor={setSelectedMajor}
                showMajorDropdown={showMajorDropdown}
                setShowMajorDropdown={setShowMajorDropdown}
                showBannerTools={showBannerTools}
                setShowBannerTools={setShowBannerTools}
                handleImportFromGOLD={handleImportFromGOLD}
                setShowResetModal={setShowResetModal}
                handleSearchPlat={handleSearchPlat}
                setShowTimeline={setShowTimeline}
            />

            {flashMessage && (
                <div className="flash-message">
                    {flashMessage}
                </div>
            )}

            <div className="main-content" style={{ flex: 1, overflowY: 'auto', position: 'relative' }}>
                {currentPage === 'home' && (
                    !hasCompletedSetup ? (
                        <CreditTransfer
                            selectedCreditSystem={selectedCreditSystem}
                            setSelectedCreditSystem={setSelectedCreditSystem}
                            checkedItems={checkedItems}
                            handleCheckToggle={handleCheckToggle}
                            selectedMajor={selectedMajor}
                            setSelectedMajor={setSelectedMajor}
                            markSetupComplete={() => setHasCompletedSetup(true)}
                            handleNextToRequirements={() => {
                                setHasCompletedSetup(true);
                                setCurrentPage('checklist');
                            }}
                        />
                    ) : (
                        <Home
                            studentNotes={studentNotes}
                            setStudentNotes={setStudentNotes}
                            courseData={courseData}
                            manualGrades={manualGrades}
                            manualUnits={manualUnits}
                            importedCourseHistory={importedCourseHistory}
                            onEditSetup={() => setHasCompletedSetup(false)}
                            isDarkMode={isDarkMode}
                            setIsDarkMode={setIsDarkMode}
                        />
                    )
                )}
                {currentPage === 'checklist' && (
                    <Checklist
                        selectedMajor={selectedMajor}
                        checkedItems={checkedItems}
                        handleCheckToggle={handleCheckToggle}
                        inputCourse={inputCourse}
                        setInputCourse={setInputCourse}
                        setActionStatus={setActionStatus}
                        handleUpdateChecklist={handleUpdateChecklist}
                        handleRemoveCourse={handleRemoveCourse}
                        handleShowCourseInfo={handleShowCourseInfo}
                        handleReload={handleReload}
                        isReloading={isReloading}
                        manualUnits={manualUnits}
                        courseData={courseData}
                        setSliderConfig={setSliderConfig}
                        sliderConfig={sliderConfig}
                        handleSubjectSearch={handleSubjectSearch}
                        collapsedSections={collapsedSections}
                        toggleCollapse={toggleCollapse}
                        creditSources={creditSources}
                        handleMoveGE={handleMoveGE}
                        coursesGOLD={coursesGOLD}
                        gpa={gpa}
                        totalUnits={totalUnits}
                        showFloatingInstructions={showFloatingInstructions}
                        setShowFloatingInstructions={setShowFloatingInstructions}
                        setSelectedCourse={setSelectedCourse}
                        expandedPrereqs={expandedPrereqs}
                        setExpandedPrereqs={setExpandedPrereqs}
                        expandedA2={expandedA2}
                        setExpandedA2={setExpandedA2}
                        collapsedNotes={collapsedNotes}
                        setCollapsedNotes={setCollapsedNotes}
                        actionStatus={actionStatus}
                        courseSearchInfo={courseSearchInfo}
                        inputHistory={inputHistory}
                        setCurrentPage={setCurrentPage}
                        setSelectedSearchFilter={setSelectedSearchFilter}
                        setHighlightedFilters={setHighlightedFilters}
                        removedCourses={removedCourses}
                        handleToggleRemoved={handleToggleRemoved}
                        highlightedCourse={highlightedCourse}
                        setHighlightedCourse={setHighlightedCourse}
                        importedCourseHistory={importedCourseHistory}
                        addedCourses={addedCourses}
                    />
                )}
                {currentPage === 'search' && (
                    <Search
                        unfulfilledFilters={getUnfulfilledFilters()}
                        selectedSearchFilter={selectedSearchFilter}
                        setSelectedSearchFilter={setSelectedSearchFilter}
                        timeRange={timeRange}
                        setTimeRange={setTimeRange}
                        handleSearchGold={handleSearchGold}
                        highlightedFilters={highlightedFilters}
                        setHighlightedFilters={setHighlightedFilters}
                    />
                )}
            </div>


            {
                showResetModal && (
                    <div className="modal-overlay">
                        <div className="modal">
                            <h3>Reset Checklist?</h3>
                            <p style={{ marginBottom: '10px' }}>Choose an option:</p>
                            <ul className="reset-options-list">
                                <li><strong>Reset Inputs:</strong> Remove courses you inputted (blue).</li>
                                <li><strong>Reset Checklist:</strong> Reset checklist visually. Retains memory of High School credits.</li>
                            </ul>
                            <div className="button-group">
                                <button className="nav-button secondary" onClick={() => setShowResetModal(false)} style={{ marginRight: '10px' }}>nvm</button>
                                <button className="nav-button reset-inputs-btn" onClick={handleResetInputs} style={{ marginRight: '10px' }}>Reset Inputs</button>
                                <button className="nav-button danger" onClick={handleReset}>Reset Checklist</button>
                            </div>
                        </div>
                    </div>
                )
            }

            {
                showTimeline && (
                    <div className="modal-overlay" onClick={() => setShowTimeline(false)} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                        <div className="modal" onClick={(e) => e.stopPropagation()} style={{ position: 'relative', width: 'auto', maxWidth: '95%', maxHeight: '95vh', padding: '0', overflow: 'hidden', background: 'transparent', boxShadow: 'none', display: 'flex' }}>
                            <button
                                onClick={() => setShowTimeline(false)}
                                style={{
                                    position: 'absolute',
                                    top: '10px',
                                    right: '15px',
                                    background: 'white',
                                    borderRadius: '50%',
                                    border: 'none',
                                    fontSize: '1.5rem',
                                    cursor: 'pointer',
                                    color: '#555',
                                    padding: '0 8px',
                                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                                    zIndex: 10
                                }}
                            >
                                &times;
                            </button>
                            <img
                                src={
                                    selectedMajor === 'CS' ? csTimeline :
                                        selectedMajor === 'CompE' ? compeTimeline :
                                            selectedMajor === 'EE' ? eeTimeline :
                                                selectedMajor === 'ChemE' ? chemeTimeline :
                                                    mecheTimeline
                                }
                                alt={`${selectedMajor} Timeline`}
                                style={{ maxWidth: '100%', maxHeight: '90vh', objectFit: 'contain', borderRadius: '8px' }}
                            />
                        </div>
                    </div>
                )
            }

            {
                showIntroPopup && (
                    <div className="modal-overlay">
                        <div className="modal" style={{ maxWidth: '400px' }}>
                            <h3>Get Set Up</h3>
                            <ol style={{ textAlign: 'left', lineHeight: '1.6', fontSize: '1.1em', paddingLeft: '20px' }}>
                                <li>Enter the High School credits you earned</li>
                                <li>Click <strong>"Save and view your checklist"</strong></li>
                                <li>Click <strong>"Import GOLD"</strong> to populate the checklist</li>
                            </ol>
                            <div className="button-group" style={{ marginTop: '20px' }}>
                                <button
                                    className="nav-button primary"
                                    onClick={() => {
                                        setShowIntroPopup(false);
                                    }}
                                >
                                    Got it!
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }

            {
                showRemovedNotification && (
                    <div className="removed-notification">
                        <div>Course(s) Removed</div>
                        <div style={{ marginTop: '0px', lineHeight: '1' }}>↓</div>
                    </div>
                )
            }



            {
                selectedCourse && (() => {
                    const details = getCourseDetails(selectedCourse, courseData);
                    if (!details) return null;
                    const isValid = (val: any) => val && val !== "N/A" && val !== "" && (!Array.isArray(val) || val.length > 0);

                    const isDarkPopup = document.body.classList.contains('dark-mode');

                    return (
                        <div style={{
                            position: 'fixed',
                            bottom: 0,
                            left: 0,
                            width: '100%',
                            height: '35vh',
                            backgroundColor: isDarkPopup ? '#1e1e1e' : 'white',
                            color: isDarkPopup ? '#e0e0e0' : 'inherit',
                            boxShadow: '0 -2px 8px rgba(0,0,0,0.2)',
                            zIndex: 5000,
                            padding: '20px',
                            overflowY: 'auto',
                            boxSizing: 'border-box',
                            borderTop: isDarkPopup ? '1px solid #444' : '1px solid #ddd'
                        }}>
                            <button
                                onClick={() => setSelectedCourse(null)}
                                style={{
                                    position: 'absolute',
                                    top: '10px',
                                    right: '15px',
                                    background: 'none',
                                    border: 'none',
                                    fontSize: '1.5rem',
                                    cursor: 'pointer',
                                    color: isDarkPopup ? '#aaa' : '#555',
                                    padding: '0 5px'
                                }}
                            >
                                &times;
                            </button>

                            <h3 style={{ marginTop: 0, color: isDarkPopup ? '#bb86fc' : '#003660', marginRight: '30px' }}>
                                <a
                                    href={`https://ucsbplat.com/curriculum/course/${encodeURIComponent(selectedCourse)}`}
                                    onClick={(e) => {
                                        e.preventDefault();
                                        const url = `https://ucsbplat.com/curriculum/course/${encodeURIComponent(selectedCourse)}`;
                                        if (typeof chrome !== 'undefined' && chrome.tabs && chrome.tabs.query) {
                                            chrome.tabs.query({ url: "*://ucsbplat.com/curriculum/course/*" }, (tabs) => {
                                                if (tabs && tabs.length > 0) {
                                                    const tab = tabs[0];
                                                    if (tab.id) {
                                                        chrome.tabs.update(tab.id, { url: url, active: true });
                                                        if (tab.windowId && chrome.windows) {
                                                            chrome.windows.update(tab.windowId, { focused: true });
                                                        }
                                                    }
                                                } else {
                                                    chrome.tabs.create({ url: url });
                                                }
                                            });
                                        } else {
                                            window.open(url, "_blank");
                                        }
                                    }}
                                    style={{ color: 'inherit', textDecoration: 'underline', cursor: 'pointer' }}
                                >
                                    {details.full_course_name || selectedCourse}
                                </a>
                            </h3>

                            <div style={{ fontSize: '0.9rem', lineHeight: '1.4' }}>
                                {isValid(details.units) && <p style={{ margin: '5px 0' }}><strong>Units:</strong> {details.units}</p>}
                                {isValid(details.course_description) && <p style={{ margin: '5px 0' }}><strong>Description:</strong> {details.course_description}</p>}
                                {isValid(details.prerequisites) && <p style={{ margin: '5px 0' }}><strong>Prerequisites:</strong> {details.prerequisites}</p>}
                                {isValid(details.general_area) && <p style={{ margin: '5px 0' }}><strong>GE Areas:</strong> {details.general_area.join(', ')}</p>}
                                {isValid(details.special_area) && <p style={{ margin: '5px 0' }}><strong>Special Areas:</strong> {details.special_area.join(', ')}</p>}
                                {isValid(details.univ_req) && <p style={{ margin: '5px 0' }}><strong>University Requirements:</strong> {details.univ_req.join(', ')}</p>}
                                {isValid(details.advisor_comments) && <p style={{ margin: '5px 0' }}><strong>Advisor Comments:</strong> {details.advisor_comments}</p>}
                            </div>
                        </div>
                    );
                })()
            }
        </div >
    );
};
export default App;