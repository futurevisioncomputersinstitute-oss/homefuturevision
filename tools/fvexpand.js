/*
 * fvexpand.js — make collapsed accordion content readable without JavaScript.
 *
 * The curriculum and FAQ are accordions rendered with <sc-if>, so a closed
 * panel produces no DOM at all. The prerendered snapshot was captured in that
 * state: it holds every question and module title and none of the answers or
 * syllabus bullets. Crawlers that do not run JS — which includes most AI
 * answer engines — therefore read a page that names 14 modules and explains
 * none of them, while the FAQ schema promises answers found nowhere in the
 * HTML.
 *
 * The fix is to render the panel always and hide it with a style, so the text
 * is in the document either way. Clicking behaves exactly as before.
 *
 * The snapshot is discarded wholesale once the bundler boots, so the
 * data-dc-tpl bookkeeping attributes on injected markup are inert; they are
 * written only to keep the snapshot visually consistent with its neighbours.
 *
 *   node tools/fvexpand.js data-analytics python-foundation
 */
'use strict';

const path = require('path');
const { load } = require('./fvedit');

const ROOT = path.join(__dirname, '..');

/*
 * Two page shapes exist. The newer one keeps its content in `modules:` and
 * `faqs:` keys and styles the panels with pc-mod-* classes; the older one uses
 * `const baseModules` / `const baseFaqs` and inline styles alone. A page may
 * also have only one of the two accordions, so either marker may be null.
 */
const KEYED = {
  modulesMarker: 'modules: [',
  faqsMarker: 'faqs: [',
  bodyClass: ' class="pc-mod-body"',
  pointsClass: ' class="pc-mod-points"',
};

const BASE = {
  modulesMarker: 'const baseModules = [',
  faqsMarker: 'const baseFaqs = [',
  bodyClass: '',
  pointsClass: '',
};

/** data-science names its panel pc-mod-detail where the others say body. */
const DETAIL = {
  bodyClass: ' class="pc-mod-detail"',
  pointsClass: ' class="pc-mod-points"',
};

/*
 * Marker style and panel styling vary independently -- data-science keys its
 * data like the newer pages but styles its panels like the older ones -- so
 * each page names both rather than inheriting a pair.
 */
const page = (markers, styling, opts = {}) => ({
  modulesMarker: opts.faqOnly ? null : markers.modulesMarker,
  faqsMarker: markers.faqsMarker,
  bodyClass: styling.bodyClass,
  pointsClass: styling.pointsClass,
});

const PAGES = {
  'data-analytics': page(KEYED, KEYED),
  'business-analytics': page(KEYED, KEYED),
  'business-finance-accounting': page(KEYED, KEYED),
  'pythonagentic-ai': page(KEYED, KEYED),
  'data-science': page(KEYED, DETAIL),

  'python-foundation': page(BASE, BASE),
  'advanced-excel': page(BASE, BASE),
  'c-programming': page(BASE, BASE),
  'cpp-programming': page(BASE, BASE),
  'computer-basics-genai': page(BASE, BASE),
  'power-bi': page(BASE, BASE),
  'professional-office-genai': page(BASE, BASE),
  'professionalpythondeveloper': page(BASE, BASE),
  'tally-prime-gst': page(BASE, BASE),

  'advanced-computer-accounting': page(BASE, BASE, { faqOnly: true }),
  'excel-powerbi': page(BASE, BASE, { faqOnly: true }),
};

/** Pull a bracketed JS literal out of source text and evaluate it. */
function extractLiteral(src, marker) {
  const at = src.indexOf(marker);
  if (at === -1) throw new Error(`marker not found: ${marker}`);
  const start = src.indexOf('[', at + marker.length - 1);
  let depth = 0;
  let inStr = null;
  for (let j = start; j < src.length; j++) {
    const c = src[j];
    if (inStr) {
      if (c === '\\') { j++; continue; }
      if (c === inStr) inStr = null;
      continue;
    }
    if (c === '"' || c === "'" || c === '`') { inStr = c; continue; }
    if (c === '[') depth++;
    else if (c === ']') {
      depth--;
      // eslint-disable-next-line no-eval
      if (depth === 0) return eval(`(${src.slice(start, j + 1)})`);
    }
  }
  throw new Error(`unbalanced literal after ${marker}`);
}

const esc = (s) => String(s)
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;');

// Style strings copied from the already-rendered snapshot so injected markup
// is indistinguishable from what the bundler produced.
const S = {
  modBody: 'padding: 0px 26px 24px 90px;',
  rule: 'height: 1px; background: var(--c-border); margin-bottom: 18px;',
  points: 'display: grid; grid-template-columns: 1fr 1fr; gap: 9px 28px;',
  point: 'display: flex; align-items: flex-start; gap: 10px; font-size: 14.5px; color: var(--c-body); line-height: 1.45;',
  bullet: 'color: var(--c-primary); font-weight: 800; margin-top: 1px;',
  projWrap: 'margin-top: 18px; display: flex; align-items: center; gap: 10px; flex-wrap: wrap;',
  projLabel: 'font-size: 12px; font-weight: 700; color: var(--c-muted); text-transform: uppercase; letter-spacing: 0.06em;',
  projChip: 'background: var(--c-tint); color: var(--c-primary); font-weight: 600; font-size: 13px; padding: 6px 12px; border-radius: 8px;',
  faqAnswer: 'padding: 0px 24px 22px; font-size: 15px; color: var(--c-body); line-height: 1.6; margin: 0px;',
};

