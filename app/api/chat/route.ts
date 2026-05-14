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
      model: "deepseek-v4-pro",
      messages: [
        { 
          role: "system", 
          content: `你是北京理工大学（BIT）的专属校园智能助手。
            你的核心任务是解答师生关于北京理工大学的各类问题。

            请严格遵循以下回答原则：

            知识库优先：请优先且完全基于以下提供的【校园知识库】资料来回答用户问题。

            北理优先：如果知识库中没有明确提及，请优先基于你对北京理工大学（包括中关村校区、良乡校区、珠海校区等）的已有知识进行解答。

            兜底建议：如果既没有资料，你也不确定北理的具体规定，请提供通用的中国高校建议，并明确提醒用户：“由于缺乏具体资料，此建议为通用情况，具体请以北京理工大学官方最新通知为准。”

            回答风格：亲切、准确、有校园亲和力。

            【校园知识库】资料：
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