#!/usr/bin/env python
# -*- coding: utf-8 -*-

import os, sys, re
import json, requests

def buildUrl(url):
    if not url.startswith("http"):
        url = "http://www.republique-numerique.fr/%s" % url.lstrip("/")
    return url

def buildCache(url):
    url = url.replace("http://www.republique-numerique.fr/", "")
    return url.replace("/", "___")

def download(url):
    url = buildUrl(url)
    if not os.path.isdir(".cache"):
        os.makedirs(".cache")
    page = buildCache(url)
    fil = os.path.join(".cache", page)
    if not os.path.exists(fil):
        print url, "->", page
        data = requests.get(url).content
        with open(fil, "w") as f:
            f.write(data)
    else:
        with open(fil) as f:
            data = f.read()
    return data.decode("utf-8")

re_profiles = re.compile(r'href="/profile/([^"]+)"', re.I)
re_nextpage = re.compile(ur'href="(/projects/projet-de-loi-numerique/participants/\d+)" aria-label="Aller à la page suivante', re.I)
def processList(page, doneUsers=[]):
    content = download(page)
    for u in set(re_profiles.findall(content)):
        processUser(u, doneUsers)
    nextp = re_nextpage.search(content)
    return (nextp.group(1) if nextp else None, doneUsers)

re_clean_lines = re.compile(r'[\n\r]+', re.M)
re_clean_spaces = re.compile(r'\s+')
cleaner = lambda x: re_clean_spaces.sub(' ', re_clean_lines.sub(' ', x))
meta_regexps = {
  "name": re.compile(r'<h1 class="profile__name">([^<]+?)</h1>', re.I),
  "type": re.compile(r'<li><i class="cap cap-connection-2-1"></i>([^<]+?)</li>', re.I),
  "geoloc": re.compile(r'<li><i class="cap cap-marker-1"></i>([^<]+?)</li>', re.I),
  "description": re.compile(r'</h1>\s*<p>(.*?)</p>', re.I),
  "website": re.compile(r'<li><i class="cap cap-link-1"></i>\s*<a class="external-link" href="([^"]+?)">', re.I),
  "twitter": re.compile(r'<li><i class="cap cap-twitter-1"></i>\s*<a class="external-link" href="([^"]+?)">', re.I),
  "facebook": re.compile(r'<li><i class="cap cap-facebook-1"></i>\s*<a class="external-link" href="([^"]+?)">', re.I)
}
extra_regexps = [
  ("date_inscription", re.compile(r'<li><i class="cap cap-calendar-1"></i>\s*Inscrit depuis le (\d+)/(\d+)/(\d+)\s*</li>', re.I), lambda x: "%s-%s-%s" % (x.group(3), x.group(2), x.group(1))),
  ("picture", re.compile(r'<img title[^>]*? src="(/media/cache/default_profile/[^"]+)"[\s/]*>', re.I), lambda x: buildUrl(x.group(1)))
]
def processUser(userId, doneUsers):
    if userId in doneUsers:
        return
    content = cleaner(download("/profile/%s" % userId))
    user = {}
    for key, reg in meta_regexps.items():
        res = reg.search(content)
        user[key] = res.group(1).strip() if res else None
    for key, reg, lmbda in extra_regexps:
        res = reg.search(content)
        user[key] = lmbda(res) if res else None
    doneUsers.append(userId)

if __name__ == "__main__":
    nextPage, doneUsers = processList("/projects/projet-de-loi-numerique/participants")
    while nextPage:
        nextPage, doneUsers = processList(nextPage, doneUsers)

    #with open(os.path.join("data", "data.json"), 'w') as f:
    #    json.dump(users, f)
    #with open(os.path.join("data", "data.csv"), 'w') as f:
    #    print >> f, format_csvline(headers)
    #    for a in animes.values():
    #        print >> f, format_csvline([a[h] if h in a else "" for h in headers])

