// imageUploadPlugin.ts
// Vite plugin — HANYA aktif saat `npm run dev` (dev server lokal).
// Menyediakan endpoint POST /api/upload-image yang menyimpan file
// langsung ke folder public/images, lalu meng-update public/manifest.json.
//
// CATATAN: Ini tidak akan berfungsi setelah di-deploy ke Vercel,
// karena Vercel tidak punya filesystem yang bisa ditulis permanen.
// Alurnya: jalankan dev server lokal -> upload gambar lewat form ->
// gambar tersimpan ke public/images -> commit & push ke GitHub.

import type { Plugin, ViteDevServer } from 'vite';
import fs from 'fs';
import path from 'path';

export function imageUploadPlugin(): Plugin {
  return {
    name: 'image-upload-dev-middleware',
    configureServer(server: ViteDevServer) {
      server.middlewares.use('/api/upload-image', async (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405;
          res.end('Method not allowed');
          return;
        }

        let body = '';
        req.on('data', (chunk) => {
          body += chunk;
        });

        req.on('end', () => {
          try {
            const { filename, dataUrl } = JSON.parse(body);

            if (!filename || !dataUrl) {
              res.statusCode = 400;
              res.end(JSON.stringify({ error: 'filename dan dataUrl wajib diisi' }));
              return;
            }

            const matches = dataUrl.match(/^data:(.+);base64,(.+)$/);
            if (!matches) {
              res.statusCode = 400;
              res.end(JSON.stringify({ error: 'Format dataUrl tidak valid' }));
              return;
            }

            const buffer = Buffer.from(matches[2], 'base64');

            // Amankan nama file dari karakter aneh
            const safeFilename = filename.replace(/[^a-zA-Z0-9._-]/g, '_');
            const targetDir = path.resolve(process.cwd(), 'public', 'images');

            if (!fs.existsSync(targetDir)) {
              fs.mkdirSync(targetDir, { recursive: true });
            }

            const targetPath = path.join(targetDir, safeFilename);
            fs.writeFileSync(targetPath, buffer);

            // --- Update manifest.json (lokasi: public/images/manifest.json) ---
            const manifestPath = path.resolve(process.cwd(), 'public', 'images', 'manifest.json');
            try {
              let manifest: string[] = [];
              if (fs.existsSync(manifestPath)) {
                const raw = fs.readFileSync(manifestPath, 'utf-8');
                manifest = JSON.parse(raw);
              }
              if (!manifest.includes(safeFilename)) {
                manifest.push(safeFilename);
                fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
              }
            } catch {
              // Kalau format manifest berbeda dari asumsi di sini, bagian ini
              // aman untuk diabaikan — tinggal jalankan ulang script
              // `generate-manifest` yang sudah ada setelah upload.
            }

            res.setHeader('Content-Type', 'application/json');
            res.statusCode = 200;
            res.end(
              JSON.stringify({
                success: true,
                path: `/images/${safeFilename}`,
                sizeKB: Math.round(buffer.length / 1024),
              })
            );
          } catch (err) {
            res.statusCode = 500;
            res.end(JSON.stringify({ error: (err as Error).message }));
          }
        });
      });
    },
  };
}
