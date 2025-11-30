import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

interface BackButtonProps {
  onClick?: () => void;
  className?: string;
}

function BackButton({ onClick, className }: BackButtonProps) {
  const navigate = useNavigate();

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      navigate(-1);
    }
  };

  return (
    <button
      onClick={handleClick}
      className={`flex items-center gap-2 bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 border border-blue-200 rounded-2xl px-3 py-2 hover:bg-gradient-to-r hover:from-blue-100 hover:to-indigo-100 hover:text-blue-800 hover:border-blue-300 transition-all ${className || ''}`}
    >
      <ArrowLeft className="w-5 h-5" />
      <span className="text-sm sm:text-base font-medium">Буцах</span>
    </button>
  );
}

export default BackButton;
