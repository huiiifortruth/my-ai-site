"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation"; // 【新增】引入路由控制钩子

export default function LoginPage() {
  const router = useRouter(); // 【新增】初始化路由
  const [studentId, setStudentId] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const dummyDomain = "@ai-system.com";

  // 校验学号格式：必须是精确的 10 位纯数字
  const isValidStudentId = (id: string) => {
    return /^\d{10}$/.test(id);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isValidStudentId(studentId)) {
      setMessage("⚠️ 注册失败：学号必须是精确的 10 位纯数字！");
      return;
    }

    setIsLoading(true);
    setMessage("正在为您注册...");

    const authEmail = studentId + dummyDomain;

    const { data, error } = await supabase.auth.signUp({
      email: authEmail,
      password,
    });

    if (error) {
      setMessage(`注册失败: ${error.message}`);
    } else {
      setMessage("注册成功！您可以直接尝试登录了。");
    }
    setIsLoading(false);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isValidStudentId(studentId)) {
      setMessage("⚠️ 登录失败：学号格式不正确！");
      return;
    }

    setIsLoading(true);
    setMessage("正在登录...");

    const authEmail = studentId + dummyDomain;

    const { data, error } = await supabase.auth.signInWithPassword({
      email: authEmail,
      password,
    });

    if (error) {
      setMessage(`登录失败: 学号或密码错误`);
    } else {
      setMessage("✅ 登录成功！正在进入系统...");
      
      // 【修改点】使用 router.push 实现无刷新跳转
      // 延迟 1 秒跳转，让用户能看到成功提示，体验更好
      setTimeout(() => {
        router.push("/"); 
      }, 1000);
    }
    setIsLoading(false);
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">欢迎回来</h1>
          <p className="text-sm text-gray-500">请输入您的10位学号进行验证</p>
        </div>

        <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">学号</label>
            <input
              type="text" 
              maxLength={10} 
              value={studentId}
              onChange={(e) => {
                const onlyNums = e.target.value.replace(/[^0-9]/g, '');
                setStudentId(onlyNums);
              }}
              placeholder="例如：1120260001"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">密码</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              required
            />
          </div>

          {message && (
            <div className={`p-3 rounded-lg text-sm text-center transition-all ${
              message.includes("成功") 
                ? "bg-green-50 text-green-700 border border-green-200" 
                : "bg-red-50 text-red-700 border border-red-200"
            }`}>
              {message}
            </div>
          )}

          <div className="flex gap-4">
            <button
              onClick={handleLogin}
              disabled={isLoading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-bold py-3 px-4 rounded-lg transition-all shadow-md active:scale-95"
            >
              {isLoading ? "处理中..." : "登 录"}
            </button>
            <button
              onClick={handleSignUp}
              disabled={isLoading}
              className="flex-1 bg-white hover:bg-gray-50 border border-gray-300 disabled:bg-gray-100 text-gray-700 font-bold py-3 px-4 rounded-lg transition-all shadow-sm active:scale-95"
            >
              注 册
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}