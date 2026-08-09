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
      <main class
