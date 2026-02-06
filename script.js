// Data kandidat (hardcode 6 kandidat contoh - bisa diganti)
const candidates = [
    { id: 1, name: "Abdad Dewo Saputro", jurusan: "Matematika", visi: "Meningkatkan prestasi olimpiade", misi: "Pelatihan intensif dan kolaborasi" },
    { id: 2, name: "Zahirah Queensha Nurambiya", jurusan: "Matematika", visi: "Inovasi dalam sains", misi: "Workshop dan kompetisi rutin" },
    { id: 3, name: "Tsar Serkan", jurusan: "Ilmu Pengetahuan Alam", visi: "Eksplorasi ilmu pengetahuan", misi: "Eksperimen dan penelitian" },
    { id: 4, name: "", jurusan: "Ilmu Pengetahuan Alam", visi: "", misi: "Kampanye dan edukasi" },
    { id: 5, name: "Damara Aquene", jurusan: "Ilmu Pengetahuan Sosial", visi: "Teknologi masa depan", misi: "Coding bootcamp dan hackathon" },

// Fungsi untuk menyimpan data ke localStorage (seperti database sederhana)
function saveToStorage(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
}

// Fungsi untuk mengambil data dari localStorage
function getFromStorage(key) {
    return JSON.parse(localStorage.getItem(key)) || {};
}

// Inisialisasi data voting jika belum ada
if (!localStorage.getItem('votes')) {
    const initialVotes = {};
    candidates.forEach(c => initialVotes[c.id] = 0);
    saveToStorage('votes', initialVotes);
}
if (!localStorage.getItem('votedNIK')) {
    saveToStorage('votedNIK', {});
}

// Fungsi login
document.getElementById('loginForm')?.addEventListener('submit', function(e) {
    e.preventDefault(); // Mencegah reload halaman
    const role = document.getElementById('role').value;
    const errorMsg = document.getElementById('errorMessage');
    errorMsg.textContent = ''; // Reset pesan error

    if (role === 'siswa') {
        const nik = document.getElementById('nik').value.trim();
        if (!nik) {
            errorMsg.textContent = 'NIK tidak boleh kosong!';
            return;
        }
        // Simpan NIK sebagai user yang login
        saveToStorage('currentUser', { role: 'siswa', nik: nik });
        window.location.href = 'voting.html'; // Redirect ke voting
    } else if (role === 'admin') {
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value.trim();
        if (!username || !password) {
            errorMsg.textContent = 'Username dan password tidak boleh kosong!';
            return;
        }
        if (username === 'admin' && password === 'admin123') {
            saveToStorage('currentUser', { role: 'admin' });
            window.location.href = 'admin.html'; // Redirect ke admin
        } else {
            errorMsg.textContent = 'Username atau password salah!';
        }
    }
});

// Toggle field berdasarkan role (siswa/admin)
document.getElementById('role')?.addEventListener('change', function() {
    const role = this.value;
    document.getElementById('siswaFields').style.display = role === 'siswa' ? 'block' : 'none';
    document.getElementById('adminFields').style.display = role === 'admin' ? 'block' : 'none';
});

// Fungsi logout
function logout() {
    localStorage.removeItem('currentUser');
    window.location.href = 'index.html';
}

// Validasi akses halaman (cek login)
function checkAccess(requiredRole) {
    const user = getFromStorage('currentUser');
    if (!user || user.role !== requiredRole) {
        window.location.href = 'index.html'; // Redirect jika tidak login atau role salah
    }
    return user;
}

// Untuk voting.html: Tampilkan kandidat atau pesan sudah voting
if (window.location.pathname.includes('voting.html')) {
    const user = checkAccess('siswa');
    const votedNIK = getFromStorage('votedNIK');
    const statusMsg = document.getElementById('statusMessage');
    const container = document.getElementById('candidatesContainer');

    if (votedNIK[user.nik]) {
        statusMsg.textContent = 'Anda sudah melakukan voting. Terima kasih!';
        container.style.display = 'none'; // Sembunyikan kartu
    } else {
        // Tampilkan kartu kandidat
        candidates.forEach(c => {
            const card = document.createElement('div');
            card.className = 'card';
            card.innerHTML = `
                <h3>${c.name}</h3>
                <p><strong>Jurusan:</strong> ${c.jurusan}</p>
                <p><strong>Visi:</strong> ${c.visi}</p>
                <p><strong>Misi:</strong> ${c.misi}</p>
                <button onclick="vote(${c.id})">Pilih</button>
            `;
            container.appendChild(card);
        });
    }
}

// Fungsi voting
function vote(candidateId) {
    const user = getFromStorage('currentUser');
    const votedNISN = getFromStorage('votedNISN');
    const votes = getFromStorage('votes');

    if (votedNISN[user.nisn]) {
        alert('Anda sudah voting!');
        return;
    }

    // Tambah suara kandidat
    votes[candidateId]++;
    saveToStorage('votes', votes);

    // Tandai NIK sudah voting
    votedNIK[user.nik] = true;
    saveToStorage('votedNIK', votedNIK);

    alert('Voting berhasil! Terima kasih.');
    window.location.reload(); // Reload untuk update tampilan
}

// Untuk admin.html: Tampilkan hasil voting
if (window.location.pathname.includes('admin.html')) {
    checkAccess('admin');
    const votes = getFromStorage('votes');
    const resultsDiv = document.getElementById('results');

    resultsDiv.innerHTML = '<h3>Jumlah Suara:</h3>';
    candidates.forEach(c => {
        resultsDiv.innerHTML += `<p>${c.name} (${c.jurusan}): ${votes[c.id]} suara</p>`;
    });

    // Tombol reset
    document.getElementById('resetBtn').addEventListener('click', function() {
        if (confirm('Yakin reset voting? Semua data akan hilang!')) {
            localStorage.removeItem('votes');
            localStorage.removeItem('votedNISN');
            // Re-inisialisasi
            const initialVotes = {};
            candidates.forEach(c => initialVotes[c.id] = 0);
            saveToStorage('votes', initialVotes);
            saveToStorage('votedNIK', {});
            alert('Voting direset!');
            window.location.reload();
        }
    });
}