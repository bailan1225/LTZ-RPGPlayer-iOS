(function() {
  const STORAGE_KEY = 'ltz_rpg_games';
  
  const gameUrlInput = document.getElementById('gameUrl');
  const loadBtn = document.getElementById('loadBtn');
  const gamesList = document.getElementById('gamesList');
  const gameContainer = document.getElementById('gameContainer');
  const loading = document.getElementById('loading');
  const gameFrame = document.getElementById('gameFrame');
  
  function getGames() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  }
  
  function saveGames(games) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(games));
  }
  
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
  
  function loadGame(index) {
    const games = getGames();
    const game = games[index];
    if (!game) return;
    
    loading.classList.remove('hidden');
    gameContainer.classList.add('active');
    
    gameFrame.src = game.path;
    
    gameFrame.onload = () => {
      loading.classList.add('hidden');
    };
    
    setTimeout(() => {
      loading.classList.add('hidden');
    }, 5000);
  }
  
  function addGame() {
    const url = gameUrlInput.value.trim();
    if (!url) {
      alert('请输入游戏路径');
      return;
    }
    
    const isMZ = url.includes('/rpg_managers/') || url.toLowerCase().includes('mv2');
    const type = isMZ ? 'MZ' : 'MV';
    
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
    
    loadGame(games.length - 1);
  }
  
  function deleteGame(index) {
    if (!confirm('确定删除这个游戏吗？')) return;
    
    const games = getGames();
    games.splice(index, 1);
    saveGames(games);
    renderGames();
  }
  
  loadBtn.addEventListener('click', addGame);
  
  gameUrlInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') addGame();
  });
  
  renderGames();
  
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  if (isIOS) {
    document.body.classList.add('ios');
  }
})();