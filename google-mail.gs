// Вставь этот файл в новый проект https://script.google.com/.
// Измени ALLOWED_ORIGIN на адрес своего GitHub Pages (без /petal и без слеша в конце).
const RECIPIENT = 'l1napochtipol1na@gmail.com';
const ALLOWED_ORIGIN = 'https://YOUR-GITHUB-NAME.github.io';
const MAX_MAILS_PER_DAY = 20;

function authorizeMail() {
  // Запусти один раз в редакторе и разреши отправку от своего имени.
  console.log('Доступных получателей сегодня: ' + MailApp.getRemainingDailyQuota());
}

function doGet() {
  return HtmlService.createHtmlOutput('<p>petal: приёмник цветочных портретов готов.</p>');
}

function doPost(event) {
  const params = event && event.parameter || {};
  const nonce = String(params.nonce || '').slice(0, 100);
  const origin = String(params.replyOrigin || '');
  let success = false;
  let message = 'Не удалось отправить письмо.';
  let lock;
  try {
    if (!/^https:\/\/[a-zA-Z0-9.-]+$/.test(ALLOWED_ORIGIN) || origin !== ALLOWED_ORIGIN) throw new Error('Адрес сайта не совпадает с ALLOWED_ORIGIN в Google Apps Script.');
    if (!/^[a-zA-Z0-9-]{8,100}$/.test(nonce)) throw new Error('Некорректный запрос.');
    const raw = String(params.payload || '');
    if (raw.length > 25000) throw new Error('Анкета слишком длинная.');
    const data = JSON.parse(raw);
    if (!data || typeof data !== 'object' || Array.isArray(data) || data._honey) throw new Error('Некорректная анкета.');
    const submissionId = String(data['Номер анкеты'] || nonce);
    if (!/^[a-zA-Z0-9-]{8,100}$/.test(submissionId)) throw new Error('Некорректный номер анкеты.');
    lock = LockService.getScriptLock();
    lock.waitLock(10000);
    const cache = CacheService.getScriptCache();
    if (cache.get('sent:' + submissionId)) {
      success = true;
    } else {
      const props = PropertiesService.getScriptProperties();
      const day = Utilities.formatDate(new Date(), 'UTC', 'yyyy-MM-dd');
      const dayCount = props.getProperty('mailDay') === day ? Number(props.getProperty('mailCount') || 0) : 0;
      if (dayCount >= MAX_MAILS_PER_DAY || MailApp.getRemainingDailyQuota() < 1) throw new Error('Лимит писем на сегодня исчерпан. Сохрани портрет и попробуй завтра.');
      const subject = String(data._subject || '🌷 Цветочный портрет').replace(/[\r\n]/g, ' ').slice(0, 180);
      const fields = Object.keys(data).filter((key) => !key.startsWith('_')).slice(0, 20);
      if (!fields.length) throw new Error('Нет ответов для отправки.');
      const body = fields.map((key) => key + ':\n' + String(data[key]).slice(0, 5000)).join('\n\n');
      MailApp.sendEmail({ to: RECIPIENT, subject: subject, body: body, name: 'petal. — цветочный портрет' });
      props.setProperties({ mailDay: day, mailCount: String(dayCount + 1) });
      cache.put('sent:' + submissionId, '1', 21600);
      success = true;
    }
  } catch (error) {
    message = String(error.message || 'Не удалось отправить письмо.').slice(0, 250);
  } finally {
    if (lock && lock.hasLock()) lock.releaseLock();
  }
  // Письмо отправлено до подтверждения. Разрешаем встраивание только для ответа-моста;
  // сами данные никогда не отражаются в HTML и не возвращаются посетителю.
  const result = JSON.stringify({ type: 'petal-mail-result', nonce: nonce, success: success, message: success ? '' : message }).replace(/</g, '\\u003c');
  const target = JSON.stringify(origin === ALLOWED_ORIGIN ? ALLOWED_ORIGIN : 'https://invalid.example').replace(/</g, '\\u003c');
  return HtmlService.createHtmlOutput('<!doctype html><meta charset="utf-8"><script>window.top.postMessage(' + result + ',' + target + ');</script>')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}
