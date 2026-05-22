'use client';

import React, { useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import SplitType from 'split-type';

export const GSAPInitializer: React.FC = () => {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Check if device is mobile to avoid complex animations & layout shift
    const isMobile = window.innerWidth < 768;
    if (isMobile) {
      return;
    }

    // Register ScrollTrigger plugin
    gsap.registerPlugin(ScrollTrigger);

    const splitInstances: SplitType[] = [];

    const ctx = gsap.context(() => {
      // --- 1. HERO HEADLINE ANIMATION ---
      try {
        const heroTitle = document.querySelector('.gsap-hero-title');
        const heroSubtitle = document.querySelector('.gsap-hero-subtitle');
        const heroCtas = document.querySelector('.gsap-hero-ctas');

        if (heroTitle) {
          const splitTitle = new SplitType(heroTitle as HTMLElement, {
            types: 'words,chars',
            tagName: 'span',
          });
          splitInstances.push(splitTitle);

          if (heroSubtitle) gsap.set(heroSubtitle, { opacity: 0, y: 20 });
          if (heroCtas) gsap.set(heroCtas, { opacity: 0, y: 20 });

          gsap.from(splitTitle.chars, {
            y: 40,
            opacity: 0,
            scale: 0.95,
            duration: 0.8,
            stagger: 0.02,
            ease: 'power3.out',
            onComplete: () => {
              if (heroSubtitle) {
                gsap.to(heroSubtitle, {
                  opacity: 1,
                  y: 0,
                  duration: 0.6,
                  ease: 'power3.out',
                  onComplete: () => {
                    if (heroCtas) {
                      gsap.to(heroCtas, { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out' });
                    }
                  }
                });
              } else if (heroCtas) {
                gsap.to(heroCtas, { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' });
              }
            },
          });
        }
      } catch (error) {
        console.error('Error initializing hero animations:', error);
      }

      // --- 2. SECTION TITLES ---
      try {
        const sectionTitles = document.querySelectorAll('.gsap-section-title');
        sectionTitles.forEach((title) => {
          try {
            const splitSectionTitle = new SplitType(title as HTMLElement, {
              types: 'words',
              tagName: 'span',
            });
            splitInstances.push(splitSectionTitle);

            const tl = gsap.timeline({
              scrollTrigger: {
                trigger: title,
                start: 'top 85%',
                toggleActions: 'play none none none',
              },
            });

            tl.from(splitSectionTitle.words, {
              y: 30,
              opacity: 0,
              duration: 0.8,
              stagger: 0.05,
              ease: 'power3.out',
            });

            const underline = title.querySelector('.gsap-underline');
            if (underline) {
              tl.fromTo(
                underline,
                { width: '0%' },
                { width: '100%', duration: 0.8, ease: 'expo.out' },
                '-=0.4'
              );
            }
          } catch (innerError) {
            console.error('Error splitting section title:', innerError);
          }
        });
      } catch (error) {
        console.error('Error initializing section titles:', error);
      }

      // --- 3. SCROLL-TRIGGERED REVEAL ELEMENTS ---
      try {
        const revealElements = document.querySelectorAll('.gsap-reveal');
        revealElements.forEach((el) => {
          const effect = el.getAttribute('data-effect') || 'fade-up';
          const delay = parseFloat(el.getAttribute('data-delay') || '0');
          
          let fromVars: gsap.TweenVars = {
            opacity: 0,
            scrollTrigger: {
              trigger: el,
              start: 'top 85%',
              toggleActions: 'play none none reverse',
            },
          };

          if (effect === 'fade-up') {
            fromVars = { ...fromVars, y: 40, scale: 0.95, duration: 1.0, ease: 'power3.out', delay };
          } else if (effect === 'fade-slide-right') {
            fromVars = { ...fromVars, x: -40, duration: 1.2, ease: 'power3.out', delay };
          } else if (effect === 'pop-bounce') {
            fromVars = { ...fromVars, scale: 0.5, y: 20, duration: 0.8, ease: 'back.out(1.7)', delay };
          } else if (effect === 'blur') {
            fromVars = { ...fromVars, filter: 'blur(10px)', y: 20, duration: 1.0, ease: 'power2.out', delay };
          } else if (effect === 'fade-in') {
            fromVars = { ...fromVars, duration: 0.8, ease: 'power2.out', delay };
          }

          gsap.from(el, fromVars);
        });
      } catch (error) {
        console.error('Error initializing reveal elements:', error);
      }

      // --- 3.5 STAGGERED GRID REVEALS ---
      try {
        const staggerGrids = document.querySelectorAll('.gsap-stagger-grid');
        staggerGrids.forEach((grid) => {
          const children = grid.children;
          gsap.from(children, {
            y: 30,
            opacity: 0,
            scale: 0.95,
            duration: 0.8,
            stagger: 0.1,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: grid,
              start: 'top 80%',
              toggleActions: 'play none none reverse',
            }
          });
        });
      } catch (error) {
        console.error('Error initializing stagger grids:', error);
      }
    }); // End of gsap.context

    // --- 4. IMAGE LOAD & TIMEOUT TRIGGER SYNC ---
    const handleImageLoad = () => {
      ScrollTrigger.refresh();
    };

    const imgs = document.querySelectorAll('img');
    imgs.forEach((img) => {
      if (img.complete) {
        ScrollTrigger.refresh();
      } else {
        img.addEventListener('load', handleImageLoad);
      }
    });

    const timeouts = [100, 500, 1000, 2000, 3000].map((t) => 
      setTimeout(() => ScrollTrigger.refresh(), t)
    );

    // Cleanup function
    return () => {
      ctx.revert(); // This safely kills all ScrollTriggers and reverts all GSAP animations inside the context!
      
      splitInstances.forEach((instance) => {
        try {
          instance.revert();
        } catch (e) {
          console.warn('Failed to revert SplitType instance:', e);
        }
      });

      imgs.forEach((img) => {
        img.removeEventListener('load', handleImageLoad);
      });

      timeouts.forEach(clearTimeout);
    };
  }, []);

  return null;
};
