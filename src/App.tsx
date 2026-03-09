import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  FileText, 
  CheckCircle, 
  Clock, 
  XCircle, 
  ChevronRight, 
  Printer, 
  ShieldCheck, 
  UserCheck, 
  LayoutDashboard,
  PlusCircle,
  Search,
  ArrowLeft,
  LogIn,
  LogOut,
  Lock
} from 'lucide-react';

// --- Types ---
interface User {
  username: string;
  role: 'ADMIN' | 'PIMPINAN';
}

interface Application {
  id: number;
  nama_lengkap: string;
  nik: string;
  instansi: string;
  judul_penelitian: string;
  lokasi_penelitian: string;
  tanggal_mulai: string;
  tanggal_selesai: string;
  status: 'PENDING' | 'VERIFIED' | 'APPROVED' | 'REJECTED';
  catatan_admin?: string;
  catatan_pimpinan?: string;
  nomor_surat?: string;
  file_ktp?: string;
  file_proposal?: string;
  file_persetujuan?: string;
  file_rekomendasi?: string;
  created_at: string;
}

// --- Components ---

const Navbar = ({ role, setRole, user, onLogout }: { role: string, setRole: (r: string) => void, user: User | null, onLogout: () => void }) => (
  <nav className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center sticky top-0 z-50">
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 bg-emerald-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">
        B
      </div>
      <div>
        <h1 className="font-bold text-slate-800 leading-tight">BAKESBANGPOLDAGRI</h1>
        <p className="text-xs text-slate-500 font-medium tracking-wider uppercase">Provinsi NTB</p>
      </div>
    </div>
    <div className="flex items-center gap-4">
      <div className="flex gap-2 bg-slate-100 p-1 rounded-xl">
        {['Researcher', 'Admin', 'Pimpinan'].map((r) => (
          <button
            key={r}
            onClick={() => setRole(r)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
              role === r 
                ? 'bg-white text-emerald-600 shadow-sm' 
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {r}
          </button>
        ))}
      </div>
      {user && (role === 'Admin' || role === 'Pimpinan') && (
        <button 
          onClick={onLogout}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
        >
          <LogOut className="w-4 h-4" /> Keluar
        </button>
      )}
    </div>
  </nav>
);

const LoginForm = ({ role, onLogin }: { role: string, onLogin: (user: User) => void }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      
      let data;
      const text = await res.text();
      try {
        data = JSON.parse(text);
      } catch (e) {
        console.error('Invalid JSON response from server:', text);
        setError(`Respon server tidak valid (bukan JSON). Status: ${res.status}`);
        return;
      }

      if (data.success) {
        if (data.user.role.toLowerCase() === role.toLowerCase()) {
          onLogin(data.user);
        } else {
          setError(`Akun ini tidak memiliki akses sebagai ${role}`);
        }
      } else {
        setError(data.error || 'Login gagal');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan sistem');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="max-w-md mx-auto bg-white p-8 rounded-3xl shadow-xl border border-slate-100 mt-12"
    >
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 mx-auto mb-4">
          <Lock className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800">Login {role}</h2>
        <p className="text-slate-500 mt-1">Gunakan akun Anda untuk mengakses portal.</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-3 bg-rose-50 border border-rose-100 text-rose-600 text-sm rounded-xl flex items-center gap-2">
            <XCircle className="w-4 h-4" /> {error}
          </div>
        )}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700">Username</label>
          <input 
            required
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            value={username}
            onChange={e => setUsername(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700">Password</label>
          <input 
            required
            type="password"
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
        </div>
        <button 
          disabled={loading}
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-emerald-600/20 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? 'Memproses...' : <><LogIn className="w-5 h-5" /> Masuk</>}
        </button>
      </form>
      <div className="mt-8 pt-6 border-t border-slate-100 text-center">
        <p className="text-xs text-slate-400 italic">
          Default: admin/admin123 atau pimpinan/pimpinan123
        </p>
      </div>
    </motion.div>
  );
};

