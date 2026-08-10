import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

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
   * - modelagem (tradicional ou baby look)
   * - tamanho escolhido
   */
  const itemsSummary = useMemo(() => {
    return items
      .map((item) => {
        const pieces = item.pieces
          .map((piece) => {
            const fit = piece.fit
              ? ` — Modelagem: ${piece.fit}`
              : "";

            const size = piece.size
              ? ` — Tamanho: ${piece.size}`
              : "";

            return `${piece.productName}${fit}${size}`;
          })
          .join(" | ");

        return `${item.quantity}x ${item.name} => ${pieces}`;
      })
      .join("\n");
  }, [items]);

  const totalPieces = useMemo(
    () => items.reduce((total, item) => total + item.quantity, 0),
    [items]
  );

  if (!hydrated) {
    return (
      <main className="container page">
        <p>Carregando pedido...</p>
      </main>
    );
  }

  if (items.length === 0) {
    return (
      <main className="container page">
        <div className="empty boxed">
          <h2>CARRINHO VAZIO</h2>

          <p>Adicione produtos antes de finalizar o pedido.</p>

          <Link to="/colecao" className="btn primary">
            VOLTAR À COLEÇÃO
          </Link>
        </div>
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
        : "Cartão de crédito";

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
      paymentLabel,
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
       * Navegação pelo router: um redirect com
       * window.location recarregava a página inteira
       * e o servidor não conhece a rota /confirmacao.
       */
      navigate("/confirmacao", { replace: true });
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
    <main className="container page">
      <small>
        <Link to="/carrinho">CARRINHO</Link> / CHECKOUT
      </small>

      <h1>FINALIZE SEU PEDIDO</h1>

      <p>
        Três etapas rápidas: seus dados, a forma de pagamento e a revisão
        final antes de enviar o pedido para a equipe.
      </p>

      <ol className="steps">
        {STEPS.map((label, index) => (
          <li
            key={label}
            className={
              step === index
                ? "active"
                : step > index
                ? "done"
                : ""
            }
            aria-current={step === index ? "step" : undefined}
          >
            ETAPA {index + 1}
            <strong>{label}</strong>
          </li>
        ))}
      </ol>

      <div className="checkout-grid">
        <section>

          {/* ========================= */}
          {/* ETAPA 1 — DADOS          */}
          {/* ========================= */}

          {step === 0 && (
            <div className="checkout-panel">
              <h2>DADOS DO COMPRADOR</h2>

              <p>
                Usamos esses dados apenas para identificar o pedido e falar
                com você sobre a entrega.
              </p>

              <div className="form field-grid">
                <label className="wide">
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
                  <span>CPF</span>

                  <input
                    type="text"
                    inputMode="numeric"
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

                <label className="wide">
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

              <p className="field-hint">
                O WhatsApp é por onde a equipe envia o link de pagamento.
              </p>
            </div>
          )}

          {/* ========================= */}
          {/* ETAPA 2 — PAGAMENTO      */}
          {/* ========================= */}

          {step === 1 && (
            <>
              <div className="checkout-panel">
                <h2>FORMA DE PAGAMENTO</h2>

                <p>Escolha como prefere pagar o pedido.</p>

                <div className="option-grid two">
                  <button
                    type="button"
                    className={payment === "pix" ? "active" : ""}
                    onClick={() => setPayment("pix")}
                  >
                    PIX
                  </button>

                  <button
                    type="button"
                    className={payment === "credito" ? "active" : ""}
                    onClick={() => setPayment("credito")}
                  >
                    CARTÃO DE CRÉDITO
                  </button>
                </div>
              </div>

              <div className="checkout-panel">
                <h2>COMO DESEJA RECEBER?</h2>

                <p>
                  A retirada é feita com a equipe na universidade, sem
                  custo adicional.
                </p>

                <div className="option-grid two">
                  <button
                    type="button"
                    className={delivery === "retirada" ? "active" : ""}
                    onClick={() => setDelivery("retirada")}
                  >
                    RETIRADA COM A EQUIPE
                  </button>

                  <button
                    type="button"
                    className={delivery === "entrega" ? "active" : ""}
                    onClick={() => setDelivery("entrega")}
                  >
                    ENTREGA
                  </button>
                </div>
              </div>

              <div className="checkout-panel">
                <h2>OBSERVAÇÃO</h2>

                <p>Opcional — algo que a equipe precise saber.</p>

                <div className="form">
                  <label>
                    <span>Mensagem para a equipe</span>

                    <textarea
                      rows={4}
                      placeholder="Ex.: informação adicional..."
                      value={notes}
                      onChange={(event) => setNotes(event.target.value)}
                    />
                  </label>
                </div>
              </div>
            </>
          )}

          {/* ========================= */}
          {/* ETAPA 3 — REVISÃO        */}
          {/* ========================= */}

          {step === 2 && (
            <>
              <div className="checkout-panel">
                <h2>ITENS DO PEDIDO</h2>

                <p>
                  {totalPieces}{" "}
                  {totalPieces === 1 ? "item" : "itens"} no pedido.
                </p>

                <ul className="review">
                  {items.map((item) => (
                    <li key={item.uid}>
                      <span>
                        {item.quantity}× {item.name}
                        <em>
                          {item.pieces
                            .map(
                              (piece) =>
                                `${piece.productName}${
                                  piece.fit ? ` · ${piece.fit}` : ""
                                }${piece.size ? ` · Tam. ${piece.size}` : ""}`
                            )
                            .join(" | ")}
                        </em>
                      </span>

                      <strong>
                        {formatBRL(item.unitPrice * item.quantity)}
                      </strong>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="checkout-panel">
                <h2>SEUS DADOS</h2>

                <p>Confira antes de confirmar.</p>

                <div className="order-info">
                  <div>
                    <span>COMPRADOR</span>
                    <strong>{customer.name}</strong>
                  </div>

                  <div>
                    <span>WHATSAPP</span>
                    <strong>{customer.whatsapp}</strong>
                  </div>

                  <div>
                    <span>CPF</span>
                    <strong>{customer.cpf}</strong>
                  </div>

                  <div>
                    <span>E-MAIL</span>
                    <strong>{customer.email}</strong>
                  </div>

                  <div>
                    <span>PAGAMENTO</span>
                    <strong>
                      {payment === "pix" ? "PIX" : "Cartão de crédito"}
                    </strong>
                  </div>

                  <div>
                    <span>RECEBIMENTO</span>
                    <strong>
                      {delivery === "retirada"
                        ? "Retirada com a equipe"
                        : "Entrega"}
                    </strong>
                  </div>

                  {notes && (
                    <div className="full">
                      <span>OBSERVAÇÃO</span>
                      <strong>{notes}</strong>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {/* ========================= */}
          {/* ERRO                     */}
          {/* ========================= */}

          {submitError && (
            <p className="form-error" role="alert">
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

                  setStep((current) => current - 1);
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

        <aside className="summary">
          <h2>RESUMO</h2>

          <ul className="summary-items">
            {items.map((item) => (
              <li key={item.uid}>
                <span>
                  {item.quantity}× {item.name}
                </span>

                <strong>
                  {formatBRL(item.unitPrice * item.quantity)}
                </strong>
              </li>
            ))}
          </ul>

          <div>
            <span>SUBTOTAL</span>
            <strong>{formatBRL(subtotal)}</strong>
          </div>

          <div>
            <span>TOTAL</span>
            <strong>{formatBRL(subtotal)}</strong>
          </div>

          <Link to="/carrinho" className="btn outline">
            EDITAR CARRINHO
          </Link>

          <p className="summary-note">
            O pagamento é combinado com a equipe pelo WhatsApp logo após a
            confirmação.
          </p>
        </aside>
      </div>
    </main>
  );
}
