const currentUser = sessionStorage.getItem('currentUser');

if (!currentUser) {
    window.location.href = 'index.html';
} else {
    document.getElementById('welcome-message').innerText = `вітаємо, ${currentUser}!`;
}

async function addExpense() {
    const amount = document.getElementById('exp-amount').value;
    const category = document.getElementById('exp-category').value;
    const date = document.getElementById('exp-date').value;
    const comment = document.getElementById('exp-comment').value;

    if (!amount || !date) return alert('заповніть дані');

    const newExpense = {
        id: Date.now(),
        user: currentUser,
        amount: parseFloat(amount),
        category,
        date,
        comment
    };

    const response = await fetch('http://localhost:3000/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newExpense)
    });

    if (response.ok) {
        alert('додано');
        renderExpenses();
    }
}

function logout() {
    sessionStorage.removeItem('currentUser');
    window.location.href = 'index.html';
}

document.addEventListener('DOMContentLoaded', renderExpenses);

function calculateCustomStats(expenses) {
    const startDate = document.getElementById('stats-start').value;
    const endDate = document.getElementById('stats-end').value;
    const output = document.getElementById('stats-output-custom');

    if (!startDate || !endDate) {
        output.innerHTML = 'сума за період: <span>0 грн</span>';
        return;
    }

    const total = expenses
        .filter(e => e.date >= startDate && e.date <= endDate)
        .reduce((sum, e) => sum + e.amount, 0);

    output.innerHTML = `сума за період: <span>${total.toFixed(2)} грн</span>`;
}

async function renderExpenses() {
    const listElement = document.getElementById('expense-list');
    const filterCat = document.getElementById('filter-category').value;
    const startDate = document.getElementById('stats-start').value;
    const endDate = document.getElementById('stats-end').value;

    // завантаження даних із сервера замість локального сховища
    const response = await fetch(`http://localhost:3000/api/expenses/${currentUser}`);
    let userExpenses = await response.json();
    
    calculateCustomStats(userExpenses);
    
    // оновлення графіка, якщо функція присутня в коді
    if (typeof renderManualSvgChart === 'function') {
        renderManualSvgChart(userExpenses);
    }

    // фільтрація для відображення списку під статистикою
    if (startDate && endDate) {
        userExpenses = userExpenses.filter(e => e.date >= startDate && e.date <= endDate);
    }

    if (filterCat !== 'всі') {
        userExpenses = userExpenses.filter(e => e.category === filterCat);
    }
    
    listElement.innerHTML = '';
    userExpenses.forEach(exp => {
        const item = document.createElement('div');
        item.className = `expense-item cat-${exp.category}`;
        item.innerHTML = `
            <div class="expense-info">
                <strong>${exp.amount} грн - ${exp.category}</strong>
                <small>${exp.date} ${exp.comment ? '| ' + exp.comment : ''}</small>
            </div>
            <div class="actions">
                <button class="btn-edit" onclick="prepareEdit(${exp.id})">ред.</button>
                <button class="btn-delete" onclick="deleteExpense(${exp.id})">вид.</button>
            </div>
        `;
        listElement.appendChild(item);
    });
}

function deleteExpense(id) {
    if (!confirm('видалити цей запис?')) return;
    let expenses = JSON.parse(localStorage.getItem('expenses_db')) || [];
    expenses = expenses.filter(e => e.id !== id);
    localStorage.setItem('expenses_db', JSON.stringify(expenses));
    renderExpenses();
}

function prepareEdit(id) {
    const expenses = JSON.parse(localStorage.getItem('expenses_db')) || [];
    const exp = expenses.find(e => e.id === id);
    
    if (exp) {
        document.getElementById('exp-amount').value = exp.amount;
        document.getElementById('exp-category').value = exp.category;
        document.getElementById('exp-date').value = exp.date;
        document.getElementById('exp-comment').value = exp.comment;
        
        // видаляємо старий запис, щоб при збереженні створився оновлений
        deleteExpense(id);
    }
}

// онови функцію addExpense, додавши виклик renderExpenses() в кінці
const originalAddExpense = addExpense;
addExpense = function() {
    originalAddExpense();
    renderExpenses();
};