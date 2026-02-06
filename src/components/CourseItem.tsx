import React from 'react';
import type { CreditSource } from '../types';
import { getCourseDetails } from '../utils/courseUtils';
import { CREDIT_TO_UCSB_MAP } from '../data/HighSchoolCredit';

interface CourseItemProps {
    course: string;
    isChecked: boolean;
    onToggle: (id: string) => void;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    courseData: Record<string, any>;
    onRemove?: () => void;
    onRestore?: () => void;
    creditSources: CreditSource;
    coursesGOLD: string[];
    removedCourses: string[];
    // Simplified props: Child doesn't need the whole state record
    isPrereqExpanded: boolean;
    onTogglePrereq: () => void;
    onCourseClick: (course: string) => void;
}

export const CourseItem: React.FC<CourseItemProps> = ({
    course,
    isChecked,
    onToggle,
    courseData,
    onRemove,
    onRestore,
    creditSources,
    coursesGOLD,
    removedCourses,
    isPrereqExpanded, // Received as a boolean
    onTogglePrereq,   // Received as a simple function
    onCourseClick
}) => {
    // Logic: If in "Main View" mode (onRemove exists) and course is removed, hide it.
    if (onRemove && removedCourses.includes(course)) {
        return null;
    }

    const sourceLabel = creditSources[course];
    const majorFails = ["(C-)", "(D+)", "(D)", "(D-)", "(F)", "(NP)", "(P)"];
    const isFailing = sourceLabel && majorFails.some(fail => sourceLabel.includes(fail));

    const details = getCourseDetails(course, courseData);
    const shouldShowMeta = !isChecked && !isFailing;
    const units = (details && shouldShowMeta) ? <span className="course-units">{details.units}u</span> : "";

    // Prerequisite logic
    const hasPrereq = details && details.prerequisites !== "N/A";

    const prereqToggle = (hasPrereq && shouldShowMeta) ? (
        <button
            onClick={(e) => {
                e.preventDefault();
                onTogglePrereq();
            }}
            className="prereq-toggle-btn"
            style={{
                background: 'none', border: 'none', padding: 0,
                font: 'inherit', cursor: 'pointer'
            }}
        >
            {isPrereqExpanded ? "Prereq:" : "Prereq"}
        </button>
    ) : null;

    const prereqText = (hasPrereq && shouldShowMeta && isPrereqExpanded) ? <span className="prereq-text">{details.prerequisites}</span> : null;

    const showRemove = onRemove && !removedCourses.includes(course);
    const showRestore = onRestore;

    const sourceBaseClass = coursesGOLD.includes(course)
        ? "credit-source-GOLD"
        : (CREDIT_TO_UCSB_MAP[sourceLabel] ? "courses-HS" : "credit-source");

    const sourceClass = isFailing ? `${sourceBaseClass} failing-grade` : sourceBaseClass;

    return (
        <li key={course} id={`course-${course.replace(/\s+/g, '')}`} className="course-list-item">
            <input
                type="checkbox"
                id={course}
                checked={isChecked}
                onChange={() => onToggle(course)}
            />
            <label htmlFor={course}>
                <button
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onCourseClick(course);
                    }}
                    className="course-link click-target"
                    style={{ background: 'none', border: 'none', padding: 0, font: 'inherit', cursor: 'pointer' }}
                >
                    {course}
                </button>
                <span className="course-meta">
                    {units}
                    {prereqToggle}
                    {prereqText}
                </span>
                {sourceLabel && <span className={sourceClass}> {sourceLabel}</span>}
            </label>

            {showRemove && (
                <button
                    className="remove-course-btn"
                    onClick={(e) => { e.preventDefault(); onRemove?.(); }}
                    title="Remove course"
                    aria-label={`Remove ${course}`}
                >
                    −
                </button>
            )}

            {showRestore && (
                <button
                    className="restore-course-btn"
                    onClick={(e) => { e.preventDefault(); onRestore?.(); }}
                    title="Restore course"
                    aria-label={`Restore ${course}`}
                >
                    +
                </button>
            )}
        </li>
    );
};
