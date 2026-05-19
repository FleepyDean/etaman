import React, { useState, useMemo, useEffect } from 'react';
import {
    Trees, Plus, List, BarChart3, Search, Filter,
    Edit, Trash2, Eye, MapPin, Map, Ruler, CheckSquare,
    XSquare, Download, Car, Tent, Home, Baby,
    Sparkles, Bot, Loader2, AlignLeft, X, Upload, AlertCircle, ArrowLeft,
    Building2, Check, XIcon, Toilet, ParkingSquare, PlayCircle,
    TreePineIcon
} from 'lucide-react';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import SystemAdmin from './SystemAdmin';

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
const JENIS_TAMAN = ['Lot Permainan', 'Padang Permainan', 'Taman Kejiranan', 'Taman Tempatan', 'Taman Bandaran', 'Taman Wilayah', 'Taman Nasional'];

// source: https://jkt.kpkt.gov.my/data-pbt-senarai_pbt/
const SENARAI_PBT = [
    { code: 'MBJB', nama: 'Majlis Bandaraya Johor Bahru', fullName: 'Majlis Bandaraya Johor Bahru (MBJB)' },
    { code: 'MBIP', nama: 'Majlis Bandaraya Iskandar Puteri', fullName: 'Majlis Bandaraya Iskandar Puteri (MBIP)' },
    { code: 'MBPG', nama: 'Majlis Bandaraya Pasir Gudang', fullName: 'Majlis Bandaraya Pasir Gudang (MBPG)' },
    { code: 'MPBP', nama: 'Majlis Perbandaran Batu Pahat', fullName: 'Majlis Perbandaran Batu Pahat (MPBP)' },
    { code: 'MPKluang', nama: 'Majlis Perbandaran Kluang', fullName: 'Majlis Perbandaran Kluang (MPKluang)' },
    { code: 'MPMuar', nama: 'Majlis Perbandaran Muar', fullName: 'Majlis Perbandaran Muar (MPMuar)' },
    { code: 'MPKulai', nama: 'Majlis Perbandaran Kulai', fullName: 'Majlis Perbandaran Kulai (MPKulai)' },
    { code: 'MPSegamat', nama: 'Majlis Perbandaran Segamat', fullName: 'Majlis Perbandaran Segamat (MPSegamat)' },
    { code: 'MPPengerang', nama: 'Majlis Perbandaran Pengerang', fullName: 'Majlis Perbandaran Pengerang (MPPengerang)' },
    { code: 'MPPn', nama: 'Majlis Perbandaran Pontian', fullName: 'Majlis Perbandaran Pontian (MPPn)' },
    { code: 'MDKT', nama: 'Majlis Daerah Kota Tinggi', fullName: 'Majlis Daerah Kota Tinggi (MDKT)' },
    { code: 'MDLabis', nama: 'Majlis Daerah Labis', fullName: 'Majlis Daerah Labis (MDLabis)' },
    { code: 'MDMersing', nama: 'Majlis Daerah Mersing', fullName: 'Majlis Daerah Mersing (MDMersing)' },
    { code: 'MDSR', nama: 'Majlis Daerah Simpang Renggam', fullName: 'Majlis Daerah Simpang Renggam (MDSR)' },
    { code: 'MDTangkak', nama: 'Majlis Daerah Tangkak', fullName: 'Majlis Daerah Tangkak (MDTangkak)' },
    { code: 'MDYP', nama: 'Majlis Daerah Yong Peng', fullName: 'Majlis Daerah Yong Peng (MDYP)' }
];

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
    const [filterPBT, setFilterPBT] = useState('');
    const [filterKemudahan, setFilterKemudahan] = useState({
        tandas: false, playground: false, parking: false, surau: false
    });

    // Import State
    const [isImporting, setIsImporting] = useState(false);
    const [importingTaman, setImportingTaman] = useState([]);

    // Bulk Selection State
    const [selectedIds, setSelectedIds] = useState([]);
    const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);

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

    const handleBulkDelete = async () => {
        try {
            await Promise.all(selectedIds.map(id =>
                fetch(apiUrl(`/api/taman/${id}/delete/`), { method: 'DELETE' })
            ));
            setTamanList(tamanList.filter(t => !selectedIds.includes(t.id)));
            setSelectedIds([]);
            setShowBulkDeleteModal(false);
        } catch (error) {
            console.error('Error deleting taman:', error);
            alert('Ralat semasa memadam data taman');
        }
    };

    const toggleSelectAll = (filteredList) => {
        const allIds = filteredList.map(t => t.id);
        const allSelected = allIds.every(id => selectedIds.includes(id));
        setSelectedIds(allSelected ? selectedIds.filter(id => !allIds.includes(id)) : [...new Set([...selectedIds, ...allIds])]);
    };

    const toggleSelectOne = (id) => {
        setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
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
            const matchPBT = filterPBT ? (t.PBT === filterPBT || t.PBT === SENARAI_PBT.find(p => p.fullName === filterPBT)?.code) : true;

            const matchTandas = filterKemudahan.tandas ? t.kemudahan.tandas : true;
            const matchPlayground = filterKemudahan.playground ? t.kemudahan.playground : true;
            const matchParking = filterKemudahan.parking ? t.kemudahan.parking : true;
            const matchSurau = filterKemudahan.surau ? t.kemudahan.surau : true;

            return matchSearch && matchDaerah && matchJenis && matchPBT && matchTandas && matchPlayground && matchParking && matchSurau;
        });
    }, [tamanList, searchQuery, filterDaerah, filterJenis, filterPBT, filterKemudahan]);

    return (
        <div className="h-screen bg-slate-50 flex flex-col md:flex-row font-sans text-slate-800">

            {/* SIDEBAR */}
            <aside className="w-full md:w-64 md:fixed md:left-0 md:top-0 md:h-screen bg-slate-900 text-white flex flex-col border-r border-slate-800">
                <div className="p-6 flex items-center space-x-3 bg-slate-950 border-b border-slate-800">
                    <TreePineIcon className="w-7 h-7 text-blue-400" />
                    <div>
                        <h1 className="text-lg font-semibold tracking-wide">eTaman</h1>
                        <p className="text-[10px] text-slate-400 uppercase tracking-wider">Sistem Pengurusan</p>
                    </div>
                </div>
                <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
                    <button
                        onClick={() => setActiveTab('senarai')}
                        className={`w-full flex items-center space-x-3 px-4 py-3 text-sm transition-colors ${activeTab === 'senarai' ? 'bg-blue-900/30 text-blue-100 border-l-2 border-blue-500' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'}`}
                    >
                        <List className="w-4 h-4" /> <span>Senarai Taman</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('laporan')}
                        className={`w-full flex items-center space-x-3 px-4 py-3 text-sm transition-colors ${activeTab === 'laporan' ? 'bg-blue-900/30 text-blue-100 border-l-2 border-blue-500' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'}`}
                    >
                        <BarChart3 className="w-4 h-4" /> <span>Laporan & Analitik</span>
                    </button>
                </nav>
                <div className="p-4 text-[10px] text-slate-500 text-center border-t border-slate-800">
                    HAK CIPTA © 2026<br />JABATAN PERANCANGAN BANDAR
                </div>
            </aside>

            {/* KANDUNGAN UTAMA */}
            <main className="flex-1 md:ml-64 h-screen md:h-screen p-6 md:p-10 overflow-y-auto">

                {/* Loading State */}
                {loading && (
                    <div className="flex items-center justify-center h-64">
                        <div className="text-center">
                            <Loader2 className="w-6 h-6 text-blue-700 animate-spin mx-auto mb-3" />
                            <p className="text-slate-500 text-sm uppercase tracking-wide">Memuatkan data</p>
                        </div>
                    </div>
                )}

                {/* MODUL 1 & 3: SENARAI DAN CARIAN */}
                {!loading && activeTab === 'senarai' && !isImporting && (
                    <div className="space-y-8">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 border-b border-slate-200">
                            <div>
                                <h2 className="text-xl font-semibold text-slate-900 tracking-tight">SENARAI TAMAN</h2>
                                <p className="text-sm text-slate-500 mt-1">Pengurusan rekod taman rekreasi dan awam</p>
                            </div>
                            <div className="flex gap-3">
                                <button onClick={() => { setEditingId(null); setViewingTaman(null); setActiveTab('borang'); }} className="flex items-center space-x-2 bg-blue-700 text-white px-4 py-2 text-sm font-medium hover:bg-blue-800 transition-colors">
                                    <Plus className="w-4 h-4" /> <span>Tambah Rekod</span>
                                </button>
                                <button onClick={() => document.getElementById('import-file-input').click()} className="flex items-center space-x-2 bg-slate-700 text-white px-4 py-2 text-sm font-medium hover:bg-slate-800 transition-colors">
                                    <Upload className="w-4 h-4" /> <span>Import</span>
                                </button>
                                <input
                                    id="import-file-input"
                                    type="file"
                                    accept=".csv,.xlsx,.xls"
                                    onChange={handleImportFile}
                                    className="hidden"
                                />
                                <button onClick={handleExportCSV} className="flex items-center space-x-2 bg-white text-slate-700 border border-slate-300 px-4 py-2 text-sm font-medium hover:bg-slate-50 transition-colors">
                                    <Download className="w-4 h-4" /> <span>Eksport</span>
                                </button>
                            </div>
                        </div>

                        {/* Ruangan Tapisan (Filter) */}
                        <div className="bg-white p-5 border border-slate-200 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div className="relative">
                                    <Search className="absolute left-3 top-2.5 text-slate-400 w-4 h-4" />
                                    <input
                                        type="text"
                                        placeholder="Cari nama atau lokasi..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full pl-9 pr-4 py-2 border border-slate-300 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                    />
                                </div>
                                <select
                                    value={filterDaerah}
                                    onChange={(e) => setFilterDaerah(e.target.value)}
                                    className="w-full px-3 py-2 border border-slate-300 text-sm focus:outline-none focus:border-blue-500 bg-white"
                                >
                                    <option value="">Semua Daerah</option>
                                    {SENARAI_DAERAH.map(d => <option key={d} value={d}>{d}</option>)}
                                </select>
                                <select
                                    value={filterJenis}
                                    onChange={(e) => setFilterJenis(e.target.value)}
                                    className="w-full px-3 py-2 border border-slate-300 text-sm focus:outline-none focus:border-blue-500 bg-white"
                                >
                                    <option value="">Semua Jenis Taman</option>
                                    {JENIS_TAMAN.map(j => <option key={j} value={j}>{j}</option>)}
                                </select>
                                <select
                                    value={filterPBT}
                                    onChange={(e) => setFilterPBT(e.target.value)}
                                    className="w-full px-3 py-2 border border-slate-300 text-sm focus:outline-none focus:border-blue-500 bg-white"
                                >
                                    <option value="">Semua PBT</option>
                                    {SENARAI_PBT.map(pbt => <option key={pbt.code} value={pbt.fullName}>{pbt.fullName}</option>)}
                                </select>
                            </div>

                            {/* Tapisan Kemudahan */}
                            <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-slate-100">
                                <span className="text-xs font-medium text-slate-500 uppercase tracking-wider flex items-center"><Filter className="w-3 h-3 mr-1" /> Kemudahan:</span>
                                {Object.keys(filterKemudahan).map(key => (
                                    <label key={key} className="flex items-center space-x-2 cursor-pointer text-sm bg-slate-50 px-3 py-1.5 border border-slate-200 hover:bg-slate-100 transition">
                                        <input
                                            type="checkbox"
                                            checked={filterKemudahan[key]}
                                            onChange={(e) => setFilterKemudahan({ ...filterKemudahan, [key]: e.target.checked })}
                                            className="rounded-sm text-blue-700 focus:ring-blue-500"
                                        />
                                        <span className="capitalize text-slate-600">{key}</span>
                                    </label>
                                ))}
                                {(searchQuery || filterDaerah || filterJenis || filterPBT || Object.values(filterKemudahan).some(Boolean)) && (
                                    <button
                                        onClick={() => {
                                            setSearchQuery(''); setFilterDaerah(''); setFilterJenis(''); setFilterPBT('');
                                            setFilterKemudahan({ tandas: false, playground: false, parking: false, surau: false });
                                        }}
                                        className="text-xs text-blue-600 hover:text-blue-800 font-medium ml-auto"
                                    >
                                        Reset Tapisan
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Bulk Action Bar */}
                        {selectedIds.length > 0 && (
                            <div className="flex items-center justify-between bg-blue-700 text-white px-5 py-3">
                                <span className="text-sm font-medium">{selectedIds.length} rekod dipilih</span>
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={() => setSelectedIds([])}
                                        className="text-sm text-blue-200 hover:text-white transition-colors"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        onClick={() => setShowBulkDeleteModal(true)}
                                        className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-1.5 text-sm font-medium transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                        Padam
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Jadual Senarai */}
                        <div className="bg-white border border-slate-200 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-slate-100 text-slate-600 text-xs uppercase tracking-wider border-b border-slate-200">
                                            <th className="p-4 w-10">
                                                <input
                                                    type="checkbox"
                                                    checked={filteredTaman.length > 0 && filteredTaman.every(t => selectedIds.includes(t.id))}
                                                    onChange={() => toggleSelectAll(filteredTaman)}
                                                    className="w-4 h-4 text-blue-600 border-slate-300 focus:ring-blue-500"
                                                    title="Pilih Semua"
                                                />
                                            </th>
                                            <th className="p-4 font-semibold">Nama Taman</th>
                                            <th className="p-4 font-semibold">PBT</th>
                                            <th className="p-4 font-semibold">Daerah</th>
                                            <th className="p-4 font-semibold">Jenis</th>
                                            <th className="p-4 font-semibold text-center">Kemudahan</th>
                                            <th className="p-4 font-semibold text-right">Tindakan</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {filteredTaman.length > 0 ? filteredTaman.map((taman) => (
                                            <tr key={taman.id} className={`hover:bg-slate-50 transition-colors ${selectedIds.includes(taman.id) ? 'bg-blue-50' : ''}`}>
                                                <td className="p-4">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedIds.includes(taman.id)}
                                                        onChange={() => toggleSelectOne(taman.id)}
                                                        className="w-4 h-4 text-blue-600 border-slate-300 focus:ring-blue-500"
                                                    />
                                                </td>
                                                <td className="p-4">
                                                    <div className="font-medium text-slate-900">{taman.nama}</div>
                                                    <div className="text-sm text-slate-500 truncate max-w-xs">{taman.lokasi}</div>
                                                </td>
                                                <td className="p-4">
                                                    <span className="text-slate-600 text-xs bg-slate-50 border border-slate-200 px-2 py-1">
                                                        {(taman.PBT && SENARAI_PBT.find(p => p.fullName === taman.PBT)?.code) || taman.PBT || '-'}
                                                    </span>
                                                </td>
                                                <td className="p-4 text-slate-600 text-sm">{taman.daerah}</td>
                                                <td className="p-4">
                                                    <span className="bg-slate-100 text-slate-700 px-2 py-1 text-xs font-medium border border-slate-200">
                                                        {taman.jenis}
                                                    </span>
                                                </td>
                                                <td className="p-4 text-center">
                                                    <div className="flex justify-center gap-2">
                                                        {taman.kemudahan.tandas && <Toilet className="w-4 h-4 text-blue-600" title="Tandas" />}
                                                        {taman.kemudahan.playground && <PlayCircle className="w-4 h-4 text-blue-600" title="Taman Permainan" />}
                                                        {taman.kemudahan.parking && <ParkingSquare className="w-4 h-4 text-blue-600" title="Tempat Letak Kereta" />}
                                                        {taman.kemudahan.surau && <Building2 className="w-4 h-4 text-blue-600" title="Surau" />}
                                                    </div>
                                                </td>
                                                <td className="p-4 text-right">
                                                    <div className="flex justify-end gap-1">
                                                        <button onClick={() => handleViewProfil(taman)} className="p-2 text-blue-700 hover:bg-blue-50 transition" title="Lihat Profil">
                                                            <Eye className="w-4 h-4" />
                                                        </button>
                                                        <button onClick={() => handleEditTaman(taman)} className="p-2 text-slate-600 hover:bg-slate-100 transition" title="Kemaskini">
                                                            <Edit className="w-4 h-4" />
                                                        </button>
                                                        <button onClick={() => handleDeleteTaman(taman.id)} className="p-2 text-red-600 hover:bg-red-50 transition" title="Padam">
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        )) : (
                                            <tr>
                                                <td colSpan="7" className="p-8 text-center text-slate-500 text-sm">
                                                    Tiada rekod dijumpai.
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

            {/* Bulk Delete Confirmation Modal */}
            {showBulkDeleteModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="bg-white p-6 shadow-xl max-w-sm w-full mx-4">
                        <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-red-100">
                            <Trash2 className="w-6 h-6 text-red-600" />
                        </div>
                        <h3 className="text-lg font-semibold text-center text-slate-900 mb-2">Sahkan Padaman Banyak</h3>
                        <p className="text-center text-slate-600 text-sm mb-6">
                            Anda akan memadam <span className="font-semibold text-red-600">{selectedIds.length} rekod taman</span>. Tindakan ini tidak boleh dipulihkan.
                        </p>
                        <div className="flex justify-center space-x-3">
                            <button
                                onClick={() => setShowBulkDeleteModal(false)}
                                className="px-5 py-2 text-slate-700 font-medium bg-slate-100 hover:bg-slate-200 transition-colors"
                            >
                                Batal
                            </button>
                            <button
                                onClick={handleBulkDelete}
                                className="px-5 py-2 text-white font-medium bg-red-600 hover:bg-red-700 transition-colors"
                            >
                                Padam {selectedIds.length} Rekod
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Tetingkap Pengesahan Padam (Delete Modal) */}
            {tamanToDelete && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="bg-white p-6 shadow-xl max-w-sm w-full mx-4">
                        <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-red-100">
                            <Trash2 className="w-6 h-6 text-red-600" />
                        </div>
                        <h3 className="text-lg font-semibold text-center text-slate-900 mb-2">Sahkan Padaman</h3>
                        <p className="text-center text-slate-600 text-sm mb-6">
                            Adakah anda pasti untuk memadam rekod taman ini? Tindakan ini tidak boleh dipulihkan.
                        </p>
                        <div className="flex justify-center space-x-3">
                            <button
                                onClick={() => setTamanToDelete(null)}
                                className="px-5 py-2 text-slate-700 font-medium bg-slate-100 hover:bg-slate-200 transition-colors"
                            >
                                Batal
                            </button>
                            <button
                                onClick={confirmDelete}
                                className="px-5 py-2 text-white font-medium bg-red-600 hover:bg-red-700 transition-colors"
                            >
                                Padam
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
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
                <div>
                    <h2 className="text-xl font-semibold text-slate-900 tracking-tight">
                        {tamanSediaAda ? 'KEMASKINI REKOD TAMAN' : 'DAFTAR TAMAN BARU'}
                    </h2>
                    <p className="text-sm text-slate-500 mt-1">
                        {tamanSediaAda ? 'Pinda maklumat sedia ada' : 'Isi maklumat taman baharu'}
                    </p>
                </div>
                <button onClick={onCancel} className="text-slate-500 hover:text-slate-800 text-sm font-medium">Kembali</button>
            </div>

            <form onSubmit={handleSubmit} className="bg-white p-6 md:p-8 border border-slate-200 space-y-8">
                {/* Seksyen Maklumat Asas */}
                <div>
                    <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4 flex items-center">
                        <MapPin className="w-4 h-4 mr-2 text-blue-600" /> Maklumat Asas
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-slate-700">Nama Taman <span className="text-red-500">*</span></label>
                            <input required type="text" name="nama" value={formData.nama} onChange={handleChange} className="w-full px-4 py-2 border border-slate-300 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" placeholder="Cth: Taman Botani" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-slate-700">Lokasi / Alamat Lengkap <span className="text-red-500">*</span></label>
                            <input required type="text" name="lokasi" value={formData.lokasi} onChange={handleChange} className="w-full px-4 py-2 border border-slate-300 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" placeholder="Cth: Jalan Tasek Utara" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-slate-700">Daerah <span className="text-red-500">*</span></label>
                            <select required name="daerah" value={formData.daerah} onChange={handleChange} className="w-full px-4 py-2 border border-slate-300 focus:outline-none focus:border-blue-500 bg-white">
                                <option value="" disabled>Pilih Daerah</option>
                                {SENARAI_DAERAH.map(d => <option key={d} value={d}>{d}</option>)}
                            </select>
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-slate-700">Keluasan (Ekar)</label>
                            <input type="number" step="0.01" name="keluasan" value={formData.keluasan} onChange={handleChange} className="w-full px-4 py-2 border border-slate-300 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" placeholder="Cth: 15.5" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-slate-700">Jenis Taman <span className="text-red-500">*</span></label>
                            <select required name="jenis" value={formData.jenis} onChange={handleChange} className="w-full px-4 py-2 border border-slate-300 focus:outline-none focus:border-blue-500 bg-white">
                                <option value="" disabled>Pilih Taman</option>
                                {JENIS_TAMAN.map(j => <option key={j} value={j}>{j}</option>)}
                            </select>
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-slate-700">PBT</label>
                            <select name="PBT" value={formData.PBT} onChange={handleChange} className="w-full px-4 py-2 border border-slate-300 focus:outline-none focus:border-blue-500 bg-white">
                                <option value="">Pilih PBT</option>
                                {SENARAI_PBT.map(pbt => <option key={pbt.code} value={pbt.fullName}>{pbt.fullName}</option>)}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Seksyen Kemudahan (Modul 2) */}
                <div className="pt-6 border-t border-slate-200">
                    <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4 flex items-center">
                        <Tent className="w-4 h-4 mr-2 text-blue-600" /> Kemudahan Sedia Ada
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <label className={`flex flex-col items-center justify-center p-4 border cursor-pointer transition-colors ${formData.kemudahan.tandas ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-200 hover:border-blue-300 bg-white'}`}>
                            <Toilet className="w-6 h-6 mb-2" />
                            <div className="flex items-center space-x-2">
                                <input type="checkbox" name="tandas" checked={formData.kemudahan.tandas} onChange={handleCheckbox} className="w-4 h-4 text-blue-600 focus:ring-blue-500" />
                                <span className="text-sm font-medium">Tandas</span>
                            </div>
                        </label>
                        <label className={`flex flex-col items-center justify-center p-4 border cursor-pointer transition-colors ${formData.kemudahan.playground ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-200 hover:border-blue-300 bg-white'}`}>
                            <PlayCircle className="w-6 h-6 mb-2" />
                            <div className="flex items-center space-x-2">
                                <input type="checkbox" name="playground" checked={formData.kemudahan.playground} onChange={handleCheckbox} className="w-4 h-4 text-blue-600 focus:ring-blue-500" />
                                <span className="text-sm font-medium">Taman Permainan</span>
                            </div>
                        </label>
                        <label className={`flex flex-col items-center justify-center p-4 border cursor-pointer transition-colors ${formData.kemudahan.parking ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-200 hover:border-blue-300 bg-white'}`}>
                            <ParkingSquare className="w-6 h-6 mb-2" />
                            <div className="flex items-center space-x-2">
                                <input type="checkbox" name="parking" checked={formData.kemudahan.parking} onChange={handleCheckbox} className="w-4 h-4 text-blue-600 focus:ring-blue-500" />
                                <span className="text-sm font-medium">Tempat Letak Kereta</span>
                            </div>
                        </label>
                        <label className={`flex flex-col items-center justify-center p-4 border cursor-pointer transition-colors ${formData.kemudahan.surau ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-200 hover:border-blue-300 bg-white'}`}>
                            <Building2 className="w-6 h-6 mb-2" />
                            <div className="flex items-center space-x-2">
                                <input type="checkbox" name="surau" checked={formData.kemudahan.surau} onChange={handleCheckbox} className="w-4 h-4 text-blue-600 focus:ring-blue-500" />
                                <span className="text-sm font-medium">Surau / Tempat Ibadat</span>
                            </div>
                        </label>
                    </div>
                </div>

                {/* Seksyen Deskripsi Taman dengan AI */}
                <div className="pt-6 border-t border-slate-200">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider flex items-center">
                            <AlignLeft className="w-4 h-4 mr-2 text-blue-600" /> Deskripsi Profil Taman
                        </h3>
                    </div>
                    <textarea
                        name="deskripsi"
                        value={formData.deskripsi}
                        onChange={handleChange}
                        rows="4"
                        className="w-full px-4 py-3 border border-slate-300 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-slate-700 bg-slate-50"
                        placeholder="Taip maklumat taman..."
                    />
                </div>

                {/* Seksyen Muat Naik Gambar */}
                <div className="pt-6 border-t border-slate-200">
                    <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4 flex items-center">
                        <Download className="w-4 h-4 mr-2 text-blue-600" /> Muat Naik Gambar Taman
                    </h3>

                    {/* File Upload Input */}
                    <div className="mb-6">
                        <label className="block border-2 border-dashed border-slate-300 p-8 text-center cursor-pointer hover:bg-slate-50 hover:border-blue-400 transition-colors">
                            <input
                                type="file"
                                multiple
                                accept="image/*"
                                onChange={handleFileSelect}
                                className="hidden"
                            />
                            <div className="space-y-2">
                                <Upload className="w-8 h-8 text-blue-600 mx-auto" />
                                <p className="text-blue-700 font-medium text-sm">Klik untuk memilih gambar atau seret gambar ke sini</p>
                                <p className="text-xs text-slate-500">PNG, JPG, GIF sehingga 5MB setiap satu</p>
                            </div>
                        </label>
                    </div>

                    {/* Preview Gambar Baru */}
                    {previewUrls.length > 0 && (
                        <div className="mb-6">
                            <h4 className="text-sm font-medium text-slate-700 mb-3">Gambar Baharu ({previewUrls.length})</h4>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {previewUrls.map((url, index) => (
                                    <div key={index} className="relative group">
                                        <img src={url} alt={`Preview ${index}`} className="w-full h-32 object-cover border border-slate-200" />
                                        <button
                                            type="button"
                                            onClick={() => removeFile(index)}
                                            className="absolute top-1 right-1 bg-red-600 text-white p-1 opacity-0 group-hover:opacity-100 transition-opacity"
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
                            <h4 className="text-sm font-medium text-slate-700 mb-3">Gambar Sedia Ada ({uploadedImages.length})</h4>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {uploadedImages.map((img) => (
                                    <div key={img.id} className="relative group">
                                        <img src={img.url} alt="Taman" className="w-full h-32 object-cover border-2" style={{ borderColor: img.is_main_cover ? '#2563eb' : '#d1d5db' }} />
                                        {img.is_main_cover && (
                                            <div className="absolute top-0 left-0 bg-blue-600/30 flex items-center justify-center">
                                                <CheckSquare className="w-8 h-8 text-white" />
                                            </div>
                                        )}
                                        <button
                                            type="button"
                                            onClick={() => removeUploadedImage(img.id)}
                                            className="absolute top-1 right-1 bg-red-600 text-white p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className="pt-6 border-t border-slate-200 flex justify-end space-x-3">
                    <button type="button" onClick={onCancel} className="px-6 py-2 border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors">
                        Batal
                    </button>
                    <button type="submit" className="px-6 py-2 bg-blue-700 text-white hover:bg-blue-800 transition-colors">
                        {tamanSediaAda ? 'Simpan Perubahan' : 'Daftar Taman'}
                    </button>
                </div>
            </form>

            {/* Modal Pilih Gambar Utama */}
            {showMainCoverSelection && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white shadow-xl max-w-2xl w-full p-8">
                        <h3 className="text-lg font-semibold text-slate-900 mb-2">Pilih Gambar Utama</h3>
                        <p className="text-slate-600 text-sm mb-6">Anda telah memilih lebih dari satu gambar. Sila pilih gambar mana yang hendak dijadikan gambar utama taman ini.</p>

                        <div className="grid grid-cols-3 gap-4 mb-6 max-h-96 overflow-y-auto">
                            {previewUrls.map((url, index) => (
                                <div
                                    key={index}
                                    onClick={() => setSelectedMainCover(index)}
                                    className={`cursor-pointer relative overflow-hidden border-2 transition-all ${selectedMainCover === index ? 'border-blue-600' : 'border-transparent hover:border-blue-300'
                                        }`}
                                >
                                    <img src={url} alt={`Pilihan ${index + 1}`} className="w-full h-24 object-cover" />
                                    {selectedMainCover === index && (
                                        <div className="absolute inset-0 bg-blue-600/30 flex items-center justify-center">
                                            <Check className="w-8 h-8 text-white" />
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
                                className="px-6 py-2 border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors"
                            >
                                Batal
                            </button>
                            <button
                                type="button"
                                onClick={confirmMainCoverSelection}
                                className="px-6 py-2 bg-blue-700 text-white hover:bg-blue-800 transition-colors"
                            >
                                Simpan Pilihan
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
        <div className="max-w-6xl mx-auto space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
                <div>
                    <h2 className="text-xl font-semibold text-slate-900 tracking-tight">PREVIEW IMPORT TAMAN</h2>
                    <p className="text-sm text-slate-500 mt-1">{importingTaman.length} rekod untuk diimport</p>
                </div>
                <button onClick={onCancel} className="text-slate-500 hover:text-slate-800">
                    <X className="w-6 h-6" />
                </button>
            </div>

            <div className="bg-blue-50 border border-blue-200 p-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                    <p className="text-blue-900 font-medium text-sm">Review sebelum import</p>
                    <p className="text-blue-800 text-xs">Anda boleh mengedit, memadam, atau menambah gambar untuk setiap taman sebelum mengimport.</p>
                </div>
            </div>

            <div className="grid gap-4">
                {importingTaman.map((taman, idx) => (
                    <div key={taman.tempId} className="bg-white border border-slate-200 overflow-hidden">
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
                                    <p className="text-sm text-slate-500 mb-2">Kemudahan</p>
                                    <div className="flex gap-2">
                                        {taman.kemudahan.tandas && <Toilet className="w-5 h-5 text-blue-600" title="Tandas" />}
                                        {taman.kemudahan.playground && <PlayCircle className="w-5 h-5 text-blue-600" title="Taman Permainan" />}
                                        {taman.kemudahan.parking && <ParkingSquare className="w-5 h-5 text-blue-600" title="Tempat Letak Kereta" />}
                                        {taman.kemudahan.surau && <Building2 className="w-5 h-5 text-blue-600" title="Surau" />}
                                    </div>
                                </div>

                                {taman.deskripsi && (
                                    <div className="mb-4">
                                        <p className="text-sm text-gray-500 mb-1">Deskripsi</p>
                                        <p className="text-sm text-gray-700 line-clamp-2">{taman.deskripsi}</p>
                                    </div>
                                )}

                                {/* Images Section */}
                                <div className="border-t border-slate-100 pt-4">
                                    <div className="flex items-center justify-between mb-3">
                                        <p className="text-sm font-medium text-slate-700">Gambar ({taman.images.length})</p>
                                        <label className="text-xs bg-blue-100 text-blue-700 px-3 py-1 cursor-pointer hover:bg-blue-200 transition">
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
                                    <p className="text-xs text-slate-500 mb-2">Gambar utama: {getMainCoverIndexLabel(taman)}</p>
                                    {taman.images.length > 0 ? (
                                        <div className="grid grid-cols-4 md:grid-cols-6 gap-2">
                                            {taman.images.map((img, imgIdx) => (
                                                <div
                                                    key={imgIdx}
                                                    className={`relative group border-2 overflow-hidden ${taman.importMainCoverIndex === imgIdx ? 'border-blue-500' : 'border-transparent'
                                                        }`}
                                                >
                                                    <img
                                                        src={URL.createObjectURL(img)}
                                                        alt={`Gambar ${imgIdx + 1}`}
                                                        className="w-full h-16 object-cover"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => selectMainCoverForTaman(idx, imgIdx)}
                                                        className={`absolute top-1 left-1 px-2 py-0.5 text-[10px] ${taman.importMainCoverIndex === imgIdx
                                                                ? 'bg-blue-600 text-white'
                                                                : 'bg-white/90 text-slate-700 hover:bg-blue-50'
                                                            }`}
                                                        title="Set gambar utama"
                                                    >
                                                        {taman.importMainCoverIndex === imgIdx ? 'Utama' : 'Jadi Utama'}
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => removeImageFromTaman(idx, imgIdx)}
                                                        className="absolute -top-2 -right-2 bg-red-600 text-white p-1 opacity-0 group-hover:opacity-100 transition"
                                                    >
                                                        <X className="w-3 h-3" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-xs text-slate-400 italic">Tiada gambar. Klik "Tambah Gambar" untuk menambah.</p>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            <div className="flex justify-end gap-3 sticky bottom-0 bg-white p-6 border-t border-slate-200">
                <button
                    onClick={onCancel}
                    className="px-6 py-2 border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors"
                >
                    Batal
                </button>
                <button
                    onClick={onConfirm}
                    className="px-6 py-2 bg-blue-700 text-white hover:bg-blue-800 transition-colors flex items-center gap-2"
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
        <div className="max-w-4xl mx-auto space-y-6">
            <button onClick={onBack} className="text-blue-700 hover:text-blue-900 font-medium flex items-center mb-4 text-sm">
                <ArrowLeft className="w-4 h-4 mr-1" /> Kembali
            </button>

            <div className="bg-white border border-slate-200 overflow-hidden">
                {/* Header Profil */}
                <div className="bg-slate-900 p-8 text-white relative overflow-hidden">
                    <div className="relative z-10">
                        <span className="inline-block px-3 py-1 bg-blue-600 text-xs font-semibold tracking-wider uppercase mb-3">
                            {taman.jenis}
                        </span>
                        <h2 className="text-2xl md:text-3xl font-semibold mb-2">{taman.nama}</h2>
                        <div className="flex items-center text-slate-300 space-x-4 text-sm">
                            <span className="flex items-center"><MapPin className="w-4 h-4 mr-1" /> {taman.daerah}</span>
                            <span className="flex items-center"><Ruler className="w-4 h-4 mr-1" /> {taman.keluasan || 'N/A'} Ekar</span>
                        </div>
                    </div>
                </div>

                <div className="p-8 space-y-8">
                    {/* Gambar Taman */}
                    {taman.images && taman.images.length > 0 && (
                        <div>
                            <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-2 mb-4">Galeri Taman</h3>
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
                                            className="w-full h-48 object-cover border-2 group-hover:opacity-80 transition"
                                            style={{ borderColor: img.is_main_cover ? '#2563eb' : '#e2e8f0' }}
                                        />
                                        {img.is_main_cover && (
                                            <div className="absolute top-0 left-0 bg-blue-600 text-white px-2 py-1 text-xs font-medium">
                                                UTAMA
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Deskripsi (AI or Manual) */}
                    {taman.deskripsi && (
                        <div className="bg-slate-50 p-6 border border-slate-200">
                            <p className="text-slate-700 leading-relaxed">{taman.deskripsi}</p>
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        {/* Maklumat Lengkap */}
                        <div className="space-y-6">
                            <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-2">Maklumat Terperinci</h3>
                            <div className="space-y-4">
                                <div>
                                    <p className="text-xs text-slate-500 mb-1 uppercase tracking-wider">Lokasi Penuh</p>
                                    <p className="font-medium text-slate-800 bg-slate-50 p-3 border border-slate-200 text-sm">{taman.lokasi}</p>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-xs text-slate-500 mb-1 uppercase tracking-wider">PBT</p>
                                        <p className="font-medium text-slate-800 text-sm">{taman.PBT || 'Tidak dinyatakan'}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-500 mb-1 uppercase tracking-wider">ID Pendaftaran</p>
                                        <p className="font-medium text-slate-800 text-sm font-mono bg-slate-100 px-2 py-1 inline-block">TMN-{taman.id}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Status Kemudahan */}
                        <div className="space-y-6">
                            <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-2">Status Kemudahan</h3>
                            <ul className="space-y-3">
                                {[
                                    { key: 'tandas', icon: Toilet, label: 'Tandas Awam' },
                                    { key: 'playground', icon: PlayCircle, label: 'Taman Permainan' },
                                    { key: 'parking', icon: ParkingSquare, label: 'Tempat Letak Kereta' },
                                    { key: 'surau', icon: Building2, label: 'Surau' }
                                ]
                                    .sort((a, b) => (taman.kemudahan[b.key] ? 1 : 0) - (taman.kemudahan[a.key] ? 1 : 0))
                                    .map(({ key, icon: Icon, label }) => {
                                        const isAvailable = taman.kemudahan[key];
                                        return (
                                            <li key={key} className={`flex items-center justify-between p-3 border ${isAvailable ? 'bg-slate-50 border-slate-200' : 'bg-white border-slate-200'}`}>
                                                <div className={`flex items-center space-x-3 ${isAvailable ? 'text-slate-700' : 'text-slate-400'}`}>
                                                    <Icon className={`w-5 h-5 ${isAvailable ? 'text-blue-600' : 'text-slate-400'}`} />
                                                    <span className="font-medium text-sm">{label}</span>
                                                </div>
                                                {isAvailable ? <CheckSquare className="text-blue-600 w-5 h-5" /> : <XSquare className="text-slate-400 w-5 h-5" />}
                                            </li>
                                        );
                                    })}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal Gambar Penuh */}
            {viewingImage && (
                <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="relative max-w-4xl w-full">
                        {/* Gambar */}
                        <img
                            src={viewingImage.url}
                            alt={viewingImage.caption}
                            className="w-full h-auto shadow-2xl object-contain max-h-[85vh]"
                        />

                        {/* Tombol Tutup */}
                        <button
                            onClick={() => setViewingImage(null)}
                            className="absolute top-4 right-4 bg-white text-slate-800 p-2 hover:bg-slate-100 transition shadow-lg"
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
                                className="absolute top-4 left-4 bg-blue-600 text-white px-4 py-2 hover:bg-blue-700 transition font-medium text-sm flex items-center shadow-lg"
                                title="Tetapkan Gambar Utama"
                            >
                                <CheckSquare className="w-5 h-5 mr-2" />
                                Tetapkan Utama
                            </button>
                        )}

                        {/* Badge Utama (jika sudah main cover) */}
                        {viewingImage.is_main_cover && (
                            <div className="absolute top-4 left-4 bg-blue-600 text-white px-4 py-2 shadow-lg font-medium text-sm flex items-center">
                                <CheckSquare className="w-5 h-5 mr-2" />
                                Gambar Utama
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
    const [selectedPBT, setSelectedPBT] = useState(null);
    const [aiInsights, setAiInsights] = useState("");
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    // Filter taman berdasarkan PBT yang dipilih
    const filteredTaman = useMemo(() => {
        if (!selectedPBT) return [];
        return tamanList.filter(t => t.PBT === selectedPBT.fullName || t.PBT === selectedPBT.code);
    }, [tamanList, selectedPBT]);

    // Pengiraan Statistik
    const jumlahTaman = filteredTaman.length;
    const jumlahKeluasan = filteredTaman.reduce((acc, curr) => acc + (parseFloat(curr.keluasan) || 0), 0);

    // Kiraan mengikut Daerah
    const taburanDaerah = useMemo(() => {
        const counts = {};
        filteredTaman.forEach(t => {
            counts[t.daerah] = (counts[t.daerah] || 0) + 1;
        });
        return Object.entries(counts).sort((a, b) => b[1] - a[1]);
    }, [filteredTaman]);

    // Kiraan mengikut Jenis
    const taburanJenis = useMemo(() => {
        const counts = {};
        filteredTaman.forEach(t => {
            counts[t.jenis] = (counts[t.jenis] || 0) + 1;
        });
        return Object.entries(counts).sort((a, b) => b[1] - a[1]);
    }, [filteredTaman]);

    const generateAIInsights = async () => {
        setIsAnalyzing(true);
        try {
            // Sediakan ringkasan data untuk AI
            const summaryData = {
                pbt: selectedPBT.fullName,
                jumlahTaman,
                jumlahKeluasan,
                taburanIkutDaerah: Object.fromEntries(taburanDaerah),
                taburanIkutJenis: Object.fromEntries(taburanJenis),
                senaraiTaman: filteredTaman.map(t => ({
                    nama: t.nama, daerah: t.daerah, tandas: t.kemudahan.tandas, surau: t.kemudahan.surau
                }))
            };

            const prompt = `Sebagai seorang perunding pakar perancangan bandar dan pengurusan taman, sila analisis data taman untuk ${selectedPBT.fullName} berikut: 
      ${JSON.stringify(summaryData)}
      
      Berikan 3 pemerhatian utama atau cadangan strategik yang padat dalam Bahasa Melayu untuk pihak pengurusan ${selectedPBT.fullName} bagi meningkatkan kualiti taman-taman ini. 
      Formatkan jawapan anda dalam bentuk "bullet points" (*). Jangan berikan pengenalan yang panjang, terus kepada isi penting.`;

            const insights = await callGeminiAPI(prompt);
            setAiInsights(insights);
        } catch (error) {
            alert("Gagal menjana analisis AI.");
        } finally {
            setIsAnalyzing(false);
        }
    };

    // Jika belum ada PBT dipilih, tampilkan skrin pilihan PBT
    if (!selectedPBT) {
        return (
            <div className="space-y-8">
                <div className="pb-6 border-b border-slate-200">
                    <h2 className="text-xl font-semibold text-slate-900 tracking-tight">LAPORAN & ANALITIK DATA</h2>
                    <p className="text-sm text-slate-500 mt-1">Sila pilih Pihak Berkuasa Tempatan (PBT) untuk analisis terperinci</p>
                </div>

                {/* Grid Senarai PBT */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {SENARAI_PBT.map((pbt) => {
                        const countTaman = tamanList.filter(t => t.PBT === pbt.fullName || t.PBT === pbt.code).length;
                        return (
                            <button
                                key={pbt.code}
                                onClick={() => setSelectedPBT(pbt)}
                                className={`p-5 border transition-all text-left ${countTaman > 0
                                        ? 'bg-white border-slate-300 hover:border-blue-500 hover:bg-blue-50 cursor-pointer'
                                        : 'bg-slate-50 border-slate-200 opacity-60 cursor-not-allowed'
                                    }`}
                                disabled={countTaman === 0}
                            >
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-slate-800 text-sm">{pbt.nama}</h3>
                                        <p className="text-xs text-slate-500 mt-1">{pbt.code}</p>
                                    </div>
                                    <div className="bg-blue-600 text-white w-8 h-8 flex items-center justify-center text-sm font-semibold">
                                        {countTaman}
                                    </div>
                                </div>
                                {countTaman > 0 && (
                                    <div className="text-xs text-blue-600 font-medium">
                                        Klik untuk lihat laporan
                                    </div>
                                )}
                                {countTaman === 0 && (
                                    <div className="text-xs text-slate-400">
                                        Tiada data
                                    </div>
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>
        );
    }

    // Tampilkan dashboard untuk PBT yang dipilih
    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between pb-6 border-b border-slate-200">
                <div>
                    <h2 className="text-xl font-semibold text-slate-900 tracking-tight">{selectedPBT.fullName}</h2>
                    <p className="text-sm text-slate-500 mt-1">Laporan & Analitik Data</p>
                </div>
                <button
                    onClick={() => {
                        setSelectedPBT(null);
                        setAiInsights("");
                    }}
                    className="flex items-center space-x-2 bg-slate-100 text-slate-700 px-4 py-2 text-sm font-medium hover:bg-slate-200 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Kembali ke Senarai PBT</span>
                </button>
            </div>

            {/* Kad Ringkasan */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 border-l-4 border-l-blue-600 flex items-center justify-between">
                    <div>
                        <p className="text-xs font-medium text-slate-500 mb-1 uppercase tracking-wider">Jumlah Taman</p>
                        <h3 className="text-3xl font-bold text-slate-800">{jumlahTaman}</h3>
                    </div>
                    <Trees className="w-12 h-12 text-blue-100" />
                </div>
                <div className="bg-white p-6 border-l-4 border-l-slate-600 flex items-center justify-between">
                    <div>
                        <p className="text-xs font-medium text-slate-500 mb-1 uppercase tracking-wider">Jumlah Keluasan (Ekar)</p>
                        <h3 className="text-3xl font-bold text-slate-800">{jumlahKeluasan.toFixed(2)}</h3>
                    </div>
                    <Map className="w-12 h-12 text-slate-100" />
                </div>
                <div className="bg-white p-6 border-l-4 border-l-amber-500 flex items-center justify-between">
                    <div>
                        <p className="text-xs font-medium text-slate-500 mb-1 uppercase tracking-wider">Daerah Tertinggi</p>
                        <h3 className="text-xl font-bold text-slate-800">{taburanDaerah.length > 0 ? taburanDaerah[0][0] : 'Tiada'}</h3>
                        <p className="text-sm text-slate-500">{taburanDaerah.length > 0 ? `${taburanDaerah[0][1]} Taman` : ''}</p>
                    </div>
                    <MapPin className="w-12 h-12 text-amber-100" />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Carta Bar Mudah: Taburan Mengikut Daerah */}
                <div className="bg-white p-6 border border-slate-200">
                    <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-6 border-b border-slate-200 pb-2">Bilangan Taman Mengikut Daerah</h3>
                    <div className="space-y-4">
                        {taburanDaerah.map(([daerah, count]) => {
                            const peratus = (count / jumlahTaman) * 100;
                            return (
                                <div key={daerah}>
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="font-medium text-slate-700">{daerah}</span>
                                        <span className="text-slate-500">{count} taman ({peratus.toFixed(1)}%)</span>
                                    </div>
                                    <div className="w-full bg-slate-100 h-2">
                                        <div className="bg-blue-600 h-2" style={{ width: `${peratus}%` }}></div>
                                    </div>
                                </div>
                            );
                        })}
                        {taburanDaerah.length === 0 && <p className="text-slate-400 text-center py-4 text-sm">Tiada data direkodkan.</p>}
                    </div>
                </div>

                {/* Taburan Mengikut Jenis */}
                <div className="bg-white p-6 border border-slate-200">
                    <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-6 border-b border-slate-200 pb-2">Pecahan Mengikut Jenis Taman</h3>
                    <div className="space-y-4">
                        {taburanJenis.map(([jenis, count]) => {
                            const peratus = (count / jumlahTaman) * 100;
                            return (
                                <div key={jenis} className="flex items-center p-3 hover:bg-slate-50 transition border border-slate-100">
                                    <div className="w-10 h-10 bg-blue-100 text-blue-600 flex items-center justify-center mr-4">
                                        <Trees className="w-5 h-5" />
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-medium text-slate-800 text-sm">{jenis}</h4>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-xl font-bold text-slate-800">{count}</div>
                                    </div>
                                </div>
                            );
                        })}
                        {taburanJenis.length === 0 && <p className="text-slate-400 text-center py-4 text-sm">Tiada data direkodkan.</p>}
                    </div>
                </div>
            </div>

        </div>
    );
}