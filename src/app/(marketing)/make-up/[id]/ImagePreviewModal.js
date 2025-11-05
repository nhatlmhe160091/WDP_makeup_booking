
// Simple modal for image preview
const ImagePreviewModal = ({ show, image, onClose, total, index }) => {
  if (!show) return null;
  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        background: 'rgba(0,0,0,0.7)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'background 0.2s',
        cursor: 'zoom-out',
      }}
      onClick={onClose}
    >
      <div style={{ position: 'relative', maxWidth: '90vw', maxHeight: '90vh' }}>
        <img
          src={image}
          alt="Xem ảnh lớn"
          style={{
            maxWidth: '90vw',
            maxHeight: '80vh',
            borderRadius: 18,
            boxShadow: '0 8px 32px rgba(0,0,0,0.25)',
            background: '#fff',
            display: 'block',
            margin: '0 auto',
            objectFit: 'contain',
          }}
        />
        <span
          style={{
            position: 'absolute',
            bottom: 12,
            right: 24,
            background: '#ff5c95',
            color: '#fff',
            borderRadius: 12,
            fontSize: 15,
            padding: '4px 16px',
            opacity: 0.95,
            fontWeight: 500,
            letterSpacing: 0.5,
            boxShadow: '0 2px 8px rgba(0,0,0,0.10)'
          }}
        >
          Ảnh {index + 1}/{total}
        </span>
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: 10,
            right: 10,
            background: 'rgba(0,0,0,0.5)',
            color: '#fff',
            border: 'none',
            borderRadius: '50%',
            width: 36,
            height: 36,
            fontSize: 22,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2
          }}
          aria-label="Đóng"
        >
          ×
        </button>
      </div>
    </div>
  );
};
export default ImagePreviewModal;