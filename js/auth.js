// Simple localStorage-based auth for demo purposes
// Users are stored as { email, password, role }

const form = document.getElementById('auth-form');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const roleInputs = document.getElementsByName('role');
const errorDiv = document.getElementById('auth-error');
const actionBtn = document.getElementById('auth-action-btn');
const toggleBtn = document.getElementById('toggle-auth-mode');

let isLogin = true;

function getUsers() {
  return JSON.parse(localStorage.getItem('hiringUsers') || '[]');
}
function saveUsers(users) {
  localStorage.setItem('hiringUsers', JSON.stringify(users));
}
function setSession(user) {
  localStorage.setItem('hiringSession', JSON.stringify({ email: user.email, role: user.role }));
}

function showError(msg) {
  errorDiv.textContent = msg;
  errorDiv.classList.remove('hidden');
}
function clearError() {
  errorDiv.textContent = '';
  errorDiv.classList.add('hidden');
}

function getSelectedRole() {
  for (const r of roleInputs) if (r.checked) return r.value;
  return 'candidate';
}

toggleBtn.addEventListener('click', () => {
  isLogin = !isLogin;
  actionBtn.textContent = isLogin ? 'Login' : 'Signup';
  toggleBtn.textContent = isLogin ? "Don't have an account? Signup" : 'Already have an account? Login';
  clearError();
});

form.addEventListener('submit', (e) => {
  e.preventDefault();
  clearError();
  const email = emailInput.value.trim().toLowerCase();
  const password = passwordInput.value;
  const role = getSelectedRole();
  if (!email || !password) {
    showError('Please fill all fields.');
    return;
  }
  let users = getUsers();
  if (isLogin) {
    const user = users.find(u => u.email === email && u.role === role);
    if (!user || user.password !== password) {
      showError('Invalid credentials or role.');
      return;
    }
    setSession(user);
    window.location.href = 'index.html';
  } else {
    if (users.find(u => u.email === email && u.role === role)) {
      showError('User already exists for this role.');
      return;
    }
    const newUser = { email, password, role };
    users.push(newUser);
    saveUsers(users);
    setSession(newUser);
    window.location.href = 'index.html';
  }
});
