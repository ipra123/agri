import test from "node:test";
import assert from "node:assert/strict";

// 1. Math check helper function (simulates the logic inside createOrder)
function calculatePaymentPlan(totalAmount, plan) {
  const parsedTotal = parseFloat(totalAmount);
  if (isNaN(parsedTotal)) throw new Error("Invalid total amount");

  if (plan === "DEPOSIT") {
    const depositAmount = parseFloat((parsedTotal * 0.2).toFixed(2));
    const balanceAmount = parseFloat((parsedTotal * 0.8).toFixed(2));
    return {
      depositAmount,
      balanceAmount,
      sum: parseFloat((depositAmount + balanceAmount).toFixed(2))
    };
  } else {
    return {
      depositAmount: null,
      balanceAmount: null,
      sum: parsedTotal
    };
  }
}

// 2. Role guard simulation helper
function checkRoleAuthorized(role) {
  return role === "ADMIN" || role === "SUPPLIER" || role === "FARMER";
}

// 3. Idempotency check simulation helper
function checkPaymentIdempotency(payments, checkType) {
  const existingApproved = payments.find(
    (p) => p.type === checkType && p.status === "APPROVED"
  );
  if (existingApproved) {
    return { shouldProcess: false, existingApproved };
  }
  return { shouldProcess: true };
}

test("1. Deposit Calculation & Sum Verification", () => {
  const total = 250.00;
  const result = calculatePaymentPlan(total, "DEPOSIT");
  
  assert.equal(result.depositAmount, 50.00, "Deposit should be 20% of 250 (which is 50)");
  assert.equal(result.balanceAmount, 200.00, "Balance should be 80% of 250 (which is 200)");
  assert.equal(result.sum, total, "Sum of deposit and balance must equal the total amount");
});

test("2. Floating Point Precision Test", () => {
  const total = 99.99;
  const result = calculatePaymentPlan(total, "DEPOSIT");
  
  assert.equal(result.depositAmount, 20.00, "Deposit 20% of 99.99 is 19.998, rounded to 2 decimals is 20.00");
  assert.equal(result.balanceAmount, 79.99, "Balance 80% of 99.99 is 79.992, rounded to 2 decimals is 79.99");
  assert.equal(result.sum, total, "Sum of deposit (20.00) and balance (79.99) equals total (99.99)");
});

test("3. Role Guard Check", () => {
  assert.equal(checkRoleAuthorized("ADMIN"), true, "ADMIN role should be authorized");
  assert.equal(checkRoleAuthorized("SUPPLIER"), true, "SUPPLIER role should be authorized");
  assert.equal(checkRoleAuthorized("FARMER"), true, "FARMER role should be authorized");
});

test("4. Idempotency Check", () => {
  const mockPayments = [
    { type: "DEPOSIT", status: "APPROVED", amount: 50 },
    { type: "BALANCE", status: "FAILED", amount: 200 }
  ];

  const depositCheck = checkPaymentIdempotency(mockPayments, "DEPOSIT");
  assert.equal(depositCheck.shouldProcess, false, "Should not process deposit again because approved deposit exists");
  assert.ok(depositCheck.existingApproved, "Should return the existing approved deposit payment");

  const balanceCheck = checkPaymentIdempotency(mockPayments, "BALANCE");
  assert.equal(balanceCheck.shouldProcess, true, "Should process balance because no approved balance payment exists yet");
});
