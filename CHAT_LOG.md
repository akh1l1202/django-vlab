# Virtual Labs: Git Repository Management for a Django Project
## Complete Project Specification, Chat Record & AI Context Document

> **Notice for Future AI Agents / LLMs**:  
> This document provides **100% complete context** of the Virtual Labs experiment project created in `c:\Users\KJSCE\Desktop\virtualLab`. It includes the project background, user requirements, technical decisions, complete file map, architectural patterns, simulation mechanics, quiz schema, and guidelines for extending or maintaining the codebase.

---

## 1. Project Overview & Context

- **Platform**: Ministry of Education (MoE), Government of India – Virtual Labs platform (based on the IIT Roorkee template).
- **Experiment Title**: Git Repository Management for a Django Project
- **Discipline**: Computer Science and Engineering / Information Technology / Software Engineering
- **Experiment Short Name**: `git-django-repo`
- **Reference Template URL**: `https://cn-iitr.vlabs.ac.in/exp/stop-wait-arq/`
- **Core Deliverable**: A fully functioning, client-side, self-contained, 9-page Virtual Labs package with an interactive CLI terminal simulation and automated assessment quizzes.

---

## 2. Conversation & Decision History

### Step 1: Initial Requirements & Assets Clarification
- **User Prompt**: Provided the template URL and full-page screenshots of each tab from the Stop-and-Wait ARQ lab. Noted that the deliverables must be in HTML matching the VLab template. Attached a screenshot of Chrome DevTools Sources tab showing multiple folders and CDN references, asking which subfolders need to be manually sent.
- **AI Analysis**:
  1. Identified that ~80% of DevTools entries were public CDNs (`apis.google.com`, `cdn.jsdelivr.net`, `cdnjs.cloudflare.com`, `fonts.googleapis.com`) or IITR trackers (`googletagmanager.com`, `google-analytics.com`) which load automatically or are not required.
  2. The only local assets needed were under `assets/` on the origin server.
  3. Instead of burdening the user, the AI automatically downloaded the entire `assets/` suite directly into the workspace using network tools.

### Step 2: Verification of Exact Theme, Styles & Fonts
- **User Prompt**: "are you sure that we have alll the assets required to have the exact template like view. we need to have our virtual lab exactly same and consistent with the websites existing fonts colour themes, etc everythingg"
- **AI Action**: Ran an automated asset audit across all 9 pages of the template. Downloaded and verified all fonts, CSS, logos, and JavaScript files (`bootstrap.min.css`, `vlabs-style.css`, `github-markdown.min.css`, `toast.css`, `katex.min.css`, `font-awesome-4.7.0`, `vlabs-color-small-moe.jpg`, `assessment.js`).

### Step 3: Architecture & Tab Planning
- **User Prompt**: "yea youre right now lets decide each and everything for our given virtual lab experiment"
- **AI Action**: Created an Implementation Plan detailing the 9 standard tabs:
  1. `index.html` (Aim)
  2. `theory.html` (Theory)
  3. `pretest.html` (Pretest)
  4. `procedure.html` (Procedure)
  5. `simulation.html` (Simulation)
  6. `posttest.html` (Posttest)
  7. `references.html` (References)
  8. `contributors.html` (Contributors)
  9. `feedback.html` (Feedback)

### Step 4: Simulation Design & Wrapper Alignment
- **User Prompt**: The user created `simulation.html` as the standard outer shell that embeds `simulation/index.html` inside an `<iframe>`.
- **AI Action**: Adopted this pattern. Designed an interactive dual-pane simulator inside `simulation/` containing an interactive terminal emulator and a real-time SVG commit graph.

---

## 3. Project File Map & Directory Structure

