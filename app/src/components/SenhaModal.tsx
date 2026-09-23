"use client";

import { useEffect, useRef, useState } from "react";
import { confirmarSenha } from "@/lib/securePdf";

type Props = {
  open: boolean;
  titulo: string;
  descricao?: string;
  textoBotao?: string;
  onClose: () => void;
  /** Chamado somente depois que a senha foi validada no back-end. */
  onConfirmado: (senha: string) => Promise<void> | void;
};

/**
 * Modal que pede a senha de login antes de uma ação sensível (download/exportação).
 */
export function SenhaModal({ open, titulo, descricao, textoBotao = "Confirmar e baixar", onClose, onConfirmado }: Props) {
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    setSenha("");
    setErro("");
    setTimeout(() => inputRef.current?.focus(), 50);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (carregando) return;
    setCarregando(true);
    setErro("");
    const falha = await confirmarSenha(senha);
    if (falha) {
      setErro(falha);
      setCarregando(false);
      return;
    }
    try {
      await onConfirmado(senha);
      onClose();
    } catch {
      setErro("Não foi possível gerar o arquivo. Tente novamente.");
    } finally {
      setCarregando(false);
      setSenha("");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4" role="dialog" aria-modal="true" aria-labelledby="senha-modal-titulo">
      <form onSubmit={handleSubmit} className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl dark:bg-zinc-950">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 text-indigo-600 dark:bg-indigo-900/40 dark:text-indigo-300" aria-hidden>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><rect x="5" y="11" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="2"/><path d="M8 11V7a4 4 0 1 1 8 0v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
          </span>
          <h2 id="senha-modal-titulo" className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">{titulo}</h2>
        </div>
        <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">
          {descricao ?? "Por segurança, confirme sua senha de acesso. O arquivo gerado só abre com essa mesma senha."}
        </p>
        <label htmlFor="senha-modal-input" className="mt-4 block text-xs font-semibold text-zinc-700 dark:text-zinc-300">Senha de login</label>
        <input
          ref={inputRef}
          id="senha-modal-input"
          type="password"
          autoComplete="current-password"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          className="mt-1 w-full rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm outline-none focus:border-indigo-400 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
        />
        {erro ? <p role="alert" className="mt-2 text-xs font-medium text-red-600 dark:text-red-400">{erro}</p> : null}
        <div className="mt-5 flex justify-end gap-2">
          <button type="button" onClick={onClose} className="rounded-xl border border-zinc-200 px-4 py-2 text-sm font-semibold text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-900">
            Cancelar
          </button>
          <button type="submit" disabled={carregando} className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60">
            {carregando ? "Validando..." : textoBotao}
          </button>
        </div>
      </form>
    </div>
  );
}
