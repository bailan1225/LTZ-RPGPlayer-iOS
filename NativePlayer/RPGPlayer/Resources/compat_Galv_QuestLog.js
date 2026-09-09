// Galv.QUEST Safety Stubs
// Fix for: Galv.QUEST.* is not a function errors
// Some games call Galv.QUEST methods in events before the
// Galv_QuestLog plugin has fully initialized. This creates safe stubs for all methods.
// Trigger: game plugins.js contains Galv_QuestLog

(function() {
    var retries = 0;
    var dataManagerRetries = 0;
    var sceneRetries = 0;

    function ensureQuestState() {
        if (typeof $gameSystem === 'undefined' || !$gameSystem) return null;

        var state = $gameSystem._quests;
        if (!state || typeof state !== 'object' || Array.isArray(state)) {
            state = {};
            $gameSystem._quests = state;
        }

        if (!Object.prototype.hasOwnProperty.call(state, 'tracked')) state.tracked = null;
        if (!state.quest || typeof state.quest !== 'object' || Array.isArray(state.quest)) state.quest = {};
        if (!Array.isArray(state.active)) state.active = [];
        if (!Array.isArray(state.completed)) state.completed = [];
        if (!Array.isArray(state.failed)) state.failed = [];

        if (!state.categoryHide || typeof state.categoryHide !== 'object' || Array.isArray(state.categoryHide)) {
            state.categoryHide = {};
        }
        if (!Array.isArray(state.categoryHide.active)) state.categoryHide.active = [];
        if (!Array.isArray(state.categoryHide.completed)) state.categoryHide.completed = [];
        if (!Array.isArray(state.categoryHide.failed)) state.categoryHide.failed = [];
        if (!Array.isArray(state.categoryActive)) state.categoryActive = [];

        var categoryCount = 0;
        if (typeof Galv !== 'undefined' && Galv.QUEST && Array.isArray(Galv.QUEST.categories)) {
            categoryCount = Galv.QUEST.categories.length;
        }
        for (var i = 0; i < categoryCount; i++) {
            if (typeof state.categoryActive[i] === 'undefined') state.categoryActive[i] = true;
        }

        return state;
    }

    function patchDataManager() {
        if (typeof DataManager === 'undefined' || typeof DataManager.extractSaveContents !== 'function') {
            dataManagerRetries++;
            if (dataManagerRetries <= 100) setTimeout(patchDataManager, 100);
            return;
        }
        if (DataManager.extractSaveContents.__arkGalvQuestMigration) return;

        var originalExtractSaveContents = DataManager.extractSaveContents;
        var patchedExtractSaveContents = function(contents) {
            var result = originalExtractSaveContents.apply(this, arguments);
            ensureQuestState();
            return result;
        };
        patchedExtractSaveContents.__arkGalvQuestMigration = true;
        DataManager.extractSaveContents = patchedExtractSaveContents;
        ensureQuestState();
    }

    function patchQuestScene() {
        if (typeof Scene_QuestLog === 'undefined' ||
            !Scene_QuestLog.prototype ||
            typeof Scene_QuestLog.prototype.create !== 'function') {
            sceneRetries++;
            if (sceneRetries <= 100) setTimeout(patchQuestScene, 100);
            return;
        }
        if (Scene_QuestLog.prototype.create.__arkGalvQuestMigration) return;

        var originalCreate = Scene_QuestLog.prototype.create;
        var patchedCreate = function() {
            ensureQuestState();
            return originalCreate.apply(this, arguments);
        };
        patchedCreate.__arkGalvQuestMigration = true;
        Scene_QuestLog.prototype.create = patchedCreate;
    }

    function patchGalvQuest() {
        if (typeof Galv === 'undefined' || typeof Galv.QUEST === 'undefined') {
            retries++;
            if (retries > 100) {
                console.warn('[GalvQuestSafety] Galv.QUEST not found after 10s, giving up');
                return;
            }
            setTimeout(patchGalvQuest, 100);
            return;
        }

        var quests = Galv.QUEST;

        if (typeof quests.viewLog !== 'function') {
            quests.viewLog = function() {
                console.log('[GalvQuestSafety] viewLog called but Scene_QuestLog not available');
            };
        }

        if (typeof quests.catStatus !== 'function') {
            quests.catStatus = function(id, status) {
                var state = ensureQuestState();
                if (state) state.categoryActive[id] = status;
            };
        }

        if (typeof quests.activate !== 'function') {
            quests.activate = function(id, hidePopup) {
                if (typeof $gameSystem !== 'undefined' && $gameSystem._quests && $gameSystem._quests.quest[id]) {
                    $gameSystem._quests.quest[id]._status = 0;
                }
            };
        }

        if (typeof quests.complete !== 'function') {
            quests.complete = function(id, hidePopup) {
                if (typeof $gameSystem !== 'undefined' && $gameSystem._quests && $gameSystem._quests.quest[id]) {
                    $gameSystem._quests.quest[id]._status = 1;
                }
            };
        }

        if (typeof quests.fail !== 'function') {
            quests.fail = function(id, hidePopup) {
                if (typeof $gameSystem !== 'undefined' && $gameSystem._quests && $gameSystem._quests.quest[id]) {
                    $gameSystem._quests.quest[id]._status = 2;
                }
            };
        }

        if (typeof quests.track !== 'function') {
            quests.track = function(id) {
                var state = ensureQuestState();
                if (state) state.tracked = id;
            };
        }

        if (typeof quests.isTracked !== 'function') {
            quests.isTracked = function() {
                if (typeof $gameSystem !== 'undefined' && $gameSystem._quests) {
                    return $gameSystem._quests.tracked || 0;
                }
                return 0;
            };
        }

        if (typeof quests.objective !== 'function') {
            quests.objective = function(id, objId, status) {
                if (typeof $gameSystem !== 'undefined' && $gameSystem._quests && $gameSystem._quests.quest[id]) {
                    $gameSystem._quests.quest[id]._objectives[objId] = status;
                }
            };
        }

        if (typeof quests.status !== 'function') {
            quests.status = function(id) {
                if (typeof $gameSystem !== 'undefined' && $gameSystem._quests && $gameSystem._quests.quest[id]) {
                    return $gameSystem._quests.quest[id]._status;
                }
                return -1;
            };
        }

        if (typeof quests.resolution !== 'function') {
            quests.resolution = function(id, index) {
                if (typeof $gameSystem !== 'undefined' && $gameSystem._quests && $gameSystem._quests.quest[id]) {
                    $gameSystem._quests.quest[id]._resolution = index;
                }
            };
        }

        if (typeof quests.removeQuest !== 'function') {
            quests.removeQuest = function(id) {
                if (typeof $gameSystem !== 'undefined' && $gameSystem._quests && $gameSystem._quests.quest[id]) {
                    $gameSystem._quests.quest[id]._status = -1;
                }
            };
        }

        console.log('[GalvQuestSafety] Galv.QUEST safety stubs applied');
    }

    patchGalvQuest();
    patchDataManager();
    patchQuestScene();
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', patchGalvQuest);
        document.addEventListener('DOMContentLoaded', patchDataManager);
        document.addEventListener('DOMContentLoaded', patchQuestScene);
    }
})();
