# GEAR Interactive

**GEAR Interactive** is a Chrome Extension designed to facilitate the academic planning for UCSB engineering students. It integrates with UCSB **GOLD** to provide an interactive course audit. Basically it just makes GOLD easier to use. It is working alright for its limited engineering scope but hopefully it can be expanded to be useful for more students. I hope this tool is far from finished.

---

## Features to note

### Interactive Degree Checklist

- **Visual Tracking**: See major requirements (GEs, Major Prep, Upper Divs) in a checklist.
- **Live Progress**: Calculate unit totals and check off requirements as you add courses.
- **High School Credits**: Track AP / IB / A-Level credits that satisfy specific university requirements.

### GOLD Integration

- **GOLD Import**: One-click import of course history directly from GOLD. (limited testing)
- **Automated Search**: Click a requirement (e.g., "Area D") in the sidebar, and GEAR will automatically open GOLD and set up the search filters for you (including resetting interfering subject filters).
- **Course Info Injection**: Adds "PLAT" links and color-coded availability (Red/Green) directly into GOLD's search results.

### Terminal-Style Input

- **Input Navigation**: Use the **Up/Down Arrow Keys** in the input box to cycle through your recent course additions, just like a terminal. Automatically ignores duplicate entries and keeps your history clean (Max 15 items).

---

## Set up for development

### Prerequisites

- [Node.js](https://nodejs.org/) (v16+ recommended)
- npm or yarn

### Installation

1. **Clone the Repository**

    ```bash
    git clone https://github.com/nacsoprog/GEAR-Interactive.git
    cd GEAR-Interactive
    ```

2. **Install Dependencies**

    ```bash
    npm install
    ```

3. **Build the Extension**

    ```bash
    npm run build
    ```

    *npm run dev doesnt work too well with this... generate the production-ready extension in the `dist/` folder.*

4. **Load into Chrome**
    - Open Chrome and go to `chrome://extensions`.
    - Enable **Developer mode** (top right toggle).
    - Click **Load unpacked**.
    - Select the `dist` folder created in the previous step.

---

## Tech Stack

- **Frontend**: React 19, TypeScript
- **Build Tool**: Vite (with CRXJS plugin for Chrome Extension support)
- **Styling**: Vanilla CSS (Modular & Responsive)
- **Linting**: ESLint + TypeScript-ESLint

## Contributing

This could expand into far more use cases (adding other majors/minors, recommended scheduling, etc.)

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request
