import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { formatBRL } from "../catalog";
import { useCart } from "../cart";

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

  const validCustomer =
    customer.name.trim().length >= 3 &&
    customer.whatsapp.replace(/\D/g, "").length >= 10 &&
    customer.email.includes("@") &&
    customer.cpf.replace(/\D/g, "").length === 11;

  if (!hydrated) {
    return (
      <div className="page">
        <div className="container">
          <p>Carregando...</p>
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

            <Link to="/colecao" className="btn primary">
              VOLTAR À COLEÇÃO
            </Link>
          </div>
        </div>
      </div>
    );
  }

  function next() {
    if (step === 0 && !validCustomer) {
      alert("Preencha corretamente os dados do comprador.");
      return;
    }

    if (step === 1 && (!payment || !delivery)) {
      alert("Escolha pagamento e recebimento.");
      return;
    }

    setStep((current) => Math.min(2, current + 1));
  }

  async function confirm() {
    const order = {
      id: `TUF-${new Date().getFullYear()}-${
        Math.floor(Math.random() * 9000) + 1000
      }`,
      items,
      total: subtotal,
      customer,
      payment,
      delivery,
      notes,
    };

    localStorage.setItem(
      "tuffao-last-order-v2",
      JSON.stringify(order)
    );

    try {
      await fetch("https://formspree.io/f/xdenabro", {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },

        body: JSON.stringify({
          pedido: order.id,
          nome: customer.name,
          whatsapp: customer.whatsapp,
          email: customer.email,
          cpf: customer.cpf,
          pagamento: payment,
          recebimento: delivery,
          observacao: notes,
          total: formatBRL(subtotal),

          itens: items
            .map(
              (item) =>
                `${item.quantity}x ${item.name}`
            )
            .join(", "),
        }),
      });
    } catch (error) {
      console.error(error);
    }

    clear();

    navigate("/confirmacao");
  }

  return (
    <div className="page">
      <div className="container">
        <small>CARRINHO / CHECKOUT</small>

        <h1>CHECKOUT</h1>

        <ol className="steps">
          {["DADOS", "PAGAMENTO", "REVISÃO"].map(
            (label, index) => (
              <li
               