function moduleBody(mod, cfg) {
  const points = (mod.points || []).map((pt) => `
                    <div data-dc-tpl="fv-pt" style="${S.point}">
                      <span data-dc-tpl="fv-bl" style="${S.bullet}">›</span><span class="sc-interp">${esc(pt)}</span>
                    </div>`).join('');

  const projects = mod.projects && mod.projects.length
    ? `
                <div data-dc-tpl="fv-pj" style="${S.projWrap}">
                  <span data-dc-tpl="fv-pl" style="${S.projLabel}">Projects:</span>${mod.projects.map((p) => `
                  <span data-dc-tpl="fv-pc" style="${S.projChip}"><span class="sc-interp">${esc(p)}</span></span>`).join('')}
                </div>`
    : '';

  return `
              <div data-dc-tpl="fv-mb"${cfg.bodyClass} style="${S.modBody} display: none;">
                <div data-dc-tpl="fv-rl" style="${S.rule}"></div>
                <div data-dc-tpl="fv-pg"${cfg.pointsClass} style="${S.points}">${points}
                </div>${projects}
              </div>
            `;
}

/** Index just past the `</span>` that closes the span opening at `open`. */
function endOfSpan(html, open) {
  let depth = 0;
  const re = /<span\b|<\/span>/g;
  re.lastIndex = open;
  let m;
  while ((m = re.exec(html))) {
    if (m[0] === '</span>') {
      depth--;
      if (depth === 0) return m.index + '</span>'.length;
    } else depth++;
  }
  throw new Error('unclosed span');
}

/**
 * Insert `html` immediately after the accordion header containing `titleText`.
 * The header is the clickable row, so the insertion point is the first
 * `</div>` following the +/- toggle — identified by its font size, which is
 * 26px on curriculum rows and 24px on FAQ rows.
 */
function insertAfterHeader(snapshot, titleText, html) {
  // Apostrophes and dashes may be entity-encoded in the snapshot, so fall
  // back to matching a leading run of the title rather than the whole string.
  let at = snapshot.indexOf(`>${esc(titleText)}</span>`);
  if (at === -1) at = snapshot.indexOf(`>${esc(titleText.slice(0, 24))}`);
  if (at === -1) throw new Error(`snapshot: accordion item not found: ${titleText}`);
  const toggle = snapshot.search
    ? (() => {
        const re = /<span data-dc-tpl="[^"]*" style="font-size: (?:26|24)px;/g;
        re.lastIndex = at;
        const m = re.exec(snapshot);
        if (!m) throw new Error(`snapshot: toggle not found after: ${titleText}`);
        return m.index;
      })()
    : -1;
  const headerEnd = snapshot.indexOf('</div>', endOfSpan(snapshot, toggle));
  if (headerEnd === -1) throw new Error(`snapshot: header not closed after: ${titleText}`);
  const cut = headerEnd + '</div>'.length;
  return snapshot.slice(0, cut) + html + snapshot.slice(cut);
}

function expand(slug) {
  const cfg = PAGES[slug];
  if (!cfg) throw new Error(`no markup config for ${slug}`);
  const file = path.join(ROOT, slug, 'index.html');
  const page = load(file);

  // A page may carry only one of the two accordions; a null marker says so.
  const modules = cfg.modulesMarker ? extractLiteral(page.template, cfg.modulesMarker) : [];
  const faqs = cfg.faqsMarker ? extractLiteral(page.template, cfg.faqsMarker) : [];

  // ---- template: render the panel always, hide it with a style ----------
  if (cfg.modulesMarker) {
    page.replaceTemplate(
      `            <sc-if value="{{ m.open }}" hint-placeholder-val="{{ false }}">
              <div${cfg.bodyClass} style="padding:0 26px 24px 90px;">`,
      `              <div${cfg.bodyClass} style="{{ m.bodyStyle }}">`
    );
    page.replaceTemplate(
      `                </sc-if>
              </div>
            </sc-if>`,
      `                </sc-if>
              </div>`
    );
  }
  page.replaceTemplate(
    `            <sc-if value="{{ q.open }}" hint-placeholder-val="{{ false }}">
              <p style="padding:0 24px 22px; font-size:15px; color:var(--c-body); line-height:1.6; margin:0;">{{ q.a }}</p>
            </sc-if>`,
    `            <p style="{{ q.bodyStyle }}">{{ q.a }}</p>`
  );

  // ---- template data: the style each panel renders with ------------------
  if (cfg.modulesMarker) {
    page.replaceTemplate(
      `      open: this.state.openModule === i,`,
      `      open: this.state.openModule === i,
      bodyStyle: 'padding:0 26px 24px 90px;' + (this.state.openModule === i ? '' : ' display:none;'),`
    );
  }
  page.replaceTemplate(
    `      open: this.state.openFaq === i,`,
    `      open: this.state.openFaq === i,
      bodyStyle: 'padding:0 24px 22px; font-size:15px; color:var(--c-body); line-height:1.6; margin:0;'
        + (this.state.openFaq === i ? '' : ' display:none;'),`
  );

  // ---- snapshot: write the panels the capture never produced -------------
  let snap = page.snapshot;
  let mods = 0;
  modules.forEach((m, i) => {
    if (i === 0) return; // module 1 was open, so its panel is already present
    snap = insertAfterHeader(snap, m.title, moduleBody(m, cfg));
    mods++;
  });

  let answers = 0;
  faqs.forEach((f) => {
    snap = insertAfterHeader(snap, f.q, `
            <p data-dc-tpl="fv-fa" style="${S.faqAnswer} display: none;"><span class="sc-interp">${esc(f.a)}</span></p>
          `);
    answers++;
  });

  page.replaceSnapshot(page.snapshot, snap);
  page.save();
  console.log(`/${slug}/ — exposed ${mods} module panels and ${answers} FAQ answers to non-JS crawlers`);
}

const slugs = process.argv.slice(2);
if (!slugs.length) {
  console.error('usage: node tools/fvexpand.js <slug>...');
  process.exit(2);
}
slugs.forEach(expand);
