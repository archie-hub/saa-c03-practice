(() => {
  'use strict';

  const BANK = window.QUESTION_BANK;
  const QUESTIONS = new Map(BANK.questions.map((q) => [q.id, q]));
  const DOMAINS = BANK.domains;
  const TASKS = new Map(DOMAINS.flatMap((d) => d.tasks.map((t) => [t.id, t])));
  const EXAM_SIZE = 65;
  const SECONDS_PER_QUESTION = 120; // 130 minutes for 65 questions, same as the real exam
  const PASS_PCT = 72;
  const STORE_KEY = 'saa-c03-practice-v1';
  const THEME_KEY = 'saa-c03-theme';
  const MODES = {
    fresh: { label: 'Balanced', help: 'Questions you have seen least go first, so each new exam rotates through the bank.' },
    weak: { label: 'Weak spots', help: 'Questions you got wrong last time come first, then unseen ones, then your lowest-accuracy ones.' },
    random: { label: 'Random', help: 'A fully random draw each time.' },
    retake: { label: 'Retake missed', help: '' },
  };

  const app = document.getElementById('app');
  let storageOK = true;
  let state = load();
  let timer = null;
  let reviewFilter = 'all';

  // ---------- storage ----------
  function load() {
    try {
      const raw = localStorage.getItem(STORE_KEY);
      const s = raw ? JSON.parse(raw) : null;
      if (s && Array.isArray(s.runs)) return { runs: s.runs, active: s.active || null };
    } catch (e) {
      storageOK = false;
    }
    return { runs: [], active: null };
  }
  function save() {
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify(state));
      storageOK = true;
    } catch (e) {
      storageOK = false;
    }
  }

  // ---------- helpers ----------
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const fmt = (s) => esc(s).replace(/`([^`]+)`/g, '<code>$1</code>');
  const LETTERS = 'ABCDEF';
  const WORDS = { 2: 'TWO', 3: 'THREE' };
  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }
  const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  const pct = (c, t) => (t ? Math.round((c / t) * 100) : 0);
  function fmtDuration(sec) {
    sec = Math.max(0, Math.round(sec));
    const h = Math.floor(sec / 3600), m = Math.floor((sec % 3600) / 60), s = sec % 60;
    return h ? `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}` : `${m}:${String(s).padStart(2, '0')}`;
  }
  function fmtDate(ts) {
    return new Date(ts).toLocaleString(undefined, { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' });
  }
  const domainName = (id) => (DOMAINS.find((d) => d.id === id) || { name: `Domain ${id}` }).name;
  const sameSet = (a, b) => a.length === b.length && a.every((x) => b.includes(x));
  const runQids = (run) => run.qids.filter((id) => QUESTIONS.has(id));
  const completedRuns = () => state.runs.filter((r) => r.result).sort((a, b) => a.finishedAt - b.finishedAt);

  // ---------- statistics ----------
  function questionStats() {
    const stats = {};
    for (const run of completedRuns()) {
      for (const id of runQids(run)) {
        const s = (stats[id] ||= { seen: 0, correct: 0, last: null });
        const ok = isCorrect(run, id);
        s.seen++;
        if (ok) s.correct++;
        s.last = ok;
      }
    }
    return stats;
  }
  function isCorrect(run, id) {
    const q = QUESTIONS.get(id);
    return !!q && sameSet(run.answers[id] || [], q.answer);
  }
  function grade(run) {
    const byDomain = {}, byTask = {};
    let correct = 0, answered = 0;
    const ids = runQids(run);
    for (const id of ids) {
      const q = QUESTIONS.get(id);
      const ok = isCorrect(run, id);
      if ((run.answers[id] || []).length) answered++;
      if (ok) correct++;
      const d = (byDomain[q.domain] ||= { correct: 0, total: 0 });
      const t = (byTask[q.task] ||= { correct: 0, total: 0 });
      d.total++; t.total++;
      if (ok) { d.correct++; t.correct++; }
    }
    return { correct, answered, total: ids.length, pct: pct(correct, ids.length), byDomain, byTask };
  }
  function aggregate(key) {
    const out = {};
    for (const run of completedRuns()) {
      for (const [k, v] of Object.entries(run.result[key] || {})) {
        const o = (out[k] ||= { correct: 0, total: 0 });
        o.correct += v.correct;
        o.total += v.total;
      }
    }
    return out;
  }

  // ---------- exam generation ----------
  function quotas(size, domain) {
    if (domain) return { [domain]: size };
    const totalWeight = DOMAINS.reduce((s, d) => s + d.weight, 0);
    const raw = DOMAINS.map((d) => ({ id: d.id, exact: (size * d.weight) / totalWeight }));
    raw.forEach((r) => (r.n = Math.floor(r.exact)));
    let left = size - raw.reduce((s, r) => s + r.n, 0);
    raw.slice().sort((a, b) => (b.exact - b.n) - (a.exact - a.n)).forEach((r) => { if (left > 0) { r.n++; left--; } });
    return Object.fromEntries(raw.map((r) => [r.id, r.n]));
  }
  function priority(mode, s) {
    const r = Math.random();
    if (mode === 'random') return [r];
    if (mode === 'weak') {
      const bucket = !s ? 1 : s.last === false ? 0 : s.correct < s.seen ? 2 : 3;
      return [bucket, s ? s.correct / s.seen : 0, r];
    }
    return [s ? s.seen : 0, r];
  }
  function cmp(a, b) {
    for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return a[i] - b[i];
    return 0;
  }
  function pickQuestions(mode, size, domain) {
    const stats = questionStats();
    const want = quotas(size, domain);
    const chosen = [];
    const leftovers = [];
    for (const d of DOMAINS) {
      if (domain && d.id !== domain) continue;
      const ranked = BANK.questions
        .filter((q) => q.domain === d.id)
        .map((q) => ({ id: q.id, p: priority(mode, stats[q.id]) }))
        .sort((a, b) => cmp(a.p, b.p));
      const n = want[d.id] || 0;
      chosen.push(...ranked.slice(0, n).map((x) => x.id));
      leftovers.push(...ranked.slice(n));
    }
    // If a domain ran short, top up from the best remaining questions elsewhere.
    leftovers.sort((a, b) => cmp(a.p, b.p));
    while (chosen.length < size && leftovers.length) chosen.push(leftovers.shift().id);
    return shuffle(chosen);
  }
  function createRun({ mode, qids, study, timed, domain }) {
    const order = {};
    for (const id of qids) order[id] = shuffle(QUESTIONS.get(id).options.map((o) => o.key));
    return {
      id: uid(),
      createdAt: Date.now(),
      finishedAt: null,
      mode,
      domain: domain || null,
      study: !!study,
      timed: !!timed,
      limitSec: qids.length * SECONDS_PER_QUESTION,
      elapsedSec: 0,
      qids,
      order,
      answers: {},
      flagged: [],
      checked: {},
      current: 0,
      result: null,
    };
  }
  function startRun(run) {
    state.active = run;
    save();
    location.hash = '#/exam';
  }
  function finishRun() {
    const run = state.active;
    if (!run) return;
    stopTimer();
    run.finishedAt = Date.now();
    run.result = grade(run);
    state.runs.push(run);
    state.active = null;
    save();
    reviewFilter = 'all';
    location.hash = `#/results/${run.id}`;
  }

  // ---------- timer ----------
  function startTimer() {
    stopTimer();
    let ticks = 0;
    timer = setInterval(() => {
      const run = state.active;
      if (!run) return stopTimer();
      run.elapsedSec++;
      if (++ticks % 5 === 0) save();
      const el = document.getElementById('timer');
      if (el) {
        const remaining = run.limitSec - run.elapsedSec;
        el.textContent = run.timed ? `${fmtDuration(remaining)} left` : fmtDuration(run.elapsedSec);
        el.classList.toggle('low', run.timed && remaining <= 300);
      }
      if (run.timed && run.elapsedSec >= run.limitSec) {
        alert('Time is up. Your exam will be submitted now.');
        finishRun();
      }
    }, 1000);
  }
  function stopTimer() {
    if (timer) clearInterval(timer);
    timer = null;
  }

  // ---------- views ----------
  function viewDashboard() {
    const runs = completedRuns();
    const stats = questionStats();
    const seen = Object.keys(stats).filter((id) => QUESTIONS.has(id)).length;
    const lastRight = Object.entries(stats).filter(([id, s]) => QUESTIONS.has(id) && s.last).length;
    const scores = runs.map((r) => r.result.pct);
    const last5 = scores.slice(-5);
    const total = BANK.questions.length;
    const active = state.active;

    return `
      ${storageOK ? '' : `<div class="card" role="alert"><strong>Browser storage is unavailable.</strong> <span class="muted">This browser is blocking local storage (private mode or blocked site data), so exams won't be saved after you leave the page.</span></div>`}
      <h1>AWS Solutions Architect – Associate practice</h1>
      <p class="muted">${total} questions across ${DOMAINS.length} domains. Full exams are ${EXAM_SIZE} questions, weighted by domain like the real SAA-C03.</p>

      ${active ? `
        <div class="card">
          <div class="row between">
            <div>
              <h2>Exam in progress</h2>
              <p class="muted small">${MODES[active.mode].label} · ${runQids(active).length} questions · ${Object.values(active.answers).filter((a) => a.length).length} answered · ${fmtDuration(active.elapsedSec)} elapsed</p>
            </div>
            <div class="row">
              <button class="primary" data-action="resume">Resume exam</button>
              <button class="danger" data-action="discard">Discard</button>
            </div>
          </div>
        </div>` : ''}

      <div class="card">
        <h2>Start a new exam</h2>
        <form id="new-exam">
          <div class="form-grid">
            <label class="field">Question selection
              <select name="mode">
                <option value="fresh">${MODES.fresh.label}: least-seen first</option>
                <option value="weak">${MODES.weak.label}: missed first</option>
                <option value="random">${MODES.random.label}</option>
              </select>
            </label>
            <label class="field">Domains
              <select name="domain">
                <option value="">All domains (exam weighting)</option>
                ${DOMAINS.map((d) => `<option value="${d.id}">Domain ${d.id}: ${esc(d.name)}</option>`).join('')}
              </select>
            </label>
            <label class="field">Number of questions
              <input type="number" name="size" min="5" max="${total}" value="${EXAM_SIZE}">
            </label>
            <label class="field">Feedback
              <select name="study">
                <option value="0">Exam mode: score at the end</option>
                <option value="1">Study mode: check each answer</option>
              </select>
            </label>
          </div>
          <div class="row between">
            <label class="check"><input type="checkbox" name="timed" checked> Timed (2 minutes per question; 130 minutes for 65)</label>
            <button class="primary" type="submit">Start exam</button>
          </div>
          <p class="muted small" id="mode-help" style="margin:10px 0 0">${MODES.fresh.help}</p>
        </form>
      </div>

      <div class="tiles">
        ${tile('Exams completed', runs.length, runs.length ? `last ${fmtDate(runs[runs.length - 1].finishedAt)}` : 'none yet')}
        ${tile('Latest score', scores.length ? `${scores[scores.length - 1]}%` : '–', scores.length ? (scores[scores.length - 1] >= PASS_PCT ? 'at or above 72% target' : 'below 72% target') : '')}
        ${tile('Best score', scores.length ? `${Math.max(...scores)}%` : '–', '')}
        ${tile('Average, last 5', last5.length ? `${Math.round(last5.reduce((a, b) => a + b, 0) / last5.length)}%` : '–', last5.length ? `${last5.length} exam${last5.length > 1 ? 's' : ''}` : '')}
        ${tile('Questions seen', `${seen}/${total}`, `${pct(seen, total)}% of the bank`)}
        ${tile('Right on last try', `${lastRight}/${total}`, `${pct(lastRight, total)}% of the bank`)}
      </div>

      <div class="card">
        <div class="row between"><h2>Score trend</h2><span class="muted small">Dashed line: ${PASS_PCT}% target</span></div>
        ${runs.length ? `<div class="chart" id="trend">${trendSvg(runs)}</div>` : `<div class="empty">Finish an exam to see your score trend.</div>`}
      </div>

      <div class="grid-2">
        <div class="card">
          <h2>Accuracy by domain</h2>
          <p class="muted small">All completed exams. The marker shows the ${PASS_PCT}% target.</p>
          ${domainMeters(aggregate('byDomain'))}
        </div>
        <div class="card">
          <h2>Accuracy by task</h2>
          ${taskTable(aggregate('byTask'))}
        </div>
      </div>

      <div class="card">
        <div class="row between"><h2>Recent exams</h2>${runs.length > 5 ? '<a href="#/history">View all</a>' : ''}</div>
        ${historyTable(runs.slice(-5).reverse(), false)}
      </div>`;
  }
  function tile(label, value, sub) {
    return `<div class="tile"><div class="label">${label}</div><div class="value">${value}</div><div class="sub">${sub || '&nbsp;'}</div></div>`;
  }
  function domainMeters(agg) {
    return DOMAINS.map((d) => {
      const a = agg[d.id] || { correct: 0, total: 0 };
      const p = pct(a.correct, a.total);
      return `
        <div class="meter-row" title="${a.correct} of ${a.total} correct">
          <div class="name">D${d.id}: ${esc(d.name)}<span class="muted">${a.total ? `${a.correct}/${a.total} correct` : 'no attempts yet'} · ${d.weight}% of exam</span></div>
          <div class="meter" role="img" aria-label="${p}% correct"><div class="fill" style="width:${a.total ? p : 0}%"></div><div class="target" style="left:${PASS_PCT}%"></div></div>
          <div class="pct">${a.total ? `${p}%` : '–'}</div>
        </div>`;
    }).join('');
  }
  function taskTable(agg) {
    const rows = [...TASKS.values()].map((t) => ({ t, a: agg[t.id] || { correct: 0, total: 0 } }));
    return `<div class="table-wrap"><table>
      <thead><tr><th>Task</th><th class="num">Correct</th><th class="num">Accuracy</th></tr></thead>
      <tbody>${rows.map(({ t, a }) => {
        const p = pct(a.correct, a.total);
        const badge = !a.total ? '<span class="badge">–</span>' : `<span class="badge ${p >= PASS_PCT ? 'pass' : 'fail'}">${p >= PASS_PCT ? '✓' : '!'} ${p}%</span>`;
        return `<tr><td><strong>${t.id}</strong> <span class="muted small">${esc(t.name)}</span></td><td class="num">${a.correct}/${a.total}</td><td class="num">${badge}</td></tr>`;
      }).join('')}</tbody></table></div>`;
  }
  function historyTable(runs, withActions) {
    if (!runs.length) return '<div class="empty">No exams completed yet.</div>';
    const indexOf = new Map(completedRuns().map((r, i) => [r.id, i + 1]));
    return `<div class="table-wrap"><table>
      <thead><tr><th>#</th><th>Finished</th><th>Type</th><th class="num">Score</th><th>Result</th><th class="num">Time</th><th></th></tr></thead>
      <tbody>${runs.map((r) => {
        const pass = r.result.pct >= PASS_PCT;
        const type = [MODES[r.mode] ? MODES[r.mode].label : r.mode, r.domain ? `D${r.domain}` : null, r.study ? 'study' : null].filter(Boolean).join(' · ');
        return `<tr>
          <td class="num">${indexOf.get(r.id)}</td>
          <td>${fmtDate(r.finishedAt)}</td>
          <td>${esc(type)}</td>
          <td class="num"><strong>${r.result.pct}%</strong> <span class="muted small">${r.result.correct}/${r.result.total}</span></td>
          <td><span class="badge ${pass ? 'pass' : 'fail'}">${pass ? '✓ Pass' : '✗ Below target'}</span></td>
          <td class="num">${fmtDuration(r.elapsedSec)}</td>
          <td><div class="row" style="justify-content:flex-end"><a class="btn ghost" href="#/results/${r.id}">Review</a>${withActions ? `<button class="ghost danger" data-action="delete-run" data-id="${r.id}">Delete</button>` : ''}</div></td>
        </tr>`;
      }).join('')}</tbody></table></div>`;
  }

  function trendSvg(runs) {
    // Size the viewBox to the real width so tick labels keep their pixel size on phones.
    const W = Math.max(300, Math.min(920, app.clientWidth - 42)), H = W < 500 ? 200 : 220, L = 40, R = 16, T = 12, B = 28;
    const iw = W - L - R, ih = H - T - B;
    const n = runs.length;
    const x = (i) => L + (n === 1 ? iw / 2 : (i * iw) / (n - 1));
    const y = (p) => T + ih - (p / 100) * ih;
    const ticks = [0, 25, 50, 75, 100];
    const pts = runs.map((r, i) => [x(i), y(r.result.pct)]);
    const labelEvery = Math.ceil(n / Math.max(2, Math.floor(iw / 44)));
    const band = n === 1 ? iw : iw / (n - 1);
    return `
      <svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Score by exam, ${n} exams">
        ${ticks.map((t) => `<line class="gridline" x1="${L}" x2="${W - R}" y1="${y(t)}" y2="${y(t)}"/><text class="tick" x="${L - 8}" y="${y(t) + 4}" text-anchor="end">${t}%</text>`).join('')}
        <line class="passline" x1="${L}" x2="${W - R}" y1="${y(PASS_PCT)}" y2="${y(PASS_PCT)}"/>
        ${runs.map((r, i) => (i % labelEvery === 0 || i === n - 1) ? `<text class="tick" x="${x(i)}" y="${H - 8}" text-anchor="middle">#${i + 1}</text>` : '').join('')}
        <line class="crosshair" id="trend-cross" x1="0" x2="0" y1="${T}" y2="${T + ih}" visibility="hidden"/>
        ${n > 1 ? `<polyline class="series" points="${pts.map((p) => p.join(',')).join(' ')}"/>` : ''}
        ${pts.map((p) => `<circle class="dot" cx="${p[0]}" cy="${p[1]}" r="5"/>`).join('')}
        ${runs.map((r, i) => `<rect class="hit" data-i="${i}" x="${x(i) - band / 2}" y="${T}" width="${band}" height="${ih}"/>`).join('')}
      </svg>
      <div class="tooltip" id="trend-tip" hidden></div>`;
  }
  function bindTrend() {
    const box = document.getElementById('trend');
    if (!box) return;
    const runs = completedRuns();
    const tip = document.getElementById('trend-tip');
    const cross = document.getElementById('trend-cross');
    const svg = box.querySelector('svg');
    const show = (i) => {
      const dot = svg.querySelectorAll('.dot')[i];
      const r = runs[i];
      const width = svg.getBoundingClientRect().width;
      const scale = width / svg.viewBox.baseVal.width;
      const px = dot.cx.baseVal.value * scale;
      tip.classList.toggle('edge-right', px > width - 140);
      tip.classList.toggle('edge-left', px < 140);
      tip.innerHTML = `<strong>Exam #${i + 1} · ${r.result.pct}%</strong><br><span class="muted">${r.result.correct}/${r.result.total} correct · ${fmtDate(r.finishedAt)}</span>`;
      tip.style.left = `${px}px`;
      tip.style.top = `${dot.cy.baseVal.value * scale}px`;
      tip.hidden = false;
      cross.setAttribute('x1', dot.cx.baseVal.value);
      cross.setAttribute('x2', dot.cx.baseVal.value);
      cross.setAttribute('visibility', 'visible');
    };
    const hide = () => { tip.hidden = true; cross.setAttribute('visibility', 'hidden'); };
    svg.querySelectorAll('.hit').forEach((h) => {
      h.addEventListener('mouseenter', () => show(+h.dataset.i));
      h.addEventListener('click', () => { location.hash = `#/results/${runs[+h.dataset.i].id}`; });
    });
    svg.addEventListener('mouseleave', hide);
  }

  function viewHistory() {
    const runs = completedRuns().reverse();
    return `
      <h1>Exam history</h1>
      <div class="card">
        ${historyTable(runs, true)}
      </div>
      <div class="card">
        <h2>Back up or move your progress</h2>
        <p class="muted">Your history lives in this browser's local storage. Export it to a file to keep a backup or to load it on another device.</p>
        <div class="row">
          <button data-action="export">Export history</button>
          <button data-action="import">Import history</button>
          <input type="file" id="import-file" accept="application/json,.json" hidden>
          <button class="danger" data-action="reset">Delete all history</button>
        </div>
      </div>`;
  }

  function optionHtml(run, q, key, idx, { review }) {
    const opt = q.options.find((o) => o.key === key);
    const chosen = (run.answers[q.id] || []).includes(key);
    const reveal = review || (run.study && run.checked[q.id]);
    const isAnswer = q.answer.includes(key);
    let cls = 'option';
    let verdict = '';
    if (reveal) {
      cls += ' locked';
      if (isAnswer) { cls += ' correct'; verdict = chosen ? '✓ Your answer' : '✓ Correct answer'; }
      else if (chosen) { cls += ' wrong'; verdict = '✗ Your answer'; }
    } else if (chosen) cls += ' selected';
    const type = q.select > 1 ? 'checkbox' : 'radio';
    const full = q.select > 1 && (run.answers[q.id] || []).length >= q.select && !chosen;
    const input = review ? '' : `<input type="${type}" name="opt" value="${key}" ${chosen ? 'checked' : ''} ${reveal || full ? 'disabled' : ''}>`;
    const tag = review ? 'div' : 'label';
    return `<${tag} class="${cls}">${input}<span class="key">${LETTERS[idx]}.</span><span>${fmt(opt.text)}</span>${verdict ? `<span class="verdict">${verdict}</span>` : ''}</${tag}>`;
  }
  function explanationHtml(run, q) {
    const ok = isCorrect(run, q.id);
    const answered = (run.answers[q.id] || []).length > 0;
    const letters = run.order[q.id].map((k, i) => (q.answer.includes(k) ? LETTERS[i] : null)).filter(Boolean).join(', ');
    return `<div class="explain ${ok ? 'good' : 'bad'}">
      <strong>${ok ? '✓ Correct' : answered ? '✗ Incorrect' : '– Not answered'}</strong> · Answer: ${letters}
      ${q.explanation ? `<p style="margin:6px 0 6px">${fmt(q.explanation)}</p>` : ''}
      ${q.resource ? `<div class="small">Learn more: <a href="${esc(q.resource)}" target="_blank" rel="noopener">${esc(q.resource.replace(/^https:\/\//, ''))}</a></div>` : ''}
    </div>`;
  }

  function viewExam() {
    const run = state.active;
    if (!run) return `<div class="empty">No exam in progress. <a href="#/">Start one from the dashboard.</a></div>`;
    const ids = runQids(run);
    if (!ids.length) { state.active = null; save(); return viewExam(); }
    run.current = Math.min(run.current, ids.length - 1);
    const id = ids[run.current];
    const q = QUESTIONS.get(id);
    const answeredCount = ids.filter((i) => (run.answers[i] || []).length).length;
    const flagged = run.flagged.includes(id);
    const chosen = run.answers[id] || [];
    const canCheck = run.study && !run.checked[id] && chosen.length === q.select;
    const remaining = run.limitSec - run.elapsedSec;
    return `
      <div class="exam-bar">
        <div><strong>Question ${run.current + 1}</strong> <span class="muted">of ${ids.length}</span> · <span class="muted">${answeredCount} answered</span></div>
        <div class="row">
          <span class="timer ${run.timed && remaining <= 300 ? 'low' : ''}" id="timer">${run.timed ? `${fmtDuration(remaining)} left` : fmtDuration(run.elapsedSec)}</span>
          <button data-action="submit" class="primary">Submit exam</button>
        </div>
      </div>
      <div class="progress" aria-hidden="true"><div style="width:${pct(answeredCount, ids.length)}%"></div></div>

      <div class="card">
        <div class="q-meta">Domain ${q.domain}: ${esc(domainName(q.domain))} · Task ${q.task}</div>
        <div class="q-stem">${fmt(q.stem)} ${q.select > 1 ? `<span class="select-hint">(Select ${WORDS[q.select] || q.select}.)</span>` : ''}</div>
        <form class="options" id="options" aria-label="Answer options">
          ${run.order[id].map((k, i) => optionHtml(run, q, k, i, { review: false })).join('')}
        </form>
        ${run.study && run.checked[id] ? explanationHtml(run, q) : ''}
        <div class="row between">
          <div class="row">
            <button data-action="prev" ${run.current === 0 ? 'disabled' : ''}>← Previous</button>
            <button data-action="next" ${run.current === ids.length - 1 ? 'disabled' : ''}>Next →</button>
          </div>
          <div class="row">
            ${run.study ? `<button data-action="check" ${canCheck ? '' : 'disabled'}>Check answer</button>` : ''}
            <button data-action="flag" class="${flagged ? 'flag-on' : ''}" aria-pressed="${flagged}">${flagged ? '⚑ Flagged' : '⚐ Flag for review'}</button>
          </div>
        </div>
      </div>

      <div class="card">
        <h3>Questions</h3>
        <div class="navigator">
          ${ids.map((qid, i) => {
            const cls = [];
            if ((run.answers[qid] || []).length) cls.push('answered');
            if (run.study && run.checked[qid]) cls.push(isCorrect(run, qid) ? 'is-correct' : 'is-wrong');
            if (run.flagged.includes(qid)) cls.push('flagged');
            if (i === run.current) cls.push('current');
            return `<button data-action="goto" data-i="${i}" class="${cls.join(' ')}" aria-label="Question ${i + 1}">${i + 1}</button>`;
          }).join('')}
        </div>
        <div class="legend"><span class="l-answered">Answered</span><span class="l-flagged">Flagged</span><span>Not answered</span></div>
        <p class="muted small" style="margin:10px 0 0">Keyboard: A–F to choose, ← → to move, F to flag.</p>
      </div>`;
  }

  function viewResults(runId) {
    const run = state.runs.find((r) => r.id === runId);
    if (!run) return `<div class="empty">That exam wasn't found. <a href="#/">Back to dashboard</a></div>`;
    const res = run.result;
    const pass = res.pct >= PASS_PCT;
    const ids = runQids(run);
    const missed = ids.filter((id) => !isCorrect(run, id));
    const filters = {
      all: ids,
      incorrect: missed,
      flagged: ids.filter((id) => run.flagged.includes(id)),
      correct: ids.filter((id) => isCorrect(run, id)),
    };
    const shown = filters[reviewFilter] || ids;
    const index = completedRuns().findIndex((r) => r.id === run.id) + 1;
    return `
      <div class="card">
        <div class="score-hero">
          <div>
            <div class="muted small">Exam #${index} · ${fmtDate(run.finishedAt)}</div>
            <div class="big">${res.pct}%</div>
          </div>
          <div>
            <span class="badge ${pass ? 'pass' : 'fail'}">${pass ? '✓ At or above target' : '✗ Below target'}</span>
            <p class="muted" style="margin:8px 0 0">${res.correct} of ${res.total} correct · ${res.answered} answered · ${fmtDuration(run.elapsedSec)}</p>
          </div>
        </div>
        <p class="muted small" style="margin:14px 0 0">AWS reports a scaled score (pass = 720/1000), not a percentage. ${PASS_PCT}% is a practice target, not the official conversion.</p>
        <div class="row" style="margin-top:16px">
          ${missed.length ? `<button class="primary" data-action="retake" data-id="${run.id}">Retake ${missed.length} missed question${missed.length > 1 ? 's' : ''}</button>` : ''}
          <a class="btn" href="#/">New exam</a>
        </div>
      </div>

      <div class="card">
        <h2>By domain</h2>
        ${domainMeters(res.byDomain)}
      </div>

      <div class="card">
        <h2>Review answers</h2>
        <div class="tabs" role="group" aria-label="Filter questions">
          ${Object.entries(filters).map(([k, v]) => `<button data-action="filter" data-f="${k}" aria-pressed="${reviewFilter === k}">${k[0].toUpperCase() + k.slice(1)} (${v.length})</button>`).join('')}
        </div>
        ${shown.length ? shown.map((id) => {
          const q = QUESTIONS.get(id);
          return `<div class="review-item">
            <div class="q-meta">Question ${ids.indexOf(id) + 1} · Domain ${q.domain} · Task ${q.task}${run.flagged.includes(id) ? ' · ⚑ flagged' : ''}</div>
            <div class="q-stem" style="font-size:16px">${fmt(q.stem)} ${q.select > 1 ? `<span class="select-hint">(Select ${WORDS[q.select] || q.select}.)</span>` : ''}</div>
            <div class="options">${run.order[id].map((k, i) => optionHtml(run, q, k, i, { review: true })).join('')}</div>
            ${explanationHtml(run, q)}
          </div>`;
        }).join('') : '<div class="empty">No questions in this filter.</div>'}
      </div>`;
  }

  // ---------- routing & rendering ----------
  function route() {
    const [, name, arg] = (location.hash.replace(/^#\/?/, '#/') || '#/').split('/');
    return { name: name || '', arg };
  }
  function render() {
    const { name, arg } = route();
    stopTimer();
    if (name === 'exam') {
      app.innerHTML = viewExam();
      if (state.active) startTimer();
      bindOptions();
    } else if (name === 'results') {
      app.innerHTML = viewResults(arg);
    } else if (name === 'history') {
      app.innerHTML = viewHistory();
    } else {
      app.innerHTML = viewDashboard();
      bindNewExamForm();
      bindTrend();
    }
  }
  function rerenderExam() {
    const y = window.scrollY;
    app.innerHTML = viewExam();
    bindOptions();
    window.scrollTo(0, y);
  }
  function gotoQuestion(i) {
    const run = state.active;
    run.current = Math.max(0, Math.min(runQids(run).length - 1, i));
    save();
    app.innerHTML = viewExam();
    bindOptions();
    window.scrollTo(0, 0);
  }

  function bindOptions() {
    const form = document.getElementById('options');
    if (!form) return;
    form.addEventListener('change', (e) => {
      const run = state.active;
      const id = runQids(run)[run.current];
      run.answers[id] = [...form.querySelectorAll('input:checked')].map((i) => i.value);
      save();
      rerenderExam();
      const again = app.querySelector(`#options input[value="${e.target.value}"]`);
      if (again && !again.disabled) again.focus({ preventScroll: true });
    });
  }
  function bindNewExamForm() {
    const form = document.getElementById('new-exam');
    if (!form) return;
    const help = document.getElementById('mode-help');
    const sizeInput = form.elements.size;
    const syncMax = () => {
      const d = +form.elements.domain.value;
      const max = d ? BANK.questions.filter((q) => q.domain === d).length : BANK.questions.length;
      sizeInput.max = max;
      if (+sizeInput.value > max) sizeInput.value = max;
    };
    form.elements.mode.addEventListener('change', () => { help.textContent = MODES[form.elements.mode.value].help; });
    form.elements.domain.addEventListener('change', syncMax);
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      if (state.active && !confirm('You have an exam in progress. Discard it and start a new one?')) return;
      const domain = +form.elements.domain.value || null;
      const size = Math.max(5, Math.min(+sizeInput.max, Math.round(+sizeInput.value) || EXAM_SIZE));
      const mode = form.elements.mode.value;
      const qids = pickQuestions(mode, size, domain);
      startRun(createRun({ mode, qids, domain, study: form.elements.study.value === '1', timed: form.elements.timed.checked }));
    });
  }

  // ---------- actions ----------
  const actions = {
    resume: () => { location.hash = '#/exam'; },
    discard: () => {
      if (!confirm('Discard the exam in progress? Your answers in it will be lost.')) return;
      state.active = null;
      save();
      render();
    },
    prev: () => gotoQuestion(state.active.current - 1),
    next: () => gotoQuestion(state.active.current + 1),
    goto: (el) => gotoQuestion(+el.dataset.i),
    flag: () => {
      const run = state.active;
      const id = runQids(run)[run.current];
      run.flagged = run.flagged.includes(id) ? run.flagged.filter((x) => x !== id) : [...run.flagged, id];
      save();
      rerenderExam();
    },
    check: () => {
      const run = state.active;
      run.checked[runQids(run)[run.current]] = true;
      save();
      rerenderExam();
    },
    submit: () => {
      const run = state.active;
      const ids = runQids(run);
      const unanswered = ids.filter((id) => !(run.answers[id] || []).length).length;
      const flagged = run.flagged.length;
      const notes = [unanswered ? `${unanswered} unanswered` : '', flagged ? `${flagged} flagged` : ''].filter(Boolean).join(' and ');
      if (!confirm(`Submit this exam${notes ? ` with ${notes} question${unanswered + flagged > 1 ? 's' : ''}` : ''}?`)) return;
      finishRun();
    },
    filter: (el) => {
      reviewFilter = el.dataset.f;
      const y = window.scrollY;
      render();
      window.scrollTo(0, y);
    },
    retake: (el) => {
      const run = state.runs.find((r) => r.id === el.dataset.id);
      if (state.active && !confirm('You have an exam in progress. Discard it and start the retake?')) return;
      const qids = shuffle(runQids(run).filter((id) => !isCorrect(run, id)));
      startRun(createRun({ mode: 'retake', qids, study: run.study, timed: run.timed }));
    },
    'delete-run': (el) => {
      if (!confirm('Delete this exam from your history?')) return;
      state.runs = state.runs.filter((r) => r.id !== el.dataset.id);
      save();
      render();
    },
    export: () => {
      const blob = new Blob([JSON.stringify({ app: 'saa-c03-practice', version: 1, exportedAt: new Date().toISOString(), ...state }, null, 1)], { type: 'application/json' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `saa-c03-history-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    },
    import: () => document.getElementById('import-file').click(),
    reset: () => {
      if (!confirm('Delete ALL exam history and any exam in progress? This cannot be undone. Consider exporting first.')) return;
      state = { runs: [], active: null };
      save();
      render();
    },
  };

  app.addEventListener('click', (e) => {
    const el = e.target.closest('[data-action]');
    if (!el || el.disabled) return;
    const fn = actions[el.dataset.action];
    if (fn) { e.preventDefault(); fn(el); }
  });
  app.addEventListener('change', (e) => {
    if (e.target.id !== 'import-file' || !e.target.files[0]) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result);
        if (!data || !Array.isArray(data.runs)) throw new Error('missing runs');
        const valid = data.runs.filter((r) => r && r.id && Array.isArray(r.qids) && r.result && r.answers);
        const known = new Set(state.runs.map((r) => r.id));
        const added = valid.filter((r) => !known.has(r.id));
        state.runs.push(...added);
        save();
        alert(`Imported ${added.length} exam${added.length === 1 ? '' : 's'} (${valid.length - added.length} already present).`);
        render();
      } catch (err) {
        alert('That file is not a valid history export.');
      }
    };
    reader.readAsText(e.target.files[0]);
  });

  document.addEventListener('keydown', (e) => {
    if (route().name !== 'exam' || !state.active || e.ctrlKey || e.metaKey || e.altKey) return;
    if (/^(INPUT|SELECT|TEXTAREA)$/.test(e.target.tagName) && e.target.type !== 'radio' && e.target.type !== 'checkbox') return;
    const run = state.active;
    const key = e.key.toUpperCase();
    if (e.key === 'ArrowRight') { e.preventDefault(); gotoQuestion(run.current + 1); }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); gotoQuestion(run.current - 1); }
    else if (key === 'F') actions.flag();
    else if (LETTERS.includes(key)) {
      const inputs = [...document.querySelectorAll('#options input')];
      const input = inputs[LETTERS.indexOf(key)];
      if (input && !input.disabled) { input.checked = input.type === 'checkbox' ? !input.checked : true; input.dispatchEvent(new Event('change', { bubbles: true })); }
    }
  });

  // Keep elapsed time when the tab is closed mid-exam.
  window.addEventListener('pagehide', save);

  // ---------- theme ----------
  const themeBtn = document.getElementById('theme-toggle');
  function applyTheme(t) {
    if (t) document.documentElement.setAttribute('data-theme', t);
    else document.documentElement.removeAttribute('data-theme');
  }
  try { applyTheme(localStorage.getItem(THEME_KEY)); } catch (e) { /* storage blocked */ }
  themeBtn.addEventListener('click', () => {
    const dark = document.documentElement.getAttribute('data-theme') === 'dark' ||
      (!document.documentElement.getAttribute('data-theme') && matchMedia('(prefers-color-scheme: dark)').matches);
    const next = dark ? 'light' : 'dark';
    applyTheme(next);
    try { localStorage.setItem(THEME_KEY, next); } catch (e) { /* storage blocked */ }
  });

  window.addEventListener('hashchange', () => { render(); window.scrollTo(0, 0); });
  render();
})();
