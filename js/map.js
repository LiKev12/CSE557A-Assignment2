function Map() {
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

  $("svg").css({ top: 10, left: 10, position: 'absolute' });

  var projection = d3.geoMercator().scale(16000);
  

  var path = d3.geoPath().projection(projection);

  // d3.json("../Data/Geospatial/world-110m.geojson", function (error, abila) {
  //   if (error) return console.error(error);

  //   self.svg.append("path").attr("d", path(abila));
    
    
  // });

  // d3.json("../Data/Geospatial/abila.json", function (error, abila) {
  //   if (error) return console.error(error);

  //   self.svg.append("path").attr("d", path(abila));
    
    
  // });


  // Potential problem: might lag even though map loaded
  // could be better to load in main.js

  this.getTripData("../Data/gps.csv");

  this.getCardData("../Data/cc_data.csv", "ccData");
  this.getCardData("../Data/loyalty_data.csv", "loyaltyData");
};



Map.prototype.consolelog = function (input) {
  console.log(input)
}

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
  let temp = [... new Set(this.tripDataDraw.map(d => +d.id))]
  if(!this.carIDs.size) {
    for(let i = 0; i < temp.length; i++) {
      this.updateCarIDs(temp[i]);
    }
  } else {
    this.carIDs.forEach((k, v, set) => {
      if(!temp.includes(v)) {
        this.removeCarIDs(v);
        // TODO: removing the button should really be handled by the Filter object...
        $("#btn-"+v).remove();
      }
    });
  }
};

};

Map.prototype.filterData = function (data, time1, time2, id) {
  let svg = d3.selectAll("svg")
  svg.selectAll("path").remove()
  data = data.filter(function (d) {
    return d.timestamp > time1 && d.timestamp < time2 && d.id == +id
  })

  console.log(data)

  let maxLat = data.reduce((max, data) => max.lat > data.lat ? max : data);
  let minLat = data.reduce((max, data) => max.lat < data.lat ? max : data);

  let maxLong = data.reduce((max, data) => max.long > data.long ? max : data);
  let minLong = data.reduce((max, data) => max.long < data.long ? max : data);

  console.log("svg height " + parseInt(svg.style("height")))

  let x = d3.scaleLinear()
    .domain([minLong.long, maxLong.long])
    .range([0, parseInt(svg.style("width")) * .5]);

  var y = d3.scaleLinear()
    .domain([minLat.lat, maxLat.lat])
    .range([0, parseInt(svg.style("height")) * .5]);


  var lineFunction = d3.line()
    .x(function (d) { return x(d.long); })
    .y(function (d) { return y(d.lat); });

  // var projection = d3.geoMercator();
  

  // var path = d3.geoPath().projection(projection);

  // d3.json("../Data/Geospatial/world-110m.geojson", function (error, abila) {
  //   if (error) return console.error(error);

  //   svg.append("path").attr("d", path(abila));
    
    
  // });

  // d3.json("../Data/Geospatial/abila.json", function (error, abila) {
  //   if (error) return console.error(error);

  //   svg.append("path").attr("d", path(abila));
    
    
  // });

  var selection = d3.selectAll("svg")
    .append("path")
    .attr("d", lineFunction(data))
    .attr("stroke", "blue")
    .attr("stroke-width", 2)
    .attr("fill", "none");

}

Map.prototype.getTripNewData = function (filepath, time1, time2, id) {
  d3.csv(filepath).row((d) => {
    return {
      timestamp: +d.Timestamp,
      id: +d.Id,
      lat: +d.Lat,
      long: +d.Long
    }
  }).get((error, rows) => {
    if (error) {
      console.log(error);
      return;
    }
    this.tripData = rows;
    this.filterData(this.tripData, time1, time2, id)
  });
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
    if (error) {
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
    if (error) {
      console.log(error);
      return;
    }
    this[attr] = rows;
    //console.log(this[attr]);
  });
};

