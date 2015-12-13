#!/usr/bin/env python
# -*- coding: utf-8 -*-

import os, sys, json
from build_networks import load_full_data

with open(os.path.join("data", "2015-11-30_projet-de-loi-numerique_consultation.anon.csv")) as f:
    users, contributions = load_full_data(f)

with open("web/data/users_supporters.json") as f:
    data = json.load(f)
    for node in data["nodes"]:
        if int(node["attributes"]["total_contributions"]) and not node["label"]:
            nid = node["id"]
            if not users[nid]["name"]:
                print >> sys.stderr, "WARNING: user %s with %s contribs still looks anon" % (nid, node["attributes"]["total_contributions"]), users[nid]
                continue
            node["label"] = users[nid]["name"]
with open("web/data/users_supporters.new.json", "w") as f:
    data = json.dump(data, f)


with open("web/data/propositions_covoted5+.json") as f:
    data = json.load(f)
    for node in data["nodes"]:
        if not node["attributes"]["authorName"]:
            nid = node["id"]
            if not contributions[nid]["authorName"]:
                print >> sys.stderr, "WARNING: contr %s still has anon author" % nid, contributions[nid]
                continue
            node["attributes"]["authorName"] = contributions[nid]["authorName"]
with open("web/data/propositions_covoted5+.new.json", "w") as f:
    data = json.dump(data, f)

