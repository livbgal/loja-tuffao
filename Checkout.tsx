import { useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { formatBRL } from "../catalog";
import { useCart } from "../cart";

const FORMSPREE_URL = "https://formspree.io/f/xdenabro";
const WHATSAPP_NUMBER = "5521979239910";

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
  });

  const [payment, setPayment] = useState("");
  const [delivery, setDelivery] = useState("");
  const [notes, setNotes] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const validCustomer =
    customer.name.trim().length >= 3 &&
    onlyDigits(customer.whatsapp).length >= 10 &&
    customer.email.includes("@");

  const itemsSummary = useMemo(() => {
    return items
      .map((item) => {
        const pieces = item.pieces
          .map((piece) => {
            const size = piece.size
              ? ` — Tam. ${piece.size}`
              : "";

            return `${piece.label}: ${piece.productName}${size}`;
          })
          .join(" | ");

        return `${item.quantity}x ${item.name} — ${formatBRL(
          item.unitPrice * item.quantity
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
      setSubmitError(
        "Preencha corretamente seu nome, WhatsApp com DDD e e-mail."
      );
      return;
    }

    if (step === 1 && (!payment || !delivery)) {
      setSubmitError(
        "Escolha a forma de pagamento desejada e como pretende receber o pedido."
      );
      return;
    }

    setStep((current) => Math.min(2, current + 1));
  }

  async function confirmOrder() {
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

    /*
     * MENSAGEM QUE SERÁ ABERTA AUTOMATICAMENTE
     * NO WHATSAPP DA TUFFÃO.
     */
    const whatsappMessage = [
      "Olá! Acabei de finalizar um pedido na Loja Tuffão 🌪️",
      "",
      `Pedido: ${orderId}`,
      `Nome: ${customer.name}`,
      `Valor total: ${formatBRL(subtotal)}`,
      `Pagamento desejado: ${paymentLabel}`,
      `Recebimento: ${deliveryLabel}`,
      "",
      "Gostaria de receber meu link de pagamento.",
    ].join("\n");

    const whatsappUrl =
      `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
        whatsappMessage
      )}`;

    /*
     * CÓPIA LOCAL DO PEDIDO.
     */
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
      /*
       * ENVIA O PEDIDO PARA O FORMSPREE.
       *
       * O pedido ficará registrado no Formspree
       * e a notificação será enviada para o e-mail
       * configurado na sua conta.
       */
      const response = await fetch(FORMSPREE_URL, {
        method: "POST",

        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          _subject: `🌪️ Novo pedido Tuffão — ${orderId}`,

          pedido: orderId,

          nome: customer.name,

          email: customer.email,

          whatsapp: customer.whatsapp,

          pagamento: paymentLabel,

          recebimento: deliveryLabel,

          observacoes:
            notes.trim() || "Nenhuma observação.",

          itens: itemsSummary,

          total: formatBRL(subtotal),

          data: new Date().toLocaleString("pt-BR"),
        }),
      });

      /*
       * SE O FORMSPREE NÃO REGISTRAR,
       * NÃO APAGAMOS O CARRINHO.
       */
      if (!response.ok) {
        throw new Error(
          "Não foi possível registrar o pedido no Formspree."
        );
      }

      /*
       * GUARDA O ÚLTIMO PEDIDO NO NAVEGADOR.
       */
      localStorage.setItem(
        "tuffao-last-order-v2",
        JSON.stringify(order)
      );

      /*
       * LIMPA O CARRINHO SOMENTE DEPOIS
       * QUE O PEDIDO FOI REGISTRADO.
       */
      clear();

      /*
       * ABRE AUTOMATICAMENTE O WHATSAPP.
       *
       * O cliente não precisa clicar em outro botão.
       */
      window.location.href = whatsappUrl;
    } catch (error) {
      console.error(error);

      setSubmitError(
        "Não conseguimos registrar seu pedido. Tente novamente em alguns instantes."
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

      {/* ETAPAS */}

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

          {/* ============================= */}
          {/* ETAPA 1 — DADOS DO COMPRADOR */}
          {/* ============================= */}

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
                      whatsapp: event.target.value,
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
            </div>
          )}

          {/* ====================== */}
          {/* ETAPA 2 — PAGAMENTO   */}
          {/* ====================== */}

          {step === 1 && (
            <div className="checkout-section">
              <h2>
                FORMA DE PAGAMENTO
              </h2>

              <p>
                Escolha como deseja pagar.
                Após confirmar o pedido,
                você será direcionado ao
                WhatsApp da Tuffão para
                receber o link de pagamento.
              </p>

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
                  Observação para a equipe
                  — opcional
                </span>

                <textarea
                  rows={4}
                  placeholder="Ex.: preferência de retirada, informação adicional..."
                  value={notes}
                  onChange={(event) =>
                    setNotes(
                      event.target.value.slice(
                        0,
                        500
                      )
                    )
                  }
                />
              </label>
            </div>
          )}

          {/* ==================== */}
          {/* ETAPA 3 — REVISÃO   */}
          {/* ==================== */}

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
                            {piece.label}:{" "}
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

              <p className="privacy-notice">
                Ao confirmar o pedido, você
                autoriza o uso dos dados
                informados exclusivamente
                para registro da compra e
                contato relacionado ao pedido.
              </p>
            </div>
          )}

          {/* ERRO */}

          {submitError && (
            <p
              className="form-error"
              role="alert"
            >
              {submitError}
            </p>
          )}

          {/* BOTÕES */}

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
                  : "CONFIRMAR PEDIDO E IR PARA O WHATSAPP"}
              </button>
            )}
          </div>
        </section>

        {/* RESUMO LATERAL */}

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

          <p>
            O pagamento será concluído
            diretamente com a equipe após
            o registro do pedido.
          </p>

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
