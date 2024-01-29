// Get the Roadster endpoint
const roadster = "/api/v1.0/neighborhood";

// Fetch the JSON data and console log it
d3.json(roadster).then(function(data) {
  console.log(data);
});

// Get the capsules endpoint
const capsules = "/api/v1.0/autotheft_tb";

// Fetch the JSON data and console log it
d3.json(capsules).then(function(data) {
  console.log(data);
});