import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";
import multer from "multer";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

const db = new Database("penelitian.db");

// Initialize database
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL -- ADMIN, PIMPINAN
  );

  CREATE TABLE IF NOT EXISTS applications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nama_lengkap TEXT NOT NULL,
    nik TEXT NOT NULL,
    instansi TEXT NOT NULL,
    judul_penelitian TEXT NOT NULL,
    lokasi_penelitian TEXT NOT NULL,
    tanggal_mulai TEXT NOT NULL,
    tanggal_selesai TEXT NOT NULL,
    status TEXT DEFAULT 'PENDING', -- PENDING, VERIFIED, APPROVED, REJECTED
    catatan_admin TEXT,
    catatan_pimpinan TEXT,
    nomor_surat TEXT,
    file_ktp TEXT,
    file_proposal TEXT,
    file_persetujuan TEXT,
    file_rekomendasi TEXT,
    satuan TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

// Seed default users if not exists
const seedUsers = () => {
  const users = [
    { username: "admin", password: "admin123", role: "ADMIN" },
    { username: "pimpinan", password: "pimpinan123", role: "PIMPINAN" },
  ];

  const checkUser = db.prepare("SELECT * FROM users WHERE username = ?");
  const insertUser = db.prepare("INSERT INTO users (username, password, role) VALUES (?, ?, ?)");

  users.forEach((u) => {
    if (!checkUser.get(u.username)) {
      insertUser.run(u.username, u.password, u.role);
    }
  });
};
seedUsers();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());
  app.use("/uploads", express.static(uploadDir));

  // Request logger
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
  });

  // Auth Route
  app.post("/api/login", (req, res) => {
    try {
      const { username, password } = req.body;
      console.log(`Login attempt for username: ${username}`);
      
      if (!username || !password) {
        return res.status(400).json({ success: false, error: "Username dan password wajib diisi" });
      }

      const user = db.prepare("SELECT * FROM users WHERE username = ? AND password = ?").get(username, password) as any;
      if (user) {
        console.log(`Login success for: ${username}`);
        res.json({ success: true, user: { username: user.username, role: user.role } });
      } else {
        console.log(`Login failed for: ${username} - Invalid credentials`);
        res.status(401).json({ success: false, error: "Username atau password salah" });
      }
    } catch (error) {
      console.error("Login API Error:", error);
      res.status(500).json({ success: false, error: "Internal Server Error: " + error.message });
    }
  });

  // API Routes
  app.post("/api/applications", upload.fields([
    { name: "ktp", maxCount: 1 },
    { name: "proposal", maxCount: 1 },
    { name: "persetujuan", maxCount: 1 },
    { name: "rekomendasi", maxCount: 1 }
  ]), (req, res) => {
    const { nama_lengkap, nik, instansi, judul_penelitian, lokasi_penelitian, tanggal_mulai, tanggal_selesai, satuan } = req.body;
    const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
    
    const file_ktp = files?.["ktp"]?.[0]?.filename;
    const file_proposal = files?.["proposal"]?.[0]?.filename;
    const file_persetujuan = files?.["persetujuan"]?.[0]?.filename;
    const file_rekomendasi = files?.["rekomendasi"]?.[0]?.filename;

    try {
      const stmt = db.prepare(`
        INSERT INTO applications (
          nama_lengkap, nik, instansi, judul_penelitian, lokasi_penelitian, 
          tanggal_mulai, tanggal_selesai, file_ktp, file_proposal, 
          file_persetujuan, file_rekomendasi, satuan
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      const info = stmt.run(
        nama_lengkap, nik, instansi, judul_penelitian, lokasi_penelitian, 
        tanggal_mulai, tanggal_selesai, file_ktp, file_proposal, 
        file_persetujuan, file_rekomendasi, satuan
      );
      res.json({ id: info.lastInsertRowid, status: "success" });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/applications", (req, res) => {
    const apps = db.prepare("SELECT * FROM applications ORDER BY created_at DESC").all();
    res.json(apps);
  });

  app.get("/api/applications/:id", (req, res) => {
    const app_data = db.prepare("SELECT * FROM applications WHERE id = ?").get(req.params.id);
    if (app_data) {
      res.json(app_data);
    } else {
      res.status(404).json({ error: "Not found" });
    }
  });

  app.patch("/api/applications/:id/verify", (req, res) => {
    const { status, catatan_admin } = req.body;
    try {
      const stmt = db.prepare("UPDATE applications SET status = ?, catatan_admin = ? WHERE id = ?");
      stmt.run(status, catatan_admin, req.params.id);
      res.json({ status: "success" });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.patch("/api/applications/:id/approve", (req, res) => {
    const { status, catatan_pimpinan, nomor_surat } = req.body;
    try {
      const stmt = db.prepare("UPDATE applications SET status = ?, catatan_pimpinan = ?, nomor_surat = ? WHERE id = ?");
      stmt.run(status, catatan_pimpinan, nomor_surat, req.params.id);
      res.json({ status: "success" });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Global Error Handler
  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error("Global Error:", err);
    res.status(500).json({ error: "Internal Server Error", message: err.message });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
