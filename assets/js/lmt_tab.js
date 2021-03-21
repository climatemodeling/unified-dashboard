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

window.lmtUDLoaded = 1;


DEBUG = true; // set to false to disable debugging
old_console_log = console.log;
console.log = function() {
    if ( DEBUG ) {
        old_console_log.apply(this, arguments);
    }
}


// Control the tabulator for LMT Unified Dashboard

jsonFileUrl = "https://raw.githubusercontent.com/minxu74/benchmark_results/master/";
const corsProxy = "https://cors-anywhere.herokuapp.com/";  // cors proxy to remove the cors limit


const bgColorGroup = ["#ECFFE6", "#E6F9FF", "#FFECE6", "#EDEDED", "#FFF2E5"];
const bgColorGroupFirstRow = ["yellow", "#00FF00", "white"];
const fgColorGroupFirstRow = ["black", "black", "black"];


// colors used default directly from ILAMB
const PuOr = ['#b35806','#e08214','#fdb863','#fee0b6','#f7f7f7','#d8daeb','#b2abd2','#8073ac','#542788'];
const GnRd = ['#b2182b','#d6604d','#f4a582','#fddbc7','#f7f7f7','#d9f0d3','#a6dba0','#5aae61','#1b7837'];

var baseUrl = "./"

var isTreeTable;

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


