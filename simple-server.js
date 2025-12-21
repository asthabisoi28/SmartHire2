// Simple Node.js server to serve the AI Interview system
try {
  await import('dotenv/config');
} catch (e) {
  // dotenv not installed; proceed. Ensure OPENAI_API_KEY is set in environment
}
import http from 'http';
import fs from 'fs';
import path from 'path';
import url from 'url';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure OPENAI_API_KEY is available; try to load .env manually if dotenv not installed
try {
 if (!process.env.OPENAI_API_KEY) {
   const envPath = path.join(__dirname, '.env');
   if (fs.existsSync(envPath)) {
     const text = fs.readFileSync(envPath, 'utf-8');
     for (const line of text.split(/\r?\n/)) {
       if (!line || /^\s*#/.test(line)) continue;
       const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
       if (!m) continue;
       const key = m[1];
       let val = m[2];
       // Strip surrounding quotes
       val = val.replace(/^['"]|['"]$/g, '');
       if (!process.env[key]) process.env[key] = val;
     }
   }
 }
} catch {}

const port = 3000;

// MIME types
const mimeTypes = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.jsx': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.wav': 'audio/wav',
  '.mp4': 'video/mp4',
  '.woff': 'application/font-woff',
  '.ttf': 'application/font-ttf',
  '.eot': 'application/vnd.ms-fontobject',
  '.otf': 'application/font-otf',
  '.wasm': 'application/wasm'
};

const server = http.createServer(async (req, res) => {
  console.log(`${req.method} ${req.url}`);
  
  // CORS preflight
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.statusCode = 204;
    res.end();
    return;
  }

  // Parse URL
  const parsedUrl = url.parse(req.url);
  let pathname = `.${parsedUrl.pathname}`;

  // API: ATS Analyze with text extraction and OpenAI
  if (parsedUrl.pathname === '/api/ats_analyze' && req.method === 'POST') {
    try {
      let body = '';
      req.on('data', chunk => { body += chunk; });
      req.on('end', async () => {
        try {
          const { fileName, fileType, fileDataBase64 } = JSON.parse(body || '{}');
          if (!process.env.OPENAI_API_KEY) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: 'OPENAI_API_KEY is not set on the server.' }));
            return;
          }
          if (!fileName || !fileType || !fileDataBase64) {
            res.statusCode = 400;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: 'Missing file payload' }));
            return;
          }

          // Decode base64 -> Buffer
          const base64 = fileDataBase64.split(',').pop();
          const buffer = Buffer.from(base64, 'base64');

          let extractedText = '';
          const mime = fileType.toLowerCase();
          if (mime.includes('pdf')) {
            const pdfParse = (await import('pdf-parse')).default;
            const data = await pdfParse(buffer);
            extractedText = data.text || '';
          } else if (mime.includes('wordprocessingml.document') || /\.docx$/i.test(fileName)) {
            const mammoth = await import('mammoth');
            const result = await mammoth.extractRawText({ buffer });
            extractedText = result.value || '';
          } else if (mime.includes('msword') || /\.doc$/i.test(fileName)) {
            // Legacy .doc not supported without external tools; return error
            throw new Error('Legacy .doc files are not supported. Please upload PDF, DOCX, or TXT.');
          } else if (mime.includes('text') || /\.txt$/i.test(fileName)) {
            extractedText = buffer.toString('utf-8');
          } else {
            throw new Error('Unsupported file type. Please upload PDF, DOCX, or TXT.');
          }

          if (!extractedText || extractedText.trim().length === 0) {
            throw new Error('Could not extract text from file');
          }

          const system = `You are an expert resume screener. Evaluate the provided resume text strictly and return JSON only with fields: score (0-100), verdict (Excellent|Good|Fair|Poor), strengths (array of strings), improvements (array of strings), keywords {found:[], missing:[]}, sections {contact, summary, experience, skills, education} each with score and feedback.`;
          const userMsg = `Resume Text (truncated if very large):\n${extractedText.slice(0, 15000)}`;

          const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
            },
            body: JSON.stringify({
              model: 'gpt-4o-mini',
              messages: [
                { role: 'system', content: system },
                { role: 'user', content: userMsg }
              ],
              temperature: 0.2,
              response_format: { type: 'json_object' }
            })
          });

          const data = await response.json();
          if (!response.ok) {
            throw new Error(data.error?.message || 'OpenAI API error');
          }
          const content = data.choices?.[0]?.message?.content || '{}';
          let parsed;
          try { parsed = JSON.parse(content); } catch { parsed = { summary: content }; }

          res.statusCode = 200;
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ ok: true, evaluation: parsed, bytes: buffer.length }));
        } catch (e) {
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: e.message || 'Failed to analyze' }));
        }
      });
    } catch (e) {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: 'Request handling error' }));
    }
    return;
  }

  // API: Evaluate answer using OpenAI
  if (parsedUrl.pathname === '/api/evaluate' && req.method === 'POST') {
    try {
      let body = '';
      req.on('data', chunk => { body += chunk; });
      req.on('end', async () => {
        try {
          const { question, transcript, rubric } = JSON.parse(body || '{}');
          if (!process.env.OPENAI_API_KEY) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: 'OPENAI_API_KEY is not set on the server.' }));
            return;
          }
          if (!transcript || transcript.trim().length === 0) {
            res.statusCode = 400;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: 'Missing transcript in request body' }));
            return;
          }

          const system = `You are an expert technical interviewer. Evaluate the candidate's answer transcript strictly and return JSON only with fields: score (0-100), verdict (one of: Excellent, Good, Fair, Poor), strengths (array of strings), improvements (array of strings), summary (1-2 sentence).`;
          const userMsg = `Question: ${question || 'N/A'}\nTranscript: ${transcript}\n${rubric ? `Rubric: ${rubric}` : ''}`;

          // Use Node 18+ fetch; fallback to https request if needed
          const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
            },
            body: JSON.stringify({
              model: 'gpt-4o-mini',
              messages: [
                { role: 'system', content: system },
                { role: 'user', content: userMsg }
              ],
              temperature: 0.2,
              response_format: { type: 'json_object' }
            })
          });

          const data = await response.json();
          if (!response.ok) {
            throw new Error(data.error?.message || 'OpenAI API error');
          }

          const content = data.choices?.[0]?.message?.content || '{}';
          let parsed;
          try { parsed = JSON.parse(content); } catch { parsed = { summary: content }; }

          res.statusCode = 200;
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ ok: true, evaluation: parsed }));
        } catch (e) {
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: e.message || 'Failed to evaluate' }));
        }
      });
    } catch (e) {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: 'Request handling error' }));
    }
    return;
  }
  
  // Default to login.html for root
  if (pathname === './') {
    pathname = './login.html';
  }
  
  // For React Router - serve index.html for all routes that don't match files
  const isApiRoute = pathname.startsWith('./api/');
  const isStaticFile = path.extname(pathname) !== '';
  
  // Check if file exists
  fs.access(pathname, fs.constants.F_OK, (err) => {
    if (err && !isApiRoute) {
      // If it's not a static file and not an API route, serve login.html for React Router
      if (!isStaticFile) {
        pathname = './login.html';
      } else {
        // File not found
        res.statusCode = 404;
        res.end(`File ${pathname} not found!`);
        return;
      }
    }
    
    // Read file
    fs.readFile(pathname, (err, data) => {
      if (err) {
        res.statusCode = 500;
        res.end(`Error getting the file: ${err}.`);
      } else {
        // Get file extension
        const ext = path.parse(pathname).ext;
        
        // Set content type
        res.setHeader('Content-type', mimeTypes[ext] || 'text/plain');
        
        // Enable CORS
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
        
        res.end(data);
      }
    });
  });
});

server.listen(port, () => {
  console.log(`🚀 AI Interview System running at http://localhost:${port}/`);
  console.log(`📁 Serving files from: ${__dirname}`);
  console.log(`🔗 Open your browser and navigate to: http://localhost:${port}/`);
});