// Get the autotheft data from Flask route
const capsules = "/api/v1.0/autotheft_tb";
// Fetch the GeoJSON data for police precincts
const precincts = "/api/v1.0/precincts";
// Fetch the GeoJSON data for neighborhoods
const neighborhoods = "/api/v1.0/neighborhoods";

var map = L.map('map').setView([44.9778, -93.2650], 12);
var markers = L.markerClusterGroup(); // Move this outside the d3.json callback

var geojsonPrecincts, geojsonNeighborhoods; // Declare as global variables

// Fetch the JSON data and create the heatmap
d3.json(capsules).then(function (data) {
    // Set up Leaflet map
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    // Normalize the counts to get an incidence rate per neighborhood
    var heatData = data.map(point => [point.latitude, point.longitude]);

    // Create a custom icon for the car image
    var carIcon = L.icon({
        iconUrl: 'https://cdn1.iconfinder.com/data/icons/unicons-line-vol-2/24/car-sideview-512.png', 
        iconSize: [32, 32], // Adjust the size of the icon 
        iconAnchor: [16, 32],
        popupAnchor: [0, -32]
    });

    // Create markers with custom car icon and add to MarkerClusterGroup
    heatData.forEach(function (point) {
        var marker = L.marker(new L.LatLng(point[0], point[1]), { icon: carIcon });
        markers.addLayer(marker);
        console.log('Marker added:', point);
    });

    // Add MarkerClusterGroup to the map
    map.addLayer(markers);

    // Create and add the heatmap layer
    var heat = L.heatLayer(heatData, {
        radius: 10,
        opacity: 0.7,
        blur: 15,
        maxZoom: 15
    }).addTo(map);
});

// Fetch the GeoJSON data for police precincts
d3.json(precincts).then(function(data) {
    console.log(data);
    // Assuming your GeoJSON has a MultiPolygon geometry
    geojsonPrecincts = L.geoJSON(data, {
        style: {
            color: "blue",
            fillColor: "blue",
            fillOpacity: 0.1,
            opacity: 0.3
        }
    }).addTo(map);
});

// Fetch the GeoJSON data for neighborhoods
d3.json(neighborhoods).then(function(data) {
    console.log(data);
    // Assuming your GeoJSON has a MultiPolygon geometry
    geojsonNeighborhoods = L.geoJSON(data, {
        style: {
            color: "red",
            fillColor: "red",
            fillOpacity: 0.1,
            opacity: 0.3
        }
    }).addTo(map);

    // Add a control layer for switching between layers
    var baseMaps = {
        "Neighborhoods": geojsonNeighborhoods,
        "Precincts": geojsonPrecincts
    };
    L.control.layers(null, baseMaps).addTo(map);
});
