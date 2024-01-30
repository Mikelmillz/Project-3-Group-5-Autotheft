// Get the autotheft data from Flask route
const capsules = "/api/v1.0/autotheft_tb";

// Fetch the JSON data and create the heatmap
d3.json(capsules).then(function(data) {
    // Set up Leaflet map
    var map = L.map('map').setView([44.9778, -93.2650], 12);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    // Normalize the counts to get an incidence rate per neighborhood
    var heatData = data.map(point => [point.latitude, point.longitude]);
    
    console.log(data[0])

    // Create and add the heatmap layer
    var heat = L.heatLayer(heatData, { radius: 20 }).addTo(map);
});



    