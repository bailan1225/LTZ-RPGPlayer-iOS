/////////////////////////////////////////////////
// Cheat Menu Plugin - METABYTECODE/RPGMakerCheatMenu
// Adapted for ArkRPG (iOS WKWebView)
// Changes from original:
//   1. CSS inlined via <style> tag (no external .css file dependency)
//   2. NW.js devtools block removed (not available on iOS)
//   3. Added ArkRPG_CheatMenu.toggleMenu() for Swift native button to call
//
// Additional features adapted from paramonos/RPG-Maker-MV-MZ-Cheat-UI-Plugin
// (MIT, Copyright (c) 2022 paramonos — see Resources/Licenses/ParamonosCheatUI.txt):
//   - Disable random encounter (hook $gamePlayer.canEncounter)
//   - Force battle outcome (processVictory/Defeat/Escape/Abort)
//   - Game speed acceleration via SceneManager.updateScene accumulator
//   - Message auto-skip while speed > 1x
/////////////////////////////////////////////////

// This plugin intentionally lives in a private namespace and is safe to load
// more than once. Games may ship their own Cheat_Menu.js; ArkRPG must neither
// overwrite it nor let it overwrite this runtime.
(function(global) {
var runtimeKey = "__ARKRPG_CHEAT_MENU_RUNTIME_V2__";
if (global[runtimeKey]) {
	console.warn("[ArkRPG_CheatMenu] duplicate load ignored");
	return;
}
var arkRuntime = {
	version: 2,
	installed: false
};
global[runtimeKey] = arkRuntime;

// Inline CSS (originally in ArkRPG_CheatMenu.css)
(function() {
    var style = document.createElement('style');
    style.textContent = "/* Modern Trainer Style Cheat Menu */\n\n* {\n\tbox-sizing: border-box;\n}\n\n.arkrpg-cheat-menu-container {\n\tposition: fixed;\n\ttop: 50%;\n\tleft: 50%;\n\ttransform: translate(-50%, -50%);\n\twidth: 900px;\n\tmax-width: 95vw;\n\theight: 700px;\n\tmax-height: 90vh;\n\tbackground: #0d1117;\n\tborder: 1px solid #21262d;\n\tborder-radius: 8px;\n\tbox-shadow: 0 16px 48px rgba(0, 0, 0, 0.8);\n\tz-index: 10000;\n\tdisplay: flex;\n\tflex-direction: column;\n\toverflow: hidden;\n\tfont-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;\n\tcolor: #c9d1d9;\n\tfont-size: 14px;\n}\n\n/* Header */\n.arkrpg-cheat-menu-header {\n\tdisplay: flex;\n\talign-items: center;\n\tjustify-content: space-between;\n\tpadding: 16px 20px;\n\tbackground: linear-gradient(135deg, #161b22 0%, #0d1117 100%);\n\tborder-bottom: 1px solid #21262d;\n\tflex-shrink: 0;\n}\n\n.arkrpg-cheat-menu-title {\n\tfont-size: 18px;\n\tfont-weight: 700;\n\tcolor: #58a6ff;\n\tletter-spacing: 1px;\n\ttext-shadow: 0 0 10px rgba(88, 166, 255, 0.3);\n}\n\n.arkrpg-cheat-menu-close {\n\twidth: 32px;\n\theight: 32px;\n\tbackground: transparent;\n\tborder: 1px solid #30363d;\n\tborder-radius: 6px;\n\tcolor: #8b949e;\n\tfont-size: 20px;\n\tfont-weight: bold;\n\tcursor: pointer;\n\tdisplay: flex;\n\talign-items: center;\n\tjustify-content: center;\n\ttransition: all 0.2s ease;\n\tline-height: 1;\n}\n\n.arkrpg-cheat-menu-close:hover {\n\tbackground: #21262d;\n\tborder-color: #f85149;\n\tcolor: #f85149;\n}\n\n/* Wrapper */\n.arkrpg-cheat-menu-wrapper {\n\tdisplay: flex;\n\tflex: 1;\n\toverflow: hidden;\n}\n\n/* Sidebar */\n.arkrpg-cheat-menu-sidebar {\n\twidth: 220px;\n\tbackground: #161b22;\n\tborder-right: 1px solid #21262d;\n\toverflow-y: auto;\n\tflex-shrink: 0;\n}\n\n.arkrpg-cheat-menu-sidebar::-webkit-scrollbar {\n\twidth: 6px;\n}\n\n.arkrpg-cheat-menu-sidebar::-webkit-scrollbar-track {\n\tbackground: #0d1117;\n}\n\n.arkrpg-cheat-menu-sidebar::-webkit-scrollbar-thumb {\n\tbackground: #30363d;\n\tborder-radius: 3px;\n}\n\n.arkrpg-cheat-menu-sidebar::-webkit-scrollbar-thumb:hover {\n\tbackground: #484f58;\n}\n\n.arkrpg-cheat-menu-sidebar-item {\n\tdisplay: flex;\n\talign-items: center;\n\tgap: 12px;\n\tpadding: 12px 16px;\n\tcursor: pointer;\n\ttransition: all 0.2s ease;\n\tborder-left: 3px solid transparent;\n\tcolor: #8b949e;\n}\n\n.arkrpg-cheat-menu-sidebar-item:hover {\n\tbackground: #21262d;\n\tcolor: #c9d1d9;\n\tborder-left-color: #58a6ff;\n}\n\n.arkrpg-cheat-menu-sidebar-item.active {\n\tbackground: #1c2128;\n\tcolor: #58a6ff;\n\tborder-left-color: #58a6ff;\n\tfont-weight: 600;\n}\n\n.arkrpg-cheat-menu-icon {\n\tfont-size: 18px;\n\twidth: 24px;\n\ttext-align: center;\n}\n\n.arkrpg-cheat-menu-text {\n\tflex: 1;\n\tfont-size: 13px;\n}\n\n/* Content Area */\n.arkrpg-cheat-menu-content {\n\tflex: 1;\n\toverflow-y: auto;\n\tpadding: 24px;\n\tbackground: #0d1117;\n}\n\n.arkrpg-cheat-menu-content::-webkit-scrollbar {\n\twidth: 8px;\n}\n\n.arkrpg-cheat-menu-content::-webkit-scrollbar-track {\n\tbackground: #0d1117;\n}\n\n.arkrpg-cheat-menu-content::-webkit-scrollbar-thumb {\n\tbackground: #30363d;\n\tborder-radius: 4px;\n}\n\n.arkrpg-cheat-menu-content::-webkit-scrollbar-thumb:hover {\n\tbackground: #484f58;\n}\n\n/* Sections */\n.arkrpg-cheat-section {\n\tmargin-bottom: 24px;\n\tpadding: 20px;\n\tbackground: #161b22;\n\tborder: 1px solid #21262d;\n\tborder-radius: 6px;\n}\n\n.arkrpg-cheat-section-title {\n\tmargin: 0 0 16px 0;\n\tpadding-bottom: 12px;\n\tborder-bottom: 1px solid #21262d;\n\tcolor: #58a6ff;\n\tfont-size: 16px;\n\tfont-weight: 600;\n}\n\n/* Buttons */\n.arkrpg-cheat-btn {\n\twidth: 100%;\n\tpadding: 12px 20px;\n\tmargin: 8px 0;\n\tbackground: #21262d;\n\tborder: 1px solid #30363d;\n\tborder-radius: 6px;\n\tcolor: #c9d1d9;\n\tfont-size: 14px;\n\tfont-weight: 500;\n\tcursor: pointer;\n\ttransition: all 0.2s ease;\n\ttext-align: center;\n}\n\n.arkrpg-cheat-btn:hover {\n\tbackground: #30363d;\n\tborder-color: #58a6ff;\n\tcolor: #ffffff;\n\ttransform: translateY(-1px);\n\tbox-shadow: 0 4px 12px rgba(88, 166, 255, 0.2);\n}\n\n.arkrpg-cheat-btn:active {\n\ttransform: translateY(0);\n\tbox-shadow: 0 2px 6px rgba(88, 166, 255, 0.15);\n}\n\n.arkrpg-cheat-btn-primary {\n\tbackground: linear-gradient(135deg, #238636 0%, #2ea043 100%);\n\tborder-color: #2ea043;\n\tcolor: #ffffff;\n\tfont-weight: 600;\n}\n\n.arkrpg-cheat-btn-primary:hover {\n\tbackground: linear-gradient(135deg, #2ea043 0%, #238636 100%);\n\tbox-shadow: 0 4px 12px rgba(46, 160, 67, 0.4);\n}\n\n.arkrpg-cheat-btn-toggle {\n\tbackground: #21262d;\n\tborder-color: #30363d;\n\tposition: relative;\n}\n\n.arkrpg-cheat-btn-toggle.active {\n\tbackground: linear-gradient(135deg, #238636 0%, #2ea043 100%);\n\tborder-color: #2ea043;\n\tcolor: #ffffff;\n}\n\n.arkrpg-cheat-btn-toggle:not(.active) {\n\tbackground: #21262d;\n\tborder-color: #f85149;\n\tcolor: #f85149;\n}\n\n.arkrpg-cheat-btn-control {\n\twidth: 40px;\n\tmin-width: 40px;\n\tpadding: 8px;\n\tmargin: 0;\n\tfont-size: 18px;\n\tfont-weight: bold;\n\tbackground: #21262d;\n\tborder: 1px solid #30363d;\n}\n\n.arkrpg-cheat-btn-control:hover {\n\tbackground: #30363d;\n\tborder-color: #58a6ff;\n}\n\n.arkrpg-cheat-btn-grid {\n\tdisplay: grid;\n\tgrid-template-columns: repeat(auto-fit, minmax(150px, 1fr));\n\tgap: 12px;\n\tmargin-top: 12px;\n}\n\n.arkrpg-cheat-btn-grid .arkrpg-cheat-btn {\n\tmargin: 0;\n}\n\n/* Input Groups */\n.arkrpg-cheat-input-group {\n\tdisplay: flex;\n\talign-items: center;\n\tjustify-content: space-between;\n\tpadding: 14px 16px;\n\tmargin: 12px 0;\n\tbackground: #0d1117;\n\tborder: 1px solid #21262d;\n\tborder-radius: 6px;\n\ttransition: all 0.2s ease;\n}\n\n.arkrpg-cheat-input-group:hover {\n\tborder-color: #30363d;\n\tbackground: #161b22;\n}\n\n.arkrpg-cheat-input-label {\n\tflex: 0 0 auto;\n\tmargin-right: 16px;\n\tfont-weight: 500;\n\tcolor: #8b949e;\n\tmin-width: 140px;\n\tfont-size: 13px;\n}\n\n.arkrpg-cheat-input-controls {\n\tdisplay: flex;\n\talign-items: center;\n\tgap: 12px;\n\tflex: 1;\n\tjustify-content: flex-end;\n}\n\n.arkrpg-cheat-value {\n\tmin-width: 100px;\n\tpadding: 8px 16px;\n\tbackground: #21262d;\n\tborder: 1px solid #30363d;\n\tborder-radius: 6px;\n\ttext-align: center;\n\tfont-weight: 600;\n\tcolor: #58a6ff;\n\tfont-size: 14px;\n}\n\n/* Info Display */\n.arkrpg-cheat-info {\n\tpadding: 16px;\n\tmargin: 12px 0;\n\tbackground: #0d1117;\n\tborder: 1px solid #21262d;\n\tborder-radius: 6px;\n\tline-height: 1.6;\n\tfont-size: 13px;\n\tcolor: #8b949e;\n}\n\n.arkrpg-cheat-info strong {\n\tcolor: #58a6ff;\n\tfont-weight: 600;\n}\n\n.arkrpg-cheat-info-small {\n\tpadding: 10px 14px;\n\tmargin: 8px 0;\n\tbackground: #0d1117;\n\tborder: 1px solid #21262d;\n\tborder-radius: 6px;\n\tfont-size: 12px;\n\tcolor: #8b949e;\n}\n\n/* Card Grid */\n.arkrpg-cheat-card-section {\n\tmargin: 16px 0;\n}\n\n.arkrpg-cheat-card-label {\n\tfont-size: 14px;\n\tfont-weight: 600;\n\tcolor: #8b949e;\n\tmargin-bottom: 12px;\n}\n\n.arkrpg-cheat-card-search {\n\twidth: 100%;\n\tpadding: 10px 14px;\n\tmargin-bottom: 16px;\n\tbackground: #0d1117;\n\tborder: 1px solid #21262d;\n\tborder-radius: 6px;\n\tcolor: #c9d1d9;\n\tfont-size: 13px;\n\ttransition: all 0.2s ease;\n}\n\n.arkrpg-cheat-card-search:focus {\n\toutline: none;\n\tborder-color: #58a6ff;\n\tbackground: #161b22;\n}\n\n.arkrpg-cheat-card-search::placeholder {\n\tcolor: #6e7681;\n}\n\n.arkrpg-cheat-card-grid {\n\tdisplay: grid;\n\tgrid-template-columns: repeat(auto-fill, minmax(180px, 1fr));\n\tgap: 12px;\n\tmax-height: 400px;\n\toverflow-y: auto;\n\toverflow-x: hidden;\n\tpadding: 4px;\n\tposition: relative;\n\t-webkit-overflow-scrolling: touch;\n}\n\n.arkrpg-cheat-card-grid::-webkit-scrollbar {\n\twidth: 8px;\n}\n\n.arkrpg-cheat-card-grid::-webkit-scrollbar-track {\n\tbackground: #0d1117;\n\tborder-radius: 4px;\n}\n\n.arkrpg-cheat-card-grid::-webkit-scrollbar-thumb {\n\tbackground: #30363d;\n\tborder-radius: 4px;\n\tcursor: pointer;\n}\n\n.arkrpg-cheat-card-grid::-webkit-scrollbar-thumb:hover {\n\tbackground: #484f58;\n}\n\n.arkrpg-cheat-card-grid::-webkit-scrollbar-thumb:active {\n\tbackground: #58a6ff;\n}\n\n.arkrpg-cheat-card {\n\tpadding: 12px 14px;\n\tbackground: #161b22;\n\tborder: 1px solid #21262d;\n\tborder-radius: 6px;\n\tcursor: pointer;\n\ttransition: all 0.2s ease;\n}\n\n.arkrpg-cheat-card:hover {\n\tbackground: #21262d;\n\tborder-color: #30363d;\n\ttransform: translateY(-2px);\n\tbox-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);\n}\n\n.arkrpg-cheat-card.active {\n\tbackground: #1c2128;\n\tborder-color: #58a6ff;\n\tbox-shadow: 0 0 0 2px rgba(88, 166, 255, 0.2);\n}\n\n.arkrpg-cheat-card-name {\n\tfont-size: 13px;\n\tfont-weight: 500;\n\tcolor: #c9d1d9;\n\tmargin-bottom: 4px;\n\tword-break: break-word;\n}\n\n.arkrpg-cheat-card.active .arkrpg-cheat-card-name {\n\tcolor: #58a6ff;\n}\n\n.arkrpg-cheat-card-extra {\n\tfont-size: 11px;\n\tcolor: #8b949e;\n\tmargin-top: 4px;\n}\n\n.arkrpg-cheat-menu-header {\n\tuser-select: none;\n}\n\n.arkrpg-cheat-menu-header:active {\n\tcursor: grabbing;\n}\n\n/* Responsive */\n@media (max-width: 1024px) {\n\t.arkrpg-cheat-menu-container {\n\t\twidth: 95vw;\n\t\theight: 85vh;\n\t}\n\t\n\t.arkrpg-cheat-menu-sidebar {\n\t\twidth: 180px;\n\t}\n\t\n\t.arkrpg-cheat-menu-text {\n\t\tfont-size: 12px;\n\t}\n}\n\n@media (max-width: 768px) {\n\t.arkrpg-cheat-menu-container {\n\t\twidth: 100vw;\n\t\theight: 100vh;\n\t\tmax-height: 100vh;\n\t\tborder-radius: 0;\n\t\ttop: 0;\n\t\tleft: 0;\n\t\ttransform: none;\n\t}\n\t\n\t.arkrpg-cheat-menu-wrapper {\n\t\tflex-direction: column;\n\t}\n\t\n\t.arkrpg-cheat-menu-sidebar {\n\t\twidth: 100%;\n\t\theight: auto;\n\t\tmax-height: 200px;\n\t\tborder-right: none;\n\t\tborder-bottom: 1px solid #21262d;\n\t\tdisplay: flex;\n\t\toverflow-x: auto;\n\t\toverflow-y: hidden;\n\t}\n\t\n\t.arkrpg-cheat-menu-sidebar-item {\n\t\tflex-shrink: 0;\n\t\twhite-space: nowrap;\n\t\tborder-left: none;\n\t\tborder-bottom: 3px solid transparent;\n\t}\n\t\n\t.arkrpg-cheat-menu-sidebar-item.active {\n\t\tborder-left: none;\n\t\tborder-bottom-color: #58a6ff;\n\t}\n\t\n\t.arkrpg-cheat-menu-sidebar-item:hover {\n\t\tborder-left: none;\n\t\tborder-bottom-color: #58a6ff;\n\t}\n\t\n\t.arkrpg-cheat-input-group {\n\t\tflex-direction: column;\n\t\talign-items: flex-start;\n\t\tgap: 12px;\n\t}\n\t\n\t.arkrpg-cheat-input-label {\n\t\tmargin-bottom: 0;\n\t}\n\t\n\t.arkrpg-cheat-input-controls {\n\t\twidth: 100%;\n\t\tjustify-content: space-between;\n\t}\n\t\n\t.arkrpg-cheat-btn-grid {\n\t\tgrid-template-columns: 1fr;\n\t}\n\t\n\t.arkrpg-cheat-card-grid {\n\t\tgrid-template-columns: repeat(auto-fill, minmax(140px, 1fr));\n\t\tgap: 8px;\n\t}\n}\n";
    document.head.appendChild(style);
})();

// iOS portrait safe-area fix: keep cheat menu header/buttons below status bar.
(function() {
	var safeStyle = document.createElement('style');
	safeStyle.textContent = [
		'@media (max-width: 768px) and (orientation: portrait) {',
		'  .arkrpg-cheat-menu-container {',
		'    left: env(safe-area-inset-left, 0px) !important;',
		'    width: calc(100vw - env(safe-area-inset-left, 0px) - env(safe-area-inset-right, 0px)) !important;',
		'    max-width: calc(100vw - env(safe-area-inset-left, 0px) - env(safe-area-inset-right, 0px)) !important;',
		'    top: env(safe-area-inset-top, 0px) !important;',
		'    height: calc(100vh - env(safe-area-inset-top, 0px)) !important;',
		'    max-height: calc(100vh - env(safe-area-inset-top, 0px)) !important;',
		'  }',
		'  .arkrpg-cheat-menu-header {',
		'    padding-top: calc(16px + env(safe-area-inset-top, 0px)) !important;',
		'  }',
		'}'
	].join('\n');
	document.head.appendChild(safeStyle);
})();


/////////////////////////////////////////////////
// Cheat Menu Plugin Class
/////////////////////////////////////////////////
var ArkRPG_CheatMenu = global.ArkRPG_CheatMenu = global.ArkRPG_CheatMenu || {};

ArkRPG_CheatMenu.initialized = false;
ArkRPG_CheatMenu.cheat_menu_open = false;
ArkRPG_CheatMenu.overlay_openable = false;
ArkRPG_CheatMenu.menu_update_timer = null;

ArkRPG_CheatMenu.cheat_selected = 0;
ArkRPG_CheatMenu.cheat_selected_actor = 1;
ArkRPG_CheatMenu.amounts = [1, 10, 100, 1000, 10000, 100000, 1000000];
ArkRPG_CheatMenu.amount_index = 0;
ArkRPG_CheatMenu.stat_selection = 0;
ArkRPG_CheatMenu.item_selection = 1;
ArkRPG_CheatMenu.weapon_selection = 1;
ArkRPG_CheatMenu.armor_selection = 1;
ArkRPG_CheatMenu.move_amounts = [0.5, 1, 1.5, 2];
ArkRPG_CheatMenu.move_amount_index = 1;
ArkRPG_CheatMenu.variable_selection = 1;
ArkRPG_CheatMenu.switch_selection = 1;
ArkRPG_CheatMenu.saved_positions = [{m: -1, x: -1, y: -1}, {m: -1, x: -1, y: -1}, {m: -1, x: -1, y: -1}];
ArkRPG_CheatMenu.teleport_location = {m: 1, x: 0, y: 0};
ArkRPG_CheatMenu.speed = null;
ArkRPG_CheatMenu.speed_unlocked = true;
ArkRPG_CheatMenu.speed_initialized = false;

// P0-A1: Disable random encounter
ArkRPG_CheatMenu.disable_encounter = false;
ArkRPG_CheatMenu._encounter_bkup = null;

// P0-A3: Force battle outcome — stateless (per-click action)

// P1-A2: Game speed acceleration
ArkRPG_CheatMenu.game_speed = 1;
ArkRPG_CheatMenu.game_speed_rates = [0.5, 1, 2, 3, 5, 10];
ArkRPG_CheatMenu.game_speed_index = 1; // index into rates; default 1 = 1x
ArkRPG_CheatMenu._game_speed_applied = false;
ArkRPG_CheatMenu._orig_updateScene = null;
ArkRPG_CheatMenu._game_speed_accum = 0;
ArkRPG_CheatMenu._msg_skip_installed = false;
ArkRPG_CheatMenu._game_speed_wrapper_tag = "__arkrpg_cheat_game_speed_wrapper_v2";
ArkRPG_CheatMenu._game_speed_original_tag = "__arkrpg_cheat_game_speed_original_v2";

if (typeof ArkRPG_CheatMenu.initial_values == "undefined") { ArkRPG_CheatMenu.initial_values = {}; }
ArkRPG_CheatMenu.initial_values.cheat_selected = 0;
ArkRPG_CheatMenu.initial_values.cheat_selected_actor = 1;
ArkRPG_CheatMenu.initial_values.amount_index = 0;
ArkRPG_CheatMenu.initial_values.stat_selection = 0;
ArkRPG_CheatMenu.initial_values.item_selection = 1;
ArkRPG_CheatMenu.initial_values.weapon_selection = 1;
ArkRPG_CheatMenu.initial_values.armor_selection = 1;
ArkRPG_CheatMenu.initial_values.move_amount_index = 1;
ArkRPG_CheatMenu.initial_values.variable_selection = 1;
ArkRPG_CheatMenu.initial_values.switch_selection = 1;
ArkRPG_CheatMenu.initial_values.saved_positions = [{m: -1, x: -1, y: -1}, {m: -1, x: -1, y: -1}, {m: -1, x: -1, y: -1}];
ArkRPG_CheatMenu.initial_values.teleport_location = {m: 1, x: 0, y: 0};
ArkRPG_CheatMenu.initial_values.speed = null;
ArkRPG_CheatMenu.initial_values.speed_unlocked = true;
ArkRPG_CheatMenu.initial_values.disable_encounter = false;
ArkRPG_CheatMenu.initial_values.game_speed = 1;
ArkRPG_CheatMenu.initial_values.game_speed_index = 1;

/////////////////////////////////////////////////
// Localization (follow app language in WKWebView)
/////////////////////////////////////////////////
ArkRPG_CheatMenu.resolveLocale = function() {
	var lang = (window.__ARK_APP_LANG__ || navigator.language || 'en').toLowerCase();
	if (lang.indexOf('zh-hans') === 0 || lang === 'zh-cn' || lang.indexOf('zh-cn') === 0) return 'zhHans';
	if (lang.indexOf('zh-hant') === 0 || lang === 'zh-tw' || lang.indexOf('zh-tw') === 0 || lang.indexOf('zh-hk') === 0) return 'zhHant';
	if (lang.indexOf('ja') === 0) return 'ja';
	if (lang.indexOf('ko') === 0) return 'ko';
	return 'en';
};

ArkRPG_CheatMenu.locale = ArkRPG_CheatMenu.resolveLocale();

ArkRPG_CheatMenu.i18n = {
	en: {
		'menu.title': 'CHEAT MENU',
		'menu.godmode': 'God Mode', 'menu.noclip': 'No Clip', 'menu.enemyhp': 'Enemy HP', 'menu.partyhp': 'Party HP',
		'menu.partymp': 'Party MP', 'menu.partytp': 'Party TP', 'menu.exp': 'Give Exp', 'menu.stats': 'Stats',
		'menu.gold': 'Gold', 'menu.items': 'Items', 'menu.weapons': 'Weapons', 'menu.armors': 'Armors',
		'menu.speed': 'Speed', 'menu.states': 'Clear States', 'menu.variables': 'Variables', 'menu.switches': 'Switches',
		'menu.positions': 'Save/Recall', 'menu.teleport': 'Teleport',
		'menu.noencounter': 'No Encounter', 'menu.battle': 'Force Battle', 'menu.gamespeed': 'Game Speed',
		'search.placeholder': 'Search...', 'label.amount': 'Amount', 'label.selectActor': 'Select Actor',
		'label.selectItem': 'Select {name}',
		'label.selectStat': 'Select Stat', 'label.selectVariable': 'Select Variable', 'label.selectSwitch': 'Select Switch',
		'label.selectMap': 'Select Map', 'label.currentAmount': 'Current Amount', 'label.currentValue': 'Current Value',
		'label.currentExp': 'Current EXP', 'label.currentGold': 'Current Gold', 'label.speedAmount': 'Speed Amount',
		'label.currentSpeed': 'Current Speed', 'label.speedLock': 'Speed Lock', 'label.status': 'Status',
		'label.aliveParty': 'Alive Party', 'label.allParty': 'All Party', 'label.aliveEnemies': 'Alive Enemies',
		'label.allEnemies': 'All Enemies', 'label.selectedActor': 'Selected Actor', 'label.selected': 'Selected: {name}',
		'label.currentPosition': 'Current Position:', 'label.positionN': 'Position {n}', 'label.variableN': 'Variable {n}',
		'label.switchN': 'Switch {n}', 'label.mapN': 'Map {n}', 'label.statN': 'Stat {n}',
		'label.owned': 'Owned: {n}', 'label.value': 'Value: {v}', 'label.statusValue': 'Status: {s}',
		'label.levelHp': 'Lv.{lv} | HP: {hp}/{mhp}',
		'button.set0': 'Set to 0', 'button.set1': 'Set to 1', 'button.full': 'Full {name}',
		'button.setHp0': 'Set HP to 0', 'button.setHp1': 'Set HP to 1', 'button.clearAllPartyStates': 'Clear All Party States',
		'button.clearActorStates': 'Clear Actor States (Count: {n})', 'button.save': 'Save', 'button.recall': 'Recall: {pos}',
		'button.teleport': 'Teleport', 'label.x': 'X', 'label.y': 'Y',
		'button.battleWin': 'Force Victory', 'button.battleLose': 'Force Defeat',
		'button.battleEscape': 'Force Escape', 'button.battleAbort': 'Force Abort',
		'label.currentGameSpeed': 'Game Speed',
		'label.gameSpeedHint': 'Accelerates the entire game loop. Messages auto-skip while > 1x.',
		'label.notInBattle': 'Not currently in battle. Buttons are only active during battle.',
		'label.gameNotReady': 'Game data is not ready yet. Start or load a game before using these cheats.',
		'status.on': 'ON', 'status.off': 'OFF', 'value.null': 'NULL'
	},
	zhHans: {
		'menu.title': '作弊菜单',
		'menu.godmode': '无敌模式', 'menu.noclip': '穿墙', 'menu.enemyhp': '敌人 HP', 'menu.partyhp': '队伍 HP',
		'menu.partymp': '队伍 MP', 'menu.partytp': '队伍 TP', 'menu.exp': '经验', 'menu.stats': '属性',
		'menu.gold': '金币', 'menu.items': '道具', 'menu.weapons': '武器', 'menu.armors': '护甲',
		'menu.speed': '速度', 'menu.states': '清除状态', 'menu.variables': '变量', 'menu.switches': '开关',
		'menu.positions': '存档点位', 'menu.teleport': '传送',
		'menu.noencounter': '禁用遇敌', 'menu.battle': '强制战斗', 'menu.gamespeed': '游戏加速',
		'search.placeholder': '搜索...', 'label.amount': '数量', 'label.selectActor': '选择角色', 'label.selectItem': '选择{name}',
		'label.selectStat': '选择属性', 'label.selectVariable': '选择变量', 'label.selectSwitch': '选择开关',
		'label.selectMap': '选择地图', 'label.currentAmount': '当前数量', 'label.currentValue': '当前值',
		'label.currentExp': '当前经验', 'label.currentGold': '当前金币', 'label.speedAmount': '速度增量',
		'label.currentSpeed': '当前速度', 'label.speedLock': '速度锁定', 'label.status': '状态',
		'label.aliveParty': '存活队员', 'label.allParty': '全队成员', 'label.aliveEnemies': '存活敌人',
		'label.allEnemies': '全部敌人', 'label.selectedActor': '已选角色', 'label.selected': '已选：{name}',
		'label.currentPosition': '当前位置：', 'label.positionN': '位置 {n}', 'label.variableN': '变量 {n}',
		'label.switchN': '开关 {n}', 'label.mapN': '地图 {n}', 'label.statN': '属性 {n}',
		'label.owned': '持有：{n}', 'label.value': '数值：{v}', 'label.statusValue': '状态：{s}',
		'label.levelHp': 'Lv.{lv} | HP: {hp}/{mhp}',
		'button.set0': '设为 0', 'button.set1': '设为 1', 'button.full': '{name} 全满',
		'button.setHp0': 'HP 设为 0', 'button.setHp1': 'HP 设为 1', 'button.clearAllPartyStates': '清除全队状态',
		'button.clearActorStates': '清除角色状态（数量：{n}）', 'button.save': '保存', 'button.recall': '读取：{pos}',
		'button.teleport': '传送', 'label.x': 'X', 'label.y': 'Y',
		'button.battleWin': '强制胜利', 'button.battleLose': '强制失败',
		'button.battleEscape': '强制逃跑', 'button.battleAbort': '强制中止',
		'label.currentGameSpeed': '游戏速度',
		'label.gameSpeedHint': '加速整个游戏循环。倍率 > 1 时自动跳过消息。',
		'label.notInBattle': '当前不在战斗中。按钮仅在战斗中可用。',
		'label.gameNotReady': '游戏数据尚未就绪。请先开始新游戏或读取存档，再使用这些作弊功能。',
		'status.on': '开', 'status.off': '关', 'value.null': '无'
	},
	zhHant: {
		'menu.title': '作弊選單',
		'menu.godmode': '無敵模式', 'menu.noclip': '穿牆', 'menu.enemyhp': '敵人 HP', 'menu.partyhp': '隊伍 HP',
		'menu.partymp': '隊伍 MP', 'menu.partytp': '隊伍 TP', 'menu.exp': '經驗', 'menu.stats': '屬性',
		'menu.gold': '金幣', 'menu.items': '道具', 'menu.weapons': '武器', 'menu.armors': '護甲',
		'menu.speed': '速度', 'menu.states': '清除狀態', 'menu.variables': '變數', 'menu.switches': '開關',
		'menu.positions': '存檔點位', 'menu.teleport': '傳送',
		'menu.noencounter': '禁用遇敵', 'menu.battle': '強制戰鬥', 'menu.gamespeed': '遊戲加速',
		'search.placeholder': '搜尋...', 'label.amount': '數量', 'label.selectActor': '選擇角色', 'label.selectItem': '選擇{name}',
		'label.selectStat': '選擇屬性', 'label.selectVariable': '選擇變數', 'label.selectSwitch': '選擇開關',
		'label.selectMap': '選擇地圖', 'label.currentAmount': '目前數量', 'label.currentValue': '目前值',
		'label.currentExp': '目前經驗', 'label.currentGold': '目前金幣', 'label.speedAmount': '速度增量',
		'label.currentSpeed': '目前速度', 'label.speedLock': '速度鎖定', 'label.status': '狀態',
		'label.aliveParty': '存活隊員', 'label.allParty': '全隊成員', 'label.aliveEnemies': '存活敵人',
		'label.allEnemies': '全部敵人', 'label.selectedActor': '已選角色', 'label.selected': '已選：{name}',
		'label.currentPosition': '目前位置：', 'label.positionN': '位置 {n}', 'label.variableN': '變數 {n}',
		'label.switchN': '開關 {n}', 'label.mapN': '地圖 {n}', 'label.statN': '屬性 {n}',
		'label.owned': '持有：{n}', 'label.value': '數值：{v}', 'label.statusValue': '狀態：{s}',
		'label.levelHp': 'Lv.{lv} | HP: {hp}/{mhp}',
		'button.set0': '設為 0', 'button.set1': '設為 1', 'button.full': '{name} 全滿',
		'button.setHp0': 'HP 設為 0', 'button.setHp1': 'HP 設為 1', 'button.clearAllPartyStates': '清除全隊狀態',
		'button.clearActorStates': '清除角色狀態（數量：{n}）', 'button.save': '儲存', 'button.recall': '讀取：{pos}',
		'button.teleport': '傳送', 'label.x': 'X', 'label.y': 'Y',
		'button.battleWin': '強制勝利', 'button.battleLose': '強制失敗',
		'button.battleEscape': '強制逃跑', 'button.battleAbort': '強制中止',
		'label.currentGameSpeed': '遊戲速度',
		'label.gameSpeedHint': '加速整個遊戲迴圈。倍率 > 1 時自動跳過訊息。',
		'label.notInBattle': '目前不在戰鬥中。按鈕僅在戰鬥中可用。',
		'label.gameNotReady': '遊戲資料尚未就緒。請先開始新遊戲或讀取存檔，再使用這些作弊功能。',
		'status.on': '開', 'status.off': '關', 'value.null': '無'
	},
	ja: {
		'menu.title': 'チートメニュー',
		'menu.godmode': 'ゴッドモード', 'menu.noclip': 'すり抜け', 'menu.enemyhp': '敵 HP', 'menu.partyhp': '味方 HP',
		'menu.partymp': '味方 MP', 'menu.partytp': '味方 TP', 'menu.exp': '経験値', 'menu.stats': '能力値',
		'menu.gold': '所持金', 'menu.items': 'アイテム', 'menu.weapons': '武器', 'menu.armors': '防具',
		'menu.speed': '速度', 'menu.states': '状態解除', 'menu.variables': '変数', 'menu.switches': 'スイッチ',
		'menu.positions': '位置保存/復帰', 'menu.teleport': 'テレポート',
		'menu.noencounter': 'エンカウント無効', 'menu.battle': '戦闘強制', 'menu.gamespeed': 'ゲーム速度',
		'search.placeholder': '検索...', 'label.amount': '量', 'label.selectActor': 'アクター選択', 'label.selectItem': '{name}を選択',
		'label.selectStat': '能力値を選択', 'label.selectVariable': '変数を選択', 'label.selectSwitch': 'スイッチを選択',
		'label.selectMap': 'マップ選択', 'label.currentAmount': '現在数', 'label.currentValue': '現在値',
		'label.currentExp': '現在経験値', 'label.currentGold': '現在所持金', 'label.speedAmount': '速度変更量',
		'label.currentSpeed': '現在速度', 'label.speedLock': '速度固定', 'label.status': '状態',
		'label.aliveParty': '生存メンバー', 'label.allParty': '全メンバー', 'label.aliveEnemies': '生存中の敵',
		'label.allEnemies': 'すべての敵', 'label.selectedActor': '選択中アクター', 'label.selected': '選択中: {name}',
		'label.currentPosition': '現在位置:', 'label.positionN': '位置 {n}', 'label.variableN': '変数 {n}',
		'label.switchN': 'スイッチ {n}', 'label.mapN': 'マップ {n}', 'label.statN': '能力値 {n}',
		'label.owned': '所持: {n}', 'label.value': '値: {v}', 'label.statusValue': '状態: {s}',
		'label.levelHp': 'Lv.{lv} | HP: {hp}/{mhp}',
		'button.set0': '0 にする', 'button.set1': '1 にする', 'button.full': '{name} 全回復',
		'button.setHp0': 'HP を 0 にする', 'button.setHp1': 'HP を 1 にする', 'button.clearAllPartyStates': '味方全体の状態を解除',
		'button.clearActorStates': 'アクター状態解除（{n}）', 'button.save': '保存', 'button.recall': '復帰: {pos}',
		'button.teleport': 'テレポート', 'label.x': 'X', 'label.y': 'Y',
		'button.battleWin': '強制勝利', 'button.battleLose': '強制敗北',
		'button.battleEscape': '強制逃走', 'button.battleAbort': '強制中断',
		'label.currentGameSpeed': 'ゲーム速度',
		'label.gameSpeedHint': 'ゲーム全体のループを加速します。倍率 > 1 のときメッセージを自動スキップ。',
		'label.notInBattle': '現在戦闘中ではありません。ボタンは戦闘中のみ有効です。',
		'label.gameNotReady': 'ゲームデータはまだ準備できていません。ニューゲームまたはロード後に使用してください。',
		'status.on': 'ON', 'status.off': 'OFF', 'value.null': 'なし'
	},
	ko: {
		'menu.title': '치트 메뉴',
		'menu.godmode': '무적 모드', 'menu.noclip': '벽 통과', 'menu.enemyhp': '적 HP', 'menu.partyhp': '파티 HP',
		'menu.partymp': '파티 MP', 'menu.partytp': '파티 TP', 'menu.exp': '경험치', 'menu.stats': '능력치',
		'menu.gold': '골드', 'menu.items': '아이템', 'menu.weapons': '무기', 'menu.armors': '방어구',
		'menu.speed': '속도', 'menu.states': '상태 해제', 'menu.variables': '변수', 'menu.switches': '스위치',
		'menu.positions': '저장/복귀', 'menu.teleport': '텔레포트',
		'menu.noencounter': '랜덤 인카운터 해제', 'menu.battle': '전투 강제', 'menu.gamespeed': '게임 속도',
		'search.placeholder': '검색...', 'label.amount': '수량', 'label.selectActor': '액터 선택', 'label.selectItem': '{name} 선택',
		'label.selectStat': '능력치 선택', 'label.selectVariable': '변수 선택', 'label.selectSwitch': '스위치 선택',
		'label.selectMap': '맵 선택', 'label.currentAmount': '현재 수량', 'label.currentValue': '현재 값',
		'label.currentExp': '현재 경험치', 'label.currentGold': '현재 골드', 'label.speedAmount': '속도 증감',
		'label.currentSpeed': '현재 속도', 'label.speedLock': '속도 고정', 'label.status': '상태',
		'label.aliveParty': '생존 파티', 'label.allParty': '전체 파티', 'label.aliveEnemies': '생존 적',
		'label.allEnemies': '전체 적', 'label.selectedActor': '선택된 액터', 'label.selected': '선택됨: {name}',
		'label.currentPosition': '현재 위치:', 'label.positionN': '위치 {n}', 'label.variableN': '변수 {n}',
		'label.switchN': '스위치 {n}', 'label.mapN': '맵 {n}', 'label.statN': '능력치 {n}',
		'label.owned': '보유: {n}', 'label.value': '값: {v}', 'label.statusValue': '상태: {s}',
		'label.levelHp': 'Lv.{lv} | HP: {hp}/{mhp}',
		'button.set0': '0으로 설정', 'button.set1': '1로 설정', 'button.full': '{name} 전체 회복',
		'button.setHp0': 'HP를 0으로', 'button.setHp1': 'HP를 1로', 'button.clearAllPartyStates': '파티 전체 상태 해제',
		'button.clearActorStates': '액터 상태 해제 (개수: {n})', 'button.save': '저장', 'button.recall': '복귀: {pos}',
		'button.teleport': '텔레포트', 'label.x': 'X', 'label.y': 'Y',
		'button.battleWin': '강제 승리', 'button.battleLose': '강제 패배',
		'button.battleEscape': '강제 도주', 'button.battleAbort': '강제 중단',
		'label.currentGameSpeed': '게임 속도',
		'label.gameSpeedHint': '게임 전체 루프를 가속합니다. 배율 > 1일 때 메시지를 자동으로 건너뜁니다.',
		'label.notInBattle': '현재 전투 중이 아닙니다. 버튼은 전투 중에만 활성화됩니다.',
		'label.gameNotReady': '게임 데이터가 아직 준비되지 않았습니다. 새 게임을 시작하거나 저장 파일을 불러온 뒤 사용하세요.',
		'status.on': '켜짐', 'status.off': '꺼짐', 'value.null': '없음'
	}
};

ArkRPG_CheatMenu.t = function(key, params) {
	var dict = ArkRPG_CheatMenu.i18n[ArkRPG_CheatMenu.locale] || ArkRPG_CheatMenu.i18n.en;
	var text = dict[key] || ArkRPG_CheatMenu.i18n.en[key] || key;
	if (!params) return text;
	return text.replace(/\{(\w+)\}/g, function(_, k) {
		return params[k] !== undefined ? String(params[k]) : '';
	});
};

ArkRPG_CheatMenu.syncLocale = function(lang) {
	if (lang) {
		window.__ARK_APP_LANG__ = lang;
	}
	ArkRPG_CheatMenu.locale = ArkRPG_CheatMenu.resolveLocale();
	if (ArkRPG_CheatMenu.cheat_menu_open) {
		ArkRPG_CheatMenu.update_menu();
	}
};

ArkRPG_CheatMenu.menuKeyByType = function(type) {
	if (type === 'item') return 'menu.items';
	if (type === 'weapon') return 'menu.weapons';
	return 'menu.armors';
};

ArkRPG_CheatMenu.notifyNativeMenuState = function(isOpen) {
	try {
		if (window.webkit && window.webkit.messageHandlers && window.webkit.messageHandlers.nativeBridge) {
			window.webkit.messageHandlers.nativeBridge.postMessage({
				type: 'cheatMenuState',
				isOpen: !!isOpen
			});
		}
	} catch (e) {
		// Ignore bridge errors in non-iOS environments
	}
};

ArkRPG_CheatMenu.isGameRuntimeReady = function() {
	return typeof $gameActors !== 'undefined' && $gameActors && $gameActors._data &&
		typeof $gameParty !== 'undefined' && $gameParty &&
		typeof $gamePlayer !== 'undefined' && $gamePlayer &&
		typeof $gameSystem !== 'undefined' && $gameSystem &&
		typeof $gameVariables !== 'undefined' && $gameVariables &&
		typeof $gameSwitches !== 'undefined' && $gameSwitches &&
		typeof $dataSystem !== 'undefined' && $dataSystem;
};

ArkRPG_CheatMenu.createUnavailableSection = function(message) {
	var section = ArkRPG_CheatMenu.createSection();
	var info = document.createElement('div');
	info.className = 'arkrpg-cheat-info';
	info.textContent = message || ArkRPG_CheatMenu.t('label.gameNotReady');
	section.appendChild(info);
	return section;
};

// Some MZ plugins and previously serialized cheat state can leave an own
// property on a Game_Actor that shadows a valid prototype method with
// undefined. The failure only becomes visible when the map performs its
// periodic walk regeneration (Game_Battler.regenerateTp).
ArkRPG_CheatMenu._repair_tp_runtime_methods = function() {
	if (typeof Game_Battler === 'undefined' || !Game_Battler.prototype) return;

	if (typeof Game_Battler.prototype.gainSilentTp !== 'function') {
		console.warn('[ArkRPG_CheatMenu] restoring missing Game_Battler.gainSilentTp');
		Game_Battler.prototype.gainSilentTp = function(value) {
			this.setTp(this.tp + value);
		};
	}

	if (typeof $gameActors === 'undefined' || !$gameActors || !$gameActors._data) return;
	var methodNames = ['gainSilentTp', 'setTp'];
	for (var i = 0; i < $gameActors._data.length; i++) {
		var actor = $gameActors._data[i];
		if (!actor) continue;
		for (var j = 0; j < methodNames.length; j++) {
			var methodName = methodNames[j];
			if (Object.prototype.hasOwnProperty.call(actor, methodName) &&
				typeof actor[methodName] !== 'function') {
				console.warn('[ArkRPG_CheatMenu] removed invalid actor method shadow: ' + methodName);
				delete actor[methodName];
			}
		}
	}
};

ArkRPG_CheatMenu.prepareRuntimeState = function() {
	if (!ArkRPG_CheatMenu.isGameRuntimeReady()) return false;
	if ($gameActors && $gameActors._data) {
		for (var i = 0; i < $gameActors._data.length; i++) {
			if ($gameActors._data[i]) {
				if ($gameActors._data[i].__arkrpg_cheat_god_mode) {
					ArkRPG_CheatMenu.god_mode_off($gameActors._data[i]);
				} else if ($gameActors._data[i].__arkrpg_cheat_god_mode_interval) {
					clearInterval($gameActors._data[i].__arkrpg_cheat_god_mode_interval);
				}
			}
		}
	}
	ArkRPG_CheatMenu._repair_tp_runtime_methods();
	for (var name in ArkRPG_CheatMenu.initial_values) {
		ArkRPG_CheatMenu[name] = ArkRPG_CheatMenu.initial_values[name];
	}
	if ($gameSystem && $gameSystem.ArkRPG_CheatMenu) {
		for (var savedName in $gameSystem.ArkRPG_CheatMenu) {
			ArkRPG_CheatMenu[savedName] = $gameSystem.ArkRPG_CheatMenu[savedName];
		}
	}
	if (ArkRPG_CheatMenu.speed_unlocked == false) ArkRPG_CheatMenu.initialize_speed_lock();
	ArkRPG_CheatMenu.initialized = true;
	return true;
};

/////////////////////////////////////////////////
// Cheat Functions
/////////////////////////////////////////////////

ArkRPG_CheatMenu.god_mode = function(actor) {
	if (actor instanceof Game_Actor && !(actor.__arkrpg_cheat_god_mode)) {
		actor.__arkrpg_cheat_god_mode = true;
		actor.__arkrpg_cheat_gain_hp_original = actor.gainHp;
		actor.gainHp = function(value) { value = this.mhp; this.__arkrpg_cheat_gain_hp_original(value); };
		actor.__arkrpg_cheat_set_hp_original = actor.setHp;
		actor.setHp = function(hp) { hp = this.mhp; this.__arkrpg_cheat_set_hp_original(hp); };
		actor.__arkrpg_cheat_gain_mp_original = actor.gainMp;
		actor.gainMp = function (value) { value = this.mmp; this.__arkrpg_cheat_gain_mp_original(value); };
		actor.__arkrpg_cheat_set_mp_original = actor.setMp;
		actor.setMp = function(mp) { mp = this.mmp; this.__arkrpg_cheat_set_mp_original(mp); };
		actor.__arkrpg_cheat_gain_tp_original = actor.gainTp;
		actor.gainTp = function (value) { value = this.maxTp(); this.__arkrpg_cheat_gain_tp_original(value); };
		actor.__arkrpg_cheat_set_tp_original = actor.setTp;
		actor.setTp = function(tp) { tp = this.maxTp(); this.__arkrpg_cheat_set_tp_original(tp); };
		actor.__arkrpg_cheat_pay_skill_cost_original = actor.paySkillCost;
		actor.paySkillCost = function (skill) {};
		actor.__arkrpg_cheat_god_mode_interval = setInterval(function() {
			actor.gainHp(actor.mhp);
			actor.gainMp(actor.mmp);
			actor.gainTp(actor.maxTp());
		}, 100);
	}
};

ArkRPG_CheatMenu.god_mode_off = function(actor) {
	if (actor instanceof Game_Actor && actor.__arkrpg_cheat_god_mode) {
		actor.__arkrpg_cheat_god_mode = false;
		var restoreMethod = function(methodName, backupName) {
			if (typeof actor[backupName] === 'function') {
				actor[methodName] = actor[backupName];
			} else {
				// Function-valued backups are not serialized by JsonEx. Deleting
				// the own property safely exposes the engine/plugin prototype.
				delete actor[methodName];
			}
			delete actor[backupName];
		};
		restoreMethod('gainHp', '__arkrpg_cheat_gain_hp_original');
		restoreMethod('setHp', '__arkrpg_cheat_set_hp_original');
		restoreMethod('gainMp', '__arkrpg_cheat_gain_mp_original');
		restoreMethod('setMp', '__arkrpg_cheat_set_mp_original');
		restoreMethod('gainTp', '__arkrpg_cheat_gain_tp_original');
		restoreMethod('setTp', '__arkrpg_cheat_set_tp_original');
		restoreMethod('paySkillCost', '__arkrpg_cheat_pay_skill_cost_original');
		clearInterval(actor.__arkrpg_cheat_god_mode_interval);
		delete actor.__arkrpg_cheat_god_mode_interval;
	}
};

ArkRPG_CheatMenu.set_party_hp = function(hp, alive) {
	var members = $gameParty.allMembers();
	for (var i = 0; i < members.length; i++) {
		if ((alive && members[i]._hp != 0) || !alive) members[i].setHp(hp);
	}
};

ArkRPG_CheatMenu.set_party_mp = function(mp, alive) {
	var members = $gameParty.allMembers();
	for (var i = 0; i < members.length; i++) {
		if ((alive && members[i]._hp != 0) || !alive) members[i].setMp(mp);
	}
};

ArkRPG_CheatMenu.set_party_tp = function(tp, alive) {
	var members = $gameParty.allMembers();
	for (var i = 0; i < members.length; i++) {
		if ((alive && members[i]._hp != 0) || !alive) members[i].setTp(tp);
	}
};

ArkRPG_CheatMenu.recover_party_hp = function(alive) {
	var members = $gameParty.allMembers();
	for (var i = 0; i < members.length; i++) {
		if ((alive && members[i]._hp != 0) || !alive) members[i].setHp(members[i].mhp);
	}
};

ArkRPG_CheatMenu.recover_party_mp = function(alive) {
	var members = $gameParty.allMembers();
	for (var i = 0; i < members.length; i++) {
		if ((alive && members[i]._hp != 0) || !alive) members[i].setMp(members[i].mmp);
	}
};

ArkRPG_CheatMenu.recover_party_tp = function(alive) {
	var members = $gameParty.allMembers();
	for (var i = 0; i < members.length; i++) {
		if ((alive && members[i]._hp != 0) || !alive) members[i].setTp(members[i].maxTp());
	}
};

ArkRPG_CheatMenu.set_enemy_hp = function(hp, alive) {
	var members = $gameTroop.members();
	for (var i = 0; i < members.length; i++) {
		if (members[i] && ((alive && members[i]._hp != 0) || !alive)) {
				members[i].setHp(hp);
		}
	}
};

ArkRPG_CheatMenu.give_exp = function(actor, amount) {
	if (actor instanceof Game_Actor) actor.gainExp(amount);
};

ArkRPG_CheatMenu.give_stat = function(actor, stat_index, amount) {
	if (actor instanceof Game_Actor && actor._paramPlus[stat_index] != undefined) {
			actor.addParam(stat_index, amount);
	}
};

ArkRPG_CheatMenu.give_gold = function(amount) { $gameParty.gainGold(amount); };
ArkRPG_CheatMenu.give_item = function(item_id, amount) {
	if ($dataItems[item_id] != undefined) $gameParty.gainItem($dataItems[item_id], amount);
};
ArkRPG_CheatMenu.give_weapon = function(weapon_id, amount) {
	if ($dataWeapons[weapon_id] != undefined) $gameParty.gainItem($dataWeapons[weapon_id], amount);
};
ArkRPG_CheatMenu.give_armor = function(armor_id, amount) {
	if ($dataArmors[armor_id] != undefined) $gameParty.gainItem($dataArmors[armor_id], amount);
};

ArkRPG_CheatMenu.initialize_speed_lock = function() {
	if (!ArkRPG_CheatMenu.speed_initialized) {
		ArkRPG_CheatMenu.speed = $gamePlayer._moveSpeed;
		Object.defineProperty($gamePlayer, "_moveSpeed", {
			get: function() {return ArkRPG_CheatMenu.speed;},
			set: function(newVal) {if(ArkRPG_CheatMenu.speed_unlocked) {ArkRPG_CheatMenu.speed = newVal;}}
		});
		ArkRPG_CheatMenu.speed_initialized = true;
	}
};

ArkRPG_CheatMenu.change_player_speed = function(amount) {
	ArkRPG_CheatMenu.initialize_speed_lock();
	ArkRPG_CheatMenu.speed += amount;
};

ArkRPG_CheatMenu.toggle_lock_player_speed = function() {
	ArkRPG_CheatMenu.initialize_speed_lock();
	ArkRPG_CheatMenu.speed_unlocked = !ArkRPG_CheatMenu.speed_unlocked;
};

ArkRPG_CheatMenu.clear_actor_states = function(actor) {
	if (actor instanceof Game_Actor && actor._states != undefined && actor._states.length > 0) {
			actor.clearStates();
	}
};

ArkRPG_CheatMenu.clear_party_states = function() {
	var members = $gameParty.allMembers();
	for (var i = 0; i < members.length; i++) {
		ArkRPG_CheatMenu.clear_actor_states(members[i]);
	}
};

ArkRPG_CheatMenu.set_variable = function(variable_id, value) {
	if ($dataSystem.variables[variable_id] != undefined) {
		$gameVariables.setValue(variable_id, $gameVariables.value(variable_id) + value);
	}
};

ArkRPG_CheatMenu.toggle_switch = function(switch_id) {
	if ($dataSystem.switches[switch_id] != undefined) {
		$gameSwitches.setValue(switch_id, !$gameSwitches.value(switch_id));
	}
};

ArkRPG_CheatMenu.teleport = function(map_id, x_pos, y_pos) {
	$gamePlayer.reserveTransfer(map_id, x_pos, y_pos, $gamePlayer.direction(), 0);
	$gamePlayer.setPosition(x_pos, y_pos);
};

/////////////////////////////////////////////////
// P0-A1: Disable random encounter
// Hooks $gamePlayer.canEncounter to return false so updateEncounterCount()
// short-circuits and no random battle triggers. Backup is per-instance because
// $gamePlayer is reconstructed on load/new game — _apply_encounter_hook()
// re-applies on initialize().
/////////////////////////////////////////////////

ArkRPG_CheatMenu._apply_encounter_hook = function() {
	if (ArkRPG_CheatMenu.disable_encounter && typeof $gamePlayer !== 'undefined' && $gamePlayer) {
		if (!$gamePlayer.__arkrpg_cheat_no_encounter) {
			ArkRPG_CheatMenu._encounter_bkup = $gamePlayer.canEncounter;
			$gamePlayer.canEncounter = function() { return false; };
			$gamePlayer.__arkrpg_cheat_no_encounter = true;
		}
	} else if (!ArkRPG_CheatMenu.disable_encounter && typeof $gamePlayer !== 'undefined' && $gamePlayer && $gamePlayer.__arkrpg_cheat_no_encounter) {
		$gamePlayer.canEncounter = ArkRPG_CheatMenu._encounter_bkup;
		$gamePlayer.__arkrpg_cheat_no_encounter = false;
		ArkRPG_CheatMenu._encounter_bkup = null;
	}
};

ArkRPG_CheatMenu.toggle_disable_encounter = function() {
	ArkRPG_CheatMenu.disable_encounter = !ArkRPG_CheatMenu.disable_encounter;
	ArkRPG_CheatMenu._apply_encounter_hook();
};

/////////////////////////////////////////////////
// P0-A3: Force battle outcome
// Guards: must be Scene_Battle and phase != 'battleEnd'.
// Uses BattleManager.processVictory / processDefeat / processEscape / processAbort.
/////////////////////////////////////////////////

ArkRPG_CheatMenu.can_force_battle_end = function() {
	return typeof SceneManager !== 'undefined'
		&& SceneManager._scene
		&& SceneManager._scene.constructor === Scene_Battle
		&& typeof BattleManager !== 'undefined'
		&& BattleManager._phase !== 'battleEnd';
};

ArkRPG_CheatMenu.force_battle = function(result) {
	if (!ArkRPG_CheatMenu.can_force_battle_end()) return false;
	if (result === 'win') {
		$gameTroop.members().forEach(function(e) {
			if (e && !e.isDead()) e.addNewState(e.deathStateId());
		});
		BattleManager.processVictory();
	} else if (result === 'lose') {
		$gameParty.members().forEach(function(a) {
			if (a && !a.isDead()) a.addNewState(a.deathStateId());
		});
		BattleManager.processDefeat();
	} else if (result === 'escape') {
		$gameParty.performEscape();
		SoundManager.playEscape();
		BattleManager._escaped = true;
		BattleManager.processEscape();
	} else if (result === 'abort') {
		$gameParty.performEscape();
		SoundManager.playEscape();
		BattleManager._escaped = true;
		BattleManager.processAbort();
	} else {
		return false;
	}
	return true;
};

/////////////////////////////////////////////////
// P1-A2: Game speed acceleration
// Hooks SceneManager.updateScene with accumulator pattern:
//   acc += rate; step = floor(acc); acc -= step;
//   if step > 0: run original once, then (step-1) extra ticks.
// Extra ticks include updateInputData + changeScene to keep input/scene
// state consistent (mimicking paramonos implementation).
//
// Message skip: when rate > 1, Window_Message._pauseSkip/_showFast are forced,
// Window_Message.updateInput auto-advances on pause, Window_ScrollText.scrollSpeed
// multiplied x100, Window_BattleLog.messageSpeed reduced to 1. This makes
// accelerated playthroughs usable on iOS where there is no keyboard to skip.
/////////////////////////////////////////////////

ArkRPG_CheatMenu._install_message_skip = function() {
	if (ArkRPG_CheatMenu._msg_skip_installed) return;
	ArkRPG_CheatMenu._msg_skip_installed = true;

	if (typeof Window_Message !== 'undefined') {
		ArkRPG_CheatMenu._orig_updateShowFast = Window_Message.prototype.updateShowFast;
		Window_Message.prototype.updateShowFast = function() {
			ArkRPG_CheatMenu._orig_updateShowFast.call(this);
			if (ArkRPG_CheatMenu.game_speed > 1) {
				this._showFast = true;
				this._pauseSkip = true;
			}
		};

		ArkRPG_CheatMenu._orig_updateInput = Window_Message.prototype.updateInput;
		Window_Message.prototype.updateInput = function() {
			var ret = ArkRPG_CheatMenu._orig_updateInput.call(this);
			if (this.pause && ArkRPG_CheatMenu.game_speed > 1) {
				this.pause = false;
				if (!this._textState) this.terminateMessage();
				return true;
			}
			return ret;
		};
	}

	if (typeof Window_ScrollText !== 'undefined') {
		ArkRPG_CheatMenu._orig_scrollSpeed = Window_ScrollText.prototype.scrollSpeed;
		Window_ScrollText.prototype.scrollSpeed = function() {
			var ret = ArkRPG_CheatMenu._orig_scrollSpeed.call(this);
			return ArkRPG_CheatMenu.game_speed > 1 ? ret * 100 : ret;
		};
	}

	if (typeof Window_BattleLog !== 'undefined') {
		ArkRPG_CheatMenu._orig_msgSpeed = Window_BattleLog.prototype.messageSpeed;
		Window_BattleLog.prototype.messageSpeed = function() {
			var ret = ArkRPG_CheatMenu._orig_msgSpeed.call(this);
			return ArkRPG_CheatMenu.game_speed > 1 ? 1 : ret;
		};
	}
};

ArkRPG_CheatMenu._unwrap_game_speed_update_scene = function() {
	if (typeof SceneManager === 'undefined' || typeof SceneManager.updateScene !== 'function') return;
	var fn = SceneManager.updateScene;
	var guard = 0;
	while (fn && fn[ArkRPG_CheatMenu._game_speed_wrapper_tag] && guard < 8) {
		fn = fn[ArkRPG_CheatMenu._game_speed_original_tag];
		guard++;
	}
	if (fn && typeof fn === 'function') {
		SceneManager.updateScene = fn;
	}
	ArkRPG_CheatMenu._game_speed_applied = false;
	ArkRPG_CheatMenu._orig_updateScene = null;
	ArkRPG_CheatMenu._game_speed_accum = 0;
};

ArkRPG_CheatMenu._apply_game_speed = function(rate) {
	ArkRPG_CheatMenu._install_message_skip();
	ArkRPG_CheatMenu._repair_tp_runtime_methods();

	if (typeof SceneManager === 'undefined' || typeof SceneManager.updateScene !== 'function') return;

	// Always remove our own previous wrapper first. Save/load can re-enter this
	// while already accelerated; relying only on _game_speed_applied can leave
	// nested wrappers and makes returning to 1x restore to the wrong layer.
	ArkRPG_CheatMenu._unwrap_game_speed_update_scene();

	// rate ≈ 1: no hook needed
	if (Math.abs(rate - 1.0) < 1e-9) return;

	ArkRPG_CheatMenu._orig_updateScene = SceneManager.updateScene;
	ArkRPG_CheatMenu._game_speed_accum = 0;
	var original = SceneManager.updateScene;
	SceneManager.updateScene = function() {
		var currentRate = Number(ArkRPG_CheatMenu.game_speed) || 1;
		if (Math.abs(currentRate - 1.0) < 1e-9) {
			original.call(this);
			return;
		}
		ArkRPG_CheatMenu._game_speed_accum += currentRate;
		var step = Math.floor(ArkRPG_CheatMenu._game_speed_accum);
		ArkRPG_CheatMenu._game_speed_accum -= step;
		if (step > 0) {
			original.call(this);
			for (var i = 0; i < step - 1; i++) {
				SceneManager.updateInputData();
				SceneManager.changeScene();
				original.call(this);
			}
		}
	};
	SceneManager.updateScene[ArkRPG_CheatMenu._game_speed_wrapper_tag] = true;
	SceneManager.updateScene[ArkRPG_CheatMenu._game_speed_original_tag] = original;
	ArkRPG_CheatMenu._game_speed_applied = true;
};

ArkRPG_CheatMenu.set_game_speed = function(rate) {
	ArkRPG_CheatMenu.game_speed = rate;
	var idx = ArkRPG_CheatMenu.game_speed_rates.indexOf(rate);
	if (idx >= 0) ArkRPG_CheatMenu.game_speed_index = idx;
	ArkRPG_CheatMenu._apply_game_speed(rate);
};

/////////////////////////////////////////////////
// Modern UI System
/////////////////////////////////////////////////

// CSS inlined above

ArkRPG_CheatMenu.createMenuContainer = function() {
	var container = document.createElement('div');
	container.id = "arkrpg_cheat_menu_container";
	container.className = "arkrpg-cheat-menu-container";

	// Make draggable
	var isDragging = false;
	var currentX, currentY, initialX, initialY;
	var dragStartElement = null;

	var startDrag = function(e) {
		// Only allow dragging from header, and not from interactive elements
		if (e.target.closest('.arkrpg-cheat-menu-close') ||
			e.target.closest('.arkrpg-cheat-input-controls') ||
			e.target.closest('.arkrpg-cheat-btn') ||
			e.target.closest('.arkrpg-cheat-card-grid') ||
			e.target.closest('.arkrpg-cheat-card') ||
			e.target.closest('.arkrpg-cheat-menu-content') ||
			e.target.closest('.arkrpg-cheat-menu-sidebar') ||
			e.target.closest('input') ||
			e.target.closest('button')) {
			return;
		}

		if (e.target.closest('.arkrpg-cheat-menu-header')) {
			dragStartElement = e.target.closest('.arkrpg-cheat-menu-header');
			initialX = e.clientX - (container.offsetLeft || 0);
			initialY = e.clientY - (container.offsetTop || 0);
			isDragging = true;
			container.style.cursor = 'grabbing';
			dragStartElement.style.cursor = 'grabbing';
		}
	};

	var drag = function(e) {
		if (isDragging) {
			// Don't prevent default if we're over scrollable areas
			if (!e.target.closest('.arkrpg-cheat-card-grid') &&
				!e.target.closest('.arkrpg-cheat-menu-content') &&
				!e.target.closest('.arkrpg-cheat-menu-sidebar')) {
				e.preventDefault();
			}
			currentX = e.clientX - initialX;
			currentY = e.clientY - initialY;
			container.style.left = currentX + 'px';
			container.style.top = currentY + 'px';
			container.style.transform = 'none';
		}
	};

	var stopDrag = function() {
		if (isDragging) {
			isDragging = false;
			container.style.cursor = '';
			if (dragStartElement) {
				dragStartElement.style.cursor = 'grab';
			}
			dragStartElement = null;
		}
	};

	container.addEventListener('mousedown', startDrag);
	document.addEventListener('mousemove', drag);
	document.addEventListener('mouseup', stopDrag);

        // iOS touch drag support for header
        var touchDragStart = function(e) {
                var t = e.touches[0];
                startDrag({ target: e.target, clientX: t.clientX, clientY: t.clientY });
        };
        var touchDrag = function(e) {
                var t = e.touches[0];
                drag({ target: e.target, clientX: t.clientX, clientY: t.clientY, preventDefault: function(){} });
        };
        container.addEventListener('touchstart', touchDragStart, false);
        document.addEventListener('touchmove', touchDrag, { passive: true });
        document.addEventListener('touchend', stopDrag, false);

        // Header
        var header = document.createElement('div');
        header.className = "arkrpg-cheat-menu-header";
	header.style.cursor = 'grab';
	var title = document.createElement('div');
	title.className = "arkrpg-cheat-menu-title";
		title.textContent = ArkRPG_CheatMenu.t('menu.title');
	var closeBtn = document.createElement('button');
	closeBtn.className = "arkrpg-cheat-menu-close";
	closeBtn.innerHTML = "×";
	closeBtn.addEventListener('click', function() {
		ArkRPG_CheatMenu.cheat_menu_open = false;
		if (ArkRPG_CheatMenu.menuContainer) {
			ArkRPG_CheatMenu.menuContainer.remove();
			ArkRPG_CheatMenu.menuContainer = null;
		}
		ArkRPG_CheatMenu.notifyNativeMenuState(false);
		SoundManager.playSystemSound(2);
	});
	header.appendChild(title);
	header.appendChild(closeBtn);
	container.appendChild(header);

	// Main content wrapper
	var wrapper = document.createElement('div');
	wrapper.className = "arkrpg-cheat-menu-wrapper";

	// Sidebar
	var sidebar = document.createElement('div');
	sidebar.className = "arkrpg-cheat-menu-sidebar";
	wrapper.appendChild(sidebar);

	// Content area
	var contentArea = document.createElement('div');
	contentArea.className = "arkrpg-cheat-menu-content";
	wrapper.appendChild(contentArea);

	container.appendChild(wrapper);

        // iOS WKWebView fix: RPG Maker's TouchInput calls preventDefault() on
        // document-level touchstart, which suppresses synthetic click events.
        // We intercept touch at the container boundary:
        //   touchstart → stopPropagation() so RPG Maker never sees it
        //   touchend   → manually dispatch a click on the real target
        var touchStartX = 0, touchStartY = 0;
        container.addEventListener('touchstart', function(e) {
                e.stopPropagation();
                if (e.touches.length > 0) {
                        touchStartX = e.touches[0].clientX;
                        touchStartY = e.touches[0].clientY;
                }
        }, true);
        container.addEventListener('touchmove', function(e) {
                e.stopPropagation();
        }, true);
        container.addEventListener('touchend', function(e) {
                e.stopPropagation();
                // Let native touch flow focus text inputs and show the keyboard on iOS
                if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')) {
                        return;
                }
                e.preventDefault();
                var touch = e.changedTouches[0];
                // Only fire click if not a scroll gesture (moved < 10px)
                var dx = Math.abs(touch.clientX - touchStartX);
                var dy = Math.abs(touch.clientY - touchStartY);
                if (dx < 10 && dy < 10) {
                        var target = document.elementFromPoint(touch.clientX, touch.clientY);
                        if (target) {
                                target.dispatchEvent(new MouseEvent('click', {
                                        bubbles: true, cancelable: true,
                                        clientX: touch.clientX, clientY: touch.clientY
                                }));
                        }
                }
        }, true);

        // RPG Maker's document keydown preventDefaults Backspace/Tab/Space in inputs — block it
        container.addEventListener('keydown', function(e) {
                if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')) {
                        e.stopPropagation();
                }
        });
        container.addEventListener('keyup', function(e) {
                if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')) {
                        e.stopPropagation();
                }
        });

        return container;
};

