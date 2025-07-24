/**
 * This file contains all logic related to managing individual candidates,
 * including CSV parsing, rendering the table, scheduling, and scorecards.
 */

import { state, saveJobs } from './state.js';
import { dom } from './dom.js';
import { applyFiltersAndRender, showCandidateDetailView } from './views.js';
import { toggleModal } from './modals.js';
import { callGeminiAPI } from './ai.js';
import { generateInviteLinks } from './analytics.js';

/**
 * Renders the main table of candidates on the dashboard.
 * @param {Array} data The array of candidate objects to render.
 */
export function renderTable(data) {
    dom.tableBody.innerHTML = '';
    dom.noResultsEl.classList.toggle('hidden', data.length > 0);
    dom.noResultsEl.textContent = state.jobs[state.activeJobIndex].candidates.length === 0 ? 'No candidates loaded.' : 'No candidates match search.';
    data.forEach(candidate => {
        const originalIndex = state.jobs[state.activeJobIndex].candidates.findIndex(c => c.id === candidate.id);
        const row = document.createElement('tr');
        row.className = 'hover:bg-slate-50';
        row.dataset.candidateId = candidate.id;

        row.innerHTML = `
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">${candidate.name || 'N/A'}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-500" title="${candidate.email}">${candidate.email || 'N/A'}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm"><a href="${candidate.resume || '#'}" target="_blank" class="text-blue-600 hover:underline">Resume</a></td>
            <td class="px-6 py-4 whitespace-nowrap text-sm"><a href="${candidate.github || '#'}" target="_blank" class="text-gray-800 hover:underline">GitHub</a></td>
            <td class="px-6 py-4 whitespace-nowrap text-sm"><a href="${candidate.deployedLink || '#'}" target="_blank" class="text-green-700 hover:underline">Portfolio</a></td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-center flex gap-2 justify-center">
                <button data-index="${originalIndex}" class="view-details-btn bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700 text-xs">View Details</button>
                <button data-index="${originalIndex}" class="schedule-btn bg-green-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-700 text-xs">Schedule</button>
            </td>
        `;
        dom.tableBody.appendChild(row);
    });
}

/**
 * Handles the file selection for CSV upload and initiates parsing.
 */
export function handleLoadCsv() {
    if (state.activeJobIndex < 0) return;
    const file = dom.csvFileInput.files[0];
    if (!file) { alert('Please select a CSV file first.'); return; }
    
    Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
            try {
                const parsedData = processAndMapCsvData(results);
                if (parsedData === null) return;
                
                state.jobs[state.activeJobIndex].candidates = parsedData.map((candidate, index) => ({
                    ...candidate, id: `candidate-${index}`, attended: false, reviews: [], interviewStart: null, interviewEnd: null, atsScore: null, status: 'Screening'
                }));
                
                saveJobs();
                state.currentSearchTerm = ''; 
                dom.searchInput.value = '';
                applyFiltersAndRender();
            } catch (error) {
                console.error("Error processing CSV data:", error);
                alert("Failed to process the CSV data.");
            }
        },
        error: (error) => console.error("Papa Parse Error:", error)
    });
}

/**
 * Maps the columns from the parsed CSV to the application's candidate data structure.
 * @param {object} results The results object from Papa Parse.
 * @returns {Array|null} An array of candidate objects or null if required columns are missing.
 */
function processAndMapCsvData(results) {
    const columnMapping = {
        name: ['name'], email: ['email', 'email addr'], resume: ['resume'],
        college: ['college', 'name of it', 'institution'], year: ['year', 'grad', 'passout'],
        deployedLink: ['deployed', 'live link', 'portfolio', 'your curre link to you'], github: ['github', 'git', 'repository']
    };
    const rawData = results.data;
    const header = results.meta.fields.map(h => h.toLowerCase());
    const headerIndexMap = {};
    for (const field in columnMapping) {
        headerIndexMap[field] = null;
        for (const alias of columnMapping[field]) {
            const foundHeader = header.find(h => h.includes(alias));
            if (foundHeader) {
                headerIndexMap[field] = results.meta.fields[header.indexOf(foundHeader)];
                break;
            }
        }
    }
    if (!headerIndexMap.name || !headerIndexMap.email) {
        alert('CSV must contain identifiable "Name" and "Email" columns.');
        return null;
    }
    return rawData.map(row => {
        const candidate = {};
        for (const field in headerIndexMap) {
            const headerName = headerIndexMap[field];
            candidate[field] = headerName ? row[headerName] : '';
        }
        return candidate;
    }).filter(candidate => candidate.name && candidate.name.trim() !== '');
}

/**
 * Central event handler for clicks within the main candidate table body.
 * @param {Event} e The click event.
 */
