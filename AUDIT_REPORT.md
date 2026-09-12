# Repository Quality Audit

**Project:** Git Repository Management for a Django Project  
**Audit date:** 12 September 2026  
**Scope:** First-party HTML, CSS, JavaScript, assessments, simulation behavior, instructional content, references, accessibility, and repository presentation.

## Executive summary

The site has a clear structure and its local navigation and first-party resource paths resolve correctly. The JavaScript files also pass syntax checks. However, the current version should not be published as a finished educational experiment until the critical functional defects and technical inaccuracies below are addressed.

The most serious problems are a feedback form that falsely claims to save data, missing SweetAlert dependencies on most pages, and a simulation whose branch, merge, `.gitignore`, and migration behavior differs materially from Git and Django.

## Critical findings

### C1. The feedback form discards submissions while reporting success

`feedback.html:141` prevents normal submission, shows “Your feedback has been successfully recorded,” resets the form, and sends nothing to a server or storage service. The controls also lack `name` attributes. This is misleading to users and loses all submitted feedback.

**Recommendation:** Connect the form to a real endpoint and show success only after a confirmed response. If no backend exists, label it clearly as a demonstration and do not claim the response was recorded.

### C2. Shared event handling crashes on most pages

`assets/js/event-handler.js:3` accesses `Swal` at top level. Only `index.html` and `feedback.html` load SweetAlert2; the other experiment pages load `event-handler.js` without defining `Swal`. Those pages therefore raise a `ReferenceError`, preventing the bug-report and rating event listeners in that file from being registered.

**Recommendation:** Load SweetAlert2 consistently before the handler or make the handler independent of it with a guarded fallback.

### C3. The simulator's `clear` command removes the terminal input

`simulation/js/sim.js:110-112` removes every `.terminal-line`. The input row in `simulation/index.html:47` also has that class, so entering `clear` deletes the input and makes further interaction impossible.

**Recommendation:** Remove only output lines, or preserve and reattach `#terminal-input-row`.

### C4. The simulator does not model branches or merges correctly

The simulation stores one global `headCommitId` instead of a commit pointer per branch. `git checkout` changes only a branch-name string (`simulation/js/sim.js:363-385`), so checking out `main` does not move `HEAD` back to the main branch's commit. `git merge` then always creates a new commit while printing “Fast-forward merge” (`simulation/js/sim.js:394-423`). A real fast-forward updates a branch pointer and creates no merge commit.

**Recommendation:** Store a tip commit for every branch, update `HEAD` on checkout, detect ancestry, fast-forward when possible, and create two-parent commits only for true merges.

