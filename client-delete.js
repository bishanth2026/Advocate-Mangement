/* Client delete action: keeps the existing client screen and other modules unchanged. */
(function () {
  'use strict';

  var content = document.getElementById('content');
  if (!content) return;

  function addDeleteButtons() {
    var table = document.getElementById('clientTable');
    if (!table) return;

    table.querySelectorAll('tbody tr').forEach(function (row) {
      var action = row.querySelector('td:last-child');
      if (!action || action.querySelector('.client-delete-btn')) return;

      var idNode = row.querySelector('.muted');
      var clientId = idNode ? idNode.textContent.trim() : '';
      if (!clientId) return;

      var button = document.createElement('button');
      button.type = 'button';
      button.className = 'secondary client-delete-btn';
      button.textContent = 'Delete';
      button.style.marginLeft = '6px';
      button.style.color = '#b91c1c';
      button.style.borderColor = '#fecaca';
      button.dataset.clientId = clientId;
      button.addEventListener('click', function () {
        deleteClient(clientId, row);
      });
      action.appendChild(button);
    });
  }

  function isUuid(value) {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(String(value || ''));
  }

  function localClient(clientId) {
    try {
      var stored = JSON.parse(localStorage.getItem('advocateDeskData') || 'null');
      return stored && Array.isArray(stored.clients)
        ? stored.clients.find(function (client) { return String(client.id) === String(clientId); })
        : null;
    } catch (error) {
      return null;
    }
  }

  async function resolveCloudId(clientId) {
    if (isUuid(clientId)) return clientId;
    if (!(window.ADCloudCRUD && window.ADCloudCRUD.list)) return null;
    var local = localClient(clientId);
    if (!local) return null;
    var cloudClients = await window.ADCloudCRUD.list('clients', { select: 'id,name,phone,email' });
    var match = (cloudClients || []).find(function (client) {
      return (local.name && client.name === local.name) ||
        (local.phone && client.phone === local.phone) ||
        (local.email && client.email === local.email);
    });
    return match && match.id ? match.id : null;
  }

  async function deleteClient(clientId, row) {
    var confirmed = window.confirm(
      'Delete this client? This removes the client record. Related cases will not be deleted.'
    );
    if (!confirmed) return;

    var button = row.querySelector('.client-delete-btn');
    if (button) {
      button.disabled = true;
      button.textContent = 'Deleting...';
    }

    try {
      if (window.ADCloudCRUD && window.ADCloudCRUD.ready && window.ADCloudCRUD.ready()) {
        var cloudId = await resolveCloudId(clientId);
        if (cloudId) await window.ADCloudCRUD.remove('clients', cloudId);
      }

      var stored = JSON.parse(localStorage.getItem('advocateDeskData') || 'null');
      if (stored && Array.isArray(stored.clients)) {
        stored.clients = stored.clients.filter(function (client) {
          return String(client.id) !== String(clientId);
        });
        localStorage.setItem('advocateDeskData', JSON.stringify(stored));
      }

      window.alert('Client deleted successfully.');
      window.location.reload();
    } catch (error) {
      if (button) {
        button.disabled = false;
        button.textContent = 'Delete';
      }
      window.alert('Could not delete client: ' + (error && error.message ? error.message : error));
    }
  }

  var observer = new MutationObserver(addDeleteButtons);
  observer.observe(content, { childList: true, subtree: true });
  addDeleteButtons();
})();