if (typeof ArkRPG_CheatMenu.menuDefinitions == "undefined") {
	ArkRPG_CheatMenu.menuDefinitions = [
		{ key: "menu.godmode", id: "godmode", icon: "⚡" },
		{ key: "menu.noclip", id: "noclip", icon: "👻" },
		{ key: "menu.enemyhp", id: "enemyhp", icon: "💀" },
		{ key: "menu.partyhp", id: "partyhp", icon: "❤️" },
		{ key: "menu.partymp", id: "partymp", icon: "💙" },
		{ key: "menu.partytp", id: "partytp", icon: "💜" },
		{ key: "menu.exp", id: "exp", icon: "⭐" },
		{ key: "menu.stats", id: "stats", icon: "📊" },
		{ key: "menu.gold", id: "gold", icon: "💰" },
		{ key: "menu.items", id: "items", icon: "🎒" },
		{ key: "menu.weapons", id: "weapons", icon: "⚔️" },
		{ key: "menu.armors", id: "armors", icon: "🛡️" },
		{ key: "menu.speed", id: "speed", icon: "🏃" },
		{ key: "menu.states", id: "states", icon: "🧹" },
		{ key: "menu.variables", id: "variables", icon: "🔢" },
		{ key: "menu.switches", id: "switches", icon: "🔘" },
		{ key: "menu.positions", id: "positions", icon: "📍" },
		{ key: "menu.teleport", id: "teleport", icon: "🚀" },
		{ key: "menu.noencounter", id: "noencounter", icon: "🚫" },
		{ key: "menu.battle", id: "battle", icon: "⚔️" },
		{ key: "menu.gamespeed", id: "gamespeed", icon: "⏩" }
	];
}

