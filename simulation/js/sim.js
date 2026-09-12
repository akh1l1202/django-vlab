// Git Repository Management for Django - Virtual Labs Simulation Engine

const state = {
  isInitialized: false,
  currentBranch: 'main',
  branches: ['main'],
  headCommitId: null,
  commits: [], // { id, hash, message, branch, parentId, tag }
  hasGitignore: false,
  hasPollsApp: false,
  files: {
    'manage.py': 'untracked',
    'mysite/settings.py': 'untracked',
    'mysite/urls.py': 'untracked',
    '.gitignore': 'missing',
    'db.sqlite3': 'untracked',
    '.env': 'untracked',
    'venv/': 'untracked'
  },
  tasks: {
    init: false,
    gitignore: false,
    initialCommit: false,
    branch: false,
    pollsCommit: false,
    merge: false,
    tag: false
  },
  history: [],
  historyIndex: -1
};

const labSteps = [
  { key: 'init', desc: 'Initialize Git: <code>git init</code>' },
  { key: 'gitignore', desc: 'Create <code>.gitignore</code> for Django' },
  { key: 'initialCommit', desc: 'Stage &amp; commit initial codebase' },
  { key: 'branch', desc: 'Create feature branch: <code>git checkout -b feature/polls</code>' },
  { key: 'pollsCommit', desc: 'Commit app models &amp; schema migrations' },
  { key: 'merge', desc: 'Switch to <code>main</code> &amp; merge feature' },
  { key: 'tag', desc: 'Tag release: <code>git tag -a v1.0.0</code>' }
];

document.addEventListener('DOMContentLoaded', () => {
  const terminalInput = document.getElementById('terminal-input');
  const terminalBody = document.getElementById('terminal-body');

  renderFilesGrid();
  renderTasks();
  renderGraph();

  terminalInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const rawCmd = terminalInput.value.trim();
      terminalInput.value = '';
      if (rawCmd) {
        state.history.push(rawCmd);
        state.historyIndex = state.history.length;
        executeCommand(rawCmd);
      }
    } else if (e.key === 'ArrowUp') {
      if (state.historyIndex > 0) {
        state.historyIndex--;
        terminalInput.value = state.history[state.historyIndex];
      }
    } else if (e.key === 'ArrowDown') {
      if (state.historyIndex < state.history.length - 1) {
        state.historyIndex++;
        terminalInput.value = state.history[state.historyIndex];
      } else {
        state.historyIndex = state.history.length;
        terminalInput.value = '';
      }
    }
  });

  // Keep focus on terminal
  document.querySelector('.sim-terminal-col').addEventListener('click', () => {
    terminalInput.focus();
  });
});

function writeTerminal(html) {
  const terminalBody = document.getElementById('terminal-body');
  const inputRow = document.getElementById('terminal-input-row');
  const line = document.createElement('div');
  line.className = 'terminal-line';
  line.innerHTML = html;
  terminalBody.insertBefore(line, inputRow);
  terminalBody.scrollTop = terminalBody.scrollHeight;
}

function updatePrompt() {
  const branchLabel = document.getElementById('prompt-branch-label');
  if (state.isInitialized) {
    branchLabel.textContent = `(${state.currentBranch})`;
  } else {
    branchLabel.textContent = '';
  }
}

