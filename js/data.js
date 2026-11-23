/**
 * Material Error Dashboard - Data Layer
 * Contains master data (Plants, Cost Variants, Materials), 
 * deterministic error records, categories, and grouping engine.
 * Structured to map directly to a SAPUI5 JSONModel.
 */

const MaterialData = (function () {
  'use strict';

  // Available Plants (Expanded with global enterprise plants, scrollable)
  const PLANTS = [
    { key: "AD10", text: "AD10 - Advanced Dynamics Plant 10" },
    { key: "AD20", text: "AD20 - Advanced Dynamics Plant 20" },
    { key: "IN10", text: "IN10 - India Manufacturing Hub 10" },
    { key: "IN20", text: "IN20 - India Assembly Plant 20" },
    { key: "IN11", text: "IN11 - India Chemical Processing 11" },
    { key: "IN12", text: "IN12 - India Foundry & Casting 12" },
    { key: "IN13", text: "IN13 - India Logistics & Warehousing 13" },
    { key: "AU10", text: "AU10 - Australia Operations 10" },
    { key: "AU20", text: "AU20 - Australia Assembly 20" },
    { key: "CO10", text: "CO10 - Corporate Operations 10" },
    { key: "CO20", text: "CO20 - Corporate Central 20" },
    { key: "US10", text: "US10 - US East Production Facility" },
    { key: "US20", text: "US20 - US West Distribution Center" },
    { key: "DE10", text: "DE10 - Germany Frankfurt Precision Hub" },
    { key: "DE20", text: "DE20 - Germany Munich Assembly" },
    { key: "UK10", text: "UK10 - UK Industrial Operations" },
    { key: "SG10", text: "SG10 - Singapore Regional Plant" },
    { key: "JP10", text: "JP10 - Japan High-Tech Facility" },
    { key: "BR10", text: "BR10 - Brazil São Paulo Plant" },
    { key: "MX10", text: "MX10 - Mexico Monterrey Manufacturing" },
    { key: "CA10", text: "CA10 - Canada Central Logistics" }
  ];

  // Available Costing Variants (per requirements)
  const COST_VARIANTS = [
    { key: "PPC1", text: "PPC1 - Standard Costing Current" },
    { key: "ZPC1", text: "ZPC1 - Custom Valuation Variant 1" },
    { key: "ZPC2", text: "ZPC2 - Modified Costing Variant 2" }
  ];

  // Available Material Types (per requirements: FERT, ROH, HALB)
  const MATERIAL_TYPES = [
    { key: "FERT", text: "FERT - Finished Product" },
    { key: "ROH", text: "ROH - Raw Material" },
    { key: "HALB", text: "HALB - Semi-Finished Product" }
  ];

  // 23 Master Records accurately matching references:
  // Activity Price: 9 (3 in 1.1, 4 in 1.2, 2 in 1.3)
  // UOM Mismatch: 6 (3 in 2.1, 3 in 2.2)
  // Vendor Missing: 5 (3 in 3.1, 2 in 3.2)
  // Source List Missing: 3 (3 in 4.1)
  // Total: 23
  const INITIAL_RECORDS = [
    // ----------------------------------------------------
    // Category 1: Activity Price (9 Records)
    // ----------------------------------------------------
    // Group 1.1: Missing Activity Price (3)
    {
      id: "ERR-AP-01",
      material: "RMI-2142",
      description: "Polypropylene granules",
      errorCategory: "activityPrice",
      errorType: "Activity Price",
      groupKey: "1.1",
      groupNumber: "1.1",
      groupTitle: "Missing Activity Price",
      plant: "IN10",
      costVariant: "PPC1",
      matType: "ROH",
      recommendation: "Update activity price in KP26 for cost center CC-IN10-PROC.",
      isFixed: true, // Reference image 3 & 4 shows RMI-2142 already Fixed
      selected: false
    },
    {
      id: "ERR-AP-02",
      material: "RMI-2187",
      description: "Sodium hydroxide",
      errorCategory: "activityPrice",
      errorType: "Activity Price",
      groupKey: "1.1",
      groupNumber: "1.1",
      groupTitle: "Missing Activity Price",
      plant: "IN10",
      costVariant: "PPC1",
      matType: "ROH",
      recommendation: "Maintain activity price in KP26 for chemical processing cost center.",
      isFixed: false,
      selected: false
    },
    {
      id: "ERR-AP-03",
      material: "HALB-3310",
      description: "Sub-assembly bracket",
      errorCategory: "activityPrice",
      errorType: "Activity Price",
      groupKey: "1.1",
      groupNumber: "1.1",
      groupTitle: "Missing Activity Price",
      plant: "IN10",
      costVariant: "PPC1",
      matType: "HALB",
      recommendation: "Correct activity price in KP26 for fabrication cost center.",
      isFixed: false,
      selected: false
    },

    // Group 1.2: Incorrect Activity Price (4)
    {
      id: "ERR-AP-04",
      material: "FERT-1020",
      description: "High-pressure valve assembly",
      errorCategory: "activityPrice",
      errorType: "Activity Price",
      groupKey: "1.2",
      groupNumber: "1.2",
      groupTitle: "Incorrect Activity Price",
      plant: "IN10",
      costVariant: "PPC1",
      matType: "FERT",
      recommendation: "Adjust plan rate mismatch between KP26 and cost center CC-IN10-ASSY.",
      isFixed: false,
      selected: false
    },
    {
      id: "ERR-AP-05",
      material: "HALB-4421",
      description: "Cast aluminum casing",
      errorCategory: "activityPrice",
      errorType: "Activity Price",
      groupKey: "1.2",
      groupNumber: "1.2",
      groupTitle: "Incorrect Activity Price",
      plant: "IN10",
      costVariant: "PPC1",
      matType: "HALB",
      recommendation: "Recalculate machine hour rate in KP26.",
      isFixed: false,
      selected: false
    },
    {
      id: "ERR-AP-06",
      material: "RMI-3105",
      description: "Industrial lubricant grade B",
      errorCategory: "activityPrice",
      errorType: "Activity Price",
      groupKey: "1.2",
      groupNumber: "1.2",
      groupTitle: "Incorrect Activity Price",
      plant: "IN10",
      costVariant: "PPC1",
      matType: "ROH",
      recommendation: "Update direct labor cost center rates in KP26.",
      isFixed: false,
      selected: false
    },
    {
      id: "ERR-AP-07",
      material: "FERT-2099",
      description: "Industrial heat pump unit",
      errorCategory: "activityPrice",
      errorType: "Activity Price",
      groupKey: "1.2",
      groupNumber: "1.2",
      groupTitle: "Incorrect Activity Price",
      plant: "IN10",
      costVariant: "PPC1",
      matType: "FERT",
      recommendation: "Realign overhead activity rate with standard valuation variant in KP26.",
      isFixed: false,
      selected: false
    },

    // Group 1.3: Activity Price Not Maintained (2)
    {
      id: "ERR-AP-08",
      material: "RMI-4011",
      description: "Synthetic rubber polymer",
      errorCategory: "activityPrice",
      errorType: "Activity Price",
      groupKey: "1.3",
      groupNumber: "1.3",
      groupTitle: "Activity Price Not Maintained",
      plant: "IN10",
      costVariant: "PPC1",
      matType: "ROH",
      recommendation: "Maintain initial activity price for fiscal period in KP26.",
      isFixed: false,
      selected: false
    },
    {
      id: "ERR-AP-09",
      material: "HALB-5102",
      description: "Stamped chassis plate",
      errorCategory: "activityPrice",
      errorType: "Activity Price",
      groupKey: "1.3",
      groupNumber: "1.3",
      groupTitle: "Activity Price Not Maintained",
      plant: "IN10",
      costVariant: "PPC1",
      matType: "HALB",
      recommendation: "Maintain labor rate for welding work center in KP26.",
      isFixed: false,
      selected: false
    },

    // ----------------------------------------------------
    // Category 2: UOM Mismatch (6 Records)
    // ----------------------------------------------------
    // Group 2.1: Base UOM vs Purchase UOM Conflict (3)
    {
      id: "ERR-UM-01",
      material: "RMI-1055",
      description: "Carbon steel piping 40mm",
      errorCategory: "uomMismatch",
      errorType: "UOM Mismatch",
      groupKey: "2.1",
      groupNumber: "2.1",
      groupTitle: "Base UOM vs Purchase UOM Conflict",
      plant: "IN10",
      costVariant: "PPC1",
      matType: "ROH",
      recommendation: "Align purchase order unit (MTR) with base unit (KG) in MM02 conversion table.",
      isFixed: false,
      selected: false
    },
    {
      id: "ERR-UM-02",
      material: "RMI-1280",
      description: "Copper wiring spool",
      errorCategory: "uomMismatch",
      errorType: "UOM Mismatch",
      groupKey: "2.1",
      groupNumber: "2.1",
      groupTitle: "Base UOM vs Purchase UOM Conflict",
      plant: "IN10",
      costVariant: "PPC1",
      matType: "ROH",
      recommendation: "Update conversion ratio 1 ROLL = 100 M in material master purchasing view.",
      isFixed: false,
      selected: false
    },
    {
      id: "ERR-UM-03",
      material: "HALB-2204",
      description: "Hydraulic conduit fitting",
      errorCategory: "uomMismatch",
      errorType: "UOM Mismatch",
      groupKey: "2.1",
      groupNumber: "2.1",
      groupTitle: "Base UOM vs Purchase UOM Conflict",
      plant: "IN10",
      costVariant: "PPC1",
      matType: "HALB",
      recommendation: "Correct BOM component consumption unit in CS02 to match base inventory UOM.",
      isFixed: false,
      selected: false
    },

    // Group 2.2: BOM Component UOM Inconsistency (3)
    {
      id: "ERR-UM-04",
      material: "FERT-3012",
      description: "Modular control panel",
      errorCategory: "uomMismatch",
      errorType: "UOM Mismatch",
      groupKey: "2.2",
      groupNumber: "2.2",
      groupTitle: "BOM Component UOM Inconsistency",
      plant: "IN10",
      costVariant: "PPC1",
      matType: "FERT",
      recommendation: "Standardize unit of measure across engineering drawing and production BOM.",
      isFixed: false,
      selected: false
    },
    {
      id: "ERR-UM-05",
      material: "HALB-6019",
      description: "Sensor harness module",
      errorCategory: "uomMismatch",
      errorType: "UOM Mismatch",
      groupKey: "2.2",
      groupNumber: "2.2",
      groupTitle: "BOM Component UOM Inconsistency",
      plant: "IN10",
      costVariant: "PPC1",
      matType: "HALB",
      recommendation: "Adjust decimal precision for milligram measurement unit in CUNI transaction.",
      isFixed: false,
      selected: false
    },
    {
      id: "ERR-UM-06",
      material: "RMI-5120",
      description: "Fastener bolt M8x40",
      errorCategory: "uomMismatch",
      errorType: "UOM Mismatch",
      groupKey: "2.2",
      groupNumber: "2.2",
      groupTitle: "BOM Component UOM Inconsistency",
      plant: "IN10",
      costVariant: "PPC1",
      matType: "ROH",
      recommendation: "Synchronize packaging unit (BOX) with inventory unit (PC) in MM02.",
      isFixed: false,
      selected: false
    },

    // ----------------------------------------------------
    // Category 3: Vendor Missing (5 Records)
    // ----------------------------------------------------
    // Group 3.1: No Preferred Vendor Assigned (3)
    {
      id: "ERR-VM-01",
      material: "RMI-8821",
      description: "Precision ceramic bearing",
      errorCategory: "vendorMissing",
      errorType: "Vendor Missing",
      groupKey: "3.1",
      groupNumber: "3.1",
      groupTitle: "No Preferred Vendor Assigned",
      plant: "IN10",
      costVariant: "PPC1",
      matType: "ROH",
      recommendation: "Assign approved vendor in purchasing info record (ME11) with net price.",
      isFixed: false,
      selected: false
    },
    {
      id: "ERR-VM-02",
      material: "RMI-9042",
      description: "Titanium alloy bolt M12",
      errorCategory: "vendorMissing",
      errorType: "Vendor Missing",
      groupKey: "3.1",
      groupNumber: "3.1",
      groupTitle: "No Preferred Vendor Assigned",
      plant: "IN10",
      costVariant: "PPC1",
      matType: "ROH",
      recommendation: "Maintain active vendor master record and link to plant purchasing org.",
      isFixed: false,
      selected: false
    },
    {
      id: "ERR-VM-03",
      material: "HALB-7711",
      description: "Microcontroller PCB board",
      errorCategory: "vendorMissing",
      errorType: "Vendor Missing",
      groupKey: "3.1",
      groupNumber: "3.1",
      groupTitle: "No Preferred Vendor Assigned",
      plant: "IN10",
      costVariant: "PPC1",
      matType: "HALB",
      recommendation: "Assign primary subcontracting vendor in material master purchasing view.",
      isFixed: false,
      selected: false
    },

    // Group 3.2: Vendor Record Blocked for Procurement (2)
    {
      id: "ERR-VM-04",
      material: "RMI-3319",
      description: "Solvent reagent grade A",
      errorCategory: "vendorMissing",
      errorType: "Vendor Missing",
      groupKey: "3.2",
      groupNumber: "3.2",
      groupTitle: "Vendor Record Blocked for Procurement",
      plant: "IN10",
      costVariant: "PPC1",
      matType: "ROH",
      recommendation: "Unblock vendor 100429 for purchasing organization or select alternate supplier in XK05.",
      isFixed: false,
      selected: false
    },
    {
      id: "ERR-VM-05",
      material: "RMI-4408",
      description: "Neoprene gasket seal",
      errorCategory: "vendorMissing",
      errorType: "Vendor Missing",
      groupKey: "3.2",
      groupNumber: "3.2",
      groupTitle: "Vendor Record Blocked for Procurement",
      plant: "IN10",
      costVariant: "PPC1",
      matType: "ROH",
      recommendation: "Review vendor quality audit status and reinstate purchasing authorization in QA08.",
      isFixed: false,
      selected: false
    },

    // ----------------------------------------------------
    // Category 4: Source List Missing (3 Records)
    // ----------------------------------------------------
    // Group 4.1: Source List Requirement Not Fulfilled (3)
    {
      id: "ERR-SL-01",
      material: "RMI-6601",
      description: "Optical grade quartz lens",
      errorCategory: "sourceListMissing",
      errorType: "Source List Missing",
      groupKey: "4.1",
      groupNumber: "4.1",
      groupTitle: "Source List Requirement Not Fulfilled",
      plant: "IN10",
      costVariant: "PPC1",
      matType: "ROH",
      recommendation: "Generate source list entry in ME01 for plant with valid period.",
      isFixed: false,
      selected: false
    },
    {
      id: "ERR-SL-02",
      material: "RMI-7723",
      description: "Specialty coolant fluid",
      errorCategory: "sourceListMissing",
      errorType: "Source List Missing",
      groupKey: "4.1",
      groupNumber: "4.1",
      groupTitle: "Source List Requirement Not Fulfilled",
      plant: "IN10",
      costVariant: "PPC1",
      matType: "ROH",
      recommendation: "Maintain source list record and mark MRP relevant indicator in ME01.",
      isFixed: false,
      selected: false
    },
    {
      id: "ERR-SL-03",
      material: "FERT-4480",
      description: "Calibrated pressure sensor",
      errorCategory: "sourceListMissing",
      errorType: "Source List Missing",
      groupKey: "4.1",
      groupNumber: "4.1",
      groupTitle: "Source List Requirement Not Fulfilled",
      plant: "IN10",
      costVariant: "PPC1",
      matType: "FERT",
      recommendation: "Create vendor outline contract reference in source list table (ME01).",
      isFixed: false,
      selected: false
    }
  ];

  function clone(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  return {
    getPlants: function () {
      return clone(PLANTS);
    },
    getCostVariants: function () {
      return clone(COST_VARIANTS);
    },
    getMaterialTypes: function () {
      return clone(MATERIAL_TYPES);
    },
    getInitialRecords: function () {
      return clone(INITIAL_RECORDS);
    },
    calculateCounts: function (records) {
      const counts = {
        total: 0,
        activityPrice: 0,
        uomMismatch: 0,
        vendorMissing: 0,
        sourceListMissing: 0
      };
      records.forEach(function (r) {
        counts.total++;
        if (counts[r.errorCategory] !== undefined) {
          counts[r.errorCategory]++;
        }
      });
      return counts;
    },
    getCategoryMeta: function (key) {
      switch (key) {
        case "activityPrice":
          return {
            key: "activityPrice",
            title: "Activity Price",
            icon: "tag",
            badgeClass: "badge-red",
            cardClass: "card-red",
            groupClass: "group-red",
            accentColor: "#be123c",
            bgColor: "#fff1f2"
          };
        case "uomMismatch":
          return {
            key: "uomMismatch",
            title: "UOM Mismatch",
            icon: "scale",
            badgeClass: "badge-orange",
            cardClass: "card-orange",
            groupClass: "group-orange",
            accentColor: "#b45309",
            bgColor: "#fffbeb"
          };
        case "vendorMissing":
          return {
            key: "vendorMissing",
            title: "Vendor Missing",
            icon: "users",
            badgeClass: "badge-blue",
            cardClass: "card-blue",
            groupClass: "group-blue",
            accentColor: "#0369a1",
            bgColor: "#f0f9ff"
          };
        case "sourceListMissing":
          return {
            key: "sourceListMissing",
            title: "Source List Missing",
            icon: "list",
            badgeClass: "badge-green",
            cardClass: "card-green",
            groupClass: "group-green",
            accentColor: "#15803d",
            bgColor: "#f0fdf4"
          };
        case "total":
        default:
          return {
            key: "total",
            title: "Total Errors",
            icon: "layers",
            badgeClass: "badge-purple",
            cardClass: "card-purple",
            groupClass: "group-purple",
            accentColor: "#581c87",
            bgColor: "#f5f0ff"
          };
      }
    },

    /**
     * SAP CS15 - Material Where-Used List & SA3 Root Cause Analysis Engine
     * Traces bottom-up BOM dependencies:
     * Component (ROH) -> Parent Assemblies (HALB) -> Finished Products (FERT)
     * Answers: "If this component has a problem, which other products might be affected?"
     */
    getWhereUsedData: function (materialInput) {
      const records = this.getInitialRecords();
      let matCode = typeof materialInput === 'string' ? materialInput : (materialInput && materialInput.material ? materialInput.material : 'RMI-2187');
      const rec = records.find(r => r.material.toLowerCase() === matCode.toLowerCase()) || (typeof materialInput === 'object' ? materialInput : null) || {
        material: matCode,
        description: "Standard Production Component",
        plant: "IN10",
        costVariant: "PPC1",
        matType: matCode.startsWith('HALB') ? 'HALB' : (matCode.startsWith('FERT') ? 'FERT' : 'ROH'),
        errorType: "Activity Price",
        recommendation: "Maintain missing costing master data in SAP.",
        isFixed: false
      };

      // Deterministic Where-Used database for common materials
      const bomDatabase = {
        "RMI-2187": {
          parents: [
            {
              material: "HALB-2204",
              description: "Hydraulic conduit fitting",
              matType: "HALB",
              plant: rec.plant || "IN10",
              qty: "2.5 KG",
              bomItem: "0010",
              status: "At Risk",
              finishedGoods: [
                {
                  material: "FERT-1001",
                  description: "Industrial Flow Meter Assembly",
                  matType: "FERT",
                  plant: rec.plant || "IN10",
                  qty: "1 EA",
                  impact: "Standard Cost Run CK40N Blocked",
                  costVariance: "$74,200"
                },
                {
                  material: "FERT-1020",
                  description: "High-pressure valve assembly",
                  matType: "FERT",
                  plant: rec.plant || "IN10",
                  qty: "2 EA",
                  impact: "Cost Rollup Incomplete",
                  costVariance: "$52,800"
                }
              ]
            },
            {
              material: "HALB-3310",
              description: "Sub-assembly bracket",
              matType: "HALB",
              plant: rec.plant || "IN10",
              qty: "1.8 KG",
              bomItem: "0020",
              status: "At Risk",
              finishedGoods: [
                {
                  material: "FERT-2099",
                  description: "Industrial heat pump unit",
                  matType: "FERT",
                  plant: rec.plant || "IN10",
                  qty: "1 EA",
                  impact: "Valuation Variance Warning",
                  costVariance: "$121,500"
                }
              ]
            }
          ],
          totalExposure: "$248,500.00",
          priorityScore: "9.4 / 10",
          priorityLevel: "Critical",
          exposureLevel: "High Risk"
        },
        "RMI-2142": {
          parents: [
            {
              material: "HALB-3310",
              description: "Sub-assembly bracket",
              matType: "HALB",
              plant: rec.plant || "IN10",
              qty: "5.0 KG",
              bomItem: "0015",
              status: rec.isFixed ? "Resolved" : "At Risk",
              finishedGoods: [
                {
                  material: "FERT-1020",
                  description: "High-pressure valve assembly",
                  matType: "FERT",
                  plant: rec.plant || "IN10",
                  qty: "1 EA",
                  impact: rec.isFixed ? "Cost Rollup Available" : "Cost Calculation Halted",
                  costVariance: "$64,000"
                },
                {
                  material: "FERT-2099",
                  description: "Industrial heat pump unit",
                  matType: "FERT",
                  plant: rec.plant || "IN10",
                  qty: "2 EA",
                  impact: rec.isFixed ? "Cost Rollup Available" : "Standard Cost Incomplete",
                  costVariance: "$89,500"
                }
              ]
            },
            {
              material: "HALB-4421",
              description: "Cast aluminum casing",
              matType: "HALB",
              plant: rec.plant || "IN10",
              qty: "3.2 KG",
              bomItem: "0030",
              status: rec.isFixed ? "Resolved" : "At Risk",
              finishedGoods: [
                {
                  material: "FERT-3040",
                  description: "Centrifugal pump skid 75kW",
                  matType: "FERT",
                  plant: rec.plant || "IN10",
                  qty: "1 EA",
                  impact: rec.isFixed ? "Cost Rollup Available" : "Price Variance Warning",
                  costVariance: "$112,000"
                }
              ]
            }
          ],
          totalExposure: "$265,500.00",
          priorityScore: "8.9 / 10",
          priorityLevel: "High",
          exposureLevel: "High Risk"
        },
        "HALB-3310": {
          parents: [
            {
              material: "HALB-3310",
              description: "Sub-assembly bracket (Direct Assembly)",
              matType: "HALB",
              plant: rec.plant || "IN10",
              qty: "1 EA",
              bomItem: "0010",
              status: "At Risk",
              finishedGoods: [
                {
                  material: "FERT-1020",
                  description: "High-pressure valve assembly",
                  matType: "FERT",
                  plant: rec.plant || "IN10",
                  qty: "1 EA",
                  impact: "Direct BOM Component Cost Blocked",
                  costVariance: "$64,000"
                },
                {
                  material: "FERT-2099",
                  description: "Industrial heat pump unit",
                  matType: "FERT",
                  plant: rec.plant || "IN10",
                  qty: "2 EA",
                  impact: "Standard Cost Estimate Incomplete",
                  costVariance: "$121,500"
                }
              ]
            }
          ],
          totalExposure: "$185,500.00",
          priorityScore: "8.7 / 10",
          priorityLevel: "High",
          exposureLevel: "High Risk"
        },
        "RMI-1055": {
          parents: [
            {
              material: "HALB-2204",
              description: "Hydraulic conduit fitting",
              matType: "HALB",
              plant: rec.plant || "IN10",
              qty: "4.0 MTR",
              bomItem: "0025",
              status: "At Risk",
              finishedGoods: [
                {
                  material: "FERT-1001",
                  description: "Industrial Flow Meter Assembly",
                  matType: "FERT",
                  plant: rec.plant || "IN10",
                  qty: "1 EA",
                  impact: "UOM Conversion Mismatch Blocks Valuation",
                  costVariance: "$74,200"
                },
                {
                  material: "FERT-1020",
                  description: "High-pressure valve assembly",
                  matType: "FERT",
                  plant: rec.plant || "IN10",
                  qty: "2 EA",
                  impact: "BOM Valuation Error",
                  costVariance: "$52,800"
                }
              ]
            }
          ],
          totalExposure: "$127,000.00",
          priorityScore: "8.1 / 10",
          priorityLevel: "High",
          exposureLevel: "Moderate Risk"
        },
        "RMI-1280": {
          parents: [
            {
              material: "HALB-5102",
              description: "Stamped chassis plate",
              matType: "HALB",
              plant: rec.plant || "IN10",
              qty: "15.0 M",
              bomItem: "0040",
              status: "At Risk",
              finishedGoods: [
                {
                  material: "FERT-2099",
                  description: "Industrial heat pump unit",
                  matType: "FERT",
                  plant: rec.plant || "IN10",
                  qty: "1 EA",
                  impact: "Electrical Harness BOM Costing Error",
                  costVariance: "$89,200"
                }
              ]
            }
          ],
          totalExposure: "$89,200.00",
          priorityScore: "7.6 / 10",
          priorityLevel: "Medium",
          exposureLevel: "Moderate Risk"
        },
        "HALB-2204": {
          parents: [
            {
              material: "HALB-2204",
              description: "Hydraulic conduit fitting (Direct Assembly)",
              matType: "HALB",
              plant: rec.plant || "IN10",
              qty: "1 EA",
              bomItem: "0010",
              status: "At Risk",
              finishedGoods: [
                {
                  material: "FERT-1001",
                  description: "Industrial Flow Meter Assembly",
                  matType: "FERT",
                  plant: rec.plant || "IN10",
                  qty: "1 EA",
                  impact: "Standard Cost Run CK40N Blocked",
                  costVariance: "$74,200"
                },
                {
                  material: "FERT-1020",
                  description: "High-pressure valve assembly",
                  matType: "FERT",
                  plant: rec.plant || "IN10",
                  qty: "2 EA",
                  impact: "Direct BOM Component Cost Blocked",
                  costVariance: "$52,800"
                }
              ]
            }
          ],
          totalExposure: "$127,000.00",
          priorityScore: "8.3 / 10",
          priorityLevel: "High",
          exposureLevel: "High Risk"
        }
      };

      // Retrieve mapped data or synthesize deterministic multi-level BOM
      let traceData = bomDatabase[rec.material];
      const isFert = rec.matType === 'FERT';

      if (isFert) {
        return {
          component: rec,
          sapTransaction: "CS15 – Material Where-Used List",
          sapAgent: "SA3 (Root Cause Analysis Agent)",
          isTopLevel: true,
          parents: [],
          finishedGoods: [
            {
              material: rec.material,
              description: rec.description,
              matType: "FERT",
              plant: rec.plant || "IN10",
              qty: "1 EA",
              impact: "Target Finished Product (Top of BOM)",
              costVariance: "$95,000"
            }
          ],
          totalParents: 0,
          totalFinishedGoods: 1,
          totalAffected: 1,
          estimatedCostExposure: "$95,000.00",
          priorityScore: "8.5 / 10",
          priorityLevel: "High",
          exposureLevel: "Top-Level Product",
          sa3Analysis: `Material <strong>${rec.material}</strong> is a Finished Product (FERT) at the top of the Bill of Materials hierarchy. It does not appear as a component inside higher-level BOMs.<br><br>💡 To inspect components required to build this finished product, use <strong>BOM Explosion (CS03 / CS11)</strong> instead of Where-Used analysis.`,
          exampleStory: {
            component: "Tyre (ROH001)",
            parent: "Wheel Assembly (HALB001)",
            finished: "Bicycle (FG001)"
          }
        };
      }

      if (!traceData) {
        // Deterministic fallback for other materials
        const isHalb = rec.matType === 'HALB';
        const parentCode = isHalb ? rec.material : "HALB-" + (rec.material.replace(/\D/g, '') || "2204");
        traceData = {
          parents: [
            {
              material: parentCode,
              description: isHalb ? rec.description : "Modular Sub-Assembly " + parentCode,
              matType: "HALB",
              plant: rec.plant || "IN10",
              qty: "2.0 EA",
              bomItem: "0010",
              status: rec.isFixed ? "Resolved" : "At Risk",
              finishedGoods: [
                {
                  material: "FERT-1020",
                  description: "High-pressure valve assembly",
                  matType: "FERT",
                  plant: rec.plant || "IN10",
                  qty: "1 EA",
                  impact: rec.isFixed ? "Cost Rollup Available" : "Cost Calculation Halted",
                  costVariance: "$64,000"
                },
                {
                  material: "FERT-2099",
                  description: "Industrial heat pump unit",
                  matType: "FERT",
                  plant: rec.plant || "IN10",
                  qty: "1 EA",
                  impact: rec.isFixed ? "Cost Rollup Available" : "Standard Cost Incomplete",
                  costVariance: "$98,500"
                }
              ]
            }
          ],
          totalExposure: "$162,500.00",
          priorityScore: "8.4 / 10",
          priorityLevel: "High",
          exposureLevel: "High Risk"
        };
      }

      const allFinished = [];
      traceData.parents.forEach(p => {
        if (p.finishedGoods) {
          p.finishedGoods.forEach(fg => {
            if (!allFinished.some(x => x.material === fg.material)) {
              allFinished.push(fg);
            }
          });
        }
      });

      const totalParents = traceData.parents.length;
      const totalFinished = allFinished.length;
      const totalAffected = totalParents + totalFinished;

      return {
        component: rec,
        sapTransaction: "CS15 – Material Where-Used List",
        sapAgent: "SA3 (Root Cause Analysis Agent)",
        isTopLevel: false,
        parents: traceData.parents,
        finishedGoods: allFinished,
        totalParents: totalParents,
        totalFinishedGoods: totalFinished,
        totalAffected: totalAffected,
        estimatedCostExposure: traceData.totalExposure,
        priorityScore: traceData.priorityScore,
        priorityLevel: traceData.priorityLevel,
        exposureLevel: traceData.exposureLevel,
        sa3Analysis: `Component <strong>${rec.material}</strong> (${rec.description}) is actively used in <strong>${totalParents} parent assembly BOM(s)</strong> and cascades downstream into <strong>${totalFinished} finished product(s) (FERT)</strong>.<br><br>⚠️ <strong>Root Cause Impact:</strong> The current <em>${rec.errorType}</em> error prevents cost rollup across all dependent assemblies. In monthly transaction CK40N, ${totalFinished} finished products will fail costing runs until this component is resolved.`,
        exampleStory: {
          component: "Tyre (ROH001)",
          parent: "Wheel Assembly (HALB001)",
          finished: "Bicycle (FG001)"
        }
      };
    },

    /**
     * SAP CS15 - Multi-Material / Batch Where-Used Analysis Engine
     * Aggregates bottom-up BOM dependencies for 2+ selected problematic materials.
     * Identifies converging parent assemblies, blocked finished products,
     * and compounded downstream cost exposure.
     */
    getBatchWhereUsedData: function (recordsOrMaterials) {
      if (!Array.isArray(recordsOrMaterials) || recordsOrMaterials.length === 0) {
        return null;
      }

      const items = recordsOrMaterials.map(item => this.getWhereUsedData(item));
      const components = items.map(it => it.component);

      // Aggregate Unique Parents
      const parentMap = new Map();
      items.forEach(it => {
        if (it.parents) {
          it.parents.forEach(p => {
            if (!parentMap.has(p.material)) {
              parentMap.set(p.material, {
                ...p,
                usedByComponents: [it.component.material]
              });
            } else {
              const existing = parentMap.get(p.material);
              if (!existing.usedByComponents.includes(it.component.material)) {
                existing.usedByComponents.push(it.component.material);
              }
            }
          });
        }
      });
      const uniqueParents = Array.from(parentMap.values());

      // Aggregate Unique Finished Goods & detect BOM Convergence
      const fgMap = new Map();
      let totalExposureNum = 0;

      items.forEach(it => {
        if (it.finishedGoods) {
          it.finishedGoods.forEach(fg => {
            const rawCost = parseFloat((fg.costVariance || "$0").replace(/[^0-9.]/g, '')) || 0;
            if (!fgMap.has(fg.material)) {
              totalExposureNum += rawCost;
              fgMap.set(fg.material, {
                ...fg,
                dependentComponents: [it.component.material],
                totalCostNum: rawCost
              });
            } else {
              const existing = fgMap.get(fg.material);
              if (!existing.dependentComponents.includes(it.component.material)) {
                existing.dependentComponents.push(it.component.material);
                // Compounding exposure for multi-component failure
                existing.totalCostNum += Math.round(rawCost * 0.5);
                totalExposureNum += Math.round(rawCost * 0.5);
              }
            }
          });
        }
      });

      const uniqueFinishedGoods = Array.from(fgMap.values());
      const convergingFinishedGoods = uniqueFinishedGoods.filter(fg => fg.dependentComponents.length > 1);

      const totalParents = uniqueParents.length;
      const totalFinished = uniqueFinishedGoods.length;
      const totalAffected = totalParents + totalFinished;

      // Priority calculation
      let maxScore = 0;
      items.forEach(it => {
        const sc = parseFloat(it.priorityScore) || 8.0;
        if (sc > maxScore) maxScore = sc;
      });
      const batchPriorityScore = (Math.min(9.9, maxScore + 0.3 * (items.length - 1))).toFixed(1) + " / 10";

      const formattedExposure = "$" + totalExposureNum.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

      // Construct SA3 Multi-Component Correlation Insight
      const compNames = components.map(c => `<strong>${c.material}</strong>`).join(', ');
      let convergenceText = "";
      if (convergingFinishedGoods.length > 0) {
        const convNames = convergingFinishedGoods.map(f => `<strong>${f.material}</strong> (${f.description})`).join(', ');
        convergenceText = `<br><br>⚡ <strong>Critical BOM Convergence Detected:</strong> Finished product(s) ${convNames} depend simultaneously on multiple problematic components (${convergingFinishedGoods.map(f => f.dependentComponents.join(' + ')).join('; ')}). In transaction CK40N, this causes compound costing failures across parallel assembly routes.`;
      }

      const sa3Analysis = `Batch analysis for ${items.length} components (${compNames}): Problematic components ripple across <strong>${totalParents} parent assembly BOM(s)</strong> and halt valuation for <strong>${totalFinished} finished product(s) (FERT)</strong>.${convergenceText}<br><br>🛡️ <strong>Recommended Action:</strong> Resolve all ${items.length} selected components simultaneously using <em>Fix All</em> to unblock cost rollups before monthly CK40N closing.`;

      return {
        materialsCount: items.length,
        components: components,
        items: items,
        uniqueParents: uniqueParents,
        uniqueFinishedGoods: uniqueFinishedGoods,
        convergingFinishedGoods: convergingFinishedGoods,
        totalParents: totalParents,
        totalFinishedGoods: totalFinished,
        totalAffected: totalAffected,
        totalExposure: formattedExposure,
        priorityScore: batchPriorityScore,
        priorityLevel: "Critical",
        sa3Analysis: sa3Analysis,
        sapTransaction: "CS15 – Batch Material Where-Used List",
        sapAgent: "SA3 (Multi-Component Root Cause Analysis Agent)"
      };
    }
  };
})();

if (typeof module !== 'undefined' && module.exports) {
  module.exports = MaterialData;
}
