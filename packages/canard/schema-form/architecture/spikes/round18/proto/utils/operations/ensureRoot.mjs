/**
 * Ensure root within the supplied prototype execution context.
 * @param {object} context Isolated model state and explicitly wired operations.
 * @param {*} node node input accepted by the regression model.
 * @returns {*} The modeled operation result; mutating operations update this context.
 */
export function ensureRoot(context, node) {
  if (node.replacedHosts !== null) return node;
  node.root = node;
  node.replacedHosts = [];
  node.computedHosts = [];
  node.waveQueue = [];
  node.options = {
    dev: false,
    disableAutomaticWrites: false
  };
  node.warnings = [];
  node.schemaMode = false;
  node.loadSuppressed = false;
  node.fillSeen = new Set();
  node.fillValues = new Map();
  node.cleared = new Set();
  node.injections = [];
  node.autoLog = new Map();
  node.loadedList = [];
  node.entryWrites = new Map();
  node.typedNodes = [];
  node.ruleWinners = new Map();
  node.exitedNodes = new Set();
  node.diagnostics = { status: 'stable', cause: null };
  context.setRoot(node, node);
  return node;
}
