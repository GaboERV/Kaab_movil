// WebSocketContext.js
import React, { createContext, useState, useEffect, useContext } from 'react';
import { ApiBackend } from './ApiBackend'; // Importa la dirección del backend

// Define la estructura del contexto
const WebSocketContext = createContext({
    socket: null,
    messages: [],
    sendMessage: () => {},
    isConnected: false,
    isDbInitialized: false,
    db: null,
});

const WebSocketProvider = ({ children, value }) => {
    const [socket, setSocket] = useState(null);
    const [messages, setMessages] = useState([]);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        if (!value.isDbInitialized || !value.db) {
            console.warn('Database not initialized, delaying WebSocket connection');
            return; // Do not proceed until DB is initialized
        }

        const newSocket = new WebSocket(`ws://${ApiBackend}:3001`);

        newSocket.onopen = () => {
            console.log('Conectado a WebSocket (Context)');
            setIsConnected(true);
        };

        newSocket.onclose = () => {
            console.log('Desconectado de WebSocket (Context)');
            setIsConnected(false);
        };

        newSocket.onerror = (error) => {
            console.log('Error de WebSocket (Context):', error);
            setIsConnected(false);
        };

        newSocket.onmessage = (event) => {
            console.log('Mensaje recibido:', event.data);
            try {
                const data = JSON.parse(event.data);
                setMessages(prevMessages => [...prevMessages, data]);
            } catch (error) {
                console.error("Error parsing JSON:", error);
            }
        };

        setSocket(newSocket);

        return () => {
            newSocket.close();
        };
    }, [value.isDbInitialized, value.db]); // Depende tanto de isDbInitialized *como* de db

    const sendMessage = (message) => {
        if (socket && isConnected) {
            socket.send(message);
        } else {
            console.log('Socket no inicializado o no conectado (Context).');
        }
    };

    // Overwrite context values with the WebSocket related logic
    const contextValue = {
        ...value, // Spread in the passed in value
        socket,
        messages,
        sendMessage,
        isConnected,
    };

    return (
        <WebSocketContext.Provider value={contextValue}>
            {children}
        </WebSocketContext.Provider>
    );
};

const useWebSocket = () => {
    const context = useContext(WebSocketContext);
    if (!context) {
        throw new Error('useWebSocket debe ser usado dentro de WebSocketProvider');
    }
    return context;
};

export { WebSocketContext, WebSocketProvider, useWebSocket };