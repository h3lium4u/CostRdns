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
    const minimizeBtn = document.getElementById('chatbotMinimizeBtn');
    const fixActionBtn = document.getElementById('chatbotFixActionBtn');
    const cancelActionBtn = document.getElementById('chatbotCancelActionBtn');
    const sendBtn = document.getElementById('chatSendBtn');
    const userInput = document.getElementById('chatUserInput');

    if (toggleBtn) toggleBtn.addEventListener('click', toggle);
    if (closeBtn) closeBtn.addEventListener('click', close);
    if (minimizeBtn) minimizeBtn.addEventListener('click', close);
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
      document.getElementById('recentsToggleBtn'),
      document.getElementById('geminiRecentsToggleBtn'),
      document.getElementById('claudeRecentsToggleBtn'),
      document.getElementById('d4RecentsBtn')
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
    const popup = document.getElementById('chatbotPopup');
    if (popup) {
      popup.classList.remove('hidden');
      isOpen = true;
      const input = document.getElementById('chatUserInput');
      if (input && !activePendingRecord) {
        setTimeout(() => input.focus(), 150);
      }
    }
  }

  function close() {
    const popup = document.getElementById('chatbotPopup');
    if (popup) {
      popup.classList.add('hidden');
      isOpen = false;
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

    const targetItem = recents.find(r => r.id === id);
    if (!targetItem) return;

    open();

    if (targetItem.type === "fix" && targetItem.record) {
      displayRecordInChat(targetItem.record, targetItem.record.isFixed);
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
     ---------------------------------------------------- */

  /**
   * Initiates an automated fix for a specific error record
   * Triggered ONLY when clicking ✦ Fix on an error row.
   * Renders the structured prompt WITHOUT EMOJIS, and shows [Fix] and [Cancel] buttons.
   */
  function initiateFix(record) {
    activePendingRecord = record;
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

  function displayRecordInChat(record, isAlreadyFixed = false) {
    const messagesContainer = document.getElementById('chatbotMessages');
    const actionsContainer = document.getElementById('chatbotActions');
    const timestamp = record.time || formatCurrentTime();

    // Clean structured prompt WITHOUT ANY EMOJIS (per user requirement)
    let html = `
      <div class="chatbot-bubble">
        <div class="chatbot-prompt-title">
          Fix ${escapeHtml(record.errorType)} for material <strong>${escapeHtml(record.material)}</strong> in plant <strong>${escapeHtml(record.plant)}</strong>.
        </div>
        <div class="chatbot-meta-table">
          <div class="meta-row">
            <span class="meta-label">Material:</span>
            <span class="meta-value">${escapeHtml(record.material)}</span>
          </div>
          <div class="meta-row">
            <span class="meta-label">Description:</span>
            <span class="meta-value">${escapeHtml(record.description)}</span>
          </div>
          <div class="meta-row">
            <span class="meta-label">Error Type:</span>
            <span class="meta-value">${escapeHtml(record.errorType)}</span>
          </div>
          <div class="meta-row">
            <span class="meta-label">Plant:</span>
            <span class="meta-value">${escapeHtml(record.plant)}</span>
          </div>
          <div class="meta-row">
            <span class="meta-label">Material Type:</span>
            <span class="meta-value">${escapeHtml(record.matType)}</span>
          </div>
          <div class="meta-row">
            <span class="meta-label">Action:</span>
            <span class="meta-value">${escapeHtml(record.recommendation)}</span>
          </div>
        </div>
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
      // Show Fix & Cancel action buttons ONLY at this time!
      if (actionsContainer) actionsContainer.classList.remove('hidden');
    }

    if (messagesContainer) {
      messagesContainer.innerHTML = html;
      scrollToBottom();
    }
  }

  function cancelFix() {
    const messagesContainer = document.getElementById('chatbotMessages');
    const actionsContainer = document.getElementById('chatbotActions');
    const timestamp = formatCurrentTime();

    if (activePendingRecord) {
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
    if (actionsContainer) {
      actionsContainer.classList.add('hidden');
    }
  }

  function confirmFix() {
    if (!activePendingRecord) return;

    const recordToFix = activePendingRecord;
    const actionsContainer = document.getElementById('chatbotActions');
    const messagesContainer = document.getElementById('chatbotMessages');

    // Hide actions while processing
    if (actionsContainer) actionsContainer.classList.add('hidden');

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
      // Clean success confirmation WITHOUT ANY EMOJIS
      const successHtml = `
        <div class="chatbot-bubble bubble-success">
          <div class="success-header">
            <span class="success-check">✓</span> <strong>Successfully Fixed ${escapeHtml(recordToFix.errorType)} for ${escapeHtml(recordToFix.material)}!</strong>
          </div>
          <div class="success-body">
            SAP master data record synchronized in plant <strong>${escapeHtml(recordToFix.plant)}</strong>. Action executed: <em>${escapeHtml(recordToFix.recommendation)}</em>
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
    initiateFix: initiateFix,
    getRecents: function () { return recents; }
  };
})();

if (typeof module !== 'undefined' && module.exports) {
  module.exports = MaterialChatbot;
}
