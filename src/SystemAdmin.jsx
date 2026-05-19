import React, { useState, useEffect, useMemo } from 'react';
import {
    Settings, Database, Users, Shield, FileText,
    Plus, Edit, Trash2, Search, Filter,
    X, Check, AlertCircle, Eye, EyeOff,
    MapPin, Building2, Toilet, ParkingSquare, PlayCircle,
    ArrowLeft, Loader2, Save, XCircle
} from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
const apiUrl = (path) => `${API_BASE_URL}${path}`;

export default function SystemAdmin() {
    const [activeModule, setActiveModule] = useState('master-data'); // master-data | user-accounts | audit-log
    const [loading, setLoading] = useState(false);

    // ==================== MASTER DATA STATE ====================
    const [daerahList, setDaerahList] = useState([]);
    const [statusTanahList, setStatusTanahList] = useState([]);
    const [facilityList, setFacilityList] = useState([]);
    const [activeEntity, setActiveEntity] = useState('daerah'); // daerah | status-tanah | facility
    const [editingEntity, setEditingEntity] = useState(null);
    const [entityToDelete, setEntityToDelete] = useState(null);

    // ==================== USER ACCOUNT STATE ====================
    const [userList, setUserList] = useState([]);
    const [userSearchQuery, setUserSearchQuery] = useState('');
    const [userFilterDistrict, setUserFilterDistrict] = useState('');
    const [userFilterRole, setUserFilterRole] = useState('');
    const [userFilterStatus, setUserFilterStatus] = useState('');
    const [editingUser, setEditingUser] = useState(null);
    const [userToToggle, setUserToToggle] = useState(null);

    // ==================== AUDIT LOG STATE ====================
    const [auditLogs, setAuditLogs] = useState([]);
    const [auditPage, setAuditPage] = useState(1);
    const [auditTotalPages, setAuditTotalPages] = useState(1);
    const [auditFilterUser, setAuditFilterUser] = useState('');
    const [auditFilterAction, setAuditFilterAction] = useState('');
    const [auditFilterStartDate, setAuditFilterStartDate] = useState('');
    const [auditFilterEndDate, setAuditFilterEndDate] = useState('');

    // ==================== FETCH DATA ON MOUNT ====================
    useEffect(() => {
        fetchMasterData();
        fetchUserList();
        fetchAuditLogs();
    }, []);

    // ==================== MASTER DATA FUNCTIONS ====================
    const fetchMasterData = async () => {
        try {
            const [daerahRes, statusRes, facilityRes] = await Promise.all([
                fetch(apiUrl('/api/master/daerah/')),
                fetch(apiUrl('/api/master/status-tanah/')),
                fetch(apiUrl('/api/master/facility/'))
            ]);
            const daerahData = await daerahRes.json();
            const statusData = await statusRes.json();
            const facilityData = await facilityRes.json();

            if (daerahData.success) setDaerahList(daerahData.data);
            if (statusData.success) setStatusTanahList(statusData.data);
            if (facilityData.success) setFacilityList(facilityData.data);
        } catch (error) {
            console.error('Error fetching master data:', error);
        }
    };

    const getActiveEntityList = () => {
        switch (activeEntity) {
            case 'daerah': return daerahList;
            case 'status-tanah': return statusTanahList;
            case 'facility': return facilityList;
            default: return [];
        }
    };

    const getEntityLabel = (entity) => {
        switch (entity) {
            case 'daerah': return 'Daerah';
            case 'status-tanah': return 'Status Pemilikan Tanah';
            case 'facility': return 'Jenis Kemudahan';
            default: return '';
        }
    };

    const handleSaveEntity = async (formData) => {
        setLoading(true);
        try {
            const endpoint = editingEntity
                ? `/api/master/${activeEntity}/${editingEntity.id}/update/`
                : `/api/master/${activeEntity}/create/`;
            const method = editingEntity ? 'PUT' : 'POST';

            const response = await fetch(apiUrl(endpoint), {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            const result = await response.json();

            if (result.success) {
                await fetchMasterData();
                setEditingEntity(null);
            } else {
                alert(result.error || 'Ralat menyimpan data');
            }
        } catch (error) {
            console.error('Error saving entity:', error);
            alert('Ralat semasa menyimpan data');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteEntity = async () => {
        if (!entityToDelete) return;
        setLoading(true);
        try {
            const response = await fetch(apiUrl(`/api/master/${activeEntity}/${entityToDelete.id}/delete/`), {
                method: 'DELETE'
            });
            const result = await response.json();

            if (result.success) {
                await fetchMasterData();
                setEntityToDelete(null);
            } else {
                alert(result.error || 'Ralat memadam data');
            }
        } catch (error) {
            console.error('Error deleting entity:', error);
            alert('Ralat semasa memadam data');
        } finally {
            setLoading(false);
        }
    };

    // ==================== USER ACCOUNT FUNCTIONS ====================
    const fetchUserList = async () => {
        try {
            const response = await fetch(apiUrl('/api/admin/users/'));
            const result = await response.json();
            if (result.success) setUserList(result.data);
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    };

    const filteredUsers = useMemo(() => {
        return userList.filter(user => {
            const matchSearch = userSearchQuery === '' ||
                user.name?.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
                user.email?.toLowerCase().includes(userSearchQuery.toLowerCase());
            const matchDistrict = userFilterDistrict === '' || user.district === userFilterDistrict;
            const matchRole = userFilterRole === '' || user.role === userFilterRole;
            const matchStatus = userFilterStatus === '' || user.status === userFilterStatus;
            return matchSearch && matchDistrict && matchRole && matchStatus;
        });
    }, [userList, userSearchQuery, userFilterDistrict, userFilterRole, userFilterStatus]);

    const handleToggleUserStatus = (user) => {
        setUserToToggle(user);
    };

    const confirmToggleUserStatus = async () => {
        if (!userToToggle) return;
        setLoading(true);
        try {
            const action = userToToggle.status === 'active' ? 'deactivate' : 'activate';
            const response = await fetch(apiUrl(`/api/admin/users/${userToToggle.id}/${action}/`), {
                method: 'POST'
            });
            const result = await response.json();
            if (result.success) {
                await fetchUserList();
                setUserToToggle(null);
            } else {
                alert(result.error || 'Ralat mengemaskini status');
            }
        } catch (error) {
            console.error('Error toggling user status:', error);
            alert('Ralat semasa mengemaskini status');
        } finally {
            setLoading(false);
        }
    };

    const handleAssignUserRole = async (userId, district, role) => {
        setLoading(true);
        try {
            const response = await fetch(apiUrl(`/api/admin/users/${userId}/assign/`), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ district, role })
            });
            const result = await response.json();
            if (result.success) {
                await fetchUserList();
                setEditingUser(null);
            } else {
                alert(result.error || 'Ralat mengemaskini pengguna');
            }
        } catch (error) {
            console.error('Error assigning user:', error);
            alert('Ralat semasa mengemaskini pengguna');
        } finally {
            setLoading(false);
        }
    };

    // ==================== AUDIT LOG FUNCTIONS ====================
    const fetchAuditLogs = async (page = 1) => {
        setLoading(true);
        try {
            let url = `/api/admin/audit-logs/?page=${page}`;
            if (auditFilterUser) url += `&user=${auditFilterUser}`;
            if (auditFilterAction) url += `&action=${auditFilterAction}`;
            if (auditFilterStartDate) url += `&start_date=${auditFilterStartDate}`;
            if (auditFilterEndDate) url += `&end_date=${auditFilterEndDate}`;

            const response = await fetch(apiUrl(url));
            const result = await response.json();
            if (result.success) {
                setAuditLogs(result.data);
                setAuditPage(result.page || 1);
                setAuditTotalPages(result.total_pages || 1);
            }
        } catch (error) {
            console.error('Error fetching audit logs:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAuditFilter = () => {
        fetchAuditLogs(1);
    };

    const handleAuditReset = () => {
        setAuditFilterUser('');
        setAuditFilterAction('');
        setAuditFilterStartDate('');
        setAuditFilterEndDate('');
        fetchAuditLogs(1);
    };

    // ==================== RENDER ====================
    return (
        <div className="min-h-screen bg-slate-50">
            {/* Header */}
            <div className="bg-slate-900 text-white p-6">
                <div className="max-w-7xl mx-auto">
                    <h1 className="text-2xl font-semibold flex items-center gap-3">
                        <Settings className="w-7 h-7 text-blue-400" />
                        PENTADBIRAN SISTEM
                    </h1>
                    <p className="text-slate-400 text-sm mt-1">Pengurusan data induk, akaun pengguna, dan log audit</p>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="bg-white border-b border-slate-200">
                <div className="max-w-7xl mx-auto flex">
                    {[
                        { key: 'master-data', icon: Database, label: 'Data Induk' },
                        { key: 'user-accounts', icon: Users, label: 'Akaun Pengguna' },
                        { key: 'audit-log', icon: Shield, label: 'Log Audit' }
                    ].map(tab => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveModule(tab.key)}
                            className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${activeModule === tab.key
                                    ? 'border-blue-600 text-blue-700 bg-blue-50'
                                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                                }`}
                        >
                            <tab.icon className="w-4 h-4" />
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Content Area */}
            <div className="max-w-7xl mx-auto p-6">
                {loading && (
                    <div className="flex items-center justify-center h-64">
                        <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
                    </div>
                )}

                {/* ==================== MODULE: MASTER DATA ==================== */}
                {!loading && activeModule === 'master-data' && (
                    <MasterDataManagement
                        activeEntity={activeEntity}
                        setActiveEntity={setActiveEntity}
                        entityList={getActiveEntityList()}
                        entityLabel={getEntityLabel(activeEntity)}
                        editingEntity={editingEntity}
                        setEditingEntity={setEditingEntity}
                        entityToDelete={entityToDelete}
                        setEntityToDelete={setEntityToDelete}
                        onSave={handleSaveEntity}
                        onDelete={handleDeleteEntity}
                        daerahList={daerahList}
                    />
                )}

                {/* ==================== MODULE: USER ACCOUNTS ==================== */}
                {!loading && activeModule === 'user-accounts' && (
                    <UserAccountManagement
                        users={filteredUsers}
                        userSearchQuery={userSearchQuery}
                        setUserSearchQuery={setUserSearchQuery}
                        userFilterDistrict={userFilterDistrict}
                        setUserFilterDistrict={setUserFilterDistrict}
                        userFilterRole={userFilterRole}
                        setUserFilterRole={setUserFilterRole}
                        userFilterStatus={userFilterStatus}
                        setUserFilterStatus={setUserFilterStatus}
                        editingUser={editingUser}
                        setEditingUser={setEditingUser}
                        userToToggle={userToToggle}
                        setUserToToggle={setUserToToggle}
                        onToggleStatus={handleToggleUserStatus}
                        onConfirmToggle={confirmToggleUserStatus}
                        onAssignRole={handleAssignUserRole}
                        daerahList={daerahList}
                    />
                )}

                {/* ==================== MODULE: AUDIT LOG ==================== */}
                {!loading && activeModule === 'audit-log' && (
                    <AuditLogModule
                        auditLogs={auditLogs}
                        auditPage={auditPage}
                        auditTotalPages={auditTotalPages}
                        auditFilterUser={auditFilterUser}
                        setAuditFilterUser={setAuditFilterUser}
                        auditFilterAction={auditFilterAction}
                        setAuditFilterAction={setAuditFilterAction}
                        auditFilterStartDate={auditFilterStartDate}
                        setAuditFilterStartDate={setAuditFilterStartDate}
                        auditFilterEndDate={auditFilterEndDate}
                        setAuditFilterEndDate={setAuditFilterEndDate}
                        onFilter={handleAuditFilter}
                        onReset={handleAuditReset}
                        onPageChange={fetchAuditLogs}
                    />
                )}
            </div>
        </div>
    );
}

// ==========================================
// KOMPONEN: MASTER DATA MANAGEMENT
// ==========================================
function MasterDataManagement({
    activeEntity, setActiveEntity, entityList, entityLabel,
    editingEntity, setEditingEntity, entityToDelete, setEntityToDelete,
    onSave, onDelete, daerahList
}) {
    const [formData, setFormData] = useState({ nama: '', keterangan: '', kategori: '' });
    const [searchQuery, setSearchQuery] = useState('');

    const filteredList = useMemo(() => {
        if (!searchQuery) return entityList;
        return entityList.filter(item =>
            item.nama?.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [entityList, searchQuery]);

    const handleEdit = (entity) => {
        setEditingEntity(entity);
        setFormData({
            nama: entity.nama || '',
            keterangan: entity.keterangan || '',
            kategori: entity.kategori || ''
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
        setFormData({ nama: '', keterangan: '', kategori: '' });
    };

    const entityTabs = [
        { key: 'daerah', label: 'Daerah', icon: MapPin },
        { key: 'status-tanah', label: 'Status Tanah', icon: FileText },
        { key: 'facility', label: 'Kemudahan', icon: Building2 }
    ];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-900">Pengurusan Data Induk</h2>
                <button
                    onClick={() => {
                        setEditingEntity(null);
                        setFormData({ nama: '', keterangan: '', kategori: '' });
                    }}
                    className="flex items-center gap-2 bg-blue-700 text-white px-4 py-2 text-sm font-medium hover:bg-blue-800 transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    Tambah {entityLabel}
                </button>
            </div>

            {/* Entity Tabs */}
            <div className="flex border-b border-slate-200">
                {entityTabs.map(tab => (
                    <button
                        key={tab.key}
                        onClick={() => {
                            setActiveEntity(tab.key);
                            setEditingEntity(null);
                            setSearchQuery('');
                        }}
                        className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeEntity === tab.key
                                ? 'border-blue-600 text-blue-700'
                                : 'border-transparent text-slate-500 hover:text-slate-700'
                            }`}
                    >
                        <tab.icon className="w-4 h-4" />
                        {tab.label}
                    </button>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Entity List */}
                <div className="lg:col-span-2 bg-white border border-slate-200">
                    <div className="p-4 border-b border-slate-200">
                        <div className="relative">
                            <Search className="absolute left-3 top-2.5 text-slate-400 w-4 h-4" />
                            <input
                                type="text"
                                placeholder={`Cari ${entityLabel.toLowerCase()}...`}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-9 pr-4 py-2 border border-slate-300 text-sm focus:outline-none focus:border-blue-500"
                            />
                        </div>
                    </div>
                    <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto">
                        {filteredList.length > 0 ? filteredList.map((entity, idx) => (
                            <div key={entity.id || idx} className="flex items-center justify-between p-4 hover:bg-slate-50">
                                <div>
                                    <p className="font-medium text-slate-800 text-sm">{entity.nama}</p>
                                    {entity.keterangan && <p className="text-xs text-slate-500 mt-0.5">{entity.keterangan}</p>}
                                    {entity.kategori && <p className="text-xs text-slate-500 mt-0.5">{entity.kategori}</p>}
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className={`px-2 py-0.5 text-xs ${entity.status === 'Inactive' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                                        {entity.status || 'Active'}
                                    </span>
                                    <button onClick={() => handleEdit(entity)} className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition">
                                        <Edit className="w-4 h-4" />
                                    </button>
                                    <button onClick={() => setEntityToDelete(entity)} className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 transition">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        )) : (
                            <div className="p-8 text-center text-slate-400 text-sm">Tiada data {entityLabel.toLowerCase()}.</div>
                        )}
                    </div>
                </div>

                {/* Add/Edit Form */}
                <div className="bg-white border border-slate-200 p-6 h-fit">
                    <h3 className="text-sm font-semibold text-slate-900 mb-4">
                        {editingEntity ? `Kemaskini ${entityLabel}` : `Tambah ${entityLabel} Baharu`}
                    </h3>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Nama <span className="text-red-500">*</span></label>
                            <input
                                required
                                type="text"
                                value={formData.nama}
                                onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                                className="w-full px-3 py-2 border border-slate-300 text-sm focus:outline-none focus:border-blue-500"
                                placeholder={`Nama ${entityLabel.toLowerCase()}`}
                            />
                        </div>
                        {activeEntity === 'status-tanah' && (
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Keterangan</label>
                                <textarea
                                    value={formData.keterangan}
                                    onChange={(e) => setFormData({ ...formData, keterangan: e.target.value })}
                                    className="w-full px-3 py-2 border border-slate-300 text-sm focus:outline-none focus:border-blue-500"
                                    rows="2"
                                    placeholder="Keterangan (pilihan)"
                                />
                            </div>
                        )}
                        {activeEntity === 'facility' && (
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Kategori</label>
                                <select
                                    value={formData.kategori}
                                    onChange={(e) => setFormData({ ...formData, kategori: e.target.value })}
                                    className="w-full px-3 py-2 border border-slate-300 text-sm focus:outline-none focus:border-blue-500 bg-white"
                                >
                                    <option value="">Pilih Kategori</option>
                                    <option value="Sukan">Sukan</option>
                                    <option value="Rekreasi">Rekreasi</option>
                                    <option value="Infrastruktur">Infrastruktur</option>
                                    <option value="Keagamaan">Keagamaan</option>
                                </select>
                            </div>
                        )}
                        <div className="flex gap-2 pt-2">
                            <button
                                type="submit"
                                className="flex-1 bg-blue-700 text-white px-4 py-2 text-sm font-medium hover:bg-blue-800 transition-colors"
                            >
                                {editingEntity ? 'Kemaskini' : 'Simpan'}
                            </button>
                            {editingEntity && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setEditingEntity(null);
                                        setFormData({ nama: '', keterangan: '', kategori: '' });
                                    }}
                                    className="px-4 py-2 border border-slate-300 text-slate-700 text-sm hover:bg-slate-50 transition-colors"
                                >
                                    Batal
                                </button>
                            )}
                        </div>
                    </form>
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            {entityToDelete && (
                <DeleteConfirmationModal
                    title="Sahkan Padaman"
                    message={`Adakah anda pasti mahu memadam ${entityLabel.toLowerCase()} "${entityToDelete.nama}"?`}
                    onConfirm={onDelete}
                    onCancel={() => setEntityToDelete(null)}
                />
            )}
        </div>
    );
}

// ==========================================
// KOMPONEN: USER ACCOUNT MANAGEMENT
// ==========================================
function UserAccountManagement({
    users, userSearchQuery, setUserSearchQuery,
    userFilterDistrict, setUserFilterDistrict, userFilterRole, setUserFilterRole,
    userFilterStatus, setUserFilterStatus,
    editingUser, setEditingUser, userToToggle, setUserToToggle,
    onToggleStatus, onConfirmToggle, onAssignRole, daerahList
}) {
    const [assignForm, setAssignForm] = useState({ district: '', role: '' });

    const handleOpenAssign = (user) => {
        setEditingUser(user);
        setAssignForm({
            district: user.district || '',
            role: user.role || 'PBT_OFFICER'
        });
    };

    const handleAssignSubmit = (e) => {
        e.preventDefault();
        onAssignRole(editingUser.id, assignForm.district, assignForm.role);
    };

    return (
        <div className="space-y-6">
            <h2 className="text-lg font-semibold text-slate-900">Pengurusan Akaun Pengguna</h2>

            {/* Filters */}
            <div className="bg-white p-4 border border-slate-200">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-2.5 text-slate-400 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Cari nama atau emel..."
                            value={userSearchQuery}
                            onChange={(e) => setUserSearchQuery(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 border border-slate-300 text-sm focus:outline-none focus:border-blue-500"
                        />
                    </div>
                    <select
                        value={userFilterDistrict}
                        onChange={(e) => setUserFilterDistrict(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 text-sm focus:outline-none focus:border-blue-500 bg-white"
                    >
                        <option value="">Semua Daerah</option>
                        {daerahList.map(d => <option key={d.id || d.nama} value={d.nama}>{d.nama}</option>)}
                    </select>
                    <select
                        value={userFilterRole}
                        onChange={(e) => setUserFilterRole(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 text-sm focus:outline-none focus:border-blue-500 bg-white"
                    >
                        <option value="">Semua Peranan</option>
                        <option value="JLNJ_ADMIN">JLNJ Administrator</option>
                        <option value="PBT_OFFICER">PBT Officer</option>
                    </select>
                    <select
                        value={userFilterStatus}
                        onChange={(e) => setUserFilterStatus(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 text-sm focus:outline-none focus:border-blue-500 bg-white"
                    >
                        <option value="">Semua Status</option>
                        <option value="active">Aktif</option>
                        <option value="inactive">Tidak Aktif</option>
                    </select>
                </div>
            </div>

            {/* Users Table */}
            <div className="bg-white border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-100 text-slate-600 text-xs uppercase tracking-wider">
                                <th className="p-4 font-semibold">Nama</th>
                                <th className="p-4 font-semibold">Emel</th>
                                <th className="p-4 font-semibold">Daerah</th>
                                <th className="p-4 font-semibold">Peranan</th>
                                <th className="p-4 font-semibold">Status</th>
                                <th className="p-4 font-semibold">Log Masuk Terakhir</th>
                                <th className="p-4 font-semibold text-right">Tindakan</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {users.length > 0 ? users.map(user => (
                                <tr key={user.id} className="hover:bg-slate-50">
                                    <td className="p-4 font-medium text-slate-900 text-sm">{user.name || user.nama || '-'}</td>
                                    <td className="p-4 text-sm text-slate-600">{user.email}</td>
                                    <td className="p-4 text-sm text-slate-600">{user.district || '-'}</td>
                                    <td className="p-4">
                                        <span className={`px-2 py-0.5 text-xs font-medium ${user.role === 'JLNJ_ADMIN' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                                            {user.role === 'JLNJ_ADMIN' ? 'JLNJ Admin' : 'PBT Officer'}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <span className={`px-2 py-0.5 text-xs font-medium ${user.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                            {user.status === 'active' ? 'Aktif' : 'Tidak Aktif'}
                                        </span>
                                    </td>
                                    <td className="p-4 text-sm text-slate-500">{user.last_login || '-'}</td>
                                    <td className="p-4 text-right">
                                        <div className="flex justify-end gap-1">
                                            <button
                                                onClick={() => handleOpenAssign(user)}
                                                className="p-2 text-blue-600 hover:bg-blue-50 transition"
                                                title="Tukar Daerah & Peranan"
                                            >
                                                <Edit className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => onToggleStatus(user)}
                                                className={`p-2 transition ${user.status === 'active' ? 'text-red-600 hover:bg-red-50' : 'text-green-600 hover:bg-green-50'}`}
                                                title={user.status === 'active' ? 'Nyahaktifkan' : 'Aktifkan'}
                                            >
                                                {user.status === 'active' ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="7" className="p-8 text-center text-slate-400 text-sm">Tiada akaun pengguna ditemui.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Assign District/Role Modal */}
            {editingUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="bg-white p-6 shadow-xl max-w-md w-full mx-4">
                        <h3 className="text-lg font-semibold text-slate-900 mb-4">Tukar Daerah & Peranan</h3>
                        <p className="text-sm text-slate-600 mb-4">
                            Pengguna: <span className="font-medium">{editingUser.name || editingUser.email}</span>
                        </p>
                        <form onSubmit={handleAssignSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Daerah</label>
                                <select
                                    value={assignForm.district}
                                    onChange={(e) => setAssignForm({ ...assignForm, district: e.target.value })}
                                    className="w-full px-3 py-2 border border-slate-300 text-sm focus:outline-none focus:border-blue-500 bg-white"
                                    required
                                >
                                    <option value="">Pilih Daerah</option>
                                    {daerahList.map(d => <option key={d.id || d.nama} value={d.nama}>{d.nama}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Peranan</label>
                                <select
                                    value={assignForm.role}
                                    onChange={(e) => setAssignForm({ ...assignForm, role: e.target.value })}
                                    className="w-full px-3 py-2 border border-slate-300 text-sm focus:outline-none focus:border-blue-500 bg-white"
                                    required
                                >
                                    <option value="PBT_OFFICER">PBT Officer</option>
                                    <option value="JLNJ_ADMIN">JLNJ Administrator</option>
                                </select>
                            </div>
                            <div className="flex justify-end gap-3 pt-2">
                                <button type="button" onClick={() => setEditingUser(null)} className="px-4 py-2 border border-slate-300 text-slate-700 text-sm hover:bg-slate-50">Batal</button>
                                <button type="submit" className="px-4 py-2 bg-blue-700 text-white text-sm hover:bg-blue-800">Simpan</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Toggle Status Confirmation Modal */}
            {userToToggle && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="bg-white p-6 shadow-xl max-w-sm w-full mx-4">
                        <div className={`flex items-center justify-center w-12 h-12 mx-auto mb-4 ${userToToggle.status === 'active' ? 'bg-red-100' : 'bg-green-100'}`}>
                            {userToToggle.status === 'active' ? <XCircle className="w-6 h-6 text-red-600" /> : <Check className="w-6 h-6 text-green-600" />}
                        </div>
                        <h3 className="text-lg font-semibold text-center text-slate-900 mb-2">
                            {userToToggle.status === 'active' ? 'Nyahaktifkan Akaun' : 'Aktifkan Akaun'}
                        </h3>
                        <p className="text-center text-slate-600 text-sm mb-6">
                            {userToToggle.status === 'active'
                                ? `Adakah anda pasti mahu menyahaktifkan akaun ${userToToggle.name || userToToggle.email}?`
                                : `Adakah anda pasti mahu mengaktifkan akaun ${userToToggle.name || userToToggle.email}?`
                            }
                        </p>
                        <div className="flex justify-center gap-3">
                            <button onClick={() => setUserToToggle(null)} className="px-5 py-2 border border-slate-300 text-slate-700 text-sm hover:bg-slate-50">Batal</button>
                            <button onClick={onConfirmToggle} className={`px-5 py-2 text-white text-sm ${userToToggle.status === 'active' ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}`}>
                                {userToToggle.status === 'active' ? 'Nyahaktifkan' : 'Aktifkan'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// ==========================================
// KOMPONEN: AUDIT LOG MODULE
// ==========================================
function AuditLogModule({
    auditLogs, auditPage, auditTotalPages,
    auditFilterUser, setAuditFilterUser, auditFilterAction, setAuditFilterAction,
    auditFilterStartDate, setAuditFilterStartDate, auditFilterEndDate, setAuditFilterEndDate,
    onFilter, onReset, onPageChange
}) {
    const actionTypes = [
        { value: '', label: 'Semua Tindakan' },
        { value: 'LOGIN', label: 'Log Masuk' },
        { value: 'LOGOUT', label: 'Log Keluar' },
        { value: 'CREATE', label: 'Cipta' },
        { value: 'UPDATE', label: 'Kemaskini' },
        { value: 'DELETE', label: 'Padam' },
        { value: 'DEACTIVATE', label: 'Nyahaktifkan' },
        { value: 'ACTIVATE', label: 'Aktifkan' },
        { value: 'EXPORT', label: 'Eksport' },
        { value: 'IMPORT', label: 'Import' }
    ];

    return (
        <div className="space-y-6">
            <h2 className="text-lg font-semibold text-slate-900">Log Audit & Aktiviti</h2>

            {/* Filters */}
            <div className="bg-white p-4 border border-slate-200">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                        <label className="block text-xs text-slate-500 mb-1">Pengguna</label>
                        <input
                            type="text"
                            placeholder="Emel pengguna..."
                            value={auditFilterUser}
                            onChange={(e) => setAuditFilterUser(e.target.value)}
                            className="w-full px-3 py-2 border border-slate-300 text-sm focus:outline-none focus:border-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-xs text-slate-500 mb-1">Jenis Tindakan</label>
                        <select
                            value={auditFilterAction}
                            onChange={(e) => setAuditFilterAction(e.target.value)}
                            className="w-full px-3 py-2 border border-slate-300 text-sm focus:outline-none focus:border-blue-500 bg-white"
                        >
                            {actionTypes.map(at => <option key={at.value} value={at.value}>{at.label}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs text-slate-500 mb-1">Tarikh Mula</label>
                        <input
                            type="date"
                            value={auditFilterStartDate}
                            onChange={(e) => setAuditFilterStartDate(e.target.value)}
                            className="w-full px-3 py-2 border border-slate-300 text-sm focus:outline-none focus:border-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-xs text-slate-500 mb-1">Tarikh Tamat</label>
                        <input
                            type="date"
                            value={auditFilterEndDate}
                            onChange={(e) => setAuditFilterEndDate(e.target.value)}
                            className="w-full px-3 py-2 border border-slate-300 text-sm focus:outline-none focus:border-blue-500"
                        />
                    </div>
                </div>
                <div className="flex justify-end gap-3 mt-4 pt-3 border-t border-slate-100">
                    <button onClick={onReset} className="px-4 py-2 border border-slate-300 text-slate-700 text-sm hover:bg-slate-50 transition-colors">
                        Reset Penapis
                    </button>
                    <button onClick={onFilter} className="px-4 py-2 bg-blue-700 text-white text-sm hover:bg-blue-800 transition-colors flex items-center gap-2">
                        <Filter className="w-4 h-4" />
                        Tapis
                    </button>
                </div>
            </div>

            {/* Audit Log Table */}
            <div className="bg-white border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-100 text-slate-600 text-xs uppercase tracking-wider">
                                <th className="p-4 font-semibold">Tarikh & Masa</th>
                                <th className="p-4 font-semibold">Pengguna</th>
                                <th className="p-4 font-semibold">Alamat IP</th>
                                <th className="p-4 font-semibold">Jenis Tindakan</th>
                                <th className="p-4 font-semibold">Penerangan</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {auditLogs.length > 0 ? auditLogs.map((log, idx) => (
                                <tr key={log.id || idx} className="hover:bg-slate-50">
                                    <td className="p-4 text-sm text-slate-600 whitespace-nowrap">{log.timestamp || '-'}</td>
                                    <td className="p-4 text-sm text-slate-600">{log.user_email || '-'}</td>
                                    <td className="p-4 text-sm text-slate-500 font-mono">{log.ip_address || '-'}</td>
                                    <td className="p-4">
                                        <span className={`px-2 py-0.5 text-xs font-medium ${getActionBadgeColor(log.action_type)}`}>
                                            {log.action_type || '-'}
                                        </span>
                                    </td>
                                    <td className="p-4 text-sm text-slate-600 max-w-xs truncate">{log.description || '-'}</td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="5" className="p-8 text-center text-slate-400 text-sm">Tiada rekod audit ditemui.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Pagination */}
            {auditTotalPages > 1 && (
                <div className="flex items-center justify-center gap-2">
                    <button
                        onClick={() => onPageChange(auditPage - 1)}
                        disabled={auditPage <= 1}
                        className="px-3 py-1 border border-slate-300 text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50"
                    >
                        Sebelum
                    </button>
                    <span className="text-sm text-slate-600">Halaman {auditPage} / {auditTotalPages}</span>
                    <button
                        onClick={() => onPageChange(auditPage + 1)}
                        disabled={auditPage >= auditTotalPages}
                        className="px-3 py-1 border border-slate-300 text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50"
                    >
                        Seterusnya
                    </button>
                </div>
            )}
        </div>
    );
}

// ==========================================
// KOMPONEN: DELETE CONFIRMATION MODAL
// ==========================================
function DeleteConfirmationModal({ title, message, onConfirm, onCancel }) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white p-6 shadow-xl max-w-sm w-full mx-4">
                <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-red-100">
                    <Trash2 className="w-6 h-6 text-red-600" />
                </div>
                <h3 className="text-lg font-semibold text-center text-slate-900 mb-2">{title}</h3>
                <p className="text-center text-slate-600 text-sm mb-6">{message}</p>
                <div className="flex justify-center gap-3">
                    <button onClick={onCancel} className="px-5 py-2 border border-slate-300 text-slate-700 font-medium hover:bg-slate-50 transition-colors">Batal</button>
                    <button onClick={onConfirm} className="px-5 py-2 bg-red-600 text-white font-medium hover:bg-red-700 transition-colors">Padam</button>
                </div>
            </div>
        </div>
    );
}

// ==========================================
// HELPER: Action Badge Color
// ==========================================
function getActionBadgeColor(actionType) {
    switch (actionType) {
        case 'CREATE': return 'bg-green-100 text-green-700';
        case 'UPDATE': return 'bg-blue-100 text-blue-700';
        case 'DELETE': return 'bg-red-100 text-red-700';
        case 'LOGIN': return 'bg-purple-100 text-purple-700';
        case 'LOGOUT': return 'bg-slate-100 text-slate-700';
        case 'DEACTIVATE': return 'bg-orange-100 text-orange-700';
        case 'ACTIVATE': return 'bg-green-100 text-green-700';
        case 'EXPORT': return 'bg-indigo-100 text-indigo-700';
        case 'IMPORT': return 'bg-teal-100 text-teal-700';
        default: return 'bg-slate-100 text-slate-700';
    }
}