import os
from datetime import datetime
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, Image
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from typing import List, Dict, Any

from app.models.scan import Scan, FileResult, HostResult
from app.core.config import settings

def generate_pdf_report(scan: Scan, file_results: List[FileResult], host_results: List[HostResult]) -> str:
    """
    Generate a PDF report for the scan results
    """
    # Create reports directory if it doesn't exist
    reports_dir = os.path.join(os.path.dirname(settings.DATABASE_URL.replace('sqlite:///', '')), 'reports')
    os.makedirs(reports_dir, exist_ok=True)
    
    # PDF file path
    pdf_path = os.path.join(reports_dir, f"ai_antivirus_report_{scan.id}.pdf")
    
    # Create PDF document
    doc = SimpleDocTemplate(pdf_path, pagesize=letter)
    styles = getSampleStyleSheet()
    
    # Custom styles
    title_style = styles["Heading1"]
    title_style.alignment = 1  # Center alignment
    
    subtitle_style = styles["Heading2"]
    subtitle_style.alignment = 0  # Left alignment
    
    normal_style = styles["Normal"]
    
    # Create content elements
    elements = []
    
    # Title
    elements.append(Paragraph("AI-Antivirus Scan Report", title_style))
    elements.append(Spacer(1, 0.25 * inch))
    
    # Scan information
    elements.append(Paragraph("Scan Information", subtitle_style))
    elements.append(Spacer(1, 0.1 * inch))
    
    scan_info = [
        ["Scan ID:", str(scan.id)],
        ["Date:", scan.created_at.strftime("%Y-%m-%d %H:%M:%S")],
        ["Status:", scan.status.upper()],
        ["IP Addresses:", scan.ip_addresses],
    ]
    
    if scan.dataset_name:
        scan_info.append(["Dataset:", scan.dataset_name])
    
    scan_table = Table(scan_info, colWidths=[1.5 * inch, 5 * inch])
    scan_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (0, -1), colors.lightgrey),
        ('TEXTCOLOR', (0, 0), (0, -1), colors.black),
        ('ALIGN', (0, 0), (0, -1), 'LEFT'),
        ('ALIGN', (1, 0), (1, -1), 'LEFT'),
        ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('GRID', (0, 0), (-1, -1), 0.25, colors.black),
    ]))
    
    elements.append(scan_table)
    elements.append(Spacer(1, 0.25 * inch))
    
    # Summary
    elements.append(Paragraph("Executive Summary", subtitle_style))
    elements.append(Spacer(1, 0.1 * inch))
    
    # Calculate summary statistics
    total_threats = len(file_results) + len(host_results)
    high_risk_threats = sum(1 for r in file_results if r.risk_score >= 70) + sum(1 for r in host_results if r.risk_score >= 70)
    medium_risk_threats = sum(1 for r in file_results if 30 <= r.risk_score < 70) + sum(1 for r in host_results if 30 <= r.risk_score < 70)
    low_risk_threats = sum(1 for r in file_results if r.risk_score < 30) + sum(1 for r in host_results if r.risk_score < 30)
    
    summary_text = f"""
    The AI-Antivirus scan detected a total of {total_threats} potential threats:
    • {high_risk_threats} high-risk threats (risk score ≥ 70)
    • {medium_risk_threats} medium-risk threats (risk score 30-69)
    • {low_risk_threats} low-risk threats (risk score < 30)
    
    This report provides detailed information about each detected threat and recommendations for mitigation.
    """
    
    elements.append(Paragraph(summary_text, normal_style))
    elements.append(Spacer(1, 0.25 * inch))
    
    # File Results
    if file_results:
        elements.append(Paragraph("File Scan Results", subtitle_style))
        elements.append(Spacer(1, 0.1 * inch))
        
        file_data = [["Filename", "Risk Score", "Threat Type", "Recommendation"]]
        
        for result in file_results:
            file_data.append([
                result.filename,
                f"{result.risk_score:.1f}",
                result.threat_type or "N/A",
                result.recommendation or "N/A"
            ])
        
        file_table = Table(file_data, colWidths=[1.5 * inch, 1 * inch, 1.5 * inch, 3 * inch])
        file_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, 0), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
            ('TOPPADDING', (0, 0), (-1, -1), 6),
            ('GRID', (0, 0), (-1, -1), 0.25, colors.black),
            # Conditional formatting for risk scores
            *[
                ('BACKGROUND', (1, i+1), (1, i+1), 
                 colors.red if float(file_data[i+1][1]) >= 70 else 
                 colors.orange if float(file_data[i+1][1]) >= 30 else 
                 colors.green)
                for i in range(len(file_data)-1)
            ]
        ]))
        
        elements.append(file_table)
        elements.append(Spacer(1, 0.25 * inch))
    
    # Host Results
    if host_results:
        elements.append(Paragraph("Network Host Scan Results", subtitle_style))
        elements.append(Spacer(1, 0.1 * inch))
        
        host_data = [["IP Address", "Risk Score", "Open Ports", "Threat Type", "Recommendation"]]
        
        for result in host_results:
            # Format open ports for display
            import json
            open_ports_dict = json.loads(result.open_ports) if result.open_ports else {}
            open_ports_str = ", ".join([f"{port}" for port in open_ports_dict.keys()])
            
            host_data.append([
                result.ip_address,
                f"{result.risk_score:.1f}",
                open_ports_str or "None",
                result.threat_type or "N/A",
                result.recommendation or "N/A"
            ])
        
        host_table = Table(host_data, colWidths=[1.2 * inch, 0.8 * inch, 1 * inch, 1.2 * inch, 2.8 * inch])
        host_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, 0), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
            ('TOPPADDING', (0, 0), (-1, -1), 6),
            ('GRID', (0, 0), (-1, -1), 0.25, colors.black),
            # Conditional formatting for risk scores
            *[
                ('BACKGROUND', (1, i+1), (1, i+1), 
                 colors.red if float(host_data[i+1][1]) >= 70 else 
                 colors.orange if float(host_data[i+1][1]) >= 30 else 
                 colors.green)
                for i in range(len(host_data)-1)
            ]
        ]))
        
        elements.append(host_table)
        elements.append(Spacer(1, 0.25 * inch))
    
    # Recommendations
    elements.append(Paragraph("General Recommendations", subtitle_style))
    elements.append(Spacer(1, 0.1 * inch))
    
    recommendations = """
    1. Address high-risk threats immediately by isolating affected systems.
    2. Investigate medium-risk threats to determine if they pose a genuine security risk.
    3. Monitor low-risk threats for any changes in behavior.
    4. Ensure all systems are updated with the latest security patches.
    5. Implement network segmentation to limit the spread of potential threats.
    6. Regularly back up critical data to protect against ransomware attacks.
    7. Consider implementing additional security controls such as intrusion detection systems.
    8. Conduct regular security awareness training for all users.
    """
    
    elements.append(Paragraph(recommendations, normal_style))
    
    # Footer
    elements.append(Spacer(1, 0.5 * inch))
    footer_text = f"Report generated by AI-Antivirus on {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}"
    elements.append(Paragraph(footer_text, normal_style))
    
    # Build PDF
    doc.build(elements)
    
    return pdf_path
