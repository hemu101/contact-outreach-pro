import { useState, useRef, useEffect } from 'react';
import { Check, X, Pencil } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface EditableFieldProps {
  value: string;
  onSave: (value: string) => void;
  placeholder?: string;
  className?: string;
  inputClassName?: string;
  type?: 'text' | 'email';
}

export function EditableField({
  value,
  onSave,
  placeholder = '-',
  className,
  inputClassName,
  type = 'text',
}: EditableFieldProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  useEffect(() => {
    setEditValue(value);
  }, [value]);

  const handleSave = () => {
    if (editValue !== value) {
      onSave(editValue);
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditValue(value);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  if (isEditing) {
    return (
      <div className="flex items-center gap-1">
        <Input
          ref={inputRef}
          type={type}
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleSave}
          className={cn("h-8 text-sm", inputClassName)}
        />
        <button
          onClick={handleSave}
          className="p-1 hover:bg-success/20 rounded transition-colors"
          title="Save"
        >
          <Check className="w-4 h-4 text-success" />
        </button>
        <button
          onClick={handleCancel}
          className="p-1 hover:bg-destructive/20 rounded transition-colors"
          title="Cancel"
        >
          <X className="w-4 h-4 text-destructive" />
        </button>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "group flex items-center gap-2 cursor-pointer hover:bg-secondary/50 rounded px-2 py-1 -mx-2 transition-colors",
        className
      )}
      onClick={() => setIsEditing(true)}
    >
      <span className={cn(!value && "text-muted-foreground italic")}>
        {value || placeholder}
      </span>
      <Pencil className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
    </div>
  );
}