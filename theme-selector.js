(() => {
  const switchSelector = '[data-theme-preference-switch="pill"]';
  const selectClass = 'overthinker-theme-select';
  const themes = ['light', 'dark', 'system'];

  function enhanceSwitch(group) {
    // Maple's semantic data attributes are an upstream DOM dependency.
    // Keep its buttons: their handlers own persistence and live system changes.
    const buttons = themes.map((theme) =>
      group.querySelector(`button[data-theme-preference-value="${theme}"]`),
    );
    if (buttons.some((button) => !button)) return;

    let select = group.querySelector(`select.${selectClass}`);
    if (!select) {
      select = document.createElement('select');
      select.className = selectClass;
      themes.forEach((theme) => select.add(new Option(theme, theme)));
      select.addEventListener('change', () => {
        group.querySelector(`button[data-theme-preference-value="${select.value}"]`)?.click();
      });
      group.append(select);
    }

    const korean = document.documentElement.lang.startsWith('ko');
    const labels = korean ? ['라이트', '다크', '시스템'] : ['Light', 'Dark', 'System'];
    select.setAttribute('aria-label', korean ? '테마' : 'Theme');
    Array.from(select.options).forEach((option, index) => {
      if (option.textContent !== labels[index]) option.textContent = labels[index];
    });
    const selected = buttons.find((button) => button.getAttribute('aria-pressed') === 'true');
    if (selected) select.value = selected.dataset.themePreferenceValue;
  }

  function enhanceWithin(element) {
    if (element.matches(switchSelector)) enhanceSwitch(element);
    element.querySelectorAll(switchSelector).forEach(enhanceSwitch);
  }

  // Mobile navigation is mounted on demand; route changes can replace the sidebar.
  const observer = new MutationObserver((records) => {
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
  });
  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['aria-pressed', 'lang'],
  });
  enhanceWithin(document.body);
})();
