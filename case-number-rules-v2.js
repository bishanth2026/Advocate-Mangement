(function () {
  'use strict';

  const PREFIXES = {
    Civil: ['OS', 'OP'],
    Criminal: ['CC', 'CP', 'ST', 'MC']
  };

  function cleanNumber(value) {
    return String(value || '').replace(/^(OS|OP|CC|CP|ST|MC)\s*/i, '').trim();
  }

  function renderCaseNumber() {
    const type = document.getElementById('partyCase');
    const field = document.getElementById('caseNumberField');
    if (!type || !field) return;

    const selected = type.value;
    const prefixes = PREFIXES[selected];
    const numberInput = document.getElementById('partyNumber');
    const prefixInput = document.getElementById('partyPrefix');
    const currentNumber = cleanNumber(numberInput ? numberInput.value : '');
    const currentPrefix = prefixInput ? prefixInput.value : '';

    if (!prefixes) {
      field.innerHTML = '<label>Case Number<div class="case-number-wrap"><input id="partyNumber" value="' + escapeHtml(currentNumber) + '" placeholder="123/2026"></div><small class="field-help">Enter the case number, e.g. 123/2026.</small></label>';
      return;
    }

    const prefix = prefixes.indexOf(currentPrefix) >= 0 ? currentPrefix : prefixes[0];
    field.innerHTML = '<label>Case Number<div class="case-number-wrap">' +
      '<select id="partyPrefix" aria-label="Case number prefix">' +
      prefixes.map(function (item) {
        return '<option value="' + item + '"' + (item === prefix ? ' selected' : '') + '>' + item + '</option>';
      }).join('') +
      '</select><input id="partyNumber" value="' + escapeHtml(currentNumber) + '" placeholder="123/2026"></div>' +
      '<small class="field-help">Select the case number type, then enter the number/year.</small></label>';
  }

  function escapeHtml(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  window.casesFixCaseTypeChanged = renderCaseNumber;

  const originalSave = window.casesFixSave;
  window.casesFixSave = function (type, index) {
    if (typeof originalSave !== 'function') return;

    const caseType = document.getElementById('partyCase');
    const number = document.getElementById('partyNumber');
    const prefix = document.getElementById('partyPrefix');
    const selectedType = caseType ? caseType.value : '';
    const selectedPrefix = prefix ? prefix.value : '';

    if (number && PREFIXES[selectedType] && selectedPrefix) {
      const originalValue = number.value;
      number.value = selectedPrefix + ' ' + cleanNumber(originalValue);
      try {
        return originalSave(type, index);
      } finally {
        number.value = originalValue;
      }
    }

    return originalSave(type, index);
  };

  document.addEventListener('change', function (event) {
    if (event.target && event.target.id === 'partyCase') renderCaseNumber();
  });

  renderCaseNumber();
})();
