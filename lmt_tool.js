
//mxu define some dimension declaratiopn should be provided by json in future
//
//

var dimensionJSON = ["metric", "region", "scoreboard", "model"];

var defaultfixDims={"metric":"Ecosystem and Carbon Cycle", "region": "global", "scoreboard": "Overall Score", "model": "CESM2"};

// color used default
const PuOr = ['#b35806','#e08214','#fdb863','#fee0b6','#f7f7f7','#d8daeb','#b2abd2','#8073ac','#542788'];
const GnRd = ['#b2182b','#d6604d','#f4a582','#fddbc7','#f7f7f7','#d9f0d3','#a6dba0','#5aae61','#1b7837'];
var cmap = PuOr;


function resolve_tree(tabJson){

   var treeJson=[];

   const flattenJson = Object.assign(tabJson, {});

   for (rowline of flattenJson){
       var newline = {};
       if (! (rowline.row_name.includes('::')) && ! (rowline.row_name.includes('!!'))){
          newline = rowline; 
          newline["_children"]=[];
          parentName = rowline.row_name;

          var findc  = flattenJson.filter(obj => obj.row_name.includes(parentName.concat('::')) && !obj.row_name.includes('!!'));

          var findchild = JSON.parse(JSON.stringify(findc));

          for (chd of findchild){
               chd["_children"] = [];
               chd.row_name = chd.row_name.split('::').slice(-1)[0];
               childName = chd.row_name;
               var findg = flattenJson.filter(obj => obj.row_name.includes(childName.concat('!!')));
               var findgrandchild = JSON.parse(JSON.stringify(findg));

               for (grd of findgrandchild){
                   grd.row_name = grd.row_name.split('!!').slice(-1)[0];
               }
               chd["_children"] = findgrandchild;

          }
          newline["_children"] = findchild;

          console.log('yyy', rowline.row_name, parentName, findchild);
          
          treeJson.push(newline);
       }
   }


   console.log(treeJson);

   return treeJson;
}


// contains plain js to handle json files in different format
// CMEC json format
// ILAMB json format, need other index.html to determine the model names
// tabulator json format can be used by tabulator.js directrly



