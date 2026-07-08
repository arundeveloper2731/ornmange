function toggleMenu() {
    document.querySelector(".sidebar")
        .classList.toggle("active");
}
function logout() {
    localStorage.removeItem("loggedInUser");
    window.location.href = "login.html";
}

const API = "https://ornmanagement-production.up.railway.app";

const API_URL = `${API}/api/expenses`;

const form = document.getElementById("expenseForm");

const expenseName = document.getElementById("expenseName");
const amount = document.getElementById("amount");
const expenseDate = document.getElementById("expenseDate");
const orn = document.getElementById("orn");
const description = document.getElementById("description");

const tableBody = document.getElementById("expenseTableBody");

let editId = null;

// Load expenses
window.onload = function () {
    loadExpenses();
};

// Save / Update
form.addEventListener("submit", async function (e) {

    e.preventDefault();
    console.log(expenseName);
    console.log(amount);
    console.log(expenseDate);
    console.log(orn);
    console.log(description);

    const expense = {

        expenseName: expenseName.value,
        amount: amount.value,
        expenseDate: expenseDate.value,
        orn: orn.value,
        description: description.value

    };

    if (editId == null) {

        await fetch(API_URL, {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify(expense)

        });

    } else {

        await fetch(API_URL + "/" + editId, {

            method: "PUT",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify(expense)

        });

        editId = null;

    }

    form.reset();

    loadExpenses();

});


// Load table
async function loadExpenses() {

    const response = await fetch(API_URL);

    const expenses = await response.json();

    tableBody.innerHTML = "";

    expenses.forEach(expense => {

        let row = document.createElement("tr");

        row.innerHTML = `

        <td>${expense.expenseDate}</td>

        <td>${expense.expenseName}</td>

        <td>${expense.orn}</td>

        <td>${expense.description}</td>

        <td>₹${expense.amount}</td>

        <td class="action-btn">

            <button class="edit-btn"
                onclick="editExpense(${expense.id})">
                Edit
            </button>

            <button class="delete-btn"
                onclick="deleteExpense(${expense.id})">
                Delete
            </button>

        </td>

        `;

        tableBody.appendChild(row);

    });

}


// Delete

async function deleteExpense(id) {

    if (!confirm("Delete this expense?"))
        return;

    await fetch(API_URL + "/" + id, {

        method: "DELETE"

    });

    loadExpenses();

}


// Edit

async function editExpense(id) {

    const response = await fetch(API_URL + "/" + id);

    const expense = await response.json();

    expenseName.value = expense.expenseName;
    amount.value = expense.amount;
    expenseDate.value = expense.expenseDate;
    orn.value = expense.orn;
    description.value = expense.description;

    editId = expense.id;

}