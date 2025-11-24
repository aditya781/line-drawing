import React, { useState, useRef, useEffect, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Animated,
  StatusBar,
  Easing,
  Alert,
  Switch,
  Share,
  ScrollView,
  SafeAreaView,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Path, Circle, Defs, RadialGradient, Stop, G, Polygon, LinearGradient as SvgLinearGradient } from "react-native-svg";
import * as Haptics from "expo-haptics";
import { Audio } from "expo-av";
import AsyncStorage from '@react-native-async-storage/async-storage';
import LEVELS from "../src/data/levels";

const { width, height } = Dimensions.get("window");

// =================================================
// DATA & CONFIGURATION
// =================================================
const GAME_HEIGHT = height - 180; // Space for header/footer
const SHAPE_SCALE = 0.75;
const STORAGE_KEY = "@constellation_current_level"; // <--- KEY FOR STORAGE

// HELPER: Calculate point on a quadratic bezier curve at time t (0-1)
const getQuadraticBezierXYatT = (startPt, controlPt, endPt, t) => {
  const x = Math.pow(1 - t, 2) * startPt.x + 2 * (1 - t) * t * controlPt.x + Math.pow(t, 2) * endPt.x;
  const y = Math.pow(1 - t, 2) * startPt.y + 2 * (1 - t) * t * controlPt.y + Math.pow(t, 2) * endPt.y;
  return { x, y };
};

// =================================================
// COMPONENT: ANIMATED PARTICLE BACKGROUND
// =================================================
const Particle = ({ index }) => {
  // Randomize initial properties
  const startX = Math.random() * width;
  const size = Math.random() * 4 + 1; // Size between 1 and 5
  const duration = Math.random() * 15000 + 10000; // Duration between 10s and 25s
  const startOpacity = Math.random() * 0.5 + 0.1; // Opacity 0.1 to 0.6
  
  // Animation Value: Start at random Y positions to fill screen immediately
  const positionY = useRef(new Animated.Value(Math.random() * height)).current;

  useEffect(() => {
    const animate = () => {
      // 1. Animate from current pos to top of screen (-50)
      Animated.timing(positionY, {
        toValue: -50,
        duration: (positionY._value + 50) / (height + 50) * duration, // Adjust duration based on distance remaining
        easing: Easing.linear,
        useNativeDriver: true,
      }).start(() => {
        // 2. Reset to bottom immediately
        positionY.setValue(height + 50);
        
        // 3. Loop: Animate from bottom (height + 50) to top (-50)
        Animated.loop(
          Animated.timing(positionY, {
            toValue: -50,
            duration: duration,
            easing: Easing.linear,
            useNativeDriver: true,
          })
        ).start();
      });
    };

    animate();
  }, []);

  return (
    <Animated.View
      style={{
        position: 'absolute',
        left: startX,
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: 'white',
        opacity: startOpacity,
        transform: [{ translateY: positionY }],
      }}
    />
  );
};

// Memoized container to prevent re-renders on game state changes
const ParticleBackground = React.memo(() => {
  const particles = Array.from({ length: 30 }, (_, i) => i); // 30 Particles
  return (
    <View style={[StyleSheet.absoluteFill, { zIndex: 0 }]} pointerEvents="none">
      {particles.map((item) => (
        <Particle key={item} index={item} />
      ))}
    </View>
  );
});

