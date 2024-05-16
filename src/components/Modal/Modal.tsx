interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children?: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center backdrop-blur-xl animation-fadeIn">
      <div className="text-white p-4 rounded-xl shadow-2xl w-4/5 animation-fadeIn relative shadow-blur bg-black/20">
        <button
          onClick={onClose}
          className="absolute top-1 right-4 text-gray-500/30 text-4xl font-semibold hover:text-gray-300"
          aria-label="Close"
        >
          &times;
        </button>
        {children}
        {/* <button
          onClick={onClose}
          className=" text-white/30 text-sm font-semibold hover:text-gray-300 rounded-2xl px-4 py-2 bg-black/20 w-full mt-4"
          aria-label="Close"
        >
          close
        </button> */}
      </div>
    </div>
  );
};

export default Modal;
