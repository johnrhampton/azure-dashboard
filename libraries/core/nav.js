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
 * Hides all modals and shows the main content area
 */
function hideAllModals() {
  const modals = document.querySelectorAll('.modal.is-shown');
  Array.prototype.forEach.call(modals, modal => {
    modal.classList.remove('is-shown');
  });
  showMainContent();
}

/**
 * Handles displays a modal
 * @param  {object} event - Raised event
 */
function handleModalTrigger(event) {
  hideAllModals();
  const modalId = `${event.target.dataset.modal}-modal`;
  const modalToDisplay = document.getElementById(modalId);
  if (modalToDisplay) modalToDisplay.classList.add('is-shown');
}

// handle navigation click events
document.body.addEventListener('click', event => {
  if (event.target.dataset.section) {
    handleSectionNavigation(event);
  } else if (event.target.dataset.modal) {
    handleModalTrigger(event);
  } else if (event.target.classList.contains('modal-hide')) {
    hideAllModals();
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
