define "formal", ->
  class Formal
    constructor: (@object) ->
        # nada
 
require ["formal"], (F) ->
  describe "Formal", ->
    expect(F.stuff()).toEqual 5
