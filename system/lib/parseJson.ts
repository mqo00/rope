import { parse } from "best-effort-json-parser";
import { jsonrepair } from "jsonrepair";

const cleanJsonText = (text) => {
  return text
    .replace(/```json/, "")
    .replace(/```/g, "")
    .trim();
};

const tryParseStandard = (text) => {
  try {
    return JSON.parse(text);
  } catch (e) {
    return null;
  }
};

const tryParseBestEffort = (text) => {
  const originalConsoleError = console.error;
  console.error = () => {}; // Temporarily disable console.error

  try {
    return parse(text);
  } catch (e) {
    console.error = originalConsoleError;
    return null;
  } finally {
  }
};

const tryParseJsonRepair = (text) => {
  try {
    const result = JSON.parse(jsonrepair(text));
    if (Array.isArray(result)) {
      return {
        chatContent: result.join(" "),
      };
    } else {
      return result;
    }
  } catch (e) {
    return { chatContent: text };
  }
};

export const parseJson = (text) => {
  const cleanText = cleanJsonText(text);

  if (!cleanText) {
    return {};
  }

  return (
    tryParseStandard(cleanText) ||
    tryParseBestEffort(cleanText) ||
    tryParseJsonRepair(cleanText)
  );
};
