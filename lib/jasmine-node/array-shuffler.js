var previous;

// MINSTD Lehmer random number generator
var MODULUS = Math.pow( 2, 31 ) - 1, MULTIPLIER = 48271, INCREMENT = 0;
var randInt = function() {
  return previous = ( previous * MULTIPLIER + INCREMENT ) % MODULUS;
};

var rand = function( range ) {
  if( range == 0 ) {
    return 0;
  }

  // Doesn't provide a very uniform distribution - but good enough
  // for shuffling tests
  return randInt() % range;
};

exports.seedRandom = function( seed ) {
  var moduloSeed;
  if( typeof seed != 'undefined' ) {
    moduloSeed = seed % MODULUS;
  } else {
    moduloSeed = Math.floor( Math.random() * ( Math.pow( 2, 31 ) - 2 ) );
  }
  console.log( 'Shuffling tests with seed ' + moduloSeed );
  previous = moduloSeed;
};

exports.shuffle = function( array ) {
  // Fisher-Yates shuffle, as implemented by Durstenfeld
  for( var i = array.length - 1; i > 0; i-- ) {
    var swapIndex = rand( i - 1 );
    var temp = array[ swapIndex ];
    array[ swapIndex ] = array[ i ];
    array[ i ] = temp;
  }
};