```
virtualLab/
├── assets/                                      # Official Virtual Labs local assets
│   ├── css/
│   │   ├── bootstrap.min.css                    # Bootstrap responsive grid & components
│   │   ├── vlabs-style.css                      # Primary VLab theme (colors #4076e0, #288ec8, sidebars)
│   │   ├── github-markdown.min.css              # Typography for .markdown-body content
│   │   └── toast.css                            # Notification styling
│   ├── js/
│   │   ├── jquery-3.4.1.slim.min.js             # Base jQuery library
│   │   ├── toggleSidebar.js                     # Mobile hamburger drawer menu toggle
│   │   ├── event-handler.js                     # Sidebar event listeners
│   │   └── assessment.js                        # Official quiz engine (grades myQuestions array)
│   ├── fonts/
│   │   └── font-awesome-4.7.0/                  # FontAwesome CSS and webfonts (.woff2, .woff, .ttf)
│   ├── images/
│   │   ├── favicon.ico                          # VLab browser tab icon
│   │   └── vlabs-color-small-moe.jpg            # Ministry of Education & VLab header logo
│   └── katex_assets/
│       └── katex.min.css                        # KaTeX math formula styling
│
├── index.html                                   # Tab 1: Aim & Measurable Learning Objectives (LO 1 - LO 6)
├── theory.html                                  # Tab 2: Academic Theory, Django Anatomy, Top 5 Never-Commit Disasters
├── pretest.html                                 # Tab 3: Interactive Pre-experiment MCQ Quiz
├── procedure.html                               # Tab 4: Step-by-Step Practical Procedure & Terminal Guide
├── simulation.html                              # Tab 5: Virtual Labs Simulation Outer Wrapper (Responsive iframe)
├── simulation/                                  # Interactive Simulator Application
│   ├── index.html                               # Dual-pane UI (Virtual Bash Terminal + Visual Dashboard)
│   ├── css/
│   │   └── sim.css                              # Terminal styling, commit graph styles, status pills
│   └── js/
│       └── sim.js                               # Terminal CLI engine, Git state machine & SVG graph renderer
├── posttest.html                                # Tab 6: Scenario-Based Assessment Quiz
├── references.html                              # Tab 7: Formal Academic & Technical References
├── contributors.html                            # Tab 8: Contributor Profile Cards
├── feedback.html                                # Tab 9: User Evaluation & Feedback Form
├── CHAT_LOG.md                                  # This master context specification file
└── ss/                                          # User-provided reference screenshots of original template
```

---

## 4. Technical Specifications & Architecture

### A. The Virtual Labs Outer Shell Pattern
Every single page (`index.html`, `theory.html`, etc.) follows this exact DOM structure:
1. **Header**:
   - Mobile navbar toggle (`button.navbar-toggler`).
   - Ministry of Education / VLab Logo: `<img src="./assets/images/vlabs-color-small-moe.jpg" alt="vlabs logo" class="vlabs-logo" />`.
   - Rating & Bug Report web components (`<rating-display>`, `<rating-submit>`, `<bug-report>`).
2. **Breadcrumbs**:
   `Computer Science and Engineering > Software Engineering & Web Development Lab > Experiments > Git Repository Management for a Django Project`.
3. **Sidebar Navigation**:
   - Mobile popup drawer: `#popupMenu` (modal).
   - Desktop sidebar: `#menu.nav.flex-column.sidebar.nav-menu`.
   - Active page highlight: `<a href="page.html" class="p-2 current-item">`. Inactive pages use `class="p-2"`.
4. **Content Area**:
   `<div class="vlabs-page-content px-5 pb-4 flex-grow-1 markdown-body">`.
5. **Footer**:
   Sakshat portal, Outreach portal, FAQ, Contact details, Social media links, AGPL 3.0 & CC BY-NC-SA 4.0 badges.

### B. The Quiz Engine (`assessment.js`) Contract
In `pretest.html` and `posttest.html`, the evaluation runs client-side without any backend.
- The DOM must contain:
  - `<div id="quiz">`: Container with `.question` and `.answers` blocks.
  - Radio inputs with `name="question0"`, `name="question1"`, etc., and `value="a"|"b"|"c"|"d"`.
  - `<button id="submit">Submit Answers</button>`.
  - `<div id="results"></div>`.
- JavaScript binding in the HTML:
  ```javascript
  const myQuestions = [
    {
      question: "Question text here?",
      answers: {
        a: "Option A",
        b: "Option B",
        c: "Option C",
        d: "Option D"
      },
      correctAnswer: "b"
    },
    // ...
  ];
  ```
- When `#submit` is clicked, `assets/js/assessment.js` highlights correct selections in green, incorrect in red, and outputs `X out of Y` into `#results`.

