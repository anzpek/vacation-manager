// printManager.js - 달력 모아찍기 인쇄 기능 (HTML 직접 생성 방식)
const printManager = {
    // 모아찍기 인쇄 처리
    async handleMultiPrint(months) {
        try {
            this.showLoading('인쇄용 페이지 생성 중...');

            // 인쇄용 HTML 콘텐츠 생성
            const printContent = await this.generatePrintContent(months);

            // 인쇄용 창 열기
            this.openPrintWindowWithContent(printContent);

        } catch (error) {
            console.error('인쇄 오류:', error);
            alert('인쇄 준비 중 오류가 발생했습니다.');
        } finally {
            this.hideLoading();
        }
    },

    // 인쇄용 HTML 콘텐츠 생성
    async generatePrintContent(months) {
        let content = '';
        const singleColumnClass = months.length >= 3 ? 'single-column' : '';

        for (const ym of months) {
            const [year, month] = ym.split('-').map(Number);

            // 각 달력을 감싸는 래퍼
            content += `<div class="print-calendar-wrapper ${singleColumnClass}">
                <div class="print-calendar-header">${year}년 ${month}월</div>
                <div class="calendar" id="print-calendar-${year}-${month}"></div>
            </div>`;
        }

        // 임시 컨테이너를 만들어 실제 DOM에 추가하지 않고 렌더링
        const tempContainer = document.createElement('div');
        tempContainer.style.position = 'absolute';
        tempContainer.style.left = '-9999px'; // 화면에 보이지 않게 처리
        tempContainer.innerHTML = content;
        document.body.appendChild(tempContainer);

        // 각 달력에 내용 채우기
        for (const ym of months) {
            const [year, month] = ym.split('-').map(Number);
            const grid = tempContainer.querySelector(`#print-calendar-${year}-${month}`);
            await calendar.render(grid, year, month - 1, false);

            // *** 중요: 테두리 색상 적용 ***
            const vacationBlocks = grid.querySelectorAll('.vacation-block');
            vacationBlocks.forEach(block => {
                // Get employee name from the block's text content
                const employeeName = block.textContent.trim();
                if (employeeName) {
                    const color = storage.getEmployeeColor(employeeName);
                    block.style.borderColor = color;
                    // Optional: Add a little color accent to the background as well
                    // block.style.backgroundColor = color.replace('1)', '0.1)'); // Example for rgba
                }
            });
        }

        const finalHtml = tempContainer.innerHTML;
        document.body.removeChild(tempContainer);

        return finalHtml;
    },

    // 인쇄용 창 열고 콘텐츠 채우기
    openPrintWindowWithContent(content) {
        const printWindow = window.open('', '_blank');
        if (!printWindow) {
            alert('팝업이 차단되었습니다. 인쇄 기능을 사용하려면 팝업을 허용해주세요.');
            return;
        }

        printWindow.document.write(`
            <!DOCTYPE html>
            <html lang="ko">
            <head>
                <meta charset="UTF-8">
                <title>부서 휴가 달력 인쇄</title>
                <link rel="stylesheet" href="css/style.css">
                <link rel="stylesheet" href="css/print-styles.css">
                <style>
                    /* 추가적인 인쇄 전용 스타일 */
                    body { background-color: #fff !important; }
                    .print-calendar-wrapper { margin-bottom: 20px; }
                </style>
            </head>
            <body>
                <div class="print-container">
                    ${content}
                </div>
                <script>
                    window.onload = function() {
                        setTimeout(function() { // 렌더링을 위한 약간의 지연
                            window.print();
                            window.close();
                        }, 500);
                    };
                </script>
            </body>
            </html>
        `);
        printWindow.document.close();
    },

    // 로딩 표시
    showLoading(message = '처리 중...') {
        let loading = document.getElementById('print-loading');
        if (!loading) {
            loading = document.createElement('div');
            loading.id = 'print-loading';
            loading.style.cssText = `
                position: fixed; top: 0; left: 0; right: 0; bottom: 0;
                background: rgba(0, 0, 0, 0.7); display: flex; justify-content: center;
                align-items: center; z-index: 10000; color: white; flex-direction: column;
            `;
            document.body.appendChild(loading);
        }
        loading.innerHTML = `
            <div style="background: white; padding: 30px; border-radius: 10px; text-align: center; color: black;">
                <p style="margin-bottom: 20px; font-size: 16px;">${message}</p>
                <div style="width: 50px; height: 50px; border: 5px solid #f3f3f3; border-top: 5px solid #3498db; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto;"></div>
            </div>
            <style>
                @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
            </style>
        `;
        loading.style.display = 'flex';
    },

    // 로딩 숨기기
    hideLoading() {
        const loading = document.getElementById('print-loading');
        if (loading) {
            loading.style.display = 'none';
        }
    }
};