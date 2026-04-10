// ═══════════════════════════════════════════════════════
//  FILE STORE
// ═══════════════════════════════════════════════════════
const FILES = {
  'main.ts': `// CodePad IDE v2 — TypeScript ✦
// Clique "Compilar & Executar TypeScript" no painel abaixo

interface User {
  id: number;
  name: string;
  email: string;
}

function createUser(name: string, email: string): User {
  return { id: Math.random(), name, email };
}

const greet = (user: User): string =>
  \`Olá, \${user.name}! (\${user.email})\`;

const users: User[] = [
  createUser("Alice", "alice@example.com"),
  createUser("Bob",   "bob@example.com"),
];

users.forEach(u => console.log(greet(u)));

// Generics
function first<T>(arr: T[]): T | undefined {
  return arr[0];
}

console.log("Primeiro:", first(users)?.name);
console.log("Array:", first([10, 20, 30]));
`,
  'main.js': `// JavaScript puro
const add = (a, b) => a + b;
const multiply = (a, b) => a * b;

console.log("Soma:", add(10, 20));
console.log("Mult:", multiply(5, 6));

// Desestruturação
const { name, age = 25 } = { name: "Dev" };
console.log(name, age);

// Array methods
const nums = [1,2,3,4,5];
const evens = nums.filter(n => n % 2 === 0);
const doubled = evens.map(n => n * 2);
console.log("Dobro dos pares:", doubled);
`,
  'index.html': `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Meu App</title>
  <link rel="stylesheet" href="style.css" />
</head>
<body>
  <div class="container">
    <h1>Hello World 🚀</h1>
    <p>Editando com <strong>CodePad IDE</strong>!</p>
    <button onclick="alert('Funcionando!')">Clique aqui</button>
    <div id="output"></div>
  </div>
  <script src="script.js"><\/script>
</body>
</html>`,
  'style.css': `/* Reset */
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

body {
  font-family: -apple-system, system-ui, sans-serif;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.container {
  background: white;
  border-radius: 16px;
  padding: 2rem 2.5rem;
  box-shadow: 0 20px 60px rgba(0,0,0,0.3);
  text-align: center;
  max-width: 400px;
  width: 90%;
}

h1 {
  font-size: 2rem;
  color: #1a1a2e;
  margin-bottom: 0.5rem;
}

p { color: #666; margin-bottom: 1.5rem; }

button {
  background: #667eea;
  color: white;
  border: none;
  padding: 10px 24px;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102,126,234,0.5);
}

#output {
  margin-top: 1rem;
  font-size: 0.9rem;
  color: #444;
}`,
  'script.js': `// Vinculado ao index.html via <script src="script.js">
document.addEventListener('DOMContentLoaded', () => {
  const out = document.getElementById('output');
  out.textContent = '✓ script.js carregado com sucesso!';
  console.log('DOM pronto!');
});`,
  'data.json': `{
  "app": "CodePad IDE",
  "version": "2.0.0",
  "features": [
    "TypeScript compilation",
    "Syntax highlighting",
    "HTML preview",
    "AI assistant",
    "PWA support"
  ],
  "author": "CodePad",
  "license": "MIT"
}`,
  'README.md': `# CodePad IDE v2

Editor de código leve que roda no seu celular como PWA.

## Recursos
- **TypeScript** — compilação direto no browser
- **Syntax Highlight** — JS, TS, HTML, CSS, Python, PHP, JSON
- **Preview HTML** — renderiza HTML + CSS + JS juntos
- **AI Assist** — tire dúvidas sobre seu código
- **PWA** — instala e funciona offline

## Atalhos
| Tecla | Ação |
|-------|------|
| Ctrl+S | Salvar |
| Ctrl+F | Buscar |
| Ctrl+\` | Terminal |
| Ctrl+, | Configurações |
| Tab | Indentar |

## Linguagens suportadas
JavaScript · TypeScript · HTML · CSS · Python · PHP · JSON · Markdown
`,
  'exemplo.py': `# Python — syntax highlight apenas
# (execução Python não é suportada no browser)

def fibonacci(n: int) -> list[int]:
    seq = [0, 1]
    for _ in range(n - 2):
        seq.append(seq[-1] + seq[-2])
    return seq[:n]

def is_prime(n: int) -> bool:
    if n < 2:
        return False
    for i in range(2, int(n**0.5) + 1):
        if n % i == 0:
            return False
    return True

result = fibonacci(10)
primes = [x for x in range(50) if is_prime(x)]

print(f"Fibonacci: {result}")
print(f"Primos: {primes}")
`,
};

// ═══════════════════════════════════════════════════════
//  STATE
// ═══════════════════════════════════════════════════════
let activeFile = 'main.ts';
let openTabs   = ['main.ts','index.html','style.css','script.js'];
let settings   = { theme:'light', fontSize:12, lineHeight:1.65, wordWrap:'pre', tabSize:2, minimap:1 };
let replHistory= [], replIdx = -1;
let ctxTarget  = null;
let searchMatches = [], searchIdx = 0;

const STORAGE_KEY = 'codepad.workspace.v1';
let persistTimer = null;

