/**
 * @file Tabulator options and the click handler used by the dashboard.
 */

const downloadFunc = require('./downloadFunctions.js');
const globalVars = require('./globalVars.js');

const { dictChoices, dimSetEvent } = globalVars;

/**
 * Template used to build the URL opened when a cell is clicked. Placeholders
 * are filled from the selected X/Y dimensions and the fixed dimensions.
 * @type {string}
 */
const linkTemplate =
  '{metric.0}/{metric.1}/{metric.2}/{metric.2}.html?model={model}&region={region}';

/** Tabulator configuration shared by all dashboard instances. */
const tabOption = {
  dataTree: true,

  reactiveData: true,

  headerSortTristate: true,

  placeholder: 'Loading Data',

  htmlOutputConfig: {
    columnHeaders: true,
    columnGroups: false,
    rowGroups: false,
    columnCalcs: true,
    dataTree: true,
    formatCells: true
  },

  downloadConfig: {
    columnHeaders: true,
    columnGroups: false,
    rowGroups: false,
    columnCalcs: true,
    dataTree: true,
    formatCells: true
  },

  downloadReady: downloadFunc.downloadHTML4CMIP,

  movableColumns: true,

  layout: 'fitDataTable',
  layoutColumnsOnNewData: true,

  /**
   * Build the tooltip shown when hovering a cell. The row label column has no
   * tooltip; numeric values are rounded to two decimals.
   *
   * @param {CellComponent} cell - Hovered Tabulator cell.
   * @returns {string|number|false} Tooltip content, or `false` to hide it.
   */
  tooltips: function (cell) {
    if (cell.getField() === 'row_name') {
      return false;
    }
    return Math.round((cell.getValue() + Number.EPSILON) * 100) / 100;
  },

  columnMinWidth: 10,
  nestedFieldSeparator: '|',

  dataTreeBranchElement: false,
  dataTreeChildIndent: 15,

  selectable: true,

  /**
   * Decide whether a row is expanded on the initial render. `lmt_tab.js`
   * overrides this with the user-configured expansion level.
   */
  dataTreeStartExpanded: function (row, level) {
    return level === 0;
  },

  columns: [],

  maxHeight: '82vh',
  height: '100%'
};

/**
 * Collect the row's tree path using the first cell value, joined with `::`.
 *
 * @param {RowComponent} rowClick - Tabulator row.
 * @returns {string} Row path, e.g. `Ecosystem and Carbon Cycle::Biomass`.
 */
function getRowTreeStruct(rowClick) {
  let rowTreeStruct = rowClick
    .getCells()[0]
    .getValue()
    .replace(/\s+/g, '');

  if (rowClick.getTreeParent()) {
    rowTreeStruct =
      getRowTreeStruct(rowClick.getTreeParent()) + '::' + rowTreeStruct;
  }

  return rowTreeStruct;
}

/**
 * Open the detailed results page corresponding to a clicked cell.
 *
 * The URL is produced from {@link linkTemplate}. Each placeholder is resolved
 * from the current X/Y dimension values and the fixed dimension selections.
 * If a required value cannot be resolved the user is notified instead.
 *
 * @param {Event} e - Click event.
 * @param {CellComponent} cell - Clicked Tabulator cell.
 */
function cellClickFuncGenetic(e, cell) {
  const colField = cell.getColumn().getField().replace(/\s+/g, '');
  if (colField === 'row_name') {
    return;
  }

  const linkNames = [
    ...new Set(
      Array.from(linkTemplate.matchAll(/{([^}]+)}/g), match => match[1])
    )
  ];
  const dictLinkNames = Object.fromEntries(
    linkNames.map(name => [name, 'null'])
  );

  const rowField = getRowTreeStruct(cell.getRow());
  const xDimName = dictChoices['xdimChoices'].getValue(true);
  const yDimName = dictChoices['ydimChoices'].getValue(true);

  const clickInput = {
    [xDimName]: colField,
    [yDimName]: rowField
  };

  Object.keys(dimSetEvent.fxdim).forEach(dim => {
    clickInput[dim] = dimSetEvent.fxdim[dim];
  });

  // Expand composite values such as `parent::child` into indexed entries so
  // that `{metric.0}`, `{metric.1}`, ... can be resolved.
  const dictLinknmMap = {};
  for (const [key, value] of Object.entries(clickInput)) {
    if (value.includes('::') || value.includes('!!')) {
      const parts = value
        .replace(/!!/g, '::')
        .replace(/\s+/g, '')
        .split('::');
      parts.forEach((part, index) => {
        dictLinknmMap[key + '.' + index.toString()] = part;
      });
    } else {
      dictLinknmMap[key] = value.replace(/\s+/g, '');
    }
  }

  for (const name of Object.keys(dictLinkNames)) {
    if (Object.prototype.hasOwnProperty.call(dictLinknmMap, name)) {
      dictLinkNames[name] = dictLinknmMap[name];
    }
  }

  if (Object.values(dictLinkNames).includes('null')) {
    alert('clickable not available');
    return;
  }

  let cellLinkTo = linkTemplate;
  for (const name of Object.keys(dictLinkNames)) {
    cellLinkTo = cellLinkTo.replace(
      new RegExp('\\{' + name + '\\}', 'g'),
      dictLinkNames[name]
    );
  }
  window.open(cellLinkTo, '_blank', 'noopener,noreferrer');
}

exports.tabOption = tabOption;
exports.cellClickFuncGenetic = cellClickFuncGenetic;
