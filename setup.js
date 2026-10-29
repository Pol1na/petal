(() => {
  'use strict';
  const recipient = String(window.PETAL_CONFIG?.recipient || '');
  document.getElementById('recipient').textContent = recipient || 'Не указан';
  const status = document.getElementById('status');
  const buttons = [...document.querySelectorAll('button')];
  const isGoogle = window.PETAL_MAIL.provider === 'Google';
  if (isGoogle) {
    document.getElementById('activate').hidden = true;
    document.querySelector('ol').innerHTML = '<li>Отправь контрольное письмо кнопкой ниже.</li><li>Проверь входящие и «Спам» в своей почте.</li><li>Если письмо пришло, пройди опрос целиком и проверь его результат.</li>';
    status.textContent = 'Настроена отправка через твой Google Apps Script.';
  } else {
    status.textContent = 'Выбран FormSubmit. Если сервис недоступен, подключи Google по инструкции EMAIL_SETUP.md в папке сайта.';
  }
  async function submit(test) {
    if (buttons.some((button) => button.disabled)) return;
    if (!recipient) { status.textContent = 'Укажи получателя в config.js.'; return; }
    buttons.forEach((button) => button.disabled = true);
    status.textContent = `Обращаемся к ${window.PETAL_MAIL.provider}…`;
    try {
      const result = await window.PETAL_MAIL.send({ _subject: test ? '🌷 petal — контрольное письмо' : '🌷 petal — настройка приёма ответов', _template: 'table', _captcha: 'false', _honey: '', 'Сообщение': test ? 'Это контрольное письмо. Если оно пришло, приём цветочных портретов работает. Теперь пройди опубликованную анкету сам и проверь письмо с ответами.' : 'Это служебная проверка petal. Подтверди адрес кнопкой Activate Form в письме FormSubmit. Личных ответов в этом тесте нет.', 'Время': new Date().toISOString() });
      status.textContent = result.activationRequired ? 'Почта пока не активирована. Найди письмо FormSubmit и нажми Activate Form, затем повтори контрольное письмо.' : test ? 'Почтовый сервис подтвердил отправку. Проверь входящие и «Спам». Полученное контрольное письмо подтверждает доставку на почту.' : 'Запрос принят. Проверь письмо и нажми Activate Form, затем отправь контрольное письмо второй кнопкой.';
    } catch (error) {
      status.textContent = 'Не удалось получить подтверждение отправки. Проверь интернет и настройки из EMAIL_SETUP.md. Письмо могло уже прийти — проверь почту перед повторной попыткой.\n\n' + String(error.message || '').slice(0, 300);
    } finally { buttons.forEach((button) => button.disabled = false); }
  }
  document.getElementById('activate').addEventListener('click', () => submit(false));
  document.getElementById('test').addEventListener('click', () => submit(true));
})();
