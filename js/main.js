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

        $(compare).bind("checked", (event, checked) => {
          console.log(checked ? "compare is checked" : "compare is unchecked");
          // Call method in Map() to handle this
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
            init();
        }
        return instance;
    }

    Main.getInstance();
})();
