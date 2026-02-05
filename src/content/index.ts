/**
 * GEAR Interactive Content Script
 * 
 * This script runs on UCSB's GOLD (Gaucho On-Line Data) pages.
 * It is responsible for:
 * 1. Injecting GEAR links and course info directly into the course schedule/search.
 * 2. Scraping course history for the "Import from GOLD" feature.
 * 3. Automating search interactions for the GEAR "Search" tool.
 */

// Types
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
let courseData: Record<string, CourseInfo> = {};

// get the clean course code (ie. EACS 4A - East Asian Culture Studies -> EACS4A)
const getCleanCourseCode = (rawTitle: string): string => {
    const parts = rawTitle.split('-');
    if (parts.length > 0) {
        return parts[0].replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
    }
    return "";
};

// create collapsible for course details in GOLD
const createCollapsible = (label: string, content: string) => {
    if (!content || content === "N/A" || content.trim() === "") return null;

    const container = document.createElement('div');
    container.style.marginBottom = "4px";
    container.style.fontSize = "0.9em";
    container.style.color = "#333";

    const toggle = document.createElement('span');
    toggle.innerText = `▶ ${label}`;
    toggle.style.cursor = "pointer";
    toggle.style.color = "#003660";
    toggle.style.fontWeight = "600";
    toggle.style.marginRight = "5px";
    toggle.style.userSelect = "none";

    const textDiv = document.createElement('div');
    textDiv.innerText = content;
    textDiv.style.display = "none";
    textDiv.style.paddingLeft = "16px";
    textDiv.style.marginTop = "2px";
    textDiv.style.whiteSpace = "pre-wrap";
    textDiv.style.lineHeight = "1.4";
    textDiv.style.color = "#555";

    toggle.onclick = () => {
        if (textDiv.style.display === "none") {
            textDiv.style.display = "block";
            toggle.innerText = `▼ ${label}`;
        } else {
            textDiv.style.display = "none";
            toggle.innerText = `▶ ${label}`;
        }
    };
    container.appendChild(toggle);
    container.appendChild(textDiv);
    return container;
};

// css injection
const style = document.createElement('style');
style.innerHTML = `
    /* --- Remove grey border --- */
    .datatableNew {
        border: none !important;
        box-shadow: none !important;
    }

    /* --- RED (FULL) STYLES --- */
    .courseSearchHeader.full-course {
        padding: 6px !important;
        margin-top: 15px !important;
        background-color: #ffe0e0 !important; /* Light Red */
        border-bottom: 1px solid #d9534f !important;
        border-top: 1px solid #d9534f !important;
    }
    .courseSearchItem.full-course{
        background-color: #ffe0e0 !important;
        border: 1px solid #d9534f !important;
        padding: 8px 5px !important;
    }
    .scheduleItem.full-course {
        margin-top: 20px !important;
        background-color: #ffe0e0 !important;
        border-top: 1px dotted #d9534f !important;
    }
    /* --- FORCE Inner Rows to be Red --- */
    .courseSearchItem.full-course .row,
    .courseSearchItem.full-course .row.session,
    .courseSearchItem.full-course .row.info,
    .scheduleItem.full-course .row {
        background-color: #ffe0e0 !important;
    }
    .gear-details-container.full-course {
        background-color: #ffe0e0 !important;
        border-bottom: 1px dashed #d9534f !important;
    }

    /* --- GREEN (OPEN) STYLES --- */
    .courseSearchHeader.open-course {
        padding: 6px !important;
        margin-top: 15px !important;
        background-color: #f2fff4 !important; /* Light Green */
        border-bottom: 1px solid #4cae4c !important;
        border-top: 1px solid #4cae4c !important;
    }
    .courseSearchItem.open-course{
        background-color: #f2fff4 !important;
        border: 1px solid #4cae4c !important;
        padding: 8px 5px !important;
    }
    .scheduleItem.open-course {
        margin-top: 20px !important;
        background-color: #f2fff4 !important;
        border-top: 1px dotted #4cae4c !important;
    }
    /* --- FORCE Inner Rows to be Green --- */
    .courseSearchItem.open-course .row,
    .courseSearchItem.open-course .row.session,
    .courseSearchItem.open-course .row.info,
    .scheduleItem.open-course .row {
        background-color: #f2fff4 !important;
    }
    .gear-details-container.open-course {
        background-color: #f2fff4 !important;
        border-bottom: 1px dashed #ccc;
    }

    /* --- Layout for Details --- */
    .gear-details-container {
        width: 100%;
        clear: both;
        padding: 8px 15px;
        margin-bottom: 5px;
    }

    /* --- New Link Style --- */
    .gear-plat-link {
        color: #1e70b8ff;
        text-decoration: underline;
        font-weight: bold;
        transition: color 0.2s;
    }
    .gear-plat-link:hover {
        color: #aa930fff;    /* --- SCHEDULE PAGE FIXES (CART ONLY) --- */
    }
    .gear-cart-item > .row {
        display: flex !important;
        flex-wrap: nowrap !important;
        align-items: center !important;
    }
    .gear-cart-item > .row::before,
    .gear-cart-item > .row::after {
        display: none !important;
    }

    /* --- Title Column --- */
    .gear-cart-item > .row > div:nth-of-type(1) {
        flex: 1 1 auto !important;
        min-width: 0 !important;
        width: auto !important;
    }

    /* --- Info Column --- */
    .gear-cart-item > .row > div:nth-of-type(2) {
        flex: 0 0 auto !important;
        width: auto !important;
        white-space: nowrap !important;
        text-align: right !important;
        padding-right: 15px !important;
    }

    /* --- Actions Column --- */
    .gear-cart-item > .row > div:nth-of-type(3) {
        flex: 0 0 auto !important;
        width: auto !important;
        text-align: right !important;
    }

    /* --- One Line Title --- */
    .scheduleItem .courseTitle {
        white-space: nowrap !important;
        overflow: hidden !important;
        text-overflow: ellipsis !important;
        display: block !important;
        margin-bottom: 0 !important;
        max-width: 100% !important;
    }
`;
document.head.appendChild(style);

