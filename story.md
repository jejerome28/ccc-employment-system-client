# The CCC Employment System Story

## The problem

Running a company's day-to-day HR operations by spreadsheet or paper doesn't
scale: tracking who's employed, who's on leave, who worked which shift, and
what everyone is owed at payroll time becomes error-prone and slow to answer
even simple questions like "how many people are active right now" or "who's
on leave this week."

## What this is

This repository is the **web client** for CCC's employment system — the
dashboard HR staff and managers use to manage the employee lifecycle:
records, attendance, leave, and payroll-adjacent data.

## What the solution does (expected, fill in as features land)

- **Employees** — records for every employee: personal info, employment
  status, role/department.
- **Attendance** — time in/out tracking, shift assignment.
- **Leave** — requests, approvals, balances.
- **Payroll inputs** — the data payroll processing depends on (hours,
  leave taken, adjustments), even if payroll computation itself lives
  elsewhere.

This section is a placeholder — replace each bullet with what's actually
built as features ship, the way the reference Digipay dashboard's story.md
describes its real, shipped Store/Wallet/Transactions features.

## Backend

Talks to the `ccc-employment-system-backend` Laravel API (MySQL) over HTTP;
this client holds no data of its own.
