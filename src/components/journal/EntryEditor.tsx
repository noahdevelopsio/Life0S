'use client'

interface EntryEditorProps {
  content: string
  onChange: (content: string) => void
  placeholder?: string
}

export default function EntryEditor({
  content,
  onChange,
  placeholder = "Start writing..."
}: EntryEditorProps) {
  return (
    <div className="space-y-4">
      <textarea
        value={content}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full h-96 px-4 py-3 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/50 resize-none font-sans text-base leading-relaxed"
        style={{ minHeight: '24rem' }}
      />

      {/* Character count */}
      <div className="flex justify-between items-center text-sm text-slate-600 dark:text-slate-400">
        <span>
          {content.length} characters
        </span>
        <span>
          {content.split('\n').length} paragraphs
        </span>
      </div>

      {/* Writing tips */}
      <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-2">
          Writing Tips
        </h4>
        <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
          <li>• Write freely - there's no right or wrong way to journal</li>
          <li>• Be honest with yourself about your thoughts and feelings</li>
          <li>• Focus on what you're grateful for or what's bothering you</li>
          <li>• Use voice recording if typing feels like a barrier</li>
        </ul>
      </div>
    </div>
  )
}
