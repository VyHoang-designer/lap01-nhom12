const http = require('http');
const https = require('https');

class HTTPClient {
	async request(url, options = {}) {
		const { protocol, hostname, port, path } = this._parseUrl(url);
		const method = options.method || 'GET';
		const headers = options.headers || {};
		const data = options.body || null;
		return new Promise((resolve, reject) => {
			const lib = protocol === 'https:' ? https : http;
			const req = lib.request({ method, protocol, hostname, port, path, headers }, res => {
				let rawData = Buffer.alloc(0);
				let body = '';
				res.on('data', chunk => {
					rawData = Buffer.concat([rawData, Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)]);
					body += chunk;
				});
				res.on('end', () => {
					resolve({
						statusCode: res.statusCode,
						headers: res.headers,
						rawData,
						body
					});
				});
			});
			req.on('error', err => {
				reject(err);
			});
			if (data) req.write(data);
			req.end();
		});
	}

	get(url, headers = {}) {
		// Thêm User-Agent nếu gọi tới GitHub API
		if (url.includes('api.github.com')) {
			headers['User-Agent'] = 'Lab01-Nhom12-Monitor';
		}
		return this.request(url, { method: 'GET', headers });
	}

	post(url, data, headers = {}) {
		headers['Content-Type'] = 'application/json';
		return this.request(url, { method: 'POST', headers, body: JSON.stringify(data) });
	}

	_parseUrl(url) {
		const u = new URL(url);
		return {
			protocol: u.protocol,
			hostname: u.hostname,
			port: u.port || (u.protocol === 'https:' ? 443 : 80),
			path: u.pathname + u.search
		};
	}
}

module.exports = HTTPClient;

// Chạy demo nếu file được execute trực tiếp
if (require.main === module) {
	(async () => {
		const client = new HTTPClient();
		try {
			// GET tới server cục bộ
			console.log('GET local server:');
			const res1 = await client.get('http://localhost:3000/api/server-info');
			console.log(res1);

			// GET tới external API
			console.log('GET GitHub API:');
			const res2 = await client.get('https://api.github.com');
			console.log(res2);

			// POST tới JSONPlaceholder
			console.log('POST JSONPlaceholder:');
			const res3 = await client.post('https://jsonplaceholder.typicode.com/posts', {
				title: 'foo', body: 'bar', userId: 1
			});
			console.log(res3);

			// Lỗi server không khả dụng
			console.log('GET lỗi server:');
			await client.get('http://localhost:9999');
		} catch (err) {
			console.error('Error:', err.message);
		}
	})();
}