var _config = {};

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
         var preTable = " \
<!DOCTYPE html> \
<!-- saved from url=(0037)https://lmt.ornl.gov/test_lmtud/dist/ --> \
<html lang='en' class=''><head><meta http-equiv='Content-Type' content='text/html; charset=UTF-8'> \
   <style> table {margin-left:auto; margin-right:auto; margin-top:10px;} \
      th, td { min-width:30px; max-width:30px; width:30px; height:30px; overflow:hidden; \
         word-wrap:break-word; font-size:11.5px; overflow:auto; text-align:center; } \
      th { height: 150px; transform: translate(-1px, 88px) rotate(-90deg); word-wrap: unset; overflow:inherit; display:tabel-cell;\
        white-space: nowrap; font-size:20px; } td {border:1px solid;} \
      table.tabulator-print-table td:nth-of-type(1) {width:320px;min-width:390px;text-align:right;font-size:20px;padding-right:10px;border:0px;} \
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
.tabulator-print-table .tabulator-data-tree-control .tabulator-data-tree-control-expand{display:inline-block;position:relative;height:7px;width:1px;background:#333}\
.tabulator-print-table .tabulator-data-tree-control .tabulator-data-tree-control-expand:after{position:absolute;content:'';left:-3px;top:3px;height:1px;width:7px;background:#333} \
table .table-header-rotated td:nth-of-type(1){max-width:30px; min-width:30px; width:30px;border:1px solid;padding:1px;} \
.legDiv {transform: scale(1.0); font-size:20px; margin-right:0px; justify-content:center;display:table-cell; padding-left:35px}\
.tabulator-print-table th:nth-of-type(1) {transform:none;}\
.table-header-rotated td { min-width: 30px; max-width: 30px; width: 30px; height: 30px; }\
#scoresLegend {margin-top:0px;}\
.tabulator-print-table .tabulator-data-tree-control {display:none;}"


         //var el = document.createElement( 'html' );
         //el.innerHTML = fileContents;
         //console.log(el.getElementsByTagName('td'));
         var nowColumns = table.getColumns();


         var cssString;
         var nd=1;
         for (col of nowColumns) {
             if (col.isVisible()) {
                var x = col.getField();
                var k =  grpsModelSrc[x] % bgColorGroupFirstRow.length
                if (nd == 1){
                   cssString = '';
                }

                else {
                   // let CMIP 5 and 6 Mean have the same colors with other models
                   // removing 'x' will make their color diffent to others
                   if (x.includes('xMean') || x.includes('xmean')){
                       //bgcol = "white";
                       //var cssSets = 'font-style:italic;';
                       var cssSets = 'color:skyblue;';
                       var cssTemp='.tabulator-print-table th:nth-of-type(nod){set}'
                       cssString+=cssTemp.replace('nod', nd.toString()).replace('set', cssSets);
                       
                   }

                   // 204 35 35
                   // 37 81 204
                   else {
                       if (k == 0 || x.includes('CMIP5')){
                          //var cssSets = 'color:darkgray;';
                          var cssSets = 'color:rgb(37,81,204);';
                          var cssTemp='.tabulator-print-table th:nth-of-type(nod){set}'
                          cssString+=cssTemp.replace('nod', nd.toString()).replace('set', cssSets);
                       }
                       else {
                          var cssSets = 'color:rgb(204,35,35);';
                          var cssTemp='.tabulator-print-table th:nth-of-type(nod){set}'
                          cssString+=cssTemp.replace('nod', nd.toString()).replace('set', cssSets);
                       }
                   }
                }
                nd=nd+1;
             }
         }

  
         var styleEnd = "</style></head><body>";

         //.tabulator-print-table th:nth-of-type(2){}
         var colorBarRow;
         if(document.getElementById("colorblind").checked) {
             colorBarRow = "<td bgcolor='#b35806'></td><td bgcolor='#e08214'></td><td bgcolor='#fdb863'></td><td bgcolor='#fee0b6'></td>\
                  <td bgcolor='#f7f7f7'></td><td bgcolor='#d8daeb'></td><td bgcolor='#b2abd2'></td><td bgcolor='#8073ac'></td><td bgcolor='#542788'></td>";
         }
         else {
             colorBarRow = "<td bgcolor='#b2182b'></td><td bgcolor='#d6604d'></td><td bgcolor='#f4a582'></td><td bgcolor='#fddbc7'></td>\
                  <td bgcolor='#f7f7f7'></td><td bgcolor='#d9f0d3'></td><td bgcolor='#a6dba0'></td><td bgcolor='#5aae61'></td><td bgcolor='#1b7837'></td>";
         }
         var legTable = "<center> <div class='legDiv'> Relative Scale <table class='table-header-rotated' id='scoresLegend'> <tbody> <tr>" +
                        colorBarRow + "</tr> </tbody> </table> Worse Value&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Better Value \
            <table class='table-header-rotated' id='missingLegend'> \
              <tbody> <tr> <td bgcolor='#808080'></td> </tr> </tbody> \
            </table>Missing Data or Error\
            </div> </center> ";

         //insert legend table into the top-left
         let topleftcell = '<th colspan="1" rowspan="1"></th>'

         var aftTable = "</body></html>";
         //var newContents = preTable + //"<div id='mytabs' style='width:1000px;'>" + 
         //     fileContents.replace(/undefined/g, '') + //"</div>" + 
         //     legTable + aftTable; 

         var newContents = preTable + cssString + styleEnd +
              fileContents.replace(/undefined/g, '').replace(topleftcell, '<th>'+legTable+'</th>') //.replace(\ /table-row"><td style="/g, "font-weight:bold; tabindex")  + 
              .replace("background-color: rgb(236, 255, 230);", "background-color: rgb(236, 255, 230);font-weight:bold")
              .replace("background-color: rgb(230, 249, 255);", "background-color: rgb(230, 249, 255);font-weight:bold")
              .replace("background-color: rgb(255, 236, 230);", "background-color: rgb(255, 236, 230);font-weight:bold")
              .replace("background-color: rgb(237, 237, 237);", "background-color: rgb(237, 237, 237);font-weight:bold") 
              + aftTable; 
         

         blob = new Blob([newContents], {type: 'text/html'});
         return blob;
     },

     movableColumns: true, //enable user movable columns

     layout:"fitColumns",

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


     dataTreeBranchElement:false, //hide branch element
     dataTreeChildIndent:15, //indent child rows by 15 px
     //dataTreeCollapseElement:"<i></i>", 
     //dataTreeExpandElement:"<i></i>",
    
     selectable: true,
     rowContextMenu:rowMenu,

     //cellClick:cellClickFuncGenetic,
     cellClick:newCellClickFunc,
 
     //rowClick: function(e, row){
     //   if (row.getTreeChildren().length != 0) {
     //       row.treeToggle();
     //   }
     //},
     //
     dataTreeStartExpanded:function(row, level){
        return setLevelExpand(row, level); //expand rows where the "driver" data field is true;
     },
     columns:[],

     maxHeight:"100%",

     tableBuilt:function(){
        if (_config.udcScreenHeight != 0){
           var elmnt = document.getElementsByClassName("tabulator-header");
           var totHeight = elmnt[0].offsetHeight + 30* table.getRows().length + 20;

           try{
               if ( isTreeTable == 0 ){ 
                   $("#dashboard-table")[0].style["height"]="min(82vh, 100%)";
               }
               else{
                   $("#dashboard-table")[0].style["height"]="82vh";

              }
           }
           catch(err){
               console.log(err);

           }

           // reset the screen height switch
           $('.screenheight').prop('checked', true);
        }
     },
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

         var tempData = table.getData(); 
         table = new Tabulator("#dashboard-table", tabOption);  // only way to reformat col title
         table.clearData();
         table.setData(tempData);
         table.redraw(true);

         
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
             var tempData = table.getData('all'); 
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
                 newData[j] = normalizer($('#select-choice-mini-sca').val(), scadir, data);
                 j = j + 1;
             }
         }
         else {
             //for (data of tempData) {
             //    if ("_children" in data && data._children.length > 0){
             //       alert("cannot normalize along the colum with tree structures");
             //       throw new Error("cannot normalize along the colum with tree structures");
             //    }
             //}

             var colData = {};
             for (col_name of Object.keys(tempData[0])){
                 if (col_name != 'row_name' && col_name != '_children') {
                    //for (data of tempData){
                    //    colData[data.row_name] = data[col_name];
                    //}
                    colData  = extractCol(tempData, col_name, '');

                    var newcolData = normalizer($('#select-choice-mini-sca').val(), scadir, colData);
                    insertCol(newData, col_name, newcolData, ''); 
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

     // is this a good place to insert lmtUDConfig?
     // try to find a config file

     const udcUrl = './_lmtUDConfig.json' // in same origin
     console.log("UDEB: UD config file ", udcUrl);


     var jqxhr = $.getJSON(udcUrl, {format: "json"})
       .done(function(data) {
           _config = data;

           console.log("UDEB:", window.location.href + data.udcJsonLoc);

           if (data.udcJsonLoc) {
              //let jsfUrl = window.location.href + data.udcJsonLoc;
              let jsfUrl = './' + data.udcJsonLoc;

              console.log("UDEB: ", jsfUrl, data.udcJsonLoc);
              loadrmtJson(jsfUrl, data.udcDimSets);
           }
           else {

              console.log("UDEB: no JSON data file in the config file");
           }


       })
       .fail(function( jqxhr, textStatus, error ) {
           _config = {};
           var err = textStatus + ": " + error;
           console.log( "UDEB: Request config Failed: " + err );
           
       });


});


function updateNormalizing() {

     if (tabTempJson.length > 0) {
         var tempData = deepCopyFunction(tabTempJson); 
     }
     else {
         var tempData = table.getData('all'); 
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
             if (col_name != 'row_name' && col_name != '_children') {

                colData  = extractCol(tempData, col_name, '');

                var newcolData = normalizer($('#select-choice-mini-sca').val(), colData);

                insertCol(newData, col_name, newcolData); 
             }
         }
    }

    return newData;

}

