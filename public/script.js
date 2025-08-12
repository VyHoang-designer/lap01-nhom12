
document.getElementById('getInfo').addEventListener('click', function() {
    fetch('/api/server-info')
        .then(res => res.json())
        .then(data => {
            document.getElementById('serverInfo').innerText = JSON.stringify(data, null, 2);
        })
        .catch(err => {
            document.getElementById('serverInfo').innerText = 'Lỗi khi lấy thông tin server';
        });
});


document.getElementById('getClientTest').addEventListener('click', function() {
    fetch('/api/client-test')
        .then(res => res.json())
        .then(data => {
            let html = `<b>GET local server:</b><br>`;
            html += `<pre>${formatClientResult(data)}</pre>`;
            document.getElementById('clientTest').innerHTML = html;
        })
        .catch(err => {
            document.getElementById('clientTest').innerText = 'Lỗi khi kiểm thử client';
        });
});

function formatClientResult(data) {
    if (!data || typeof data !== 'object') return 'Không có dữ liệu.';
    let out = '';
    out += `Status: ${data.statusCode}\n`;
    out += `Headers: ${JSON.stringify(data.headers, null, 2)}\n`;
    out += `Body: ${data.body}\n`;
    return out;
}


document.getElementById('getMonitorReport').addEventListener('click', function() {
    fetch('/api/monitor-report')
        .then(res => res.json())
        .then(data => {
            let html = `<b>Performance Monitor:</b><br>`;
            html += `<pre>${formatMonitorReport(data)}</pre>`;
            document.getElementById('monitorReport').innerHTML = html;
        })
        .catch(err => {
            document.getElementById('monitorReport').innerText = 'Lỗi khi lấy báo cáo monitor';
        });
});

function formatMonitorReport(data) {
    if (!data || typeof data !== 'object') return 'Không có dữ liệu.';
    let out = '';
    if (data.summary) {
        out += `Thời gian phản hồi trung bình: ${data.performance.avgResponseTime}ms\n`;
        out += `Successful requests: ${data.summary.successfulRequests}\n`;
        out += `Failed requests: ${data.summary.failedRequests}\n`;
        out += `Success rate: ${data.summary.successRate}%\n`;
    }
    if (data.endpoints) {
        out += `\nRECENT REQUESTS:\n`;
        Object.keys(data.endpoints).forEach(ep => {
            const stats = data.endpoints[ep];
            out += `${ep}: ${stats.requests} requests | Avg: ${stats.avgResponseTime}ms\n`;
        });
    }
    return out;
}
