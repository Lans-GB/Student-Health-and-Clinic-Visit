// ==============================
// Care Collect Main Script (UPDATED)
// Matches: updated student.html (Patient) & records.html (Clinic Visit)
// - Auto-increment ID (no manual ID input on form)
// - yearLevel -> barangay
// - program removed
// - "Student" wording replaced with "Patient" in UI displays
// ==============================

let students = JSON.parse(localStorage.getItem("students")) || [];
let editId = null;
let currentStudent = null;

// -------------------------
// Utility
// -------------------------
function saveData() {
  localStorage.setItem("students", JSON.stringify(students));
}

function autoBMI() {
  const h = parseFloat(document.getElementById("height").value);
  const w = parseFloat(document.getElementById("weight").value);
  const bmiField = document.getElementById("bmiDisplay");
  if (h > 0 && w > 0) {
    const bmi = (w / ((h / 100) ** 2)).toFixed(1);
    bmiField.value = bmi;
  } else {
    bmiField.value = "";
  }
}

// -------------------------
// Helpers
// -------------------------
function getNextId() {
  // Find max numeric id among existing students and add 1.
  // If no numeric ids, start at 1.
  const nums = students
    .map(s => parseInt(s.id))
    .filter(n => !isNaN(n));
  const max = nums.length ? Math.max(...nums) : 0;
  return String(max + 1);
}

function sanitizeInput(str) {
  return (str || "").trim();
}

// -------------------------
// Add or Edit Student (Patient)
// -------------------------
function addStudent() {
  // Fields from updated HTML (studentId removed; barangay used)
  const name = sanitizeInput(document.getElementById("name").value);
  const age = sanitizeInput(document.getElementById("age").value);
  const sex = document.getElementById("sex").value;
  const barangay = sanitizeInput(document.getElementById("barangay").value);
  const contact = sanitizeInput(document.getElementById("contact").value);
  const height = sanitizeInput(document.getElementById("height").value);
  const weight = sanitizeInput(document.getElementById("weight").value);
  const bmi = sanitizeInput(document.getElementById("bmiDisplay").value);

  // Health history checkboxes
  const history = Array.from(document.querySelectorAll('input[name="history"]:checked'))
    .map(cb => cb.value);
  const other = sanitizeInput(document.getElementById("otherHistory").value);
  if (other) history.push(other);

  // Basic validation
  if (!name || !age || !sex || !barangay) {
    alert("Please fill in all required fields (Name, Age, Sex, Barangay).");
    return;
  }

  let id;
  if (editId) {
    // We're updating existing record; keep same id
    id = editId;
  } else {
    // Auto-increment new id
    id = getNextId();
    // ensure unique: if collision (rare), increment until unique
    while (students.some(s => s.id === id)) {
      id = String(parseInt(id) + 1);
    }
  }

  const studentObj = {
    id,
    name,
    age,
    sex,
    barangay,
    contact,
    height,
    weight,
    bmi,
    healthHistory: history.join(", "),
    visits: (students.find(s => s.id === id) || {}).visits || []
  };

  if (editId) {
    // Update existing
    students = students.map(s => (s.id === editId ? studentObj : s));
    editId = null;
    document.getElementById("submitBtn").innerText = "Add Patient";
  } else {
    // Add new
    students.push(studentObj);
  }

  saveData();
  showTable();
  clearForm();
}

// -------------------------
// Clear Form
// -------------------------
function clearForm() {
  // Only clear inputs we expect to be on the patient form
  const idsToClear = ["name","age","sex","barangay","contact","height","weight","bmiDisplay","otherHistory"];
  idsToClear.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = "";
  });
  document.querySelectorAll('input[name="history"]').forEach(e => (e.checked = false));
  document.getElementById("submitBtn").innerText = "Add Patient";
  editId = null;
}

