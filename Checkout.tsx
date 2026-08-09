import { Link } from "react-router-dom";

const WHATSAPP_URL =
  "https://wa.me/5521979239910?text=" +
  encodeURIComponent(
    "Olá! Finalizei um pedido na Loja Tuffão e gostaria de receber o link de pagamento."
  );

export function Confirmacao() {
  return (
    <main className="page-shell">
      <section className="checkout-success">
        <p className="eyebrow">PEDIDO REGISTRADO</p>

        <h1>Pedido recebido.</h1>

        <p>
          Seu pedido foi registrado. Entre em contato com a Tuffão pelo
          WhatsApp para receber o link de pagamento correspondente ao valor
          da compra.
        </p>

        <a
          href={WHATSAPP_URL}
          target="_blank"
          rel="noreferrer"
          className="btn primary"
        >
          RECEBER LINK DE PAGAMENTO
        </a>

        <Link to="/colecao" className="btn outline">
          VOLTAR À COLEÇÃO
        </Link>
      </section>
    </main>
  );
}
