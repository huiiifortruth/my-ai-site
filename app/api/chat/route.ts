import { NextResponse } from "next/server";
import OpenAI from "openai";
import { supabase } from "@/lib/supabase";

// 初始化 OpenAI 客户端，但指向 DeepSeek 的服务器地址
const openai = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY,
  baseURL: "https://api.deepseek.com", // 关键：指向 DeepSeek
});

export async function POST(req: Request) {
  try {
    const { message } = await req.json();

    // 1. 获取背景知识 (简易 RAG)
    const { data: recentTickets } = await supabase
      .from("tickets")
      .select("title, content")
      .order("created_at", { ascending: false })
      .limit(3);

    const context = recentTickets?.map(t => `话题：${t.title} 内容：${t.content}`).join("\n") || "暂无";

    // 2. 调用 DeepSeek 接口
    const completion = await openai.chat.completions.create({
      messages: [
        { 
          role: "system", 
          content: `你是一个校园助手。请参考以下校园广场动态来回答：\n${context}` 
        },
        { role: "user", content: message },
      ],
      model: "deepseek-v4-flash", 
    });

    const reply = completion.choices[0].message.content;

    return NextResponse.json({ reply });

  } catch (error: any) {
    console.error("DeepSeek Error:", error);
    return NextResponse.json(
      { reply: `AI 暂时不可用 (原因: ${error.message})` },
      { status: 500 }
    );
  }
}