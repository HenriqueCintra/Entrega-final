import React, {useEffect, useRef, useState} from "react"; //o useRef cria uma referenca para acessar diretamente um elemento HTML e o useEffect é um hook do react para rodar o código depois que o componente renderiza.
import kaplay from "kaplay";
import './galeria.css'
import { data } from "autoprefixer";

const Galeria = () => {
    const containerRef = useRef(null); //containerRef é uma referência que aponta para o container onde kaplay vai agir
                        // useRef(null) inicializa essa referência como null.
    const kaplayIniciado = useRef(false)

    const [imagens,setImagens] = useState([]);


    //Puxa as imagens dos gatinhos antes de montar a cena
    useEffect(() => {

        fetch('https://api.thecatapi.com/v1/images/search?limit=12')
            .then((res) => res.json())
            .then((data) =>{
                const urls = data.map((img) => img.url);
                setImagens(urls);
            });

    }, []);


  useEffect(() => {
    if (kaplayIniciado.current || imagens.length===0) return;
  
    kaplay({
      container: containerRef.current,
      items: '.item',
      gutter: 16,
      animate: true,
      duration: 500,
      easing: 'ease-in-out',
    });
  
    kaplayIniciado.current = true;
  }, [imagens]);
  

return(
    <div className="galeria" ref={containerRef}>
        {imagens.map((src,i) => (
            <div key={i} className="item">
                <img src={src} alt={`gato-${i}`}/>
            </div>
        ))}
    </div>
);

};

export default Galeria;
