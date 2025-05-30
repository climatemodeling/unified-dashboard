// require modules

// external modules
const Tabulator = require('tabulator-tables');
const Choices = require('choices.js');
const Slideout = require('slideout');
//const domtoimage = require('dom-to-image-more');
const domtoimage = require('dom-to-image');
//const { jsPDF } = require("../../node_modules/jspdf/dist/jspdf.node.min.js");
const { jsPDF } = window.jspdf;

// internal modules
var lmt_tool = require('./lmt_tool.js');
var tabOptions = require('./tabOptions.js');
var globalVars = require('./globalVars.js');

var tabOption = tabOptions.tabOption;
tabOption.dataTreeStartExpanded = function (row, level) {
     return setLevelExpand(row, level); //expand rows where the "driver" data field is true;
};

// add a controller


const linkTemplate = "{metric.0}/{metric.1}/{metric.2}/{metric.2}.html?model={model}&region={region}";

//globalize functions
window.loadlocJson = loadlocJson;
window.tableColor = tableColor;
window.expandCollapse = expandCollapse;
window.savetoHtml = savetoHtml;
window.cycleColumnSort = cycleColumnSort;


window.lmtUDLoaded = 1;

DEBUG = true; // set to false to disable debugging
old_console_log = console.log;
console.log = function () {
  if (DEBUG) {
    old_console_log.apply(this, arguments);
  }
};

// Control the tabulator for LMT Unified Dashboard

jsonFileURL =
  'https://raw.githubusercontent.com/minxu74/benchmark_results/master/';
const corsProxy = 'https://cors-anywhere.herokuapp.com/'; // cors proxy to remove the cors limit

const bgColorGroup = ['#ECFFE6', '#E6F9FF', '#FFECE6', '#EDEDED', '#FFF2E5'];
const bgColorGroupFirstRow = ['#FFFF00', '#00FF00', '#FFFFFF'];
const fgColorGroupFirstRow = ['#000000', '#000000', '#000000'];

const class4Color = "p-1 h-6 w-6 inline bg-white border border-gray-200 cursor-pointer rounded-lg disabled:opacity-50 disabled:pointer-events-none dark:bg-neutral-900 dark:border-neutral-700";
const labelCode = "<label for='favcolor'> Background Color: </label>";

// colors used default directly from ILAMB
const PuOr = [
  '#b35806',
  '#e08214',
  '#fdb863',
  '#fee0b6',
  '#f7f7f7',
  '#d8daeb',
  '#b2abd2',
  '#8073ac',
  '#542788'
];
const GnRd = [
  '#b2182b',
  '#d6604d',
  '#f4a582',
  '#fddbc7',
  '#f7f7f7',
  '#d9f0d3',
  '#a6dba0',
  '#5aae61',
  '#1b7837'
];

var baseUrl = './';

var isTreeTable;

var logoFile = 'rubisco_logo.png';

var cmap = PuOr;


var lmtSettings = {"tableBuilt": false, "normMethod":"-1", "cmapMethod":"-1", "logoMethod":"default", "normDir":"-1", 
                   "setTootip":false, "setTopTitle":false, "setBottomTitle":false, "setCellValue":false, "setFitScreen":true, 
		   "timesExpl":1, "numClicks":1, 
		   "stopFire":false,
		   "stopFireNorm":false};


var tabTempJson = [];
//
//

// please do not make changes below
if (jsonFileURL.includes('http')) {
  jsonFileURL = corsProxy + jsonFileURL;
}

//global variables

var dictChoices = {};

var dimSetEvent = { x_dim: null, y_dim: null, fxdim: {} };

var cmecJson;
var tabJson;
var tabTreeJson;
var table;

var ydimField;
var jsonType;

var selectIDbyDims = {};

var selectIdByDims = {};
var dimBySelectIDs = {};

var fixedDimsDict = {};
var grpsFirstCol = [];

var grpsModSrcIdx = {};
var grpsTopMetric = [];

var isJsonReady = false;
var isTableBuilt = false;

var newLabel = {};

var _config = {};

var sortState = 0;
var originalColumns = [];

var preXdim, preYdim;
var groupSavedValues = null;
var headerStyles;


//export

dictChoices = globalVars.dictChoices;

dimSetEvent = globalVars.dimSetEvent;


if (document.readyState !== 'loading') {
  initlmtUD();
} else {
  document.addEventListener('DOMContentLoaded', function () {
    initlmtUD();
  });
}

function initlmtUD() {
  // reset the file input
  // initialize the select and multiselect boxes
  document.querySelector('#file').value = '';
  initChoices();


  // initialize checkbox
  initCheckBoxes();

  // initialize the tabulator

  table = new Tabulator('#dashboard-table', tabOption);

  //var doc = window.document;
  var slideout = new Slideout({
    panel: document.getElementById('panel'),
    menu: document.getElementById('menu')
  });

  document
    .querySelector('.js-slideout-toggle')
    .addEventListener('click', function () {
      slideout.toggle();
    });



  //updateColorMapping();


  // is this a good place to insert lmtUDConfig?
  // try to find a config file

  const udcUrl = './_lmtUDConfig.json'; // in same origin
  console.log('UDEB: UD config file ', udcUrl);

  //setConfig(udcUrl);



  // Save image functions

  initSubMenu();

  document.getElementById("saveimage").selectedIndex = 0;

  document.getElementById("saveimage").addEventListener("change", function (){

     const tmpScale = Number(document.getElementById("download-image-dpi").value);
     //const imgScale = 3.;
     const imgScale = Math.floor(tmpScale/72.);
     const node = document.getElementById('dashboard-table');
     const tempvalue = this.value;
     console.log('UDEB: ', tempvalue.toLowerCase());

     width = (node.clientWidth+2);
     height = (node.clientHeight+2); 
     switch(this.value) {
       case "PNG":
         domtoimage 
           .toPng(node, {
              height: (node.clientHeight+2) * imgScale + 0, 
              width: (node.clientWidth+2) * imgScale + 0,
              style: {
                transform: "scale(" + imgScale + ")",
                transformOrigin: "top left",
                overflow: "visible",
                width: `${width}px`,
                height: `${height}px`,
              }})
           .then(function (dataUrl) {
              const dataFn = "output.png";
              downloadImage(dataUrl, dataFn);
           });

         break;
       case "SVG":
         domtoimage.toSvg(node)
           .then(function (dataUrl) {
              //var img = new Image();
              //img.src = dataUrl;
              //document.body.appendChild(img);
              const dataFn = "output.svg";
              downloadImage(dataUrl, dataFn);
           });
         break

       case "HTML":
         // using the tabulor function
         break

       case "JPEG":
         domtoimage 
           .toJpeg(node, {
              quality: 1.0,
              height: node.clientHeight * imgScale + 5, 
              width: node.clientWidth * imgScale + 5,
              style: {
                transform: "scale(" + imgScale + ")",
                transformOrigin: "top left",
                overflow: "visible",
                width: `${width}px`,
                height: `${height}px`
              }})
           .then(function (dataUrl) {
              const dataFn = "output.jpeg";
              downloadImage(dataUrl, dataFn);
           });
         break;

       case "PDF":
         const dataFn = "output.pdf";
         domtoimage 
           .toPng(node, {
              height: node.clientHeight * imgScale, 
              width: node.clientWidth * imgScale,
              style: {
                transform: "scale(" + imgScale + ")",
                transformOrigin: "top left",
                overflow: "visible",
                width: `${width}px`,
                height: `${height}px`
              }})
           .then(function (dataUrl) {
	      // jspdf will change the width and height automatically to fit the landscape or portait
	      const nodeWidth = node.clientWidth * imgScale;
	      const nodeHeight = node.clientHeight * imgScale;

	      if (nodeWidth >= nodeHeight) {
                var pdf = new jsPDF("l", "pt", [
                   nodeWidth,
                   nodeHeight
                 ]);
                 pdf.addImage(
                   dataUrl,"PNG",0,0,
                   node.clientWidth * imgScale,
                   node.clientHeight * imgScale
                 );
                 pdf.save(dataFn);
	       } else {
                var pdf = new jsPDF("p", "pt", [
                   nodeHeight,
                   nodeWidth
                ]);
                pdf.addImage(
                  dataUrl,"PNG",0,0,
                  node.clientWidth * imgScale,
                  node.clientHeight * imgScale
                );
                pdf.save(dataFn);
	      }
           });

         break;
       default:
         console.log("fallback to default");
     }
  });
}


function downloadImage (imgUrl, imgFileName) {
  var downloadLink = document.createElement('a');
  downloadLink.download = imgFileName;
  downloadLink.href = imgUrl;
  downloadLink.click();
}

function setConfig(jsfURL) {
  const udcUrl = './_lmtUDConfig.json'; // in same origin
  console.log('UDEB: UD config file ', udcUrl);
  readFile(udcUrl)
    .then(function(filePromise) {
      try {
        _config = JSON.parse(filePromise.content);
        if (_config.udcJsonLoc) {
          //let jsfUrl = window.location.href + data.udcJsonLoc;
          let jsfURL = './' + data.udcJsonLoc;

          console.log('UDEB: ', jsfURL, data.udcJsonLoc);
          loadrmtJson(jsfURL, data.udcDimSets);
        } else {
          console.log('UDEB: no JSON data file in the config file');
        }
      } 
      catch (err) {
        alert('JSON parsing config file', err.message);
      }
    })
    .catch(err => alert(err));
}


function extractCol(dataArr, colName, parentName) {
  var colData = {};
  for (data of dataArr) {
    if (parentName != '') {
      var cur_name = parentName + '::' + data.row_name;
    } else {
      var cur_name = data.row_name;
    }
    colData[cur_name] = data[colName];

    if (Object.keys(data).includes('_children')) {
      let newData = extractCol(data._children, colName, cur_name);
      colData = Object.assign({}, colData, newData);
    }
  }
  return colData;
}

