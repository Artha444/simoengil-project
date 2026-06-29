"use client";

import React, { useEffect, useRef, useState } from "react";
import Script from "next/script";

interface FallingBoxesPhysicsProps {
  active?: boolean;
}

export default function FallingBoxesPhysics({ active = true }: FallingBoxesPhysicsProps) {
  const sceneRef = useRef<HTMLDivElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).Matter) {
      setIsLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!isLoaded || !sceneRef.current || !active) return;

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

    // Create engine with sleep enabled so idle boxes don't drain CPU
    const engine = Engine.create({
      enableSleeping: true,
    });
    
    const width = sceneRef.current.clientWidth;
    const height = sceneRef.current.clientHeight;

    // Cap pixel ratio at 2 — retina 3x is wasteful for decorative boxes
    const cappedPixelRatio = Math.min(window.devicePixelRatio || 1, 2);

    // Create renderer
    const render = Render.create({
      element: sceneRef.current,
      engine: engine,
      options: {
        width: width,
        height: height,
        background: "transparent",
        wireframes: false,
        pixelRatio: cappedPixelRatio,
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
    
    // Create boundaries first (static, zero cost)
    const wallOptions = { 
      isStatic: true, 
      render: { visible: false } 
    };

    const ground = Bodies.rectangle(width / 2, height + 25, width, 50, wallOptions);
    const leftWall = Bodies.rectangle(-25, height / 2, 50, height * 2, wallOptions);
    const rightWall = Bodies.rectangle(width + 25, height / 2, 50, height * 2, wallOptions);
    const ceiling = Bodies.rectangle(width / 2, -25, width, 50, wallOptions);

    Composite.add(engine.world, [ground, leftWall, rightWall, ceiling]);

    // Spawn boxes in staggered batches so physics doesn't spike
    const items: any[] = [];
    const numItems = Math.min(Math.floor(width / 80), 24);
    const batchSize = 4;
    let spawnIndex = 0;

    function spawnNextBatch() {
      const remaining = numItems - spawnIndex;
      if (remaining <= 0) return;

      const count = Math.min(batchSize, remaining);
      for (let i = 0; i < count; i++) {
        const x = Math.random() * width;
        const y = Math.random() * (height / 2) + 50;
        const text = texts[Math.floor(Math.random() * texts.length)];
        const color = colors[Math.floor(Math.random() * colors.length)];
        const boxWidth = text.length * 15 + 40;
        const boxHeight = 50;

        const body = Bodies.rectangle(x, y, boxWidth, boxHeight, {
          restitution: 0.8,
          chamfer: { radius: 25 },
          label: text,
          render: { fillStyle: color, strokeStyle: '#ffffff', lineWidth: 3 },
        });
        items.push(body);
        Composite.add(engine.world, body);
        spawnIndex++;
      }
    }

    // First batch immediately, then rest staggered
    spawnNextBatch();
    const spawnTimer = setInterval(spawnNextBatch, 250);

    // Add mouse control normally
    const mouse = Mouse.create(render.canvas);
    mouse.pixelRatio = cappedPixelRatio; // must match render pixelRatio for correct hit detection
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
      render.canvas.width = newWidth * cappedPixelRatio;
      render.canvas.height = newHeight * cappedPixelRatio;
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
      clearInterval(spawnTimer);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', mouse.mousemove as EventListener);
      window.removeEventListener('mouseup', mouse.mouseup as EventListener);
      Render.stop(render);
      Runner.stop(runner);
      Composite.clear(engine.world, false);
      Engine.clear(engine);
      render.canvas.remove();
    };
  }, [isLoaded, active]);

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
