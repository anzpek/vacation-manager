// calendar.js - 달력 렌더링 및 관리
const calendar = {
    currentDate: new Date(),
    filter: { type: 'all', value: '' },

    init: function() {
        this.render();
        this.attachEvents();
    },

    attachEvents: function() {
        document.getElementById('prevMonth').addEventListener('click', () => this.changeMonth(-1));
        document.getElementById('nextMonth').addEventListener('click', () => this.changeMonth(1));
    },

    async changeMonth(direction) {
        this.currentDate.setMonth(this.currentDate.getMonth() + direction);
        await this.render();
    },

    async render(container = document.getElementById('calendar'), year = this.currentDate.getFullYear(), month = this.currentDate.getMonth(), updateHeader = true) {
        await holidays.loadHolidays(year);
        if (updateHeader) {
            document.getElementById('currentMonth').textContent = `${year}년 ${month + 1}월`;
        }

        container.innerHTML = '';
        const doc = container.ownerDocument;
        const dateToCellMap = new Map();

        const weekDays = ['일', '월', '화', '수', '목', '금', '토'];
        weekDays.forEach(day => {
            const headerCell = doc.createElement('div');
            headerCell.className = 'calendar-header-cell';
            headerCell.textContent = day;
            container.appendChild(headerCell);
        });

        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const prevLastDay = new Date(year, month, 0);

        for (let i = firstDay.getDay() - 1; i >= 0; i--) {
            const date = new Date(year, month - 1, prevLastDay.getDate() - i);
            const cell = this.createCell(date, true, doc);
            container.appendChild(cell);
            dateToCellMap.set(formatDateToYYYYMMDD(date), cell);
        }
        for (let i = 1; i <= lastDay.getDate(); i++) {
            const date = new Date(year, month, i);
            const cell = this.createCell(date, false, doc);
            container.appendChild(cell);
            dateToCellMap.set(formatDateToYYYYMMDD(date), cell);
        }
        const totalCells = firstDay.getDay() + lastDay.getDate();
        const nextDays = totalCells > 35 ? 42 - totalCells : 35 - totalCells;
        for (let i = 1; i <= nextDays; i++) {
            const date = new Date(year, month + 1, i);
            const cell = this.createCell(date, true, doc);
            container.appendChild(cell);
            dateToCellMap.set(formatDateToYYYYMMDD(date), cell);
        }

        let employees = storage.getEmployees().filter(e => !storage.isHiddenEmployee(e.name));
        if (this.filter.type === 'employee') {
            employees = employees.filter(e => this.filter.value.includes(e.name));
        }
        const employeeNames = employees.map(e => e.name);
        const vacationData = storage.groupVacationsForRendering(employeeNames);
        
        // 디버깅용 로그 추가
        console.log('달력 렌더링 - 직원 목록:', employeeNames);
        console.log('달력 렌더링 - 휴가 데이터:', vacationData);
        console.log('달력 렌더링 - 모든 휴가:', storage.getVacations());
        
        this.renderVacations(vacationData, dateToCellMap, doc);
    },

    createCell: function(date, isOtherMonth, doc) {
        const cell = doc.createElement('div');
        cell.className = 'calendar-cell';
        const dateStr = formatDateToYYYYMMDD(date);
        if (isOtherMonth) cell.classList.add('other-month');
        if (date.getDay() === 0) cell.classList.add('sunday');
        if (date.getDay() === 6) cell.classList.add('saturday');
        if (date.toDateString() === new Date().toDateString()) cell.classList.add('today');

        const holidayInfo = holidays.getHolidays(date.getFullYear())[dateStr];
        if (holidayInfo) cell.classList.add('holiday');

        cell.innerHTML = `
            <div class="date-number-container">
                <div class="date-number">${date.getDate()}</div>
                ${holidayInfo ? `<div class="holiday-name">${holidayInfo}</div>` : ''}
            </div>
            <div class="vacations"></div>
        `;

        if (!isOtherMonth) {
            cell.addEventListener('click', (e) => {
                if (!e.target.closest('.vacation-bar, .vacation-item')) {
                    vacationManager.showModal(dateStr);
                }
            });
        }
        return cell;
    },

    renderVacations: function(vacationChains, dateToCellMap, doc) {
        const layout = {}; // dateStr -> array of rows, where each row is occupied by a chain

        // Initialize layout for all visible dates
        dateToCellMap.forEach((cell, dateStr) => {
            layout[dateStr] = [];
        });

        vacationChains.sort((a, b) => a.segments[0].date.localeCompare(b.segments[0].date));

        for (const chain of vacationChains) {
            let targetRow = 0;
            let isPlaced = false;

            while (!isPlaced) {
                let canPlace = true;
                // Check only against dates currently visible on the calendar
                for (const segment of chain.segments) {
                    if (layout[segment.date] && layout[segment.date][targetRow]) {
                        canPlace = false;
                        break;
                    }
                }

                if (canPlace) {
                    for (const segment of chain.segments) {
                        // Place chain only on visible dates
                        if (layout[segment.date]) {
                            layout[segment.date][targetRow] = chain;
                        }
                    }
                    isPlaced = true;
                } else {
                    targetRow++;
                }
            }
        }

        // Clear previous vacation elements
        dateToCellMap.forEach(cell => {
            const container = cell.querySelector('.vacations');
            if (container) container.innerHTML = '';
        });

        const renderedChains = new Set();

        for (const dateStr of dateToCellMap.keys()) { // Iterate over visible dates
            const cell = dateToCellMap.get(dateStr);
            if (!cell) continue;

            const vacationContainer = cell.querySelector('.vacations');
            const rows = layout[dateStr];

            for (let i = 0; i < rows.length; i++) {
                const chain = rows[i];
                const rowDiv = doc.createElement('div');
                rowDiv.className = 'vacation-row';

                if (chain && !renderedChains.has(chain)) {
                    renderedChains.add(chain);

                    for (let j = 0; j < chain.segments.length; j++) {
                        const segment = chain.segments[j];
                        const segmentCell = dateToCellMap.get(segment.date);
                        if (!segmentCell) continue; // Only render for visible cells

                        const block = doc.createElement('div');
                        block.className = 'vacation-block';
                        block.style.backgroundColor = storage.getEmployeeColor(chain.employee);
                        block.textContent = chain.employee;

                        if (segment.type === '오전') {
                            block.classList.add('vacation-block-am');
                        } else if (segment.type === '오후') {
                            block.classList.add('vacation-block-pm');
                        } else {
                            block.classList.add('vacation-block-full');
                        }

                        // 현재 달에서 보이는 부분만 고려하여 시작/중간/끝 판단
                        const visibleSegments = chain.segments.filter(seg => dateToCellMap.has(seg.date));
                        const visibleIndex = visibleSegments.findIndex(seg => seg.date === segment.date);
                        const isVisibleFirst = (visibleIndex === 0);
                        const isVisibleLast = (visibleIndex === visibleSegments.length - 1);

                        if (visibleSegments.length === 1) {
                            // 현재 달에 하나만 보이는 경우
                            if (chain.segments.length === 1) {
                                block.classList.add('vacation-block-single');
                            } else {
                                block.classList.add('vacation-block-middle');
                            }
                        } else if (isVisibleFirst) {
                            // 현재 달에서 첫 번째로 보이는 날
                            if (j === 0) {
                                block.classList.add('vacation-block-start');
                            } else {
                                block.classList.add('vacation-block-middle');
                            }
                        } else if (isVisibleLast) {
                            // 현재 달에서 마지막으로 보이는 날
                            if (j === chain.segments.length - 1) {
                                block.classList.add('vacation-block-end');
                            } else {
                                block.classList.add('vacation-block-middle');
                            }
                        } else {
                            // 현재 달에서 중간에 보이는 날
                            block.classList.add('vacation-block-middle');
                        }

                        block.addEventListener('click', (e) => {
                            e.stopPropagation();
                            vacationManager.showEditModal(chain);
                        });

                        const targetVacationContainer = segmentCell.querySelector('.vacations');
                        while (targetVacationContainer.children.length <= i) {
                            const newRow = doc.createElement('div');
                            newRow.className = 'vacation-row';
                            targetVacationContainer.appendChild(newRow);
                        }
                        targetVacationContainer.children[i].appendChild(block);
                    }
                } else if (!rows[i]) {
                    const rowDiv = doc.createElement('div');
                    rowDiv.className = 'vacation-row';
                    vacationContainer.appendChild(rowDiv);
                }
            }
        }
    },

    refresh: async function() {
        await this.render();
    }
};