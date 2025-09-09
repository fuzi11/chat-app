import './App.css';
import io from 'socket.io-client';
import { useEffect, useState, useRef } from 'react';

// Hubungkan ke server backend menggunakan Environment Variable
const socket = io.connect(process.env.REACT_APP_SERVER_URL);

function App() {
  const [user, setUser] = useState('');
  const [message, setMessage] = useState('');
  const [chatLog, setChatLog] = useState([]);
  const [isModerator, setIsModerator] = useState(false); // State untuk mengingat status moderator
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

    // Cek jika user adalah 'fuzi' dan BELUM terverifikasi sebagai moderator
    if (user.toLowerCase() === 'fuzi' && !isModerator) {
      const password = prompt("Mode Moderator: Silakan masukkan password:");
      if (password === "qwerty") {
        setIsModerator(true); // Verifikasi berhasil, simpan status moderator
        sendVerifiedMessage(true); // Kirim pesan sebagai moderator
      } else {
        alert("Password salah. Pesan dikirim sebagai user biasa.");
        sendVerifiedMessage(false); // Kirim pesan sebagai user biasa
      }
    } else {
      // Untuk user biasa atau 'fuzi' yang sudah terverifikasi
      sendVerifiedMessage(isModerator);
    }
  };
  
  // Fungsi terpisah untuk mengirim data pesan ke server
  const sendVerifiedMessage = (moderatorStatus) => {
    const messageData = {
      user: user,
      message: message,
      isModerator: moderatorStatus, // Kirim status moderator ke backend
    };

    socket.emit('send_message', messageData);
    
    // Tampilkan pesan sendiri secara langsung di UI
    setChatLog((list) => [...list, { 
      ...messageData, 
      fromSelf: true, 
      timestamp: new Date().toISOString(),
    }]);
    setMessage('');
  };

  // Fungsi untuk menghapus pesan
  const handleDeleteMessage = (messageIdToDelete) => {
    socket.emit('delete_message', {
      messageId: messageIdToDelete,
      user: user, // User yang melakukan aksi hapus
      isModerator: isModerator // Status moderator dari user yang menghapus
    });
  };

  useEffect(() => {
    socket.on('chat_history', (history) => setChatLog(history));
    socket.on('receive_message', (data) => setChatLog((list) => [...list, data]));
    socket.on('message_updated', (updatedMessage) => {
      setChatLog(prevLog => prevLog.map(msg => 
        msg._id === updatedMessage._id ? updatedMessage : msg
      ));
    });
    return () => {
      socket.off('chat_history');
      socket.off('receive_message');
      socket.off('message_updated');
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
          <h2>Simple Real-Time Chat</h2>
        </div>
        <div className="chat-body" ref={chatBodyRef}>
          {chatLog.map((content) => (
            <div key={content._id || Math.random()} className={content.fromSelf ? "message-self" : "message-other"}>
              <div className="message-content">
                <p>{content.message}</p>
              </div>
              <div className="message-meta">
                <p style={{ color: content.isModerator ? 'red' : 'inherit', fontWeight: content.isModerator ? 'bold' : 'normal' }}>
                  {content.fromSelf ? "You" : content.user}
                  {content.isModerator && ' (Moderator)'}
                </p>
                <p>{formatTimestamp(content.timestamp)}</p>
              </div>
              {/* Tombol hapus muncul jika user adalah moderator dan pesan bukan miliknya */}
              {isModerator && !content.fromSelf && !content.isDeleted && (
                <button className="delete-button" onClick={() => handleDeleteMessage(content._id)}>X</button>
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
