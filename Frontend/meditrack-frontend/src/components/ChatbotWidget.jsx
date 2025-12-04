import React, { useState, useRef, useEffect } from "react";
import { sendMessageToGemini } from "../services/geminiService";

export default function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const messagesEndRef = useRef(null);

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMsg = { sender: "user", text: input };
    setMessages((prev) => [...prev, userMsg]);

    setInput("");

    const rawResponse = await sendMessageToGemini(input, messages);

    let botContent = {};

    try {
      botContent = JSON.parse(rawResponse);
    } catch {
      botContent = { reply: rawResponse, steps: [], tips: [] }; // fallback
    }

    const botMsg = {
      sender: "bot",
      reply: botContent.reply || "No reply.",
      steps: botContent.steps || [],
      tips: botContent.tips || []
    };

    setMessages((prev) => [...prev, botMsg]);
  };

  return (
    <div>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 bg-blue-600 text-white rounded-full p-4 shadow-lg hover:bg-blue-700 transition z-[1000]"
      >
        💬
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-20 right-6 w-80 h-[420px] bg-white shadow-2xl rounded-lg flex flex-col border border-gray-300 z-[1000]">
          <div className="bg-blue-600 text-white p-3 rounded-t-lg text-center font-bold">
            MediTrack Assistant
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
                {/* User message */}
                {msg.sender === "user" && <p>{msg.text}</p>}

                {/* BOT message (reply + steps + tips) */}
                {msg.sender === "bot" && (
                  <div className="space-y-1">
                    <p className="font-medium">{msg.reply}</p>

                    {msg.steps.length > 0 && (
                      <div className="text-sm">
                        <p className="font-semibold">Steps:</p>
                        <ul className="list-disc ml-4">
                          {msg.steps.map((s, i) => (
                            <li key={i}>{s}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {msg.tips.length > 0 && (
                      <div className="text-sm">
                        <p className="font-semibold">Tips:</p>
                        <ul className="list-disc ml-4">
                          {msg.tips.map((t, i) => (
                            <li key={i}>{t}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}

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
            />
            <button
              onClick={sendMessage}
              className="bg-blue-600 text-white px-3 rounded-lg"
            >
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