function insertCol(dataArr, colName, colData, parentName) {
  try {
    for (data of dataArr) {
      if (parentName != '') {
        var cur_name = parentName + '::' + data.row_name;
      } else {
        var cur_name = data.row_name;
      }

      data[colName] = colData[cur_name];

      if (Object.keys(data).includes('_children')) {
        insertCol(data._children, colName, colData, cur_name);
      }
    }
  } catch (err) {
    console.log('UDEB:', parentName, dataArr);
  }
}

function updateColorMapping() {
    switch (dictChoices['cmapChoices'].getValue(true)) {
    case '0':
      lmtCellColorFormatter = colorILAMB;
      break;
    case '1':
      lmtCellColorFormatter = colorLinear;
      break;
    case '2':
      lmtCellColorFormatter = colorLinearReverse;
  }

  //update table options
  for (x of tabOption.columns) {
    if (x.field != 'row_name') {
      x['formatter'] = lmtCellColorFormatter;
      x['formatterParams']['scaopt'] = dictChoices['normChoices'].getValue(true);
    }
  }
}



function loadrmtJson(jsfURL, dimSet = {}) {
  if (jsfURL !== '') {
    document.getElementById('file').value = '';
    table.clearData();

    resetSwitch();
    resetSelect();

    var jqxhr = $.getJSON(jsfURL, { format: 'json' })
      .done(function (data) {
        var jsonData = data;

        switch (jsonData.SCHEMA.name) {
          case 'CMEC':
            cmecJson = data;
            jsonType = 'CMEC';

            console.log('before prepareTab');
            prepareTab(cmecJson, dimSet);

            break;

          case 'TABJSON':
            jsonType = 'TABJSON';
            var scoreboard = 'Overall Score global';
            tabTreeJson = filterScoreboard(data.RESULTS, scoreboard);

            lmt_tool.add_options(['model'], 'select-choice-mini-x');
            lmt_tool.add_options(['metric'], 'select-choice-mini-y');

            var regions = [];
            var statistics = [];

            for (row of data.RESULTS) {
              regions.push(
                row.scoreboard.split(' ')[row.scoreboard.split(' ').length - 1]
              );
              statistics.push(row.scoreboard.split(' ').slice(0, -1).join(' '));
            }

            regions = [...new Set(regions)];
            statistics = [...new Set(statistics)];
            lmt_tool.add_options(regions, 'select-choice-mini-0');
            lmt_tool.add_options(statistics, 'select-choice-mini-3');

            selectIDbyDims['region'] = 'select-choice-mini-0';
            selectIDbyDims['statistic'] = 'select-choice-mini-3';
            ydimField = 'metric';

            $('.select-choice-x').val('model');
            $('.select-choice-y').val('metric');
            $('#'.concat(selectIDbyDims['region'])).select2({
              placeholder: 'Select region'
            });
            $('#'.concat(selectIDbyDims['region']))
              .val('global')
              .trigger('change');

            $('#'.concat(selectIDbyDims['statistic'])).select2({
              placeholder: 'Select region'
            });
            $('#'.concat(selectIDbyDims['statistic']))
              .val('Overall Score')
              .trigger('change');
            lmt_tool.add_options(
              Object.keys(tabTreeJson[0]).filter(
                item =>
                  item !== 'row_name' &&
                  item !== '_children' &&
                  item !== 'metric'
              ),
              'hlist'
            );

            // set tab column
            //
            tabOption.data = tabTreeJson;
            bgcol = '#0063B2FF';
            ftwgt = 500;
            ftsty = 'normal';
            txdec = '';
            txcol = '#000000';
            let lmtTitleFormatterParams = {
              bgcol: bgcol,
              ftsty: ftsty,
              ftwgt: ftwgt,
              txdec: txdec,
              color: txcol
            };
            grpsFirstCol.length = 0;
            tabOption.columns = setTabColumns(
              tabTreeJson,
              (addBottomTitle = false),
              firstColIcon,
              lmtTitleFormatterParams,
              'model',
              'metric',
              ydimField
            );

            break;
        }

        // baseUrl
        if (cmecJson.hasOwnProperty('SETTINGS')) {
          if (cmecJson.SETTINGS.hasOwnProperty('baseUrl')) {
            baseUrl = cmecJson.SETTINGS.baseUrl;
          }
        }

        // trigger an event to indicate that the json is ready
        // -$(document).trigger('jsonReady');

        // Create a custom event
        var event = new CustomEvent('jsonReady', {
          bubbles: true, // Allow the event to bubble up the DOM tree
          cancelable: true // Allow the event to be cancelable
        });

        // Trigger the custom event on the document
        document.dispatchEvent(event);
      })
      .fail(function (jqxhr, textStatus, error) {
        var err = textStatus + ', ' + error;
        alert('Request ' + jsfURL + '\nFailed: ' + err);
      });
  }
} //loadrmtJson

function prepareTab(cJson, dimSet = {}) {
  let ini_xdim,
    ini_ydim,
    ini_fxdm = {}
    ;[ini_xdim, ini_ydim, ini_fxdm] = initDim(cJson, dimSet);

  if (Object.keys(tabTreeJson[0]).includes('_children')) {
    tabOption.dataTreeCollapseElement = '';
    tabOption.dataTreeExpandElement = '';
    isTreeTable = 1;
  } else {
    tabOption.dataTreeCollapseElement = '<span></span>';
    tabOption.dataTreeExpandElement = '<span></span>';
    isTreeTable = 0;
  }

  // add options
  lmt_tool.add_options(cJson.DIMENSIONS.json_structure, 'select-choice-mini-x');
  lmt_tool.add_options(cJson.DIMENSIONS.json_structure, 'select-choice-mini-y');
  ydimField = 'row_name';
  $('.select-choice-x').val(ini_xdim);
  $('.select-choice-y').val(ini_ydim);

  //$('#'.concat(selectIDbyDims['region'])).select2({ placeholder: 'Select region',});
  //$('#'.concat(selectIDbyDims['region'])).val('global').trigger('change');

  for (fxdim of Object.keys(ini_fxdm)) {
    console.log('UDEB:', fxdim, selectIDbyDims[fxdim], ini_fxdm[fxdim]);
    $('#'.concat(selectIDbyDims[fxdim])).select2({
      placeholder: 'Select '.concat(fxdim)
    });
    $('#'.concat(selectIDbyDims[fxdim])).val(ini_fxdm[fxdim]).trigger('change');
  }
  lmt_tool.add_options(
    Object.keys(tabTreeJson[0]).filter(
      item => item !== 'row_name' && item !== '_children' && item !== 'metric'
    ),
    'hlist'
  );

  // set tab column
  //
  tabOption.data = tabTreeJson;
  bgcol = '#0063B2FF';
  ftwgt = 500;
  ftsty = 'normal';
  txdec = '';
  txcol = '#FFFFFF';
  let lmtTitleFormatterParams = {
    bgcol: bgcol,
    ftsty: ftsty,
    ftwgt: ftwgt,
    txdec: txdec,
    color: txcol
  };
  grpsFirstCol.length = 0;
  tabOption.columns = setTabColumns(
    tabTreeJson,
    (addBottomTitle = false),
    firstColIcon,
    lmtTitleFormatterParams,
    ini_xdim,
    ini_ydim,
    ydimField
  );

  if (_config.udcCellValue == 1) {
    $('#cellvalue').prop('checked', true);
    toggleCellValue(false);
  }
}

function initChoices() {
  // mx: initialize all choices objects

  // hide items along the x dimension

  if (typeof dictChoices['hideChoices'] != "undefined") {
    dictChoices['hideChoices'].destroy();
  }
  dictChoices['hideChoices'] = new Choices(
    document.querySelector('.js-choice-hide'),
    {
      searchEnabled: false,
      shouldSort: false,
      removeItemButton: true,
      allowHTML:false,
      placeholderValue: 'Select models to show'
    }
  );

  // x and y dimensions that are always shown
  for (const dim of ['xdim', 'ydim']) {
    dictChoices[dim + 'Choices'] = new Choices(
      document.querySelector('.js-choice-' + dim),
      {
        searchEnabled: false,
        shouldSort: false,
        allowHTML:false,
        removeItemButton: false
      }
    );
  }

  // other dimensions
  for (let i = 1; i < 10; i++) {
    const dim = 'dim'.concat(i.toString());
    dictChoices[dim + 'Choices'] = new Choices(
      document.querySelector('.js-choice-'.concat(i.toString())),
      {
        searchEnabled: false,
        shouldSort: false,
        allowHTML:false,
        removeItemButton: false
      }
    );

    // hide them first during initialization
    dictChoices[dim + 'Choices'].containerInner.element.style.display = 'none';
  }

  // other single select boxes
  for (const dim of ['norm', 'cmap', 'logo']) {
    dictChoices[dim + 'Choices'] = new Choices(
      document.querySelector('.js-choice-' + dim),
      {
        searchEnabled: false,
        shouldSort: false,
        allowHTML:false,
        removeItemButton: false
      }
    );
  }
}