// -------------------------
// Display Table
// -------------------------
function showTable() {
  const tbody = document.getElementById("studentTableBody");
  if (!tbody) return;
  tbody.innerHTML = "";

  students.forEach(s => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${s.id}</td>
      <td>${escapeHtml(s.name)}</td>
      <td>${escapeHtml(s.age)}</td>
      <td>${escapeHtml(s.sex)}</td>
      <td>${escapeHtml(s.barangay)}</td>
      <td>${escapeHtml(s.contact)}</td>
      <td>${escapeHtml(s.height)}</td>
      <td>${escapeHtml(s.weight)}</td>
      <td>${escapeHtml(s.bmi)}</td>
      <td>${escapeHtml(s.healthHistory)}</td>
      <td>
        <a class="fa" onclick="editStudent('${s.id}')" title="Edit">&#xf044;</a>
        <a class="fa" onclick="deleteStudent('${s.id}')" title="Delete">&#xf1f8;</a>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

// small helper to prevent accidental HTML injection in table
function escapeHtml(text) {
  if (text === undefined || text === null) return "";
  return String(text)
    .replaceAll("&","&amp;")
    .replaceAll("<","&lt;")
    .replaceAll(">","&gt;")
    .replaceAll('"',"&quot;")
    .replaceAll("'", "&#039;");
}

// -------------------------
// Edit / Delete
// -------------------------
function editStudent(id) {
  const s = students.find(st => st.id === id);
  if (!s) return;

  // Populate updated form fields (no studentId input — id is preserved internally)
  document.getElementById("name").value = s.name || "";
  document.getElementById("age").value = s.age || "";
  document.getElementById("sex").value = s.sex || "";
  if (document.getElementById("barangay")) document.getElementById("barangay").value = s.barangay || "";
  document.getElementById("contact").value = s.contact || "";
  document.getElementById("height").value = s.height || "";
  document.getElementById("weight").value = s.weight || "";
  document.getElementById("bmiDisplay").value = s.bmi || "";
  document.getElementById("otherHistory").value = "";

  // check checkboxes from stored history
  const histories = (s.healthHistory || "").split(",").map(h => h.trim()).filter(Boolean);
  document.querySelectorAll('input[name="history"]').forEach(cb => {
    cb.checked = histories.includes(cb.value);
  });

  document.getElementById("submitBtn").innerText = "Update Patient";
  editId = id;
}

function deleteStudent(id) {
  if (!confirm("Delete this patient record?")) return;
  students = students.filter(s => s.id !== id);
  saveData();
  showTable();

  // If we deleted the currently selected patient in records page, clear
  if (currentStudent && currentStudent.id === id) {
    currentStudent = null;
    clearVisits();
    const infoDiv = document.getElementById("studentInfoDisplay");
    if (infoDiv) infoDiv.innerHTML = "";
    const status = document.getElementById("searchStatus");
    if (status) status.textContent = "";
    const idInput = document.getElementById("searchId");
    const nameInput = document.getElementById("searchName");
    if (idInput) idInput.value = "";
    if (nameInput) nameInput.value = "";
  }
}

// -------------------------
// Search Table (on student list page)
// -------------------------
function searchStudent() {
  const filter = (document.getElementById("searchInput")?.value || "").toLowerCase();
  const tbody = document.getElementById("studentTableBody");
  if (!tbody) return;
  const rows = tbody.getElementsByTagName("tr");
  for (let i = 0; i < rows.length; i++) {
    const idCell = rows[i].getElementsByTagName("td")[0];
    const nameCell = rows[i].getElementsByTagName("td")[1];
    if (!idCell || !nameCell) continue;
    const text = (idCell.textContent + " " + nameCell.textContent).toLowerCase();
    rows[i].style.display = text.includes(filter) ? "" : "none";
  }
}

// -------------------------
// Health Records Page Logic
// -------------------------
function initRecordsPage() {
  // Called on records page load
  // Ensure students data exists in localStorage.
  if (!Array.isArray(students)) students = [];
  saveData(); // persist if newly created
  // no other initialization required here
}

function autoFillById() {
  const id = sanitizeInput(document.getElementById("searchId").value);
  const nameInput = document.getElementById("searchName");
  const status = document.getElementById("searchStatus");
  currentStudent = null;

  if (!id) {
    if (nameInput) nameInput.value = "";
    if (status) status.textContent = "";
    const infoDiv = document.getElementById("studentInfoDisplay");
    if (infoDiv) infoDiv.innerHTML = "";
    clearVisits();
    return;
  }

  const student = students.find(s => s.id === id);
  if (student) {
    if (nameInput) nameInput.value = student.name;
    if (status) status.textContent = `✅ Record found for ${student.name}`;
    currentStudent = student;
    displayStudentInfo(student);
    loadVisits();
  } else {
    if (nameInput) nameInput.value = "";
    if (status) status.textContent = "❌ No record found.";
    clearVisits();
    const infoDiv = document.getElementById("studentInfoDisplay");
    if (infoDiv) infoDiv.innerHTML = "";
  }
}

function autoFillByName() {
  const name = sanitizeInput(document.getElementById("searchName").value).toLowerCase();
  const idInput = document.getElementById("searchId");
  const status = document.getElementById("searchStatus");
  currentStudent = null;

  if (!name) {
    if (idInput) idInput.value = "";
    if (status) status.textContent = "";
    const infoDiv = document.getElementById("studentInfoDisplay");
    if (infoDiv) infoDiv.innerHTML = "";
    clearVisits();
    return;
  }

  // Try exact match first, then partial match
  let student = students.find(s => (s.name || "").toLowerCase() === name);
  if (!student) {
    student = students.find(s => (s.name || "").toLowerCase().includes(name));
  }

  if (student) {
    if (idInput) idInput.value = student.id;
    if (status) status.textContent = `✅ Record found for ${student.name}`;
    currentStudent = student;
    displayStudentInfo(student);
    loadVisits();
  } else {
    if (idInput) idInput.value = "";
    if (status) status.textContent = "❌ No record found.";
    clearVisits();
    const infoDiv = document.getElementById("studentInfoDisplay");
    if (infoDiv) infoDiv.innerHTML = "";
  }
}

function displayStudentInfo(s) {
  const infoDiv = document.getElementById("studentInfoDisplay");
  if (!infoDiv) return;
  infoDiv.innerHTML = `
    <div class="info-card">
      <p><strong>ID:</strong> ${escapeHtml(s.id)}</p>
      <p><strong>Name:</strong> ${escapeHtml(s.name)}</p>
      <p><strong>Age:</strong> ${escapeHtml(s.age)}</p>
      <p><strong>Sex:</strong> ${escapeHtml(s.sex)}</p>
      <p><strong>Barangay:</strong> ${escapeHtml(s.barangay)}</p>
      <p><strong>Contact:</strong> ${escapeHtml(s.contact)}</p>
      <p><strong>BMI:</strong> ${escapeHtml(s.bmi)}</p>
      <p><strong>Health History:</strong> ${escapeHtml(s.healthHistory)}</p>
    </div>
  `;
}

// -------------------------
// Visit Saving / Loading
// -------------------------
function saveVisit() {
  if (!currentStudent) {
    alert("Search for a patient first!");
    return;
  }

  const visit = {
    date: new Date().toLocaleString(),
    bp: sanitizeInput(document.getElementById("bp").value),
    temp: sanitizeInput(document.getElementById("temp").value),
    pr: sanitizeInput(document.getElementById("pr").value),
    rr: sanitizeInput(document.getElementById("rr").value),
    oxygen: sanitizeInput(document.getElementById("oxygen").value),
    complaint: sanitizeInput(document.getElementById("complaint").value)
  };

  if (!currentStudent.visits) currentStudent.visits = [];
  currentStudent.visits.push(visit);

  // Persist changes
  students = students.map(s => (s.id === currentStudent.id ? currentStudent : s));
  saveData();
  loadVisits();

  // clear visit form
  const visitInputs = ["bp","temp","pr","rr","oxygen"];
  visitInputs.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = "";
  });
  const comp = document.getElementById("complaint");
  if (comp) comp.value = "";
}

