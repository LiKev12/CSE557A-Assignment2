// Root file that handles instances of all the charts and loads the visualization


(function(){
    var instance = null;
    var days = {6: 0, 7: 1, 8: 2, 9: 3, 10: 4, 11: 5, 12: 6, 13: 7, 14: 8, 15: 9, 16: 10, 17: 11}
    var dayBase = 432000
    var multiplier = 86400
    /*
     * Creates instances for every vis (classes created to handle each vis;
     * the classes are defined in the respective javascript files.
     */
    function init() {
        // Creating instances for each visualization
        let carId = {};
        let ts1 = {};
        let ts2 = {};
        let compare = {};
        var map = new Map();
        var filter = new Filter(carId, ts1, ts2, compare);

        $(carId).bind("newCarId", (event, carId) => {
          console.log(carId + " added!");
          // Call method in Map() to handle this
        });

        $(ts1).bind("newTimestamp1", (event, timestamp) => {
          console.log("ts1");
          console.log(timestamp);
          // Call method in Map() to handle this
        });

        $(ts2).bind("newTimestamp2", (event, timestamp) => {
          console.log("ts2");
          console.log(timestamp);
          // Call method in Map() to handle this
        });

        $(compare).bind("checked", (event, timestamp1, timestamp2, carId) => {
          //console.log(checked ? "compare is checked" : "compare is unchecked");
            var seconds1 = getSeconds(timestamp1.time)
            var time1 = (dayBase+(days[timestamp1.day]*multiplier)) + seconds1

            var seconds2 = getSeconds(timestamp2.time)
            var time2 = (dayBase+(days[timestamp2.day]*multiplier)) + seconds2
              map.getTripNewData("../Postprocess_Data/gps_data.csv", time1, time2, carId)
          
        });
    }


    function getSeconds(time){
      var a = time.split(':')
      var seconds;
      if(a.length < 3){
        seconds = ((+a[0]) * 60 * 60) + ((+a[1])*60) 
      }
      else{
        seconds = ((+a[0]) * 60 * 60) + ((+a[1])*60) + (+a[2])
      }

      return seconds
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
            init();
        }
        return instance;
    }

    Main.getInstance();
})();