// =================================================
// COMPONENT 1: SPLASH SCREEN
// =================================================
const SplashScreen = ({ onStart }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, friction: 6, tension: 40, useNativeDriver: true }),
    ]).start();

    Animated.loop(Animated.timing(rotateAnim, { toValue: 1, duration: 10000, easing: Easing.linear, useNativeDriver: true })).start();

    Animated.loop(Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.1, duration: 1000, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
    ])).start();
  }, []);

  const spin = rotateAnim.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "360deg"] });

  const handlePress = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 0, duration: 400, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 5, duration: 400, useNativeDriver: true }),
    ]).start(() => onStart());
  };

  return (
    <View style={splashStyles.container}>
      <LinearGradient colors={["#667eea", "#764ba2", "#f093fb"]} style={StyleSheet.absoluteFill} />
      {/* Insert Particles Here */}
      <ParticleBackground />
      
      <Animated.View style={{ opacity: fadeAnim, transform: [{ scale: scaleAnim }], alignItems: 'center', zIndex: 10 }}>
        <View style={splashStyles.logoContainer}>
          <Animated.View style={{ transform: [{ rotate: spin }] }}>
             <Svg height="200" width="200" viewBox="0 0 100 100">
               <Circle cx="50" cy="50" r="45" stroke="rgba(255,255,255,0.2)" strokeWidth="1" strokeDasharray="10, 10" fill="none" />
               <Circle cx="50" cy="5" r="3" fill="#fff" />
               <Circle cx="50" cy="95" r="3" fill="#fff" />
             </Svg>
          </Animated.View>
          <View style={StyleSheet.absoluteFill} pointerEvents="none">
            <Svg height="200" width="200" viewBox="0 0 100 100" style={{alignSelf:'center'}}>
              <Defs>
                 <RadialGradient id="glow" cx="50%" cy="50%">
                   <Stop offset="0%" stopColor="#FFD700" stopOpacity="1" />
                   <Stop offset="100%" stopColor="#FFA500" stopOpacity="0" />
                 </RadialGradient>
              </Defs>
              <Path d="M50,20 L80,70 L20,70 Z" stroke="#fff" strokeWidth="2" fill="rgba(255,255,255,0.1)" strokeLinejoin="round" />
              <Circle cx="50" cy="20" r="6" fill="url(#glow)" />
              <Circle cx="80" cy="70" r="6" fill="url(#glow)" />
              <Circle cx="20" cy="70" r="6" fill="url(#glow)" />
            </Svg>
          </View>
        </View>
        <Text style={splashStyles.title}>CONSTELLATION</Text>
        <Text style={splashStyles.subtitle}>ONE LINE PUZZLE</Text>
        <TouchableOpacity onPress={handlePress} activeOpacity={0.8}>
          <Animated.View style={[splashStyles.button, { transform: [{ scale: pulseAnim }] }]}>
            <Text style={splashStyles.buttonText}>TAP TO START</Text>
          </Animated.View>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

// =================================================
// COMPONENT 2: MAIN GAME ENGINE
// =================================================
function LineDrawingGame() {
  // GAME STATE
  const [level, setLevel] = useState(0);
  const [currentPath, setCurrentPath] = useState([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [visitedEdges, setVisitedEdges] = useState(new Set());
  const [currentNode, setCurrentNode] = useState(null);
  const [gameWon, setGameWon] = useState(false);
  const [isGameFinished, setIsGameFinished] = useState(false);
   
  // UI STATE
  const [showHelp, setShowHelp] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [settingsView, setSettingsView] = useState('menu'); // 'menu' | 'privacy'
   
  // SETTINGS STATE
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [hapticsEnabled, setHapticsEnabled] = useState(true);
    
  // SOLVER / DEMO STATE
  const [isDemoPlaying, setIsDemoPlaying] = useState(false);
  const ghostAnim = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
  const ghostOpacity = useRef(new Animated.Value(0)).current;
  const segmentProgressAnim = useRef(new Animated.Value(0)).current;

  // ANIMATIONS
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const successAnim = useRef(new Animated.Value(0)).current;
  const particleAnim = useRef(new Animated.Value(0)).current;
  const helpFadeAnim = useRef(new Animated.Value(0)).current;
  const settingsFadeAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  // =================================================
  // PERSISTENCE LOGIC ADDED HERE
  // =================================================

  // 1. Load saved level on mount
  useEffect(() => {
    const loadLevel = async () => {
      try {
        const savedLevel = await AsyncStorage.getItem(STORAGE_KEY);
        if (savedLevel !== null) {
          const parsedLevel = parseInt(savedLevel, 10);
          // Safety check: ensure level is a valid number and within bounds
          if (!isNaN(parsedLevel) && parsedLevel >= 0 && parsedLevel < LEVELS.length) {
            setLevel(parsedLevel);
          }
        }
      } catch (e) {
        console.error("Failed to load level", e);
      }
    };
    loadLevel();
  }, []);

  // 2. Save level whenever it changes (Next Level or Reset)
  useEffect(() => {
    const saveLevel = async () => {
      try {
        await AsyncStorage.setItem(STORAGE_KEY, level.toString());
      } catch (e) {
        console.error("Failed to save level", e);
      }
    };
    saveLevel();
  }, [level]);

  // =================================================

  const currentLevel = LEVELS[level];

  // --- SOUNDS HELPER ---
  const playButtonSound = async () => {
    if (!soundEnabled) return;
    try {
      const { sound } = await Audio.Sound.createAsync(require('../assets/sounds/button-press.mp3'));
      await sound.playAsync();
      sound.setOnPlaybackStatusUpdate((status) => { if (status.didJustFinish) sound.unloadAsync(); });
    } catch (e) { /* placeholder */ }
  };

  const playWinSound = async () => {
    if (!soundEnabled) return;
    try {
      const { sound } = await Audio.Sound.createAsync(require('../assets/sounds/level-up.mp3'));
      await sound.playAsync();
      sound.setOnPlaybackStatusUpdate((status) => { if (status.didJustFinish) sound.unloadAsync(); });
    } catch (e) { /* placeholder */ }
  };

  // --- HAPTICS HELPER ---
  const triggerHaptic = (type) => {
    if (!hapticsEnabled) return;
    switch(type) {
      case 'light': Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); break;
      case 'medium': Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); break;
      case 'heavy': Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy); break;
      case 'success': Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); break;
      case 'warning': Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning); break;
      case 'selection': Haptics.selectionAsync(); break;
    }
  };

  // --- APP ACTIONS (SHARE/PRIVACY) ---
  const handleShare = async () => {
    try {
      await Share.share({
        message: 'Check out Constellation - The relaxing one-line puzzle game!',
      });
    } catch (error) {
      // ignore
    }
  };

  const handlePrivacyPolicy = () => {
    setSettingsView('privacy');
  };

  const closeSettings = () => {
      Animated.timing(settingsFadeAnim, { toValue: 0, duration: 250, useNativeDriver: true }).start(() => {
          setShowSettings(false);
          setSettingsView('menu'); // Reset view for next time
      });
  }


  // --- GEOMETRY LOGIC ---
  const toSVG = (point) => {
    const scaledWidth = width * SHAPE_SCALE;
    const scaledHeight = GAME_HEIGHT * SHAPE_SCALE;
    const offsetX = (width - scaledWidth) / 2;
    const offsetY = (GAME_HEIGHT - scaledHeight) / 2;
    return { x: offsetX + (point.x * scaledWidth), y: offsetY + (point.y * scaledHeight) };
  };

  const distance = (p1, p2) => Math.sqrt((p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2);

  const findNearestNode = (x, y) => {
    let nearest = null;
    let minDist = 35;
    currentLevel.nodes.forEach((node) => {
      const svgPos = toSVG(node);
      const dist = distance({ x, y }, svgPos);
      if (dist < minDist) { minDist = dist; nearest = node.id; }
    });
    return nearest;
  };

  const getEdgeKey = (from, to) => (from < to ? `${from}-${to}` : `${to}-${from}`);

  const isValidEdge = (from, to) => {
    return currentLevel.edges.some((edge) => (edge.from === from && edge.to === to) || (edge.from === to && edge.to === from));
  };

  // Animate progress bar
  useEffect(() => {
    const progress = (visitedEdges.size / currentLevel.edges.length);
    Animated.spring(progressAnim, {
      toValue: progress,
      useNativeDriver: false,
      tension: 40,
      friction: 7
    }).start();
  }, [visitedEdges.size]);

  // --- SOLVER ALGORITHM (DFS) ---
  const findSolutionPath = () => {
    const nodes = currentLevel.nodes.map(n => n.id);
    const edgeList = currentLevel.edges.map((e, i) => ({ ...e, index: i, visited: false }));
    const totalEdges = edgeList.length;

    const adj = {};
    nodes.forEach(id => adj[id] = []);
    edgeList.forEach(e => {
        adj[e.from].push(e);
        adj[e.to].push(e);
    });

    const degrees = {};
    nodes.forEach(id => degrees[id] = adj[id].length);
    const oddNodes = nodes.filter(id => degrees[id] % 2 !== 0);
    const possibleStarts = oddNodes.length > 0 ? oddNodes : [nodes[0]];

    const solve = (currId, path, usedCount, edgesState) => {
        if (usedCount === totalEdges) return path;
        const neighbors = adj[currId];
        for (let edge of neighbors) {
            if (!edgesState[edge.index].visited) {
                edgesState[edge.index].visited = true;
                const nextNode = edge.from === currId ? edge.to : edge.from;
                const result = solve(nextNode, [...path, nextNode], usedCount + 1, edgesState);
                if (result) return result;
                edgesState[edge.index].visited = false;
            }
        }
        return null;
    };

    for (let start of possibleStarts) {
        const edgesCopy = JSON.parse(JSON.stringify(edgeList)); 
        const solution = solve(start, [start], 0, edgesCopy);
        if (solution) return solution;
    }
    return null;
  };

  // --- HINT HANDLER ---
  const handleHint = async () => {
    if (isDemoPlaying || gameWon) return;

    const solutionPath = findSolutionPath();
    if (!solutionPath) {
        Alert.alert("Error", "Could not calculate solution.");
        return;
    }

    setIsDemoPlaying(true);
    setCurrentNode(null);
    setCurrentPath([]);
    setVisitedEdges(new Set());
    playButtonSound();
    triggerHaptic('warning');

    const startNode = currentLevel.nodes.find(n => n.id === solutionPath[0]);
    const startPos = toSVG(startNode);
    ghostAnim.setValue(startPos);
     
    await new Promise(resolve => {
        Animated.timing(ghostOpacity, { toValue: 1, duration: 300, useNativeDriver: true }).start(resolve);
    });
     
    for (let i = 0; i < solutionPath.length - 1; i++) {
        const fromId = solutionPath[i];
        const toId = solutionPath[i+1];
        const edge = currentLevel.edges.find(e => 
             (e.from === fromId && e.to === toId) || (e.from === toId && e.to === fromId)
        );

        const segStartPos = toSVG(currentLevel.nodes.find(n => n.id === fromId));
        const segEndPos = toSVG(currentLevel.nodes.find(n => n.id === toId));
         
        let controlPos;
        if (edge.curve) {
             controlPos = toSVG(edge.curve);
        } else {
             controlPos = segStartPos; 
        }

        segmentProgressAnim.setValue(0);
        const listenerId = segmentProgressAnim.addListener(({ value: t }) => {
             const nextPos = getQuadraticBezierXYatT(segStartPos, controlPos, segEndPos, t);
             ghostAnim.setValue(nextPos);
        });

        await new Promise((resolve) => {
             Animated.timing(segmentProgressAnim, {
                 toValue: 1,
                 duration: 700,
                 easing: Easing.inOut(Easing.quad),
                 useNativeDriver: false, 
             }).start(() => {
                 segmentProgressAnim.removeListener(listenerId);
                 resolve();
             });
        });
        setVisitedEdges(prev => new Set([...prev, getEdgeKey(fromId, toId)]));
        await new Promise(r => setTimeout(r, 50));
    }

    Animated.timing(ghostOpacity, { toValue: 0, duration: 500, useNativeDriver: true }).start(() => {
        setIsDemoPlaying(false);
        setVisitedEdges(new Set()); 
    });
  };

  // --- UI INTERACTION HANDLERS ---
  const toggleHelp = () => {
    triggerHaptic('selection');
    if (showHelp) {
      Animated.timing(helpFadeAnim, { toValue: 0, duration: 250, useNativeDriver: true }).start(() => setShowHelp(false));
    } else {
      if (showSettings) {
         setShowSettings(false);
         settingsFadeAnim.setValue(0);
      }
      setShowHelp(true);
      Animated.timing(helpFadeAnim, { toValue: 1, duration: 250, useNativeDriver: true }).start();
    }
  };

  const toggleSettings = () => {
    triggerHaptic('selection');
    if (showSettings) {
        closeSettings();
    } else {
      if (showHelp) {
          setShowHelp(false);
          helpFadeAnim.setValue(0);
      }
      setShowSettings(true);
      Animated.timing(settingsFadeAnim, { toValue: 1, duration: 250, useNativeDriver: true }).start();
    }
  };

  const handleTouchStart = (event) => {
    if (showHelp || showSettings || gameWon || isGameFinished || isDemoPlaying) return;
    const { locationX, locationY } = event.nativeEvent;
    const nodeId = findNearestNode(locationX, locationY);
    if (nodeId !== null) {
      triggerHaptic('light');
      setIsDrawing(true);
      setCurrentNode(nodeId);
      setCurrentPath([{ x: locationX, y: locationY }]);
      setVisitedEdges(new Set());
      Animated.spring(scaleAnim, { toValue: 1.05, useNativeDriver: true }).start();
    }
  };

  const handleTouchMove = (event) => {
    if (!isDrawing || currentNode === null || showHelp || showSettings || gameWon || isGameFinished || isDemoPlaying) return;
    const { locationX, locationY } = event.nativeEvent;
    setCurrentPath((prev) => [...prev, { x: locationX, y: locationY }]);
    const nodeId = findNearestNode(locationX, locationY);
     
    if (nodeId !== null && nodeId !== currentNode) {
      if (isValidEdge(currentNode, nodeId)) {
        const edgeKey = getEdgeKey(currentNode, nodeId);
        if (!visitedEdges.has(edgeKey)) {
          const newVisited = new Set(visitedEdges);
          newVisited.add(edgeKey);
          setVisitedEdges(newVisited);
          setCurrentNode(nodeId);
           
          // CHECK WIN CONDITION
          if (newVisited.size === currentLevel.edges.length) {
            setGameWon(true);
            setIsDrawing(false);
            playWinSound();
            triggerHaptic('success');
            Animated.parallel([
              Animated.spring(successAnim, { toValue: 1, useNativeDriver: true, tension: 50, friction: 7 }),
              Animated.timing(particleAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
            ]).start();
          } else {
            triggerHaptic('medium');
          }
          Animated.sequence([
            Animated.timing(scaleAnim, { toValue: 1.1, duration: 80, useNativeDriver: true }),
            Animated.timing(scaleAnim, { toValue: 1.05, duration: 80, useNativeDriver: true }),
          ]).start();
        }
      }
    }
  };

  const handleTouchEnd = () => {
    if (showHelp || showSettings || isDemoPlaying) return;
    if (isDrawing && !gameWon) triggerHaptic('heavy');
    setIsDrawing(false);
    setCurrentNode(null);
    setCurrentPath([]);
    if (!gameWon) setVisitedEdges(new Set());
    scaleAnim.setValue(1);
  };

  // --- LEVEL TRANSITION ---
  const nextLevel = () => {
    playButtonSound();
    triggerHaptic('selection');

    Animated.timing(successAnim, { toValue: 0, duration: 200, useNativeDriver: true }).start(() => {
      if (level < LEVELS.length - 1) {
        // Increment level (This will trigger the Save useEffect)
        setLevel(level + 1);
        setVisitedEdges(new Set());
        setCurrentNode(null);
        setCurrentPath([]);
        setGameWon(false);
        particleAnim.setValue(0);
        progressAnim.setValue(0);
      } else {
        setIsGameFinished(true);
        setGameWon(false);
        Animated.spring(successAnim, { toValue: 1, useNativeDriver: true, tension: 40, friction: 7 }).start();
      }
    });
  };

  const resetGame = () => {
    playButtonSound();
    triggerHaptic('success');
    Animated.timing(successAnim, { toValue: 0, duration: 300, useNativeDriver: true }).start(() => {
        setIsGameFinished(false);
        // Reset to 0 (This will trigger the Save useEffect)
        setLevel(0);
        setVisitedEdges(new Set());
        setCurrentNode(null);
        setCurrentPath([]);
        setGameWon(false);
        particleAnim.setValue(0);
        progressAnim.setValue(0);
    });
  };

  const getEdgePath = (edge) => {
    const from = toSVG(currentLevel.nodes[edge.from]);
    const to = toSVG(currentLevel.nodes[edge.to]);
    if (edge.curve) {
        const control = toSVG(edge.curve);
        return `M ${from.x},${from.y} Q ${control.x},${control.y} ${to.x},${to.y}`;
    }
    return `M ${from.x},${from.y} L ${to.x},${to.y}`;
  };

  const animatedWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%']
  });

  const getDifficultyColor = (diff) => {
    switch(diff) { 
      case 'Easy': return '#4ade80'; 
      case 'Medium': return '#facc15'; 
      case 'Hard': return '#f87171'; 
      default: return '#fff'; 
    }
  };

  return (
    <LinearGradient colors={["#667eea", "#764ba2", "#f093fb"]} style={gameStyles.container}>
      <StatusBar barStyle="light-content" translucent={true} backgroundColor="transparent" />

      {/* NEW: Particle Background */}
      <ParticleBackground />

      {/* HEADER */}
      <View style={gameStyles.headerWrapper}>
        {/* Top Control Bar (Symmetric) */}
        <View style={gameStyles.topControlBar}>
            {/* Left: Settings Button */}
            <TouchableOpacity 
              style={gameStyles.roundGlassButton} 
              onPress={toggleSettings}
              activeOpacity={0.7}
            >
               <Svg width="28" height="28" viewBox="0 0 24 24">
                 <Path fill="#fff" d="M19.14,12.94c0.04-0.3,0.06-0.61,0.06-0.94c0-0.32-0.02-0.64-0.07-0.94l2.03-1.58c0.18-0.14,0.23-0.41,0.12-0.61 l-1.92-3.32c-0.12-0.22-0.37-0.29-0.59-0.22l-2.39,0.96c-0.5-0.38-1.03-0.7-1.62-0.94L14.4,2.81c-0.04-0.24-0.24-0.41-0.48-0.41 h-3.84c-0.24,0-0.43,0.17-0.47,0.41L9.25,5.35C8.66,5.59,8.12,5.92,7.63,6.29L5.24,5.33c-0.22-0.08-0.47,0-0.59,0.22L2.74,8.87 C2.62,9.08,2.66,9.34,2.86,9.48l2.03,1.58C4.84,11.36,4.8,11.69,4.8,12s0.02,0.64,0.07,0.94l-2.03,1.58 c-0.18,0.14-0.23,0.41-0.12,0.61l1.92,3.32c0.12,0.22,0.37,0.29,0.59,0.22l2.39-0.96c0.5,0.38,1.03,0.7,1.62,0.94l0.36,2.54 c0.05,0.24,0.24,0.41,0.48,0.41h3.84c0.24,0,0.44-0.17,0.47-0.41l0.36-2.54c0.59-0.24,1.13-0.56,1.62-0.94l2.39,0.96 c0.22,0.08,0.47,0,0.59-0.22l1.92-3.32c0.12-0.22,0.07-0.47-0.12-0.61L19.14,12.94z M12,15.6c-1.98,0-3.6-1.62-3.6-3.6 s1.62-3.6,3.6-3.6s3.6,1.62,3.6,3.6S13.98,15.6,12,15.6z"/>
               </Svg>
            </TouchableOpacity>

            {/* Center: Level Info Capsule */}
            <View style={gameStyles.levelCapsule}>
               <Text style={gameStyles.levelText}>LEVEL {level + 1}</Text>
               <View style={[gameStyles.difficultyDot, { backgroundColor: getDifficultyColor(currentLevel.difficulty) }]} />
               <Text style={gameStyles.diffText}>{currentLevel.difficulty.toUpperCase()}</Text>
            </View>

            {/* Right: Help Button */}
            <TouchableOpacity 
              style={gameStyles.roundGlassButton} 
              onPress={toggleHelp}
              activeOpacity={0.7}
            >
              <Text style={gameStyles.helpButtonText}>?</Text>
            </TouchableOpacity>
        </View>

        {/* Progress Bar Row */}
        <View style={gameStyles.progressSection}>
          <View style={gameStyles.progressLabelRow}>
            <Text style={gameStyles.progressLabel}>PROGRESS</Text>
            <Text style={gameStyles.progressCountText}>
               {visitedEdges.size} / {currentLevel.edges.length}
            </Text>
          </View>
          <View style={gameStyles.progressBarContainer}>
            <Animated.View 
              style={[
                gameStyles.progressBarFill, 
                { 
                  width: animatedWidth,
                  backgroundColor: gameWon ? "#4ade80" : "#ffffff"
                }
              ]} 
            />
          </View>
        </View>
      </View>

      {/* GAME BOARD */}
      <Animated.View
        style={[gameStyles.gameArea, { transform: [{ scale: scaleAnim }] }]}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <View>
          <Svg width={width} height={GAME_HEIGHT}>
            <Defs>
              <RadialGradient id="nodeGrad" cx="50%" cy="50%">
                <Stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
                <Stop offset="100%" stopColor="#e0e0e0" stopOpacity="1" />
              </RadialGradient>
              <RadialGradient id="activeNode" cx="50%" cy="50%">
                <Stop offset="0%" stopColor="#FFD700" stopOpacity="1" />
                <Stop offset="100%" stopColor="#FFA500" stopOpacity="1" />
              </RadialGradient>
              <RadialGradient id="completedNode" cx="50%" cy="50%">
                <Stop offset="0%" stopColor="#4CAF50" stopOpacity="1" />
                <Stop offset="100%" stopColor="#2E7D32" stopOpacity="1" />
              </RadialGradient>
              <RadialGradient id="ghostGrad" cx="50%" cy="50%">
                 <Stop offset="0%" stopColor="#00FFFF" stopOpacity="1" />
                 <Stop offset="100%" stopColor="#0099FF" stopOpacity="0.5" />
              </RadialGradient>
            </Defs>
             
            {/* Edges */}
            {currentLevel.edges.map((edge, idx) => {
              const edgeKey = getEdgeKey(edge.from, edge.to);
              const isVisited = visitedEdges.has(edgeKey);
              return (
                <Path key={idx} d={getEdgePath(edge)} stroke={isVisited ? "#4CAF50" : "rgba(255, 255, 255, 0.3)"} strokeWidth={isVisited ? 10 : 5} fill="none" strokeLinecap="round" strokeLinejoin="round" />
              );
            })}
             
            {/* Dragging Line */}
            {currentPath.length > 1 && (
              <Path d={`M ${currentPath.map((p) => `${p.x},${p.y}`).join(" L ")}`} stroke="#FFD700" strokeWidth={8} fill="none" opacity={0.9} strokeLinecap="round" strokeLinejoin="round" />
            )}

            {/* Nodes */}
            {currentLevel.nodes.map((node) => {
              const svgPos = toSVG(node);
              const isActive = currentNode === node.id;
              const isCompleted = gameWon;

              return (
                <G key={node.id}>
                  {isActive && ( <Circle cx={svgPos.x} cy={svgPos.y} r={25} fill="none" stroke="#FFD700" strokeWidth={4} opacity={0.6} /> )}
                  <Circle cx={svgPos.x} cy={svgPos.y} r={14} fill={isCompleted ? "url(#completedNode)" : isActive ? "url(#activeNode)" : "url(#nodeGrad)"} stroke={isCompleted ? "#4CAF50" : "#ffffff"} strokeWidth={3} />
                </G>
              );
            })}
          </Svg>

          {/* GHOST POINTER */}
          <Animated.View 
            style={[
              gameStyles.ghostPointer, 
              { 
                opacity: ghostOpacity,
                transform: [
                   { translateX: Animated.subtract(ghostAnim.x, 20) }, 
                   { translateY: Animated.subtract(ghostAnim.y, 20) } 
                ]
              }
            ]}
          >
             <Svg width="40" height="40" viewBox="0 0 40 40">
                <Circle cx="20" cy="20" r="15" fill="url(#ghostGrad)" stroke="white" strokeWidth="2" />
                <Circle cx="20" cy="20" r="20" fill="none" stroke="#00FFFF" strokeWidth="1" strokeDasharray="4,4" />
             </Svg>
          </Animated.View>
        </View>
      </Animated.View>

      {/* FOOTER */}
      {!gameWon && !isGameFinished && ( 
        <View style={gameStyles.footer}>
           <TouchableOpacity 
             style={[gameStyles.hintButton, isDemoPlaying && { opacity: 0.5 }]} 
             onPress={handleHint}
             activeOpacity={0.8}
             disabled={isDemoPlaying}
           >
             <LinearGradient 
               colors={['#fff', '#e0e0e0']} 
               style={gameStyles.hintButtonGradient}
             >
                 <Svg width="24" height="24" viewBox="0 0 24 24">
                     <Path d="M9 21h6v-2H9v2zm3-19C8.14 2 5 5.14 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.86-3.14-7-7-7zm2.85 11.1l-.85.6V16h-4v-2.3l-.85-.6C7.8 12.16 7 10.63 7 9c0-2.76 2.24-5 5-5s5 2.24 5 5c0 1.63-.8 3.16-2.15 4.1z" fill="#764ba2"/>
                 </Svg>
                 <Text style={gameStyles.hintButtonText}>SHOW SOLUTION</Text>
             </LinearGradient>
           </TouchableOpacity>

          <Text style={gameStyles.instruction}>
            {isDemoPlaying ? "Watch the solution path..." : "Draw through all points without lifting"}
          </Text>
        </View> 
      )}

      {/* LEVEL WIN OVERLAY */}
      {gameWon && (
        <Animated.View style={[gameStyles.fullScreenWin, { opacity: successAnim, transform: [{ scale: successAnim.interpolate({ inputRange: [0, 1], outputRange: [0.8, 1] }) }] }]}>
              <LinearGradient colors={["#764ba2", "#667eea"]} style={gameStyles.fullScreenWinGradient}>
                 {/* Insert Particles Here */}
                 <ParticleBackground />
                 <View style={gameStyles.winIconContainer}>
                     <Svg height="100" width="100" viewBox="0 0 100 100">
                         <Polygon points="50,5 61,35 95,35 68,57 79,91 50,70 21,91 32,57 5,35 39,35" fill="#FFD700" stroke="#FFA500" strokeWidth="2" />
                     </Svg>
                 </View>
                 <Text style={gameStyles.winTitle}>LEVEL {level + 1}</Text>
                 <Text style={gameStyles.winSubtitle}>COMPLETE!</Text>
                 <View style={gameStyles.statsContainer}>
                     <Text style={gameStyles.statText}>{currentLevel.difficulty} • Excellent Work</Text>
                 </View>
                 <TouchableOpacity style={gameStyles.bigNextButton} onPress={nextLevel}>
                     <Text style={gameStyles.bigNextButtonText}>CONTINUE</Text>
                 </TouchableOpacity>
              </LinearGradient>
        </Animated.View>
      )}

      {/* GAME FINISHED OVERLAY */}
      {isGameFinished && (
        <Animated.View style={[gameStyles.fullScreenWin, { opacity: successAnim, transform: [{ scale: successAnim.interpolate({ inputRange: [0, 1], outputRange: [0.8, 1] }) }] }]}>
              <LinearGradient colors={["#FF9966", "#FF5E62"]} style={gameStyles.fullScreenWinGradient}>
                 <ParticleBackground />
                 <View style={gameStyles.winIconContainer}>
                     <Svg height="150" width="150" viewBox="0 0 100 100">
                         <Defs>
                           <SvgLinearGradient id="trophyGrad" x1="0" y1="0" x2="1" y2="1">
                             <Stop offset="0" stopColor="#FFD700" stopOpacity="1" />
                             <Stop offset="1" stopColor="#FFA500" stopOpacity="1" />
                           </SvgLinearGradient>
                         </Defs>
                         <Path d="M30,60 Q50,85 70,60 L75,20 L25,20 L30,60 Z" fill="url(#trophyGrad)" stroke="#FFF" strokeWidth="2" />
                         <Path d="M25,25 Q5,35 28,50" fill="none" stroke="#FFD700" strokeWidth="4" strokeLinecap="round" />
                         <Path d="M75,25 Q95,35 72,50" fill="none" stroke="#FFD700" strokeWidth="4" strokeLinecap="round" />
                         <Path d="M50,75 L50,85 M35,85 L65,85" stroke="#FFF" strokeWidth="5" strokeLinecap="round" />
                         <Polygon points="50,30 53,40 63,40 55,47 58,57 50,50 42,57 45,47 37,40 47,40" fill="#FFF" />
                     </Svg>
                 </View>
                 <Text style={gameStyles.winTitle}>CONSTELLATION</Text>
                 <Text style={gameStyles.winSubtitle}>MASTERED!</Text>
                 <View style={gameStyles.statsContainer}>
                     <Text style={gameStyles.statText}>You solved all {LEVELS.length} puzzles.</Text>
                 </View>
                 <TouchableOpacity style={gameStyles.bigNextButton} onPress={resetGame}>
                     <Text style={[gameStyles.bigNextButtonText, { color: '#FF5E62' }]}>PLAY AGAIN</Text>
                 </TouchableOpacity>
              </LinearGradient>
        </Animated.View>
      )}

      {/* FULL SCREEN SETTINGS & PRIVACY MODAL */}
      {showSettings && (
        <Animated.View style={[gameStyles.fullScreenModal, { opacity: settingsFadeAnim }]}>
           <LinearGradient colors={["#667eea", "#764ba2", "#f093fb"]} style={gameStyles.fullScreenGradient}>
              {/* Insert Particles Here */}
              <ParticleBackground />
              <SafeAreaView style={gameStyles.fsSafeArea}>
              
              {/* SETTINGS MAIN VIEW */}
              {settingsView === 'menu' && (
                <View style={{flex: 1}}>
                  <View style={gameStyles.fsHeader}>
                    <View style={gameStyles.fsHeaderSpacer} />
                    <Text style={gameStyles.fsTitle}>SETTINGS</Text>
                    <TouchableOpacity style={gameStyles.fsCloseBtn} onPress={toggleSettings}>
                      <Svg width="24" height="24" viewBox="0 0 24 24">
                        <Path fill="#fff" d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                      </Svg>
                    </TouchableOpacity>
                  </View>

                  <ScrollView contentContainerStyle={gameStyles.fsScrollContent} showsVerticalScrollIndicator={false}>
                      <Text style={gameStyles.settingSectionTitle}>PREFERENCES</Text>
                      
                      {/* Sound Toggle */}
                      <View style={gameStyles.settingRow}>
                          <View style={gameStyles.settingIconBox}>
                             <Svg width="20" height="20" viewBox="0 0 24 24">
                               <Path fill="#fff" d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
                             </Svg>
                          </View>
                          <View style={gameStyles.settingInfo}>
                             <Text style={gameStyles.settingLabel}>Sound Effects</Text>
                             <Text style={gameStyles.settingSub}>Audio cues</Text>
                          </View>
                          <Switch 
                            trackColor={{ false: "#767577", true: "#4ade80" }}
                            thumbColor={soundEnabled ? "#fff" : "#f4f3f4"}
                            onValueChange={setSoundEnabled}
                            value={soundEnabled}
                          />
                      </View>

                      {/* Haptics Toggle */}
                      <View style={gameStyles.settingRow}>
                          <View style={gameStyles.settingIconBox}>
                             <Svg width="20" height="20" viewBox="0 0 24 24">
                                <Path fill="#fff" d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-9 14h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                             </Svg>
                          </View>
                          <View style={gameStyles.settingInfo}>
                             <Text style={gameStyles.settingLabel}>Haptics</Text>
                             <Text style={gameStyles.settingSub}>Vibration feedback</Text>
                          </View>
                          <Switch 
                            trackColor={{ false: "#767577", true: "#4ade80" }}
                            thumbColor={hapticsEnabled ? "#fff" : "#f4f3f4"}
                            onValueChange={setHapticsEnabled}
                            value={hapticsEnabled}
                          />
                      </View>

                      <Text style={gameStyles.settingSectionTitle}>GENERAL</Text>

                        {/* Share Button */}
                      <TouchableOpacity style={gameStyles.settingRow} onPress={handleShare}>
                          <View style={gameStyles.settingIconBox}>
                             <Svg width="20" height="20" viewBox="0 0 24 24">
                                  <Path fill="#fff" d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z"/>
                             </Svg>
                          </View>
                          <View style={gameStyles.settingInfo}>
                             <Text style={gameStyles.settingLabel}>Share App</Text>
                             <Text style={gameStyles.settingSub}>Tell your friends</Text>
                          </View>
                          <Svg width="24" height="24" viewBox="0 0 24 24">
                              <Path fill="rgba(255,255,255,0.5)" d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/>
                          </Svg>
                      </TouchableOpacity>

                      {/* Privacy Policy Button */}
                      <TouchableOpacity style={gameStyles.settingRow} onPress={handlePrivacyPolicy}>
                          <View style={gameStyles.settingIconBox}>
                             <Svg width="20" height="20" viewBox="0 0 24 24">
                                <Path fill="#fff" d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z"/>
                             </Svg>
                          </View>
                          <View style={gameStyles.settingInfo}>
                             <Text style={gameStyles.settingLabel}>Privacy Policy</Text>
                             <Text style={gameStyles.settingSub}>Data & Security</Text>
                          </View>
                          <Svg width="24" height="24" viewBox="0 0 24 24">
                              <Path fill="rgba(255,255,255,0.5)" d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/>
                          </Svg>
                      </TouchableOpacity>

                      <View style={{height: 40}} /> 
                      <Text style={{textAlign: 'center', color: 'rgba(255,255,255,0.3)', fontSize: 12}}>@aditya.sonawane 💜 v1.0.0</Text>
                  </ScrollView>
                  
                  {/* Bottom Button Fixed */}
                  <View style={gameStyles.fsBottomBtnContainer}>
                      <TouchableOpacity style={gameStyles.fsBottomBtn} onPress={toggleSettings}>
                         <Text style={gameStyles.fsBottomBtnText}>DONE</Text>
                      </TouchableOpacity>
                  </View>
                </View>
              )}

              {/* PRIVACY POLICY VIEW */}
              {settingsView === 'privacy' && (
                <View style={{flex: 1}}>
                  {/* HEADER */}
                  <View style={gameStyles.fsHeader}>
                    <TouchableOpacity style={gameStyles.fsBackBtn} onPress={() => setSettingsView('menu')}>
                      <Svg width="24" height="24" viewBox="0 0 24 24">
                        <Path fill="#fff" d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
                      </Svg>
                    </TouchableOpacity>
                    <Text style={gameStyles.fsTitle}>PRIVACY POLICY</Text>
                    <View style={gameStyles.fsHeaderSpacer} />
                  </View>

                  <ScrollView contentContainerStyle={gameStyles.fsScrollContent} showsVerticalScrollIndicator={false}>
                      <View style={gameStyles.policyCard}>
                          <Text style={gameStyles.policyHeader}>1. Introduction</Text>
                          <Text style={gameStyles.policyText}>
                             Welcome to Constellation. We respect your privacy and are committed to protecting your personal data. This privacy policy will inform you as to how we look after your personal data when you visit our application and tell you about your privacy rights.
                          </Text>

                          <Text style={gameStyles.policyHeader}>2. Data Collection</Text>
                          <Text style={gameStyles.policyText}>
                             We do not collect personal data (PII) such as names, emails, or phone numbers. All game progress, including levels unlocked and settings preferences, is stored locally on your device using native storage solutions.
                          </Text>
                          
                          <Text style={gameStyles.policyHeader}>3. Device Permissions</Text>
                          <Text style={gameStyles.policyText}>
                             The app may request access to features like Haptics (Vibration) and Audio. These permissions are used strictly for gameplay enhancement and can be toggled in the settings menu at any time.
                          </Text>

                          <Text style={gameStyles.policyHeader}>4. Third-Party Services</Text>
                          <Text style={gameStyles.policyText}>
                             We do not share data with third-party advertising networks or analytics providers. Your gameplay experience is completely private and offline-capable.
                          </Text>

                          <Text style={gameStyles.policyHeader}>5. Updates</Text>
                          <Text style={gameStyles.policyText}>
                             We may update our Privacy Policy from time to time. Thus, you are advised to review this page periodically for any changes.
                          </Text>

                          <Text style={gameStyles.policyHeader}>6. Contact Us</Text>
                          <Text style={gameStyles.policyText}>
                             If you have any questions or suggestions about our Privacy Policy, do not hesitate to contact us at support@constellationgame.com.
                          </Text>
                          
                          <Text style={[gameStyles.policyText, {marginTop: 30, fontSize: 12, opacity: 0.5, textAlign:'center'}]}>
                             Last updated: November 2023
                          </Text>
                      </View>
                  </ScrollView>
                </View>
              )}
              </SafeAreaView>
           </LinearGradient>
        </Animated.View>
      )}

      {/* FULL SCREEN HELP MODAL */}
      {showHelp && (
        <Animated.View style={[gameStyles.fullScreenModal, { opacity: helpFadeAnim }]}>
           <LinearGradient colors={["#667eea", "#764ba2", "#f093fb"]} style={gameStyles.fullScreenGradient}>
              {/* Insert Particles Here */}
              <ParticleBackground />
              <SafeAreaView style={gameStyles.fsSafeArea}>
                <View style={{flex: 1}}>
                  {/* HEADER */}
                  <View style={gameStyles.fsHeader}>
                    <View style={gameStyles.fsHeaderSpacer} />
                    <Text style={gameStyles.fsTitle}>HOW TO PLAY</Text>
                    <TouchableOpacity style={gameStyles.fsCloseBtn} onPress={toggleHelp}>
                      <Svg width="24" height="24" viewBox="0 0 24 24">
                        <Path fill="#fff" d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                      </Svg>
                    </TouchableOpacity>
                  </View>

                  <ScrollView contentContainerStyle={gameStyles.fsScrollContent} showsVerticalScrollIndicator={false}>
                      {/* LOGO ANIMATION SECTION */}
                      <View style={{ alignItems: 'center', marginVertical: 30 }}>
                        <View style={gameStyles.logoGlowContainer}>
                          <Svg height="120" width="120" viewBox="0 0 100 100">
                            <Defs>
                              <RadialGradient id="logoGlow" cx="50%" cy="50%">
                                <Stop offset="0%" stopColor="#FFD700" stopOpacity="0.6" />
                                <Stop offset="50%" stopColor="#FFA500" stopOpacity="0.3" />
                                <Stop offset="100%" stopColor="#FFA500" stopOpacity="0" />
                              </RadialGradient>
                              <RadialGradient id="nodeGlow" cx="50%" cy="50%">
                                <Stop offset="0%" stopColor="#FFD700" stopOpacity="1" />
                                <Stop offset="100%" stopColor="#FFA500" stopOpacity="0.8" />
                              </RadialGradient>
                            </Defs>
                            <Circle cx="50" cy="50" r="48" fill="url(#logoGlow)" />
                            <Circle cx="50" cy="50" r="38" fill="rgba(255,255,255,0.15)" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" />
                            <Circle cx="50" cy="50" r="32" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1" strokeDasharray="4,4" />
                            <Path d="M50,25 L70,65 L30,65 Z" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                            <Circle cx="50" cy="25" r="5" fill="url(#nodeGlow)" />
                            <Circle cx="70" cy="65" r="5" fill="url(#nodeGlow)" />
                            <Circle cx="30" cy="65" r="5" fill="url(#nodeGlow)" />
                          </Svg>
                        </View>
                      </View>

                      {/* RULES SECTION */}
                      <View style={gameStyles.rulesContainer}>
                        <View style={gameStyles.ruleCard}>
                          <View style={gameStyles.ruleNumberBadge}><Text style={gameStyles.ruleNumberText}>1</Text></View>
                          <View style={gameStyles.ruleContent}>
                            <Text style={gameStyles.ruleTitle}>Start at any node</Text>
                            <Text style={gameStyles.ruleDescription}>Tap a circle to begin your path</Text>
                          </View>
                        </View>
                        <View style={gameStyles.ruleCard}>
                          <View style={gameStyles.ruleNumberBadge}><Text style={gameStyles.ruleNumberText}>2</Text></View>
                          <View style={gameStyles.ruleContent}>
                            <Text style={gameStyles.ruleTitle}>Connect all lines</Text>
                            <Text style={gameStyles.ruleDescription}>Trace through every single grey path</Text>
                          </View>
                        </View>
                        <View style={gameStyles.ruleCard}>
                          <View style={gameStyles.ruleNumberBadge}><Text style={gameStyles.ruleNumberText}>3</Text></View>
                          <View style={gameStyles.ruleContent}>
                            <Text style={gameStyles.ruleTitle}>One continuous stroke</Text>
                            <Text style={gameStyles.ruleDescription}>You cannot lift your finger or trace back</Text>
                          </View>
                        </View>
                      </View>
                  </ScrollView>

                  {/* BOTTOM BUTTON */}
                  <View style={gameStyles.fsBottomBtnContainer}>
                      <TouchableOpacity style={gameStyles.fsBottomBtn} onPress={toggleHelp}>
                         <Text style={gameStyles.fsBottomBtnText}>START PLAYING</Text>
                      </TouchableOpacity>
                  </View>
                </View>
              </SafeAreaView>
           </LinearGradient>
        </Animated.View>
      )}
    </LinearGradient>
  );
}

