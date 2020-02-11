function Map() {
  this.init();
}

Map.prototype.init = function () {
  var self = this;
  self.margin = {top: 30, right: 30, bottom: 30, left: 30};

  let divMap = d3.select("#map");
  self.svgBounds = divMap.node().getBoundingClientRect();
  self.svgWidth = self.svgBounds.width - self.margin.left - self.margin.right;
  self.svgHeight = self.svgBounds.height;
  this.svg = divMap.append("svg")
                  .attr("width", self.svgBounds.width)
                  .attr("height", self.svgBounds.height);

  // Potential problem: might lag even though map loaded
  // could be better to load in main.js
  this.getTripData("../Data/gps.csv");
  this.getCardData("../Data/cc_data.csv", "ccData");
  this.getCardData("../Data/loyalty_data.csv", "loyaltyData");
};

Map.prototype.wrangleData = function () {
  
};

Map.prototype.getTripData = function (filepath) {
  d3.csv(filepath).row((d) => {
    return {
      timestamp: d.Timestamp,
      id: d.id,
      lat: +d.lat,
      long: +d.long
    }
  }).get((error, rows) => {
    if(error) {
      console.log(error);
      return;
    }
    this.tripData = rows;
    console.log(this.tripData);
  });
};

Map.prototype.getCardData = function (filepath, attr) {
  d3.csv(filepath).row((d) => {
    return {
      timestamp: d.timestamp,
      location: d.location,
      price: +d.price,
      fname: d.FirstName,
      lname: d.LastName
    }
  }).get((error, rows) => {
    if(error) {
      console.log(error);
      return;
    }
    this[attr] = rows;
    console.log(this[attr]);
  });
};
