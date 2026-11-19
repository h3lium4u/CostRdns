/**
 * Design Comparison Switcher
 * Manages switching between Design 1 and Design 3
 * Ensures 100% isolation with zero style or DOM conflicts
 */

const DesignSwitcher = (function () {
  'use strict';

  const STORAGE_KEY = 'material_dashboard_selected_design';
  let currentDesign = '1';

  function init() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && ['1', '3'].includes(saved)) {
      currentDesign = saved;
    }

    setupTabs();
    applyDesign(currentDesign, false);
  }

  function setupTabs() {
    const tabs = document.querySelectorAll('#designSelectorBar .design-tab-btn');
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const target = tab.getAttribute('data-design');
        if (target && target !== currentDesign) {
          switchDesign(target);
        }
      });
    });
  }

  function switchDesign(designId) {
    let plant = "", cv = "", mat = "", applied = false;

    if (currentDesign === '1') {
      const p = document.getElementById('plantInput');
      const c = document.getElementById('cvInput');
      const m = document.getElementById('materialInput');
      const postApply = document.getElementById('postApplyContent');
      plant = p ? p.value : "";
      cv = c ? c.value : "";
      mat = m ? m.value : "";
      applied = postApply && !postApply.classList.contains('hidden');
    } else if (currentDesign === '3' && typeof ClaudeDesign !== 'undefined') {
      const st = ClaudeDesign.getState();
      plant = st.selectedPlant; cv = st.selectedCostVariant; mat = st.selectedMaterial; applied = st.applied;
    }

    currentDesign = designId;
    localStorage.setItem(STORAGE_KEY, designId);
    applyDesign(designId, true, { plant, cv, mat, applied });
  }

  function applyDesign(designId, syncFilters, filterData) {
    // Update tab active state
    const tabs = document.querySelectorAll('#designSelectorBar .design-tab-btn');
    tabs.forEach(tab => {
      const isActive = tab.getAttribute('data-design') === designId;
      tab.classList.toggle('active', isActive);
      tab.setAttribute('aria-selected', isActive.toString());
    });

    // Toggle wrapper visibility
    ['1', '3'].forEach(id => {
      const w = document.getElementById(`design${id}Wrapper`);
      if (w) w.classList.toggle('hidden', designId !== id);
    });

    // Sync filters to target design
    if (designId === '3' && typeof ClaudeDesign !== 'undefined') {
      if (syncFilters && filterData) ClaudeDesign.syncFilterState(filterData.plant, filterData.cv, filterData.mat, filterData.applied);
    }
  }

  return {
    init,
    switchDesign,
    getCurrentDesign: function () { return currentDesign; }
  };
})();

document.addEventListener('DOMContentLoaded', () => {
  if (typeof ClaudeDesign !== 'undefined') ClaudeDesign.init();
  DesignSwitcher.init();
});

if (typeof module !== 'undefined' && module.exports) {
  module.exports = DesignSwitcher;
}