function initChoicesEvent(cJson) {


  // initialization

  for (let [i, dimn] of Object.entries(cJson.DIMENSIONS.json_structure)) {
    let k = parseInt(i) + 1;
    let tempChoices = dictChoices['dim' + k.toString() + 'Choices'];

    if (
      dimn == 'statistic' &&
      cJson.DIMENSIONS.dimensions[dimn].hasOwnProperty('indices')
    ) {
      tempChoices.setChoices(
        combineArraysToObject(
          cJson.DIMENSIONS.dimensions[dimn].indices,
          cJson.DIMENSIONS.dimensions[dimn].indices
        ),
        'value',
        'label',
        false
      );
    } else {
      tempChoices.setChoices(
        combineArraysToObject(
          Object.keys(cJson.DIMENSIONS.dimensions[dimn]),
          Object.keys(cJson.DIMENSIONS.dimensions[dimn])
        ),
        'value',
        'label',
        false
      );
    }

    selectIDbyDims[dimn] = 'select-choice-mini-'.concat(i.toString());
    selectIdByDims[dimn] = 'dim' + k.toString() + 'Choices';
    dimBySelectIDs['select-choice-mini-'.concat(i.toString())] = dimn;
  }

  // for x and y dims, only one initialization
  dictChoices['xdimChoices'].setChoices(
    combineArraysToObject(
      cJson.DIMENSIONS.json_structure,
      cJson.DIMENSIONS.json_structure
    ),
    'value',
    'label',
    false
  );
  dictChoices['ydimChoices'].setChoices(
    combineArraysToObject(
      cJson.DIMENSIONS.json_structure,
      cJson.DIMENSIONS.json_structure
    ),
    'value',
    'label',
    false
  );

  // end of initialization


  // x and y dims events
  for (const dim of ['xdim', 'ydim']) {
    dictChoices[dim + 'Choices'].passedElement.element.addEventListener(
      'addItem', //select item
      function (event) {
        if (lmtSettings["stopFire"]) {return;}

	if (dim == 'xdim') {newLabel = {};}

        let preValue =
          dictChoices[dim == 'xdim' ? 'ydimChoices' : 'xdimChoices'].getValue(
            true
          );
        if (event.detail.value == preValue) {
          console.log( dim, preValue, event.detail.value);
          alert(' x and y must be different ', dim, preValue, event.detail.value);
        } else {
          dimSetEvent[dim == 'xdim' ? 'x_dim' : 'y_dim'] = event.detail.value;
          dimSetEvent[dim == 'xdim' ? 'y_dim' : 'x_dim'] = preValue;
          dimSetEvent.fxdim = {};
      
          // show other dimensions' choices boxes
          console.log('selevent', selectIdByDims);
      
          console.log(dimSetEvent);
      
          if (
            dimSetEvent.x_dim != undefined &&
            dimSetEvent.y_dim != undefined
          ) {
            for (let [i, dimn] of Object.entries(
              cJson.DIMENSIONS.json_structure
            )) {
              // i start from zero
              dictChoices[
                selectIdByDims[dimn]
              ].containerInner.element.parentElement.style.display = 'block';
              dictChoices[
                selectIdByDims[dimn]
              ].containerInner.element.style.display = 'block';
              // clear other choices
              preValue = dictChoices[selectIdByDims[dimn]].getValue(true);
              dictChoices[selectIdByDims[dimn]].removeActiveItemsByValue(
                preValue
              );
              dictChoices[selectIdByDims[dimn]].clearChoices();
      
              if (
                dimn == 'statistic' &&
                cJson.DIMENSIONS.dimensions[dimn].hasOwnProperty('indices')
              ) {
                dictChoices[selectIdByDims[dimn]].setChoices(
                  combineArraysToObject(
                    cJson.DIMENSIONS.dimensions[dimn].indices,
                    cJson.DIMENSIONS.dimensions[dimn].indices
                  ),
      
                  'value',
                  'label',
                  false
                );
              } else {
                dictChoices[selectIdByDims[dimn]].setChoices(
                  combineArraysToObject(
                    Object.keys(cJson.DIMENSIONS.dimensions[dimn]),
                    Object.keys(cJson.DIMENSIONS.dimensions[dimn])
                  ),
                  'value',
                  'label',
                  false
                );
              }
            }
      
            dictChoices[
              selectIdByDims[dimSetEvent.x_dim]
            ].containerInner.element.parentElement.style.display = 'none';
            dictChoices[
              selectIdByDims[dimSetEvent.y_dim]
            ].containerInner.element.parentElement.style.display = 'none';
            dictChoices[
              selectIdByDims[dimSetEvent.x_dim]
            ].containerInner.element.style.display = 'none';
            dictChoices[
              selectIdByDims[dimSetEvent.y_dim]
            ].containerInner.element.style.display = 'none';
          }
        }
      },
      false, 
    );
  }

  // other dims events
  for (let [i, dimn] of Object.entries(cJson.DIMENSIONS.json_structure)) {
    // i start from zero

    let k = parseInt(i) + 1;
    let tempChoices = dictChoices['dim' + k.toString() + 'Choices'];

    tempChoices.passedElement.element.addEventListener(
      'addItem', //select item
      function (event) {
        // do something creative here...
        if (lmtSettings["stopFire"]) {return;}
        console.log('fire addItem event for other dimensions');
        console.log(cJson.DIMENSIONS.json_structure);

        dimSetEvent.fxdim[dimn] = event.detail.value;
        console.log(dimn, dimSetEvent.fxdim[dimn]);

        console.log(
          'xxx',
          cJson.DIMENSIONS.json_structure.filter(
            dim =>
              dim != dimSetEvent.x_dim &&
              dim != dimSetEvent.y_dim &&
              dim != dimn
          )
        );

        let chkAllSel = cJson.DIMENSIONS.json_structure
          .filter(
            dim =>
              dim != dimSetEvent.x_dim &&
              dim != dimSetEvent.y_dim &&
              dim != dimn
          )
          .every(dim => dimSetEvent.fxdim[dim] != undefined);

        if (chkAllSel) {
          console.log(
            'now we can generate the tab json and prepare redraw table'
          );


          let ini_xdim,
            ini_ydim,
            ini_fxdm = {} ;

          [ini_xdim, ini_ydim, ini_fxdm] = initDim(
              cmecJson,
              (dimSet = dimSetEvent)
          );

          if (preXdim != ini_xdim) {
              console.log('xxx');
              resetGroupBtn();
          }

          preXdim = ini_xdim;
          preYdim = ini_ydim;
          

          // select choices based on the initial dimension setting
          console.log('start prepareSel', ini_xdim, ini_ydim, ini_fxdm);
          prepareSel(cmecJson, ini_xdim, ini_ydim, ini_fxdm);

          preSetTab(ini_xdim, ini_ydim, cmecJson);

          // add event for json read
          // Create a custom event
          let event = new CustomEvent('jsonReady', {
            bubbles: true, // Allow the event to bubble up the DOM tree
            cancelable: true // Allow the event to be cancelable
          });
          // Trigger the custom event on the document
          document.dispatchEvent(event);

	  // reset norm and cmap
	  lmtSettings["stopFireNorm"] = true;
	  tabTempJson = [];
	  setChoicesDefault("0", "0", lmtSettings.logoMethod);
	  lmtSettings["stopFireNorm"] = false;
        }
      },
      false
    );
  }

  // other selections events
  for (const dim of ['norm', 'cmap', 'logo']) {
    dictChoices[dim + 'Choices'].passedElement.element.addEventListener(
      'addItem', //select item
      function (event) {

        //if (dim == 'exam') {
        //  console.log('fire event for exam');
        //  let jsfURL = event.detail.value;
        //  jsfURL = jsonFileURL + jsfURL;
        //  loadrmtJson(jsfURL);
        //}

        if (dim == 'logo') {
          logoFile = event.detail.value;

	  lmtSettings.logoMethod = logoFile;
	  document.getElementById('logoUD').src = "image/" + logoFile;
        }


	//normalization
	if (dim == 'norm') {
           console.log('UDEB: fire event for normalization', lmtSettings['stopFireNorm'], !lmtSettings['stopFireNorm']);
	   lmtSettings["normMethod"] = event.detail.value;

	   if (lmtSettings['stopFireNorm']) {
	     lmtSettings['stopFireNorm'] = false;
	   } else {
             // tabTempJson save the first initial unnormalized tab
	     console.log("start normalzation");
             if (tabTempJson.length > 0) {
               var tempData = deepCopyFunction(tabTempJson);
             } else {
               var tempData = table.getData('all');
               tabTempJson = deepCopyFunction(tempData);
             }

             var newData = Object.assign([], tempData);
         
             if (lmtSettings["normDir"] == 'row') {
               let j = 0;

               const count = Object.keys(tempData[0]).filter(key => key !== "row_name").length;
               if (event.detail.value == 1 && count == 1) {
                  alert("cannot normalized data");
                  dictChoices[dim + 'Choices'].setChoiceByValue("0");
               }
               for (data of tempData) {
                 newData[j] = normalizer(
                   event.detail.value,
                   lmtSettings["normDir"],
                   data
                 );
                 j = j + 1;
               }
             } else if (lmtSettings["normDir"] == 'column') {
               let colData = {};
               for (col_name of Object.keys(tempData[0])) {
                 if (col_name != 'row_name' && col_name != '_children') {
                   colData = extractCol(tempData, col_name, '');

                   var newcolData = normalizer(
                     event.detail.value,
                     lmtSettings["normDir"],
                     colData
                   );
                   insertCol(newData, col_name, newcolData, '');
                 }
               }
             } else {
                alert("please select the direction of the normalization");
             }

             if (lmtSettings["normDir"] == 'row' || lmtSettings["normDir"] == 'column') {
                 table.setData(newData);
                 table.redraw(true);
                 draw_legend(); 
             }
	   }
	}

	if (dim == 'cmap') {
	   console.log('fire event for cmap');
	   lmtSettings["cmapMethod"] = event.detail.value;
           updateColorMapping();
	   table.setColumns(tabOption.columns);
	   table.redraw();
	}
      },
      false
    );
  }

  // hide event
  dictChoices['hideChoices'].passedElement.element.addEventListener(
    'addItem', //select item
    function (event) {
      console.log("fire hide events");
      table.hideColumn(event.detail.value);

    },
    false
  );

  dictChoices['hideChoices'].passedElement.element.addEventListener(
    'removeItem', //select item
    function (event) {
      console.log("fire show events");
      table.showColumn(event.detail.value);
    },
    false
  );
}


function setChoicesDefault(setNorm, setCmap, setLogo) {
  dictChoices["normChoices"].setChoiceByValue(setNorm);
  dictChoices["cmapChoices"].setChoiceByValue(setCmap);
  dictChoices["logoChoices"].setChoiceByValue(setLogo);
}


