// major js to control the tabulator for LMT unified dashboard
//
//
//
//
//
// user can change the vales of the following varaibles
//var jsonFileUrl = "https://raw.githubusercontent.com/minxu74/benchmark_results/master/cmec_ilamb_example.json";  // json file containing the benchmark results
jsonFileUrl = "https://raw.githubusercontent.com/minxu74/benchmark_results/master/";
//var jsonFileUrl = "https://raw.githubusercontent.com/minxu74/benchmark_results/master/tab_ilamb_example.json";  // json file containing the benchmark results
const corsProxy = "https://cors-anywhere.herokuapp.com/";  // cors proxy to remove the cors limit
const baseUrl = 'https://www.ilamb.org/CMIP5v6/historical/';


const bgColorGroup = ["#ECFFE6", "#E6F9FF", "#FFECE6", "#EDEDED", "#FFF2E5"];

const bgColorGroupFirstRow = ["#0063B2FF", "#9CC3D5FF"]

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
     ajaxURL: jsonFileUrl,
     ajaxConfig:{
          mode:"cors", //set request mode to cors
          credentials: "same-origin", //send cookies with the request from the matching origin
          headers: {
              "Accept": "application/json", //tell the server we need JSON back
              "X-Requested-With": "XMLHttpRequest", //fix to help some frameworks respond correctly to request
              "Content-type": 'application/json; charset=utf-8', //set the character encoding of the request
              "Access-Control-Allow-Origin": "https://cmorchecker.github.io", //the URL origin of the site making the request
     },},


     movableColumns: true, //enable user movable columns
     //movableRows: true, //enable user movable columns

     //layout:"fitColumns",
     layout:"fitData",
     //tooltips: true,
     tooltips: function(cell){
        //cell - cell component

        //function should return a string for the tooltip of false to hide the tooltip
        //return  cell.getColumn().getField() + " - " + cell.getValue(); //return cells "field - value";
        return Math.round((cell.getValue() + Number.EPSILON) * 100) / 100;
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
     columns:[],

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

     //for (var i=1; i < 10; i++){
     //    $('.select-choice-'.concat(i.toString())).select2({
     //        placeholder: 'Select Dimension',
     //    });
     //}
     table = new Tabulator("#dashboard-table", option={});

     $('.hide-list').on("select2:select", function (e) {
          console.log('inselec');
          //this returns all the selected item
          var items= $(this).val();
          console.log(items);
     
          //Gets the last selected item
          var lastSelectedItem = e.params.data.id;
          console.log(lastSelectedItem);
     
          table.hideColumn(lastSelectedItem) ////toggle the visibility of the "name" column
     });
     
     $('.hide-list').on("select2:unselect", function (e) {
     
          //this returns all the selected item
          var items= $(this).val();
          console.log(items);
     
          //Gets the last selected item
          var lastSelectedItem = e.params.data.id;
          console.log(lastSelectedItem);
     
          table.showColumn(lastSelectedItem) ////toggle the visibility of the "name" column
     });



      var doc = window.document;
      var slideout = new Slideout({
        'panel': doc.getElementById('panel'),
        'menu': doc.getElementById('menu'),
      });

      window.onload = function() {
        document.querySelector('.js-slideout-toggle').addEventListener('click', function() {
          slideout.toggle();
        });
      }
     $('.select-choice-ex').select2({
         placeholder: 'Select examples',
     });
     $('.select-choice-ex').val(null).trigger('change');


     //document.getElementById('select-choice-mini-ex').onchange = function(){

     $('#select-choice-mini-ex').on('select2:select', function() {
         //let jsfUrl = this.options[this.selectedIndex].value;
         let jsfUrl = $(this).val();
         console.log(jsfUrl);
         
         jsfUrl = jsonFileUrl + jsfUrl;
         loadrmtJson(jsfUrl);
     });

});


