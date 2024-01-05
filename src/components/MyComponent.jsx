import React from 'react';

export default function MyComponent() {
  const [fooEvents, setFooEvents] = useState([]);

  useEffect(() => {
    function onFooEvent(value) {
      setFooEvents(previous => [...previous, value]);
    }

    // BAD: this ties the state of the UI with the time of reception of the
    // 'foo' events
    socket.on('foo', onFooEvent);

    return () => {
      socket.off('foo', onFooEvent);
    };
  }, []);

  // ...
}