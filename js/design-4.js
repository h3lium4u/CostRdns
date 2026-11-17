/**
 * Design 4 – SAP Horizon Triage Console
 * Option A: Full-Width Table with Inline Row Expansion for Fix
 * Theme: SAP Horizon 2024 Design System (Clean, Crisp, Colorful, Enterprise)
 */

const Design4 = (function () {
  'use strict';

  // ── State ──
  let _state = {
    selectedPlant: '',
    selectedCostVariant: '',
    selectedMaterial: '',
    applied: false,
    activeCategory: 'all',
    records: [],
    selectedRecord: null, // holds currently expanded record
    plantOpen: false,
    cvOpen: false
  };

  // Severity metadata mapping per errorCategory
  const SEVERITY_MAP = {
    activityPrice:      { level: 'critical', label: 'Critical', order: 1, ringColor: '#E8743B' },
    uomMismatch:        { level: 'warning',  label: 'Warning',  order: 2, ringColor: '#19A979' },
    vendorMissing:      { level: 'info',     label: 'Info',     order: 3, ringColor: '#ED4A7B' },
    sourceListMissing:  { level: 'info',     label: 'Info',     order: 4, ringColor: '#945ECF' }
  };

  // ── Colorful Material Type Chip ──
  function matTypeChip(type) {
    const styles = {
      'FERT': 'background:#E8EAF6;color:#3949AB;border:1px solid #9FA8DA',
      'HALB': 'background:#FFF3E0;color:#E65100;border:1px solid #FFCC80',
      'ROH':  'background:#E8F5E9;color:#2E7D32;border:1px solid #A5D6A7'
    };
    const s = styles[type] || 'background:#F1F5F9;color:#475569;border:1px solid #CBD5E1';
    return `<span class="d4-type-chip" style="${s}">${type}</span>`;
  }

  // ── SVG Donut Ring Helper ──
  function buildRingSVG(count, total, strokeColor) {
    const r = 24;
    const cx = 32;
    const cy = 32;
    const circumference = 2 * Math.PI * r;
    const ratio = total > 0 ? Math.min(count / total, 1) : 0;
    const dash = Math.round(ratio * circumference * 10) / 10;
    
    return `
      <svg width="64" height="64" viewBox="0 0 64 64" aria-hidden="true">
        <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="#EDF1F5" stroke-width="5.5"/>
        <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${strokeColor}" stroke-width="5.5"
          stroke-dasharray="${dash} ${circumference}"
          stroke-linecap="round"
          style="transition: stroke-dasharray 0.5s ease-out;"/>
      </svg>`;
  }

  // ── KPI Ring Tile Component ──
  function buildKpiTile(cat, label, sublabel, count, maxCount, strokeColor, fixedCount, pendingCount) {
    const isActive = _state.activeCategory === cat;
    const svg = buildRingSVG(count, maxCount, strokeColor);
    const subcounts = (fixedCount !== undefined && pendingCount !== undefined)
      ? `<span class="d4-kpi-subcounts"><span class="d4-fixed-count">${fixedCount} Fixed</span> | <span class="d4-pending-count">${pendingCount} Pending</span></span>`
      : '';
    return `
      <div class="d4-kpi-tile${isActive ? ' active' : ''}" data-cat="${cat}" title="Filter by ${label}">
        <div class="d4-kpi-info">
          <span class="d4-kpi-label">${label}</span>
          <span class="d4-kpi-sublabel">${sublabel}</span>
          <span class="d4-kpi-number">${count}</span>
          ${subcounts}
        </div>
        <div class="d4-ring-wrap">
          ${svg}
          <span class="d4-ring-inner-val">${count}</span>
        </div>
      </div>`;
  }

  // ── Severity Badge Generator ──
  function sevBadge(cat, isFixed) {
    if (isFixed) {
      return `<span class="d4-sev-badge fixed"><span class="d4-sev-dot"></span>Resolved</span>`;
    }
    const s = SEVERITY_MAP[cat] || { level: 'info', label: 'Info' };
    return `<span class="d4-sev-badge ${s.level}"><span class="d4-sev-dot"></span>${s.label}</span>`;
  }

  // ── Sort Records: Severity Order, then Unfixed First ──
  function sortedRecords(records) {
    return [...records].sort((a, b) => {
      if (a.isFixed !== b.isFixed) return a.isFixed ? 1 : -1;
      const ao = (SEVERITY_MAP[a.errorCategory] || { order: 9 }).order;
      const bo = (SEVERITY_MAP[b.errorCategory] || { order: 9 }).order;
      return ao - bo;
    });
  }

  // ── Render KPI Ribbon ──
  function renderKpiRibbon() {
    const counts = MaterialData.calculateCounts(_state.records);
    const ribbon = document.getElementById('d4KpiRibbon');
    if (!ribbon) return;

    // Compute fixed/pending per category for sub-counts
    function subCounts(filterCat) {
      const recs = filterCat === 'all' ? _state.records : _state.records.filter(r => r.errorCategory === filterCat);
      const fixed = recs.filter(r => r.isFixed).length;
      return { fixed, pending: recs.length - fixed };
    }
    const sc = {
      all:               subCounts('all'),
      activityPrice:     subCounts('activityPrice'),
      uomMismatch:       subCounts('uomMismatch'),
      vendorMissing:     subCounts('vendorMissing'),
      sourceListMissing: subCounts('sourceListMissing')
    };

    ribbon.innerHTML = [
      buildKpiTile('all',               'Total Errors',        'All Categories',  counts.total,             23, '#1565C0', sc.all.fixed,               sc.all.pending),
      buildKpiTile('activityPrice',     'Activity Price',      'Tariff Mismatch', counts.activityPrice,     9,  '#E8743B', sc.activityPrice.fixed,     sc.activityPrice.pending),
      buildKpiTile('uomMismatch',       'UOM Mismatch',        'Unit Conflicts',  counts.uomMismatch,       6,  '#19A979', sc.uomMismatch.fixed,       sc.uomMismatch.pending),
      buildKpiTile('vendorMissing',     'Vendor Missing',      'Procurement',     counts.vendorMissing,     5,  '#ED4A7B', sc.vendorMissing.fixed,     sc.vendorMissing.pending),
      buildKpiTile('sourceListMissing', 'Source List Missing', 'MRP Logistics',   counts.sourceListMissing, 3,  '#945ECF', sc.sourceListMissing.fixed, sc.sourceListMissing.pending)
    ].join('');

    // Attach click events to tiles
    ribbon.querySelectorAll('.d4-kpi-tile').forEach(tile => {
      tile.addEventListener('click', () => {
        _state.activeCategory = tile.getAttribute('data-cat');
        _state.selectedRecord = null; // collapse any open row
        renderKpiRibbon();
        renderTriageTable();
      });
    });
  }

  // ── Render Triage Table with Inline Row Expansion (Option A) ──
  function renderTriageTable() {
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

    const sorted = sortedRecords(filtered);
    if (countEl) countEl.textContent = `${sorted.length} record${sorted.length !== 1 ? 's' : ''}`;

    if (sorted.length === 0) {
      tbody.innerHTML = `<tr><td colspan="8" class="d4-triage-empty">No error records match the current filter criteria.</td></tr>`;
      return;
    }

    let rowsHtml = '';
    sorted.forEach(r => {
      const sev = SEVERITY_MAP[r.errorCategory] || { level: 'info' };
      const sevClass = r.isFixed ? 'sev-fixed' : `sev-${sev.level}`;
      const isExpanded = _state.selectedRecord && _state.selectedRecord.id === r.id;

      // 1. Main Data Row
      rowsHtml += `
        <tr class="d4-data-row ${sevClass}${isExpanded ? ' expanded' : ''}" data-id="${r.id}">
          <td>${sevBadge(r.errorCategory, r.isFixed)}</td>
          <td><span class="d4-material-code">${r.material}</span></td>
          <td><div class="d4-desc-text" title="${r.description}">${r.description}</div></td>
          <td style="color:var(--d4-label); font-weight:600;">${r.errorType}</td>
          <td><span class="d4-plant-chip">${r.plant}</span></td>
          <td>${matTypeChip(r.matType)}</td>
          <td><div class="d4-res-preview" title="${r.recommendation}">${r.recommendation}</div></td>
          <td style="text-align: center;">
            ${r.isFixed
              ? `<span class="d4-resolved-badge">
                   <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>
                   <span>Fixed</span>
                 </span>`
              : `<button class="d4-btn-action-fix" data-fix-id="${r.id}" title="Expand and Fix">
                   <span>✦ Fix</span>
                 </button>`
            }
          </td>
        </tr>
      `;

      // 2. Option A: Inline Expansion Row (Accordion)
      if (isExpanded) {
        rowsHtml += `
          <tr class="d4-expand-row" data-expand-for="${r.id}">
            <td colspan="8">
              <div class="d4-expand-container">
                
                <!-- Heading & Metadata -->
                <div class="d4-expand-topbar">
                  <div class="d4-expand-heading">
                    <span class="d4-expand-mat-code">${r.material}</span>
                    <span class="d4-expand-mat-desc">${r.description}</span>
                    ${sevBadge(r.errorCategory, r.isFixed)}
                  </div>
                  
                  <div class="d4-expand-meta-row">
                    <div class="d4-expand-chip">
                      <span class="d4-expand-chip-key">Plant</span>
                      <span class="d4-expand-chip-val">${r.plant}</span>
                    </div>
                    <div class="d4-expand-chip">
                      <span class="d4-expand-chip-key">Cost Variant</span>
                      <span class="d4-expand-chip-val">${r.costVariant}</span>
                    </div>
                    <div class="d4-expand-chip">
                      <span class="d4-expand-chip-key">Material Type</span>
                      <span class="d4-expand-chip-val">${r.matType}</span>
                    </div>
                    <div class="d4-expand-chip">
                      <span class="d4-expand-chip-key">Error Type</span>
                      <span class="d4-expand-chip-val">${r.errorType}</span>
                    </div>
                  </div>
                </div>

                <!-- Actionable Resolution Box -->
                <div class="d4-expand-resolution-box">
                  <span class="d4-expand-res-title">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
                    Actionable Resolution Plan
                  </span>
                  <div class="d4-expand-res-text">${r.recommendation}</div>
                </div>

                <!-- Action Controls -->
                <div class="d4-expand-action-bar" id="d4ExpandActionBar-${r.id}">
                  <button class="d4-btn-cancel-expand" data-cancel-id="${r.id}">
                    <span>Cancel</span>
                  </button>
                  <button class="d4-btn-initiate-fix" data-initiate-id="${r.id}">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                    <span>Initiate Fix</span>
                  </button>
                </div>

              </div>
            </td>
          </tr>
        `;
      }
    });

    tbody.innerHTML = rowsHtml;
    attachTableEvents(tbody);
  }

  // ── Attach Events for Row Expansion & Fix Actions ──
  function attachTableEvents(tbody) {
    // 1. Click Row to Toggle Expansion
    tbody.querySelectorAll('tr.d4-data-row').forEach(row => {
      row.addEventListener('click', (e) => {
        // If clicking on an action button, let that handler process
        if (e.target.closest('.d4-btn-action-fix')) return;

        const id = row.getAttribute('data-id');
        const rec = _state.records.find(r => r.id === id);
        if (rec) {
          if (_state.selectedRecord && _state.selectedRecord.id === id) {
            _state.selectedRecord = null; // Toggle collapse
          } else {
            _state.selectedRecord = rec; // Expand
          }
          renderTriageTable();
        }
      });
    });

    // 2. Click "✦ Fix" Button directly
    tbody.querySelectorAll('.d4-btn-action-fix').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.getAttribute('data-fix-id');
        const rec = _state.records.find(r => r.id === id);
        if (rec) {
          _state.selectedRecord = rec;
          renderTriageTable();
        }
      });
    });

    // 3. Click "Cancel" inside expansion
    tbody.querySelectorAll('.d4-btn-cancel-expand').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        _state.selectedRecord = null;
        renderTriageTable();
      });
    });

    // 4. Click "Initiate Fix" inside expansion
    tbody.querySelectorAll('.d4-btn-initiate-fix').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.getAttribute('data-initiate-id');
        const rec = _state.records.find(r => r.id === id);
        if (!rec) return;

        // Button Loading State
        btn.disabled = true;
        btn.innerHTML = `<div class="d4-spinner"></div><span>Synchronizing with SAP ERP...</span>`;

        // Notify shared chatbot module if available
        if (typeof MaterialChatbot !== 'undefined' && MaterialChatbot.initiateFix) {
          MaterialChatbot.initiateFix(rec);
        }

        // Simulate asynchronous SAP transaction commit
        setTimeout(() => {
          // Mark fixed in local records
          _state.records = _state.records.map(r => r.id === id ? { ...r, isFixed: true } : r);

          // Dispatch event to sync with other designs & Recents
          document.dispatchEvent(new CustomEvent('material-record-fixed', {
            detail: {
              material: rec.material,
              description: rec.description,
              errorType: rec.errorType,
              plant: rec.plant,
              matType: rec.matType,
              recommendation: rec.recommendation
            }
          }));

          // Show confirmation banner inside expanded container
          const actionBar = document.getElementById(`d4ExpandActionBar-${id}`);
          if (actionBar) {
            actionBar.innerHTML = `
              <div class="d4-expand-success-banner">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                <span>Master data record successfully synchronized in plant ${rec.plant}.</span>
              </div>
            `;
          }

          // Smoothly close expansion after 900ms and refresh table & KPIs
          setTimeout(() => {
            _state.selectedRecord = null;
            renderKpiRibbon();
            renderTriageTable();
          }, 900);

        }, 700);
      });
    });
  }

  // ── Setup Dropdown Components ──
  function setupDropdown(inputId, dropdownId, items, stateKey) {
    const input = document.getElementById(inputId);
    const dropdown = document.getElementById(dropdownId);
    if (!input || !dropdown) return;

    function populate(filterText) {
      const q = filterText.toLowerCase();
      const matches = items.filter(it =>
        it.text.toLowerCase().includes(q) ||
        it.key.toLowerCase().includes(q)
      );

      if (matches.length === 0) {
        dropdown.innerHTML = `<div class="d4-dropdown-no-result">No matching options found</div>`;
      } else {
        dropdown.innerHTML = matches.map(it => `
          <div class="d4-dropdown-item${_state[stateKey] === it.key ? ' selected' : ''}" data-key="${it.key}">
            ${it.text}
          </div>
        `).join('');
      }

      dropdown.querySelectorAll('.d4-dropdown-item').forEach(item => {
        item.addEventListener('click', () => {
          const val = item.getAttribute('data-key');
          _state[stateKey] = val;
          input.value = val;
          dropdown.classList.add('hidden');
        });
      });
    }

    input.addEventListener('focus', () => {
      dropdown.classList.remove('hidden');
      populate(input.value);
    });

    input.addEventListener('input', () => {
      dropdown.classList.remove('hidden');
      populate(input.value);
    });

    document.addEventListener('click', (e) => {
      if (!input.contains(e.target) && !dropdown.contains(e.target)) {
        dropdown.classList.add('hidden');
      }
    });
  }

  // ── Show Content after Apply ──
  function showContent() {
    const emptyState = document.getElementById('d4EmptyState');
    const contentArea = document.getElementById('d4ContentArea');
    if (emptyState) emptyState.classList.add('hidden');
    if (contentArea) contentArea.classList.remove('hidden');

    renderKpiRibbon();
    renderTriageTable();
  }

  // ── Initialize Design 4 Controller ──
  function init() {
    // 1. Apply Button
    const applyBtn = document.getElementById('d4ApplyBtn');
    if (applyBtn) {
      applyBtn.addEventListener('click', () => {
        _state.selectedPlant = document.getElementById('d4PlantInput')?.value?.trim() || '';
        _state.selectedCostVariant = document.getElementById('d4CvInput')?.value?.trim() || '';
        _state.selectedMaterial = document.getElementById('d4MatInput')?.value?.trim() || '';
        _state.records = MaterialData.getInitialRecords();
        _state.applied = true;
        _state.selectedRecord = null;
        _state.activeCategory = 'all';
        showContent();
      });
    }

    // 2. Refresh Button
    const rfBtn = document.getElementById('d4RfBtn');
    if (rfBtn) {
      rfBtn.addEventListener('click', () => {
        if (_state.applied) {
          _state.records = MaterialData.getInitialRecords();
          _state.selectedRecord = null;
          _state.activeCategory = 'all';
          renderKpiRibbon();
          renderTriageTable();
        }
      });
    }

    // 3. Search Input in Table
    const searchInput = document.getElementById('d4TriageSearch');
    if (searchInput) {
      searchInput.addEventListener('input', () => {
        renderTriageTable();
      });
    }

    // 4. Collapse All Details Button
    const collapseBtn = document.getElementById('d4CollapseAllBtn');
    if (collapseBtn) {
      collapseBtn.addEventListener('click', () => {
        _state.selectedRecord = null;
        renderTriageTable();
      });
    }

    // 5. Recents — handled globally by MaterialChatbot.setupRecentsDrawer()
    // No separate handler needed here (avoids duplicate binding conflict)

    // 6. Setup searchable dropdowns
    setupDropdown('d4PlantInput', 'd4PlantDropdown', MaterialData.getPlants(), 'selectedPlant');
    setupDropdown('d4CvInput', 'd4CvDropdown', MaterialData.getCostVariants(), 'selectedCostVariant');

    // 7. Listen for cross-design fix events
    document.addEventListener('material-record-fixed', (e) => {
      if (!e.detail || !e.detail.material) return;
      _state.records = _state.records.map(r =>
        r.material === e.detail.material ? { ...r, isFixed: true } : r
      );
      if (_state.applied) {
        renderKpiRibbon();
        renderTriageTable();
      }
    });
  }

  // ── Public API ──
  return {
    init: init,
    getState: function () {
      return { ..._state };
    },
    syncFilterState: function (plant, cv, mat, applied) {
      if (plant) {
        _state.selectedPlant = plant;
        const inp = document.getElementById('d4PlantInput');
        if (inp) inp.value = plant;
      }
      if (cv) {
        _state.selectedCostVariant = cv;
        const inp = document.getElementById('d4CvInput');
        if (inp) inp.value = cv;
      }
      if (mat) {
        _state.selectedMaterial = mat;
        const inp = document.getElementById('d4MatInput');
        if (inp) inp.value = mat;
      }
      if (applied && !_state.applied) {
        _state.records = MaterialData.getInitialRecords();
        _state.applied = true;
        showContent();
      }
    }
  };
})();

if (typeof module !== 'undefined' && module.exports) {
  module.exports = Design4;
}
