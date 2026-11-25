#!/usr/bin/env python3
"""Build the blog from blog-src/ into plain static HTML.

    python tools/build-blog.py

Reads   blog-src/categories.json
        blog-src/posts/*.html        front matter + the article body (HTML)
Writes  blog/index.html
        blog/category/<category>/index.html
        blog/<slug>/index.html
Updates the blog entries in sitemap.xml and the "## Blog" list in llms.txt.

Standard library only. Output is committed, so GitHub Pages serves finished
files and needs no build step of its own.

Post file format
----------------
    ---
    title: Excel vs Power BI: which should you learn first?
    slug: excel-vs-power-bi
    category: data-analytics
    description: One or two sentences for search results (about 150 characters).
    dek: Longer standfirst shown under the title.
    date: 2026-11-21
    updated: 2026-11-21
    readtime: 6
    author_name: Optional person's name        (default: the institute)
    author_role: Optional, e.g. Senior Data Analytics Mentor
    author_url: Optional profile link (LinkedIn)
    author_bio: Optional one-paragraph bio for the box under the article
    image: Optional /assets/... path (default: the logo)
    cta_title: Excel & Power BI Course
    cta_text: One sentence for the sidebar course card.
    cta_link: /excel-powerbi/
    related: /excel-powerbi/ | Excel & Power BI | One-line description
    related: /advanced-excel/ | Advanced Excel | One-line description
    source: Microsoft: Excel specifications and limits | https://support.microsoft.com/...
    ---
    <div class="fv-answer" id="answer"> ... </div>
    <h2 id="section-id">Heading</h2> ...

Contents list: built from id="answer" and every <h2 id="..."> in the body.
FAQ schema: built from the <h3>/<p> pairs inside <div class="fv-faq">, so the
markup and the schema can never disagree.
"""
import html
import json
import re
import sys
from urllib.parse import quote
from datetime import date
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "blog-src"
SITE = "https://futurevisioncomputers.com"
ORG_ID = SITE + "/#org"
LOGO = "/assets/prerendered/89055029bb97a967.webp"
ORG_NAME = "Future Vision Computer Institute"
BRAND = "Future Vision Computers"
LINKEDIN = "https://www.linkedin.com/company/future-vision-computer-institute-surat/"
SAME_AS = [
    LINKEDIN,
    "https://www.youtube.com/@futurevisioncomputers",
    "https://www.facebook.com/futurevisioncomputer/",
    "https://www.justdial.com/Surat/Future-Vision-Computers-Computer-Institute-In-Pal-Adajan-Near-Galaxy-Circle-Pal-Gam/0261PX261-X261-230328191130-R8G3_BZDET",
    "https://www.indiamart.com/future-vision-computer/",
]
DEFAULT_BIO = (
    "We have taught computer and data courses in Surat since 2006, at our Citylight, "
    "Vesu and Pal centres. This guide reflects the questions students ask us before they enrol."
)

ANALYTICS = """<script type="text/javascript">
    (function(c,l,a,r,i,t,y){
        c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
        t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
        y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
    })(window, document, "clarity", "script", "7qoy7luf48");
</script>
<script>/* Google tag: load on first interaction or after 6.0s. The gtag() stub below queues events meanwhile, so none are lost. */(function(){if(window.__fvGtagBoot)return;window.__fvGtagBoot=1;var ev=['scroll','pointerdown','keydown','touchstart'];function inject(){if(window.__fvGtagLoaded)return;window.__fvGtagLoaded=1;var s=document.createElement('script');s.async=true;s.src='https://www.googletagmanager.com/gtag/js?id=G-1X52MQJ51V';document.head.appendChild(s)}function go(){if(window.__fvGtagQueued)return;window.__fvGtagQueued=1;ev.forEach(function(e){removeEventListener(e,go)});(window.requestIdleCallback||function(f){setTimeout(f,1)})(inject,{timeout:300})}ev.forEach(function(e){addEventListener(e,go,{passive:true})});setTimeout(go,6000)})();</script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-1X52MQJ51V');
</script>"""

e = html.escape


# --- helpers -----------------------------------------------------------------

def write(path, text):
    path.parent.mkdir(parents=True, exist_ok=True)
    with open(path, "w", encoding="utf-8", newline="\n") as f:
        f.write(text)


def long_date(iso):
    d = date.fromisoformat(iso)
    return f"{d.day} {d.strftime('%B %Y')}"


def ld(obj):
    """JSON-LD that is safe inside a <script> element."""
    return json.dumps(obj, ensure_ascii=False, indent=2).replace("</", "<\\/")


def plain(fragment):
    return html.unescape(re.sub(r"<[^>]+>", "", fragment)).strip()


