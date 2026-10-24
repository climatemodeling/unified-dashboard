// require modules

// external modules
const Tabulator = require('tabulator-tables');
const Choices = require('choices.js');
const Slideout = require('slideout');
const domtoimage = require('dom-to-image');
const { jsPDF } = window.jspdf;

// internal modules
var lmt_tool = require('./lmt_tool.js');
var tabOptions = require('./tabOptions.js');
var globalVars = require('./globalVars.js');

var tabOption = tabOptions.tabOption;
tabOption.dataTreeStartExpanded = function (row, level) {
  return setLevelExpand(row, level); //expand rows where the "driver" data field is true;
};

//globalize functions
window.loadlocJson = loadlocJson;
window.tableColor = tableColor;
window.expandCollapse = expandCollapse;
window.savetoHtml = savetoHtml;
window.cycleColumnSort = cycleColumnSort;


window.lmtUDLoaded = 1;

var DEBUG = true; // set to false to disable debugging

/**
 * Log a debug message when `DEBUG` is enabled.
 *
 * @param {...*} args - Values passed to `console.log`.
 */
function debugLog(...args) {
  if (DEBUG) {
    console.log(...args);
  }
}

const bgColorGroup = ['#ECFFE6', '#E6F9FF', '#FFECE6', '#EDEDED', '#FFF2E5'];



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


let setModelColorCycle = true;
let bgColorGroupFirstRow;
let fgColorGroupFirstRow;

var logoFile = 'rubisco_logo.png';

var cmap = PuOr;


var lmtSettings = {"tableBuilt": false, "normMethod":"-1", "cmapMethod":"-1", "logoMethod":"default", "normDir":"-1", 
                   "setTootip":false, "setTopTitle":false, "setBottomTitle":false, "setCellValue":false, "setFitScreen":true, 
		   "timesExpl":1, "numClicks":1, 
		   "stopFire":false,
		   "stopFireNorm":false, "firstLoad":true, "xyChange":0, "includeColorBar":false};


var tabTempJson = [];

//global variables

var dictChoices = {};

var dimSetEvent = { x_dim: null, y_dim: null, fxdim: {} };

var cmecJson;
var tabTreeJson;
var table;

var ydimField;

var selectIdByDims = {};

var grpsFirstCol = [];

var grpsModSrcIdx = {};
var grpsTopMetric = [];

var isJsonReady = false;


var _config = {};

var sortState = 0;

var preXdim;
var groupSavedValues = null;

// Header style values shared by the column builders.
let bgcol, ftwgt, ftsty, txdec, txcol;
let fgFontColor;

const columnStyles = new Map();

//export

dictChoices = globalVars.dictChoices;

dimSetEvent = globalVars.dimSetEvent;

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



if (document.readyState !== 'loading') {
  initlmtUD();
} else {
  document.addEventListener('DOMContentLoaded', function () {
    initlmtUD();
  });
}

/**
 * Initialize the dashboard: Choices.js selects, checkboxes, the Tabulator
 * instance, the slide-out settings panel, the configuration file and the
 * image export controls.
 */
function initlmtUD() {
  // reset the file input
  // initialize the select and multiselect boxes
  const fileInput = document.querySelector('#file');
  if (fileInput) {
    fileInput.value = '';
  }
  initChoices();


  // initialize checkbox
  initCheckBoxes();

  // initialize the tabulator

  table = new Tabulator('#dashboard-table', tabOption);

  var slideout = new Slideout({
    panel: document.getElementById('panel'),
    menu: document.getElementById('menu')
  });

  const slideoutToggle = document.querySelector('.js-slideout-toggle');
  if (slideoutToggle) {
    slideoutToggle.addEventListener('click', function () {
      slideout.toggle();
    });
  }



  //updateColorMapping();


  // is this a good place to insert lmtUDConfig?
  // try to find a config file

  const udcUrl = './_lmtUDConfig.json'; // in same origin
  debugLog('UDEB: UD config file ', udcUrl);

  setConfig(udcUrl);

  if (setModelColorCycle) {
    bgColorGroupFirstRow = ['#FFFF00', '#00FF00', '#FFFFFF'];
    fgColorGroupFirstRow = ['#000000', '#000000', '#000000'];
  } else {
    bgColorGroupFirstRow = ['#FFFFFF'];
    fgColorGroupFirstRow = ['#000000'];
  }

  // Keep the export module informed about the model color groups.
  globalVars.sharedState.bgColorGroupFirstRow = bgColorGroupFirstRow;


  // Save image functions

  initSubMenu();
  initImageExport();
}


/**
 * Wire up the "Save to Image" select and export the dashboard in the chosen
 * format.
 */
function initImageExport() {
  const saveImageSelect = document.getElementById('saveimage');
  const dpiInput = document.getElementById('download-image-dpi');

  if (!saveImageSelect || !dpiInput) {
    return;
  }

  saveImageSelect.selectedIndex = 0;

  saveImageSelect.addEventListener('change', function () {
    const imgScale = Math.floor(Number(dpiInput.value) / 72);
    const node = lmtSettings.includeColorBar
      ? document.getElementById('mytab')
      : document.getElementById('dashboard-table');

    if (!node) {
      return;
    }

    const rect = node.getBoundingClientRect();
    const width = rect.width;
    const width2 = lmtSettings.includeColorBar ? rect.width * 1.5 : rect.width;
    const height = rect.height + 2;
    const style = {
      transform: `scale(${imgScale})`,
      transformOrigin: 'top left',
      overflow: 'visible',
      width: `${width}px`,
      height: `${height}px`
    };

    switch (this.value) {
      case 'PNG':
        domtoimage
          .toPng(node, {
            height: height * imgScale,
            width: width2 * imgScale,
            style,
            quality: 1
          })
          .then(dataUrl => downloadImage(dataUrl, 'output.png'));
        break;
      case 'SVG':
        domtoimage
          .toSvg(node)
          .then(dataUrl => downloadImage(dataUrl, 'output.svg'));
        break;
      case 'HTML':
        savetoHtml();
        break;
      case 'JPEG':
        domtoimage
          .toJpeg(node, {
            quality: 1.0,
            height: height * imgScale + 5,
            width: width2 * imgScale + 5,
            style
          })
          .then(dataUrl => downloadImage(dataUrl, 'output.jpeg'));
        break;
      case 'PDF':
        domtoimage
          .toPng(node, {
            height: height * imgScale,
            width: width2 * imgScale,
            style
          })
          .then(dataUrl => {
            const nodeWidth = node.clientWidth * imgScale;
            const nodeHeight = node.clientHeight * imgScale;
            const isLandscape = nodeWidth >= nodeHeight;
            const pdf = new jsPDF(
              isLandscape ? 'l' : 'p',
              'pt',
              isLandscape ? [nodeWidth, nodeHeight] : [nodeHeight, nodeWidth]
            );
            pdf.addImage(dataUrl, 'PNG', 0, 0, nodeWidth, nodeHeight);
            pdf.save('output.pdf');
          });
        break;
      default:
        debugLog('fallback to default');
    }
  });
}


/**
 * Trigger a browser download for a data URL.
 *
 * @param {string} imgUrl - Data URL or object URL to download.
 * @param {string} imgFileName - Suggested file name.
 */
function downloadImage (imgUrl, imgFileName) {
  var downloadLink = document.createElement('a');
  downloadLink.download = imgFileName;
  downloadLink.href = imgUrl;
  downloadLink.click();
}

/**
 * Load and apply the optional dashboard configuration file
 * (`_lmtUDConfig.json`). Unknown or missing keys leave the defaults unchanged.
 *
 * @param {string} [udcUrl='./_lmtUDConfig.json'] - Location of the config file.
 * @returns {Promise<void>} Resolves when the configuration has been applied.
 */