function hideshowtp(){

     console.log('in showhide');
     if ($("#tooltips[type=checkbox]").is(":checked")) { 
        tabOption.tooltips = function(cell){
        return Math.round((cell.getValue() + Number.EPSILON) * 100) / 100;
        };
     }
     else{
        tabOption.tooltips = false;
     }
     console.log('build!!!!');
     //$("#dashboard-table").tabulator("destroy");

     //table.destroy();
     //table.redraw(true);
     table.clearData();
     table = new Tabulator("#dashboard-table", tabOption);
}


function toggleCellValue() {
     if ($("#cellvalue[type=checkbox]").is(":checked")) { 

         for (x of tabOption.columns) {
             if (x.field != "row_name"){
                 x["formatterParams"] = {"showCellValue":true};
             }
         }

         console.log(tabOption.columns);
     }
     else {

         for (x of tabOption.columns) {
             if (x.field != "row_name"){
                 x["formatterParams"] = {"showCellValue":false};
             }
         }
     }
     table.clearData();
     table = new Tabulator("#dashboard-table", tabOption);

}

function loadrmtJson(jsfUrl) {
   if (jsfUrl !== ""){

     document.getElementById('file').value = '';
     table.clearData();

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
     
              add_options(["model"], "select-choice-mini-x");
              add_options(["metric"], "select-choice-mini-y");
     
              var regions = [];
              var statistics = [];
     
              for (row of data.RESULTS){
                   regions.push(row.scoreboard.split(" ")[row.scoreboard.split(" ").length-1]);
                   statistics.push(row.scoreboard.split(" ").slice(0,-1).join(" "));
              }
     
              regions = [...new Set(regions)];
              statistics = [...new Set(statistics)];
              add_options(regions, 'select-choice-mini-0');
              add_options(statistics, 'select-choice-mini-3');
     
              selectIDbyDims['region'] = 'select-choice-mini-0';
              selectIDbyDims['statistic'] = 'select-choice-mini-3'
              ydimField = "metric";
     
     
              $('.select-choice-x').val('model');
              $('.select-choice-y').val('metric');
              $('#'.concat(selectIDbyDims['region'])).select2({ placeholder: 'Select region',});
              $('#'.concat(selectIDbyDims['region'])).val('global').trigger('change');
     
              $('#'.concat(selectIDbyDims['statistic'])).select2({ placeholder: 'Select region',});
              $('#'.concat(selectIDbyDims['statistic'])).val('Overall Score').trigger('change');
              add_options(Object.keys(tabTreeJson[0]).filter(item => item !== 'row_name' && item !== '_children' && item !== 'metric'), 'hlist');
     
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
   //
   var t = [];
   for (x of (Object.keys(cJson.DIMENSIONS.dimensions.model))){
       t.push(cJson.DIMENSIONS.dimensions.model[x].Source);
   }
   t = [...new Set(t)];
   for (x of (Object.keys(cJson.DIMENSIONS.dimensions.model))){
       grpsModelSrc[x] = t.indexOf(cJson.DIMENSIONS.dimensions.model[x].Source);
   }
   var t = [];
   for (x of Object.keys(cJson.DIMENSIONS.dimensions.metric)){
       if  ( ! (x.includes('::') || x.includes('!!')) ){
           t.push(x);
       }
   }
   grpsTopMetric = [...new Set(t)];


   for (let [i, dimn] of Object.entries(cJson.DIMENSIONS.json_structure)) {
        if (dimn == 'statistic'){
            add_options(cJson.DIMENSIONS.dimensions[dimn].indices, 'select-choice-mini-'.concat(i.toString()));
        }
        else{
            add_options(Object.keys(cJson.DIMENSIONS.dimensions[dimn]), 'select-choice-mini-'.concat(i.toString()));
        }

        selectIDbyDims[dimn] = 'select-choice-mini-'.concat(i.toString());
        dimBySelectIDs['select-choice-mini-'.concat(i.toString())] = dimn;
   }


   // default ilamb, for others need to be rethink of it
   tabTreeJson = cmec2tab_json(cJson, 'model', 'metric', {'region':'global', 'statistic':'Overall Score'}, 1);

   // add options 
   add_options(cJson.DIMENSIONS.json_structure, "select-choice-mini-x");
   add_options(cJson.DIMENSIONS.json_structure, "select-choice-mini-y");

   ydimField = "row_name";

   $('.select-choice-x').val('model');
   $('.select-choice-y').val('metric');
   $('#'.concat(selectIDbyDims['region'])).select2({ placeholder: 'Select region',});
   $('#'.concat(selectIDbyDims['region'])).val('global').trigger('change');

   $('#'.concat(selectIDbyDims['statistic'])).select2({ placeholder: 'Select region',});
   $('#'.concat(selectIDbyDims['statistic'])).val('Overall Score').trigger('change');
   add_options(Object.keys(tabTreeJson[0]).filter(item => item !== 'row_name' && item !== '_children' && item !== 'metric'), 'hlist');

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

}

// load local json files

function loadlocJson() {


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
                   console.log(cmecJson.SCHEMA);
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
              
               for (let [i, dimn] of Object.entries(cmecJson.DIMENSIONS.json_structure)) {
                    if (dimn == 'statistic'){
                        console.log(dimn, cmecJson.DIMENSIONS.dimensions[dimn].indices);
                        add_options(cmecJson.DIMENSIONS.dimensions[dimn].indices, 'select-choice-mini-'.concat(i.toString()));
                    }
                    else{
                        add_options(Object.keys(cmecJson.DIMENSIONS.dimensions[dimn]), 'select-choice-mini-'.concat(i.toString()));
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

               tabTreeJson = cmec2tab_json(cmecJson, ini_xdim, ini_ydim, ini_fxdm, 1);

               // add options 
               add_options(cmecJson.DIMENSIONS.json_structure, "select-choice-mini-x");
               add_options(cmecJson.DIMENSIONS.json_structure, "select-choice-mini-y");
               ydimField = "row_name";
               $('.select-choice-x').val(ini_xdim);
               $('.select-choice-y').val(ini_ydim);

               for (fxdim of Object.keys(ini_fxdm)) {
                   console.log('xxx', fxdim, ini_fxdm[fxdim], selectIDbyDims[fxdim]);
                   $('#'.concat(selectIDbyDims[fxdim])).select2({ placeholder: 'Select '.concat(fxdim)});
                   $('#'.concat(selectIDbyDims[fxdim])).val(ini_fxdm[fxdim]).trigger('change');
               }
               add_options(Object.keys(tabTreeJson[0]).filter(item => item !== 'row_name' && item !== '_children' && item !== 'metric'), 'hlist');

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
        if ($("#tooltips[type=checkbox]").is(":checked")) { 
           tabOption.tooltips = function(cell){
           return Math.round((cell.getValue() + Number.EPSILON) * 100) / 100;
           };
        }
        else{
           tabOption.tooltips = false;
        }

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
                     console.log('x side', xDimName, yDimName);
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
                     console.log('y side', xDimName, yDimName);
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


     fixedDimsDict={};

     for (dimn of Object.keys(selectIDbyDims)) {
         if (xDim == dimn || yDim == dimn){
            $("#".concat(selectIDbyDims[dimn])).val(null).trigger('change');
            $("#".concat(selectIDbyDims[dimn])).select2().next().hide();
         }
         else{
            //null fixedDimsDict
            //
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
                   add_options(cmecJson.DIMENSIONS.dimensions[xDim].indices, 'hlist');
               }
               else{
                   add_options(Object.keys(cmecJson.DIMENSIONS.dimensions[xDim]), 'hlist');
               }
            }


            $("#".concat(selectIDbyDims[dimn])).off('select2:select');

            $("#".concat(selectIDbyDims[dimn])).on('select2:select', function (e) {
               selId = $(this).attr('id');
               fixedDimsDict[dimBySelectIDs[selId]] = $(this).val();

               function checkDefine(data){
                  return data != undefined;                   
               }

               if( Object.values(fixedDimsDict).every(checkDefine) ) {

                   var cvtTree=1;

                   console.log(xDim, yDim, 'before call');
                   console.log(fixedDimsDict);
                   tabJson = cmec2tab_json(cmecJson, xDim, yDim, fixedDimsDict, cvtTree);

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


                   if ($("#tooltips[type=checkbox]").is(":checked")) { 
                      tabOption.tooltips = function(cell){
                      return Math.round((cell.getValue() + Number.EPSILON) * 100) / 100;
                      };
                   }
                   else{
                      tabOption.tooltips = false;
                   }
                   table = new Tabulator("#dashboard-table", tabOption);
                   //table.setData(tabJson);
                   //table.setColumns(tabOption.columns);
                   //table.redraw();
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


var lmtCellColorFormatter = function(cell, formatterParams, onRendered){
     var clr = "#808080";
     let nc = cmap.length;
     if(cell.getValue() > -900){
         var ae = Math.abs(cell.getValue());
         var ind;
         if(ae>=0.25){
              ind = Math.round(2*cell.getValue()+4);
         }else{
              ind = Math.round(4*cell.getValue()+4);
         }
         ind = Math.min(Math.max(ind,0),nc-1);
         clr = cmap[ind];
     }
     cell.getElement().style.backgroundColor = clr;

     if (formatterParams.showCellValue && cell.getValue() > -900){
         cell.getElement().style.color = "black";
        return Math.round((cell.getValue() + Number.EPSILON) * 100) / 100;
     }
};



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
            formatter:lmtCellColorFormatter, titleFormatter:lmtTitleFormatter, titleFormatterParams:lmtTitleFormatterParams, width:28, headerVertical:"flip", resizable:false};
    var firstCol = { title:"row_name", field:"row_field", frozen: true, titleFormatter: firstColIcon, minWidth:320, formatter:setFirstColBgColor, formatterParams:{"xDim":xdim,"yDim":ydim} };

    firstCol.title = ydim.concat('/',xdim);
    //firstCol.field = 'row_name';
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
              txcol = "white";
           }
           else if (xdim == "metric"){

              for (let [idxmet, topmet] of grpsTopMetric.entries()){
                  if (x.includes(topmet)){
                      var k = idxmet %  bgColorGroup.length;
                      bgcol =  bgColorGroup[k];
                  }
              }
              console.log('xxx');
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
    return "<img class='infoImage' src='https://avatars0.githubusercontent.com/u/36375040?s=200&v=4'>";
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
     console.log('tree', thisrow.getTreeChildren());
     //
     if ( thisrow.getTreeChildren().length == 0 ){

         var colField = thiscol.getField();
         //var rowFirst = thisrow.getCell('row_name').getValue();
         var rowFirst = thisrow.getCell(ydimField).getValue();

         console.log($('#select-choice-mini-x').val());
         console.log($('#select-choice-mini-y').val());

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
                  console.log(dim, selectVal);

                  if (dim == 'model'){linkmodel = selectVal;}
                  if (dim == 'region'){linkregion = selectVal;}
                  if (dim == 'metric'){
                      if (selectVal.includes('!!')) {
                          linkmetric = selectVal.replace(/\s/g, '').replace('::','/').replace('!!','/');
                          var benmarkname = selectVal.split('!!').slice(-1)[0];
                          linkmetric = linkmetric.concat('/', benmarkname);
                          console.log(linkmetric);
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

             console.log('link', linkmetric);

         }


         console.log('click cell', colField, rowFirst);

         if (linkmetric != undefined) {
             console.log(linkmetric);
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

            console.log(value, 'xxxxx');

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
                setmetricbg(cell.getRow(), cell, value, bgColorGroupFirstRow[k], fgFontColor);
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
    // your logic here`enter code here`
    //const cb = document.querySelector('input[name="colorblind"]');
    
    //cb.checked = "true";
    //console.log('xxx', cb, cb.value);
    $('#colorblind').prop('checked', true);
    $('#file').val('');
    $('#cellvalue').prop('checked', false);
    isJsonReady = false;
});


//function expandCollapse(action){
//  if (action == "expand"){
//  	tabOption.dataTreeStartExpanded = [true, false];
//  }
//  else{
//  	tabOption.dataTreeStartExpanded = false;
//  }
//  table = new Tabulator("#dashboard-table", option=tabOption);
//}

