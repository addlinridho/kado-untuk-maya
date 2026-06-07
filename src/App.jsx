import React, { useState, useRef, useEffect, useMemo, Suspense } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

// ============================================================================
// REUSABLE TEXTURE GENERATOR FOR THREE.JS
// ============================================================================
function createHeartTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.moveTo(32, 20);
  ctx.bezierCurveTo(32, 6, 14, 6, 14, 26);
  ctx.bezierCurveTo(14, 42, 32, 56, 32, 58);
  ctx.bezierCurveTo(32, 56, 50, 42, 50, 26);
  ctx.bezierCurveTo(50, 6, 32, 6, 32, 20);
  ctx.fill();
  return new THREE.CanvasTexture(canvas);
}

// ============================================================================
// 1. KOMPONEN: HUJAN CINTA LEBAT (Z-INDEX DI BELAKANG SURAT)
// ============================================================================
function LoveRain() {
  const hearts = useMemo(() => {
    return Array.from({ length: 200 }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      delay: `${Math.random() * -6}s`,
      duration: `${2.5 + Math.random() * 3.5}s`,
      fontSize: `${14 + Math.random() * 24}px`, 
      opacity: 0.3 + Math.random() * 0.6,
    }));
  }, []);

  return (
    <div style={styles.rainContainer}>
      {hearts.map((heart) => (
        <span key={heart.id} style={{
            ...styles.heartParticle,
            left: heart.left,
            animationDelay: heart.delay,
            animationDuration: heart.duration,
            fontSize: heart.fontSize,
            opacity: heart.opacity,
          }}>❤️</span>
      ))}
    </div>
  );
}

// ============================================================================
// 2. KOMPONEN: BERUANG PINK 3D DEKAP HATI
// ============================================================================
function PinkLoveBear3D() {
  const bearGroupRef = useRef();
  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    if (bearGroupRef.current) {
      bearGroupRef.current.rotation.z = Math.sin(time * 2.5) * 0.12; 
      bearGroupRef.current.position.y = Math.sin(time * 5) * 0.02 - 0.4; 
    }
  });

  const heartMesh = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(0, 0);
    shape.bezierCurveTo(0.25, 0.25, 0.2, 0.5, 0, 0.5);
    shape.bezierCurveTo(-0.2, 0.5, -0.25, 0.25, 0, 0);
    const extrudeSettings = { depth: 0.15, bevelEnabled: true, bevelSegments: 5, steps: 1, bevelSize: 0.05, bevelThickness: 0.05 };
    const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    geometry.center(); 
    return geometry;
  }, []);

  return (
    <group ref={bearGroupRef} position={[0, -0.4, 0]} scale={[1.2, 1.2, 1.2]}>
      <mesh position={[0, 0.5, 0]}><sphereGeometry args={[0.38, 32, 32]} /><meshStandardMaterial color="#ffb6c1" roughness={0.6} /></mesh>
      <mesh position={[-0.28, 0.8, 0]}><sphereGeometry args={[0.12, 16, 16]} /><meshStandardMaterial color="#ff99aa" /></mesh>
      <mesh position={[0.28, 0.8, 0]}><sphereGeometry args={[0.12, 16, 16]} /><meshStandardMaterial color="#ff99aa" /></mesh>
      <mesh position={[0, 0.4, 0.32]}><sphereGeometry args={[0.1, 16, 16]} /><meshStandardMaterial color="#fff" /></mesh>
      <mesh position={[0, 0.43, 0.4]}><sphereGeometry args={[0.03, 16, 16]} /><meshStandardMaterial color="#000" /></mesh>
      <mesh position={[-0.12, 0.55, 0.33]}><sphereGeometry args={[0.03, 16, 16]} /><meshStandardMaterial color="#222" /></mesh>
      <mesh position={[0.12, 0.55, 0.33]}><sphereGeometry args={[0.03, 16, 16]} /><meshStandardMaterial color="#222" /></mesh>
      <mesh position={[0, -0.1, 0]}><cylinderGeometry args={[0.28, 0.42, 0.7, 32]} /><meshStandardMaterial color="#ffb6c1" roughness={0.6} /></mesh>
      <mesh geometry={heartMesh} position={[0, 0.05, 0.38]} rotation={[0, 0, Math.PI]} scale={[1.1, 1.1, 1.1]}><meshStandardMaterial color="#ff69b4" /></mesh>
      <mesh position={[-0.26, 0.05, 0.25]} rotation={[0.3, 0.5, Math.PI / 2.5]}><cylinderGeometry args={[0.07, 0.07, 0.35, 16]} /><meshStandardMaterial color="#ffb6c1" /></mesh>
      <mesh position={[0.26, 0.05, 0.25]} rotation={[0.3, -0.5, -Math.PI / 2.5]}><cylinderGeometry args={[0.07, 0.07, 0.35, 16]} /><meshStandardMaterial color="#ffb6c1" /></mesh>
    </group>
  );
}

// ============================================================================
// 3. SEGMEN FOTO FLAT ELEGAN
// ============================================================================
function AntiReflectivePhoto({ url, position, angle, globalOpacity }) {
  const texture = useLoader(THREE.TextureLoader, url);
  return (
    <mesh position={position} rotation={[0, -angle - Math.PI / 2, 0]}>
      <planeGeometry args={[0.45, 0.6]} />
      <meshBasicMaterial 
        map={texture} 
        side={THREE.DoubleSide} 
        toneMapped={false}
        transparent={true}
        opacity={globalOpacity}
      />
    </mesh>
  );
}

