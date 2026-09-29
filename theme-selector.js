(() => {
  const switchSelector = '[data-theme-preference-switch="pill"]';
  const themes = ['system', 'light', 'dark'];
  // Match port-web's ThemeDropdown Lucide icons without adding a React runtime.
  const paths = {
    system: '<rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8m-4-4v4"/>',
    light: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42"/>',
    dark: '<path d="M20.985 12.486A9 9 0 1 1 11.51 3.01a7 7 0 0 0 9.475 9.476Z"/>',
    check: '<path d="m20 6-11 11-5-5"/>',
  };
  let nextId = 0;

  function icon(name) {
    return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name]}</svg>`;
  }

  function mountMenu(group) {
    const wrapper = document.createElement('div');
    wrapper.className = 'ot-theme';
    const trigger = document.createElement('button');
    trigger.type = 'button';
    trigger.className = 'ot-theme-trigger';
    trigger.setAttribute('aria-haspopup', 'menu');
    trigger.setAttribute('aria-expanded', 'false');
    const menu = document.createElement('div');
    menu.className = 'ot-theme-menu';
    menu.id = `ot-theme-menu-${++nextId}`;
    menu.setAttribute('popover', 'auto');
    menu.setAttribute('role', 'menu');
    trigger.setAttribute('aria-controls', menu.id);
    const items = themes.map((theme) => {
      const item = document.createElement('button');
      item.type = 'button';
      item.className = 'ot-theme-option';
      item.setAttribute('role', 'menuitemradio');
      item.tabIndex = -1;
      item.innerHTML = `${icon(theme)}<span></span><span class="ot-theme-check">${icon('check')}</span>`;
      item.addEventListener('click', () => {
        // Maple's semantic attributes are an upstream dependency. Its native
        // handler remains the sole owner of persistence and theme resolution.
        group.querySelector(`button[data-theme-preference-value="${theme}"]`)?.click();
        menu.hidePopover();
        trigger.focus();
      });
      menu.append(item);
      return item;
    });
    function openMenu(last = false) {
      if (menu.matches(':popover-open')) return;
      menu.showPopover();
      const rect = trigger.getBoundingClientRect();
      menu.style.left = `${Math.max(8, Math.min(rect.right - menu.offsetWidth, innerWidth - menu.offsetWidth - 8))}px`;
      menu.style.top = `${Math.max(8, Math.min(rect.bottom + 8, innerHeight - menu.offsetHeight - 8))}px`;
      const selected = items.find((item) => item.getAttribute('aria-checked') === 'true');
      (last ? items.at(-1) : selected || items[0]).focus();
    }
    trigger.addEventListener('click', () => {
      if (menu.matches(':popover-open')) menu.hidePopover();
      else openMenu();
    });
    trigger.addEventListener('keydown', (event) => {
      if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        event.preventDefault();
        openMenu(event.key === 'ArrowUp');
      }
    });
    menu.addEventListener('toggle', () => {
      trigger.setAttribute('aria-expanded', String(menu.matches(':popover-open')));
    });
    menu.addEventListener('keydown', (event) => {
      const index = items.indexOf(document.activeElement);
      let next;
      if (event.key === 'ArrowDown') next = (index + 1) % items.length;
      if (event.key === 'ArrowUp') next = (index + items.length - 1) % items.length;
      if (event.key === 'Home') next = 0;
      if (event.key === 'End') next = items.length - 1;
      if (next !== undefined) {
        event.preventDefault();
        items[next].focus();
      }
      if (event.key === 'Escape') {
        event.preventDefault();
        event.stopPropagation();
        menu.hidePopover();
        trigger.focus();
      }
      if (event.key === 'Tab') {
        menu.hidePopover();
        trigger.focus();
      }
    });
    wrapper.append(trigger, menu);
    group.append(wrapper);
    return { trigger, menu, items };
  }

  const controls = new WeakMap();
  function enhanceSwitch(group) {
    if (!('showPopover' in HTMLElement.prototype)) return;
    const buttons = themes.map((theme) => group.querySelector(`button[data-theme-preference-value="${theme}"]`));
    if (buttons.some((button) => !button)) return;
    let control = controls.get(group);
    if (!control || !group.contains(control.trigger)) {
      control = mountMenu(group);
      controls.set(group, control);
    }
    const korean = document.documentElement.lang.startsWith('ko');
    const labels = korean ? ['시스템', '라이트', '다크'] : ['System', 'Light', 'Dark'];
    const selected = buttons.findIndex((button) => button.getAttribute('aria-pressed') === 'true');
    const current = selected < 0 ? 0 : selected;
    const label = `${korean ? '테마 선택' : 'Select theme'}: ${labels[current]}`;
    if (control.trigger.getAttribute('aria-label') !== label) {
      control.trigger.setAttribute('aria-label', label);
      control.trigger.title = label;
      control.trigger.innerHTML = icon(themes[current]);
    }
    control.menu.setAttribute('aria-label', korean ? '테마' : 'Theme');
    control.items.forEach((item, index) => {
      const text = item.querySelector('span');
      if (text.textContent !== labels[index]) text.textContent = labels[index];
      item.setAttribute('aria-checked', String(index === current));
    });
  }
  function enhanceWithin(element) {
    if (element.matches(switchSelector)) enhanceSwitch(element);
    element.querySelectorAll(switchSelector).forEach(enhanceSwitch);
  }
  // Mobile navigation mounts on demand; locale changes can replace the sidebar.
  new MutationObserver((records) => {
    for (const record of records) {
      if (record.type === 'attributes' && record.target === document.documentElement) {
        enhanceWithin(document.body);
        continue;
      }
      const group = record.target.closest(switchSelector);
      if (group) enhanceSwitch(group);
      for (const node of record.addedNodes) {
        if (node instanceof Element) enhanceWithin(node);
      }
    }
  }).observe(document.documentElement, {
    childList: true, subtree: true, attributes: true,
    attributeFilter: ['aria-pressed', 'lang'],
  });
  enhanceWithin(document.body);
})();