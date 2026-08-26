import { useState } from "react";
import { Send, Bot } from "lucide-react";
import type { CaseMessage, CustomerCase } from "../types";
import { aiService } from "../services/aiService";

export function CaseConversation({
  caseData,
  initialMessages,
}: {
  caseData: CustomerCase;
  initialMessages: CaseMessage[];
}) {
  const [messages, setMessages] = useState<CaseMessage[]>(initialMessages);
  const [memory, setMemory] = useState(caseData.memory);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;
    const customerMsg: CaseMessage = {
      id: `msg-${Date.now()}`,
      caseId: caseData.id,
      sender: "CUSTOMER",
      text: input,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, customerMsg]);
    setInput("");
    setSending(true);

    const { response, updatedMemory } = await aiService.generateCustomerResponse(input, memory, caseData.id);
    setMemory(updatedMemory);
    setMessages((prev) => [
      ...prev,
      {
        id: `msg-${Date.now() + 1}`,
        caseId: caseData.id,
        sender: "AGENT",
        text: response,
        createdAt: new Date().toISOString(),
      },
    ]);
    setSending(false);
  };

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <div className="flex h-[420px] flex-col rounded-lg border border-ink-100">
          <div className="flex-1 space-y-4 overflow-y-auto p-4">
            {messages.map((m) => (
              <div key={m.id} className={`flex ${m.sender === "CUSTOMER" ? "justify-end" : "justify-start"}`}>
                {m.sender === "AGENT" && (
                  <div className="mr-2 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent-100 text-accent-700">
                    <Bot size={14} />
                  </div>
                )}
                <div
                  className={`max-w-[75%] whitespace-pre-line rounded-2xl px-4 py-2.5 text-sm ${
                    m.sender === "CUSTOMER"
                      ? "rounded-br-sm bg-accent-600 text-white"
                      : "rounded-bl-sm bg-ink-100 text-ink-800"
                  }`}
                >
                  {m.text}
                  <p
                    className={`mt-1 text-[10px] ${
                      m.sender === "CUSTOMER" ? "text-accent-100" : "text-ink-400"
                    }`}
                  >
                    {new Date(m.createdAt).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
                  </p>
                </div>
              </div>
            ))}
            {sending && (
              <div className="flex justify-start">
                <div className="ml-9 rounded-2xl rounded-bl-sm bg-ink-100 px-4 py-2.5 text-sm text-ink-400">
                  Thinking...
                </div>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2 border-t border-ink-100 p-3">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Type your message..."
              className="focus-ring flex-1 rounded-lg border border-ink-200 px-3 py-2 text-sm placeholder:text-ink-400"
            />
            <button
              onClick={handleSend}
              className="focus-ring flex items-center gap-1.5 rounded-lg bg-accent-600 px-4 py-2 text-sm font-semibold text-white hover:bg-accent-700"
            >
              <Send size={14} />
              Send
            </button>
          </div>
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-bold text-ink-900">Case Memory</h3>
        <div className="space-y-4 rounded-lg border border-ink-100 p-4">
          <div>
            <p className="mb-1.5 text-xs font-bold uppercase tracking-wide text-ink-400">Known Facts</p>
            <ul className="space-y-1">
              {memory.knownFacts.map((f, i) => (
                <li key={i} className="text-xs text-ink-600">
                  • {f}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="mb-1.5 text-xs font-bold uppercase tracking-wide text-ink-400">Open Questions</p>
            <ul className="space-y-1">
              {memory.openQuestions.length > 0 ? (
                memory.openQuestions.map((q, i) => (
                  <li key={i} className="text-xs text-ink-600">
                    • {q}
                  </li>
                ))
              ) : (
                <li className="text-xs text-ink-400">None remaining</li>
              )}
            </ul>
          </div>
          <div>
            <p className="mb-1.5 text-xs font-bold uppercase tracking-wide text-ink-400">Current Hypothesis</p>
            <p className="text-xs leading-relaxed text-ink-600">{memory.currentHypothesis}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
