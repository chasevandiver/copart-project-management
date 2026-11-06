"""Dump every sheet of an Excel leaderboard to plain text so Claude Code can read it.
Usage: python read_excel.py inbox/leaderboard.xlsx
Needs openpyxl (pip install openpyxl)."""
import sys
try:
    import openpyxl
except ImportError:
    sys.exit("openpyxl is missing. Run: pip install openpyxl")
path = sys.argv[1]
wb = openpyxl.load_workbook(path, data_only=True, read_only=True)
for ws in wb.worksheets:
    print(f"\n=== SHEET: {ws.title} ({ws.max_row} rows x {ws.max_column} cols) ===")
    for row in ws.iter_rows(values_only=True):
        if row is None or all(v is None for v in row):
            continue
        print(" | ".join("" if v is None else str(v) for v in row))
