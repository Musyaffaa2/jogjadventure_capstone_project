import { useState, useRef, useEffect } from "react";
import { FaPaperPlane, FaRobot, FaUser, FaTimes } from "react-icons/fa";

interface Message {
  sender: "user" | "bot";
  text: string;
}

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async () => {
    if (input.trim() === "" || isLoading) return;

    const userMessage: Message = { sender: "user", text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("http://127.0.0.1:5000/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: input }),
      });

      if (!response.ok) {
        throw new Error("Gagal mendapatkan respons dari server.");
      }

      const data = await response.json();
      const botMessage: Message = { sender: "bot", text: data.response };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error(error);
      const errorMessage: Message = {
        sender: "bot",
        text: "Oops, terjadi kesalahan. Coba lagi nanti.",
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Button Open Chatbot */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="cursor-pointer bg-secondary text-white p-4 rounded-full shadow-lg hover:scale-105 transition-transform"
        >
          <FaRobot size={24} />
        </button>
      )}

      {/* Chatbot Panel */}
      {isOpen && (
        <div className="w-80 h-96 bg-white rounded-xl shadow-2xl flex flex-col transition-all">
          {/* Header */}
          <div className="bg-secondary p-3 rounded-t-xl text-white flex justify-between items-center">
            <div className="flex items-center gap-2">
              <FaRobot />
              <h3 className="font-semibold text-sm">JogjaBot Assistant</h3>
            </div>
            <button onClick={() => setIsOpen(false)}>
              <FaTimes className="text-white hover:text-gray-300 cursor-pointer" />
            </button>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 p-3 overflow-y-auto bg-gray-50">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex items-end gap-2 mb-3 ${
                  msg.sender === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {msg.sender === "bot" && (
                  <FaRobot className="text-gray-400 mb-1" />
                )}
                <div
                  className={`max-w-[80%] p-2 rounded-lg text-sm ${
                    msg.sender === "user"
                      ? "bg-secondary text-white rounded-br-none"
                      : "bg-gray-200 text-gray-800 rounded-bl-none"
                  }`}
                >
                  {msg.text}
                </div>
                {msg.sender === "user" && (
                  <FaUser className="text-gray-400 mb-1" />
                )}
              </div>
            ))}
            {isLoading && (
              <div className="text-center text-xs text-gray-500">
                Bot is typing...
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-2 border-t flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
              placeholder="Tanya JogjaBot..."
              className="w-full text-sm outline-none px-2 py-1 rounded"
              disabled={isLoading}
            />
            <button
              onClick={handleSendMessage}
              disabled={isLoading || !input.trim()}
              className="bg-secondary p-2 rounded-full text-white hover:opacity-80 disabled:opacity-50 transition-all"
            >
              <FaPaperPlane />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chatbot;
