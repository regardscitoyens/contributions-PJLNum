# Consultation PJLNum

## Install:

Pull the contributions metadata from [Etalab's repository](https://git.framasoft.org/etalab/opinions-republique-numerique):

```bash
git submodule init
git submodule update
# Complete the missing amendement
cp data/opinion-61_version-190.json data-contributions/opinion-61/version-190.json
```

Install the python dependencies (in your choice of sudo or virtualenv):

```bash
pip install requests networkx
```

## Run:

```bash
# Scrap all data from the website
# takes a few hours, unnecessaray since the scraped data is included in the data directory
./scrap/scrap.py

# Build GEXF networks
./networks/build_networks.py
# Build lighter networks by filtering low linkage
for i in `seq 1 9`; do
  grep -v 'weight="[0-'$i']"' data/contributions.gexf > data/contributions-w$(($i+1))+.gexf
done

```