function setCheckBoxesDefault(normDir, setTooltip, setTopTitle, setBottomTitle, setCellValue, setFitScreen){

  if (normDir == "row") { 
    document.getElementById("cb-scarow").checked = true;
    document.getElementById("cb-scacol").checked = false;
  } else {
    document.getElementById("cb-scarow").checked = false;
    document.getElementById("cb-scacol").checked = true;
  }

  if (setTopTitle){
    document.getElementById("cb-toptitle").checked = true;
  } else {
    document.getElementById("cb-toptitle").checked = false;
  }
  if (setBottomTitle){
    document.getElementById("cb-bottomtitle").checked = true;
  } else {
    document.getElementById("cb-bottomtitle").checked = false;
  }

  //-if (setTooltip){
  //-  document.getElementById("cb-tooltip").checked = true;
  //-} else {
  //-  document.getElementById("cb-tooltip").checked = false;
  //-}

  if (setCellValue) {
    document.getElementById("cb-cellvalue").checked = true;
  } else {
    document.getElementById("cb-cellvalue").checked = false;
  }

  if (setFitScreen) {
    document.getElementById("cb-fitscreen").checked = true;
  } else {
    document.getElementById("cb-fitscreen").checked = false;
  }

}

// set the selection based on the x, y and fixed dimensions
function prepareSel(cJson, ini_xdim, ini_ydim, ini_fxdm) {
  console.log('sel', selectIdByDims);

  // set the hide menu for the X dimension
  dictChoices['hideChoices'].clearStore();
  dictChoices['hideChoices'].setChoices(
    combineArraysToObject(
      Object.keys(cJson.DIMENSIONS.dimensions[ini_xdim]),
      Object.keys(cJson.DIMENSIONS.dimensions[ini_xdim])
    ),
    'value',
    'label',
    false
  );

  // set the options from dimensions
  dictChoices['xdimChoices'].setChoiceByValue(ini_xdim);
  dictChoices['ydimChoices'].setChoiceByValue(ini_ydim);

  for (let fxdim of cJson.DIMENSIONS.json_structure.filter(item => 
            item !== ini_xdim &&
	    item !== ini_ydim
  )) {

    console.log('UDEB:', fxdim, selectIdByDims[fxdim], ini_fxdm[fxdim]);
    dictChoices[selectIdByDims[fxdim]].containerInner.element.style.display = 'block';
    dictChoices[selectIdByDims[fxdim]].setChoiceByValue(ini_fxdm[fxdim]);
  }
} //prepareSel

// load local json files
function loadlocJson() {

  const file = document.getElementById('file').files[0];


  if (!file) {
    alert('Please input file');
    table.setColumns([]);
    table.clearData();
  } else {
    if (!file.type.includes('json')) {
      alert('Please input json file like *.json');
    } else {
      console.log('UDEB: starting read the local CMEC json file');

      // have to reload page to clear all event listens
      if (isJsonReady) {
        isJsonReady = false;
        alert("Will reload page before loading a new file. Please reselect after loading");
        location.reload();

      }

      readFile(file)
        .then(function(filePromise) {
          try {
            cmecJson = JSON.parse(filePromise.content);
          } catch (err) {
            alert('JSON parsing', err.message);
          }

          //CMEC json schema validation will be added soon

	  //init

          jsonType = 'CMEC';

          // initialize dimensions
          let ini_xdim,
            ini_ydim,
            ini_fxdm = {}
            ;[ini_xdim, ini_ydim, ini_fxdm] = initDim(cmecJson, (dimSet = {}));



          //default is from ILAMB style
	  // always assume the data is unnormalized

	  setChoicesDefault("0", "0", "rubisco_logo.png");
	  lmtSettings.normMethod = "0";
	  lmtSettings.cmapMethod = "0";
	  lmtSettings.logoMethod = "rubisco_logo.png";

	  setCheckBoxesDefault("row", true, true, false, true, true)
	  lmtSettings.normDir = "row";
	  lmtSettings.setTooltip = true;
	  lmtSettings.setTopTitle = true;
	  lmtSettings.setBottomTitle = false;
	  lmtSettings.setCellValue = true;
	  lmtSettings.setFitScreen = true;


          // initialize choices events
          initChoicesEvent(cmecJson);

	  // initialize checkbox events
	  initCheckBoxesEvent();

          // select choices based on the initial dimension setting
          console.log('UDEB: start prepareSel');
          prepareSel(cmecJson, ini_xdim, ini_ydim, ini_fxdm);

          // set tab options
          preSetTab(ini_xdim, ini_ydim, cmecJson);
        })
        .catch(err => alert(err));
    }
  }
} //loadlocJson

function preSetTab(ini_xdim, ini_ydim, cJson) {
  if (Object.keys(tabTreeJson[0]).includes('_children')) {
    tabOption.dataTreeCollapseElement = '';
    tabOption.dataTreeExpandElement = '';
    isTreeTable = 1;
  } else {
    tabOption.dataTreeCollapseElement = '<span></span>';
    tabOption.dataTreeExpandElement = '<span></span>';
    isTreeTable = 0;
  }

  console.log(tabOption);

  console.log('starting read the local CMEC json file 3');

  ydimField = 'row_name';

  // set tab column
  //
  tabOption.data = tabTreeJson;
  bgcol = '#0063B2FF';
  ftwgt = 500;
  ftsty = 'normal';
  txdec = '';
  txcol = '#000000';
  let lmtTitleFormatterParams = {
    bgcol: bgcol,
    ftsty: ftsty,
    ftwgt: ftwgt,
    txdec: txdec,
    color: txcol
  };
  grpsFirstCol.length = 0;
  console.log('starting read the local CMEC json file 4', tabTreeJson);
  tabOption.columns = setTabColumns(
    tabTreeJson,
    (addBottomTitle = lmtSettings.setBottomTitle),
    firstColIcon,
    lmtTitleFormatterParams,
    ini_xdim,
    ini_ydim,
    ydimField
  );
  sortState = 0;
  updateButtonText();
  console.log('starting read the local CMEC json file 5', table);

  // baseUrl
  if (cJson.hasOwnProperty('SETTINGS')) {
    if (cJson.SETTINGS.hasOwnProperty('baseUrl')) {
      baseUrl = cJson.SETTINGS.baseUrl;
    }
  }
}

// initialize dimensions and convert CMEC json to tabulator json

function initDim(cJson, dimSet) {
  console.log('UDEB: in initDim');


  //Get model groups
  if (cJson.DIMENSIONS.json_structure.includes('model')) {
    var t = [];
    for (x of Object.keys(cJson.DIMENSIONS.dimensions.model)) {
      t.push(cJson.DIMENSIONS.dimensions.model[x].Source);
    }
    t = [...new Set(t)];
    for (x of Object.keys(cJson.DIMENSIONS.dimensions.model)) {
      grpsModSrcIdx[x] = t.indexOf(cJson.DIMENSIONS.dimensions.model[x].Source);
    }
  }
  if (cJson.DIMENSIONS.json_structure.includes('metric')) {
    var t = [];
    for (x of Object.keys(cJson.DIMENSIONS.dimensions.metric)) {
      if (!(x.includes('::') || x.includes('!!'))) {
        t.push(x);
      }
    }
    grpsTopMetric = [...new Set(t)];
  }

  let ini_xdim = cJson.DIMENSIONS.json_structure[0];
  let ini_ydim = cJson.DIMENSIONS.json_structure[1];
  let ini_fxdm = {};

  if (
    dimSet.x_dim &&
    cJson.DIMENSIONS.json_structure.includes(dimSet.x_dim) &&
    dimSet.y_dim &&
    cJson.DIMENSIONS.json_structure.includes(dimSet.y_dim)
  ) {
    ini_xdim = dimSet.x_dim;
    ini_ydim = dimSet.y_dim;
    ini_fxdm = dimSet.fxdim;
  } else {
    for (fxdim of cJson.DIMENSIONS.json_structure.slice(
      2,
      cJson.DIMENSIONS.json_structure.length
    )) {
      if (fxdim == 'statistic' && cJson.DIMENSIONS.dimensions['statistic'].hasOwnProperty('indices')
         ) {
          ini_fxdm[fxdim] =
            cJson.DIMENSIONS.dimensions['statistic']['indices'][0];
      } else {
          ini_fxdm[fxdim] = Object.keys(cJson.DIMENSIONS.dimensions[fxdim])[0];
      }
    }
  }

  console.log("fxdim", ini_fxdm, ini_xdim, ini_ydim, dimSet);
  //tabTreeJson = lmt_tool.cmec2tab_json(cJson, ini_xdim, ini_ydim, ini_fxdm, 1);
  let tempJson = lmt_tool.cmec2tab_json(cJson, ini_xdim, ini_ydim, ini_fxdm, 1);

  console.log('UDEB: in initDim return', ini_xdim, ini_ydim);

  metricOrder = [
    "Temperature",
    "Salinity",
    "MixedLayerDepth",
    "Alkalinity",
    "DissolvedInorganicCarbon",
    "Revellefactor",
    "AMOC-timeseries",
    "Stratification-timeseries",
    "Southern_Ocean_Salinity"
  ]; 
  if (ini_ydim == "metric") {
    tabTreeJson = sortLargeArrayByReference(tempJson, metricOrder, "row_name");
  } else {
    tabTreeJson = tempJson;
  }
 
  console.log(tabTreeJson);

  return [ini_xdim, ini_ydim, ini_fxdm];
}

function sortLargeArrayByReference(objectsArray, referenceArray, propertyName) {
  // Create a map from object value to all objects with that value
  const valueToObjectsMap = new Map();
  const unmatchedObjects = [];
  
  // First pass: group objects by their property value
  objectsArray.forEach(obj => {
    const value = obj[propertyName];
    if (referenceArray.includes(value)) {
      if (!valueToObjectsMap.has(value)) {
        valueToObjectsMap.set(value, []);
      }
      valueToObjectsMap.get(value).push(obj);
    } else {
      unmatchedObjects.push(obj);
    }
  });
  
  // Second pass: build the result array in reference order
  const result = [];
  referenceArray.forEach(value => {
    if (valueToObjectsMap.has(value)) {
      result.push(...valueToObjectsMap.get(value));
    }
  });
  
  // Add unmatched objects at the end
  result.push(...unmatchedObjects);
  
  return result;
}


// read a file in ascii format