const ResearcherForm = ({ onSuccess }: { onSuccess: () => void }) => {
  const [formData, setFormData] = useState({
    nama_lengkap: '',
    nik: '',
    instansi: '',
    judul_penelitian: '',
    lokasi_penelitian: '',
    tanggal_mulai: '',
    tanggal_selesai: ''
  });
  const [files, setFiles] = useState<{ [key: string]: File | null }>({
    ktp: null,
    proposal: null,
    persetujuan: null,
    rekomendasi: null
  });
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
    if (e.target.files && e.target.files[0]) {
      setFiles(prev => ({ ...prev, [field]: e.target.files![0] }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = new FormData();
      Object.entries(formData).forEach(([key, value]) => data.append(key, value as string));
      Object.entries(files).forEach(([key, file]) => {
        if (file) data.append(key, file as Blob);
      });

      const res = await fetch('/api/applications', {
        method: 'POST',
        body: data
      });
      if (res.ok) {
        alert('Permohonan berhasil dikirim!');
        setFormData({
          nama_lengkap: '',
          nik: '',
          instansi: '',
          judul_penelitian: '',
          lokasi_penelitian: '',
          tanggal_mulai: '',
          tanggal_selesai: ''
        });
        setFiles({
          ktp: null,
          proposal: null,
          persetujuan: null,
          rekomendasi: null
        });
        onSuccess();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto bg-white p-8 rounded-3xl shadow-sm border border-slate-100"
    >
      <div className="-mx-8 -mt-8 mb-8 p-8 bg-blue-600 rounded-t-3xl">
        <h2 className="text-2xl font-bold text-white">Form Permohonan Izin Penelitian</h2>
        <p className="text-blue-50 mt-1">Lengkapi data di bawah ini untuk mengajukan izin penelitian.</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Nama Lengkap</label>
            <input 
              required
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
              value={formData.nama_lengkap}
              onChange={e => setFormData({...formData, nama_lengkap: e.target.value})}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">NIK</label>
            <input 
              required
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
              value={formData.nik}
              onChange={e => setFormData({...formData, nik: e.target.value})}
            />
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700">Instansi / Universitas</label>
          <input 
            required
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
            value={formData.instansi}
            onChange={e => setFormData({...formData, instansi: e.target.value})}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700">Judul Penelitian</label>
          <textarea 
            required
            rows={3}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all resize-none"
            value={formData.judul_penelitian}
            onChange={e => setFormData({...formData, judul_penelitian: e.target.value})}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700">Lokasi Penelitian</label>
          <input 
            required
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
            value={formData.lokasi_penelitian}
            onChange={e => setFormData({...formData, lokasi_penelitian: e.target.value})}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Tanggal Mulai</label>
            <input 
              required
              type="date"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
              value={formData.tanggal_mulai}
              onChange={e => setFormData({...formData, tanggal_mulai: e.target.value})}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Tanggal Selesai</label>
            <input 
              required
              type="date"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
              value={formData.tanggal_selesai}
              onChange={e => setFormData({...formData, tanggal_selesai: e.target.value})}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Upload KTP</label>
            <input 
              required
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
              onChange={e => handleFileChange(e, 'ktp')}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Upload Proposal</label>
            <input 
              required
              type="file"
              accept=".pdf"
              className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
              onChange={e => handleFileChange(e, 'proposal')}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Upload Surat Persetujuan</label>
            <input 
              required
              type="file"
              accept=".pdf"
              className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
              onChange={e => handleFileChange(e, 'persetujuan')}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Upload Surat Rekomendasi</label>
            <input 
              required
              type="file"
              accept=".pdf"
              className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
              onChange={e => handleFileChange(e, 'rekomendasi')}
            />
          </div>
        </div>

        <button 
          disabled={loading}
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-emerald-600/20 disabled:opacity-50"
        >
          {loading ? 'Mengirim...' : 'Kirim Permohonan'}
        </button>
      </form>
    </motion.div>
  );
};

const StatusBadge = ({ status }: { status: string }) => {
  const styles = {
    PENDING: 'bg-amber-50 text-amber-700 border-amber-200',
    VERIFIED: 'bg-blue-50 text-blue-700 border-blue-200',
    APPROVED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    REJECTED: 'bg-rose-50 text-rose-700 border-rose-200'
  };
  const icons = {
    PENDING: <Clock className="w-3 h-3" />,
    VERIFIED: <ShieldCheck className="w-3 h-3" />,
    APPROVED: <CheckCircle className="w-3 h-3" />,
    REJECTED: <XCircle className="w-3 h-3" />
  };
  return (
    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border flex items-center gap-1.5 w-fit uppercase tracking-wider ${styles[status as keyof typeof styles]}`}>
      {icons[status as keyof typeof icons]}
      {status}
    </span>
  );
};

const PermitLetter = ({ app, onClose }: { app: Application, onClose: () => void }) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 overflow-y-auto">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white w-full max-w-[210mm] min-h-[297mm] p-12 shadow-2xl relative print:shadow-none print:p-0"
      >
        <button 
          onClick={onClose}
          className="absolute -top-12 right-0 text-white flex items-center gap-2 hover:text-emerald-400 transition-colors print:hidden"
        >
          <ArrowLeft className="w-5 h-5" /> Tutup
        </button>
        <button 
          onClick={handlePrint}
          className="absolute -top-12 right-32 text-white flex items-center gap-2 hover:text-emerald-400 transition-colors print:hidden"
        >
          <Printer className="w-5 h-5" /> Cetak
        </button>

        {/* Letter Content */}
        <div className="text-center border-b-4 border-double border-black pb-4 mb-8">
          <h2 className="text-xl font-bold uppercase">Pemerintah Provinsi Nusa Tenggara Barat</h2>
          <h1 className="text-2xl font-bold uppercase">Badan Kesatuan Bangsa dan Politik Dalam Negeri</h1>
          <p className="text-sm italic">Jl. Pendidikan No. 2 Mataram, Telp. (0370) 621234</p>
        </div>

        <div className="text-center mb-8">
          <h3 className="text-lg font-bold underline uppercase">Surat Izin Penelitian</h3>
          <p className="font-medium">Nomor: {app.nomor_surat || '.../BAKESBANGPOLDAGRI/2024'}</p>
        </div>

        <div className="space-y-6 text-justify leading-relaxed">
          <p>Berdasarkan permohonan yang diajukan oleh instansi terkait, dengan ini Kepala Badan Kesatuan Bangsa dan Politik Dalam Negeri Provinsi NTB memberikan izin penelitian kepada:</p>
          
          <div className="grid grid-cols-[150px_20px_1fr] gap-y-2 ml-8">
            <div className="font-semibold">Nama</div><div>:</div><div>{app.nama_lengkap}</div>
            <div className="font-semibold">NIK</div><div>:</div><div>{app.nik}</div>
            <div className="font-semibold">Instansi</div><div>:</div><div>{app.instansi}</div>
            <div className="font-semibold">Judul Penelitian</div><div>:</div><div className="italic">"{app.judul_penelitian}"</div>
            <div className="font-semibold">Lokasi</div><div>:</div><div>{app.lokasi_penelitian}</div>
            <div className="font-semibold">Waktu</div><div>:</div><div>{app.tanggal_mulai} s/d {app.tanggal_selesai}</div>
          </div>

          <p>Dengan ketentuan sebagai berikut:</p>
          <ol className="list-decimal ml-8 space-y-1">
            <li>Menaati peraturan perundang-undangan yang berlaku.</li>
            <li>Tidak melakukan kegiatan yang menyimpang dari judul penelitian.</li>
            <li>Menyerahkan hasil penelitian kepada BAKESBANGPOLDAGRI NTB setelah selesai.</li>
          </ol>

          <p>Demikian surat izin ini dibuat untuk dipergunakan sebagaimana mestinya.</p>
        </div>

        <div className="mt-16 flex justify-end">
          <div className="text-center w-64">
            <p>Mataram, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
            <p className="font-bold mt-2">Kepala Badan,</p>
            <div className="h-24"></div>
            <p className="font-bold underline">H. LALU MUHAMMAD, M.Si</p>
            <p>NIP. 19700101 199001 1 001</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

const AdminDashboard = ({ role }: { role: 'Admin' | 'Pimpinan' }) => {
  const [apps, setApps] = useState<Application[]>([]);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [catatan, setCatatan] = useState('');
  const [nomorSurat, setNomorSurat] = useState('');
  const [showLetter, setShowLetter] = useState<Application | null>(null);

  const fetchApps = async () => {
    const res = await fetch('/api/applications');
    const data = await res.json();
    setApps(data);
  };

  useEffect(() => {
    fetchApps();
  }, []);

  const handleVerify = async (id: number, status: string) => {
    await fetch(`/api/applications/${id}/verify`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, catatan_admin: catatan })
    });
    setSelectedApp(null);
    setCatatan('');
    fetchApps();
  };

  const handleApprove = async (id: number, status: string) => {
    await fetch(`/api/applications/${id}/approve`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, catatan_pimpinan: catatan, nomor_surat: nomorSurat })
    });
    setSelectedApp(null);
    setCatatan('');
    setNomorSurat('');
    fetchApps();
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold text-slate-800">Portal {role}</h2>
          <p className="text-slate-500">Kelola permohonan izin penelitian yang masuk.</p>
        </div>
        <div className="flex gap-4">
          <div className="bg-white border border-slate-200 px-4 py-2 rounded-xl flex items-center gap-2">
            <Search className="w-4 h-4 text-slate-400" />
            <input placeholder="Cari permohonan..." className="outline-none text-sm bg-transparent" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Pemohon</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Judul Penelitian</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {apps.map((app) => (
              <tr key={app.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="font-bold text-slate-800">{app.nama_lengkap}</div>
                  <div className="text-xs text-slate-500">{app.instansi}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-slate-700 line-clamp-1 max-w-xs">{app.judul_penelitian}</div>
                  <div className="text-[10px] text-slate-400 mt-1">{app.lokasi_penelitian}</div>
                </td>
                <td className="px-6 py-4">
                  <StatusBadge status={app.status} />
                </td>
                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    {role === 'Admin' && app.status === 'PENDING' && (
                      <button 
                        onClick={() => setSelectedApp(app)}
                        className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors"
                        title="Verifikasi"
                      >
                        <ShieldCheck className="w-5 h-5" />
                      </button>
                    )}
                    {role === 'Pimpinan' && app.status === 'VERIFIED' && (
                      <button 
                        onClick={() => setSelectedApp(app)}
                        className="p-2 hover:bg-emerald-50 text-emerald-600 rounded-lg transition-colors"
                        title="Setujui"
                      >
                        <UserCheck className="w-5 h-5" />
                      </button>
                    )}
                    {app.status === 'APPROVED' && (
                      <button 
                        onClick={() => setShowLetter(app)}
                        className="p-2 hover:bg-slate-100 text-slate-600 rounded-lg transition-colors"
                        title="Lihat Surat"
                      >
                        <FileText className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal Action */}
      <AnimatePresence>
        {selectedApp && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white w-full max-w-lg rounded-3xl p-8 shadow-2xl space-y-6"
            >
              <div>
                <h3 className="text-xl font-bold text-slate-800">
                  {role === 'Admin' ? 'Verifikasi Permohonan' : 'Persetujuan Pimpinan'}
                </h3>
                <p className="text-slate-500 text-sm mt-1">
                  {selectedApp.nama_lengkap} - {selectedApp.instansi}
                </p>
              </div>

              <div className="space-y-3">
                <label className="text-sm font-semibold text-slate-700">Dokumen Pendukung</label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: 'KTP', file: selectedApp.file_ktp },
                    { label: 'Proposal', file: selectedApp.file_proposal },
                    { label: 'Persetujuan', file: selectedApp.file_persetujuan },
                    { label: 'Rekomendasi', file: selectedApp.file_rekomendasi }
                  ].map((doc, i) => (
                    <a 
                      key={i}
                      href={`/uploads/${doc.file}`}
                      target="_blank"
                      rel="noreferrer"
                      className={`p-3 rounded-xl border flex items-center gap-2 text-xs font-medium transition-all ${
                        doc.file 
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100' 
                          : 'bg-slate-50 border-slate-200 text-slate-400 cursor-not-allowed'
                      }`}
                      onClick={e => !doc.file && e.preventDefault()}
                    >
                      <FileText className="w-4 h-4" />
                      {doc.label}
                    </a>
                  ))}
                </div>
              </div>

              {role === 'Pimpinan' && (
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Nomor Surat</label>
                  <input 
                    placeholder="Contoh: 070/123/BAKESBANGPOLDAGRI/2024"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                    value={nomorSurat}
                    onChange={e => setNomorSurat(e.target.value)}
                  />
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Catatan {role}</label>
                <textarea 
                  rows={3}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 resize-none"
                  value={catatan}
                  onChange={e => setCatatan(e.target.value)}
                />
              </div>

              <div className="flex gap-3">
                <button 
                  onClick={() => setSelectedApp(null)}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 font-bold text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Batal
                </button>
                <button 
                  onClick={() => role === 'Admin' ? handleVerify(selectedApp.id, 'REJECTED') : handleApprove(selectedApp.id, 'REJECTED')}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-rose-50 text-rose-600 font-bold hover:bg-rose-100 transition-colors"
                >
                  Tolak
                </button>
                <button 
                  onClick={() => role === 'Admin' ? handleVerify(selectedApp.id, 'VERIFIED') : handleApprove(selectedApp.id, 'APPROVED')}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-600/20"
                >
                  {role === 'Admin' ? 'Verifikasi' : 'Setujui'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {showLetter && <PermitLetter app={showLetter} onClose={() => setShowLetter(null)} />}
    </div>
  );
};

export default function App() {
  const [role, setRole] = useState('Researcher');
  const [refreshKey, setRefreshKey] = useState(0);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Reset user when switching to Researcher
    if (role === 'Researcher') {
      setUser(null);
    }
  }, [role]);

  const handleLogout = () => {
    setUser(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      <Navbar role={role} setRole={setRole} user={user} onLogout={handleLogout} />
      
      <main className="container mx-auto px-6 py-12">
        {role === 'Researcher' && (
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-12 items-start">
            <ResearcherForm onSuccess={() => setRefreshKey(k => k + 1)} />
            
            <div className="space-y-6">
              <div className="bg-emerald-900 text-white p-8 rounded-3xl shadow-xl shadow-emerald-900/20">
                <h3 className="text-xl font-bold mb-4">Alur Pengajuan</h3>
                <div className="space-y-6">
                  {[
                    { title: 'Isi Form', desc: 'Lengkapi data diri dan detail penelitian.' },
                    { title: 'Verifikasi Admin', desc: 'Admin akan memeriksa kelengkapan berkas.' },
                    { title: 'Persetujuan Pimpinan', desc: 'Pimpinan menandatangani surat izin.' },
                    { title: 'Unduh Surat', desc: 'Surat izin dapat dicetak secara mandiri.' }
                  ].map((step, i) => (
                    <div key={i} className="flex gap-4">
                      <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center font-bold text-sm shrink-0">
                        {i + 1}
                      </div>
                      <div>
                        <h4 className="font-bold text-sm">{step.title}</h4>
                        <p className="text-xs text-emerald-100/70 mt-0.5">{step.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-slate-200">
                <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <LayoutDashboard className="w-4 h-4" /> Status Terkini
                </h3>
                <ApplicationStatusList key={refreshKey} />
              </div>
            </div>
          </div>
        )}

        {role === 'Admin' && (
          user?.role === 'ADMIN' ? <AdminDashboard role="Admin" /> : <LoginForm role="Admin" onLogin={setUser} />
        )}
        {role === 'Pimpinan' && (
          user?.role === 'PIMPINAN' ? <AdminDashboard role="Pimpinan" /> : <LoginForm role="Pimpinan" onLogin={setUser} />
        )}
      </main>

      <footer className="bg-white border-t border-slate-200 py-8 mt-24">
        <div className="container mx-auto px-6 text-center text-slate-400 text-sm">
          &copy; 2024 BAKESBANGPOLDAGRI Provinsi NTB. All rights reserved.
        </div>
      </footer>
    </div>
  );
}

const ApplicationStatusList = () => {
  const [apps, setApps] = useState<Application[]>([]);
  const [showLetter, setShowLetter] = useState<Application | null>(null);

  useEffect(() => {
    fetch('/api/applications')
      .then(res => res.json())
      .then(setApps);
  }, []);

  if (apps.length === 0) return <p className="text-slate-400 text-xs italic">Belum ada pengajuan.</p>;

  return (
    <div className="space-y-3">
      {apps.slice(0, 5).map(app => (
        <div key={app.id} className="p-3 rounded-2xl border border-slate-100 bg-slate-50/50 flex justify-between items-center group">
          <div className="min-w-0">
            <p className="text-sm font-bold text-slate-800 truncate">{app.nama_lengkap}</p>
            <StatusBadge status={app.status} />
          </div>
          {app.status === 'APPROVED' && (
            <button 
              onClick={() => setShowLetter(app)}
              className="p-2 hover:bg-emerald-100 text-emerald-600 rounded-lg transition-all opacity-0 group-hover:opacity-100"
            >
              <Printer className="w-4 h-4" />
            </button>
          )}
        </div>
      ))}
      {showLetter && <PermitLetter app={showLetter} onClose={() => setShowLetter(null)} />}
    </div>
  );
};
