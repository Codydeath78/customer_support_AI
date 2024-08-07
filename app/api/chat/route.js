import { NextResponse } from "next/server";
import OpenAI from "openai";
const systemPrompt = 'Welcome to Headstater, your go-to platform for real-time AI-powered technical interview practice. Hello, how can I help you?'
export async function POST(req) {
    const openai = new OpenAI();
    const data = await req.json()

    const messages = Array.isArray(data) ? [{ role: "system", content: systemPrompt }, ...data] : [{ role: "system", content: systemPrompt }];


    const completion = await openai.chat.completions.create({
        messages: messages,
        model: 'gpt-4o',
        stream: true,
      })
    


      const stream = new ReadableStream({
        async start(controller) {
            const encoder = new TextEncoder()
            try{
                for await (const chuck of completion) {
                    const content = chuck.choices[0].delta.content
                    if (content){
                    const text = encoder.encode(content)
                    controller.enqueue(text)
                    }
                }
            } catch (err) {
                controller.error(err)
            } finally {
                controller.close()
            }
        },
      })
      return new NextResponse(stream)

}