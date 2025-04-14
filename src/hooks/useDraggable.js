import { useState, useEffect, useCallback } from 'react';

/**
 * A hook to make an element draggable with both mouse and touch support
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

  // Get client coordinates from either mouse or touch event
  const getClientCoords = useCallback((e) => {
    // Touch event
    if (e.touches && e.touches.length) {
      return {
        clientX: e.touches[0].clientX,
        clientY: e.touches[0].clientY,
      };
    }
    // Mouse event
    return {
      clientX: e.clientX,
      clientY: e.clientY,
    };
  }, []);

  // Handle start dragging (mouse down or touch start)
  const handleStart = useCallback((e) => {
    if (disabled || !ref.current) return;

    // Prevent default behavior to avoid text selection during drag
    e.preventDefault();

    // Set dragging state
    setIsDragging(true);

    // Get coordinates
    const coords = getClientCoords(e);

    // Store the initial position
    setStartPos({
      x: coords.clientX - position.x,
      y: coords.clientY - position.y,
    });
  }, [disabled, position, ref, getClientCoords]);

  // Handle dragging (mouse move or touch move)
  const handleMove = useCallback((e) => {
    if (!isDragging) return;

    // Get coordinates
    const coords = getClientCoords(e);

    // Calculate new position
    let newX = coords.clientX - startPos.x;
    let newY = coords.clientY - startPos.y;

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
  }, [isDragging, startPos, bounds, ref, getClientCoords]);

  // Handle end dragging (mouse up or touch end)
  const handleEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Add and remove event listeners for mouse events
  useEffect(() => {
    if (disabled) return;

    // Mouse events
    document.addEventListener('mousemove', handleMove);
    document.addEventListener('mouseup', handleEnd);

    // Touch events
    document.addEventListener('touchmove', handleMove, { passive: false });
    document.addEventListener('touchend', handleEnd);
    document.addEventListener('touchcancel', handleEnd);

    return () => {
      // Mouse events
      document.removeEventListener('mousemove', handleMove);
      document.removeEventListener('mouseup', handleEnd);

      // Touch events
      document.removeEventListener('touchmove', handleMove);
      document.removeEventListener('touchend', handleEnd);
      document.removeEventListener('touchcancel', handleEnd);
    };
  }, [handleMove, handleEnd, disabled]);

  // Add event listeners to the element
  useEffect(() => {
    if (!ref.current || disabled) return;

    const element = ref.current;

    // Mouse events
    element.addEventListener('mousedown', handleStart);

    // Touch events
    element.addEventListener('touchstart', handleStart, { passive: false });

    return () => {
      // Mouse events
      element.removeEventListener('mousedown', handleStart);

      // Touch events
      element.removeEventListener('touchstart', handleStart);
    };
  }, [ref, handleStart, disabled]);

  // Update bounds when window is resized
  useEffect(() => {
    if (disabled) return;

    const handleResize = () => {
      if (isDragging) return;

      // Keep the modal within the viewport after resize
      if (bounds && ref.current) {
        const rect = ref.current.getBoundingClientRect();
        let newX = position.x;
        let newY = position.y;

        if (rect.right > window.innerWidth) {
          newX = window.innerWidth - rect.width;
        }

        if (rect.bottom > window.innerHeight) {
          newY = window.innerHeight - rect.height;
        }

        if (newX !== position.x || newY !== position.y) {
          setPosition({ x: newX, y: newY });
        }
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [disabled, isDragging, position, bounds, ref]);

  return {
    isDragging,
    position,
    setPosition,
  };
};
