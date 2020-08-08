// require modules

var $ = require( "jquery" );
var Tabulator = require('tabulator-tables');
var select2 = require('select2')(); // note you're calling a function here!
var select2MultiCheckboxes = require('./select2.multi-checkboxes.js');
var lmt_tool = require('./lmt_tool.js');
var Slideout = require('slideout');

var css = require('../css/lmtstyle.css');

//globalize functions
window.loadlocJson = loadlocJson;
window.toggleTooltips = toggleTooltips;
window.toggleCellValue = toggleCellValue;
window.toggleBottomTitle = toggleBottomTitle;
window.toggleScreenHeight = toggleScreenHeight;
window.toggleTopTitle = toggleTopTitle;
window.tableColor = tableColor;
window.expandCollapse = expandCollapse;
window.savetoHtml = savetoHtml;


// major js to control the tabulator for LMT unified dashboard
// user can change the vales of the following varaibles
//var jsonFileUrl = "https://raw.githubusercontent.com/minxu74/benchmark_results/master/cmec_ilamb_example.json";  // json file containing the benchmark results
jsonFileUrl = "https://raw.githubusercontent.com/minxu74/benchmark_results/master/";
//var jsonFileUrl = "https://raw.githubusercontent.com/minxu74/benchmark_results/master/tab_ilamb_example.json";  // json file containing the benchmark results
const corsProxy = "https://cors-anywhere.herokuapp.com/";  // cors proxy to remove the cors limit
const baseUrl = 'https://www.ilamb.org/CMIP5v6/historical/';

const bgColorGroup = ["#ECFFE6", "#E6F9FF", "#FFECE6", "#EDEDED", "#FFF2E5"];
//const bgColorGroupFirstRow = ["#0063B2FF", "#9CC3D5FF"];
const bgColorGroupFirstRow = ["#0063B2FF", "black"];
const fgColorGroupFirstRow = ["white", "white"];
// color used default
const PuOr = ['#b35806','#e08214','#fdb863','#fee0b6','#f7f7f7','#d8daeb','#b2abd2','#8073ac','#542788'];
const GnRd = ['#b2182b','#d6604d','#f4a582','#fddbc7','#f7f7f7','#d9f0d3','#a6dba0','#5aae61','#1b7837'];


var logoFile='rubisco_logo.png';

var cmap = PuOr;

var scadir;

var tabTempJson = [];
//
//

// please do not make changes below
if (jsonFileUrl.includes("http")){
    jsonFileUrl = corsProxy + jsonFileUrl;
}

//global variables
var cmecJson;
var tabJson;
var tabTreeJson;
var table;

var ydimField;
var jsonType;

var selectIDbyDims = {};
var dimBySelectIDs = {};


var fixedDimsDict = {};
var grpsFirstCol = [];

var grpsModelSrc = {};
var grpsTopMetric = [];

var isJsonReady = false;
var isTableBuilt = false;

var tabOption = {
     dataTree:true,
     dataTreeStartExpanded:[true, false],

     reactiveData:true,

     headerSortTristate:true,

     placeholder:"Loading Data",

     //ajax loading
     //ajaxURL: jsonFileUrl,
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

     htmlOutputConfig:{
         columnHeaders:true, //do not include column headers in HTML table
         columnGroups:false, //do not include column groups in column headers for HTML table
         rowGroups:false, //do not include row groups in HTML table
         columnCalcs:true, //do not include column calcs in HTML table
         dataTree:true, //do not include data tree in HTML table
         formatCells:true, //show raw cell values without formatter
     },

     downloadConfig:{
         columnHeaders:true, //do not include column headers in HTML table
         columnGroups:false, //do not include column groups in column headers for HTML table
         rowGroups:false, //do not include row groups in HTML table
         columnCalcs:true, //do not include column calcs in HTML table
         dataTree:true, //do not include data tree in HTML table
         formatCells:true, //show raw cell values without formatter
     },


     downloadReady:function(fileContents, blob){

         console.log(fileContents);
         console.log(blob);

         var preTable = " \
<!DOCTYPE html> \
<!-- saved from url=(0037)https://lmt.ornl.gov/test_lmtud/dist/ --> \
<html lang='en' class=''><head><meta http-equiv='Content-Type' content='text/html; charset=UTF-8'> \
   <style> table {margin-left:auto; margin-right:auto; margin-top:30px;} \
      th, td { min-width:28px; max-width:28px; width:28px; height:28px; overflow:hidden; \
         word-wrap:break-word; font-size:xx-small; overflow:auto; text-align:center; } \
      th { height: 150px; transform: translate(-1px, 52px) rotate(-90deg); word-wrap: unset; overflow:inherit; display:tabel-cell;\
        white-space: nowrap; font-size:small; } td {border:1px solid;} \
      table.tabulator-print-table td:nth-of-type(1) {width:320px;min-width:320px;text-align:left;font-size:small;} \
.tabulator-print-table{border-collapse:collapse} .tabulator-print-table .tabulator-data-tree-branch \
{display:inline-block;vertical-align:middle;height:9px;width:7px;margin-top:-9px;margin-right:5px;border-bottom-left-radius:1px;border-left:2px \
solid #aaa;border-bottom:2px solid #aaa}.tabulator-print-table .tabulator-print-table-group{\
box-sizing:border-box;border-bottom:1px solid #999;border-right:1px solid #aaa;border-top:1px \
solid #999;padding:5px;padding-left:10px;background:#ccc;font-weight:700;min-width:100%}.tabulator-print-table \
.tabulator-print-table-group:hover{cursor:pointer;background-color:rgba(0,0,0,.1)}.tabulator-print-table \
.tabulator-print-table-group.tabulator-group-visible .tabulator-arrow{margin-right:10px;border-left:6px solid \
transparent;border-right:6px solid transparent;border-top:6px solid #666;border-bottom:0}\
.tabulator-print-table .tabulator-print-table-group.tabulator-group-level-1 td{padding-left:30px!important}\
.tabulator-print-table .tabulator-print-table-group.tabulator-group-level-2 td{padding-left:50px!important}\
.tabulator-print-table .tabulator-print-table-group.tabulator-group-level-3 td{padding-left:70px!important}\
.tabulator-print-table .tabulator-print-table-group.tabulator-group-level-4 td{padding-left:90px!important}\
.tabulator-print-table .tabulator-print-table-group.tabulator-group-level-5 td{padding-left:110px!important}\
.tabulator-print-table .tabulator-print-table-group .tabulator-group-toggle{display:inline-block}\
.tabulator-print-table .tabulator-print-table-group .tabulator-arrow{\
display:inline-block;width:0;height:0;margin-right:16px;border-top:6px solid transparent;border-bottom:6px \
solid transparent;border-right:0;border-left:6px solid #666;vertical-align:middle}\
.tabulator-print-table .tabulator-print-table-group span{margin-left:10px;color:#d00}\
.tabulator-print-table .tabulator-data-tree-control{display:-ms-inline-flexbox;display:inline-flex;-ms-flex-pack:center;\
justify-content:center;-ms-flex-align:center;align-items:center;vertical-align:middle;\
height:11px;width:11px;margin-right:5px;border:1px solid #333;border-radius:2px;\
background:rgba(0,0,0,.1);overflow:hidden}\
.tabulator-print-table .tabulator-data-tree-control:hover{cursor:pointer;background:rgba(0,0,0,.2)}\
.tabulator-print-table .tabulator-data-tree-control .tabulator-data-tree-control-collapse{\
display:inline-block;position:relative;height:7px;width:1px;background:0 0}\
.tabulator-print-table .tabulator-data-tree-control .tabulator-data-tree-control-collapse:after{\
position:absolute;content:'';left:-3px;top:3px;height:1px;width:7px;background:#333}\
.tabulator-print-table .tabulator-data-tree-control .tabulator-data-tree-control-expand{display:inline-block;position:relative;height:7px;width:1px;background:#333}.tabulator-print-table .tabulator-data-tree-control .tabulator-data-tree-control-expand:after{position:absolute;content:'';left:-3px;top:3px;height:1px;width:7px;background:#333} </style></head><body>";

         var aftTable = "</body></html>";
         var newContents = preTable + fileContents.replace(/undefined/g, '') + aftTable; 

         console.log(newContents);
         blob = new Blob([newContents], {type: 'text/html'});
         return blob;
     },

     movableColumns: true, //enable user movable columns
     //movableRows: true, //enable user movable columns

     layout:"fitColumns",
     //layout:"fitData",
     //tooltips: true,
     tooltips: function(cell){
        //cell - cell component

        //function should return a string for the tooltip of false to hide the tooltip
        //return  cell.getColumn().getField() + " - " + cell.getValue(); //return cells "field - value";
        if (cell.getField() == 'row_name') {
           return false;
        }
        else {
           return Math.round((cell.getValue() + Number.EPSILON) * 100) / 100;
        }
        //return cell.getValue().toFixed(2);
     },

     columnMinWidth:10,
     nestedFieldSeparator:"|", 


     //dataTreeBranchElement:false, //hide branch element
     dataTreeChildIndent:15, //indent child rows by 15 px
    
     selectable: true,
     rowContextMenu:rowMenu,

     cellClick:cellClickFuncGenetic,
 
     //rowClick: function(e, row){
     //   if (row.getTreeChildren().length != 0) {
     //       row.treeToggle();
     //   }
     //},
     dataTreeStartExpanded:function(row, level){
        return setLevelExpand(row, level); //expand rows where the "driver" data field is true;
     },
     columns:[],

     maxHeight:"100%",
};


