

import { useEffect, useRef } from "react";
import * as pdfjsLib from "pdfjs-dist";
import "pdfjs-dist/build/pdf.worker.mjs";

export default function PdfViewer({ url }) {
    const containerRef = useRef(null);

    useEffect(() => {
        if (!url) return;

        // pdfjsLib.GlobalWorkerOptions.workerSrc =
        //     "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js";
        pdfjsLib.GlobalWorkerOptions.workerSrc =
    `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

        const renderPDF = async () => {
            const container = containerRef.current;
            container.innerHTML = ""; // Clear old pages

            const pdf = await pdfjsLib.getDocument(url).promise;

            for (let i = 1; i <= pdf.numPages; i++) {
                const page = await pdf.getPage(i);
                const viewport = page.getViewport({ scale: 1.2 });

                const canvas = document.createElement("canvas");
                const context = canvas.getContext("2d");

                // canvas.height = viewport.height;
                // canvas.width = viewport.width;
                // canvas.style.marginBottom = "20px";
                // canvas.style.boxShadow = "0 2px 6px rgba(0,0,0,0.2)";
                // canvas.style.borderRadius = "8px";
                canvas.height = viewport.height;
canvas.width = viewport.width;

canvas.style.width = "100%";
canvas.style.height = "auto";

canvas.style.marginBottom = "20px";
canvas.style.boxShadow = "0 2px 6px rgba(0,0,0,0.2)";
canvas.style.borderRadius = "8px";  

                container.appendChild(canvas);

                await page.render({
                    canvasContext: context,
                    viewport,
                }).promise;
            }
        };

        renderPDF();
    }, [url]);

    return (
        <div
            ref={containerRef}
            className="w-full h-full overflow-y-auto p-2"
            style={{ maxHeight: "650px" }}
        ></div>
    );
}