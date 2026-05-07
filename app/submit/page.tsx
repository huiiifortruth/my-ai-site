"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function SubmitTicket() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");

    // 1. 获取当前登录用户的信息
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      setMessage("❌ 您尚未登录，请先登录");
      setIsLoading(false);
      return;
    }

    // 2. 将工单数据插入数据库
    // 注意：我们增添了 user_email 字段，方便在广场显示发帖人学号
    const { error } = await supabase.from("tickets").insert([
      {
        title: title,
        content: content,
        user_id: user.id,
        user_email: user.email?.split('@')[0], // 【新增】提取学号部分
        status: "open"
      },
    ]);

    if (error) {
      setMessage(`❌ 提交失败: ${error.message}`);
    } else {
      setMessage("✅ 发布成功！正在前往广场...");
      setTimeout(() => router.push("/"), 1500);
    }
    setIsLoading(false);
  };

  return (
    <main className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-sm p-8 border border-gray-100">
        <div className="mb-6">
           <button onClick={() => router.push("/")} className="text-sm text-blue-600 mb-2">← 返回广场</button>
           <h1 className="text-2xl font-bold text-gray-800">发布新话题</h1>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">话题标题</label>
            <input
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="一句话描述你的问题或想法"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">正文内容</label>
            <textarea
              required
              value={content}
              rows={6}
              onChange={(e) => setContent(e.target.value)}
              placeholder="详细描述一下吧..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            />
          </div>

          {message && (
            <div className={`p-4 rounded-lg text-sm text-center ${message.includes("成功") ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
              {message}
            </div>
          )}

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-all disabled:bg-gray-300 shadow-lg shadow-blue-100"
            >
              {isLoading ? "发布中..." : "立即发布"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}