import React, { useState, useEffect } from 'react';
import { socket } from '../socket.js';

function Message({ socket }) {
  let [messages, setMessages] = useState([]);
  let [message, setMessage] = useState("");
  const user = useSelector((state) => state.auth.user);

  useEffect(() => {
    if (socket) {
      socket.on("message", (message) => {
        setMessages([...messages, message]);
        let element = document.getElementById("messages");
        element.scrollTop = element.scrollHeight;
      });
    }

    return () => {
      socket?.off("message");
    };
  });

  function handleInput(e) {
    e.preventDefault();
    setMessage(e.target.value);
  }

  function handleSendMessage(e) {
    e.preventDefault();
    if (message && socket) {
      socket.emit("sendMessage", { name: user.name, msg: message, room });
      setMessage("");
    }
  }

  function renderMessage(item, index) {
    if (item.name !== "Admin")
      return (
        <div
          key={index}
          className={
            item.name === user.name ? "flex justify-end" : "flex justify-start"
          }
        >
          <div
            key={index}
            className={
              item.name === user.name
                ? "w-auto max-w-full inline-block p-2 rounded-xl bg-blue-500 my-1 text-white"
                : "w-auto max-w-full inline-block p-2 rounded-xl bg-gray-400 my-1"
            }
          >
            <p className="text-xs font-bold w-auto max-w-full">{item.name}</p>
            <p className="w-auto max-w-full">{item.msg}</p>
          </div>
        </div>
      );
    return (
      <div key={index} className="flex justify-center text-gray-400">
        {item.msg}
      </div>
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
          value = {inputValue}
          onChange={(e) => setInputValue(e.target.value)}
        />
        <button 
          type="submit"
        >Send</button>
      </form>
    </>
  );
}