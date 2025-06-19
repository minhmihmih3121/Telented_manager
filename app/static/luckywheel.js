
let members = ['An', 'Bình', 'Chi', 'Dũng', 'Em', 'Phong', 'Giang', 'Hương'];
let memberWeights = {}; // Lưu trọng số cho mỗi thành viên
let results = [];
let isSpinning = false;
let canvas = null;
let ctx = null;
let currentRotation = 0;
let animationId = null;

const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#FF7F50', '#87CEEB',
    '#F0E68C', '#FA8072', '#20B2AA', '#87CEFA', '#DDA0DD', '#F4A460', '#5F9EA0', '#D2B48C'
];

function initializeApp() {
    // Khởi tạo trọng số mặc định là 1 cho tất cả thành viên
    members.forEach((member, index) => {
        memberWeights[index] = 1;
    });
    
    // Khởi tạo canvas
    canvas = document.getElementById('wheelChart');
    ctx = canvas.getContext('2d');
    
    renderMemberList();
    drawWheel();
}

function renderMemberList() {
    const memberList = document.getElementById('memberList');
    memberList.innerHTML = '';

    members.forEach((member, index) => {
        const weight = memberWeights[index] || 0;
        const memberItem = document.createElement('div');
        memberItem.className = `member-item ${weight === 0 ? 'inactive' : ''}`;
        
        memberItem.innerHTML = `
            <div class="member-left">
                <span>${member}</span>
                <input type="number" class="weight-input ${weight === 0 ? 'inactive' : ''}" 
                        min="0" max="20" 
                        value="${weight}" 
                        onchange="updateWeight(${index}, this.value)">
                <span class="weight-label">x</span>
            </div>
        `;
        
        memberList.appendChild(memberItem);
    });
}

function updateWeight(index, value) {
    const weight = Math.max(0, Math.min(20, parseInt(value) || 0));
    memberWeights[index] = weight;
    renderMemberList();
    drawWheel();
}

function drawWheel() {
    if (!ctx) return;
    
    // Lấy danh sách thành viên có trọng số > 0
    const activeMembers = [];
    const activeWeights = [];
    const activeColors = [];
    
    members.forEach((member, index) => {
        const weight = memberWeights[index] || 0;
        if (weight > 0) {
            activeMembers.push(member);
            activeWeights.push(weight);
            activeColors.push(colors[index % colors.length]);
        }
    });
    
    if (activeMembers.length === 0) {
        // Vẽ vòng tròn trống
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.beginPath();
        ctx.arc(200, 200, 180, 0, 2 * Math.PI);
        ctx.fillStyle = '#f0f0f0';
        ctx.fill();
        ctx.strokeStyle = '#ddd';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        ctx.fillStyle = '#999';
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Không có thành viên nào', 200, 200);
        return;
    }
    
    // Tính tổng trọng số
    const totalWeight = activeWeights.reduce((sum, weight) => sum + weight, 0);
    
    // Vẽ nền
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Vẽ các phần của vòng quay - bắt đầu từ 12 giờ (top)
    let currentAngle = currentRotation - Math.PI / 2; // Bắt đầu từ 12 giờ
    const centerX = 200;
    const centerY = 200;
    const radius = 180;
    
    activeMembers.forEach((member, index) => {
        const weight = activeWeights[index];
        const sliceAngle = (weight / totalWeight) * 2 * Math.PI;
        const endAngle = currentAngle + sliceAngle;
        
        // Vẽ phần vòng quay
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, currentAngle, endAngle);
        ctx.closePath();
        ctx.fillStyle = activeColors[index];
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 3;
        ctx.stroke();
        
        // Vẽ text
        const textAngle = currentAngle + sliceAngle / 2;
        const textRadius = radius * 0.7;
        const textX = centerX + Math.cos(textAngle) * textRadius;
        const textY = centerY + Math.sin(textAngle) * textRadius;
        
        ctx.save();
        ctx.translate(textX, textY);
        ctx.rotate(textAngle + Math.PI / 2);
        
        // Thiết lập font và màu chữ
        ctx.fillStyle = '#ffffff';
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'center';
        
        // Vẽ tên thành viên
        const displayText = weight > 1 ? `(${weight}) ${member}` : member;
        
        // Vẽ outline cho chữ
        ctx.strokeText(displayText, 0, 0);
        // Vẽ chữ chính
        ctx.fillText(displayText, 0, 0);
        
        ctx.restore();
        
        currentAngle = endAngle;
    });
    
    // Vẽ viền ngoài
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 4;
    ctx.stroke();
    
    // Vẽ tâm
    ctx.beginPath();
    ctx.arc(centerX, centerY, 15, 0, 2 * Math.PI);
    ctx.fillStyle = '#333';
    ctx.fill();
}

function addMember() {
    const input = document.getElementById('newMemberInput');
    const newName = input.value.trim();
    
    if (newName && !members.includes(newName)) {
        const newIndex = members.length;
        members.push(newName);
        memberWeights[newIndex] = 1; // Trọng số mặc định là 1
        input.value = '';
        renderMemberList();
        drawWheel();
    }
}

function handleEnterKey(event) {
    if (event.key === 'Enter') {
        addMember();
    }
}

