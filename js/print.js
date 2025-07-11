// print.js - 다중 월 인쇄 기능

const printManager = {
    init() {
        this.setupEventListeners();
    },

    setupEventListeners() {
        // vacation.js에서 인쇄 버튼 이벤트를 처리하므로 여기서는 설정하지 않음
        
        const printForm = document.getElementById('multiMonthPrintForm');
        if (printForm) {
            printForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.executePrint();
            });
        }

        const cancelPrintBtn = document.getElementById('cancelMultiMonthPrint');
        if (cancelPrintBtn) {
            cancelPrintBtn.addEventListener('click', () => {
                document.getElementById('multiMonthPrintModal').style.display = 'none';
            });
        }
    },

    showPrintModal() {
        const modal = document.getElementById('multiMonthPrintModal');
        const yearSelect = document.getElementById('printYear');
        const monthContainer = document.getElementById('monthCheckboxesContainer');
        
        // 연도 옵션 설정
        const currentYear = new Date().getFullYear();
        yearSelect.innerHTML = '';
        for (let y = currentYear - 1; y <= currentYear + 1; y++) {
            const option = document.createElement('option');
            option.value = y;
            option.textContent = y + '년';
            if (y === currentYear) option.selected = true;
            yearSelect.appendChild(option);
        }
        
        // 월 체크박스 생성
        const months = ['1월', '2월', '3월', '4월', '5월', '6월', 
                       '7월', '8월', '9월', '10월', '11월', '12월'];
        
        monthContainer.innerHTML = '';
        months.forEach((month, index) => {
            const label = document.createElement('label');
            label.innerHTML = `
                <input type="checkbox" name="printMonth" value="${index + 1}" 
                       ${index + 1 === new Date().getMonth() + 1 ? 'checked' : ''}>
                ${month}
            `;
            monthContainer.appendChild(label);
        });
        
        modal.style.display = 'block';
    },

    executePrint() {
        const year = document.getElementById('printYear').value;
        const selectedMonths = Array.from(document.querySelectorAll('input[name="printMonth"]:checked'))
            .map(cb => parseInt(cb.value));
        
        if (selectedMonths.length === 0) {
            alert('인쇄할 월을 선택해주세요.');
            return;
        }
        
        // 4개월씩 페이지 분할
        const pagesData = [];
        for (let i = 0; i < selectedMonths.length; i += 4) {
            pagesData.push(selectedMonths.slice(i, i + 4));
        }
        
        // 인쇄용 창 열기
        const printWindow = window.open('', '_blank');
        
        // 인쇄용 HTML 생성 (페이징 처리)
        const printHTML = this.generatePrintHTML(year, pagesData);
        
        printWindow.document.write(printHTML);
        printWindow.document.close();
        
        // 모달 닫기
        document.getElementById('multiMonthPrintModal').style.display = 'none';
        
        // 인쇄 대화상자 열기
        setTimeout(() => {
            printWindow.print();
        }, 500);
    },

    generatePrintHTML(year, pagesData) {
        let html = `
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <title>${year}년 휴가 달력</title>
    <style>
        @page {
            size: A4 landscape;
            margin: 1mm; /* 여백 극한 감소 */
        }
        
        * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
        }
        
        body {
            margin: 0;
            padding: 0;
            font-family: 'Malgun Gothic', sans-serif;
        }
        
        .print-container {
            width: 100%;
            height: 100vh;
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            grid-template-rows: repeat(2, 1fr);
            gap: 2px; /* 간격 극한 감소 */
            padding: 1px; /* 패딩 극한 감소 */
            margin: 0;
            box-sizing: border-box;
        }
        
        .calendar-item {
            border: 1px solid #34495e;
            padding: 2px; /* 패딩 극한 감소 */
            break-inside: avoid;
            page-break-inside: avoid;
            background-color: white;
            border-radius: 1px; /* 모서리 극한으로 작게 */
            width: 100%;
            height: 100%;
            display: flex;
            flex-direction: column;
            overflow: hidden;
        }
        
        .calendar-title {
            text-align: center;
            font-size: 11px; /* 크기 극한 감소 12px → 11px */
            font-weight: bold;
            margin-bottom: 1px; /* 마진 극한 감소 2px → 1px */
            color: #2c3e50;
            flex-shrink: 0;
        }
        
        .calendar-grid {
            width: 100%;
            border-collapse: collapse;
            table-layout: fixed;
            flex: 1; /* 테이블이 남은 공간을 모두 차지 */
        }
        
        .calendar-grid th,
        .calendar-grid td {
            border: 1px solid #ccc;
            padding: 0px; /* 패딩 완전 제거 */
            text-align: left;
            vertical-align: top;
            position: relative;
            width: 14.285%;
            overflow: hidden;
            box-sizing: border-box;
        }
        
        .calendar-grid th {
            background-color: #34495e !important;
            color: white !important;
            text-align: center;
            font-weight: bold;
            padding: 1px 0px; /* 패딩 극한 감소 */
            font-size: 8px; /* 폰트 크기 극한 감소 */
        }
        
        /* 일요일 헤더 */
        .calendar-grid th:first-child {
            color: #ff6b6b !important;
        }
        
        /* 토요일 헤더 */
        .calendar-grid th:last-child {
            color: #4dabf7 !important;
        }
        
        .calendar-grid td {
            min-height: 18px; /* 기본 높이 극한 감소 20px → 18px */
            height: auto;
            position: relative;
            overflow: hidden;
            vertical-align: top;
            background-color: white;
            padding: 1px;
        }
        
        /* 일요일 셀 */
        .calendar-grid .sunday {
            background-color: #ffebee !important; /* 연한 빨간색 배경 */
        }
        
        /* 토요일 셀 */
        .calendar-grid .saturday {
            background-color: #e3f2fd !important; /* 연한 파란색 배경 */
        }
        
        /* 이전/다음 달 셀 */
        .calendar-grid .other-month {
            background-color: #f5f5f5 !important; /* 연한 회색 배경 */
            color: #999 !important;
        }
        
        /* 이전/다음 달 + 일요일 */
        .calendar-grid .other-month.sunday {
            background: linear-gradient(135deg, #f5f5f5 0%, #f5f5f5 40%, #ffebee 60%, #ffebee 100%) !important;
        }
        
        /* 이전/다음 달 + 토요일 */
        .calendar-grid .other-month.saturday {
            background: linear-gradient(45deg, #f5f5f5 0%, #f5f5f5 40%, #e3f2fd 60%, #e3f2fd 100%) !important;
        }
        
        .layout-5 .calendar-grid td,
        .layout-6 .calendar-grid td {
            min-height: 55px; /* 작은 레이아웃에서는 최소 높이 감소 */
            height: auto; /* 자동 높이 조절 */
            position: relative;
            overflow: visible; /* 내용이 보이도록 */
        }
        
        .layout-3 .calendar-grid td {
            height: 55px; /* 3개월 레이아웃 */
            min-height: 55px;
            position: relative;
            overflow: hidden;
        }
        
        .date-number {
            font-weight: bold;
            font-size: 10px; /* 폰트 크기 더 감소 */
            margin-bottom: 1px; /* 마진 더 감소 */
            margin-left: 1px; /* 좌측 마진 추가 */
        }
        
        .sunday .date-number { 
            color: #d32f2f !important; /* 일요일 빨간색 */
        }
        
        .saturday .date-number { 
            color: #1976d2 !important; /* 토요일 파란색 */
        }
        
        .holiday .date-number { 
            color: #d32f2f !important; /* 공휴일 빨간색 */
        }
        
        .other-month .date-number {
            color: #bbb !important; /* 이전/다음 달 연한 회색 */
        }
        
        .vacation-info {
            font-size: 5px; /* 폰트 크기 극한 감소 */
            font-weight: 600;
            margin: 0;
            padding: 0px;
            border-radius: 1px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            position: absolute;
            height: 5px; /* 높이 극한 감소 */
            line-height: 5px;
            color: white;
            text-align: center;
            box-sizing: border-box;
            left: 1px;
            right: 1px;
            width: auto;
        }
        
        /* 반차 크기 조정 */
        .vacation-오전,
        .vacation-오후 {
            font-size: 4px !important; /* 극한 작은 폰트 */
            height: 4px !important; /* 극한 작은 높이 */
            line-height: 4px !important;
            padding: 0px !important;
        }
        
        .vacation-오전 {
            left: 1px !important;
            width: calc(50% - 1px) !important;
        }
        
        .vacation-오후 {
            left: 50% !important;
            width: calc(50% - 1px) !important;
        }
        
        /* 휴가 유형별 위치 설정 */
        .vacation-연차,
        .vacation-특별,
        .vacation-single {
            left: 1px;
            right: 1px;
            width: auto;
            border-radius: 3px;
        }
        
        .vacation-start {
            left: 1px;
            right: 1px;
            width: auto;
            border-radius: 3px 0 0 3px;
        }
        
        .vacation-middle {
            left: 1px;
            right: 1px;
            width: auto;
            border-radius: 0;
        }
        
        .vacation-end {
            left: 1px;
            right: 1px;
            width: auto;
            border-radius: 0 3px 3px 0;
        }
        
        .vacation-오전 {
            left: 0;
            width: 50%;
            border-radius: 3px;
        }
        
        .vacation-오후 {
            left: 50%;
            width: 50%;
            border-radius: 3px;
        }
        
        @media print {
            .no-print { display: none; }
        }
    </style>
</head>
<body>
`;
        
        // 페이지별로 달력 생성
        pagesData.forEach((pageMonths, pageIndex) => {
            if (pageIndex > 0) {
                html += '<div style="page-break-before: always;"></div>'; // 새 페이지 시작
            }
            
            html += `<div class="print-container">`;
            
            // 각 페이지의 월별 달력 생성
            pageMonths.forEach(month => {
                html += this.generateMonthCalendar(year, month);
            });
            
            html += `</div>`;
        });
        
        html += `
</body>
</html>`;
        
        return html;
    },

    getLayoutClass(count) {
        return `layout-${count}`;
    },

    generateMonthCalendar(year, month) {
        const monthNames = ['', '1월', '2월', '3월', '4월', '5월', '6월', 
                           '7월', '8월', '9월', '10월', '11월', '12월'];
        
        const firstDay = new Date(year, month - 1, 1).getDay();
        const lastDate = new Date(year, month, 0).getDate();
        
        // 현재 월의 모든 날짜 계산 (이전/다음 달 포함)
        const dateToCellMap = new Map();
        const allDates = [];
        
        // 이전 달 마지막 날들
        const prevLastDay = new Date(year, month - 1, 0);
        for (let i = firstDay - 1; i >= 0; i--) {
            const date = new Date(year, month - 2, prevLastDay.getDate() - i);
            const dateStr = formatDateToYYYYMMDD(date);
            dateToCellMap.set(dateStr, true);
            allDates.push(dateStr);
        }
        
        // 현재 달 날짜들
        for (let i = 1; i <= lastDate; i++) {
            const date = new Date(year, month - 1, i);
            const dateStr = formatDateToYYYYMMDD(date);
            dateToCellMap.set(dateStr, true);
            allDates.push(dateStr);
        }
        
        // 다음 달 첫 날들
        const totalCells = firstDay + lastDate;
        const nextDays = totalCells > 35 ? 42 - totalCells : 35 - totalCells;
        for (let i = 1; i <= nextDays; i++) {
            const date = new Date(year, month, i);
            const dateStr = formatDateToYYYYMMDD(date);
            dateToCellMap.set(dateStr, true);
            allDates.push(dateStr);
        }
        
        // 휴가 데이터 그룹화 (연속 휴가 처리)
        let employees = storage.getEmployees().filter(e => !storage.isHiddenEmployee(e));
        const filteredEmployees = Array.from(document.querySelectorAll('.employee-checkbox:checked')).map(cb => cb.value);
        if (filteredEmployees.length > 0) {
            employees = employees.filter(e => filteredEmployees.includes(e));
        }
        const vacationChains = storage.groupVacationsForRendering(employees);
        
        let html = `
        <div class="calendar-item">
            <div class="calendar-title">${year}년 ${monthNames[month]}</div>
            <table class="calendar-grid">
                <thead>
                    <tr>
                        <th style="color: red; width: 14.28%;">일</th>
                        <th style="width: 14.28%;">월</th>
                        <th style="width: 14.28%;">화</th>
                        <th style="width: 14.28%;">수</th>
                        <th style="width: 14.28%;">목</th>
                        <th style="width: 14.28%;">금</th>
                        <th style="color: blue; width: 14.28%;">토</th>
                    </tr>
                </thead>
                <tbody>`;
        
        let dateIndex = 0;
        for (let week = 0; week < 6; week++) {
            if (dateIndex >= allDates.length) break;
            
            html += '<tr>';
            for (let day = 0; day < 7; day++) {
                if (dateIndex >= allDates.length) {
                    html += '<td></td>';
                } else {
                    const dateStr = allDates[dateIndex];
                    const dateObj = parseDateString(dateStr);
                    const dayClass = day === 0 ? 'sunday' : (day === 6 ? 'saturday' : '');
                    const holidayData = holidays.getHolidays(dateObj.getFullYear());
                    const isHoliday = holidayData[dateStr];
                    const isOtherMonth = dateObj.getMonth() !== month - 1;
                    
                    html += `<td class="${dayClass} ${isHoliday ? 'holiday' : ''} ${isOtherMonth ? 'other-month' : ''}">`;
                    html += `<div class="date-number">${dateObj.getDate()}</div>`;
                    
                    // 해당 날짜의 휴가 표시 (연속 휴가 고려)
                    html += this.renderVacationsForDate(dateStr, dateToCellMap, vacationChains);
                    
                    html += '</td>';
                    dateIndex++;
                }
            }
            html += '</tr>';
        }
        
        html += `
                </tbody>
            </table>
        </div>`;
        
        return html;
    },

    renderVacationsForDate(dateStr, dateToCellMap, vacationChains) {
        let html = '';
        let rowIndex = 0;
        
        // 해당 날짜에 있는 휴가 체인들 찾기 (각 날짜별로 독립적으로 처리)
        const chainsForDate = [];
        
        for (const chain of vacationChains) {
            // 이 체인이 현재 날짜를 포함하는지 확인
            const segmentForDate = chain.segments.find(seg => seg.date === dateStr);
            if (segmentForDate) {
                chainsForDate.push({
                    chain: chain,
                    segment: segmentForDate
                });
            }
        }
        
        // 각 체인을 렌더링
        for (const {chain, segment} of chainsForDate) {
            // 현재 달에서 보이는 세그먼트들만 필터링
            const visibleSegments = chain.segments.filter(seg => dateToCellMap.has(seg.date));
            const segmentIndex = visibleSegments.findIndex(seg => seg.date === dateStr);
            const globalSegmentIndex = chain.segments.findIndex(seg => seg.date === dateStr);
            
            const topPosition = 9 + (rowIndex * 5); // 위치와 간격 극한 감소
            const employeeColor = storage.getEmployeeColor(chain.employee);
            
            let barClass = 'vacation-info';
            let leftPos = '0';
            let width = '100%';
            
            // 반차 처리
            if (segment.type === '오전') {
                barClass += ' vacation-오전';
                html += `<div class="${barClass}" style="top: ${topPosition}px; background-color: ${employeeColor} !important;">${chain.employee}</div>`;
            } else if (segment.type === '오후') {
                barClass += ' vacation-오후';
                html += `<div class="${barClass}" style="top: ${topPosition}px; background-color: ${employeeColor} !important;">${chain.employee}</div>`;
            } else {
                // 연속 휴가 막대 스타일 결정
                if (visibleSegments.length === 1) {
                    if (chain.segments.length === 1) {
                        barClass += ' vacation-single';
                    } else {
                        barClass += ' vacation-middle';
                    }
                } else if (segmentIndex === 0) {
                    if (globalSegmentIndex === 0) {
                        barClass += ' vacation-start';
                    } else {
                        barClass += ' vacation-middle';
                    }
                } else if (segmentIndex === visibleSegments.length - 1) {
                    if (globalSegmentIndex === chain.segments.length - 1) {
                        barClass += ' vacation-end';
                    } else {
                        barClass += ' vacation-middle';
                    }
                } else {
                    barClass += ' vacation-middle';
                }
                
                html += `<div class="${barClass}" style="top: ${topPosition}px; background-color: ${employeeColor} !important;">${chain.employee}</div>`;
            }
            
            rowIndex++;
        }
        
        return html;
    },

    getVacationsForDate(vacations, employees, dateStr, filteredEmployees, showAll) {
        // storage의 구조에 맞게 수정
        // vacations는 날짜별로 저장되어 있음
        const dayVacations = vacations[dateStr] || [];
        
        return dayVacations.filter(vac => {
            if (showAll) return true;
            return filteredEmployees.includes(vac.employee);
        }).map(vac => ({
            name: vac.employee,
            type: vac.type
        }));
    }
};

// 초기화 함수 추가
if (typeof window.printManager === 'undefined') {
    window.printManager = printManager;
}
