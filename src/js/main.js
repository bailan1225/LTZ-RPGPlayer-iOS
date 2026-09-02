function loadGame() {
  const url = document.getElementById('urlInput').value.trim();
  if (!url) return;
  
  // 添加协议前缀
  let fullUrl = url;
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    fullUrl = 'https://' + url;
  }
  
  document.getElementById('gameFrame').src = fullUrl;
}

// 回车键触发
document.addEventListener('DOMContentLoaded', function() {
  const input = document.getElementById('urlInput');
  if (input) {
    input.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') loadGame();
    });
  }
});