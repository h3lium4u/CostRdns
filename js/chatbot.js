/**
 * Material Error Dashboard - Floating Chatbot Module (Material Assistant)
 * Implements:
 * 1. Default Interactive AI Conversational Chat with prompt input and intelligent SAP ERP responses
 * 2. On-demand Fix Prompt (WITHOUT EMOJIS) with Fix & Cancel actions, triggered strictly on Fix click
 * 3. Left-side Recents Drawer (Light Theme, Plain Titles Only, No Fixed/Pending Badges)
 */

const MaterialChatbot = (function () {
  'use strict';

  let isOpen = false;
  let activePendingRecord = null;
  let activePendingBatch = null;
  let onFixCompletedCallback = null;
  let activeRecentId = "rec-ux-design";

  // Pre-populated realistic message history matching reference (Plain titles only!)
  let recents = [
    {
      id: "rec-ux-design",
      title: "Explain UI UX Design",
      type: "chat",
      query: "Explain UI UX Design",
      reply: "Modern enterprise UI/UX design focuses on <strong>minimalism, clarity, and task-efficiency</strong>. In this SAP Fiori Material Error Dashboard, we eliminated visual clutter, utilized a refined blue-and-white color palette, engineered proportional progress bars, and placed actionable controls right in context.",
      time: "10:30 AM"
    },
    {
      id: "rec-halb-3310",
      title: "Fix HALB-3310",
      type: "fix",
      record: {
        id: "ERR-AP-03",
        material: "HALB-3310",
        description: "Sub-assembly bracket",
        errorType: "Activity Price",
        plant: "IN10",
        costVariant: "PPC1",
        matType: "HALB",
        recommendation: "Correct activity price in KP26 for fabrication cost center.",
        isFixed: false
      },
      time: "10:24 AM"
    },
    {
      id: "rec-figma",
      title: "Figma Prototype Review",
      type: "chat",
      query: "Figma Prototype Review",
      reply: "The Figma prototype incorporates 8px grid spacing, Inter enterprise typography, high-contrast accessible color tokens, and responsive header elements with right-aligned filter toolbars.",
      time: "10:20 AM"
    },
    {
      id: "rec-ux-sugg",
      title: "UX design suggestions",
      type: "chat",
      query: "UX design suggestions",
      reply: "Recommended next improvements: implement keyboard shortcuts (Alt+A for Apply, Alt+F for Fix), add multi-select batch resolution for identical error groups, and integrate SAP change-log audits.",
      time: "10:15 AM"
    },
    {
      id: "rec-sap-cost",
      title: "Explain SAP Costing Errors",
      type: "chat",
      query: "Explain SAP Costing Errors",
      reply: "In SAP Product Costing (CO-PC), costing errors typically stem from:<br>• <strong>Activity Price Missing (CK465)</strong>: Missing tariff rate in transaction KP26.<br>• <strong>UOM Mismatch</strong>: Conflict between PO order unit and base unit in MM02.<br>• <strong>Missing Info Record (ME11)</strong>: No approved vendor quotation or net price.<br>• <strong>Source List (ME01)</strong>: Requirement active without valid procurement source.",
      time: "10:10 AM"
    },
    {
      id: "rec-genai-capm",
      title: "GenAI CAPM Logic Split",
      type: "chat",
      query: "GenAI CAPM Logic Split",
      reply: "SAP CAP (Cloud Application Programming Model) service split: Node.js/Java service layer handles standard OData V4 operations, while GenAI pipeline connects via LangChain orchestration for automated error reconciliation.",
      time: "09:58 AM"
    },
    {
      id: "rec-rmi-2142",
      title: "Fix RMI-2142",
      type: "fix",
      record: {
        id: "ERR-AP-01",
        material: "RMI-2142",
        description: "Polypropylene granules",
        errorType: "Activity Price",
        plant: "IN10",
        costVariant: "PPC1",
        matType: "ROH",
        recommendation: "Update activity price in KP26 for cost center CC-IN10-PROC.",
        isFixed: true
      },
      time: "09:45 AM"
    },
    {
      id: "rec-linkedin",
      title: "LinkedIn Certification Post",
      type: "chat",
      query: "LinkedIn Certification Post",
      reply: "Draft announcement: 'Excited to showcase our next-generation Material Error Dashboard powered by SAP Fiori principles and GenAI automated reconciliation!'",
      time: "09:40 AM"
    },
    {
      id: "rec-plugin",
      title: "Plugin",
      type: "chat",
      query: "Plugin architecture",
      reply: "The dashboard is modularized into discrete UI5-compatible controllers (Data, Chatbot, View Engine) to enable seamless encapsulation inside SAP BTP Launchpad plugins.",
      time: "09:30 AM"
    },
    {
      id: "rec-rmi-2187",
      title: "Fix RMI-2187",
      type: "fix",
      record: {
        id: "ERR-AP-02",
        material: "RMI-2187",
        description: "Sodium hydroxide",
        errorType: "Activity Price",
        plant: "IN10",
        costVariant: "PPC1",
        matType: "ROH",
        recommendation: "Maintain activity price in KP26 for chemical processing cost center.",
        isFixed: false
      },
      time: "09:20 AM"
    },
    {
      id: "rec-sap-roles",
      title: "Optimize SAP Technology Roles",
      type: "chat",
      query: "Optimize SAP Technology Roles",
      reply: "Role authorizations aligned: Material Master Controller (SAP_BR_PRODN_ENG_DISC) handles error reviews, while Cost Accountant (SAP_BR_PRODN_COST_ACCT) authorizes automated KP26 updates.",
      time: "09:10 AM"
    },
    {
      id: "rec-leave-msg",
      title: "Write leave message",
      type: "chat",
      query: "Write leave message",
      reply: "Standard enterprise out-of-office response template configured with designated escalation contact for plant costing issues.",
      time: "Yesterday"
    },
    {
      id: "rec-js-dash",
      title: "JS Dashboard Ideas",
      type: "chat",
      query: "JS Dashboard Ideas",
      reply: "Architecture implemented using standard vanilla ES6 modules with complete UI5 component mapping capability.",
      time: "Yesterday"
    },
    {
      id: "rec-presc",
      title: "Prescription Review",
      type: "chat",
      query: "Prescription Review",
      reply: "Resolution recommendations validated against SAP standard transaction codes and best practices.",
      time: "2 days ago"
    }
  ];

  function formatCurrentTime() {
    const now = new Date();
    let hours = now.getHours();
    const minutes = now.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    const strMin = minutes < 10 ? '0' + minutes : minutes;
    return `${hours}:${strMin} ${ampm}`;
  }

  function init(onFixSuccess) {
    onFixCompletedCallback = onFixSuccess;

    const toggleBtn = document.getElementById('chatbotToggleBtn');
    const closeBtn = document.getElementById('chatbotCloseBtn');
    const maximizeBtn = document.getElementById('chatbotMaximizeBtn');
    const recentsBtn = document.getElementById('chatbotRecentsBtn');
    const sidebarCloseBtn = document.getElementById('chatbotSidebarCloseBtn');
    const sidebarSearch = document.getElementById('chatbotSidebarSearch');
    const fixActionBtn = document.getElementById('chatbotFixActionBtn');
    const cancelActionBtn = document.getElementById('chatbotCancelActionBtn');
    const sendBtn = document.getElementById('chatSendBtn');
    const userInput = document.getElementById('chatUserInput');

    if (toggleBtn) toggleBtn.addEventListener('click', toggle);
    if (closeBtn) closeBtn.addEventListener('click', close);
    if (maximizeBtn) maximizeBtn.addEventListener('click', toggleMaximize);
    
    // Toggle internal recent chats sidebar inside chat window
    if (recentsBtn) {
      recentsBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleInternalSidebar();
      });
    }

    if (sidebarCloseBtn) {
      sidebarCloseBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        closeInternalSidebar();
      });
    }

    if (sidebarSearch) {
      sidebarSearch.addEventListener('input', (e) => {
        renderInternalRecentsList(e.target.value);
      });
    }

    if (fixActionBtn) fixActionBtn.addEventListener('click', confirmFix);
    if (cancelActionBtn) cancelActionBtn.addEventListener('click', cancelFix);

    // Interactive Chat Input
    if (sendBtn) {
      sendBtn.addEventListener('click', () => {
        if (userInput) handleUserSendMessage(userInput.value);
      });
    }

    if (userInput) {
      userInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          handleUserSendMessage(userInput.value);
        }
      });
    }

    // Quick suggestion chips inside chat
    setupQuickChips();

    // Setup Left-Side Recents Drawer
    setupRecentsDrawer();
    renderRecentsList();
    renderInternalRecentsList();
  }

  function toggleMaximize() {
    const popup = document.getElementById('chatbotPopup');
    if (!popup) return;
    if (popup.classList.contains('hidden')) {
      open();
    }
    popup.classList.toggle('maximized');
    updateMaximizeBtnState();
  }

  function maximize() {
    const popup = document.getElementById('chatbotPopup');
    if (!popup) return;
    if (popup.classList.contains('hidden')) {
      open();
    }
    if (!popup.classList.contains('maximized')) {
      popup.classList.add('maximized');
      updateMaximizeBtnState();
    }
  }

  function isMaximized() {
    const popup = document.getElementById('chatbotPopup');
    return popup ? popup.classList.contains('maximized') : false;
  }

  function updateMaximizeBtnState() {
    const popup = document.getElementById('chatbotPopup');
    const maxBtn = document.getElementById('chatbotMaximizeBtn');
    if (!popup || !maxBtn) return;
    const isMax = popup.classList.contains('maximized');
    maxBtn.setAttribute('title', isMax ? 'Minimize / Restore Window' : 'Maximize Window');
  }

  /* ----------------------------------------------------
     INTERNAL RECENT CHATS SIDEBAR (Inside Chat Window)
     ---------------------------------------------------- */

  function toggleInternalSidebar() {
    const sidebar = document.getElementById('chatbotInternalSidebar');
    if (!sidebar) return;
    const isCollapsed = sidebar.classList.contains('collapsed');
    if (isCollapsed) {
      sidebar.classList.remove('collapsed');
      const searchInput = document.getElementById('chatbotSidebarSearch');
      if (searchInput) searchInput.focus();
    } else {
      sidebar.classList.add('collapsed');
    }
    renderInternalRecentsList();
  }

  function openInternalSidebar() {
    const sidebar = document.getElementById('chatbotInternalSidebar');
    if (sidebar) {
      sidebar.classList.remove('collapsed');
      renderInternalRecentsList();
    }
  }

  function closeInternalSidebar() {
    const sidebar = document.getElementById('chatbotInternalSidebar');
    if (sidebar) {
      sidebar.classList.add('collapsed');
    }
  }

  function renderInternalRecentsList(filterText = '') {
    const container = document.getElementById('chatbotInternalRecentsList');
    if (!container) return;

    const term = (filterText || '').trim().toLowerCase();
    const filtered = recents.filter(item => {
      if (!term) return true;
      const titleMatch = (item.title || '').toLowerCase().includes(term);
      const queryMatch = (item.query || '').toLowerCase().includes(term);
      const matMatch = (item.record && item.record.material || '').toLowerCase().includes(term);
      return titleMatch || queryMatch || matMatch;
    });

    container.innerHTML = '';
    if (filtered.length === 0) {
      container.innerHTML = `<div class="chatbot-sidebar-empty">No matching recent items found.</div>`;
      return;
    }

    filtered.forEach(item => {
      const itemEl = document.createElement('div');
      itemEl.className = 'chatbot-sidebar-item' + (item.id === activeRecentId ? ' active' : '');
      itemEl.setAttribute('data-id', item.id);

      let iconSvg = '';
      let typeBadge = '';
      if (item.type === 'whereUsed') {
        iconSvg = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line><line x1="11" y1="8" x2="11" y2="14"></line><line x1="8" y1="11" x2="14" y2="11"></line></svg>`;
        typeBadge = `<span class="sidebar-item-pill pill-wu">CS15</span>`;
      } else if (item.type === 'fix' || item.type === 'batchFix') {
        iconSvg = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
        typeBadge = `<span class="sidebar-item-pill pill-fix">Fix</span>`;
      } else {
        iconSvg = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>`;
        typeBadge = `<span class="sidebar-item-pill pill-chat">AI</span>`;
      }

      itemEl.innerHTML = `
        <div class="sidebar-item-icon">${iconSvg}</div>
        <div class="sidebar-item-content">
          <div class="sidebar-item-title-row">
            <span class="sidebar-item-title" title="${escapeHtml(item.title)}">${escapeHtml(item.title)}</span>
            ${typeBadge}
          </div>
          <div class="sidebar-item-time">${escapeHtml(item.time || 'Recent')}</div>
        </div>
      `;

      itemEl.addEventListener('click', () => {
        selectRecentItem(item.id);
        const popup = document.getElementById('chatbotPopup');
        if (popup && !popup.classList.contains('maximized')) {
          closeInternalSidebar();
        }
      });

      container.appendChild(itemEl);
    });
  }

  function toggleRecentsDrawer() {
    const drawer = document.getElementById('recentsDrawer');
    if (!drawer) return;
    const isHidden = drawer.classList.contains('hidden');
    if (isHidden) {
      drawer.classList.remove('hidden');
    } else {
      drawer.classList.add('hidden');
    }
  }

  function setupQuickChips() {
    const chips = document.querySelectorAll('.chat-chip');
    chips.forEach(chip => {
      chip.addEventListener('click', () => {
        const query = chip.getAttribute('data-query') || chip.textContent;
        handleUserSendMessage(query);
      });
    });
  }

  function setupRecentsDrawer() {
    const drawer = document.getElementById('recentsDrawer');
    const toggleBtns = [
      document.getElementById('recentsToggleBtn')
    ].filter(Boolean);
    const closeBtn = document.getElementById('closeRecentsDrawerBtn');

    toggleBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (!drawer) return;
        const isHidden = drawer.classList.contains('hidden');
        if (isHidden) {
          drawer.classList.remove('hidden');
          toggleBtns.forEach(b => b.classList.add('active'));
        } else {
          drawer.classList.add('hidden');
          toggleBtns.forEach(b => b.classList.remove('active'));
        }
      });
    });

    if (closeBtn && drawer) {
      closeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        drawer.classList.add('hidden');
        toggleBtns.forEach(b => b.classList.remove('active'));
      });
    }

    // Close when clicking outside drawer
    document.addEventListener('click', (e) => {
      if (!drawer || drawer.classList.contains('hidden')) return;
      const isClickOnToggle = toggleBtns.some(b => b && b.contains(e.target));
      if (!drawer.contains(e.target) && !isClickOnToggle) {
        drawer.classList.add('hidden');
        toggleBtns.forEach(b => b.classList.remove('active'));
      }
    });
  }

  function toggle() {
    if (isOpen) {
      close();
    } else {
      open();
    }
  }

  function open() {
    isOpen = true;
    const popup = document.getElementById('chatbotPopup');
    if (popup) {
      popup.classList.remove('hidden');
      const input = document.getElementById('chatUserInput');
      if (input && !activePendingRecord) {
        setTimeout(() => input.focus(), 150);
      }
    }
  }

  function close() {
    isOpen = false;
    const popup = document.getElementById('chatbotPopup');
    if (popup) {
      popup.classList.add('hidden');
    }
  }

  /**
   * Renders the Recents History List on the Left Drawer
   * Plain text titles ONLY, NO Fixed/Pending status badges!
   */
  function renderRecentsList() {
    const listContainer = document.getElementById('recentsList');
    if (!listContainer) return;

    listContainer.innerHTML = '';
    recents.forEach(item => {
      const itemEl = document.createElement('div');
      itemEl.className = 'recent-title-item' + (item.id === activeRecentId ? ' active' : '');
      itemEl.setAttribute('data-id', item.id);
      itemEl.textContent = item.title;
      itemEl.title = item.title;

      itemEl.addEventListener('click', () => {
        selectRecentItem(item.id);
      });

      listContainer.appendChild(itemEl);
    });
  }

  function selectRecentItem(id) {
    activeRecentId = id;
    renderRecentsList();
    renderInternalRecentsList();

    const targetItem = recents.find(r => r.id === id);
    if (!targetItem) return;

    open();

    if (targetItem.type === "whereUsedBatch") {
      renderBatchWhereUsedCardInChat(targetItem.data || MaterialData.getBatchWhereUsedData(targetItem.records));
    } else if (targetItem.type === "whereUsed") {
      renderWhereUsedCardInChat(targetItem.data || targetItem.record);
    } else if (targetItem.type === "fix" && targetItem.record) {
      displayRecordInChat(targetItem.record, targetItem.record.isFixed);
    } else if (targetItem.type === "batchFix" && targetItem.records) {
      displayBatchInChat(targetItem.records, targetItem.records.every(r => r.isFixed));
    } else {
      displayChatMessage(targetItem.query || targetItem.title, targetItem.reply, targetItem.time);
    }
  }

  /* ----------------------------------------------------
     DEFAULT INTERACTIVE CONVERSATIONAL AI CHAT
     ---------------------------------------------------- */

  function handleUserSendMessage(text) {
    if (!text || !text.trim()) return;
    const cleanText = text.trim();

    const input = document.getElementById('chatUserInput');
    if (input) input.value = '';

    appendUserBubble(cleanText);

    // Show simulated typing indicator
    showTypingIndicator();

    setTimeout(() => {
      removeTypingIndicator();
      const aiReply = generateAiReply(cleanText);
      appendAssistantBubble(aiReply);

      // Add to Recents list if unique
      addQueryToRecents(cleanText, aiReply);
    }, 450);
  }

  function appendUserBubble(text) {
    const container = document.getElementById('chatbotMessages');
    if (!container) return;

    const time = formatCurrentTime();
    const bubble = document.createElement('div');
    bubble.className = 'chatbot-bubble user-bubble';
    bubble.textContent = text;

    const timeEl = document.createElement('div');
    timeEl.className = 'chatbot-time';
    timeEl.style.textAlign = 'right';
    timeEl.style.marginRight = '0.35rem';
    timeEl.textContent = time;

    container.appendChild(bubble);
    container.appendChild(timeEl);
    scrollToBottom();
  }

  function appendAssistantBubble(htmlContent) {
    const container = document.getElementById('chatbotMessages');
    if (!container) return;

    const time = formatCurrentTime();
    const bubble = document.createElement('div');
    bubble.className = 'chatbot-bubble';
    bubble.innerHTML = htmlContent;

    const timeEl = document.createElement('div');
    timeEl.className = 'chatbot-time';
    timeEl.textContent = time;

    container.appendChild(bubble);
    container.appendChild(timeEl);
    scrollToBottom();
  }

  function showTypingIndicator() {
    const container = document.getElementById('chatbotMessages');
    if (!container) return;

    const typing = document.createElement('div');
    typing.id = 'chatTypingIndicator';
    typing.className = 'chatbot-bubble';
    typing.style.padding = '0.5rem 0.85rem';
    typing.innerHTML = `
      <div class="typing-dots">
        <span></span><span></span><span></span>
      </div>
    `;
    container.appendChild(typing);
    scrollToBottom();
  }

  function removeTypingIndicator() {
    const indicator = document.getElementById('chatTypingIndicator');
    if (indicator && indicator.parentNode) {
      indicator.parentNode.removeChild(indicator);
    }
  }

  function scrollToBottom() {
    const body = document.getElementById('chatbotBody');
    if (body) {
      body.scrollTop = body.scrollHeight;
    }
  }

  function generateAiReply(query) {
    const q = query.toLowerCase();

    if (q.includes('where-used') || q.includes('where used') || q.includes('cs15') || q.includes('downstream')) {
      return `<strong>Where-Used Analysis (SAP Transaction CS15):</strong><br>
      Where-Used Analysis is an SAP functionality that identifies where a particular material or component is used in other materials' Bills of Materials (BOMs).<br><br>
      In simple terms, it answers: <em>"If this component has a problem, which other products might be affected?"</em><br><br>
      <strong>Manufacturing Flow Example:</strong><br>
      • <strong>Tyre (ROH001)</strong> is used in Wheel Assembly (HALB001)<br>
      • <strong>Wheel Assembly (HALB001)</strong> is used in Finished Bicycle (FG001)<br>
      • <strong>Bicycle (FG001)</strong> is the finished product.<br>
      • If Tyre has a missing costing price, Where-Used identifies the downstream cascade and halts Bicycle costing.<br><br>
      <strong>In Costing Readiness Checker (SA3 Root Cause Agent):</strong><br>
      1. Identifies parent materials that use a problematic component.<br>
      2. Identifies other products that depend on those parent materials.<br>
      3. Calculates total materials affected and revenue exposure.<br>
      4. Prioritizes errors based on downstream impact.<br><br>
      💡 Click <strong>'Where-Used'</strong> on any table row or in the action bar to view the full interactive BOM trace!`;
    }

    if (q.includes('kp26') || q.includes('activity price') || q.includes('rate')) {
      return `<strong>Activity Price Resolution (KP26):</strong><br>
      Activity price errors occur when cost center tariffs have not been planned or maintained in transaction <strong>KP26</strong> for the relevant fiscal year, version, and cost center.<br><br>
      <strong>Steps to resolve:</strong><br>
      1. Open KP26 in SAP ERP.<br>
      2. Enter Cost Center (e.g. <code>CC-IN10-PROC</code>) and Activity Type.<br>
      3. Maintain the planned fixed and variable price rate per unit (e.g. $42.50/HR).<br>
      4. Alternatively, click <strong>'✦ Fix'</strong> on the dashboard to automatically sync this rate via SAP interface.`;
    }

    if (q.includes('uom') || q.includes('unit') || q.includes('mismatch')) {
      return `<strong>Unit of Measure Mismatch:</strong><br>
      This occurs when the procurement purchase order unit (e.g. <code>MTR</code>) does not match the material master base unit (e.g. <code>KG</code>).<br><br>
      <strong>Solution:</strong> Maintain the standard unit conversion ratio in transaction <strong>MM02</strong> under <em>Additional Data → Units of Measure</em>.`;
    }

    if (q.includes('vendor') || q.includes('missing vendor')) {
      return `<strong>Vendor Missing Error:</strong><br>
      Material costing variant requires a valid Purchasing Info Record (PIR).<br><br>
      <strong>Solution:</strong> Execute transaction <strong>ME11</strong> to assign an approved supplier and specify condition records with net quotation price.`;
    }

    if (q.includes('source list') || q.includes('source')) {
      return `<strong>Source List Missing:</strong><br>
      The material master has the 'Source List Required' indicator checked for the plant, but no valid entry exists in <strong>ME01</strong>.<br><br>
      <strong>Solution:</strong> Maintain valid validity dates and approved vendors in transaction <strong>ME01</strong>.`;
    }

    if (q.includes('costing') || q.includes('variant') || q.includes('cost variant')) {
      return `<strong>Costing Variant Guidance:</strong><br>
      Supported variants in this plant environment:<br>
      • <strong>PPC1</strong>: Standard Cost Estimate (Plan/Actual comparison).<br>
      • <strong>ZPC1</strong>: Modified Standard Costing with preliminary BOM explosion.<br>
      • <strong>ZPC2</strong>: Inventory Valuation Costing for quarter-end reporting.`;
    }

    if (q.includes('plant') || q.includes('in10')) {
      return `<strong>Plant IN10 Overview:</strong><br>
      Plant IN10 has <strong>23 active costing errors</strong> identified across 4 main categories. Activity Price errors account for 39.1% of discrepancies. All error records can be inspected and auto-remedied directly from the dashboard.`;
    }

    if (q.includes('ui') || q.includes('ux') || q.includes('design')) {
      return `<strong>UI/UX Design Architecture:</strong><br>
      This dashboard applies modern enterprise design patterns:<br>
      • <strong>Minimalist White/Blue theme</strong>: High visual hierarchy without distracting noise.<br>
      • <strong>Top Proportional Slider Bars</strong>: Visualizes relative error density instantly.<br>
      • <strong>Clean Typography</strong>: Professional Inter font with zero emoji clutter.<br>
      • <strong>Dedicated Left Recents Drawer</strong>: Instant context switching.`;
    }

    return `I analyzed your query: "<em>${escapeHtml(query)}</em>".<br><br>
    The SAP Master Data interface is connected. You can click <strong>'✦ Fix'</strong> on any specific material error row in the table to generate an automated transaction fix, or ask me for specific SAP transaction guidelines (e.g. KP26, MM02, ME11, ME01, CK11N).`;
  }

  function addQueryToRecents(query, reply) {
    const title = query.length > 28 ? query.substring(0, 26) + '...' : query;
    const existingIndex = recents.findIndex(r => r.title.toLowerCase() === title.toLowerCase());

    const recentItem = {
      id: `rec-user-${Date.now()}`,
      title: title,
      type: "chat",
      query: query,
      reply: reply,
      time: formatCurrentTime()
    };

    if (existingIndex >= 0) {
      recents.splice(existingIndex, 1);
    }
    recents.unshift(recentItem);
    activeRecentId = recentItem.id;
    renderRecentsList();
  }

  function displayChatMessage(query, reply, time = "10:24 AM") {
    const container = document.getElementById('chatbotMessages');
    const actionsContainer = document.getElementById('chatbotActions');
    if (actionsContainer) actionsContainer.classList.add('hidden');
    activePendingRecord = null;

    if (!container) return;

    container.innerHTML = `
      <div class="chatbot-bubble user-bubble">
        ${escapeHtml(query)}
      </div>
      <div class="chatbot-time" style="text-align: right; margin-right: 0.35rem;">${time}</div>
      <div class="chatbot-bubble">
        ${reply}
      </div>
      <div class="chatbot-time">${time}</div>
    `;
    scrollToBottom();
  }

  /* ----------------------------------------------------
     ON-DEMAND FIX PROMPT (ONLY SHOWN ON FIX CLICK)
     Supports editable resolution prompt & multi-item batch fixes
     ---------------------------------------------------- */

  /**
   * Initiates an automated fix for a specific error record
   * Triggered when clicking ✦ Fix on an error row.
   * Renders the structured prompt with an editable resolution prompt textarea,
   * and shows [Fix] and [Cancel] buttons.
   */
  function initiateFix(record) {
    activePendingRecord = record;
    activePendingBatch = null;
    open();

    // Add or update in Recents (Plain title only, NO badges!)
    const title = `Fix ${record.material}`;
    const existingIndex = recents.findIndex(r => r.title === title || (r.record && r.record.material === record.material));
    const recentId = `rec-${record.material.toLowerCase()}`;
    const timestamp = formatCurrentTime();

    const recentObj = {
      id: recentId,
      title: title,
      type: "fix",
      record: record,
      time: timestamp
    };

    if (existingIndex >= 0) {
      recents.splice(existingIndex, 1);
    }
    recents.unshift(recentObj);
    activeRecentId = recentId;
    renderRecentsList();

    displayRecordInChat(record, record.isFixed);
  }

  function getDownstreamAffectedInfo(record) {
    const plants = new Set();
    const materials = new Set();

    if (record.plant) plants.add(record.plant);

    if (typeof MaterialData !== 'undefined' && typeof MaterialData.getWhereUsedData === 'function') {
      const wu = MaterialData.getWhereUsedData(record);
      if (wu) {
        if (wu.parents && Array.isArray(wu.parents)) {
          wu.parents.forEach(p => {
            if (p.plant) plants.add(p.plant);
            if (p.material) materials.add(p.material);
            if (p.finishedGoods && Array.isArray(p.finishedGoods)) {
              p.finishedGoods.forEach(fg => {
                if (fg.plant) plants.add(fg.plant);
                if (fg.material) materials.add(fg.material);
              });
            }
          });
        }
        if (wu.finishedGoods && Array.isArray(wu.finishedGoods)) {
          wu.finishedGoods.forEach(fg => {
            if (fg.plant) plants.add(fg.plant);
            if (fg.material) materials.add(fg.material);
          });
        }
      }
    }

    // Ensure realistic plants per SAP cohort if only 1 was found
    if (plants.size <= 1) {
      const p = record.plant || 'IN10';
      if (p === 'IN10') plants.add('IN20');
      else if (p === 'AD10') plants.add('AD20');
      else if (p === 'AU10') plants.add('AU20');
      else plants.add('IN10');
    }

    // Ensure fallback materials if empty
    if (materials.size === 0) {
      materials.add('HALB-2204');
      materials.add('HALB-3310');
      materials.add('FERT-1001');
      materials.add('FERT-1020');
    }

    return {
      affectedPlants: Array.from(plants),
      affectedMaterials: Array.from(materials)
    };
  }

  function renderErrorCardHtml(record, index = 0, isAlreadyFixed = false) {
    const affected = getDownstreamAffectedInfo(record);
    const affectedPlantsStr = affected.affectedPlants.length > 0 
      ? affected.affectedPlants.join(', ') 
      : (record.plant || 'IN10');
    const affectedMatsStr = affected.affectedMaterials.length > 0 
      ? affected.affectedMaterials.join(', ') 
      : 'HALB-2204, HALB-3310, FERT-1001, FERT-1020';

    const defaultPrompt = record._customPrompt || 
      `Execute automated fix for ${record.material} (${record.errorType}) in plant ${record.plant}: ${record.recommendation}`;

    return `
      <div class="chat-fix-item-card" data-record-id="${escapeHtml(record.id || ('rec-' + index))}" data-index="${index}">
        <div class="chatbot-prompt-title card-item-title">
          Fix ${escapeHtml(record.errorType)} for material <strong>${escapeHtml(record.material)}</strong> in plant <strong>${escapeHtml(record.plant)}</strong>.
        </div>

        <div class="chat-fix-layout">
          <!-- Left Column: Details Box with Editable Values + Downstream Affected Strip -->
          <div class="chat-fix-left-col">
            <div class="chatbot-meta-table">
              <div class="meta-row">
                <span class="meta-label">Material:</span>
                <div class="meta-input-wrap">
                  <input type="text" class="chat-field-input" data-field="material" data-index="${index}" value="${escapeHtml(record.material)}" ${isAlreadyFixed ? 'disabled' : ''}>
                </div>
              </div>
              <div class="meta-row">
                <span class="meta-label">Description:</span>
                <div class="meta-input-wrap">
                  <input type="text" class="chat-field-input" data-field="description" data-index="${index}" value="${escapeHtml(record.description)}" ${isAlreadyFixed ? 'disabled' : ''}>
                </div>
              </div>
              <div class="meta-row">
                <span class="meta-label">Error Type:</span>
                <div class="meta-input-wrap">
                  <input type="text" class="chat-field-input" data-field="errorType" data-index="${index}" value="${escapeHtml(record.errorType)}" ${isAlreadyFixed ? 'disabled' : ''}>
                </div>
              </div>
              <div class="meta-row">
                <span class="meta-label">Plant:</span>
                <div class="meta-input-wrap">
                  <input type="text" class="chat-field-input" data-field="plant" data-index="${index}" value="${escapeHtml(record.plant)}" ${isAlreadyFixed ? 'disabled' : ''}>
                </div>
              </div>
              <div class="meta-row">
                <span class="meta-label">Material Type:</span>
                <div class="meta-input-wrap">
                  <input type="text" class="chat-field-input" data-field="matType" data-index="${index}" value="${escapeHtml(record.matType)}" ${isAlreadyFixed ? 'disabled' : ''}>
                </div>
              </div>
              <div class="meta-row meta-row-action">
                <span class="meta-label">Action:</span>
                <div class="meta-input-wrap">
                  <textarea class="chat-field-input chat-field-textarea" data-field="recommendation" data-index="${index}" rows="2" ${isAlreadyFixed ? 'disabled' : ''}>${escapeHtml(record.recommendation)}</textarea>
                </div>
              </div>
            </div>

            <!-- Straight horizontal downstream affected strip -->
            <div class="chat-affected-strip">
              <div class="affected-line">
                <span class="affected-label">Affected Plants:</span>
                <span class="affected-values">${escapeHtml(affectedPlantsStr)}</span>
              </div>
              <div class="affected-line">
                <span class="affected-label">Affected Materials:</span>
                <span class="affected-values">${escapeHtml(affectedMatsStr)}</span>
              </div>
            </div>
          </div>

          <!-- Right Column: Fix Resolution Prompt (Editable) -->
          <div class="chat-fix-right-col">
            <div class="chatbot-prompt-editor-card">
              <div class="prompt-editor-header">
                <span class="prompt-editor-label">Fix Resolution Prompt (Editable):</span>
                <span class="prompt-editor-hint">Edit parameters or SAP command before confirming</span>
              </div>
              <textarea class="chatbot-editable-prompt" data-index="${index}" rows="7" ${isAlreadyFixed ? 'disabled' : ''}>${escapeHtml(defaultPrompt)}</textarea>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  function attachCardFieldListeners(container, records) {
    if (!container || !records) return;

    // Field inputs inside the left column
    const inputs = container.querySelectorAll('.chat-field-input');
    inputs.forEach(input => {
      input.addEventListener('input', (e) => {
        const index = parseInt(e.target.getAttribute('data-index') || '0', 10);
        const field = e.target.getAttribute('data-field');
        const record = records[index];
        if (!record || !field) return;

        record[field] = e.target.value;

        // Find the card container
        const card = e.target.closest('.chat-fix-item-card');
        if (card) {
          // Update card title
          const title = card.querySelector('.card-item-title');
          if (title) {
            title.innerHTML = `Fix ${escapeHtml(record.errorType)} for material <strong>${escapeHtml(record.material)}</strong> in plant <strong>${escapeHtml(record.plant)}</strong>.`;
          }

          // Update prompt textarea on right if user hasn't explicitly customized it
          const promptTextarea = card.querySelector('.chatbot-editable-prompt');
          if (promptTextarea && !record._manuallyEditedPrompt) {
            const newPrompt = `Execute automated fix for ${record.material} (${record.errorType}) in plant ${record.plant}: ${record.recommendation}`;
            promptTextarea.value = newPrompt;
            record._customPrompt = newPrompt;
          }
        }
      });
    });

    // Prompt textareas on the right column
    const promptTextareas = container.querySelectorAll('.chatbot-editable-prompt');
    promptTextareas.forEach(textarea => {
      textarea.addEventListener('input', (e) => {
        const index = parseInt(e.target.getAttribute('data-index') || '0', 10);
        const record = records[index];
        if (record) {
          record._customPrompt = e.target.value;
          record._manuallyEditedPrompt = true;
        }
      });
    });
  }

  function displayRecordInChat(record, isAlreadyFixed = false) {
    const messagesContainer = document.getElementById('chatbotMessages');
    const actionsContainer = document.getElementById('chatbotActions');
    const fixBtn = document.getElementById('chatbotFixActionBtn');
    const fixActionBtnText = fixBtn && fixBtn.querySelector ? fixBtn.querySelector('span') : null;
    const timestamp = record.time || formatCurrentTime();

    let html = `
      <div class="chatbot-bubble chat-fix-bubble">
        ${renderErrorCardHtml(record, 0, isAlreadyFixed)}
      </div>
      <div class="chatbot-time">${timestamp}</div>
    `;

    if (isAlreadyFixed) {
      html += `
        <div class="chatbot-bubble bubble-success">
          <div class="success-header">
            <span class="success-check">✓</span> <strong>Material ${escapeHtml(record.material)} is already fixed</strong>
          </div>
          <div class="success-body">
            SAP master data record synchronized in plant <strong>${escapeHtml(record.plant)}</strong>. Action executed: <em>${escapeHtml(record.recommendation)}</em>
          </div>
        </div>
        <div class="chatbot-time">${timestamp}</div>
      `;
      activePendingRecord = null;
      if (actionsContainer) actionsContainer.classList.add('hidden');
    } else {
      activePendingRecord = record;
      activePendingBatch = null;
      if (fixActionBtnText) fixActionBtnText.textContent = "Fix";
      if (actionsContainer) actionsContainer.classList.remove('hidden');
    }

    if (messagesContainer) {
      messagesContainer.innerHTML = html;
      attachCardFieldListeners(messagesContainer, [record]);
      scrollToBottom();
    }
  }

  /* ----------------------------------------------------
     SAP CS15 - MATERIAL WHERE-USED ANALYSIS ENGINE
     Answers: "If this component has a problem, which other products might be affected?"
     ---------------------------------------------------- */

  /**
   * Initiates SAP CS15 Where-Used Analysis for a component material
   * Identifies parent materials, finished products, total dependent materials,
   * downstream revenue exposure, and SA3 Root Cause priority.
   */
  function runWhereUsedAnalysis(recordOrMaterial) {
    if (typeof MaterialData === 'undefined' || typeof MaterialData.getWhereUsedData !== 'function') {
      return;
    }

    let whereUsedData;
    if (typeof recordOrMaterial === 'object' && recordOrMaterial.parents) {
      whereUsedData = recordOrMaterial;
    } else {
      whereUsedData = MaterialData.getWhereUsedData(recordOrMaterial);
    }

    const comp = whereUsedData.component;
    activePendingRecord = comp;
    activePendingBatch = null;

    open();

    const title = `Where-Used: ${comp.material}`;
    const recentId = `rec-wu-${comp.material.toLowerCase()}`;
    const timestamp = formatCurrentTime();

    const recentObj = {
      id: recentId,
      title: title,
      type: "whereUsed",
      record: comp,
      data: whereUsedData,
      time: timestamp
    };

    const existingIdx = recents.findIndex(r => r.id === recentId || r.title === title);
    if (existingIdx >= 0) {
      recents.splice(existingIdx, 1);
    }
    recents.unshift(recentObj);
    activeRecentId = recentId;

    renderRecentsList();
    renderInternalRecentsList();

    renderWhereUsedCardInChat(whereUsedData);
  }

  function renderWhereUsedCardInChat(whereUsedData) {
    const messagesContainer = document.getElementById('chatbotMessages');
    const actionsContainer = document.getElementById('chatbotActions');
    const fixBtn = document.getElementById('chatbotFixActionBtn');
    const fixActionBtnText = fixBtn && fixBtn.querySelector ? fixBtn.querySelector('span') : null;
    const comp = whereUsedData.component;
    const timestamp = formatCurrentTime();

    activePendingRecord = comp;
    activePendingBatch = null;

    if (fixActionBtnText) fixActionBtnText.textContent = "Proceed with Fix";
    if (actionsContainer) actionsContainer.classList.remove('hidden');

    let treeHtml = '';
    if (whereUsedData.isTopLevel) {
      treeHtml = `
        <div class="tree-node tree-level-0">
          <div class="tree-node-badge lvl-fert">Finished Good (Top of BOM)</div>
          <div class="tree-node-content">
            <div class="tree-node-main">
              <span class="node-icon">📦</span>
              <strong class="node-code">${escapeHtml(comp.material)}</strong>
              <span class="node-type mat-fert">${escapeHtml(comp.matType)}</span>
              <span class="node-name">${escapeHtml(comp.description)}</span>
            </div>
            <div class="tree-node-sub">
              Plant <strong>${escapeHtml(comp.plant || 'IN10')}</strong> • Status: <strong>Top-Level Product</strong>
            </div>
          </div>
        </div>
      `;
    } else {
      // Level 0: Root Component
      treeHtml += `
        <div class="tree-node tree-level-0">
          <div class="tree-node-badge lvl-0">Level 0: Origin Component (CS15 Target)</div>
          <div class="tree-node-content">
            <div class="tree-node-main">
              <span class="node-icon">⚠️</span>
              <strong class="node-code">${escapeHtml(comp.material)}</strong>
              <span class="node-type mat-${comp.matType.toLowerCase()}">${escapeHtml(comp.matType)}</span>
              <span class="node-name">${escapeHtml(comp.description)}</span>
            </div>
            <div class="tree-node-sub">
              Plant <strong>${escapeHtml(comp.plant || 'IN10')}</strong> • Error: <strong class="err-text">${escapeHtml(comp.errorType)}</strong> — ${escapeHtml(comp.recommendation)}
            </div>
          </div>
        </div>
      `;

      // Parents and Finished Goods
      whereUsedData.parents.forEach((parent) => {
        treeHtml += `
          <div class="tree-connector-v"></div>
          <div class="tree-node tree-level-1">
            <div class="tree-node-badge lvl-1">↳ Level 1: Parent Assembly (HALB)</div>
            <div class="tree-node-content">
              <div class="tree-node-main">
                <span class="node-icon">⚙️</span>
                <strong class="node-code">${escapeHtml(parent.material)}</strong>
                <span class="node-type mat-halb">${escapeHtml(parent.matType)}</span>
                <span class="node-name">${escapeHtml(parent.description)}</span>
              </div>
              <div class="tree-node-sub">
                BOM Item: <strong>${escapeHtml(parent.bomItem || '0010')}</strong> • Component Consumption: <strong>${escapeHtml(parent.qty || '1 EA')}</strong> • Status: <span class="badge-status-risk">${escapeHtml(parent.status || 'At Risk')}</span>
              </div>
            </div>
          </div>
        `;

        if (parent.finishedGoods && parent.finishedGoods.length > 0) {
          parent.finishedGoods.forEach(fg => {
            treeHtml += `
              <div class="tree-connector-branch"></div>
              <div class="tree-node tree-level-2">
                <div class="tree-node-badge lvl-2">↳ Level 2: Downstream Finished Product (FERT)</div>
                <div class="tree-node-content">
                  <div class="tree-node-main">
                    <span class="node-icon">📦</span>
                    <strong class="node-code">${escapeHtml(fg.material)}</strong>
                    <span class="node-type mat-fert">${escapeHtml(fg.matType)}</span>
                    <span class="node-name">${escapeHtml(fg.description)}</span>
                  </div>
                  <div class="tree-node-sub">
                    Downstream Consequence: <strong class="impact-text">${escapeHtml(fg.impact)}</strong> • Cost Variance Exposure: <strong class="val-cost">${escapeHtml(fg.costVariance || '$50,000')}</strong>
                  </div>
                </div>
              </div>
            `;
          });
        }
      });
    }

    const html = `
      <div class="chatbot-bubble bubble-whereused">
        <!-- Header Banner -->
        <div class="whereused-header-badge">
          <div class="whereused-badge-left">
            <span class="cs15-tag">SAP CS15</span>
            <span class="cs15-title">Material Where-Used List</span>
          </div>
          <span class="sa3-agent-tag">SA3 Root Cause Analysis Agent</span>
        </div>

        <!-- Question & Target Material Banner -->
        <div class="whereused-hero-box">
          <div class="whereused-question-tag">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
              <circle cx="12" cy="12" r="10"></circle>
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
              <line x1="12" y1="17" x2="12.01" y2="17"></line>
            </svg>
            <span>"If this component has a problem, which other products might be affected?"</span>
          </div>
          <div class="whereused-target-material">
            <div class="material-meta-row">
              <span class="mat-chip mat-${comp.matType.toLowerCase()}">${escapeHtml(comp.matType)}</span>
              <strong class="mat-title">${escapeHtml(comp.material)}</strong>
              <span class="mat-desc">${escapeHtml(comp.description)}</span>
            </div>
            <div class="mat-sub-meta">
              Plant: <strong>${escapeHtml(comp.plant || 'IN10')}</strong> • Error: <span class="err-highlight">${escapeHtml(comp.errorType)}</span> • Resolution: <em>${escapeHtml(comp.recommendation)}</em>
            </div>
          </div>
        </div>

        <!-- Impact KPI Metrics -->
        <div class="whereused-kpi-grid">
          <div class="whereused-kpi-card">
            <span class="kpi-label">Parent Assemblies</span>
            <strong class="kpi-val">${whereUsedData.totalParents}</strong>
            <span class="kpi-hint">Direct HALB BOMs</span>
          </div>
          <div class="whereused-kpi-card">
            <span class="kpi-label">Finished Goods</span>
            <strong class="kpi-val">${whereUsedData.totalFinishedGoods}</strong>
            <span class="kpi-hint">Downstream FERT</span>
          </div>
          <div class="whereused-kpi-card">
            <span class="kpi-label">Total Affected</span>
            <strong class="kpi-val val-alert">${whereUsedData.totalAffected}</strong>
            <span class="kpi-hint">Impacted Materials</span>
          </div>
          <div class="whereused-kpi-card">
            <span class="kpi-label">Cost Exposure</span>
            <strong class="kpi-val val-cost">${escapeHtml(whereUsedData.estimatedCostExposure)}</strong>
            <span class="kpi-hint">Valuation at Risk</span>
          </div>
          <div class="whereused-kpi-card">
            <span class="kpi-label">Downstream Priority</span>
            <strong class="kpi-val val-priority">${escapeHtml(whereUsedData.priorityScore)}</strong>
            <span class="kpi-hint">${escapeHtml(whereUsedData.priorityLevel)} Impact</span>
          </div>
        </div>

        <!-- Multi-Level Visual Hierarchy Tree -->
        <div class="whereused-tree-card">
          <div class="tree-header">
            <span class="tree-title">Multi-Level Where-Used Hierarchy (Bottom-Up BOM Trace)</span>
            <span class="tree-badge">CS15 Active Explosion</span>
          </div>
          <div class="tree-body">
            ${treeHtml}
          </div>
        </div>

        <!-- SA3 Agent Root Cause Insights -->
        <div class="whereused-sa3-callout">
          <div class="sa3-header">
            <span class="sa3-icon">🤖</span>
            <strong>SA3 Root Cause Analysis Agent Findings</strong>
          </div>
          <p class="sa3-text">${whereUsedData.sa3Analysis}</p>
        </div>

        <!-- Educational Reference: Bicycle Flow & Difference Table -->
        <div class="whereused-edu-box">
          <div class="edu-title">
            <strong>💡 SAP Knowledge: BOM Explosion vs Where-Used Analysis</strong>
          </div>
          <div class="bicycle-flow">
            <div class="flow-step">
              <span class="step-num">1</span>
              <span class="step-title">Tyre (ROH001)</span>
              <span class="step-type">Component</span>
            </div>
            <span class="flow-arrow">→ is used in →</span>
            <div class="flow-step">
              <span class="step-num">2</span>
              <span class="step-title">Wheel Assembly (HALB001)</span>
              <span class="step-type">Sub-Assembly</span>
            </div>
            <span class="flow-arrow">→ is used in →</span>
            <div class="flow-step">
              <span class="step-num">3</span>
              <span class="step-title">Bicycle (FG001)</span>
              <span class="step-type">Finished Product</span>
            </div>
          </div>

          <table class="whereused-diff-table">
            <thead>
              <tr>
                <th>Functionality</th>
                <th>Direction</th>
                <th>Purpose</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>BOM explosion</strong></td>
                <td><span class="dir-tag dir-down">Top-down</span></td>
                <td>What components are required to manufacture this finished product?</td>
              </tr>
              <tr>
                <td><strong>Where-used analysis</strong></td>
                <td><span class="dir-tag dir-up">Bottom-up</span></td>
                <td>Where is this component used? Which parent materials depend on it?</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Footer Action -->
        <div class="whereused-footer-action">
          <button id="whereUsedCardFixBtn" class="btn-whereused-proceed">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
            <span>Proceed to Fix ${escapeHtml(comp.material)} (${escapeHtml(comp.errorType)})</span>
          </button>
        </div>
      </div>
      <div class="chatbot-time">${timestamp}</div>
    `;

    if (messagesContainer) {
      messagesContainer.innerHTML = html;
      scrollToBottom();

      const cardFixBtn = document.getElementById('whereUsedCardFixBtn');
      if (cardFixBtn) {
        cardFixBtn.addEventListener('click', () => {
          initiateFix(comp);
        });
      }
    }
  }

  /**
   * Initiates batch resolution for multiple selected records at once
   */
  function initiateBatchFix(records) {
    if (!records || records.length === 0) return;
    if (records.length === 1) {
      initiateFix(records[0]);
      return;
    }
    activePendingBatch = records;
    activePendingRecord = null;
    open();
    maximize(); // Automatically pop up in chat maximized view when error count > 1 per user request!

    const title = `Fix All (${records.length} errors)`;
    const existingIndex = recents.findIndex(r => r.title === title);
    const recentId = `rec-batch-${Date.now()}`;
    const timestamp = formatCurrentTime();

    const recentObj = {
      id: recentId,
      title: title,
      type: "batchFix",
      records: records,
      time: timestamp
    };

    if (existingIndex >= 0) {
      recents.splice(existingIndex, 1);
    }
    recents.unshift(recentObj);
    activeRecentId = recentId;
    renderRecentsList();
    renderInternalRecentsList();

    displayBatchInChat(records, false);
  }

  function displayBatchInChat(records, isAlreadyFixed = false) {
    const messagesContainer = document.getElementById('chatbotMessages');
    const actionsContainer = document.getElementById('chatbotActions');
    const fixBtn = document.getElementById('chatbotFixActionBtn');
    const fixActionBtnText = fixBtn && fixBtn.querySelector ? fixBtn.querySelector('span') : null;
    const timestamp = formatCurrentTime();

    let html = `
      <div class="chatbot-bubble chat-fix-bubble">
        <div class="batch-bubble-header">
          <span class="badge-pill badge-purple">Batch Mode</span>
          <span class="batch-bubble-title">Batch Resolution for <strong>${records.length} Selected Material Errors</strong></span>
        </div>
        <div class="batch-cards-stack">
          ${records.map((r, i) => renderErrorCardHtml(r, i, isAlreadyFixed)).join('<div class="batch-item-divider"></div>')}
        </div>
      </div>
      <div class="chatbot-time">${timestamp}</div>
    `;

    if (isAlreadyFixed) {
      html += `
        <div class="chatbot-bubble bubble-success">
          <div class="success-header">
            <span class="success-check">✓</span> <strong>All ${records.length} selected errors are resolved</strong>
          </div>
        </div>
        <div class="chatbot-time">${timestamp}</div>
      `;
      activePendingBatch = null;
      if (actionsContainer) actionsContainer.classList.add('hidden');
    } else {
      activePendingBatch = records;
      activePendingRecord = null;
      if (fixActionBtnText) fixActionBtnText.textContent = `Fix All (${records.length})`;
      if (actionsContainer) actionsContainer.classList.remove('hidden');
    }

    if (messagesContainer) {
      messagesContainer.innerHTML = html;
      attachCardFieldListeners(messagesContainer, records);
      scrollToBottom();
    }
  }

  /* ----------------------------------------------------
     BATCH / MULTI-MATERIAL SAP CS15 WHERE-USED ANALYSIS
     ---------------------------------------------------- */

  /**
   * Initiates multi-component / batch SAP CS15 Where-Used Analysis
   * for 2 or more selected materials.
   */
  function runBatchWhereUsedAnalysis(records) {
    if (!records || records.length === 0) return;
    if (records.length === 1) {
      runWhereUsedAnalysis(records[0]);
      return;
    }

    if (typeof MaterialData === 'undefined' || typeof MaterialData.getBatchWhereUsedData !== 'function') {
      return;
    }

    const batchData = MaterialData.getBatchWhereUsedData(records);
    activePendingBatch = records;
    activePendingRecord = null;

    open();

    const title = `Where-Used: ${records.length} Materials`;
    const recentId = `rec-wu-batch-${Date.now()}`;
    const timestamp = formatCurrentTime();

    const recentObj = {
      id: recentId,
      title: title,
      type: "whereUsedBatch",
      records: records,
      data: batchData,
      time: timestamp
    };

    const existingIdx = recents.findIndex(r => r.id === recentId || r.title === title);
    if (existingIdx >= 0) {
      recents.splice(existingIdx, 1);
    }
    recents.unshift(recentObj);
    activeRecentId = recentId;

    renderRecentsList();
    renderInternalRecentsList();

    renderBatchWhereUsedCardInChat(batchData);
  }

  function renderBatchWhereUsedCardInChat(batchData) {
    const messagesContainer = document.getElementById('chatbotMessages');
    const actionsContainer = document.getElementById('chatbotActions');
    const fixBtn = document.getElementById('chatbotFixActionBtn');
    const fixActionBtnText = fixBtn && fixBtn.querySelector ? fixBtn.querySelector('span') : null;
    const timestamp = formatCurrentTime();
    activePendingBatch = batchData.components;
    activePendingRecord = null;

    if (fixActionBtnText) fixActionBtnText.textContent = `Fix All (${batchData.materialsCount})`;
    if (actionsContainer) actionsContainer.classList.remove('hidden');

    // Build convergence alert if any finished goods are shared
    let convergenceAlertHtml = '';
    if (batchData.convergingFinishedGoods && batchData.convergingFinishedGoods.length > 0) {
      const convList = batchData.convergingFinishedGoods.map(fg => `
        <div class="conv-item">
          <strong>${escapeHtml(fg.material)}</strong> (${escapeHtml(fg.description)}) 
          <span class="conv-badge">Requires: ${escapeHtml(fg.dependentComponents.join(' + '))}</span>
        </div>
      `).join('');

      convergenceAlertHtml = `
        <div class="whereused-convergence-alert">
          <div class="conv-alert-header">
            <span class="conv-alert-icon">⚡</span>
            <strong>Critical Multi-Component BOM Convergence Detected</strong>
          </div>
          <p class="conv-alert-desc">
            The following finished product(s) depend simultaneously on multiple of your selected problematic components:
          </p>
          <div class="conv-items-list">
            ${convList}
          </div>
          <div class="conv-alert-footer">
            In monthly standard costing run <strong>CK40N</strong>, these finished goods will experience compounded costing errors across parallel assembly paths.
          </div>
        </div>
      `;
    }

    // Build per-component breakdown trees
    let componentsBreakdownHtml = '';
    batchData.items.forEach((item, idx) => {
      const comp = item.component;
      let compTreeHtml = '';

      if (item.isTopLevel) {
        compTreeHtml = `
          <div class="tree-node tree-level-0">
            <div class="tree-node-badge lvl-fert">Finished Good (Top of BOM)</div>
            <div class="tree-node-content">
              <div class="tree-node-main">
                <span class="node-icon">📦</span>
                <strong class="node-code">${escapeHtml(comp.material)}</strong>
                <span class="node-type mat-fert">${escapeHtml(comp.matType)}</span>
                <span class="node-name">${escapeHtml(comp.description)}</span>
              </div>
            </div>
          </div>
        `;
      } else {
        compTreeHtml += `
          <div class="tree-node tree-level-0">
            <div class="tree-node-badge lvl-0">Origin Component ${idx + 1}</div>
            <div class="tree-node-content">
              <div class="tree-node-main">
                <span class="node-icon">⚠️</span>
                <strong class="node-code">${escapeHtml(comp.material)}</strong>
                <span class="node-type mat-${comp.matType.toLowerCase()}">${escapeHtml(comp.matType)}</span>
                <span class="node-name">${escapeHtml(comp.description)}</span>
              </div>
              <div class="tree-node-sub">
                Plant <strong>${escapeHtml(comp.plant || 'IN10')}</strong> • Error: <strong class="err-text">${escapeHtml(comp.errorType)}</strong> — ${escapeHtml(comp.recommendation)}
              </div>
            </div>
          </div>
        `;

        item.parents.forEach(parent => {
          compTreeHtml += `
            <div class="tree-connector-v"></div>
            <div class="tree-node tree-level-1">
              <div class="tree-node-badge lvl-1">↳ Level 1: Parent Assembly (HALB)</div>
              <div class="tree-node-content">
                <div class="tree-node-main">
                  <span class="node-icon">⚙️</span>
                  <strong class="node-code">${escapeHtml(parent.material)}</strong>
                  <span class="node-type mat-halb">${escapeHtml(parent.matType)}</span>
                  <span class="node-name">${escapeHtml(parent.description)}</span>
                </div>
                <div class="tree-node-sub">
                  BOM Item: <strong>${escapeHtml(parent.bomItem || '0010')}</strong> • Consumption: <strong>${escapeHtml(parent.qty || '1 EA')}</strong>
                </div>
              </div>
            </div>
          `;

          if (parent.finishedGoods && parent.finishedGoods.length > 0) {
            parent.finishedGoods.forEach(fg => {
              compTreeHtml += `
                <div class="tree-connector-branch"></div>
                <div class="tree-node tree-level-2">
                  <div class="tree-node-badge lvl-2">↳ Level 2: Downstream Finished Product (FERT)</div>
                  <div class="tree-node-content">
                    <div class="tree-node-main">
                      <span class="node-icon">📦</span>
                      <strong class="node-code">${escapeHtml(fg.material)}</strong>
                      <span class="node-type mat-fert">${escapeHtml(fg.matType)}</span>
                      <span class="node-name">${escapeHtml(fg.description)}</span>
                    </div>
                    <div class="tree-node-sub">
                      Downstream Impact: <strong class="impact-text">${escapeHtml(fg.impact)}</strong> • Cost Exposure: <strong class="val-cost">${escapeHtml(fg.costVariance || '$50,000')}</strong>
                    </div>
                  </div>
                </div>
              `;
            });
          }
        });
      }

      componentsBreakdownHtml += `
        <div class="batch-comp-tree-section">
          <div class="batch-comp-tree-header">
            <span class="batch-comp-num">${idx + 1}</span>
            <strong class="batch-comp-name">${escapeHtml(comp.material)} (${escapeHtml(comp.description)})</strong>
            <span class="mat-chip mat-${comp.matType.toLowerCase()}">${escapeHtml(comp.matType)}</span>
            <span class="batch-comp-impact-tag">${item.totalParents} Parents → ${item.totalFinishedGoods} Finished Goods</span>
          </div>
          <div class="tree-body">
            ${compTreeHtml}
          </div>
        </div>
      `;
    });

    const html = `
      <div class="chatbot-bubble bubble-whereused bubble-whereused-batch">
        <!-- Header Banner -->
        <div class="whereused-header-badge">
          <div class="whereused-badge-left">
            <span class="cs15-tag">SAP CS15 BATCH</span>
            <span class="cs15-title">Multi-Material Where-Used Analysis</span>
          </div>
          <span class="sa3-agent-tag">SA3 Multi-Component Root Cause Agent</span>
        </div>

        <!-- Question & Selected Components Banner -->
        <div class="whereused-hero-box">
          <div class="whereused-question-tag">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
              <circle cx="12" cy="12" r="10"></circle>
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
              <line x1="12" y1="17" x2="12.01" y2="17"></line>
            </svg>
            <span>"If these ${batchData.materialsCount} selected components have problems, which other products and assemblies might be affected?"</span>
          </div>
          <div class="batch-selected-chips-grid">
            ${batchData.components.map(c => `
              <div class="batch-chip-card">
                <div class="chip-card-top">
                  <span class="mat-chip mat-${c.matType.toLowerCase()}">${escapeHtml(c.matType)}</span>
                  <strong class="chip-code">${escapeHtml(c.material)}</strong>
                </div>
                <div class="chip-desc">${escapeHtml(c.description)}</div>
                <div class="chip-err-badge">${escapeHtml(c.errorType)}</div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Combined Impact KPI Metrics -->
        <div class="whereused-kpi-grid">
          <div class="whereused-kpi-card">
            <span class="kpi-label">Selected Components</span>
            <strong class="kpi-val">${batchData.materialsCount}</strong>
            <span class="kpi-hint">Errors Evaluated</span>
          </div>
          <div class="whereused-kpi-card">
            <span class="kpi-label">Parent Assemblies</span>
            <strong class="kpi-val">${batchData.totalParents}</strong>
            <span class="kpi-hint">Unique HALB BOMs</span>
          </div>
          <div class="whereused-kpi-card">
            <span class="kpi-label">Finished Goods Blocked</span>
            <strong class="kpi-val val-alert">${batchData.totalFinishedGoods}</strong>
            <span class="kpi-hint">Downstream FERT</span>
          </div>
          <div class="whereused-kpi-card">
            <span class="kpi-label">Cumulative Exposure</span>
            <strong class="kpi-val val-cost">${escapeHtml(batchData.totalExposure)}</strong>
            <span class="kpi-hint">Compounded Risk</span>
          </div>
          <div class="whereused-kpi-card">
            <span class="kpi-label">Correlated Priority</span>
            <strong class="kpi-val val-priority">${escapeHtml(batchData.priorityScore)}</strong>
            <span class="kpi-hint">${escapeHtml(batchData.priorityLevel)} Batch Impact</span>
          </div>
        </div>

        <!-- Convergence Alert -->
        ${convergenceAlertHtml}

        <!-- Multi-Component Hierarchy Breakdown -->
        <div class="whereused-tree-card">
          <div class="tree-header">
            <span class="tree-title">Multi-Material Where-Used Hierarchy Breakdown (${batchData.materialsCount} Components)</span>
            <span class="tree-badge">CS15 Batch Explosion</span>
          </div>
          <div class="batch-trees-container">
            ${componentsBreakdownHtml}
          </div>
        </div>

        <!-- SA3 Correlated Insight -->
        <div class="whereused-sa3-callout">
          <div class="sa3-header">
            <span class="sa3-icon">🤖</span>
            <strong>SA3 Multi-Component Root Cause Analysis Agent Findings</strong>
          </div>
          <p class="sa3-text">${batchData.sa3Analysis}</p>
        </div>

        <!-- Educational Reference: Bicycle Flow & Difference Table -->
        <div class="whereused-edu-box">
          <div class="edu-title">
            <strong>💡 SAP Knowledge: Multi-Component Downstream Impact</strong>
          </div>
          <div class="bicycle-flow">
            <div class="flow-step">
              <span class="step-num">1</span>
              <span class="step-title">Components (${batchData.components.map(c => c.material).join(', ')})</span>
              <span class="step-type">ROH / HALB</span>
            </div>
            <span class="flow-arrow">→ cascade into →</span>
            <div class="flow-step">
              <span class="step-num">2</span>
              <span class="step-title">${batchData.totalParents} Parent Assemblies</span>
              <span class="step-type">HALB</span>
            </div>
            <span class="flow-arrow">→ block valuation for →</span>
            <div class="flow-step">
              <span class="step-num">3</span>
              <span class="step-title">${batchData.totalFinishedGoods} Finished Products</span>
              <span class="step-type">FERT</span>
            </div>
          </div>
        </div>

        <!-- Footer Action -->
        <div class="whereused-footer-action">
          <button id="batchWhereUsedProceedFixBtn" class="btn-whereused-proceed">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
            <span>Proceed to Fix All ${batchData.materialsCount} Selected Errors</span>
          </button>
        </div>
      </div>
      <div class="chatbot-time">${timestamp}</div>
    `;

    if (messagesContainer) {
      messagesContainer.innerHTML = html;
      scrollToBottom();

      const proceedBtn = document.getElementById('batchWhereUsedProceedFixBtn');
      if (proceedBtn) {
        proceedBtn.addEventListener('click', () => {
          initiateBatchFix(batchData.components);
        });
      }
    }
  }

  function cancelFix() {
    const messagesContainer = document.getElementById('chatbotMessages');
    const actionsContainer = document.getElementById('chatbotActions');
    const timestamp = formatCurrentTime();

    if (activePendingBatch && activePendingBatch.length > 0) {
      const cancelHtml = `
        <div class="chatbot-bubble bubble-cancel">
          Batch fix operation cancelled for ${activePendingBatch.length} selected records. Error records remain unresolved.
        </div>
        <div class="chatbot-time">${timestamp}</div>
      `;
      if (messagesContainer) {
        messagesContainer.innerHTML += cancelHtml;
        scrollToBottom();
      }
    } else if (activePendingRecord) {
      const cancelHtml = `
        <div class="chatbot-bubble bubble-cancel">
          Fix operation cancelled for material <strong>${escapeHtml(activePendingRecord.material)}</strong>. The error record remains in unresolved status.
        </div>
        <div class="chatbot-time">${timestamp}</div>
      `;
      if (messagesContainer) {
        messagesContainer.innerHTML += cancelHtml;
        scrollToBottom();
      }
    }

    activePendingRecord = null;
    activePendingBatch = null;
    if (actionsContainer) {
      actionsContainer.classList.add('hidden');
    }
  }

  function confirmFix() {
    if (!activePendingRecord && (!activePendingBatch || activePendingBatch.length === 0)) return;

    const actionsContainer = document.getElementById('chatbotActions');
    const messagesContainer = document.getElementById('chatbotMessages');

    // Hide actions while processing
    if (actionsContainer) actionsContainer.classList.add('hidden');

    // Handle BATCH Fix
    if (activePendingBatch && activePendingBatch.length > 0) {
      const recordsToFix = [...activePendingBatch];
      const promptInputs = messagesContainer ? messagesContainer.querySelectorAll('.chatbot-editable-prompt') : [];
      let executedPrompt = '';
      if (promptInputs && promptInputs.length > 0) {
        executedPrompt = Array.from(promptInputs).map((p, idx) => {
          const rec = recordsToFix[idx] || recordsToFix[0];
          return `${idx + 1}. [${rec.material} (${rec.plant})]: ${p.value.trim()}`;
        }).join('\n');
      } else {
        executedPrompt = recordsToFix.map((r, i) => `${i + 1}. [${r.material} (${r.plant})]: ${r.recommendation}`).join('\n');
      }

      const processingEl = document.createElement('div');
      processingEl.className = 'chatbot-processing';
      processingEl.innerHTML = `
        <div class="spinner"></div>
        <span>Applying automated batch fix via SAP interface for <strong>${recordsToFix.length} records</strong>...</span>
      `;
      if (messagesContainer) {
        messagesContainer.appendChild(processingEl);
        scrollToBottom();
      }

      setTimeout(() => {
        if (processingEl && processingEl.parentNode) {
          processingEl.parentNode.removeChild(processingEl);
        }

        const timestamp = formatCurrentTime();
        const successHtml = `
          <div class="chatbot-bubble bubble-success">
            <div class="success-header">
              <span class="success-check">✓</span> <strong>Successfully Fixed All ${recordsToFix.length} Selected Errors!</strong>
            </div>
            <div class="success-body">
              SAP master data records synchronized across plants. Executed Prompts:<br>
              <pre style="margin-top: 6px; font-size: 0.76rem; background: rgba(0,0,0,0.04); padding: 6px 8px; border-radius: 4px; white-space: pre-wrap; font-family: monospace;">${escapeHtml(executedPrompt)}</pre>
            </div>
          </div>
          <div class="chatbot-time">${timestamp}</div>
        `;

        if (messagesContainer) {
          messagesContainer.innerHTML += successHtml;
          scrollToBottom();
        }

        recordsToFix.forEach(r => {
          r.isFixed = true;
          r.selected = false;
          if (typeof onFixCompletedCallback === 'function') {
            onFixCompletedCallback(r.id);
          }
        });

        activePendingBatch = null;
      }, 700);
      return;
    }

    // Handle SINGLE Fix
    const recordToFix = activePendingRecord;
    const promptInput = messagesContainer ? messagesContainer.querySelector('.chatbot-editable-prompt') : null;
    const executedPrompt = promptInput ? promptInput.value.trim() : (recordToFix._customPrompt || recordToFix.recommendation);

    // Show simulated processing state
    const processingEl = document.createElement('div');
    processingEl.className = 'chatbot-processing';
    processingEl.innerHTML = `
      <div class="spinner"></div>
      <span>Applying automated fix via SAP interface for <strong>${escapeHtml(recordToFix.material)}</strong>...</span>
    `;
    if (messagesContainer) {
      messagesContainer.appendChild(processingEl);
      scrollToBottom();
    }

    // Simulate async SAP update
    setTimeout(() => {
      if (processingEl && processingEl.parentNode) {
        processingEl.parentNode.removeChild(processingEl);
      }

      const timestamp = formatCurrentTime();
      const successHtml = `
        <div class="chatbot-bubble bubble-success">
          <div class="success-header">
            <span class="success-check">✓</span> <strong>Successfully Fixed ${escapeHtml(recordToFix.errorType)} for ${escapeHtml(recordToFix.material)}!</strong>
          </div>
          <div class="success-body">
            SAP master data record synchronized in plant <strong>${escapeHtml(recordToFix.plant)}</strong>.<br>
            <strong>Executed Prompt:</strong> <em>${escapeHtml(executedPrompt || recordToFix.recommendation)}</em>
          </div>
        </div>
        <div class="chatbot-time">${timestamp}</div>
      `;

      if (messagesContainer) {
        messagesContainer.innerHTML += successHtml;
        scrollToBottom();
      }

      // Mark record as fixed
      recordToFix.isFixed = true;
      recordToFix.selected = false;

      // Update in Recents (plain title maintained)
      const targetItem = recents.find(r => r.record && r.record.material === recordToFix.material);
      if (targetItem && targetItem.record) {
        targetItem.record.isFixed = true;
      }
      renderRecentsList();

      // Notify app controller to update target row state
      if (typeof onFixCompletedCallback === 'function') {
        onFixCompletedCallback(recordToFix.id);
      }

      activePendingRecord = null;
    }, 600);
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
    open: open,
    close: close,
    toggle: toggle,
    toggleMaximize: toggleMaximize,
    initiateFix: initiateFix,
    initiateBatchFix: initiateBatchFix,
    runWhereUsedAnalysis: runWhereUsedAnalysis,
    runBatchWhereUsedAnalysis: runBatchWhereUsedAnalysis,
    toggleInternalSidebar: toggleInternalSidebar,
    openInternalSidebar: openInternalSidebar,
    closeInternalSidebar: closeInternalSidebar,
    renderInternalRecentsList: renderInternalRecentsList,
    isOpen: function () { return isOpen; },
    maximize: maximize,
    isMaximized: isMaximized,
    getRecents: function () { return recents; }
  };
})();

if (typeof module !== 'undefined' && module.exports) {
  module.exports = MaterialChatbot;
}
