# Contributing to GEAR Interactive

Thank you for your interest in contributing to **GEAR Interactive**! This extension helps UCSB engineering students streamline their academic planning, and your contributions help make it better for everyone.

## Table of Contents

- [How Can I Contribute?](#how-can-i-contribute)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Code Style Guidelines](#code-style-guidelines)
- [Submitting Contributions](#submitting-contributions)
- [Reporting Issues](#reporting-issues)

---

## How Can I Contribute?

### 1. **Report Bugs**

Found a bug? Please [open an issue](https://github.com/nacsoprog/GEAR-Interactive-extension/issues) with:

- A clear, descriptive title
- Steps to reproduce the issue
- Expected vs. actual behavior
- Screenshots (if applicable)
- Your browser version and OS

### 2. **Suggest Features**

Have an idea to improve GEAR Interactive? We'd love to hear it! Please:

- Check if the feature has already been requested
- Open an Feature request issue
- Describe the problem you're trying to solve
- Explain your proposed solution

### 3. **Contribute Code**

We welcome pull requests for:

- Bug fixes
- Feature implementations
- Code refactoring
- Documentation improvements
- Test coverage improvements

### 4. **Improve Documentation**

Help make our docs clearer:

- Fix typos or unclear explanations
- Add examples or screenshots
- Translate documentation
- Improve code comments

---

## Getting Started

### Prerequisites

- **Node.js** v16 or higher
- **npm** or **yarn**
- **Git** for version control
- A **Chromium-based browser** (Chrome, Edge, Brave, etc.) for testing

### Development Setup

1. **Fork the Repository**

   Click the "Fork" button on GitHub to create your own copy.

2. **Clone Your Fork**

   ```bash
   git clone https://github.com/YOUR_USERNAME/GEAR-Interactive-extension.git
   cd GEAR-Interactive-extension
   ```

3. **Install Dependencies**

   ```bash
   npm install
   ```

4. **Start Development Server**

   ```bash
   npm run build
   ```

5. **Load Extension in Chrome**

   - Navigate to `chrome://extensions/`
   - Enable "Developer mode" (toggle in top-right)
   - Click "Load unpacked"
   - Select the `dist/` folder from the project directory

6. **Make Changes**

   Edit the code, and the extension will reload automatically with your changes.

---

## Development Workflow

### Branch Naming

Use descriptive branch names:

- `feature/add-course-search` - For new features
- `fix/gold-import-bug` - For bug fixes
- `refactor/cleanup-css` - For code refactoring
- `docs/update-readme` - For documentation changes

### Commit Messages

Write clear, concise commit messages:

- Use present tense ("Add feature" not "Added feature")
- Be descriptive but brief
- Reference issues when applicable

**Examples:**

```
fix: resolve GPA calculation for courses with P/NP grades

feat: add dark mode support for search filters

refactor: extract requirement logic into utility functions

docs: update installation instructions in README
```

### Testing Your Changes

Before submitting a pull request:

1. **Lint Your Code**

   ```bash
   npm run lint
   ```

2. **Build the Extension**

   ```bash
   npm run build
   ```

3. **Manual Testing**
   - Test your changes in the browser
   - Verify functionality on GOLD (if applicable)
   - Check both light and dark modes
   - Test edge cases and error scenarios

---

## Code Style Guidelines

### TypeScript

- Use **TypeScript** for all new code
- Enable strict type checking
- Avoid `any` types unless absolutely necessary
- Use interfaces for object shapes

### React Components

- Use **functional components** with hooks
- Keep components focused and single-purpose
- Extract complex logic into utility functions
- Use meaningful variable and function names

### CSS

- Follow existing naming conventions
- Use semantic class names
- Keep selectors specific and avoid overly broad rules
- Maintain separate light/dark mode stylesheets

### Comments

- Write comments that explain **why**, not **what**
- Remove commented-out code before committing
- Use descriptive function and variable names to reduce need for comments
- Document complex algorithms or business logic
- AI writes pretty good comments I think

**Good:**

```typescript
// Prevent event listener thrashing by using functional state updates
setTimeRange((prev) => {
    const [currentStart, currentEnd] = prev;
    return [validStart, currentEnd];
});
```

**Bad:**

```typescript
// Set the time range
setTimeRange([validStart, currentEnd]);
```

### File Organization

```
src/
├── components/      # React components
├── css/             # Stylesheets (light and dark mode)
├── data/            # Static data and constants
├── types/           # TypeScript type definitions
├── utils/           # Utility functions and helpers
├── content/         # Content scripts for GOLD integration
└── background/      # Background service worker
```

---

## Submitting Contributions

### Pull Request Process

1. **Ensure your changes:**
   - Pass all linting checks (`npm run lint`)
   - Build successfully (`npm run build`)
   - Work correctly in the browser
   - Don't break existing functionality

2. **Create a Pull Request**
   - Push your branch to your fork
   - Open a PR against the `main` branch
   - Fill out the PR template (if provided)
   - Link any related issues

3. **PR Description Should Include:**
   - Summary of changes made
   - Motivation and context
   - Screenshots/videos for UI changes
   - How to test the changes
   - Any breaking changes or migration notes

4. **Code Review**
   - Be responsive to feedback
   - Make requested changes in new commits (don't force-push)
   - Engage in constructive discussion

5. **After Approval**
   - A maintainer will merge your PR
   - Your contribution will be included in the next release

### What to Expect

- **Review Time**: We aim to review PRs within 3-5 days
- **Feedback**: Expect constructive feedback and questions
- **Iteration**: Be prepared to make revisions based on review comments

---

## Reporting Issues

### Before Creating an Issue

- Search existing issues to avoid duplicates
- Check if the issue exists in the latest version
- Gather relevant information (browser version, OS, steps to reproduce)

### Issue Templates

Use the appropriate template:

- **Bug Report**: For reporting broken functionality
- **Feature Request**: For suggesting new features

### Security Issues

**Do not** open public issues for security vulnerabilities. Instead, please refer to our [SECURITY.md](SECURITY.md) for responsible disclosure procedures.

---

## Questions?

If you have questions about contributing:

- Open a [GitHub Discussion](https://github.com/nacsoprog/GEAR-Interactive-extension/discussions)
- Email us at: [Click to copy](mailto:gear.interactive.help@gmail.com)
- Submit feedback via our [Google Form](https://docs.google.com/forms/d/e/1FAIpQLSd_1g-EkIGq2Sca-fnsjkoDQ0gIm9k_dsRwc62bCCLcvaa71A/viewform?usp=header)

---

## Recognition

All contributors will be recognized in our release notes and project documentation. Thank you for making GEAR Interactive better for the UCSB community! 🚀

---

**Happy Contributing!** 🎓
