(() => {
  'use strict';

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));
  const dialog = $('#walletDialog');
  const walletButton = $('#walletButton');
  const walletStoreKey = 'aquanaut-connected-wallet-name';
  let activeWallet = null;
  let activeAddress = '';

  const shorten = address => address && address.length > 10
    ? `${address.slice(0, 4)}...${address.slice(-4)}`
    : address || 'Connect wallet';

  const toast = message => {
    let element = $('#aquanautWalletToast');
    if (!element) {
      element = document.createElement('div');
      element.id = 'aquanautWalletToast';
      element.className = 'toast';
      element.setAttribute('role', 'status');
      document.body.append(element);
    }
    element.textContent = message;
    element.classList.add('show');
    window.clearTimeout(toast.timeout);
    toast.timeout = window.setTimeout(() => element.classList.remove('show'), 2600);
  };

  const safeSet = (key, value) => {
    try { localStorage.setItem(key, value); } catch (_) {}
  };

  const safeRemove = key => {
    try { localStorage.removeItem(key); } catch (_) {}
  };

  function detectedWallets() {
    const candidates = [
      { name: 'Phantom', provider: window.phantom?.solana, check: provider => provider?.isPhantom },
      { name: 'Solflare', provider: window.solflare, check: provider => provider?.isSolflare },
      { name: 'Backpack', provider: window.backpack?.solana, check: provider => provider?.isBackpack || provider?.isBackpackWallet }
    ];

    const seen = new Set();
    return candidates.filter(item => {
      if (!item.provider || !item.check(item.provider) || seen.has(item.provider)) return false;
      seen.add(item.provider);
      return true;
    });
  }

  function showDialog() {
    if (!dialog) return;
    if (typeof dialog.showModal === 'function' && !dialog.open) dialog.showModal();
    else dialog.setAttribute('open', '');
  }

  function closeDialog() {
    if (!dialog) return;
    if (typeof dialog.close === 'function' && dialog.open) dialog.close();
    else dialog.removeAttribute('open');
  }

  function updateWalletButton() {
    if (!walletButton) return;
    walletButton.textContent = activeAddress ? shorten(activeAddress) : 'Connect wallet';
    walletButton.setAttribute('aria-label', activeAddress ? `Wallet connected: ${shorten(activeAddress)}` : 'Connect a Solana wallet');
    walletButton.classList.toggle('wallet-is-connected', Boolean(activeAddress));
  }

  async function copyAddress() {
    if (!activeAddress) return;
    try {
      await navigator.clipboard.writeText(activeAddress);
      toast('Wallet address copied');
      return;
    } catch (_) {}

    const field = document.createElement('textarea');
    field.value = activeAddress;
    field.setAttribute('readonly', '');
    field.style.position = 'fixed';
    field.style.opacity = '0';
    document.body.append(field);
    field.select();
    try {
      document.execCommand('copy');
      toast('Wallet address copied');
    } catch (_) {
      toast('Copy is unavailable in this browser');
    }
    field.remove();
  }

  function connectedView() {
    dialog.innerHTML = `
      <button class="dialog-close" id="walletClose" type="button" aria-label="Close wallet menu">×</button>
      <p class="kicker">Wallet connected</p>
      <h2>${shorten(activeAddress)}</h2>
      <p>Your wallet is connected for this browser session. AQUANAUT does not request a transaction or signature to play.</p>
      <div class="aquanaut-wallet-actions">
        <button class="primary-action button-action" id="walletProfile" type="button">Explorer profile</button>
        <button class="secondary-action button-action" id="walletCopy" type="button">Copy address</button>
        <button class="wallet-disconnect" id="walletDisconnect" type="button">Disconnect wallet</button>
      </div>
    `;

    $('#walletClose', dialog)?.addEventListener('click', closeDialog);
    $('#walletCopy', dialog)?.addEventListener('click', copyAddress);
    $('#walletProfile', dialog)?.addEventListener('click', () => {
      closeDialog();
      location.hash = 'profile';
    });
    $('#walletDisconnect', dialog)?.addEventListener('click', disconnectWallet);
  }

  function disconnectedView() {
    const wallets = detectedWallets();
    const choices = wallets.length
      ? wallets.map((wallet, index) => `<button class="wallet-choice" data-wallet-index="${index}" type="button">Connect ${wallet.name}</button>`).join('')
      : `<p class="wallet-empty">No supported Solana wallet was detected. Install Phantom, Solflare, or Backpack, then reopen this menu.</p>
         <div class="wallet-install-links">
           <a href="https://phantom.app/download" target="_blank" rel="noreferrer">Install Phantom</a>
           <a href="https://solflare.com/download" target="_blank" rel="noreferrer">Install Solflare</a>
           <a href="https://backpack.app/download" target="_blank" rel="noreferrer">Install Backpack</a>
         </div>`;

    dialog.innerHTML = `
      <button class="dialog-close" id="walletClose" type="button" aria-label="Close wallet connection">×</button>
      <p class="kicker">Solana wallet</p>
      <h2>Connect as an explorer.</h2>
      <p>Choose an installed wallet to connect your public Solana address. Treasure Dive remains playable without a wallet.</p>
      <div class="wallet-choice-list">${choices}</div>
    `;

    $('#walletClose', dialog)?.addEventListener('click', closeDialog);
    $$('[data-wallet-index]', dialog).forEach(button => {
      button.addEventListener('click', () => {
        const wallet = wallets[Number(button.dataset.walletIndex)];
        connectWallet(wallet);
      });
    });
  }

  function renderWalletDialog() {
    if (!dialog) return;
    if (activeAddress) connectedView();
    else disconnectedView();
  }

  async function connectWallet(wallet) {
    if (!wallet?.provider) return;

    const choiceButtons = $$('[data-wallet-index]', dialog);
    choiceButtons.forEach(button => { button.disabled = true; });
    const selected = choiceButtons.find(button => Number(button.dataset.walletIndex) === detectedWallets().findIndex(item => item.provider === wallet.provider));
    if (selected) selected.textContent = 'Connecting...';

    try {
      const response = await wallet.provider.connect();
      const key = response?.publicKey || wallet.provider.publicKey;
      const address = typeof key?.toBase58 === 'function' ? key.toBase58() : String(key || '');
      if (!address || address === 'null' || address === 'undefined') throw new Error('Wallet did not provide a public address');

      activeWallet = wallet;
      activeAddress = address;
      safeSet(walletStoreKey, wallet.name);
      bindWalletEvents(wallet);
      updateWalletButton();
      connectedView();
      toast(`${wallet.name} connected`);
    } catch (error) {
      const rejected = error?.code === 4001 || /reject|cancel/i.test(error?.message || '');
      disconnectedView();
      toast(rejected ? 'Wallet connection was cancelled' : 'Wallet connection failed. Try again.');
    }
  }

  async function disconnectWallet() {
    try {
      await activeWallet?.provider?.disconnect?.();
    } catch (_) {}

    activeWallet = null;
    activeAddress = '';
    safeRemove(walletStoreKey);
    updateWalletButton();
    disconnectedView();
    toast('Wallet disconnected');
  }

  function bindWalletEvents(wallet) {
    const provider = wallet.provider;
    if (!provider?.on) return;

    provider.on('disconnect', () => {
      activeWallet = null;
      activeAddress = '';
      safeRemove(walletStoreKey);
      updateWalletButton();
      if (dialog?.open) disconnectedView();
      toast('Wallet disconnected');
    });

    provider.on('accountChanged', key => {
      const address = typeof key?.toBase58 === 'function' ? key.toBase58() : String(key || '');
      if (!address || address === 'null' || address === 'undefined') {
        disconnectWallet();
        return;
      }
      activeAddress = address;
      updateWalletButton();
      if (dialog?.open) connectedView();
      toast('Wallet account changed');
    });
  }

  function restoreVisibleConnection() {
    let savedName = '';
    try { savedName = localStorage.getItem(walletStoreKey) || ''; } catch (_) {}
    if (!savedName) return;

    const wallet = detectedWallets().find(item => item.name === savedName);
    const key = wallet?.provider?.publicKey;
    const address = typeof key?.toBase58 === 'function' ? key.toBase58() : '';
    if (!wallet || !wallet.provider?.isConnected || !address) return;

    activeWallet = wallet;
    activeAddress = address;
    bindWalletEvents(wallet);
    updateWalletButton();
  }

  function installStyles() {
    if ($('#aquanautWalletStyles')) return;
    const style = document.createElement('style');
    style.id = 'aquanautWalletStyles';
    style.textContent = `
      .wallet-choice-list,.aquanaut-wallet-actions{display:grid;gap:.65rem;margin-top:1.25rem}
      .wallet-choice,.wallet-disconnect{min-height:50px;padding:.75rem 1rem;border:1px solid #49736d;background:#102b30;color:#edf8f5;cursor:pointer;text-align:left}
      .wallet-choice:hover{border-color:#73e4cf;background:#16383a}
      .wallet-disconnect{color:#ff9b90;border-color:#884e49}
      .wallet-empty{margin-top:1.2rem}.wallet-install-links{display:flex;flex-wrap:wrap;gap:.7rem;margin-top:1rem}.wallet-install-links a{color:#75e3ce}
      .wallet-is-connected{border-color:#63dfc9!important;color:#a4f5e5!important}
    `;
    document.head.append(style);
  }

  function init() {
    if (!dialog || !walletButton) return;
    installStyles();
    updateWalletButton();
    restoreVisibleConnection();

    document.addEventListener('click', event => {
      const trigger = event.target.closest('#walletButton');
      if (!trigger) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      renderWalletDialog();
      showDialog();
    }, true);
  }

  init();
})();
