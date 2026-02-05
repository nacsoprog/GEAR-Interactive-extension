import type { ImportedCourse } from '../types';
import { gradeMap } from '../data/grades';
import { getUnitsForCourse, cleanCourseId } from './courseUtils';

export const calculateGPA = (
    importedCourseHistory: ImportedCourse[],
    manualGrades: Record<string, string>,
    manualUnits: Record<string, number>,
// eslint-disable-next-line @typescript-eslint/no-explicit-any
    courseData: Record<string, any>
) => {
    let allGradePoints = 0;
    let allGpaUnits = 0;
    let allUnits = 0;

    if (importedCourseHistory && importedCourseHistory.length > 0) {
        importedCourseHistory.forEach(course => {
            if (!isNaN(course.units)) {
                const g = course.grade.toUpperCase();
                if (g !== "F" && g !== "NP" && g !== "IP") {
                    allUnits += course.units;
                }
            }
            const gradeValue = gradeMap[course.grade.toUpperCase()];
            // Check for UC institutions for GPA calculation
            if ((["UCSB", "UCSC", "UCSD", "UCI", "UCR", "UCD", "UCM", "UCLA"].includes(course.institution)) && gradeValue !== undefined) {
                allGradePoints += (gradeValue * course.units);
                allGpaUnits += course.units;
            }
        });
    }

    Object.keys(manualGrades).forEach(cleanCode => {
        // Prevent double counting: Skip if course exists in GOLD history
        const existsInGold = importedCourseHistory.some(c => {
            const cClean = cleanCourseId(c.code.split('(')[0]);
            return cClean === cleanCode;
        });
        if (existsInGold) return;

        const grade = manualGrades[cleanCode];
        const units = getUnitsForCourse(cleanCode, manualUnits, courseData);

        if (units > 0) {
            const gradeValue = gradeMap[grade.toUpperCase()];
            if (gradeValue !== undefined) {
                allGradePoints += (gradeValue * units);
                allGpaUnits += units;
            }
        }
    });

    let gpa = "N/A";
    if (allGpaUnits > 0) {
        gpa = (allGradePoints / allGpaUnits).toFixed(2);
    } else {
        gpa = "IP";
    }

    return {
        allGradePoints,
        allGpaUnits,
        allUnits,
        gpa
    };
};

export const calculateGradeChange = (
    courseNameOrCode: string,
    isAdding: boolean,
    currentTotalPoints: number,
    currentTotalUnits: number,
    manualUnits: Record<string, number>,
// eslint-disable-next-line @typescript-eslint/no-explicit-any
    courseData: Record<string, any>,
    manualGrades?: Record<string, string>
) => {
    let cleanCode = "";
    let grade = "";

    // Parse input (either "CODE (GRADE)" or just "CODE")
    if (isAdding) {
        const gradeMatch = courseNameOrCode.match(/\(([^)]+)\)/);
        if (gradeMatch && gradeMatch[1]) {
            grade = gradeMatch[1].replace(" ", "").toUpperCase();
            cleanCode = courseNameOrCode.replace(/\([^)]+\)/, "").trim();
        } else {
            return null; // adding requires a grade in parens
        }
    } else {
        // Removing: input is regex-cleaned code, grade lookup via manualGrades
        cleanCode = courseNameOrCode;
        if (manualGrades) {
            grade = manualGrades[cleanCode];
        } else {
            return null;
        }
    }

    const points = gradeMap[grade];
    if (points !== undefined) {
        const units = getUnitsForCourse(cleanCode, manualUnits, courseData);
        let newTotalGradePoints = currentTotalPoints;
        let newTotalGpaUnits = currentTotalUnits;

        if (isAdding) {
            newTotalGradePoints += (units * points);
            newTotalGpaUnits += units;
        } else {
            newTotalGradePoints -= (units * points);
            newTotalGpaUnits -= units;
        }

        let newGpa = "IP";
        if (newTotalGpaUnits > 0) {
            newGpa = (newTotalGradePoints / newTotalGpaUnits).toFixed(2);
        }

        return {
            newTotalGradePoints,
            newTotalGpaUnits,
            newGpa
        };
    }
    return null;
};
