async function confirmOrder() {
  if (!validCustomer || !payment || !delivery) {
    setSubmitError("Revise os dados do pedido antes de confirmar.");
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
    "https://wa.me/5521979239910?text=" +
    encodeURIComponent(whatsappMessage);

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
    const formData = new FormData();

    formData.append("_subject", `Novo pedido Tuffão — ${orderId}`);
    formData.append("pedido", orderId);
    formData.append("nome", customer.name);
    formData.append("email", customer.email);
    formData.append("_replyto", customer.email);
    formData.append("whatsapp", customer.whatsapp);
    formData.append("pagamento", paymentLabel);
    formData.append("recebimento", deliveryLabel);
    formData.append(
      "observacoes",
      notes.trim() || "Nenhuma observação."
    );
    formData.append("itens", itemsSummary);
    formData.append("total", formatBRL(subtotal));
    formData.append(
      "data",
      new Date().toLocaleString("pt-BR")
    );

    const response = await fetch(
      "https://formspree.io/f/xdenabro",
      {
        method: "POST",
        body: formData,
        headers: {
          Accept: "application/json",
        },
      }
    );

    const result = await response.json().catch(() => null);

    if (!response.ok) {
      console.error("Erro do Formspree:", result);

      throw new Error(
        result?.errors?.[0]?.message ||
          `O Formspree recusou o pedido. Código ${response.status}.`
      );
    }

    localStorage.setItem(
      "tuffao-last-order-v2",
      JSON.stringify(order)
    );

    clear();

    window.location.assign(whatsappUrl);
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
