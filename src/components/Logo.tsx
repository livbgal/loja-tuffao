export function Logo({compact=false}:{compact?:boolean}){
  return <div className="brand-logo">
    <img src="/assets/logo-tuffao.png" alt="Logo Tuffão Baja SAE" />
    {!compact && <strong>TUFFÃO <span>BAJA SAE</span></strong>}
  </div>;
}
