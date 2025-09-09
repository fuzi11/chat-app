import './App.css';
import io from 'socket.io-client';
import { useEffect, useState, useRef } from 'react';

// Hubungkan ke server backend menggunakan Environment Variable
const socket = io.connect(process.env.REACT_APP_SERVER_URL);

function App() {
  const [user, setUser] = useState('');
  const [message, setMessage] = useState('');
  const [chatLog, setChatLog] = useState([]);
  const chatBodyRef = useRef(null);

  const scrollToBottom = () => {
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
    }
  };

  const sendMessage = () => {
    if (message.trim() === '' || user.trim() === '') {
      alert("Nama dan pesan tidak boleh kosong.");
      return;
    }

    // --- BARU: Logika Popup Password untuk 'fuzi' ---
    if (user.toLowerCase() === 'fuzi' && !chatLog.some(msg => msg.user?.toLowerCase() === 'fuzi' && msg.fromSelf)) {
        const password = prompt("Anda mencoba mengirim sebagai Moderator. Silakan masukkan password:");
        if (password !== "qwerty") {
            alert("Password salah. Pesan tidak terkirim.");
            return; // Hentikan pengiriman jika password salah
        }
        // Jika password benar, kirim pesan dengan password
        sendVerifiedMessage(password);
    } else {
        // Untuk user biasa atau 'fuzi' yang sudah terverifikasi sebelumnya
        sendVerifiedMessage();
    }
  };

  // --- BARU: Fungsi terpisah untuk mengirim pesan ---
  const sendVerifiedMessage = (password = null) => {
    const messageData = {
      user: user,
      message: message,
      password: password, // Kirim password jika ada
    };
    
    const FUZI_SECRET_PASSWORD = "qwerty";
    const isModerator = user.toLowerCase() === 'fuzi' && password === FUZI_SECRET_PASSWORD;

    socket.emit('send_message', messageData);
    
    setChatLog((list) => [...list, { 
      ...messageData, 
      fromSelf: true, 
      timestamp: new Date().toISOString(),
      isModerator: isModerator
    }]);
    setMessage('');
  }

  useEffect(() => {
    socket.on('chat_history', (history) => setChatLog(history));
    socket.on('receive_message', (data) => setChatLog((list) => [...list, data]));
    return () => {
      socket.off('chat_history');
      socket.off('receive_message');
    };
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [chatLog]);

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return '';
    return new Date(timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="App">
      <div className="chat-container">
        <div className="chat-header">
          <h2>Real-Time Chat</h2>
        </div>
        <div className="chat-body" ref={chatBodyRef}>
          {chatLog.map((content, index) => (
            <div key={index} className={content.fromSelf ? "message-self" : "message-other"}>
              <div className="message-content">
                <p>{content.message}</p>
              </div>
              <div className="message-meta">
                {/* --- BARU: Tampilkan nama dengan style Moderator --- */}
                <p style={{ color: content.isModerator ? 'red' : 'inherit', fontWeight: content.isModerator ? 'bold' : 'normal' }}>
                  {content.fromSelf ? "You" : content.user}
                  {content.isModerator && ' (Moderator)'}
                </p>
                <p>{formatTimestamp(content.timestamp)}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="chat-footer">
          <input 
            type="text" 
            placeholder="Nama Anda..." 
            onChange={(event) => setUser(event.target.value)}
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
