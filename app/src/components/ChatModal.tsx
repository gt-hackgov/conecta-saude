"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
  open: boolean;
  onClose: () => void;
  userName: string;
};

type Message = {
  sender: "user" | "assistant";
  text: string;
};

export function ChatModal({ open, onClose, userName }: Props) {
  const modalRef = useRef<HTMLDivElement | null>(null);
  const [messages, setMessages] = useState<Message[]>([
    { sender: "assistant", text: "Olá! Como posso ajudar você hoje?" },
  ]);
  const [input, setInput] = useState("");

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  const handleSend = () => {
    if (!input.trim()) return;
    const userMessage: Message = { sender: "user", text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    // Simulate response
    setTimeout(() => {
      let response: Message = {
        sender: "assistant",
        text: "Obrigado pela mensagem! Em breve teremos mais funcionalidades.",
      };
      if (input.toLowerCase().includes("como combater o mosquito da dengue")) {
        response = {
          sender: "assistant",
          text: "Medidas de Combate ao Mosquito:\n- Elimine água parada: Vasos de plantas, garrafas, pneus e recipientes plásticos devem ser limpos ou vedados.\n- Limpeza de calhas e lajes: Evite acúmulo de folhas e sujeira que represam água.\n- Caixas-d'água e tonéis: Mantenha vedados hermeticamente.\n- Piscinas: Mantenha tratadas com cloro.\n- Lixo: Feche sacos de lixo corretamente e descarte pneus em locais adequados.",
        };
      }
      setMessages((prev) => [...prev, response]);
    }, 1000);
  };

  return (
    <div className="fixed bottom-24 right-6 z-50">
      <div
        ref={modalRef}
        className="w-96 h-[28rem] rounded-2xl bg-white p-6 shadow-xl dark:bg-zinc-900 flex flex-col"
        role="dialog"
        aria-modal="true"
      >
        <header className="flex items-start justify-between">
          <div>
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
              ChatBot - Conecta Saúde
            </h2>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              Converse com nosso assistente virtual e tire suas dúvidas sobre sua saúde, prevenções, preparos de exames etc.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
            aria-label="Fechar modal"
          >
            ✕
          </button>
        </header>

        <div className="flex-1 overflow-y-auto space-y-4 mt-4">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex flex-col gap-2 ${
                msg.sender === "user" ? "items-end" : "items-start"
              }`}
            >
              {msg.sender === "assistant" ? (
                <span className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                  Assistente:
                </span>
              ) : (
                <span className="text-xs font-semibold uppercase tracking-wide text-indigo-600">
                  {userName}:
                </span>
              )}
              <div
                className={`rounded-lg p-3 text-sm whitespace-pre-wrap ${
                  msg.sender === "user"
                    ? "bg-indigo-100 text-indigo-900 self-end ml-auto max-w-xs"
                    : "bg-zinc-100 text-zinc-900 dark:bg-zinc-700 dark:text-zinc-100"
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            className="flex-1 rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm shadow-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100 dark:focus:border-indigo-400"
            placeholder="Digite sua mensagem..."
          />
          <button
            onClick={handleSend}
            className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700"
          >
            Enviar
          </button>
        </div>
      </div>
    </div>
  );
}