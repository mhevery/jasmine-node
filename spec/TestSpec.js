describe('jasmine-node-flat', function(){
  it('should pass', function(){
    expect(1+2).toEqual(3);
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
