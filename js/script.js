/* ==========================================================================
   script.js — весь JavaScript сайта клуба "Легион"
   Здесь нет фреймворков и сборщиков — это обычный код на "чистом" JS,
   который браузер выполняет сразу после загрузки HTML (тег <script>
   подключён в самом конце body, поэтому DOM уже готов и искать элементы
   можно сразу, без ожидания события DOMContentLoaded).

   Что делает этот файл:
   1. Открывает/закрывает мобильное меню по клику на гамбургер.
   2. Плавно прокручивает страницу к нужной секции при клике по ссылкам меню
      и закрывает мобильное меню после выбора пункта.
   3. Добавляет шапке лёгкую тень при прокрутке страницы вниз.
   4. Открывает окно «Связаться с тренером» (номер и мессенджеры).
   5. Подставляет текущий год в подвал сайта.
   ========================================================================== */


/* --------------------------------------------------------------------------
   1. МОБИЛЬНОЕ МЕНЮ
   Логика простая: у кнопки-гамбургера и у самого меню есть класс 'is-open'
   / "is-active", который включает CSS-стили для видимого состояния
   (см. style.css, блок @media max-width: 900px).
   -------------------------------------------------------------------------- */

// Находим кнопку-гамбургер и блок навигации по их id из index.html
const burgerButton = document.getElementById('burger');
const navMenu = document.getElementById('nav-menu');

// Функция переключения состояния меню (открыто/закрыто)
function toggleMobileMenu() {
  const isOpen = navMenu.classList.toggle('is-open');
  burgerButton.classList.toggle('is-active', isOpen);

  // aria-expanded нужен для скринридеров — сообщает, что меню открыто
  burgerButton.setAttribute('aria-expanded', String(isOpen));
}

burgerButton.addEventListener('click', toggleMobileMenu);


/* --------------------------------------------------------------------------
   2. ПЛАВНЫЙ СКРОЛЛ ПО ССЫЛКАМ МЕНЮ
   Находим все ссылки, которые ведут на якоря вида "#hero", "#trainers" и т.д.
   При клике: отменяем стандартный "прыжок" браузера, сами плавно
   прокручиваем страницу к нужному блоку через scrollIntoView(),
   а также закрываем мобильное меню, если оно было открыто.
   -------------------------------------------------------------------------- */

// querySelectorAll находит ВСЕ ссылки, у которых href начинается с "#"
const anchorLinks = document.querySelectorAll('a[href^="#"]');

anchorLinks.forEach(function (link) {
  link.addEventListener('click', function (event) {
    const targetId = link.getAttribute('href'); // например, "#trainers"
    const targetSection = document.querySelector(targetId);

    // Кнопки «Связаться с тренером» открывают окно, а не прокручивают страницу
    if (link.hasAttribute('data-open-contact')) {
      if (navMenu.classList.contains('is-open')) toggleMobileMenu();
      return;
    }

    // Если секция с таким id действительно существует на странице —
    // прокручиваем к ней вручную и отменяем стандартное поведение ссылки
    if (targetSection) {
      event.preventDefault();
      targetSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    // Если мобильное меню было открыто — закрываем его после выбора пункта
    if (navMenu.classList.contains('is-open')) {
      toggleMobileMenu();
    }
  });
});


/* --------------------------------------------------------------------------
   3. ТЕНЬ У ШАПКИ ПРИ ПРОКРУТКЕ
   Небольшой декоративный эффект: как только пользователь прокрутил
   страницу вниз хотя бы на 10px, добавляем шапке класс "header--scrolled"
   с более заметной тенью — так шапка визуально "отделяется" от контента.
   -------------------------------------------------------------------------- */

const header = document.getElementById('header');

window.addEventListener('scroll', function () {
  if (window.scrollY > 10) {
    header.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.25)';
  } else {
    header.style.boxShadow = 'none';
  }
});


/* --------------------------------------------------------------------------
   4. ОКНО «СВЯЗАТЬСЯ С ТРЕНЕРОМ»
   Любая кнопка/ссылка с атрибутом data-open-contact открывает окно
   с номером тренера и ссылками на мессенджеры. Закрыть можно крестиком,
   кликом по тёмному фону или клавишей Esc.
   -------------------------------------------------------------------------- */

const contactModal = document.getElementById('contact-modal');
let lastFocused = null;

function openContactModal() {
  lastFocused = document.activeElement;
  contactModal.hidden = false;
  document.body.classList.add('modal-open');
  contactModal.querySelector('.modal__close').focus();
}

function closeContactModal() {
  contactModal.hidden = true;
  document.body.classList.remove('modal-open');
  if (lastFocused) lastFocused.focus();
}

document.querySelectorAll('[data-open-contact]').forEach(function (el) {
  el.addEventListener('click', function (event) {
    event.preventDefault();
    openContactModal();
  });
});

document.querySelectorAll('[data-close-contact]').forEach(function (el) {
  el.addEventListener('click', closeContactModal);
});

document.addEventListener('keydown', function (event) {
  if (event.key === 'Escape' && !contactModal.hidden) closeContactModal();
});


// Кнопка «Скопировать номер»
const copyButton = document.getElementById('copy-phone');

copyButton.addEventListener('click', function () {
  const phone = copyButton.dataset.phone;
  const done = function () {
    copyButton.textContent = 'Номер скопирован ✓';
    setTimeout(function () { copyButton.textContent = 'Скопировать номер'; }, 2000);
  };

  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(phone).then(done);
  } else {
    // запасной вариант для старых браузеров
    const field = document.createElement('textarea');
    field.value = phone;
    document.body.appendChild(field);
    field.select();
    document.execCommand('copy');
    field.remove();
    done();
  }
});

/* --------------------------------------------------------------------------
   5. ТЕКУЩИЙ ГОД В ПОДВАЛЕ
   Чтобы не переписывать "© 2026" вручную каждый год, подставляем год
   автоматически через объект Date.
   -------------------------------------------------------------------------- */

document.getElementById('current-year').textContent = new Date().getFullYear();
