import type { GroupDef } from "../types";

export const COURSE_GROUPS: { [key: string]: GroupDef } = {
    "CHEM_SERIES_CHEME": {
        id: "chem_series_cheme",
        name: "Chemistry Series",
        options: [
            { courses: ["CHEM 1A", "CHEM 1B", "CHEM 1C"], units: 10 },
            { courses: ["CHEM 3A", "CHEM 3B", "CHEM 3C"], units: 10 }
        ]
    },
    "CHEM_SERIES_UPPERA_CHEME": {
        id: "chem_series_uppera_cheme",
        name: "Upper Division(A) Chemistry Series",
        options: [
            { courses: ["CHEM 109A"], units: 4 },
            { courses: ["CHEM 130A"], units: 4 }
        ]
    },
    "CHEM_SERIES_UPPERB_CHEME": {
        id: "chem_series_upperb_cheme",
        name: "Upper Division(B) Chemistry Series",
        options: [
            { courses: ["CHEM 109B"], units: 4 },
            { courses: ["CHEM 130B"], units: 4 }
        ]
    },
    "MATH4A_CHEME": {
        id: "math4a_cheme",
        name: "Math 4A Series",
        options: [
            { courses: ["MATH 4A"], units: 4 },
            { courses: ["MATH 4AI"], units: 4 }
        ]
    },
    "MATH4B_CHEME": {
        id: "math4b_cheme",
        name: "Math 4B Series",
        options: [
            { courses: ["MATH 4B"], units: 4 },
            { courses: ["MATH 4BI"], units: 4 }
        ]
    },
    "MATH6A_CHEME": {
        id: "math6a_cheme",
        name: "Math 6A Series",
        options: [
            { courses: ["MATH 6A"], units: 4 },
            { courses: ["MATH 6AI"], units: 4 }
        ]
    },
    "MATRL_CHEME": {
        id: "matrl_cheme",
        name: "Matrl Series",
        options: [
            { courses: ["MATRL 101"], units: 3 },
            { courses: ["MATRL 100C"], units: 3 }
        ]
    },
    "CHEM_TRACK_MECHE": {
        id: "chem_track_meche",
        name: "Chemistry Track",
        options: [
            { courses: ["CHEM 1A", "CHEM 1B", "CHEM 2AL"], units: 9.5 },
            { courses: ["CHEM 2A", "CHEM 2B", "CHEM 2AC"], units: 9.5 }
        ]
    },
    "MATRL_MECHE": {
        id: "matrl_meche",
        name: "Matrl Series",
        options: [
            { courses: ["MATRL 101"], units: 3 },
            { courses: ["MATRL 100C"], units: 3 }
        ]
    },
    "UPPER_DIV_MECHE": {
        id: "upper_div_meche",
        name: "Upper Division Major Requirement",
        options: [
            { courses: ["ME 154"], units: 3 },
            { courses: ["ME 157"], units: 3 },
            { courses: ["ME 167"], units: 3 }
        ]
    },
    "INTRO_SCI_EE": {
        id: "intro_sci_ee",
        name: "Intro Science/Engr",
        options: [
            { courses: ["CHEM 1A"], units: 4 },
            { courses: ["CHEM 2A"], units: 4 },
            { courses: ["ECE 6"], units: 4 }
        ]
    },
    "COMPSCI_EE": {
        id: "compsci_ee",
        name: "Comp Sci Intro",
        options: [
            { courses: ["CMPSC 9"], units: 4 },
            { courses: ["CMPSC 16"], units: 4 },
        ]
    },
    "MATH_EE": {
        id: "math_ee",
        name: "Math Series",
        options: [
            { courses: ["MATH 2A", "MATH 2B"], units: 10 },
            { courses: ["MATH 3A", "MATH 3B"], units: 8 },
        ]
    },
    "MATH_SERIES_COMPE": {
        id: "math_series_compe",
        name: "Math Series",
        options: [
            { courses: ["MATH 2A", "MATH 2B"], units: 10 },
            { courses: ["MATH 3A", "MATH 3B"], units: 8 },
        ]
    },
    "UPPER_DIV_COMPE": {
        id: "upper_div_compe",
        name: "Upper Division Major Requirement",
        options: [
            { courses: ["ECE 139"], units: 4 },
            { courses: ["PSTAT 120A"], units: 4 }
        ]
    },
};
