(function(){

  var objectToString = Object.prototype.toString;
  var PRIMITIVE_TYPES = [String, Number, RegExp, Boolean, Date];

  jasmine.addMatchers({toHaveProperty: function(prop) {
      try {
        return prop in this.actual;
      }
      catch (e) {
        return false;
      }
  }});

})();
