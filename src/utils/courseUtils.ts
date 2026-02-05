export const cleanCourseId = (courseName: string): string => {
    return "".concat(...courseName.trim().split(/[^a-zA-Z0-9]/g)).toUpperCase();
};

export const getCourseDetails = (courseName: string, courseData: Record<string, any>) => {
    const cleanCode = cleanCourseId(courseName);
    return courseData[cleanCode];
};

export const getUnitsForCourse = (
    courseName: string,
    manualUnits: Record<string, number>,
    courseData: Record<string, any>
): number => {
    const cleanCode = cleanCourseId(courseName);
    // if units were set by slider, return
    if (manualUnits[cleanCode]) {
        return manualUnits[cleanCode];
    }
    if (!courseData) return 0;
    const course = courseData[cleanCode];
    if (course && course.units) {
        if (course.units.includes("-")) {
            const parts = course.units.split("-");
            return parseFloat(parts[parts.length - 1]);
        }
        return parseFloat(course.units) || 0;
    }
    return 0;
};
