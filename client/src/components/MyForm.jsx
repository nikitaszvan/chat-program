import React, { useState, useEffect } from 'react';
import { socket } from '../socket.js';

export function MyForm() {
  let [messages, setMessages] = useState([]);
  const [value, setValue] = useState('');

  useEffect(() => {
    if (socket) {
      socket.on("message", (value) => {
        setMessages([...messages, value]);
        let element = document.getElementById("messages");
        console.log(socket.id);
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
      setValue("");
    }
  }

  function renderMessage(item, index) {
    return (
      <li key={index} style={item.user === socket.id? {alignSelf: 'flex-end'} : {alignSelf: 'flex-start'}}>
        {item.msg}
      </li>
    );
}

  return (
    <>
      <div id="messages">
        {messages?.map((item, index) => renderMessage(item, index))}
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
        >Send</button>
      </form>
    </>
  );
}