$(document).ready(function() {
     $('#file').val('');
     //initial the multiselct box
     $('.hide-list').select2MultiCheckboxes({
         placeholder: 'Select an option',
         theme: "classic",
         dropdownCssClass: "selectFont", 
         containerCssClass:"selectFont",
         templateSelection: function(data) {
         return 'Hide columns';},
     });
     $('.hide-list').val(null).trigger('change');


     $('.select-choice-x').select2({
         placeholder: 'Select X/Column',
     });



     $('.select-choice-y').select2({
         placeholder: 'Select Y/Row',
     });

     $('.select-choice-sca').select2({
         placeholder: 'Normalize methods',
     });

     $('.select-choice-map').select2({
         placeholder: 'Color mapping methods',
     });

     //for (var i=1; i < 10; i++){
     //    $('.select-choice-'.concat(i.toString())).select2({
     //        placeholder: 'Select Dimension',
     //    });
     //}
     table = new Tabulator("#dashboard-table", option={});

     $('.hide-list').on("select2:select", function (e) {
          //this returns all the selected item
          var items= $(this).val();
          //Gets the last selected item
          var lastSelectedItem = e.params.data.id;
          table.hideColumn(lastSelectedItem) ////toggle the visibility of the "name" column
     });
     
     $('.hide-list').on("select2:unselect", function (e) {
     
          //this returns all the selected item
          var items= $(this).val();
          //Gets the last selected item
          var lastSelectedItem = e.params.data.id;
          table.showColumn(lastSelectedItem) ////toggle the visibility of the "name" column
     });



      var doc = window.document;
      var slideout = new Slideout({
        'panel': doc.getElementById('panel'),
        'menu': doc.getElementById('menu'),
      });

      //window.onload = function() {
        document.querySelector('.js-slideout-toggle').addEventListener('click', function() {
          slideout.toggle();
        });
      //}
     $('.select-choice-ex').select2({
         placeholder: 'Select examples',
     });
     $('.select-choice-ex').val(null).trigger('change');

     $('.select-choice-logo').select2({
         placeholder: 'Select logos',
     });
     $('.select-choice-logo').val(null).trigger('change');

     //document.getElementById('select-choice-mini-ex').onchange = function(){

     $('#select-choice-mini-ex').on('select2:select', function() {
         //let jsfUrl = this.options[this.selectedIndex].value;
         let jsfUrl = $(this).val();
         console.log(jsfUrl);
         
         jsfUrl = jsonFileUrl + jsfUrl;
         loadrmtJson(jsfUrl);
     });

     $('#select-choice-mini-logo').on('select2:select', function() {
         logoFile = $(this).val();

         //var tempData = table.getData(); 
         table.clearData();
         //table.setData(tempData);
        // table.redraw(true);
         table = new Tabulator("#dashboard-table", tabOption);

         
     });

     //scaling
     //
     $('#checkboxsca[type="checkbox"]').on('change', function() {
         $('#checkboxsca[type="checkbox"]').not(this).prop('checked', false);

         if ($('.scarow').is(':checked')){
            scadir = "row";
         }
         if ($('.scacol').is(':checked')){
            scadir = "column";
         }
        
         $('#select-choice-mini-sca').val("0").trigger('change');
         $('#select-choice-mini-map').val("0").trigger('change');

         tabTempJson = [];
     });

     //document.getElementById('select-choice-mini-sca').onchange = function (){
     $('#select-choice-mini-sca').change(function () {

         if (tabTempJson.length > 0) {
             var tempData = deepCopyFunction(tabTempJson); 
         }
         else {
             var tempData = table.getData(); 
             tabTempJson = deepCopyFunction(tempData);
         }

         var newData = Object.assign([], tempData);

         if ($('.scarow').is(':checked')){
             scadir = "row";
         }
         if ($('.scacol').is(':checked')){
             scadir = "column";
         }

         if (scadir == "row") {
             var j = 0;
             for (data of tempData){
                 newData[j] = normalizer($('#select-choice-mini-sca').val(), data);
                 j = j + 1;
             }
         }
         else {
             for (data of tempData) {
                 if ("_children" in data && data._children.length > 0){
                    alert("cannot normalize along the colum with tree structures");
                    throw new Error("cannot normalize along the colum with tree structures");
                 }
             }

             var colData = {};
             for (col_name of Object.keys(tempData[0])){
                 if (col_name != 'row_name') {
                    for (data of tempData){
                        colData[data.row_name] = data[col_name];
                    }
                    var newcolData = normalizer($('#select-choice-mini-sca').val(), colData);

                    for (data of newData) {
                        data[col_name] = newcolData[data.row_name];
                    }
                 }
             }
         }

         updateColorMapping();

         if ($('#select-choice-mini-sca').val() != "0") {
            table.setData(newData);
            table.redraw(true);
            draw_legend();
         }
         else {
            table.clearData();
            tabOption.data = tabTempJson;
            table = new Tabulator("#dashboard-table", tabOption);
            draw_legend();
         }
     });

     document.getElementById('select-choice-mini-map').onchange = function (){
         updateColorMapping();
         //table.clearData();
         tabOption.data = table.getData();
         table = new Tabulator("#dashboard-table", tabOption);
         //table.redraw(true);
     };

});


