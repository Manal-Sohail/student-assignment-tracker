const API_URL = "http://127.0.0.1:8000";
let allAssignments = []; // Stores assignments globally

// 1. Fetch data from backend and render everything
async function loadAssignments() {
    try {
        const response = await fetch(`${API_URL}/assignments`);
        allAssignments = await response.json();
        
        // Update Stat Counters
        document.getElementById("totalCount").innerText = allAssignments.length;
        document.getElementById("pendingCount").innerText = allAssignments.filter(a => a.STATUS === "Pending").length;
        document.getElementById("progressCount").innerText = allAssignments.filter(a => a.STATUS === "In Progress").length;
        document.getElementById("completedCount").innerText = allAssignments.filter(a => a.STATUS === "Completed").length;

        // Render Cards
        const listContainer = document.getElementById("assignmentList");
        if (allAssignments.length === 0) {
            listContainer.innerHTML = `<div class="empty-state"><h3>No assignments yet</h3></div>`;
            return;
        }

        listContainer.innerHTML = allAssignments.map((a, index) => `
            <div class="assignment-card">
                <div class="card-top">
                    <div>
                        <span class="card-subject">${a.SUBJECT}</span>
                        <h3>${a.TITLE}</h3>
                    </div>
                    <span class="badge ${a.STATUS.toLowerCase().replace(" ", "-")}">${a.STATUS}</span>
                </div>
                <p class="card-desc">${a.DESCRIPTION}</p>
                <div class="card-bottom">
                    <span class="card-date">📅 Due: ${a.DUE_DATE}</span>
                    <div class="card-actions">
                        <select onchange="updateStatus(${index}, this.value)">
                            <option value="Pending" ${a.STATUS === 'Pending' ? 'selected' : ''}>Pending</option>
                            <option value="In Progress" ${a.STATUS === 'In Progress' ? 'selected' : ''}>In Progress</option>
                            <option value="Completed" ${a.STATUS === 'Completed' ? 'selected' : ''}>Completed</option>
                        </select>
                        <button class="delete-btn" onclick="deleteAssignment(${a.ID})">Delete</button>
                    </div>
                </div>
            </div>
        `).join("");

    } catch (err) {
        console.error("Error:", err);
    }
}

// 2. Add New Assignment (POST)
document.getElementById("addAssignmentForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const data = {
        title: document.getElementById("title").value,
        subject: document.getElementById("subject").value,
        due_date: document.getElementById("dueDate").value,
        status: document.getElementById("status").value,
        description: document.getElementById("description").value
    };

    await fetch(`${API_URL}/assignments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    });

    document.getElementById("addAssignmentForm").reset();
    loadAssignments();
});

// 3. Update Status Dropdown (PUT)
async function updateStatus(index, newStatus) {
    const a = allAssignments[index];
    const updatedData = {
        title: a.TITLE,
        subject: a.SUBJECT,
        description: a.DESCRIPTION,
        due_date: a.DUE_DATE,
        status: newStatus
    };

    await fetch(`${API_URL}/assignments/${a.ID}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedData)
    });
    
    loadAssignments();
}

// 4. Delete Assignment (DELETE)
async function deleteAssignment(id) {
    if (confirm("Delete this assignment?")) {
        await fetch(`${API_URL}/assignments/${id}`, { method: "DELETE" });
        loadAssignments();
    }
}

// Helper to smooth scroll to form when "Add Assignment" clicked
function openForm() {
    document.getElementById("assignmentForm").scrollIntoView({ behavior: 'smooth' });
}

// Run app
loadAssignments();