function readFile(file) {
  return new Promise(function (resolve, reject) {
    var fileReader = new FileReader();

    fileReader.addEventListener('load', function (event) {
      var content = event.target.result;

      // Strip out the information about the mime type of the file and the encoding
      // at the beginning of the file (e.g. data:image/gif;base64,).
      //content = atob(content.replace(/^(.+,)/, ''));

      resolve({
        filename: file.name,
        content: content
      });
    });

    fileReader.addEventListener('error', function (error) {
      reject(error);
    });

    fileReader.readAsText(file);
  });
}

document.addEventListener('jsonReady', function () {
  isJsonReady = true;

  //document.getElementById('mytab').style.width = (320+(tabOption.columns.length-1)*28).toString()+'px';
  document.getElementById('mytab').style.width =
    (400 + (tabOption.columns.length - 1) * 30).toString() + 'px';



  try {
    table.setColumns(tabOption.columns);
    table.setData(tabTreeJson);
    table.redraw();
    setGroupColumns(groupSavedValues);
    draw_legend();

  } catch (err) {
    alert('Error when rending the table:', err.message);
  }



  //try{
  if (
    Object.keys(_config).includes('udcDimSets') &&
    Object.keys(_config.udcDimSets).includes('x_dim') &&
    Object.keys(_config.udcDimSets).includes('y_dim')
  ) {
    var xDimName = _config.udcDimSets.x_dim;
    var yDimName = _config.udcDimSets.y_dim;
  } else {
    var xDimName = cmecJson.DIMENSIONS.json_structure[0];
    var yDimName = cmecJson.DIMENSIONS.json_structure[1];
  }


  //if (_config.udcScreenHeight == 0) {
  //  toggleScreenHeight(false);
  //}

  //if (_config.hasOwnProperty('udcNormAxis')) {
  //  switch (_config.udcNormAxis.toLowerCase()) {
  //    case 'x':
  //    case 'col':
  //      $('.scarow').prop('checked', false);
  //      $('.scacol').prop('checked', true);
  //      break;
  //    case 'y':
  //    case 'row':
  //      $('.scarow').prop('checked', true);
  //      $('.scacol').prop('checked', false);
  //      break;
  //    default:
  //      console.log('UDEB: error setting in udcNormAxis');
  //      break;
  //  }
  //}

  //if (_config.hasOwnProperty('udcNormType')) {
  //  switch (_config.udcNormType.toLowerCase()) {
  //    case 'standarized':
  //      $('#select-choice-mini-sca').val('1').trigger('change');
  //      break;
  //    case 'normalized[-1:1]':
  //      $('#select-choice-mini-sca').val('2').trigger('change');
  //      break;
  //    case 'normalized[0:1]':
  //      $('#select-choice-mini-sca').val('3').trigger('change');
  //      break;
  //    default:
  //      console.log('UDEB: error setting in udcNormType');
  //      break;
  //  }
  //}

  //if (_config.hasOwnProperty('udcColorMapping')) {
  //  switch (_config.udcColorMapping.toLowerCase()) {
  //    case 'ilamb':
  //      $('#select-choice-mini-map').val('0').trigger('change');
  //      //$('#select-choice-mini-map').val("0");
  //      //$('#select-choice-mini-map').trigger('change.select2');
  //      break;
  //    case 'linear':
  //      $('#select-choice-mini-map').val('1').trigger('change');
  //      break;
  //    case 'linear reverse':
  //      $('#select-choice-mini-map').val('2').trigger('change');
  //      break;
  //    default:
  //      console.log('UDEB: error setting in udcColorMapping');
  //      break;
  //  }
  //}

  if (_config.hasOwnProperty('udcBaseUrl')) {
    //check url is valid and available
    //
    //$.ajax({
    //    type: "GET",
    //    url: _config.udcBaseUrl
    //}).done(function (result) {
    //    console.log("working");
    //    baseUrl = _config.udcBaseUrl;
    //}).fail(function () {
    //    alert("UDEB: please provide a valid udcBaseUrl");
    //});
    baseUrl = _config.udcBaseUrl;
  }
});


function initCheckBoxes() {
  document.getElementById("cb-scarow").checked = false;
  document.getElementById("cb-scacol").checked = false;
  document.getElementById("cb-toptitle").checked = false;
  document.getElementById("cb-bottomtitle").checked = false;
  //document.getElementById("cb-tooltip").checked = false;
  document.getElementById("cb-cellvalue").checked = false;
  document.getElementById("cb-fitscreen").checked = true;
}


function initCheckBoxesEvent() {

  document.getElementById("cb-scarow").addEventListener("change", () => {
    console.log("fire event for checking row", document.getElementById("cb-scarow").checked);
    if (document.getElementById("cb-scarow").checked) {
      document.getElementById("cb-scacol").checked = false;
      lmtSettings["normDir"] = "row";

      //set the normalized method to default
      //dictChoices['normChoices'].setChoiceByValue('0');
    } else {
      lmtSettings["normDir"] = "column";
      document.getElementById("cb-scacol").checked = true;
      dictChoices['normChoices'].setChoiceByValue('0');
    }
  });

  document.getElementById("cb-scacol").addEventListener("change", () => {
    console.log("fire event for checking column");
    if (document.getElementById("cb-scacol").checked) {
      document.getElementById("cb-scarow").checked = false;
      lmtSettings["normDir"] = "column";
      //set the normalized method to default
      //dictChoices['normChoices'].setChoiceByValue('0');
    } else {
      lmtSettings["normDir"] = "row";
      document.getElementById("cb-scarow").checked = true;
      dictChoices['normChoices'].setChoiceByValue('0');
    }
  });

  document.getElementById("cb-toptitle").addEventListener("change", () => {
    console.log("fire event for toptitle");
    const currentColumns = table.getColumnDefinitions();
    if (document.getElementById("cb-toptitle").checked) {

      lmtSettings.setTopTitle = true;
      tabOption['headerVisible'] = true;
    } else {
      lmtSettings.setTopTitle = false;
      tabOption['headerVisible'] = false;
    }

    if (table) {
       table.off("tableBuilt");
       var tempData = table.getData();
       table.clearData(); // need to clear memory
       table.destroy(); // clear memory
    }
    table = new Tabulator('#dashboard-table', tabOption);
    table.on("tableBuilt", function(){
      table.setData(tempData);
      table.setColumns(currentColumns)
    });
     
  });


  document.getElementById("cb-bottomtitle").addEventListener("change", () => {
    console.log("fire event for bottomtitle");

    const checkbox = document.getElementById("cb-bottomtitle");
    const currentColumns = table.getColumnDefinitions();
    const setBottomTitle = checkbox.checked;

    lmtSettings.setBottomTitle = setBottomTitle;

    currentColumns.forEach(column => {
      if (Array.isArray(column.columns)) {
        // Handle nested columns (e.g., grouped headers)
        column.columns.forEach(nestedColumn => {
          if (nestedColumn.field !== 'row_name') {
            if (setBottomTitle) {
              nestedColumn.bottomCalc = bottomCalcFunc;
            } else {
              delete nestedColumn.bottomCalc;
            }
          }
        });

      } else {
        // Handle regular columns
        if (column.field !== 'row_name') {
          if (setBottomTitle) {
            column.bottomCalc = bottomCalcFunc;
          } else {
            delete column.bottomCalc; 
          }
        }
      }
    });
    if (table) {
       table.off("tableBuilt");
       var tempData = table.getData();
       table.clearData(); // need to clear memory
       table.destroy(); // clear memory
    }
    table = new Tabulator('#dashboard-table', tabOption);
    table.on("tableBuilt", function(){
      table.setData(tempData);
      table.setColumns(currentColumns)
    });
  });

  document.getElementById("cb-cellvalue").addEventListener("change", () => {
    console.log("Toggle cell value display");
  
    const checkbox = document.getElementById("cb-cellvalue");
    const currentColumns = table.getColumnDefinitions();
    const showCellValue = checkbox.checked;
  
    lmtSettings.setCellValue = showCellValue;
  
    currentColumns.forEach(column => {
      if (Array.isArray(column.columns)) {
        // Handle nested columns (e.g., grouped headers)
        column.columns.forEach(nestedColumn => {
          if (nestedColumn.field !== 'row_name') {
            nestedColumn.formatterParams = { showCellValue };
          }
        });
      } else {
        // Handle regular columns
        if (column.field !== 'row_name') {
          column.formatterParams = { showCellValue };
        }
      }
    });
  
    table.setColumns(currentColumns);
  });

  document.getElementById("cb-fitscreen").addEventListener("change", () => {
    fitScreen();
  });

}


function fitScreen() {

  if (document.getElementById("cb-fitscreen").checked) {
    lmtSettings.setFitScreen = true;
    document.getElementById('dashboard-table').style['max-height'] = "82vh";


    // remove height
    document.getElementById('dashboard-table').style.removeProperty('height');

    //calculation vh
    var viewH = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);

    if (document.getElementById("dashboard-table").clientHeight < 0.82 * viewH) {
      console.log("set docu height");
      table.setHeight(document.getElementById("dashboard-table").clientHeight);
    } else {
      table.setHeight('82vh');
    }
  } else {
    lmtSettings.setFitScreen = false;
    document.getElementById('dashboard-table')
      .style.removeProperty('max-height');
    table.setHeight("100%");

  }
}

var draw_legend = function () {
  //draw legend
  var nc = cmap.length;
  var legtable = document.getElementById('scoresLegend');
  row = 0;
  for (var col = 0; col < cmap.length; col++) {
    legtable.rows[row].cells[col].style.backgroundColor = cmap[col];
  }
};

var bottomCalcFunc = function (values, data, calcParams) {
  //values - array of column values
  //data - all table data
  //calcParams - params passed from the column definition object
  //var calc = 0;
  return calcParams;
};

var lmtCellColorFormatter = colorILAMB;

