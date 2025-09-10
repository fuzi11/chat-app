import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import './App.css';

// ===================================================================
// KONFIGURASI UTAMA
// ===================================================================
const SOCKET_URL = process.env.REACT_APP_SERVER_URL;
const socket = io.connect(SOCKET_URL);

// --- BARU: Daftar Stiker Genshin Impact ---
const STICKERS = [
  { id: 'paimon-ok', url: 'https://static.wikia.nocookie.net/gensin-impact/images/6/69/Icon_Emoji_Paimon%27s_Paintings_01.png' },
  { id: 'paimon-love', url: 'https://static.wikia.nocookie.net/gensin-impact/images/a/a3/Icon_Emoji_Paimon%27s_Paintings_02.png' },
  { id: 'paimon-hungry', url: 'https://static.wikia.nocookie.net/gensin-impact/images/a/a5/Icon_Emoji_Paimon%27s_Paintings_03.png' },
  { id: 'paimon-scared', url: 'https://static.wikia.nocookie.net/gensin-impact/images/3/30/Icon_Emoji_Paimon%27s_Paintings_05.png' },
  { id: 'klee-boom', url: 'https://static.wikia.nocookie.net/gensin-impact/images/c/c3/Icon_Emoji_Paimon%27s_Paintings_09.png' },
  { id: 'zhongli-order', url: 'https://static.wikia.nocookie.net/gensin-impact/images/e/e8/Icon_Emoji_Paimon%27s_Paintings_16.png' },
  { id: 'qiqi-fallen', url: 'https://static.wikia.nocookie.net/gensin-impact/images/6/6f/Icon_Emoji_Paimon%27s_Paintings_20.png' },
  { id: 'ayaka-tea', url: 'https://static.wikia.nocookie.net/gensin-impact/images/3/3a/Icon_Emoji_Ayaka_2.png' },
];

// Fungsi bantuan untuk mengubah file menjadi Base64
const fileToBase64 = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
});

