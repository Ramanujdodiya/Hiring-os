/**
 * This file contains all logic related to managing job postings,
 * including rendering the job list and handling creation/deletion.
 */

import { state, saveJobs } from './state.js';
import { dom } from './dom.js';
import { showDashboardView } from './views.js';

/**
 * Renders the list of job cards on the main projects/jobs view.
 */
export function renderJobs() {
    dom.jobsList.innerHTML = '';
    dom.noJobsMsg.classList.toggle('hidden', state.jobs.length > 0);
    state.jobs.forEach((job, index) => {
        const card = document.createElement('div');
        card.className = 'bg-white p-6 rounded-lg shadow-sm border border-slate-200 flex flex-col justify-between';
        card.innerHTML = `
            <div>
                <h3 class="text-lg font-bold text-slate-800">${job.name}</h3>
                <p class="text-slate-500 mt-1">${job.candidates.length} candidate(s)</p>
                <p class="text-slate-600 mt-1"><span class='font-semibold'>Location:</span> ${job.location || 'N/A'}</p>
                <p class="text-slate-600 mt-1"><span class='font-semibold'>Department:</span> ${job.department || 'N/A'}</p>
                <p class="text-slate-600 mt-1"><span class='font-semibold'>Description:</span> ${job.description || 'N/A'}</p>
            </div>
            <div class="mt-4 flex gap-2">
                <button data-index="${index}" class="view-job-btn flex-grow bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700">View</button>
                <button data-index="${index}" class="delete-job-btn bg-red-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-red-600">Delete</button>
            </div>
        `;
        dom.jobsList.appendChild(card);
    });
}

/**
 * Handles the submission of the "Create New Job" form.
 * @param {Event} e The form submission event.
 */
export function handleNewJobSubmit(e) {
    e.preventDefault();
    const jobName = dom.newJobNameInput.value.trim();
    const jobLocation = document.getElementById('new-job-location').value.trim();
    const jobDepartment = document.getElementById('new-job-department').value.trim();
    const jobDescription = document.getElementById('new-job-description').value.trim();
    if (jobName) {
        state.jobs.push({
            name: jobName,
            location: jobLocation,
            department: jobDepartment,
            description: jobDescription,
            candidates: []
        });
        saveJobs();
        dom.newJobNameInput.value = '';
        document.getElementById('new-job-location').value = '';
        document.getElementById('new-job-department').value = '';
        document.getElementById('new-job-description').value = '';
        renderJobs();
    }
}

/**
 * Handles click events on the job list (view and delete buttons).
 * @param {Event} e The click event.
 */
export function handleJobsListClick(e) {
    const index = e.target.dataset.index;
    if (index === undefined) return;
    if (e.target.classList.contains('view-job-btn')) {
        showDashboardView(parseInt(index));
    } else if (e.target.classList.contains('delete-job-btn')) {
        if (confirm(`Are you sure you want to delete "${state.jobs[index].name}"?`)) {
            state.jobs.splice(index, 1);
            saveJobs();
            renderJobs();
        }
    }
}
