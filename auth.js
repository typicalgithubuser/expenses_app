function toggleForms() {
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    if (loginForm.style.display === 'none') {
        loginForm.style.display = 'block';
        registerForm.style.display = 'none';
    } else {
        loginForm.style.display = 'none';
        registerForm.style.display = 'block';
    }
}

function getUsers() {
    const users = localStorage.getItem('users_db');
    return users ? JSON.parse(users) : [];
}

function register() {
    const user = document.getElementById('reg-username').value;
    const pass = document.getElementById('reg-password').value;
    
    if (!user || !pass) return alert('заповніть усі поля');
    
    let users = getUsers();
    if (users.find(u => u.username === user)) {
        return alert('користувач вже існує');
    }
    
    users.push({ username: user, password: pass });
    localStorage.setItem('users_db', JSON.stringify(users));
    alert('реєстрація успішна');
    toggleForms();
}

function login() {
    const user = document.getElementById('login-username').value;
    const pass = document.getElementById('login-password').value;
    
    let users = getUsers();
    const foundUser = users.find(u => u.username === user && u.password === pass);
    
    if (foundUser) {
        sessionStorage.setItem('currentUser', user);
        window.location.href = 'dashboard.html';
    } else {
        alert('невірний логін або пароль');
    }
}