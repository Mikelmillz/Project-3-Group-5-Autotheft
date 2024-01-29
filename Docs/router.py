import numpy as np

import sqlalchemy
from sqlalchemy.ext.automap import automap_base
from sqlalchemy.orm import Session
from sqlalchemy import create_engine, func

from flask import Flask, jsonify, render_template


#################################################
# Database Setup
#################################################
engine = create_engine("sqlite:///autotheft.db")

# reflect an existing database into a new model
Base = automap_base()
# reflect the tables
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
# Flask Route
@app.route("/")
def welcome():
    """List all available API routes."""
    return render_template('index.html')

    #     f"Available Routes:<br/>"
    #     f"/api/v1.0/neighborhood<br/>"
    #     f"/api/v1.0/autotheft_tb"
    # )

@app.route("/api/v1.0/neighborhood")
def neighborhood():
    # Create our session (link) from Python to the DB
    session = Session(engine)

    """Return a list of all autotheft neighborhood"""
    # Query all autotheft
    results = session.query(AutoTheftTable.neighborhood).all()

    session.close()

    # Convert list of tuples into normal list
    all_neighborhood = list(np.ravel(results))

    return jsonify(all_neighborhood)

@app.route("/api/v1.0/autotheft_tb")
def autotheft_tb():
    # Create our session (link) from Python to the DB
    session = Session(engine)

    """Return a list of autotheft data"""
    # Query all autotheft
    results = session.query(AutoTheftTable.publicaddress, AutoTheftTable.caseNumber, AutoTheftTable.precinct,
                            AutoTheftTable.reportedDate, AutoTheftTable.reportedDateTime, AutoTheftTable.offense,
                            AutoTheftTable.description, AutoTheftTable.centerLong, AutoTheftTable.centerLat,
                            AutoTheftTable.centerX, AutoTheftTable.centerY, AutoTheftTable.neighborhood).all()

    session.close()

    # Create a list of dictionaries from the query results
    all_autotheft = []
    for row in results:
        autotheft_dict = {}
        autotheft_dict["publicaddress"] = row.publicaddress
        autotheft_dict["caseNumber"] = row.caseNumber
        autotheft_dict["precinct"] = row.precinct
        autotheft_dict["reportedDate"] = row.reportedDate
        autotheft_dict["reportedDateTime"] = row.reportedDateTime
        autotheft_dict["offense"] = row.offense
        autotheft_dict["description"] = row.description
        autotheft_dict["centerLong"] = row.centerLong
        autotheft_dict["centerLat"] = row.centerLat
        autotheft_dict["centerX"] = row.centerX
        autotheft_dict["centerY"] = row.centerY
        autotheft_dict["neighborhood"] = row.neighborhood
        all_autotheft.append(autotheft_dict)

    return jsonify(all_autotheft)

if __name__ == '__main__':
    app.run(debug=True)


