// Konfigurace a data
const employees = {
    "Kolářová Hana": { maxNights: 0, maxRO: 4, canNights: false, minFreeWeekends: 2 },
    "Králová Martina": { maxNights: 2, maxRO: 1, canNights: true, minFreeWeekends: 2 },
    "Vaněčková Dana": { maxNights: 0, maxRO: 0, canNights: false, minFreeWeekends: 2, specialRules: true },
    "Vaňková Vlaďka": { maxNights: 5, maxRO: 4, canNights: true, minFreeWeekends: 2 },
    "Vrkoslavová Irena": { maxNights: 5, maxRO: 4, canNights: true, minFreeWeekends: 1 },
    "Dianová Kristýna": { maxNights: 5, maxRO: 1, canNights: true, minFreeWeekends: 2 },
    "Dráb David": { maxNights: 5, maxRO: 1, canNights: true, minFreeWeekends: 2 },
    "Šáchová Kateřina": { maxNights: 5, maxRO: 4, canNights: true, minFreeWeekends: 2 },
    "Krejčová Zuzana": { maxNights: 2, maxRO: 1, canNights: true, minFreeWeekends: 2 },
    "Dráb Filip": { maxNights: 0, maxRO: 4, canNights: false, minFreeWeekends: 2 },
    "Růžek Přízemí": { maxNights: 31, maxRO: 0, canNights: true, minFreeWeekends: 0, isFloor: true }
};