// ═══════════════════════════════════════════════════════
//  DOM REFS
// ═══════════════════════════════════════════════════════
const code       = document.getElementById('code');
const gutter     = document.getElementById('gutter');
const activeLine = document.getElementById('active-line');
const sbPos      = document.getElementById('sb-pos');
const sbLang     = document.getElementById('sb-lang');
const consoleOut = document.getElementById('console-output');
const tsOut      = document.getElementById('ts-output');
const aiMsgs     = document.getElementById('ai-msgs');
const previewFrm = document.getElementById('preview-frame');
const mdContent  = document.getElementById('md-content');
const breadcrumb = document.getElementById('breadcrumb');

// ═══════════════════════════════════════════════════════
//  THEME / SETTINGS
// ═══════════════════════════════════════════════════════
const HLJS_THEMES = {
  light:   'atom-one-light',
  dark:    'atom-one-dark',
  hc:      'base16/windows-high-contrast',
  onedark: 'atom-one-dark',
  dracula: 'base16/dracula',
};

function applySettings() {
  document.documentElement.setAttribute('data-theme', settings.theme);
  document.getElementById('hljs-theme').href =
    `https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/${HLJS_THEMES[settings.theme]}.min.css`;
  code.style.fontSize   = settings.fontSize + 'px';
  code.style.lineHeight = settings.lineHeight;
  code.style.whiteSpace = settings.wordWrap;
  code.style.tabSize    = settings.tabSize;
  gutter.style.fontSize = settings.fontSize + 'px';
  gutter.style.lineHeight = settings.lineHeight;
  document.getElementById('minimap').style.display = settings.minimap ? '' : 'none';
}


// ═══════════════════════════════════════════════════════
//  PERSISTÊNCIA LOCAL
// ═══════════════════════════════════════════════════════
function persistWorkspace() {
  try {
    FILES[activeFile] = code.value;
    const payload = {
      files: FILES,
      activeFile,
      openTabs,
      settings,
      savedAt: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch (err) {
    console.warn('Falha ao salvar workspace:', err);
  }
}

function schedulePersist() {
  clearTimeout(persistTimer);
  persistTimer = setTimeout(persistWorkspace, 250);
}

function restoreWorkspace() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return false;

    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object' || !parsed.files) return false;

    Object.keys(FILES).forEach(k => delete FILES[k]);
    Object.assign(FILES, parsed.files);

    if (parsed.settings && typeof parsed.settings === 'object') {
      settings = { ...settings, ...parsed.settings };
    }

    if (Array.isArray(parsed.openTabs) && parsed.openTabs.length) {
      openTabs = parsed.openTabs.filter(f => !!FILES[f]);
      if (!openTabs.length) openTabs = [Object.keys(FILES)[0]];
    }

    if (parsed.activeFile && FILES[parsed.activeFile]) {
      activeFile = parsed.activeFile;
    } else {
      activeFile = openTabs[0] || Object.keys(FILES)[0];
    }

    if (!openTabs.includes(activeFile)) openTabs.push(activeFile);
    return true;
  } catch (err) {
    console.warn('Falha ao restaurar workspace:', err);
    return false;
  }
}

// ═══════════════════════════════════════════════════════
//  LANGUAGE DETECTION
// ═══════════════════════════════════════════════════════
function langFromExt(name) {
  const ext = name.split('.').pop().toLowerCase();
  const map = {
    js:'JavaScript', ts:'TypeScript', html:'HTML', css:'CSS',
    json:'JSON', md:'Markdown', py:'Python', php:'PHP', txt:'Text'
  };
  return map[ext] || 'Text';
}
function hljsLang(name) {
  const ext = name.split('.').pop().toLowerCase();
  const map = {js:'javascript',ts:'typescript',html:'xml',css:'css',json:'json',md:'markdown',py:'python',php:'php'};
  return map[ext] || 'plaintext';
}
function fileIconClass(name) {
  const ext = name.split('.').pop().toLowerCase();
  const m = {js:'fi-js',ts:'fi-ts',html:'fi-html',css:'fi-css',json:'fi-json',md:'fi-md',py:'fi-py',php:'fi-php'};
  return m[ext] || 'fi-txt';
}
function fileIconLabel(name) {
  const ext = name.split('.').pop().toLowerCase();
  const m = {js:'JS',ts:'TS',html:'HT',css:'CS',json:'{}',md:'MD',py:'PY',php:'PH'};
  return m[ext] || '📄';
}