function colorILAMB(cell, formatterParams, onRendered) {
  var clr = '#808080';
  let nc = cmap.length;

  if (Array.isArray(cell.getValue())) {
    origVal = cell.getValue()[0];
    normVal = cell.getValue()[1];
  } else {
    origVal = cell.getValue();
    normVal = cell.getValue();
  }

  if (normVal > -900) {
    var ae = Math.abs(normVal);
    var ind;
    if (ae >= 0.25) {
      ind = Math.round(2 * normVal + 4);
    } else {
      ind = Math.round(4 * normVal + 4);
    }
    ind = Math.min(Math.max(ind, 0), nc - 1);
    clr = cmap[ind];
  }
  cell.getElement().style.backgroundColor = clr;

  if (formatterParams.showCellValue && origVal > -900) {
    cell.getElement().style.color = '#000000';
    //return Math.round((origVal + Number.EPSILON) * 100) / 100;
    //return origVal.toFixed(2);
    return normVal.toFixed(2);
  }
}

function colorLinear(cell, formatterParams, onRendered) {
  let vMin, vMax;
  vMin = -2.5;
  vMax = 2.5;
  if (formatterParams.scaopt == '0') {
    //if (formatterParams.scadir == "row"){
    //   var cell.getData();
    //}
    console.log('will be implemented later');
  } else if (formatterParams.scaopt == '1') {
    vMin = -2.5;
    vMax = 2.5;
  } else if (formatterParams.scaopt == '2') {
    vMin = -1.0;
    vMax = 1.0;
  } else if (formatterParams.scaopt == '3') {
    vMin = 0.0;
    vMax = 1.0;
  }

  if (Array.isArray(cell.getValue())) {
    origVal = cell.getValue()[0];
    normVal = cell.getValue()[1];
  } else {
    origVal = cell.getValue();
    normVal = cell.getValue();
  }

  var clr = '#808080';
  let nc = cmap.length;
  if (normVal > -900) {
    var ind = Math.round(((normVal - vMin) * nc) / (vMax - vMin));
    ind = Math.min(Math.max(ind, 0), nc - 1);
    clr = cmap[ind];
  }
  cell.getElement().style.backgroundColor = clr;

  if (formatterParams.showCellValue && origVal > -900) {
    cell.getElement().style.color = '#000000';
    //return Math.round((origVal + Number.EPSILON) * 100) / 100;
    //return  origVal.toFixed(2);
    return normVal.toFixed(2);
  }
}

function colorLinearReverse(cell, formatterParams, onRendered) {
  let vMin, vMax;
  vMin = -2.5;
  vMax = 2.5;
  if (formatterParams.scaopt == '0') {
    console.log('will be implemented later');
  } else if (formatterParams.scaopt == '1') {
    vMin = -2.5;
    vMax = 2.5;
  } else if (formatterParams.scaopt == '2') {
    vMin = -1.0;
    vMax = 1.0;
  } else if (formatterParams.scaopt == '3') {
    vMin = 0.0;
    vMax = 1.0;
  }

  if (Array.isArray(cell.getValue())) {
    origVal = cell.getValue()[0];
    normVal = cell.getValue()[1];
  } else {
    origVal = cell.getValue();
    normVal = cell.getValue();
  }

  var clr = '#808080';
  let nc = cmap.length;
  if (normVal > -900) {
    var ind = Math.round(((vMax - normVal) * nc) / (vMax - vMin));
    ind = Math.min(Math.max(ind, 0), nc - 1);
    clr = cmap[ind];
  }
  cell.getElement().style.backgroundColor = clr;

  if (formatterParams.showCellValue && origVal > -900) {
    cell.getElement().style.color = '#000000';
    //return Math.round((origVal + Number.EPSILON) * 100) / 100;
    return normVal.toFixed(2);
  }
}

var lmtTitleFormatter = function (cell, titleFormatterParams, onRendered) {
  onRendered(function () {
    // respect users' background changes in the header context menu
    let colField = cell.getValue().replace(/\s+/g, '');
    if (newLabel.hasOwnProperty(colField)) {
      console.log("UDEB: preserve the color setting");
      cell.getElement().parentElement.parentElement.parentElement.style.backgroundColor =
      newLabel[colField];
    } else {
      cell.getElement().parentElement.parentElement.parentElement.style.backgroundColor =
      titleFormatterParams.bgcol;
    }
    cell.getElement().parentElement.parentElement.parentElement.style.fontStyle =
      titleFormatterParams.ftsty;
    cell.getElement().parentElement.parentElement.parentElement.style.fontWeight =
      titleFormatterParams.ftwgt;
    cell.getElement().parentElement.parentElement.parentElement.style.textDecoration =
      titleFormatterParams.txdec;
    cell.getElement().parentElement.parentElement.parentElement.style.color =
      titleFormatterParams.color;
  });
  return cell.getValue();
};

var setTabColumns = function (
  tabJson,
  addBottomTitle,
  firstColIcon,
  lmtTitleFormatterParams,
  xdim,
  ydim,
  ydimField
) {
  console.log('start setTabColumns');

  var Columns = [];

  var otherCol = {
    title: 'col_name',
    field: 'col-field',
    bottomCalc: bottomCalcFunc,
    headerContextMenu: headerContextMenu,
    formatter: lmtCellColorFormatter,
    formatterParams: {},
    titleFormatter: lmtTitleFormatter,
    titleFormatterParams: lmtTitleFormatterParams,
    width: 30,
    minWidth:10,
    headerVertical: 'flip',
    resizable: false,
    headerSort: true,
    cellClick: tabOptions.cellClickFuncGenetic,
    cellMouseOver:function(e, cell) { 
      var headerCols = cell.getTable().columnManager.getHeadersElement().childNodes;
      headerCols.forEach(function (c) {
         if (c.getAttribute("tabulator-field") == cell.getField()) {
            c.querySelector('.tabulator-col-title').style.fontWeight="bold";
            c.style.borderRight="2.5px solid";
            c.style.borderLeft="2px solid";
         }
      });
    },

    cellMouseOut:function(e, cell) { 
      var headerCols = cell.getTable().columnManager.getHeadersElement().childNodes;
      headerCols.forEach(function (c) {
         if (c.getAttribute("tabulator-field") == cell.getField()) {
            c.querySelector('.tabulator-col-title').style.fontWeight="normal";
            c.style.borderRight = "1px solid #000";
            c.style.borderLeft = "0px solid #000";
         }
      });
    }
  };

  //formatter:lmtCellColorFormatter, formatterParams:{}, titleFormatter:lmtTitleFormatter, titleFormatterParams:lmtTitleFormatterParams, width:28, headerVertical:"flip", resizable:false};
  // conflict with savehtml setfirstcolbgcolor fixed in tabulator 4.9
  var firstCol = {
    title: 'row_name',
    field: 'row_field',
    frozen: true,
    titleFormatter: firstColIcon,
    minWidth: 380,
    formatter: setFirstColBgColor,
    formatterParams: { xDim: xdim, yDim: ydim },
    headerSort: true,
    headerContextMenu: firstColHeaderContextMenu
  };

  firstCol.title = ydim.concat('/', xdim);
  //firstCol.field = 'row_name';
  firstCol.title = '';
  firstCol.field = ydimField;

  Columns.push(firstCol);

  console.log('deb in before the loop');

  var col = {};
  for (x of Object.keys(tabJson[0])) {
    if (x != 'row_name' && x != '_children' && x != 'metric') {
      col = Object.assign({}, otherCol);

      col.title = x;
      col.field = x;
      col.bottomCalcParams = x;

      if (xdim == 'model') {
        var k = grpsModSrcIdx[x] % bgColorGroupFirstRow.length;

        if (col.title.includes('Mean') || col.title.includes('mean')) {
          bgcol = '#FFFFFF';
        } else {
          bgcol = bgColorGroupFirstRow[k];
        }
        ftwgt = 100;
        ftsty = 'normal';
        txdec = '';
        //txcol = "#000000";
        txcol = fgColorGroupFirstRow[k];
      } else if (xdim == 'metric') {
        for (let [idxmet, topmet] of grpsTopMetric.entries()) {
          if (x.includes(topmet)) {
            var k = idxmet % bgColorGroup.length;
            bgcol = bgColorGroup[k];
          }
        }
      } else {
        //bgcol = "#9CC3D5";
        bgcol = '#0063B2FF';
        ftwgt = 100;
        ftsty = 'normal';
        txdec = '';
        txcol = '#FFFFFF';
      }
      col.titleFormatterParams = {
        bgcol: bgcol,
        ftsty: ftsty,
        ftwgt: ftwgt,
        txdec: txdec,
        color: txcol
      };

      if (!addBottomTitle) {
        delete col['bottomCalc'];
      }


      if (lmtSettings.setCellValue) {
        col['formatterParams'] = { showCellValue: true };
      } else {
        col['formatterParams'] = { showCellValue: false };

      }
      Columns.push(col);
    }
  }
  console.log('deb in after the loop', Columns);
  return Columns;
};

var firstColIcon = function (cell, titleFormatterParams) {
  if (_config.logofile != 'None') {
    return "<img class='infoImage' id='logoUD' src='image/".concat(logoFile, "'>");
  }
};

//define row context menu contents
var rowMenu = [
  {
    label: "<i class='fas fa-user'></i> Change Name",
    action: function (e, row) {
      row.update({ name: 'Steve Bobberson' });
    }
  },
  {
    label:
      "<i class='fas fa-check-square-o' aria-hidden='true'></i> Select Row",
    action: function (e, row) {
      row.select();
    }
  }
];

//define row context menu
var headerContextMenu = [
  {
    label: "<i class='fa fa-eye-slash'></i> Hide Column",
    action: function (e, column) {
      dictChoices["hideChoices"].setChoiceByValue(column.getField());
    }
  },
  {
    label: function(column) { 
      let colName = column.getField().replace(/\s+/g, '');
      //if (newLabel.hasOwnProperty(colName)) {
      if (column.getElement().style.backgroundColor != undefined) {
	//return labelCode + "<input type='color' class='" + class4Color + "' id='favcolor' name='favcolor' value='" + newLabel[colName] + "'/>";
	return labelCode + "<input type='color' class='" + class4Color + "' id='favcolor' name='favcolor' value='" + rgbToHex(column.getElement().style.backgroundColor) + "'/>";
      } else {
        return labelCode + "<input type='color' class='" + class4Color + "' id='favcolor' name='favcolor'>";
      }
    },
    action: function (e, column) {
      let colName = column.getField().replace(/\s+/g, '');
      var elColor = document.getElementById("favcolor");

      document.getElementById("favcolor").addEventListener('input', function (evt) {
	column.getElement().style.backgroundColor = this.value;
	newLabel[colName] = this.value;
      });
    }
  }
];



