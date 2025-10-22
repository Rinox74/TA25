

import React from 'react';
import { Article } from '../../../types';
import { Button } from '../../ui/Button';
import { ArrowLeft } from 'lucide-react';

interface ArticleDetailProps {
  article: Article;
  setView: (view: string) => void;
}

export const ArticleDetail: React.FC<ArticleDetailProps> = ({ article, setView }) => {
  if (!article) {
    return (
      <div className="p-8 text-center">
        <p>Articolo non trovato.</p>
        <Button onClick={() => setView('articles')} className="mt-4">Torna agli articoli</Button>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
        <button onClick={() => setView('articles')} className="inline-flex items-center gap-2 text-primary-600 dark:text-primary-400 hover:underline mb-6">
            <ArrowLeft className="w-4 h-4" />
            Torna a tutti gli articoli
        </button>

        <div className="max-w-4xl mx-auto bg-white dark:bg-slate-800 rounded-lg shadow-xl overflow-hidden">
            <img src={article.image} alt={article.title} className="w-full h-64 md:h-96 object-cover" />
            <div className="p-6 md:p-10">
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">
                    Pubblicato il {new Date(article.createdAt).toLocaleDateString('it-IT')}
                </p>
                <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white mb-6">
                    {article.title}
                </h1>
                <div className="prose prose-lg dark:prose-invert max-w-none text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                    {article.content}
                </div>
            </div>
        </div>
    </div>
  );
};