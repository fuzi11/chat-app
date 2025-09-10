import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import './App.css';

// ===================================================================
// KONFIGURASI UTAMA
// ===================================================================
const RAW_SOCKET_URL = process.env.REACT_APP_SERVER_URL || '';
const SOCKET_URL = RAW_SOCKET_URL.replace(/\/$/, ''); // Otomatis menghapus / di akhir
const socket = io.connect(SOCKET_URL);

// Data Stiker (Genshin Impact)
const STICKERS = [
  { id: 'Ningguang Loves Money', url: 'https://mystickermania.com/cdn/stickers/genshin-impact/genshin-impact-ningguang-loves-money-512x512.png' },
  { id: 'Dendro', url: 'https://mystickermania.com/cdn/stickers/genshin-impact/genshin-impact-dendro-512x512.png' },
  { id: 'Geo', url: 'https://mystickermania.com/cdn/stickers/genshin-impact/genshin-impact-geo-512x512.png' },
  { id: 'Electro', url: 'https://mystickermania.com/cdn/stickers/genshin-impact/genshin-impact-electro-512x512.png' },
  { id: 'Pyro', url: 'https://mystickermania.com/cdn/stickers/genshin-impact/genshin-impact-pyro-512x512.png' },
  { id: 'Anemo', url: 'https://mystickermania.com/cdn/stickers/genshin-impact/genshin-impact-anemo-512x512.png' },
  { id: 'Naganohara Yoimiya Firework', url: 'https://mystickermania.com/cdn/stickers/genshin-impact/genshin-impact-naganohara-yoimiya-firework-512x512.png' },
  { id: 'Fischl', url: 'https://mystickermania.com/cdn/stickers/genshin-impact/genshin-impact-fischl-512x512.png' },
  { id: 'Collei Embarrassed', url: 'https://mystickermania.com/cdn/stickers/genshin-impact/genshin-impact-collei-embarrassed-512x512.png' },
  { id: 'Tighnari Noisily', url: 'https://mystickermania.com/cdn/stickers/genshin-impact/genshin-impact-tighnari-noisily-512x512.png' },
  { id: 'Diluc Bartender', url: 'https://mystickermania.com/cdn/stickers/genshin-impact/genshin-impact-diluc-bartender-512x512.png' },
  { id: 'Collei Hiding', url: 'https://mystickermania.com/cdn/stickers/genshin-impact/genshin-impact-collei-hiding-512x512.png' },
  { id: 'Keqing Sleeping', url: 'https://mystickermania.com/cdn/stickers/genshin-impact/genshin-impact-keqing-sleeping-512x512.png' },
  { id: 'Diluc Cooking', url: 'https://mystickermania.com/cdn/stickers/genshin-impact/genshin-impact-diluc-cooking-512x512.png' },
  { id: 'Zhongli Meditation', url: 'https://mystickermania.com/cdn/stickers/genshin-impact/genshin-impact-zhongli-meditation-512x512.png' },
  { id: 'Shikanoin Heizou', url: 'https://mystickermania.com/cdn/stickers/genshin-impact/genshin-impact-shikanoin-heizou-512x512.png' },
  { id: 'Mona Heart', url: 'https://mystickermania.com/cdn/stickers/genshin-impact/genshin-impact-mona-heart-512x512.png' },
  { id: 'Sayu With Pillow', url: 'https://mystickermania.com/cdn/stickers/genshin-impact/genshin-impact-sayu-with-pillow-512x512.png' },
  { id: 'Chongyun Eats Ice Cream', url: 'https://mystickermania.com/cdn/stickers/genshin-impact/genshin-impact-chongyun-eats-ice-cream-512x512.png' },
  { id: 'Onikabuto', url: 'https://mystickermania.com/cdn/stickers/genshin-impact/genshin-impact-onikabuto-512x512.png' },
  { id: 'Venti Has an Idea', url: 'https://mystickermania.com/cdn/stickers/genshin-impact/genshin-impact-venti-has-an-idea-512x512.png' },
  { id: 'Klee Bomb', url: 'https://mystickermania.com/cdn/stickers/genshin-impact/genshin-impact-klee-bomb-512x512.png' },
  { id: 'Barbara Embarrassed', url: 'https://mystickermania.com/cdn/stickers/genshin-impact/genshin-impact-barbara-embarrassed-512x512.png' },
  { id: 'Cat Diluc', url: 'https://mystickermania.com/cdn/stickers/genshin-impact/genshin-impact-cat-diluc-512x512.png' },
  { id: 'Paimon', url: 'https://mystickermania.com/cdn/stickers/genshin-impact/genshin-impact-paimon-512x512.png' },
  { id: 'Spirit Soother Smiling', url: 'https://mystickermania.com/cdn/stickers/genshin-impact/genshin-impact-spirit-soother-smiling-512x512.png' },
  { id: 'Kamisato Ayato', url: 'https://mystickermania.com/cdn/stickers/genshin-impact/genshin-impact-kamisato-ayato-512x512.png' },
  { id: 'Yae Miko Gossip', url: 'https://mystickermania.com/cdn/stickers/genshin-impact/genshin-impact-yae-miko-gossip-512x512.png' },
  { id: 'Eula Eats', url: 'https://mystickermania.com/cdn/stickers/genshin-impact/genshin-impact-eula-eats-512x512.png' },
  { id: 'Happy Thoma', url: 'https://mystickermania.com/cdn/stickers/genshin-impact/genshin-impact-happy-thoma-512x512.png' },
  { id: 'Ayaka Smile', url: 'https://mystickermania.com/cdn/stickers/genshin-impact/genshin-impact-ayaka-smile-512x512.png' },
  { id: 'Yun Jin Shows V Sign', url: 'https://mystickermania.com/cdn/stickers/genshin-impact/genshin-impact-yun-jin-shows-v-sign-512x512.png' },
  { id: 'Sayu in Blanket', url: 'https://mystickermania.com/cdn/stickers/genshin-impact/genshin-impact-sayu-in-blanket-512x512.png' },
  { id: 'Hu Tao Mocking', url: 'https://mystickermania.com/cdn/stickers/genshin-impact/genshin-impact-hu-tao-mocking-512x512.png' },
  { id: 'Klee Yelling', url: 'https://mystickermania.com/cdn/stickers/genshin-impact/genshin-impact-klee-yelling-512x512.png' },
  { id: 'Ganyu Sleeping', url: 'https://mystickermania.com/cdn/stickers/genshin-impact/genshin-impact-ganyu-sleeping-512x512.png' },
  { id: 'Ganyu Begs', url: 'https://mystickermania.com/cdn/stickers/genshin-impact/genshin-impact-ganyu-begs-512x512.png' },
  { id: 'Albedo Question', url: 'https://mystickermania.com/cdn/stickers/genshin-impact/genshin-impact-albedo-question-512x512.png' },
  { id: 'Kaeya Crying', url: 'https://mystickermania.com/cdn/stickers/genshin-impact/genshin-impact-kaeya-crying-512x512.png' },
];



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
        if(message.trim() === '' && !stickerId) return;
        currentIsModerator = false;
      }
    }
    
    let imageUrl = '';
    let videoUrl = '';

    // --- BARU: LOGIKA UPLOAD FILE YANG SEBENARNYA ---
    if (mediaFile) {
        setIsUploading(true);
        try {
            const formData = new FormData();
            formData.append('image', mediaFile); // Backend mengharapkan field bernama 'image'

            const uploadResponse = await fetch(`${SOCKET_URL}/api/upload-image`, {
                method: 'POST',
                body: formData,
            });
            
            const uploadData = await uploadResponse.json();

            if (!uploadResponse.ok) {
                throw new Error(uploadData.message || 'Gagal mengunggah file.');
            }
            
            // Tentukan apakah itu gambar atau video berdasarkan tipe file
            if (mediaFile.type.startsWith('image/')) {
                imageUrl = uploadData.imageUrl;
            } else if (mediaFile.type.startsWith('video/')) {
                videoUrl = uploadData.imageUrl; // Cloudinary mengembalikan URL yang sama untuk video
            }

        } catch (error) {
            console.error("Gagal mengunggah file:", error);
            alert(`Gagal mengunggah file: ${error.message}`);
            setIsUploading(false);
            return;
        } finally {
            setIsUploading(false);
        }
    }

    const messageData = { 
      user, 
      message: message.trim(),
      imageUrl: imageUrl,
      videoUrl: videoUrl,
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
  
  const handlePaste = (event) => {
    const items = event.clipboardData.items;
    for (const item of items) {
      if (item.type.indexOf("image") !== -1) {
        const file = item.getAsFile();
        if (window.confirm("Anda ingin mengirim gambar dari clipboard?")) {
            handleSendMessage(file);
        }
        event.preventDefault();
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
          <h2>PERKUMPULAN RAHASIA</h2>
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
            onPaste={handlePaste}
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