function getHeaderMenu(idDom) {
  return [
      {
        label: `Background Color <input type='color' class='${class4Color}' id='${idDom}BgColor' name='favcolor' value='#ffffff'/>`,
        action: function(e, column) {

            document.getElementById(`${idDom}BgColor`).addEventListener('input', function (evt) {

               if (idDom == 'fav') {
                 const headerEl = column.getElement();
                 headerEl.style.backgroundColor = this.value;

                 const textEl = headerEl.querySelector('.tabulator-col-content .tabulator-col-title-holder .tabulator-col-title .tabulator-title-editor');
                 textEl.style.backgroundColor = this.value;
               } else {

                 column.getSubColumns().forEach(col => {
                   col.getElement().style.backgroundColor = this.value;
                 });

               }

            });
        }
      },
      {
        label: `Font Color <input type='color' class='${class4Color}' id='${idDom}FontColor' name='favcolor' value='#ffffff'/>`,
        action: function(e, column) {
            document.getElementById(`${idDom}FontColor`).addEventListener('input', function (evt) {
                setHeaderStyle(idDom, column, "color", this.value);
            });
        }
      },
      {
        label: "Font Size",
        menu: [
            {label: "Small", action: function(e, column) { setHeaderStyle(idDom, column, "font-size", "12px"); }},
            {label: "Medium", action: function(e, column) { setHeaderStyle(idDom, column, "font-size", "14px"); }},
            {label: "Large", action: function(e, column) { setHeaderStyle(idDom, column, "font-size", "18px"); }},
            {label: "Custom...", action: function(e, column) {
                var size = prompt("Enter font size (e.g., 16px):");
                if(size) setHeaderStyle(idDom, column, "font-size", size);
            }},
        ]
      },
      {
        label: "Font Weight",
        menu: [
            {label: "Normal", action: function(e, column) { setHeaderStyle(idDom, column, "font-weight", "normal"); }},
            {label: "Bold", action: function(e, column) { setHeaderStyle(idDom, column, "font-weight", "bold"); }},
            {label: "Bolder", action: function(e, column) { setHeaderStyle(idDom, column, "font-weight", "bolder"); }},
        ]
      }
  ];
}


var groupHeaderContextMenu = [
  {
    label: "Subgroup Title",
    menu: getHeaderMenu('subGroup')
  },
  {
    label: "Group Title",
    menu: getHeaderMenu('fav')
  }
];


function setHeaderStyle(idDom, column, property, value) {

    if (idDom == 'fav') {
      const headerEl = column.getElement();
      const textEl = headerEl.querySelector('.tabulator-col-content .tabulator-col-title-holder .tabulator-col-title');
      textEl.style[property] = value;
    } else {
      column.getSubColumns().forEach(col => {
        col.getElement().querySelector('.tabulator-col-content .tabulator-col-title-holder .tabulator-col-title').style[property] = value;
      });
    }

    table.redraw(true);
    
    // Store the style if you're using persistence
    if (typeof headerStyles !== 'undefined') {

        var field = column.getField();
        console.log('zzzzzzzzzzzzzzzzzzzz', filed);
        if (!headerStyles[field]) headerStyles[field] = {};
        headerStyles[field][property] = value;
    }
}

//from stakoverflow https://stackoverflow.com/questions/61653534/javascript-rgb-string-rgbr-g-b-to-hex-rrggbb-conversion
function componentToHex(c) {
  // This expects `c` to be a number:
  const hex = c.toString(16);

  return hex.length === 1 ? `0${ hex }` : hex;
}

function rgbToHex(rgb) {
  // .map(Number) will convert each string to number:
  const [r, g, b] = rgb.replace('rgb(', '').replace(')', '').split(',').map(Number);
  
  return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}

var firstColHeaderContextMenu = [
  {
    label: 'Toggle Tree Icon',
    action: function (e, column) {
      var len = document.getElementsByClassName(
        'tabulator-data-tree-control'
      ).length;
      for (let i = 0; i < len; i++) {
        if (
          document.getElementsByClassName('tabulator-data-tree-control')[i]
            .style.display == 'none'
        ) {
          document.getElementsByClassName('tabulator-data-tree-control')[
            i
          ].style.display = 'inline-flex';
        } else {
          document.getElementsByClassName('tabulator-data-tree-control')[
            i
          ].style.display = 'none';
        }
      }
    }
  },

  {
    label: 'Hide/Show Logo',
    action: function (e, column) {

      if (document.getElementsByClassName('infoImage')[0].style.display != 'none') {
        document.getElementsByClassName('infoImage')[0].style.display = 'none';
      } else {
        document.getElementsByClassName('infoImage')[0].style.display = 'inline';
      }
    }
  }
];

function tableColor() {
  if (document.getElementById('colorblind').checked) {
    cmap = PuOr;
  } else {
    cmap = GnRd;
  }

  grpsFirstCol.length = 0;
  //var tempData = JSON.parse(JSON.stringify(table.getData()));
  var tempData = table.getData();
  table.clearData();
  table.setData(tempData);
  table.redraw(true);
  draw_legend();
}

function getRowTreeStruct(rowClick) {
  var rowTreeStruct;

  rowTreeStruct = rowClick.getCells()[0].getValue().replace(/\s+/g, '');

  if (rowClick.getTreeParent()) {
    rowTreeStruct =
      getRowTreeStruct(rowClick.getTreeParent()) + '::' + rowTreeStruct;
  }

  return rowTreeStruct;
}


//background color of first column
function setFirstColBgColor(cell, formatterParams, onRendered) {
  var value = cell.getValue();
  onRendered(function () {
    if (!cell.getRow().getTreeParent()) {
      if (formatterParams.yDim == 'metric') {
        fgFontColor = '#0808ff';
      } else if (formatterParams.yDim == 'model') {
        fgFontColor = '#000000';
      } else {
        fgFontColor = '#000000';
      }

      if (formatterParams.yDim == 'metric') {
        var chrow = cell.getRow().getTreeChildren();

        if (!grpsFirstCol.includes(value)) {
          grpsFirstCol.push(value);
        }
        chrow.forEach(function (r) {
          var k = grpsFirstCol.indexOf(value) % bgColorGroup.length;
          setmetricbg(r, cell, value, bgColorGroup[k], fgFontColor);
        });
      } else if (formatterParams.yDim == 'model') {
        fgFontColor = '#FFFFFF';
        var k = grpsModSrcIdx[value] % bgColorGroupFirstRow.length;
        setmetricbg(
          cell.getRow(),
          cell,
          value,
          bgColorGroupFirstRow[k],
          fgColorGroupFirstRow[k]
        );
      }
    }
  });
  return value;
}

function setmetricbg(r, cell, value, bgcolor, fgcolor) {
  var r, cell, value, bgcolor;
  cell.getElement().style.backgroundColor = bgcolor;
  r.getElement().style.backgroundColor = bgcolor;
  var gdrow = r.getTreeChildren();
  if (gdrow.length > 0) {
    gdrow.forEach(function (g) {
      g.getElement().style.backgroundColor = bgcolor;
      g.getElement().style.color = fgcolor;
    });
  } else {
    r.getElement().style.color = fgcolor;
  }
}

function extractVals(data, arr, kmp, followTree) {
  for (k of Object.keys(data)) {
    if (k != 'row_name' && k != '_children') {
      arr.push(data[k]);
      kmp.push(k);
    } else if (k == '_children' && followTree == 1) {
      extractVals(data, arr, kmp, followTree);
    }
  }
}

function insertVals(normData, data, newarr, kmp, i) {
  for (k of Object.keys(data)) {
    if (k != 'row_name' && k != '_children') {
      normData[k] = [data[k], newarr[i]];
      i = i + 1;
    } else if (k == '_children') {
      insertVals(normData._children, data._children, newarr, kmp, i);
    }
  }
}

function normalizer(normMethod, scaDir, data) {
  var normData = Object.assign({}, data);

  if ('_children' in data) {
    if (scaDir == 'row') {
      if (data._children.length > 0) {
        var i = 0;
        for (cData of data._children) {
          normData._children[i] = normalizer(normMethod, scaDir, cData);
          i = i + 1;
        }
      }
    }
  }

  var arr = [];
  var kmp = [];
  if (scaDir == 'row') {
    extractVals(data, arr, kmp, 0);
  } else {
    extractVals(data, arr, kmp, 1);
  }

  var normArray = [];

  switch (normMethod) {
    case "0":
      normArray = arr;
      break;
    case '1':
      let getMean = function (data) {
        datasum = data.reduce(function (a, b) {
          if (Number(b) > -999.0) {
            return Number(a) + Number(b);
          } else {
            return Number(a);
          }
        }, 0.0);

        datanum = data.reduce(function (a, b) {
          if (Number(b) > -999.0) {
            return Number(a) + 1.0;
          } else {
            return Number(a);
          }
        }, 0.0);
        return datanum > 0 ? datasum / datanum : -999.0;
      };

      let getStd = function (data) {
        let m = getMean(data);

        if (m > -999.0) {
          return Math.sqrt(
            data.reduce(function (sq, n) {
              if (Number(n) > -999.0) {
                return sq + Math.pow(Number(n) - m, 2);
              } else {
                return sq;
              }
            }, 0) / datanum
          );
        } else {
          return -999.0;
        }
      };

      if (arr.length == 1) {
        normArray = arr;
      } else {
        for (val of arr) {
          if (val > -999.0) {
            newval = (val - getMean(arr)) / getStd(arr);
          } else {
            newval = -999.0;
          }
          normArray.push(newval);
        }
      }
      break;
    case '2':
    case '3':
      const findMinMax = () => {
        let min = 1.0e20,
          max = -1.0e20;
        for (let i = 0; i < arr.length; i++) {
          let value = arr[i];

          if (value > -999.0) {
            min = value < min ? value : min;
            max = value > max ? value : max;
          }
        }

        let j = 0;
        for (k of kmp) {
          j = j + 1;
        }

        if (min == 1.0e20) {
          min = -999.0;
        }
        if (max == -1.0e20) {
          max = -999.0;
        }

        return [min, max];
      };
      const [vMin, vMax] = findMinMax();

      for (val of arr) {
        if (val > -999.0) {
          if (vMax == vMin) {
            newval = 1.0;
          } else {
            if (normMethod == '3') {
              newval = (val - vMin) / (vMax - vMin);
            } else {
              newval = (val - 0.5 * (vMin + vMax)) / (0.5 * (vMax - vMin));
            }
          }
        } else {
          newval = -999.0;
        }
        normArray.push(newval);
      }

      break;
  }

  if (scaDir == 'row') {
    var i = 0;
    for (k of kmp) {
      normData[k] = [data[k], normArray[i]];
      i = i + 1;
    }
  } else {
    //if ('_children' in data){
    //    insertVals(normData, data, normArray, kmp, 0);
    //}

    //else {
    var i = 0;
    for (k of kmp) {
      normData[k] = [data[k], normArray[i]];
      i = i + 1;
    }
    //}
  }
  return normData;
}

