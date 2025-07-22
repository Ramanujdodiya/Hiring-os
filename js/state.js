/**
 * This file manages the application's state, acting as a single source of truth.
 * It also handles data persistence by saving to and loading from Local Storage.
 */

// The main state object for the entire application.
export let state = {
    jobs: [],
    activeJobIndex: -1,
    activeCandidateIndex: -1,
    currentSearchTerm: '',
};

/**
 * Saves the current state of the `jobs` array to the browser's local storage.
 * In a future version with a backend, this would be an API call to a database.
 */
export function saveJobs() {
    localStorage.setItem('hiringJobs', JSON.stringify(state.jobs));
}

/**
 * Loads the `jobs` array from local storage when the application starts.
 * In a future version with a backend, this would be an API call to fetch initial data.
 */
export function loadJobs() {
    const savedJobs = localStorage.getItem('hiringJobs');
    if (savedJobs) {
        state.jobs = JSON.parse(savedJobs);
    }
}
