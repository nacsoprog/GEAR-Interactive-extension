/**
 * GEAR Interactive Content Script
 * * Interacts with UCSB's GOLD system to:
 * 1. Inject links to ucsbplat.com
 * 2. Display extra course info (descriptions, pre-reqs)
 * 3. Color-code sections based on availability
 * 4. Scrape course history
 */

// --- Types ---
interface CourseInfo {
    course_code: string;
    units: string;
    course_description: string;
    advisor_comments: string;
    general_area: string[];
    special_area: string[];
    prerequisites: string;
    univ_req: string[];
}

interface ScrapedCourse {
    code: string;
    grade: string;
    units: number;
    term: string;
    title: string;
    institution: string;
}

// Global cache for course data
let courseData: Record<string, CourseInfo> = {};

// --- Utilities ---

/**
 * Normalizes course titles (e.g. "EACS 4A - East Asian..." -> "EACS4A")
 */
const getCleanCourseCode = (rawTitle: string): string => {
    if (!rawTitle) return "";
    const parts = rawTitle.split('-');
    if (parts.length > 0) {
        let code = parts[0].trim().toUpperCase();
        code = code.replace(/\s+/g, ' ');
        return code;
    }
    return "";
};

/**
 * Creates a collapsible DOM element for course details
 */
const createCollapsible = (label: string, content: string): HTMLElement | null => {
    if (!content || content === "N/A" || content.trim() === "") return null;

    const container = document.createElement('div');
    Object.assign(container.style, {
        marginBottom: "4px",
        fontSize: "0.9em",
        color: "#333"
    });

    const toggle = document.createElement('span');
    toggle.innerText = `▶ ${label}`;
    Object.assign(toggle.style, {
        cursor: "pointer",
        color: "#003660",
        fontWeight: "600",
        marginRight: "5px",
        userSelect: "none"
    });

    const textDiv = document.createElement('div');
    textDiv.innerText = content;
    Object.assign(textDiv.style, {
        display: "none",
        paddingLeft: "16px",
        marginTop: "2px",
        whiteSpace: "pre-wrap",
        lineHeight: "1.4",
        color: "#555"
    });

    toggle.onclick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        const isHidden = textDiv.style.display === "none";
        textDiv.style.display = isHidden ? "block" : "none";
        toggle.innerText = isHidden ? `▼ ${label}` : `▶ ${label}`;
    };

    container.appendChild(toggle);
    container.appendChild(textDiv);
    return container;
};

// --- CSS Injection ---
const injectGlobalStyles = () => {
    if (document.getElementById('gear-global-styles')) return;

    const style = document.createElement('style');
    style.id = 'gear-global-styles';
    style.textContent = `
        /* --- General Fixes --- */
        .datatableNew { border: none !important; box-shadow: none !important; }

        /* --- Full Course (Red) --- */
        .full-course, .full-course .row {
            background-color: #ffe0e0 !important;
            border-color: #d9534f !important;
        }
        .courseSearchHeader.full-course { border-top: 1px solid #d9534f !important; }
        
        /* --- Open Course (Green) --- */
        .open-course, .open-course .row {
            background-color: #f2fff4 !important;
            border-color: #4cae4c !important;
        }
        .courseSearchHeader.open-course { border-top: 1px solid #4cae4c !important; }

        /* --- Link Styling --- */
        .gear-plat-link {
            color: #1e70b8; text-decoration: underline; font-weight: bold; transition: color 0.2s;
        }
        .gear-plat-link:hover { color: #aa930f; }

        /* --- Details Container --- */
        .gear-details-container {
            width: 100%; clear: both; padding: 8px 15px; margin-bottom: 5px;
        }
        
        /* --- Hide Full Sections Feature --- */
        body.gear-hide-full-sections .gear-full-section { display: none !important; }
        
        .gear-toggle-container {
            display: inline-flex; align-items: center; margin-left: 10px;
            vertical-align: middle; background: #fff; padding: 4px 8px;
            border-radius: 4px; border: 1px solid #ccc;
        }
        .gear-toggle-container label { margin-left: 6px; cursor: pointer; font-weight: 600; font-size: 0.9em; }
    `;
    document.head.appendChild(style);
};