def parse_post(path):
    raw = path.read_text(encoding="utf-8")
    m = re.match(r"---\r?\n(.*?)\r?\n---\r?\n(.*)\Z", raw, re.S)
    if not m:
        sys.exit(f"{path.name}: missing front matter")
    meta = {"related": [], "source": []}
    for line in m.group(1).splitlines():
        if not line.strip() or ":" not in line:
            continue
        k, v = line.split(":", 1)
        k, v = k.strip(), v.strip()
        if k in ("related", "source"):
            meta[k].append([p.strip() for p in v.split("|")])
        else:
            meta[k] = v
    for need in ("title", "slug", "category", "description", "dek", "date"):
        if not meta.get(need):
            sys.exit(f"{path.name}: front matter needs '{need}'")
    meta["courses"] = [c.strip().strip("/") for c in meta.get("courses", "").split(",") if c.strip()]
    meta.setdefault("updated", meta["date"])
    meta.setdefault("readtime", "5")
    meta["body"] = m.group(2).strip("\r\n")
    return meta


# --- site header, footer and fonts, copied from a live course page ----------------------
#
# The blog must look like the rest of the site, so the header, footer, their CSS and the
# @font-face rules are lifted from one real page at build time. When the site header changes
# (see tools/patch-header-nav.py) the next blog build picks it up. Output goes to
# assets/fv-site-chrome.css; do not edit that file by hand.

CHROME_PAGE = ROOT / "excel-powerbi" / "index.html"
CHROME_CSS = ROOT / "assets" / "fv-site-chrome.css"
KEEP_SELECTOR = re.compile(r"(#fv-ham|\bheader\b|\bfooter\b|fv-ftr|fv-hdr|fv-nav|fv-cw|fv-ctrig|fv-dd|fv-enrol|fv-phone|navlinks|hdr-inner)")


def _split_rules(css):
    """Split CSS into top-level (prelude, body) pairs, respecting nested braces."""
    out, depth, start, pre = [], 0, 0, ""
    for i, ch in enumerate(css):
        if ch == "{":
            if depth == 0:
                pre = css[start:i].strip()
                start = i + 1
            depth += 1
        elif ch == "}":
            depth -= 1
            if depth == 0:
                out.append((pre, css[start:i]))
                start = i + 1
    return out


def _filter_css(css):
    kept = []
    for pre, body in _split_rules(css):
        if pre.startswith("@media"):
            inner = _filter_css(body)
            if inner:
                kept.append(f"{pre}{{{inner}}}")
        elif pre.startswith("@"):
            continue
        elif KEEP_SELECTOR.search(pre):
            kept.append(f"{pre}{{{body}}}")
    return "".join(kept)


def site_chrome():
    t = CHROME_PAGE.read_text(encoding="utf-8")
    static = t[: t.index('<script type="__bundler/template">')]  # skip the escaped template copy
    blocks = re.findall(r"<style[^>]*>(.*?)</style>", static, re.S)

    faces = []
    for b in blocks:
        for f in re.findall(r"@font-face\s*\{[^}]*\}", b):
            f = re.sub(r"\s+", " ", f).strip()
            if f not in faces:
                faces.append(f)
    rules = "".join(_filter_css(b) for b in blocks if "fv-hdr{" in b or "#fv-ham{" in b)
    css = ("/* Generated by tools/build-blog.py from excel-powerbi/index.html. Do not edit by hand. */\n"
           + "\n".join(faces) + "\n" + rules + "\n")
    write(CHROME_CSS, css)

    def clean(h):
        h = re.sub(r'\sdata-dc-tpl="\d+"', "", h)
        h = h.replace('src="../assets/', 'src="/assets/').replace('href="#enquiry"', 'href="/#enquiry"')
        return h

    header = clean(re.search(r"<header\b.*?</header>", static, re.S).group(0))
    # Services is added by fv-mob.js on the live pages; put it in the markup so it never depends on the script
    if "/services/" not in header:
        header = re.sub(r'(<a href="/blog/"[^>]*>[^<]*</a>)',
                        r'\1<a href="https://futurevisioncomputers.com/services/" class="fv-navlink">Services</a>', header, count=1)
    footer = clean(re.search(r"<footer\b.*?</footer>", static, re.S).group(0))
    mob = re.search(r"fv-mob\.js\?v=(\d+)", static)
    return {
        "header": header,
        "footer": footer,
        "mob": mob.group(1) if mob else "1",
        "css_v": __import__("hashlib").md5(css.encode()).hexdigest()[:8],
    }


# --- course cards (same data and design as the home page) ----------------------------

