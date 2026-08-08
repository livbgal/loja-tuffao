# Loja Tuffão Baja SAE

Projeto React + TypeScript + Vite, reconstruído a partir da estrutura enviada e já com as imagens oficiais disponíveis.

## Rodar localmente

```bash
npm install
npm run dev
```

## Gerar versão de produção

```bash
npm run build
```

## Publicar

O projeto pode ser importado no GitHub e publicado pela Vercel ou Netlify.

## Imagens

As imagens ficam em `public/assets`.

- `logo-tuffao.png`
- `camisa-torcida-preta.jpeg`
- `camisa-torcida-branca.jpeg`
- `moletom.jpeg`
- `copo-termico.jpeg`

A Camisa Box continua com um placeholder identificado. Quando a imagem estiver pronta, adicione-a em `public/assets` e preencha o campo `image` do produto no arquivo `src/catalog.ts`.

## Pagamento

O checkout registra o pedido somente no navegador. Ele ainda não processa Pix ou cartão. Antes de abrir as vendas, conecte um gateway de pagamento e um backend/banco de dados.

## Fonte

A fonte dos títulos é `Saira Condensed` e a fonte dos textos é `Barlow`, carregadas pelo Google Fonts. Para testar outras fontes, altere apenas o `@import` e as declarações de fonte no início de `src/styles.css`.