function executeCommand(commandStr) {
  // Echo user command
  const branchStr = state.isInitialized ? `<span class="prompt-branch">(${state.currentBranch})</span>` : '';
  writeTerminal(`<span class="prompt-user">student@django-dev</span>:<span class="prompt-dir">~/mysite</span>${branchStr}<span class="prompt-sign">$</span> <span class="text-cmd">${escapeHtml(commandStr)}</span>`);

  const parts = commandStr.split(/\s+/);
  const cmd = parts[0];
  const sub = parts[1];

  if (cmd === 'clear') {
    const lines = document.querySelectorAll('.terminal-body .terminal-line');
    lines.forEach(l => l.remove());
    return;
  }

  if (cmd === 'help') {
    writeTerminal(`
      <div class="text-info"><strong>Available Virtual Git &amp; Django Commands:</strong></div>
      <div>&nbsp;&nbsp;<code>git init</code> - Initialize local repository</div>
      <div>&nbsp;&nbsp;<code>git status</code> - Inspect working directory &amp; staging index</div>
      <div>&nbsp;&nbsp;<code>touch .gitignore</code> / <code>create-gitignore</code> - Generate production Django .gitignore</div>
      <div>&nbsp;&nbsp;<code>git add &lt;file&gt;</code> / <code>git add .</code> - Stage changes</div>
      <div>&nbsp;&nbsp;<code>git commit -m "&lt;msg&gt;"</code> - Snapshot staged files into repository</div>
      <div>&nbsp;&nbsp;<code>git branch</code> / <code>git branch &lt;name&gt;</code> - List or create branches</div>
      <div>&nbsp;&nbsp;<code>git checkout &lt;branch&gt;</code> / <code>git checkout -b &lt;branch&gt;</code> - Switch branches</div>
      <div>&nbsp;&nbsp;<code>python manage.py startapp polls</code> - Scaffold Django Polls app</div>
      <div>&nbsp;&nbsp;<code>python manage.py makemigrations</code> - Generate schema migration files</div>
      <div>&nbsp;&nbsp;<code>git merge &lt;branch&gt;</code> - Merge feature branch into current branch</div>
      <div>&nbsp;&nbsp;<code>git tag -a &lt;tag&gt; -m "&lt;msg&gt;"</code> - Tag current commit</div>
      <div>&nbsp;&nbsp;<code>git log --oneline</code> - View commit history</div>
      <div>&nbsp;&nbsp;<code>ls</code> / <code>ls -la</code> - List directory files</div>
      <div>&nbsp;&nbsp;<code>clear</code> - Clear terminal display</div>
    `);
    return;
  }

  if (cmd === 'ls') {
    let output = '';
    for (let f in state.files) {
      if (state.files[f] !== 'missing') {
        output += `${f}&nbsp;&nbsp;&nbsp;&nbsp;`;
      }
    }
    writeTerminal(`<div>${output}</div>`);
    return;
  }

  // Django commands
  if (cmd === 'python' || cmd === 'python3') {
    if (parts[1] === 'manage.py' && parts[2] === 'startapp' && parts[3] === 'polls') {
      state.hasPollsApp = true;
      state.files['polls/models.py'] = 'untracked';
      writeTerminal(`<div class="text-success">Created Django app 'polls' with models.py and views.py.</div>`);
      renderFilesGrid();
      return;
    }
    if (parts[1] === 'manage.py' && parts[2] === 'makemigrations') {
      if (!state.hasPollsApp) {
        writeTerminal(`<div class="text-warning">No changes detected. Run 'python manage.py startapp polls' first!</div>`);
        return;
      }
      state.files['polls/migrations/0001_initial.py'] = 'untracked';
      writeTerminal(`
        <div>Migrations for 'polls':</div>
        <div class="text-success">&nbsp;&nbsp;polls/migrations/0001_initial.py</div>
        <div>&nbsp;&nbsp;&nbsp;&nbsp;- Create model Question</div>
        <div>&nbsp;&nbsp;&nbsp;&nbsp;- Create model Choice</div>
      `);
      renderFilesGrid();
      return;
    }
    writeTerminal(`<div class="text-muted">Type 'python manage.py startapp polls' or 'python manage.py makemigrations' to simulate Django actions.</div>`);
    return;
  }

  // Create .gitignore convenience command
  if (cmd === 'create-gitignore' || cmd === 'touch' && parts[1] === '.gitignore' || cmd === 'echo' && commandStr.includes('.gitignore')) {
    createGitignore();
    return;
  }

  // Non-git commands
  if (cmd !== 'git') {
    writeTerminal(`<div class="text-danger">bash: ${escapeHtml(cmd)}: command not found. Type 'help' for instructions.</div>`);
    return;
  }

  // Git commands
  if (!sub) {
    writeTerminal(`<div class="text-warning">Type 'git help' or 'help' for available git commands.</div>`);
    return;
  }

  // 1. git init
  if (sub === 'init') {
    state.isInitialized = true;
    state.tasks.init = true;
    updatePrompt();
    writeTerminal(`<div class="text-success">Initialized empty Git repository in /home/student/mysite/.git/</div>`);
    renderTasks();
    renderGraph();
    return;
  }

  if (!state.isInitialized) {
    writeTerminal(`<div class="text-danger">fatal: not a git repository (or any of the parent directories): .git</div>`);
    return;
  }

  // 2. git status
  if (sub === 'status') {
    let staged = [];
    let untracked = [];
    for (let f in state.files) {
      if (state.files[f] === 'staged') staged.push(f);
      if (state.files[f] === 'untracked') untracked.push(f);
    }

    let out = `<div>On branch ${state.currentBranch}</div>`;
    if (state.commits.length === 0) {
      out += `<div>No commits yet</div><br/>`;
    }

    if (staged.length > 0) {
      out += `<div class="text-success">Changes to be committed:</div>`;
      out += `<div class="text-muted">&nbsp;&nbsp;(use "git restore --staged &lt;file&gt;..." to unstage)</div>`;
      staged.forEach(f => {
        out += `<div class="text-success">&nbsp;&nbsp;&nbsp;&nbsp;new file:   ${f}</div>`;
      });
      out += `<br/>`;
    }

    if (untracked.length > 0) {
      out += `<div class="text-danger">Untracked files:</div>`;
      out += `<div class="text-muted">&nbsp;&nbsp;(use "git add &lt;file&gt;..." to include in what will be committed)</div>`;
      untracked.forEach(f => {
        out += `<div class="text-danger">&nbsp;&nbsp;&nbsp;&nbsp;${f}</div>`;
      });
      out += `<br/>`;
    }

    if (staged.length === 0 && untracked.length === 0) {
      out += `<div class="text-success">nothing to commit, working tree clean</div>`;
    }

    writeTerminal(out);
    return;
  }

  // 3. git add
  if (sub === 'add') {
    const target = parts[2];
    if (!target) {
      writeTerminal(`<div class="text-danger">fatal: Nothing specified, nothing added.</div>`);
      return;
    }

    if (target === '.' || target === '-A') {
      if (!state.hasGitignore) {
        writeTerminal(`
          <div class="text-warning"><strong>[CAUTION] You are running 'git add .' without a .gitignore file!</strong></div>
          <div class="text-danger">&nbsp;&nbsp;Staging db.sqlite3, .env, and venv/ is dangerous and violates security hygiene!</div>
          <div class="text-info">&nbsp;&nbsp;Tip: Run <code>create-gitignore</code> first to protect secrets and local databases.</div>
        `);
      }
      for (let f in state.files) {
        if (state.files[f] === 'untracked') {
          state.files[f] = 'staged';
        }
      }
      writeTerminal(`<div class="text-success">Staged all eligible files into the staging index.</div>`);
    } else {
      if (state.files[target] !== undefined && state.files[target] !== 'missing') {
        state.files[target] = 'staged';
        writeTerminal(`<div class="text-success">Staged '${escapeHtml(target)}'.</div>`);
      } else {
        writeTerminal(`<div class="text-danger">fatal: pathspec '${escapeHtml(target)}' did not match any files</div>`);
      }
    }
    renderFilesGrid();
    return;
  }

  // 4. git commit
  if (sub === 'commit') {
    let stagedFiles = Object.keys(state.files).filter(f => state.files[f] === 'staged');
    if (stagedFiles.length === 0) {
      writeTerminal(`<div>On branch ${state.currentBranch}<br/>nothing to commit, working tree clean</div>`);
      return;
    }

    // Extract message
    let msg = 'WIP commit';
    const mIdx = commandStr.indexOf('-m');
    if (mIdx !== -1) {
      const match = commandStr.match(/-m\s+["']?([^"']+)["']?/);
      if (match && match[1]) msg = match[1];
    }

    const sha = Math.random().toString(16).substring(2, 9);
    const newCommit = {
      id: state.commits.length + 1,
      hash: sha,
      message: msg,
      branch: state.currentBranch,
      parentId: state.headCommitId,
      tag: null
    };
    state.commits.push(newCommit);
    state.headCommitId = newCommit.id;

    stagedFiles.forEach(f => {
      state.files[f] = 'committed';
    });

    writeTerminal(`
      <div class="text-success">[${state.currentBranch} ${sha}] ${escapeHtml(msg)}</div>
      <div class="text-muted">&nbsp;${stagedFiles.length} files changed</div>
    `);

    // Task check
    if (!state.tasks.initialCommit) {
      state.tasks.initialCommit = true;
    }
    if (state.currentBranch.includes('polls') || msg.toLowerCase().includes('polls') || msg.toLowerCase().includes('model')) {
      state.tasks.pollsCommit = true;
    }

    renderFilesGrid();
    renderTasks();
    renderGraph();
    return;
  }

  // 5. git branch
  if (sub === 'branch') {
    const branchName = parts[2];
    if (!branchName) {
      let out = '';
      state.branches.forEach(b => {
        if (b === state.currentBranch) {
          out += `<div class="text-success">* <strong>${b}</strong></div>`;
        } else {
          out += `<div>&nbsp;&nbsp;${b}</div>`;
        }
      });
      writeTerminal(out);
      return;
    }

    if (!state.branches.includes(branchName)) {
      state.branches.push(branchName);
      writeTerminal(`<div class="text-success">Created branch '${branchName}'.</div>`);
      renderGraph();
    } else {
      writeTerminal(`<div class="text-danger">fatal: A branch named '${branchName}' already exists.</div>`);
    }
    return;
  }

  // 6. git checkout
  if (sub === 'checkout') {
    if (parts[2] === '-b') {
      const bName = parts[3];
      if (!bName) {
        writeTerminal(`<div class="text-danger">fatal: Missing branch name.</div>`);
        return;
      }
      if (!state.branches.includes(bName)) {
        state.branches.push(bName);
      }
      state.currentBranch = bName;
      if (bName.includes('polls')) state.tasks.branch = true;
      updatePrompt();
      writeTerminal(`<div class="text-success">Switched to a new branch '${bName}'.</div>`);
      renderTasks();
      renderGraph();
      return;
    }

    const bTarget = parts[2];
    if (state.branches.includes(bTarget)) {
      state.currentBranch = bTarget;
      updatePrompt();
      writeTerminal(`<div class="text-success">Switched to branch '${bTarget}'.</div>`);
      renderGraph();
    } else {
      writeTerminal(`<div class="text-danger">error: pathspec '${bTarget}' did not match any file(s) known to git</div>`);
    }
    return;
  }

  // 7. git merge
  if (sub === 'merge') {
    const targetBranch = parts[2];
    if (!targetBranch) {
      writeTerminal(`<div class="text-danger">fatal: No branch specified to merge.</div>`);
      return;
    }
    if (!state.branches.includes(targetBranch)) {
      writeTerminal(`<div class="text-danger">merge: ${targetBranch} - not something we can merge</div>`);
      return;
    }

    const sha = Math.random().toString(16).substring(2, 9);
    const mergeCommit = {
      id: state.commits.length + 1,
      hash: sha,
      message: `Merge branch '${targetBranch}' into ${state.currentBranch}`,
      branch: state.currentBranch,
      parentId: state.headCommitId,
      tag: null
    };
    state.commits.push(mergeCommit);
    state.headCommitId = mergeCommit.id;

    state.tasks.merge = true;

    writeTerminal(`
      <div class="text-success">Updating HEAD..${sha}</div>
      <div class="text-success">Fast-forward merge of branch '${targetBranch}' completed.</div>
    `);
    renderTasks();
    renderGraph();
    return;
  }

  // 8. git tag
  if (sub === 'tag') {
    if (parts[2] === '-a') {
      const tagName = parts[3];
      if (state.commits.length === 0) {
        writeTerminal(`<div class="text-danger">fatal: Failed to resolve 'HEAD' as a valid ref.</div>`);
        return;
      }
      const activeCommit = state.commits[state.commits.length - 1];
      activeCommit.tag = tagName;
      state.tasks.tag = true;
      writeTerminal(`<div class="text-success">Created annotated tag '${tagName}' on commit ${activeCommit.hash}.</div>`);
      renderTasks();
      renderGraph();
      return;
    }

    let out = '';
    state.commits.filter(c => c.tag).forEach(c => {
      out += `<div>${c.tag}</div>`;
    });
    if (!out) out = '<div class="text-muted">No tags created yet.</div>';
    writeTerminal(out);
    return;
  }

  // 9. git log
  if (sub === 'log') {
    if (state.commits.length === 0) {
      writeTerminal(`<div class="text-danger">fatal: your current branch '${state.currentBranch}' does not have any commits yet</div>`);
      return;
    }
    let out = '';
    [...state.commits].reverse().forEach(c => {
      let tagBadge = c.tag ? `<span class="text-warning"> (tag: ${c.tag})</span>` : '';
      let branchBadge = c.id === state.headCommitId ? `<span class="text-info"> (HEAD -&gt; ${state.currentBranch})</span>` : '';
      out += `<div><span class="text-warning">${c.hash}</span>${branchBadge}${tagBadge} ${escapeHtml(c.message)}</div>`;
    });
    writeTerminal(out);
    return;
  }

  writeTerminal(`<div class="text-danger">git: '${sub}' is not a recognized command in this virtual lab. Type 'help' for available commands.</div>`);
}

