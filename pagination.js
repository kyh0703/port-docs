(() => {
  const selector = '[data-component-part="pagination-prev"]';
  function addTitle(link) {
    // Maple exposes the previous title only in its localized accessible label.
    const label = link.getAttribute('aria-label');
    const separator = label?.indexOf(':');
    if (separator === undefined || separator < 0) return;
    const title = label.slice(separator + 1).trim();
    if (!title) return;
    let text = link.querySelector('.ot-pagination-title');
    if (!text) {
      text = document.createElement('span');
      text.className = 'ot-pagination-title';
      text.setAttribute('aria-hidden', 'true');
      link.append(text);
    }
    if (text.textContent !== title) text.textContent = title;
  }
  function enhance(element) {
    if (element.matches(selector)) addTitle(element);
    element.querySelectorAll(selector).forEach(addTitle);
  }
  new MutationObserver((records) => {
    for (const record of records) {
      if (record.type === 'attributes' && record.target.matches(selector)) addTitle(record.target);
      for (const node of record.addedNodes) {
        if (node instanceof Element) enhance(node);
      }
    }
  }).observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['aria-label'] });
  enhance(document.body);
})();
