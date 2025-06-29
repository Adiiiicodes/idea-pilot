'use client';

import { useState, useCallback, useMemo } from 'react';

interface ConceptNode {
  id: string;
  name: string;
  description: string;
  connections: string[];
  position?: { x: number; y: number; z: number };
  category?: string;
}

interface ConceptVisualizerProps {
  concepts: ConceptNode[];
  className?: string;
}

export default function ConceptVisualizer({ concepts, className = '' }: ConceptVisualizerProps) {
  const [selectedConcept, setSelectedConcept] = useState<ConceptNode | null>(null);

  // Memoize the concepts to prevent unnecessary re-renders
  const memoizedConcepts = useMemo(() => concepts, [concepts]);

  // Handle node selection
  const handleNodeClick = useCallback((concept: ConceptNode) => {
    setSelectedConcept(concept);
  }, []);

  return (
    <div className={`w-full bg-dark-card rounded-lg border border-dark-border overflow-hidden ${className}`}>
      {/* Header */}
      <div className="p-4 bg-dark-element flex justify-between items-center">
        <h3 className="font-bold font-cabin text-dark-text">Concept Visualizer</h3>
        <div className="text-sm text-dark-text-secondary">
          {memoizedConcepts.length} concepts connected
        </div>
      </div>
      
      {/* 2D Mind Map */}
      <div className="w-full h-96 relative cursor-pointer">
        <svg 
          width="100%" 
          height="100%" 
          className="w-full h-full"
          viewBox="0 0 800 400"
        >
          {/* Background */}
          <rect width="100%" height="100%" fill="#0f172a" />
          
          {/* Connection lines */}
          {memoizedConcepts.map((concept, index) => {
            const centerX = 400;
            const centerY = 200;
            const radius = 120;
            const angle = (index * 2 * Math.PI) / memoizedConcepts.length;
            const x = centerX + radius * Math.cos(angle);
            const y = centerY + radius * Math.sin(angle);
            
            return concept.connections.map(connId => {
              const targetIndex = memoizedConcepts.findIndex(c => c.id === connId);
              if (targetIndex === -1) return null;
              
              const targetAngle = (targetIndex * 2 * Math.PI) / memoizedConcepts.length;
              const targetX = centerX + radius * Math.cos(targetAngle);
              const targetY = centerY + radius * Math.sin(targetAngle);
              
              return (
                <line
                  key={`${concept.id}-${connId}`}
                  x1={x}
                  y1={y}
                  x2={targetX}
                  y2={targetY}
                  stroke="#6366f1"
                  strokeWidth="2"
                  opacity="0.6"
                />
              );
            });
          })}
          
          {/* Concept nodes */}
          {memoizedConcepts.map((concept, index) => {
            const centerX = 400;
            const centerY = 200;
            const radius = 120;
            const angle = (index * 2 * Math.PI) / memoizedConcepts.length;
            const x = centerX + radius * Math.cos(angle);
            const y = centerY + radius * Math.sin(angle);
            const isSelected = selectedConcept?.id === concept.id;
            
            return (
              <g key={concept.id}>
                {/* Glow effect for selected node */}
                {isSelected && (
                  <circle
                    cx={x}
                    cy={y}
                    r="35"
                    fill="#6366f1"
                    opacity="0.3"
                  />
                )}
                
                {/* Node circle */}
                <circle
                  cx={x}
                  cy={y}
                  r="30"
                  fill={index === 0 ? "#6366f1" : "#10b981"}
                  stroke={isSelected ? "#f59e0b" : "#374151"}
                  strokeWidth={isSelected ? "3" : "2"}
                  className="cursor-pointer hover:stroke-yellow-400 transition-all duration-200"
                  onClick={() => handleNodeClick(concept)}
                />
                
                {/* Node label */}
                <text
                  x={x}
                  y={y + 5}
                  textAnchor="middle"
                  fill="white"
                  fontSize="10"
                  fontWeight="bold"
                  className="pointer-events-none"
                >
                  {concept.name.length > 8 ? concept.name.substring(0, 8) + '...' : concept.name}
                </text>
                
                {/* Connection count */}
                <text
                  x={x}
                  y={y + 20}
                  textAnchor="middle"
                  fill="#9ca3af"
                  fontSize="8"
                  className="pointer-events-none"
                >
                  {concept.connections.length} conn
                </text>
              </g>
            );
          })}
        </svg>
      </div>
      
      {/* Concept Details */}
      {selectedConcept && (
        <div className="p-4 border-t border-dark-border bg-gradient-to-r from-primary-purple/10 to-primary-blue/10">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h4 className="text-xl font-bold font-cabin text-dark-text mb-2">
                {selectedConcept.name}
              </h4>
              <p className="text-dark-text font-source text-sm leading-relaxed">
                {selectedConcept.description}
              </p>
            </div>
            <button
              onClick={() => setSelectedConcept(null)}
              className="ml-4 p-1 text-dark-text-secondary hover:text-dark-text transition-colors"
            >
              ✕
            </button>
          </div>
          
          {selectedConcept.connections.length > 0 && (
            <div className="mt-4">
              <h5 className="font-medium text-dark-text font-cabin mb-2">Connected Concepts:</h5>
              <div className="flex flex-wrap gap-2">
                {selectedConcept.connections.map(connId => {
                  const concept = memoizedConcepts.find(c => c.id === connId);
                  return concept ? (
                    <button
                      key={connId}
                      className="px-3 py-1 bg-dark-element text-dark-text text-sm rounded-full border border-dark-border hover:bg-dark-border transition-colors"
                      onClick={() => setSelectedConcept(concept)}
                    >
                      {concept.name}
                    </button>
                  ) : null;
                })}
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* Instructions */}
      {!selectedConcept && (
        <div className="p-4 text-center text-dark-text-secondary border-t border-dark-border">
          <p className="text-sm">Click on any concept to explore details</p>
          <p className="text-xs mt-1">Lines show relationships between concepts</p>
        </div>
      )}
    </div>
  );
} 