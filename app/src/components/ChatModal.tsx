"use client";

import { useEffect, useState } from "react";
import { getSession } from "@/lib/authSession";

type Props = {
  open: boolean;
  onClose: () => void;
  userName: string;
};

type Message = {
  role: "user" | "bot";
  text: string;
};

export function ChatModal({ open, onClose }: Props) {
  const [messages, setMessages] = useState<Message[]>([
    { role: "bot", text: "Olá! Como posso ajudar?" },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

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

  async function sendMessage() {
    if (!input.trim()) return;

    const userMsg: Message = { role: "user", text: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const session = getSession();
      if (!session?.token) {
        throw new Error("Faça login para usar o chatbot.");
      }

      const response = await fetch("/api/chatbot/message", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.token}`,
        },
        body: JSON.stringify({ message: userMsg.text }),
      });
      const data = (await response.json()) as { answer?: string; message?: string };
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Sessão expirada ou inválida. Faça login novamente.");
        }
        throw new Error(data.message ?? "Não foi possível enviar a mensagem.");
      }

      setMessages((prev) => [
        ...prev,
        { role: "bot", text: data.answer ?? "Não foi possível obter uma resposta." },
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          role: "bot",
          text: error instanceof Error ? error.message : "Erro ao conectar com o servidor.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed bottom-24 right-6 z-50">
      <div
        className="flex h-96 w-80 flex-col rounded-lg border bg-white shadow-lg dark:bg-zinc-900"
        role="dialog"
        aria-modal="true"
      >
        <header className="flex items-center justify-between border-b p-3">
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
            ChatBot - Conecta Saúde
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1 text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
            aria-label="Fechar modal"
          >
            ✕
          </button>
        </header>

        <div className="flex-1 space-y-2 overflow-y-auto p-3">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`max-w-[80%] rounded-lg p-2 text-sm whitespace-pre-wrap ${
                message.role === "user"
                  ? "ml-auto bg-blue-500 text-white"
                  : "bg-gray-100 text-gray-900 dark:bg-zinc-800 dark:text-zinc-100"
              }`}
            >
              {message.text}
            </div>
          ))}
          {loading && <div className="text-sm text-gray-400">Digitando...</div>}
        </div>

        <div className="flex border-t p-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            className="flex-1 rounded border px-2 py-1 text-sm dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
            placeholder="Digite sua mensagem..."
          />
          <button
            onClick={sendMessage}
            className="ml-2 rounded bg-blue-600 px-3 py-1 text-sm text-white transition hover:bg-blue-700"
          >
            Enviar
          </button>
        </div>
      </div>
    </div>
  );
}