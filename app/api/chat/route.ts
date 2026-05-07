import { NextResponse } from "next/server";
import OpenAI from "openai";
import { supabase } from "@/lib/supabase";

// 初始化 DeepSeek 客户端
const openai = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY,
  baseURL: "https://api.deepseek.com",
});

export async function POST(req: Request) {
  try {
    const { message } = await req.json();

    // --- 1. 关键词提取 ---
    // 提取用户问题中长度大于1的词，比如“报修”、“食堂”
    const keywords = message.split(/[ ？?，。！!、]/).filter((word: string) => word.length >= 2);
    
    let searchContent = "";

    if (keywords.length > 0) {
      // --- 2. 执行关键词搜索 ---
      // 构造搜索条件：匹配标题或内容中包含任何一个关键词的记录
      const queryFilter = keywords.map((word: string) => `content.ilike.%${word}%,title.ilike.%${word}%`).join(",");
      
      const { data: matchedDocs } = await supabase
        .from("campus_knowledge")
        .select("title, content")
        .or(queryFilter)
        .limit(3); // 取最相关的 3 条资料

      searchContent = matchedDocs?.map(d => `【参考资料：${d.title}】\n${d.content}`).join("\n\n") || "";
    }

    // --- 3. 构建提示词并调用 AI ---
    const completion = await openai.chat.completions.create({
      model: "deepseek-chat",
      messages: [
        { 
          role: "system", 
          content: `你是一个专业的校园智能助手。
          请根据以下提供的【校园知识库】资料来回答用户的问题。
          如果资料中没有提到相关内容，请基于你的通用知识给出建议。
          回答要亲切、准确。
          
          资料库内容：
          ${searchContent || "（暂时没有找到直接相关的校园资料）"}` 
        },
        { role: "user", content: message },
      ],
    });

    const reply = completion.choices[0].message.content;
    return NextResponse.json({ reply });

  } catch (error: any) {
    console.error("Chat Error:", error);
    return NextResponse.json({ reply: "AI 助手暂时走神了，请稍后再试。" }, { status: 500 });
  }
}