// storage.js - 로컬 스토리지 관리
const storage = {
    KEYS: {
        EMPLOYEES_DATA: 'vacation_employees_data',
        VACATIONS: 'vacation_data',
        TEAMS: 'vacation_teams', // 팀 데이터 키 (호환성을 위해 유지)
        DEPARTMENTS: 'vacation_departments' // 부서 데이터 키 추가
    },

    // 색상 팔레트 (다양한 색상 추가 가능)
    colorPalette: [
        '#FF6B6B', '#FFD166', '#06D6A0', '#118AB2', '#073B4C',
        '#FF9F1C', '#2EC4B6', '#E71D36', '#F7B801', '#A8DADC',
        '#457B9D', '#1D3557', '#F4A261', '#E76F51', '#2A9D8F',
        '#8D99AE', '#D8BFD8', '#FFC0CB'
    ],
    employeeData: {}, // 직원 정보 (색상, 숨김 여부, 팀 포함)
    teams: [], // 팀 목록을 저장할 배열 (호환성을 위해 유지)
    departments: [], // 부서 목록을 저장할 배열 추가

    // 초기화 함수
    init: function() {
        console.log('Storage 초기화 시작');
        this.loadEmployeeData();
        this.loadTeams(); // 팀 데이터 로드 (호환성을 위해 유지)
        this.loadDepartments(); // 부서 데이터 로드 추가
        this.migrateToNewStructure(); // 기존 데이터를 새 구조로 마이그레이션
        
        // 테스트용 휴가 데이터 추가 - 비활성화
        // this.addTestVacations();
        
        // 디버깅: 초기화 후 상태 확인
        console.log('초기화 후 employeeData:', this.employeeData);
        console.log('초기화 후 직원 목록:', this.getEmployees());
        console.log('초기화 후 부서 목록:', this.getDepartments());
        console.log('초기화 후 휴가 데이터:', this.getVacations());
    },

    // 테스트용 휴가 데이터 추가
    addTestVacations: function() {
        const existingVacations = this.getVacations();
        
        console.log('테스트 휴가 데이터 추가 시작');
        console.log('기존 휴가 데이터:', existingVacations);
        
        // 7월 테스트 휴가 데이터
        const testVacations = [
            { date: '2025-07-01', employee: '이용진', type: '연차' },
            { date: '2025-07-02', employee: '이용진', type: '연차' },
            { date: '2025-07-03', employee: '정예원', type: '오전' },
            { date: '2025-07-07', employee: '강태호', type: '특별' },
            { date: '2025-07-08', employee: '강태호', type: '특별' },
            { date: '2025-07-09', employee: '강태호', type: '특별' },
            { date: '2025-07-15', employee: '박민', type: '오후' },
            { date: '2025-07-21', employee: '임국단', type: '연차' },
            { date: '2025-07-22', employee: '임국단', type: '연차' }
        ];
        
        // 항상 테스트 데이터 추가 (기존 여부와 관계없이)
        testVacations.forEach(vacation => {
            console.log('휴가 추가:', vacation);
            this.addVacation(vacation.date, vacation.employee, vacation.type);
        });
        
        console.log('테스트 휴가 데이터 추가 완료');
        console.log('추가 후 휴가 데이터:', this.getVacations());
    },

    // 강제 초기화 함수 (데이터가 없을 때 사용)
    forceInit: function() {
        console.log('강제 초기화 시작');
        // localStorage 클리어
        localStorage.removeItem(this.KEYS.EMPLOYEES_DATA);
        localStorage.removeItem(this.KEYS.DEPARTMENTS);
        localStorage.removeItem(this.KEYS.TEAMS);
        
        // 기본 데이터 강제 설정
        this.employeeData = { ...this.defaultEmployeeData };
        this.departments = JSON.parse(JSON.stringify(this.defaultDepartments));
        
        // 저장
        this.saveEmployeeData();
        this.saveDepartments();
        
        console.log('강제 초기화 완료');
        console.log('직원 데이터:', this.employeeData);
        console.log('부서 데이터:', this.departments);
    },

    // 직원 데이터 로드
    loadEmployeeData: function() {
        const saved = localStorage.getItem(this.KEYS.EMPLOYEES_DATA);
        if (saved) {
            this.employeeData = JSON.parse(saved);
        } else {
            this.employeeData = { ...this.defaultEmployeeData };
            this.saveEmployeeData();
        }
    },

    // 직원 데이터 저장
    saveEmployeeData: function() {
        localStorage.setItem(this.KEYS.EMPLOYEES_DATA, JSON.stringify(this.employeeData));
    },

    // 직원의 색상 가져오기
    getEmployeeColor: function(employeeName) {
        return this.employeeData[employeeName] ? this.employeeData[employeeName].color : '#CCCCCC'; // 기본 색상
    },

    // 직원 색상 업데이트
    updateEmployeeColor: function(employeeName, newColor) {
        if (this.employeeData[employeeName]) {
            this.employeeData[employeeName].color = newColor;
            this.saveEmployeeData();
        }
    },

    // 직원 숨기기
    hideEmployee: function(employeeName) {
        if (this.employeeData[employeeName]) {
            this.employeeData[employeeName].hidden = true;
            this.saveEmployeeData();
        }
    },

    // 직원 표시
    showEmployee: function(employeeName) {
        if (this.employeeData[employeeName]) {
            this.employeeData[employeeName].hidden = false;
            this.saveEmployeeData();
        }
    },

    // 직원이 숨겨져 있는지 확인
    isHiddenEmployee: function(employeeName) {
        return this.employeeData[employeeName] ? this.employeeData[employeeName].hidden : false;
    },

    // 모든 직원 이름 가져오기 (문자열 배열)
    getEmployeeNames: function() {
        return Object.keys(this.employeeData).sort();
    },

    // 모든 직원 정보 가져오기 (객체 배열)
    getEmployees: function() {
        const employees = [];
        for (const name in this.employeeData) {
            const empData = this.employeeData[name];
            employees.push({
                id: name.toLowerCase().replace(/\s+/g, ''),
                name: name,
                department: empData.department || 'unknown',
                team: empData.team || 'unknown',
                role: empData.role || 'member',
                color: empData.color || '#CCCCCC',
                hidden: empData.hidden || false
            });
        }
        return employees.sort((a, b) => a.name.localeCompare(b.name));
    },

    // 직원 정보 저장 (객체 배열을 받아서 저장)
    saveEmployees: function(employees) {
        const newEmployeeData = {};
        employees.forEach(emp => {
            newEmployeeData[emp.name] = {
                color: emp.color || this.getEmployeeColor(emp.name),
                hidden: emp.hidden || false,
                department: emp.department || 'unknown',
                team: emp.team || 'unknown',
                role: emp.role || 'member'
            };
        });
        this.employeeData = newEmployeeData;
        this.saveEmployeeData();
    },

    // 팀별로 직원 그룹화하여 가져오기
    getEmployeesGroupedByTeam: function() {
        const grouped = {};
        this.getTeams().forEach(team => grouped[team] = []);
        grouped['미지정'] = [];

        for (const empName in this.employeeData) {
            const empData = this.employeeData[empName];
            if (empData.team && grouped[empData.team]) {
                grouped[empData.team].push(empName);
            } else {
                grouped['미지정'].push(empName);
            }
        }
        // 각 팀별 직원 목록 정렬
        for (const team in grouped) {
            grouped[team].sort();
        }
        return grouped;
    },

    // 기본 직원 데이터 (신규 부서 구조)
    defaultEmployeeData: {
        '이용진': { color: '#FF6B6B', hidden: false, department: 'support', team: 'customer', role: 'leader' },
        '정예원': { color: '#FFD166', hidden: false, department: 'support', team: 'customer', role: 'member' },
        '정욱군': { color: '#06D6A0', hidden: false, department: 'support', team: 'customer', role: 'member' },
        '강태호': { color: '#118AB2', hidden: false, department: 'support', team: 'compensation', role: 'leader' },
        '백순열': { color: '#073B4C', hidden: false, department: 'support', team: 'compensation', role: 'member' },
        '장순아': { color: '#FF9F1C', hidden: false, department: 'support', team: 'compensation', role: 'member' },
        '강능훈': { color: '#2EC4B6', hidden: false, department: 'admin', team: 'guidance', role: 'leader' },
        '박민': { color: '#E71D36', hidden: false, department: 'admin', team: 'guidance', role: 'member' },
        '배영제': { color: '#F7B801', hidden: false, department: 'admin', team: 'guidance', role: 'member' },
        '임국단': { color: '#A8DADC', hidden: false, department: 'admin', team: 'guidance', role: 'member' }
    },

    // 팀 데이터 로드
    loadTeams: function() {
        const saved = localStorage.getItem(this.KEYS.TEAMS);
        if (saved) {
            this.teams = JSON.parse(saved);
        } else {
            // 기본 팀 설정
            this.teams = ['영업팀', '개발팀', '마케팅팀'];
            this.saveTeams();
        }
    },

    // 팀 데이터 저장
    saveTeams: function() {
        localStorage.setItem(this.KEYS.TEAMS, JSON.stringify(this.teams));
    },

    // 모든 팀 이름 가져오기
    getTeams: function() {
        return this.teams.sort();
    },

    // 팀 추가
    addTeam: function(teamName) {
        console.log(`Attempting to add team: ${teamName}`);
        console.log('Current teams before add:', this.teams);
        if (!this.teams.includes(teamName)) {
            this.teams.push(teamName);
            this.saveTeams();
            console.log('Teams after successful add:', this.teams);
            return true;
        }
        console.log(`Team '${teamName}' already exists.`);
        return false;
    },

    // 팀 삭제
    removeTeam: function(teamName) {
        this.teams = this.teams.filter(team => team !== teamName);
        this.saveTeams();
        // 해당 팀에 속한 직원들의 팀 정보 제거
        for (const empName in this.employeeData) {
            if (this.employeeData[empName].team === teamName) {
                this.employeeData[empName].team = '';
            }
        }
        this.saveEmployeeData();
    },

    // 특정 팀의 직원 목록 가져오기
    getEmployeesByTeam: function(teamName) {
        const teamEmployees = [];
        for (const employeeName in this.employeeData) {
            if (this.employeeData[employeeName].team === teamName) {
                teamEmployees.push(employeeName);
            }
        }
        return teamEmployees.sort();
    },

    // 직원 추가
    addEmployee: function(name, team = '') {
        if (!this.employeeData[name]) {
            const assignedColors = Object.values(this.employeeData).map(data => data.color);
            const availableColors = this.colorPalette.filter(color => !assignedColors.includes(color));
            let newColor;
            if (availableColors.length > 0) {
                newColor = availableColors[0];
            } else {
                newColor = this.colorPalette[Object.keys(this.employeeData).length % this.colorPalette.length];
            }
            this.employeeData[name] = { color: newColor, hidden: false, team: team };
            this.saveEmployeeData();
            // 새로운 팀이면 teams 배열에 추가
            if (team && !this.teams.includes(team)) {
                this.addTeam(team);
            }
        }
    },

    // 직원 삭제
    removeEmployee: function(name) {
        if (this.employeeData[name]) {
            delete this.employeeData[name];
            this.saveEmployeeData();

            // 해당 직원의 모든 휴가 기록 삭제
            const vacations = this.getVacations();
            for (const date in vacations) {
                vacations[date] = vacations[date].filter(v => v.employee !== name);
                if (vacations[date].length === 0) {
                    delete vacations[date];
                }
            }
            this.saveVacations(vacations);
        }
    },

    // 직원 팀 변경
    updateEmployeeTeam: function(employeeName, newTeam) {
        if (this.employeeData[employeeName]) {
            this.employeeData[employeeName].team = newTeam;
            this.saveEmployeeData();
        }
    },

    // 휴가 데이터 가져오기
    getVacations: function() {
        const saved = localStorage.getItem(this.KEYS.VACATIONS);
        return saved ? JSON.parse(saved) : {};
    },

    // 휴가 데이터 저장
    saveVacations: function(vacations) {
        localStorage.setItem(this.KEYS.VACATIONS, JSON.stringify(vacations));
    },

    // 휴가 추가
    addVacation: function(date, employee, type) {
        const vacations = this.getVacations();
        
        // 날짜별로 배열로 저장
        if (!vacations[date]) {
            vacations[date] = [];
        }
        
        // 중복 체크
        const exists = vacations[date].some(v => v.employee === employee);
        if (exists) {
            // 기존 휴가 업데이트
            vacations[date] = vacations[date].map(v => 
                v.employee === employee ? { employee, type } : v
            );
        } else {
            // 새 휴가 추가
            vacations[date].push({ employee, type });
        }
        
        this.saveVacations(vacations);
    },

    // 휴가 삭제
    removeVacation: function(date, employee) {
        const vacations = this.getVacations();
        
        if (vacations[date]) {
            vacations[date] = vacations[date].filter(v => v.employee !== employee);
            
            // 빈 배열이면 날짜 키도 삭제
            if (vacations[date].length === 0) {
                delete vacations[date];
            }
            
            this.saveVacations(vacations);
        }
    },

    // 특정 날짜의 휴가 목록 가져오기
    getVacationsByDate: function(date) {
        const vacations = this.getVacations();
        return vacations[date] || [];
    },

    // 특정 직원의 휴가 목록 가져오기
    getVacationsByEmployee: function(employee) {
        const vacations = this.getVacations();
        const employeeVacations = [];
        
        for (const [date, dayVacations] of Object.entries(vacations)) {
            const vacation = dayVacations.find(v => v.employee === employee);
            if (vacation) {
                employeeVacations.push({
                    date,
                    type: vacation.type
                });
            }
        }
        
        // 날짜순 정렬
        employeeVacations.sort((a, b) => new Date(a.date) - new Date(b.date));
        
        return employeeVacations;
    },

    // 렌더링을 위해 휴가 그룹화 (연속/단일)
    groupVacationsForRendering: function(filteredEmployeeNames = null) {
        const vacations = this.getVacations();
        const allEmployees = this.getEmployees();
        
        console.log('groupVacationsForRendering 시작');
        console.log('전체 휴가 데이터:', vacations);
        console.log('전체 직원:', allEmployees);
        console.log('필터된 직원명:', filteredEmployeeNames);
        
        let employeesToProcess;
        if (filteredEmployeeNames && filteredEmployeeNames.length > 0) {
            employeesToProcess = allEmployees.filter(emp => filteredEmployeeNames.includes(emp.name));
        } else {
            employeesToProcess = allEmployees;
        }
        
        console.log('처리할 직원들:', employeesToProcess);

        const allVacationSegments = [];

        employeesToProcess.forEach(employee => {
            const employeeName = employee.name;
            const employeeVacations = this.getVacationsByEmployee(employeeName);
            console.log(`${employeeName}의 휴가:`, employeeVacations);
            
            if (employeeVacations.length === 0) return;

            let currentChain = [];

            function endCurrentChain() {
                if (currentChain.length > 0) {
                    allVacationSegments.push({
                        employee: employeeName,
                        type: currentChain[0].type,
                        segments: [...currentChain]
                    });
                    currentChain = [];
                }
            }

            for (const vacation of employeeVacations) {
                const currentDate = parseDateString(vacation.date);
                let isConnected = false;

                if (currentChain.length > 0) {
                    const lastSegment = currentChain[currentChain.length - 1];
                    const lastDate = parseDateString(lastSegment.date);
                    const nextDay = new Date(lastDate);
                    nextDay.setDate(nextDay.getDate() + 1);

                    // Check for direct date connection
                    const isDateContinuous = (currentDate.getTime() === nextDay.getTime());

                    // Check for type compatibility for chaining
                    const lastType = lastSegment.type;
                    const currentType = vacation.type;
                    const canChain = (lastType === '오후' && (currentType === '연차' || currentType === '특별' || currentType === '오전')) ||
                                     ((lastType === '연차' || lastType === '특별') && (currentType === '연차' || currentType === '특별' || currentType === '오전'));

                    if (isDateContinuous && canChain) {
                        isConnected = true;
                    }
                }

                if (isConnected) {
                    currentChain.push(vacation);
                } else {
                    endCurrentChain();
                    currentChain.push(vacation);
                }
            }
            endCurrentChain(); // End the last chain for the employee
        });

        console.log('최종 휴가 세그먼트:', allVacationSegments);
        return allVacationSegments;
    },

    // 특정 날짜와 직원의 휴가 정보 가져오기
    getVacationInfo: function(date, employee) {
        const vacationsOnDate = this.getVacationsByDate(date);
        return vacationsOnDate.find(v => v.employee === employee);
    },

    // 특정 직원의 연속 휴가 날짜 배열 가져오기
    getConsecutiveVacationDates: function(employee, date) {
        const allVacations = this.getVacationsByEmployee(employee);
        const startIndex = allVacations.findIndex(v => v.date === date);
        if (startIndex === -1) return [];

        const consecutiveDates = [date];
        let currentDate = parseDateString(date);

        for (let i = startIndex + 1; i < allVacations.length; i++) {
            currentDate.setDate(currentDate.getDate() + 1);
            // 주말 건너뛰기
            while (holidays.isWeekend(formatDateToYYYYMMDD(currentDate))) {
                currentDate.setDate(currentDate.getDate() + 1);
            }

            const nextDateStr = formatDateToYYYYMMDD(currentDate);
            if (allVacations[i].date === nextDateStr) {
                consecutiveDates.push(nextDateStr);
            } else {
                break;
            }
        }
        return consecutiveDates;
    },

    // 데이터 내보내기
    exportData: function() {
        const data = {
            employees: this.getEmployees(),
            vacations: this.getVacations(),
            exportDate: formatDateToYYYYMMDD(new Date())
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], 
            { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `휴가관리_${formatDateToYYYYMMDD(new Date()).replace(/\-/g, '')}.json`;
        a.click();
        URL.revokeObjectURL(url);
    },

    // 데이터 가져오기
    importData: function(jsonData) {
        try {
            const data = JSON.parse(jsonData);
            
            if (data.employees) {
                this.saveEmployees(data.employees);
            }
            
            if (data.vacations) {
                this.saveVacations(data.vacations);
            }
            
            return true;
        } catch (error) {
            console.error('데이터 가져오기 실패:', error);
            return false;
        }
    },

    // 전체 데이터 초기화
    clearAll: function() {
        if (confirm('모든 데이터를 삭제하시겠습니까?')) {
            localStorage.removeItem(this.KEYS.EMPLOYEES_DATA);
            localStorage.removeItem(this.KEYS.VACATIONS);
            localStorage.removeItem(this.KEYS.DEPARTMENTS);
            location.reload();
        }
    },

    // === 부서 관리 함수들 ===
    
    // 기본 부서 구조 정의
    defaultDepartments: [
        {
            id: 'planning',
            name: '기획부',
            manager: null,
            teams: []
        },
        {
            id: 'admin', 
            name: '총무부',
            manager: null,
            teams: [
                { 
                    id: 'guidance', 
                    name: '보상지도팀', 
                    leader: '강능훈', 
                    members: ['강능훈', '박민', '배영제', '임국단'] 
                }
            ]
        },
        {
            id: 'support',
            name: '보상지원부', 
            manager: null,
            teams: [
                { 
                    id: 'customer', 
                    name: '고객만족팀', 
                    leader: '이용진', 
                    members: ['이용진', '정예원', '정욱군'] 
                },
                { 
                    id: 'compensation', 
                    name: '보상관리팀', 
                    leader: '강태호', 
                    members: ['강태호', '백순열', '장순아'] 
                }
            ]
        },
        {
            id: 'audit',
            name: '감사실',
            manager: null,
            teams: []
        }
    ],

    // 부서 데이터 로드
    loadDepartments: function() {
        const saved = localStorage.getItem(this.KEYS.DEPARTMENTS);
        if (saved) {
            this.departments = JSON.parse(saved);
        } else {
            this.departments = JSON.parse(JSON.stringify(this.defaultDepartments));
            this.saveDepartments();
        }
    },

    // 부서 데이터 저장
    saveDepartments: function() {
        localStorage.setItem(this.KEYS.DEPARTMENTS, JSON.stringify(this.departments));
    },

    // 모든 부서 정보 가져오기
    getDepartments: function() {
        return this.departments;
    },

    // 특정 부서 찾기
    findDepartment: function(departmentId) {
        return this.departments.find(dept => dept.id === departmentId);
    },

    // 특정 팀 찾기 (부서ID와 팀ID로)
    findTeam: function(departmentId, teamId) {
        const dept = this.findDepartment(departmentId);
        return dept ? dept.teams.find(team => team.id === teamId) : null;
    },

    // 직원의 부서/팀 정보 가져오기
    getEmployeeDepartmentInfo: function(employeeName) {
        const empData = this.employeeData[employeeName];
        if (!empData) return null;

        return {
            department: empData.department || null,
            team: empData.team || null,
            role: empData.role || 'member' // 'manager', 'leader', 'member'
        };
    },

    // 기존 팀 구조를 새로운 부서 구조로 마이그레이션
    migrateToNewStructure: function() {
        // 이미 부서 정보가 있는 직원이 있다면 마이그레이션 이미 완료됨
        const hasNewStructure = Object.values(this.employeeData).some(emp => emp.department);
        if (hasNewStructure) return;

        console.log('기존 팀 구조를 부서 구조로 마이그레이션 시작...');

        // 기존 팀을 부서로 매핑
        const teamToDepartmentMapping = {
            '고객만족팀': { dept: 'support', team: 'customer' },
            '보상관리팀': { dept: 'support', team: 'compensation' },
            '보상지도팀': { dept: 'admin', team: 'guidance' }
        };

        // 각 직원을 새 구조로 변환
        for (const empName in this.employeeData) {
            const empData = this.employeeData[empName];
            const oldTeam = empData.team;

            if (oldTeam && teamToDepartmentMapping[oldTeam]) {
                const mapping = teamToDepartmentMapping[oldTeam];
                empData.department = mapping.dept;
                empData.team = mapping.team;
                empData.role = 'member'; // 기본값은 팀원
                
                // 부서 구조에 직원 추가
                const team = this.findTeam(mapping.dept, mapping.team);
                if (team && !team.members.includes(empName)) {
                    team.members.push(empName);
                }
            } else {
                // 매핑되지 않은 팀은 미지정으로 처리
                empData.department = null;
                empData.team = null;
                empData.role = 'member';
            }
        }

        this.saveEmployeeData();
        this.saveDepartments();
        console.log('마이그레이션 완료!');
    },

    // 부서별로 직원 그룹화하여 가져오기 (새 구조용)
    getEmployeesGroupedByDepartment: function() {
        const grouped = {};
        
        // 부서별 초기화
        this.departments.forEach(dept => {
            grouped[dept.name] = {
                manager: dept.manager,
                teams: {}
            };
            
            // 팀별 초기화
            dept.teams.forEach(team => {
                grouped[dept.name].teams[team.name] = {
                    leader: team.leader,
                    members: []
                };
            });
        });

        // 미지정 그룹 추가
        grouped['미지정'] = { manager: null, teams: { '미지정': { leader: null, members: [] } } };

        // 직원 배치
        for (const empName in this.employeeData) {
            const empData = this.employeeData[empName];
            const dept = empData.department ? this.findDepartment(empData.department) : null;
            const team = (dept && empData.team) ? this.findTeam(empData.department, empData.team) : null;

            if (dept && team) {
                // 부서와 팀이 모두 있는 경우
                const deptName = dept.name;
                const teamName = team.name;
                
                if (empData.role === 'manager') {
                    grouped[deptName].manager = empName;
                } else if (empData.role === 'leader') {
                    grouped[deptName].teams[teamName].leader = empName;
                } else {
                    grouped[deptName].teams[teamName].members.push(empName);
                }
            } else {
                // 미지정
                grouped['미지정'].teams['미지정'].members.push(empName);
            }
        }

        // 정렬
        for (const deptName in grouped) {
            for (const teamName in grouped[deptName].teams) {
                grouped[deptName].teams[teamName].members.sort();
            }
        }

        return grouped;
    },

    // 직원 위치 및 직책 업데이트
    updateEmployeePosition: function(employeeName, departmentId, teamId, role) {
        if (!this.employeeData[employeeName]) return false;

        const oldData = { ...this.employeeData[employeeName] };
        
        // 직원 데이터 업데이트
        this.employeeData[employeeName].department = departmentId;
        this.employeeData[employeeName].team = teamId;
        this.employeeData[employeeName].role = role;

        // 이전 부서/팀에서 제거
        if (oldData.department && oldData.team) {
            const oldTeam = this.findTeam(oldData.department, oldData.team);
            if (oldTeam) {
                // 리더에서 제거
                if (oldTeam.leader === employeeName) {
                    oldTeam.leader = null;
                }
                // 멤버에서 제거
                oldTeam.members = oldTeam.members.filter(name => name !== employeeName);
            }
        }

        // 이전 부서에서 매니저 제거
        if (oldData.role === 'manager' && oldData.department) {
            const oldDept = this.findDepartment(oldData.department);
            if (oldDept && oldDept.manager === employeeName) {
                oldDept.manager = null;
            }
        }

        // 새 부서/팀에 추가
        if (departmentId && teamId && role !== 'manager') {
            const newTeam = this.findTeam(departmentId, teamId);
            if (newTeam) {
                if (role === 'leader') {
                    // 기존 팀장이 있다면 일반 멤버로 변경
                    if (newTeam.leader && newTeam.leader !== employeeName) {
                        this.employeeData[newTeam.leader].role = 'member';
                    }
                    newTeam.leader = employeeName;
                }
                
                // 멤버에 추가 (중복 방지)
                if (!newTeam.members.includes(employeeName)) {
                    newTeam.members.push(employeeName);
                }
            }
        }

        // 새 부서 매니저 설정
        if (role === 'manager' && departmentId) {
            const newDept = this.findDepartment(departmentId);
            if (newDept) {
                // 기존 부장이 있다면 일반 멤버로 변경
                if (newDept.manager && newDept.manager !== employeeName) {
                    this.employeeData[newDept.manager].role = 'member';
                }
                newDept.manager = employeeName;
            }
        }

        this.saveEmployeeData();
        this.saveDepartments();
        return true;
    },

    // 새 직원 추가 (부서 구조용)
    addEmployeeNew: function(name, departmentId = null, teamId = null, role = 'member') {
        if (this.employeeData[name]) return false;

        // 색상 할당
        const assignedColors = Object.values(this.employeeData).map(data => data.color);
        const availableColors = this.colorPalette.filter(color => !assignedColors.includes(color));
        let newColor;
        if (availableColors.length > 0) {
            newColor = availableColors[0];
        } else {
            newColor = this.colorPalette[Object.keys(this.employeeData).length % this.colorPalette.length];
        }

        // 직원 데이터 생성
        this.employeeData[name] = {
            color: newColor,
            hidden: false,
            department: departmentId,
            team: teamId,
            role: role
        };

        // 부서/팀 구조에 추가
        if (departmentId && teamId && role !== 'manager') {
            const team = this.findTeam(departmentId, teamId);
            if (team) {
                if (role === 'leader') {
                    // 기존 팀장이 있다면 일반 멤버로 변경
                    if (team.leader) {
                        this.employeeData[team.leader].role = 'member';
                    }
                    team.leader = name;
                }
                
                if (!team.members.includes(name)) {
                    team.members.push(name);
                }
            }
        }

        // 부장으로 추가하는 경우
        if (role === 'manager' && departmentId) {
            const dept = this.findDepartment(departmentId);
            if (dept) {
                // 기존 부장이 있다면 일반 멤버로 변경
                if (dept.manager) {
                    this.employeeData[dept.manager].role = 'member';
                }
                dept.manager = name;
            }
        }

        this.saveEmployeeData();
        this.saveDepartments();
        return true;
    },

    // 부서 추가
    addDepartment: function(departmentName) {
        const newId = departmentName.toLowerCase().replace(/\s+/g, '_');
        const exists = this.departments.find(dept => dept.name === departmentName || dept.id === newId);
        if (exists) return false;

        this.departments.push({
            id: newId,
            name: departmentName,
            manager: null,
            teams: []
        });
        this.saveDepartments();
        return true;
    },

    // 부서 삭제
    removeDepartment: function(departmentId) {
        const deptIndex = this.departments.findIndex(dept => dept.id === departmentId);
        if (deptIndex === -1) return false;

        // 해당 부서에 속한 직원들을 미지정으로 변경
        for (const empName in this.employeeData) {
            if (this.employeeData[empName].department === departmentId) {
                this.employeeData[empName].department = null;
                this.employeeData[empName].team = null;
                this.employeeData[empName].role = 'member';
            }
        }

        this.departments.splice(deptIndex, 1);
        this.saveEmployeeData();
        this.saveDepartments();
        return true;
    },

    // 팀 추가 (새 버전 - 부서 지정)
    addTeamToDepartment: function(departmentId, teamName) {
        const dept = this.findDepartment(departmentId);
        if (!dept) return false;

        const newTeamId = teamName.toLowerCase().replace(/\s+/g, '_');
        const exists = dept.teams.find(team => team.name === teamName || team.id === newTeamId);
        if (exists) return false;

        dept.teams.push({
            id: newTeamId,
            name: teamName,
            leader: null,
            members: []
        });
        this.saveDepartments();
        return true;
    },

    // 팀 삭제 (새 버전)
    removeTeamFromDepartment: function(departmentId, teamId) {
        const dept = this.findDepartment(departmentId);
        if (!dept) return false;

        const teamIndex = dept.teams.findIndex(team => team.id === teamId);
        if (teamIndex === -1) return false;

        // 해당 팀에 속한 직원들을 미지정으로 변경
        for (const empName in this.employeeData) {
            const empData = this.employeeData[empName];
            if (empData.department === departmentId && empData.team === teamId) {
                empData.department = null;
                empData.team = null;
                empData.role = 'member';
            }
        }

        dept.teams.splice(teamIndex, 1);
        this.saveEmployeeData();
        this.saveDepartments();
        return true;
    }
};