async function setConfig(udcUrl = './_lmtUDConfig.json') {
  debugLog('UDEB: UD config file ', udcUrl);

  try {
    const response = await fetch(udcUrl);
    if (!response.ok) {
      throw new Error(`Config request failed with status ${response.status}`);
    }
    _config = (await response.json()) || {};

    if (_config.hasOwnProperty("setModelColorCycle")){
      setModelColorCycle = _config.setModelColorCycle;
    }

    if (_config.hasOwnProperty("ydimOrder")){
      lmtSettings["ydimOrder"] = _config.ydimOrder;
    }

    if (_config.hasOwnProperty("includeColorBar")){
      lmtSettings["includeColorBar"] = _config.includeColorBar;
    }

    if (_config.udcJsonLoc) {
      const jsonUrl = './' + _config.udcJsonLoc;
      debugLog('UDEB: JSON URL', jsonUrl);
      loadtmpJson(jsonUrl);

      if (_config.timesExpl) {
        lmtSettings["timesExpl"] = _config.timesExpl;
      }

      const fileInput = document.querySelector('section input[type="file"]');
      if (fileInput) {
        fileInput.closest('section').hidden = true;
      }

      if (_config.banner) {
        const title = document.getElementById('dashboardTitle');
        if (title) {
          title.textContent = _config.banner;
        }
      }
    } else {
      debugLog('UDEB: No JSON data file in config');
    }
  } catch (err) {
    console.warn('Error loading config: ' + err.message);
  }
}


/**
 * Collect the values of one column from a (possibly nested) array of rows.
 * Nested row names are joined with `::` so that they remain unique.
 *
 * @param {Object[]} dataArr - Rows to read.
 * @param {string} colName - Field to extract.
 * @param {string} parentName - Prefix accumulated while descending the tree.
 * @returns {Object<string, *>} Map of row path to cell value.
 */
function extractCol(dataArr, colName, parentName) {
  var colData = {};
  for (const data of dataArr) {
    const cur_name =
      parentName !== '' ? parentName + '::' + data.row_name : data.row_name;
    colData[cur_name] = data[colName];

    if (Object.keys(data).includes('_children')) {
      const newData = extractCol(data._children, colName, cur_name);
      colData = Object.assign({}, colData, newData);
    }
  }
  return colData;
}

/**
 * Write the values produced by {@link extractCol} back into a (possibly
 * nested) array of rows.
 *
 * @param {Object[]} dataArr - Rows to update.
 * @param {string} colName - Field to write.
 * @param {Object<string, *>} colData - Values keyed by row path.
 * @param {string} parentName - Prefix accumulated while descending the tree.
 */
function insertCol(dataArr, colName, colData, parentName) {
  try {
    for (const data of dataArr) {
      const cur_name =
        parentName !== '' ? parentName + '::' + data.row_name : data.row_name;

      data[colName] = colData[cur_name];

      if (Object.keys(data).includes('_children')) {
        insertCol(data._children, colName, colData, cur_name);
      }
    }
  } catch (err) {
    debugLog('UDEB:', parentName, dataArr);
  }
}

/**
 * Select the cell color formatter from the current color-map choice and apply
 * it to every value column.
 */
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
  for (const x of tabOption.columns) {
    if (x.field != 'row_name') {

      if (x.hasOwnProperty('columns')){
         for (const y of x.columns) {
           y['formatter'] = lmtCellColorFormatter;
         }
      } else {
        x['formatter'] = lmtCellColorFormatter;
      }
    }
  }
}

//server side files

/**
 * Parse a JSON file selected by the user.
 *
 * @param {File} fileObj - File to read.
 * @returns {Promise<Object>} Parsed JSON.
 */
async function parseJsonFromFile(fileObj) {
  return new Promise((resolve, reject) => {
    // 1. Create a FileReader
    const reader = new FileReader();

    // 2. Define what happens on successful read
    reader.onload = (event) => {
      try {
        const jsonData = JSON.parse(event.target.result);
        resolve(jsonData); // Return parsed JSON
      } catch (err) {
        reject(new Error("Invalid JSON: " + err.message));
      }
    };

    // 3. Define error handling
    reader.onerror = () => {
      reject(new Error("Failed to read file"));
    };

    // 4. Start reading the file as text
    reader.readAsText(fileObj);
  });
}

/**
 * Apply the default dashboard state after CMEC data has been loaded.
 *
 * @param {Object} cmecJson - Parsed CMEC JSON document.
 * @param {string} iniXdim - Initial X dimension.
 * @param {string} iniYdim - Initial Y dimension.
 * @param {Object} iniFxdm - Initial fixed-dimension values.
 * @param {string} normMethod - Initial normalization method.
 * @param {string} normAxis - Initial normalization axis (`row` or `column`).
 */
function initializeDashboard(
  cmecJson,
  iniXdim,
  iniYdim,
  iniFxdm,
  normMethod,
  normAxis
) {
  setChoicesDefault(normMethod, '0', 'rubisco_logo.png');
  lmtSettings.normMethod = normMethod;
  lmtSettings.cmapMethod = '0';
  lmtSettings.logoMethod = 'rubisco_logo.png';

  setCheckBoxesDefault(normAxis, true, true, false, true, false);
  lmtSettings.normDir = normAxis;
  lmtSettings.setTooltip = true;
  lmtSettings.setTopTitle = true;
  lmtSettings.setBottomTitle = false;
  lmtSettings.setCellValue = true;
  lmtSettings.setFitScreen = true;

  initChoicesEvent(cmecJson);
  initCheckBoxesEvent();
  prepareSel(cmecJson, iniXdim, iniYdim, iniFxdm);
  preSetTab(iniXdim, iniYdim, cmecJson);
}

/**
 * Fetch a JSON result file referenced by the dashboard configuration and
 * initialize the dashboard from it.
 *
 * @param {string} jsfURL - URL of the CMEC JSON file.
 * @returns {Promise<void>} Resolves when the file has been loaded.
 */
async function loadtmpJson(jsfURL) {
  let fileObj;
  try {
    const response = await fetch(jsfURL);
    if (!response.ok) {
      throw new Error(`Failed to fetch ${jsfURL}`);
    }
    const blob = await response.blob();
    fileObj = new File([blob], jsfURL.split('/').pop(), {
      type: 'application/json'
    });
  } catch (err) {
    console.error('UDEB: Failed to fetch file:', err);
    alert(`Error loading file from path: ${jsfURL}\n${err.message}`);
    return;
  }

  // Validate file type (for both paths and File objects)
  if (!fileObj.name.endsWith('.json') && !fileObj.type.includes('json')) {
    alert('Only JSON files (*.json) are supported');
    return;
  }

  debugLog('UDEB: Loading file:', fileObj.name);

  try {
    cmecJson = await parseJsonFromFile(fileObj);
    debugLog("Parsed JSON:", cmecJson);

    // initialize dimensions
    let ini_xdim, ini_ydim, ini_fxdm = {};
    [ini_xdim, ini_ydim, ini_fxdm] = initDim(
      cmecJson,
      _config.udcDimSets || {}
    );

    let setNorm = '0';
    if (_config.hasOwnProperty('udcNormType')) {
      switch (_config.udcNormType.toLowerCase()) {
        case 'standarized':
          setNorm = '1';
          break;
        case 'normalized[-1:1]':
          setNorm = '2';
          break;
        case 'normalized[0:1]':
          setNorm = '3';
          break;
        default:
          setNorm = '0';
          break;
      }
    }

    let setAxis = 'column';
    if (_config.hasOwnProperty('udcNormAxis')) {
      setAxis = _config.udcNormAxis;
    }

    initializeDashboard(
      cmecJson,
      ini_xdim,
      ini_ydim,
      ini_fxdm,
      setNorm,
      setAxis
    );

  } catch (err) {
    console.error("Error:", err.message);
    alert(err.message);
  }
}


/**
 * Create the Choices.js instances used by the settings panel.
 */
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


