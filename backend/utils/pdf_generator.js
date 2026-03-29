import PDFDocument from 'pdfkit';

/**
 * Generates a financial report PDF using PDFKit
 * @param {Object} userData - User information
 * @param {Object} portfolioData - Portfolio stats (income, expenses, etc.)
 * @param {Array} recommendations - AI generated investment tips
 * @param {Object} assetsSummary - Asset counts and total value
 * @returns {Promise<Buffer>} - Resovles to the PDF buffer
 */
export const generateFinancialReport = (userData, portfolioData, recommendations, assetsSummary) => {
    return new Promise((resolve, reject) => {
        const doc = new PDFDocument({ margin: 50 });
        let buffers = [];
        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => {
            resolve(Buffer.concat(buffers));
        });
        doc.on('error', reject);

        // --- Title Section ---
        doc.fillColor('#1a237e')
           .fontSize(24)
           .text('Asset Management Pro', { align: 'center' });
        
        doc.fillColor('#333333')
           .fontSize(12)
           .text(`Monthly Financial Report - ${new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}`, { align: 'center' });
        
        doc.moveDown();

        // --- User Info ---
        doc.fontSize(12)
           .fillColor('#000000')
           .text(`Prepared for: ${userData.name}`)
           .text(`Risk Profile: ${(userData.risk_profile || 'Medium').toUpperCase()}`);
        
        doc.moveDown();

        // --- Financial Summary ---
        doc.fillColor('#3949ab')
           .fontSize(18)
           .text('Financial Summary')
           .moveDown(0.5);

        doc.fillColor('#000000')
           .fontSize(12)
           .text(`Monthly Income: $${(portfolioData.total_income || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}`)
           .text(`Total Expenses: $${(portfolioData.total_expenses || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}`)
           .text(`Remaining Savings: $${(portfolioData.remaining_money || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}`);
        
        doc.moveDown();

        // --- Asset Portfolio Overview ---
        doc.fillColor('#3949ab')
           .fontSize(18)
           .text('Asset Portfolio Overview')
           .moveDown(0.5);

        doc.fillColor('#000000')
           .fontSize(12)
           .text(`Total Assets: ${assetsSummary.total || 0}`)
           .text(`Total Portfolio Value: $${(assetsSummary.totalValue || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}`)
           .text(`Available: ${assetsSummary.available || 0}`)
           .text(`Assigned: ${assetsSummary.assigned || 0}`)
           .text(`Overdue: ${assetsSummary.overdue || 0}`);
        
        doc.moveDown();

        // --- AI Recommendations ---
        doc.fillColor('#3949ab')
           .fontSize(18)
           .text('AI Investment Recommendations')
           .moveDown(0.5);

        recommendations.forEach(rec => {
            doc.fillColor('#000000')
               .fontSize(12)
               .font('Helvetica-Bold')
               .text(rec.title)
               .font('Helvetica')
               .fontSize(11)
               .text(rec.description)
               .fillColor('#666666')
               .text(`Suggested: ${rec.suggested_investments.join(', ')}`, { oblique: true })
               .moveDown();
        });

        doc.end();
    });
};
