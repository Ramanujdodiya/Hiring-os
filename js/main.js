/**
 * This is the main entry point for the application.
 * It initializes the app, loads data, and sets up all event listeners.
 */

import { state, loadJobs } from './state.js';
import { initializeDom, dom } from './dom.js';
// Import renderJobs from jobs.js to display jobs on load
import { handleNewJobSubmit, handleJobsListClick, renderJobs } from './jobs.js';
import { showJobsView, showDashboardView, applyFiltersAndRender } from './views.js';
import { handleLoadCsv, handleTableBodyClick, handleScheduleSubmit, handleNewScorecardSubmit, handleAttendedChange, updateLiveHighlight } from './candidates.js';
import { handleAnalyticsClick } from './analytics.js';
import { initializeModals, showInterviewSessionModal } from './modals.js';

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
    
    // 7. Set up a recurring check every 30 seconds to update the "LIVE" badge for ongoing interviews.
    setInterval(updateLiveHighlight, 30000);

    // Monaco loader config (run ONCE)
    if (typeof window.require === 'function') {
        window.require.config({ paths: { 'vs': 'https://cdn.jsdelivr.net/npm/monaco-editor@0.45.0/min/vs' } });
    }

    // Example: Add a global function to open the interview session modal (to be called from a button)
    window.openInterviewSession = function() {
        showInterviewSessionModal(true);

        // --- Jitsi Meet Integration ---
        const videoContainer = document.getElementById('video-call-container');
        videoContainer.innerHTML = '';
        // Check if Jitsi script is loaded
        if (typeof window.JitsiMeetExternalAPI !== 'function') {
            videoContainer.innerHTML = '<div class="text-red-600 p-4">Jitsi Meet script not loaded. Please check your internet connection or try again later.</div>';
        } else {
            // Generate a unique room name (for demo: use job and candidate index)
            let roomName = 'HiringOS_Interview';
            if (window.state && window.state.activeJobIndex >= 0 && window.state.activeCandidateIndex >= 0) {
                roomName += `_job${window.state.activeJobIndex}_cand${window.state.activeCandidateIndex}`;
            } else {
                roomName += `_${Date.now()}`;
            }
            // Jitsi options
            const domain = 'meet.jit.si';
            const options = {
                roomName,
                width: '100%',
                height: 400,
                parentNode: videoContainer,
                configOverwrite: { startWithAudioMuted: false, startWithVideoMuted: false },
                interfaceConfigOverwrite: { TOOLBAR_BUTTONS: [ 'microphone', 'camera', 'desktop', 'fullscreen', 'hangup', 'chat', 'raisehand', 'tileview' ] }
            };
            if (window.jitsiApi) { window.jitsiApi.dispose(); }
            window.jitsiApi = new window.JitsiMeetExternalAPI(domain, options);

            // --- Monaco Editor Integration with Yjs ---
            const editorContainer = document.getElementById('live-code-editor');
            editorContainer.innerHTML = '';
            if (typeof window.require !== 'function') {
                editorContainer.innerHTML = '<div class="text-red-600 p-4">Monaco Editor script not loaded. Please check your internet connection or try again later.</div>';
            } else {
                if (window.monacoEditor) { window.monacoEditor.dispose(); }
                window.require(['vs/editor/editor.main'], function() {
                    // Yjs setup
                    const ydoc = new window.Y.Doc();
                    const ytext = ydoc.getText('monaco');
                    // Use the same room name as Jitsi for y-webrtc
                    const provider = new window.Y.WebrtcProvider(roomName, ydoc);
                    window.monacoEditor = monaco.editor.create(editorContainer, {
                        value: ytext.toString() || '// Start coding together!\n',
                        language: 'javascript',
                        theme: 'vs-dark',
                        automaticLayout: true
                    });
                    // Monaco <-> Yjs binding
                    const monacoBinding = {
                        isApplyingRemote: false
                    };
                    // Update Monaco when Yjs changes
                    ytext.observe(event => {
                        if (monacoBinding.isApplyingRemote) return;
                        monacoBinding.isApplyingRemote = true;
                        const newValue = ytext.toString();
                        if (window.monacoEditor.getValue() !== newValue) {
                            window.monacoEditor.setValue(newValue);
                        }
                        monacoBinding.isApplyingRemote = false;
                    });
                    // Update Yjs when Monaco changes
                    window.monacoEditor.onDidChangeModelContent(() => {
                        if (monacoBinding.isApplyingRemote) return;
                        monacoBinding.isApplyingRemote = true;
                        const value = window.monacoEditor.getValue();
                        if (ytext.toString() !== value) {
                            ytext.delete(0, ytext.length);
                            ytext.insert(0, value);
                        }
                        monacoBinding.isApplyingRemote = false;
                    });
                });
            }
        }
    };
});