function cmec2tab_json(cmecJson, dimX, dimY, fixedDimsDict, convertTree){
// convert cmec json (output.json) to tabulator json format 
//

  if (cmecJson.DIMENSIONS.json_structure.includes(dimX) && cmecJson.DIMENSIONS.json_structure.includes(dimY)){
     fixedDims = Object.keys(fixedDimsDict);

     console.log(fixedDims.length, 'xxx');
     if (fixedDims.length + 2 !== cmecJson.DIMENSIONS.json_structure.length){
        alert("the size of fixed dimensions not consistent with the json file"); 
     }
     else{

         let prevJson = Object.assign(cmecJson.RESULTS, {});
         for (fixedDim of fixedDims){
            let nextJson={};
            switch (fixedDim){
              case 'region':
                 console.log(fixedDim)
                 console.log('xxx', fixedDimsDict);
                 nextJson[fixedDimsDict['region']] = prevJson[fixedDimsDict['region']];
                 console.log(nextJson);
                 break;
              case 'model':
                 console.log(fixedDim)
                 for (reg of Object.keys(prevJson)){
                    nextJson[reg] = {};
                    nextJson[reg][fixedDimsDict['model']] = prevJson[reg][fixedDimsDict['model']];
                 }
                 break;
              case 'metric':
                 console.log(fixedDim)
                 for (reg of Object.keys(prevJson)){
                    nextJson[reg] = {};
                    for (mod of Object.keys(prevJson[reg])){
                       nextJson[reg][mod]={};
                       nextJson[reg][mod][fixedDimsDict['metric']] = prevJson[reg][mod][fixedDimsDict['metric']];
                    }
                 }
                 break;
              case 'statistic':
                 console.log(fixedDim);
                 console.log(nextJson);
                 console.log(prevJson);
                 
                 for (reg of Object.keys(prevJson)){
                    nextJson[reg] = {};
                    for (mod of Object.keys(prevJson[reg])){
                       nextJson[reg][mod]={};
                       for (met of Object.keys(prevJson[reg][mod])){
                           //console.log(prevJson[reg][mod][met], met, fixedDimsDict['statistic']);
                           nextJson[reg][mod][met] = {};
                           nextJson[reg][mod][met][fixedDimsDict['statistic']] = prevJson[reg][mod][met][fixedDimsDict['statistic']];
                       }
                    }
                 }
                 break;
              default:
                 alert("fixed dimension not exist in the json file");
            }

            prevJson = Object.assign(nextJson, {});

            console.log('next', nextJson);
            console.log('prev', prevJson);

         }
         console.log(prevJson);
         // now write to tab json
         //
         // dimX and dimY
         let ix = cmecJson.DIMENSIONS.json_structure.indexOf(dimX);
         let iy = cmecJson.DIMENSIONS.json_structure.indexOf(dimY);

         console.log(ix, iy);

         let dmnms = cmecJson.DIMENSIONS.json_structure;
         let dmarr = [];
         for (dm of dmnms){
             if (dm === dimX || dm == dimY){
                dmarr.push(dm);
             }
             if (dm in fixedDimsDict){
                dmarr.push(fixedDimsDict[dm]);
             }
         }

         console.log(dmarr, dimX, dimY);

         // xkeys and ykeys
         let sdict = prevJson;
         for (dm of dmarr){

             if (! (dimX === dm) && ! (dimY === dm)){
                sdict = sdict[dm];
             }

             if (dimX === dm){
                xKeys = Object.keys(sdict)
                sdict = sdict[xKeys[0]];
             }

             if (dimY === dm){
                yKeys = Object.keys(sdict)
                sdict = sdict[yKeys[0]];
             }
         }


         //console.log(xKeys);
         //console.log(yKeys);
         let tabJson = [];
         let tab_row = {};
         for (yk of yKeys){
             tab_row = {};
             tab_row['row_name'] = yk
             for (xk of xKeys){
                  sdict = prevJson;
                  for (dm of dmarr){
                       if (dimX === dm){
                           sdict=sdict[xk];
                       }
                       else if (dimY === dm){

                           if (yk in sdict){
                               sdict=sdict[yk];
                           }
                           else{
                               sdict={};
                            }
                       }
                       else{
                           //console.log('x', dm, xk, yk);
                           //console.log('x', sdict);

                           if (dm in sdict){
                               sdict=sdict[dm];
                           }
                           else{
                               sdict=null;
                           }

                       }
                  }
                  tab_row[xk] = sdict;   
             }
             tabJson.push(tab_row);
         }
         console.log(tabJson);

         console.log(dimY);
         if (dimY == 'metric' && convertTree == 1){

             tabJson = resolve_tree(tabJson);

         }

         return tabJson;
     }
  }
  else{
     alert("the dimensions X and Y not in the json file");
  }
}


