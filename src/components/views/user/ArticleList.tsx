

import React from 'react';
import { useData } from '../../../contexts/DataContext';
import { Article } from '../../../types';

interface ArticleListProps {
    setView: (view: string, data?: any) => void;
}

const ArticleCard: React.FC<{article: Article, onClick: () => void}> = ({ article, onClick }) => (
    <div onClick={onClick} className="bg-white dark:bg-slate-800 rounded-lg shadow-lg overflow-hidden cursor-pointer group transform hover:-translate-y-1 transition-transform duration-300">
        <img src={article.image} alt={article.title} className="w-full h-48 object-cover" />
        <div className="p-6">
            <h3 className="text-xl font-bold text-slate-800 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">{article.title}</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{new Date(article.createdAt).toLocaleDateString('it-IT')}</p>
            <p className="mt-3 text-slate-600 dark:text-slate-300 line-clamp-3">
                {article.content}
            </p>
        </div>
    </div>
);


export const ArticleList: React.FC<ArticleListProps> = ({ setView }) => {
    const { articles } = useData();

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <h1 className="text-3xl font-bold text-slate-800 dark:text-white mb-6">Tutti gli Articoli</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {articles.map(article => (
                    <ArticleCard key={article.id} article={article} onClick={() => setView('article-detail', article)} />
                ))}
            </div>
        </div>
    );
};