// listen for import GOLD button request
chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
    if (request.action === "IMPORT_COURSES") {
        const scrapedData = scrapeCourseHistory();
        sendResponse({ result: scrapedData });
    } else if (request.action === "AUTOMATE_GOLD_SEARCH") {
        const collegeDropdown = document.getElementById('pageContent_GECollegeDropDown') as HTMLSelectElement;
        const areaDropdown = document.getElementById('pageContent_GECodeDropDown') as HTMLSelectElement;
        const openSectionsCheckbox = document.getElementById('pageContent_openSectionsOnlyCheckBox') as HTMLInputElement;
        const startTimeDropdown = document.getElementById('pageContent_startTimeFromDropDown') as HTMLSelectElement;
        const endTimeDropdown = document.getElementById('pageContent_startTimeToDropDown') as HTMLSelectElement;

        let success = true;
        let error = "";

        // 1. Select College
        if (collegeDropdown) {
            // Set flag to persist selection across reloads
            sessionStorage.setItem('gear_auto_select_engr', 'true');
            sessionStorage.setItem('gear_auto_select_attempts', '0');

            collegeDropdown.value = "ENGR";
            collegeDropdown.dispatchEvent(new Event('change', { bubbles: true }));
        } else {
            success = false;
            error += "College Dropdown not found. ";
        }

        // 1.5 Reset Subject Area to -Any- (to avoid conflicts with Area search)
        const subjectDropdown = document.getElementById('pageContent_subjectAreaDropDown') as HTMLSelectElement;
        if (subjectDropdown) {
            subjectDropdown.value = "";
            subjectDropdown.dispatchEvent(new Event('change', { bubbles: true }));
        }

        // 2. Select Area
        if (request.area && areaDropdown) {
            const areaMap: Record<string, string> = {
                "Writing": "WRT",
                "Entry Level Writing": "SUB",
                "American H & I": "AMH",
                "World Cultures": "NWC",
                "Ethnicity": "ETH",
                "European Traditions": "EUR",
                "A1": "A1 ",
                "A2": "A2 ",
                "B": "B  ",
                "C": "C  ",
                "D": "D  ",
                "E": "E  ",
                "F": "F  ",
                "G": "G  "
            };
            const targetValue = areaMap[request.area] || request.area;

            // Check if option exists
            let optionExists = false;
            for (let i = 0; i < areaDropdown.options.length; i++) {
                if (areaDropdown.options[i].value === targetValue) {
                    optionExists = true;
                    break;
                }
            }

            if (optionExists) {
                areaDropdown.value = targetValue;
                areaDropdown.dispatchEvent(new Event('change', { bubbles: true }));
            } else {
                console.warn("GEAR: Area option not found for", request.area, "mapped to", targetValue);
            }
        }

        // 3. Select Open Sections Only
        if (openSectionsCheckbox) {
            openSectionsCheckbox.checked = true;
            openSectionsCheckbox.dispatchEvent(new Event('change', { bubbles: true }));
        } else {
            // Not strictly an error if it's missing (maybe different page?), but good to note
            console.warn("GEAR: Open Sections checkbox not found");
        }

        // 4. Select Time Range
        if (request.startTime && startTimeDropdown) {
            const val = (request.startTime * 100).toString();
            startTimeDropdown.value = val;
            startTimeDropdown.dispatchEvent(new Event('change', { bubbles: true }));
        }
        if (request.endTime && endTimeDropdown) {
            const val = (request.endTime * 100).toString();
            endTimeDropdown.value = val;
            endTimeDropdown.dispatchEvent(new Event('change', { bubbles: true }));
        }

        sendResponse({ success: success, error: error });
    } else if (request.action === "AUTOMATE_SUBJECT_SEARCH") {
        const subjectDropdown = document.getElementById('pageContent_subjectAreaDropDown') as HTMLSelectElement;
        let success = false;
        if (subjectDropdown && request.subject) {
            // Find the option that matches the subject value
            for (let i = 0; i < subjectDropdown.options.length; i++) {
                if (subjectDropdown.options[i].value === request.subject) {
                    subjectDropdown.value = request.subject;
                    subjectDropdown.dispatchEvent(new Event('change', { bubbles: true }));
                    success = true;
                    break;
                }
            }
            if (!success) {
                console.warn("GEAR: Subject option not found for", request.subject);
            }
        } else {
            console.warn("GEAR: Subject dropdown not found or subject missing");
        }
        sendResponse({ success: success });
    }
    return true;
});

