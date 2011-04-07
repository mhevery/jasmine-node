describe("helper", function()
{
  it("should load the helpers", function()
  {
    var foo= {
      bar: "baz"
    };

    expect(foo).toHaveProperty('bar');
  });
});