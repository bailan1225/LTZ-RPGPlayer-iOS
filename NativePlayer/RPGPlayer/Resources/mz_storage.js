(function () {
  'use strict';
  // 适配/覆盖 MZ 的 StorageManager/DataManager 存档行为，优先使用 web 存储（localStorage）。
  // 注：不复制官方实现，仅提供最小可玩所需的替代方案，兼容现有 MV 策略与 iOS 环境。

  var KEY_PREFIX = 'ArkRPG:MZ:save:';
  var INFO_KEY = 'ArkRPG:MZ:info';

  function safeJSONParse(text) {
    try { return JSON.parse(text); } catch (_) { return null; }
  }

  function lsGet(key) {
    try { return window.localStorage.getItem(key); } catch (_) { return null; }
  }
  function lsSet(key, val) {
    try { window.localStorage.setItem(key, val); return true; } catch (_) { return false; }
  }
  function lsRemove(key) {
    try { window.localStorage.removeItem(key); return true; } catch (_) { return false; }
  }

  // 提供基本的 StorageManager 代理，不依赖文件系统。
  window.StorageManager = window.StorageManager || {};

  // 是否使用本地模式（在 iOS WebView 下视为非文件系统存储）
  window.StorageManager.isLocalMode = function () { return false; };

  // 保存对象（slotId 从 1 开始）；data 应为序列化友好的对象
  window.StorageManager.saveObject = async function (slotId, object) {
    var key = KEY_PREFIX + String(slotId);
    var payload = JSON.stringify(object);
    if (!lsSet(key, payload)) throw new Error('saveObject failed');
    // 更新 savefileInfo（用于存档列表显示）
    var info = safeJSONParse(lsGet(INFO_KEY)) || {};
    info[slotId] = { timestamp: Date.now(), size: payload.length };
    lsSet(INFO_KEY, JSON.stringify(info));
    return true;
  };

  window.StorageManager.loadObject = async function (slotId) {
    var key = KEY_PREFIX + String(slotId);
    var raw = lsGet(key);
    if (!raw) throw new Error('loadObject: empty');
    var obj = safeJSONParse(raw);
    if (obj == null) throw new Error('loadObject: parse error');
    return obj;
  };

  window.StorageManager.remove = function (slotId) {
    var key = KEY_PREFIX + String(slotId);
    lsRemove(key);
    var info = safeJSONParse(lsGet(INFO_KEY)) || {};
    delete info[slotId];
    lsSet(INFO_KEY, JSON.stringify(info));
  };

  window.StorageManager.exists = function (slotId) {
    return !!lsGet(KEY_PREFIX + String(slotId));
  };

  window.StorageManager.savefileInfo = function (slotId) {
    var info = safeJSONParse(lsGet(INFO_KEY)) || {};
    return info[slotId] || null;
  };

  // 兼容 DataManager 的基础钩子（如有调用）——仅提供占位，不复制实现
  window.DataManager = window.DataManager || {};
  if (typeof window.DataManager.extractSaveContents !== 'function') {
    window.DataManager.extractSaveContents = function (contents) {
      // 在 MZ 中该函数负责将存档内容加载回内存结构；此处不做细化，交由引擎自身。
      return contents;
    };
  }
})();