function updateNormalizing() {

     if (tabTempJson.length > 0) {
         var tempData = deepCopyFunction(tabTempJson); 
     }
     else {
         var tempData = table.getData(); 
         tabTempJson = deepCopyFunction(tempData);
     }

     var newData = Object.assign([], tempData);

     if ($('.scarow').is(':checked')){
         scadir = "row";
     }
     if ($('.scacol').is(':checked')){
         scadir = "column";
     }

     if (scadir == "row") {
         var j = 0;
         for (data of tempData){
             newData[j] = normalizer($('#select-choice-mini-sca').val(), data);
             j = j + 1;
         }
     }
     else {
         var colData = {};
         for (col_name of Object.keys(tempData[0])){
             if (col_name != 'row_name') {
                for (data of tempData){
                    colData[data.row_name] = data[col_name];
                }
                var newcolData = normalizer($('#select-choice-mini-sca').val(), colData);

                for (data of newData) {
                    data[col_name] = newcolData[data.row_name];
                }
             }
         }
    }

    return newData;

}


function updateColorMapping() {
     switch($('#select-choice-mini-map').val()) {
         case "0":
             lmtCellColorFormatter = colorILAMB;
             break;
         case "1":
             lmtCellColorFormatter = colorLinear;
             break;
         case "2":
             lmtCellColorFormatter = colorLinearReverse;
     }

     //update table options
     for (x of tabOption.columns) {
         if (x.field != "row_name"){
             x["formatter"] = lmtCellColorFormatter;
             x["formatterParams"]['scaopt'] = $('#select-choice-mini-sca').val();
         }
     }
}

function toggleTooltips(genTab){
     if ($("#tooltips[type=checkbox]").is(":checked")) { 
        tabOption.tooltips = function(cell){
           if (cell.getField() == 'row_name') {
              return false;
           }
           else {
              return Math.round((cell.getValue() + Number.EPSILON) * 100) / 100;
           }
        };
     }
     else{
        tabOption.tooltips = false;
     }
     if (genTab){
        table.clearData();
        table = new Tabulator("#dashboard-table", tabOption);
     }
}


function toggleCellValue(genTab) {
     if ($("#cellvalue[type=checkbox]").is(":checked")) { 
         for (x of tabOption.columns) {
             if (x.field != "row_name"){
                 x["formatterParams"] = {"showCellValue":true};
             }
         }
     }
     else {

         for (x of tabOption.columns) {
             if (x.field != "row_name"){
                 x["formatterParams"] = {"showCellValue":false};
             }
         }
     }

     if (genTab){
        var tempData = table.getData();
        table.clearData();
        //table.setData(tempData);
        tabOption.data = tempData;
        tabOption.maxHeight = false;
        table = new Tabulator("#dashboard-table", tabOption);

        //document.getElementById('dashboard-table').style.removeProperty('max-height');
        //document.getElementById('dashboard-table').style.height = "100%";
        //table.setHeight(false);
        //draw_legend();
     }

}


function toggleScreenHeight() {

     if ($("#screenheight[type=checkbox]").is(":checked")) { 
        document.getElementById('dashboard-table').style['max-height'] = "100%";
        //document.getElementById('dashboard-table').style.height = "82vh";
        //document.getElementById('dashboard-table').style['height'] = "auto";
        document.getElementById('dashboard-table').style.removeProperty('height');
        document.getElementById('dashboard-table').style.removeProperty('min-height');
        table.setHeight(false);
        draw_legend();

     }
     else {

        document.getElementById('dashboard-table').style.removeProperty('max-height');
        document.getElementById('dashboard-table').style.height = "100%";
        table.setHeight(false);
        draw_legend();
    }

}

function toggleBottomTitle(genTab) {
    if ($("#bottomtitle[type=checkbox]").is(":checked")) { 
         for (x of tabOption.columns) {
             if (x.field != "row_name"){
                 x["bottomCalc"] = bottomCalcFunc;
             }
         }
     }
     else {

         for (x of tabOption.columns) {
             if (x.field != "row_name"){
                 delete x['bottomCalc'];
             }
         }
     }

     if (genTab) {
        var tempData = table.getData();
        table.clearData();
        tabOption.data = tempData;
        table = new Tabulator("#dashboard-table", tabOption);
     }
}


function toggleTopTitle(genTab) {
    if ($("#toptitle[type=checkbox]").is(":checked")) { 
         tabOption["headerVisible"] = true;
    }
    else {
         tabOption["headerVisible"] = false;
    }

    if (genTab) {
        var tempData = table.getData();
        table.clearData();
        tabOption.data = tempData;
        table = new Tabulator("#dashboard-table", tabOption);
    }
}


function loadrmtJson(jsfUrl) {
   if (jsfUrl !== ""){

     document.getElementById('file').value = '';
     table.clearData();

     resetSwitch();
     resetSelect();


     var jqxhr = $.getJSON( jsfUrl, {format: "json"})
       .done(function(data) {
     
          var jsonData = data;
     
          switch(jsonData.SCHEMA.name){
          case "CMEC":
              cmecJson = data;
              jsonType = "CMEC";

              prepareTab(cmecJson);

              break;
     
          case "TABJSON":
              jsonType = "TABJSON";
              var scoreboard = "Overall Score global";
              tabTreeJson = filterScoreboard(data.RESULTS, scoreboard);
     
              lmt_tool.add_options(["model"], "select-choice-mini-x");
              lmt_tool.add_options(["metric"], "select-choice-mini-y");
     
              var regions = [];
              var statistics = [];
     
              for (row of data.RESULTS){
                   regions.push(row.scoreboard.split(" ")[row.scoreboard.split(" ").length-1]);
                   statistics.push(row.scoreboard.split(" ").slice(0,-1).join(" "));
              }
     
              regions = [...new Set(regions)];
              statistics = [...new Set(statistics)];
              lmt_tool.add_options(regions, 'select-choice-mini-0');
              lmt_tool.add_options(statistics, 'select-choice-mini-3');
     
              selectIDbyDims['region'] = 'select-choice-mini-0';
              selectIDbyDims['statistic'] = 'select-choice-mini-3'
              ydimField = "metric";
     
     
              $('.select-choice-x').val('model');
              $('.select-choice-y').val('metric');
              $('#'.concat(selectIDbyDims['region'])).select2({ placeholder: 'Select region',});
              $('#'.concat(selectIDbyDims['region'])).val('global').trigger('change');
     
              $('#'.concat(selectIDbyDims['statistic'])).select2({ placeholder: 'Select region',});
              $('#'.concat(selectIDbyDims['statistic'])).val('Overall Score').trigger('change');
              lmt_tool.add_options(Object.keys(tabTreeJson[0]).filter(item => item !== 'row_name' && item !== '_children' && item !== 'metric'), 'hlist');
     
              // set tab column
              //
              tabOption.data = tabTreeJson;
              bgcol = "#0063B2FF";
              ftwgt = 500;
              ftsty = "normal";
              txdec = "";
              txcol = "black";
              let lmtTitleFormatterParams = {"bgcol":bgcol, "ftsty":ftsty, "ftwgt":ftwgt, "txdec":txdec, "color":txcol};
              grpsFirstCol.length = 0;
              tabOption.columns = setTabColumns(tabTreeJson, addBottomTitle=false, firstColIcon, lmtTitleFormatterParams, 'model', 'metric', ydimField);

              break;
          }
     
          // trigger an event to indicate that the json is ready
          $(document).trigger('jsonReady');
     })
     .fail(function( jqxhr, textStatus, error ) {
         var err = textStatus + ", " + error;
         alert( "Request " + jsfUrl + "\nFailed: " + err );
     });
   }
}


