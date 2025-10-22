

import React, { useState, useEffect } from 'react';
import { Banner } from '../../types';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { FileUpload } from '../ui/FileUpload';

interface BannerFormProps {
  onSubmit: (banner: Omit<Banner, 'id'>) => void;
  onCancel: () => void;
  bannerToEdit?: Banner | null;
}

export const BannerForm: React.FC<BannerFormProps> = ({ onSubmit, onCancel, bannerToEdit }) => {
  const [clientName, setClientName] = useState('');
  const [targetUrl, setTargetUrl] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  useEffect(() => {
    if (bannerToEdit) {
      setClientName(bannerToEdit.clientName);
      setTargetUrl(bannerToEdit.targetUrl);
      setImageUrl(bannerToEdit.imageUrl);
    } else {
        setClientName('');
        setTargetUrl('');
        setImageUrl('');
    }
  }, [bannerToEdit]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
     if (!clientName || !targetUrl || !imageUrl) {
      alert('Per favore, compila tutti i campi.');
      return;
    }
    onSubmit({ clientName, targetUrl, imageUrl });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input label="Nome Cliente" id="clientName" value={clientName} onChange={(e) => setClientName(e.target.value)} required />
      <Input label="URL di Destinazione" id="targetUrl" type="url" value={targetUrl} onChange={(e) => setTargetUrl(e.target.value)} required />
      <FileUpload label="Immagine Banner" onFileSelect={setImageUrl} currentImageUrl={imageUrl} />
      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="secondary" onClick={onCancel}>Annulla</Button>
        <Button type="submit">{bannerToEdit ? 'Salva Modifiche' : 'Crea Banner'}</Button>
      </div>
    </form>
  );
};