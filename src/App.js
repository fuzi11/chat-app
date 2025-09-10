import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import './App.css';

// ===================================================================
// KONFIGURASI UTAMA
// ===================================================================
const SOCKET_URL = process.env.REACT_APP_SERVER_URL;
const socket = io.connect(SOCKET_URL);

// Data Stiker (Genshin Impact)
const STICKERS = [
  { id: 'Ningguang Loves Money', url: 'https://mystickermania.com/cdn/stickers/genshin-impact/genshin-ningguang-loves-money-512x512.png' },
  { id: 'Dendro', url: 'https://mystickermania.com/cdn/stickers/genshin-impact/genshin-dendro-512x512.png' },
  { id: 'Geo', url: 'https://mystickermania.com/cdn/stickers/genshin-impact/genshin-geo-512x512.png' },
  { id: 'Electro', url: 'https://mystickermania.com/cdn/stickers/genshin-impact/genshin-electro-512x512.png' },
  { id: 'Pyro', url: 'https://mystickermania.com/cdn/stickers/genshin-impact/genshin-pyro-512x512.png' },
  { id: 'Anemo', url: 'https://mystickermania.com/cdn/stickers/genshin-impact/genshin-anemo-512x512.png' },
  { id: 'Naganohara Yoimiya Firework', url: 'https://mystickermania.com/cdn/stickers/genshin-impact/genshin-naganohara-yoimiya-firework-512x512.png' },
  { id: 'Fischl', url: 'https://mystickermania.com/cdn/stickers/genshin-impact/genshin-fischl-512x512.png' },
  { id: 'Collei Embarrassed', url: 'https://mystickermania.com/cdn/stickers/genshin-impact/genshin-collei-embarrassed-512x512.png' },
  { id: 'Tighnari Noisily', url: 'https://mystickermania.com/cdn/stickers/genshin-impact/genshin-tighnari-noisily-512x512.png' },
  { id: 'Diluc Bartender', url: 'https://mystickermania.com/cdn/stickers/genshin-impact/genshin-diluc-bartender-512x512.png' },
  { id: 'Collei Hiding', url: 'https://mystickermania.com/cdn/stickers/genshin-impact/genshin-collei-hiding-512x512.png' },
  { id: 'Keqing Sleeping', url: 'https://mystickermania.com/cdn/stickers/genshin-impact/genshin-keqing-sleeping-512x512.png' },
  { id: 'Diluc Cooking', url: 'https://mystickermania.com/cdn/stickers/genshin-impact/genshin-diluc-cooking-512x512.png' },
  { id: 'Zhongli Meditation', url: 'https://mystickermania.com/cdn/stickers/genshin-impact/genshin-zhongli-meditation-512x512.png' },
  { id: 'Shikanoin Heizou', url: 'https://mystickermania.com/cdn/stickers/genshin-impact/genshin-shikanoin-heizou-512x512.png' },
  { id: 'Mona Heart', url: 'https://mystickermania.com/cdn/stickers/genshin-impact/genshin-mona-heart-512x512.png' },
  { id: 'Sayu With Pillow', url: 'https://mystickermania.com/cdn/stickers/genshin-impact/genshin-sayu-with-pillow-512x512.png' },
  { id: 'Chongyun Eats Ice Cream', url: 'https://mystickermania.com/cdn/stickers/genshin-impact/genshin-chongyun-eats-ice-cream-512x512.png' },
  { id: 'Onikabuto', url: 'https://mystickermania.com/cdn/stickers/genshin-impact/genshin-onikabuto-512x512.png' },
  { id: 'Venti Has an Idea', url: 'https://mystickermania.com/cdn/stickers/genshin-impact/genshin-venti-has-an-idea-512x512.png' },
  { id: 'Klee Bomb', url: 'https://mystickermania.com/cdn/stickers/genshin-impact/genshin-klee-bomb-512x512.png' },
  { id: 'Barbara Embarrassed', url: 'https://mystickermania.com/cdn/stickers/genshin-impact/genshin-barbara-embarrassed-512x512.png' },
  { id: 'Cat Diluc', url: 'https://mystickermania.com/cdn/stickers/genshin-impact/genshin-cat-diluc-512x512.png' },
  { id: 'Paimon', url: 'https://mystickermania.com/cdn/stickers/genshin-impact/genshin-paimon-512x512.png' },
  { id: 'Spirit Soother Smiling', url: 'https://mystickermania.com/cdn/stickers/genshin-impact/genshin-spirit-soother-smiling-512x512.png' },
  { id: 'Kamisato Ayato', url: 'https://mystickermania.com/cdn/stickers/genshin-impact/genshin-kamisato-ayato-512x512.png' },
  { id: 'Yae Miko Gossip', url: 'https://mystickermania.com/cdn/stickers/genshin-impact/genshin-yae-miko-gossip-512x512.png' },
  { id: 'Eula Eats', url: 'https://mystickermania.com/cdn/stickers/genshin-impact/genshin-eula-eats-512x512.png' },
  { id: 'Happy Thoma', url: 'https://mystickermania.com/cdn/stickers/genshin-impact/genshin-happy-thoma-512x512.png' },
  { id: 'Ayaka Smile', url: 'https://mystickermania.com/cdn/stickers/genshin-impact/genshin-ayaka-smile-512x512.png' },
  { id: 'Yun Jin Shows V Sign', url: 'https://mystickermania.com/cdn/stickers/genshin-impact/genshin-yun-jin-shows-v-sign-512x512.png' },
  { id: 'Sayu in Blanket', url: 'https://mystickermania.com/cdn/stickers/genshin-impact/genshin-sayu-in-blanket-512x512.png' },
  { id: 'Hu Tao Mocking', url: 'https://mystickermania.com/cdn/stickers/genshin-impact/genshin-hu-tao-mocking-512x512.png' },
  { id: 'Klee Yelling', url: 'https://mystickermania.com/cdn/stickers/genshin-impact/genshin-klee-yelling-512x512.png' },
  { id: 'Ganyu Sleeping', url: 'https://mystickermania.com/cdn/stickers/genshin-impact/genshin-ganyu-sleeping-512x512.png' },
  { id: 'Ganyu Begs', url: 'https://mystickermania.com/cdn/stickers/genshin-impact/genshin-ganyu-begs-512x512.png' },
  { id: 'Albedo Question', url: 'https://mystickermania.com/cdn/stickers/genshin-impact/genshin-albedo-question-512x512.png' },
  { id: 'Kaeya Crying', url: 'https://mystickermania.com/cdn/stickers/genshin-impact/genshin-kaeya-crying-512x512.png' }
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

    // --- BARU: Minta username saat pertama kali membuka aplikasi ---
    if (!user) {
      const savedUser = localStorage.getItem('chat-app-user');
      if (savedUser) {
        setUser(savedUser);
      } else {
        const newUsername = prompt("Silakan masukkan nama Anda untuk memulai chat:");
        if (newUsername && newUsername.trim() !== '') {
          setUser(newUsername);
          localStorage.setItem('chat-app-user', newUsername);
        }
      }
    }
  }, [user]);
  
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
    if (user.trim() === '') {
      alert("Nama tidak valid. Silakan refresh halaman."); return;
    }
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
    
    // ... Logika upload file (tetap sama) ...

    const messageData = { 
      user, message: message.trim(),
      // imageUrl, videoUrl,
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
    if (file) handleSendMessage(file);
    event.target.value = null; 
  };
  
  const handlePaste = (event) => {
    const items = event.clipboardData.items;
    for (const item of items) {
      if (item.type.indexOf("image") !== -1) {
        const file = item.getAsFile();
        if (window.confirm("Anda ingin mengirim gambar dari clipboard?")) { handleSendMessage(file); }
        event.preventDefault(); return;
      }
    }
  };

  const findStickerUrl = (id) => STICKERS.find(s => s.id === id)?.url || '';

  return (
    <div className="App">
      <div className="chat-container">
        <div className="chat-header">
          <h2>{user ? `Chat sebagai ${user}` : "Real-Time Chat"}</h2>
          <div className="theme-switcher">
            <button onClick={() => setTheme('theme-dark')} title="Mode Gelap">🌙</button>
            <button onClick={() => setTheme('theme-light')} title="Mode Terang">☀️</button>
          </div>
        </div>
        <div className="chat-body" ref={chatBodyRef}>
          {chatLog.map((content) => (
            <div key={content._id || Math.random()} className={`message-bubble ${content.stickerId ? 'sticker-message' : ''} ${content.fromSelf ? 'self' : ''}`}>
              {/* ... (logika tampilan pesan tetap sama) ... */}
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

        {/* --- BARU: STRUKTUR FOOTER SEPERTI WHATSAPP --- */}
        <div className="chat-footer">
          <div className="footer-buttons">
            <button onClick={() => setShowStickers(!showStickers)} title="Kirim Stiker">😃</button>
            <input type="file" accept="image/*,video/*" ref={fileInputRef} onChange={handleFileChange} style={{ display: 'none' }} />
            <button onClick={() => fileInputRef.current.click()} title="Kirim Gambar/Video">📎</button>
          </div>
          <textarea
            rows="1"
            value={message} 
            placeholder="Ketik pesan..." 
            onChange={(e) => {
              setMessage(e.target.value);
              // Auto-resize textarea
              e.target.style.height = 'auto';
              e.target.style.height = (e.target.scrollHeight) + 'px';
            }}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            onPaste={handlePaste}
          />
          <button className="send-button" onClick={() => handleSendMessage()} disabled={isUploading}>
            {isUploading ? '...' : '➤'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
