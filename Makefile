all: data/2015-11-30_projet-de-loi-numerique_consultation.anon.csv

data/2015-11-30_projet-de-loi-numerique_consultation.anon.csv: data/2015-11-30_projet-de-loi-numerique_consultation.csv
	python anon/anonymise.py data/2015-11-30_projet-de-loi-numerique_consultation.csv data/2015-11-30_projet-de-loi-numerique_consultation.anon.csv
	
