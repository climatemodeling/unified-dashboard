/**
 * @file Tabulator `downloadReady` callback for exporting the dashboard as a
 * standalone HTML file.
 */

const Tabulator = require('tabulator-tables');
const globalVars = require('./globalVars.js');

/**
 * Build the CSS rules that color the header text of model columns in the
 * exported HTML. The colors mirror the source grouping shown in the dashboard.
 *
 * @param {ColumnComponent[]} columns - Columns of the current table.
 * @returns {string} Concatenated CSS rules.
 */
function buildHeaderCss(columns) {
  const { grpsModSrcIdx = {}, bgColorGroupFirstRow = [] } =
    globalVars.sharedState || {};

  const visibleColumns = columns.filter(column => column.isVisible());
  let css = '';

  visibleColumns.forEach((column, index) => {
    // The first visible column is the row label; it has no header color.
    if (index === 0) {
      return;
    }

    const field = column.getField();
    let color;

    // Give CMIP 5/6 means the same style as the other models.
    if (field.includes('xMean') || field.includes('xmean')) {
      color = 'skyblue';
    } else {
      const groupSize = bgColorGroupFirstRow.length || 1;
      const group = (grpsModSrcIdx[field] || 0) % groupSize;
      color = group === 0 || field.includes('CMIP5')
        ? 'rgb(37,81,204)'
        : 'rgb(204,35,35)';
    }

    css += `.tabulator-print-table th:nth-of-type(${index + 1}){color:${color};}`;
  });

  return css;
}

/**
 * Build the HTML fragment containing the color scale legend.
 *
 * @returns {string} Legend markup.
 */
function buildLegend() {
  const colorBarRow = document.getElementById('colorblind').checked
    ? "<td bgcolor='#b35806'></td><td bgcolor='#e08214'></td><td bgcolor='#fdb863'></td><td bgcolor='#fee0b6'></td>" +
      "<td bgcolor='#f7f7f7'></td><td bgcolor='#d8daeb'></td><td bgcolor='#b2abd2'></td><td bgcolor='#8073ac'></td><td bgcolor='#542788'></td>"
    : "<td bgcolor='#b2182b'></td><td bgcolor='#d6604d'></td><td bgcolor='#f4a582'></td><td bgcolor='#fddbc7'></td>" +
      "<td bgcolor='#f7f7f7'></td><td bgcolor='#d9f0d3'></td><td bgcolor='#a6dba0'></td><td bgcolor='#5aae61'></td><td bgcolor='#1b7837'></td>";

  return (
    "<center> <div class='legDiv'> Relative Scale <table class='table-header-rotated' id='scoresLegend'> <tbody> <tr>" +
    colorBarRow +
    "</tr> </tbody> </table> Worse Value&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Better Value " +
    "<table class='table-header-rotated' id='missingLegend'> " +
    "<tbody> <tr> <td bgcolor='#808080'></td> </tr> </tbody> </table>Missing Data or Error" +
    '</div> </center> '
  );
}

/**
 * Wrap Tabulator's HTML export in a complete document, add the legend and
 * color the model headers. This is registered as Tabulator's `downloadReady`
 * callback in {@link module:tabOptions}.
 *
 * @param {string} fileContents - HTML table produced by Tabulator.
 * @param {Blob} blob - Original blob produced by Tabulator.
 * @returns {Blob} A new HTML blob ready to be downloaded.
 */
function downloadHTML4CMIP(fileContents, blob) {
  const preTable =
    " \
             <!DOCTYPE html> \
             <!-- saved from url=(0037)https://lmt.ornl.gov/test_lmtud/dist/ --> \
             <html lang='en' class=''><head><meta http-equiv='Content-Type' content='text/html; charset=UTF-8'> \
                <link rel='stylesheet' href='./css/savehtml.css'/> ";

  const tables = Tabulator.findTable('#dashboard-table');
  const cssString = tables.length > 0 ? buildHeaderCss(tables[0].getColumns()) : '';

  const topleftcell = '<th colspan="1" rowspan="1"></th>';
  const legend = buildLegend();

  const newContents =
    preTable +
    '<style>' +
    cssString +
    '</style></head><body>' +
    fileContents
      .replace(/undefined/g, '')
      .replace(topleftcell, '<th>' + legend + '</th>')
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
    '</body></html>';

  return new Blob([newContents], { type: 'text/html' });
}

exports.downloadHTML4CMIP = downloadHTML4CMIP;
