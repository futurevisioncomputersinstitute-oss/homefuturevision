#!/bin/sh
# Run this after the GoDaddy change. Tells you plainly whether it worked.
echo "--- where the domain points ---"
nslookup futurevisioncomputers.com 8.8.8.8 2>/dev/null | grep -i "^Address" | tail -4
echo
echo "--- still on GitHub Pages? ---"
if nslookup futurevisioncomputers.com 8.8.8.8 2>/dev/null | grep -q "185.199"; then
  echo "  YES - change has not taken effect yet, or was not saved"
else
  echo "  NO  - now on Netlify"
fi
echo
echo "--- EMAIL still configured? (must say secureserver) ---"
nslookup -type=MX futurevisioncomputers.com 8.8.8.8 2>/dev/null | grep -i "mail exchanger" || echo "  *** NO MX RECORDS - EMAIL IS BROKEN, restore them at GoDaddy ***"
echo
echo "--- do the pages load? ---"
for p in / /ai-course-surat/ /web-development-course-surat/ /graphic-design-courses/; do
  printf "  %-34s %s\n" "$p" "$(curl -s -o /dev/null -w '%{http_code}' https://futurevisioncomputers.com$p 2>/dev/null)"
done
echo
echo "--- is a recovered blog redirect working? ---"
curl -s -o /dev/null -w "  old CorelDRAW article -> %{redirect_url} (%{http_code})\n" \
  "https://futurevisioncomputers.com/should-i-learn-coreldraw-or-adobe-illustrator-in-2020/" 2>/dev/null
