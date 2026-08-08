type ProductImageProps = {
  src?: string;
  label: string;
  wide?: boolean;
};
export function ProductImage({
  src,
  label,
  wide = false,
}: ProductImageProps) {
  if (src) {
    return (
      <div className={`product-image ${wide ? "wide" : ""}`}>
        <img src={src} alt={label} />
      </div>
    );
  }
  return (
    <div
      className={`product-image placeholder ${wide ? "wide" : ""}`}
      role="img"
      aria-label={`${label}: imagem em breve`}
    >
      <span>IMAGEM EM BREVE</span>
      <strong>{label}</strong>
    </div>
  );
}
