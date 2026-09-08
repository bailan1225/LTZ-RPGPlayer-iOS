// RPG Player 作弊器注入脚本（RPG Maker MV / MZ 通用）
// 通过浮层面板 + 对游戏对象的直接操作实现单机作弊
(function () {
  "use strict";
  if (window.__rpgCheatInjected) return;
  window.__rpgCheatInjected = true;

  var cheat = {
    visible: false,
    noEncounter: false,
    invincible: false,
    through: false,
    oneHit: false,
    enemyDamageMult: 1,
    speed: 1
  };

  // ---------- 游戏对象操作（仅在场景就绪时可用） ----------

  function ready() {
    return !!(window.$gameParty && window.$gameParty.members);
  }

  function toast(msg) {
    var box = document.getElementById("rpgcheat-toast");
    if (!box) return;
    box.textContent = msg;
    box.style.opacity = "1";
    setTimeout(function () { box.style.opacity = "0"; }, 1500);
  }

  function cheatGold() {
    if (!ready()) { toast("未进入游戏"); return; }
    $gameParty.gainGold(10000);
    toast("金钱 +10000（当前 " + $gameParty.gold() + "）");
  }

  function cheatGoldMax() {
    if (!ready()) { toast("未进入游戏"); return; }
    $gameParty._gold = 999999999;
    toast("金钱 已改为 999999999");
  }

  function cheatHeal() {
    if (!ready()) { toast("未进入游戏"); return; }
    $gameParty.members().forEach(function (a) { a.recoverAll(); });
    toast("全员已恢复");
  }

  function cheatMaxLevel() {
    if (!ready()) { toast("未进入游戏"); return; }
    $gameParty.members().forEach(function (a) {
      if (a.isActor()) {
        a.changeLevel(a.maxLevel(), true);
        a.recoverAll();
      }
    });
    toast("全员满级");
  }

  function cheatAllItems() {
    if (!ready()) { toast("未进入游戏"); return; }
    var n = 0;
    for (var i = 1; i < $dataItems.length; i++) {
      var it = $dataItems[i];
      if (it && it.name && it.name.length > 0) {
        $gameParty.gainItem(it, 99);
        n++;
      }
    }
    for (var j = 1; j < $dataWeapons.length; j++) {
      var w = $dataWeapons[j];
      if (w && w.name && w.name.length > 0) { $gameParty.gainItem(w, 99); n++; }
    }
    for (var k = 1; k < $dataArmors.length; k++) {
      var ar = $dataArmors[k];
      if (ar && ar.name && ar.name.length > 0) { $gameParty.gainItem(ar, 99); n++; }
    }
    toast("已添加 " + n + " 种道具/装备 x99");
  }

  function toggleNoEncounter() {
    cheat.noEncounter = !cheat.noEncounter;
    applyEncounterPatch();
    toast(cheat.noEncounter ? "不遇敌：开" : "不遇敌：关");
  }

  function toggleInvincible() {
    cheat.invincible = !cheat.invincible;
    toast(cheat.invincible ? "无敌：开" : "无敌：关");
  }

  function toggleThrough() {
    cheat.through = !cheat.through;
    applyMovementPatches();
    toast(cheat.through ? "穿墙：开" : "穿墙：关");
  }

  function toggleOneHit() {
    cheat.oneHit = !cheat.oneHit;
    toast(cheat.oneHit ? "一击必杀：开" : "一击必杀：关");
  }

  function cheatWin() {
    if (!ready() || !window.SceneManager) { toast("未进入游戏"); return; }
    try {
      var s = SceneManager._scene;
      var name = (s && s.constructor && s.constructor.name) || "";
      if (name.indexOf("Battle") < 0) { toast("不在战斗中"); return; }
      $gameTroop.members().forEach(function (e) {
        if (e && typeof e.die === "function" && e.isAlive()) e.die();
      });
      $gameParty.members().forEach(function (a) {
        if (a && typeof a.clearActions === "function") a.clearActions();
      });
      toast("战斗已直接胜利");
    } catch (err) { toast("出错: " + err.message); }
  }

  function cheatEscape() {
    if (!ready() || !window.SceneManager) { toast("未进入游戏"); return; }
    try {
      var s = SceneManager._scene;
      var name = (s && s.constructor && s.constructor.name) || "";
      if (name.indexOf("Battle") < 0) { toast("不在战斗中"); return; }
      s.processEscape();
      toast("已逃离战斗");
    } catch (err) { toast("出错: " + err.message); }
  }

  // 设置变量（ArkRPG 同款：直接改 $gameVariables）
  function cheatVariable() {
    if (!ready()) { toast("未进入游戏"); return; }
    var input = prompt("设置变量\n格式：变量ID:数值（如 5:100）");
    if (!input) return;
    var parts = input.split(":");
    var id = parseInt(parts[0], 10);
    var val = parseFloat(parts[1]);
    if (isNaN(id) || isNaN(val)) { toast("格式错误，应为 ID:数值"); return; }
    if (window.$gameVariables && typeof $gameVariables.setValue === "function") {
      $gameVariables.setValue(id, val);
      toast("变量 " + id + " = " + val);
    } else { toast("变量系统不可用"); }
  }

  // 切换开关（ArkRPG 同款：直接改 $gameSwitches）
  function cheatSwitch() {
    if (!ready()) { toast("未进入游戏"); return; }
    var input = prompt("切换开关\n输入开关ID（如 12）");
    if (!input) return;
    var id = parseInt(input, 10);
    if (isNaN(id)) { toast("格式错误，应为数字"); return; }
    if (window.$gameSwitches && typeof $gameSwitches.value === "function") {
      var cur = !!$gameSwitches.value(id);
      $gameSwitches.setValue(id, !cur);
      toast("开关 " + id + " → " + (cur ? "关" : "开"));
    } else { toast("开关系统不可用"); }
  }

  // 快速存档 / 快速读档（槽位 0；对应 mtool 存档快捷键，MV/MZ 通用）
  function quickSave() {
    if (!ready()) { toast("未进入游戏"); return; }
    try {
      if (window.DataManager && typeof DataManager.saveGame === "function") {
        DataManager.saveGame(0);
        toast("已快速存档（槽位0）");
      } else { toast("存档不可用"); }
    } catch (err) { toast("存档失败: " + err.message); }
  }

  function quickLoad() {
    if (!ready()) { toast("未进入游戏"); return; }
    try {
      if (window.DataManager && typeof DataManager.loadGame === "function") {
        DataManager.loadGame(0);
        if (window.SceneManager && typeof SceneManager.goto === "function") {
          SceneManager.goto(Scene_Map);
        }
        toast("已读档（槽位0）");
      } else { toast("读档不可用"); }
    } catch (err) { toast("读档失败: " + err.message); }
  }

  function cycleEnemyDamage() {
    var opts = [1, 10, 100];
    var idx = opts.indexOf(cheat.enemyDamageMult);
    cheat.enemyDamageMult = opts[(idx + 1) % opts.length];
    applyBattlePatches();
    toast("对敌伤害 x" + cheat.enemyDamageMult);
  }

  function cycleSpeed() {
    var opts = [1, 2, 4];
    var idx = opts.indexOf(cheat.speed);
    cheat.speed = opts[(idx + 1) % opts.length];
    if (cheat.speed === 1) { removeSpeedWrapper(); } else { installSpeedWrapper(); }
    toast("游戏速度 x" + cheat.speed);
  }

  // ---------- 补丁 ----------

  function applyEncounterPatch() {
    if (!window.Game_Player) return;
    if (window.__rpgCheatEncounterPatched) return;
    var origMV = Game_Player.prototype.updateEncounterCount;
    var origMZ = Game_Player.prototype.updateEncounter;
    if (typeof origMV === "function") {
      Game_Player.prototype.updateEncounterCount = function () {
        if (cheat.noEncounter) return;
        return origMV.apply(this, arguments);
      };
    } else if (typeof origMZ === "function") {
      Game_Player.prototype.updateEncounter = function () {
        if (cheat.noEncounter) return;
        return origMZ.apply(this, arguments);
      };
    }
    window.__rpgCheatEncounterPatched = true;
  }

  function applyBattlePatches() {
    if (!window.Game_Battler) return;
    if (window.__rpgCheatBattlePatched) return;
    var origGainHp = Game_Battler.prototype.gainHp;
    if (typeof origGainHp === "function") {
      Game_Battler.prototype.gainHp = function (value) {
        if (cheat.invincible && this.isActor() && value < 0) value = 0;
        if (cheat.oneHit && this.isEnemy() && value < 0) value = -99999999;
        if (this.isEnemy() && value < 0 && cheat.enemyDamageMult !== 1) {
          value = Math.floor(value * cheat.enemyDamageMult);
        }
        return origGainHp.call(this, value);
      };
    }
    window.__rpgCheatBattlePatched = true;
  }

  // 穿墙：绕过角色/事件碰撞判定
  function applyMovementPatches() {
    if (!window.Game_CharacterBase) return;
    if (window.__rpgCheatMovePatched) return;
    var origCollide = Game_CharacterBase.prototype.isCollidedWithCharacters;
    if (typeof origCollide === "function") {
      Game_CharacterBase.prototype.isCollidedWithCharacters = function (x, y) {
        if (cheat.through) return false;
        return origCollide.call(this, x, y);
      };
    }
    window.__rpgCheatMovePatched = true;
  }

  // 速度补丁：仅在开启加速时包装 requestAnimationFrame，速度回到 1x 立即恢复原样，
  // 默认状态完全不介入游戏帧循环
  var _origRAF = null;
  var _rafWrapped = false;

  function installSpeedWrapper() {
    if (_rafWrapped) return;
    if (typeof window.requestAnimationFrame !== "function") return;
    _origRAF = window.requestAnimationFrame;
    window.requestAnimationFrame = function (cb) {
      return _origRAF.call(window, function (t) {
        var times = cheat.speed;
        if (times > 1) {
          for (var i = 0; i < times; i++) { try { cb(t); } catch (e) {} }
        } else {
          cb(t);
        }
      });
    };
    _rafWrapped = true;
  }

  function removeSpeedWrapper() {
    if (_rafWrapped && _origRAF) {
      window.requestAnimationFrame = _origRAF;
      _rafWrapped = false;
    }
  }

  // ---------- 浮层面板 ----------

  function buildPanel() {
    var el = document.createElement("div");
    el.id = "rpgcheat-panel";
    el.style.cssText = "position:fixed;right:8px;top:12vh;width:168px;z-index:99999;" +
      "background:rgba(20,18,40,0.92);border:1px solid #555;border-radius:10px;padding:8px;" +
      "font-family:-apple-system,sans-serif;font-size:13px;color:#eee;display:none;box-shadow:0 4px 16px rgba(0,0,0,.5)";
    var title = document.createElement("div");
    title.textContent = "作弊器";
    title.style.cssText = "text-align:center;font-weight:bold;margin-bottom:6px;color:#ffd166";
    el.appendChild(title);

    var items = [
      ["金钱 +10000", cheatGold],
      ["金钱改满", cheatGoldMax],
      ["全员恢复", cheatHeal],
      ["全员满级", cheatMaxLevel],
      ["全道具/装备", cheatAllItems],
      ["不遇敌 切换", toggleNoEncounter],
      ["无敌 切换", toggleInvincible],
      ["穿墙 切换", toggleThrough],
      ["一击必杀 切换", toggleOneHit],
      ["战斗直接胜利", cheatWin],
      ["战斗直接逃跑", cheatEscape],
      ["设置变量", cheatVariable],
      ["切换开关", cheatSwitch],
      ["快速存档", quickSave],
      ["快速读档", quickLoad],
      ["对敌伤害 x", cycleEnemyDamage],
      ["游戏速度 x", cycleSpeed]
    ];
    items.forEach(function (pair) {
      var b = document.createElement("button");
      b.textContent = pair[0];
      b.style.cssText = "display:block;width:100%;margin:3px 0;padding:6px 0;border:none;border-radius:6px;" +
        "background:#3a3a55;color:#fff;font-size:13px;";
      b.addEventListener("click", function (e) {
        e.stopPropagation();
        try { pair[1](); } catch (err) { toast("出错: " + err.message); }
      });
      el.appendChild(b);
    });

    var close = document.createElement("button");
    close.textContent = "关闭";
    close.style.cssText = "display:block;width:100%;margin:6px 0 0;padding:6px 0;border:none;border-radius:6px;" +
      "background:#8a2f2f;color:#fff;font-size:13px;";
    close.addEventListener("click", function (e) { e.stopPropagation(); window.RPGCheat.hide(); });
    el.appendChild(close);

    var toastEl = document.createElement("div");
    toastEl.id = "rpgcheat-toast";
    toastEl.style.cssText = "position:fixed;top:12px;left:50%;transform:translateX(-50%);z-index:100000;" +
      "background:rgba(0,0,0,.8);color:#fff;padding:6px 14px;border-radius:8px;font-size:13px;opacity:0;" +
      "transition:opacity .3s;pointer-events:none;max-width:80vw;text-align:center";
    toastEl.textContent = "";

    document.documentElement.appendChild(el);
    document.documentElement.appendChild(toastEl);
  }

  function show() {
    cheat.visible = true;
    var p = document.getElementById("rpgcheat-panel");
    if (p) p.style.display = "block";
  }
  function hide() {
    cheat.visible = false;
    var p = document.getElementById("rpgcheat-panel");
    if (p) p.style.display = "none";
  }
  function toggle() { if (cheat.visible) hide(); else show(); }

  // ---------- 初始化 ----------

  (function poll() {
    if (window.document && document.documentElement && !document.getElementById("rpgcheat-panel")) {
      try { buildPanel(); } catch (e) {}
    }
    applyEncounterPatch();
    applyBattlePatches();
    applyMovementPatches();
    if (!window.__rpgCheatInit) {
      window.__rpgCheatInit = true;
      setTimeout(poll, 500);
    }
  })();

  window.RPGCheat = {
    show: show,
    hide: hide,
    toggle: toggle,
    isVisible: function () { return cheat.visible; },
    getState: function () {
      return { noEncounter: cheat.noEncounter, invincible: cheat.invincible,
               through: cheat.through, oneHit: cheat.oneHit,
               enemyDamageMult: cheat.enemyDamageMult, speed: cheat.speed };
    }
  };
})();
