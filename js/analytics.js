/**
 * This file handles all logic related to displaying hiring funnel analytics
 * and generating calendar invites.
 */

import { state } from './state.js';
import { dom } from './dom.js';
import { toggleModal } from './modals.js';

/**
 * Calculates and renders the high-level funnel stats on the main dashboard.
 */
export function renderAnalytics() {
    if (state.activeJobIndex < 0) return;
    const candidates = state.jobs[state.activeJobIndex].candidates;
    const total = candidates.length;
    const scheduled = candidates.filter(c => c.interviewStart).length;
    const attended = candidates.filter(c => c.attended).length;

    // Status breakdown
    const statusOptions = ['Screening', 'Interviewed', 'Offered', 'Rejected', 'Hired'];
    const statusCounts = {};
    statusOptions.forEach(status => {
        statusCounts[status] = candidates.filter(c => (c.status || 'Screening') === status).length;
    });

    dom.analyticsTotal.textContent = total;
    dom.analyticsScheduled.textContent = scheduled;
    dom.analyticsAttended.textContent = attended;

    dom.analyticsScheduledPercent.textContent = total > 0 ? `(${(scheduled / total * 100).toFixed(1)}%) of total` : '';
    dom.analyticsAttendedPercent.textContent = scheduled > 0 ? `(${(attended / scheduled * 100).toFixed(1)}%) of scheduled` : '';

    // Show status breakdown below analytics cards if present
    let statusBreakdownDiv = document.getElementById('status-breakdown');
    if (!statusBreakdownDiv) {
        statusBreakdownDiv = document.createElement('div');
        statusBreakdownDiv.id = 'status-breakdown';
        dom.analyticsTotal.parentElement.parentElement.appendChild(statusBreakdownDiv);
    }
    statusBreakdownDiv.innerHTML = `<div class='mt-4 text-center'><strong>Status Breakdown:</strong> ${statusOptions.map(s => `${statusCounts[s]} ${s}`).join(', ')}</div>`;
}

/**
 * Handles the click event for the "View Analytics" button, showing a detailed modal.
 */
export function handleAnalyticsClick() {
    if (state.activeJobIndex < 0) return;
    const candidates = state.jobs[state.activeJobIndex].candidates;
    const total = candidates.length;
    const scheduled = candidates.filter(c => c.interviewStart).length;
    const attended = candidates.filter(c => c.attended).length;
    const statusOptions = ['Screening', 'Interviewed', 'Offered', 'Rejected', 'Hired'];
    const statusCounts = {};
    statusOptions.forEach(status => {
        statusCounts[status] = candidates.filter(c => (c.status || 'Screening') === status).length;
    });
    dom.analyticsResults.innerHTML = `
        <div class="flex items-center justify-around text-center">
            <div><div class="text-4xl font-bold">${total}</div><div class="text-slate-500">Total</div></div>
            <div class="text-2xl text-slate-400">&rarr;</div>
            <div><div class="text-4xl font-bold">${scheduled}</div><div class="text-slate-500">Scheduled</div></div>
            <div class="text-2xl text-slate-400">&rarr;</div>
            <div><div class="text-4xl font-bold">${attended}</div><div class="text-slate-500">Attended</div></div>
        </div>
        <div class="mt-6 text-center">
            <p><strong>Conversion Rate:</strong> ${total > 0 ? ((scheduled / total) * 100).toFixed(1) : 0}% of candidates were scheduled for an interview.</p>
            <p><strong>Interview Show-up Rate:</strong> ${scheduled > 0 ? ((attended / scheduled) * 100).toFixed(1) : 0}% of scheduled candidates attended their interview.</p>
            <div class='mt-4'><strong>Status Breakdown:</strong> ${statusOptions.map(s => `${statusCounts[s]} ${s}`).join(', ')}</div>
        </div>
    `;
    toggleModal(dom.analyticsModal, true);
}

/**
 * Generates Google Calendar and Outlook invite links for a scheduled interview.
 * @param {number} candidateIndex The index of the candidate in the active job's candidates array.
 */
export function generateInviteLinks(candidateIndex) {
    const candidate = state.jobs[state.activeJobIndex].candidates[candidateIndex];
    const start = new Date(candidate.interviewStart);
    const end = new Date(candidate.interviewEnd);
    const title = `Interview: ${state.jobs[state.activeJobIndex].name} - ${candidate.name}`;
    const description = `Interview with ${candidate.name} for the ${state.jobs[state.activeJobIndex].name} role.`;
    const interviewerEmail = "interviewer@example.com"; // Placeholder - this could be dynamic in a future version

    const formatDate = (date) => date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    
    // Google Calendar Link
    const googleLink = new URL('https://calendar.google.com/calendar/render');
    googleLink.searchParams.append('action', 'TEMPLATE');
    googleLink.searchParams.append('text', title);
    googleLink.searchParams.append('dates', `${formatDate(start)}/${formatDate(end)}`);
    googleLink.searchParams.append('details', description);
    googleLink.searchParams.append('add', candidate.email);
    googleLink.searchParams.append('add', interviewerEmail);
    document.getElementById('google-invite-link').href = googleLink.href;

    // Outlook (mailto with ICS content)
    const icsContent = `BEGIN:VCALENDAR\nVERSION:2.0\nBEGIN:VEVENT\nUID:${Date.now()}\nDTSTAMP:${formatDate(new Date())}\nDTSTART:${formatDate(start)}\nDTEND:${formatDate(end)}\nSUMMARY:${title}\nDESCRIPTION:${description}\nATTENDEE;CN=${candidate.name}:mailto:${candidate.email}\nATTENDEE;CN=Interviewer:mailto:${interviewerEmail}\nEND:VEVENT\nEND:VCALENDAR`;
    const outlookLink = `mailto:${candidate.email}?subject=${encodeURIComponent(title)}&body=${encodeURIComponent("Please accept this calendar invite for your interview.\n\n" + icsContent)}`;
    document.getElementById('outlook-invite-link').href = outlookLink;
}
