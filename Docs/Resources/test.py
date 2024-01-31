import json

with open("Minneapolis_Neighborhoods.geojson") as f:
    d = json.load(f)
    print(d.keys())