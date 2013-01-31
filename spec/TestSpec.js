describe('jasmine-node-flat', function(){
  it('should pass', function(){
    expect(1+2).toEqual(3);
  });
});

describe('Testing some characters', function()  {
    var chars = ['&', '\'', '"', '<', '>'];
    for(var i = 0; i < chars.length; i+=1)  {
        currentChar = chars[i];
        it('should reject ' + currentChar, (function(currentChar)  {
            expect(false).toEqual(false);
        })(currentChar));
    }
});

describe('Testing waitsfor functionality', function() {
    it("Runs and then waitsFor", function() {
        runs(function() {
            1+1;
        });
        waitsFor(function() {
            return true === false;
        }, "the impossible", 1000);
        runs(function() {
            expect(true).toBeTruthy();
        });
    });
});

describe('root', function () {

  describe('nested', function () {

    xit('nested statement', function () {
      expect(1).toBeTruthy();
    });

  });

  it('root statement', function () {
    expect(1).toBeTruthy();
  });

});