/**
 * Populate the dimension choices and register their change handlers.
 *
 * @param {Object} cJson - Parsed CMEC JSON document.
 */
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

    selectIdByDims[dimn] = 'dim' + k.toString() + 'Choices';
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

        // clear columnStyles
        columnStyles.clear(); 
        groupSavedValues = null;

        if (lmtSettings.xyChange > 1) {
          lmtSettings.firstLoad = false
        }
        lmtSettings.xyChange = lmtSettings.xyChange + 1;

        let preValue =
          dictChoices[dim == 'xdim' ? 'ydimChoices' : 'xdimChoices'].getValue(
            true
          );
        if (event.detail.value == preValue) {
          debugLog( dim, preValue, event.detail.value);
          alert(' x and y must be different ', dim, preValue, event.detail.value);
        } else {
          dimSetEvent[dim == 'xdim' ? 'x_dim' : 'y_dim'] = event.detail.value;
          dimSetEvent[dim == 'xdim' ? 'y_dim' : 'x_dim'] = preValue;
          dimSetEvent.fxdim = {};
      
          // show other dimensions' choices boxes
          debugLog('selevent', selectIdByDims);
      
          debugLog(dimSetEvent);
      
          if (
            dimSetEvent.x_dim != undefined &&
            dimSetEvent.y_dim != undefined
          ) {
            for (const dimn of Object.values(
              cJson.DIMENSIONS.json_structure
            )) {
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
        debugLog('fire addItem event for other dimensions');
        debugLog(cJson.DIMENSIONS.json_structure);

        dimSetEvent.fxdim[dimn] = event.detail.value;
        debugLog(dimn, dimSetEvent.fxdim[dimn]);

        debugLog(
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
          debugLog(
            'now we can generate the tab json and prepare redraw table'
          );

          let ini_xdim,
            ini_ydim,
            ini_fxdm = {} ;

          [ini_xdim, ini_ydim, ini_fxdm] = initDim(
              cmecJson,
              dimSetEvent
          );

          if (preXdim != ini_xdim) {
              resetGroupBtn();
          }

          preXdim = ini_xdim;
          

          // select choices based on the initial dimension setting
          debugLog('start prepareSel', ini_xdim, ini_ydim, ini_fxdm);
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
	  //lmtSettings["stopFireNorm"] = true;
	  lmtSettings["stopFireNorm"] = false;
	  tabTempJson = [];
	  //setChoicesDefault("0", "0", lmtSettings.logoMethod);
          setChoicesDefault(lmtSettings.normMethod, lmtSettings.cmapMethod, lmtSettings.logoMethod);
	  //lmtSettings["stopFireNorm"] = false;
          reapplyColumnStyles();
        }
      },
      false
    );
  }

  // Define event handlers separately for better organization
  const eventHandlers = {
    logo: (event) => {
      logoFile = event.detail.value;
      lmtSettings.logoMethod = logoFile;
      document.getElementById('logoUD').src = `image/${logoFile}`;
    },
  
    norm: (event) => {
      debugLog('UDEB: fire event for normalization', lmtSettings.stopFireNorm, event.detail.value);
      lmtSettings.normMethod = event.detail.value;
  
      if (lmtSettings.stopFireNorm) {
        lmtSettings.stopFireNorm = false;
        return;
      }

      const newData = computeNormalization();

      table.setData(newData);
      table.redraw(true);
      draw_legend();
    },

    cmap: (event) => {
      debugLog('UDEB: fire event for cmap');
      lmtSettings.cmapMethod = event.detail.value;
      //get current column
      tabOption.columns = table.getColumnDefinitions();
      updateColorMapping();
      table.setColumns(tabOption.columns);
      table.redraw();
    }
  };

  ['norm', 'cmap', 'logo'].forEach(dim => {
    const element = dictChoices[`${dim}Choices`].passedElement.element;
    element.addEventListener('addItem', (event) => {
      if (eventHandlers[dim]) {
        eventHandlers[dim](event);
      }
    }, false);
  });

  // hide event
  dictChoices['hideChoices'].passedElement.element.addEventListener(
    'addItem', //select item
    function (event) {
      debugLog("fire hide events");
      table.hideColumn(event.detail.value);

      //newData = computeNormalization()
      //table.setData(newData);
      //table.redraw(true);
      //draw_legend();

    },
    false
  );

  dictChoices['hideChoices'].passedElement.element.addEventListener(
    'removeItem', //select item
    function (event) {
      debugLog("fire show events");
      table.showColumn(event.detail.value);
    },
    false
  );
}

/**
 * Recursively keep only the columns that are currently visible.
 *
 * @param {Object[]} rows - Rows to filter.
 * @param {string[]} visibleCols - Fields of visible columns.
 * @returns {Object[]} Filtered rows (tree children preserved).
 */
function filterVisibleColumns(rows, visibleCols) {
    return rows.map(r => {
        const filtered = {};

        // copy only visible columns
        visibleCols.forEach(col => {
            if (col in r) filtered[col] = r[col];
        });

        // keep the _children recursively if present
        if (r._children && r._children.length) {
            filtered._children = filterVisibleColumns(r._children, visibleCols);
        }

        return filtered;
    });
}


/**
 * Normalize the table values along the selected direction.
 *
 * Each cell is replaced by a `[originalValue, normalizedValue]` pair so that
 * both can be shown in tooltips and exported files.
 *
 * @param {string} [normMethodValue=lmtSettings.normMethod] - Normalization
 *   method: `0` none, `1` standardized, `2` [-1, 1], `3` [0, 1].
 * @param {string} [normDirection=lmtSettings.normDir] - `row` or `column`.
 * @returns {Object[]|false} Normalized rows, or `false` when the request is
 *   invalid.
 */
function computeNormalization(
  normMethodValue = lmtSettings.normMethod,
  normDirection = lmtSettings.normDir) {

  debugLog("start normalization");
  
  // Prepare the data for normalization
  const tempData = tabTempJson.length > 0
    ? deepCopyFunction(tabTempJson)
    : deepCopyFunction(table.getData('all'));

  // Store initial data if not already stored
  if (tabTempJson.length === 0) {
    tabTempJson = deepCopyFunction(tempData);
  }

  let visibleCols = table.getColumns()
      .filter(col => col.isVisible())
      .map(col => col.getField());

  const visibleData = filterVisibleColumns(tempData, visibleCols)

  const newData = Object.assign([], visibleData);

  // Validate normalization direction
  if (!normDirection) {
    alert("please select the direction of the normalization");
    return false; // Return status to indicate failure
  }

  // Handle row normalization
  if (normDirection === 'row') {
    const columnCount = Object.keys(visibleData[0])
      .filter(key => key !== "row_name").length;
    
    if (normMethodValue == 1 && columnCount == 1) {
      alert("cannot normalize data with only one column");
      if (dictChoices.normChoices) {
        dictChoices.normChoices.setChoiceByValue("0");
      }
      return false;
    }

    visibleData.forEach((data, j) => {
      newData[j] = normalizer(
        normMethodValue,
        normDirection,
        data
      );
    });
  }
  // Handle column normalization
  else if (normDirection === 'column') {
    Object.keys(tempData[0]).forEach(col_name => {
      if (col_name !== 'row_name' && col_name !== '_children') {
        const colData = extractCol(tempData, col_name, '');
        const newcolData = normalizer(
          normMethodValue,
          normDirection,
          colData
        );
        insertCol(newData, col_name, newcolData, '');
      }
    });
  }

  // new data save two datapoints, one is unnormalized, the other is normalized
  return newData;
}


/**
 * Apply the default values of the normalization, color-map and logo selects.
 *
 * @param {string} setNorm - Normalization method value.
 * @param {string} setCmap - Color-map method value.
 * @param {string} setLogo - Logo file name.
 */
function setChoicesDefault(setNorm, setCmap, setLogo) {

  dictChoices["normChoices"].setChoiceByValue(setNorm);

  const choiceData = dictChoices["normChoices"].config.choices.find(c => c.value === setNorm);
  dictChoices["normChoices"]._addItem({
    value: choiceData.value,
    label: choiceData.label
  }, true, true); 
  dictChoices["cmapChoices"].setChoiceByValue(setCmap);
  dictChoices["logoChoices"].setChoiceByValue(setLogo);
}


/**
 * Set the initial state of the dashboard checkboxes.
 *
 * @param {string} normDir - `row` or `column`.
 * @param {boolean} setTooltip - Unused; kept for call-site compatibility.
 * @param {boolean} setTopTitle - Show the table header.
 * @param {boolean} setBottomTitle - Show column bottom calculations.
 * @param {boolean} setCellValue - Show cell values.
 * @param {boolean} setFitScreen - Limit the table height to the screen.
 */