Reference: [Git merge documentation](https://git-scm.com/docs/git-merge).

## High-severity findings

### H1. Creating `.gitignore` incorrectly untracks staged or committed files

`createGitignore()` unconditionally changes `db.sqlite3`, `.env`, and `venv/` to `ignored` (`simulation/js/sim.js:473-478`). In real Git, adding an ignore rule does not affect files that are already tracked or staged. This behavior directly contradicts the lesson in `procedure.html:175` and can teach unsafe secret-handling behavior.

**Recommendation:** Ignore only files whose current state is untracked. Retain staged and committed states and teach `git rm --cached` for tracked files.

Reference: [Gitignore documentation](https://git-scm.com/docs/gitignore).

### H2. The Django migration sequence is fabricated

The simulator says `startapp polls` creates `models.py` and `views.py`, but it adds only `polls/models.py` to its file state (`simulation/js/sim.js:145-155`). It then creates a migration containing `Question` and `Choice` models even though the learner never defines those models or adds `polls` to `INSTALLED_APPS` (`simulation/js/sim.js:157-169`).

**Recommendation:** Add the actual files created by `startapp`, require a simulated model-edit step and app registration, and generate migrations only after model changes exist.

References: [Django tutorial: creating an app](https://docs.djangoproject.com/en/5.2/intro/tutorial01/) and [Django migrations](https://docs.djangoproject.com/en/5.2/topics/migrations/).

### H3. A feature-branch workflow is incorrectly called Gitflow

`index.html:167` labels ordinary feature branching as “Git Flow.” The procedure and simulator branch directly from `main` and merge directly back into `main`, while `theory.html:383-418` describes Gitflow with a `develop` branch and hotfix branches. These are different workflows. The linked Atlassian source also describes Gitflow as a legacy workflow that has declined in favor of trunk-based development.

**Recommendation:** Either rename the lesson to “feature branch workflow” and remove `develop`/hotfix claims, or implement the full Gitflow lifecycle consistently. Avoid calling one workflow the universal industry standard.

Reference: [Atlassian Gitflow workflow](https://www.atlassian.com/git/tutorials/comparing-workflows/gitflow-workflow).

### H4. Core Git and Django concepts contain inaccuracies

The following statements should be corrected:

- `theory.html:234` treats `HEAD` as the repository. `HEAD` is normally a symbolic reference to the current branch.
- The same line implies all Git object identifiers use SHA-1. Git also supports SHA-256 repositories.
- `theory.html:366` calls migration history linear, but Django migrations form a dependency graph and can have multiple heads.
- `index.html:162` calls migrations immutable. Django recommends committing migrations, but they can be edited in exceptional cases and can be squashed.

References: [Git repository layout](https://git-scm.com/docs/gitrepository-layout), [git init object formats](https://git-scm.com/docs/git-init), and [Django migrations](https://docs.djangoproject.com/en/5.2/topics/migrations/).

### H5. SQLite and Python bytecode warnings are overstated or false

`theory.html:283-298` says SQLite conflicts are unresolvable, that production databases must always be external services, that bytecode is machine-specific, and that stale `.pyc` files override edited source. Git cannot automatically merge a SQLite database, but users can resolve the conflict by choosing or reconstructing a version. Django discourages many production uses of SQLite but does not categorically forbid them. Python normally validates cached bytecode against source metadata or hashes.

The same exaggerated SQLite claim is used as the correct answer in `pretest.html:217-225`.

**Recommendation:** Explain the practical collaboration and data-leak risks without absolute claims.

References: [Django migrations and SQLite](https://docs.djangoproject.com/en/5.2/topics/migrations/) and [Python cached bytecode invalidation](https://docs.python.org/3/reference/import.html#cached-bytecode-invalidation).

### H6. The simulator advertises obsolete versions and a nonexistent environment

`simulation/index.html:42` states “Django 4.2 & Git 2.40 Virtual Environment Ready.” The page is a command simulator, not a working Django or Git environment. Django 4.2 reached end of extended support on 7 April 2026, and Git 2.40 is also old.

**Recommendation:** Say “Simulated Git and Django workspace” and either omit versions or use supported, intentionally pinned versions.

Reference: [Supported Django versions](https://www.djangoproject.com/download/).

### H7. The posttest overstates mandatory secret-remediation steps

`posttest.html:205-214` makes history rewriting with `git-filter-repo` part of the mandatory immediate answer. Revoking or rotating the exposed credential is mandatory; GitHub notes that rewriting history has significant side effects and may not be warranted after the secret is revoked.

**Recommendation:** Make immediate revocation/rotation the unambiguous first action. Present history removal as a risk-based, coordinated follow-up.

Reference: [GitHub: removing sensitive data](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/removing-sensitive-data-from-a-repository).

### H8. User-controlled simulator values are inserted as HTML

Branch and tag names are interpolated into terminal and SVG `innerHTML` without escaping in several paths, including `simulation/js/sim.js:421`, `439`, `463`, and `619`. The simulator also accepts names that real Git would reject. A crafted value can inject markup into the iframe.

**Recommendation:** Validate names using Git-compatible rules and render all user-controlled values with `textContent` or proper escaping.

## Medium-severity findings

### M1. Every experiment page uses duplicate `bug-report` IDs

Each page has a desktop and mobile `<bug-report id="bug-report">`. Duplicate IDs are invalid HTML, and `document.getElementById('bug-report')` binds only the first one. The visible mobile component may therefore lack the shared success/error handling.

**Recommendation:** Use unique IDs or select and bind every `bug-report` element.

### M2. Bootstrap 4 CSS is mixed with Bootstrap 5 beta JavaScript and classes

`assets/css/bootstrap.min.css` is Bootstrap 4.4.1, while every main page loads Bootstrap 5.0.0-beta1 JavaScript. The markup also uses Bootstrap 5-only classes and attributes such as `me-2`, `form-select`, `btn-close`, and `data-bs-dismiss`.

**Recommendation:** Standardize on one current Bootstrap release and use matching CSS, JavaScript, attributes, and utility classes.

### M3. The procedure contains inconsistent or incomplete command output

- `procedure.html:216` reports “6 files changed” but lists seven new files.
- A fresh user may be unable to commit because no `user.name` or `user.email` setup or troubleshooting note is provided.
- The Windows activation comment at `procedure.html:156` does not distinguish Command Prompt from PowerShell.
- The workflow labels a release “production-ready” without running migrations, checks, or tests after the polls changes.

### M4. Simulator command handling contains additional behavioral errors

- The interface suggests `git help`, but `git help` is not implemented (`simulation/js/sim.js:190`).
- `git checkout -b` silently switches to an existing branch while claiming it created a new one.
- Merging a branch into itself creates a merge commit instead of reporting that it is already up to date.
- `git tag -a` accepts no tag name and can create an `undefined` tag.
- Tags are placed on the last array entry instead of the checked-out branch's `HEAD` (`simulation/js/sim.js:431-439`).
- `git log` displays every recorded commit regardless of whether it is reachable from the current branch.

### M5. Assessment feedback and accessibility are weak

- Correctness is communicated primarily through green/red text, relying on color alone.
- `lightgreen` on white has poor contrast.
- Unanswered questions are silently scored as incorrect.
- Incorrect responses do not reveal or explain the correct answer.
- The result container has no `aria-live` behavior.
- Filtering can leave the learner seeing “Question 5” as the only question.

### M6. General accessibility semantics are incomplete

- Main navigation toggle buttons have no accessible name, `aria-controls`, or `aria-expanded` state.
- Pages contain no `<h1>` and no `<main>` landmark.
- Most feedback labels are not associated with their controls through `for` and `id`.
- Social icon links have no accessible names.
- Decorative terminal window controls are exposed without meaning or hidden-state annotations.

### M7. Front-end dependencies are redundant and unnecessarily fragile

Every main page loads both local and CDN copies of GitHub Markdown CSS, Font Awesome 4 and Font Awesome 6, unused KaTeX CSS, and the Google API script. Several CDN resources lack subresource-integrity metadata. This increases load time, creates style conflicts, introduces avoidable third-party dependencies, and weakens offline use.

The README says the project can simply be opened locally, but the mobile menu, alert dialogs, icons, ratings, bug reports, and fonts depend on remote resources.

### M8. Unrelated and internal files are committed to the repository

`cn-iitr_vlabs_ac_in.html` is an unrelated Stop-and-Wait ARQ experiment with IIT Roorkee metadata and duplicate IDs. `CHAT_LOG.md` contains internal project-generation history. Both make the repository look unfinished and could be accidentally published.

**Recommendation:** Remove them from the deliverable or move legitimate research material into a clearly named documentation directory excluded from deployment.

### M9. Attribution and licensing are incomplete

`contributors.html` attributes principal development, domain expertise, review, and pedagogical evaluation to generic teams rather than named, verifiable contributors. The footer advertises AGPL 3.0 and CC BY-NC-SA 4.0, but the repository has no license files or explanation of which license applies to code, educational content, and third-party assets.

### M10. References require bibliographic cleanup

- The *Pro Git* citation omits its 2014 publication year and does not link the book entry.
- “Official Gitignore Template for Python and Django” is imprecise; the target is GitHub's general `Python.gitignore` template.
- The references mix a book edition, project documentation, an application methodology, and a vendor tutorial without access dates or consistent citation style.
- The current Gitflow reference undermines the lesson's claim that Gitflow is the standard modern workflow.

Reference: [Pro Git, second edition](https://git-scm.com/book/en/v2).

## Low-severity and professionalism findings

### L1. Strict mode is not enabled

`assets/js/event-handler.js:1` contains `"use-strict";`, which is just an unused string. The valid directive is `"use strict";`.

### L2. Difficulty vocabulary is inconsistent

The pretest uses “Beginner / Intermediate / Advanced,” while the posttest uses “Easy / Intermediate / Hard.” Standardizing the scale would make the assessments feel cohesive.

### L3. Quiz content is duplicated in markup and JavaScript

Each assessment stores the same questions and answers once as visible HTML and again in `myQuestions`. Only the answer keys are needed by the shared scoring script. This duplication creates a maintenance risk when questions are edited in only one location.

### L4. Branding behavior is inconsistent

The desktop header shows the institutional and Virtual Labs logos together, while the mobile modal shows only the Virtual Labs logo. Both desktop logos are also wrapped in one link to `index.html`, so neither logo links to its respective organization.

### L5. The writing relies too heavily on absolutes and promotional phrasing

Phrases such as “MUST TRACK,” “NEVER,” “severe operational failures,” “production-grade,” “industry best practice,” “invaluable,” and “live virtual terminal” are used frequently. Some are technically overbroad, and the overall tone is less neutral and academic than expected for instructional material.

**Recommendation:** Prefer precise statements explaining conditions, risks, and tradeoffs.

## Checks that passed

- All first-party JavaScript files pass `node --check` syntax validation.
- All referenced local HTML, CSS, JavaScript, image, font, and iframe paths exist.
- Main sidebar links resolve to existing pages.
- Pretest and posttest answer-key letters match their intended visible answers.
- External reference targets for GitHub's Python template, Twelve-Factor configuration, and Atlassian Gitflow are reachable at audit time.
- The working tree was clean before this report was added.

## Recommended remediation order

1. Replace the fake feedback success flow with real submission behavior.
2. Fix the missing SweetAlert dependency and duplicate bug-report bindings.
3. Repair `clear`, branch pointers, checkout, merge, tag, log, and `.gitignore` behavior in the simulator.
4. Rework the simulated Django app and migration sequence.
5. Decide whether the lesson teaches feature branching or Gitflow, then make all pages and assessments consistent.
6. Correct the Git, migration, SQLite, bytecode, secret-remediation, and version claims.
7. Standardize Bootstrap and remove redundant dependencies.
8. Address accessibility and assessment feedback.
9. Remove unrelated/internal artifacts and add explicit licensing and contributor information.
10. Normalize citations and perform a final editorial pass.
