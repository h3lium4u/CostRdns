/**
 * Material Error Dashboard - Main Application Controller
 * Manages view transitions, filter states, group expansion,
 * live search, table rendering, row selection, and event dispatching.
 */

(function () {
  'use strict';

  // Application State
  const state = {
    applied: false,
    selectedPlant: "", // Clean initial state (per user request: no default values)
    selectedCostVariant: "", // Clean initial state
    selectedMaterial: "", // Clean initial state
    selectedCategory: null, // null = Image 2 (unselected category), or 'total', 'activityPrice', etc.
    searchQuery: "",
    records: [],
    counts: {},
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

  document.addEventListener('DOMContentLoaded', initApp);

  function initApp() {
    // 1. Initialize data
    state.records = MaterialData.getInitialRecords();
    state.counts = MaterialData.calculateCounts(state.records);

    // 2. Initialize filter dropdowns
    setupPlantDropdown();
    setupCostVariantDropdown();
    setupMaterialInput();

    // 3. Setup Header Buttons
    document.getElementById('applyBtn').addEventListener('click', onApplyFilters);
    document.getElementById('rfBtn').addEventListener('click', onRefreshData);

    // 4. Setup Summary Card Clicks
    setupSummaryCardListeners();

    // 5. Setup Live Search Input
    const searchInput = document.getElementById('detailsSearchInput');
    if (searchInput) {
      searchInput.addEventListener('input', onSearchInput);
    }

    // 6. Initialize Chatbot
    MaterialChatbot.init(onRecordFixedSuccess);

    // 7. Render initial state (Image 1: empty illustration)
    renderApp();
  }

  /* ----------------------------------------------------
     FILTER BAR INITIALIZATION & SEARCHABLE DROPDOWNS
     ---------------------------------------------------- */

  function setupPlantDropdown() {
    const input = document.getElementById('plantInput');
    const dropdown = document.getElementById('plantDropdown');
    const plants = MaterialData.getPlants();

    function renderOptions(filterText = '') {
      dropdown.innerHTML = '';
      const filter = filterText.toLowerCase().trim();
      const filtered = plants.filter(p => p.key.toLowerCase().includes(filter) || p.text.toLowerCase().includes(filter));

      if (filtered.length === 0) {
        dropdown.innerHTML = '<div class="dropdown-item no-results">No results found</div>';
        return;
      }

      filtered.forEach(p => {
        const item = document.createElement('div');
        item.className = 'dropdown-item' + (p.key === state.selectedPlant ? ' selected' : '');
        item.textContent = p.key;
        item.title = p.text;
        item.addEventListener('click', () => {
          input.value = p.key;
          state.selectedPlant = p.key;
          dropdown.classList.add('hidden');
        });
        dropdown.appendChild(item);
      });
    }

    input.value = state.selectedPlant;
    renderOptions();

    input.addEventListener('focus', () => {
      renderOptions(input.value);
      dropdown.classList.remove('hidden');
    });

    input.addEventListener('input', () => {
      renderOptions(input.value);
      dropdown.classList.remove('hidden');
    });

    document.addEventListener('click', (e) => {
      if (!input.contains(e.target) && !dropdown.contains(e.target)) {
        dropdown.classList.add('hidden');
      }
    });
  }

  function setupCostVariantDropdown() {
    const input = document.getElementById('cvInput');
    const dropdown = document.getElementById('cvDropdown');
    const variants = MaterialData.getCostVariants();

    function renderOptions(filterText = '') {
      dropdown.innerHTML = '';
      const filter = filterText.toLowerCase().trim();
      const filtered = variants.filter(v => v.key.toLowerCase().includes(filter) || v.text.toLowerCase().includes(filter));

      if (filtered.length === 0) {
        dropdown.innerHTML = '<div class="dropdown-item no-results">No results found</div>';
        return;
      }

      filtered.forEach(v => {
        const item = document.createElement('div');
        item.className = 'dropdown-item' + (v.key === state.selectedCostVariant ? ' selected' : '');
        item.textContent = v.key;
        item.title = v.text;
        item.addEventListener('click', () => {
          input.value = v.key;
          state.selectedCostVariant = v.key;
          dropdown.classList.add('hidden');
        });
        dropdown.appendChild(item);
      });
    }

    input.value = state.selectedCostVariant;
    renderOptions();

    input.addEventListener('focus', () => {
      renderOptions(input.value);
      dropdown.classList.remove('hidden');
    });

    input.addEventListener('input', () => {
      renderOptions(input.value);
      dropdown.classList.remove('hidden');
    });

    document.addEventListener('click', (e) => {
      if (!input.contains(e.target) && !dropdown.contains(e.target)) {
        dropdown.classList.add('hidden');
      }
    });
  }

  function setupMaterialInput() {
    const input = document.getElementById('materialInput');
    input.value = state.selectedMaterial;
    input.addEventListener('input', (e) => {
      state.selectedMaterial = e.target.value.trim();
    });
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        onApplyFilters();
      }
    });
  }

  /* ----------------------------------------------------
     FILTER BAR ACTIONS: APPLY & REFRESH
     ---------------------------------------------------- */

  function onApplyFilters() {
    const plantVal = document.getElementById('plantInput').value.trim();
    const cvVal = document.getElementById('cvInput').value.trim();
    const matVal = document.getElementById('materialInput').value.trim();

    state.selectedPlant = plantVal;
    state.selectedCostVariant = cvVal;
    state.selectedMaterial = matVal;

    state.applied = true;

    // Show top brand title when applied
    const brandTitleGroup = document.getElementById('brandTitleGroup');
    if (brandTitleGroup) brandTitleGroup.classList.remove('hidden');
    const brandTitle = document.getElementById('brandTitle');
    if (brandTitle) brandTitle.classList.remove('hidden');

    // Recalculate counts
    state.counts = MaterialData.calculateCounts(state.records);

    renderApp();
    showToast("Filters applied successfully.");
  }

  function onRefreshData() {
    state.records = MaterialData.getInitialRecords();
    state.counts = MaterialData.calculateCounts(state.records);
    state.searchQuery = "";
    const searchInput = document.getElementById('detailsSearchInput');
    if (searchInput) searchInput.value = "";

    // Clear filters per clean state requirement
    state.selectedPlant = "";
    state.selectedCostVariant = "";
    state.selectedMaterial = "";
    const plantInp = document.getElementById('plantInput');
    const cvInp = document.getElementById('cvInput');
    const matInp = document.getElementById('materialInput');
    if (plantInp) plantInp.value = "";
    if (cvInp) cvInp.value = "";
    if (matInp) matInp.value = "";

    renderApp();
    showToast("Dashboard data refreshed.");
  }

  /* ----------------------------------------------------
     SUMMARY CARD INTERACTIONS
     ---------------------------------------------------- */

  function setupSummaryCardListeners() {
    const cards = document.querySelectorAll('.summary-card');
    cards.forEach(card => {
      card.addEventListener('click', () => {
        const category = card.getAttribute('data-category');
        selectCategory(category);
      });
    });
  }

  function selectCategory(categoryKey) {
    state.selectedCategory = categoryKey;
    state.searchQuery = "";
    const searchInput = document.getElementById('detailsSearchInput');
    if (searchInput) searchInput.value = "";

    renderApp();
  }

  /* ----------------------------------------------------
     LIVE SEARCH & GROUP EXPAND / COLLAPSE
     ---------------------------------------------------- */

  function onSearchInput(e) {
    state.searchQuery = e.target.value.toLowerCase().trim();
    renderErrorDetailsTable();
  }

  function toggleGroup(groupKey) {
    state.expandedGroups[groupKey] = !state.expandedGroups[groupKey];
    renderErrorDetailsTable();
  }

  /* ----------------------------------------------------
     MAIN RENDERING DISPATCHER
     ---------------------------------------------------- */

  function renderApp() {
    const emptyStateView = document.getElementById('initialEmptyState');
    const postApplyView = document.getElementById('postApplyContent');
    const unselectedStateView = document.getElementById('unselectedCategoryPrompt');
    const errorDetailsView = document.getElementById('errorDetailsContainer');

    // Update Card Counts
    updateCardCounts();

    if (!state.applied) {
      // State 1: Initial Dashboard State (Image 1)
      emptyStateView.classList.remove('hidden');
      postApplyView.classList.add('hidden');
      return;
    }

    // Post-Apply: Show summary cards container
    emptyStateView.classList.add('hidden');
    postApplyView.classList.remove('hidden');

    // Highlight selected card
    updateSelectedCardHighlight();

    if (!state.selectedCategory) {
      // State 2: After Apply, but no category clicked yet (Image 2)
      unselectedStateView.classList.remove('hidden');
      errorDetailsView.classList.add('hidden');
    } else {
      // State 3: Category selected, display Error Details (Image 3 & 4)
      unselectedStateView.classList.add('hidden');
      errorDetailsView.classList.remove('hidden');
      renderErrorDetailsHeader();
      renderErrorDetailsTable();
    }
  }

  function updateCardCounts() {
    const total = state.counts.total || 0;
    const ap = state.counts.activityPrice || 0;
    const um = state.counts.uomMismatch || 0;
    const vm = state.counts.vendorMissing || 0;
    const sl = state.counts.sourceListMissing || 0;

    const base = Math.max(total, 1);
    const pctAp = total > 0 ? ((ap / base) * 100).toFixed(1) : "0.0";
    const pctUm = total > 0 ? ((um / base) * 100).toFixed(1) : "0.0";
    const pctVm = total > 0 ? ((vm / base) * 100).toFixed(1) : "0.0";
    const pctSl = total > 0 ? ((sl / base) * 100).toFixed(1) : "0.0";

    // 1. Update Card Counts
    const elTotal = document.getElementById('countTotal');
    const elAp = document.getElementById('countActivityPrice');
    const elUm = document.getElementById('countUomMismatch');
    const elVm = document.getElementById('countVendorMissing');
    const elSl = document.getElementById('countSourceListMissing');

    if (elTotal) elTotal.textContent = total;
    if (elAp) elAp.textContent = ap;
    if (elUm) elUm.textContent = um;
    if (elVm) elVm.textContent = vm;
    if (elSl) elSl.textContent = sl;

    // 2. Update Color Slider / Proportion Bar Widths (Visual percentage indicator)
    const elBarTotal = document.getElementById('barTotal');
    const elBarAp = document.getElementById('barActivityPrice');
    const elBarUm = document.getElementById('barUomMismatch');
    const elBarVm = document.getElementById('barVendorMissing');
    const elBarSl = document.getElementById('barSourceListMissing');

    if (elBarTotal) elBarTotal.style.width = total > 0 ? "100%" : "0%";
    if (elBarAp) elBarAp.style.width = `${pctAp}%`;
    if (elBarUm) elBarUm.style.width = `${pctUm}%`;
    if (elBarVm) elBarVm.style.width = `${pctVm}%`;
    if (elBarSl) elBarSl.style.width = `${pctSl}%`;

    // 3. Update accessible tooltips on slider tracks
    if (elBarTotal && elBarTotal.parentElement) elBarTotal.parentElement.title = `Total: ${total} errors (100%)`;
    if (elBarAp && elBarAp.parentElement) elBarAp.parentElement.title = `Activity Price: ${ap} of ${total} errors (${pctAp}%)`;
    if (elBarUm && elBarUm.parentElement) elBarUm.parentElement.title = `UOM Mismatch: ${um} of ${total} errors (${pctUm}%)`;
    if (elBarVm && elBarVm.parentElement) elBarVm.parentElement.title = `Vendor Missing: ${vm} of ${total} errors (${pctVm}%)`;
    if (elBarSl && elBarSl.parentElement) elBarSl.parentElement.title = `Source List Missing: ${sl} of ${total} errors (${pctSl}%)`;
  }

  function updateSelectedCardHighlight() {
    const cards = document.querySelectorAll('.summary-card');
    cards.forEach(card => {
      const cat = card.getAttribute('data-category');
      if (cat === state.selectedCategory) {
        card.classList.add('card-selected');
      } else {
        card.classList.remove('card-selected');
      }
    });
  }

  /* ----------------------------------------------------
     ERROR DETAILS HEADER & GROUPED TABLE RENDERING
     ---------------------------------------------------- */

  function renderErrorDetailsHeader() {
    const meta = MaterialData.getCategoryMeta(state.selectedCategory);
    const count = state.counts[state.selectedCategory] || state.counts.total;

    const titleEl = document.getElementById('detailsCategoryTitle');
    const iconBadgeEl = document.getElementById('detailsCategoryBadge');

    if (titleEl) {
      titleEl.textContent = `${meta.title} – Error Details (${count})`;
    }

    if (iconBadgeEl) {
      iconBadgeEl.className = `category-icon-badge ${meta.badgeClass}`;
      iconBadgeEl.innerHTML = getSvgIcon(meta.icon, meta.accentColor);
    }
  }

  function renderErrorDetailsTable() {
    const container = document.getElementById('groupsListContainer');
    if (!container) return;
    container.innerHTML = '';

    // Filter records by category and search
    let records = state.records;
    if (state.selectedCategory && state.selectedCategory !== 'total') {
      records = records.filter(r => r.errorCategory === state.selectedCategory);
    }

    if (state.searchQuery) {
      const q = state.searchQuery;
      records = records.filter(r => 
        r.material.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q) ||
        r.recommendation.toLowerCase().includes(q) ||
        r.plant.toLowerCase().includes(q) ||
        r.errorType.toLowerCase().includes(q)
      );
    }

    if (records.length === 0) {
      container.innerHTML = `
        <div class="no-records-msg">
          <p>No material error records matching "<strong>${escapeHtml(state.searchQuery)}</strong>"</p>
        </div>
      `;
      return;
    }

    // Group records by groupKey
    const groupsMap = {};
    const groupOrder = [];

    records.forEach(r => {
      if (!groupsMap[r.groupKey]) {
        groupsMap[r.groupKey] = {
          key: r.groupKey,
          number: r.groupNumber,
          title: r.groupTitle,
          category: r.errorCategory,
          items: []
        };
        groupOrder.push(r.groupKey);
      }
      groupsMap[r.groupKey].items.push(r);
    });

    // Render each group
    groupOrder.forEach(gKey => {
      const grp = groupsMap[gKey];
      const isExpanded = state.expandedGroups[gKey] !== false;
      const meta = MaterialData.getCategoryMeta(grp.category);

      const groupWrapper = document.createElement('div');
      groupWrapper.className = 'error-group-wrapper';

      // Group Header Row
      const groupHeader = document.createElement('div');
      groupHeader.className = `group-header ${meta.groupClass}`;
      groupHeader.innerHTML = `
        <span class="group-chevron ${isExpanded ? 'expanded' : ''}">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M4 2L8 6L4 10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </span>
        <span class="group-number">${escapeHtml(grp.number)} (${grp.items.length})</span>
        <span class="group-title">${escapeHtml(grp.title)} (${grp.items.length})</span>
      `;

      groupHeader.addEventListener('click', () => toggleGroup(gKey));
      groupWrapper.appendChild(groupHeader);

      // Group Content (Table)
      if (isExpanded) {
        const table = document.createElement('table');
        table.className = 'error-records-table';
        table.innerHTML = `
          <thead>
            <tr>
              <th style="width: 44px; text-align: center;">#</th>
              <th style="width: 130px;">Material</th>
              <th style="width: 220px;">Description</th>
              <th style="width: 140px;">Error Type</th>
              <th style="width: 80px;">Plant</th>
              <th style="width: 90px;">Mat. Type</th>
              <th>Recommendation</th>
              <th style="width: 110px; text-align: right;">Action</th>
            </tr>
          </thead>
          <tbody></tbody>
        `;

        const tbody = table.querySelector('tbody');

        grp.items.forEach(item => {
          const row = document.createElement('tr');
          row.className = 'record-row' + (item.selected ? ' row-selected' : '');
          row.id = `row-${item.id}`;

          const itemMeta = MaterialData.getCategoryMeta(item.errorCategory);

          row.innerHTML = `
            <td style="text-align: center;">
              <input type="checkbox" class="record-checkbox" ${item.selected ? 'checked' : ''} data-id="${item.id}">
            </td>
            <td><a href="javascript:void(0)" class="material-link" data-id="${item.id}">${escapeHtml(item.material)}</a></td>
            <td><span class="mat-desc">${escapeHtml(item.description)}</span></td>
            <td><span class="badge-pill ${itemMeta.badgeClass}">${escapeHtml(item.errorType)}</span></td>
            <td><span class="cell-text">${escapeHtml(item.plant)}</span></td>
            <td><span class="cell-text">${escapeHtml(item.matType)}</span></td>
            <td><span class="recommendation-text">${escapeHtml(item.recommendation)}</span></td>
            <td style="text-align: right;">
              ${item.isFixed 
                ? `<span class="fixed-pill"><svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2.5 6L5 8.5L9.5 3.5" stroke="#15803d" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg> Fixed</span>` 
                : `<button class="fix-btn" data-id="${item.id}">✦ Fix</button>`
              }
            </td>
          `;

          // Checkbox toggle
          const chk = row.querySelector('.record-checkbox');
          chk.addEventListener('change', (e) => {
            item.selected = e.target.checked;
            if (item.selected) {
              row.classList.add('row-selected');
            } else {
              row.classList.remove('row-selected');
            }
          });

          // Material Link click
          const link = row.querySelector('.material-link');
          link.addEventListener('click', () => {
            showToast(`Material ${item.material}: ${item.description}`);
          });

          // Fix Button click
          const fixBtn = row.querySelector('.fix-btn');
          if (fixBtn) {
            fixBtn.addEventListener('click', () => {
              // Highlight row with checkbox selection as shown in Reference Image 4!
              item.selected = true;
              chk.checked = true;
              row.classList.add('row-selected');

              // Launch Chatbot with dynamic prompt
              MaterialChatbot.initiateFix(item);
            });
          }

          tbody.appendChild(row);
        });

        groupWrapper.appendChild(table);
      }

      container.appendChild(groupWrapper);
    });
  }

  /* ----------------------------------------------------
     RECORD FIX SUCCESS CALLBACK (From Chatbot)
     ---------------------------------------------------- */

  function onRecordFixedSuccess(recordId) {
    const record = state.records.find(r => r.id === recordId);
    if (!record) return;

    // Update target record status
    record.isFixed = true;
    record.selected = false;

    // Recalculate counts
    state.counts = MaterialData.calculateCounts(state.records);

    // Re-render table and cards
    updateCardCounts();
    renderErrorDetailsTable();

    showToast(`✓ Resolved ${record.errorType} for ${record.material}`);
  }

  /* ----------------------------------------------------
     HELPER UTILITIES & SVG ICONS
     ---------------------------------------------------- */

  function getSvgIcon(type, color = 'currentColor') {
    switch (type) {
      case 'tag':
        return `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path><line x1="7" y1="7" x2="7.01" y2="7"></line></svg>`;
      case 'scale':
        return `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v18M6 8l6-5 6 5M3 13l3-5 3 5a3 3 0 0 1-6 0zm12 0l3-5 3 5a3 3 0 0 1-6 0z"></path></svg>`;
      case 'users':
        return `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>`;
      case 'list':
        return `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>`;
      case 'layers':
      default:
        return `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline><polyline points="2 12 12 17 22 12"></polyline></svg>`;
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

  function showToast(message) {
    let toast = document.getElementById('globalToast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'globalToast';
      toast.className = 'global-toast';
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => {
      toast.classList.remove('show');
    }, 2800);
  }

})();
