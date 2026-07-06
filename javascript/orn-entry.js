// ==========================
// Sidebar Toggle
// ==========================
function toggleMenu1() {
    document.querySelector(".sidebar").classList.toggle("active");
}

// ==========================
// Logout
// ==========================
function logout() {
    localStorage.removeItem("loggedInUser");
    window.location.href = "/login";
}

const API = "https://ornmanagement-production.up.railway.app";
// ==========================
// Global ORN List
// ==========================
let ornList = [];

// ==========================
// Save ORN
// ==========================
async function saveOrn() {

    const ornData = {
        id:editingId,
        ornNo: document.getElementById("ornNo").value,
        customerName: document.getElementById("customerName").value,
        mobileNumber: document.getElementById("mobileNumber").value,
        location: document.getElementById("location").value,
        amount: parseFloat(document.getElementById("amount").value),
        transactionDate: document.getElementById("transactionDate").value,
        status: document.getElementById("status").value
    };

    try {
        const method=editingId ? "PUT":"POST";

        const url=editingId ?

        `${API}/api/orn/`+editingId

        :

        `${API}/api/orn`;
        await fetch(url,{

        method:method,

        headers:{
        "Content-Type":"application/json"
        },

        body:JSON.stringify(ornData)

        });

        const response = await fetch(`${API}/api/orn`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(ornData)
        });

        if (!response.ok) {
            throw new Error("Failed to save ORN");
        }

        const result = await response.json();

        alert(result.message);
        editingId=null;

        resetForm();

        loadOrnTable();

    } catch (error) {

        console.error(error);

        alert("Unable to save ORN");

    }
}
async function deleteOrn(id){

const ok=confirm("Delete this ORN ?");

if(!ok) return;

await fetch(`${API}/api/orn/`+id,{

method:"DELETE"

});

loadOrnTable();

}

// ==========================
// Reset Form
// ==========================
function resetForm() {
    document.getElementById("ornform").reset();
}

// ==========================
// Load All ORNs
// ==========================
async function loadOrnTable() {

    try {

        const response = await fetch(`${API}/api/orn`);

        if (!response.ok) {
            throw new Error("Failed to fetch ORNs");
        }

        ornList = await response.json();

        displayTable(ornList);

    } catch (error) {

        console.error(error);

        alert("Unable to load ORN records");

    }
}

// ==========================
// Display Table
// ==========================
function displayTable(list) {

    const tbody = document.querySelector("tbody");

    tbody.innerHTML = "";

    if (list.length === 0) {

        tbody.innerHTML = `
            <tr>
                <td colspan="7" style="text-align:center;">
                    No Records Found
                </td>
            </tr>
        `;

        return;
    }

    list.forEach(orn => {

        tbody.innerHTML += `
            <tr>
                <td>${orn.ornNo}</td>
                <td>${orn.customerName}</td>
                <td>${orn.mobileNumber}</td>
                <td>${orn.location}</td>
                <td>${orn.amount}</td>
                <td>${orn.transactionDate}</td>
                <td>${orn.status}</td>

                 <td>

            <button class="edit-btn"
                onclick="editOrn(${orn.id})">

                <i class="fa-solid fa-pen"></i>

            </button>

            <button class="delete-btn"
                onclick="deleteOrn(${orn.id})">

                <i class="fa-solid fa-trash"></i>

            </button>

        </td>

            </tr>
            

        `;

    });

}
let editingId=null;

async function editOrn(id){

    const response=await fetch(`${API}/api/orn/`+id);

    const orn=await response.json();

    editingId=id;

    document.getElementById("ornNo").value=orn.ornNo;
    document.getElementById("customerName").value=orn.customerName;
    document.getElementById("mobileNumber").value=orn.mobileNumber;
    document.getElementById("location").value=orn.location;
    document.getElementById("amount").value=orn.amount;
    document.getElementById("transactionDate").value=orn.transactionDate;
    document.getElementById("status").value=orn.status;

}

// ==========================
// Search ORN
// ==========================
function searchOrn() {

    const keyword = document
        .getElementById("searchOrn")
        .value
        .toLowerCase();

    const filtered = ornList.filter(orn =>
        orn.ornNo.toLowerCase().includes(keyword)
    );

    displayTable(filtered);

}

// ==========================
// Apply Filter
// ==========================
async function applyFilter() {

    try {

        const fromDate = document.getElementById("fromDate").value;
        const toDate = document.getElementById("toDate").value;
        const status = document.getElementById("filterStatus").value;

        const params = new URLSearchParams();

        if (fromDate) params.append("fromDate", fromDate);
        if (toDate) params.append("toDate", toDate);
        if (status) params.append("status", status);

        const response = await fetch(`${API}/api/orn/filter?${params.toString()}`);

        if (!response.ok) {
            throw new Error("Filter request failed");
        }

        const data = await response.json();

        ornList = data;

        displayTable(ornList);

    } catch (error) {

        console.error(error);

        alert("Unable to apply filter");

    }

}

// ==========================
// Clear Filter
// ==========================
function clearFilter() {

    document.getElementById("fromDate").value = "";
    document.getElementById("toDate").value = "";
    document.getElementById("filterStatus").value = "";

    loadOrnTable();

}

// ==========================
// Initial Load
// ==========================
window.onload = function () {
    loadOrnTable();
};