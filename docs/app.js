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
  // v1 exam history stored answers/option order by Markdown letter (A-F). Since
  // saa-c03-questions/*.md was reshuffled to fix a bias toward "A", answers are
  // now stored by a stable option id instead. LEGACY_OPTION_MAP (generated once,
  // from the bank as it was before the reshuffle) lets old letter-based history
  // be converted to ids the first time it's loaded.
  const HISTORY_FORMAT_VERSION = 2;
  const LETTERS = 'ABCDEF';
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
  // Converts one run's answers/option order from v1 (Markdown letter A-F) to
  // v2 (stable option id), using the pre-reshuffle snapshot in
  // LEGACY_OPTION_MAP. Used both for history already in localStorage and for
  // history imported from an old export file.
  function convertLegacyRun(run) {
    if (!run) return;
    const map = window.LEGACY_OPTION_MAP || {};
    const toId = (qid, letter) => {
      const ids = map[qid];
      const idx = LETTERS.indexOf(letter);
      return ids && idx >= 0 ? ids[idx] : null;
    };
    for (const qid of Object.keys(run.answers || {})) {
      run.answers[qid] = run.answers[qid].map((l) => toId(qid, l)).filter(Boolean);
    }
    for (const qid of Object.keys(run.order || {})) {
      run.order[qid] = run.order[qid].map((l) => toId(qid, l)).filter(Boolean);
    }
  }
  // Rebuilds an exam run from an imported file using only known fields with
  // checked types, so a crafted export can't inject markup into the page.
  // Returns null if the run isn't usable. `legacy` runs (history format v1)
  // store Markdown letters A-F instead of option ids.
  function sanitizeImportedRun(r, legacy) {
    const isObj = (o) => !!o && typeof o === 'object' && !Array.isArray(o);
    const qidRe = /^\d-\d{1,3}$/;
    const optRe = legacy ? /^[A-F]$/ : /^[0-9a-f]{10}$/;
    const num = (v, max = Number.MAX_SAFE_INTEGER) => {
      const n = Number(v);
      return Number.isFinite(n) ? Math.min(max, Math.max(0, n)) : 0;
    };
    const int = (v, max) => Math.round(num(v, max));
    const qidList = (a) => (Array.isArray(a) ? a.filter((q) => typeof q === 'string' && qidRe.test(q)) : []);
    const optList = (a) => (Array.isArray(a) ? a.filter((o) => typeof o === 'string' && optRe.test(o)) : []);
    const perQid = (o, fn) => Object.fromEntries(Object.entries(isObj(o) ? o : {}).filter(([k]) => qidRe.test(k)).map(([k, v]) => [k, fn(v)]));
    const counts = (o, keyRe) => Object.fromEntries(Object.entries(isObj(o) ? o : {})
      .filter(([k, v]) => keyRe.test(k) && isObj(v))
      .map(([k, v]) => [k, { correct: int(v.correct), total: int(v.total) }]));
    if (!isObj(r) || typeof r.id !== 'string' || !/^[a-z0-9]{1,40}$/i.test(r.id) || !isObj(r.result) || !isObj(r.answers)) return null;
    const res = r.result;
    return {
      id: r.id,
      createdAt: num(r.createdAt),
      finishedAt: num(r.finishedAt),
      mode: Object.prototype.hasOwnProperty.call(MODES, r.mode) ? r.mode : 'random',
      domain: DOMAINS.some((d) => d.id === Number(r.domain)) ? Number(r.domain) : null,
      study: r.study === true,
      timed: r.timed === true,
      limitSec: num(r.limitSec),
      elapsedSec: num(r.elapsedSec),
      qids: qidList(r.qids),
      order: perQid(r.order, optList),
      answers: perQid(r.answers, optList),
      flagged: qidList(r.flagged),
      checked: perQid(r.checked, () => true),
      current: 0,
      result: {
        correct: int(res.correct),
        answered: int(res.answered),
        total: int(res.total),
        pct: int(res.pct, 100),
        byDomain: counts(res.byDomain, /^\d$/),
        byTask: counts(res.byTask, /^\d\.\d$/),
      },
    };
  }
  function migrateLegacyAnswers(s) {
    s.runs.forEach(convertLegacyRun);
    convertLegacyRun(s.active);
    s.historyVersion = HISTORY_FORMAT_VERSION;
  }
  function load() {
    try {
      const raw = localStorage.getItem(STORE_KEY);
      const s = raw ? JSON.parse(raw) : null;
      if (s && Array.isArray(s.runs)) {
        const loaded = { runs: s.runs, active: s.active || null, historyVersion: s.historyVersion || 1 };
        if (loaded.historyVersion < HISTORY_FORMAT_VERSION) migrateLegacyAnswers(loaded);
        return loaded;
      }
    } catch (e) {
      storageOK = false;
    }
    return { runs: [], active: null, historyVersion: HISTORY_FORMAT_VERSION };
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
    // Single-answer questions get their correct option placed so that, across the exam, each letter is
    // used about equally (never more than 2 ahead of the least-used one) and no letter is the answer
    // three times in a row. Within those limits the letter is random, so it can't be predicted from
    // the previous answers. The wrong options fill the other slots in random order; multi-select
    // questions are simply shuffled.
    const used = [];
    const last = [];
    for (const id of qids) {
      const q = QUESTIONS.get(id);
      if (q.answer.length !== 1) { order[id] = shuffle(q.options.map((o) => o.id)); continue; }
      let slots = q.options.map((_, i) => i);
      if (last.length >= 2 && last[last.length - 1] === last[last.length - 2]) slots = slots.filter((i) => i !== last[last.length - 1]);
      const least = Math.min(...slots.map((i) => used[i] || 0));
      const pos = shuffle(slots.filter((i) => (used[i] || 0) <= least + 2))[0];
      const opts = shuffle(q.options.map((o) => o.id).filter((o) => o !== q.answer[0]));
      opts.splice(pos, 0, q.answer[0]);
      order[id] = opts;
      used[pos] = (used[pos] || 0) + 1;
      last.push(pos);
    }
    return {
      id: uid(),
      createdAt: Date.now(),
      finishedAt: null,
      mode,
      domain: domain || null,
      study: !!study,
      timed: !!timed && !study, // study mode is never timed
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
  // Runs saved before study mode dropped the timer can still have timed: true.
  const isTimed = (run) => run.timed && !run.study;
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
        el.textContent = isTimed(run) ? `${fmtDuration(remaining)} left` : fmtDuration(run.elapsedSec);
        el.classList.toggle('low', isTimed(run) && remaining <= 300);
      }
      if (isTimed(run) && run.elapsedSec >= run.limitSec) {
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
                <option value="1" selected>Study mode: check each answer</option>
                <option value="0">Exam mode: score at the end</option>
              </select>
            </label>
          </div>
          <div class="row between">
            <label class="check"><input type="checkbox" name="timed" disabled> Timed (2 minutes per question; 130 minutes for 65; exam mode only)</label>
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
          <td><div class="row" style="justify-content:flex-end"><a class="btn ghost" href="#/results/${esc(r.id)}">Review</a>${withActions ? `<button class="ghost danger" data-action="delete-run" data-id="${esc(r.id)}">Delete</button>` : ''}</div></td>
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

  function optionHtml(run, q, optId, idx, { review }) {
    const opt = q.options.find((o) => o.id === optId);
    const chosen = (run.answers[q.id] || []).includes(optId);
    const reveal = review || (run.study && run.checked[q.id]);
    const isAnswer = q.answer.includes(optId);
    let cls = 'option';
    let verdict = '';
    if (reveal) {
      cls += ' locked';
      if (isAnswer) { cls += ' correct'; verdict = chosen ? '✓ Your answer' : '✓ Correct answer'; }
      else if (chosen) { cls += ' wrong'; verdict = '✗ Your answer'; }
    } else if (chosen) cls += ' selected';
    const type = q.select > 1 ? 'checkbox' : 'radio';
    const full = q.select > 1 && (run.answers[q.id] || []).length >= q.select && !chosen;
    const input = review ? '' : `<input type="${type}" name="opt" value="${optId}" ${chosen ? 'checked' : ''} ${reveal || full ? 'disabled' : ''}>`;
    const tag = review ? 'div' : 'label';
    const why = reveal && !isAnswer && opt.why ? `<span class="why">${fmt(opt.why)}</span>` : '';
    return `<${tag} class="${cls}">${input}<span class="key">${LETTERS[idx]}.</span><span class="otext">${fmt(opt.text)}${why}</span>${verdict ? `<span class="verdict">${verdict}</span>` : ''}</${tag}>`;
  }
  // Architecture diagrams (q.arch, from ```arch blocks): nested boxes (Region, VPC, AZ, subnet,
  // security group...) holding service icons, with arrows between icons drawn once laid out.
  const ICONS = BANK.icons || {};
  // Official AWS Architecture Icons in docs/icons; general icons (users, internet...) and the AWS
  // Cloud group logo have a separate dark-theme file.
  const GROUP_ICONS = { cloud: 1, account: 1, region: 1, vpc: 1, public: 1, private: 1, onprem: 1, asg: 1 };
  const iconImg = (name, dark) => dark
    ? `<img class="on-light" src="icons/${esc(name)}.svg" alt=""><img class="on-dark" src="icons/${esc(name)}-dark.svg" alt="">`
    : `<img src="icons/${esc(name)}.svg" alt="">`;
  function archItemHtml(it) {
    if (it.k === 'row' || it.k === 'col') return `<div class="ar-${it.k}">${it.c.map(archItemHtml).join('')}</div>`;
    if (it.k) {
      return `<div class="ar-box k-${it.k}${it.d ? ` d-${it.d}` : ''}${it.h ? ' hl' : ''}">` +
        (it.n ? `<div class="ar-title">${GROUP_ICONS[it.k] ? `<span class="ar-tag">${iconImg(`group-${it.k}`, it.k === 'cloud')}</span>` : ''}<span>${fmt(it.n)}${it.s ? ` <small>${fmt(it.s)}</small>` : ''}</span></div>` : '') +
        `<div class="ar-kids">${it.c.map(archItemHtml).join('')}</div></div>`;
    }
    const icon = ICONS[it.i] || { c: 'general', a: '?' };
    return `<div class="ar-node${it.h ? ' hl' : ''}" data-id="${esc(it.id)}">` +
      `<span class="ar-icon">${iconImg(it.i, icon.dark)}</span>` +
      `<span class="ar-label">${fmt(it.n || '')}</span>${it.s ? `<small>${fmt(it.s)}</small>` : ''}</div>`;
  }
  function archText(q) {
    const names = {};
    (function walk(items) { items.forEach((it) => { if (it.id) names[it.id] = it.n; if (it.c) walk(it.c); }); })(q.arch.c);
    if (!q.arch.f.length) return 'Architecture diagram: ' + Object.values(names).join(', ');
    return 'Architecture diagram: ' + q.arch.f.map((f) =>
      `${names[f.a]} ${f.t === 'x' ? 'cannot reach' : 'to'} ${names[f.b]}${f.e ? ` (${f.e})` : ''}`).join('; ');
  }
  function archHtml(q) {
    return `<figure class="arch-wrap" role="img" aria-label="${esc(archText(q))}" data-q="${esc(q.id)}">` +
      `<div class="arch">${q.arch.c.map(archItemHtml).join('')}</div>` +
      `<button type="button" class="ghost ar-zoom">Tap to enlarge</button></figure>`;
  }
  const SVG_NS = 'http://www.w3.org/2000/svg';
  function svgEl(tag, attrs, parent) {
    const el = document.createElementNS(SVG_NS, tag);
    Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v));
    if (parent) parent.appendChild(el);
    return el;
  }
  // Picks an elbow route from icon A to icon B that crosses the fewest other nodes, then the shortest.
  function routeArrow(A, B, others, bounds) {
    const ac = { x: (A.l + A.r) / 2, y: A.cy }, bc = { x: (B.l + B.r) / 2, y: B.cy };
    const cands = [];
    const right = B.l > A.r, left = A.l > B.r, down = B.t > A.b, up = A.t > B.b;
    if (right || left) {
      const sx = right ? A.r : A.l, ex = right ? B.l : B.r;
      [0.5, 0.3, 0.7, 0.15, 0.85].forEach((k) => {
        const mx = sx + (ex - sx) * k;
        cands.push([[sx, ac.y], [mx, ac.y], [mx, bc.y], [ex, bc.y]]);
      });
      if (down) cands.push([[sx, ac.y], [bc.x, ac.y], [bc.x, B.t]]);
      cands.push([[ac.x, down ? A.b : A.t], [ac.x, bc.y], [ex, bc.y]]);
    }
    if (down || up) {
      const sy = down ? A.b : A.t, ey = down ? B.t : B.b;
      [0.5, 0.3, 0.7].forEach((k) => {
        const my = sy + (ey - sy) * k;
        cands.push([[ac.x, sy], [ac.x, my], [bc.x, my], [bc.x, ey]]);
      });
    }
    // Detours over the top of, or under, everything in between.
    const lo = Math.min(ac.x, bc.x), hi = Math.max(ac.x, bc.x);
    const between = others.filter((o) => o.r > lo && o.l < hi);
    const top = Math.min(A.t, B.t, ...between.map((o) => o.t)) - 16;
    const bottom = Math.max(A.b, B.b, ...between.map((o) => o.b)) + 16;
    cands.push([[ac.x, A.t], [ac.x, top], [bc.x, top], [bc.x, B.t]]);
    cands.push([[ac.x, A.b], [ac.x, bottom], [bc.x, bottom], [bc.x, B.b]]);
    const loY = Math.min(ac.y, bc.y), hiY = Math.max(ac.y, bc.y);
    const beside = others.filter((o) => o.b > loY && o.t < hiY);
    const rightX = Math.max(A.r, B.r, ...beside.map((o) => o.r)) + 16;
    const leftX = Math.min(A.l, B.l, ...beside.map((o) => o.l)) - 16;
    cands.push([[A.r, ac.y], [rightX, ac.y], [rightX, bc.y], [B.r, bc.y]]);
    cands.push([[A.l, ac.y], [leftX, ac.y], [leftX, bc.y], [B.l, bc.y]]);
    const hits = (pts) => {
      let n = 0;
      for (let i = 1; i < pts.length; i++) {
        const [x1, y1] = pts[i - 1], [x2, y2] = pts[i];
        const l = Math.min(x1, x2), r = Math.max(x1, x2), t = Math.min(y1, y2), b = Math.max(y1, y2);
        others.forEach((o) => { if (r > o.l && l < o.r && b > o.t && t < o.b) n += o.title ? 0.3 : 1; });
        if (t < 2 || l < 2 || r > bounds.w - 2 || b > bounds.h - 2) n += 0.5;
      }
      return n;
    };
    const len = (pts) => pts.slice(1).reduce((n, p, i) => n + Math.abs(p[0] - pts[i][0]) + Math.abs(p[1] - pts[i][1]), 0);
    return cands.map((pts) => ({ pts, score: hits(pts) * 10000 + len(pts) + pts.length * 20 }))
      .sort((a, b) => a.score - b.score)[0].pts;
  }
  // Draws the arrows for one .arch element at full size, in its own coordinates.
  function drawArch(arch, q) {
    arch.querySelectorAll(':scope > svg').forEach((el) => el.remove());
    const base = arch.getBoundingClientRect();
    const scale = base.width / arch.offsetWidth || 1;
    const rel = (el) => {
      const r = el.getBoundingClientRect();
      return { l: (r.left - base.left) / scale, t: (r.top - base.top) / scale, r: (r.right - base.left) / scale, b: (r.bottom - base.top) / scale };
    };
    // Horizontal arrows meet the icon's sides; vertical ones meet the top of the icon or the bottom of its label.
    const box = (id) => {
      const node = arch.querySelector(`[data-id="${CSS.escape(id)}"]`);
      const i = rel(node.querySelector('.ar-icon')), n = rel(node);
      return { l: i.l, r: i.r, t: i.t, b: n.b, cy: (i.t + i.b) / 2 };
    };
    const nodeRects = [...arch.querySelectorAll('.ar-node')].map((el) => {
      const r = rel(el);
      return { id: el.dataset.id, l: r.l + 18, r: r.r - 18, t: r.t, b: r.b };
    }).concat([...arch.querySelectorAll('.ar-title > span:last-child')].map((el) => Object.assign(rel(el), { title: true })));
    const svg = svgEl('svg', { class: 'ar-lines', width: arch.offsetWidth, height: arch.offsetHeight, 'aria-hidden': 'true' });
    const defs = svgEl('defs', {}, svg);
    [['a', 'ar-stroke'], ['ax', 'ar-stroke-x']].forEach(([id, cls]) => {
      const m = svgEl('marker', { id: `arm-${id}`, viewBox: '0 0 10 10', refX: '9', refY: '5', markerWidth: '7', markerHeight: '7', orient: 'auto-start-reverse' }, defs);
      svgEl('path', { d: 'M0,0 L10,5 L0,10 z', class: cls.replace('stroke', 'fill') }, m);
    });
    arch.appendChild(svg); // attached first, so label widths can be measured
    const labels = svgEl('g', {}, svg);
    const pending = [];
    q.arch.f.forEach((f) => {
      const A = box(f.a), B = box(f.b);
      const pts = routeArrow(A, B, nodeRects.filter((r) => r.id !== f.a && r.id !== f.b), { w: arch.offsetWidth, h: arch.offsetHeight });
      const x = f.t === 'x';
      const path = svgEl('path', { d: 'M' + pts.map((p) => p.join(',')).join(' L'), class: `ar-path${x ? ' x' : ''}${f.t === 'd' ? ' d' : ''}`, 'marker-end': `url(#arm-${x ? 'ax' : 'a'})` }, svg);
      if (f.t === 'both') path.setAttribute('marker-start', 'url(#arm-a)');
      const text = (x ? '✕ ' : '') + (f.e || '');
      if (text || f.no) pending.push({ pts, text, no: f.no, x });
    });
    // Each label goes at the point along its arrow that covers the least text (titles, icon
    // labels, other arrow labels), preferring the middle of the arrow.
    const obstacles = [...arch.querySelectorAll('.ar-title > span:not(.ar-tag), .ar-icon, .ar-label, .ar-node small')]
      .map((el) => Object.assign(rel(el), { icon: el.classList.contains('ar-icon') }));
    const overlap = (r, o) => Math.max(0, Math.min(r.r, o.r) - Math.max(r.l, o.l)) * Math.max(0, Math.min(r.b, o.b) - Math.max(r.t, o.t));
    pending.forEach((lb) => {
      const g = svgEl('g', { class: `ar-lbl${lb.x ? ' x' : ''}` }, labels);
      let w = 0, t, lines = [];
      if (lb.text) {
        // Long labels wrap onto two balanced lines.
        const words = lb.text.split(' ');
        let cut = 0;
        if (lb.text.length > 20 && words.length > 1) {
          let best = Infinity;
          for (let i = 1; i < words.length; i++) {
            const d = Math.abs(words.slice(0, i).join(' ').length - words.slice(i).join(' ').length);
            if (d < best) { best = d; cut = i; }
          }
        }
        lines = cut ? [words.slice(0, cut).join(' '), words.slice(cut).join(' ')] : [lb.text];
        t = svgEl('text', { 'text-anchor': 'middle' }, g);
        lines.forEach((line) => { svgEl('tspan', {}, t).textContent = line; });
        w = Math.max(...[...t.children].map((ts) => ts.getComputedTextLength())) + 8;
      }
      const W = w + (lb.no ? (w ? 22 : 18) : 0);
      const H = lines.length > 1 ? 30 : 16;
      const segs = lb.pts.slice(1).map((p, i) => [lb.pts[i], p]);
      const total = segs.reduce((n, [p, q]) => n + Math.hypot(q[0] - p[0], q[1] - p[1]), 0);
      let best = null, run = 0;
      segs.forEach(([p, q]) => {
        const len = Math.hypot(q[0] - p[0], q[1] - p[1]);
        for (let d = 0; d <= len; d += 4) {
          const at = run + d;
          if (at < 14 || at > total - 14) continue;
          const cx = p[0] + ((q[0] - p[0]) * d) / (len || 1), cy = p[1] + ((q[1] - p[1]) * d) / (len || 1);
          const r = { l: cx - W / 2 - 2, r: cx + W / 2 + 2, t: cy - H / 2 - 3, b: cy + H / 2 + 3 };
          const score = obstacles.reduce((n, o) => n + overlap(r, o) * (o.icon ? 4 : 1), 0) + Math.abs(at - total / 2) * 0.3;
          if (!best || score < best.score) best = { cx, cy, r, score };
        }
        run += len;
      });
      if (!best) { const [p, q] = segs[Math.floor(segs.length / 2)]; best = { cx: (p[0] + q[0]) / 2, cy: (p[1] + q[1]) / 2 }; best.r = { l: best.cx - W / 2, r: best.cx + W / 2, t: best.cy - 9, b: best.cy + 9 }; }
      const left = best.cx - W / 2;
      if (lb.no) {
        svgEl('circle', { cx: left + 9, cy: best.cy, r: 9, class: 'ar-no' }, g);
        const n = svgEl('text', { x: left + 9, y: best.cy + 4, 'text-anchor': 'middle', class: 'ar-no-t' }, g);
        n.textContent = lb.no;
      }
      if (t) {
        const tx = left + W - w;
        [...t.children].forEach((ts, i) => {
          ts.setAttribute('x', tx + w / 2);
          ts.setAttribute('y', best.cy + 4 + (lines.length > 1 ? (i ? 7 : -7) : 0));
        });
        g.insertBefore(svgEl('rect', { x: tx, y: best.cy - H / 2, width: w, height: H, rx: 4 }), t);
      }
      obstacles.push(best.r);
    });
    svg.appendChild(labels);
  }
  // Scales each architecture diagram down to fit its box; tapping a shrunken one opens it full size.
  function fitArchs() {
    app.querySelectorAll('.arch-wrap').forEach((wrap) => {
      const arch = wrap.querySelector('.arch');
      arch.style.transform = '';
      drawArch(arch, QUESTIONS.get(wrap.dataset.q));
      const s = Math.min(1, wrap.clientWidth / arch.offsetWidth);
      arch.style.transform = s < 1 ? `scale(${s})` : '';
      wrap.style.height = `${arch.offsetHeight * s + (s < 0.85 ? 34 : 0)}px`;
      wrap.classList.toggle('shrunk', s < 0.85);
    });
  }
  function openArch(wrap) {
    const dlg = document.createElement('dialog');
    dlg.className = 'ar-dialog';
    dlg.innerHTML = `<div class="ar-dialog-bar"><strong>Diagram</strong><button type="button" class="ghost" data-close>Close</button></div><div class="ar-dialog-body"></div>`;
    const arch = wrap.querySelector('.arch').cloneNode(true);
    arch.style.transform = '';
    dlg.querySelector('.ar-dialog-body').appendChild(arch);
    document.body.appendChild(dlg);
    dlg.addEventListener('close', () => dlg.remove());
    dlg.querySelector('[data-close]').addEventListener('click', () => dlg.close());
    dlg.showModal();
    drawArch(arch, QUESTIONS.get(wrap.dataset.q));
  }
  document.addEventListener('click', (e) => {
    const wrap = e.target.closest('.arch-wrap.shrunk');
    if (wrap && !e.target.closest('dialog')) openArch(wrap);
  });

  function explanationHtml(run, q) {
    const ok = isCorrect(run, q.id);
    const answered = (run.answers[q.id] || []).length > 0;
    const letters = run.order[q.id].map((optId, i) => (q.answer.includes(optId) ? LETTERS[i] : null)).filter(Boolean).join(', ');
    return `<div class="explain ${ok ? 'good' : 'bad'}">
      <strong>${ok ? '✓ Correct' : answered ? '✗ Incorrect' : '– Not answered'}</strong> · Answer: ${letters}
      ${q.explanation ? `<p style="margin:6px 0 6px">${fmt(q.explanation)}</p>` : ''}
      ${q.arch ? archHtml(q) : ''}
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
          ${run.study ? '' : `<span class="timer ${isTimed(run) && remaining <= 300 ? 'low' : ''}" id="timer">${isTimed(run) ? `${fmtDuration(remaining)} left` : fmtDuration(run.elapsedSec)}</span>`}
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
          <div class="row q-nav">
            <button data-action="prev" aria-label="Previous" ${run.current === 0 ? 'disabled' : ''}><span class="wide-only">← Previous</span><span class="narrow-only">← Prev</span></button>
            ${run.study ? `<button data-action="check" aria-label="Check answer" ${canCheck ? '' : 'disabled'}><span class="wide-only">Check answer</span><span class="narrow-only">Check</span></button>` : ''}
            <button data-action="next" aria-label="Next" ${run.current === ids.length - 1 ? 'disabled' : ''}>Next →</button>
          </div>
          <div class="row">
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
    // Study mode has no timer: the Timed box only applies to exam mode, where it's on by default.
    let timedChoice = true;
    form.elements.study.addEventListener('change', () => {
      const study = form.elements.study.value === '1';
      if (study) timedChoice = form.elements.timed.checked;
      form.elements.timed.checked = study ? false : timedChoice;
      form.elements.timed.disabled = study;
    });
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
      state = { runs: [], active: null, historyVersion: HISTORY_FORMAT_VERSION };
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
        const legacy = !data.historyVersion || data.historyVersion < HISTORY_FORMAT_VERSION;
        const valid = data.runs.map((r) => sanitizeImportedRun(r, legacy)).filter(Boolean);
        const known = new Set(state.runs.map((r) => r.id));
        const added = valid.filter((r) => !known.has(r.id));
        if (legacy) added.forEach(convertLegacyRun);
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
  new MutationObserver(fitArchs).observe(app, { childList: true });
  let fitTimer;
  window.addEventListener('resize', () => { clearTimeout(fitTimer); fitTimer = setTimeout(fitArchs, 100); });
  render();
})();
