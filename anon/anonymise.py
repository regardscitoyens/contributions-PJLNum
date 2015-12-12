import csv
import sys
import json
import random
import md5
sans_identifiant = 0
salt = str(random.random())

has_to_be_public = {}

with open(sys.argv[1], 'r') as csvfileread:
    csvreader = csv.reader(csvfileread, delimiter=',', quotechar='"')
    for row in csvreader:
        if (row[3] == ""):
            row[3] = "Citoyen"
        if (row[7] == "Proposition") or (row[7] == "Amendement") or (row[3] != "Citoyen"):
            has_to_be_public[row[2]] = True

with open(sys.argv[1], 'r') as csvfileread:
    with open(sys.argv[2], 'w') as csvfilewrit:
        csvreader = csv.reader(csvfileread, delimiter=',', quotechar='"')
        csvwriter = csv.writer(csvfilewrit, delimiter=',', quotechar='"')
        for row in csvreader:
            row.append("Real identifiant")
            row.append("Id anonymise de l'Auteur md5")
            row.append("Id anonymise de l'Auteur int")
            csvwriter.writerow(row)
            break;
        for row in csvreader:
            if (not row[0]):
                row[0] = str(sans_identifiant)
                sans_identifiant += 1
            row[10] = json.dumps(row[10])
            row.append(row[7]+' "'+row[0]+'"')
            idmd5 = md5.new(row[1]+row[2]+salt).hexdigest()
            row.append(idmd5)
            row.append(int(idmd5[:8], 16))
            if not (row[2] in has_to_be_public):
                row[1] = ""
                row[2] = ""
            if (row[3] == ""):
                row[3] = "Citoyen"
            csvwriter.writerow(row)