function createGitignore() {
  state.hasGitignore = true;
  state.files['.gitignore'] = 'untracked';
  state.files['db.sqlite3'] = 'ignored';
  state.files['.env'] = 'ignored';
  state.files['venv/'] = 'ignored';
  state.tasks.gitignore = true;

  writeTerminal(`
    <div class="text-success">Created .gitignore with standard Django configuration:</div>
    <div class="text-muted">&nbsp;&nbsp;Ignored: db.sqlite3, .env, venv/, __pycache__/</div>
  `);

  renderFilesGrid();
  renderTasks();
}

function runQuickCommand(cmd) {
  const terminalInput = document.getElementById('terminal-input');
  terminalInput.value = cmd;
  terminalInput.focus();
}

function renderFilesGrid() {
  const container = document.getElementById('files-grid');
  container.innerHTML = '';

  for (let f in state.files) {
    const s = state.files[f];
    if (s === 'missing') continue;

    const div = document.createElement('div');
    div.className = `file-pill status-${s}`;
    div.innerHTML = `<span>${f}</span><span style="font-size: 0.7rem; text-transform: uppercase;">${s}</span>`;
    container.appendChild(div);
  }
}

function renderTasks() {
  const container = document.getElementById('tasks-container');

  container.innerHTML = '';
  labSteps.forEach(t => {
    const isDone = state.tasks[t.key];
    const item = document.createElement('div');
    item.className = 'task-item';
    item.innerHTML = `
      <div class="task-icon ${isDone ? 'completed' : 'pending'}">${isDone ? '&#10003;' : '&bull;'}</div>
      <div class="task-desc">${t.desc}</div>
    `;
    container.appendChild(item);
  });
  updateGuidance();
}

