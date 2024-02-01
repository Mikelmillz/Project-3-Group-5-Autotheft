import numpy as np
import sqlalchemy
from sqlalchemy.ext.automap import automap_base
from sqlalchemy.orm import Session
from sqlalchemy import create_engine, func
from flask import Flask, jsonify, render_template
import json

#################################################
# Database Setup
#################################################
engine = create_engine("sqlite:///autotheft.db")

# Reflect an existing database into a new model
Base = automap_base()
# Reflect the tables
Base.prepare(autoload_with=engine)

# Save reference to the table
AutoTheftTable = Base.classes.autotheft_tb

#################################################
# Flask Setup
#################################################
app = Flask(__name__)

#################################################
# Flask Routes
#################################################
@app.route("/")
def welcome():
    """List all available API routes."""
    return render_template('index.html')

@app.route("/api/v1.0/neighborhood")
def neighborhood():
    # Create our session (link) from Python to the DB
    session = Session(engine)

    try:
        # Query all autotheft neighborhoods
        results = session.query(AutoTheftTable.neighborhood).distinct().all()
        
        # Convert list of tuples into normal list
        all_neighborhood = [result[0] for result in results]

        return jsonify(all_neighborhood)
    finally:
        session.close()

@app.route("/api/v1.0/precincts")
def precincts_areas():
    # Create our session (link) from Python to the DB
    with open("Resources/Minneapolis_Police_Precincts.geojson") as e:
        c = json.load(e)
        return c

@app.route("/api/v1.0/neighborhoods")
def neighborhood_areas():
    # Create our session (link) from Python to the DB
    with open("Resources\Minneapolis_Neighborhoods.geojson") as f:
        d = json.load(f)
        return d

@app.route("/api/v1.0/autotheft_tb")
def autotheft_tb():
    # Create our session (link) from Python to the DB
    session = Session(engine)

    try:
        # Query autotheft data with counts by neighborhood
        results = session.query(
            AutoTheftTable
        ).all()

        all_autotheft = []
        for row in results:
            autotheft_dict = {
                "latitude": row.centerLat,
                "longitude": row.centerLong,
                "time": row.reportedDateTime,
                "date": row.reportedDate
            }
            all_autotheft.append(autotheft_dict)

        return jsonify(all_autotheft)
    finally:
        session.close()

if __name__ == '__main__':
    app.run(debug=True)




