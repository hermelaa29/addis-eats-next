'use client';

import { useState, useEffect, useRef, useMemo } from "react";
import Link from "next/link";
import { useCartStore } from "@/store/cartStore";
import { useDishesStore } from "@/store/dishesStore";
import DishCard from "@/components/DishCard";
import { Spinner } from "@/components/ui/States";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

import useSWR from "swr";
import { fetcher } from "@/lib/dishes";
import { useAdminModifications } from "@/store/dishesStore";

const LOOP_WORDS = ["Good energy.", "Great taste.", "delicious food.", "Pure joy."];

export default function HomeClient({ fallbackData }) {
  const { data: baseDishes, error, isLoading } = useSWR('/menu-data.json', fetcher, { 
    fallbackData,
    revalidateOnMount: false, // Prevent mount-time network fetch
    revalidateOnFocus: false,
    revalidateIfStale: false,
    revalidateOnReconnect: false,
    dedupingInterval: 1000 * 60 * 60 * 24,
  });
  
  const mods = useAdminModifications();
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
    if (fallbackData && Array.isArray(fallbackData) && fallbackData.length > 0) {
      try {
        localStorage.setItem("addis-eats-cache:/menu-data.json", JSON.stringify(fallbackData));
      } catch {}
    }
  }, [fallbackData]);

  const data = useMemo(() => {
    if (!baseDishes) return [];
    if (!mounted) return baseDishes; // Prevent hydration mismatch on initial render
    let active = baseDishes.filter((d) => !mods.removed.includes(d.id));
    active = active.map((d) => (mods.updated[d.id] ? { ...d, ...mods.updated[d.id] } : d));
    return [...active, ...mods.added];
  }, [baseDishes, mods, mounted]);

  const specials = data?.slice(0, 3) || [];
  const itemCount = useCartStore((state) => state.getItemCount());

  const heroRef = useRef(null);
  const valuesRef = useRef(null);
  const dishSectionRef = useRef(null);
  const orderAdRef = useRef(null);
  const loopRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Hero entrance
      gsap.from(".hero-copy > *:not(h1)", {
        y: 50,
        opacity: 0,
        duration: 0.9,
        stagger: 0.12,
        ease: "power3.out",
        delay: 0.15,
      });

      gsap.from(".hero-copy h1 > span.hero-static-text", {
        y: 50,
        opacity: 0,
        duration: 0.9,
        ease: "power3.out",
        delay: 0.2,
      });

      // Looping hero text
      const words = loopRef.current?.querySelectorAll(".hero-loop-word");
      if (words && words.length > 0) {
        let currentIndex = 0;
        gsap.set(words[0], { opacity: 1, y: 0 });

        const loopTimeline = () => {
          const current = words[currentIndex];
          const nextIndex = (currentIndex + 1) % words.length;
          const next = words[nextIndex];

          gsap
            .timeline()
            .to(current, {
              y: -50,
              opacity: 0,
              duration: 0.5,
              ease: "power2.in",
            })
            .set(next, { y: 50, opacity: 0 })
            .to(next, {
              y: 0,
              opacity: 1,
              duration: 0.6,
              ease: "power2.out",
              onComplete: () => {
                currentIndex = nextIndex;
                gsap.delayedCall(2.2, loopTimeline);
              },
            });
        };

        gsap.delayedCall(2.5, loopTimeline);
      }

      // Dish section — slide heading
      if (dishSectionRef.current) {
        gsap.from(
          dishSectionRef.current.querySelectorAll(".section-heading > *"),
          {
            scrollTrigger: {
              trigger: dishSectionRef.current,
              start: "top 85%",
              toggleActions: "play none none reverse",
            },
            x: -60,
            opacity: 0,
            duration: 0.7,
            stagger: 0.1,
            ease: "power3.out",
            delay: 0.1,
          }
        );

        const cards =
          dishSectionRef.current.querySelectorAll(".dish-card");
        cards.forEach((card, index) => {
          gsap.from(card, {
            scrollTrigger: {
              trigger: card,
              start: "top 90%",
              toggleActions: "play none none reverse",
            },
            y: 60,
            opacity: 0,
            duration: 0.7,
            ease: "power3.out",
            delay: 0.1 + index * 0.1,
          });
        });
      }

      // Values
      if (valuesRef.current) {
        const valueItems = valuesRef.current.querySelectorAll(":scope > div");
        valueItems.forEach((item, i) => {
          gsap.from(item, {
            scrollTrigger: {
              trigger: item,
              start: "top 88%",
              toggleActions: "play none none reverse",
            },
            x: i % 2 === 0 ? -80 : 80,
            opacity: 0,
            duration: 0.8,
            ease: "power3.out",
            delay: 0.1,
          });
        });
      }

      // Order ad section
      if (orderAdRef.current) {
        gsap.from(orderAdRef.current.querySelector(".order-now-inner"), {
          scrollTrigger: {
            trigger: orderAdRef.current,
            start: "top 85%",
            toggleActions: "play none none reverse",
          },
          y: 50,
          opacity: 0,
          duration: 0.9,
          ease: "power3.out",
          delay: 0.1,
        });
      }
    }, heroRef);

    return () => ctx.revert();
  }, [isLoading]);

  return (
    <main ref={heroRef}>
      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">A taste of home, delivered</p>
          <h1>
            <span className="hero-static-text">Good food.</span>
            <br />
            <span className="hero-loop-container" ref={loopRef}>
              {LOOP_WORDS.map((word, i) => (
                <em
                  key={word}
                  className={`hero-loop-word${i === 0 ? " active" : ""}`}
                >
                  {word}
                </em>
              ))}
            </span>
          </h1>
          <p className="hero-text">
            Thoughtful Ethiopian dishes, made with local ingredients and sent
            across Addis with a little extra care.
          </p>
          <Link className="button button-dark" href="/menu">
            Explore the menu <span>↗</span>
          </Link>
          <div className="hero-note">
            <span>✦</span>
            <span>
              Join {mounted && itemCount ? "your growing" : "the"} table.
              <br />
              <b>Fresh food, zero fuss.</b>
            </span>
          </div>
        </div>
        <div className="hero-visual">
          <div className="plate plate-back">🌶️</div>
          <div className="plate plate-main">🍛</div>
          <div className="hero-stamp">
            Made
            <br />
            <strong>in Addis</strong>
          </div>
          <span className="scribble">delicious ↓</span>
        </div>
      </section>

      <section className="home-section" ref={dishSectionRef}>
        <div className="section-heading">
          <div>
            <p className="eyebrow">From our kitchen</p>
            <h2>Today's table</h2>
          </div>
          <Link className="arrow-link" href="/menu">
            See full menu <span>→</span>
          </Link>
        </div>
        {isLoading ? (
          <Spinner label="Setting the table" />
        ) : (
          <div className="dish-grid">
            {specials.map((dish) => (
              <DishCard key={dish.id} dish={dish} />
            ))}
          </div>
        )}
      </section>

      <section className="values" ref={valuesRef}>
        <div>
          <span className="value-number">01</span>
          <h3>Rooted here</h3>
          <p>
            Recipes, produce and stories from the neighbourhoods we call home.
          </p>
        </div>
        <div>
          <span className="value-number">02</span>
          <h3>Made with care</h3>
          <p>
            Every order is cooked fresh, packed thoughtfully and ready for your
            day.
          </p>
        </div>
        <div>
          <span className="value-number">03</span>
          <h3>For your table</h3>
          <p>
            Food tastes better shared. Bring a little Addis to wherever you are.
          </p>
        </div>
      </section>

      <section className="order-now-ad" ref={orderAdRef}>
        <div className="order-now-inner">
          <p className="eyebrow">Don't miss out</p>
          <h2>
            Order now, <em>taste Addis</em>
          </h2>
          <p>
            From injera to tibs, every dish is crafted with generations of
            tradition and delivered fresh to your door. Your next favourite meal
            is just a tap away.
          </p>
          <Link className="button button-dark" href="/menu">
            Order now <span>↗</span>
          </Link>
          <div className="order-now-badge">
            <span>✦</span> Free delivery on first order
          </div>
        </div>
      </section>
    </main>
  );
}