// --- Automation & Scraping ---

const scrapeCourseHistory = (): ScrapedCourse[] => {
    const foundCourses: ScrapedCourse[] = [];
    const historyContainer = document.getElementById('pageContent_CourseHistory');

    if (!historyContainer) {
        console.warn("GEAR: Course History tab not active.");
        return [];
    }

    const rows = historyContainer.querySelectorAll('tr.GridRow_Windows, tr.GridAltRow_Windows');
    rows.forEach(row => {
        const cells = row.querySelectorAll('td');
        if (cells.length >= 9) {
            const ucsbEquiv = cells[3]?.textContent?.trim() || "";
            if (ucsbEquiv && ucsbEquiv !== "-") {
                foundCourses.push({
                    code: ucsbEquiv,
                    grade: cells[4]?.textContent?.trim() || "",
                    units: parseFloat(cells[5]?.textContent?.trim() || "0"),
                    term: cells[0]?.textContent?.trim() || "",
                    title: cells[1]?.textContent?.trim() || "",
                    institution: cells[8]?.textContent?.trim() || ""
                });
            }
        }
    });
    return foundCourses;
};

// Message Listener
chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
    // 1. Import Courses
    if (request.action === "IMPORT_COURSES") {
        sendResponse({ result: scrapeCourseHistory() });
        return true;
    }

    // 2. Automate Subject Search (e.g. "CMPSC")
    if (request.action === "AUTOMATE_SUBJECT_SEARCH") {
        const dropdown = document.getElementById('pageContent_subjectAreaDropDown') as HTMLSelectElement;
        if (dropdown && request.subject) {
            dropdown.value = request.subject;
            dropdown.dispatchEvent(new Event('change', { bubbles: true }));
            sendResponse({ success: true });
        } else {
            sendResponse({ success: false });
        }
        return true;
    }

    // 3. Automate GE/Criteria Search
    if (request.action === "AUTOMATE_GOLD_SEARCH") {
        try {
            // Select College (Engineering hack)
            const collegeDrop = document.getElementById('pageContent_GECollegeDropDown') as HTMLSelectElement;
            if (collegeDrop) {
                collegeDrop.value = "ENGR";
                collegeDrop.dispatchEvent(new Event('change', { bubbles: true }));
            }

            // Reset Subject Area
            const subjectDrop = document.getElementById('pageContent_subjectAreaDropDown') as HTMLSelectElement;
            if (subjectDrop) {
                subjectDrop.value = "";
                subjectDrop.dispatchEvent(new Event('change', { bubbles: true }));
            }

            // Select Area
            const areaDrop = document.getElementById('pageContent_GECodeDropDown') as HTMLSelectElement;
            if (areaDrop && request.area) {
                // Map short codes to dropdown values
                const areaMap: Record<string, string> = {
                    "Writing": "WRT", "Entry Level Writing": "SUB", "American H & I": "AMH",
                    "World Cultures": "NWC", "Ethnicity": "ETH", "European Traditions": "EUR",
                    "A1": "A1 ", "A2": "A2 ", "B": "B  ", "C": "C  ",
                    "D": "D  ", "E": "E  ", "F": "F  ", "G": "G  "
                };
                areaDrop.value = areaMap[request.area] || request.area;
                areaDrop.dispatchEvent(new Event('change', { bubbles: true }));
            }

            // Check Open Sections
            const openCheck = document.getElementById('pageContent_openSectionsOnlyCheckBox') as HTMLInputElement;
            if (openCheck) {
                openCheck.checked = true;
                openCheck.dispatchEvent(new Event('change', { bubbles: true }));
            }

            // Times
            const startDrop = document.getElementById('pageContent_startTimeFromDropDown') as HTMLSelectElement;
            const endDrop = document.getElementById('pageContent_startTimeToDropDown') as HTMLSelectElement;
            if (request.startTime && startDrop) startDrop.value = (request.startTime * 100).toString();
            if (request.endTime && endDrop) endDrop.value = (request.endTime * 100).toString();

            sendResponse({ success: true });
        } catch (e) {
            sendResponse({ success: false, error: (e as Error).message });
        }
        return true;
    }
});