// ============================================================================
// BINTANG JATUH PREMIUM (GLOWING METEOR MESH WITH TRAIL)
// ============================================================================
function ShootingStars({ globalOpacity }) {
  const groupRef = useRef();
  const starCount = 6;

  const starsData = useMemo(() => {
    return Array.from({ length: starCount }).map(() => ({
      pos: new THREE.Vector3(
        (Math.random() - 0.5) * 30,
        10 + Math.random() * 8,
        (Math.random() - 0.5) * 30
      ),
      speed: 0.18 + Math.random() * 0.12,
      length: 1.5 + Math.random() * 1.5,
      scale: 0.015 + Math.random() * 0.02
    }));
  }, []);

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.children.forEach((mesh, i) => {
        const data = starsData[i];
        
        data.pos.x -= data.speed;
        data.pos.y -= data.speed * 0.9;
        data.pos.z += data.speed * 0.3;

        mesh.position.copy(data.pos);

        if (data.pos.y < -10) {
          data.pos.set(
            (Math.random() - 0.5) * 30,
            12 + Math.random() * 6,
            (Math.random() - 0.5) * 30
          );
        }
      });
    }
  });

  return (
    <group ref={groupRef}>
      {starsData.map((star, i) => (
        <mesh 
          key={i} 
          rotation={[0.6, 0, -0.7]} 
          scale={[star.scale, star.length, star.scale]}
        >
          <cylinderGeometry args={[0.1, 1, 2, 8]} />
          <meshBasicMaterial 
            color="#ffe4e1"
            transparent
            opacity={globalOpacity * 0.8}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      ))}
    </group>
  );
}

// ============================================================================
// DEBU KOSMIK BENTUK LOVE
// ============================================================================
function CosmicDust({ globalOpacity }) {
  const dustRef = useRef();
  const count = 1200;
  const heartTex = useMemo(() => createHeartTexture(), []);

  const [geo, initialY] = useMemo(() => {
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const yArr = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 22;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 10;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 22;
      yArr[i] = positions[i * 3 + 1];
    }
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    return [geometry, yArr];
  }, []);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    if (dustRef.current) {
      const arr = dustRef.current.geometry.attributes.position.array;
      for (let i = 0; i < count; i++) {
        arr[i * 3 + 1] = initialY[i] + Math.sin(time * 0.8 + i) * 0.3;
      }
      dustRef.current.geometry.attributes.position.needsUpdate = true;
      dustRef.current.rotation.y = time * 0.012;
    }
  });

  return (
    <points ref={dustRef} geometry={geo}>
      <pointsMaterial 
        color="#ff69b4" 
        size={0.25} 
        map={heartTex}
        transparent 
        opacity={globalOpacity * 0.65} 
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

// ============================================================================
// 4. COMPONENT: SEBARAN BINTANG KOSMIK LATAR BELAKANG
// ============================================================================
function SpaceBackgroundStars({ globalOpacity }) {
  const starsRef = useRef();
  
  const [starGeo] = useMemo(() => {
    const count = 3500;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const starPalette = [new THREE.Color('#ffffff'), new THREE.Color('#bae6fd'), new THREE.Color('#fef08a'), new THREE.Color('#f472b6')];
    
    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos((Math.random() * 2) - 1);
      const dist = 35 + Math.random() * 40;
      
      positions[i * 3] = dist * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = dist * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = dist * Math.cos(phi);

      const chosen = starPalette[Math.floor(Math.random() * starPalette.length)];
      colors[i * 3] = chosen.r;
      colors[i * 3 + 1] = chosen.g;
      colors[i * 3 + 2] = chosen.b;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    return [geo];
  }, []);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    if (starsRef.current) {
      starsRef.current.rotation.y = time * 0.005;
      starsRef.current.rotation.x = Math.sin(time * 0.002) * 0.05;
    }
  });

  return (
    <group ref={starsRef}>
      <points geometry={starGeo}>
        <pointsMaterial size={0.08} vertexColors transparent opacity={globalOpacity * 0.85} sizeAttenuation={true} />
      </points>
      <ambientLight intensity={0.6} />
    </group>
  );
}

