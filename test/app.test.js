const test = require('node:test');
const assert = require('node:assert/strict');

const MaterialData = require('../js/data.js');
global.MaterialData = MaterialData;

test('Data Model: 23 total records matching reference cohort', () => {
  const records = MaterialData.getInitialRecords();
  assert.equal(records.length, 23);

  const counts = MaterialData.calculateCounts(records);
  assert.equal(counts.total, 23);
  assert.equal(counts.activityPrice, 9);
  assert.equal(counts.uomMismatch, 6);
  assert.equal(counts.vendorMissing, 5);
  assert.equal(counts.sourceListMissing, 3);
});

test('Data Model: Activity Price subgroups (1.1, 1.2, 1.3)', () => {
  const records = MaterialData.getInitialRecords().filter(r => r.errorCategory === 'activityPrice');
  assert.equal(records.length, 9);

  const g1_1 = records.filter(r => r.groupKey === '1.1');
  const g1_2 = records.filter(r => r.groupKey === '1.2');
  const g1_3 = records.filter(r => r.groupKey === '1.3');

  assert.equal(g1_1.length, 3, 'Group 1.1 must have 3 records');
  assert.equal(g1_2.length, 4, 'Group 1.2 must have 4 records');
  assert.equal(g1_3.length, 2, 'Group 1.3 must have 2 records');

  assert.equal(g1_1[0].material, 'RMI-2142');
  assert.equal(g1_1[0].isFixed, true, 'RMI-2142 is initially fixed per image reference');
  assert.equal(g1_1[1].material, 'RMI-2187');
  assert.equal(g1_1[1].isFixed, false, 'RMI-2187 is initially unfixed');
});

test('Data Model: Available Plants and Cost Variants match specifications', () => {
  const plants = MaterialData.getPlants().map(p => p.key);
  const requiredPlants = ["AD10", "AD20", "IN10", "IN20", "IN11", "IN12", "IN13", "AU10", "AU20", "CO10", "CO20"];
  requiredPlants.forEach(p => assert.ok(plants.includes(p), `Missing required plant: ${p}`));
  assert.ok(plants.length >= 20, "Should have expanded scrollable plants list");

  const variants = MaterialData.getCostVariants().map(v => v.key);
  const expectedVariants = ["PPC1", "ZPC1", "ZPC2"];
  assert.deepEqual(variants, expectedVariants);

  const matTypes = MaterialData.getMaterialTypes().map(m => m.key);
  const expectedMatTypes = ["FERT", "ROH", "HALB"];
  assert.deepEqual(matTypes, expectedMatTypes);

  // Validate all 23 records use only allowed material types
  const allRecords = MaterialData.getInitialRecords();
  allRecords.forEach(r => {
    assert.ok(expectedMatTypes.includes(r.matType), `Record ${r.id} has invalid matType: ${r.matType}`);
  });
});

test('Data Model: Category metadata mapping', () => {
  const apMeta = MaterialData.getCategoryMeta('activityPrice');
  assert.equal(apMeta.title, 'Activity Price');
  assert.equal(apMeta.badgeClass, 'badge-red');

  const uomMeta = MaterialData.getCategoryMeta('uomMismatch');
  assert.equal(uomMeta.title, 'UOM Mismatch');
  assert.equal(uomMeta.badgeClass, 'badge-orange');

  const vmMeta = MaterialData.getCategoryMeta('vendorMissing');
  assert.equal(vmMeta.title, 'Vendor Missing');
  assert.equal(vmMeta.badgeClass, 'badge-blue');

  const slMeta = MaterialData.getCategoryMeta('sourceListMissing');
  assert.equal(slMeta.title, 'Source List Missing');
  assert.equal(slMeta.badgeClass, 'badge-green');

  const totalMeta = MaterialData.getCategoryMeta('total');
  assert.equal(totalMeta.title, 'Total Errors');
  assert.equal(totalMeta.badgeClass, 'badge-purple');
});

test('Chatbot & Recents: Clean Plain Titles without Status Badges', () => {
  const MaterialChatbot = require('../js/chatbot.js');
  const recents = MaterialChatbot.getRecents();

  assert.ok(Array.isArray(recents) && recents.length > 5, 'Recents list must be populated');

  // Verify all titles are plain clean text and do NOT contain [Pending] or [Fixed] badges
  recents.forEach(item => {
    assert.ok(item.title && typeof item.title === 'string', 'Item must have clean title string');
    assert.ok(!item.title.includes('Pending'), `Title "${item.title}" should not contain Pending`);
    assert.ok(!item.title.includes('Fixed'), `Title "${item.title}" should not contain Fixed`);
  });

  // Verify reference topics exist in recents
  const titles = recents.map(r => r.title);
  assert.ok(titles.includes('Explain UI UX Design'), 'Must include Explain UI UX Design');
  assert.ok(titles.includes('Fix HALB-3310'), 'Must include Fix HALB-3310');
  assert.ok(titles.includes('Figma Prototype Review'), 'Must include Figma Prototype Review');
  assert.ok(titles.includes('Explain SAP Costing Errors'), 'Must include Explain SAP Costing Errors');
});