ArkRPG_CheatMenu.createSidebar = function(container) {
	var sidebar = container.querySelector('.arkrpg-cheat-menu-sidebar');
	sidebar.innerHTML = '';

	for (var i = 0; i < ArkRPG_CheatMenu.menuDefinitions.length; i++) {
		var item = document.createElement('div');
		item.className = "arkrpg-cheat-menu-sidebar-item" + (i === ArkRPG_CheatMenu.cheat_selected ? " active" : "");
		item.dataset.tabIndex = i;

		var icon = document.createElement('span');
		icon.className = "arkrpg-cheat-menu-icon";
		icon.textContent = ArkRPG_CheatMenu.menuDefinitions[i].icon;

		var text = document.createElement('span');
		text.className = "arkrpg-cheat-menu-text";
		text.textContent = ArkRPG_CheatMenu.t(ArkRPG_CheatMenu.menuDefinitions[i].key);

		item.appendChild(icon);
		item.appendChild(text);

		item.addEventListener('click', function() {
			ArkRPG_CheatMenu.cheat_selected = parseInt(this.dataset.tabIndex);
	ArkRPG_CheatMenu.update_menu();
	SoundManager.playSystemSound(0);
		});

		sidebar.appendChild(item);
	}
};

ArkRPG_CheatMenu.createButton = function(text, onClick, className) {
	var button = document.createElement('button');
	button.className = className || "arkrpg-cheat-btn";
	button.textContent = text;
	button.addEventListener('click', onClick);
	return button;
};

