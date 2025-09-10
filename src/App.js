import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import './App.css';

// ===================================================================
// KONFIGURASI UTAMA
// ===================================================================
const SOCKET_URL = process.env.REACT_APP_SERVER_URL;
const socket = io.connect(SOCKET_URL);

function App() {
  const [user, setUser] = useState('');
  const [message, setMessage] = useState('');
  const [chatLog, setChatLog] = useState([]);
  const [isModerator, setIsModerator] = useState(false);
  const [theme, setTheme] = useState('theme-dark');
  const chatBodyRef = useRef(null);

  // --- BARU: State untuk fitur kamera/gambar ---
  const [showCamera, setShowCamera] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null); // Base64 atau URL blob
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null); // Untuk input file dari galeri

  // --- EFEK UNTUK MENGUBAH TEMA ---
  useEffect(() => {
    document.body.className = '';
    document.body.classList.add(theme);
  }, [theme]);
  
  // --- EFEK UNTUK MENGELOLA KONEKSI SOCKET ---
  useEffect(() => {
    socket.on('chat_history', (history) => setChatLog(history));
    socket.on('receive_message', (data) => setChatLog((list) => [...list, data]));
    socket.on('message_updated', (updatedMessage) => {
      setChatLog(prevLog => prevLog.map(msg => msg._id === updatedMessage._id ? updatedMessage : msg));
    });
    return () => {
      socket.off('chat_history');
      socket.off('receive_message');
      socket.off('message_updated');
    };
  }, []);

  // --- EFEK UNTUK AUTO-SCROLL ---
  useEffect(() => {
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
    }
  }, [chatLog]);

  // --- FUNGSI UNTUK MENGIRIM PESAN ATAU GAMBAR ---
  const sendMessage = async () => {
    if (user.trim() === '') {
      alert("Nama tidak boleh kosong.");
      return;
    }

    if (message.trim() === '' && !capturedImage) {
      alert("Pesan atau gambar tidak boleh kosong.");
      return;
    }

    // Verifikasi moderator
    let currentIsModerator = isModerator;
    if (user.toLowerCase() === 'fuzi' && !isModerator) {
      const password = prompt("Mode Moderator: Silakan masukkan password:");
      if (password === "qwerty") {
        currentIsModerator = true;
        setIsModerator(true);
      } else {
        alert("Password salah. Pesan dikirim sebagai user biasa.");
        currentIsModerator = false;
      }
    }

    let imageUrlToSend = '';
    if (capturedImage) {
      // --- LOGIKA UPLOAD GAMBAR KE BACKEND ---
      // Ini adalah bagian yang MEMBUTUHKAN IMPLEMENTASI BACKEND FILE UPLOAD
      // Contoh ini ASUMSIKAN backend Anda memiliki endpoint /api/upload-image
      // yang menerima base64 atau FormData dan mengembalikan URL
      try {
        const uploadResponse = await fetch(`${SOCKET_URL}/api/upload-image`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image: capturedImage }) // Mengirim base64
          // ATAU jika backend Anda mengharapkan FormData:
          // const formData = new FormData();
          // formData.append('image', dataURItoBlob(capturedImage));
          // body: formData
        });
        const uploadData = await uploadResponse.json();
        if (!uploadResponse.ok) throw new Error(uploadData.message || "Gagal upload gambar.");
        imageUrlToSend = uploadData.imageUrl;
      } catch (error) {
        console.error("Gagal mengunggah gambar:", error);
        alert("Gagal mengunggah gambar.");
        setCapturedImage(null);
        return;
      }
    }

    const messageData = { 
      user, 
      message: message.trim(), // Pastikan pesan tidak kosong string jika hanya gambar
      imageUrl: imageUrlToSend, // Sertakan URL gambar
      isModerator: currentIsModerator 
    };
    
    socket.emit('send_message', messageData);
    setChatLog((list) => [...list, { ...messageData, fromSelf: true, timestamp: new Date().toISOString() }]);
    
    setMessage('');
    setCapturedImage(null); // Reset gambar setelah dikirim
    setShowCamera(false); // Sembunyikan kamera jika sedang tampil
  };
  
  // --- FUNGSI UNTUK MENGHAPUS PESAN ---
  const handleDeleteMessage = (messageId) => {
    socket.emit('delete_message', { messageId, user, isModerator });
  };
  
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return '';
    return new Date(timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  };

  // --- BARU: FUNGSI KAMERA ---
  const startCamera = async () => {
    setCapturedImage(null);
    setShowCamera(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err) {
      console.error("Gagal mengakses kamera:", err);
      alert("Tidak bisa mengakses kamera. Pastikan browser memiliki izin.");
      setShowCamera(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setShowCamera(false);
  };

  const takePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      canvasRef.current.width = videoRef.current.videoWidth;
      canvasRef.current.height = videoRef.current.videoHeight;
      context.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);
      const imageData = canvasRef.current.toDataURL('image/png'); // Ambil gambar sebagai Base64
      setCapturedImage(imageData);
      stopCamera(); // Hentikan kamera setelah foto diambil
    }
  };

  // --- BARU: FUNGSI PILIH FILE DARI GALERI ---
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCapturedImage(reader.result); // Simpan sebagai Base64
      };
      reader.readAsDataURL(file);
    }
    // Reset input agar bisa memilih file yang sama lagi jika dibatalkan
    event.target.value = null; 
  };

  return (
    <div className="App">
      <div className="chat-container">
        <div className="chat-header">
          <h2>Real-Time Chat</h2>
          <div className="theme-switcher">
            <button onClick={() => setTheme('theme-dark')} title="Mode Gelap">🌙</button>
            <button onClick={() => setTheme('theme-light')} title="Mode Terang">☀️</button>
          </div>
        </div>
        <div className="chat-body" ref={chatBodyRef}>
          {chatLog.map((content) => (
            <div key={content._id || Math.random()} className={`message-bubble ${content.fromSelf ? 'self' : ''}`}>
              <div className="message-header">
                <span style={{ color: content.isModerator ? 'var(--accent-secondary)' : 'var(--accent-primary)', fontWeight: 'bold' }}>
                  {content.fromSelf ? "You" : content.user}
                  {content.isModerator && ' (Moderator)'}
                </span>
                <span className="timestamp">{formatTimestamp(content.timestamp)}</span>
              </div>
              {content.message && <p className="message-text">{content.message}</p>}
              {content.imageUrl && <img src={content.imageUrl} alt="chat image" className="chat-image" />}
              {isModerator && !content.fromSelf && !content.isDeleted && (
                <button className="delete-button" onClick={() => handleDeleteMessage(content._id)}>×</button>
              )}
            </div>
          ))}
        </div>
        <div className="chat-footer">
          <input 
            type="text" 
            placeholder="Nama Anda..." 
            onChange={(event) => setUser(event.target.value)}
            disabled={isModerator && user.toLowerCase() === 'fuzi'}
            value={user}
          />
          {/* --- TOMBOL UNTUK KAMERA DAN GALERI --- */}
          <div className="media-buttons">
            <button onClick={startCamera} className="camera-button" title="Buka Kamera">📸</button>
            <input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileChange} style={{ display: 'none' }} />
            <button onClick={() => fileInputRef.current.click()} className="gallery-button" title="Pilih dari Galeri">🖼️</button>
          </div>
          
          <input 
            type="text"
            value={message} 
            placeholder="Ketik pesan..." 
            onChange={(event) => setMessage(event.target.value)}
            onKeyPress={(event) => {event.key === 'Enter' && sendMessage()}}
            disabled={capturedImage !== null} /* Disable jika ada gambar menunggu */
          />
          <button onClick={sendMessage} disabled={message.trim() === '' && !capturedImage}>Kirim</button>
        </div>
      </div>

      {/* --- MODAL KAMERA --- */}
      {showCamera && (
        <div className="camera-modal-overlay">
          <div className="camera-modal">
            <h3>Ambil Foto</h3>
            <video ref={videoRef} className="camera-preview" autoPlay playsInline></video>
            <canvas ref={canvasRef} style={{ display: 'none' }}></canvas>
            <div className="camera-controls">
              <button onClick={takePhoto} className="take-photo-button">Ambil Foto</button>
              <button onClick={stopCamera} className="cancel-button">Batal</button>
            </div>
          </div>
        </div>
      )}

      {/* --- PREVIEW GAMBAR YANG DIAMBIL/DIPILIH --- */}
      {capturedImage && (
        <div className="image-preview-overlay">
          <div className="image-preview-modal">
            <h3>Preview Gambar</h3>
            <img src={capturedImage} alt="Preview" className="captured-image-preview" />
            <div className="preview-actions">
              <button onClick={() => setCapturedImage(null)} className="cancel-button">Batal</button>
              <button onClick={sendMessage} className="send-image-button">Kirim Gambar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
