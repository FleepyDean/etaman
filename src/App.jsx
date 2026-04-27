import React, { useState, useMemo, useEffect } from 'react';
import { 
  Trees, Plus, List, BarChart3, Search, Filter, 
  Edit, Trash2, Eye, MapPin, Map, Ruler, CheckSquare, 
  XSquare, Download, Car, Tent, Home, Baby,
  Sparkles, Bot, Loader2, AlignLeft, X, Upload, AlertCircle
} from 'lucide-react';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
const apiUrl = (path) => `${API_BASE_URL}${path}`;

// --- UTILITI API GEMINI ---
const callGeminiAPI = async (prompt) => {
  const apiKey = "";
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;
  const payload = {
    contents: [{ parts: [{ text: prompt }] }]
  };

  let retries = 5;
  let delay = 1000;

  while (retries > 0) {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      const result = await response.json();
      return result.candidates?.[0]?.content?.parts?.[0]?.text || '';
    } catch (error) {
      retries--;
      if (retries === 0) {
        console.error("Gemini API Error:", error);
        throw new Error("Gagal menyambung ke pelayan AI. Sila cuba lagi.");
      }
      await new Promise(res => setTimeout(res, delay));
      delay *= 2;
    }
  }
};

// --- DATA AWAL (MOCK DATA) ---
const initialData = [
  {
    id: 1,
    nama: 'Taman Merdeka',
    lokasi: 'Jalan Kolam Ayer',
    daerah: 'Johor Bahru',
    keluasan: '30',
    jenis: 'Taman Tempatan',
    PBT: 'MBJB',
    kemudahan: { tandas: true, playground: true, parking: true, surau: true },
    deskripsi: 'Taman Merdeka merupakan sebuah taman awam yang luas dan mendamaikan di tengah bandaraya Johor Bahru. Ia menawarkan persekitaran yang sesuai untuk riadah keluarga dengan kemudahan yang lengkap.'
  },
  {
    id: 2,
    nama: 'Taman Rekreasi Gunung Lambak',
    lokasi: 'Kluang',
    daerah: 'Kluang',
    keluasan: '50',
    jenis: 'Taman Rekreasi',
    PBT: 'Rizab Hutan',
    kemudahan: { tandas: true, playground: false, parking: true, surau: true },
    deskripsi: 'Destinasi popular bagi pendaki dan pencinta alam. Taman Rekreasi Gunung Lambak di Kluang menyajikan keindahan alam semula jadi hutan simpan yang sesuai untuk aktiviti lasak dan santai.'
  },
  {
    id: 3,
    nama: 'Taman Botani Batu Pahat',
    lokasi: 'Jalan Minyak Beku',
    daerah: 'Batu Pahat',
    keluasan: '15',
    jenis: 'Taman Botani',
    PBT: 'Majlis Perbandaran',
    kemudahan: { tandas: true, playground: true, parking: true, surau: false },
    deskripsi: 'Taman Botani ini menyimpan pelbagai spesies flora yang unik. Sesuai sebagai tempat pembelajaran sambil beriadah, terutamanya bagi penduduk sekitar Batu Pahat.'
  },
  {
    id: 4,
    nama: 'Taman Tanjung Emas',
    lokasi: 'Jalan Peteri',
    daerah: 'Muar',
    keluasan: '12',
    jenis: 'Taman Awam',
    PBT: 'Majlis Perbandaran',
    kemudahan: { tandas: true, playground: true, parking: true, surau: true },
    deskripsi: 'Terletak di muara Sungai Muar, taman ini sangat sesuai untuk riadah petang sambil menikmati pemandangan matahari terbenam dan pesona bot-bot nelayan.'
  },
  {
    id: 5,
    nama: 'Hutan Bandar Putra',
    lokasi: 'Bandar Putra',
    daerah: 'Kulai',
    keluasan: '150',
    jenis: 'Taman Rekreasi',
    PBT: 'Majlis Perbandaran',
    kemudahan: { tandas: true, playground: true, parking: true, surau: true },
    deskripsi: 'Sebuah taman rekreasi berskala besar di Kulai yang mempunyai tasik buatan, trek joging yang teduh, dan pelbagai kemudahan riadah untuk semua lapisan umur.'
  },
  {
    id: 6,
    nama: 'Taman Tepi Laut Pontian',
    lokasi: 'Pusat Bandar Pontian',
    daerah: 'Pontian',
    keluasan: '5',
    jenis: 'Taman Awam',
    PBT: 'Majlis Daerah',
    kemudahan: { tandas: true, playground: true, parking: true, surau: false },
    deskripsi: 'Taman ini menawarkan pemandangan Selat Melaka yang indah. Ia merupakan kawasan tumpuan penduduk tempatan bersiar-siar sambil menikmati bayu laut pada waktu petang.'
  },
  {
    id: 7,
    nama: 'Taman Rekreasi Gunung Ledang',
    lokasi: 'Sagil',
    daerah: 'Tangkak',
    keluasan: '100',
    jenis: 'Taman Rekreasi',
    PBT: 'Rizab Hutan',
    kemudahan: { tandas: true, playground: false, parking: true, surau: true },
    deskripsi: 'Taman rekreasi terkenal dengan air terjun yang sejuk dan jernih di kaki Gunung Ledang. Sangat sesuai untuk perkelahan keluarga dan aktiviti berkhemah.'
  },
  {
    id: 8,
    nama: 'Taman Bunga Raya',
    lokasi: 'Jalan Awang',
    daerah: 'Segamat',
    keluasan: '8',
    jenis: 'Taman Awam',
    PBT: 'Majlis Perbandaran',
    kemudahan: { tandas: true, playground: true, parking: true, surau: false },
    deskripsi: 'Taman awam utama di pusat bandar Segamat. Dilengkapi dengan taman permainan kanak-kanak dan kawasan hijau yang luas untuk aktiviti komuniti setempat.'
  },
  {
    id: 9,
    nama: 'Taman Bandar Kota Tinggi',
    lokasi: 'Pusat Bandar',
    daerah: 'Kota Tinggi',
    keluasan: '10',
    jenis: 'Taman Awam',
    PBT: 'Majlis Daerah',
    kemudahan: { tandas: true, playground: true, parking: true, surau: true },
    deskripsi: 'Taman rekreasi di tebing Sungai Johor ini sering menjadi lokasi acara komuniti dan persinggahan pelancong yang berkunjung ke daerah bersejarah ini.'
  },
  {
    id: 10,
    nama: 'Taman Riadah Pantai Mersing',
    lokasi: 'Jalan Pantai',
    daerah: 'Mersing',
    keluasan: '6',
    jenis: 'Taman Awam',
    PBT: 'Majlis Daerah',
    kemudahan: { tandas: true, playground: true, parking: true, surau: true },
    deskripsi: 'Terletak berhampiran jeti utama ke pulau-pulau, taman ini menawarkan kawasan santai dengan pemandangan laut yang tenang untuk warga Mersing dan pelancong.'
  }
];

const SENARAI_DAERAH = ['Johor Bahru', 'Kluang', 'Batu Pahat', 'Muar', 'Kulai', 'Kota Tinggi', 'Segamat', 'Pontian', 'Mersing', 'Tangkak'];
const JENIS_TAMAN = ['Taman Tempatan', 'Taman Bandaran', 'Lot Permainan', 'Padang Permainan', 'Taman Kejiranan', 'Taman Permainan'];

