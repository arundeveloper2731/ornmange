function toggleMenu(){
    document.querySelector(".sidebar")
            .classList.toggle("active");
}

function logout() {
    localStorage.removeItem("loggedInUser");
    window.location.href = "login.html";
}

const API = "https://ornmanagement-production.up.railway.app";

const excelFile   = document.getElementById("excelFile");
const dropZone    = document.getElementById("dropZone");
const browseBtn   = document.getElementById("browseBtn");
const fileListEl  = document.getElementById("uploadedFileList");
const fileCountEl = document.getElementById("fileCount");

const editModal     = document.getElementById("editModal");
const editForm      = document.getElementById("editForm");
const closeModalBtn = document.getElementById("closeModalBtn");
const cancelEditBtn = document.getElementById("cancelEditBtn");
const saveEditBtn   = document.getElementById("saveEditBtn");

let currentEditId = null;


browseBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    excelFile.click();
});

dropZone.addEventListener("click", () => {
    excelFile.click();
});

dropZone.addEventListener("dragover", (e) => {
    e.preventDefault();
    dropZone.classList.add("dragover");
});

dropZone.addEventListener("dragleave", () => {
    dropZone.classList.remove("dragover");
});

dropZone.addEventListener("drop", (e) => {
    e.preventDefault();
    dropZone.classList.remove("dragover");

    const file = e.dataTransfer.files[0];

    if (file) {
        excelFile.files = e.dataTransfer.files;
        readExcel(file);
    }
});

excelFile.addEventListener("change", (e) => {
    const file = e.target.files[0];

    if (file) {
        readExcel(file);
    }
});

function readExcel(file) {

    document.getElementById("fileName").innerHTML =
        "Selected : " + file.name;

    const reader = new FileReader();

    reader.onload = function (event) {

        const workbook = XLSX.read(event.target.result, { type: "binary" });

        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];

        const jsonData = XLSX.utils.sheet_to_json(firstSheet, { defval: "" });

        generateTable(jsonData);
    };

    reader.readAsBinaryString(file);
}

function generateTable(data) {

    const thead = document.querySelector("#excelTable thead");
    const tbody = document.querySelector("#excelTable tbody");

    thead.innerHTML = "";
    tbody.innerHTML = "";

    if (data.length === 0) return;

    const columns = Object.keys(data[0]);

    let header = "<tr>";
    columns.forEach(col => {
        header += `<th>${col}</th>`;
    });
    header += "</tr>";
    thead.innerHTML = header;

    data.forEach(row => {
        let tr = "<tr>";
        columns.forEach(col => {
            tr += `<td>${row[col] || ""}</td>`;
        });
        tr += "</tr>";
        tbody.innerHTML += tr;
    });
}


document.getElementById("uploadBtn").addEventListener("click", uploadFile);

async function uploadFile() {

    const file = excelFile.files[0];

    if (!file) {
        alert("Please select a file");
        return;
    }

    const formData = new FormData();
    formData.append("file", file);

    const uploadBtn = document.getElementById("uploadBtn");
    uploadBtn.disabled = true;
    uploadBtn.textContent = "Uploading...";

    try {

        const response = await fetch(`${API}/api/excel/upload`, {
            method: "POST",
            body: formData
        });

        const message = await response.text();
        alert(message);

        // reset selection
        excelFile.value = "";
        document.getElementById("fileName").innerHTML = "";
        document.querySelector("#excelTable thead").innerHTML = "";
        document.querySelector("#excelTable tbody").innerHTML = "";

        // refresh right-side list after successful save
        loadUploadedFiles();

    } catch (error) {
        console.error(error);
        alert("Upload Failed");
    } finally {
        uploadBtn.disabled = false;
        uploadBtn.textContent = "Save to Database";
    }
}


async function loadUploadedFiles() {

    try {
        const response = await fetch(`${API}/api/excel/files`);

        if (!response.ok) {
            throw new Error("Failed to load uploaded files");
        }

        const fileSummaries = await response.json();
        renderFileList(fileSummaries);

    } catch (error) {
        console.error(error);
        fileListEl.innerHTML = `<li class="empty-msg">Failed to load uploaded files.</li>`;
    }
}

function renderFileList(fileSummaries) {

    fileCountEl.textContent = fileSummaries.length;

    if (!fileSummaries || fileSummaries.length === 0) {
        fileListEl.innerHTML = `<li class="empty-msg">No files uploaded yet.</li>`;
        return;
    }

    fileListEl.innerHTML = "";

    fileSummaries.forEach(summary => {

        const li = document.createElement("li");
        li.dataset.fileName = summary.fileName;

        const uploadedDate = summary.uploadedAt
            ? new Date(summary.uploadedAt).toLocaleString()
            : "";

        li.innerHTML = `
            <div class="file-info">
                <span class="orn-no"><i class="fa-solid fa-file-excel" style="color:#16a34a;margin-right:6px;"></i>${summary.fileName}</span>
                <span class="scheme-name">${summary.recordCount} records${uploadedDate ? " • " + uploadedDate : ""}</span>
            </div>
            <div class="row-actions">
                <button class="delete-btn" title="Remove file"><i class="fa-solid fa-trash"></i></button>
            </div>
        `;

        // Click on file -> load all rows belonging to this file into preview table
        li.addEventListener("click", (e) => {
            if (e.target.closest("button")) return;

            document.querySelectorAll("#uploadedFileList li").forEach(el => el.classList.remove("active"));
            li.classList.add("active");

            loadFileData(summary.fileName);
        });

        li.querySelector(".delete-btn").addEventListener("click", (e) => {
            e.stopPropagation();
            deleteFile(summary.fileName);
        });

        fileListEl.appendChild(li);
    });
}

