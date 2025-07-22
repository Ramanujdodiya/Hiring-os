/**
 * This is the main entry point for the application.
 * It initializes the app, loads data, and sets up all event listeners.
 */

import { state, loadJobs } from './state.js';
import { initializeDom, dom } from './dom.js';
import { handleNewJobSubmit, handleJobsListClick } from './jobs.js';
import { showJobsView, showDashboardView, applyFiltersAndRender } from './views.js';
import { handleLoadCsv, handleTableBodyClick, handleScheduleSubmit, handleNewScorecardSubmit, handleAttendedChange, updateLiveHighlight } from './candidates.js';
import { handleAnalyticsClick } from './analytics.js';
import { initializeModals } from './modals.js';

// This is the main function that runs when the page is loaded.
document.addEventListener('DOMContentLoaded', () => {
    // 1. Find all the HTML elements we need and store them for easy access.
    initializeDom();

    // 2. Load any saved jobs and candidates from local storage.
    loadJobs();

    // 3. Show the main "Hiring Jobs" page by default.
    showJobsView();

    // 4. Set up the logic for all the pop-up modals (like the scheduling modal).
    initializeModals();

    // 5. Attach all the event listeners to make the buttons and forms interactive.
    dom.newJobForm.addEventListener('submit', handleNewJobSubmit);
    dom.jobsList.addEventListener('click', handleJobsListClick);
    dom.backToJobsBtn.addEventListener('click', () => showJobsView());
    dom.backToDashboardBtn.addEventListener('click', () => showDashboardView(state.activeJobIndex));
    dom.loadCsvBtn.addEventListener('click', handleLoadCsv);
    dom.searchInput.addEventListener('input', (e) => {
        state.currentSearchTerm = e.target.value;
        applyFiltersAndRender();
    });
    dom.tableBody.addEventListener('click', handleTableBodyClick);
    dom.scheduleForm.addEventListener('submit', handleScheduleSubmit);
    dom.analyticsBtn.addEventListener('click', handleAnalyticsClick);
    dom.detailAttended.addEventListener('change', handleAttendedChange);
    dom.newScorecardForm.addEventListener('submit', handleNewScorecardSubmit);
    
    // 6. Set up a recurring check every 30 seconds to update the "LIVE" badge for ongoing interviews.
    setInterval(updateLiveHighlight, 30000);
});
