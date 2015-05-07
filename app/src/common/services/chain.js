'use strict';

angular.module('travelingSalesmanApp')
  .factory('Chain', function () {
    return function() {

        this.index = 0;
        this.end = 0;
        this.callback = function() {};
        this.endCallback = null;
        this.stopCallback = null;

        this.loop = function(callback, n) {
            this.end = n;
            if(angular.isFunction(callback))
                this.callback = callback;
            return this;
        };

        this.reset = function() {
            this.index = 0;
        };

        this.next = function() {
            if(this.index >= 0 && ++this.index <= this.end)
                this.callback(this);
            else if(this.index === -1) {
                this.reset();
                if(angular.isFunction(this.stopCallback))
                    this.stopCallback(this);
            } else {
                this.reset();
                if(angular.isFunction(this.endCallback))
                    this.endCallback(this);
            }
        };

        this.onEnd = function(callback) {
            if(angular.isFunction(callback)) {
                this.endCallback = callback;
            }
            return this;
        };

        this.onStop = function(callback) {
            if(angular.isFunction(callback)) {
                this.stopCallback = callback;
            }
            return this;
        };

        this.start = function() {
            this.next();
        };

        this.stop = function() {
            this.index = -1;
        }

    };
  });