function prepareTab(cJson) {

   //Get model groups
   if (cJson.DIMENSIONS.json_structure.includes('model')){
       var t = [];
       for (x of (Object.keys(cJson.DIMENSIONS.dimensions.model))){
           t.push(cJson.DIMENSIONS.dimensions.model[x].Source);
       }
       t = [...new Set(t)];
       for (x of (Object.keys(cJson.DIMENSIONS.dimensions.model))){
           grpsModelSrc[x] = t.indexOf(cJson.DIMENSIONS.dimensions.model[x].Source);
       }
   }
   if (cJson.DIMENSIONS.json_structure.includes('metric')){
       var t = [];
       for (x of Object.keys(cJson.DIMENSIONS.dimensions.metric)){
           if  ( ! (x.includes('::') || x.includes('!!')) ){
               t.push(x);
           }
       }
       grpsTopMetric = [...new Set(t)];
   }




   for (let [i, dimn] of Object.entries(cJson.DIMENSIONS.json_structure)) {
        if (dimn == 'statistic'){
            lmt_tool.add_options(cJson.DIMENSIONS.dimensions[dimn].indices, 'select-choice-mini-'.concat(i.toString()));
        }
        else{
            lmt_tool.add_options(Object.keys(cJson.DIMENSIONS.dimensions[dimn]), 'select-choice-mini-'.concat(i.toString()));
        }

        selectIDbyDims[dimn] = 'select-choice-mini-'.concat(i.toString());
        dimBySelectIDs['select-choice-mini-'.concat(i.toString())] = dimn;
   }

   // default ilamb, for others need to be rethink of it

   let ini_xdim = cJson.DIMENSIONS.json_structure[0];
   let ini_ydim = cJson.DIMENSIONS.json_structure[1];
   let ini_fxdm = {};
   for (fxdim of cJson.DIMENSIONS.json_structure.slice(2, cJson.DIMENSIONS.json_structure.length)) {
       if (fxdim == 'statistic'){
          ini_fxdm[fxdim] = cJson.DIMENSIONS.dimensions['statistic']['indices'][0];
       }
       else {
          ini_fxdm[fxdim] = Object.keys(cJson.DIMENSIONS.dimensions[fxdim])[0];
       }
   }

   tabTreeJson = lmt_tool.cmec2tab_json(cJson, ini_xdim, ini_ydim, ini_fxdm, 1);

   // add options 
   lmt_tool.add_options(cJson.DIMENSIONS.json_structure, "select-choice-mini-x");
   lmt_tool.add_options(cJson.DIMENSIONS.json_structure, "select-choice-mini-y");
   ydimField = "row_name";
   $('.select-choice-x').val(ini_xdim);
   $('.select-choice-y').val(ini_ydim);


   $('#'.concat(selectIDbyDims['region'])).select2({ placeholder: 'Select region',});
   $('#'.concat(selectIDbyDims['region'])).val('global').trigger('change');



   for (fxdim of Object.keys(ini_fxdm)) {
       $('#'.concat(selectIDbyDims[fxdim])).select2({ placeholder: 'Select '.concat(fxdim)});
       $('#'.concat(selectIDbyDims[fxdim])).val(ini_fxdm[fxdim]).trigger('change');
   }
   lmt_tool.add_options(Object.keys(tabTreeJson[0]).filter(item => item !== 'row_name' && item !== '_children' && item !== 'metric'), 'hlist');

   // set tab column
   //
   tabOption.data = tabTreeJson;
   bgcol = "#0063B2FF";
   ftwgt = 500;
   ftsty = "normal";
   txdec = "";
   txcol = "white";
   let lmtTitleFormatterParams = {"bgcol":bgcol, "ftsty":ftsty, "ftwgt":ftwgt, "txdec":txdec, "color":txcol};
   grpsFirstCol.length = 0;
   tabOption.columns = setTabColumns(tabTreeJson, addBottomTitle=false, firstColIcon, lmtTitleFormatterParams, ini_xdim, ini_ydim, ydimField);

}

// load local json files

