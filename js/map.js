function Map(_handler) {
  this.filterHandler = _handler;
  this.timestampRange = [];
  this.carIDs = new Set();
  this.init();
}

Map.prototype.init = function () {
  var self = this;
  self.margin = { top: 30, right: 30, bottom: 30, left: 30 };

  let divMap = d3.select("#map");
  self.svgBounds = divMap.node().getBoundingClientRect();
  self.svgWidth = self.svgBounds.width - self.margin.left - self.margin.right;
  self.svgHeight = self.svgBounds.height;
  self.svg = divMap.append("svg")
    .attr("width", self.svgBounds.width)
    .attr("height", self.svgBounds.height)

  // Potential problem: might lag even though map loaded
  // could be better to load in main.js
  self.getTripData("../Postprocess_Data/gps_data_a20.csv");
  self.getCardData("../Data/cc_data.csv", "ccData");
  self.getCardData("../Data/loyalty_data.csv", "loyaltyData");
};

Map.prototype.drawPaths = function () {
  let self = this;
  self.paths = self.svg.selectAll("circle").data(this.tripDataDraw);
  self.paths.enter()
    .append("circle")
    .merge(self.paths)
    .attr("class", (d) => "path-dot-"+d.id)
    .attr("cx", (d) => self.x(d.long))
    .attr("cy", (d) => self.y(d.lat))
    .attr("r", 3)
    .attr("fill", (d) => self.colorScale(d.id));
  self.paths.exit().remove();
};

Map.prototype.wrangleData = function () {
  if(!this.carIDs.size && !this.timestampRange.length) {
    this.tripDataDraw = this.tripData
  } else {
    const ts1 = this.timestampRange[0];
    const ts2 = this.timestampRange[1];
    this.tripDataDraw = this.tripData.filter((d) => {
      if(this.carIDs.size && this.timestampRange.length) {
        return this.carIDs.has(d.id) && (ts1 <= d.timestamp && d.timestamp <= ts2);
      } else if (this.carIDs.size) {
        return this.carIDs.has(d.id);
      } else {
        return ts1 <= d.timestamp && d.timestamp <= ts2;
      }
    });
  }
};

Map.prototype.updateTimestampRange = function (ts1, ts2) {
  this.timestampRange = [ts1, ts2];
};

Map.prototype.updateCarIDs = function (carId) {
  let success = true;
  if(this.carIDs.has(carId)) {
    success = false;
  } else {
    this.carIDs.add(carId);
  }
  $(this.filterHandler).trigger("createCarButton", [success, carId]);
};

Map.prototype.removeCarIDs = function (carId) {
  this.carIDs.delete(carId);
  d3.selectAll(".path-dot-"+carId).remove();
};

Map.prototype.getTripData = function (filepath) {
  var self = this;
  d3.csv(filepath).row((d) => {
    return {
      timestamp: +d.Timestamp,
      id: +d.id,
      lat: +d.lat,
      long: +d.long,
      name: d.Name,
      employmentType: d.CurrentEmploymentType,
      employmentTitle: d.CurrentEmploymentTitle
    }
  }).get((error, rows) => {
    if (error) throw error;
    this.tripData = rows;
    let domain = d3.extent(this.tripData, (row) => row.timestamp);

    // range generated using: http://jnnnnn.github.io/category-colors-2L-inplace.html
    // range of values are "perceptually different", different dots are more clear
    // using ordinal scale vs the sequential
    let range = ["#0bb414", "#fe22fd", "#ff5e07", "#26a5df", "#eb74a2", "#b09a50",
                "#9b7ffc", "#09a781", "#9d8f98", "#df755a", "#87a705", "#d98902",
                "#e65dd2", "#a88fd2", "#549fa5", "#62a34e", "#87a37c", "#3195fb",
                "#fc5b71", "#c19176", "#d162fc", "#b09b0f", "#fc5f46", "#fa52a8",
                "#d67bcb", "#c97e8b", "#0cb25c", "#899bc3", "#c68542", "#ed7c3b",
                "#8fa446", "#60ae32", "#bd80ae", "#8c92f6", "#f842e0"];
    self.colorScale = d3.scaleOrdinal()
                        .domain(d3.extent(this.tripData, (row) => row.id))
                        .range(range);
    // map x-axis, long -> width of containing div
    self.x = d3.scaleLinear()
         .domain(d3.extent(this.tripData, (row) => row.long))
         .range([0, self.svgWidth]);
    // map y-axis, lat -> height of containing div
    self.y = d3.scaleLinear()
        .domain(d3.extent(this.tripData, (row) => row.lat))
        .range([self.svgHeight, 0]);

    $(this.filterHandler).trigger("createFilter", [+domain[0], +domain[1], self.colorScale]);
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
    if (error) throw error;
    this[attr] = rows;
  });
};
