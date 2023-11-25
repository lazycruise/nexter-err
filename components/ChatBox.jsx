import React, { useEffect, useState } from "react";
import { useChannel } from "ably/react";

export default function ChatBox() {
  let inputBox = null;
  let messageEnd = null;

  const [messageText, setMessageText] = useState("");
  const [recievedMessages, setMessages] = useState([]);
  const messageTextIsEmpty = messageText.trim().length === 0;

  const { channel, ably } = useChannel("chat-demo", (message) => {
    const history = recievedMessages.slice(-199);
    setMessages([...history, message]);
  });

  function isAITrigger(message) {
    return message.startsWith("Hey Nexter");
  }

  const sendAIMessage = async (messageText) => {
    if (!isAITrigger(messageText)) {
      return;
    }
    try {
      const response = await fetch("/api/klu", {
        method: "POST",
        body: JSON.stringify({ prompt: messageText }),
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      const { result } = await response.json();
      const aiResponse = "Nexter: " + result.msg;
      console.log(aiResponse);

      channel.publish({
        name: "chat-message",
        data: aiResponse,
        id: `nexter-${generateRandomString(8)}`,
      });

      return aiResponse;
    } catch (error) {
      console.error("Error fetching Klu response", error);
    }
  };

  const sendChatMessage = async (messageText) => {
    channel.publish({ name: "chat-message", data: messageText });
    inputBox.focus();

    setMessageText("");

    await sendAIMessage(messageText);
  };

  const handleFormSubmission = (event) => {
    event.preventDefault();
    sendChatMessage(messageText);
  };

  const handleKeyPress = (event) => {
    if (event.charCode !== 13 || messageTextIsEmpty) {
      return;
    }
    sendChatMessage(messageText);
    event.preventDefault();
  };

  function generateRandomString(length) {
    const characters =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    const randomStringArray = Array.from({ length }, () =>
      characters.charAt(Math.floor(Math.random() * characters.length))
    );

    const randomString = randomStringArray.join("");

    return randomString;
  }

  const messages = recievedMessages.map((message, index) => {
    let author = message.connectionId === ably.connection.id ? "me" : "other";

    if (message.id.startsWith("nexter")) {
      author = "ai";
    }

    if (author === "me") {
      return (
        <div
          key={index}
          className="flex justify-end mb-4 items-center"
          data-author={author}
        >
          <div className="max-w-2/3 bg-green-500 text-white p-3 rounded-lg relative">
            {message.data}
          </div>
        </div>
      );
    } else if (author === "ai") {
      return (
        <div
          key={index}
          className="flex justify-start mb-4 items-center"
          data-author={author}
        >
          <div className="max-w-2/3 bg-gradient-to-r from-purple-500 to-red-500 text-white p-3 rounded-lg relative">
            {message.data}
          </div>
        </div>
      );
    } else {
      return (
        <div
          key={index}
          className="flex justify-start mb-4 items-center"
          data-author={author}
        >
          <div className="max-w-2/3 bg-blue-500 text-white p-3 rounded-lg relative">
            {message.data}
          </div>
        </div>
      );
    }
  });

  useEffect(() => {
    messageEnd.scrollIntoView({
      behaviour: "smooth",
    });
  });

  return (
    <>
      <div className="flex-1 overflow-y-scroll p-4">
        {messages}
        <div
          ref={(element) => {
            messageEnd = element;
          }}
        ></div>
      </div>
      <form
        onSubmit={handleFormSubmission}
        class="flex items-center p-4 text-black"
      >
        <textarea
          ref={(element) => {
            inputBox = element;
          }}
          value={messageText}
          placeholder="Type your message..."
          onChange={(e) => setMessageText(e.target.value)}
          onKeyPress={handleKeyPress}
          className="flex-1 px-4 py-2 mr-2 border rounded-l-md"
        ></textarea>
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded-r-md"
          disabled={messageTextIsEmpty}
        >
          Send
        </button>
      </form>
    </>
  );
}
