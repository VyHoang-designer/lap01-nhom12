const express = require('express');
const path = require('path');
const os = require('os');

const app = express();
const PORT = 3000;

// Middleware: custom headers & CORS
app.use((req, res, next) => {
	res.setHeader('X-Custom-Header', 'Lab01-Nhom12');
	res.setHeader('Access-Control-Allow-Origin', '*');
	next();
});

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// API endpoint: server info

// API endpoint: server info
app.get('/api/server-info', (req, res) => {
	res.json({
		timestamp: new Date().toISOString(),
		hostname: os.hostname(),
		platform: os.platform(),
		arch: os.arch(),
		uptime: os.uptime()
	});
});

// API endpoint: client test
app.get('/api/client-test', async (req, res) => {
	try {
		const HTTPClient = require('./client.js');
		const client = new HTTPClient();
		const result = await client.get('http://localhost:3000/api/server-info');
		res.json(result);
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

// API endpoint: monitor report
app.get('/api/monitor-report', async (req, res) => {
	try {
		const NetworkMonitor = require('./monitor.js');
		const monitor = new NetworkMonitor();
		// Chạy một số request test
		const urls = [
			'http://localhost:3000/api/server-info',
			'https://api.github.com',
			'https://jsonplaceholder.typicode.com/posts/1'
		];
		for (const url of urls) {
			await monitor.performRequest(url);
		}
		// Trả về báo cáo
		const report = monitor.analyzeData();
		res.json(report);
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

// 404 handler
app.use((req, res, next) => {
	res.status(404).json({ error: 'Not Found' });
});

// 500 handler
app.use((err, req, res, next) => {
	console.error(err.stack);
	res.status(500).json({ error: 'Internal Server Error' });
});

app.listen(PORT, () => {
	console.log(`Server running at http://localhost:${PORT}`);
});