WA_ICON = ('<svg width="18" height="18" viewBox="0 0 24 24" fill="#fff" aria-hidden="true"><path d="M17.5 14.4c-.3-.15-1.7-.85-2-.95-.25-.1-.45-.15-.65.15s-.75.95-.9 1.15-.35.2-.65.05a8.1 8.1 0 0 1-2.4-1.5 9 9 0 0 1-1.65-2.05c-.15-.3 0-.45.15-.6l.45-.55c.15-.2.2-.3.3-.5s.05-.4 0-.55-.65-1.55-.9-2.15c-.25-.55-.5-.5-.65-.5h-.55a1.05 1.05 0 0 0-.8.35 3.2 3.2 0 0 0-1 2.4 5.6 5.6 0 0 0 1.2 3 12.8 12.8 0 0 0 4.9 4.35c.7.3 1.25.5 1.65.6a4 4 0 0 0 1.85.1 3 3 0 0 0 2-1.4 2.5 2.5 0 0 0 .15-1.4c-.05-.15-.25-.2-.55-.35zM12 2a10 10 0 0 0-8.5 15.3L2 22l4.85-1.45A10 10 0 1 0 12 2zm0 18.3a8.3 8.3 0 0 1-4.25-1.15l-.3-.2-2.85.85.9-2.8-.2-.3A8.3 8.3 0 1 1 12 20.3z"/></svg>')


def load_courses():
    """Read the course list straight out of the home page script, keyed by page slug."""
    src = (ROOT / "index.html").read_text(encoding="utf-8")
    out = {}
    for line in src.splitlines():
        if "imgId:" not in line or "link:'" not in line:
            continue
        f = {k: v.replace("\\'", "'") for k, v in re.findall(r"(\w+):'((?:[^'\\]|\\.)*)'", line)}
        sk = re.search(r"skills:\[(.*?)\]", line)
        f["skills"] = re.findall(r"'((?:[^'\\]|\\.)*)'", sk.group(1)) if sk else []
        slug = f.get("link", "").strip("/")
        if slug and slug not in out:
            out[slug] = f
    return out


def image_size(path):
    try:
        from PIL import Image
        with Image.open(ROOT / path.lstrip("/")) as im:
            return im.size
    except Exception:
        return None


def course_card(c):
    title = c["title"]
    img = "/assets/" + c["img"].rsplit("/", 1)[-1]
    size = image_size(img)
    dims = f' width="{size[0]}" height="{size[1]}"' if size else ""
    chips = "".join(f'<span class="fv-cchip">{e(k)}</span>' for k in c["skills"])
    wa = "https://wa.me/919825771678?text=" + quote(f"Hi I would like to enquire about your {title} program")
    return f"""      <div class="fv-ccard">
        <img class="fv-cimg" src="{img}" alt="{e(title)}"{dims} loading="lazy" decoding="async">
        <div class="fv-cbody">
          <h3>{e(title)}</h3>
          <div class="fv-cmeta"><span>&#9201; {e(c['duration'])}</span><span>&#9656; {e(c['level'])}</span></div>
          <p>{e(c['desc'])}</p>
          <div class="fv-cchips">{chips}</div>
          <div class="fv-cfoot">
            <a class="fv-cview" href="/{c['link'].strip('/')}/" target="_blank" rel="noopener">View course &rarr;</a>
            <div class="fv-cact">
              <a class="fv-cwa" href="{wa}" target="_blank" rel="noopener" aria-label="Enquire on WhatsApp">{WA_ICON}</a>
              <a class="fv-cenq" href="/#enquiry">Enquire</a>
            </div>
          </div>
        </div>
      </div>"""


# --- shared page shell ---------------------------------------------------------

def shell(*, title, description, path, og_type, image, schema, body, extra_head=""):
    chrome = site_chrome()
    url = SITE + path
    img = SITE + image
    return f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{e(title)}</title>
<meta name="description" content="{e(description)}">
<link rel="canonical" href="{url}">
<meta property="og:type" content="{og_type}">
<meta property="og:title" content="{e(title)}">
<meta property="og:description" content="{e(description)}">
<meta property="og:url" content="{url}">
<meta property="og:image" content="{img}">
<meta property="og:image:alt" content="{ORG_NAME}, Surat">
<meta property="og:site_name" content="{ORG_NAME}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="{e(title)}">
<meta name="twitter:description" content="{e(description)}">
<meta name="twitter:image" content="{img}">
<meta name="theme-color" content="#0f2747">
<link rel="stylesheet" href="/assets/fv-site-chrome.css?v={chrome['css_v']}">
<link rel="stylesheet" href="/assets/fv-theme.css">
<link rel="stylesheet" href="/assets/fv-blog.css">
<script src="/fv-mob.js?v={chrome['mob']}"></script>
{extra_head}
<script type="application/ld+json">
{ld(schema)}
</script>
{ANALYTICS}
</head>
<body class="fv-blogpage">

