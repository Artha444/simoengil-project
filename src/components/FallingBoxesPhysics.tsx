"use client";

import React, { useEffect, useRef, useState } from "react";
import Script from "next/script";

export default function FallingBoxesPhysics() {
  const sceneRef = useRef<HTMLDivElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).Matter) {
      setIsLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!isLoaded || !sceneRef.current) return;

    const Matter = (window as any).Matter;
    if (!Matter) return;

    // Module aliases
    const Engine = Matter.Engine,
      Render = Matter.Render,
      Runner = Matter.Runner,
      MouseConstraint = Matter.MouseConstraint,
      Mouse = Matter.Mouse,
      Composite = Matter.Composite,
      Bodies = Matter.Bodies;

    // Create engine
    const engine = Engine.create();
    
    const width = sceneRef.current.clientWidth;
    const height = sceneRef.current.clientHeight;

    // Create renderer
    const render = Render.create({
      element: sceneRef.current,
      engine: engine,
      options: {
        width: width,
        height: height,
        background: "transparent",
        wireframes: false,
        pixelRatio: window.devicePixelRatio || 1,
      },
    });

    // Ensure the canvas fills the container and allows direct interaction
    render.canvas.style.position = 'absolute';
    render.canvas.style.top = '0';
    render.canvas.style.left = '0';
    render.canvas.style.width = width + 'px';
    render.canvas.style.height = height + 'px';
    render.canvas.style.touchAction = 'none';
    render.canvas.style.userSelect = 'none';
    render.canvas.style.msTouchAction = 'none';

    // Simoengil Brand Colors for boxes
    const colors = ["#FFB6C8", "#FF8FB1", "#E8B37D", "#FFF5F0", "#a5f3fc", "#fbcfe8", "#d8b4fe"];
    const texts = ["Simoengil", "Lucu", "Handmade", "Kuat", "Rapih", "Aman", "Gemoy"];
    
    const items: any[] = [];
    const numItems = Math.min(Math.floor(width / 80), 30); // Max 20 items
    
    for (let i = 0; i < numItems; i++) {
      const x = Math.random() * width;
      // Spawn boxes just below the ceiling (which is at y=-25, spanning to y=0)
      // We stagger them a bit so they fall naturally
      const y = Math.random() * (height / 2) + 50; 
      
      const text = texts[Math.floor(Math.random() * texts.length)];
      const color = colors[Math.floor(Math.random() * colors.length)];
      
      // We make the rectangle wide enough to hold the text
      const boxWidth = text.length * 15 + 40;
      const boxHeight = 50;

      items.push(
        Bodies.rectangle(x, y, boxWidth, boxHeight, {
          restitution: 0.8,
          chamfer: { radius: 25 }, // pill shape
          label: text, // custom label for text rendering
          render: { fillStyle: color, strokeStyle: '#ffffff', lineWidth: 3 },
        })
      );
    }

    // Create boundaries
    const wallOptions = { 
      isStatic: true, 
      render: { visible: false } 
    };

    const ground = Bodies.rectangle(width / 2, height + 25, width, 50, wallOptions);
    const leftWall = Bodies.rectangle(-25, height / 2, 50, height * 2, wallOptions);
    const rightWall = Bodies.rectangle(width + 25, height / 2, 50, height * 2, wallOptions);
    const ceiling = Bodies.rectangle(width / 2, -25, width, 50, wallOptions);

    Composite.add(engine.world, [...items, ground, leftWall, rightWall, ceiling]);

    // Add mouse control normally
    const mouse = Mouse.create(render.canvas);
    
    // Explicitly sync pixel ratio to prevent massive coordinate offsets on Retina/scaled displays
    const currentPixelRatio = window.devicePixelRatio || 1;
    mouse.pixelRatio = currentPixelRatio;
    render.canvas.setAttribute('data-pixel-ratio', String(currentPixelRatio));
    render.canvas.style.pointerEvents = 'auto'; // Explicitly set for the canvas
    
    // Prevent scrolling issues
    mouse.element.removeEventListener("mousewheel", mouse.mousewheel);
    mouse.element.removeEventListener("DOMMouseScroll", mouse.mousewheel);

    // Forward global window mouse events to the Matter.Mouse so dragging isn't interrupted 
    // when hovering over buttons or other pointer-events-auto elements!
    // (Note: touch events implicitly capture their target, so we don't need global touch listeners, 
    // which would actually break scrolling/clicking due to Matter.js calling preventDefault on touches)
    window.addEventListener('mousemove', mouse.mousemove as EventListener);
    window.addEventListener('mouseup', mouse.mouseup as EventListener);

    const mouseConstraint = MouseConstraint.create(engine, {
      mouse: mouse,
      constraint: {
        stiffness: 0.2,
        render: { visible: false },
      },
    });

    Composite.add(engine.world, mouseConstraint);
    render.mouse = mouse;

    // Custom drawing for text
    Matter.Events.on(render, 'afterRender', function() {
      const context = render.context;
      context.font = "bold 16px 'Inter', sans-serif";
      context.textAlign = "center";
      context.textBaseline = "middle";

      for (let i = 0; i < items.length; i++) {
        const body = items[i];
        if (body.label && body.render.visible) {
          context.translate(body.position.x, body.position.y);
          context.rotate(body.angle);
          
          context.fillStyle = "#2C2C2C"; 
          context.fillText(body.label, 0, 0);
          
          context.rotate(-body.angle);
          context.translate(-body.position.x, -body.position.y);
        }
      }
    });

    Render.run(render);
    
    const runner = Runner.create();
    Runner.run(runner, engine);

    // The canvas will sit behind z-10 elements (like buttons) and have pointer-events: auto.
    // This allows clicking buttons directly (1 click) and dragging boxes directly (1 click) without the need for hover logic, which breaks on mobile.

    // Handle window resize
    const handleResize = () => {
      if (!sceneRef.current) return;
      const newWidth = sceneRef.current.clientWidth;
      const newHeight = sceneRef.current.clientHeight;

      // Fix coordinate offset on resize by keeping pixelRatio intact
      const pixelRatio = window.devicePixelRatio || 1;
      render.canvas.width = newWidth * pixelRatio;
      render.canvas.height = newHeight * pixelRatio;
      render.canvas.style.width = newWidth + "px";
      render.canvas.style.height = newHeight + "px";
      
      render.options.width = newWidth;
      render.options.height = newHeight;
      
      Matter.Body.setPosition(ground, { x: newWidth / 2, y: newHeight + 25 });
      Matter.Body.setPosition(leftWall, { x: -25, y: newHeight / 2 });
      Matter.Body.setPosition(rightWall, { x: newWidth + 25, y: newHeight / 2 });
      Matter.Body.setPosition(ceiling, { x: newWidth / 2, y: -25 });
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', mouse.mousemove as EventListener);
      window.removeEventListener('mouseup', mouse.mouseup as EventListener);
      Render.stop(render);
      Runner.stop(runner);
      Composite.clear(engine.world, false);
      Engine.clear(engine);
      render.canvas.remove();
    };
  }, [isLoaded]);

  return (
    <>
      <Script 
        src="https://cdnjs.cloudflare.com/ajax/libs/matter-js/0.19.0/matter.min.js" 
        strategy="lazyOnload"
        onLoad={() => setIsLoaded(true)}
      />
      <div 
        ref={sceneRef} 
        className="absolute z-0 opacity-90"
        style={{ 
          top: 0,
          bottom: 0,
          left: 'calc(50% - 50vw)',
          width: '100vw',
          pointerEvents: 'auto',
          touchAction: 'none',
          msTouchAction: 'none',
        }}
      />
    </>
  );
}
