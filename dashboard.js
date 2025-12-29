const currentUser = sessionStorage.getItem('currentUser');

if (!currentUser) {
    window.location.href = 'index.html';
} else {
    document.getElementById('welcome-message').innerText = `вітаємо, ${currentUser}!`;
}

function addExpense() {
    const amount = document.getElementById('exp-amount').value;
    const category = document.getElementById('exp-category').value;
    const date = document.getElementById('exp-date').value;
    const comment = document.getElementById('exp-comment').value;

    if (!amount || !date) return alert('будь ласка, заповніть суму та дату');

    const newExpense = {
        id: Date.now(),
        user: currentUser,
        amount: parseFloat(amount),
        category: category,
        date: date,
        comment: comment
    };

    let expenses = JSON.parse(localStorage.getItem('expenses_db')) || [];
    expenses.push(newExpense);
    localStorage.setItem('expenses_db', JSON.stringify(expenses));

    alert('витрату додано успішно');
    
    document.getElementById('exp-amount').value = '';
    document.getElementById('exp-comment').value = '';
    document.getElementById('exp-date').value = '';
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

function renderExpenses() {
    const listElement = document.getElementById('expense-list');
    const filterCat = document.getElementById('filter-category').value;
    const expenses = JSON.parse(localStorage.getItem('expenses_db')) || [];
    
    let userExpenses = expenses.filter(e => e.user === currentUser);
    
    // викликаємо нову функцію розрахунку
    calculateCustomStats(userExpenses);

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