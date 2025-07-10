import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Bold, 
  Italic, 
  Underline, 
  List, 
  ListOrdered, 
  AlignLeft, 
  AlignCenter, 
  AlignRight,
  Type,
  Eye,
  EyeOff
} from 'lucide-react';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder = "Enter your contract template content...",
  className = ""
}) => {
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const insertFormatting = (before: string, after: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    
    const newText = value.substring(0, start) + 
                   before + selectedText + after + 
                   value.substring(end);
    
    onChange(newText);
    
    // Restore cursor position
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + before.length, 
        start + before.length + selectedText.length
      );
    }, 0);
  };

  const insertPlaceholder = (placeholder: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const newText = value.substring(0, start) + 
                   `{{${placeholder}}}` + 
                   value.substring(start);
    
    onChange(newText);
    
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + placeholder.length + 4, start + placeholder.length + 4);
    }, 0);
  };

  const formatButtons = [
    { icon: Bold, action: () => insertFormatting('<strong>', '</strong>'), title: 'Bold' },
    { icon: Italic, action: () => insertFormatting('<em>', '</em>'), title: 'Italic' },
    { icon: Underline, action: () => insertFormatting('<u>', '</u>'), title: 'Underline' },
    { icon: List, action: () => insertFormatting('<ul>\n<li>', '</li>\n</ul>'), title: 'Bullet List' },
    { icon: ListOrdered, action: () => insertFormatting('<ol>\n<li>', '</li>\n</ol>'), title: 'Numbered List' },
    { icon: AlignLeft, action: () => insertFormatting('<div style="text-align: left;">', '</div>'), title: 'Align Left' },
    { icon: AlignCenter, action: () => insertFormatting('<div style="text-align: center;">', '</div>'), title: 'Align Center' },
    { icon: AlignRight, action: () => insertFormatting('<div style="text-align: right;">', '</div>'), title: 'Align Right' },
  ];

  const commonPlaceholders = [
    'contract_number', 'contract_date', 'customer_name', 'customer_email',
    'customer_phone', 'customer_license', 'vehicle_brand', 'vehicle_model',
    'vehicle_year', 'vehicle_license_plate', 'pickup_date', 'return_date',
    'pickup_location', 'return_location', 'duration_days', 'daily_rate', 'total_amount'
  ];

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Toolbar */}
      <div className="flex flex-wrap gap-2 items-center p-2 border rounded-lg bg-muted/50">
        <div className="flex gap-1">
          {formatButtons.map((button, index) => (
            <Button
              key={index}
              variant="ghost"
              size="sm"
              onClick={button.action}
              title={button.title}
              className="h-8 w-8 p-0"
            >
              <button.icon className="h-4 w-4" />
            </Button>
          ))}
        </div>
        
        <div className="h-6 w-px bg-border mx-2" />
        
        <Button
          variant={isPreviewMode ? "default" : "ghost"}
          size="sm"
          onClick={() => setIsPreviewMode(!isPreviewMode)}
          className="h-8"
        >
          {isPreviewMode ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
          {isPreviewMode ? 'Edit' : 'Preview'}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Editor/Preview */}
        <div className="lg:col-span-3">
          {isPreviewMode ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <div 
                  className="prose prose-sm max-w-none min-h-[300px] p-4 border rounded-md bg-background"
                  dangerouslySetInnerHTML={{ __html: value }}
                />
              </CardContent>
            </Card>
          ) : (
            <Textarea
              ref={textareaRef}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder={placeholder}
              className="min-h-[300px] font-mono text-sm resize-none"
              style={{ fontFamily: 'Monaco, Consolas, "Courier New", monospace' }}
            />
          )}
        </div>

        {/* Placeholder Helper */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Quick Insert</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <h4 className="text-xs font-medium text-muted-foreground mb-2">Common Placeholders</h4>
                <div className="grid grid-cols-1 gap-1">
                  {commonPlaceholders.slice(0, 8).map((placeholder) => (
                    <Badge
                      key={placeholder}
                      variant="outline"
                      className="cursor-pointer text-xs justify-start hover:bg-muted"
                      onClick={() => insertPlaceholder(placeholder)}
                    >
                      {placeholder}
                    </Badge>
                  ))}
                </div>
              </div>
              
              <div>
                <h4 className="text-xs font-medium text-muted-foreground mb-2">More Placeholders</h4>
                <div className="grid grid-cols-1 gap-1">
                  {commonPlaceholders.slice(8).map((placeholder) => (
                    <Badge
                      key={placeholder}
                      variant="outline"
                      className="cursor-pointer text-xs justify-start hover:bg-muted"
                      onClick={() => insertPlaceholder(placeholder)}
                    >
                      {placeholder}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-xs font-medium text-muted-foreground mb-2">Quick HTML</h4>
                <div className="space-y-1">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full text-xs justify-start h-7"
                    onClick={() => insertFormatting('<h1>', '</h1>')}
                  >
                    <Type className="h-3 w-3 mr-2" />
                    Heading 1
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full text-xs justify-start h-7"
                    onClick={() => insertFormatting('<h2>', '</h2>')}
                  >
                    <Type className="h-3 w-3 mr-2" />
                    Heading 2
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full text-xs justify-start h-7"
                    onClick={() => insertFormatting('<p>', '</p>')}
                  >
                    Paragraph
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full text-xs justify-start h-7"
                    onClick={() => insertFormatting('<br />')}
                  >
                    Line Break
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};