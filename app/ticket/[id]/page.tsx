"use client";

import { useEffect, useState, use } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function TicketDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [ticket, setTicket] = useState<any>(null);
  const [replies, setReplies] = useState<any[]>([]);
  const [newReply, setNewReply] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true); // 新增加载状态

  // 【新增】存储当前登录用户的 ID
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
    // 【新增】页面加载时获取当前用户信息
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setCurrentUserId(session?.user?.id || null);
    };
    getSession();
  }, [id]);

  const fetchData = async () => {
    setLoading(true);
    // 1. 获取主贴内容
    const { data: t } = await supabase.from("tickets").select("*").eq("id", id).single();
    setTicket(t);
    
    // 2. 获取所有回帖
    const { data: r } = await supabase
      .from("ticket_replies")
      .select("*")
      .eq("ticket_id", id)
      .order("created_at", { ascending: true });
    setReplies(r || []);
    setLoading(false);
  };

  // 【新增】处理“标记为已解决”的函数
  const handleResolve = async () => {
    if (!confirm("确定要将此话题标记为已解决吗？结案后将无法继续回复。")) return;

  const { error } = await supabase
      .from("tickets")
      .update({ status: "closed" })
      .eq("id", id);

    if (error) {
      alert("操作失败：" + error.message);
    } else {
      fetchData(); // 刷新页面数据，更新 UI 状态
    }
  };    

  const handleReply = async () => {
    if (!newReply.trim()) return;
    setIsSubmitting(true);
    
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      alert("请先登录后再回复");
      router.push("/login");
      return;
    }

    const { error } = await supabase.from("ticket_replies").insert([{
      content: newReply,
      ticket_id: id,
      user_id: user?.id,
      user_email: user?.email?.split('@')[0]
    }]);

    if (!error) {
      setNewReply("");
      fetchData(); // 刷新列表
    } else {
      alert("发送失败，请稍后重试");
    }
    setIsSubmitting(false);
  };

  if (loading) return <div className="p-20 text-center text-gray-500">正在加载话题...</div>;
  if (!ticket) return <div className="p-20 text-center text-gray-500">话题不存在或已被删除</div>;

  return (
    <main className="min-h-screen bg-gray-50 pb-20">
      {/* 顶部导航 */}
      <nav className="bg-white border-b sticky top-0 z-10 p-4">
        <div className="max-w-3xl mx-auto flex justify-between items-center">
          <button onClick={() => router.push("/")} className="text-blue-600 hover:font-bold transition-all">
            ← 返回广场
          </button>
        {/* 【关键：权限控制按钮】 */}
          {currentUserId === ticket.user_id && ticket.status === 'open' && (
            <button 
              onClick={handleResolve}
              className="bg-green-600 hover:bg-green-700 text-white text-xs px-4 py-2 rounded-lg font-bold transition-all shadow-sm"
            >
              √ 标记为已解决
            </button>
          )}
        </div>
      </nav>

      <div className="max-w-3xl mx-auto p-4 mt-4">
        {/* 主贴展示部分 */}
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 mb-8">
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-2">
              <span className="bg-blue-600 text-white text-[10px] px-2 py-0.5 rounded font-bold">楼主</span>
              <span className="text-sm font-bold text-gray-700">{ticket.user_email}</span>
              <span className="text-xs text-gray-400">{new Date(ticket.created_at).toLocaleString()}</span>
            </div>
            {/* 显示当前状态标签 */}
            <span className={`text-xs px-2 py-1 rounded-full font-bold ${
              ticket.status === 'open' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
            }`}>
              {ticket.status === 'open' ? '交流中' : '已结案'}
            </span>
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-4">{ticket.title}</h1>
          <div className="text-gray-700 whitespace-pre-wrap leading-relaxed border-t pt-4">
            {ticket.content}
          </div>
        </div>

        {/* 评论区：增加楼层感 */}
        <div className="space-y-4 mb-10">
          <h3 className="font-bold text-gray-700 px-2 flex items-center gap-2">
            💬 全部回复 <span className="bg-gray-200 text-gray-600 text-xs px-2 py-0.5 rounded-full">{replies.length}</span>
          </h3>
          
          {replies.length === 0 ? (
            <div className="bg-white p-10 rounded-xl text-center text-gray-400 border border-dashed">
              还没有人回复，快来抢沙发吧！
            </div>
          ) : (
            replies.map((reply, index) => (
              <div key={reply.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:border-blue-200 transition-colors">
                <div className="flex justify-between items-center mb-3 text-xs text-gray-500">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-gray-800">{reply.user_email}</span>
                    <span className="bg-gray-100 px-1.5 py-0.5 rounded">{index + 1}楼</span>
                  </div>
                  <span>{new Date(reply.created_at).toLocaleString()}</span>
                </div>
                <p className="text-gray-800 leading-normal">{reply.content}</p>
              </div>
            ))
          )}
        </div>

        {/* 发表回复：美化输入框 */}
        {ticket.status === 'open' ? (
          <div className="bg-white p-6 rounded-2xl shadow-lg border border-blue-100">
            <h4 className="text-sm font-bold text-gray-700 mb-3">发表你的看法</h4>
            <textarea
              value={newReply}
              onChange={(e) => setNewReply(e.target.value)}
              placeholder="请文明发言，共同维护良好的交流环境..."
              className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all min-h-[120px] text-sm"
          />
          <div className="flex justify-end mt-3">
            <button 
              onClick={handleReply}
              disabled={isSubmitting || !newReply.trim()}
              className="bg-blue-600 text-white px-8 py-2.5 rounded-xl font-bold hover:bg-blue-700 disabled:bg-gray-300 transition-all shadow-md active:scale-95"
            >
              {isSubmitting ? "正在发送..." : "立即回复"}
            </button>
          </div>
        </div>
        ) : (
          <div className="bg-gray-100 p-6 rounded-2xl text-center text-gray-500 border border-dashed">
            🔒 此话题已标记为已解决，评论区已关闭。
          </div>
        )}
      </div>
    </main>
  );
}