function Filter(_carIdHandler, _timestampHandler, _compareHandler, timestampDomain, colorScale, validCarIds) {
  this.cardId = _carIdHandler;
  this.timestampRange = _timestampHandler;
  this.compare = _compareHandler;
  this.timestampDomain = timestampDomain;
  this.colorScale = colorScale;
  this.validCarIds = validCarIds;
  this.init();
}

Filter.prototype.init = function() {
  self.margin = { top: 30, right: 30, bottom: 30, left: 30 };
  self.svgWidth = d3.select("#range-slider").node().getBoundingClientRect().width - self.margin.left - self.margin.right;
  self.svgHeight = d3.select("#filter").node().getBoundingClientRect().height;
  self.svg = d3.select("#range-slider").append("svg")
    .attr("width", self.svgWidth)
    .attr("height", self.svgHeight);

  // figuring out nearest time to start/end date
  // console.log(getDateTime(432000));
  // console.log(getDateTime(1641599));
  // https://bl.ocks.org/johnwalley/e1d256b81e51da68f7feb632a53c3518
  var sliderRange = d3
    .sliderBottom()
    .min(432000)
    .max(1641599)
    // .min(this.timestampDomain[0])
    // .max(this.timestampDomain[1])
    .width(self.svgWidth - self.margin.left)
    .height(self.svgHeight / 2)
    .ticks(0)
    .step(3600) // seconds / hr (makes each step 1 hr)
    // .default([this.timestampDomain[0], this.timestampDomain[1]])
    .default([432000, 1641599])
    .handle(d3.symbol()
        .type(d3.symbolCircle)
        .size(200)())
    .fill('#2196f3')
    .on('onchange', val => {
      let ts1 = getDateTime(val[0]);
      let ts2 = getDateTime(val[1]);
      updateTimeRangeDisplay(val);
      $(this.timestampRange).trigger("newTimestamp", [val[0], val[1]]);
    //   $(this.compare).trigger("draw");
    });

    var gRange = self.svg.append("g")
                  .attr("transform", "translate(15, 15)");
    gRange.call(sliderRange);
    updateTimeRangeDisplay(sliderRange.value());
    $(this.timestampRange).trigger("newTimestamp", [sliderRange.value()[0], sliderRange.value()[1]]);
    // d3.select('#value-range').append("p").text(sliderRange.value().join('-'));
    this.initEventTriggers();
};

Filter.prototype.initEventTriggers = function() {
  self = this;
  $("#car-id-submit").on("click", (e) => {
    let carId = $("#car-id-input").val();
    if(this.validCarIds.includes(+carId)) {
      $(this.cardId).trigger("addCarId", carId);
      $(this.compare).trigger("draw");
      $("#car-id-input").val('');
    } else {
      alert(`${carId} is an invalid car id.`)
    }
  });

  $("#car-id-remove").on("click", (e) => {
    $("#cars-added button").remove();
    $(this.cardId).trigger("removeAllCarIds");
  });

  $("#compare").on("click", (e) => {
    $(this.compare).trigger("draw");
  });
}

Filter.prototype.createCarButton = function (carId) {
  let button = `<button value="${carId}" type="button" class="btn car-id-button" id="btn-${carId}" aria-label="Close">
                <span aria-hidden="true">&times; ${carId}</span>
              </button>`;
  $("#cars-added").append(button);
  let btnId = `#btn-${carId}`;
  $(btnId).css("background-color", self.colorScale(carId));
  $(btnId).css("color", "white");
  $(btnId).on("click", (e) => {
    let carId = e.target.parentNode.type === "button" ? e.target.parentNode.value : e.target.value;
    $(btnId).remove();
    $(this.cardId).trigger("removeCarId", carId);
    // $(this.compare).trigger("draw");
  });
};

function updateTimeRangeDisplay(ts) {
  d3.selectAll("#value-range p").remove();
  d3.select('#value-range').append("p").append("b").text("Date Range")
  // d3.select('#value-range').append("p").text(val.map(d3.format('.0f')).join('-'));
  d3.select('#value-range').append("p").text(getDateTime(ts[0]) + "-" + getDateTime(ts[1]));
}
