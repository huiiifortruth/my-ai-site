"use client";

import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function AIChat() {
  const router = useRouter();
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([
    { role: "assistant", content: "你好！我是你的 AI 校园助手，有什么我可以帮你的吗？" }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // 自动滚动到底部
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg = { role: "user", content: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      // 请求我们自己的后端接口
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input }),
      });

      const data = await response.json();
      setMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);
    } catch (error) {
      setMessages((prev) => [...prev, { role: "assistant", content: "❌ 哎呀，网络开小差了，请稍后再试。" }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex flex-col h-screen bg-gray-50">
      {/* 顶部导航 */}
      <nav className="bg-white border-b p-4 flex items-center gap-4 shadow-sm">
        <button onClick={() => router.push("/")} className="text-blue-600 font-bold text-sm">← 返回广场</button>
        <h1 className="font-bold text-gray-800">AI 智能助手</h1>
      </nav>

      {/* 聊天窗口 */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, index) => (
          <div key={index} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[80%] p-4 rounded-2xl text-sm ${
              msg.role === "user" 
              ? "bg-blue-600 text-white rounded-br-none" 
              : "bg-white text-gray-800 border border-gray-100 rounded-bl-none shadow-sm"
            }`}>
              {msg.content}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 animate-pulse text-gray-400 text-xs">
              AI 正在思考中...
            </div>
          </div>
        )}
      </div>

      {/* 输入框 */}
      <div className="p-4 bg-white border-t">
        <div className="max-w-4xl mx-auto flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="问问校历、餐厅、或者寻求建议..."
            className="flex-1 bg-gray-100 border-none rounded-full px-5 py-3 outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
          <button
            onClick={handleSend}
            disabled={isLoading}
            className="bg-blue-600 text-white w-12 h-12 rounded-full flex items-center justify-center hover:bg-blue-700 transition-all active:scale-95 disabled:bg-gray-300"
          >
            🚀
          </button>
        </div>
      </div>
    </main>
  );
}