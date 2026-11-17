/**
 * Design 3: Claude Controller
 * Theme D: Subtle Gradient Enterprise
 * UX Structure: Tabbed Accordion Console
 */

const ClaudeDesign = (function () {
  'use strict';

  const state = {
    applied: false,
    selectedPlant: "",
    selectedCostVariant: "",
    selectedMaterial: "",
    activeTab: "all", // 'all', 'activityPrice', 'uomMismatch', 'vendorMissing', 'sourceListMissing'
    searchQuery: "",
    records: [],
    counts: {},
    expandedAccordions: {
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
    setupSummaryCardListeners();
    setupTabListeners();
    setupSearch();

    // Listen to shared record fix event dispatched by MaterialChatbot
    window.addEventListener('material-record-fixed', (e) => {
      const fixedId = e.detail && e.detail.recordId;
      if (fixedId) {
        const target = state.records.find(r => r.id === fixedId);
        if (target) {
          target.isFixed = true;
          state.counts = MaterialData.calculateCounts(state.records);
          renderSummaryCards();
          renderTabs();
          renderAccordions();
        }
      }
    });

    renderView();
  }

  function setupDropdowns() {
    // Plant dropdown
    const plantInp = document.getElementById('claudePlantInput');
    const plantDrop = document.getElementById('claudePlantDropdown');
    const plants = MaterialData.getPlants();

    function renderPlantOpts(txt = '') {
      if (!plantDrop) return;
      plantDrop.innerHTML = '';
      const filter = txt.toLowerCase().trim();
      const filtered = plants.filter(p => p.key.toLowerCase().includes(filter) || p.text.toLowerCase().includes(filter));

      if (filtered.length === 0) {
        plantDrop.innerHTML = '<div class="claude-dropdown-item no-results">No results found</div>';
        return;
      }

      filtered.forEach(p => {
        const item = document.createElement('div');
        item.className = 'claude-dropdown-item' + (p.key === state.selectedPlant ? ' selected' : '');
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

    // Cost Variant dropdown
    const cvInp = document.getElementById('claudeCvInput');
    const cvDrop = document.getElementById('claudeCvDropdown');
    const variants = MaterialData.getCostVariants();

    function renderCvOpts(txt = '') {
      if (!cvDrop) return;
      cvDrop.innerHTML = '';
      const filter = txt.toLowerCase().trim();
      const filtered = variants.filter(v => v.key.toLowerCase().includes(filter) || v.text.toLowerCase().includes(filter));

      if (filtered.length === 0) {
        cvDrop.innerHTML = '<div class="claude-dropdown-item no-results">No results found</div>';
        return;
      }

      filtered.forEach(v => {
        const item = document.createElement('div');
        item.className = 'claude-dropdown-item' + (v.key === state.selectedCostVariant ? ' selected' : '');
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
    const applyBtn = document.getElementById('claudeApplyBtn');
    const rfBtn = document.getElementById('claudeRfBtn');
    const matInput = document.getElementById('claudeMaterialInput');

    if (applyBtn) {
      applyBtn.addEventListener('click', () => {
        const pVal = document.getElementById('claudePlantInput').value.trim();
        const cvVal = document.getElementById('claudeCvInput').value.trim();
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
        state.activeTab = "all";

        const pInp = document.getElementById('claudePlantInput');
        const cInp = document.getElementById('claudeCvInput');
        const mInp = document.getElementById('claudeMaterialInput');
        if (pInp) pInp.value = '';
        if (cInp) cInp.value = '';
        if (mInp) mInp.value = '';

        renderView();
      });
    }
  }

  function setupSummaryCardListeners() {
    const cards = document.querySelectorAll('#design3Wrapper .claude-card');
    cards.forEach(card => {
      card.addEventListener('click', () => {
        const cat = card.getAttribute('data-tab');
        if (cat) {
          state.activeTab = cat;
          renderTabs();
          renderAccordions();
          highlightActiveCard();
        }
      });
    });
  }

  function setupTabListeners() {
    const tabBtns = document.querySelectorAll('#design3Wrapper .claude-tab-btn');
    tabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const tab = btn.getAttribute('data-tab');
        state.activeTab = tab;
        renderTabs();
        renderAccordions();
        highlightActiveCard();
      });
    });
  }

  function setupSearch() {
    const searchInp = document.getElementById('claudeTabSearchInput');
    if (searchInp) {
      searchInp.addEventListener('input', (e) => {
        state.searchQuery = e.target.value.toLowerCase().trim();
        renderAccordions();
      });
    }
  }

  function renderView() {
    const emptyState = document.getElementById('claudeEmptyState');
    const contentArea = document.getElementById('claudeContentArea');

    if (!state.applied) {
      if (emptyState) emptyState.classList.remove('hidden');
      if (contentArea) contentArea.classList.add('hidden');
    } else {
      if (emptyState) emptyState.classList.add('hidden');
      if (contentArea) contentArea.classList.remove('hidden');
      renderSummaryCards();
      renderTabs();
      renderAccordions();
      highlightActiveCard();
    }
  }

  function renderSummaryCards() {
    const counts = state.counts;
    const cTotal = document.getElementById('claudeCountTotal');
    const cAp = document.getElementById('claudeCountAp');
    const cUm = document.getElementById('claudeCountUm');
    const cVm = document.getElementById('claudeCountVm');
    const cSl = document.getElementById('claudeCountSl');

    if (cTotal) cTotal.textContent = counts.total;
    if (cAp) cAp.textContent = counts.activityPrice;
    if (cUm) cUm.textContent = counts.uomMismatch;
    if (cVm) cVm.textContent = counts.vendorMissing;
    if (cSl) cSl.textContent = counts.sourceListMissing;
  }

  function highlightActiveCard() {
    const cards = document.querySelectorAll('#design3Wrapper .claude-card');
    cards.forEach(card => {
      const tab = card.getAttribute('data-tab');
      if (tab === state.activeTab) {
        card.classList.add('active');
      } else {
        card.classList.remove('active');
      }
    });
  }

  function renderTabs() {
    const counts = state.counts;
    const tabBtns = document.querySelectorAll('#design3Wrapper .claude-tab-btn');
    tabBtns.forEach(btn => {
      const tab = btn.getAttribute('data-tab');
      if (tab === state.activeTab) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }

      const countBadge = btn.querySelector('.claude-tab-count');
      if (countBadge) {
        if (tab === 'all') countBadge.textContent = counts.total;
        else if (counts[tab] !== undefined) countBadge.textContent = counts[tab];
      }
    });
  }

  /**
   * Renders the modular accordion groups inside the active category tab
   */
  function renderAccordions() {
    const container = document.getElementById('claudeAccordionsBody');
    if (!container) return;
    container.innerHTML = '';

    const categoriesDef = [
      { key: "activityPrice", title: "Activity Price", groups: ["1.1", "1.2", "1.3"] },
      { key: "uomMismatch", title: "UOM Mismatch", groups: ["2.1", "2.2"] },
      { key: "vendorMissing", title: "Vendor Missing", groups: ["3.1", "3.2"] },
      { key: "sourceListMissing", title: "Source List Missing", groups: ["4.1"] }
    ];

    let relevantCategories = [];
    if (state.activeTab === 'all') {
      relevantCategories = categoriesDef;
    } else {
      relevantCategories = categoriesDef.filter(c => c.key === state.activeTab);
    }

    let renderedAny = false;

    relevantCategories.forEach(cat => {
      cat.groups.forEach(gKey => {
        const groupRecords = state.records.filter(r => r.errorCategory === cat.key && r.groupKey === gKey);
        if (groupRecords.length === 0) return;

        const groupTitle = groupRecords[0].groupTitle || `Group ${gKey}`;

        // Live filter
        const filteredRecords = groupRecords.filter(r =>
          !state.searchQuery ||
          r.material.toLowerCase().includes(state.searchQuery) ||
          r.description.toLowerCase().includes(state.searchQuery)
        );

        if (filteredRecords.length === 0 && state.searchQuery) return;

        renderedAny = true;
        const isExpanded = state.expandedAccordions[gKey] !== false;

        const accordionEl = document.createElement('div');
        accordionEl.className = 'claude-group-accordion';

        accordionEl.innerHTML = `
          <div class="claude-accordion-header" data-gkey="${gKey}">
            <div class="claude-accordion-left">
              <span class="claude-chevron ${isExpanded ? 'expanded' : ''}">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
              </span>
              <span class="claude-group-pill">Group ${gKey}</span>
              <span class="claude-group-title">${escapeHtml(groupTitle)}</span>
            </div>
            <span class="claude-pill-tag">${groupRecords.length} records</span>
          </div>
          <div class="claude-accordion-content ${isExpanded ? '' : 'hidden'}">
            <table class="claude-record-table">
              <thead>
                <tr>
                  <th>Material</th>
                  <th>Description</th>
                  <th>Error Type</th>
                  <th>Plant</th>
                  <th>Material Type</th>
                  <th>Recommended Action</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                ${filteredRecords.map(rec => `
                  <tr data-id="${rec.id}">
                    <td class="claude-mat-name">${escapeHtml(rec.material)}</td>
                    <td>${escapeHtml(rec.description)}</td>
                    <td>${escapeHtml(rec.errorType)}</td>
                    <td><strong>${escapeHtml(rec.plant)}</strong></td>
                    <td><span class="claude-pill-tag">${escapeHtml(rec.matType)}</span></td>
                    <td>${escapeHtml(rec.recommendation)}</td>
                    <td>
                      ${rec.isFixed
                        ? `<span class="claude-fixed-tag">✓ Fixed</span>`
                        : `<button class="claude-btn-fix" data-id="${rec.id}">✦ Fix</button>`
                      }
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        `;

        // Toggle header
        const headerEl = accordionEl.querySelector('.claude-accordion-header');
        headerEl.addEventListener('click', () => {
          state.expandedAccordions[gKey] = !isExpanded;
          renderAccordions();
        });

        // Wire fix buttons
        const fixBtns = accordionEl.querySelectorAll('.claude-btn-fix');
        fixBtns.forEach(btn => {
          btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const id = btn.getAttribute('data-id');
            const targetRec = state.records.find(r => r.id === id);
            if (targetRec) {
              triggerFix(targetRec);
            }
          });
        });

        container.appendChild(accordionEl);
      });
    });

    if (!renderedAny) {
      container.innerHTML = `
        <div style="padding: 3rem 1rem; text-align: center; color: #64748B;">
          No matching records found for "<strong>${escapeHtml(state.searchQuery)}</strong>"
        </div>
      `;
    }
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

      const pInp = document.getElementById('claudePlantInput');
      const cInp = document.getElementById('claudeCvInput');
      const mInp = document.getElementById('claudeMaterialInput');
      if (pInp) pInp.value = state.selectedPlant;
      if (cInp) cInp.value = state.selectedCostVariant;
      if (mInp) mInp.value = state.selectedMaterial;

      renderView();
    }
  };
})();

if (typeof module !== 'undefined' && module.exports) {
  module.exports = ClaudeDesign;
}
