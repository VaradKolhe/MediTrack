import React, { useState, useRef, useEffect } from "react";
import { sendMessageToGemini } from "../services/geminiService";
import { normalizeMessage } from "../services/chatUtils";

export default function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]); // array of normalized messages
  const [isLoading, setIsLoading] = useState(false);
  const [animating, setAnimating] = useState(false);

  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const openChat = () => {
    setAnimating(true);
    setIsOpen(true);
    setTimeout(() => setAnimating(false), 300);
  };

  const closeChat = () => {
    setAnimating(true);
    setTimeout(() => {
      setIsOpen(false);
      setAnimating(false);
    }, 250);
  };

  const sendMessage = async () => {
    if (!input.trim()) return;

    // create normalized user message
    const userMsg = normalizeMessage({ sender: "user", text: input });
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      // Pass the current messages (normalized) as history
      const history = [...messages, userMsg];

      const result = await sendMessageToGemini(input, history);
      // result is guaranteed to have reply, steps, tips

      const botMsg = normalizeMessage({
        sender: "bot",
        reply: result.reply,
        steps: result.steps,
        tips: result.tips
      });

      setMessages(prev => [...prev, botMsg]);
    } catch (error) {
      console.error("Failed to fetch response:", error);
      // Add a bot-style error message so UI shows something
      const errMsg = normalizeMessage({
        sender: "bot",
        reply: "Sorry, something went wrong while contacting the assistant.",
        steps: [],
        tips: []
      });
      setMessages(prev => [...prev, errMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      {/* Floating bubble */}
      {!isOpen && (
        <button
          onClick={openChat}
          className={`fixed bottom-6 right-6 bg-blue-600 text-white rounded-full p-4 shadow-lg 
                      hover:bg-blue-700 transition-transform duration-300 z-[1000] cursor-pointer
                      ${
                        animating
                          ? "scale-0 opacity-0"
                          : "scale-100 opacity-100"
                      }`}
        >
          💬
        </button>
      )}

      {/* Chat window */}
      <div
        className={`fixed bottom-6 right-6 bg-white w-80 h-[500px] shadow-2xl rounded-lg border border-gray-300 
                    flex flex-col z-[1000] transform origin-bottom-right transition-all duration-300
                    ${
                      isOpen
                        ? "scale-100 opacity-100"
                        : "scale-0 opacity-0 pointer-events-none"
                    }`}
      >
        {/* Header */}
        <div className="bg-blue-600 text-white p-3 rounded-t-lg flex justify-between items-center font-bold">
          <span>MediTrack Assistant</span>
          <button
            onClick={closeChat}
            className="text-white text-lg font-bold hover:text-gray-200 cursor-pointer"
          >
            ✖
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-3 space-y-3">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`p-2 max-w-[90%] rounded-lg ${
                msg.sender === "user"
                  ? "bg-blue-500 text-white self-end ml-auto"
                  : "bg-gray-100 text-black"
              }`}
            >
              {msg.sender === "user" && <p>{msg.text}</p>}

              {msg.sender === "bot" && (
                <div className="space-y-1">
                  <p className="font-medium">{msg.reply}</p>

                  {msg.steps && msg.steps.length > 0 && (
                    <div className="text-sm">
                      <p className="font-semibold">Steps:</p>
                      <ul className="list-disc ml-4">
                        {msg.steps.map((s, i) => (
                          <li key={i}>{s}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {msg.tips && msg.tips.length > 0 && (
                    <div className="text-sm">
                      <p className="font-semibold">Tips:</p>
                      <ul className="list-disc ml-4">
                        {msg.tips.map((t, i) => (
                          <li key={i}>{t}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Optional smaller debug: show full combined text when you click or expand */}
                </div>
              )}
            </div>
          ))}

          {/* Loader */}
          {isLoading && (
            <div className="p-3 bg-gray-100 rounded-lg w-fit max-w-[90%]">
              <div className="flex space-x-1">
                <div
                  className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                  style={{ animationDelay: "0ms" }}
                ></div>
                <div
                  className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                  style={{ animationDelay: "150ms" }}
                ></div>
                <div
                  className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                  style={{ animationDelay: "300ms" }}
                ></div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input box */}
        <div className="p-3 flex gap-2 border-t">
          <input
            className="flex-1 border p-2 rounded-lg"
            placeholder="Ask something..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            disabled={isLoading}
          />
          <button
            onClick={sendMessage}
            disabled={isLoading}
            className={`px-3 rounded-lg text-white transition cursor-pointer ${
              isLoading ? "bg-blue-400" : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
