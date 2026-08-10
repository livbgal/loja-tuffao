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

  function paymentLabel() {
    if (payment === "pix") return "PIX";
    if (payment === "credito") return "Cartão de crédito";
    if (payment === "debito") return "Cartão de débito";
    return "";
  }

  function deliveryLabel() {
    if (delivery === "retirada") {
      return "Retirada com a equipe";
    }

    if (delivery === "entrega") {
      return "Entrega";
    }

    return "";
  }

  function next() {
    setError("");

    if (step === 0 && !validCustomer) {
      setError(
        "Preencha corretamente nome, WhatsApp, e-mail e CPF."
      );
      return;
    }

    if (step === 1 && (!payment || !delivery)) {
      setError(
        "Escolha a forma de pagamento e a forma de recebimento."
      );
      return;
    }

    setStep((current) => Math.min(2, current + 1));
  }

  /*
   * Aqui ficam todos os modelos e tamanhos escolhidos.
   * Funciona também para combos.
   */
  function buildItemsSummary() {
    return items
      .map((item, itemIndex) => {
        const pieces = item.pieces
          .map((piece, pieceIndex) => {
            const size = piece.size
              ? ` | Tamanho: ${piece.size}`
              : "";

            return `Peça ${pieceIndex + 1}: ${piece.productName}${size}`;
          })
          .join("\n");

        return [
          `ITEM ${itemIndex + 1}`,
          `${item.quantity}x ${item.name}`,
          `Valor: ${formatBRL(item.unitPrice * item.quantity)}`,
          pieces,
        ].join("\n");
      })
      .join("\n\n--------------------\n\n");
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

          pagamento: paymentLabel(),

          recebimento: deliveryLabel(),

          observacao:
            notes.trim() || "Nenhuma observação.",

          total: formatBRL(subtotal),

          /*
           * ESTE CAMPO AGORA CONTÉM MODELOS + TAMANHOS
           */
          itens: buildItemsSummary(),
        }),
      });

      const result = await response
        .json()
        .catch(() => null);

      if (!response.ok) {
        console.error("Erro Formspree:", result);

        throw new Error(
          result?.errors?.[0]?.message ||
            "Não foi possível registrar o pedido."
        );
      }

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
      <div className="page">
        <div className="container">
          <p>Carregando carrinho...</p>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="page">
        <div className="container">
          <div className="empty boxed">
            <h2>CARRINHO VAZIO</h2>

            <p>
              Adicione produtos da coleção antes de finalizar.
            </p>

            <Link
              to="/colecao"
              className="btn primary"
            >
              VOLTAR À COLEÇÃO
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="container">

        <small>
          CARRINHO / CHECKOUT
        </small>

        <h1>CHECKOUT</h1>

        {/* ETAPAS */}

        <ol className="steps">
          {[
            "DADOS",
            "PAGAMENTO",
            "REVISÃO",
          ].map((label, index) => (
            <li
              key={label}
              className={
                step === index
                  ? "active"
                  : ""
              }
            >
              ETAPA {index + 1}

              <strong>
                {label}
              </strong>
            </li>
          ))}
        </ol>

        <div className="checkout-grid">

          {/* COLUNA PRINCIPAL */}

          <div>

            {/* ====================== */}
            {/* ETAPA 1 */}
            {/* ====================== */}

            {step === 0 && (
              <section>
                <h2>
                  DADOS DO COMPRADOR
                </h2>

                <div className="form">

                  <input
                    type="text"
                    placeholder="Nome completo"
                    value={customer.name}
                    onChange={(event) =>
                      setCustomer({
                        ...customer,
                        name:
                          event.target.value,
                      })
                    }
                  />

                  <input
                    type="tel"
                    placeholder="WhatsApp"
                    value={
                      customer.whatsapp
                    }
                    onChange={(event) =>
                      setCustomer({
                        ...customer,
                        whatsapp:
                          event.target.value,
                      })
                    }
                  />

                  <input
                    type="email"
                    placeholder="E-mail"
                    value={customer.email}
                    onChange={(event) =>
                      setCustomer({
                        ...customer,
                        email:
                          event.target.value,
                      })
                    }
                  />

                  <input
                    type="text"
                    placeholder="CPF"
                    value={customer.cpf}
                    onChange={(event) =>
                      setCustomer({
                        ...customer,
                        cpf:
                          event.target.value,
                      })
                    }
                  />

                </div>
              </section>
            )}

            {/* ====================== */}
            {/* ETAPA 2 */}
            {/* ====================== */}

            {step === 1 && (
              <section>

                <h2>
                  FORMA DE PAGAMENTO
                </h2>

                <div className="choice-list">

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

                <div className="choice-list">

                  <button
                    type="button"
                    className={
                      delivery === "retirada"
                        ? "active"
                        : ""
                    }
                    onClick={() =>
                      setDelivery(
                        "retirada"
                      )
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
                  rows={4}
                  placeholder="Observação para a equipe"
                  value={notes}
                  onChange={(event) =>
                    setNotes(
                      event.target.value
                    )
                  }
                />

              </section>
            )}

            {/* ====================== */}
            {/* ETAPA 3 */}
            {/* ====================== */}

            {step === 2 && (
              <section>

                <h2>
                  REVISÃO DO PEDIDO
                </h2>

                <ul className="review">

                  {items.map((item) => (
                    <li key={item.uid}>

                      <div>

                        <strong>
                          {item.quantity}×{" "}
                          {item.name}
                        </strong>

                        {item.pieces.map(
                          (
                            piece,
                            index
                          ) => (
                            <p
                              key={index}
                              style={{
                                margin:
                                  "6px 0 0",
                                color:
                                  "var(--muted)",
                                fontSize:
                                  ".82rem",
                              }}
                            >
                              {
                                piece.productName
                              }

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

                <div
                  className="notice"
                  style={{
                    marginTop: 20,
                  }}
                >

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
                    {paymentLabel()}
                  </p>

                  <p>
                    <strong>
                      Recebimento:
                    </strong>{" "}
                    {deliveryLabel()}
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

              </section>
            )}

            {/* ERRO */}

            {error && (
              <p
                style={{
                  color: "#ff7777",
                  marginTop: 20,
                }}
              >
                {error}
              </p>
            )}

            {/* AÇÕES */}

            <div className="checkout-actions">

              {step > 0 && (
                <button
                  type="button"
                  className="btn outline"
                  disabled={submitting}
                  onClick={() => {
                    setError("");

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

          </div>

          {/* ====================== */}
          {/* RESUMO LATERAL */}
          {/* ====================== */}

          <aside className="summary">

            <h2>
              RESUMO
            </h2>

            <div>
              <span>
                Subtotal
              </span>

              <span>
                {formatBRL(
                  subtotal
                )}
              </span>
            </div>

            <div>
              <span>
                TOTAL
              </span>

              <strong>
                {formatBRL(
                  subtotal
                )}
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
      </div>
    </div>
  );
}
