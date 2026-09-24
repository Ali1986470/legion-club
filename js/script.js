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
   4. Проверяет форму заявки перед "отправкой" и показывает сообщение.
   5. Подставляет текущий год в подвал сайта.
   ========================================================================== */


/* --------------------------------------------------------------------------
   1. МОБИЛЬНОЕ МЕНЮ
   Логика простая: у кнопки-гамбургера и у самого меню есть класс "is-open"
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
   4. ОБРАБОТКА ФОРМЫ ЗАЯВКИ
   Важно: это только клиентская (браузерная) проверка и имитация отправки.
   Реальной отправки на сервер здесь нет — заявки никуда не сохраняются.
   Чтобы заявки приходили вам на почту/в мессенджер, нужно:
     а) подключить готовый сервис форм (например, Яндекс.Формы, Google Forms,
        Telegram-бота через его API) и отправлять туда fetch()-запросом, или
     б) написать свой backend, который принимает POST-запрос с этими данными.
   Место, куда добавить такой запрос, отмечено ниже комментарием.
   -------------------------------------------------------------------------- */

const applicationForm = document.getElementById('application-form-el');
const formMessage = document.getElementById('form-message');

applicationForm.addEventListener('submit', function (event) {
  // Отменяем стандартную отправку формы (перезагрузку страницы)
  event.preventDefault();

  // Считываем значения полей
  const name = applicationForm.name.value.trim();
  const phone = applicationForm.phone.value.trim();
  const direction = applicationForm.direction.value;
  const agree = applicationForm.agree.checked;

  // Простая проверка телефона: должно быть не меньше 10 цифр.
  // Это не строгая валидация номера, а лишь защита от совсем пустых
  // или случайных значений — этого достаточно для формы такого типа.
  const digitsOnly = phone.replace(/\D/g, ''); // убираем всё, кроме цифр

  if (name === '' || digitsOnly.length < 10 || direction === '' || !agree) {
    showFormMessage('Пожалуйста, заполните имя, корректный телефон, направление и согласие.', 'error');
    return;
  }

  // --- Здесь в реальном проекте должна быть отправка данных на сервер ---
  // Например:
  // fetch('/api/application', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({ name, phone, direction })
  // });
  console.log('Новая заявка:', { name, phone, direction });

  showFormMessage('Спасибо! Заявка отправлена, администратор свяжется с вами в ближайшее время.', 'success');
  applicationForm.reset();
});

// Вспомогательная функция: показывает текст под формой нужным цветом
function showFormMessage(text, type) {
  formMessage.textContent = text;
  formMessage.className = 'form__message form__message--' + type;
}


/* --------------------------------------------------------------------------
   5. ТЕКУЩИЙ ГОД В ПОДВАЛЕ
   Чтобы не переписывать "© 2026" вручную каждый год, подставляем год
   автоматически через объект Date.
   -------------------------------------------------------------------------- */

document.getElementById('current-year').textContent = new Date().getFullYear();
