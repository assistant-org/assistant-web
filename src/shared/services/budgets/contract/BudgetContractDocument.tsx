import React from "react";
import { BudgetFlavorLine } from "../types";
import { ContractVariant } from "../../../../modules/protected/budgets/components/ContractModal";
import { CONTRACT_BRAND } from "./contract.brand";
import {
  CONTRACT_CONTENT_PADDING,
  CONTRACT_PAGE_WIDTH_PX,
} from "./contract.layout";
import {
  formatBarrelCount,
  formatChoppLine,
  formatCurrencyWithExtenso,
  formatDateLongBR,
  formatDateLongBRSignature,
  formatNumberExtenso,
  extractSignatureCity,
} from "./contract.format";

export interface BudgetContractDocumentProps {
  clientName: string;
  clientCpf: string;
  clientAddressLine: string;
  clientCityState: string;
  eventDate: string;
  eventLocation: string;
  hours: number;
  people: number;
  contractedLiters: number;
  consignedLiters: number;
  consignedBarrels: number;
  flavors: BudgetFlavorLine[];
  hasCustomMugs: boolean;
  extraServices: string[];
  finalTotal: number;
  firstInstallment: number;
  secondInstallment: number;
  signalDueDate: string;
  issuedAt: string;
  contractVariant: ContractVariant;
}

const base: React.CSSProperties = {
  fontFamily: "Arial, Helvetica, sans-serif",
  fontSize: 12,
  color: "#1a1a1a",
  lineHeight: 1.65,
  textAlign: "justify",
};

const clauseTitle: React.CSSProperties = {
  fontWeight: 700,
  marginTop: 16,
  marginBottom: 8,
  textTransform: "uppercase",
};

const p: React.CSSProperties = {
  marginBottom: 10,
  textAlign: "justify",
};

function clauseOneObjectText(
  hasCustomMugs: boolean,
  variant: ContractVariant,
  extraServices: string[],
): string {
  const cupsPart = hasCustomMugs
    ? "fornecimento de canecas personalizadas"
    : "fornecimento de copos descartáveis";

  if (variant === "auto_servico") {
    let text =
      "O presente contrato tem por objeto a prestação de serviços de " +
      "fornecimento de chopp, disponibilização de equipamentos para extração e " +
      `distribuição da bebida (chopeira), ${cupsPart}, bem como a entrega, ` +
      "montagem básica e retirada dos equipamentos necessários à refrigeração " +
      "e distribuição do chopp, a serem operados pela CONTRATANTE durante o " +
      "evento promovido por esta, conforme as condições estabelecidas neste contrato. " +
      "Não estão inclusos totem móvel de chopp nem equipe de atendimento in loco.";
    if (extraServices.length > 0) {
      text += ` Incluem-se ainda os serviços adicionais: ${extraServices.join("; ")}.`;
    }
    return text;
  }

  return (
    "O presente contrato tem por objeto a prestação de serviços de " +
    "fornecimento de chopp, disponibilização de totem de chopp, equipe de " +
    `atendimento para o serviço durante o evento, ${cupsPart}, bem como a ` +
    "instalação, operação e retirada dos equipamentos necessários à " +
    "refrigeração e distribuição da bebida, a serem utilizados no evento " +
    "promovido pela CONTRATANTE, conforme as condições estabelecidas neste contrato."
  );
}

function buildServiceCommitment(props: BudgetContractDocumentProps): string {
  const parts: string[] = [
    `A CONTRATADA se compromete a fornecer ${formatChoppLine(props.contractedLiters, props.flavors)}`,
  ];
  if (props.hasCustomMugs) {
    parts.push(`${props.people} canecas de acrílico personalizadas`);
  }
  if (props.contractVariant === "auto_servico") {
    parts.push(
      "equipamentos para extração e distribuição do chopp (chopeira), entregues montados e prontos para operação pela CONTRATANTE",
    );
  } else {
    parts.push(
      "uma equipe de atendimento especializada, responsável pela manipulação e distribuição da bebida durante todo o evento",
    );
  }
  return parts.join(", ") + ".";
}

