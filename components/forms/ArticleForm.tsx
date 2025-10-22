
import React, { useState, useEffect } from 'react';
import { Article } from '../../types';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { FileUpload } from '../ui/FileUpload';

interface ArticleFormProps {
  onSubmit: (article: Omit<Article, 'id' | 'createdAt'>) => void;
  onCancel: () => void;
  articleToEdit?: Article | null;
}

export const ArticleForm: React.FC<ArticleFormProps> = ({ onSubmit, onCancel, articleToEdit }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [image, setImage] = useState('');

  useEffect(() => {
    if (articleToEdit) {
      setTitle(articleToEdit.title);
      setContent(articleToEdit.content);
      setImage(articleToEdit.image);
    } else {
        setTitle('');
        setContent('');
        setImage('');
    }
  }, [articleToEdit]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
     if (!title || !content || !image) {
      alert('Per favore, compila tutti i campi.');
      return;
    }
    onSubmit({ title, content, image });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input label="Titolo" id="title" value={title} onChange={(e) => setTitle(e.target.value)} required />
       <div>
          <label htmlFor="content" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Contenuto</label>
          <textarea 
            id="content" 
            value={content} 
            onChange={(e) => setContent(e.target.value)} 
            required 
            rows={10}
            className="block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm dark:bg-slate-700 dark:border-slate-600 dark:text-white"
            />
      </div>
      <FileUpload label="Immagine Articolo" onFileSelect={setImage} currentImageUrl={image} />
      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="secondary" onClick={onCancel}>Annulla</Button>
        <Button type="submit">{articleToEdit ? 'Salva Modifiche' : 'Crea Articolo'}</Button>
      </div>
    </form>
  );
};