ArkRPG_CheatMenu.createInputGroup = function(label, value, onDecrease, onIncrease) {
	var group = document.createElement('div');
	group.className = "arkrpg-cheat-input-group";

	var labelEl = document.createElement('label');
	labelEl.className = "arkrpg-cheat-input-label";
	labelEl.textContent = label;
	group.appendChild(labelEl);

	var controls = document.createElement('div');
	controls.className = "arkrpg-cheat-input-controls";

	var decBtn = ArkRPG_CheatMenu.createButton("−", onDecrease, "arkrpg-cheat-btn-control");
	var valueEl = document.createElement('span');
	valueEl.className = "arkrpg-cheat-value";
	valueEl.textContent = value;
	var incBtn = ArkRPG_CheatMenu.createButton("+", onIncrease, "arkrpg-cheat-btn-control");

	controls.appendChild(decBtn);
	controls.appendChild(valueEl);
	controls.appendChild(incBtn);

	group.appendChild(controls);
	return group;
};

ArkRPG_CheatMenu.createSection = function(title) {
	var section = document.createElement('div');
	section.className = "arkrpg-cheat-section";
	if (title) {
		var titleEl = document.createElement('h3');
		titleEl.className = "arkrpg-cheat-section-title";
		titleEl.textContent = title;
		section.appendChild(titleEl);
	}
	return section;
};

