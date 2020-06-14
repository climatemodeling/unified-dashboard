// major js to control the tabulator for LMT unified dashboard
//
//
//
//
//
// user can change the vales of the following varaibles
const jsonFileUrl = "output.json";  // json file containing the benchmark results
const corsProxy = "https://cors-anywhere.herokuapp.com/";  // cors proxy to remove the cors limit
const baseUrl = 'https://www.ilamb.org/CMIP5v6/historical/';



// please do not make changes below
if (jsonFileUrl.includes("http")){
    jsonFileUrl = corsProxy + jsonFileUrl;
}

//global variables
var cmecJson;
var tabJson;
var tabTreeJson;
var table;

var selectIDbyDims = {};
var dimBySelectIDs = {};


var fixedDimsDict = {};

var tabOption = {
     dataTree:true,
     dataTreeStartExpanded:[true, false],

     reactiveData:true,

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
     tooltips: true,

     columnMinWidth:10,
     nestedFieldSeparator:"|", 


     //dataTreeBranchElement:false, //hide branch element
     dataTreeChildIndent:15, //indent child rows by 15 px
    
     selectable: true,
     rowContextMenu:rowMenu,

     cellClick:cellClickFuncGenetic,
     columns:[],

};


$(document).ready(function() {
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
});


$.getJSON( jsonFileUrl, function( data ) {
     cmecJson = data;
     var i = 1;
     for (dimn of cmecJson.DIMENSIONS.json_structure) {
          if (dimn == 'statistic'){
              add_options(cmecJson.DIMENSIONS.dimensions[dimn].indices, 'select-choice-mini-'.concat(i.toString()));
          }
          else{
              add_options(Object.keys(cmecJson.DIMENSIONS.dimensions[dimn]), 'select-choice-mini-'.concat(i.toString()));
          }

          selectIDbyDims[dimn] = 'select-choice-mini-'.concat(i.toString());
          dimBySelectIDs['select-choice-mini-'.concat(i.toString())] = dimn;

          i++;
     }


     // default ilamb, for others need to be rethink of it
     tabTreeJson = cmec2tab_json(data, 'model', 'metric', {'region':'global', 'statistic':'Overall Score'}, 1);

     // add options 
     add_options(cmecJson.DIMENSIONS.json_structure, "select-choice-mini-x");
     add_options(cmecJson.DIMENSIONS.json_structure, "select-choice-mini-y");

     $('.select-choice-x').val('model');
     //$('.select-choice-x').trigger('change');
     $('.select-choice-y').val('metric');
     //$('.select-choice-y').trigger('metric');

     $('#'.concat(selectIDbyDims['region'])).select2({ placeholder: 'Select region',});
     $('#'.concat(selectIDbyDims['region'])).val('global').trigger('change');

     $('#'.concat(selectIDbyDims['statistic'])).select2({ placeholder: 'Select region',});
     $('#'.concat(selectIDbyDims['statistic'])).val('Overall Score').trigger('change');

     console.log(Object.keys(tabTreeJson[0]).filter(item => item !== 'row_name' && item !== '_children'));
     add_options(Object.keys(tabTreeJson[0]).filter(item => item !== 'row_name' && item !== '_children'), 'hlist');

     


     // set tab column
     //
     tabOption.data = tabTreeJson;
     bgcol = "#0063B2FF";
     ftwgt = 500;
     ftsty = "normal";
     txdec = "";
     txcol = "black";
     let lmtTitleFormatterParams = {"bgcol":bgcol, "ftsty":ftsty, "ftwgt":ftwgt, "txdec":txdec, "color":txcol};
     tabOption.columns = setTabColumns(tabTreeJson, addBottomTitle=false, firstColIcon, lmtTitleFormatterParams, 'model', 'metric');

     // trigger an event to indicate that the json is ready
     $(document).trigger('jsonReady');
});


