import React, { useRef, useState, useEffect, useMemo, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import {
    OrbitControls,
    Text,
    Html,
    useTexture,
    Environment,
    PointerLockControls,
    Plane,
    Box,
    Sphere
} from '@react-three/drei';
import * as THREE from 'three';
import { useTheme } from '../contexts/ThemeContext';
import './VirtualGallery.css';

// Keyboard Movement Component
const KeyboardMovement: React.FC<{
    enabled: boolean;
}> = ({ enabled }) => {
    const { camera } = useThree();
    const velocity = useRef(new THREE.Vector3());
    const [moveForward, setMoveForward] = useState(false);
    const [moveBackward, setMoveBackward] = useState(false);
    const [moveLeft, setMoveLeft] = useState(false);
    const [moveRight, setMoveRight] = useState(false);

    useEffect(() => {
        if (!enabled) return;

        const onKeyDown = (event: KeyboardEvent) => {
            switch (event.code) {
                case 'ArrowUp':
                case 'KeyW':
                    setMoveForward(true);
                    break;
                case 'ArrowLeft':
                case 'KeyA':
                    setMoveLeft(true);
                    break;
                case 'ArrowDown':
                case 'KeyS':
                    setMoveBackward(true);
                    break;
                case 'ArrowRight':
                case 'KeyD':
                    setMoveRight(true);
                    break;
            }
        };

        const onKeyUp = (event: KeyboardEvent) => {
            switch (event.code) {
                case 'ArrowUp':
                case 'KeyW':
                    setMoveForward(false);
                    break;
                case 'ArrowLeft':
                case 'KeyA':
                    setMoveLeft(false);
                    break;
                case 'ArrowDown':
                case 'KeyS':
                    setMoveBackward(false);
                    break;
                case 'ArrowRight':
                case 'KeyD':
                    setMoveRight(false);
                    break;
            }
        };

        document.addEventListener('keydown', onKeyDown);
        document.addEventListener('keyup', onKeyUp);

        return () => {
            document.removeEventListener('keydown', onKeyDown);
            document.removeEventListener('keyup', onKeyUp);
        };
    }, [enabled]);

    useFrame((state, delta) => {
        if (!enabled) return;

        const moveSpeed = 8;

        if (moveForward) {
            camera.translateZ(-moveSpeed * delta);
        }
        if (moveBackward) {
            camera.translateZ(moveSpeed * delta);
        }
        if (moveLeft) {
            camera.translateX(-moveSpeed * delta);
        }
        if (moveRight) {
            camera.translateX(moveSpeed * delta);
        }

        // Keep camera at eye level and within bounds
        camera.position.y = 1.6;
        camera.position.x = Math.max(-12, Math.min(12, camera.position.x));
        camera.position.z = Math.max(-12, Math.min(12, camera.position.z));
    });

    return null;
};

// Realistic Art Frame Component
const RealisticArtFrame: React.FC<{
    position: [number, number, number];
    rotation?: [number, number, number];
    imageUrl: string;
    title: string;
    artist: string;
    description: string;
    onSelect: () => void;
}> = ({ position, rotation = [0, 0, 0], imageUrl, title, artist, description, onSelect }) => {
    const meshRef = useRef<THREE.Mesh>(null);
    const [hovered, setHovered] = useState(false);

    const texture = useTexture(imageUrl);

    useFrame(() => {
        if (meshRef.current && hovered) {
            meshRef.current.rotation.y += 0.01;
        }
    });

    return (
        <group position={position} rotation={rotation}>
            {/* Minimalist Frame - Thin Silver */}
            <mesh>
                <boxGeometry args={[3.2, 2.4, 0.08]} />
                <meshStandardMaterial
                    color="#e0e0e0"
                    metalness={0.8}
                    roughness={0.2}
                />
            </mesh>

            {/* Frame Inner Edge */}
            <mesh position={[0, 0, 0.05]}>
                <boxGeometry args={[3.0, 2.2, 0.02]} />
                <meshStandardMaterial color="#f5f5f5" metalness={0.9} roughness={0.1} />
            </mesh>

            {/* Artwork Canvas */}
            <mesh
                ref={meshRef}
                position={[0, 0, 0.12]}
                onPointerOver={() => setHovered(true)}
                onPointerOut={() => setHovered(false)}
                onClick={onSelect}
            >
                <planeGeometry args={[2.8, 2]} />
                <meshStandardMaterial
                    map={texture}
                    transparent
                    opacity={hovered ? 0.9 : 1}
                />
            </mesh>

            {/* Glass Reflection Effect */}
            <mesh position={[0, 0, 0.13]}>
                <planeGeometry args={[2.8, 2]} />
                <meshStandardMaterial
                    transparent
                    opacity={0.1}
                    color="white"
                    metalness={0.9}
                    roughness={0.1}
                />
            </mesh>

            {/* Dedicated Spotlight */}
            <spotLight
                position={[0, 3, 2]}
                angle={0.4}
                penumbra={0.5}
                intensity={hovered ? 3 : 2}
                color="#fff8dc"
                castShadow
                shadow-mapSize-width={1024}
                shadow-mapSize-height={1024}
            />

            {/* Artwork Info Plaque */}
            <mesh position={[0, -1.5, 0.1]}>
                <boxGeometry args={[2.5, 0.3, 0.05]} />
                <meshStandardMaterial color="#2c2c2c" metalness={0.5} roughness={0.3} />
            </mesh>

            <Html
                position={[0, -1.5, 0.13]}
                center
                distanceFactor={8}
                occlude
            >
                <div className={`artwork-plaque ${hovered ? 'hovered' : ''}`}>
                    <h5>{title}</h5>
                    <p>{artist}</p>
                    {hovered && <span className="interact-hint">Click to view details</span>}
                </div>
            </Html>
        </group>
    );
};

// Realistic Gallery Room with Textures
const RealisticGalleryRoom: React.FC<{
    theme: string;
    onArtSelect: (art: any) => void;
}> = ({ theme, onArtSelect }) => {
    // Create minimalistic white textures
    const whiteTexture = useMemo(() => {
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 512;
        const context = canvas.getContext('2d');
        if (context) {
            // Pure white with subtle grain
            context.fillStyle = '#fafafa';
            context.fillRect(0, 0, 512, 512);

            // Add very subtle texture
            for (let i = 0; i < 200; i++) {
                context.fillStyle = `rgba(0, 0, 0, ${Math.random() * 0.02})`;
                context.fillRect(Math.random() * 512, Math.random() * 512, 1, 1);
            }
        }
        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(4, 4);
        return texture;
    }, []);

    const floorTexture = useMemo(() => {
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 512;
        const context = canvas.getContext('2d');
        if (context) {
            // Clean white floor
            context.fillStyle = '#ffffff';
            context.fillRect(0, 0, 512, 512);

            // Subtle grid lines
            context.strokeStyle = 'rgba(0, 0, 0, 0.03)';
            context.lineWidth = 1;
            for (let i = 0; i < 512; i += 64) {
                context.beginPath();
                context.moveTo(i, 0);
                context.lineTo(i, 512);
                context.stroke();
                context.beginPath();
                context.moveTo(0, i);
                context.lineTo(512, i);
                context.stroke();
            }
        }
        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(8, 8);
        return texture;
    }, []);

    const artworks = [
        {
            id: 1,
            title: "Abstract Dreams",
            artist: "Dimensionless Studios",
            imageUrl: "https://picsum.photos/id/1/800/600",
            description: "A vibrant exploration of color and emotion through digital artistry",
            position: [-12, 2, -3] as [number, number, number],
            rotation: [0, Math.PI / 2, 0] as [number, number, number]
        },
        {
            id: 2,
            title: "Digital Renaissance",
            artist: "Dimensionless Studios",
            imageUrl: "https://picsum.photos/id/10/800/600",
            description: "Where classical techniques meet modern digital innovation",
            position: [-12, 2, 3] as [number, number, number],
            rotation: [0, Math.PI / 2, 0] as [number, number, number]
        },
        {
            id: 3,
            title: "Ethereal Landscapes",
            artist: "Dimensionless Studios",
            imageUrl: "https://picsum.photos/id/20/800/600",
            description: "Mystical worlds that transcend physical boundaries",
            position: [0, 2, -12] as [number, number, number],
            rotation: [0, 0, 0] as [number, number, number]
        },
        {
            id: 4,
            title: "Urban Poetry",
            artist: "Dimensionless Studios",
            imageUrl: "https://picsum.photos/id/30/800/600",
            description: "The rhythm of city life captured in digital strokes",
            position: [12, 2, -3] as [number, number, number],
            rotation: [0, -Math.PI / 2, 0] as [number, number, number]
        },
        {
            id: 5,
            title: "Cosmic Harmony",
            artist: "Dimensionless Studios",
            imageUrl: "https://picsum.photos/id/40/800/600",
            description: "The universe's symphony rendered in artistic form",
            position: [12, 2, 3] as [number, number, number],
            rotation: [0, -Math.PI / 2, 0] as [number, number, number]
        },
        {
            id: 6,
            title: "Minimalist Beauty",
            artist: "Dimensionless Studios",
            imageUrl: "https://picsum.photos/id/50/800/600",
            description: "The profound elegance of simplicity",
            position: [0, 2, 12] as [number, number, number],
            rotation: [0, Math.PI, 0] as [number, number, number]
        }
    ];

    return (
        <group>
            {/* Realistic Floor */}
            <mesh position={[0, 0, 0]} receiveShadow>
                <boxGeometry args={[30, 0.1, 30]} />
                <meshStandardMaterial
                    map={floorTexture}
                    metalness={0.0}
                    roughness={0.8}
                />
            </mesh>

            {/* Realistic Ceiling */}
            <mesh position={[0, 8, 0]}>
                <boxGeometry args={[30, 0.2, 30]} />
                <meshStandardMaterial
                    color={theme === 'dark' ? '#f0f0f0' : '#ffffff'}
                    metalness={0.1}
                    roughness={0.9}
                />
            </mesh>

            {/* Minimalistic White Walls */}
            {/* North Wall */}
            <mesh position={[0, 4, -15]} receiveShadow>
                <boxGeometry args={[30, 8, 0.3]} />
                <meshStandardMaterial
                    map={whiteTexture}
                    color="#ffffff"
                    metalness={0.0}
                    roughness={0.95}
                />
            </mesh>

            {/* South Wall */}
            <mesh position={[0, 4, 15]} receiveShadow>
                <boxGeometry args={[30, 8, 0.3]} />
                <meshStandardMaterial
                    map={whiteTexture}
                    color="#ffffff"
                    metalness={0.0}
                    roughness={0.95}
                />
            </mesh>

            {/* East Wall */}
            <mesh position={[15, 4, 0]} receiveShadow>
                <boxGeometry args={[0.3, 8, 30]} />
                <meshStandardMaterial
                    map={whiteTexture}
                    color="#ffffff"
                    metalness={0.0}
                    roughness={0.95}
                />
            </mesh>

            {/* West Wall */}
            <mesh position={[-15, 4, 0]} receiveShadow>
                <boxGeometry args={[0.3, 8, 30]} />
                <meshStandardMaterial
                    map={whiteTexture}
                    color="#ffffff"
                    metalness={0.0}
                    roughness={0.95}
                />
            </mesh>

            {/* Gallery Artworks */}
            {artworks.map((art) => (
                <RealisticArtFrame
                    key={art.id}
                    position={art.position}
                    rotation={art.rotation}
                    imageUrl={art.imageUrl}
                    title={art.title}
                    artist={art.artist}
                    description={art.description}
                    onSelect={() => onArtSelect(art)}
                />
            ))}

            {/* Professional Gallery Lighting */}
            <ambientLight intensity={0.4} color="#fff8dc" />

            {/* Track Lighting System */}
            <spotLight
                position={[-8, 7, -8]}
                angle={0.6}
                penumbra={0.5}
                intensity={2}
                color="#fff8dc"
                castShadow
                shadow-mapSize-width={2048}
                shadow-mapSize-height={2048}
            />
            <spotLight
                position={[8, 7, -8]}
                angle={0.6}
                penumbra={0.5}
                intensity={2}
                color="#fff8dc"
                castShadow
            />
            <spotLight
                position={[-8, 7, 8]}
                angle={0.6}
                penumbra={0.5}
                intensity={2}
                color="#fff8dc"
                castShadow
            />
            <spotLight
                position={[8, 7, 8]}
                angle={0.6}
                penumbra={0.5}
                intensity={2}
                color="#fff8dc"
                castShadow
            />

            {/* Central Information Sculpture */}
            <mesh position={[0, 1, 0]} castShadow>
                <cylinderGeometry args={[1, 1, 2]} />
                <meshStandardMaterial
                    color="#2c2c2c"
                    metalness={0.7}
                    roughness={0.3}
                />
            </mesh>

            <Html position={[0, 2.5, 0]} center distanceFactor={10}>
                <div className="gallery-info-sculpture">
                    <h3>🎨 Dimensionless Studios</h3>
                    <p>Immersive Art Experience</p>
                    <span>Use WASD or Arrow Keys to Walk</span>
                </div>
            </Html>
        </group>
    );
};

const VirtualGallery: React.FC = () => {
    const { theme } = useTheme();
    const [selectedArt, setSelectedArt] = useState<any>(null);
    const [isEntered, setIsEntered] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleEnterGallery = () => {
        setIsLoading(true);
        setTimeout(() => {
            setIsEntered(true);
            setIsLoading(false);
        }, 2000);
    };

    const handleExitGallery = () => {
        setIsEntered(false);
        setSelectedArt(null);
    };

    if (isEntered) {
        return (
            <div className="fullscreen-gallery">
                {/* Exit Button */}
                <button className="exit-gallery-btn" onClick={handleExitGallery}>
                    <span>✕</span> Exit Gallery
                </button>

                {/* Full Screen 3D Gallery */}
                <Canvas
                    shadows
                    camera={{
                        position: [0, 1.6, 5],
                        fov: 75,
                        near: 0.1,
                        far: 1000
                    }}
                    style={{ width: '100vw', height: '100vh' }}
                >
                    <color attach="background" args={[theme === 'dark' ? '#1a1a1a' : '#f8f8f8']} />
                    <fog attach="fog" args={[theme === 'dark' ? '#1a1a1a' : '#f8f8f8', 10, 50]} />

                    <OrbitControls
                        enablePan={true}
                        enableZoom={true}
                        enableRotate={true}
                        maxPolarAngle={Math.PI / 2.1}
                        minDistance={3}
                        maxDistance={20}
                        target={[0, 1.6, 0]}
                        enableDamping
                        dampingFactor={0.05}
                    />
                    <KeyboardMovement enabled={true} />
                    <Environment preset="apartment" />

                    <Suspense fallback={null}>
                        <RealisticGalleryRoom theme={theme} onArtSelect={setSelectedArt} />
                    </Suspense>
                </Canvas>

                {/* Movement Controls */}
                <div className="movement-controls">
                    <div className="arrow-controls">
                        <button
                            className="arrow-btn up"
                            onMouseDown={() => document.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyW' }))}
                            onMouseUp={() => document.dispatchEvent(new KeyboardEvent('keyup', { code: 'KeyW' }))}
                            onTouchStart={() => document.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyW' }))}
                            onTouchEnd={() => document.dispatchEvent(new KeyboardEvent('keyup', { code: 'KeyW' }))}
                        >
                            ↑
                        </button>
                        <div className="arrow-row">
                            <button
                                className="arrow-btn left"
                                onMouseDown={() => document.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyA' }))}
                                onMouseUp={() => document.dispatchEvent(new KeyboardEvent('keyup', { code: 'KeyA' }))}
                                onTouchStart={() => document.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyA' }))}
                                onTouchEnd={() => document.dispatchEvent(new KeyboardEvent('keyup', { code: 'KeyA' }))}
                            >
                                ←
                            </button>
                            <button
                                className="arrow-btn down"
                                onMouseDown={() => document.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyS' }))}
                                onMouseUp={() => document.dispatchEvent(new KeyboardEvent('keyup', { code: 'KeyS' }))}
                                onTouchStart={() => document.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyS' }))}
                                onTouchEnd={() => document.dispatchEvent(new KeyboardEvent('keyup', { code: 'KeyS' }))}
                            >
                                ↓
                            </button>
                            <button
                                className="arrow-btn right"
                                onMouseDown={() => document.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyD' }))}
                                onMouseUp={() => document.dispatchEvent(new KeyboardEvent('keyup', { code: 'KeyD' }))}
                                onTouchStart={() => document.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyD' }))}
                                onTouchEnd={() => document.dispatchEvent(new KeyboardEvent('keyup', { code: 'KeyD' }))}
                            >
                                →
                            </button>
                        </div>
                    </div>
                    <div className="controls-label">
                        <span>Move Around Gallery</span>
                    </div>
                </div>

                {/* Instructions */}
                <div className="gallery-instructions">
                    <div className="instruction-item">
                        <span className="key">Mouse</span>
                        <span>Look Around</span>
                    </div>
                    <div className="instruction-item">
                        <span className="key">Scroll</span>
                        <span>Zoom</span>
                    </div>
                    <div className="instruction-item">
                        <span className="key">Click</span>
                        <span>View Artwork</span>
                    </div>
                </div>

                {/* Art Detail Modal */}
                {selectedArt && (
                    <div className="fullscreen-art-modal">
                        <div className="art-modal-content">
                            <button className="close-modal-btn" onClick={() => setSelectedArt(null)}>
                                ✕
                            </button>
                            <div className="art-detail-grid">
                                <div className="art-image-section">
                                    <img src={selectedArt.imageUrl} alt={selectedArt.title} />
                                </div>
                                <div className="art-info-section">
                                    <h2>{selectedArt.title}</h2>
                                    <h3>by {selectedArt.artist}</h3>
                                    <p className="art-description">{selectedArt.description}</p>
                                    <div className="art-actions">
                                        <button className="action-btn primary">Commission Similar Work</button>
                                        <button className="action-btn secondary">Download Portfolio</button>
                                        <button className="action-btn secondary">Contact Artist</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    return (
        <section className={`virtual-gallery-entrance ${theme === 'dark' ? 'theme-dark' : 'theme-light'}`}>
            {/* Gallery Entrance */}
            <div className="gallery-entrance-content">
                <div className="entrance-header">
                    <h1 className="entrance-title">
                        <span className="title-icon">🏛️</span>
                        Virtual Art Gallery
                    </h1>
                    <p className="entrance-subtitle">
                        Step into our immersive 3D art exhibition and explore masterpieces in a realistic gallery environment
                    </p>
                </div>

                {/* Preview Canvas */}
                <div className="gallery-preview">
                    <Canvas
                        camera={{ position: [15, 8, 15], fov: 60 }}
                        style={{ width: '100%', height: '400px', borderRadius: '20px' }}
                    >
                        <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={1} />
                        <Environment preset="sunset" />
                        <Suspense fallback={null}>
                            <RealisticGalleryRoom theme={theme} onArtSelect={() => { }} />
                        </Suspense>
                    </Canvas>
                </div>

                {/* Enter Button */}
                <div className="entrance-actions">
                    {isLoading ? (
                        <div className="loading-entrance">
                            <div className="loading-spinner"></div>
                            <p>Preparing your gallery experience...</p>
                        </div>
                    ) : (
                        <button className="enter-gallery-btn" onClick={handleEnterGallery}>
                            <span className="btn-icon">🚪</span>
                            Enter Gallery
                            <span className="btn-subtitle">Full immersive experience</span>
                        </button>
                    )}
                </div>

                {/* Gallery Features */}
                <div className="gallery-features">
                    <div className="feature-item">
                        <span className="feature-icon">🖼️</span>
                        <h4>6 Curated Artworks</h4>
                        <p>Explore our digital art collection</p>
                    </div>
                    <div className="feature-item">
                        <span className="feature-icon">🚶‍♂️</span>
                        <h4>Free Walking</h4>
                        <p>Move freely through the gallery space</p>
                    </div>
                    <div className="feature-item">
                        <span className="feature-icon">💡</span>
                        <h4>Realistic Lighting</h4>
                        <p>Professional museum-quality ambience</p>
                    </div>
                    <div className="feature-item">
                        <span className="feature-icon">🎯</span>
                        <h4>Interactive Experience</h4>
                        <p>Click artworks for detailed information</p>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default VirtualGallery; 