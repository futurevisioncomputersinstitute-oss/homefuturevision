#!/bin/sh
# Which commit is actually live? Run after triggering a Netlify deploy.
echo "local HEAD: $(git rev-parse --short HEAD)"
echo
echo "markers, oldest commit first:"
printf "  18:58 fees article (old path)   "
curl -s -o /dev/null -w "%{http_code}\n" --max-time 12 https://futurevisioncomputers.com/graphic-design-course-fees-surat/ 2>/dev/null
printf "  19:03 gbp-helper.html           "
curl -s -o /dev/null -w "%{http_code}\n" --max-time 12 https://futurevisioncomputers.com/gbp-helper.html 2>/dev/null
printf "  19:32 guides/ fees article      "
curl -s -o /dev/null -w "%{http_code}\n" --max-time 12 https://futurevisioncomputers.com/guides/graphic-design-course-fees-surat/ 2>/dev/null
echo
echo "200 on the last line = fully deployed."
echo "301 = that commit has not deployed yet."
echo
echo "sitemap knows the new path:"
curl -s --max-time 12 https://futurevisioncomputers.com/sitemap.xml 2>/dev/null | grep -c "guides/graphic-design" | sed 's/^/  /'
echo "  (1 = yes, 0 = old deploy still live)"
