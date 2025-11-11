// Utility Functions
const showToast = (message, type = "success") => {
  const container = document.getElementById("toast-container");
  const toast = document.createElement("div");
  toast.className = `toast ${type}`;

  const icons = {
    success: "✓",
    error: "✕",
    warning: "⚠",
  };

  toast.innerHTML = `
    <span class="toast-icon">${icons[type]}</span>
    <span class="toast-message">${message}</span>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.animation = "fadeOut 0.3s ease-out";
    setTimeout(() => toast.remove(), 300);
  }, 4000);
};

const formatDate = (dateStr) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

// Color assignment for shift types
const shiftColors = {
  // Predefined colors for common shift types
  frühschicht: "#10b981",
  früh: "#10b981",
  morning: "#10b981",
  spätschicht: "#f59e0b",
  spät: "#f59e0b",
  late: "#f59e0b",
  nachtschicht: "#6366f1",
  nacht: "#6366f1",
  night: "#6366f1",
  tagschicht: "#3b82f6",
  tag: "#3b82f6",
  day: "#3b82f6",
};

const getShiftColor = (shiftType) => {
  const normalized = shiftType.toLowerCase();

  // Check if we have a predefined color
  if (shiftColors[normalized]) {
    return shiftColors[normalized];
  }

  // Generate a consistent color based on shift type name
  let hash = 0;
  for (let i = 0; i < normalized.length; i++) {
    hash = normalized.charCodeAt(i) + ((hash << 5) - hash);
  }

  const colors = [
    "#ef4444",
    "#f97316",
    "#84cc16",
    "#06b6d4",
    "#8b5cf6",
    "#ec4899",
    "#14b8a6",
    "#f43f5e",
  ];

  return colors[Math.abs(hash) % colors.length];
};

// API Functions
const fetchOptions = async () => {
  try {
    const response = await fetch("/api/options");
    const data = await response.json();

    const calendarNameSelect = document.getElementById("calendar-name");

    if (calendarNameSelect) {
      calendarNameSelect.innerHTML =
        '<option value="">Bitte auswählen</option>';
      data.names.forEach((name) => {
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        calendarNameSelect.appendChild(option);
      });
    }
  } catch (error) {
    console.error("Fehler beim Abrufen der Optionen:", error);
    showToast("Fehler beim Laden der Optionen", "error");
  }
};

const fetchShiftTypes = async (name, targetSelect) => {
  try {
    const response = await fetch(`/api/shift_types/${name.toLowerCase()}`);
    const data = await response.json();

    targetSelect.innerHTML = '<option value="">Bitte auswählen</option>';
    data.shift_types.forEach((shiftType) => {
      const option = document.createElement("option");
      option.value = shiftType;
      option.textContent = shiftType;
      targetSelect.appendChild(option);
    });

    return data.shift_types;
  } catch (error) {
    console.error("Fehler beim Abrufen der Schichttypen:", error);
    return [];
  }
};

// Calendar Import
let currentDate = new Date();
let selectedDates = new Set();
let plannedShifts = []; // Array of {name, date, shift_type}
let currentName = "";
let currentShiftType = "";

const setupCalendarImport = () => {
  const nameSelect = document.getElementById("calendar-name");
  const shiftTypeSelect = document.getElementById("calendar-shift-type");
  const importBtn = document.getElementById("import-calendar-shifts");
  const clearAllBtn = document.getElementById("clear-all-shifts");

  nameSelect.addEventListener("change", async (e) => {
    const newName = e.target.value;

    if (newName) {
      await fetchShiftTypes(newName, shiftTypeSelect);

      // Wenn Name gewechselt wird, Kalenderauswahl zurücksetzen
      if (currentName !== newName) {
        selectedDates.clear();
        renderCalendar();
      }
      currentName = newName;
      currentShiftType = ""; // Reset shift type when name changes
      shiftTypeSelect.value = "";
    }
  });

  shiftTypeSelect.addEventListener("change", (e) => {
    currentShiftType = e.target.value;
  });

  clearAllBtn.addEventListener("click", () => {
    if (plannedShifts.length === 0) return;

    if (
      confirm(
        `Möchtest du wirklich alle ${plannedShifts.length} geplanten Schichten löschen?`
      )
    ) {
      plannedShifts = [];
      selectedDates.clear();
      renderCalendar();
      updatePlannedShiftsDisplay();
      showToast("Alle Schichten gelöscht", "success");
    }
  });

  importBtn.addEventListener("click", async () => {
    if (plannedShifts.length === 0) {
      showToast("Keine Schichten zum Importieren", "warning");
      return;
    }

    try {
      const response = await fetch("/add_shifts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(plannedShifts),
      });

      const result = await response.json();
      displayResults(result);

      const successCount = result.filter((r) => !r.includes("Fehler")).length;
      showToast(
        `${successCount} von ${plannedShifts.length} Schichten importiert`,
        "success"
      );

      // Clear all on success
      if (successCount > 0) {
        plannedShifts = [];
        selectedDates.clear();
        renderCalendar();
        updatePlannedShiftsDisplay();
      }
    } catch (error) {
      console.error("Fehler:", error);
      showToast("Fehler beim Import", "error");
    }
  });
};

const updateShiftLegend = () => {
  const legendContainer = document.getElementById("shift-legend");

  // Get unique shift types from planned shifts
  const uniqueShiftTypes = [...new Set(plannedShifts.map((s) => s.shift_type))];

  if (uniqueShiftTypes.length === 0) {
    legendContainer.innerHTML = "";
    legendContainer.style.display = "none";
    return;
  }

  legendContainer.style.display = "block";
  let html =
    '<div class="legend-title">Legende:</div><div class="legend-items">';

  uniqueShiftTypes.sort().forEach((shiftType) => {
    const color = getShiftColor(shiftType);
    html += `<div class="legend-item">
      <div class="legend-color" style="background-color: ${color}"></div>
      <span>${shiftType}</span>
    </div>`;
  });

  html += "</div>";
  legendContainer.innerHTML = html;
};

const renderCalendar = () => {
  const container = document.getElementById("calendar-container");
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const prevLastDay = new Date(year, month, 0);

  const firstDayOfWeek = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;
  const lastDate = lastDay.getDate();
  const prevLastDate = prevLastDay.getDate();

  const monthNames = [
    "Januar",
    "Februar",
    "März",
    "April",
    "Mai",
    "Juni",
    "Juli",
    "August",
    "September",
    "Oktober",
    "November",
    "Dezember",
  ];

  let html = `
    <div class="calendar-header">
      <h3>${monthNames[month]} ${year}</h3>
      <div class="calendar-nav">
        <button id="prev-month">← Zurück</button>
        <button id="today-btn">Heute</button>
        <button id="next-month">Weiter →</button>
      </div>
    </div>
    <div class="calendar-grid">
      <div class="calendar-day-header">Mo</div>
      <div class="calendar-day-header">Di</div>
      <div class="calendar-day-header">Mi</div>
      <div class="calendar-day-header">Do</div>
      <div class="calendar-day-header">Fr</div>
      <div class="calendar-day-header">Sa</div>
      <div class="calendar-day-header">So</div>
  `;

  // Previous month days
  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    const day = prevLastDate - i;
    html += `<div class="calendar-day other-month">${day}</div>`;
  }

  // Current month days
  const today = new Date();
  for (let day = 1; day <= lastDate; day++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(
      day
    ).padStart(2, "0")}`;
    const isToday =
      day === today.getDate() &&
      month === today.getMonth() &&
      year === today.getFullYear();

    // Get all shifts for this date
    const shiftsForDate = plannedShifts.filter(
      (shift) => shift.date === dateStr
    );
    const isPast =
      new Date(dateStr) < new Date(today.toISOString().split("T")[0]);

    let classes = "calendar-day";
    if (isToday) classes += " today";
    if (shiftsForDate.length > 0) classes += " has-shifts";
    if (isPast) classes += " disabled";

    // Create shift badges
    let shiftBadges = "";
    if (shiftsForDate.length > 0) {
      shiftsForDate.forEach((shift) => {
        const color = getShiftColor(shift.shift_type);
        const initial = shift.name.charAt(0).toUpperCase();
        shiftBadges += `<div class="shift-badge" style="background-color: ${color}" title="${shift.name}: ${shift.shift_type}">${initial}</div>`;
      });
    }

    html += `<div class="${classes}" data-date="${dateStr}">
      <span class="day-number">${day}</span>
      <div class="shift-badges">${shiftBadges}</div>
    </div>`;
  }

  // Next month days
  const remainingDays = 42 - (firstDayOfWeek + lastDate);
  for (let day = 1; day <= remainingDays; day++) {
    html += `<div class="calendar-day other-month">${day}</div>`;
  }

  html += "</div>";
  container.innerHTML = html;

  // Event listeners
  document.getElementById("prev-month").addEventListener("click", () => {
    currentDate.setMonth(currentDate.getMonth() - 1);
    renderCalendar();
  });

  document.getElementById("next-month").addEventListener("click", () => {
    currentDate.setMonth(currentDate.getMonth() + 1);
    renderCalendar();
  });

  document.getElementById("today-btn").addEventListener("click", () => {
    currentDate = new Date();
    renderCalendar();
  });

  document
    .querySelectorAll(".calendar-day:not(.other-month):not(.disabled)")
    .forEach((day) => {
      day.addEventListener("click", (e) => {
        // Get date from the clicked element or its parent
        let target = e.target;
        let dateStr = target.dataset.date;

        // If clicked on a child element, get the parent's date
        if (!dateStr) {
          target = target.closest(".calendar-day");
          dateStr = target?.dataset.date;
        }

        if (!dateStr) return;

        // Check if name and shift type are selected
        if (!currentName || !currentShiftType) {
          showToast("Bitte wähle zuerst Name und Schichttyp aus", "warning");
          return;
        }

        // Check if this date already has a planned shift with current name and shift type
        const existingShiftIndex = plannedShifts.findIndex(
          (shift) =>
            shift.date === dateStr &&
            shift.name === currentName &&
            shift.shift_type === currentShiftType
        );

        if (existingShiftIndex !== -1) {
          // Remove the shift
          plannedShifts.splice(existingShiftIndex, 1);

          // Check if date should still be selected (other shifts for this date exist)
          const hasOtherShifts = plannedShifts.some(
            (shift) => shift.date === dateStr
          );
          if (!hasOtherShifts && selectedDates.has(dateStr)) {
            selectedDates.delete(dateStr);
          }
        } else {
          // Add the shift
          plannedShifts.push({
            name: currentName,
            date: dateStr,
            shift_type: currentShiftType,
          });
          selectedDates.add(dateStr);
        }

        renderCalendar();
        updatePlannedShiftsDisplay();
      });
    });
};

