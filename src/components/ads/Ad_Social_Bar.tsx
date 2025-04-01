import { useEffect } from 'react';

export default function Banner() {
  useEffect(() => {
    // Crear el elemento script
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = '//pl26265634.effectiveratecpm.com/e6/8b/a8/e68ba8c508945fc866a99d90d6198921.js';
    script.async = true;
    
    // Añadir el script al final del body
    document.body.appendChild(script);
    
    // Limpiar cuando el componente se desmonte
    return () => {
      if (script && document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  // El div contenedor donde el script mostrará el anuncio
  return (
    <div id="ad-container" className="ad-social-bar"></div>
  );
}
