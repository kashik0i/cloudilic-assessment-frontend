import type { NodeProps } from "@xyflow/react";
import { Handle, Position } from "@xyflow/react";
import { useState, useRef, type ChangeEvent } from "react";
import { Upload, FileText, CheckCircle, AlertCircle, Loader2 } from "lucide-react";

import {
    BaseNode,
    BaseNodeContent,
    BaseNodeHeader,
    BaseNodeHeaderTitle,
} from "./base-node";
import { Button } from "@/components/ui/button";
import type { FlowNodeData } from "@/interfaces.ts";

type UploadStatus = "idle" | "uploading" | "success" | "error";

export function RagNode({ data }: NodeProps<FlowNodeData>) {
    const [uploadStatus, setUploadStatus] = useState<UploadStatus>("idle");
    const [fileName, setFileName] = useState<string>((data as any)?.uploadedFile || "");
    const [errorMessage, setErrorMessage] = useState<string>("");
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = async (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (file.type !== "application/pdf") {
            setUploadStatus("error");
            setErrorMessage("Please select a PDF file");
            return;
        }

        // Validate file size (e.g., max 10MB)
        const maxSize = 10 * 1024 * 1024; // 10MB
        if (file.size > maxSize) {
            setUploadStatus("error");
            setErrorMessage("File size must be less than 10MB");
            return;
        }

        setUploadStatus("uploading");
        setErrorMessage("");

        const formData = new FormData();
        formData.append("pdf", file);

        try {
            const response = await fetch("http://localhost:4000/api/upload", {
                method: "POST",
                body: formData,
            });

            if (!response.ok) {
                throw new Error(`Upload failed: ${response.statusText}`);
            }

            const result = await response.json();
            setFileName(file.name);
            setUploadStatus("success");

            // Update node data with uploaded file info
            (data as any).uploadedFile = file.name;
            (data as any).documentId = result.documentId || result.id;
        } catch (error) {
            setUploadStatus("error");
            setErrorMessage(
                error instanceof Error ? error.message : "Upload failed"
            );
        }
    };

    const handleButtonClick = () => {
        fileInputRef.current?.click();
    };

    const getStatusIcon = () => {
        switch (uploadStatus) {
            case "uploading":
                return <Loader2 className="h-4 w-4 animate-spin" />;
            case "success":
                return <CheckCircle className="h-4 w-4 text-green-500" />;
            case "error":
                return <AlertCircle className="h-4 w-4 text-red-500" />;
            default:
                return <Upload className="h-4 w-4" />;
        }
    };

    return (
        <BaseNode aria-label="RAG node" aria-describedby="rag-node-desc">
            <BaseNodeHeader>
                <BaseNodeHeaderTitle>RAG (Retrieve-Augment-Generate)</BaseNodeHeaderTitle>
            </BaseNodeHeader>
            <BaseNodeContent>
                <div
                    id="rag-node-desc"
                    className="text-muted-foreground text-xs leading-relaxed mb-2"
                >
                    Upload a PDF document for semantic search and retrieval-augmented generation.
                </div>

                <input
                    ref={fileInputRef}
                    type="file"
                    accept="application/pdf"
                    onChange={handleFileSelect}
                    className="hidden"
                    aria-label="Upload PDF file"
                />

                <Button
                    onClick={handleButtonClick}
                    variant="outline"
                    size="sm"
                    className="w-full"
                    disabled={uploadStatus === "uploading"}
                >
                    {getStatusIcon()}
                    <span className="ml-2">
                        {uploadStatus === "uploading"
                            ? "Uploading..."
                            : fileName
                            ? "Change PDF"
                            : "Upload PDF"}
                    </span>
                </Button>

                {fileName && uploadStatus === "success" && (
                    <div className="flex items-center gap-2 mt-2 p-2 bg-green-50 dark:bg-green-950/20 rounded border border-green-200 dark:border-green-800">
                        <FileText className="h-4 w-4 text-green-600 dark:text-green-400 flex-shrink-0" />
                        <span className="text-xs text-green-700 dark:text-green-300 truncate">
                            {fileName}
                        </span>
                    </div>
                )}

                {errorMessage && uploadStatus === "error" && (
                    <div className="mt-2 p-2 bg-red-50 dark:bg-red-950/20 rounded border border-red-200 dark:border-red-800">
                        <p className="text-xs text-red-700 dark:text-red-300">
                            {errorMessage}
                        </p>
                    </div>
                )}
            </BaseNodeContent>

            {/* RAG node receives input from Input node and sends to Output node */}
            <Handle type="target" position={Position.Left} id="input" />
            <Handle type="source" position={Position.Right} id="output" />
        </BaseNode>
    );
}