function loadlocJson() {


     resetSwitch();
     resetSelect();

    $('.select-choice-ex').val(null).trigger('change');



    var file = document.getElementById('file').files[0];

    if (! file){
       alert ('please input file');
       table.setColumns([]);
       table.clearData();
    }
    else{

        if (! (file.type.includes("json"))){
            alert ("please input json file like *.json");
        }
        else{

            var filePromise = readFile(file);

            filePromise.then (function(file){
               try{
                   cmecJson = JSON.parse(file.content);
               }
               catch(err){
                   alert('xxx', err.message);
               }


               //CMEC json schema validation will be added soon

               jsonType = "CMEC";


               //Get model groups
               //
               //
               if (cmecJson.DIMENSIONS.json_structure.includes('model')){
                   var t = [];
                   for (x of (Object.keys(cmecJson.DIMENSIONS.dimensions.model))){
                       t.push(cmecJson.DIMENSIONS.dimensions.model[x].Source);
                   }
                   t = [...new Set(t)];
                   for (x of (Object.keys(cmecJson.DIMENSIONS.dimensions.model))){
                       grpsModelSrc[x] = t.indexOf(cmecJson.DIMENSIONS.dimensions.model[x].Source);
                   }
               }
               if (cmecJson.DIMENSIONS.json_structure.includes('metric')){
                   var t = [];
                   for (x of Object.keys(cmecJson.DIMENSIONS.dimensions.metric)){
                       if  ( ! (x.includes('::') || x.includes('!!')) ){
                           t.push(x);
                       }
                   }
                   grpsTopMetric = [...new Set(t)];
               }
              
               selectIDbyDims = {};
               dimBySelectIDs = {};
               for (let [i, dimn] of Object.entries(cmecJson.DIMENSIONS.json_structure)) {
                    if (dimn == 'statistic'){
                        lmt_tool.add_options(cmecJson.DIMENSIONS.dimensions[dimn].indices, 'select-choice-mini-'.concat(i.toString()));
                    }
                    else{
                        lmt_tool.add_options(Object.keys(cmecJson.DIMENSIONS.dimensions[dimn]), 'select-choice-mini-'.concat(i.toString()));
                    }

                    selectIDbyDims[dimn] = 'select-choice-mini-'.concat(i.toString());
                    dimBySelectIDs['select-choice-mini-'.concat(i.toString())] = dimn;
               }

               // default ilamb, for others need to be rethink of it
               //


               let ini_xdim = cmecJson.DIMENSIONS.json_structure[0];
               let ini_ydim = cmecJson.DIMENSIONS.json_structure[1];
               let ini_fxdm = {};
               for (fxdim of cmecJson.DIMENSIONS.json_structure.slice(2, cmecJson.DIMENSIONS.json_structure.length)) {
                   if (fxdim == 'statistic'){
                      ini_fxdm[fxdim] = cmecJson.DIMENSIONS.dimensions['statistic']['indices'][0];
                   } 
                   else {
                      ini_fxdm[fxdim] = Object.keys(cmecJson.DIMENSIONS.dimensions[fxdim])[0];
                   }
               }

               tabTreeJson = lmt_tool.cmec2tab_json(cmecJson, ini_xdim, ini_ydim, ini_fxdm, 1);

               // add options 
               lmt_tool.add_options(cmecJson.DIMENSIONS.json_structure, "select-choice-mini-x");
               lmt_tool.add_options(cmecJson.DIMENSIONS.json_structure, "select-choice-mini-y");
               ydimField = "row_name";
               $('.select-choice-x').val(ini_xdim);
               $('.select-choice-y').val(ini_ydim);

               for (fxdim of Object.keys(ini_fxdm)) {
                   $('#'.concat(selectIDbyDims[fxdim])).select2({ placeholder: 'Select '.concat(fxdim)});
                   $('#'.concat(selectIDbyDims[fxdim])).val(ini_fxdm[fxdim]).trigger('change');
               }
               lmt_tool.add_options(Object.keys(tabTreeJson[0]).filter(item => item !== 'row_name' && item !== '_children' && item !== 'metric'), 'hlist');

               // set tab column
               //
               tabOption.data = tabTreeJson;
               bgcol = "#0063B2FF";
               ftwgt = 500;
               ftsty = "normal";
               txdec = "";
               txcol = "white";
               let lmtTitleFormatterParams = {"bgcol":bgcol, "ftsty":ftsty, "ftwgt":ftwgt, "txdec":txdec, "color":txcol};
               grpsFirstCol.length = 0;
               tabOption.columns = setTabColumns(tabTreeJson, addBottomTitle=false, firstColIcon, lmtTitleFormatterParams, ini_xdim, ini_ydim, ydimField);

               // trigger an event to indicate that the json is ready
               $(document).trigger('jsonReady');
            })
            .catch(err => alert(err));
        }
    }
}


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


$(document).on('jsonReady', function() {

     isJsonReady = true;

     document.getElementById('mytab').style.width = (320+(tabOption.columns.length-1)*28).toString()+'px';


     try{
        toggleTooltips(false);

        table = new Tabulator("#dashboard-table", tabOption);
        draw_legend();
     }
     catch(err){
        alert('Error when rending the table:', err.message);
     }

     try{
        var xDimName = cmecJson.DIMENSIONS.json_structure[0];
        var yDimName = cmecJson.DIMENSIONS.json_structure[1];

        //for (dimn of Object.keys(selectIDbyDims)) {
        //     if (dimn != xDimName && dimn != yDimName){
        //        fixedDimsDict[dimn] = $("#".concat(selectIDbyDims[dimn])).val();
        //     }
        //}
        menuShowHide(xDimName, yDimName, 0);

        $('#select-choice-mini-x').on('select2:select', function (e) {
             var selectedValue = $(this).val(); // get the selected value
             xDimName = selectedValue;
             if (xDimName != undefined && yDimName != undefined) {

                  if (xDimName == yDimName){
                     alert (" x and y must be different ");
                  }
                  else {
                     menuShowHide(xDimName, yDimName, 1);
                  }
             }
        });
        
        document.getElementById('select-choice-mini-y').onchange = function () {
             var selectedValue = this.options[this.selectedIndex].value; // get the selected value
             yDimName = selectedValue;
             if (xDimName != undefined && yDimName != undefined){
                  if (xDimName == yDimName){
                     alert (" x and y must be different ");
                  }
                  else{
                     menuShowHide(xDimName, yDimName, 1);
                  }
             }
        }
     }
     catch(err){
        alert('Error when handling the table:', err.message);
     }

     
});


function menuShowHide(xDim, yDim, menuReset) {

     //trying to reset scaling and normalizing part
     //
     //
     $('.scarow').prop('checked', true);
     $('.scacol').prop('checked', false);
     //$('#select-choice-mini-sca').val("0").trigger('change');
     //$('#select-choice-mini-map').val("0").trigger('change');
     $('#select-choice-mini-sca').val("0");
     $('#select-choice-mini-sca').trigger('change.select2');
     $('#select-choice-mini-map').val("0");
     $('#select-choice-mini-map').trigger('change.select2');

     tabTempJson = [];

     fixedDimsDict={};

     for (dimn of Object.keys(selectIDbyDims)) {
         if (xDim == dimn || yDim == dimn){
            $("#".concat(selectIDbyDims[dimn])).val(null).trigger('change');
            $("#".concat(selectIDbyDims[dimn])).select2().next().hide();
         }
         else{
            //nullify fixedDimsDict
            fixedDimsDict[dimn] = $("#".concat(selectIDbyDims[dimn])).val();

            if (menuReset == 1){
               //clear selction 
               fixedDimsDict[dimn] = null;
               $("#".concat(selectIDbyDims[dimn])).val(null).trigger('change');
               //show it
               $("#".concat(selectIDbyDims[dimn])).select2().next().show();
               $("#".concat(selectIDbyDims[dimn])).select2({
                   placeholder: 'Select '.concat(dimn),
               });

               //update hide list
               var sel = document.getElementById('hlist');
               for (var i = sel.options.length-1; i >= 0; i--) {
                   sel.remove(i);
               }
               if (xDim == 'statistic'){
                   lmt_tool.add_options(cmecJson.DIMENSIONS.dimensions[xDim].indices, 'hlist');
               }
               else{
                   lmt_tool.add_options(Object.keys(cmecJson.DIMENSIONS.dimensions[xDim]), 'hlist');
               }
            }



            $("#".concat(selectIDbyDims[dimn])).off('select2:select');

            $("#".concat(selectIDbyDims[dimn])).on('select2:select', function (e) {

               $('.scarow').prop('checked', true);
               $('.scacol').prop('checked', false);
               
               $('#select-choice-mini-sca').val("0").trigger('change.select2');
               $('#select-choice-mini-map').val("0").trigger('change.select2');
               tabTempJson = [];
           
               selId = $(this).attr('id');
               fixedDimsDict[dimBySelectIDs[selId]] = $(this).val();

               function checkDefine(data){
                  return data != undefined;                   
               }


               if( Object.values(fixedDimsDict).every(checkDefine) ) {

                   var cvtTree=1;

                   tabJson = lmt_tool.cmec2tab_json(cmecJson, xDim, yDim, fixedDimsDict, cvtTree);

                   tabOption.data = tabJson;

                   bgcol = "#0063B2FF";
                   ftwgt = 500;
                   ftsty = "normal";
                   txdec = "";
                   txcol = "black";

                  
                   let lmtTitleFormatterParams = {"bgcol":bgcol, "ftsty":ftsty, "ftwgt":ftwgt, "txdec":txdec, "color":txcol};
                   grpsFirstCol.length = 0;
                   tabOption.columns = setTabColumns(tabJson, addBottomTitle=false, firstColIcon, lmtTitleFormatterParams, xDim, yDim, 'row_name');

                   document.getElementById('mytab').style.width = (320+(tabOption.columns.length-1)*28).toString()+'px';


                   toggleTooltips(false);

                   //check the switches
                   toggleCellValue(false);
                   toggleBottomTitle(false);
                   toggleTopTitle(false);

                   //table = new Tabulator("#dashboard-table", tabOption);

                   table.setColumns(tabOption.columns);
                   table.clearData();
                   table.setData(tabJson);
                   table.redraw(true);
               }
               
            });
         }
     }
}