<div class="fv-progress" id="fvProgress" aria-hidden="true"></div>

{chrome['header']}

<main class="fv-page fv-blog">
{body}
</main>

{chrome['footer']}

<div class="fv-sticky-cta">
  <span>Need help choosing a course?</span>
  <a href="https://wa.me/919825771678">WhatsApp us</a>
</div>

<script>
(function () {{
  var bar = document.getElementById('fvProgress');
  var toc = document.getElementById('fvToc');
  var links = [].slice.call(document.querySelectorAll('.fv-toc a'));

  // the shared header's Enrol button points at #enquiry, which only exists on the home page
  document.addEventListener('click', function (ev) {{
    var a = ev.target.closest && ev.target.closest('a[href="#enquiry"]');
    if (a) {{ ev.preventDefault(); location.href = '/#enquiry'; }}
  }});

  // contents list: open on desktop, collapsed on phone and tablet
  if (toc && window.matchMedia && !window.matchMedia('(min-width:1024px)').matches) {{
    toc.removeAttribute('open');
  }}

  // reading progress
  var ticking = false;
  function paint() {{
    var h = document.documentElement;
    var max = h.scrollHeight - h.clientHeight;
    bar.style.transform = 'scaleX(' + (max > 0 ? Math.min(h.scrollTop / max, 1) : 0) + ')';
    ticking = false;
  }}
  window.addEventListener('scroll', function () {{
    if (!ticking) {{ ticking = true; requestAnimationFrame(paint); }}
  }}, {{ passive: true }});
  paint();

  // highlight the section being read
  if ('IntersectionObserver' in window && links.length) {{
    var map = {{}};
    links.forEach(function (a) {{ map[a.getAttribute('href').slice(1)] = a; }});
    var io = new IntersectionObserver(function (entries) {{
      entries.forEach(function (en) {{
        if (en.isIntersecting && map[en.target.id]) {{
          links.forEach(function (a) {{ a.classList.remove('is-active'); }});
          map[en.target.id].classList.add('is-active');
        }}
      }});
    }}, {{ rootMargin: '-20% 0px -70% 0px' }});
    Object.keys(map).forEach(function (id) {{
      var el = document.getElementById(id);
      if (el) io.observe(el);
    }});
  }}
}})();
</script>
</body>
</html>
"""


def crumbs_html(items):
    """items: [(label, href or None)] — last one is the current page."""
    lis = []
    for i, (label, href) in enumerate(items):
        if href and i < len(items) - 1:
            lis.append(f'<li><a href="{href}">{e(label)}</a></li>')
        else:
            lis.append(f'<li aria-current="page">{e(label)}</li>')
    return '<nav class="fv-crumbs" aria-label="Breadcrumb">\n      <ol>\n        ' + "\n        ".join(lis) + "\n      </ol>\n    </nav>"


def crumbs_schema(items):
    out = []
    for i, (label, href) in enumerate(items, 1):
        node = {"@type": "ListItem", "position": i, "name": label}
        if href and i < len(items):
            node["item"] = SITE + href
        out.append(node)
    return {"@type": "BreadcrumbList", "itemListElement": out}


HOURS_SPEC = {
    "@type": "OpeningHoursSpecification",
    "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
    "opens": "10:00",
    "closes": "19:00",
}

BRANCHES = [
    {
        "@type": ["EducationalOrganization", "LocalBusiness"],
        "name": "Future Vision Computer Institute - Citylight",
        "telephone": "+919825771678",
        "address": {
            "@type": "PostalAddress",
            "streetAddress": "G-40, Navmangalam Complex, Opp. Agrasen Bhavan, Citylight",
            "addressLocality": "Surat",
            "addressRegion": "Gujarat",
            "postalCode": "395007",
            "addressCountry": "IN",
        },
        "geo": {"@type": "GeoCoordinates", "latitude": 21.1635452, "longitude": 72.7930476},
        "openingHoursSpecification": HOURS_SPEC,
    },
    {
        "@type": ["EducationalOrganization", "LocalBusiness"],
        "name": "Future Vision Computer Institute - Vesu",
        "telephone": "+919825771678",
        "address": {
            "@type": "PostalAddress",
            "streetAddress": "G-48-B, J9 High Street, Canal Road, Vesu",
            "addressLocality": "Surat",
            "addressRegion": "Gujarat",
            "postalCode": "395007",
            "addressCountry": "IN",
        },
        "geo": {"@type": "GeoCoordinates", "latitude": 21.1459196, "longitude": 72.7834767},
        "openingHoursSpecification": HOURS_SPEC,
    },
    {
        "@type": ["EducationalOrganization", "LocalBusiness"],
        "name": "Future Vision Computer Institute - Pal",
        "telephone": "+919825771678",
        "address": {
            "@type": "PostalAddress",
            "streetAddress": "115, Raj Victoria Complex, New Pal Lake Rd, near Galaxy Circle, Pal Gam",
            "addressLocality": "Surat",
            "addressRegion": "Gujarat",
            "postalCode": "395009",
            "addressCountry": "IN",
        },
        "geo": {"@type": "GeoCoordinates", "latitude": 21.1929034, "longitude": 72.7775435},
        "openingHoursSpecification": HOURS_SPEC,
    },
]

ORG_NODE = {
    "@type": ["EducationalOrganization", "LocalBusiness"],
    "@id": ORG_ID,
    "name": ORG_NAME,
    "alternateName": BRAND,
    "url": SITE + "/",
    "telephone": "+91-98257-71678",
    "logo": SITE + LOGO,
    "address": BRANCHES[0]["address"],
    "areaServed": {"@type": "City", "name": "Surat"},
    "geo": BRANCHES[0]["geo"],
    "openingHoursSpecification": HOURS_SPEC,
    "department": BRANCHES,
    "sameAs": SAME_AS,
}


# --- post page -----------------------------------------------------------------

def build_post(p, cats):
    cat = cats[p["category"]]
    path = f"/blog/{p['slug']}/"
    body_html = p["body"]

    # contents list from the body itself
    toc = []
    if 'id="answer"' in body_html:
        toc.append(("answer", "The short answer"))
    for hid, text in re.findall(r'<h2 id="([^"]+)">(.*?)</h2>', body_html, re.S):
        toc.append((hid, plain(text)))
    toc_html = "\n".join(f'          <li><a href="#{i}">{e(t)}</a></li>' for i, t in toc)

    # FAQ schema from the visible FAQ markup
    faq = []
    if 'class="fv-faq"' in body_html:
        region = body_html[body_html.index('class="fv-faq"'):]
        for q, a in re.findall(r"<h3>(.*?)</h3>\s*<p>(.*?)</p>", region, re.S):
            faq.append({"@type": "Question", "name": plain(q),
                        "acceptedAnswer": {"@type": "Answer", "text": plain(a)}})

    # author
    person = p.get("author_name")
    if person:
        author_node = {"@type": "Person", "name": person}
        if p.get("author_role"):
            author_node["jobTitle"] = p["author_role"]
        if p.get("author_url"):
            author_node["sameAs"] = [p["author_url"]]
        author_node["worksFor"] = {"@id": ORG_ID}
        byline_name = person
        avatar = "".join(w[0] for w in person.split()[:2]).upper()
        box_name = person + (f", {p['author_role']}" if p.get("author_role") else "")
        bio = p.get("author_bio") or DEFAULT_BIO
    else:
        author_node = {"@id": ORG_ID}
        byline_name, avatar = BRAND, "FV"
        box_name = f"Written by {BRAND}."
        bio = p.get("author_bio") or DEFAULT_BIO

    image = p.get("image") or LOGO
    post_node = {
        "@type": "BlogPosting",
        "@id": SITE + path + "#post",
        "headline": p["title"],
        "description": p["description"],
        "url": SITE + path,
        "mainEntityOfPage": SITE + path,
        "datePublished": p["date"],
        "dateModified": p["updated"],
        "inLanguage": "en-IN",
        "image": SITE + image,
        "articleSection": cat["name"],
        "publisher": {"@id": ORG_ID},
        "author": author_node,
    }
    if p["source"]:
        post_node["citation"] = [{"@type": "CreativeWork", "name": s[0], "url": s[1]} for s in p["source"] if len(s) > 1]

    crumbs = [("Home", "/"), ("Blog", "/blog/"), (cat["name"], f"/blog/category/{p['category']}/"), (p["title"], None)]
    graph = [ORG_NODE, post_node, crumbs_schema(crumbs)]
    if faq:
        graph.append({"@type": "FAQPage", "mainEntity": faq})
    schema = {"@context": "https://schema.org", "@graph": graph}

    sources_html = ""
    if p["source"]:
        items = "\n".join(f'          <li><a href="{e(s[1])}" rel="noopener">{e(s[0])}</a></li>' for s in p["source"] if len(s) > 1)
        sources_html = f"""
      <h2 id="sources">Sources</h2>
      <ul class="fv-sources">
{items}
      </ul>
