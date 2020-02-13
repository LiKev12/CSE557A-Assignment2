function Filter(_carIdHandler, _ts1Handler, _ts2Handler, _compareHandler) {
  this.cardId = _carIdHandler;
  this.ts1 = _ts1Handler;
  this.ts2 = _ts2Handler;
  this.compare = _compareHandler;
  this.checked = false;
  this.init();
}

Filter.prototype.init = function() {
  $("#car-id-submit").on("click", (e) => {
    let carId = $("#car-id-input").val();
    $(this.cardId).trigger("newCarId", carId);
  });

  $("#timestamp-1-submit").on("click", (e) => {
    console.log("yo");
    let day = $("#timestamp-1-day").val();
    let time = $("#timestamp-1-time").val();
    let timestamp = {day, time}
    $(this.ts1).trigger("newTimestamp1", timestamp);
  });

  $("#timestamp-2-submit").on("click", (e) => {
    let day = $("#timestamp-2-day").val();
    let time = $("#timestamp-2-time").val();
    $(this.ts2).trigger("newTimestamp2", {day: day, time: time});
  });
  $("#compare").on("click", (e) => {
    let carId = $("#car-id-input").val();
    let day1 = $("#timestamp-1-day").val();
    let time1 = $("#timestamp-1-time").val();
    let timestamp1 = {day: day1, time: time1}
    let day2 = $("#timestamp-2-day").val();
    let time2 = $("#timestamp-2-time").val();
    let timestamp2 = {day: day2, time: time2}
    $(this.compare).trigger("checked", [timestamp1, timestamp2, carId]);
  });
};
