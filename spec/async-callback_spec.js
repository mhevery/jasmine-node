describe('async-callback', function() {
  var env;
  beforeEach(function() {
    env = new jasmine.Env();
  });

  describe('it', function() {

    it("should time out if callback is not called", function() {
      env.describe("it", function() {
        env.it("doesn't wait", function(done) {
          this.expect(1+2).toEqual(3);
        });
      });

      env.currentRunner().execute();

      waitsFor(function() {
        return env.currentRunner().results().totalCount > 0;
      });

      runs(function() {
        expect(env.currentRunner().results().failedCount).toEqual(1);
        expect(firstResult(env.currentRunner()).message).toMatch(/timeout/);;
      });
    });

    it("should fail if callback is passed error", function() {
       env.describe("it", function() {
        env.it("doesn't wait", function(done) {
          process.nextTick(function() {
            done("Failed asynchronously");
          });
        });
      });

      env.currentRunner().execute();

      waitsFor(function() {
        return env.currentRunner().results().totalCount > 0;
      });

      runs(function() {
        expect(env.currentRunner().results().failedCount).toEqual(1);
        expect(firstResult(env.currentRunner()).message).toEqual("Failed asynchronously");
      });
    });
    

    it("should finish after callback is called", function() {
      env.describe("it", function() {
        env.it("waits", function(done) {
          process.nextTick(function() {
            env.currentSpec.expect(1+2).toEqual(3);
            done();
          });
        });
      });

      env.currentRunner().execute();

      waitsFor(function() {
        return env.currentRunner().results().totalCount > 0;
      }, 2000);

      runs(function() {
        expect(env.currentRunner().results().passedCount).toEqual(1);
      });
    });

  });

  describe("beforeEach", function() {
    it("should wait for callback", function() {
      env.describe("beforeEach", function() {
        var waited = false;
        env.beforeEach(function(done) {
          process.nextTick(function() {
            waited = true;
            done();
          });
        });
        env.it("waited", function() {
          env.currentSpec.expect(waited).toBeTruthy();
        });
      });

      env.currentRunner().execute();

      waitsFor(function() {
        return env.currentRunner().results().totalCount > 0;
      });

      runs(function() {
        expect(env.currentRunner().results().passedCount).toEqual(1);
      });
    });
  });

  describe("afterEach", function() {
    it("should be passed async callback", function() {
      var completed = false;
      env.describe("afterEach", function() {
        env.afterEach(function(done) {
          process.nextTick(function() {
            done('Failed in afterEach');
            completed = true;
          });
        });
        env.it("should pass", function() {
          this.expect(1+2).toEqual(3);
        });
      });

      env.currentRunner().execute();

      waitsFor(function() {
        return completed === true;
      });

      runs(function() {
        expect(env.currentRunner().results().passedCount).toEqual(1);
        expect(env.currentRunner().results().failedCount).toEqual(1);
      });
    });
  });
});

function firstResult(runner) {
  return runner.results().getItems()[0].getItems()[0].getItems()[0];
}
