"use client";

export const CvPdfPreview = ({ fileUrl }: { fileUrl: string }) => {
    return (
        <div className="h-[320px] w-full overflow-hidden sm:h-[360px] md:h-[420px]" style={{ backgroundColor: "var(--cv-preview-bg)" }}>
            <iframe
                src={`${fileUrl}#view=FitH`}
                title="CV PDF preview"
                className="h-full w-full"
            />
        </div>
    );
};
