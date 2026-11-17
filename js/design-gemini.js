/**
 * Design 2: Gemini Controller
 * Blue-Purple Gradient Theme + Segmented KPI Ribbon + Unified Hierarchical Tree-Table
 */

const GeminiDesign = (function () {
  'use strict';

  const state = {
    applied: false,
    selectedPlant: "",
    selectedCostVariant: "",
    selectedMaterial: "",
    activeKpiFilter: "all", // 'all', 'activityPrice', 'uomMismatch', 'vendorMissing', 'sourceListMissing'
    searchQuery: "",
    records: [],
    counts: {},
    expandedCategories: {
      activityPrice: true,
      uomMismatch: true,
      vendorMissing: false,
      sourceListMissing: false
    },
    expandedGroups: {
      "1.1": true,
      "1.2": false,
      "1.3": false,
      "2.1": true,
      "2.2": false,
      "3.1": true,
      "3.2": false,
      "4.1": true
    }
  };

  function init() {
    state.records = MaterialData.getInitialRecords();
    state.counts = MaterialData.calculateCounts(state.records);

    setupDropdowns();
    setupFilters();
    setupKpiRibbonListeners();
    setupTreeToolbar();

    // Listen to shared record fix event
    window.addEventListener('material-record-fixed', (e) => {
      const fixedId = e.detail && e.detail.recordId;
      if (fixedId) {
        const target = state.records.find(r => r.id === fixedId);
        if (target) {
          target.isFixed = true;
          state.counts = MaterialData.calculateCounts(state.records);
          renderKpiRibbon();
          renderTreeTable();
        }
      }
    });

    renderView();
  }

  function setupDropdowns() {
    const plantInp = document.getElementById('geminiPlantInput');
    const plantDrop = document.getElementById('geminiPlantDropdown');
    const plants = MaterialData.getPlants();

    function renderPlantOpts(txt = '') {
      if (!plantDrop) return;
      plantDrop.innerHTML = '';
      const filter = txt.toLowerCase().trim();
      const filtered = plants.filter(p => p.key.toLowerCase().includes(filter) || p.text.toLowerCase().includes(filter));

      if (filtered.length === 0) {
        plantDrop.innerHTML = '<div class="gemini-dropdown-item no-results">No results found</div>';
        return;
      }

      filtered.forEach(p => {
        const item = document.createElement('div');
        item.className = 'gemini-dropdown-item' + (p.key === state.selectedPlant ? ' selected' : '');
        item.textContent = p.key + ' - ' + p.text.split(' - ')[1];
        item.addEventListener('click', () => {
          plantInp.value = p.key;
          state.selectedPlant = p.key;
          plantDrop.classList.add('hidden');
        });
        plantDrop.appendChild(item);
      });
    }

    if (plantInp && plantDrop) {
      plantInp.addEventListener('focus', () => {
        renderPlantOpts(plantInp.value);
        plantDrop.classList.remove('hidden');
      });
      plantInp.addEventListener('input', () => {
        renderPlantOpts(plantInp.value);
        plantDrop.classList.remove('hidden');
      });
      document.addEventListener('click', (e) => {
        if (!plantInp.contains(e.target) && !plantDrop.contains(e.target)) {
          plantDrop.classList.add('hidden');
        }
      });
    }

    // Cost Variant
    const cvInp = document.getElementById('geminiCvInput');
    const cvDrop = document.getElementById('geminiCvDropdown');
    const variants = MaterialData.getCostVariants();

    function renderCvOpts(txt = '') {
      if (!cvDrop) return;
      cvDrop.innerHTML = '';
      const filter = txt.toLowerCase().trim();
      const filtered = variants.filter(v => v.key.toLowerCase().includes(filter) || v.text.toLowerCase().includes(filter));

      if (filtered.length === 0) {
        cvDrop.innerHTML = '<div class="gemini-dropdown-item no-results">No results found</div>';
        return;
      }

      filtered.forEach(v => {
        const item = document.createElement('div');
        item.className = 'gemini-dropdown-item' + (v.key === state.selectedCostVariant ? ' selected' : '');
        item.textContent = v.key + ' - ' + v.text.split(' - ')[1];
        item.addEventListener('click', () => {
          cvInp.value = v.key;
          state.selectedCostVariant = v.key;
          cvDrop.classList.add('hidden');
        });
        cvDrop.appendChild(item);
      });
    }

    if (cvInp && cvDrop) {
      cvInp.addEventListener('focus', () => {
        renderCvOpts(cvInp.value);
        cvDrop.classList.remove('hidden');
      });
      cvInp.addEventListener('input', () => {
        renderCvOpts(cvInp.value);
        cvDrop.classList.remove('hidden');
      });
      document.addEventListener('click', (e) => {
        if (!cvInp.contains(e.target) && !cvDrop.contains(e.target)) {
          cvDrop.classList.add('hidden');
        }
      });
    }
  }

  function setupFilters() {
    const applyBtn = document.getElementById('geminiApplyBtn');
    const rfBtn = document.getElementById('geminiRfBtn');
    const matInput = document.getElementById('geminiMaterialInput');

    if (applyBtn) {
      applyBtn.addEventListener('click', () => {
        const pVal = document.getElementById('geminiPlantInput').value.trim();
        const cvVal = document.getElementById('geminiCvInput').value.trim();
        const mVal = matInput ? matInput.value.trim() : '';

        state.selectedPlant = pVal;
        state.selectedCostVariant = cvVal;
        state.selectedMaterial = mVal;
        state.applied = true;

        renderView();
      });
    }

    if (rfBtn) {
      rfBtn.addEventListener('click', () => {
        state.records = MaterialData.getInitialRecords();
        state.counts = MaterialData.calculateCounts(state.records);
        state.selectedPlant = "";
        state.selectedCostVariant = "";
        state.selectedMaterial = "";
        state.applied = false;
        state.searchQuery = "";

        const pInp = document.getElementById('geminiPlantInput');
        const cInp = document.getElementById('geminiCvInput');
        const mInp = document.getElementById('geminiMaterialInput');
        if (pInp) pInp.value = '';
        if (cInp) cInp.value = '';
        if (mInp) mInp.value = '';

        renderView();
      });
    }
  }

  function setupKpiRibbonListeners() {
    const segments = document.querySelectorAll('#design2Wrapper .gemini-kpi-segment');
    segments.forEach(seg => {
      seg.addEventListener('click', () => {
        const cat = seg.getAttribute('data-cat');
        state.activeKpiFilter = cat;
        renderKpiRibbon();
        renderTreeTable();
      });
    });
  }

  function setupTreeToolbar() {
    const searchInp = document.getElementById('geminiSearchInput');
    if (searchInp) {
      searchInp.addEventListener('input', (e) => {
        state.searchQuery = e.target.value.toLowerCase().trim();
        renderTreeTable();
      });
    }

    const expandAllBtn = document.getElementById('geminiExpandAllBtn');
    if (expandAllBtn) {
      expandAllBtn.addEventListener('click', () => {
        const allExpanded = Object.values(state.expandedCategories).every(v => v);
        const nextState = !allExpanded;

        Object.keys(state.expandedCategories).forEach(k => {
          state.expandedCategories[k] = nextState;
        });
        Object.keys(state.expandedGroups).forEach(k => {
          state.expandedGroups[k] = nextState;
        });

        expandAllBtn.innerHTML = nextState 
          ? `<svg class="expand-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="4 14 12 6 20 14"></polyline></svg><span class="btn-text">Collapse All</span>`
          : `<svg class="expand-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="4 10 12 18 20 10"></polyline></svg><span class="btn-text">Expand All</span>`;
        renderTreeTable();
      });
    }
  }

  function renderView() {
    const emptyState = document.getElementById('geminiEmptyState');
    const contentArea = document.getElementById('geminiContentArea');

    if (!state.applied) {
      if (emptyState) emptyState.classList.remove('hidden');
      if (contentArea) contentArea.classList.add('hidden');
    } else {
      if (emptyState) emptyState.classList.add('hidden');
      if (contentArea) contentArea.classList.remove('hidden');
      renderKpiRibbon();
      renderTreeTable();
    }
  }

  function renderKpiRibbon() {
    const counts = state.counts;
    const total = counts.total || 23;

    const valTotal = document.getElementById('geminiKpiTotal');
    const valAp = document.getElementById('geminiKpiAp');
    const valUm = document.getElementById('geminiKpiUm');
    const valVm = document.getElementById('geminiKpiVm');
    const valSl = document.getElementById('geminiKpiSl');

    if (valTotal) valTotal.textContent = counts.total;
    if (valAp) valAp.textContent = counts.activityPrice;
    if (valUm) valUm.textContent = counts.uomMismatch;
    if (valVm) valVm.textContent = counts.vendorMissing;
    if (valSl) valSl.textContent = counts.sourceListMissing;

    // Update progress bars
    const barAp = document.getElementById('geminiBarAp');
    const barUm = document.getElementById('geminiBarUm');
    const barVm = document.getElementById('geminiBarVm');
    const barSl = document.getElementById('geminiBarSl');

    if (barAp) barAp.style.width = ((counts.activityPrice / total) * 100).toFixed(1) + '%';
    if (barUm) barUm.style.width = ((counts.uomMismatch / total) * 100).toFixed(1) + '%';
    if (barVm) barVm.style.width = ((counts.vendorMissing / total) * 100).toFixed(1) + '%';
    if (barSl) barSl.style.width = ((counts.sourceListMissing / total) * 100).toFixed(1) + '%';

    // Highlight active segment
    const segments = document.querySelectorAll('#design2Wrapper .gemini-kpi-segment');
    segments.forEach(seg => {
      if (seg.getAttribute('data-cat') === state.activeKpiFilter) {
        seg.classList.add('active');
      } else {
        seg.classList.remove('active');
      }
    });
  }

  /**
   * Renders the Unified Hierarchical Tree-Table
   * Tier 1: Category -> Tier 2: Group -> Tier 3: Record
   */
  function renderTreeTable() {
    const tbody = document.getElementById('geminiTreeTableBody');
    if (!tbody) return;

    tbody.innerHTML = '';

    // Filter by KPI selection
    let activeCategories = ["activityPrice", "uomMismatch", "vendorMissing", "sourceListMissing"];
    if (state.activeKpiFilter !== "all") {
      activeCategories = [state.activeKpiFilter];
    }

    const categoriesDef = [
      { key: "activityPrice", title: "Activity Price", pillClass: "pill-ap", groups: ["1.1", "1.2", "1.3"] },
      { key: "uomMismatch", title: "UOM Mismatch", pillClass: "pill-um", groups: ["2.1", "2.2"] },
      { key: "vendorMissing", title: "Vendor Missing", pillClass: "pill-vm", groups: ["3.1", "3.2"] },
      { key: "sourceListMissing", title: "Source List Missing", pillClass: "pill-sl", groups: ["4.1"] }
    ];

    let totalVisibleRecords = 0;

    categoriesDef.forEach(catDef => {
      if (!activeCategories.includes(catDef.key)) return;

      const catRecords = state.records.filter(r => r.errorCategory === catDef.key);
      const isCatExpanded = state.expandedCategories[catDef.key] !== false;

      // Filter by search query if present
      const matchesSearch = catRecords.some(r => 
        !state.searchQuery || 
        r.material.toLowerCase().includes(state.searchQuery) || 
        r.description.toLowerCase().includes(state.searchQuery)
      );

      if (!matchesSearch && state.searchQuery) return;

      // Tier 1: Category Row
      const catRow = document.createElement('tr');
      catRow.className = 'tree-row-category';
      catRow.innerHTML = `
        <td colspan="7">
          <div class="tree-category-cell">
            <span class="tree-chevron ${isCatExpanded ? 'expanded' : ''}">▶</span>
            <span class="tree-cat-pill ${catDef.pillClass}">${catDef.title}</span>
            <span class="tree-cat-count">${catRecords.length} Errors in Category</span>
          </div>
        </td>
      `;

      catRow.addEventListener('click', () => {
        state.expandedCategories[catDef.key] = !isCatExpanded;
        renderTreeTable();
      });

      tbody.appendChild(catRow);

      // Render Groups if Category is expanded
      if (isCatExpanded) {
        catDef.groups.forEach(gKey => {
          const groupRecords = catRecords.filter(r => r.groupKey === gKey);
          if (groupRecords.length === 0) return;

          const groupTitle = groupRecords[0].groupTitle || `Group ${gKey}`;
          const isGroupExpanded = state.expandedGroups[gKey] !== false;

          // Search check
          const filteredRecords = groupRecords.filter(r => 
            !state.searchQuery || 
            r.material.toLowerCase().includes(state.searchQuery) || 
            r.description.toLowerCase().includes(state.searchQuery)
          );

          if (filteredRecords.length === 0 && state.searchQuery) return;

          // Tier 2: Group Row
          const groupRow = document.createElement('tr');
          groupRow.className = 'tree-row-group';
          groupRow.innerHTML = `
            <td colspan="7">
              <div class="tree-group-cell">
                <span class="tree-chevron ${isGroupExpanded ? 'expanded' : ''}">▶</span>
                <span class="tree-group-badge">Group ${gKey}</span>
                <span class="tree-group-title-text">${escapeHtml(groupTitle)} (${groupRecords.length} records)</span>
              </div>
            </td>
          `;

          groupRow.addEventListener('click', () => {
            state.expandedGroups[gKey] = !isGroupExpanded;
            renderTreeTable();
          });

          tbody.appendChild(groupRow);

          // Render Records if Group is expanded
          if (isGroupExpanded) {
            filteredRecords.forEach(rec => {
              totalVisibleRecords++;
              const recRow = document.createElement('tr');
              recRow.className = 'tree-row-record';
              recRow.setAttribute('data-id', rec.id);

              const actionHtml = rec.isFixed
                ? `<span class="gemini-fixed-badge">✓ Fixed</span>`
                : `<button class="gemini-btn-fix" data-id="${rec.id}">✦ Fix</button>`;

              recRow.innerHTML = `
                <td class="record-indent-cell">
                  <a href="javascript:void(0)" class="gemini-mat-link">${escapeHtml(rec.material)}</a>
                </td>
                <td>${escapeHtml(rec.description)}</td>
                <td>${escapeHtml(rec.errorType)}</td>
                <td><strong>${escapeHtml(rec.plant)}</strong></td>
                <td><span class="gemini-type-pill">${escapeHtml(rec.matType)}</span></td>
                <td>${escapeHtml(rec.recommendation)}</td>
                <td>${actionHtml}</td>
              `;

              const fixBtn = recRow.querySelector('.gemini-btn-fix');
              if (fixBtn) {
                fixBtn.addEventListener('click', (e) => {
                  e.stopPropagation();
                  triggerFix(rec);
                });
              }

              tbody.appendChild(recRow);
            });
          }
        });
      }
    });

    const countHeader = document.getElementById('geminiVisibleCount');
    if (countHeader) countHeader.textContent = totalVisibleRecords;
  }

  function triggerFix(record) {
    if (typeof MaterialChatbot !== 'undefined' && MaterialChatbot.initiateFix) {
      MaterialChatbot.initiateFix(record);
    }
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  return {
    init: init,
    getState: function () { return state; },
    syncFilterState: function (plant, cv, mat, isApplied) {
      state.selectedPlant = plant || "";
      state.selectedCostVariant = cv || "";
      state.selectedMaterial = mat || "";
      state.applied = !!isApplied;

      const pInp = document.getElementById('geminiPlantInput');
      const cInp = document.getElementById('geminiCvInput');
      const mInp = document.getElementById('geminiMaterialInput');
      if (pInp) pInp.value = state.selectedPlant;
      if (cInp) cInp.value = state.selectedCostVariant;
      if (mInp) mInp.value = state.selectedMaterial;

      renderView();
    }
  };
})();

if (typeof module !== 'undefined' && module.exports) {
  module.exports = GeminiDesign;
}
