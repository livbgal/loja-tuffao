import { Link } from "react-router-dom";

const WHATSAPP_URL =
  "https://wa.me/5521979239910?text=" +
  encodeURIComponent(
    "Olá! Finalizei um pedido na Loja Tuffão e gostaria de receber o link de pagamento."
  );

export function Confirmacao() {
  return (
    <div className="page confirmation">
      <div className="container">
        <small>PEDIDO REGISTRADO</small>

        <h1>Pedido recebido.</h1>

        <div className="notice">
          <p>
            Seu pedido foi registrado com sucesso.
          </p>

          <p>
            Agora entre em contato com a Tuffão pelo
            WhatsApp para receber o link de pagamento
            correspondente ao seu pedido.
          </p>
        </div>

        <div className="actions">
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noreferrer"
            className="btn primary"
          >
            RECEBER LINK DE PAGAMENTO
          </a>

          <Link
            to="/colecao"
            className="btn outline"
          >
            VOLTAR À COLEÇÃO
          </Link>
        </div>
      </div>
    </div>
  );
}