//select function
//
//



//other functions
//
//

var draw_legend = function (){
     //draw legend
     var nc = cmap.length;
     var legtable = document.getElementById("scoresLegend");
     row = 0;
     for(var col=0;col<cmap.length;col++){
        legtable.rows[row].cells[col].style.backgroundColor = cmap[col];
     }
}

var bottomCalcFunc = function(values, data, calcParams){
     //values - array of column values
     //data - all table data
     //calcParams - params passed from the column definition object
     //var calc = 0;
     return calcParams;
};


var lmtCellColorFormatter = colorILAMB;



function colorILAMB(cell, formatterParams, onRendered){
     var clr = "#808080";
     let nc = cmap.length;

     if (Array.isArray(cell.getValue())) {
         origVal = cell.getValue()[0];
         normVal = cell.getValue()[1];
     }
     else {
         origVal = cell.getValue();
         normVal = cell.getValue();
     }

     
     if(normVal > -900){
         var ae = Math.abs(normVal);
         var ind;
         if(ae>=0.25){
              ind = Math.round(2*normVal+4);
         }else{
              ind = Math.round(4*normVal+4);
         }
         ind = Math.min(Math.max(ind,0),nc-1);
         clr = cmap[ind];
     }
     cell.getElement().style.backgroundColor = clr;

     if (formatterParams.showCellValue && origVal > -900){
         cell.getElement().style.color = "black";
        return Math.round((origVal + Number.EPSILON) * 100) / 100;
     }
};


function colorLinear(cell, formatterParams, onRendered) {
     let vMin, vMax;
     vMin = -2.5;
     vMax =  2.5;
     if (formatterParams.scaopt == "0"){
         //if (formatterParams.scadir == "row"){
         //   var cell.getData();
         //}
         console.log("will be implemented later");
     }
     else if (formatterParams.scaopt == "1"){
          vMin = -2.5;
          vMax =  2.5;
     }
     else if (formatterParams.scaopt == "2"){
          vMin = -1.0;
          vMax =  1.0;
     }
     else if (formatterParams.scaopt == "3"){
         vMin =  0.0;
         vMax =  1.0;
     }

     if (Array.isArray(cell.getValue())) {
         origVal = cell.getValue()[0];
         normVal = cell.getValue()[1];
     }
     else {
         origVal = cell.getValue();
         normVal = cell.getValue();
     }


     var clr = "#808080";
     let nc = cmap.length;
     if(normVal > -900){
         var ind = Math.round((normVal - vMin) * nc / (vMax - vMin))
         ind = Math.min(Math.max(ind,0),nc-1);
         clr = cmap[ind];
     }
     cell.getElement().style.backgroundColor = clr;

     if (formatterParams.showCellValue && origVal > -900){
         cell.getElement().style.color = "black";
        return Math.round((origVal + Number.EPSILON) * 100) / 100;
     }
}


function colorLinearReverse(cell, formatterParams, onRendered) {

     let vMin, vMax;
     vMin = -2.5;
     vMax =  2.5;
     if (formatterParams.scaopt == "0"){
         console.log("will be implemented later");
     }
     else if (formatterParams.scaopt == "1"){
          vMin = -2.5;
          vMax =  2.5;
     }
     else if (formatterParams.scaopt == "2"){
          vMin = -1.0;
          vMax =  1.0;
     }
     else if (formatterParams.scaopt == "3"){
         vMin =  0.0;
         vMax =  1.0;
     }

     if (Array.isArray(cell.getValue())) {
         origVal = cell.getValue()[0];
         normVal = cell.getValue()[1];
     }
     else {
         origVal = cell.getValue();
         normVal = cell.getValue();
     }

     var clr = "#808080";
     let nc = cmap.length;
     if(normVal > -900){
         var ind = Math.round((vMax - normVal) * nc / (vMax - vMin))
         ind = Math.min(Math.max(ind,0),nc-1);
         clr = cmap[ind];
     }
     cell.getElement().style.backgroundColor = clr;

     if (formatterParams.showCellValue && origVal > -900){
         cell.getElement().style.color = "black";
        return Math.round((origVal + Number.EPSILON) * 100) / 100;
     }
}

var lmtTitleFormatter = function(cell, titleFormatterParams, onRendered){
     onRendered(function(){

           cell.getElement().parentElement.parentElement.style.backgroundColor = titleFormatterParams.bgcol;
           cell.getElement().parentElement.parentElement.style.fontStyle = titleFormatterParams.ftsty;
           cell.getElement().parentElement.parentElement.style.fontWeight = titleFormatterParams.ftwgt;
           cell.getElement().parentElement.parentElement.style.textDecoration = titleFormatterParams.txdec;
           cell.getElement().parentElement.parentElement.style.color = titleFormatterParams.color;

           $('.tabulator-col-title').css("color", titleFormatterParams.color);

           //cell.getElement()["style"] = {};
           //cell.getElement()["style"]["color"] = titleFormatterParams.color;

           //cell.getElement().parentElement.parentElement.style.fontVariant = "small-caps";
     });
     return cell.getValue();
};