function loadVisits() {
  const tbody = document.getElementById("visitBody");
  if (!tbody) return;
  tbody.innerHTML = "";

  if (!currentStudent || !Array.isArray(currentStudent.visits) || currentStudent.visits.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;">No visit records yet.</td></tr>`;
    return;
  }

  currentStudent.visits.forEach(v => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${escapeHtml(v.date)}</td>
      <td>${escapeHtml(v.bp)}</td>
      <td>${escapeHtml(v.temp)}</td>
      <td>${escapeHtml(v.pr)}</td>
      <td>${escapeHtml(v.rr)}</td>
      <td>${escapeHtml(v.oxygen)}</td>
      <td>${escapeHtml(v.complaint)}</td>
    `;
    tbody.appendChild(row);
  });
}

function clearVisits() {
  const tbody = document.getElementById("visitBody");
  if (tbody) tbody.innerHTML = "";
}

// ==========================
// LOGIN SYSTEM
// ==========================

// Default credentials (persisted)
if(!localStorage.getItem("username")) {
  localStorage.setItem("username", "KLLClinicLipa");
  localStorage.setItem("password", "kolehiyonglungsodnglipa");
}

// Toggle Change Credentials section (if used)
function toggleChangeCreds() {
  const div = document.getElementById("changeCredsDiv");
  if (!div) return;
  div.style.display = div.style.display === "block" ? "none" : "block";
}

// Login
function login() {
  const user = (document.getElementById("loginUser")?.value || "").trim();
  const pass = (document.getElementById("loginPass")?.value || "").trim();
  const loginError = document.getElementById("loginError");

  const savedUser = localStorage.getItem("username");
  const savedPass = localStorage.getItem("password");

  if(user === savedUser && pass === savedPass) {
    localStorage.setItem("isLoggedIn", "true");
    if (loginError) loginError.textContent = "";
    window.location.href = "student.html";
  } else {
    if (loginError) loginError.textContent = "❌ Invalid username or password!";
  }
}

// Change Credentials
function changeCredentials() {
  const oldUser = (document.getElementById("oldUser")?.value || "").trim();
  const oldPass = (document.getElementById("oldPass")?.value || "").trim();
  const newUser = (document.getElementById("newUser")?.value || "").trim();
  const newPass = (document.getElementById("newPass")?.value || "").trim();
  const changeError = document.getElementById("changeError");
  const changeSuccess = document.getElementById("changeSuccess");

  const savedUser = localStorage.getItem("username");
  const savedPass = localStorage.getItem("password");

  if (changeError) changeError.textContent = "";
  if (changeSuccess) changeSuccess.textContent = "";

  if(oldUser !== savedUser || oldPass !== savedPass) {
    if (changeError) changeError.textContent = "❌ Old credentials are incorrect!";
    return;
  }

  if(!newUser || !newPass) {
    if (changeError) changeError.textContent = "❌ Please enter new username and password!";
    return;
  }

  localStorage.setItem("username", newUser);
  localStorage.setItem("password", newPass);
  if (changeSuccess) changeSuccess.textContent = "✅ Credentials updated successfully!";
  ["oldUser","oldPass","newUser","newPass"].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = "";
  });
}

// Protect pages
function checkLogin() {
  if(localStorage.getItem("isLoggedIn") !== "true") {
    window.location.href = "index.html";
  }
}

// Logout function
function logout() {
  localStorage.removeItem("isLoggedIn");
  window.location.href = "index.html";
}
