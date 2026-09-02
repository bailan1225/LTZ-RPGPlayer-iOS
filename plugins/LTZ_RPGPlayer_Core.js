/*:
 * @plugindesc LTZ RPG Player Core - RPG Maker MV/MZ iOS Player
 * @author LTZ
 * @help This plugin provides core functionality for the LTZ RPG Player.
 */

var Imported = Imported || {};
Imported.LTZ_RPGPlayer = true;

var LTZ = LTZ || {};
LTZ.RPGPlayer = LTZ.RPGPlayer || {};

(function() {
  'use strict';
  
  // 游戏配置
  LTZ.RPGPlayer.Config = {
    appId: 'com.ltz.rpgplayer',
    version: '1.0.0',
    supportedFormats: ['MV', 'MZ'],
    maxGames: 50
  };
  
  // 本地存储管理
  LTZ.RPGPlayer.Storage = {
    getKey: function() {
      return 'ltz_rpg_games';
    },
    
    getGames: function() {
      try {
        var data = localStorage.getItem(this.getKey());
        return data ? JSON.parse(data) : [];
      } catch (e) {
        return [];
      }
    },
    
    saveGames: function(games) {
      try {
        localStorage.setItem(this.getKey(), JSON.stringify(games));
        return true;
      } catch (e) {
        return false;
      }
    },
    
    addGame: function(game) {
      var games = this.getGames();
      if (games.length >= LTZ.RPGPlayer.Config.maxGames) {
        return false;
      }
      game.id = Date.now();
      game.addedAt = new Date().toISOString();
      games.push(game);
      return this.saveGames(games);
    },
    
    removeGame: function(id) {
      var games = this.getGames();
      games = games.filter(function(g) { return g.id !== id; });
      return this.saveGames(games);
    },
    
    updateGame: function(id, updates) {
      var games = this.getGames();
      var game = games.find(function(g) { return g.id === id; });
      if (game) {
        Object.assign(game, updates);
        return this.saveGames(games);
      }
      return false;
    }
  };
  
  // 游戏检测
  LTZ.RPGPlayer.GameDetector = {
    detectFormat: function(url) {
      if (!url) return null;
      
      // 检测 MZ 格式
      if (url.includes('/rpg_managers/') || 
          url.toLowerCase().includes('mv2') ||
          url.toLowerCase().includes('rpgmanagers')) {
        return 'MZ';
      }
      
      // 检测 MV 格式
      if (url.includes('/js/') || 
          url.toLowerCase().includes('rpgmaker') ||
          url.includes('rtp_')) {
        return 'MV';
      }
      
      // 默认尝试 MZ
      return 'MZ';
    },
    
    extractName: function(url) {
      if (!url) return '未命名游戏';
      
      var parts = url.split('/');
      var name = parts[parts.length - 1] || '未命名游戏';
      
      // 移除扩展名
      name = name.replace(/\.[^.]*$/, '');
      
      return name || '未命名游戏';
    }
  };
  
  // iOS 桥接
  LTZ.RPGPlayer.IOSBridge = {
    isIOS: false,
    
    init: function() {
      this.isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      
      if (this.isIOS && window.Capacitor) {
        console.log('Capacitor detected');
      }
    },
    
    openFilePicker: function(callback) {
      if (this.isIOS && window.Capacitor) {
        // 使用 Capacitor 的文件选择器
        window.Capacitor.Plugins.Filesystem?.requestPermissions().then(function() {
          // 实现文件选择逻辑
        });
      } else {
        // Web fallback
        callback(null);
      }
    }
  };
  
  // 初始化
  LTZ.RPGPlayer.IOSBridge.init();
  
  console.log('LTZ RPG Player v' + LTZ.RPGPlayer.Config.version + ' initialized');
})();