var setTabColumns = function(tabJson, addBottomTitle, firstColIcon, lmtTitleFormatterParams, xdim, ydim, ydimField){

    var Columns=[];

    var otherCol = { title:"col_name", field:"col-field", bottomCalc: bottomCalcFunc, headerContextMenu:headerContextMenu, //headerMenu:headerMenu, 
            formatter:lmtCellColorFormatter, formatterParams:{}, titleFormatter:lmtTitleFormatter, titleFormatterParams:lmtTitleFormatterParams, width:28, headerVertical:"flip", resizable:false};
    //var firstCol = { title:"row_name", field:"row_field", frozen: true, titleFormatter: firstColIcon, minWidth:320, formatter:setFirstColBgColor, formatterParams:{"xDim":xdim,"yDim":ydim} };
    var firstCol = { title:"row_name", field:"row_field", frozen: true, titleFormatter: firstColIcon, minWidth:320 };
    //var firstCol = { title:"row_name", field:"row_field", frozen: true, titleFormatter: firstColIcon, formatter:setFirstColBgColor, formatterParams:{"xDim":xdim,"yDim":ydim} };

    firstCol.title = ydim.concat('/',xdim);
    //firstCol.field = 'row_name';
    firstCol.title = "";
    firstCol.field = ydimField;

    Columns.push(firstCol);

    var col={};
    for (x of Object.keys(tabJson[0])){
        if ( x != 'row_name' && x != '_children' && x != 'metric'){
           col= Object.assign({}, otherCol);

           col.title=x;
           col.field=x;
           col.bottomCalcParams=x;

           if (xdim == "model"){
              var k =  grpsModelSrc[x] % bgColorGroupFirstRow.length
              bgcol = bgColorGroupFirstRow[k];
              ftwgt = 600;
              ftsty = "normal";
              txdec = "";
              //txcol = "white";
              txcol = fgColorGroupFirstRow[k];
           }
           else if (xdim == "metric"){

              for (let [idxmet, topmet] of grpsTopMetric.entries()){
                  if (x.includes(topmet)){
                      var k = idxmet %  bgColorGroup.length;
                      bgcol =  bgColorGroup[k];
                  }
              }
           }
           else{
              //bgcol = "#9CC3D5";
              bgcol = "#0063B2FF";
              ftwgt=600;
              ftsty="normal";
              txdec="";
              txcol="white";
           }
           col.titleFormatterParams = {"bgcol":bgcol, "ftsty":ftsty, "ftwgt":ftwgt, "txdec":txdec, "color":txcol};

           if( !addBottomTitle ){
               delete col['bottomCalc'];
           }
           Columns.push(col);
        }
    }
    return Columns;
};



var firstColIcon =  function(cell, titleFormatterParams) {
    //return "<img class='infoImage' src='https://avatars0.githubusercontent.com/u/36375040?s=200&v=4'>";
    //
    return "<img class='infoImage' src='image/".concat(logoFile, "'>");
    //return "<img class='infoImage' src='image.png'>";
};



//define row context menu contents
var rowMenu = [
    {
        label:"<i class='fas fa-user'></i> Change Name",
        action:function(e, row){
            row.update({name:"Steve Bobberson"});
        }
    },
    {
        label:"<i class='fas fa-check-square-o' aria-hidden='true'></i> Select Row",
        action:function(e, row){
            row.select();
        }
    },
];

//define row context menu
var headerMenu = [
    {
        label:"<i class='fa fa-eye-slash'></i> Hide Column",
        action:function(e, column){
            column.hide();
        }
    },
    {
        label:"<i class='fa fa-arrows-alt'></i> Move Column",
        action:function(e, column){
            column.move("col");
        }
    },
];


//define row context menu
var headerContextMenu = [
    {
        label:"Hide Column",
        action:function(e, column){
            column.hide();
            var columnField = column.getField();
            selData = $('#hlist').select2('data');
            hideItems=[];
            if (selData.length >= 1){
               for (se of selData){
                    hideItems.push(se.id);
               }
            }
            hideItems.push(columnField);
            $('#hlist').val(hideItems).trigger('change');
        }
    },
];


