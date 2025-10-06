/**
 * =================================================================
 * SAKLAR UTAMA (MASTER SWITCH) UNTUK FITUR KUNCI API PENGGUNA
 * =================================================================
 * Ubah nilai variabel di bawah ini untuk mengontrol ketersediaan
 * fitur penggunaan Kunci API Gemini pribadi bagi pengguna.
 *
 * - `true`: Fitur 'Gunakan API Key' akan AKTIF.
 *   Pengguna dapat masuk dan menggunakan Kunci API mereka sendiri.
 *
 * - `false`: Fitur 'Gunakan API Key' akan NONAKTIF.
 *   Opsi untuk memasukkan Kunci API akan disembunyikan di seluruh
 *   aplikasi. Pengguna hanya dapat masuk menggunakan Kode Uji Coba.
 */
export const isApiKeyFeatureEnabled = true;
