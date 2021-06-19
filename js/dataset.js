var sliders = [];
var chartData;
var data;
var params;
var classes = ['c-1-color', 'c-2-color', 'c-3-color', 'c-4-color', 'c-5-color', 'c-6-color'];


// https://medium.com/@danny.pule/export-json-to-csv-file-using-javascript-a0b7bc5b00d2
function convertToCSV(objArray) {
  var array = typeof objArray != 'object' ? JSON.parse(objArray) : objArray;
  var str = '';

  for (var i = 0; i < array.length; i++) {
    var line = '';
    for (var index in array[i]) {
      if (line != '') line += ','

      line += array[i][index];
    }

    str += line + '\r\n';
  }

  return str;
}

function exportCSVFile(headers, items, fileTitle) {
  if (headers) {
    items.unshift(headers);
  }

  // Convert Object to JSON
  var jsonObject = JSON.stringify(items);

  var csv = this.convertToCSV(jsonObject);

  var exportedFilename = 'export.csv';

  var blob = new Blob([csv], {
    type: 'text/csv;charset=utf-8;'
  });
  if (navigator.msSaveBlob) { // IE 10+
    navigator.msSaveBlob(blob, exportedFilename);
  } else {
    var link = document.createElement("a");
    if (link.download !== undefined) { // feature detection
      // Browsers that support HTML5 download attribute
      var url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", exportedFilename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }
}

function downloadJSON() {
  var jsonData = JSON.stringify(params);
  var blob = new Blob([jsonData], {
    type: 'application/json'
  });

  var exportedFilename = "config.json";

  if (navigator.msSaveBlob) { // IE 10+
    navigator.msSaveBlob(blob, exportedFilename);
  } else {
    var link = document.createElement("a");
    if (link.download !== undefined) { // feature detection
      // Browsers that support HTML5 download attribute
      var url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", exportedFilename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }
}


function setErrorMessage(msg) {
  $("#errorMessage .message-body").html(msg)
  $("#errorMessage").removeClass("is-hidden")
  $(document).scrollTop($("#errorMessage").offset().top)
}

function newError(text) {
  return "<p><span class='tag is-danger'>Error</span> " + text + "</p>"
}

function appendSliderHTML(i, nClasses) {
  let box = document.createElement('div');
  box.classList.add('box');

  document.getElementById('sliders').appendChild(box);

  let header = box.appendChild(document.createElement('h4'))
  header.classList.add('title');
  header.classList.add('is-4');
  header.innerHTML = `Blob ${i + 1} Configuration`;

  // setup distribution legend
  let legendDiv = box.appendChild(document.createElement('div'));
  legendDiv.classList.add('columns');
  legendDiv.classList.add('is-vcentered');

  let legendLabel = legendDiv.appendChild(document.createElement('div'));
  legendLabel.classList.add('column');
  legendLabel.classList.add('is-2');
  legendLabel.classList.add('has-text-right-tablet');
  legendLabel.innerHTML = `
    <label class="label">
      <span>Class Distribution</span>
      <span class="icon has-text-info tooltip has-tooltip-arrow" data-tooltip="percent of points per class, modified via the sliders below">
        <i class="fas fa-info-circle"></i>
      </span>
      <em class="help has-text-weight-normal mt-0 has-text-right-tablet">required</em>
    </label>
  `;

  let legendContent = legendDiv.appendChild(document.createElement('div'));
  legendContent.classList.add('column');

  let legendTags = legendContent.appendChild(document.createElement('div'));
  legendTags.classList.add('tags');
  legendTags.classList.add('has-addons');
  legendTags.classList.add('are-medium');
  legendTags.id = `tags-${i}`;

  for (let j = 0; j < nClasses; j++) {
    let tag = legendTags.appendChild(document.createElement('div'));
    tag.classList.add('tag')
    tag.classList.add('legend-tag')
    tag.classList.add(classes[j])
    tag.innerHTML = `${(100/nClasses).toFixed(2)}%`;
  };

  // setup sliders
  let sliderDiv = box.appendChild(document.createElement('div'));
  sliderDiv.id = `slider-${i}`;
  sliderDiv.classList.add('slider');

  // setup form for center coordinates
  let centerDiv = box.appendChild(document.createElement('div'));
  centerDiv.innerHTML = `
  <div class="columns">
    <div class="column is-4"> <!-- radius -->
      <div class="columns is-mobile is-vcentered">
        <div class="column">
          <label class="label has-text-right">
            <span>Blob Radius<span>
            <span class="icon has-text-info tooltip has-tooltip-arrow" data-tooltip="the radius of this blob, relative to the min and max values">
              <i class="fas fa-info-circle"></i>
            </span>
            <em class="help has-text-weight-normal mt-0 has-text-right">required</em>
          </label>
        </div>

        <div class="column">
          <div class="control">
            <input class="input radius" type="text" value="1" id="radius${i}" required>
          </div>
        </div>
      </div>
    </div>

    <div class="column is-2-tablet is-half-mobile has-text-right"> <!-- center -->
      <label class="label">
        <span>Blob Center<span>
        <span class="icon has-text-grey-lighter tooltip has-tooltip-arrow" data-tooltip="the center x and y values of this blob (optional)">
          <i class="fas fa-info-circle"></i>
        </span>
        <em class="help has-text-grey has-text-weight-normal mt-0">optional</em>
      </label>
    </div>

    <div class="column is-3"> <!-- center x -->
      <div class="columns is-vcentered is-mobile">
        <div class="column has-text-right is-narrow-tablet">
          <label class="label">x</label>
        </div>

        <div class="column">
          <input class="input coord" type="text" id="xCoord${i}" placeholder="optional">
        </div>
      </div>
    </div>

    <div class="column is-3"> <!-- center y -->
      <div class="columns is-vcentered is-mobile">
        <div class="column has-text-right is-narrow-tablet">
          <label class="label">y</label>
        </div>

        <div class="column">
          <input class="input coord" type="text" id="yCoord${i}" placeholder="optional">
        </div>
      </div>
    </div>
  </div>
  `;
}

function formChecks(p) {
  var errors = ""
  var pass = true
  var centerSet = false

  if (p.numPoints <= 0) {
    errors += newError("The number of points per blob must be greater than 0.")
  }

  if (p.maxVal <= p.minVal) {
    errors += newError("The max value must be greater than the min value.")
  }

  for (var i = 0; i < p.centers.length; i++) {
    var center = p.centers[i];
    if (center.length !== 2) {
      if (centerSet) {
        errors += newError("Blob " + (i + 1) + " is missing center coodinates.  If you set center coordinates for any blobs, you must set center coordinates for all blobs.")
      }

    } else {
      centerSet = true
      if (center[0] < p.minVal || center[0] > p.maxVal || center[1] < p.minVal || center[1] > p.maxVal) {
        errors += newError("Blob " + (i + 1) + " has invalid center coordinates.  A blob's center coordinates must fall between the min and max values.")
      }
    }
  };


  for (var i = 0; i < p.radii.length; i++) {
    if (isNaN(p.radii[i])) {
      errors += newError("Blob " + (i + 1) + " has an invalid radius.  This field is required.");
    }
  };


  if (errors.length > 0) {
    pass = false
  }

  return {
    pass: pass,
    err: errors
  }

}

function generateSliders(callback) {
  var min = 0;
  var max = parseInt($("#numPoints").val());
  var numClasses = parseInt($("#numClasses").val());
  var numBlobs = parseInt($("#numBlobs").val());
  var values = max / 100;
  sliders = []

  if (max && numBlobs && numClasses) {
    //clear slider div
    document.getElementById("sliders").innerHTML = "";

    //generate arrays
    var start = [];
    var c = [];
    var t = [];
    for (var i = 0; i < numClasses - 1; i++) {
      start.push((max / numClasses) * (i + 1))
      c.push(true)
      t.push(wNumb({
        decimals: 0
      }))
    };

    if (numClasses == 1) {
      start = [max];
      c.push(true);
      t.push(wNumb({
        decimals: 0
      }));
    }

    c.push(true);

    for (var i = 0; i < numBlobs; i++) {
      appendSliderHTML(i, numClasses);
      var slider = document.getElementById("slider-" + i);

      noUiSlider.create(slider, {
        start: start,
        connect: c,
        range: {
          'min': [0],
          'max': [max]
        },
        pips: {
          mode: 'positions',
          values: [0, 25, 50, 75, 100],
          density: 4,
          stepped: true,
          format: wNumb({
            decimals: 0
          })
        },
        format: {
          // 'to' the formatted value. Receives a number.
          to: function(value) {
            return wNumb({
              decimals: 0
            }).to(value);
          },
          // 'from' the formatted value.
          // Receives a string, should return a number.
          from: function(value) {
            return wNumb({
              decimals: 0
            }).from(value);
          }
        },
        tooltips: t
      }, true);

      if (numClasses == 1) {
        slider.setAttribute('disabled', true);
      }

      var connect = slider.querySelectorAll('.noUi-connect');
      for (var j = 0; j < connect.length; j++) {
        connect[j].classList.add(classes[j]);
      }
      sliders.push(slider);
    };

  }

  $("button.minimize").on("click", function(e) {
    e.preventDefault()
    var i = e.currentTarget.getAttribute("i")
    var dropdown = document.getElementById("dropdown-menu" + i)
    dropdown.classList.toggle('is-hidden');
  })

  sliders.forEach(function(slider, i) {
    slider.noUiSlider.on("set", function() {
      params = getParams()
      var tags = document.getElementById("tags-" + i)
      tags.innerHTML = ""
      for (var j = 0; j < params.numClasses; j++) {
        var tag = document.createElement("div");
        tag.classList.add("tag")
        tag.classList.add("legend-tag")
        tag.classList.add(classes[j])
        tag.innerHTML = ((params.sliders[i][j] / params.numPoints) * 100).toFixed(2) + "%";
        tags.appendChild(tag)
      };
    })
  })

  if (callback) {
    callback()
  }
}

function getParams() {
  var numPoints = parseInt($("#numPoints").val());
  var numClasses = parseInt($("#numClasses").val());
  var numBlobs = parseInt($("#numBlobs").val());
  var minVal = parseFloat($("#minVal").val());
  var maxVal = parseFloat($("#maxVal").val());
  var seed = $("#seed").val();
  var shuffle = $("#shuffle").prop('checked');
  var sliderVals = [];
  var centers = [];
  var radii = [];

  if (seed.trim().length === 0) {
    seed = new Date().getMilliseconds().toString()
  }
  for (var i = 0; i < sliders.length; i++) {
    var sliderV = sliders[i].noUiSlider.get();

    // get center vals
    var cenX = parseFloat($("#xCoord" + i).val());
    var cenY = parseFloat($("#yCoord" + i).val());
    var center = [];
    if (!isNaN(cenX) && !isNaN(cenY)) {
      center.push(cenX)
      center.push(cenY)
    }
    centers.push(center)
    if (!Array.isArray(sliderV)) {
      sliderV = [sliderV]
    }

    // get slider vals
    sliderV.push($("#numPoints").val());
    var points = [];
    points.push(parseInt(sliderV[0]))
    for (var j = 1; j < sliderV.length; j++) {
      points.push(parseInt(sliderV[j]) - parseInt(sliderV[j - 1]));
    };
    sliderVals.push(points)

    // get radius
    var radius = parseFloat($("#radius" + i).val());
    radii.push(radius);
  };
  params = {
    numPoints: numPoints,
    numClasses: numClasses,
    numBlobs: numBlobs,
    minVal: minVal,
    maxVal,
    maxVal,
    radii: radii,
    sliders: sliderVals,
    centers: centers,
    shuffle: shuffle,
    seed: seed
  }

  return params
}

function submitForm() {

  params = getParams()
  var result = formChecks(params)

  if (result.pass) {
    if (chartData) {
      chartData.pause()
    }
    generateConfig(params)
    ds.make(params, updateResult)

  } else {
    setErrorMessage(result.err)
  }
}

function updateResult(d) {
  data = JSON.parse(JSON.stringify(d.data))
  document.getElementById("sampleChart").innerHTML = "";

  $("#sampleChart").append('<h3 class="title is-3">Generated Dataset</h3>');
  $("#sampleChart").append('<p>The crosshairs below show the center of each class, calculated as the average <em>x</em> and <em>y</em> value for all points of that class.</p>');
  $("#sampleChart").append('<p><label class="checkbox"><input type="checkbox" id="play" onchange="play(this)"> Animate Points?</label> <span class="icon has-text-grey-lighter tooltip has-tooltip-arrow has-tooltip-right" data-tooltip="loops through dataset and continuously redraws points"><i class="fas fa-info-circle"></i></span></p>');

  // update center input values
  // for (let i = 0; i < d.centers.length; i++) {
  //   let xInput = `#xCoord${i}`;
  //   let yInput = `#yCoord${i}`;
  //
  //   $(xInput).val(d.centers[i][0]);
  //   $(yInput).val(d.centers[i][1]);
  // }

  // update center configuration in json textarea
  let config = JSON.parse($("#configArea").val());
  config.centers = d.centers; // needed for display
  params.centers = d.centers; // needed for download
  $("#configArea").val(JSON.stringify(config));

  chartData = chart()
    .width(600)
    .height(600)
    .autoPlay(false)
    .animationSpeed(85)
    .pointType("solid")
    .xDomain("xDom")
    .yDomain("yDom")
    .zDomain("class")
    .max(params.maxVal)
    .min(params.minVal)

  d3.select("#sampleChart")
    .datum(d.data)
    .call(chartData);
  chartData.realCentroid()

  $("#sampleChart").append('<p><button class="button is-primary" onclick="download()"><span class="icon"><i class="fas fa-download"></i></span> <span>Download CSV</span></button> &nbsp; <button class="button is-primary" onclick="downloadJSON()"><span class="icon"><i class="fas fa-download"></i></span> <span>Download JSON</span></button>');

  $(document).scrollTop($("#sampleChart").offset().top);
}

function download() {
  var headers = {
    xDom: 'xDom',
    yDom: "yDom",
    class: "class"
  };
  exportCSVFile(headers, data);

}

function play(elem) {
  if (elem.checked) {
    chartData.play();
  } else {
    chartData.pause();
  }
}

function generateConfig(params) {
  $("#seed").val(params.seed)
  $("#configArea").val(JSON.stringify(params))
}

function loadConfig() {
  var config = JSON.parse($("#configArea").val())
  $("#numPoints").val(config.numPoints)
  $("#numClasses").val(config.numClasses)
  $("#numBlobs").val(config.numBlobs);
  $("#minVal").val(config.minVal);
  $("#maxVal").val(config.maxVal);
  $("#seed").val(config.seed);
  $("#shuffle").prop('checked', config.shuffle);


  generateSliders(function() {
    for (var i = 0; i < config.sliders.length; i++) {
      for (var j = 1; j < config.sliders[i].length; j++) {
        config.sliders[i][j] += config.sliders[i][j - 1]
      }
      if (config.sliders[i].length > 0) {
        sliders[i].noUiSlider.set(config.sliders[i].slice(0, config.sliders[i].length - 1))
      }

      if (config.centers.length == config.sliders.length) {
        var xCoords = "#xCoord" + i;
        $(xCoords).val(config.centers[i][0]);
        var yCoords = "#yCoord" + i;
        $(yCoords).val(config.centers[i][1]);
      }

      if (config.radii.length == config.sliders.length) {
        var radius = "#radius" + i;
        $(radius).val(config.radii[i]);
      }
    };
  });

  submitForm()


}

$(document).ready(function() {
  generateSliders();

  // https://codepen.io/brussell98/pen/mEwxjP?editors=1010
  let cardToggles = document.getElementsByClassName('card-toggle');
  for (let i = 0; i < cardToggles.length; i++) {
    cardToggles[i].addEventListener('click', e => {
      e.currentTarget.parentElement.parentElement.childNodes[3].classList.toggle('is-hidden');
    });
  }
  $("#dataConfig").on("change", function(e) {
    if (!e.target.classList.contains("coord") && e.target.id !== "shuffle" && e.target.id !== "seed" && !e.target.classList.contains("radius")) {
      generateSliders();
    }
  })

  $("#submit").on("click", function(e) {
    e.preventDefault();
    submitForm();
  })
  $(".delete").on("click", function(e) {
    e.preventDefault();
    $("#errorMessage").addClass("is-hidden")
  })

  $("#loadConfig").on("click", function(e) {
    e.preventDefault();
    loadConfig()
  })

  $("#generateConfig").on("click", function(e) {
    e.preventDefault();
    generateConfig()
  })
})
