import { CREDIT_TO_UCSB_MAP } from '../data/HighSchoolCredit';
import { CREDIT_SYSTEMS } from '../data/creditSystems';

export const mergeImportedData = (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    importedCourses: any[],
    currentAddedCourses: string[],
    currentManualGrades: Record<string, string>,
    currentManualUnits: Record<string, number>,
    currentChecks: Record<string, boolean>,
    currentSources: Record<string, string>,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    courseData: any
) => {
    const goldCleanCodes = importedCourses.map(c =>
        c.code.replace(/[^a-zA-Z0-9]/g, "").toUpperCase()
    );

    // 1. Filter added courses: Remove manual entries that now exist in GOLD
    const newAddedCourses = currentAddedCourses.filter(added => {
        const clean = added.split('(')[0].replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
        return !goldCleanCodes.includes(clean);
    });

    // 2. Garbage Collect Grades/Units for removed manual courses
    const persistentCleanCodes = newAddedCourses.map(c =>
        c.split('(')[0].replace(/[^a-zA-Z0-9]/g, "").toUpperCase()
    );

    const newGrades = { ...currentManualGrades };
    const newUnits = { ...currentManualUnits };

    Object.keys(newGrades).forEach(k => !persistentCleanCodes.includes(k) && delete newGrades[k]);
    Object.keys(newUnits).forEach(k => !persistentCleanCodes.includes(k) && delete newUnits[k]);

    // 3. Recalculate Units for remaining manual courses
    let preservedUnits = 0;
    persistentCleanCodes.forEach(code => {
        if (newUnits[code]) {
            preservedUnits += newUnits[code];
        } else {
            const d = courseData[code];
            if (d && !isNaN(parseFloat(d.units))) preservedUnits += parseFloat(d.units);
        }
    });

    // 4. Clean Checklist: Remove stale items not in HS, Manual, or new GOLD
    const newChecks = { ...currentChecks };
    const newSources = { ...currentSources };

    Object.keys(newSources).forEach(reqId => {
        const source = newSources[reqId];
        const isHS = CREDIT_TO_UCSB_MAP[source] || Object.values(CREDIT_SYSTEMS).some(l => l.includes(source));

        // Keep HS if checked
        if (isHS && newChecks[source]) return;

        // Keep Manual if it persists in our manual list
        const cleanSource = source.split('(')[0].replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
        if (persistentCleanCodes.includes(cleanSource)) return;

        // Stale item (e.g. old manual input that was deleted, or old GOLD data)
        delete newSources[reqId];
        newChecks[reqId] = false;
    });

    return {
        newAddedCourses,
        newGrades,
        newUnits,
        preservedUnits,
        newChecks,
        newSources
    };
};
