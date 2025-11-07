"use client";

import { useEffect, useState } from "react";
import { Toast, ToastProps } from "./toast";
import { createPortal } from "react-dom";

export interface ToastData extends ToastProps {
  id: string;
}

let toastIdCounter = 0;
const toasts: ToastData[] = [];
const listeners = new Set<(toasts: ToastData[]) => void>();

export const toast = {
  success: (title: string, description?: string) => {
    const id = `toast-${++toastIdCounter}`;
    const newToast: ToastData = {
      id,
      title,
      description,
      variant: "success",
    };
    toasts.push(newToast);
    listeners.forEach((listener) => listener([...toasts]));
    
    setTimeout(() => {
      toast.dismiss(id);
    }, 5000);
    
    return id;
  },
  error: (title: string, description?: string) => {
    const id = `toast-${++toastIdCounter}`;
    const newToast: ToastData = {
      id,
      title,
      description,
      variant: "error",
    };
    toasts.push(newToast);
    listeners.forEach((listener) => listener([...toasts]));
    
    setTimeout(() => {
      toast.dismiss(id);
    }, 5000);
    
    return id;
  },
  default: (title: string, description?: string) => {
    const id = `toast-${++toastIdCounter}`;
    const newToast: ToastData = {
      id,
      title,
      description,
      variant: "default",
    };
    toasts.push(newToast);
    listeners.forEach((listener) => listener([...toasts]));
    
    setTimeout(() => {
      toast.dismiss(id);
    }, 5000);
    
    return id;
  },
  dismiss: (id: string) => {
    const index = toasts.findIndex((t) => t.id === id);
    if (index > -1) {
      toasts.splice(index, 1);
      listeners.forEach((listener) => listener([...toasts]));
    }
  },
};

export function Toaster() {
  const [mounted, setMounted] = useState(false);
  const [toastList, setToastList] = useState<ToastData[]>([]);

  useEffect(() => {
    setMounted(true);
    listeners.add(setToastList);
    return () => {
      listeners.delete(setToastList);
    };
  }, []);

  if (!mounted) return null;

  return createPortal(
    <div className="pointer-events-none fixed top-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]">
      {toastList.map((toastItem) => (
        <div
          key={toastItem.id}
          className="pointer-events-auto mb-2 animate-in fade-in slide-in-from-bottom-2"
        >
          <Toast
            {...toastItem}
            onClose={() => {
              toast.dismiss(toastItem.id);
            }}
          />
        </div>
      ))}
    </div>,
    document.body
  );
}
