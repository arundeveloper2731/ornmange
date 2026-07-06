function toggleMenu() {
    document.querySelector(".sidebar")
        .classList.toggle("active");
}
function logout() {
    localStorage.removeItem("loggedInUser");
    window.location.href = "login.html";
}


const fromDate = document.getElementById("fromDate");
const toDate = document.getElementById("toDate");
const status = document.getElementById("status");

const searchBtn = document.querySelector(".search-btn");
const exportExcelBtn = document.querySelector(".export");
const exportPdfBtn = document.querySelector(".pdf");

const reportTable = document.getElementById("reportTable");

// Summary Cards
const totalOrn = document.getElementById("totalOrn");
const matched = document.getElementById("matched");
const unmatched = document.getElementById("unmatched");
const expense = document.getElementById("expense");

async function loadSummary() {

    try {

        const response = await fetch("/api/reports/summary");

        if (!response.ok)
            throw new Error("Unable to load summary");

        const data = await response.json();

        totalOrn.textContent = data.totalOrn;
        matched.textContent = data.matched;
        unmatched.textContent = data.unmatched;
        expense.textContent = "₹" + data.totalExpense.toFixed(2);

    } catch (err) {

        console.error(err);

    }

}

async function loadReports() {

    try {

        let url = "/api/reports?";

        if (fromDate.value)
            url += "from=" + fromDate.value + "&";

        if (toDate.value)
            url += "to=" + toDate.value + "&";

        if (status.value !== "All")
            url += "status=" + status.value + "&";


        const response = await fetch(url);

        if (!response.ok)
            throw new Error("Failed to load report");

        const reports = await response.json();

        reportTable.innerHTML = "";

        if (reports.length === 0) {

            reportTable.innerHTML = `
                <tr>
                    <td colspan="7" style="text-align:center;">
                        No Records Found
                    </td>
                </tr>
            `;

            return;
        }

        reports.forEach(report => {

            reportTable.innerHTML += `
                <tr>
                    <td>${report.ornNumber}</td>
                    <td>${report.customer}</td>
                    <td>${report.location}</td>
                    <td>${report.status}</td>
                    <td>₹${report.expense}</td>
                    <td>${report.date}</td>
                </tr>
            `;

        });

    } catch (err) {

        console.error(err);

    }

}

searchBtn.addEventListener("click", () => {

    loadReports();

});

exportExcelBtn.addEventListener("click", () => {

    let url = "/api/reports/export/excel?";

    if (fromDate.value)
        url += "from=" + fromDate.value + "&";

    if (toDate.value)
        url += "to=" + toDate.value + "&";

    if (status.value !== "All")
        url += "status=" + status.value + "&";


    window.location.href = url;

});

exportPdfBtn.addEventListener("click", () => {

    let url = "/api/reports/export/pdf?";

    if (fromDate.value)
        url += "from=" + fromDate.value + "&";

    if (toDate.value)
        url += "to=" + toDate.value + "&";

    if (status.value !== "All")
        url += "status=" + status.value + "&";


    window.location.href = url;

});

window.onload = () => {

    loadSummary();
    loadReports();

};