// Helper to scrape the specific Course History table
/**
 * Scrapes the "Course History" table on the GOLD "Academic History" > "Progress" page.
 * Extracts UCSB equivalent course codes, grades, and units.
 */
function scrapeCourseHistory() {

    const foundCourses: any[] = [];
    // 1. Target the Course History tab
    const historyContainer = document.getElementById('pageContent_CourseHistory');
    if (!historyContainer) {
        console.warn("GEAR: Course History container not found. Are you on the 'Progress' tab?");
        return [];
    }
    // 2. Target rows in Course History data table
    const rows = historyContainer.querySelectorAll('tr.GridRow_Windows, tr.GridAltRow_Windows');
    rows.forEach(row => {
        const cells = row.querySelectorAll('td');
        if (cells.length >= 9) {
            // only use UCSB Equiv column
            const ucsbEquiv = cells[3]?.textContent?.trim() || "";

            // ignore empty cells
            if (ucsbEquiv && ucsbEquiv !== "-") {
                const grade = cells[4]?.textContent?.trim() || "";
                const units = parseFloat(cells[5]?.textContent?.trim() || "0");
                const term = cells[0]?.textContent?.trim() || "";
                const title = cells[1]?.textContent?.trim() || "";
                const institution = cells[8]?.textContent?.trim() || "";

                foundCourses.push({
                    code: ucsbEquiv,
                    grade: grade,
                    units: units,
                    term: term,
                    title: title,
                    institution: institution
                });
            }
        }
    });

    return foundCourses;
}

/**
 * Injects GEAR data (description, GE areas, prerequisites) into GOLD course elements.
 * Adds links to ucsbplat.com and color-codes courses based on availability.
 */