function transpose_tab_json(data){
              var importedJSON = data;
              var newjson = [];
              var newindx = {};
              var comprow = {};
              var newvars = [];
              function filter(element, index, array){
                      child = element._children;
                      for (var i=0; i < child.length; i++) {
                           model = Object.keys(child[i]);
                           value = Object.values(child[i]);
                           seasn = child[i]['metric'];
                           varnm = element.metric.trim();

                           for (var j=0; j < model.length; j++) {
                              if (model[j] != 'metric') {
                                 cmpkey =  seasn.concat(model[j].trim())
                                 if ( !(cmpkey in comprow) ){
                                    comprow[cmpkey] = {[varnm]:value[j]};
                                 }
                                 else{
                                    comprow[cmpkey][varnm]=value[j];
                                 }
                              
                              }
                           }

                      }
              }
              var jx=0;
              for (var k=0; k < importedJSON.length; k++){
                   var element = importedJSON[k];
                   var child=element._children
                   var varnm = element.metric.trim();
                   newvars.push(varnm);
                   for (var j=0; j < child.length; j++){
                       modelnames = Object.keys(child[j]);
                       for (var i=0; i < modelnames.length; i++) {
                           var new_row = {};
                           if (modelnames[i] != 'metric') {
                              if ( !(modelnames[i].trim() in newindx) ){
                                    //new_row['model'] = modelnames[i].trim();
                                    new_row['metric'] = modelnames[i].trim();
                                    //new_row['season'] = 'ANN';
                                    new_row['_children'] = [];
                                    newindx[new_row['metric']] = jx;
                                    jx = jx +1;
                                    newjson.push(new_row);
                              }
                           }
                       }
                   }
              }
              const uniq = new Set(newvars);
              newvars = [...uniq];
              console.log(newjson);

              console.log(newindx);
              importedJSON.forEach(filter);
              console.log(Object.keys(comprow));

              compkey=Object.keys(comprow);

              for (var i=0; i < compkey.length; i++) {
                  mykey = compkey[i];
                  modnm = mykey.slice(3,);
                  seanm = mykey.slice(0,3);
                  jx = newindx[modnm];

                  var newdict={};
                  //newdict['model'] = modnm;
                  newdict['metric'] = seanm;
                  newdict['season'] = seanm;
                  for (x of newvars){
                      if (x in comprow[compkey[i]]){
                         newdict[x] = comprow[compkey[i]][x];
                      }
                      else{
                         newdict[x] = -999.;
                      }

                      newjson[jx][x] = -999.;
                  }

                  //newjson[jx]._children=comprow[compkey[i]];
                  newjson[jx]._children.push(newdict);
                  console.log(jx, modnm, newjson[jx]);
                  //console.log(comprow[compkey[i]]);
              }
              console.log(newvars);

              return newjson;
};


function add_options(optionList, selectID){

    var sel = document.getElementById(selectID);

    //for (var i = sel.options.length-1; i >= 0; i--) {
    //    sel.remove(i);
    //}
    for (x of optionList){
        var opt = document.createElement('option');
        opt.value = x;
        opt.text = x;
        sel.add(opt);
    }
}

//flatten data tree of a js dictionary object
// parentData: a js dictionary {key1:value1, key2:value2, ... treekw:[obj, obj, ...]}
// treekw: data tree keyword

function getChildfromParent(parentData, treekw, gpMetric){
      var newData=[];
      if (treekw in parentData){

          var newrow={};
          for (key of Object.keys(parentData)){
              if ( key !=treekw ){
                  newrow[key] = parentData[key];
              }
          }
          var tmp = newrow['metric'];
          newrow['metric'] = {}
          newrow['metric'] = {"name":tmp, "parent":gpMetric, "children":[]}



          childrenData = parentData[treekw];
          for (child of childrenData){
              newrow.metric.children.push(child.metric);
          }
          newData.push(newrow);

          for (child of childrenData){
              var cdata = getChildfromParent(child, treekw, tmp);
              newData = newData.concat(cdata);
          }
          return newData;
      }
      else{
          if ( (parentData != {}) ){
              var newrow={};
              for (key of Object.keys(parentData)){
                  if ( key !=treekw ){
                      newrow[key] = parentData[key];
                  }
              }
              var tmp = newrow['metric'];
              newrow['metric'] = {}
              newrow['metric'] = {"name":tmp, "parent":gpMetric, "children":[]}
              newData.push(newrow);
              return newData;
          }
      }
}

function flatten(data, treekw){
    var dataFlatten = [];
    for (p of data){
        var newdata = getChildfromParent(p, treekw, "top");
        dataFlatten = dataFlatten.concat(newdata);
    }
    return dataFlatten;
}



function transpose(dataFlatten, scoreboard){
    var dataTranspose = [];
    var xnames={};
    for (data of dataFlatten) {
        if (data.scoreboard == scoreboard){
            for (key of Object.keys(data)){
                if (key != "metric" && key != "scoreboard"){
                   if (typeof xnames[key] === 'undefined'){
                      xnames[key]={};
                   }
                   xnames[key][data.metric.parent.concat('/', data.metric.name)] = data[key];
                }
            }
        }
    }

    for (key of Object.keys(xnames)){
       var newrow = Object.assign({}, xnames[key], {"scoreboard": scoreboard, "metric": key});
       dataTranspose.push(newrow);
    }

    return dataTranspose;

}