"""
        toc.append(("sources", "Sources"))
        toc_html += f'\n          <li><a href="#sources">Sources</a></li>'

    author_html = ""
    if person:  # the byline already credits the institute; a bio box earns its place only for a named author
        author_html = f"""      <div class="fv-author">
        <span class="fv-avatar" aria-hidden="true">{e(avatar)}</span>
        <p><strong>{e(box_name)}</strong> {e(bio)}</p>
      </div>
"""
    related = ""
    courses = load_courses()
    picked = [courses[s] for s in p["courses"] if s in courses]
    missing = [s for s in p["courses"] if s not in courses]
    if missing:
        sys.exit(f"{p['slug']}: course(s) not found on the home page: {', '.join(missing)}")
    if picked:
        cards = "\n".join(course_card(c) for c in picked)
        related = f"""
<section class="fv-sec tint">
  <div class="fv-in">
    <span class="fv-eyebrow">Which course fits you?</span>
    <h2>Pick the course that matches your goal</h2>
    <p class="fv-pickdek">Every course below is taught in-centre in Surat, with AI built in. Look at the details and choose the one that fits where you are today.</p>
    <div class="fv-ccards">
{cards}
    </div>
  </div>
</section>
"""
    elif p["related"]:
        cards = "\n".join(
            f'      <a href="{e(r[0])}"><span class="fv-eyebrow">Course</span><strong>{e(r[1])}</strong>'
            f'<span class="fv-sub">{e(r[2] if len(r) > 2 else "")}</span></a>'
            for r in p["related"][:3])
        related = f"""
