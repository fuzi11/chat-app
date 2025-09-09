import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import './App.css';

// ===================================================================
// KONFIGURASI UTAMA
// ===================================================================
// Pastikan variabel REACT_APP_SERVER_URL sudah diatur di Vercel
const SOCKET_URL = process.env.REACT_APP_SERVER_URL;
const socket = io.connect(SOCKET_URL);

function App() {
  const [user, setUser] = useState('');
  const [message, setMessage] = useState('');
  const [chatLog, setChatLog] = useState([]);
  const [isModerator, setIsModerator] = useState(false); // Mengingat status moderator
  const [theme, setTheme] = useState('theme-dark'); // State untuk tema
  const chatBodyRef = useRef(null);

  // --- EFEK UNTUK MENGUBAH TEMA ---
  useEffect(() => {
    document.body.className = ''; // Hapus semua class tema sebelumnya
    document.body.classList.add(theme); // Tambahkan class tema saat ini
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

  // --- FUNGSI UNTUK MENGIRIM PESAN ---
  const sendMessage = () => {
    if (message.trim() === '' || user.trim() === '') {
      alert("Nama dan pesan tidak boleh kosong.");
      return;
    }

    // Cek jika user adalah 'fuzi' dan belum terverifikasi
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
  
  // --- FUNGSI UNTUK MENGHAPUS PESAN ---
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
          {/* --- TOMBOL GANTI TEMA --- */}
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
              <p className="message-text">{content.message}</p>
              {/* --- TOMBOL HAPUS KHUSUS MODERATOR --- */}
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
    </div>
  );
}

export default App;
