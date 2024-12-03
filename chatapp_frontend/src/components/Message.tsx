import React from 'react';

interface MessageProps {
    sender: string;
    content: string;
    isOwnMessage: boolean
}

const Message: React.FC<MessageProps> = ({ sender, content, isOwnMessage }) => {

    return ( 
        <div
            className={`flex ${isOwnMessage ? "justify-end" : "justify-start"} mb-4`}
        >
            <div
                className={`shadow-md flex flex-col max-w-[70%] p-3 rounded-2xl ${isOwnMessage ? "bg-blue-500 text-white rounded-br-sm" : "bg-gray-200 text-gray-900 rounded-bl-sm"}`} 
            >
                {!isOwnMessage && (
                    <span className='text-sm font-semibold text-gray-600 mb-1'>
                        {sender}
                    </span>
                )}
                <p className='text-base leading-relaxed'>{content}</p>
            </div>
        </div>
     );
}

export default Message;