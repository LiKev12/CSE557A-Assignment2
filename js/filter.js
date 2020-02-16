function Filter(_carIdHandler, _timestampHandler, _compareHandler, timestampDomain, colorScale) {
  this.cardId = _carIdHandler;
  this.timestampRange = _timestampHandler;
  this.compare = _compareHandler;
  this.timestampDomain = timestampDomain;
  this.colorScale = colorScale;
  this.init();
}

Filter.prototype.init = function() {
  self.margin = { top: 30, right: 30, bottom: 30, left: 30 };
  self.svgWidth = d3.select("#range-slider").node().getBoundingClientRect().width - self.margin.left - self.margin.right;
  self.svgHeight = d3.select("#filter").node().getBoundingClientRect().height;
  self.svg = d3.select("#range-slider").append("svg")
    .attr("width", self.svgWidth)
    .attr("height", self.svgHeight);

  // https://bl.ocks.org/johnwalley/e1d256b81e51da68f7feb632a53c3518
  var sliderRange = d3
    .sliderBottom()
    .min(this.timestampDomain[0])
    .max(this.timestampDomain[1])
    .width(self.svgWidth - self.margin.left)
    .height(self.svgHeight / 2)
    .ticks(0)
    .step(1)
    .default([this.timestampDomain[0], this.timestampDomain[1]])
    .handle(d3.symbol()
        .type(d3.symbolCircle)
        .size(200)())
    .fill('#2196f3')
    .on('onchange', val => {
      d3.selectAll("#value-range p").remove();
      d3.select('#value-range').append("p").text("Date Range")
      d3.select('#value-range').append("p").text(val.map(d3.format('.0f')).join('-'));
      $(this.timestampRange).trigger("newTimestamp", [val[0], val[1]]);
    });

    var gRange = self.svg.append("g")
                  .attr("transform", "translate(15, 15)");
    gRange.call(sliderRange);
    d3.select('#value-range').append("p").text("Date Range")
    d3.select('#value-range').append("p").text(sliderRange.value().join('-'));

    this.initEventTriggers();
};

Filter.prototype.initEventTriggers = function() {
  self = this;
  $("#car-id-submit").on("click", (e) => {
    let carId = $("#car-id-input").val();
    $(this.cardId).trigger("addCarId", carId);
    $(this.compare).trigger("draw");
    $("#car-id-input").val('');
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