function extractCol(dataArr, colName, parentName){
    var colData={};
    for (data of dataArr) {
         if (parentName != ''){
            var cur_name = parentName+'::'+data.row_name;
         }
         else {
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
            if (parentName != ''){
               var cur_name = parentName+'::'+data.row_name;
            }
            else {
               var cur_name = data.row_name;
            }

            data[colName] = colData[cur_name];

            if (Object.keys(data).includes('_children')) {
               insertCol(data._children, colName, colData, cur_name);
            }
       }
   }
   catch(err) {

       console.log('UDEB:', parentName, dataArr);

   }

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

        var elmnt = document.getElementsByClassName("tabulator-header");
        //var totHeight = elmnt[0].offsetHeight + 28 * table.getRows().length + 17;
        var totHeight = elmnt[0].offsetHeight + 30* table.getRows().length + 20;

        if ( isTreeTable == 0 ){ 
            document.getElementById('dashboard-table').style['height'] = totHeight.toString() + "px";
        }
        else{
            document.getElementById('dashboard-table').style['height'] = "82vh";
        }
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


function loadrmtJson(jsfUrl, dimSet={}) {
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

              prepareTab(cmecJson, dimSet);

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


          // baseUrl
          if (cmecJson.hasOwnProperty("SETTINGS")) {
              if (cmecJson.SETTINGS.hasOwnProperty("baseUrl")) {
                  baseUrl = cmecJson.SETTINGS.baseUrl;
              }
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


function prepareTab(cJson, dimSet={}) {

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

            if (cJson.DIMENSIONS.dimensions[dimn].hasOwnProperty("indices")) {
                lmt_tool.add_options(cJson.DIMENSIONS.dimensions[dimn].indices, 'select-choice-mini-'.concat(i.toString()));
            }
            else {
                lmt_tool.add_options(Object.keys(cJson.DIMENSIONS.dimensions[dimn]), 'select-choice-mini-'.concat(i.toString()));
            }
        }
        else{
            lmt_tool.add_options(Object.keys(cJson.DIMENSIONS.dimensions[dimn]), 'select-choice-mini-'.concat(i.toString()));
        }

        selectIDbyDims[dimn] = 'select-choice-mini-'.concat(i.toString());
        dimBySelectIDs['select-choice-mini-'.concat(i.toString())] = dimn;
   }

   // default ilamb, for others need to be rethink of it
   //
   //


   let ini_xdim = '';
   let ini_ydim = '';
   let ini_fxdm = {};

   if ( dimSet.x_dim && cJson.DIMENSIONS.json_structure.includes(dimSet.x_dim) &&
        dimSet.y_dim && cJson.DIMENSIONS.json_structure.includes(dimSet.y_dim) ) {
      ini_xdim = dimSet.x_dim;
      ini_ydim = dimSet.y_dim;
      ini_fxdm = dimSet.fxdim;
   }
   else {
      ini_xdim = cJson.DIMENSIONS.json_structure[0];
      ini_ydim = cJson.DIMENSIONS.json_structure[1];
      ini_fxdm = {};

      for (fxdim of cJson.DIMENSIONS.json_structure.slice(2, cJson.DIMENSIONS.json_structure.length)) {
          if (fxdim == 'statistic'){

             if (cJson.DIMENSIONS.dimensions['statistic'].hasOwnProperty("indices")) {
                 ini_fxdm[fxdim] = cJson.DIMENSIONS.dimensions['statistic']['indices'][0];
             }
             else {
                 ini_fxdm[fxdim] = Object.keys(cJson.DIMENSIONS.dimensions[fxdim])[0];
             }
          }
          else {
             ini_fxdm[fxdim] = Object.keys(cJson.DIMENSIONS.dimensions[fxdim])[0];
          }
      }
   }

   tabTreeJson = lmt_tool.cmec2tab_json(cJson, ini_xdim, ini_ydim, ini_fxdm, 1);
   if (Object.keys(tabTreeJson[0]).includes('_children')) {
      tabOption.dataTreeCollapseElement = "";
      tabOption.dataTreeExpandElement = "";
      isTreeTable = 1;
   }
   else{
      tabOption.dataTreeCollapseElement = "<span></span>";
      tabOption.dataTreeExpandElement = "<span></span>";
      isTreeTable = 0;
   }

   // add options 
   lmt_tool.add_options(cJson.DIMENSIONS.json_structure, "select-choice-mini-x");
   lmt_tool.add_options(cJson.DIMENSIONS.json_structure, "select-choice-mini-y");
   ydimField = "row_name";
   $('.select-choice-x').val(ini_xdim);
   $('.select-choice-y').val(ini_ydim);


   //$('#'.concat(selectIDbyDims['region'])).select2({ placeholder: 'Select region',});
   //$('#'.concat(selectIDbyDims['region'])).val('global').trigger('change');



   for (fxdim of Object.keys(ini_fxdm)) {
       console.log('UDEB:', fxdim, selectIDbyDims[fxdim], ini_fxdm[fxdim])
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
   

   if (_config.udcCellValue == 1){
      $('#cellvalue').prop('checked', true);
      toggleCellValue(false);
   }
   

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

                        if (cmecJson.DIMENSIONS.dimensions[dimn].hasOwnProperty("indices")) {
                            lmt_tool.add_options(cmecJson.DIMENSIONS.dimensions[dimn].indices, 'select-choice-mini-'.concat(i.toString()));
                        }
                        else {
                            lmt_tool.add_options(Object.keys(cmecJson.DIMENSIONS.dimensions[dimn]), 'select-choice-mini-'.concat(i.toString()));
                        }
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

                      if (cmecJson.DIMENSIONS.dimensions['statistic'].hasOwnProperty("indices")) {
                          ini_fxdm[fxdim] = cmecJson.DIMENSIONS.dimensions['statistic']['indices'][0];
                      }
                      else {
                          ini_fxdm[fxdim] = Object.keys(cmecJson.DIMENSIONS.dimensions[fxdim])[0];
                      }
                   } 
                   else {
                      ini_fxdm[fxdim] = Object.keys(cmecJson.DIMENSIONS.dimensions[fxdim])[0];
                   }
               }


               tabTreeJson = lmt_tool.cmec2tab_json(cmecJson, ini_xdim, ini_ydim, ini_fxdm, 1);

               if (Object.keys(tabTreeJson[0]).includes('_children')) {
                  tabOption.dataTreeCollapseElement = "";
                  tabOption.dataTreeExpandElement = "";
                  isTreeTable = 1;
               }
               else{
                  tabOption.dataTreeCollapseElement = "<span></span>";
                  tabOption.dataTreeExpandElement = "<span></span>";
                  isTreeTable = 0;
               }

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
               txcol = "black";
               let lmtTitleFormatterParams = {"bgcol":bgcol, "ftsty":ftsty, "ftwgt":ftwgt, "txdec":txdec, "color":txcol};
               grpsFirstCol.length = 0;
               tabOption.columns = setTabColumns(tabTreeJson, addBottomTitle=false, firstColIcon, lmtTitleFormatterParams, ini_xdim, ini_ydim, ydimField);


               // baseUrl
               if (cmecJson.hasOwnProperty("SETTINGS")) {
                   if (cmecJson.SETTINGS.hasOwnProperty("baseUrl")) {
                       baseUrl = cmecJson.SETTINGS.baseUrl;
                   }
               }

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

     //document.getElementById('mytab').style.width = (320+(tabOption.columns.length-1)*28).toString()+'px';
     document.getElementById('mytab').style.width = (400+(tabOption.columns.length-1)*30).toString()+'px';


     if (_config.udcScreenHeight == 0){
         toggleScreenHeight(false);
     }


     try{
        toggleTooltips(false);

        table = new Tabulator("#dashboard-table", tabOption);
        draw_legend();
     }
     catch(err){
        alert('Error when rending the table:', err.message);
     }

     //try{
        if (Object.keys(_config).includes('udcDimSets') && Object.keys(_config.udcDimSets).includes('x_dim') && 
                                                           Object.keys(_config.udcDimSets).includes('y_dim')){
            var xDimName = _config.udcDimSets.x_dim;
            var yDimName = _config.udcDimSets.y_dim;
        }

        else {
            var xDimName = cmecJson.DIMENSIONS.json_structure[0];
            var yDimName = cmecJson.DIMENSIONS.json_structure[1];
        }

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
     //}
     //catch(err){
     //   alert('Error when handling the table:', err.message);
     //}
     // udc 
     //
     if (_config.hasOwnProperty("udcNormAxis")) {

         switch (_config.udcNormAxis.toLowerCase()) {
            case "x": case "col":
                $('.scarow').prop('checked', false);
                $('.scacol').prop('checked', true);
                break;
            case "y": case "row":
                $('.scarow').prop('checked', true);
                $('.scacol').prop('checked', false);
                break;
            default:
                console.log("UDEB: error setting in udcNormAxis");
                break;
         }
     }

     if (_config.hasOwnProperty("udcNormType")) {
         switch (_config.udcNormType.toLowerCase()) {
            case "standarized":
                $('#select-choice-mini-sca').val("1").trigger('change');
                break;
            case "normalized[-1:1]":
                $('#select-choice-mini-sca').val("2").trigger('change');
                break;
            case "normalized[0:1]":
                $('#select-choice-mini-sca').val("3").trigger('change');
                break;
            default:
                console.log("UDEB: error setting in udcNormType");
                break;
         }
     }

     if (_config.hasOwnProperty("udcColorMapping")) {
         switch (_config.udcColorMapping.toLowerCase()) {
            case 'ilamb':
                $('#select-choice-mini-map').val("0").trigger('change');
                //$('#select-choice-mini-map').val("0");
                //$('#select-choice-mini-map').trigger('change.select2');
                break;
            case 'linear':
                $('#select-choice-mini-map').val("1").trigger('change');
                break;
            case 'linear reverse':
                $('#select-choice-mini-map').val("2").trigger('change');
                break;
            default:
                console.log("UDEB: error setting in udcColorMapping");
                break;
         }
     }

     if (_config.hasOwnProperty("udcBaseUrl")) {
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


function menuShowHide(xDim, yDim, menuReset) {

     //trying to reset scaling and normalizing part
     //
     //what is difference between chang and change.select2?
     //mxu$('.scarow').prop('checked', true);
     //mxu$('.scacol').prop('checked', false);
     //$('#select-choice-mini-sca').val("0").trigger('change');
     //$('#select-choice-mini-map').val("0").trigger('change');
     //mxu$('#select-choice-mini-sca').val("0");
     //mxu$('#select-choice-mini-sca').trigger('change.select2');
     //mxu$('#select-choice-mini-map').val("0");
     //mxu$('#select-choice-mini-map').trigger('change.select2');

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

                   if (cmecJson.DIMENSIONS.dimensions[xDim].hasOwnProperty("indices")) {
                       lmt_tool.add_options(cmecJson.DIMENSIONS.dimensions[xDim].indices, 'hlist');
                   }
                   else {
                       lmt_tool.add_options(Object.keys(cmecJson.DIMENSIONS.dimensions[xDim]), 'hlist');
                   }
               }
               else{
                   lmt_tool.add_options(Object.keys(cmecJson.DIMENSIONS.dimensions[xDim]), 'hlist');
               }

               // need to reset the scaling part
               $('.scarow').prop('checked', true);
               $('.scacol').prop('checked', false);
               $('#select-choice-mini-sca').val("0").trigger('change.select2');
               $('#select-choice-mini-map').val("0").trigger('change.select2');
            }



            $("#".concat(selectIDbyDims[dimn])).off('select2:select');

            $("#".concat(selectIDbyDims[dimn])).on('select2:select', function (e) {

               //mxu $('.scarow').prop('checked', true);
               //mxu $('.scacol').prop('checked', false);
               //mxu $('#select-choice-mini-sca').val("0").trigger('change.select2');
               //mxu $('#select-choice-mini-map').val("0").trigger('change.select2');
               tabTempJson = [];
           
               selId = $(this).attr('id');
               fixedDimsDict[dimBySelectIDs[selId]] = $(this).val();

               function checkDefine(data){
                  return data != undefined;                   
               }


               if( Object.values(fixedDimsDict).every(checkDefine) ) {

                   var cvtTree=1;
                   tabJson = lmt_tool.cmec2tab_json(cmecJson, xDim, yDim, fixedDimsDict, cvtTree);

                   //console.debug('UDEB:', tabJson, Object.keys(tabJson[0]));
                   //console.debug('UDEB:', Object.keys(tabJson[0]).includes("_children"));
                   if (Object.keys(tabJson[0]).includes("_children")) {
                      //tabOption.dataTreeCollapseElement = "<i class='fas fa-minus-square'></i>";
                      //tabOption.dataTreeExpandElement = "<i class='fas fa-plus-square'></i>";
                      tabOption.dataTreeCollapseElement = "";
                      tabOption.dataTreeExpandElement = "";
                      isTreeTable = 1;
                   }
                   else{
                      tabOption.dataTreeCollapseElement = "<span></span>";
                      tabOption.dataTreeExpandElement = "<span></span>";
                      isTreeTable = 0;
                   }

                   tabOption.data = tabJson;

                   bgcol = "#0063B2FF";
                   ftwgt = 500;
                   ftsty = "normal";
                   txdec = "";
                   txcol = "black";

                  
                   let lmtTitleFormatterParams = {"bgcol":bgcol, "ftsty":ftsty, "ftwgt":ftwgt, "txdec":txdec, "color":txcol};
                   grpsFirstCol.length = 0;
                   tabOption.columns = setTabColumns(tabJson, addBottomTitle=false, firstColIcon, lmtTitleFormatterParams, xDim, yDim, 'row_name');

                   //document.getElementById('mytab').style.width = (360+(tabOption.columns.length-1)*28).toString()+'px';
                   document.getElementById('mytab').style.width = (400+(tabOption.columns.length-1)*30).toString()+'px';


                   toggleTooltips(false);

                   //check the switches
                   toggleCellValue(false);
                   toggleBottomTitle(false);
                   toggleTopTitle(false);


                   table.setColumns(tabOption.columns);
                   table.clearData();
                   table = new Tabulator("#dashboard-table", tabOption);

                   // keep the scaling options
                   xscaopt = $('#select-choice-mini-sca').val();
                   xmapopt = $('#select-choice-mini-map').val();

                   //if ($('.scarow').is(':checked'))
                   //console.log(xscaopt, xmapopt, 'mxudeb');
                   //$('.scarow').prop('checked', true);
                   //$('.scacol').prop('checked', false);
                   $('#select-choice-mini-sca').val(xscaopt).trigger('change');
                   $('#select-choice-mini-map').val(xmapopt).trigger('change');
               }
               
            });
         }
     }
}


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
        //return Math.round((origVal + Number.EPSILON) * 100) / 100;
        //return origVal.toFixed(2);
        return normVal.toFixed(2);
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
         //return Math.round((origVal + Number.EPSILON) * 100) / 100;
         //return  origVal.toFixed(2);
         return  normVal.toFixed(2);
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
         //return Math.round((origVal + Number.EPSILON) * 100) / 100;
         return  normVal.toFixed(2);
     }
}

