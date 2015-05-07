'use strict';

describe('Service: chain', function () {

  // load the service's module
  beforeEach(module('travelingSalesmanApp'));

  // instantiate service
  var chain;
  beforeEach(inject(function (_chain_) {
    chain = _chain_;
  }));

  it('should do something', function () {
    expect(!!chain).toBe(true);
  });

});
