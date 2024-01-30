// Get the Neighborhood endpoint
const neighborHood = "/api/v1.0/neighborhood";

// Fetch the JSON data and console log it
d3.json(neighborHood).then(function(data) {
  console.log(data);
});

// Get the autotheft endpoint
const autoTheft = "/api/v1.0/autotheft_tb";

// Fetch the JSON data and console log it
d3.json(autoTheft).then(function(data) {
  console.log(data);
});