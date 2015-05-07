'use strict';

angular.module('travelingSalesmanApp')
    .factory('GoogleMapsFactory', [
        function() {
            function GoogleMapsFactory( apiOptions ) {
                var isApiLoaded = -1, // -1: no, 0: loading, 1: loaded
                    queryString = '',
                    callbacks = [];

                var encodeQueryData = function(data) {
                    var ret = [];
                    for (var d in data)
                        ret.push(encodeURIComponent(d) + "=" + encodeURIComponent(data[d]));
                    return ret.join("&");
                };

                apiOptions.callback = 'gmap_draw';
                queryString = encodeQueryData( apiOptions );

                var loadGoogleMapsApi = function() {
                    if( window.google && window.google.maps ) isApiLoaded = 1;
                    if( isApiLoaded === -1 ) {
                        var s = angular.element('<script/>');
                        s.attr('type', "text/javascript");
                        s.attr('src', 'https://maps.googleapis.com/maps/api/js?' + queryString);
                        angular.element(document.body).append(s);
                        isApiLoaded = 0;
                        window.gmap_draw = function() {
                            isApiLoaded = 1;
                            runCallbacks();
                        };
                    } else if( isApiLoaded === 1)
                        runCallbacks();
                };
                var runCallbacks = function() {
                    for(var i=0, n=callbacks.length; i<n; ++i)
                        callbacks[i]( window.google.maps );
                    callbacks.splice(0, n);
                };
                this.load = function( callback ) {
                    callbacks.push(( callback || angular.noop ));
                    loadGoogleMapsApi();
                };
            }
            return GoogleMapsFactory;
        }
    ]);
