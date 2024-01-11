import React, { useState, useEffect } from 'react';
import { socket } from '../socket.js';

export default function MyForm() {
  let [messages, setMessages] = useState([]);
  let [message, setMessage] = useState("");


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
    // if (messages && messages.length > 1) {
    //   lastSenderId = messages[messages.length - 1].name;
    //   console.log(lastSenderId);
    // }
    
    if (message && socket) {
      socket.emit("sendMessage", {name: socket.id, msg: message });
      setMessage("");
    }
  }

  function renderMessage(item, index) {
    if (messages.length > 1) {
      return (
          <div key={index}>
            <p className={ messages[index-1].name === item.name ? '' : 'first-message' }>{item.name} : {item.msg} : { messages[index].name === item.name ? 'not-first-message' : 'first-message' }</p>
          </div>
      )
    }
    else {
      return (
        <div key={index}>
          <p className='first-message'>{item.name} : {item.msg} : 'first-message' </p>
        </div>
    )
    }
  }

  
  return (
    <>
        <div
          id="messages"
        >
          <div className="">
            {messages?.map((item, index) => renderMessage(item, index))}
          </div>
        </div>

      <div>
        <form
          onSubmit={handleSendMessage}
        >
            <input
              type="text"
              name="message"
              autoComplete="off"
              placeholder="Enter message ..."
              value={message}
              onChange={handleInput}
            />
            <button
              type="submit"
            >
              Send
            </button>
        </form>
          </div>
    </>
  );
}