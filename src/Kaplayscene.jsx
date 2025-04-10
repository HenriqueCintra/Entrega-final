import React, { useEffect, useRef } from 'react';
import kaplay from 'kaplay';

const KaplayScene = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    console.log('🟢 Criando cena básica...');

    const scene = kaplay({
      canvas: canvasRef.current,
      background: '#f0f0f0',
      autoStart: true,
    });

    if (!scene || typeof scene.spawn !== 'function') {
      console.error('❌ Falha ao criar a cena ou método spawn não existe.');
      return;
    }

    console.log('✅ Cena criada. Adicionando entidades...');

    const truck = scene.spawn('rect', {
      x: 60,
      y: 80,
      width: 80,
      height: 40,
      fill: '#3b82f6',
    });

    scene.spawn('rect', {
      x: 200,
      y: 80,
      width: 40,
      height: 40,
      fill: '#ef4444',
      isStatic: true,
    });

    scene.onUpdate(() => {
      truck.move(1, 0);
    });
  }, []);

  return (
    <canvas
      ref={canvasRef}
      width={400}
      height={200}
      style={{ display: 'block', margin: '0 auto', border: '2px solid #ccc' }}
    />
  );
};

export default KaplayScene;
