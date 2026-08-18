import React from "react";
import { formatCurrency, formatLiters } from "../format";
import { BudgetExtraLine, BudgetFlavorLine } from "../types";
import {
  PROPOSAL_BRAND,
  PROPOSAL_SERVICE_TITLES,
  buildGiftLine,
} from "./proposal.brand";

export interface BudgetProposalDocumentProps {
  clientName: string;
  issuedAt: string;
  serviceType: "TOTEM" | "KOMBI";
  people: number;
  hours: number;
  contractedLiters: number;
  flavors: BudgetFlavorLine[];
  extras: BudgetExtraLine[];
  total: number;
  includeGift?: boolean;
}

const CUSTOM_MUGS_EXTRA_ID = "custom_mugs";

const A4_WIDTH_PX = 794;

function flavorNames(flavors: BudgetFlavorLine[]): string {
  if (!flavors.length) return "—";
  return flavors.map((f) => f.name).join(", ");
}

function flavorLitersLine(flavors: BudgetFlavorLine[]): string {
  if (!flavors.length) return "—";
  return flavors
    .map(
      (f) =>
        `${formatLiters(f.liters).replace(" L", "")} litros ${f.name}`,
    )
    .join(", ");
}

export default function BudgetProposalDocument({
  clientName,
  issuedAt,
  serviceType,
  people,
  hours,
  contractedLiters,
  flavors,
  extras,
  total,
  includeGift = true,
}: BudgetProposalDocumentProps) {
  const serviceTitle = PROPOSAL_SERVICE_TITLES[serviceType];
  const hasCustomMugs = extras.some((e) => e.extraId === CUSTOM_MUGS_EXTRA_ID);
  const showGift = includeGift && hasCustomMugs;
  const clientExtras = extras.filter(
    (e) => e.amount > 0 && e.extraId !== CUSTOM_MUGS_EXTRA_ID,
  );

  return (
    <div
      data-budget-proposal
      style={{
        width: A4_WIDTH_PX,
        minHeight: 1123,
        boxSizing: "border-box",
        padding: "40px 48px 36px",
        backgroundColor: "#f7f3eb",
        backgroundImage:
          "radial-gradient(circle at 20% 30%, rgba(180,160,120,0.08) 0 1px, transparent 1px), radial-gradient(circle at 80% 70%, rgba(180,160,120,0.06) 0 1px, transparent 1px)",
        backgroundSize: "48px 48px, 64px 64px",
        color: "#1a1a1a",
        fontFamily:
          '"Segoe UI", "Helvetica Neue", Helvetica, Arial, sans-serif',
        position: "relative",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
      }}
    >
      <div>
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: 28,
          }}
        >
          <img
            src={PROPOSAL_BRAND.logoSrc}
            alt={PROPOSAL_BRAND.name}
            width={96}
            height={96}
            style={{ objectFit: "contain", display: "block" }}
            crossOrigin="anonymous"
          />
          <div style={{ textAlign: "right", fontSize: 11, lineHeight: 1.45 }}>
            <div style={{ color: "#444" }}>{PROPOSAL_BRAND.validityLabel}</div>
            <div style={{ fontWeight: 600, marginTop: 4 }}>{issuedAt}</div>
          </div>
        </div>

        {/* Title + contacts */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: 24,
            marginBottom: 20,
          }}
        >
          <div>
            <h1
              style={{
                margin: 0,
                fontSize: 36,
                fontWeight: 800,
                letterSpacing: "0.04em",
                lineHeight: 1.1,
              }}
            >
              ORÇAMENTO
            </h1>
            <div
              style={{
                marginTop: 14,
                fontSize: 15,
                fontWeight: 700,
              }}
            >
              {clientName || "—"}
            </div>
          </div>
          <div
            style={{
              fontSize: 12,
              color: "#333",
              display: "flex",
              flexDirection: "column",
              gap: 6,
            }}
          >
            <div style={{ textAlign: "right" }}>{PROPOSAL_BRAND.instagram}</div>
            <div style={{ textAlign: "right" }}>{PROPOSAL_BRAND.email}</div>
            <div style={{ textAlign: "right" }}>{PROPOSAL_BRAND.cnpj}</div>
          </div>
        </div>

        {/* Table header */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1.2fr 2.2fr 0.9fr",
            gap: 12,
            paddingBottom: 8,
            borderBottom: "1.5px solid #222",
            fontSize: 13,
            fontWeight: 700,
            marginTop: 50
          }}
        >
          <div>Serviços</div>
          <div>Descrição</div>
          <div style={{ textAlign: "right" }}>Valor</div>
        </div>

        {/* Main service row */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1.2fr 2.2fr 0.9fr",
            gap: 12,
            paddingTop: 16,
            paddingBottom: 16,
            borderBottom: "1px solid #ccc",
            fontSize: 12,
            lineHeight: 1.55,
            alignItems: "start",
          }}
        >
          <div style={{ fontWeight: 700, fontSize: 13 }}>{serviceTitle}</div>
          <div>
            <ul style={{ margin: 0, paddingLeft: 18 }}>
              <li>
                Tipos de Chopp Escolhidos:{" "}
                <strong>{flavorNames(flavors)}</strong>
              </li>
              <li>
                Quantidade de Chopp:{" "}
                <strong>
                  {formatLiters(contractedLiters)}
                  {flavors.length === 1 ? ` ${flavors[0].name}` : ""}
                </strong>
                {flavors.length > 1 ? (
                  <>
                    {" "}
                    (<strong>{flavorLitersLine(flavors)}</strong>)
                  </>
                ) : null}
              </li>
              <li>
                Serviço completo para <strong>{people} pessoas</strong> que
                consomem Chopp
              </li>
              <li>Atendimento no local com equipe especializada</li>
              <li>
                <strong>{hours} horas</strong> de serviço
              </li>
            </ul>
            {showGift ? (
              <div style={{ marginTop: 10 }}>
                <div style={{ fontWeight: 700, marginBottom: 4 }}>
                  Brinde incluso:
                </div>
                <ul style={{ margin: 0, paddingLeft: 18 }}>
                  <li>
                    <strong>{buildGiftLine(people)}</strong>
                  </li>
                </ul>
              </div>
            ) : null}
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontWeight: 700, fontSize: 14 }}>
              {formatCurrency(total)}
            </div>
            <div style={{ fontSize: 11, color: "#555", marginTop: 2 }}>
              Valor Único
            </div>
          </div>
        </div>

        {/* Extra rows */}
        {clientExtras.map((extra) => (
          <div
            key={extra.extraId}
            style={{
              display: "grid",
              gridTemplateColumns: "1.2fr 2.2fr 0.9fr",
              gap: 12,
              paddingTop: 14,
              paddingBottom: 14,
              borderBottom: "1px solid #ccc",
              fontSize: 12,
              lineHeight: 1.55,
              alignItems: "start",
            }}
          >
            <div style={{ fontWeight: 700, fontSize: 13 }}>{extra.label}</div>
            <div>
              <ul style={{ margin: 0, paddingLeft: 18 }}>
                <li>Item adicional incluso nesta proposta</li>
              </ul>
            </div>
            <div style={{ textAlign: "right", fontWeight: 700, fontSize: 14 }}>
              {formatCurrency(extra.amount)}
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: 32,
          marginTop: 36,
          alignItems: "flex-start",
        }}
      >
        <div style={{ flex: 1, maxWidth: 420 }}>
          <div
            style={{
              fontWeight: 700,
              fontSize: 13,
              marginBottom: 10,
            }}
          >
            Formas de Pagamento
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {PROPOSAL_BRAND.paymentMethods.map((pm) => (
              <div key={pm.title} style={{ fontSize: 11, lineHeight: 1.4 }}>
                <div>
                  <strong>{pm.title}</strong>
                </div>
                <div style={{ color: "#444" }}>{pm.detail}</div>
              </div>
            ))}
          </div>
        </div>
        <div style={{ textAlign: "right", flexShrink: 0 }}>
          <div style={{ fontSize: 28, fontWeight: 800, lineHeight: 1.1 }}>
            {formatCurrency(total)}
          </div>
          <div style={{ fontSize: 12, color: "#555", marginTop: 4 }}>
            Valor Total
          </div>
        </div>
      </div>
    </div>
  );
}
