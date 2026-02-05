import fs from 'fs';
import path from 'path';

// Define the output path
const OUTPUT_PATH = path.join(process.cwd(), 'public', 'courses_master.json');

// Mock Data (A small subset of courses for testing)
const mockCourses = {
    "CS8": {
        "course_code": "CS8",
        "units": "4",
        "course_description": "Introduction to Computer Science for non-majors. Python programming.",
        "advisor_comments": "N/A",
        "general_area": ["C"],
        "special_area": ["Q"],
        "prerequisites": "None",
        "univ_req": [],
        "full_course_name": "CS 8 - Intro to Computer Science"
    },
    "CS16": {
        "course_code": "CS16",
        "units": "4",
        "course_description": "Problem solving with C++.",
        "advisor_comments": "Core requirement for CS majors.",
        "general_area": [],
        "special_area": [],
        "prerequisites": "CS 8 or AP CS.",
        "univ_req": [],
        "full_course_name": "CS 16 - Problem Solving with Computer I"
    },
    "CS24": {
        "course_code": "CS24",
        "units": "4",
        "course_description": "Data structures and algorithms in C++.",
        "advisor_comments": "Difficult course.",
        "general_area": [],
        "special_area": [],
        "prerequisites": "CS 16",
        "univ_req": [],
        "full_course_name": "CS 24 - Problem Solving with Computer II"
    },
    "MATH3A": {
        "course_code": "MATH3A",
        "units": "4",
        "course_description": "Calculus for Science and Engineering I.",
        "advisor_comments": "N/A",
        "general_area": ["C"],
        "special_area": ["Q"],
        "prerequisites": "Placement Exam",
        "univ_req": [],
        "full_course_name": "MATH 3A - Calculus I"
    },
    "WRIT1E": {
        "course_code": "WRIT1E",
        "units": "4",
        "course_description": "Writing for Engineers.",
        "advisor_comments": "N/A",
        "general_area": ["A1"],
        "special_area": ["Writing"],
        "prerequisites": "Entry Level Writing",
        "univ_req": [],
        "full_course_name": "WRIT 1E - Approaches to University Writing for Engineers"
    }
};

fs.writeFileSync(OUTPUT_PATH, JSON.stringify(mockCourses, null, 4));
