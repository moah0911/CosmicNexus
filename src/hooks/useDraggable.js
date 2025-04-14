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
    onDragStart = () => {},
    onDragEnd = () => {}
  } = options;

  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState(initialPosition);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [elementOffset, setElementOffset] = useState({ x: 0, y: 0 });

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

    // Get element's current position
    const rect = ref.current.getBoundingClientRect();
    setElementOffset({
      x: rect.left,
      y: rect.top
    });

    // Get coordinates
    const coords = getClientCoords(e);

    // Store the initial position
    setStartPos({
      x: coords.clientX,
      y: coords.clientY,
    });

    // Call onDragStart callback
    onDragStart();
  }, [disabled, ref, getClientCoords, onDragStart]);

  // Handle dragging (mouse move or touch move)
  const handleMove = useCallback((e) => {
    if (!isDragging || !ref.current) return;

    // Get coordinates
    const coords = getClientCoords(e);

    // Calculate new position (delta from start position + initial element position)
    let deltaX = coords.clientX - startPos.x;
    let deltaY = coords.clientY - startPos.y;

    let newX = elementOffset.x + deltaX;
    let newY = elementOffset.y + deltaY;

    // Apply bounds if provided
    if (bounds) {
      const rect = ref.current.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;

      // Get header and footer heights (if they exist)
      const header = document.querySelector('nav');
      const footer = document.querySelector('footer');
      const headerHeight = header ? header.offsetHeight : 0;
      const footerHeight = footer ? footer.offsetHeight : 0;

      // Ensure the modal stays within the viewport and respects header/footer
      if (newX < 0) newX = 0;
      if (newY < headerHeight + 10) newY = headerHeight + 10; // Add padding from header
      if (newX + width > window.innerWidth) newX = window.innerWidth - width;
      if (newY + height > window.innerHeight - footerHeight - 10) {
        newY = window.innerHeight - height - footerHeight - 10; // Add padding from footer
      }
    }

    // Update position
    setPosition({ x: newX, y: newY });
  }, [isDragging, startPos, elementOffset, bounds, ref, getClientCoords]);

  // Handle end dragging (mouse up or touch end)
  const handleEnd = useCallback(() => {
    if (isDragging) {
      setIsDragging(false);
      onDragEnd(position);
    }
  }, [isDragging, position, onDragEnd]);

  // Add and remove event listeners for mouse events
  useEffect(() => {
    if (disabled) return;

    // Mouse events
    document.addEventListener('mousemove', handleMove, { passive: false });
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
    element.addEventListener('mousedown', handleStart, { passive: false });

    // Touch events
    element.addEventListener('touchstart', handleStart, { passive: false });

    return () => {
      // Mouse events
      element.removeEventListener('mousedown', handleStart);

      // Touch events
      element.removeEventListener('touchstart', handleStart);
    };
  }, [ref, handleStart, disabled]);

  // Reset position when window is resized
  useEffect(() => {
    if (disabled) return;

    const handleResize = () => {
      if (isDragging) return;

      // Center the modal on resize
      if (ref.current) {
        const rect = ref.current.getBoundingClientRect();
        const newX = (window.innerWidth - rect.width) / 2;
        const newY = (window.innerHeight - rect.height) / 2;

        setPosition({ x: newX, y: newY });
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [disabled, isDragging, ref]);

  // Function to center the element in the viewport with header/footer awareness
  const centerElement = useCallback(() => {
    if (ref.current) {
      const rect = ref.current.getBoundingClientRect();

      // Get header and footer heights (if they exist)
      const header = document.querySelector('nav');
      const footer = document.querySelector('footer');
      const headerHeight = header ? header.offsetHeight : 0;
      const footerHeight = footer ? footer.offsetHeight : 0;

      // Calculate available viewport height accounting for header and footer
      const availableHeight = window.innerHeight - headerHeight - footerHeight;

      // Center horizontally
      const newX = (window.innerWidth - rect.width) / 2;

      // Center vertically in the available space, with slight offset toward the top
      // for better visibility (accounting for header)
      const newY = headerHeight + (availableHeight - rect.height) / 2 - 20;

      // Ensure we don't position offscreen
      const safeX = Math.max(0, Math.min(newX, window.innerWidth - rect.width));
      const safeY = Math.max(headerHeight + 10, Math.min(newY, window.innerHeight - rect.height - footerHeight - 10));

      setPosition({ x: safeX, y: safeY });
    }
  }, [ref]);

  // Initialize position on first render
  useEffect(() => {
    if (!disabled && ref.current) {
      // Use a short timeout to ensure the element is rendered with its final size
      const timer = setTimeout(() => {
        centerElement();
      }, 50);

      return () => clearTimeout(timer);
    }
  }, [disabled, ref, centerElement]);

  return {
    isDragging,
    position,
    setPosition,
    reset: centerElement
  };
};