function injectCourseInfo() {
    if (Object.keys(courseData).length === 0) return;

    const courseHeaders = document.querySelectorAll('.courseTitle');
    courseHeaders.forEach((header) => {
        if (header.getAttribute('data-gear-injected') === 'true') return;
        // find headers
        let mainContainers: Element[] = [];
        let searchHeader: Element | null = null;
        searchHeader = header.closest('.courseSearchHeader');
        if (searchHeader) {
            // find all siblings until next header
            let next = searchHeader.nextElementSibling;
            while (next && !next.classList.contains('courseSearchHeader')) {
                mainContainers.push(next);
                next = next.nextElementSibling;
            }
        } else {
            // find parent
            const item = header.closest('.scheduleItem');
            if (item) mainContainers.push(item);
        }

        // find title & create PLAT link
        let rawTitle = "";
        const cartIdSpan = header.querySelector('span[id*="regCartCourseId"]');
        let courseCodeWithSpace = "";
        // for the GOLD "cart" items
        if (cartIdSpan) {
            if (cartIdSpan.textContent && !cartIdSpan.textContent.includes("Units")) {
                const tempTitle = cartIdSpan.textContent.trim();
                const cleanCode = getCleanCourseCode(tempTitle);
                if (courseData[cleanCode]) {
                    rawTitle = tempTitle;
                    courseCodeWithSpace = rawTitle.replace(/\s+/g, ' ');
                    const link = document.createElement('a');
                    link.href = `https://ucsbplat.com/curriculum/course/${encodeURIComponent(courseCodeWithSpace)}`;
                    link.target = "_blank";
                    link.className = "gear-plat-link";
                    link.textContent = courseCodeWithSpace;
                    link.onclick = (e) => e.stopPropagation();
                    cartIdSpan.textContent = "";
                    cartIdSpan.appendChild(link);
                    const scheduleItem = header.closest('.scheduleItem');
                    if (scheduleItem) scheduleItem.classList.add('gear-cart-item');
                }
            }
        } else {
            // for the schedule/search items
            const tempTitle = header.textContent?.trim() || "";
            const cleanCode = getCleanCourseCode(tempTitle);

            if (courseData[cleanCode]) {
                rawTitle = tempTitle;
                const splitIndex = rawTitle.indexOf("-");
                if (splitIndex !== -1) {
                    courseCodeWithSpace = rawTitle.substring(0, splitIndex).replace(/\s+/g, ' ').trim();
                    const restOfTitle = " " + rawTitle.substring(splitIndex);
                    const link = document.createElement('a');
                    link.href = `https://ucsbplat.com/curriculum/course/${encodeURIComponent(courseCodeWithSpace)}`;
                    link.target = "_blank";
                    link.className = "gear-plat-link";
                    link.textContent = courseCodeWithSpace;
                    link.onclick = (e) => e.stopPropagation();
                    header.textContent = "";
                    header.appendChild(link);
                    header.appendChild(document.createTextNode(restOfTitle));
                } else {
                    courseCodeWithSpace = rawTitle.replace(/\s+/g, ' ').trim();
                    if (courseCodeWithSpace) {
                        const link = document.createElement('a');
                        link.href = `https://ucsbplat.com/curriculum/course/${encodeURIComponent(courseCodeWithSpace)}`;
                        link.target = "_blank";
                        link.className = "gear-plat-link";
                        link.textContent = courseCodeWithSpace;
                        link.onclick = (e) => e.stopPropagation();
                        header.textContent = "";
                        header.appendChild(link);
                    }
                }
            }
        }

        // add course-specific details with close-to matching HTML
        let detailsBox: HTMLElement | null = null;

        if (rawTitle) {
            const cleanCode = getCleanCourseCode(rawTitle);
            const info = courseData[cleanCode];
            if (info) {
                const allAreas = [
                    ...(info.general_area || []),
                    ...(info.special_area || []),
                    ...(info.univ_req || [])
                ].join(", ");
                if (allAreas) {
                    const areaSpan = document.createElement('span');
                    areaSpan.innerText = ` | Areas: ${allAreas}`;
                    areaSpan.style.color = "#003660";
                    areaSpan.style.fontWeight = "bold";
                    areaSpan.style.fontSize = "0.9em";
                    areaSpan.style.marginLeft = "8px";
                    header.appendChild(areaSpan);
                }

                detailsBox = document.createElement('div');
                detailsBox.className = "gear-details-container";
                const desc = createCollapsible("Description", info.course_description);
                const comments = createCollapsible("Advisor Comments", info.advisor_comments);
                const prereqs = createCollapsible("Prerequisites", info.prerequisites);

                let hasContent = false;
                if (desc) { detailsBox.appendChild(desc); hasContent = true; }
                if (comments) { detailsBox.appendChild(comments); hasContent = true; }
                if (prereqs) { detailsBox.appendChild(prereqs); hasContent = true; }

                if (hasContent) {
                    if (searchHeader && mainContainers.length > 0) {
                        if (searchHeader.parentNode) {
                            searchHeader.parentNode.insertBefore(detailsBox, mainContainers[0]);
                        }
                    } else if (mainContainers.length > 0) {
                        mainContainers[0].appendChild(detailsBox);
                    }
                } else {
                    detailsBox = null;
                }
            }
        }

        // remove sections without space
        if (mainContainers.length > 0) {
            const allSubSessionRows = mainContainers.flatMap(container =>
                Array.from(container.querySelectorAll('.row.subSessionItem, .row.susbSessionItem, .row.session.info'))
            );
            allSubSessionRows.forEach(row => {
                const allLabels = Array.from(row.querySelectorAll('label'));
                const spaceLabel = allLabels.find(label => label.textContent?.trim() === "Space");
                if (spaceLabel && spaceLabel.parentElement) {
                    const parentText = spaceLabel.parentElement.textContent || "";
                    const valueText = parentText.replace("Space", "").trim();
                    if (!/\d/.test(valueText)) {
                        // Mark as full instead of removing
                        const container = row.closest('.row.subSessionItem, .row.susbSessionItem');
                        if (container) {
                            container.classList.add('gear-full-section');
                        } else {
                            row.classList.add('gear-full-section');
                        }
                    }
                }
            });
        }

        // full vs open logic and coloring accordingly
        if (mainContainers.length > 0) {
            const allInfoRows = mainContainers.flatMap(container => Array.from(container.querySelectorAll('.row.info')));
            const mainRows = allInfoRows.filter(row =>
                !row.closest('[class*="subSession"]') &&
                !row.classList.contains('session')
            );


            let isMainFull = true;
            let foundStatus = false;

            for (const row of mainRows) {
                const allLabels = Array.from(row.querySelectorAll('label'));
                const spaceLabel = allLabels.find(label => label.textContent?.includes("Space"));

                if (spaceLabel && spaceLabel.parentElement) {
                    foundStatus = true;
                    const text = spaceLabel.parentElement.textContent?.toLowerCase() || "";

                    const hasZeroSpace = /space:\s*0\b/.test(text);
                    if (!text.includes("full") && !text.includes("closed") && !text.includes("cancel") && !hasZeroSpace) {
                        isMainFull = false;
                        break;
                    }
                }
            }

            if (foundStatus) {
                const targetClass = isMainFull ? 'full-course' : 'open-course';
                if (searchHeader) searchHeader.classList.add(targetClass);
                if (!searchHeader) {
                    mainContainers.forEach(container => container.classList.add(targetClass));
                }
                if (detailsBox) detailsBox.classList.add(targetClass);
            }
        }
        header.setAttribute('data-gear-injected', 'true');
    });

}