### C. The Interactive Simulator Engine (`simulation/js/sim.js`)
Embedded in `simulation.html` via `<iframe class="responsive-iframe" src="simulation/index.html"></iframe>`.
- **State Machine**:
  - `isInitialized`: Boolean (tracks `git init`).
  - `currentBranch`: Active branch name (`main`, `feature/polls`).
  - `branches`: Array of existing branch names.
  - `commits`: Array of `{ id, hash, message, branch, parentId, tag }`.
  - `files`: Dictionary tracking states:
    `manage.py`, `mysite/settings.py`, `mysite/urls.py`, `.gitignore`, `polls/models.py`, `polls/migrations/0001_initial.py`, `db.sqlite3`, `.env`, `venv/`.
    States: `'untracked'`, `'staged'`, `'committed'`, `'ignored'`, `'missing'`.
  - `tasks`: Milestone booleans (`init`, `gitignore`, `initialCommit`, `branch`, `pollsCommit`, `merge`, `tag`).
- **Terminal Emulator**:
  - Handles command line input with history (Up/Down arrow navigation).
  - Emulates bash prompt: `student@django-dev:~/mysite(branch)$ `.
  - Parses: `git init`, `create-gitignore`, `git status`, `git add <file>|.`, `git commit -m "..."`, `git branch`, `git checkout [-b] <name>`, `python manage.py startapp polls`, `python manage.py makemigrations`, `git merge <branch>`, `git tag -a <tag> -m "..."`, `git log --oneline`, `ls`, `clear`, `help`.
  - Safety Alert: Warns students if they execute `git add .` before creating `.gitignore` (explaining the risk of tracking `db.sqlite3` and `.env`).
- **Live SVG Commit Graph**:
  - Automatically draws commit nodes, parent connecting lines, `HEAD` indicator badges, and tag labels in real time as commits/merges take place.

---

## 5. Curriculum Content Summary

1. **Aim (`index.html`)**:
   - Master professional Git workflows in Django: repo scaffolding, `.gitignore` enforcement, atomic commits, model migrations version control, branching, conflict resolution, and release tagging.
2. **Theory (`theory.html`)**:
   - Git 3-tree architecture (Working Tree $\rightarrow$ Staging Area $\rightarrow$ Repository HEAD).
   - Standard Django anatomy.
   - **Top 5 Never-Commit Disasters**:
     1. `db.sqlite3`: Binary conflicts, developer test data leaks, database lockouts.
     2. `.env` & `SECRET_KEY`: Security leaks and session hijacking.
     3. `__pycache__/` & `*.pyc`: Cross-platform stale bytecode mismatches.
     4. `venv/`: Platform-specific binaries bloating repository by hundreds of MBs.
     5. `media/` & `staticfiles/`: User uploads and build artifacts.
   - Annotated production `.gitignore`.
   - Migrations in version control & solving split heads with `python manage.py makemigrations --merge`.
   - Branching models (Git Flow: `main`, `develop`, `feature/*`, `hotfix/*`).
   - Merge conflict anatomy (`<<<<<<< HEAD`, `=======`, `>>>>>>>`) and resolution in `urls.py`.
3. **Pretest (`pretest.html`)**:
   - 5 prerequisite MCQs on `.gitignore`, `db.sqlite3` omission, `git add`, migrations tracking, and `git log`.
4. **Procedure (`procedure.html`)**:
   - 9 practical steps from `django-admin startproject`, `.gitignore` authoring, initial commit, branching, app migrations, merge conflict simulation, and release tagging (`v1.0.0`).
5. **Posttest (`posttest.html`)**:
   - 5 scenario questions on secret rotation after accidental push, `git rm --cached`, missing migration runtime errors, conflict markers, and production branches.

---

## 6. How to Test, Run & Extend

### To Run Locally
- Simply open `index.html` or `simulation.html` in any modern web browser.
- No local web server or build tool (npm, webpack, python server) is strictly required—everything is written in clean, vanilla HTML5, CSS3, and JavaScript with local relative links (`./assets/...`).

### Guidelines for Future AI Agents Extending This Project
1. **Maintain Style Consistency**: When editing or adding tabs, preserve the exact `<header>`, sidebar classes (`.nav-menu-body`, `.current-item`), `.vlabs-page-content.markdown-body`, and `<footer>`.
2. **Keep Asset Links Relative**: Always use `./assets/...` for internal stylesheets and scripts to ensure the project runs offline or in any directory path.
3. **Quiz Modifications**: If adding or altering questions in `pretest.html` or `posttest.html`, keep the HTML radio button values matching the `myQuestions` array and ensure `assessment.js` is loaded at the bottom of the body.
4. **Simulation Modifications**: The simulation logic lives in `simulation/js/sim.js` and styling in `simulation/css/sim.css`. The iframe communicates seamlessly within `simulation.html`.
