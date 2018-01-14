/**
 * Handles all navigation
 */
const settings = require('electron-settings');

/**
 * [hideAllSectionsAndDeselectButtons description]
 */
function hideAllSectionsAndDeselectButtons() {
  const sections = document.querySelectorAll('.js-section.is-shown');
  Array.prototype.forEach.call(sections, section => {
    section.classList.remove('is-shown');
  });

  const buttons = document.querySelectorAll('.nav-button.is-selected');
  Array.prototype.forEach.call(buttons, button => {
    button.classList.remove('is-selected');
  });
}

/**
 * [handleSectionTrigger description]
 * @param  {[type]} event [description]
 */
function handleSectionTrigger(event) {
  hideAllSectionsAndDeselectButtons();

  // Highlight clicked button and show view
  event.target.classList.add('is-selected');

  // Display the current section
  const sectionId = `${event.target.dataset.section}-section`;
  document.getElementById(sectionId).classList.add('is-shown');

  // Save currently active button in localStorage
  const buttonId = event.target.getAttribute('id');
  settings.set('activeSectionButtonId', buttonId);
}

/**
 * [activateDefaultSection description]
 */
function activateDefaultSection() {
  const buttonWindows = document.getElementById('button-windows');
  if (buttonWindows) buttonWindows.click();
}

/**
 * [showMainContent description]
 */
function showMainContent() {
  document.querySelector('.js-nav').classList.add('is-shown');
  document.querySelector('.js-content').classList.add('is-shown');
}

/**
 * [hideAllModals description]
 */
function hideAllModals() {
  const modals = document.querySelectorAll('.modal.is-shown');
  Array.prototype.forEach.call(modals, modal => {
    modal.classList.remove('is-shown');
  });
  showMainContent();
}

/**
 * [handleModalTrigger description]
 * @param  {[type]} event [description]
 */
function handleModalTrigger(event) {
  hideAllModals();
  const modalId = `${event.target.dataset.modal}-modal`;
  document.getElementById(modalId).classList.add('is-shown');
}

/**
 * [displayAbout description]
 */
function displayDashboard() {
  document.querySelector('#dashboard-modal').classList.add('is-shown');
}

// handle navigation click events
document.body.addEventListener('click', event => {
  if (event.target.dataset.section) {
    handleSectionTrigger(event);
  } else if (event.target.dataset.modal) {
    handleModalTrigger(event);
  } else if (event.target.classList.contains('modal-hide')) {
    hideAllModals();
  }
});

// Default to the view that was active the last time the app was open
const sectionId = settings.get('activeSectionButtonId');
if (sectionId) {
  showMainContent();
  const section = document.getElementById(sectionId);
  if (section) section.click();
} else {
  activateDefaultSection();
  displayDashboard();
}
