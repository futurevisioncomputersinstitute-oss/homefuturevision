#!/usr/bin/env python3
"""Set the site header nav order on every page.

    python tools/patch-header-nav.py            # dry run, prints what would change
    python tools/patch-header-nav.py --write    # apply

Target order:  Courses | Why us | Reviews | Centres | <BLOG_LABEL> | Services | phone | Enrol Now

Bundle pages (course pages, home, about, services) carry the header three times:
  1. the static markup,
  2. the static mobile-menu snapshot (#fv-mob-links),
  3. the escaped copy inside <script type="__bundler/template"> that the browser re-renders from.
All three are patched. "Services" is added at runtime by fv-mob.js right after the last nav link,
so it lands after the blog link without any change to the JS.

Hand-built pages (class="fv-head") get the same links in their own <nav>.

Change BLOG_LABEL and re-run with --write to rename the link everywhere.
"""
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
BLOG_LABEL = "The Feed"
BLOG_HREF = "/blog/"

SKIP = {  # unpublished / trial pages (see _config.yml exclude)
    "basic-graphic-designing", "graphic-foundations", "advanced-graphic-designing",
    "advanced-design-advertisement", "cinematic-reels-ai-invites", "pal-branch-offer",
    "data-analytics-preview", "node_modules", "blog-src", "tools", ".git", ".claude",
}

A_CLOSE = r"<\\u002Fa>"  # the escaped "</a>" inside the bundler template


def patch_bundle(t, counts):
    def sub(pattern, repl, text, key, flags=0):
        new, n = re.subn(pattern, repl, text, flags=flags)
        counts[key] = counts.get(key, 0) + n
        return new

    # 1. drop "Our edge" from the header (static, mobile snapshot, template)
    t = sub(r"<a\b[^>]*>Our edge</a>", "", t, "edge")
    t = sub(r"<a\b(?:(?!" + A_CLOSE + r").)*?>Our edge" + A_CLOSE, "", t, "edge_tpl")

    # 2. drop the old "About us" / external "Blogs" links that follow Centres in the header
    t = sub(r'(>Centres</a>)<a href="/about-future-vision-computer-institute/"[^>]*>About us</a>', r"\1", t, "about")
    t = sub(r'<a href="https://blog\.futurevisioncomputers\.com/category/case-studies/"[^>]*>Blogs</a>', "", t, "oldblog")

    # 3. add the blog link right after Centres, cloned from it
    already = f'>{BLOG_LABEL}</a>' in t and f'href="{BLOG_HREF}"' in t

    def clone_plain(m):
        attrs = re.sub(r'href="[^"]*"', f'href="{BLOG_HREF}"', m.group(1))
        attrs = re.sub(r'\s*data-dc-tpl="\d+"', "", attrs)
        return m.group(0) + f"<a{attrs}>{BLOG_LABEL}</a>"

    def clone_tpl(m):
        attrs = re.sub(r'href=\\"[^"\\]*\\"', f'href=\\\\"{BLOG_HREF}\\\\"', m.group(1))
        return m.group(0) + "\\n        <a" + attrs + ">" + BLOG_LABEL + "<\\u002Fa>"

    if not already:
        t, n = re.subn(r"<a\b([^>]*#centers[^>]*)>Centres</a>", clone_plain, t)
        counts["blog_plain"] = counts.get("blog_plain", 0) + n
        t, n = re.subn(r"<a\b((?:(?!" + A_CLOSE + r").)*?#centers(?:(?!" + A_CLOSE + r").)*?)>Centres" + A_CLOSE, clone_tpl, t)
        counts["blog_tpl"] = counts.get("blog_tpl", 0) + n

    # 4. mobile snapshot: put Services after the blog link, before the phone link
    def add_services(m):
        return m.group(1) + '<a href="/services/">Services</a>' + m.group(2)
    t, n = re.subn(
        r'(<a href="' + re.escape(BLOG_HREF) + r'">' + re.escape(BLOG_LABEL) + r'</a>)(?!<a href="/services/">)(<a href="tel:\+919825771678" class="fv-phone-link">)',
        add_services, t)
    counts["mob_services"] = counts.get("mob_services", 0) + n
    return t


HAND_NAV = f"""<nav>
      <a href="/#courses">Courses</a>
      <a href="/#why">Why us</a>
      <a href="/#reviews">Reviews</a>
      <a href="/#centers">Centres</a>
      <a href="{BLOG_HREF}">{BLOG_LABEL}</a>
      <a href="/services/">Services</a>
      <a class="fv-btn-sm" href="https://wa.me/919825771678">Free Counselling</a>
    </nav>"""


def patch_hand(t, counts):
    new, n = re.subn(r'(<header class="fv-head">.*?)<nav>.*?</nav>', lambda m: m.group(1) + HAND_NAV, t, count=1, flags=re.S)
    counts["hand_nav"] = counts.get("hand_nav", 0) + n
    return new


def main():
    write = "--write" in sys.argv
    files = [ROOT / "index.html"]
    for d in sorted(ROOT.iterdir()):
        if d.is_dir() and d.name not in SKIP and not d.name.startswith("."):
            files += sorted(d.glob("**/index.html"))
    changed = 0
    for f in files:
        rel = f.relative_to(ROOT).as_posix()
        if rel.startswith("blog/") or rel.startswith("guides/"):
            continue  # generated / hand-built pages handled below
        with open(f, encoding="utf-8", newline="") as fh:  # keep the file's own line endings
            raw = fh.read()
        counts = {}
        if 'class="fv-head"' in raw:
            new = patch_hand(raw, counts)
        elif "#centers" in raw:
            new = patch_bundle(raw, counts)
        else:
            print(f"  skip   {rel} (no header found)")
            continue
        if new != raw:
            changed += 1
            print(f"  {'write' if write else 'would'}  {rel}  {counts}")
            if write:
                with open(f, "w", encoding="utf-8", newline="") as fh:
                    fh.write(new)
        else:
            print(f"  same   {rel}")
    print(f"\n{changed} file(s) {'changed' if write else 'would change'}")


if __name__ == "__main__":
    main()
