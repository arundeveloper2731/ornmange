function toggleMenu() {
    document.querySelector(".sidebar")
        .classList.toggle("active");
}
function logout() {
    localStorage.removeItem("loggedInUser");
    window.location.href = "login.html";
}

const API = "https://ornmanagement-production.up.railway.app";

const runMatchBtn = document.getElementById("runMatchBtn");
const tableBody = document.getElementById("tableBody");

const emptyState = document.getElementById("emptyState");
const resultSection = document.getElementById("resultSection");

const matchedCount = document.getElementById("matchedCount");
const partialCount = document.getElementById("partialCount");
const missingExcelCount = document.getElementById("missingExcelCount");
const missingManualCount = document.getElementById("missingManualCount");
const duplicateCount = document.getElementById("duplicateCount");

const detailModal = document.getElementById("detailModal");
const closeModal = document.getElementById("closeModal");

const manualBody = document.getElementById("manualBody");
const excelBody = document.getElementById("excelBody");

const searchInput = document.getElementById("searchInput");
const statusFilter = document.getElementById("statusFilter");
const excelFileSelect = document.getElementById("excelFileSelect");

let allData = [];

loadExcelFileOptions();

runMatchBtn.addEventListener("click", runMatching);

closeModal.addEventListener("click", () => {
    detailModal.style.display = "none";
});

window.onclick = function (event) {
    if (event.target == detailModal) {
        detailModal.style.display = "none";
    }
};

searchInput.addEventListener("keyup", filterTable);
statusFilter.addEventListener("change", filterTable);

async function loadExcelFileOptions() {

    try {

        const response = await fetch(`${API}/api/excel/files`);

        if (!response.ok) return;

        const files = await response.json();

        files.forEach(f => {

            const opt = document.createElement("option");
            opt.value = f.fileName;
            opt.textContent = `${f.fileName} (${f.recordCount} records)`;
            excelFileSelect.appendChild(opt);

        });

    } catch (e) {

        console.log("Unable to load excel file list", e);

    }

}

async function runMatching() {

    const fileName = excelFileSelect.value;

    runMatchBtn.disabled = true;
    excelFileSelect.disabled = true;
    runMatchBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Matching...`;

    try {

        const response = await fetch(
            `${API}/api/matching/run?fileName=` + encodeURIComponent(fileName),
            { method: "POST" }
        );

        if (!response.ok) {
            throw new Error("Unable to fetch");
        }

        const data = await response.json();

        allData = data;

        fillTable(data);

        updateCards(data);

        emptyState.classList.add("hidden");

        resultSection.classList.remove("hidden");

    } catch (e) {

        alert("Matching Failed");

        console.log(e);

    } finally {

        runMatchBtn.disabled = false;
        excelFileSelect.disabled = false;
        runMatchBtn.innerHTML = `<i class="fa-solid fa-arrows-rotate"></i> Run Matching`;

    }

}

function fillTable(data) {

    tableBody.innerHTML = "";

    data.forEach(item => {

        tableBody.innerHTML += `

        <tr>

            <td>${item.orn}</td>

            <td>

                <span class="status ${statusClass(item.status)}">

                    ${item.status}

                </span>

            </td>

            <td>${item.matchPercentage}%</td>

            <td>${item.customerName ?? "-"}</td>

            <td>${item.mobileNumber ?? "-"}</td>

            <td>

                <button class="view-btn"

                    onclick="viewDetails('${item.orn}')">

                    View

                </button>

            </td>

        </tr>

        `;

    });

}

function statusClass(status) {

    switch (status) {

        case "Matched":

            return "matched";

        case "Partial":

            return "partial";

        case "Missing Excel":

            return "missingexcel";

        case "Missing Manual":

            return "missingmanual";

        case "Duplicate":

            return "duplicate";

        default:

            return "";
    }

}

function updateCards(data) {

    matchedCount.innerText =
        data.filter(x => x.status == "Matched").length;

    partialCount.innerText =
        data.filter(x => x.status == "Partial").length;

    missingExcelCount.innerText =
        data.filter(x => x.status == "Missing Excel").length;

    missingManualCount.innerText =
        data.filter(x => x.status == "Missing Manual").length;

    duplicateCount.innerText =
        data.filter(x => x.status == "Duplicate").length;

}

function filterTable() {

    const search = searchInput.value.toLowerCase();

    const status = statusFilter.value;

    let filtered = allData.filter(item => {

        const ornMatch = item.orn.toLowerCase().includes(search);

        const statusMatch =
            status == "all" || item.status == status;

        return ornMatch && statusMatch;

    });

    fillTable(filtered);

}

// Fields that have a direct counterpart on the other side, used to
// decide which rows get a green (match) or red (mismatch) highlight.
const COMPARISON_PAIRS = [
    { manualKey: "ornNo", excelKey: "orn" },
    { manualKey: "amount", excelKey: "price" },
    { manualKey: "transactionDate", excelKey: "cafDate" }
];

async function viewDetails(orn) {

    try {

        const fileName = excelFileSelect.value;

        const response = await fetch(
            `${API}/api/matching/details/` + encodeURIComponent(orn) +
            "?fileName=" + encodeURIComponent(fileName)
        );

        const data = await response.json();

        loadManual(data.manual, data.excel);

        loadExcel(data.excel, data.manual);

        detailModal.style.display = "flex";

    }

    catch (e) {

        console.log(e);

        alert("Unable to load details");

    }

}

function compareStatusFor(key, side, manual, excel) {

    const pair = COMPARISON_PAIRS.find(p =>
        (side === "manual" && p.manualKey === key) ||
        (side === "excel" && p.excelKey === key)
    );

    if (!pair || !manual || !excel) return "";

    const mVal = manual[pair.manualKey];
    const eVal = excel[pair.excelKey];

    if (mVal === undefined || mVal === null || eVal === undefined || eVal === null) return "";

    const isMatch = String(mVal).trim().toLowerCase() === String(eVal).trim().toLowerCase();

    return isMatch ? "compare-match" : "compare-mismatch";

}

function loadManual(manual, excel) {

    manualBody.innerHTML = "";

    if (!manual) {

        manualBody.innerHTML = `
            <tr>
                <td colspan="2">No Manual Record Found</td>
            </tr>
        `;

        return;
    }

    Object.entries(manual).forEach(([key, value]) => {

        const cls = compareStatusFor(key, "manual", manual, excel);

        manualBody.innerHTML += `

        <tr>

            <td><b>${formatKey(key)}</b></td>

            <td class="${cls}">${value ?? ""}</td>

        </tr>

        `;

    });

}

function loadExcel(excel, manual) {

    excelBody.innerHTML = "";

    if (!excel) {

        excelBody.innerHTML = `
            <tr>
                <td colspan="2">No Excel Record Found</td>
            </tr>
        `;

        return;
    }

    Object.entries(excel).forEach(([key, value]) => {

        const cls = compareStatusFor(key, "excel", manual, excel);

        excelBody.innerHTML += `

        <tr>

            <td><b>${formatKey(key)}</b></td>

            <td class="${cls}">${value ?? ""}</td>

        </tr>

        `;

    });

}

function formatKey(key) {

    return key

        .replace(/([A-Z])/g, ' $1')

        .replace(/^./, str => str.toUpperCase());

}

function toggleMenu() {

    document.querySelector(".sidebar")

        .classList.toggle("show");

}