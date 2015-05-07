'use strict';

angular.module('travelingSalesmanApp')
  .controller('MainCtrl', function ($scope, GoogleMapsFactory, Chain) {

        var GM = new GoogleMapsFactory({
                v: 3,
                key: 'AIzaSyA9gaYC27XM1X9jvg6SQFIrFbQ2bh705Hs',
                language: 'pl',
                sensor: false,
                libraries: 'geometry'
            }),
            map = null,
            geocoder = null,
            markers = [],
            polyLines = [],
            animationChain = null;

        function addMarker(maps, location) {
            $scope.order = [];
            deletePolyLines();
            var marker = new maps.Marker({
                position: location,
                map: map,
                clickable: false,
                icon: {
                    path: google.maps.SymbolPath.CIRCLE,
                    scale: 6,
                    strokeColor: '#ff0000',
                    strokeOpacity: 0.8,
                    strokeWeight: 6
                }
            });
            geocoder.geocode({'location': marker.getPosition()}, function(results, status) {
                if (status == maps.GeocoderStatus.OK) {
                    if (results[1])
                        marker.address = results[1].formatted_address;
                    else
                        marker.address = marker.getPosition().toString();
                } else {
                    console.error('Geocoder error: ' + status);
                    marker.address = marker.getPosition().toString();
                }
                $scope.$apply(function() {
                    marker.setTitle(marker.address);
                    markers.push( marker );
                });
            });
        }

        function deletePolyLines() {
            if(animationChain != null)
                animationChain.stop();
            for(var i=0; i<polyLines.length; i++) {
                polyLines[i].setMap(null);
            }
            polyLines = [];
        }

        function drawLines(order) {
            deletePolyLines();
            var timeForOnePair = 250; // ms
            var refresh = 20; // ms

            // Select first point (yellow circle)
            polyLines.push(
                new google.maps.Polyline({
                    path: [markers[0].getPosition(), markers[0].getPosition()],
                    map: map,
                    strokeColor: '#ffff00',
                    strokeOpacity: 0.8,
                    strokeWeight: 30,
                    clickable: false
                })
            );

            animationChain = new Chain;
            animationChain.loop(function(chain) {

                var current = chain.index - 1,
                    next = (chain.index === markers.length) ? 0 : chain.index;
                if(current === 1 && next === 0) return chain.reset();

                current = order[current];
                next = order[next];

                var currentPos = markers[current].getPosition(),
                    nextPos = markers[next].getPosition(),
                    poly = new google.maps.Polyline({
                        path: [currentPos, currentPos],
                        map: map,
                        strokeColor: '#0000ff',
                        strokeOpacity: 1.0,
                        strokeWeight: 4,
                        geodesic: true,
                        clickable: false
                    });
                polyLines.push(poly);

                var ch2 = new Chain;
                ch2.loop(function(chain2) {
                    setTimeout(function() {
                        poly.setPath([currentPos, google.maps.geometry.spherical.interpolate(currentPos, nextPos, chain2.index / chain2.end)]);
                        chain2.next();
                    }, refresh);
                }, parseInt(timeForOnePair / refresh)).onEnd(function() {
                    chain.next();
                }).start();

                chain.onStop(function() {
                    ch2.stop();
                });

            }, markers.length).start();
        }

        function createMatrix() {
            console.time('matrix');
            var matrix = [], i;
            for(i=0; i<markers.length; i++) matrix.push([]);
            for(i=0; i<matrix.length; i++) {
                for(var j=i; j<matrix.length; j++) {
                    if(i===j) {
                        matrix[i][j] = 0;
                        continue;
                    }
                    matrix[i][j] = google.maps.geometry.spherical.computeDistanceBetween(markers[i].getPosition(), markers[j].getPosition());
                    matrix[j][i] = matrix[i][j];
                }
            }
            console.timeEnd('matrix');
            //for(i=0; i<matrix.length; i++) {
            //    console.log(matrix[i]);
            //}
            return matrix;
        }

        function searchNearestNeighbourRoute() {
            var matrix = createMatrix();
            console.time('searchNearestNeighbourRoute');
            var columns = [];
            var order = [0];
            for(var i=1; i<matrix.length; i++) columns.push(i);
            var row = 0;
            for(var i=0; i<markers.length; i++) {
                //console.log(matrix[row]);
                //console.log(columns);
                if(columns.length === 0) {
                    var minIndex = 0;
                } else if(columns.length === 1) {
                    var minIndex = columns[0];
                } else {
                    var minIndex = columns[0],
                        minValue = matrix[row][minIndex];
                    for (var c = 1; c < columns.length; c++) {
                        var column = columns[c];
                        if (row === column) continue;
                        if (matrix[row][column] < minValue) {
                            minValue = matrix[row][column];
                            minIndex = column;
                        }
                    }
                }
                columns.splice(columns.indexOf(minIndex), 1);
                //console.log(row, minIndex);
                row = minIndex;
                order.push(minIndex);
                markers[row].order = i;
            }
            console.timeEnd('searchNearestNeighbourRoute');
            return order;
        }

        GM.load(function (maps) {
            if(map === null) {
                map = new maps.Map(document.getElementById('left'), {
                    center: {lat: 51.9189046, lng: 19.1343786},
                    zoom: 7,
                    disableDefaultUI: true,
                    draggableCursor: 'default'
                });
                geocoder = new maps.Geocoder();
            }

            maps.event.addListener(map, 'click', function(event) {
                addMarker(maps, event.latLng);
            });
        });

        $scope.deleteMarker = function(index) {
            $scope.order = [];
            markers[index].setMap(null);
            markers.splice(index, 1);
            deletePolyLines();
        };

        $scope.deleteMarkers = function () {
            $scope.order = [];
            deletePolyLines();
            for (var i = 0; i < markers.length; i++) {
                markers[i].setMap( null );
            }
            markers = [];
        };

        $scope.calculate = function() {
            $scope.order = searchNearestNeighbourRoute();
            //console.log($scope.order);
            drawLines($scope.order);
        };

        $scope.getMarkers = function() {
            return markers;
        };

  });