function setCheckBoxesDefault(normDir, setTooltip, setTopTitle, setBottomTitle, setCellValue, setFitScreen){

  if (normDir == "row") { 
    document.getElementById("cb-scarow").checked = true;
    document.getElementById("cb-scacol").checked = false;
  } else {
    document.getElementById("cb-scarow").checked = false;
    document.getElementById("cb-scacol").checked = true;
  }

  document.getElementById("cb-toptitle").checked = Boolean(setTopTitle);
  document.getElementById("cb-bottomtitle").checked = Boolean(setBottomTitle);
  document.getElementById("cb-cellvalue").checked = Boolean(setCellValue);
  document.getElementById("cb-fitscreen").checked = Boolean(setFitScreen);

}

/**
 * Reflect the current X, Y and fixed dimension selections in the settings
 * panel.
 *
 * @param {Object} cJson - Parsed CMEC JSON document.
 * @param {string} ini_xdim - Selected X dimension.
 * @param {string} ini_ydim - Selected Y dimension.
 * @param {Object} ini_fxdm - Selected values of the fixed dimensions.
 */
function prepareSel(cJson, ini_xdim, ini_ydim, ini_fxdm) {
  debugLog('sel', selectIdByDims);

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

    debugLog('UDEB:', fxdim, selectIdByDims[fxdim], ini_fxdm[fxdim]);
    dictChoices[selectIdByDims[fxdim]].containerInner.element.style.display = 'block';
    dictChoices[selectIdByDims[fxdim]].setChoiceByValue(ini_fxdm[fxdim]);
  }
} //prepareSel

// load local json files
/**
 * Load a CMEC JSON file selected through the file input.
 */
function loadlocJson() {

  const fileInput = document.getElementById('file');
  if (!fileInput?.files?.[0]) {
    console.error("No file provided and no file input found!");
    alert('Please select a file');
    table.setColumns([]);
    table.clearData();
    return;
  }
  const file = fileInput.files[0];

  // Validate file type
  if (!file.name.endsWith('.json') && !file.type.includes('json')) {
    alert('Please upload a JSON file (e.g., *.json)');
    return;
  }

  debugLog('UDEB: Reading local JSON file:', file.name);

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

      // initialize dimensions
      let ini_xdim, ini_ydim, ini_fxdm = {};
      [ini_xdim, ini_ydim, ini_fxdm] = initDim(cmecJson, {});

      initializeDashboard(cmecJson, ini_xdim, ini_ydim, ini_fxdm, '0', 'row');
    })
    .catch(err => alert(err));
} //loadlocJson

/**
 * Apply the column and tree options before rendering a newly loaded JSON file.
 *
 * @param {string} ini_xdim - Selected X dimension.
 * @param {string} ini_ydim - Selected Y dimension.
 * @param {Object} cJson - Parsed CMEC JSON document.
 */
function preSetTab(ini_xdim, ini_ydim, cJson) {
  if (Object.keys(tabTreeJson[0]).includes('_children')) {
    tabOption.dataTreeCollapseElement = '';
    tabOption.dataTreeExpandElement = '';
  } else {
    tabOption.dataTreeCollapseElement = '<span></span>';
    tabOption.dataTreeExpandElement = '<span></span>';
  }

  ydimField = 'row_name';

  // set tab column
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
    lmtSettings.setBottomTitle,
    firstColIcon,
    lmtTitleFormatterParams,
    ini_xdim,
    ini_ydim,
    ydimField
  );
  sortState = 0;
  updateButtonText();
}

/**
 * Resolve the initial X/Y/fixed dimensions and convert the CMEC JSON into
 * Tabulator rows. Also records model-source and top-level metric groups used
 * for header coloring.
 *
 * @param {Object} cJson - Parsed CMEC JSON document.
 * @param {Object} dimSet - Requested dimensions. When `x_dim` and `y_dim` are
 *   valid they are used; otherwise the first two dimensions are used and the
 *   remaining ones default to their first value.
 * @returns {[string, string, Object]} The X dimension, Y dimension and fixed
 *   dimension values.
 */
