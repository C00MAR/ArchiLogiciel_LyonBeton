'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from "next-auth/react";
import Link from "next/link";
import styles from './Hero.module.scss';

interface HeroProps {
  videoSrc?: string;
  fallbackImage?: string;
  title?: string;
  navigation?: Array<{
    label: string;
    href: string;
  }>;
  collections?: Array<{
    name: string;
    category?: string;
  }>;
  showScrollIndicator?: boolean;
}

export default function Hero({
  videoSrc = '/assets/home_vid.webm',
  title = "LYON BETON",
  navigation = [
    { label: "BOUTIQUE", href: "/products" },
    { label: "PANIER", href: "/cart" },
    { label: "COMPTE", href: "/login" }
  ],
  collections = [
    { name: "BERKSHIRE", category: "PROJETS" },
    { name: "NEW DICE", category: "COLLECTIONS" },
    { name: "RETROFUTUR", category: "PROJETS" },
    { name: "LB FEAT. PAPOTTE", category: "PROJETS" },
    { name: "STRUT", category: "SHOOTING SESSIONS" },
    { name: "TWIST", category: "COLLECTIONS" },
    { name: "SOFFFA", category: "COLLAB" },
    { name: "L'ARBUISSONIËRE", category: "SHOOTING SESSIONS" }
  ],
}: HeroProps) {
  const { data: session } = useSession();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const [isVideoError, setIsVideoError] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoadedData = () => {
      setIsVideoLoaded(true);
      video.play().catch(() => {
        setIsVideoError(true);
      });
    };

    video.load();

    video.addEventListener('loadeddata', handleLoadedData);

    return () => {
      video.removeEventListener('loadeddata', handleLoadedData);
    };
  }, [videoSrc]);

  return (
    <section className={styles.hero}>
      <div className={styles.videoContainer}>
        {!isVideoError && (
          <video
            ref={videoRef}
            className={styles.video}
            src={videoSrc}
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            data-loaded={isVideoLoaded}
          />
        )}

        <div className={styles.overlay} />
      </div>

      <div className={styles.content}>
        <div className={styles.titleContainer}>
          <h1 className={styles.mainTitle}>{title}</h1>
        </div>

        <nav className={styles.navigation}>
          <div className={styles.navContainer}>
            {navigation.map((item, index) => {
              if (item.label === "COMPTE") {
                return (
                  <Link
                    key={index}
                    href={session ? "/account" : "/login"}
                    className={styles.navItem}
                  >
                    {session ? "COMPTE" : "SE CONNECTER"}
                  </Link>
                );
              }

              return (
                <Link
                  key={index}
                  href={item.href}
                  className={styles.navItem}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
        </nav>

        <div className={styles.collectionsGrid}>
          {collections.map((collection, index) => (
            <div key={index} className={styles.collectionItem}>
              {collection.category && (
                <span className={styles.category}>{collection.category}</span>
              )}
              <h2 className={styles.collectionName}>{collection.name}</h2>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}