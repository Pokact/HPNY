const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

// Đảm bảo thư mục data tồn tại
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
  console.log('Đã tạo thư mục data');
}

// Tạo file messages.json nếu chưa tồn tại
const messagesFile = path.join(dataDir, 'messages.json');
if (!fs.existsSync(messagesFile)) {
  fs.writeFileSync(messagesFile, '[]', 'utf8');
  console.log('Đã tạo file messages.json');
}

const server = http.createServer((req, res) => {
  // Log mỗi request nhận được
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  console.log('Request headers:', req.headers);

  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;
  console.log('Parsed pathname:', pathname);

  // Thiết lập CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Xử lý OPTIONS request
  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // Xử lý API endpoint để gửi tin nhắn - đảm bảo đúng đường dẫn
  if ((pathname === '/api/messages' || pathname === '//api/messages') && req.method === 'POST') {
    console.log('Endpoint API messages được gọi đúng!');
    console.log('Nhận yêu cầu POST đến /api/messages');
    let body = '';

    req.on('data', chunk => {
      body += chunk.toString();
    });

    req.on('end', () => {
      console.log('Dữ liệu nhận được:', body);

      try {
        const messageData = JSON.parse(body);

        // Kiểm tra dữ liệu
        if (!messageData.name || !messageData.email || !messageData.message) {
          console.log('Lỗi: Thiếu thông tin bắt buộc');
          res.writeHead(400, {'Content-Type': 'application/json'});
          res.end(JSON.stringify({success: false, error: 'Thiếu thông tin bắt buộc'}));
          return;
        }

        // Đọc tin nhắn hiện có
        let messages = [];
        try {
          if (fs.existsSync(messagesFile)) {
            const data = fs.readFileSync(messagesFile, 'utf8');
            if (data && data.trim()) {
              messages = JSON.parse(data);
            }
          }
        } catch (err) {
          console.error('Lỗi khi đọc file messages.json:', err);
          // Tiếp tục với mảng rỗng
        }

        // Thêm tin nhắn mới
        const newMessage = {
          id: Date.now().toString(),
          date: new Date().toISOString(),
          name: messageData.name,
          email: messageData.email,
          message: messageData.message
        };

        messages.push(newMessage);

        // Lưu vào file
        try {
          fs.writeFileSync(messagesFile, JSON.stringify(messages, null, 2));
          console.log('Đã lưu tin nhắn thành công');

          res.writeHead(200, {'Content-Type': 'application/json'});
          res.end(JSON.stringify({success: true}));
        } catch (err) {
          console.error('Lỗi khi ghi file:', err);
          res.writeHead(500, {'Content-Type': 'application/json'});
          res.end(JSON.stringify({success: false, error: 'Lỗi khi lưu tin nhắn'}));
        }
      } catch (err) {
        console.error('Lỗi khi xử lý tin nhắn:', err);
        res.writeHead(500, {'Content-Type': 'application/json'});
        res.end(JSON.stringify({success: false, error: 'Lỗi máy chủ'}));
      }
    });

    return;
  }

  // API để lấy tất cả tin nhắn
  if (pathname === '/admin/messages' && req.method === 'GET') {
    try {
      const messages = JSON.parse(fs.readFileSync(messagesFile, 'utf8'));
      res.writeHead(200, {'Content-Type': 'application/json'});
      res.end(JSON.stringify(messages));
    } catch (error) {
      console.error('Lỗi khi đọc tin nhắn:', error);
      res.writeHead(500, {'Content-Type': 'application/json'});
      res.end(JSON.stringify({success: false, error: 'Lỗi máy chủ'}));
    }
    return;
  }

  // Phục vụ các file tĩnh
  const filePath = pathname === '/' 
    ? path.join(__dirname, 'index.html') 
    : path.join(__dirname, pathname);

  const extname = String(path.extname(filePath)).toLowerCase();
  const contentTypes = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml'
  };

  const contentType = contentTypes[extname] || 'application/octet-stream';

  fs.readFile(filePath, (error, content) => {
    if (error) {
      if (error.code === 'ENOENT') {
        res.writeHead(404);
        res.end('File not found');
      } else {
        res.writeHead(500);
        res.end(`Server Error: ${error.code}`);
      }
    } else {
      res.writeHead(200, {'Content-Type': contentType});
      res.end(content, 'utf-8');
    }
  });
});

// Lắng nghe trên cổng 3000 và tất cả các giao diện
const PORT = 3000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server đang chạy tại http://0.0.0.0:${PORT}/`);
  console.log(`Truy cập trang web tại: https://${process.env.REPL_SLUG}.${process.env.REPL_OWNER}.repl.co`);
});