<section class="fv-sec tint">
  <div class="fv-in">
    <span class="fv-eyebrow">Keep going</span>
    <h2>Courses related to this topic</h2>
    <div class="fv-related">
{cards}
    </div>
  </div>
</section>
"""

    side = ""
    if p.get("cta_link"):
        side = f"""
      <div class="fv-side-card">
        <span class="fv-eyebrow">Learn it in Surat</span>
        <h3>{e(p.get('cta_title', 'See the course'))}</h3>
        <p>{e(p.get('cta_text', ''))}</p>
        <a class="fv-btn" href="{e(p['cta_link'])}">See the course</a>
      </div>"""

    body = f"""
<section class="fv-hero">
  <div class="fv-in">
    {crumbs_html(crumbs)}
    <a class="fv-chip" href="/blog/category/{p['category']}/">{e(cat['name'])}</a>
    <h1>{e(p['title'])}</h1>
    <p class="fv-dek">{p['dek']}</p>
    <div class="fv-byline">
      <span><span class="fv-avatar" aria-hidden="true">{e(avatar)}</span> <a href="{e(p.get('author_url') or LINKEDIN)}" rel="noopener" style="color:inherit">{e(byline_name)}</a></span>
      <span class="fv-dot" aria-hidden="true"></span>
      <span>Updated {long_date(p['updated'])}</span>
      <span class="fv-dot" aria-hidden="true"></span>
      <span>{e(p['readtime'])} min read</span>
    </div>
  </div>
</section>

<section class="fv-post">
  <div class="fv-post-grid">

    <aside class="fv-aside">
      <details class="fv-toc" id="fvToc" open>
        <summary>In this article</summary>
        <ol>
{toc_html}
        </ol>
      </details>
{side}
    </aside>

    <article class="fv-prose">

{body_html}
{sources_html}
{author_html}
    </article>
  </div>
</section>
{related}"""
    return shell(title=p["title"], description=p["description"], path=path, og_type="article",
                 image=image, schema=schema, body=body)


# --- listing pages ---------------------------------------------------------------

def card(p, cats):
    return f"""      <a class="fv-postcard" href="/blog/{p['slug']}/">
        <span class="fv-eyebrow">{e(cats[p['category']]['name'])}</span>
        <strong>{e(p['title'])}</strong>
        <span class="fv-sub">{e(p['description'])}</span>
        <span class="fv-when">{long_date(p['updated'])} &middot; {e(p['readtime'])} min read</span>
      </a>"""


def catnav(cats, posts, current):
    pills = [f'<a href="/blog/"{" class=\"is-on\"" if current is None else ""}>All</a>']
    for slug, c in cats.items():
        n = sum(1 for p in posts if p["category"] == slug)
        if n:
            on = ' class="is-on"' if slug == current else ""
            pills.append(f'<a href="/blog/category/{slug}/"{on}>{e(c["name"])} <span>{n}</span></a>')
    return '<nav class="fv-catnav" aria-label="Blog categories">' + "".join(pills) + "</nav>"


def listing(posts, cats, *, current=None):
    if current:
        c = cats[current]
        shown = [p for p in posts if p["category"] == current]
        path = f"/blog/category/{current}/"
        title = f"{c['name']} articles | Future Vision Computer Institute"
        desc = c["blurb"]
        h1, dek = c["name"], c["blurb"]
        crumbs = [("Home", "/"), ("Blog", "/blog/"), (c["name"], None)]
        kind = "CollectionPage"
    else:
        shown = posts
        path = "/blog/"
        title = "Blog | Future Vision Computer Institute, Surat"
        desc = ("Plain-English guides on Excel, Power BI, Python, data analytics, accounting, design and "
                "digital marketing from Future Vision trainers in Surat.")
        h1 = "The Feed"
        dek = "The Future Vision blog: straight answers to the questions students ask before they pick a course, written by the people who teach it."
        crumbs = [("Home", "/"), ("Blog", None)]
        kind = "Blog"

    cards = "\n".join(card(p, cats) for p in shown) or '      <p>New articles are on the way.</p>'
    node = {"@type": kind, "@id": SITE + path + "#page", "name": h1, "description": desc,
            "url": SITE + path, "inLanguage": "en-IN", "publisher": {"@id": ORG_ID}}
    if shown:
        node["blogPost" if kind == "Blog" else "hasPart"] = [
            {"@type": "BlogPosting", "headline": p["title"], "url": f"{SITE}/blog/{p['slug']}/",
             "datePublished": p["date"], "dateModified": p["updated"]} for p in shown]
    schema = {"@context": "https://schema.org", "@graph": [ORG_NODE, node, crumbs_schema(crumbs)]}

    body = f"""
