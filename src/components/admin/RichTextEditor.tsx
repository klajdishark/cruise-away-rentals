import React, {useMemo, useRef} from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import {Button} from '@/components/ui/button';
import {Popover, PopoverContent, PopoverTrigger} from '@/components/ui/popover';
import {Badge} from '@/components/ui/badge';

interface RichTextEditorProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    height?: string;
}

export const RichTextEditor = ({value, onChange, placeholder, height = '400px'}: RichTextEditorProps) => {
    const quillRef = useRef<ReactQuill>(null);
    const [openPlaceholderMenu, setOpenPlaceholderMenu] = React.useState(false);

    // Available placeholders
    const placeholders = [
        'contract_number',
        'contract_date',
        'customer_name',
        'customer_email',
        'customer_phone',
        'customer_license',
        'vehicle_brand',
        'vehicle_model',
        'vehicle_year',
        'vehicle_license_plate',
        'pickup_date',
        'return_date',
        'pickup_location',
        'return_location',
        'duration_days',
        'daily_rate',
        'total_amount'
    ];

    // Insert placeholder into editor
    const insertPlaceholder = (placeholder: string) => {
        if (quillRef.current) {
            const quill = quillRef.current.getEditor();
            // Save current selection before opening popover
            const range = quill.getSelection() || {index: quill.getLength(), length: 0};
            quill.insertText(range.index, `{{${placeholder}}}`);
            quill.setSelection(range.index + placeholder.length + 4, 0);
        }
        setOpenPlaceholderMenu(false);
    };

    // Quill modules configuration
    const modules = useMemo(() => ({
        toolbar: {
            container: [
                [{'header': [1, 2, 3, false]}],
                ['bold', 'italic', 'underline', 'strike'],
                [{'list': 'ordered'}, {'list': 'bullet'}],
                [{'indent': '-1'}, {'indent': '+1'}],
                ['link'],
                ['clean']
            ],
        },
    }), []);

    return (
        <div className="relative">
            <ReactQuill
                ref={quillRef}
                theme="snow"
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                modules={modules}
                className="bg-background rounded-md border-none"
                style={{height: height || '400px'}}
            />

            <div className="absolute top-2 right-2 z-10">
                <Popover open={openPlaceholderMenu} onOpenChange={setOpenPlaceholderMenu}>
                    <PopoverTrigger asChild>
                        <Button variant="outline" size="sm" className="gap-1">
                            Insert Placeholder
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[300px] p-2">
                        <div className="grid grid-cols-2 gap-2">
                            {placeholders.map(ph => (
                                <Badge
                                    key={ph}
                                    variant="outline"
                                    className="cursor-pointer hover:bg-accent"
                                    onClick={() => insertPlaceholder(ph)}
                                >
                                    {`{{${ph}}}`}
                                </Badge>
                            ))}
                        </div>
                    </PopoverContent>
                </Popover>
            </div>
        </div>
    );
};
