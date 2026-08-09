import { useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { formatBRL } from "../catalog";
import { useCart } from "../cart";

const FORMSPREE_URL = "https://formspree.io/f/xdenabro";
const WHATSAPP_NUMBER = "5521979239910";

type Customer = {
  name: string;
  whatsapp: string;
  email: string;
};

type ConfirmedOrder = {
  id: string;
  total: number;
  whatsappUrl: string;
};

const STEPS = ["DADOS", "PAGAMENTO", "REVISÃO"] as const;

function onlyDigits(value: string) {
  return value.replace(/\D/g, "");
}

function createOrderId() {
  const randomNumber = Math.floor(Math.random() * 9000) + 1000;
  return `TUF-${new Date().getFullYear()}-${randomNumber}`;
}

export function Checkout() {
  const { items, subtotal, clear, hydrated } = useCart();

  const [step, setStep] = useState(0);

  const [customer, setCustomer] = useState<Customer>({
    name: "",
    whatsapp: "",
    email: "",
  });

  const [payment, setPayment] = useState("");
  const [delivery, setDelivery] = useState("");
  const [notes, setNotes] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [confirmedOrder, setConfirmedOrder] =
    useState<ConfirmedOrder | null>(null);

  const validCustomer =
    customer.name.trim().length >= 3 &&
    onlyDigits(customer.whatsapp).length >= 10 &&
    customer.email.includes("@");

  const itemsSummary = useMemo(() => {
    return items
      .map((item) => {
        const pieces = item.pieces
          .map((piece) => {
            const size = piece.size ? ` — Tam. ${piece.size}` : "";
            return `${piece.label}: ${piece.productName}${size}`;
          })
          .join(" | ");

        return `${item.quantity}x ${item.name} — ${formatBRL(
          item.unitPrice * item.quantity,
        )}${pieces ? ` | ${pieces}` : ""}`;
      })
      .join("\n");
  }, [items]);

  if (!hydrated) {
    return (
      <main className="page-shell">
        <p>Carregando pedido...</p>
      </main>
    );
  }

  if (confirmedOrder) {
    return (
      <main className="page-shell">
        <section className="checkout-success">
          <p className="eyebrow">PEDIDO REGISTRADO</p>

          <h1>Pedido recebido.</h1>

          <p>
            Seu pedido foi registrado com sucesso. Agora, fale com a Tuffão
            pelo WhatsApp para receber o link de pagamento correspondente ao
            valor da compra.
          </p>

          <div className="order-confirmation-box">
            <p>
              <strong>Número do pedido:</strong> {confirmedOrder.id}
            </p>

            <p>
              <strong>Valor total:</strong>{" "}
              {formatBRL(confirmedOrder.total)}
            </p>
          </div>

          <a
            href={confirmedOrder.whatsappUrl}
            target="_blank"
            rel="noreferrer"
            className="btn primary"
          >
            RECEBER LINK DE PAGAMENTO NO WHATSAPP
          </a>

          <Link to="/colecao" className="btn outline">
            VOLTAR À COLEÇÃO
          </Link>
        </section>
      </main>
    );
  }

  if (items.length === 0) {
    return (
      <main className="page-shell">
        <section className="empty">
          <h1>CARRINHO VAZIO</h1>

          <p>Adicione produtos antes de finalizar o pedido.</p>

          <Link to="/colecao" className="btn primary">
            VOLTAR À COLEÇÃO
          </Link>
        </section>
      </main>
    );
  }

  function nextStep() {
    setSubmitError("");

    if (step === 0 && !validCustomer) {
      setSubmit
