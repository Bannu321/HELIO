import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: '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',
  baseURL: 'https://integrate.api.nvidia.com/v1',
})git 

 
async function main() {
  const completion = await openai.chat.completions.create({
    model: "nvidia/nemotron-3-ultra-550b-a55b",
    messages: [{"role":"user","content":"Write a limerick about the wonders of GPU computing."}],
    temperature: 1,
    top_p: 0.95,
    max_tokens: 16384,
    chat_template_kwargs: {"enable_thinking":true},
    stream: true
  })
   
  for await (const chunk of completion) {
        const reasoning = chunk.choices[0]?.delta?.reasoning_content;
    if (reasoning) process.stdout.write(reasoning);
        process.stdout.write(chunk.choices[0]?.delta?.content || '')
    
  }
  
}

main();