/**
 * @file Utility functions for converting CMEC JSON results into Tabulator's
 * JSON format and for manipulating the dashboard's <select> elements.
 */

/**
 * Return a default result object for a CMEC dimension that is absent from the
 * results. Missing numeric leaves are represented by the sentinel value
 * `-999.` so that they can be rendered as "missing data" by the formatters.
 *
 * @param {Object} cmecJson - Parsed CMEC JSON document.
 * @param {Object} fxdimDict - Single-entry object mapping a dimension name to
 *   the value that should be defaulted.
 * @returns {number|Object} `-999.` for a leaf dimension, or a nested object
 *   mirroring the remaining dimensions in `json_structure`.
 */
function setcmecDefault(cmecJson, fxdimDict) {
  const { json_structure: jsonStructure, dimensions } = cmecJson.DIMENSIONS;
  const [fxdimNam] = Object.keys(fxdimDict);
  const fxdimVal = fxdimDict[fxdimNam];

  const n = jsonStructure.indexOf(fxdimNam);

  if (n === -1) {
    console.warn(
      'UDEB: dimension not found in json_structure',
      jsonStructure,
      fxdimNam
    );
    return -999.;
  }

  // Last dimension: the result is a leaf value (or an object of leaves when
  // the fixed value is a list, e.g. a list of statistics).
  if (n === jsonStructure.length - 1) {
    if (Array.isArray(fxdimVal)) {
      return fxdimVal.reduce((acc, value) => {
        acc[value] = -999.;
        return acc;
      }, {});
    }
    return -999.;
  }

  const nextDimName = jsonStructure[n + 1];
  const nextDim = dimensions[nextDimName];

  let nextDimValues;
  if (nextDimName === 'statistic' && nextDim.hasOwnProperty('indices')) {
    nextDimValues = nextDim.indices;
  } else {
    nextDimValues = Object.keys(nextDim);
  }

  if (Array.isArray(fxdimVal)) {
    return fxdimVal.reduce((acc, value) => {
      acc[value] = setcmecDefault(cmecJson, {
        [nextDimName]: nextDimValues
      });
      return acc;
    }, {});
  }

  return setcmecDefault(cmecJson, { [nextDimName]: nextDimValues });
}

/**
 * Reduce a nested result object so that only one value of a fixed dimension is
 * kept at the given depth. Missing values are filled with defaults produced by
 * {@link setcmecDefault}.
 *
 * @param {Object} node - Current node of the nested results.
 * @param {number} depth - Zero-based depth of the dimension in `json_structure`.
 * @param {string} dimName - Name of the fixed dimension.
 * @param {string|string[]} fixedValue - Value (or values) to keep.
 * @param {Object} cmecJson - Parsed CMEC JSON document.
 * @returns {Object} A new nested object containing only the fixed value.
 */
function filterFixedDimension(node, depth, dimName, fixedValue, cmecJson) {
  if (depth === 0) {
    const result = {};
    if (node && Object.prototype.hasOwnProperty.call(node, fixedValue)) {
      result[fixedValue] = node[fixedValue];
    } else {
      result[fixedValue] = setcmecDefault(cmecJson, { [dimName]: fixedValue });
    }
    return result;
  }

  const result = {};
  for (const key of Object.keys(node)) {
    result[key] = filterFixedDimension(
      node[key],
      depth - 1,
      dimName,
      fixedValue,
      cmecJson
    );
  }
  return result;
}

/**
 * Convert a flat list of rows whose `row_name` uses `::` / `!!` separators
 * into Tabulator's nested tree format (`_children`).
 *
 * A top-level row (`row_name` without a separator) may contain child rows
 * (`parent::child`) which may in turn contain grandchildren
 * (`parent::child!!grandchild`).
 *
 * @param {Object[]} tabJson - Flat Tabulator rows.
 * @returns {Object[]} Rows nested through `_children`.
 */
function resolve_tree(tabJson) {
  const flattenJson = Object.assign(tabJson, {});
  const treeJson = [];

  for (const rowline of flattenJson) {
    const rowName = rowline.row_name;
    if (rowName.includes('::') || rowName.includes('!!')) {
      continue;
    }

    const parentName = rowName;
    const children = flattenJson
      .filter(
        obj =>
          obj.row_name.startsWith(parentName.concat('::')) &&
          !obj.row_name.includes('!!')
      )
      .map(child => {
        const childName = child.row_name;
        const grandchildren = flattenJson
          .filter(obj => obj.row_name.includes(childName.concat('!!')))
          .map(grandchild => {
            const copy = { ...grandchild };
            copy.row_name = copy.row_name.split('!!').slice(-1)[0];
            return copy;
          });

        const copy = { ...child };
        copy.row_name = copy.row_name.split('::').slice(-1)[0];
        copy._children = grandchildren;
        return copy;
      });

    const parent = { ...rowline, _children: children };
    treeJson.push(parent);
  }

  return treeJson;
}

