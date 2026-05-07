"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 检查用户是否真的登录了
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        // 如果没登录，踢回登录页
        router.push("/login");
      } else {
        setUser(session.user);
      }
      setLoading(false);
    };
    checkUser();
  }, [router]);

  if (loading) return <div className="p-8 text-center">正在加载...</div>;

  return (
    <main className="min-h-screen bg-white">
      {/* 简单的导航栏 */}
      <nav className="bg-blue-600 p-4 text-white flex justify-between items-center">
        <h1 className="font-bold text-xl">AI 智能工单系统</h1>
        <button 
          onClick={async () => {
            await supabase.auth.signOut();
            router.push("/login");
          }}
          className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded text-sm transition-colors"
        >
          退出登录
        </button>
      </nav>

      {/* 主内容区 */}
      <div className="max-w-4xl mx-auto mt-10 p-6">
        <div className="bg-gray-50 rounded-2xl p-8 border border-gray-200 shadow-sm">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            欢迎回来，同学！
          </h2>
          <p className="text-gray-600 mb-6">
            您的学号标识为：<span className="font-mono font-bold text-blue-600">{user?.email?.split('@')[0]}</span>
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button className="p-6 bg-white border border-blue-100 rounded-xl shadow-sm hover:shadow-md transition-all text-left">
              <div className="text-blue-600 font-bold mb-2">🤖 AI 智能助手</div>
              <div className="text-sm text-gray-500">有什么问题尽管问我，我是你的校园小管家。</div>
            </button>
            <button className="p-6 bg-white border border-green-100 rounded-xl shadow-sm hover:shadow-md transition-all text-left">
              <div className="text-green-600 font-bold mb-2">📝 提交新工单</div>
              <div className="text-sm text-gray-500">如果 AI 没能解决您的问题，请点击这里人工求助。</div>
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}