const expressionElement = document.querySelector("[data-expression]");
const resultElement = document.querySelector("[data-result]");

const state = {
  current: "0",
  previous: null,
  operator: null,
  overwrite: false,
};

const operatorLabels = {
  "+": "+",
  "-": "-",
  "*": "×",
  "/": "÷",
};

function formatNumber(value) {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return "Error";
  }

  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 8,
  }).format(number);
}

function updateDisplay() {
  resultElement.textContent = formatNumber(state.current);

  if (state.operator && state.previous !== null) {
    expressionElement.textContent = `${formatNumber(state.previous)} ${operatorLabels[state.operator]} ${state.overwrite ? "" : formatNumber(state.current)}`.trim();
    return;
  }

  expressionElement.textContent = state.current === "0" ? "0" : formatNumber(state.current);
}

function compute() {
  const previous = Number(state.previous);
  const current = Number(state.current);

  if (!Number.isFinite(previous) || !Number.isFinite(current)) {
    return "Error";
  }

  switch (state.operator) {
    case "+":
      return previous + current;
    case "-":
      return previous - current;
    case "*":
      return previous * current;
    case "/":
      return current === 0 ? "Error" : previous / current;
    default:
      return current;
  }
}

function inputDigit(value) {
  if (state.current === "Error") {
    state.current = "0";
  }

  if (state.overwrite) {
    state.current = value;
    state.overwrite = false;
    updateDisplay();
    return;
  }

  if (state.current === "0") {
    state.current = value;
  } else {
    state.current += value;
  }

  updateDisplay();
}

function inputDecimal() {
  if (state.current === "Error") {
    state.current = "0";
  }

  if (state.overwrite) {
    state.current = "0.";
    state.overwrite = false;
    updateDisplay();
    return;
  }

  if (!state.current.includes(".")) {
    state.current += ".";
    updateDisplay();
  }
}

function chooseOperator(nextOperator) {
  if (state.current === "Error") {
    clearAll();
    return;
  }

  if (state.operator && !state.overwrite) {
    const value = compute();

    if (value === "Error") {
      state.current = "Error";
      state.previous = null;
      state.operator = null;
      state.overwrite = true;
      updateDisplay();
      return;
    }

    state.current = String(value);
    state.previous = String(value);
  } else {
    state.previous = state.current;
  }

  state.operator = nextOperator;
  state.overwrite = true;
  updateDisplay();
}

function clearAll() {
  state.current = "0";
  state.previous = null;
  state.operator = null;
  state.overwrite = false;
  updateDisplay();
}

function toggleSign() {
  if (state.current === "0" || state.current === "Error") {
    return;
  }

  state.current = String(Number(state.current) * -1);
  updateDisplay();
}

function convertPercent() {
  if (state.current === "Error") {
    return;
  }

  state.current = String(Number(state.current) / 100);
  updateDisplay();
}

function runEquals() {
  if (!state.operator || state.previous === null) {
    return;
  }

  const expression = `${formatNumber(state.previous)} ${operatorLabels[state.operator]} ${formatNumber(state.current)}`;
  const value = compute();

  expressionElement.textContent = expression;
  state.current = String(value);
  state.previous = null;
  state.operator = null;
  state.overwrite = true;
  updateDisplay();
  expressionElement.textContent = expression;
}

function pressKey(button) {
  button.classList.add("is-pressed");
  window.setTimeout(() => button.classList.remove("is-pressed"), 120);
}

document.addEventListener("click", (event) => {
  const button = event.target.closest(".key");

  if (!button) {
    return;
  }

  pressKey(button);

  const { action, value } = button.dataset;

  switch (action) {
    case "digit":
      inputDigit(value);
      break;
    case "decimal":
      inputDecimal();
      break;
    case "operator":
      chooseOperator(value);
      break;
    case "clear":
      clearAll();
      break;
    case "toggle-sign":
      toggleSign();
      break;
    case "percent":
      convertPercent();
      break;
    case "equals":
      runEquals();
      break;
    default:
      break;
  }
});

document.addEventListener("keydown", (event) => {
  const keyMap = {
    Enter: { action: "equals" },
    "=": { action: "equals" },
    Escape: { action: "clear" },
    Backspace: { action: "clear" },
    ".": { action: "decimal" },
    ",": { action: "decimal" },
    "+": { action: "operator", value: "+" },
    "-": { action: "operator", value: "-" },
    "*": { action: "operator", value: "*" },
    "/": { action: "operator", value: "/" },
    "%": { action: "percent" },
  };

  const digitPressed = /^\d$/.test(event.key);
  const mapped = keyMap[event.key];

  if (!digitPressed && !mapped) {
    return;
  }

  event.preventDefault();

  if (digitPressed) {
    inputDigit(event.key);
    return;
  }

  switch (mapped.action) {
    case "decimal":
      inputDecimal();
      break;
    case "operator":
      chooseOperator(mapped.value);
      break;
    case "clear":
      clearAll();
      break;
    case "percent":
      convertPercent();
      break;
    case "equals":
      runEquals();
      break;
    default:
      break;
  }
});

updateDisplay();
