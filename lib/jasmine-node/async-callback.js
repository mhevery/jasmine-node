(function() {
  var asyncSpec, jasmineFunction, withoutAsync, _fn, _i, _len, _ref;
  var __slice = Array.prototype.slice;

  withoutAsync = {};

  _ref = ["it", "beforeEach", "afterEach"];
  _fn = function(jasmineFunction) {
    withoutAsync[jasmineFunction] = jasmine.Env.prototype[jasmineFunction];
    return jasmine.Env.prototype[jasmineFunction] = function() {
      var args, specFunction;
      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      specFunction = args.pop();
      if (specFunction.length === 0) {
        args.push(specFunction);
      } else {
        args.push(function() {
          return asyncSpec(specFunction, this);
        });
      }
      return withoutAsync[jasmineFunction].apply(this, args);
    };
  };
  for (_i = 0, _len = _ref.length; _i < _len; _i++) {
    jasmineFunction = _ref[_i];
    _fn(jasmineFunction);
  }

  asyncSpec = function(specFunction, spec, timeout) {
    var done;
    if (timeout == null) timeout = 1000;
    done = false;
    spec.runs(function() {
      try {
        return specFunction(function(error) {
          done = true;
          if (error != null) return spec.fail(error);
        });
      } catch (e) {
        done = true;
        throw e;
      }
    });
    return spec.waitsFor(function() {
      if (done === true) {
        return true;
      }
    }, "spec to complete", timeout);
  };

}).call(this);
