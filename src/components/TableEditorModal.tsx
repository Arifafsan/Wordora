/**
 * Table Creation and Cell Manipulation Modal / Toolbar
 */

import React, { useState } from 'react';
import { Table, Plus, Trash2, Palette, X, Columns, Rows } from 'lucide-react';

interface TableEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInsertTable: (rows: number, cols: number) => void;
  activeCell: HTMLElement | null;
  onTableAction: (action: 'addRowAbove' | 'addRowBelow' | 'deleteRow' | 'addColLeft' | 'addColRight' | 'deleteCol' | 'deleteTable' | 'setBg', param?: string) => void;
}

export const TableEditorModal: React.FC<TableEditorModalProps> = ({
  isOpen,
  onClose,
  onInsertTable,
  activeCell,
  onTableAction
}) => {
  const [rows, setRows] = useState(3);
  const [cols, setCols] = useState(3);
  const [selectedBg, setSelectedBg] = useState('#f8fafc');

  if (!isOpen) return null;

  const bgColors = ['#ffffff', '#f8fafc', '#f1f5f9', '#e2e8f0', '#fee2e2', '#fef3c7', '#dcfce7', '#dbeafe', '#f3e8ff'];

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-150">
      <div 
        className="w-full sm:max-w-md bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden max-h-[85vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Table className="w-4 h-4" />
            </div>
            <h3 className="font-semibold text-slate-900 dark:text-white text-base">
              {activeCell ? 'Table Tools & Cells' : 'Insert New Table'}
            </h3>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 overflow-y-auto space-y-5">
          {activeCell ? (
            /* Contextual Controls for currently selected table */
            <div className="space-y-4">
              <div className="p-3 bg-blue-50 dark:bg-blue-950/40 rounded-xl border border-blue-100 dark:border-blue-900 text-xs text-blue-800 dark:text-blue-200">
                You are currently inside a table. Modify rows, columns, or cell styling below.
              </div>

              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Rows</p>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => { onTableAction('addRowAbove'); onClose(); }}
                    className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-200"
                  >
                    <Plus className="w-3.5 h-3.5 text-blue-600" /> Above
                  </button>
                  <button
                    onClick={() => { onTableAction('addRowBelow'); onClose(); }}
                    className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-200"
                  >
                    <Plus className="w-3.5 h-3.5 text-blue-600" /> Below
                  </button>
                  <button
                    onClick={() => { onTableAction('deleteRow'); onClose(); }}
                    className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border border-red-200 dark:border-red-900/50 hover:bg-red-50 dark:hover:bg-red-950/30 text-xs font-medium text-red-600"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Row
                  </button>
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Columns</p>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => { onTableAction('addColLeft'); onClose(); }}
                    className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-200"
                  >
                    <Plus className="w-3.5 h-3.5 text-blue-600" /> Left
                  </button>
                  <button
                    onClick={() => { onTableAction('addColRight'); onClose(); }}
                    className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-200"
                  >
                    <Plus className="w-3.5 h-3.5 text-blue-600" /> Right
                  </button>
                  <button
                    onClick={() => { onTableAction('deleteCol'); onClose(); }}
                    className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border border-red-200 dark:border-red-900/50 hover:bg-red-50 dark:hover:bg-red-950/30 text-xs font-medium text-red-600"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Col
                  </button>
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Cell Shading</p>
                <div className="flex items-center gap-2 flex-wrap">
                  {bgColors.map(color => (
                    <button
                      key={color}
                      onClick={() => {
                        setSelectedBg(color);
                        onTableAction('setBg', color);
                      }}
                      className="w-7 h-7 rounded-lg border border-slate-300 dark:border-slate-600 transition-transform hover:scale-110"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => { onTableAction('deleteTable'); onClose(); }}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-red-50 dark:bg-red-950/30 text-red-600 font-medium text-sm hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
                >
                  <Trash2 className="w-4 h-4" /> Delete Entire Table
                </button>
              </div>
            </div>
          ) : (
            /* Insert New Table Form */
            <div className="space-y-4">
              <div>
                <label className="flex items-center justify-between text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  <span className="flex items-center gap-2">
                    <Rows className="w-4 h-4 text-slate-400" /> Rows
                  </span>
                  <span className="font-semibold text-blue-600">{rows}</span>
                </label>
                <input
                  type="range"
                  min="1"
                  max="12"
                  value={rows}
                  onChange={e => setRows(Number(e.target.value))}
                  className="w-full accent-blue-600 cursor-pointer"
                />
              </div>

              <div>
                <label className="flex items-center justify-between text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  <span className="flex items-center gap-2">
                    <Columns className="w-4 h-4 text-slate-400" /> Columns
                  </span>
                  <span className="font-semibold text-blue-600">{cols}</span>
                </label>
                <input
                  type="range"
                  min="1"
                  max="8"
                  value={cols}
                  onChange={e => setCols(Number(e.target.value))}
                  className="w-full accent-blue-600 cursor-pointer"
                />
              </div>

              {/* Grid visual preview */}
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800">
                <p className="text-xs text-slate-500 mb-2">Grid preview ({rows} × {cols})</p>
                <div 
                  className="grid gap-1 max-w-[200px] mx-auto p-2 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700"
                  style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
                >
                  {Array.from({ length: rows * cols }).map((_, i) => (
                    <div key={i} className="h-4 bg-blue-100 dark:bg-blue-900/50 rounded-xs border border-blue-200 dark:border-blue-800" />
                  ))}
                </div>
              </div>

              <button
                onClick={() => {
                  onInsertTable(rows, cols);
                  onClose();
                }}
                className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm flex items-center justify-center gap-2 shadow-sm transition-colors"
              >
                <Plus className="w-4 h-4" /> Insert {rows} × {cols} Table
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