<section class="fv-hero">
  <div class="fv-in">
    {crumbs_html(crumbs)}
    <h1>{e(h1)}</h1>
    <p class="fv-dek">{e(dek)}</p>
  </div>
</section>

<section class="fv-sec">
  <div class="fv-in">
    {catnav(cats, posts, current)}
    <div class="fv-postgrid">
{cards}
    </div>
  </div>
</section>
"""
    return path, shell(title=title, description=desc, path=path, og_type="website",
                       image=LOGO, schema=schema, body=body)


# --- sitemap and llms.txt ------------------------------------------------------------

def update_sitemap(posts, cats):
    sm = ROOT / "sitemap.xml"
    xml = sm.read_text(encoding="utf-8")
    xml = re.sub(r"\s*<url>\s*<loc>" + re.escape(SITE) + r"/blog/.*?</url>", "", xml, flags=re.S)
    newest = max([p["updated"] for p in posts] or [date.today().isoformat()])
    rows = [(f"{SITE}/blog/", newest, "weekly", "0.7")]
    for slug in cats:
        ps = [p for p in posts if p["category"] == slug]
        if ps:
            rows.append((f"{SITE}/blog/category/{slug}/", max(p["updated"] for p in ps), "weekly", "0.6"))
    rows += [(f"{SITE}/blog/{p['slug']}/", p["updated"], "monthly", "0.8") for p in posts]
    block = "".join(
        f"  <url>\n    <loc>{u}</loc>\n    <lastmod>{lm}</lastmod>\n"
        f"    <changefreq>{cf}</changefreq>\n    <priority>{pr}</priority>\n  </url>\n"
        for u, lm, cf, pr in rows)
    xml = xml.replace("</urlset>", block + "</urlset>")
    write(sm, xml)


def update_llms(posts, cats):
    f = ROOT / "llms.txt"
    txt = f.read_text(encoding="utf-8")
    txt = re.sub(r"## Blog\n.*?(?=\n## )", "", txt, flags=re.S)
    lines = ["## Blog", "",
             f"- [Blog home]({SITE}/blog/): Plain-English guides from the trainers at the institute."]
    for slug, c in cats.items():
        if any(p["category"] == slug for p in posts):
            lines.append(f"- [{c['name']} articles]({SITE}/blog/category/{slug}/): {c['blurb']}")
    for p in posts:
        lines.append(f"- [{p['title']}]({SITE}/blog/{p['slug']}/): {p['description']}")
    section = "\n".join(lines) + "\n"
    if "\n## About" in txt:
        txt = txt.replace("\n## About", "\n" + section + "\n## About", 1)
    else:
        txt = txt.rstrip("\n") + "\n\n" + section
    txt = re.sub(r"\n{3,}", "\n\n", txt)
    write(f, txt)


# --- quality check ---------------------------------------------------------------------

# Phrases that make copy read as boilerplate to readers, search engines and AI summarisers.
STOCK_PHRASES = [
    "in today's fast-paced", "in today’s fast-paced", "in the ever-evolving", "ever-evolving",
    "delve", "unlock the power", "game-changer", "game changer", "it's important to note",
    "it’s important to note", "in conclusion", "navigate the landscape", "tapestry",
    "dive into", "look no further", "embark on", "in the realm of", "seamlessly",
    "cutting-edge", "revolutionize", "elevate your", "harness the power", "whether you're a",
    "whether you’re a", "at the end of the day",
]


def check_post(p, cats):
    """Return [(level, message)]. FAIL blocks nothing but should be fixed before publishing."""
    out = []
    body = p["body"]
    text = plain(re.sub(r"<(script|style)[^>]*>.*?</\1>", "", body, flags=re.S))
    words = len(text.split())

    def add(level, msg):
        out.append((level, msg))

    n = len(p["title"])
    add("ok" if 25 <= n <= 62 else "warn", f"title length {n} (aim 25-62)")
    n = len(plain(p["description"]))
    add("ok" if 110 <= n <= 160 else "warn", f"meta description length {n} (aim 110-160)")

    m = re.search(r'id="answer"[^>]*>(.*?)</div>', body, re.S)
    if not m:
        add("fail", "no answer box (id=\"answer\") — the passage AI assistants quote")
    else:
        first = plain(re.split(r"</p>", m.group(1))[0])
        w = len(first.split())
        add("ok" if w <= 70 else "warn", f"answer box opens with {w} words (aim 70 or fewer)")

    h2 = len(re.findall(r"<h2 id=", body))
    add("ok" if h2 >= 3 else "warn", f"{h2} sections with anchors (aim 3+)")

    q = len(re.findall(r"<h3>", body[body.index('class="fv-faq"'):])) if 'class="fv-faq"' in body else 0
    add("ok" if q >= 4 else "warn", f"{q} FAQ questions (aim 4+, phrased the way people ask them)")

    links = {h for h in re.findall(r'href="(/[^"#]*)"', body) if not h.startswith("/blog/")}
    links |= {r[0] for r in p["related"]} | {"/" + s + "/" for s in p["courses"]}
    add("ok" if len(links) >= 3 else "warn", f"{len(links)} distinct course/site links (aim 3+)")

    add("ok" if words >= 700 else "warn", f"{words} words (aim 700+ for a real answer; length alone ranks nothing)")

    if p.get("author_name"):
        add("ok", f"named author: {p['author_name']}")
    else:
        add("ok", f"author: {BRAND} (organisation, linked to LinkedIn page)")

    if p["source"]:
        add("ok", f"{len(p['source'])} cited source(s)")
    else:
        add("warn", "no sources — link the official docs or data behind each factual claim")

    add("ok" if p.get("image") else "info", "custom image set" if p.get("image") else "no custom image (logo used for social previews)")

    low = text.lower()
    hits = sorted({s for s in STOCK_PHRASES if s in low})
    add("ok" if not hits else "warn", "no stock phrases" if not hits else "stock phrases to rewrite: " + ", ".join(hits))

    prose = plain(re.sub(r"<(table|ul|ol|script|style)\b.*?</\1>", " ", body, flags=re.S))
    sents = [s for s in re.split(r"(?<=[.!?])\s+", prose) if len(s.split()) > 2]
    if sents:
        longest = max(len(s.split()) for s in sents)
        avg = sum(len(s.split()) for s in sents) / len(sents)
        add("ok" if longest <= 40 and avg <= 22 else "warn",
            f"sentences: average {avg:.0f} words, longest {longest} (aim average under 22, none over 40)")

    if p["updated"] < p["date"]:
        add("fail", "updated date is earlier than the published date")
    return out


def report(posts, cats):
    icon = {"ok": "  ok  ", "warn": " WARN ", "fail": " FAIL ", "info": " info "}
    for p in posts:
        print(f"\n{p['slug']}")
        for level, msg in check_post(p, cats):
            print(f"  [{icon[level].strip():>4}] {msg}")


# --- main -----------------------------------------------------------------------------

def main():
    cats = json.loads((SRC / "categories.json").read_text(encoding="utf-8"))
    posts = [parse_post(f) for f in sorted((SRC / "posts").glob("*.html"))]
    posts.sort(key=lambda p: (p["updated"], p["date"]), reverse=True)
    slugs = [p["slug"] for p in posts]
    if len(slugs) != len(set(slugs)):
        sys.exit("duplicate slug")
    for p in posts:
        if p["category"] not in cats:
            sys.exit(f"{p['slug']}: unknown category '{p['category']}'")
        write(ROOT / "blog" / p["slug"] / "index.html", build_post(p, cats))

    path, page = listing(posts, cats)
    write(ROOT / "blog" / "index.html", page)
    for slug in cats:
        if any(p["category"] == slug for p in posts):
            path, page = listing(posts, cats, current=slug)
            write(ROOT / "blog" / "category" / slug / "index.html", page)

    update_sitemap(posts, cats)
    update_llms(posts, cats)
    print(f"built {len(posts)} post(s), {len({p['category'] for p in posts})} category page(s)")
    report(posts, cats)


if __name__ == "__main__":
    main()
