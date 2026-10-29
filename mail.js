(() => {
  'use strict';
  const config = window.PETAL_CONFIG || {};
  const google = String(config.googleScriptUrl || '').trim();
  const recipient = String(config.recipient || '');
  function googleSend(payload) {
    return new Promise((resolve, reject) => {
      if (!/^https:\/\/script\.google\.com\/macros\/s\/[a-zA-Z0-9_-]+\/exec$/.test(google)) return reject(new Error('Проверь ссылку Google Apps Script в config.js.'));
      if (location.origin === 'null') return reject(new Error('Открой опубликованный сайт или локальный сервер вместо файла.'));
      const nonce = crypto.randomUUID?.() || Date.now().toString(36) + Math.random().toString(36).slice(2);
      const iframe = document.createElement('iframe');
      iframe.name = 'petal-' + nonce;
      iframe.hidden = true;
      iframe.title = 'Подтверждение отправки';
      const form = document.createElement('form');
      form.action = google; form.method = 'POST'; form.target = iframe.name; form.hidden = true;
      for (const [name, value] of Object.entries({ payload: JSON.stringify(payload), nonce, replyOrigin: location.origin })) {
        const input = document.createElement('input'); input.type = 'hidden'; input.name = name; input.value = value; form.appendChild(input);
      }
      const cleanup = () => { clearTimeout(timer); window.removeEventListener('message', receive); form.remove(); iframe.remove(); };
      const receive = (event) => {
        let host;
        try { host = new URL(event.origin).hostname; } catch { return; }
        if (event.origin !== `https://${host}` || !(host === 'script.google.com' || host === 'script.googleusercontent.com' || host.endsWith('-script.googleusercontent.com'))) return;
        if (event.data?.type !== 'petal-mail-result' || event.data.nonce !== nonce) return;
        cleanup();
        if (event.data.success === true) resolve({ success: true });
        else reject(new Error(event.data.message || 'Google не подтвердил отправку.'));
      };
      const timer = setTimeout(() => { cleanup(); reject(new Error('Не получено подтверждение Google. Проверь настройки доступа и почту перед повторной отправкой.')); }, 40000);
      window.addEventListener('message', receive);
      document.body.appendChild(iframe); document.body.appendChild(form);
      try { form.submit(); } catch (error) { cleanup(); reject(error); }
    });
  }
  async function formSubmitSend(payload) {
    if (!/^[^\s@/]+@[^\s@/]+\.[^\s@/]+$/.test(recipient) && !/^[a-f0-9]{24,64}$/i.test(recipient)) throw new Error('Укажи получателя в config.js.');
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 25000);
    try {
      const response = await fetch(`https://formsubmit.co/ajax/${encodeURIComponent(recipient)}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(payload), signal: controller.signal
      });
      const result = await response.json().catch(() => null);
      if (result && /activat|confirm.*email|email.*confirm/i.test(String(result.message || ''))) return { success: false, activationRequired: true };
      if (!response.ok || !(result?.success === true || result?.success === 'true')) throw new Error(result?.message || 'FormSubmit не подтвердил отправку.');
      return { success: true };
    } finally { clearTimeout(timer); }
  }
  window.PETAL_MAIL = Object.freeze({ provider: google ? 'Google' : 'FormSubmit', send: google ? googleSend : formSubmitSend });
})();