const shiftTypes = {
    'R': { name: 'Ranní', color: 'rgb(173,216,230)', hours: 7.5 },
    'O': { name: 'Odpolední', color: 'rgb(144,238,144)', hours: 7.5 },
    'L': { name: 'Lékař', color: 'rgb(255,182,193)', hours: 7.5 },
    'IP': { name: 'Individuální péče', color: 'rgb(255,218,185)', hours: 7.5 },
    'RO': { name: 'Ranní+Odpolední', color: 'rgb(221,160,221)', hours: 11.5 },
    'NSK': { name: 'Noční služba staniční', color: 'rgb(255,255,153)', hours: 12 },
    'CH': { name: 'Chráněné bydlení', color: 'rgb(255,160,122)', hours: 7.5 },
    'V': { name: 'Volno', color: 'rgb(211,211,211)', hours: 0 },
    'N': { name: 'Noční', color: 'rgb(176,196,222)', hours: 9 },
    'S': { name: 'Služba', color: 'rgb(152,251,152)', hours: 7.5 },
    'D': { name: 'Dovolená', color: 'rgb(240,230,140)', hours: 7.5 },
    'IV': { name: 'Individuální výchova', color: 'rgb(230,230,250)',
           'IV': { name: 'Individuální výchova', color: 'rgb(230,230,250)', hours: 7.5 },
    'ŠK': { name: 'Školení', color: 'rgb(255,228,196)', hours: 7.5 }
};

let shifts = {};
let currentMonth = new Date().getMonth() + 1;
let currentYear = new Date().getFullYear();

// Inicializace aplikace
document.addEventListener('DOMContentLoaded', () => {
    initializeMonthYearSelects();
    createShiftTable();
    createLegend();
    loadSavedRules();
    updateTable();
});

// Inicializace výběru měsíce a roku
function initializeMonthYearSelects() {
    const monthSelect = document.getElementById('monthSelect');
    const yearSelect = document.getElementById('yearSelect');

    // Měsíce
    for (let i = 1; i <= 12; i++) {
        const option = document.createElement('option');
        option.value = i;
        option.textContent = new Date(2024, i-1).toLocaleString('cs', { month: 'long' });
        monthSelect.appendChild(option);
    }
    monthSelect.value = currentMonth;

    // Roky
    const currentYearInt = new Date().getFullYear();
    for (let i = currentYearInt - 2; i <= currentYearInt + 2; i++) {
        const option = document.createElement('option');
        option.value = i;
        option.textContent = i;
        yearSelect.appendChild(option);
    }
    yearSelect.value = currentYear;

    // Event listeners
    monthSelect.addEventListener('change', (e) => {
        currentMonth = parseInt(e.target.value);
        updateTable();
    });

    yearSelect.addEventListener('change', (e) => {
        currentYear = parseInt(e.target.value);
        updateTable();
    });
}

// Vytvoření tabulky služeb
function createShiftTable() {
    const table = document.getElementById('shiftTable');
    const tbody = table.querySelector('tbody');
    tbody.innerHTML = '';

    // Vytvoření řádků pro každého zaměstnance
    Object.keys(employees).forEach(employee => {
        const tr = document.createElement('tr');
        const tdName = document.createElement('td');
        tdName.textContent = employee;
        tdName.className = 'employee-name';
        tr.appendChild(tdName);
        tbody.appendChild(tr);
    });

    updateTable();
}

// Aktualizace tabulky
function updateTable() {
    const table = document.getElementById('shiftTable');
    const thead = table.querySelector('thead tr');
    const tbody = table.querySelector('tbody');

    // Aktualizace hlavičky
    while (thead.children.length > 1) {
        thead.removeChild(thead.lastChild);
    }

    const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();
    for (let i = 1; i <= daysInMonth; i++) {
        const th = document.createElement('th');
        th.textContent = i;
        th.className = isWeekend(i) ? 'weekend' : '';
        thead.appendChild(th);
    }

    // Aktualizace buněk pro služby
    tbody.querySelectorAll('tr').forEach(tr => {
        while (tr.children.length > 1) {
            tr.removeChild(tr.lastChild);
        }

        const employee = tr.firstChild.textContent;
        for (let i = 1; i <= daysInMonth; i++) {
            const td = document.createElement('td');
            td.className = `shift-cell ${isWeekend(i) ? 'weekend' : ''}`;

            const select = document.createElement('select');
            select.className = 'shift-select';
            select.dataset.employee = employee;
            select.dataset.day = i;

            // Prázdná možnost
            const emptyOption = document.createElement('option');
            emptyOption.value = '';
            emptyOption.textContent = '';
            select.appendChild(emptyOption);

            // Možnosti služeb
            Object.keys(shiftTypes).forEach(shiftType => {
                const option = document.createElement('option');
                option.value = shiftType;
                option.textContent = shiftType;
                select.appendChild(option);
            });

            // Nastavení aktuální hodnoty
            const currentShift = shifts[`${employee}-${i}`];
            if (currentShift) {
                select.value = currentShift;
                select.style.backgroundColor = shiftTypes[currentShift].color;
            }

            // Event listener pro změnu služby
            select.addEventListener('change', (e) => {
                const shift = e.target.value;
                if (shift) {
                    shifts[`${employee}-${i}`] = shift;
                    e.target.style.backgroundColor = shiftTypes[shift].color;
                } else {
                    delete shifts[`${employee}-${i}`];
                    e.target.style.backgroundColor = '';
                }
                calculateStats();
            });

            td.appendChild(select);
            tr.appendChild(td);
        }
    });

    calculateStats();
}

// Kontrola pravidel
function checkRules() {
    const alerts = [];
    const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();

    Object.entries(employees).forEach(([name, rules]) => {
        if (rules.isFloor) return; // Přeskočit kontrolu pro Růžek Přízemí

        let nightCount = 0;
        let roCount = 0;
        let consecutiveShifts = 0;
        let freeWeekends = 0;
        let lastWasNight = false;

        // Kontrola služeb po dnech
        for (let day = 1; day <= daysInMonth; day++) {
            const shift = shifts[`${name}-${day}`];

            if (shift === 'N') nightCount++;
            if (shift === 'RO') roCount++;

            if (shift && shift !== 'V' && shift !== 'D') {
                consecutiveShifts++;
                if (consecutiveShifts > 5) {
                    alerts.push(`${name}: Více než 5 služeb v řadě`);
                    consecutiveShifts = 0;
                }
            } else {
                consecutiveShifts = 0;
            }

            if (lastWasNight && shift && shift !== 'V' && shift !== 'N') {
                alerts.push(`${name}: Služba hned po noční (den ${day})`);
            }
            lastWasNight = (shift === 'N');

            // Kontrola víkendů
            if (isWeekend(day) && day < daysInMonth) {
                if (shifts[`${name}-${day}`] === 'V' && 
                    shifts[`${name}-${day+1}`] === 'V') {
                    freeWeekends++;
                }
            }
        }

        // Kontrola limitů
        if (nightCount > rules.maxNights) {
            alerts.push(`${name}: Překročen limit nočních (${nightCount}/${rules.maxNights})`);
        }
        if (roCount > rules.maxRO) {
            alerts.push(`${name}: Překročen limit RO (${roCount}/${rules.maxRO})`);
        }
        if (!rules.canNights && nightCount > 0) {
            alerts.push(`${name}: Nemůže mít noční služby`);
        }
        if (freeWeekends < rules.minFreeWeekends) {
            alerts.push(`${name}: Nedostatek volných víkendů (${freeWeekends}/${rules.minFreeWeekends})`);
        }

        // Speciální pravidla pro Vaněčkovou
        if (rules.specialRules) {
            // Kontrola NSK služeb
            const allowedNskDays = [2, 3, 8, 13];
            for (let day = 1; day <= daysInMonth; day++) {
                if (shifts[`${name}-${day}`] === 'NSK' && !allowedNskDays.includes(day)) {
                    alerts.push(`Vaněčková: NSK služba je ve špatný den (${day})`);
                }
            }

            // Kontrola CH služeb v pátek
            for (let day = 1; day <= daysInMonth; day++) {
                if (new Date(currentYear, currentMonth - 1, day).getDay() === 5) { // Pátek
                    if (shifts[`${name}-${day}`] !== 'CH') {
                        alerts.push(`Vaněčková: Chybí CH služba v pátek (${day})`);
                    }
                }
            }

            // Kontrola zákazu NSK a CH pro ostatní
            Object.keys(employees).forEach(otherName => {
                if (otherName !== name) {
                    for (let day = 1; day <= daysInMonth; day++) {
                        const shift = shifts[`${otherName}-${day}`];
                        if (shift === 'NSK' || shift === 'CH') {
                            alerts.push(`${otherName}: Nesmí mít ${shift} službu (pouze pro Vaněčkovou)`);
                        }
                    }
                }
            });
        }
    });

    showAlerts(alerts);
}

// Kontrola obsazení služeb
function checkOccupancy() {
    const alerts = [];
    const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();

    for (let day = 1; day <= daysInMonth; day++) {
        let ranniCount = 0;
        let odpoledniCount = 0;
        let roCount = 0;
        let nightCount = 0;
        let floorNight = false;

        Object.entries(employees).forEach(([name, rules]) => {
            const shift = shifts[`${name}-${day}`];
            
            if (rules.isFloor && shift === 'N') {
                floorNight = true;
            } else {
                if (shift === 'R') ranniCount++;
                if (shift === 'O') odpoledniCount++;
                if (shift === 'RO') roCount++;
                if (shift === 'N') nightCount++;
            }
        });

        if (!((ranniCount === 2 && odpoledniCount === 2 && roCount === 0) ||
              (ranniCount === 1 && odpoledniCount === 1 && roCount === 1))) {
            alerts.push(`Den ${day}: Nesprávné obsazení služeb (R:${ranniCount}, O:${odpoledniCount}, RO:${roCount})`);
        }

        if (!floorNight && nightCount === 0) {
            alerts.push(`Den ${day}: Chybí noční služba`);
        }
    }

    showAlerts(alerts);
}

// Výpočet statistik
function calculateStats() {
    const stats = {};
    const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();
    const workDays = getWorkDays();

    Object.keys(employees).forEach(name => {
        let totalHours = 0;
        let weekendHours = 0;
        const shiftCounts = {};

        Object.keys(shiftTypes).forEach(type => {
            shiftCounts[type] = 0;
        });

        for (let day = 1; day <= daysInMonth; day++) {
            const shift = shifts[`${name}-${day}`];
            if (shift && shiftTypes[shift]) {
                shiftCounts[shift]++;
                const hours = shiftTypes[shift].hours;
                totalHours += hours;

                if (isWeekend(day)) {
                    weekendHours += hours;
                }
            }
        }

        stats[name] = {
            totalHours,
            weekendHours,
            fundHours: workDays * 7.5,
            overtime: totalHours - (workDays * 7.5),
            shiftCounts
        };
    });

    updateStatsDisplay(stats);
}

// Export do Wordu
function exportToWord() {
    const header = `
        <html xmlns:o='urn:schemas-microsoft-com:office:office' 
              xmlns:w='urn:schemas-microsoft-com:office:word' 
              xmlns='http://www.w3.org/TR/REC-html40'>
        <head>
            <meta charset='utf-8'>
            <title>Rozpis služeb</title>
            <style>
                table {
                    border-collapse: collapse;
                    width: 100%;
                }
                th, td {
                    border: 1px solid black;
                    padding: 4px;
                    text-align: center;
                }
                th {
                    background-color: #f0f0f0;
                    font-weight: bold;
                }
                .weekend {
                    background-color: #ffffd0;
                }
                @page {
                    size: landscape;
                    mso-page-orientation: landscape;
                }
                body {
                    font-family: Tahoma;
                }
            </style>
        </head>
        <body>
    `;

    let content = `
        <h1 style="text-align: center">
            ${new Date(currentYear, currentMonth - 1).toLocaleString('cs', { month: 'long' })} ${currentYear}
        </h1>
        <table>
            <tr>
                <th>Jméno</th>
    `;

    const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();

    // Přidání hlavičky s dny
    for (let i = 1; i <= daysInMonth; i++) {
        content += `<th class="${isWeekend(i) ? 'weekend' : ''}">${i}</th>`;
    }
    content += '</tr>';

    // Přidání dat zaměstnanců
    Object.keys(employees).forEach(employee => {
        content += `<tr><td>${employee}</td>`;
        for (let day = 1; day <= daysInMonth; day++) {
            const shift = shifts[`${employee}-${day}`] || '';
            const style = shift ? `background-color: ${shiftTypes[shift].color}` : '';
            content += `<td style="${style}">${shift}</td>`;
        }
        content += '</tr>';
    });

    content += '</table>';

    // Přidání statistik
    const stats = calculateExportStats();
    content += `
        <h2>Statistiky služeb</h2>
        <table style="margin-top: 20px">
            <tr>
                <th>Jméno</th>
                <th>Celkem hodin</th>
                <th>Fond</th>
                <th>Přesčas</th>
                <th>Víkendové hodiny</th>
            </tr>
    `;

    Object.entries(stats).forEach(([name, stat]) => {
        content += `
            <tr>
                <td>${name}</td>
                <td>${stat.totalHours.toFixed(1)}</td>
<td>${stat.fundHours.toFixed(1)}</td>
                <td>${stat.overtime.toFixed(1)}</td>
                <td>${stat.weekendHours.toFixed(1)}</td>
            </tr>
        `;
    });

    content += '</table>';

    const footer = `
        </body>
        </html>
    `;

    const blob = new Blob([header + content + footer], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Rozpis_${currentYear}_${currentMonth}.doc`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

// Pomocné funkce
function isWeekend(day) {
    const date = new Date(currentYear, currentMonth - 1, day);
    return date.getDay() === 0 || date.getDay() === 6;
}

function getWorkDays() {
    const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();
    let workDays = 0;
    for (let day = 1; day <= daysInMonth; day++) {
        if (!isWeekend(day)) {
            workDays++;
        }
    }
    return workDays;
}

function showAlerts(alerts) {
    const alertsDiv = document.getElementById('alerts');
    const alertsList = document.getElementById('alertsList');
    alertsList.innerHTML = '';

    if (alerts.length > 0) {
        alerts.forEach(alert => {
            const li = document.createElement('li');
            li.textContent = alert;
            alertsList.appendChild(li);
        });
        alertsDiv.classList.remove('hidden');
    } else {
        alertsDiv.classList.add('hidden');
        alert('Všechna pravidla jsou splněna.');
    }
}

function updateStatsDisplay(stats) {
    const statsDiv = document.getElementById('stats');
    statsDiv.innerHTML = '';
    statsDiv.classList.remove('hidden');

    Object.entries(stats).forEach(([name, stat]) => {
        const employeeStats = document.createElement('div');
        employeeStats.className = 'stats-card';
        employeeStats.innerHTML = `
            <h4 class="font-semibold">${name}</h4>
            <div class="grid grid-cols-2 gap-2 mt-2">
                <div>
                    <p>Celkem hodin: ${stat.totalHours.toFixed(1)}</p>
                    <p>Fond pracovní doby: ${stat.fundHours.toFixed(1)}</p>
                    <p class="${stat.overtime >= 0 ? 'text-green-600' : 'text-red-600'}">
                        Přesčas: ${stat.overtime.toFixed(1)}
                    </p>
                    <p>Víkendové hodiny: ${stat.weekendHours.toFixed(1)}</p>
                </div>
                <div>
                    <p class="font-semibold">Počty služeb:</p>
                    ${Object.entries(stat.shiftCounts)
                        .filter(([_, count]) => count > 0)
                        .map(([type, count]) => `
                            <p>${type}: ${count}</p>
                        `).join('')}
                </div>
            </div>
        `;
        statsDiv.appendChild(employeeStats);
    });
}

function createLegend() {
    const legend = document.getElementById('legend');
    Object.entries(shiftTypes).forEach(([code, {name, color, hours}]) => {
        const div = document.createElement('div');
        div.className = 'flex items-center';
        div.innerHTML = `
            <div class="w-6 h-6 rounded mr-2" style="background-color: ${color}"></div>
            <span>${code} - ${name} (${hours}h)</span>
        `;
        legend.appendChild(div);
    });
}

// Funkce pro stránku s pravidly
function generateEmployeeCards() {
    const container = document.querySelector('.grid');
    if (!container) return; // Jsme na stránce s pravidly?

    Object.entries(employees).forEach(([name, rules]) => {
        if (rules.isFloor) return; // Přeskočit kartu pro Růžek Přízemí

        const card = document.createElement('div');
        card.className = 'bg-white rounded-lg shadow p-4';
        card.innerHTML = `
            <h3 class="font-bold mb-3">${name}</h3>
            <div class="space-y-2">
                <div>
                    <label class="block text-sm">Maximum nočních služeb</label>
                    <input type="number" 
                           class="border rounded px-2 py-1 w-full" 
                           value="${rules.maxNights}"
                           data-employee="${name}"
                           data-rule="maxNights">
                </div>
                <div>
                    <label class="block text-sm">Maximum RO služeb</label>
                    <input type="number" 
                           class="border rounded px-2 py-1 w-full" 
                           value="${rules.maxRO}"
                           data-employee="${name}"
                           data-rule="maxRO">
                </div>
                <div>
                    <label class="block text-sm">Minimální počet volných víkendů</label>
                    <input type="number" 
                           class="border rounded px-2 py-1 w-full" 
                           value="${rules.minFreeWeekends}"
                           data-employee="${name}"
                           data-rule="minFreeWeekends">
                </div>
                <div class="flex items-center gap-2">
                    <input type="checkbox" 
                           ${rules.canNights ? 'checked' : ''}
                           data-employee="${name}"
                           data-rule="canNights">
                    <label class="text-sm">Může mít noční služby</label>
                </div>
                ${rules.specialRules ? `
                <div class="flex items-center gap-2">
                    <input type="checkbox" 
                           checked 
                           disabled
                           data-employee="${name}"
                           data-rule="specialRules">
                    <label class="text-sm">Speciální pravidla</label>
                </div>
                ` : ''}
            </div>
        `;
        container.appendChild(card);
    });
}

// Funkce pro ukládání pravidel
function saveAllRules() {
    const updatedRules = {};
    
    // Sběr všech pravidel zaměstnanců
    document.querySelectorAll('input[data-employee]').forEach(input => {
        const name = input.dataset.employee;
        const rule = input.dataset.rule;
        const value = input.type === 'checkbox' ? input.checked : Number(input.value);
        
        if (!updatedRules[name]) {
            updatedRules[name] = {};
        }
        updatedRules[name][rule] = value;
    });

    // Uložení do localStorage
    localStorage.setItem('employeeRules', JSON.stringify(updatedRules));
    
    // Uložení obecných pravidel
    const generalRules = {
        minDayStaff: Number(document.getElementById('minDayStaff').value),
        minNightStaff: Number(document.getElementById('minNightStaff').value),
        maxConsecutiveShifts: Number(document.getElementById('maxConsecutiveShifts').value)
    };
    localStorage.setItem('generalRules', JSON.stringify(generalRules));

    alert('Pravidla byla úspěšně uložena');
}

// Načtení uložených pravidel
function loadSavedRules() {
    const savedRules = localStorage.getItem('employeeRules');
    if (savedRules) {
        const parsedRules = JSON.parse(savedRules);
        Object.keys(employees).forEach(name => {
            if (parsedRules[name]) {
                employees[name] = {
                    ...employees[name],
                    ...parsedRules[name]
                };
            }
        });
    }

    // Načtení obecných pravidel na stránce s pravidly
    const savedGeneralRules = localStorage.getItem('generalRules');
    if (savedGeneralRules && document.getElementById('minDayStaff')) {
        const rules = JSON.parse(savedGeneralRules);
        document.getElementById('minDayStaff').value = rules.minDayStaff;
        document.getElementById('minNightStaff').value = rules.minNightStaff;
        document.getElementById('maxConsecutiveShifts').value = rules.maxConsecutiveShifts;
    }
}

// Pomocná funkce pro export statistik
function calculateExportStats() {
    const stats = {};
    const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();
    const workDays = getWorkDays();

    Object.keys(employees).forEach(name => {
        let totalHours = 0;
        let weekendHours = 0;

        for (let day = 1; day <= daysInMonth; day++) {
            const shift = shifts[`${name}-${day}`];
            if (shift && shiftTypes[shift]) {
                const hours = shiftTypes[shift].hours;
                totalHours += hours;
                if (isWeekend(day)) {
                    weekendHours += hours;
                }
            }
        }

        stats[name] = {
            totalHours,
            weekendHours,
            fundHours: workDays * 7.5,
            overtime: totalHours - (workDays * 7.5)
        };
    });

    return stats;
}

// Inicializace stránky s pravidly
if (document.querySelector('.grid')) {
    document.addEventListener('DOMContentLoaded', () => {
        loadSavedRules();
        generateEmployeeCards();
    });
}
