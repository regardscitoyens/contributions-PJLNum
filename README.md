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
pip install requests
```

## Run with:

```bash
./scrap.py
```
