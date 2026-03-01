const STORAGE_KEY = "schoolSystemData";

const defaultData = {
  careers: [],
  classes: [],
  years: [],
  students: [],
  careerYearLinks: [],
  yearClassLinks: [],
  studentYearLinks: []
};

const loadData = () => {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return structuredClone(defaultData);
  try {
    return { ...structuredClone(defaultData), ...JSON.parse(saved) };
  } catch {
    return structuredClone(defaultData);
  }
};

let state = loadData();

const saveData = () => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
};

const uid = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const byId = (arr, id) => arr.find((item) => item.id === id);

const setTab = (target) => {
  document.querySelectorAll(".tab-btn").forEach((btn) => btn.classList.remove("active"));
  document.querySelectorAll(".tab-content").forEach((section) => section.classList.remove("active"));

  if (target === "config") {
    document.getElementById("btnConfig").classList.add("active");
    document.getElementById("configSection").classList.add("active");
  } else {
    document.getElementById("btnPrincipal").classList.add("active");
    document.getElementById("principalSection").classList.add("active");
  }
};

const renderSimpleList = (elementId, items, labelFn) => {
  const el = document.getElementById(elementId);
  el.innerHTML = "";
  if (!items.length) {
    el.innerHTML = "<li class='empty'>Sin registros</li>";
    return;
  }
  items.forEach((item) => {
    const li = document.createElement("li");
    li.textContent = labelFn(item);
    el.appendChild(li);
  });
};

const fillSelect = (elementId, items, placeholder, labelFn) => {
  const select = document.getElementById(elementId);
  select.innerHTML = "";

  const first = document.createElement("option");
  first.value = "";
  first.textContent = placeholder;
  select.appendChild(first);

  items.forEach((item) => {
    const option = document.createElement("option");
    option.value = item.id;
    option.textContent = labelFn(item);
    select.appendChild(option);
  });
};

const renderAssociations = () => {
  renderSimpleList("careerYearList", state.careerYearLinks, (link) => {
    const career = byId(state.careers, link.careerId)?.name || "Carrera eliminada";
    const year = byId(state.years, link.yearId)?.name || "Año eliminado";
    return `${career} → ${year}`;
  });

  renderSimpleList("yearClassList", state.yearClassLinks, (link) => {
    const year = byId(state.years, link.yearId)?.name || "Año eliminado";
    const className = byId(state.classes, link.classId)?.name || "Clase eliminada";
    return `${year} → ${className}`;
  });

  renderSimpleList("studentYearList", state.studentYearLinks, (link) => {
    const student = byId(state.students, link.studentId);
    const year = byId(state.years, link.yearId)?.name || "Año eliminado";
    const fullName = student ? `${student.name} ${student.lastName}` : "Alumno eliminado";
    return `${fullName} → ${year}`;
  });
};

