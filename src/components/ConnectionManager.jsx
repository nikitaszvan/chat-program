import React from 'react';
import { socket } from '../socket';

export function ConnectionManager() {
  function connect() {
    console.log('Connected to the server');
    socket.connect();
  }

  function disconnect() {
    console.log('Disconnected from the server');
    socket.disconnect();
  }

  return (
    <>
      <button onClick={ connect }>Connect</button>
      <button onClick={ disconnect }>Disconnect</button>
    </>
  );
}