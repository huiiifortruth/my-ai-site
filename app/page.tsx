"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [tickets, setTickets] = useState<any[]>([]); // 存储广场帖子
  const [loading, setLoading] = useState(true);

  // 【新增】筛选状态：'all' | 'open' | 'closed'
  const [filter, setFilter] = useState<'all' | 'open' | 'closed'>('all');

  useEffect(() => {
    const initialize = async () => {
      // 1. 检查登录状态
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/login");
        return;
      }
      setUser(session.user);
      await fetchTickets();
    };
    initialize();
  }, [router]);

  const fetchTickets = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("tickets")
      .select("*")
      .order("created_at", { ascending: false });
    
    if (!error) setTickets(data || []);
    setLoading(false);
  };
      
  // 【核心逻辑】根据筛选状态过滤数据
  const filteredTickets = tickets.filter(t => {
    if (filter === 'all') return true;
    return t.status === filter;
  });

  if (loading) return <div className="p-8 text-center text-gray-500">正在进入交流广场...</div>;

  return (
    <main className="min-h-screen bg-gray-50 pb-12">
      {/* 导航栏 */}
      <nav className="bg-blue-600 p-4 text-white shadow-md sticky top-0 z-10">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <h1 className="font-bold text-xl flex items-center gap-2">
             校园交流广场
          </h1>
          <button 
            onClick={async () => {
              await supabase.auth.signOut();
              router.push("/login");
            }}
            className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg text-sm transition-all"
          >
            退出登录
          </button>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto p-6">
        {/* 欢迎语 */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800">欢迎回来，同学！</h2>
          <p className="text-gray-600">
            您的学号标识：<span className="font-mono font-bold text-blue-600">{user?.email?.split('@')[0]}</span>
          </p>
        </div>

        {/* 【核心修改】保留并排的两个功能按钮 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
          {/* AI 助手按钮 */}
          <button 
            onClick={() => router.push("/ai-chat")} // 假设 AI 页面路径是 /ai-chat
            className="p-6 bg-white border border-blue-100 rounded-xl shadow-sm hover:shadow-md transition-all text-left group"
          >
            <div className="text-blue-600 font-bold mb-2 flex items-center gap-2">
              <span className="text-2xl">🤖</span> AI 智能助手
            </div>
            <div className="text-sm text-gray-500 group-hover:text-gray-700">
              有什么问题尽管问我，我是你的校园小管家。
            </div>
          </button>

          {/* 提交工单按钮 */}
          <button 
            onClick={() => router.push("/submit")}
            className="p-6 bg-white border border-green-100 rounded-xl shadow-sm hover:shadow-md transition-all text-left group"
          >
            <div className="text-green-600 font-bold mb-2 flex items-center gap-2">
              <span className="text-2xl">📝</span> 提交新话题
            </div>
            <div className="text-sm text-gray-500 group-hover:text-gray-700">
              如果 AI 没能解决您的问题，请在广场发帖求助。
            </div>
          </button>
        </div>

        {/* 【新增】筛选切换器 UI */}
        <div className="flex items-center justify-between mb-6 px-2">
          <h3 className="text-lg font-bold text-gray-700">大家都在聊</h3>
          <div className="flex bg-gray-200 p-1 rounded-lg">
            {(['all', 'open', 'closed'] as const).map((type) => (
              <button
                key={type}
                onClick={() => setFilter(type)}
                className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${
                  filter === type 
                    ? 'bg-white text-blue-600 shadow-sm' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {type === 'all' ? '全部' : type === 'open' ? '交流中' : '已解决'}
              </button>
            ))}
          </div>
        </div>

        {/* 帖子展示区 - 使用 filteredTickets 而不是 tickets */}
        <div className="space-y-4">
          {filteredTickets.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl border-2 border-dashed border-gray-200 text-gray-400">
              这里还没有相关话题...
            </div>
          ) : (
            filteredTickets.map((ticket) => (
              <div 
                key={ticket.id}
                onClick={() => router.push(`/ticket/${ticket.id}`)}
                className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm hover:border-blue-400 hover:shadow-md transition-all cursor-pointer group"
              >
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-lg font-bold text-gray-800 group-hover:text-blue-600">
                    {ticket.title}
                  </h3>
                  <span className={`text-[10px] px-2 py-1 rounded-full font-bold ${
                    ticket.status === 'open' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
                  }`}>
                    {ticket.status === 'open' ? '交流中' : '已解决'}
                  </span>
                </div>
                <p className="text-gray-600 text-sm line-clamp-2 mb-4 leading-relaxed">{ticket.content}</p>
                <div className="flex justify-between items-center text-xs text-gray-400 border-t pt-4">
                   <span>👤 {ticket.user_email}</span>
                   <span>{new Date(ticket.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </main>
  );
}