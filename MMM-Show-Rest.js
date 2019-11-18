//MMM-Show-Rest.js:

Module.register("MMM-Show-Rest",{
	// Default module config.
	defaults: {
		updateInterval: 60000,
                retryDelay: 5000,
		// Your URL here
		server: "http://headers.jsontest.com/",
	},

        start: function () {
                var self = this;
                var dataRequest = null;
                var dataNotification = null;

                //Flag for check if module is loaded
                this.loaded = false;

                // Schedule update timer.

                self.getData();
                setInterval(function () {
                        self.updateDom();
                }, this.config.updateInterval);

        },

        /*
         * getData
         *
         */
        getData: function () {
                var self = this;

                var urlApi = self.config.server;
                var retry = true;

                var dataRequest = new XMLHttpRequest();
                dataRequest.open("GET", urlApi, true);
                dataRequest.onreadystatechange = function () {
                        if (this.readyState === 4) {
                                if (this.status === 200) {
                                        self.processData(JSON.parse(this.response));
                                } else if (this.status === 401) {
                                        self.updateDom(self.config.animationSpeed);
                                        Log.error(self.name, this.status);
                                        retry = false;
                                } else {
                                        Log.error(self.name, "Could not load data.");
                                }
                                if (retry) {
					self.scheduleUpdate((self.loaded) ? -1 : self.config.retryDelay);
                                }
                        }
                };
                dataRequest.send();
        },

        /* scheduleUpdate()
         * Schedule next update.
         *
         * argument delay number - Milliseconds before next update.
         *  If empty, this.config.updateInterval is used.
         */
        scheduleUpdate: function (delay) {
                var nextLoad = this.config.updateInterval;
                if (typeof delay !== "undefined" && delay >= 0) {
                        nextLoad = delay;
                }
                nextLoad = nextLoad;
                var self = this;
                setTimeout(function () {
                        self.getData();
                }, nextLoad);
        },


	// Override dom generator.
	getDom: function() {

		var self = this;

                // create element wrapper for show into the module
                var wrapper = document.createElement("div");

                // If this.dataRequest is not empty
                if (this.dataRequest) {
                        let header = document.createElement("header");
                        header.className = "module-header"

                        // Use translate function
                        //             this id defined in translations files
                        header.innerHTML = 'Resultados OPE';
			wrapper.appendChild(header);

			var keys = Object.keys(this.dataRequest);

			for (var [key, value] of Object.entries(this.dataRequest)) {
 				let elem = document.createElement("div");
				elem.className = "normal";

				elem.innerHTML = key + ': <strong style="color:green">' + value + '</strong>';
				wrapper.appendChild(elem);
			};

			var dateelem = document.createElement("div");
			dateelem.className = "small";
			dateelem.innerHTML = "Actualizado: " + new Date().toLocaleString();
			wrapper.appendChild(dateelem);
		}

		return wrapper;
	},

        processData: function (data) {
                var self = this;
                this.dataRequest = data;
                if (this.loaded === false) {
                        self.updateDom(self.config.animationSpeed);
                }
                this.loaded = true;

                // the data if load
                // send notification to helper
                this.sendSocketNotification("MMM-ShowRest-NOTIFICATION_TEST", data);
	},

        // socketNotificationReceived from helper
        socketNotificationReceived: function (notification, payload) {
                if (notification === "MMM-SolarEdge-InverterMonitor-NOTIFICATION_TEST") {
                        // set dataNotification
                        this.dataNotification = payload;
                        this.updateDom();
                }
        },
});

