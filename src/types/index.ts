export type ChecklistState = { [key: string]: boolean };
export type CreditSource = { [key: string]: string };

export type GroupDef = {
    id: string;
    name: string;
    options: { courses: string[], units: number }[];
};

export type ImportedCourse = {
    code: string;
    units: number;
    grade: string;
    term: string;
    title: string;
    institution: string;
};

export type MajorRequirement = {
    prep: string[];
    upper: string[];
    prepUnits: number;
    upperUnits: number;
};

export interface GearState {
    currentPage?: 'home' | 'checklist' | 'search';
    selectedCreditSystem?: string;
    inputCourse?: string;
    selectedMajor?: string;
    checkedItems?: ChecklistState;
    creditSources?: CreditSource;
    collapsedSections?: ChecklistState;
    importedCourseHistory?: ImportedCourse[];
    coursesGOLD?: string[];
    manualUnits?: { [key: string]: number };
    showBannerTools?: boolean;
    addedCourses?: string[];
    removedCourses?: string[];
    hasCompletedSetup?: boolean;
    studentNotes?: string;
    isDarkMode?: boolean;
    hasSeenIntroPopup?: boolean;
}
