import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Button, Typography } from 'antd';
import { 
  CloseOutlined, 
  MinusOutlined, 
  FullscreenOutlined, 
  FullscreenExitOutlined,
  DragOutlined
} from '@ant-design/icons';
import ConnectionViewer from './ConnectionViewer';

const { Text } = Typography;

// Throttle function to limit the frequency of function calls
const throttle = (func, limit) => {
  let inThrottle;
  return function() {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

const FloatingWindow = ({ 
  window, 
  onClose, 
  onMinimize, 
  onMaximize, 
  onBringToFront, 
  onMove, 
  onResize 
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const windowRef = useRef(null);

  // Throttled move and resize functions
  const throttledMove = useCallback(
    throttle((windowId, x, y) => onMove(windowId, x, y), 16), // 60fps
    [onMove]
  );

  const throttledResize = useCallback(
    throttle((windowId, width, height) => onResize(windowId, width, height), 16), // 60fps
    [onResize]
  );

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (isDragging) {
        const newX = e.clientX - dragOffset.x;
        const newY = e.clientY - dragOffset.y;
        const clampedX = Math.max(0, Math.min(window.innerWidth - 300, newX));
        const clampedY = Math.max(0, Math.min(window.innerHeight - 100, newY));
        throttledMove(window.id, clampedX, clampedY);
      }
      
      if (isResizing) {
        const newWidth = Math.max(400, Math.min(window.innerWidth - window.x, resizeStart.width + (e.clientX - resizeStart.x)));
        const newHeight = Math.max(300, Math.min(window.innerHeight - window.y, resizeStart.height + (e.clientY - resizeStart.y)));
        throttledResize(window.id, newWidth, newHeight);
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setIsResizing(false);
    };

    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, isResizing, dragOffset, resizeStart, window.id, window.x, window.y, throttledMove, throttledResize]);

  const handleTitleBarMouseDown = useCallback((e) => {
    if (e.target.closest('.window-controls')) return;
    
    const rect = windowRef.current.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
    setIsDragging(true);
    onBringToFront(window.id);
  }, [window.id, onBringToFront]);

  const handleResizeMouseDown = useCallback((e) => {
    e.preventDefault();
    setResizeStart({
      x: e.clientX,
      y: e.clientY,
      width: window.width,
      height: window.height
    });
    setIsResizing(true);
    onBringToFront(window.id);
  }, [window.id, window.width, window.height, onBringToFront]);

  const handleWindowClick = useCallback(() => {
    onBringToFront(window.id);
  }, [window.id, onBringToFront]);

  if (window.minimized) {
    return null; // Minimized windows are handled by taskbar
  }

  const windowStyle = {
    position: 'absolute',
    left: window.maximized ? 0 : window.x,
    top: window.maximized ? 0 : window.y,
    width: window.maximized ? '100vw' : window.width,
    height: window.maximized ? '100vh' : window.height,
    backgroundColor: '#fff',
    border: '1px solid #d9d9d9',
    borderRadius: window.maximized ? 0 : '8px',
    boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
    zIndex: window.zIndex,
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    cursor: isDragging ? 'grabbing' : 'default'
  };

  return (
    <div 
      ref={windowRef}
      style={windowStyle}
      onClick={handleWindowClick}
    >
      {/* Title Bar */}
      <div 
        style={{
          height: '40px',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 12px',
          cursor: isDragging ? 'grabbing' : 'grab',
          userSelect: 'none'
        }}
        onMouseDown={handleTitleBarMouseDown}
      >
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <DragOutlined style={{ color: 'rgba(255,255,255,0.8)', marginRight: '8px' }} />
          <Text style={{ color: 'white', fontWeight: 600, fontSize: '14px' }}>
            {window.title}
          </Text>
        </div>
        
        <div className="window-controls" style={{ display: 'flex', gap: '4px' }}>
          <Button
            type="text"
            size="small"
            icon={<MinusOutlined />}
            onClick={() => onMinimize(window.id)}
            style={{ 
              color: 'rgba(255,255,255,0.8)',
              border: 'none',
              width: '28px',
              height: '28px'
            }}
          />
          <Button
            type="text"
            size="small"
            icon={window.maximized ? <FullscreenExitOutlined /> : <FullscreenOutlined />}
            onClick={() => onMaximize(window.id)}
            style={{ 
              color: 'rgba(255,255,255,0.8)',
              border: 'none',
              width: '28px',
              height: '28px'
            }}
          />
          <Button
            type="text"
            size="small"
            icon={<CloseOutlined />}
            onClick={() => onClose(window.id)}
            style={{ 
              color: 'rgba(255,255,255,0.8)',
              border: 'none',
              width: '28px',
              height: '28px'
            }}
          />
        </div>
      </div>

      {/* Content Area */}
      <div style={{ flex: 1, overflow: 'hidden' }}>
        {window.server ? (
          <ConnectionViewer server={window.server} />
        ) : (
          <div style={{ 
            padding: '20px',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#f5f5f5'
          }}>
            <Text type="secondary">{window.content}</Text>
          </div>
        )}
      </div>

      {/* Resize Handle */}
      {!window.maximized && (
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            right: 0,
            width: '16px',
            height: '16px',
            background: 'linear-gradient(135deg, transparent 0%, #d9d9d9 50%)',
            cursor: 'se-resize',
            zIndex: 1000
          }}
          onMouseDown={handleResizeMouseDown}
        />
      )}
    </div>
  );
};

export default FloatingWindow;