var lmtTitleFormatter = function(cell, titleFormatterParams, onRendered){
     onRendered(function(){

           cell.getElement().parentElement.parentElement.parentElement.style.backgroundColor = titleFormatterParams.bgcol;
           cell.getElement().parentElement.parentElement.parentElement.style.fontStyle = titleFormatterParams.ftsty;
           cell.getElement().parentElement.parentElement.parentElement.style.fontWeight = titleFormatterParams.ftwgt;
           cell.getElement().parentElement.parentElement.parentElement.style.textDecoration = titleFormatterParams.txdec;
           cell.getElement().parentElement.parentElement.parentElement.style.color = titleFormatterParams.color;

     });
     return cell.getValue();
};


var setTabColumns = function(tabJson, addBottomTitle, firstColIcon, lmtTitleFormatterParams, xdim, ydim, ydimField){

    var Columns=[];

    var otherCol = { title:"col_name", field:"col-field", bottomCalc: bottomCalcFunc, headerContextMenu:headerContextMenu, //headerMenu:headerMenu, 
            formatter:lmtCellColorFormatter, formatterParams:{}, titleFormatter:lmtTitleFormatter, titleFormatterParams:lmtTitleFormatterParams, width:30, headerVertical:"flip", resizable:false, headerSort:true};
            //formatter:lmtCellColorFormatter, formatterParams:{}, titleFormatter:lmtTitleFormatter, titleFormatterParams:lmtTitleFormatterParams, width:28, headerVertical:"flip", resizable:false};
            //
    // conflict with savehtml setfirstcolbgcolor fixed in tabulator 4.9
    var firstCol = { title:"row_name", field:"row_field", frozen: true, titleFormatter: firstColIcon, minWidth:380, formatter:setFirstColBgColor, 
            formatterParams:{"xDim":xdim,"yDim":ydim}, headerSort:true, headerContextMenu:firstColHeaderContextMenu };

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

              if (col.title.includes('Mean') || col.title.includes('mean')){
                 bgcol = "white";
              }
              else {
                 bgcol = bgColorGroupFirstRow[k];
              }
              ftwgt = 100;
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
              ftwgt=100;
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
    if (_config.logofile != 'None') {
       return "<img class='infoImage' src='image/".concat(logoFile, "'>"); 
    }
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


var firstColHeaderContextMenu = [
    {
        label:"Toggle Tree Icon",
        action:function(e, column){

           var len = document.getElementsByClassName("tabulator-data-tree-control").length;
           for (let i=0; i < len; i++) { 
               if (document.getElementsByClassName("tabulator-data-tree-control")[i].style.display == "none") {
                  document.getElementsByClassName("tabulator-data-tree-control")[i].style.display="inline-flex"; 
               }
               else {
                  document.getElementsByClassName("tabulator-data-tree-control")[i].style.display="none"; 
               }
           }
        
        }
    },


    {
        label:"Hide Logo",
        action:function(e, column){
           document.getElementsByClassName("infoImage")[0].style.display="none";
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


function getRowTreeStruct(rowClick) {

    var rowTreeStruct;

    rowTreeStruct = rowClick.getCells()[0].getValue().replace(/\s+/g, '');

    if (rowClick.getTreeParent()) {
         rowTreeStruct = getRowTreeStruct(rowClick.getTreeParent()) + "::" + rowTreeStruct; 
    }

    return rowTreeStruct;

}


function newCellClickFunc(e, cell) {
     //var template_test = "metric", "model", "region", "return metric.includes(Relationships)? :metric.replace(/::/g,'/') + metric.split('/')[-1]+'.html?model='+model";

     var thisRow = cell.getRow();
     var thiscol = cell.getColumn();
     var isTree = new Boolean(true);

     var colField = thiscol.getField().replace(/\s+/g,'');
     var rowField = getRowTreeStruct(thisRow)

     xDimName = $('#select-choice-mini-x').val();
     yDimName = $('#select-choice-mini-y').val();

     var input={};
     
     input[xDimName] = colField;
     input[yDimName] = rowField;
     for (dim of cmecJson.DIMENSIONS.json_structure) {
        if (dim != xDimName && dim != yDimName) { 
           selectVal = $('#'.concat(selectIDbyDims[dim])).val();
           input[dim] = selectVal.replace(/\s+/g, '');
        }
     }

     input.metric = input.metric.replace('!!','::');

     var metricList=[];
 
     for (met of Object.keys(cmecJson.DIMENSIONS.dimensions.metric)) {
          if ( ! met.includes('Relationships') ){
              metricList.push(met.replace(/\s+/g,'').replace(/::/g,'/').replace(/!!/g,'/'));
          }
     }

     metricArr = input.metric.split('::');
     metricLen = metricArr.length;

     if (input.metric.includes('Relationships')) {
          var myLink = metricList.filter(s => s.includes(metricArr[1]))[0] + '/' + metricArr[1].split('/')[1] + '.html#Relationships';
     }
     else {
          var myLink = input.metric.replace(/::/g, '/') + '/' + input.metric.split('::')[metricLen-1] + '.html';
     }

     if (baseUrl.slice(-1) != '/') {
          baseUrl = baseUrl + '/'
     }
     console.log('UDEB: mylink', metricArr, myLink, input.metric.split('::'), baseUrl + myLink.concat('?model=', input.model, '&region=', input.region));

     if ( metricLen < 3 ) {
          if (colField == 'row_name') {
              thisRow.treeToggle();
          }
          else {
              alert("Only the lowest level metric is clickable"); 
          }
     }
     else {
          var newWin = window.open(baseUrl + myLink.concat('?model=', input.model, '&region=', input.region));
     }


}

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


             //mx: this part code only worked for IPCC figure as it combined ILAMB and IOMB results
             var isLandBenchMark = 0;
             if (topmet.substring(0,4) == 'Land' || topmet.substring(0,5) == 'Ocean') {


                 if (topmet.substring(0,4) == 'Land') {
                     xtopmet = topmet.replace('Land','');
                     isLandBenchMark = 1;
                 }
                 else {
                     xtopmet = topmet.replace('Ocean','');
                     isLandBenchMark = -1;
                 }

                if (xtopmet == "Relationships"){
                   let metVar = sndmet.split("/")[0];
                   let metSrc = sndmet.split("/")[1];
                   let metOrg = Object.keys(cmecJson.DIMENSIONS.dimensions['metric']).find(a => a.replace(/\s/g, '').includes(metVar));

                   if (isLandBenchMark == 1) {
                       var metAct = metOrg.split("::")[0].replace(/\s/g, '').replace('Land','');
                   }
                   else {
                       var metAct = metOrg.split("::")[0].replace(/\s/g, '').replace('Ocean','');
                   }
                   linkmetric = metAct.concat('/', sndmet, '/', metSrc, '.html#Relationships');
                   console.log('UDEB:', 're', linkmetric);
                }
                else{
                   linkmetric = xtopmet.concat('/', sndmet, '/', rowFirst, '/', rowFirst, '.html');
                   console.log('UDEB:', 'other', linkmetric);

                }
             }
             else {
                if (topmet == "Relationships"){
                   let metVar = sndmet.split("/")[0];
                   let metSrc = sndmet.split("/")[1];
                   let metOrg = Object.keys(cmecJson.DIMENSIONS.dimensions['metric']).find(a => a.replace(/\s/g, '').includes(metVar));
                   let metAct = metOrg.split("::")[0].replace(/\s/g, '');
                   linkmetric = metAct.concat('/', sndmet, '/', metSrc, '.html#Relationships');
                   console.log('UDEB:', 're', linkmetric);
                }
                else{
                   linkmetric = topmet.concat('/', sndmet, '/', rowFirst, '/', rowFirst, '.html');
                   console.log('UDEB:', 'other', linkmetric);

                }
            }

         }


         if (baseUrl.slice(-1) != '/') {
             baseUrl = baseUrl + '/'
         }

         if (linkmetric != undefined) {
             if (isLandBenchMark == 0) {
                 var newWin = window.open(baseUrl.concat(linkmetric,'?model=',linkmodel,'&region=', linkregion));
             }
             else if (isLandBenchMark ==  1) {
                 var newWin = window.open("https://www.ilamb.org/CMIP5v6/ILAMB_AR6/".concat(linkmetric,'?model=',linkmodel,'&region=', linkregion));
             }
             else if (isLandBenchMark == -1) {
                 var newWin = window.open("https://www.ilamb.org/CMIP5v6/IOMB_AR6/".concat(linkmetric,'?model=',linkmodel,'&region=', linkregion));
             }
         }

     }
     else{

         if (cell.getRow().getCell(ydimField).getValue() == cell.getValue()){
            cell.getRow().treeToggle();
         }
         else{
            alert ("Error: clickable cell only for lowest level metric");
         }
     }
}


//background color of first column
function setFirstColBgColor(cell, formatterParams, onRendered){

     var value = cell.getValue();
     onRendered(function(){

        if( !(cell.getRow().getTreeParent()) ){

            if (formatterParams.yDim == "metric"){
                fgFontColor = "#0808ff";
            }
            else if (formatterParams.yDim == "model"){
                fgFontColor = "black"
            }
            else {
                fgFontColor = "black"
            }

            if (formatterParams.yDim == "metric"){
                var chrow = cell.getRow().getTreeChildren();

                if (! (grpsFirstCol.includes(value))){
                    grpsFirstCol.push(value);
                }
                chrow.forEach(function(r){
                    var k = grpsFirstCol.indexOf(value) % bgColorGroup.length;
                    setmetricbg(r, cell, value, bgColorGroup[k], fgFontColor);
                });
            }
            else if (formatterParams.yDim == "model"){
                fgFontColor = "white"
                var k = grpsModelSrc[value] % bgColorGroupFirstRow.length;
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

    $('#cellvalue').prop('checked', true);
    $('#bottomtitle').prop('checked', false);
    $('#toptitle').prop('checked', true);
    $('#tooltips').prop('checked', true);
    if (_config.udcScreenHeight ==0) {
       $('.screenheight').prop('checked', false);
    }
    else{
       $('.screenheight').prop('checked', true);
    }
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



function extractVals(data, arr, kmp, followTree) {
    for ( k of Object.keys(data) ){
        if ( (k != 'row_name') && (k != '_children') ){
           arr.push(data[k]);
           kmp.push(k);
        }

        else if( k == '_children' && followTree == 1) {
           extractVals(data, arr, kmp, followTree);
        }
    }
}


function insertVals(normData, data, newarr, kmp, i) {

    for ( k of Object.keys(data) ){
        if ( (k != 'row_name') && (k != '_children') ){
            normData[k] = [data[k], newarr[i]]
            i = i + 1;
        }
        else if ( k == '_children' ) {
            insertVals(normData._children, data._children, newarr, kmp, i);
        }
    }
}

function normalizer(normMethod, scaDir, data){
    var normData = Object.assign({}, data);

    if ("_children" in data) {
        if (scaDir == 'row') {
           if (data._children.length > 0){
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
    }
    else {
        extractVals(data, arr, kmp, 1);
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

             let j = 0
             for (k of kmp) {
                 j = j + 1
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


    if (scaDir == 'row') {
        var i = 0;
        for (k of kmp) {
            normData[k] = [data[k], normArray[i]];
            i = i + 1;
        }
    }
    else {
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
var numClicks = 1;  // default expand the first level dataTreeStartExpanded:[true, false]

function expandCollapse(action){
    var maxLevs = findMaxLevels() - 1; //the last level always cannot expand

    console.log('UDEB:', 'maxlevs', maxLevs, numClicks, action, timesExpl);
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
        console.log('UDEB:', 'tabredraw');
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
    //-var htmlTable = table.getHtml("active", true);
    //-console.log(htmlTable);
    //-var newwdw = window.open(htmlTable); 
    table.download("html", "test.html",  {style:true});

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

