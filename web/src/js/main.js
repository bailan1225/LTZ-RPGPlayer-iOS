(function() {
  // 本地存储
  const STORAGE_KEY = 'ltz_rpg_games';
  
  // DOM 元素
  const gameUrlInput = document.getElementById('gameUrl');
  const loadBtn = document.getElementById('loadBtn');
  const gamesList = document.getElementById('gamesList');
  const gameContainer = document.getElementById('gameContainer');
  const loading = document.getElementById('loading');
  const gameFrame = document.getElementById('gameFrame');
  
  // 获取已保存的游戏列表
  function getGames() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  }
  
  // 保存游戏列表
  function saveGames(games) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(games));
  }
  
  // 渲染游戏列表
  function renderGames() {
    const games = getGames();
    
    if (games.length === 0) {
      gamesList.innerHTML = '<div class="empty-tip">暂无游戏，添加游戏路径即可开始</div>';
      return;
    }
    
    gamesList.innerHTML = games.map((game, index) => `
      <div class="game-item" data-index="${index}">
        <span class="icon">${game.type === 'MZ' ? '🎲' : '🗡️'}</span>
        <div class="info">
          <div class="name">${game.name}</div>
          <div class="path">${game.path}</div>
        </div>
        <button class="delete-btn" data-delete="${index}">✕</button>
      </div>
    `).join('');
    
    // 绑定事件
    gamesList.querySelectorAll('.game-item').forEach(item => {
      item.addEventListener('click', (e) => {
        if (e.target.classList.contains('delete-btn')) return;
        const index = parseInt(item.dataset.index);
        loadGame(index);
      });
    });
    
    gamesList.querySelectorAll('.delete-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        deleteGame(parseInt(btn.dataset.delete));
      });
    });
  }
  
  // 加载游戏
  function loadGame(index) {
    const games = getGames();
    const game = games[index];
    if (!game) return;
    
    loading.classList.remove('hidden');
    gameContainer.classList.add('active');
    
    // 设置 iframe 源
    gameFrame.src = game.path;
    
    // 隐藏加载提示
    gameFrame.onload = () => {
      loading.classList.add('hidden');
    };
    
    // 超时处理
    setTimeout(() => {
      loading.classList.add('hidden');
    }, 5000);
  }
  
  // 添加游戏
  function addGame() {
    const url = gameUrlInput.value.trim();
    if (!url) {
      alert('请输入游戏路径');
      return;
    }
    
    // 检测游戏类型
    const isMZ = url.includes('/rpg_managers/') || url.toLowerCase().includes('mv2');
    const type = isMZ ? 'MZ' : 'MV';
    
    // 提取游戏名称
    const urlParts = url.split('/');
    const name = urlParts[urlParts.length - 1] || '未命名游戏';
    
    const games = getGames();
    games.push({
      name: name,
      path: url,
      type: type,
      addedAt: Date.now()
    });
    
    saveGames(games);
    renderGames();
    gameUrlInput.value = '';
    
    // 自动加载
    loadGame(games.length - 1);
  }
  
  // 删除游戏
  function deleteGame(index) {
    if (!confirm('确定删除这个游戏吗？')) return;
    
    const games = getGames();
    games.splice(index, 1);
    saveGames(games);
    renderGames();
  }
  
  // 绑定事件
  loadBtn.addEventListener('click', addGame);
  
  gameUrlInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') addGame();
  });
  
  // 初始化
  renderGames();
  
  // 检查 iOS 环境
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  if (isIOS) {
    document.body.classList.add('ios');
  }
})();