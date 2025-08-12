const HTTPClient = require('./client.js');

class NetworkMonitor {
	constructor() {
		this.client = new HTTPClient();
		this.monitorData = [];
	}

	async performRequest(url) {
		const startTime = process.hrtime.bigint();
		try {
			const response = await this.client.get(url);
			const endTime = process.hrtime.bigint();
			const metrics = {
				url,
				statusCode: response.statusCode,
				responseTime: Number(endTime - startTime) / 1000000,
				contentLength: response.rawData ? response.rawData.length : 0,
				success: true
			};
			this.monitorData.push(metrics);
			console.log(`✅ [GET] ${url} | Status: ${metrics.statusCode} | Time: ${metrics.responseTime.toFixed(2)}ms | Size: ${metrics.contentLength} bytes`);
			return response;
		} catch (error) {
			const endTime = process.hrtime.bigint();
			const metrics = {
				url,
				statusCode: 0,
				responseTime: Number(endTime - startTime) / 1000000,
				contentLength: 0,
				success: false,
				error: error.message
			};
			this.monitorData.push(metrics);
			console.log(`❌ [GET] ${url} | ERROR: ${error.message}`);
			return null;
		}
	}

	printReport() {
		console.log('\n=== Network Monitor Report ===');
		console.log(`Tổng số requests: ${this.monitorData.length}`);
		const success = this.monitorData.filter(d => d.success).length;
		const fail = this.monitorData.length - success;
		console.log(`Thành công: ${success} | Thất bại: ${fail}`);
		if (success > 0) {
			const avgTime = (this.monitorData.filter(d => d.success).reduce((a, b) => a + b.responseTime, 0) / success).toFixed(2);
			console.log(`Thời gian phản hồi trung bình: ${avgTime}ms`);
		}
	}
}

// Demo
(async () => {
	const monitor = new NetworkMonitor();
	const urls = [
		'http://localhost:3000/api/server-info',
		'https://api.github.com',
		'https://jsonplaceholder.typicode.com/posts/1',
		'http://localhost:9999/notfound' // lỗi
	];
	for (const url of urls) {
		await monitor.performRequest(url);
	}
	monitor.printReport();
})();