// ============================================================================
// 5. GALAXY UTAMA & OPERASI KAMERA INTERPOLASI LERP (SUPER SMOOTH)
// ============================================================================
function SaturnLoveGalaxy({ photos, isEntering, doubleClicked, setDoubleClicked, setShowEndingTriggerButton }) {
  const mainGalaxyRef = useRef();
  const explosionRef = useRef();
  
  const [globalOpacity, setGlobalOpacity] = useState(0);
  const hasIntroFinished = useRef(false);
  const speedMultiplier = useRef(1);
  const cinematicTimeRef = useRef(0);

  const savedLookAt = useRef(new THREE.Vector3(0, -0.2, 0));
  const heartTexture = useMemo(() => createHeartTexture(), []);

  const coreGeometry = useMemo(() => {
    const count = 5000; 
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);
      const r = 1.3 * Math.cbrt(Math.random());
      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi);
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    return geo;
  }, []);

  const ringGeometry = useMemo(() => {
    const count = 13000; 
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const palette = [new THREE.Color('#f43f5e'), new THREE.Color('#d946ef'), new THREE.Color('#a855f7'), new THREE.Color('#818cf8'), new THREE.Color('#ec4899')];

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = 2.4 + Math.random() * 3.8; 
      positions[i * 3] = Math.cos(angle) * radius;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 0.2; 
      positions[i * 3 + 2] = Math.sin(angle) * radius;

      const pickedColor = palette[Math.floor(Math.random() * palette.length)];
      colors[i * 3] = pickedColor.r;
      colors[i * 3 + 1] = pickedColor.g;
      colors[i * 3 + 2] = pickedColor.b;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    return geo;
  }, []);

  const explosionData = useMemo(() => {
    const count = 2000;
    const positions = new Float32Array(count * 3);
    const velocities = [];
    for (let i = 0; i < count; i++) {
      positions[i * 3] = 0;
      positions[i * 3 + 1] = 0;
      positions[i * 3 + 2] = 0;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos((Math.random() * 2) - 1);
      const speed = 0.16 + Math.random() * 0.24;
      velocities.push(
        Math.sin(phi) * Math.cos(theta) * speed,
        Math.sin(phi) * Math.sin(theta) * speed,
        Math.cos(phi) * speed
      );
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    return { geo, velocities };
  }, []);

  useEffect(() => {
    if (doubleClicked) {
      cinematicTimeRef.current = 0;
    }
  }, [doubleClicked]);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();

    if (mainGalaxyRef.current) {
      mainGalaxyRef.current.rotation.y = time * 0.04 * speedMultiplier.current;
    }

    if (isEntering && !hasIntroFinished.current && !doubleClicked) {
      state.camera.position.z = THREE.MathUtils.lerp(state.camera.position.z, 9.5, 0.03);
      state.camera.position.y = THREE.MathUtils.lerp(state.camera.position.y, 4.2, 0.03);
      state.camera.lookAt(0, -0.2, 0);

      setGlobalOpacity((prev) => {
        if (prev < 1) return prev + 0.015;
        if (Math.abs(state.camera.position.z - 9.5) < 0.2) {
          hasIntroFinished.current = true;
        }
        return 1;
      });
    }

    if (doubleClicked) {
      speedMultiplier.current = THREE.MathUtils.lerp(speedMultiplier.current, 3.5, 0.02);
      cinematicTimeRef.current += 0.007; 

      const radiusCam = 6.5 + Math.sin(cinematicTimeRef.current * 1.2) * 1.8;
      const targetX = Math.sin(cinematicTimeRef.current * 1.3) * radiusCam;
      const targetZ = Math.cos(cinematicTimeRef.current * 1.3) * radiusCam;
      const targetY = 1.2 + Math.cos(cinematicTimeRef.current * 1.5) * 2.2;

      state.camera.position.x = THREE.MathUtils.lerp(state.camera.position.x, targetX, 0.04);
      state.camera.position.y = THREE.MathUtils.lerp(state.camera.position.y, targetY, 0.04);
      state.camera.position.z = THREE.MathUtils.lerp(state.camera.position.z, targetZ, 0.04);
      
      savedLookAt.current.x = THREE.MathUtils.lerp(savedLookAt.current.x, 0, 0.04);
      savedLookAt.current.y = THREE.MathUtils.lerp(savedLookAt.current.y, -0.2, 0.04);
      savedLookAt.current.z = THREE.MathUtils.lerp(savedLookAt.current.z, 0, 0.04);
      state.camera.lookAt(savedLookAt.current);
      
      if (explosionRef.current) {
        const arr = explosionRef.current.geometry.attributes.position.array;
        for (let i = 0; i < explosionData.velocities.length / 3; i++) {
          arr[i * 3] += explosionData.velocities[i * 3];
          arr[i * 3 + 1] += explosionData.velocities[i * 3 + 1];
          arr[i * 3 + 2] += explosionData.velocities[i * 3 + 2];
        }
        explosionRef.current.geometry.attributes.position.needsUpdate = true;
        explosionRef.current.material.opacity = THREE.MathUtils.lerp(explosionRef.current.material.opacity, 0, 0.008);
      }
    }
  });

  useEffect(() => {
    if (doubleClicked) {
      const resetTimer = setTimeout(() => {
        setDoubleClicked(false);
        speedMultiplier.current = 1;
        if (explosionRef.current) explosionRef.current.material.opacity = 1;
        const arr = explosionRef.current.geometry.attributes.position.array;
        for (let j = 0; j < arr.length; j++) arr[j] = 0;

        setShowEndingTriggerButton(true);
      }, 15000); 
      return () => clearTimeout(resetTimer);
    }
  }, [doubleClicked, setDoubleClicked, setShowEndingTriggerButton, explosionData]);

  return (
    <group>
      <SpaceBackgroundStars globalOpacity={globalOpacity} />
      <CosmicDust globalOpacity={globalOpacity} />
      <ShootingStars globalOpacity={globalOpacity} />

      <group ref={mainGalaxyRef}>
        <points geometry={coreGeometry}>
          <pointsMaterial 
            color="#d946ef" 
            size={0.18} 
            map={heartTexture} 
            transparent 
            opacity={0.85 * globalOpacity} 
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </points>

        <points geometry={ringGeometry}>
          <pointsMaterial 
            size={0.16} 
            vertexColors 
            map={heartTexture} 
            transparent 
            opacity={0.8 * globalOpacity} 
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </points>

        {doubleClicked && (
          <points ref={explosionRef} geometry={explosionData.geo}>
            <pointsMaterial 
              color="#ffe4e1" 
              size={0.3} 
              map={heartTexture} 
              transparent 
              opacity={1} 
              depthWrite={false}
            />
          </points>
        )}

        {photos.map((p, i) => (
          <Suspense key={i} fallback={null}>
            <AntiReflectivePhoto 
              url={p.url} 
              position={p.position} 
              angle={p.angle} 
              globalOpacity={globalOpacity}
            />
          </Suspense>
        ))}
      </group>
    </group>
  );
}

// KOMPONEN: Pembungkus Teks Kata demi Kata
function AnimatedTextWords({ text }) {
  if (!text) return null;
  const words = text.split(" ");
  return (
    <div style={styles.animatedTextHeaderBox}>
      {words.map((word, index) => (
        <span key={index} style={{ ...styles.singleWord, animationDelay: `${index * 0.5}s` }}>
          {word}&nbsp;
        </span>
      ))}
    </div>
  );
}

