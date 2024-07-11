//module.exports = {tabOption, cellClickFuncGenetic};


var downloadFunc = require('./downloadFunctions.js');


var tabOption = {
  dataTree: true,
  dataTreeStartExpanded: [true, false],

  reactiveData: true,

  headerSortTristate: true,

  placeholder: 'Loading Data',

  //ajax loading
  //ajaxURL: jsonFileURL,
  //ajaxConfig:{
  //     mode:"cors", //set request mode to cors
  //     credentials: "same-origin", //send cookies with the request from the matching origin
  //     headers: {
  //         "Accept": "application/json", //tell the server we need JSON back
  //         "X-Requested-With": "XMLHttpRequest", //fix to help some frameworks respond correctly to request
  //         "Content-type": 'application/json; charset=utf-8', //set the character encoding of the request
  //         "Access-Control-Allow-Origin": "https://cmorchecker.github.io", //the URL origin of the site making the request
  //},},
  //

  htmlOutputConfig: {
    columnHeaders: true, //do not include column headers in HTML table
    columnGroups: false, //do not include column groups in column headers for HTML table
    rowGroups: false, //do not include row groups in HTML table
    columnCalcs: true, //do not include column calcs in HTML table
    dataTree: true, //do not include data tree in HTML table
    formatCells: true //show raw cell values without formatter
  },

  downloadConfig: {
    columnHeaders: true, //do not include column headers in HTML table
    columnGroups: false, //do not include column groups in column headers for HTML table
    rowGroups: false, //do not include row groups in HTML table
    columnCalcs: true, //do not include column calcs in HTML table
    dataTree: true, //do not include data tree in HTML table
    formatCells: true //show raw cell values without formatter
  },

  //mxu: need to rewrite it in future, it may not work any more, after adding link rel
  //downloadReady: downloadFunc.downloadHTML4CMIP(fileContents, blob), //error no fileContents
  //downloadReady: function(fileContents, blob){}, //work
  //downloadReady: testFunc,  //work
  downloadReady: downloadFunc.downloadHTML4CMIP,  //may cause error. will revisit later


  movableColumns: true, //enable user movable columns

  layout: 'fitColumns',

  tooltips: function (cell) {
    //cell - cell component

    //function should return a string for the tooltip of false to hide the tooltip
    //return  cell.getColumn().getField() + " - " + cell.getValue(); //return cells "field - value";
    if (cell.getField() == 'row_name') {
      return false;
    } else {
      return Math.round((cell.getValue() + Number.EPSILON) * 100) / 100;
    }
    //return cell.getValue().toFixed(2);
  },

  columnMinWidth: 10,
  nestedFieldSeparator: '|',

  dataTreeBranchElement: false, //hide branch element
  dataTreeChildIndent: 15, //indent child rows by 15 px
  //dataTreeCollapseElement:"<i></i>",
  //dataTreeExpandElement:"<i></i>",

  selectable: true,
  //-rowContextMenu: rowMenu,

  //-cellClick:cellClickFuncGenetic,
  //-cellClick: newCellClickFunc,

  //rowClick: function(e, row){
  //   if (row.getTreeChildren().length != 0) {
  //       row.treeToggle();
  //   }
  //},
  //
  dataTreeStartExpanded: function (row, level) {
    return setLevelExpand(row, level); //expand rows where the "driver" data field is true;
  },
  columns: [],

  //maxHeight: '100%',
  height: 'auto',

  //-tableBuilt: function () {
  //-  if (_config.udcScreenHeight != 0) {
  //-    var elmnt = document.getElementsByClassName('tabulator-header');
  //-    var totHeight = elmnt[0].offsetHeight + 30 * table.getRows().length + 20;

  //-    try {
  //-      if (isTreeTable == 0) {
  //-        $('#dashboard-table')[0].style['height'] = 'min(82vh, 100%)';
  //-      } else {
  //-        $('#dashboard-table')[0].style['height'] = '82vh';
  //-      }
  //-    } catch (err) {
  //-      console.log(err);
  //-    }

  //-    // reset the screen height switch
  //-    //-$('.screenheight').prop('checked', true);
  //-  }
  //-}
};


exports.tabOption = tabOption;
exports.cellClickFuncGenetic = cellClickFuncGenetic;

const linkTemplate = "{metric.0}/{metric.1}/{metric.2}/{metric.2}.html?model={model}&region={region}";

var globalVars = require("./globalVars.js");

var dictChoices = globalVars.dictChoices;
var dimSetEvent = globalVars.dimSetEvent;


function cellClickFuncGenetic(e, cell) {
  //e - the click event object
  //cell - cell component


  // first parse the linkTemplate
  var linkNames = [],          // an array to collect the strings that are found
      dictLinkNames = {},
      regExp = /{([^}]+)}/g;
  let matchRlt;
  while( matchRlt = regExp.exec( linkTemplate ) ) {
    linkNames.push( matchRlt[1] );
  }

  linkNames.filter((item, index) => linkNames.indexOf(item) === index)
           .filter((item, index) => dictLinkNames[item] = 'null');


  var colField = cell.getColumn().getField().replace(/\s+/g, '');
  var rowField = getRowTreeStruct(cell.getRow());

  let xDimName = dictChoices['xdimChoices'].getValue(true);
  let yDimName = dictChoices['ydimChoices'].getValue(true);


  if (colField == "row_name") {return;}

  console.log(linkNames);
  console.log(dictLinkNames, xDimName, yDimName, colField, rowField);

  var clickInput = {};
  
  clickInput[xDimName] = colField;
  clickInput[yDimName] = rowField;

  console.log(dimSetEvent);

  Object.keys(dimSetEvent.fxdim).filter((item, index) => clickInput[item] = dimSetEvent.fxdim[item]);


  var dictLinknmMap = {};

  for (const [key, value] of Object.entries(clickInput)) {
    if (value.includes("::") || value.includes("!!")) {

      let valueTmp = value.replace(/!!/g, '::').replace(/\s+/g, '').split('::');
      valueTmp.filter((item, index) => dictLinknmMap[ key+'.'+index.toString()] = item );
    } else {
      dictLinknmMap[key] = value.replace(/\s+/g, '');
    }
  }


  Object.keys(dictLinkNames).forEach( function(r) {
    if (dictLinknmMap.hasOwnProperty(r)) {
      dictLinkNames[r] = dictLinknmMap[r];
    }
  });
  console.log('xxx', dictLinknmMap, dictLinkNames);

  //check if there is null values
  var cellLinkTo = linkTemplate;

  if (Object.values(dictLinkNames).includes("null")) { alert ("clickable not avaiable"); }

  else {

    for (let item of Object.keys(dictLinkNames)) {

      var pattern = '\\{'+item+'\\}'
      var re = new RegExp(pattern, 'g')
     cellLinkTo = cellLinkTo.replace(re, dictLinkNames[item]); 

     console.log(item, dictLinkNames[item], cellLinkTo);
    }
  }

  console.log(clickInput, 'clickinput');



  alert("stop for debug");
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