// ═══════════════════════════════════════════════════════
//  FILE TREE
// ═══════════════════════════════════════════════════════
function renderFileTree() {
  const tree = document.getElementById('file-tree');
  const filterEl = document.getElementById('file-filter');
  const query = (filterEl?.value || '').trim().toLowerCase();
  const allFiles = Object.keys(FILES);
  const visibleFiles = allFiles.filter(fname => fname.toLowerCase().includes(query));
  document.getElementById('file-count').textContent = `(${visibleFiles.length})`;
  tree.innerHTML = '';

  const folderEl = document.createElement('div');
  folderEl.className = 'tree-folder';
  folderEl.innerHTML = `<svg viewBox="0 0 20 20"><path d="M2 6a2 2 0 012-2h4l2 2h6a2 2 0 012 2v7a2 2 0 01-2 2H4a2 2 0 01-2-2V6z"/></svg> meu-projeto`;
  tree.appendChild(folderEl);

  visibleFiles.forEach(fname => {
    const ext = fname.includes('.') ? fname.split('.').pop().toUpperCase() : 'TXT';
    const el = document.createElement('div');
    el.className = 'tree-item' + (fname === activeFile ? ' active' : '');
    el.dataset.file = fname;
    el.innerHTML = `<span class="fi ${fileIconClass(fname)}">${fileIconLabel(fname)}</span><span class="tree-name">${fname}</span><span class="tree-ext">${ext}</span>`;
    el.addEventListener('click', () => openFile(fname));
    el.addEventListener('contextmenu', e => { e.preventDefault(); showCtxMenu(e, fname); });
    tree.appendChild(el);
  });
}

// ═══════════════════════════════════════════════════════
//  TABS
// ═══════════════════════════════════════════════════════
function renderTabs() {
  const bar = document.getElementById('tabs-bar');
  bar.innerHTML = '';
  openTabs.forEach(fname => {
    const t = document.createElement('div');
    t.className = 'etab' + (fname === activeFile ? ' active' : '');
    t.dataset.file = fname;
    t.innerHTML = `<span class="fi ${fileIconClass(fname)}" style="font-size:10px">${fileIconLabel(fname)}</span><span class="etab-name">${fname}</span><button class="etab-close" data-file="${fname}">✕</button>`;
    t.addEventListener('click', e => {
      if (e.target.classList.contains('etab-close')) { closeTab(e.target.dataset.file); return; }
      openFile(fname);
    });
    bar.appendChild(t);
  });
  const nb = document.createElement('button');
  nb.className = 'tab-new-btn'; nb.id = 'tab-add-btn'; nb.title = 'Novo arquivo'; nb.textContent = '+';
  nb.addEventListener('click', openNewFileModal);
  bar.appendChild(nb);
}

function closeTab(fname) {
  openTabs = openTabs.filter(f => f !== fname);
  if (activeFile === fname) {
    activeFile = openTabs[openTabs.length-1] || Object.keys(FILES)[0];
    if (!openTabs.includes(activeFile)) openTabs.push(activeFile);
  }
  loadFile(activeFile);
  schedulePersist();
}

// ═══════════════════════════════════════════════════════
//  LOAD / OPEN FILE
// ═══════════════════════════════════════════════════════
function openFile(fname) {
  if (!FILES[fname]) return;
  FILES[activeFile] = code.value;
  schedulePersist();
  if (!openTabs.includes(fname)) openTabs.push(fname);
  activeFile = fname;
  loadFile(fname);
}

function loadFile(fname) {
  if (!FILES[fname]) return;
  activeFile = fname;
  code.value = FILES[fname];
  applySettings();
  renderTabs();
  renderFileTree();
  updateGutter();
  updateStatus();
  updateBreadcrumb();
  sbLang.textContent = langFromExt(fname);

  // Auto-switch terminal pane for special types
  const ext = fname.split('.').pop().toLowerCase();
  if (ext === 'md') switchTermPane('md');

  renderMarkdownIfNeeded();
}

function updateBreadcrumb() {
  breadcrumb.innerHTML =
    `<span>meu-projeto</span><span class="bc-sep">›</span><span style="color:var(--text)">${activeFile}</span>`;
}

// ═══════════════════════════════════════════════════════
//  GUTTER & STATUS
// ═══════════════════════════════════════════════════════
function updateGutter() {
  const lines  = code.value.split('\n');
  const cur    = code.value.substr(0, code.selectionStart).split('\n').length;
  gutter.innerHTML = lines.map((_,i) =>
    `<span class="${i+1===cur?'current':''}">${i+1}</span>`
  ).join('');
  gutter.scrollTop = code.scrollTop;
  // Active line
  const lineH = parseFloat(settings.fontSize) * parseFloat(settings.lineHeight);
  activeLine.style.top  = ((cur-1)*lineH + 10) + 'px';
  activeLine.style.height = lineH + 'px';
}

function updateStatus() {
  const before = code.value.substr(0, code.selectionStart);
  const lines  = before.split('\n');
  sbPos.textContent = `Ln ${lines.length}, Col ${lines[lines.length-1].length+1}`;
  updateGutter();
}

// Sync gutter scroll with code scroll
code.addEventListener('scroll', () => { gutter.scrollTop = code.scrollTop; });

// ═══════════════════════════════════════════════════════
//  CONSOLE OUTPUT
// ═══════════════════════════════════════════════════════
function addConsole(text, type='') {
  const span = document.createElement('span');
  span.className = 'con-line ' + type;
  span.textContent = text;
  consoleOut.appendChild(span);
  consoleOut.parentElement.scrollTop = 99999;
}
function clearConsole() { consoleOut.innerHTML = ''; }

function str(v) {
  if (v === null) return 'null';
  if (v === undefined) return 'undefined';
  if (typeof v === 'object') { try { return JSON.stringify(v,null,2); } catch { return String(v); } }
  return String(v);
}

