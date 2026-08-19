import React from "react";
import { BudgetFlavorLine } from "../types";

export interface BudgetContractDocumentProps {
  clientName: string;
  clientCpf: string;
  eventDate: string;
  eventLocation: string;
  hours: number;
  people: number;
  contractedLiters: number;
  consignedLiters: number;
  consignedBarrels: number;
  flavors: BudgetFlavorLine[];
  hasCustomMugs: boolean;
  finalTotal: number;
  firstInstallment: number;
  secondInstallment: number;
  signalDueDate: string;
  paymentMethodLabel: string;
  issuedAt: string;
}

function fmt(value: number): string {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function fmtDate(iso: string): string {
  if (!iso) return "___/___/______";
  const [y, m, d] = iso.slice(0, 10).split("-");
  return `${d}/${m}/${y}`;
}

function flavorNames(flavors: BudgetFlavorLine[]): string {
  if (!flavors.length) return "—";
  return flavors.map((f) => f.name).join(", ");
}

export default function BudgetContractDocument({
  clientName,
  clientCpf,
  eventDate,
  eventLocation,
  hours,
  people,
  contractedLiters,
  consignedLiters,
  consignedBarrels,
  flavors,
  hasCustomMugs,
  finalTotal,
  firstInstallment,
  secondInstallment,
  signalDueDate,
  paymentMethodLabel,
  issuedAt,
}: BudgetContractDocumentProps) {
  const base: React.CSSProperties = {
    fontFamily: "Arial, Helvetica, sans-serif",
    fontSize: 12,
    color: "#1a1a1a",
    lineHeight: 1.65,
  };

  const h1: React.CSSProperties = {
    fontSize: 16,
    fontWeight: 700,
    textAlign: "center",
    marginBottom: 4,
    textTransform: "uppercase",
    letterSpacing: 1,
  };

  const h2: React.CSSProperties = {
    fontSize: 13,
    fontWeight: 700,
    marginTop: 20,
    marginBottom: 6,
    borderBottom: "1px solid #999",
    paddingBottom: 4,
  };

  const p: React.CSSProperties = {
    marginBottom: 10,
    textAlign: "justify",
  };

  const bold = (text: string) => (
    <strong style={{ fontWeight: 700 }}>{text}</strong>
  );

  return (
    <div
      data-budget-contract
      style={{
        ...base,
        width: 794,
        backgroundColor: "#fff",
        padding: "48px 60px",
        boxSizing: "border-box",
      }}
    >
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: 24 }}>
        <div style={h1}>Contrato de Prestação de Serviços</div>
        <div style={{ fontSize: 11, color: "#555" }}>Na Estrada Chopp</div>
        <div style={{ fontSize: 11, color: "#555" }}>CNPJ: 55.817.511/0001-92</div>
      </div>

      {/* Partes */}
      <div style={h2}>Identificação das Partes</div>
      <p style={p}>
        <strong>CONTRATADA:</strong> NA ESTRADA CHOPP, pessoa jurídica de
        direito privado, CNPJ nº 55.817.511/0001-92.
      </p>
      <p style={p}>
        <strong>CONTRATANTE:</strong> {bold(clientName)}, CPF nº{" "}
        {bold(clientCpf)}.
      </p>

      {/* Objeto */}
      <div style={h2}>Cláusula 1ª — Objeto do Contrato</div>
      <p style={p}>
        A CONTRATADA se compromete a prestar serviços de chopp artesanal
        para o evento do(a) CONTRATANTE, a realizar-se em{" "}
        {bold(fmtDate(eventDate))}, no local {bold(eventLocation)}, com
        duração de {bold(`${hours} horas`)}, para aproximadamente{" "}
        {bold(`${people} pessoas`)}.
      </p>
      <p style={p}>
        Serão fornecidos {bold(`${contractedLiters} litros`)} dos seguintes
        sabores: {bold(flavorNames(flavors))}.
        {hasCustomMugs
          ? ` Inclui ${people} canecas de acrílico personalizadas, entregues higienizadas e embaladas.`
          : ""}
      </p>

      {/* Chopp consignado */}
      <div style={h2}>Cláusula 2ª — Chopp Consignado</div>
      <p style={p}>
        A CONTRATADA disponibilizará {bold(`${consignedLiters} litros`)} de
        chopp em regime de consignação ({bold(`${consignedBarrels} barril(is)`)} de
        50 L), ao valor fixo de {bold("R$ 700,00 por barril")}. O chopp
        consignado não consumido será devolvido à CONTRATADA ao final do
        evento.
      </p>

      {/* Pagamento */}
      <div style={h2}>Cláusula 3ª — Pagamento</div>
      <p style={p}>
        O valor total dos serviços é de {bold(fmt(finalTotal))}, a ser pago
        da seguinte forma:
      </p>
      <ul style={{ marginBottom: 10, paddingLeft: 24 }}>
        <li>
          1ª parcela: {bold(fmt(firstInstallment))} — sinal até{" "}
          {bold(fmtDate(signalDueDate))} ({bold(paymentMethodLabel)});
        </li>
        <li>
          2ª parcela: {bold(fmt(secondInstallment))} — até 5 dias antes do
          evento.
        </li>
      </ul>
      <p style={p}>
        O não pagamento do sinal na data acordada poderá acarretar no
        cancelamento da reserva.
      </p>

      {/* Obrigações CONTRATADA */}
      <div style={h2}>Cláusula 4ª — Obrigações da CONTRATADA</div>
      <p style={p}>
        A CONTRATADA se obriga a fornecer todo o equipamento necessário para
        a prestação do serviço (chopeiras, cilindros, mangueiras, suportes e
        acessórios), disponibilizar equipe capacitada para operação e
        atendimento, entregar os produtos na quantidade e qualidade
        contratadas, e cumprir o horário acordado.
      </p>

      {/* Obrigações CONTRATANTE */}
      <div style={h2}>Cláusula 5ª — Obrigações do CONTRATANTE</div>
      <p style={p}>
        O CONTRATANTE se obriga a disponibilizar espaço adequado para
        instalação dos equipamentos, garantir acesso ao local em tempo hábil,
        realizar o pagamento nas datas acordadas e informar eventuais
        alterações com antecedência mínima de 7 dias.
      </p>

      {/* Cancelamento */}
      <div style={h2}>Cláusula 6ª — Cancelamento</div>
      <p style={p}>
        Em caso de cancelamento por parte do CONTRATANTE com menos de 7 dias
        de antecedência, o sinal pago não será reembolsado. Cancelamentos
        realizados com mais de 7 dias de antecedência poderão ser acordados
        entre as partes.
      </p>

      {/* Foro */}
      <div style={h2}>Cláusula 7ª — Foro</div>
      <p style={p}>
        As partes elegem o foro da comarca do local do evento para dirimir
        quaisquer dúvidas decorrentes deste contrato.
      </p>

      {/* Assinaturas */}
      <div style={{ marginTop: 40 }}>
        <p style={{ textAlign: "center", marginBottom: 32, fontSize: 11, color: "#555" }}>
          {eventLocation}, {fmtDate(issuedAt)}
        </p>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: 40,
            gap: 40,
          }}
        >
          <div style={{ flex: 1, textAlign: "center" }}>
            <div
              style={{
                borderTop: "1px solid #333",
                paddingTop: 6,
                fontSize: 11,
              }}
            >
              <div>NA ESTRADA CHOPP</div>
              <div style={{ color: "#555" }}>CONTRATADA</div>
            </div>
          </div>
          <div style={{ flex: 1, textAlign: "center" }}>
            <div
              style={{
                borderTop: "1px solid #333",
                paddingTop: 6,
                fontSize: 11,
              }}
            >
              <div>{clientName}</div>
              <div style={{ color: "#555" }}>CONTRATANTE — CPF: {clientCpf}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
