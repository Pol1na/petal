(() => {
  'use strict';
  const $ = (selector) => document.querySelector(selector);
  const root = $('#main');
  const STORAGE_KEY = 'petal.flower-letter.v1';
  const config = window.PETAL_CONFIG || {};
  const arrow = '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 12h15m-6-6 6 6-6 6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  const check = '<svg viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="m4 10 4 4 8-8" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  const flower = '<svg viewBox="0 0 100 100" fill="none" aria-hidden="true"><g stroke="currentColor" stroke-width="1.2"><ellipse cx="50" cy="33" rx="12" ry="22"/><ellipse cx="50" cy="67" rx="12" ry="22"/><ellipse cx="33" cy="50" rx="22" ry="12"/><ellipse cx="67" cy="50" rx="22" ry="12"/><ellipse cx="50" cy="50" rx="12" ry="22" transform="rotate(45 50 50)"/><ellipse cx="50" cy="50" rx="12" ry="22" transform="rotate(-45 50 50)"/><circle cx="50" cy="50" r="7" fill="var(--cream)"/></g></svg>';
  const groups = {
    mood: [
      { id: 'romantic', title: 'Нежно и романтично', desc: 'Как объятие, только в цветах', image: 'bouquet' },
      { id: 'bold', title: 'Ярко и с характером', desc: 'Чтобы невозможно не заметить', image: 'wildflowers' },
      { id: 'spring', title: 'Легко, как весна', desc: 'Много воздуха и немного солнца', image: 'tulips' },
      { id: 'minimal', title: 'Просто и изящно', desc: 'Вся красота — в деталях', image: 'hero' },
      { id: 'any', title: 'Зависит от настроения', exclusive: true }
    ],
    flowers: [
      { id: 'peonies', title: 'Пионы', desc: 'Пышные и немного мечтательные', image: 'peonies' },
      { id: 'roses', title: 'Розы', desc: 'Классика, у которой много лиц', image: 'roses' },
      { id: 'tulips', title: 'Тюльпаны', desc: 'Маленькое обещание весны', image: 'tulips' },
      { id: 'ranunculus', title: 'Ранункулюсы', desc: 'Те самые нежные лютики', image: 'ranunculus' },
      { id: 'daisies', title: 'Ромашки', desc: 'Простые, солнечные, любимые', image: 'daisies' },
      { id: 'iris', title: 'Ирисы', desc: 'Словно маленькая акварель', image: 'hero' },
      { id: 'any', title: 'Мне нравятся любые цветы', exclusive: true }
    ],
    palette: [
      { id: 'pink', title: 'Нежный румянец', desc: 'Пудровый · розовый · молочный', colors: ['#d9a7ac', '#ecc9c9', '#f6e9dc'] },
      { id: 'white', title: 'Сливочное облако', desc: 'Белый · кремовый · зелень', colors: ['#fffdf6', '#e9ddbf', '#9baf8a'] },
      { id: 'lilac', title: 'Сиреневый сон', desc: 'Лавандовый · сиреневый · голубой', colors: ['#bdb1d0', '#d5b9d7', '#aebfce'] },
      { id: 'peach', title: 'Тёплый персик', desc: 'Абрикосовый · коралловый · жёлтый', colors: ['#e6ad88', '#e18776', '#ead083'] },
      { id: 'red', title: 'Вишнёвое настроение', desc: 'Красный · бордовый · ягодный', colors: ['#9e354b', '#6b293c', '#c06c83'] },
      { id: 'bright', title: 'Все краски сразу', desc: 'Фуксия · оранжевый · фиолетовый', colors: ['#c45d92', '#e8a35e', '#8d7aaf'] },
      { id: 'any', title: 'Удиви меня цветом', exclusive: true }
    ],
    composition: [
      { id: 'mono', title: 'Один вид цветов', desc: 'Много любимых. И ничего лишнего', image: 'peonies-soft' },
      { id: 'mixed', title: 'Собранный с любовью', desc: 'Разные цветы в одной истории', image: 'bouquet' },
      { id: 'airy', title: 'Воздух и лёгкость', desc: 'Свободная форма, видны стебли', image: 'tulips' },
      { id: 'unusual', title: 'Что-то необычное', desc: 'Интересные формы и сочетания', image: 'wildflowers' },
      { id: 'any', title: 'Доверюсь тому, кто выбирает', exclusive: true }
    ],
    size: [
      { id: 'small', title: 'Маленький комплимент', desc: 'Компактный и очень милый', icon: 'small' },
      { id: 'medium', title: 'Та самая золотая середина', desc: 'Уютный букет в две ладони', icon: 'medium' },
      { id: 'large', title: 'Большое «вау»', desc: 'Чтобы обнимать обеими руками', icon: 'large' },
      { id: 'any', title: 'Размер не имеет значения', exclusive: true }
    ],
    wrapping: [
      { id: 'paper', title: 'Бумага и лента', desc: 'Нежная, без лишнего декора', symbol: '⌁' },
      { id: 'ribbon', title: 'Только лента', desc: 'Пусть цветы говорят сами', symbol: '⋈' },
      { id: 'box', title: 'В коробке / корзинке', desc: 'Маленькая готовая композиция', symbol: '⊔' },
      { id: 'vase', title: 'Сразу в вазе', desc: 'Красиво и удобно', symbol: '♧' },
      { id: 'any', title: 'Любая красивая упаковка', exclusive: true }
    ],
    avoid: [
      { id: 'roses', title: 'Розы' }, { id: 'lilies', title: 'Лилии' }, { id: 'chrysanthemum', title: 'Хризантемы' },
      { id: 'carnations', title: 'Гвоздики' }, { id: 'gypsophila', title: 'Гипсофила' }, { id: 'dry', title: 'Сухоцветы' },
      { id: 'glitter', title: 'Блёстки и крашеные цветы' }, { id: 'plastic', title: 'Много пластика и декора' },
      { id: 'none', title: 'Нет, строгих «нет» у меня нет', exclusive: true }
    ],
    scent: [
      { id: 'light', title: 'Лёгкий и ненавязчивый' }, { id: 'strong', title: 'Люблю, когда пахнет цветами' },
      { id: 'no', title: 'Лучше совсем без запаха' }, { id: 'any', title: 'Не принципиально' }
    ]
  };
  const steps = [
    { label: 'Настроение', title: 'Какое настроение — <em>твоё?</em>', subtitle: 'Представь: тебе дарят букет. Какой хочется обнять первым?', group: 'mood', note: 'Можно выбрать несколько. Доверься первому «нравится».' },
    { label: 'Цветы', title: 'А какие цветы <em>ближе к сердцу?</em>', subtitle: 'Не обязательно знать названия. Просто посмотри на фотографии.', group: 'flowers', note: 'Выбирай всех любимчиков — можно больше одного.' },
    { label: 'Палитра', title: 'Добавим немного <em>твоих оттенков.</em>', subtitle: 'Какие цвета ты бы с радостью забрала с собой?', group: 'palette', note: 'Здесь тоже можно влюбиться в несколько палитр.' },
    { label: 'Композиция', title: 'Как соберём <em>эту красоту?</em>', subtitle: 'Охапка одного вида или маленький цветочный мир?', group: 'composition', note: 'Выбери все варианты, которые тебе нравятся.' },
    { label: 'Детали', title: 'Красота — <em>в маленьких деталях.</em>', subtitle: 'Пара штрихов, чтобы букет оказался именно твоим.', note: 'В каждом разделе выбери один вариант.' },
    { label: 'Пожелания', title: 'Что точно <em>не твоё?</em>', subtitle: 'Здесь можно честно. Даже если все вокруг это обожают.', note: 'Выбери всё, что не хочется видеть в своём букете.' },
    { label: 'Последний штрих', title: 'Может, есть ещё <em>маленький намёк?</em>', subtitle: 'Любимая мелочь, особенный цветок или тот самый букет из сохранённого.', note: 'Всё необязательно. Но любая подсказка бесценна.' }
  ];
  const blankAnswers = () => ({ mood: [], flowers: [], palette: [], composition: [], size: [], wrapping: [], avoid: [], scent: [], otherFlowers: '', avoidNote: '', name: '', note: '', reference: '' });
  let state = { started: false, step: 0, answers: blankAnswers(), sent: false, submissionId: newId() };
  let storageWorks = true;
  let sending = false;
  let viewingSent = false;
  let toastTimer;
  function newId() { return globalThis.crypto?.randomUUID?.() || `petal-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`; }
  function escape(value) { return String(value ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }
  function load() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
      if (!saved || typeof saved !== 'object') return;
      state.started = saved.started === true;
      state.sent = saved.sent === true;
      state.step = Number.isInteger(saved.step) ? Math.min(7, Math.max(0, saved.step)) : 0;
      state.submissionId = /^[a-zA-Z0-9-]{8,80}$/.test(saved.submissionId) ? saved.submissionId : newId();
      for (const key of Object.keys(groups)) {
        const allowed = groups[key].map((option) => option.id);
        state.answers[key] = Array.isArray(saved.answers?.[key]) ? [...new Set(saved.answers[key].filter((id) => allowed.includes(id)))] : [];
      }
      for (const key of ['otherFlowers', 'avoidNote', 'name', 'note', 'reference']) {
        state.answers[key] = typeof saved.answers?.[key] === 'string' ? saved.answers[key].slice(0, key === 'note' ? 1500 : key === 'reference' ? 1000 : 200) : '';
      }
    } catch { /* A malformed or unavailable local draft must never block the quiz. */ }
  }
  function save() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }
    catch { storageWorks = false; }
  }
  function toast(message) {
    $('#toast').textContent = message;
    $('#toast').classList.add('visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => $('#toast').classList.remove('visible'), 3500);
  }
  function picture(name, alt, className = '', eager = false) {
    return `<img class="${className}" src="assets/${name}.jpg" alt="${escape(alt)}" loading="${eager ? 'eager' : 'lazy'}" decoding="async" width="600" height="800">`;
  }
  function home() {
    root.innerHTML = `<section class="hero"><div class="hero-copy"><p class="eyebrow"><span></span> МАЛЕНЬКАЯ ИСТОРИЯ О ТВОЁМ ВКУСЕ</p><h1>Цветы, которые<br>похожи <em>на тебя.</em><span class="heading-star" aria-hidden="true">✧</span></h1><p class="hero-description">${escape(config.intro || 'Давай узнаем, какие цветы делают тебя счастливее. Семь маленьких вопросов для одного очень красивого букета.')}</p><button class="button primary start-button" data-action="start">${state.started ? 'Продолжить мою историю' : 'Собрать мой цветочный портрет'} ${arrow}</button><p class="hero-under">займёт 3–5 минут <span>·</span> только то, что нравится тебе</p><div class="hero-note"><span class="tiny-flower" aria-hidden="true">✿</span><p>Потому что лучший букет —<br>тот, в котором <em>тебя узнали.</em></p></div></div><div class="hero-art"><div class="hero-photo">${picture('bouquet', 'Нежный букет роз с маленькими белыми цветами в светлой бумаге', '', true)}<span class="photo-index">01 / маленькие радости</span></div><div class="mini-photo">${picture('ranunculus', 'Нежные розовые и персиковые ранункулюсы', '', true)}<span>любовь в деталях</span></div><div class="round-stamp">${flower}<span>просто<br>расцветай</span></div><div class="hand-note">тебе идут цветы <span aria-hidden="true">♡</span></div></div></section><div class="intro-ribbon"><span><b>01—07</b> семь маленьких вопросов</span><span><span aria-hidden="true">✧</span> никаких неправильных ответов</span><span><span aria-hidden="true">♡</span> один букет — совсем твой</span></div><section class="bottom-note"><span>НЕ ТЕСТ. ПРИЗНАНИЕ В ЦВЕТОЧНЫХ ПРЕДПОЧТЕНИЯХ.</span><p>Слушай себя.<br>А мы запомним самое красивое.</p>${flower}</section>`;
  }
  function progress() {
    return `<nav class="progress-nav" aria-label="Этапы опроса">${steps.map((step, i) => `<button class="progress-item ${i === state.step ? 'active' : ''} ${i < state.step ? 'complete' : ''}" data-action="goto" data-step="${i}" ${i > state.step ? 'disabled' : ''} ${i === state.step ? 'aria-current="step"' : ''}><span>${i < state.step ? check : `0${i + 1}`}</span><span>${step.label}</span></button>`).join('')}</nav><div class="mobile-progress"><span>ШАГ ${Math.min(state.step + 1, 7)} ИЗ 7</span><span>${state.step < 7 ? steps[state.step].label : 'Твой портрет'}</span><div><i style="width:${Math.min((state.step + 1) / 7 * 100, 100)}%"></i></div></div>`;
  }
  function choice(group, option, type = 'photo', single = false) {
    const selected = state.answers[group].includes(option.id);
    let visual = '';
    if (type === 'photo') visual = picture(option.image, '');
    if (type === 'palette') visual = `<span class="palette-colors" aria-hidden="true">${option.colors.map((color) => `<i style="background:${color}"></i>`).join('')}</span>`;
    if (type === 'size') visual = bouquetIcon(option.icon);
    if (type === 'format') visual = `<span class="format-symbol" aria-hidden="true">${option.symbol}</span>`;
    return `<button type="button" class="choice ${type}-choice ${selected ? 'selected' : ''}" data-group="${group}" data-value="${option.id}" data-single="${single}" aria-pressed="${selected}">${visual}<span class="choice-copy"><span class="choice-title">${escape(option.title)}</span>${option.desc ? `<span class="choice-description">${escape(option.desc)}</span>` : ''}</span><span class="selection-mark" aria-hidden="true">${check}</span></button>`;
  }
  function bouquetIcon(size) {
    const count = size === 'small' ? 3 : size === 'medium' ? 5 : 7;
    return `<svg class="bouquet-icon" viewBox="0 0 150 100" fill="none" aria-hidden="true"><g stroke="currentColor" stroke-width="1.2">${Array.from({ length: count }, (_, i) => { const x = 75 + Math.sin(i * 2.4) * (count + 10); const y = 30 + Math.cos(i * 2.4) * 10; return `<path d="M${x} ${y + 8} 75 89"/><circle cx="${x}" cy="${y}" r="9" fill="var(--cream)"/><circle cx="${x}" cy="${y}" r="3"/>`; }).join('')}<path d="m53 56 22 33 22-33M69 76l-7 5 12-1m2-4 10 6-11-2"/></g></svg>`;
  }
  function groupCards(group, type = 'photo', single = false) {
    return `<div class="choices ${type}-grid" role="group" aria-label="${escape({ mood: 'Настроение букета', flowers: 'Любимые цветы', palette: 'Любимые оттенки', composition: 'Композиция', size: 'Размер букета', wrapping: 'Упаковка' }[group])}">${groups[group].filter((option) => !option.exclusive).map((option) => choice(group, option, type, single)).join('')}</div><div class="any-choice">${groups[group].filter((option) => option.exclusive).map((option) => choice(group, option, 'chip', single)).join('')}</div>`;
  }
  function textField(key, label, placeholder, maxLength = 200, multiline = false) {
    return `<div class="text-field"><label for="${key}">${label}</label>${multiline ? `<textarea id="${key}" data-field="${key}" maxlength="${maxLength}" placeholder="${escape(placeholder)}" rows="4">${escape(state.answers[key])}</textarea>` : `<input id="${key}" data-field="${key}" type="${key === 'reference' ? 'url' : 'text'}" ${key === 'reference' ? 'inputmode="url"' : ''} maxlength="${maxLength}" placeholder="${escape(placeholder)}" value="${escape(state.answers[key])}" autocomplete="${key === 'name' ? 'given-name' : 'off'}">`}</div>`;
  }
  function quiz() {
    const step = steps[state.step];
    let content = '';
    if (state.step <= 3) content = groupCards(step.group, state.step === 2 ? 'palette' : 'photo');
    if (state.step === 1) content += textField('otherFlowers', 'А может, твоих любимых здесь нет?', 'Например: гортензии, эустомы, орхидеи…');
    if (state.step === 4) content = `<h3 class="subheading">01 <span>Размер букета</span></h3>${groupCards('size', 'size', true)}<h3 class="subheading">02 <span>Как его оформим?</span></h3>${groupCards('wrapping', 'format', true)}`;
    if (state.step === 5) content = `<div class="soft-panel"><div class="chip-grid" role="group" aria-label="Что не нравится">${groups.avoid.map((option) => choice('avoid', option, 'chip')).join('')}</div>${textField('avoidNote', 'Что ещё стоит учесть?', 'Любые другие цветы или детали, которые не нравятся')}</div><h3 class="subheading">И ещё немного про аромат</h3><div class="chip-grid" role="group" aria-label="Аромат букета">${groups.scent.map((option) => choice('scent', option, 'chip', true)).join('')}</div>`;
    if (state.step === 6) content = `<div class="last-step"><div class="letter-fields">${textField('name', 'Как тебя зовут? <span>если хочется</span>', 'Твоё имя')}${textField('note', 'Твой маленький намёк', 'Может, ты любишь цветы без повода? Или мечтаешь о букете, как на той самой картинке?', 1500, true)}${textField('reference', 'Ссылка на букет мечты <span>необязательно</span>', 'https://…', 1000)}<p class="field-note">Ссылки на Pinterest, фото или любимый цветочный магазин — всё подойдёт.</p></div><aside class="letter-aside">${flower}<p>Некоторые вещи<br>приятнее <em>не угадывать.</em></p><span>А просто знать о тебе.</span></aside></div>`;
    root.innerHTML = `<section class="quiz-shell">${progress()}<div class="question-heading"><div><p class="eyebrow">ТВОЙ ЦВЕТОЧНЫЙ ПОРТРЕТ <span class="step-count">/ 0${state.step + 1}</span></p><h2 tabindex="-1">${step.title}</h2><p class="question-subtitle">${step.subtitle}</p></div><div class="question-flower">${flower}</div></div><p class="selection-help"><span aria-hidden="true">✧</span> ${step.note}</p><div class="question-content">${content}</div><div class="quiz-navigation"><button class="text-button back" data-action="back">${arrow} Назад</button><span class="draft-status">${storageWorks ? 'Твои ответы сохраняются на этом устройстве' : 'Не закрывай страницу, пока не отправишь ответы'}</span><div>${state.step < 6 ? '<button class="text-button skip" data-action="skip">Пропустить</button>' : ''}<button class="button primary" data-action="next">${state.step === 6 ? 'Мой цветочный портрет' : 'Дальше'} ${arrow}</button></div></div></section>`;
  }
  function labels(group) { return state.answers[group].map((id) => groups[group].find((option) => option.id === id)?.title).filter(Boolean); }
  function rows() {
    return [
      ['Настроение', labels('mood').join(', ')],
      ['Любимые цветы', [...labels('flowers'), state.answers.otherFlowers.trim()].filter(Boolean).join(', ')],
      ['Палитра', state.answers.palette.map((id) => { const option = groups.palette.find((o) => o.id === id); return option ? `${option.title}${option.desc ? ` (${option.desc})` : ''}` : ''; }).filter(Boolean).join('; ')],
      ['Композиция', labels('composition').join(', ')],
      ['Размер', labels('size').join(', ')], ['Упаковка', labels('wrapping').join(', ')],
      ['Точно не дарить', [...labels('avoid'), state.answers.avoidNote.trim()].filter(Boolean).join(', ')],
      ['Аромат', labels('scent').join(', ')], ['Пожелания', state.answers.note.trim()], ['Букет мечты', state.answers.reference.trim()]
    ];
  }
  function summaryText() { return `ЦВЕТОЧНЫЙ ПОРТРЕТ${state.answers.name.trim() ? ` · ${state.answers.name.trim()}` : ''}\n\n${rows().map(([name, value]) => `${name}: ${value || 'Не указано'}`).join('\n\n')}`; }
  function selectedPhoto() {
    const preferred = state.answers.flowers.find((id) => id !== 'any');
    if (preferred) return groups.flowers.find((option) => option.id === preferred).image;
    return 'bouquet';
  }
  function review() {
    root.innerHTML = `<section class="review-shell"><div class="review-top"><p class="eyebrow">СОБРАНО ИЗ ТОГО, ЧТО ТЫ ЛЮБИШЬ</p><h2 tabindex="-1">Кажется, это <em>очень ты.</em></h2><p class="question-subtitle">Твой маленький цветочный портрет. Всё так? Осталось передать намёк.</p></div><div class="portrait"><div class="portrait-image">${picture(selectedPhoto(), 'Цветы из твоего цветочного портрета', '', true)}<span class="portrait-caption">${escape(state.answers.name.trim() || 'Для тебя')}<small>с нежностью, в каждом лепестке</small></span></div><div class="portrait-details"><p class="eyebrow">МОЙ ИДЕАЛЬНЫЙ БУКЕТ</p><dl>${rows().map(([name, value]) => `<div><dt>${name}</dt><dd>${escape(value || 'Оставлю место для сюрприза')}</dd></div>`).join('')}</dl></div></div><div class="send-panel"><div><h3>Пусть тебя порадуют <em>по-настоящему.</em></h3><p>Твои ответы получит человек, который прислал эту ссылку.<br>Маленькая подсказка для большого «это именно то!».</p></div><div class="send-actions"><button class="button primary" data-action="send">Отправить мой намёк ${arrow}</button><span>Ответы передаются через FormSubmit.</span></div><p id="send-error" class="send-error" role="alert" hidden></p></div><div class="review-bottom"><button class="text-button back" data-action="edit">${arrow} Поправить ответы</button><div><button class="text-button" data-action="copy">Скопировать портрет</button><button class="text-button" data-action="download">Сохранить себе ↓</button></div></div></section>`;
  }
  function success() {
    root.innerHTML = `<section class="success-shell"><div class="success-flower">${flower}<span>${check}</span></div><p class="eyebrow">ТВОЯ ЦВЕТОЧНАЯ ИСТОРИЯ СОБРАНА</p><h2 tabindex="-1">Намёк <em>отправлен.</em></h2><p class="success-copy">Теперь кто-то знает,<br>как сделать твой день чуть красивее.</p><p class="success-hand">и пусть поводов для цветов будет больше ♡</p><div class="success-buttons"><button class="button primary" data-action="download">Сохранить мой портрет ↓</button><button class="text-button" data-action="view">Посмотреть мои ответы</button></div></section>`;
  }
  function render(moveFocus = false) {
    document.body.dataset.screen = !state.started ? 'home' : state.sent ? 'success' : state.step === 7 ? 'review' : 'quiz';
    if (!state.started) home(); else if (state.sent && !viewingSent) success(); else if (state.step === 7) review(); else quiz();
    if (state.sent && viewingSent) {
      const sendButton = root.querySelector('[data-action="send"]');
      if (sendButton) { sendButton.disabled = true; sendButton.textContent = 'Намёк уже отправлен ♡'; }
    }
    const providerNote = root.querySelector('.send-actions > span');
    if (providerNote) providerNote.textContent = `Ответы передаются через ${window.PETAL_MAIL.provider}.`;
    if (moveFocus) { window.scrollTo({ top: 0, behavior: 'instant' }); (root.querySelector('h2') || root).focus({ preventScroll: true }); }
  }
  function updateChoice(button) {
    const group = button.dataset.group;
    const value = button.dataset.value;
    const option = groups[group]?.find((item) => item.id === value);
    if (!option || sending) return;
    const current = state.answers[group];
    const isSelected = current.includes(value);
    if (isSelected) state.answers[group] = current.filter((id) => id !== value);
    else if (option.exclusive || button.dataset.single === 'true') state.answers[group] = [value];
    else state.answers[group] = [...current.filter((id) => !groups[group].find((item) => item.id === id)?.exclusive), value];
    state.sent = false;
    save();
    root.querySelectorAll(`[data-group="${group}"]`).forEach((el) => {
      const selected = state.answers[group].includes(el.dataset.value);
      el.classList.toggle('selected', selected);
      el.setAttribute('aria-pressed', String(selected));
    });
  }
  function validateReference() {
    const input = state.answers.reference.trim();
    if (!input) return true;
    try { return ['https:', 'http:'].includes(new URL(input).protocol); } catch { return false; }
  }
  async function send() {
    if (sending || state.sent) return;
    const button = root.querySelector('[data-action="send"]');
    const error = $('#send-error');
    sending = true;
    button.disabled = true;
    button.textContent = 'Передаём твой намёк…';
    error.hidden = true;
    root.setAttribute('aria-busy', 'true');
    const payload = {
      _subject: `🌷 Цветочный портрет${state.answers.name.trim() ? `: ${state.answers.name.trim()}` : ''}`,
      _template: 'table', _captcha: 'false', _honey: '',
      'Имя': state.answers.name.trim() || 'Не указано',
      ...Object.fromEntries(rows().map(([key, value]) => [key, value || 'Не указано'])),
      'Памятка для друзей': summaryText(),
      'Номер анкеты': state.submissionId,
      'Время отправки': new Date().toISOString()
    };
    try {
      const result = await window.PETAL_MAIL.send(payload);
      if (result.activationRequired) {
        error.hidden = false;
        error.textContent = 'Почта получателя ещё ждёт подтверждения. Твои ответы сохранены на этом устройстве. Сохрани портрет и попроси того, кто прислал ссылку, подтвердить почту.';
      } else {
        if (result.success !== true) throw new Error('Submission not confirmed');
        state.sent = true; save(); render(true);
      }
    } catch {
      error.hidden = false;
      error.textContent = 'Сервис не подтвердил отправку. Проверь интернет и попробуй ещё раз. Ответы остались на этом устройстве — их также можно скопировать или сохранить ниже.';
    } finally {
      sending = false; root.removeAttribute('aria-busy');
      if (button.isConnected) { button.disabled = false; button.innerHTML = `Отправить мой намёк ${arrow}`; }
    }
  }
  async function copy() {
    try { await navigator.clipboard.writeText(summaryText()); toast('Портрет скопирован ♡'); }
    catch { toast('Не получилось скопировать. Нажми «Сохранить себе».'); }
  }
  function download() {
    const blob = new Blob(['\uFEFF' + summaryText()], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url; anchor.download = 'Мой цветочный портрет.txt'; document.body.appendChild(anchor); anchor.click(); anchor.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    toast('Твой цветочный портрет сохранён');
  }
  root.addEventListener('click', (event) => {
    const choiceButton = event.target.closest('[data-group]');
    if (choiceButton) return updateChoice(choiceButton);
    const button = event.target.closest('[data-action]');
    if (!button || sending) return;
    switch (button.dataset.action) {
      case 'start': state.started = true; break;
      case 'next':
        if (state.step === 6 && !validateReference()) { toast('Для ссылки нужен полный адрес, начиная с https://'); $('#reference').focus(); return; }
        state.step = Math.min(7, state.step + 1); break;
      case 'skip': state.step = Math.min(7, state.step + 1); break;
      case 'back': if (state.step === 0) state.started = false; else state.step--; break;
      case 'goto': state.step = Math.min(state.step, Number(button.dataset.step)); break;
      case 'edit': state.step = 0; state.sent = false; viewingSent = false; state.submissionId = newId(); break;
      case 'view': viewingSent = true; state.step = 7; break;
      case 'send': send(); return;
      case 'copy': copy(); return;
      case 'download': download(); return;
      default: return;
    }
    save(); render(true);
  });
  root.addEventListener('input', (event) => {
    const key = event.target.dataset.field;
    if (key && Object.hasOwn(state.answers, key)) { state.answers[key] = event.target.value; state.sent = false; save(); }
  });
  load(); save(); render();
})();
