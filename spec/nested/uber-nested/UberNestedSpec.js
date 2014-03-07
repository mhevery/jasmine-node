describe('jasmine-node-uber-nested', function(){
  it('should pass', function(){
    expect(1+2).toEqual(3);
  });

  describe('failure', function(){
    it('should report passing', function(){
      expect(false).toBeFalsy();
    });
  });
});
