import { useCallback, useState } from "react";

type UseConfirmActionOptions<TItem> = {
  onConfirm: (item: TItem) => Promise<void>;
  onError?: (error: unknown) => void;
  onSuccess?: (item: TItem) => void;
};

function useConfirmAction<TItem>({
  onConfirm,
  onError,
  onSuccess,
}: UseConfirmActionOptions<TItem>) {
  const [target, setTarget] = useState<TItem | null>(null);
  const [loading, setLoading] = useState(false);

  const request = useCallback((item: TItem) => {
    setTarget(item);
  }, []);

  const setOpen = useCallback((open: boolean) => {
    if (!open) {
      setTarget(null);
    }
  }, []);

  const confirm = useCallback(async () => {
    if (!target) return;

    setLoading(true);

    try {
      await onConfirm(target);
      setTarget(null);
      onSuccess?.(target);
    } catch (error) {
      onError?.(error);
    } finally {
      setLoading(false);
    }
  }, [onConfirm, onError, onSuccess, target]);

  return {
    confirm,
    loading,
    request,
    setOpen,
    target,
  };
}

export { useConfirmAction };
