function toggleMenu() {
    document.querySelector(".sidebar").classList.toggle("active");
}

function logout() {
    localStorage.removeItem("loggedInUser");
    window.location.href = "login.html";
}

const API = "https://ornmanagement-production.up.railway.app";


// chart
let chart;

window.onload = function () {
    loadDashboard();
};

async function loadDashboard() {
    try {
        const response = await fetch(`${API}/api/index`);
        if (!response.ok) {
            throw new Error("API Error");
        }

        const data = await response.json();

        //cards
        document.getElementById("totalORN").innerText = data.totalORN;
        document.getElementById("excelrecords").innerText = data.excelRecords;
        document.getElementById("matchedORN").innerText = data.matchedCount || 0;
        document.getElementById("duplicateORN").innerText = data.duplicateCount || 0;
        document.getElementById("unMatchedORN").innerText = data.unmatchedCount || 0;
        document.getElementById("totalExpense").innerText = data.totalExpense;


        document.getElementById("matchedCount").innerText = data.matchedCount || 0;
        document.getElementById("duplicateORN").innerText = data.duplicateCount || 0;
        document.getElementById("unMatchedORN").innerText = data.unmatchedCount || 0;




        //Table
        loadRecentEntries(data.recentEntries || []);
        //chart
        loadChart(data);
    } catch (error) {
        console.log(error);
        alert("Unable to load dashbord");
    }
}

//loardrecententri
function loadRecentEntries(list) {
    const tbody = document.querySelector("tbody");

    tbody.innerHTML = "";
    list.forEach(item => {

        tbody.innerHTML += `
        <tr>
        <td>${item.ornNo}</td>
        <td>${item.customerName}</td>
        <td>${item.date}</td>
        <td>${item.status}</td>
        </tr> `;

    });
}

//chart

function loadChart(data) {

    const ctx = document.getElementById("ornchart");

    if (chart) {
        chart.destroy();
    }

    chart = new Chart(ctx, {

        type: "pie",

        data: {

            labels: [
                "Matched ORN",
                "Duplicate ORN",
                "UnMatched ORN"
            ],

            datasets: [{

                data: [
                    data.matchedCount || 0,
                    data.duplicateCount || 0,
                    data.unmatchedCount || 0
                ],

                backgroundColor: [
                    "#28a745",
                    "#ff9800",
                    "#dc3545"
                ],

                borderWidth: 2

            }]

        },

        options: {

            responsive: true,

            plugins: {

                legend: {
                    position: "bottom"
                }

            }

        }

    });

}