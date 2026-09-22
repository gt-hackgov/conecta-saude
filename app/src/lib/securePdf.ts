"use client";

/**
 * Geração de PDFs protegidos por senha, 100% no navegador (biblioteca gratuita jsPDF).
 *
 * A senha do PDF é a MESMA senha de login do usuário. Antes de gerar o arquivo,
 * a senha é reconfirmada no back-end (POST /api/auth/login) — assim o sistema
 * nunca guarda a senha e só gera o PDF para quem realmente sabe a senha.
 */

import { getSession } from "@/lib/authSession";

export type SecaoPdf = {
  titulo: string;
  linhas: string[];
};

export type ConteudoPdf = {
  titulo: string;
  subtitulo?: string;
  secoes: SecaoPdf[];
};

/** Reconfirma a senha do usuário logado. Retorna null se ok, ou a mensagem de erro. */
export async function confirmarSenha(senha: string): Promise<string | null> {
  const session = getSession();
  if (!session?.token) return "Sessão expirada. Faça login novamente.";
  if (!session.cpf) return "Para sua segurança, saia e entre novamente no sistema antes de baixar.";
  if (!senha) return "Digite sua senha.";

  try {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cpf: session.cpf, senha }),
    });

    if (!response.ok) return "Senha incorreta.";

    const data = (await response.json()) as { usuarioId?: unknown };
    if (String(data.usuarioId) !== session.usuarioId) return "Senha incorreta.";
    return null;
  } catch {
    return "Não foi possível validar a senha. Verifique sua conexão.";
  }
}

/** Gera e baixa um PDF que só abre com a senha informada. */
export async function baixarPdfProtegido(conteudo: ConteudoPdf, senha: string, nomeArquivo: string) {
  const { jsPDF } = await import("jspdf");

  const doc = new jsPDF({
    unit: "mm",
    format: "a4",
    encryption: {
      userPassword: senha,
      ownerPassword: senha,
      userPermissions: ["print"],
    },
  });

  const margem = 18;
  const larguraUtil = doc.internal.pageSize.getWidth() - margem * 2;
  const alturaPagina = doc.internal.pageSize.getHeight();
  let y = 22;

  const garantirEspaco = (altura: number) => {
    if (y + altura > alturaPagina - 18) {
      doc.addPage();
      y = 22;
    }
  };

  // Cabeçalho
  doc.setFillColor(79, 70, 229);
  doc.rect(0, 0, doc.internal.pageSize.getWidth(), 8, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(24, 24, 27);
  doc.text("Conecta Saúde", margem, y);
  y += 8;
  doc.setFontSize(13);
  doc.text(conteudo.titulo, margem, y);
  y += 6;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(113, 113, 122);
  const session = getSession();
  const gerado = `Gerado em ${new Date().toLocaleString("pt-BR")}${session?.nome ? ` por ${session.nome}` : ""}`;
  doc.text(conteudo.subtitulo ? `${conteudo.subtitulo} · ${gerado}` : gerado, margem, y);
  y += 10;

  for (const secao of conteudo.secoes) {
    garantirEspaco(14);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(79, 70, 229);
    doc.text(secao.titulo, margem, y);
    y += 2;
    doc.setDrawColor(228, 228, 231);
    doc.line(margem, y, margem + larguraUtil, y);
    y += 6;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(39, 39, 42);
    for (const linha of secao.linhas) {
      const quebradas = doc.splitTextToSize(linha, larguraUtil) as string[];
      garantirEspaco(quebradas.length * 5);
      doc.text(quebradas, margem, y);
      y += quebradas.length * 5 + 1;
    }
    y += 5;
  }

  // Rodapé em todas as páginas
  const total = doc.getNumberOfPages();
  for (let i = 1; i <= total; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(161, 161, 170);
    doc.text(
      `Documento confidencial (LGPD) — protegido pela senha de acesso do usuário · Página ${i} de ${total}`,
      margem,
      alturaPagina - 10
    );
  }

  doc.save(nomeArquivo);
}