function App() {
  const [user, setUser] = useState('');
  const [message, setMessage] = useState('');
  const [chatLog, setChatLog] = useState([]);
  const [isModerator, setIsModerator] = useState(false);
  const [theme, setTheme] = useState('theme-dark');
  const [showStickers, setShowStickers] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const chatBodyRef = useRef(null);
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

  const handleSendMessage = async (mediaFile = null, stickerId = null) => {
    if (user.trim() === '') { alert("Nama tidak boleh kosong."); return; }
    if (message.trim() === '' && !mediaFile && !stickerId) { return; }

    let currentIsModerator = isModerator;
    if (user.toLowerCase() === 'fuzi' && !isModerator) {
      const password = prompt("Mode Moderator: Silakan masukkan password:");
      if (password === "qwerty") {
        currentIsModerator = true;
        setIsModerator(true);
      } else {
        alert("Password salah.");
        // Kirim sebagai user biasa jika ada pesan/stiker
        if(message.trim() === '' && !stickerId) return;
        currentIsModerator = false;
      }
    }
    
    let mediaUrl = '';
    let mediaType = '';

    if (mediaFile) {
        setIsUploading(true);
        // Placeholder untuk logika upload. Ganti dengan implementasi Cloudinary Anda.
        try {
            console.log("Simulasi mengunggah file:", mediaFile.name);
            alert("Fitur upload belum terhubung ke backend Cloudinary. Ini hanya simulasi frontend.");
            // const base64File = await fileToBase64(mediaFile);
            // const uploadResponse = await fetch(`${SOCKET_URL}/api/upload-media`, ...);
            // const uploadData = await uploadResponse.json();
            // mediaUrl = uploadData.mediaUrl;
            // mediaType = uploadData.mediaType;
        } catch (error) {
            console.error("Gagal mengunggah file:", error);
            alert("Gagal mengunggah file.");
        } finally {
            setIsUploading(false);
        }
    }

    const messageData = { 
      user, 
      message: message.trim(),
      // imageUrl: mediaType === 'image' ? mediaUrl : '',
      // videoUrl: mediaType === 'video' ? mediaUrl : '',
      stickerId: stickerId || '',
      isModerator: currentIsModerator 
    };
    
    socket.emit('send_message', messageData);
    setChatLog((list) => [...list, { ...messageData, fromSelf: true, timestamp: new Date().toISOString() }]);
    
    setMessage('');
  };
  
  const handleDeleteMessage = (messageId) => {
    socket.emit('delete_message', { messageId, user, isModerator });
  };
  
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return '';
    return new Date(timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  };
  
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
        if(file.size > 25 * 1024 * 1024) { // Batas 25MB
            alert("Ukuran file terlalu besar. Maksimal 25MB.");
            return;
        }
        handleSendMessage(file);
    }
    event.target.value = null; 
  };
  
  // --- BARU: Fungsi untuk menangani paste dari keyboard ---
  const handlePaste = (event) => {
    const items = event.clipboardData.items;
    for (const item of items) {
      if (item.type.indexOf("image") !== -1) {
        const file = item.getAsFile();
        // Cek jika user ingin mengirim gambar yang di-paste
        if (window.confirm("Anda ingin mengirim gambar dari clipboard?")) {
            handleSendMessage(file);
        }
        event.preventDefault(); // Mencegah gambar di-paste sebagai teks
        return;
      }
    }
  };

  const findStickerUrl = (id) => {
      const sticker = STICKERS.find(s => s.id === id);
      return sticker ? sticker.url : '';
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
            <div key={content._id || Math.random()} className={`message-bubble ${content.stickerId ? 'sticker-message' : ''} ${content.fromSelf ? 'self' : ''}`}>
              {!content.stickerId && (
                <div className="message-header">
                  <span style={{ color: content.isModerator ? 'var(--accent-secondary)' : 'var(--accent-primary)', fontWeight: 'bold' }}>
                    {content.fromSelf ? "You" : content.user}
                    {content.isModerator && ' (Moderator)'}
                  </span>
                  <span className="timestamp">{formatTimestamp(content.timestamp)}</span>
                </div>
              )}
              {content.imageUrl && <img src={content.imageUrl} alt="Konten chat" className="chat-image" />}
              {content.videoUrl && <video src={content.videoUrl} controls className="chat-video" />}
              {content.stickerId && <img src={findStickerUrl(content.stickerId)} alt={content.stickerId} className="chat-sticker" />}
              {content.message && <p className="message-text">{content.message}</p>}
              {isModerator && !content.fromSelf && !content.isDeleted && (
                <button className="delete-button" onClick={() => handleDeleteMessage(content._id)}>×</button>
              )}
            </div>
          ))}
        </div>
        {showStickers && (
            <div className="sticker-palette">
                {STICKERS.map(sticker => (
                    <img key={sticker.id} src={sticker.url} alt={sticker.id} onClick={() => {
                        handleSendMessage(null, sticker.id);
                        setShowStickers(false);
                    }}/>
                ))}
            </div>
        )}
        <div className="chat-footer">
          <input 
            type="text" 
            placeholder="Nama Anda..." 
            onChange={(event) => setUser(event.target.value)}
            disabled={isModerator && user.toLowerCase() === 'fuzi'}
            value={user}
          />
          <div className="media-buttons">
            <button onClick={startCamera} title="Buka Kamera">📸</button> {/* <-- TAMBAHKAN TOMBOL INI */}
            <button onClick={() => setShowStickers(!showStickers)} title="Kirim Stiker">😃</button>
            <input type="file" accept="image/*,video/*" ref={fileInputRef} onChange={handleFileChange} style={{ display: 'none' }} />
            <button onClick={() => fileInputRef.current.click()} title="Kirim Gambar/Video">📎</button>
          </div>
          <input 
            type="text"
            value={message} 
            placeholder="Ketik pesan..." 
            onChange={(event) => setMessage(event.target.value)}
            onKeyPress={(event) => {event.key === 'Enter' && handleSendMessage()}}
            onPaste={handlePaste} /* <-- BARU: Tambahkan event listener paste */
          />
          <button onClick={() => handleSendMessage()} disabled={isUploading}>
            {isUploading ? 'Mengirim...' : 'Kirim'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
