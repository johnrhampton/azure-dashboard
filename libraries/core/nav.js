const { ipcRenderer: ipc } = require('electron');
const settings = require('electron-settings');

const ACTIVE_SECTION = 'active-section';
const defaultSection = 'service-bus';
const mainNavDrawer = document.getElementById('main-nav-drawer');

/**
 * Hides active section, closes drawer, deselects navigation links
 */
function prepForSectionDisplay() {
  // hide active sections
  const sections = document.querySelectorAll('.js-section.is-shown');
  Array.prototype.forEach.call(sections, section => {
    section.classList.remove('is-shown');
  });

  // created by material design lite
  const mdlObfuscator = document.getElementsByClassName('mdl-layout__obfuscator');
  // close drawer and remove obfuscator
  if (mainNavDrawer) mainNavDrawer.classList.remove('is-visible');
  if (mdlObfuscator && mdlObfuscator[0]) mdlObfuscator[0].classList.remove('is-visible');

  // deselect nav links
  const navLinks = document.querySelectorAll('.mdl-navigation__link.is-selected');
  Array.prototype.forEach.call(navLinks, link => {
    link.classList.remove('is-selected');
  });
}

/**
 * Displays a section
 * @param  {string} section - Selected section
 */
function displaySection(section) {
  const sectionId = `${section}-section`;
  const selectionElement = document.getElementById(sectionId);
  if (selectionElement) selectionElement.classList.add('is-shown');
}

/**
 * Handles navigation to a section
 * @param  {object} event - Raised event
 */
function handleSectionNavigation(event) {
  prepForSectionDisplay();

  // add is-selected class to navigation link
  event.target.classList.add('is-selected');

  // display the current section
  displaySection(event.target.dataset.section);

  // Save currently active link
  const activeSection = event.target.dataset.section;
  settings.set(ACTIVE_SECTION, activeSection);
}

/**
 * Shows the main content area
 */
function showMainContent() {
  const content = document.querySelector('.js-content');
  if (content) content.classList.add('is-shown');
}

/**
 * Closes a modal
 * @param {string} modal - Modal to close
 */
function hideModal(modal) {
  ipc.send('request-modal-close', { modal });
}

/**
 * Handles displays a modal
 * @param {string} modal - Modal to open
 */
function showModal(modal) {
  ipc.send('request-modal-open', { modal });
}

// handle navigation click events
document.body.addEventListener('click', event => {
  const { dataset } = event.target;
  if (dataset.section) {
    handleSectionNavigation(event);
  } else if (dataset.modal && dataset.modalAction !== 'close') {
    showModal(dataset.modal);
  } else if (dataset.modal && dataset.modalAction === 'close') {
    hideModal(dataset.modal);
  }
});

// Default to the view that was active the last time the app was open
const section = settings.get(ACTIVE_SECTION);
if (section) {
  showMainContent();
  displaySection(section);
} else {
  displaySection(defaultSection);
}
