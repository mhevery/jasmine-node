describe('jasmine-node', function(){
  it('should report failure (THIS IS EXPECTED)', function(){
    expect('true').toBeFalsy();
  });

  it('should pass', function(){
    expect(1+2).toEqual(3);
  });

  asyncIt('shows asynchronous test', function(){
    setTimeout(function(){
      expect('second').toEqual('second');
      asyncSpecDone();
    }, 1);
    expect('first').toEqual('first');
  });
});
