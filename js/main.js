'use strict';
(fn => {
  if (document.attachEvent ? document.readyState === 'complete' : document.readyState !== 'loading'){
    fn();
  } else {
    document.addEventListener('DOMContentLoaded', fn);
  }
})(() => {
  // set up ace
  const editor = ace.edit('code');
  editor.setOptions({
    autoScrollEditorIntoView: true,
    copyWithEmptySelection: true,
    useSoftTabs: true,
    tabSize: 2,
    fontSize: '13pt',
    fontFamily: 'Source Code Pro',
    wrap: true,
    theme: require('ace/theme/tomorrow_night'),
    mode: 'ace/mode/python',
  });
  editor.getSession().on('change', () => {
    // TODO save?
  });

  // set up output
  const loader = document.getElementById('loader-container');
  const consoleOut = document.getElementById('console-text');
  const canvas = document.getElementById('canvas');
  canvas.width = 480;
  canvas.height = 270;
  const g2d = canvas.getContext('2d');
  let compilerReady = true;
  function stdout(s) {
    consoleOut.innerText += s;
    setTimeout(() => consoleOut.scrollTo(0, consoleOut.scrollHeight), 1);
  }
  function stderr(s) {
    const errMsg = document.createElement('span');
    errMsg.classList.add('err');
    errMsg.innerText = s;
    consoleOut.appendChild(errMsg);
    setTimeout(() => consoleOut.scrollTo(0, consoleOut.scrollHeight), 1);
  }
  let queue = [];
  function qa(cb) {
    queue.push(cb);
  }
  async function animationFrame() {
    for (const task of queue) await task();
    queue = [];
    requestAnimationFrame(animationFrame);
  }

  // set up compilation worker
  let compilationWorker = null;
  let compilationTimeout = null;
  const runButton = document.getElementById('b-run');
  function resetCompilerState() {
    clearTimeout(compilationTimeout);
    compilerReady = true;
    runButton.classList.remove('disabled');
    loader.classList.remove('active');
  }
  const subImageMap = new Map();
  function initCompilationWorker() {
    if (compilationWorker) compilationWorker.terminate();
    compilationWorker = new Worker('js/compiler.js');
    compilationWorker.onmessage = e => {
      const m = e.data;
      switch (m.type) {
        case 'stdout':
          stdout(m.data);
          break;
        case 'stderr':
          stderr(m.data);
          break;
        case 'done':
          resetCompilerState();
          break;
        case 'gl_col':
          qa(() => {
            g2d.fillStyle = `rgb(${m.r}, ${m.g}, ${m.b})`;
            g2d.strokeStyle = `rgb(${m.r}, ${m.g}, ${m.b})`;
          });
          break;
        case 'gl_rect':
          qa(() => g2d.fillRect(m.x, m.y, m.w, m.h));
          break;
        case 'gl_pix':
          qa(() => g2d.fillRect(m.x, m.y, 1, 1));
          break;
        case 'gl_text':
          qa(() => {
            g2d.font = `${m.f}pt Source Code Pro`;
            g2d.fillText(m.t, m.x, m.y);
          });
          break;
        case 'gl_clear':
          qa(() => g2d.clearRect(m.x, m.y, m.w, m.h));
          break;
        case 'gl_wipe':
          qa(() => g2d.clearRect(0, 0, canvas.width, canvas.height));
          break;
        case 'gl_sub_new':
          qa(async () => subImageMap.set(m.a, await createImageBitmap(canvas, m.x, m.y, m.w, m.h)));
          break;
        case 'gl_sub_pas':
          qa(() => g2d.drawImage(subImageMap.get(m.a), m.x, m.y));
          break;
        case 'gl_sub_cmp':
          qa(() => g2d.drawImage(subImageMap.get(m.a), m.x, m.y, m.w, m.h));
          break;
        case 'gl_line':
          qa(() => {
            g2d.lineWidth = m.t;
            g2d.beginPath();
            g2d.moveTo(m.x, m.y);
            g2d.lineTo(m.a, m.b);
            g2d.stroke();
          });
          break;
        case 'gl_circ':
          qa(() => {
            g2d.beginPath();
            g2d.ellipse(m.x, m.y, m.r, m.r, 0, 0, Math.PI * 2);
            g2d.fill();
          });
          break;
        case 'gl_raw':
          qa(() => new Function(m.s).call(g2d));
          break;
        default:
          throw new Error(`Unknown compiler msg: ${m}`);
      }
    };
  }
  initCompilationWorker();

  // set up controls
  async function clearAndRun() {
    runButton.classList.add('disabled');
    compilerReady = false;
    consoleOut.innerHTML = '';
    subImageMap.clear();
    qa(() => g2d.clearRect(0, 0, canvas.width, canvas.height));
    loader.classList.add('active');
    const code = editor.getValue();
    if (code.trim().length) {
      compilationWorker.postMessage(code);
      compilationTimeout = setTimeout(() => {
        stderr('Took too long! Killed the program.');
        initCompilationWorker();
        resetCompilerState();
      }, 10000);
    } else {
      resetCompilerState();
    }
  }
  runButton.onclick = clearAndRun;
  editor.commands.addCommand({
    name: 'run',
    bindKey: {
      win: 'Ctrl-Enter',
      mac: 'Command-Enter'
    },
    exec: clearAndRun
  });

  // begin render loop
  animationFrame();
});