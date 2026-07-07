import React from 'react';
import type { Theory } from '../../types/content';

const TheoryView: React.FC<{ theory: Theory }> = ({ theory }) => {
    return (
        <div className="card">
            <h3 className="flex items-center gap-2 text-xl font-semibold text-dark">
                📖 {theory.title}
                {theory.titleTuvan && (
                    <span className="text-sm font-medium text-terracotta">
                        {theory.titleTuvan}
                    </span>
                )}
            </h3>
            <div
                className="mt-3 prose prose-strong:text-terracotta prose-a:text-olive max-w-none text-dark/80"
                dangerouslySetInnerHTML={{ __html: theory.content }}
            />
            {theory.listItems && (
                <ul className="mt-3 space-y-1 list-disc list-inside text-dark/80">
                    {theory.listItems.map((item, i) => (
                        <li key={i}>{item}</li>
                    ))}
                </ul>
            )}
            {theory.tableData && (
                <table className="w-full mt-3 border border-collapse border-cream">
                    <thead>
                        <tr className="bg-cream">
                            {theory.tableData.headers.map((h, i) => (
                                <th
                                    key={i}
                                    className="px-4 py-2 text-left border border-cream"
                                >
                                    {h}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {theory.tableData.rows.map((row, i) => (
                            <tr key={i}>
                                {row.map((cell, j) => (
                                    <td
                                        key={j}
                                        className="px-4 py-2 border border-cream"
                                    >
                                        {cell}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default TheoryView;