// --- DOM Injection Logic ---

const createLink = (code: string, displayText: string) => {
    const link = document.createElement('a');
    link.href = `https://ucsbplat.com/curriculum/course/${encodeURIComponent(code)}`;
    link.target = "_blank";
    link.className = "gear-plat-link";
    link.textContent = displayText;
    link.onclick = (e) => e.stopPropagation();
    return link;
};

const processCourseHeader = (header: Element) => {
    if (header.getAttribute('data-gear-injected') === 'true') return;

    // 1. Identify context (Search vs Cart)
    const cartSpan = header.querySelector('span[id*="regCartCourseId"]');
    const rawTitle = (cartSpan ? cartSpan.textContent : header.textContent) || "";
    const displayCode = getCleanCourseCode(rawTitle);
    const lookupCode = displayCode.replace(/\s+/g, '');

    if (!courseData[lookupCode]) return; // Skip if not in our DB

    // 2. Inject Link
    if (cartSpan) {
        // Cart View
        const link = createLink(displayCode, displayCode);
        cartSpan.textContent = "";
        cartSpan.appendChild(link);
        header.closest('.scheduleItem')?.classList.add('gear-cart-item');
    } else {
        // Search View
        const splitIndex = rawTitle.indexOf("-");
        if (splitIndex !== -1) {
            const rest = rawTitle.substring(splitIndex);
            header.textContent = "";
            header.appendChild(createLink(displayCode, displayCode));
            header.appendChild(document.createTextNode(" " + rest));
        } else {
            header.textContent = "";
            header.appendChild(createLink(displayCode, displayCode));
        }
    }

    // 3. Inject Areas Label
    const info = courseData[lookupCode];
    const allAreas = [...(info.general_area || []), ...(info.special_area || []), ...(info.univ_req || [])].join(", ");

    if (allAreas) {
        const areaSpan = document.createElement('span');
        areaSpan.innerText = ` | Areas: ${allAreas}`;
        Object.assign(areaSpan.style, {
            color: "#003660", fontWeight: "bold", fontSize: "0.9em", marginLeft: "8px"
        });
        header.appendChild(areaSpan);
    }

    // 4. Create Detail Box
    const detailsBox = document.createElement('div');
    detailsBox.className = "gear-details-container";

    const elements = [
        createCollapsible("Description", info.course_description),
        createCollapsible("Advisor Comments", info.advisor_comments),
        createCollapsible("Prerequisites", info.prerequisites)
    ].filter(el => el !== null) as HTMLElement[];

    if (elements.length > 0) {
        elements.forEach(el => detailsBox.appendChild(el));

        // Find insertion point
        const searchHeader = header.closest('.courseSearchHeader');
        if (searchHeader && searchHeader.nextElementSibling) {
            searchHeader.parentNode?.insertBefore(detailsBox, searchHeader.nextElementSibling);
        } else {
            const item = header.closest('.scheduleItem');
            item?.appendChild(detailsBox);
        }
    }

    // 5. Determine Availability (Full/Open)
    const container = header.closest('.courseSearchHeader') || header.closest('.scheduleItem');
    // Find all related rows for this course
    const relatedRows: Element[] = [];
    if (container?.classList.contains('courseSearchHeader')) {
        let next = container.nextElementSibling;
        while (next && !next.classList.contains('courseSearchHeader')) {
            relatedRows.push(next);
            next = next.nextElementSibling;
        }
    } else if (container) {
        relatedRows.push(container);
    }

    // Check availability logic
    let isFull = true;
    let hasSections = false;

    relatedRows.forEach(row => {
        // Mark full sections for hiding later
        const subRows = row.querySelectorAll('.row.subSessionItem, .row.susbSessionItem, .row.session.info');
        subRows.forEach(sub => {
            const txt = sub.textContent?.toLowerCase() || "";
            if (!/\d/.test(txt.replace(/space:?/g, '')) && !txt.includes('space')) {
                // Logic to identify 0 space specifically involves DOM traversal to the label
                const labels = Array.from(sub.querySelectorAll('label'));
                const spaceLabel = labels.find(l => l.textContent?.includes("Space"));
                if (spaceLabel?.parentElement) {
                    const val = spaceLabel.parentElement.textContent?.replace("Space", "").trim();
                    if (val === "0" || val === "Full") sub.closest('.row')?.classList.add('gear-full-section');
                }
            }
        });

        // Check main sections for global coloring
        const mainInfo = row.querySelectorAll('.row.info:not(.session)');
        mainInfo.forEach(infoRow => {
            const labels = Array.from(infoRow.querySelectorAll('label'));
            const spaceLabel = labels.find(l => l.textContent?.includes("Space"));
            if (spaceLabel?.parentElement) {
                hasSections = true;
                const txt = spaceLabel.parentElement.textContent?.toLowerCase() || "";
                // Logic: If NOT full/closed/cancel and NOT 0 space, it's open
                if (!txt.includes("full") && !txt.includes("closed") && !txt.includes("cancel") && !/space:\s*0\b/.test(txt)) {
                    isFull = false;
                }
            }
        });
    });

    if (hasSections) {
        const statusClass = isFull ? 'full-course' : 'open-course';
        container?.classList.add(statusClass);
        if (detailsBox) detailsBox.classList.add(statusClass);
    }

    header.setAttribute('data-gear-injected', 'true');
};

