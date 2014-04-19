describe("helper", function() {
    beforeEach(function() {
        jasmine.addMatchers(
            {
                toHaveProperty: function(util, customEqualityTesters) {
                    return {
                        compare: function(actual, expected) {
                            var result = {};

                            try {
                                result.pass = expected in actual;
                            }
                            catch (e) {
                                result.pass = false;
                            }

                            if (result.pass) {
                                result.message = "Expected " + actual + " not to be a property.";
                            } else {
                                result.message = "Expected " + actual + " to be a property.";
                            }

                            return result
                        }
                    }
                }
            });
    });
    it("should load the helpers", function() {
        expect(expect(true).toHaveProperty).toEqual(jasmine.any(Function));
    });
});
