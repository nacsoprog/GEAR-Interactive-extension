import { COURSE_GROUPS } from '../data/courseGroups';
import { MAJOR_REQUIREMENTS } from '../data/majorRequirements';
import { UPPER_DIV_ELECTIVES, SCIENCE_ELECTIVES } from '../data/electives';
import { getUnitsForCourse } from './courseUtils';
import type { ChecklistState, CreditSource } from '../types';

export const getSectionStatus = (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    section: any,
    selectedMajor: string,
    checkedItems: ChecklistState,
    manualUnits: Record<string, number>,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    courseData: Record<string, any>
): string => {
    if (section.type !== 'electives' && section.type !== 'sciA' && section.type !== 'sciB' && section.type !== 'prep' && section.type !== 'upper') return "";
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

    if (section.type === 'prep') {
        reqUnits = MAJOR_REQUIREMENTS[selectedMajor]?.prepUnits || 0;
        sumUnits(MAJOR_REQUIREMENTS[selectedMajor]?.prep || []);
    } else if (section.type === 'electives') {
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
    } else if (section.type === 'sciA') {
        reqUnits = 8;
        sumUnits(SCIENCE_ELECTIVES["List A"]);
    } else if (section.type === 'sciB') {
        reqUnits = 12;
        sumUnits(SCIENCE_ELECTIVES["List B"]);
    } else if (section.type === 'upper') {
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

export const findMatchingRequirementID = (
    cleanInputCode: string,
    selectedMajor: string
): string | null => {
    // Helper to search lists/groups
    const checkList = (list: string[]) => {
        for (const item of list) {
            if (item.startsWith("GROUP:")) {
                const group = COURSE_GROUPS[item.split(":")[1]];
                for (const opt of group?.options || []) {
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

    // Major specific logic
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

    const eleMatch = (UPPER_DIV_ELECTIVES[selectedMajor] || []).find(req =>
        req.replace(/[^a-zA-Z0-9]/g, "").toUpperCase() === cleanInputCode
    );

    return eleMatch || null;
};

export const updateGEState = (
    cleanCode: string,
    sourceLabel: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    courseInfo: any,
    newChecks: ChecklistState,
    newSources: CreditSource,
    newCoursesGOLD: string[],
    isGOLD: boolean,
    isFailing: boolean
) => {
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
        if (coreAreaFilled) break; // Stop if a core area has already been matched

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
                // Check if c1 can be overwritten
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
                    if (isGOLD && !newCoursesGOLD.includes(writingId) && !isFailing) newCoursesGOLD.push(writingId);
                    return;
                }

                if (!newChecks[writingId] && !sourceLabel.includes("CREDIT")) {
                    if (!isFailing) newChecks[writingId] = true;
                    newSources[writingId] = sourceLabel;
                    if (isGOLD && !newCoursesGOLD.includes(writingId) && !isFailing) newCoursesGOLD.push(writingId);
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
