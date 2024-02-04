// Declare myChart variable outside the scope of any function
var myChart;

// Get the autotheft data from Flask route
const capsules = "/api/v1.0/autotheft_tb";
// Fetch the GeoJSON data for police precincts
const precincts = "/api/v1.0/precincts";
// Fetch the GeoJSON data for neighborhoods
const neighborhoods = "/api/v1.0/neighborhoods";

var map = L.map('map').setView([44.9778, -93.2650], 12);
var markers = L.markerClusterGroup(); // Move this outside the d3.json callback

var geojsonPrecincts, geojsonNeighborhoods; // Declare as global variables


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
                var month = new Date(offense.reportedDate).getMonth() + 1; // Month is zero-based
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
        var month = new Date(offense.reportedDate).getMonth() + 1; // Month is zero-based
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
    precinctInfoPanel.innerHTML = `<p>Neighborhood with highest auto theft rate: <span style="color: red">${highestNeighborhood.toUpperCase()}</p>`;
    precinctInfoPanel.innerHTML += `<p>Month with the most auto thefts: <span style="color: blue">${highestMonthName.toUpperCase()}</p>`;
    precinctInfoPanel.innerHTML += `<p>Monthwith the least auto thefts: <span style="color: green">${lowestMonthName.toUpperCase()}</p>`;
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