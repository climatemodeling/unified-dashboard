// this is a js for download options callback from Tabulator
//module.exports = { downloadHTML4CMIP: downloadHTML4CMIP };

exports.downloadHTML4CMIP = downloadHTML4CMIP;

function downloadHTML4CMIP(fileContents, blob) {
  var preTable =
    " \
             <!DOCTYPE html> \
             <!-- saved from url=(0037)https://lmt.ornl.gov/test_lmtud/dist/ --> \
             <html lang='en' class=''><head><meta http-equiv='Content-Type' content='text/html; charset=UTF-8'> \
                <link rel='stylesheet' href='./css/savehtml.css'/> ";

  //var el = document.createElement( 'html' );
  //el.innerHTML = fileContents;
  //console.log(el.getElementsByTagName('td'));
  var nowColumns = table.getColumns();

  var cssString;
  var nd = 1;
  for (col of nowColumns) {
    if (col.isVisible()) {
      var x = col.getField();
      var k = grpsModelSrc[x] % bgColorGroupFirstRow.length;
      if (nd == 1) {
        cssString = '';
      } else {
        // let CMIP 5 and 6 Mean have the same colors with other models
        // removing 'x' will make their color diffent to others
        if (x.includes('xMean') || x.includes('xmean')) {
          //bgcol = "white";
          //var cssSets = 'font-style:italic;';
          var cssSets = 'color:skyblue;';
          var cssTemp = '.tabulator-print-table th:nth-of-type(nod){set}';
          cssString += cssTemp
            .replace('nod', nd.toString())
            .replace('set', cssSets);
        }

        // 204 35 35
        // 37 81 204
        else {
          if (k == 0 || x.includes('CMIP5')) {
            //var cssSets = 'color:darkgray;';
            var cssSets = 'color:rgb(37,81,204);';
            var cssTemp = '.tabulator-print-table th:nth-of-type(nod){set}';
            cssString += cssTemp
              .replace('nod', nd.toString())
              .replace('set', cssSets);
          } else {
            var cssSets = 'color:rgb(204,35,35);';
            var cssTemp = '.tabulator-print-table th:nth-of-type(nod){set}';
            cssString += cssTemp
              .replace('nod', nd.toString())
              .replace('set', cssSets);
          }
        }
      }
      nd = nd + 1;
    }
  }

  let styleBgn = '<style>';
  let styleEnd = '</style></head><body>';

  //.tabulator-print-table th:nth-of-type(2){}
  var colorBarRow;
  if (document.getElementById('colorblind').checked) {
    colorBarRow =
      "<td bgcolor='#b35806'></td><td bgcolor='#e08214'></td><td bgcolor='#fdb863'></td><td bgcolor='#fee0b6'></td>\
                  <td bgcolor='#f7f7f7'></td><td bgcolor='#d8daeb'></td><td bgcolor='#b2abd2'></td><td bgcolor='#8073ac'></td><td bgcolor='#542788'></td>";
  } else {
    colorBarRow =
      "<td bgcolor='#b2182b'></td><td bgcolor='#d6604d'></td><td bgcolor='#f4a582'></td><td bgcolor='#fddbc7'></td>\
                  <td bgcolor='#f7f7f7'></td><td bgcolor='#d9f0d3'></td><td bgcolor='#a6dba0'></td><td bgcolor='#5aae61'></td><td bgcolor='#1b7837'></td>";
  }
  var legTable =
    "<center> <div class='legDiv'> Relative Scale <table class='table-header-rotated' id='scoresLegend'> <tbody> <tr>" +
    colorBarRow +
    "</tr> </tbody> </table> Worse Value&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Better Value \
            <table class='table-header-rotated' id='missingLegend'> \
              <tbody> <tr> <td bgcolor='#808080'></td> </tr> </tbody> \
            </table>Missing Data or Error\
            </div> </center> ";

  //insert legend table into the top-left
  let topleftcell = '<th colspan="1" rowspan="1"></th>';

  var aftTable = '</body></html>';
  //var newContents = preTable + //"<div id='mytabs' style='width:1000px;'>" +
  //     fileContents.replace(/undefined/g, '') + //"</div>" +
  //     legTable + aftTable;

  var newContents =
    preTable +
    styleBgn +
    cssString +
    styleEnd +
    fileContents
      .replace(/undefined/g, '')
      .replace(topleftcell, '<th>' + legTable + '</th>') //.replace(\ /table-row"><td style="/g, "font-weight:bold; tabindex")  +
      .replace(
        'background-color: rgb(236, 255, 230);',
        'background-color: rgb(236, 255, 230);font-weight:bold'
      )
      .replace(
        'background-color: rgb(230, 249, 255);',
        'background-color: rgb(230, 249, 255);font-weight:bold'
      )
      .replace(
        'background-color: rgb(255, 236, 230);',
        'background-color: rgb(255, 236, 230);font-weight:bold'
      )
      .replace(
        'background-color: rgb(237, 237, 237);',
        'background-color: rgb(237, 237, 237);font-weight:bold'
      ) +
    aftTable;

  blob = new Blob([newContents], { type: 'text/html' });
  return blob;
}
