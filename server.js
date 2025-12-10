const express = require("express");
const multer = require("multer");
const { PDFDocument } = require("pdf-lib");
const fs = require("fs");

const upload = multer({ dest: "uploads/" });
const app = express();

app.post("/merge", upload.array("files"), async (req, res) => {
    const merged = await PDFDocument.create();

    for (const file of req.files) {
        const pdfBytes = fs.readFileSync(file.path);
        const pdf = await PDFDocument.load(pdfBytes);
        const pages = await merged.copyPages(pdf, pdf.getPageIndices());
        pages.forEach((page) => merged.addPage(page));
    }

    const finalPdf = await merged.save();
    res.setHeader("Content-Type", "application/pdf");
    res.send(finalPdf);

    // Delete files after merging
    req.files.forEach(file => fs.unlinkSync(file.path));
});

app.listen(3000, () => console.log("Server running on port 3000"));

