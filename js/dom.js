/**
 * This file centralizes all DOM element selections for the entire application,
 * making it easier to manage and access HTML elements from any other module.
 */

// This object will be populated with references to all the DOM elements.
export const dom = {};

/**
 * Initializes the `dom` object by selecting all necessary elements from the HTML.
 * This function should be called once when the application starts.
 */
export function initializeDom() {
    // === Main Views ===
    dom.jobsView = document.getElementById('jobs-view');
    dom.dashboardView = document.getElementById('dashboard-view');
    dom.candidateDetailView = document.getElementById('candidate-detail-view');

    // === Modals ===
    dom.scheduleModal = document.getElementById('schedule-modal');
    dom.analyticsModal = document.getElementById('analytics-modal');
    dom.inviteModal = document.getElementById('invite-modal');

    // === Jobs View Elements ===
    dom.newJobForm = document.getElementById('new-job-form');
    dom.newJobNameInput = document.getElementById('new-job-name');
    dom.jobsList = document.getElementById('jobs-list');
    dom.noJobsMsg = document.getElementById('no-jobs');

    // === Dashboard View Elements ===
    dom.dashboardTitle = document.getElementById('dashboard-title');
    dom.tableBody = document.getElementById('candidates-table-body');
    dom.searchInput = document.getElementById('search-input');
    dom.noResultsEl = document.getElementById('no-results');
    dom.csvFileInput = document.getElementById('csv-file-input');
    dom.loadCsvBtn = document.getElementById('load-csv-btn');
    dom.backToJobsBtn = document.getElementById('back-to-jobs-btn');
    dom.analyticsBtn = document.getElementById('analytics-btn');
    dom.analyticsTotal = document.getElementById('analytics-total');
    dom.analyticsScheduled = document.getElementById('analytics-scheduled');
    dom.analyticsScheduledPercent = document.getElementById('analytics-scheduled-percent');
    dom.analyticsAttended = document.getElementById('analytics-attended');
    dom.analyticsAttendedPercent = document.getElementById('analytics-attended-percent');

    // === Candidate Detail View Elements ===
    dom.backToDashboardBtn = document.getElementById('back-to-dashboard-btn');
    dom.detailName = document.getElementById('detail-name');
    dom.detailEmail = document.getElementById('detail-email');
    dom.detailCollege = document.getElementById('detail-college');
    dom.detailYear = document.getElementById('detail-year');
    dom.detailResume = document.getElementById('detail-resume');
    dom.detailGithub = document.getElementById('detail-github');
    dom.detailDeployed = document.getElementById('detail-deployed');
    dom.detailAttended = document.getElementById('detail-attended');
    dom.newScorecardForm = document.getElementById('new-scorecard-form');
    dom.scorecardsList = document.getElementById('scorecards-list');

    // === Schedule Modal Elements ===
    dom.scheduleForm = document.getElementById('schedule-form');
    dom.scheduleDateInput = document.getElementById('schedule-date');
    dom.scheduleTimeInput = document.getElementById('schedule-time');
    dom.scheduleDurationInput = document.getElementById('schedule-duration');
    dom.cancelInterviewBtn = document.getElementById('cancel-interview-btn');
    
    // === Analytics Modal Elements ===
    dom.analyticsResults = document.getElementById('analytics-results');
}
