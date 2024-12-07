"use client";
import { useEffect, useState, useMemo, useCallback, useRef, use } from "react";
import { generate } from "../app/action";
import { readStreamableValue } from "ai/rsc";
import useLocalStorageState from "use-local-storage-state";
import { parseJson } from "@/lib/parseJson";
import { debounce } from "lodash";
import { Button } from "./ui/button";

interface DocItem {
  name: string;
  description: string;
}

interface Step {
  name: string;
  description: string;
  doc?: DocItem[];
}

interface GameDocs {
  name?: string;
  rule?: string;
  steps?: Step[];
}

interface MessageContent {
  chatContent?: string;
  variablesAndFunctionsExplanation?: Explanation[];
  action?: string[];
}

interface Explanation {
  name: string;
  explanation: string;
}

interface Message {
  role: "user" | "assistant";
  content: string | MessageContent;
  id?: number;
}

interface ChatPromptProps {
  steps?: Step;
  gameDocs?: GameDocs;
  stage?: number;
  messages?: Message[];
}
export default () => {
  const [isLoading, setIsLoading] = useState(false);
  const [input, setInput] = useState("");
  const scrollRef2 = useRef(null);

  const [historyMessages, setHistoryMessages] = useLocalStorageState<Message[]>(
    "otherHistoryMessages",
    { defaultValue: [] }
  );

  const [messages, setMessages] = useLocalStorageState<Message[]>(
    "otherMessages",
    {
      defaultValue: [],
    }
  );

  const showMessages = useMemo(() => {
    return [...historyMessages, ...messages].map((message) => {
      if (message.role === "assistant") {
        return {
          role: "assistant",
          content: parseJson(message.content),
        };
      }
      return { role: "user", content: message.content };
    });
  }, [messages, historyMessages]);

  useEffect(() => {
    if (scrollRef2.current) {
      scrollRef2.current.scrollTop = scrollRef2.current.scrollHeight;
    }
  }, [showMessages]);

  function handleKeyDown(event) {
    if (event.key === "Enter") {
      if (event.shiftKey) {
        event.preventDefault();
      } else {
        // Send message with Enter
        event.preventDefault();
        handleSubmit(event);
      }
    }
  }

  const handleSubmit = async (e) => {
    e && e.preventDefault();
    if (!input) return;
    if (isLoading) return;

    const newMessage: Message[] = [
      ...messages,
      { role: "user", content: input },
    ];
    setMessages((prevMessages) => newMessage);
    setIsLoading(true);
    setInput("");

    let currentText = "";
    const { output } = await generate(
      "otherGame",
      { messages: newMessage },
      newMessage
    );
    await processOutput(output, currentText);
    setIsLoading(false);
  };

  const processOutput = async (output, currentText) => {
    for await (const delta of readStreamableValue(output)) {
      if (delta) {
        currentText += delta;
        setMessages((prevMessages) =>
          updateMessages(prevMessages, currentText)
        );
      }
    }
  };

  const updateMessages = (prevMessages, currentText) => {
    const lastMessage = prevMessages[prevMessages.length - 1];

    if (lastMessage && lastMessage.role === "assistant") {
      return prevMessages.slice(0, -1).concat([
        {
          role: "assistant",
          content: currentText,
        },
      ]);
    } else {
      return [
        ...prevMessages,
        { role: "assistant", content: currentText, id: Date.now() },
      ];
    }
  };

  const reset = () => {
    setHistoryMessages([]);
    setMessages([]);
    setInput("");
    setIsLoading(false);
  };

  return (
    <div className="bg-white overflow-hidden relative h-full bg-while rounded-xl flex flex-col ">
      <div className="bg-gray-100 p-3">
        <div className="text-lg">
          Guidance{" "}
          <div style={{ float: "right" }}>
            <Button onClick={() => reset()}>reset</Button>
          </div>{" "}
        </div>
        <div className="text-gray-800">
          Generate groundtruth outline & ground truth implementation steps
        </div>
      </div>
      <div
        className="flex-1 overflow-auto h-full pb-28 box-border"
        ref={scrollRef2}
      >
        <div className="p-4">
          <div className="space-y-2">
            {showMessages.map((message, index) => (
              <div
                key={index}
                className={`p-2 rounded flex items-center justify-end ${
                  message.role === "user" ? "flex-row" : "flex-row-reverse"
                }`}
              >
                <span
                  className="inline-block p-2 rounded-2xl px-4"
                  style={{
                    backgroundColor:
                      message.role === "user" ? "#007bff" : "#f3f4f6",
                    color: message.role === "user" ? "white" : "black",
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-word",
                  }}
                >
                  {message.role === "user" ? (
                    <span>{message.content}</span>
                  ) : (
                    <ChatContent content={message.content} />
                  )}
                  {index === showMessages.length - 1 &&
                  message.content?.action?.length ? (
                    <div className="my-2">
                      <div className="flex gap-4 flex-wrap">
                        {message.content?.action?.map((item) => (
                          <div
                            key={item}
                            className="cursor-pointer p-2  rounded-xl px-4 bg-blue-100 hover:shadow"
                            onClick={() => onActionClick(item)}
                          >
                            {item}
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </span>
              </div>
            ))}
          </div>
          <div className="absolute left-1/2 bottom-0 w-full mt-2 pb-3 transform -translate-x-1/2">
            <div className="mt-5 text-center">
              {isLoading ? (
                <span className="icon-[line-md--loading-loop] text-2xl"></span>
              ) : null}
            </div>
            <form
              className="my-2 mx-6 flex items-center space-x-2"
              onSubmit={handleSubmit}
            >
              <div className="relative flex items-center w-full ">
                <textarea
                  value={input}
                  onChange={(e) => {
                    setInput(e.target.value);
                  }}
                  placeholder="Input your doc here."
                  className="flex w-full border border-input px-3 py-2 text ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-muted focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 pl-4 pr-10 h-24 rounded bg-muted"
                  style={{
                    minHeight: "4.5rem",
                    overflow: "scroll",
                    boxSizing: "border-box",
                    resize: "none",
                  }}
                  maxLength={99999}
                  onKeyDown={handleKeyDown}
                />
                <button
                  className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:text-accent-foreground h-10 w-10 absolute right-2 top-1/2 transform -translate-y-1/2"
                  type="submit"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="lucide lucide-arrow-right "
                  >
                    <path d="M5 12h14"></path>
                    <path d="m12 5 7 7-7 7"></path>
                  </svg>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

const ChatContent = ({ content }) => {
  const renderContentWithTooltips = (text) => {
    let words = [];
    if (typeof text == "string") {
      words = (text || "").split(/(\s+)/);
    }
    return words.map((word, index) => {
      return <span key={index}>{word}</span>;
    });
  };
  const chatContent =
    content?.chatContent || (typeof content === "string" ? content : "");
  return <span>{renderContentWithTooltips(chatContent)}</span>;
};
