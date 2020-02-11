// Root file that handles instances of all the charts and loads the visualization
(function(){
    var instance = null;

    /*
     * Creates instances for every vis (classes created to handle each vis;
     * the classes are defined in the respective javascript files.
     */
    function init() {
        // Creating instances for each visualization
        var map = new Map();
        
        // load the data corresponding to all the election years
        // pass this data to instances of all the charts that need it

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
