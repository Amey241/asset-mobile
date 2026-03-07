from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors
from io import BytesIO
from datetime import datetime

def generate_financial_report(user_data, portfolio_data, recommendations, assets_summary):
    buffer = BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=letter)
    styles = getSampleStyleSheet()
    
    # Custom Styles
    title_style = ParagraphStyle(
        'TitleStyle',
        parent=styles['Heading1'],
        fontSize=24,
        textColor=colors.HexColor("#1a237e"),
        spaceAfter=20,
        alignment=1 # Center
    )
    
    section_style = ParagraphStyle(
        'SectionStyle',
        parent=styles['Heading2'],
        fontSize=18,
        textColor=colors.HexColor("#3949ab"),
        spaceBefore=15,
        spaceAfter=10
    )

    elements = []

    # Title
    elements.append(Paragraph("Asset Management Pro", title_style))
    elements.append(Paragraph(f"Monthly Financial Report - {datetime.now().strftime('%B %Y')}", styles['Normal']))
    elements.append(Spacer(1, 20))

    # User Info
    elements.append(Paragraph(f"Prepared for: {user_data.get('name')}", styles['Normal']))
    elements.append(Paragraph(f"Risk Profile: {user_data.get('risk_profile', 'Medium').upper()}", styles['Normal']))
    elements.append(Spacer(1, 20))

    # Financial Summary Table
    elements.append(Paragraph("Financial Summary", section_style))
    data = [
        ["Category", "Amount ($)"],
        ["Monthly Income", f"{portfolio_data.get('total_income', 0):,.2f}"],
        ["Total Expenses", f"{portfolio_data.get('total_expenses', 0):,.2f}"],
        ["Remaining Savings", f"{portfolio_data.get('remaining_money', 0):,.2f}"]
    ]
    t = Table(data, colWidths=[200, 100])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#1a237e")),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
        ('BACKGROUND', (0, 1), (-1, -1), colors.whitesmoke),
        ('GRID', (0, 0), (-1, -1), 1, colors.grey)
    ]))
    elements.append(t)
    elements.append(Spacer(1, 20))

    # Assets Summary
    elements.append(Paragraph("Asset Portfolio Overview", section_style))
    asset_data = [["Status", "Count", "Total Value ($)"]]
    asset_data.append(["Total Assets", str(assets_summary.get('total', 0)), f"{assets_summary.get('totalValue', 0):,.2f}"])
    asset_data.append(["Available", str(assets_summary.get('available', 0)), "-"])
    asset_data.append(["Assigned", str(assets_summary.get('assigned', 0)), "-"])
    asset_data.append(["Overdue", str(assets_summary.get('overdue', 0)), "-"])

    t_assets = Table(asset_data, colWidths=[150, 75, 125])
    t_assets.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#3949ab")),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('GRID', (0, 0), (-1, -1), 1, colors.grey)
    ]))
    elements.append(t_assets)
    elements.append(Spacer(1, 20))

    # AI Recommendations
    elements.append(Paragraph("AI Investment Recommendations", section_style))
    for rec in recommendations:
        elements.append(Paragraph(f"<b>{rec['title']}</b>", styles['Normal']))
        elements.append(Paragraph(rec['description'], styles['Normal']))
        elements.append(Paragraph(f"Suggested: {', '.join(rec['suggested_investments'])}", styles['Italic']))
        elements.append(Spacer(1, 10))

    doc.build(elements)
    buffer.seek(0)
    return buffer
