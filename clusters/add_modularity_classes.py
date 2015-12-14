#!/usr/bin/env python
# -*- coding: utf-8 -*-

import os, sys
import csv, json

users_communities = {
  1: "Citoyens & Gouvernement",
  10: "Jeux vidéos",
  8: "OpenData & OpenAccess",
  26: "Neutralité du Net",
  4: "Logiciels libres",
  2: "Electrosensibilité",
  25: "Accessibilité",
  18: "Dons SMS",
  27: "Propriété intellectuelle"
}
map_users = lambda x: users_communities[x] if x in users_communities else "Divers"
with open(os.path.join("clusters", "users_GephiModularity.csv")) as f:
    users = dict((int(row['Id']), map_users(int(row['Modularity Class']))) for row in csv.DictReader(f))
with open("web/data/users_supporters.json") as f:
    data = json.load(f)
    for node in data["nodes"]:
        node["community"] = users[node["id"]]
with open("web/data/users_supporters.json", "w") as f:
    json.dump(data, f)

contributions_communities = {
  7: "Citoyen",
  2: "Institutionnel",
  5: "Associatif",
  13: "Recherche",
  9: "Propriété intellectuelle",
  1: "Archives",
  4: "Accessibilité"
}
map_contr = lambda x: contributions_communities[x] if x in contributions_communities else "Divers"
with open(os.path.join("clusters", "contributions_GephiModularity.csv")) as f:
    contributions = dict((row['Id'], map_contr(int(row['Modularity Class']))) for row in csv.DictReader(f))
with open("web/data/propositions_covoted5+.json") as f:
    data = json.load(f)
    for node in data["nodes"]:
        node["community"] = contributions[node["id"]]
with open("web/data/propositions_covoted5+.json", "w") as f:
    json.dump(data, f)

