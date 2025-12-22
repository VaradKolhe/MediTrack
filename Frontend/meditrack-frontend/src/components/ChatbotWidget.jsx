import React, { useState, useRef, useEffect } from "react";
import { sendMessageToGemini } from "../services/geminiService";
import { normalizeMessage } from "../services/chatUtils";
import { useAuth } from "../hooks/useAuth";

export default function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [animating, setAnimating] = useState(false);

  const messagesEndRef = useRef(null);
  const { user } = useAuth();

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

    const userMsg = normalizeMessage({ sender: "user", text: input });
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const history = [...messages, userMsg];
      const result = await sendMessageToGemini(input, history, user);

      const botMsg = normalizeMessage({
        sender: "bot",
        reply: result.reply,
        steps: result.steps,
        tips: result.tips,
      });

      setMessages((prev) => [...prev, botMsg]);
    } catch (error) {
      console.error("Failed to fetch response:", error);
      const errMsg = normalizeMessage({
        sender: "bot",
        reply: "Sorry, something went wrong while contacting the assistant.",
        steps: [],
        tips: [],
      });
      setMessages((prev) => [...prev, errMsg]);
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
          className={`fixed bottom-8 right-8 bg-gradient-to-br from-teal-500 via-cyan-500 to-blue-500 text-white rounded-full p-6 shadow-2xl 
                      hover:shadow-cyan-500/50 hover:scale-110 active:scale-95 transition-all duration-300 z-[1000] cursor-pointer
                      border-4 border-white/40 group
                      ${
                        animating
                          ? "scale-0 opacity-0"
                          : "scale-100 opacity-100"
                      }`}
        >
          <svg
            className="w-8 h-8 group-hover:rotate-12 transition-transform"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z"
              clipRule="evenodd"
            />
          </svg>
          <span className="absolute -top-2 -right-2 flex h-6 w-6">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-6 w-6 bg-gradient-to-br from-emerald-400 to-green-500 border-2 border-white shadow-lg"></span>
          </span>
        </button>
      )}

      {/* Chat window */}
      <div
        className={`fixed bottom-8 right-8 w-[420px] h-[650px] shadow-2xl rounded-3xl border-3 border-teal-200/60
                    flex flex-col z-[1000] transform origin-bottom-right transition-all duration-300 bg-white/70 backdrop-blur-xl overflow-hidden
                    ${
                      isOpen
                        ? "scale-100 opacity-100"
                        : "scale-0 opacity-0 pointer-events-none"
                    }`}
      >
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-white via-cyan-50/40 to-teal-50/60 -z-10"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(20,184,166,0.1),transparent_50%)] -z-10"></div>

        {/* Header */}
        <div className="relative bg-gradient-to-r from-teal-600 via-cyan-600 to-blue-600 text-white px-6 py-5 flex justify-between items-center shadow-xl">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.15),transparent_70%)]"></div>
          <div className="relative flex items-center gap-4">
            <div className="relative">
              <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border-2 border-white/30 shadow-lg">
                <svg
                  className="w-7 h-7"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-2 0c0 .993-.241 1.929-.668 2.754l-1.524-1.525a3.997 3.997 0 00.078-2.183l1.562-1.562C15.802 8.249 16 9.1 16 10zm-5.165 3.913l1.58 1.58A5.98 5.98 0 0110 16a5.976 5.976 0 01-2.516-.552l1.562-1.562a4.006 4.006 0 001.789.027zm-4.677-2.796a4.002 4.002 0 01-.041-2.08l-.08.08-1.53-1.533A5.98 5.98 0 004 10c0 .954.223 1.856.619 2.657l1.54-1.54zm1.088-6.45A5.974 5.974 0 0110 4c.954 0 1.856.223 2.657.619l-1.54 1.54a4.002 4.002 0 00-2.346.033L7.246 4.668zM12 10a2 2 0 11-4 0 2 2 0 014 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-400 rounded-full border-2 border-teal-600 animate-pulse"></div>
            </div>
            <div>
              <h3 className="font-bold text-xl tracking-tight">MediTrack AI</h3>
              <div className="flex items-center gap-2 text-xs text-white/90 font-medium">
                <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse shadow-lg"></span>
                <span>Always available to help</span>
              </div>
            </div>
          </div>
          <button
            onClick={closeChat}
            className="relative text-white text-xl font-bold hover:bg-white/20 rounded-xl p-2.5 transition-all cursor-pointer hover:rotate-90 duration-300 active:scale-90"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>

        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 scrollbar-thin scrollbar-thumb-teal-300 scrollbar-track-transparent">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full space-y-6 text-center px-8 animate-fade-in">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-teal-400 to-cyan-500 rounded-3xl blur-xl opacity-50 animate-pulse"></div>
                <div className="relative w-24 h-24 rounded-3xl bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center shadow-2xl border-4 border-white/30">
                  <svg
                    className="w-12 h-12 text-white"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              </div>
              <div className="space-y-2">
                <p className="font-bold text-2xl text-slate-800">Welcome! 👋</p>
                <p className="text-base text-slate-600 leading-relaxed max-w-xs">
                  I'm your healthcare assistant. Ask me anything about medical
                  services, appointments, or health information.
                </p>
              </div>
              <div className="flex flex-wrap gap-2 justify-center">
                {["Find hospitals", "Book appointment", "Health tips"].map(
                  (suggestion) => (
                    <button
                      key={suggestion}
                      onClick={() => setInput(suggestion)}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-teal-500/10 to-cyan-500/10 border-2 border-teal-200 text-teal-700 text-sm font-semibold hover:from-teal-500/20 hover:to-cyan-500/20 hover:border-teal-300 transition-all"
                    >
                      {suggestion}
                    </button>
                  )
                )}
              </div>
            </div>
          )}

          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex ${
                msg.sender === "user" ? "justify-end" : "justify-start"
              } animate-slide-up`}
            >
              <div
                className={`p-4 max-w-[85%] rounded-2xl shadow-lg transition-all hover:shadow-xl ${
                  msg.sender === "user"
                    ? "bg-gradient-to-br from-teal-500 via-cyan-500 to-blue-500 text-white rounded-tr-sm"
                    : "bg-white border-2 border-teal-100 text-slate-800 rounded-tl-sm"
                }`}
              >
                {msg.sender === "user" && (
                  <p className="font-medium leading-relaxed">{msg.text}</p>
                )}

                {msg.sender === "bot" && (
                  <div className="space-y-4">
                    <p className="font-medium leading-relaxed text-slate-700">
                      {msg.reply}
                    </p>

                    {msg.steps && msg.steps.length > 0 && (
                      <div className="text-sm bg-gradient-to-br from-emerald-50 via-teal-50 to-emerald-50 rounded-2xl p-4 border-2 border-emerald-200/60 shadow-sm">
                        <p className="font-bold text-emerald-700 mb-3 flex items-center gap-2 text-base">
                          <svg
                            className="w-5 h-5"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                              clipRule="evenodd"
                            />
                          </svg>
                          Action Steps
                        </p>
                        <ul className="space-y-2 ml-1">
                          {msg.steps.map((s, i) => (
                            <li key={i} className="flex items-start gap-3">
                              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center mt-0.5 shadow-md">
                                {i + 1}
                              </span>
                              <span className="text-slate-700 leading-relaxed">
                                {s}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {msg.tips && msg.tips.length > 0 && (
                      <div className="text-sm bg-gradient-to-br from-cyan-50 via-blue-50 to-cyan-50 rounded-2xl p-4 border-2 border-cyan-200/60 shadow-sm">
                        <p className="font-bold text-cyan-700 mb-3 flex items-center gap-2 text-base">
                          <svg
                            className="w-5 h-5"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                              clipRule="evenodd"
                            />
                          </svg>
                          Helpful Tips
                        </p>
                        <ul className="space-y-2 ml-1">
                          {msg.tips.map((t, i) => (
                            <li key={i} className="flex items-start gap-3">
                              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-cyan-600 text-white font-bold text-xs flex items-center justify-center mt-0.5 shadow-md">
                                💡
                              </span>
                              <span className="text-slate-700 leading-relaxed">
                                {t}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Enhanced Loader */}
          {isLoading && (
            <div className="flex justify-start animate-slide-up">
              <div className="p-4 bg-white border-2 border-teal-100 rounded-2xl rounded-tl-sm shadow-lg w-fit max-w-[85%]">
                <div className="flex space-x-3 items-center">
                  <div className="flex space-x-1.5">
                    <div
                      className="w-3 h-3 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-full animate-bounce shadow-md"
                      style={{ animationDelay: "0ms" }}
                    ></div>
                    <div
                      className="w-3 h-3 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full animate-bounce shadow-md"
                      style={{ animationDelay: "150ms" }}
                    ></div>
                    <div
                      className="w-3 h-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full animate-bounce shadow-md"
                      style={{ animationDelay: "300ms" }}
                    ></div>
                  </div>
                  <span className="text-sm text-slate-500 font-medium">
                    Thinking...
                  </span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Enhanced Input Area */}
        <div className="p-5 border-t-2 border-teal-200/60 bg-white/90 backdrop-blur-md">
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <input
                className="w-full border-2 border-teal-200/60 pl-4 pr-4 py-4 rounded-2xl focus:border-teal-500 focus:outline-none focus:ring-4 focus:ring-teal-500/20 transition-all shadow-md font-medium text-slate-700 placeholder:text-slate-400"
                placeholder="Type your message here..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                disabled={isLoading}
              />
            </div>
            <button
              onClick={sendMessage}
              disabled={isLoading}
              className={`px-6 rounded-2xl text-white font-bold transition-all shadow-lg flex items-center justify-center ${
                isLoading
                  ? "bg-gradient-to-r from-teal-300 to-cyan-300 cursor-not-allowed"
                  : "bg-gradient-to-r from-teal-600 via-cyan-600 to-blue-600 hover:shadow-2xl hover:shadow-cyan-500/50 hover:scale-105 active:scale-95 cursor-pointer"
              }`}
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <style
        dangerouslySetInnerHTML={{
          __html: `
        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }
      `,
        }}
      />
    </div>
  );
}
