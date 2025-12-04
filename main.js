document.addEventListener('DOMContentLoaded', function() {
    createTable(50);
    
    document.getElementById('clear').addEventListener('click', clearTable);
    document.getElementById('updateRows').addEventListener('click', updateTableRows);
    
    document.getElementById('rowCount').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            updateTableRows();
        }
    });
    
    document.querySelectorAll('.preset').forEach(btn => {
        btn.addEventListener('click', function() {
            document.getElementById('speed').value = this.getAttribute('data-speed');
            calculate();
        });
    });
    
    document.querySelectorAll('input, select').forEach(el => {
        el.addEventListener('input', calculate);
    });
    
    calculate();
});

function createTable(rowCount) {
    const tbody = document.getElementById('tableBody');
    tbody.innerHTML = '';
    
    for (let i = 1; i <= rowCount; i++) {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${i}</td>
            <td><input type="number" class="size" value="0" min="0"></td>
            <td><input type="number" class="freq" value="0" min="0" step="0.1"></td>
            <td class="bits">0</td>
            <td class="time">0.000</td>
        `;
        tbody.appendChild(row);
    }
    
    document.getElementById('currentRowCount').textContent = rowCount;
    
    document.querySelectorAll('#tableBody input').forEach(el => {
        el.addEventListener('input', calculate);
    });
}

function updateTableRows() {
    const rowCountInput = document.getElementById('rowCount');
    let rowCount = parseInt(rowCountInput.value) || 50;
    
    if (rowCount < 1) rowCount = 1;
    if (rowCount > 200) rowCount = 200;
    
    rowCountInput.value = rowCount;
    
    createTable(rowCount);
    
    calculate();
    
    showMessage(`Таблица обновлена: ${rowCount} строк`);
}

function calculate() {
    const X = parseFloat(document.getElementById('overhead').value) || 0;
    const S = parseFloat(document.getElementById('speed').value) || 1;
    const C = parseFloat(document.getElementById('stopBits').value) || 1;
    const V = parseInt(document.getElementById('parityBit').value) || 0;
    const T = parseFloat(document.getElementById('operationTime').value) || 1;
    
    const sizeInputs = document.querySelectorAll('.size');
    const freqInputs = document.querySelectorAll('.freq');
    const bitsCells = document.querySelectorAll('.bits');
    const timeCells = document.querySelectorAll('.time');
    
    let totalTime = 0;
    let activeRows = 0;
    
    for (let i = 0; i < sizeInputs.length; i++) {
        const Z = parseFloat(sizeInputs[i].value) || 0;
        const F = parseFloat(freqInputs[i].value) || 0;
        
        if (Z > 0 && F > 0) {
            activeRows++;
            const N = (Z + X) * (8 + C + V);
            const tn = N / S;
            const rowTime = tn * F * T;
            totalTime += rowTime;
            
            bitsCells[i].textContent = Math.round(N);
            timeCells[i].textContent = tn.toFixed(6);
            
            sizeInputs[i].closest('tr').style.backgroundColor = '#f0f8ff';
        } else {
            bitsCells[i].textContent = '0';
            timeCells[i].textContent = '0.000';
            sizeInputs[i].closest('tr').style.backgroundColor = '';
        }
    }
    
    const freeTime = Math.max(0, T - totalTime);
    const loadPercent = T > 0 ? (totalTime / T) * 100 : 0;
    
    document.getElementById('totalTime').textContent = totalTime.toFixed(6);
    document.getElementById('freeTime').textContent = freeTime.toFixed(6);
    document.getElementById('loadPercent').textContent = loadPercent.toFixed(2) + '%';

    const progressBar = document.getElementById('progressBar');
    
    if (loadPercent > 100) {
        progressBar.style.width = '100%';
        progressBar.style.background = '#e74c3c'; 
    } else if (loadPercent > 0) {
        const width = Math.min(100, loadPercent);
        progressBar.style.width = width + '%';
        progressBar.style.background = '#2ecc71';
    } else {
        progressBar.style.width = '0%';
    }
}

function clearTable() {
    if (confirm('Очистить все данные в таблице?')) {
        document.querySelectorAll('.size, .freq').forEach(input => {
            input.value = '0';
        });
        calculate();
        showMessage('Таблица очищена');
    }
}

function showMessage(text) {
    const msg = document.createElement('div');
    msg.textContent = text;
    msg.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #2ecc71;
        color: white;
        padding: 10px 20px;
        border-radius: 5px;
        z-index: 1000;
        animation: fadeIn 0.3s;
    `;
    
    document.body.appendChild(msg);
    
    setTimeout(() => {
        msg.style.animation = 'fadeOut 0.3s';
        setTimeout(() => msg.remove(), 300);
    }, 2000);
    
    const style = document.createElement('style');
    style.textContent = `
        @keyframes fadeIn { from { opacity: 0; transform: translateY(-20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeOut { from { opacity: 1; transform: translateY(0); } to { opacity: 0; transform: translateY(-20px); } }
    `;
    document.head.appendChild(style);
}