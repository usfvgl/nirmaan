// helper function from github.com/usfvgl/defaults-centroid/
function getClassCentroid(data, selectedclass, xDomain, yDomain) {
  var classData = data.filter(function(d) {
    return d.class == selectedclass;
  });
  var xAvg = d3.mean(classData, function(d) {
    return d[xDomain]
  })
  var yAvg = d3.mean(classData, function(d) {
    return d[yDomain]
  })
  centroid = {
    "xAvg": xAvg,
    "yAvg": yAvg,
    "class": selectedclass
  }
  return centroid;
}

// main function to generate a chart
function chart() {
  var sample = false
  var min = 0
  var max = 10
  var colorScheme = {
    solid: ["rgb(27,158,119)", "rgb(217,95,2)", "rgb(117,112,179)", "rgb(231,41,138)", "rgb(102,166,30)", "rbg(230,171,2)"],
    faded: ["rgba(27,158,119, 0.5)", "rgba(217,95,2, 0.5)", "rgba(117,112,179, 0.5)", "rgba(231,41,138, 0.5)", "rgb(102,166,30, 0.5)", "rbga(230,171,2, 0.5)"]
  };
  var centroid_clicked = false;
  var width,
    height,
    centroids = {},
    radius = 35, // size of point
    radiusWidth = 3, //width of open circle stroke
    xDomain = "carat",
    yDomain = "price",
    zDomain = "cut",
    autoPlay = false,
    playing = false,
    currentI = 0,
    rpw = 10, //rows per second to animate
    loop,
    pause,
    datasetSize,
    drawPoints,
    play,
    drawData = {
      color: {},
      point: {
        solid: true,
        opencircle: false,
        alpha: false
      },
      buffers: {
        solid: {},
        opencircle: {},
        alpha: {}
      },
      alpha: 0.3
    };
  var centroid_circles = [];
  var margin = {
    top: 30,
    right: 20,
    bottom: 30,
    left: 20
  };
  var canvasWidth = 900;
  var canvasHeight = 450;
  width = 900 - margin.right - margin.left, // default width
    height = 450 - margin.top - margin.bottom; // default height

  function my(selection) {
    my.clicks = 0;
    my.startTime = null;
    my.endTime = null;
    selection.each(function(data) {

      //scales
      var x = d3.scaleLinear().range([margin.left, width]);
      var y = d3.scaleLinear().range([height, margin.bottom]);
      var z = d3.scaleOrdinal(colorScheme.solid);
      var z2 = d3.scaleOrdinal(colorScheme.faded);
      var legendX = d3.scaleLinear().rangeRound([0, margin.right - 70]);
      var progressX = d3.scaleLinear().range([0, 2 * Math.PI]);

      //generate chart;
      var root = this;

      canvas = root.appendChild(document.createElement("canvas")),
        context = canvas.getContext("2d");
      canvas.id = "chart-canvas"

      canvas.width = canvasWidth * devicePixelRatio;
      canvas.height = canvasHeight * devicePixelRatio;
      context.scale(devicePixelRatio, devicePixelRatio);

      canvas.style.width = canvasWidth + 'px';
      canvas.style.height = canvasHeight + 'px';

      events_canvas = root.appendChild(document.createElement("canvas"));
      econtext = events_canvas.getContext("2d");
      events_canvas.id = "events-canvas";

      events_canvas.width = canvasWidth * devicePixelRatio;
      events_canvas.height = canvasHeight * devicePixelRatio;
      econtext.scale(devicePixelRatio, devicePixelRatio);

      events_canvas.style.width = canvasWidth + 'px';
      events_canvas.style.height = canvasHeight + 'px';

      //point functions
      var point = d3.symbol()
        .size(radius)
        .context(context);

      var openpoint = d3.symbol()
        .size(radius + radiusWidth)
        .context(context);

      var openpoint_stroke = d3.symbol()
        .size(radius + radiusWidth + radiusWidth)
        .context(context);

      function drawPoint(d) {
        //draw point in context
        var selectedPoint = getSelectedPointType();

        context.translate(d.x, d.y);
        if (selectedPoint === "solid") {
          context.fillStyle = z(d[zDomain]);
          context.strokeStyle = "white";
          context.beginPath();
          point(d);
          context.closePath();
          context.fill();
          context.stroke();

        } else if (selectedPoint === "opencircle") {
          context.strokeStyle = "white"
          context.lineWidth = 2.5;
          context.beginPath();
          openpoint_stroke(d);
          context.closePath();
          context.stroke();
          context.strokeStyle = z(d[zDomain]);
          context.lineWidth = 1;
          context.beginPath();
          openpoint(d);
          context.closePath();
          context.stroke();
        } else if (selectedPoint === "alpha") {
          context.fillStyle = z(d[zDomain])
          context.globalAlpha = drawData.alpha;
          context.beginPath();
          point(d);
          context.closePath();
          context.fill();
          context.globalAlpha = 1.0;
        }
        context.translate(-d.x, -d.y);
      }

      // setup
      context.translate(margin.left, margin.top);
      context.font = "12px sans-serif";

      x.domain([min, max]);
      y.domain([min, max]);
      z.domain(d3.map(data, function(d) {
        return d[zDomain];
      }).keys().sort());

      progressX.domain([0, data.length]);

      datasetSize = data.length;

      z.domain().forEach(function(d, i) {
        //set initial values for <label>
        drawData.color[d] = {
          selected: true,
          x: margin.left + width + 5,
          y: margin.top + ((height - 30 * z.domain().length) / 2) + 5 + i * 30,
          count: 0
        };
        // also set values for event canvas circles
        var xCor = 80 + 60 * i;
        var yCor = 0;
        centroid_circles.push({
          x: xCor,
          y: yCor,
          class: d,
          fill: z2(d),
          radius: 20,
          isDragging: false
        })
        // get actual centroids
        centroids[d] = getClassCentroid(data, d, xDomain, yDomain);
        centroids[d].x = Math.floor(x(centroids[d].xAvg));
        centroids[d].y = Math.floor(y(centroids[d].yAvg));
        centroids[d].fill = z2(centroids[d].class);
        centroids[d].solidFill = z(centroids[d].class);
      });

      //draw initial points and buffers
      data.forEach(function(d) {
        d.x = Math.floor(x(d[xDomain]));
        d.y = Math.floor(y(d[yDomain]));

        drawData.color[d[zDomain]].count += 1;

        drawPoint(d);
      });

      // draw axises
      xAxis();
      yAxis();

      // define animation looping function
      function loop() {
        timer = d3.interval(function(elapsed) {
          if (playing) {
            for (var i = 0; i < rps; i++) {
              var d = data[currentI];
              d.x = Math.round(x(d[xDomain]));
              d.y = Math.round(y(d[yDomain]));
              drawPoint(d);
              incrementCurrentI();
            }
          } else {
            timer.stop();
          }
        }, 100)
      }

      //get the currently selected point type
      function getSelectedPointType() {
        var selected;
        Object.keys(drawData.point).forEach(function(p) {
          if (drawData.point[p]) {
            selected = p;
          }
        });
        return selected;
      }

      // draw x-axis
      function xAxis() {
        var tickCount = 10,
          tickSize = 6,
          ticks = x.ticks(tickCount),
          tickFormat = x.tickFormat();
        context.save();
        context.beginPath();

        ticks.forEach(function(d) {
          context.moveTo(x(d), height);
          context.lineTo(x(d), height + tickSize);
        });
        context.strokeStyle = "gray";
        context.stroke();

        context.fillStyle = "gray";
        context.beginPath();
        context.moveTo(13, height);
        context.lineTo(width, height);
        context.strokeStyle = "gray";
        context.stroke();

        context.textAlign = "center";
        context.textBaseline = "top";
        ticks.forEach(function(d) {
          context.fillText(tickFormat(d), x(d), height + 3 + tickSize);
        });
        context.restore();
      }

      // draw y-axis
      function yAxis() {
        var tickCount = 10,
          tickSize = 6,
          tickPadding = 3,
          ticks = y.ticks(tickCount),
          tickFormat = y.tickFormat(tickCount);
        context.save();
        context.beginPath();
        ticks.forEach(function(d) {
          context.moveTo(margin.left, y(d));
          context.lineTo(margin.left - 6, y(d));
        });
        context.strokeStyle = "gray";
        context.stroke();
        context.fillStyle = "gray";
        context.beginPath();
        context.moveTo(margin.left, margin.top);
        context.lineTo(margin.left, height);
        context.lineTo(margin.left - tickSize, height);
        context.strokeStyle = "gray";
        context.stroke();

        context.textAlign = "right";
        context.textBaseline = "middle";
        ticks.forEach(function(d) {
          context.fillText(tickFormat(d), margin.left - tickSize - tickPadding, y(d));
        });
        context.restore();
      }

      // increment the current count in a circular fashion on the dataset
      function incrementCurrentI() {
        currentI = (currentI + 1) % datasetSize;
      }

      // pause animation
      pause = function() {
        playing = false;
      }

      // play animation
      play = function() {
        playing = true;
        loop();
      }

      if (autoPlay) {
        play();
      }
    });

  }

  my.play = function() {
    play();
    return my;
  }

  my.pause = function() {
    pause();
    return my;
  }

  // set or get width of chart
  my.width = function(value) {
    if (!arguments.length) return width;
    canvasWidth = value;
    width = value - margin.right - margin.left;
    return my;
  };

  // set or get height of chart
  my.height = function(value) {
    if (!arguments.length) return height;
    canvasHeight = value;
    height = value - margin.top - margin.bottom;
    return my;
  };

  // set or get whether autoPlay is true or not
  my.autoPlay = function(value) {
    if (!arguments.length) return autoPlay;
    autoPlay = value;
    return my;
  }

  // set or get animation speed (rows to animate per second)
  my.animationSpeed = function(value) {
    if (!arguments.length) return rps;
    rps = value;
    return my;
  }

  // set or get type of point for chart
  my.pointType = function(value) {
    if (!arguments.length) return drawData.point[value];
    drawData.point = {
      solid: false,
      opencircle: false,
      alpha: false
    }
    drawData.point[value] = true;
    return my;
  }

  // set or get radius of point
  my.radius = function(value) {
    if (!arguments.length) return radius;
    radius = value;
    return my;
  }

  // set or get name of xDomain of chart
  my.xDomain = function(newXDomain) {
    if (!arguments.length) return xDomain;
    xDomain = newXDomain;
    return my;
  }

  // set or get name of yDomain of chart
  my.yDomain = function(newYDomain) {
    if (!arguments.length) return yDomain;
    yDomain = newYDomain;
    return my;
  }

  // set or get name of zDomain of chart
  my.zDomain = function(newZDomain) {
    if (!arguments.length) return zDomain;
    zDomain = newZDomain;
    return my;
  }

  my.max = function(value) {
    if (!arguments.length) return max;
    max = value;
    return my;
  }

  my.min = function(value) {
    if (!arguments.length) return min;
    min = value;
    return my;
  }

  // shows real centroids of the chart
  my.realCentroid = function() {
    var canvas = document.getElementById("chart-canvas")
    var ecanvas = document.getElementById("events-canvas")
    var econtext = ecanvas.getContext("2d");
    var context = canvas.getContext("2d");

    econtext.clearRect(0, 0, events_canvas.width, events_canvas.width);
    econtext.save();

    econtext.translate(margin.left, margin.top);
    econtext.globalCompositeOperation = "multiply";

    Object.keys(centroids).forEach(function(d, i) {
      //draw centroid circles
      econtext.beginPath();
      econtext.arc(centroids[d].x, centroids[d].y, 20, 0, 2 * Math.PI, false);
      econtext.lineWidth = 6;
      econtext.strokeStyle = "white";
      econtext.stroke();
      econtext.beginPath();
      econtext.moveTo(centroids[d].x - 3, centroids[d].y);
      econtext.lineTo(centroids[d].x + 3, centroids[d].y);
      econtext.stroke();
      econtext.beginPath();
      econtext.moveTo(centroids[d].x, centroids[d].y - 3);
      econtext.lineTo(centroids[d].x, centroids[d].y + 3);
      econtext.stroke();

      econtext.beginPath();
      econtext.arc(centroids[d].x, centroids[d].y, 20, 0, 2 * Math.PI, false);
      econtext.lineWidth = 1;
      econtext.strokeStyle = centroids[d].solidFill;
      econtext.stroke();
      econtext.stroke();
      econtext.beginPath();
      econtext.moveTo(centroids[d].x - 3, centroids[d].y);
      econtext.lineTo(centroids[d].x + 3, centroids[d].y);
      econtext.stroke();
      econtext.stroke();
      econtext.beginPath();
      econtext.moveTo(centroids[d].x, centroids[d].y - 3);
      econtext.lineTo(centroids[d].x, centroids[d].y + 3);
      econtext.stroke();
      econtext.stroke();
    })
    econtext.restore();
  }

  return my;
}
