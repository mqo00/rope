"use server";

// import * as dotenv from "dotenv";
// dotenv.config(); // { path: '/.env' });

import { createStreamableValue } from "ai/rsc";
import { prompts } from "../lib/prompts";
import OpenAI from "openai";
import { outputJsonMapper, PromptType } from "@/lib/interfaces";

const openaiBaseURL = "https://api.openai-proxy.com/v1";
const openaiApiKey = process.env.OPENAI_API_KEY;
const openaiModel35 = "gpt-3.5-turbo";
const openaiModel40 = "gpt-4o-2024-08-06";

const config = {
  default: {
    baseURL: openaiBaseURL,
    apiKey: openaiApiKey,
    model: openaiModel40,
    max_tokens: 4096,
    temperature: 0.7,
    response_format: { type: "json_object" },
  },
  code: {
    baseURL: openaiBaseURL,
    apiKey: openaiApiKey,
    model: openaiModel40,
    max_tokens: 4096,
    temperature: 0.3,
  },
};

const converNL2json = (nl: string, promptType: PromptType) => {
  if (promptType === "code") {
    return {
      prompt: nl,
      examples: [
        {
          prompt: "Convert the following natural language to JSON:",
          completion: nl,
        },
      ],
    };
  }
};

export async function generate(
  promptType: PromptType,
  promptProps: any,
  messages = []
) {
  "use server";

  let { baseURL, apiKey, model, max_tokens, temperature, response_format } =
    config[promptType] || config.default;
  if (promptType !== "code") {
    response_format = outputJsonMapper[promptType];
  }
  const openai = new OpenAI({
    apiKey,
    baseURL,
  });

  const stream = createStreamableValue("");

  (async () => {
    try {
      const systemPrompt = prompts[promptType](promptProps);
      // console.log('openai api key', apiKey, model, max_tokens, temperature);
      const theMessages = [
        { role: "system", content: systemPrompt },
        ...messages,
      ];
      console.log("theMessages", theMessages);
      const textStream = await openai.chat.completions.create({
        model,
        max_tokens,
        temperature,
        stream: true,
        messages: theMessages as any,
        response_format,
      });
      /*
      const condidate = completion.choices[0].message;
      console.log(condidate);
      // If the model refuses to respond, you will get a refusal message
      if (condidate.refusal) {
        console.log(condidate.refusal);
        stream.update(`ERROR: ${condidate.refusal}`);
      } else {
        text = condidate.parsed;
        stream.update(`${condidate.parsed}`);
      }
        */

      for await (const chunk of textStream) {
        const text =
          chunk.choices?.[0]?.delta?.content ||
          chunk.data?.choices?.[0]?.delta?.content;

        stream.update(text);
      }
      stream.done();
    } catch (error) {
      console.log("ERROR OPENAI APIIIIII", apiKey);
      console.log("ERROR", error);
      //stream.update(`Error: ${error.message}`);
      //stream.done();
    }
  })();
  return { output: stream.value };
}
