/**
 * @file Objects shared between the dashboard modules.
 */

/** Choices.js instances, keyed by their logical name (e.g. `xdimChoices`). */
var dictChoices = {};

/** Current X/Y/fixed dimension selection. */
var dimSetEvent = { x_dim: null, y_dim: null, fxdim: {} };

/**
 * State needed by modules that do not have direct access to the dashboard
 * internals (for example the HTML export callback).
 */
var sharedState = {
  grpsModSrcIdx: {},
  bgColorGroupFirstRow: []
};

exports.dictChoices = dictChoices;
exports.dimSetEvent = dimSetEvent;
exports.sharedState = sharedState;
