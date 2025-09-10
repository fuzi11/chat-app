import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import './App.css';

// ===================================================================
// KONFIGURASI UTAMA
// ===================================================================
// Kode ini secara otomatis memperbaiki URL dari Environment Variable
const RAW_SOCKET_URL = process.env.REACT_APP_SERVER_URL || 'https://chat-app-backend-production-045f.up.railway.app';
const SOCKET_URL = RAW_SOCKET_URL.replace(/\/$/, ''); // Menghapus / di akhir

const socket = io.connect(SOCKET_URL);

function App() {
  const [user, setUser] = useState('');
  const [message, setMessage] = useState('');
  const [chatLog, setChatLog] = useState([]);
  const [isModerator, setIsModerator] = useState(false);
  const [theme, setTheme] = useState('theme-dark');
  const chatBodyRef = useRef(null);

  const [showCamera, setShowCamera] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    document.body.className = '';
    document.body.classList.add(theme);
  }, [theme]);
  
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

  useEffect(() => {
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
    }
  }, [chatLog]);
  
  function dataURItoBlob(dataURI) {
    const byteString = atob(dataURI.split(',')[1]);
    const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ab], { type: mimeString });
  }

  const sendMessage = async () => {
    if (user.trim() === '') { alert("Nama tidak boleh kosong."); return; }
    if (message.trim() === '' && !capturedImage) { alert("Pesan atau gambar tidak boleh kosong."); return; }

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
      setIsUploading(true);
      try {
        const imageBlob = dataURItoBlob(capturedImage);
        const formData = new FormData();
        formData.append('image', imageBlob, 'upload.png');

        const uploadResponse = await fetch(`${SOCKET_URL}/api/upload-image`, {
          method: 'POST',
          body: formData,
        });
        
        const uploadData = await uploadResponse.json();
        if (!uploadResponse.ok) throw new Error(uploadData.message || "Gagal upload gambar.");
        imageUrlToSend = uploadData.imageUrl;
      } catch (error) {
        console.error("Gagal mengunggah gambar:", error);
        alert("Gagal mengunggah gambar.");
        setCapturedImage(null);
        setIsUploading(false);
        return;
      }
      setIsUploading(false);
    }

    const messageData = { 
      user, 
      message: message.trim(),
      imageUrl: imageUrlToSend,
      isModerator: currentIsModerator 
    };
    
    socket.emit('send_message', messageData);
    setChatLog((list) => [...list, { ...messageData, fromSelf: true, timestamp: new Date().toISOString() }]);
    
    setMessage('');
    setCapturedImage(null);
    setShowCamera(false);
  };
  
  const handleDeleteMessage = (messageId) => {
    socket.emit('delete_message', { messageId, user, isModerator });
  };
  
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return '';
    return new Date(timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  };

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
      alert("Tidak bisa mengakses kamera. Pastikan browser memiliki izin.");
      setShowCamera(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(track => track.stop());
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
      const imageData = canvasRef.current.toDataURL('image/png');
      setCapturedImage(imageData);
      stopCamera();
    }
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => { setCapturedImage(reader.result); };
      reader.readAsDataURL(file);
    }
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
              {content.imageUrl && <img src={content.imageUrl} alt="chat content" className="chat-image" />}
              {content.message && <p className="message-text">{content.message}</p>}
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
          <div className="media-buttons">
            <button onClick={startCamera} title="Buka Kamera">📸</button>
            <input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileChange} style={{ display: 'none' }} />
            <button onClick={() => fileInputRef.current.click()} title="Pilih dari Galeri">🖼️</button>
          </div>
          <input 
            type="text"
            value={message} 
            placeholder={capturedImage ? "Gambar siap dikirim..." : "Ketik pesan..."}
            onChange={(event) => setMessage(event.target.value)}
            onKeyPress={(event) => {event.key === 'Enter' && sendMessage()}}
            disabled={capturedImage !== null}
          />
          <button onClick={sendMessage} disabled={(message.trim() === '' && !capturedImage) || isUploading}>
            {isUploading ? 'Mengirim...' : 'Kirim'}
          </button>
        </div>
      </div>

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

      {capturedImage && !isUploading && (
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