const updatePlannedShiftsDisplay = () => {
  const container = document.getElementById("selected-shifts");
  const countSpan = document.getElementById("selected-count");
  const importBtn = document.getElementById("import-calendar-shifts");
  const importBtnText = document.getElementById("import-btn-text");

  countSpan.textContent = plannedShifts.length;
  importBtn.disabled = plannedShifts.length === 0;

  // Update legend
  updateShiftLegend();

  if (plannedShifts.length > 0) {
    importBtnText.textContent = `${plannedShifts.length} Schicht(en) importieren`;
  } else {
    importBtnText.textContent = "Alle Schichten importieren";
  }

  if (plannedShifts.length === 0) {
    container.innerHTML =
      '<p style="color: var(--text-secondary); text-align: center; padding: 20px;">Keine Schichten geplant<br><small>Wähle Tage im Kalender aus und füge sie mit Name und Schichttyp hinzu</small></p>';
    return;
  }

  // Group shifts by name
  const groupedByName = {};
  plannedShifts.forEach((shift, index) => {
    if (!groupedByName[shift.name]) {
      groupedByName[shift.name] = [];
    }
    groupedByName[shift.name].push({ ...shift, index });
  });

  let html = "";
  Object.keys(groupedByName).forEach((name) => {
    const shifts = groupedByName[name];

    // Group by shift type within each name
    const groupedByShiftType = {};
    shifts.forEach((shift) => {
      if (!groupedByShiftType[shift.shift_type]) {
        groupedByShiftType[shift.shift_type] = [];
      }
      groupedByShiftType[shift.shift_type].push(shift);
    });

    html += `<div class="shift-group">
      <div class="shift-group-header">
        <span class="shift-group-name">👤 ${name}</span>
        <span class="shift-group-count">${shifts.length} Schicht(en)</span>
      </div>`;

    Object.keys(groupedByShiftType).forEach((shiftType) => {
      const typeShifts = groupedByShiftType[shiftType];
      typeShifts.sort((a, b) => a.date.localeCompare(b.date));

      html += `<div class="shift-type-group">
        <div class="shift-type-header">
          <span>🕐 ${shiftType}</span>
          <span class="shift-type-count">${typeShifts.length}x</span>
        </div>
        <div class="shift-dates">`;

      typeShifts.forEach((shift) => {
        html += `
          <div class="shift-date-item">
            <span>${formatDate(shift.date)}</span>
            <button class="btn-remove" onclick="removeShiftByIndex(${
              shift.index
            })" title="Entfernen">×</button>
          </div>`;
      });

      html += `</div></div>`;
    });

    html += `</div>`;
  });

  container.innerHTML = html;
};

