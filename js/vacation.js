const vacationManager = {
    init: function() {
        console.log('vacationManager 초기화 시작');
        this.setupModals();
        this.setupForms();
        this.loadEmployees();
        this.loadFilterCheckboxes();
        // setupImportExport 함수가 없어서 일단 주석 처리
        // this.setupImportExport();
        console.log('vacationManager 초기화 완료');
    },

    setupModals: function() {
        // 모달 닫기 이벤트
        document.querySelectorAll('.modal .close, .modal .btn-secondary').forEach(el => {
            el.addEventListener('click', () => el.closest('.modal').style.display = 'none');
        });

        window.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) e.target.style.display = 'none';
        });

        // 버튼 이벤트
        const batchInputBtn = document.getElementById('batchInputBtn');
        if (batchInputBtn) {
            batchInputBtn.addEventListener('click', () => {
                document.getElementById('batchInputModal').style.display = 'block';
            });
        }

        const employeeManageBtn = document.getElementById('employeeManageBtn');
        if (employeeManageBtn) {
            employeeManageBtn.addEventListener('click', () => this.showEmployeeManageModal());
        }

        const resetFilterBtn = document.getElementById('resetFilterBtn');
        if (resetFilterBtn) {
            resetFilterBtn.addEventListener('click', () => {
                // 모든 체크박스 해제
                document.querySelectorAll('#teamFilterCheckboxes input[type="checkbox"]').forEach(cb => cb.checked = false);
                this.updateCalendarFilter();
            });
        }

        // 전체 선택/해제 버튼 이벤트
        const selectAllFilterBtn = document.getElementById('selectAllFilterEmployees');
        if (selectAllFilterBtn) {
            selectAllFilterBtn.addEventListener('change', (e) => {
                const isChecked = e.target.checked;
                // 모든 직원 체크박스 선택/해제
                document.querySelectorAll('#teamFilterCheckboxes .employee-checkbox').forEach(cb => {
                    cb.checked = isChecked;
                });
                // 모든 부서/팀 체크박스도 연동
                document.querySelectorAll('#teamFilterCheckboxes .dept-all-checkbox, #teamFilterCheckboxes .team-all-checkbox').forEach(cb => {
                    cb.checked = isChecked;
                });
                this.updateCalendarFilter();
            });
        }

        // 범위 등록 버튼 이벤트 추가
        const batchRegisterBtn = document.getElementById('batchRegisterBtn');
        if (batchRegisterBtn) {
            batchRegisterBtn.addEventListener('click', () => {
                document.getElementById('batchRegisterModal').style.display = 'block';
            });
        }
    },

    setupForms: function() {
        console.log('폼 설정 시작');
        
        // 부서 추가 폼
        const departmentAddForm = document.getElementById('departmentAddForm');
        if (departmentAddForm) {
            departmentAddForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const deptName = document.getElementById('newDepartmentName').value.trim();
                if (deptName) {
                    this.addDepartment(deptName);
                    document.getElementById('newDepartmentName').value = '';
                }
            });
        }

        // 팀 추가 폼  
        const teamAddForm = document.getElementById('teamAddForm');
        if (teamAddForm) {
            teamAddForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const teamName = document.getElementById('newTeamName').value.trim();
                const deptId = document.getElementById('newTeamDepartment').value;
                if (teamName && deptId) {
                    this.addTeam(deptId, teamName);
                    document.getElementById('newTeamName').value = '';
                }
            });
        }

        // 직원 추가 폼
        const employeeAddForm = document.getElementById('employeeAddForm');
        if (employeeAddForm) {
            employeeAddForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const empName = document.getElementById('newEmployeeName').value.trim();
                const deptId = document.getElementById('newEmployeeDepartment').value;
                const teamId = document.getElementById('newEmployeeTeam').value;
                const role = document.getElementById('newEmployeeRole').value;
                
                if (empName && deptId && teamId) {
                    this.addEmployee(empName, deptId, teamId, role);
                    document.getElementById('newEmployeeName').value = '';
                }
            });
        }

        // 부서 선택 변경 시 팀 목록 업데이트
        const newEmpDeptSelect = document.getElementById('newEmployeeDepartment');
        if (newEmpDeptSelect) {
            newEmpDeptSelect.addEventListener('change', (e) => {
                this.updateTeamSelectForEmployee(e.target.value);
            });
        }

        // 휴가 추가 폼
        const vacationForm = document.getElementById('vacationForm');
        if (vacationForm) {
            vacationForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.addVacation();
            });
        }

        // 일괄 입력 폼
        const batchForm = document.getElementById('batchInputForm');
        if (batchForm) {
            batchForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.processBatchInput();
            });
        }
    },

    addVacation: function() {
        const employeeName = document.getElementById('employeeName').value;
        const selectedDate = document.getElementById('selectedDate').value;
        const vacationType = document.getElementById('vacationType').value;

        if (!employeeName || !selectedDate || !vacationType) {
            alert('필수 항목을 모두 입력해주세요.');
            return;
        }

        storage.addVacation(selectedDate, employeeName, vacationType);
        this.clearForm();
        document.getElementById('vacationModal').style.display = 'none';
        
        // 달력 새로고침
        if (typeof calendar !== 'undefined' && calendar.refresh) {
            calendar.refresh();
        }
        
        console.log('휴가 추가 완료:', { date: selectedDate, employee: employeeName, type: vacationType });
    },

    clearForm: function() {
        document.getElementById('vacationForm').reset();
    },

    processBatchInput: function() {
        const textInput = document.getElementById('batchTextInput').value;
        const selectedEmployees = Array.from(document.querySelectorAll('#employeeCheckboxes input:checked'))
            .map(cb => cb.value);

        console.log('일괄 입력 처리:', { textInput, selectedEmployees });

        try {
            const results = textParser.parseVacationText(textInput, selectedEmployees);
            
            results.forEach(vacation => {
                storage.addVacation({
                    id: Date.now() + Math.random(),
                    ...vacation,
                    dateCreated: new Date().toISOString()
                });
            });

            document.getElementById('batchTextInput').value = '';
            document.querySelector('#employeeCheckboxes').querySelectorAll('input').forEach(cb => cb.checked = false);
            document.getElementById('batchInputModal').style.display = 'none';
            
            if (typeof renderCalendar === 'function') {
                renderCalendar();
            }
            
            alert(`${results.length}개의 휴가가 추가되었습니다.`);
        } catch (error) {
            console.error('일괄 입력 처리 오류:', error);
            alert('입력 형식을 확인해주세요.');
        }
    },

    showEmployeeManageModal: function() {
        console.log('부서 관리 모달 열기');
        
        // 현재 데이터 상태 확인
        const employees = storage.getEmployees();
        const departments = storage.getDepartments();
        
        console.log('현재 직원 수:', employees.length);
        console.log('현재 부서 수:', departments.length);
        console.log('직원 목록:', employees);
        console.log('부서 목록:', departments);
        
        document.getElementById('employeeManageModal').style.display = 'block';
        
        // 약간의 지연 후 렌더링 (DOM 준비 대기)
        setTimeout(() => {
            this.renderDepartmentList();
            this.loadDepartmentSelects();
        }, 100);
    },

    addDepartment: function(deptName) {
        const deptId = deptName.toLowerCase().replace(/\s+/g, '');
        const departments = storage.getDepartments();
        
        if (departments.some(d => d.id === deptId)) {
            alert('이미 존재하는 부서입니다.');
            return;
        }

        const newDept = { id: deptId, name: deptName, teams: [] };
        departments.push(newDept);
        storage.saveDepartments(departments);
        
        this.renderDepartmentList();
        this.loadDepartmentSelects();
        console.log('부서 추가:', newDept);
    },

    addTeam: function(deptId, teamName) {
        const departments = storage.getDepartments();
        const dept = departments.find(d => d.id === deptId);
        
        if (!dept) {
            alert('부서를 찾을 수 없습니다.');
            return;
        }

        const teamId = teamName.toLowerCase().replace(/\s+/g, '');
        if (dept.teams.some(t => t.id === teamId)) {
            alert('이미 존재하는 팀입니다.');
            return;
        }

        dept.teams.push({ id: teamId, name: teamName });
        storage.saveDepartments(departments);
        
        this.renderDepartmentList();
        this.loadDepartmentSelects();
        console.log('팀 추가:', { deptId, teamName });
    },

    addEmployee: function(empName, deptId, teamId, role) {
        const employees = storage.getEmployees();
        
        if (employees.some(e => e.name === empName)) {
            alert('이미 존재하는 직원입니다.');
            return;
        }

        const newEmployee = {
            id: Date.now(),
            name: empName,
            department: deptId,
            team: teamId,
            role: role || 'member'
        };

        employees.push(newEmployee);
        storage.saveEmployees(employees);
        
        this.renderDepartmentList();
        this.loadEmployees();
        console.log('직원 추가:', newEmployee);
    },
    renderDepartmentList: function() {
        console.log('renderDepartmentList 함수 시작');
        const container = document.getElementById('combinedEmployeeList');
        if (!container) {
            console.error('combinedEmployeeList 컨테이너를 찾을 수 없습니다!');
            return;
        }

        try {
            const departments = storage.getDepartments();
            const employees = storage.getEmployees();

            console.log('렌더링용 부서 목록:', departments);
            console.log('렌더링용 직원 목록:', employees);

            if (!departments || departments.length === 0) {
                container.innerHTML = '<p class="text-warning">부서 데이터가 없습니다. 새로고침해주세요.</p>';
                return;
            }

            if (!employees || employees.length === 0) {
                container.innerHTML = '<p class="text-warning">직원 데이터가 없습니다. 새로고침해주세요.</p>';
                return;
            }

            let html = '<h4>부서별 직원 현황</h4>';

            departments.forEach(dept => {
                const deptEmployees = employees.filter(emp => emp.department === dept.id);
                console.log(`${dept.name} 부서 직원:`, deptEmployees);
                
                html += `
                    <div class="department-item" style="border: 1px solid #ddd; margin: 10px 0; padding: 15px;">
                        <div class="department-info" style="background: #f8f9fa; padding: 10px; margin-bottom: 10px;">
                            <strong>🏢 ${dept.name}</strong> 
                            <span class="dept-count" style="color: #007bff;">(${deptEmployees.length}명)</span>
                            <button class="btn btn-danger btn-sm" style="float: right;" onclick="vacationManager.deleteDepartment('${dept.id}')">부서 삭제</button>
                        </div>
                `;

                if (deptEmployees.length > 0) {
                    deptEmployees.forEach(emp => {
                        const roleIcon = emp.role === 'manager' ? '👑' : emp.role === 'leader' ? '🥈' : '👤';
                        const roleText = emp.role === 'manager' ? '부장' : emp.role === 'leader' ? '팀장' : '';
                        const displayText = roleText ? `${roleIcon} ${emp.name} (${roleText})` : `${roleIcon} ${emp.name}`;
                        
                        // 팀 정보 가져오기
                        const team = dept.teams ? dept.teams.find(t => t.id === emp.team) : null;
                        const teamName = team ? team.name : '미지정';
                        
                        html += `
                            <div class="employee-item" style="padding: 8px; margin: 5px 0; background: #fff; border-left: 3px solid #007bff;">
                                <span style="display: inline-block; min-width: 200px;">${displayText} - ${teamName}</span>
                                <select class="role-select" style="margin: 0 5px;" onchange="vacationManager.updateEmployeeRole('${emp.name}', this.value)">
                                    <option value="member" ${emp.role === 'member' ? 'selected' : ''}>👤 팀원</option>
                                    <option value="leader" ${emp.role === 'leader' ? 'selected' : ''}>🥈 팀장</option>
                                    <option value="manager" ${emp.role === 'manager' ? 'selected' : ''}>👑 부장</option>
                                </select>
                                <select class="team-select" style="margin: 0 5px;" onchange="vacationManager.updateEmployeeTeam('${emp.name}', this.value)">
                                    <option value="">팀 선택</option>
                                    ${dept.teams ? dept.teams.map(t => `<option value="${t.id}" ${emp.team === t.id ? 'selected' : ''}>${t.name}</option>`).join('') : ''}
                                </select>
                                <button class="btn btn-danger btn-sm" onclick="vacationManager.deleteEmployee('${emp.name}')">삭제</button>
                            </div>
                        `;
                    });
                } else {
                    html += `<p class="text-muted" style="padding: 10px;">소속 직원이 없습니다.</p>`;
                }

                html += `</div>`;
            });

            // 미지정 직원들도 표시
            const unassignedEmployees = employees.filter(emp => !emp.department || emp.department === 'unknown' || !departments.find(d => d.id === emp.department));
            
            if (unassignedEmployees.length > 0) {
                html += `
                    <div class="department-item" style="border: 1px solid #ffc107; margin: 10px 0; padding: 15px;">
                        <div class="department-info" style="background: #fff3cd; padding: 10px; margin-bottom: 10px;">
                            <strong>🔍 미지정</strong> 
                            <span class="dept-count" style="color: #856404;">(${unassignedEmployees.length}명)</span>
                        </div>
                `;

                unassignedEmployees.forEach(emp => {
                    const roleIcon = emp.role === 'manager' ? '👑' : emp.role === 'leader' ? '🥈' : '👤';
                    const roleText = emp.role === 'manager' ? '부장' : emp.role === 'leader' ? '팀장' : '';
                    const displayText = roleText ? `${roleIcon} ${emp.name} (${roleText})` : `${roleIcon} ${emp.name}`;
                    
                    html += `
                        <div class="employee-item" style="padding: 8px; margin: 5px 0; background: #fff; border-left: 3px solid #ffc107;">
                            <span style="display: inline-block; min-width: 200px;">${displayText}</span>
                            <select class="dept-select" style="margin: 0 5px;" onchange="vacationManager.updateEmployeeDepartment('${emp.name}', this.value)">
                                <option value="">부서 선택</option>
                                ${departments.map(d => `<option value="${d.id}">${d.name}</option>`).join('')}
                            </select>
                            <select class="role-select" style="margin: 0 5px;" onchange="vacationManager.updateEmployeeRole('${emp.name}', this.value)">
                                <option value="member" ${emp.role === 'member' ? 'selected' : ''}>👤 팀원</option>
                                <option value="leader" ${emp.role === 'leader' ? 'selected' : ''}>🥈 팀장</option>
                                <option value="manager" ${emp.role === 'manager' ? 'selected' : ''}>👑 부장</option>
                            </select>
                            <button class="btn btn-danger btn-sm" onclick="vacationManager.deleteEmployee('${emp.name}')">삭제</button>
                        </div>
                    `;
                });

                html += `</div>`;
            }

            container.innerHTML = html;
            console.log('부서 목록 렌더링 완료');
            
        } catch (error) {
            console.error('부서 목록 렌더링 실패:', error);
            container.innerHTML = `<p class="text-danger">부서 목록을 불러오는데 실패했습니다: ${error.message}</p>`;
        }
    },
    loadDepartmentSelects: function() {
        const departments = storage.getDepartments();
        
        // 팀 추가용 부서 선택
        const teamDeptSelect = document.getElementById('newTeamDepartment');
        if (teamDeptSelect) {
            teamDeptSelect.innerHTML = `
                <option value="">부서 선택</option>
                ${departments.map(dept => `<option value="${dept.id}">${dept.name}</option>`).join('')}
            `;
        }

        // 직원 추가용 부서 선택
        const empDeptSelect = document.getElementById('newEmployeeDepartment');
        if (empDeptSelect) {
            empDeptSelect.innerHTML = `
                <option value="">부서 선택</option>
                ${departments.map(dept => `<option value="${dept.id}">${dept.name}</option>`).join('')}
            `;
        }
        
        console.log('부서 선택 목록 로드 완료');
    },

    updateTeamSelectForEmployee: function(departmentId) {
        const teamSelect = document.getElementById('newEmployeeTeam');
        if (!teamSelect) return;
        
        const departments = storage.getDepartments();
        const dept = departments.find(d => d.id === departmentId);
        
        teamSelect.innerHTML = '<option value="">팀 선택</option>';
        
        if (dept && dept.teams) {
            dept.teams.forEach(team => {
                teamSelect.innerHTML += `<option value="${team.id}">${team.name}</option>`;
            });
        }
        
        console.log(`부서 ${departmentId}의 팀 목록 업데이트 완료`);
    },

    loadEmployees: function() {
        console.log('직원 목록 로드 시작');
        
        try {
            const employees = storage.getEmployees();
            console.log('실제 직원 목록:', employees);
            
            const empSelect = document.getElementById('employeeName');
            if (empSelect) {
                empSelect.innerHTML = '<option value="">직원 선택</option>' +
                    employees.map(e => `<option value="${e.name}">${e.name}</option>`).join('');
            }

            const batchEmpContainer = document.getElementById('employeeCheckboxes');
            if (batchEmpContainer) {
                batchEmpContainer.innerHTML = employees.map(e =>
                    `<label><input type="checkbox" value="${e.name}"> ${e.name}</label>`
                ).join('');
            }
        } catch (error) {
            console.error('직원 목록 로드 실패:', error);
            // 실패시 기본 직원 목록 사용
            const defaultEmployees = ['이용진', '정예원', '정욱군', '강태호', '백순열', '장순아', '강능훈', '박민', '배영제', '임국단'];
            
            const empSelect = document.getElementById('employeeName');
            if (empSelect) {
                empSelect.innerHTML = '<option value="">직원 선택</option>' +
                    defaultEmployees.map(e => `<option value="${e}">${e}</option>`).join('');
            }

            const batchEmpContainer = document.getElementById('employeeCheckboxes');
            if (batchEmpContainer) {
                batchEmpContainer.innerHTML = defaultEmployees.map(e =>
                    `<label><input type="checkbox" value="${e}"> ${e}</label>`
                ).join('');
            }
        }
        
        console.log('직원 목록 로드 완료');
    },

    loadFilterCheckboxes: function() {
        console.log('필터 체크박스 로드 시작');
        
        try {
            const employees = storage.getEmployees();
            const departments = storage.getDepartments();
            
            console.log('로드된 직원들:', employees);
            console.log('로드된 부서들:', departments);
            
            // 부서별로 그룹화
            const departmentGroups = {};
            
            // 부서별로 초기화
            departments.forEach(dept => {
                departmentGroups[dept.id] = {
                    name: dept.name,
                    manager: null,
                    teams: {}
                };
                
                // 팀별로 초기화
                dept.teams.forEach(team => {
                    departmentGroups[dept.id].teams[team.id] = {
                        name: team.name,
                        leader: null,
                        members: []
                    };
                });
            });

            // 직원들을 부서/팀별로 배치
            employees.forEach(emp => {
                const deptData = departmentGroups[emp.department];
                if (deptData) {
                    if (emp.role === 'manager') {
                        deptData.manager = emp;
                    } else {
                        const teamData = deptData.teams[emp.team];
                        if (teamData) {
                            if (emp.role === 'leader') {
                                teamData.leader = emp;
                            } else {
                                teamData.members.push(emp);
                            }
                        }
                    }
                }
            });

            const container = document.getElementById('teamFilterCheckboxes');
            if (container) {
                let html = '';
                
                Object.keys(departmentGroups).forEach(deptId => {
                    const dept = departmentGroups[deptId];
                    const deptEmployees = employees.filter(emp => emp.department === deptId);
                    
                    html += `
                        <div class="department-filter-group">
                            <div class="department-header">
                                <span class="folder-icon" onclick="vacationManager.toggleDepartmentFilter('${deptId}')">📂</span>
                                <label onclick="event.stopPropagation();">
                                    <input type="checkbox" class="dept-all-checkbox" data-dept="${deptId}" checked onclick="event.stopPropagation(); vacationManager.onDeptCheckboxChange(this);">
                                    <strong>🏢 ${dept.name} (${deptEmployees.length}명)</strong>
                                </label>
                            </div>
                            <div class="department-content" id="dept-${deptId}" style="display: block; margin-left: 20px;">
                    `;
                    
                    // 부장 표시
                    if (dept.manager) {
                        html += `
                            <label class="employee-filter manager" onclick="event.stopPropagation();">
                                <input type="checkbox" name="employeeFilter" value="${dept.manager.name}" class="employee-checkbox" data-dept="${deptId}" checked onclick="event.stopPropagation(); vacationManager.onEmployeeCheckboxChange(this);">
                                👑 ${dept.manager.name} (부장)
                            </label>
                        `;
                    }
                    
                    // 팀별로 표시
                    Object.keys(dept.teams).forEach(teamId => {
                        const team = dept.teams[teamId];
                        const teamEmployees = employees.filter(emp => emp.department === deptId && emp.team === teamId);
                        
                        if (teamEmployees.length > 0) {
                            html += `
                                <div class="team-filter-group" style="margin-left: 10px;">
                                    <div class="team-header">
                                        <span class="folder-icon" onclick="vacationManager.toggleTeamFilter('${deptId}', '${teamId}')">📂</span>
                                        <label onclick="event.stopPropagation();">
                                            <input type="checkbox" class="team-all-checkbox" data-dept="${deptId}" data-team="${teamId}" checked onclick="event.stopPropagation(); vacationManager.onTeamCheckboxChange(this);">
                                            <strong>🛠️ ${team.name} (${teamEmployees.length}명)</strong>
                                        </label>
                                    </div>
                                    <div class="team-content" id="team-${deptId}-${teamId}" style="display: block; margin-left: 20px;">
                            `;
                            
                            // 팀장 먼저 표시
                            if (team.leader) {
                                html += `
                                    <label class="employee-filter leader" onclick="event.stopPropagation();">
                                        <input type="checkbox" name="employeeFilter" value="${team.leader.name}" class="employee-checkbox" data-dept="${deptId}" data-team="${teamId}" checked onclick="event.stopPropagation(); vacationManager.onEmployeeCheckboxChange(this);">
                                        🥈 ${team.leader.name} (팀장)
                                    </label>
                                `;
                            }
                            
                            // 팀원들 표시 (이름순 정렬)
                            team.members.sort((a, b) => a.name.localeCompare(b.name)).forEach(emp => {
                                html += `
                                    <label class="employee-filter member" onclick="event.stopPropagation();">
                                        <input type="checkbox" name="employeeFilter" value="${emp.name}" class="employee-checkbox" data-dept="${deptId}" data-team="${teamId}" checked onclick="event.stopPropagation(); vacationManager.onEmployeeCheckboxChange(this);">
                                        👤 ${emp.name}
                                    </label>
                                `;
                            });
                            
                            html += `
                                    </div>
                                </div>
                            `;
                        }
                    });
                    
                    html += `
                            </div>
                        </div>
                    `;
                });

                container.innerHTML = html;

                // 이벤트 리스너 추가
                container.querySelectorAll('.dept-all-checkbox').forEach(checkbox => {
                    checkbox.addEventListener('change', (e) => {
                        const deptId = e.target.dataset.dept;
                        const deptEmployees = container.querySelectorAll(`input[data-dept="${deptId}"].employee-checkbox`);
                        deptEmployees.forEach(empCb => empCb.checked = e.target.checked);
                        this.updateCalendarFilter();
                    });
                });

                container.querySelectorAll('.team-all-checkbox').forEach(checkbox => {
                    checkbox.addEventListener('change', (e) => {
                        const deptId = e.target.dataset.dept;
                        const teamId = e.target.dataset.team;
                        const teamEmployees = container.querySelectorAll(`input[data-dept="${deptId}"][data-team="${teamId}"].employee-checkbox`);
                        teamEmployees.forEach(empCb => empCb.checked = e.target.checked);
                        this.updateCalendarFilter();
                    });
                });

                container.querySelectorAll('.employee-checkbox').forEach(checkbox => {
                    checkbox.addEventListener('change', () => this.updateCalendarFilter());
                });
            }
        } catch (error) {
            console.error('필터 체크박스 로드 실패:', error);
        }
        
        console.log('필터 체크박스 로드 완료');
    },

    toggleDepartmentFilter: function(deptId) {
        const content = document.getElementById(`dept-${deptId}`);
        const icon = content.previousElementSibling.querySelector('.folder-icon');
        if (content.style.display === 'none') {
            content.style.display = 'block';
            icon.textContent = '📂';
        } else {
            content.style.display = 'none';
            icon.textContent = '📁';
        }
    },

    toggleTeamFilter: function(deptId, teamId) {
        const content = document.getElementById(`team-${deptId}-${teamId}`);
        const icon = content.previousElementSibling.querySelector('.folder-icon');
        if (content.style.display === 'none') {
            content.style.display = 'block';
            icon.textContent = '📂';
        } else {
            content.style.display = 'none';
            icon.textContent = '📁';
        }
    },
    showModal: function(dateStr) {
        document.getElementById('selectedDate').value = dateStr;
        document.getElementById('vacationModal').style.display = 'block';
        
        // 해당 날짜에 이미 휴가가 있는지 확인하여 기본값 설정
        const existingVacations = storage.getVacationsByDate(dateStr);
        if (existingVacations.length > 0) {
            const firstVacation = existingVacations[0];
            document.getElementById('employeeName').value = firstVacation.employee;
            document.getElementById('vacationType').value = firstVacation.type;
        }
    },

    showEditModal: function(vacationChain) {
        const dateStr = vacationChain.segments[0].date;
        const employeeName = vacationChain.employee;
        const vacationType = vacationChain.type;
        
        // 수정 모달 내용 생성
        const modalContent = document.getElementById('editVacationContent');
        modalContent.innerHTML = `
            <h4>${employeeName}의 휴가 (${dateStr})</h4>
            <div class="form-group">
                <label>휴가 유형</label>
                <select id="editVacationType">
                    <option value="연차" ${vacationType === '연차' ? 'selected' : ''}>연차휴가</option>
                    <option value="특별" ${vacationType === '특별' ? 'selected' : ''}>특별휴가</option>
                    <option value="오전" ${vacationType === '오전' ? 'selected' : ''}>오전반차</option>
                    <option value="오후" ${vacationType === '오후' ? 'selected' : ''}>오후반차</option>
                </select>
            </div>
            <div class="form-actions">
                <button class="btn btn-primary" onclick="vacationManager.updateVacation('${dateStr}', '${employeeName}')">수정</button>
                <button class="btn btn-danger" onclick="vacationManager.deleteVacation('${dateStr}', '${employeeName}')">삭제</button>
                <button class="btn btn-secondary" onclick="document.getElementById('editVacationModal').style.display='none'">취소</button>
            </div>
        `;
        
        document.getElementById('editVacationModal').style.display = 'block';
    },

    updateVacation: function(dateStr, employeeName) {
        const newType = document.getElementById('editVacationType').value;
        
        // 기존 휴가 삭제 후 새로운 휴가 추가
        storage.removeVacation(dateStr, employeeName);
        storage.addVacation(dateStr, employeeName, newType);
        
        document.getElementById('editVacationModal').style.display = 'none';
        calendar.refresh();
        
        console.log('휴가 수정 완료:', { date: dateStr, employee: employeeName, type: newType });
    },

    deleteVacation: function(dateStr, employeeName) {
        if (confirm(`${employeeName}의 ${dateStr} 휴가를 삭제하시겠습니까?`)) {
            storage.removeVacation(dateStr, employeeName);
            document.getElementById('editVacationModal').style.display = 'none';
            calendar.refresh();
            
            console.log('휴가 삭제 완료:', { date: dateStr, employee: employeeName });
        }
    },

    updateCalendarFilter: function() {
        const checkedEmployees = Array.from(document.querySelectorAll('input[name="employeeFilter"]:checked'))
            .map(cb => cb.value);
        
        calendar.filter = {
            type: 'employee',
            value: checkedEmployees
        };
        
        calendar.refresh();
        console.log('필터 업데이트:', checkedEmployees);
    },

    // 직원 역할 업데이트
    updateEmployeeRole: function(empName, newRole) {
        try {
            const employees = storage.getEmployees();
            const employee = employees.find(e => e.name === empName);
            
            if (employee) {
                employee.role = newRole;
                storage.saveEmployees(employees);
                this.renderDepartmentList();
                this.loadFilterCheckboxes(); // 필터도 업데이트
                console.log(`${empName}의 역할을 ${newRole}로 변경`);
            }
        } catch (error) {
            console.error('직원 역할 업데이트 실패:', error);
            alert('역할 변경에 실패했습니다.');
        }
    },

    // 직원 팀 업데이트
    updateEmployeeTeam: function(empName, newTeamId) {
        try {
            const employees = storage.getEmployees();
            const employee = employees.find(e => e.name === empName);
            
            if (employee) {
                employee.team = newTeamId;
                storage.saveEmployees(employees);
                this.renderDepartmentList();
                this.loadFilterCheckboxes(); // 필터도 업데이트
                console.log(`${empName}의 팀을 ${newTeamId}로 변경`);
            }
        } catch (error) {
            console.error('직원 팀 업데이트 실패:', error);
            alert('팀 변경에 실패했습니다.');
        }
    },

    // 직원 부서 업데이트
    updateEmployeeDepartment: function(empName, newDeptId) {
        try {
            const employees = storage.getEmployees();
            const employee = employees.find(e => e.name === empName);
            
            if (employee) {
                employee.department = newDeptId;
                employee.team = ''; // 부서 변경 시 팀은 초기화
                storage.saveEmployees(employees);
                this.renderDepartmentList();
                this.loadFilterCheckboxes(); // 필터도 업데이트
                console.log(`${empName}의 부서를 ${newDeptId}로 변경`);
            }
        } catch (error) {
            console.error('직원 부서 업데이트 실패:', error);
            alert('부서 변경에 실패했습니다.');
        }
    },

    // 직원 삭제
    deleteEmployee: function(empName) {
        if (confirm(`${empName} 직원을 삭제하시겠습니까?`)) {
            try {
                const employees = storage.getEmployees();
                const filteredEmployees = employees.filter(e => e.name !== empName);
                storage.saveEmployees(filteredEmployees);
                
                this.renderDepartmentList();
                this.loadEmployees();
                this.loadFilterCheckboxes();
                
                console.log(`${empName} 직원 삭제 완료`);
            } catch (error) {
                console.error('직원 삭제 실패:', error);
                alert('직원 삭제에 실패했습니다.');
            }
        }
    },

    // 부서 삭제
    deleteDepartment: function(deptId) {
        const departments = storage.getDepartments();
        const dept = departments.find(d => d.id === deptId);
        
        if (!dept) return;
        
        const employees = storage.getEmployees();
        const deptEmployees = employees.filter(emp => emp.department === deptId);
        
        if (deptEmployees.length > 0) {
            if (!confirm(`${dept.name}에 ${deptEmployees.length}명의 직원이 있습니다. 부서를 삭제하면 해당 직원들도 함께 삭제됩니다. 계속하시겠습니까?`)) {
                return;
            }
        }
        
        try {
            // 부서 삭제 - storage의 removeDepartment 함수 사용
            const success = storage.removeDepartment(deptId);
            
            if (success) {
                this.renderDepartmentList();
                this.loadDepartmentSelects();
                this.loadEmployees();
                this.loadFilterCheckboxes();
                
                console.log(`${dept.name} 부서 삭제 완료`);
            } else {
                alert('부서 삭제에 실패했습니다.');
            }
        } catch (error) {
            console.error('부서 삭제 실패:', error);
            alert('부서 삭제에 실패했습니다.');
        }
    },

    // 부서 체크박스 변경 이벤트
    onDeptCheckboxChange: function(checkbox) {
        const deptId = checkbox.dataset.dept;
        const isChecked = checkbox.checked;
        
        // 해당 부서의 모든 직원 체크박스 상태 변경
        const deptEmployees = document.querySelectorAll(`#teamFilterCheckboxes .employee-checkbox[data-dept="${deptId}"]`);
        const deptTeams = document.querySelectorAll(`#teamFilterCheckboxes .team-all-checkbox[data-dept="${deptId}"]`);
        
        deptEmployees.forEach(cb => cb.checked = isChecked);
        deptTeams.forEach(cb => cb.checked = isChecked);
        
        this.updateCalendarFilter();
    },

    // 팀 체크박스 변경 이벤트
    onTeamCheckboxChange: function(checkbox) {
        const deptId = checkbox.dataset.dept;
        const teamId = checkbox.dataset.team;
        const isChecked = checkbox.checked;
        
        // 해당 팀의 모든 직원 체크박스 상태 변경
        const teamEmployees = document.querySelectorAll(`#teamFilterCheckboxes .employee-checkbox[data-dept="${deptId}"][data-team="${teamId}"]`);
        teamEmployees.forEach(cb => cb.checked = isChecked);
        
        // 부서 체크박스 상태 업데이트
        this.updateDeptCheckboxState(deptId);
        this.updateCalendarFilter();
    },

    // 직원 체크박스 변경 이벤트
    onEmployeeCheckboxChange: function(checkbox) {
        const deptId = checkbox.dataset.dept;
        const teamId = checkbox.dataset.team;
        
        // 팀 체크박스 상태 업데이트
        if (teamId) {
            this.updateTeamCheckboxState(deptId, teamId);
        }
        
        // 부서 체크박스 상태 업데이트
        this.updateDeptCheckboxState(deptId);
        this.updateCalendarFilter();
    },

    // 팀 체크박스 상태 업데이트
    updateTeamCheckboxState: function(deptId, teamId) {
        const teamEmployees = document.querySelectorAll(`#teamFilterCheckboxes .employee-checkbox[data-dept="${deptId}"][data-team="${teamId}"]`);
        const teamCheckbox = document.querySelector(`#teamFilterCheckboxes .team-all-checkbox[data-dept="${deptId}"][data-team="${teamId}"]`);
        
        if (teamCheckbox) {
            const checkedCount = Array.from(teamEmployees).filter(cb => cb.checked).length;
            teamCheckbox.checked = checkedCount === teamEmployees.length && teamEmployees.length > 0;
        }
    },

    // 부서 체크박스 상태 업데이트
    updateDeptCheckboxState: function(deptId) {
        const deptEmployees = document.querySelectorAll(`#teamFilterCheckboxes .employee-checkbox[data-dept="${deptId}"]`);
        const deptCheckbox = document.querySelector(`#teamFilterCheckboxes .dept-all-checkbox[data-dept="${deptId}"]`);
        
        if (deptCheckbox) {
            const checkedCount = Array.from(deptEmployees).filter(cb => cb.checked).length;
            deptCheckbox.checked = checkedCount === deptEmployees.length && deptEmployees.length > 0;
        }
    },

    // 부서 폴더 트리뷰 토글 (체크박스와 분리)
    toggleDepartmentFilter: function(deptId) {
        const deptContent = document.getElementById(`dept-${deptId}`);
        const folderIcon = document.querySelector(`.department-header [onclick*="${deptId}"] .folder-icon`);
        
        if (deptContent) {
            if (deptContent.style.display === 'none') {
                deptContent.style.display = 'block';
                if (folderIcon) folderIcon.textContent = '📂';
            } else {
                deptContent.style.display = 'none';
                if (folderIcon) folderIcon.textContent = '📁';
            }
        }
    },

    // 팀 폴더 트리뷰 토글 (체크박스와 분리)
    toggleTeamFilter: function(deptId, teamId) {
        const teamContent = document.getElementById(`team-${deptId}-${teamId}`);
        const folderIcon = document.querySelector(`.team-header [onclick*="${deptId}"][onclick*="${teamId}"] .folder-icon`);
        
        if (teamContent) {
            if (teamContent.style.display === 'none') {
                teamContent.style.display = 'block';
                if (folderIcon) folderIcon.textContent = '📂';
            } else {
                teamContent.style.display = 'none';
                if (folderIcon) folderIcon.textContent = '📁';
            }
        }
    }
};

// DOM 로드 완료 후 초기화
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM 로드 완료, vacationManager 초기화');
    vacationManager.init();
});