// Create card grid instead of selector
ArkRPG_CheatMenu.createCardGrid = function(label, items, currentIndex, onSelect, getDisplayName, getExtraInfo) {
	var section = document.createElement('div');
	section.className = "arkrpg-cheat-card-section";

	var labelEl = document.createElement('div');
	labelEl.className = "arkrpg-cheat-card-label";
	labelEl.textContent = label;
	section.appendChild(labelEl);

	var gridId = "grid_" + label;

	var searchInput = document.createElement('input');
	searchInput.type = "text";
	searchInput.className = "arkrpg-cheat-card-search";
	searchInput.placeholder = ArkRPG_CheatMenu.t('search.placeholder');
	searchInput.setAttribute('autocomplete', 'off');
	searchInput.setAttribute('autocorrect', 'off');
	searchInput.setAttribute('autocapitalize', 'off');
	searchInput.setAttribute('spellcheck', 'false');
	// Persist across menu rebuilds so typing isn't wiped by update_menu()
	var searchTerm = ArkRPG_CheatMenu.searchTerms[gridId] || "";
	searchInput.value = searchTerm;
	var savedScrollPosition = 0;

	// Store scroll position before update
	var saveScroll = function() {
		if (grid && grid.scrollTop !== undefined) {
			savedScrollPosition = grid.scrollTop;
		}
	};

	// Restore scroll position after update
	var restoreScroll = function() {
		if (grid && savedScrollPosition !== undefined) {
			// Use requestAnimationFrame to ensure DOM is updated
			requestAnimationFrame(function() {
				if (grid) {
					grid.scrollTop = savedScrollPosition;
				}
			});
		}
	};

	searchInput.addEventListener('input', function() {
		searchTerm = this.value.toLowerCase();
		ArkRPG_CheatMenu.searchTerms[gridId] = searchTerm;
		saveScroll();
		updateGrid();
		restoreScroll();
	});
	section.appendChild(searchInput);

	var grid = document.createElement('div');
	grid.className = "arkrpg-cheat-card-grid";
	grid.dataset.gridId = gridId;

	var updateGrid = function(preserveScroll) {
		if (preserveScroll) {
			saveScroll();
		}
		grid.innerHTML = '';
		for (var i = 0; i < items.length; i++) {
			if (items[i] == null || items[i] == undefined) continue;
			var name = getDisplayName ? getDisplayName(i, items[i]) : (items[i].name || items[i] || ArkRPG_CheatMenu.t('value.null'));
			if (searchTerm && name.toLowerCase().indexOf(searchTerm) === -1) continue;

			var card = document.createElement('div');
			card.className = "arkrpg-cheat-card" + (i === currentIndex ? " active" : "");
			card.dataset.index = i;

			var cardName = document.createElement('div');
			cardName.className = "arkrpg-cheat-card-name";
			cardName.textContent = name;
			card.appendChild(cardName);

			if (getExtraInfo) {
				var extra = getExtraInfo(i, items[i]);
				if (extra) {
					var cardExtra = document.createElement('div');
					cardExtra.className = "arkrpg-cheat-card-extra";
					cardExtra.textContent = extra;
					card.appendChild(cardExtra);
				}
			}

			card.addEventListener('click', function(e) {
				// Don't trigger click if user was scrolling
				if (grid.isScrolling) return;
				var idx = parseInt(this.dataset.index);
				onSelect(idx);
				// Don't update menu immediately to preserve scroll
				setTimeout(function() {
					ArkRPG_CheatMenu.update_menu();
				}, 50);
				SoundManager.playSystemSound(0);
			});

			grid.appendChild(card);
		}
		if (preserveScroll) {
			restoreScroll();
		}
	};

	// Prevent card click when scrolling
	var scrollTimeout;
	grid.addEventListener('scroll', function() {
		grid.isScrolling = true;
		savedScrollPosition = grid.scrollTop;
		clearTimeout(scrollTimeout);
		scrollTimeout = setTimeout(function() {
			grid.isScrolling = false;
		}, 150);
	});

	// Stop event propagation for scroll events
	grid.addEventListener('wheel', function(e) {
		e.stopPropagation();
		savedScrollPosition = grid.scrollTop;
	}, { passive: true });

	grid.addEventListener('mousedown', function(e) {
		// Allow scrolling with mouse drag
		if (e.target.closest('.arkrpg-cheat-card')) {
			e.stopPropagation();
		}
	});

	// Store reference for scroll preservation
	grid.saveScroll = saveScroll;
	grid.restoreScroll = restoreScroll;
	grid.updateGrid = function() { updateGrid(true); };

	updateGrid(false);
	section.appendChild(grid);
	return section;
};