export async function handleTableBodyClick(e) {
    const index = e.target.dataset.index;
    if (index === undefined) return;
    const candidate = state.jobs[state.activeJobIndex].candidates[index];

    if (e.target.classList.contains('view-details-btn')) {
        showCandidateDetailView(parseInt(index));
    } else if (e.target.classList.contains('schedule-btn')) {
        e.preventDefault();
        state.activeCandidateIndex = index;
        dom.scheduleForm.reset();
        dom.cancelInterviewBtn.classList.toggle('hidden', !candidate.interviewStart);
        if (candidate.interviewStart) {
            const d = new Date(candidate.interviewStart);
            dom.scheduleDateInput.value = d.toISOString().split('T')[0];
            dom.scheduleTimeInput.value = d.toTimeString().substring(0, 5);
            const duration = (new Date(candidate.interviewEnd) - d) / 60000;
            dom.scheduleDurationInput.value = duration;
        }
        toggleModal(dom.scheduleModal, true);
    } else if (e.target.classList.contains('ai-score-btn')) {
        candidate.isScoring = true;
        applyFiltersAndRender();
        const prompt = `Based on the following candidate profile for a "${state.jobs[state.activeJobIndex].name}" role, please provide an ATS score out of 100. Consider their college: "${candidate.college}" and graduation year: "${candidate.year}". Only return the number.`;
        const score = await callGeminiAPI(prompt);
        candidate.atsScore = parseInt(score, 10) || 'N/A';
        delete candidate.isScoring;
        saveJobs();
        applyFiltersAndRender();
    }
}

/**
 * Handles the submission of the interview scheduling form.
 * @param {Event} e The form submission event.
 */
export function handleScheduleSubmit(e) {
    e.preventDefault();
    if (state.activeJobIndex < 0 || state.activeCandidateIndex < 0) return;
    const candidate = state.jobs[state.activeJobIndex].candidates[state.activeCandidateIndex];
    const date = dom.scheduleDateInput.value, time = dom.scheduleTimeInput.value;
    const duration = parseInt(dom.scheduleDurationInput.value, 10);
    if (!date || !time || !duration) { alert("Please fill all fields."); return; }
    const start = new Date(`${date}T${time}`);
    const end = new Date(start.getTime() + duration * 60000);
    candidate.interviewStart = start.toISOString();
    candidate.interviewEnd = end.toISOString();
    saveJobs();
    toggleModal(dom.scheduleModal, false);
    generateInviteLinks(state.activeCandidateIndex);
    toggleModal(dom.inviteModal, true);
    applyFiltersAndRender();
}

/**
 * Renders the list of scorecards on the candidate detail page.
 */
export function renderScorecards() {
    const candidate = state.jobs[state.activeJobIndex].candidates[state.activeCandidateIndex];
    dom.scorecardsList.innerHTML = '';
    if (!candidate.reviews || candidate.reviews.length === 0) {
        dom.scorecardsList.innerHTML = '<p class="text-slate-500">No reviews submitted yet.</p>';
        return;
    }
    candidate.reviews.forEach(review => {
        const card = document.createElement('div');
        card.className = 'bg-white p-4 rounded-lg border border-slate-200';
        card.innerHTML = `
            <div class="flex justify-between items-center">
                <h5 class="font-bold text-slate-800">${review.interviewer}</h5>
                <div class="text-sm text-slate-500">${new Date(review.date).toLocaleDateString()}</div>
            </div>
            <div class="grid grid-cols-3 gap-2 text-center text-sm mt-2">
                <div><span class="font-semibold">Problem Solving:</span> ${review.scores.problemSolving}/5</div>
                <div><span class="font-semibold">Technical Skills:</span> ${review.scores.technicalSkills}/5</div>
                <div><span class="font-semibold">Communication:</span> ${review.scores.communication}/5</div>
            </div>
            <p class="mt-3 text-slate-600">${review.notes.replace(/\n/g, '<br>')}</p>
        `;
        dom.scorecardsList.appendChild(card);
    });
}

/**
 * Handles the submission of a new scorecard/review.
 * @param {Event} e The form submission event.
 */
export function handleNewScorecardSubmit(e) {
    e.preventDefault();
    if (state.activeJobIndex < 0 || state.activeCandidateIndex < 0) return;
    const candidate = state.jobs[state.activeJobIndex].candidates[state.activeCandidateIndex];
    
    const newReview = {
        interviewer: document.getElementById('scorecard-interviewer').value,
        scores: {
            problemSolving: document.getElementById('score-problem-solving').value,
            technicalSkills: document.getElementById('score-technical-skills').value,
            communication: document.getElementById('score-communication').value,
        },
        notes: document.getElementById('scorecard-notes').value,
        date: new Date().toISOString()
    };

    if (!candidate.reviews) candidate.reviews = [];
    candidate.reviews.push(newReview);
    saveJobs();
    renderScorecards();
    dom.newScorecardForm.reset();
}

/**
 * Handles the change event for the "Attended" checkbox.
 * @param {Event} e The change event.
 */
export function handleAttendedChange(e) {
    if (state.activeJobIndex > -1 && state.activeCandidateIndex > -1) {
        state.jobs[state.activeJobIndex].candidates[state.activeCandidateIndex].attended = e.target.checked;
        saveJobs();
    }
}

/**
 * Updates the visual indicator for any currently live interviews.
 */
export function updateLiveHighlight() {
    if (state.activeJobIndex < 0) return;
   const now = new Date();
   dom.tableBody.querySelectorAll('tr').forEach(row => {
       const candidate = state.jobs[state.activeJobIndex].candidates.find(c => c.id === row.dataset.candidateId);
       if (!candidate || !candidate.interviewStart) return;
       const start = new Date(candidate.interviewStart);
       const end = new Date(candidate.interviewEnd);
       row.classList.toggle('live-interview', start <= now && now <= end);
       row.querySelector('.status-cell').innerHTML = (start <= now && now <= end) ? '<span class="live-badge">LIVE</span>' : '';
   });
}