function tableColor(){

     if(document.getElementById("colorblind").checked) {
        cmap = PuOr;
     }else{
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

//
//
function  cellClickFuncGenetic(e, cell){
     //e - the click event object
     //cell - cell component
     var thisrow = cell.getRow();
     var thiscol = cell.getColumn();
     var isTree = new Boolean(true);


     // check parent row
     //
     //
     if ( thisrow.getTreeChildren().length == 0 ){

         var colField = thiscol.getField();
         //var rowFirst = thisrow.getCell('row_name').getValue();
         var rowFirst = thisrow.getCell(ydimField).getValue();

         xDimName = $('#select-choice-mini-x').val();
         yDimName = $('#select-choice-mini-y').val();


         let linkmodel;
         let linkmetric;
         let dims;

         if (jsonType == "CMEC"){
             dims = cmecJson.DIMENSIONS.json_structure;
         }
         else{
             dims = ["region", "model", "metric", "statistic"];
         }

         for (dim of dims){
              selectVal = $('#'.concat(selectIDbyDims[dim])).val();
              if (selectVal != undefined && selectVal != null && selectVal != ''){

                  if (dim == 'model'){linkmodel = selectVal;}
                  if (dim == 'region'){linkregion = selectVal;}
                  if (dim == 'metric'){
                      if (selectVal.includes('!!')) {
                          linkmetric = selectVal.replace(/\s/g, '').replace('::','/').replace('!!','/');
                          var benmarkname = selectVal.split('!!').slice(-1)[0];
                          linkmetric = linkmetric.concat('/', benmarkname);
                      }
                      else{
                          alert ("111 clickable cell only for lowest level metric");
                      }
                  }
                      
              }
         }

         if ( xDimName == 'model' ){ linkmodel = colField; }
         if ( yDimName == 'model' ){ linkmodel = rowFirst; }

         if ( xDimName == 'region' ){ linkregion = colField; }
         if ( yDimName == 'region' ){ linkregion = rowFirst; }


         if ( xDimName == 'metric' ) {

             if (colField.includes('!!')){
                 linkmetric = colField.replace(/\s/g, '').replace('::','/').replace('!!','/');
                 var benmarkname = colField.split('!!').slice(-1)[0];
                 linkmetric = linkmetric.concat('/', benmarkname);
             }
             else{

                 alert ("222 clickable cell only for lowest level metric");

             }
         }

         if ( yDimName == 'metric' ) {

             var topmet = thisrow.getTreeParent().getTreeParent().getCell(ydimField).getValue().replace(/\s/g, '');
             var sndmet = thisrow.getTreeParent().getCell(ydimField).getValue().replace(/\s/g, '');
             linkmetric = topmet.concat('/', sndmet, '/', rowFirst, '/', rowFirst);


         }



         if (linkmetric != undefined) {
             var newWin = window.open(baseUrl.concat(linkmetric,'.html?model=',linkmodel,'&region=', linkregion));
         }

         //var newWin= window.open("https://www.ilamb.org/CMIP5v6/historical/EcosystemandCarbonCycle/BurnedArea/GFED4S/GFED4S.html");
     }
     else{

         if (cell.getRow().getCell(ydimField).getValue() == cell.getValue()){
            cell.getRow().treeToggle();
         }
         else{
            alert ("333 clickable cell only for lowest level metric");
         }
     }
}


//background color of first column
function setFirstColBgColor(cell, formatterParams, onRendered){

     var value = cell.getValue();
     onRendered(function(){

        if(! cell.getRow().getTreeParent()){

            if (formatterParams.yDim == "metric"){
                fgFontColor = "#0808ff";
            }
            else if (formatterParams.yDim == "model"){
                fgFontColor = "white"
            }
            else {
                fgFontColor = "black"
            }

            if (formatterParams.yDim == "metric"){
                var chrow = cell.getRow().getTreeChildren();

                if (! (grpsFirstCol.includes(value))){
                    grpsFirstCol.push(value);
                    //grpsFirstCol = [... new Set(grpsFirstCol)];
                }
                chrow.forEach(function(r){
                    //var k = (grpsFirstCol.length - 1) % bgColorGroup.length;
                    var k = grpsFirstCol.indexOf(value) % bgColorGroup.length;
                    setmetricbg(r, cell, value, bgColorGroup[k], fgFontColor);
                });
            }
            else if (formatterParams.yDim == "model"){
                fgFontColor = "white"
                var k = grpsModelSrc[value] % bgColorGroupFirstRow.length;
                //setmetricbg(cell.getRow(), cell, value, bgColorGroupFirstRow[k], fgFontColor);
                setmetricbg(cell.getRow(), cell, value, bgColorGroupFirstRow[k], fgColorGroupFirstRow[k]);
            }
        }
     });
     return value;
}


function setmetricbg(r, cell, value, bgcolor, fgcolor){
     var r, cell, value, bgcolor;
     cell.getElement().style.backgroundColor = bgcolor;
     r.getElement().style.backgroundColor = bgcolor;
     var gdrow = r.getTreeChildren();
     if (gdrow.length > 0){
         gdrow.forEach(function(g){
             g.getElement().style.backgroundColor = bgcolor;
             g.getElement().style.color = fgcolor;
         });
     }
     else{
         r.getElement().style.color = fgcolor;
     }
     return value;
}

$(window).on('beforeunload', function(){
    //const cb = document.querySelector('input[name="colorblind"]');
    //

    resetSwitch();
    resetSelect();
    resetInput();
});


function resetSwitch () {

    $('#colorblind').prop('checked', true);

    $('.scarow').prop('checked', true);
    $('.scacol').prop('checked', false);

    $('#cellvalue').prop('checked', false);
    $('#bottomtitle').prop('checked', false);
    $('#toptitle').prop('checked', true);
    $('#tooltips').prop('checked', true);
    $('.screenheight').prop('checked', true);
}


function resetSelect (){

    $('.hide-list').val(null).trigger('change');

    $('#select-choice-mini-sca').val("0").trigger('change');
    $('#select-choice-mini-map').val("0").trigger('change');

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

function resetInput (){
    $('.select-choice-ex').val(null).trigger('change');
    $('#file').val('');
    isJsonReady = false;
}

function normalizer(normMethod, data){
    var normData = Object.assign({}, data);

    if ("_children" in data) {
        if (data._children.length > 0){
           var i = 0;
           for (cData of data._children) {
               normData._children[i] = normalizer(normMethod, cData);
               i = i + 1;
           }
        }
    }
             
    var arr = [];
    var kmp = [];
    for ( k of Object.keys(data) ){
        if ( (k != 'row_name') && (k != '_children') ){
           arr.push(data[k]);
           kmp.push(k);
        }

    }

    var normArray = [];
    switch (normMethod){
       //case "0":
       //   normArray = arr;
       //   break;
       case "1":

          let getMean = function (data) {
              datasum = data.reduce(function (a, b) {
                  if (Number(b) > -999.0){
                     return Number(a) + Number(b);
                  }
                  else {
                     return Number(a);
                  }

              }, 0.0);
              
              datanum = data.reduce(function (a, b) {
                  if (Number(b) > -999.0){
                     return Number(a) + 1.0;
                  }
                  else {
                     return Number(a);
                  }
              }, 0.0);
              return datanum > 0 ? datasum / datanum : -999.0;
          };

          let getStd = function (data) {
              let m = getMean(data);

              if ( m > -999.0) {
                 return Math.sqrt(data.reduce(function (sq, n) {

                         if ( Number(n) > -999.0 ) {
                             return sq + Math.pow(Number(n) - m, 2);
                         }
                         else {
                             return sq;
                        
                         }
                     }, 0) / datanum);
              }
              else {
                 return -999.0;
              }
          };

          for ( val of arr ) {
              if (val > -999.0) {
                 newval = ( val - getMean(arr) ) / getStd(arr);
              }
              else {
                 newval = -999.0;
              }
              normArray.push(newval); 
          }
          break;
       case "2": case "3":
          const findMinMax = () => {
             let min = 1.0e20, max = -1.0e20;
             for (let i = 0; i < arr.length; i++) {
               let value = arr[i];

               if (value > -999.0) {
                  min = (value < min) ? value : min
                  max = (value > max) ? value : max
               }
             }

             if ( min == 1.0e20 ){
                  min = -999.0;
             }
             if ( max == -1.0e20 ){
                  max = -999.0;
             }
          
             return [min, max]
          }
          const [vMin, vMax] = findMinMax()
          for ( val of arr ) {
              if (val > -999.0) {
                 if (vMax == vMin) {
                    newval = 1.0
                 }
                 else {

                    if (normMethod == "3") {
                        newval = ( val - vMin  ) / (vMax - vMin);
                    }
                    else {
                        newval = ( val - 0.5*(vMin+vMax) ) / (0.5 * (vMax - vMin));
                    }
                 }
              }
              else {
                 newval = -999.0;
              }
              normArray.push(newval); 
          }
          
          break;
    }

    var i = 0;
    for (k of kmp) {
        normData[k] = [data[k], normArray[i]];
        i = i + 1;
    }
    return normData;
}



const deepCopyFunction = (inObject) => {
  let outObject, value, key

  if (typeof inObject !== "object" || inObject === null) {
    return inObject; // Return the value if inObject is not an object
  }

  // Create an array or object to hold the values
  outObject = Array.isArray(inObject) ? [] : {};

  for (key in inObject) {
    value = inObject[key]

    // Recursively (deep) copy for nested objects, including arrays
    outObject[key] = deepCopyFunction(value);
  }

  return outObject
}

//function expandCollapse(action){
//  if (action == "expand"){
//  	tabOption.dataTreeStartExpanded = [true, false];
//  }
//  else{
//  	tabOption.dataTreeStartExpanded = false;
//  }
//  table = new Tabulator("#dashboard-table", option=tabOption);
//}



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
        }
        else {
            tlevs = Math.max(tlevs, xlevs);
        }
    }

    return tlevs;
}

var timesExpl = 1;
var numClicks = 0;

function expandCollapse(action){
    var maxLevs = findMaxLevels() - 1; //the last level always cannot expand
    if (action == "expand"){
        if (numClicks < maxLevs) {
            timesExpl = timesExpl + 1;
        }
        else {
            timesExpl = timesExpl - 1;
        }
        var tempData = table.getData();
        table.clearData();
        table.setData(tempData);
        table.redraw(true);
        if (timesExpl == 0){
            numClicks = 0;
        }
        else{
            numClicks = numClicks + 1;
        }
    }
}

function setLevelExpand(row, level) {
    if (level < timesExpl) {
       return true;
    }
}


function savetoHtml() {
    //var htmlTable = table.getHtml("active", true);
    //console.log(htmlTable);
    //var newwdw = window.open(htmlTable); 
    table.download("html", "test.html",  {style:true});
}

