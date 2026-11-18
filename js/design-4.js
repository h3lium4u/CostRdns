/**
 * Design 4: Kinetic Editorial / Swiss Futurism Controller
 * Implements:
 * - High-contrast Swiss Editorial typography and asymmetric grid
 * - Dynamic 5-KPI section with oversized typography and color-blocked surfaces
 * - Category -> Group -> Individual Records hierarchy
 * - Floating chatbot integration for Fix workflow
 * - Independent state and scoped DOM events
 */

const Design4 = (function () {
  'use strict';

  // ── Scoped State ──
  let _state = {
    selectedPlant: '',
    selectedCostVariant: '',
    selectedMaterial: '',
    applied: false,
    activeCategory: 'all',
    records: [],
    selectedRecord: null,
    plantOpen: false,
    cvOpen: false
  };

  // Category definitions and metadata
  const CATEGORIES = [
    { key: 'activityPrice',     code: '01', title: 'Activity Price',      short: 'Tariff Mismatch',   totalCount: 9 },
    { key: 'uomMismatch',       code: '02', title: 'UOM Mismatch',        short: 'Unit Conflicts',    totalCount: 6 },
    { key: 'vendorMissing',     code: '03', title: 'Vendor Missing',      short: 'Procurement',       totalCount: 5 },
    { key: 'sourceListMissing', code: '04', title: 'Source List Missing', short: 'MRP Logistics',     totalCount: 3 }
  ];

  // Helper for 2-digit number format
  function pad2(num) {
    return num < 10 ? '0' + num : String(num);
  }

  // ── Initialize Design 4 Controller ──
  function init() {
    if (typeof MaterialData !== 'undefined') {
      _state.records = JSON.parse(JSON.stringify(MaterialData.getInitialRecords()));
    } else {
      _state.records = [];
    }

    setupDropdowns();
    setupFilters();
    setupCategoryTabs();
    setupSearch();
    setupChatbotListeners();

    renderView();
  }

  // ── Dropdown Handlers (Plant & Cost Variant) ──
  function setupDropdowns() {
    const plantInp = document.getElementById('d4PlantInput');
    const plantDrop = document.getElementById('d4PlantDropdown');
    const cvInp = document.getElementById('d4CvInput');
    const cvDrop = document.getElementById('d4CvDropdown');

    if (!plantInp || !plantDrop || !cvInp || !cvDrop) return;

    // Plant Dropdown
    function renderPlantOpts(txt = '') {
      plantDrop.innerHTML = '';
      const plants = typeof MaterialData !== 'undefined' ? MaterialData.getPlants() : [];
      const filter = txt.toLowerCase().trim();
      const filtered = plants.filter(p => p.key.toLowerCase().includes(filter) || p.text.toLowerCase().includes(filter));

      if (filtered.length === 0) {
        plantDrop.innerHTML = '<div class="d4-dropdown-item" style="color:#888;">No plants found</div>';
        return;
      }

      filtered.forEach(p => {
        const item = document.createElement('div');
        item.className = 'd4-dropdown-item' + (p.key === _state.selectedPlant ? ' selected' : '');
        item.textContent = p.text;
        item.addEventListener('click', (e) => {
          e.stopPropagation();
          _state.selectedPlant = p.key;
          plantInp.value = p.key;
          plantDrop.classList.add('hidden');
          _state.plantOpen = false;
        });
        plantDrop.appendChild(item);
      });
    }

    plantInp.addEventListener('focus', () => {
      _state.plantOpen = true;
      _state.cvOpen = false;
      cvDrop.classList.add('hidden');
      renderPlantOpts(plantInp.value);
      plantDrop.classList.remove('hidden');
    });

    plantInp.addEventListener('input', () => {
      renderPlantOpts(plantInp.value);
      plantDrop.classList.remove('hidden');
    });

    // Cost Variant Dropdown
    function renderCvOpts(txt = '') {
      cvDrop.innerHTML = '';
      const variants = typeof MaterialData !== 'undefined' ? MaterialData.getCostVariants() : [];
      const filter = txt.toLowerCase().trim();
      const filtered = variants.filter(v => v.key.toLowerCase().includes(filter) || v.text.toLowerCase().includes(filter));

      if (filtered.length === 0) {
        cvDrop.innerHTML = '<div class="d4-dropdown-item" style="color:#888;">No cost variants found</div>';
        return;
      }

      filtered.forEach(v => {
        const item = document.createElement('div');
        item.className = 'd4-dropdown-item' + (v.key === _state.selectedCostVariant ? ' selected' : '');
        item.textContent = v.text;
        item.addEventListener('click', (e) => {
          e.stopPropagation();
          _state.selectedCostVariant = v.key;
          cvInp.value = v.key;
          cvDrop.classList.add('hidden');
          _state.cvOpen = false;
        });
        cvDrop.appendChild(item);
      });
    }

    cvInp.addEventListener('focus', () => {
      _state.cvOpen = true;
      _state.plantOpen = false;
      plantDrop.classList.add('hidden');
      renderCvOpts(cvInp.value);
      cvDrop.classList.remove('hidden');
    });

    cvInp.addEventListener('input', () => {
      renderCvOpts(cvInp.value);
      cvDrop.classList.remove('hidden');
    });

    // Click outside closes dropdowns
    document.addEventListener('click', (e) => {
      if (!plantInp.contains(e.target) && !plantDrop.contains(e.target)) {
        plantDrop.classList.add('hidden');
        _state.plantOpen = false;
      }
      if (!cvInp.contains(e.target) && !cvDrop.contains(e.target)) {
        cvDrop.classList.add('hidden');
        _state.cvOpen = false;
      }
    });
  }

  // ── Filter Controls (Apply, Refresh, Recents) ──
  function setupFilters() {
    const applyBtn = document.getElementById('d4ApplyBtn');
    const rfBtn = document.getElementById('d4RfBtn');
    const recentsBtn = document.getElementById('d4RecentsBtn');

    if (applyBtn) {
      applyBtn.addEventListener('click', () => {
        const plantInp = document.getElementById('d4PlantInput');
        const cvInp = document.getElementById('d4CvInput');
        const matInp = document.getElementById('d4MatInput');

        if (plantInp && plantInp.value.trim()) _state.selectedPlant = plantInp.value.trim();
        if (cvInp && cvInp.value.trim()) _state.selectedCostVariant = cvInp.value.trim();
        if (matInp) _state.selectedMaterial = matInp.value.trim();

        _state.applied = true;
        renderView();
      });
    }

    if (rfBtn) {
      rfBtn.addEventListener('click', () => {
        if (typeof MaterialData !== 'undefined') {
          _state.records = JSON.parse(JSON.stringify(MaterialData.getInitialRecords()));
        }
        const plantInp = document.getElementById('d4PlantInput');
        const cvInp = document.getElementById('d4CvInput');
        const matInp = document.getElementById('d4MatInput');
        if (plantInp) plantInp.value = '';
        if (cvInp) cvInp.value = '';
        if (matInp) matInp.value = '';
        _state.selectedPlant = '';
        _state.selectedCostVariant = '';
        _state.selectedMaterial = '';
        _state.activeCategory = 'all';
        _state.applied = false;
        renderView();
      });
    }

    if (recentsBtn) {
      recentsBtn.addEventListener('click', () => {
        const drawer = document.getElementById('recentsDrawer');
        if (drawer) {
          drawer.classList.toggle('hidden');
        }
      });
    }
  }

  // ── Category Tabs Setup ──
  function setupCategoryTabs() {
    const tabsContainer = document.getElementById('d4CategoryTabs');
    if (!tabsContainer) return;

    tabsContainer.querySelectorAll('.d4-cat-tab').forEach(btn => {
      btn.addEventListener('click', () => {
        const cat = btn.getAttribute('data-cat');
        _state.activeCategory = cat || 'all';
        updateCategoryTabsUI();
        renderKpis();
        renderRegistryTable();
      });
    });
  }

  function updateCategoryTabsUI() {
    const tabsContainer = document.getElementById('d4CategoryTabs');
    if (!tabsContainer) return;
    tabsContainer.querySelectorAll('.d4-cat-tab').forEach(btn => {
      const isAct = btn.getAttribute('data-cat') === _state.activeCategory;
      btn.classList.toggle('active', isAct);
    });
  }

  // ── Live Search Setup ──
  function setupSearch() {
    const searchInput = document.getElementById('d4TriageSearch');
    if (searchInput) {
      searchInput.addEventListener('input', () => {
        renderRegistryTable();
      });
    }
  }

  // ── Listen to Shared Record Fixed Event ──
  function setupChatbotListeners() {
    window.addEventListener('material-record-fixed', (e) => {
      const fixedId = e.detail && e.detail.recordId;
      if (fixedId) {
        const target = _state.records.find(r => r.id === fixedId);
        if (target) {
          target.isFixed = true;
          renderKpis();
          renderRegistryTable();
        }
      }
    });

    document.addEventListener('material-record-fixed', (e) => {
      const fixedId = e.detail && e.detail.recordId;
      if (fixedId) {
        const target = _state.records.find(r => r.id === fixedId);
        if (target) {
          target.isFixed = true;
          renderKpis();
          renderRegistryTable();
        }
      }
    });
  }

  // ── View Renderer ──
  function renderView() {
    const emptyState = document.getElementById('d4EmptyState');
    const contentArea = document.getElementById('d4ContentArea');

    if (!emptyState || !contentArea) return;

    if (!_state.applied) {
      emptyState.classList.remove('hidden');
      contentArea.classList.add('hidden');
    } else {
      emptyState.classList.add('hidden');
      contentArea.classList.remove('hidden');
      renderKpis();
      renderRegistryTable();
    }
  }

  // ── 5 Asymmetric Kinetic Editorial KPI Blocks ──
  function renderKpis() {
    const grid = document.getElementById('d4KpiRibbon');
    if (!grid) return;

    const counts = typeof MaterialData !== 'undefined'
      ? MaterialData.calculateCounts(_state.records)
      : { total: 23, activityPrice: 9, uomMismatch: 6, vendorMissing: 5, sourceListMissing: 3 };

    function subcounts(cat) {
      const recs = cat === 'all' ? _state.records : _state.records.filter(r => r.errorCategory === cat);
      const fixed = recs.filter(r => r.isFixed).length;
      return { fixed, pending: recs.length - fixed };
    }

    const scAll = subcounts('all');
    const scAp  = subcounts('activityPrice');
    const scUm  = subcounts('uomMismatch');
    const scVm  = subcounts('vendorMissing');
    const scSl  = subcounts('sourceListMissing');

    grid.innerHTML = `
      <!-- 1. Total Errors (Hero Card) -->
      <div class="d4-kpi-card kpi-total${_state.activeCategory === 'all' ? ' active' : ''}" data-cat="all" title="Filter by All Errors">
        <div class="d4-kpi-top">
          <div>
            <span class="d4-kpi-label">[ 01 ] TOTAL CO-PC ERRORS</span>
            <div class="d4-kpi-sub">ALL ERROR DOMAINS</div>
          </div>
          <span class="d4-kpi-glyph">⬡</span>
        </div>
        <div class="d4-kpi-num">${counts.total}</div>
        <div class="d4-kpi-footer">
          <span>${scAll.fixed} FIXED</span>
          <span>${scAll.pending} PENDING</span>
        </div>
      </div>

      <!-- 2. Activity Price -->
      <div class="d4-kpi-card kpi-ap${_state.activeCategory === 'activityPrice' ? ' active' : ''}" data-cat="activityPrice" title="Filter by Activity Price">
        <div class="d4-kpi-top">
          <div>
            <span class="d4-kpi-label">[ 02 ] ACTIVITY PRICE</span>
            <div class="d4-kpi-sub">TARIFF MISMATCH</div>
          </div>
          <span class="d4-kpi-glyph">▲</span>
        </div>
        <div class="d4-kpi-num">${pad2(counts.activityPrice)}</div>
        <div class="d4-kpi-footer">
          <span>${scAp.fixed} FIXED</span>
          <span>${scAp.pending} PENDING</span>
        </div>
      </div>

      <!-- 3. UOM Mismatch -->
      <div class="d4-kpi-card kpi-um${_state.activeCategory === 'uomMismatch' ? ' active' : ''}" data-cat="uomMismatch" title="Filter by UOM Mismatch">
        <div class="d4-kpi-top">
          <div>
            <span class="d4-kpi-label">[ 03 ] UOM MISMATCH</span>
            <div class="d4-kpi-sub">UNIT CONFLICTS</div>
          </div>
          <span class="d4-kpi-glyph">■</span>
        </div>
        <div class="d4-kpi-num">${pad2(counts.uomMismatch)}</div>
        <div class="d4-kpi-footer">
          <span>${scUm.fixed} FIXED</span>
          <span>${scUm.pending} PENDING</span>
        </div>
      </div>

      <!-- 4. Vendor Missing -->
      <div class="d4-kpi-card kpi-vm${_state.activeCategory === 'vendorMissing' ? ' active' : ''}" data-cat="vendorMissing" title="Filter by Vendor Missing">
        <div class="d4-kpi-top">
          <div>
            <span class="d4-kpi-label">[ 04 ] VENDOR MISSING</span>
            <div class="d4-kpi-sub">PROCUREMENT</div>
          </div>
          <span class="d4-kpi-glyph">◆</span>
        </div>
        <div class="d4-kpi-num">${pad2(counts.vendorMissing)}</div>
        <div class="d4-kpi-footer">
          <span>${scVm.fixed} FIXED</span>
          <span>${scVm.pending} PENDING</span>
        </div>
      </div>

      <!-- 5. Source List Missing -->
      <div class="d4-kpi-card kpi-sl${_state.activeCategory === 'sourceListMissing' ? ' active' : ''}" data-cat="sourceListMissing" title="Filter by Source List Missing">
        <div class="d4-kpi-top">
          <div>
            <span class="d4-kpi-label">[ 05 ] SOURCE LIST</span>
            <div class="d4-kpi-sub">MRP LOGISTICS</div>
          </div>
          <span class="d4-kpi-glyph">●</span>
        </div>
        <div class="d4-kpi-num">${pad2(counts.sourceListMissing)}</div>
        <div class="d4-kpi-footer">
          <span>${scSl.fixed} FIXED</span>
          <span>${scSl.pending} PENDING</span>
        </div>
      </div>
    `;

    // Click handler for KPI cards
    grid.querySelectorAll('.d4-kpi-card').forEach(card => {
      card.addEventListener('click', () => {
        const cat = card.getAttribute('data-cat');
        _state.activeCategory = cat || 'all';
        updateCategoryTabsUI();
        renderKpis();
        renderRegistryTable();
      });
    });
  }

  // ── Render Structured Hierarchy Table (Category -> Group -> Individual Records) ──
  function renderRegistryTable() {
    const tbody = document.getElementById('d4TriageBody');
    const countEl = document.getElementById('d4TriageCount');
    if (!tbody) return;

    let filtered = _state.activeCategory === 'all'
      ? _state.records
      : _state.records.filter(r => r.errorCategory === _state.activeCategory);

    // Text search query
    const searchInput = document.getElementById('d4TriageSearch');
    const q = searchInput ? searchInput.value.trim().toLowerCase() : '';
    if (q) {
      filtered = filtered.filter(r =>
        r.material.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q) ||
        r.errorType.toLowerCase().includes(q) ||
        r.plant.toLowerCase().includes(q)
      );
    }

    if (countEl) {
      countEl.textContent = `[ ${filtered.length} RECORD${filtered.length !== 1 ? 'S' : ''} LOGGED ]`;
    }

    if (filtered.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7" class="d4-table-empty">NO ERROR RECORDS MATCH CRITERIA.</td></tr>`;
      return;
    }

    // Group records by Category -> Group
    const relevantCats = _state.activeCategory === 'all'
      ? CATEGORIES
      : CATEGORIES.filter(c => c.key === _state.activeCategory);

    let html = '';

    relevantCats.forEach(cat => {
      const catRecs = filtered.filter(r => r.errorCategory === cat.key);
      if (catRecs.length === 0) return;

      // Tier 1: Category Header Row
      html += `
        <tr class="d4-category-row">
          <td colspan="7">
            <div class="d4-cat-header-content">
              <span class="d4-cat-title">[ CATEGORY ${cat.code} ] ${cat.title.toUpperCase()}</span>
              <span class="d4-cat-badge">${catRecs.length} ERRORS</span>
            </div>
          </td>
        </tr>
      `;

      // Extract unique groups in this category
      const groupMap = new Map();
      catRecs.forEach(r => {
        const gk = r.groupKey || r.groupNumber || '1.1';
        if (!groupMap.has(gk)) {
          groupMap.set(gk, {
            key: gk,
            title: r.groupTitle || `${cat.title} Subgroup ${gk}`,
            records: []
          });
        }
        groupMap.get(gk).records.push(r);
      });

      // Render each Group
      groupMap.forEach(group => {
        // Tier 2: Group Header Row
        html += `
          <tr class="d4-group-row">
            <td colspan="7">
              <span class="d4-group-title">// GROUP ${group.key}: ${group.title.toUpperCase()}</span>
              <span class="d4-group-count">[ ${group.records.length} RECORD${group.records.length !== 1 ? 'S' : ''} ]</span>
            </td>
          </tr>
        `;

        // Tier 3: Individual Records
        group.records.forEach(r => {
          const typeClass = `type-${r.matType || 'ROH'}`;
          html += `
            <tr class="d4-record-row${r.isFixed ? ' is-fixed' : ''}" data-id="${r.id}">
              <td class="d4-mat-cell">${r.material}</td>
              <td class="d4-desc-cell">${r.description}</td>
              <td class="d4-error-cell">${r.errorType}</td>
              <td><span class="d4-plant-chip">${r.plant}</span></td>
              <td><span class="d4-type-chip ${typeClass}">${r.matType || 'ROH'}</span></td>
              <td class="d4-rec-cell">${r.recommendation}</td>
              <td style="text-align: center;">
                ${r.isFixed
                  ? `<span class="d4-resolved-badge">
                       <span class="d4-resolved-glyph">✓</span>
                       <span>FIXED</span>
                     </span>`
                  : `<button class="d4-btn-action-fix" data-fix-id="${r.id}" title="Fix with Material Assistant">
                       <span>✦ FIX</span>
                     </button>`
                }
              </td>
            </tr>
          `;
        });
      });
    });

    tbody.innerHTML = html;

    // Attach row-level Fix click handlers
    tbody.querySelectorAll('.d4-btn-action-fix').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const recId = btn.getAttribute('data-fix-id');
        const rec = _state.records.find(r => r.id === recId);
        if (!rec) return;

        // Open floating chatbot overlay with Fix prompt
        if (typeof MaterialChatbot !== 'undefined' && MaterialChatbot.initiateFix) {
          MaterialChatbot.initiateFix(rec);
        }
      });
    });
  }

  // ── Cross-Design Filter Synchronization ──
  function syncFilterState(plant, cv, mat, applied) {
    if (plant) _state.selectedPlant = plant;
    if (cv) _state.selectedCostVariant = cv;
    if (mat) _state.selectedMaterial = mat;
    if (typeof applied === 'boolean') _state.applied = applied;

    const plantInp = document.getElementById('d4PlantInput');
    const cvInp = document.getElementById('d4CvInput');
    const matInp = document.getElementById('d4MatInput');

    if (plantInp && _state.selectedPlant) plantInp.value = _state.selectedPlant;
    if (cvInp && _state.selectedCostVariant) cvInp.value = _state.selectedCostVariant;
    if (matInp && _state.selectedMaterial) matInp.value = _state.selectedMaterial;

    renderView();
  }

  return {
    init: init,
    getState: function () { return _state; },
    syncFilterState: syncFilterState
  };
})();

// Auto-register on DOMContentLoaded if not loaded as module
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    // Only init if not already initialized
  });
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = Design4;
}
