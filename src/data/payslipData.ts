import { PayslipRecord, Employee } from '../types/index.ts';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export const generateHistoricalPayslips = (emp: Employee): PayslipRecord[] => {
  const currentSalary = emp.monthlySalary || 36619;
  const pera = 2000;
  const payslips: PayslipRecord[] = [];

  // 2026 (Active Year: Jan & Feb)
  const yearsConfig = [
    { year: 2026, months: [1, 2], salaryFactor: 1.0 },
    { year: 2025, months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], salaryFactor: 0.96 },
    { year: 2024, months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], salaryFactor: 0.92 }
  ];

  yearsConfig.forEach(({ year, months, salaryFactor }) => {
    months.forEach(month => {
      const basicSalary = Math.round(currentSalary * salaryFactor);
      const grossPay = basicSalary + pera;
      
      const gsis = Math.round(basicSalary * 0.09);
      const philHealth = Math.round(basicSalary * 0.025);
      const pagIbig = 100;
      const wTax = Math.round(basicSalary * 0.05);

      // Add a realistic loan deduction for variety
      const hasGsisLoan = month % 2 === 0;
      const gsisLoan = hasGsisLoan ? 1250 : 0;
      const pagIbigLoan = 500;

      const totalDeductions = gsis + philHealth + pagIbig + wTax + gsisLoan + pagIbigLoan;
      const netTakeHomePay = grossPay - totalDeductions;

      const monthName = MONTH_NAMES[month - 1];
      const daysInMonth = new Date(year, month, 0).getDate();

      payslips.push({
        id: `PS-${year}-${String(month).padStart(2, '0')}-${emp.id}`,
        employeeId: emp.id,
        employeeNumber: emp.employeeNumber,
        employeeName: `${emp.firstName} ${emp.lastName}`,
        officeName: emp.officeName,
        position: emp.position,
        classification: emp.classification,
        salaryGrade: emp.salaryGrade || 'SG 15',
        stepIncrement: year === 2026 ? (emp.stepIncrement || 'Step 2') : 'Step 1',
        year,
        month,
        monthName,
        periodLabel: `${monthName} 1 - ${daysInMonth}, ${year}`,
        payDate: `${monthName} ${daysInMonth}, ${year}`,
        basicSalary,
        pera,
        grossPay,
        gsisLifeAndRetirement: gsis,
        philHealth,
        pagIbig,
        withholdingTax: wTax,
        gsisLoan: gsisLoan > 0 ? gsisLoan : undefined,
        pagIbigLoan,
        totalDeductions,
        netTakeHomePay,
        bankName: 'Land Bank of the Philippines – San Jose Branch',
        accountNumberMasked: '0421-****-88',
        payrollRefNumber: `LGU-SJ-PR-${year}-${String(month).padStart(2, '0')}-${emp.employeeNumber.replace(/\D/g, '').slice(-4) || '0142'}`,
        disbursedAt: `${year}-${String(month).padStart(2, '0')}-${daysInMonth}T17:00:00.000Z`,
        certifiedBy: 'Grace Balmes, Municipal Payroll Officer',
        notedBy: 'Atty. Maria Elena Castillo, MHRMO Head'
      });
    });
  });

  return payslips;
};
