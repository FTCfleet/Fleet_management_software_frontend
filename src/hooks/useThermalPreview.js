import { useState } from 'react';

/**
 * Hook to manage thermal receipt preview
 */
export const useThermalPreview = () => {
  const [previewData, setPreviewData] = useState(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const showPreview = (escPosData) => {
    setPreviewData(escPosData);
    setIsPreviewOpen(true);
  };

  const closePreview = () => {
    setIsPreviewOpen(false);
    setPreviewData(null);
  };

  return {
    previewData,
    isPreviewOpen,
    showPreview,
    closePreview,
  };
};