function getNextAction() {
  const hasStagedFiles = Object.values(state.files).includes('staged');
  const hasUntrackedFiles = Object.values(state.files).includes('untracked');
  const hasMigration = state.files['polls/migrations/0001_initial.py'] !== undefined;

  if (!state.tasks.init) return { label: 'Initialize the Git repository', command: 'git init' };
  if (!state.tasks.gitignore) return { label: 'Protect local and sensitive files', command: 'create-gitignore' };
  if (!state.tasks.initialCommit && !hasStagedFiles) return { label: 'Stage the initial project files', command: 'git add .' };
  if (!state.tasks.initialCommit) return { label: 'Create the initial project commit', command: 'git commit -m "chore: init django project"' };
  if (!state.tasks.branch) return { label: 'Create the polls feature branch', command: 'git checkout -b feature/polls' };
  if (!state.hasPollsApp) return { label: 'Create the Django polls app', command: 'python manage.py startapp polls' };
  if (!hasMigration) return { label: 'Generate the polls migration', command: 'python manage.py makemigrations' };
  if (!state.tasks.pollsCommit && hasUntrackedFiles) return { label: 'Stage the polls app and migration', command: 'git add .' };
  if (!state.tasks.pollsCommit) return { label: 'Commit the polls feature', command: 'git commit -m "feat: add polls models"' };
  if (!state.tasks.merge && state.currentBranch !== 'main') return { label: 'Return to the main branch', command: 'git checkout main' };
  if (!state.tasks.merge) return { label: 'Merge the polls feature', command: 'git merge feature/polls' };
  if (!state.tasks.tag) return { label: 'Create the v1.0.0 release tag', command: 'git tag -a v1.0.0 -m "release v1.0.0"' };
  return null;
}

