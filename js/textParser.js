// textParser.js - 텍스트 일괄 입력 파싱 로직
const textParser = {
    parsedData: [],

    // 초기화
    init: function() {
        this.setupEvents();
    },

    // 이벤트 설정
    setupEvents: function() {
        // 파싱 버튼
        document.getElementById('parseBatchInput').addEventListener('click', () => {
            this.parseInput();
        });

        // 등록 버튼
        document.getElementById('confirmBatchInput').addEventListener('click', () => {
            this.registerParsedData();
        });

        // 취소 버튼
        document.getElementById('cancelBatchInput').addEventListener('click', () => {
            this.clearAndClose();
        });

        // 텍스트 입력시 자동 파싱 (디바운스)
        let parseTimeout;
        document.getElementById('batchInputText').addEventListener('input', (e) => {
            clearTimeout(parseTimeout);
            parseTimeout = setTimeout(() => {
                if (e.target.value.trim()) {
                    this.parseInput();
                }
            }, 500);
        });
    },

    // 입력 텍스트 파싱
    parseInput: function() {
        const inputText = document.getElementById('batchInputText').value.trim();
        if (!inputText) {
            alert('입력할 내용이 없습니다.');
            return;
        }

        this.parsedData = [];
        const previewContainer = document.getElementById('parsePreview');
        previewContainer.innerHTML = '';

        // 줄 단위로 분리
        const lines = inputText.split('\n').map(line => line.trim());
        
        let currentEmployee = null;
        let employeeData = null;
        const currentYear = new Date().getFullYear();

        lines.forEach((line, index) => {
            // 빈 줄은 건너뛰기
            if (!line) {
                // 빈 줄이 나오면 현재 직원 데이터 저장
                if (employeeData && employeeData.vacations.length > 0) {
                    this.parsedData.push(employeeData);
                    employeeData = null;
                    currentEmployee = null;
                }
                return;
            }

            // 날짜 패턴 체크 (MMDD 또는 MMDD(오전/오후))
            const datePattern = /^(\d{4})(\(오전\)|\(오후\))?$/;
            const match = line.match(datePattern);

            if (match) {
                // 날짜 라인
                if (!currentEmployee) {
                    this.addParseError(previewContainer, `${index + 1}번 줄: 직원 이름 없이 날짜가 입력되었습니다.`);
                    return;
                }

                const monthDay = match[1];
                const month = parseInt(monthDay.substring(0, 2));
                const day = parseInt(monthDay.substring(2, 4));
                const vacationType = match[2] ? match[2].replace(/[()]/g, '') : '연차';

                // 날짜 유효성 검사
                if (month < 1 || month > 12 || day < 1 || day > 31) {
                    this.addParseError(previewContainer, `${index + 1}번 줄: 잘못된 날짜 형식입니다. (${line})`);
                    return;
                }

                // Date 객체 생성 및 유효성 재확인
                const dateObj = new Date(currentYear, month - 1, day);
                if (dateObj.getMonth() !== month - 1) {
                    this.addParseError(previewContainer, `${index + 1}번 줄: 존재하지 않는 날짜입니다. (${line})`);
                    return;
                }

                const year = dateObj.getFullYear();
                const monthFormatted = String(dateObj.getMonth() + 1).padStart(2, '0');
                const dayFormatted = String(dateObj.getDate()).padStart(2, '0');
                const dateStr = `${year}-${monthFormatted}-${dayFormatted}`;
                
                employeeData.vacations.push({
                    date: dateStr,
                    type: vacationType,
                    originalText: line
                });
            } else {
                // 직원 이름으로 간주
                if (employeeData && employeeData.vacations.length > 0) {
                    this.parsedData.push(employeeData);
                }

                currentEmployee = line;
                employeeData = {
                    name: currentEmployee,
                    vacations: []
                };

                // 직원 이름이 기존 목록에 없으면 알림
                const employees = storage.getEmployees(); // 객체 배열 반환
                const employeeNames = employees.map(emp => emp.name); // 이름만 추출
                if (!employeeNames.includes(currentEmployee)) {
                    this.addParseWarning(previewContainer, `'${currentEmployee}'는 등록되지 않은 직원입니다. 자동으로 추가됩니다.`);
                }
            }
        });

        // 마지막 직원 데이터 저장
        if (employeeData && employeeData.vacations.length > 0) {
            this.parsedData.push(employeeData);
        }

        // 파싱 결과 표시
        this.displayParsedData(previewContainer);
        
        // 등록 버튼 활성화
        document.getElementById('confirmBatchInput').disabled = this.parsedData.length === 0;
    },

    // 파싱 오류 표시
    addParseError: function(container, message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'parse-item parse-error';
        errorDiv.textContent = '❌ ' + message;
        container.appendChild(errorDiv);
    },

    // 파싱 경고 표시
    addParseWarning: function(container, message) {
        const warningDiv = document.createElement('div');
        warningDiv.className = 'parse-item';
        warningDiv.style.color = '#f39c12';
        warningDiv.textContent = '⚠️ ' + message;
        container.appendChild(warningDiv);
    },

    // 파싱된 데이터 표시
    displayParsedData: function(container) {
        if (this.parsedData.length === 0) {
            const noDataDiv = document.createElement('div');
            noDataDiv.className = 'parse-item';
            noDataDiv.textContent = '파싱된 데이터가 없습니다.';
            container.appendChild(noDataDiv);
            return;
        }

        this.parsedData.forEach(employee => {
            const employeeDiv = document.createElement('div');
            employeeDiv.className = 'parse-item parse-success';
            
            const header = document.createElement('strong');
            header.textContent = `✅ ${employee.name} (${employee.vacations.length}건)`;
            employeeDiv.appendChild(header);

            const vacationList = document.createElement('ul');
            vacationList.style.marginTop = '5px';
            vacationList.style.marginLeft = '20px';

            employee.vacations.forEach(vacation => {
                const li = document.createElement('li');
                const date = new Date(vacation.date);
                const dateText = `${date.getMonth() + 1}월 ${date.getDate()}일`;
                const typeText = vacation.type === '연차' ? '연차휴가' : vacation.type + '반차';
                li.textContent = `${dateText} - ${typeText}`;
                vacationList.appendChild(li);
            });

            employeeDiv.appendChild(vacationList);
            container.appendChild(employeeDiv);
        });

        // 총 건수 표시
        const totalDiv = document.createElement('div');
        totalDiv.className = 'parse-item';
        totalDiv.style.marginTop = '10px';
        totalDiv.style.fontWeight = 'bold';
        const totalVacations = this.parsedData.reduce((sum, emp) => sum + emp.vacations.length, 0);
        totalDiv.textContent = `총 ${this.parsedData.length}명, ${totalVacations}건의 휴가가 등록 예정입니다.`;
        container.appendChild(totalDiv);
    },

    // 파싱된 데이터 등록
    registerParsedData: function() {
        if (this.parsedData.length === 0) {
            alert('등록할 데이터가 없습니다.');
            return;
        }

        let successCount = 0;
        let newEmployees = [];
        let overwriteCount = 0;

        console.log('일괄 등록 시작:', this.parsedData);

        this.parsedData.forEach(employee => {
            console.log(`${employee.name} 직원 휴가 등록 시작`);
            
            // 신규 직원인 경우 추가
            const employees = storage.getEmployees(); // 객체 배열 반환
            const employeeNames = employees.map(emp => emp.name); // 이름만 추출
            if (!employeeNames.includes(employee.name)) {
                // 새 직원을 기본 부서/팀으로 추가
                storage.addEmployeeNew(employee.name, null, null, 'member');
                newEmployees.push(employee.name);
                console.log(`신규 직원 추가: ${employee.name}`);
            }

            // 휴가 등록
            employee.vacations.forEach(vacation => {
                console.log(`휴가 등록: ${vacation.date} - ${employee.name} - ${vacation.type}`);
                
                // 기존 휴가가 있는지 확인
                const existingVacation = storage.getVacationInfo(vacation.date, employee.name);
                if (existingVacation) {
                    console.log(`기존 휴가 덮어쓰기: ${vacation.date} - ${employee.name}`);
                    overwriteCount++;
                }
                
                storage.addVacation(vacation.date, employee.name, vacation.type);
                successCount++;
            });
        });

        let message = `${successCount}건의 휴가가 성공적으로 등록되었습니다.`;
        if (overwriteCount > 0) {
            message += `\n(기존 휴가 ${overwriteCount}건이 덮어쓰기되었습니다.)`;
        }
        if (newEmployees.length > 0) {
            message += `\n\n새로 추가된 직원: ${newEmployees.join(', ')}`;
        }

        console.log('일괄 등록 완료:', message);
        alert(message);

        // 초기화 및 닫기
        this.clearAndClose();
        
        // 직원 목록 새로고침 (새 직원이 추가된 경우)
        if (newEmployees.length > 0) {
            vacationManager.loadEmployees();
            vacationManager.loadFilterCheckboxes();
        }
        
        // 달력 새로고침
        calendar.refresh();
    },

    // 초기화 및 모달 닫기
    clearAndClose: function() {
        document.getElementById('batchInputText').value = '';
        document.getElementById('parsePreview').innerHTML = '';
        document.getElementById('confirmBatchInput').disabled = true;
        document.getElementById('batchInputModal').style.display = 'none';
        this.parsedData = [];
    }
};