/**
 * Injects CSS for the "Hide Full Sections" feature.
 */
function injectStyles() {
    const styleId = 'gear-injected-styles';
    if (document.getElementById(styleId)) return;

    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
        body.gear-hide-full-sections .gear-full-section {
            display: none !important;
        }
        .gear-toggle-container {
            display: inline-flex;
            align-items: center;
            margin-left: 10px;
            vertical-align: middle;
            background: #fff;
            padding: 4px 8px;
            border-radius: 4px;
            border: 1px solid #ccc;
        }
        .gear-toggle-container input {
            margin: 0 6px 0 0;
            cursor: pointer;
        }
        .gear-toggle-container label {
            margin: 0;
            font-size: 0.9em;
            color: #333;
            cursor: pointer;
            font-weight: 600;
        }
    `;
    document.head.appendChild(style);
}

/**
 * Injects the "Hide Full Sections" toggle checkbox into the GOLD UI.
 */
function injectToggle() {
    const targetButton = document.getElementById('pageContent_modifySearchTopButton');
    if (!targetButton || document.getElementById('gear-full-toggle')) return;

    const container = document.createElement('div');
    container.className = 'gear-toggle-container';

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.id = 'gear-full-toggle';

    // Load state
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.sync) {
        chrome.storage.sync.get(['hideFullSections'], (result) => {
            const hide = result.hideFullSections !== false; // Default to true
            checkbox.checked = hide;
            if (hide) {
                document.body.classList.add('gear-hide-full-sections');
            } else {
                document.body.classList.remove('gear-hide-full-sections');
            }
        });
    }

    checkbox.onchange = (e) => {
        const checked = (e.target as HTMLInputElement).checked;
        if (checked) {
            document.body.classList.add('gear-hide-full-sections');
        } else {
            document.body.classList.remove('gear-hide-full-sections');
        }
        if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.sync) {
            chrome.storage.sync.set({ hideFullSections: checked });
        }
    };

    const label = document.createElement('label');
    label.htmlFor = 'gear-full-toggle';
    label.innerText = 'Hide Full Sections';

    container.appendChild(checkbox);
    container.appendChild(label);

    targetButton.parentNode?.insertBefore(container, targetButton.nextSibling);
}

const init = async () => {

    try {
        const url = chrome.runtime.getURL('courses_master.json');
        const response = await fetch(url);
        courseData = await response.json();



        injectStyles();
        injectToggle();
        injectCourseInfo();

        const observer = new MutationObserver((mutations) => {
            let shouldUpdate = false;
            for (const mutation of mutations) {
                if (mutation.addedNodes.length > 0) {
                    shouldUpdate = true;
                    break;
                }
            }
            if (shouldUpdate) {
                injectCourseInfo();
                injectToggle(); // Ensure toggle persists if UI updates
            }
        });
        observer.observe(document.body, { childList: true, subtree: true });
    } catch (error) {
        console.error("GEAR: Failed to load data", error);
    } finally {

    }
};
init();