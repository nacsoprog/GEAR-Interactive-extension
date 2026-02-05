import type { MajorRequirement } from "../types";

export const MAJOR_REQUIREMENTS: { [key: string]: MajorRequirement } = {
    "CS": {
        prep: ["CMPSC 16", "CMPSC 24", "CMPSC 32", "CMPSC 40", "CMPSC 64", "MATH 3A", "MATH 3B", "MATH 4A", "MATH 4B", "MATH 6A", "PSTAT 120A"],
        upper: ["CMPSC 130A", "CMPSC 130B", "ENGR 101"],
        prepUnits: 45,
        upperUnits: 11
    },
    "CompE": {
        prep: ["CMPSC 16", "CMPSC 24", "CMPSC 32", "CMPSC 40", "ECE 1A", "ECE 1B", "ECE 5", "ECE 10A", "ECE 10AL", "ECE 10B", "ECE 10BL", "ECE 10C", "ECE 10CL", "ECE 15A", "GROUP:MATH_SERIES_COMPE", "MATH 4A", "MATH 4B", "MATH 6A", "PHYS 7A", "PHYS 7B", "PHYS 7C", "PHYS 7D", "PHYS 7L"],
        upper: ["CMPSC 130A", "GROUP:UPPER_DIV_COMPE", "ECE 152A", "ECE 154A", "ENGR 101", "CMPSC 189A", "CMPSC 189B", "ECE 189A", "ECE 189B", "ECE 189C"],
        prepUnits: 78,
        upperUnits: 32 //28 or 32
    },
    "EE": {
        prep: ["GROUP:INTRO_SCI_EE", "GROUP:COMPSCI_EE", "ECE 3", "ECE 5", "ECE 10A", "ECE 10AL", "ECE 10B", "ECE 10BL", "ECE 10C", "ECE 10CL", "ECE 15A", "GROUP:MATH_EE", "MATH 4A", "MATH 4B", "MATH 6A", "MATH 6B", "PHYS 7A", "PHYS 7B", "PHYS 7C", "PHYS 7D", "PHYS 7L", "ECE 130A", "ECE 130B", "ECE 139"],
        upper: ["ECE 134", "ECE 152A", "ECE 153A", "ECE 153B", "ECE 188A", "ECE 188B", "ECE 188C", "ENGR 101"],
        prepUnits: 87,
        upperUnits: 28 //28 or 32
    },
    "MechE": {
        prep: ["GROUP:CHEM_TRACK_MECHE", "ENGR 3", "MATH 3A", "MATH 3B", "MATH 4A", "MATH 4B", "MATH 6A", "MATH 6B", "ME 6", "ME 10", "ME 12S", "ME 14", "ME 15", "ME 16", "ME 17", "PHYS 7A", "PHYS 7B", "PHYS 7C", "PHYS 7D", "PHYS 7L"],
        upper: ["GROUP:MATRL_MECHE", "ME 103", "ME 104", "ME 107", "ME 108", "ME 151A", "ME 151B", "ME 152A", "ME 153", "ME 105", "GROUP:UPPER_DIV_MECHE", "ME 156A", "ME 156B", "ME 189A", "ME 189B", "ME 189C"],
        prepUnits: 76.5,
        upperUnits: 54
    },
    "ChemE": {
        prep: ["CHE 5", "CHE 10", "GROUP:CHEM_SERIES_CHEME", "CHEM 2AL", "CHEM 2BL", "CHEM 6AL", "CHEM 6BL", "GROUP:CHEM_SERIES_UPPERA_CHEME", "GROUP:CHEM_SERIES_UPPERB_CHEME", "ENGR 3", "MATH 3A", "MATH 3B", "GROUP:MATH4A_CHEME", "GROUP:MATH4B_CHEME", "GROUP:MATH6A_CHEME", "MATH 6B", "PHYS 7A", "PHYS 7B", "PHYS 7C", "PHYS 7L"],
        upper: ["CHE 107", "CHE 110A", "CHE 110B", "CHE 118", "CHE 120A", "CHE 120B", "CHE 120C", "CHE 128", "CHE 132A", "CHE 132B", "CHE 132C", "CHE 140A", "CHE 140B", "CHE 152A", "CHE 180A", "CHE 180B", "CHE 184A", "CHE 184B", "CHEM 113B", "CHEM 113C", "GROUP:MATRL_CHEME"],
        prepUnits: 75,
        upperUnits: 66
    }
};