const injectToggle = () => {
    const target = document.getElementById('pageContent_modifySearchTopButton');
    if (!target || document.getElementById('gear-full-toggle')) return;

    const container = document.createElement('div');
    container.className = 'gear-toggle-container';

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.id = 'gear-full-toggle';

    // Load State
    chrome.storage.sync.get(['hideFullSections'], (res) => {
        const shouldHide = res.hideFullSections !== false; // Default true
        checkbox.checked = shouldHide;
        if (shouldHide) document.body.classList.add('gear-hide-full-sections');
    });

    checkbox.onchange = (e) => {
        const isChecked = (e.target as HTMLInputElement).checked;
        if (isChecked) document.body.classList.add('gear-hide-full-sections');
        else document.body.classList.remove('gear-hide-full-sections');
        chrome.storage.sync.set({ hideFullSections: isChecked });
    };

    const label = document.createElement('label');
    label.htmlFor = 'gear-full-toggle';
    label.textContent = 'Hide Full Sections';

    container.append(checkbox, label);
    target.parentNode?.insertBefore(container, target.nextSibling);
};

// --- Initialization ---

const init = async () => {
    try {
        // Load Data
        const url = chrome.runtime.getURL('courses_master.json');
        const response = await fetch(url);
        courseData = await response.json();

        injectGlobalStyles();

        // Observer
        const observer = new MutationObserver(() => {
            // Only run if we are on a relevant page/state
            const courseHeaders = document.querySelectorAll('.courseTitle');
            if (courseHeaders.length > 0) {
                courseHeaders.forEach(processCourseHeader);
                injectToggle();
            }
        });

        // Observe specific content area to reduce overhead
        const contentArea = document.getElementById('pageContent');
        if (contentArea) {
            observer.observe(contentArea, { childList: true, subtree: true });
        } else {
            // Fallback
            observer.observe(document.body, { childList: true, subtree: true });
        }

        // Initial Run
        document.querySelectorAll('.courseTitle').forEach(processCourseHeader);
        injectToggle();

    } catch (e) {
        console.error("GEAR: Init failed", e);
    }
};

init();