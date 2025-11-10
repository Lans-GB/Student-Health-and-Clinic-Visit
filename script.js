// ==============================
// Care Collect Main Script
// Handles both student info + health records
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
// Add or Edit Student
// -------------------------
function addStudent() {
  const id = document.getElementById("studentId").value.trim();
  const name = document.getElementById("name").value.trim();
  const age = document.getElementById("age").value.trim();
  const sex = document.getElementById("sex").value;
  const year = document.getElementById("yearLevel").value;
  const program = document.getElementById("program").value;
  const contact = document.getElementById("contact").value.trim();
  const height = document.getElementById("height").value.trim();
  const weight = document.getElementById("weight").value.trim();
  const bmi = document.getElementById("bmiDisplay").value.trim();

  // Health history checkboxes
  const history = Array.from(document.querySelectorAll('input[name="history"]:checked'))
    .map(cb => cb.value);
  const other = document.getElementById("otherHistory").value.trim();
  if (other) history.push(other);

  if (!id || !name || !age || !sex || !year || !program) {
    alert("Please fill in all required fields.");
    return;
  }

  const studentObj = {
    id,
    name,
    age,
    sex,
    year,
    program,
    contact,
    height,
    weight,
    bmi,
    healthHistory: history.join(", "),
    visits: students.find(s => s.id === id)?.visits || []
  };

  if (editId) {
    // Edit existing student
    students = students.map(s => (s.id === editId ? studentObj : s));
    editId = null;
    document.getElementById("submitBtn").innerText = "Add Student";
  } else {
    // Add new
    const exists = students.some(s => s.id === id);
    if (exists) {
      alert("Student ID already exists!");
      return;
    }
    students.push(studentObj);
  }

  saveData();
  showTable();
  clearForm();
}

function clearForm() {
  document.querySelectorAll("input, select").forEach(e => (e.value = ""));
  document.querySelectorAll('input[name="history"]').forEach(e => (e.checked = false));
  document.getElementById("submitBtn").innerText = "Add Student";
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
      <td>${s.name}</td>
      <td>${s.age}</td>
      <td>${s.sex}</td>
      <td>${s.year}</td>
      <td>${s.program}</td>
      <td>${s.contact}</td>
      <td>${s.height}</td>
      <td>${s.weight}</td>
      <td>${s.bmi}</td>
      <td>${s.healthHistory}</td>
      <td>
        <a class="fa" onclick="editStudent('${s.id}')">&#xf044;</a>
        <a class="fa" onclick="deleteStudent('${s.id}')">&#xf1f8;</a>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

// -------------------------
// Edit / Delete
// -------------------------
function editStudent(id) {
  const s = students.find(st => st.id === id);
  if (!s) return;

  document.getElementById("studentId").value = s.id;
  document.getElementById("name").value = s.name;
  document.getElementById("age").value = s.age;
  document.getElementById("sex").value = s.sex;
  document.getElementById("yearLevel").value = s.year;
  document.getElementById("program").value = s.program;
  document.getElementById("contact").value = s.contact;
  document.getElementById("height").value = s.height;
  document.getElementById("weight").value = s.weight;
  document.getElementById("bmiDisplay").value = s.bmi;

  const histories = s.healthHistory.split(", ").map(h => h.trim());
  document.querySelectorAll('input[name="history"]').forEach(cb => {
    cb.checked = histories.includes(cb.value);
  });

  document.getElementById("submitBtn").innerText = "Update Student";
  editId = id;
}

function deleteStudent(id) {
  if (!confirm("Delete this student?")) return;
  students = students.filter(s => s.id !== id);
  saveData();
  showTable();
}

// -------------------------
// Search Function
// -------------------------
function searchStudent() {
  const filter = document.getElementById("searchInput").value.toLowerCase();
  const tbody = document.getElementById("studentTableBody");
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
  if (!students.length) saveData(); // initialize if empty
}

function autoFillById() {
  const id = document.getElementById("searchId").value.trim();
  const nameInput = document.getElementById("searchName");
  const status = document.getElementById("searchStatus");
  currentStudent = null;

  if (!id) {
    nameInput.value = "";
    status.textContent = "";
    document.getElementById("studentInfoDisplay").innerHTML = "";
    return;
  }

  const student = students.find(s => s.id === id);
  if (student) {
    nameInput.value = student.name;
    status.textContent = `✅ Record found for ${student.name}`;
    currentStudent = student;
    displayStudentInfo(student);
    loadVisits();
  } else {
    nameInput.value = "";
    status.textContent = "❌ No record found.";
    clearVisits();
    document.getElementById("studentInfoDisplay").innerHTML = "";
  }
}

function autoFillByName() {
  const name = document.getElementById("searchName").value.trim().toLowerCase();
  const idInput = document.getElementById("searchId");
  const status = document.getElementById("searchStatus");
  currentStudent = null;

  if (!name) {
    idInput.value = "";
    status.textContent = "";
    document.getElementById("studentInfoDisplay").innerHTML = "";
    return;
  }

  const student = students.find(s => s.name.toLowerCase() === name);
  if (student) {
    idInput.value = student.id;
    status.textContent = `✅ Record found for ${student.name}`;
    currentStudent = student;
    displayStudentInfo(student);
    loadVisits();
  } else {
    idInput.value = "";
    status.textContent = "❌ No record found.";
    clearVisits();
    document.getElementById("studentInfoDisplay").innerHTML = "";
  }
}

function displayStudentInfo(s) {
  const infoDiv = document.getElementById("studentInfoDisplay");
  infoDiv.innerHTML = `
    <div class="info-card">
      <p><strong>ID:</strong> ${s.id}</p>
      <p><strong>Name:</strong> ${s.name}</p>
      <p><strong>Age:</strong> ${s.age}</p>
      <p><strong>Sex:</strong> ${s.sex}</p>
      <p><strong>Year Level:</strong> ${s.year}</p>
      <p><strong>Program:</strong> ${s.program}</p>
      <p><strong>Contact:</strong> ${s.contact}</p>
      <p><strong>BMI:</strong> ${s.bmi}</p>
      <p><strong>Health History:</strong> ${s.healthHistory}</p>
    </div>
  `;
}

function saveVisit() {
  if (!currentStudent) {
    alert("Search for a student first!");
    return;
  }

  const visit = {
    date: new Date().toLocaleString(),
    bp: document.getElementById("bp").value,
    temp: document.getElementById("temp").value,
    pr: document.getElementById("pr").value,
    rr: document.getElementById("rr").value,
    oxygen: document.getElementById("oxygen").value,
    complaint: document.getElementById("complaint").value
  };

  if (!currentStudent.visits) currentStudent.visits = [];
  currentStudent.visits.push(visit);

  students = students.map(s => (s.id === currentStudent.id ? currentStudent : s));
  saveData();
  loadVisits();

  document.querySelectorAll(".vital-section input, .vital-section textarea").forEach(i => (i.value = ""));
}

function loadVisits() {
  const tbody = document.getElementById("visitBody");
  tbody.innerHTML = "";
  if (!currentStudent || !currentStudent.visits || !currentStudent.visits.length) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;">No visit records yet.</td></tr>`;
    return;
  }
  currentStudent.visits.forEach(v => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${v.date}</td>
      <td>${v.bp}</td>
      <td>${v.temp}</td>
      <td>${v.pr}</td>
      <td>${v.rr}</td>
      <td>${v.oxygen}</td>
      <td>${v.complaint}</td>
    `;
    tbody.appendChild(row);
  });
}

function clearVisits() {
  document.getElementById("visitBody").innerHTML = "";
}
