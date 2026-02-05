export const GE_AREAS = {
    "Area A: English Reading & Comprehension": ["A-1", "A-2"],
    "Area D: Social Science": ["D-1", "D-2"],
    "Area E: Culture and Thought": ["E-1", "E-2"],
    "Area F: The Arts": ["F-1"],
    "Area G: Literature": ["G-1"],
    "Special Subject Areas": ["Ethnicity", "European Traditions or World Cultures"],
    "Writing Requirement": ["Writing-1", "Writing-2", "Writing-3", "Writing-4"]
};

// filters for search page
export const SEARCH_FILTERS = [
    "A1", "A2", "B", "C", "D", "E", "F", "G",
    "Writing",
    "Entry Level Writing",
    "American H & I",
    "World Cultures",
    "Ethnicity", "European Traditions"
];

// id, label, and type for each requirement area (as well as subrequirements)
export const ALL_SECTIONS = [
    { id: "univ-req", label: "University Requirements", type: "univ" },
    { id: "Area A: English Reading & Comprehension", label: "Area A: English Reading & Comprehension", type: "ge", subReqs: GE_AREAS["Area A: English Reading & Comprehension"] },
    { id: "Area D: Social Science", label: "Area D: Social Science", type: "ge", subReqs: GE_AREAS["Area D: Social Science"] },
    { id: "Area E: Culture and Thought", label: "Area E: Culture and Thought", type: "ge", subReqs: GE_AREAS["Area E: Culture and Thought"] },
    { id: "Area F: The Arts", label: "Area F: The Arts", type: "ge", subReqs: GE_AREAS["Area F: The Arts"] },
    { id: "Area G: Literature", label: "Area G: Literature", type: "ge", subReqs: GE_AREAS["Area G: Literature"] },
    { id: "Special Subject Areas", label: "Special Subject Areas", type: "ge", subReqs: GE_AREAS["Special Subject Areas"] },
    { id: "Writing Requirement", label: "Writing Requirement (4 Courses)", type: "ge", subReqs: GE_AREAS["Writing Requirement"] },
    { id: "major-prep", label: "Preparation for Major", type: "prep" },
    { id: "major-upper", label: "Upper Division Major Core", type: "upper" },
    { id: "major-electives", label: "Major Field Electives", type: "electives" },
    { id: "science-electives-a", label: "Science Electives List A", type: "sciA" },
    { id: "science-electives-b", label: "Science Electives List B", type: "sciB" }
];
