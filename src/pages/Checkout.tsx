import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { formatBRL } from "../catalog";
import { useCart } from "../cart";

const FORMSPREE_URL = "https://formspree.io/f/xdenabro";

export function Checkout() {
  const { items, subtotal, clear, hydrated } = useCart();
  const navigate = useNavigate();

  const [step, setStep] = useState(0);

  const [customer, setCustomer] = useState({
    name: "",
    whatsapp: "",
    email: "",
    cpf: "",
  });

  const [payment, setPayment] = useState("");
  const [delivery, setDelivery] = useState("");
  const [notes, setNotes] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const validCustomer =
    customer.name.trim().length >= 3 &&
    customer.whatsapp.replace(/\D/g, "").length >= 10 &&
    customer.email.includes("@") &&
    customer.cpf.replace(/\D/g, "").length === 11;

  function paymentName() {
    if (payment === "pix") return "PIX";
    if (payment === "credito") return "Cartão de crédito";
    if (payment === "debito") return "Cartão de débito";

    return payment;
  }

  function deliveryName() {
    if (delivery === "retirada") return "Retirada com a equipe";
    if (delivery === "entrega") return "Entrega";

    return delivery;
  }

  function next() {
    setError("");

    if (step === 0 && !validCustomer) {
      setError("Preencha corretamente os dados do comprador.");
      return;
    }

    if (step === 1 && (!payment || !delivery)) {
      setError("Escolha pagamento e recebimento.");
      return;
    }

    setStep((current) => Math.min(2, current + 1));
  }

  /*
   * AQUI montamos as informações completas
   * de modelo e tamanho para o Formspree.
   */
  function buildItemsSummary() {
    return items
      .map((item) => {
        const pieces = item.pieces
          .map((piece) => {
            const tamanho = piece.size
              ? ` — Tamanho: ${piece.size}`
              : "";

            return `${piece.productName}${tamanho}`;
          })
          .join(" | ");

        return `${item.quantity}x ${item.name} => ${pieces}`;
      })
      .join("\n");
  }

  async function confirm() {
    if (submitting) return;

    setSubmitting(true);
    setError("");

    const orderId = `TUF-${new Date().getFullYear()}-${
      Math.floor(Math.random() * 9000) + 1000
    }`;

    const order = {
      id: orderId,
      createdAt: new Date().toISOString(),
      items,
      total: subtotal,
      customer,
      payment,
      delivery,
      notes,
    };

    const itemsSummary = buildItemsSummary();

    try {
      const response = await fetch(FORMSPREE_URL, {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },

        body: JSON.stringify({
          _subject: `Novo pedido Tuffão — ${orderId}`,

          pedido: orderId,

          data: new Date().toLocaleString("pt-BR"),

          nome: customer.name,

          whatsapp: customer.whatsapp,

          email: customer.email,

          cpf: customer.cpf,

          pagamento: paymentName(),

          recebimento: deliveryName(),

          observacao:
            notes.trim() || "Nenhuma observação.",

          total: formatBRL(subtotal),

          itens: itemsSummary,
        }),
      });

      const result = await response.json().catch(() => null);

      if (!response.ok) {
        console.error("Erro Formspree:", result);

        throw new Error(
          result?.errors?.[0]?.message ||
            "Não foi possível registrar o pedido."
        );
      }

      /*
       * Só salva e limpa depois que o
       * Formspree confirma o recebimento.
       */
      localStorage.setItem(
        "tuffao-last-order-v2",
        JSON.stringify(order)
      );

      clear();

      navigate("/confirmacao");
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Não foi possível registrar o pedido."
      );

      setSubmitting(false);
    }
  }

  if (!hydrated) {
    return (
      <main className="page-shell">
        <p>Carregando...</p>
      </main>
    );
  }

  if (items.length === 0) {
    return (
      <main className="page-shell">
        <div className="empty">
          <h1>CARRINHO VAZIO</h1>

          <Link to="/colecao" className="btn primary">
            VOLTAR À COLEÇÃO
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="page-shell">
      <div className="breadcrumbs">
        <Link to="/carrinho">CARRINHO</Link>

        <span> / </span>

        <span>CHECKOUT</span>
      </div>

      <h1>CHECKOUT</h1>

      <ol className="checkout-steps">
        {["DADOS", "PAGAMENTO", "REVISÃO"].map(
          (label, index) => (
            <li
              key={label}
              className={
                step === index ? "active" : ""
              }
            >
              <span>ETAPA {index + 1}</span>

              <strong>{label}</strong>
            </li>
          )
        )}
      </ol>

      <div className="checkout-layout">
        <section className="checkout-content">

          {/* ETAPA 1 */}

          {step === 0 && (
            <div className="checkout-section">
              <h2>DADOS DO COMPRADOR</h2>

              <input
                placeholder="Nome completo"
                value={customer.name}
                onChange={(event) =>
                  setCustomer({
                    ...customer,
                    name: event.target.value,
                  })
                }
              />

              <input
                placeholder="WhatsApp"
                value={customer.whatsapp}
                onChange={(event) =>
                  setCustomer({
                    ...customer,
                    whatsapp: event.target.value,
                  })
                }
              />

              <input
                placeholder="E-mail"
                type="email"
                value={customer.email}
                onChange={(event) =>
                  setCustomer({
                    ...customer,
                    email: event.target.value,
                  })
                }
              />

              <input
                placeholder="CPF"
                value={customer.cpf}
                onChange={(event) =>
                  setCustomer({
                    ...customer,
                    cpf: event.target.value,
                  })
                }
              />
            </div>
          )}

          {/* ETAPA 2 */}

          {step === 1 && (
            <div className="checkout-section">
              <h2>FORMA DE PAGAMENTO</h2>

              <div className="option-grid">
                <button
                  type="button"
                  className={
                    payment === "pix"
                      ? "active"
                      : ""
                  }
                  onClick={() => setPayment("pix")}
                >
                  PIX
                </button>

                <button
                  type="button"
                  className={
                    payment === "credito"
                      ? "active"
                      : ""
                  }
                  onClick={() =>
                    setPayment("credito")
                  }
                >
                  CARTÃO DE CRÉDITO
                </button>

                <button
                  type="button"
                  className={
                    payment === "debito"
                      ? "active"
                      : ""
                  }
                  onClick={() =>
                    setPayment("debito")
                  }
                >
                  CARTÃO DE DÉBITO
                </button>
              </div>

              <h2>COMO DESEJA RECEBER?</h2>

              <div className="option-grid">
                <button
                  type="button"
                  className={
                    delivery === "retirada"
                      ? "active"
                      : ""
                  }
                  onClick={() =>
                    setDelivery("retirada")
                  }
                >
                  RETIRADA COM A EQUIPE
                </button>

                <button
                  type="button"
                  className={
                    delivery === "entrega"
                      ? "active"
                      : ""
                  }
                  onClick={() =>
                    setDelivery("entrega")
                  }
                >
                  ENTREGA
                </button>
              </div>

              <textarea
                placeholder="Observação para a equipe"
                value={notes}
                onChange={(event) =>
                  setNotes(event.target.value)
                }
              />
            </div>
          )}

          {/* ETAPA 3 */}

          {step === 2 && (
            <div className="checkout-section">
              <h2>REVISÃO DO PEDIDO</h2>

              <div className="checkout-items">
                {items.map((item) => (
                  <div
                    className="checkout-item"
                    key={item.uid}
                  >
                    <div>
                      <strong>
                        {item.quantity}× {item.name}
                      </strong>

                      {item.pieces.map(
                        (piece, index) => (
                          <p key={index}>
                            {piece.productName}

                            {piece.size
                              ? ` — Tam. ${piece.size}`
                              : ""}
                          </p>
                        )
                      )}
                    </div>

                    <strong>
                      {formatBRL(
                        item.unitPrice *
                          item.quantity
                      )}
                    </strong>
                  </div>
                ))}
              </div>

              <div className="review-data">
                <p>
                  <strong>Cliente:</strong>{" "}
                  {customer.name}
                </p>

                <p>
                  <strong>WhatsApp:</strong>{" "}
                  {customer.whatsapp}
                </p>

                <p>
                  <strong>Pagamento:</strong>{" "}
                  {paymentName()}
                </p>

                <p>
                  <strong>Recebimento:</strong>{" "}
                  {deliveryName()}
                </p>
              </div>
            </div>
          )}

          {error && (
            <p className="form-error">
              {error}
            </p>
          )}

          <div className="checkout-actions">
            {step > 0 && (
              <button
                type="button"
                className="btn outline"
                disabled={submitting}
                onClick={() =>
                  setStep(
                    (current) => current - 1
                  )
                }
              >
                VOLTAR
              </button>
            )}

            {step < 2 ? (
              <button
                type="button"
                className="btn primary"
                onClick={next}
              >
                CONTINUAR
              </button>
            ) : (
              <button
                type="button"
                className="btn primary"
                disabled={submitting}
                onClick={confirm}
              >
                {submitting
                  ? "REGISTRANDO..."
                  : "CONFIRMAR PEDIDO"}
              </button>
            )}
          </div>
        </section>

        <aside className="checkout-summary">
          <h2>RESUMO</h2>

          <div>
            <span>Subtotal</span>

            <span>
              {formatBRL(subtotal)}
            </span>
          </div>

          <div className="checkout-total">
            <strong>TOTAL</strong>

            <strong>
              {formatBRL(subtotal)}
            </strong>
          </div>

          <Link
            to="/carrinho"
            className="btn outline"
          >
            EDITAR CARRINHO
          </Link>
        </aside>
      </div>
    </main>
  );
}