// ============================================================================
// 6. STRUKTUR UTAMA APLIKASI
// ============================================================================
export default function App() {
  const [step, setStep] = useState('welcomeIntro'); 
  const [isFadingOut, setIsFadingOut] = useState(false); // State baru untuk melenyapkan intro secara smooth
  const [countdownNum, setCountdownNum] = useState(3);
  const [textIndex, setTextIndex] = useState(0);
  
  const [envelopeOpen, setEnvelopeOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(-1);
  const [isFlipping, setIsFlipping] = useState(false);
  const [noBtnPos, setNoBtnPos] = useState({ top: 'auto', left: 'auto' });
  
  const [isGalaxyEntering, setIsGalaxyEntering] = useState(false);
  const [doubleClicked, setDoubleClicked] = useState(false);
  const [showEndingTriggerButton, setShowEndingTriggerButton] = useState(false);
  const [showEndingCard, setShowEndingCard] = useState(false);

  const audioRef = useRef(null);
  const openingTexts = ["HAPPY", "BIRTHDAY", "TO", "YOU", "SAYANGKU ❤️", "MAYA INTAN SARI ❤️"];

  const letterPages = [
    { title: "Surat Cinta Ku", isCover: true },
    { text: "Happy Birthday Sayangku ❤️", img1: "/images/1.jpeg", img2: "/images/2.jpeg" },
    { text: "Setiap hari bersamamu adalah anugerah terindah ✨", img1: "/images/3.jpeg", img2: "/images/4.jpeg" },
    { text: "Terima kasih sudah menjadi bagian terbaik di hidupku 🪐", img1: "/images/5.jpeg", img2: "/images/6.jpeg" },
    { text: "Tetaplah tersenyum manis seperti ini ya, Maya 🥰", img1: "/images/7.jpeg", img2: "/images/8.jpeg" },
    { text: "Semoga semua impianmu terkabul murni 💫", img1: "/images/9.jpeg", img2: "/images/10.jpeg" },
    { text: "You truly mean the world to me, forever 🌹", img1: "/images/11.jpeg", img2: "/images/12.jpeg" }
  ];

  const galaxyPhotos = useMemo(() => {
    return Array.from({ length: 42 }).map((_, i) => {
      const angle = (i / 42) * Math.PI * 2;
      const radius = 3.8 + Math.random() * 0.9; 
      return { 
        url: `/images/${(i % 12) + 1}.jpeg`, 
        position: [Math.cos(angle) * radius, (Math.random() - 0.5) * 0.3, Math.sin(angle) * radius],
        angle: angle
      };
    });
  }, []);

  useEffect(() => {
    audioRef.current = new Audio('/music.mp3');
    audioRef.current.loop = true;
  }, []);

  // Memulai aplikasi dengan meredupkan komponen secara elegan terlebih dahulu
  const startApp = () => {
    if (isFadingOut) return;
    setIsFadingOut(true);
    if (audioRef.current) audioRef.current.play().catch(e => console.log(e));

    // Jeda waktu tunggu animasi memudar selesai (600ms), baru ubah step ke countdown
    setTimeout(() => {
      setStep('countdown');
      setIsFadingOut(false);
    }, 600);
  };

  useEffect(() => {
    if (step === 'countdown') {
      const t = setInterval(() => {
        setCountdownNum(p => {
          if (p === 1) { clearInterval(t); setTimeout(() => setStep('textShow'), 800); return 1; }
          return p - 1;
        });
      }, 1800);
      return () => clearInterval(t);
    }
  }, [step]);

  useEffect(() => {
    if (step === 'textShow') {
      const t = setInterval(() => {
        setTextIndex(p => {
          if (p === openingTexts.length - 1) { clearInterval(t); setTimeout(() => setStep('guitarBear'), 2200); return p; }
          return p + 1;
        });
      }, 2000);
      return () => clearInterval(t);
    }
  }, [step]);

  const handleOpenEnvelope = () => {
    if (envelopeOpen) return;
    setEnvelopeOpen(true);
    setTimeout(() => {
      setStep('letterSwipe');
    }, 2500);
  };

  const handleFlip = () => {
    if (isFlipping) return;
    setIsFlipping(true);
    
    setTimeout(() => {
      if (currentPage < letterPages.length - 2) {
        setCurrentPage(p => p + 1);
        setIsFlipping(false);
      } else {
        setStep('letterCloseEffect');
        setTimeout(() => {
          setStep('loveHeart');
          setTimeout(() => setStep('askFavorite'), 5000); 
        }, 3500); 
      }
    }, 1200); 
  };

  return (
    <div style={styles.appContainer}>
      {step !== 'welcomeIntro' && step !== 'mainGalaxy' && <LoveRain />}

      {/* MODIFIKASI: Transisi Mulus Menggunakan Interpolasi Opacity (Anti Patah-Patah) */}
      {step === 'welcomeIntro' && (
        <div 
          style={{
            ...styles.fullscreenCenter, 
            opacity: isFadingOut ? 0 : 1, 
            transition: 'opacity 0.6s cubic-bezier(0.25, 1, 0.5, 1)',
            pointerEvents: isFadingOut ? 'none' : 'auto'
          }} 
          onClick={startApp}
        >
          <div style={styles.welcomeBoxOuter}>
            <div style={styles.welcomeHeartDecoration}>❤️</div>
            <h1 style={styles.welcomeMainHeading}>Mari mulai perjalanan indah ini</h1>
          </div>
          <p style={styles.tapText}>Ketuk di mana saja untuk mulai meluncur ✨</p>
        </div>
      )}

      {(step === 'countdown' || step === 'textShow') && (
        <div style={{...styles.fullscreenCenter, animation: 'boxScaleReveal 0.5s ease-out'}}>
          <div style={styles.giantText}>{step === 'countdown' ? countdownNum : openingTexts[textIndex]}</div>
        </div>
      )}

      {step === 'guitarBear' && (
        <div style={styles.fullscreenCenter} onClick={() => setStep('letterOpenEffect')}>
          <h2 style={styles.bearTitle}>HAPPY BIRTHDAY</h2>
          <div style={styles.canvasBearWrapper}><Canvas camera={{ position: [0, 0, 3.2] }}><ambientLight /><PinkLoveBear3D /></Canvas></div>
          <p style={styles.smallPrompt}>Ketuk untuk membuka surat ✉️</p>
        </div>
      )}

      {step === 'letterOpenEffect' && (
        <div style={styles.fullscreenCenter}>
          <div style={{...styles.envelopeContainer, animation: envelopeOpen ? 'fadeAwayOut 0.5s 2s forwards' : 'none'}} onClick={handleOpenEnvelope}>
            <div style={{...styles.envelopeFlap, transform: envelopeOpen ? 'rotateX(180deg)' : 'rotateX(0deg)', zIndex: envelopeOpen ? 1 : 5}} />
            <div style={styles.envelopeBody} />
            <div style={{...styles.envelopeLetterPaper, transform: envelopeOpen ? 'translateY(-130px) scale(1.05)' : 'translateY(0px)'}}>
              <span style={{fontSize: '24px'}}>✉️</span>
              <p style={{fontFamily: "'Great Vibes', cursive", margin: '5px 0 0 0', fontSize: '18px', color: '#333'}}>Untuk Maya...</p>
            </div>
            {!envelopeOpen && <div style={styles.envelopeSeal}><span style={{fontSize: '18px', animation: 'heartPulse 1.5s infinite'}}>❤️</span></div>}
          </div>
          {!envelopeOpen && <p style={styles.openPromptText}>Ketuk Amplop untuk Membuka Segel ✨</p>}
        </div>
      )}

      {step === 'letterSwipe' && (
        <div style={styles.fullscreenCenter}>
          <AnimatedTextWords key={currentPage} text={currentPage === -1 ? "" : letterPages[currentPage + 1].text} />
          <div style={styles.bookViewport} onClick={handleFlip}>
            <div style={styles.bookBody3D}>
              <div style={styles.staticPage}>
                {currentPage === -1 ? (
                   <div style={styles.pageInner}><div style={styles.photoFlex}><img src="/images/1.jpeg" style={styles.photo} /><img src="/images/2.jpeg" style={styles.photo} /></div></div>
                ) : (
                  letterPages[currentPage + 2] && (
                    <div style={styles.pageInner}><div style={styles.photoFlex}><img src={letterPages[currentPage + 2].img1} style={styles.photo} /><img src={letterPages[currentPage + 2].img2} style={styles.photo} /></div></div>
                  )
                )}
              </div>
              <div style={{...styles.flipPage, transform: isFlipping ? 'rotateY(-180deg)' : 'rotateY(0deg)'}}>
                <div style={styles.pageFront}>
                  {currentPage === -1 ? (
                    <div style={styles.coverStyle}><div style={styles.coverHeart}>❤️</div><div style={styles.coverText}>Surat Cinta Ku</div></div>
                  ) : (
                    <div style={styles.pageInner}><div style={styles.photoFlex}><img src={letterPages[currentPage + 1].img1} style={styles.photo} /><img src={letterPages[currentPage + 1].img2} style={styles.photo} /></div></div>
                  )}
                </div>
                <div style={styles.pageBack}></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {step === 'letterCloseEffect' && (
        <div style={styles.fullscreenCenter}>
          <div style={styles.closeLetterBox}>
            <p style={styles.closeLetterText}>With love, always. ✨</p>
            <div style={styles.waxSealStamp}><span style={styles.waxSealEmblem}>❤️</span></div>
            <p style={styles.closeSubText}>Surat selesai disegel...</p>
          </div>
        </div>
      )}

      {step === 'loveHeart' && (
        <div style={styles.fullscreenCenter}>
          <div style={styles.heartContainer}>
            {Array.from({ length: 12 }).map((_, i) => (
              <img key={i} src={`/images/${i + 1}.jpeg`} style={{ ...styles.heartNode, ...styles[`nodePos${i}`], animation: `popInHeartPhoto 0.6s ${i * 0.15}s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards` }} />
            ))}
          </div>
        </div>
      )}

      {step === 'askFavorite' && (
        <div style={styles.modal}>
          <div style={styles.transparentDialog}>
            <p style={{fontSize: '22px', margin: '0 0 20px 0'}}>Do you want to see my favorite person? ✨</p>
            <button onClick={() => setStep('galaxyGuide')} style={styles.btnYes}>Of course 😍</button>
            <button onMouseEnter={() => setNoBtnPos({ top: `${Math.random()*70}%`, left: `${Math.random()*70}%`, position: 'absolute' })} style={{...styles.btnNo, ...noBtnPos}}>No way 🤫</button>
          </div>
        </div>
      )}

      {step === 'galaxyGuide' && (
        <div style={styles.fullscreenCenter}>
          <div style={styles.staticGuideBox}>
            <h4 style={styles.hintTitle}>🌌 Petunjuk Navigasi Kosmik</h4>
            <div style={styles.hintRow}><span style={styles.hintIcon}>🖱️</span> <p><b>Geser Layar</b> untuk memutar sudut pandang semesta</p></div>
            <div style={styles.hintRow}><span style={styles.hintIcon}>🔍</span> <p><b>Cubit / Scroll</b> untuk memperbesar/kecil bebas tanpa terkunci</p></div>
            <div style={styles.hintRow}><span style={styles.hintIcon}>💖</span> <p><b>Klik 2x Cepat</b> untuk menikmati putaran sinematik multi-sudut selama 15 detik!</p></div>
            
            <button onClick={() => { setStep('mainGalaxy'); setIsGalaxyEntering(true); }} style={styles.btnLaunchGalaxy}>
              Mulai Galaksi Cinta Kita ❤️
            </button>
          </div>
        </div>
      )}

      {step === 'mainGalaxy' && (
        <div style={{ width: '100%', height: '100%', position: 'absolute' }} onDoubleClick={() => { if(!showEndingTriggerButton && !showEndingCard && !doubleClicked) setDoubleClicked(true); }}>
          <div style={styles.galaxyTitle}>Only For You "Maya Intan Sari" ❤️</div>
          
          <Canvas camera={{ position: [0, 48, 80], fov: 60 }}>
            <SaturnLoveGalaxy 
              photos={galaxyPhotos} 
              isEntering={isGalaxyEntering} 
              doubleClicked={doubleClicked}
              setDoubleClicked={setDoubleClicked}
              setShowEndingTriggerButton={setShowEndingTriggerButton}
            />
            <OrbitControls enableZoom={true} maxDistance={30} minDistance={1.8} enabled={!doubleClicked} />
          </Canvas>

          {showEndingTriggerButton && (
            <div style={styles.jedaClickOverlay}>
              <button 
                style={styles.btnTriggerEndingCard}
                onClick={() => { setShowEndingTriggerButton(false); setShowEndingCard(true); }}
              >
                Buka Pesan Terakhir dari Semesta ✨
              </button>
            </div>
          )}

          {showEndingCard && (
            <div style={styles.endingOverlay}>
              <div style={styles.endingCard}>
                <h3 style={styles.endingTitle}>Terima Kasih Telah Hadir di Semestaku ✨</h3>
                <p style={styles.endingQuote}>
                  "Jika cinta ini diibaratkan galaksi, maka kamu adalah pusat gravitasinya. 
                  Tempat di mana seluruh keindahan bintang berputar, dan tempat di mana hatiku menemukan rumahnya. 
                  Selamat ulang tahun, Maya Intan Sari. Tetaplah bersinar terang di hidupku selamanya. ❤️"
                </p>
                <button style={styles.btnRestart} onClick={() => { setShowEndingCard(false); setStep('welcomeIntro'); setEnvelopeOpen(false); setCurrentPage(-1); }}>
                  Mulai Ulang Keindahan 🔄
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// STYLING DAN CSS ANIMASI
// ============================================================================
const styles = {
  appContainer: { width: '100vw', height: '100vh', position: 'fixed', backgroundColor: '#000', color: '#fff', overflow: 'hidden', fontFamily: "'Caveat', cursive" },
  fullscreenCenter: { width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', position: 'absolute', zIndex: 10 },
  rainContainer: { position: 'absolute', width: '100%', height: '100%', overflow: 'hidden', pointerEvents: 'none', zIndex: 1 },
  heartParticle: { position: 'absolute', top: '-10%', animation: 'loveFall infinite linear', color: '#ff4b91' },
  
  welcomeBoxOuter: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '30px 20px', border: '2px solid rgba(255, 75, 145, 0.4)', borderRadius: '24px', backgroundColor: 'rgba(15, 10, 25, 0.6)', backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)', boxShadow: '0 15px 40px rgba(255, 75, 145, 0.15)', width: '85%', maxWidth: '365px', textAlign: 'center', animation: 'boxScaleReveal 0.7s ease-out' },
  welcomeHeartDecoration: { fontSize: '65px', color: '#ff4b91', marginBottom: '10px', animation: 'heartPulse 1.8s infinite ease-in-out' },
  welcomeMainHeading: { fontSize: '32px', color: '#fff', fontWeight: 'bold', margin: 0, letterSpacing: '0.3px', lineHeight: '1.3', textShadow: '0 0 10px rgba(255,75,145,0.6)' },
  tapText: { marginTop: '22px', color: '#a1a1aa', fontSize: '15px', fontFamily: 'sans-serif', letterSpacing: '0.5px' },
  
  giantText: { fontSize: '56px', fontWeight: 'bold', color: '#d946ef', textAlign: 'center', padding: '20px', textShadow: '0 0 20px rgba(217,70,239,0.6)' },
  canvasBearWrapper: { width: '300px', height: '300px' },
  bearTitle: { color: '#fff', textShadow: '0 0 10px #fff', textAlign: 'center' },
  smallPrompt: { color: '#555', fontSize: '12px' },

  envelopeContainer: { position: 'relative', width: '280px', height: '180px', backgroundColor: '#f4f4f5', borderRadius: '0 0 8px 8px', cursor: 'pointer', boxShadow: '0 20px 40px rgba(0,0,0,0.6)', perspective: '1000px' },
  envelopeFlap: { position: 'absolute', top: 0, left: 0, width: 0, height: 0, borderLeft: '140px solid transparent', borderRight: '140px solid transparent', borderTop: '100px solid #e4e4e7', transformOrigin: 'top', transition: 'transform 0.8s cubic-bezier(0.4, 0, 0.2, 1)', zIndex: 5 },
  envelopeBody: { position: 'absolute', bottom: 0, left: 0, width: '100%', height: '100%', backgroundColor: '#d4d4d8', clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%, 50% 50%)', borderRadius: '0 0 8px 8px', zIndex: 3 },
  envelopeLetterPaper: { position: 'absolute', bottom: '15px', left: '20px', width: '240px', height: '150px', backgroundColor: '#fff', borderRadius: '6px', boxShadow: '0 4px 10px rgba(0,0,0,0.15)', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', transition: 'transform 1.2s 0.6s cubic-bezier(0.25, 1, 0.5, 1)', zIndex: 2 },
  envelopeSeal: { position: 'absolute', top: '75px', left: '122px', width: '36px', height: '36px', backgroundColor: '#ff4b91', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', boxShadow: '0 4px 8px rgba(0,0,0,0.3)', zIndex: 6 },
  openPromptText: { marginTop: '25px', fontFamily: "'Playfair Display', serif", fontStyle: 'italic', color: '#f3f4f6', fontSize: '14px' },

  animatedTextHeaderBox: { 
    position: 'absolute', top: '7%', width: '85%', maxWidth: '420px', textAlign: 'center', 
    backgroundColor: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)',
    padding: '12px 18px', borderRadius: '14px', border: '2px solid #ffb6c1',
    boxShadow: '0 10px 30px rgba(255, 182, 193, 0.5)', display: 'flex', flexWrap: 'wrap', justifyContent: 'center', zIndex: 12
  },
  singleWord: {
    fontFamily: "'Caveat', cursive", fontSize: '28px', fontWeight: '700', color: '#e11d48',
    textShadow: '0 1px 1px rgba(255,255,255,0.5)', opacity: 0, transform: 'translateY(12px)',
    animation: 'wordFadeInUpSlow 0.9s forwards ease-out'
  },

  closeLetterBox: {
    display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
    backgroundColor: '#fff', padding: '40px 30px', borderRadius: '16px', border: '3px double #ff4b91',
    boxShadow: '0 20px 50px rgba(255,75,145,0.3)', animation: 'boxScaleReveal 0.8s forwards ease-out',
    width: '80%', maxWidth: '360px', textAlign: 'center'
  },
  closeLetterText: { fontSize: '36px', fontFamily: "'Great Vibes', cursive", color: '#000', marginBottom: '24px' },
  waxSealStamp: {
    width: '75px', height: '75px', backgroundColor: '#991b1b', borderRadius: '50%',
    display: 'flex', justifyContent: 'center', alignItems: 'center',
    boxShadow: 'inset 0 0 12px rgba(0,0,0,0.6), 0 4px 10px rgba(0,0,0,0.4)',
    border: '3px solid #7f1d1d', transform: 'scale(0)', animation: 'stampDown 0.6s 0.8s forwards cubic-bezier(0.175, 0.885, 0.32, 1.275)'
  },
  waxSealEmblem: { fontSize: '26px', filter: 'drop-shadow(0 2px 2px rgba(0,0,0,0.5))' },
  closeSubText: { color: '#666', fontSize: '14px', fontFamily: "'Playfair Display', serif", marginTop: '20px', fontStyle: 'italic' },

  bookViewport: { width: '320px', height: '320px', perspective: '1200px', marginTop: '75px', zIndex: 10 },
  bookBody3D: { width: '100%', height: '100%', position: 'relative', transformStyle: 'preserve-3d' },
  staticPage: { position: 'absolute', width: '100%', height: '100%', backgroundColor: '#fff', borderRadius: '0 14px 14px 0', borderLeft: '4px solid #cbd5e1', boxSizing: 'border-box' },
  flipPage: { position: 'absolute', width: '100%', height: '100%', transformStyle: 'preserve-3d', transformOrigin: 'left', transition: 'transform 1.6s cubic-bezier(0.25, 1, 0.5, 1)' },
  pageFront: { position: 'absolute', width: '100%', height: '100%', backgroundColor: '#fff', backfaceVisibility: 'hidden', borderRadius: '0 14px 14px 0', borderLeft: '4px solid #cbd5e1' },
  pageBack: { position: 'absolute', width: '100%', height: '100%', backgroundColor: '#f1f5f9', transform: 'rotateY(180deg)', backfaceVisibility: 'hidden', borderRadius: '14px 0 0 14px' },
  pageInner: { padding: '15px', color: '#000', textAlign: 'center', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', boxSizing: 'border-box' },
  photoFlex: { display: 'flex', gap: '8px', justifyContent: 'center', alignItems: 'center' },
  photo: { width: '47%', height: '180px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #e2e8f0' },

  coverStyle: { width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', backgroundColor: '#fdfbf7', color: '#000', borderRadius: '0 14px 14px 0', boxShadow: 'inset 5px 0 15px rgba(0,0,0,0.05)' },
  coverHeart: { fontSize: '75px', color: '#ff4b91', marginBottom: '8px', filter: 'drop-shadow(0 4px 6px rgba(255,75,145,0.3))', animation: 'heartPulse 2s infinite ease-in-out' },
  coverText: { fontSize: '36px', fontFamily: "'Great Vibes', cursive", color: '#333333' },

  heartContainer: { position: 'relative', width: '300px', height: '260px', zIndex: 10 },
  heartNode: { width: '65px', height: '65px', position: 'absolute', borderRadius: '12px', objectFit: 'cover', border: '2px solid #fff', boxShadow: '0 4px 12px rgba(0,0,0,0.4)', opacity: 0, transform: 'scale(0)' },
  
  modal: { position: 'absolute', width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.4)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 100 },
  transparentDialog: { backgroundColor: 'rgba(34, 34, 34, 0.65)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.15)', padding: '30px', borderRadius: '20px', textAlign: 'center', width: '85%', maxWidth: '340px', boxShadow: '0 15px 35px rgba(0,0,0,0.5)' },
  btnYes: { backgroundColor: '#ff4b91', border: 'none', color: '#fff', padding: '10px 20px', borderRadius: '5px', margin: '10px', cursor: 'pointer', fontWeight: 'bold' },
  btnNo: { backgroundColor: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff', padding: '10px 20px', borderRadius: '5px', margin: '10px' },
  
  galaxyTitle: { position: 'absolute', top: '4%', width: '100%', textAlign: 'center', fontSize: '24px', letterSpacing: '0.5px', textShadow: '0 0 12px rgba(217,70,239,0.7)', zIndex: 10, color: '#fff', fontWeight: 'bold' },

  staticGuideBox: {
    backgroundColor: 'rgba(15, 8, 32, 0.95)', border: '2px solid rgba(217, 70, 239, 0.5)',
    borderRadius: '20px', padding: '25px 30px', width: '85%', maxWidth: '400px',
    boxShadow: '0 20px 60px rgba(0,0,0,0.85), 0 0 30px rgba(217,70,239,0.25)', 
    color: '#f3f4f6', display: 'flex', flexDirection: 'column', alignItems: 'stretch',
    animation: 'boxScaleReveal 0.6s ease-out forwards', zIndex: 10
  },
  hintTitle: { margin: '0 0 16px 0', fontSize: '20px', color: '#f5d0fe', textAlign: 'center', fontFamily: 'sans-serif', fontWeight: '600' },
  hintRow: { display: 'flex', alignItems: 'center', gap: '14px', margin: '12px 0', fontSize: '14px', fontFamily: 'sans-serif', lineHeight: '1.5', color: '#e5e7eb' },
  hintIcon: { fontSize: '18px', filter: 'drop-shadow(0 0 5px rgba(217,70,239,0.6))' },
  btnLaunchGalaxy: { marginTop: '22px', backgroundColor: '#ff4b91', border: 'none', color: '#fff', padding: '14px 20px', borderRadius: '10px', fontSize: '18px', fontWeight: '700', fontFamily: "'Caveat', cursive", cursor: 'pointer', letterSpacing: '0.5px', boxShadow: '0 4px 15px rgba(255,75,145,0.4)', animation: 'heartPulse 2s infinite ease-in-out' },

  jedaClickOverlay: { position: 'absolute', bottom: '12%', width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 45, animation: 'boxScaleReveal 0.5s ease-out' },
  btnTriggerEndingCard: { backgroundColor: '#ff4b91', border: 'none', color: '#fff', padding: '16px 26px', borderRadius: '12px', fontSize: '20px', fontWeight: 'bold', fontFamily: "'Caveat', cursive", cursor: 'pointer', boxShadow: '0 8px 25px rgba(255,75,145,0.6)', animation: 'heartPulse 1.5s infinite ease-in-out' },

  endingOverlay: { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 50, animation: 'boxScaleReveal 0.8s ease-out forwards' },
  endingCard: { backgroundColor: 'rgba(20, 15, 35, 0.75)', border: '2px solid #ff4b91', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', borderRadius: '24px', padding: '35px 25px', width: '85%', maxWidth: '380px', textAlign: 'center', boxShadow: '0 25px 50px rgba(255, 75, 145, 0.25)' },
  endingTitle: { fontFamily: 'sans-serif', fontSize: '20px', color: '#f5d0fe', margin: '0 0 16px 0', fontWeight: '600' },
  endingQuote: { fontFamily: "'Caveat', cursive", fontSize: '24px', lineHeight: '1.4', color: '#ffe4e1', margin: '0 0 25px 0' },
  btnRestart: { backgroundColor: 'transparent', border: '2px solid #ff4b91', color: '#fff', padding: '10px 18px', borderRadius: '8px', fontSize: '15px', fontFamily: 'sans-serif', fontWeight: 'bold', cursor: 'pointer', transition: 'background-color 0.3s' },

  nodePos0: { left: '118px', top: '35px', zIndex: 10 },    
  nodePos1: { left: '68px', top: '15px', zIndex: 9 },     
  nodePos2: { left: '22px', top: '38px', zIndex: 8 },     
  nodePos3: { left: '5px', top: '88px', zIndex: 7 },      
  nodePos4: { left: '22px', top: '140px', zIndex: 6 },    
  nodePos5: { left: '68px', top: '188px', zIndex: 5 },    
  nodePos6: { left: '118px', top: '220px', zIndex: 11 },   
  nodePos7: { left: '168px', top: '188px', zIndex: 5 },   
  nodePos8: { left: '213px', top: '140px', zIndex: 6 },   
  nodePos9: { left: '230px', top: '88px', zIndex: 7 },     
  nodePos10: { left: '213px', top: '38px', zIndex: 8 },    
  nodePos11: { left: '168px', top: '15px', zIndex: 9 },    
};

if (typeof document !== 'undefined') {
  const linkFont = document.createElement("link");
  linkFont.rel = "stylesheet";
  linkFont.href = "https://fonts.googleapis.com/css2?family=Caveat:wght@700&family=Great+Vibes&family=Playfair+Display:ital,wght@0,600;1,600&display=swap";
  document.head.appendChild(linkFont);

  const style = document.createElement("style");
  style.innerText = `
    @keyframes loveFall { 0% { top: -10%; transform: rotate(0deg) } 100% { top: 110%; transform: rotate(360deg) } }
    @keyframes wordFadeInUpSlow {
      from { opacity: 0; transform: translateY(15px); filter: blur(2px); }
      to { opacity: 1; transform: translateY(0); filter: blur(0); }
    }
    @keyframes heartPulse {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.05); }
    }
    @keyframes boxScaleReveal {
      from { opacity: 0; transform: scale(0.95); }
      to { opacity: 1; transform: scale(1); }
    }
    @keyframes stampDown {
      0% { transform: scale(3); opacity: 0; }
      100% { transform: scale(1); opacity: 1; }
    }
    @keyframes fadeAwayOut {
      from { opacity: 1; transform: scale(1); }
      to { opacity: 0; transform: scale(0.95); pointer-events: none; }
    }
    @keyframes popInHeartPhoto {
      from { opacity: 0; transform: scale(0) rotate(-10deg); }
      to { opacity: 1; transform: scale(1) rotate(0deg); }
    }
  `;
  document.head.appendChild(style);
}