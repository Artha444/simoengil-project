"use client";

import React, { useState, useEffect, useRef } from "react";

export default function CustomScrollbar() {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  
  const trackRef = useRef<HTMLDivElement>(null);
  const dragStartRef = useRef({ startY: 0, startScrollProgress: 0 });

  useEffect(() => {
    setMounted(true);

    const handleScroll = () => {
      // Don't overwrite state from scroll events if currently dragging
      if (dragStartRef.current.startY !== 0) return;
      
      const scrollHeight = document.documentElement.scrollHeight;
      const clientHeight = document.documentElement.clientHeight;
      const totalScrollable = scrollHeight - clientHeight;
      
      if (totalScrollable <= 0) {
        setScrollProgress(0);
        return;
      }

      const progress = window.scrollY / totalScrollable;
      setScrollProgress(Math.min(1, Math.max(0, progress)));
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, []);

  const trackHeight = 220;
  const thumbHeight = 35;
  const travelRange = trackHeight - thumbHeight; // 185px

  // Drag handlers
  const handleThumbMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    setIsDragging(true);
    dragStartRef.current = {
      startY: e.clientY,
      startScrollProgress: scrollProgress,
    };

    document.body.style.userSelect = "none"; // Prevent text highlight during drag
    
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  };

  const handleMouseMove = (e: MouseEvent) => {
    const deltaY = e.clientY - dragStartRef.current.startY;
    const deltaProgress = deltaY / travelRange;
    const newProgress = Math.min(1, Math.max(0, dragStartRef.current.startScrollProgress + deltaProgress));
    
    setScrollProgress(newProgress);
    
    const scrollHeight = document.documentElement.scrollHeight;
    const clientHeight = document.documentElement.clientHeight;
    const totalScrollable = scrollHeight - clientHeight;
    
    window.scrollTo(0, newProgress * totalScrollable);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    dragStartRef.current = { startY: 0, startScrollProgress: 0 };
    document.body.style.userSelect = "";
    
    window.removeEventListener("mousemove", handleMouseMove);
    window.removeEventListener("mouseup", handleMouseUp);
  };

  // Track click handler (scrolls directly to clicked percentage)
  const handleTrackClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!trackRef.current) return;
    
    // Ignore if clicking the thumb itself (handled by mousedown)
    if ((e.target as HTMLElement).closest('[data-scrollbar-thumb]')) return;

    const rect = trackRef.current.getBoundingClientRect();
    const clickY = e.clientY - rect.top;
    
    // Center the thumb on the click position
    const targetProgress = Math.min(1, Math.max(0, (clickY - thumbHeight / 2) / travelRange));
    
    setScrollProgress(targetProgress);
    
    const scrollHeight = document.documentElement.scrollHeight;
    const clientHeight = document.documentElement.clientHeight;
    const totalScrollable = scrollHeight - clientHeight;
    
    window.scrollTo({
      top: targetProgress * totalScrollable,
      behavior: "smooth",
    });
  };

  if (!mounted) return null;

  return (
    <div 
      className="fixed right-3 md:right-6 top-1/2 -translate-y-1/2 w-6 h-[220px] z-50 hidden sm:flex items-center justify-center select-none"
      style={{ touchAction: "none" }}
    >
      {/* Scrollbar Track (Wider target area to make clicking easier) */}
      <div 
        ref={trackRef}
        onClick={handleTrackClick}
        className="w-full h-full flex items-center justify-center group/track cursor-pointer"
      >
        {/* Core track line */}
        <div className="w-[3px] h-full bg-[#FF8FB1]/20 group-hover/track:bg-[#FF8FB1]/40 rounded-full relative transition-colors duration-300">
          {/* Glowing Scrollbar Thumb (Capsule style) */}
          <div 
            data-scrollbar-thumb
            onMouseDown={handleThumbMouseDown}
            className={`absolute rounded-full left-1/2 -translate-x-1/2 cursor-grab active:cursor-grabbing ${
              isDragging 
                ? "w-[8px] h-[35px] bg-[#FF7DA5] shadow-[0_0_12px_#FF7DA5]" 
                : "w-[6px] h-[35px] bg-[#FF8FB1] shadow-[0_0_8px_#FF8FB1] hover:bg-[#FF7DA5] hover:shadow-[0_0_10px_#FF7DA5] hover:w-[8px]"
            }`}
            style={{ 
              transform: `translateY(${scrollProgress * travelRange}px) translateX(-50%)`,
              transitionProperty: "transform, width, height, background-color, box-shadow",
              transitionDuration: "75ms, 200ms, 200ms, 200ms, 200ms",
            }}
          />
        </div>
      </div>
    </div>
  );
}
