const shell = require('electron').shell; // eslint-disable-line import/no-extraneous-dependencies

const links = document.querySelectorAll('a[href]');

// open all links using electron shell
Array.prototype.forEach.call(links, link => {
  const url = link.getAttribute('href');
  if (url.indexOf('http') === 0) {
    link.addEventListener('click', e => {
      e.preventDefault();
      shell.openExternal(url);
    });
  }
});
