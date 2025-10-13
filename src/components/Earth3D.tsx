'use client';

import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { OrbitControls, Text, Html } from '@react-three/drei';
import * as THREE from 'three';
import { useTheme } from '../contexts/ThemeContext';

interface Earth3DProps {
    latitude: number;
    longitude: number;
    className?: string;
    onLocationClick?: () => void;
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

// Earth sphere component
const EarthSphere: React.FC<{ latitude: number; longitude: number; onLocationClick?: () => void }> = ({
    latitude,
    longitude,
    onLocationClick
}) => {
    const meshRef = useRef<THREE.Mesh>(null);
    const { theme } = useTheme();

    // Create earth texture
    const earthTexture = useLoader(THREE.TextureLoader, '/earth-texture.jpg');
    const earthNormal = useLoader(THREE.TextureLoader, '/earth-normal.jpg');

    // Auto-rotate the earth
    useFrame((state, delta) => {
        if (meshRef.current) {
            meshRef.current.rotation.y += delta * 0.1;
        }
    });

    // Location marker position
    const markerPosition = latLngToVector3(latitude, longitude, 5.1);

    return (
        <group>
            {/* Earth sphere */}
            <mesh ref={meshRef} position={[0, 0, 0]}>
                <sphereGeometry args={[5, 64, 64]} />
                <meshPhongMaterial
                    map={earthTexture}
                    normalMap={earthNormal}
                    shininess={0.1}
                />
            </mesh>

            {/* Beautiful Studio Pin */}
            <group position={markerPosition}>
                {/* Main pin body */}
                <mesh onClick={onLocationClick} onPointerOver={() => document.body.style.cursor = 'pointer'} onPointerOut={() => document.body.style.cursor = 'auto'}>
                    <coneGeometry args={[0.08, 0.25, 8]} />
                    <meshPhongMaterial
                        color={theme === 'dark' ? '#fbbf24' : '#dc2626'}
                        shininess={100}
                        transparent
                        opacity={0.9}
                    />
                </mesh>

                {/* Pin head (gemstone) */}
                <mesh position={[0, 0.15, 0]} onClick={onLocationClick}>
                    <sphereGeometry args={[0.06, 16, 16]} />
                    <meshPhongMaterial
                        color={theme === 'dark' ? '#fde047' : '#dc2626'}
                        shininess={200}
                        reflectivity={0.8}
                    />
                </mesh>

                {/* Magical pulsing rings */}
                <mesh>
                    <ringGeometry args={[0.12, 0.18, 32]} />
                    <meshBasicMaterial
                        color={theme === 'dark' ? '#fbbf24' : '#dc2626'}
                        transparent
                        opacity={0.4}
                        side={THREE.DoubleSide}
                    />
                </mesh>

                <mesh>
                    <ringGeometry args={[0.2, 0.28, 32]} />
                    <meshBasicMaterial
                        color={theme === 'dark' ? '#fde047' : '#ef4444'}
                        transparent
                        opacity={0.2}
                        side={THREE.DoubleSide}
                    />
                </mesh>

                {/* Floating studio label */}
                <Html distanceFactor={8}>
                    <div className="studio-pin-label">
                        <div className="pin-label-content">
                            <span className="pin-emoji">✨</span>
                            <span className="pin-text">Dimensionless Studios</span>
                            <span className="pin-emoji">✨</span>
                        </div>
                    </div>
                </Html>
            </group>

            {/* Atmosphere glow */}
            <mesh>
                <sphereGeometry args={[5.5, 64, 64]} />
                <meshBasicMaterial
                    color={theme === 'dark' ? '#1e40af' : '#3b82f6'}
                    transparent
                    opacity={0.1}
                    side={THREE.BackSide}
                />
            </mesh>
        </group>
    );
};

// Fallback Earth component without textures
const SimpleEarthSphere: React.FC<{ latitude: number; longitude: number; onLocationClick?: () => void }> = ({
    latitude,
    longitude,
    onLocationClick
}) => {
    const meshRef = useRef<THREE.Mesh>(null);
    const { theme } = useTheme();

    useFrame((state, delta) => {
        if (meshRef.current) {
            meshRef.current.rotation.y += delta * 0.1;
        }
    });

    const markerPosition = latLngToVector3(latitude, longitude, 5.1);

    return (
        <group>
            {/* Simple Earth sphere */}
            <mesh ref={meshRef} position={[0, 0, 0]}>
                <sphereGeometry args={[5, 32, 32]} />
                <meshPhongMaterial
                    color={theme === 'dark' ? '#1e40af' : '#2563eb'}
                    wireframe={false}
                />
            </mesh>

            {/* Continents as wireframe overlay */}
            <mesh position={[0, 0, 0]}>
                <sphereGeometry args={[5.01, 16, 16]} />
                <meshBasicMaterial
                    color={theme === 'dark' ? '#60a5fa' : '#1d4ed8'}
                    wireframe={true}
                    transparent
                    opacity={0.3}
                />
            </mesh>

            {/* Location marker */}
            <group position={markerPosition}>
                <mesh onClick={onLocationClick} onPointerOver={() => document.body.style.cursor = 'pointer'} onPointerOut={() => document.body.style.cursor = 'auto'}>
                    <sphereGeometry args={[0.15, 16, 16]} />
                    <meshBasicMaterial color={theme === 'dark' ? '#fbbf24' : '#f59e0b'} />
                </mesh>

                {/* Pulsing ring */}
                <mesh>
                    <ringGeometry args={[0.2, 0.3, 32]} />
                    <meshBasicMaterial
                        color={theme === 'dark' ? '#fbbf24' : '#f59e0b'}
                        transparent
                        opacity={0.5}
                        side={THREE.DoubleSide}
                    />
                </mesh>

                <Html distanceFactor={10}>
                    <div className="location-label">
                        <div className="label-content">
                            <span>📍 Dimensionless Studios</span>
                        </div>
                    </div>
                </Html>
            </group>

            {/* Stars background */}
            <mesh>
                <sphereGeometry args={[50, 32, 32]} />
                <meshBasicMaterial
                    color={theme === 'dark' ? '#000000' : '#0f172a'}
                    side={THREE.BackSide}
                />
            </mesh>
        </group>
    );
};

// Main Earth3D component
const Earth3D: React.FC<Earth3DProps> = ({
    latitude,
    longitude,
    className = '',
    onLocationClick
}) => {
    const [useSimpleEarth, setUseSimpleEarth] = useState(false);
    const { theme } = useTheme();

    // Handle texture loading errors
    const handleTextureError = () => {
        setUseSimpleEarth(true);
    };

    useEffect(() => {
        // Check if textures are available
        const img = new Image();
        img.onload = () => setUseSimpleEarth(false);
        img.onerror = handleTextureError;
        img.src = '/earth-texture.jpg';
    }, []);

    return (
        <div className={`earth-3d-container ${className}`}>
            <Canvas
                camera={{ position: [0, 0, 15], fov: 60 }}
                style={{ background: theme === 'dark' ? '#000' : '#0f172a' }}
            >
                {/* Lighting */}
                <ambientLight intensity={0.4} />
                <directionalLight
                    position={[10, 10, 5]}
                    intensity={1}
                    color={theme === 'dark' ? '#ffffff' : '#fbbf24'}
                />
                <pointLight position={[-10, -10, -5]} intensity={0.3} />

                {/* Earth */}
                {useSimpleEarth ? (
                    <SimpleEarthSphere
                        latitude={latitude}
                        longitude={longitude}
                        onLocationClick={onLocationClick}
                    />
                ) : (
                    <EarthSphere
                        latitude={latitude}
                        longitude={longitude}
                        onLocationClick={onLocationClick}
                    />
                )}

                {                /* Controls */}
                <OrbitControls
                    enableZoom={false}
                    enablePan={false}
                    enableRotate={true}
                    autoRotate={true}
                    autoRotateSpeed={0.5}
                    minDistance={12}
                    maxDistance={12}
                    enableDamping={true}
                    dampingFactor={0.05}
                />
            </Canvas>

            {/* Planet info overlay */}
            <div className="planet-info-overlay">
                <div className="planet-name">
                    <span>🌍 Dimensionless Planet</span>
                </div>
            </div>

            <style jsx>{`
                .earth-3d-container {
                    position: relative;
                    width: 100%;
                    height: 600px;
                    border-radius: 20px;
                    overflow: hidden;
                    box-shadow: 
                        0 0 50px rgba(96, 165, 250, 0.3),
                        0 20px 40px rgba(0, 0, 0, 0.4),
                        inset 0 0 100px rgba(139, 92, 246, 0.1);
                    background: radial-gradient(circle at center, #1e1b4b 0%, #0f0c29 50%, #000000 100%);
                }

                .planet-info-overlay {
                    position: absolute;
                    top: 1.5rem;
                    left: 1.5rem;
                    z-index: 10;
                }

                .planet-name {
                    background: linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(96, 165, 250, 0.2));
                    backdrop-filter: blur(20px);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    color: white;
                    padding: 0.75rem 1.5rem;
                    border-radius: 25px;
                    font-size: 1rem;
                    font-weight: 600;
                    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
                    text-shadow: 0 0 10px rgba(96, 165, 250, 0.5);
                }

                .studio-pin-label {
                    pointer-events: none;
                    transform: translateY(-30px);
                    filter: drop-shadow(0 0 10px rgba(255, 255, 255, 0.5));
                }

                .pin-label-content {
                    background: linear-gradient(135deg, rgba(251, 191, 36, 0.95), rgba(245, 158, 11, 0.95));
                    color: white;
                    padding: 0.5rem 1rem;
                    border-radius: 15px;
                    font-size: 0.875rem;
                    font-weight: 700;
                    white-space: nowrap;
                    box-shadow: 
                        0 4px 15px rgba(251, 191, 36, 0.4),
                        0 0 20px rgba(251, 191, 36, 0.3);
                    border: 2px solid rgba(255, 255, 255, 0.3);
                    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                }

                .pin-emoji {
                    animation: sparkle 2s ease-in-out infinite;
                }

                .pin-text {
                    font-family: 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif;
                    letter-spacing: 0.025em;
                }

                @keyframes sparkle {
                    0%, 100% { 
                        opacity: 1; 
                        transform: scale(1) rotate(0deg);
                    }
                    50% { 
                        opacity: 0.7; 
                        transform: scale(1.1) rotate(180deg);
                    }
                }

                @media (max-width: 768px) {
                    .earth-3d-container {
                        height: 400px;
                    }
                    
                    .control-info {
                        font-size: 0.75rem;
                        padding: 0.375rem 0.75rem;
                    }
                }
            `}</style>
        </div>
    );
};

export default Earth3D; 