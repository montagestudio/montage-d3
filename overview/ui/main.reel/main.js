var Component = require("montage/ui/component").Component,
	Request = require("montage/core/request");

exports.Main = Component.specialize({

	constructor: {
        value: function Main() {
            this.super();
            this.loadData();

            setInterval(this.randomData.bind(this), 500);
        }
    },

    data: {
        value: null
    },

    loadData: {
    	value : function () {
    		var self = this;
	    	Request.json("./assets/data/data.json", "json").then(function (data) {
	    		self.data = data.body;
	    	});
    	}
    },

    randomData: {
    	value : function () {
    		var self = this;
	    	Request.json("./assets/data/data.json", "json").then(function (data) {
	    		self.data = data.body;
	    		
 				// Random value
	    		self.data.forEach(function (entry) {
	    			entry.value = Math.random();
	    		});

	    		// Random set
				self.data.splice(
					Math.floor(Math.random() * self.data.length), 
					Math.floor(Math.random() * self.data.length)
				);
	    	});
    	}
    },
});
