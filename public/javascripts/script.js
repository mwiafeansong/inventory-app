const closeBtn = document.querySelector('.close');
const menuBtn = document.querySelector('.menu');
const aside = document.querySelector('aside');

menuBtn.addEventListener('click', () => {
  aside.classList.add('visible');
  aside.classList.remove('invisible');
});

closeBtn.addEventListener('click', () => {
  aside.classList.add('invisible');
  aside.classList.remove('visible');
});
