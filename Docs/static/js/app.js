// Get the autotheft data from Flask route
const capsules = "/api/v1.0/autotheft_tb";

// Fetch the JSON data and create the heatmap
d3.json(capsules).then(function (data) {
    // Set up Leaflet map
    var map = L.map('map').setView([44.9778, -93.2650], 12);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    // Normalize the counts to get an incidence rate per neighborhood
    var heatData = data.map(point => [point.latitude, point.longitude]);

    // Create MarkerClusterGroup
    var markers = L.markerClusterGroup();

    // Create markers and add to MarkerClusterGroup
    heatData.forEach(function (point) {
        var marker = L.marker(new L.LatLng(point[0], point[1]));
        markers.addLayer(marker);
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




    