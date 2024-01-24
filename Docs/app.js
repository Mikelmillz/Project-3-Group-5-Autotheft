// Project 3 Group 5 - Auto Theft
// Place the url in a variable 
const incidents = "https://services.arcgis.com/afSMGVsC7QlRK1kZ/arcgis/rest/services/Police_Incidents_2023/FeatureServer/0/query?outFields=*&where=1%3D1&f=geojson";

// Fetch the JSON data and console log it
d3.json(incidents).then(function(data) {
  console.log("incidents data from json:", data);
});

// Function that Initialize the dashboard at start up 
function init() {

    // Use D3 to select the dropdown menu
    let dropDown = d3.select("#selDataset");

    // Use D3 to get sample names and populate the drop-down selector
    d3.json(samples).then((data) => {
        
        // Set a variable for the sample names
        let names = data.names;

        // Add  samples to dropdown menu
        names.forEach((id) => {

            // Log the value of id for each iteration of the loop
            console.log("value of id for each iteration:", id);

            dropDown.append("option")
            .text(id)
            .property("value",id);
        });
        // Set the first sample from the list
        let sample_one = names[0];

        // Log the value of sample_one
        console.log("value of sample_one:", sample_one);

        // Build the initial plots
        metaData(sample_one);
        barChart(sample_one);
        bubbleChart(sample_one);
        gaugeChart(sample_one);

    });
};
// Function that populates metadata info
function metaData(sample) {

    // Use D3 to retrieve all of the data
    d3.json(samples).then((data) => {

        // Retrieve all metadata
        let metadata = data.metadata;

        // Filter based on the value of the sample
        let value = metadata.filter(result => result.id == sample);

        // Log the array of metadata objects after the have been filtered
        console.log("array of metadata objects", value)

        // Get the first index from the array
        let valueData = value[0];

        // Clear out metadata
        d3.select("#sample-metadata").html("");

        // Use Object.entries to add each key/value pair to the panel
        Object.entries(valueData).forEach(([key,value]) => {

            // Log the individual key/value pairs as they are being appended to the metadata panel
            console.log("individual key/value pairs:", key,value);

            d3.select("#sample-metadata").append("h5").text(`${key}: ${value}`);
        });
    });

};

// Function that builds the bar chart
function barChart(sample) {

    // Use D3 to retrieve all of the data
    d3.json(samples).then((data) => {

        // Retrieve all sample data
        let sampleInfo = data.samples;

        // Filter based on the value of the sample
        let value = sampleInfo.filter(result => result.id == sample);

        // Get the first index from the array
        let valueData = value[0];

        // Get the otu_ids, lables, and sample values
        let otu_ids = valueData.otu_ids;
        let otu_labels = valueData.otu_labels;
        let sample_values = valueData.sample_values;

        // Log the data to the console
        console.log("otu data for bar chart:", otu_ids,otu_labels,sample_values);

        // Set top ten items to display in descending order
        let yticks = otu_ids.slice(0,10).map(id => `OTU ${id}`).reverse();
        let xticks = sample_values.slice(0,10).reverse();
        let labels = otu_labels.slice(0,10).reverse();
        
        // Set up the trace for the bar chart
        let traceBar = {
            x: xticks,
            y: yticks,
            text: labels,
            type: "bar",
            orientation: "h",
            marker: {color: "darkgreen"}

        };

        // Setup the layout
        let layoutBar = {
            title: "TOP 10 OTUs PRESENT",
            color: "darkgreen",
            xaxis: {title: "Sample Values"}
        };

        // Call Plotly to plot the bar chart
        Plotly.newPlot("bar", [traceBar], layoutBar)
    });
};
// Function that builds the bubble chart
function bubbleChart(sample) {

    // Use D3 to retrieve all of the data
    d3.json(samples).then((data) => {
        
        // Retrieve all sample data
        let sampleInfo = data.samples;

        // Filter based on the value of the sample
        let value = sampleInfo.filter(result => result.id == sample);

        // Get the first index from the array
        let valueData = value[0];

        // Get the otu_ids, lables, and sample values
        let otu_ids = valueData.otu_ids;
        let otu_labels = valueData.otu_labels;
        let sample_values = valueData.sample_values;

        // Log the data to the console
        console.log("otu data for bubble chart:", otu_ids,otu_labels,sample_values);
        
        // Set up the trace for bubble chart
        let traceBubble = {
            x: otu_ids,
            y: sample_values,
            text: otu_labels,
            mode: "markers",
            marker: {
                size: sample_values,
                color: otu_ids,
                colorscale: "Bluered"
            }
        };

        // Set up the layout
        let layoutBubble = {
            title: "Bacteria Per Sample",
            hovermode: "closest",
            xaxis: {title: "OTU ID"},
            yaxis: {title: "Sample Values"},
        };

        // Call Plotly to plot the bubble chart
        Plotly.newPlot("bubble", [traceBubble], layoutBubble)
    });
};
// Function that builds the Gauge chart
function gaugeChart(sample) {

    // Use D3 to retrieve all of the data
    d3.json(samples).then((data) => {
        
        // Retrieve all sample data
        let metadata = data.metadata;
        // Filter based on the value of the sample
        let value = metadata.filter((meta) => meta.id == sample);
        // Get the first index from the array
        let valueData = value[0];
        
        // Create a variable that holds the washing frequency.
        let washFreq = parseFloat(valueData.wfreq)
        console.log("Washing Frequency values:", washFreq)
                          
        // Set up the trace for Gauge chart
        let traceGauge = [{
            domain: { x: [0, 1], y: [0, 1] },
            value: washFreq,
            type: "indicator",
            mode: "gauge+number",
            title: { text: "Belly Button Washing Frequency <br>Scrubs per Week " },
            gauge: {
                axis: {range:[0,9],tickmode: "linear", tick0: 1, dtick: 1},
                bar: {color: "black"},
                steps: [
                    { range: [0,1], color: "red" },
                    { range: [1,2], color: "orange" },
                    { range: [2,3], color: "yellow" },
                    { range: [3,4], color: "lime" },
                    { range: [4,5], color: "green" },
                    { range: [5,6], color: "aqua" },
                    { range: [6,7], color: "blue" },
                    { range: [7,8], color: "purple" },
                    { range: [8,9], color: "violet" },
                ]
            }  
        }];
       
        // Set up the layout
        let layoutGauge = {
            width: 450, 
            height: 445,
            margin: { t: 0, b: 0 }
   
        };

        // Call Plotly to plot the gauge chart
        Plotly.newPlot("gauge", traceGauge, layoutGauge)
    });
};
// Function that updates dashboard when sample is changed
function optionChanged(value) { 

    // Log the new value
    console.log("value change for dashboard:", value); 

    // Call all functions 
    metaData(value);
    barChart(value);
    bubbleChart(value);
    gaugeChart(value);
};

// Call the initialize function
init();