function contractTitle(variant: ContractVariant): string {
  if (variant === "auto_servico") {
    return (
      "CONTRATO DE PRESTAÇÃO DE SERVIÇOS DE FORNECIMENTO DE CHOPP, " +
      "EQUIPAMENTOS DE EXTRAÇÃO E MATERIAIS PARA EVENTOS (AUTO SERVIÇO)"
    );
  }
  return (
    "CONTRATO DE PRESTAÇÃO DE SERVIÇOS DE FORNECIMENTO DE CHOPP, " +
    "DISPONIBILIZAÇÃO DE TOTEM, EQUIPE DE ATENDIMENTO E EQUIPAMENTOS PARA EVENTOS"
  );
}

export default function BudgetContractDocument(props: BudgetContractDocumentProps) {
  const consignedLitersWord = formatNumberExtenso(props.consignedLiters);
  const consignedBarrelsWord = formatNumberExtenso(props.consignedBarrels);
  const signatureCity = extractSignatureCity(props.clientCityState);

  return (
    <div
      data-budget-contract
      style={{
        ...base,
        width: CONTRACT_PAGE_WIDTH_PX,
        backgroundColor: "#fff",
        padding: `${CONTRACT_CONTENT_PADDING.top}px ${CONTRACT_CONTENT_PADDING.right}px ${CONTRACT_CONTENT_PADDING.bottom}px ${CONTRACT_CONTENT_PADDING.left}px`,
        boxSizing: "border-box",
      }}
    >
      <div style={{ textAlign: "center", fontWeight: 700, marginBottom: 20, textTransform: "uppercase" }}>
        {contractTitle(props.contractVariant)}
      </div>

      <p style={p}>
        Pelo presente instrumento particular de contrato, de um lado,{" "}
        <strong>{props.clientName}</strong>, inscrito(a) no CPF sob o nº{" "}
        <strong>{props.clientCpf}</strong>, com residência em{" "}
        <strong>{props.clientAddressLine}</strong>, doravante denominada
        <strong>CONTRATANTE</strong>; e, de outro lado, a empresa{" "}
        <strong>{CONTRACT_BRAND.legalName}</strong>, inscrita no CNPJ sob o nº{" "}
        <strong>{CONTRACT_BRAND.cnpj}</strong>, com sede à{" "}
        {CONTRACT_BRAND.address}, representada por {CONTRACT_BRAND.representative},
        doravante denominada <strong>CONTRATADA</strong>.
      </p>

      <p style={p}>
        As partes têm entre si justo e contratado o que segue, que mutuamente
        aceitam e outorgam, de acordo com as cláusulas abaixo:
      </p>

      <div style={clauseTitle}>CLÁUSULA PRIMEIRA – DO OBJETO</div>
      <p style={p}>
        {clauseOneObjectText(
          props.hasCustomMugs,
          props.contractVariant,
          props.extraServices,
        )}
      </p>

      <div style={clauseTitle}>
        CLÁUSULA SEGUNDA – DO EVENTO E DAS CONDIÇÕES DO SERVIÇO
      </div>
      <p style={p}>
        O evento ocorrerá no dia <strong>{formatDateLongBR(props.eventDate)}</strong>,
        nas instalações nos <strong>{props.eventLocation}</strong>, com duração de{" "}
        <strong>{props.hours} horas</strong>, e público estimado de{" "}
        <strong>{props.people} pessoas que consomem chopp</strong>.
      </p>
      <p style={p}>
        <strong>{buildServiceCommitment(props)}</strong>
      </p>

      <div style={clauseTitle}>
        CLÁUSULA TERCEIRA – DO VALOR E DAS CONDIÇÕES DE PAGAMENTO
      </div>
      <p style={p}>
        O valor total pactuado entre as partes é de{" "}
        <strong>{formatCurrencyWithExtenso(props.finalTotal)}</strong>.
      </p>
      <p style={p}>
        O pagamento será realizado em duas parcelas, sendo a primeira no valor de{" "}
        <strong>{formatCurrencyWithExtenso(props.firstInstallment)}</strong>, a título de sinal de
        reserva, até o dia <strong>{formatDateLongBR(props.signalDueDate)}</strong>, e a
        segunda, de <strong>{formatCurrencyWithExtenso(props.secondInstallment)}</strong>,
        deverá ser quitada até o dia do evento (
        <strong>{formatDateLongBR(props.eventDate)}</strong>), mediante apresentação do
        comprovante de pagamento à CONTRATADA.
      </p>

      <div style={clauseTitle}>CLÁUSULA QUARTA – DAS OBRIGAÇÕES DA CONTRATADA</div>
      {props.contractVariant === "auto_servico" ? (
        <>
          <p style={p}>
            A CONTRATADA se obriga a fornecer o chopp na quantidade e qualidade
            estipuladas, entregar os equipamentos de extração em condições de
            funcionamento, disponibilizar os materiais acordados (copos ou
            canecas) e orientar a CONTRATANTE quanto à operação básica dos
            equipamentos no momento da entrega.
          </p>
          <p style={p}>
            Compromete-se ainda a realizar a montagem básica na chegada e a
            retirada dos equipamentos ao término do evento, deixando o local em
            perfeitas condições. A operação e o atendimento durante o evento
            ficam sob responsabilidade da CONTRATANTE.
          </p>
        </>
      ) : (
        <>
          <p style={p}>
            A CONTRATADA se obriga a fornecer o chopp na quantidade e qualidade
            estipuladas, garantir o perfeito funcionamento dos equipamentos,
            disponibilizar equipe uniformizada e qualificada para o atendimento, e
            manter padrões adequados de higiene, apresentação e cordialidade durante
            todo o evento.
          </p>
          <p style={p}>
            Compromete-se ainda a realizar a instalação e a retirada dos
            equipamentos com zelo, deixando o local em perfeitas condições ao
            término dos serviços.
          </p>
        </>
      )}

      <div style={clauseTitle}>CLÁUSULA QUINTA – DAS OBRIGAÇÕES DA CONTRATANTE</div>
      <p style={p}>A CONTRATANTE obriga-se a:</p>
      {props.contractVariant === "auto_servico" ? (
        <>
          <p style={p}>
            <strong>I –</strong> Disponibilizar um local adequado, limpo e de fácil acesso para a
            instalação dos equipamentos de extração e demais materiais
            necessários à prestação dos serviços;
          </p>
          <p style={p}>
            <strong>II –</strong> Fornecer ponto de energia elétrica (220v) em perfeitas condições
            de funcionamento durante todo o período do evento, responsabilizando-se
            por eventuais falhas na rede elétrica do local e pela operação dos
            equipamentos;
          </p>
          <p style={p}>
            <strong>III –</strong> Garantir livre acesso da equipe da CONTRATADA para a montagem
            básica e retirada dos equipamentos, nos horários previamente acordados;
          </p>
          <p style={p}>
            <strong>IV –</strong> Operar os equipamentos de forma adequada durante o evento, zelar
            por sua integridade e responsabilizar-se por danos causados por
            negligência, mau uso ou atos praticados por convidados;
          </p>
          <p style={p}>
            <strong>V –</strong> Efetuar os pagamentos nos prazos e condições estabelecidos neste
            contrato.
          </p>
        </>
      ) : (
        <>
          <p style={p}>
            <strong>I –</strong> Disponibilizar um local adequado, limpo e de fácil acesso para a
            instalação do totem de chopp e dos demais equipamentos necessários à
            prestação dos serviços;
          </p>
          <p style={p}>
            <strong>II –</strong> Fornecer ponto de energia elétrica (220v) em perfeitas condições de
            funcionamento durante todo o período do evento, responsabilizando-se por
            eventuais falhas na rede elétrica do local;
          </p>
          <p style={p}>
            <strong>III –</strong> Garantir livre acesso da equipe da CONTRATADA para a montagem,
            operação e desmontagem dos equipamentos, nos horários previamente
            acordados;
          </p>
          <p style={p}>
            <strong>IV –</strong> Zelar pela integridade dos equipamentos disponibilizados pela
            CONTRATADA, responsabilizando-se por danos causados por terceiros,
            negligência, mau uso ou atos praticados por convidados durante o período
            em que os equipamentos permanecerem no local do evento;
          </p>
          <p style={p}>
            <strong>V –</strong> Efetuar os pagamentos nos prazos e condições estabelecidos neste
            contrato.
          </p>
        </>
      )}

      <div style={clauseTitle}>CLÁUSULA SEXTA – DO CHOPP CONSIGNADO</div>
      <p style={p}>
        A CONTRATADA poderá disponibilizar, mediante solicitação da
        CONTRATANTE, até <strong>{props.consignedLiters} ({consignedLitersWord}) litros
        de chopp consignado</strong>, correspondentes a{" "}
        <strong>{formatBarrelCount(props.consignedBarrels)} ({consignedBarrelsWord}) barris de 50 (cinquenta) litros cada</strong>, para
        utilização durante o evento.
      </p>
      <p style={p}>
        <strong>§1º</strong> Os barris consignados serão fornecidos lacrados e somente serão
        considerados consumidos caso seus lacres sejam rompidos e os barris
        efetivamente utilizados durante o evento.
      </p>
      <p style={p}>
        <strong>§2º</strong> Os barris que permanecerem lacrados ao término do evento serão
        recolhidos pela CONTRATADA, sem qualquer custo adicional à CONTRATANTE.
      </p>
      <p style={p}>
        <strong>§3º</strong> Cada barril consignado de 50 (cinquenta) litros terá o valor de{" "}
        <strong>R$ 700,00 (setecentos reais)</strong>. O valor correspondente aos barris que forem
        abertos deverá ser quitado pela CONTRATANTE até o primeiro dia útil
        subsequente ao evento, por meio da forma de pagamento previamente
        acordada entre as partes.
      </p>
      <p style={p}>
        <strong>§4º</strong> A abertura de qualquer barril consignado caracteriza sua utilização,
        tornando devido o pagamento integral do respectivo barril,
        independentemente da quantidade efetivamente consumida.
      </p>

      <div style={clauseTitle}>CLÁUSULA SÉTIMA – DO CANCELAMENTO E DAS PENALIDADES</div>
      <p style={p}>
        Em caso de cancelamento por parte da CONTRATANTE, será devolvido 50%
        (cinquenta por cento) do valor pago, desde que o cancelamento ocorra com
        antecedência superior a 10 (dez) dias da data do evento.
      </p>
      <p style={p}>
        Caso o cancelamento ocorra com antecedência igual ou inferior a 10 (dez)
        dias, não haverá reembolso de qualquer valor.
      </p>
      <p style={p}>
        Se a CONTRATADA deixar de comparecer ou não fornecer o serviço conforme
        acordado, deverá restituir integralmente os valores recebidos, acrescidos
        de multa de 10% (dez por cento) sobre o valor total do contrato.
      </p>

      <div style={clauseTitle}>CLÁUSULA OITAVA – DA VIGÊNCIA</div>
      <p style={p}>
        O presente contrato passa a vigorar na data de sua assinatura,
        encerrando-se após o término do evento e o cumprimento integral de todas
        as obrigações assumidas por ambas as partes.
      </p>

      <div style={clauseTitle}>CLÁUSULA NONA – DO FORO</div>
      <p style={p}>
        Para dirimir quaisquer controvérsias oriundas deste instrumento, as
        partes elegem o Foro da Comarca de {CONTRACT_BRAND.forumCity}, Estado de
        São Paulo, renunciando expressamente a qualquer outro, por mais
        privilegiado que seja.
      </p>

      <p style={{ ...p, textAlign: "left", marginTop: 24 }}>
        <strong>{signatureCity}-SP, {formatDateLongBRSignature(props.issuedAt)}.</strong>
      </p>

      <div style={{ marginTop: 32 }}>
        <p style={{ fontWeight: 700, marginBottom: 4 }}>
          CONTRATANTE – <strong>{props.clientName}</strong>
        </p>
        <p style={{ marginBottom: 24 }}><strong>(Assinatura)</strong></p>
        <p style={{ marginBottom: 2 }}>Nome: <strong>{props.clientName}</strong></p>
        <p style={{ marginBottom: 32 }}>CPF / CNPJ: <strong>{props.clientCpf}</strong></p>

        <p style={{ fontWeight: 700, marginBottom: 4 }}>
          CONTRATADA – <strong>{CONTRACT_BRAND.legalName.toUpperCase()}</strong>
        </p>
        <p style={{ marginBottom: 24 }}><strong>(Assinatura)</strong></p>
        <p style={{ marginBottom: 2 }}>Nome: <strong>{CONTRACT_BRAND.representative}</strong></p>
        <p>CPF / CNPJ: <strong>{CONTRACT_BRAND.cnpj}</strong></p>
      </div>
    </div>
  );
}
