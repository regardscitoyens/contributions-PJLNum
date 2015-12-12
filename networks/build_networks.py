#!/usr/bin/env python
# -*- coding: utf-8 -*-

import os, json
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
        votedContribs = []
        for c in u['votes_pro']:
            contrib = contributions[c]
            add_node(G, c, label=contributions[c]["name"], total_votes=contributions[c]["votes_total"], type=contributions[c]["type"], author=contributions[c]["author"], url=contributions[c]['url'], section = contributions[c]['section'], votes_pro=contributions[c]['votes_pro'], votes_against=contributions[c]['votes_against'], votes_unsure=contributions[c]['votes_unsure'])
            for c2 in votedContribs:
                add_edge(G, c, c2)
            votedContribs.append(c)
    nx.write_gexf(G, filename)

def build_users_network(users, contributions, filename):
    pass

def build_users_contribs_network(users, contributions, filename):
    pass


if __name__ == "__main__":
    with open(os.path.join("data", "users.json")) as f:
        users = json.load(f)
    with open(os.path.join("data", "contributions.json")) as f:
        contributions = json.load(f)
    build_contribs_network(users, contributions, os.path.join("data", "contributions.gexf"))
