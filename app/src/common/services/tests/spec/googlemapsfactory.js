'use strict';

describe('Service: GoogleMapsFactory', function () {

  // load the service's module
  beforeEach(module('travelingSalesmanApp'));

  // instantiate service
  var GoogleMapsFactory;
  beforeEach(inject(function (_GoogleMapsFactory_) {
    GoogleMapsFactory = _GoogleMapsFactory_;
  }));

  it('should do something', function () {
    expect(!!GoogleMapsFactory).toBe(true);
  });

});