function initDim(cJson, dimSet) {
  debugLog('UDEB: in initDim');

  //Get model groups
  if (cJson.DIMENSIONS.json_structure.includes('model')) {
    let sources = [];
    for (const x of Object.keys(cJson.DIMENSIONS.dimensions.model)) {
      sources.push(cJson.DIMENSIONS.dimensions.model[x].Source);
    }
    sources = [...new Set(sources)];
    for (const x of Object.keys(cJson.DIMENSIONS.dimensions.model)) {
      grpsModSrcIdx[x] = sources.indexOf(
        cJson.DIMENSIONS.dimensions.model[x].Source
      );
    }
    globalVars.sharedState.grpsModSrcIdx = grpsModSrcIdx;
  }
  if (cJson.DIMENSIONS.json_structure.includes('metric')) {
    const topMetrics = [];
    for (const x of Object.keys(cJson.DIMENSIONS.dimensions.metric)) {
      if (!(x.includes('::') || x.includes('!!'))) {
        topMetrics.push(x);
      }
    }
    grpsTopMetric = [...new Set(topMetrics)];
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
    ini_fxdm = dimSet.fxdim || {};
  } else {
    for (const fxdim of cJson.DIMENSIONS.json_structure.slice(
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

  const tempJson = lmt_tool.cmec2tab_json(
    cJson,
    ini_xdim,
    ini_ydim,
    ini_fxdm,
    1
  );

  if (lmtSettings.hasOwnProperty("ydimOrder")) {
    const keys = Object.keys(lmtSettings.ydimOrder);
    const metricOrder = lmtSettings.ydimOrder[keys[0]];

    if (ini_ydim == keys[0]) {
      tabTreeJson = sortLargeArrayByReference(tempJson, metricOrder, "row_name");
    } else {
      tabTreeJson = tempJson;
    }
  } else {
    tabTreeJson = tempJson;
  }

  return [ini_xdim, ini_ydim, ini_fxdm];
}

/**
 * Sort top-level rows and their immediate children according to a reference
 * ordering. Rows missing from the reference keep their original relative
 * order (or are placed last for children).
 *
 * @param {Object[]} objectsArray - Rows to sort.
 * @param {Object<string, string[]>} reference - Map of parent name to the
 *   desired child order.
 * @param {string} propertyName - Row property holding the name.
 * @returns {Object[]} A new, sorted array (rows are not cloned).
 */
function sortLargeArrayByReference(
    objectsArray,
    reference,
    propertyName
) {
    // 1. Create a map for fast lookup of top-level objects.
    const objectMap = new Map(
        objectsArray.map(obj => [obj[propertyName], obj])
    );

    const sortedArray = [];

    // 2. Sort top-level objects according to the keys in reference.
    for (const parentName of Object.keys(reference)) {
        const parent = objectMap.get(parentName);

        // Skip reference entries that do not exist in objectsArray.
        if (!parent) {
            continue;
        }

        // 3. Sort only the immediate children of this parent.
        if (Array.isArray(parent._children)) {
            const childOrder = new Map(
                reference[parentName].map(
                    (childName, index) => [childName, index]
                )
            );

            parent._children.sort((a, b) => {
                const indexA = childOrder.get(a[propertyName]);
                const indexB = childOrder.get(b[propertyName]);

                // Put children absent from the reference list last.
                if (indexA === undefined && indexB === undefined) {
                    return 0;
                }

                if (indexA === undefined) {
                    return 1;
                }

                if (indexB === undefined) {
                    return -1;
                }

                return indexA - indexB;
            });
        }

        sortedArray.push(parent);
    }

    // 4. Append top-level objects not specified in reference,
    // preserving their original order.
    for (const obj of objectsArray) {
        if (!reference.hasOwnProperty(obj[propertyName])) {
            sortedArray.push(obj);
        }
    }
    return sortedArray;
}


/**
 * Read a file as text.
 *
 * @param {File} file - File to read.
 * @returns {Promise<{filename: string, content: string}>} File contents.
 */
function readFile(file) {
  return new Promise(function (resolve, reject) {
    var fileReader = new FileReader();

    fileReader.addEventListener('load', function (event) {
      resolve({
        filename: file.name,
        content: event.target.result
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


    if (_config.hasOwnProperty("sortYdim")) {
       if (_config.sortYdim.hasOwnProperty(tabOption.columns[0].formatterParams.yDim)) {
         table.setSort("row_name", _config.sortYdim[tabOption.columns[0].formatterParams.yDim]);
       }
    }
    fitScreen();
    table.redraw();

    if (groupSavedValues) {
      setGroupColumns(groupSavedValues);
    }

    if (_config.hasOwnProperty("columnGroupValues") && lmtSettings.firstLoad) {
      setGroupColumns(Object.keys(_config.columnGroupValues));
    }

    draw_legend();

  } catch (err) {
    alert('Error when rending the table:', err.message);
  }
});


/**
 * Reset all dashboard checkboxes to their unchecked state.
 */
function initCheckBoxes() {
  document.getElementById("cb-scarow").checked = false;
  document.getElementById("cb-scacol").checked = false;
  document.getElementById("cb-toptitle").checked = false;
  document.getElementById("cb-bottomtitle").checked = false;
  document.getElementById("cb-cellvalue").checked = false;
  document.getElementById("cb-fitscreen").checked = false;
}


/**
 * Recreate the Tabulator instance with the supplied column definitions.
 *
 * @param {Object[]} currentColumns - Column definitions to restore.
 */
function recreateTable(currentColumns) {
  let tempData = [];

  if (table) {
    table.off('tableBuilt');
    tempData = table.getData();
    table.clearData();
    table.destroy();
  }

  table = new Tabulator('#dashboard-table', tabOption);
  table.on('tableBuilt', function () {
    table.setData(tempData);
    table.setColumns(currentColumns);
  });
}

/**
 * Register the handlers for the dashboard checkboxes.
 */
function initCheckBoxesEvent() {

  document.getElementById("cb-scarow").addEventListener("change", () => {
    debugLog("fire event for checking row", document.getElementById("cb-scarow").checked);
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
    debugLog("fire event for checking column");
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
    debugLog("fire event for toptitle");
    const currentColumns = table.getColumnDefinitions();
    if (document.getElementById("cb-toptitle").checked) {

      lmtSettings.setTopTitle = true;
      tabOption['headerVisible'] = true;
    } else {
      lmtSettings.setTopTitle = false;
      tabOption['headerVisible'] = false;
    }

    recreateTable(currentColumns);
  });


  document.getElementById("cb-bottomtitle").addEventListener("change", () => {
    debugLog("fire event for bottomtitle");

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
    recreateTable(currentColumns);
  });

  document.getElementById("cb-cellvalue").addEventListener("change", () => {
    debugLog("Toggle cell value display");
  
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


/**
 * Limit the table height to the screen when the "fit screen" option is on.
 */
function fitScreen() {
  if (
    !document.getElementById('cb-fitscreen') ||
    !document.getElementById('dashboard-table')
  ) {
    return;
  }

  if (document.getElementById("cb-fitscreen").checked) {
    lmtSettings.setFitScreen = true;
    document.getElementById('dashboard-table').style['max-height'] = "82vh";


    // remove height
    document.getElementById('dashboard-table').style.removeProperty('height');

    //calculation vh
    var viewH = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);

    if (document.getElementById("dashboard-table").clientHeight < 0.82 * viewH) {
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

/**
 * Paint the color-scale legend with the currently active color map.
 */
var draw_legend = function () {
  var legtable = document.getElementById('scoresLegend');
  for (var col = 0; col < cmap.length; col++) {
    legtable.rows[0].cells[col].style.backgroundColor = cmap[col];
  }
};

/**
 * Tabulator bottom calculation that simply returns the column label.
 *
 * @param {Array} values - Column values (unused).
 * @param {Array} data - All table data (unused).
 * @param {*} calcParams - Value passed from the column definition.
 * @returns {*} The column label.
 */
var bottomCalcFunc = function (values, data, calcParams) {
  return calcParams;
};

var lmtCellColorFormatter = colorILAMB;

/**
 * Read the original and normalized value from a cell. Normalized cells store
 * a `[original, normalized]` pair.
 *
 * @param {CellComponent} cell - Tabulator cell.
 * @returns {{origVal: *, normVal: *}} Original and normalized values.
 */
function getCellValues(cell) {
  const value = cell.getValue();
  if (Array.isArray(value)) {
    return { origVal: value[0], normVal: value[1] };
  }
  return { origVal: value, normVal: value };
}

/**
 * Apply a background color and, optionally, the normalized value text to a
 * cell.
 *
 * @param {CellComponent} cell - Tabulator cell.
 * @param {Object} formatterParams - Formatter parameters.
 * @param {function(number, number): number} getIndex - Maps a normalized
 *   value and the color-map size to a color index.
 * @returns {string|undefined} Text to display when cell values are enabled.
 */
function renderColorCell(cell, formatterParams, getIndex) {
  const { origVal, normVal } = getCellValues(cell);
  let clr = '#808080';
  const nc = cmap.length;

  if (normVal > -900) {
    const ind = Math.min(Math.max(getIndex(normVal, nc), 0), nc - 1);
    clr = cmap[ind];
  }
  cell.getElement().style.backgroundColor = clr;

  if (formatterParams.showCellValue && origVal > -900) {
    cell.getElement().style.color = '#000000';
    return normVal.toFixed(2);
  }
}

/**
 * ILAMB-style color formatter. Small absolute values use a finer color scale
 * around zero.
 */
function colorILAMB(cell, formatterParams, onRendered) {
  return renderColorCell(cell, formatterParams, (normVal, nc) => {
    const ind =
      Math.abs(normVal) >= 0.25
        ? Math.round(2 * normVal + 4)
        : Math.round(4 * normVal + 4);
    return Math.min(Math.max(ind, 0), nc - 1);
  });
}

/**
 * Return the value range used by the linear color maps.
 *
 * @param {Object} formatterParams - Formatter parameters (`scaopt`).
 * @returns {[number, number]} Minimum and maximum normalized values.
 */
function getLinearRange(formatterParams) {
  switch (formatterParams.scaopt) {
    case '0':
      debugLog('will be implemented later');
      return [-2.5, 2.5];
    case '2':
      return [-1.0, 1.0];
    case '3':
      return [0.0, 1.0];
    case '1':
    default:
      return [-2.5, 2.5];
  }
}

/**
 * Linear color formatter.
 */
function colorLinear(cell, formatterParams, onRendered) {
  const [vMin, vMax] = getLinearRange(formatterParams);
  return renderColorCell(cell, formatterParams, (normVal, nc) =>
    Math.round(((normVal - vMin) * nc) / (vMax - vMin))
  );
}

/**
 * Reversed linear color formatter.
 */
function colorLinearReverse(cell, formatterParams, onRendered) {
  const [vMin, vMax] = getLinearRange(formatterParams);
  return renderColorCell(cell, formatterParams, (normVal, nc) =>
    Math.round(((vMax - normVal) * nc) / (vMax - vMin))
  );
}

/**
 * Default header title formatter.
 *
 * @returns {*} The header value.
 */
var lmtTitleFormatter = function (cell, titleFormatterParams, onRendered) {
  return cell.getValue();
};

/**
 * Build the Tabulator column definitions for a result table.
 *
 * @param {Object[]} tabJson - Rows used to derive the value columns.
 * @param {boolean} addBottomTitle - Show column bottom calculations.
 * @param {function} firstColIcon - Header formatter for the label column.
 * @param {Object} lmtTitleFormatterParams - Default header style parameters.
 * @param {string} xdim - X dimension name.
 * @param {string} ydim - Y dimension name.
 * @param {string} ydimField - Field used by the label column.
 * @returns {Object[]} Tabulator column definitions.
 */
var setTabColumns = function (
  tabJson,
  addBottomTitle,
  firstColIcon,
  lmtTitleFormatterParams,
  xdim,
  ydim,
  ydimField
) {
  debugLog('start setTabColumns');

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
    sorter:"number",
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
    sorter: "string",
    resizable: true,
    titleFormatter: firstColIcon,
    minWidth: 280,
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

  debugLog('deb in before the loop');

  var col = {};
  for (const x of Object.keys(tabJson[0])) {
    if (x != 'row_name' && x != '_children' && x != 'metric') {
      col = Object.assign({}, otherCol);

      col.title = x;
      col.field = x;
      col.bottomCalcParams = x;

      if (xdim == 'model') {
        const k = grpsModSrcIdx[x] % bgColorGroupFirstRow.length;

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
            const k = idxmet % bgColorGroup.length;
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
  debugLog('deb in after the loop', Columns);
  return Columns;
};

/**
 * Header formatter that renders the configured logo in the label column.
 *
 * @param {CellComponent} cell - Header cell.
 * @param {Object} titleFormatterParams - Formatter parameters (unused).
 * @returns {string|undefined} Logo image markup.
 */
var firstColIcon = function (cell, titleFormatterParams) {
  if (_config.logofile != 'None') {
    return "<img class='infoImage' id='logoUD' src='image/".concat(logoFile, "'>");
  }
};

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
      if (column.getElement().style.backgroundColor != undefined &&
          column.getElement().style.backgroundColor.trim() !== '') {
	return labelCode + "<input type='color' class='" + class4Color + "' id='favcolor' name='favcolor' value='" + rgbToHex(column.getElement().style.backgroundColor) + "'/>";
      } else {
        return labelCode + "<input type='color' class='" + class4Color + "' id='favcolor' name='favcolor'>";
      }
    },
    action: function (e, column) {
      document.getElementById("favcolor").addEventListener('input', function (evt) {
	column.getElement().style.backgroundColor = this.value;
        updateColumnStyle(column, { backgroundColor: this.value });
      });
    }
  }
];

/**
 * Remember the custom style applied to a column header so that it can be
 * re-applied after the table is re-rendered.
 *
 * @param {ColumnComponent} column - Target column.
 * @param {Object} newStyles - Style properties to merge.
 */
function updateColumnStyle(column, newStyles) {
  const currentStyles = columnStyles.get(column.getDefinition().title) || {};
  columnStyles.set(column.getDefinition().title, {
    ...currentStyles,  // Keep existing styles
    ...newStyles       // Apply new/updated styles
  });
}

/**
 * Build the context menu used by grouped headers.
 *
 * @param {string} idDom - Prefix for the color input ids (`fav` for a group,
 *   `subGroup` for a sub-group).
 * @returns {Object[]} Tabulator menu items.
 */
function getHeaderMenu(idDom) {
  return [
      {
        label: function(column) {
          let bgColor;

          if (idDom == 'fav') {
            bgColor = column.getElement().style.backgroundColor;
          } else {
            bgColor = column.getSubColumns()?.[0].getElement().style.backgroundColor;
          }
          const defaultColor = '#FFFFFF';
          const presentColor = bgColor && bgColor.trim() !== '' ? rgbToHex(bgColor) : defaultColor;
          return `Background Color <input type="color" class="${class4Color}" id="${idDom}BgColor" name="favcolor" value="${presentColor}">`;
        },

        action: function(e, column) {
          const colorInput = document.getElementById(`${idDom}BgColor`);
          const savedStyles = columnStyles.get(column.getDefinition().title);
          const savedColor = savedStyles?.backgroundColor; // Optional chaining prevents crashes
          if (savedColor) {
            colorInput.value = savedColor;
          }
          colorInput.addEventListener('input', function (evt) {
            const newColor = this.value;
            setHeaderStyle(idDom, column, "backgroundColor", newColor);
          });
        }
      },
      {
        label: function(column) {
          let fontColor;
          if (idDom == 'fav') {
            const columnElement = getColumnElements(column);
            fontColor = columnElement.title.style.color;
          } else {
            const firstSubColumn = column.getSubColumns()?.[0];
            const columnElement = getColumnElements(firstSubColumn);
            fontColor = columnElement.title.style.color;
          }
          const defaultColor = '#FFFFFF';
          const presentColor = fontColor && fontColor.trim() !== '' ? rgbToHex(fontColor) : defaultColor;
          return `Font Color <input type="color" class="${class4Color}" id="${idDom}FontColor" name="favcolor" value="${presentColor}">`;
        },

        action: function(e, column) {
          const colorInput = document.getElementById(`${idDom}FontColor`);
          const savedStyles = columnStyles.get(column.getDefinition().title);
          const savedColor = savedStyles?.fontColor; // Optional chaining prevents crashes
          if (savedColor) {
            colorInput.value = savedColor;
          }
          colorInput.addEventListener('input', function (evt) {
            const newColor = this.value;
            setHeaderStyle(idDom, column, "fontColor", newColor);
          });
        }
      },
      {
        label: "Font Size",
        menu: [
          {label: "Small", action: function(e, column) { setHeaderStyle(idDom, column, "fontSize", "12px"); }},
          {label: "Medium", action: function(e, column) { setHeaderStyle(idDom, column, "fontSize", "14px"); }},
          {label: "Large", action: function(e, column) { setHeaderStyle(idDom, column, "fontSize", "18px"); }},
          {label: "Custom...", action: function(e, column) {
            var size = prompt("Enter font size (e.g., 16px):");
            if(size) setHeaderStyle(idDom, column, "fontSize", size);
          }},
        ]
      },
      {
        label: "Font Weight",
        menu: [
          {label: "Normal", action: function(e, column) { setHeaderStyle(idDom, column, "fontWeight", "normal"); }},
          {label: "Bold", action: function(e, column) { setHeaderStyle(idDom, column, "fontWeight", "bold"); }},
          {label: "Bolder", action: function(e, column) { setHeaderStyle(idDom, column, "fontWeight", "bolder"); }},
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


/**
 * Apply a style property to a group header or to all of its sub-columns, and
 * remember it for later re-renders.
 *
 * @param {string} idDom - `fav` for a group header, otherwise sub-columns.
 * @param {ColumnComponent} column - Target column.
 * @param {string} property - One of `backgroundColor`, `fontColor`,
 *   `fontSize`, `fontWeight`.
 * @param {string} value - CSS value.
 */
function setHeaderStyle(idDom, column, property, value) {
  function applyStyleToColumn(col, prop, val) {
    const colElements = getColumnElements(col);
    
    switch (prop) {
      case "backgroundColor":
        colElements.applyBackground(val);
        break;
      case "fontColor":
        colElements.applyFontColor(val);
        break;
      case "fontSize":
        colElements.applyFontSize(val);
        break;
      case "fontWeight":
        colElements.applyFontWeight(val);
        break;
      default:
        alert(`${prop} is not supported`);
        return;
    }
    updateColumnStyle(col, { [prop]: val });
  }

  if (idDom === 'fav') {
    applyStyleToColumn(column, property, value);
  } else {
    column.getSubColumns().forEach(col => {
      applyStyleToColumn(col, property, value);
    });
  }
  table.redraw(true);
}


/**
 * Gets all relevant column elements and provides styling methods
 * @param {ColumnComponent} column - Tabulator column component
 * @returns {Object} Column elements with styling methods
 */
function getColumnElements(column) {
  const headerEl = column.getElement();

  // Primary selector with fallback
  let titleEl = headerEl.querySelector(
      '.tabulator-col-content .tabulator-col-title-holder .tabulator-col-title .tabulator-title-editor'
  );
  
  // Fallback to parent title element if not found
  if (!titleEl) {
      titleEl = headerEl.querySelector(
          '.tabulator-col-content .tabulator-col-title-holder .tabulator-col-title'
      );
  }

  return {
    header: headerEl,
    title: titleEl,
    
    /**
     * Applies background color to header and title
     * @param {string} color - CSS color value
     */
    applyBackground: function(color) {
        this.header.style.backgroundColor = color;
        if (this.title) {
            this.title.style.backgroundColor = color;
        }
        return this; // For method chaining
    },
    
    /**
     * Applies font color to title
     * @param {string} color - CSS color value
     */
    applyFontColor: function(color) {
        if (this.title) {
            this.title.style.color = color;
        }
        return this;
    },
    
    /**
     * Applies font size to title
     * @param {string} size - CSS font-size value
     */
    applyFontSize: function(size) {
        if (this.title) {
            this.title.style.fontSize = size;
        }
        return this;
    },
    
    /**
     * Applies font weight to title
     * @param {string|number} weight - CSS font-weight value
     */
    applyFontWeight: function(weight) {
        if (this.title) {
            this.title.style.fontWeight = weight;
        }
        return this;
    }
  };
}

/**
 * Convert a color channel to a two-digit hexadecimal string.
 *
 * @param {number} c - Channel value (0-255).
 * @returns {string} Two-digit hexadecimal value.
 */
function componentToHex(c) {
  const hex = c.toString(16);
  return hex.length === 1 ? `0${ hex }` : hex;
}

/**
 * Convert an `rgb(r, g, b)` string to a `#rrggbb` color.
 *
 * @param {string} rgb - CSS RGB color.
 * @returns {string} Hexadecimal color.
 */
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
  },


  {   
    label: function(column) { 
      if (column.getElement().style.backgroundColor != undefined &&
          column.getElement().style.backgroundColor.trim() !== '') {
        return labelCode + "<input type='color' class='" + class4Color + "' id='favcolor' name='favcolor' value='" + rgbToHex(column.getElement().style.backgroundColor) + "'/>";
      } else {
        return labelCode + "<input type='color' class='" + class4Color + "' id='favcolor' name='favcolor'>";
      } 
    },  
    action: function (e, column) {
      document.getElementById("favcolor").addEventListener('input', function (evt) {
        column.getElement().style.backgroundColor = this.value;
        updateColumnStyle(column, { backgroundColor: this.value });
      });
    }
  } 


];

/**
 * Switch between the colorblind-friendly and default color maps and redraw
 * the table.
 */
function tableColor() {
  if (document.getElementById('colorblind').checked) {
    cmap = PuOr;
  } else {
    cmap = GnRd;
  }

  grpsFirstCol.length = 0;
  var tempData = table.getData();
  table.clearData();
  table.setData(tempData);
  table.redraw(true);
  draw_legend();
}

/**
 * Formatter for the label column. It paints the label and its descendants with
 * the color of their metric/model group.
 *
 * @param {CellComponent} cell - Label cell.
 * @param {Object} formatterParams - Contains `xDim` and `yDim`.
 * @param {function} onRendered - Tabulator render callback.
 * @returns {*} The cell value.
 */
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
          setmetricbg(r, cell, bgColorGroup[k], fgFontColor);
        });
      } else if (formatterParams.yDim == 'model') {
        fgFontColor = '#FFFFFF';
        var k = grpsModSrcIdx[value] % bgColorGroupFirstRow.length;
        setmetricbg(
          cell.getRow(),
          cell,
          bgColorGroupFirstRow[k],
          fgColorGroupFirstRow[k]
        );
      }
    }
  });
  return value;
}

/**
 * Apply a background and foreground color to a row, its cell and its
 * descendants.
 *
 * @param {RowComponent} r - Row to color.
 * @param {CellComponent} cell - Cell to color.
 * @param {string} bgcolor - Background color.
 * @param {string} fgcolor - Foreground color.
 */
function setmetricbg(r, cell, bgcolor, fgcolor) {
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

/**
 * Flatten the numeric values of a row into `arr` and their field names into
 * `kmp`.
 *
 * @param {Object} data - Row to read.
 * @param {Array} arr - Output array of values.
 * @param {string[]} kmp - Output array of field names.
 * @param {number} followTree - When `1`, descend into `_children`.
 */
function extractVals(data, arr, kmp, followTree) {
  for (const k of Object.keys(data)) {
    if (k != 'row_name' && k != '_children') {
      arr.push(data[k]);
      kmp.push(k);
    } else if (k == '_children' && followTree == 1) {
      extractVals(data._children, arr, kmp, followTree);
    }
  }
}

/**
 * Normalize the values of a single row or column and return a copy where each
 * cell is replaced by `[originalValue, normalizedValue]`.
 *
 * @param {string} normMethod - `0` none, `1` standardized, `2` [-1, 1],
 *   `3` [0, 1].
 * @param {string} scaDir - `row` or `column`.
 * @param {Object} data - Row (or column map) to normalize.
 * @returns {Object} Normalized copy.
 */
function normalizer(normMethod, scaDir, data) {
  const normData = Object.assign({}, data);

  if ('_children' in data && scaDir === 'row' && data._children.length > 0) {
    normData._children = data._children.map(child =>
      normalizer(normMethod, scaDir, child)
    );
  }

  const arr = [];
  const kmp = [];
  extractVals(data, arr, kmp, scaDir === 'row' ? 0 : 1);

  let normArray = [];

  switch (normMethod) {
    case '0':
      normArray = arr;
      break;
    case '1': {
      const validValues = arr
        .filter(value => Number(value) > -999.0)
        .map(Number);
      const mean =
        validValues.length > 0
          ? validValues.reduce((sum, value) => sum + value, 0) /
            validValues.length
          : -999.0;
      const std =
        mean > -999.0
          ? Math.sqrt(
              validValues.reduce(
                (sum, value) => sum + Math.pow(value - mean, 2),
                0
              ) / validValues.length
            )
          : -999.0;
      const isStdVerySmall = Math.abs(std) < 1e-10;

      if (arr.length == 1) {
        normArray = arr;
      } else {
        normArray = arr.map(value => {
          if (Number(value) > -999.0) {
            return isStdVerySmall
              ? 0.0
              : (Number(value) - mean) / std;
          }
          return -999.0;
        });
      }
      break;
    }
    case '2':
    case '3': {
      let min = 1.0e20;
      let max = -1.0e20;

      for (const value of arr) {
        if (Number(value) > -999.0) {
          const numericValue = Number(value);
          min = numericValue < min ? numericValue : min;
          max = numericValue > max ? numericValue : max;
        }
      }

      if (min == 1.0e20) {
        min = -999.0;
      }
      if (max == -1.0e20) {
        max = -999.0;
      }

      const isRangeVerySmall = Math.abs(max - min) < 1e-10;

      normArray = arr.map(value => {
        if (!(Number(value) > -999.0)) {
          return -999.0;
        }
        if (max == min) {
          return 1.0;
        }
        if (isRangeVerySmall) {
          return 0.0;
        }
        if (normMethod == '3') {
          return (Number(value) - min) / (max - min);
        }
        return (
          (Number(value) - 0.5 * (min + max)) / (0.5 * (max - min))
        );
      });

      break;
    }
  }

  let i = 0;
  for (const k of kmp) {
    normData[k] = [data[k], normArray[i]];
    i = i + 1;
  }

  return normData;
}


/**
 * Return the maximum nesting depth of the table rows.
 *
 * @returns {number} Maximum tree depth.
 */
function findMaxLevels() {
  return rowLevels(table.getRows(), 0);
}

/**
 * Recursively compute the maximum tree depth below a set of rows.
 *
 * @param {RowComponent[]} rows - Rows to inspect.
 * @param {number} nlevs - Current depth.
 * @returns {number} Maximum depth found.
 */
function rowLevels(rows, nlevs) {
  const childLevel = nlevs + 1;
  let maxLevel = childLevel;

  for (const row of rows) {
    if (row.getTreeChildren().length > 0) {
      maxLevel = Math.max(
        maxLevel,
        rowLevels(row.getTreeChildren(), childLevel)
      );
    }
  }

  return maxLevel;
}


/**
 * Expand or collapse the tree by one level and re-render the table.
 *
 * @param {string} action - Only `expand` is currently handled.
 */
function expandCollapse(action) {
  var maxLevs = findMaxLevels() - 1; //the last level always cannot expand

  debugLog('UDEB:', 'maxlevs', maxLevs, lmtSettings.numClicks, action, lmtSettings.timesExpl);
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
    if (lmtSettings.timesExpl == 0) {
      lmtSettings.numClicks = 0;
    } else {
      lmtSettings.numClicks = lmtSettings.numClicks + 1;
    }
  }
}

/**
 * Tabulator callback deciding whether a row starts expanded.
 *
 * @param {RowComponent} row - Row being rendered (unused).
 * @param {number} level - Tree level of the row.
 * @returns {boolean|undefined} `true` when the level should be expanded.
 */
function setLevelExpand(row, level) {
  let timesExpl = lmtSettings["timesExpl"];
  if (level < timesExpl) {
    return true;
  }
}

/**
 * Download the current table as a standalone HTML file.
 */
function savetoHtml() {
  table.download('html', 'test.html', { style: true });
}


/**
 * Convert two parallel arrays into Choices.js choice objects.
 *
 * @param {string[]} keys - Labels.
 * @param {string[]} values - Values.
 * @returns {{value: *, label: string}[]} Choices.js choices.
 */
function combineArraysToObject(keys, values) {
  if (keys.length !== values.length) {
    throw new Error('Arrays must have the same length');
  }

  return keys.reduce((result, key, index) => {
    result.push({ value: values[index], label: key });
    return result;
  }, []);
}



/**
 * Cycle the value columns through A-Z, Z-A and original order.
 */
function cycleColumnSort() {
  const currentColumns = table.getColumnDefinitions();
  
  const fixedColumn = currentColumns.shift(); 

  const isGrouped = currentColumns.some(obj => 'columns' in obj);

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


/**
 * Flatten grouped column definitions into a single list of value columns.
 *
 * @param {Object[]} data - Column definitions.
 * @returns {Object[]} Flattened columns (original array when not grouped).
 */
function flattenColumns(data) {
  const hasColumns = data.some(obj => Array.isArray(obj.columns) && obj.columns.length > 0);

  if (!hasColumns) {
    return data;
  }

  return [...new Set(
    data.reduce((acc, obj) => 
      Array.isArray(obj.columns) 
        ? [...acc, ...obj.columns] 
        : acc, 
    [])
  )];
}

/**
 * Group the value columns under headers whose titles contain the supplied
 * values.
 *
 * @param {string[]} groupValues - Text fragments used to match columns.
 */
function setGroupColumns(groupValues) {

  if (groupValues == null) {
    return;
  }

  const fixedColumn = tabOption.columns[0];
  const currentColumns = tabOption.columns.slice(1); 

  const flattenedColumns = flattenColumns(currentColumns);

  const matchedColumns = new Set();

  const groupColumns = [];
  for (const value of [...groupValues].sort()) {
    const filterColumns = flattenedColumns.filter(col => col.title.includes(value));
    if (filterColumns.length > 0) {
      groupColumns.push({
        title: _config.columnGroupValues?.[value] || value, 
        columns: filterColumns,
        headerContextMenu: groupHeaderContextMenu,
        editableTitle:true
      });
    }
    // Track which columns we've already grouped
    filterColumns.forEach(col => matchedColumns.add(col));
  }

  // Find columns that didn't match any groupValues
  const remainingColumns = flattenedColumns.filter(col => 
    !matchedColumns.has(col)
  );

  // Add remaining columns as "Other" group if any exist
  if (remainingColumns.length > 0 && groupValues.includes('Other')) {
    groupColumns.push({
      title: _config.columnGroupValues?.["Other"] || "Other",
      columns: remainingColumns,
      headerContextMenu: groupHeaderContextMenu,
      editableTitle: true
    });
  }

  if (groupColumns.length > 0) {
     table.setColumns([fixedColumn, ...groupColumns]);
  } else {

    alert (`values:\n${groupValues.join('\n')} not found in the table titles`);
  }
}

/**
 * Update the label of the column-sorting button.
 */
function updateButtonText() {
  const texts = ["Toggle Sort Title", "A-Z Sort", "Z-A Sort"];
  const button = document.getElementById("sort-state-text");
  if (button) {
    button.textContent = texts[sortState];
  }
}


/**
 * Wire up the column-grouping controls in the settings panel.
 */
function initSubMenu() {
    const groupHeaderBtn = document.getElementById('groupHeaderBtn');
    const inputContainer = document.getElementById('inputContainer');

    if (!groupHeaderBtn || !inputContainer) {
        return;
    }
    
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
        debugLog('Collected values:', values);
        debugLog(`Collected ${values.length} values:\n${values.join('\n')}`);

        groupSavedValues = values;

        setGroupColumns(values); 
        
        // Example operation: concatenate with commas
        const concatenated = values.join(', ');
        debugLog('Concatenated:', concatenated);
    });
}

/**
 * Clear the column-grouping inputs, keeping a single empty input.
 */
function resetGroupBtn() {
    const inputContainer = document.getElementById('inputContainer');
    if (!inputContainer) {
        return;
    }

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


/**
 * Re-apply the custom header styles stored in `columnStyles` after the table
 * has been rebuilt.
 */
function reapplyColumnStyles() {
  if (!table || !columnStyles) return;

  const applyStylesToElement = (element, styles) => {
    if (!element || !styles) return;
    
    if (styles.backgroundColor) {
      element.style.backgroundColor = styles.backgroundColor;
    }
    if (styles.fontColor) {
      element.style.color = styles.fontColor;
    }
    if (styles.fontSize) {
      element.style.fontSize = styles.fontSize;
    }
    if (styles.fontWeight) {
      element.style.fontWeight = styles.fontWeight;
    }
  };

  const applyStylesToColumn = (column, styles) => {
    if (!column || !styles) return;
    
    const headerEl = column.getElement();
    if (!headerEl) return;

    applyStylesToElement(headerEl, styles);

    let textEl = headerEl.querySelector(
      '.tabulator-col-content .tabulator-col-title-holder .tabulator-col-title .tabulator-title-editor'
    );

    if (! textEl) {
      textEl = headerEl.querySelector(
        '.tabulator-col-content .tabulator-col-title-holder .tabulator-col-title'
      );
    };
    applyStylesToElement(textEl, styles);
  };

  const processColumn = (column) => {
    const columnTitle = column.getDefinition().title;
    const styles = columnStyles.get(columnTitle);

    // Handle parent groups
    const parentGroup = column.getParentColumn();
    if (parentGroup && parentGroup !== column) {
      const parentTitle = parentGroup.getDefinition().title;
      const parentStyles = columnStyles.get(parentTitle);
      if (parentStyles) {
        applyStylesToColumn(parentGroup, parentStyles);
      }
    }

    // Handle current column
    if (styles) {
      applyStylesToColumn(column, styles);
    }

    // Handle subcolumns
    if (column.getSubColumns) {
      column.getSubColumns().forEach(subCol => {
        const subStyles = columnStyles.get(subCol.getDefinition().title);
        if (subStyles) {
          applyStylesToColumn(subCol, subStyles);
        }
      });
    }
  };

  table.getColumns().forEach(processColumn);
}

const legendElement = document.getElementById("dragHandle");
makeElementDraggable(legendElement);

/**
 * Make an element draggable with the mouse, independently of page flow.
 *
 * @param {HTMLElement|null} element - Element to make draggable.
 */
function makeElementDraggable(element) {
  if (!element) {
    return;
  }

  let currentX = 0;
  let currentY = 0;
  let initialX = 0;
  let initialY = 0;

  element.style.touchAction = 'none';
  element.addEventListener('pointerdown', startDragging);

  function startDragging(e) {
    e.preventDefault();
    initialX = e.clientX - currentX;
    initialY = e.clientY - currentY;

    element.setPointerCapture?.(e.pointerId);
    element.addEventListener('pointermove', dragElement);
    element.addEventListener('pointerup', stopDragging);
    element.addEventListener('pointercancel', stopDragging);
  }

  function dragElement(e) {
    e.preventDefault();
    currentX = e.clientX - initialX;
    currentY = e.clientY - initialY;
    element.style.transform = `translate3d(${currentX}px, ${currentY}px, 0)`;
  }

  function stopDragging(e) {
    element.removeEventListener('pointermove', dragElement);
    element.removeEventListener('pointerup', stopDragging);
    element.removeEventListener('pointercancel', stopDragging);

    if (e && element.hasPointerCapture?.(e.pointerId)) {
      element.releasePointerCapture(e.pointerId);
    }
  }
}


// end of lmt_tab.js
