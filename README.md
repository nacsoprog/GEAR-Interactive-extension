# GEAR Interactive

**GEAR Interactive** is a Chrome Extension designed to streamline academic planning for UCSB engineering students. It integrates seamlessly with **UCSB GOLD** to provide an interactive course audit, simplified visualization of degree requirements, and intelligent course search capabilities.

While currently optimized for engineering majors, GEAR Interactive includes a "Major not listed" feature to provide value for all UCSB students.

---

[![Google Form for feedback:](https://img.shields.io/badge/Feedback-Google_Form-blue?style=for-the-badge&logo=googleforms)](https://docs.google.com/forms/d/e/1FAIpQLSd_1g-EkIGq2Sca-fnsjkoDQ0gIm9k_dsRwc62bCCLcvaa71A/viewform?usp=header)

## Key Features

### Interactive Degree Checklist

- **Visual Tracking**: View major requirements (GEs, Major Prep, Upper Divs) in a clean, categorized checklist.
- **Live Progress**: Automatically calculates unit totals and tracks fulfillment as you add courses.
- **High School Credits**: Intelligently maps AP / IB / A-Level scores to specific university requirements (Course Credits & GE Areas).
- **Supports All Majors**: Specialized tracking for Engineering majors (CS, CE, EE, ME, ChemE) and a generic "Course History" view for all other majors.

### GOLD Integration

- **One-Click Import**: Instantly import your entire course history directly from GOLD.
- **Smart Search**: Click any requirement (e.g., "Area D") to automatically open GOLD searches with the correct filters pre-applied.
- **Enhanced UI**: Injects "PLAT" (Course Difficulty) links and availability indicators directly into GOLD search results.

### Dashboard Home

- **What-If GPA Sandbox**: Simulate future grades and "In Progress" courses to see their impact on your GPA without affecting official records.
- **Student Notes**: A persistent scratchpad for academic planning thoughts.
- **Dark Mode**: Fully themed experience for late-night planning sessions.

---

## Development Setup

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

    *Note: `npm run dev` is not recommended for full extension testing due to Chrome API limitations in dev mode. Use `npm run build` to generate the production-ready extension in the `dist/` folder.*

4. **Load into Chrome**
    - Open Chrome and navigate to `chrome://extensions`.
    - Enable **Developer mode** (top right toggle).
    - Click **Load unpacked**.
    - Select the `dist` folder created in the previous step.

### Important Note on Data

The file `public/courses_master.json` is git-ignored to prevent bloating the repository. This file contains the scraped course catalog data.

- If you are building, ensure you have a valid `courses_master.json` in the `public/` directory (or `dist/` after build).
- **Mock Data**: You can generate a small mock dataset for testing by running:

    ```bash
    npm run mock:data
    ```

### Screenshots

Visual assets are located in the `screenshots/` directory. Please add new screenshots there when submitting UI changes.

### CI/CD

This repository uses GitHub Actions to enforce code quality.

- **Linting**: Runs `npm run lint` on every Pull Request.

---

## Tech Stack

- **Frontend**: React 19, TypeScript
- **Build Tool**: Vite (with CRXJS plugin)
- **Styling**: Vanilla CSS (Modular & Themed)
- **Linting**: ESLint + TypeScript-ESLint

## Contributing

We welcome contributions to expand GEAR Interactive to support more majors, minors, and features!

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request
