#!/usr/bin/env python
# -*- coding: utf-8 -*-

import os, sys, re
import csv, json
import networkx as nx

def add_node(graph, node, **args):
    if graph.has_node(node) and not "occurences" in args:
        graph.node[node]['occurences'] += 1
    else:
        if not "label" in args:
            args["label"] = node
        if not "occurences" in args:
            args["occurences"] = 1
        graph.add_node(node, **args)

def add_edge(graph, node1, node2, weight=1):
    if graph.has_edge(node1, node2):
        graph[node1][node2]['weight'] += weight
    else:
        graph.add_edge(node1, node2, weight=weight)

def build_contribs_network(users, contributions, filename):
    G = nx.Graph()
    for u in users.values():
      for typevot in ["pro", "against", "unsure"]:
        votedContribs = []
        for c in u['votes_%s' % typevot]:
            contrib = contributions[c]
            aut_type = users[contributions[c]["author"]]["type"]
            if not aut_type:
                aut_type = u"Indéfini"
            add_node(G, c, label=contributions[c]["name"], total_votes=contributions[c]["votes_total"], type=contributions[c]["type"], author=contributions[c]["author"], url=contributions[c]['url'], section=contributions[c]['section'], votes_pro=contributions[c]['votes_pro'], votes_against=contributions[c]['votes_against'], votes_unsure=contributions[c]['votes_unsure'], type_source=aut_type)
            for c2 in votedContribs:
                add_edge(G, c, c2)
            votedContribs.append(c)
    nx.write_gexf(G, filename)

def build_users_network(users, contributions, filename):
    G = nx.DiGraph()
    for u in users.values():
        if not u['type']:
            u['type'] = u"Indéfini"
        add_node(G, u["id"], label=u["name"], total_contributions=u["contributions_total"], total_votes=u["votes_total"], type=u["type"], url=u['url'], votes_pro=u['votes_pro_total'], votes_against=u['votes_against_total'], votes_unsure=u['votes_unsure_total'])
    for u in users.values():
        for v in u['votes_pro']:
            add_edge(G, u["id"], contributions[v]["author"])
    for u in users:
        if not G.degree(u):
            G.remove_node(u)
    nx.write_gexf(G, filename)

def build_users_contribs_network(users, contributions, filename):
    pass

re_clean_link = re.compile(r'^(.).*"(\d+)"')
def load_full_data(filepointer):
    users = {}
    contributions = {}
    for row in csv.DictReader(filepointer):
        uid = int(row["Id anonymise de l'Auteur int"])
        if uid not in users:
            users[uid] = {
                "id": uid,
                "name": row["Auteur"].decode('utf-8'),
                "type": row["Type de profil"].decode('utf-8'),
                "url": "",
                "contributions_total": 0,
                "propositions_total": 0,
                "modifications_total": 0,
                "votes_total": 0,
                "votes_pro_total": 0,
                "votes_against_total": 0,
                "votes_unsure_total": 0,
                "votes_pro": [],
                "votes_against": [],
                "votes_unsure": []
            }
        if row["Type de contenu"] in ["Proposition", "Modification"]:
            typecontr = row["Type de contenu"].lower().decode('utf-8')
            contrid = "%s%s" % (typecontr[0], int(row["Identifiant"]))
            users[uid]["contributions_total"] += 1
            users[uid]["%ss_total" % typecontr] += 1
            contributions[contrid] = {
                "id": contrid,
                "type": typecontr,
                "name": row["Titre"].decode('utf-8'),
                "author": uid,
                "authorName": row["Auteur"].decode('utf-8'),
                "votes_total": 0,
                "votes_pro": 0,
                "votes_against": 0,
                "votes_unsure": 0,
                "url": "",
                "parent": "",
                "section": ""
            }
        elif row["Type de contenu"] == "Vote":
            idcontr = re_clean_link.sub(r"\1\2", row["Lié à :"]).lower()
            # keep only votes on propositions & modifications
            if not idcontr[0] in ["p", "m"]:
                continue
            typevote = row["Catégorie"].lower().replace("pour", "pro").replace("contre", "against").replace("mitigé", "unsure")
            users[uid]["votes_total"] += 1
            users[uid]["votes_%s_total" % typevote] += 1
            users[uid]["votes_%s" % typevote].append(idcontr)
    for uid, user in users.items():
        if not user["type"]:
            user["type"] = "Citoyen"
        if user["type"] == "Citoyen" and not user["contributions_total"]:
            user["name"] = ""
    return users, contributions

if __name__ == "__main__":
    # Run code for old data on python build_networks.py 1
    if len(sys.argv) > 1:
        with open(os.path.join("data", "users.json")) as f:
            users = json.load(f)
        with open(os.path.join("data", "contributions.json")) as f:
            contributions = json.load(f)
        build_contribs_network(users, contributions, os.path.join("data", "contributions.gexf"))
        build_users_network(users, contributions, os.path.join("data", "users.gexf"))
    else:
        with open(os.path.join("data", "2015-11-30_projet-de-loi-numerique_consultation.anon.csv")) as f:
            users, contributions = load_full_data(f)
        build_contribs_network(users, contributions, os.path.join("data", "contributions.gexf"))
        build_users_network(users, contributions, os.path.join("data", "users.gexf"))

