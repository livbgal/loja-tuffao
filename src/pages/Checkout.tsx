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
  const [submitError, setSubmitError] = useState("");

  const validCustomer =
    customer.name.trim().length >= 3 &&
    customer.whatsapp.replace(/\D/g, "").length >= 10 &&
    customer.email.includes("@") &&
    customer.cpf.replace(/\D/g, "").length === 11;

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

  function next() {
    setSubmitError("");

    if (step === 0 && !validCustomer) {
      setSubmitError(
        "Preencha corretamente nome, WhatsApp, e-mail e CPF."
      );
      return;
    }

    if (step === 1 && (!payment || !delivery)) {
      setSubmitError(
        "Escolha a forma de pagamento e a forma de recebimento."
      );
      return;
    }

    setStep((current) => Math.min(2, current + 1));
  }

  function paymentLabel() {
    if (payment === "pix") return "PIX";
    if (payment === "credito") return "Cartão de crédito";
    if (payment === "debito") return "Cartão de débito";
    return payment;
  }

  function deliveryLabel() {
    if (delivery === "retirada") return "Retirada com a equipe";
    if (delivery === "entrega") return "Entrega";
    return delivery;
  }

  /*
   * Gera um resumo completo do pedido.
   *
   * O dado mais importante está em item.pieces:
   * - piece.productName = modelo escolhido
   * - piece.size = tamanho escolhido
   */
  function buildFullOrderSummary() {
    return items
      .map((item, itemIndex) => {
        const pieces = item.pieces
          .map((piece, pieceIndex) => {
            return [
              `Peça ${pieceIndex + 1}`,
              `Modelo: ${piece.productName}`,
              `Tamanho: ${piece.size ?? "Não se aplica"}`,
            ].join(" | ");
          })
          .join("\n");

        return [
          `ITEM ${itemIndex + 1}`,
          `Produto/Combo: ${item.name}`,
          `Quantidade: ${item.quantity}`,
          `Valor unitário: ${formatBRL(item.unitPrice)}`,
          `Valor total: ${formatBRL(
            item.unitPrice * item.quantity
          )}`,
          pieces,
        ].join("\n");
      })
      .join("\n\n------------------------------\n\n");
  }

  /*
   * Campo separado, bem direto, para facilitar
   * conferência de produção.
   */
  function buildModelsAndSizesSummary() {
    return items
      .flatMap((item) =>
        item.pieces.map((piece) => {
          const size = piece.size
            ? ` — TAMANHO ${piece.size}`
            : "";

          return `${piece.productName}${size}`;
        })
      )
      .join("\n");
  }

  async function confirm() {
    if (submitting) return;

    if (!validCustomer || !payment || !delivery) {
      setSubmitError(
        "Revise os dados antes de confirmar o pedido."
      );
      return;
    }

    setSubmitting(true);
    setSubmitError("");

    const orderId = `TUF-${new Date().getFullYear()}-${Math.floor(
      Math.random() * 9000
    ) + 1000}`;

    const fullOrderSummary = buildFullOrderSummary();
    const modelsAndSizes = buildModelsAndSizesSummary();

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

    try {
      const formData = new FormData();

      formData.append(
        "_subject",
        `Novo pedido Loja Tuffão — ${orderId}`
      );

      formData.append("pedido", orderId);

      formData.append(
        "data",
        new Date().toLocaleString("pt-BR")
      );

      formData.append("nome", customer.name);
      formData.append("whatsapp", customer.whatsapp);
      formData.append("email", customer.email);
      formData.append("cpf", customer.cpf);

      formData.append(
        "pagamento",
        paymentLabel()
      );

      formData.append(
        "recebimento",
        deliveryLabel()
      );

      formData.append(
        "observacao",
        notes.trim() || "Nenhuma observação."
      );

      formData.append(
        "total",
        formatBRL(subtotal)
      );

      /*
       * REGISTRO COMPLETO
       */
      formData.append(
        "DETALHES COMPLETOS DO PEDIDO",
        fullOrderSummary
      );

      /*
       * CAMPO RESUMIDO PARA PRODUÇÃO
       */
      formData.append(
        "MODELOS E TAMANHOS",
        modelsAndSizes
      );

      /*
       * Quantidade total de unidades no carrinho.
       */
      const totalUnits = items.reduce(
        (sum, item) => sum + item.quantity,
        0
      );

      formData.append(
        "quantidade_total_de_itens",
        String(totalUnits)
      );

      const response = await fetch(
        FORMSPREE_URL,
        {
          method: "POST",
          headers: {
            Accept: "application/json",
          },
          body: formData,
        }
      );

      const result = await response
        .json()
        .catch(() => null);

      if (!response.ok) {
        console.error(
          "Erro Formspree:",
          result
        );

        throw new Error(
          result?.errors?.[0]?.message ||
            `O Formspree recusou o pedido. Código ${response.status}.`
        );
      }

      /*
       * Só salva e limpa o carrinho se o
       * Formspree confirmar o registro.
       */
      localStorage.setItem(
        "tuffao-last-order-v2",
        JSON.stringify(order)
      );

      clear();

      navigate("/confirmacao");
    } catch (error) {
      console.error(error);

      setSubmitError(
        error instanceof Error
          ? `Não foi possível registrar o pedido: ${error.message}`
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
        {["DADOS", "PAGAMENTO", "REVISÃO"].map(
          (label, index) => (
            <li
              className={
                step === index ? "active" : ""
              }
              key={label}
            >
              <small>
                ETAPA {index + 1}
              </small>

              <strong>{label}</strong>
            </li>
          )
        )}
      </ol>

      <div className="checkout-layout">
        <section className="checkout-content">
          {step === 0 && (
            <div className="checkout-section">
              <h2>DADOS DO COMPRADOR</h2>

              <label>
                <span>Nome completo</span>

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
              </label>

              <label>
                <span>WhatsApp</span>

                <input
                  placeholder="(21) 99999-9999"
                  value={customer.whatsapp}
                  onChange={(event) =>
                    setCustomer({
                      ...customer,
                      whatsapp:
                        event.target.value,
                    })
                  }
                />
              </label>

              <label>
                <span>E-mail</span>

                <input
                  placeholder="seuemail@email.com"
                  type="email"
                  value={customer.email}
                  onChange={(event) =>
                    setCustomer({
                      ...customer,
                      email: event.target.value,
                    })
                  }
                />
              </label>

              <label>
                <span>CPF</span>

                <input
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

          {step === 1 && (
            <div className="checkout-section">
              <h2>
                FORMA DE PAGAMENTO
              </h2>

              <div className="option-grid">
                {[
                  ["pix", "PIX"],
                  [
                    "credito",
                    "CARTÃO DE CRÉDITO",
                  ],
                  [
                    "debito",
                    "CARTÃO DE DÉBITO",
                  ],
                ].map(([id, label]) => (
                  <button
                    key={id}
                    type="button"
                    className={
                      payment === id
                        ? "active"
                        : ""
                    }
                    onClick={() =>
                      setPayment(id)
                    }
                  >
                    {label}
                  </button>
                ))}
              </div>

              <h2>
                COMO DESEJA RECEBER?
              </h2>

              <div className="option-grid">
                {[
                  [
                    "retirada",
                    "RETIRADA COM A EQUIPE",
                  ],
                  ["entrega", "ENTREGA"],
                ].map(([id, label]) => (
                  <button
                    key={id}
                    type="button"
                    className={
                      delivery === id
                        ? "active"
                        : ""
                    }
                    onClick={() =>
                      setDelivery(id)
                    }
                  >
                    {label}
                  </button>
                ))}
              </div>

              <label>
                <span>
                  Observação para a equipe
                </span>

                <textarea
                  placeholder="Observação para a equipe"
                  value={notes}
                  onChange={(event) =>
                    setNotes(event.target.value)
                  }
                />
              </label>
            </div>
          )}

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
            </div>
          )}

          {submitError && (
            <p
              className="form-error"
              role="alert"
            >
              {submitError}
            </p>
          )}

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
                  ? "REGISTRANDO PEDIDO..."
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