function updateGuidance() {
  const completed = labSteps.filter(step => state.tasks[step.key]).length;
  const percent = Math.round((completed / labSteps.length) * 100);
  const progressText = document.getElementById('progress-text');
  const progressBar = document.getElementById('progress-bar');
  const nextStepText = document.getElementById('next-step-text');
  const nextStepButton = document.getElementById('next-step-button');
  const nextAction = getNextAction();

  progressText.textContent = `${completed} of ${labSteps.length} steps complete`;
  progressBar.style.width = `${percent}%`;

  if (nextAction) {
    nextStepText.textContent = nextAction.label;
    nextStepButton.disabled = false;
    nextStepButton.innerHTML = '<i class="fa-solid fa-terminal"></i> Fill command';
  } else {
    nextStepText.textContent = 'Lab workflow complete';
    nextStepButton.disabled = true;
    nextStepButton.innerHTML = '<i class="fa-solid fa-check"></i> Complete';
  }
}

function fillNextCommand() {
  const nextAction = getNextAction();
  if (nextAction) runQuickCommand(nextAction.command);
}

function renderGraph() {
  const container = document.getElementById('git-graph-container');
  if (state.commits.length === 0) {
    container.innerHTML = `<div style="color: #64748b; font-size: 0.85rem; width: 100%; text-align: center;">No commits in repository yet.<br/>Initialize repository and create a commit to visualize graph.</div>`;
    return;
  }

  let html = `<svg height="170" width="${Math.max(480, state.commits.length * 120 + 80)}" style="display: block;">`;

  // Draw connecting line
  const startX = 40;
  const startY = 85;
  for (let i = 0; i < state.commits.length - 1; i++) {
    const x1 = startX + i * 110;
    const x2 = startX + (i + 1) * 110;
    html += `<line x1="${x1}" y1="${startY}" x2="${x2}" y2="${startY}" stroke="#94a3b8" stroke-width="3" />`;
  }

  // Draw nodes
  state.commits.forEach((c, idx) => {
    const cx = startX + idx * 110;
    const cy = startY;
    const isHead = c.id === state.headCommitId;

    // Outer glow if HEAD
    if (isHead) {
      html += `<circle cx="${cx}" cy="${cy}" r="18" fill="none" stroke="#0284c7" stroke-width="2" stroke-dasharray="3,3" />`;
    }

    // Node circle
    html += `<circle cx="${cx}" cy="${cy}" r="12" fill="#3b82f6" stroke="#ffffff" stroke-width="2" />`;

    // Hash text
    html += `<text x="${cx}" y="${cy + 28}" fill="#52697d" font-size="11" font-family="monospace" text-anchor="middle">${c.hash}</text>`;

    // Message snippet
    const shortMsg = c.message.length > 12 ? c.message.substring(0, 10) + '..' : c.message;
    html += `<text x="${cx}" y="${cy + 44}" fill="#334155" font-size="10" font-family="sans-serif" text-anchor="middle">${escapeHtml(shortMsg)}</text>`;

    // Branch tag badge
    if (isHead) {
      html += `
        <rect x="${cx - 36}" y="${cy - 48}" width="72" height="18" rx="4" fill="#0284c7" />
        <text x="${cx}" y="${cy - 35}" fill="#ffffff" font-size="10" font-weight="bold" font-family="sans-serif" text-anchor="middle">HEAD:${state.currentBranch}</text>
      `;
    }

    // Tag badge if present
    if (c.tag) {
      html += `
        <rect x="${cx - 25}" y="${cy - 70}" width="50" height="16" rx="4" fill="#eab308" />
        <text x="${cx}" y="${cy - 58}" fill="#0f172a" font-size="10" font-weight="bold" font-family="sans-serif" text-anchor="middle">${c.tag}</text>
      `;
    }
  });

  html += `</svg>`;
  container.innerHTML = html;
  container.scrollLeft = container.scrollWidth;
}

function escapeHtml(str) {
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
