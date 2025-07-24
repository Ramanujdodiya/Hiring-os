/**
 * This file contains helper functions for managing all modals in the application.
 */

import { dom } from './dom.js';

/**
 * Toggles the visibility of a given modal.
 * @param {HTMLElement} modal The modal element to show or hide.
 * @param {boolean} show True to show the modal, false to hide it.
 */
export function toggleModal(modal, show) {
    if (show) {
        modal.classList.remove('opacity-0', 'pointer-events-none');
        modal.classList.add('modal-active');
        modal.querySelector('.modal-content').classList.remove('-translate-y-full');
        modal.querySelector('.modal-content').classList.add('translate-y-0');
    } else {
        modal.classList.add('opacity-0', 'pointer-events-none');
        modal.classList.remove('modal-active');
        modal.querySelector('.modal-content').classList.add('-translate-y-full');
        modal.querySelector('.modal-content').classList.remove('translate-y-0');
    }
}

/**
 * Initializes all modal close buttons and overlays.
 * This function should be called once when the application starts.
 */
export function initializeModals() {
    document.querySelectorAll('.modal-close-btn, .modal-cancel-btn, .modal-overlay').forEach(el => {
        el.addEventListener('click', () => {
            [dom.scheduleModal, dom.analyticsModal, dom.inviteModal, dom.interviewSessionModal].forEach(m => {
                if (m) { // Check if the modal element exists
                    toggleModal(m, false);
                }
            });
        });
    });
}

export function showInterviewSessionModal(show) {
    toggleModal(dom.interviewSessionModal, show);
}