ArkRPG_CheatMenu.createSelector = function(label, value, max, currentIndex, onSelect) {
	return ArkRPG_CheatMenu.createInputGroup(label, value, function() {
		var newIndex = currentIndex - 1;
		if (newIndex < 0) newIndex = max - 1;
		onSelect(newIndex);
		ArkRPG_CheatMenu.update_menu();
		SoundManager.playSystemSound(0);
	}, function() {
		var newIndex = currentIndex + 1;
		if (newIndex >= max) newIndex = 0;
		onSelect(newIndex);
	ArkRPG_CheatMenu.update_menu();
		SoundManager.playSystemSound(0);
	});
};

ArkRPG_CheatMenu.createAmountSelector = function() {
	return ArkRPG_CheatMenu.createInputGroup(ArkRPG_CheatMenu.t('label.amount'), ArkRPG_CheatMenu.amounts[ArkRPG_CheatMenu.amount_index],
		function() {
			if (ArkRPG_CheatMenu.amount_index > 0) ArkRPG_CheatMenu.amount_index--;
			ArkRPG_CheatMenu.update_menu();
			SoundManager.playSystemSound(2);
		},
		function() {
			if (ArkRPG_CheatMenu.amount_index < ArkRPG_CheatMenu.amounts.length - 1) ArkRPG_CheatMenu.amount_index++;
		ArkRPG_CheatMenu.update_menu();
	SoundManager.playSystemSound(1);
		}
	);
};

ArkRPG_CheatMenu.createActorSelector = function() {
	return ArkRPG_CheatMenu.createCardGrid(ArkRPG_CheatMenu.t('label.selectActor'), $gameActors._data,
		ArkRPG_CheatMenu.cheat_selected_actor, function(i) {
			ArkRPG_CheatMenu.cheat_selected_actor = i;
		}, function(i, actor) {
			return actor && actor._name ? actor._name : ArkRPG_CheatMenu.t('value.null');
		}, function(i, actor) {
			if (!actor) return null;
			var level = actor._level || 0;
			var hp = actor._hp || 0;
			var mhp = actor._mhp || 0;
			return ArkRPG_CheatMenu.t('label.levelHp', { lv: level, hp: hp, mhp: mhp });
		});
};

ArkRPG_CheatMenu.createToggleButton = function(label, isOn, onClick) {
	var status = isOn ? ArkRPG_CheatMenu.t('status.on') : ArkRPG_CheatMenu.t('status.off');
	var btn = ArkRPG_CheatMenu.createButton(label + ": " + status, onClick, "arkrpg-cheat-btn-toggle");
	btn.className += isOn ? " active" : "";
	return btn;
};

ArkRPG_CheatMenu.buildPartyResourceMenu = function(contentArea, type) {
	var setFunc = type === "hp" ? ArkRPG_CheatMenu.set_party_hp : (type === "mp" ? ArkRPG_CheatMenu.set_party_mp : ArkRPG_CheatMenu.set_party_tp);
	var recoverFunc = type === "hp" ? ArkRPG_CheatMenu.recover_party_hp : (type === "mp" ? ArkRPG_CheatMenu.recover_party_mp : ArkRPG_CheatMenu.recover_party_tp);
	var label = type.toUpperCase();

	var section1 = ArkRPG_CheatMenu.createSection(ArkRPG_CheatMenu.t('label.aliveParty'));
	var btnGrid1 = document.createElement('div');
	btnGrid1.className = "arkrpg-cheat-btn-grid";
	btnGrid1.appendChild(ArkRPG_CheatMenu.createButton(ArkRPG_CheatMenu.t('button.set0'), function() { setFunc(0, true); SoundManager.playSystemSound(1); }));
	btnGrid1.appendChild(ArkRPG_CheatMenu.createButton(ArkRPG_CheatMenu.t('button.set1'), function() { setFunc(1, true); SoundManager.playSystemSound(1); }));
	btnGrid1.appendChild(ArkRPG_CheatMenu.createButton(ArkRPG_CheatMenu.t('button.full', { name: label }), function() { recoverFunc(true); SoundManager.playSystemSound(1); }));
	section1.appendChild(btnGrid1);

	var section2 = ArkRPG_CheatMenu.createSection(ArkRPG_CheatMenu.t('label.allParty'));
	var btnGrid2 = document.createElement('div');
	btnGrid2.className = "arkrpg-cheat-btn-grid";
	btnGrid2.appendChild(ArkRPG_CheatMenu.createButton(ArkRPG_CheatMenu.t('button.set0'), function() { setFunc(0, false); SoundManager.playSystemSound(1); }));
	btnGrid2.appendChild(ArkRPG_CheatMenu.createButton(ArkRPG_CheatMenu.t('button.set1'), function() { setFunc(1, false); SoundManager.playSystemSound(1); }));
	btnGrid2.appendChild(ArkRPG_CheatMenu.createButton(ArkRPG_CheatMenu.t('button.full', { name: label }), function() { recoverFunc(false); SoundManager.playSystemSound(1); }));
	section2.appendChild(btnGrid2);

	contentArea.appendChild(section1);
	contentArea.appendChild(section2);
};

ArkRPG_CheatMenu.buildItemMenu = function(contentArea, type) {
	var selection = type === "item" ? ArkRPG_CheatMenu.item_selection : (type === "weapon" ? ArkRPG_CheatMenu.weapon_selection : ArkRPG_CheatMenu.armor_selection);
	var data = type === "item" ? $dataItems : (type === "weapon" ? $dataWeapons : $dataArmors);
	var partyData = type === "item" ? $gameParty._items : (type === "weapon" ? $gameParty._weapons : $gameParty._armors);
	var giveFunc = type === "item" ? ArkRPG_CheatMenu.give_item : (type === "weapon" ? ArkRPG_CheatMenu.give_weapon : ArkRPG_CheatMenu.give_armor);
	var label = ArkRPG_CheatMenu.t(ArkRPG_CheatMenu.menuKeyByType(type));

	var section = ArkRPG_CheatMenu.createSection();
	section.appendChild(ArkRPG_CheatMenu.createAmountSelector());

	// Create card grid for items
	var cardSection = ArkRPG_CheatMenu.createCardGrid(ArkRPG_CheatMenu.t('label.selectItem', { name: label }), data, selection, function(i) {
		if (type === "item") ArkRPG_CheatMenu.item_selection = i;
		else if (type === "weapon") ArkRPG_CheatMenu.weapon_selection = i;
		else ArkRPG_CheatMenu.armor_selection = i;
	}, function(i, item) {
		return (item && item.name && item.name.length > 0) ? item.name : ArkRPG_CheatMenu.t('value.null');
	}, function(i, item) {
		var amount = partyData[i] || 0;
		return ArkRPG_CheatMenu.t('label.owned', { n: amount });
	});
	section.appendChild(cardSection);

	// Current selected item controls
	var selectedSection = ArkRPG_CheatMenu.createSection(ArkRPG_CheatMenu.t('label.selected', { name: ((data[selection] && data[selection].name) ? data[selection].name : ArkRPG_CheatMenu.t('value.null')) }));
	var currentAmount = partyData[selection] || 0;
	var amountGroup = ArkRPG_CheatMenu.createInputGroup(ArkRPG_CheatMenu.t('label.currentAmount'), currentAmount,
		function() {
			giveFunc(selection, -ArkRPG_CheatMenu.amounts[ArkRPG_CheatMenu.amount_index]);
	ArkRPG_CheatMenu.update_menu();
		SoundManager.playSystemSound(2);
		},
		function() {
			giveFunc(selection, ArkRPG_CheatMenu.amounts[ArkRPG_CheatMenu.amount_index]);
	ArkRPG_CheatMenu.update_menu();
		SoundManager.playSystemSound(1);
	}
	);
	selectedSection.appendChild(amountGroup);
	section.appendChild(selectedSection);
	contentArea.appendChild(section);
};

