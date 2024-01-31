// Get the autotheft data from Flask route
const capsules = "/api/v1.0/autotheft_tb";

// Set up Leaflet map
var map = L.map('map').setView([44.9778, -93.2650], 12);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
}).addTo(map);

// Fetch the JSON data and create the heatmap
d3.json(capsules).then(function(data) {
    // Normalize the counts to get an incidence rate per neighborhood
    var heatData = data.map(point => [point.latitude, point.longitude]);

    console.log(data[0]);

    // Create and add the heatmap layer
    var heat = L.heatLayer(heatData, { radius: 20 }).addTo(map);
});

// Fetch the GeoJSON data for police precincts
const precincts = "/api/v1.0/precincts";

var geojsonPrecincts; // Declare a variable for the precincts GeoJSON layer
var geojsonNeighborhoods; // Declare a variable for the neighborhoods GeoJSON layer

d3.json(precincts).then(function(data) {
    console.log(data);

    // Assuming your GeoJSON has a MultiPolygon geometry
    geojsonPrecincts = L.geoJSON(data, {
        style: {
            color: "blue",
            fillColor: "blue",
            fillOpacity: 0.5
        }
    });

    // Don't add the precincts layer to the map initially
});

const neighborhoods = "/api/v1.0/neighborhoods";

d3.json(neighborhoods).then(function(data) {
    console.log(data);

    // Assuming your GeoJSON has a MultiPolygon geometry
    geojsonNeighborhoods = L.geoJSON(data, {
        style: {
            color: "red",
            fillColor: "red",
            fillOpacity: 0.5
        }
    });

    // Add the neighborhoods layer to the map initially
    geojsonNeighborhoods.addTo(map);

    // Add a control layer for switching between layers
    var baseMaps = {
        "Neighborhoods": geojsonNeighborhoods,
        "Precincts": geojsonPrecincts
    };

    L.control.layers(null, baseMaps).addTo(map);
});

// ... (rest of the code)