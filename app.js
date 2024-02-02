// Get the autotheft data from Flask route
const capsules = "/api/v1.0/autotheft_tb";
// Fetch the GeoJSON data for police precincts
const precincts = "/api/v1.0/precincts";
// Fetch the GeoJSON data for neighborhoods
const neighborhoods = "/api/v1.0/neighborhoods";

var map = L.map('map').setView([44.9778, -93.2650], 12);
var markers = L.markerClusterGroup(); // Move this outside the d3.json callback

var geojsonPrecincts, geojsonNeighborhoods; // Declare as global variables
var textMarker1, textMarker2, textMarker3, textMarker4, textMarker5; // Declare variables to store the text markers

// Function to add text markers
function addTextMarkers() {
    var textIcon1 = L.divIcon({
        className: 'text-icon',
        html: '<div style="font-weight: bold;">Precinct 1</div>',
        iconSize: [100, 20],  // Adjust the size of the icon
        iconAnchor: [50, 0],  // Adjust the anchor point
    });

    var coordinates1 = [44.9778, -93.2650];

    textMarker1 = L.marker(coordinates1, { icon: textIcon1 }).addTo(map);

    var textIcon2 = L.divIcon({
        className: 'text-icon',
        html: '<div style="font-weight: bold;">Precinct 2</div>',
        iconSize: [100, 20],  // Adjust the size of the icon
        iconAnchor: [50, 0],  // Adjust the anchor point
    });

    var coordinates2 = [45.005641, -93.23];

    textMarker2 = L.marker(coordinates2, { icon: textIcon2 }).addTo(map);

    var textIcon4 = L.divIcon({
        className: 'text-icon',
        html: '<div style="font-weight: bold;">Precinct 4</div>',
        iconSize: [100, 20],  // Adjust the size of the icon
        iconAnchor: [50, 0],  // Adjust the anchor point
    });

    var coordinates4 = [45.017998, -93.292790];

    textMarker4 = L.marker(coordinates4, { icon: textIcon4 }).addTo(map);

    var textIcon3 = L.divIcon({
        className: 'text-icon',
        html: '<div style="font-weight: bold;">Precinct 3</div>',
        iconSize: [100, 20],  // Adjust the size of the icon
        iconAnchor: [50, 0],  // Adjust the anchor point
    });

    var coordinates3 = [44.941066, -93.238411

    ];

    textMarker3 = L.marker(coordinates3, { icon: textIcon3 }).addTo(map);

    var textIcon5 = L.divIcon({
        className: 'text-icon',
        html: '<div style="font-weight: bold;">Precinct 5</div>',
        iconSize: [100, 20],  // Adjust the size of the icon
        iconAnchor: [50, 0],  // Adjust the anchor point
    });

    var coordinates5 = [44.936255, -93.29915

    ];

    textMarker5 = L.marker(coordinates5, { icon: textIcon5 }).addTo(map);
}

// Function to remove text markers
function removeTextMarkers() {
    if (textMarker1) {
        map.removeLayer(textMarker1);
    }
    if (textMarker2) {
        map.removeLayer(textMarker2);
    }
    if (textMarker3) {
        map.removeLayer(textMarker3);
    }
    if (textMarker4) {
        map.removeLayer(textMarker4);
    }
    if (textMarker5) {
        map.removeLayer(textMarker5);
    }
}

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

        // Example: Add text as a popup to the marker
        marker.bindPopup("Auto Theft Incident");
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
d3.json(precincts).then(function (data) {
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

    // Example: Add text as a popup to each precinct
    geojsonPrecincts.eachLayer(function (layer) {
        layer.bindPopup("Police Precinct");
    });

    // Add the text markers initially
    addTextMarkers();
});

// Fetch the GeoJSON data for neighborhoods
d3.json(neighborhoods).then(function (data) {
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

    // Example: Add text as a popup to each neighborhood
    geojsonNeighborhoods.eachLayer(function (layer) {
        layer.bindPopup("Neighborhood");
    });

    // Add a control layer for switching between layers
    var baseMaps = {
        "Neighborhoods": geojsonNeighborhoods,
        "Precincts": geojsonPrecincts
    };

    L.control.layers(null, baseMaps, { collapsed: false }).addTo(map);

    // Listen for layer control events to handle removal of text markers
    map.on('overlayremove', function (event) {
        if (event.layer === geojsonPrecincts) {
            removeTextMarkers();
        }
    });

    map.on('overlayadd', function (event) {
        if (event.layer === geojsonPrecincts) {
            addTextMarkers();
        }
    });
});