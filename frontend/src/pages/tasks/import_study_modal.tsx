import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Plus } from "lucide-react";

interface ImportStudyModalProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    subjects: any[];
    studyChaptersBySubject: Record<string, any[]>;
    partsByChapter: Record<string, any[]>;
    onImportSelect: (part: any, subjectId: string, chapterId: string) => void;
}

export function ImportStudyModal({
    isOpen,
    onOpenChange,
    subjects,
    studyChaptersBySubject,
    partsByChapter,
    onImportSelect
}: ImportStudyModalProps) {
    const [importSubjectId, setImportSubjectId] = useState("");
    const [importChapterId, setImportChapterId] = useState("");

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="w-[95vw] max-w-md rounded-2xl sm:rounded-xl">
                <DialogHeader>
                    <DialogTitle>Import from Study</DialogTitle>
                    <DialogDescription>Select a part to add as a task.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 pt-2">
                    {/* Subject */}
                    <div className="space-y-1.5">
                        <label className="text-xs text-muted-foreground">Subject</label>
                        <div className="relative">
                            <select
                                className="h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                                value={importSubjectId}
                                onChange={(e) => {
                                    setImportSubjectId(e.target.value);
                                    setImportChapterId("");
                                }}
                            >
                                <option value="" disabled>Select Subject...</option>
                                {subjects.map(s => (
                                    <option key={s.id} value={s.id}>{s.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Chapter */}
                    {importSubjectId && (
                        <div className="space-y-1.5">
                            <label className="text-xs text-muted-foreground">Chapter</label>
                            <div className="relative">
                                <select
                                    className="h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                                    value={importChapterId}
                                    onChange={(e) => setImportChapterId(e.target.value)}
                                >
                                    <option value="" disabled>Select Chapter...</option>
                                    {(studyChaptersBySubject[importSubjectId] || []).map(c => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    )}

                    {/* Parts List */}
                    {importChapterId && (
                        <div className="space-y-2 mt-2">
                            <label className="text-xs text-muted-foreground">Select a Part</label>
                            <div className="max-h-[200px] overflow-y-auto space-y-1 border rounded-md p-1">
                                {(partsByChapter[importChapterId] || []).length === 0 ? (
                                    <p className="text-sm text-muted-foreground p-2 text-center">No parts found.</p>
                                ) : (
                                    (partsByChapter[importChapterId] || []).filter(p => !p.parent_id).map(part => (
                                        <StudyPartSelectItem
                                            key={part.id}
                                            part={part}
                                            allParts={partsByChapter[importChapterId] || []}
                                            onSelect={(p) => {
                                                onImportSelect(p, importSubjectId, importChapterId);
                                                setImportSubjectId("");
                                                setImportChapterId("");
                                            }}
                                        />
                                    ))
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}

function StudyPartSelectItem({
    part,
    allParts,
    level = 0,
    onSelect
}: {
    part: { id: string; name: string; estimated_minutes: number; scheduled_time?: string; scheduled_date?: string; parent_id?: string | null };
    allParts: any[];
    level?: number;
    onSelect: (part: any) => void;
}) {
    const children = allParts.filter(p => p.parent_id === part.id);

    return (
        <>
            <button
                className="w-full text-left px-3 py-2 text-sm rounded-sm hover:bg-secondary/50 flex items-center justify-between group transition-colors"
                style={{ paddingLeft: `${Math.max(0.75, level * 1 + 0.75)}rem` }}
                onClick={() => onSelect(part)}
            >
                <div className="flex items-center gap-2">
                    {level > 0 && <div className="w-1.5 h-1.5 rounded-full bg-border" />}
                    <span>{part.name}</span>
                </div>
                <div className="flex items-center gap-2 opacity-60 text-xs">
                    <span>{part.estimated_minutes}m</span>
                    <Plus className="w-3 h-3 opacity-0 group-hover:opacity-100" />
                </div>
            </button>
            {children.map(child => (
                <StudyPartSelectItem
                    key={child.id}
                    part={child}
                    allParts={allParts}
                    level={level + 1}
                    onSelect={onSelect}
                />
            ))}
        </>
    );
}