//flatten
function removefirstlevelchildren(data, mergename){
    var newdata=[];

    for (p of data){
       children = p._children;
       for (c of children){

            cc = Object.assign({},c);
            cc[mergename] = p[mergename].concat('::' , c[mergename]);
            newdata.push(cc);
       }

    }
    return newdata;
}


function filterScoreboard(data, scoreboard){
   var newdata = [];
   for (d of data){
      if (d.scoreboard == scoreboard){
         newdata.push(d); 
      }
   }
   return newdata;
}



//apply it on the flatten json
function filterGeneric(data, xdim, ydim){
   var defaultfixDims={"metric":"Ecosystem and Carbon Cycle", "region": "global", "score": "Overall Score", "model": "CESM2"};
   var filterData=[];

   var tmpData=data;

   if ((xdim == "metric" && ydim == "model") || (xdim == "model" && ydim == "metric")){

       console.log(defaultfixDims['score']);
       scoreboard = defaultfixDims['score'].concat(' ', defaultfixDims['region']);
       filterData = filterScoreboard(data, scoreboard);

       console.log(filterData);
       return filterData;
   }

   else{
       var xdata = tmpData;
       if (xdim != "model" && ydim != "model"){
          tmpData=[];
          var newrow={};
          for (d of xdata){
               newrow["metric"] = d.metric;
               newrow["scoreboard"] = d.scoreboard;
               newrow[defaultfixDims["model"]] = d[defaultfixDims["model"]];
               tmpData.push(Object.assign({},newrow));
          }
          var xdata = tmpData;
          console.log('model');
       }

       if (xdim != "region" && ydim != "region"){
          tmpData=[];
          var newrow={};
          for (d of xdata){
              if (d.scoreboard.includes(defaultfixDims['region'])){
                 newrow=Object.assign({},d);
                 tmpData.push(newrow);
              }
          }
          var xdata = tmpData;
          console.log('region');
       }

       if (xdim != "score" && ydim != "score"){
          var newrow={};
          tmpData=[];
          for (d of xdata){
              if (d.scoreboard.includes(defaultfixDims['score'])){
                 //newrow=Object.assign({},d);
                 tmpData.push(Object.assign({},d));
              }
          }
          var xdata = tmpData;
          console.log('score');
       }


       if (xdim != "metric" && ydim != "metric"){
          var newrow={};
          tmpData=[];
          for (d of xdata){
              if (d.metric.name == defaultfixDims['metric']){
                 newrow=Object.assign({},d);
                 tmpData.push(newrow);
              }
          }
          var xdata = tmpData;
       }

       filterData=xdata;
       console.log(filterData);
       return filterData;
   }
}

function addAttribute(data){


    var newdata=data;
    var myatt="season";

    if (typeof newdata.length === 'undefined'){
       newdata[myatt] = newdata.metric;
       return newdata;
    }

    else{
       for (p of newdata){
          p[myatt] = p.metric;

          if ("_children" in p){
             children = p._children;
             for (c of children){
                c = addAttribute(c, myatt);
             }
          }
       }  
    }

    console.log(newdata);
    return newdata;
}



