/* Open the existing playable world once per page load. Its existing exit control returns to the menus. */
(() => {
  'use strict';
  function enterWorld() {
    const play = document.getElementById('westernPlayBtn');
    const top = document.querySelector('.ww-top');
    if (top) {
      const menu = document.createElement('details');
      menu.className = 'world-activity-menu';
      const summary = document.createElement('summary');
      summary.textContent = 'Activities & places';
      const items = document.createElement('div');
      items.className = 'world-activity-items';
      for (const button of [...top.querySelectorAll(':scope > button:not(.ww-close)')]) items.append(button);
      menu.append(summary, items); top.append(menu);
      items.addEventListener('click',event=>{if(event.target.closest('button'))menu.open=false;});
    }
    document.querySelectorAll('.ww-finalhud,.ww-progress,.ww-questhud').forEach(panel => panel.hidden = true);
    if (play) play.click();
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', enterWorld, { once: true });
  } else {
    enterWorld();
  }
})();