/**
 * Read the values of a dimension from a CMEC JSON document. The `statistic`
 * dimension is special because it can either be an object of statistics or an
 * object containing an `indices` array.
 *
 * @param {Object} cmecJson - Parsed CMEC JSON document.
 * @param {string} dimName - Dimension name.
 * @returns {string[]} Available values for the dimension.
 */
function getDimensionValues(cmecJson, dimName) {
  const dimension = cmecJson.DIMENSIONS.dimensions[dimName];
  if (dimName === 'statistic' && dimension.hasOwnProperty('indices')) {
    return dimension.indices;
  }
  return Object.keys(dimension);
}

/**
 * Look up a single result value in the filtered nested result object.
 *
 * @param {Object} root - Filtered results (fixed dimensions already applied).
 * @param {string[]} path - Ordered dimension identifiers. Fixed dimensions are
 *   represented by their chosen value, while the X/Y dimensions are
 *   represented by their names and resolved with `xKey` / `yKey`.
 * @param {string} dimX - Name of the X dimension.
 * @param {string} dimY - Name of the Y dimension.
 * @param {string} xKey - Current X value.
 * @param {string} yKey - Current Y value.
 * @returns {number|Object} The result value, or `-999.` when missing.
 */
function lookupResult(root, path, dimX, dimY, xKey, yKey) {
  let node = root;

  for (const dim of path) {
    let key;
    if (dim === dimX) {
      key = xKey;
    } else if (dim === dimY) {
      key = yKey;
    } else {
      key = dim;
    }

    if (node == null || !Object.prototype.hasOwnProperty.call(node, key)) {
      return -999.;
    }
    node = node[key];
  }

  return node == null ? -999. : node;
}

/**
 * Convert a CMEC JSON document into an array of rows suitable for Tabulator.
 *
 * The X and Y dimensions become columns and row labels respectively, while
 * every other dimension is fixed to the value supplied in `fixedDimsDict`.
 * Missing results are filled with `-999.` sentinels.
 *
 * @param {Object} cmecJson - Parsed CMEC JSON document.
 * @param {string} dimX - Dimension shown along the columns.
 * @param {string} dimY - Dimension shown along the rows.
 * @param {Object} fixedDimsDict - Values for every non-X/Y dimension.
 * @param {number} convertTree - When `1`, convert `::` / `!!` row names into
 *   Tabulator tree rows.
 * @returns {Object[]|undefined} Tabulator rows, or `undefined` when the
 *   requested dimensions are invalid.
 */
function cmec2tab_json(cmecJson, dimX, dimY, fixedDimsDict, convertTree) {
  const { json_structure: jsonStructure } = cmecJson.DIMENSIONS;

  if (!jsonStructure.includes(dimX) || !jsonStructure.includes(dimY)) {
    alert('the dimensions X and Y not in the json file');
    return;
  }

  const fixedDims = Object.keys(fixedDimsDict);
  if (fixedDims.length + 2 !== jsonStructure.length) {
    alert('the size of fixed dimensions is not consistent with the json file');
    return;
  }

  // Keep only the selected value of every fixed dimension.
  let prevJson = Object.assign(cmecJson.RESULTS, {});
  for (const fixedDim of fixedDims) {
    const depth = jsonStructure.indexOf(fixedDim);
    if (depth === -1) {
      alert('fixed dimension not exist in the json file');
      return;
    }
    prevJson = filterFixedDimension(
      prevJson,
      depth,
      fixedDim,
      fixedDimsDict[fixedDim],
      cmecJson
    );
  }

  const xKeys = getDimensionValues(cmecJson, dimX);
  const yKeys = getDimensionValues(cmecJson, dimY);

  // Build the lookup path: X and Y stay symbolic, fixed dimensions are
  // replaced by their selected values.
  const path = [];
  for (const dim of jsonStructure) {
    if (dim === dimX || dim === dimY) {
      path.push(dim);
    }
    if (dim in fixedDimsDict) {
      path.push(fixedDimsDict[dim]);
    }
  }

  let isTreeStructure = 0;
  const tabJson = [];

  for (const yKey of yKeys) {
    const tabRow = { row_name: yKey };

    for (const xKey of xKeys) {
      tabRow[xKey] = lookupResult(prevJson, path, dimX, dimY, xKey, yKey);
    }

    if (tabRow.row_name.includes('::') || tabRow.row_name.includes('!!')) {
      isTreeStructure = 1;
    }
    tabJson.push(tabRow);
  }

  return isTreeStructure === 1 && convertTree === 1
    ? resolve_tree(tabJson)
    : tabJson;
}

/**
 * Replace all options of a <select> element.
 *
 * @param {string[]} optionList - Values (also used as labels) to add.
 * @param {string} selectID - `id` of the target <select> element.
 */
function add_options(optionList, selectID) {
  const select = document.getElementById(selectID);
  if (!select) {
    console.warn('UDEB: select element not found:', selectID);
    return;
  }

  select.replaceChildren();

  const fragment = document.createDocumentFragment();
  for (const value of optionList) {
    const option = document.createElement('option');
    option.value = value;
    option.textContent = value;
    fragment.appendChild(option);
  }
  select.appendChild(fragment);
}

module.exports = {
  add_options,
  cmec2tab_json
};