test('Design 2 (Gemini): Controller exports and state management', () => {
  // Mock minimal window and document for unit test
  global.window = {
    addEventListener: () => {}
  };
  global.document = {
    getElementById: () => null,
    querySelectorAll: () => [],
    addEventListener: () => {}
  };

  const GeminiDesign = require('../js/design-gemini.js');
  assert.ok(GeminiDesign, 'GeminiDesign module should export');
  assert.equal(typeof GeminiDesign.init, 'function');
  assert.equal(typeof GeminiDesign.getState, 'function');
  assert.equal(typeof GeminiDesign.syncFilterState, 'function');

  GeminiDesign.init();
  const st = GeminiDesign.getState();
  assert.equal(st.applied, false, 'Default applied should be false');
  assert.equal(st.activeKpiFilter, 'all');
  assert.equal(st.records.length, 23);
  assert.equal(st.counts.total, 23);

  // Test syncing filter state
  GeminiDesign.syncFilterState('IN10', 'PPC1', 'HALB-3310', true);
  const updatedSt = GeminiDesign.getState();
  assert.equal(updatedSt.selectedPlant, 'IN10');
  assert.equal(updatedSt.selectedCostVariant, 'PPC1');
  assert.equal(updatedSt.selectedMaterial, 'HALB-3310');
  assert.equal(updatedSt.applied, true);
});

test('Design 3 (Claude): Controller exports and state management', () => {
  const ClaudeDesign = require('../js/design-claude.js');
  assert.ok(ClaudeDesign, 'ClaudeDesign module should export');
  assert.equal(typeof ClaudeDesign.init, 'function');
  assert.equal(typeof ClaudeDesign.getState, 'function');
  assert.equal(typeof ClaudeDesign.syncFilterState, 'function');

  ClaudeDesign.init();
  const st = ClaudeDesign.getState();
  assert.equal(st.applied, false, 'Default applied should be false');
  assert.equal(st.activeTab, 'all');
  assert.equal(st.records.length, 23);
  assert.equal(st.counts.total, 23);

  // Test syncing filter state
  ClaudeDesign.syncFilterState('IN12', 'ZPC1', 'RAW-1011', true);
  const updatedSt = ClaudeDesign.getState();
  assert.equal(updatedSt.selectedPlant, 'IN12');
  assert.equal(updatedSt.selectedCostVariant, 'ZPC1');
  assert.equal(updatedSt.selectedMaterial, 'RAW-1011');
  assert.equal(updatedSt.applied, true);
});

test('Design Switcher: Switching and state tracking', () => {
  global.localStorage = {
    _data: {},
    getItem(k) { return this._data[k] || null; },
    setItem(k, v) { this._data[k] = String(v); }
  };

  const DesignSwitcher = require('../js/design-switcher.js');
  assert.ok(DesignSwitcher, 'DesignSwitcher module should export');
  assert.equal(typeof DesignSwitcher.init, 'function');
  assert.equal(typeof DesignSwitcher.switchDesign, 'function');
  assert.equal(typeof DesignSwitcher.getCurrentDesign, 'function');

  DesignSwitcher.init();
  assert.equal(DesignSwitcher.getCurrentDesign(), '1', 'Initial default should be Design 1');

  DesignSwitcher.switchDesign('2');
  assert.equal(DesignSwitcher.getCurrentDesign(), '2', 'Switched to Design 2');
  assert.equal(localStorage.getItem('material_dashboard_selected_design'), '2');

  DesignSwitcher.switchDesign('3');
  assert.equal(DesignSwitcher.getCurrentDesign(), '3', 'Switched to Design 3');
  assert.equal(localStorage.getItem('material_dashboard_selected_design'), '3');

  DesignSwitcher.switchDesign('4');
  assert.equal(DesignSwitcher.getCurrentDesign(), '4', 'Switched to Design 4');
  assert.equal(localStorage.getItem('material_dashboard_selected_design'), '4');
});

test('Design 4 (Kinetic Editorial): Controller exports and state management', () => {
  global.CustomEvent = function(name, opts) { return { type: name, detail: opts && opts.detail }; };
  global.document.dispatchEvent = () => {};

  const Design4 = require('../js/design-4.js');
  assert.ok(Design4, 'Design4 module should export');
  assert.equal(typeof Design4.init, 'function');
  assert.equal(typeof Design4.getState, 'function');
  assert.equal(typeof Design4.syncFilterState, 'function');

  Design4.init();
  const st = Design4.getState();
  assert.equal(st.applied, false, 'Default applied should be false');
  assert.equal(st.activeCategory, 'all');
  assert.equal(st.selectedRecord, null);

  // Test syncFilterState sets plant/cv/mat
  Design4.syncFilterState('AU10', 'ZPC2', 'FERT-9900', false);
  const updatedSt = Design4.getState();
  assert.equal(updatedSt.selectedPlant, 'AU10');
  assert.equal(updatedSt.selectedCostVariant, 'ZPC2');
  assert.equal(updatedSt.selectedMaterial, 'FERT-9900');
  assert.equal(updatedSt.applied, false);
});
