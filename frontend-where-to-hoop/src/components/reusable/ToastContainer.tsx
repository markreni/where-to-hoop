import { useToast, type Toast, type ToastType } from '../../contexts/ToastContext';
import { IoMdClose } from 'react-icons/io';
import { FaCheckCircle, FaExclamationCircle, FaInfoCircle, FaExclamationTriangle } from 'react-icons/fa';

const toastStyles: Record<ToastType, { bg: string; icon: typeof FaCheckCircle }> = {
  success: {
    bg: 'bg-green-500',
    icon: FaCheckCircle,
  },
  error: {
    bg: 'bg-red-500',
    icon: FaExclamationCircle,
  },
  info: {
    bg: 'bg-blue-500',
    icon: FaInfoCircle,
  },
  warning: {
    bg: 'bg-amber-500',
    icon: FaExclamationTriangle,
  },
};

const ToastItem = ({ toast }: { toast: Toast }) => {
  const { removeToast } = useToast();
  const { bg, icon: Icon } = toastStyles[toast.type];

  return (
    <div
      className={`${bg} text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 min-w-72 max-w-md animate-slide-in`}
      role="alert"
    >
      <Icon size={20} className="flex-shrink-0" />
      <p className="flex-grow text-sm font-medium">{toast.message}</p>
      <button
        onClick={() => removeToast(toast.id)}
        className="flex-shrink-0 p-1 rounded hover:bg-white/20 transition-colors cursor-pointer"
        aria-label="Close"
      >
        <IoMdClose size={18} />
      </button>
    </div>
  );
};

const ToastContainer = () => {
  const { toasts } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-24 right-4 z-[9999] flex flex-col gap-2">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} />
      ))}
    </div>
  );
};

export { ToastContainer };