export default function SistemPengurusanTaman() {
  const [tamanList, setTamanList] = useState([]);
  const [activeTab, setActiveTab] = useState('senarai');
  const [editingId, setEditingId] = useState(null);
  const [viewingTaman, setViewingTaman] = useState(null);
  const [tamanToDelete, setTamanToDelete] = useState(null);
  const [loading, setLoading] = useState(true);

  // Filter & Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDaerah, setFilterDaerah] = useState('');
  const [filterJenis, setFilterJenis] = useState('');
  const [filterKemudahan, setFilterKemudahan] = useState({
    tandas: false, playground: false, parking: false, surau: false
  });

  // Import State
  const [isImporting, setIsImporting] = useState(false);
  const [importingTaman, setImportingTaman] = useState([]);

  // Fetch data from Django API
  useEffect(() => {
    fetchTamanList();
  }, []);

  const fetchTamanList = async () => {
    try {
      const response = await fetch(apiUrl('/api/taman/'));
      const result = await response.json();
      if (result.success) {
        setTamanList(result.data);
      }
    } catch (error) {
      console.error('Error fetching taman list:', error);
    } finally {
      setLoading(false);
    }
  };

  // --- FUNGSI CRUD (MODUL 1) ---
  const handleSaveTaman = async (formData) => {
    try {
      if (editingId) {
        // Update existing taman
        const response = await fetch(apiUrl(`/api/taman/${editingId}/update/`), {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
        const result = await response.json();
        if (result.success) {
          setTamanList(tamanList.map(t => t.id === editingId ? result.data : t));
        }
      } else {
        // Create new taman
        const response = await fetch(apiUrl('/api/taman/create/'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
        const result = await response.json();
        if (result.success) {
          setTamanList([...tamanList, result.data]);
        }
      }
      setActiveTab('senarai');
      setEditingId(null);
    } catch (error) {
      console.error('Error saving taman:', error);
      alert('Ralat semasa menyimpan data taman');
    }
  };

  const handleDeleteTaman = (id) => {
    setTamanToDelete(id);
  };

  const confirmDelete = async () => {
    try {
      const response = await fetch(apiUrl(`/api/taman/${tamanToDelete}/delete/`), {
        method: 'DELETE'
      });
      const result = await response.json();
      if (result.success) {
        setTamanList(tamanList.filter(t => t.id !== tamanToDelete));
      }
      setTamanToDelete(null);
    } catch (error) {
      console.error('Error deleting taman:', error);
      alert('Ralat semasa memadam data taman');
    }
  };

  const handleEditTaman = (taman) => {
    setEditingId(taman.id);
    setViewingTaman(taman);
    setActiveTab('borang');
  };

  const handleViewProfil = (taman) => {
    setViewingTaman(taman);
    setActiveTab('profil');
  };

  // --- FUNGSI EKSPORT (MODUL 3) ---
  const handleExportCSV = () => {
    const headers = ['ID', 'Nama Taman', 'Lokasi', 'Daerah', 'Keluasan (Ekar)', 'Jenis', 'PBT', 'Tandas', 'Playground', 'Parking', 'Surau', 'Deskripsi'];
    const csvData = tamanList.map(t => [
      t.id, t.nama, t.lokasi, t.daerah, t.keluasan, t.jenis, t.PBT,
      t.kemudahan.tandas ? 'Ya' : 'Tidak',
      t.kemudahan.playground ? 'Ya' : 'Tidak',
      t.kemudahan.parking ? 'Ya' : 'Tidak',
      t.kemudahan.surau ? 'Ya' : 'Tidak',
      t.deskripsi ? t.deskripsi.replace(/"/g, '""') : ''
    ]);
    
    const csvContent = [headers.join(','), ...csvData.map(row => row.map(item => `"${item}"`).join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'Senarai_Taman.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // --- FUNGSI IMPORT ---
  const handleImportFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        let data = [];
        
        if (file.name.endsWith('.csv')) {
          // Parse CSV
          Papa.parse(event.target.result, {
            header: true,
            complete: (results) => {
              data = results.data.filter(row => row['Nama Taman'] || row.nama); // Filter empty rows
            },
            error: (error) => {
              alert('Ralat membaca fail CSV: ' + error.message);
            }
          });
        } else if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
          // Parse Excel
          const workbook = XLSX.read(event.target.result, { type: 'binary' });
          const worksheet = workbook.Sheets[workbook.SheetNames[0]];
          data = XLSX.utils.sheet_to_json(worksheet).filter(row => row['Nama Taman'] || row.nama);
        } else {
          alert('Sila muatnaik fail CSV atau Excel sahaja');
          return;
        }

        // Convert data to taman format
        const convertedTaman = data.map((row, idx) => ({
          tempId: `temp_${idx}_${Date.now()}`, // Temporary ID for import
          nama: row['Nama Taman'] || row.nama || '',
          lokasi: row['Lokasi'] || row.lokasi || '',
          daerah: row['Daerah'] || row.daerah || '',
          keluasan: row['Keluasan (Ekar)'] || row.keluasan || '',
          jenis: row['Jenis'] || row.jenis || 'Taman Awam',
          PBT: row['PBT'] || row.PBT || '',
          kemudahan: {
            tandas: (row['Tandas'] || row.tandas || '').toLowerCase() === 'ya',
            playground: (row['Playground'] || row.playground || '').toLowerCase() === 'ya',
            parking: (row['Parking'] || row.parking || '').toLowerCase() === 'ya',
            surau: (row['Surau'] || row.surau || '').toLowerCase() === 'ya'
          },
          deskripsi: row['Deskripsi'] || row.deskripsi || '',
          images: [],
          importMainCoverIndex: null
        }));

        if (convertedTaman.length === 0) {
          alert('Fail yang muatnaik tidak mengandungi data yang sah');
          return;
        }

        setImportingTaman(convertedTaman);
        setIsImporting(true);
      } catch (error) {
        console.error('Error parsing file:', error);
        alert('Ralat memproses fail: ' + error.message);
      }
    };

    if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
      reader.readAsArrayBuffer(file);
    } else {
      reader.readAsText(file);
    }
  };

  const handleConfirmImport = async () => {
    try {
      const tamanNeedMainCoverChoice = importingTaman.find(
        (taman) => taman.images.length > 1 && (taman.importMainCoverIndex === null || taman.importMainCoverIndex === undefined)
      );

      if (tamanNeedMainCoverChoice) {
        alert(`Sila pilih gambar utama untuk ${tamanNeedMainCoverChoice.nama} sebelum import.`);
        return;
      }

      setLoading(true);
      let successCount = 0;
      let errorCount = 0;
      let errors = [];
      
      for (const taman of importingTaman) {
        try {
          // Create taman with kemudahan as nested object
          const response = await fetch(apiUrl('/api/taman/create/'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              nama: taman.nama,
              lokasi: taman.lokasi,
              daerah: taman.daerah,
              keluasan: taman.keluasan,
              jenis: taman.jenis,
              PBT: taman.PBT,
              kemudahan: {
                tandas: taman.kemudahan.tandas,
                playground: taman.kemudahan.playground,
                parking: taman.kemudahan.parking,
                surau: taman.kemudahan.surau
              },
              deskripsi: taman.deskripsi
            })
          });
          
          const result = await response.json();
          if (result.success) {
            successCount++;
            // Upload images if any
            if (taman.images.length > 0) {
              const formDataImage = new FormData();
              taman.images.forEach((file) => {
                formDataImage.append('images', file);
              });

              try {
                const uploadResponse = await fetch(apiUrl(`/api/taman/${result.id}/upload-image/`), {
                  method: 'POST',
                  body: formDataImage
                });
                const uploadResult = await uploadResponse.json();

                if (uploadResult.success && Array.isArray(uploadResult.images) && uploadResult.images.length > 0) {
                  let mainCoverIndex = taman.images.length === 1 ? 0 : taman.importMainCoverIndex;

                  if (mainCoverIndex !== null && mainCoverIndex !== undefined && uploadResult.images[mainCoverIndex]) {
                    const selectedImage = uploadResult.images[mainCoverIndex];
                    await fetch(apiUrl(`/api/taman/${result.id}/image/${selectedImage.id}/set-main-cover/`), {
                      method: 'POST'
                    });
                  }
                }
              } catch (imgError) {
                console.error('Error uploading images for taman:', taman.nama, imgError);
              }
            }
          } else {
            errorCount++;
            errors.push(`${taman.nama}: ${result.error || 'Unknown error'}`);
          }
        } catch (itemError) {
          errorCount++;
          errors.push(`${taman.nama}: ${itemError.message}`);
          console.error('Error importing taman:', taman.nama, itemError);
        }
      }

      // Refresh taman list
      await fetchTamanList();
      setIsImporting(false);
      setImportingTaman([]);
      
      if (errorCount === 0) {
        alert(`✅ Semua ${successCount} taman berjaya diimport!`);
      } else {
        alert(`⚠️ Import selesai: ${successCount} berjaya, ${errorCount} gagal.\n\nGagal: ${errors.join('\n')}`);
      }
    } catch (error) {
      console.error('Error importing taman:', error);
      alert('Ralat semasa mengimport taman: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // --- FILTER & SEARCH LOGIC (MODUL 3) ---
  const filteredTaman = useMemo(() => {
    return tamanList.filter(t => {
      const matchSearch = t.nama.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          t.lokasi.toLowerCase().includes(searchQuery.toLowerCase());
      const matchDaerah = filterDaerah ? t.daerah === filterDaerah : true;
      const matchJenis = filterJenis ? t.jenis === filterJenis : true;
      
      const matchTandas = filterKemudahan.tandas ? t.kemudahan.tandas : true;
      const matchPlayground = filterKemudahan.playground ? t.kemudahan.playground : true;
      const matchParking = filterKemudahan.parking ? t.kemudahan.parking : true;
      const matchSurau = filterKemudahan.surau ? t.kemudahan.surau : true;

      return matchSearch && matchDaerah && matchJenis && matchTandas && matchPlayground && matchParking && matchSurau;
    });
  }, [tamanList, searchQuery, filterDaerah, filterJenis, filterKemudahan]);

  return (
    <div className="h-screen bg-gray-50 flex flex-col md:flex-row font-sans text-gray-800">
      
      {/* SIDEBAR */}
      <aside className="w-full md:w-64 md:fixed md:left-0 md:top-0 md:h-screen bg-emerald-800 text-white flex flex-col">
        <div className="p-6 flex items-center space-x-3 bg-emerald-900">
          <Trees className="w-8 h-8 text-emerald-400" />
          <h1 className="text-xl font-bold tracking-wide">eTaman</h1>
        </div>
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <button 
            onClick={() => setActiveTab('senarai')}
            className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-colors ${activeTab === 'senarai' ? 'bg-emerald-700' : 'hover:bg-emerald-700/50'}`}
          >
            <List className="w-5 h-5" /> <span>Senarai Taman</span>
          </button>
          <button 
            onClick={() => setActiveTab('laporan')}
            className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-colors ${activeTab === 'laporan' ? 'bg-emerald-700' : 'hover:bg-emerald-700/50'}`}
          >
            <BarChart3 className="w-5 h-5" /> <span>Laporan</span>
          </button>
        </nav>
        <div className="p-4 text-xs text-emerald-300/70 text-center">
          © 2026 Pingu
        </div>
      </aside>

      {/* KANDUNGAN UTAMA */}
      <main className="flex-1 md:ml-64 h-screen md:h-screen p-6 md:p-8 overflow-y-auto">
        
        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <Loader2 className="w-8 h-8 text-emerald-600 animate-spin mx-auto mb-2" />
              <p className="text-gray-600">Memuatkan data...</p>
            </div>
          </div>
        )}

        {/* MODUL 1 & 3: SENARAI DAN CARIAN */}
        {!loading && activeTab === 'senarai' && !isImporting && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <h2 className="text-2xl font-bold text-gray-800 border-b-4 border-emerald-500 pb-2">Senarai Taman</h2>
              <div className="flex gap-2 flex-wrap">
                <button onClick={() => { setEditingId(null); setViewingTaman(null); setActiveTab('borang'); }} className="flex items-center space-x-2 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition">
                  <Plus className="w-4 h-4" /> <span>Tambah Taman</span>
                </button>
                <button onClick={() => document.getElementById('import-file-input').click()} className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">
                  <Upload className="w-4 h-4" /> <span>Import Taman</span>
                </button>
                <input 
                  id="import-file-input" 
                  type="file" 
                  accept=".csv,.xlsx,.xls" 
                  onChange={handleImportFile}
                  className="hidden"
                />
                <button onClick={handleExportCSV} className="flex items-center space-x-2 bg-emerald-100 text-emerald-700 px-4 py-2 rounded-lg hover:bg-emerald-200 transition">
                  <Download className="w-4 h-4" /> <span>Eksport CSV</span>
                </button>
              </div>
            </div>

            {/* Ruangan Tapisan (Filter) */}
            <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                  <input 
                    type="text" 
                    placeholder="Cari nama atau lokasi..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
                <select 
                  value={filterDaerah} 
                  onChange={(e) => setFilterDaerah(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none bg-white"
                >
                  <option value="">Semua Daerah</option>
                  {SENARAI_DAERAH.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
                <select 
                  value={filterJenis} 
                  onChange={(e) => setFilterJenis(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none bg-white"
                >
                  <option value="">Semua Jenis Taman</option>
                  {JENIS_TAMAN.map(j => <option key={j} value={j}>{j}</option>)}
                </select>
              </div>

              {/* Tapisan Kemudahan */}
              <div className="flex flex-wrap items-center gap-4 pt-2 border-t">
                <span className="text-sm font-semibold text-gray-500 flex items-center"><Filter className="w-4 h-4 mr-1"/> Keperluan Kemudahan:</span>
                {Object.keys(filterKemudahan).map(key => (
                  <label key={key} className="flex items-center space-x-2 cursor-pointer text-sm bg-gray-50 px-3 py-1.5 rounded-full border hover:bg-emerald-50 transition">
                    <input 
                      type="checkbox" 
                      checked={filterKemudahan[key]}
                      onChange={(e) => setFilterKemudahan({...filterKemudahan, [key]: e.target.checked})}
                      className="rounded text-emerald-600 focus:ring-emerald-500"
                    />
                    <span className="capitalize">{key}</span>
                  </label>
                ))}
                {(searchQuery || filterDaerah || filterJenis || Object.values(filterKemudahan).some(Boolean)) && (
                  <button 
                    onClick={() => {
                      setSearchQuery(''); setFilterDaerah(''); setFilterJenis('');
                      setFilterKemudahan({tandas: false, playground: false, parking: false, surau: false});
                    }}
                    className="text-xs text-red-500 hover:underline ml-auto"
                  >
                    Reset Filter
                  </button>
                )}
              </div>
            </div>

            {/* Jadual Senarai */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 text-gray-600 text-sm uppercase tracking-wider border-b">
                      <th className="p-4 font-medium">Nama Taman</th>
                      <th className="p-4 font-medium">Daerah</th>
                      <th className="p-4 font-medium">Jenis</th>
                      <th className="p-4 font-medium text-center">Kemudahan Utama</th>
                      <th className="p-4 font-medium text-right">Tindakan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredTaman.length > 0 ? filteredTaman.map((taman) => (
                      <tr key={taman.id} className="hover:bg-emerald-50/30 transition-colors">
                        <td className="p-4">
                          <div className="font-semibold text-gray-800">{taman.nama}</div>
                          <div className="text-sm text-gray-500 truncate max-w-xs">{taman.lokasi}</div>
                        </td>
                        <td className="p-4 text-gray-600">{taman.daerah}</td>
                        <td className="p-4 text-gray-600">
                          <span className="bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full text-xs border border-blue-100">
                            {taman.jenis}
                          </span>
                        </td>
                        <td className="p-4 text-center">
                          <div className="flex justify-center gap-1 text-gray-400">
                            {taman.kemudahan.tandas && <span title="Tandas" className="text-emerald-600">🚽</span>}
                            {taman.kemudahan.playground && <span title="Playground" className="text-emerald-600">🛝</span>}
                            {taman.kemudahan.parking && <span title="Parking" className="text-emerald-600">🅿️</span>}
                            {taman.kemudahan.surau && <span title="Surau" className="text-emerald-600">🕌</span>}
                          </div>
                        </td>
                        <td className="p-4 text-right space-x-2">
                          <button onClick={() => handleViewProfil(taman)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition" title="Lihat Profil">
                            <Eye className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleEditTaman(taman)} className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg transition" title="Kemaskini">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDeleteTaman(taman.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition" title="Padam">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan="5" className="p-8 text-center text-gray-500">
                          Tiada taman dijumpai berdasarkan carian/tapisan anda.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* MODUL 1 & 2: BORANG TAMBAH / KEMASKINI */}
        {!loading && activeTab === 'borang' && (
          <BorangTaman 
            tamanSediaAda={viewingTaman} 
            onSave={handleSaveTaman} 
            onCancel={() => setActiveTab('senarai')} 
          />
        )}

        {/* IMPORT TAMAN PREVIEW */}
        {isImporting && (
          <ImportTamanPreview 
            importingTaman={importingTaman}
            setImportingTaman={setImportingTaman}
            onConfirm={handleConfirmImport}
            onCancel={() => {
              setIsImporting(false);
              setImportingTaman([]);
            }}
          />
        )}

        {/* MODUL 2: PROFIL TAMAN */}
        {!loading && activeTab === 'profil' && viewingTaman && (
          <ProfilTaman taman={viewingTaman} onBack={() => setActiveTab('senarai')} />
        )}

        {/* MODUL 3: LAPORAN & STATISTIK */}
        {!loading && activeTab === 'laporan' && (
          <LaporanStatistik tamanList={tamanList} />
        )}

      </main>

      {/* Tetingkap Pengesahan Padam (Delete Modal) */}
      {tamanToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white p-6 rounded-2xl shadow-xl max-w-sm w-full mx-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-center w-14 h-14 mx-auto mb-4 bg-red-100 rounded-full">
              <Trash2 className="w-7 h-7 text-red-600" />
            </div>
            <h3 className="text-xl font-bold text-center text-gray-800 mb-2">Sahkan Padaman</h3>
            <p className="text-center text-gray-600 mb-6">
              Adakah anda pasti untuk memadam rekod taman ini? Tindakan ini tidak boleh dipulihkan.
            </p>
            <div className="flex justify-center space-x-3">
              <button 
                onClick={() => setTamanToDelete(null)}
                className="px-5 py-2.5 text-gray-700 font-medium bg-gray-100 rounded-xl hover:bg-gray-200 transition"
              >
                Batal
              </button>
              <button 
                onClick={confirmDelete}
                className="px-5 py-2.5 text-white font-medium bg-red-600 rounded-xl hover:bg-red-700 transition shadow-md hover:shadow-lg"
              >
                Ya, Padam
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ==========================================
// KOMPONEN: BORANG TAMAN (MODUL 1 & 2 & AI)
// ==========================================
function BorangTaman({ tamanSediaAda, onSave, onCancel }) {
  const [formData, setFormData] = useState(tamanSediaAda || {
    nama: '', lokasi: '', daerah: '', keluasan: '', jenis: '', PBT: '',
    kemudahan: { tandas: false, playground: false, parking: false, surau: false },
    deskripsi: ''
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [uploadedImages, setUploadedImages] = useState(tamanSediaAda?.images || []);
  const [selectedMainCover, setSelectedMainCover] = useState(null);
  const [showMainCoverSelection, setShowMainCoverSelection] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckbox = (e) => {
    const { name, checked } = e.target;
    setFormData(prev => ({
      ...prev, kemudahan: { ...prev.kemudahan, [name]: checked }
    }));
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles(prev => [...prev, ...files]);
    
    // Create preview URLs
    const newPreviews = files.map(file => URL.createObjectURL(file));
    setPreviewUrls(prev => [...prev, ...newPreviews]);
  };

  const removeFile = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    setPreviewUrls(prev => prev.filter((_, i) => i !== index));
  };

  const removeUploadedImage = async (imageId) => {
    if (tamanSediaAda) {
      try {
        const response = await fetch(apiUrl(`/api/taman/${tamanSediaAda.id}/image/${imageId}/delete/`), {
          method: 'DELETE'
        });
        const result = await response.json();
        if (result.success) {
          setUploadedImages(uploadedImages.filter(img => img.id !== imageId));
        }
      } catch (error) {
        console.error('Error deleting image:', error);
        alert('Ralat semasa memadam gambar');
      }
    }
  };

  const generateAIDescription = async () => {
    if (!formData.nama || !formData.daerah) {
      alert("Sila isi sekurang-kurangnya Nama Taman dan Daerah sebelum menjana deskripsi.");
      return;
    }

    setIsGenerating(true);
    try {
      const fasiliti = Object.entries(formData.kemudahan)
        .filter(([_, isTrue]) => isTrue)
        .map(([key]) => key)
        .join(", ");
      
      const prompt = `Tulis satu perenggan deskripsi (sekitar 2-3 ayat) yang memukau dan profesional dalam Bahasa Melayu untuk sebuah profil taman. 
      Maklumat taman adalah seperti berikut:
      Nama: ${formData.nama}
      Lokasi: ${formData.lokasi || '-'}
      Daerah: ${formData.daerah}
      Jenis: ${formData.jenis}
      Kemudahan sedia ada: ${fasiliti || 'Tiada maklumat kemudahan'}.
      Jadikan ia kedengaran mengalu-alukan pengunjung untuk datang beriadah.`;

      const generatedText = await callGeminiAPI(prompt);
      setFormData(prev => ({ ...prev, deskripsi: generatedText.trim() }));
    } catch (error) {
      alert("Ralat semasa menjana deskripsi AI.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // First save the taman data
    try {
      const tamanId = tamanSediaAda?.id;
      if (tamanId) {
        // Update existing taman
        const response = await fetch(apiUrl(`/api/taman/${tamanId}/update/`), {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
        const result = await response.json();
        if (result.success && selectedFiles.length > 0) {
          // Upload new images if any
          await uploadImages(tamanId, null);
        } else if (result.success) {
          onSave(formData);
        }
      } else {
        // Create new taman
        const response = await fetch(apiUrl('/api/taman/create/'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
        const result = await response.json();
        if (result.success) {
          const newTamanId = result.id;
          if (selectedFiles.length > 0) {
            // For new taman with images, determine main cover
            if (selectedFiles.length === 1) {
              // Auto-set first and only image as main cover
              await uploadImages(newTamanId, 0);
            } else {
              // Show selection dialog for multiple images
              setShowMainCoverSelection(true);
              // Store data for later processing
              window.pendingUploadData = { tamanId: newTamanId };
            }
          } else {
            onSave(formData);
          }
        }
      }
    } catch (error) {
      console.error('Error in handleSubmit:', error);
      alert('Ralat semasa menyimpan data');
    }
  };

  const uploadImages = async (tamanId, mainCoverIndex) => {
    if (selectedFiles.length === 0) return;

    try {
      const formDataFile = new FormData();
      selectedFiles.forEach(file => {
        formDataFile.append('images', file);
      });

      const response = await fetch(apiUrl(`/api/taman/${tamanId}/upload-image/`), {
        method: 'POST',
        body: formDataFile
      });
      const result = await response.json();
      if (result.success) {
        // If auto main cover is needed (index provided and only 1 image)
        if (mainCoverIndex !== null && result.images && result.images.length > mainCoverIndex) {
          const mainImage = result.images[mainCoverIndex];
          try {
            const setCoverResponse = await fetch(apiUrl(`/api/taman/${tamanId}/image/${mainImage.id}/set-main-cover/`), {
              method: 'POST'
            });
            const setCoverResult = await setCoverResponse.json();
            if (setCoverResult.success) {
              // Don't call onSave here - taman is already created!
              // Just refresh and go back to senarai
              window.location.reload();
            }
          } catch (error) {
            console.error('Error setting main cover:', error);
            window.location.reload();
          }
        } else {
          // Don't call onSave here - taman is already created!
          // Just refresh and go back to senarai
          window.location.reload();
        }
      }
    } catch (error) {
      console.error('Error uploading images:', error);
      alert('Ralat semasa memuat naik gambar');
    }
  };

  const confirmMainCoverSelection = async () => {
    if (selectedMainCover === null) {
      alert('Sila pilih gambar untuk dijadikan utama');
      return;
    }

    const tamanId = window.pendingUploadData?.tamanId;
    if (tamanId) {
      await uploadImages(tamanId, selectedMainCover);
      setShowMainCoverSelection(false);
      setSelectedMainCover(null);
      delete window.pendingUploadData;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800 border-b-4 border-emerald-500 pb-2">
          {tamanSediaAda ? 'Kemaskini Maklumat Taman' : 'Daftar Taman Baru'}
        </h2>
        <button onClick={onCancel} className="text-gray-500 hover:text-gray-800">Kembali</button>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-6 md:p-8 rounded-xl shadow-sm border border-gray-100 space-y-8">
        {/* Seksyen Maklumat Asas */}
        <div>
          <h3 className="text-lg font-semibold text-emerald-800 mb-4 flex items-center"><MapPin className="w-5 h-5 mr-2"/> Maklumat Asas</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">Nama Taman <span className="text-red-500">*</span></label>
              <input required type="text" name="nama" value={formData.nama} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="Cth: Taman Botani" />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">Lokasi / Alamat Lengkap <span className="text-red-500">*</span></label>
              <input required type="text" name="lokasi" value={formData.lokasi} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="Cth: Jalan Tasek Utara" />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">Daerah <span className="text-red-500">*</span></label>
              <select required name="daerah" value={formData.daerah} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none bg-white">
                <option value="" disabled>Pilih Daerah</option>
                {SENARAI_DAERAH.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">Keluasan (Ekar)</label>
              <input type="number" step="0.01" name="keluasan" value={formData.keluasan} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="Cth: 15.5" />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">Jenis Taman <span className="text-red-500">*</span></label>
              <select required name="jenis" value={formData.jenis} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none bg-white">
                <option value="" disabled>Pilih Taman</option>
                {JENIS_TAMAN.map(j => <option key={j} value={j}>{j}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">PBT</label>
              <input type="text" name="PBT" value={formData.PBT} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="Cth: MBIP, MBJB" />
            </div>
          </div>
        </div>

        {/* Seksyen Kemudahan (Modul 2) */}
        <div className="pt-6 border-t border-gray-100">
          <h3 className="text-lg font-semibold text-emerald-800 mb-4 flex items-center"><Tent className="w-5 h-5 mr-2"/> Kemudahan Sedia Ada</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <label className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 cursor-pointer transition-all ${formData.kemudahan.tandas ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-gray-200 hover:border-emerald-300'}`}>
              <Baby className="w-8 h-8 mb-2 opacity-80" />
              <div className="flex items-center space-x-2">
                <input type="checkbox" name="tandas" checked={formData.kemudahan.tandas} onChange={handleCheckbox} className="w-4 h-4 text-emerald-600 focus:ring-emerald-500" />
                <span className="font-medium">Tandas</span>
              </div>
            </label>
            <label className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 cursor-pointer transition-all ${formData.kemudahan.playground ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-gray-200 hover:border-emerald-300'}`}>
              <Trees className="w-8 h-8 mb-2 opacity-80" />
              <div className="flex items-center space-x-2">
                <input type="checkbox" name="playground" checked={formData.kemudahan.playground} onChange={handleCheckbox} className="w-4 h-4 text-emerald-600 focus:ring-emerald-500" />
                <span className="font-medium">Taman Permainan</span>
              </div>
            </label>
            <label className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 cursor-pointer transition-all ${formData.kemudahan.parking ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-gray-200 hover:border-emerald-300'}`}>
              <Car className="w-8 h-8 mb-2 opacity-80" />
              <div className="flex items-center space-x-2">
                <input type="checkbox" name="parking" checked={formData.kemudahan.parking} onChange={handleCheckbox} className="w-4 h-4 text-emerald-600 focus:ring-emerald-500" />
                <span className="font-medium">Tempat Letak Kereta</span>
              </div>
            </label>
            <label className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 cursor-pointer transition-all ${formData.kemudahan.surau ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-gray-200 hover:border-emerald-300'}`}>
              <Home className="w-8 h-8 mb-2 opacity-80" />
              <div className="flex items-center space-x-2">
                <input type="checkbox" name="surau" checked={formData.kemudahan.surau} onChange={handleCheckbox} className="w-4 h-4 text-emerald-600 focus:ring-emerald-500" />
                <span className="font-medium">Surau / Tempat Ibadat</span>
              </div>
            </label>
          </div>
        </div>

        {/* Seksyen Deskripsi Taman dengan AI */}
        <div className="pt-6 border-t border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-emerald-800 flex items-center"><AlignLeft className="w-5 h-5 mr-2"/> Deskripsi Profil Taman</h3>
            {/* <button 
              type="button" 
              onClick={generateAIDescription}
              disabled={isGenerating}
              className="flex items-center space-x-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition text-sm font-medium disabled:opacity-50"
            >
              {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              <span>✨ Jana Automatik (AI)</span>
            </button> */}
          </div>
          <textarea 
            name="deskripsi" 
            value={formData.deskripsi} 
            onChange={handleChange} 
            rows="4" 
            className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-gray-700 bg-gray-50"
            placeholder="Taip maklumat taman..."
          />
        </div>

        {/* Seksyen Muat Naik Gambar */}
        <div className="pt-6 border-t border-gray-100">
          <h3 className="text-lg font-semibold text-emerald-800 mb-4 flex items-center"><Download className="w-5 h-5 mr-2"/> Muat Naik Gambar Taman</h3>
          
          {/* File Upload Input */}
          <div className="mb-6">
            <label className="block border-2 border-dashed border-emerald-300 rounded-xl p-8 text-center cursor-pointer hover:bg-emerald-50 transition">
              <input 
                type="file" 
                multiple 
                accept="image/*" 
                onChange={handleFileSelect} 
                className="hidden"
              />
              <div className="space-y-2">
                <Download className="w-8 h-8 text-emerald-600 mx-auto" />
                <p className="text-emerald-700 font-medium">Klik untuk memilih gambar atau seret gambar ke sini</p>
                <p className="text-sm text-gray-500">PNG, JPG, GIF sehingga 5MB setiap satu</p>
              </div>
            </label>
          </div>

          {/* Preview Gambar Baru */}
          {previewUrls.length > 0 && (
            <div className="mb-6">
              <h4 className="font-medium text-gray-700 mb-3">Gambar Baharu Untuk Muat Naik ({previewUrls.length})</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {previewUrls.map((url, index) => (
                  <div key={index} className="relative group">
                    <img src={url} alt={`Preview ${index}`} className="w-full h-32 object-cover rounded-lg border border-gray-200" />
                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Gambar Sedia Ada */}
          {uploadedImages.length > 0 && (
            <div>
              <h4 className="font-medium text-gray-700 mb-3">Gambar Sedia Ada ({uploadedImages.length})</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {uploadedImages.map((img) => (
                  <div key={img.id} className="relative group">
                    <img src={img.url} alt="Taman" className="w-full h-32 object-cover rounded-lg border-2" style={{borderColor: img.is_main_cover ? '#059669' : '#d1d5db'}} />
                    {img.is_main_cover && (
                      <div className="absolute top-1 left-1 bg-emerald-600 text-white px-2 py-1 rounded text-xs font-medium">
                        Utama
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => removeUploadedImage(img.id)}
                      className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="pt-6 border-t border-gray-100 flex justify-end space-x-3">
          <button type="button" onClick={onCancel} className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition">
            Batal
          </button>
          <button type="submit" className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition shadow-md">
            {tamanSediaAda ? 'Simpan Perubahan' : 'Daftar Taman'}
          </button>
        </div>
      </form>

      {/* Modal Pilih Gambar Utama */}
      {showMainCoverSelection && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-8 animate-in zoom-in-95 duration-200">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">Pilih Gambar Utama</h3>
            <p className="text-gray-600 mb-6">Anda telah memilih lebih dari satu gambar. Sila pilih gambar mana yang hendak dijadikan gambar utama taman ini.</p>

            <div className="grid grid-cols-3 gap-4 mb-6 max-h-96 overflow-y-auto">
              {previewUrls.map((url, index) => (
                <div
                  key={index}
                  onClick={() => setSelectedMainCover(index)}
                  className={`cursor-pointer relative rounded-lg overflow-hidden transition-all ${
                    selectedMainCover === index ? 'ring-4 ring-emerald-600 scale-105' : 'hover:scale-105'
                  }`}
                >
                  <img src={url} alt={`Pilihan ${index + 1}`} className="w-full h-24 object-cover" />
                  {selectedMainCover === index && (
                    <div className="absolute inset-0 bg-emerald-600/50 flex items-center justify-center">
                      <CheckSquare className="w-8 h-8 text-white" />
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => {
                  setShowMainCoverSelection(false);
                  setSelectedMainCover(null);
                  delete window.pendingUploadData;
                }}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={confirmMainCoverSelection}
                className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition shadow-md"
              >
                Pilih Sebagai Utama
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ==========================================
// KOMPONEN: PREVIEW IMPORT TAMAN
// ==========================================
function ImportTamanPreview({ importingTaman, setImportingTaman, onConfirm, onCancel }) {
  const [editingIndex, setEditingIndex] = useState(null);
  const [editFormData, setEditFormData] = useState(null);

  const getMainCoverIndexLabel = (taman) => {
    if (!taman.images || taman.images.length === 0) return 'Tiada gambar';
    if (taman.images.length === 1) return 'Auto: Gambar 1';
    if (taman.importMainCoverIndex === null || taman.importMainCoverIndex === undefined) return 'Belum dipilih';
    return `Dipilih: Gambar ${taman.importMainCoverIndex + 1}`;
  };

  const startEditing = (index) => {
    setEditingIndex(index);
    setEditFormData({ ...importingTaman[index] });
  };

  const saveEdit = () => {
    if (editingIndex !== null && editFormData) {
      const updated = [...importingTaman];
      updated[editingIndex] = editFormData;
      setImportingTaman(updated);
      setEditingIndex(null);
      setEditFormData(null);
    }
  };

  const cancelEdit = () => {
    setEditingIndex(null);
    setEditFormData(null);
  };

  const deleteTaman = (index) => {
    setImportingTaman(importingTaman.filter((_, i) => i !== index));
  };

  const addImagesToTaman = (index, files) => {
    const updated = [...importingTaman];
    const fileArray = Array.from(files);
    const previousCount = (updated[index].images || []).length;
    updated[index].images = [...(updated[index].images || []), ...fileArray];

    if (updated[index].images.length === 1) {
      updated[index].importMainCoverIndex = 0;
    } else if (updated[index].images.length > 1) {
      // Force explicit selection when there are multiple images.
      if (previousCount <= 1) {
        updated[index].importMainCoverIndex = null;
      }
      if (updated[index].importMainCoverIndex !== null && updated[index].importMainCoverIndex >= updated[index].images.length) {
        updated[index].importMainCoverIndex = null;
      }
      if (updated[index].importMainCoverIndex === undefined) {
        updated[index].importMainCoverIndex = null;
      }
    } else {
      updated[index].importMainCoverIndex = null;
    }

    setImportingTaman(updated);
  };

  const removeImageFromTaman = (tamanIndex, imageIndex) => {
    const updated = [...importingTaman];
    const currentMainCover = updated[tamanIndex].importMainCoverIndex;
    updated[tamanIndex].images = updated[tamanIndex].images.filter((_, i) => i !== imageIndex);

    if (updated[tamanIndex].images.length === 0) {
      updated[tamanIndex].importMainCoverIndex = null;
    } else if (updated[tamanIndex].images.length === 1) {
      updated[tamanIndex].importMainCoverIndex = 0;
    } else if (currentMainCover === imageIndex) {
      updated[tamanIndex].importMainCoverIndex = null;
    } else if (currentMainCover !== null && currentMainCover > imageIndex) {
      updated[tamanIndex].importMainCoverIndex = currentMainCover - 1;
    }

    setImportingTaman(updated);
  };

  const selectMainCoverForTaman = (tamanIndex, imageIndex) => {
    const updated = [...importingTaman];
    updated[tamanIndex].importMainCoverIndex = imageIndex;
    setImportingTaman(updated);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800 border-b-4 border-blue-500 pb-2">
          Preview Import Taman ({importingTaman.length})
        </h2>
        <button onClick={onCancel} className="text-gray-500 hover:text-gray-800">
          <X className="w-6 h-6" />
        </button>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-blue-900 font-medium">Review sebelum import</p>
          <p className="text-blue-800 text-sm">Anda boleh mengedit, memadam, atau menambah gambar untuk setiap taman sebelum mengimport. Klik butang "Kemaskini" untuk membuat perubahan.</p>
        </div>
      </div>

      <div className="grid gap-4">
        {importingTaman.map((taman, idx) => (
          <div key={taman.tempId} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition">
            {editingIndex === idx ? (
              // Edit Mode
              <div className="p-6 space-y-4">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Kemaskini Taman</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nama Taman *</label>
                    <input
                      type="text"
                      value={editFormData.nama}
                      onChange={(e) => setEditFormData({ ...editFormData, nama: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Lokasi</label>
                    <input
                      type="text"
                      value={editFormData.lokasi}
                      onChange={(e) => setEditFormData({ ...editFormData, lokasi: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Daerah</label>
                    <input
                      type="text"
                      value={editFormData.daerah}
                      onChange={(e) => setEditFormData({ ...editFormData, daerah: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Keluasan (Ekar)</label>
                    <input
                      type="text"
                      value={editFormData.keluasan}
                      onChange={(e) => setEditFormData({ ...editFormData, keluasan: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Jenis</label>
                    <input
                      type="text"
                      value={editFormData.jenis}
                      onChange={(e) => setEditFormData({ ...editFormData, jenis: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">PBT</label>
                    <input
                      type="text"
                      value={editFormData.PBT}
                      onChange={(e) => setEditFormData({ ...editFormData, PBT: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Kemudahan</label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {['tandas', 'playground', 'parking', 'surau'].map(facility => (
                      <label key={facility} className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={editFormData.kemudahan[facility]}
                          onChange={(e) => setEditFormData({
                            ...editFormData,
                            kemudahan: { ...editFormData.kemudahan, [facility]: e.target.checked }
                          })}
                          className="rounded text-blue-600"
                        />
                        <span className="text-sm text-gray-700 capitalize">{facility}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi</label>
                  <textarea
                    value={editFormData.deskripsi}
                    onChange={(e) => setEditFormData({ ...editFormData, deskripsi: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    rows="3"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    onClick={cancelEdit}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
                  >
                    Batal
                  </button>
                  <button
                    onClick={saveEdit}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                  >
                    Simpan
                  </button>
                </div>
              </div>
            ) : (
              // View Mode
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-800">{taman.nama}</h3>
                    <p className="text-sm text-gray-500">{taman.lokasi}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => startEditing(idx)}
                      className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg transition"
                      title="Kemaskini"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteTaman(idx)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                      title="Padam"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                  <div>
                    <p className="text-gray-500">Daerah</p>
                    <p className="font-medium text-gray-800">{taman.daerah}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Jenis</p>
                    <p className="font-medium text-gray-800">{taman.jenis}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Keluasan</p>
                    <p className="font-medium text-gray-800">{taman.keluasan} Ekar</p>
                  </div>
                  <div>
                    <p className="text-gray-500">PBT</p>
                    <p className="font-medium text-gray-800">{taman.PBT}</p>
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-sm text-gray-500 mb-2">Kemudahan</p>
                  <div className="flex gap-2">
                    {taman.kemudahan.tandas && <span title="Tandas" className="text-2xl">🚽</span>}
                    {taman.kemudahan.playground && <span title="Playground" className="text-2xl">🛝</span>}
                    {taman.kemudahan.parking && <span title="Parking" className="text-2xl">🅿️</span>}
                    {taman.kemudahan.surau && <span title="Surau" className="text-2xl">🕌</span>}
                  </div>
                </div>

                {taman.deskripsi && (
                  <div className="mb-4">
                    <p className="text-sm text-gray-500 mb-1">Deskripsi</p>
                    <p className="text-sm text-gray-700 line-clamp-2">{taman.deskripsi}</p>
                  </div>
                )}

                {/* Images Section */}
                <div className="border-t pt-4">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm font-medium text-gray-700">Gambar ({taman.images.length})</p>
                    <label className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full cursor-pointer hover:bg-blue-200 transition">
                      + Tambah Gambar
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={(e) => addImagesToTaman(idx, e.target.files)}
                        className="hidden"
                      />
                    </label>
                  </div>
                  <p className="text-xs text-gray-500 mb-2">Gambar utama: {getMainCoverIndexLabel(taman)}</p>
                  {taman.images.length > 0 ? (
                    <div className="grid grid-cols-4 md:grid-cols-6 gap-2">
                      {taman.images.map((img, imgIdx) => (
                        <div
                          key={imgIdx}
                          className={`relative group border-2 rounded-lg overflow-hidden ${
                            taman.importMainCoverIndex === imgIdx ? 'border-emerald-500' : 'border-transparent'
                          }`}
                        >
                          <img
                            src={URL.createObjectURL(img)}
                            alt={`Gambar ${imgIdx + 1}`}
                            className="w-full h-16 object-cover rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={() => selectMainCoverForTaman(idx, imgIdx)}
                            className={`absolute top-1 left-1 px-2 py-0.5 text-[10px] rounded-full ${
                              taman.importMainCoverIndex === imgIdx
                                ? 'bg-emerald-600 text-white'
                                : 'bg-white/90 text-gray-700 hover:bg-emerald-50'
                            }`}
                            title="Set gambar utama"
                          >
                            {taman.importMainCoverIndex === imgIdx ? 'Utama' : 'Jadi Utama'}
                          </button>
                          <button
                            type="button"
                            onClick={() => removeImageFromTaman(idx, imgIdx)}
                            className="absolute -top-2 -right-2 bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-gray-400 italic">Tiada gambar. Klik "Tambah Gambar" untuk menambah.</p>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="flex justify-end gap-3 sticky bottom-0 bg-white p-6 rounded-lg shadow-lg border-t">
        <button
          onClick={onCancel}
          className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
        >
          Batal
        </button>
        <button
          onClick={onConfirm}
          className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition shadow-md flex items-center gap-2"
        >
          <CheckSquare className="w-4 h-4" />
          Sahkan & Import ({importingTaman.length})
        </button>
      </div>
    </div>
  );
}

// ==========================================
// KOMPONEN: PROFIL TAMAN (MODUL 2)
// ==========================================
function ProfilTaman({ taman, onBack }) {
  const [viewingImage, setViewingImage] = useState(null);

  const setMainCover = async (imageId) => {
    try {
      const response = await fetch(apiUrl(`/api/taman/${taman.id}/image/${imageId}/set-main-cover/`), {
        method: 'POST'
      });
      const result = await response.json();
      if (result.success) {
        window.location.reload();
      }
    } catch (error) {
      console.error('Error setting main cover:', error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in zoom-in-95 duration-300">
      <button onClick={onBack} className="text-emerald-600 hover:text-emerald-800 font-medium flex items-center mb-4">
        &larr; Kembali
      </button>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Header Profil */}
        <div className="bg-gradient-to-r from-emerald-700 to-emerald-500 p-8 text-white relative overflow-hidden">
          <Trees className="absolute -right-10 -bottom-10 w-64 h-64 opacity-10 text-emerald-900" />
          <div className="relative z-10">
            <span className="inline-block px-3 py-1 bg-white/20 rounded-full text-xs font-semibold tracking-wider uppercase mb-3 backdrop-blur-sm">
              {taman.jenis}
            </span>
            <h2 className="text-3xl md:text-4xl font-bold mb-2">{taman.nama}</h2>
            <div className="flex items-center text-emerald-50 space-x-4 text-sm md:text-base">
              <span className="flex items-center"><MapPin className="w-4 h-4 mr-1" /> {taman.daerah}</span>
              <span className="flex items-center"><Ruler className="w-4 h-4 mr-1" /> {taman.keluasan || 'N/A'} Ekar</span>
            </div>
          </div>
        </div>

        <div className="p-8 space-y-8">
          {/* Gambar Taman */}
          {taman.images && taman.images.length > 0 && (
            <div>
              <h3 className="text-xl font-bold text-gray-800 border-b pb-2 mb-4">Galeri Taman</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {taman.images.map((img) => (
                  <div 
                    key={img.id} 
                    onClick={() => setViewingImage(img)}
                    className="relative cursor-pointer group"
                  >
                    <img 
                      src={img.url} 
                      alt={img.caption} 
                      className="w-full h-48 object-cover rounded-lg border-4 group-hover:opacity-80 transition"
                      style={{borderColor: img.is_main_cover ? '#059669' : '#d1d5db'}}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Deskripsi (AI or Manual) */}
          {taman.deskripsi && (
            <div className="bg-emerald-50/50 p-6 rounded-xl border border-emerald-100">
              <p className="text-gray-700 leading-relaxed text-lg">{taman.deskripsi}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {/* Maklumat Lengkap */}
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-gray-800 border-b pb-2">Maklumat Terperinci</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Lokasi Penuh</p>
                  <p className="font-medium text-gray-800 bg-gray-50 p-3 rounded-lg border border-gray-100">{taman.lokasi}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">PBT</p>
                    <p className="font-medium text-gray-800">{taman.PBT || 'Tidak dinyatakan'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">ID Pendaftaran</p>
                    <p className="font-medium text-gray-800 text-sm font-mono bg-gray-100 px-2 py-1 rounded inline-block">TMN-{taman.id}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Status Kemudahan */}
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-gray-800 border-b pb-2">Status Kemudahan</h3>
              <ul className="space-y-3">
                <li className="flex items-center justify-between p-3 rounded-lg bg-gray-50 border border-gray-100">
                  <div className="flex items-center space-x-3 text-gray-700">
                    <Baby className="w-5 h-5 text-emerald-600" />
                    <span className="font-medium">Tandas Awam</span>
                  </div>
                  {taman.kemudahan.tandas ? <CheckSquare className="text-emerald-500 w-5 h-5" /> : <XSquare className="text-red-400 w-5 h-5" />}
                </li>
                <li className="flex items-center justify-between p-3 rounded-lg bg-gray-50 border border-gray-100">
                  <div className="flex items-center space-x-3 text-gray-700">
                    <Trees className="w-5 h-5 text-emerald-600" />
                    <span className="font-medium">Taman Permainan</span>
                  </div>
                  {taman.kemudahan.playground ? <CheckSquare className="text-emerald-500 w-5 h-5" /> : <XSquare className="text-red-400 w-5 h-5" />}
                </li>
                <li className="flex items-center justify-between p-3 rounded-lg bg-gray-50 border border-gray-100">
                  <div className="flex items-center space-x-3 text-gray-700">
                    <Car className="w-5 h-5 text-emerald-600" />
                    <span className="font-medium">Tempat Letak Kereta</span>
                  </div>
                  {taman.kemudahan.parking ? <CheckSquare className="text-emerald-500 w-5 h-5" /> : <XSquare className="text-red-400 w-5 h-5" />}
                </li>
                <li className="flex items-center justify-between p-3 rounded-lg bg-gray-50 border border-gray-100">
                  <div className="flex items-center space-x-3 text-gray-700">
                    <Home className="w-5 h-5 text-emerald-600" />
                    <span className="font-medium">Surau</span>
                  </div>
                  {taman.kemudahan.surau ? <CheckSquare className="text-emerald-500 w-5 h-5" /> : <XSquare className="text-red-400 w-5 h-5" />}
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Gambar Penuh */}
      {viewingImage && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="relative max-w-4xl w-full animate-in zoom-in-95 duration-200">
            {/* Gambar */}
            <img 
              src={viewingImage.url} 
              alt={viewingImage.caption} 
              className="w-full h-auto rounded-xl shadow-2xl object-contain max-h-[85vh]"
            />

            {/* Tombol Tutup */}
            <button
              onClick={() => setViewingImage(null)}
              className="absolute top-4 right-4 bg-white text-gray-800 p-2 rounded-full hover:bg-gray-100 transition shadow-lg"
              title="Tutup"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Tombol Set Main Cover (jika bukan main cover) */}
            {!viewingImage.is_main_cover && (
              <button
                onClick={() => {
                  setMainCover(viewingImage.id);
                  setViewingImage(null);
                }}
                className="absolute top-4 left-4 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition shadow-lg font-medium text-sm flex items-center"
                title="Tetapkan Gambar Utama"
              >
                <CheckSquare className="w-5 h-5 mr-2" />
                Tetapkan Utama
              </button>
            )}

            {/* Badge Utama (jika sudah main cover) */}
            {viewingImage.is_main_cover && (
              <div className="absolute top-4 left-4 bg-emerald-600 text-white px-4 py-2 rounded-lg shadow-lg font-medium text-sm flex items-center">
                <CheckSquare className="w-5 h-5 mr-2" />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ==========================================
// KOMPONEN: LAPORAN & STATISTIK (MODUL 3 + AI)
// ==========================================
function LaporanStatistik({ tamanList }) {
  const [aiInsights, setAiInsights] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Pengiraan Statistik
  const jumlahTaman = tamanList.length;
  const jumlahKeluasan = tamanList.reduce((acc, curr) => acc + (parseFloat(curr.keluasan) || 0), 0);
  
  // Kiraan mengikut Daerah
  const taburanDaerah = useMemo(() => {
    const counts = {};
    tamanList.forEach(t => {
      counts[t.daerah] = (counts[t.daerah] || 0) + 1;
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }, [tamanList]);

  // Kiraan mengikut Jenis
  const taburanJenis = useMemo(() => {
    const counts = {};
    tamanList.forEach(t => {
      counts[t.jenis] = (counts[t.jenis] || 0) + 1;
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }, [tamanList]);

  const generateAIInsights = async () => {
    setIsAnalyzing(true);
    try {
      // Sediakan ringkasan data untuk AI
      const summaryData = {
        jumlahTaman,
        jumlahKeluasan,
        taburanIkutDaerah: Object.fromEntries(taburanDaerah),
        taburanIkutJenis: Object.fromEntries(taburanJenis),
        senaraiTaman: tamanList.map(t => ({
          nama: t.nama, daerah: t.daerah, tandas: t.kemudahan.tandas, surau: t.kemudahan.surau
        }))
      };

      const prompt = `Sebagai seorang perunding pakar perancangan bandar dan pengurusan taman, sila analisis data taman berikut: 
      ${JSON.stringify(summaryData)}
      
      Berikan 3 pemerhatian utama atau cadangan strategik yang padat dalam Bahasa Melayu untuk pihak pengurusan bagi meningkatkan kualiti taman-taman ini. 
      Formatkan jawapan anda dalam bentuk "bullet points" (*). Jangan berikan pengenalan yang panjang, terus kepada isi penting.`;

      const insights = await callGeminiAPI(prompt);
      setAiInsights(insights);
    } catch (error) {
      alert("Gagal menjana analisis AI.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <h2 className="text-2xl font-bold text-gray-800 border-b-4 border-emerald-500 pb-2 inline-block">Laporan & Analitik Data</h2>
      
      {/* Kad Ringkasan */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-l-4 border-l-emerald-500 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500 mb-1">Jumlah Keseluruhan Taman</p>
            <h3 className="text-3xl font-bold text-gray-800">{jumlahTaman}</h3>
          </div>
          <Trees className="w-12 h-12 text-emerald-100" />
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-l-4 border-l-blue-500 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500 mb-1">Jumlah Keluasan (Ekar)</p>
            <h3 className="text-3xl font-bold text-gray-800">{jumlahKeluasan.toFixed(2)}</h3>
          </div>
          <Map className="w-12 h-12 text-blue-100" />
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-l-4 border-l-amber-500 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500 mb-1">Daerah Tertinggi</p>
            <h3 className="text-xl font-bold text-gray-800">{taburanDaerah.length > 0 ? taburanDaerah[0][0] : 'Tiada'}</h3>
            <p className="text-sm text-gray-500">{taburanDaerah.length > 0 ? `${taburanDaerah[0][1]} Taman` : ''}</p>
          </div>
          <MapPin className="w-12 h-12 text-amber-100" />
        </div>
      </div>

      

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Carta Bar Mudah: Taburan Mengikut Daerah */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 mb-6">Bilangan Taman Mengikut Daerah</h3>
          <div className="space-y-4">
            {taburanDaerah.map(([daerah, count]) => {
              const peratus = (count / jumlahTaman) * 100;
              return (
                <div key={daerah}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-gray-700">{daerah}</span>
                    <span className="text-gray-500">{count} taman ({peratus.toFixed(1)}%)</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2.5">
                    <div className="bg-emerald-500 h-2.5 rounded-full" style={{ width: `${peratus}%` }}></div>
                  </div>
                </div>
              );
            })}
            {taburanDaerah.length === 0 && <p className="text-gray-400 text-center py-4">Tiada data direkodkan.</p>}
          </div>
        </div>

        {/* Taburan Mengikut Jenis */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 mb-6">Pecahan Mengikut Jenis Taman</h3>
          <div className="space-y-4">
            {taburanJenis.map(([jenis, count]) => {
              const peratus = (count / jumlahTaman) * 100;
              return (
                <div key={jenis} className="flex items-center p-3 hover:bg-gray-50 rounded-lg transition border border-transparent hover:border-gray-100">
                  <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mr-4">
                    <Trees className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-800">{jenis}</h4>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-bold text-gray-800">{count}</div>
                  </div>
                </div>
              );
            })}
            {taburanJenis.length === 0 && <p className="text-gray-400 text-center py-4">Tiada data direkodkan.</p>}
          </div>
        </div>
      </div>

    </div>
  );
}