const renderStudentSummary = () => {
  const tbody = document.getElementById("studentSummaryBody");
  tbody.innerHTML = "";

  if (!state.students.length) {
    const row = document.createElement("tr");
    row.innerHTML = "<td class='empty' colspan='3'>No hay alumnos registrados.</td>";
    tbody.appendChild(row);
    return;
  }

  state.students.forEach((student) => {
    const studentYear = state.studentYearLinks.find((link) => link.studentId === student.id);
    const year = studentYear ? byId(state.years, studentYear.yearId) : null;
    const careerLink = year ? state.careerYearLinks.find((link) => link.yearId === year.id) : null;
    const career = careerLink ? byId(state.careers, careerLink.careerId) : null;

    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${student.name} ${student.lastName}</td>
      <td>${career?.name || "Sin carrera asignada"}</td>
      <td>${year?.name || "Sin año asignado"}</td>
    `;
    tbody.appendChild(row);
  });
};

const renderAll = () => {
  renderSimpleList("careerList", state.careers, (item) => item.name);
  renderSimpleList("classList", state.classes, (item) => item.name);
  renderSimpleList("yearList", state.years, (item) => item.name);
  renderSimpleList("studentList", state.students, (item) => `${item.name} ${item.lastName} (${item.code})`);

  fillSelect("careerSelect", state.careers, "Seleccione una carrera", (item) => item.name);
  fillSelect("yearForCareerSelect", state.years, "Seleccione un año", (item) => item.name);
  fillSelect("yearForClassSelect", state.years, "Seleccione un año", (item) => item.name);
  fillSelect("classSelect", state.classes, "Seleccione una clase", (item) => item.name);
  fillSelect("studentSelect", state.students, "Seleccione un alumno", (item) => `${item.name} ${item.lastName}`);
  fillSelect("yearForStudentSelect", state.years, "Seleccione un año", (item) => item.name);

  renderAssociations();
  renderStudentSummary();
};

const addUniqueLink = (collection, validator, payload) => {
  const exists = collection.some(validator);
  if (exists) return false;
  collection.push(payload);
  return true;
};

document.getElementById("btnConfig").addEventListener("click", () => setTab("config"));
document.getElementById("btnPrincipal").addEventListener("click", () => setTab("principal"));

document.getElementById("careerForm").addEventListener("submit", (event) => {
  event.preventDefault();
  const input = document.getElementById("careerName");
  state.careers.push({ id: uid(), name: input.value.trim() });
  input.value = "";
  saveData();
  renderAll();
});

document.getElementById("classForm").addEventListener("submit", (event) => {
  event.preventDefault();
  const input = document.getElementById("className");
  state.classes.push({ id: uid(), name: input.value.trim() });
  input.value = "";
  saveData();
  renderAll();
});

document.getElementById("yearForm").addEventListener("submit", (event) => {
  event.preventDefault();
  const input = document.getElementById("yearName");
  state.years.push({ id: uid(), name: input.value.trim() });
  input.value = "";
  saveData();
  renderAll();
});

document.getElementById("studentForm").addEventListener("submit", (event) => {
  event.preventDefault();
  const name = document.getElementById("studentName");
  const lastName = document.getElementById("studentLastName");
  const code = document.getElementById("studentCode");
  const email = document.getElementById("studentEmail");

  state.students.push({
    id: uid(),
    name: name.value.trim(),
    lastName: lastName.value.trim(),
    code: code.value.trim(),
    email: email.value.trim()
  });

  name.value = "";
  lastName.value = "";
  code.value = "";
  email.value = "";

  saveData();
  renderAll();
});

document.getElementById("careerYearForm").addEventListener("submit", (event) => {
  event.preventDefault();
  const careerId = document.getElementById("careerSelect").value;
  const yearId = document.getElementById("yearForCareerSelect").value;
  if (!careerId || !yearId) return;

  const linked = addUniqueLink(
    state.careerYearLinks,
    (link) => link.careerId === careerId && link.yearId === yearId,
    { id: uid(), careerId, yearId }
  );

  if (linked) {
    saveData();
    renderAll();
  }
});

document.getElementById("yearClassForm").addEventListener("submit", (event) => {
  event.preventDefault();
  const yearId = document.getElementById("yearForClassSelect").value;
  const classId = document.getElementById("classSelect").value;
  if (!yearId || !classId) return;

  const linked = addUniqueLink(
    state.yearClassLinks,
    (link) => link.yearId === yearId && link.classId === classId,
    { id: uid(), yearId, classId }
  );

  if (linked) {
    saveData();
    renderAll();
  }
});

document.getElementById("studentYearForm").addEventListener("submit", (event) => {
  event.preventDefault();
  const studentId = document.getElementById("studentSelect").value;
  const yearId = document.getElementById("yearForStudentSelect").value;
  if (!studentId || !yearId) return;

  state.studentYearLinks = state.studentYearLinks.filter((link) => link.studentId !== studentId);
  state.studentYearLinks.push({ id: uid(), studentId, yearId });

  saveData();
  renderAll();
});

renderAll();
