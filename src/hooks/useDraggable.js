import { useState, useEffect, useCallback } from 'react';

/**
 * A hook to make an element draggable
 * @param {React.RefObject} ref - Reference to the element to make draggable
 * @param {Object} options - Options for the draggable behavior
 * @returns {Object} - Draggable state and handlers
 */
export const useDraggable = (ref, options = {}) => {
  const {
    initialPosition = { x: 0, y: 0 },
    bounds = null,
    disabled = false,
  } = options;

  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState(initialPosition);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });

  // Handle mouse down event to start dragging
  const handleMouseDown = useCallback((e) => {
    if (disabled || !ref.current) return;
    
    // Prevent default behavior to avoid text selection during drag
    e.preventDefault();
    
    // Set dragging state
    setIsDragging(true);
    
    // Store the initial mouse position
    setStartPos({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
  }, [disabled, position, ref]);

  // Handle mouse move event during dragging
  const handleMouseMove = useCallback((e) => {
    if (!isDragging) return;
    
    // Calculate new position
    let newX = e.clientX - startPos.x;
    let newY = e.clientY - startPos.y;
    
    // Apply bounds if provided
    if (bounds && ref.current) {
      const rect = ref.current.getBoundingClientRect();
      
      if (bounds.left !== undefined) {
        newX = Math.max(bounds.left, newX);
      }
      if (bounds.right !== undefined) {
        newX = Math.min(bounds.right - rect.width, newX);
      }
      if (bounds.top !== undefined) {
        newY = Math.max(bounds.top, newY);
      }
      if (bounds.bottom !== undefined) {
        newY = Math.min(bounds.bottom - rect.height, newY);
      }
    }
    
    // Update position
    setPosition({ x: newX, y: newY });
  }, [isDragging, startPos, bounds, ref]);

  // Handle mouse up event to stop dragging
  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Add and remove event listeners
  useEffect(() => {
    if (disabled) return;
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp, disabled]);

  // Add mousedown event listener to the element
  useEffect(() => {
    if (!ref.current || disabled) return;
    
    const element = ref.current;
    element.addEventListener('mousedown', handleMouseDown);
    
    return () => {
      element.removeEventListener('mousedown', handleMouseDown);
    };
  }, [ref, handleMouseDown, disabled]);

  return {
    isDragging,
    position,
    setPosition,
  };
};
