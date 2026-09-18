import openpyxl
from openpyxl.styles import Font, Alignment, PatternFill, Border, Side
from pathlib import Path
from datetime import datetime
from app.config import DELIVERABLES_DIR

def create_analytics_spreadsheet(
    report_title: str,
    headers: list,
    rows: list,
    summary_metrics: dict = None,
    filename_prefix: str = "Telemetry_Analysis"
) -> str:
    """
    Generates a professionally formatted Excel spreadsheet with header styling,
    zebra borders, and summary formulas.
    """
    wb = openpyxl.Workbook()
    ws = wb.active
    ws.title = "Analytics Data"
    ws.views.sheetView[0].showGridLines = True

    # Colors
    navy_fill = PatternFill(start_color="0F2C59", end_color="0F2C59", fill_type="solid")
    gold_fill = PatternFill(start_color="F8F9FA", end_color="F8F9FA", fill_type="solid")
    white_font_bold = Font(name="Calibri", size=11, bold=True, color="FFFFFF")
    title_font = Font(name="Calibri", size=14, bold=True, color="0F2C59")
    regular_font = Font(name="Calibri", size=10)
    bold_font = Font(name="Calibri", size=10, bold=True)

    thin_border = Border(
        left=Side(style="thin", color="CCCCCC"),
        right=Side(style="thin", color="CCCCCC"),
        top=Side(style="thin", color="CCCCCC"),
        bottom=Side(style="thin", color="CCCCCC")
    )

    # Title Block
    ws.merge_cells("A1:E1")
    ws["A1"] = report_title.upper()
    ws["A1"].font = title_font
    ws["A1"].alignment = Alignment(horizontal="left", vertical="center")
    ws.row_dimensions[1].height = 25

    ws["A2"] = f"Generated: {datetime.now().strftime('%d-%b-%Y %H:%M')} | Sovereign Air-Gapped Analytics Engine"
    ws["A2"].font = Font(name="Calibri", size=9, italic=True, color="666666")

    # Table Headers (Row 4)
    start_row = 4
    for col_idx, header_text in enumerate(headers, start=1):
        cell = ws.cell(row=start_row, column=col_idx, value=header_text)
        cell.fill = navy_fill
        cell.font = white_font_bold
        cell.alignment = Alignment(horizontal="center", vertical="center")
        cell.border = thin_border
    ws.row_dimensions[start_row].height = 22

    # Data Rows
    current_row = start_row + 1
    for r_idx, row_data in enumerate(rows):
        for c_idx, val in enumerate(row_data, start=1):
            cell = ws.cell(row=current_row, column=c_idx, value=val)
            cell.font = regular_font
            cell.border = thin_border
            if r_idx % 2 == 1:
                cell.fill = gold_fill
            if isinstance(val, (int, float)):
                cell.alignment = Alignment(horizontal="right")
            else:
                cell.alignment = Alignment(horizontal="left")
        current_row += 1

    # Summary Block (if provided)
    if summary_metrics:
        current_row += 1
        ws.cell(row=current_row, column=1, value="SUMMARY KPI METRICS").font = bold_font
        current_row += 1
        for k, v in summary_metrics.items():
            ws.cell(row=current_row, column=1, value=k).font = regular_font
            ws.cell(row=current_row, column=2, value=v).font = bold_font
            current_row += 1

    # Auto-adjust column widths
    for col in ws.columns:
        max_len = max(len(str(cell.value or '')) for cell in col)
        col_letter = openpyxl.utils.get_column_letter(col[0].column)
        ws.column_dimensions[col_letter].width = max(max_len + 4, 12)

    timestamp_str = datetime.now().strftime('%Y%m%d_%H%M%S')
    filename = f"{filename_prefix}_{timestamp_str}.xlsx"
    filepath = DELIVERABLES_DIR / filename
    wb.save(str(filepath))
    return filename

def modify_and_highlight_excel(
    source_filepath: Path,
    anomaly_column: str,
    threshold_value: float,
    condition: str = "GREATER_THAN",
    output_prefix: str = "Audited_Highlighted"
) -> str:
    """
    Reads an existing workbook, identifies numerical anomalies based on threshold,
    highlights offending cells in red, and saves as a newly audited copy.
    """
    wb = openpyxl.load_workbook(str(source_filepath))
    ws = wb.active

    # Red warning fill
    red_fill = PatternFill(start_color="FEE2E2", end_color="FEE2E2", fill_type="solid")
    red_font = Font(name="Calibri", size=10, bold=True, color="991B1B")

    # Find target column index
    target_col_idx = None
    for col in range(1, ws.max_column + 1):
        cell_val = str(ws.cell(row=1, column=col).value or "").strip()
        if anomaly_column.lower() in cell_val.lower():
            target_col_idx = col
            break

    anomalies_flagged = 0
    if target_col_idx:
        for row in range(2, ws.max_row + 1):
            cell = ws.cell(row=row, column=target_col_idx)
            try:
                val = float(cell.value)
                is_anomaly = False
                if condition == "GREATER_THAN" and val > threshold_value:
                    is_anomaly = True
                elif condition == "LESS_THAN" and val < threshold_value:
                    is_anomaly = True
                
                if is_anomaly:
                    cell.fill = red_fill
                    cell.font = red_font
                    anomalies_flagged += 1
            except (ValueError, TypeError):
                pass

    timestamp_str = datetime.now().strftime('%Y%m%d_%H%M%S')
    filename = f"{output_prefix}_{source_filepath.stem}_{timestamp_str}.xlsx"
    filepath = DELIVERABLES_DIR / filename
    wb.save(str(filepath))
    return filename

