describe('jasmine-node-flat', function(){
  it('should pass', function(){
    expect(1+2).toEqual(3);
  });
  xit('should skip this one', function(){
    expect(1+2).toEqual(3);
  });
  describe('jasmine-node-flat-nested', function(){
      it('should also pass', function(){
          expect(3).toBe(3);
      });
  });
});

describe('jasmine-node-deep-nest-incorrect', function(){
    describe('jasmine-sub-describe', function() {
        it("should handle an it within a deep describe", function() {
            expect(1).toBe(1);
        });
        it("should handle an it within a deep describe2", function() {
            expect(1).toBe(1);
        });
    });
    it('should pass', function(){
        expect(1+2).toEqual(3);
    });
  xit('should skip this one', function(){
    expect(1+2).toEqual(3);
  });
  describe('jasmine-node-flat-nested', function(){
      it('should also pass', function(){
          expect(3).toBe(3);
      });
  });
});

describe('jasmine.any tests', function() {
  it('handles string and not string', function() {
      expect('abc').toEqual(jasmine.any(String));
      expect(function(){}).not.toEqual(jasmine.any(String));
      expect(123123).not.toEqual(jasmine.any(String));
      expect({a:true}).not.toEqual(jasmine.any(String));
      expect(true).not.toEqual(jasmine.any(String));
  });
  it('handles number and not number', function() {
      expect(123123).toEqual(jasmine.any(Number));
      expect('abc').not.toEqual(jasmine.any(Number));
      expect(function(){}).not.toEqual(jasmine.any(Number));
      expect({a:true}).not.toEqual(jasmine.any(Number));
      expect(true).not.toEqual(jasmine.any(Number));
  });
  it('handles function and not function', function() {
      expect(function(){}).toEqual(jasmine.any(Function));
      expect(123123).not.toEqual(jasmine.any(Function));
      expect('abc').not.toEqual(jasmine.any(Function));
      expect({a:true}).not.toEqual(jasmine.any(Function));
      expect(true).not.toEqual(jasmine.any(Function));
  });
  it('handles object and not object', function() {
      expect({a:true}).toEqual(jasmine.any(Object));
      expect(function(){}).not.toEqual(jasmine.any(Object));
      expect(123123).not.toEqual(jasmine.any(Object));
      expect('abc').not.toEqual(jasmine.any(Object));
      expect(true).not.toEqual(jasmine.any(Object));
  });
  it('handles boolean and not boolean', function() {
      expect(true).toEqual(jasmine.any(Boolean));
      expect({a:true}).not.toEqual(jasmine.any(Boolean));
      expect(function(){}).not.toEqual(jasmine.any(Boolean));
      expect(123123).not.toEqual(jasmine.any(Boolean));
      expect('abc').not.toEqual(jasmine.any(Boolean));
  });
});


describe('beforeEach Timeout', function(){
  beforeEach(function(done) {
      setTimeout(done, 1000);
  }, 100);
  it('should fail', function(){
    expect(1+2).toEqual(3);
  });
});

describe('afterEach Timeout', function(){
  afterEach(function(done) {
      setTimeout(done, 1000);
  }, 100);
  it('should pass and then afterEach will fail', function(){
    expect(1+2).toEqual(3);
  });
});

describe('Testing done functionality', function() {
    it("calls done", function(done) {
        1+1;
        expect(true).toBeTruthy();
        done();
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

describe("Top level describe block", function() {
  it("first it block in top level describe", function() {
    expect(true).toEqual(true);
  });
  describe("Second level describe block", function() {
    it("first it block in second level describe", function() {
      expect(true).toBe(true);
    });
  });
  it("second it block in top level describe", function() {
    expect(true).toEqual(true);
  });
});

describe('async', function () {

    var request = function (str, func) {
        func('1', '2', 'hello world');
    };

    it("should respond with hello world", function(done) {
        request("http://localhost:3000/hello", function(error, response, body){
            expect(body).toEqual("hello world");
            done();
        });
    });

    it("should respond with hello world", function(done) {
        request("http://localhost:3000/hello", function(error, response, body){
            expect(body).toEqual("hello world");
            done();
        });
    }, 250); // timeout after 250 ms

});