$(document).on('jsonReady', function() {

     document.getElementById('mytab').style.width = (320+(tabOption.columns.length-1)*28).toString()+'px';
     table = new Tabulator("#dashboard-table", tabOption);
     draw_legend();


     var xDimName='model';
     var yDimName='metric';
     //menuShowHide(xDimName, yDimName);

     $('#select-choice-mini-x').on('select2:select', function (e) {
          var selectedValue = $(this).val(); // get the selected value
          xDimName = selectedValue;
          if (xDimName != undefined && yDimName != undefined) {

               if (xDimName == yDimName){
                  alert (" x and y must be different ");
               }
               else {
                  console.log('x side', xDimName, yDimName);
                  menuShowHide(xDimName, yDimName);
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
                  menuShowHide(xDimName, yDimName);
               }
          }
     }

     
});


function menuShowHide(xDim, yDim) {

     fixedDimsDict={};

     for (dimn of Object.keys(selectIDbyDims)) {


         if (xDim == dimn || yDim == dimn){
            $("#".concat(selectIDbyDims[dimn])).select2().next().hide();
         }
         else{
            //null fixedDimsDict
            //
            console.log('reset dim', dimn, 'x', xDim, 'y', yDim);
            fixedDimsDict[dimn] = null;

            //clear selction 
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
                   tabOption.columns = setTabColumns(tabJson, addBottomTitle=false, firstColIcon, lmtTitleFormatterParams, 'model', 'metric');

                   document.getElementById('mytab').style.width = (320+(tabOption.columns.length-1)*28).toString()+'px';
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


var lmtCellColorFormatter = function(cell){
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
};



var lmtTitleFormatter = function(cell, titleFormatterParams, onRendered){
     onRendered(function(){

           cell.getElement().parentElement.parentElement.style.backgroundColor = titleFormatterParams.bgcol;
           cell.getElement().parentElement.parentElement.style.fontStyle = titleFormatterParams.ftsty;
           cell.getElement().parentElement.parentElement.style.fontWeight = titleFormatterParams.ftwgt;
           cell.getElement().parentElement.parentElement.style.textDecoration = titleFormatterParams.txdec;
           cell.getElement().parentElement.parentElement.style.color = titleFormatterParams.color;

           //cell.getElement()["style"] = {};
           //cell.getElement()["style"]["color"] = titleFormatterParams.color;

           //cell.getElement().parentElement.parentElement.style.fontVariant = "small-caps";
     });
     return cell.getValue();
};


var setTabColumns = function(tabJson, addBottomTitle, firstColIcon, lmtTitleFormatterParams, xdim, ydim){

    var Columns=[];

    var otherCol = { title:"col_name", field:"col-field", cssClass:"bgcolcor", bottomCalc: bottomCalcFunc, headerContextMenu:headerContextMenu, //headerMenu:headerMenu, 
            formatter:lmtCellColorFormatter, titleFormatter:lmtTitleFormatter, titleFormatterParams:lmtTitleFormatterParams, width:28, headerVertical:"flip", resizable:false};
    var firstCol = { title:"row_name", field:"row_field", frozen: true, titleFormatter: firstColIcon, minWidth:320 };

    firstCol.title = ydim.concat('/',xdim);
    firstCol.field = 'row_name';

    Columns.push(firstCol);

    var col={};
    for (x of Object.keys(tabJson[0])){
        if ( x != 'row_name' && x != '_children'){
           col= Object.assign({}, otherCol);

           col.title=x;
           col.field=x;
           col.bottomCalcParams=x;

           ftwgt=500;
           ftsty="normal";
           txdec="";
           txcol="black";
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
         var rowFirst = thisrow.getCell('row_name').getValue();

         console.log($('#select-choice-mini-x').val());
         console.log($('#select-choice-mini-y').val());

         xDimName = $('#select-choice-mini-x').val();
         yDimName = $('#select-choice-mini-y').val();


         let linkmodel;
         let linkmetric;

         let dims = cmecJson.DIMENSIONS.json_structure;

         for (dim of dims){
              selectVal = $('#'.concat(selectIDbyDims[dim])).val();
              if (selectVal != undefined && selectVal != null && selectVal != ''){
                  console.log(dim, selectVal);

                  if (dim == 'model'){linkmodel = selectVal;}
                  if (dim == 'region'){linkmodel = selectVal;}
                  if (dim == 'metric'){
                      if (selectVal.includes('!!')) {
                          linkmetric = selectVal.replace(/\s/g, '').replace('::','/').replace('!!','/');
                          var benmarkname = selectVal.split('!!').slice(-1)[0];
                          linkmetric = linkmetric.concat('/', benmarkname);
                          console.log(linkmetric);
                      }
                      else{
                          alert ("clickable cell only for lowest level metric");
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

                 alert ("clickable cell only for lowest level metric");

             }
         }

         if ( yDimName == 'metric' ) {

             var topmet = thisrow.getTreeParent().getTreeParent().getCell('row_name').getValue().replace(/\s/g, '');
             var sndmet = thisrow.getTreeParent().getCell('row_name').getValue().replace(/\s/g, '');
             linkmetric = topmet.concat('/', sndmet, '/', rowFirst, '/', rowFirst);

             console.log('link', linkmetric);

         }


         console.log('click cell', colField, rowFirst);

         if (linkmetric != undefined) {
             console.log(linkmetric);
             var newWin = window.open(baseUrl.concat(linkmetric,'.html#',linkmodel,'&region=', linkregion));
         }

         //var newWin= window.open("https://www.ilamb.org/CMIP5v6/historical/EcosystemandCarbonCycle/BurnedArea/GFED4S/GFED4S.html");
     }
}
