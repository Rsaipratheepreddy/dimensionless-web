'use client';

import React, { useRef, useState, useEffect, useMemo } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { OrbitControls, Stars, Html } from '@react-three/drei';
import * as THREE from 'three';
import { useTheme } from '../contexts/ThemeContext';
import { IconSearch } from '@tabler/icons-react';

interface RealisticEarth3DProps {
    latitude: number;
    longitude: number;
    className?: string;
    onLocationClick?: () => void;
    searchQuery?: string;
    onSearchChange?: (query: string) => void;
    searchResults?: string[];
    onStudioSelect?: (studio: string) => void;
}

// Convert lat/lng to 3D coordinates on sphere
const latLngToVector3 = (lat: number, lng: number, radius: number = 5) => {
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lng + 180) * (Math.PI / 180);

    const x = -(radius * Math.sin(phi) * Math.cos(theta));
    const y = radius * Math.cos(phi);
    const z = radius * Math.sin(phi) * Math.sin(theta);

    return new THREE.Vector3(x, y, z);
};

// Realistic Earth with multiple texture layers
const RealisticEarthSphere: React.FC<{ latitude: number; longitude: number; onLocationClick?: () => void; highlightPin?: boolean }> = ({
    latitude,
    longitude,
    onLocationClick,
    highlightPin = false
}) => {
    const earthRef = useRef<THREE.Mesh>(null);
    const cloudsRef = useRef<THREE.Mesh>(null);
    const atmosphereRef = useRef<THREE.Mesh>(null);
    const { theme } = useTheme();

    // Load NASA satellite Earth texture with real geography
    const earthDayTexture = useLoader(THREE.TextureLoader, '/earth-satellite.jpg');

    // Setup texture properties for maximum clarity
    useMemo(() => {
        earthDayTexture.wrapS = earthDayTexture.wrapT = THREE.ClampToEdgeWrapping;
        earthDayTexture.anisotropy = 16;
        earthDayTexture.minFilter = THREE.LinearFilter;
        earthDayTexture.magFilter = THREE.LinearFilter;
        earthDayTexture.flipY = false;
    }, [earthDayTexture]);

    // Rotation animation
    useFrame((state, delta) => {
        if (earthRef.current) {
            earthRef.current.rotation.y += delta * 0.02; // Slow realistic rotation
        }
        if (cloudsRef.current) {
            cloudsRef.current.rotation.y += delta * 0.025; // Clouds move slightly faster
        }
        if (atmosphereRef.current) {
            atmosphereRef.current.rotation.y += delta * 0.01;
        }
    });

    // Location marker position
    const markerPosition = latLngToVector3(latitude, longitude, 5.15);

    // Artistic Earth material with creative effects
    const earthMaterial = useMemo(() => {
        return new THREE.ShaderMaterial({
            uniforms: {
                earthTexture: { value: earthDayTexture },
                time: { value: 0 },
                colorShift: { value: new THREE.Vector3(1.2, 1.1, 1.3) },
                artisticIntensity: { value: 0.8 }
            },
            vertexShader: `
                varying vec2 vUv;
                varying vec3 vNormal;
                varying vec3 vPosition;
                
                void main() {
                    vUv = uv;
                    vNormal = normalize(normalMatrix * normal);
                    vPosition = position;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform sampler2D earthTexture;
                uniform float time;
                uniform vec3 colorShift;
                uniform float artisticIntensity;
                
                varying vec2 vUv;
                varying vec3 vNormal;
                varying vec3 vPosition;
                
                void main() {
                    vec3 earthColor = texture2D(earthTexture, vUv).rgb;
                    
                    // Artistic color enhancement
                    earthColor.r *= colorShift.x;
                    earthColor.g *= colorShift.y;
                    earthColor.b *= colorShift.z;
                    
                    // Add artistic glow based on viewing angle
                    float fresnel = 1.0 - dot(normalize(vNormal), vec3(0.0, 0.0, 1.0));
                    vec3 artisticGlow = vec3(0.4, 0.6, 1.0) * fresnel * artisticIntensity;
                    
                    // Creative edge enhancement
                    float edge = pow(fresnel, 2.0);
                    vec3 edgeColor = vec3(0.8, 0.4, 1.0) * edge * 0.3;
                    
                    // Final artistic composition
                    vec3 finalColor = earthColor + artisticGlow + edgeColor;
                    finalColor = mix(earthColor, finalColor, artisticIntensity);
                    
                    gl_FragColor = vec4(finalColor, 1.0);
                }
            `
        });
    }, [earthDayTexture]);

    return (
        <group>
            {/* Main Earth sphere with realistic textures */}
            <mesh ref={earthRef} material={earthMaterial}>
                <sphereGeometry args={[5, 128, 64]} />
            </mesh>

            {/* Artistic Cloud layer */}
            <mesh ref={cloudsRef}>
                <sphereGeometry args={[5.03, 64, 32]} />
                <meshBasicMaterial
                    color="#e0f0ff"
                    transparent
                    opacity={0.2}
                />
            </mesh>

            {/* Atmospheric glow */}
            <mesh ref={atmosphereRef}>
                <sphereGeometry args={[5.1, 32, 16]} />
                <meshBasicMaterial
                    color={new THREE.Color(0.3, 0.6, 1.0)}
                    transparent
                    opacity={0.15}
                    side={THREE.BackSide}
                    blending={THREE.AdditiveBlending}
                />
            </mesh>

            {/* Company Logo Pin */}
            <group position={markerPosition}>
                {/* Logo background circle */}
                <mesh position={[0, 0, 0]} onClick={onLocationClick}>
                    <cylinderGeometry args={[highlightPin ? 0.15 : 0.12, highlightPin ? 0.15 : 0.12, 0.02, 32]} />
                    <meshPhongMaterial
                        color={highlightPin ? "#ffffff" : "#f8fafc"}
                        shininess={100}
                        transparent
                        opacity={0.95}
                        emissive={highlightPin ? "#fbbf24" : "#000000"}
                        emissiveIntensity={highlightPin ? 0.2 : 0}
                    />
                </mesh>

                {/* Logo image overlay */}
                <Html distanceFactor={4} position={[0, 0.01, 0]}>
                    <div
                        className={`logo-pin ${highlightPin ? 'highlight' : ''}`}
                        onClick={onLocationClick}
                        style={{ cursor: 'pointer' }}
                    >
                        <img
                            src={theme === 'dark' ? '/logo-white.png' : '/logo-black.png'}
                            alt="Dimensionless Studios"
                            className="logo-pin-image"
                        />
                    </div>
                </Html>

                {/* Artistic energy rings with gradient colors */}
                {[0.15, 0.25, 0.35, 0.45, 0.55].map((radius, index) => (
                    <mesh key={index} rotation={[Math.PI / 2, 0, 0]}>
                        <ringGeometry args={[radius, radius + (highlightPin ? 0.04 : 0.02), 32]} />
                        <meshBasicMaterial
                            color={highlightPin ?
                                ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7'][index] :
                                (theme === 'dark' ? '#fbbf24' : '#ff6b6b')
                            }
                            transparent
                            opacity={highlightPin ?
                                (0.8 - index * 0.1) :
                                (0.4 - index * 0.06)
                            }
                            side={THREE.DoubleSide}
                        />
                    </mesh>
                ))}

                {/* Highlight glow effect */}
                {highlightPin && (
                    <mesh>
                        <sphereGeometry args={[0.8, 16, 16]} />
                        <meshBasicMaterial
                            color="#60a5fa"
                            transparent
                            opacity={0.1}
                            side={THREE.BackSide}
                        />
                    </mesh>
                )}

                {/* Bangalore studio label */}
                <Html distanceFactor={6} position={[0, 0.4, 0]}>
                    <div className={`enhanced-pin-label ${highlightPin ? 'highlight' : ''}`}>
                        <span>Dimensionless Studios</span>
                        <div className="location-subtitle">Bangalore, India</div>
                    </div>
                </Html>
            </group>
        </group>
    );
};