function spinWheel() {
    if (isSpinning) return;

    // Lấy danh sách thành viên có trọng số > 0
    const activeMembers = [];
    const activeWeights = [];
    
    members.forEach((member, index) => {
        const weight = memberWeights[index] || 0;
        if (weight > 0) {
            activeMembers.push(member);
            activeWeights.push(weight);
        }
    });
    
    if (activeMembers.length === 0) {
        alert('Vui lòng chọn ít nhất một thành viên để quay (trọng số > 0)!');
        return;
    }

    isSpinning = true;
    const spinBtn = document.getElementById('spinBtn');
    spinBtn.disabled = true;
    spinBtn.textContent = 'ĐANG QUAY...';

    // Tạo góc quay random (8-12 vòng + góc ngẫu nhiên)
    const extraSpins = 8 + Math.random() * 4;
    const randomAngle = Math.random() * 2 * Math.PI;
    const totalRotation = currentRotation + (extraSpins * 2 * Math.PI) + randomAngle;
    
    // Animation
    const duration = 4000;
    const startTime = Date.now();
    const startRotation = currentRotation;

    function animate() {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing function (ease out cubic)
        const easeOut = 1 - Math.pow(1 - progress, 3);
        
        currentRotation = startRotation + (totalRotation - startRotation) * easeOut;
        drawWheel();

        if (progress < 1) {
            animationId = requestAnimationFrame(animate);
        } else {
            // Tính winner dựa trên vị trí cuối cùng của vòng quay
            const winner = calculateWinnerFromAngle(currentRotation, activeMembers, activeWeights);
            
            // Hiển thị kết quả
            showResult(winner);
            
            // Xử lý theo chế độ
            const spinMode = document.getElementById('spinMode').value;
            if (spinMode === 'remove') {
                const originalIndex = members.indexOf(winner);
                memberWeights[originalIndex] = 0; // Đặt trọng số = 0 thay vì xóa
                renderMemberList();
                drawWheel();
            }
            
            // Hiệu ứng chúc mừng
            const celebrationMode = document.getElementById('celebrationMode').value;
            if (celebrationMode === 'celebrate') {
                createCelebration();
            }

            isSpinning = false;
            spinBtn.disabled = false;
            spinBtn.textContent = '🎲 QUAY NGAY!';
        }
    }

    animate();
}

function calculateWinnerFromAngle(rotation, activeMembers, activeWeights) {
    const totalWeight = activeWeights.reduce((sum, weight) => sum + weight, 0);
    
    // Mũi tên ở vị trí 12 giờ (90 độ hoặc -PI/2 radian)
    // Vòng quay bắt đầu từ 12 giờ (-PI/2), cần tính góc tương đối
    const arrowPosition = -Math.PI / 2; // Vị trí mũi tên cố định ở 12 giờ
    const wheelStartAngle = rotation - Math.PI / 2; // Góc bắt đầu của vòng quay
    
    // Tính góc tương đối từ vị trí bắt đầu vòng quay đến mũi tên
    let relativeAngle = arrowPosition - wheelStartAngle;
    
    // Chuẩn hóa góc về khoảng [0, 2*PI]
    relativeAngle = ((relativeAngle % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
    
    // Tính xem mũi tên chỉ vào segment nào
    const segmentAngles = activeWeights.map(weight => (weight / totalWeight) * 2 * Math.PI);
    
    let currentAngle = 0;
    for (let i = 0; i < segmentAngles.length; i++) {
        currentAngle += segmentAngles[i];
        if (relativeAngle <= currentAngle) {
            return activeMembers[i];
        }
    }
    
    // Fallback - trả về thành viên cuối cùng
    return activeMembers[activeMembers.length - 1];
}

function showResult(winner) {
    const spinMode = document.getElementById('spinMode').value;
    const celebrationMode = document.getElementById('celebrationMode').value;
    
    const result = {
        name: winner,
        time: new Date().toLocaleTimeString('vi-VN'),
        mode: spinMode === 'remove' ? 'Loại bỏ' : 'Giữ lại',
        celebration: celebrationMode === 'celebrate'
    };
    
    results.unshift(result);
    
    const currentResult = document.getElementById('currentResult');
    currentResult.innerHTML = `
        <div class="current-result">
            🎉 Người được chọn: <strong>${winner}</strong>
        </div>
    `;
    
    renderResults();
}

function renderResults() {
    const resultsList = document.getElementById('resultsList');
    resultsList.innerHTML = '';

    results.forEach(result => {
        const resultItem = document.createElement('div');
        resultItem.className = `result-item ${result.celebration ? 'winner' : ''}`;
        
        resultItem.innerHTML = `
            <div class="result-header">
                <span class="result-name">${result.celebration ? '🎉' : '📝'} ${result.name}</span>
                <span class="result-time">${result.time}</span>
            </div>
            <div class="result-mode">Chế độ: ${result.mode}</div>
        `;
        
        resultsList.appendChild(resultItem);
    });
}

function createCelebration() {
    const celebration = document.getElementById('celebration');
    celebration.innerHTML = '';

    for (let i = 0; i < 50; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';
        confetti.style.left = Math.random() * 100 + '%';
        confetti.style.background = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.animationDelay = Math.random() * 3 + 's';
        confetti.style.animationDuration = (Math.random() * 2 + 2) + 's';
        celebration.appendChild(confetti);
    }

    setTimeout(() => {
        celebration.innerHTML = '';
    }, 5000);
}

// Khởi tạo ứng dụng
document.addEventListener('DOMContentLoaded', initializeApp);
