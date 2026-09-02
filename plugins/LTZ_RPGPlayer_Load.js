/*:
 * @plugindesc LTZ RPG Player Load - Game Loading Handler
 * @author LTZ
 */

var LTZ = LTZ || {};
LTZ.RPGPlayer = LTZ.RPGPlayer || {};

(function() {
  'use strict';
  
  LTZ.RPGPlayer.Load = {
    iframe: null,
    loading: false,
    
    init: function() {
      this.iframe = document.getElementById('ltz-game-frame');
      
      if (this.iframe) {
        this.bindEvents();
      }
    },
    
    bindEvents: function() {
      var self = this;
      
      // 监听游戏加载事件
      document.addEventListener('ltz:loadgame', function(e) {
        self.loadGame(e.detail);
      });
    },
    
    loadGame: function(game) {
      if (!this.iframe || this.loading) return;
      
      this.loading = true;
      this.showLoading();
      
      // 设置 iframe 源
      this.iframe.src = game.path;
      
      // 监听加载完成
      this.iframe.onload = function() {
        self.loading = false;
        self.hideLoading();
      };
      
      // 超时处理
      setTimeout(function() {
        if (self.loading) {
          self.loading = false;
          self.hideLoading();
        }
      }, 10000);
    },
    
    showLoading: function() {
      var loading = document.getElementById('ltz-loading');
      if (loading) {
        loading.classList.add('active');
      }
    },
    
    hideLoading: function() {
      var loading = document.getElementById('ltz-loading');
      if (loading) {
        loading.classList.remove('active');
      }
    }
  };
  
  // 初始化
  document.addEventListener('DOMContentLoaded', function() {
    LTZ.RPGPlayer.Load.init();
  });
})();