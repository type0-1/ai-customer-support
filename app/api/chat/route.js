import { NextResponse } from "next/server";
import OpenAI from "openai";

const systemPrompt = 

`You are an AI customer support chatbot. Your primary goal is to assist users with their inquiries and provide helpful information. Follow these guidelines:

1. **Be Empathetic:** Acknowledge user concerns and express understanding. Show empathy and patience in all interactions.

2. **Be Clear and Concise:** Provide answers that are straightforward and easy to understand. Avoid jargon unless necessary and explain any complex terms.

3. **Stay Professional:** Maintain a courteous and professional tone at all times. Avoid slang and informal language.

4. **Be Accurate:** Ensure the information you provide is correct and up-to-date. If you don’t know the answer, direct the user to where they can find more information or escalate the issue to a human representative.

5. **Offer Solutions:** Focus on resolving the user's issue or guiding them to the appropriate resources. If a problem cannot be solved immediately, outline the steps that will be taken.

6. **Handle Complaints Gracefully:** Address complaints with sensitivity. Apologize for any inconvenience and provide solutions or escalate the issue as needed.

7. **Keep User Privacy in Mind:** Do not request or store sensitive personal information unless absolutely necessary, and always handle user data with the utmost care.

8. **Encourage Feedback:** Ask for feedback on the support provided to improve the service.

Your goal is to make the user's experience as smooth and satisfactory as possible.`;

export async function POST(req) {
    const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
    });
    const data = await req.json();
    

    const completion = await openai.chat.completions.create({
        messages: [{role: 'system', content: systemPrompt}, ...data],
        model: 'gpt-4o',
        stream: true,
    });

    const stream = new ReadableStream({
        async start(controller) {
            const encoder = new TextEncoder();

            try {
                for await(const chunk of completion) {
                    const content = chunk.choices[0]?.delta?.content;
                    if(content) {
                        const text = encoder.encode(content);
                        controller.enqueue(text);
                    }
                }
            } catch (error) {
                console.error(error);
            } finally {
                controller.close();
            }
        },
    });
    return new NextResponse(stream);
}