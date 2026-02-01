"use client";
import { useEffect, useState, useMemo, useCallback, useRef, use } from "react";
import { generate } from "./action";
import { readStreamableValue } from "ai/rsc";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import useLocalStorageState from "use-local-storage-state";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

import Box from "@mui/material/Box";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import LoadingButton from "@mui/lab/LoadingButton";

import Login from "@/components/ui/login";

import ClickLogger from "@/components/ClickLogger";
import { parseJson } from "@/lib/parseJson";
import { v4 as uuidv4 } from "uuid";
import { debounce, cloneDeep } from "lodash";
import {
  Message,
  ChatPromptProps,
  GameDoc,
  PromptType,
} from "../lib/interfaces";

import { convertGame2Doc } from "../lib/games";

export default function Page() {
  const [currentGameObj, setCurrentGameObj] = useLocalStorageState(
    "currentGameObj",
    {
      defaultValue: {
        gameTitle: "",
        baseExplanations: [],
        gameStepsCodes: [],
        CurrentGame: {},
        CurrGameDoc: {},
      },
    }
  );
  const [selectGameIndex, setSelectGameIndex] = useState(0);
  const [selectGameIndex2, setSelectGameIndex2] = useState(0);

  const [open, setOpen] = useState(false);
  const [open2, setOpen2] = useState(false);
  const [open3, setOpen3] = useState(false);
  const [CurrGameDocList, setCurrGameDocList] = useLocalStorageState(
    "CurrGameDocList",
    {
      defaultValue: [],
    }
  );
  const [gameDocs, setGameDocs] = useLocalStorageState<GameDoc>("gameDocs", {
    defaultValue: {},
  });

  useEffect(() => {
    fetchGameList();
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      console.log("CurrGameDocList", CurrGameDocList);
      if (CurrGameDocList.length == 0) return;
      const lselectGameIndex = localStorage.getItem("selectGameIndex") || 0;
      setSelectGameIndex(lselectGameIndex ? Number(lselectGameIndex) : 0);
      setCurrentGameObj({
        gameTitle:
          CurrGameDocList[lselectGameIndex ? Number(lselectGameIndex) : 0]
            .gameTitle,
        baseExplanations:
          CurrGameDocList[lselectGameIndex ? Number(lselectGameIndex) : 0]
            .baseExplanations,
        CurrentGame:
          CurrGameDocList[lselectGameIndex ? Number(lselectGameIndex) : 0]
            .CurrentGame,
        gameStepsCodes:
          CurrGameDocList[lselectGameIndex ? Number(lselectGameIndex) : 0]
            .gameStepsCodes,
        CurrGameDoc: convertGame2Doc(
          CurrGameDocList[lselectGameIndex ? Number(lselectGameIndex) : 0]
            .CurrentGame
        ),
      });
      let localGameDocs = JSON.parse(localStorage.getItem("gameDocs") || "");
      if (localGameDocs.name) {
      } else {
        setGameDocs(
          convertGame2Doc(
            CurrGameDocList[lselectGameIndex ? Number(lselectGameIndex) : 0]
              .CurrentGame
          )
        );
      }
    }
  }, [CurrGameDocList]);

  let TemporaryCode = "";
  const [historyMessages, setHistoryMessages] = useLocalStorageState<Message[]>(
    "historyMessages",
    { defaultValue: [] }
  );
  const [chatType, setChatType] = useLocalStorageState<PromptType>("chatType", {
    defaultValue: "outline",
  });
  const [chatPromptProps, setChatPromptProps] =
    useLocalStorageState<ChatPromptProps>("chatPromptProps", {
      defaultValue: {},
    });
  const [messages, setMessages] = useLocalStorageState<Message[]>("messages", {
    defaultValue: [
      {
        role: "assistant",
        content: `{
          chatContent: "Hi there! Can you try to enumerate the main steps for creating ${currentGameObj.gameTitle}, in bullet points of short phrases? Think about the high-level goals you need to achieve! Be concise, we will elaborate on each step later.
          \nCheck out the solution on the right to get a sense of how ${currentGameObj.gameTitle} works. You may need to click on the canvas first before key presses."
        }`,
      },
    ],
  });

  const [input, setInput] = useLocalStorageState("input", { defaultValue: "" });
  const [stage, setStage] = useLocalStorageState("stage", { defaultValue: 1 });
  const [isLoading, setIsLoading] = useState(false);
  const [loginDialogOpen, setLoginDialogOpen] = useState(false);
  const [login, setLogin] = useState(true);
  const [back, setBack] = useState(false);
  const [count, setCount] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  useEffect(() => {
    const login = Boolean(
      localStorage.getItem("username") &&
        localStorage.getItem("username") != null
    );
    setLogin(login);
  }, []);
  useEffect(() => {
    if (!localStorage.getItem("uuid") || localStorage.getItem("uuid") == null) {
      localStorage.setItem("uuid", uuidv4());
    }
  }, []);

  const fetchMessage = async (chatType: String, message: String) => {
    const username = localStorage.getItem("username");
    const timestamp = Date.now();
    const conversationId = localStorage.getItem("uuid");
    await fetch("/api/conversation", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username,
        chatType,
        timestamp,
        message,
        conversationId,
        gameName: currentGameObj.gameTitle,
      }),
    });
  };

  const fetchCode = async (stepName: String, code: String) => {
    const username = localStorage.getItem("username");
    const timestamp = Date.now();
    const conversationId = localStorage.getItem("uuid");
    await fetch("/api/generateCode", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username,
        code,
        timestamp,
        stepName,
        conversationId,
        gameName: currentGameObj.gameTitle,
      }),
    });
  };

  const handleInputChange = (e) => {
    setInput(e.target.value);
  };

  const handleSubmit = async (e) => {
    e && e.preventDefault();
    if (!input) return;
    if (isLoading) return;

    const newMessage: Message[] = [
      ...messages,
      { role: "user", content: input },
    ];
    fetchMessage("user", input);
    setMessages((prevMessages) => newMessage);
    setIsLoading(true);
    setInput("");

    const promptProps = {
      gameDocs,
      stage,
      steps: gameDocs?.steps?.find(
        (item) => item.name === chatPromptProps.steps?.name
      ),
    };

    let currentText = "";
    const { output } = await generate(
      chatType,
      {
        ...chatPromptProps,
        ...promptProps,
        messages: newMessage,
        CurrentGame: currentGameObj.CurrentGame,
      },
      newMessage
    );
    await processOutput(output, currentText);
    setIsLoading(false);
  };

  const processOutput = async (output, currentText) => {
    let parsed;
    for await (const delta of readStreamableValue(output)) {
      if (delta) {
        currentText += delta;
        setMessages((prevMessages) =>
          updateMessages(prevMessages, currentText)
        );
        parsed = parseJson(currentText);
        // if (parsed && parsed.gameDoc) {
        //   setGameDocs(parsed.gameDoc);
        // }
      }
    }
    if (parsed && parsed.incorrect) {
      let currentText = cloneDeep(parsed);
      // currentText.chatContent = currentText.chatContent +
      //   " Get a better understanding by clicking Generate Game and compare with Solution game.";
      currentText.action = Array.from(
        new Set([...currentText.action, "Generate Game"])
      );
      setMessages((prevMessages) =>
        updateMessages(prevMessages, JSON.stringify(currentText))
      );
    }
    if (parsed && parsed.gameDoc) {
      setGameDocs(parsed.gameDoc);
    }
    if (
      parsed &&
      (parsed.needEditSteps || parsed.canWriteStepDoc || parsed.stepDoc)
    ) {
      const findStepsIndex = gameDocs.steps?.findIndex(
        (item) => item.name === chatPromptProps.steps?.name
      );
      if (parsed.pythonCode) {
        TemporaryCode = parsed.pythonCode;
      }
      if (findStepsIndex !== -1 && findStepsIndex !== undefined) {
        const updatedSteps = { ...gameDocs.steps?.[findStepsIndex] };

        if (parsed.stepDoc?.doc) {
          updatedSteps.doc = parsed.stepDoc.doc;
        }
        const newGameDocs = { ...gameDocs };
        newGameDocs.steps[findStepsIndex] = updatedSteps;

        setGameDocs(newGameDocs);
      }
    }
    fetchMessage("gpt", currentText);
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

  useEffect(() => {
    const message = messages[messages.length - 1];
    if (message?.role === "assistant" && message?.content) {
      const parsed = parseJson(message.content);

      if (parsed.doesTheUserNeedToModifyTheDocument === false) {
        setTimeout(() => {
          nextStep();
        }, 1000);
      }
      if (parsed.doesTheUserNeedToModifyTheStepDocument === false) {
        setTimeout(() => {
          nextStep();
        }, 1000);
      }
    }
  }, [messages]);

  const nextStep = () => {
    if (stage === 1) {
      onStepsGenerate(gameDocs.steps?.[0], 0);
      setStage(2);
      setGameDocs((prevGameDocs) => {
        const newGameDocs = JSON.parse(
          JSON.stringify(currentGameObj.CurrGameDoc)
        );
        newGameDocs.steps = newGameDocs.steps.map((ele) => {
          return {
            ...ele,
            show: true,
          };
        });
        return newGameDocs;
      });
    } else {
      const findStepsIndex = gameDocs.steps?.findIndex(
        (item) => item.name === chatPromptProps.steps?.name
      );
      if (findStepsIndex === gameDocs.steps.length - 1) {
        let copyList = cloneDeep(messages);
        copyList.pop();
        setMessages([
          ...copyList,
          {
            role: "assistant",
            content: `{
            chatContent: "Congratulations!! You've successfully completed the ${currentGameObj.gameTitle} tutorial!"
          }`,
          },
        ]);
        fetchMessage(
          "gpt",
          `{
            chatContent: "Congratulations! You've successfully completed the ${currentGameObj.gameTitle} tutorial!"
          }`
        );
        setStage(3);
        setGameOver(true);
      } else {
        onStepsGenerate(gameDocs.steps[findStepsIndex + 1], findStepsIndex + 1);
        // setIframeContent("");
      }
      setIframeContent(currentGameObj.gameStepsCodes[findStepsIndex]);
    }
  };

  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  useEffect(() => {
    const findStepsIndex = gameDocs.steps?.findIndex(
      (item) => item.name === chatPromptProps.steps?.name
    );
    if (findStepsIndex == -1) {
      setCurrentStepIndex(0);
    } else {
      setCurrentStepIndex(findStepsIndex ? findStepsIndex : 0);
    }
  }, [chatPromptProps]);

  // Update currentGameObj with currentStepIndex and stage for click logging
  useEffect(() => {
    setCurrentGameObj((prev) => ({
      ...prev,
      currentStep: currentStepIndex,
      stage: stage
    }));
  }, [currentStepIndex, stage]);

  const onStepsGenerate = (item, index, gameDocsI) => {
    // setCurrentStepIndex(index)
    setChatType("stepsGenerate");
    setChatPromptProps({ steps: item, gameDocs: gameDocsI || gameDocs });
    const updatedHistoryMessages = [...historyMessages, ...messages];
    setHistoryMessages(updatedHistoryMessages);
    if (index == 0) {
      setMessages([
        {
          role: "assistant",
          content: `{
            chatContent: "You did a good job on the outline. Now let's add detailed information for each step and generate game to verify your requirements! For '${item.name},' look at the Solution. Give me a list of core requirements of this step."
          `,
        },
      ]);
      fetchMessage(
        "gpt",
        `{
            chatContent: "You did a good job on the outline. Now let's add detailed information for each step and generate game to verify your requirements! For '${item.name},' look at the Solution. Give me a list of core requirements of this step."
          }`
      );
    } else {
      setMessages([
        {
          role: "assistant",
          content: `{
            chatContent: "About '${item.name},' look at the solution output. What do you need in this step? Give me a list of core requirements."
          }`,
        },
      ]);
      fetchMessage(
        "gpt",
        `{
            chatContent: "About '${item.name},' look at the solution output. What do you need in this step? Give me a list of core requirements."
          }`
      );
    }
    setBack(true);
  };

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

  const [iframeContent, setIframeContent] = useState("");
  const [isCodeLoading, setIsCodeLoading] = useState(false);

  const generateCode = async () => {
    let currentText = "";
    if (isCodeLoading) return;
    setIsCodeLoading(true);
    let currentStep = gameDocs?.steps?.find(
      (item) => item.name === chatPromptProps.steps?.name
    );
    const findStepsIndex = gameDocs.steps?.findIndex(
      (item) => item.name === chatPromptProps.steps?.name
    );

    let blinkItems = document.querySelectorAll(`#steps-${findStepsIndex}`);
    blinkItems.forEach((item) => {
      item.classList.add("blink");
      setTimeout(() => {
        item.classList.remove("blink");
      }, 2000);
    });

    const studentInput = showMessages[showMessages.length - 2].content;
    const incorrectFeedback =
      showMessages[showMessages.length - 1].content.incorrectFeedback;
    const { output } = await generate("code", {
      gameDocs: gameDocs,
      currentStep: currentStep,
      findStepsIndex,
      studentInput,
      incorrectFeedback,
      gameStepsCodes: currentGameObj.gameStepsCodes,
      CurrentGame: currentGameObj.CurrentGame,
    });

    for await (const delta of readStreamableValue(output)) {
      currentText += delta;
      setIframeContent(
        currentText.replace(/```python/, "").replace(/```/g, "")
      );
    }
    fetchCode(
      chatPromptProps.steps?.name || "noStepName",
      currentText.replace(/```python/, "").replace(/```/g, "")
    );

    setBack(false);
    setIsCodeLoading(false);
  };

  const generateCode2 = async () => {
    let currentText = "";
    if (isCodeLoading) return;
    setIsCodeLoading(true);
    const findStepsIndex = gameDocs.steps?.findIndex(
      (item) => item.name === chatPromptProps.steps?.name
    );

    let blinkItems = document.querySelectorAll(`#steps-${findStepsIndex}`);
    blinkItems.forEach((item) => {
      item.classList.add("blink");
      setTimeout(() => {
        item.classList.remove("blink");
      }, 2000);
    });

    await new Promise((resolve, reject) => {
      resolve(true);
    });

    setIframeContent(
      currentGameObj.gameStepsCodes[findStepsIndex ? findStepsIndex : 0]
    );
    setCount((count) => count + 1);

    setBack(false);
    setIsCodeLoading(false);
  };

  const onActionClick = (item: string, allItems) => {
    if (isLoading) return;
    if (item.includes("Generate Game") || item.includes("generate game")) {
      if (allItems.includes("Next Step")) {
        generateCode2();
      } else {
        generateCode();
      }
    } else if (
      item.includes("Next step") ||
      item.includes("next step") ||
      item.includes("Next Step")
    ) {
      nextStep();
    } else {
      setInput(item);
    }
  };

  const reset = () => {
    setGameOver(false);
    localStorage.setItem("uuid", uuidv4());
    setHistoryMessages([]);
    setChatType("outline");
    setChatPromptProps({});
    setMessages([
      {
        role: "assistant",
        content: `{
          chatContent: "Hi there! Can you try to enumerate the main steps for creating ${currentGameObj.gameTitle}, in bullet points of short phrases? Think about the high-level goals you need to achieve! Be concise, we will elaborate on each step later.
          \nCheck out the solution on the right to get a sense of how ${currentGameObj.gameTitle} works. You may need to click on the canvas first before key presses."
        }`,
      },
    ]);
    setGameDocs(currentGameObj.CurrGameDoc);
    setInput("");
    setIsLoading(false);
    setIframeContent("");
    setIsCodeLoading(false);
    setStage(1);
  };
  const [isButtonVisible, setIsButtonVisible] = useState(true);
  const [showOther, setShowOther] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsButtonVisible(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const [accordionValue, setAccordionValue] = useState(
    chatPromptProps.steps?.name
  );

  useEffect(() => {
    setAccordionValue(chatPromptProps.steps?.name);
  }, [chatPromptProps.steps?.name]);

  const showAll = () => {
    if (isLoading) return;
    let copyList = cloneDeep(messages);
    setMessages([
      ...copyList,
      {
        role: "assistant",
        content: `{
            chatContent: "Congratulations!! You've successfully completed the ${currentGameObj.gameTitle} tutorial!"
          }`,
      },
    ]);
    setStage(3);
    setGameOver(true);
    setCurrentStepIndex(currentGameObj.gameStepsCodes.length - 1);
    setGameDocs((prevGameDocs) => {
      const newGameDocs = JSON.parse(
        JSON.stringify(currentGameObj.CurrGameDoc)
      );
      newGameDocs.steps = newGameDocs.steps.map((step) => {
        return {
          ...step,
          show: true,
          doc: step.doc.map((ele) => {
            return {
              description: ele.description,
              show: true,
            };
          }),
        };
      });
      return newGameDocs;
    });
  };
  
  const handleChange = (event) => {
    const newGameIndex = event.target.value;
    const newGame = CurrGameDocList[newGameIndex];
    const oldGameTitle = currentGameObj.gameTitle;
    
    // Save current game's messages before switching
    if (oldGameTitle) {
      const allMessages = [...historyMessages, ...messages];
      localStorage.setItem(`messages_${oldGameTitle}`, JSON.stringify(allMessages));
      localStorage.setItem(`chatType_${oldGameTitle}`, chatType);
      localStorage.setItem(`stage_${oldGameTitle}`, String(stage));
      localStorage.setItem(`gameDocs_${oldGameTitle}`, JSON.stringify(gameDocs));
    }
    
    setSelectGameIndex(newGameIndex);
    localStorage.setItem("selectGameIndex", newGameIndex);
    setOpen(false);
    
    // Try to load saved messages for the new game
    const savedMessages = localStorage.getItem(`messages_${newGame.gameTitle}`);
    const savedChatType = localStorage.getItem(`chatType_${newGame.gameTitle}`);
    const savedStage = localStorage.getItem(`stage_${newGame.gameTitle}`);
    const savedGameDocs = localStorage.getItem(`gameDocs_${newGame.gameTitle}`);
    
    if (savedMessages && JSON.parse(savedMessages).length > 0) {
      // Restore saved state for this game
      const parsedMessages = JSON.parse(savedMessages);
      setHistoryMessages(parsedMessages.slice(0, -1)); // All but last as history
      setMessages(parsedMessages.slice(-1)); // Last message as current
      setChatType((savedChatType || "outline") as PromptType);
      setStage(savedStage ? Number(savedStage) : 1);
      if (savedGameDocs) {
        setGameDocs(JSON.parse(savedGameDocs));
      }
    } else {
      // Fresh start for this game
      localStorage.setItem("uuid", uuidv4());
      setHistoryMessages([]);
      setChatType("outline");
      setStage(1);
      setMessages([
        {
          role: "assistant",
          content: `{
            chatContent: "Hi there! Can you try to enumerate the main steps for creating ${
              newGame.gameTitle
            }, in bullet points of short phrases? Think about the high-level goals you need to achieve! Be concise, we will elaborate on each step later.
            \nCheck out the solution on the right to get a sense of how ${
              newGame.gameTitle
            } works. You may need to click on the canvas first before key presses."
          }`,
        },
      ]);
      setGameDocs(
        JSON.parse(
          JSON.stringify(
            convertGame2Doc(newGame.CurrentGame)
          )
        )
      );
    }
    
    setChatPromptProps({});
    setIframeContent("");
    setCurrentGameObj({
      gameTitle: newGame.gameTitle,
      baseExplanations: newGame.baseExplanations,
      CurrentGame: newGame.CurrentGame,
      gameStepsCodes: newGame.gameStepsCodes,
      CurrGameDoc: convertGame2Doc(newGame.CurrentGame),
    });
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleClickOpen = () => {
    setOpen(true);
  };

  const openDialog2 = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setOpen2(true);
  };
  const openDialog3 = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setOpen3(true);
  };

  const closeDialog2 = () => {
    setOpen2(false);
  };

  const closeDialog3 = () => {
    setOpen3(false);
  };

  const [uploadGameObj, setUploadGameObj] = useState({});
  const [uploadGameCode, setUploadGameCode] = useState<String[]>([]);
  const [uploading, setUploading] = useState(false);

  const handleFileUpload = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        console.log("tttttttt", JSON.parse(text));
        setUploadGameObj(JSON.parse(text));
      };
      // 读取文件内容为文本
      reader.readAsText(file);
    }
  };

  const handleFileUpload2 = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        setUploadGameCode(text.split("******"));
      };
      // 读取文件内容为文本
      reader.readAsText(file);
    }
  };
  const handleAddGame = async (event) => {
    event.preventDefault();
    event.stopPropagation();
    if (uploadGameObj.gameTitle == undefined) {
      return alert("Please upload the gameObj");
    }
    if (!uploadGameCode.length) {
      return alert("Please upload the gameCode");
    }
    console.log("uploadGameObj", uploadGameObj);
    console.log("uploadGameCode", uploadGameCode);
    
    // Password protection
    const password = prompt("Please input the password to add game");
    if (!password) return alert("Please input the password");
    
    // Verify password via API (include username for per-user database)
    const username = localStorage.getItem("username");
    const verifyRes = await fetch("/api/data", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        gameName: uploadGameObj.gameTitle,
        baseExplanations: uploadGameObj.baseExplanations,
        gameDoc: uploadGameObj.CurrentGame,
        gameStepsCodes: uploadGameCode,
        password,
        username,
      }),
    });
    const verifyData = await verifyRes.json();
    
    if (!verifyData.success) {
      return alert("Your password is incorrect");
    }
    
    // Add game to local state
    const newGame = {
      gameTitle: uploadGameObj.gameTitle,
      baseExplanations: uploadGameObj.baseExplanations,
      CurrentGame: uploadGameObj.CurrentGame,
      gameStepsCodes: uploadGameCode,
    };
    
    // Check if game already exists
    const existingIndex = CurrGameDocList.findIndex(
      (g) => g.gameTitle?.toLowerCase() === newGame.gameTitle?.toLowerCase()
    );
    
    if (existingIndex !== -1) {
      // Update existing game
      const updatedList = [...CurrGameDocList];
      updatedList[existingIndex] = newGame;
      setCurrGameDocList(updatedList);
    } else {
      // Add new game
      setCurrGameDocList([...CurrGameDocList, newGame]);
    }
    
    setOpen2(false);
    alert(`Game "${newGame.gameTitle}" added successfully!`);
  };

  const handleDeleteGame = async (event) => {
    event.preventDefault();
    event.stopPropagation();
    if (selectGameIndex2 == selectGameIndex) {
      return alert("You can't delete the current game. Please change the game first and try again!");
    }
    
    const gameToDelete = CurrGameDocList[selectGameIndex2]?.gameTitle;
    
    // Password protection
    const password = prompt("Please input the password to delete game");
    if (!password) return alert("Please input the password");
    
    // Verify password via API (include username for per-user database)
    const username = localStorage.getItem("username");
    const verifyRes = await fetch("/api/data", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        gameName: gameToDelete,
        password,
        username,
      }),
    });
    const verifyData = await verifyRes.json();
    
    if (!verifyData.success) {
      return alert("Your password is incorrect");
    }
    
    // Remove game from local state
    const updatedList = CurrGameDocList.filter((_, index) => index !== Number(selectGameIndex2));
    setCurrGameDocList(updatedList);
    
    // Adjust selectGameIndex if needed
    if (Number(selectGameIndex) > Number(selectGameIndex2)) {
      localStorage.setItem("selectGameIndex", String(Number(selectGameIndex) - 1));
    }
    
    setOpen3(false);
    alert(`Game "${gameToDelete}" deleted!`);
  }

  const fetchGameList = async () => {
    // Read directly from localStorage to get existing games
    let existingGames = [];
    try {
      const stored = localStorage.getItem("CurrGameDocList");
      if (stored) {
        existingGames = JSON.parse(stored) || [];
      }
    } catch (e) {
      existingGames = [];
    }
    
    // Check if Tetris is already in the list
    const hasTetris = existingGames.some(
      (g) => g.gameTitle?.toLowerCase() === "tetris"
    );
    
    if (hasTetris && existingGames.length > 0) {
      // Already have games including Tetris, no need to fetch
      console.log("Using existing games from localStorage:", existingGames.map(g => g.gameTitle));
      // Still need to set state from localStorage
      setCurrGameDocList(existingGames);
      return;
    }
    
    // Load Tetris from local files
    const res = await fetch(`/api/localGames?game=Tetris`, { method: "GET" });
    if (!res.ok) {
      console.error("Failed to load Tetris");
      return;
    }
    
    const data = await res.json();
    const tetrisGame = (data.data || []).map((ele) => ({
      gameTitle: ele.gameName,
      baseExplanations: ele.baseExplanations,
      CurrentGame: ele.gameDoc,
      gameStepsCodes: ele.gameStepsCodes,
    }))[0];
    
    if (tetrisGame) {
      // Add Tetris to existing games (or create new list with just Tetris)
      const newGameList = [...existingGames.filter(g => g.gameTitle?.toLowerCase() !== "tetris"), tetrisGame];
      console.log("Loaded games:", newGameList.map(g => g.gameTitle));
      
      // Find Tetris index and set it as default only if no previous selection
      const savedIndex = localStorage.getItem("selectGameIndex");
      if (!savedIndex) {
        const tetrisIndex = newGameList.findIndex(g => g.gameTitle?.toLowerCase() === "tetris");
        if (tetrisIndex !== -1) {
          localStorage.setItem("selectGameIndex", String(tetrisIndex));
        }
      }
      
      setCurrGameDocList(newGameList);
    }
  };

  return (
    <>
      {login ? (
        <main className="h-[100vh]  grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-blue-300 box-border">
          <div
            className={`flex flex-col fixed z-10 top-1/2 right-0 transition-transform duration-300 ${
              isButtonVisible ? "translate-x-[10%]" : "translate-x-[80%]"
            }`}
            onMouseEnter={() => setIsButtonVisible(true)}
            onMouseLeave={() => setIsButtonVisible(false)}
          >
            <div>
              <Button
                className="p-4 hover:shadow rounded-l-full w-full  -mt-10"
                onClick={() => reset()}
                data-button-id="reset-game"
              >
                Reset
              </Button>
            </div>
            <div>
              <Button
                className="p-4 hover:shadow rounded-l-full mt-2 w-full"
                onClick={() => showAll()}
                data-button-id="end-game"
              >
                End
              </Button>
            </div>
            <div>
              <Button
                className="p-4 hover:shadow rounded-l-full w-full mt-2"
                onClick={() => handleClickOpen()}
                data-button-id="change-game"
              >
                Change Game
              </Button>
            </div>
          </div>
          <Dialog disableEscapeKeyDown open={open} onClose={handleClose}>
            <DialogContent>
              <Box
                component="form"
                sx={{ display: "flex", flexWrap: "wrap", alignItems: "center" }}
              >
                <FormControl sx={{ m: 1, minWidth: 120, width: "100%" }}>
                  <Select
                    native
                    value={selectGameIndex}
                    onChange={handleChange}
                  >
                    {CurrGameDocList.map((ele, index) => (
                      <option value={index}>{ele.gameTitle}</option>
                    ))}
                  </Select>
                </FormControl>
                <Button
                  className="p-4 hover:shadow rounded-l-full rounded-r-full w-full mt-2"
                  onClick={(e) => openDialog2(e)}
                  data-button-id="add-game"
                >
                  Add Game
                </Button>
                <Button
                  className="p-4 hover:shadow rounded-l-full rounded-r-full w-full mt-2"
                  onClick={(e) => openDialog3(e)}
                  data-button-id="delete-game"
                >
                  Delete Game
                </Button>
              </Box>
            </DialogContent>
          </Dialog>
          <Dialog disableEscapeKeyDown open={open2} onClose={closeDialog2}>
            <DialogContent>
              <Box
                component="form"
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "10px",
                }}
              >
                <label htmlFor="file-upload" className="hoverBac">
                  {uploadGameObj.gameTitle
                    ? "upload success"
                    : "please upload game file"}
                </label>
                <input
                  id="file-upload"
                  type="file"
                  accept=".json"
                  onChange={handleFileUpload}
                  className="p-4"
                  style={{ display: "none" }}
                  placeholder="upload game file"
                />

                <label htmlFor="file-upload2" className="hoverBac">
                  {uploadGameCode.length
                    ? "upload success"
                    : "please upload game code"}
                </label>
                <input
                  id="file-upload2"
                  type="file"
                  accept=".txt"
                  onChange={handleFileUpload2}
                  className="p-4"
                  style={{ display: "none" }}
                  placeholder="upload game code"
                />
                <LoadingButton
                  variant="contained"
                  onClick={(e) => handleAddGame(e)}
                  loading={uploading}
                  className="p-3 hover:shadow rounded-l-full rounded-r-full"
                  style={{ width: "150px" }}
                >
                  Confirm
                </LoadingButton>
              </Box>
            </DialogContent>
          </Dialog>
          <Dialog disableEscapeKeyDown open={open3} onClose={closeDialog3}>
            <DialogContent>
              <Box
                component="form"
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "10px",
                }}
              >
                <FormControl sx={{ m: 1, minWidth: 120, width: "100%" }}>
                <Select
                    native
                    value={selectGameIndex2}
                    onChange={(event)=>{setSelectGameIndex2(event.target.value)}}
                  >
                    {CurrGameDocList.map((ele, index) => (
                      <option value={index}>{ele.gameTitle}</option>
                    ))}
                  </Select>
                </FormControl>
                <LoadingButton
                  variant="contained"
                  onClick={(e) => handleDeleteGame(e)}
                  loading={uploading}
                  className="p-3 hover:shadow rounded-l-full rounded-r-full"
                  style={{ width: "150px" }}
                >
                  Confirm
                </LoadingButton>
              </Box>
            </DialogContent>
          </Dialog>

          <ChatBox
            gameOver={gameOver}
            stage={stage}
            chatType={chatType}
            showMessages={showMessages}
            isLoading={isLoading}
            input={input}
            handleInputChange={handleInputChange}
            handleSubmit={handleSubmit}
            onActionClick={onActionClick}
            currentGameObj={currentGameObj}
          />
          <GameDocBox
            currentGameObj={currentGameObj}
            gameDocs={gameDocs}
            accordionValue={accordionValue}
            setAccordionValue={setAccordionValue}
            currentStepIndex={currentStepIndex}
          />
          <CodeBox
            count={count}
            stage={stage}
            iframeContent={iframeContent}
            isCodeLoading={isCodeLoading}
            accordionValue={accordionValue}
            setAccordionValue={setAccordionValue}
            gameDocs={gameDocs}
            currentStepIndex={currentStepIndex}
            back={back}
            setBack={setBack}
            currentGameObj={currentGameObj}
          />
          <ClickLogger />
        </main>
      ) : (
        <Login login={(e: boolean) => setLogin(e)} />
      )}
    </>
  );
}

