// require modules
var Tabulator = require('tabulator-tables');
var Choices = require('choices.js');
var Slideout = require('slideout');


var lmt_tool = require('./lmt_tool.js');
var tabOptions = require('./tabOptions.js');

var tabOption = tabOptions.tabOption;

tabOption.dataTreeStartExpanded = function (row, level) {
     return setLevelExpand(row, level); //expand rows where the "driver" data field is true;
};



//globalize functions
window.loadlocJson = loadlocJson;
window.toggleScreenHeight = toggleScreenHeight;
window.tableColor = tableColor;
window.expandCollapse = expandCollapse;
window.savetoHtml = savetoHtml;

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
const bgColorGroupFirstRow = ['yellow', '#00FF00', 'white'];
const fgColorGroupFirstRow = ['black', 'black', 'black'];

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


var lmtSettings = {"normMethod":"-1", "cmapMethod":"-1", "normDir":"-1", 
                   "setTootip":false, "setTopTitle":false, "setBottomTitle":false, "setCellValue":false, 
		   "timesExpl":1, "numClicks":1};


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


var _config = {};



if (document.readyState !== 'loading') {
  initlmtUD();
} else {
  document.addEventListener('DOMContentLoaded', function () {
    initlmtUD();
  });
}

function initlmtUD() {
  // reset the file input
  document.querySelector('#file').value = '';

  // initialize the select and multiselect boxes
  initChoices();


  // initialize checkbox
  initCheckBoxes();

  // initialize the tabulator

  table = new Tabulator('#dashboard-table', (option = {}));

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



    console.log('xxx in document ready');
    updateColorMapping();


  //-xum document.getElementById('select-choice-mini-map').onchange = function (){
  //-xum     updateColorMapping();
  //-xum     //table.clearData();
  //-xum     tabOption.data = table.getData();
  //-xum     table = new Tabulator("#dashboard-table", tabOption);
  //-xum     //table.redraw(true);
  //-xum };

  // is this a good place to insert lmtUDConfig?
  // try to find a config file

  const udcUrl = './_lmtUDConfig.json'; // in same origin
  console.log('UDEB: UD config file ', udcUrl);

  //setConfig(udcUrl);
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

//-function updateNormalizing() {
//-  if (tabTempJson.length > 0) {
//-    var tempData = deepCopyFunction(tabTempJson);
//-  } else {
//-    var tempData = table.getData('all');
//-    tabTempJson = deepCopyFunction(tempData);
//-  }
//-
//-  var newData = Object.assign([], tempData);
//-
//-  //if ($('.scarow').is(':checked')) {
//-  //  scadir = 'row';
//-  //}
//-  //if ($('.scacol').is(':checked')) {
//-  //  scadir = 'column';
//-  //}
//-
//-  if (scadir == 'row') {
//-    var j = 0;
//-    for (data of tempData) {
//-      newData[j] = normalizer($('#select-choice-mini-sca').val(), data);
//-      j = j + 1;
//-    }
//-  } else {
//-    var colData = {};
//-    for (col_name of Object.keys(tempData[0])) {
//-      if (col_name != 'row_name' && col_name != '_children') {
//-        colData = extractCol(tempData, col_name, '');
//-
//-        var newcolData = normalizer($('#select-choice-mini-sca').val(), colData);
//-
//-        insertCol(newData, col_name, newcolData);
//-      }
//-    }
//-  }
//-
//-  return newData;
//-}

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


function toggleScreenHeight() {
  if ($('#screenheight[type=checkbox]').is(':checked')) {
    document.getElementById('dashboard-table').style['max-height'] = '100%';
    //document.getElementById('dashboard-table').style.height = "82vh";
    //document.getElementById('dashboard-table').style['height'] = "auto";
    document.getElementById('dashboard-table').style.removeProperty('height');
    document
      .getElementById('dashboard-table')
      .style.removeProperty('min-height');

    var elmnt = document.getElementsByClassName('tabulator-header');
    //var totHeight = elmnt[0].offsetHeight + 28 * table.getRows().length + 17;
    var totHeight = elmnt[0].offsetHeight + 30 * table.getRows().length + 20;

    if (isTreeTable == 0) {
      document.getElementById('dashboard-table').style['height'] =
        totHeight.toString() + 'px';
    } else {
      document.getElementById('dashboard-table').style['height'] = '82vh';
    }
    table.setHeight(false);
    draw_legend();
  } else {
    document
      .getElementById('dashboard-table')
      .style.removeProperty('max-height');
    document.getElementById('dashboard-table').style.height = '100%';
    table.setHeight(false);
    draw_legend();
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
            txcol = 'black';
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
  txcol = 'white';
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
  dictChoices['hideChoices'] = new Choices(
    document.querySelector('.js-choice-hide'),
    {
      searchEnabled: false,
      shouldSort: false,
      removeItemButton: true,
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
        removeItemButton: false
      }
    );
    // hide them first during initialization
    dictChoices[dim + 'Choices'].containerInner.element.style.display = 'none';
  }

  // other single select boxes
  for (const dim of ['norm', 'cmap', 'exam', 'logo']) {
    dictChoices[dim + 'Choices'] = new Choices(
      document.querySelector('.js-choice-' + dim),
      {
        searchEnabled: false,
        shouldSort: false,
        removeItemButton: false
      }
    );
  }
}

function initChoicesEvent(cJson) {

  for (let [i, dimn] of Object.entries(cJson.DIMENSIONS.json_structure)) {
    // i start from zero

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
  //initialization


  // x and y dimensions
  for (const dim of ['xdim', 'ydim']) {
    dictChoices[dim + 'Choices'].passedElement.element.addEventListener(
      'addItem', //select item
      function (event) {
        let preValue =
          dictChoices[dim == 'xdim' ? 'ydimChoices' : 'xdimChoices'].getValue(
            true
          );
        if (event.detail.value == preValue) {
          alert(' x and y must be different ');
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
              console.log('xxx', selectIdByDims[dimn], dimn);
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
      false
    );
  }

  // other dimensions
  for (let [i, dimn] of Object.entries(cJson.DIMENSIONS.json_structure)) {
    // i start from zero

    let k = parseInt(i) + 1;
    let tempChoices = dictChoices['dim' + k.toString() + 'Choices'];

    tempChoices.passedElement.element.addEventListener(
      'addItem', //select item
      function (event) {
        // do something creative here...
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
            ini_fxdm = {}
            ;[ini_xdim, ini_ydim, ini_fxdm] = initDim(
              cmecJson,
              (dimSet = dimSetEvent)
            );

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
        }
      },
      false
    );
  }

  // other selections
  for (const dim of ['norm', 'cmap', 'exam', 'logo']) {
    dictChoices[dim + 'Choices'].passedElement.element.addEventListener(
      'addItem', //select item
      function (event) {

        if (dim == 'exam') {
          console.log('fire event for exam');
          let jsfURL = event.detail.value;
          jsfURL = jsonFileURL + jsfURL;
          loadrmtJson(jsfURL);
        }

        if (dim == 'logo') {
          logoFile = event.detail.value;
          var tempData = table.getData();
          table = new Tabulator('#dashboard-table', tabOption); // only way to reformat col title
          table.clearData();
          table.setData(tempData);
          table.redraw(true);
        }


	//normalization
	if (dim == 'norm') {
           console.log('UDEB: fire event for normalization');
	   lmtSettings["normMethod"] = event.detail.value;

           if (tabTempJson.length > 0) {
             var tempData = deepCopyFunction(tabTempJson);
           } else {
             var tempData = table.getData('all');
             tabTempJson = deepCopyFunction(tempData);
           }
         
           var newData = Object.assign([], tempData);
           if (lmtSettings["normDir"] == 'row') {
             let j = 0;
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

	if (dim == 'cmap') {
	   console.log('fire event for cmap');
	   lmtSettings["cmapMethod"] = event.detail.value;
           updateColorMapping();
           tabOption.data = table.getData();
           table = new Tabulator("#dashboard-table", tabOption);
	}
      },
      false
    );
  }
}


function setChoicesDefault(setNorm, setCmap) {
  dictChoices["normChoices"].setChoiceByValue(setNorm);
  dictChoices["cmapChoices"].setChoiceByValue(setCmap);
}


function setCheckBoxesDefault(normDir, setTooltip, setTopTitle, setBottomTitle, setCellValue){

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

  if (setTooltip){
    document.getElementById("cb-tooltip").checked = true;
  } else {
    document.getElementById("cb-tooltip").checked = false;
  }

  if (setCellValue) {
    document.getElementById("cb-cellvalue").checked = true;
  } else {
    document.getElementById("cb-cellvalue").checked = false;
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

  // set the options for normalization and color mapping

 if (lmtSettings["normMethod"] !== "-1"){
    dictChoices["normChoices"].setChoiceByValue(lmtSettings["normMethod"]);
 }

 if (lmtSettings["cmapMethod"] !== "-1"){
    dictChoices["cmapChoices"].setChoiceByValue(lmtSettings["cmapMethod"]);
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

      readFile(file)
        .then(function(filePromise) {
          try {
            cmecJson = JSON.parse(filePromise.content);
          } catch (err) {
            alert('JSON parsing', err.message);
          }

          //CMEC json schema validation will be added soon

          jsonType = 'CMEC';

          // initialize dimensions
          let ini_xdim,
            ini_ydim,
            ini_fxdm = {}
            ;[ini_xdim, ini_ydim, ini_fxdm] = initDim(cmecJson, (dimSet = {}));



          //default is from ILAMB style
	  // always assume the data is unnormalized
	  setChoicesDefault("0", "0");
	  lmtSettings.normMethod = "1";
	  lmtSettings.cmapMethod = "0";

	  setCheckBoxesDefault("row", true, true, false, false)
	  lmtSettings.normDir = "row";
	  lmtSettings.setTooltip = true;
	  lmtSettings.setTopTitle = true;
	  lmtSettings.setBottomTitle = false;
	  lmtSettings.setCellValue = true;


          // initialize choices events
          initChoicesEvent(cmecJson);

	  // initialize checkbox events
	  initCheckBoxesEvent();

          // select choices based on the initial dimension setting
          console.log('UDEB: start prepareSel');
          prepareSel(cmecJson, ini_xdim, ini_ydim, ini_fxdm, (setNorm="1"), (setCmap="0"));

          // set tab options
          preSetTab(ini_xdim, ini_ydim, cmecJson);

          // add event for json ready
          let event = new CustomEvent('jsonReady', {
            bubbles: true, // Allow the event to bubble up the DOM tree
            cancelable: true // Allow the event to be cancelable
          });
          // Trigger the custom event on the document
          document.dispatchEvent(event);
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

  //-xum lmt_tool.add_options(Object.keys(tabTreeJson[0]).filter(item => item !== 'row_name' && item !== '_children' && item !== 'metric'), 'hlist');
  // only columns can be hided, so based on the ini_xdim, initialize hideChoices
  //-xum hideChoices.setChoices(combineArraysToObject(Object.keys(cmecJson.DIMENSIONS.dimensions[ini_xdim]), Object.keys(cmecJson.DIMENSIONS.dimensions[ini_xdim])),
  //-xum     'value', 'label', false);

  // set tab column
  //
  tabOption.data = tabTreeJson;
  bgcol = '#0063B2FF';
  ftwgt = 500;
  ftsty = 'normal';
  txdec = '';
  txcol = 'black';
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
  tabTreeJson = lmt_tool.cmec2tab_json(cJson, ini_xdim, ini_ydim, ini_fxdm, 1);
  console.log('UDEB: in initDim return');

  return [ini_xdim, ini_ydim, ini_fxdm];
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
    table = new Tabulator('#dashboard-table', tabOption);
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
  document.getElementById("cb-tooltip").checked = false;
  document.getElementById("cb-cellvalue").checked = false;
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


  document.getElementById("cb-tooltip").addEventListener("change", () => {
    console.log("fire event for tooltip");
    if (document.getElementById("cb-tooltip").checked) {

      lmtSettings.setTooltip = true;
      tabOption.tooltips = function (cell) {
         if (cell.getField() == 'row_name') {
	   return false;
	 } else {
	   return Math.round((cell.getValue() + Number.EPSILON) * 100) / 100;
	 }
      }					        

    } else {
      lmtSettings.setTooltip = false;
      tabOption.tooltips = false;

      console.log("tooltip is false");
    }
    
    //table redraw needed?
    table = new Tabulator('#dashboard-table', tabOption);
  });

  document.getElementById("cb-toptitle").addEventListener("change", () => {
    console.log("fire event for toptitle");
    if (document.getElementById("cb-toptitle").checked) {

      lmtSettings.setTopTitle = true;
      tabOption['headerVisible'] = true;
    } else {
      lmtSettings.setTopTitle = false;
      tabOption['headerVisible'] = false;
    }
    //table redraw needed?
    // clear memory, otherwise will be very slow
    var tempData = table.getData();
    table.clearData();
    table.setData(tempData);
    table = new Tabulator('#dashboard-table', tabOption);
  });


  document.getElementById("cb-bottomtitle").addEventListener("change", () => {
    console.log("fire event for bottomtitle");
    if (document.getElementById("cb-bottomtitle").checked) {

      lmtSettings.setBottomTitle = true;
      for (let x of tabOption.columns) {
        if (x.field != 'row_name') {
	  x['bottomCalc'] = bottomCalcFunc;
        }
      }
    } else {
      lmtSettings.setBottomTitle = false;
      for (let x of tabOption.columns) {
        if (x.field != 'row_name') {
          delete x['bottomCalc'];
	}
      }
    }
    //table redraw needed?
    var tempData = table.getData();
    table.clearData();
    table.setData(tempData);
    table = new Tabulator('#dashboard-table', tabOption);

  });



  document.getElementById("cb-cellvalue").addEventListener("change", () => {
    console.log("fire event for cellvalue");
    if (document.getElementById("cb-cellvalue").checked) {

      lmtSettings.setCellValue = true;
      for (x of tabOption.columns) {
        if (x.field != 'row_name') {
          x['formatterParams'] = { showCellValue: true };
        }
      }
    } else {
      lmtSettings.setCellValue = false;
      for (x of tabOption.columns) {
        if (x.field != 'row_name') {
          x['formatterParams'] = { showCellValue: false };
        }
      }
    }
    var tempData = table.getData();
    table.clearData();
    table.setData(tempData);
    table = new Tabulator('#dashboard-table', tabOption);
  });

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
    cell.getElement().style.color = 'black';
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
    cell.getElement().style.color = 'black';
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
    cell.getElement().style.color = 'black';
    //return Math.round((origVal + Number.EPSILON) * 100) / 100;
    return normVal.toFixed(2);
  }
}

var lmtTitleFormatter = function (cell, titleFormatterParams, onRendered) {
  onRendered(function () {
    cell.getElement().parentElement.parentElement.parentElement.style.backgroundColor =
      titleFormatterParams.bgcol;
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
    headerContextMenu: headerContextMenu, //headerMenu:headerMenu,
    formatter: lmtCellColorFormatter,
    formatterParams: {},
    titleFormatter: lmtTitleFormatter,
    titleFormatterParams: lmtTitleFormatterParams,
    width: 30,
    headerVertical: 'flip',
    resizable: false,
    headerSort: true
  };
  //formatter:lmtCellColorFormatter, formatterParams:{}, titleFormatter:lmtTitleFormatter, titleFormatterParams:lmtTitleFormatterParams, width:28, headerVertical:"flip", resizable:false};
  //
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
          bgcol = 'white';
        } else {
          bgcol = bgColorGroupFirstRow[k];
        }
        ftwgt = 100;
        ftsty = 'normal';
        txdec = '';
        //txcol = "white";
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
        txcol = 'white';
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
    return "<img class='infoImage' src='image/".concat(logoFile, "'>");
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
var headerMenu = [
  {
    label: "<i class='fa fa-eye-slash'></i> Hide Column",
    action: function (e, column) {
      column.hide();
    }
  },
  {
    label: "<i class='fa fa-arrows-alt'></i> Move Column",
    action: function (e, column) {
      column.move('col');
    }
  }
];

//define row context menu
var headerContextMenu = [
  {
    label: 'Hide Column',
    action: function (e, column) {
      column.hide();
      var columnField = column.getField();
      selData = $('#hlist').select2('data');
      hideItems = [];
      if (selData.length >= 1) {
        for (se of selData) {
          hideItems.push(se.id);
        }
      }
      hideItems.push(columnField);
      $('#hlist').val(hideItems).trigger('change');
    }
  }
];

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
    label: 'Hide Logo',
    action: function (e, column) {
      document.getElementsByClassName('infoImage')[0].style.display = 'none';
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

function newCellClickFunc(e, cell) {
  //var template_test = "metric", "model", "region", "return metric.includes(Relationships)? :metric.replace(/::/g,'/') + metric.split('/')[-1]+'.html?model='+model";

  var thisRow = cell.getRow();
  var thiscol = cell.getColumn();
  var isTree = new Boolean(true);

  var colField = thiscol.getField().replace(/\s+/g, '');
  var rowField = getRowTreeStruct(thisRow);

  xDimName = $('#select-choice-mini-x').val();
  yDimName = $('#select-choice-mini-y').val();

  var input = {};

  input[xDimName] = colField;
  input[yDimName] = rowField;
  for (dim of cmecJson.DIMENSIONS.json_structure) {
    if (dim != xDimName && dim != yDimName) {
      selectVal = $('#'.concat(selectIDbyDims[dim])).val();
      input[dim] = selectVal.replace(/\s+/g, '');
    }
  }

  input.metric = input.metric.replace('!!', '::');

  var metricList = [];

  for (met of Object.keys(cmecJson.DIMENSIONS.dimensions.metric)) {
    if (!met.includes('Relationships')) {
      metricList.push(
        met.replace(/\s+/g, '').replace(/::/g, '/').replace(/!!/g, '/')
      );
    }
  }

  metricArr = input.metric.split('::');
  metricLen = metricArr.length;

  if (input.metric.includes('Relationships')) {
    var myLink =
      metricList.filter(s => s.includes(metricArr[1]))[0] +
      '/' +
      metricArr[1].split('/')[1] +
      '.html#Relationships';
  } else {
    var myLink =
      input.metric.replace(/::/g, '/') +
      '/' +
      input.metric.split('::')[metricLen - 1] +
      '.html';
  }

  if (baseUrl.slice(-1) != '/') {
    baseUrl = baseUrl + '/';
  }
  console.log(
    'UDEB: mylink',
    metricArr,
    myLink,
    input.metric.split('::'),
    baseUrl + myLink.concat('?model=', input.model, '&region=', input.region)
  );

  if (metricLen < 3) {
    if (colField == 'row_name') {
      thisRow.treeToggle();
    } else {
      alert('Only the lowest level metric is clickable');
    }
  } else {
    var newWin = window.open(
      baseUrl + myLink.concat('?model=', input.model, '&region=', input.region)
    );
  }
}

//
function cellClickFuncGenetic(e, cell) {
  //e - the click event object
  //cell - cell component
  var thisrow = cell.getRow();
  var thiscol = cell.getColumn();
  var isTree = new Boolean(true);

  // check parent row
  //
  //
  if (thisrow.getTreeChildren().length == 0) {
    var colField = thiscol.getField();
    //var rowFirst = thisrow.getCell('row_name').getValue();
    var rowFirst = thisrow.getCell(ydimField).getValue();

    xDimName = $('#select-choice-mini-x').val();
    yDimName = $('#select-choice-mini-y').val();

    let linkmodel;
    let linkmetric;
    let dims;

    if (jsonType == 'CMEC') {
      dims = cmecJson.DIMENSIONS.json_structure;
    } else {
      dims = ['region', 'model', 'metric', 'statistic'];
    }

    for (dim of dims) {
      selectVal = $('#'.concat(selectIDbyDims[dim])).val();
      if (selectVal != undefined && selectVal != null && selectVal != '') {
        if (dim == 'model') {
          linkmodel = selectVal;
        }
        if (dim == 'region') {
          linkregion = selectVal;
        }
        if (dim == 'metric') {
          if (selectVal.includes('!!')) {
            linkmetric = selectVal
              .replace(/\s/g, '')
              .replace('::', '/')
              .replace('!!', '/');
            var benmarkname = selectVal.split('!!').slice(-1)[0];
            linkmetric = linkmetric.concat('/', benmarkname);
          } else {
            alert('111 clickable cell only for lowest level metric');
          }
        }
      }
    }

    if (xDimName == 'model') {
      linkmodel = colField;
    }
    if (yDimName == 'model') {
      linkmodel = rowFirst;
    }

    if (xDimName == 'region') {
      linkregion = colField;
    }
    if (yDimName == 'region') {
      linkregion = rowFirst;
    }

    if (xDimName == 'metric') {
      if (colField.includes('!!')) {
        linkmetric = colField
          .replace(/\s/g, '')
          .replace('::', '/')
          .replace('!!', '/');
        var benmarkname = colField.split('!!').slice(-1)[0];
        linkmetric = linkmetric.concat('/', benmarkname);
      } else {
        alert('222 clickable cell only for lowest level metric');
      }
    }

    if (yDimName == 'metric') {
      var topmet = thisrow
        .getTreeParent()
        .getTreeParent()
        .getCell(ydimField)
        .getValue()
        .replace(/\s/g, '');
      var sndmet = thisrow
        .getTreeParent()
        .getCell(ydimField)
        .getValue()
        .replace(/\s/g, '');

      //mx: this part code only worked for IPCC figure as it combined ILAMB and IOMB results
      var isLandBenchMark = 0;
      if (
        topmet.substring(0, 4) == 'Land' ||
        topmet.substring(0, 5) == 'Ocean'
      ) {
        if (topmet.substring(0, 4) == 'Land') {
          xtopmet = topmet.replace('Land', '');
          isLandBenchMark = 1;
        } else {
          xtopmet = topmet.replace('Ocean', '');
          isLandBenchMark = -1;
        }

        if (xtopmet == 'Relationships') {
          let metVar = sndmet.split('/')[0];
          let metSrc = sndmet.split('/')[1];
          let metOrg = Object.keys(
            cmecJson.DIMENSIONS.dimensions['metric']
          ).find(a => a.replace(/\s/g, '').includes(metVar));

          if (isLandBenchMark == 1) {
            var metAct = metOrg
              .split('::')[0]
              .replace(/\s/g, '')
              .replace('Land', '');
          } else {
            var metAct = metOrg
              .split('::')[0]
              .replace(/\s/g, '')
              .replace('Ocean', '');
          }
          linkmetric = metAct.concat(
            '/',
            sndmet,
            '/',
            metSrc,
            '.html#Relationships'
          );
          console.log('UDEB:', 're', linkmetric);
        } else {
          linkmetric = xtopmet.concat(
            '/',
            sndmet,
            '/',
            rowFirst,
            '/',
            rowFirst,
            '.html'
          );
          console.log('UDEB:', 'other', linkmetric);
        }
      } else {
        if (topmet == 'Relationships') {
          let metVar = sndmet.split('/')[0];
          let metSrc = sndmet.split('/')[1];
          let metOrg = Object.keys(
            cmecJson.DIMENSIONS.dimensions['metric']
          ).find(a => a.replace(/\s/g, '').includes(metVar));
          let metAct = metOrg.split('::')[0].replace(/\s/g, '');
          linkmetric = metAct.concat(
            '/',
            sndmet,
            '/',
            metSrc,
            '.html#Relationships'
          );
          console.log('UDEB:', 're', linkmetric);
        } else {
          linkmetric = topmet.concat(
            '/',
            sndmet,
            '/',
            rowFirst,
            '/',
            rowFirst,
            '.html'
          );
          console.log('UDEB:', 'other', linkmetric);
        }
      }
    }

    if (baseUrl.slice(-1) != '/') {
      baseUrl = baseUrl + '/';
    }

    if (linkmetric != undefined) {
      if (isLandBenchMark == 0) {
        var newWin = window.open(
          baseUrl.concat(
            linkmetric,
            '?model=',
            linkmodel,
            '&region=',
            linkregion
          )
        );
      } else if (isLandBenchMark == 1) {
        var newWin = window.open(
          'https://www.ilamb.org/CMIP5v6/ILAMB_AR6/'.concat(
            linkmetric,
            '?model=',
            linkmodel,
            '&region=',
            linkregion
          )
        );
      } else if (isLandBenchMark == -1) {
        var newWin = window.open(
          'https://www.ilamb.org/CMIP5v6/IOMB_AR6/'.concat(
            linkmetric,
            '?model=',
            linkmodel,
            '&region=',
            linkregion
          )
        );
      }
    }
  } else {
    if (cell.getRow().getCell(ydimField).getValue() == cell.getValue()) {
      cell.getRow().treeToggle();
    } else {
      alert('Error: clickable cell only for lowest level metric');
    }
  }
}

//background color of first column
function setFirstColBgColor(cell, formatterParams, onRendered) {
  var value = cell.getValue();
  onRendered(function () {
    if (!cell.getRow().getTreeParent()) {
      if (formatterParams.yDim == 'metric') {
        fgFontColor = '#0808ff';
      } else if (formatterParams.yDim == 'model') {
        fgFontColor = 'black';
      } else {
        fgFontColor = 'black';
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
        fgFontColor = 'white';
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

$(window).on('beforeunload', function () {
  //const cb = document.querySelector('input[name="colorblind"]');
  //

  resetSwitch();
  resetSelect();
  resetInput();
});

function resetSwitch() {
  $('#colorblind').prop('checked', true);

  $('.scarow').prop('checked', true);
  $('.scacol').prop('checked', false);

  $('#cellvalue').prop('checked', true);
  $('#bottomtitle').prop('checked', false);
  $('#toptitle').prop('checked', true);
  $('#tooltips').prop('checked', true);
  if (_config.udcScreenHeight == 0) {
    $('.screenheight').prop('checked', false);
  } else {
    $('.screenheight').prop('checked', true);
  }
}

function resetSelect() {
  $('.hide-list').val(null).trigger('change');

  $('#select-choice-mini-sca').val('0').trigger('change');
  $('#select-choice-mini-map').val('0').trigger('change');

  //$('#select-choice-mini-x').val(null).trigger('change');
  //$('#select-choice-mini-y').val(null).trigger('change');

  $('#select-choice-mini-1').val(null).trigger('change');
  $('#select-choice-mini-2').val(null).trigger('change');
  $('#select-choice-mini-3').val(null).trigger('change');
  $('#select-choice-mini-4').val(null).trigger('change');
  $('#select-choice-mini-5').val(null).trigger('change');
  $('#select-choice-mini-6').val(null).trigger('change');
  $('#select-choice-mini-7').val(null).trigger('change');
  $('#select-choice-mini-8').val(null).trigger('change');
  $('#select-choice-mini-9').val(null).trigger('change');

  $('#select-choice-mini-1').select2().next().hide();
  $('#select-choice-mini-2').select2().next().hide();
  $('#select-choice-mini-3').select2().next().hide();
  $('#select-choice-mini-4').select2().next().hide();
  $('#select-choice-mini-5').select2().next().hide();
  $('#select-choice-mini-6').select2().next().hide();
  $('#select-choice-mini-7').select2().next().hide();
  $('#select-choice-mini-8').select2().next().hide();
  $('#select-choice-mini-9').select2().next().hide();
}

function resetInput() {
  $('.select-choice-ex').val(null).trigger('change');
  $('#file').val('');
  isJsonReady = false;
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
    //case "0":
    //   normArray = arr;
    //   break;
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

      for (val of arr) {
        if (val > -999.0) {
          newval = (val - getMean(arr)) / getStd(arr);
        } else {
          newval = -999.0;
        }
        normArray.push(newval);
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
