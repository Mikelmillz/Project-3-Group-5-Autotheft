// Declare myChart variable outside the scope of any function
var myChart;

// Get the autotheft data from Flask route
const capsules = "/api/v1.0/autotheft_tb";
// Fetch the GeoJSON data for police precincts
const precincts = "/api/v1.0/precincts";
// Fetch the GeoJSON data for neighborhoods
const neighborhoods = "/api/v1.0/neighborhoods";

var map = L.map('map').setView([44.9778, -93.2650], 12);
var markers = L.markerClusterGroup(); 
var geojsonPrecincts, geojsonNeighborhoods; 
var textMarker1, textMarker2, textMarker3, textMarker4, textMarker5; 

document.addEventListener("DOMContentLoaded", function() {
    // Load Leaflet library
    if (typeof L === 'undefined') {
        // If Leaflet library is not loaded, load it dynamically
        var leafletScript = document.createElement('script');
        leafletScript.onload = function() {
            initializeMap();
        };
        leafletScript.src = 'https://unpkg.com/leaflet@1.7.1/dist/leaflet.js';
        document.head.appendChild(leafletScript);
    } else {
        initializeMap();
    }

    function initializeMap() {
        // Get the autotheft data from Flask route
        const capsules = "/api/v1.0/autotheft_tb";

        // Fetch the JSON data and create the heatmap
        d3.json(capsules).then(function(data) {
            // Set up Leaflet map
            var map = L.map('map').setView([44.9778, -93.2650], 12);
            var markers = L.markerClusterGroup();

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© OpenStreetMap contributors'
            }).addTo(map);

            // Normalize the counts to get an incidence rate per neighborhood
            var heatData = data.map(point => [point.latitude, point.longitude]);

            // Create and add the heatmap layer
            var heat = L.heatLayer(heatData, { radius: 20 }).addTo(map);
        });

        // Function to populate precinct dropdown
        function populatePrecinctDropdown() {
            // Get the dropdown element
            var dropdown = document.getElementById("selPrecinct");

            // Fetch precinct data from Flask route
            fetch("/api/v1.0/precinct")
                .then(response => response.json())
                .then(data => {
                    // Populate dropdown with precinct options
                    data.forEach(precinct => {
                        var option = document.createElement("option");
                        option.text = precinct;
                        option.value = precinct;
                        dropdown.add(option);
                    });
                });
        }

        // Call the function to populate precinct dropdown when the page loads
        populatePrecinctDropdown();

        // Add event listener to the dropdown menu
        var dropdown = document.getElementById("selPrecinct");
        dropdown.addEventListener("change", function() {
            var selectedPrecinct = this.value;

            // Call the optionChanged function passing the selected precinct value
            optionChanged(selectedPrecinct);
        });

    }
});

// Define the optionChanged function
function optionChanged(value) {
    console.log("Selected precinct:", value);

    // Fetch offense data for the selected precinct
    fetch(`/api/v1.0/offenses/${value}`)
        .then(response => response.json())
        .then(data => {
            // Process data to calculate offenses by month
            var offensesByMonth = {};
            data.forEach(offense => {
                var month = new Date(offense.reportedDate).getMonth() + 1; 
                if (!offensesByMonth[month]) {
                    offensesByMonth[month] = 1;
                } else {
                    offensesByMonth[month]++;
                }
            });

            // Create labels and data for the chart
            var months = Object.keys(offensesByMonth).map(month => getMonthName(parseInt(month)));
            var counts = Object.values(offensesByMonth);

            // Destroy existing chart if it exists
            if (myChart) {
                myChart.destroy();
            }

            // Generate random colors for each dataset
            var colors = generateRandomColors(counts.length);

            // Create bar chart using Chart.js
            var ctx = document.getElementById('barChart').getContext('2d');
            myChart = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: months,
                    datasets: [{
                        label: 'Offenses by Month',
                        data: counts,
                        backgroundColor: colors,
                        borderColor: 'rgba(255, 99, 132, 1)',
                        borderWidth: 1
                    }]
                },
                options: {
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    }
                }
            });

            // Calculate other information and update the Precinct Info panel
            calculateAndUpdatePrecinctInfo(data);
        })
        .catch(error => console.error('Error fetching offense data:', error));
}

// Function to convert numerical month to month name
function getMonthName(month) {
    const monthNames = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"];
    return monthNames[month - 1]; // Month is zero-based, so subtract 1
}

// Function to generate random colors
function generateRandomColors(numColors) {
    var colors = [];
    for (var i = 0; i < numColors; i++) {
        var color = '#' + Math.floor(Math.random() * 16777215).toString(16); 
        colors.push(color);
    }
    return colors;
}

// Function to calculate other information and update the Precinct Info panel
function calculateAndUpdatePrecinctInfo(data) {
    // Calculate offenses by month
    var offensesByMonth = {};
    data.forEach(offense => {
        var month = new Date(offense.reportedDate).getMonth() + 1; 
        if (!offensesByMonth[month]) {
            offensesByMonth[month] = 1;
        } else {
            offensesByMonth[month]++;
        }
    });

    // Find month with highest offense
    var highestMonth = Object.keys(offensesByMonth).reduce((a, b) => offensesByMonth[a] > offensesByMonth[b] ? a : b);

    // Find month with lowest offense
    var lowestMonth = Object.keys(offensesByMonth).reduce((a, b) => offensesByMonth[a] < offensesByMonth[b] ? a : b);

    // Get the names of the months
    var monthNames = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"];

    var highestMonthName = monthNames[highestMonth - 1];
    var lowestMonthName = monthNames[lowestMonth - 1];

    // Calculate the neighborhood with the highest offense
    var neighborhoodCounts = {};
    data.forEach(offense => {
        if (!neighborhoodCounts[offense.neighborhood]) {
            neighborhoodCounts[offense.neighborhood] = 1;
        } else {
            neighborhoodCounts[offense.neighborhood]++;
        }
    });

    var highestNeighborhood = Object.keys(neighborhoodCounts).reduce((a, b) => neighborhoodCounts[a] > neighborhoodCounts[b] ? a : b);

    // Update the Precinct Info panel with the calculated information
    var precinctInfoPanel = document.getElementById('precinct-info');
    precinctInfoPanel.innerHTML = `<p>Neighborhood with most auto theft: <span style="color: red">${highestNeighborhood.toUpperCase()}</p>`;
    precinctInfoPanel.innerHTML += `<p>Month with most auto theft: <span style="color: blue">${highestMonthName.toUpperCase()}</p>`;
    precinctInfoPanel.innerHTML += `<p>Month with least auto theft: <span style="color: green">${lowestMonthName.toUpperCase()}</p>`;
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
        iconSize: [32, 32], 
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

// Function to add text markers
function addTextMarkers() {
    var textIcon1 = L.divIcon({
        className: 'text-icon',
        html: '<div style="font-weight: bold;">Precinct 1</div>',
        iconSize: [100, 20],  
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
