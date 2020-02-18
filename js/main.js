// Root file that handles instances of all the charts and loads the visualization


(function(){
  var instance = null;
  /*
   * Creates instances for every vis (classes created to handle each vis;
   * the classes are defined in the respective javascript files.
   */
  function init() {
    // Creating instances for each visualization
    let carId = {};
    let timestampRange = {}
    let compare = {};
    let filterHandler = {};
    var map = new Map(filterHandler);
    var filter;
    $(filterHandler).bind("createFilter", (event, l, u, colorScale, validCarIds) => {
      filter = new Filter(carId, timestampRange, compare, [l,u], colorScale, validCarIds);
    });

    $(filterHandler).bind("createCarButton", (event, success, carId) => {
      if (success) {
        filter.createCarButton(carId);
      } else {
        alert(`${carId} has already been added.`)
      }
    });

    $(carId).bind("addCarId", (event, carId) => {
      map.updateCarIDs(+carId);
    });

    $(carId).bind("removeCarId", (event, carId) => {
      map.removeCarIDs(+carId);
    });

    $(carId).bind("removeAllCarIds", (event) => {
      map.removeAllCarIDs();
    });

    $(timestampRange).bind("newTimestamp", (event, ts1, ts2) => {
      map.updateTimestampRange(ts1, ts2);
    });

    $(compare).bind("draw", (event, timestamp1, timestamp2, carId) => {
      map.wrangleData();
      map.drawPaths();
      map.drawCardTable();
    });
  }

  /**
   *
   * @constructor
   */
  function Main(){
      if(instance  !== null){
          throw new Error("Cannot instantiate more than one Class");
      }
  }

  /**
   *
   * @returns {Main singleton class |*}
   */
  Main.getInstance = function(){
      var self = this
      if(self.instance == null){
          self.instance = new Main();

          //called only once when the class is initialized
          // let imgLoader = document.getElementById("abila-map")
          window.onload= function() {
            init();
          }

      }
      return instance;
  }

  Main.getInstance();
})();
