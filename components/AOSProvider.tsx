"use client";
import { useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css"; 

export default function AOSProvider() {
  useEffect(() => {
    AOS.init({ duration: 1000, once: true, easing: "ease-out-cubic", offset: 20 });
    const timeouts = [100, 500, 1000, 2000].map(t => setTimeout(() => AOS.refresh(), t));
    return () => timeouts.forEach(clearTimeout);
  }, []);
  return null; 
}