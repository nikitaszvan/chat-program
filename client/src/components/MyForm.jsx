import React, { useState } from 'react';
import { socket } from '../socket.js';

export function MyForm() {
  let [messages, setMessages] = useState([]);
  const [value, setValue] = useState('');

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
      socket.emit("sendMessage", { msg: value });
      setValue("");
    }
  }

  function renderMessage(item, index) {
    return (
        <div key={index}>
            {item.msg}
        </div>
    );
}

  return (
    <div className="App">
      <div className="chat-list"></div>
      <header>
        <h1>Groupchat Name</h1>
        <div className="settings"></div>
      </header>
      <div id="messages">
        <div className="">
          {messages?.map((item, index) => renderMessage(item, index))}
        </div>
      </div>
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
          disabled={ isLoading }
        >Send</button>
      </form>
    </div>
  );
}