function setColumns(rowDict, addBottomTitle, myIcon, xdim, ydim){
    var Columns=[];
    var coltemplate = { title:"bcc-csm1-1", field:"bcc-csm1-1", cssClass:"mycolcor2" , bottomCalc:mytest,
            formatter:myColorFormatter, titleFormatter:myTcolor, titleFormatterParams:{bgcol:"#0063B2FF"}, width:28, headerVertical:"flip", resizable:false};
    var titlecol={title:"METRICS/MODELS",  field:"metric", frozen: true, titleFormatter: myIcon};
    titlecol.title = ydim.concat('/',xdim);


    if (ydim == "score" || ydim == "region"){
       titlecol.field = "scoreboard"; 
    }

    if (ydim == "metric"){
       titlecol.field = 'metric|name'; 
    }

    Columns.push(titlecol);

    var col={};
    for (x of Object.keys(rowDict)){
        if ( x != 'metric' && x != 'scoreboard' && x != '_children'){
           col= Object.assign({}, coltemplate);
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
}


//followings are for tabulator custom functions
//
//
//
var mytest = function(values, data, calcParams){
    //values - array of column values
    //data - all table data
    //calcParams - params passed from the column definition object
    //var calc = 0;
    return calcParams;
}


//       cellClick:function(e, cell){

var cellClickFuncTrans = function(e, cell){
    //e - the click event object
    //cell - cell component

    var thisrow = cell.getRow();
    var thiscol = cell.getColumn();

    var isTree = new Boolean(true);


    console.log(typeof thisrow.getData()["metric"]);

    if (typeof thisrow.getData()["metric"] === 'undefined'){

        var lastRow = true;
        var html_base="https://pcmdi.llnl.gov/pmp-preliminary-results/interactive_plot/portrait_plot/mean_clim/taylor_diagram/cmip5/historical/v20191009/";
        var modname = thiscol.getField().trim()

        var html_link = html_base.concat('/', modname, '_cmip5_historical_taylor_4panel_all_global.png');

        var wdw2 = window.open(html_link);
    }

    else{
        var html_base="https://pcmdi.llnl.gov/pmp-preliminary-results/graphics/mean_climate/cmip5/historical/clim/v20191009/"

        console.log(thisrow.getData());
        if (thisrow.getData()["metric"].trim().toLowerCase().includes("::")){
            isTree = false;
        }

        if (isTree){
            var rowparent = thisrow.getTreeParent();
        }
        else{
            var rowparent = thisrow;
        }

        console.log('xx', typeof rowparent.getData === 'function');

        if(typeof rowparent.getData === 'function' && cell.getValue()!='DJF' && cell.getValue()!='MAM' && cell.getValue()!='JJA' && cell.getValue()!='SON'){
           var modname = thiscol.getField().trim()

           var varname = rowparent.getData()["metric"].trim();
           var ssnname = thisrow.getData()["metric"].trim().toLowerCase();

           if (varname.includes("::")){
               varname = varname.split("::").slice(0)[0];
           }

           if (ssnname.includes("::")){
               ssnname = ssnname.split("::").slice(-1)[0];
           }

           var html_link  = html_base.concat('/', modname, '/', modname, '_cmip5_historical_', varname, '_', ssnname, '.png')

           var wdw2 = window.open(html_link);
        }
    }
}


var cellClickFunc = function(e, cell){
    //e - the click event object
    //cell - cell component

    var thisrow = cell.getRow();
    var thiscol = cell.getColumn();

    var isTree = new Boolean(true);


    console.log(typeof thisrow.getData()["metric"]);
    console.log(thiscol.getField().trim());

    if (thiscol.getField().trim() === 'metric'){

        var firstCol = true;
        var html_base="https://pcmdi.llnl.gov/pmp-preliminary-results/interactive_plot/portrait_plot/mean_clim/taylor_diagram/cmip5/historical/v20191009/";

        if (thisrow.getData()["metric"].trim().toLowerCase().includes("::")){
            isTree = false;
        }

        if (isTree){

            if (thisrow.getTreeParent()){
               var rowparent = thisrow.getTreeParent();
            }
            else{

               var rowparent = thisrow;
            }
        }
        else{
            var rowparent = thisrow;
        }
        var varname = rowparent.getData()["metric"].trim();
        if (varname.includes("::")){
            varname = varname.split("::").slice(0)[0].trim();
        }

        var html_link = html_base.concat('/', varname, '_cmip5_historical_taylor_4panel_all_global.png');

        var wdw2 = window.open(html_link);
    }

    else{
        var html_base="https://pcmdi.llnl.gov/pmp-preliminary-results/graphics/mean_climate/cmip5/historical/clim/v20191009/"

        console.log(thisrow.getData());
        if (thisrow.getData()["metric"].trim().toLowerCase().includes("::")){
            isTree = false;
        }

        if (isTree){
            var rowparent = thisrow.getTreeParent();
        }
        else{
            var rowparent = thisrow;
        }

        console.log('xx', typeof rowparent.getData === 'function');

        if(typeof rowparent.getData === 'function' && cell.getValue()!='DJF' && cell.getValue()!='MAM' && cell.getValue()!='JJA' && cell.getValue()!='SON'){
           var modname = thiscol.getField().trim();

           var varname = rowparent.getData()["metric"].trim();
           var ssnname = thisrow.getData()["metric"].trim().toLowerCase();

           if (varname.includes("::")){
               varname = varname.split("::").slice(0)[0].trim();
           }

           if (ssnname.includes("::")){
               ssnname = ssnname.split("::").slice(-1)[0].trim();
           }

           var html_link  = html_base.concat('/', varname, '/', varname, '_cmip5_historical_', modname, '_', ssnname, '.png')

           var wdw2 = window.open(html_link);
        }
    }
}


var cellClickFuncTransILAMB = function(e, cell){
    //e - the click event object
    //cell - cell component
    var thisrow = cell.getRow();
    var thiscol = cell.getColumn();
    var modname = thiscol.getField().trim().replace(/\s/g,'');
    var varname = thisrow.getData()['metric'];


    // get tht title names 
    //
    //
    var titleFields={};
    for (c of thisrow.getCells()){
         console.log(c.getField().trim());

         ctil = c.getField().trim().replace(/\s/g,'');
      

         if (ctil != 'metric'){
            if (ctil.includes('top')) {
               fstlev = ctil.split('/').slice(-1)[0];
            }

            console.log(ctil, fstlev);

            if (ctil.includes(fstlev)) {
               sndlev = ctil.split('/').slice(-1)[0];
            }

            if (ctil.split('/')[0] === sndlev){
               titleFields[ctil] = fstlev.concat('/', ctil); 
            }
         }
    }

    console.log(titleFields);
    //var html_base=https://www.ilamb.org/CMIP5v6/historical/EcosystemandCarbonCycle/Biomass/GEOCARBON/GEOCARBON.html?model=CESM1-BGC
    var html_base="https://www.ilamb.org/CMIP5v6/historical/" //EcosystemandCarbonCycle/Biomass/GEOCARBON/GEOCARBON.html?model=CESM1-BGC

    if (modname in titleFields) {
       var html_link = html_base.concat(titleFields[modname], '/', modname.split('/').slice(-1)[0], '.html?model=', varname.trim());
       console.log(modname);
       console.log(varname);
       console.log(html_link);
       var wdw2 = window.open(html_link);
    }

}


var cellClickFuncILAMB = function(e, cell){
    //e - the click event object
    //cell - cell component
    var thisrow = cell.getRow();
    var thiscol = cell.getColumn();
    var modname = thiscol.getField().trim().replace(/\s/g,'');

    var varname = thisrow.getData()["metric"];

    if (thisrow.getTreeParent() != null && thisrow.getTreeParent().getTreeParent() != null){
       var gradrow = thisrow.getTreeParent().getTreeParent();

       if(gradrow){
           topmetric = gradrow.getData()["metric"].replace(/\s/g,'');
           sndmetric = thisrow.getTreeParent().getData()["metric"].replace(/\s/g,'');
           //var html_base=https://www.ilamb.org/CMIP5v6/historical/EcosystemandCarbonCycle/Biomass/GEOCARBON/GEOCARBON.html?model=CESM1-BGC
           var html_base="https://www.ilamb.org/CMIP5v6/historical/" //EcosystemandCarbonCycle/Biomass/GEOCARBON/GEOCARBON.html?model=CESM1-BGC

           if (modname == "metric"){
             var html_link=html_base.concat('/', topmetric, '/', sndmetric, '/', varname, '/', varname, '.html');
           }
           else{
             var html_link=html_base.concat('/', topmetric, '/', sndmetric, '/', varname, '/', varname, '.html?model=', modname);
           }

           var wdw2 = window.open(html_link);
       }
    }

}

// set the legend
function setLegend(){
   var nc = cmap.length;
   var legtable = document.getElementById("scoresLegend");
   row = 0;
   for(var col=0; col<cmap.length; col++){
      legtable.rows[row].cells[col].style.backgroundColor = cmap[col];
   }
}
