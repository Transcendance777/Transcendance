import PDFDocument from 'pdfkit';
import { formatPeriodLabel, formatMonthBucket } from './statsDateUtils.js';

const writeSectionTitle = (doc, title) => {
	const left = doc.page.margins.left;
	doc.moveDown(0.5);
	doc.x = left;
	doc.fontSize(14).fillColor('#f5a623').text(title);
	doc.moveDown(0.3);
	doc.x = left;
	doc.fontSize(11).fillColor('#333333');
};

const writeTableRow = (doc, columns, { bold = false } = {}) => {
	const left = doc.page.margins.left;
	const rowY = doc.y;

	if (bold) doc.font('Helvetica-Bold');
	else doc.font('Helvetica');

	doc.text(columns[0], left, rowY, { width: 320 });
	doc.text(String(columns[1]), left + 320, rowY, { width: 80, align: 'right' });
	doc.y = rowY + doc.currentLineHeight() + 2;
	doc.x = left;
};

const generateStatsPdf = (res, {
	username,
	period,
	year,
	fromYear,
	toYear,
	playingListStats,
	ratingDistribution,
	genreDistribution,
}) => {
	const doc = new PDFDocument({ margin: 50 });
	const periodLabel = formatPeriodLabel({ period, year, fromYear, toYear });

	res.setHeader('Content-Type', 'application/pdf');
	res.setHeader('Content-Disposition', 'attachment; filename="stats-export.pdf"');
	doc.pipe(res);

	doc.fontSize(20).fillColor('#111111').text('Game REV — Stats Export');
	doc.moveDown(0.3);
	doc.fontSize(11).fillColor('#555555')
		.text(`User: ${username}`)
		.text(`Period: ${periodLabel}`)
		.text(`Generated: ${new Date().toLocaleString()}`);

	writeSectionTitle(doc, 'Games played (monthly)');
	if (playingListStats.length === 0) {
		doc.text('No data for this period.');
	} else {
		writeTableRow(doc, ['Month', 'Games'], { bold: true });
		for (const bucket of playingListStats) {
			writeTableRow(doc, [formatMonthBucket(bucket), bucket.count]);
		}
	}

	writeSectionTitle(doc, 'Rating distribution');
	if (ratingDistribution.every(({ count }) => count === 0)) {
		doc.text('No reviews for this period.');
	} else {
		writeTableRow(doc, ['Rating', 'Reviews'], { bold: true });
		for (const { rating, count } of ratingDistribution) {
			if (count > 0) {
				writeTableRow(doc, [String(rating), count]);
			}
		}
	}

	writeSectionTitle(doc, 'Games genre');
	if (genreDistribution.length === 0) {
		doc.text('No games in playing list for this period.');
	} else {
		writeTableRow(doc, ['Genre', 'Games'], { bold: true });
		for (const { genre, count } of genreDistribution) {
			writeTableRow(doc, [genre, count]);
		}
	}

	doc.end();
};

export { generateStatsPdf };
