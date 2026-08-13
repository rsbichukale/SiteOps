import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export async function downloadDPRPdfReport(
  reportElementId: string,
  filename: string = 'Daily_Progress_Report.pdf',
  backgroundColor: string | null = null
) {
  const element = document.getElementById(reportElementId);
  if (!element) {
    console.error(`Element with id '${reportElementId}' not found for PDF export.`);
    return;
  }

  try {
    const canvas = await html2canvas(element, {
      scale: 3, // Ultra crisp resolution
      useCORS: true,
      backgroundColor: backgroundColor,
      logging: false,
      windowWidth: 1000,
    });

    const imgData = canvas.toDataURL('image/png', 1.0);
    const pdf = new jsPDF('p', 'mm', 'a4');

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    const imgWidth = pdfWidth;
    const imgHeight = (canvas.height * pdfWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pdfHeight;

    while (heightLeft > 5) { // 5mm threshold to avoid empty blank tail page
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight;
    }

    pdf.save(filename);
  } catch (error) {
    console.error('Error generating PDF report:', error);
  }
}
