import React, { useState, useEffect } from 'react';
import { socket } from '../socket.js';

export function MyForm() {
  let [messages, setMessages] = useState([]);
  const [value, setValue] = useState('');
  const [lastSenderId, setLastSenderId] = useState(null);

  useEffect(() => {
    if (socket) {
      socket.on("message", (value) => {
        setMessages([...messages, value]);
        let element = document.getElementById("messages");
        element.scrollTop = element.scrollHeight;
      });
    }
    return () => {
      socket?.off("message");
    };
  });

  function handleSendMessage(e) {
    e.preventDefault();
    if (value && socket) {
      socket.emit("sendMessage", { user: socket.id, msg: value });
      setLastSenderId(socket.id);
      setValue("");
    }
  }

  function renderMessage(item, index) {
    return (
      <li key={index} className={`${item.user === socket.id? 'local' : 'non-local'} ${item.user !== lastSenderId ? 'first-message' : ''}`} >
        {item.msg} : {item.user} : {lastSenderId}
      </li>
    );
  }
  
  return (
    <>
      <ul id="messages">
        {messages?.map((item, index) => renderMessage(item, index))}
      </ul>
      <form 
        id="messages-form"
        onSubmit={ handleSendMessage }
      >
        <input
          id="messages-input"
          autoComplete="off"
          value={ value }
          onChange={(e) => {
            setValue(e.target.value);
          }}
        />
        <button 
          type="submit"
        >Send</button>
      </form>
    </>
  );
}