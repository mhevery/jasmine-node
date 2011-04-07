(function()
{
  var objectToString = Object.prototype.toString;
  var PRIMITIVE_TYPES = [String, Number, RegExp, Boolean, Date];

  beforeEach(function()
  {
    this.addMatchers({
      toBeEmpty: function()
      {
        return (this.actual instanceof Array || "string"===typeof(this.actual)) && !this.actual.length;
      },

      toHaveProperty: function(prop)
      {
        try
        {
          return prop in this.actual;
        }
        catch (e)
        {
          return false;
        }
      },
      
      toHaveMethod: function(prop)
      {
        try
        {
          return prop in this.actual && 'function' == typeof(this.actual[prop]);
        }
        catch (e)
        {
          return false;
        }
      },
      
      toBeInstanceOf: function(type)
      {
        this.message = function(args)
        {
          return ["Expected", jasmine.pp(this.actual), (this.isNot ? "not" : ""), "to be of type", objectToString.call(type.prototype).slice(8, -1)].join(" ");
        }

        if (void(0)==this.actual)
          return type == void(0);

        if (-1 !== PRIMITIVE_TYPES.indexOf(this.actual.constructor))
          return this.actual.constructor == type;

        return this.actual instanceof type;
      }
    });
  });

})();
