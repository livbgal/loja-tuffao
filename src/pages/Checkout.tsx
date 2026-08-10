import { useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { formatBRL } from "../catalog";
import { useCart } from "../cart";

const FORMSPREE_URL = "https://formspree.io/f/xdenabro";

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
  const [submitError, setSubmitError] = useState("");

  const validCustomer =
    customer.name.trim().length >= 3 &&
    onlyDigits(customer.whatsapp).length >= 10 &&
    customer.email.includes("@") &&
    onlyDigits(customer.cpf).length === 11;

  /*
   * RESUMO COMPLETO DO PEDIDO PARA O FORMSPREE
   *
   * Agora inclui:
   * - produto/combo
   * - quantidade
   * - modelo escolhido
   * - tamanho escolhido
   */
  const itemsSummary = useMemo(() => {
    return items
      .map((item) => {
        const pieces = item.pieces
          .map((piece) => {
            const size = piece.size
              ? ` — Tamanho: ${piece.size}`
              : "";

            return `${piece.productName}${size}`;
          })
          .join(" | ");

        return `${item.quantity}x ${item.name} => ${pieces}`;
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

  if (items.length === 0) {
    return (
      <main className="page-shell">
        <section className="empty">
          <h1>CARRINHO VAZIO</h1>

          <p>
            Adicione produtos antes de finalizar o pedido.
          </p>

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
      setSubmitError(
        "Preencha corretamente seu nome, WhatsApp com DDD, e-mail e CPF."
      );

      return;
    }

    if (step === 1 && (!payment || !delivery)) {
      setSubmitError(
        "Escolha a forma de pagamento e como deseja receber o pedido."
      );

      return;
    }

    setStep((current) => Math.min(2, current + 1));
  }

  async function confirmOrder() {
    if (submitting) return;

    if (!validCustomer || !payment || !delivery) {
      setSubmitError(
        "Revise os dados do pedido antes de confirmar."
      );

      return;
    }

    setSubmitting(true);
    setSubmitError("");

    const orderId = createOrderId();

    const paymentLabel =
      payment === "pix"
        ? "PIX"
        : payment === "credito"
          ? "Cartão de crédito"
          : "Cartão de débito";

    const deliveryLabel =
      delivery === "retirada"
        ? "Retirada com a equipe"
        : "Entrega";

    const order = {
      id: orderId,
      createdAt: new Date().toISOString(),
      items,
      subtotal,
      total: subtotal,
      customer,
      payment,
      delivery,
      notes,
    };

    try {
      const response = await fetch(FORMSPREE_URL, {
        method: "POST",

        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          _subject: `Novo pedido Tuffão — ${orderId}`,

          pedido: orderId,

          data: new Date().toLocaleString("pt-BR"),

          nome: customer.name,

          whatsapp: customer.whatsapp,

          email: customer.email,

          cpf: customer.cpf,

          pagamento: paymentLabel,

          recebimento: deliveryLabel,

          observacao:
            notes.trim() || "Nenhuma observação.",

          total: formatBRL(subtotal),

          /*
           * É ESTA PARTE QUE RESOLVE
           * MODELO + TAMANHO NO FORMSPREE
           */
          itens: itemsSummary,
        }),
      });

      const result = await response
        .json()
        .catch(() => null);

      if (!response.ok) {
        console.error("Erro Formspree:", result);

        throw new Error(
          result?.errors?.[0]?.message ||
            `Não foi possível registrar o pedido. Código ${response.status}.`
        );
      }

      localStorage.setItem(
        "tuffao-last-order-v2",
        JSON.stringify(order)
      );

      clear();

      /*
       * Mantemos o fluxo antigo:
       * vai para a página de confirmação.
       */
      window.location.href = "/confirmacao";
    } catch (error) {
      console.error(error);

      setSubmitError(
        error instanceof Error
          ? error.message
          : "Não foi possível registrar o pedido."
      );

      setSubmitting(false);
    }
  }

  return (
    <main className="page-shell">
      <nav
        className="breadcrumbs"
        aria-label="Navegação"
      >
        <Link to="/carrinho">
          CARRINHO
        </Link>

        <span>/</span>

        <span>CHECKOUT</span>
      </nav>

      <h1>CHECKOUT</h1>

      <ol className="checkout-steps">
        {STEPS.map((label, index) => (
          <li
            key={label}
            className={
              step === index ? "active" : ""
            }
          >
            <small>
              ETAPA {index + 1}
            </small>

            <strong>
              {label}
            </strong>
          </li>
        ))}
      </ol>

      <div className="checkout-layout">
        <section className="checkout-content">

          {/* ========================= */}
          {/* ETAPA 1 — DADOS          */}
          {/* ========================= */}

          {step === 0 && (
            <div className="checkout-section">
              <h2>DADOS DO COMPRADOR</h2>

              <label>
                <span>Nome completo</span>

                <input
                  type="text"
                  placeholder="Seu nome completo"
                  value={customer.name}
                  onChange={(event) =>
                    setCustomer({
                      ...customer,
                      name: event.target.value,
                    })
                  }
                  autoComplete="name"
                />
              </label>

              <label>
                <span>WhatsApp</span>

                <input
                  type="tel"
                  placeholder="(21) 99999-9999"
                  value={customer.whatsapp}
                  onChange={(event) =>
                    setCustomer({
                      ...customer,
                      whatsapp:
                        event.target.value,
                    })
                  }
                  autoComplete="tel"
                />
              </label>

              <label>
                <span>E-mail</span>

                <input
                  type="email"
                  placeholder="seuemail@email.com"
                  value={customer.email}
                  onChange={(event) =>
                    setCustomer({
                      ...customer,
                      email: event.target.value,
                    })
                  }
                  autoComplete="email"
                />
              </label>

              <label>
                <span>CPF</span>

                <input
                  type="text"
                  placeholder="000.000.000-00"
                  value={customer.cpf}
                  onChange={(event) =>
                    setCustomer({
                      ...customer,
                      cpf: event.target.value,
                    })
                  }
                />
              </label>
            </div>
          )}

          {/* ========================= */}
          {/* ETAPA 2 — PAGAMENTO      */}
          {/* ========================= */}

          {step === 1 && (
            <div className="checkout-section">
              <h2>
                FORMA DE PAGAMENTO
              </h2>

              <div className="option-grid">
                <button
                  type="button"
                  className={
                    payment === "pix"
                      ? "active"
                      : ""
                  }
                  onClick={() =>
                    setPayment("pix")
                  }
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

              <h2>
                COMO DESEJA RECEBER?
              </h2>

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

              <label>
                <span>
                  Observação para a equipe —
                  opcional
                </span>

                <textarea
                  rows={4}
                  placeholder="Ex.: informação adicional..."
                  value={notes}
                  onChange={(event) =>
                    setNotes(event.target.value)
                  }
                />
              </label>
            </div>
          )}

          {/* ========================= */}
          {/* ETAPA 3 — REVISÃO        */}
          {/* ========================= */}

          {step === 2 && (
            <div className="checkout-section">
              <h2>
                REVISÃO DO PEDIDO
              </h2>

              <ul className="checkout-items">
                {items.map((item) => (
                  <li key={item.uid}>
                    <div>
                      <strong>
                        {item.quantity}×{" "}
                        {item.name}
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
                  </li>
                ))}
              </ul>

              <div className="review-data">
                <p>
                  <strong>
                    Comprador:
                  </strong>{" "}
                  {customer.name}
                </p>

                <p>
                  <strong>
                    WhatsApp:
                  </strong>{" "}
                  {customer.whatsapp}
                </p>

                <p>
                  <strong>
                    E-mail:
                  </strong>{" "}
                  {customer.email}
                </p>

                <p>
                  <strong>
                    CPF:
                  </strong>{" "}
                  {customer.cpf}
                </p>

                <p>
                  <strong>
                    Pagamento:
                  </strong>{" "}

                  {payment === "pix"
                    ? "PIX"
                    : payment === "credito"
                      ? "Cartão de crédito"
                      : "Cartão de débito"}
                </p>

                <p>
                  <strong>
                    Recebimento:
                  </strong>{" "}

                  {delivery === "retirada"
                    ? "Retirada com a equipe"
                    : "Entrega"}
                </p>

                {notes && (
                  <p>
                    <strong>
                      Observação:
                    </strong>{" "}
                    {notes}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* ========================= */}
          {/* ERRO                     */}
          {/* ========================= */}

          {submitError && (
            <p
              className="form-error"
              role="alert"
            >
              {submitError}
            </p>
          )}

          {/* ========================= */}
          {/* BOTÕES                   */}
          {/* ========================= */}

          <div className="checkout-actions">
            {step > 0 && (
              <button
                type="button"
                className="btn outline"
                disabled={submitting}
                onClick={() => {
                  setSubmitError("");

                  setStep(
                    (current) =>
                      current - 1
                  );
                }}
              >
                VOLTAR
              </button>
            )}

            {step < 2 ? (
              <button
                type="button"
                className="btn primary"
                onClick={nextStep}
              >
                CONTINUAR
              </button>
            ) : (
              <button
                type="button"
                className="btn primary"
                onClick={confirmOrder}
                disabled={submitting}
              >
                {submitting
                  ? "REGISTRANDO PEDIDO..."
                  : "CONFIRMAR PEDIDO"}
              </button>
            )}
          </div>
        </section>

        {/* =========================== */}
        {/* RESUMO LATERAL             */}
        {/* =========================== */}

        <aside className="checkout-summary">
          <h2>
            RESUMO
          </h2>

          <div>
            <span>
              Subtotal
            </span>

            <span>
              {formatBRL(subtotal)}
            </span>
          </div>

          <div className="checkout-total">
            <strong>
              TOTAL
            </strong>

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