const ChatBox = ({
  stage,
  chatType,
  showMessages,
  isLoading,
  input,
  handleInputChange,
  handleSubmit,
  onActionClick,
  gameOver,
  currentGameObj,
}) => {
  const scrollRef2 = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    if (scrollRef2.current) {
      scrollRef2.current.scrollTop = scrollRef2.current.scrollHeight;
    }
  }, [showMessages]);

  useEffect(() => {
    adjustTextareaHeight();
  }, [input]);

  const adjustTextareaHeight = debounce(() => {
    const textarea = textareaRef.current;
    if (textarea != null) {
      textarea.style.height = "auto";
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  }, 300);

  function handleKeyDown(event) {
    if (event.key === "Enter") {
      if (event.shiftKey) {
        // Allow line break with Shift+Enter
        event.preventDefault();
        insertAtCursor("\n");
      } else {
        // Send message with Enter
        event.preventDefault();
        handleSubmit(event);
      }
    }
  }
  function insertAtCursor(text) {
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const value = textarea.value;
    textarea.value = value.substring(0, start) + text + value.substring(end);
    textarea.selectionStart = textarea.selectionEnd = start + text.length;
    adjustTextareaHeight();
  }

  return (
    <div className="bg-white overflow-hidden relative h-full bg-while rounded-xl flex flex-col ">
      <div className="bg-gray-100 p-3">
        <div className="text-lg">
          {
            [
              "Break down the main steps:",
              "Write requirements for step:",
              "Check requirements for step:",
            ][stage - 1]
          }
        </div>
        <div className="text-gray-800">
          {
            [
              `Welcome to ${currentGameObj.gameTitle} workshop! We are collaborating with our LLM programmer to create ${currentGameObj.gameTitle}, but we need to tell them what exactly to do. Let's write the requirements together!`,
              `Congratulations on completing the outline of ${currentGameObj.gameTitle}! Let's elaborate on the details step by step. You can see the reference game for each step in the right Solution panel.`,
              "Congratulations on completing the details of the current step, you can now Generate Game to check that it matches the Solution.",
            ][stage - 1]
          }
        </div>
      </div>
      <div
        className="flex-1 overflow-auto h-full pb-20 box-border"
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
                    <ChatContent
                      content={message.content}
                      otherExplanations={currentGameObj.baseExplanations}
                    />
                  )}
                  {index === showMessages.length - 1 &&
                  message.content?.action?.length ? (
                    <div className="my-2">
                      <div className="flex gap-4 flex-wrap">
                        {message.content?.action?.map((item) => (
                          <div
                            key={item}
                            className="cursor-pointer p-2  rounded-xl px-4 bg-blue-100 hover:shadow"
                            onClick={() =>
                              onActionClick(item, message.content.action)
                            }
                            data-button-id={`action-${item.toLowerCase().replace(/\s+/g, '-')}`}
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
          {!gameOver && (
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
                    ref={textareaRef}
                    value={input}
                    onChange={(e) => {
                      handleInputChange(e);
                      adjustTextareaHeight();
                    }}
                    placeholder={`Start discussing about ${currentGameObj.gameTitle} requirements by typing here.`}
                    className="flex w-full border border-input px-3 py-2 text ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-muted focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 pl-4 pr-10 min-h-18 rounded bg-muted"
                    style={{
                      minHeight: "4.5rem",
                      overflow: "hidden",
                      boxSizing: "border-box",
                      resize: "none",
                    }}
                    onKeyDown={handleKeyDown}
                  />
                  <button
                    className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:text-accent-foreground h-10 w-10 absolute right-2 top-1/2 transform -translate-y-1/2"
                    type="submit"
                    data-button-id="chat-submit"
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
          )}
        </div>
      </div>
    </div>
  );
};

const ChatContent = ({ content, otherExplanations }) => {
  const renderContentWithTooltips = (text) => {
    let words = [];
    if (typeof text == "string") {
      words = (text || "").split(/(\b|\s+|[.,!?;*`'‘"“;:])/);
    }
    return words.map((word, index) => {
      const explanation = otherExplanations.find((e) =>
        word.toLowerCase().includes(e?.name?.toLowerCase())
      );
      if (explanation) {
        return (
          <TooltipProvider key={index}>
            <Tooltip>
              <TooltipTrigger>
                <span
                  className="text-blue-500"
                  style={{ borderBottom: "1px dashed #3B82F6" }}
                >
                  {word}
                </span>
              </TooltipTrigger>
              <TooltipContent>{explanation.explanation}</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
      }
      return <span key={index}>{word}</span>;
    });
  };
  const chatContent =
    content?.chatContent || (typeof content === "string" ? content : "");
  return <span>{renderContentWithTooltips(chatContent)}</span>;
};

const ChatContent2 = ({ content, otherExplanations }) => {
  // return content.description
  const renderContentWithTooltips = (text) => {
    let words = [];
    if (typeof text == "string") {
      words = (text || "").split(/(\b|\s+|[.,!?;*`'‘"“;:])/);
    }
    return words.map((word, index) => {
      const explanation = otherExplanations.find((e) =>
        word.toLowerCase().includes(e?.name?.toLowerCase())
      );
      if (explanation) {
        return (
          <TooltipProvider key={index}>
            <Tooltip>
              <TooltipTrigger>
                <span
                  className="text-blue-500"
                  style={{ borderBottom: "1px dashed #3B82F6" }}
                >
                  {word}
                </span>
              </TooltipTrigger>
              <TooltipContent>{explanation.explanation}</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
      }
      return <span key={index}>{word}</span>;
    });
  };
  const chatContent =
    content?.description || (typeof content === "string" ? content : "");
  return <span>{renderContentWithTooltips(chatContent)}</span>;
};

const CodeBox = ({
  stage,
  iframeContent,
  isCodeLoading,
  accordionValue,
  setAccordionValue,
  gameDocs,
  currentStepIndex,
  back,
  setBack,
  count,
  currentGameObj,
}) => {
  const [codeFullScreen, setCodeFullScreen] = useState(false);
  const iframeRef = useRef(null);
  const iframeRef2 = useRef(null);
  const sandboxSrc = "/sandbox/index.html";
  const sandboxOrigin = "*"; // Use "*" for same-origin iframe postMessage

  useEffect(() => {
    if (!isCodeLoading && iframeContent) {
      console.log("code end");
      iframeRef.current.contentWindow.postMessage({ type: "RUN_CODE" }, sandboxOrigin);
    }
  }, [iframeContent, isCodeLoading]);

  useEffect(() => {
    if (isCodeLoading && iframeContent) {
      setTab("my-canvas");
      setBack(false);
    }
  }, [iframeContent, isCodeLoading]);

  useEffect(() => {
    if (back) {
      setTab("solution");
    }
  }, [back]);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (iframe) {
      iframe.contentWindow.postMessage(
        { type: "SET_CODE", code: iframeContent, sandboxId: "my-canvas" },
        sandboxOrigin
      );
    }
  }, [iframeContent]);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (iframeContent) {
      setBack(false);
      setTab("my-canvas");
      iframe.contentWindow.postMessage({ type: "RUN_CODE" }, sandboxOrigin);
    }
  }, [count]);

  useEffect(() => {
    const iframe = iframeRef2.current;
    console.log('Solution iframe update - game:', currentGameObj.gameTitle);
    
    if (iframe && currentGameObj.gameStepsCodes?.length) {
      console.log("Updating solution canvas with code for:", currentGameObj.gameTitle);
      // Use shorter delay and send code immediately
      const timer = setTimeout(() => {
        iframe.contentWindow.postMessage(
          {
            type: "SET_CODE",
            code: currentGameObj.gameStepsCodes[
              currentGameObj.gameStepsCodes.length - 1
            ]
          },
          sandboxOrigin
        );
        iframe.contentWindow.postMessage({ type: "RUN_CODE" }, sandboxOrigin);
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [currentGameObj.gameTitle, currentGameObj.gameStepsCodes]);

  const [tab, setTab] = useState("solution");

  const onTabChange = (value) => {
    setTab(value);
    if (value === "my-canvas") {
      setBack(false);
    } else {
      setBack(true);
    }
  };

  useEffect(() => {
    const iframe = document.getElementById(accordionValue) as HTMLIFrameElement;
    const index = gameDocs?.steps?.findIndex(
      (item) => item.name === accordionValue
    );
    if (iframe) {
      iframe.onload = () => {
        iframe.contentWindow?.postMessage(
          { type: "SET_CODE", code: currentGameObj.gameStepsCodes[index] },
          sandboxOrigin
        );
        iframe.contentWindow?.postMessage({ type: "RUN_CODE" }, sandboxOrigin);
      };
    }
  }, [accordionValue]);

  return (
    <div
      className={`overflow-hidden bg-white h-full rounded-xl ${
        codeFullScreen
          ? "fixed z-10 top-0 left-0 bottom-0 right-0 bg-white overflow box-border"
          : "relative"
      }`}
    >
      {/*!codeFullScreen ? (
        <span
          className="absolute bottom-10 right-6 cursor-pointer text-2xl icon-[material-symbols--fullscreen-rounded]"
          onClick={() => setCodeFullScreen(true)}
        ></span>
      ) : (
        <span
          className="absolute z-10 bottom-10 right-6 cursor-pointer text-2xl icon-[material-symbols--fullscreen-exit]"
          onClick={() => setCodeFullScreen(false)}
        ></span>
      )*/}
      <div className="h-full overflow-scroll">
        <Tabs value={tab} onValueChange={onTabChange}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="my-canvas" data-button-id="tab-my-canvas">My canvas</TabsTrigger>
            <TabsTrigger value="solution" data-button-id="tab-solution">Solution</TabsTrigger>
          </TabsList>
        </Tabs>
        <iframe
          key={`my-canvas-${currentGameObj.gameTitle}`}
          className={`${tab === "my-canvas" ? "block" : "hidden"}`}
          ref={iframeRef}
          src={`${sandboxSrc}?id=my-canvas`}
          width="100%"
          height="95%"
          style={{ overflow: "hidden", border: "none" }}
          scrolling="no"
        ></iframe>
        <iframe
          key={`solution-${currentGameObj.gameTitle}`}
          className={`${
            tab === "solution" && stage === 1 ? "block" : "hidden"
          }`}
          ref={iframeRef2}
          src={`${sandboxSrc}?id=solution`}
          width="100%"
          height="95%"
          style={{ overflow: "hidden", border: "none" }}
          scrolling="no"
        ></iframe>
        <div
          className={`px-4 ${
            tab === "solution" && stage !== 1 ? "block" : "hidden"
          }`}
        >
          <Accordion
            type="single"
            collapsible
            className="w-full"
            value={accordionValue}
            onValueChange={(value) => setAccordionValue(value)}
          >
            {gameDocs?.steps?.map((item, index) => (
              <AccordionItem value={item.name} key={index}>
                <AccordionTrigger
                  className="font-semibold text-lg flex items-center"
                  disabled={currentStepIndex < index}
                >
                  {item.name}
                </AccordionTrigger>
                <AccordionContent>
                  <iframe
                    id={item.name}
                    src={`/sandbox/index.html?id=solution-step-${index}`}
                    width="100%"
                    height="700px"
                    style={{ overflow: "hidden", border: "none" }}
                    scrolling="no"
                  ></iframe>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </div>
  );
};

const GameDocBox = ({
  gameDocs,
  accordionValue,
  setAccordionValue,
  currentStepIndex,
  currentGameObj,
}) => {
  const scrollRef = useRef(null);
  const [docFullScreen, setDocFullScreen] = useState(false);

  const onValueChange = (value) => {
    setAccordionValue(value);
  };

  return (
    <div
      className={`overflow-hidden rounded-xl h-full bg-white ${
        docFullScreen
          ? "fixed z-10 top-0 left-0 bottom-0 right-0 bg-white overflow box-border"
          : "relative"
      }`}
      ref={scrollRef}
    >
      <div className="overflow-auto h-full">
        {gameDocs?.name ? (
          !docFullScreen ? (
            <span
              className="absolute top-2 right-6 cursor-pointer text-2xl icon-[material-symbols--fullscreen-rounded]"
              onClick={() => setDocFullScreen(true)}
            ></span>
          ) : (
            <span
              className="absolute top-2 right-6 z-10 cursor-pointer text-2xl icon-[material-symbols--fullscreen-exit]"
              onClick={() => setDocFullScreen(false)}
            ></span>
          )
        ) : null}
        <div className="p-4 ">
          <h1 className="text-2xl font-bold text-center mb-4">
            {gameDocs?.name}
          </h1>
          {/*<p className="mb-4">{gameDocs?.rule}</p>*/}
          <Accordion
            type="single"
            collapsible
            className="w-full"
            value={accordionValue}
            onValueChange={onValueChange}
          >
            {gameDocs?.steps
              ?.filter((ele) => ele.show)
              .map((item, index) => (
                <AccordionItem value={item.name} key={index}>
                  <AccordionTrigger
                    className="font-semibold text-lg flex items-center"
                    disabled={currentStepIndex < index}
                  >
                    <div className="w-full flex text-left">{item.name}</div>
                  </AccordionTrigger>
                  <AccordionContent>
                    {/*item.description && (
                      <code className="block p-2 border-l-4 mt-2">
                        {item.description}
                      </code>
                    )*/}
                    <div className="mt-4">
                      {Array.isArray(item.doc)
                        ? item.doc
                            .filter((ele) => ele.show)
                            .map((item2, idx) => (
                              <div
                                key={idx}
                                className="p-3 bg-gray-50 border rounded-md mt-2 group"
                              >
                                <div className="flex gap-1 justify-between items-center ">
                                  <div className="text-md">
                                    <span id={`steps-${index}`}>
                                      <ChatContent2
                                        content={item2}
                                        otherExplanations={
                                          currentGameObj.baseExplanations
                                        }
                                      />
                                    </span>
                                  </div>
                                </div>
                              </div>
                            ))
                        : null}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
          </Accordion>
        </div>
      </div>
    </div>
  );
};