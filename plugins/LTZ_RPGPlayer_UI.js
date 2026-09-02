/*:
 * @plugindesc LTZ RPG Player UI - Game List and Loading Interface
 * @author LTZ
 */

var LTZ = LTZ || {};
LTZ.RPGPlayer = LTZ.RPGPlayer || {};

(function() {
  'use strict';
  
  LTZ.RPGPlayer.UI = {
    container: null,
    
    init: function() {
      this.container = document.getElementById('ltz-rpg-container');
      if (this.container) {
        this.renderGameList();
      }
    },
    
    renderGameList: function() {
      if (!this.container) return;
      
      var games = LTZ.RPGPlayer.Storage.getGames();
      
      var html = '<div class="ltz-game-list">';
      
      if (games.length === 0) {
        html += '<div class="ltz-empty">暂无游戏，请添加游戏路径</div>';
      } else {
        games.forEach(function(game) {
          html += '<div class="ltz-game-item" data-id="' + game.id + '">';
          html += '<span class="ltz-game-icon">' + (game.type === 'MZ' ? '🎲' : '🗡️') + '</span>';
          html += '<div class="ltz-game-info">';
          html += '<div class="ltz-game-name">' + game.name + '</div>';
          html += '<div class="ltz-game-path">' + game.path + '</div>';
          html += '</div>';
          html += '<button class="ltz-delete-btn" data-id="' + game.id + '">✕</button>';
          html += '</div>';
        });
      }
      
      html += '</div>';
      
      this.container.innerHTML = html;
      
      // 绑定事件
      this.bindEvents();
    },
    
    bindEvents: function() {
      var self = this;
      
      // 游戏点击
      this.container.addEventListener('click', function(e) {
        var item = e.target.closest('.ltz-game-item');
        if (item && !e.target.classList.contains('ltz-delete-btn')) {
          var id = parseInt(item.dataset.id);
          self.loadGame(id);
        }
        
        // 删除按钮
        if (e.target.classList.contains('ltz-delete-btn')) {
          var id = parseInt(e.target.dataset.id);
          self.deleteGame(id);
        }
      });
    },
    
    loadGame: function(id) {
      var games = LTZ.RPGPlayer.Storage.getGames();
      var game = games.find(function(g) { return g.id === id; });
      
      if (game) {
        // 触发游戏加载事件
        var event = new CustomEvent('ltz:loadgame', { detail: game });
        document.dispatchEvent(event);
      }
    },
    
    deleteGame: function(id) {
      if (confirm('确定删除这个游戏吗？')) {
        LTZ.RPGPlayer.Storage.removeGame(id);
        this.renderGameList();
      }
    },
    
    addGame: function(url) {
      var type = LTZ.RPGPlayer.GameDetector.detectFormat(url);
      var name = LTZ.RPGPlayer.GameDetector.extractName(url);
      
      var game = {
        name: name,
        path: url,
        type: type
      };
      
      if (LTZ.RPGPlayer.Storage.addGame(game)) {
        this.renderGameList();
        this.loadGame(game.id);
        return true;
      }
      return false;
    }
  };
  
  // 初始化
  document.addEventListener('DOMContentLoaded', function() {
    LTZ.RPGPlayer.UI.init();
  });
})();