// =================================================
// COMPONENT 3: APP ORCHESTRATOR
// =================================================
export default function App() {
  const [currentScreen, setCurrentScreen] = useState("splash");

  if (currentScreen === "splash") {
    return <SplashScreen onStart={() => setCurrentScreen("game")} />;
  }

  return <LineDrawingGame />;
}

// =================================================
// STYLES
// =================================================
const splashStyles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  logoContainer: { width: 200, height: 200, justifyContent: 'center', alignItems: 'center', marginBottom: 40 },
  title: { fontSize: 30, fontWeight: "900", color: "#fff", letterSpacing: 3 },
  subtitle: { fontSize: 12, fontWeight: "600", color: "rgba(255,255,255,0.7)", letterSpacing: 6, marginTop: 10, marginBottom: 60 },
  button: { backgroundColor: "#fff", paddingVertical: 12, paddingHorizontal: 40, borderRadius: 30, shadowColor: "#000", shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.3, shadowRadius: 20, elevation: 10 },
  buttonText: { color: "#764ba2", fontSize: 16, fontWeight: "bold", letterSpacing: 1 },
});

const gameStyles = StyleSheet.create({
  container: { flex: 1 },
  // Handle safe area for main header specifically
  headerWrapper: { paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 20 : 60, paddingHorizontal: 20, paddingBottom: 20 },
   
  // NEW SYMMETRIC TOP BAR
  topControlBar: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 20 },

  // Round Glass Buttons
  roundGlassButton: { width: 56, height: 56, borderRadius: 28, backgroundColor: "rgba(255,255,255,0.25)", borderWidth: 1, borderColor: "rgba(255,255,255,0.3)", justifyContent: "center", alignItems: "center" },
  helpButtonText: { fontSize: 28, fontWeight: "900", color: "white" },

  // Center Capsule
  levelCapsule: { height: 56, paddingHorizontal: 20, borderRadius: 28, backgroundColor: "rgba(255,255,255,0.15)", borderWidth: 1, borderColor: "rgba(255,255,255,0.3)", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 12 },
  levelText: { fontSize: 18, fontWeight: "900", color: "#ffffff", letterSpacing: 0.5 },
  difficultyDot: { width: 8, height: 8, borderRadius: 4 },
  diffText: { fontSize: 12, fontWeight: "700", color: "rgba(255,255,255,0.8)", letterSpacing: 1 },

  // Progress Section
  progressSection: { width: '100%' },
  progressLabelRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8, paddingHorizontal: 4 },
  progressLabel: { fontSize: 11, fontWeight: '700', color: 'rgba(255,255,255,0.7)', letterSpacing: 1 },
  progressCountText: { fontSize: 12, fontWeight: '900', color: '#ffffff' },
   
  progressBarContainer: { height: 6, backgroundColor: "rgba(255, 255, 255, 0.15)", borderRadius: 3, overflow: "hidden" },
  progressBarFill: { height: "100%", borderRadius: 3 },

  gameArea: { flex: 1, justifyContent: "center", alignItems: "center" },
  ghostPointer: { position: 'absolute', top: 0, left: 0, width: 40, height: 40, zIndex: 20, pointerEvents: 'none' },
   
  // Footer & Hint Button
  footer: { paddingHorizontal: 30, paddingBottom: 40, alignItems: "center" },
  hintButton: { marginBottom: 15, borderRadius: 30, shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 5, elevation: 5 },
  hintButtonGradient: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 20, borderRadius: 30 },
  hintButtonText: { color: '#764ba2', fontWeight: '800', marginLeft: 8, fontSize: 14, letterSpacing: 1 },
  instruction: { fontSize: 15, color: "rgba(255, 255, 255, 0.85)", textAlign: "center", fontWeight: "500" },
   
  fullScreenWin: { ...StyleSheet.absoluteFillObject, zIndex: 50 },
  fullScreenWinGradient: { flex: 1, justifyContent: "center", alignItems: "center", padding: 30 },
  winIconContainer: { marginBottom: 30, shadowColor: "#FFD700", shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.8, shadowRadius: 20 },
  winTitle: { fontSize: 24, color: "rgba(255,255,255,0.8)", fontWeight: "600", letterSpacing: 4, marginBottom: 10 },
  winSubtitle: { fontSize: 35, color: "#ffffff", fontWeight: "800", marginBottom: 40, textAlign: 'center', textShadowColor: 'rgba(0,0,0,0.2)', textShadowOffset: {width: 0, height: 4}, textShadowRadius: 10 },
  statsContainer: { marginBottom: 50, backgroundColor: 'rgba(255,255,255,0.2)', paddingVertical: 10, paddingHorizontal: 30, borderRadius: 30 },
  statText: { color: 'white', fontSize: 18, fontWeight: '500' },
  bigNextButton: { backgroundColor: "#ffffff", paddingVertical: 20, paddingHorizontal: 60, borderRadius: 50, shadowColor: "#000", shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.3, shadowRadius: 20, elevation: 15 },
  bigNextButtonText: { color: "#667eea", fontSize: 20, fontWeight: "900", letterSpacing: 1 },

  // Full Screen Modal (Settings & Help)
  fullScreenModal: { ...StyleSheet.absoluteFillObject, zIndex: 200 },
  fullScreenGradient: { flex: 1 },
  fsSafeArea: { flex: 1, paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 10 : 10 },
   
  fsHeader: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    paddingHorizontal: 24, 
    paddingVertical: 2,
    marginBottom: 1,
  },
  fsHeaderSpacer: { width: 44 }, // Matches button width approx for balance
  fsTitle: { 
    fontSize: 20,
    fontWeight: '900', 
    color: 'white', 
    letterSpacing: 2, 
    textAlign: 'center',
    flex: 1 
  },
  fsCloseBtn: { 
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)' 
  },
  fsBackBtn: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)'
  },
   
  fsScrollContent: { 
    padding: 20, 
    paddingBottom: 120 
  },
   
  fsBottomBtnContainer: {
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 20 : 30, // Extra padding for home indicator / android nav
  },
  fsBottomBtn: { 
    backgroundColor: 'white', 
    paddingVertical: 16, 
    borderRadius: 30, 
    alignItems: 'center', 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 4 }, 
    shadowOpacity: 0.2, 
    shadowRadius: 8, 
    elevation: 4 
  },
  fsBottomBtnText: { color: '#764ba2', fontWeight: '900', fontSize: 16, letterSpacing: 1 },
   
  // Settings Specific
  settingsContainer: { width: '100%', marginBottom: 30 },
  settingSectionTitle: { color: 'rgba(255,255,255,0.5)', fontSize: 11, fontWeight: '700', letterSpacing: 1.5, marginBottom: 10, marginLeft: 6, marginTop: 10 },
  settingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'rgba(255,255,255,0.15)', paddingVertical: 16, paddingHorizontal: 20, borderRadius: 20, marginBottom: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  settingIconBox: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  settingInfo: { flex: 1 },
  settingLabel: { color: 'white', fontSize: 16, fontWeight: '700', marginBottom: 2 },
  settingSub: { color: 'rgba(255,255,255,0.6)', fontSize: 12 },

  // Privacy Policy Specific
  policyCard: { 
    backgroundColor: 'rgba(255,255,255,0.15)', 
    borderRadius: 24, 
    padding: 24, 
    marginBottom: 40, 
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  policyHeader: { 
    fontSize: 18, 
    fontWeight: '800', 
    color: '#ffffff', 
    marginBottom: 12, 
    marginTop: 24, 
    letterSpacing: 0.5 
  },
  policyText: { 
    fontSize: 15, 
    color: 'rgba(255,255,255,0.9)', 
    lineHeight: 24, 
    fontWeight: '400' 
  },

  // Rules Specific
  rulesContainer: { width: '100%', marginBottom: 25 },
  ruleCard: { flexDirection: 'row', width: '100%', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.15)', paddingVertical: 16, paddingHorizontal: 20, borderRadius: 20, marginBottom: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.25)' },
  ruleNumberBadge: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.3)', borderWidth: 2, borderColor: 'rgba(255,255,255,0.5)', justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  ruleNumberText: { fontSize: 18, fontWeight: '900', color: 'white' },
  ruleContent: { flex: 1 },
  ruleTitle: { fontSize: 16, fontWeight: '800', color: '#ffffff', marginBottom: 4, letterSpacing: 0.2 },
  ruleDescription: { fontSize: 13, color: 'rgba(255,255,255,0.75)', lineHeight: 18, fontWeight: '500' },
   
  logoGlowContainer: { shadowColor: "#FFD700", shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.8, shadowRadius: 20 },
});