const deepCopyFunction = inObject => {
  let outObject, value, key;

  if (typeof inObject !== 'object' || inObject === null) {
    return inObject; // Return the value if inObject is not an object
  }

  // Create an array or object to hold the values
  outObject = Array.isArray(inObject) ? [] : {};

  for (key in inObject) {
    value = inObject[key];

    // Recursively (deep) copy for nested objects, including arrays
    outObject[key] = deepCopyFunction(value);
  }

  return outObject;
};

function findMaxLevels() {
  var maxLevels = 0;
  var rows = table.getRows();

  maxLevels = rowLevels(rows, 0);
  return maxLevels;
}

function rowLevels(rows, nlevs) {
  var ylevs = nlevs + 1;
  var xlevs = nlevs + 1;
  var tlevs = xlevs;
  var mlevs;
  for (row of rows) {
    if (row.getTreeChildren().length > 0) {
      mlevs = rowLevels(row.getTreeChildren(), xlevs);
      tlevs = Math.max(tlevs, mlevs);
    } else {
      tlevs = Math.max(tlevs, xlevs);
    }
  }

  return tlevs;
}


function expandCollapse(action) {
  var maxLevs = findMaxLevels() - 1; //the last level always cannot expand

  //let timesExpl = lmtSettings["timesExpl"];
  //let numClicks = lmtSettings["numClicks"]; // default expand the first level dataTreeStartExpanded:[true, false]
  console.log('UDEB:', 'maxlevs', maxLevs, lmtSettings.numClicks, action, lmtSettings.timesExpl);
  if (action == 'expand') {
    if (lmtSettings.numClicks < maxLevs) {
      lmtSettings.timesExpl = lmtSettings.timesExpl + 1;
    } else {
      lmtSettings.timesExpl = lmtSettings.timesExpl - 1;
    }
    var tempData = table.getData();

    table.clearData();
    table.setData(tempData);
    table.redraw(true);

    // reset screen height
    fitScreen();
    console.log('UDEB:', 'tabredraw');
    if (lmtSettings.timesExpl == 0) {
      lmtSettings.numClicks = 0;
    } else {
      lmtSettings.numClicks = lmtSettings.numClicks + 1;
    }
  }
}

function setLevelExpand(row, level) {

  let timesExpl = lmtSettings["timesExpl"];
  if (level < timesExpl) {
    return true;
  }
}

function savetoHtml() {
  //-var htmlTable = table.getHtml("active", true);
  //-console.log(htmlTable);
  //-var newwdw = window.open(htmlTable);
  table.download('html', 'test.html', { style: true });

  //-table.download("pdf", "data.pdf", {
  //-    orientation:"portrait", //set page orientation to portrait
  //-    title:"Dynamics Quotation Report", //add title to report
  //-    jsPDF:{
  //-        unit:"in", //set units to inches
  //-    },
  //-    //autoTable:{ //advanced table styling
  //-    //    styles: {
  //-    //        fillColor: [100, 255, 255]
  //-    //    },
  //-    //    columnStyles: {
  //-    //        id: {fillColor: 255}
  //-    //    },
  //-    //    margin: {top: 60},
  //-    //},
  //-    //documentProcessing:function(doc){
  //-    //    //carry out an action on the doc object
  //-    //}
  //-});
}


function combineArraysToObject(keys, values) {
  if (keys.length !== values.length) {
    throw new Error('Arrays must have the same length');
  }

  return keys.reduce((result, key, index) => {
    result.push({ value: values[index], label: key });
    return result;
  }, []);
}



function cycleColumnSort() {
  const currentColumns = table.getColumnDefinitions();
  
  const fixedColumn = currentColumns.shift(); 

  var isGrouped = false;
  if (currentColumns.some(obj => 'columns' in obj)) {
    isGrouped = true;

  } else {
    isGrouped = false;
  }

  if (isGrouped) {
    if (sortState === 0) {
      currentColumns.forEach(item => {
        if (Array.isArray(item.columns)) {
          item.columns.sort((a, b) => a.title.localeCompare(b.title));
        }
      });
      sortState = 1;
    } else if (sortState === 1) {
      currentColumns.forEach(item => {
        if (Array.isArray(item.columns)) {
          item.columns.sort((a, b) => b.title.localeCompare(a.title));
        }
      });
      sortState = 2;

    } else {
      setGroupColumns(groupSavedValues);
      sortState = 0;
      updateButtonText();
      return;
    }
  } else {
    if (sortState === 0) {
      originalColumns = table.getColumnDefinitions();
      // Sort A-Z (ascending)
      currentColumns.sort((a, b) => a.title.localeCompare(b.title));
      sortState = 1;
    } else if (sortState === 1) {
      // Sort Z-A (descending)
      currentColumns.sort((a, b) => b.title.localeCompare(a.title));
      sortState = 2;
    } else {
      // Reset to original order
      table.setColumns(tabOption.columns);
      sortState = 0;
      updateButtonText();
      return;
    }
  }

  updateButtonText();
  
  table.setColumns([fixedColumn, ...currentColumns]);
}


function flattenColumns(data) {
  // Check if any object has a 'columns' array
  const hasColumns = data.some(obj => Array.isArray(obj.columns) && obj.columns.length > 0);

  if (!hasColumns) {
    return data; // Return original if no columns found
  }

  // Otherwise, flatten columns
  return [...new Set(
    data.reduce((acc, obj) => 
      Array.isArray(obj.columns) 
        ? [...acc, ...obj.columns] 
        : acc, 
    [])
  )];
}

function setGroupColumns(groupValues) {

  if (groupValues == null) {
    return;
  }

  //const currentColumns = table.getColumnDefinitions();
  //const currentColumns = tabOption.columns;
  //const fixedColumn = currentColumns.shift(); 


  const fixedColumn = tabOption.columns[0];
  const currentColumns = tabOption.columns.slice(1); 

  const flattenedColumns = flattenColumns(currentColumns);

  groupColumns = [];
  for (const value of groupValues) {
    const filterColumns = flattenedColumns.filter(col => col.title.includes(value));
    if (filterColumns.length > 0) {
      groupColumns.push({
                          title: value, 
                          columns: filterColumns,
                          headerContextMenu: groupHeaderContextMenu,
                          editableTitle:true
                        });
    }
  }

  if (groupColumns.length > 0) {
     table.setColumns([fixedColumn, ...groupColumns]);
  } else {

    alert (`values:\n${groupValues.join('\n')} not found in the table titles`);
  }
  
}

function updateButtonText() {
  const texts = ["Toggle Sort Title", "A-Z Sort", "Z-A Sort"];
  document.getElementById("sort-state-text").textContent = texts[sortState];
}


function initSubMenu() {
    const groupHeaderBtn = document.getElementById('groupHeaderBtn');
    const inputContainer = document.getElementById('inputContainer');
    
    // Add new input field
    inputContainer.addEventListener('click', function(e) {
        if (e.target.classList.contains('add-input-btn') || 
            e.target.closest('.add-input-btn')) {
            const newInputGroup = document.createElement('div');
            newInputGroup.className = 'input-group flex items-center space-x-2 w-48';
            newInputGroup.innerHTML = `
                <input type="text" class="w-32 ml-2.5 flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Enter text...">
                <button class="add-input-btn bg-green-500 hover:bg-green-600 text-white p-2 rounded-full transition duration-200">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clip-rule="evenodd" />
                    </svg>
                </button>
            `;
            // Insert after the clicked button's parent
            const parentGroup = e.target.closest('.input-group');
            parentGroup.parentNode.insertBefore(newInputGroup, parentGroup.nextSibling);
        }
    });
    
    // Group column header functionality
    groupHeaderBtn.addEventListener('click', function() {
        const inputs = inputContainer.querySelectorAll('.input-group');
        const values = [];

        inputs.forEach(group => {
            const input = group.querySelector('input[type="text"]');
            const val = input.value.trim();
            if (!val && inputs.length > 1) {  // Keep at least one input
                group.remove();
            } else if (val) {
                values.push(val);
            }
        });

        
        if (values.length === 0) {
            alert('No text inputs found or all are empty!');
            return;
        }
        
        // Here you can do operations with the collected values
        console.log('Collected values:', values);
        console.log(`Collected ${values.length} values:\n${values.join('\n')}`);

        groupSavedValues = values;

        setGroupColumns(values); 
        
        // Example operation: concatenate with commas
        const concatenated = values.join(', ');
        console.log('Concatenated:', concatenated);
    });
}

function resetGroupBtn() {
    // Clear all inputs except the first one
    const inputGroups = inputContainer.querySelectorAll('.input-group');
    
    // Remove all input groups except the first one
    inputGroups.forEach((group, index) => {
        if (index > 0) {
            group.remove();
        }
    });
    
    // Clear the first input's value
    const firstInput = inputContainer.querySelector('input[type="text"]');
    if (firstInput) {
        firstInput.value = '';
    }

    groupSavedValues = null;
}


// end of lmt_tab.js
