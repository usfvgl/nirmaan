var ds = {
  make: function(config, callback) {
    //parameters
    var rng = new Math.seedrandom(config.seed);
    var numPoints = config.numPoints;
    var numClasses = config.numClasses;
    var numBlobs = config.numBlobs;
    var radii = config.radii;

    // min and max values are usually set with a margin so that points don't get draw on axises
    var minVal = config.minVal; // maximum value for point
    var maxVal = config.maxVal; // minimum value for point

    // inner array contains number of points per class in this blob
    // points[0][1] would the the number of points in blob 0 for class 1
    var points = config.sliders.map(function(ps) {
      return ps.map(function(p) {
        return p;
      })
    })


    var allClasses = ["A", "B", "C", "D", "E", "F"];
    var currentClasses = [];
    for (var i = 0; i < numClasses; i++) {
      currentClasses.push(allClasses[i]);
    };

    //centers of each blob.  should match number of elements in points
    var centers = [];
    if ("centers" in config && config.centers[0].length > 0) {
      centers = config.centers.map(function(ps) {
        return ps.map(function(p) {
          return p;
        })
      })
    } else {
      centers = getCenters(numBlobs, minVal, maxVal);
    }

    // randomizes the order of classes
    // var classes = randomizeArray(currentClasses)
    var classes = currentClasses;

    var data = [];

    // helper functions
    // generates a random point within a circle area
    // https://stackoverflow.com/questions/5837572/generate-a-random-point-within-a-circle-uniformly/50746409#50746409
    function rpoint(centerX, centerY, radius) {
      var r = radius * Math.sqrt(getRandom(0, 1));
      var theta = getRandom(0, 1) * 2 * Math.PI;
      var x = centerX + r * Math.cos(theta);
      var y = centerY + r * Math.sin(theta);
      return [x.toFixed(10), y.toFixed(10)];
    }

    // helper function to shuffle array
    //https://javascript.info/task/shuffle
    function shuffle(oldArray) {
      var array = JSON.parse(JSON.stringify(oldArray))
      for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(rng() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
      }
      return array;
    }

    // helper function to rotate a point along the x axis
    function rotateX(x, y, theta) {
      return x * Math.cos(theta) - y * Math.sin(theta);
    }

    // helper function to rotate a point along the y axis
    function rotateY(x, y, theta) {
      return x * Math.sin(theta) - y * Math.cos(theta);
    }

    // helper function that gets a random integer between the upper and lower bounds
    function getRandomInteger(lower, upper) {
      console.assert(arguments.length === 2, "getRandomInteger() requires lower and upper parameters.");
      return Math.floor(rng() * (upper - lower)) + lower;
    }

    // helper function that andomizes the array
    function randomizeArray(array) {
      for (var i = 0; i < array.length; i++) {
        randomIndex = getRandomInteger(i, array.length);
        var temp = array[i];
        array[i] = array[randomIndex];
        array[randomIndex] = temp;
      }
      newArray = array;
      return newArray;
    }

    // helper function that gets a random float between min and max
    function getRandom(min, max) {
      return rng() * (max - min) + min;
    }
    // helper function that returns the centers for each blob
    function getCenters(numBlobs, min, max) {

      var allCenters = [
        [
          [5, 5]
        ],
        [
          [2.25, 2.25],
          [7.75, 7.75]
        ],
        [
          [5, 8],
          [2.25, 3],
          [7.75, 3]
        ],
        [
          [3, 7.5],
          [7, 7.5],
          [3, 2.5],
          [7, 2.5]
        ],
        [
          [2.5, 8],
          [7.5, 8],
          [2.5, 2],
          [7.5, 2],
          [5, 5]
        ],
        [
          [2, 8.5],
          [8, 8.5],
          [2, 2],
          [8, 2],
          [5, 6.5],
          [5, 3.5]
        ]
      ];

      var centers = allCenters[numBlobs - 1];
      for (var i = 0; i < centers.length; i++) {
        var blob = centers[i];
        for (var j = 0; j < blob.length; j++) {
          blob[j] = (((blob[j] - 0.15) * (max - min)) / (9.85 - 0.15)) + min;
        };
        centers[i] = blob;
      };

      return centers;
    }

    // actual point generation
    for (var i = 0; i < centers.length; i++) {
      var center = centers[i];
      for (var j = 0; j < points[i].length; j++) {
        var c = classes[j];
        for (var k = 0; k < points[i][j]; k++) {
          var p = rpoint(center[0], center[1], radii[i]);
          var point = {
            xDom: p[0],
            yDom: p[1],
            class: c
          }
          data.push(point);
        };
      };
    };

    if (config.shuffle === false) {
      callback({
        "data": data,
        "centers": centers
      });
    } else {
      callback({
        "data": shuffle(data),
        "centers": centers
      });
    }
  }
}
