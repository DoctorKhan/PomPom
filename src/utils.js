// Utilities extracted from index.html for Jest unit tests

function extractJSON(text) {
  try { return JSON.parse(text); } catch {}
  const match = String(text || '').match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (match) { try { return JSON.parse(match[1]); } catch {} }
  const braceStart = String(text || '').indexOf('{');
  const braceEnd = String(text || '').lastIndexOf('}');
  if (braceStart !== -1 && braceEnd !== -1 && braceEnd > braceStart) {
    try { return JSON.parse(text.slice(braceStart, braceEnd + 1)); } catch {}
  }
  return null;
}

function toISOFromAny(suggested) {
  if (!suggested) return '';
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(suggested)) {
    const d = new Date(suggested);
    if (!isNaN(d.getTime())) return d.toISOString();
  }
  const tryParse = new Date(suggested);
  if (!isNaN(tryParse.getTime())) return tryParse.toISOString();
  return '';
}

function normalizeDueLocal(text) {
  const t = (text||'').trim().toLowerCase();
  const d = new Date();
  const setTime = (hh=17, mm=0) => { d.setHours(hh, mm, 0, 0); };
  const fmt = (dt) => {
    const yyyy = dt.getFullYear();
    const mm = String(dt.getMonth()+1).padStart(2, '0');
    const dd = String(dt.getDate()).padStart(2, '0');
    const hh = String(dt.getHours()).padStart(2, '0');
    const min = String(dt.getMinutes()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}T${hh}:${min}`;
  };
  const weekdayMap = { sun:0, mon:1, tue:2, tues:2, wed:3, thu:4, thur:4, thurs:4, fri:5, sat:6,
    sunday:0, monday:1, tuesday:2, wednesday:3, thursday:4, friday:5, saturday:6 };

  const re = /(\b\d{1,2})(?::(\d{2}))?\s*(am|pm)?\b/g;
  const matches = Array.from(t.matchAll(re));
  // Prefer the last explicit time, prioritizing one with am/pm
  let timeMatch = null;
  if (matches.length) {
    timeMatch = matches.find(m => (m[3] || '').length > 0) || matches[matches.length - 1];
  }
  const setFromTime = () => {
    if (!timeMatch) { setTime(); return; }
    let hh = parseInt(timeMatch[1],10);
    const mm = timeMatch[2] ? parseInt(timeMatch[2], 10) : 0;
    const ap = (timeMatch[3]||'').toLowerCase();
    if (ap === 'pm' && hh < 12) hh += 12;
    if (ap === 'am' && hh === 12) hh = 0;
    setTime(hh, mm);
  };
  if (/\btoday\b/.test(t)) { setFromTime(); return fmt(d); }
  if (/\btomorrow\b/.test(t)) { d.setDate(d.getDate()+1); setFromTime(); return fmt(d); }
  const inDays = t.match(/in\s+(\d+)\s+days?/);
  if (inDays) { d.setDate(d.getDate()+parseInt(inDays[1],10)); setFromTime(); return fmt(d); }
  const inHours = t.match(/in\s+(\d+)\s+hours?/);
  if (inHours) { d.setHours(d.getHours()+parseInt(inHours[1],10)); setFromTime(); return fmt(d); }
  const wd = Object.keys(weekdayMap).find(w => new RegExp(`\\b${w}\\b`).test(t));
  if (wd) {
    const target = weekdayMap[wd];
    const cur = d.getDay();
    let diff = (target - cur + 7) % 7;
    if (diff === 0) diff = 7;
    d.setDate(d.getDate()+diff);
    setFromTime();
    return fmt(d);
  }
  const parsed = new Date(text);
  if (!isNaN(parsed.getTime())) return fmt(parsed);
  d.setDate(d.getDate()+1); setTime(); return fmt(d);
}

function parseDueOrNull(text) {
  const t = (text||'').toLowerCase();
  const hasToken = /(\btoday\b|\btomorrow\b|in\s+\d+\s+(days?|hours?)\b|\b(sun|mon|tue|tues|wed|thu|thur|thurs|fri|sat|sunday|monday|tuesday|wednesday|thursday|friday|saturday)\b)/i.test(t);
  if (!hasToken) return null;
  return normalizeDueLocal(text);
}

function extractTagsFromText(text) {
  const tags = Array.from(new Set((String(text||'').match(/#[a-z0-9_-]+/gi) || []).map(t => t.slice(1).toLowerCase())));
  const cleanText = String(text||'').replace(/#[a-z0-9_-]+/gi, '').replace(/\s{2,}/g, ' ').trim();
  return { cleanText, tags };
}

function parseTagsFromString(str) {
  const s = (str || '').trim();
  if (!s) return [];
  const hash = (s.match(/#[a-z0-9_-]+/gi) || []).map(t => t.slice(1).toLowerCase());
  const words = s.split(/[\s,]+/).map(w => w.replace(/^#/, '')).map(w => w.trim().toLowerCase()).filter(Boolean);
  return Array.from(new Set([...hash, ...words]));
}

module.exports = {
  extractJSON,
  toISOFromAny,
  normalizeDueLocal,
  parseDueOrNull,
  extractTagsFromText,
  parseTagsFromString,
};