var menuBuilders = {
	godmode: function(contentArea) {
		var section = ArkRPG_CheatMenu.createSection();
		section.appendChild(ArkRPG_CheatMenu.createActorSelector());
		var selectedSection = ArkRPG_CheatMenu.createSection(ArkRPG_CheatMenu.t('label.selectedActor'));
		var actor = $gameActors._data[ArkRPG_CheatMenu.cheat_selected_actor];
		var isOn = actor && actor.__arkrpg_cheat_god_mode;
		selectedSection.appendChild(ArkRPG_CheatMenu.createToggleButton(ArkRPG_CheatMenu.t('menu.godmode'), isOn, function() {
			if (actor) {
				if (isOn) ArkRPG_CheatMenu.god_mode_off(actor);
				else ArkRPG_CheatMenu.god_mode(actor);
				SoundManager.playSystemSound(isOn ? 2 : 1);
	ArkRPG_CheatMenu.update_menu();
			}
		}));
		section.appendChild(selectedSection);
		contentArea.appendChild(section);
	},
	noclip: function(contentArea) {
		var section = ArkRPG_CheatMenu.createSection();
		section.appendChild(ArkRPG_CheatMenu.createToggleButton(ArkRPG_CheatMenu.t('menu.noclip'), $gamePlayer._through, function() {
			$gamePlayer._through = !$gamePlayer._through;
			SoundManager.playSystemSound($gamePlayer._through ? 1 : 2);
	ArkRPG_CheatMenu.update_menu();
		}));
		contentArea.appendChild(section);
	},
	enemyhp: function(contentArea) {
		var s1 = ArkRPG_CheatMenu.createSection(ArkRPG_CheatMenu.t('label.aliveEnemies'));
		var grid1 = document.createElement('div');
		grid1.className = "arkrpg-cheat-btn-grid";
		grid1.appendChild(ArkRPG_CheatMenu.createButton(ArkRPG_CheatMenu.t('button.setHp0'), function() { ArkRPG_CheatMenu.set_enemy_hp(0, true); SoundManager.playSystemSound(1); }));
		grid1.appendChild(ArkRPG_CheatMenu.createButton(ArkRPG_CheatMenu.t('button.setHp1'), function() { ArkRPG_CheatMenu.set_enemy_hp(1, true); SoundManager.playSystemSound(1); }));
		s1.appendChild(grid1);
		var s2 = ArkRPG_CheatMenu.createSection(ArkRPG_CheatMenu.t('label.allEnemies'));
		var grid2 = document.createElement('div');
		grid2.className = "arkrpg-cheat-btn-grid";
		grid2.appendChild(ArkRPG_CheatMenu.createButton(ArkRPG_CheatMenu.t('button.setHp0'), function() { ArkRPG_CheatMenu.set_enemy_hp(0, false); SoundManager.playSystemSound(1); }));
		grid2.appendChild(ArkRPG_CheatMenu.createButton(ArkRPG_CheatMenu.t('button.setHp1'), function() { ArkRPG_CheatMenu.set_enemy_hp(1, false); SoundManager.playSystemSound(1); }));
		s2.appendChild(grid2);
		contentArea.appendChild(s1);
		contentArea.appendChild(s2);
	},
	partyhp: function(contentArea) { ArkRPG_CheatMenu.buildPartyResourceMenu(contentArea, "hp"); },
	partymp: function(contentArea) { ArkRPG_CheatMenu.buildPartyResourceMenu(contentArea, "mp"); },
	partytp: function(contentArea) { ArkRPG_CheatMenu.buildPartyResourceMenu(contentArea, "tp"); },
	exp: function(contentArea) {
		var section = ArkRPG_CheatMenu.createSection();
		section.appendChild(ArkRPG_CheatMenu.createActorSelector());
		section.appendChild(ArkRPG_CheatMenu.createAmountSelector());
		var actor = $gameActors._data[ArkRPG_CheatMenu.cheat_selected_actor];
		var expGroup = ArkRPG_CheatMenu.createInputGroup(ArkRPG_CheatMenu.t('label.currentExp'), actor ? actor.currentExp() : 0,
			function() {
				ArkRPG_CheatMenu.give_exp(actor, -ArkRPG_CheatMenu.amounts[ArkRPG_CheatMenu.amount_index]);
	ArkRPG_CheatMenu.update_menu();
		SoundManager.playSystemSound(2);
			},
			function() {
				ArkRPG_CheatMenu.give_exp(actor, ArkRPG_CheatMenu.amounts[ArkRPG_CheatMenu.amount_index]);
	ArkRPG_CheatMenu.update_menu();
		SoundManager.playSystemSound(1);
	}
		);
		section.appendChild(expGroup);
		contentArea.appendChild(section);
	},
	stats: function(contentArea) {
		var section = ArkRPG_CheatMenu.createSection();
		section.appendChild(ArkRPG_CheatMenu.createActorSelector());
		var actor = $gameActors._data[ArkRPG_CheatMenu.cheat_selected_actor];
		if (actor && actor._paramPlus) {
			if (ArkRPG_CheatMenu.stat_selection >= actor._paramPlus.length) ArkRPG_CheatMenu.stat_selection = 0;
			var statsArray = [];
			for (var i = 0; i < actor._paramPlus.length; i++) {
				statsArray.push($dataSystem.terms.params[i] || ArkRPG_CheatMenu.t('label.statN', { n: i }));
			}
			var statSection = ArkRPG_CheatMenu.createSection();
			statSection.appendChild(ArkRPG_CheatMenu.createAmountSelector());
			var cardSection = ArkRPG_CheatMenu.createCardGrid(ArkRPG_CheatMenu.t('label.selectStat'), statsArray, ArkRPG_CheatMenu.stat_selection, function(i) {
				ArkRPG_CheatMenu.stat_selection = i;
			}, function(i, statName) {
				return statName;
			}, function(i, statName) {
				return ArkRPG_CheatMenu.t('label.value', { v: actor._paramPlus[i] });
			});
			statSection.appendChild(cardSection);
			var selectedSection = ArkRPG_CheatMenu.createSection(ArkRPG_CheatMenu.t('label.selected', { name: statsArray[ArkRPG_CheatMenu.stat_selection] }));
			var valueGroup = ArkRPG_CheatMenu.createInputGroup(ArkRPG_CheatMenu.t('label.currentValue'), actor._paramPlus[ArkRPG_CheatMenu.stat_selection],
				function() {
					ArkRPG_CheatMenu.give_stat(actor, ArkRPG_CheatMenu.stat_selection, -ArkRPG_CheatMenu.amounts[ArkRPG_CheatMenu.amount_index]);
	ArkRPG_CheatMenu.update_menu();
		SoundManager.playSystemSound(2);
				},
				function() {
					ArkRPG_CheatMenu.give_stat(actor, ArkRPG_CheatMenu.stat_selection, ArkRPG_CheatMenu.amounts[ArkRPG_CheatMenu.amount_index]);
					ArkRPG_CheatMenu.update_menu();
		SoundManager.playSystemSound(1);
	}
			);
			selectedSection.appendChild(valueGroup);
			statSection.appendChild(selectedSection);
			section.appendChild(statSection);
		}
		contentArea.appendChild(section);
	},
	gold: function(contentArea) {
		var section = ArkRPG_CheatMenu.createSection();
		section.appendChild(ArkRPG_CheatMenu.createAmountSelector());
		section.appendChild(ArkRPG_CheatMenu.createInputGroup(ArkRPG_CheatMenu.t('label.currentGold'), $gameParty._gold,
			function() {
				ArkRPG_CheatMenu.give_gold(-ArkRPG_CheatMenu.amounts[ArkRPG_CheatMenu.amount_index]);
	ArkRPG_CheatMenu.update_menu();
		SoundManager.playSystemSound(2);
			},
			function() {
				ArkRPG_CheatMenu.give_gold(ArkRPG_CheatMenu.amounts[ArkRPG_CheatMenu.amount_index]);
				ArkRPG_CheatMenu.update_menu();
		SoundManager.playSystemSound(1);
	}
		));
		contentArea.appendChild(section);
	},
	items: function(contentArea) { ArkRPG_CheatMenu.buildItemMenu(contentArea, "item"); },
	weapons: function(contentArea) { ArkRPG_CheatMenu.buildItemMenu(contentArea, "weapon"); },
	armors: function(contentArea) { ArkRPG_CheatMenu.buildItemMenu(contentArea, "armor"); },
	speed: function(contentArea) {
		var section = ArkRPG_CheatMenu.createSection();
		section.appendChild(ArkRPG_CheatMenu.createInputGroup(ArkRPG_CheatMenu.t('label.speedAmount'), ArkRPG_CheatMenu.move_amounts[ArkRPG_CheatMenu.move_amount_index],
			function() {
				if (ArkRPG_CheatMenu.move_amount_index > 0) ArkRPG_CheatMenu.move_amount_index--;
	ArkRPG_CheatMenu.update_menu();
		SoundManager.playSystemSound(2);
			},
			function() {
				if (ArkRPG_CheatMenu.move_amount_index < ArkRPG_CheatMenu.move_amounts.length - 1) ArkRPG_CheatMenu.move_amount_index++;
				ArkRPG_CheatMenu.update_menu();
		SoundManager.playSystemSound(1);
	}
		));
		section.appendChild(ArkRPG_CheatMenu.createInputGroup(ArkRPG_CheatMenu.t('label.currentSpeed'), $gamePlayer._moveSpeed,
			function() {
				ArkRPG_CheatMenu.change_player_speed(-ArkRPG_CheatMenu.move_amounts[ArkRPG_CheatMenu.move_amount_index]);
	ArkRPG_CheatMenu.update_menu();
		SoundManager.playSystemSound(2);
			},
			function() {
				ArkRPG_CheatMenu.change_player_speed(ArkRPG_CheatMenu.move_amounts[ArkRPG_CheatMenu.move_amount_index]);
				ArkRPG_CheatMenu.update_menu();
		SoundManager.playSystemSound(1);
	}
		));
		section.appendChild(ArkRPG_CheatMenu.createToggleButton(ArkRPG_CheatMenu.t('label.speedLock'), !ArkRPG_CheatMenu.speed_unlocked, function() {
			ArkRPG_CheatMenu.toggle_lock_player_speed();
			SoundManager.playSystemSound(ArkRPG_CheatMenu.speed_unlocked ? 2 : 1);
	ArkRPG_CheatMenu.update_menu();
		}));
		contentArea.appendChild(section);
	},
	states: function(contentArea) {
		var section = ArkRPG_CheatMenu.createSection();
		section.appendChild(ArkRPG_CheatMenu.createButton(ArkRPG_CheatMenu.t('button.clearAllPartyStates'), function() {
	ArkRPG_CheatMenu.clear_party_states();
	SoundManager.playSystemSound(1);
		}));
		section.appendChild(ArkRPG_CheatMenu.createActorSelector());
		var selectedSection = ArkRPG_CheatMenu.createSection(ArkRPG_CheatMenu.t('label.selectedActor'));
		var actor = $gameActors._data[ArkRPG_CheatMenu.cheat_selected_actor];
		var count = (actor && actor._states) ? actor._states.length : 0;
		selectedSection.appendChild(ArkRPG_CheatMenu.createButton(ArkRPG_CheatMenu.t('button.clearActorStates', { n: count }), function() {
			ArkRPG_CheatMenu.clear_actor_states(actor);
		SoundManager.playSystemSound(1);
	ArkRPG_CheatMenu.update_menu();
		}));
		section.appendChild(selectedSection);
		contentArea.appendChild(section);
	},
	variables: function(contentArea) {
		var section = ArkRPG_CheatMenu.createSection();
		section.appendChild(ArkRPG_CheatMenu.createAmountSelector());
		var cardSection = ArkRPG_CheatMenu.createCardGrid(ArkRPG_CheatMenu.t('label.selectVariable'), $dataSystem.variables, ArkRPG_CheatMenu.variable_selection, function(i) {
			ArkRPG_CheatMenu.variable_selection = i;
		}, function(i, varName) {
			return (varName && varName.length > 0) ? varName : ArkRPG_CheatMenu.t('label.variableN', { n: i });
		}, function(i, varName) {
			var value = $gameVariables.value(i);
			return ArkRPG_CheatMenu.t('label.value', { v: (value != undefined ? value : ArkRPG_CheatMenu.t('value.null')) });
		});
		section.appendChild(cardSection);
		var selectedSection = ArkRPG_CheatMenu.createSection(ArkRPG_CheatMenu.t('label.selected', { name: (($dataSystem.variables[ArkRPG_CheatMenu.variable_selection] && $dataSystem.variables[ArkRPG_CheatMenu.variable_selection].length > 0)
			? $dataSystem.variables[ArkRPG_CheatMenu.variable_selection] : ArkRPG_CheatMenu.t('label.variableN', { n: ArkRPG_CheatMenu.variable_selection })) }));
		var value = $gameVariables.value(ArkRPG_CheatMenu.variable_selection);
		selectedSection.appendChild(ArkRPG_CheatMenu.createInputGroup(ArkRPG_CheatMenu.t('label.currentValue'), value != undefined ? value : ArkRPG_CheatMenu.t('value.null'),
			function() {
				ArkRPG_CheatMenu.set_variable(ArkRPG_CheatMenu.variable_selection, -ArkRPG_CheatMenu.amounts[ArkRPG_CheatMenu.amount_index]);
	ArkRPG_CheatMenu.update_menu();
		SoundManager.playSystemSound(2);
			},
			function() {
				ArkRPG_CheatMenu.set_variable(ArkRPG_CheatMenu.variable_selection, ArkRPG_CheatMenu.amounts[ArkRPG_CheatMenu.amount_index]);
	ArkRPG_CheatMenu.update_menu();
				SoundManager.playSystemSound(1);
			}
		));
		section.appendChild(selectedSection);
		contentArea.appendChild(section);
	},
	switches: function(contentArea) {
		var section = ArkRPG_CheatMenu.createSection();
		var cardSection = ArkRPG_CheatMenu.createCardGrid(ArkRPG_CheatMenu.t('label.selectSwitch'), $dataSystem.switches, ArkRPG_CheatMenu.switch_selection, function(i) {
			ArkRPG_CheatMenu.switch_selection = i;
		}, function(i, switchName) {
			return (switchName && switchName.length > 0) ? switchName : ArkRPG_CheatMenu.t('label.switchN', { n: i });
		}, function(i, switchName) {
			var value = $gameSwitches.value(i);
			return ArkRPG_CheatMenu.t('label.statusValue', { s: value ? ArkRPG_CheatMenu.t('status.on') : ArkRPG_CheatMenu.t('status.off') });
		});
		section.appendChild(cardSection);
		var selectedSection = ArkRPG_CheatMenu.createSection(ArkRPG_CheatMenu.t('label.selected', { name: (($dataSystem.switches[ArkRPG_CheatMenu.switch_selection] && $dataSystem.switches[ArkRPG_CheatMenu.switch_selection].length > 0)
			? $dataSystem.switches[ArkRPG_CheatMenu.switch_selection] : ArkRPG_CheatMenu.t('label.switchN', { n: ArkRPG_CheatMenu.switch_selection })) }));
		var value = $gameSwitches.value(ArkRPG_CheatMenu.switch_selection);
		selectedSection.appendChild(ArkRPG_CheatMenu.createToggleButton(ArkRPG_CheatMenu.t('label.status'), value, function() {
			ArkRPG_CheatMenu.toggle_switch(ArkRPG_CheatMenu.switch_selection);
			SoundManager.playSystemSound($gameSwitches.value(ArkRPG_CheatMenu.switch_selection) ? 1 : 2);
			ArkRPG_CheatMenu.update_menu();
		}));
		section.appendChild(selectedSection);
		contentArea.appendChild(section);
	},
	positions: function(contentArea) {
		var section = ArkRPG_CheatMenu.createSection();
		var mapInfo = $dataMapInfos[$gameMap.mapId()];
		var currentMap = mapInfo ? ($gameMap.mapId() + ": " + mapInfo.name) : ArkRPG_CheatMenu.t('value.null');
		var infoDiv = document.createElement('div');
		infoDiv.className = "arkrpg-cheat-info";
		infoDiv.innerHTML = "<strong>" + ArkRPG_CheatMenu.t('label.currentPosition') + "</strong><br>" + currentMap + "<br>(" + $gamePlayer.x + ", " + $gamePlayer.y + ")";
		section.appendChild(infoDiv);
		for (var i = 0; i < ArkRPG_CheatMenu.saved_positions.length; i++) {
			var pos = ArkRPG_CheatMenu.saved_positions[i];
			var posSection = ArkRPG_CheatMenu.createSection(ArkRPG_CheatMenu.t('label.positionN', { n: i + 1 }));
			var mapText = pos.m != -1 ? (pos.m + ": " + ($dataMapInfos[pos.m] ? $dataMapInfos[pos.m].name : ArkRPG_CheatMenu.t('value.null'))) : ArkRPG_CheatMenu.t('value.null');
			var posText = pos.m != -1 ? ("(" + pos.x + ", " + pos.y + ")") : ArkRPG_CheatMenu.t('value.null');
			var infoDiv2 = document.createElement('div');
			infoDiv2.className = "arkrpg-cheat-info-small";
			infoDiv2.textContent = mapText;
			posSection.appendChild(infoDiv2);
			var btnGrid = document.createElement('div');
			btnGrid.className = "arkrpg-cheat-btn-grid";
			btnGrid.appendChild(ArkRPG_CheatMenu.createButton(ArkRPG_CheatMenu.t('button.save'), function(idx) {
				return function() {
					ArkRPG_CheatMenu.saved_positions[idx].m = $gameMap.mapId();
					ArkRPG_CheatMenu.saved_positions[idx].x = $gamePlayer.x;
					ArkRPG_CheatMenu.saved_positions[idx].y = $gamePlayer.y;
	SoundManager.playSystemSound(1);
	ArkRPG_CheatMenu.update_menu();
};
			}(i)));
			btnGrid.appendChild(ArkRPG_CheatMenu.createButton(ArkRPG_CheatMenu.t('button.recall', { pos: posText }), function(idx) {
				return function() {
					if (ArkRPG_CheatMenu.saved_positions[idx].m != -1) {
						ArkRPG_CheatMenu.teleport(ArkRPG_CheatMenu.saved_positions[idx].m, ArkRPG_CheatMenu.saved_positions[idx].x, ArkRPG_CheatMenu.saved_positions[idx].y);
		SoundManager.playSystemSound(1);
					} else {
		SoundManager.playSystemSound(2);
	}
	ArkRPG_CheatMenu.update_menu();
};
			}(i)));
			posSection.appendChild(btnGrid);
			section.appendChild(posSection);
		}
		contentArea.appendChild(section);
	},
	teleport: function(contentArea) {
		var section = ArkRPG_CheatMenu.createSection();
		var mapsArray = [];
		for (var i = 1; i < $dataMapInfos.length; i++) {
			if ($dataMapInfos[i]) {
				mapsArray.push({id: i, name: $dataMapInfos[i].name || ArkRPG_CheatMenu.t('label.mapN', { n: i })});
			}
		}
		var currentMapIndex = 0;
		for (var j = 0; j < mapsArray.length; j++) {
			if (mapsArray[j].id === ArkRPG_CheatMenu.teleport_location.m) {
				currentMapIndex = j;
				break;
			}
		}
		var cardSection = ArkRPG_CheatMenu.createCardGrid(ArkRPG_CheatMenu.t('label.selectMap'), mapsArray, currentMapIndex,
			function(i) {
				ArkRPG_CheatMenu.teleport_location.m = mapsArray[i].id;
			}, function(i, map) {
				return map.id + ": " + map.name;
			}, null);
		section.appendChild(cardSection);
		section.appendChild(ArkRPG_CheatMenu.createInputGroup(ArkRPG_CheatMenu.t('label.x'), ArkRPG_CheatMenu.teleport_location.x,
			function() {
				ArkRPG_CheatMenu.teleport_location.x = (ArkRPG_CheatMenu.teleport_location.x - 1 + 256) % 256;
	ArkRPG_CheatMenu.update_menu();
	SoundManager.playSystemSound(0);
			},
			function() {
				ArkRPG_CheatMenu.teleport_location.x = (ArkRPG_CheatMenu.teleport_location.x + 1) % 256;
	ArkRPG_CheatMenu.update_menu();
				SoundManager.playSystemSound(0);
			}
		));
		section.appendChild(ArkRPG_CheatMenu.createInputGroup(ArkRPG_CheatMenu.t('label.y'), ArkRPG_CheatMenu.teleport_location.y,
			function() {
				ArkRPG_CheatMenu.teleport_location.y = (ArkRPG_CheatMenu.teleport_location.y - 1 + 256) % 256;
				ArkRPG_CheatMenu.update_menu();
	SoundManager.playSystemSound(0);
			},
			function() {
				ArkRPG_CheatMenu.teleport_location.y = (ArkRPG_CheatMenu.teleport_location.y + 1) % 256;
	ArkRPG_CheatMenu.update_menu();
				SoundManager.playSystemSound(0);
			}
		));
		section.appendChild(ArkRPG_CheatMenu.createButton(ArkRPG_CheatMenu.t('button.teleport'), function() {
	ArkRPG_CheatMenu.teleport(ArkRPG_CheatMenu.teleport_location.m, ArkRPG_CheatMenu.teleport_location.x, ArkRPG_CheatMenu.teleport_location.y);
	SoundManager.playSystemSound(1);
	ArkRPG_CheatMenu.update_menu();
		}, "arkrpg-cheat-btn-primary"));
		contentArea.appendChild(section);
	},
	noencounter: function(contentArea) {
		var section = ArkRPG_CheatMenu.createSection();
		var effective = !!(typeof $gamePlayer !== 'undefined' && $gamePlayer && $gamePlayer.__arkrpg_cheat_no_encounter);
		section.appendChild(ArkRPG_CheatMenu.createToggleButton(ArkRPG_CheatMenu.t('menu.noencounter'), effective, function() {
			ArkRPG_CheatMenu.toggle_disable_encounter();
			SoundManager.playSystemSound(ArkRPG_CheatMenu.disable_encounter ? 1 : 2);
			ArkRPG_CheatMenu.update_menu();
		}));
		contentArea.appendChild(section);
	},
	battle: function(contentArea) {
		var section = ArkRPG_CheatMenu.createSection();
		var inBattle = ArkRPG_CheatMenu.can_force_battle_end();
		if (!inBattle) {
			var info = document.createElement('div');
			info.className = 'arkrpg-cheat-info';
			info.textContent = ArkRPG_CheatMenu.t('label.notInBattle');
			section.appendChild(info);
		}
		var grid = document.createElement('div');
		grid.className = 'arkrpg-cheat-btn-grid';
		var mkBtn = function(label, result, primary) {
			var btn = ArkRPG_CheatMenu.createButton(label, function() {
				if (ArkRPG_CheatMenu.force_battle(result)) {
					SoundManager.playSystemSound(1);
					ArkRPG_CheatMenu.update_menu();
				} else {
					SoundManager.playSystemSound(2);
				}
			}, primary ? 'arkrpg-cheat-btn-primary' : undefined);
			if (!inBattle) {
				btn.disabled = true;
				btn.style.opacity = '0.5';
				btn.style.cursor = 'not-allowed';
			}
			return btn;
		};
		grid.appendChild(mkBtn(ArkRPG_CheatMenu.t('button.battleWin'),    'win',    true));
		grid.appendChild(mkBtn(ArkRPG_CheatMenu.t('button.battleLose'),   'lose',   false));
		grid.appendChild(mkBtn(ArkRPG_CheatMenu.t('button.battleEscape'), 'escape', false));
		grid.appendChild(mkBtn(ArkRPG_CheatMenu.t('button.battleAbort'),  'abort',  false));
		section.appendChild(grid);
		contentArea.appendChild(section);
	},
	gamespeed: function(contentArea) {
		var section = ArkRPG_CheatMenu.createSection();
		section.appendChild(ArkRPG_CheatMenu.createInputGroup(
			ArkRPG_CheatMenu.t('label.currentGameSpeed'),
			ArkRPG_CheatMenu.game_speed_rates[ArkRPG_CheatMenu.game_speed_index] + 'x',
			function() {
				if (ArkRPG_CheatMenu.game_speed_index > 0) {
					ArkRPG_CheatMenu.game_speed_index--;
					ArkRPG_CheatMenu.set_game_speed(ArkRPG_CheatMenu.game_speed_rates[ArkRPG_CheatMenu.game_speed_index]);
					ArkRPG_CheatMenu.update_menu();
					SoundManager.playSystemSound(2);
				}
			},
			function() {
				if (ArkRPG_CheatMenu.game_speed_index < ArkRPG_CheatMenu.game_speed_rates.length - 1) {
					ArkRPG_CheatMenu.game_speed_index++;
					ArkRPG_CheatMenu.set_game_speed(ArkRPG_CheatMenu.game_speed_rates[ArkRPG_CheatMenu.game_speed_index]);
					ArkRPG_CheatMenu.update_menu();
					SoundManager.playSystemSound(1);
				}
			}
		));
		var info = document.createElement('div');
		info.className = 'arkrpg-cheat-info-small';
		info.textContent = ArkRPG_CheatMenu.t('label.gameSpeedHint');
		section.appendChild(info);
		contentArea.appendChild(section);
	}
};

