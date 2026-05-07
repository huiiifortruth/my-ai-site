import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { supabase } from "@/lib/supabase";

export async function POST(req: Request) {
  try {
    const { message } = await req.json();

    // 1. 初始化 Gemini
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENAI_API_KEY!);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // 2. 从数据库获取背景知识 (简易 RAG)
    // 我们获取最近的 5 条帖子作为参考
    const { data: recentTickets } = await supabase
      .from("tickets")
      .select("title, content, user_email")
      .order("created_at", { ascending: false })
      .limit(5);

    // 将数据库内容格式化为字符串
    const context = recentTickets
      ?.map(t => `话题：${t.title}\n内容：${t.content}\n发布者：${t.user_email}`)
      .join("\n\n---\n\n") || "目前数据库暂无相关话题。";

    // 3. 构建 Prompt (提示词)
    const prompt = `
      你是一个校园智能助手。你的任务是根据提供的【校园交流广场】的最新话题数据来回答用户的问题。
      
      【广场最新动态】：
      ${context}

      【用户问题】：
      "${message}"

      【回答要求】：
      1. 如果广场动态中有相关的解决经验，请优先参考。
      2. 如果动态中没有相关信息，请基于你作为 AI 的通用知识给出礼貌的建议。
      3. 回答要亲切，像学长学姐一样。
      4. 如果用户询问自己的学号，请告知你无法直接获取实时隐私，但可以根据历史记录分析。
    `;

    // 4. 调用 Gemini
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return NextResponse.json({ reply: text });

  } catch (error: any) {
    console.error("Gemini Error:", error);
    return NextResponse.json(
      { reply: "❌ AI 助手暂时无法响应，请检查 API Key 配置或稍后再试。" },
      { status: 500 }
    );
  }
}