window.removeShiftByIndex = (index) => {
  if (index >= 0 && index < plannedShifts.length) {
    const shift = plannedShifts[index];
    const dateStr = shift.date;

    plannedShifts.splice(index, 1);

    // Check if this date still has other planned shifts
    const hasOtherShifts = plannedShifts.some((s) => s.date === dateStr);
    if (!hasOtherShifts) {
      selectedDates.delete(dateStr);
    }

    renderCalendar();
    updatePlannedShiftsDisplay();
    showToast(
      `Schicht entfernt: ${shift.name} - ${formatDate(shift.date)}`,
      "success"
    );
  }
};

// Display Results
const displayResults = (results) => {
  const container = document.getElementById("response-container");
  const responseDiv = document.getElementById("response");

  const html = results
    .map((result) => {
      const isError = result.includes("Fehler") || result.includes("Unbekannt");
      return `<div class="response-item ${
        isError ? "error" : "success"
      }">${result}</div>`;
    })
    .join("");

  responseDiv.innerHTML = html;
  container.classList.remove("hidden");

  document.getElementById("close-response").addEventListener("click", () => {
    container.classList.add("hidden");
  });

  // Close on background click
  container.addEventListener("click", (e) => {
    if (e.target === container) {
      container.classList.add("hidden");
    }
  });
};

// Initialize
document.addEventListener("DOMContentLoaded", () => {
  setupCalendarImport();
  fetchOptions();
  updatePlannedShiftsDisplay();
  renderCalendar();
});
