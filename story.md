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

## What the solution does

- **Employees (shipped)** — list with search/status filter, add, edit, delete
  (removes their attendance), detail page with monthly time records and totals.
- **Attendance (shipped)** — dashboard time clock (time in / time out per
  employee, live stats), daily time records with totals, manual entry and
  correction, overnight shifts.
- **Leave, payroll inputs** — not built yet.

## Backend

Talks to the `ccc-employment-system-backend` Laravel API (MySQL) over HTTP;
this client holds no data of its own.