// ═══════════════════════════════════════════════════════
//  RUN CODE (JavaScript)
// ═══════════════════════════════════════════════════════
function runCode() {
  openTerminal();
  switchTermPane('console');
  clearConsole();

  const ext = activeFile.split('.').pop().toLowerCase();

  if (ext === 'ts') { compileAndRunTS(); return; }
  if (ext === 'html') { renderPreview(); switchTermPane('preview'); return; }
  if (ext === 'md') { renderMarkdownIfNeeded(); switchTermPane('md'); return; }
  if (ext !== 'js') {
    addConsole(`Execução de ${langFromExt(activeFile)} não suportada no browser.`, 'warn');
    addConsole('Apenas JavaScript e TypeScript podem ser executados aqui.', 'info');
    return;
  }

  const orig = ['log','error','warn','info'].reduce((o,k) => ({...o,[k]:console[k]}), {});
  console.log   = (...a) => { addConsole(a.map(str).join(' '));          orig.log(...a); };
  console.error = (...a) => { addConsole(a.map(str).join(' '),'err');    orig.error(...a); };
  console.warn  = (...a) => { addConsole(a.map(str).join(' '),'warn');   orig.warn(...a); };
  console.info  = (...a) => { addConsole(a.map(str).join(' '),'info');   orig.info(...a); };

  try {
    const fn = new Function(code.value);
    const r = fn();
    if (r instanceof Promise) r.catch(e => addConsole('Promise rejected: '+e.message,'err'));
  } catch(e) { addConsole('❌ '+e.message, 'err'); }
  finally { Object.assign(console, orig); }

  addConsole('─── fim ───', 'info');
}

// ═══════════════════════════════════════════════════════
//  TYPESCRIPT COMPILE & RUN
// ═══════════════════════════════════════════════════════
function compileAndRunTS() {
  switchTermPane('ts');
  tsOut.innerHTML = '';

  const src = code.value;
  const addTS = (text, cls='') => {
    const s = document.createElement('span');
    s.className='con-line '+(cls||'ts');
    s.textContent=text;
    tsOut.appendChild(s);
  };

  try {
    if (typeof ts === 'undefined') { addTS('TypeScript compiler não carregado.','err'); return; }

    addTS('▶ Compilando TypeScript...','info');

    const result = ts.transpileModule(src, {
      compilerOptions: {
        target: ts.ScriptTarget.ES2020,
        module: ts.ModuleKind.None,
        strict: true,
        removeComments: false,
      },
      reportDiagnostics: true,
    });

    if (result.diagnostics && result.diagnostics.length > 0) {
      result.diagnostics.forEach(d => {
        const msg = typeof d.messageText === 'string'
          ? d.messageText : d.messageText.messageText;
        const pos = d.file && d.start !== undefined
          ? ` (linha ${d.file.getLineAndCharacterOfPosition(d.start).line+1})`
          : '';
        addTS(`⚠ ${msg}${pos}`, 'warn');
      });
    }

    addTS('✓ Compilado → executando JS gerado...','ok');
    addTS('─────────────────────────────', 'info');

    // Capture console output in TS pane too
    const orig = ['log','error','warn','info'].reduce((o,k) => ({...o,[k]:console[k]}), {});
    console.log   = (...a) => { addTS(a.map(str).join(' '),'');        orig.log(...a); };
    console.error = (...a) => { addTS(a.map(str).join(' '),'err');     orig.error(...a); };
    console.warn  = (...a) => { addTS(a.map(str).join(' '),'warn');    orig.warn(...a); };
    console.info  = (...a) => { addTS(a.map(str).join(' '),'info');    orig.info(...a); };

    try {
      const fn = new Function(result.outputText);
      fn();
    } catch(e) { addTS('❌ Runtime: '+e.message,'err'); }
    finally { Object.assign(console,orig); }

    addTS('─── fim ───','info');

    // Also show compiled JS
    addTS('\n━━ JavaScript gerado ━━','ts');
    result.outputText.split('\n').forEach(l => { if(l.trim()) addTS(l,''); });

  } catch(e) { addTS('❌ Erro de compilação: '+e.message,'err'); }
}

document.getElementById('ts-compile-btn').addEventListener('click', () => {
  if (activeFile.endsWith('.ts')) { compileAndRunTS(); return; }
  // Compile whatever is in editor as TS
  compileAndRunTS();
});

