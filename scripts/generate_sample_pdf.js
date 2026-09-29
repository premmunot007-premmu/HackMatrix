const fs = require('fs');
const path = require('path');
const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');

async function createSamplePolicyPdf() {
  const pdfDoc = await PDFDocument.create();

  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontItalic = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);

  const primaryColor = rgb(0.26, 0.22, 0.79); // Indigo #4338ca
  const textColor = rgb(0.06, 0.09, 0.16);   // Dark slate #0f172a
  const mutedColor = rgb(0.39, 0.45, 0.55);  // Gray #64748b
  const borderColor = rgb(0.88, 0.91, 0.94); // Light border #e2e8f0

  function addHeaderFooter(page, pageNum, totalPages) {
    const { width, height } = page.getSize();
    
    // Top Brand Bar
    page.drawRectangle({
      x: 40,
      y: height - 50,
      width: width - 80,
      height: 1,
      color: borderColor,
    });
    
    page.drawText('APEX STAR HEALTH INSURANCE — POLICY CONTRACT SCHEDULE', {
      x: 40,
      y: height - 40,
      size: 9,
      font: fontBold,
      color: primaryColor,
    });

    page.drawText('DOCUMENT REF: APX-POL-2026-V4', {
      x: width - 200,
      y: height - 40,
      size: 8,
      font: fontRegular,
      color: mutedColor,
    });

    // Bottom Footer
    page.drawRectangle({
      x: 40,
      y: 45,
      width: width - 80,
      height: 1,
      color: borderColor,
    });

    page.drawText('CONFIDENTIAL & PROPRIETARY — SPECIMEN CONTRACT SCHEDULE FOR ASSESSMENT', {
      x: 40,
      y: 32,
      size: 8,
      font: fontRegular,
      color: mutedColor,
    });

    page.drawText(`Page ${pageNum} of ${totalPages}`, {
      x: width - 90,
      y: 32,
      size: 8,
      font: fontBold,
      color: primaryColor,
    });
  }

  // ================= PAGE 1 =================
  const page1 = pdfDoc.addPage([595, 842]); // A4
  addHeaderFooter(page1, 1, 5);

  let y = 750;

  page1.drawText('APEX CARE SHIELD COMPREHENSIVE POLICY', {
    x: 40,
    y,
    size: 20,
    font: fontBold,
    color: primaryColor,
  });
  y -= 22;

  page1.drawText('Policy Certificate & Schedule of Benefits', {
    x: 40,
    y,
    size: 13,
    font: fontBold,
    color: textColor,
  });
  y -= 30;

  // Overview Table Box
  page1.drawRectangle({
    x: 40,
    y: y - 130,
    width: 515,
    height: 130,
    color: rgb(0.96, 0.97, 0.99),
    borderColor,
    borderWidth: 1,
  });

  page1.drawText('POLICY DETAILS & PRIMARY UNDERWRITING LIMITS', {
    x: 55,
    y: y - 20,
    size: 10,
    font: fontBold,
    color: primaryColor,
  });

  const p1Details = [
    ['Insured Individual / Family:', 'Mr. Rahul Sharma & Family (Floater)', 'Policy Number:', 'APX-HLTH-2026-981240'],
    ['Annual Sum Insured:', 'Rs. 7,50,000 (Seven Lakhs Fifty Thousand)', 'Policy Period:', '01-Jan-2026 to 31-Dec-2026'],
    ['Daily Room Rent Limit:', '1% of Sum Insured (Rs. 7,500 per day)', 'Co-Payment:', '10% on every admissible claim'],
    ['Per-Claim Deductible:', 'Rs. 5,000 per hospitalisation claim', 'Pre-existing (PED) Wait:', '36 months continuous coverage'],
  ];

  let ty = y - 42;
  p1Details.forEach(row => {
    page1.drawText(row[0], { x: 55, y: ty, size: 9, font: fontBold, color: textColor });
    page1.drawText(row[1], { x: 195, y: ty, size: 9, font: fontRegular, color: textColor });
    page1.drawText(row[2], { x: 345, y: ty, size: 9, font: fontBold, color: textColor });
    page1.drawText(row[3], { x: 425, y: ty, size: 9, font: fontRegular, color: textColor });
    ty -= 22;
  });

  y -= 170;

  page1.drawText('SECTION 1: SCHEDULE OF BENEFITS & INPATIENT CHARGES', {
    x: 40,
    y,
    size: 12,
    font: fontBold,
    color: textColor,
  });
  y -= 20;

  page1.drawText('Clause 1.1 — Annual Sum Insured:', { x: 40, y, size: 10, font: fontBold, color: textColor });
  y -= 15;
  page1.drawText('The maximum admissible liability of the Company for all covered hospitalisation claims', { x: 40, y, size: 9.5, font: fontRegular, color: textColor });
  y -= 14;
  page1.drawText('incurred during the policy period shall not exceed Rs. 7,50,000 per policy year.', { x: 40, y, size: 9.5, font: fontItalic, color: textColor });
  y -= 24;

  page1.drawText('Clause 1.2 — Room Rent & Nursing Expenses:', { x: 40, y, size: 10, font: fontBold, color: textColor });
  y -= 15;
  page1.drawText('Daily Room Rent is limited to 1% of Sum Insured per day (Rs. 7,500). If the Insured occupies', { x: 40, y, size: 9.5, font: fontRegular, color: textColor });
  y -= 14;
  page1.drawText('a room category where daily room rent exceeds Rs. 7,500, a proportionate deduction shall apply', { x: 40, y, size: 9.5, font: fontRegular, color: textColor });
  y -= 14;
  page1.drawText('to all associate medical expenses (including doctor visit fees, nursing, and operation theatre charges).', { x: 40, y, size: 9.5, font: fontItalic, color: textColor });
  y -= 24;

  page1.drawText('Clause 1.3 — Co-payment & Deductible Application:', { x: 40, y, size: 10, font: fontBold, color: textColor });
  y -= 15;
  page1.drawText('The Insured person shall bear a deductible of Rs. 5,000 on each hospitalisation event. After deduction', { x: 40, y, size: 9.5, font: fontRegular, color: textColor });
  y -= 14;
  page1.drawText('of the deductible, a mandatory co-payment of 10% shall be borne by the Insured on all admissible claims.', { x: 40, y, size: 9.5, font: fontItalic, color: textColor });

  // ================= PAGE 2 =================
  const page2 = pdfDoc.addPage([595, 842]);
  addHeaderFooter(page2, 2, 5);

  y = 750;
  page2.drawText('SECTION 2: WAITING PERIODS & APPLICABILITY', {
    x: 40,
    y,
    size: 13,
    font: fontBold,
    color: primaryColor,
  });
  y -= 28;

  page2.drawText('Clause 2.1 — Initial Waiting Period (30 Days):', { x: 40, y, size: 10, font: fontBold, color: textColor });
  y -= 16;
  page2.drawText('Any hospitalisation claim arising within the first 30 days from policy inception date', { x: 40, y, size: 9.5, font: fontRegular, color: textColor });
  y -= 14;
  page2.drawText('is non-admissible, with the exception of emergency accidental hospitalisation.', { x: 40, y, size: 9.5, font: fontItalic, color: textColor });
  y -= 28;

  page2.drawText('Clause 2.2 — Specified Disease Waiting Period (24 Months):', { x: 40, y, size: 10, font: fontBold, color: textColor });
  y -= 16;
  page2.drawText('Medical expenses incurred for Cataract surgery, Knee joint replacement, Joint disorders,', { x: 40, y, size: 9.5, font: fontRegular, color: textColor });
  y -= 14;
  page2.drawText('Hernia, Hydrocele, and Benign Prostatic Hypertrophy (BPH) are payable only after 24 months', { x: 40, y, size: 9.5, font: fontRegular, color: textColor });
  y -= 14;
  page2.drawText('of continuous uninterrupted cover with the Company.', { x: 40, y, size: 9.5, font: fontItalic, color: textColor });
  y -= 28;

  page2.drawText('Clause 2.3 — Pre-Existing Disease (PED) Waiting Period (36 Months):', { x: 40, y, size: 10, font: fontBold, color: textColor });
  y -= 16;
  page2.drawText('Any medical condition, ailment, or injury that was diagnosed, treated, or recorded in prior', { x: 40, y, size: 9.5, font: fontRegular, color: textColor });
  y -= 14;
  page2.drawText('medical history before policy inception will be covered after 36 months of continuous cover.', { x: 40, y, size: 9.5, font: fontItalic, color: textColor });
  y -= 28;

  page2.drawText('Clause 2.4 — Maternity Waiting Period:', { x: 40, y, size: 10, font: fontBold, color: textColor });
  y -= 16;
  page2.drawText('Maternity and childbirth expenses carry a 24-month waiting period where endorsed as an active rider.', { x: 40, y, size: 9.5, font: fontRegular, color: textColor });

  // ================= PAGE 3 =================
  const page3 = pdfDoc.addPage([595, 842]);
  addHeaderFooter(page3, 3, 5);

  y = 750;
  page3.drawText('SECTION 3: TREATMENT SUB-LIMITS & SURGICAL CAPS', {
    x: 40,
    y,
    size: 13,
    font: fontBold,
    color: primaryColor,
  });
  y -= 28;

  page3.drawText('Clause 3.1 — Cataract Surgery Sub-Limit:', { x: 40, y, size: 10, font: fontBold, color: textColor });
  y -= 16;
  page3.drawText('Admissible medical expenses for Cataract surgery are strictly limited to Rs. 45,000 per eye', { x: 40, y, size: 9.5, font: fontRegular, color: textColor });
  y -= 14;
  page3.drawText('(inclusive of intraocular lens cost, surgeon charges, and operating theatre fees).', { x: 40, y, size: 9.5, font: fontItalic, color: textColor });
  y -= 28;

  page3.drawText('Clause 3.2 — Knee Replacement & Joint Arthroplasty Sub-Limit:', { x: 40, y, size: 10, font: fontBold, color: textColor });
  y -= 16;
  page3.drawText('Admissible expenses for Total Knee Replacement (TKR) are capped at Rs. 2,00,000 per joint.', { x: 40, y, size: 9.5, font: fontRegular, color: textColor });
  y -= 14;
  page3.drawText('Amounts exceeding this limit shall be borne entirely out-of-pocket by the Insured patient.', { x: 40, y, size: 9.5, font: fontItalic, color: textColor });
  y -= 28;

  page3.drawText('Clause 3.3 — Intensive Care Unit (ICU) Room Tariff:', { x: 40, y, size: 10, font: fontBold, color: textColor });
  y -= 16;
  page3.drawText('Intensive Care Unit (ICU) expenses are admissible up to 2% of Sum Insured (Rs. 15,000 per day)', { x: 40, y, size: 9.5, font: fontRegular, color: textColor });
  y -= 14;
  page3.drawText('for medical necessity requiring intensive monitoring.', { x: 40, y, size: 9.5, font: fontItalic, color: textColor });

  // ================= PAGE 4 =================
  const page4 = pdfDoc.addPage([595, 842]);
  addHeaderFooter(page4, 4, 5);

  y = 750;
  page4.drawText('SECTION 4: PERMANENT POLICY EXCLUSIONS', {
    x: 40,
    y,
    size: 13,
    font: fontBold,
    color: primaryColor,
  });
  y -= 28;

  page4.drawText('Clause 4.1 — Non-Covered Procedures & Treatments:', { x: 40, y, size: 10, font: fontBold, color: textColor });
  y -= 16;
  page4.drawText('The Company shall not be liable to make any claim payment in respect of expenses incurred for:', { x: 40, y, size: 9.5, font: fontRegular, color: textColor });
  y -= 16;

  const exclusions = [
    'a) Maternity, pregnancy, normal delivery, Caesarean section, and fertility treatments.',
    'b) Dialysis for end-stage chronic kidney disease unless secondary to acute accidental trauma.',
    'c) Cosmetic, plastic, or aesthetic procedures performed for aesthetic enhancement.',
    'd) Routine medical check-ups, diagnostic scans without hospitalization, and preventive vitamins.',
    'e) Domiciliary treatments and non-allopathic alternative therapies.'
  ];

  exclusions.forEach(ex => {
    page4.drawText(ex, { x: 50, y, size: 9, font: fontItalic, color: textColor });
    y -= 16;
  });

  // ================= PAGE 5 =================
  const page5 = pdfDoc.addPage([595, 842]);
  addHeaderFooter(page5, 5, 5);

  y = 750;
  page5.drawText('SECTION 5: CLAIMS REQUIREMENTS & DOCUMENTATION', {
    x: 40,
    y,
    size: 13,
    font: fontBold,
    color: primaryColor,
  });
  y -= 28;

  page5.drawText('Clause 5.1 — Mandatory Claim Documentation:', { x: 40, y, size: 10, font: fontBold, color: textColor });
  y -= 16;
  page5.drawText('For reimbursement claims, the Insured must submit the following papers within 15 days of discharge:', { x: 40, y, size: 9.5, font: fontRegular, color: textColor });
  y -= 16;

  const docs = [
    '1. Duly completed and signed Claim Form along with attending doctor certificate.',
    '2. Original hospital final bill with break-up of charges and official payment receipts.',
    '3. Comprehensive Discharge Summary indicating clinical diagnosis and course of treatment.',
    '4. Original diagnostic reports (X-rays, blood profiles, MRI/CT scans) and doctor prescriptions.',
    '5. Government photo identity proof, policy card, and patient KYC documents.'
  ];

  docs.forEach(doc => {
    page5.drawText(doc, { x: 50, y, size: 9, font: fontRegular, color: textColor });
    y -= 16;
  });

  y -= 20;
  page5.drawText('Clause 5.2 — Cashless Claim Procedure at Network Hospitals:', { x: 40, y, size: 10, font: fontBold, color: textColor });
  y -= 16;
  page5.drawText('Pre-authorization must be submitted 48 hours prior to planned hospitalisation, or within', { x: 40, y, size: 9.5, font: fontRegular, color: textColor });
  y -= 14;
  page5.drawText('24 hours of emergency admission to the Third Party Administrator (TPA) helpdesk.', { x: 40, y, size: 9.5, font: fontItalic, color: textColor });

  const pdfBytes = await pdfDoc.save();

  // Save to public/ and root
  const publicDir = path.join(__dirname, '..', 'public');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  const publicPath = path.join(publicDir, 'sample_health_policy.pdf');
  const rootPath = path.join(__dirname, '..', 'sample_health_policy.pdf');

  fs.writeFileSync(publicPath, pdfBytes);
  fs.writeFileSync(rootPath, pdfBytes);

  console.log('Sample Policy PDF generated successfully at:');
  console.log('1.', publicPath);
  console.log('2.', rootPath);
}

createSamplePolicyPdf().catch(err => {
  console.error('Error creating sample PDF:', err);
  process.exit(1);
});