// Galaxy background with realistic stars
const GalaxyBackground: React.FC = () => {
    return (
        <group>
            {/* Galaxy stars */}
            <Stars
                radius={80}
                depth={50}
                count={3000}
                factor={4}
                saturation={0}
                fade
                speed={0.3}
            />

            {/* Additional distant stars */}
            <Stars
                radius={120}
                depth={100}
                count={2000}
                factor={2}
                saturation={0}
                fade
                speed={0.1}
            />
        </group>
    );
};

// Main realistic Earth component
const RealisticEarth3D: React.FC<RealisticEarth3DProps> = ({
    latitude,
    longitude,
    className = '',
    onLocationClick,
    searchQuery = '',
    onSearchChange,
    searchResults = [],
    onStudioSelect
}) => {
    const [mounted, setMounted] = useState(false);
    const [showTitles, setShowTitles] = useState(true);
    const [showMainTitle, setShowMainTitle] = useState(false);
    const [showSubTitle, setShowSubTitle] = useState(false);
    const [showEarth, setShowEarth] = useState(false);
    const [showSearch, setShowSearch] = useState(false);
    const [highlightPin, setHighlightPin] = useState(false);
    const { theme } = useTheme();

    useEffect(() => {
        setMounted(true);

        // Cinematic sequence
        const timer1 = setTimeout(() => setShowMainTitle(true), 500);
        const timer2 = setTimeout(() => setShowSubTitle(true), 2000);
        const timer3 = setTimeout(() => setShowTitles(false), 4000);
        const timer4 = setTimeout(() => setShowEarth(true), 4500);
        const timer5 = setTimeout(() => setHighlightPin(true), 6500);
        const timer6 = setTimeout(() => setShowSearch(true), 7500);

        return () => {
            clearTimeout(timer1);
            clearTimeout(timer2);
            clearTimeout(timer3);
            clearTimeout(timer4);
            clearTimeout(timer5);
            clearTimeout(timer6);
        };
    }, []);

    if (!mounted) {
        return (
            <div className={`realistic-earth-loading ${className}`}>
                <div className="loading-spinner">
                    <div className="spinner-ring"></div>
                    <div className="loading-text">Loading Dimensionless Planet...</div>
                </div>
            </div>
        );
    }

    return (
        <div className={`fullscreen-earth-experience ${className}`}>
            {/* Cinematic Title Sequence */}
            {showTitles && (
                <div className="cinematic-overlay">
                    <div className={`cinematic-title main-title ${showMainTitle ? 'show' : ''}`}>
                        Dimen Planet
                    </div>
                    <div className={`cinematic-title sub-title ${showSubTitle ? 'show' : ''}`}>
                        An Art Studio
                    </div>
                </div>
            )}

            {/* Full Screen Earth Canvas */}
            {showEarth && (
                <div className={`earth-canvas ${showEarth ? 'show' : ''}`}>
                    <Canvas
                        camera={{ position: [0, 0, 12], fov: 50 }}
                        gl={{ antialias: true, alpha: true }}
                        style={{ background: 'transparent' }}
                    >
                        {/* Artistic studio lighting */}
                        <ambientLight intensity={0.3} color="#f0f4ff" />
                        <directionalLight
                            position={[5, 3, 5]}
                            intensity={1.2}
                            color="#fff8e1"
                        />
                        <pointLight
                            position={[-3, 2, 4]}
                            intensity={0.6}
                            color="#e3f2fd"
                        />
                        <pointLight
                            position={[2, -3, -2]}
                            intensity={0.4}
                            color="#fce4ec"
                        />

                        {/* Galaxy background */}
                        <GalaxyBackground />

                        {/* Realistic Earth */}
                        <RealisticEarthSphere
                            latitude={latitude}
                            longitude={longitude}
                            onLocationClick={onLocationClick}
                            highlightPin={highlightPin}
                        />

                        {/* Enhanced Camera controls for smooth interaction */}
                        <OrbitControls
                            enableZoom={true}
                            enablePan={true}
                            enableRotate={true}
                            autoRotate={true}
                            autoRotateSpeed={0.2}
                            minDistance={6}
                            maxDistance={25}
                            enableDamping={true}
                            dampingFactor={0.08}
                            rotateSpeed={0.8}
                            zoomSpeed={1.2}
                            panSpeed={0.5}
                            touches={{
                                ONE: THREE.TOUCH.ROTATE,
                                TWO: THREE.TOUCH.DOLLY_PAN
                            }}
                        />
                    </Canvas>
                </div>
            )}

            {/* Search Bar Overlay - Top Left */}
            {showSearch && onSearchChange && (
                <div className={`search-overlay ${showSearch ? 'show' : ''}`}>
                    <div className="search-container">
                        <div className="search-wrapper">
                            <IconSearch size={18} stroke={1.5} className="search-icon" />
                            <input
                                type="text"
                                placeholder="Search art studios..."
                                value={searchQuery}
                                onChange={(e) => onSearchChange(e.target.value)}
                                className="search-input"
                            />
                        </div>

                        {/* Search Results */}
                        {searchResults.length > 0 && (
                            <div className="search-results">
                                {searchResults.map((studio, index) => (
                                    <div
                                        key={index}
                                        className="search-result"
                                        onClick={() => onStudioSelect?.(studio)}
                                    >
                                        <span>{studio}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}



            <style jsx>{`
                .fullscreen-earth-experience {
                    position: relative;
                    width: 100vw;
                    height: 100vh;
                    overflow: hidden;
                    background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #000000 100%);
                }

                .cinematic-overlay {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    align-items: center;
                    background: rgba(0, 0, 0, 0.8);
                    backdrop-filter: blur(20px);
                    z-index: 1000;
                }

                .cinematic-title {
                    font-family: 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif;
                    font-weight: 800;
                    text-align: center;
                    color: white;
                    opacity: 0;
                    transform: translateY(50px);
                    transition: all 1.5s cubic-bezier(0.25, 0.46, 0.45, 0.94);
                    filter: blur(10px);
                }

                .cinematic-title.show {
                    opacity: 1;
                    transform: translateY(0);
                    filter: blur(0px);
                }

                .main-title {
                    font-size: 5rem;
                    margin-bottom: 2rem;
                    background: linear-gradient(135deg, #ffffff, #60a5fa, #8b5cf6);
                    background-clip: text;
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    text-shadow: 0 0 50px rgba(96, 165, 250, 0.5);
                }

                .sub-title {
                    font-size: 2.5rem;
                    color: rgba(255, 255, 255, 0.9);
                    font-weight: 400;
                    letter-spacing: 0.1em;
                }

                .earth-canvas {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    opacity: 0;
                    transform: scale(0.3);
                    transition: all 1.5s ease-out;
                }

                .earth-canvas.show {
                    opacity: 1;
                    transform: scale(1);
                }

                .search-overlay {
                    position: absolute;
                    top: 2rem;
                    left: 2rem;
                    z-index: 100;
                    opacity: 0;
                    transform: translateY(-20px);
                    transition: all 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94);
                }

                .search-overlay.show {
                    opacity: 1;
                    transform: translateY(0);
                }

                .search-container {
                    position: relative;
                    min-width: 320px;
                }

                .search-wrapper {
                    position: relative;
                    display: flex;
                    align-items: center;
                }

                .search-input {
                    width: 100%;
                    padding: 1rem 1rem 1rem 3rem;
                    background: rgba(255, 255, 255, 0.1);
                    backdrop-filter: blur(20px);
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    border-radius: 12px;
                    font-size: 1rem;
                    color: white;
                    outline: none;
                    transition: all 0.3s ease;
                    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
                }

                .search-input::placeholder {
                    color: rgba(255, 255, 255, 0.6);
                }

                .search-input:focus {
                    border-color: rgba(96, 165, 250, 0.5);
                    box-shadow: 
                        0 12px 40px rgba(0, 0, 0, 0.4),
                        0 0 0 3px rgba(96, 165, 250, 0.1);
                }

                .search-icon {
                    position: absolute;
                    left: 1rem;
                    color: rgba(255, 255, 255, 0.7);
                    z-index: 10;
                }

                .search-results {
                    position: absolute;
                    top: calc(100% + 0.5rem);
                    left: 0;
                    right: 0;
                    background: rgba(0, 0, 0, 0.9);
                    backdrop-filter: blur(20px);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 8px;
                    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
                    z-index: 1000;
                    overflow: hidden;
                }

                .search-result {
                    padding: 0.875rem 1rem;
                    color: white;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                }

                .search-result:last-child {
                    border-bottom: none;
                }

                .search-result:hover {
                    background: rgba(96, 165, 250, 0.2);
                    transform: translateX(4px);
                }

                @media (max-width: 768px) {
                    .main-title {
                        font-size: 3rem;
                    }
                    
                    .sub-title {
                        font-size: 1.5rem;
                    }
                    
                    .search-overlay {
                        top: 1rem;
                        left: 1rem;
                        right: 1rem;
                    }
                    
                    .search-container {
                        min-width: auto;
                        width: 100%;
                    }
                }

                .realistic-earth-loading {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    height: 700px;
                    background: radial-gradient(circle at center, #0c0a1e 0%, #000000 100%);
                    border-radius: 24px;
                }

                .loading-spinner {
                    text-align: center;
                    color: white;
                }

                .spinner-ring {
                    width: 60px;
                    height: 60px;
                    border: 3px solid rgba(96, 165, 250, 0.3);
                    border-top: 3px solid #60a5fa;
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                    margin: 0 auto 1rem;
                }

                .loading-text {
                    font-size: 1.125rem;
                    font-weight: 600;
                    color: rgba(255, 255, 255, 0.8);
                }

                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }

                .earth-ui-overlay {
                    position: absolute;
                    top: 2rem;
                    left: 2rem;
                    z-index: 10;
                }

                .planet-title {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    background: rgba(0, 0, 0, 0.8);
                    backdrop-filter: blur(20px);
                    border: 1px solid rgba(96, 165, 250, 0.3);
                    color: white;
                    padding: 1rem 1.5rem;
                    border-radius: 50px;
                    font-size: 1.125rem;
                    font-weight: 700;
                    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
                    text-shadow: 0 0 10px rgba(96, 165, 250, 0.5);
                }

                .live-indicator {
                    color: #ef4444;
                    font-size: 0.875rem;
                    animation: pulse 2s ease-in-out infinite;
                }

                .earth-controls-hint {
                    position: absolute;
                    bottom: 2rem;
                    left: 50%;
                    transform: translateX(-50%);
                    background: rgba(0, 0, 0, 0.7);
                    backdrop-filter: blur(15px);
                    color: rgba(255, 255, 255, 0.8);
                    padding: 0.75rem 1.5rem;
                    border-radius: 25px;
                    font-size: 0.875rem;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    z-index: 10;
                }

                .enhanced-pin-label {
                    pointer-events: none;
                    transform: translateY(-20px);
                    background: rgba(255, 255, 255, 0.95);
                    color: #374151;
                    padding: 0.75rem 1rem;
                    border-radius: 8px;
                    font-size: 0.875rem;
                    font-weight: 600;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                    border: 1px solid #e5e7eb;
                    transition: all 0.5s ease;
                    backdrop-filter: blur(10px);
                }

                .enhanced-pin-label.highlight {
                    background: linear-gradient(135deg, #fbbf24, #f59e0b);
                    color: white;
                    padding: 1rem 1.5rem;
                    font-size: 1rem;
                    font-weight: 700;
                    border: 2px solid #fbbf24;
                    box-shadow: 
                        0 8px 25px rgba(251, 191, 36, 0.4),
                        0 0 30px rgba(251, 191, 36, 0.3);
                    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
                    animation: pulseGlow 2s ease-in-out infinite;
                }

                .location-subtitle {
                    font-size: 0.75rem;
                    font-weight: 400;
                    opacity: 0.8;
                    margin-top: 0.25rem;
                }

                .logo-pin {
                    width: 40px;
                    height: 40px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 50%;
                    background: rgba(255, 255, 255, 0.95);
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                    transition: all 0.3s ease;
                    pointer-events: auto;
                }

                .logo-pin.highlight {
                    width: 50px;
                    height: 50px;
                    background: rgba(255, 255, 255, 1);
                    box-shadow: 
                        0 8px 25px rgba(251, 191, 36, 0.4),
                        0 0 30px rgba(251, 191, 36, 0.3);
                    animation: logoGlow 2s ease-in-out infinite;
                }

                .logo-pin-image {
                    width: 28px;
                    height: 28px;
                    object-fit: contain;
                    transition: all 0.3s ease;
                }

                .logo-pin.highlight .logo-pin-image {
                    width: 35px;
                    height: 35px;
                }

                @keyframes logoGlow {
                    0%, 100% { 
                        box-shadow: 
                            0 8px 25px rgba(251, 191, 36, 0.4),
                            0 0 30px rgba(251, 191, 36, 0.3);
                    }
                    50% { 
                        box-shadow: 
                            0 12px 35px rgba(251, 191, 36, 0.6),
                            0 0 50px rgba(251, 191, 36, 0.5);
                    }
                }

                @keyframes pulseGlow {
                    0%, 100% { 
                        box-shadow: 
                            0 8px 25px rgba(251, 191, 36, 0.4),
                            0 0 30px rgba(251, 191, 36, 0.3);
                    }
                    50% { 
                        box-shadow: 
                            0 12px 35px rgba(251, 191, 36, 0.6),
                            0 0 50px rgba(251, 191, 36, 0.5);
                    }
                }

                @keyframes float {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-4px); }
                }

                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.5; }
                }

                @media (max-width: 768px) {
                    .realistic-earth-container {
                        height: 500px;
                        border-radius: 16px;
                    }
                    
                    .earth-ui-overlay {
                        top: 1rem;
                        left: 1rem;
                    }
                    
                    .planet-title {
                        font-size: 1rem;
                        padding: 0.75rem 1.25rem;
                    }
                    
                    .pin-content {
                        min-width: 150px;
                        padding: 0.5rem 0.75rem;
                    }
                }
            `}</style>
        </div>
    );
};

export default RealisticEarth3D; 