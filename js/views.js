import { dom } from './dom.js';
import { renderJobs } from './jobs.js';
import { renderTable } from './candidates.js';
import { renderAnalytics } from './analytics.js';
import { state } from './state.js';

export function showJobsView() {
  dom.jobsView.classList.remove('hidden');
  dom.dashboardView.classList.add('hidden');
  dom.candidateDetailView.classList.add('hidden');
  renderJobs();
}

export function showDashboardView(jobIndex) {
  state.activeJobIndex = jobIndex;
  const job = state.jobs[jobIndex];
  dom.dashboardTitle.textContent = job?.name || '';
  // Add job metadata display
  const dashboardHeader = dom.dashboardTitle.parentElement;
  let metaDiv = dashboardHeader.querySelector('.job-meta');
  if (!metaDiv) {
    metaDiv = document.createElement('div');
    metaDiv.className = 'job-meta text-slate-600 mt-2';
    dashboardHeader.appendChild(metaDiv);
  }
  metaDiv.innerHTML = `
    <div><span class='font-semibold'>Location:</span> ${job?.location || 'N/A'}</div>
    <div><span class='font-semibold'>Department:</span> ${job?.department || 'N/A'}</div>
    <div><span class='font-semibold'>Description:</span> ${job?.description || 'N/A'}</div>
  `;
  dom.jobsView.classList.add('hidden');
  dom.dashboardView.classList.remove('hidden');
  dom.candidateDetailView.classList.add('hidden');
  applyFiltersAndRender();
}

export function showCandidateDetailView(candidateIndex) {
  state.activeCandidateIndex = candidateIndex;
  dom.jobsView.classList.add('hidden');
  dom.dashboardView.classList.add('hidden');
  dom.candidateDetailView.classList.remove('hidden');
}

export function applyFiltersAndRender() {
  if (state.activeJobIndex < 0) return;
  let filteredData = state.jobs[state.activeJobIndex].candidates;
  if (state.currentSearchTerm) {
    const term = state.currentSearchTerm.toLowerCase();
    filteredData = filteredData.filter(c => c.name?.toLowerCase().includes(term) || c.email?.toLowerCase().includes(term));
  }
  renderTable(filteredData);
  renderAnalytics();
} 