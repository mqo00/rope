import { z } from "zod";
import { zodResponseFormat } from "openai/helpers/zod";
import {
  ResponseFormatJSONObject,
  ResponseFormatJSONSchema,
} from "openai/resources/shared.mjs";

export interface DocItem {
  description: string;
}

export interface Step {
  name: string;
  description: string;
  doc?: DocItem[];
}

export interface GameDoc {
  name?: string;
  rule?: string;
  steps?: Step[];
}

export interface MessageContent {
  chatContent?: string;
  variablesAndFunctionsExplanation?: Explanation[];
  action?: string[];
}

export interface Explanation {
  name: string;
  explanation: string;
}

export interface Message {
  role: "user" | "assistant";
  content: string | MessageContent;
  id?: number;
}

export interface ChatPromptProps {
  steps?: Step;
  gameDocs?: GameDoc;
  stage?: number;
  messages?: Message[];
}

export interface Game {
  name: string;
  course: string;
  description: string;
  steps: {
    index: number;
    name: string;
    description: string;
    requirements: string[];
  }[];
}

export type PromptType =
  | "outline"
  | "code"
  | "debug"
  | "test"
  | "interview"
  | "other"
  | "docEvaluate"
  | "stepsChat"
  | "stepsGenerate";

const OutlineJson = z.object({
  chatContent: z.string(),
  gameDoc: z.object({
    name: z.string(),
    steps: z.array(
      z.object({
        name: z.string(),
        description: z.string(),
        show: z.boolean(),
      })
    ),
  }),
  action: z.array(z.string()),
});

const StepGenerateJson = z.object({
  canWriteStepDoc: z.boolean(),
  chatContent: z.string(),
  pythonCode: z.string(),
  stepDoc: z.object({
    name: z.string(),
    description: z.string(),
    doc: z.array(
      z.object({
        // name: z.string(),
        description: z.string(),
        show:z.boolean()
      })
    ),
  }),
  action: z.array(z.string()),
  incorrect: z.boolean(),
  incorrectFeedback: z.string(),
});

export const outputJsonMapper: {
  [key in PromptType]: ResponseFormatJSONSchema | null;
} = {
  outline: zodResponseFormat(OutlineJson, "outline_json"),
  code: null,
  debug: zodResponseFormat(OutlineJson, "outline_json"),
  test: zodResponseFormat(OutlineJson, "outline_json"),
  interview: zodResponseFormat(OutlineJson, "outline_json"),
  other: zodResponseFormat(OutlineJson, "outline_json"),
  docEvaluate: zodResponseFormat(OutlineJson, "outline_json"),
  stepsChat: zodResponseFormat(StepGenerateJson, "step_chat"),
  stepsGenerate: zodResponseFormat(StepGenerateJson, "step_chat"),
};
