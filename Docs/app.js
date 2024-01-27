// Place the url in a variable
const incidents = "https://services.arcgis.com/afSMGVsC7QlRK1kZ/arcgis/rest/services/Police_Incidents_2023/FeatureServer/0/query?outFields=*&where=1%3D1&f=geojson";
// Fetch the JSON data and console log it
d3.json(incidents).then(function(data) {
  console.log("incidents data from json:", data);
});
// Fetch the JSON data
fetch(incidents)
  .then(response => response.json())
  .then(data => {
    // Convert JSON to CSV format
    const csvData = convertJSONToCSV(data.features);

