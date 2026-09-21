(() => {
  'use strict';

  const replacements = [
    ['Demo Mode: progress is saved on this device', 'Explorer progress is saved on this device'],
    ['Demo Mode', 'Explorer Mode'],
    ['Demo Explorer', 'Explorer'],
    ['Demo standings', 'Explorer standings'],
    ['Practice board', 'Explorer board'],
    ['fictional demo challengers', 'fictional challengers'],
    ['fictional demo opponents', 'fictional opponents'],
    ['No live or on-chain rankings are implied.', 'Rankings are local to this experience.'],
    ['Your local score is placed among fictional challengers.', 'Your score is placed among fictional challengers.'],
    ['Your local score is placed among fictional demo challengers. No live or on-chain rankings are implied.', 'Your score is placed among fictional challengers. Rankings are local to this experience.'],
    ['Local Aquanaut', 'Aquanaut'],
    ['Your expedition record on this device.', 'Your expedition record.'],
    ['local weekly best', 'weekly best'],
    ['local game statistics', 'expedition statistics'],
    ['game data stored on your device', 'game progress stored in this browser'],
    ['in this demo are game data stored on your device', 'are game progress stored in this browser'],
    ['Reset local demo progress', 'Reset expedition progress'],
    ['This clears XP, dives, artifacts, missions and rank progress saved by this browser.', 'This clears XP, dives, artifacts, missions and rank progress stored in this browser.'],
    ['The game remains playable in Demo Mode without a wallet or token.', 'The game remains playable without a wallet or token.'],
    ['Treasure Dive is a short risk-versus-reward expedition.', 'Treasure Dive is a short risk-versus-reward expedition.'],
    ['Your local score', 'Your score'],
    ['local progress', 'progress']
  ];

  function replaceText(node) {
    if (!node || node.nodeType !== Node.TEXT_NODE || !node.nodeValue.trim()) return;
    let value = node.nodeValue;
    replacements.forEach(([from, to]) => {
      value = value.replaceAll(from, to);
    });
    if (value !== node.nodeValue) node.nodeValue = value;
  }

  function clean(root = document.body) {
    const strip = document.querySelector('.demo-strip');
    if (strip) strip.remove();
    if (!root) return;
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(replaceText);

    document.querySelectorAll('[data-profile="rank"]').forEach(element => {
      if (element.textContent.trim() === 'Demo Explorer') element.textContent = 'Explorer';
    });
  }

  function init() {
    clean();
    const observer = new MutationObserver(records => {
      records.forEach(record => {
        if (record.type === 'characterData') replaceText(record.target);
        record.addedNodes.forEach(node => {
          if (node.nodeType === Node.TEXT_NODE) replaceText(node);
          if (node.nodeType === Node.ELEMENT_NODE) clean(node);
        });
      });
    });
    observer.observe(document.body, { childList: true, subtree: true, characterData: true });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
