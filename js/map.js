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

  self.tip = d3.tip()
              .attr('class', 'car-tip')
              .direction('se')
              .offset(() => [0,0])
              .html((d) => {
        				let name = d.name.split("_");
                let employmentType = d.employmentType;
                let employmentTitle = d.employmentTitle;
      				  let namePara = "<p><b class='text-white'>Emplyee:</b> " + name[0] + " " + name[1] + "</p>"
                let carIdPara = "<p><b class='text-white'>Car ID:</b> " + d.id + "</p>"
                let timestamp = getDateTime(d.timestamp)
                let timestampPara = "<p><b class='text-white'>Timestamp:</b> " + timestamp + "</p>"
                let locPara = "<p><b class='text-white'>Long:</b> " + d.long.toFixed(5) + " <b class='text-white'>Lat:</b>  " + d.lat.toFixed(5) +"</p>"
                return namePara + carIdPara + timestampPara + locPara;
              });
  self.svg.call(self.tip)
  self.tableBody = d3.select("#card-table-body");

  // Potential problem: might lag even though map loaded
  // could be better to load in main.js
  self.getTripData("../Postprocess_Data/gps_data_a20.csv");
  self.getCardData("../Postprocess_Data/cc_car_data.csv", "ccData");
  self.getCardData("../Postprocess_Data/loyalty_car_data.csv", "loyaltyData");
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
    .attr("fill", (d) => self.colorScale(d.id))
    .on("mouseover", self.tip.show)
		.on("mouseout", self.tip.hide);
  self.paths.exit().remove();
};

Map.prototype.drawCardTable = function () {
  // http://bl.ocks.org/yan2014/c9dd6919658991d33b87
  let self = this;
  this.arrayOfObjToArrayOfArray();
  // TODO: exit remove is not working w/ table, so using this method temporarily
  d3.selectAll(".row-del").remove();

  self.tableRows = self.tableBody.selectAll(".row-del")
    .data(this.ccDataDraw)
    .enter()
    .append("tr")
    .attr("class", "row-del")
    .style("background-color" , d => this.colorScale(+d[2]) + "B3");
  // d3.selectAll(".row-del").data(this.ccDataDraw).exit().remove();
  // self.tableRows.exit().remove();

  self.tableCells = self.tableRows.selectAll("td").data((d) => d)
    .enter()
    .append("td")
    .attr("class", "cell-del")
    .text((d) => d);
  // d3.selectAll(".cell-del").data(this.ccDataDraw).exit().remove();
  // self.tableCells.exit().remove();
};

Map.prototype.wrangleData = function () {
  if(!this.carIDs.size && !this.timestampRange.length) {
    this.tripDataDraw = this.tripData
    this.ccDataDraw = this.ccData;
    this.loyaltyDataDraw = this.loyaltyData;
  } else {
    this.filterDataset("tripData");
    this.filterDataset("ccData");
    this.filterDataset("loyaltyData");
  }
  let temp = [... new Set(this.tripDataDraw.map(d => +d.id))]
  if(!this.carIDs.size) {
    // if there are no car ids selected, then add the car ids within the
    // selected time range to this.carIDs
    for(let i = 0; i < temp.length; i++) {
      this.updateCarIDs(temp[i]);
    }
  } else {
    // IF we want to prioritize filtering by timestamp, then uncomment out this
    // code. (e.g. user updates timestamps, and their previously applied car ids
    // are updated to be)

    // this.carIDs.forEach((k, v, set) => {
    //   if(!temp.includes(v)) {
    //     this.removeCarIDs(v);
    //     // TODO: removing the button should really be handled by the Filter object...
    //     $("#btn-"+v).remove();
    //   }
    // });
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
  return success;
};

Map.prototype.removeCarIDs = function (carId) {
  this.carIDs.delete(carId);
  d3.selectAll(".path-dot-"+carId).remove();

  // TODO: kinda janky...
  this.filterDataset("ccData");
  this.drawCardTable();
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
    self.setScales();
    // self.createCarIdEmployeeMap();
    $(this.filterHandler).trigger("createFilter", [+domain[0], +domain[1], self.colorScale]);
  });
};

Map.prototype.getCardData = function (filepath, attr) {
  d3.csv(filepath).row((d) => {
    return {
      timestamp: +d.Timestamp,
      location: d.Location,
      price: +d.Price,
      name: d.Name,
      id: +d.CarID
    }
  }).get((error, rows) => {
    if (error) throw error;
    this[attr] = rows;
  });
};

Map.prototype.createCarIdEmployeeMap = function () {
  this.carIdToEmplyee = {};
  this.employeeToCarId = {};
  for(let i = 0; i < this.tripData.length; i++) {
    const carId = this.tripData[i].id;
    const employee = this.tripData[i].name;
    this.carIdToEmplyee[carId] &&  this.carIdToEmplyee[carId].indexOf(employee) ? this.carIdToEmplyee[carId].push(employee) : this.carIdToEmplyee[carId] = [employee];
    employee !== "" && (this.employeeToCarId[employee] &&  this.employeeToCarId[employee].indexOf(carId)) ? this.employeeToCarId[employee].push(carId) : this.employeeToCarId[employee] = [carId];
  }
};

Map.prototype.setScales = function () {
  let self = this;
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
};

Map.prototype.filterDataset = function (attr) {
  const ts1 = this.timestampRange[0];
  const ts2 = this.timestampRange[1];
  this[attr+"Draw"] = this[attr].filter((d) => {
    // let currCarId = d.id ? d.id : +this.employeeToCarId[d.name];
    if(this.carIDs.size && this.timestampRange.length) {
      return this.carIDs.has(d.id) && (ts1 <= d.timestamp && d.timestamp <= ts2);
    } else if (this.carIDs.size) {
      return this.carIDs.has(d.id);
    } else {
      return ts1 <= d.timestamp && d.timestamp <= ts2;
    }
  });
};

Map.prototype.arrayOfObjToArrayOfArray = function () {
  let temp = [];
  for(let i = 0; i < this.ccDataDraw.length; i++) {
    temp.push([getDateTime(this.ccDataDraw[i].timestamp),
      this.ccDataDraw[i].name,
      this.ccDataDraw[i].id,
      this.ccDataDraw[i].price,
      this.ccDataDraw[i].location]);
  }
  this.ccDataDraw = temp;
};
