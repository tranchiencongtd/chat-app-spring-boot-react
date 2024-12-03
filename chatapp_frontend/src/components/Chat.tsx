import { Stomp } from '@stomp/stompjs';
import React, { useEffect, useRef, useState } from 'react';
import SockJS from 'sockjs-client';
import Message from './Message';
import { PaperAirplaneIcon } from "@heroicons/react/24/outline";


interface ChatProps {
    userName: string;
    onLogout: () => void;
}

const Chat: React.FC<ChatProps> = ({userName, onLogout}) => {
    const [message, setMessage] = useState<string>('');
    const [messages, setMessages] = useState<any[]>([]);
    const [stompClient, setStompClient] = useState<any>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter")
            sendMessage();
                
    };

    const sendMessage = () => {
        if ( stompClient && message.trim() !== "" ) {
            const chatMessage = { sender: userName, content: message, type: "CHAT" }
            stompClient.send("/app/sendMessage", {}, JSON.stringify(chatMessage));
            setMessage('');
            inputRef.current?.focus();
        }
    }

    const handleLogout = () => {
        if ( stompClient )
            stompClient.send("/app/leave", {}, JSON.stringify(userName))
        onLogout();
    }

    useEffect ( () => {
        const socket = new SockJS("http://localhost:8080/chat-websocket");
        const client = Stomp.over(socket);

        client.connect( {}, () => {
            console.log("Connected to Websocket");
            client.send("/app/join", {}, JSON.stringify(userName));

            client.subscribe("/topic/messages", (msg) => {
                setMessages( (prev) => [...prev, JSON.parse(msg.body)]);
            });

            setStompClient(client);
        });

        return () => {
            if (client) client.disconnect();
        }
    }, [userName] );

    useEffect(() => {
        if( messagesEndRef.current ) {
            messagesEndRef.current.scrollIntoView({behavior: "smooth"});
        }
    },[messages]);

    return ( 
        <div className='flex justify-center items-center min-h-screen bg-gray-100'>
            <div className='flex flex-col bg-white rounded-xl shadow-lg w-full sm:w-[29rem] h-[700px]'>
                {/* Header */}
                <div className='p-4 bg-blue-500 text-white font-semibold text-center rounded-t-xl'>
                    Chat Room
                </div>

                {/* Messages */}
                <div className='flex-1 p-4 overflow-y-auto bg-gray-50 rounded-b-xl space-y-4 custom-scrollbar'>
                {
                    messages.map( (message, index) => (
                        <div key={index}>
                            {message.type === 'JOIN' ? (
                                <div className='text-center text-green-500 italic'>🔥 {message.content}</div>
                            ) : message.type === 'LEAVE' ? (
                                <div className='text-center text-red-500 italic'>🥺 {message.content}</div>
                            ) : (
                                <Message 
                                    sender={message.sender} 
                                    content={message.content}
                                    isOwnMessage = {message.sender === userName}
                                />
                            )}
                        </div>
                    ))
                }

                {/* Auto scroll */}
                <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className='p-4 bg-gray-50 rounded-b-xl'>
                    <div className='flex items-center space-x-4'>
                        <input 
                            type="text" 
                            className='flex-1 p-3 border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-300 transition duration-300'
                            placeholder='Type your message...'
                            value={message}
                            onChange={ (e) => setMessage(e.target.value)}
                            onKeyDown={handleKeyDown}
                            ref={inputRef}
                        />
                        <button
                            onClick={sendMessage}
                            className='p-2 text-white bg-blue-500 rounded-full hover:bg-blue-600 transition duration-300'
                        >
                            <PaperAirplaneIcon className='h-6 w-6' />
                        </button>
                    </div>
                </div>

                {/* Button logout */}
                <div className='p-4 text-center border-t bg-gray-50'>
                    <button
                        onClick={handleLogout}
                        className='w-full p-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition duration-300'
                    >
                        Logout
                    </button>

                </div>
            </div>
        </div>
     );
}

export default Chat;


