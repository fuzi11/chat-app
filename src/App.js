import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import './App.css';

// ===================================================================
// KONFIGURASI UTAMA
// ===================================================================
const SOCKET_URL = process.env.REACT_APP_SERVER_URL;
const socket = io.connect(SOCKET_URL);

// --- BARU: Komponen untuk menampilkan gambar (Lightbox) ---
function ImageViewer({ imageUrl, onClose }) {
  const stopPropagation = (e) => e.stopPropagation();
  return (
    <div className="image-viewer-overlay" onClick={onClose}>
      <div className="image-viewer-content" onClick={stopPropagation}>
        <button className="close-button" onClick={onClose}>×</button>
        <img src={imageUrl} alt="Tampilan Penuh" />
        <a href={imageUrl} download={`chat-image-${Date.now()}.png`} className="download-button">
          Unduh Gambar
        </a>
      </div>
    </div>
  );
}

// Data Stiker (Genshin Impact)
const STICKERS = [
  { id: 'Ningguang Loves Money', url: 'https://mystickermania.com/cdn/stickers/genshin-impact/genshin-impact-ningguang-loves-money-512x512.png' },
  { id: 'Dendro', url: 'https://mystickermania.com/cdn/stickers/genshin-impact/genshin-impact-dendro-512x512.png' },
  { id: 'Geo', url: 'https://mystickermania.com/cdn/stickers/genshin-impact/genshin-impact-geo-512x512.png' },
  { id: 'Electro', url: 'https://mystickermania.com/cdn/stickers/genshin-impact/genshin-impact-electro-512x512.png' },
  { id: 'Pyro', url: 'https://mystickermania.com/cdn/stickers/genshin-impact/genshin-impact-pyro-512x512.png' },
  { id: 'Anemo', url: 'https://mystickermania.com/cdn/stickers/genshin-impact/genshin-impact-anemo-512x512.png' },
  { id: 'Naganohara Yoimiya Firework', url: 'https://mystickermania.com/cdn/stickers/genshin-impact/genshin-yoimiya-firework-512x512.png' },
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
  const [viewingImage, setViewingImage] = useState(null); // <-- BARU: State untuk melacak gambar
  const chatBodyRef = useRef(null);

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

  const sendMessage = () => {
    if (message.trim() === '' || user.trim() === '') {
      alert("Nama dan pesan tidak boleh kosong.");
      return;
    }

    if (user.toLowerCase() === 'fuzi' && !isModerator) {
      const password = prompt("Mode Moderator: Silakan masukkan password:");
      if (password === "qwerty") {
        setIsModerator(true);
        sendVerifiedMessage(true);
      } else {
        alert("Password salah. Pesan dikirim sebagai user biasa.");
        sendVerifiedMessage(false);
      }
    } else {
      sendVerifiedMessage(isModerator);
    }
  };

  const sendVerifiedMessage = (moderatorStatus) => {
    const messageData = { user, message, isModerator: moderatorStatus };
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
              {/* --- BARU: Tambahkan onClick untuk melihat gambar --- */}
              {content.imageUrl && 
                <img 
                  src={content.imageUrl} 
                  alt="Konten chat" 
                  className="chat-image" 
                  onClick={() => setViewingImage(content.imageUrl)} 
                />
              }
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
          <input 
            type="text"
            value={message} 
            placeholder="Ketik pesan..." 
            onChange={(event) => setMessage(event.target.value)}
            onKeyPress={(event) => {event.key === 'Enter' && sendMessage()}}
          />
          <button onClick={sendMessage}>Kirim</button>
        </div>
      </div>
      
      {/* --- BARU: Tampilkan ImageViewer jika ada gambar yang sedang dilihat --- */}
      {viewingImage && <ImageViewer imageUrl={viewingImage} onClose={() => setViewingImage(null)} />}
    </div>
  );
}

export default App;