// ═══════════════════════════════════════════════════════
//  HTML PREVIEW (with linked CSS + JS)
// ═══════════════════════════════════════════════════════
function renderPreview() {
  let html = FILES['index.html'] || code.value;

  // Inject CSS files referenced in <link rel="stylesheet" href="...">
  html = html.replace(/<link[^>]+rel=["']stylesheet["'][^>]*href=["']([^"']+)["'][^>]*\/?>/gi,
    (match, href) => {
      const fname = href.replace(/^\.?\//,'');
      if (FILES[fname]) return `<style>/* ${fname} */\n${FILES[fname]}\n</style>`;
      return match;
    });

  // Inject JS files referenced in <script src="...">
  html = html.replace(/<script[^>]+src=["']([^"']+)["'][^>]*><\/script>/gi,
    (match, src) => {
      const fname = src.replace(/^\.?\//,'');
      if (FILES[fname]) return `<script>/* ${fname} */\n${FILES[fname]}\n<\/script>`;
      return match;
    });

  previewFrm.srcdoc = html;
  document.getElementById('preview-url').value = 'preview://index.html';
}

document.getElementById('preview-refresh').addEventListener('click', renderPreview);
document.getElementById('preview-fullscreen').addEventListener('click', async () => {
  renderPreview();
  const pane = document.getElementById('preview-pane');
  try {
    if (!document.fullscreenElement) {
      await pane.requestFullscreen();
    } else {
      await document.exitFullscreen();
    }
  } catch (err) {
    addConsole('Não foi possível abrir preview em tela cheia: ' + err.message, 'warn');
  }
});

// ═══════════════════════════════════════════════════════
//  MARKDOWN PREVIEW
// ═══════════════════════════════════════════════════════
function renderMarkdownIfNeeded() {
  const ext = activeFile.split('.').pop().toLowerCase();
  if (ext !== 'md') return;
  if (typeof marked === 'undefined') return;
  mdContent.innerHTML = marked.parse(code.value);
}

// ═══════════════════════════════════════════════════════
//  TERMINAL PANES
// ═══════════════════════════════════════════════════════
function openTerminal() {
  document.getElementById('terminal-split').classList.add('open');
}
function closeTerminal() {
  document.getElementById('terminal-split').classList.remove('open');
}

function switchTermPane(id) {
  openTerminal();
  document.querySelectorAll('.ttab').forEach(t => t.classList.toggle('active', t.dataset.tp === id));
  document.querySelectorAll('.term-pane').forEach(p => {
    p.classList.toggle('active', p.id === id+'-pane');
  });
  if (id === 'preview') renderPreview();
  if (id === 'md') renderMarkdownIfNeeded();
}

document.querySelectorAll('.ttab').forEach(t => {
  t.addEventListener('click', () => switchTermPane(t.dataset.tp));
});
document.getElementById('close-terminal').addEventListener('click', closeTerminal);

// ═══════════════════════════════════════════════════════
//  EDITOR EVENTS
// ═══════════════════════════════════════════════════════
code.addEventListener('input', () => {
  FILES[activeFile] = code.value;
  schedulePersist();
  updateGutter();
  renderMarkdownIfNeeded();
});
code.addEventListener('keyup', updateStatus);
code.addEventListener('click', updateStatus);

code.addEventListener('keydown', e => {
  // Tab
  if (e.key === 'Tab') {
    e.preventDefault();
    const s = code.selectionStart, en = code.selectionEnd;
    const spaces = ' '.repeat(settings.tabSize);
    if (s !== en) {
      // Indent selection
      const before = code.value.substring(0,s);
      const sel    = code.value.substring(s,en);
      const after  = code.value.substring(en);
      const indented = sel.split('\n').map(l => spaces+l).join('\n');
      code.value = before + indented + after;
      code.selectionStart = s;
      code.selectionEnd   = s + indented.length;
    } else {
      code.value = code.value.substring(0,s) + spaces + code.value.substring(en);
      code.selectionStart = code.selectionEnd = s + spaces.length;
    }
    updateGutter();
  }
  // Auto-close brackets
  const pairs = {'(':')','{':'}','[':']','"':'"',"'":"'",'`':'`'};
  if (pairs[e.key] && !e.ctrlKey && !e.metaKey) {
    e.preventDefault();
    const s=code.selectionStart, en=code.selectionEnd;
    const sel=code.value.substring(s,en);
    code.value=code.value.substring(0,s)+e.key+sel+pairs[e.key]+code.value.substring(en);
    code.selectionStart=code.selectionEnd=s+1+sel.length;
    updateGutter();
  }
  // Auto-indent on Enter
  if (e.key === 'Enter' && !e.ctrlKey) {
    const s = code.selectionStart;
    const lineStart = code.value.lastIndexOf('\n',s-1)+1;
    const line = code.value.substring(lineStart, s);
    const indent = line.match(/^(\s*)/)[1];
    const extraIndent = line.trimEnd().endsWith('{') || line.trimEnd().endsWith('(') || line.trimEnd().endsWith('[')
      ? ' '.repeat(settings.tabSize) : '';
    e.preventDefault();
    const ins = '\n' + indent + extraIndent;
    code.value = code.value.substring(0,s) + ins + code.value.substring(code.selectionEnd);
    code.selectionStart = code.selectionEnd = s + ins.length;
    updateGutter();
  }
  // Keyboard shortcuts
  if ((e.ctrlKey||e.metaKey) && e.key === 's') { e.preventDefault(); saveFile(); }
  if ((e.ctrlKey||e.metaKey) && e.key === 'f') { e.preventDefault(); openSearch(); }
  if ((e.ctrlKey||e.metaKey) && e.key === '/') { e.preventDefault(); toggleComment(); }
  if ((e.ctrlKey||e.metaKey) && e.key === '`') { e.preventDefault(); document.getElementById('terminal-split').classList.toggle('open'); }
});

// ═══════════════════════════════════════════════════════
//  SAVE / COMMENT / FORMAT
// ═══════════════════════════════════════════════════════
function saveFile() {
  FILES[activeFile] = code.value;
  persistWorkspace();
  const sb = document.getElementById('sb-errors');
  const prev = sb.textContent;
  sb.textContent = '✓ Salvo';
  setTimeout(() => sb.textContent = prev, 1500);
}

function toggleComment() {
  const s=code.selectionStart, e=code.selectionEnd, v=code.value;
  const ext = activeFile.split('.').pop().toLowerCase();
  const style = ['html'].includes(ext) ? ['<!--','-->'] : ext==='css' ? ['/*','*/'] : ['//',''];
  const ls = v.lastIndexOf('\n',s-1)+1;
  const le = v.indexOf('\n',e);
  const line = v.substring(ls, le===-1?undefined:le);
  const [o,c] = style;
  const commented = c ? line.trimStart().startsWith(o) : line.trimStart().startsWith(o);
  let newLine;
  if (c) newLine = commented ? line.replace(o,'').replace(c,'') : o+line+c;
  else   newLine = commented ? line.replace(/\/\/\s?/,'') : '// '+line;
  code.value = v.substring(0,ls)+newLine+v.substring(le===-1?v.length:le);
  updateGutter();
}

// ═══════════════════════════════════════════════════════
//  SEARCH & REPLACE
// ═══════════════════════════════════════════════════════
function openSearch() {
  const sw = document.getElementById('search-widget');
  sw.classList.add('open');
  document.getElementById('search-in').focus();
}
document.getElementById('sw-close').addEventListener('click', () => {
  document.getElementById('search-widget').classList.remove('open');
  searchMatches = []; document.getElementById('search-count').textContent = '';
});

function doSearch() {
  const q = document.getElementById('search-in').value; if (!q) return;
  const v = code.value; const re = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'),'gi');
  searchMatches = []; let m;
  while ((m=re.exec(v)) !== null) searchMatches.push(m.index);
  document.getElementById('search-count').textContent = `${searchMatches.length} result.`;
  if (searchMatches.length) { searchIdx=0; code.setSelectionRange(searchMatches[0], searchMatches[0]+q.length); code.focus(); }
}
document.getElementById('search-in').addEventListener('input', doSearch);
document.getElementById('sw-next').addEventListener('click', () => {
  if (!searchMatches.length) return;
  searchIdx = (searchIdx+1)%searchMatches.length;
  const q=document.getElementById('search-in').value;
  code.setSelectionRange(searchMatches[searchIdx], searchMatches[searchIdx]+q.length); code.focus();
});
document.getElementById('sw-prev').addEventListener('click', () => {
  if (!searchMatches.length) return;
  searchIdx = (searchIdx-1+searchMatches.length)%searchMatches.length;
  const q=document.getElementById('search-in').value;
  code.setSelectionRange(searchMatches[searchIdx], searchMatches[searchIdx]+q.length); code.focus();
});
document.getElementById('sw-replace').addEventListener('click', () => {
  const q=document.getElementById('search-in').value, r=document.getElementById('replace-in').value;
  if(!q||!searchMatches.length) return;
  const idx=searchMatches[searchIdx];
  code.value=code.value.substring(0,idx)+r+code.value.substring(idx+q.length);
  FILES[activeFile]=code.value; doSearch(); updateGutter();
});
document.getElementById('sw-replace-all').addEventListener('click', () => {
  const q=document.getElementById('search-in').value, r=document.getElementById('replace-in').value;
  if(!q) return;
  const re=new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'),'gi');
  code.value=code.value.replace(re,r);
  FILES[activeFile]=code.value; doSearch(); updateGutter();
});

// ═══════════════════════════════════════════════════════
//  REPL
// ═══════════════════════════════════════════════════════
const replIn = document.getElementById('repl-in');
replIn.addEventListener('keydown', e => {
  if (e.key === 'Enter') {
    const cmd=replIn.value.trim(); if(!cmd) return;
    replHistory.unshift(cmd); replIdx=-1;
    addConsole('❯ '+cmd,'info');
    try { const r=eval(cmd); if(r!==undefined) addConsole(str(r)); }
    catch(err) { addConsole(err.message,'err'); }
    replIn.value='';
  }
  if(e.key==='ArrowUp'){replIdx=Math.min(replIdx+1,replHistory.length-1);replIn.value=replHistory[replIdx]||'';}
  if(e.key==='ArrowDown'){replIdx=Math.max(replIdx-1,-1);replIn.value=replIdx>=0?replHistory[replIdx]:'';}
});

// ═══════════════════════════════════════════════════════
//  AI ASSISTANT
// ═══════════════════════════════════════════════════════
function addAiMsg(text, role) {
  const d=document.createElement('div');
  d.className=`ai-bubble ${role}`;
  d.innerHTML=text.replace(/`([^`]+)`/g,'<code>$1</code>').replace(/\n/g,'<br>');
  aiMsgs.appendChild(d); aiMsgs.scrollTop=aiMsgs.scrollHeight;
}

addAiMsg('Olá! Sou seu assistente ✦\nDigite uma pergunta sobre seu código, erros, ou programação em geral.','bot');

document.getElementById('ai-send-btn').addEventListener('click', sendAi);
document.getElementById('ai-in').addEventListener('keydown', e => { if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();sendAi();} });

async function sendAi() {
  const q=document.getElementById('ai-in').value.trim(); if(!q) return;
  addAiMsg(q,'user'); document.getElementById('ai-in').value='';
  document.getElementById('ai-send-btn').disabled=true;
  const thinking=document.createElement('div');
  thinking.className='ai-bubble bot'; thinking.textContent='⏳...';
  aiMsgs.appendChild(thinking); aiMsgs.scrollTop=aiMsgs.scrollHeight;
  try {
    const src=code.value.slice(0,1800);
    const prompt=`Você é um assistente de programação conciso integrado a um IDE chamado CodePad.\nArquivo ativo: ${activeFile} (${langFromExt(activeFile)})\nCódigo:\n\`\`\`\n${src}\n\`\`\`\nPergunta: ${q}\nResponda em português, de forma clara e direta. Use \`backticks\` para código inline. Máx 200 palavras.`;
    const res=await fetch('https://api.anthropic.com/v1/messages',{
      method:'POST',headers:{'Content-Type':'application/json'},
      body:JSON.stringify({model:'claude-sonnet-4-20250514',max_tokens:1000,messages:[{role:'user',content:prompt}]})
    });
    const data=await res.json();
    const reply=data.content?.[0]?.text||'Sem resposta.';
    thinking.innerHTML=reply.replace(/`([^`]+)`/g,'<code>$1</code>').replace(/\n/g,'<br>');
  } catch(err) { thinking.textContent='Erro: '+err.message; }
  finally { document.getElementById('ai-send-btn').disabled=false; aiMsgs.scrollTop=aiMsgs.scrollHeight; }
}

// ═══════════════════════════════════════════════════════
//  CONTEXT MENU
// ═══════════════════════════════════════════════════════
function showCtxMenu(e, fname) {
  ctxTarget=fname;
  const m=document.getElementById('ctx-menu');
  m.style.left=e.clientX+'px'; m.style.top=e.clientY+'px';
  m.classList.add('open');
}
document.addEventListener('click', () => document.getElementById('ctx-menu').classList.remove('open'));
document.getElementById('ctx-delete').addEventListener('click', () => {
  if (!ctxTarget) return;
  if (!confirm(`Deletar "${ctxTarget}"?`)) return;
  delete FILES[ctxTarget];
  openTabs=openTabs.filter(f=>f!==ctxTarget);
  if (activeFile===ctxTarget) {
    activeFile=Object.keys(FILES)[0]||'';
    if(activeFile && !openTabs.includes(activeFile)) openTabs.push(activeFile);
  }
  if (activeFile) loadFile(activeFile); else { code.value=''; renderFileTree(); renderTabs(); }
  schedulePersist();
});
document.getElementById('ctx-rename').addEventListener('click', () => {
  if (!ctxTarget) return;
  const newName=prompt('Novo nome:',ctxTarget); if (!newName||newName===ctxTarget) return;
  FILES[newName]=FILES[ctxTarget]; delete FILES[ctxTarget];
  openTabs=openTabs.map(f=>f===ctxTarget?newName:f);
  if (activeFile===ctxTarget) activeFile=newName;
  loadFile(activeFile);
  schedulePersist();
});
document.getElementById('ctx-copy-path').addEventListener('click', () => {
  if(ctxTarget) navigator.clipboard.writeText('/meu-projeto/'+ctxTarget);
});

// ═══════════════════════════════════════════════════════
//  NEW FILE MODAL
// ═══════════════════════════════════════════════════════
function openNewFileModal() {
  document.getElementById('nf-overlay').classList.add('open');
  document.getElementById('nf-input').value='';
  document.getElementById('nf-input').focus();
}
document.getElementById('btn-new-file').addEventListener('click', openNewFileModal);
document.getElementById('btn-new-folder').addEventListener('click', openNewFileModal);
document.getElementById('tab-add-btn')?.addEventListener('click', openNewFileModal);
document.getElementById('nf-cancel').addEventListener('click', ()=>document.getElementById('nf-overlay').classList.remove('open'));
document.getElementById('nf-ok').addEventListener('click', createNewFile);
document.getElementById('nf-input').addEventListener('keydown', e=>{ if(e.key==='Enter') createNewFile(); });

const FILE_TEMPLATES = {
  js: '// Novo arquivo JavaScript\n',
  ts: '// Novo arquivo TypeScript\n\nconst msg: string = "Hello, TypeScript!";\nconsole.log(msg);\n',
  html: '<!DOCTYPE html>\n<html lang="pt-BR">\n<head>\n  <meta charset="UTF-8" />\n  <title>Página</title>\n  <link rel="stylesheet" href="style.css" />\n</head>\n<body>\n  <h1>Olá!</h1>\n  <script src="script.js"><\/script>\n</body>\n</html>',
  css: '/* Estilos */\n\nbody {\n  font-family: system-ui, sans-serif;\n  margin: 0;\n}\n',
  json: '{\n  "nome": "valor"\n}\n',
  md: '# Título\n\nDescrição aqui.\n',
  py: '# Python\n\ndef main():\n    print("Hello, Python!")\n\nmain()\n',
  php: '<?php\n// PHP\n\necho "Hello, PHP!";\n',
};

function createNewFile() {
  const name=document.getElementById('nf-input').value.trim(); if(!name) return;
  if (FILES[name]) { alert('Já existe um arquivo com esse nome.'); return; }
  if (/[/\\]/.test(name)) { alert('Use apenas nome de arquivo, sem pastas.'); return; }
  const ext=name.split('.').pop().toLowerCase();
  FILES[name]=FILE_TEMPLATES[ext]||`// ${name}\n`;
  schedulePersist();
  document.getElementById('nf-overlay').classList.remove('open');
  openTabs.push(name);
  openFile(name);
  schedulePersist();
}

// ═══════════════════════════════════════════════════════
//  SETTINGS
// ═══════════════════════════════════════════════════════
function openSettings() {
  document.getElementById('settings-overlay').classList.add('open');
  document.getElementById('theme-select').value    = settings.theme;
  document.getElementById('font-size-range').value = settings.fontSize;
  document.getElementById('line-height-select').value = settings.lineHeight;
  document.getElementById('word-wrap-select').value= settings.wordWrap;
  document.getElementById('tab-size-select').value = settings.tabSize;
  document.getElementById('minimap-select').value  = settings.minimap;
}
['btn-open-settings','ab-settings'].forEach(id => {
  document.getElementById(id)?.addEventListener('click', openSettings);
});
document.getElementById('sp-close').addEventListener('click',()=>document.getElementById('settings-overlay').classList.remove('open'));
document.getElementById('settings-overlay').addEventListener('click', e => {
  if(e.target===document.getElementById('settings-overlay')) document.getElementById('settings-overlay').classList.remove('open');
});

document.getElementById('theme-select').addEventListener('change', e=>{ settings.theme=e.target.value; applySettings(); schedulePersist(); });
document.getElementById('font-size-range').addEventListener('input', e=>{ settings.fontSize=+e.target.value; applySettings(); updateGutter(); schedulePersist(); });
document.getElementById('line-height-select').addEventListener('change', e=>{ settings.lineHeight=+e.target.value; applySettings(); updateGutter(); schedulePersist(); });
document.getElementById('word-wrap-select').addEventListener('change', e=>{ settings.wordWrap=e.target.value; applySettings(); schedulePersist(); });
document.getElementById('tab-size-select').addEventListener('change', e=>{ settings.tabSize=+e.target.value; applySettings(); schedulePersist(); });
document.getElementById('minimap-select').addEventListener('change', e=>{ settings.minimap=+e.target.value; applySettings(); schedulePersist(); });

// ═══════════════════════════════════════════════════════
//  ACTIVITY BAR
// ═══════════════════════════════════════════════════════
document.getElementById('ab-files').addEventListener('click', ()=>{
  const sb=document.getElementById('sidebar');
  sb.classList.toggle('collapsed');
  document.getElementById('ab-files').classList.toggle('active');
});
document.getElementById('ab-run').addEventListener('click', runCode);
document.getElementById('ab-search-btn').addEventListener('click', ()=>{ openSearch(); });
document.getElementById('file-filter').addEventListener('input', renderFileTree);

// ═══════════════════════════════════════════════════════
//  TITLEBAR BUTTONS
// ═══════════════════════════════════════════════════════
document.getElementById('btn-toggle-terminal').addEventListener('click',()=>{
  document.getElementById('terminal-split').classList.toggle('open');
});
document.getElementById('btn-toggle-search').addEventListener('click', openSearch);

// ═══════════════════════════════════════════════════════
//  MOBILE FABs
// ═══════════════════════════════════════════════════════
document.getElementById('mob-run').addEventListener('click', runCode);
document.getElementById('mob-files').addEventListener('click',()=>{
  document.getElementById('sidebar').classList.toggle('collapsed');
});
document.getElementById('mob-term').addEventListener('click',()=>{
  openTerminal(); switchTermPane('console');
});

// ═══════════════════════════════════════════════════════
//  SERVICE WORKER
// ═══════════════════════════════════════════════════════
if ('serviceWorker' in navigator) {
  window.addEventListener('load', ()=>{
    navigator.serviceWorker.register('/sw.js')
      .then(()=>document.getElementById('sb-pwa').textContent='✓ PWA')
      .catch(()=>{});
  });
}

// ═══════════════════════════════════════════════════════
//  INIT
// ═══════════════════════════════════════════════════════
const restoredWorkspace = restoreWorkspace();
applySettings();
loadFile(restoredWorkspace ? activeFile : 'main.ts');
openTerminal();
switchTermPane('console');
addConsole('CodePad IDE v2.0 — pronto ✓','ok');
addConsole('Atalhos: Ctrl+S salvar · Ctrl+F buscar · Ctrl+/ comentar · Ctrl+` terminal','info');
if (restoredWorkspace) addConsole('Workspace restaurado automaticamente.','ok');
window.addEventListener('beforeunload', persistWorkspace);