ArkRPG_CheatMenu.buildMenuContent = function(container) {
	var contentArea = container.querySelector('.arkrpg-cheat-menu-content');
	contentArea.innerHTML = '';
	var menuDef = ArkRPG_CheatMenu.menuDefinitions[ArkRPG_CheatMenu.cheat_selected] || ArkRPG_CheatMenu.menuDefinitions[0];
	var menuId = menuDef ? menuDef.id : null;
	if (!ArkRPG_CheatMenu.isGameRuntimeReady()) {
		contentArea.appendChild(ArkRPG_CheatMenu.createUnavailableSection());
		return;
	}
	if (!ArkRPG_CheatMenu.initialized && !ArkRPG_CheatMenu.prepareRuntimeState()) {
		contentArea.appendChild(ArkRPG_CheatMenu.createUnavailableSection());
		return;
	}
	try {
		if (menuId && menuBuilders[menuId]) menuBuilders[menuId](contentArea);
	} catch (e) {
		console.warn('[ArkRPG_CheatMenu] build failed for ' + menuId + ': ' + e);
		contentArea.innerHTML = '';
		contentArea.appendChild(ArkRPG_CheatMenu.createUnavailableSection(String(e)));
	}
};

ArkRPG_CheatMenu.menuContainer = null;
ArkRPG_CheatMenu.scrollPositions = {};
ArkRPG_CheatMenu.searchTerms = {};

ArkRPG_CheatMenu.update_menu = function() {
	if (!ArkRPG_CheatMenu.menuContainer) {
		ArkRPG_CheatMenu.menuContainer = ArkRPG_CheatMenu.createMenuContainer();
		document.body.appendChild(ArkRPG_CheatMenu.menuContainer);
		ArkRPG_CheatMenu.menuContainer.addEventListener("mousedown", function(event) {
			event.stopPropagation();
		});
	}

	// Save scroll positions of all card grids before update
	var contentArea = ArkRPG_CheatMenu.menuContainer.querySelector('.arkrpg-cheat-menu-content');
	if (contentArea) {
		var grids = contentArea.querySelectorAll('.arkrpg-cheat-card-grid');
		for (var i = 0; i < grids.length; i++) {
			var grid = grids[i];
			if (grid.dataset.gridId) {
				ArkRPG_CheatMenu.scrollPositions[grid.dataset.gridId] = grid.scrollTop;
			}
		}
	}

	ArkRPG_CheatMenu.createSidebar(ArkRPG_CheatMenu.menuContainer);
	ArkRPG_CheatMenu.buildMenuContent(ArkRPG_CheatMenu.menuContainer);

	// Restore scroll positions after DOM update
	// Only restore if user is not actively scrolling
	var restoreScrollAttempts = 0;
	var restoreScroll = function() {
		if (contentArea) {
			var grids = contentArea.querySelectorAll('.arkrpg-cheat-card-grid');
			for (var i = 0; i < grids.length; i++) {
				var grid = grids[i];
				if (grid.dataset.gridId && ArkRPG_CheatMenu.scrollPositions[grid.dataset.gridId] !== undefined) {
					// Check if user is actively scrolling this grid
					var isUserScrolling = grid.isScrolling || false;
					if (!isUserScrolling) {
						var savedPos = ArkRPG_CheatMenu.scrollPositions[grid.dataset.gridId];
						grid.scrollTop = savedPos;
						// Try again if scroll didn't set correctly
						if (Math.abs(grid.scrollTop - savedPos) > 1 && restoreScrollAttempts < 2) {
							restoreScrollAttempts++;
							requestAnimationFrame(restoreScroll);
							return;
						}
					}
				}
			}
		}
	};
	// Use requestAnimationFrame to ensure DOM is ready
	requestAnimationFrame(function() {
		restoreScrollAttempts = 0;
		restoreScroll();
	});
};

/////////////////////////////////////////////////
// Key Listener
/////////////////////////////////////////////////

if (typeof ArkRPG_CheatMenu.keyCodes == "undefined") { ArkRPG_CheatMenu.keyCodes = {}; }
ArkRPG_CheatMenu.keyCodes.KEYCODE_1 = {keyCode: 49};
ArkRPG_CheatMenu.keyCodes.KEYCODE_LEFT = {keyCode: 37};
ArkRPG_CheatMenu.keyCodes.KEYCODE_RIGHT = {keyCode: 39};
ArkRPG_CheatMenu.keyCodes.KEYCODE_ESCAPE = {keyCode: 27};

window.addEventListener("keydown", function(event) {
	if (!event.altKey && !event.ctrlKey && !event.shiftKey && (event.keyCode === 120) &&
		typeof $gameTemp !== 'undefined' && $gameTemp && !$gameTemp.isPlaytest()) {
		$gameTemp._isPlaytest = true;
		setTimeout(function() { $gameTemp._isPlaytest = false; }, 100);
	}
	else if (ArkRPG_CheatMenu.overlay_openable && !event.altKey && !event.ctrlKey && !event.shiftKey) {
		if (event.keyCode == ArkRPG_CheatMenu.keyCodes.KEYCODE_1.keyCode) {
			if (!ArkRPG_CheatMenu.initialized) {
				ArkRPG_CheatMenu.prepareRuntimeState();
			}
			if (!ArkRPG_CheatMenu.cheat_menu_open) {
				ArkRPG_CheatMenu.cheat_menu_open = true;
				ArkRPG_CheatMenu.update_menu();
				SoundManager.playSystemSound(1);
			} else {
				ArkRPG_CheatMenu.cheat_menu_open = false;
				if (ArkRPG_CheatMenu.menuContainer) {
					ArkRPG_CheatMenu.menuContainer.remove();
					ArkRPG_CheatMenu.menuContainer = null;
				}
				SoundManager.playSystemSound(2);
			}
		}
		else if (ArkRPG_CheatMenu.cheat_menu_open) {
			if (event.keyCode == ArkRPG_CheatMenu.keyCodes.KEYCODE_LEFT.keyCode) {
				ArkRPG_CheatMenu.cheat_selected = (ArkRPG_CheatMenu.cheat_selected - 1 + ArkRPG_CheatMenu.menuDefinitions.length) % ArkRPG_CheatMenu.menuDefinitions.length;
				ArkRPG_CheatMenu.update_menu();
				SoundManager.playSystemSound(0);
			}
			else if (event.keyCode == ArkRPG_CheatMenu.keyCodes.KEYCODE_RIGHT.keyCode) {
				ArkRPG_CheatMenu.cheat_selected = (ArkRPG_CheatMenu.cheat_selected + 1) % ArkRPG_CheatMenu.menuDefinitions.length;
				ArkRPG_CheatMenu.update_menu();
				SoundManager.playSystemSound(0);
			}
			else if (event.keyCode == ArkRPG_CheatMenu.keyCodes.KEYCODE_ESCAPE.keyCode) {
				ArkRPG_CheatMenu.cheat_menu_open = false;
				if (ArkRPG_CheatMenu.menuContainer) {
					ArkRPG_CheatMenu.menuContainer.remove();
					ArkRPG_CheatMenu.menuContainer = null;
				}
				SoundManager.playSystemSound(2);
			}
		}
	}
});

/////////////////////////////////////////////////
// Load Hook
/////////////////////////////////////////////////

ArkRPG_CheatMenu.initialize = function() {
	ArkRPG_CheatMenu.overlay_openable = true;
	ArkRPG_CheatMenu.initialized = false;
	ArkRPG_CheatMenu.cheat_menu_open = false;
	ArkRPG_CheatMenu.speed_initialized = false;
	if (ArkRPG_CheatMenu.menuContainer) {
		ArkRPG_CheatMenu.menuContainer.remove();
		ArkRPG_CheatMenu.menuContainer = null;
	}
	// Re-apply hooks that target per-instance state ($gamePlayer) or class-level
	// functions that may have been replaced during save/load.
	// $gamePlayer is reconstructed on load → re-apply encounter hook if needed.
	if (ArkRPG_CheatMenu.disable_encounter) {
		if (typeof $gamePlayer !== 'undefined' && $gamePlayer) {
			ArkRPG_CheatMenu._encounter_bkup = null; // stale backup from previous $gamePlayer
			$gamePlayer.__arkrpg_cheat_no_encounter = false; // force _apply_encounter_hook to act
			ArkRPG_CheatMenu._apply_encounter_hook();
		}
	}
	// SceneManager.updateScene may have been re-hooked by other plugins. Always
	// pass through _apply_game_speed so a saved/restored 1x state also removes
	// any stale wrapper left by a previous accelerated session.
	ArkRPG_CheatMenu._apply_game_speed(ArkRPG_CheatMenu.game_speed || 1);
	clearInterval(ArkRPG_CheatMenu.menu_update_timer);
	ArkRPG_CheatMenu.menu_update_timer = setInterval(function() {
		if (ArkRPG_CheatMenu.cheat_menu_open) {
			// Don't rebuild while typing — would replace the input and drop focus.
			// querySelector(':focus') is more reliable than document.activeElement
			// on iOS WKWebView during IME composition.
			var focused = ArkRPG_CheatMenu.menuContainer && ArkRPG_CheatMenu.menuContainer.querySelector('input:focus, textarea:focus');
			if (focused) {
				return;
			}
			// Check if user is actively scrolling any grid
			var contentArea = ArkRPG_CheatMenu.menuContainer ? ArkRPG_CheatMenu.menuContainer.querySelector('.arkrpg-cheat-menu-content') : null;
			if (contentArea) {
				var grids = contentArea.querySelectorAll('.arkrpg-cheat-card-grid');
				var isUserScrolling = false;
				for (var i = 0; i < grids.length; i++) {
					if (grids[i].isScrolling) {
						isUserScrolling = true;
						break;
					}
				}
				// Only update if user is not scrolling
				if (!isUserScrolling) {
					ArkRPG_CheatMenu.update_menu();
				}
			} else {
				ArkRPG_CheatMenu.update_menu();
			}
		}
	}, 1000);
};

// Keep originals in this private closure. Public aliases such as
// DataManager.default_loadGame are commonly reused by cheat/debug plugins and
// can be redirected back to their own wrappers, causing infinite recursion.
var arkOriginalLoadGame = DataManager.loadGame;
var arkLoadGame = function() {
	ArkRPG_CheatMenu.initialize();
	return arkOriginalLoadGame.apply(this, arguments);
};
arkLoadGame.__arkrpgCheatOwner = runtimeKey;
arkLoadGame.__arkrpgCheatOriginal = arkOriginalLoadGame;
DataManager.loadGame = arkLoadGame;

var arkOriginalSetupNewGame = DataManager.setupNewGame;
var arkSetupNewGame = function() {
	ArkRPG_CheatMenu.initialize();
	return arkOriginalSetupNewGame.apply(this, arguments);
};
arkSetupNewGame.__arkrpgCheatOwner = runtimeKey;
arkSetupNewGame.__arkrpgCheatOriginal = arkOriginalSetupNewGame;
DataManager.setupNewGame = arkSetupNewGame;

var arkOriginalSaveGame = DataManager.saveGame;
var arkSaveGame = function() {
	$gameSystem.ArkRPG_CheatMenu = {};
	for (var name in ArkRPG_CheatMenu.initial_values) {
		$gameSystem.ArkRPG_CheatMenu[name] = ArkRPG_CheatMenu[name];
	}
	return arkOriginalSaveGame.apply(this, arguments);
};
arkSaveGame.__arkrpgCheatOwner = runtimeKey;
arkSaveGame.__arkrpgCheatOriginal = arkOriginalSaveGame;
DataManager.saveGame = arkSaveGame;

/////////////////////////////////////////////////
// ArkRPG iOS: Swift native button interface
/////////////////////////////////////////////////
ArkRPG_CheatMenu.toggleMenu = function() {
    if (ArkRPG_CheatMenu.cheat_menu_open) {
        // close
        ArkRPG_CheatMenu.cheat_menu_open = false;
        if (ArkRPG_CheatMenu.menuContainer) {
            ArkRPG_CheatMenu.menuContainer.remove();
            ArkRPG_CheatMenu.menuContainer = null;
        }
		ArkRPG_CheatMenu.notifyNativeMenuState(false);
    } else {
        // open
        if (!ArkRPG_CheatMenu.initialized) {
            ArkRPG_CheatMenu.prepareRuntimeState();
        }
        ArkRPG_CheatMenu.cheat_menu_open = true;
        ArkRPG_CheatMenu.update_menu();
		ArkRPG_CheatMenu.notifyNativeMenuState(true);
    }
};

arkRuntime.installed = true;
console.log("[ArkRPG_CheatMenu] installed namespace=ArkRPG_CheatMenu version=" + arkRuntime.version);
})(window);