async function loadFileData(fileName) {

    try {
        const response = await fetch(`${API}/api/excel/by-file?fileName=${encodeURIComponent(fileName)}`);

        if (!response.ok) {
            throw new Error("Failed to load file data");
        }

        const records = await response.json();
        renderRecordsTable(records);

    } catch (error) {
        console.error(error);
        alert("Failed to load data for this file");
    }
}

function renderRecordsTable(records) {

    const thead = document.querySelector("#excelTable thead");
    const tbody = document.querySelector("#excelTable tbody");

    thead.innerHTML = "";
    tbody.innerHTML = "";

    if (!records || records.length === 0) {
        tbody.innerHTML = `<tr><td>No records found for this file.</td></tr>`;
        return;
    }

    const keys = Object.keys(records[0]).filter(k => k !== "id" && k !== "fileName");

    thead.innerHTML =
        "<tr>" + keys.map(k => `<th>${k}</th>`).join("") + "<th>Actions</th></tr>";

    records.forEach(record => {

        const tr = document.createElement("tr");

        tr.innerHTML =
            keys.map(k => `<td>${record[k] ?? ""}</td>`).join("") +
            `<td class="row-actions">
                <button class="edit-btn" title="Edit"><i class="fa-solid fa-pen"></i></button>
                <button class="delete-btn" title="Remove"><i class="fa-solid fa-trash"></i></button>
            </td>`;

        tr.querySelector(".edit-btn").addEventListener("click", () => openEditModal(record));
        tr.querySelector(".delete-btn").addEventListener("click", () => deleteRecord(record.id, record.fileName));

        tbody.appendChild(tr);
    });
}

async function deleteFile(fileName) {

    if (!confirm(`Remove ALL records from file "${fileName}"? This cannot be undone.`)) {
        return;
    }

    try {
        const response = await fetch(`${API}/api/excel/delete-file?fileName=${encodeURIComponent(fileName)}`, {
            method: "DELETE"
        });

        if (!response.ok) {
            throw new Error("Delete failed");
        }

        await response.text();

        document.querySelector("#excelTable thead").innerHTML = "";
        document.querySelector("#excelTable tbody").innerHTML = "";

        loadUploadedFiles();

    } catch (error) {
        console.error(error);
        alert("Failed to remove file");
    }
}

async function deleteRecord(id, fileName) {

    if (!confirm("Are you sure you want to remove this record?")) {
        return;
    }

    try {
        const response = await fetch(`${API}/api/excel/delete/${id}`, {
            method: "DELETE"
        });

        if (!response.ok) {
            throw new Error("Delete failed");
        }

        await response.text();

        if (fileName) {
            loadFileData(fileName);
        }
        loadUploadedFiles();

    } catch (error) {
        console.error(error);
        alert("Failed to remove record");
    }
}

/* ================= Edit modal ================= */

function openEditModal(record) {

    currentEditId = record.id;

    const editableFields = Object.keys(record).filter(
        k => k !== "id" && k !== "uploadedAt"
    );

    editForm.innerHTML = "";

    editableFields.forEach(field => {

        const wrapper = document.createElement("div");
        wrapper.className = "form-field";

        const label = document.createElement("label");
        label.textContent = field.replace(/([A-Z])/g, " $1");

        const input = document.createElement("input");
        input.type = "text";
        input.name = field;
        input.value = record[field] ?? "";

        wrapper.appendChild(label);
        wrapper.appendChild(input);
        editForm.appendChild(wrapper);
    });

    editModal.classList.add("active");
}

function closeEditModal() {
    editModal.classList.remove("active");
    currentEditId = null;
    editForm.innerHTML = "";
}

closeModalBtn.addEventListener("click", closeEditModal);
cancelEditBtn.addEventListener("click", closeEditModal);

editModal.addEventListener("click", (e) => {
    if (e.target === editModal) closeEditModal();
});

saveEditBtn.addEventListener("click", async () => {

    if (!currentEditId) return;

    const formData = new FormData(editForm);
    const payload = {};

    formData.forEach((value, key) => {
        payload[key] = value === "" ? null : value;
    });

    // numeric fields need to be sent as numbers, not strings
    ["quantity", "rechargeDays"].forEach(f => {
        if (payload[f] !== null && payload[f] !== undefined) {
            payload[f] = parseInt(payload[f], 10);
            if (isNaN(payload[f])) payload[f] = null;
        }
    });
    ["commission", "price"].forEach(f => {
        if (payload[f] !== null && payload[f] !== undefined) {
            payload[f] = parseFloat(payload[f]);
            if (isNaN(payload[f])) payload[f] = null;
        }
    });

    saveEditBtn.disabled = true;
    saveEditBtn.textContent = "Saving...";

    try {

        const response = await fetch(`${API}/api/excel/update/${currentEditId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errText = await response.text();
            throw new Error(errText || "Update failed");
        }

        const updated = await response.json();

        alert("Record updated successfully");
        closeEditModal();
        loadUploadedFiles();
        if (updated.fileName) {
            loadFileData(updated.fileName);
        }

    } catch (error) {
        console.error(error);
        alert("Failed to update record: " + error.message);
    } finally {
        saveEditBtn.disabled = false;
        saveEditBtn.textContent = "Save Changes";
    }
});

/* ================= Init ================= */

document.addEventListener("DOMContentLoaded", loadUploadedFiles);