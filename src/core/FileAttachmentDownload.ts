export interface DownloadFileAttachmentOptions {
    requireScanVerdict?: boolean;
}

export const FileScanFailureReason = {
    MalwareDetected: 'FileScanMalwareDetected',
    InProgress: 'FileScanInProgress',
    VerdictMissing: 'FileScanVerdictMissing'
} as const;

export type FileScanFailureReasonValue = typeof FileScanFailureReason[keyof typeof FileScanFailureReason];

export interface FileAttachmentDownloadError extends Error {
    reason?: FileScanFailureReasonValue;
    cause?: unknown;
}
