"use client";
import { useEffect, useRef, useState } from "react";

type Message = {
  sender: "me" | "ai";
  text: string;
};

export default function Home() {
  const socket = useRef<WebSocket | null>(null);

  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
   
     socket.current = new WebSocket('ws://192.168.1.10:8000');

    socket.current.onopen = () => {
      console.log("Connected to WebSocket");
    };

    socket.current.onmessage = (event: MessageEvent) => {
      setMessages((prev) => [...prev, { sender: "ai", text: event.data }]);
    };

    socket.current.onclose = () => {
      console.log(" Disconnected from WebSocket");
    };

    return () => {
      socket.current?.close();
    };
  }, []);

  const sendMessage = () => {
    if (!input.trim() || !socket.current) return;

    socket.current.send(input);

    setMessages((prev) => [...prev, { sender: "me", text: input }]);
    setInput("");
  };

  return (
    
    <div className="w-full flex items-center justify-center h-screen bg-gray-100 px-2">
      {/* Chat App Frame */}
      <div className="w-full max-w-xl h-[80%] flex flex-col bg-white text-black rounded-md border shadow-md overflow-hidden">
        <p className="bg-gray-200   text-center text-3xl font-extrabold p-4 border-b">
          Chat with Gemini
        </p>

        {/* Chat Messages */}
        <div className="flex-1 overflow-auto p-4 space-y-2 flex flex-col">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`p-2 rounded-md max-w-[80%] ${
                msg.sender === "me"
                  ? "bg-blue-100 self-end text-right"
                  : "bg-gray-100 self-start text-left"
              }`}
            >
              {msg.text}  {msg.sender === "ai" && "🤖"}
            </div>
          ))}
        </div>

        {/* Input Box */}
        <div className="flex border-t p-2">
          <input
            type="text"
            placeholder="Type a message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            className="p-2 rounded-md outline-none border flex-1"
          />
          <button
            onClick={sendMessage}
            className="ml-2 px-4 py-2 bg-blue-700 text-white font-bold rounded-md"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
