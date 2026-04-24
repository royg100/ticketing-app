import { X } from 'lucide-react';
import BuyerNavPanel from './BuyerNavPanel';

export default function BuyerNavDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <>
      <div
        className={`fixed inset-0 z-40 transition-opacity duration-300 md:hidden ${
          open ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        style={{ background: 'rgba(0,30,40,0.35)' }}
        onClick={onClose}
        aria-hidden
      />
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-sm z-50 flex flex-col transition-transform duration-300 md:hidden ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
        style={{ background: '#ffffff', borderLeft: '1px solid #ddd6fe' }}
        role="dialog"
        aria-modal="true"
        aria-label="תפריט אירועים"
      >
        <div className="flex items-center justify-between p-4 shrink-0" style={{ borderBottom: '1px solid #ddd6fe' }}>
          <h2 className="font-black text-lg" style={{ color: '#1a1a2e' }}>
            אירועים
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl hover:opacity-80 transition-opacity"
            style={{ color: '#6b5a8a' }}
            aria-label="סגור תפריט"
          >
            <X size={22} />
          </button>
        </div>
        <div className="p-4 flex-1 min-h-0 overflow-hidden flex flex-col">
          <BuyerNavPanel onItemClick={onClose} />
        </div>
      </div>
    </>
  );
}
